'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {isCatalogSnapshot,seedCatalog} from './catalog-data';
import type {CatalogSnapshot} from './catalog-data';
import {readMeta,saveMeta} from './device-store';
export function useContentUpdates(blocked:boolean){
 const [data,setData]=useState(seedCatalog),[message,setMessage]=useState('每周一、三、五更新 · 北京时间'),[checking,setChecking]=useState(false);
 const latest=useRef(seedCatalog),pending=useRef<CatalogSnapshot|null>(null),busy=useRef(false),blockedRef=useRef(blocked),alive=useRef(true);
 blockedRef.current=blocked;
 const accept=useCallback((next:CatalogSnapshot)=>{
  if(!alive.current||next.revision<latest.current.revision)return;
  latest.current=next;
  if(blockedRef.current){pending.current=next;setMessage('资料已下载，关闭详情后显示更新');}
  else{setData(next);setMessage(`资料版本 ${next.revision} · ${next.message}`)}
 },[]);
 const refresh=useCallback(async()=>{
  if(busy.current)return;if(!navigator.onLine){setMessage('离线阅读中 · 联网后补齐最新资料');return;}
  busy.current=true;setChecking(true);const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);
  try{
   const response=await fetch('/api/catalog',{cache:'no-store',signal:c.signal});
   if(!response.ok)throw Error();const next:unknown=await response.json();if(!isCatalogSnapshot(next))throw Error();
   if(next.revision<latest.current.revision)throw Error();
   await saveMeta('catalog',next);await saveMeta('catalogChecked',new Date().toISOString());
   if(next.revision>latest.current.revision)accept(next);
   else if(alive.current)setMessage('已检查更新 · 当前资料为最新已核验版本');
  }catch{if(alive.current)setMessage('更新暂未完成，已下载资料仍可阅读；恢复连接后重试');}
  finally{clearTimeout(timer);busy.current=false;if(alive.current)setChecking(false);}
 },[accept]);
 useEffect(()=>{alive.current=true;void(async()=>{try{const cached=await readMeta<unknown>('catalog');if(isCatalogSnapshot(cached))accept(cached)}catch{}if(alive.current)void refresh()})();
  const wake=()=>{if(document.visibilityState==='visible')void refresh()};
  const online=()=>void refresh(),offline=()=>setMessage('离线阅读中 · 联网后补齐最新资料');
  window.addEventListener('online',online);window.addEventListener('offline',offline);document.addEventListener('visibilitychange',wake);
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh()},30*60*1000);
  return()=>{alive.current=false;clearInterval(timer);window.removeEventListener('online',online);window.removeEventListener('offline',offline);document.removeEventListener('visibilitychange',wake)};
 },[accept,refresh]);
 useEffect(()=>{if(!blocked&&pending.current){const next=pending.current;pending.current=null;setData(next);setMessage(`资料版本 ${next.revision} · ${next.message}`)}},[blocked]);
 return {data,message,checking,refresh};
}
