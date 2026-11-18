/* Mirror Atelier — stable style catalogue, reversible editor and safe local storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MirrorEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=o=>JSON.parse(JSON.stringify(o));
const definitions=[
 ['hair','发型',[['02','法式短碎','hair','都市'],['06','耳下波波','hair','都市'],['11','公主切长直','hair','自然'],['12','侧扫大波浪','hair','都市'],['15','冲天高马尾','hair','未来'],['18','丸子高髻','hair','自然']]],
 ['brow','眉毛',[['01','粗平眉','brow','都市'],['06','柳叶眉','brow','自然'],['11','挑峰眉','brow','未来'],['17','单道断眉','brow','都市']]],
 ['eyes','眼睛',[['01','标准杏眼','eyes','自然'],['02','圆杏眼','eyes','自然'],['06','上挑猫眼','eyes','都市'],['12','半垂睡眼','eyes','未来']]],
 ['ears','耳朵',[['01','贴头小耳','ears','都市'],['03','外展扇耳','ears','自然'],['12','水滴耳垂','ears','都市'],['17','长尖上扬耳','ears','未来']]],
 ['mouth','嘴巴',[['01','自然平唇','mouth','自然'],['04','圆润厚唇','mouth','都市'],['09','心形唇','mouth','自然'],['16','上翘嘴角唇','mouth','未来']]],
 ['jewelry','首饰',[['01','圆珠耳钉','earjewel','都市'],['03','金属圆环','earjewel','未来'],['09','细手镯','wrist','都市'],['13','串珠手链','wrist','自然'],['15','素圈戒','ring','都市'],['19','拱面宝石戒','ring','自然']]],
 ['necklace','项链',[['03','短珍珠链','necklace','自然'],['04','颈圈','necklace','未来'],['06','月牙吊坠','necklace','自然'],['12','长款 Y 链','necklace','都市']]],
 ['accessory','配饰',[['01','贝雷帽','hat','都市'],['05','交叉发带','hat','自然'],['06','圆框眼镜','glasses','都市'],['07','猫眼墨镜','glasses','未来'],['11','单肩邮差包','bag','都市'],['13','斜挎小包','bag','未来'],['16','折扇','held','自然'],['17','手捧花','held','自然']]],
 ['top','上衣',[['01','圆领短袖','top','都市'],['06','牛津衬衫','top','都市'],['12','连帽卫衣','top','都市'],['13','高领毛衣','top','自然'],['15','短款西装','top','未来'],['19','斜襟短袄','top','自然']]],
 ['bottom','下衣',[['01','直筒牛仔裤','bottom','都市'],['02','阔腿裤','bottom','自然'],['04','工装多袋裤','bottom','未来'],['11','百褶短裙','bottom','都市'],['14','垂褶长裙','bottom','自然'],['16','斜裁裹裙','bottom','未来']]],
 ['shoes','鞋子',[['01','帆布低帮鞋','shoes','都市'],['03','厚底跑鞋','shoes','未来'],['06','便士乐福鞋','shoes','都市'],['10','尖头细跟鞋','shoes','都市'],['16','切尔西靴','shoes','自然'],['18','马术长靴','shoes','自然']]]
];
const categories=definitions.map(([id,label,items])=>({id,label,slots:[...new Set(items.map(i=>i[2]))],items:items.map(([code,name,slot,tag])=>({id:id+'-'+code,code,name,slot,tag,category:id}))}));
const CATALOG=Object.fromEntries(categories.flatMap(c=>c.items).map(i=>[i.id,i]));
const OPTIONAL=['earjewel','wrist','ring','necklace','hat','glasses','bag','held'];
const SLOTS=['hair','brow','eyes','ears','mouth',...OPTIONAL,'top','bottom','shoes'];
const defaultState={body:'feminine',slots:{hair:'hair-06',brow:'brow-06',eyes:'eyes-01',ears:'ears-01',mouth:'mouth-01',earjewel:'jewelry-01',wrist:null,ring:null,necklace:'necklace-06',hat:null,glasses:null,bag:null,held:null,top:'top-06',bottom:'bottom-02',shoes:'shoes-06'},colors:{skin:'#edbea5',hair:'#382b2b',brow:'#382b2b',eyes:'#5d6254',mouth:'#b76868',top:'#d8cfc0',bottom:'#3d4c43',shoes:'#453e38',metal:'#b89a62'},locks:[],scene:'studio',pose:'relaxed',framing:'full',format:'portrait',fill:true};
const KEYS={draft:'mirror-atelier.draft.v1',works:'mirror-atelier.works.v1'};
const sceneIds=['studio','subway','greenhouse','orbit','gallery'];
const poseIds=['relaxed','lean','wave','turn'];
const framingIds=['full','half','face'];
function normalized(input,fallback=defaultState){
 const state=clone(fallback), src=input&&typeof input==='object'?input:{};
 if(['feminine','masculine'].includes(src.body))state.body=src.body;
 for(const slot of SLOTS){
  if(!src.slots||!Object.prototype.hasOwnProperty.call(src.slots,slot))continue;
  const val=src.slots[slot];
  if(val===null&&OPTIONAL.includes(slot))state.slots[slot]=null;
  else if(CATALOG[val]&&CATALOG[val].slot===slot)state.slots[slot]=val;
 }
 if(src.colors)for(const key of Object.keys(defaultState.colors))if(/^#[0-9a-f]{6}$/i.test(src.colors[key]||''))state.colors[key]=src.colors[key];
 if(Array.isArray(src.locks))state.locks=[...new Set(src.locks.filter(s=>SLOTS.includes(s)))];
 if(sceneIds.includes(src.scene))state.scene=src.scene;
 if(poseIds.includes(src.pose))state.pose=src.pose;
 if(framingIds.includes(src.framing))state.framing=src.framing;
 if(['portrait','landscape'].includes(src.format))state.format=src.format;
 if(typeof src.fill==='boolean')state.fill=src.fill;
 if(state.slots.held&&state.pose==='wave')state.pose='relaxed';
 return state;
}
function compatibility(state){
 const s=state.slots,out=[];
 if(s.top==='top-13'&&['necklace-03','necklace-04'].includes(s.necklace))out.push('领口遮挡：'+CATALOG[s.necklace].name+'仍保留，换回低领即可看见。');
 if(s.hat==='accessory-01'&&['hair-11','hair-12','hair-15','hair-18'].includes(s.hair))out.push('帽下适配：保留发尾与刘海，摘帽后恢复完整发型。');
 if(s.held)out.push('手持物已启用握持姿势；抬手示意暂不可用。');
 if(['bottom-14','bottom-16'].includes(s.bottom))out.push('长裙采用静态站姿，保持裙摆与鞋子层次。');
 return out;
}
function createStore(storage){
 let storeAccessError=null;
 if(arguments.length===0){try{storage=typeof localStorage!=='undefined'?localStorage:null;}catch(e){storage=null;storeAccessError=e.message;}}
 let state=clone(defaultState), past=[],future=[],works=[],draft=null;
 let status={available:!!storage,draftSaved:false,error:storeAccessError||(!storage?'storage-unavailable':null)};
 const listeners=new Set();
 const emit=()=>listeners.forEach(fn=>{try{fn(clone(state));}catch(e){/* A consumer must not break saving. */}});
 function read(key){if(!storage)return null;try{const raw=storage.getItem(key);return raw?JSON.parse(raw):null;}catch(e){status={available:false,draftSaved:false,error:e.name||'storage-read-failed'};return null;}}
 const loadedWorks=read(KEYS.works),loadedDraft=read(KEYS.draft);
 if(Array.isArray(loadedWorks))works=loadedWorks.filter(w=>w&&typeof w.id==='string'&&typeof w.name==='string'&&w.snapshot&&typeof w.snapshot==='object').map(w=>({...w,snapshot:normalized(w.snapshot)}));
 if(loadedDraft&&loadedDraft.snapshot){draft={snapshot:normalized(loadedDraft.snapshot),updatedAt:loadedDraft.updatedAt||null};status.draftSaved=status.available;}
 function write(key,value){
  if(!storage){status={available:false,draftSaved:false,error:'storage-unavailable'};return false;}
  try{storage.setItem(key,JSON.stringify(value));status.available=true;status.error=null;return true;}
  catch(e){status.available=false;status.error=e.name||'storage-write-failed';return false;}
 }
 function persistDraft(){const next={version:1,snapshot:clone(state),updatedAt:new Date().toISOString()};status.draftSaved=write(KEYS.draft,next);draft=next;}
 function push(next){if(JSON.stringify(next)===JSON.stringify(state))return {ok:true,changed:false};past.push(clone(state));if(past.length>30)past.shift();future=[];state=next;persistDraft();emit();return {ok:true,changed:true};}
 function apply(patch){
  let candidate;
  if(typeof patch==='function'){const copy=clone(state),res=patch(copy);candidate=res===undefined?copy:res;}else if(patch&&typeof patch==='object')candidate={...state,...patch,slots:{...state.slots,...patch.slots},colors:{...state.colors,...patch.colors}};else return {ok:false,reason:'invalid-patch'};
  if(candidate.pose==='wave'&&candidate.slots&&candidate.slots.held){
   if(state.pose!=='wave'&&candidate.pose!==state.pose)return {ok:false,reason:'held-pose-conflict'};
   candidate.pose='relaxed';
  }
  return push(normalized(candidate,state));
 }
 function persistWorks(next){if(!write(KEYS.works,next)){emit();return {ok:false,reason:'storage-unavailable'};}works=next;emit();return {ok:true};}
 const validName=n=>typeof n==='string'?n.trim().slice(0,60):'';
 const duplicate=(n,id)=>works.some(w=>w.name===n&&w.id!==id);
 const api={
  getState:()=>clone(state),
  apply,
  setView(patch){if(!patch||typeof patch!=='object')return {ok:false,reason:'invalid-patch'};const safe={};for(const key of ['framing','format','fill'])if(Object.prototype.hasOwnProperty.call(patch,key))safe[key]=patch[key];const next=normalized({...state,...safe},state);if(JSON.stringify(next)===JSON.stringify(state))return {ok:true,changed:false};state=next;persistDraft();emit();return {ok:true,changed:true};},
  undo(){if(!past.length)return {ok:false,reason:'no-history'};future.push(clone(state));state=past.pop();persistDraft();emit();return {ok:true};},
  redo(){if(!future.length)return {ok:false,reason:'no-future'};past.push(clone(state));state=future.pop();persistDraft();emit();return {ok:true};},
  canUndo:()=>past.length>0,canRedo:()=>future.length>0,
  setSlot(id){const item=CATALOG[id];if(!item)return {ok:false,reason:'unknown-item'};return apply({slots:{[item.slot]:id}});},
  removeSlot(slot){if(!OPTIONAL.includes(slot))return {ok:false,reason:'required-slot'};return apply({slots:{[slot]:null}});},
  toggleLock(slot){if(!SLOTS.includes(slot))return {ok:false,reason:'unknown-slot'};return apply({locks:state.locks.includes(slot)?state.locks.filter(s=>s!==slot):state.locks.concat(slot)});},
  randomize(categoryId){
   const group=categoryId?categories.filter(c=>c.id===categoryId):categories;
   if(!group.length)return {ok:false,reason:'unknown-category'};
   const next=clone(state);let count=0;
   group.forEach(c=>c.slots.forEach(slot=>{if(next.locks.includes(slot))return;const candidates=c.items.filter(i=>i.slot===slot&&i.id!==next.slots[slot]);if(candidates.length){next.slots[slot]=candidates[Math.floor(Math.random()*candidates.length)].id;count++;}}));
   if(!count)return {ok:false,reason:'all-locked'};
   if(next.slots.held&&next.pose==='wave')next.pose='relaxed';
   return push(next);
  },
  listWorks:()=>clone(works).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))),
  saveWork(name,existingId){
   name=validName(name);if(!name)return {ok:false,reason:'empty-name'};
   if(existingId&&!works.some(w=>w.id===existingId))return {ok:false,reason:'not-found'};
   if(duplicate(name,existingId))return {ok:false,reason:'duplicate'};
   const now=new Date().toISOString(),old=existingId?works.find(w=>w.id===existingId):null;
   const work={id:old?old.id:'work-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),name,snapshot:clone(state),createdAt:old?old.createdAt:now,updatedAt:now};
   const next=old?works.map(w=>w.id===old.id?work:w):works.concat(work);
   const result=persistWorks(next);return result.ok?{ok:true,work:clone(work)}:result;
  },
  openWork(id){const work=works.find(w=>w.id===id);if(!work)return {ok:false,reason:'not-found'};return push(normalized(work.snapshot));},
  renameWork(id,name){name=validName(name);if(!name)return {ok:false,reason:'empty-name'};if(!works.some(w=>w.id===id))return {ok:false,reason:'not-found'};if(duplicate(name,id))return {ok:false,reason:'duplicate'};return persistWorks(works.map(w=>w.id===id?{...w,name,updatedAt:new Date().toISOString()}:w));},
  deleteWork(id){if(!works.some(w=>w.id===id))return {ok:false,reason:'not-found'};return persistWorks(works.filter(w=>w.id!==id));},
  getDraft:()=>draft?clone(draft):null,
  restoreDraft(){if(!draft)return {ok:false,reason:'no-draft'};return push(normalized(draft.snapshot));},
  freshStart(){const result=push(clone(defaultState));if(!result.changed){persistDraft();emit();}return result;},
  storageStatus:()=>clone(status),
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 };
 return api;
}
return {categories,CATALOG,defaultState:clone(defaultState),createStore,compatibility,OPTIONAL,SLOTS,KEYS,normalized};
});
