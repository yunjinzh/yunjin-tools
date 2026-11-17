from pathlib import Path
import base64,json,re,sys
root=Path(__file__).resolve().parents[1]/'dist'
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path.cwd()/'factory-offline.html'
s=(root/'index.html').read_text()
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
images={str(i):'data:image/jpeg;base64,'+base64.b64encode((root/f'assets/reference-{i}.jpg').read_bytes()).decode() for i in range(1,4)}
video='data:video/mp4;base64,'+base64.b64encode((root/'assets/reference.mp4').read_bytes()).decode()
s=s.replace('src="assets/reference-1.jpg"','src="'+images['1']+'"').replace('src="assets/reference.mp4"','src="'+video+'"')
for js in ['assets/three.min.js','scene.js','app.js']:
 code=(root/js).read_text()
 if js=='app.js':
  code=code.replace('`assets/reference-${s}.jpg`','window.REFERENCE_IMAGES[s]')
  code='window.REFERENCE_IMAGES='+json.dumps(images)+';\n'+code
 code=code.replace('</script','<\\/script')
 s=s.replace('<script src="'+js+'"></script>','<script>'+code+'</script>')
s=s.replace('<title>厂房空间复原 · 三维漫游</title>','<title>厂房空间复原 · 离线三维漫游</title>')
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
assert not re.findall(r'(?:src|href)="(?:assets/|style.css|scene.js|app.js)',s)
assert 'assets/reference-${s}' not in s
print(json.dumps({'path':str(out),'bytes':out.stat().st_size,'external_assets':0},ensure_ascii=False))
