const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {parseHTML}=require('linkedom');
const C=require('../extension/core.js');
async function studio(){
 const dir=path.join(__dirname,'../extension'),{window,document}=parseHTML(fs.readFileSync(path.join(dir,'studio.html'),'utf8'));
 // Model native select value selection in the lightweight DOM implementation.
 const sample=document.querySelector('select');Object.defineProperty(Object.getPrototypeOf(sample),'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value??this.querySelector('option')?.value??'';},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.value===String(v));}});
 window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLElement.prototype.focus=function(){};
 let state={settings:structuredClone(C.DEFAULT_SETTINGS),batch:null,history:[],tabId:null};
 const chrome={runtime:{id:'test-extension',sendMessage:async(msg)=>{
  if(msg.type==='GET')return {ok:true,data:structuredClone(state)};
  if(msg.type==='TABS')return {ok:true,data:[]};
  if(msg.type==='GENERATE'){state.batch=C.generate(msg.input);return {ok:true,data:state.batch};}
  return {ok:true,data:{}};
 }}};
 const ctx={MusicCore:C,window,document,chrome,console,Date,Option:function(text,value){const e=document.createElement('option');e.textContent=text;e.value=value;return e;},setInterval:()=>0,setTimeout:()=>0,clearTimeout(){},navigator:{}};
 vm.runInNewContext(fs.readFileSync(path.join(dir,'studio.js'),'utf8'),ctx);await new Promise(setImmediate);
 return {document,window,get:()=>state,change:f=>f(state)};
}
test('工作台可初始化526类型库、15个抽样范围与童声菜单',async()=>{
 const h=await studio(),d=h.document;
 assert.equal(d.querySelectorAll('#pack option').length,15);assert.equal(d.querySelectorAll('#voice option').length,19);
 assert.equal(d.querySelectorAll('.catalog-card').length,24);assert.match(d.getElementById('catalog-results').textContent,/526/);
 assert.doesNotMatch(d.getElementById('toast').textContent,/错误|未定义|undefined/);
});
test('资料库搜索、分页与分类选择联动创作范围',async()=>{
 const h=await studio(),d=h.document;
 d.getElementById('catalog-next').onclick();assert.equal(d.getElementById('catalog-page').textContent,'2 / 22');
 const q=d.getElementById('catalog-query');q.value='京剧';q.oninput();assert.ok(d.querySelectorAll('.catalog-card').length>0);assert.match(d.getElementById('catalog-grid').textContent,/京剧/);
 q.value='';q.oninput();await d.querySelector('[data-group="中国戏曲与民歌"]').click();
 assert.equal(d.querySelectorAll('.catalog-card').length,7);d.getElementById('catalog-use').onclick();assert.equal(d.getElementById('pack').value,'中国戏曲与民歌');assert.match(d.getElementById('scope-note').textContent,/补足3种/);
});
test('UI生成10张卡片并正确显示进度分母和儿童成人声部',async()=>{
 const h=await studio(),d=h.document;d.getElementById('voice').value='儿童与成人对唱';await d.getElementById('generate').onclick();
 assert.equal(d.querySelectorAll('.job').length,10);assert.equal(d.getElementById('done-count').textContent,'0 / 10');assert.match(d.getElementById('phase-summary').textContent,/0 \/ 10/);
 assert.ok(h.get().batch.jobs.every(j=>j.prompt.includes('童声与温暖成人声轮流演唱主歌')));
});
