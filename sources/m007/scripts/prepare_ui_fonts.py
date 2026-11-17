"""Build local, renamed WOFF2 subsets from OFL fonts; runtime is offline.
Requires fonttools and brotli. Original fonts/licenses are kept in --cache.
"""
from pathlib import Path
import argparse,hashlib,json,urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont

parser=argparse.ArgumentParser();parser.add_argument('--cache',type=Path,required=True);args=parser.parse_args()
args.cache.mkdir(parents=True,exist_ok=True);root=Path(__file__).resolve().parent.parent/'dist';out=root/'assets/fonts';out.mkdir(parents=True,exist_ok=True)
items=[
 ('NotoSansCJKsc-Regular.otf','https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf','studio-sans.woff2','Studio Sans','NotoSans-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'),
 ('NotoSerifCJKsc-SemiBold.otf','https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/SimplifiedChinese/NotoSerifCJKsc-SemiBold.otf','studio-serif.woff2','Studio Serif','NotoSerif-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt'),
 ('Oswald.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald%5Bwght%5D.ttf','studio-display.woff2','Studio Display','Oswald-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt')]
text=''.join(p.read_text() for p in root.glob('*') if p.suffix in ('.html','.js','.css'))
latin=''.join(chr(i) for i in range(32,127));chars=''.join(sorted(set(text+latin)));metadata=[]
for file,url,name,family,license,license_url in items:
 for filename,source in [(file,url),(license,license_url)]:
  target=args.cache/filename
  if not target.exists():target.write_bytes(urllib.request.urlopen(source,timeout=60).read())
 font=TTFont(args.cache/file);options=subset.Options();options.name_IDs=['*'];options.name_legacy=True;options.layout_features=['*']
 sub=subset.Subsetter(options=options);sub.populate(text=latin if 'display' in name else chars);sub.subset(font)
 for record in font['name'].names:
  if record.nameID in (1,3,4,6,16):record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
 font.flavor='woff2';font.save(out/name);(out/license).write_bytes((args.cache/license).read_bytes())
 metadata.append({'file':name,'family':family,'sourceUrl':url,'license':'SIL Open Font License 1.1','licenseFile':license,'modifications':'Subset to application glyphs; family renamed','sha256':hashlib.sha256((out/name).read_bytes()).hexdigest(),'sourceSha256':hashlib.sha256((args.cache/file).read_bytes()).hexdigest(),'bytes':(out/name).stat().st_size})
 print(name,(out/name).stat().st_size,flush=True)
(out/'manifest.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
