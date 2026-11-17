/* Synthetic DOM reproducing observed attributes, not private account content. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {parseHTML}=require('linkedom');
const C=require('../extension/core.js');
function setup(body){
  const {window,document}=parseHTML('<html><body>'+body+'</body></html>');
  window.HTMLElement.prototype.getBoundingClientRect=function(){return this.hasAttribute('hidden')?{width:0,height:0}:{width:200,height:100,left:10,top:10};};
  window.HTMLElement.prototype.scrollIntoView=function(){};
  let listener;const chrome={runtime:{onMessage:{addListener:f=>listener=f},sendMessage:async()=>({ok:true})}};
  const context={MusicCore:C,window,document,chrome,console,location:{href:'https://jimeng.jianying.com/ai-tool/generate?workspace=test'},
    getComputedStyle:()=>({visibility:'visible',display:'block'}),crypto:require('node:crypto').webcrypto,
    Event:window.Event,MouseEvent:window.Event,KeyboardEvent:window.Event,URL,setInterval:()=>0,setTimeout:(f)=>setTimeout(f,0),CSS:{escape:x=>x}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../extension/content.js'),'utf8'),context);
  return {document,window,call:msg=>new Promise((resolve,reject)=>listener(msg,{},r=>r.ok?resolve(r.data):reject(Error(r.error))))};
}
const controls='<textarea class="prompt-textarea-test" hidden></textarea><textarea class="prompt-textarea-test"></textarea><button data-generator-submit-available="true" hidden></button><button data-generator-submit-available="true"></button><div role="combobox">音乐生成</div>';
const record=(id,title='测试曲',duration='02:03')=>`<div data-generated-record-key="session-${id}" data-generated-record-handoff-key="${id}" class="audio-record-test"><div>曲名：《${title}》。作品标记：JM-TEST。</div><div data-generated-record-body="audio"><div data-vinyl-audio-card-presentation="true"><div class="title-container-test"><div class="title-test">${title}</div></div><div class="total-time-test">${duration}</div><div class="play-button-test"></div></div><div class="record-bottom-slots-test"><div class="operation-button-test">…</div></div></div></div>`;
test('当前页面结构：隐藏编辑器副本被排除；无绑定识别原生卡片',async()=>{
  const h=setup(controls+record('123'));const info=await h.call({type:'PAGE_INSPECT'});
  assert.equal(info.prompt,true);assert.equal(info.submit,true);assert.equal(info.music,true);assert.equal(info.cards,1);assert.equal(info.autoAdapter,true);
  const s=await h.call({type:'PAGE_SCAN',job:{marker:'JM-TEST'}});assert.equal(s.outputs.length,1);assert.equal(s.outputs[0].kind,'menu');assert.equal(s.outputs[0].record,'data-generated-record-handoff-key:123');assert.equal(s.outputs[0].matched,true);assert.equal(s.outputs[0].title,'测试曲');
});
test('原生作品没有audio标签和直链，仍能按播放控件及有效时长认定就绪',async()=>{
  const h=setup(controls+record('123'));assert.equal(h.document.querySelector('audio'),null);
  assert.equal((await h.call({type:'PAGE_SCAN'})).outputs.length,1);
});
test('没有有效时长的原生作品保持等待',async()=>{
  const h=setup(controls+record('123','等待曲','00:00'));assert.equal((await h.call({type:'PAGE_SCAN'})).outputs.length,0);
});
test('下载只打开指定卡片右键菜单，不点击含删除功能的批次更多按钮',async()=>{
  const h=setup(controls+record('123'));let menuOpened=0,downloaded=0,wrong=0;
  h.document.querySelector('[class*="operation-button-"]').addEventListener('click',()=>wrong++);
  h.document.querySelector('[data-vinyl-audio-card-presentation]').addEventListener('contextmenu',()=>{
    menuOpened++;const menu=h.document.createElement('div');menu.className='context-menu-item-outer';menu.innerHTML='<div class="context-menu-item-view-test">下载</div>';
    menu.addEventListener('click',()=>downloaded++);h.document.body.append(menu);
  });
  const r=await h.call({type:'PAGE_DOWNLOAD',record:'data-generated-record-handoff-key:123',variant:0});
  assert.equal(r.route,'audio-context-menu');assert.equal(menuOpened,1);assert.equal(downloaded,1);assert.equal(wrong,0);
});
test('卡片内部错误绑定自动上溯到完整作品容器',async()=>{
  const h=setup(controls+record('123'));const scan=await h.call({type:'PAGE_SCAN',adapter:{card:'[data-vinyl-audio-card-presentation]'},job:{marker:'JM-TEST'}});
  assert.equal(scan.outputs[0].record,'data-generated-record-handoff-key:123');assert.equal(scan.outputs[0].matched,true);
});
test('同一条生成多个版本时按版本号分别识别',async()=>{
  const h=setup(controls+record('123'));const body=h.document.querySelector('[data-generated-record-body]');body.append(body.querySelector('[data-vinyl-audio-card-presentation]').cloneNode(true));
  const scan=await h.call({type:'PAGE_SCAN'});assert.equal(scan.outputs.length,2);assert.notEqual(scan.outputs[0].key,scan.outputs[1].key);
});

test('任务标记存在时，同名但不同标记的历史音乐不匹配',async()=>{
  const h=setup(controls+record('123'));const s=await h.call({type:'PAGE_SCAN',job:{marker:'JM-OTHER',title:'测试曲'}});
  assert.equal(s.outputs[0].matched,false);
});

test('十首任务的标记精确匹配：第1首不会认领第10首',async()=>{
  const h=setup(controls+record('123').replace('JM-TEST','JMABC-10'));
  assert.equal((await h.call({type:'PAGE_SCAN',job:{marker:'JMABC-1'}})).outputs[0].matched,false);
  assert.equal((await h.call({type:'PAGE_SCAN',job:{marker:'JMABC-10'}})).outputs[0].matched,true);
});
