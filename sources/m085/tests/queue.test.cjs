/* Local behavioral tests. These use a simulated page and simulated downloads,
   not Jimeng's live member service. Run: node --test tests/queue.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../extension/core.js');
const root=path.join(__dirname,'../extension');
const clone=v=>structuredClone(v);
function harness(){
  const db={},calls=[],items=[];let mode='ok',scan={outputs:[],records:[],bound:true,documentId:'document-A',blocker:''};
  const event=()=>({callbacks:[],addListener(fn){this.callbacks.push(fn);}});
  const chrome={runtime:{id:'test-extension',onMessage:event(),onInstalled:event(),onStartup:event(),getURL:s=>'chrome-extension://test-extension/'+s},
    storage:{local:{get:async key=>({[key]:clone(db[key])}),set:async values=>Object.assign(db,clone(values))}},
    tabs:{get:async id=>({id,url:C.URL_HOME}),query:async()=>[],update:async()=>({}),create:async()=>({id:7}),sendMessage:async(id,msg)=>{
      calls.push(msg.type);
      if(msg.type==='PAGE_INSPECT')return {ok:true,data:{version:'1.2.0',prompt:true,submit:true,music:true}};
      if(msg.type==='PAGE_FILL')return {ok:true,data:{filled:true}};
      if(msg.type==='PAGE_SCAN')return {ok:true,data:clone(scan)};
      if(msg.type==='PAGE_SUBMIT'){if(mode==='lost')throw Error('Navigation interrupted response');return {ok:true,data:{clicked:true}};}
      return {ok:true,data:{}};
    }},
    downloads:{download:async opts=>{const id=items.length+1;items.push({id,url:opts.url,filename:'/Downloads/'+(opts.filename||'music.mp3'),state:'complete',mime:mode==='html'?'text/html':'audio/mpeg',fileSize:4000,byExtensionId:'test-extension'});return id;},search:async opts=>clone(opts.id?items.filter(x=>x.id===opts.id):items),cancel:async()=>{},show:async()=>{},onDeterminingFilename:event(),onChanged:event()},
    alarms:{create:async()=>{},onAlarm:event()},action:{onClicked:event()}};
  const ctx=vm.createContext({chrome,console,structuredClone,Date,URL,setTimeout,clearTimeout});
  ctx.importScripts=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(root,'background.js'),'utf8'),ctx);
  const api={ctx,db,calls,items,setMode:v=>mode=v,setScan:v=>scan={...scan,...clone(v)},get:()=>clone(db.jmStudioV1),
    change:fn=>{const s=clone(db.jmStudioV1);fn(s);db.jmStudioV1=s;},
    command:async(type,extra={})=>ctx.handle({type,...extra},{url:'chrome-extension://test-extension/studio.html'}),tick:()=>ctx.tick(),
    seed:async()=>{await ctx.handle({type:'GENERATE',input:{theme:'数字孪生校园',language:'普通话'}},{});await ctx.handle({type:'CONNECT',tabId:7},{});api.change(s=>{s.settings.adapter.card='.music-card';s.settings.settle=10;s.settings.interval=5;s.batch.jobs.forEach((j,i)=>j.selected=i===0);});}
  };return api;
}
test('每个随机范围均生成十条包含主题、风格、语种、声线与结构的提示词',()=>{
  for(const pack of Object.keys(C.PACKS)){
    const b=C.generate({theme:'数字孪生校园',pack,language:'组合语种'});assert.equal(b.jobs.length,10);assert.equal(new Set(b.jobs.map(j=>j.style)).size,10);
    for(const j of b.jobs){assert.match(j.prompt,/数字孪生校园/);assert.match(j.prompt,/风格：/);assert.match(j.prompt,/演唱：|演奏：/);assert.match(j.prompt,/结构：/);assert.match(j.prompt,/BPM/);}
  }
});
test('纯音乐不要求人声；长主题与空主题被拒绝',()=>{
  const j=C.generate({theme:'深山',language:'纯音乐'}).jobs[0];assert.match(j.prompt,/纯器乐/);assert.doesNotMatch(j.prompt,/演唱：/);
  assert.throws(()=>C.generate({theme:''}));assert.throws(()=>C.generate({theme:'好'.repeat(241)}));
});
test('文件名去除路径穿越、Windows非法字符及设备名',()=>{
  for(const v of ['../tmp','D:\\Music','/root','a/../../b'])assert.throws(()=>C.folderName(v));
  assert.equal(C.folderName('音乐/毕业季'),'音乐/毕业季');assert.equal(C.safeName('CON'),'_CON');assert.doesNotMatch(C.safeName('../../坏:name?.mp3'),/[<>:"/\\|?*]/);
});
test('下载保留实际格式，非法URL拒绝，历史媒体去重',()=>{
  assert.equal(C.fileExt('https://a/file.wav?x=1'),'wav');assert.equal(C.fileExt('https://a/opaque','audio/mp4'),'m4a');assert.equal(C.fileExt('https://a/opaque'),'');assert.equal(C.audioUrl('javascript:alert(1)'),false);
  assert.deepEqual(C.selectNew([{key:'a'},{key:'b'}],['a']),[{key:'b'}]);
});
test('创建提交意图后回执丢失：暂停且多次tick不重复提交',async()=>{
  const h=harness();await h.seed();h.setMode('lost');await h.command('START');await h.tick();
  assert.equal(h.get().batch.status,'paused');assert.equal(h.get().batch.jobs[0].status,'uncertain');
  await h.tick();await h.tick();assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,1);
  await assert.rejects(h.command('RESUME'),/核对|继续检查/);
});
test('暂停后继续只检查已提交任务，不重复填写和创建',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();await h.command('PAUSE');await h.command('RESUME');await h.tick();
  assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,1);assert.equal(h.get().batch.jobs[0].status,'waiting');
});
test('历史作品即使签名URL变化也不被当作新卡片下载',async()=>{
  const h=harness();await h.seed();h.setScan({records:['old-card'],outputs:[{key:'old-url',record:'old-card',url:'https://audio.test/old.mp3',kind:'url'}]});await h.command('START');await h.tick();
  h.setScan({records:['old-card'],outputs:[{key:'old-new-signature',record:'old-card',url:'https://audio.test/old.mp3?new=1',kind:'url'}]});await h.tick();assert.equal(h.items.length,0);assert.equal(h.get().batch.jobs[0].status,'waiting');
});
test('新结果稳定后才下载，浏览器complete后才将任务置为完成',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();
  h.setScan({records:['new'],outputs:[{key:'new-url',record:'new',url:'https://audio.test/new.wav',kind:'url'}]});await h.tick();assert.equal(h.items.length,0);
  h.change(s=>s.batch.jobs[0].observedAt=Date.now()-11000);await h.tick();assert.equal(h.get().batch.jobs[0].status,'generated');
  await h.tick();await h.tick();assert.equal(h.get().batch.jobs[0].status,'downloading');assert.match(h.items[0].filename,/\.wav$/);
  await h.tick();assert.equal(h.get().batch.jobs[0].downloads[0].state,'complete');await h.tick();assert.equal(h.get().batch.jobs[0].status,'done');await h.tick();assert.equal(h.get().batch.status,'done');assert.equal(h.items.length,1);
});
test('错误HTML下载不能被当作音乐完成',async()=>{
  const h=harness();await h.seed();h.setMode('html');h.change(s=>{s.batch.status='running';s.batch.jobs[0].status='downloading';s.batch.jobs[0].outputs=[{key:'x',record:'x',url:'https://audio.test/auth.mp3',kind:'url'}];});
  await h.tick();await h.tick();assert.equal(h.get().batch.status,'paused');assert.equal(h.get().batch.jobs[0].downloads[0].state,'invalid');
});
test('自动适配允许无手动绑定提交并检查第一首',async()=>{
  const h=harness();await h.seed();h.change(s=>s.settings.adapter.card='');await h.command('START');await h.tick();await h.tick();assert.equal(h.get().batch.status,'running');assert.equal(h.get().batch.jobs[0].status,'waiting');assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,1);
});
test('页面重载导致临时卡片ID失效时熔断，不采纳不确定结果',async()=>{
  const h=harness();await h.seed();h.setScan({records:['dom:old']});await h.command('START');await h.tick();h.setScan({documentId:'document-B',records:['dom:changed'],outputs:[{key:'a',record:'dom:changed',url:'https://a.test/a.mp3',kind:'url'}]});await h.tick();assert.equal(h.get().batch.status,'paused');assert.equal(h.get().batch.jobs[0].needsRebind,true);assert.equal(h.items.length,0);
});
test('超过最大版本数时暂停，不批量下载额外内容',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();h.setScan({records:['a','b','c'],outputs:['a','b','c'].map(x=>({key:x,record:x,url:'https://audio.test/'+x+'.mp3',kind:'url'}))});await h.tick();assert.equal(h.get().batch.status,'paused');assert.equal(h.items.length,0);
});
test('执行中拒绝更改页面、设置和提示词',async()=>{
  const h=harness();await h.seed();await h.command('START');await assert.rejects(h.command('CONNECT',{tabId:8}),/暂停/);await assert.rejects(h.command('SETTINGS',{settings:C.DEFAULT_SETTINGS}),/暂停/);await assert.rejects(h.command('EDIT',{job:h.get().batch.jobs[0]}),/暂停/);
});


test('十首完整队列：全部生成后才下载，每首仅提交一次',async()=>{
  const h=harness();await h.seed();h.change(s=>{s.settings.adapter.card='';s.batch.jobs.forEach(j=>j.selected=true);});await h.command('START');
  const outputs=[];
  for(let i=0;i<10;i++){
    h.change(s=>s.batch.nextAt=0);await h.tick();assert.equal(h.get().batch.jobs[i].status,'waiting');
    const key='data-generated-record-handoff-key:'+i;outputs.push({key:'card:'+key+':0',record:key,kind:'url',url:'https://audio.test/'+i+'.wav',matched:true});
    h.setScan({outputs,records:outputs.map(o=>o.record)});await h.tick();h.change(s=>s.batch.jobs[i].observedAt=Date.now()-21000);await h.tick();
    assert.equal(h.get().batch.jobs[i].status,'generated');assert.equal(h.items.length,0);
  }
  for(let i=0;i<41;i++)await h.tick();
  assert.equal(h.get().batch.status,'done');assert.equal(h.items.length,10);assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,10);
  assert.ok(h.get().batch.jobs.every(j=>j.status==='done'));
});
test('页面迟加载的历史原生作品没有本批次标记，不被认领',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();
  h.setScan({outputs:[{key:'old',record:'data-generated-record-handoff-key:old',kind:'menu',matched:false}],records:['data-generated-record-handoff-key:old']});
  await h.tick();assert.equal(h.get().batch.jobs[0].status,'waiting');assert.equal(h.get().batch.jobs[0].outputs.length,0);
});
test('旧版卡住的第一首：按标记跨页面重载恢复，不重复提交',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();
  h.change(s=>{s.batch.jobs[0].baselineRecords=['dom:old'];s.batch.jobs[0].documentId='old';});
  h.setScan({documentId:'new',outputs:[{key:'first',record:'data-generated-record-handoff-key:first',kind:'menu',matched:true}],records:['data-generated-record-handoff-key:first']});
  await h.tick();h.change(s=>s.batch.jobs[0].observedAt=Date.now()-21000);await h.tick();
  assert.equal(h.get().batch.jobs[0].status,'generated');assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,1);
});
test('升级保留旧队列、暂停并恢复内置适配，不自动重发',async()=>{
  const h=harness();await h.seed();h.change(s=>{s.batch.jobs=s.batch.jobs.slice(0,5);delete s.schemaVersion;s.batch.status='running';s.batch.jobs[0].status='waiting';s.settings.adapter.card='.wrong';});
  const s=await h.command('GET');assert.equal(s.batch.status,'paused');assert.equal(s.batch.jobs.length,5);assert.equal(s.batch.jobs[0].status,'waiting');assert.equal(s.settings.adapter.card,'');assert.equal(s.previousAdapter.card,'.wrong');
});
test('Blob音频下载归属：识别即梦来源，拒绝其他站点、HTML与过期事件',()=>{
  const now=Date.now(),p={kind:'menu',startedAt:now};
  const d={url:'blob:https://jimeng.jianying.com/abc',filename:'song.wav',mime:'audio/wav',startTime:new Date(now).toISOString()};
  assert.equal(C.downloadMatches(d,p,'x',now),true);
  assert.equal(C.downloadMatches({...d,url:'blob:https://other.test/abc'},p,'x',now),false);
  assert.equal(C.downloadMatches({...d,mime:'text/html'},p,'x',now),false);
  assert.equal(C.downloadMatches(d,p,'x',now+100000),false);
});
test('关闭自动下载时仍完成所选歌曲生成并保留就绪状态',async()=>{
  const h=harness();await h.seed();h.change(s=>s.settings.autoDownload=false);await h.command('START');await h.tick();
  h.setScan({records:['a'],outputs:[{key:'a',record:'a',kind:'menu',matched:true}]});await h.tick();h.change(s=>s.batch.jobs[0].observedAt=Date.now()-21000);await h.tick();await h.tick();
  assert.equal(h.get().batch.jobs[0].status,'ready');assert.equal(h.get().batch.status,'done');assert.equal(h.items.length,0);
});


test('恢复实站重复首首：两个相同标记版本优先于只有相同标题的手动作品',async()=>{
  const h=harness();await h.seed();await h.command('START');await h.tick();
  h.setScan({records:['a','b','c'],outputs:[
    {key:'a',record:'data-generated-record-handoff-key:a',kind:'menu',matched:true,matchType:'marker'},
    {key:'b',record:'data-generated-record-handoff-key:b',kind:'menu',matched:true,matchType:'marker'},
    {key:'c',record:'data-generated-record-handoff-key:c',kind:'menu',matched:true,matchType:'title'}]});
  await h.tick();h.change(s=>s.batch.jobs[0].observedAt=Date.now()-21000);await h.tick();
  assert.equal(h.get().batch.jobs[0].status,'generated');assert.equal(h.get().batch.jobs[0].outputs.length,2);assert.equal(h.calls.filter(x=>x==='PAGE_SUBMIT').length,1);
});
