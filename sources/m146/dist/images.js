/* Hosted: ordinary same-origin WebP. Offline: local classic scripts contain byte-identical WebP.
   No fetch, file-origin texture upload or network fallback. Only a small nearby set is resident. */
(()=>{'use strict';
const ready=new Map(),jobs=new Map(),queue=[],cap=12,parallel=3;let active=0;
function accept(id,b64){const item=jobs.get(id);if(!item?.active||typeof b64!=='string'||!b64.startsWith('UklGR'))return;item.payload='data:image/webp;base64,'+b64}
function pump(){while(active<parallel&&queue.length){const item=queue.shift(),id=item.id;if(jobs.get(id)!==item)continue;const s=document.createElement('script');active++;item.active=true;
function finish(error){if(!item.active)return;s.remove();jobs.delete(id);active--;item.active=false;if(error||!item.payload)item.reject(Error('未能读取离线原卡 '+id));else{ready.set(id,item.payload);while(ready.size>cap)ready.delete(ready.keys().next().value);item.resolve(item.payload)}pump()}
s.onload=()=>finish(false);s.onerror=()=>finish(true);s.async=true;s.src='./cards/'+id+'.js';document.head.appendChild(s)}}
function url(id){id=String(id);if(!/^\d{4}$/.test(id))return Promise.reject(Error('无效的卡片编号'));if(!window.TrailOfflinePack)return Promise.resolve('./cards/'+id+'.webp');
if(ready.has(id)){const s=ready.get(id);ready.delete(id);ready.set(id,s);return Promise.resolve(s)}if(jobs.has(id))return jobs.get(id).p;
while(queue.length>=cap){const obsolete=queue.shift();jobs.delete(obsolete.id);obsolete.reject(Error('已切换到新的路段'))}const e={id};e.p=new Promise((res,rej)=>{e.resolve=res;e.reject=rej});jobs.set(id,e);queue.push(e);pump();return e.p}
window.TrailImages={url,accept,cacheInfo:()=>({urls:ready.size,active,queued:queue.length,limit:cap,parallel})};
})();
