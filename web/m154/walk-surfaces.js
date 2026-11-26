import * as T from 'three';
import {createLandmark} from './landmarks.js';
const tile=12;
function indexLandmark(id){
 const g=createLandmark(id),cells=new Map();g.updateMatrixWorld(true);
 const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),v=new T.Vector3();
 g.traverse(mesh=>{if(!mesh.isMesh||!mesh.geometry.index)return;const at=mesh.geometry.attributes,p=at.position,col=at.color,ind=mesh.geometry.index.array;if(!col)return;
 const load=(v,i)=>v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
 for(let n=0;n<ind.length;n+=3){const ia=ind[n],ib=ind[n+1],ic=ind[n+2];if(p.getY(ia)>.01+10||p.getY(ia)<.12)continue;
  const cr=col.getX(ia),cg=col.getY(ia),cb=col.getZ(ia);
  if(cr<.21||cg/cr<.66||cb/cg<.58)continue;
  load(a,ia);load(b,ib);load(c,ic);
  if(Math.max(a.y,b.y,c.y)-Math.min(a.y,b.y,c.y)>.12)continue;
  const abx=b.x-a.x,abz=b.z-a.z,acx=c.x-a.x,acz=c.z-a.z,area=abx*acz-abz*acx;
  if(Math.abs(area)<1.1)continue;
  const minX=Math.min(a.x,b.x,c.x),maxX=Math.max(a.x,b.x,c.x),minZ=Math.min(a.z,b.z,c.z),maxZ=Math.max(a.z,b.z,c.z);
  const t={ax:a.x,az:a.z,abx,abz,acx,acz,area,y:(a.y+b.y+c.y)/3};
  for(let i=Math.floor(minX/tile);i<=Math.floor(maxX/tile);i++)for(let j=Math.floor(minZ/tile);j<=Math.floor(maxZ/tile);j++){const k=i+','+j;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(t);}
 }});
 return (x,z)=>{let h=0;for(const t of cells.get(Math.floor(x/tile)+','+Math.floor(z/tile))||[]){const dx=x-t.ax,dz=z-t.az,u=(dx*t.acz-dz*t.acx)/t.area,w=(t.abx*dz-t.abz*dx)/t.area;if(u>=-.0001&&w>=-.0001&&u+w<=1.0001)h=Math.max(h,t.y);}return h;};
}
export function walkingGround(project,landmarks){
 const models=landmarks.filter(l=>['tiantan','palace','tiananmen'].includes(l.id)).map(l=>({...project(l.lon,l.lat),id:l.id,max:l.id==='palace'?450:160}));const cache=new Map();
 return (x,z)=>{for(const site of models){if(Math.abs(x-site.x)>site.max||Math.abs(z-site.z)>site.max)continue;if(!cache.has(site.id))cache.set(site.id,indexLandmark(site.id));return cache.get(site.id)(x-site.x,z-site.z);}return 0;};
}
