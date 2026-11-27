// The geometry describes building typologies. Surveyed plan rings remain the
// collision boundary; sources and the scope of inference are in facades-sources.json.
import * as THREE from 'three';

export const RAIL=0,BALCONY=1,SLAB=2,SHOP=3,PODIUM=4,CURTAIN=5,OFFICE=6,MASONRY=7,WORKSHOP=8,ROOF=9,RENDER=10,METAL=11;
// Ground width in metres, mapped storeys and mean display colour of each sample.
export const finishes=[
  ['railings',11.8,4,[151,144,127]],['balconies',6.8,2,[139,138,129]],
  ['tile-slab',16.6,7,[182,166,139]],['shopfront',6.1,1,[102,107,101]],
  ['podium',28,4,[160,155,143]],['curtain',26,10,[108,123,141]],
  ['office',20,6,[120,122,120]],['masonry',20,6,[143,128,118]],
  ['workshop',9.6,1,[137,150,150]],['flat-roof',11,1,[162,162,155]],
  ['render',5,1,[204,198,184]],['sheet-roof',7,1,[126,140,144]]
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const length=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const ringArea=r=>r.reduce((a,p,i)=>{const q=r[(i+1)%r.length];return a+p.x*q.z-q.x*p.z;},0)*.5;
const tint=(seed)=>[255,Math.round(249+6*seed),Math.round(239+16*seed)];
const wallCap=[167,163,152],coping=[206,202,190],equipment=[170,173,166];
const means=finishes.map(f=>f[3]);
export function urbanType(feature,h,area,seed){
  const k=feature.kind||'',levels=Number(feature.levels)||h/3.2;
  if(/industrial|warehouse|garage|shed|hangar|carport|sports_hall/.test(k))return WORKSHOP;
  if(/^(wall|roof|gate|gatehouse|bridge|tower|pavilion|temple|church|mosque|palace|shrine|gasometer)$/.test(k))return RENDER;
  if(/retail|market|shop|kiosk|mall/.test(k))return levels<=2.5?SHOP:levels<9?PODIUM:OFFICE;
  if(/office|commercial|hotel|company/.test(k))return h>=53?(seed>.54?CURTAIN:OFFICE):levels<2.4?SHOP:levels<5?PODIUM:(seed<.45?MASONRY:OFFICE);
  if(/school|college|hospital|university|civic|government|kindergarten|transportation|station|embassy/.test(k))return seed<.48?MASONRY:PODIUM;
  if(/residential|apartments|dormitory/.test(k))return levels<=2?MASONRY:levels>=10?SLAB:seed<.55?RAIL:seed<.81?SLAB:BALCONY;
  if(/house|detached|bungalow|hut|toilets|service/.test(k))return area<78||seed<.36?RENDER:MASONRY;
  if(h>66)return seed<.4?SLAB:seed<.71?OFFICE:CURTAIN;
  if(levels>6)return seed<.46?SLAB:seed<.70?RAIL:MASONRY;
  if(h>10&&area>180)return seed<.49?RAIL:seed<.69?SLAB:seed<.82?BALCONY:MASONRY;
  return area<110||h<4.5?RENDER:seed<.59?MASONRY:RAIL;
}
function inside(p,ring){
  let on=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)on=!on;
  }return on;
}
function frame(poly){
  const r=poly.ring;let best=0,ex=1,ez=0;
  for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],l=length(a,b);if(l>best){best=l;ex=(b.x-a.x)/l;ez=(b.z-a.z)/l;}}
  let u0=Infinity,u1=-Infinity,v0=Infinity,v1=-Infinity;
  for(const p of r){const u=p.x*ex+p.z*ez,v=-p.x*ez+p.z*ex;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const uc=(u0+u1)*.5,vc=(v0+v1)*.5;
  return {w:u1-u0,d:v1-v0,ex,ez,at:(u,v)=>({x:(uc+u)*ex-(vc+v)*ez,z:(uc+u)*ez+(vc+v)*ex})};
}
function rect(f,u,v,w,d){
  return [f.at(u-w*.5,v-d*.5),f.at(u+w*.5,v-d*.5),f.at(u+w*.5,v+d*.5),f.at(u-w*.5,v+d*.5)];
}
function contained(r,poly){
  for(const hole of poly.holes)if(hole.some(p=>inside(p,r)))return false;
  for(let i=0;i<4;i++){
    const a=r[i],b=r[(i+1)%4];for(const t of [0,.25,.5,.75]){const p={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};if(!inside(p,poly.ring)||poly.holes.some(h=>inside(p,h)))return false;}
    const cross=(p,q,s)=>(q.x-p.x)*(s.z-p.z)-(q.z-p.z)*(s.x-p.x);
    for(const ring of [poly.ring,...poly.holes])for(let k=0;k<ring.length;k++){
      const p=ring[k],q=ring[(k+1)%ring.length];
      if(cross(a,b,p)*cross(a,b,q)<0&&cross(p,q,a)*cross(p,q,b)<0)return false;
    }
  }return true;
}
const corners=(a,b,lo,hi)=>[[a.x,lo,a.z],[a.x,hi,a.z],[b.x,hi,b.z],[b.x,lo,b.z]];
function perimeter(writer,poly,low,high,id,levels,seed,detail=true,relief=false){
  const color=tint(seed),span=high-low;
  for(const [rn,ring] of [poly.ring,...poly.holes].entries()){
    const sign=Math.sign(ringArea(ring))*(rn?-1:1);
    const projectBay=relief&&!rn&&(id===RAIL||id===BALCONY||id===SLAB)&&levels>=3;
    let main=-1,longest=15;if(projectBay)for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length],len=length(a,b);
      const score=len+.43*Math.max(0,-sign*(b.x-a.x)/(len||1));
      if(score>longest){longest=score;main=i;}
    }
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length],len=length(a,b);if(len<.14)continue;
      let face=id;
      // A short return on a slab block is usually a party wall or stair core.
      if((id===RAIL||id===BALCONY||id===SLAB)&&len<6.8)face=RENDER;
      const [,metric,floors]=finishes[face],u0=(face===SHOP?0:Math.floor(seed*3)/3);
      const u1=u0+Math.max(.16,Math.round(len/metric*4)/4);
      const v1=face===RENDER?span/5:Math.max(.12,levels/floors);
      const textured=detail===true||(typeof detail==='number'&&detail>0&&span*len>=detail&&face!==RENDER);
      writer.quad(corners(a,b,low,high),[u0,0,u0,v1,u1,v1,u1,0],face,textured?color:means[face],sign<0,textured);
      if(i===main){
        const dx=(b.x-a.x)/len,dz=(b.z-a.z)/len,offset=id===BALCONY?.92:.62;
        const at=(t,depth)=>({x:a.x+dx*len*t+sign*dz*depth,z:a.z+dz*len*t-sign*dx*depth});
        const l=seed<.5?.21:.55,r=l+clamp(5.2/len,.07,.23),floor=span/levels,bottom=low+floor,top=high-.24;
        const A=at(l,0),B=at(r,0),C=at(r,offset),D=at(l,offset);
        const ul=u0+(u1-u0)*l,ur=u0+(u1-u0)*r,vl=v1/levels,vt=v1*(top-low)/span;
        writer.quad(corners(D,C,bottom,top),[ul,vl,ul,vt,ur,vt,ur,vl],face,color,sign<0,true);
        writer.quad(corners(A,D,bottom,top),null,-1,wallCap,sign<0,false);
        writer.quad(corners(C,B,bottom,top),null,-1,wallCap,sign<0,false);
        flatQuad(writer,[A,B,C,D],top,coping);
        for(let n=1;n<Math.min(levels,32);n+=id===SLAB?2:1){
          const y=low+n*floor;
          if(y+.12<top)writer.quad(corners(D,C,y,y+.12),null,-1,coping,sign<0,false);
        }
      }
    }
  }
}
function flatQuad(writer,r,y,color){
  writer.quad(r.map(p=>[p.x,y,p.z]),null,-1,color,ringArea(r)>0,false);
}
function rims(writer,poly,top,height){
  const width=.31;
  for(const [rn,r] of [poly.ring,...poly.holes].entries()){
    const sign=Math.sign(ringArea(r))*(rn?-1:1);
    // Parallel inward offsets meet at a miter, including inside-courtyard rims.
    const inner=r.map((p,i)=>{
      const a=r[(i+r.length-1)%r.length],b=r[(i+1)%r.length],l=length(a,p)||1,m=length(p,b)||1;
      const ax=-sign*(p.z-a.z)/l,az=sign*(p.x-a.x)/l,bx=-sign*(b.z-p.z)/m,bz=sign*(b.x-p.x)/m;
      const k=width/Math.max(.52,1+ax*bx+az*bz);return {x:p.x+(ax+bx)*k,z:p.z+(az+bz)*k};
    });
    for(let i=0;i<r.length;i++){
      const j=(i+1)%r.length,a=r[i],b=r[j],c=inner[j],d=inner[i];if(length(a,b)<.25)continue;
      writer.quad(corners(a,b,top-height,top),null,-1,wallCap,sign<0,false);
      writer.quad(corners(d,c,top-height,top),null,-1,[113,116,110],sign>0,false);
      flatQuad(writer,[a,b,c,d],top,coping);
    }
  }
}
function solid(writer,r,bottom,top,wall,topColor){
  for(let i=0;i<4;i++)writer.quad(corners(r[i],r[(i+1)%4],bottom,top),null,-1,wall,ringArea(r)<0,false);
  flatQuad(writer,r,top,topColor);
}
function roofPlant(poly,f,h,seed){
  if(Math.min(f.w,f.d)<7)return null;
  const swap=f.w<f.d,L=Math.max(f.w,f.d),D=Math.min(f.w,f.d),along=(a,b,w,d)=>swap?rect(f,b,a,d,w):rect(f,a,b,w,d);
  const position=(seed<.5?-.21:.18)*L,baseWidth=clamp(L*.19,3.3,12),baseDepth=clamp(D*.21,2.7,6.5);
  for(const at of [position,0,-position]){
    const room=along(at,0,baseWidth,baseDepth);if(!contained(room,poly))continue;
    const unit=D>13?along(-at*.78,D*.19,Math.min(4.8,baseWidth*.68),Math.min(2.9,baseDepth*.64)):null;
    return {room,unit:unit&&contained(unit,poly)?unit:null,height:Math.min(3.3,h*.11)};
  }
  return null;
}
function workshopRoof(writer,poly,h,detail,seed,wallDetail){
  if(poly.holes.length||poly.ring.length!==4)return false;
  const r=[...poly.ring];if(ringArea(r)<0)r.reverse();if(length(r[1],r[2])>length(r[0],r[1]))r.push(r.shift());
  const width=(length(r[1],r[2])+length(r[0],r[3]))*.5,long=length(r[0],r[1]);
  if(width<4||long<7||Math.abs(ringArea(r))/(long*width)<.84)return false;
  const rise=clamp(width*.13,.70,Math.min(3,h*.24)),eave=h-rise;
  perimeter(writer,poly,0,eave,WORKSHOP,1,seed,wallDetail);
  const interp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
  const middle=[interp(r[0],r[3],.5),interp(r[1],r[2],.5)];
  const wall=(a,y)=>[a.x,y,a.z];
  const ridge=r.map((p,i)=>interp(middle[i===0||i===3?0:1],p,.015));
  for(let i=0;i<4;i++){
    const j=(i+1)%4,verts=[wall(r[i],eave),wall(r[j],eave),wall(ridge[j],h),wall(ridge[i],h)];
    const uv=verts.flatMap(p=>[p[0]/7,p[2]/7]);writer.quad(verts,uv,METAL,detail?tint(seed):means[METAL],true,detail);
  }
  flatQuad(writer,ridge,h,means[METAL]);return true;
}
export function ordinaryGeometry(writer,poly,feature,h,seed,lod=1,planArea=Math.abs(ringArea(poly.ring)),farWallArea=0){
  const id=urbanType(feature,h,planArea,seed),tagLevels=Number(feature.levels),levels=tagLevels>0?tagLevels:Math.max(1,Math.round(h/(id===SHOP||id===PODIUM||id===OFFICE||id===CURTAIN?3.7:id===WORKSHOP?7:3.12)));
  const detail=lod<=2,wallDetail=detail||farWallArea,trunk=h>=9&&planArea>=110&&id!==RENDER;
  if(id===WORKSHOP&&h<20&&workshopRoof(writer,poly,h,detail,seed,wallDetail))return;
  const canHavePlant=trunk&&h>=13&&planArea>180,fr=canHavePlant||h>26?frame(poly):null;
  const useRim=trunk&&(lod===0||lod===1&&planArea>=175||lod===2&&h>=44);
  const parapet=trunk?clamp(h*.025,.36,.78):0;
  let topPlan=poly,baseH=0;
  if(fr&&!poly.holes.length&&planArea>1200&&h>=35&&/office|commercial|retail|hotel|mall/.test(feature.kind||'')&&planArea/(fr.w*fr.d)>.91&&Math.min(fr.w,fr.d)>22){
    const deck=rect(fr,0,0,fr.w*.83,fr.d*.77);
    if(contained(deck,poly)){baseH=clamp(h*.17,6.6,14);topPlan={ring:deck,holes:[]};}
  }
  if(baseH){
    perimeter(writer,poly,0,baseH,PODIUM,Math.max(1,Math.round(baseH/3.9)),seed,wallDetail);
    writer.roof(poly,baseH,ROOF,detail?tint(seed):means[ROOF],detail);
  }
  const plant=canHavePlant?roofPlant(topPlan,topPlan===poly?fr:frame(topPlan),h,seed):null;
  // OSM height remains the upper bound, including the inferred stair enclosure.
  const top=plant?h-plant.height+parapet:h,roof=top-parapet;
  const ceiling=useRim?roof:top,stories=Math.max(1,levels-Math.round(baseH/3.9));
  if(id===SHOP&&ceiling-baseH>5){
    const groundTop=baseH+3.8;
    perimeter(writer,topPlan,baseH,groundTop,SHOP,1,seed,wallDetail);
    perimeter(writer,topPlan,groundTop,ceiling,MASONRY,Math.max(1,stories-1),seed,wallDetail);
  }else perimeter(writer,topPlan,baseH,ceiling,id,stories,seed,wallDetail,lod<2);
  writer.roof(topPlan,useRim?roof:top,ROOF,detail?tint(seed):means[ROOF],detail);
  if(useRim)rims(writer,topPlan,top,parapet);
  if(plant){
    const room=plant.room,cap=h-.13;
    solid(writer,room,roof,cap,equipment,[207,205,191]);
    if(lod<2){
      const a=room[0],b=room[1],dx=b.x-a.x,dz=b.z-a.z,len=length(a,b),edge=t=>({x:a.x+t*dx+.025*dz/len,z:a.z+t*dz-.025*dx/len});
      const jamb=clamp(1.05/len,.08,.32);
      writer.quad(corners(edge(.18),edge(.18+jamb),roof+.035,Math.min(cap-.20,roof+2.1)),null,-1,[110,118,113],false,false);
      const side=room[2],mid=t=>({x:b.x+t*(side.x-b.x)+.025*(side.z-b.z)/length(b,side),z:b.z+t*(side.z-b.z)-.025*(side.x-b.x)/length(b,side)});
      writer.quad(corners(mid(.23),mid(.72),roof+.48,Math.min(cap-.12,roof+1.5)),null,-1,[105,115,113],false,false);
    }
    solid(writer,room,cap,h,[140,143,137],[197,197,185]);
    if(lod===0&&plant.unit){
      const unit=plant.unit,cover=Math.min(h,roof+1.22);
      solid(writer,unit,roof,cover,[132,139,137],[174,183,177]);
      const centre=unit.reduce((c,p)=>({x:c.x+p.x/4,z:c.z+p.z/4}),{x:0,z:0});
      const grille=unit.map(p=>({x:centre.x+(p.x-centre.x)*.68,z:centre.z+(p.z-centre.z)*.60}));
      flatQuad(writer,grille,Math.min(h,cover+.015),[84,95,94]);
    }
  }
}
let cpuPromise;
export function loadFacadeTextures(){
  if(!cpuPromise)cpuPromise=Promise.all(finishes.map(async ([name])=>{
    const image=new Image();image.crossOrigin='anonymous';image.src=new URL('./facades-'+name+'.webp',import.meta.url).href;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,512,512);
    const levels=[];let src=canvas;
    for(let n=512;n>=1;n>>=1){const stage=n===512?canvas:document.createElement('canvas');if(n!==512){stage.width=stage.height=n;stage.getContext('2d',{willReadFrequently:true}).drawImage(src,0,0,n,n);}
      const data=stage.getContext('2d').getImageData(0,0,n,n).data;
      levels.push({w:n,h:n,data});src=stage;}
    return {asset:'urban/facades-'+name+'.webp',urban:true,levels,repeatS:1000,repeatT:1000,flip:true,alpha:0};
  }));return cpuPromise;
}
export async function gpuFacadeArray(){
  const images=await loadFacadeTextures(),size=512,bytes=new Uint8Array(images.length*size*size*4);
  images.forEach((im,i)=>bytes.set(im.levels[0].data,i*size*size*4));
  const tex=new THREE.DataArrayTexture(bytes,size,size,images.length);
  tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.generateMipmaps=true;
  tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;tex.anisotropy=4;tex.needsUpdate=true;return tex;
}
