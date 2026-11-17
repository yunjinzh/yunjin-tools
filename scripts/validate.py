#!/usr/bin/env python3
"""Verify catalogue coverage, actual entries, checksums and deployment limits."""
from pathlib import Path
import json,hashlib,urllib.parse,sys
ROOT=Path(__file__).resolve().parents[1]
modules=json.loads((ROOT/'modules.json').read_text());assert len(modules)==142
assert len({x['id'] for x in modules})==142
errors=[]
for m in modules:
    if m['kind']=='web' and not (ROOT/m['web']/m['entry']).is_file():errors.append(f"{m['id']}: missing runnable entry")
    if m.get('source') and not (ROOT/m['source']).is_dir():errors.append(f"{m['id']}: missing source")
    if m['migration']=='pending' and m['kind']!='missing':errors.append(f"{m['id']}: pending source incorrectly labelled")
    if m['kind']=='server' and m['migration']!='source':errors.append(f"{m['id']}: backend incorrectly labelled as deployed")
    download=m.get('download','')
    if download and not download.startswith('https://') and not (ROOT/download).is_file():errors.append(f"{m['id']}: missing local download")
index=json.loads((ROOT/'assets/index.json').read_text())
for folder in ['sources','web']:
    for manifest in (ROOT/folder).glob('*/migration-assets.json'):
        for rel,target in json.loads(manifest.read_text()).items():
            p=ROOT/target
            if not p.is_file():errors.append(f'{manifest}: missing {target}')
            if not p.resolve().is_relative_to((ROOT/'assets').resolve()):errors.append(f'Unsafe asset target {target}')
            if not (manifest.parent/rel).resolve().is_relative_to(manifest.parent.resolve()):errors.append(f'Unsafe original path {rel}')
if '--hashes' in sys.argv:
    for name,meta in index.items():
        p=ROOT/'assets'/name
        if hashlib.sha256(p.read_bytes()).hexdigest()!=meta['sha256']:errors.append(f'Corrupt asset {name}')
    package=json.loads((ROOT/'downloads/shiguang-package.json').read_text())
    for part in package['parts']:
        p=ROOT/'downloads'/part['file']
        if not p.is_file() or p.stat().st_size!=part['bytes'] or hashlib.sha256(p.read_bytes()).hexdigest()!=part['sha256']:errors.append(f'Corrupt package part {part["file"]}')
site=ROOT/'_site'
if site.exists():
    public=json.loads((site/'modules.json').read_text())
    for m in public:
        p=site/urllib.parse.unquote(m['url'])
        if not p.is_file():errors.append(f"Broken published entry {m['id']}: {p}")
    size=sum(p.stat().st_size for p in site.rglob('*') if p.is_file())
    if size>=950*1024*1024:errors.append('Pages artifact exceeds size budget')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(modules)} catalogue entries; all declared sources, entry pages and {len(index)} asset records are present.')
