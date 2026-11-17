"""Prepare attributed Unitree meshes and Poly Haven CC0 materials for static hosting."""
from pathlib import Path
import concurrent.futures as cf
import urllib.request,xml.etree.ElementTree as ET,json,struct,hashlib,shutil,tempfile,os
from datetime import date
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(os.environ.get('EMBODIED_ASSET_CACHE',str(Path(tempfile.gettempdir())/'embodied-studio-visual-assets')))
OUT=ROOT/'dist/assets'
(OUT/'robot').mkdir(parents=True,exist_ok=True)
BASE='https://raw.githubusercontent.com/unitreerobotics/unitree_ros/master/'
CACHE.mkdir(parents=True,exist_ok=True)
def fetch(url,path):
 path.parent.mkdir(parents=True,exist_ok=True)
 if not path.exists():
  req=urllib.request.Request(url,headers={'User-Agent':'EmbodiedStudioAssetPreparation/1.1'})
  with urllib.request.urlopen(req,timeout=50) as r:path.write_bytes(r.read())
 return path
urdf=fetch(BASE+'robots/g1_description/g1_29dof.urdf',CACHE/'g1_29dof.urdf')
r=ET.parse(urdf).getroot()
meshfiles=sorted(set(m.attrib['filename'] for m in r.findall('.//visual/geometry/mesh')))
with cf.ThreadPoolExecutor(max_workers=6) as pool:
 jobs={pool.submit(fetch,BASE+'robots/g1_description/'+m,CACHE/m):m for m in meshfiles}
 for f in cf.as_completed(jobs):
  p=f.result();print('mesh',p.name,p.stat().st_size,flush=True)
blob=bytearray();geos={};manifest=[]
for m in meshfiles:
 b=(CACHE/m).read_bytes();n=struct.unpack_from('<I',b,80)[0]
 if len(b)!=84+n*50:raise ValueError('Expected binary STL '+m)
 a=np.frombuffer(b,dtype=np.dtype([('normal','<f4',(3,)),('v','<f4',(3,3)),('attr','<u2')]),count=n,offset=84)
 v,inv=np.unique(np.round(a['v'].reshape(-1,3),6),axis=0,return_inverse=True)
 faces=inv.reshape(-1,3)
 # Smooth CAD tessellation by accumulating area-weighted surface normals.
 cross=np.cross(v[faces[:,1]]-v[faces[:,0]],v[faces[:,2]]-v[faces[:,0]])
 normals=np.zeros_like(v)
 for c in range(3):np.add.at(normals,faces[:,c],cross)
 lengths=np.linalg.norm(normals,axis=1);normals/=np.maximum(lengths[:,None],1e-12)
 mn=v.min(0);mx=v.max(0);ext=np.maximum(mx-mn,1e-8)
 quant=np.round((v-mn)/ext*65535).astype('<u2');nquant=np.round(normals*32767).astype('<i2')
 ind=faces.astype('<u2' if len(v)<=65535 else '<u4')
 def part(data):
  while len(blob)%4:blob.append(0)
  start=len(blob);blob.extend(data.tobytes());return start
 geos[m]={'p':part(quant),'n':part(nquant),'i':part(ind),'vertices':len(v),'indices':ind.size,'indexBytes':ind.itemsize,'min':mn.tolist(),'max':mx.tolist()}
 manifest.append({'path':m,'sha256':hashlib.sha256(b).hexdigest(),'triangles':n,'vertices':len(v)})
 print('packed',Path(m).name,len(v),n,flush=True)
def vec(e,attr,default):return [float(x) for x in e.attrib.get(attr,default).split()] if e is not None else [float(x) for x in default.split()]
links=[]
for l in r.findall('link'):
 vs=[]
 for v in l.findall('visual'):
  mesh=v.find('geometry/mesh')
  if mesh is None:continue
  org=v.find('origin');mat=v.find('material');vs.append({'mesh':mesh.attrib['filename'],'xyz':vec(org,'xyz','0 0 0'),'rpy':vec(org,'rpy','0 0 0'),'scale':vec(mesh,'scale','1 1 1'),'material':mat.attrib.get('name','white') if mat is not None else 'white'})
 links.append({'name':l.attrib['name'],'visuals':vs})
joints=[]
for j in r.findall('joint'):
 org=j.find('origin');lim=j.find('limit');joints.append({'name':j.attrib['name'],'type':j.attrib['type'],'parent':j.find('parent').attrib['link'],'child':j.find('child').attrib['link'],'xyz':vec(org,'xyz','0 0 0'),'rpy':vec(org,'rpy','0 0 0'),'axis':vec(j.find('axis'),'xyz','1 0 0'),'min':float(lim.attrib.get('lower',-3.14)) if lim is not None else 0,'max':float(lim.attrib.get('upper',3.14)) if lim is not None else 0})
meta={'model':'Unitree G1','source':'https://github.com/unitreerobotics/unitree_ros/tree/master/robots/g1_description','retrieved':date.today().isoformat(),'license':'BSD-3-Clause','root':'pelvis','geometries':geos,'links':links,'joints':joints,'sourceFiles':manifest}
(OUT/'robot/g1.json').write_text(json.dumps(meta,separators=(',',':')))
(OUT/'robot/g1.bin').write_bytes(blob)
shutil.copy(urdf,OUT/'robot/g1_29dof.urdf')
shutil.copy(fetch(BASE+'LICENSE',CACHE/'UNITREE-LICENSE.txt'),OUT/'robot/UNITREE-LICENSE.txt')
texture_jobs=[]
for asset in ['concrete_floor_02','wood_floor_worn']:
 for channel in ['diff','nor_gl','rough']:
  name=f'{asset}_{channel}_1k.jpg';url=f'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{asset}/{name}'
  texture_jobs.append((url,OUT/'textures'/name))
texture_jobs.append(('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',OUT/'environment/studio_small_09_1k.hdr'))
with cf.ThreadPoolExecutor(max_workers=5) as pool:
 for p in pool.map(lambda job:fetch(*job),texture_jobs):print('texture',p.name,p.stat().st_size,flush=True)
print(json.dumps({'robot_bytes':len(blob),'meshes':len(geos),'triangles':sum(x['triangles'] for x in manifest),'vertices':sum(x['vertices'] for x in manifest)}),flush=True)
