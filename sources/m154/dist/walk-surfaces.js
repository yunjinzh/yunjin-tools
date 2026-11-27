import {waterfrontDeckHeight} from './urban/waterfront.js';
import {walkingData} from './data/walking-triangles.js';
const tile=12,cache=new Map();
function indexLandmark(id){
 const bytes=atob(walkingData[id]),buffer=new Uint8Array(bytes.length);
 for(let i=0;i<bytes.length;i++)buffer[i]=bytes.charCodeAt(i);
 const tri=new Float64Array(buffer.buffer),cells=new Map();
 for(let k=0;k<tri.length;k+=7){
  const ax=tri[k],az=tri[k+1],bx=tri[k+2],bz=tri[k+3],cx=tri[k+4],cz=tri[k+5];
  const abx=bx-ax,abz=bz-az,acx=cx-ax,acz=cz-az;
  const t={ax,az,abx,abz,acx,acz,area:abx*acz-abz*acx,y:tri[k+6]};
  const x0=Math.floor(Math.min(ax,bx,cx)/tile),x1=Math.floor(Math.max(ax,bx,cx)/tile);
  const z0=Math.floor(Math.min(az,bz,cz)/tile),z1=Math.floor(Math.max(az,bz,cz)/tile);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){
   const key=i+','+j;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);
  }
 }
 return (x,z)=>{let h=0;for(const t of cells.get(Math.floor(x/tile)+','+Math.floor(z/tile))||[]){const dx=x-t.ax,dz=z-t.az,u=(dx*t.acz-dz*t.acx)/t.area,w=(t.abx*dz-t.abz*dx)/t.area;if(u>=-.0001&&w>=-.0001&&u+w<=1.0001)h=Math.max(h,t.y);}return h;};
}
export function walkingGround(project,landmarks){
 const models=landmarks.filter(l=>['tiantan','palace','tiananmen'].includes(l.id)).map(l=>({...project(l.lon,l.lat),id:l.id,max:l.id==='palace'?450:160}));
 const lake=landmarks.find(l=>l.id==='waterfront'),bank=lake&&project(lake.lon,lake.lat);
 return (x,z)=>{if(bank&&Math.hypot(x-bank.x,z-bank.z)<260){const level=waterfrontDeckHeight(x-bank.x,z-bank.z);if(level)return level;}for(const site of models){if(Math.abs(x-site.x)>site.max||Math.abs(z-site.z)>site.max)continue;if(!cache.has(site.id))cache.set(site.id,indexLandmark(site.id));return cache.get(site.id)(x-site.x,z-site.z);}return 0;};
}
