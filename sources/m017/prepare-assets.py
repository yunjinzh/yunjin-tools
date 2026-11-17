from pathlib import Path
from PIL import Image
import json, shutil
from fontTools.ttLib import TTFont
from fontTools import subset
root=Path(__file__).parent
poems=json.loads((root.parent/'poems.json').read_text())
a=root/'dist/assets';a.mkdir(exist_ok=True)
for p in poems:
 src=Path(p['image_path']); im=Image.open(src).convert('RGB')
 for size,tag,q in [(1400,'read',87),(140,'thumb',70)]:
  out=a/f"{p['id']}-{tag}.webp"
  if not out.exists():
   x=im.copy();x.thumbnail((size,size));x.save(out,'WEBP',quality=q,method=6)
 original=a/f"{p['id']}-original.png"
 if not original.exists():shutil.copy2(src,original)
 p['image']=f"assets/{p['id']}-read.webp";p['thumb']=f"assets/{p['id']}-thumb.webp";p['original']=f"assets/{p['id']}-original.png"
 for k in ['image_path','source_library_id','source_url']:p.pop(k,None)
(root/'dist/poems.js').write_text('window.POEMS='+json.dumps(poems,ensure_ascii=False)+';')
text=''.join(p.read_text() for p in (root/'dist').glob('*') if p.suffix in ['.html','.js'])
f=TTFont('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',fontNumber=2)
opts=subset.Options();opts.flavor='woff';s=subset.Subsetter(options=opts);s.populate(text=text);s.subset(f);f.flavor='woff';f.save(a/'poetry.woff')
print('Prepared',len(poems),'poems; assets',sum(p.stat().st_size for p in a.iterdir())//1024//1024,'MB')
