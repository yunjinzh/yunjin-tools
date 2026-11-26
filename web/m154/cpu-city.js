import {ShapeUtils, Vector2} from 'three';
import {loadBeijing} from './data/beijing.js';
import {SpatialIndex,projectArea,inPolygon,ringArea,edgeDistance,lineVertices,roadWidth,propertyHeight,landmarkIndex,templeCourtWays,replacedRefs,seedAt,rngGenerator} from './city.js';

const TILE=250, FAR_TILE=750, TAU=Math.PI*2;
const bound=(x,a,b)=>Math.max(a,Math.min(b,x));
const foliage=[[75,98,56],[79,100,53],[98,114,65],[86,109,65],[76,91,48],[103,118,72]];
const walls=[[177,169,154],[186,180,168],[158,166,168],[168,166,157],[179,171,162]];
const roofs=[[145,141,130],[143,143,136],[158,151,137],[135,137,132],[152,149,138]];
const footway=/^(footway|path|steps|cycleway|pedestrian|bridleway|corridor|platform)$/;
const white=[225,224,203],stone=[174,162,142],parkWater=[71,113,113];
const key=(i,j)=>i+','+j;
const tint=(color,factor)=>color.map(v=>Math.round(bound(v*factor,0,255)));

class MeshBuilder {
  constructor(){this.pos=[];this.index=[];this.colors=[];this.normals=[];this.lit=[];this.trees=[];this.limits=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity];}
  v(x,y,z){const i=this.pos.length/3;this.pos.push(x,y,z);const b=this.limits;
    b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.min(b[2],z);b[3]=Math.max(b[3],x);b[4]=Math.max(b[4],y);b[5]=Math.max(b[5],z);return i;}
  tri(a,b,c,color,up=false,lit=0) {
    const p=this.pos,i=a*3,j=b*3,k=c*3;
    const x=p[j]-p[i],y=p[j+1]-p[i+1],z=p[j+2]-p[i+2];
    const X=p[k]-p[i],Y=p[k+1]-p[i+1],Z=p[k+2]-p[i+2];
    let nx=y*Z-z*Y,ny=z*X-x*Z,nz=x*Y-y*X;
    const d=Math.hypot(nx,ny,nz);
    if(d<.0001)return;
    if(up && ny<0){[b,c]=[c,b];nx=-nx;ny=-ny;nz=-nz;}
    this.index.push(a,b,c);this.colors.push(...color);
    this.normals.push(Math.round(127*nx/d),Math.round(127*ny/d),Math.round(127*nz/d));this.lit.push(lit);
  }
  quad(a,b,c,d,color,up=false,lit=0){this.tri(a,b,d,color,up,lit);this.tri(b,c,d,color,up,lit);}
  finish(id){
    const b=this.limits;
    for(const [x,z,h,r] of this.trees){
      b[0]=Math.min(b[0],x-r);b[1]=Math.min(b[1],0);b[2]=Math.min(b[2],z-r);
      b[3]=Math.max(b[3],x+r);b[4]=Math.max(b[4],h);b[5]=Math.max(b[5],z+r);
    }
    if(!Number.isFinite(b[0]))b.fill(0);
    const center=[(b[0]+b[3])*.5,(b[1]+b[4])*.5,(b[2]+b[5])*.5];
    const bounds={center,radius:Math.hypot(b[3]-b[0],b[4]-b[1],b[5]-b[2])*.5};
    return {id,bounds,trees:this.trees,pos:new Float32Array(this.pos),index:new Uint32Array(this.index),colors:new Uint8Array(this.colors),normals:new Int8Array(this.normals),emissive:new Uint8Array(this.lit),origin:[0,0,0]};}
}
function base(writer,poly,y,color){
  const paths=[poly.ring,...poly.holes].map(r=>r.map(p=>new Vector2(p.x,p.z)));
  let tris;
  if(paths.length===1&&paths[0].length===4){
    const r=paths[0],signs=[];
    for(let i=0;i<4;i++){
      const a=r[i],b=r[(i+1)%4],c=r[(i+2)%4];signs.push(Math.sign((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)));
    }
    if(signs.every(s=>s===signs[0]))tris=[[0,1,2],[0,2,3]];
  }
  if(!tris)tris=ShapeUtils.triangulateShape(paths[0],paths.slice(1));
  const ix=[];
  for(const r of [poly.ring,...poly.holes])for(const p of r)ix.push(writer.v(p.x,y,p.z));
  for(const [a,b,c] of tris)writer.tri(ix[a],ix[b],ix[c],color,true);
}
function wallQuad(w,a,b,low,high,offset,side,color,lamp=0){
  const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;
  const sx=side*dz*offset/len,sz=-side*dx*offset/len;
  const A=w.v(a.x+sx,low,a.z+sz),B=w.v(a.x+sx,high,a.z+sz),C=w.v(b.x+sx,high,b.z+sz),D=w.v(b.x+sx,low,b.z+sz);
  if(side>0)w.quad(A,B,C,D,color,false,lamp);else w.quad(D,C,B,A,color,false,lamp);
}
const glazing=[
  [[70,100,113],[153,178,187]],[ [73,108,130],[159,182,194] ],
  [[93,102,107],[173,176,173]],[[80,102,101],[143,167,157]],
  [[89,96,104],[162,166,176]],[[99,97,91],[177,166,148]]
];
function mixColor(a,b,t){return [Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];}
function windowFace(w,a,b,sign,h,seed,lod,glass) {
  const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
  const tall=h>=48,near=lod===0;
  if(len<3.3||h<5.8||lod>1&&!tall)return;
  const floors=bound(Math.round(h/(glass?3.85:3.3)),1,lod===0?26:lod===1?14:7);
  const cols=bound(Math.round(len/(glass?4.8:4.2)),1,near?12:lod===1?7:4);
  const shades=glazing[Math.floor(seed*glazing.length)];
  const cuts=lod<2?cols:Math.min(4,cols),cellY=h/floors;
  for(let q=0;q<floors;q++){
    const t=(q+.5)/floors,low=glass?(q+.06)*cellY:(q+.24)*cellY,high=glass?(q+.88)*cellY:(q+.78)*cellY;
    for(let k=0;k<cuts;k++){
      const ix=(k+.5)/cuts;
      const shadowSky=.12*Math.sin((ix*1.8+seed*.87)*Math.PI)+.08*Math.sin(q*1.55+seed*9);
      const reflected=bound(.16+.66*t+shadowSky+.065*seedAt(k+q,seed+12.72),.04,.98);
      const color=glass?mixColor(shades[0],shades[1],reflected):mixColor([70,78,78],[139,158,158],.22+reflected*.66);
      const gap=glass?.12:Math.min(1.2,len/cuts*.18),l=k/cuts+gap/len,r=(k+1)/cuts-gap/len;
      if(r<=l)continue;
      const A={x:a.x+dx*l,z:a.z+dz*l},B={x:a.x+dx*r,z:a.z+dz*r};
      const lit=seedAt(q*3+k+seed*11,k*.9+7);
      wallQuad(w,A,B,low,high,.085,sign,color,lit>.62?(95+78*lit)|0:10);
    }
  }
}
function ordinary(w,item,lod) {
  const {poly,height,seed,feature}=item,glass=height>=58||height>=24&&/office|commercial|hotel|retail/.test(feature.kind||'');
  const wc=glass?mixColor([119,135,137],[185,188,183],seed):walls[Math.floor(seed*walls.length)];
  base(w,poly,height,roofs[Math.floor(seed*roofs.length)]);
  let ringNo=0;
  for(const ring of [poly.ring,...poly.holes]){
    const sign=(ringArea(ring)>0?1:-1)*(ringNo++?-1:1);
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[j],b=ring[i],length=Math.hypot(a.x-b.x,a.z-b.z);
      if(length<.14)continue;
      wallQuad(w,a,b,0,height,0,sign,wc);
      if(lod<2||height>=45)windowFace(w,a,b,sign,height,seed,lod,glass);
    }
  }
}
function historical(w,item,lod){
  const {poly,height,feature}=item,r=poly.ring;
  let dx=1,dz=0,longest=0;
  for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],l=Math.hypot(b.x-a.x,b.z-a.z);if(l>longest){longest=l;dx=(b.x-a.x)/l;dz=(b.z-a.z)/l;}}
  let minA=Infinity,minB=Infinity,maxA=-Infinity,maxB=-Infinity;
  for(const p of r){const a=p.x*dx+p.z*dz,b=-p.x*dz+p.z*dx;minA=Math.min(minA,a);maxA=Math.max(maxA,a);minB=Math.min(minB,b);maxB=Math.max(maxB,b);}
  const cx=(minA+maxA)*.5*dx-(minB+maxB)*.5*dz,cz=(minA+maxA)*.5*dz+(minB+maxB)*.5*dx;
  let A=(maxA-minA)*.5,B=(maxB-minB)*.5;
  if(B>A){[dx,dz]=[-dz,dx];[A,B]=[B,A];}
  const transform=(x,y,z)=>w.v(cx+x*dx-z*dz,y,cz+x*dz+z*dx);
  const h=feature.height?height:bound(B*.59+4.2,5.5,13.8),eave=h*.66;
  const point=(s,t,y)=>transform(s,y,t);
  const ring=(a,b,y)=>[point(-a,-b,y),point(a,-b,y),point(a,b,y),point(-a,b,y)];
  let deck=ring(.97*A,.97*B,.53),ground=ring(.97*A,.97*B,0);
  const walls=ring(A*.83,B*.80,.53),top=ring(A*.83,B*.80,eave);
  for(let i=0;i<4;i++){
    const j=(i+1)%4;
    w.quad(ground[i],deck[i],deck[j],ground[j],[167,159,140]);
    w.quad(walls[i],top[i],top[j],walls[j],[144,61,43]);
  }
  w.quad(...deck,[187,177,153],true);
  const inner=ring(A*.97,B*.97,eave-.46),outer=ring(A*1.035,B*1.045,eave);
  for(let i=0;i<4;i++){const j=(i+1)%4;w.quad(inner[i],outer[i],outer[j],inner[j],[61,105,101]);}
  const steps=lod===0?4:2,segments=lod===0?6:3;
  function roofPoint(side,s,t){
    const a=A*1.046-Math.min(A*.76,B*.90)*t,b=B*1.045*(1-t)+.15*t,edges=[[-a,-b],[a,-b],[a,b],[-a,b]],
      left=edges[side],right=edges[(side+1)%4];
    const y=eave+(h-eave)*t**1.52+.45*Math.abs(2*s-1)**5*(1-t)**2;
    return point(left[0]+(right[0]-left[0])*s,left[1]+(right[1]-left[1])*s,y);
  }
  for(let side=0;side<4;side++){
    for(let j=0;j<steps;j++)for(let k=0;k<segments;k++){
      const l=k/segments,s=(k+1)/segments,t=j/steps,u=(j+1)/steps;
      w.quad(roofPoint(side,l,t),roofPoint(side,s,t),roofPoint(side,s,u),roofPoint(side,l,u),j===steps-1?[77,106,125]:[50,77,103],true);
    }
  }
}
function road(w,s,lod){
  const {a,b,half,kind}=s,walk=footway.test(kind),d=Math.hypot(b.x-a.x,b.z-a.z);
  if(d<.1||lod===2&&half<2.6)return;
  const nx=-(b.z-a.z)/d,nz=(b.x-a.x)/d,y=s.bridge?.46:(walk?.087:.15);
  const corner=(p,width,h)=>w.v(p.x+nx*width,h,p.z+nz*width);
  const strip=(left,right,h,c,lit=0)=>w.quad(corner(a,left,h),corner(b,left,h),corner(b,right,h),corner(a,right,h),c,true,lit);
  strip(-half,half,y,walk?[164,154,137]:half>5?[90,92,90]:[107,108,103],walk?0:8);
  if(!walk&&half>=4&&lod===0){
    strip(half-.16,half-.03,y+.015,[175,168,141],14);
    strip(-half+.03,-half+.16,y+.015,[175,168,141],14);
    if(half>=7)strip(-.12,.12,y+.019,[180,158,100],16);
  }
}
function tree(w,x,z,h,r,seed,lod){
  const count=lod===0?8:5,c=foliage[Math.min(foliage.length-1,Math.floor(seed*foliage.length))],rot=seed*TAU;
  if(lod<2){
    const R=r*.095,start=[],end=[];
    for(let i=0;i<4;i++){const a=i*TAU/4+rot;start.push(w.v(x+Math.cos(a)*R,0,z+Math.sin(a)*R));end.push(w.v(x+Math.cos(a)*R*.7,h*.56,z+Math.sin(a)*R*.7));}
    for(let i=0;i<4;i++){const n=(i+1)%4;w.quad(start[i],end[i],end[n],start[n],[112,92,66]);}
  }
  const lower=[],upper=[];
  for(let i=0;i<count;i++){
    const a=i*TAU/count+rot,rnd=seedAt(i+seed,seed*73),rad=r*(.86+.20*rnd);
    lower.push(w.v(x+Math.cos(a)*rad*.80,h*(.42+.05*rnd),z+Math.sin(a)*rad*.81));
    upper.push(w.v(x+Math.cos(a)*rad,h*(.65+.08*rnd),z+Math.sin(a)*rad*.91));
  }
  const tip=w.v(x+.18*r,h,z+.11*r),bottom=w.v(x,h*.35,z);
  for(let i=0;i<count;i++){
    const n=(i+1)%count;
    w.tri(bottom,lower[n],lower[i],tint(c,.73));
    w.quad(lower[i],upper[i],upper[n],lower[n],tint(c,.87+.08*(i%3)));
    w.tri(upper[i],tip,upper[n],tint(c,1.04+.03*(i%3)),true);
  }
}

