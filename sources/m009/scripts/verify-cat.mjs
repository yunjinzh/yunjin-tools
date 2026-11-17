import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const files=['lesson.js','core.js','app.js'];
const listeners={},elements=new Map(),storage=new Map(),timeouts=new Map(),spoken=[];
let assertionCount=0,nextTimer=1,queue=[];
class Element{
 constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.dataset={};this.value='';this.open=false;this.disabled=false;this.checked=false;this.isConnected=true;this.handlers={};this.classList={add(){},remove(){},contains(){return false;}};}
 addEventListener(name,fn){this.handlers[name]=fn;}
 showModal(){this.open=true;}
 close(){this.open=false;}
 focus(){}
 appendChild(){}
 remove(){}
 click(){this.handlers.click?.({target:this});}
 matches(){return false;}
 closest(){return this;}
 getBoundingClientRect(){return {left:0,right:900,top:0,bottom:900};}
}
const el=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
const document={getElementById:el,addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),querySelectorAll:()=>[],querySelector:s=>el(s),activeElement:new Element(),hidden:false,body:new Element()};
const synthesis={getVoices:()=>[{name:'Test English',lang:'en-GB',voiceURI:'test-en'},{name:'Test Chinese',lang:'zh-CN',voiceURI:'test-zh'}],addEventListener(){},cancel(){queue=[];},speak(u){queue.push(u);spoken.push(u);u.onstart?.();}};
const sandbox={window:null,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},navigator:{clipboard:{writeText:async()=>{}}},console,Date,Math,JSON,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},setTimeout:(fn)=>{const id=nextTimer++;timeouts.set(id,fn);return id;},clearTimeout:id=>timeouts.delete(id),setInterval:()=>1};
sandbox.window=sandbox;sandbox.location={protocol:'https:'};sandbox.speechSynthesis=synthesis;sandbox.addEventListener=()=>{};sandbox.scrollTo=()=>{};sandbox.print=()=>{};
vm.createContext(sandbox);for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,'dist/cat',f),'utf8'),sandbox,{filename:f});
const L=sandbox.LESSON,C=sandbox.LearningCore;
function ok(value,msg){assert.ok(value,msg);assertionCount++;}
function eq(a,b,msg){assert.equal(a,b,msg);assertionCount++;}
const html=()=>el('app').innerHTML;
const progress=()=>JSON.parse(storage.get('storysprout:'+L.id)||JSON.stringify(C.initial()));
async function click(action,data={}){const target=new Element();target.dataset={action,...data};const event={target,preventDefault(){}};for(const fn of listeners.click||[])await fn(event);}
async function input(id,value,data={}){const target=el(id);target.value=value;target.dataset=data;for(const fn of listeners.input||[])await fn({target});}
async function change(id,value,data={}){const target=el(id);target.value=value;target.dataset=data;for(const fn of listeners.change||[])await fn({target});}

eq(L.chapters.length,8,'eight chapters');
eq(L.chapters.reduce((n,c)=>n+c.sentences.length,0),43,'43 short reading units');
for(const [c,ch]of L.chapters.entries()){
 ok(ch.sentences.length>0,`chapter ${c} has content`);
 for(const s of ch.sentences){eq(s.parts.join(' '),s.en,'phrase chunks reconstruct exact source line');ok(s.zh&&s.note,'translation and note present');}
 const q=ch.quiz;ok(q.options[q.answer],'valid checkpoint answer');ok(ch.sentences[q.sentence].en.includes(q.evidence),'checkpoint evidence is actual source substring');
}
for(const q of L.extraQuestions){ok(q.options[q.answer],'extra answer index valid');ok(L.chapters[q.chapter].sentences[q.sentence].en.includes(q.evidence),'extra evidence belongs to source');}
for(const b of L.builders)eq(b.parts.join(' '),L.chapters[b.chapter].sentences[b.sentence].en,'puzzle uses exact original sentence');
eq(new Set(L.vocabulary.map(v=>v[0])).size,L.vocabulary.length,'no duplicate vocabulary');
ok(html().includes('金猫去哪儿了？'),'initial hero renders');
ok(html().includes(L.chapters[0].sentences[0].en.split(' ')[0]),'initial sentence renders');

