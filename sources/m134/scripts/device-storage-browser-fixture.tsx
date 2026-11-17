'use client';
import {useState} from 'react';
import {acknowledge,deviceEntries,queueRecord,mergeCloud,LocalConflict,lastOwner,setOwner,saveMeta,readMeta} from '../app/lib/device-store';
import {emptyRecord} from '../app/lib/types';
export default function QA(){const [log,setLog]=useState<string[]>([]);return <main><h1>浏览器本机存储回归验证</h1><button onClick={async()=>{
 const output:string[]=[],account='qa-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),other=account+'-other',previous=await lastOwner();
 const check=(ok:unknown,name:string)=>{if(!ok)throw Error(name);output.push('通过：'+name);setLog([...output])};
 try{
  const base={...emptyRecord('TESTVIDEO01'),notes:'云端基线',revision:1,updated:'base'};
  await mergeCloud(account,[base]);check((await deviceEntries(account))[0].record.notes==='云端基线','记录可跨连接读取');
  const local=await queueRecord(account,{...base,notes:'离线笔记'},base.updated);check((await deviceEntries(account))[0].pending,'离线保存进入待同步队列');
  await mergeCloud(account,[{...base,notes:'更新的云端',revision:2}]);check((await deviceEntries(account))[0].record.notes==='离线笔记','云端读取不覆盖待同步笔记');
  check((await deviceEntries(other)).length===0,'不同账号隔离');
  let conflict=false;try{await queueRecord(account,{...base,notes:'旧窗口'},base.updated)}catch(e){conflict=e instanceof LocalConflict}check(conflict,'旧窗口写入受到冲突保护');
  const newer=await queueRecord(account,{...local,notes:'同步期间继续编辑'},local.updated);
  await acknowledge(account,local,{...local,revision:3,updated:'cloud'});const after=(await deviceEntries(account))[0];check(after.pending&&after.record.notes===newer.notes&&after.record.revision===3,'同步回执保留更新的本机输入');
  await acknowledge(account,after.record,{...after.record,revision:4,updated:'cloud2'});check(!(await deviceEntries(account))[0].pending,'确认同步后清除待同步状态');
  await saveMeta(account,{revision:12,description:'cached learning data'});check((await readMeta<{revision:number}>(account))?.revision===12,'资料快照持久化');
  output.push('全部 8 项浏览器存储检查通过');setLog([...output]);
 }catch(e){setLog([...output,'失败：'+(e as Error).message])}
 finally{await setOwner(previous);const r=indexedDB.open('map-atelier-device-v1');r.onsuccess=()=>{const db=r.result,tx=db.transaction(['records','meta'],'readwrite');tx.objectStore('records').delete(account+':TESTVIDEO01');tx.objectStore('meta').delete(account);tx.oncomplete=()=>db.close()}}
}}>运行隔离存储检查</button><ol>{log.map(x=><li key={x}>{x}</li>)}</ol><p>此页面不登录或模拟真实账号，不读取真实笔记；测试后移除。</p></main>}
