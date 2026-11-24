import {inspect,extract,encode,warnings,findFrame,sleep} from './engine.mjs';
import {makeStage,study,backgrounds} from './figure.mjs';
const $=id=>document.getElementById(id);
const fmt=t=>{t=Math.max(0,t||0);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');};
const exact=t=>{const cs=Math.round(Math.max(0,t||0)*100);return fmt(cs/100)+'.'+String(cs%100).padStart(2,'0');};
let job=null,meta=null,motion=null,stage=null,art=null,blobUrl='',srcUrl='',controller=null,work=null,take=null,cacheOK=true;
let server=false,remoteId='',remoteData=null,tick=0,at=0,mode='idle',studyPlaying=false,studyTime=0,restoreToken=0;
const phaseNames={missing:'未跟踪到',low:'局部遮挡',fill:'短暂补间'};
const cfg=()=>({bg:$('bg').value,size:+$('size').value,audio:$('audio').checked});
const configUI=s=>{$('bg').value=s.bg;$('size').value=s.size;$('audio').checked=s.audio;chip();};
function chip(){$('colorchip').style.background=backgrounds[$('bg').value];}
const db=new Promise(resolve=>{try{const r=indexedDB.open('motion-atelier-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);}catch{resolve(null);}});
async function cache(rows,remove=[]){const d=await db;if(!d){cacheOK=false;return;}try{await new Promise((ok,no)=>{const tx=d.transaction('current','readwrite'),s=tx.objectStore('current');for(const k of remove)s.delete(k);for(const [k,v] of rows)s.put(v,k);tx.oncomplete=ok;tx.onerror=tx.onabort=()=>no(tx.error);});}catch{cacheOK=false;$('runtime').textContent='本机处理 · 存储空间不足，关闭页面前请下载';}}
async function read(k){const d=await db;if(!d)return null;return new Promise(ok=>{let r=d.transaction('current').objectStore('current').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);});}
const controls=(enabled)=>{for(const k of ['seek','prev','next','rate','play'])$(k).disabled=!enabled;};
function status(value,title,detail,p,options={}){
  mode=value;$('jobpanel').hidden=false;$('status').textContent=title;$('detail').textContent=detail;$('percent').textContent=p==null?'':Math.round(p*100)+'%';$('progress').hidden=p==null;$('progress').value=p??0;
  $('download').hidden=!options.download;$('retry').hidden=!options.retry;$('retry').textContent=options.retry||'重试';$('cancel').hidden=!options.cancel;$('monitorlabel').textContent=({read:'文件检查',loading:'准备识别',extract:'动作提取',export:'视频导出',ready:'同步对照',changed:'待导出',failed:'任务提示',pause:'已暂停',remote:'服务端处理'})[value]||title;
}
function release(){
  cancelAnimationFrame(tick);studyPlaying=false;for(const id of ['original','result']){const v=$(id);v.pause();v.removeAttribute('src');v.load();}
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
function readyPlayback(file,size){
  const url=typeof file==='string'?file:URL.createObjectURL(file);if(blobUrl)URL.revokeObjectURL(blobUrl);if(typeof file!=='string')blobUrl=url;
  $('result').src=url;$('result').load();$('result').hidden=false;$('live').hidden=true;$('liveOriginal').hidden=true;$('download').href=typeof file==='string'?file+'?download=1':url;
  $('download').download=(job?.name||'动作').replace(/\.[^.]+$/,'')+'-白模.mp4';
  const issue=remoteId?remoteData.issues||[]:warnings(motion.frames);issuesView(issue);const duration=meta?.duration??remoteData.duration;
  status('ready','白模视频已就绪',fmt(duration)+' · H.264 MP4 · '+(size/1048576).toFixed(2)+' MB'+(issue.length?' · 可在下方查看待核对片段。':' · 可播放、逐帧对照或直接下载。'),1,{download:true});
  $('seek').max=duration;controls(true);seek(0);$('download').removeAttribute('aria-disabled');
}
function choose(canvas,boxes,t){return new Promise((ok,no)=>{const d=$('picker'),image=$('pickImage');image.querySelectorAll('button').forEach(b=>b.remove());$('pickBtns').replaceChildren();
  image.querySelector('img').src=typeof canvas==='string'?canvas:canvas.toDataURL('image/jpeg',.85);
  function finish(index){take=null;d.close();index<0?no(new DOMException('停止任务','AbortError')):ok(index);}take=finish;
  boxes.forEach(([x,y,x2,y2],i)=>{const box=document.createElement('button');box.style.cssText='left:'+100*x+'%;top:'+100*y+'%;width:'+100*(x2-x)+'%;height:'+100*(y2-y)+'%';box.textContent=i+1;box.ariaLabel='跟踪人物 '+(i+1);box.onclick=()=>finish(i);image.append(box);
    const b=document.createElement('button');b.className='secondary';b.textContent='人物 '+(i+1);b.onclick=()=>finish(i);$('pickBtns').append(b);});d.showModal();});}
$('pickCancel').onclick=()=>{take?.(-1);controller?.abort();};$('picker').oncancel=e=>{e.preventDefault();$('pickCancel').click();};
async function processLocal(){
  const signal=controller.signal;await cache([],['paused']);const save=async state=>{signal.throwIfAborted();await cache([['motion',state]]);};
  try{
    if(!meta){status('read','正在检查视频','检查视频轨道、画幅与时间戳。',0,{cancel:true});meta=await inspect(job.file);}
    signal.throwIfAborted();if(meta.duration>600)throw Error('本机版单段支持 10 分钟以内。请截取需要的动作片段。');
    $('seek').max=meta.duration;
    if(!motion.complete){
      status('loading','正在载入动作识别器','首次使用将载入识别模型。导入的视频仅在本机处理。',.01,{cancel:true});
      stageAt(meta.w,meta.h);
      await extract(meta,job.file,motion,{signal,choose,checkpoint:save,preview(f,canvas){
        const c=$('liveOriginal');if(c.width!==canvas.width||c.height!==canvas.height){c.width=canvas.width;c.height=canvas.height;}c.getContext('2d').drawImage(canvas,0,0);$('liveOriginal').hidden=false;stage.draw([f.p],cfg().bg);$('clock').textContent=fmt(f.t);$('seek').value=f.t;
        status('extract','正在提取人物动作',fmt(f.t)+' / '+fmt(meta.duration)+' · '+(f.p?'已识别目标人物，正在按原片时间轴生成白模。':'正在寻找目标人物。'),.04+.65*f.t/meta.duration,{cancel:true});}});
    }
    signal.throwIfAborted();$('liveOriginal').hidden=true;const settings=cfg();await cache([['settings',settings]]);
    status('export','正在导出 MP4','动作已保存。正在按原画幅编码和校验成片。',.70,{cancel:true});
    const out=await encode(meta,motion,settings,p=>{signal.throwIfAborted();$('progress').value=.70+.30*p;$('percent').textContent=Math.round(70+30*p)+'%';},signal);
    signal.throwIfAborted();await cache([['result',{out,settings}]]);readyPlayback(out,out.size);
  }catch(e){if(signal.aborted||e.name==='AbortError'){await cache([['motion',motion],['paused',true]]);status('pause','任务已暂停',cacheOK?'已保存当前进度，可继续处理。':'当前页面可继续处理。',null,{retry:'继续处理'});}
    else{status('failed','处理未完成',e.message||String(e),null,{retry:motion.complete?'重试导出':'重新处理'});} }
}
async function stop(){controller?.abort();take?.(-1);if(work)await work.catch(()=>{});}
function lockInputs(v){for(const k of ['size','bg','audio'])$(k).disabled=v;}
function run(fn){controller=new AbortController();lockInputs(true);work=fn().finally(()=>lockInputs(false));return work;}
async function importFile(file){
  if(!file)return;const revision=++restoreToken;if(file.size>250*1024*1024||!file.size){$('help').close();alert('请选择大于 0 字节且不超过 250 MB 的视频文件。');return;}
  await stop();if(revision!==restoreToken)return;release();remoteId='';job={name:file.name,file};motion={frames:[],complete:false};openPair(file.name);srcUrl=URL.createObjectURL(file);$('original').src=srcUrl;$('original').load();
  await cache([['job',job],['settings',cfg()]],['motion','result','remote','paused']);
  if(revision!==restoreToken)return;return run(server?startRemote:processLocal);
}
$('file').onchange=e=>{const f=e.target.files[0];e.target.value='';importFile(f);};$('select').onclick=()=>$('file').click();
for(const name of ['dragenter','dragover','dragleave','drop'])$('drop').addEventListener(name,e=>{e.preventDefault();$('drop').classList.toggle('drag',name==='dragover'||name==='dragenter');if(name==='drop')importFile(e.dataTransfer.files[0]);});
$('sample').onclick=async()=>{const b=$('sample');b.disabled=true;try{const r=await fetch('./assets/demo-jumping-jacks.mp4');if(!r.ok)throw Error();const f=new File([await r.blob()],'开合跳示例.mp4',{type:'video/mp4'});await importFile(f);}catch{status('failed','示例读取失败','请重新打开示例，或选择设备上的视频。',null);}finally{b.disabled=false;}};
$('cancel').onclick=async()=>{if(remoteId){await call('pause',{method:'POST'}).catch(()=>{});}await stop();if(remoteId)status('pause','任务已暂停','可继续处理并复用已完成的动作。',null,{retry:'继续处理'});};
$('retry').onclick=async()=>{if(work)await work;return run(remoteId?async()=>{try{await call('retry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg())});await poll();}catch(e){remoteError(e);}}:(server?startRemote:processLocal));};
function applyChange(){chip();if(!job||!['ready','changed','failed','pause'].includes(mode))return;cache([['settings',cfg()]]);if(mode==='ready'||mode==='changed'){pause();status('changed','输出设置已更改','已提取的动作可以直接复用。重新导出后即可下载新版本。',null,{retry:'重新导出 MP4'});}}
for(const id of ['size','bg','audio'])$(id).onchange=applyChange;
function pause(){studyPlaying=false;$('result').pause();$('original').pause();cancelAnimationFrame(tick);$('play').innerHTML='<span>▶</span>';$('play').ariaLabel='播放预览';}
function sync(t){at=t;$('seek').value=t;$('clock').textContent=exact(t)+' / '+exact(meta?.duration??remoteData?.duration); }
function seek(t){pause();const duration=meta?.duration??remoteData?.duration??0;t=Math.min(Math.max(0,t),Math.max(0,duration-.00001));if($('original').src)$('original').currentTime=t;if($('result').getAttribute('src'))$('result').currentTime=t;sync(t);}
$('seek').oninput=e=>seek(+e.target.value);$('rate').onchange=()=>{for(const id of ['result','original'])$(id).playbackRate=+$('rate').value;};
for(const [id,dir] of [['prev',-1],['next',1]])$(id).onclick=()=>{const ff=motion?.frames;if(ff?.length)seek(ff[Math.max(0,Math.min(ff.length-1,findFrame(ff,at)+dir))].t);else if(remoteData?.times?.length){const times=remoteData.times;let i=times.findIndex(t=>t>at+.00001);if(i<0)i=times.length;seek(times[Math.max(0,Math.min(times.length-1,i-1+dir))]);}else seek(at+dir/(meta?.fps||remoteData?.fps||30));};
$('play').onclick=async()=>{
  if(!$('study').hidden){if(studyPlaying){pause();return;}studyPlaying=true;$('play').textContent='Ⅱ';const draw=emptyArt();let then=performance.now();function animate(now){if(!studyPlaying)return;studyTime+=(now-then)/1000*3*(+$('rate').value);then=now;draw(studyTime);tick=requestAnimationFrame(animate);}tick=requestAnimationFrame(animate);return;}
  const v=$('result'),o=$('original');if(!v.paused){pause();return;}if(v.ended||v.currentTime>=v.duration-.015)seek(0);
  v.muted=false;o.muted=true;v.playbackRate=o.playbackRate=+$('rate').value;
  try{await v.play();o.currentTime=v.currentTime;o.play().catch(()=>{});$('play').textContent='Ⅱ';$('play').ariaLabel='暂停预览';
    function loop(){if(v.paused)return;if(Math.abs(o.currentTime-v.currentTime)>.075)o.currentTime=v.currentTime;sync(v.currentTime);tick=requestAnimationFrame(loop);}loop();
  }catch{pause();$('detail').textContent='浏览器未能播放预览。可下载 MP4 在本地播放器中查看。';}
};
$('result').onended=()=>{sync($('result').duration);pause();};
$('helpBtn').onclick=()=>$('help').showModal();$('help').querySelector('.close').onclick=()=>$('help').close();
$('clear').onclick=async()=>{restoreToken++;if(remoteId&&server){await call('delete',{method:'POST'}).catch(()=>{});}await stop();release();await cache([],['job','motion','settings','result','remote','paused']);location.reload();};
function call(which,opts){return fetch('./api/jobs/'+remoteId+'/'+which,opts).then(async r=>{if(!r.ok)throw Error((await r.text()).slice(0,200)||'服务端请求失败');return r.json();});}
function remoteError(e){status('failed','服务端任务未完成',e.message,null,{retry:remoteId?'重试':null});}
async function startRemote(){try{
  status('remote','正在上传至处理服务器','上传完成后可关闭页面，任务在后台继续。',0,{cancel:true});
  const key=await new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('POST','./api/jobs?name='+encodeURIComponent(job.name)+'&size='+cfg().size+'&bg='+cfg().bg+'&audio='+(cfg().audio?'1':'0'));x.setRequestHeader('Content-Type','application/octet-stream');x.upload.onprogress=e=>{if(e.lengthComputable)$('progress').value=e.loaded/e.total;};
    x.onload=()=>x.status===201?ok(JSON.parse(x.responseText).id):no(Error(x.responseText||'上传失败'));x.onerror=()=>no(Error('上传连接中断，请重试。'));x.onabort=()=>no(new DOMException('已取消','AbortError'));controller.signal.addEventListener('abort',()=>x.abort(),{once:true});x.send(job.file);});
  remoteId=key;await cache([['remote',key]]);await poll();
}catch(e){remoteError(e);}}
async function poll(){let failures=0,lastPreview='';const signal=controller.signal;
  while(!signal.aborted){try{
    const d=await call('status');remoteData=d;failures=0;
    if(d.state==='ready'){readyPlayback('./api/jobs/'+remoteId+'/output',d.bytes);if(d.updated)$('detail').textContent+=' 可下载至 '+new Date((d.updated+86400)*1000).toLocaleString('zh-CN')+'。';return;}
    if(d.state==='failed'||d.state==='paused'){status(d.state==='paused'?'pause':'failed',d.state==='paused'?'任务已暂停':'处理未完成',d.message,null,{retry:'继续处理'});return;}
    if(d.state==='choose'){const idx=await choose('./api/jobs/'+remoteId+'/choice.jpg?v='+d.choiceNo,d.boxes,d.time);await call('choice',{method:'POST',body:String(idx)});}
    else status('remote',d.title||'正在处理',d.message||'刷新或关闭页面后，后台任务继续。',d.progress||0,{cancel:true});
    if(d.preview&&d.preview!==lastPreview){lastPreview=d.preview;const img=new Image();img.onload=()=>{const c=$('live');c.width=img.width;c.height=img.height;c.getContext('2d')?.drawImage(img,0,0);$('liveOriginal').hidden=true;$('original').currentTime=d.time||0;};img.src='./api/jobs/'+remoteId+'/preview.jpg?v='+d.preview;}
  }catch(e){if(e.name==='AbortError')return;if(++failures>=4){remoteError(e);return;}}await sleep(750);}
}
async function init(){const token=restoreToken;emptyArt();
  try{const r=await fetch('./server-mode.json',{cache:'no-store'});if(r.ok)server=(await r.json()).background===true;}catch{}
  if(server){$('serverDownload').hidden=true;$('runtime').textContent='服务端处理 · 关闭页面后继续';$('helpstorage').textContent='服务端任务在页面关闭后继续。任务和成片在完成后保留 24 小时。同一浏览器重新打开可继续查看。';}
  const [j,s,m,out,rid]=await Promise.all(['job','settings','motion','result','remote'].map(read));if(token!==restoreToken||!j)return;
  if(s)configUI(s);job=j;motion=m||{frames:[],complete:false};openPair(j.name);srcUrl=URL.createObjectURL(j.file);$('original').src=srcUrl;
  if(rid&&server){remoteId=rid;run(poll);return;}
  try{meta=await inspect(j.file);if(out&&motion.complete&&JSON.stringify(out.settings)===JSON.stringify(cfg())){readyPlayback(out.out,out.out.size);return;}}catch{}
  if(await read('paused')){status('pause','任务已暂停','已恢复最近任务，可继续处理。',null,{retry:'继续处理'});return;}
  if(token===restoreToken)run(server?startRemote:processLocal);
}
init().catch(e=>status('failed','工作台未能启动',e.message,null));
