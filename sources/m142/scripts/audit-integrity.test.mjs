// Regression tests run actual API handlers against SQLite transactions and an R2 test double.
// They never contact or modify the hosted Site.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const tmp=path.resolve('.sites-runtime/audit-integrity-tests');await mkdir(tmp,{recursive:true});
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE records(id TEXT PRIMARY KEY,data TEXT NOT NULL,revision INTEGER NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE evidence(id TEXT PRIMARY KEY,task_id TEXT NOT NULL,resource_id TEXT NOT NULL,name TEXT NOT NULL,object_key TEXT,url TEXT,size INTEGER NOT NULL,sha256 TEXT,note TEXT NOT NULL,created_at TEXT NOT NULL,actor TEXT NOT NULL);
CREATE TABLE history(id TEXT PRIMARY KEY,record_id TEXT NOT NULL,revision INTEGER NOT NULL,previous TEXT NOT NULL,next TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,created_at TEXT NOT NULL);`);
class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args;}bind(...args){return new Statement(this.sql,args);}async first(){return db.prepare(this.sql).get(...this.args)||null;}async all(){return this.execute();}execute(){const statement=db.prepare(this.sql);if(statement.columns().length){return {results:statement.all(...this.args),meta:{changes:0}};}const r=statement.run(...this.args);return {results:[],meta:{changes:Number(r.changes)}};}}
const bucket=new Map();
globalThis.__AUDIT_ENV={DB:{prepare:sql=>new Statement(sql),async batch(statements){db.exec('BEGIN');try{const out=statements.map(s=>s.execute());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}},BUCKET:{async put(key,bytes,metadata){bucket.set(key,{bytes:new Uint8Array(bytes),metadata});},async get(key){const item=bucket.get(key);return item?{body:item.bytes,size:item.bytes.length,customMetadata:item.metadata.customMetadata}:null;},async delete(key){bucket.delete(key);}}};
const plugin={name:'test-cloudflare-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test-env'}));b.onLoad({filter:/.*/,namespace:'test-env'},()=>({contents:'export const env=globalThis.__AUDIT_ENV;',loader:'js'}));}};
async function compiled(entry,name){const output=path.join(tmp,name+'.mjs');await build({entryPoints:[entry],outfile:output,bundle:true,platform:'node',format:'esm',plugins:[plugin],logLevel:'silent'});return import(pathToFileURL(output).href);}
const model=await compiled('lib/model.ts','model');
const state=await compiled('app/api/state/route.ts','state'),evidence=await compiled('app/api/evidence/route.ts','evidence'),download=await compiled('app/api/download/route.ts','download'),history=await compiled('app/api/history/route.ts','history');
process.env.NODE_ENV='production';
const origin='https://audit.example';
const headers={'oai-authenticated-user-id':'qa-user',origin};
const request=(pathname,options={})=>new Request(origin+pathname,{...options,headers:{...headers,...options.headers}});
const put=(r,extra={})=>state.PUT(request('/api/state',{method:'PUT',headers:{'content-type':'application/json',...extra},body:JSON.stringify(r)}));
let passed=0;
async function check(name,run){await run();passed++;console.log('PASS',name);}
await check('unauthenticated reads fail closed',async()=>{assert.equal((await state.GET(new Request(origin+'/api/state'))).status,401);});
await check('initial state and malformed input',async()=>{let r=await state.GET(request('/api/state'));const body=await r.json();assert.equal(body.records.length,0);assert.equal(body.historyCursor,null);r=await state.PUT(request('/api/state',{method:'PUT',body:'{broken'}));assert.equal(r.status,422);});
await check('server caps streamed input before JSON parsing',async()=>{const r=await state.PUT(request('/api/state',{method:'PUT',body:'x'.repeat(150001)}));assert.equal(r.status,413);});
let uploadRecord;
await check('R2 upload advances record revision and retains file extension',async()=>{const f=new FormData();f.set('taskId','T01');f.set('resourceId','student');f.set('name','任务书核验材料');f.set('note','QA合成文件');f.set('file',new File(['test attachment bytes'],'student-task.docx'));const result=await evidence.POST(request('/api/evidence',{method:'POST',body:f}));assert.equal(result.status,200);const body=await result.json();uploadRecord=body.record;assert.equal(body.previousRevision,0);assert.equal(body.record.revision,1);assert.equal(body.record.resources.student.status,'待核实');assert.equal(body.evidence.sha256.length,64);const got=await download.GET(request('/api/download?id='+body.evidence.id));assert.equal(got.status,200);assert.match(decodeURIComponent(got.headers.get('Content-Disposition')),/任务书核验材料\.docx/);assert.equal(await got.text(),'test attachment bytes');});
await check('stale pre-upload editor cannot overwrite',async()=>{assert.equal((await put(model.defaultReview('T01'))).status,409);});
await check('cross-origin mutation and invalid dates are rejected',async()=>{assert.equal((await put(uploadRecord,{origin:'https://other.example'})).status,403);assert.equal((await put({...uploadRecord,reviewDate:'2026-02-30'})).status,422);});
await check('resource confirmation and immutable confirmed notes',async()=>{let r=structuredClone(uploadRecord);r.resources.student.status='已确认';r.resources.student.reviewer='核验人';let result=await put(r);assert.equal(result.status,200);r=(await result.json()).record;uploadRecord=r;r.resources.student.note='直接改写已确认内容';assert.equal((await put(r)).status,422);});
await check('new attachments cannot silently change a confirmed resource',async()=>{const f=new FormData();f.set('taskId','T01');f.set('resourceId','student');f.set('name','new link');f.set('note','QA');f.set('url','https://example.com/new');const response=await evidence.POST(request('/api/evidence',{method:'POST',body:f}));assert.equal(response.status,422);});
await check('URL credentials and ambiguous file+link uploads are rejected',async()=>{const f=new FormData();f.set('taskId','T02');f.set('resourceId','student');f.set('name','test');f.set('note','QA');f.set('url','https://user:secret@example.com/');assert.equal((await evidence.POST(request('/api/evidence',{method:'POST',body:f}))).status,422);f.set('url','https://example.com/');f.set('file',new File(['x'],'x.txt'));assert.equal((await evidence.POST(request('/api/evidence',{method:'POST',body:f}))).status,422);});
let settings;
await check('school baseline confirmation requires globally archived evidence',async()=>{const candidate={...model.defaultSettings,confirmed:true,owner:'QA学校',basis:'QA审批依据'};assert.equal((await put(candidate)).status,422);const f=new FormData();f.set('taskId','GLOBAL');f.set('resourceId','review');f.set('name','QA school review');f.set('note','QA合成示例');f.set('url','https://example.com/review');const ev=await evidence.POST(request('/api/evidence',{method:'POST',body:f}));assert.equal(ev.status,200);const body=await ev.json();const response=await put({...candidate,revision:body.record.revision});assert.equal(response.status,200);settings=(await response.json()).record;});
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let finalized;
await check('valid finalization and frozen approval state',async()=>{
 let r=model.defaultReview('T03');r.stage='整改复核';r.revision=1;
 for(const [i,res]of model.resources.entries()){r.resources[res.id]={status:'已确认',reviewer:'QA核验',note:'QA人工检查'};db.prepare('INSERT INTO evidence(id,task_id,resource_id,name,size,note,created_at,actor) VALUES(?,?,?,?,?,?,?,?)').run('kit-'+i,'T03',res.id,'QA kit',0,'QA','2026-01-01T00:00:00.000Z','QA');}
 db.prepare('INSERT INTO records VALUES(?,?,?,?)').run('T03',JSON.stringify(r),1,'2026-01-01T00:00:00.000Z');
 Object.assign(r,{status:'已确认',stage:'验收归档',schoolOwner:'QA学校',enterpriseOwner:'QA企业',reviewer:'QA审核人',reviewBasis:'QA正式审核记录',reviewDate:today,conclusion:'全部适用项目经复核通过',currentCoverage:'全部适用资源已归档并逐项复核',missing:'无未关闭事项',versionNote:'QA正式复核'});
 let response=await put(r);assert.equal(response.status,200);finalized=(await response.json()).record;
 response=await put({...finalized,conclusion:'直接变更验收结论'});assert.equal(response.status,422);
 response=await put({...finalized,status:'草案',stage:'草案'});assert.equal(response.status,422);
 response=await put({...settings,confirmed:false});assert.equal(response.status,422);
 response=await put({...settings,basis:'静默替换审核依据'});assert.equal(response.status,422);
});
await check('old invalid approvals are flagged read-only',async()=>{const broken={...model.defaultReview('T04'),status:'已确认',stage:'验收归档',revision:1};db.prepare('INSERT INTO records VALUES(?,?,?,?)').run('T04',JSON.stringify(broken),1,'2026-01-01T00:00:00.000Z');const result=await(await state.GET(request('/api/state'))).json();const row=result.records.find(r=>r.id==='T04');assert.ok(row.integrityWarning);assert.equal(model.effectiveReviewStatus(row),'待核实');assert.equal(model.isReviewConfirmed(row),false);assert.equal(JSON.parse(db.prepare("SELECT data FROM records WHERE id='T04'").get().data).status,'已确认');assert.ok(result.integrityWarnings.some(w=>w.recordId==='T04'));});
await check('reopening is explicit and stale requests remain rejected',async()=>{const r={...finalized,status:'待核实',stage:'整改复核',versionNote:'QA退回复核',reviewer:'QA经办人'};const response=await put(r);assert.equal(response.status,200);assert.equal((await put(r)).status,409);});
await check('history beyond 500 is reachable without gaps or duplicates',async()=>{for(let i=0;i<510;i++)db.prepare('INSERT INTO history VALUES(?,?,?,?,?,?,?,?)').run('pagination-'+String(i).padStart(4,'0'),'T05',i,'{}','{}','QA分页','QA','2026-01-01T00:00:00.000Z');let r=await(await state.GET(request('/api/state'))).json();assert.equal(r.history.length,500);assert.ok(r.historyCursor);const ids=r.history.map(h=>h.id);let next=r.historyCursor;while(next){const page=await(await history.GET(request('/api/history?cursor='+encodeURIComponent(next)+'&limit=7'))).json();ids.push(...page.history.map(h=>h.id));next=page.nextCursor;}assert.equal(ids.length,new Set(ids).size);assert.equal(ids.length,Number(db.prepare('SELECT COUNT(*) AS n FROM history').get().n));assert.equal((await history.GET(request('/api/history?cursor=invalid'))).status,422);});
console.log(`${passed} integrity/API regression scenarios passed.`);
await writeFile(path.join(tmp,'results.json'),JSON.stringify({passed,date:new Date().toISOString()},null,2));db.close();
