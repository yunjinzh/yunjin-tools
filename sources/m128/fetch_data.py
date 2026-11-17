import json,urllib.request,concurrent.futures,pathlib,time,hashlib
root=pathlib.Path(__file__).parent
jobs=[(t,k) for t in range(0,251,10) for k in ['coast','plates','bounds']]
end={'coast':'reconstruct/coastlines/','plates':'topology/plate_polygons/','bounds':'topology/plate_boundaries/'}
def run(j):
 t,k=j;p=root/'data'/f'{k}_{t}.json'
 if p.exists():return
 url=f'https://gws.gplates.org/{end[k]}?time={t}&model=MULLER2019'
 for attempt in range(3):
  try:
   raw=urllib.request.urlopen(url,timeout=90).read();x=json.loads(raw)
   assert x['type']=='FeatureCollection' and len(x['features'])>0
   p.write_bytes(raw);return
  except Exception as e:
   if attempt==2:print('FAILED',j,str(e),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as e:list(e.map(run,jobs))
print('FILES',len(list((root/'data').glob('*.json'))),flush=True)
