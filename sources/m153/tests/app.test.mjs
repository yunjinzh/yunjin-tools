// Exercise the real UI event handlers with deterministic storage, transport and media adapters.
// The media implementation itself is covered by the service test using a real video.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

function element(){
  return {dataset:{},style:{},hidden:false,paused:true,disabled:false,value:'',checked:false,
    childElementCount:0,classList:{toggle(){}},addEventListener(){},setAttribute(){},removeAttribute(k){delete this[k];},
    getAttribute(k){return this[k];},querySelector(){return element();},querySelectorAll(){return [];},
    replaceChildren(){this.childElementCount=0;},append(){this.childElementCount++;},
    getContext(){return {drawImage(){}};},load(){},pause(){this.paused=true;},close(){},showModal(){}};
}
function storage(records){
  return {open(){
    const db={transaction(){
      let pending=0;const tx={objectStore:()=>({
        get(key){const req={};pending++;queueMicrotask(()=>{req.result=records.get(key);req.onsuccess?.();if(!--pending)tx.oncomplete?.();});return req;},
        put(v,k){records.set(k,structuredClone(v));},delete(k){records.delete(k);}
      })};return tx;
    }};
    const req={result:db};queueMicrotask(()=>req.onsuccess());return req;
  }};
}
const until=async f=>{for(let i=0;i<200;i++){if(f())return;await new Promise(r=>setTimeout(r,1));}throw Error('Expected state not reached');};
test('UI events restore drafts, survive stale startup, and reconnect without issuing retry',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'motion-ui-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const source=await readFile(new URL('../dist/app.mjs',import.meta.url),'utf8');
  await writeFile(join(dir,'app.mjs'),source);
  await writeFile(join(dir,'workflow.mjs'),await readFile(new URL('../dist/workflow.mjs',import.meta.url)));
  await writeFile(join(dir,'figure.mjs'),"export const makeStage=()=>({draw(){},dispose(){}}),study=()=>[],backgrounds={};");
  await writeFile(join(dir,'engine.mjs'),"export const inspect=(...a)=>globalThis.mediaTest.inspect(...a),extract=(...a)=>globalThis.mediaTest.extract(...a),encode=(...a)=>globalThis.mediaTest.encode(...a),warnings=()=>[],findFrame=()=>0,sleep=()=>new Promise(r=>setTimeout(r,1));");
  const original={};for(const k of ['document','indexedDB','cancelAnimationFrame','fetch','mediaTest'])original[k]=Object.getOwnPropertyDescriptor(globalThis,k);
  t.after(()=>{for(const [k,v] of Object.entries(original)){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
  const settings={bg:'sage',size:720,audio:true};const sourceFile=new File(['source'],'old.mp4');
  const previous={job:{file:sourceFile,name:'old.mp4'},motion:{complete:true,frames:[]},settings,result:{out:new Blob(['encoded']),settings}};
  const metadata=()=>({duration:3.44,w:480,h:360,input:{dispose(){}}});
  let seq=0;
  async function boot(initial,options={}){
    const elements=new Map(),by=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
    const records=new Map(Object.entries(initial)),registered=new Map();
    by('bg').value='sage';by('size').value='720';by('audio').checked=true;
    globalThis.document={getElementById:by,modelContext:{registerTool(t){registered.set(t.name,t);}},createElement:element};
    globalThis.indexedDB=storage(records);globalThis.cancelAnimationFrame=()=>{};
    globalThis.mediaTest={inspect:async()=>metadata(),extract:async(_m,_f,s)=>{s.complete=true;},encode:async()=>new Blob(['mp4']),...options.media};
    globalThis.fetch=async(url,opts)=>url.includes('server-mode')?{ok:true,json:async()=>({background:!!options.remote})}:options.remote(url,opts);
    await import(pathToFileURL(join(dir,'app.mjs')).href+'?case='+seq++);
    return {by,records,phase:()=>by('workspace').dataset.phase,read:()=>registered.get('get_motion_state').execute()};
  }
  await t.test('dirty export survives reload; restoring settings reuses the same download',async()=>{
    const ui=await boot({...previous,settings:{...settings,audio:false}});
    await until(()=>ui.phase()==='changed');const link=ui.by('download').href;
    assert.equal(ui.by('download').hidden,true);assert.equal(ui.read().actions.includes('export'),true);
    ui.by('audio').checked=true;ui.by('audio').onchange();assert.equal(ui.phase(),'ready');assert.equal(ui.by('download').href,link);
  });
  await t.test('explicit pause survives even when a previous export is available',async()=>{
    const ui=await boot({...previous,paused:true});await until(()=>ui.phase()==='pause');assert.equal(ui.by('retry').dataset.action,'resume');
  });
  await t.test('a delayed restore cannot publish the old file over a newer import',async()=>{
    let deliver;const slow=new Promise(ok=>{deliver=ok;});
    const ui=await boot(previous,{media:{inspect:async file=>file.name==='old.mp4'?slow:metadata()}});
    await until(()=>ui.by('jobname').textContent==='old.mp4');
    ui.by('file').onchange({target:{files:[new File(['new'],'new.mp4')],value:''}});
    await until(()=>ui.phase()==='ready');const fresh=ui.by('download').href;
    let closed=false;deliver({...metadata(),input:{dispose(){closed=true;}}});await until(()=>closed);
    assert.equal(ui.by('download').href,fresh);assert.equal(ui.by('download').download,'new-白模.mp4');
  });
  await t.test('network recovery observes the existing remote task',async()=>{
    let offline=true;const calls=[];
    const ui=await boot({...previous,remote:'existing'},{remote:async(url,opts)=>{
      calls.push([url,opts?.method||'GET']);if(offline)throw Error('offline');
      return {ok:true,json:async()=>({state:'ready',duration:3.44,bytes:55,settings,issues:[]})};
    }});
    await until(()=>ui.phase()==='disconnected');assert.equal(ui.by('retry').dataset.action,'reconnect');
    offline=false;ui.by('retry').onclick();await until(()=>ui.phase()==='ready');
    assert.ok(calls.every(([url,method])=>url.endsWith('/existing/status')&&method==='GET'));
  });
});
