"""Blender 4.3 / Cycles exhibition master. Reads original Three.js buffers.
Usage: blender -b -t 6 -P tools/exhibition/render.py -- DIRECTORY WIDTH SAMPLES KEYS
"""
import bpy, sys, json, math, pathlib, numpy as np
from mathutils import Vector, Matrix
from math import sin, cos, pi
folder=pathlib.Path(sys.argv[sys.argv.index('--')+1]); width,samples,count=map(int,sys.argv[sys.argv.index('--')+2:sys.argv.index('--')+5])
still='--still' in sys.argv[sys.argv.index('--')+5:]
config=json.loads((folder/'manifest.json').read_text()); shot=config['shot']; base=pathlib.Path(config['base'])
bpy.ops.wm.read_factory_settings(use_empty=True); scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=samples;scene.cycles.use_denoising=False
scene.cycles.max_bounces=5;scene.cycles.diffuse_bounces=2;scene.cycles.glossy_bounces=3;scene.cycles.transparent_max_bounces=36 if shot['id'] in ('waterfront','hutong') else 16
scene.cycles.use_adaptive_sampling=True;scene.cycles.sample_clamp_indirect=3
scene.render.use_persistent_data=True;scene.render.resolution_x=width;scene.render.resolution_y=round(width*9/16);scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
light=shot.get('light',{})
scene.view_settings.exposure=light.get('exposure',.25)
cx,cz=config['center']['x'],config['center']['z']
axis=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
to_center=Matrix.Translation((-cx,cz,0));axis_inv=axis.inverted()
blob=np.memmap(folder/'geometry.bin',mode='r',dtype='uint8')
def array(ref,dtype=np.float32):
 return np.frombuffer(blob,dtype,count=ref[1],offset=ref[0])
def mesh_from(name,p,tri):
 mesh=bpy.data.meshes.new(name)
 mesh.vertices.add(len(p));mesh.vertices.foreach_set('co',np.ascontiguousarray(p,np.float32).ravel())
 mesh.loops.add(tri.size);mesh.loops.foreach_set('vertex_index',np.ascontiguousarray(tri,np.int32).ravel())
 mesh.polygons.add(len(tri));mesh.polygons.foreach_set('loop_start',np.arange(0,tri.size,3,dtype=np.int32))
 mesh.update(calc_edges=True);return mesh
def teximage(nodes,file):
 node=nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(file),check_existing=True);node.interpolation='Linear';return node
def newmat(name):
 m=bpy.data.materials.new(name);m.use_nodes=True
 return m,m.node_tree.nodes,m.node_tree.links,m.node_tree.nodes.get('Principled BSDF')
def multiply(nodes,links,a,b):
 n=nodes.new('ShaderNodeMixRGB');n.blend_type='MULTIPLY';n.inputs[0].default_value=1
 for i,v in ((1,a),(2,b)):
  if hasattr(v,'is_output'):links.new(v,n.inputs[i])
  else:n.inputs[i].default_value=(*v,1)
 return n.outputs[0]
def setup_mat(info):
 m,n,l,bs=newmat(info['name']);col=info['color'];file=info.get('src');name=(info['name']+' '+(file or '')).lower();layer=info['layer'];base_color=bs.inputs['Base Color'];rough,metal=info['rough'],info['metal']
 bs.inputs['Base Color'].default_value=(*col,1);color=col
 if info['vertices']:
  attr=n.new('ShaderNodeVertexColor');attr.layer_name='pigment'
  color=attr.outputs['Color'] if np.allclose(col,1) else multiply(n,l,attr.outputs[0],col)
 if file and pathlib.Path(file).is_file():
  tex=teximage(n,file)
  if info['repeat']!=[1,1] or info['shift']!=[0,0]:
   uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(*info['repeat'],1);mapping.inputs['Location'].default_value=(*info['shift'],0);l.new(uv.outputs['UV'],mapping.inputs['Vector']);l.new(mapping.outputs[0],tex.inputs[0])
  color=tex.outputs[0] if not info['vertices'] and np.allclose(col,1) else multiply(n,l,tex.outputs[0],color)
  if info['alpha'] or info.get('transparent',False):l.new(tex.outputs['Alpha'],bs.inputs['Alpha'])
 if hasattr(color,'is_output'):l.new(color,base_color)
 if 'glass' in name or 'glaz' in name or (layer=='zun' and info['vertices']):
  rough=min(.18,rough);metal=max(.46,metal);bs.inputs['Coat Weight'].default_value=.25
 if layer=='water':
  rough=.10;metal=.28;bs.inputs['Base Color'].default_value=(.027,.093,.084,1)
  for link in list(base_color.links):l.remove(link)
  bs.inputs['IOR'].default_value=1.333;bs.inputs['Coat Weight'].default_value=.53;bs.inputs['Coat Roughness'].default_value=.085
 weathering=layer in ('roads','plazas','water') or (file and not info['alpha'] and not layer=='imagery')
 if weathering:
  geo=n.new('ShaderNodeNewGeometry');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2.7 if layer=='water' else 19;noise.inputs['Detail'].default_value=3
  l.new(geo.outputs['Position'],noise.inputs['Vector'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.20 if layer=='water' else .11;bump.inputs['Distance'].default_value=.042 if layer=='water' else .017;l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],bs.inputs['Normal'])
 bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 return m
