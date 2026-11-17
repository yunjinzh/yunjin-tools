from pathlib import Path
import base64,re

root=Path(__file__).resolve().parent
dist=root/'dist'
target=Path('/workspace/scratch/4cc9b6e1609c/output/journey-game/西游小游记_108角色互动游戏.html')
html=(dist/'index.html').read_text()
css=(dist/'style.css').read_text()+'\n'+(dist/'sprites.css').read_text()
for i in range(1,10):
    asset=f'assets/sheet-{i}.webp'
    css=css.replace(asset,'data:image/webp;base64,'+base64.b64encode((dist/asset).read_bytes()).decode())
html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
html=re.sub(r'<script defer src="[^"]+"></script>','',html)
html=html.replace('</head>','<style>'+css+'</style></head>')
scripts='\n'.join((dist/n).read_text() for n in ['data.js','engine.js','app.js'])
assert '</script' not in scripts.lower()
html=html.replace('</body>','<script>\n'+scripts+'\n</script></body>')
assert html.count('data:image/webp;base64,')==9
assert 'url("assets/' not in html
assert '<script defer src=' not in html
assert '<link rel="stylesheet"' not in html
target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(html)
print(target)
print('Bytes:',target.stat().st_size)
