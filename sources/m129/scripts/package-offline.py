"""Produce the offline HTML and ZIP without network/CDN dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist'/'downloads'
OUT.mkdir(exist_ok=True)
html=(ROOT/'dist/index.html').read_text()
css=(ROOT/'dist/style.css').read_text()
js=(ROOT/'dist/app.js').read_text().replace('</script','<\\/script')
local_html=html.replace('<a href="./downloads/yunjin-sand3d-studio.zip" download>下载本地版与源码 ↓</a>', '<span>离线版 · 无需联网</span>')
single=local_html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>').replace('<script src="./app.js"></script>','<script>'+js+'</script>')
(OUT/'yunjin-sand3d-offline.html').write_text(single)
with ZipFile(OUT/'yunjin-sand3d-studio.zip','w',ZIP_DEFLATED,compresslevel=9) as z:
    z.writestr('Yunjin-Shape-Studio/云金造物_离线版.html',single)
    z.writestr('Yunjin-Shape-Studio/dist/index.html',local_html)
    for path in ['dist/app.js','dist/style.css','README.md','package.json','package-lock.json','build.mjs','start_windows.cmd','start_mac_linux.sh']:
        if (ROOT/path).is_file():z.write(ROOT/path,'Yunjin-Shape-Studio/'+path)
    for folder in ['src','backend','examples','tests','licenses','scripts']:
        for p in (ROOT/folder).rglob('*'):
            if p.is_file() and '__pycache__' not in p.parts:
                z.write(p,'Yunjin-Shape-Studio/'+p.relative_to(ROOT).as_posix())
print('Offline HTML and complete local package ready.')
