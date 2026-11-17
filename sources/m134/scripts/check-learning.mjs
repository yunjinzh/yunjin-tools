import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wr.resolve('miniflare'));
const files=fs.readdirSync('dist/server',{recursive:true}).filter(f=>/\.m?js$/.test(f)).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const mf=new Miniflare({modules:files.map(f=>({type:'ESModule',path:path.resolve('dist/server',f)})),modulesRoot:path.resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'learning-test'},cf:false});
async function request(body,owner='test-user',origin){const r=await mf.dispatchFetch('https://test.local/api/learning',{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(owner?{'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'test@example.test'}:{}),...(origin?{origin}:{})},body:body===undefined?undefined:JSON.stringify(body)});return[r.status,await r.json()]}
try{
const sources=JSON.parse(fs.readFileSync('CONTENT-SOURCES.json','utf8'));assert.equal(sources.items.length,12);assert.equal(new Set(sources.items.map(i=>i.id)).size,12);for(const i of sources.items){assert.ok(i.views>=100000&&i.likes>=1000);assert.equal(new URL(i.sourceUrl).searchParams.get('v'),i.id);assert.ok(i.sourceRef&&i.learningFocus.length)}
const core=JSON.parse(fs.readFileSync('CORE-CONTENT-SOURCES.json','utf8')).items;
assert.deepEqual(core.map(i=>i.id).sort(),sources.items.map(i=>i.id).sort());
for(const item of core){assert.ok(item.gist&&item.basis&&item.evidenceLevel);assert.ok(item.core.length>=3&&item.core.length<=5);assert.ok(item.sources.some(s=>new URL(s.url).hostname==='www.youtube.com'));for(const p of item.core)assert.ok(p.heading&&p.body);}
const db=await mf.getD1Database('DB');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))for(const s of fs.readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(s).run();
let [code,data]=await request(undefined,null);assert.equal(code,200);assert.equal(data.authenticated,false);
const row={id:'kIID5FDi2JQ',favorite:true,status:'学习中',notes:'面积与形状的取舍\n02:10 留待复习',revision:0};
[code]=await request(row,null);assert.equal(code,401);[code]=await request(row,'test-user','https://other.example');assert.equal(code,403);
[code,data]=await request(row);assert.equal(code,200);assert.equal(data.record.revision,1);
[code,data]=await request();assert.equal(data.records[0].notes,row.notes);assert.equal(data.records[0].favorite,true);
[code,data]=await request(undefined,'another-user');assert.equal(data.records.length,0);
[code,data]=await request(row);assert.equal(code,409);assert.equal(data.record.notes,row.notes);assert.equal(data.record.revision,1);assert.equal(data.record.owner,undefined);assert.equal(data.record.key,undefined);
const results=await Promise.all([request({...row,status:'已学完',revision:1}),request({...row,notes:'并发修改',revision:1})]);assert.deepEqual(results.map(r=>r[0]).sort(),[200,409]);const conflict=results.find(r=>r[0]===409)[1];assert.equal(conflict.record.revision,2);assert.equal(conflict.record.id,row.id);assert.equal(conflict.record.owner,undefined);
for(const invalid of [{favorite:'yes'},{status:'完成'},{notes:'x'.repeat(10001)},{id:'invalid'},{revision:-1}]){[code]=await request({...row,...invalid});assert.equal(code,400)}
const catalogRequest=async(body)=>{const response=await mf.dispatchFetch('https://test.local/api/catalog',{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return [response.status,await response.json()]};
let [catalogCode,initialCatalog]=await catalogRequest();assert.equal(catalogCode,200);assert.equal(initialCatalog.lessons.length,12);
const payload={lessons:initialCatalog.lessons,coreContent:initialCatalog.coreContent};
const update={baseRevision:0,requestId:'test_catalog_first',message:'test fixture',payload};
[catalogCode]=await catalogRequest({...update,payload:{...payload,lessons:payload.lessons.map((l,i)=>i?l:{...l,views:999})}});assert.equal(catalogCode,400);
[catalogCode]=await catalogRequest({...update,payload:{...payload,lessons:payload.lessons.slice(1)}});assert.equal(catalogCode,400);
[catalogCode]=await catalogRequest({...update,payload:{...payload,coreContent:{}}});assert.equal(catalogCode,400);
[catalogCode,data]=await catalogRequest(update);assert.equal(catalogCode,200);assert.equal(data.revision,1);
[catalogCode,data]=await catalogRequest(update);assert.equal(catalogCode,200);assert.equal(data.revision,1);
[catalogCode]=await catalogRequest({...update,requestId:'stale_request'});assert.equal(catalogCode,409);
const testId='TESTVIDEO01';const newLesson={...payload.lessons[0],id:testId,title:'TEST FIXTURE',url:'https://www.youtube.com/watch?v='+testId,source:'https://www.youtube.com/watch?v='+testId};
[catalogCode,data]=await catalogRequest({...update,baseRevision:1,requestId:'test_catalog_second',payload:{lessons:[...payload.lessons,newLesson],coreContent:{...payload.coreContent,[testId]:payload.coreContent[payload.lessons[0].id]}}});assert.equal(catalogCode,200);assert.equal(data.lessons.length,13);
[code,data]=await request({...row,id:testId,revision:0});assert.equal(code,200);assert.equal(data.record.id,testId);
console.log('PASS: catalog schema, thresholds, stable IDs, revision guard, idempotent update, and learning records for newly added content.');
console.log('PASS: 12 sources meet both thresholds and each has supported core content; metadata links, auth, origin, cross-user isolation, note roundtrip, revision conflicts and invalid inputs.');
}finally{await mf.dispose()}
