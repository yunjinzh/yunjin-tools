importScripts('catalog.js');
importScripts('core.js');
const C=MusicCore, KEY='jmStudioV1';
let serial=Promise.resolve();
function locked(fn){const p=serial.then(fn);serial=p.catch(()=>{});return p;}
async function load(){
  const v=(await chrome.storage.local.get(KEY))[KEY]||{settings:structuredClone(C.DEFAULT_SETTINGS),batch:null,history:[],tabId:null,pendingDownload:null};
  v.settings={...structuredClone(C.DEFAULT_SETTINGS),...v.settings,adapter:{...C.DEFAULT_SETTINGS.adapter,...v.settings?.adapter}};
  if(v.schemaVersion!==2){
    v.previousAdapter=structuredClone(v.settings.adapter);v.settings.adapter=structuredClone(C.DEFAULT_SETTINGS.adapter);v.schemaVersion=2;
    if(v.batch){v.batch.status='paused';v.batch.reason='已升级1.2：旧队列已保留。请刷新即梦网页、连接原创作对话并继续检查；已提交任务不会自动重建。';}
    await save(v);
  }
  return v;
}
async function save(s){await chrome.storage.local.set({[KEY]:s});}
function log(s,text){if(!s.batch)return;s.batch.logs.push({time:new Date().toISOString(),text});s.batch.logs=s.batch.logs.slice(-250);}
function pause(s,reason){s.batch.status='paused';s.batch.reason=reason;log(s,reason);}
async function page(s,type,extra={}){
  if(!s.tabId)throw Error('先连接一个已登录的即梦音乐标签页');
  const t=await chrome.tabs.get(s.tabId);
  if(!t.url?.startsWith('https://jimeng.jianying.com/'))throw Error('连接的标签页已离开即梦');
  let response;
  try{response=await chrome.tabs.sendMessage(s.tabId,{type,adapter:s.settings.adapter,...extra});}
  catch{throw Error('即梦页面正在跳转或未加载扩展。请等待页面加载；首次安装后需刷新即梦标签页。');}
  if(!response?.ok)throw Error(response?.error||'页面未返回有效结果');return response.data;
}
function archive(s){if(s.batch){s.history.unshift(structuredClone(s.batch));s.history=s.history.slice(0,20);}}
async function waitScan(s,j){
  const data=await page(s,'PAGE_SCAN',{job:{title:j.title,marker:j.prompt?.includes(j.marker)?j.marker:''}});
  if(data.blocker){pause(s,data.blocker);await save(s);return;}
  if(!data.bound){pause(s,'当前页面无法识别音乐结果。请回到音乐生成对话，或绑定当前任务的完整结果卡片。');await save(s);return;}
  if(s.batch.workspace&&data.workspace&&data.workspace!==s.batch.workspace){pause(s,'当前页面已切换对话，请回到本批次创作的原对话后继续。');await save(s);return;}
  if(!s.batch.workspace&&data.workspace)s.batch.workspace=data.workspace;
  const failed=data.tasks?.find(t=>t.matched&&t.state==='failed');
  if(failed){pause(s,'本首作品在即梦显示生成失败。请核对后重试或跳过；不会自动重建。');await save(s);return;}
  const markerMatches=data.outputs.filter(o=>o.matchType==='marker');
  const exact=markerMatches.length?markerMatches:data.outputs.filter(o=>o.matched&&(!o.matchType||!j.baselineRecords?.includes(o.record)));
  const claimed=new Set(s.batch.jobs.filter(x=>x.id!==j.id).flatMap(x=>(x.outputs||[]).map(o=>o.key)));
  const ownedExact=exact.filter(o=>!claimed.has(o.key));
  if(!ownedExact.length&&j.documentId&&data.documentId!==j.documentId&&j.baselineRecords?.some(x=>x.startsWith('dom:'))){
    pause(s,'页面已重新加载，旧卡片的临时标识失效。请在结果绑定中重新选择本首音乐卡片，再继续检查；本工具不会重复提交。');
    j.needsRebind=true;await save(s);return;
  }
  const oldRecords=new Set(j.baselineRecords||[]);
  let fresh=ownedExact.length?ownedExact:C.selectNew(data.outputs,j.baseline||[]).filter(o=>!oldRecords.has(o.record)&&!claimed.has(o.key));
  // Native records contain the submitted prompt. Exact marker/title prevents a late history load from looking new.
  if(!ownedExact.length)fresh=fresh.filter(o=>!o.record.startsWith('data-generated-record-')||o.record===j.manualRecord);
  if(j.manualRecord)fresh=fresh.filter(o=>o.record===j.manualRecord);
  if(new Set(fresh.map(o=>o.record)).size>1&&!fresh.every(o=>o.matchType==='marker')){pause(s,'发现多个不同作品批次，请绑定本首的完整结果卡片后继续。');await save(s);return;}
  if(fresh.length>s.settings.maxVariants){pause(s,'发现的新增结果超过“每条提示词最大版本数”，请核对结果卡片范围；未下载任何未确认的额外作品。');await save(s);return;}
  if(fresh.length){
    const keys=fresh.map(o=>o.key).sort().join('|');
    if(keys!==j.observedKeys){j.observedKeys=keys;j.observedAt=Date.now();j.outputs=fresh;await save(s);return;}
    if(Date.now()-j.observedAt>=s.settings.settle*1000){
      j.outputs=fresh;j.status=s.settings.autoDownload?'generated':'ready';j.generatedAt=new Date().toISOString();
      log(s,`第${j.index}首检测到${fresh.length}个音乐结果`);
      s.batch.nextAt=Date.now()+s.settings.interval*1000;
      await save(s);return;
    }
  }
  if(Date.now()-(j.waitSince||j.submittedAt)>s.settings.timeout*60000){pause(s,`第${j.index}首等待超时。请核对即梦的生成状态和结果绑定，然后继续检查；不会自动重复创建。`);await save(s);}
}
function isAudioDownload(d){return (d.mime||'').startsWith('audio/')||(!/^(text\/|image\/|application\/(json|pdf))/.test(d.mime||'')&&!!C.fileExt(d.filename||d.url));}
async function beginDownload(s,j,o,index){
  const stem=C.downloadStem(s.batch,j,index+1,s.settings);
  const rec={key:o.key,index:index+1,state:'starting',stem,startedAt:new Date().toISOString()};j.downloads.push(rec);
  s.pendingDownload={batchId:s.batch.id,jobId:j.id,key:o.key,stem,startedAt:Date.now(),kind:o.kind,url:o.url||'',tabId:s.tabId};
  await save(s); // write intent before a browser download or click
  if(o.kind==='url'){
    if(!C.audioUrl(o.url))throw Error('音乐下载地址不受支持，请在页面中下载');
    const ext=C.fileExt(o.url,o.mime);const options={url:o.url,conflictAction:'uniquify',saveAs:false};
    if(ext)options.filename=stem+'.'+ext;
    const id=await chrome.downloads.download(options);rec.id=id;rec.state='in_progress';s.pendingDownload.downloadId=id;
  }else{
    await page(s,'PAGE_DOWNLOAD',{record:o.record,variant:o.variant||0});rec.state='awaiting_browser';
  }
  await save(s);
}
async function checkDownloads(s,j){
  const p=s.pendingDownload;
  if(p&&p.jobId===j.id){
    const rec=j.downloads.find(d=>d.key===p.key);
    if(!rec){pause(s,'下载记录不完整，请导出日志后核对');await save(s);return;}
    let item;
    if(rec.id) item=(await chrome.downloads.search({id:rec.id}))[0];
    else {
      const found=await chrome.downloads.search({startedAfter:new Date(p.startedAt-1000).toISOString(),limit:20,orderBy:['-startTime']});
      const matches=found.filter(d=>C.downloadMatches(d,p,chrome.runtime.id)||d.filename?.replaceAll('\\','/').includes(p.stem));
      if(matches.length===1){item=matches[0];rec.id=item.id;p.downloadId=item.id;await save(s);}
    }
    if(item){
      rec.state=item.state;rec.filename=item.filename;rec.bytes=item.fileSize||item.bytesReceived;
      if(item.state==='complete'){
        if(!isAudioDownload(item)||item.fileSize===0){rec.state='invalid';pause(s,'下载结果不是已确认的音频文件，或文件大小为0。请在即梦页面检查下载入口。');await save(s);return;}
        s.pendingDownload=null;log(s,`第${j.index}首 / 版本${rec.index}下载完成（${Math.round((item.fileSize||item.bytesReceived)/1024)} KB）`);await save(s);return;
      }
      if(item.state==='interrupted'){rec.error=item.error;pause(s,'下载中断：'+(item.error||'浏览器未提供原因')+'。可使用“重试下载”，不会重建音乐。');await save(s);return;}
    }
    if(!rec.id&&Date.now()-p.startedAt>90000){pause(s,'已点击下载，但90秒内未收到可归属的音频下载事件。请核对浏览器下载列表，再重试下载；不会重建音乐。');await save(s);return;}
    if(rec.id&&Date.now()-p.startedAt>10*60000){pause(s,'音频下载超过10分钟仍未完成，请在浏览器下载列表中处理后继续。');await save(s);return;}
    return;
  }
  const todo=j.outputs.findIndex(o=>!j.downloads.some(d=>d.key===o.key&&d.state==='complete'));
  if(todo>=0){
    if(j.downloads.some(d=>d.key===j.outputs[todo].key&&d.state!=='complete')){pause(s,'有未完成的下载记录，请先“重试下载”或在浏览器核对该文件。');await save(s);return;}
    await beginDownload(s,j,j.outputs[todo],todo);return;
  }
  j.status='done';j.finishedAt=new Date().toISOString();s.batch.nextAt=Date.now()+s.settings.interval*1000;await save(s);
}
async function tick(){
  const s=await load();if(!s.batch||s.batch.status!=='running')return;
  const j=C.actionable(s.batch);
  if(!j){s.batch.status='done';s.batch.reason='本批次已处理完成';log(s,'队列完成');await save(s);return;}
  try{
    if(C.needsReview(j)){pause(s,'上一次提交结果不明确。请核对即梦页面；“继续检查”仅检查结果，“确认未创建，重新提交”会再次创建。');await save(s);return;}
    if(j.status==='generated'){j.status='downloading';log(s,`开始统一下载第${j.index}首`);await save(s);return;}
    if(j.status==='draft'||j.status==='preparing'){
      if(Date.now()<(s.batch.nextAt||0))return;
      j.status='preparing';await save(s);
      await page(s,'PAGE_FILL',{prompt:j.prompt});
      const before=await page(s,'PAGE_SCAN',{job:{title:j.title,marker:j.prompt?.includes(j.marker)?j.marker:''}});
      if(before.blocker)throw Error(before.blocker);
      if(s.batch.workspace&&before.workspace&&before.workspace!==s.batch.workspace)throw Error('当前已切换对话，请回到本批次原对话继续。');
      if(before.workspace)s.batch.workspace=before.workspace;
      j.baseline=before.outputs.map(o=>o.key);j.baselineRecords=before.records;j.documentId=before.documentId;
      j.status='submitting';j.submittedAt=Date.now();j.waitSince=Date.now();log(s,`第${j.index}首填写完成，记录一次创建意图`);await save(s);
      try{await page(s,'PAGE_SUBMIT',{prompt:j.prompt});}catch(e){j.status='uncertain';pause(s,'提交回执未确认：'+e.message);await save(s);return;}
      j.status='waiting';log(s,`第${j.index}首已点击创建，等待页面结果`);await save(s);
      return;
    }
    if(j.status==='waiting'){await waitScan(s,j);return;}
    if(j.status==='downloading'){await checkDownloads(s,j);return;}
  }catch(e){if(j.status==='preparing')j.status='draft';pause(s,e.message);await save(s);}
}
async function handle(msg,sender){
  const s=await load();
  if(msg.type==='GET')return s;
  if(msg.type==='PULSE'){if(sender.tab&&sender.tab.id!==s.tabId)return {};await tick();return {};}
  if(msg.type==='TABS')return (await chrome.tabs.query({url:'https://jimeng.jianying.com/*'})).map(t=>({id:t.id,title:t.title,url:t.url}));
  if(msg.type==='OPEN'){const t=await chrome.tabs.create({url:C.URL_HOME});s.tabId=t.id;await save(s);return {id:t.id};}
  if(msg.type==='CONNECT'){
    if(s.batch?.status==='running')throw Error('先暂停队列再更换页面');
    const t=await chrome.tabs.get(Number(msg.tabId));if(!t.url?.startsWith('https://jimeng.jianying.com/'))throw Error('所选页面不是即梦');s.tabId=t.id;await save(s);const info=await page(s,'PAGE_INSPECT');if(info.version!=='1.2.0')throw Error('请刷新即梦网页，加载1.2.0页面适配器后重新连接');return info;
  }
  if(msg.type==='INSPECT')return page(s,'PAGE_INSPECT');
  if(msg.type==='RESET_ADAPTER'){if(s.batch?.status==='running')throw Error('先暂停队列');s.settings.adapter=structuredClone(C.DEFAULT_SETTINGS.adapter);await save(s);return page(s,'PAGE_INSPECT');}
  if(msg.type==='SETTINGS'){
    if(s.batch?.status==='running')throw Error('先暂停队列再修改设置');s.settings=C.normalizeSettings(msg.settings);await save(s);return s.settings;
  }
  if(msg.type==='GENERATE'){
    if(s.batch&&s.batch.jobs.some(j=>['submitting','uncertain','waiting','generated','downloading','preparing'].includes(j.status)))throw Error('当前批次还有未处理任务，请完成或跳过这些任务后再创建新批次');
    archive(s);s.batch=C.generate(msg.input);await save(s);return s.batch;
  }
  if(msg.type==='EDIT'){
    if(!s.batch||s.batch.status==='running')throw Error('先暂停队列再编辑');
    const j=s.batch.jobs.find(j=>j.id===msg.job.id);if(!j||j.status!=='draft')throw Error('仅支持编辑待提交任务');
    for(const k of ['prompt','title','language','voice','bpm','selected'])if(k in msg.job)j[k]=msg.job[k];
    if(typeof j.prompt!=='string'||!j.prompt.trim()||j.prompt.length>12000)throw Error('提示词须为1至12000个字符');await save(s);return j;
  }
  if(msg.type==='FILL'){
    if(s.batch?.status==='running')throw Error('请先暂停队列');const j=s.batch?.jobs.find(j=>j.id===msg.jobId);if(!j)throw Error('任务不存在');
    return page(s,'PAGE_FILL',{prompt:j.prompt});
  }
  if(msg.type==='START'||msg.type==='RESUME'){
    if(!s.batch)throw Error('先生成十组提示词');
    const j=C.actionable(s.batch);if(!j)throw Error('没有待处理任务');
    if(C.needsReview(j))throw Error('请先在当前任务中选择“继续检查”或“确认未创建，重新提交”');
    if(j.status==='draft'){const check=await page(s,'PAGE_INSPECT');if(check.blocker)throw Error(check.blocker);if(!check.music||!check.prompt||!check.submit)throw Error(check.error||'请完成音乐模式、提示词框和创建按钮绑定');}
    j.waitSince=Date.now();s.batch.status='running';s.batch.reason='';log(s,'队列开始 / 继续');await save(s);return s.batch;
  }
  if(msg.type==='PAUSE'){if(s.batch){pause(s,'已暂停。已提交的音乐仍在即梦继续生成；恢复后仅检查现有结果。');await save(s);}return {};}
  if(msg.type==='RECOVER'){
    if(!s.batch||s.batch.status==='running')throw Error('请先暂停队列');
    const j=s.batch.jobs.find(j=>j.id===msg.jobId);if(!j)throw Error('任务不存在');
    if(msg.action==='check'){if(!['uncertain','submitting','waiting'].includes(j.status))throw Error('该任务当前不需要检查提交结果');j.status='waiting';j.waitSince=Date.now();}
    if(msg.action==='retry'){
      if(!['uncertain','submitting','waiting'].includes(j.status))throw Error('仅可重试未确认的创建任务');
      j.status='draft';j.outputs=[];j.observedKeys='';j.downloads=[];delete j.manualRecord;log(s,`用户已核对第${j.index}首尚未创建，重新加入待提交队列`);
    }
    if(msg.action==='skip'){
      if(s.pendingDownload?.jobId===j.id){const pending=s.pendingDownload;if(pending.downloadId)await chrome.downloads.cancel(pending.downloadId).catch(()=>{});s.pendingDownload=null;}
      j.status='skipped';log(s,`已跳过第${j.index}首；即梦中已经提交的生成任务仍由平台处理`);
    }
    if(msg.action==='download'){
      if(!j.outputs?.length)throw Error('尚未找到音乐结果');
      if(s.pendingDownload?.jobId===j.id){const p=s.pendingDownload;
        if(p.downloadId){const item=(await chrome.downloads.search({id:p.downloadId}))[0];if(item?.state==='in_progress')throw Error('当前下载仍在进行，请先在浏览器下载列表中处理');if(item?.state==='complete'&&isAudioDownload(item)&&item.fileSize!==0){j.status='downloading';s.batch.status='running';await save(s);return {};}}
        s.pendingDownload=null;
      }
      const latest=await page(s,'PAGE_SCAN',{job:{title:j.title,marker:j.prompt?.includes(j.marker)?j.marker:''}});
      if(latest.blocker)throw Error(latest.blocker);
      j.outputs=j.outputs.map(o=>{const exact=latest.outputs.find(n=>n.key===o.key);if(exact)return exact;const byRecord=latest.outputs.filter(n=>n.record===o.record);return byRecord.length===1?{...byRecord[0],key:o.key}:o;});
      j.downloads=j.downloads.filter(d=>d.state==='complete');j.status='downloading';
    }
    await save(s);return {};
  }
  if(msg.type==='PICK'){
    if(s.batch?.status==='running')throw Error('先暂停队列再绑定页面');
    await chrome.tabs.update(s.tabId,{active:true});return page(s,'PAGE_PICK',{field:msg.field});
  }
  if(msg.type==='BINDING'){
    if(sender.tab?.id!==s.tabId)throw Error('请从已连接的即梦标签页绑定');
    if(!Object.keys(C.DEFAULT_SETTINGS.adapter).includes(msg.field))throw Error('未知绑定项目');
    s.settings.adapter[msg.field]=String(msg.selector||'');
    const j=s.batch&&C.actionable(s.batch);
    if(msg.field==='card'&&j&&['waiting','uncertain','submitting'].includes(j.status)){
      j.manualRecord=msg.pickedRecord;j.baseline=[];j.baselineRecords=(msg.records||[]).filter(x=>x!==msg.pickedRecord);j.documentId=msg.documentId;j.needsRebind=false;j.observedKeys='';j.status='waiting';
      log(s,`已将手动选择的结果卡片关联到第${j.index}首`);
    }
    await save(s);return {};
  }
  if(msg.type==='SHOW_FILE'){
    const owned=[...(s.batch?.jobs||[]),...s.history.flatMap(b=>b.jobs)].flatMap(j=>j.downloads||[]).some(d=>d.id===msg.id);
    if(!owned)throw Error('下载不属于本工具记录');await chrome.downloads.show(msg.id);return {};
  }
  if(msg.type==='DOWNLOADS'){await chrome.tabs.create({url:'chrome://downloads/'});return {};}
  throw Error('未知命令');
}
chrome.runtime.onMessage.addListener((msg,sender,respond)=>{
  const pageOnly=new Set(['BINDING','PULSE']);
  const fromSite=sender.url?.startsWith('https://jimeng.jianying.com/');
  if(fromSite && !pageOnly.has(msg?.type)){respond({ok:false,error:'此命令仅限工作台'});return;}
  locked(()=>handle(msg,sender)).then(data=>respond({ok:true,data})).catch(e=>respond({ok:false,error:e.message}));return true;
});
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:chrome.runtime.getURL('studio.html')}));
async function alarm(){await chrome.alarms.create('jm-queue',{periodInMinutes:0.5});}
chrome.runtime.onInstalled.addListener(()=>{alarm();chrome.tabs.create({url:chrome.runtime.getURL('studio.html')});});
chrome.runtime.onStartup.addListener(()=>locked(async()=>{
  await alarm();const s=await load();if(s.batch?.status==='running'){pause(s,'浏览器已重启。请重新连接即梦页面并继续；正在提交的任务须人工核对。');await save(s);}
}));
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='jm-queue')locked(tick);});
// Only the active, short-lived download intent may rename a site-initiated audio download.
chrome.downloads.onDeterminingFilename.addListener((item,suggest)=>{
  (async()=>{
    const s=await load(),p=s.pendingDownload;
    if(!C.downloadMatches(item,p,chrome.runtime.id)||p.downloadId&&p.downloadId!==item.id){suggest();return;}
    const ext=C.fileExt(item.filename,item.mime)||C.fileExt(item.url,item.mime);
    if(!ext){suggest();return;}
    // Suggest outside the queue lock: downloads.download may wait for this callback.
    suggest({filename:p.stem+'.'+ext,conflictAction:'uniquify'});
    locked(async()=>{
      const current=await load(),intent=current.pendingDownload;
      if(!intent||intent.jobId!==p.jobId||intent.key!==p.key||intent.startedAt!==p.startedAt)return;
      if(intent.downloadId&&intent.downloadId!==item.id)return;
      const j=current.batch?.jobs.find(j=>j.id===p.jobId),rec=j?.downloads.find(d=>d.key===p.key);
      if(!rec)return;rec.id=item.id;rec.state='in_progress';intent.downloadId=item.id;await save(current);
    });
  })().catch(()=>suggest());return true;
});
chrome.downloads.onChanged.addListener(d=>{if(d.state||d.error)locked(tick);});
