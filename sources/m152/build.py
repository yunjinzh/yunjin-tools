from pathlib import Path
from base64 import b64encode
import json
src=Path('src');out=Path('dist');out.mkdir(exist_ok=True,parents=True)
def data(path,m):
 return f'data:{m};base64,'+b64encode(Path(path).read_bytes()).decode()
im=[data(f'assets/scene{i}.webp','image/webp') for i in range(6)]
assets='const ART='+json.dumps(im)+';const COVER='+json.dumps(data('assets/cover.webp','image/webp'))+';const MUSIC='+json.dumps(data('assets/music.mp3','audio/mpeg'))+';'
html=(src/'index.tpl').read_text()
for k,v in {'STYLE':(src/'style.css').read_text(),'THREE':'/*'+Path('vendor/THREE-LICENSE.txt').read_text()+'*/\n'+Path('vendor/three.min.js').read_text(),'ASSETS':assets,'DATA':(src/'data.js').read_text(),'WORLD':(src/'world.js').read_text(),'GAME':(src/'game.js').read_text()}.items():html=html.replace('/*'+k+'*/',v)
(out/'index.html').write_text(html)
print(len(html.encode()),'bytes')