function clipSide(input,axis,edge,sign) {
  const result=[];
  if(!input.length)return result;
  let a=input[input.length-1],aIn=sign*(a[axis]-edge)>=0;
  for(const b of input){
    const bIn=sign*(b[axis]-edge)>=0;
    if(aIn!==bIn){
      const t=(edge-a[axis])/(b[axis]-a[axis]);
      result.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
    }
    if(bIn)result.push(b);
    a=b;aIn=bIn;
  }
  return result;
}
function segmentTiles(a,b,emit) {
  const dx=b.x-a.x,dz=b.z-a.z,n=[0,1];
  if(dx!==0)for(let i=Math.floor(Math.min(a.x,b.x)/TILE)+1;i<=Math.floor(Math.max(a.x,b.x)/TILE);i++){const t=(i*TILE-a.x)/dx;if(t>0&&t<1)n.push(t);}
  if(dz!==0)for(let j=Math.floor(Math.min(a.z,b.z)/TILE)+1;j<=Math.floor(Math.max(a.z,b.z)/TILE);j++){const t=(j*TILE-a.z)/dz;if(t>0&&t<1)n.push(t);}
  if(n.length===2){emit(a,b);return;}
  n.sort((s,t)=>s-t);
  for(let i=1;i<n.length;i++){
    if(n[i]-n[i-1]<1e-8)continue;
    emit({x:a.x+dx*n[i-1],z:a.z+dz*n[i-1]},{x:a.x+dx*n[i],z:a.z+dz*n[i]});
  }
}

