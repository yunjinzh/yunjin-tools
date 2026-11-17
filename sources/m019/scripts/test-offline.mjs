import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const offlineDir=process.env.MUSEUM_OFFLINE_DIR||'offline-portable';
const html=fs.readFileSync(path.join(root,offlineDir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
const find=id=>scripts.find(m=>m[1].includes(`id="${id}"`))?.[2];
assert.ok([4,5].includes(scripts.length));
assert.ok(!/<(?:script|link|img|iframe|source)\b[^>]*(?:src|href)\s*=\s*["'](?:https?:|\/\/|\.\/|assets\/|app\.js|style\.css)/i.test(html));
assert.ok(!/<script[^>]+type="module"/.test(html));
assert.ok(!/<script[^>]+src=/.test(html));
if(find('museum-gallery-config')){assert.equal(find('museum-gallery-config'),fs.readFileSync(path.join(root,'dist/gallery-config.js'),'utf8'));assert.ok(html.indexOf('id="museum-gallery-config"')<html.indexOf('id="museum-app"'));}

assert.ok(!/@import|url\(\s*["']?(?:https?:|\/\/|assets\/)/i.test(html));
let payload=JSON.parse(find('museum-offline-data'));
const originalMaps=JSON.parse(fs.readFileSync(path.join(root,'dist/maps.json'),'utf8'));const count=originalMaps.length;assert.ok(count>=200);assert.deepEqual(payload.maps,originalMaps);assert.equal(payload.images.length,count);
assert.equal(new Set(payload.maps.map(m=>m.id)).size,count);
assert.equal(new Set(payload.images.map(m=>m.sha256)).size,count);
assert.equal(payload.maps.filter(m=>m.batch==='A').length,100);
assert.equal(payload.maps.filter(m=>m.batch==='B').length,100);
for(const i of payload.images){
 const original=payload.maps.find(m=>m.id===i.id);assert.ok(original);assert.ok(Math.max(i.width,i.height)<=1024);assert.ok(Math.abs((i.width/i.height)/(original.width/original.height)-1)<2/Math.min(i.width,i.height));for(const key of ['image','thumbnail','full'])assert.ok(i.paths.includes(original[key]));
 const b=Buffer.from(i.data,'base64');
 assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),i.sha256);
}
console.log(`PASS ${count} unique complete WebP payloads and original metadata; no external HTML/CSS/module resources`);
for(const id of ['offline-bootstrap','three-bundled','museum-app',...(find('museum-gallery-config')?['museum-gallery-config']:[])]){
 const source=find(id);assert.ok(source);
 const temp=path.join(root,offlineDir,id+'.verify.js');fs.writeFileSync(temp,source);
 try{execFileSync('node',['--check',temp]);}finally{fs.unlinkSync(temp)}
}
assert.ok(!/\bfetch\s*\(/.test(find('museum-app')));
console.log('PASS every emitted executable script parses; app has no fetch or module import');
const expectedThree=await import('../dist/vendor/three.module.js');
const ctx=vm.createContext({console});vm.runInContext(find('three-bundled'),ctx);
assert.deepEqual(vm.runInContext('Object.keys(THREE).sort()',ctx).join(),Object.keys(expectedThree).sort().join());
assert.equal(vm.runInContext('new THREE.Vector3(1,2,3).lengthSq()',ctx),14);
console.log('PASS bundled Three namespace exactly matches all original named exports; real Vector3 executes');
let removed=false,creates=0;const revoked=[];const handlers={};
const bootstrapCtx=vm.createContext({console,window:{addEventListener:(name,fn)=>handlers[name]=fn},document:{getElementById:id=>{if(id==='storageNotice')return {};assert.equal(id,'museum-offline-data');return {textContent:find('museum-offline-data'),remove(){removed=true}}}},atob:s=>Buffer.from(s,'base64').toString('binary'),Uint8Array,Blob,URL:{createObjectURL:blob=>{assert.equal(blob.type,'image/webp');creates++;return 'blob:test/'+creates},revokeObjectURL:u=>revoked.push(u)}});
vm.runInContext(find('offline-bootstrap'),bootstrapCtx);assert.ok(removed);assert.equal(creates,0);
const assets=bootstrapCtx.window.MUSEUM_ASSETS;
for(const image of payload.images){const urls=image.paths.map(p=>assets[p]);assert.equal(new Set(urls).size,1);}
assert.equal(creates,count);
for(const image of payload.images)image.paths.forEach(p=>assert.ok(assets[p]));assert.equal(creates,count);
assert.equal(bootstrapCtx.window.MUSEUM_MAPS.length,count);
handlers.pagehide({persisted:true});assert.equal(revoked.length,0);handlers.pagehide({persisted:false});assert.equal(revoked.length,count);
console.log('PASS lazy Blob creation, one asset per artwork across all variants, JSON DOM node removed, URL lifecycle');
// PIL fully decodes every packed WebP and checks original pixel dimensions.
execFileSync('python',['-c',`import re,json,base64,io\nfrom PIL import Image\nh=open(${JSON.stringify(path.join(root,offlineDir,'index.html'))}).read()\np=json.loads(re.search(r'<script id="museum-offline-data" type="application/json">(.*?)</script>',h,re.S)[1])\nfor a in p['images']:\n im=Image.open(io.BytesIO(base64.b64decode(a['data']))); im.load(); assert im.size==(a['width'],a['height'])\nprint('PASS all',len(p['images']),'packed WebPs fully decode and match declared pixel dimensions')`],{stdio:'inherit'});
console.log('Static and VM checks passed. These checks do not verify Windows browser rendering or file:// WebGL.');
