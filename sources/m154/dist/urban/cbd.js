import * as T from 'three';
import {nightLighting} from '../heritage/gate-lights.js';
import {cbdBuildings} from './cbd-data.js';

export const cbdReplacedRefs=new Set(cbdBuildings.map(b=>'way/'+b.id));
const mix=(a,b,t)=>a+(b-a)*t;
const interp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const random=n=>{const t=Math.sin(n*23.7931+6.18)*417.719;return t-Math.floor(t);};
const shades={
  'guomao-a':[[45,65,77],[150,169,177]],'guomao-b':[[48,71,82],[150,176,184]],
  lantern:[[47,61,68],[138,156,162]],wing:[[54,70,79],[149,165,166]],
  samsung:[[53,74,89],[147,172,177]],fortune:[[49,75,92],[131,161,177]],cp:[[37,72,88],[129,168,179]],mall:[[49,62,62],[146,148,135]],
  zun:[[40,66,79],[146,172,185]],cctv:[[54,75,83],[151,173,179]]
};
const silver=[160,166,163],warmStone=[182,174,156],steel=[93,105,107];
const rgbLinear=Array.from({length:256},(_,n)=>T.ColorManagement.toWorkingColorSpace(new T.Color(n/255,n/255,n/255),T.SRGBColorSpace).r);
function signed(loop){return loop.reduce((s,a,i)=>{const b=loop[(i+1)%loop.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;}
function mean(loop){return loop.reduce((r,p)=>[r[0]+p[0]/loop.length,r[1]+p[1]/loop.length],[0,0]);}
export function paneShade(style,side,k,j,bays,floors,seed){
  const u=(k+.5)/bays,t=(j+.5)/floors;
  const lit=random(seed+Math.floor(k/2)*1.63+j*2.49+side*11.11);
  const horizon=.19+.41*random(side+seed)+.14*Math.sin((u+side)*9.3)+.065*Math.sin(u*27+seed);
  const sky=.20+.43*t+.105*Math.cos(u*6.2+side*1.12)+.07*Math.sin(t*11.6-u*4+side);
  const blend=clamp(sky+(t<horizon?-.16:.07)+.10*(lit-.5)+.13*Math.cos(side*1.61),.025,.96);
  const [a,b]=shades[style];return [interp(a,b,blend),lit>.66?.36+.48*random(j*1.07+seed+Math.floor(k/3)*2.17):.018];
}
// One face stream is shared by the PBR and software renderers. Glowing panes have
// a static daytime albedo; only their independent photometric channel varies with time.
export class CbdFaces {
  constructor(){this.pos=[];this.idx=[];this.tint=[];this.lamps=[];this.glass=[];}
  face(points,color,lamp=0,glazing=0){
    const i=this.pos.length/3,c=color.map(v=>clamp(Math.round(v),0,255));
    for(const p of points){this.pos.push(...p);this.tint.push(...c);this.lamps.push(lamp);this.glass.push(glazing);}
    for(let j=1;j+1<points.length;j++)this.idx.push(i,i+j,i+j+1);
  }
  gpu(name){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));
    g.setAttribute('color',new T.Float32BufferAttribute(this.tint.map(v=>rgbLinear[v]),3));
    g.setAttribute('cbdGlow',new T.Float32BufferAttribute(this.lamps,1));g.setAttribute('cbdGlass',new T.Float32BufferAttribute(this.glass,1));
    g.setIndex(this.idx);g.computeVertexNormals();g.computeBoundingSphere();const m=new T.Mesh(g,material());
    m.name=name;m.castShadow=true;m.receiveShadow=true;return m;
  }
  cpu(id){
    const colors=[],normals=[],emissive=[],v=new T.Vector3(),p=new T.Vector3(),q=new T.Vector3(),r=new T.Vector3();
    for(let i=0;i<this.idx.length;i+=3){const a=this.idx[i],b=this.idx[i+1],c=this.idx[i+2];
      p.fromArray(this.pos,a*3);q.fromArray(this.pos,b*3);r.fromArray(this.pos,c*3);v.crossVectors(q.sub(p),r.sub(p)).normalize();
      normals.push(Math.round(v.x*127),Math.round(v.y*127),Math.round(v.z*127));colors.push(this.tint[a*3],this.tint[a*3+1],this.tint[a*3+2]);emissive.push(Math.round(this.lamps[a]*255));
    }
    const pos=new Float32Array(this.pos),box=new T.Box3().setFromBufferAttribute(new T.BufferAttribute(pos,3)),sphere=box.getBoundingSphere(new T.Sphere());
    return {id:'cbd-'+id,cbd:true,origin:[0,0,0],bounds:{center:sphere.center.toArray(),radius:sphere.radius},pos,index:new Uint32Array(this.idx),colors:new Uint8Array(colors),normals:new Int8Array(normals),emissive:new Uint8Array(emissive)};
  }
}
let skin;
function material(){
  if(skin)return skin;
  skin=new T.MeshStandardMaterial({vertexColors:true,roughness:.29,metalness:.27,side:T.DoubleSide});skin.name='CBD curtain walls and stone';
  skin.onBeforeCompile=shader=>{
    shader.uniforms.uCbdNight=nightLighting;
    shader.vertexShader='attribute float cbdGlow; attribute float cbdGlass; varying vec2 vCbdPane;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vCbdPane=vec2(cbdGlow,cbdGlass);');
    shader.fragmentShader='varying vec2 vCbdPane; uniform float uCbdNight;\n'+shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(.73,.22,vCbdPane.y);').replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n metalnessFactor=mix(.09,.34,vCbdPane.y);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uCbdNight*vCbdPane.x*vec3(1.45,.95,.48);');
  };
  skin.userData.atlasReady=true;skin.customProgramCacheKey=()=>'beijing-cbd-curtain-wall-1';return skin;
}
function site(b,project){
  const ring=b.ring.map(pt=>{const p=project(...pt);return [p.x,p.z];});if(signed(ring)<0)ring.reverse();return ring;
}
export function cbdFootprints(project){return cbdBuildings.map(b=>{
  const loop=site(b,project),xs=loop.map(p=>p[0]),zs=loop.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  return {ring:loop.map(([x,z])=>({x,z})),holes:[],bb:{x0,x1,z0,z1,x:(x0+x1)/2,z:(z0+z1)/2}};
});}
function round(loop,clip,segments=1){
  const res=[];loop.forEach((p,i)=>{const a=interp(p,loop[(i+loop.length-1)%loop.length],clip),b=interp(p,loop[(i+1)%loop.length],clip);
    for(let q=0;q<=segments;q++){const t=q/segments;res.push(interp(interp(a,p,t),interp(p,b,t),t));}
  });return res;
}
function level(loop,center,y,scale=1){return loop.map(p=>[mix(center[0],p[0],scale),y,mix(center[1],p[1],scale)]);}
function walls(w,bottom,top,finish,light=0,glaze=0){for(let i=0;i<bottom.length;i++){const j=(i+1)%bottom.length;w.face([bottom[i],top[i],top[j],bottom[j]],finish,light,glaze);}}
function lid(w,loop,c){
  const poly=loop.map(p=>new T.Vector2(p[0],p[2]));for(const [a,b,d] of T.ShapeUtils.triangulateShape(poly,[]))w.face([loop[a],loop[d],loop[b]],c);
}
function ring(w,loop,ctr,y,from,to,color,glow=0){walls(w,level(loop,ctr,y,from),level(loop,ctr,y,to),color,glow);}
function posts(w,low,high,width,depth,finish,lit=0){
  for(let i=0;i<low.length;i++){
    const p=low[i],q=high[i],ax=width/2,az=depth/2;
    const profile=v=>[[-ax,-az],[ax,-az],[ax,az],[-ax,az]].map(([x,z])=>[v[0]+x,v[1],v[2]+z]);
    const B=profile(p),U=profile(q);walls(w,B,U,finish,lit);lid(w,U,finish);
  }
}
// Glazing and transoms tessellate the envelope without a coincident backing wall.
export function curtain(w,bot,top,style,side,floors,bays,seed,opts={}){
  const [a,b]=bot,[c,d]=top,pt=(u,t)=>interp(interp(a,b,u),interp(c,d,u),t);
  const strip=opts.belt??[70,84,89],spandrel=opts.spandrel??.16;
  for(let j=0;j<floors;j++){
    const bottom=j/floors,window=(j+spandrel)/floors,high=(j+1)/floors;
    w.face([pt(0,bottom),pt(0,window),pt(1,window),pt(1,bottom)],strip,opts.beltLight||0,.38);
    for(let k=0;k<bays;k++){
      const l=k/bays,r=(k+1)/bays,[rgb,lit]=paneShade(style,side,k,j+(opts.row||0),bays,opts.totalFloors||floors,seed);
      const reveal=opts.mullion??.035,end=r-reveal/bays;
      w.face([pt(l,window),pt(l,high),pt(end,high),pt(end,window)],rgb,lit*(opts.lightScale??1),1);
      if(end<r)w.face([pt(end,window),pt(end,high),pt(r,high),pt(r,window)],opts.frame||steel,.014,.34);
    }
  }
}
function glazedStack(w,loop,ctr,b,low,high,lowerScale,upperScale,lod,opts={}){
  const B=level(loop,ctr,low,lowerScale),U=level(loop,ctr,high,upperScale),step=lod===0?1:lod===1?2.6:6;
  const floorHeight=opts.floorHeight||4.1,rows=Math.max(1,Math.round((high-low)/(floorHeight*step)));
  for(let i=0;i<B.length;i++){
    const j=(i+1)%B.length,len=Math.hypot(B[j][0]-B[i][0],B[j][2]-B[i][2]);
    const bays=Math.max(1,Math.round(len/(step*(opts.bay||3.9))));
    curtain(w,[B[i],B[j]],[U[i],U[j]],b.style,i,rows,bays,b.id%71,{...opts,row:Math.round(low/(floorHeight*step)),totalFloors:Math.round(b.height/(floorHeight*step))});
  }
}
function mast(w,loop,ctr,low,high,size,finish,lit=0){const B=level(loop,ctr,low,size),U=level(loop,ctr,high,size);walls(w,B,U,finish,lit);lid(w,U,finish);}
function guomaoA(w,base,ctr,b,lod){
  const loop=round(base,.065),tiers=[[0,107,1,.975],[107,221,.975,.91],[221,297,.91,.846],[297,316,.846,.798]];
  for(const [lo,hi,a,d] of tiers){glazedStack(w,loop,ctr,b,lo,hi,a,d,lod,{spandrel:.13,lightScale:.74});
    const B=level(base,ctr,lo,a),U=level(base,ctr,hi,d);
    for(let side=0;side<4;side++){
      const k=(side+1)%4,count=lod===2?5:11;
      for(let i=1;i<count;i++){
        const u=i/count,P=interp(B[side],B[k],u),Q=interp(U[side],U[k],u),f=.0047;
        const P1=interp(B[side],B[k],u+f),Q1=interp(U[side],U[k],u+f);
        const jut=t=>[mix(ctr[0],t[0],1.031),t[1],mix(ctr[1],t[2],1.031)],tip=jut(P),tipTop=jut(Q);
        w.face([P,Q,tipTop,tip],silver,.14);w.face([tip,tipTop,jut(Q1),jut(P1)],[159,169,167],.22);
      }
    }
  }
  // Recessed crown sides, vertical fins, a small central roof landing surface.
  ring(w,loop,ctr,316,.798,.74,steel);mast(w,loop,ctr,316,323,.74,[119,132,129],.22);
  const B=level(loop,ctr,323,.74),U=level(loop,ctr,330,.69);walls(w,B,U,[150,161,156],.42,.65);lid(w,U,[114,125,125]);
  for(let i=0;i<4;i++){const j=(i+1)%4;const lens=[.12,.20,.3,.41,.50,.59,.7,.8,.88];
    const B=level(base,ctr,312,.801),U=level(base,ctr,328.7,.775);for(const t of lens)posts(w,[interp(B[i],B[j],t)],[interp(U[i],U[j],t)],.55,.55,silver,.57);}
}
function guomaoB(w,base,ctr,b,lod){
  const loop=round(base,.087),lo=32,top=288;
  for(let t=0;t<12;t++){
    const y=mix(lo,top,t/12),h=mix(lo,top,(t+1)/12),a=1-.09*t/12,d=a+.027;
    glazedStack(w,loop,ctr,b,y,h,a,d,lod,{spandrel:.115,floorHeight:4.5,bay:3.5,belt:[85,100,107]});
    walls(w,level(loop,ctr,h-.29,d+.001),level(loop,ctr,h,d+.001),[164,176,175],.21);
    ring(w,loop,ctr,h,d,1-.09*(t+1)/12,[77,100,108]);
  }
  mast(w,loop,ctr,top,294,.91,[115,139,147],.25);mast(w,loop,ctr,294,296,.89,[162,173,169],.29);
}
function yintai(w,base,ctr,b,lod){
  const hall=b.style==='lantern',low=hall?15:0,deck=hall?222:173,loop=base;
  glazedStack(w,loop,ctr,b,low,deck,1,1,lod,{spandrel:.33,belt:[154,155,148],mullion:.085,frame:[137,145,143],floorHeight:3.9});
  const B=level(loop,ctr,low,1),U=level(loop,ctr,deck,1);
  posts(w,B,U,1.1,1.1,[181,183,170],.045);mast(w,loop,ctr,deck,deck+2,1.012,silver,.14);
  if(!hall){mast(w,loop,ctr,deck+2,181,.86,[154,153,142]);mast(w,loop,ctr,181,186,.76,[122,130,129]);return;}
  // Stone-framed open lantern, with the luminous glass pyramid set back inside it.
  const baseY=deck+2,upper=b.height-2.1,postsBase=level(loop,ctr,baseY,.955),postsTop=level(loop,ctr,upper,.955);
  const inB=level(loop,ctr,baseY,.78),neck=level(loop,ctr,232,.82),tip=[ctr[0],247.1,ctr[1]];
  walls(w,inB,neck,[138,113,100],.73,1);for(let i=0;i<4;i++)w.face([neck[i],tip,neck[(i+1)%4]],[159,133,119],.94,1);
  posts(w,postsBase,postsTop,2.05,2.05,warmStone,.38);
  walls(w,level(loop,ctr,upper,.998),level(loop,ctr,b.height,.998),warmStone,.53);
  walls(w,level(loop,ctr,b.height,.895),level(loop,ctr,upper,.895),warmStone,.32);ring(w,loop,ctr,b.height,.998,.895,warmStone,.40);
}
function fortune(w,loop,ctr,b,lod){
  glazedStack(w,loop,ctr,b,0,241,1,.99,lod,{belt:[110,126,136],spandrel:.18});
  const B=level(loop,ctr,241,.99),U=level(loop,ctr,267,.99),minZ=Math.min(...U.map(p=>p[2])),maxZ=Math.max(...U.map(p=>p[2]));
  for(const p of U){const t=(p[2]-minZ)/(maxZ-minZ);p[1]=267-10*Math.sin(t*Math.PI)-4*t;}
  for(let i=0;i<B.length;i++){
    const j=(i+1)%B.length;curtain(w,[B[i],B[j]],[U[i],U[j]],'fortune',i,lod===2?2:5,lod===2?2:5,13,{totalFloors:60,row:54});
    const outside=p=>[mix(ctr[0],p[0],1.007),p[1],mix(ctr[1],p[2],1.007)];
    const a=outside(U[i]),c=outside(U[j]);w.face([a,c,[c[0],c[1]-.76,c[2]],[a[0],a[1]-.76,a[2]]],silver,.35);
  }
  lid(w,U,[108,120,125]);
}
function cp(w,base,ctr,b,lod){
  const loop=round(base,.17,lod===2?2:4);glazedStack(w,loop,ctr,b,0,216,1,1,lod,{belt:[65,93,106],spandrel:.12});
  const B=level(loop,ctr,216,1),U=level(loop,ctr,238,1),maxX=Math.max(...U.map(p=>Math.abs(p[0]-ctr[0])));
  for(const p of U){const t=(p[0]-ctr[0])/maxX;p[1]=238-6*(.5+.5*Math.cos(t*Math.PI)) - (b.id===599547915?0:.65)*(1-t*t);}
  for(let i=0;i<B.length;i++){const j=(i+1)%B.length;curtain(w,[B[i],B[j]],[U[i],U[j]],'cp',i,3,3,6,{row:39,totalFloors:45});}
  lid(w,U,[106,120,126]);for(let i=0;i<4;i++){const j=(i+1)%4;
    for(const t of [.16,.19,.81,.84]){const P=interp(base[i],base[j],t),Q=[P[0],234.8,P[1]];posts(w,[[P[0],0,P[1]]],[Q],.65,.65,[167,176,174],.12);}}
}
function samsung(w,base,ctr,b,lod){
  // Five-storey east-west podium, square tower shaft and a white projecting grid.
  const podium={...b,style:'mall',height:24};mall(w,base,ctr,podium,lod);
  const shell=base.map(([x,z])=>[ctr[0]+(x-ctr[0])*.64,ctr[1]+(z-ctr[1])*.88]);
  const top=shell.map(([x,z])=>[x,260-2.8*(x<ctr[0]?1:0),z]);
  glazedStack(w,shell,ctr,b,24,248,1,1,lod,{spandrel:.16,frame:[137,151,155],lightScale:.68});
  const B=level(shell,ctr,248);for(let i=0;i<4;i++){
    const j=(i+1)%4;curtain(w,[B[i],B[j]],[top[i],top[j]],'samsung',i,2,5,38,{totalFloors:57,row:54});
  }
  lid(w,top,[119,135,137]);
  for(let i=0;i<4;i++){
    const j=(i+1)%4;const A=shell[i],D=shell[j],len=Math.hypot(D[0]-A[0],D[1]-A[1]);
    const nx=(D[1]-A[1])/len,nz=-(D[0]-A[0])/len;
    const pt=(u,y,off=.27)=>[mix(A[0],D[0],u)+nx*off,y,mix(A[1],D[1],u)+nz*off];
    const bays=lod===2?6:12;
    for(let k=0;k<=bays;k++){
      const u=k/bays,hi=mix(top[i][1],top[j][1],u),half=.43/len,p=pt(u-half,24),q=pt(u+half,24);
      w.face([p,pt(u-half,hi),pt(u+half,hi),q],[184,192,191],.075);
      w.face([q,pt(u+half,hi),pt(u+half,hi,0),pt(u+half,24,0)],[127,141,145]);
    }
    for(let k=1;k<=22;k++){
      const y=24+k*10.5;w.face([pt(0,y-.42,.33),pt(0,y+.42,.33),pt(1,y+.42,.33),pt(1,y-.42,.33)],[187,194,191],.12);
    }
  }
}
function mall(w,loop,ctr,b,lod){
  glazedStack(w,loop,ctr,b,0,b.height,1,1,lod,{belt:[173,163,145],spandrel:.39,frame:[160,156,141],mullion:.12,bay:4.5});
  lid(w,level(loop,ctr,b.height,1),[134,135,125]);
}
function build(b,project,lod){
  const w=new CbdFaces(),loop=site(b,project),ctr=mean(loop);
  ({'guomao-a':guomaoA,'guomao-b':guomaoB,lantern:yintai,wing:yintai,fortune,cp,mall,samsung})[b.style](w,loop,ctr,b,lod);
  return w;
}
export function createCbdMeshes(project){return cbdBuildings.map(b=>{const m=build(b,project,0).gpu(b.name);m.userData.osmRef='way/'+b.id;return m;});}
const cpuCache=new WeakMap();
export function getCpuCbdMeshes(project,lod=1){
  if(!cpuCache.has(project))cpuCache.set(project,new Map());const list=cpuCache.get(project);
  if(!list.has(lod))list.set(lod,cbdBuildings.map(b=>build(b,project,lod).cpu(b.id)));
  return list.get(lod);
}
