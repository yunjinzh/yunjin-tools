import json, math, io, urllib.request, urllib.parse, concurrent.futures, time
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'dist'
CACHE=Path('/workspace/scratch/a3584c9c3000/terrain-cache');CACHE.mkdir(exist_ok=True)

def get(url):
 for trial in range(3):
  try:return urllib.request.urlopen(url,timeout=50).read()
  except Exception:
   if trial==2:raise

def tiff_grid(blob):
 im=Image.open(io.BytesIO(blob));a=np.array(im).copy();tags=im.tag_v2
 if tags.get(259)!=1 or im.mode!='F':raise ValueError('Unexpected raster encoding')
 tw,th=tags[322],tags[323];n=math.ceil(im.width/tw)
 for k,(offset,count) in enumerate(zip(tags[324],tags[325])):
  if not offset or not count:a[(k//n)*th:(k//n+1)*th,(k%n)*tw:(k%n+1)*tw]=-9999
 a[(a<0)|(a>1e7)|~np.isfinite(a)]=-9999
 return a

def build(name,bbox,w,h,z):
 minx,miny,maxx,maxy=bbox
 params=dict(bbox=','.join(map(str,bbox)),bboxSR=4326,imageSR=4326,size=f'{w},{h}',format='tiff',pixelType='F32',noData=-9999,interpolation='RSP_BilinearInterpolation',time='1577836800000',renderingRule=json.dumps({'rasterFunction':'None'}),adjustAspectRatio='false',f='image')
 u='https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer/exportImage?'+urllib.parse.urlencode(params)
 pop=tiff_grid(get(u));print(name,'population',float(pop.max()),flush=True)
 lons=minx+(np.arange(w)+.5)*(maxx-minx)/w;lats=maxy-(np.arange(h)+.5)*(maxy-miny)/h
 tx=(lons+180)/360*2**z;ty=(1-np.arcsinh(np.tan(lats*np.pi/180))/np.pi)/2*2**z
 keys=[(x,y) for y in range(int(ty.min()),int(ty.max())+1) for x in range(int(tx.min()),int(tx.max())+1)]
 def tile(k):
  x,y=k;p=CACHE/f'{z}-{x}-{y}.png'
  if not p.exists():p.write_bytes(get(f'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png'))
  rgb=np.array(Image.open(p).convert('RGB')).astype(float)
  return k,rgb[:,:,0]*256+rgb[:,:,1]+rgb[:,:,2]/256-32768
 tiles=dict(concurrent.futures.ThreadPoolExecutor(6).map(tile,keys));dem=np.zeros((h,w))
 for j in range(h):
  for i in range(w):dem[j,i]=tiles[(int(tx[i]),int(ty[j]))][min(255,int(ty[j]%1*256)),min(255,int(tx[i]%1*256))]
 out=dict(id=name,bbox=bbox,width=w,height=h,year=2020,demZoom=z,dem=np.round(dem,1).ravel().tolist(),pop=[round(float(v),2) for v in pop.ravel()],resolution='1km',source='Mapzen Terrain Tiles / WorldPop Population Density 1km',retrieved='2026-11-03')
 (ROOT/'data'/f'{name}-grid.json').write_text(json.dumps(out,separators=(',',':')))
 print(name,'saved',w,h,'tiles',len(keys),flush=True)

if __name__=='__main__':
 world=json.loads(get('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'));keep=['AUS','JPN','GBR','USA','BRA','IND','FRA','DEU','ITA','CAN','IDN','NZL','ESP','ZAF','EGY','CHL','MEX','ARG','THA','VNM','NPL','KOR']
 world['features']=[dict(type='Feature',properties={'code':f['properties']['ADM0_A3'],'name':f['properties']['NAME_ZH'],'name_en':f['properties']['NAME_EN']},geometry=f['geometry']) for f in world['features'] if f['properties']['ADM0_A3'] in keep]
 # France's mainland only; USA lower 48; exclude overseas territory in these display presets.
 for f in world['features']:
  if f['properties']['code'] in ['USA','FRA'] and f['geometry']['type']=='MultiPolygon':
   f['geometry']['coordinates']=[p for p in f['geometry']['coordinates'] if ((-126<p[0][0][0]<-66 and 24<p[0][0][1]<50) if f['properties']['code']=='USA' else (-6<p[0][0][0]<10 and 40<p[0][0][1]<52))]
 (ROOT/'data/world.json').write_text(json.dumps(world,separators=(',',':'),ensure_ascii=False))
 build('china',[73,18,135.5,54],768,512,5)
 build('australia',[112,-44,154,-10],640,512,5)
 for args in [('taiwan',[119.2,21.8,122.1,25.5],160,200,8),('hongkong',[113.8,22.12,114.48,22.6],192,144,10),('macao',[113.51,22.1,113.61,22.23],144,192,12)]:build(*args)
