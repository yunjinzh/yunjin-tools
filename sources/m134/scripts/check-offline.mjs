import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile('dist/client/sw.js','utf8');
let count=0;
function harness({active=false,brokenAsset=false}={}){
 const listeners={},stores=new Map(),calls=[];let offline=false,skipped=false,claimed=false,status=200;
 const cacheStore=name=>{if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return{put:async(key,r)=>data.set(typeof key==='string'?key:key.url,r.clone()),match:async key=>data.get(typeof key==='string'?key:key.url)?.clone()}};
 const caches={open:async name=>cacheStore(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)};
 const context={caches,URL,Response,AbortController,setTimeout,clearTimeout,console,fetch:async(input)=>{const path=typeof input==='string'?input:input.url;calls.push(path);if(offline)throw Error('offline');if(brokenAsset&&path!=='/')return new Response('failed',{status:503});return new Response(path==='/'?'<html><meta name="map-atelier-shell" content="1"></html>':'asset',{status})},self:{registration:{active},location:{origin:'https://app.test'},addEventListener:(n,fn)=>listeners[n]=fn,skipWaiting:async()=>{skipped=true},clients:{claim:async()=>{claimed=true}}}};
 vm.runInNewContext(source,context);
 async function life(type){let p;listeners[type]({waitUntil:v=>{p=v}});await p}
 async function fetchPath(path,mode='cors'){let p;listeners.fetch({request:{method:'GET',url:'https://app.test'+path,mode},respondWith:v=>{p=v}});return p===undefined?undefined:await p}
 return{stores,calls,life,fetchPath,setOffline:v=>offline=v,setStatus:v=>status=v,get skipped(){return skipped},get claimed(){return claimed}};
}
{
 const h=harness();await h.life('install');assert.ok(h.skipped);assert.ok(h.calls.some(p=>p.endsWith('icon-192.png')));assert.equal(h.calls.filter(p=>p.startsWith('/covers/')).length,12);await h.life('activate');assert.ok(h.claimed);count++;
 h.setOffline(true);const page=await h.fetchPath('/?view=notes','navigate');assert.equal(page.status,200);assert.match(await page.text(),/map-atelier-shell/);count++;
 const css=h.calls.find(p=>p.endsWith('.css'));assert.equal((await h.fetchPath(css)).status,200);count++;
 for(const route of ['/api/learning','/api/catalog','/signin-with-chatgpt','/signout-with-chatgpt','/callback'])assert.equal(await h.fetchPath(route),undefined);count++;
 h.setOffline(false);h.setStatus(401);assert.equal((await h.fetchPath('/','navigate')).status,401);count++;
}
{
 const h=harness({active:true});await h.life('install');assert.equal(h.skipped,false);count++;
}
{
 const h=harness({brokenAsset:true});await assert.rejects(h.life('install'));assert.equal(h.stores.size,0);count++;
}
const manifest=JSON.parse(await fs.readFile('public/manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');for(const icon of manifest.icons)assert.ok((await fs.stat('dist/client'+icon.src)).size>0);count++;
console.log(`PASS: ${count} offline shell scenarios (complete precache, 12 covers, offline navigation/assets, auth/API exclusions, 401, safe upgrades, failed-install cleanup, manifest).`);
