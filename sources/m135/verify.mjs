import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {create}=require('./state.js'),ResearchExport=require('./exports.js');
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
data.rows.forEach((r,i)=>r._id=i);
const m=create({rows:data.rows,sources:data.meta.sources,topics:data.meta.topics});
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name)}
const transition=(s,type,args={})=>m.transition(s,{type,...args});
let state=m.initial();
test('unchanged source counts and amount reconciliation',()=>{
 assert.equal(data.rows.length,40716);assert.deepEqual(data.meta.sources.map(s=>s.count),[5633,5809,25100,4174]);
 assert.equal(data.meta.sources[3].known,2986);assert.equal(data.meta.sources[3].amountCount,2735);assert.equal(data.meta.sources[3].amount,120006.18);
 assert.deepEqual([0,1,2,3].map(id=>data.rows.filter(r=>r[0]===id&&r[16].includes(0)).length),[207,401,1011,139]);
});
test('records have unique stable provenance identifiers',()=>{assert.equal(new Set(m.keys).size,40716);for(const r of data.rows)assert.equal(m.record(m.keyFor(r)),r)});
test('default exploration derives all results without storing duplicated counts',()=>{assert.equal(m.results(state.explorer).total,40716);assert.equal(m.results(state.explorer).pages,1629);assert.equal(m.results(state.explorer).pageRows.length,25)});
test('query, source and topic produce the original six Tsinghua records',()=>{
 state=transition(state,'OPEN_EVIDENCE',{filters:{source:1,topic:0,q:'清华大学'}});
 assert.equal(state.view,'explorer');assert.equal(m.results(state.explorer).total,6);
});
test('all filtered rows and original provenance remain in CSV',()=>{
 const csv=ResearchExport.csv(m.results(state.explorer).rows,{sources:data.meta.sources,topics:data.meta.topics});
 assert.equal(csv.trim().split('\r\n').length,7);assert.ok(csv.includes('25AFX006'));assert.ok(csv.includes('源文件'));assert.ok(csv.startsWith('\ufeff'));
});
test('CSV escapes delimiters, quotes, and formula prefixes after whitespace',()=>{
 const r=[...data.rows[0]];r[1]=' \t=1+1,"quoted"';r[10]=null;
 const csv=ResearchExport.csv([r],{sources:data.meta.sources,topics:data.meta.topics});
 assert.ok(csv.includes('"\' \t=1+1,""quoted"""'));assert.ok(!csv.includes('null'));
});
test('query resets pagination; extreme page clamps to final valid page',()=>{
 state=transition(state,'RESET_FILTERS');state=transition(state,'SET_PAGE',{page:999999});assert.equal(state.explorer.page,1629);
 state=transition(state,'FILTER_PROJECTS',{patch:{q:'清华大学'}});assert.equal(state.explorer.page,1);
});
test('changing source clears only incompatible inherited facets',()=>{
 state=transition(state,'OPEN_EVIDENCE',{filters:{source:1,cat:'一般项目',disc:'法学',q:'人工智能'}});
 state=transition(state,'FILTER_PROJECTS',{patch:{source:2}});assert.equal(state.explorer.cat,'');assert.equal(state.explorer.disc,'');assert.equal(state.explorer.q,'人工智能');
});
test('explicit invalid facet is rejected rather than broadening an agent query',()=>{
 const before=state;assert.throws(()=>transition(state,'FILTER_PROJECTS',{patch:{cat:'not-a-category'}}));assert.equal(state,before);
});
test('invalid transitions are rejected without mutating existing state',()=>{
 for(const event of [{type:'NAVIGATE',view:'bad'},{type:'FILTER_PROJECTS',patch:{source:100}},{type:'FILTER_PROJECTS',patch:{topic:'0'}},{type:'FILTER_PROJECTS',patch:{sort:'amount'}},{type:'FILTER_PROJECTS',patch:{q:null}},{type:'FILTER_PROJECTS',patch:{typo:1}},{type:'SET_PAGE',page:0},{type:'OPEN_RECORD',key:'bad'},{type:'BOGUS'}])assert.throws(()=>m.transition(state,event));
 assert.ok(Object.isFrozen(state.explorer));
});
test('empty results are a derived state and cannot start a CSV export',()=>{
 state=transition(state,'FILTER_PROJECTS',{patch:{q:'no-matching-xyz-1234'}});const r=m.results(state.explorer);assert.equal(r.status,'empty');assert.equal(r.page,1);assert.equal(r.pages,1);
 assert.throws(()=>transition(state,'DOWNLOAD_START',{kind:'csv',requestId:1}));
});
test('reset retains view but restores the complete unfiltered corpus',()=>{state=transition(state,'RESET_FILTERS');assert.equal(state.view,'explorer');assert.equal(m.results(state.explorer).total,40716)});
test('URL round trips source, Unicode query, facets, page and project dialog',()=>{
 state=transition(state,'OPEN_EVIDENCE',{filters:{source:1,topic:0,q:'人工智能',cat:'青年项目',sort:'title',page:2}});
 state=transition(state,'OPEN_RECORD',{key:m.keyFor(m.results(state.explorer).pageRows[0])});
 const decoded=m.decode(m.encode(state));assert.deepEqual(decoded.explorer,state.explorer);assert.equal(decoded.dialog,state.dialog);assert.equal(decoded.dialogPhase,'open');
});
test('legacy links and malformed parameters recover to safe bounded defaults',()=>{
 for(const hash of ['#overview','#structure','#themes','#institutions','#explorer','#method'])assert.equal(m.decode(hash).view,hash.slice(1));
 const recovered=m.decode('#explorer?source=99&topic=oops&page=-2&cat=bad&disc=bad&record=missing');
 assert.equal(recovered.explorer.source,-1);assert.equal(recovered.explorer.page,1);assert.equal(recovered.dialog,null);assert.equal(recovered.explorer.cat,'');assert.equal(m.decode('#wrong').view,'overview');
});
test('all durable view choices survive history restoration',()=>{
 state=transition(state,'SET_STRUCTURE',{mode:'natural'});state=transition(state,'SET_THEME',{patch:{topic:2,metric:'count'}});
 state=transition(state,'SET_INSTITUTIONS',{patch:{source:3,topic:1}});state=transition(state,'TOGGLE_CROSS');state=transition(state,'SET_DISCLOSURE',{key:'method:0:0',open:false});
 const copy=m.restore(m.durable(state));assert.deepEqual(m.durable(copy),m.durable(state));
});
test('dialog close request, navigation and stale native close converge',()=>{
 state=transition(state,'CLOSE_RECORD_REQUEST');assert.equal(state.dialogPhase,'closing');assert.ok(state.dialog);
 state=transition(state,'CLOSE_RECORD');assert.equal(state.dialog,null);assert.equal(state.dialogPhase,'closed');
 state=transition(state,'OPEN_RECORD',{key:m.keys[0]});state=transition(state,'NAVIGATE',{view:'overview'});assert.equal(state.dialog,null);
});
test('downloads guard double submission, retain snapshot count, and ignore stale completions',()=>{
 state=transition(state,'OPEN_EVIDENCE',{filters:{source:1,topic:0,q:'清华大学'}});
 state=transition(state,'DOWNLOAD_START',{kind:'csv',requestId:10});assert.equal(state.download.count,6);
 assert.equal(transition(state,'DOWNLOAD_START',{kind:'offline',requestId:11}),state);
 state=transition(state,'FILTER_PROJECTS',{patch:{q:''}});assert.equal(state.download.count,6);
 assert.equal(transition(state,'DOWNLOAD_FAILED',{requestId:9,error:'stale'}),state);
 state=transition(state,'DOWNLOAD_FAILED',{requestId:10,error:'test failure'});assert.equal(state.download.status,'failed');
 state=transition(state,'DOWNLOAD_START',{kind:'csv',requestId:12});state=transition(state,'DOWNLOAD_REQUESTED',{requestId:12});assert.equal(state.download.status,'requested');
});
test('expired notices cannot dismiss a newer message',()=>{
 state=transition(state,'NOTICE',{message:'first'});const id=state.notice.id;state=transition(state,'NOTICE',{message:'second'});
 assert.equal(transition(state,'DISMISS_NOTICE',{id}),state);state=transition(state,'DISMISS_NOTICE',{id:state.notice.id});assert.equal(state.notice.message,'');
});
test('native print lifecycle and disclosure state are explicit',()=>{
 state=transition(state,'PRINT_START');assert.equal(state.print,'printing');state=transition(state,'PRINT_END');assert.equal(state.print,'idle');
 state=transition(state,'SET_DISCLOSURE',{key:'themes:2:0',open:true});assert.equal(state.disclosures['themes:2:0'],true);
});
test('interleaved navigation/filter actions maintain invariants',()=>{
 let s=m.initial();for(let i=0;i<100;i++){
  s=transition(s,'OPEN_EVIDENCE',{filters:{source:i%5-1,topic:i%11-1,page:1}});
  s=transition(s,'SET_PAGE',{page:1+(i*17)%2000});const r=m.results(s.explorer);
  assert.ok(s.explorer.page>=1&&s.explorer.page<=r.pages);assert.ok(r.pageRows.length<=25);
  assert.deepEqual(m.decode(m.encode(s)).explorer,s.explorer);
 }
});
test('all six original report views render with preserved content',()=>{
 const elements=new Map(),element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',disabled:false,style:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){}});return elements.get(key)};
 const ctx={DATA:data,URLSearchParams,document:{querySelector:element,querySelectorAll:()=>[]},console};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('state.js','utf8')+'\n'+fs.readFileSync('app.js','utf8'),ctx);
 for(const page of ['overview','structure','themes','institutions','explorer','method'])assert.ok(vm.runInContext(`${page}()`,ctx).length>500);
 assert.ok(vm.runInContext('naturalStructure()',ctx).includes('2,735'));
});
console.log(`Verified ${passed} regression groups against ${data.rows.length} unchanged records.`);
