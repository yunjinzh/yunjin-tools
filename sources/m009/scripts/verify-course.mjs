import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
let checks=0;
const ok=(x,msg)=>{assert.ok(x,msg);checks++;},eq=(a,b,msg)=>{assert.equal(a,b,msg);checks++;};
class Element{
 constructor(id=''){this.id=id;this.innerHTML='';this.outerHTML='';this.value='';this.textContent='';this.dataset={};this.checked=false;this.open=false;this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
 closest(){return this;}focus(){}scrollIntoView(){}appendChild(){}remove(){}click(){}showModal(){this.open=true;}close(){this.open=false;}
}
const els=new Map(),listeners={},winListeners={},storage=new Map(),spoken=[],timers=[];
const el=id=>{if(!els.has(id))els.set(id,new Element(id));return els.get(id);};
const document={getElementById:el,addEventListener:(k,fn)=>(listeners[k]??=[]).push(fn),body:new Element(),createElement:()=>new Element(),hidden:false};
const env={console,Date,JSON,Math,Map,Set,Blob,Number,String,Object,Array,Error,parseInt,window:null,document,location:{hash:'#/map'},navigator:{mediaDevices:{getUserMedia:async()=>{throw Error('Permission denied');}}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},URL:{createObjectURL:()=> 'blob:mock',revokeObjectURL(){}},setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},setInterval:()=>1,clearInterval(){},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},MediaRecorder:class{},speechSynthesis:{getVoices:()=>[{name:'English',lang:'en-GB',voiceURI:'en-test'},{name:'中文',lang:'zh-CN',voiceURI:'zh-test'}],cancel(){},speak(u){spoken.push(u);u.onstart?.();}},scrollTo(){},print(){},addEventListener:(k,fn)=>(winListeners[k]??=[]).push(fn)};env.window=env;
vm.createContext(env);
for(const file of ['course-data.js','course-core.js','course-app.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),env,{filename:file});
const D=env.COURSE,C=env.CourseCore,state=()=>JSON.parse(storage.get('storysprout:super-minds-4-v2')||JSON.stringify(C.initial()));
function route(hash){env.location.hash=hash;for(const fn of winListeners.hashchange||[])fn();}
async function click(act,data={}){const b=new Element();b.dataset={act,...data};for(const fn of listeners.click||[])await fn({target:b});}
async function change(id,value,data={}){const b=el(id);b.value=value;b.dataset=data;for(const fn of listeners.change||[])await fn({target:b});}
async function input(id,value){const b=el(id);b.value=value;for(const fn of listeners.input||[])await fn({target:b});}
const html=()=>el('app').innerHTML;
eq(D.units.length,10,'starter plus nine units');
eq(D.units.reduce((n,u)=>n+u.vocab.length,0),89,'all core vocabulary items');
eq(D.units.reduce((n,u)=>n+u.grammar.length,0),20,'twenty grammar targets');
eq(D.units.reduce((n,u)=>n+u.questions.length,0),110,'110 authored questions');
eq(D.units.reduce((n,u)=>n+['story','reading','world'].reduce((a,k)=>a+u[k].sentences.length,0),0),267,'267 bilingual reading cards');
eq(C.allQuestions.size,279,'89 vocabulary questions plus 110 base plus 80 review');
for(let p=2;p<=127;p++)ok(fs.statSync(path.join(dist,'pages',String(p).padStart(3,'0')+'.webp')).size>20000,`source page ${p}`);
const ids=new Set();
for(const u of D.units){
 eq(u.grammarPage,118+u.id,'grammar appendix page mapping');
 eq(u.create.tasks.length,3,'three actionable creation tasks');
 for(const area of ['story','reading','world']){
  ok(u[area].sentences.length>=4,`${u.id} ${area} is substantive`);
  eq(u[area].questions.length,2,'two understanding checks per passage');
  for(const s of u[area].sentences){ok(s.en&&s.zh,'bilingual text exists');ok(!ids.has(s.id),'unique reading card');ids.add(s.id);}
  for(const p of u[area].pages)ok(p>=u.start&&p<=u.end,'source pages in the correct unit');
 }
 for(const [key]of C.modules){route(`#/unit/${u.id}/${key}`);ok(html().includes('lesson-main'),`unit ${u.id} module ${key} renders`);ok(!html().includes('undefined'),'no undefined in output');}
}
for(const [id,q]of C.allQuestions){ok(q.options.length>=3&&q.options[q.answer],`answer exists ${id}`);eq(new Set(q.options).size,q.options.length,`unambiguous options ${id}`);ok(q.why.length>=5,`explanation exists ${id}`);}
// Persistence, scoring and honest completion invariants.
let s=C.initial(),u=D.units[3],qid=u.story.questions[0].id,q=C.allQuestions.get(qid);
for(const v of u.story.sentences)s.heard[v.id]=true;
C.answer(s,qid,q.answer);C.answer(s,u.story.questions[1].id,C.allQuestions.get(u.story.questions[1].id).answer);
eq(C.complete(s,u,'story'),false,'listening alone cannot mark self-reading complete');
for(const v of u.story.sentences)s.read[v.id]=true;
eq(C.complete(s,u,'story'),true,'reading and comprehension together complete passage');
const before=C.stats(s).stars;C.answer(s,qid,q.answer);eq(C.stats(s).stars,before,'repeating correct answer cannot farm stars');
C.answer(s,qid,(q.answer+1)%q.options.length);eq(C.stats(s).stars,before-1,'current incorrect answer does not remain mastered');ok(C.stats(s).wrong.includes(qid),'incorrect answer in review');C.answer(s,qid,q.answer);ok(!C.stats(s).wrong.includes(qid),'corrected answer leaves review');
let corrupt=C.initial();corrupt.answers['evil']={choice:0,correct:true};corrupt.answers[qid]={choice:(q.answer+1)%q.options.length,correct:true};corrupt.read.fake=true;corrupt.flags.evil=true;corrupt.drafts['0']='<img src=x onerror=alert(1)>';corrupt.last={unit:99,module:'bad'};corrupt.settings.rate=99;
const cleaned=C.restore(corrupt);eq(cleaned.answers[qid].correct,false,'backup recalculates answer instead of trusting correctness');eq(Object.keys(cleaned.read).length,0,'unknown reading IDs discarded');eq(cleaned.last.unit,0,'invalid navigation normalized');eq(cleaned.settings.rate,.8,'invalid rate normalized');ok(!cleaned.answers.evil,'unknown answers removed');
let full=C.initial();for(const u of D.units){for(const [id,q]of C.allQuestions)C.answer(full,id,q.answer);for(const a of ['story','reading','world'])for(const s of u[a].sentences)full.read[s.id]=true;for(const flag of ['task0','task1','task2','retell','phonics'])full.flags[`u${u.id}-${flag}`]=true;full.drafts[u.id]='I can tell the story in my own words.';}
eq(C.stats(full).missions,80,'all eighty tasks reachable');eq(C.stats(full).units,10,'all badges reachable');eq(C.stats(C.restore(JSON.parse(JSON.stringify(full)))).missions,80,'round trip preserves valid progress');
for(const [key]of C.modules){const sample=C.initial();ok(!C.complete(sample,D.units[0],key),'empty state earns no completion');}
// Core interactions go through the same delegated event handlers as the app.
route('#/unit/0/vocab');let vq=C.allQuestions.get('u0-v0');await click('answer',{id:vq.id,choice:String(vq.answer)});ok(state().answers[vq.id].correct,'click persists answer');await click('saveword',{id:'u0-v0'});ok(state().saved['u0-v0'],'word saved');route('#/bag');ok(html().includes('big wheel'),'collection renders selected word');
route('#/unit/3/reading');await click('reveal',{id:'u3-reading-s0'});ok(html().includes('2004 年 12 月 26 日'),'Chinese meaning opens');await click('sentence',{area:'reading',index:'0'});eq(spoken.at(-1).lang,'en-GB','English speech language');spoken.at(-1).onend();ok(state().heard['u3-reading-s0'],'completed audio saves heard');ok(!state().read['u3-reading-s0'],'audio never auto-saves self-read');await click('read',{id:'u3-reading-s0'});ok(state().read['u3-reading-s0'],'read control saves self-assessment');await click('read',{id:'u3-reading-s0'});ok(!state().read['u3-reading-s0'],'self-read can be undone');
await click('sequence',{area:'reading'});const pending=spoken.at(-1),len=spoken.length;await click('stop');pending.onend();eq(spoken.length,len,'stop prevents stale callback starting next sentence');
await click('speak',{text:'中文解释',lang:'zh-CN'});eq(spoken.at(-1).lang,'zh-CN','Chinese speech language');
await click('word',{word:'tsunami'});ok(el('modal').innerHTML.includes('海啸'),'dictionary meaningful word');await click('word',{word:'someUnknownName'});ok(el('modal').innerHTML.includes('暂未收录'),'no fabricated translations');await click('page',{page:'127'});ok(el('modal').innerHTML.includes('pages/127.webp'),'source reader page mapping');await click('page',{page:'1000'});ok(el('modal').innerHTML.includes('第 127 页'),'source navigation clamps upper boundary');await click('page',{page:'-5'});ok(el('modal').innerHTML.includes('第 2 页'),'source navigation clamps lower boundary');
route('#/unit/0/create');await input('draft','<script>alert(1)</script> I like adventures.');route('#/bag');ok(!html().includes('<script>alert(1)</script>'),'draft HTML safely escaped');ok(html().includes('&lt;script&gt;'),'draft text remains visible');route('#/unit/0/create');await click('record-start');await new Promise(r=>setTimeout(r,0));ok(el('toast').textContent.includes('麦克风权限'),'mic denial has a working fallback');
await change('rate','0.65');eq(state().settings.rate,.65,'rate persists');
const snapshots={};for(const v of ['map','bag','review','parents','final','library']){route('#/'+v);snapshots[v]=html();ok(html().includes('<main id="main"')&&html().includes('<h1>'),`${v} renders a main heading`);}
for(const [key]of C.modules){route(`#/unit/1/${key}`);snapshots[key]=html();}
route('#/unit/9/story');for(const i of [0,1,2,3,4,5])await click('rhyme',{index:String(i)});ok(html().includes('六条线索连起来了'),'clue sequencing completion');
// Source labels and deliberate distinctions remain visible.
route('#/unit/6/reading');ok(html().includes('教师用书 T77 参考范文选读'),'teacher sample accurately labeled');route('#/unit/1/reading');ok(html().includes('cat/index.html'),'original detailed lesson retained');
ok(fs.existsSync(path.join(dist,'cat','source-pages','page-6.jpg')),'old source photos retained');
// Import is reviewable and preserves both old and new progress if one write fails.
const backup={app:'storysprout-super-minds-4',course:full,cat:{draft:'Old cat lesson retained',read:[]}};
el('import').files=[{size:1000,text:async()=>JSON.stringify(backup)}];
await change('import','');await new Promise(r=>setTimeout(r,0));ok(el('modal').innerHTML.includes('替换'),'import requires an explicit replace click');
const storedBefore=storage.get('storysprout:super-minds-4-v2'),oldSet=env.localStorage.setItem;let failOnce=true;
env.localStorage.setItem=(k,v)=>{if(k==='storysprout:egyptian-cat-v1'&&failOnce){failOnce=false;throw Error('quota');}return oldSet(k,v);};
await click('confirm-import');eq(storage.get('storysprout:super-minds-4-v2'),storedBefore,'failed second write rolls back course progress');env.localStorage.setItem=oldSet;
await click('confirm-import');eq(C.stats(state()).missions,80,'confirmed import restores all progress');ok(storage.get('storysprout:egyptian-cat-v1').includes('Old cat lesson retained'),'legacy cat progress restored');
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa','course-rendered-views.json'),JSON.stringify(snapshots));
fs.writeFileSync(path.join(root,'qa','course-verification.json'),JSON.stringify({checks,units:10,modules:80,vocabulary:89,readingCards:267,authoredQuestions:110,sourcePages:126,questionsWithReview:C.allQuestions.size,browserQA:false,audioHardwareQA:false},null,2));
console.log(`PASS: ${checks} content/state/render/interaction assertions. Browser layout, real voices and microphone remain untested.`);
