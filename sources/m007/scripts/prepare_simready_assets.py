"""Fetch the selected public USD packages at the audited, pinned revision.

python prepare_simready_assets.py --cache /path/to/asset-cache
python convert_simready_assets.py --cache /path/to/asset-cache
node optimize_simready_assets.mjs
"""
import argparse, concurrent.futures, json, urllib.request
from pathlib import Path
from convert_simready_assets import SELECTION, REVISION

parser=argparse.ArgumentParser();parser.add_argument('--cache',required=True,type=Path)
args=parser.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
base=f'https://huggingface.co/datasets/nvidia/simready-assets/resolve/{REVISION}/'
jobs=[]
for asset in SELECTION.values():
    tree_path=args.cache/(asset+'-tree.json')
    if not tree_path.exists():
        url=f'https://huggingface.co/api/datasets/nvidia/simready-assets/tree/{REVISION}/{asset}?recursive=true&limit=1000'
        tree_path.write_bytes(urllib.request.urlopen(url,timeout=60).read())
    entries=json.loads(tree_path.read_text());by_path={f['path']:f for f in entries}
    package_path=f'{asset}/com.nvidia.simready.packaging.json'
    package=json.load(urllib.request.urlopen(base+package_path,timeout=60))
    if package.get('license')!='CC-BY-4.0':raise ValueError(f'Unreviewed license: {asset}')
    for entry in entries:
        name=entry['path']
        if entry['type']!='file' or 'source_assets' in name:continue
        if name.endswith(('.usd','.usda','.usdc','.json','LICENSE.txt')):jobs.append((entry,name))
        elif '/Textures/' in name and '/.thumbs/' not in name:
            small=name.rsplit('/',1)[0]+'/.thumbs/512x512/'+name.rsplit('/',1)[1]+'.png'
            selected=by_path.get(small,entry) if entry['size']>8_000_000 else entry
            jobs.append((selected,name))

def fetch(job):
    remote,local=job;target=args.cache/local
    if target.exists() and target.stat().st_size==remote['size']:return
    target.parent.mkdir(parents=True,exist_ok=True)
    for attempt in range(3):
        try:
            content=urllib.request.urlopen(base+remote['path'],timeout=60).read()
            if len(content)!=remote['size']:raise ValueError('Incomplete download')
            target.write_bytes(content);return
        except Exception:
            if attempt==2:raise

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for i,_ in enumerate(pool.map(fetch,jobs)):
        if (i+1)%40==0:print(f'{i+1}/{len(jobs)} files',flush=True)
(args.cache/'download-selection.json').write_text(json.dumps({'revision':REVISION,'assets':list(SELECTION.values()),
    'sources':[{'remote':entry['path'],'local':name} for entry,name in jobs]},indent=2)+'\n')
print('Selected packages and source mappings saved.')
