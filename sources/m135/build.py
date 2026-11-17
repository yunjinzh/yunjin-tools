from pathlib import Path
import base64,html
ROOT=Path(__file__).parent
ASSETS=ROOT/'assets'
data=(ROOT/'data.json').read_text()
app=(ROOT/'exports.js').read_text()+'\n'+(ROOT/'state.js').read_text()+'\n'+(ROOT/'app.js').read_text()+'\n'+(ROOT/'controller.js').read_text()
css=(ROOT/'style.css').read_text()
template=(ROOT/'template.html').read_text()
license=(ASSETS/'OFL.txt').read_text()
app=app.replace('/*LICENSE*/',html.escape(license).replace('`','\\`').replace('${','\\${'))
fontcss=''
for weight in [400,700]:
 dest=ASSETS/f'font-{weight}.woff'
 fontcss+=f"@font-face{{font-family:'Noto Sans SC';src:url(data:font/woff;base64,{base64.b64encode(dest.read_bytes()).decode()}) format('woff');font-weight:{weight};font-style:normal;font-display:swap;}}"
out=template.replace('/*FONTS*/',fontcss).replace('/*STYLES*/',css).replace('/*DATA*/',data.replace('<','\\u003c')).replace('/*APP*/',app)
(ROOT/'dist'/'index.html').write_text(out)
print('Built',len(out.encode()),'bytes')
