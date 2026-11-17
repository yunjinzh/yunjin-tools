import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const elements=new Map(),handlers=new Map(),tools=new Map(),timers=new Map();let timerId=0,failDownload=false,downloads=0;
const location={hash:'#overview',href:'https://example.test/#overview'};
const document={activeElement:null};
const element=key=>{
 if(!elements.has(key))elements.set(key,{id:key.replace(/^#/,''),dataset:{},innerHTML:'',textContent:'',value:'',disabled:false,open:false,style:{},classList:{toggle(){},contains(){return false}},
 setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},addEventListener(){},focus(){document.activeElement=this},scrollIntoView(){},showModal(){this.open=true},close(){this.open=false},click(){downloads++},remove(){},append(){},getBoundingClientRect(){return {left:0,top:0,right:800,bottom:600}}});return elements.get(key);
};
Object.assign(document,{querySelector:s=>s.startsWith('meta')?null:element(s),querySelectorAll:()=>[],getElementById:id=>element('#'+id),addEventListener(){},createElement:()=>element('generated'),body:element('body'),documentElement:element('html'),modelContext:{registerTool:async t=>{tools.set(t.name,t)}}});
const stack=[{state:null,hash:'#overview'}];let position=0;
const update=url=>{location.hash=String(url).includes('#')?'#'+String(url).split('#')[1]:'';location.href='https://example.test/'+location.hash};
const history={state:null,replaceState(state,_,url){this.state=state;update(url);stack[position]={state,hash:location.hash}},pushState(state,_,url){this.state=state;update(url);stack.splice(position+1);stack.push({state,hash:location.hash});position++},back(){queueMicrotask(()=>{if(position>0){position--;this.state=stack[position].state;update(stack[position].hash);for(const fn of [...handlers.get('popstate')||[]])fn({})}})}};
const window={scrollY:0,scrollTo(){},addEventListener(name,fn){if(!handlers.has(name))handlers.set(name,new Set());handlers.get(name).add(fn)},removeEventListener(name,fn){handlers.get(name)?.delete(fn)},print(){}};
const ctx={DATA:data,document,window,history,location,console,URLSearchParams,Blob,AbortController,matchMedia:()=>({matches:false}),URL:{createObjectURL(){if(failDownload)throw new Error('Simulated Blob failure');return 'blob:test'},revokeObjectURL(){}},setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)}};
vm.createContext(ctx);vm.runInContext(['exports.js','state.js','app.js','controller.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n'),ctx);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(tools.size,6);assert.equal(window.ResearchApp.getState().agentTools.status,'ready');
const call=(name,input={})=>tools.get(name).execute(input);
let result=await call('filter_research_projects',{reset:true,source:1,topic:0,q:'清华大学'});assert.equal(result.ok,true);assert.equal(result.results.total,6);
const before=location.hash,entries=stack.length;
result=await call('filter_research_projects',{source:99});assert.equal(result.ok,false);assert.equal(location.hash,before);assert.equal(stack.length,entries);
result=await call('configure_research_view',{view:'themes',source:3});assert.equal(result.ok,false);assert.equal(location.hash,before);
result=await call('read_research_state');const key=result.results.records[0].key;
result=await call('open_research_record',{key});assert.equal(result.dialog.key,key);assert.equal(element('#detail').open,true);
result=await call('close_research_record');assert.equal(result.dialog,null);assert.equal(element('#detail').open,false);assert.equal(result.results.total,6);assert.equal(location.hash,before);
result=await call('configure_research_view',{view:'themes',metric:'count',topic:2});assert.equal(result.view,'themes');assert.equal(result.themes.metric,'count');assert.equal(result.themes.topic,2);
await call('filter_research_projects',{reset:true,source:1,topic:0,q:'清华大学'});
vm.runInContext("startDownload('csv')",ctx);assert.equal(window.ResearchApp.getState().download.status,'preparing');assert.equal(element('#exportCsv').disabled,true);
// Source changes during preparation must not alter the download's captured rows.
await call('filter_research_projects',{q:''});assert.equal(window.ResearchApp.getState().download.count,6);
const runDownload=()=>{const entry=[...timers.entries()].find(([,t])=>t.ms===30);assert.ok(entry);timers.delete(entry[0]);entry[1].fn()};
runDownload();assert.equal(window.ResearchApp.getState().download.status,'requested');assert.equal(downloads,1);
failDownload=true;vm.runInContext("startDownload('csv')",ctx);runDownload();assert.equal(window.ResearchApp.getState().download.status,'failed');assert.equal(element('#exportCsv').disabled,false);
failDownload=false;vm.runInContext("startDownload('csv')",ctx);runDownload();assert.equal(window.ResearchApp.getState().download.status,'requested');assert.equal(downloads,2);
console.log('PASS agent adapter: six mock registrations, actual shared transitions, atomic invalid-input rejection, dialog completion, snapshot downloads, failure and retry. Mock registry only; native browser discovery is not asserted by this test.');
