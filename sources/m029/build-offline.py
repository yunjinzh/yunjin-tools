from pathlib import Path
import json,base64,re,zipfile
p=Path(__file__).parent/'dist';out=Path(__file__).parent.parent/'museum-offline';out.mkdir(exist_ok=True)
data=json.loads((p/'data.js').read_text()[len('window.MAPS='):].rstrip(';'))
for m in data:m['hd']='data:image/jpeg;base64,'+base64.b64encode((p/m['hd']).read_bytes()).decode()
html=(p.parent/'index.template.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'style.css').read_text()+'</style>')
for script in ['three.js','data.js','curation.js','app.js']:html=html.replace(f'<script defer src="{script}"></script>','')
js=(p/'three.js').read_text()+'\nwindow.MAPS='+json.dumps(data,ensure_ascii=False)+';\n'+(p/'curation.js').read_text()+'\n'+(p/'app.js').read_text()
html=html.replace('</body>','<script>'+js.replace('</script','<\\/script')+'</script></body>')
f=out/'北京的三十种面孔_三维地图展馆.html';f.write_text(html)
with zipfile.ZipFile(out/'三维地图展馆_离线版.zip','w',zipfile.ZIP_DEFLATED) as z:z.write(f,f.name)
print(f.stat().st_size,(out/'三维地图展馆_离线版.zip').stat().st_size)
