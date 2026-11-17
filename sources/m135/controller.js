/* Effects adapter: the DOM and WebMCP never mutate domain state directly. */
let appState=model.decode(location.hash || $('meta[name="research-initial-route"]')?.content || '#overview');
let queryEditing=false, noticeTimer, downloadSerial=0, dialogReturnFocus=null, closePending=null;
const transitionLog=[];
const HISTORY_KEY='research-app-v1';
const transientEvents=new Set(['NOTICE','DISMISS_NOTICE','DOWNLOAD_START','DOWNLOAD_REQUESTED','DOWNLOAD_FAILED','PRINT_START','PRINT_END','CLOSE_RECORD_REQUEST','AGENT_SETUP']);

function syncViewState() {
  current=appState.view;structMode=appState.structure.mode;themeMetric=appState.themes.metric;
  chosenTopic=appState.themes.topic;instSource=appState.institutions.source;instTopic=appState.institutions.topic;eState=appState.explorer;
}
function focusDescriptor() {
  const el=document.activeElement;
  if(!el||el===document.body)return null;
  if(el.id)return {id:el.id};
  for(const key of ['page','detail','topicDetail','metric','struct','org','socialcat','evidenceSource'])
    if(el.dataset?.[key]!==undefined)return {key,value:el.dataset[key]};
  return null;
}
function restoreFocus(descriptor,fallback=false) {
  const el=descriptor?.id?document.getElementById(descriptor.id):descriptor?.key?
    [...document.querySelectorAll('[data-'+descriptor.key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+']')].find(e=>e.dataset[descriptor.key]===descriptor.value):null;
  if(el&&!el.disabled)el.focus({preventScroll:true});else if(fallback)$('#main').focus({preventScroll:true});
}
function historyEntry(extra={}) {
  return {owner:HISTORY_KEY,hash:model.encode(appState),snapshot:model.durable(appState),scroll:window.scrollY,focus:focusDescriptor(),...extra};
}
function rememberPosition() {
  if(history.state?.owner===HISTORY_KEY)history.replaceState({...history.state,scroll:window.scrollY,focus:focusDescriptor()},'',location.href);
}
function commit(events,{historyMode='push',focus=null}={}) {
  if(!Array.isArray(events))events=[events];
  const previous=appState;
  // Validate the whole batch before changing the UI or history.
  const next=events.reduce((state,event)=>model.transition(state,event),appState);
  if(next===previous)return readState();
  const beforeFocus=focusDescriptor();
  const onlyTransient=events.every(e=>transientEvents.has(e.type));
  const opening=!previous.dialog&&next.dialog;
  if(opening)dialogReturnFocus=beforeFocus;
  if(!onlyTransient&&historyMode==='push')rememberPosition();
  appState=next;
  transitionLog.push({events:events.map(e=>e.type),view:next.view,at:new Date().toISOString()});
  if(transitionLog.length>40)transitionLog.shift();
  if(!onlyTransient && historyMode!=='none') {
    const changed=model.encode(previous)!==model.encode(next);
    const method=historyMode==='push'&&changed?'pushState':'replaceState';
    const modalEntry=opening || (!!previous.dialog && !!next.dialog && history.state?.modalEntry===true);
    history[method](historyEntry({modalEntry}),'',model.encode(appState));
  }
  paint(previous,events.map(e=>e.type));
  if(next.view!==previous.view||events.some(e=>e.type==='NAVIGATE')) {
    queryEditing=false;window.scrollTo(0,0);
    if(!next.dialog)restoreFocus(null,true);
  } else if(!next.dialog&&previous.dialog)restoreFocus(dialogReturnFocus,true);
  else if(!next.dialog&&events.some(e=>['SET_STRUCTURE','SET_THEME','SET_INSTITUTIONS','TOGGLE_CROSS','RESET_FILTERS'].includes(e.type)))restoreFocus(beforeFocus);
  if(events.some(e=>e.type==='RESET_FILTERS')&&current==='explorer')$('#search').focus({preventScroll:true});
  if(focus==='results')$('.resultbar')?.scrollIntoView({block:'start'});
  if(focus==='topic')$('#topicDetail')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return readState();
}
function readState() {
  const result=model.results(appState.explorer);
  return {version:1,view:appState.view,route:model.encode(appState),structure:appState.structure,themes:appState.themes,
    institutions:appState.institutions,filters:appState.explorer,
    results:{status:result.status,total:result.total,page:result.page,pages:result.pages,pageSize:25,
      records:appState.view==='explorer'?result.pageRows.map(recordSummary):[]},
    dialog:appState.dialog?recordSummary(model.record(appState.dialog)):null,dialogPhase:appState.dialogPhase,
    download:appState.download,print:appState.print,agentTools:appState.agent,lastEvent:appState.lastEvent};
}
function recordSummary(r) {
  return {key:model.keyFor(r),title:r[1],person:r[2],institution:r[3],source:src(r[0]),category:r[5],code:r[9],
    provenance:{file:S[r[0]].name,sheet:r[11],row:r[12]}};
}
function showNotice(message,tone='info') {
  commit({type:'NOTICE',message,tone},{historyMode:'none'});
  clearTimeout(noticeTimer);const id=appState.notice.id;
  noticeTimer=setTimeout(()=>commit({type:'DISMISS_NOTICE',id},{historyMode:'none'}),4500);
}
function renderCross() {
  if(!$('#crossList'))return;
  const expanded=appState.institutions.cross;
  $('#showCross').textContent=expanded?'收起跨基金机构清单 ↑':'查看跨基金机构清单 ↗';
  $('#showCross').setAttribute('aria-expanded',String(expanded));$('#showCross').setAttribute('aria-controls','crossList');
  if(!expanded){$('#crossList').innerHTML='';return;}
  const a=counts(groups[1],4),b=Object.fromEntries(counts(groups[2],4)),common=a.filter(([key])=>b[key]);
  $('#crossList').innerHTML=`<div class="table-wrap" style="max-height:420px;margin-top:20px"><table><thead><tr><th>同名机构</th><th>2025 社科</th><th>2025 国自然</th></tr></thead><tbody>${common.sort((x,y)=>x[0].localeCompare(y[0],'zh-CN')).map(([key,v])=>`<tr><td><button class="title-button" data-cross-org="${esc(key)}">${esc(key)}</button></td><td>${v}</td><td>${b[key]}</td></tr>`).join('')}</tbody></table></div><p class="note">按机构名称排序，点击查看该机构在各附件中的记录。</p>`;
}
function syncDisclosures() {
  $$('#main details').forEach((el,index)=>{
    const key=`${current}:${current==='themes'?chosenTopic:0}:${index}`;
    el.dataset.disclosure=key;
    if(Object.hasOwn(appState.disclosures,key))el.open=appState.disclosures[key];
  });
}
function syncEffects(previous) {
  const dialog=$('#detail');
  $('#closeDetail').disabled=appState.dialogPhase==='closing';
  if(appState.dialog) {
    if(previous?.dialog!==appState.dialog||!dialog.open)renderDetail(model.record(appState.dialog));
    if(!dialog.open){dialog.showModal();dialog.scrollTop=0;$('#closeDetail').focus();}
  } else if(dialog.open)dialog.close();
  const busy=appState.download.status==='preparing';
  $('#offlineBtn').disabled=busy;$('#offlineBtn').setAttribute('aria-busy',String(busy&&appState.download.kind==='offline'));
  $('#offlineBtn').innerHTML=busy&&appState.download.kind==='offline'?'正在准备…':'离线下载 <span aria-hidden="true">↓</span>';
  if($('#exportCsv')) {
    $('#exportCsv').disabled=busy||!model.results(eState).total;
    $('#exportCsv').setAttribute('aria-busy',String(busy&&appState.download.kind==='csv'));
    $('#exportCsv').innerHTML=busy&&appState.download.kind==='csv'?'正在准备…':'导出筛选 CSV <span aria-hidden="true">↓</span>';
  }
  $('#printBtn').disabled=appState.print==='printing';
  $('#toast').textContent=appState.notice.message;$('#toast').style.display=appState.notice.message?'block':'none';
  $('#toast').dataset.tone=appState.notice.tone;
  document.documentElement.dataset.view=current;
  document.documentElement.dataset.resultState=current==='explorer'?model.results(eState).status:'inactive';
  document.documentElement.dataset.downloadState=appState.download.status;
  document.documentElement.dataset.appReady='true';
}
function paint(previous=null,events=['INIT']) {
  syncViewState();
  const changedView=!previous||previous.view!==current;
  const full=changedView||events.includes('HYDRATE')||
    (current==='structure'&&events.includes('SET_STRUCTURE'))||
    (current==='themes'&&events.includes('SET_THEME')&&previous?.themes.metric!==themeMetric)||
    (current==='institutions'&&events.includes('SET_INSTITUTIONS'));
  if(full) {
    $('#main').innerHTML=({overview,structure,themes,institutions,explorer,method})[current]();
    if(current==='institutions') {
      $('#instSource').onchange=e=>commit({type:'SET_INSTITUTIONS',patch:{source:+e.target.value}});
      $('#instTopic').onchange=e=>commit({type:'SET_INSTITUTIONS',patch:{topic:+e.target.value}});
      $('#showCross').onclick=()=>commit({type:'TOGGLE_CROSS'});renderCross();
    }
    if(current==='explorer')bindExplorer();
    syncDisclosures();
  } else if(current==='themes'&&events.includes('SET_THEME')) {
    $('#topicDetail').innerHTML=topicDetail();syncDisclosures();
  } else if(current==='institutions'&&events.includes('TOGGLE_CROSS'))renderCross();
  if(current==='explorer'&&(full||events.some(e=>['FILTER_PROJECTS','SET_PAGE','RESET_FILTERS','OPEN_EVIDENCE'].includes(e)))) {
    updateOptions();
    for(const [id,key] of [['expSource','source'],['expTopic','topic'],['expCat','cat'],['expDisc','disc'],['expSort','sort']])$('#'+id).value=String(eState[key]);
    if($('#search').value!==eState.q)$('#search').value=eState.q;
    updateResults();
    if($('#clearOrg'))$('#clearOrg').onclick=()=>commit({type:'FILTER_PROJECTS',patch:{org:''}});
  }
  $('#crumb').textContent=titles[pages.indexOf(current)];
  $$('.nav-item').forEach(a=>{a.classList.toggle('active',a.dataset.page===current);if(a.dataset.page===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $$('[data-struct]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.struct===structMode)));
  $$('[data-metric]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.metric===themeMetric)));
  $$('[data-topic-detail]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.topicDetail===chosenTopic)));
  syncEffects(previous);
}
function bindExplorer() {
  $('#search').oninput=e=>{
    commit({type:'FILTER_PROJECTS',patch:{q:e.target.value}},{historyMode:queryEditing?'replace':'push'});queryEditing=true;
  };
  $('#search').onblur=()=>{queryEditing=false;};
  for(const [id,key] of [['expSource','source'],['expTopic','topic'],['expCat','cat'],['expDisc','disc'],['expSort','sort']])
    $('#'+id).onchange=e=>{queryEditing=false;commit({type:'FILTER_PROJECTS',patch:{[key]:['source','topic'].includes(key)?+e.target.value:e.target.value}})};
  $('#resetFilters').onclick=()=>commit({type:'RESET_FILTERS'});
  $('#prevPage').onclick=()=>commit({type:'SET_PAGE',page:Math.max(1,eState.page-1)},{focus:'results'});
  $('#nextPage').onclick=()=>commit({type:'SET_PAGE',page:eState.page+1},{focus:'results'});
  $('#exportCsv').onclick=()=>startDownload('csv');
}
function closeRecord() {
  if(closePending)return closePending;
  if(!appState.dialog)return Promise.resolve(readState());
  if(history.state?.owner!==HISTORY_KEY||!history.state.modalEntry)return Promise.resolve(commit({type:'CLOSE_RECORD'},{historyMode:'replace'}));
  commit({type:'CLOSE_RECORD_REQUEST'},{historyMode:'none'});
  closePending=new Promise(resolve=>{
    let timer;
    const done=()=>{clearTimeout(timer);window.removeEventListener('popstate',done);closePending=null;resolve(readState())};
    window.addEventListener('popstate',done,{once:true});
    timer=setTimeout(()=>{if(appState.dialog)commit({type:'CLOSE_RECORD'},{historyMode:'replace'});done()},1500);
    history.back();
  });
  return closePending;
}
function restoreFromHistory() {
  if(location.hash===model.encode(appState))return;
  const previous=appState,entry=history.state;
  appState=entry?.owner===HISTORY_KEY&&entry.hash===location.hash?model.restore(entry.snapshot,appState):model.decode(location.hash,appState);
  queryEditing=false;paint(previous,['HYDRATE']);
  history.replaceState(historyEntry({modalEntry:entry?.modalEntry===true,scroll:entry?.scroll||0,focus:entry?.focus||null}),'',model.encode(appState));
  window.scrollTo(0,entry?.owner===HISTORY_KEY?entry.scroll||0:0);
  if(!appState.dialog)restoreFocus(entry?.focus||dialogReturnFocus,true);
}
function csvBlob(records) {return new Blob([ResearchExport.csv(records,{sources:S,topics:T})],{type:'text/csv;charset=utf-8'});}
function offlineBlob(route) {
  const doc=document.documentElement.cloneNode(true);
  doc.querySelectorAll('script:not(#dataset):not(#application)').forEach(e=>e.remove());
  doc.querySelector('#detail')?.removeAttribute('open');
  doc.querySelectorAll('button[disabled]').forEach(e=>e.removeAttribute('disabled'));
  let meta=doc.querySelector('meta[name="research-initial-route"]');
  if(!meta){meta=document.createElement('meta');meta.name='research-initial-route';doc.querySelector('head').append(meta);}
  meta.content=route;
  doc.querySelector('#toast').textContent='';doc.querySelector('#toast').style.display='none';
  return new Blob(['<!doctype html>\n'+doc.outerHTML],{type:'text/html;charset=utf-8'});
}
function requestFile(blob,name) {
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  try {link.href=url;link.download=name;link.hidden=true;document.body.append(link);link.click();}
  finally {link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
}
function startDownload(kind) {
  if(appState.download.status==='preparing')return;
  const requestId=++downloadSerial,records=[...model.results(appState.explorer).rows],route=model.encode(appState);
  try {commit({type:'DOWNLOAD_START',kind,requestId},{historyMode:'none'});}
  catch(error){showNotice('当前没有可导出的项目。','error');return;}
  // Yield before serializing so progress and disabled buttons are painted.
  setTimeout(()=>{
    try {
      requestFile(kind==='csv'?csvBlob(records):offlineBlob(route),kind==='csv'?`科研项目筛选_${records.length}条.csv`:'科研资助洞察_交互分析_离线版.html');
      commit({type:'DOWNLOAD_REQUESTED',requestId},{historyMode:'none'});
      showNotice(kind==='csv'?`已发起 ${fmt(records.length)} 条记录的下载，请查看浏览器下载列表。`:'已发起离线版下载；文件包含全部数据、字体及当前视图。');
    } catch(error) {
      commit({type:'DOWNLOAD_FAILED',requestId,error:String(error.message||error)},{historyMode:'none'});
      showNotice('下载准备失败，请重试。当前筛选与数据已保留。','error');
    }
  },30);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(link?.classList.contains('skip')){event.preventDefault();$('#main').focus();return;}
  if(link&&(link.dataset.page||link.classList.contains('brand'))) {
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();commit({type:'NAVIGATE',view:link.dataset.page||'overview'});return;
  }
  const button=event.target.closest('button,[data-go]');if(!button||button.disabled)return;
  const d=button.dataset;
  if(d.go)commit({type:'NAVIGATE',view:d.go});
  else if(d.detail!==undefined)commit({type:'OPEN_RECORD',key:model.keyFor(R[+d.detail])});
  else if(d.topicJump!==undefined)commit([{type:'SET_THEME',patch:{topic:+d.topicJump}},{type:'NAVIGATE',view:'themes'}]);
  else if(d.topicDetail!==undefined)commit({type:'SET_THEME',patch:{topic:+d.topicDetail}},{focus:'topic'});
  else if(d.metric)commit({type:'SET_THEME',patch:{metric:d.metric}});
  else if(d.struct)commit({type:'SET_STRUCTURE',mode:d.struct});
  else if(d.evidenceSource!==undefined||d.evidenceTopic!==undefined)commit({type:'OPEN_EVIDENCE',filters:{source:d.evidenceSource!==undefined?+d.evidenceSource:-1,topic:d.evidenceTopic!==undefined?+d.evidenceTopic:-1}});
  else if(d.socialcat)commit({type:'OPEN_EVIDENCE',filters:{source:1,cat:d.socialcat}});
  else if(d.cat)commit({type:'OPEN_EVIDENCE',filters:{source:3,cat:d.cat}});
  else if(d.org)commit({type:'OPEN_EVIDENCE',filters:{source:instSource,topic:instTopic,org:d.org}});
  else if(d.crossOrg)commit({type:'OPEN_EVIDENCE',filters:{org:d.crossOrg}});
  else if(d.reset)commit({type:'RESET_FILTERS'});
});
document.addEventListener('toggle',event=>{
  const el=event.target,key=el.dataset?.disclosure;
  if(key&&appState.disclosures[key]!==el.open)commit({type:'SET_DISCLOSURE',key,open:el.open},{historyMode:'replace'});
},true);
$('#closeDetail').onclick=closeRecord;
$('#detail').addEventListener('cancel',event=>{event.preventDefault();closeRecord()});
$('#detail').addEventListener('close',()=>{if(appState.dialog)closeRecord()});
$('#detail').onclick=event=>{if(event.target===$('#detail')){const b=$('#detail').getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeRecord()}};
$('#offlineBtn').onclick=()=>startDownload('offline');
$('#printBtn').onclick=()=>{commit({type:'PRINT_START'},{historyMode:'none'});try{window.print()}catch{commit({type:'PRINT_END'},{historyMode:'none'});showNotice('无法打开打印窗口，请使用浏览器的打印功能。','error')}};
window.addEventListener('beforeprint',()=>commit({type:'PRINT_START'},{historyMode:'none'}));
window.addEventListener('afterprint',()=>commit({type:'PRINT_END'},{historyMode:'none'}));
window.addEventListener('popstate',restoreFromHistory);window.addEventListener('hashchange',restoreFromHistory);
window.addEventListener('pagehide',rememberPosition);
history.scrollRestoration='manual';
paint();history.replaceState(historyEntry(),'',model.encode(appState));

/* Small, capability-detected agent adapter. It exposes real UI actions, not a second state store. */
const agentSchemas={
  navigate:{type:'object',properties:{view:{type:'string',enum:pages}},required:['view'],additionalProperties:false},
  filters:{type:'object',properties:{source:{type:'integer',minimum:-1,maximum:S.length-1},topic:{type:'integer',minimum:-1,maximum:T.length-1},q:{type:'string',maxLength:2000},org:{type:'string',maxLength:2000},cat:{type:'string',maxLength:2000},disc:{type:'string',maxLength:2000},sort:{type:'string',enum:['source','org','title']},page:{type:'integer',minimum:1},reset:{type:'boolean'}},additionalProperties:false},
  record:{type:'object',properties:{key:{type:'string',description:'Stable source checksum, worksheet and Excel row key returned in results.'}},required:['key'],additionalProperties:false},
  configure:{type:'object',properties:{view:{type:'string',enum:['structure','themes','institutions']},mode:{type:'string',enum:['social','natural']},metric:{type:'string',enum:['share','count']},source:{type:'integer',minimum:0,maximum:S.length-1},topic:{type:'integer',minimum:-1,maximum:T.length-1},cross:{type:'boolean'}},required:['view'],additionalProperties:false}
};
function validateKeys(input,allowed,required=[]) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected an object');
  for(const k of Object.keys(input))if(!allowed.includes(k))throw new Error('Unknown field: '+k);
  for(const k of required)if(!(k in input))throw new Error('Missing field: '+k);
}
const agentActions=Object.freeze({
  read(input={}){validateKeys(input,[]);return readState()},
  navigate(input){validateKeys(input,['view'],['view']);return commit({type:'NAVIGATE',view:input.view})},
  filter(input){
    validateKeys(input,[...Object.keys(ResearchState.FILTER_DEFAULTS),'reset']);
    if('reset' in input&&typeof input.reset!=='boolean')throw new Error('Invalid reset');
    const {reset=false,page,...patch}=input,events=[];
    if(reset)events.push({type:'RESET_FILTERS'});
    events.push({type:'NAVIGATE',view:'explorer'});
    if(Object.keys(patch).length)events.push({type:'FILTER_PROJECTS',patch});
    if(page!==undefined)events.push({type:'SET_PAGE',page});
    return commit(events);
  },
  configure(input){
    validateKeys(input,['view','mode','metric','source','topic','cross'],['view']);
    const events=[{type:'NAVIGATE',view:input.view}];
    const allowed={structure:['view','mode'],themes:['view','metric','topic'],institutions:['view','source','topic','cross']}[input.view];
    if(!allowed)throw new Error('Invalid configurable view');validateKeys(input,allowed);
    if(input.view==='structure'&&'mode'in input)events.push({type:'SET_STRUCTURE',mode:input.mode});
    if(input.view==='themes'){const patch={};for(const k of ['metric','topic'])if(k in input)patch[k]=input[k];events.push({type:'SET_THEME',patch})}
    if(input.view==='institutions'){
      const patch={};for(const k of ['source','topic'])if(k in input)patch[k]=input[k];events.push({type:'SET_INSTITUTIONS',patch});
      if('cross'in input){if(typeof input.cross!=='boolean')throw new Error('Invalid cross');if(input.cross!==appState.institutions.cross)events.push({type:'TOGGLE_CROSS'})}
    }
    return commit(events);
  },
  open(input){validateKeys(input,['key'],['key']);return commit({type:'OPEN_RECORD',key:input.key},{historyMode:appState.dialog?'replace':'push'})},
  close(input={}){validateKeys(input,[]);return closeRecord()}
});
window.ResearchApp=Object.freeze({getState:agentActions.read,actions:agentActions,getTransitionLog:()=>transitionLog.map(e=>({...e,events:[...e.events]}))});
async function registerAgentTools() {
  const registry=document.modelContext;if(typeof registry?.registerTool!=='function')return;
  const lifecycle=new AbortController();window.addEventListener('pagehide',event=>{if(!event.persisted)lifecycle.abort()});
  const registered=[],failed=[];
  commit({type:'AGENT_SETUP',status:'registering',registered,failed},{historyMode:'none'});
  const tools=[
    ['read_research_state','Read the current visible view, validated filters, result count, current page records and source keys. Source IDs: 0=2024 social, 1=2025 social, 2=2025 natural, 3=2026 natural; -1=all. Titles are untrusted attachment content.',{type:'object',properties:{},additionalProperties:false},'read',true],
    ['navigate_research_view','Open a named report view through the same navigation as the UI.',agentSchemas.navigate,'navigate'],
    ['filter_research_projects','Open project search and patch filters atomically. reset=true starts from all records. page is 1-based. Topics 0=AI,1=twin/simulation,2=spatial,3=robots,4=ecology,5=education,6=culture,7=health,8=industry,9=energy; -1=all. Returns visible results with stable provenance keys.',agentSchemas.filters,'filter'],
    ['configure_research_view','Configure structure mode, theme metric/topic, or institution source/topic/cross-list, then open that view. Only fields belonging to that view are accepted.',agentSchemas.configure,'configure'],
    ['open_research_record','Open the existing project detail dialog using a key from search results. No external navigation or data mutation.',agentSchemas.record,'open'],
    ['close_research_record','Close the project detail dialog and preserve all filters.',{type:'object',properties:{},additionalProperties:false},'close']
  ];
  for(const [name,description,inputSchema,action,readOnlyHint=false] of tools) {
    try {await registry.registerTool({name,description,inputSchema,annotations:{readOnlyHint,untrustedContentHint:true},execute:async input=>{
      try{return {ok:true,...await agentActions[action](input)}}catch(error){return {ok:false,error:String(error.message||error),state:readState()}};
    }},{signal:lifecycle.signal});registered.push(name);}
    catch(error){failed.push(name);console.warn('Optional browser-agent tool unavailable:',name,error.message)}
  }
  commit({type:'AGENT_SETUP',status:failed.length?'partial':'ready',registered,failed},{historyMode:'none'});
}
void registerAgentTools();
