// Gulou west residential block. Longitude/latitude is given in hutong-source.json.
import * as THREE from 'three';
import {NatureMeshes,addTree} from './trees.js';
import {houses,lanes,walls,trees} from './hutong-data.js';

export const hutongAnchor=[116.38875,39.94020];
export const hutongRefs=houses.map(([id])=>'way/'+id);
export const hutongViews=[
  {key:'courts',name:'胡同院落',caption:'斜看钟鼓楼西侧灰瓦民居',eye:[95,83,110],at:[-14,1,2]},
  {key:'zhongku',name:'钟库胡同',caption:'沿钟库胡同西望',eye:[36.4,1.72,-4.92],at:[11,2.05,-8.8]},
  {key:'jiaogan',name:'东轿杆胡同',caption:'从东轿杆胡同向北看',eye:[19.2,1.72,60],at:[15.5,2.25,39]}
];
const materials=new Map();
const repeatBoth=new Set(['brick','base','tile','lime','redwood','paving']);
const alphas=new Set(['foliage','eave']);
function surface(key){
  if(materials.has(key))return materials.get(key);
  const url=key==='paving'?new URL('../heritage/gate-paving.webp',import.meta.url).href:new URL('./hutong-'+key+'.webp',import.meta.url).href;
  const tex=typeof document==='undefined'?new THREE.Texture():new THREE.TextureLoader().load(url);
  tex.userData.src=url;tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  if(repeatBoth.has(key))tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  if(key==='eave')tex.wrapS=THREE.RepeatWrapping;
  const material=new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,vertexColors:true,roughness:.93,alphaTest:alphas.has(key)?.32:0});
  material.name='Gulou residential - '+key;materials.set(key,material);return material;
}
class Surfaces{
  constructor(){this.pieces=new Map();}
  face(key,points,uv,tone=0xffffff){
    let data=this.pieces.get(key);
    if(!data){data={position:[],uv:[],colors:[],index:[]};this.pieces.set(key,data);}
    const offset=data.position.length/3,color=new THREE.Color(tone);
    for(let i=0;i<points.length;i++){data.position.push(...points[i]);data.uv.push(...uv[i]);data.colors.push(color.r,color.g,color.b);}
    for(let i=1;i<points.length-1;i++)data.index.push(offset,offset+i,offset+i+1);
  }
  finish(batch){
    for(const [key,data] of this.pieces){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));
      g.setAttribute('color',new THREE.Float32BufferAttribute(data.colors,3));g.setIndex(data.index);g.computeVertexNormals();g.computeBoundingSphere();
      const m=new THREE.Mesh(g,surface(key));m.castShadow=key!=='paving';m.receiveShadow=true;m.name='Gulou '+key;batch.decals.push(m);
    }
  }
}
const xyz=([x,z],y)=>[x,y,z];
const uvRect=[[0,0],[1,0],[1,1],[0,1]];
const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
const area=ring=>ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function edgeFrame(a,c){
  const length=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/length,uz=(c[1]-a[1])/length;
  return {length,ux,uz,point:(s,y,normal=0)=>[a[0]+s*ux+normal*uz,y,a[1]+s*uz-normal*ux]};
}
function wallFace(s,f,key,left,right,low,high,depth,tint,scaleX=2.35,scaleY=1.68){
  const points=[f.point(right,low,depth),f.point(left,low,depth),f.point(left,high,depth),f.point(right,high,depth)];
  s.face(key,points,[[right/scaleX,low/scaleY],[left/scaleX,low/scaleY],[left/scaleX,high/scaleY],[right/scaleX,high/scaleY]],tint);
}
function stoneSlab(b,f,a,c,y,h,near,far,tint){
  const A=f.point(a,y,near),B=f.point(c,y,near),C=f.point(c,y,far),D=f.point(a,y,far);
  const up=v=>[v[0],v[1]+h,v[2]],corners=[A,B,C,D];
  b.face([up(A),up(B),up(C),up(D)],tint);
  for(let i=0;i<4;i++){let j=(i+1)%4;b.face([corners[i],corners[j],up(corners[j]),up(corners[i])],tint);}
}
function clipBand(polygon,value,test){
  let out=[],prev=polygon.at(-1),inside=test(prev[1],value);
  for(const cur of polygon){
    const has=test(cur[1],value);
    if(has!==inside)out.push(mix(prev,cur,(value-prev[1])/(cur[1]-prev[1])));
    if(has)out.push(cur);prev=cur;inside=has;
  }
  return out;
}
function triangulate(points){
  return points.length===3?[[0,1,2]]:THREE.ShapeUtils.triangulateShape(points.map(p=>new THREE.Vector2(...p)),[]);
}
function roofGeometry(b,s,ring,id,eave,roofRise,tint){
  const lengths=ring.map((a,i)=>edgeFrame(a,ring[(i+1)%ring.length]));
  let axis=lengths.reduce((best,cur)=>cur.length>best.length?cur:best);
  const u=axis.ux,v=axis.uz;
  const project=([x,z])=>[x*u+z*v,-x*v+z*u];
  const world=([a,c],y)=>[a*u-c*v,y,a*v+c*u];
  const local=ring.map(project),us=local.map(p=>p[0]),vs=local.map(p=>p[1]);
  const lo=Math.min(...us),hi=Math.max(...us),va=Math.min(...vs),vb=Math.max(...vs),mid=(va+vb)/2,h=(vb-va)/2;
  const ridgeY=eave+roofRise,center=(lo+hi)/2,len=hi-lo;
  // Eave and gable shoulders rise gently at their ends. Beijing domestic roofs
  // remain low and restrained, with only shallow curvature in the tile planes.
  const height=([a,c])=>{const t=Math.max(0,1-Math.abs(c-mid)/h),q=Math.min(1,Math.abs((a-center)/(len*.5)));
    return eave+roofRise*(.77*t+.23*t*t)+.095*q**7*(1-t);};
  const expand=([a,c])=>[center+(a-center)*(1+.26/len),mid+(c-mid)*(1+.27/h)];
  const tr=triangulate(local);
  const stops=[va,mid-h*.52,mid,mid+h*.52,vb];
  for(const tri of tr){
    const triangle=tri.map(i=>local[i]);
    for(let i=1;i<stops.length;i++){
      let poly=clipBand(triangle,stops[i-1],(a,c)=>a>=c);if(poly.length<3)continue;
      poly=clipBand(poly,stops[i],(a,c)=>a<=c);
      if(poly.length<3||Math.abs(area(poly))<.0004)continue;
      if(area(poly)>0)poly.reverse();
      s.face('tile',poly.map(p=>world(expand(p),height(p))),poly.map(([a,c])=>[a/.63,Math.abs(c-mid)/.90]),tint);
    }
  }
  // Intersect ridge with the mapped polygon, including concave gables.
  const cuts=[];
  for(let i=0;i<local.length;i++){const p=local[i],q=local[(i+1)%local.length];if((p[1]>mid)!==(q[1]>mid))cuts.push(mix(p,q,(mid-p[1])/(q[1]-p[1]))[0]);}
  cuts.sort((a,c)=>a-c);
  for(let i=1;i<cuts.length;i+=2){
    const a=cuts[i-1]-.15,c=cuts[i]+.15,profile=[[-.17,0],[-.13,.13],[0,.22],[.13,.13],[.17,0]];
    for(let k=1;k<profile.length;k++){
      let [d,y]=profile[k-1],[e,j]=profile[k];
      s.face('base',[world([a,mid+d],ridgeY+y),world([a,mid+e],ridgeY+j),world([c,mid+e],ridgeY+j),world([c,mid+d],ridgeY+y)],[[a/.93,0],[a/.93,.36],[c/.93,.36],[c/.93,0]],0xc8c5bc);
    }
  }
  for(let i=0;i<local.length;i++){
    let a=local[i],c=local[(i+1)%local.length],t=[0,1];
    for(let j=1;j<stops.length-1;j++){const v=(stops[j]-a[1])/(c[1]-a[1]);if(v>0&&v<1)t.push(v);}
    t.sort((a,c)=>a-c);
    for(let j=1;j<t.length;j++){
      const p=mix(a,c,t[j-1]),q=mix(a,c,t[j]),P=world(expand(p),height(p)),Q=world(expand(q),height(q)),yp=height(p)-.13,yq=height(q)-.13;
      const base=[world(q,.18),world(p,.18),world(p,yp),world(q,yq)];
      const f=lengths[i],L=f.length,sp=t[j-1]*L,sq=t[j]*L;
      s.face(id%5===0?'lime':'brick',base,[[sq/2.35,.11],[sp/2.35,.11],[sp/2.35,yp/1.68],[sq/2.35,yq/1.68]],id%5===0?0xcacac1:0xd9d8d3);
      const transverse=Math.abs((c[1]-a[1])/L),lip=transverse<.4?.195:.13;
      const lowP=[P[0],P[1]-lip,P[2]],lowQ=[Q[0],Q[1]-lip,Q[2]];
      if(transverse<.4)s.face('eave',[lowQ,lowP,P,Q],[[sq/.25,0],[sp/.25,0],[sp/.25,1],[sq/.25,1]],0xc1c0b7);
      else b.face([lowQ,lowP,P,Q],0x686762);
      b.face([world(p,yp),world(q,yq),lowQ,lowP],0x4f443b);
    }
    wallFace(s,lengths[i],'base',0,lengths[i].length,.04,.48,.017,0xc6c5bb,2.05,.98);
  }
}
function windowBay(b,s,f,x,y,w,h,trim){
  const ox=.046,p=(dx,dy,d=ox)=>f.point(x+dx,y+dy,d);
  b.face([p(w/2,0),p(-w/2,0),p(-w/2,h),p(w/2,h)],0x3b4947,'glass');
  const frame=(x1,y1,x2,y2)=>b.face([p(x2,y1,.080),p(x1,y1,.080),p(x1,y2,.080),p(x2,y2,.080)],trim);
  frame(-w*.5-.065,-.06,w*.5+.065,.06);frame(-w*.5-.065,h-.052,w*.5+.065,h+.07);
  for(let j=0;j<=6;j++){const xx=w*(j/6-.5);const thick=j%3===0?.038:.019;frame(xx-thick,0,xx+thick,h);}
  for(let j=1;j<4;j++)frame(-w/2,h*j/4-.019,w/2,h*j/4+.019);
  stoneSlab(b,f,x-w/2-.09,x+w/2+.09,y-.14,.11,.003,.17,0xa59e8c);
}
function house(b,s,[id,original]){
  const ring=area(original)>0?original:original.slice().reverse(),rand=random(id^124963);
  const frames=ring.map((a,i)=>edgeFrame(a,ring[(i+1)%ring.length]));
  const short=Math.min(...frames.filter(f=>f.length>1.8).map(f=>f.length));
  const eave=(short<4?2.51:2.93)+rand()*.61,rise=Math.max(.58,Math.min(2.29,(Number.isFinite(short)?short:3.4)*.225));
  const tiles=[0xa1a29c,0xaeb0a8,0x969993,0xbdb9ac,0xa3a49d,0x969993];
  roofGeometry(b,s,ring,id,eave,rise,tiles[id%tiles.length]);b.footprints.push(ring);
  // Front on a long face. Prefer the south light for east-west houses. A strict
  // footprint-bound threshold prevents the steps from blocking a narrow alley.
  const best=frames.reduce((prev,cur)=>cur.length*(1-.22*cur.ux)>prev.length*(1-.22*prev.ux)?cur:prev);
  if(best.length<3.3)return;
  const bays=Math.max(1,Math.min(7,Math.round(best.length/3.25)));
  const width=best.length/bays,door=Math.floor(bays*.48),dark=id%4===0?0x684b3e:id%3===0?0x536256:0x564840;
  for(let i=0;i<bays;i++){
    const x=(i+.5)*width;
    if(i===door){
      const w=Math.min(1.24,width*.66),y=.24,h=2.03;
      const points=[best.point(x+w/2,y,.043),best.point(x-w/2,y,.043),best.point(x-w/2,y+h,.043),best.point(x+w/2,y+h,.043)];
      s.face(id%4===0?'redwood':'timber-door',points,uvRect,id%4===0?0xbbaa91:0xe8e4d7);
      for(const offset of [-w/2,w/2])b.beam(best.point(x+offset,y,.07),best.point(x+offset,y+h+.085,.07),.092,dark,.11);
      b.beam(best.point(x-w/2-.10,y+h,.07),best.point(x+w/2+.10,y+h,.07),.13,dark,.15);
      stoneSlab(b,best,x-w*.6,x+w*.6,.02,.20,.01,.28,0xa8a397);
    }else windowBay(b,s,best,x,.91,Math.min(2.35,width*.76),1.26,dark);
  }
  if(id%5===0&&best.length>7){
    const v=best.point(best.length*.20,eave+.62,-.75);
    b.box(v[0],v[1],v[2],.35,.91,.38,0x807d72);
    b.box(v[0],v[1]+.9,v[2],.43,.09,.46,0x5c5d55);
  }
}
function wallSegment(b,s,f,a,c,h,stone,illuminated){
  if(c-a<.03)return;
  wallFace(s,f,stone?'brick':'lime',a,c,.12,h,0,illuminated?0xe2dfd2:0xbfbfb8);
  wallFace(s,f,'base',a,c,.04,.43,.012,0xb7b7ae,1.95,.94);
  wallFace(s,f,'brick',a,c,.02,h,-.31,0xc4c2b8);
  for(const u of [a,c])b.face([f.point(u,.02,-.31),f.point(u,.02),f.point(u,h),f.point(u,h,-.31)],0x929187);
  const p=(u,d,y)=>f.point(u,y,d);
  s.face('tile',[p(a,-.43,h+.015),p(a,-.16,h+.125),p(c,-.16,h+.125),p(c,-.43,h+.015)],[[a/.61,0],[a/.61,.5],[c/.61,.5],[c/.61,0]],0xa3a39b);
  s.face('tile',[p(a,-.16,h+.125),p(a,.09,h+.015),p(c,.09,h+.015),p(c,-.16,h+.125)],[[a/.61,.5],[a/.61,0],[c/.61,0],[c/.61,.5]],0xacaca5);
  s.face('eave',[p(c,.09,h-.10),p(a,.09,h-.10),p(a,.09,h+.02),p(c,.09,h+.02)],[[c/.205,0],[a/.205,0],[a/.205,1],[c/.205,1]],0xbebfb9);
  const pp=[f.point(a,0,.06),f.point(c,0,.06),f.point(c,0,-.34),f.point(a,0,-.34)];
  b.footprints.push(pp.map(p=>[p[0],p[2]]));
}
function yardGate(b,s,f,x,index,sign=-1){
  const w=1.59,h=2.29,sill=.22,p=(u,y,d=0)=>f.point(x+u,y,d),stone=0xa6a196;
  const grey=index%3===1,wood=grey?0x665f52:0x703d2e;
  for(const dir of [-1,1]){
    stoneSlab(b,f,x+dir*(w/2+.17)-.15,x+dir*(w/2+.17)+.15,sill,h,-.38,.13,0x9a978b);
    const u=x+dir*(w/2+.17);
    wallFace(s,f,'brick',u-.15,u+.15,sill,sill+h,.134,index%2===0?0xcfcec6:0xbabcb3,2.35,1.68);
    wallFace(s,f,'base',u-.175,u+.175,sill,.60,.164,0xc7c3b6,1.95,.97);
    stoneSlab(b,f,x+dir*(w/2+.17)-.18,x+dir*(w/2+.17)+.18,.1,.43,-.14,.27,stone);
    b.beam(p(dir*w/2,sill,-.12),p(dir*w/2,h+sill,-.12),.18,wood,.22);
  }
  // A few gateways remain open with a view through to the next row of houses.
  const open=index%5===2;
  if(!open){
    s.face(grey?'timber-door':'redwood',[p(w/2,sill,-.17),p(-w/2,sill,-.17),p(-w/2,h+sill,-.17),p(w/2,h+sill,-.17)],uvRect,grey?0xece9dc:0xb8a99d);
    if(!grey){
      b.beam(p(0,sill,-.145),p(0,h+sill,-.145),.022,0x422c26,.03);
      for(const direction of [-1,1]){
        const u=.10*direction;b.face([p(u-.04,1.25,-.13),p(u+.04,1.25,-.13),p(u+.05,1.36,-.13),p(u-.05,1.36,-.13)],0x8c7b53);
        b.beam(p(u-.029,1.29,-.094),p(u+.029,1.29,-.094),.027,0x5d5749,.04);
      }
    }
    b.footprints.push([p(w/2,0,-.14),p(-w/2,0,-.14),p(-w/2,0,-.30),p(w/2,0,-.30)].map(v=>[v[0],v[2]]));
  }else{
    const leaf=.52;s.face('redwood',[p(-w/2,sill,-.19),p(-w/2,sill,-.19-leaf),p(-w/2,h+sill,-.19-leaf),p(-w/2,h+sill,-.19)],uvRect,0x998e7f);
  }
  stoneSlab(b,f,x-w*.61,x+w*.61,.10,.10,-.61,.47,0xb5b0a3);
  stoneSlab(b,f,x-w*.58,x+w*.58,.20,.10,-.52,.22,0xc0b8a9);
  if(index===18||index===7||index===3){
    for(const dir of [-1,1]){
      const near=dir*(w/2+.17),ww=.108,bot=.56,top=2.29,d=.141;
      s.face(dir<0?'blessing-left':'blessing-right',[p(near+ww,bot,d),p(near-ww,bot,d),p(near-ww,top,d),p(near+ww,top,d)],uvRect,0xe5ceb3);
    }
  }
  b.beam(p(-1.11,2.54),p(1.11,2.54),.23,wood,.25);
  for(const u of [-.51,.51])b.beam(p(u,2.56,.02),p(u,2.56,.20),.13,wood,.14);
  // Small covered vestibule in front of the compound. The cap tiles and
  // ornamental drip edges repeat at domestic scale across both short slopes.
  const stops=[[-.85,2.71],[-.54,2.83],[-.19,3.03],[.13,2.84],[.49,2.71]];
  for(let i=1;i<stops.length;i++){
    const [a,y]=stops[i-1],[c,z]=stops[i];
    s.face('tile',[p(-1.28,y,a),p(-1.28,z,c),p(1.28,z,c),p(1.28,y,a)],[[0,Math.abs(a+.19)],[0,Math.abs(c+.19)],[4.2,Math.abs(c+.19)],[4.2,Math.abs(a+.19)]],0xa6a89e);
  }
  for(const u of [-1.265,1.265]){
    const gable=stops.map(([d,y])=>p(u,y-.045,d));gable.push(p(u,2.57,.49),p(u,2.57,-.85));
    s.face('brick',gable,[...stops.map(([d,y])=>[d/2.3,y/1.6]),[.49/2.3,2.57/1.6],[-.85/2.3,2.57/1.6]],0xaaa99e);
    for(let j=1;j<stops.length;j++){
      const [a,y]=stops[j-1],[c,z]=stops[j];
      b.beam(p(u,y,a),p(u,z,c),.092,0x77776e,.121);
    }
  }
  for(let i=-5;i<=5;i++){
    const u=i*.22;b.beam(p(u,2.57,-.04),p(u,2.62,.46),.060,0x6a5542,.072);
  }
  b.beam(p(-1.3,3.07,-.19),p(1.3,3.07,-.19),.105,0x686860,.14);
  b.face([p(-1.28,2.68,.49),p(1.28,2.68,.49),p(1.28,2.61,-.85),p(-1.28,2.61,-.85)],0x50473d);
  s.face('eave',[p(1.28,2.54,.50),p(-1.28,2.54,.50),p(-1.28,2.73,.50),p(1.28,2.73,.50)],[[10.2,0],[0,0],[0,1],[10.2,1]],0xc9c7bd);
  if(sign>=0)s.face('sign'+sign,[p(2.24,1.68,.033),p(1.50,1.68,.033),p(1.50,1.92,.033),p(2.24,1.92,.033)],uvRect,0xf2efe3);
}
function streetFurniture(b,s){
  const signed=new Set(),laneIndex=new Map(lanes.map(([id],i)=>[id,i]));
  for(const [i,[id,side,a,c]] of walls.entries()){
    const f=side>0?edgeFrame(a,c):edgeFrame(c,a),L=f.length,height=1.97+.12*(i%4);
    const gate=L>6.5;
    if(!gate){wallSegment(b,s,f,0,L,height,i%3!==1,true);continue;}
    const centre=L*(.44+.075*(i%3));
    wallSegment(b,s,f,0,centre-1.10,height,i%4!==1,true);
    wallSegment(b,s,f,centre+1.10,L,height,i%4!==1,true);
    const plate=signed.has(id)&&i!==18?-1:laneIndex.get(id);signed.add(id);
    yardGate(b,s,f,centre,i,plate);
  }
  // Miter each turn; these textured strips follow the very same OSM centrelines.
  for(const [,name,half,path] of lanes){
    let distance=0,previous=null;
    for(let i=0;i<path.length;i++){
      const here=path[i],a=path[Math.max(0,i-1)],c=path[Math.min(path.length-1,i+1)],prev=i?edgeFrame(a,here):edgeFrame(here,c),next=i+1<path.length?edgeFrame(here,c):prev;
      const sumX=prev.uz+next.uz,sumZ=-prev.ux-next.ux,length=Math.hypot(sumX,sumZ);
      const nx=sumX/length,nz=sumZ/length,miter=half/Math.max(.5,nx*prev.uz-nz*prev.ux),y=.151;
      const row=[-1,1].map(side=>[here[0]+side*nx*miter,y,here[1]+side*nz*miter]);
      if(previous){
        const nextDist=distance+prev.length;
        s.face('paving',[previous[0],previous[1],row[1],row[0]],[[0,distance/2.7],[half/1.4,distance/2.7],[half/1.4,nextDist/2.7],[0,nextDist/2.7]],0xaaa9a0);
        distance=nextDist;
      }
      previous=row;
    }
  }
}
function courtTree(b,s,[x,z,r,h],index){
  const rand=random(index*1561+493733),phase=rand()*Math.PI*2;
  const stem=[x+.27*(rand()-.5),h*.56,z+.27*(rand()-.5)];
  b.beam([x,.08,z],stem,r*.119,0x665a43,r*.117);
  for(let j=0;j<10;j++){
    const angle=phase+j*2.40,cs=Math.cos(angle),sn=Math.sin(angle),length=r*(j<7?.71:.37)*(1+.28*rand());
    const y=h*(j<7?.66+rand()*.16:.87+rand()*.07),px=x+cs*length,pz=z+sn*length;
    const join=[x+cs*length*.38,y-.9,z+sn*length*.38];
    b.beam([stem[0],h*(.36+.019*j),stem[2]],join,.12*(1-.038*j),0x6d6048);
    b.beam(join,[px,y,pz],.078,0x74684d);
    for(let k=0;k<4;k++){
      const az=angle+k*1.67+rand()*.41,dx=Math.cos(az),dz=Math.sin(az),up=.32+rand()*.46;
      const width=r*(.44+.24*rand()),height=r*(.36+.15*rand()),w=width,v=height;
      const cx=px+dx*width*.34,cz=pz+dz*width*.34,cy=y+(rand()-.48)*r*.32;
      const P=(a,c)=>[cx+dx*a+dz*c*up,cy+c*(1-up*.44),cz+dz*a-dx*c*up];
      s.face('foliage',[P(-w,-v),P(w,-v),P(w,v),P(-w,v)],uvRect,j<5?0xc2c5ab:0xd9dec0);
    }
  }
}
function laneDetails(b,s){
  // Everyday fittings follow the mapped frontage of way 1468427085,
  // across the lane from the courtyard entrances. Their exact positions are illustrative.
  const f=edgeFrame([24.51,-2.75],[34.63,-2.86]);
  windowBay(b,s,f,3.53,.99,1.73,1.13,0x5c5747);
  windowBay(b,s,f,7.28,1.01,1.89,1.13,0x4e5547);
  const binned=edgeFrame([14.31,-5.34],[21.15,-5.22]);
  windowBay(b,s,binned,3.31,1.05,1.64,1.04,0x674d3c);
  const hung=(x,y,width,height)=>{
    stoneSlab(b,f,x-width/2,x+width/2,y,height,.02,.20,0x686d66);
    const p=(u,h,d)=>f.point(x+u,y+h,d);
    for(let j=0;j<7;j++)b.beam(p(-width*.33,.2+j*.031,.205),p(width*.33,.2+j*.031,.205),.015,0x3d4849);
    for(const a of [-.65,-.36]){
      const u=a*width;b.beam(p(u,0,.16),p(u,-.39,.16),.028,0x565c55);
    }
  };
  hung(5.67,1.62,.49,.63);
  function bicycle(f,x,depth,tone){
    const lift=.152,p=(u,v,d=0)=>f.point(x+u,v+lift,depth+d);
    for(const hub of [-.52,.52]){
      const R=.33,center=p(hub,.344);
      for(let i=0;i<18;i++){
        const a=i*Math.PI/9,c=(i+1)*Math.PI/9;
        const at=(r,t)=>p(hub+r*Math.cos(t),.344+r*Math.sin(t));
        b.beam(at(R,a),at(R,c),.041,0x363935,.038);
        b.beam(at(R-.033,a),at(R-.033,c),.018,0xb1adb0,.014);
        if(i%2===0)b.beam(center,at(R-.039,a),.013,0xaaa9a3,.012);
      }
    }
    const tube=(a,c,w,color)=>b.beam(p(...a),p(...c),w,color);
    const chain=[[-.52,.344],[-.05,.29],[-.17,.78],[-.52,.344]];
    for(let i=1;i<chain.length;i++)tube(chain[i-1],chain[i],.037,tone);
    tube([-.05,.29],[.33,.75],.047,tone);tube([-.17,.76],[.33,.75],.042,tone);
    tube([.52,.34],[.32,.79],.035,tone);tube([-.16,.75],[-.20,.89],.029,0xaba9a0);
    tube([-.32,.91],[-.09,.91],.075,0x443c32);tube([.33,.76],[.27,.98],.033,0xb4b0a9);
    tube([.27,.98,-.14],[.27,.98,.14],.026,0xaea9a0);tube([-.05,.29],[-.10,.18],.023,0x96968d);
    tube([-.17,.17,.08],[-.03,.17,.08],.034,0x4d5049);
    // Bent metal rack, chain guard and wire handlebar basket.
    tube([-.72,.67],[-.34,.67],.029,0x777b74);tube([-.60,.67],[-.52,.34],.018,0x878982);
    for(const d of [-.145,.145]){
      tube([.38,.8,d],[.61,.8,d],.016,0x5e6058);tube([.36,.99,d],[.66,.99,d],.016,0x555a55);
      for(let k=0;k<5;k++){const a=.37+.060*k;tube([a,.80,d],[a+.035,.99,d],.012,0x74766b);}
    }
    tube([.60,.8,-.145],[.60,.8,.145],.015,0x5e6058);tube([.65,.99,-.145],[.65,.99,.145],.015,0x5e6058);
  }
  bicycle(f,4.72,.37,0x427774);
  bicycle(binned,4.39,.32,0x876140);
  const eastern=edgeFrame([20.11,52.68],[19.64,48.45]);
  bicycle(eastern,.88,.38,0x4b655e);
  const grate=(frame,u,v)=>{
    const p=(x,z,height)=>frame.point(u+x,height,v+z);
    b.face([p(-.28,-.15,.166),p(.28,-.15,.166),p(.28,.15,.166),p(-.28,.15,.166)],0x4f534f);
    for(let i=-3;i<=3;i++)b.beam(p(i*.07,-.125,.174),p(i*.07,.125,.174),.021,0x84857c,.022);
  };
  grate(f,7.8,.47);grate(binned,2.5,.49);
  const planters=[[25.28,-3.13,.28],[25.92,-3.12,.21],[14.57,-5.77,.22],[27.13,-8.05,.21],[18.01,54.16,.22]];
  for(const [i,[x,z,r]] of planters.entries()){
    const y=.12,rim=.94*r,top=y+r*1.49;
    b.lathe(x,z,[[r*.64,y],[r*.82,y+.07],[rim,top-.035],[r,top],[r,top+.045],[r*.87,top+.045]],10,i%3===0?0x827d73:0x956f52);
    b.cylinder(x,z,top,r*.83,.009,0x574935,10);
    const rand=random(410+i);
    for(let j=0;j<12;j++){
      const t=j*2.4,cs=Math.cos(t),sn=Math.sin(t),root=[x,top,z];
      const width=r*(.14+rand()*.18),dist=r*(.19+rand()*.94),H=r*(.75+rand()*1.66);
      const tip=[x+cs*dist,top+H,z+sn*dist],middle=[x+cs*dist*.42,top+H*.74,z+sn*dist*.42];
      const left=[middle[0]+sn*width,middle[1],middle[2]-cs*width],right=[middle[0]-sn*width,middle[1],middle[2]+cs*width];
      b.face([root,left,tip],0x64784b);b.face([root,tip,right],0x4d6644);
    }
  }
}

export function buildHutong(batch){
  const surfaces=new Surfaces();
  for(const row of houses)house(batch,surfaces,row);
  streetFurniture(batch,surfaces);
  laneDetails(batch,surfaces);
  const closeCanopies=new NatureMeshes();
  trees.forEach((t,i)=>{
    const [x,z,r,h]=t;
    if((Math.abs(z+6)<14 && x>8 && x<45)||(Math.abs(x-19)<9 && z>36 && z<68))addTree(closeCanopies,x,z,h,r,281743+i,false,1,.1);
    else courtTree(batch,surfaces,t,i);
  });
  batch.decals.push(...closeCanopies.finish());
  surfaces.finish(batch);
}
