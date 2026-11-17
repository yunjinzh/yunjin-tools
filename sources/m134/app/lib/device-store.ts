import type {LearningRecord} from './types';
import {sameContent} from './learning-machine';
export type DeviceEntry={key:string;owner:string;record:LearningRecord;pending:boolean};
const DB='map-atelier-device-v1';
let connection:Promise<IDBDatabase>|null=null;
function database(){return connection ||= new Promise<IDBDatabase>((resolve,reject)=>{
 const r=indexedDB.open(DB,1);
 r.onupgradeneeded=()=>{r.result.createObjectStore('records',{keyPath:'key'});r.result.createObjectStore('meta')};
 r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null};resolve(r.result)};
 r.onerror=()=>{connection=null;reject(r.error)};
});}
function result<T>(r:IDBRequest<T>){return new Promise<T>((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function done(tx:IDBTransaction){return new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('本机保存已取消'))})}
export async function lastOwner():Promise<string|null>{const db=await database();return (await result(db.transaction('meta').objectStore('meta').get('owner')))||null}
export async function setOwner(owner:string|null){const db=await database(),tx=db.transaction('meta','readwrite'),end=done(tx);tx.objectStore('meta').put(owner,'owner');await end}
export async function deviceEntries(owner:string):Promise<DeviceEntry[]>{const db=await database();return (await result(db.transaction('records').objectStore('records').getAll()) as DeviceEntry[]).filter(e=>e.owner===owner)}
export async function mergeCloud(owner:string,records:LearningRecord[]){
 const db=await database(),tx=db.transaction('records','readwrite'),end=done(tx),store=tx.objectStore('records');
 const all=await result(store.getAll()) as DeviceEntry[];
 for(const record of records){const key=owner+':'+record.id,old=all.find(e=>e.key===key);if(!old?.pending)store.put({key,owner,record,pending:false})}
 await end;await setOwner(owner);return deviceEntries(owner);
}
export class LocalConflict extends Error{constructor(public record:LearningRecord){super('另一个窗口刚刚修改了本机记录')}}
export async function queueRecord(owner:string,record:LearningRecord,expectedUpdated:string):Promise<LearningRecord>{
 const db=await database(),tx=db.transaction('records','readwrite'),end=done(tx),store=tx.objectStore('records'),key=owner+':'+record.id;
 const old=await result(store.get(key)) as DeviceEntry|undefined;
 if(old?.pending&&old.record.updated!==expectedUpdated&&!sameContent(old.record,record)){await end;throw new LocalConflict(old.record)}
 const tick=Math.max(Date.now(),(Date.parse(old?.record.updated||'')||0)+1);
 const next={...record,updated:new Date(tick).toISOString()};store.put({key,owner,record:next,pending:true});await end;return next;
}
export async function acknowledge(owner:string,submitted:LearningRecord,confirmed:LearningRecord){
 const db=await database(),tx=db.transaction('records','readwrite'),end=done(tx),store=tx.objectStore('records'),key=owner+':'+submitted.id;
 const old=await result(store.get(key)) as DeviceEntry|undefined;
 if(!old||sameContent(old.record,submitted))store.put({key,owner,record:confirmed,pending:false});
 else store.put({...old,record:{...old.record,revision:confirmed.revision},pending:true});
 await end;
}
export async function adoptRemote(owner:string,record:LearningRecord,pending=false){const db=await database(),tx=db.transaction('records','readwrite'),end=done(tx);tx.objectStore('records').put({key:owner+':'+record.id,owner,record,pending});await end}
export async function saveMeta(key:string,value:unknown){const db=await database(),tx=db.transaction('meta','readwrite'),end=done(tx);tx.objectStore('meta').put(value,key);await end}
export async function readMeta<T>(key:string):Promise<T|undefined>{const db=await database();return result(db.transaction('meta').objectStore('meta').get(key))}
