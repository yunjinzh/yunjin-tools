from pathlib import Path
root=Path(__file__).parent
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
for name in ['engine.js','scenes.js','avatar.js','app.js']:
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+(root/name).read_text()+'\n</script>')
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print(f'Built standalone HTML: {len(html.encode()):,} bytes')
