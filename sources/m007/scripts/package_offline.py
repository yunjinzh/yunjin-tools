"""Build one portable ZIP, served as small transport parts by the static host."""
from pathlib import Path
import argparse,hashlib,json,zipfile

parser=argparse.ArgumentParser();parser.add_argument('--output',required=True,type=Path)
args=parser.parse_args();root=Path(__file__).resolve().parent.parent
args.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for folder in ['dist','scripts','tests','physics','reports']:
        for file in sorted((root/folder).rglob('*')):
            relative=file.relative_to(root)
            if not file.is_file() or '__pycache__' in relative.parts:continue
            if file.name.startswith('qa-'):continue
            if file.suffix=='.zip' or relative.parts[:2]==('dist','downloads'):continue
            archive.write(file,'embodied-studio/'+str(relative))
    for name in ['README.md','DESIGN_REVIEW.md','package.json','package-lock.json','start_server.py','启动训练系统.bat']:
        archive.write(root/name,'embodied-studio/'+name)
with zipfile.ZipFile(args.output) as archive:
    assert archive.testzip() is None
data=args.output.read_bytes();downloads=root/'dist/downloads';downloads.mkdir(exist_ok=True)
parts=[]
for index,start in enumerate(range(0,len(data),16*1024*1024)):
    part=data[start:start+16*1024*1024];name=f'source-{index+1}.bin'
    (downloads/name).write_bytes(part)
    parts.append({'file':name,'bytes':len(part),'sha256':hashlib.sha256(part).hexdigest()})
(downloads/'source-manifest.json').write_text(json.dumps({'name':'embodied-studio-source.zip','bytes':len(data),
    'sha256':hashlib.sha256(data).hexdigest(),'parts':parts},indent=2)+'\n')
assert b''.join((downloads/p['file']).read_bytes() for p in parts)==data
print(f'ZIP verified: {len(data)} bytes, {len(parts)} transport parts')
