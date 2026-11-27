import {NatureMeshes,addTree,addTreeCard} from './trees.js';
import {waterfrontWater,waterfrontBuildings} from './waterfront-data.js';
export {waterfrontWater};

const bank=[...waterfrontWater.ring.slice(103),...waterfrontWater.ring.slice(0,7)];
const deckLevel=.62;
const railShift=.24;
const total=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
function path(points){
  let dist=0;
  const segments=[];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],len=total(a,b);
    if(len>.05){segments.push({a,b,len,start:dist,dx:(b[0]-a[0])/len,dz:(b[1]-a[1])/len});dist+=len;}
  }
  function at(distance,offset=0){
    const s=segments.find(s=>s.start+s.len>=distance)||segments.at(-1),t=Math.max(0,Math.min(s.len,distance-s.start));
    return [s.a[0]+s.dx*t+s.dz*offset,s.a[1]+s.dz*t-s.dx*offset];
  }
  return {segments,length:dist,at};
}
const promenade=path(bank);
export function waterfrontDeckHeight(x,z){
  for(const s of promenade.segments){
    const a=x-s.a[0],b=z-s.a[1],along=a*s.dx+b*s.dz,out=a*s.dz-b*s.dx;
    if(along>=-.16&&along<=s.len+.16&&out>=-.12&&out<=6.0)return deckLevel*Math.min(1,(6.0-out)/1.0);
  }
  return 0;
}
function surface(mesh,key,v,unit,shade=1){
  mesh.face(key,v,v.map(([x,y,z])=>[x/unit,z/unit]),shade);
}
function quay(mesh,route,high,walk){
  const width=walk?5.05:.64;
  for(const s of route.segments){
    const p=(end,out,y)=>{const v=end?s.b:s.a;return[v[0]+out*s.dz,y,v[1]-out*s.dx];};
    const L=s.start/3.5,R=(s.start+s.len)/3.5;
    mesh.face('quay',[p(0,0,-.15),p(1,0,-.15),p(1,0,high),p(0,0,high)],[[L,0],[R,0],[R,.43],[L,.43]],.70);
    mesh.face('quay',[p(0,-.11,high-.15),p(1,-.11,high-.15),p(1,-.11,high),p(0,-.11,high)],[[L,0],[R,0],[R,.1],[L,.1]]);
    surface(mesh,'rail',[p(0,-.11,high),p(1,-.11,high),p(1,.53,high),p(0,.53,high)],2,.9);
    if(walk){
      surface(mesh,'deck',[p(0,.53,high),p(1,.53,high),p(1,width,high),p(0,width,high)],2.46);
      surface(mesh,'deck',[p(0,width,high),p(1,width,high),p(1,6.05,.15),p(0,6.05,.15)],2.46);
    }
  }
  // Weld the turning wedges on the outer side of the promenade.
  for(let i=1;walk&&i<route.segments.length;i++){
    const s=route.segments[i],prev=route.segments[i-1],x=s.a[0],z=s.a[1];
    const a=[x+width*prev.dz,high,z-width*prev.dx],b=[x+width*s.dz,high,z-width*s.dx];
    surface(mesh,'deck',[[x,high,z],b,a],2.46);
  }
}
function railSpan(mesh,a,b,detail){
  const l=total(a,b),nx=(b[1]-a[1])/l,nz=-(b[0]-a[0])/l;
  function q(end,y,deep){
    const v=end?b:a;return[v[0]+nx*deep,deckLevel+y,v[1]+nz*deep];
  }
  // A recessed panel with sloped shoulders, raised frame and continuous handrail.
  const section=[[.05,.105],[.12,.105],[.18,.06],[.22,.055],[.56,.055],[.61,.091],[.66,.112],[.72,.10],[.75,.062]];
  function strip(y,h,side,faceShade){
    const a0=q(0,y[0],y[1]*side),a1=q(1,y[0],y[1]*side),b1=q(1,h[0],h[1]*side),b0=q(0,h[0],h[1]*side);
    mesh.face('rail',[a0,a1,b1,b0],[[0,y[0]],[l/1.7,y[0]],[l/1.7,h[0]],[0,h[0]]],faceShade);
  }
  for(const s of [-1,1])for(let i=1;i<section.length;i++)strip(section[i-1],section[i],s,i===4?.80:1);
  surface(mesh,'rail',[q(0,.75,-.062),q(1,.75,-.062),q(1,.75,.062),q(0,.75,.062)],1.7);
  if(!detail)return;
  // Frames stand proud of each recessed stone field.
  for(const s of [-1,1])for(const [h,w] of [[.225,.018],[.535,.014]]){
    strip([h,.066],[h+w,.080],s,.93);strip([h+w,.080],[h+2*w,.065],s,.86);
  }
}
function post(mesh,p,angle,detail){
  const sz=.119,cos=Math.cos(angle),sin=Math.sin(angle);
  const box=(size,y)=>[[-size,-size],[size,-size],[size,size],[-size,size]].map(([x,z])=>[p[0]+cos*x-sin*z,deckLevel+y,p[1]+sin*x+cos*z]);
  const shaft=[[sz*1.25,0],[sz*1.25,.12],[sz,.17],[sz,.78],[sz*1.09,.81],[sz*1.07,.87],[sz*.90,.89]];
  for(let n=1;n<shaft.length;n++){
    const l=box(...shaft[n-1]),r=box(...shaft[n]);
    for(let j=0;j<4;j++){const k=(j+1)%4;mesh.face('rail',[l[j],l[k],r[k],r[j]],[[0,shaft[n-1][1]],[.23,shaft[n-1][1]],[.23,shaft[n][1]],[0,shaft[n][1]]]);}
  }
  const levels=[[.085,.88],[.113,.925],[.110,.95],[.073,.98],[.116,1.025],[.135,1.086],[.119,1.15],[.071,1.19],[.045,1.22],[.06,1.25],[.047,1.28],[.005,1.303]],n=detail?14:7;
  for(let i=1;i<levels.length;i++)for(let j=0;j<n;j++){
    function vertex(level,k){
      const a=k*Math.PI*2/n+angle,[r,y]=levels[level],rad=r*(detail?(k%2?.91:1.05):1);
      return [p[0]+Math.cos(a)*rad,deckLevel+y,p[1]+Math.sin(a)*rad];
    }
    mesh.face('rail',[vertex(i-1,j),vertex(i-1,j+1),vertex(i,j+1),vertex(i,j)],[[j/n,levels[i-1][1]],[(j+1)/n,levels[i-1][1]],[(j+1)/n,levels[i][1]],[j/n,levels[i][1]]],j%2?.96:1.02);
  }
}
// The OSM building footprints fix the position, orientation and size of the west-bank
// market and the six-sided island building. Their heights, roof profiles and joinery
// are representative of the lakeside architecture.
function waterfrontRoofs(batch,mesh){
  const timber=0x743d32,trim=0x403734,glass=0x5a6764;
  for(const {way,ring} of waterfrontBuildings){
    if(ring.length<3)continue;
    batch.footprints.push(ring);
    const cx=ring.reduce((v,p)=>v+p[0],0)/ring.length,cz=ring.reduce((v,p)=>v+p[1],0)/ring.length;
    if(way===584742867){
      const ridge=7.85,eave=4.6;
      batch.cylinder(cx,cz,.24,3.94,.52,0xa69c88,6);
      for(let i=0;i<ring.length;i++){
        const p=ring[i],q=ring[(i+1)%ring.length];
        const col=v=>[cx+(v[0]-cx)*.74,.65,cz+(v[1]-cz)*.74];
        const top=v=>[cx+(v[0]-cx)*.95,eave-.13,cz+(v[1]-cz)*.95];
        const [x,,z]=col(p);batch.cylinder(x,z,.65,.128,eave-.74,timber,7);batch.beam(top(p),top(q),.20,trim,.25);
        const at=(s,t)=>{
          const r=1.15*(1-t)+.020*t,x=(p[0]-cx)*(1-s)+(q[0]-cx)*s,z=(p[1]-cz)*(1-s)+(q[1]-cz)*s;
          return [cx+x*r,eave+(ridge-eave)*t**1.60+.35*Math.abs(2*s-1)**2*(1-t)**2,cz+z*r];
        };
        for(let b=0;b<4;b++)for(let c=0;c<4;c++){
          const v=[at(c/4,b/4),at((c+1)/4,b/4),at((c+1)/4,(b+1)/4),at(c/4,(b+1)/4)];
          mesh.face('tile',v,[[c/4,b/4],[(c+1)/4,b/4],[(c+1)/4,(b+1)/4],[c/4,(b+1)/4]]);
        }
      }
      batch.cylinder(cx,cz,ridge-.07,.17,.40,0x757069,8);continue;
    }
    let longest=0,dx=1,dz=0;
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length],d=total(a,b);
      if(d>longest){longest=d;dx=(b[0]-a[0])/d;dz=(b[1]-a[1])/d;}
    }
    const project=p=>[(p[0]-cx)*dx+(p[1]-cz)*dz,-(p[0]-cx)*dz+(p[1]-cz)*dx];
    const coords=ring.map(project),A=(Math.max(...coords.map(p=>p[0]))-Math.min(...coords.map(p=>p[0])))/2;
    const B=(Math.max(...coords.map(p=>p[1]))-Math.min(...coords.map(p=>p[1])))/2;
    const floor=way%3===1?5.52:3.48,rise=Math.min(2.72,B*.64+.46);
    const pt=(x,y,z)=>[cx+x*dx-z*dz,y,cz+x*dz+z*dx];
    for(const side of [-1,1]){
      const z=side*B,cols=Math.max(2,Math.round(2*A/2.8));
      batch.face([pt(-A,.21,z),pt(A,.21,z),pt(A,floor,z),pt(-A,floor,z)],timber);
      for(let i=0;i<cols;i++){
        const l=-A+(2*A)*i/cols+.13,r=-A+(2*A)*(i+1)/cols-.13,zf=z+side*.018;
        batch.face([pt(l,.72,zf),pt(r,.72,zf),pt(r,floor-.49,zf),pt(l,floor-.49,zf)],glass);
        batch.beam(pt((l+r)/2,.56,zf),pt((l+r)/2,floor-.26,zf),.075,trim);
      }
      for(let k=0;k<4;k++){
        const t=k/4,u=(k+1)/4;
        const roof=(x,t)=>pt(x*(A+.62),floor+rise*t**1.48+.12*x*x*(1-t)**2,side*(B+.77)*(1-t));
        const v=[roof(-1,t),roof(1,t),roof(1,u),roof(-1,u)];
        mesh.face('tile',v,[[0,t*1.9],[A/1.4,t*1.9],[A/1.4,u*1.9],[0,u*1.9]]);
      }
      const x=side*A;batch.face([pt(x,.15,-B),pt(x,.15,B),pt(x,floor,B),pt(x,floor+rise,0),pt(x,floor,-B)],0x716d63);
    }
    batch.beam(pt(-A-.55,floor+rise,0),pt(A+.55,floor+rise,0),.19,0x645f56);
  }
}
function contours(mesh){
  const ring=waterfrontWater.ring;
  const other=path(ring.slice(6,104));
  quay(mesh,other,.49,false);
  // Opposite-bank silhouettes follow the mapped shoreline and island contour.
  const treeLine=(route,step,out,kind)=>{
    for(let i=0;i*step<route.length;i++){
      const d=Math.min(route.length,i*step+Math.sin(i*2.91)*2.1),p=route.at(d,out+1.27*Math.sin(i*2.07));
      const f=.5+.5*Math.sin(i*3.38),v=(i*5+kind)%8;
      const size=kind===1?.63+.22*f:.91+.13*f;
      addTreeCard(mesh,...p,(7+4.7*f)*size,(3.7+1.24*f)*size,v,i*.821,.25);
    }
  };
  treeLine(other,8.9,3.8,0);treeLine(other,12.7,14.7,2);
  for(const hole of waterfrontWater.holes){
    const copy=hole.slice();
    const shoelace=copy.reduce((v,p,i)=>{const q=copy[(i+1)%copy.length];return v+p[0]*q[1]-q[0]*p[1];},0);
    if(shoelace>0)copy.reverse();copy.push(copy[0]);
    const island=path(copy);quay(mesh,island,.40,false);treeLine(island,8.6,2.1,1);
  }
}
export function buildWaterfront(batch){
  const mesh=new NatureMeshes();
  quay(mesh,promenade,deckLevel,true);
  const posts=Math.ceil(promenade.length/2.65);
  for(let i=0;i<=posts;i++){
    const d=promenade.length*i/posts,a=promenade.at(d,railShift),p=promenade.at(Math.min(promenade.length,d+.12),railShift);
    const near=Math.hypot(a[0],a[1])<75;
    post(mesh,a,Math.atan2(p[1]-a[1],p[0]-a[0]),near);
    if(i<posts)railSpan(mesh,a,promenade.at(promenade.length*(i+1)/posts,railShift),near);
  }
  let tree=0;
  for(let d=3;d<promenade.length-3;d+=11.8+2.3*Math.sin(tree*2.17)){
    const spot=promenade.at(d,3.12+.53*Math.sin(tree*3.8)),[x,z]=spot,dist=Math.hypot(x,z),h=8.0+1.9*Math.cos(tree*1.46),r=4.2+.52*Math.sin(tree*4.71);
    if(dist<88)addTree(mesh,x,z,h,r,8012+tree*611,true,dist<60,deckLevel);
    else addTreeCard(mesh,x,z,h,r,[0,3,6][tree%3],tree*.838,deckLevel);
    // The walkable surface passes around the retained planting well.
    const dark=0x6c6655;batch.cylinder(x,z,deckLevel+.014,.68,.028,dark,12);
    tree++;
  }
  contours(mesh);waterfrontRoofs(batch,mesh);
  for(const m of mesh.finish())batch.decals.push(m);
}