function decodeTrees(buffer){
  if(!buffer)return null;
  const d=new DataView(buffer);
  if(d.getUint32(0)!==0x424a5431)return null;
  const w=d.getUint16(4,true),h=d.getUint16(6,true),count=d.getUint16(8,true);
  if(!w||!h||buffer.byteLength!==1034+w*h*count)return null;
  return {w,h,count,palette:new Uint8Array(buffer,10,1024),data:new Uint8Array(buffer,1034)};
}
function paintTrees(atlas,options){
  if(!atlas)return;
  const {parts,camera,fx,fy,px,py,width,height,pixels,depth}=options;
  if(!parts||!pixels||!depth||!width||!height)return;
  const day=options.day??1,night=options.night??0,wet=options.wet??0,snow=options.snow??0,haze=options.haze??.00016,
    horizon=options.horizon||[150,165,174], e=camera.matrixWorld.elements,eye=camera.position;
  const tw=atlas.w,th=atlas.h,stride=tw*atlas.count,ids=atlas.data,pal=atlas.palette;
  for(const m of parts){
    if(!m.trees?.length)continue;
    const {center:c,radius:rad}=m.bounds;
    const dx=c[0]-eye.x,dy=c[1]-eye.y,dz=c[2]-eye.z,D=-e[8]*dx-e[9]*dy-e[10]*dz;
    if(D+rad<.8||Math.abs(e[0]*dx+e[1]*dy+e[2]*dz)>Math.max(0,D)*(width*.69/fx)+rad*2)continue;
    for(const [x,z,h,r,variant] of m.trees){
      const X=x-eye.x,Y=h*.50-eye.y,Z=z-eye.z;
      const zc=-(e[8]*X+e[9]*Y+e[10]*Z);if(zc<Math.max(r*.70,.85))continue;
      const xc=e[0]*X+e[1]*Y+e[2]*Z,yc=e[4]*X+e[5]*Y+e[6]*Z;
      const sx=px+fx*xc/zc,sy=py-fy*yc/zc,halfX=fx*r*1.04/zc;
      if(halfX<.63)continue;
      const halfY=fy/zc*(.5*h*Math.abs(e[5])+r*.81*Math.abs(e[9])),left=sx-halfX,top=sy-halfY;
      const x0=Math.max(0,Math.ceil(left-.5)),x1=Math.min(width-1,Math.floor(sx+halfX-.5));
      const y0=Math.max(0,Math.ceil(top-.5)),y1=Math.min(height-1,Math.floor(sy+halfY-.5));
      if(x0>x1||y0>y1)continue;
      const fog=bound(zc*haze/(1+Math.max(0,zc)*haze),0,.95),at=variant*tw,du=tw/(2*halfX),dv=th/(2*halfY);
      const light=(.86+.15*day)*(.99-.085*wet)*(1-.71*night),fogInv=1-fog;
      for(let yy=y0;yy<=y1;yy++){
        const v=bound(((yy+.5-top)*dv)|0,0,th-1),base=v*stride+at,row=yy*width,yr=v/th;
        const invDepth=1/Math.max(.65,zc-r*(.35+.43*Math.sin(Math.max(0,yr)*Math.PI)));
        for(let xx=x0;xx<=x1;xx++){
          const k=row+xx;
          if(invDepth<depth[k])continue;
          const u=bound(((xx+.5-left)*du)|0,0,tw-1),i=ids[base+u]*4,A=pal[i+3];
          if(A<60)continue;
          const coat=snow*.43*(1-yr*.45),mul=1-coat;
          let rr=(pal[i]*mul+219*coat)*light*fogInv+horizon[0]*fog;
          let gg=(pal[i+1]*mul+223*coat)*light*fogInv+horizon[1]*fog;
          let bb=(pal[i+2]*mul+226*coat)*light*fogInv+horizon[2]*fog;
          if(A<236){
            const blend=A/255,old=pixels[k],q=1-blend;
            rr=(old&255)*q+rr*blend;gg=((old>>>8)&255)*q+gg*blend;bb=((old>>>16)&255)*q+bb*blend;
          }
          pixels[k]=(0xff000000|(bb|0)<<16|(gg|0)<<8|(rr|0))>>>0;
          if(A>116)depth[k]=invDepth;
        }
      }
    }
  }
}

