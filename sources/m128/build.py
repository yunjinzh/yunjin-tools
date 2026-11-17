import json,math,pathlib,hashlib
root=pathlib.Path(__file__).parent
manifest=[];data={}
def line(seq):
 if len(seq)<=5:return seq
 out=[seq[0]]
 for p in seq[1:-1]:
  q=out[-1]
  if abs(p[0]-q[0])>180 or math.hypot((p[0]-q[0])*math.cos(math.radians(p[1])),p[1]-q[1])>=.35:out.append(p)
 out.append(seq[-1])
 return out if len(out)>=4 else seq

def coords(c):
 if isinstance(c[0][0],(int,float)):return [[round(a,3),round(b,3)] for a,b,*_ in line(c)]
 return [coords(x) for x in c]
for t in range(0,251,10):
 data[t]={}
 for k in ['coast','plates','bounds']:
  p=root/'data'/f'{k}_{t}.json';raw=p.read_bytes();x=json.loads(raw)
  assert x['features']
  manifest.append({'file':p.name,'sha256':hashlib.sha256(raw).hexdigest(),'features':len(x['features']),'time_Ma':t,'model':'MULLER2019'})
  for f in x['features']:f['geometry']['coordinates']=coords(f['geometry']['coordinates'])
  data[t][k]=x
(root/'data-manifest.json').write_text(json.dumps(manifest,indent=2))
text=(root/'template.html').read_text().replace('__REPORT__',(root/'report.html').read_text()).replace('__D3__',(root/'d3.min.js').read_text()).replace('__DATA__',json.dumps(data,separators=(',',':')))
(root/'dist'/'index.html').write_text(text)
print('HTML bytes',len(text.encode()),'Frames',len(data),'Responses',len(manifest))
