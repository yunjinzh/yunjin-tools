from pathlib import Path
import json,sys,zipfile,gzip,base64
root=Path(__file__).resolve().parents[1];dist=root/'dist';out=Path(sys.argv[1]) if len(sys.argv)>1 else dist
out.mkdir(parents=True,exist_ok=True)
datasets=sorted((dist/'data').rglob('*.json'))
packed={str(p.relative_to(dist)):base64.b64encode(gzip.compress(p.read_bytes(),compresslevel=9,mtime=0)).decode('ascii') for p in datasets}
s=(dist/'index.html').read_text();s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+(dist/'style.css').read_text()+'</style>')
inline='<script>window.RIDGE_PACKED='+json.dumps(packed,separators=(',',':'))+';</script>'
s=s.replace('<script src="core.js"></script>',inline+'<script>'+(dist/'core.js').read_text()+'</script>')
for name in ['data-access.js','app.js','offline-download.js']:
 s=s.replace('<script src="'+name+'"></script>','<script>'+(dist/name).read_text()+'</script>')
# Already a local HTML; offer current file as the local download.
s=s.replace('href="ridge-atlas.html" download="山川人海_本地工作台.html"','href="" download="山川人海_本地工作台.html"')
payload=s.encode('utf-8')
parts=dist/'offline';parts.mkdir(exist_ok=True)
paths=[]
for i,start in enumerate(range(0,len(payload),12*1024*1024)):
 p=parts/f'part-{i}.bin';p.write_bytes(payload[start:start+12*1024*1024]);paths.append(str(p.relative_to(dist)))
(parts/'manifest.json').write_text(json.dumps({'bytes':len(payload),'parts':paths}))
# Each hosted asset stays below 25 MiB; the browser reconstructs the same single file.
(dist/'ridge-atlas.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山川人海 · 下载本地工具</title><link rel="stylesheet" href="style.css"><body style="padding:8vw"><h1>山川人海 · 本地工作台</h1><p>含全部预设国家及中国 34 个省级行政区的 2020 年真实数据。下载后用新版 Chrome 或 Edge 打开。</p><button id="downloadLocal" class="primary">下载本地单文件 HTML ↓</button><p id="downloadStatus" role="status"></p><a href="./">返回在线制图工作台</a><script src="data-access.js"></script><script src="offline-download.js"></script></body></html>''')
if out!=dist:
 (out/'山川人海_本地工作台.html').write_text(s)
 with zipfile.ZipFile(out/'山川人海_本地工具包.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  z.write(out/'山川人海_本地工作台.html','山川人海_本地工作台.html');z.write(root/'README.md','使用说明.md')
print(json.dumps({'html_bytes':len(s.encode()),'datasets':len(packed),'destination':str(out)},ensure_ascii=False))
