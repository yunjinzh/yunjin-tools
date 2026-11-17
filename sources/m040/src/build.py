from pathlib import Path
import json,base64,re
root=Path(__file__).resolve().parents[1]
src=root/'src'
html=(src/'template.html').read_text()
three=(src/'three.cjs').read_text()
wrapped='var THREE = (function(){var exports = {};\n'+three+'\nreturn exports;})();'
data='const DATA='+ (src/'learning-data.json').read_text()+';\nconst GEO='+ (src/'china-boundaries.json').read_text()+';'
for marker,text in [('STYLE',(src/'style.css').read_text()),('THREE',wrapped),('DATA',data),('ENGINE',(src/'engine.js').read_text()),('APP',(src/'app.js').read_text())]:
    html=html.replace('/*'+marker+'*/',text.replace('</script','<\\/script') if marker!='STYLE' else text)
(root/'dist/index.html').write_text(html)
# Local artifact uses the exact same source with the one visual asset inlined.
asset=root/'dist/assets/pilot.webp'
uri='data:image/webp;base64,'+base64.b64encode(asset.read_bytes()).decode()
local=html.replace('assets/pilot.webp',uri)
out=Path('/workspace/scratch/ecbbbe3ca03e/cloud-china-delivery');out.mkdir(exist_ok=True)
(out/'云游中国_本地版.html').write_text(local)
print('Hosted HTML',len(html.encode()),'bytes; Offline HTML',len(local.encode()),'bytes')
