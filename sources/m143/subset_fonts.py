import sys,re,json
from pathlib import Path
sys.path.insert(0,'/workspace/font-tools')
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).parent
font_sources=Path('/workspace/font-sources');out=root/'dist'/'fonts';out.mkdir(exist_ok=True)
chars=set(chr(i) for i in range(32,127))
for file in ['index.html','app.js','data.js','styles.css']:
 chars.update((root/'dist'/file).read_text())
for family in ['sans','serif']:
 for weight in ['regular','bold']:
  src=font_sources/f'SourceHan{family.title()}SC-{weight.title()}.otf'
  font=TTFont(src)
  opts=subset.Options();opts.flavor='woff2';opts.name_IDs=['*'];opts.name_languages=['*'];opts.notdef_glyph=True;opts.recalc_bounds=True
  sub=subset.Subsetter(options=opts);sub.populate(unicodes=[ord(c) for c in chars]);sub.subset(font)
  # The OFL reserves "Source"; name the redistributed subset separately.
  family_name=f'Policy Han {family.title()}';style=weight.title()
  names={1:family_name,2:style,3:family_name+' '+style+' Site Subset 2026',4:family_name+' '+style,6:family_name.replace(' ','')+'-'+style,16:family_name,17:style}
  for n in font['name'].names:
   if n.nameID in names:n.string=names[n.nameID].encode(n.getEncoding(),errors='replace')
  font.flavor='woff2';target=out/f'source-han-{family}-{weight}.woff2';font.save(target)
  print(target.name,target.stat().st_size,flush=True)
 for suffix in [family]:
  (out/f'LICENSE-{suffix}.txt').write_bytes((font_sources/f'LICENSE-{suffix}.txt').read_bytes())
(out/'font-provenance.json').write_text(json.dumps({'originalFamilies':['Adobe Source Han Sans SC','Adobe Source Han Serif SC'],'sources':['https://github.com/adobe-fonts/source-han-sans','https://github.com/adobe-fonts/source-han-serif'],'modification':'Glyph subset and WOFF2 conversion only; font naming changed to Policy Han Sans / Serif to respect reserved font names. Original glyph designs retained.','license':'SIL Open Font License 1.1','characters':len(chars)},indent=2))
