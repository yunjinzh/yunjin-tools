(() => {
  'use strict';
  const C=MusicCore,$=id=>document.getElementById(id),isExtension=!!globalThis.chrome?.runtime?.id;
  let state=null,editingId=null,lastJobs='',settingsLoaded=false,lastAdapter='',toastTimer;
  const bindings=[['prompt','提示词输入框','已预设当前音乐入口；无法自动填写时重新绑定。'],['submit','创建按钮','已预设当前提交按钮；绑定真正的创建按钮。'],['card','音乐结果卡片','当前界面自动识别。仅恢复旧任务或页面改版时，选择包含提示词与播放器的完整作品。'],['download','卡片内下载按钮','当前界面自动打开音乐卡片右键菜单下载。此处供其他布局使用。'],['mode','音乐模式标识','可选：页面改版后，选择显示“音乐生成”或“SeedMusic”的控件。']];
  function toast(text){$('toast').textContent=text;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),6500);}
  async function send(type,extra={}){
    if(isExtension){const r=await chrome.runtime.sendMessage({type,...extra});if(!r?.ok)throw Error(r?.error||'扩展未响应，请重新打开工作台');return r.data;}
    let s;try{s=JSON.parse(localStorage.getItem('jm-offline-preview'));}catch{}
    s||={settings:structuredClone(C.DEFAULT_SETTINGS),batch:null,history:[],tabId:null};
    if(type==='GET')return s;
    if(type==='TABS')return [];
    if(type==='GENERATE'){if(s.batch)s.history.unshift(s.batch);s.history=s.history.slice(0,20);s.batch=C.generate(extra.input);}
    else if(type==='EDIT'){const j=s.batch.jobs.find(j=>j.id===extra.job.id);Object.assign(j,extra.job);}
    else if(type==='SETTINGS')s.settings=C.normalizeSettings(extra.settings);
    else if(type==='PULSE')return {};
    else throw Error('请按使用指南安装扩展，并从浏览器扩展图标打开工作台，才能连接和控制即梦页面');
    localStorage.setItem('jm-offline-preview',JSON.stringify(s));return s;
  }
  function wrap(fn){return async e=>{try{await fn(e);}catch(err){toast(err.message||String(err));}};}
  function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function btn(text,action,cls='',disabled=false){const b=node('button',cls,text);b.disabled=disabled;b.addEventListener('click',wrap(action));return b;}
  function showView(view){document.querySelectorAll('.view').forEach(el=>el.classList.toggle('hidden',el.id!=='view-'+view));document.querySelectorAll('.nav').forEach(el=>el.classList.toggle('active',el.dataset.view===view));}
  async function refresh(){state=await send('GET');render();}
  function render(){
    const s=state,b=s.batch,running=b?.status==='running';
    $('pause').disabled=!running;$('start').disabled=!b||running||!b.jobs.some(j=>j.selected!==false&&!['done','ready','skipped'].includes(j.status));
    $('start').textContent=running?'队列运行中…':b?.status==='paused'?'继续队列 →':'开始创作并下载 →';
    $('generate').disabled=running;$('save-settings').disabled=running;$('save-adapter').disabled=running;
    if(!settingsLoaded){for(const k of ['folder','interval','timeout','maxVariants'])$(k).value=s.settings[k];$('autoDownload').checked=s.settings.autoDownload;settingsLoaded=true;}
    const akey=JSON.stringify(s.settings.adapter);
    if(akey!==lastAdapter){bindings.forEach(([key])=>$('bind-'+key).value=s.settings.adapter[key]||'');lastAdapter=akey;}
    const selected=b?b.jobs.filter(j=>j.selected!==false):[];
    const total=b?selected.length:C.BATCH_SIZE,done=selected.filter(j=>['done','ready','skipped'].includes(j.status)).length;
    $('done-count').replaceChildren(document.createTextNode(String(done)),node('span','',` / ${total}`));$('progress-fill').style.width=(total?done/total*100:0)+'%';
    $('batch-date').textContent=b?new Date(b.createdAt).toLocaleString('zh-CN'):'等待创建';
    $('queue-status').textContent=b?.reason||(running?'先依次生成全部歌曲，再统一下载。保持原即梦对话打开。':b?'提示词已就绪，可逐条编辑或开始队列。':'生成提示词后，在这里管理十首音乐。');
    const chosen=b?.jobs.filter(j=>j.selected!==false)||[];
    $('phase-summary').textContent=`已提交 ${chosen.filter(j=>j.submittedAt).length} / ${b?chosen.length:C.BATCH_SIZE}　·　已生成 ${chosen.filter(j=>['generated','downloading','done','ready'].includes(j.status)).length}　·　已下载 ${chosen.filter(j=>j.status==='done').length}`;
    $('queue-status').classList.toggle('warn',b?.status==='paused');
    const signature=JSON.stringify([b?.id,b?.jobs,running]);if(signature!==lastJobs){renderJobs(b,running);lastJobs=signature;}
    $('logs').replaceChildren(...(b?.logs||[]).slice(-35).reverse().map(l=>{const li=node('li');li.append(node('time','',new Date(l.time).toLocaleTimeString('zh-CN')),node('span','',l.text));return li;}));
    if(s.tabId&&$('tab-select').querySelector(`option[value="${s.tabId}"]`))$('tab-select').value=String(s.tabId);
  }
  function renderJobs(b,running){
    $('jobs').replaceChildren();
    if(!b){const empty=node('div','muted','你的十组提示词会出现在这里。');empty.style.padding='25px 0';empty.style.gridColumn='1 / -1';$('jobs').append(empty);return;}
    for(const j of b.jobs){
      const card=node('article','job'),top=node('div','job-top');top.style.background=j.color;top.append(node('span','job-index',String(j.index).padStart(2,'0')));
      const check=node('label','job-check'),input=node('input');input.type='checkbox';input.checked=j.selected!==false;input.disabled=running||j.status!=='draft';input.setAttribute('aria-label','选择第'+j.index+'首');input.onchange=wrap(async()=>{await send('EDIT',{job:{id:j.id,selected:input.checked}});await refresh();});check.append(input);top.append(check);
      const body=node('div','job-body');body.append(node('h3','',j.style),node('div','job-english',j.english));const tags=node('div','job-tags');tags.append(node('span','',j.language),node('span','',j.bpm+' BPM'),...(j.group?[node('span','',j.group)]:[]));body.append(tags,node('p','job-voice',j.voice),node('div','job-state',j.selected===false?'未选入队列':C.STATUS[j.status]||j.status));
      const actions=node('div','job-actions');actions.append(btn(j.status==='draft'?'编辑提示词':'查看提示词',()=>openEditor(j),''),btn('仅填入',async()=>{await send('FILL',{jobId:j.id});toast('已填入即梦页面，尚未点击创建');},'',running));
      if(['waiting','uncertain','submitting'].includes(j.status)){
        actions.append(btn('继续检查',async()=>{await send('RECOVER',{jobId:j.id,action:'check'});await send('RESUME');await send('PULSE');await refresh();},'recovery',running));
        actions.append(btn('确认未创建，重新提交',async()=>{await send('RECOVER',{jobId:j.id,action:'retry'});await refresh();toast('已改为待提交。点击继续队列将再次创建，请确保即梦未生成该任务。');},'recovery',running));
      }
      if(['generated','ready','downloading'].includes(j.status))actions.append(btn('重试 / 开始下载',async()=>{await send('RECOVER',{jobId:j.id,action:'download'});await send('RESUME');await send('PULSE');await refresh();},'recovery',running));
      if(!['done','ready','skipped'].includes(j.status))actions.append(btn('跳过此首',async()=>{await send('RECOVER',{jobId:j.id,action:'skip'});await refresh();},'recovery',running));
      body.append(actions);
      for(const d of j.downloads||[])if(d.state==='complete')body.append(btn('版本 '+d.index+' · 查看文件 ↗',()=>send('SHOW_FILE',{id:d.id}),'download-link'));
      card.append(top,body);$('jobs').append(card);
    }
  }
  function openEditor(j){editingId=j.id;$('editor-title').textContent=j.style+' · 完整提示词';$('prompt-editor').value=j.prompt;$('prompt-editor').readOnly=j.status!=='draft'||state.batch.status==='running';$('save-prompt').disabled=$('prompt-editor').readOnly;$('editor').showModal();}
  async function getTabs(){const tabs=await send('TABS');$('tab-select').replaceChildren(new Option(tabs.length?'选择即梦标签页':'尚未找到即梦标签页',''),...tabs.map(t=>new Option(t.title+' · '+t.id,t.id)));if(state?.tabId)$('tab-select').value=state.tabId;}
  function showInspection(info){
    $('connection-dot').classList.toggle('online',info.music&&!info.blocker);
    $('connection-label').textContent=info.blocker?'需要处理':info.music?'已连接 · 音乐模式':'已连接 · 检查模式';
    $('connection-text').textContent=info.blocker||info.error||(info.autoAdapter?'自动适配：音乐卡片与右键下载':'使用手动页面绑定');
    const report=[`音乐模式：${info.music?'已识别':'未识别'}`,`提示词框：${info.prompt?'已识别':'待绑定'}`,`创建按钮：${info.submit?'已识别':'待绑定'}`,`结果卡片：${info.autoAdapter?'自动识别':'手动绑定'}，当前 ${info.cards} 张`,info.blocker?`页面提示：${info.blocker}`:'',info.error?`适配提示：${info.error}`:''].filter(Boolean).join('\n');$('diagnostics').textContent=report;
  }
  async function inspect(){const info=await send('INSPECT');showInspection(info);toast(info.blocker||info.error||'页面检测完成');}
  async function settings(){const current=await send('GET');const v={...current.settings};for(const k of ['folder','interval','timeout','maxVariants'])v[k]=$(k).value;v.autoDownload=$('autoDownload').checked;await send('SETTINGS',{settings:v});await refresh();toast('队列与下载设置已保存');}
  for(const [i,[key,title,desc]] of bindings.entries()){
    const card=node('article','binding-card');card.append(node('div','eyebrow','BINDING / 0'+(i+1)),node('h2','',title),node('p','',desc));
    const input=node('input');input.id='bind-'+key;input.placeholder=key==='prompt'||key==='submit'?'留空使用已核实预设':'点击下方按钮在即梦页面选择';input.setAttribute('aria-label',title+'选择器');card.append(input,btn('在页面中选择 ↗',async()=>{await send('PICK',{field:key});toast('请在即梦页面选择对应元素，完成后回到此工作台');},'small'));$('binding-grid').append(card);
  }
  let catalogGroup='all',catalogPage=1;const catalogPageSize=24;
  $('pack').replaceChildren(new Option(`全部 ${C.STYLES.length} 种 · 随机10种`,'all'),...C.CATALOG.groups.map(g=>new Option(`${g.name} · ${g.count}种`,g.name)));
  $('voice').replaceChildren(...C.VOICES.map(v=>new Option(v.label,v.label)),new Option('自定义演唱设定…','custom'));
  function scopeNote(){const scope=$('pack').value,count=C.PACKS[scope]?.length||C.STYLES.length;$('scope-note').textContent=scope==='all'?`全库${count}种类型 · 每次随机10种 · 同批不重复`:`优先从${scope}抽取${Math.min(count,10)}种${count<10?'，再从全库补足'+(10-count)+'种':''} · 同批不重复`;}
  $('pack').onchange=scopeNote;scopeNote();
  function renderCatalog(){
    const q=$('catalog-query').value.trim().toLocaleLowerCase(),kind=$('catalog-kind').value;
    const list=C.STYLES.filter(s=>(catalogGroup==='all'||s.group===catalogGroup)&&(kind==='all'||s.kind===kind)&&(!q||[s.name,s.en,s.group,s.description,s.region,...s.tags].join(' ').toLocaleLowerCase().includes(q)));
    const pages=Math.max(1,Math.ceil(list.length/catalogPageSize));catalogPage=Math.min(catalogPage,pages);
    $('catalog-results').textContent=`${catalogGroup==='all'?'全部类型':catalogGroup} · 找到 ${list.length} 种`;
    $('catalog-page').textContent=`${catalogPage} / ${pages}`;$('catalog-prev').disabled=catalogPage===1;$('catalog-next').disabled=catalogPage===pages;
    $('catalog-empty').classList.toggle('hidden',!!list.length);
    $('catalog-use').textContent=catalogGroup==='all'?'全库随机10种 →':`优先从${catalogGroup}抽取 →`;
    $('catalog-groups').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.group===catalogGroup);b.setAttribute('aria-pressed',String(b.dataset.group===catalogGroup));});
    $('catalog-grid').replaceChildren(...list.slice((catalogPage-1)*catalogPageSize,catalogPage*catalogPageSize).map(s=>{
      const a=C.creativeStyle(s),card=node('article','catalog-card');card.style.setProperty('--group-color',a.color);
      card.append(node('div','eyebrow',s.kindLabel+' · '+s.group),node('h2','',s.name),node('div','catalog-english',s.en),node('p','',s.description));
      const tags=node('div','job-tags');s.tags.forEach(t=>tags.append(node('span','',t)));card.append(tags);
      const details=node('details');details.append(node('summary','','听感与编曲参考'),node('p','',s.hint),node('p','catalog-arrangement','编曲建议：'+a.instruments));card.append(details);return card;
    }));
  }
  [['all',C.STYLES.length],...C.CATALOG.groups.map(g=>[g.name,g.count])].forEach(([g,count])=>{
    const b=btn((g==='all'?'全部':g)+' '+count,()=>{catalogGroup=g;catalogPage=1;renderCatalog();});b.dataset.group=g;$('catalog-groups').append(b);
  });
  $('catalog-query').oninput=()=>{catalogPage=1;renderCatalog();};$('catalog-kind').onchange=()=>{catalogPage=1;renderCatalog();};
  $('catalog-prev').onclick=()=>{catalogPage--;renderCatalog();};$('catalog-next').onclick=()=>{catalogPage++;renderCatalog();};
  $('catalog-use').onclick=()=>{$('pack').value=catalogGroup;scopeNote();showView('create');$('theme').focus();toast('已设置抽取范围，填写主题后点击随机生成10组提示词');};
  renderCatalog();
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));
  document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>$('theme').value=b.dataset.theme);
  $('voice').onchange=()=>$('custom-voice-row').classList.toggle('hidden',$('voice').value!=='custom');
  $('generate').onclick=wrap(async()=>{
    const input={};for(const k of ['theme','pack','language','voice','duration','mood','extra'])input[k]=$(k).value;
    if(input.voice==='custom'){input.voice=$('custom-voice').value.trim();if(!input.voice)throw Error('请填写自定义演唱设定');}
    await send('GENERATE',{input});await refresh();document.querySelector('.queue').scrollIntoView({behavior:'smooth',block:'start'});toast('已随机抽取10种不同类型，可查看与编辑');
  });
  $('save-prompt').onclick=wrap(async()=>{await send('EDIT',{job:{id:editingId,prompt:$('prompt-editor').value}});$('editor').close();await refresh();toast('提示词已保存');});
  $('copy-prompt').onclick=wrap(async()=>{try{await navigator.clipboard.writeText($('prompt-editor').value);}catch{$('prompt-editor').select();if(!document.execCommand('copy'))throw Error('请选中文本后按 Ctrl+C 复制');}toast('已复制提示词');});
  $('connect').onclick=wrap(async()=>{if(!$('tab-select').value)throw Error('先选择即梦标签页');const info=await send('CONNECT',{tabId:Number($('tab-select').value)});showInspection(info);await refresh();toast(info.blocker||'连接成功');});
  $('refresh-tabs').onclick=wrap(getTabs);$('open-jimeng').onclick=wrap(async()=>{await send('OPEN');await refresh();await getTabs();});
  $('inspect').onclick=wrap(inspect);$('adapter-inspect').onclick=wrap(inspect);
  $('start').onclick=wrap(async()=>{await settings();await send('START');await send('PULSE');await refresh();});
  $('pause').onclick=wrap(async()=>{await send('PAUSE');await refresh();});$('save-settings').onclick=wrap(settings);
  $('save-adapter').onclick=wrap(async()=>{const adapter={};bindings.forEach(([key])=>adapter[key]=$('bind-'+key).value.trim());await send('SETTINGS',{settings:{...state.settings,adapter}});await refresh();toast('绑定设置已保存');});
  $('reset-adapter').onclick=wrap(async()=>{const info=await send('RESET_ADAPTER');showInspection(info);await refresh();toast('已恢复自动识别，请继续检查现有任务');});
  $('downloads').onclick=wrap(()=>send('DOWNLOADS'));
  $('export').onclick=wrap(async()=>{
    await refresh();if(!state.batch)throw Error('先生成一批提示词');
    const clean=b=>({id:b.id,theme:b.theme,createdAt:b.createdAt,status:b.status,jobs:b.jobs.map(j=>({index:j.index,title:j.title,style:j.style,styleId:j.styleId,group:j.group,kind:j.kind,language:j.language,voice:j.voice,prompt:j.prompt,status:j.status,downloads:j.downloads.map(d=>({state:d.state,filename:d.filename,bytes:d.bytes}))})),logs:b.logs});
    const blob=new Blob([JSON.stringify({tool:'十曲 · 即梦音乐工作台',version:'1.2.0',exportedAt:new Date().toISOString(),batch:clean(state.batch),history:state.history.map(clean)},null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=C.safeName(state.batch.theme)+'_创作记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已导出提示词、状态与下载记录');
  });
  if(!isExtension){$('preview-note').classList.remove('hidden');$('mode-pill').textContent='离线预览 · 提示词可用';}
  (async()=>{await refresh();await getTabs();if(state.tabId&&isExtension){try{showInspection(await send('INSPECT'));}catch{}}})().catch(e=>toast(e.message));
  setInterval(async()=>{try{await send('PULSE');await refresh();}catch{}},4000);
})();
