from pathlib import Path
p=Path(__file__).parent
h=(p/'index.template.html').read_text()
h=h.replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'dist/style.css').read_text()+'</style>')
for f in ['three.js','data.js','curation.js','app.js']:h=h.replace(f'<script defer src="{f}"></script>','')
s='\n'.join((p/'dist'/f).read_text() for f in ['three.js','data.js','curation.js','app.js'])
h=h.replace('</body>','<script>'+s.replace('</script','<\\/script')+'</script></body>')
(p/'dist/index.html').write_text(h)