export async function createCpuCity({project,landmarks}){
  const [data,atlas,canopy]=await Promise.all([loadBeijing(),fetch(new URL('./imagery/canopies.bin',import.meta.url)).then(r=>r.ok?r.arrayBuffer():null).then(decodeTrees).catch(()=>null),fetch(new URL('./imagery/canopy.bin',import.meta.url)).then(r=>r.ok?r.arrayBuffer():null).then(b=>b?new Uint8Array(b):null).catch(()=>null)]);
  const nw=project(116.3232421875,40.07807142745009),se=project(116.5869140625,39.84228602074339);
  function green(x,z){
    if(!canopy)return 28;
    const col=bound(Math.floor(512*(x-nw.x)/(se.x-nw.x)),0,511),row=bound(Math.floor(597*(z-nw.z)/(se.z-nw.z)),0,596);
    return canopy[row*512+col]/4;
  }
  const marks=landmarkIndex(landmarks,project),solids=new SpatialIndex(92),wet=new SpatialIndex(160),paved=new SpatialIndex(140),roads=new SpatialIndex(112),greens=new SpatialIndex(180);
  const cells=new Map(),coarse=new Map(),farCache=new Map(),cache=new Map(),enabled={buildings:true,roads:true,vegetation:true,water:true,plazas:true};
  function cell(i,j){
    const id=key(i,j);let a=cells.get(id);
    if(!a){a={i,j,id,buildings:[],roads:[],waters:[],plazas:[]};cells.set(id,a);}
    return a;
  }
  const at=(x,z)=>cell(Math.floor(x/TILE),Math.floor(z/TILE));
  const fullBounds=data.meta.bounds,sw=project(fullBounds[0],fullBounds[1]),ne=project(fullBounds[2],fullBounds[3]);
  // Water and paved polygon triangles are indexed by their extent, so even long
  // sections of the palace moat or an Olympic plaza render from their banks.
  function flat(source,type,spatial){
    for(const f of source){
      const area=projectArea(f,project);if(!area)continue;
      spatial.insert(area,area.bb);
      const paths=[area.ring,...area.holes].map(r=>r.map(p=>new Vector2(p.x,p.z))),vertices=[...area.ring,...area.holes.flat()];
      const triangles=ShapeUtils.triangulateShape(paths[0],paths.slice(1));
      const tint=type==='waters'?parkWater:/asphalt|parking/.test(f.kind)?[125,125,118]:stone;
      for(const [a,b,c] of triangles){
        const p=vertices[a],q=vertices[b],r=vertices[c];
        const i0=Math.floor(Math.min(p.x,q.x,r.x)/TILE),i1=Math.floor(Math.max(p.x,q.x,r.x)/TILE);
        const j0=Math.floor(Math.min(p.z,q.z,r.z)/TILE),j1=Math.floor(Math.max(p.z,q.z,r.z)/TILE);
        if(i0===i1&&j0===j1){cell(i0,j0)[type].push([p,q,r,tint]);continue;}
        for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
          let part=clipSide([p,q,r],'x',i*TILE,1);
          part=clipSide(part,'x',(i+1)*TILE,-1);
          part=clipSide(part,'z',j*TILE,1);
          part=clipSide(part,'z',(j+1)*TILE,-1);
          for(let k=1;k+1<part.length;k++)cell(i,j)[type].push([part[0],part[k],part[k+1],tint]);
        }
      }
    }
  }
  flat(data.water,'waters',wet);flat(data.plazas||[],'plazas',paved);
  for(const f of data.parks){
    if(/pitch|golf|track|cemetery|recreation_ground/.test(f.kind))continue;
    const area=projectArea(f,project);if(!area)continue;area.kind=f.kind;greens.insert(area,area.bb);
  }
  let buildings=0;
  for(const f of data.buildings){
    if(replacedRefs.has(f.osmType+'/'+f.osmId))continue;
    const p=projectArea(f,project);if(!p||marks.hits(p.bb.x,p.bb.z))continue;
    const area=Math.abs(ringArea(p.ring));if(area<2.2)continue;
    const b=p.bb,seed=seedAt(b.x,b.z);
    solids.insert(p,{x0:b.x0-2,x1:b.x1+2,z0:b.z0-2,z1:b.z1+2});
    const entry={poly:p,feature:f,height:propertyHeight(f,area),seed,planArea:area,history:f.osmType==='way'&&templeCourtWays.has(f.osmId)};
    at(b.x,b.z).buildings.push(entry);
    const farKey=key(Math.floor(b.x/FAR_TILE),Math.floor(b.z/FAR_TILE));
    if(!coarse.has(farKey))coarse.set(farKey,[]);
    coarse.get(farKey).push(entry);
    buildings++;
  }
  for(const f of data.roads){
    const line=lineVertices(f.line,project),kind=f.kind.replace('_link',''),half=roadWidth(f,kind)/2;
    for(let i=1;i<line.length;i++){
      const a=line[i-1],b=line[i],segment={a,b,kind,half,bridge:f.bridge};
      segmentTiles(a,b,(p,q)=>at((p.x+q.x)/2,(p.z+q.z)/2).roads.push({a:p,b:q,kind,half,bridge:f.bridge}));
      roads.insert(segment,{x0:Math.min(a.x,b.x)-half-1,x1:Math.max(a.x,b.x)+half+1,z0:Math.min(a.z,b.z)-half-1,z1:Math.max(a.z,b.z)+half+1});
    }
  }
  function blocked(x,z,radius=.55){
    if(marks.hits(x,z,radius)||solids.hits(x,z,radius))return true;
    if(!wet.hits(x,z))return false;
    return !roads.at(x,z).some(s=>s.bridge&&edgeDistance(x,z,s.a,s.b)<s.half+.5);
  }
  function mesh(i,j,lod){
    const cacheId=key(i,j)+'/'+lod;
    const old=cache.get(cacheId);if(old)return old;
    const tile=cell(i,j),w=new MeshBuilder();
    if(enabled.water||enabled.plazas)for(const [active,features,y] of [[enabled.water,tile.waters,.019],[enabled.plazas,tile.plazas,.064]]){
      if(active)for(const [p,q,r,c] of features)w.tri(w.v(p.x,y,p.z),w.v(q.x,y,q.z),w.v(r.x,y,r.z),c,true);
    }
    if(enabled.roads)for(const s of tile.roads)road(w,s,lod);
    if(enabled.buildings)for(const item of tile.buildings){
      if(lod===2&&item.height<8&&item.planArea<140)continue;
      if(item.history)historical(w,item,lod);else ordinary(w,item,lod);
    }
    if(enabled.vegetation){
      const rng=rngGenerator(seedAt(i+.3284,j+.9481));
      const step=lod===0?18.8:lod===1?27.8:49, count=Math.floor(TILE/step);
      for(let a=0;a<count;a++)for(let b=0;b<count;b++){
        const x=(i+(a+.15+.70*rng())/count)*TILE,z=(j+(b+.15+.70*rng())/count)*TILE;
        const weight=green(x,z),rand=rng();
        if(weight<9||rand>bound((weight-5)/23,.08,.78))continue;
        if(!greens.at(x,z).some(p=>inPolygon(x,z,p))||marks.hits(x,z)||solids.hits(x,z)||paved.hits(x,z)||wet.hits(x,z))continue;
        if(roads.at(x,z).some(s=>edgeDistance(x,z,s.a,s.b)<s.half+1.15))continue;
        const seed=seedAt(x,z),extra=lod===2?1.18:1;
        const h=(6.1+seed*6.5)*extra,r=(3.1+rand*2.7)*extra;
        if(atlas)w.trees.push([x,z,h,r,Math.min(7,Math.floor(seed*8))]);
        else tree(w,x,z,h,r,seed,lod);
      }
    }
    const result=w.finish(cacheId);result.tile={i,j,span:TILE};cache.set(cacheId,result);
    if(cache.size>160)cache.delete(cache.keys().next().value);
    return result;
  }
  function near(x,z,r=1000,maximum=24){
    const radius=bound(Number(r)||1000,110,4600),max=bound(Number(maximum)||24,1,150);
    const picks=[];
    for(let j=Math.floor((z-radius)/TILE);j<=Math.floor((z+radius)/TILE);j++)for(let i=Math.floor((x-radius)/TILE);i<=Math.floor((x+radius)/TILE);i++){
      const X=(i+.5)*TILE,Z=(j+.5)*TILE;if(X<sw.x-TILE||X>ne.x+TILE||Z<ne.z-TILE||Z>sw.z+TILE)continue;
      const d=Math.hypot(X-x,Z-z);
      if(d>radius+.707*TILE)continue;
      picks.push({i,j,d});
    }
    picks.sort((a,b)=>a.d-b.d);
    const out=[];
    for(const p of picks.slice(0,max)){
      const lod=p.d<270?0:p.d<680?1:2;
      const obj=mesh(p.i,p.j,lod);if(obj.index.length||obj.trees.length)out.push(obj);
    }
    return out;
  }
  function far(x,z,r=5500) {
    if(!enabled.buildings)return [];
    const out=[],radius=bound(r,850,8800);
    for(let j=Math.floor((z-radius)/FAR_TILE);j<=Math.floor((z+radius)/FAR_TILE);j++)for(let i=Math.floor((x-radius)/FAR_TILE);i<=Math.floor((x+radius)/FAR_TILE);i++){
      const id=key(i,j),list=coarse.get(id);if(!list)continue;
      const distance=Math.hypot((i+.5)*FAR_TILE-x,(j+.5)*FAR_TILE-z);
      if(distance>radius+.707*FAR_TILE)continue;
      const level=distance<1950?0:distance<3700?1:2,cacheKey=id+'/'+level;
      let mesh=farCache.get(cacheKey);
      if(!mesh){
        const w=new MeshBuilder();
        for(const item of list){
          const h=item.height;
          if(level===0?h<9&&item.planArea<400:level===1?h<17&&item.planArea<1300:h<26&&item.planArea<2400)continue;
          const {poly,seed}=item,b=poly.bb;
          // Keep the coarser shell inside the near roof and walls at overlaps.
          const shrink=p=>({x:b.x+(p.x-b.x)*.993,z:b.z+(p.z-b.z)*.993});
          const p={ring:poly.ring.map(shrink),holes:poly.holes.map(r=>r.map(shrink)),bb:b};
          const top=Math.max(1,h-Math.max(.35,h*.007)),colors=glazing[Math.floor(seed*glazing.length)];
          base(w,p,top,roofs[Math.floor(seed*roofs.length)]);
          for(const [rn,ring] of [p.ring,...p.holes].entries()){
            const s=(ringArea(ring)>0?1:-1)*(rn?-1:1);
            for(let pi=0,pj=ring.length-1;pi<ring.length;pj=pi++){
              const a=ring[pj],b=ring[pi];
              if(h>=40){
                const bands=level===0?5:3;
                for(let n=0;n<bands;n++)wallQuad(w,a,b,top*n/bands-.12,top*(n+1)/bands-.12,0,s,mixColor(colors[0],colors[1],.25+.57*(n+.5)/bands));
              }else wallQuad(w,a,b,-.13,top,0,s,walls[Math.floor(seed*walls.length)]);
            }
          }
        }
        mesh=w.finish('far/'+cacheKey);mesh.tile={i,j,span:FAR_TILE};farCache.set(cacheKey,mesh);
        if(farCache.size>320)farCache.delete(farCache.keys().next().value);
      }
      if(mesh.index.length)out.push(mesh);
    }
    return out;
  }
  function setLayer(name,on){
    const id=({park:'vegetation',parks:'vegetation',trees:'vegetation',building:'buildings'})[name]||name;
    if(Object.hasOwn(enabled,id)&&enabled[id]!==Boolean(on)){enabled[id]=Boolean(on);cache.clear();}
  }
  return {near,far,paintCpuTrees:args=>enabled.vegetation&&paintTrees(atlas,args),setLayer,isBlocked:blocked,stats:{...data.meta.counts,buildingMeshes:buildings},meta:data.meta,update(){}};
}
