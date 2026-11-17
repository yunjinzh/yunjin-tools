#!/usr/bin/env python3
"""Build a self-contained, network-free classic-script museum, without changing dist."""
import argparse, base64, concurrent.futures, hashlib, io, json, re, subprocess, zipfile
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(); parser.add_argument('--expected-count',type=int); parser.add_argument('--output-dir',default='offline-portable'); parser.add_argument('--quality',type=int,default=55); parser.add_argument('--max-side',type=int,default=1024); parser.add_argument('--cache-only',action='store_true'); args=parser.parse_args()
DIST=ROOT/'dist'; OUT=ROOT/args.output_dir; OUT.mkdir(exist_ok=True)
maps=json.loads((DIST/'maps.json').read_text()); assert maps
if args.expected_count is not None: assert len(maps)==args.expected_count
assert len({str(m['id']) for m in maps})==len(maps)
cache=ROOT/'.offline-cache'; cache.mkdir(exist_ok=True)
def pack(m):
    source=DIST/m.get('full',m['image']); raw=source.read_bytes(); digest=hashlib.sha256(raw).hexdigest()
    target=cache/(digest+f'-q{args.quality}-s{args.max_side}.webp')
    with Image.open(io.BytesIO(raw)) as im:
        im.load(); size=im.size
        assert size==(m['width'],m['height']), (m['id'],size,(m['width'],m['height']))
        if args.max_side: im.thumbnail((args.max_side,args.max_side),Image.Resampling.LANCZOS)
        size=im.size
        if not target.exists():
            buf=io.BytesIO(); im.save(buf,'WEBP',quality=args.quality,method=6)
            target.write_bytes(buf.getvalue() if args.max_side or len(buf.getvalue())<len(raw)*.9 else raw)
    data=target.read_bytes()
    return {'paths':list(dict.fromkeys(m[k] for k in ('image','thumbnail','full') if k in m)), 'data':base64.b64encode(data).decode('ascii'), 'width':size[0], 'height':size[1], 'sha256':hashlib.sha256(data).hexdigest(), 'sourceSha256':digest, 'bytes':len(data), 'id':m['id']}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: images=list(pool.map(pack,maps))
if args.cache_only:
    print(json.dumps({'count':len(maps),'imageBytes':sum(i['bytes'] for i in images)}));raise SystemExit(0)
three=(DIST/'vendor/three.module.js').read_text()
match=re.search(r'export\s*\{([^}]+)\}\s*;?\s*$',three); assert match, 'Unsupported Three export shape'
exports=[]
for spec in match.group(1).split(','):
    parts=re.split(r'\s+as\s+',spec.strip()); assert len(parts) in (1,2)
    exports.append((parts[-1]+':'+parts[0]))
