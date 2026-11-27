import {waterfrontWater} from './waterfront-data.js';
import {walkingRows} from './streets-walking.js';
const lookup=new Map(walkingRows.map(([id,site,dir])=>[id,[site,dir]]));
const sites={
  gate:[116.3912643,39.9073379,225,[48,120],[39,117]],
  palace:[116.3908139,39.9158956,120,[79,90],[65,93]],
  hutong:[116.38875,39.9402,85,[34,-5.7],[28,-6.65]],
  bank:[116.387542,39.934105,136,[27,-10],[31,-12.6]],
  cbd:[116.4581,39.9118,310],olympic:[116.39028,39.9914,150],temple:[116.40662,39.88225,125]
};
function cameraDistance(x,z,a,b){
  if(!a)return Infinity;
  const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
}
export function placeStreetLife(roads,project,put,blocked,ground,groundRoad,seed){
  const centers=Object.fromEntries(Object.entries(sites).map(([site,[lon,lat]])=>[site,project(lon,lat)]));
  const nearby=new Map(),stats={pedestrians:0,cycles:0,riders:0};
  function vacant(x,z){
    const i=Math.floor(x/4),j=Math.floor(z/4);
    for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){
      for(const p of nearby.get(a+','+b)||[])if(Math.hypot(p.x-x,p.z-z)<1.85)return false;
    }
    const key=i+','+j;if(!nearby.has(key))nearby.set(key,[]);nearby.get(key).push({x,z});return true;
  }
  for(const f of roads){
    const info=lookup.get(f.osmId);if(!info)continue;
    const [site,dir]=info,origin=centers[site],[,,radius,eye,end]=sites[site];
    const lane=f.kind==='residential'||f.kind==='living_street',cycle=f.kind==='cycleway';
    const points=f.line.map(p=>project(...p));let cumulative=0,j=0;
    let distance=2.6+12*seed(f.osmId,101);
    const spacing=site==='gate'?17:site==='hutong'?19:site==='palace'?21:29;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],d=Math.hypot(b.x-a.x,b.z-a.z);
      if(d<.08)continue;
      const dx=(b.x-a.x)/d,dz=(b.z-a.z)/d;
      while(distance<cumulative+d){
        const at=distance-cumulative,variant=Math.floor(seed(f.osmId,j+93)*10),sign=dir||(seed(f.osmId,j+9)>.49?1:-1);
        const parked=lane&&seed(f.osmId,j+35)<.26,offset=(lane?(parked?1.52:1.12):cycle?.46:.11+seed(f.osmId,j+1)*.45)*sign;
        const x=a.x+at*dx-offset*dz,z=a.z+at*dz+offset*dx,localX=x-origin.x,localZ=z-origin.z;
        distance+=spacing*(.74+seed(f.osmId,j+73)*.64);j++;
        if(Math.hypot(localX,localZ)>radius||cameraDistance(localX,localZ,eye,end)<5.5||blocked(x,z,parked?.75:.28))continue;
        if(!lane&&!cycle&&groundRoad(x,z,.12))continue;
        if(!vacant(x,z))continue;
        const type=parked?'bicycle':cycle?'rider':'person';
        const y=Math.max(site==='hutong'?.155:.115,ground(x,z));
        put({type,site,p:{x,z,y,dx:sign*dx,dz:sign*dz},variant},x,z);
        if(type==='person')stats.pedestrians++;else{stats.cycles++;if(type==='rider')stats.riders++;}
      }
      cumulative+=d;
    }
  }
  // The surveyed shoreline also supports the custom waterfront promenade.
  // Its visitor strip lies between the dated stone railing and the willow row.
  const bank=[...waterfrontWater.ring.slice(103),...waterfrontWater.ring.slice(0,7)];
  let chainage=0,next=10,person=0;
  for(let i=1;i<bank.length;i++){
    const a=bank[i-1],b=bank[i],span=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const dx=(b[0]-a[0])/span,dz=(b[1]-a[1])/span;
    while(next<chainage+span){
      const along=next-chainage,offset=1.45+.22*(person%3);
      const px=a[0]+along*dx+offset*dz,pz=a[1]+along*dz-offset*dx;
      next+=17+seed(i,person)*16;person++;
      if(Math.hypot(px,pz)>92||cameraDistance(px,pz,sites.bank[3],sites.bank[4])<5.5)continue;
      const x=centers.bank.x+px,z=centers.bank.z+pz,y=ground(x,z);
      if(blocked(x,z,.3)||!vacant(x,z))continue;
      const towardWater=person%3===0,sign=person%2?1:-1;
      put({type:'person',site:'bank',p:{x,z,y:Math.max(.12,y),dx:towardWater?-dz:dx*sign,dz:towardWater?dx:dz*sign},variant:person%10},x,z);stats.pedestrians++;
    }
    chainage+=span;
  }
  return stats;
}
