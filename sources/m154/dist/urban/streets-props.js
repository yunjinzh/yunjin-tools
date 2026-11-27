// Parameterised street furniture. Local axes are (forward, height, right).
const tyres=[39,43,44],rim=[153,161,161],dark=[45,54,59],glass=[70,95,105],skyGlass=[122,149,156],head=[239,232,196],tail=[162,48,39],chrome=[174,183,179];
const carPaint=[[207,207,200],[230,229,216],[142,154,160],[56,73,84],[154,162,163],[196,199,191],[71,102,126],[80,87,89],[143,59,52],[58,105,85],[49,84,123],[220,221,212]];
const TAU=2*Math.PI;
function model(w,p){
  const v=(x,y,z)=>w.v(p.x+x*p.dx-z*p.dz,p.y+y,p.z+x*p.dz+z*p.dx);
  const face=(q,c,lit=0)=>{const a=q.map(pt=>v(...pt));if(a.length===3)w.tri(...a,c,false,lit);else w.quad(...a,c,false,lit);};
  function box(x0,x1,y0,y1,z0,z1,c){
    const a=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],b=a.map(q=>[q[0],y1,q[2]]);
    face([b[0],b[3],b[2],b[1]],c);
    for(let i=0;i<4;i++){const j=(i+1)%4;face([a[i],b[i],b[j],a[j]],c);}
  }
  function ring(x,z,levels,c,n=8,lit=0){
    const circles=levels.map(([y,r])=>Array.from({length:n},(_,i)=>[x+r*Math.cos(i*TAU/n),y,z+r*Math.sin(i*TAU/n)]));
    for(let k=1;k<circles.length;k++)for(let i=0;i<n;i++){const j=(i+1)%n;face([circles[k-1][i],circles[k][i],circles[k][j],circles[k-1][j]],c,lit);}
    return circles;
  }
  return {face,box,ring};
}
function wheels(m,positions,width,r,bottom,lod){
  for(const x of positions)for(const side of [-1,1]){
    const outer=side*(width+.024),inner=side*(width-.135),hub=outer+side*.012;
    const n=lod===0?10:6,cy=bottom+r;
    const disc=(at,rad,i)=>[x+rad*Math.cos(i*TAU/n),cy+rad*Math.sin(i*TAU/n),at];
    for(let i=0;i<n;i++){
      const next=(i+1)%n;
      m.face([disc(inner,r,i),disc(outer,r,i),disc(outer,r,next),disc(inner,r,next)],tyres);
      m.face([disc(outer,r,i),disc(outer,r,next),disc(outer,r*.58,next),disc(outer,r*.58,i)],tyres);
      m.face([[x,cy,hub],disc(hub,r*.58,i),disc(hub,r*.58,next)],lod===0&&i%3===0?[110,121,123]:rim);
    }
  }
}
function distantVehicle(m,bus,variant){
  const width=bus?1.245:.91,half=bus?5.95:2.34,low=bus?.43:.34,belt=bus?1.23:.84;
  const col=bus?[198,211,201]:carPaint[variant];
  m.box(-half,half,low,belt,-width,width,col);
  const a=bus?half-.08:1.53,b=bus?half-.12:.86,h=bus?2.9:1.46,roof=width*(bus?.98:.75);
  m.face([[-b,h,-roof],[-b,h,roof],[b,h,roof],[b,h,-roof]],col);
  for(const sign of [-1,1]){
    m.face([[-a,belt,width*sign],[a,belt,width*sign],[b,h,roof*sign],[-b,h,roof*sign]],glass);
    m.face([[a*sign,belt,-width],[a*sign,belt,width],[b*sign,h,roof],[b*sign,h,-roof]],skyGlass);
    for(const x of bus?[-3.48,2.82]:[-1.39,1.38]){
      const r=bus?.48:.32,z=sign*(width+.01),circle=Array.from({length:6},(_,i)=>[x+r*Math.cos(i*TAU/6),r+r*Math.sin(i*TAU/6),z]);
      for(let i=1;i<5;i++)m.face([circle[0],circle[i],circle[i+1]],tyres);
    }
  }
}
function car(m,variant,lod){
  const paint=carPaint[variant],taxi=variant===9||variant===10,estate=variant===2||variant===7;
  function shell(stations,colors){
    for(let j=1;j<stations.length;j++){
      const [a,y0,h0,r0,w0]=stations[j-1],[b,y1,h1,r1,w1]=stations[j],tone=colors[j-1];
      m.face([[a,h0,-w0],[b,h1,-w1],[b,h1,w1],[a,h0,w0]],tone);
      for(const s of [-1,1])m.face([[a,y0,s*r0],[b,y1,s*r1],[b,h1,s*w1],[a,h0,s*w0]],tone);
    }
  }
  const back=-2.32,front=2.36;
  const body=[[back,.39,.75,.77,.80],[-1.92,.33,.89,.90,.90],[1.82,.33,.84,.91,.89],[front,.40,.68,.78,.83]];
  shell(body,[paint,paint,paint]);
  for(const [x,y,h,a,b] of [body[0],body.at(-1)])m.face([[x,y,-a],[x,y,a],[x,h,b],[x,h,-b]],paint);
  const cabin=[[estate?-2.03:-1.68,.84,.92,.856,.83],[-.98,.87,estate?1.58:1.46,.863,.673],[.41,.855,estate?1.565:1.455,.86,.655],[1.24,.845,.88,.86,.81]];
  shell(cabin,[skyGlass,paint,skyGlass]);
  for(const side of [-1,1]){
    const window=(u,v,broadLo,broadHi,topLo,topHi,t0,t1)=>{
      m.face([[u,.94,broadLo*side],[v,.94,broadHi*side],[topHi,t1,(estate?.695:.707)*side],[topLo,t0,(estate?.695:.707)*side]],glass);
    };
    const t=estate?1.52:1.403;
    window(estate?-1.89:-1.48,-.44,.857,.856,-.95,-.435,t-.025,t);
    window(-.385,1.045,.856,.852,-.39,.38,t,t-.01);
    if(taxi)m.face([[-1.92,.54,.906*side],[1.80,.54,.914*side],[1.80,.77,.906*side],[-1.92,.77,.908*side]],[208,164,61]);
    if(!lod){
      for(const x of [-.9,.28])m.box(x,x+.13,.807,.836,side*.906-.012,side*.906+.012,chrome);
      m.box(.69,.87,.91,1.035,side*.96-.06,side*.96+.06,paint);
    }
    const light=(x,c,h)=>m.face([[x,h,side*.49],[x,h,side*.774],[x,h+.103,side*.781],[x,h+.106,side*.50]],c,c===head?155:70);
    light(front+.008,head,.516);light(back-.008,tail,.538);
  }
  m.face([[front+.009,.44,-.385],[front+.009,.44,.385],[front+.009,.55,.385],[front+.009,.55,-.385]],dark);
  m.face([[back-.012,.43,-.22],[back-.012,.43,.22],[back-.012,.54,.22],[back-.012,.54,-.22]],variant%4===1?[88,146,98]:[68,101,141]);
  if(taxi)m.box(-.43,.21,1.46,1.62,-.23,.23,[220,224,206]);
  wheels(m,[-1.39,1.38],.908,.328,0,lod);
}
function bus(m,variant,lod){
  const green=variant%3===0,body=[213,215,197],belt=green?[82,140,101]:[69,127,164];
  const A=-5.95,F=5.95,W=1.245;
  m.box(A+.09,F-.09,.39,.86,-W,W,body);
  m.box(A+.09,F-.11,.85,1.12,-W,W,belt);
  m.box(A+.09,F-.11,1.11,2.90,-W,W,[52,65,69]);
  m.box(A+.13,F-.16,2.87,3.06,-W+.025,W-.025,body);
  m.box(-2.64,.27,3.04,3.25,-.88,.88,[185,195,190]);
  m.box(1.14,2.78,3.05,3.20,-.78,.78,[174,187,187]);
  const end=(x,y0,y1,z0,z1,c,lit=0)=>m.face([[x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0]],c,lit);
  for(const side of [-1,1]){
    const z=side*(W+.012);
    const panel=(x,b,y,h,c)=>m.face([[x,y,z],[b,y,z],[b,h,z],[x,h,z]],c);
    for(let k=0;k<8;k++){
      const x=A+.27+k*1.43;
      if(side===1&&[3,7].includes(k)){
        for(let leaf=0;leaf<2;leaf++){const u=x+leaf*.69;panel(u,u+.62,.50,2.66,dark);panel(u+.045,u+.575,.84,2.485,glass);}
      }else{
        panel(x,x+1.325,1.36,2.67,glass);
        if(!lod)panel(x+.032,x+1.293,2.27,2.60,[115,139,141]);
      }
    }
    if(!lod)for(let j=0;j<5;j++)panel(A+.38,A+1.10,.52+j*.055,.54+j*.055,[129,137,131]);
  }
  for(const x of [A,F]){
    const front=x>0;
    end(x,.43,.85,-1.158,1.158,body);
    end(x,.83,1.11,-1.197,1.197,belt);
    end(x,1.10,2.86,-1.19,1.19,dark);
    end(x+(front?.012:-.012),1.19,front?2.53:2.65,-1.10,1.10,front?skyGlass:glass);
    if(front){
      end(x+.019,2.59,2.82,-.76,.76,[37,47,45]);
      // Amber matrix strokes on the destination display, without assigning a route number.
      if(!lod)for(let j=0;j<13;j++)end(x+.026,2.65+(j%3)*.015,2.76,-.53+j*.083,-.492+j*.083,[224,173,77],105);
    }
    for(const side of [-1,1])end(x+(front?.027:-.027),.57,.74,side*.98,side*.70,front?head:tail,front?175:80);
  }
  wheels(m,[-3.49,2.82],W+.004,.485,0,lod);
}
function lamp(m,ceremonial,lod){
  const metal=ceremonial?[171,163,135]:[133,140,139],lamp=[236,228,198];
  if(!ceremonial){
    m.ring(0,0,[[0,.19],[.53,.17],[.56,.12],[7.5,.074]],metal,6);
    m.face([[0,7.34,-.061],[1.25,7.90,-.07],[1.25,8.02,-.07],[0,7.55,-.061]],metal);
    m.box(1.19,2.34,7.85,8.00,-.14,.14,[111,120,119]);
    m.face([[1.4,7.84,-.12],[2.30,7.84,-.12],[2.30,7.84,.12],[1.4,7.84,.12]],lamp,240);
    return;
  }
  m.ring(0,0,[[0,.47],[.2,.47],[.3,.37],[1.04,.31],[1.16,.226],[9.16,.18],[9.34,.39],[9.55,.34]],metal,lod?6:8);
  function globe(x,z,y,r){
    if(lod){const a=[x-r,y+r,z],b=[x+r,y+r,z],c=[x,y+r,z-r],d=[x,y+r,z+r],top=[x,y+1.9*r,z],low=[x,y,z];for(const [i,j] of [[a,c],[c,b],[b,d],[d,a]]){m.face([i,j,top],lamp,215);m.face([j,i,low],lamp,215);}return;}
    m.ring(x,z,[[y,r*.15],[y+r*.25,r*.74],[y+r*.88,r],[y+r*1.52,r*.77],[y+r*1.87,r*.18]],lamp,lod?4:6,215);}
  for(const [count,radius,y] of [[8,1.43,9.83],[4,.80,10.5]]){
    for(let i=0;i<count;i++){const a=i*TAU/count+(count===4?.38:0),x=radius*Math.cos(a),z=radius*Math.sin(a);
      m.face([[0,9.39,-.06],[x,y-.09,z-.065],[x,y+.05,z+.065],[0,9.52,.06]],metal);
      globe(x,z,y,.285);
    }
  }
  m.ring(0,0,[[9.45,.11],[11.08,.075]],metal,5);globe(0,0,11.05,.35);
}
export function drawStreetProp(w,item,lod){
  if(lod>=2&&item.type!=='pier')return;
  const m=model(w,item.p);
  if(lod&&['car','bus'].includes(item.type))distantVehicle(m,item.type==='bus',item.variant);
  else if(item.type==='car')car(m,item.variant,lod);
  else if(item.type==='bus')bus(m,item.variant,lod);
  else if(item.type==='pier'){
    const top=-.87,bottom=.12-item.p.y;
    m.box(-.92,.92,bottom,top-1.26,-1.05,1.05,[146,144,135]);
    const span=item.h*.60;
    for(const x of [-1.12,1.12])m.face([[x,top-1.3,-1.10],[x,top-1.3,1.1],[x,top,span],[x,top,-span]],[140,138,130]);
    m.box(-1.16,1.16,top-.30,top,-span,span,[151,147,136]);
  }else lamp(m,item.type==='globe',lod);
}