mats=[setup_mat(info) for info in config['materials']]
def instantiate(name,mesh,matrix):
 obj=bpy.data.objects.new(name,mesh);scene.collection.objects.link(obj)
 mat=Matrix(np.asarray(matrix).reshape(4,4).T.tolist());obj.matrix_world=to_center@axis@mat@axis_inv
 return obj
cache={}
for row in config['objects']:
 k=(row['positions'][0],tuple(row['materials']))
 mesh=cache.get(k)
 if mesh is None:
  p=array(row['positions']).reshape(-1,3);pos=np.column_stack([p[:,0],-p[:,2],p[:,1]])
  tri=array(row['indices'],np.uint32).reshape(-1,3);mesh=mesh_from(row['name'],pos,tri)
  for mid in row['materials']:mesh.materials.append(mats[mid])
  if row.get('faceMaterials'):mesh.polygons.foreach_set('material_index',array(row['faceMaterials'],np.int32))
  if row.get('groups'):
   mi=np.zeros(len(tri),np.int32)
   for g in row['groups']:mi[g['start']//3:(g['start']+g['count'])//3]=g['materialIndex']
   mesh.polygons.foreach_set('material_index',mi)
  if row['uv']:
   uv=mesh.uv_layers.new(name='surface');val=array(row['uv']).reshape(-1,2)[tri.ravel()]
   uv.data.foreach_set('uv',np.ascontiguousarray(val).ravel())
  if row['colors']:
   colors=array(row['colors']).reshape(-1,3);attr=mesh.color_attributes.new(name='pigment',type='FLOAT_COLOR',domain='POINT')
   attr.data.foreach_set('color',np.column_stack((colors,np.ones(len(colors),np.float32))).ravel())
  cache[k]=mesh
 for mat in row['instances'] or [row['matrix']]:instantiate(row['name'],mesh,mat)
# Region relief and imagery, aligned by the same WGS84 projection as the interactive scene.
terr=json.loads((base/'terrain-data/manifest.json').read_text());stride=2;w,s,e,north=terr['bounds']
xs=np.linspace(w,e,terr['cols'])[::stride];merc=lambda d:np.arcsinh(np.tan(np.deg2rad(d)))
lats=np.rad2deg(np.arctan(np.sinh(np.linspace(merc(north),merc(s),terr['rows']))))[::stride]
xx,yy=np.meshgrid((xs-116.407)*85359.2,(lats-39.925)*111033.1)
dem=np.fromfile(base/'terrain-data/height.i16',dtype='<i2').reshape(terr['rows'],terr['cols'])[::stride,::stride].astype('f')
outside=np.maximum.reduce([116.35-np.broadcast_to(xs,xx.shape),np.broadcast_to(xs,xx.shape)-116.498,(39.86-np.broadcast_to(lats[:,None],xx.shape)),np.broadcast_to(lats[:,None],xx.shape)-40.015,np.zeros(xx.shape)])
h=(dem-terr['localReferenceElevation']-(xx**2+yy**2)/12742017)*np.minimum(1,outside/.045)-13
nr,nc=xx.shape;ids=np.arange(nr*nc).reshape(nr,nc);a=ids[:-1,:-1].ravel();b=a+1;c=a+nc;d=c+1
poly=np.concatenate([np.array([a,c,b]).T,np.array([b,c,d]).T]);p=np.stack([xx-cx,yy+cz,h],axis=-1).reshape(-1,3)
mesh=mesh_from('北京区域 DEM',p,poly);gm,gn,gl,gb=newmat('Sentinel regional mosaic');tex=teximage(gn,base/'terrain-data/beijing-region.webp');gl.new(tex.outputs[0],gb.inputs[0]);gb.inputs['Roughness'].default_value=1
mesh.materials.append(gm);UV=np.stack(np.meshgrid(np.linspace(0,1,nc),np.linspace(1,0,nr)),axis=-1).reshape(-1,2);mesh.uv_layers.new().data.foreach_set('uv',np.ascontiguousarray(UV[poly.ravel()],np.float32).ravel());obj=bpy.data.objects.new('西山与燕山',mesh);scene.collection.objects.link(obj)
# A photographic upper hemisphere provides skylight and architectural reflections.
world=bpy.data.worlds.new('北京日照 · 摄影环境');world.use_nodes=True;scene.world=world
wn=world.node_tree.nodes;wl=world.node_tree.links;bg=wn.get('Background');bg.inputs[1].default_value=light.get('world',.82)
photo=wn.new('ShaderNodeTexEnvironment');envfile=folder.parent/('sky-'+shot['id']+'.jpg')
photo.image=bpy.data.images.load(str(envfile));coord=wn.new('ShaderNodeTexCoord');mapping=wn.new('ShaderNodeMapping')
hour=int(shot['time'][:2])+int(shot['time'][3:])/60;lat=math.radians(39.92);ha=math.radians((hour-12)*15+116.40-120+1.7);dec=.008
sun_dir=Vector((-cos(dec)*sin(ha),cos(lat)*sin(dec)-sin(lat)*cos(dec)*cos(ha),sin(lat)*sin(dec)+cos(lat)*cos(dec)*cos(ha))).normalized()
mapping.inputs['Rotation'].default_value.z=math.atan2(sun_dir.y,sun_dir.x)+pi;wl.new(coord.outputs['Generated'],mapping.inputs[0]);wl.new(mapping.outputs[0],photo.inputs[0]);wl.new(photo.outputs[0],bg.inputs[0])
solar=bpy.data.lights.new('模拟日照','SUN');solar.energy=light.get('sun',2.4);solar.angle=math.radians(1.25);solar.color=light.get('sunColor',(1,.85,.68) if hour>15 else (1,.94,.84))
obj=bpy.data.objects.new('模拟日照',solar);scene.collection.objects.link(obj);obj.rotation_euler=(-sun_dir).to_track_quat('-Z','Y').to_euler()
camera=bpy.data.cameras.new('展映摄影机');cam=bpy.data.objects.new('展映摄影机',camera);scene.collection.objects.link(cam);scene.camera=cam
camera.clip_start=.13;camera.clip_end=155000;camera.sensor_fit='HORIZONTAL';camera.angle=math.radians(shot['fov'])
scene.view_layers[0].use_pass_z=True;scene.use_nodes=True;cn=scene.node_tree.nodes;cl=scene.node_tree.links;cn.clear()
rl=cn.new('CompositorNodeRLayers');comp=cn.new('CompositorNodeComposite')
# A short-distance aerial perspective ties distant geometry to the photographically lit sky.
depth=rl.outputs['Depth'];fog=cn.new('CompositorNodeMath');fog.operation='MULTIPLY';fog.inputs[1].default_value=light.get('haze',.00012);cl.new(depth,fog.inputs[0]);limited=cn.new('CompositorNodeMath');limited.operation='MINIMUM';limited.inputs[1].default_value=.52;cl.new(fog.outputs[0],limited.inputs[0])
skyMask=cn.new('CompositorNodeMath');skyMask.operation='LESS_THAN';skyMask.inputs[1].default_value=140000;cl.new(depth,skyMask.inputs[0]);factor=cn.new('CompositorNodeMath');factor.operation='MULTIPLY';cl.new(limited.outputs[0],factor.inputs[0]);cl.new(skyMask.outputs[0],factor.inputs[1]);mix=cn.new('CompositorNodeMixRGB');cl.new(factor.outputs[0],mix.inputs[0]);cl.new(rl.outputs['Image'],mix.inputs[1]);mix.inputs[2].default_value=(.39,.50,.54,1);cl.new(mix.outputs[0],comp.inputs[0])
# Export true foreground camera distance, not a grayscale approximation.
if not still:
 fileout=cn.new('CompositorNodeOutputFile');fileout.base_path=str(folder);fileout.format.file_format='OPEN_EXR';fileout.format.color_depth='32';fileout.format.color_mode='RGB';fileout.file_slots[0].path='depth-';cl.new(depth,fileout.inputs[0])
def blender_xyz(p):return Vector((p[0],-p[2],p[1]))
matrices=[]
for key in range(count):
 f=.5 if still else key/max(1,count-1);eye=blender_xyz(shot['eye']).lerp(blender_xyz(shot['endEye']),f);at=blender_xyz(shot['at']).lerp(blender_xyz(shot['endAt']),f)
 cam.location=eye;cam.rotation_euler=(at-eye).to_track_quat('-Z','Y').to_euler();scene.frame_set(key+1);bpy.context.view_layer.update()
 out=folder/('master.png' if still else f'frame-{key:02}.png');scene.render.filepath=str(out);bpy.ops.render.render(write_still=True)
 if still:
  print('STILL',shot['id'],flush=True);continue
 zfile=folder/f'depth-{key+1:04}.exr';image=bpy.data.images.load(str(zfile),check_existing=False);raw=np.empty(image.size[0]*image.size[1]*4,np.float32);image.pixels.foreach_get(raw)
 np.ascontiguousarray(raw.reshape(image.size[1],image.size[0],4)[::-1,:,0]).tofile(folder/f'frame-{key:02}.z');bpy.data.images.remove(image);zfile.unlink()
 m=np.asarray(cam.matrix_world);matrices.append({'eye':list(eye),'right':m[:3,0].tolist(),'down':(-m[:3,1]).tolist(),'forward':(-m[:3,2]).tolist()})
 (folder/'cameras.json').write_text(json.dumps({'width':width,'height':scene.render.resolution_y,'fov':shot['fov'],'poses':matrices,'shot':shot}))
 print('KEYFRAME',shot['id'],key,flush=True)
