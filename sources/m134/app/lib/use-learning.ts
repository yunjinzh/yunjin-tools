'use client';
import {useCallback,useEffect,useReducer,useRef,useState} from 'react';
import {initialLearningState,isDirty,isLearningRecord,learningReducer,sameContent} from './learning-machine';
import type {Event,Notice} from './learning-machine';
import type {LearningRecord} from './types';
import {acknowledge,adoptRemote,deviceEntries,lastOwner,LocalConflict,mergeCloud,queueRecord,setOwner} from './device-store';

export function useLearning() {
 const [state,reactDispatch]=useReducer(learningReducer,initialLearningState);
 const [device,setDevice]=useState({offline:false,pending:0,available:false});
 const current=useRef(state),sequence=useRef(0),controllers=useRef(new Set<AbortController>()),alive=useRef(true);
 const localConflicts=useRef(new Set<string>());
 const owner=useRef<string|null>(null),cloudOwner=useRef<string|null>(null),flushing=useRef(false),syncRef=useRef<()=>Promise<void>>(async()=>{});
 const dispatch=useCallback((event:Event)=>{if(!alive.current)return;current.current=learningReducer(current.current,event);reactDispatch(event)},[]);
 const notify=useCallback((notice:Omit<Notice,'id'>)=>dispatch({type:'NOTICE',notice:{...notice,id:++sequence.current}}),[dispatch]);
 const updateDevice=useCallback(async()=>{const entries=owner.current?await deviceEntries(owner.current):[];if(alive.current)setDevice({offline:!navigator.onLine||(!!owner.current&&!cloudOwner.current),pending:entries.filter(e=>e.pending).length,available:!!owner.current})},[]);
 const request=useCallback(async(init?:RequestInit)=>{
  const controller=new AbortController();controllers.current.add(controller);const timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch('/api/learning',{cache:'no-store',...init,signal:controller.signal});const raw=await response.json();if(!raw||typeof raw!=='object')throw Error('服务返回格式异常');return {response,data:raw as {error?:string;authenticated?:boolean;ownerId?:string;records?:unknown;record?:unknown}}}
  finally{clearTimeout(timeout);controllers.current.delete(controller)}
 },[]);
 const load=useCallback(async()=>{
  if(current.current.mutation.kind==='saving'||flushing.current)return;
  const id=++sequence.current;dispatch({type:'READ_START',request:id});
  try{
   if(!navigator.onLine)throw Error('offline');
   const {response,data}=await request();if(current.current.read.kind!=='loading'||current.current.read.request!==id)return;if(!response.ok)throw Error(data.error||'读取失败');
   if(typeof data.authenticated!=='boolean'||!Array.isArray(data.records)||!data.records.every(isLearningRecord)||(data.authenticated&&typeof data.ownerId!=='string'))throw Error('学习记录返回格式异常');
   if(owner.current&&data.ownerId&&owner.current!==data.ownerId&&isDirty(current.current.panel)){
    cloudOwner.current=null;dispatch({type:'READ_ERROR',request:id,message:'账号已变化，请先下载当前草稿，再重新打开网页。'});return;
   }
   cloudOwner.current=data.authenticated?data.ownerId!:null;owner.current=cloudOwner.current;
   let records=data.records;
   if(owner.current){try{records=(await mergeCloud(owner.current,records)).map(e=>e.record)}catch{notify({text:'浏览器无法保存离线副本；在线记录仍可使用，请导出重要笔记。',error:true})}}
   else await setOwner(null).catch(()=>{});
   dispatch({type:'READ_OK',request:id,authenticated:data.authenticated,records});
   await updateDevice().catch(()=>{});queueMicrotask(()=>void syncRef.current());
  }catch(e){
   if(current.current.read.kind!=='loading'||current.current.read.request!==id)return;
   cloudOwner.current=null;
   try{owner.current=owner.current||await lastOwner();if(owner.current){const records=(await deviceEntries(owner.current)).map(e=>e.record);dispatch({type:'READ_OK',request:id,authenticated:true,records});await updateDevice().catch(()=>{});return}}catch{}
   dispatch({type:'READ_ERROR',request:id,message:'当前无法读取记录；首次离线使用前，请联网登录并完成资料下载。'});
  }
 },[dispatch,request,updateDevice,notify]);
 useEffect(()=>{
  alive.current=true;void load();
  const online=()=>void load(),offline=()=>{cloudOwner.current=null;void updateDevice().catch(()=>{})};
  window.addEventListener('online',online);window.addEventListener('offline',offline);
  const timer=setInterval(()=>{if(navigator.onLine&&current.current.panel.kind==='closed'&&current.current.mutation.kind!=='conflict')void load()},120000);
  return()=>{alive.current=false;for(const c of controllers.current)c.abort();clearInterval(timer);window.removeEventListener('online',online);window.removeEventListener('offline',offline)};
 },[load,updateDevice]);
 useEffect(()=>{if(!state.notice)return;const id=state.notice.id,t=setTimeout(()=>dispatch({type:'DISMISS_NOTICE',id}),6500);return()=>clearTimeout(t)},[state.notice,dispatch]);
 const panel=state.panel,mediaId=panel.kind==='lesson'?panel.draft.id:null,media=panel.kind==='lesson'?panel.media:null,attempt=panel.kind==='lesson'?panel.attempt:0;
 useEffect(()=>{if(!mediaId||media!=='loading')return;const t=setTimeout(()=>dispatch({type:'MEDIA_RESULT',id:mediaId,attempt,result:'unavailable'}),15000);return()=>clearTimeout(t)},[mediaId,media,attempt,dispatch]);

 async function save(record:LearningRecord,syncing=false){
  const s=current.current;if(s.mutation.kind==='saving')return false;
  if(s.mutation.kind==='conflict'){notify({text:'请先处理版本冲突。',error:true});return false}
  if(s.read.kind!=='ready'){notify({text:s.read.kind==='error'?s.read.message:'正在读取记录，请稍后再试。',error:true});return false}
  if(!s.read.authenticated||!owner.current){notify({text:'请先联网登录并下载资料，再保存学习记录。',error:true,login:true});return false}
  const account=owner.current,id=++sequence.current;dispatch({type:'SAVE_START',request:id,record});
  if(current.current.mutation.kind!=='saving'||current.current.mutation.request!==id)return false;
  let local:LearningRecord=record,persisted=syncing;
  try{
   if(!syncing){try{local=await queueRecord(account,record,s.records[record.id]?.updated||'');persisted=true}catch(error){if(error instanceof LocalConflict||!navigator.onLine||cloudOwner.current!==account)throw error;notify({text:'本机副本暂时无法写入，正在尝试直接保存到云端。',error:true})}}
   if(!navigator.onLine||cloudOwner.current!==account)throw Error('offline');
   const {response,data}=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(local)});
   if(response.status===409&&isLearningRecord(data.record)&&data.record.id===record.id){
    if(sameContent(local,data.record)){await acknowledge(account,local,data.record).catch(()=>notify({text:'云端已保存，但本机副本未能更新，请导出备份。',error:true}));dispatch({type:'SAVE_OK',request:id,record:data.record});await updateDevice().catch(()=>{});return true}
    dispatch({type:'SAVE_CONFLICT',request:id,remote:data.record});notify({text:'本机修改已保留，请对照较新的云端版本。',error:true});await updateDevice().catch(()=>{});return false;
   }
   if(!response.ok){
    if(response.status===401){cloudOwner.current=null;await setOwner(null);dispatch({type:'SAVE_ERROR',request:id,message:'登录已失效。本机副本已保留，请使用原账号登录后同步。',unauthorized:true});notify({text:'登录已失效，本机笔记已保留。',error:true,login:true});await updateDevice().catch(()=>{});return false}
    throw Error(data.error||'暂时无法同步');
   }
   if(!isLearningRecord(data.record)||data.record.id!==record.id||data.record.revision!==record.revision+1)throw Error('无法确认保存结果');
   await acknowledge(account,local,data.record).catch(()=>notify({text:'云端已保存，但本机副本未能更新，请导出备份。',error:true}));dispatch({type:'SAVE_OK',request:id,record:data.record});await updateDevice().catch(()=>{});
   if(!syncing)notify({text:isDirty(current.current.panel)?'已保存提交时的内容；后续修改仍待保存。':'已保存到本机并同步云端'});return true;
  }catch(e){
   if(e instanceof LocalConflict){localConflicts.current.add(record.id);dispatch({type:'SAVE_CONFLICT',request:id,remote:e.record});notify({text:'另一个窗口更新了本机笔记，请对照后继续。',error:true});return false}
   if(persisted){dispatch({type:'SAVE_OK',request:id,record:local});cloudOwner.current=null;await updateDevice().catch(()=>{});if(!syncing)notify({text:'已保存到本机，联网后自动同步。'});return false}
   dispatch({type:'SAVE_ERROR',request:id,message:'本机存储不可用，输入仍在编辑框中，请先下载草稿。'});notify({text:'本机保存失败，请先下载草稿。',error:true});return false;
  }
 }
 async function sync(){
  if(flushing.current||!navigator.onLine||!owner.current||cloudOwner.current!==owner.current||current.current.panel.kind!=='closed'||current.current.mutation.kind==='conflict')return;
  flushing.current=true;
  try{for(const entry of await deviceEntries(owner.current)){if(entry.pending&&!await save(entry.record,true))break}}
  finally{flushing.current=false;await updateDevice().catch(()=>{})}
 }
 syncRef.current=sync;
 async function resolveConflict(choice:'local'|'remote'){
  const s=current.current;if(s.mutation.kind!=='conflict'||!owner.current)return;
  try{await adoptRemote(owner.current,s.mutation.remote,localConflicts.current.has(s.mutation.id));localConflicts.current.delete(s.mutation.id);dispatch({type:'RESOLVE_CONFLICT',choice});await updateDevice()}
  catch{notify({text:'无法保存冲突处理结果，请先下载草稿。',error:true})}
 }
 return {state,dispatch,load,save,notify,device,resolveConflict};
}
