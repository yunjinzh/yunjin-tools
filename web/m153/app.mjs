import {taskPolicy,sameSettings,restoration,retryLabel,serverPhase,registerStateTools} from './workflow.mjs';
import {inspect,extract,encode,warnings,findFrame,sleep} from './engine.mjs';
import {makeStage,study,backgrounds} from './figure.mjs';
const $=id=>document.getElementById(id);
const fmt=t=>{t=Math.max(0,t||0);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');};
const exact=t=>{const cs=Math.round(Math.max(0,t||0)*100);return fmt(cs/100)+'.'+String(cs%100).padStart(2,'0');};
let job=null,meta=null,motion=null,stage=null,art=null,blobUrl='',srcUrl='',controller=null,work=null,take=null,cacheOK=true;
let server=false,remoteId='',remoteData=null,tick=0,at=0,mode='idle',studyPlaying=false,studyTime=0,restoreToken=0;
let trackingState='waiting',agentInterface='page';
let exportedSettings=null,choiceCount=0,revision=0,playGeneration=0,playback='idle',sampleRequest=0,progressValue=null;
const renderVersion='atelier-2';
let previousLook=false;
let taskRef='',storageOwner=null,configurationReady;
function policy(){return taskPolicy(mode,{hasJob:!!job,hasMotion:!!motion?.complete,hasResult:!!exportedSettings,previousLook,remote:server});}
function showSnapshot(){if($('stateInspector')?.open)$('stateInfo').textContent=JSON.stringify(snapshot(),null,2);}
function expose(){
  const main=$('workspace'),p=policy();
  main.dataset.task=taskRef;main.dataset.backend=p.worker;main.dataset.downloadReady=String(p.download);main.dataset.actions=p.actions.join(' ');
  main.dataset.phase=mode;main.dataset.playback=playback;main.dataset.revision=String(revision);
  $('jobpanel').dataset.phase=mode;
  $('progress').setAttribute('aria-label','任务完成进度');
  $('retry').dataset.action=p.retry||'';$('cancel').dataset.action='pause';$('download').dataset.action='download';showSnapshot();
}
function snapshot(){const p=policy();return {schema:1,task:taskRef,revision,phase:mode,worker:p.worker,agentInterface,
    playback,progress:progressValue,duration:meta?.duration??remoteData?.duration??null,time:at,
    checkpoint:motion?.complete?'complete':motion?.frames?.length?'partial':'none',
    persistence:cacheOK?'available':'unavailable',candidates:choiceCount,downloadReady:p.download,
    renderVersion,previousLook,settings:cfg(),resultSettings:exportedSettings?{...exportedSettings}:null,tracking:trackingState,warningSegments:document.getElementById('issues').childElementCount,
    actions:p.actions};}
const phaseNames={missing:'未跟踪到',low:'局部遮挡',fill:'短暂补间'};
const cfg=()=>({bg:$('bg').value,size:+$('size').value,audio:$('audio').checked});
const configUI=s=>{$('bg').value=s.bg;$('size').value=s.size;$('audio').checked=s.audio;chip();};
function chip(){$('colorchip').style.background=backgrounds[$('bg').value];}
const db=new Promise(resolve=>{try{const r=indexedDB.open('motion-atelier-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);}catch{resolve(null);}});
function storageUnavailable(){cacheOK=false;$('runtime').textContent=server?'服务端处理 · 本浏览器无法记住最近任务':'本机存储不可用 · 关闭页面前请下载';}
async function cache(rows,remove=[],{claim=false,expected=storageOwner}={}){
  const d=await db;if(!d){storageUnavailable();return false;}
  return new Promise(resolve=>{
    let ok=true;
    const tx=d.transaction('current','readwrite'),s=tx.objectStore('current');
    const get=s.get('owner');
    get.onsuccess=()=>{
      if(!claim && (get.result??null)!==expected){ok=false;if(expected===storageOwner&&job)$('runtime').textContent='另一标签页已接管最近任务 · 本页仍可完成并下载';return;}
      for(const k of remove)s.delete(k);
      for(const [k,v] of rows)s.put(v,k);
    };
    tx.oncomplete=()=>resolve(ok);tx.onerror=tx.onabort=()=>{storageUnavailable();resolve(false);};
  });
}
async function readSaved(){
  const keys=['job','settings','motion','result','remote','paused','failure','draft','owner'];
  const d=await db;if(!d){storageUnavailable();return {};}
  return new Promise(resolve=>{const tx=d.transaction('current'),store=tx.objectStore('current'),data={};
    for(const k of keys){const r=store.get(k);r.onsuccess=()=>{data[k]=r.result;};}
    tx.oncomplete=()=>resolve(data);tx.onerror=tx.onabort=()=>{storageUnavailable();resolve({});};
  });
}
const controls=(enabled)=>{for(const k of ['seek','prev','next','rate','play'])$(k).disabled=!enabled;};
function status(value,title,detail,p){
  if(mode!==value)revision++;
  mode=value;progressValue=p;const rules=policy();
  $('jobpanel').hidden=false;$('status').textContent=title;$('detail').textContent=detail;
  $('percent').textContent=p==null?'':Math.round(p*100)+'%';$('progress').hidden=p==null;$('progress').value=p??0;
  $('download').hidden=!rules.download;$('retry').hidden=!rules.retry;$('retry').textContent=previousLook&&value==='ready'?'用新版白模重新导出':retryLabel[rules.retry]||'重试';
  $('cancel').hidden=!rules.pause;lockInputs(!rules.settings);
  if(job){controls(rules.preview);if(!rules.preview && !$('result').paused)pause();
    for(const mark of $('issues').querySelectorAll('button'))mark.disabled=!rules.preview;}
  $('monitorlabel').textContent=({read:'文件检查',loading:'准备识别',extract:'动作提取',export:'视频导出',verify:'成片校验',ready:'同步对照',
    changed:'上次导出预览',failed:'任务提示',pause:'已暂停',remote:'服务端处理',choose:'等待选人',
    upload:'上传中',queued:'已排队',disconnected:'连接中断',expired:'服务端文件已到期',pausing:'正在暂停'})[value]||title;
  expose();
}
function release(){
  pause();previousLook=false;trackingState='waiting';exportedSettings=null;remoteData=null;playback='idle';for(const id of ['original','result']){const v=$(id);v.pause();v.removeAttribute('src');v.load();}
  for(const u of [srcUrl,blobUrl])if(u)URL.revokeObjectURL(u);srcUrl=blobUrl='';meta?.input?.dispose();meta=null;stage?.dispose();stage=null;at=0;$('issues').replaceChildren();$('play').innerHTML='<span>▶</span>';controls(false);
}
function emptyArt(){
  if(!art)try{art=makeStage($('art'),960,490,{transparent:true,figures:3});}catch{$('monitorlabel').textContent='设备无法显示三维预览，请尝试服务器版';}
  const draw=(s=0)=>art?.draw([study(s-1.1,.245,960/490,.91),study(s+1.3,.51,960/490,1.04),study(s+3.1,.765,960/490,.93)]);
  draw(studyTime);return draw;
}
function openPair(name){
  $('study').hidden=true;$('pair').hidden=false;$('result').hidden=true;$('live').hidden=false;$('liveOriginal').hidden=false;$('jobname').textContent=name;$('clock').textContent='00:00';$('seek').value=0;controls(false);
  if(art){art.dispose();art=null;}
}
function stageAt(w,h){if(stage)return stage;const s=Math.min(1,500/Math.max(w,h));return stage=makeStage($('live'),Math.max(2,Math.round(w*s)),Math.max(2,Math.round(h*s)));}
function issuesView(data){const el=$('issues');el.replaceChildren();for(const g of data){const b=document.createElement('button');b.textContent=fmt(g.start)+'–'+exact(g.end)+' '+phaseNames[g.reason];b.title='查看此时的原片与白模';b.onclick=()=>seek(g.start);el.append(b);}}
function readyPlayback(file,size,settings=cfg(),version){
  previousLook=version!==renderVersion;
  exportedSettings={...settings};playback='paused';
  const url=typeof file==='string'?file:URL.createObjectURL(file);if(blobUrl)URL.revokeObjectURL(blobUrl);if(typeof file!=='string')blobUrl=url;
  $('result').src=url;$('result').load();$('result').hidden=false;$('live').hidden=true;$('liveOriginal').hidden=true;$('download').href=typeof file==='string'?file+'?download=1':url;
  $('download').download=(job?.name||'动作').replace(/\.[^.]+$/,'')+'-白模.mp4';
  const issue=remoteId?remoteData.issues||[]:warnings(motion.frames);issuesView(issue);const duration=meta?.duration??remoteData.duration;
  status('ready','白模视频已就绪',fmt(duration)+' · H.264 MP4 · '+(size/1048576).toFixed(2)+' MB'+(issue.length?' · 可在下方查看待核对片段。':' · 可播放、逐帧对照或直接下载。'),1);
  $('seek').max=duration;controls(true);seek(0);$('download').removeAttribute('aria-disabled');
}
function choose(canvas,boxes,t){controller.signal.throwIfAborted();choiceCount=boxes.length;status('choose','请选择跟踪人物','在预览图中点选要跟踪的人物。',progressValue);return new Promise((ok,no)=>{const d=$('picker'),image=$('pickImage');image.querySelectorAll('button').forEach(b=>b.remove());$('pickBtns').replaceChildren();
  image.querySelector('img').src=typeof canvas==='string'?canvas:canvas.toDataURL('image/jpeg',.85);
  function finish(index){take=null;choiceCount=0;d.close();index<0?no(new DOMException('停止任务','AbortError')):ok(index);}take=finish;
  boxes.forEach(([x,y,x2,y2],i)=>{const box=document.createElement('button');box.style.cssText='left:'+100*x+'%;top:'+100*y+'%;width:'+100*(x2-x)+'%;height:'+100*(y2-y)+'%';box.textContent=i+1;box.ariaLabel='跟踪人物 '+(i+1);box.onclick=()=>finish(i);image.append(box);
    const b=document.createElement('button');b.className='secondary';b.textContent='人物 '+(i+1);b.onclick=()=>finish(i);$('pickBtns').append(b);});d.showModal();});}
$('pickCancel').onclick=()=>requestPause();$('picker').oncancel=e=>{e.preventDefault();$('pickCancel').click();};
async function processLocal(){
  const signal=controller.signal;await cache([['draft',false]],['paused','failure']);const save=async state=>{signal.throwIfAborted();await cache([['motion',state]]);};
  try{
    if(!meta){status('read','正在检查视频','检查视频轨道、画幅与时间戳。',0);meta=await inspect(job.file);}
    signal.throwIfAborted();if(meta.duration>600)throw Error('本机版单段支持 10 分钟以内。请截取需要的动作片段。');
    $('seek').max=meta.duration;
    if(!motion.complete){
      status('loading','正在载入动作识别器','首次使用将载入识别模型。导入的视频仅在本机处理。',.01);
      stageAt(meta.w,meta.h);
      await extract(meta,job.file,motion,{signal,choose,checkpoint:save,preview(f,canvas){
        const c=$('liveOriginal');at=f.t;trackingState=f.q||'tracked';if(c.width!==canvas.width||c.height!==canvas.height){c.width=canvas.width;c.height=canvas.height;}c.getContext('2d').drawImage(canvas,0,0);$('liveOriginal').hidden=false;stage.draw([f.p],cfg().bg);$('clock').textContent=fmt(f.t);$('seek').value=f.t;
        status('extract','正在提取人物动作',fmt(f.t)+' / '+fmt(meta.duration)+' · '+(f.p?'已识别目标人物，正在按原片时间轴生成白模。':'正在寻找目标人物。'),.04+.65*f.t/meta.duration);}});
    }
    signal.throwIfAborted();$('liveOriginal').hidden=true;const settings=cfg();await cache([['settings',settings]]);
    status('export','正在导出 MP4','动作已保存。正在按原画幅编码和校验成片。',.70);
    const out=await encode(meta,motion,settings,p=>{signal.throwIfAborted();progressValue=.70+.30*p;if(p>=.96 && mode!=='verify')status('verify','正在校验成片','正在核对 MP4 的画幅、时长和音视频轨道。',progressValue);$('progress').value=.70+.30*p;$('percent').textContent=Math.round(70+30*p)+'%';},signal);
    signal.throwIfAborted();await cache([['result',{out,settings,version:renderVersion}]]);signal.throwIfAborted();readyPlayback(out,out.size,settings,renderVersion);
  }catch(e){if(signal.aborted||e.name==='AbortError'){await cache([['motion',motion],['paused',true]]);status('pause','任务已暂停',cacheOK?'已保存当前进度，可继续处理。':'当前页面可继续处理。',null);}
    else{const message=e.message||String(e);await cache([['failure',message],['motion',motion]]);status('failed','处理未完成',message,null);} }
}
async function stop(){controller?.abort();take?.(-1);if(work)await work.catch(()=>{});}
function lockInputs(v){for(const k of ['size','bg','audio'])$(k).disabled=v;}
function run(fn){
  if(work)return work;
  const owner=new AbortController();controller=owner;
  const running=Promise.resolve().then(()=>fn(owner.signal)).finally(()=>{
    if(controller===owner){work=null;controller=null;}
  });
  work=running;return running;
}
async function importFile(file){
  if(!file)return;if(!file.size||file.size>250*1024*1024){$('help').close();alert('请选择大于 0 字节且不超过 250 MB 的视频文件。');return;}
  const revision=++restoreToken;++sampleRequest;
  await configurationReady;
  await stop();if(revision!==restoreToken)return;release();remoteId='';storageOwner=makeUploadKey();taskRef=makeUploadKey();job={name:file.name,file,uploadKey:makeUploadKey()};motion={frames:[],complete:false};openPair(file.name);srcUrl=URL.createObjectURL(file);$('original').src=srcUrl;$('original').load();
  status('preparing','正在读取新文件','正在建立任务记录。',0);await cache([['job',job],['settings',cfg()],['owner',storageOwner]],['motion','result','remote','paused','failure','draft'],{claim:true});
  if(revision!==restoreToken)return;return run(server?startRemote:processLocal);
}
$('file').onchange=e=>{const f=e.target.files[0];e.target.value='';importFile(f);};$('select').onclick=()=>$('file').click();
for(const name of ['dragenter','dragover','dragleave','drop'])$('drop').addEventListener(name,e=>{e.preventDefault();$('drop').classList.toggle('drag',name==='dragover'||name==='dragenter');if(name==='drop')importFile(e.dataTransfer.files[0]);});
$('sample').onclick=async()=>{
  const tag=++sampleRequest,b=$('sample');b.disabled=true;
  try{const response=await fetch('./assets/demo-jumping-jacks.mp4');if(!response.ok)throw Error();
    const file=new File([await response.blob()],'开合跳示例.mp4',{type:'video/mp4'});
    if(tag===sampleRequest)await importFile(file);
  }catch{if(tag===sampleRequest){if(job)$('detail').textContent='示例未载入，当前任务仍保留。';else status('failed','示例读取失败','请重新打开示例，或选择设备上的视频。',null);}}
  finally{b.disabled=false;}
};
async function requestPause(){
  if(!policy().pause)return;
  const token=restoreToken,previous=mode;
  status('pausing','正在暂停任务','正在确认进度。',progressValue);
  if(remoteId){
    const key=remoteId;await stop();
    if(token!==restoreToken)return;
    try{await call('pause',{method:'POST'},key);}catch(e){if(token===restoreToken)observeError(e);return;}
    if(token===restoreToken)run(poll);
  }else{
    await stop();
    if(token===restoreToken && mode==='pausing' && remoteId){try{await call('pause',{method:'POST'});if(token===restoreToken)run(poll);}catch(e){if(token===restoreToken)observeError(e);}return;}
    if(token===restoreToken && mode==='pausing'){
      await cache([['paused',true]]);
      status('pause','任务已暂停',previous==='upload'?'可重新上传原片。':'可继续处理。',null);
    }
  }
}
$('cancel').onclick=requestPause;
function retryTask(){
  const action=policy().retry;if(!action||work)return;
  if(action==='reconnect'){status('remote','正在重新连接','正在查询原任务。',null);run(poll);return;}
  if(action==='upload')remoteId='';
  if(!remoteId){if(action==='retry' && !motion.complete)motion={frames:[],complete:false};
    status('read','正在准备任务','正在读取已保存的任务。',0);run(server?startRemote:processLocal);return;}
  status('remote','正在提交处理请求','正在确认服务端任务。',null);
  run(async signal=>{try{await call('retry',{method:'POST',signal,headers:{'Content-Type':'application/json',...(Number.isInteger(remoteData?.revision)?{'X-Motion-Revision':String(remoteData.revision)}:{})},body:JSON.stringify(cfg())});await poll(signal);}
    catch(e){if(!signal.aborted){if(e.status===409)await poll(signal);else observeError(e);}}});
}
$('retry').onclick=retryTask;
function applyChange(){
  chip();if(!job||!policy().settings)return;
  revision++;const settings=cfg();cache([['settings',settings],['draft',true]]);expose();
  if(!exportedSettings||!['ready','changed'].includes(mode))return;
  pause();
  if(sameSettings(settings,exportedSettings))status('ready','白模视频已就绪','设置与已有成片一致，可直接预览和下载。',1);
  else status('changed','输出设置已更改','当前预览为上次导出。重新导出可应用设置，恢复原设置可直接下载。',null);
}
for(const id of ['size','bg','audio'])$(id).onchange=applyChange;
function pause(){playGeneration++;playback=exportedSettings?'paused':'idle';studyPlaying=false;$('result').pause();$('original').pause();cancelAnimationFrame(tick);$('play').innerHTML='<span>▶</span>';$('play').ariaLabel='播放预览';expose();}
function sync(t){at=t;if(motion?.frames?.length)trackingState=motion.frames[findFrame(motion.frames,t)]?.q||'tracked';else if(remoteData?.issues)trackingState=remoteData.issues.find(i=>i.start<=t&&t<i.end)?.reason||'tracked';$('seek').value=t;$('clock').textContent=exact(t)+' / '+exact(meta?.duration??remoteData?.duration);showSnapshot(); }
function seek(t){pause();const duration=meta?.duration??remoteData?.duration??0;t=Math.min(Math.max(0,t),Math.max(0,duration-.00001));if($('original').src)$('original').currentTime=t;if($('result').getAttribute('src'))$('result').currentTime=t;sync(t);}
$('seek').oninput=e=>seek(+e.target.value);$('rate').onchange=()=>{for(const id of ['result','original'])$(id).playbackRate=+$('rate').value;};
for(const [id,dir] of [['prev',-1],['next',1]])$(id).onclick=()=>{const ff=motion?.frames;if(ff?.length)seek(ff[Math.max(0,Math.min(ff.length-1,findFrame(ff,at)+dir))].t);else if(remoteData?.times?.length){const times=remoteData.times;let i=times.findIndex(t=>t>at+.00001);if(i<0)i=times.length;seek(times[Math.max(0,Math.min(times.length-1,i-1+dir))]);}else seek(at+dir/(meta?.fps||remoteData?.fps||30));};
$('play').onclick=async()=>{
  if(!$('study').hidden){if(studyPlaying){pause();return;}studyPlaying=true;playback='playing';expose();$('play').ariaLabel='暂停预览';$('play').textContent='Ⅱ';const draw=emptyArt();let then=performance.now();function animate(now){if(!studyPlaying)return;studyTime+=(now-then)/1000*3*(+$('rate').value);then=now;draw(studyTime);tick=requestAnimationFrame(animate);}tick=requestAnimationFrame(animate);return;}
  const v=$('result'),o=$('original');if(!v.paused){pause();return;}if(v.ended||v.currentTime>=v.duration-.015)seek(0);
  v.muted=false;o.muted=true;v.playbackRate=o.playbackRate=+$('rate').value;
  const generation=++playGeneration;playback='starting';expose();
  try{await v.play();if(generation!==playGeneration)return;playback='playing';expose();o.currentTime=v.currentTime;o.play().catch(()=>{});$('play').textContent='Ⅱ';$('play').ariaLabel='暂停预览';
    function loop(){if(v.paused)return;if(Math.abs(o.currentTime-v.currentTime)>.075)o.currentTime=v.currentTime;sync(v.currentTime);tick=requestAnimationFrame(loop);}loop();
  }catch{if(generation!==playGeneration)return;pause();playback='error';expose();$('detail').textContent='浏览器未能播放预览。可下载 MP4 在本地播放器中查看。';}
};
$('result').onended=()=>{sync($('result').duration);pause();playback='ended';expose();};
$('stateInspector').ontoggle=showSnapshot;
$('helpBtn').onclick=()=>$('help').showModal();$('help').querySelector('.close').onclick=()=>$('help').close();
$('clear').onclick=async()=>{
  const token=++restoreToken;++sampleRequest;
  const key=remoteId;await stop();if(token!==restoreToken)return;
  status('clearing','正在清除最近任务','正在清理已保存的任务记录。',null);
  if(key&&server){try{await call('delete',{method:'POST'},key);}catch(e){if(e.status!==404){if(token===restoreToken){$('help').close();observeError(e);}return;}}}
  if(token!==restoreToken)return;
  await cache([],['job','motion','settings','result','remote','paused','failure','draft','owner']);
  if(token===restoreToken){release();location.reload();}
};
async function call(which,opts,key=remoteId){
  const r=await fetch('./api/jobs/'+key+'/'+which,opts);
  if(!r.ok){const e=Error((await r.text()).slice(0,200)||'服务端请求失败');e.status=r.status;throw e;}
  return r.json();
}
function observeError(e){
  if(e.status===404){status('expired','服务端任务已到期','可用当前浏览器保存的原片重新上传。',null);return;}
  status('disconnected','暂时无法确认任务状态','连接恢复后可查询同一任务。'+(e.message?' '+e.message:''),null);
}
function makeUploadKey(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');}
async function startRemote(signal){
  try{
    status('upload','正在上传至处理服务器','上传完成后可关闭页面，任务在后台继续。',0);
    if(!job.uploadKey){job.uploadKey=makeUploadKey();await cache([['job',job]]);}
    const key=await new Promise((ok,no)=>{signal.throwIfAborted();const x=new XMLHttpRequest();
      x.open('POST','./api/jobs?name='+encodeURIComponent(job.name)+'&size='+cfg().size+'&bg='+cfg().bg+'&audio='+(cfg().audio?'1':'0'));
      x.setRequestHeader('Content-Type','application/octet-stream');x.setRequestHeader('X-Motion-Upload',job.uploadKey);
      x.upload.onprogress=e=>{if(e.lengthComputable){progressValue=e.loaded/e.total;$('progress').value=progressValue;$('percent').textContent=Math.round(progressValue*100)+'%';}};
      x.onload=()=>{try{if(x.status!==201)throw Error(x.responseText||'上传失败');ok(JSON.parse(x.responseText).id);}catch(e){no(e);}};
      x.onerror=()=>no(Error('上传连接中断，请重试。'));x.onabort=()=>no(new DOMException('已取消','AbortError'));
      signal.addEventListener('abort',()=>x.abort(),{once:true});x.send(job.file);
    });
    remoteId=key;await cache([['remote',key]],['paused','failure']);await poll(signal);
  }catch(e){if(!signal.aborted)status('failed','上传未完成',e.message,null);}
}
async function poll(signal){
  let failures=0,lastPreview='';const key=remoteId;
  while(!signal.aborted){try{
    const d=await call('status',{signal},key);signal.throwIfAborted();remoteData=d;
    const phase=d.pause_requested&&['queued','running'].includes(d.state)?'pausing':serverPhase(d.state,d.stage);
    if(phase==='ready'){
      readyPlayback('./api/jobs/'+key+'/output',d.bytes,d.settings,d.renderVersion);
      if(d.updated)$('detail').textContent+=' 可下载至 '+new Date((d.updated+86400)*1000).toLocaleString('zh-CN')+'。';
      if(!sameSettings(cfg(),d.settings))applyChange();return;
    }
    if(phase==='failed'||phase==='pause'){status(phase,phase==='pause'?'任务已暂停':'处理未完成',d.message,null);return;}
    if(phase==='choose'){
      const idx=await choose('./api/jobs/'+key+'/choice.jpg?v='+d.choiceNo,d.boxes,d.time);
      signal.throwIfAborted();await call('choice',{method:'POST',signal,headers:{'X-Choice-Version':String(d.choiceNo)},body:String(idx)},key);
      status('remote','已选定人物','正在跟踪所选人物。',d.progress??0);
    }else status(phase,phase==='pausing'?'正在暂停任务':d.title||'正在处理',d.message||'关闭页面后，后台任务继续。',d.progress??0);
    if(d.preview && d.preview!==lastPreview && phase!=='choose'){
      lastPreview=d.preview;const serial=lastPreview,img=new Image();img.onload=()=>{
        if(signal.aborted||key!==remoteId||serial!==lastPreview||!policy().busy)return;
        const c=$('live');c.width=img.width;c.height=img.height;c.getContext('2d')?.drawImage(img,0,0);
        $('liveOriginal').hidden=true;$('original').currentTime=d.time||0;
      };img.src='./api/jobs/'+key+'/preview.jpg?v='+serial;
    }
    failures=0;
  }catch(e){if(signal.aborted||e.name==='AbortError')return;if(e.status===404||++failures>=4){observeError(e);return;}}
    await sleep(600);
  }
}
async function configureRuntime(){
  try{const r=await fetch('./server-mode.json',{cache:'no-store'});if(r.ok)server=(await r.json()).background===true;}catch{}
  if(server){$('serverDownload').hidden=true;$('runtime').textContent='服务端处理 · 关闭页面后继续';$('helpstorage').textContent='服务端任务在页面关闭后继续。任务和成片在完成后保留 24 小时。同一浏览器重新打开可继续查看。';}
}
async function init(){
  const token=restoreToken;chip();emptyArt();expose();await configurationReady;
  const saved=await readSaved();if(token!==restoreToken||!saved.job)return;
  // Claim only the snapshot actually read. An older tab may continue to view
  // its own result but cannot overwrite a later tab's task or checkpoint.
  const owner=makeUploadKey();const claimed=await cache([['owner',owner]],[],{expected:saved.owner??null});
  if(token!==restoreToken||(!claimed&&cacheOK))return;
  storageOwner=owner;taskRef=makeUploadKey();job=saved.job;motion=saved.motion||{frames:[],complete:false};
  if(saved.settings)configUI(saved.settings);
  openPair(job.name);srcUrl=URL.createObjectURL(job.file);$('original').src=srcUrl;
  if(server&&saved.remote){remoteId=saved.remote;status('remote','正在恢复服务端任务','正在查询已有任务。',null);run(poll);return;}
  let restoredMeta;
  try{restoredMeta=await inspect(job.file);}catch{}
  if(token!==restoreToken){restoredMeta?.input.dispose();return;}meta=restoredMeta;
  const next=restoration({...saved,settings:cfg()});
  if(meta && saved.result?.out && motion.complete){readyPlayback(saved.result.out,saved.result.out.size,saved.result.settings,saved.result.version);}
  if(next==='ready'&&meta)return;
  if(next==='changed'&&meta){applyChange();return;}
  if(next==='pause'){status('pause','任务已暂停','已恢复最近任务，可继续处理。',null);return;}
  if(next==='failed'){status('failed','处理未完成',saved.failure,null);return;}
  run(server?startRemote:processLocal);
}
registerStateTools(document.modelContext??navigator.modelContext,snapshot,async(action,value)=>{
  if(action==='choose'){if(!take)throw Error('选人窗口已关闭。');take(value-1);await sleep(0);}
  else if(action==='seek')seek(value);
  else if(action==='pause')await requestPause();
  else{retryTask();await sleep(0);}
}).then(registered=>{agentInterface=registered?'webmcp':'page';expose();});
configurationReady=configureRuntime();
init().catch(e=>status('failed','工作台未能启动',e.message,null));
