import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare, createFetchMock } = await import(wranglerRequire.resolve('miniflare'));
const moduleFiles = fs.readdirSync('dist/server',{recursive:true}).filter(f => /\.m?js$/.test(f)).sort((a,b) => a === 'index.js' ? -1 : b === 'index.js' ? 1 : 0);
const fetchMock = createFetchMock();
fetchMock.disableNetConnect();
const mf = new Miniflare({modules:moduleFiles.map(f => ({type:'ESModule',path:path.resolve('dist/server',f)})),modulesRoot:path.resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'research-test'},cf:false,fetchMock});
const headers = {'content-type':'application/json','oai-authenticated-user-id':'test-research','oai-authenticated-user-email':'test@example.test'};
const clone = value => JSON.parse(JSON.stringify(value));
async function req(route,body,options={}) {
  const {identity=true,extraHeaders={},raw=false,method} = options;
  const response = await mf.dispatchFetch('https://test.local'+route,{
    method:method || (body !== undefined ? 'POST' : 'GET'),
    headers:{...(identity ? headers : {'content-type':'application/json'}),...extraHeaders},
    body:body !== undefined ? raw ? body : JSON.stringify(body) : undefined,
  });
  return [response.status,await response.json()];
}
async function invalid(data,kind='video',expected=400) {
  const [status,result] = await req('/api/state',{kind,data});
  assert.equal(status,expected,JSON.stringify({kind,id:data.id,submitted:data,response:result}));
  assert.equal(typeof result.error,'string');
}
try {
  const db = await mf.getD1Database('DB');
  for (const file of fs.readdirSync('drizzle').filter(x => x.endsWith('.sql')).sort()) {
    for (const statement of fs.readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint').filter(x => x.trim())) await db.prepare(statement).run();
  }
  let [status,state] = await req('/api/state');
  assert.equal(status,200); assert.equal(state.videos.length,10); assert.equal(state.authenticated,true);
  const video = {...state.videos[0],favorite:true};
  let [s,saved] = await req('/api/state',{kind:'video',data:video});
  assert.equal(s,200,JSON.stringify(saved)); assert.equal(saved.revision,1);
  [s,state] = await req('/api/state');
  const storedVideo = state.videos.find(x => x.id === video.id);
  assert.equal(storedVideo.favorite,true); assert.equal(storedVideo.revision,1);
  [s] = await req('/api/state',{kind:'video',data:video}); assert.equal(s,409);
  [s] = await req('/api/state',{kind:'video',data:video},{identity:false}); assert.equal(s,401);
  [s,state] = await req('/api/state',undefined,{identity:false});
  assert.equal(state.authenticated,false); assert.equal(state.experiments.length,0); assert.equal(state.videos[0].favorite,false);
  [s,state] = await req('/api/state',undefined,{extraHeaders:{'oai-authenticated-user-id':'another-user'}});
  assert.equal(state.videos[0].favorite,false);

  // A v1 saved seed must inherit only its newly introduced classification.
  const legacyVendor = clone(state.videos.find(v => v.provenance === 'vendor'));
  assert.ok(legacyVendor,'Expected a vendor seed for the migration regression');
  delete legacyVendor.provenance;
  legacyVendor.notes = '保留用户已保存笔记';
  [s,saved] = await req('/api/state',{kind:'video',data:legacyVendor}); assert.equal(s,200);
  [s,state] = await req('/api/state');
  let restoredVendor = state.videos.find(v => v.id === legacyVendor.id);
  assert.equal(restoredVendor.provenance,'vendor');
  assert.equal(restoredVendor.notes,'保留用户已保存笔记');
  [s] = await req('/api/state',{kind:'video',data:{...restoredVendor,provenance:'education'}}); assert.equal(s,200);
  [s,state] = await req('/api/state');
  restoredVendor = state.videos.find(v => v.id === legacyVendor.id);
  assert.equal(restoredVendor.provenance,'education','Do not overwrite a valid user classification');
  await invalid({...restoredVendor,provenance:'advertisement'});
  [s] = await req('/api/state',{kind:'video',data:{...restoredVendor,provenance:'unknown'}}); assert.equal(s,200);

  for (const update of [{views:-1},{views:1.25},{views:'123'},{views:123,metricsSource:''},{metricsChecked:'2026-02-30'},{sources:[{label:'Invalid',url:'javascript:alert(1)'}]},{analysis:{...video.analysis,verified:true,evidence:''}},{favorite:'yes'},{url:'https://www.youtube.com/watch?v=ABCDEFGHIJK'},{revision:-1}]) await invalid({...video,...update});
  const exp = {id:'integration-test',title:'本地隔离验证',hypothesis:'保存与重读一致',status:'已复盘',sourceIds:[video.id],date:'2026-11-09',url:'',views:'100',ctr:'4',retention:'35',result:'测试'};
  for (const update of [{ctr:'101'},{retention:'-1'},{views:'1.5'},{date:'2026-02-30'},{sourceIds:['invalid-id']},{hypothesis:''},{result:''},{status:'完成'},{url:'file:///tmp/file'}]) await invalid({...exp,...update},'experiment');
  // A syntactically valid ID is not necessarily a case in this user's library.
  await invalid({...exp,sourceIds:['ABCDEFGHIJK']},'experiment');
  const customVideo = {...video,id:'ABCDEFGHIJK',url:'https://www.youtube.com/watch?v=ABCDEFGHIJK',title:'隔离测试自定义案例'};
  delete customVideo.revision;
  [s] = await req('/api/state',{kind:'video',data:customVideo}); assert.equal(s,200);
  const customExperiment = {...exp,id:'custom-reference-test',sourceIds:[customVideo.id]};
  [s,saved] = await req('/api/state',{kind:'experiment',data:customExperiment}); assert.equal(s,200,JSON.stringify(saved));
  [s,saved] = await req('/api/state',{kind:'experiment',data:customExperiment},{extraHeaders:{'oai-authenticated-user-id':'another-user'}});
  assert.equal(s,400,JSON.stringify(saved)); assert.match(saved.error,/当前研究库/);
  await db.prepare('DELETE FROM research_records WHERE key = ?').bind('test-research:experiment:custom-reference-test').run();
  await db.prepare('DELETE FROM research_records WHERE key = ?').bind('test-research:video:ABCDEFGHIJK').run();
  [s,saved] = await req('/api/state',{kind:'experiment',data:exp}); assert.equal(s,200,JSON.stringify(saved));
  [s,state] = await req('/api/state'); assert.equal(state.experiments.length,1); assert.equal(state.experiments[0].result,'测试');

  const concurrent = {...exp,id:'first-insert-race',status:'待测试',result:''};
  const inserts = await Promise.all([req('/api/state',{kind:'experiment',data:concurrent}),req('/api/state',{kind:'experiment',data:concurrent})]);
  assert.deepEqual(inserts.map(r => r[0]).sort(),[200,409]);
  const updates = await Promise.all([req('/api/state',{kind:'experiment',data:{...concurrent,revision:1,title:'修改 A'}}),req('/api/state',{kind:'experiment',data:{...concurrent,revision:1,title:'修改 B'}})]);
  assert.deepEqual(updates.map(r => r[0]).sort(),[200,409]);
  [s] = await req('/api/state','{broken-json',{raw:true}); assert.equal(s,400);
  [s] = await req('/api/state',{kind:'video',data:video},{extraHeaders:{origin:'https://other.example'}}); assert.equal(s,403);
  [s] = await req('/api/state','x'.repeat(65001),{raw:true}); assert.equal(s,413);

  await db.prepare('INSERT INTO research_records (key,owner,kind,payload,updated,revision) VALUES (?,?,?,?,?,?)').bind('test-research:video:broken','test-research','video','{invalid','2026-11-09',1).run();
  [s,state] = await req('/api/state');
  assert.equal(s,200); assert.equal(state.videos.length,10); assert.equal(state.warnings.length,1); assert.match(state.warnings[0],/原始数据仍保留/);
  assert.equal(state.experiments.length,2);

  [s,state] = await req('/api/video',{id:video.id,action:'refresh'}); assert.equal(s,409); assert.match(state.error,/API/);
  [s] = await req('/api/video',{id:video.id,action:'anything'}); assert.equal(s,400);
  [s] = await req('/api/video','{invalid',{raw:true}); assert.equal(s,400);
  [s] = await req('/api/video',{id:video.id,action:'import'},{identity:false}); assert.equal(s,401);
  [s] = await req('/api/video',{id:video.id,action:'import'},{extraHeaders:{origin:'https://other.example'}}); assert.equal(s,403);
  const upstream = fetchMock.get('https://www.youtube.com');
  const endpoint = {path:/^\/oembed\?/,method:'GET'};
  upstream.intercept(endpoint).reply(200,{title:'Original title',author_name:'Original channel',author_url:'https://www.youtube.com/@original'},{headers:{'content-type':'application/json'}});
  [s,state] = await req('/api/video',{id:video.id,action:'import'}); assert.equal(s,200); assert.equal(state.title,'Original title');
  upstream.intercept(endpoint).reply(404,'Not found');
  [s,state] = await req('/api/video',{id:video.id,action:'import'}); assert.equal(s,404); assert.match(state.error,/视频不可用/);
  upstream.intercept(endpoint).reply(200,'not-json');
  [s,state] = await req('/api/video',{id:video.id,action:'import'}); assert.equal(s,502); assert.match(state.error,/无法读取的数据/);
  upstream.intercept(endpoint).reply(429,'Too many requests');
  [s] = await req('/api/video',{id:video.id,action:'import'}); assert.equal(s,429);
  upstream.intercept(endpoint).replyWithError(new Error('network unavailable'));
  // Miniflare may bridge the mocked transport error as an HTTP failure.
  // Both paths must return a failure and a usable manual-entry recovery action.
  [s,state] = await req('/api/video',{id:video.id,action:'import'}); assert.equal(s,502); assert.match(state.error,/手动建档/);
  console.log('PASS: complete saves, legacy source-classification fallback, strict validation, cross-user isolation, concurrent creation/update conflicts, damaged-row recovery, source/origin checks, malformed input, missing API key, and mocked upstream success/error handling.');
} finally { await mf.dispose(); }
