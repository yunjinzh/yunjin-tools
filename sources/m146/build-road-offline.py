"""Build the offline postcard road distribution without duplicating the 414 WebP payloads."""
import base64, pathlib, zipfile, re, hashlib, sys
root=pathlib.Path(__file__).resolve().parent
out=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'字野长路-原卡直看V3-离线版.zip'
dist=root/'dist'
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=5) as z:
 for f in sorted(dist.rglob('*')):
  if not f.is_file() or f.name=='world.js':continue
  rel=f.relative_to(dist)
  if f.suffix=='.webp' and rel.parts[0]=='cards':
   z.writestr(str(rel.with_suffix('.js')),"window.TrailImages.accept('"+f.stem+"','"+base64.b64encode(f.read_bytes()).decode('ascii')+"');")
  elif str(rel)=='index.html':
   z.writestr('index.html',f.read_text().replace('<script defer src="./images.js">','<script src="./offline-mode.js"></script><script defer src="./images.js">'))
  else:z.write(f,rel)
 z.writestr('offline-mode.js','window.TrailOfflinePack=true;\n')
 z.write(root/'离线使用说明.txt','先读我-使用说明.txt')
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 payloads=[s for s in z.namelist() if re.fullmatch(r'cards/\d{4}\.js',s)];assert len(payloads)==414
 for name in payloads:
  id=name[6:10]; js=z.read(name).decode('ascii');m=re.fullmatch(r"window\.TrailImages\.accept\('"+id+r"','([A-Za-z0-9+/=]+)'\);",js);assert m
  assert base64.b64decode(m[1],validate=True)==(dist/('cards/'+id+'.webp')).read_bytes()
 html=z.read('index.html').decode('utf8')
 for href in re.findall('(?:href|src)="([^"]+)"',html):
  if not href.startswith('#'):assert href.replace('./','',1) in z.namelist(),href
print('Offline ZIP OK:',out.resolve(),out.stat().st_size,'bytes; 414 identical WebPs, local entry assets, CRC all passed.')
