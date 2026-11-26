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
    this.buckets=new Map();this.next=[];this.linePos=[];this.lineColors=[];
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
  triangle(a,b,c,tint) {
    if(a===b||a===c||b===c)return;
    const p=this.pos,i=a*3,j=b*3,k=c*3;
    const ux=p[j]-p[i],uy=p[j+1]-p[i+1],uz=p[j+2]-p[i+2];
    const vx=p[k]-p[i],vy=p[k+1]-p[i+1],vz=p[k+2]-p[i+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    if(len<1e-8)return;
    this.index.push(a,b,c);this.colors.push(tint[0],tint[1],tint[2]);
    this.normals.push(Math.round(127*nx/len),Math.round(127*ny/len),Math.round(127*nz/len));
  }
  finish() {
    return {pos:new Float32Array(this.pos),index:new Uint32Array(this.index),colors:new Uint8Array(this.colors),
      normals:new Int8Array(this.normals),linePos:new Float32Array(this.linePos),lineColors:new Uint8Array(this.lineColors)};
  }
}
function readTint(mat,attr,i) {
  const c=mat.color;
  if(!attr||!mat.vertexColors) return swatch(c.r,c.g,c.b);
  return swatch(c.r*attr.getX(i),c.g*attr.getY(i),c.b*attr.getZ(i));
}
function appendSolid(out,mesh) {
  const geo=mesh.geometry,mat=mesh.material,attr=geo.getAttribute('position'),rgb=geo.getAttribute('color');
  const remap=new Uint32Array(attr.count);
  for(let i=0;i<attr.count;i++)remap[i]=out.vertex(...transform(mesh.matrixWorld,attr.getX(i),attr.getY(i),attr.getZ(i)));
  const order=geo.index?.array, length=order?.length??attr.count;
  for(let i=0;i+2<length;i+=3){
    const a=order?order[i]:i,b=order?order[i+1]:i+1,c=order?order[i+2]:i+2;
    // Every procedural façade, roof facet and structural strap has a constant vertex tint per face.
    out.triangle(remap[a],remap[b],remap[c],readTint(mat,rgb,a));
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
const mix=(a,b,t)=>a+(b-a)*t;
function atQuad(points,s,t) {
  return points[0].map((_,i)=>mix(mix(points[0][i],points[1][i],s),mix(points[2][i],points[3][i],s),t));
}
const panelImages=new Map();
async function imagePixels(mesh,id) {
  if(typeof document==='undefined')return;
  const map=mesh.material.map;
  let src=map.image;
  const asset=mesh.userData.panelUrl || (id==='tiananmen'&&!map.isCanvasTexture?'./photos/tiananmen.webp':null);
  if(!src && asset){
    if(!panelImages.has(asset))panelImages.set(asset,fetch(new URL(asset,import.meta.url)).then(r=>r.ok?r.blob():null)
      .then(blob=>blob?createImageBitmap(blob):null).catch(()=>null));
    src=await panelImages.get(asset);
  }
  if(!src)return;
  if(src.decode)await src.decode();
  const canvas=document.createElement('canvas');
  canvas.width=src.width;canvas.height=src.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx||!canvas.width||!canvas.height)return;
  ctx.drawImage(src,0,0);
  return ctx.getImageData(0,0,canvas.width,canvas.height);
}
async function appendPanel(out,mesh,id) {
  let img;
  try {img=await imagePixels(mesh,id);} catch {/* A plain panel still retains the architectural opening. */}
  if(!img){appendSolid(out,mesh);return;}
  const geo=mesh.geometry,coords=geo.getAttribute('position'),uvs=geo.getAttribute('uv');
  if(coords.count!==4||!uvs){appendSolid(out,mesh);return;}
  const corners=[],uv=[];
  for(let i=0;i<4;i++){
    corners.push(transform(mesh.matrixWorld,coords.getX(i),coords.getY(i),coords.getZ(i)));
    uv.push([uvs.getX(i),uvs.getY(i)]);
  }
  const w=geo.parameters.width,h=geo.parameters.height;
  const rows=mesh.material.map.isCanvasTexture?12:24, cols=Math.max(6,Math.min(144,Math.round(rows*w/h)));
  const indices=new Uint32Array((rows+1)*(cols+1));
  for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
    indices[r*(cols+1)+c]=out.vertex(...atQuad(corners,c/cols,r/rows));
  }
  function tint(s,t){
    const [u,v]=atQuad(uv,s,t);
    const x=Math.min(img.width-1,Math.max(0,Math.round(u*(img.width-1))));
    const y=Math.min(img.height-1,Math.max(0,Math.round((1-v)*(img.height-1))));
    return img.data.subarray((y*img.width+x)*4,(y*img.width+x)*4+3);
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const i=r*(cols+1)+c,a=indices[i],b=indices[i+cols+1],d=indices[i+1],e=indices[i+cols+2];
    out.triangle(a,b,d,tint((c+1/3)/cols,(r+1/3)/rows));
    out.triangle(b,e,d,tint((c+2/3)/cols,(r+2/3)/rows));
  }
}
async function convert(id) {
  const model=createLandmark(id);
  model.updateMatrixWorld(true);
  const out=new GeometryWriter(),panels=[];
  model.traverse(mesh=>{
    if(mesh.isLineSegments)appendLines(out,mesh);
    if(mesh.isMesh){
      if(mesh.userData.cpuBaked)return;
      if(mesh.material.map)panels.push(mesh);else appendSolid(out,mesh);
    }
  });
  for(const panel of panels)await appendPanel(out,panel,id);
  return out.finish();
}

/** WGS84 landmark-local metres, with yaw baked in; XYZ and sRGB/normals are tightly packed triples.
 * linePos contains two XYZs per segment; lineColors has one sRGB triple per segment. */
export function loadCpuLandmark(id) {
  if(!cache.has(id))cache.set(id,Promise.resolve().then(()=>convert(id)).catch(error=>{cache.delete(id);throw error;}));
  return cache.get(id);
}
