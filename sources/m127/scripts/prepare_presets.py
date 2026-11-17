"""Acquire real 2020 regional rasters; these are offline snapshots, not synthetic data."""
import json,math,sys,concurrent.futures,time
from pathlib import Path
from prepare_data import build,ROOT

def bounds(coords):
 if isinstance(coords[0],(int,float)):return coords[0],coords[1],coords[0],coords[1]
 bs=[bounds(a) for a in coords];return min(a[0] for a in bs),min(a[1] for a in bs),max(a[2] for a in bs),max(a[3] for a in bs)
def task(item):
 key,feature=item;path=ROOT/'data'/f'{key}-grid.json'
 if path.exists():return key,'cached'
 b=list(bounds(feature['geometry']['coordinates']));dx=(b[2]-b[0])*.02+.008;dy=(b[3]-b[1])*.02+.008;b=[max(-180,b[0]-dx),max(-85,b[1]-dy),min(180,b[2]+dx),min(85,b[3]+dy)]
 aspect=(b[2]-b[0])*math.cos((b[1]+b[3])/2*math.pi/180)/(b[3]-b[1]);w=512 if aspect>=1 else max(192,round(512*aspect));h=max(192,round(512/aspect)) if aspect>=1 else 512
 z=max(2,min(12,math.ceil(math.log2(w/((b[2]-b[0])/360*256)))))
 try:
  build(key,b,w,h,z)
  d=json.loads(path.read_text());d['dem']=[round(x,1) for x in d['dem']];d['snapshot']=True;d['resolution']='1km';d['regionKey']=key;path.write_text(json.dumps(d,separators=(',',':')))
  return key,'ok'
 except Exception as e:return key,str(e)
world=json.loads((ROOT/'data/world.json').read_text());china=json.loads((ROOT/'data/china.json').read_text())
items=[('country-'+f['properties']['code'],f) for f in world['features'] if f['properties']['code']!='AUS']+ [('cn-'+str(f['properties']['adcode']),f) for f in china['features'] if isinstance(f['properties']['adcode'],int)]
results=[]
with concurrent.futures.ThreadPoolExecutor(3) as pool:
 for result in pool.map(task,items):results.append(result);print('RESULT',result,flush=True)
manifest={key:{'path':f'data/{key}-grid.json','year':2020,'resolution':'1km'} for key,status in results if status in ('ok','cached')}
manifest.update({'CHN':{'path':'data/china-grid.json','year':2020,'resolution':'1km'},'AUS':{'path':'data/australia-grid.json','year':2020,'resolution':'1km'}})
for meta in manifest.values():
 grid=json.loads((ROOT/meta['path']).read_text())
 meta.update({k:grid[k] for k in ('bbox','width','height')})
(ROOT/'data/preset-manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
fail=[r for r in results if r[1] not in ('ok','cached')];print('FINISHED',len(results),'FAIL',fail,flush=True)
if fail:sys.exit(1)