await click('listen');eq(spoken.at(-1).text,L.chapters[0].sentences[0].en,'English sent to synthesis');
queue.shift().onend();eq(progress().heard.length,1,'listening marked only at completion');
eq(progress().read.length,0,'listening does not auto-mark reading');
await click('chapter',{chapter:'1'});await click('listen');await click('stop-speech');eq(progress().heard.length,1,'cancelled speech not counted');
await click('translation');ok(html().includes(L.chapters[1].sentences[0].zh),'translation toggle works');
await click('phrases');ok(html().includes('class="phrase"'),'phrase rendering');
await click('phrases');
await click('word',{word:'museum'});ok(el('modal').innerHTML.includes('博物馆'),'curated dictionary');
await click('modal-save-word',{word:'museum'});ok(progress().saved.includes('museum'),'word saved');
await click('close-modal');eq(el('modal').open,false,'dialog closes');

for(let c=0;c<8;c++){
 await click('chapter',{chapter:String(c)});
 for(let s=0;s<L.chapters[c].sentences.length;s++)await click('mark-read');
 ok(html().includes(L.chapters[c].quiz.q),'chapter question renders');
 if(c===0){await click('checkpoint-answer',{index:'1'});eq(C.stats(progress(),L).stars,0,'wrong answer earns no star');}
 await click('checkpoint-answer',{index:String(L.chapters[c].quiz.answer)});
 eq(C.stats(progress(),L).stars,c+1,'star requires completed chapter');
}
eq(progress().read.length,43,'complete story retained');
await click('checkpoint-answer',{index:'1'});eq(C.stats(progress(),L).stars,8,'no duplicate stars');

await click('nav',{view:'words'});ok(html().includes('词语探索'),'words renders');
await input('vocab-search','museum');ok(el('word-list').innerHTML.includes('museum'),'vocab search finds word');
ok(!el('word-list').innerHTML.includes('eighteen-year-old'),'search filters results');
await input('vocab-search','');await click('learn-word',{word:'museum'});ok(progress().words.includes('museum'),'self assessed vocabulary records');
await click('word-filter',{filter:'learned'});ok(html().includes('museum'),'learned filter renders');
await click('word-mode',{mode:'match'});ok(html().includes('WORD MATCH'),'matching view renders');
await click('match-left',{index:'0'});await click('match-right',{index:'1'});eq(progress().match.length,0,'wrong match not recorded');
for(let i=0;i<5;i++){await click('match-left',{index:String(i)});await click('match-right',{index:String(i)});}
eq(progress().match.length,5,'five unique matched words recorded');

await click('nav',{view:'challenge'});const qs=[...L.chapters.map(c=>c.quiz),...L.extraQuestions];
await click('quiz-answer',{index:'1'});eq(progress().quiz.q0.correct,false,'wrong quiz attempt recorded');
await click('quiz-hint');ok(html().includes(qs[0].evidence),'hint shows actual evidence');
await click('quiz-answer',{index:'0'});eq(progress().quiz.q0.firstCorrect,false,'retry not classified first-time correct');
for(let i=1;i<qs.length;i++){await click('next-question');await click('quiz-answer',{index:String(qs[i].answer)});}
eq(C.stats(progress(),L).quizCorrect,14,'all comprehension answers recorded');
eq(C.stats(progress(),L).firstCorrect,13,'first-attempt count truthful');
await click('next-question');ok(html().includes('你走完了这一轮故事挑战'),'end state renders');
await click('challenge-tab',{tab:'order'});for(let i=5;i>=0;i--)await click('order-add',{index:String(i)});await click('order-check');eq(progress().ordered,false,'wrong chronology not rewarded');
await click('order-reset');for(let i=0;i<6;i++)await click('order-add',{index:String(i)});await click('order-check');eq(progress().ordered,true,'correct chronology rewarded');
await click('challenge-tab',{tab:'build'});for(let b=0;b<4;b++){for(let i=0;i<L.builders[b].parts.length;i++)await click('builder-add',{index:String(i)});await click('builder-check');if(b<3)await click('builder-next');}
eq(progress().builders.length,4,'all sentence puzzles can be completed');

