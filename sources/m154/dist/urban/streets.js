import {placeStreetLife} from './streets-life.js';
import {drawStreetFigure} from './streets-figures.js';
import {streetRows} from './streets-data.js';
import {drawStreetProp} from './streets-props.js';

const surveyed = new Map(streetRows.map(row => [row[0],row]));
const between=(n,a,b)=>Math.max(a,Math.min(n,b));
const seed=(id,n)=>{let q=Math.imul(id^Math.imul(n+1,0x27d4eb2d),0x85ebca6b);q^=q>>>13;return (q>>>0)/4294967296;};
const TILE=250;
const asphalt=[88,91,91],paint=[216,214,197],yellow=[226,182,86],curb=[166,161,149],walk=[157,151,137];
export const streetWidth=id=>surveyed.get(id)?.[3];
export const streetEnhanced=id=>surveyed.has(id);
export const streetElevated=id=>Boolean(surveyed.get(id)?.[9].length);

function rangeAt(stops,dist) {
  let a=0,b=stops.length-1;
  while(a+1<b){const m=(a+b)>>1;if(stops[m]<=dist)a=m;else b=m;}
  return a;
}
function profileHeight(profile,dist){
  if(!profile.length)return .15;
  for(let i=1;i<profile.length;i++){
    const [a,lo]=profile[i-1],[b,hi]=profile[i];
    if(dist<=b&&b>a)return lo+(hi-lo)*between((dist-a)/(b-a),0,1);
  }
  return profile.at(-1)[1];
}
function route(feature,row,project){
  const pts=[],stops=[];
  for(const pos of feature.line){
    const p=project(...pos),prev=pts.at(-1),d=prev?Math.hypot(p.x-prev.x,p.z-prev.z):0;
    if(prev&&d<.08)continue;
    pts.push(p);stops.push((stops.at(-1)||0)+d);
  }
  const normals=[];
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],d=stops[i+1]-stops[i];normals.push([(a.z-b.z)/d,(b.x-a.x)/d]);}
  if(!normals.length)return null;
  const joins=pts.map((_,i)=>{
    const [ax,az]=normals[Math.max(0,i-1)],[bx,bz]=normals[Math.min(i,normals.length-1)];
    const t=Math.max(.65,1+ax*bx+az*bz);return [(ax+bx)/t,(az+bz)/t];
  });
  const length=stops.at(-1),profile=row[9];
  function sample(dist) {
    const s=between(dist,0,length),i=rangeAt(stops,s),t=(s-stops[i])/(stops[i+1]-stops[i]);
    const a=pts[i],b=pts[i+1],[nx,nz]=normals[i];
    return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:profileHeight(profile,s),nx:joins[i][0]*(1-t)+joins[i+1][0]*t,nz:joins[i][1]*(1-t)+joins[i+1][1]*t,dx:nz,dz:-nx};
  }
  return {sample,length,stops};
}
const inside=(ranges,s)=>ranges.some(([a,b])=>s>=a&&s<=b);
export function buildStreetScene(roads,project,blocked=()=>false,groundRoad=()=>false,ground=()=>0) {
  const tiles=new Map(),vehicles=[],occupied=new Map(),lightPositions=new Map();
  const counts={vehicles:0,buses:0,lamps:0,crossings:0,elevatedWays:0,sidewalkSpans:0};
  function put(item,x,z){const key=Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!tiles.has(key))tiles.set(key,[]);tiles.get(key).push(item);}
  function spaced(index,x,z,gap,level){
    const i=Math.floor(x/18),j=Math.floor(z/18);
    for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){
      for(const p of index.get(a+','+b)||[])if(Math.abs(level-p.y)<2.8&&Math.hypot(x-p.x,z-p.z)<(gap+p.gap)*.5)return false;
    }
    const key=i+','+j;if(!index.has(key))index.set(key,[]);index.get(key).push({x,z,gap,y:level});return true;
  }
  for(const feature of roads){
    const row=surveyed.get(feature.osmId);if(!row)continue;
    const [id,lanes,dir,width,bus,junctions,crossings,left,right,profile,forward,backward]=row;
    const road=route(feature,row,project);if(!road)continue;
    const {length,sample,stops}=road,h=width*.5,lane=width/lanes;
    const divided=dir!==0,split=between(backward||lanes-(forward||Math.ceil(lanes/2)),1,lanes-1);
    const boulevard=/长安街$/.test(feature.name),bridge=profile.length>0,link=feature.kind.endsWith('_link');
    if(bridge)counts.elevatedWays++;
    // Paint clips at mapped junctions and marked crossings. The same cuts trim both
    // sides of a walking surface and keep gaps at kerbs and curb ramps.
    const cuts=new Set([0,length,...stops,...profile.map(v=>v[0])]);
    for(const intervals of [junctions,left,right])for(const [a,b] of intervals){cuts.add(a);cuts.add(b);}
    for(const x of crossings){cuts.add(x-3.0);cuts.add(x+3.0);}
    for(let x=60;x<length;x+=60)cuts.add(x);
    const chain=[...cuts].filter(v=>v>=0&&v<=length).sort((a,b)=>a-b);
    for(let i=1;i<chain.length;i++){
      const s=chain[i-1],e=chain[i],mid=(s+e)*.5;if(e-s<.035)continue;
      const start=sample(s),end=sample(e),m=sample(mid);
      const clear=!inside(junctions,mid)&&!crossings.some(x=>Math.abs(x-mid)<3);
      const sidewalk=clear&&!bridge?[inside(left,mid),inside(right,mid)]:[false,false];
      if(sidewalk.some(Boolean))counts.sidewalkSpans++;
      if(clear||bridge)put({type:'segment',s,e,start,end,h,lanes,split,divided,clear,sidewalk,bridge,link},m.x,m.z);
    }
    if(!bridge)for(const x of crossings){
      // A boundary node may be shared by two consecutive ways.
      const p=sample(x);if(!spaced(lightPositions,p.x,p.z,4,-50))continue;
      put({type:'zebra',p,h},p.x,p.z);counts.crossings++;
    }
    if(bridge&&!link)for(let s=24;s<length-12;s+=35){
      const p=sample(s);if(p.y<4||blocked(p.x,p.z,1.6)||groundRoad(p.x,p.z,1.4))continue;
      // Omit a column where its footprint intersects a mapped ground-level carriageway.
      put({type:'pier',p,h},p.x,p.z);
    }
    if(!bridge&&!link&&lanes>=2){
      const sides=divided?[dir]:[-1,1];
      for(const sign of sides)for(let s=20+seed(id,4)*29;s<length-6;s+=boulevard?59:52){
        if(inside(junctions,s)||crossings.some(x=>Math.abs(x-s)<6))continue;
        const p=sample(s),offset=sign*(h+1.45);
        const x=p.x+p.nx*offset,z=p.z+p.nz*offset;
        if(!boulevard&&!inside(sign<0?left:right,s))continue;
        if(blocked(x,z,.6)||groundRoad(x,z,.25)||!spaced(lightPositions,x,z,30,0))continue;
        put({type:boulevard?'globe':'lamp',p:{x,z,y:.15,dx:-sign*p.nx,dz:-sign*p.nz},variant:0},x,z);counts.lamps++;
      }
    }
    if(lane<2.55||!bridge&&feature.bridge)continue;
    const sides=divided?[dir]:[-1,1];
    for(const sign of sides){
      const count=divided?lanes:sign===1?lanes-split:split;
      if(!count)continue;
      for(let j=0;j<count;j++){
        const i=divided?(sign===1?j:lanes-1-j):sign===1?split+j:split-1-j;
        const offset=-h+(i+.5)*lane,outer=j===count-1;
        for(let serial=0,s=15+seed(id,i+40)*49;s<length-7;serial++,s+=64+seed(id,serial*7+i)*65){
          const isBus=!link&&outer&&bus&&lane>=2.85&&seed(id,serial*19+i+521)<.19;
          const size=isBus?12:4.68,guard=size/2+2.3;
          if(!isBus&&seed(id,serial*97+i+733)>.35)continue;
          if(s<guard||s>length-guard||junctions.some(([a,b])=>s>a-guard&&s<b+guard)||crossings.some(x=>Math.abs(x-s)<guard+2))continue;
          const p=sample(s),a=sample(s-size/2),b=sample(s+size/2);
          if(a.dx*b.dx+a.dz*b.dz<.985)continue;
          const x=p.x-offset*p.dz,z=p.z+offset*p.dx;
          if(!bridge&&blocked(x,z,1))continue;
          if(!spaced(occupied,x,z,size+1.1,p.y))continue;
          const item={type:isBus?'bus':'car',p:{x,z,y:p.y+.023,dx:p.dx*sign,dz:p.dz*sign},variant:Math.floor(seed(id,serial*13+i+19)*12),id,lane:i,offset,sign,s};
          put(item,x,z);vehicles.push(item);counts.vehicles++;if(isBus)counts.buses++;
        }
      }
    }
  }
  Object.assign(counts,placeStreetLife(roads,project,put,blocked,ground,groundRoad,seed));
  return {tiles,counts,vehicles};
}
function across(p,offset,lift=0){return [p.x+p.nx*offset,p.y+lift,p.z+p.nz*offset];}
function face(w,points,color,up=false,lit=0){const ids=points.map(p=>w.v(...p));w.quad(...ids,color,up,lit);}
function strip(w,a,b,l,r,low,high,color,up=true){
  face(w,[across(a,l,low),across(b,l,low),across(b,r,high),across(a,r,high)],color,up);
}
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:a.y+(b.y-a.y)*t,nx:a.nx+(b.nx-a.nx)*t,nz:a.nz+(b.nz-a.nz)*t});
export function drawStreet(w,item,lod=0){
  if(item.type==='segment'){
    const {start:a,end:b,h,lanes,divided,split,bridge,clear,sidewalk,s,e}=item;
    if(bridge){
      strip(w,a,b,-h,h,0,0,asphalt);
      for(const side of [-1,1]){
        const edge=side*h,inside=side*(h-.34);
        strip(w,a,b,edge,edge,-.88,.59,[139,138,129],false);
        strip(w,a,b,inside,inside,0,.59,[157,157,146],false);
        strip(w,a,b,edge,inside,.59,.59,[183,180,166]);
      }
      if(lod<2)strip(w,a,b,-h,h,-.86,-.86,[111,111,103]);
    }
    if(!clear||lod>=2)return;
    for(const [index,active] of sidewalk.entries())if(active){
      const side=index?1:-1,edge=side*(h+.04),lip=side*(h+.36),outer=side*(h+2.45);
      strip(w,a,b,edge,edge,0,.15,curb,false);
      strip(w,a,b,edge,lip,.15,.15,[184,178,161]);
      strip(w,a,b,lip,outer,.145,.145,walk);
    }
    if(lanes<2)return;
    if(lod===0&&h>4.5)for(const sign of [-1,1]){const x=sign*(h-.5);strip(w,a,b,x-.07,x+.07,.036,.036,paint);}
    for(let j=1;j<lanes;j++){
      const x=-h+j*(2*h/lanes);
      if(!divided&&j===split){for(const d of h>=6?[-.15,.15]:[0])strip(w,a,b,x+d-.07,x+d+.07,.042,.042,yellow);continue;}
      if(lod>0)continue;
      for(let k=Math.floor(s/10)*10;k<e;k+=10){
        const t0=Math.max(k,s),t1=Math.min(k+3.6,e);if(t1-t0<=.06)continue;
        strip(w,lerp(a,b,(t0-s)/(e-s)),lerp(a,b,(t1-s)/(e-s)),x-.075,x+.075,.04,.04,paint);
      }
    }
  }else if(item.type==='zebra'){
    if(lod>=2)return;
    const {p,h}=item;const a={...p,x:p.x-p.dx*1.95,z:p.z-p.dz*1.95},b={...p,x:p.x+p.dx*1.95,z:p.z+p.dz*1.95};
    for(let at=-h+.35;at<h-.38;at+=.92)strip(w,a,b,at,Math.min(h-.2,at+.43),.048,.048,paint);
  }else if(['person','bicycle','rider'].includes(item.type))drawStreetFigure(w,item,lod);
  else drawStreetProp(w,item,lod);
}
