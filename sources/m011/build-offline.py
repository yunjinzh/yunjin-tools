from pathlib import Path
import re,base64

project=Path(__file__).resolve().parent
dist=project/'dist'
out=Path('/workspace/scratch/4cc9b6e1609c/output/watermargin-game')
out.mkdir(parents=True,exist_ok=True)
html=(dist/'index.html').read_text()
css=(dist/'style.css').read_text()+'\n'+(dist/'sprites.css').read_text()
for i in range(1,10):
    p=f'assets/group-{i}.png'
    data=base64.b64encode((dist/p).read_bytes()).decode('ascii')
    css=css.replace(p,'data:image/png;base64,'+data)
html=re.sub(r'<link rel="stylesheet" href="[^\"]+">','',html)
html=re.sub(r'<script defer src="[^\"]+"></script>','',html)
html=html.replace('</head>','<style>'+css+'</style></head>')
scripts='\n'.join((dist/p).read_text() for p in ['data.js','engine.js','app.js'])
html=html.replace('</body>','<script>\n'+scripts+'\n</script></body>')
assert '<script defer src=' not in html
assert 'url("assets/' not in html
assert html.count('data:image/png;base64,')==9
target=out/'梁山小英雄_108人物互动游戏.html'
target.write_text(html,encoding='utf8')
print(str(target))
print('Bytes:',target.stat().st_size)
