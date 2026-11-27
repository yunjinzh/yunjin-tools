"""Write a portable, self-contained source catalogue and a six-second film credit slate."""
from pathlib import Path
import html,json,re,sys
from PIL import Image,ImageDraw,ImageFont,ImageFilter
root=Path(__file__).resolve().parents[2]/'dist'
sources={
 '地图、地形与地表':['imagery/manifest.json','data/osm-source.json','terrain-data/manifest.json'],
 '国贸、一般建筑与街道':['urban/facades-sources.json','urban/streets-source.json','urban/cbd-sources.md','urban/cmab-2023-source.json'],
 '钟库胡同与什刹海':['urban/hutong-source.json','urban/waterfront-credits.json'],
 '故宫、天安门与建筑构件':['heritage/palace-credits.json','heritage/gate-credits.md','heritage/precinct-source.json','heritage/furniture-credits.json'],
 '天空环境':['heritage/sky-credits.json'],
 '实地摄影与公开三维扫描':['field/index.json','field/urban-index.json','field/survey/index.json','photos/index.json'],
 '外围建筑研究数据':['urban/regional-source.json']
}
def tree(data):
 if isinstance(data,list):
  if all(isinstance(v,(int,float)) for v in data):return html.escape(', '.join(map(str,data)))
  return '<ol>'+''.join('<li>'+tree(v)+'</li>' for v in data)+'</ol>'
 if isinstance(data,dict):
  return '<dl>'+''.join('<dt>'+html.escape(str(key))+'</dt><dd>'+tree(value)+'</dd>' for key,value in data.items())+'</dl>'
 text=str(data)
 if text.startswith(('http://','https://')) and not any(c.isspace() for c in text):
  return '<a href="'+html.escape(text,quote=True)+'" target="_blank" rel="noopener">'+html.escape(text)+'</a>'
 return html.escape(text)
def content():
 parts=[];metadata=[]
 for category,files in sources.items():
  group=[]
  for f in files:
   p=root/f
   if not p.is_file():continue
   raw=p.read_text()
   if p.suffix=='.json':
    rec=json.loads(raw);view=tree(rec)
   else:
    rec=None
    safe=html.escape(raw)
    view='<pre>'+re.sub(r'\[([^\]]+)\]\((https?://[^\s]+?)\)',r'<a href="\2" target="_blank" rel="noopener">\1</a>',safe)+'</pre>'
   group.append('<details><summary>'+html.escape(p.stem)+'</summary>'+view+'</details>')
   if category not in ['实地摄影与公开三维扫描','外围建筑研究数据']:
    metadata.append(category+' / '+(json.dumps(rec,ensure_ascii=False,separators=(',',':')) if rec else ' '.join(raw.splitlines())))
  parts.append('<section><h2>'+category+'</h2>'+''.join(group)+'</section>')
 head='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>京观 · 数据与素材署名</title><style>
 *{box-sizing:border-box}body{margin:auto;max-width:1000px;padding:40px min(5vw,50px);background:#f1eee6;color:#26332e;font:15px/1.65 system-ui,"Microsoft YaHei",sans-serif}h1,h2{font-family:"Noto Serif CJK SC",SimSun,serif}h1{font-size:36px}h2{margin-top:30px;font-size:21px}small,a{color:#506148}summary{cursor:pointer;padding:8px 3px}details{border-top:1px solid #aeb6a6}dl,ol{margin:3px 0 10px}dt{font:12px/1.5 monospace;color:#716e5e;margin-top:5px}dd{margin:0 0 6px 12px}a,dd,pre{overflow-wrap:anywhere}pre{white-space:pre-wrap;font:inherit}a:focus-visible,summary:focus-visible{outline:2px solid #a74833}</style>
 <a href="../index.html">← 北京城市空间展</a><h1>数据与素材署名</h1><p>城市轮廓及路网 © OpenStreetMap contributors，按 ODbL 分发。地表使用 EOX Sentinel‑2 cloudless，含修改后的 2016、2017 年 Copernicus Sentinel 影像。逐项来源、作者、许可及加工说明收录如下。摄影作品与摄影测量模型保留原作者署名。</p>'''
 (root/'exhibit/credits.html').write_text(head+''.join(parts)+'</html>')
 return '\n'.join(metadata)
def slate(dest):
 im=Image.open(root/'exhibit/palace.webp').convert('RGB').resize((1920,1080)).filter(ImageFilter.GaussianBlur(4)).convert('RGBA')
 layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer)
 for x in range(im.width):
  a=int(239-29*(x/im.width)**2);d.line((x,0,x,1080),fill=(18,29,25,a))
 im=Image.alpha_composite(im,layer);g=ImageDraw.Draw(im)
 fontroot='/usr/share/fonts/opentype/noto/'
 def font(size,serif=False):return ImageFont.truetype(fontroot+('NotoSerifCJK-Regular.ttc' if serif else 'NotoSansCJK-Regular.ttc'),size,index=2)
 gold=(217,187,140);paper=(241,237,220);sub=(198,205,191)
 g.text((132,100),'京 观     /     BEIJING SPATIAL ATLAS',font=font(24),fill=gold)
 g.text((126,155),'数据与影像',font=font(73,True),fill=paper)
 g.line((135,292,1784,292),fill=(102,112,94),width=1)
 rows=[('城市几何','© OpenStreetMap contributors     ·     Open Database License 1.0'),('地表影像','Sentinel‑2 cloudless — EOX IT Services GmbH     ·     CC BY 4.0'),('','Contains modified Copernicus Sentinel data 2016 & 2017.'),('纹理与实景','Wikimedia Commons 摄影贡献者     ·     ambientCG     ·     Poly Haven'),('建筑参考','故宫博物院、建筑设计机构及公开地图资料')]
 for i,(tag,value) in enumerate(rows):
  y=344+81*i;g.text((135,y),tag,font=font(23),fill=gold);g.text((365,y-2),value,font=font(28),fill=paper)
 g.text((135,833),'各项摄影保留原作者与许可。详细署名、改动和原作链接见影片元数据及展览「数据与素材署名」。',font=font(23),fill=sub)
 g.text((135,894),'三维重建与模拟光照     /     Three.js · Blender Cycles',font=font(22),fill=sub)
 im.convert('RGB').save(dest)
if __name__=='__main__':
 detail=content()
 if len(sys.argv)>1:Path(sys.argv[1]).write_text(detail)
 if len(sys.argv)>2:slate(Path(sys.argv[2]))
