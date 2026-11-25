// Work in image-height units; model dimensions are metres. Raw observations stay in the checkpoint.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function quantile(a,q){if(!a.length)return NaN;a.sort((x,y)=>x-y);return a[Math.round((a.length-1)*q)];}
export function poseScale(p,aspect){
  const lengths=[];
  for(const [a,b,rest] of [[11,23,.53],[12,24,.53],[23,25,.42],[24,26,.42],[25,27,.40],[26,28,.40],[11,13,.29],[12,14,.29],[11,12,.35]]){
    if(Math.min(p[a][3],p[b][3])<.4)continue;
    const x=(p[a][0]-p[b][0])*aspect,y=p[a][1]-p[b][1],z=(p[a][2]-p[b][2])*aspect*.36;
    lengths.push(Math.hypot(x,y,z)/rest);
  }
  return clamp(quantile(lengths,.59)||Math.hypot((p[11][0]-p[23][0])*aspect,p[11][1]-p[23][1])/.52||.4,.02,5);
}
export function bridgePose(a,b,aspect){
  const trunk=p=>Math.hypot(((p[11][0]+p[12][0])-(p[23][0]+p[24][0]))*aspect/2,((p[11][1]+p[12][1])-(p[23][1]+p[24][1]))/2);
  const sa=Math.max(.025,trunk(a)),sb=Math.max(.025,trunk(b));
  const dx=((a[23][0]+a[24][0])-(b[23][0]+b[24][0]))*aspect/2,dy=((a[23][1]+a[24][1])-(b[23][1]+b[24][1]))/2;
  return Math.hypot(dx,dy)<1.25*Math.max(sa,sb)&&Math.max(sa,sb)<2*Math.min(sa,sb);
}
function footHeight(p){
  const feet=[27,28,29,30,31,32].filter(i=>p[i][3]>.52);
  return feet.length?Math.max(...feet.map(i=>p[i][1])):NaN;
}
export function motionTrack(frames,aspect){
  const samples=frames.map(f=>f.p?{s:poseScale(f.p,aspect),ground:footHeight(f.p)}:null);
  const segment=new Uint32Array(frames.length);
  for(let i=1;i<frames.length;i++){
    const a=frames[i-1],b=frames[i];
    const jump=a.p&&b.p&&Math.hypot((a.p[23][0]-b.p[23][0])*aspect,a.p[23][1]-b.p[23][1])>Math.max(.075,samples[i].s*.65);
    segment[i]=segment[i-1]+Number(!a.p||!b.p||jump||b.t-a.t>.28);
  }
  function limits(i,seconds){
    const t=frames[i].t;let a=i,b=i;
    while(a>0&&segment[a-1]===segment[i]&&t-frames[a-1].t<=seconds)a--;
    while(b+1<frames.length&&segment[b+1]===segment[i]&&frames[b+1].t-t<=seconds)b++;
    return [a,b];
  }
  return function sample(i){
    const f=frames[i];if(!f?.p)return null;
    const [ca,cb]=limits(i,.60),scales=[],grounds=[];
    for(let j=ca;j<=cb;j++){scales.push(samples[j].s);if(Number.isFinite(samples[j].ground))grounds.push(samples[j].ground);}
    const scale=quantile(scales,.5),floor=quantile(grounds,.89);
    const [a,b]=limits(i,.125);
    const p=f.p.map((v,n)=>{
      const sigma=.041+.029*(1-v[3]);
      // A centred, local linear fit suppresses alternating estimates without moving constant-speed motion in time.
      let sw=0,sx=0,sxx=0;const sy=new Float64Array(v.length),sxy=new Float64Array(v.length);
      for(let j=a;j<=b;j++){
        const dt=frames[j].t-f.t,u=frames[j].p[n],confidence=clamp(u[3],.02,1);
        const w=Math.exp(-.5*(dt/sigma)**2)*confidence**2;
        sw+=w;sx+=w*dt;sxx+=w*dt*dt;
        for(let k=0;k<v.length;k++){if(k===3)continue;sy[k]+=w*u[k];sxy[k]+=w*dt*u[k];}
      }
      const det=sw*sxx-sx*sx;
      if(det<1e-13)return [...v];
      const estimated=Array.from(sy,(s,k)=>k===3?v[3]:(s*sxx-sxy[k]*sx)/det);
      // Keep strong, well-supported directional changes (e.g. a wrist at the top of a swing).
      const distance=Math.hypot((estimated[0]-v[0])*aspect,estimated[1]-v[1])/scale;
      const original=clamp((distance-.021)*6,0,.60)*v[3];
      return estimated.map((x,k)=>k===3||!Number.isFinite(x)?v[k]:x+(v[k]-x)*original);
    });
    // During a planted stance, steady the ankle, heel and toe together. Release immediately
    // when the foot rises or travels. Preserve genuine slides and changes in toe angle.
    const [fa,fb]=limits(i,.15);
    for(const side of [0,1]){
      const ankle=27+side,heel=29+side,toe=31+side;
      if(fa===fb||!Number.isFinite(floor)||p[ankle][3]<.65||floor-Math.max(p[heel][1],p[toe][1])>.09*scale)continue;
      let sx=0,sy=0,n=0,travel=0;
      for(let j=fa;j<=fb;j++){
        const a=frames[j].p[ankle];if(a[3]<.65)continue;
        travel=Math.max(travel,Math.hypot((a[0]-p[ankle][0])*aspect,a[1]-p[ankle][1]));
        sx+=a[0];sy+=a[1];n++;
      }
      if(n<3)continue;
      const lock=clamp((.038-travel/scale)/.02,0,1);
      const dx=lock*(sx/n-p[ankle][0]),dy=lock*(sy/n-p[ankle][1]);
      for(const k of [ankle,heel,toe]){p[k][0]+=dx;p[k][1]+=dy;}
    }
    const foot=footHeight(p);
    const clearance=Number.isFinite(floor)&&Number.isFinite(foot)?Math.max(0,floor-foot-.018*scale):0;
    return {p,scale,clearance};
  };
}
