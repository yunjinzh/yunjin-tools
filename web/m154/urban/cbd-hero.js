import {CbdFaces, paneShade} from './cbd.js';

const mix=(a,b,t)=>a+(b-a)*t;
const interp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
// Uniformly spaced bays on the flat faces and radiused corners avoid the very wide
// panels a polar superellipse would otherwise create in the middle of each side.
function citicPlan(){
  const pts=[],radius=.27;
  for(let side=0;side<4;side++){
    const rot=([x,z])=>[[x,z],[-z,x],[-x,-z],[z,-x]][side];
    for(let i=0;i<20;i++){const u=i/20;pts.push({xz:rot([mix(-1+radius,1-radius,u),-1]),side,bay:i,arc:Math.sin(Math.PI*u)**2});}
    for(let j=0;j<6;j++){const a=(j/6-1)*Math.PI/2;pts.push({xz:rot([1-radius+radius*Math.cos(a),-1+radius+radius*Math.sin(a)]),side,bay:20+j,arc:0});}
  }
  return pts;
}
export function citicTower(b){
  const w=new CbdFaces(),plan=citicPlan(),N=plan.length;
  const radius=y=>y<385?27+12*((385-y)/385)**1.75:27+7.5*((y-385)/143)**1.72;
  const pos=(pt,y,off=0,r=radius(y))=>[pt.xz[0]*(r+off),y,pt.xz[1]*(r+off)];
  const addBand=(lo,hi,c,glow=0)=>{for(let i=0;i<N;i++){const j=(i+1)%N;w.face([lo[i],hi[i],hi[j],lo[j]],Array.isArray(c)?c:c(i),typeof glow==='number'?glow:glow(i),.72);}};
  const row=(y,off=0)=>plan.map(p=>pos(p,y,off));
  const lobby=plan.map(p=>pos(p,5.4+8.3*p.arc,-1.5));
  addBand(row(0),row(.28),[142,148,145]);
  addBand(row(.28),row(.28,-1.5),[148,152,148]);
  addBand(row(.28,-1.5),lobby,[65,91,101],.22);
  addBand(lobby,plan.map(p=>pos(p,5.4+8.3*p.arc)),[171,178,173],.18);
  addBand(plan.map(p=>pos(p,5.4+8.3*p.arc)),row(16),[109,137,149],.09);
  const floors=103,base=16,top=490;
  for(let j=0;j<floors;j++){
    const t=j/floors,low=mix(base,top,t),hi=mix(base,top,(j+1)/floors),wind=low+.54;
    const B=row(low),W=row(wind),U=row(hi);
    for(let i=0;i<N;i++){
      const n=(i+1)%N,pt=plan[i],bay=pt.bay,side=pt.side;
      const [color,lit]=paneShade('zun',side,bay,j,26,floors,26.5);
      const seam=[12,26,40,54,68,82,96].includes(j);
      const spandrel=seam?[62,82,91]:[91,112,123];
      w.face([B[i],W[i],W[n],B[n]],spandrel,.014,.47);
      const end=.92,wu=interp(W[i],W[n],end),uu=interp(U[i],U[n],end);
      w.face([W[i],U[i],uu,wu],seam?color.map(v=>v*.77):color,seam?.028:lit,1);
      w.face([wu,uu,U[n],W[n]],bay%4===0?[165,178,178]:[125,145,151],.035,.42);
    }
  }
  // The outer glass veil continues past the observation levels. Layer the recessed
  // inner crown, a dark roof terrace and an undulating perimeter with a narrow rim.
  const B=row(490),U=row(508),lip=plan.map(p=>pos(p,520.6+7.4*p.arc,0,34.5));
  addBand(B,U,i=>{const bay=plan[i].bay;return bay%4===0?[140,162,165]:[122,149,159];},i=>plan[i].bay%4===0?.44:.31);
  const inner=plan.map(p=>[p.xz[0]*22,508,p.xz[1]*22]);
  const topInner=plan.map(p=>[p.xz[0]*26,519.6,p.xz[1]*26]);
  addBand(inner,topInner,[165,161,140],.88);
  for(let i=0;i<N;i++){
    const j=(i+1)%N;
    w.face([[0,519.6,0],topInner[j],topInner[i]],[119,132,130],.14);
    w.face([U[j],inner[j],inner[i],U[i]],[98,115,117],.13);
    const E=interp(U[i],U[j],.13),F=interp(lip[i],lip[j],.13);
    w.face([U[i],lip[i],F,E],[173,182,177],.36,.64);
    const end=lip[i].map((v,k)=>k===1?v-.52:v),endj=lip[j].map((v,k)=>k===1?v-.52:v);
    w.face([end,lip[i],lip[j],endj],[181,187,180],.54,.51);
  }
  const tower=w.gpu('中信大厦 · 肋状幕墙与塔冠');b.decals.push(tower);b.rectFoot(0,0,78,78);
}
