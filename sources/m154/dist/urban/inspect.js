import {Raycaster,Vector2,Vector3} from 'three';
import {loadBeijing} from '../data/beijing.js';
import {landmarks,landmarkFootprints} from '../landmarks.js';
import {projectArea,ringArea,inPolygon,edgeDistance,SpatialIndex,landmarkIndex,propertyHeight,replacedRefs,templeCourtWays,seedAt,bounds} from '../city.js';
import {ordinaryGeometry} from './facades.js';

const category={yes:'用途未标注',apartments:'公寓住宅',residential:'住宅',house:'住宅',detached:'独栋住宅',bungalow:'平房',commercial:'商业建筑',retail:'零售建筑',office:'办公建筑',hotel:'酒店',industrial:'工业建筑',warehouse:'仓储建筑',dormitory:'宿舍',school:'学校',hospital:'医院',university:'大学',college:'学院',kindergarten:'幼儿园',government:'行政建筑',transportation:'交通建筑',garages:'车库',garage:'车库',service:'附属设施',roof:'独立屋顶',wall:'墙体',civic:'公共建筑'};
const metres=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2});
export function heightEvidence(f,h){
  if(f.height>0)return {value:h,source:'OSM 高度标注',details:'height = '+metres.format(f.height)+' m'+(f.levels>0?' · '+metres.format(f.levels)+' 层':'')};
  if(f.levels>0)return {value:h,source:'按 OSM 层数估算',details:metres.format(f.levels)+' 层 × 3 米/层'};
  if(f.neighborHeight>0)return {value:h,source:'相邻同类建筑估算',details:'155 米内相似建筑的高度中位数'};
  const specific=/garage|shed|hut|carport|kiosk|roof|toilets|service|temple|historic|house|detached|bungalow|school|hospital|industrial|warehouse|civic|residential|apartments|dormitory|commercial|office|hotel/.test(f.kind||'');
  return {value:h,source:specific?'按建筑用途估算':'按轮廓面积分档估算',details:'原数据缺少高度和层数'};
}
function slab(o,d,lo,hi,start,end){
  for(const k of ['x','y','z']){
    if(Math.abs(d[k])<1e-10){if(o[k]<lo[k]||o[k]>hi[k])return null;continue;}
    const a=(lo[k]-o[k])/d[k],b=(hi[k]-o[k])/d[k];
    start=Math.max(start,Math.min(a,b));end=Math.min(end,Math.max(a,b));
    if(end<start)return null;
  }
  return [start,end];
}
function within(x,z,poly){
  if(inPolygon(x,z,poly))return true;
  for(const r of [poly.ring,...poly.holes])for(let i=0;i<r.length;i++)if(edgeDistance(x,z,r[i],r[(i+1)%r.length])<.012)return true;
  return false;
}
function distanceTo(item,ray,limit){
  let best=limit;const a=new Vector3(),b=new Vector3(),c=new Vector3(),v=new Vector3();
  function face(p,q,r){
    const hit=ray.intersectTriangle(a.fromArray(p),b.fromArray(q),c.fromArray(r),false,v);
    if(!hit)return;
    const t=hit.distanceTo(ray.origin);
    if(t>.12&&t<best&&within(hit.x,hit.z,item.poly))best=t;
  }
  const writer={
    quad(p){face(p[0],p[1],p[3]);face(p[1],p[2],p[3]);},
    roof(poly,y){
      if(Math.abs(ray.direction.y)<1e-9)return;
      const t=(y-ray.origin.y)/ray.direction.y;
      if(t<=.12||t>=best)return;
      ray.at(t,v);if(within(v.x,v.z,poly))best=t;
    }
  };
  if(item.block){
    writer.roof(item.poly,item.height);
    for(const r of [item.poly.ring,...item.poly.holes])for(let i=0;i<r.length;i++){
      const p=r[i],q=r[(i+1)%r.length],h=item.height;
      writer.quad([[p.x,0,p.z],[p.x,h,p.z],[q.x,h,q.z],[q.x,0,q.z]]);
    }
  }else ordinaryGeometry(writer,item.poly,item.feature,item.height,item.seed,1,item.outerArea);
  return best<limit?best:null;
}
function* inspectionSteps(data,project,marks=landmarks){
  const span=160,grid=new SpatialIndex(span),masks=landmarkIndex(marks,project);
  const min={x:Infinity,y:0,z:Infinity},max={x:-Infinity,y:0,z:-Infinity};
  function insert(item){
    const b=item.poly.bb;
    item.lo={x:b.x0-.02,y:0,z:b.z0-.02};item.hi={x:b.x1+.02,y:item.height+.02,z:b.z1+.02};
    min.x=Math.min(min.x,b.x0);min.z=Math.min(min.z,b.z0);max.x=Math.max(max.x,b.x1);max.z=Math.max(max.z,b.z1);max.y=Math.max(max.y,item.height);
    grid.insert(item,b);
  }
  // Keep authored destinations opaque to the selector. These structures have
  // their own catalogue panels and are excluded from the ordinary-building layer.
  for(const m of marks){
    const origin=project(m.lon,m.lat);
    for(const polygon of landmarkFootprints(m.id)||[]){
      if(polygon.length<3)continue;
      const ring=polygon.map(([x,z])=>({x:origin.x+x,z:origin.z+z}));
      insert({poly:{ring,holes:[],bb:bounds(ring)},height:m.height,block:true});
    }
  }
  let count=0;
  for(const f of data.buildings){
    if(++count%800===0)yield;
    const poly=projectArea(f,project);if(!poly)continue;
    const outerArea=Math.abs(ringArea(poly.ring));if(outerArea<2.2)continue;
    const area=Math.max(0,outerArea-poly.holes.reduce((sum,r)=>sum+Math.abs(ringArea(r)),0));
    const ref=f.osmType+'/'+f.osmId,block=replacedRefs.has(ref)||masks.hits(poly.bb.x,poly.bb.z)||(f.osmType==='way'&&templeCourtWays.has(f.osmId));
    insert({feature:f,poly,outerArea,area,block,ref,height:propertyHeight(f,outerArea),seed:seedAt(poly.bb.x,poly.bb.z)});
  }
  return (ray,range=12000)=>{
    const o=ray.origin,d=ray.direction,interval=slab(o,d,min,max,.12,range);if(!interval)return null;
    let t=interval[0],best=interval[1]+.001,chosen=null;const seen=new Set();
    const start=ray.at(t+.00001,new Vector3());
    let ix=Math.floor(start.x/span),iz=Math.floor(start.z/span);
    const sx=Math.sign(d.x),sz=Math.sign(d.z),stepX=sx?span/Math.abs(d.x):Infinity,stepZ=sz?span/Math.abs(d.z):Infinity;
    let tx=sx?((ix+(sx>0?1:0))*span-o.x)/d.x:Infinity,tz=sz?((iz+(sz>0?1:0))*span-o.z)/d.z:Infinity;
    while(t<=best&&t<=interval[1]){
      for(const item of grid.cells.get(ix+','+iz)||[]){
        if(seen.has(item))continue;seen.add(item);
        if(!slab(o,d,item.lo,item.hi,.12,best))continue;
        const hit=distanceTo(item,ray,best);
        if(hit!=null){best=hit;chosen=item;}
      }
      if(!sx&&!sz)break;
      if(tx<tz){t=tx;tx+=stepX;ix+=sx;}else{t=tz;tz+=stepZ;iz+=sz;}
    }
    if(!chosen||chosen.block)return null;
    return {feature:chosen.feature,ref:chosen.ref,area:chosen.area,height:chosen.height,point:ray.at(best,new Vector3()),distance:best};
  };
}
export function makeInspectionIndex(data,project,marks=landmarks){
  const steps=inspectionSteps(data,project,marks);
  let step;do{step=steps.next();}while(!step.done);return step.value;
}
async function responsiveIndex(data,project){
  const steps=inspectionSteps(data,project);
  for(;;){
    const end=performance.now()+7;
    do{const step=steps.next();if(step.done)return step.value;}while(performance.now()<end);
    await new Promise(resolve=>setTimeout(resolve,0));
  }
}
const cssUrl=new URL('./inspect.css',import.meta.url).href;
function addStyle(){
  if(document.querySelector('link[data-building-inspector]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=cssUrl;link.dataset.buildingInspector='';document.head.append(link);
}
function element(tag,cls,value){
  const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node;
}
export function attachInspector({button,canvas,camera,project,unproject,toast=()=>{},isVisible=()=>true}){
  if(!button||!canvas)return;
  addStyle();
  const shelf=document.querySelector('.shelf'),stage=canvas.parentElement,mount=shelf||stage,card=element('section','building-record');
  card.hidden=true;card.setAttribute('aria-label','建筑数据');card.setAttribute('aria-live','polite');mount.append(card);
  const raycaster=new Raycaster(),ndc=new Vector2();let lookup,active=false,token=0,gesture=null;
  const pointers=new Set();
  function hide(){card.hidden=true;mount.classList.remove('inspection-open');}
  function set(on){
    active=on;token++;gesture=null;pointers.clear();button.setAttribute('aria-pressed',String(on));stage.classList.toggle('inspection-mode',on);
    if(!on)hide();
  }
  function ready(){
    if(!lookup)lookup=loadBeijing().then(data=>responsiveIndex(data,project)).catch(error=>{lookup=null;throw error;});
    return lookup;
  }
  button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>{
    if(active){set(false);return;}
    if(!isVisible()||stage.dataset.render==='photo'){toast('请在三维场景中开启普通建筑图层');return;}
    set(true);toast('点选建筑查看数据，拖动可继续环视。');
    ready().catch(()=>{if(active){set(false);toast('建筑数据暂时无法读取');}});
  });
  function display(hit){
    const f=hit.feature,geo=unproject(hit.point.x,hit.point.z),e=heightEvidence(f,hit.height),title=f.name||'未命名建筑';
    const head=element('div','building-record-head'),name=element('h2','',title),close=element('button','building-record-close','退出查询');
    close.type='button';close.onclick=()=>{set(false);button.focus({preventScroll:true});};
    const id=element('a','building-record-id','OSM '+hit.ref+' ↗');id.href='https://www.openstreetmap.org/'+hit.ref;id.target='_blank';id.rel='noopener noreferrer';
    head.append(name,id,close);
    const values=element('dl','building-record-values');
    function row(label,value,extra){const pair=element('div'),dt=element('dt','',label),dd=element('dd','',value);if(extra)dd.append(element('small','',extra));pair.append(dt,dd);values.append(pair);}
    const tag=f.kind||'yes';
    row('OSM 建筑类别',category[tag]||tag,category[tag]?'building='+tag:undefined);
    row('基底面积',metres.format(hit.area)+' m²','按轮廓计算，扣除内院');
    row(e.source,metres.format(e.value)+' m',e.details);
    row('点击点 · WGS84',geo.lon.toFixed(5)+'° E',geo.lat.toFixed(5)+'° N');
    card.replaceChildren(head,values);card.hidden=false;mount.classList.add('inspection-open');
  }
  async function pick(clientX,clientY){
    if(!active||!isVisible()){set(false);return;}
    const rect=canvas.getBoundingClientRect();ndc.set(2*(clientX-rect.left)/rect.width-1,1-2*(clientY-rect.top)/rect.height);
    camera.updateMatrixWorld();raycaster.setFromCamera(ndc,camera);const ray=raycaster.ray.clone(),seq=++token;
    try{
      const find=await ready();if(!active||seq!==token)return;
      const hit=find(ray,Math.min(camera.far||12000,Math.max(7350,camera.position.y*5.5)));
      if(hit)display(hit);else{hide();toast('此处未命中普通建筑。请点选可见的屋顶或立面。');}
    }catch{if(seq===token){set(false);toast('建筑数据暂时无法读取');}}
  }
  canvas.addEventListener('pointerdown',e=>{
    if(!active)return;pointers.add(e.pointerId);
    if(e.button!==0||pointers.size>1){gesture=null;return;}
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  canvas.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6)gesture=null;});
  canvas.addEventListener('pointerup',e=>{
    pointers.delete(e.pointerId);if(!gesture||gesture.id!==e.pointerId)return;
    const click=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<=6;gesture=null;if(click)pick(e.clientX,e.clientY);
  });
  canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null;});
  document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&!document.querySelector('dialog[open]')){set(false);button.focus({preventScroll:true});}});
  document.addEventListener('change',()=>{if(active&&!isVisible())set(false);});
  return {close:()=>set(false)};
}
