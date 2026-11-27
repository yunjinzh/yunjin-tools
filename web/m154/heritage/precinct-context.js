// Physically located setting for the central-axis landmarks. All coordinates are metres.
import { ShapeUtils, Vector2 } from 'three';
import {finishOuterCourt,finishSleeveWall,replacedGatePart,outerCourtStone,gateStoneSide} from './precinct-court.js';
import { precinctData } from './precinct-data.js';
import { PrecinctFinishes, finishPalaceFlanks } from './precinct-finishes.js';

const wallTones = {red:0x9f443b,stone:0xc5beb0,neutral:0x947f6d};
const roofTones = {gold:0xc88c3e,grey:0x77766f,stone:0xcfc6b7,brick:0xa54d42,neutral:0x9e9484};
const edgeTones = {gold:0xd8a351,grey:0x66675f,stone:0xbcb2a3,brick:0x964a3e,neutral:0x8d8273};
const clamp=(n,l,h)=>Math.max(l,Math.min(h,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const xyz=([x,z],h)=>[x,h,z];
function signedArea(poly) {
  let a=0;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++)a+=poly[j][0]*poly[i][1]-poly[i][0]*poly[j][1];
  return a*.5;
}
function surface(b,polygon,height,tone,material='solid'){
  if(polygon.length<3||Math.abs(signedArea(polygon))<.001)return;
  if(signedArea(polygon)>0)polygon=[...polygon].reverse();
  b.face(polygon.map(p=>xyz(p,height(p))),tone,material);
}
function triangles(rings){
  const flat=rings.flat(),paths=rings.map(r=>r.map(([x,z])=>new Vector2(x,z)));
  return ShapeUtils.triangulateShape(paths[0],paths.slice(1)).map(t=>t.map(i=>flat[i]));
}
function clip(ring,test) {
  const result=[];
  let a=ring.at(-1),fa=test(a);
  for(const p of ring){const fp=test(p);
    if((fa<0)!==(fp<0)){const t=fa/(fa-fp);result.push([lerp(a[0],p[0],t),lerp(a[1],p[1],t)]);}
    if(fp>=0)result.push(p);
    a=p;fa=fp;
  }
  return result;
}
function extent(values){return [Math.min(...values),Math.max(...values)];}
function profile(ring,shape,compass,across){
  let axis=0,area=Infinity;
  for(let i=0;i<ring.length;i++){
    const [x,z]=ring[i],[u,v]=ring[(i+1)%ring.length],ang=Math.atan2(v-z,u-x);
    const c=Math.cos(ang),s=Math.sin(ang),A=extent(ring.map(p=>p[0]*c+p[1]*s)),B=extent(ring.map(p=>-p[0]*s+p[1]*c));
    const w=A[1]-A[0],d=B[1]-B[0];
    if(w*d<area){area=w*d;axis=ang+(w<d?Math.PI/2:0);}
  }
  if(across)axis+=Math.PI/2;
  const c=Math.cos(axis),s=Math.sin(axis),u=p=>p[0]*c+p[1]*s,v=p=>-p[0]*s+p[1]*c;
  const [u0,u1]=extent(ring.map(u)),[v0,v1]=extent(ring.map(v));
  if(shape==='skillion'){
    const downhill=compass==null?v:p=>p[0]*Math.sin(compass)-p[1]*Math.cos(compass);
    const [l,h]=extent(ring.map(downhill));return [p=>(h-downhill(p))/Math.max(.01,h-l)];
  }
  const w=Math.max(.08,u1-u0),d=Math.max(.08,v1-v0),planes=[p=>(v(p)-v0)*2/d,p=>(v1-v(p))*2/d];
  if(shape==='hipped'||shape==='pyramidal'){
    const end=shape==='hipped'?Math.min(w*.5,d*.49):w*.5;
    planes.push(p=>(u(p)-u0)/end,p=>(u1-u(p))/end);
  }
  return planes;
}
function timberBay(b,s,a,d,floor,cap,annex){
  const dx=d[0]-a[0],dz=d[1]-a[1],width=Math.hypot(dx,dz);
  if(width<(annex?5:9)||cap-floor<2.3)return;
  const nx=dz/width,nz=-dx/width;
  const pos=(t,y,out)=>[lerp(a[0],d[0],t)+nx*out,y,lerp(a[1],d[1],t)+nz*out];
  const bayCount=Math.max(2,Math.round(width/(annex?2.9:3.55))),sill=Math.max(floor+.40,cap-(annex?2.5:3.4));
  const head=cap-(annex?.24:.56);
  const frieze=[pos(0,head,.045),pos(1,head,.045),pos(1,cap,.045),pos(0,cap,.045)];
  s.face('beam',frieze,[[0,0],[width/10,0],[width/10,1],[0,1]]);
  for(let i=0;i<bayCount;i++){
    const lo=(i+.09)/bayCount,hi=(i+.91)/bayCount;
    const tex=[[0,.035],[.98,.035],[.98,1],[0,1]];
    const door=[pos(lo,sill,.037),pos(hi,sill,.037),pos(hi,head,.037),pos(lo,head,.037)];
    s.face('doors',door,tex);
    const q=pos(i/bayCount,floor+.25,.15);
    b.cylinder(q[0],q[2],floor+.24,annex?.105:.17,cap-floor-.22,0x88382a,6);
  }
  const q=pos(1,floor+.25,.15);
  b.cylinder(q[0],q[2],floor+.24,annex?.105:.17,cap-floor-.22,0x88382a,6);
  const bottom=[pos(0,floor,.19),pos(1,floor,.19),pos(1,floor+.31,.19),pos(0,floor+.31,.19)];
  s.face('stone',bottom,[[0,.24],[width*.24,.24],[width*.24,0],[0,0]]);
  b.beam(pos(0,floor+.30,.13),pos(1,floor+.30,.13),.20,0xc4bba5,.18);
  b.beam(pos(0,head,.10),pos(1,head,.10),.12,0x624438,.12);
}
function crown(b,outer,planes,h,finish){
  const ends=[];
  for(let i=0;i<outer.length;i++){
    const a=outer[i],d=outer[(i+1)%outer.length],fa=planes[0](a)-planes[1](a),fd=planes[0](d)-planes[1](d);
    if(fa*fd<0){const t=fa/(fa-fd);ends.push([lerp(a[0],d[0],t),lerp(a[1],d[1],t)]);}
  }
  if(ends.length!==2)return;
  let [a,d]=ends,lo=0,hi=1;
  for(let i=2;i<planes.length;i++){
    const fa=planes[i](a)-1,fd=planes[i](d)-1;
    if(fa<0&&fd<0)return;
    if(fa*fd<0){const t=fa/(fa-fd);if(fa<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);}
  }
  if(hi-lo<.01)return;
  const pos=t=>[lerp(a[0],d[0],t),h+.05,lerp(a[1],d[1],t)];
  b.beam(pos(lo),pos(hi),.17,finish==='gold'?0xca974d:0x77776d,.21);
}
function volume(b,row,s,id){
  const [ref,shape,floor,h,rise,compass,across,finish,body,rings,treatment]=row;
  const annex=ref==='way/523763737'||ref==='way/523763738';
  const detailStone=id==='palace'&&outerCourtStone(ref);
  const outer=rings[0],faces=triangles(rings),roof=roofTones[finish],wall=wallTones[body],base=h-rise;
  const center=outer.reduce(([x,z],p)=>[x+p[0]/outer.length,z+p[1]/outer.length],[0,0]);
  const near=Math.hypot(center[0],center[1])<(id==='palace'?275:240);
  const heroZone=near&&(annex||id==='tiananmen'||Math.abs(center[0])<175);
  const planes=shape==='flat'?[]:profile(outer,shape,compass,across);
  const height=t=>base+rise*clamp(t,0,1);
  const roofAt=p=>planes.length?height(Math.min(...planes.map(fn=>fn(p)))):h;
  for(let ri=0;ri<rings.length;ri++){
    const ring=rings[ri],reverse=(signedArea(ring)>0)!==(ri===0);
    for(let i=0;i<ring.length;i++){
      let a=ring[i],d=ring[(i+1)%ring.length];if(reverse)[a,d]=[d,a];
      const ha=roofAt(a),hd=roofAt(d);
      if(Math.max(ha,hd)-floor>.01){
        const side=[xyz(a,floor),xyz(a,ha),xyz(d,hd),xyz(d,floor)];
        if(detailStone)gateStoneSide(b,s,a,d,ha,hd,shape==='skillion');
        else if(near&&body==='red')s.masonry(side);else b.face(side,wall);
      }
      if(ri===0&&heroZone&&treatment==='timber'&&body!=='stone'&&floor<4&&(annex||Math.min(ha,hd)>5.4)){
        const spans=outer.map((p,i)=>Math.hypot(p[0]-outer[(i+1)%outer.length][0],p[1]-outer[(i+1)%outer.length][1]));
        if(Math.hypot(d[0]-a[0],d[1]-a[1])>=Math.max(...spans)*.64)timberBay(b,s,a,d,floor,Math.min(ha,hd),annex);
      }
      // Vertical gables peak halfway down the short face; endpoint heights alone miss them.
      if(shape==='gabled'){
        const fa=planes[0](a)-planes[1](a),fd=planes[0](d)-planes[1](d);
        if(fa*fd<0){const t=fa/(fa-fd),q=[lerp(a[0],d[0],t),lerp(a[1],d[1],t)];
          b.face([xyz(a,ha),xyz(q,h),xyz(d,hd)],wall);}
      }
    }
  }
  if(!planes.length){for(const t of faces){
    if(near&&finish==='stone'&&h<11){
      const points=signedArea(t)>0?[...t].reverse():t;
      s.face('stone',points.map(p=>xyz(p,h)),points.map(([x,z])=>[x/5.2,z/2.5]));
    }else surface(b,t,()=>h,roof);
  }return;}
  if(heroZone&&planes.length>=2&&rise>.8&&finish!=='stone')crown(b,outer,planes,h,finish);
  for(const tri of faces){
    for(let n=0;n<planes.length;n++){
      const fn=planes[n];let polygon=tri;
      for(let i=0;i<planes.length&&polygon.length>2;i++)if(i!==n)polygon=clip(polygon,p=>planes[i](p)-fn(p));
      if(polygon.length<3)continue;
      if(detailStone){
        const points=(signedArea(polygon)>0?[...polygon].reverse():polygon);
        s.face('stone',points.map(p=>xyz(p,height(fn(p)))),points.map(([x,z])=>[x/4.0,z/2.0]));
      }else if(near&&(finish==='gold'||finish==='grey')){
        const points=(signedArea(polygon)>0?[...polygon].reverse():polygon).map(p=>xyz(p,height(fn(p))));
        s.roof(finish,points);
      }else surface(b,polygon,p=>height(fn(p)),roof,finish==='gold'?'glaze':'solid');
    }
  }
  // Distinct ridge and eave edges survive aerial views without modern window bands.
  if(finish==='gold'&&rise>.6){
    for(let i=0;i<outer.length;i++){
      const a=outer[i],d=outer[(i+1)%outer.length];
      if(Math.hypot(d[0]-a[0],d[1]-a[1])>3)b.line(xyz(a,roofAt(a)+.035),xyz(d,roofAt(d)+.035),edgeTones[finish]);
    }
  }
}
function verticalSpan(ring,x){
  const zs=[];
  for(let i=0;i<ring.length;i++){
    const a=ring[i],c=ring[(i+1)%ring.length];
    if((a[0]<=x&&x<c[0])||(c[0]<=x&&x<a[0]))zs.push(lerp(a[1],c[1],(x-a[0])/(c[0]-a[0])));
  }
  return [Math.min(...zs),Math.max(...zs)];
}
// The four mapped polygons each contain three or four auditorium sections. Their
// fronts follow the curved canal bank. The tiers rise away from the water.
function grandstand(b,id,ring){
  const [lo,hi]=extent(ring.map(p=>p[0])),bays=(id===257208024||id===257208025)?4:3;
  for(let k=0;k<bays;k++){
    const l=lerp(lo,hi,k/bays)+.28,r=lerp(lo,hi,(k+1)/bays)-.28;
    const breaks=[l,...ring.map(p=>p[0]).filter(x=>x>l+.03&&x<r-.03),r].sort((a,c)=>a-c);
    for(let j=1;j<breaks.length;j++){
      const x0=breaks[j-1],x1=breaks[j];
      if(x1-x0<.03)continue;
      const at0=verticalSpan(ring,x0),at1=verticalSpan(ring,x1);
      const left=(t,y)=>[x0,y,lerp(at0[1],at0[0],t)],right=(t,y)=>[x1,y,lerp(at1[1],at1[0],t)];
      for(let tier=0;tier<9;tier++){
        const f=tier/9,n=(tier+1)/9,y=1.33+tier*.39;
        b.face([left(f,y),right(f,y),right(n,y),left(n,y)],tier%2?0xa8584d:0xb15b50);
        b.face([left(f,tier?y-.4:.08),right(f,tier?y-.4:.08),right(f,y),left(f,y)],tier?0x953f39:0xa34741);
        if(j===1)b.face([left(f,.08),left(f,y),left(n,y),left(n,.08)],0xa84c44);
        if(j===breaks.length-1)b.face([right(n,.08),right(n,y),right(f,y),right(f,.08)],0xa04a43);
      }
      b.beam(left(1,4.81),right(1,4.81),.19,0xb96859,.28);
      b.face([left(1,.08),left(1,4.55),right(1,4.55),right(1,.08)],0x96433e);
    }
  }
  b.footprints.push(ring);
}
const bridgeCenters=[[-157.9,5.6],[-28.7,3.65],[-17.8,4.2],[-3.9,5.2],[9.9,4.25],[21.1,3.55],[153.1,5.6]];
function bank(b,ring){
  for(let i=0;i<ring.length;i++){
    const p=ring[i],q=ring[(i+1)%ring.length],distance=Math.hypot(q[0]-p[0],q[1]-p[1]);
    const n=Math.max(1,Math.ceil(distance/3.6));
    for(let j=0;j<n;j++){
      const x=lerp(p[0],q[0],(j+.5)/n);
      if(bridgeCenters.some(([cx,half])=>Math.abs(x-cx)<half+.32))continue;
      const a=[lerp(p[0],q[0],j/n),lerp(p[1],q[1],j/n)],d=[lerp(p[0],q[0],(j+1)/n),lerp(p[1],q[1],(j+1)/n)];
      b.face([xyz(a,.02),xyz(d,.02),xyz(d,.48),xyz(a,.48)],0xb3a58c);
      b.beam(xyz(a,.48),xyz(d,.48),.30,j%3?0xd1c4a7:0xc6b99e,.41);
    }
  }
}
function vegetation(b,trees){
  for(const [i,[x,z,h]] of trees.entries()){
    const seed=Math.abs(Math.sin(x*18.4+z*9.2)),r=h*(.32+.08*seed);
    b.cylinder(x,z,0,r*.08,h*.6,0x79644c,5);
    const colors=[0x455936,0x4e603a,0x526844,0x586a42,0x586a3d,0x4e6341];
    for(let cap=0;cap<3;cap++){
      const angle=i+cap*2.11,dx=Math.sin(angle)*r*.34,dz=Math.cos(angle)*r*.34,rad=r*(.66+cap*.055);
      const base=h*(.34+cap*.055),roof=h*(.86+cap*.066);
      const ring=Array.from({length:6},(_,j)=>{const a=j*Math.PI/3+angle;return [x+dx+Math.cos(a)*rad,lerp(base,roof,.47+.07*Math.sin(i+cap+j)),z+dz+Math.sin(a)*rad];});
      for(let j=0;j<6;j++){
        const k=(j+1)%6;
        b.face([[x+dx,base,z+dz],ring[k],ring[j]],colors[(j+i)%4]);
        b.face([ring[j],[x+dx,roof,z+dz],ring[k]],colors[(i+cap+j)%6]);
      }
    }
  }
}
function grassPlot(b,ring){
  for(const t of triangles([ring]))surface(b,t,()=>.16,0x667344,'ground');
  for(let i=0;i<ring.length;i++){
    const p=ring[i],q=ring[(i+1)%ring.length];
    b.beam(xyz(p,.18),xyz(q,.18),.16,0xb2aa90,.19);
  }
}
function gatePaving(b,s,river,grass){
  // The central stone apron terminates before the mapped eastbound Chang'an asphalt.
  // Cut the actual river and lawn contours out of the surface, keeping the city water alive.
  const outer=[[-249,18],[-249,94],[248,93],[248,16]];
  for(const t of triangles([outer,river,...grass])){
    const r=signedArea(t)>0?[...t].reverse():t;
    s.face('stone',r.map(p=>xyz(p,.115)),r.map(([x,z])=>[x/7.6,z/3.7]));
  }
  for(let i=0;i<50;i++){
    const x=i*2.03-54;
    if(x>42)break;
    for(const [z0,z1] of [[21,53],[71.5,92.6]])b.line([x,.14,z0],[x,.14,z1],0xc0b7a7);
  }
  for(let j=0;j<27;j++){
    const z=21+j*2.65;if(z>53&&z<72)continue;
    b.line([-53,.14,z],[42,.14,z],0xc4bbaa);
  }
}
export function addPrecinctContext(b,id){
  const data=precinctData[id];if(!data)return;
  const finishes=new PrecinctFinishes();
  if(id==='palace')finishPalaceFlanks(b,finishes);
  for(const row of data.volumes){
    if(id!=='palace'||!replacedGatePart(row))volume(b,row,finishes,id);
    if(id==='palace')finishSleeveWall(b,finishes,row);
    const [,shape,low,, , , , ,body,rings]=row;
    // Only full-height ground-contact walls obstruct walking. Terraces, bridges and stairs remain accessible.
    if(low===0&&rings.length===1&&body!=='stone'&&shape!=='skillion')b.footprints.push(rings[0]);
  }
  if(id==='palace')finishOuterCourt(b,finishes);
  if(id!=='tiananmen'){finishes.finish(b);return;}
  const river=data.grounds.find(row=>row[1]==='river')[2],lawns=data.grounds.filter(row=>row[1]==='grass').map(row=>row[2]);
  gatePaving(b,finishes,river,lawns);
  for(const [osmId,kind,ring] of data.grounds){
    if(kind==='stand')grandstand(b,osmId,ring);
    else if(kind==='grass')grassPlot(b,ring);
    else if(kind==='river')bank(b,ring);
  }
  vegetation(b,data.trees);
  finishes.finish(b);
}
