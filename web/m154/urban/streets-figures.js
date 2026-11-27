// Original meshes in metres. Local forward/up/right axes match the road furniture.
const TAU=2*Math.PI;
const coats=[[81,91,86],[139,132,113],[66,81,99],[115,70,55],[81,90,112],[157,147,122],[76,93,83],[102,85,93],[146,149,144],[96,89,81]];
const denim=[[59,64,68],[67,76,83],[62,64,61],[86,82,75]];
const skins=[[189,143,108],[212,172,141],[172,128,100],[197,151,119]];
const hair=[[53,47,44],[53,50,50],[58,48,42],[82,78,72]];
function forms(w,p,scale=1){
  const vertex=q=>w.v(p.x+(q[0]*p.dx-q[2]*p.dz)*scale,p.y+q[1]*scale,p.z+(q[0]*p.dz+q[2]*p.dx)*scale);
  function quad(points,c){w.quad(...points.map(vertex),c);}
  function tri(points,c){w.tri(...points.map(vertex),c);}
  function body(rows,c,n){
    const rings=rows.map(([x,y,z,rx,rz])=>Array.from({length:n},(_,i)=>[x+rx*Math.cos(TAU*i/n),y,z+rz*Math.sin(TAU*i/n)]));
    for(let j=1;j<rings.length;j++)for(let i=0;i<n;i++){const k=(i+1)%n;quad([rings[j-1][i],rings[j][i],rings[j][k],rings[j-1][k]],c);}
    const last=rings.at(-1);for(let k=1;k<n-1;k++)tri([last[0],last[k+1],last[k]],c);
  }
  function tube(a,b,r0,r1,c,n=6){
    const d=b.map((q,i)=>q-a[i]),len=Math.hypot(...d);if(len<.001)return;
    d.forEach((_,i)=>d[i]/=len);const lenXZ=Math.hypot(d[0],d[2]);
    const u=lenXZ>.01?[-d[2]/lenXZ,0,d[0]/lenXZ]:[1,0,0],v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
    const ring=(pt,r,i)=>pt.map((q,k)=>q+(u[k]*Math.cos(TAU*i/n)+v[k]*Math.sin(TAU*i/n))*r);
    for(let i=0;i<n;i++){const k=(i+1)%n;quad([ring(a,r0,i),ring(b,r1,i),ring(b,r1,k),ring(a,r0,k)],c);}
  }
  return {quad,tri,tube,body};
}
function human(m,variant,lod,riding=false){
  const coat=coats[variant],pants=denim[variant%4],skin=skins[variant%4],h=hair[variant%4],shoe=[54,53,47];
  const n=lod?5:8,pose=variant%3,step=pose===0?.035:pose===1?.115:.18;
  const hipX=riding?-.21:0,hipY=riding?.97:.88,shoulderX=riding?.07:.015,shoulderY=riding?1.37:1.42;
  for(const side of [-1,1]){
    const hip=[hipX,hipY,side*.085],knee=riding?[.16,side===1?.77:.66,side*.116]:[side*step*.62+.027,.49,side*.091];
    const ankle=riding?[side*.12-.05,side===1?.55:.31,side*.116]:[side*step,.099,side*.101];
    m.tube(hip,knee,.091,.064,pants,n);m.tube(knee,ankle,.064,.048,pants,n);
    m.body([[ankle[0]+.054,ankle[1]-.08,ankle[2],.135,.059],[ankle[0]+.037,ankle[1]-.036,ankle[2],.119,.060],[ankle[0],ankle[1]+.015,ankle[2],.069,.055]],shoe,n);
  }
  const torso=(t)=>hipX+(shoulderX-hipX)*t;
  m.body([[hipX,hipY-.056,0,.123,.171],[torso(.25),hipY+.102,0,.135,.183],[torso(.7),shoulderY-.112,0,.137,.202],[shoulderX,shoulderY,0,.110,.198],[shoulderX+.008,shoulderY+.038,0,.091,.103]],coat,n);
  const neck=[shoulderX+.035,shoulderY+.04,0],jaw=[neck[0]+.025,shoulderY+.125,0];
  m.tube(neck,jaw,.063,.064,skin,n);
  m.body([[jaw[0]+.011,jaw[1]-.023,0,.057,.051],[jaw[0]+.005,jaw[1]+.033,0,.085,.074],[jaw[0],jaw[1]+.099,0,.097,.085],[jaw[0]-.007,jaw[1]+.15,0,.084,.075]],skin,n);
  m.body([[jaw[0]-.033,jaw[1]+.092,0,.080,.082],[jaw[0]-.012,jaw[1]+.134,0,.090,.088],[jaw[0]-.014,jaw[1]+.174,0,.069,.066],[jaw[0]-.020,jaw[1]+.186,0,.033,.038]],h,n);
  if(!lod){m.tri([[jaw[0]+.088,jaw[1]+.093,-.015],[jaw[0]+.113,jaw[1]+.051,0],[jaw[0]+.087,jaw[1]+.048,.021]],skin);}
  for(const side of [-1,1]){
    const arm=[shoulderX,shoulderY-.034,side*.19];
    const elbow=riding?[.185,1.20,side*.222]:[shoulderX-.031-side*step*.35,shoulderY-.245,side*.235];
    const hand=riding?[.413,1.045,side*.231]:[shoulderX+.039-side*step*.64,shoulderY-.451,side*.22];
    m.tube(arm,elbow,.071,.051,coat,n);m.tube(elbow,hand,.052,.038,coat,n);
    m.body([[hand[0],hand[1]-.067,hand[2],.036,.026],[hand[0]+.006,hand[1]-.025,hand[2],.047,.033],[hand[0],hand[1]+.016,hand[2],.034,.031]],skin,lod?4:6);
  }
  if(!lod&&variant%3===1)m.body([[torso(.52)-.12,shoulderY-.323,0,.071,.116],[torso(.68)-.133,shoulderY-.267,0,.10,.14],[torso(.85)-.125,shoulderY-.084,0,.078,.12]],denim[(variant+1)%4],7);
}
function cycle(m,variant,lod){
  const steel=[147,154,150],rubber=[45,48,47],paint=[[178,149,63],[74,125,142],[75,124,111],[133,144,140]][variant%4];
  for(const cx of [-.55,.55]){
    const r=.336,cy=.343,n=lod?10:18;
    for(let i=0;i<n;i++){
      const angle=i*TAU/n,next=(i+1)*TAU/n;
      const edge=(a,rad,z)=>[cx+rad*Math.cos(a),cy+rad*Math.sin(a),z];
      for(const side of [-1,1])m.quad([edge(angle,r,side*.018),edge(next,r,side*.018),edge(next,r-.034,side*.022),edge(angle,r-.034,side*.022)],rubber);
      m.quad([edge(angle,r,-.018),edge(next,r,-.018),edge(next,r,.018),edge(angle,r,.018)],rubber);
      if(!lod&&i%2===0)m.tube([cx,cy,.008],edge(angle,r-.033,.008),.004,.003,steel,3);
    }
  }
  const rear=[-.55,.343,0],fork=[.55,.343,0],crank=[-.066,.318,0],seat=[-.244,.812,0],head=[.363,.772,0];
  for(const [a,b,r,c] of [[rear,crank,.018,paint],[rear,seat,.013,paint],[seat,crank,.024,paint],[crank,head,.030,paint],[[-.204,.577,0],head,.025,paint],[head,fork,.021,steel],[seat,[-.26,.90,0],.015,steel],[head,[.41,1.02,0],.016,steel],[[.41,1.02,-.24],[.41,1.02,.24],.014,steel]]){
    m.tube(a,b,r,r,c,lod?4:6);
  }
  m.body([[-.263,.89,0,.122,.08],[-.276,.92,0,.125,.083],[-.278,.944,0,.095,.064]],rubber,7);
  if(!lod){for(const side of [-1,1])m.tube(crank,[-.066+side*.1,.318+side*.09,side*.122],.012,.012,steel,4);
    for(const z of [-.16,.16]){m.tube([.405,.838,z],[.688,.838,z],.008,.008,steel,4);m.tube([.655,.87,z],[.60,.702,z],.009,.009,steel,4);}
    m.tube([.688,.838,-.16],[.688,.838,.16],.008,.008,steel,4);}
}
function silhouette(m,v,riding){
  const skin=skins[v%4],coat=coats[v],pants=denim[v%4],head=riding?.18:.055,shift=riding?.1:0;
  const hip=riding?-.19:0,waist=riding?.98:.88;
  m.body([[hip,waist,0,.108,.15],[hip+.036,waist+.14,0,.119,.165],[head-.046,1.40-shift,0,.111,.202],[head-.035,1.455-shift,0,.09,.115]],coat,5);
  m.body([[head,1.475-shift,0,.065,.06],[head,1.55-shift,0,.092,.079],[head-.013,1.635-shift,0,.076,.072]],skin,5);
  m.body([[head-.028,1.606-shift,0,.08,.079],[head-.02,1.684-shift,0,.068,.06]],hair[v%4],5);
  for(const side of [-1,1]){
    const foot=riding?[side*.12,.36+side*.105,side*.11]:[side*.115,.075,side*.09];
    const knee=riding?[.17,.72,side*.107]:[side*.075+.024,.49,side*.09];
    m.tube([hip,waist+.011,side*.08],knee,.086,.06,pants,4);m.tube(knee,foot,.062,.05,pants,4);
    m.tube(foot,[foot[0]+.15,foot[1]-.025,foot[2]],.055,.044,[54,54,50],4);
    const hand=riding?[.405,1.05,side*.235]:[-side*.10,1.00,side*.22];
    m.tube([head-.048,1.397-shift,side*.17],hand,.068,.038,coat,4);
  }
}
export function drawStreetFigure(w,item,lod){
  const {p,variant,type}=item;
  if(lod>1)return;
  if(type==='person'){
    const m=forms(w,p,.92+(variant%6)*.027);
    if(lod)silhouette(m,variant,false);else human(m,variant,0);
    return;
  }
  const m=forms(w,p);cycle(m,variant,lod);
  if(type==='rider'){if(lod)silhouette(m,variant,true);else human(m,variant,0,true);}
}
