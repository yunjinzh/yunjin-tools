#!/usr/bin/env python3
"""Package an already built and validated offline museum."""
import hashlib,json,zipfile,subprocess,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[1]; out=root/'offline-portable'
subprocess.run(['node',str(root/'scripts/test-offline.mjs')],check=True)
subprocess.run(['node',str(root/'scripts/test-offline-app.mjs')],check=True)
manifest=json.loads((out/'manifest.json').read_text())
validation=(root/'scripts/portable-validation.txt').read_text().replace('{date}',datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')).replace('{count}',str(manifest['count'])).replace('{galleries}','、'.join(f'{k}馆 {v} 幅' for k,v in manifest['galleryCounts'].items()))
(out/'VALIDATION.txt').write_text(validation)
assert hashlib.sha256((out/'index.html').read_bytes()).hexdigest()==manifest['htmlSha256']
path=out/f"world-map-museum-{manifest['count']}-portable.zip"
with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for name in ['index.html','使用说明.txt','LICENSES.txt','VALIDATION.txt','manifest.json']:
        z.write(out/name,name)
with zipfile.ZipFile(path) as z:
    assert z.testzip() is None
    assert hashlib.sha256(z.read('index.html')).hexdigest()==manifest['htmlSha256']
if path.stat().st_size>=24000000: raise RuntimeError(f'Portable ZIP exceeds 24 MB target: {path.stat().st_size} bytes at {path}. Report before changing quality.')
result={name:{'path':str(out/name),'bytes':(out/name).stat().st_size,'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest()} for name in ['index.html',path.name]}
(out/'delivery.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False,indent=2))
