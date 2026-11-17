#!/usr/bin/env python3
"""Plan incremental Sites imports, preserve stable module IDs, and record verification."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
import argparse
import collections
import hashlib
import json
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', '.openai', 'node_modules', '.next', '.wrangler', '.venv', 'venv',
           '__pycache__', 'test-results', 'playwright-report', 'browser-profile',
           '.ssh', '.aws', '.npmrc', '.pypirc', '.DS_Store'}
MEDIA = {'.png','.jpg','.jpeg','.webp','.gif','.avif','.mp4','.webm','.mp3','.wav',
         '.ogg','.m4a','.pdf','.glb','.gltf','.ply','.splat','.onnx','.zip','.bin',
         '.woff','.woff2','.ttf','.otf','.pyd','.dll','.exe','.npy','.npz'}
SECRET = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?<![A-Za-z0-9_])(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-proj-[A-Za-z0-9_-]{30,})(?![A-Za-z0-9_])')

def read(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)

def plan(root, inventory):
    modules = read(root/'modules.json', [])
    tracked = {m['source_project']: m for m in modules if m.get('source_project')}
    state = read(root/'sync/state.json', {})
    known = state.get('known_sites', {})
    pending = state.get('pending_verification', {})
    config = read(root/'sync/config.json', {})
    result = []
    for site in inventory:
        pid = site['id']
        version = site.get('version', site.get('latest_version_number', 0))
        url = site.get('url', site.get('current_live_url'))
        if site.get('status', 'active') != 'active' or not url or version < 1:
            continue
        if pid in config.get('excluded_projects', {}):
            continue
        deferred = state.get('deferred', {}).get(pid)
        if deferred and deferred['version'] == version and datetime.fromisoformat(deferred['retry_after']) > datetime.now(timezone.utc):
            continue
        module = tracked.get(pid)
        previous = module.get('source_version', 0) if module else known.get(pid, {}).get('version', 0)
        if pid == config.get('catalogue_project'):
            if version != previous:
                result.append({'action':'catalogue','project':pid,'version':version})
        elif version != previous or pid not in known and not module:
            result.append({'action':'update' if module else 'new', 'project':pid,
                           'version':version, 'module':module['id'] if module else None})
        elif pid in pending:
            result.append({'action':'verify','project':pid,'version':version,'module':pending[pid]['module']})
    return result

def copy_tree(source, destination, asset_stage, asset_index, web=False):
    mapping = {}
    destination.mkdir(parents=True)
    for file in sorted(source.rglob('*')):
        rel = file.relative_to(source)
        if any(part in EXCLUDE for part in rel.parts) or file.is_symlink() or not file.is_file():
            continue
        if file.name.startswith('.env') and file.name not in {'.env.example','.env.sample','.env.template'}:
            continue
        if file.name.endswith(('.log','.tsbuildinfo')) or file.name == 'migration-assets.json' or web and file.name == '.gitignore':
            continue
        if file.stat().st_size >= 100 * 1024 * 1024:
            raise ValueError(f'Use Release assets or split parts for files at least 100 MiB: {rel}')
        data = file.read_bytes()
        if SECRET.search(data):
            raise ValueError(f'Potential credential in {rel}; import stopped without publishing it')
        if len(data) >= 65536 and file.suffix.lower() in MEDIA:
            digest = hashlib.sha256(data).hexdigest()
            name = digest + file.suffix.lower()
            (asset_stage/name).write_bytes(data)
            asset_index[name] = {'bytes':len(data),'sha256':digest}
            mapping[rel.as_posix()] = 'assets/' + name
        else:
            target = destination/rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    save(destination/'migration-assets.json', mapping)
    return mapping

def import_site(root, metadata, source, web=None, entry='index.html', category='其他', source_only=False):
    pid = metadata['id']
    if not isinstance(pid, str) or not pid:
        raise ValueError('Use the exact project ID returned by Sites')
    if not metadata.get('title') or not metadata.get('url','').startswith(('https://','http://')) or not isinstance(metadata.get('version'),int) or metadata['version'] < 1:
        raise ValueError('Metadata requires the title, live URL and saved version number')
    if (source/'.github-sync-ignore').exists():
        raise ValueError('Source has opted out with .github-sync-ignore')
    modules = read(root/'modules.json', [])
    previous = next((m for m in modules if m.get('source_project') == pid), None)
    state = read(root/'sync/state.json', {})
    baseline = state.get('verified', {}).get(pid, {}).get('deployment_commit') or state.get('repository_baseline_commit')
    if previous and baseline and (root/'.git').exists():
        paths = [previous['source'],previous.get('web',previous['source'])]
        changes = subprocess.run(['git','-C',str(root),'diff','--quiet',baseline,'--',*paths])
        untracked = subprocess.check_output(['git','-C',str(root),'ls-files','--others','--exclude-standard','--',*paths])
        if changes.returncode or untracked.strip():
            raise ValueError('Module changed since its last verified sync; review and preserve repository edits before importing')
    if previous and previous.get('kind') == 'web' and web is None:
        raise ValueError('Keep the existing working web version until its replacement is ready')
    if web is None and not source_only:
        raise ValueError('Provide a verified static build, or explicitly classify a new server-only source')
    if web is not None:
        if not (web/entry).resolve().is_relative_to(web.resolve()) or not (web/entry).is_file():
            raise ValueError('Missing or unsafe web entry')
    commit = subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'], text=True).strip()
    if subprocess.run(['git','-C',str(source),'diff','--quiet','HEAD','--']).returncode:
        raise ValueError('Use a clean source snapshot and keep deployment adaptations in a separate directory')
    if metadata.get('source_commit') and metadata['source_commit'] != commit:
        raise ValueError('Source checkout does not match the selected saved version')
    mid = previous['id'] if previous else f"m{max([int(m['id'][1:]) for m in modules] or [0])+1:03d}"
    index = read(root/'assets/index.json', {})
    (root/'sync').mkdir(exist_ok=True)
    # Inspect and stage every file before replacing an existing module.
    with tempfile.TemporaryDirectory(prefix='.stage-', dir=root/'sync') as temp:
        stage = Path(temp)
        (stage/'assets').mkdir()
        source_map = copy_tree(source, stage/'source', stage/'assets', index)
        if web is not None:
            copy_tree(web, stage/'web', stage/'assets', index, web=True)
        for file in (stage/'assets').iterdir():
            target = root/'assets'/file.name
            if not target.exists():
                target.parent.mkdir(exist_ok=True)
                shutil.copy2(file, target)
        for folder, prepared in [('sources','source'),('web','web')]:
            if not (stage/prepared).exists():
                continue
            target = root/folder/mid
            target.parent.mkdir(exist_ok=True)
            if target.exists():
                target.rename(stage/('previous-'+folder))
            (stage/prepared).rename(target)
    item = dict(previous or {})
    item.update(id=mid, name=metadata['title'], description=metadata.get('description') or item.get('description',''),
                category=previous.get('category',category) if previous else category,
                original_url=metadata['url'], original_status=metadata.get('original_status','原站已保存发布版本；按同步检查范围验证'),
                source='sources/'+mid, source_project=pid, source_version=metadata['version'], source_commit=commit,
                kind='web' if web else 'server', migration='web' if web else 'source')
    if web:
        item.update(web='web/'+mid, entry=entry)
        item.pop('migration_note', None)
    else:
        item['migration_note']='源码已同步；此项目需要独立后端，GitHub Pages 不执行服务器或云数据库服务。'
    if previous:
        modules[modules.index(previous)] = item
    else:
        modules.append(item)
    save(root/'assets/index.json', index)
    save(root/'modules.json', modules)
    state = read(root/'sync/state.json', {})
    state.setdefault('known_sites', {})[pid] = {'version':metadata['version']}
    state.setdefault('pending_verification', {})[pid] = {'module':mid,'version':metadata['version']}
    save(root/'sync/state.json', state)
    registry = read(root/'sync/module-ids.json', [])
    save(root/'sync/module-ids.json', sorted(set(registry) | {m['id'] for m in modules}))
    ignore = root/'.gitignore'
    current = ignore.read_text() if ignore.exists() else ''
    additions = [f'/sources/{mid}/{rel}' for rel in source_map if f'/sources/{mid}/{rel}' not in current.splitlines()]
    if additions:
        ignore.write_text(current.rstrip()+'\n'+'\n'.join(additions)+'\n')
    render_catalogue(root)
    return item

def render_catalogue(root):
    modules = read(root/'modules.json', [])
    count = collections.Counter(m['kind'] for m in modules)
    packages = count['extension'] + count['desktop']
    summary = f"统一收录 {len(modules)} 项网页工具、三维作品、教学应用及本地程序。已取回 {len(modules)-count['missing']} 项源码或程序包：{count['web']} 项提供网页入口，{count['server']} 项依赖后端，{packages} 项提供本地安装包；{count['missing']} 项仍待取得原文件。详见迁移清单。"
    readme = root/'README.md'
    if readme.exists():
        text = re.sub(r'统一收录 \d+ 项[^\n]+', lambda _: summary, readme.read_text(), count=1)
        readme.write_text(text)
    document = root/'docs/MIGRATION.md'
    old = document.read_text() if document.exists() else ''
    suffix = '\n## 版本依据\n' + old.split('\n## 版本依据\n',1)[1] if '\n## 版本依据\n' in old else ''
    lines = ['# 迁移清单','',summary,'', '迁移不包含原站数据库、用户上传附件及浏览器个人数据。需要后端的模块保留原站入口。','',
             '| 编号 | 工具 | 状态 | 来源 / 原入口 |','|---|---|---|---|']
    labels = {'web':'网页已迁移','server':'源码已迁移 · 需要后端','extension':'程序包已迁移','desktop':'程序包已迁移','missing':'待提供原包'}
    for m in modules:
        link = f"[源码](../{m['source']}/)" if m.get('source') else f"[原交付]({m['original_url']})"
        name = m['name'].replace('|','\\|').replace('\n',' ')
        lines.append(f"| {m['id']} | {name} | {labels[m['kind']]} | {link} |")
    lines += ['','## 尚缺原包的项目','']
    lines += [f"- **{m['id']} · {m['name']}**：{m.get('migration_note','待取得原文件。')}" for m in modules if m['kind']=='missing']
    document.parent.mkdir(exist_ok=True)
    document.write_text('\n'.join(lines)+'\n'+suffix)

def confirm(root, project, deployment_commit, url):
    if not re.fullmatch(r'[0-9a-f]{40}', deployment_commit) or not url.startswith('https://'):
        raise ValueError('Record the verified full deployment SHA and HTTPS URL')
    state = read(root/'sync/state.json', {})
    pending = state.get('pending_verification', {}).pop(project)
    state.setdefault('verified', {})[project] = {**pending,'deployment_commit':deployment_commit,'url':url,
                                                'verified_at':datetime.now(timezone.utc).isoformat()}
    state.get('deferred', {}).pop(project, None)
    save(root/'sync/state.json', state)

def defer(root, project, version, reason):
    if SECRET.search(reason.encode()):
        raise ValueError('Do not put credentials in a failure reason')
    state = read(root/'sync/state.json', {})
    previous = state.get('deferred', {}).get(project, {})
    notify = previous.get('version') != version or previous.get('reason') != reason
    state.setdefault('deferred', {})[project] = {'version':version,'reason':reason,
        'retry_after':(datetime.now(timezone.utc)+timedelta(hours=24)).isoformat()}
    save(root/'sync/state.json', state)
    return {'notify':notify,'retry_after':state['deferred'][project]['retry_after']}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='command',required=True)
    p=sub.add_parser('plan');p.add_argument('--inventory',required=True,type=Path)
    p=sub.add_parser('import');p.add_argument('--metadata',required=True,type=Path);p.add_argument('--source',required=True,type=Path)
    p.add_argument('--web',type=Path);p.add_argument('--entry',default='index.html');p.add_argument('--category',default='其他');p.add_argument('--source-only',action='store_true')
    p=sub.add_parser('confirm');p.add_argument('--project',required=True);p.add_argument('--deployment-commit',required=True);p.add_argument('--url',required=True)
    p=sub.add_parser('defer');p.add_argument('--project',required=True);p.add_argument('--version',required=True,type=int);p.add_argument('--reason',required=True)
    sub.add_parser('catalogue')
    args=parser.parse_args()
    if args.command=='plan': print(json.dumps(plan(ROOT,read(args.inventory)),ensure_ascii=False,indent=2))
    elif args.command=='import': print(json.dumps(import_site(ROOT,read(args.metadata),args.source,args.web,args.entry,args.category,args.source_only),ensure_ascii=False,indent=2))
    elif args.command=='confirm': confirm(ROOT,args.project,args.deployment_commit,args.url)
    elif args.command=='defer': print(json.dumps(defer(ROOT,args.project,args.version,args.reason),ensure_ascii=False))
    else: render_catalogue(ROOT)

if __name__=='__main__': main()