three='const THREE = (()=>{\n'+three[:match.start()]+'\nreturn {'+','.join(exports)+'};\n})();'
app=(DIST/'app.js').read_text(); app,n=re.subn(r"^import \* as THREE from ['\"][^'\"]+['\"];\s*",'',app,count=1); assert n==1
# Remove the online request itself, including unreachable fallback, from this build.
app,n=re.subn(r"fetch\((['\"])(?:\./)?maps\.json\1\)", "Promise.resolve({ok:true,json:async()=>window.MUSEUM_MAPS})", app)
assert not re.search(r'\b(?:import|export)\s',app)
bootstrap=r'''(()=>{
const element=document.getElementById('museum-offline-data');
const payload=JSON.parse(element.textContent); element.remove();
window.MUSEUM_MAPS=payload.maps; window.MUSEUM_OFFLINE=true;
const notice=document.getElementById('storageNotice');
if(notice){notice.hidden=false;notice.textContent='离线文件的记录可能随文件路径、浏览器或隐私设置变化。请使用“导出进度”备份，换设备后导入。';}
const urls=Object.create(null), assets=Object.create(null);
for(const record of payload.images){
 const resolve=()=>{
  if(!urls[record.sha256]){
   const raw=atob(record.data), bytes=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   urls[record.sha256]=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
   record.data=null;
  }
  return urls[record.sha256];
 };
 for(const path of record.paths)Object.defineProperty(assets,path,{get:resolve,enumerable:true});
}
window.MUSEUM_ASSETS=assets;
window.addEventListener('pagehide',event=>{if(!event.persisted)Object.values(urls).forEach(url=>URL.revokeObjectURL(url));});
})();'''
if args.max_side: bootstrap=bootstrap.replace('离线文件的记录',f'便携展示版：最长边 {args.max_side} 像素，WebP 质量 {args.quality}，完整画面无裁剪。离线文件的记录')
html=(DIST/'index.html').read_text(); css=(DIST/'style.css').read_text()
def safe_script(s): return re.sub(r'</script',r'<\\/script',s,flags=re.I)
html,n=re.subn(r'<link\s+rel="stylesheet"\s+href="style.css"\s*/?>',lambda _: '<style>'+css+'</style>',html); assert n==1
payload=json.dumps({'maps':maps,'images':images},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
scripts='<script id="museum-offline-data" type="application/json">'+payload+'</script>\n'
for name,code in [('offline-bootstrap',bootstrap),('three-bundled',three),('museum-app',app)]:
    scripts+='<script id="'+name+'">'+safe_script(code)+'</script>\n'
    check=OUT/(name+'.check.js');check.write_text(code);subprocess.run(['node','--check',str(check)],check=True);check.unlink()
html,n=re.subn(r'<script\s+type="module"\s+src="app.js"\s*>\s*</script>',lambda _:scripts,html);assert n==1
extra_sources=[]
def inline_config(match):
    path=match.group(1)
    assert path=='gallery-config.js', 'Unrecognized external script: '+path
    code=(DIST/path).read_text(); extra_sources.append(path)
    check=OUT/'gallery-config.check.js';check.write_text(code);subprocess.run(['node','--check',str(check)],check=True);check.unlink()
    return '<script id="museum-gallery-config">'+safe_script(code)+'</script>'
html=re.sub(r'<script\s+src="([^"]+)"\s*>\s*</script>',inline_config,html)
assert not re.search(r'<script[^>]+src=',html), 'Unresolved external script'
html=html.replace('<title>','<title>便携展示版 · ',1)
(OUT/'index.html').write_text(html)
license_text=(DIST/'vendor/LICENSE.txt').read_text()
(OUT/'LICENSES.txt').write_text('Three.js license (bundled in index.html)\n\n'+license_text+'\n\n馆藏地图：用户提供的艺术作品。本包不授予额外第三方版权许可；再分发时请确认您持有所需权利。\n')
(OUT/'使用说明.txt').write_text('万象寰宇 · 200 幅地图 · 完整离线版\n\n1. 请先将 ZIP 解压到任意本地文件夹。\n2. 双击 index.html，使用 Windows 的 Microsoft Edge 或 Google Chrome 打开。\n3. 无需安装 Python、Node、服务器；断网也可使用。index.html 本身就是完整单文件，可单独转发。\n4. 本文件含 200 幅全像素尺寸作品，首次打开会需要一点时间。三维需要浏览器启用 WebGL；不支持时可使用二维目录和高清鉴赏。\n5. A馆“文明回廊”保留环形展廊；B馆“叠院美术馆”采用矩形双翼、上下两层展廊、中央挑空与空中连桥。两馆均可搜索、切换昼夜、漫游、导览、收藏并放大作品。高清图保留交付素材的全部像素尺寸，使用适度 WebP 有损压缩，并非原始生成 PNG。\n6. file:// 文件的浏览器存储行为因浏览器、文件路径及隐私设置而异。请定期使用“导出进度”保存 JSON；换电脑、移动文件或清理浏览器前先导出，再通过“导入进度”恢复。存储受阻时仍可游览并导出当前进度。\n7. 收藏及已看记录在您的设备内，不上传服务器。\n8. 地图为艺术表达，不作为导航、地名、国界或行政区划依据。\n\n技术信息\n全部 Three.js、样式、展馆/风格注册配置、应用代码和 200 幅作品已内嵌，无 CDN、外部字体或网络资源依赖。每幅完整作品仅内嵌一次，展墙和目录共用该素材；三维纹理按需缩放。Third-party license: LICENSES.txt。\n\n验证说明\n本包已进行脚本语法、图片解码/尺寸、完整性和离线资源静态检查；具体浏览器实测范围见随附 VALIDATION.txt。\n')
note=OUT/'使用说明.txt'; note.write_text(note.read_text().replace('200 幅全像素尺寸作品','200 幅完整画面作品').replace('高清图保留交付素材的全部像素尺寸，使用适度 WebP 有损压缩，并非原始生成 PNG。',f'本版本为便携展示优化版：保留完整画面，无裁剪；图片等比例缩放至最长边不超过 {args.max_side} 像素，WebP 质量 {args.quality}。并非原始生成 PNG 或全像素档案版。'))
guide=(OUT/'使用说明.txt').read_text().replace('200',str(len(maps))).replace('两馆均可搜索','各馆均可搜索')
counts={batch:sum(m.get('batch')==batch for m in maps) for batch in dict.fromkeys(m.get('batch','A') for m in maps)}
guide+='\n本包实际馆藏：'+ '；'.join(f'{batch}馆 {count} 幅' for batch,count in counts.items())+'。\n'
if counts.get('C'): guide+='C馆为北京主题院落展馆，收录上述实际已完成的北京作品；与A/B馆同时内嵌。\n'
(OUT/'使用说明.txt').write_text(guide)
manifest={'optimization':{'maxSide':args.max_side,'webpQuality':args.quality},'sourceSha256':{name:hashlib.sha256((DIST/name).read_bytes()).hexdigest() for name in ['app.js','index.html','style.css','maps.json','vendor/three.module.js']+extra_sources},'count':len(maps),'galleryCounts':counts,'htmlBytes':len(html.encode()),'htmlSha256':hashlib.sha256(html.encode()).hexdigest(),'imageBytes':sum(i['bytes'] for i in images),'images':[{k:v for k,v in i.items() if k!='data'} for i in images]}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in manifest.items() if k!='images'},ensure_ascii=False))
