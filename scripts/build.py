#!/usr/bin/env python3
"""Build the complete, versioned GitHub Pages artifact without network access."""
from pathlib import Path
import json,shutil,urllib.parse,posixpath,re,html,collections

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'
PREFIX='/yunjin-tools/'
RAW='https://raw.githubusercontent.com/yunjinzh/yunjin-tools/main/'
TEXT={'.html','.htm','.js','.mjs','.css','.json','.webmanifest','.svg','.txt','.xml'}
KEEP={'.glb','.gltf','.onnx','.woff','.woff2','.ttf','.otf','.pdf'}
modules=json.loads((ROOT/'modules.json').read_text())
if OUT.exists():shutil.rmtree(OUT)
OUT.mkdir()
(OUT/'.nojekyll').touch()
shutil.copy2(ROOT/'scripts/runtime.js',OUT/'runtime.js')

def site_copy(key):
    source=ROOT/'web'/key; dest=OUT/'apps'/key;dest.mkdir(parents=True)
    mapping=json.loads((source/'migration-assets.json').read_text())
    files={str(p.relative_to(source)) for p in source.rglob('*') if p.is_file() and p.name!='migration-assets.json'}
    remote={}
    for rel,asset in mapping.items():
        if Path(rel).suffix.lower() in KEEP or (Path(rel).suffix=='.bin' and 'download' not in rel):
            target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/asset,target);files.add(rel)
        else:remote[rel]=RAW+asset
    base=PREFIX+'apps/'+key+'/'
    origins=sorted({urllib.parse.urlparse(m['original_url']).scheme+'://'+urllib.parse.urlparse(m['original_url']).netloc for m in modules if m.get('web')=='web/'+key and urllib.parse.urlparse(m['original_url']).netloc})
    def resolve(value,parent):
        if not value or value.startswith(('#','data:','blob:','javascript:','mailto:')):return value
        original=value
        value=html.unescape(value); parsed=urllib.parse.urlparse(value)
        if parsed.netloc:
            if parsed.scheme+'://'+parsed.netloc not in origins:return original
            rel=urllib.parse.unquote(parsed.path).lstrip('/')
        else:rel=posixpath.normpath(posixpath.join(parent,urllib.parse.unquote(parsed.path))) if not parsed.path.startswith('/') else urllib.parse.unquote(parsed.path).lstrip('/')
        if parsed.path.endswith('/') and not rel.endswith('/'):rel+='/'
        suffix=('?'+parsed.query if parsed.query else '')+('#'+parsed.fragment if parsed.fragment else '')
        if rel in remote:return remote[rel]+suffix
        if rel in files or rel.rstrip('/')+'/index.html' in files:return base+urllib.parse.quote(rel,safe='/@-_.')+suffix
        return original
    for p in source.rglob('*'):
        if not p.is_file() or p.name=='migration-assets.json':continue
        rel=p.relative_to(source);target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True)
        if p.suffix.lower() not in TEXT:shutil.copy2(p,target);continue
        text=p.read_text(encoding='utf-8',errors='strict');parent=rel.parent.as_posix()
        # Resolve literal resource URLs and paths without changing ordinary code strings.
        def literal(match):
            quote,value=match.group(1),match.group(2)
            if '\\' in value or len(value)>700 or '${' in value:return match.group(0)
            return quote+resolve(value,parent)+quote
        text=re.sub(r'''(["'])([^"'\n]{1,700})\1''',literal,text)
        if p.suffix.lower()=='.css':text=re.sub(r'url\(([^)\n]+)\)',lambda m:'url('+resolve(m.group(1).strip('"\x27'),parent)+')',text)
        if p.suffix.lower() in {'.html','.htm'}:
            inject=f'<script src="{base}migration-config.js"></script><script src="{PREFIX}runtime.js"></script>'
            text=re.sub(r'(<head\b[^>]*>)',lambda m:m.group(1)+inject,text,count=1,flags=re.I)
        target.write_text(text)
    config={'id':key,'base':base,'origins':origins,'assets':remote,'files':sorted(files)}
    (dest/'migration-config.js').write_text('window.__YUNJIN_TOOL__='+json.dumps(config,ensure_ascii=False,separators=(',',':'))+';')

for key in sorted({m['web'].split('/')[-1] for m in modules if m['kind']=='web'}):site_copy(key)
for m in modules:
    download=m.get('download','')
    if download and not download.startswith('https://'):
        p=ROOT/download
        shutil.copy2(p,OUT/p.name)
if (ROOT/'portal').exists():shutil.copytree(ROOT/'portal',OUT/'portal',dirs_exist_ok=True)
public=[]
for m in modules:
    item=dict(m)
    if m['kind']=='web':item['url']='apps/'+m['web'].split('/')[-1]+'/'+urllib.parse.quote(m['entry'],safe='/')
    else:item['url']='details/'+m['id']+'.html'
    public.append(item)
    if m['kind']!='web':
        dest=OUT/'details';dest.mkdir(exist_ok=True)
        actions=[]
        if m.get('download'):
            download=m['download'] if m['download'].startswith('https://') else PREFIX+Path(m['download']).name
            actions.append(f'<a class="primary" href="{html.escape(download)}">下载完整程序</a>')
        if m.get('source'):actions.append(f'<a href="https://github.com/yunjinzh/yunjin-tools/tree/main/{m["source"]}">查看源码与运行说明 ↗</a>')
        if m['original_url'].startswith('http'):actions.append(f'<a href="{html.escape(m["original_url"])}" target="_blank" rel="noopener noreferrer">打开原入口 ↗</a>')
        body=f'<main class="detail"><a class="back" href="{PREFIX}">← 云金工具集</a><p class="eyebrow">{html.escape(m["category"])}</p><h1>{html.escape(m["name"])}</h1><p class="intro">{html.escape(m["description"])}</p><p class="notice">{html.escape(m.get("migration_note",""))}</p><div class="actions">{"".join(actions)}</div><details><summary>原版本说明</summary><p>{html.escape(m["original_status"])}</p></details></main>'
        (dest/(m['id']+'.html')).write_text(f'<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(m["name"])}</title><link rel="stylesheet" href="{PREFIX}portal/style.css"></head><body>{body}</body></html>')
(OUT/'modules.json').write_text(json.dumps(public,ensure_ascii=False))
shutil.copy2(ROOT/'portal/index.html',OUT/'index.html')
report={'catalogue':len(modules),'kinds':dict(collections.Counter(x['kind'] for x in modules)),'files':sum(1 for x in OUT.rglob('*') if x.is_file()),'bytes':sum(x.stat().st_size for x in OUT.rglob('*') if x.is_file())}
(ROOT/'docs/build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False))
assert report['bytes']<950*1024*1024,'Published site exceeds the GitHub Pages size budget'
