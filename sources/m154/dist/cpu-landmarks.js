import { createLandmark } from './landmarks.js';

const cache = new Map();
const toByte = linear => Math.round(255 * Math.min(1, Math.max(0,
  linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
)));
const palette = new Map();
function swatch(r,g,b) {
  const key=(Math.round(r*1023)<<20)|(Math.round(g*1023)<<10)|Math.round(b*1023);
  let value=palette.get(key);
  if (!value) {value=[toByte(r),toByte(g),toByte(b)];palette.set(key,value);}
  return value;
}
function transform(matrix,x,y,z) {
  const m=matrix.elements;
  return [m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
}
class GeometryWriter {
  constructor() {
    this.pos=[];this.index=[];this.colors=[];this.normals=[];
    this.texFaces=[];this.uvs=[];this.bulbs=[];this.mapIds=[];this.textures=[];this.buckets=new Map();this.next=[];this.linePos=[];this.lineColors=[];
  }
  vertex(x,y,z) {
    // All model detail is coarser than this 3.9 mm grid. Hash collisions are independently compared.
    const qx=Math.round(x*256),qy=Math.round(y*256),qz=Math.round(z*256);
    const hash=Math.imul(qx,73856093)^Math.imul(qy,19349663)^Math.imul(qz,83492791);
    const first=this.buckets.get(hash);
    const px=qx/256,py=qy/256,pz=qz/256;
    for(let i=first;i!==undefined;i=this.next[i]){
      if(this.pos[3*i]===px&&this.pos[3*i+1]===py&&this.pos[3*i+2]===pz)return i;
    }
    const id=this.pos.length/3;this.pos.push(px,py,pz);
    this.next[id]=first;this.buckets.set(hash,id);return id;
  }
  triangle(a,b,c,tint,texture=-1,uv=null) {
    if(a===b||a===c||b===c)return;
    const p=this.pos,i=a*3,j=b*3,k=c*3;
    const ux=p[j]-p[i],uy=p[j+1]-p[i+1],uz=p[j+2]-p[i+2];
    const vx=p[k]-p[i],vy=p[k+1]-p[i+1],vz=p[k+2]-p[i+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    if(len<1e-8)return;
    this.texFaces.push(texture<0?0:this.mapIds.length+1);
    if(texture>=0){this.mapIds.push(texture);this.uvs.push(...uv);}
    this.index.push(a,b,c);this.colors.push(tint[0],tint[1],tint[2]);
    this.normals.push(Math.round(127*nx/len),Math.round(127*ny/len),Math.round(127*nz/len));
  }
  finish() {
    return {bulbs:new Float32Array(this.bulbs),texFaces:this.uvs.length?new Uint32Array(this.texFaces):null,uvs:new Float32Array(this.uvs),mapIds:new Uint16Array(this.mapIds),textures:this.textures,pos:new Float32Array(this.pos),index:new Uint32Array(this.index),colors:new Uint8Array(this.colors),
      normals:new Int8Array(this.normals),linePos:new Float32Array(this.linePos),lineColors:new Uint8Array(this.lineColors)};
  }
}
function readTint(mat,attr,i) {
  const c=mat.color;
  if(!attr||!mat.vertexColors) return swatch(c.r,c.g,c.b);
  return swatch(c.r*attr.getX(i),c.g*attr.getY(i),c.b*attr.getZ(i));
}
function appendSolid(out,mesh,maps) {
  const geo=mesh.geometry,attr=geo.getAttribute('position'),rgb=geo.getAttribute('color'),uv=geo.getAttribute('uv');
  const remap=new Uint32Array(attr.count);
  for(let i=0;i<attr.count;i++)remap[i]=out.vertex(...transform(mesh.matrixWorld,attr.getX(i),attr.getY(i),attr.getZ(i)));
  const order=geo.index?.array, length=order?.length??attr.count;
  const groups=Array.isArray(mesh.material)?geo.groups:[{start:0,count:length}];
  for(const group of groups){
    const mat=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material;
    if(!mat||!mat.visible)continue;
    const id=maps.get(mat)??-1,matrix=mat.map?.matrix.elements;
    function coords(i){const u=uv.getX(i),v=uv.getY(i);return [matrix[0]*u+matrix[3]*v+matrix[6],matrix[1]*u+matrix[4]*v+matrix[7]];}
    for(let i=group.start;i+2<Math.min(group.start+group.count,length);i+=3){
      const a=order?order[i]:i,b=order?order[i+1]:i+1,c=order?order[i+2]:i+2;
      out.triangle(remap[a],remap[b],remap[c],readTint(mat,rgb,a),uv?id:-1,uv&&id>=0?[...coords(a),...coords(b),...coords(c)]:null);
    }
  }
}
function appendLines(out,mesh) {
  const geo=mesh.geometry,attr=geo.getAttribute('position'),rgb=geo.getAttribute('color');
  for(let i=0;i+1<attr.count;i+=2){
    out.linePos.push(...transform(mesh.matrixWorld,attr.getX(i),attr.getY(i),attr.getZ(i)),
      ...transform(mesh.matrixWorld,attr.getX(i+1),attr.getY(i+1),attr.getZ(i+1)));
    out.lineColors.push(...readTint(mesh.material,rgb,i));
  }
}
const imageCache=new Map();
async function mipLevels(map,url){
  const key=url||map.source;
  if(!imageCache.has(key))imageCache.set(key,(async()=>{
    let image=map.image;
    if(!image?.width && url){const r=await fetch(url);if(!r.ok)throw Error('Texture '+r.status);image=await createImageBitmap(await r.blob());}
    if(!image?.width)return null;
    if(image.decode)await image.decode();
    const limit=matchMedia("(pointer:coarse)").matches?2048:4096;const scale=Math.min(1,limit/Math.max(image.width,image.height)),levels=[];
    let w=Math.max(1,Math.round(image.width*scale)),h=Math.max(1,Math.round(image.height*scale)),src=image;
    for(;;){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(src,0,0,w,h);levels.push({w,h,data:ctx.getImageData(0,0,w,h).data});
      if(w===1&&h===1)break;src=c;w=Math.max(1,w>>1);h=Math.max(1,h>>1);
    }
    return levels;
  })().catch(()=>null));
  return imageCache.get(key);
}
async function convert(id) {
  const model=createLandmark(id);model.updateMatrixWorld(true);
  const out=new GeometryWriter(),meshes=[],maps=new Map(),tasks=[];
  model.traverse(mesh=>{
    if(mesh.isLineSegments)appendLines(out,mesh);
    if(mesh.isPoints&&mesh.userData.roofLights){const at=mesh.geometry.getAttribute('position');for(let i=0;i<at.count;i++)out.bulbs.push(...transform(mesh.matrixWorld,at.getX(i),at.getY(i),at.getZ(i)));}
    if(!mesh.isMesh||mesh.userData.cpuBaked)return;
    meshes.push(mesh);
    for(const mat of [].concat(mesh.material)){
      const map=mat.map;
      if(!map||maps.has(mat))continue;
      maps.set(mat,-1);
      const src=map.userData.src||mesh.userData.panelUrl||map.image?.currentSrc||map.image?.src;
      if(map.matrixAutoUpdate)map.updateMatrix();
      tasks.push(mipLevels(map,src&&new URL(src,import.meta.url).href).then(levels=>{
        if(!levels)return;
        maps.set(mat,out.textures.length);
        out.textures.push({asset:src||'',plaster:mesh.name==='Tiananmen plaster',roof:src?.endsWith('gate-roof.webp'),beam:/gate-(lower-paint|paint|brackets)\.webp/.test(src||''),levels,repeatS:map.wrapS,repeatT:map.wrapT,flip:map.flipY,alpha:Math.round((mat.alphaTest||.25)*255)});
      }));
    }
  });
  await Promise.all(tasks);
  for(const mesh of meshes)appendSolid(out,mesh,maps);
  return out.finish();
}

/** WGS84 landmark-local metres, with yaw baked in; XYZ and sRGB/normals are tightly packed triples.
 * linePos contains two XYZs per segment; lineColors has one sRGB triple per segment. */
export function loadCpuLandmark(id) {
  if(!cache.has(id))cache.set(id,Promise.resolve().then(()=>convert(id)).catch(error=>{cache.delete(id);throw error;}));
  return cache.get(id);
}
