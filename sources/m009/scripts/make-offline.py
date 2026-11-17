from pathlib import Path
import base64

root = Path(__file__).resolve().parents[1]
dist = root / 'dist' / 'cat'
html = (dist / 'index.html').read_text()
css = (dist / 'style.css').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
for name in ['lesson.js', 'core.js', 'app.js']:
    js = (dist / name).read_text()
    if name == 'lesson.js':
        for i in range(1, 7):
            img = base64.b64encode((dist / 'source-pages' / f'page-{i}.jpg').read_bytes()).decode()
            js = js.replace(f'source-pages/page-{i}.jpg', 'data:image/jpeg;base64,' + img)
    if name == 'app.js':
        svg = base64.b64encode((dist / 'hero.svg').read_bytes()).decode()
        js = js.replace('hero.svg', 'data:image/svg+xml;base64,' + svg)
    js = js.replace('href="../book.html?book=4"', 'href="https://storysprout-reading-a762.yunjinzh.chatgpt.site/book.html?book=4"')
    js = js.replace('</script', '<\\/script')
    html = html.replace(f'<script src="{name}"></script>', '<script>' + js + '</script>')
(dist / 'offline.html').write_text(html)
print(f'Offline single-file artifact created: {len(html.encode()):,} bytes')
