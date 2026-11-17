import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
const temp=await fs.mkdtemp(path.resolve('.sites-runtime/project-api-'));
const database=new DatabaseSync(':memory:');
try{
 database.exec('PRAGMA foreign_keys = ON');database.exec(await fs.readFile('drizzle/0000_neat_miracleman.sql','utf8'));
 const sql={prepare(query){const statement=database.prepare(query);let values=[];return{bind(...v){values=v;return this;},async first(){return statement.get(...values)||null;},async all(){return{results:statement.all(...values)};},run(){const r=statement.run(...values);return{meta:{changes:Number(r.changes)}};}};},async batch(items){database.exec('BEGIN');try{const r=items.map(i=>i.run());database.exec('COMMIT');return r;}catch(e){database.exec('ROLLBACK');throw e;}}};
 const objects=new Map();let failPut=false;const bucket={async put(key,value){if(failPut)throw Error('simulated storage outage');objects.set(key,value);},async get(key){return objects.has(key)?{body:objects.get(key)}:null;},async delete(key){objects.delete(key);}};
 globalThis.__projectBindings={DB:sql,BUCKET:bucket};globalThis.__projectUser={userId:'owner-a',email:'owner-a@example.test'};
 const sources={helper:'lib/server/projects.ts',list:'app/api/projects/route.ts',item:'app/api/projects/[id]/route.ts',versions:'app/api/projects/[id]/versions/route.ts'};
 for(const [name,file]of Object.entries(sources)){let source=await fs.readFile(file,'utf8');source=source.replace("import {env} from 'cloudflare:workers';","const env=globalThis.__projectBindings;").replace("import {getChatGPTUser} from '@/app/chatgpt-auth';","const getChatGPTUser=async()=>globalThis.__projectUser;").replaceAll("'@/lib/server/projects'","'./helper.js'");await fs.writeFile(path.join(temp,name+'.js'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);}
 const route=await import(pathToFileURL(path.join(temp,'item.js'))),list=await import(pathToFileURL(path.join(temp,'list.js'))),versions=await import(pathToFileURL(path.join(temp,'versions.js')));
 const id=crypto.randomUUID(),context={params:Promise.resolve({id})},url='https://workspace.test/api/projects/'+id;
 const payload=()=>new Uint8Array([31,139,1,2,3,4]);
 const put=(revision=0)=>route.PUT(new Request(url,{method:'PUT',headers:{'X-Project-Revision':String(revision),'X-Project-Name':encodeURIComponent('测试项目'),'X-Model-Name':encodeURIComponent('离心泵'),'Sec-Fetch-Site':'same-origin'},body:payload()}),context);
 let response=await put();assert.equal(response.status,200);assert.equal((await response.json()).revision,1);assert.equal(objects.size,1);
 response=await route.GET(new Request(url),context);assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),payload());
 assert.equal((await (await list.GET()).json()).projects.length,1);
 response=await put(0);assert.equal(response.status,409);assert.equal(objects.size,1,'Conflict must not create an orphan object');
 response=await put(1);assert.equal(response.status,200);assert.equal((await response.json()).revision,2);
 response=await versions.GET(new Request(url+'/versions'),context);assert.equal((await response.json()).versions.length,2);
 response=await route.GET(new Request(url+'?revision=1'),context);assert.equal(response.headers.get('X-Project-Revision'),'1');
 globalThis.__projectUser={userId:'owner-b',email:'owner-b@example.test'};assert.equal((await (await list.GET()).json()).projects.length,0);assert.equal((await route.GET(new Request(url),context)).status,404);assert.equal((await put(2)).status,404);assert.equal((await versions.GET(new Request(url+'/versions'),context)).status,404);
 globalThis.__projectUser=null;assert.equal((await list.GET()).status,401);assert.equal((await put(2)).status,401);
 globalThis.__projectUser={userId:'owner-a',email:'owner-a@example.test'};
 const concurrent=await Promise.all([put(2),put(2)]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);assert.equal(objects.size,3,'Losing write cleans its staged object');
 const originalBatch=sql.batch;sql.batch=async items=>{await originalBatch(items);throw Error('simulated acknowledgement loss after commit');};let oldError=console.error;console.error=()=>{};try{response=await put(3);}finally{console.error=oldError;sql.batch=originalBatch;}assert.equal(response.status,503);assert.equal(objects.size,4,'Unknown commit outcome must preserve any referenced blob');assert.equal((await route.GET(new Request(url),context)).status,200);
 failPut=true;oldError=console.error;console.error=()=>{};try{response=await put(4);}finally{console.error=oldError;}assert.equal(response.status,503);assert.equal((await (await list.GET()).json()).projects[0].revision,4,'Storage outage cannot advance a project revision');
 const cross=await route.PUT(new Request(url,{method:'PUT',headers:{'Sec-Fetch-Site':'cross-site'},body:payload()}),context);assert.equal(cross.status,403);
 console.log('PASS: schema migration; authenticated owner isolation; binary round trip; version history; optimistic conflicts and simultaneous saves; orphan cleanup; recoverable storage outage; cross-site write rejection.');
}finally{database.close();delete globalThis.__projectBindings;delete globalThis.__projectUser;await fs.rm(temp,{recursive:true,force:true});}