await click('nav',{view:'retell'});ok(html().includes('不会自动上传'),'recording privacy described');
await input('retell-draft','Mr Benson loved his museum.');eq(progress().draft,'Mr Benson loved his museum.','retelling draft persists');
await click('retell-hints');ok(html().includes('试着自己说一说'),'retelling hints can be hidden');
await click('record-start');ok(el('toast').textContent.includes('不支持录音'),'no recording support handled');

await click('nav',{view:'extension'});ok(html().includes('2,700'),'original textbook number retained');ok(html().includes('1336'),'historical correction included');
await click('museum-match',{index:'0',value:'B'});ok(html().includes('归类正确'),'museum classification works');
await click('extension-tab',{tab:'role'});await click('role-select',{role:'cat'});ok(html().includes('轮到你回答'),'role switching works');
await click('role-next');ok(html().includes('Is Mr Benson nice?'),'role conversation advances');
await click('extension-tab',{tab:'advert'});await input('ad-name','<img src=x onerror=alert(1)>',{ad:'name'});ok(el('ad-preview').innerHTML.includes('&lt;img'),'ad user text escaped');ok(!el('ad-preview').innerHTML.includes('<img'),'ad cannot inject elements');
await click('extension-tab',{tab:'capsule'});for(const v of ['a mobile phone','a games console','a rucksack','a digital camera','a book'])await click('capsule',{value:v});eq(progress().capsule.length,4,'time capsule limited to four items');
await click('settings');ok(el('modal').innerHTML.includes('Test English'),'device voices listed');await change('setting-rate','.65');eq(progress().settings.rate,.65,'voice speed saved');await click('close-modal');
await click('source');ok(el('modal').innerHTML.includes('完整故事文本'),'source text available');for(let i=0;i<6;i++){await click('source-page',{index:String(i)});ok(el('modal').innerHTML.includes(`source-pages/page-${i+1}.jpg`),'all source photos addressable');}await click('close-modal');
await click('report');ok(el('modal').innerHTML.includes('43/43'),'report shows actual completed units');ok(el('modal').innerHTML.includes('首次正确：13 / 14'),'report first-attempt metric');await click('close-modal');
const malformed={read:['0:0','0:0','999:999'],heard:null,chapter:99,checkpoints:[0,99],quiz:{evil:{},q0:{correct:true,firstCorrect:false,attempts:3}},settings:{rate:500},draft:'<script>bad</script>'};const cleaned=C.clean(malformed,L);eq(cleaned.read.length,1,'invalid and duplicate progress ignored');eq(cleaned.chapter,0,'invalid chapter clamped');eq(cleaned.settings.rate,.8,'invalid rate rejected');eq(C.stats(cleaned,L).stars,0,'restored progress cannot bypass star gate');
const reloaded=C.clean(progress(),L);eq(C.stats(reloaded,L).stars,8,'serialized state reloads correctly');
const snapshots={};for(const v of ['read','words','challenge','retell','extension']){await click('nav',{view:v});snapshots[v]=html();}
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa','rendered-views.json'),JSON.stringify(snapshots,null,2));
const summary={assertions:assertionCount,chapters:L.chapters.length,readingUnits:43,vocabulary:L.vocabulary.length,comprehensionQuestions:qs.length,sourceImages:L.sourcePages.length,verification:'Node VM simulation and data validation only; no browser, real audio, microphone or visual QA performed.'};
fs.writeFileSync(path.join(root,'qa','verification.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
