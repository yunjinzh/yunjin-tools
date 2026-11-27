// Export the very same Three.js meshes, local imagery, and material UV transforms
// used by the interactive atlas, preserving the east/up/south geographic frame.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import * as T from 'three';
const base=fileURLToPath(new URL('../../dist/',import.meta.url));
const dest=path.resolve(process.argv[2]), chapters=JSON.parse(await fs.readFile(new URL('../../dist/exhibit/chapters.json',import.meta.url)));
const shot=chapters.find(row=>row.id===process.argv[3]); if(!shot)throw Error('Unknown chapter');
await fs.mkdir(dest,{recursive:true});
const req=createRequire(import.meta.url),skia=req(req.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const skyfile=path.join(path.dirname(dest),'sky-'+shot.id+'.jpg');
try{await fs.access(skyfile);}catch{
 const sky=skia.createCanvas(2048,1024),ctx=sky.getContext('2d');
 ctx.fillStyle='#505048';ctx.fillRect(0,0,2048,1024);
 const preset=['hutong','cbd'].includes(shot.id)?'midday':'late';
 ctx.drawImage(await skia.loadImage(path.join(base,'heritage','sky-'+preset+'.webp')),0,0,2048,512);
 await fs.writeFile(skyfile,sky.toBuffer('image/jpeg',94));
}
globalThis.document={createElement:tag=>tag==='canvas'?skia.createCanvas(2,2):null};
globalThis.requestAnimationFrame=fn=>setImmediate(()=>fn(performance.now()));
const resolveFile=x=>String(x).startsWith('file:')?fileURLToPath(x):path.resolve(base,String(x));
// Supply file URLs to the native decoder as bytes and retain its browser-compatible decode().
class AtlasImage extends skia.Image {
 set src(v){super.src=typeof v==='string'&&v.startsWith('file:')?fileURLToPath(v):v;}
 get src(){return super.src;}
}
globalThis.Image=AtlasImage;
globalThis.matchMedia=()=>({matches:false});
globalThis.fetch=async x=>{try{return new Response(await fs.readFile(resolveFile(x)));}catch{return new Response(null,{status:404});}};
T.TextureLoader.prototype.load=function(src,onLoad,_progress,onError){
 const tex=new T.Texture();tex.userData.src=src; const p=skia.loadImage(resolveFile(src)).then(image=>{tex.image=image;onLoad?.(tex);return tex;}).catch(e=>onError?.(e));return tex;
};
const {landmarks,createLandmark}=await import('../../dist/landmarks.js');
const {createCity}=await import('../../dist/city.js');
const {project}=await import('../../dist/navigation.js');
const center=project(...shot.anchor);const scene=new T.Scene();
const city=await createCity({project,landmarks,scene});
const layerNames=['imagery','buildings','roads','water','streetlights','vegetation','plazas'];
city.group.children.forEach((g,i)=>g.userData.filmLayer=g.name||layerNames[i]);
for(const lm of landmarks){
 const p=project(lm.lon,lm.lat);
 if(Math.hypot(p.x-center.x,p.z-center.z)>(shot.context||2800)&&lm.id!==shot.scene)continue;
 const model=createLandmark(lm.id);model.position.set(p.x,0,p.z);model.userData.filmLayer=lm.id;scene.add(model);
}
scene.updateMatrixWorld(true);
const output=await fs.open(path.join(dest,'geometry.bin'),'w');let offset=0;const objects=[],planes=new Map(),materialLibrary=[],used=new Map();
async function field(data,Type=Float32Array){const ar=data instanceof Type?data:new Type(data),len=ar.byteLength;const off=offset;const bytes=Buffer.from(ar.buffer,ar.byteOffset,len);let n=0;while(n<len){const v=await output.write(bytes,n,len-n,off+n);n+=v.bytesWritten;}offset+=len;return [off,ar.length];}
const pending=[];
scene.traverse(m=>{if(!m.isMesh)return;let parent=m,layer='city';while(parent){if(parent.userData.filmLayer){layer=parent.userData.filmLayer;break;}parent=parent.parent;}
 const g=m.geometry;g.computeBoundingSphere();const sphere=(m.isInstancedMesh?(m.computeBoundingSphere(),m.boundingSphere):g.boundingSphere).clone().applyMatrix4(m.matrixWorld);
 if(Math.hypot(sphere.center.x-center.x,sphere.center.z-center.z)>sphere.radius+(shot.context||2800))return;
 pending.push([m,layer]);
});
async function matId(material,m,layer){
 const key=material.uuid+':'+layer;if(used.has(key))return used.get(key);
 let src=material.map?.userData.src||m.userData.panelUrl||material.map?.image?.src||'';
 if(!src&&material.map?.image?.toBuffer){src=path.join(dest,'procedural-'+materialLibrary.length+'.png');await fs.writeFile(src,material.map.image.toBuffer('image/png'));}
 const mat={name:material.name||m.name||layer,layer,color:material.color?.toArray()||[1,1,1],rough:material.roughness??.78,metal:material.metalness??0,src:src?resolveFile(src):null,alpha:material.alphaTest||0,transparent:material.transparent,opacity:material.opacity,vertices:!!material.vertexColors,repeat:material.map?.repeat?.toArray()||[1,1],shift:material.map?.offset?.toArray()||[0,0]};
 const id=materialLibrary.length;materialLibrary.push(mat);used.set(key,id);return id;
}
const {finishes}=await import('../../dist/urban/facades.js');
const urbanIds=new Map();
async function urbanMaterial(material,m,layer,slot){
 if(slot<0)return matId(material,m,layer);
 if(!urbanIds.has(slot)){
  const id=materialLibrary.length,name=finishes[slot][0];
  materialLibrary.push({name:'Beijing facade '+name,layer,color:[1,1,1],rough:slot===5?.26:.78,metal:slot===5?.32:.03,src:path.join(base,'urban','facades-'+name+'.webp'),alpha:0,opacity:1,vertices:true,repeat:[1,1],shift:[0,0]});
  urbanIds.set(slot,id);
 }
 return urbanIds.get(slot);
}
const matrices=new T.Matrix4(),pt=new T.Vector3();
for(const [m,layer] of pending){
 const g=m.geometry,attr=g.attributes,at=attr.position;if(!at)continue;
 let positions,indices,uv,colors,glow,instances=[];
 if(m.isInstancedMesh){
  for(let j=0;j<m.count;j++){m.getMatrixAt(j,matrices);matrices.premultiply(m.matrixWorld);pt.setFromMatrixPosition(matrices);
   if(Math.hypot(pt.x-center.x,pt.z-center.z)<Math.min(shot.context||2800,shot.instances||1250))instances.push(matrices.toArray());}
  if(!instances.length)continue;
 }
 const cacheKey=g.uuid;
 if(!planes.has(cacheKey)){
  const data=(a,dim)=>{if(!a)return null;if(!a.normalized&&!a.isInterleavedBufferAttribute&&a.itemSize===dim)return a.array;let out=new Float32Array(a.count*dim);for(let i=0;i<a.count;i++)for(let k=0;k<dim;k++)out[i*dim+k]=a.getComponent(i,k);return out;};
  positions=await field(data(at,3));indices=await field(g.index?.array||Uint32Array.from({length:at.count},(_,i)=>i),Uint32Array);
  uv=attr.uv?await field(data(attr.uv,2)):null;colors=attr.color?await field(data(attr.color,3)):null;
  glow=attr.cbdGlow?await field(data(attr.cbdGlow,1)):null;
  planes.set(cacheKey,{positions,indices,uv,colors,glow});
 }
 let materials=await Promise.all([].concat(m.material).map(v=>matId(v,m,layer)));
 let groups=Array.isArray(m.material)?g.groups:[],faceMaterials=null;
 if(layer==='buildings'&&attr.aShape&&attr.uv&&!Array.isArray(m.material)){
  const keys=new Map(),count=(g.index?.count||at.count)/3,faces=new Uint32Array(count);
  for(let f=0;f<count;f++){
   const s=Math.floor(attr.aShape.getX(g.index?g.index.getX(f*3):f*3)+.1),slot=s>=0&&s<finishes.length?s:-1;
   if(!keys.has(slot))keys.set(slot,keys.size);
   faces[f]=keys.get(slot);
  }
  materials=[];for(const slot of keys.keys())materials.push(await urbanMaterial(m.material,m,layer,slot));
  faceMaterials=await field(faces,Uint32Array);
 }
 objects.push({name:m.name||layer,layer,material:materials[0],materials,groups,faceMaterials,...planes.get(cacheKey),matrix:m.matrixWorld.toArray(),instances});
}
await output.close();
await fs.writeFile(path.join(dest,'manifest.json'),JSON.stringify({center,shot,materials:materialLibrary,objects,base}));
console.log(shot.id,objects.length+' meshes',Math.round(offset/1048576)+' MiB');
