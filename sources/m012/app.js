(function(){
'use strict';
const C=ContractCore,$=id=>document.getElementById(id),h=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const pristine='<!doctype html>\n'+document.documentElement.outerHTML;
const storageKey='contract-desk-config-v1';
let config=C.defaultConfig();try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.version===1&&Array.isArray(saved.columns)&&saved.joins&&saved.aggregate)config={...config,...saved};}catch{}
const state={files:{},sources:{},result:null,dirty:false,tab:'preview',page:0,busy:false,preLogs:[]};
const kinds=['list','ar','ap'],names={list:'合同编码清单',ar:'应收合同表',ap:'应付合同表'},letters={list:'SOURCE 01',ar:'SOURCE 02',ap:'SOURCE 03'};
const fieldTypes={list:'编码清单字段',ar:'应收表字段',ap:'应付表字段',fixed:'固定内容',total:'应付分组合计',ratio:'应付 / 应收占比'};
const fmt=n=>Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
let toastTimer,autoTimer;
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
function saveLocal(){try{localStorage.setItem(storageKey,JSON.stringify(config));}catch{}}
function dirty(){saveLocal();clearTimeout(autoTimer);if(state.result){state.dirty=true;$('runTitle').textContent='配置已变更，请重新生成。';$('runHint').textContent='当前预览属于上一次运行。重新匹配后可下载最新结果。';setDownloadState();if(config.autoUpdate&&Object.keys(state.sources).length===3){$('runTitle').textContent='配置已变更，正在准备自动更新。';autoTimer=setTimeout(()=>{if(!state.busy)execute(true);},650);}}updateFormula();}
function download(data,name,type){const blob=data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function timestamp(){const d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'_'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+String(d.getSeconds()).padStart(2,'0');}
function showSources(){
 $('sourceCards').innerHTML=kinds.map(kind=>{const f=state.files[kind],s=state.sources[kind];return `<article class="source-card ${s?'ready':''}" data-source="${kind}"><div class="source-head"><strong>${names[kind]}</strong><span class="source-type">${letters[kind]}</span></div><input type="file" accept=".xlsx" id="file-${kind}" hidden>${f?.loading?'<div class="drop-zone busy"><strong>正在读取工作簿…</strong><span>大文件需要几秒钟</span></div>':s?`<p class="file-name">${h(s.fileName)}</p><p class="file-meta">${s.rows.length.toLocaleString()} 数据行 · ${s.headers.length} 字段 <button class="mini-btn" data-replace="${kind}" title="更换文件">↻ 更换</button></p><div class="file-controls"><label>工作表<select data-sheet="${kind}">${f.book.sheets.map((sh,i)=>`<option value="${i}" ${i===f.sheetIndex?'selected':''}>${h(sh.name)}</option>`).join('')}</select></label><label>表头行<input type="number" min="1" max="1048576" value="${s.headerRow}" data-header="${kind}"></label></div>`:`<label class="drop-zone" for="file-${kind}"><span class="source-icon">＋</span><strong>点击选择，或拖入Excel</strong><span>.xlsx 格式 · 单文件≤30MB</span></label>`}${f?.error?`<div class="source-error">${h(f.error)}</div>`:''}</article>`;}).join('');
 for(const kind of kinds){$('file-'+kind).onchange=e=>{if(e.target.files[0])loadFile(kind,e.target.files[0]);};}
 document.querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>$('file-'+b.dataset.replace).click());
 document.querySelectorAll('[data-sheet]').forEach(s=>s.onchange=()=>selectSheet(s.dataset.sheet,Number(s.value)));
 document.querySelectorAll('[data-header]').forEach(s=>s.onchange=()=>selectHeader(s.dataset.header,Number(s.value)));
 document.querySelectorAll('[data-source]').forEach(el=>{el.ondragover=e=>{e.preventDefault();el.classList.add('dragging');};el.ondragleave=()=>el.classList.remove('dragging');el.ondrop=e=>{e.preventDefault();el.classList.remove('dragging');if(e.dataTransfer.files[0])loadFile(el.dataset.source,e.dataTransfer.files[0]);};});
 updateReady();
}
async function loadFile(kind,file){
 if(state.busy)return;delete state.sources[kind];state.files[kind]={loading:true};dirty();showSources();
 try{
  if(!/\.xlsx$/i.test(file.name))throw Error('请使用.xlsx格式；旧版.xls请先另存为.xlsx');
  if(file.size>30*1024*1024)throw Error('文件超过30MB，请拆分后导入');
  const book=await C.openXlsx(await file.arrayBuffer(),file.name,JSZip);
  if(!book.sheets.length)throw Error('工作簿中没有可读取的工作表');
  const pref=config.sourcePrefs?.[kind];let idx=book.sheets.findIndex(s=>s.name===pref?.sheetName);if(idx<0)idx=Math.max(0,book.sheets.findIndex(s=>s.state==='visible'));
  state.files[kind]={book,sheetIndex:idx,loading:false};
  await selectSheet(kind,idx,pref?.headerRow);toast(`${names[kind]}已读取`);
 }catch(e){state.files[kind]={error:e.message};recordPreError(kind,file.name,e.message);showSources();renderFields();renderJoins();toast(e.message);}
}
async function selectSheet(kind,index,header){
 const f=state.files[kind];if(!f?.book)return;
 try{const sheet=await f.book.getSheet(index);f.sheet=sheet;f.sheetIndex=index;const r=header&&sheet.rows.some(x=>x.row===Number(header))?Number(header):C.detectHeader(sheet);state.sources[kind]=C.prepareSource(f.book,sheet,r);f.error='';config.sourcePrefs=config.sourcePrefs||{};config.sourcePrefs[kind]={sheetName:sheet.name,headerRow:r};dirty();showSources();renderJoins();renderFields();}catch(e){f.error=e.message;delete state.sources[kind];recordPreError(kind,f.book.name,e.message);showSources();toast(e.message);}
}
function selectHeader(kind,row){try{const f=state.files[kind];state.sources[kind]=C.prepareSource(f.book,f.sheet,row);config.sourcePrefs[kind].headerRow=row;f.error='';dirty();showSources();renderJoins();renderFields();}catch(e){state.files[kind].error=e.message;delete state.sources[kind];showSources();renderJoins();renderFields();toast(e.message);}}
function recordPreError(kind,file,msg){state.preLogs.push({time:new Date().toISOString(),level:'ERROR',code:'FILE_READ_FAILED',contract:'',project:'',payable:'',file,sheet:'',rows:'',message:`${names[kind]}：${msg}`});}
function optionList(kind,selected,allowEmpty=false){
 const s=state.sources[kind],headers=s?.headers||[];const duplicates=new Set(headers.filter((v,i,a)=>a.findIndex(x=>x.label===v.label)!==i).map(x=>x.label));
 const opts=headers.map(x=>({value:duplicates.has(x.label)?x.key:x.label,label:`${x.label} [${x.key}]`,key:x.key}));
 const resolved=C.resolve(s,selected);let choices=allowEmpty?'<option value="">按源表行保留（不按编号去重）</option>':'<option value="">请选择字段</option>';
 if(!headers.length&&selected)choices+=`<option value="${h(selected)}" selected>${h(selected)}（待导入）</option>`;
 else if(selected&&!resolved)choices+=`<option value="${h(selected)}" selected>⚠ 字段不存在：${h(selected)}</option>`;
 choices+=opts.map(x=>`<option value="${h(x.value)}" ${x.key===resolved?'selected':''}>${h(x.label)}</option>`).join('');return choices;
}
const joins={listKey:['list','joins','listKey'],arKey:['ar','joins','arKey'],arProject:['ar','joins','arProject'],apProject:['ap','joins','apProject'],apIdentity:['ap','joins','apIdentity'],groupKey:['ar','aggregate','group'],payAmount:['ap','aggregate','payAmount'],arAmount:['ar','aggregate','arAmount']};
function renderJoins(){for(const [id,[source,obj,key]]of Object.entries(joins)){const el=$(id);el.innerHTML=optionList(source,config[obj][key],id==='apIdentity');el.onchange=()=>{config[obj][key]=el.value;dirty();};}$('trimKeys').checked=config.trim;$('ignoreCase').checked=config.ignoreCase;$('mergeCells').checked=config.merge;$('autoUpdate').checked=config.autoUpdate;updateFormula();}
function updateFormula(){$('formulaDescription').textContent=`应付合同按应收“${config.aggregate.group||'未选择'}”汇总，占比＝应付合计÷“${config.aggregate.arAmount||'未选择'}”。同名跨编号会记录警告。`;}
function renderFields(){
 $('fieldCount').textContent=config.columns.length;
 $('fieldRows').innerHTML=config.columns.map((c,i)=>`<tr data-index="${i}"><td>${String(i+1).padStart(2,'0')}</td><td><input aria-label="第${i+1}列名称" data-edit="name" value="${h(c.name)}"></td><td><select aria-label="第${i+1}列来源" data-edit="source">${Object.entries(fieldTypes).map(([k,v])=>`<option value="${k}" ${c.source===k?'selected':''}>${v}</option>`).join('')}</select></td><td>${['list','ar','ap'].includes(c.source)?`<select aria-label="第${i+1}列源字段" data-edit="field">${optionList(c.source,c.field)}</select>`:c.source==='fixed'?`<input class="field-fixed" aria-label="固定内容" data-edit="field" value="${h(c.field)}">`:`<span class="file-meta">${c.source==='total'?'按上方分组字段计算':'应付合计 ÷ 应收金额'}</span>`}</td><td><select aria-label="第${i+1}列格式" data-edit="format"><option value="text" ${c.format==='text'?'selected':''}>原值</option><option value="money" ${c.format==='money'?'selected':''}>金额 0.00</option><option value="percent" ${c.format==='percent'?'selected':''}>百分比</option></select></td><td><button class="mini-btn" data-move="-1" ${i===0?'disabled':''} title="上移" aria-label="上移">↑</button><button class="mini-btn" data-move="1" ${i===config.columns.length-1?'disabled':''} title="下移" aria-label="下移">↓</button></td><td><button class="mini-btn" data-remove="1" title="删除列" aria-label="删除列">×</button></td></tr>`).join('');
 $('fieldRows').onchange=e=>{const tr=e.target.closest('tr');if(!tr||!e.target.dataset.edit)return;const i=Number(tr.dataset.index),key=e.target.dataset.edit;config.columns[i][key]=e.target.value;if(key==='source'){config.columns[i].field='';if(e.target.value==='total')config.columns[i].format='money';if(e.target.value==='ratio')config.columns[i].format='percent';renderFields();}dirty();};
 $('fieldRows').onclick=e=>{const b=e.target.closest('button'),tr=b?.closest('tr');if(!tr)return;const i=Number(tr.dataset.index);if(b.dataset.remove){config.columns.splice(i,1);}else if(b.dataset.move){const to=i+Number(b.dataset.move);if(to<0||to>=config.columns.length)return;[config.columns[i],config.columns[to]]=[config.columns[to],config.columns[i]];}renderFields();dirty();};
}
function updateReady(){const n=Object.keys(state.sources).length;if(!state.dirty){$('runTitle').textContent=n===3?'三份源表已就绪。':'准备好后，开始匹配。';$('runHint').textContent=n===3?'检查匹配字段和汇总口径，即可生成结果与日志。':`已导入 ${n}/3 份文件。上传后检查字段映射。`;}$('runBtn').disabled=state.busy||Object.values(state.files).some(x=>x.loading);}
function setBusy(b){state.busy=b;$('runBtn').disabled=b;$('runBtn').innerHTML=b?'<span class="busy">正在处理…</span>':'<span>匹配并生成</span><span>↗</span>';document.querySelectorAll('.downloadbar button').forEach(x=>x.disabled=b);if(!b)setDownloadState();}
function setDownloadState(){const ok=state.result&&!state.dirty&&!state.result.fatal&&state.result.records.length;for(const id of ['downloadExcel','downloadBundle'])$(id).disabled=!ok;for(const id of ['downloadLog','downloadCSV'])$(id).disabled=!state.result;}
async function execute(automatic=false){
 clearTimeout(autoTimer);setBusy(true);await new Promise(resolve=>setTimeout(resolve,30));
 try{
  const result=C.run(state.sources,config);if(state.preLogs.length)result.logs.unshift(...state.preLogs);result.stats.errors=result.logs.filter(x=>x.level==='ERROR').length;result.stats.warnings=result.logs.filter(x=>x.level==='WARNING').length;state.preLogs=[];state.result=result;state.dirty=false;state.page=0;state.tab=result.fatal?'logs':'preview';$('search').value='';$('logFilter').value='all';
  showResults();$('runTitle').textContent=result.fatal?'请先修正配置。':'本次匹配已完成。';$('runHint').textContent=result.fatal?'打开处理日志查看具体原因，修改后重新运行。':`生成 ${result.records.length} 行结果。查看日志后可下载。`;
  toast(result.fatal?'配置未通过校验，请查看日志':automatic?'配置已更新，结果和日志已重算':'匹配完成，结果和日志已生成');if(!automatic)$('results').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){state.result={runId:new Date().toISOString(),fatal:true,records:[],stats:{},logs:[{time:new Date().toISOString(),level:'ERROR',code:'RUN_FAILED',message:e.message,contract:'',project:'',payable:'',file:'',sheet:'',rows:''}]};state.tab='logs';showResults();toast('处理失败：'+e.message);}
 finally{setBusy(false);}
}
function showResults(){
 const r=state.result,s=r.stats;$('results').hidden=false;$('emptyState').hidden=true;$('resultTime').textContent=new Date(r.runId).toLocaleString('zh-CN');
 const errs=r.logs.filter(x=>x.level==='ERROR').length,warns=r.logs.filter(x=>x.level==='WARNING').length;
 $('stats').innerHTML=[['清单合同',s.uniqueCodes??'—',''],['已匹配应收',s.matchedAR??'—',''],['去重应付合同',s.payableUnique??'—',''],['警告记录',warns,'warn'],['错误记录',errs,errs?'error':'']].map(([label,value,cls])=>`<div class="stat ${cls}"><span>${label}</span><strong>${value}</strong></div>`).join('');
 $('resultWarning').hidden=!warns&&!errs;
 $('resultWarning').textContent=r.fatal?'配置校验未通过，暂不生成结果表。下载日志或查看下方记录后修正。':`未匹配应收 ${s.unmatchedAR} 个；未关联应付 ${s.withoutAP} 份；${s.sharedGroups} 组跨应收汇总；${s.over100} 份占比超过100%。${s.invalidPayableAmounts?'部分应付金额无效，金额统计只包含有效数值。':''}请在日志中查看对应合同与源表行号。`;
 $('logCount').textContent=r.logs.length;renderTable();setDownloadState();
}
function renderTable(){
 if(!state.result)return;const r=state.result,search=$('search').value.trim().toLowerCase();
 document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));$('logFilter').hidden=state.tab!=='logs';
 let rows;
 if(state.tab==='logs')rows=r.logs.filter(x=>($('logFilter').value==='all'||x.level===$('logFilter').value)&&(!search||Object.values(x).join(' ').toLowerCase().includes(search)));
 else rows=r.records.filter(x=>!search||x.values.map(v=>String(v??'')).join(' ').toLowerCase().includes(search));
 const pages=Math.max(1,Math.ceil(rows.length/25));state.page=Math.min(state.page,pages-1);const slice=rows.slice(state.page*25,state.page*25+25);
 let html='';
 if(state.tab==='logs')html='<table class="preview-table"><thead><tr><th>级别 / 事件</th><th>合同 / 项目</th><th>处理说明</th><th>来源与行号</th><th>应付合同</th><th>时间</th></tr></thead><tbody>'+slice.map(l=>`<tr><td><span class="level ${h(l.level)}">${({SUCCESS:'成功',WARNING:'警告',ERROR:'错误',INFO:'信息'})[l.level]||h(l.level)}</span><br><small>${h(l.code)}</small></td><td class="long">${h(l.contract)||'—'}<br><span class="file-meta">${h(l.project)}</span></td><td class="long">${h(l.message)}</td><td class="long">${h(l.file)||'—'}<br><span class="file-meta">${h(l.sheet)} ${l.rows?'行 '+h(l.rows):''}</span></td><td>${h(l.payable)||'—'}</td><td>${h(new Date(l.time).toLocaleTimeString('zh-CN'))}</td></tr>`).join('')+'</tbody></table>';
 else html='<table class="preview-table"><thead><tr>'+r.config.columns.map(c=>`<th>${h(c.name)}</th>`).join('')+'</tr></thead><tbody>'+slice.map(rec=>'<tr>'+rec.values.map((v,i)=>{const f=r.config.columns[i].format;const text=v===null||v===undefined?'—':typeof v==='number'&&f==='money'?fmt(v):typeof v==='number'&&f==='percent'?(v*100).toFixed(2)+'%':String(v);return `<td class="${typeof v==='number'?'num':''} ${text.length>25?'long':''}">${h(text)}</td>`;}).join('')+'</tr>').join('')+'</tbody></table>';
 $('resultTable').innerHTML=rows.length?html:'<div class="empty-state"><p>没有符合条件的记录。</p></div>';
 $('pageInfo').textContent=`共 ${rows.length.toLocaleString()} 条 · 第 ${state.page+1} / ${pages} 页${state.tab==='preview'?' · 预览逐行展示，Excel按配置合并单元格':''}`;
 $('prevPage').disabled=state.page===0;$('nextPage').disabled=state.page>=pages-1;
}
async function exportResult(bundle){
 if(!state.result||state.dirty||state.result.fatal)return;setBusy(true);toast('正在生成下载文件…');
 try{const date=timestamp(),bytes=await C.exportXlsx(state.result,JSZip);if(bundle){const z=new JSZip();z.file(`合同匹配结果_${date}.xlsx`,bytes);z.file(`处理日志_${date}.txt`,C.logsTXT(state.result));z.file(`处理日志_${date}.csv`,C.logsCSV(state.result));z.file('字段配置.json',JSON.stringify(config,null,2));download(await z.generateAsync({type:'blob',compression:'DEFLATE'}),`合同匹配结果与日志_${date}.zip`);}else download(bytes,`合同匹配结果_${date}.xlsx`,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');toast('下载文件已生成');}catch(e){state.result.logs.push({time:new Date().toISOString(),level:'ERROR',code:'EXPORT_FAILED',message:e.message,contract:'',project:'',payable:'',file:'',sheet:'',rows:''});showResults();toast('导出失败，原因已写入日志：'+e.message);}finally{setBusy(false);}
}
$('runBtn').onclick=()=>execute(false);
$('trimKeys').onchange=e=>{config.trim=e.target.checked;dirty();};$('ignoreCase').onchange=e=>{config.ignoreCase=e.target.checked;dirty();};$('mergeCells').onchange=e=>{config.merge=e.target.checked;dirty();};
$('autoUpdate').onchange=e=>{config.autoUpdate=e.target.checked;dirty();};
$('addField').onclick=()=>{if(config.columns.length>=80)return toast('最多支持80列');config.columns.push({name:'新增字段'+(config.columns.length+1),source:'ar',field:'',format:'text'});renderFields();dirty();};
$('exportConfig').onclick=()=>download(JSON.stringify(config,null,2),'合同匹配字段配置.json','application/json;charset=utf-8');
$('importConfig').onclick=()=>$('configFile').click();
$('configFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1024*1024)throw Error('配置文件超过1MB');const c=JSON.parse(await f.text());if(c.version!==1||!c.joins||!c.aggregate||!Array.isArray(c.columns)||c.columns.length>80)throw Error('配置格式不正确');const def=C.defaultConfig();config={...def,...c,joins:{...def.joins,...c.joins},aggregate:{...def.aggregate,...c.aggregate}};renderJoins();renderFields();dirty();$('templateStatus').textContent='已载入自定义字段配置';toast('配置已导入，请核对源表字段');}catch(e){toast('导入失败：'+e.message);}finally{e.target.value='';}};
$('resetConfig').onclick=()=>{config=C.defaultConfig();renderJoins();renderFields();dirty();$('templateStatus').textContent='销售编码 → 应收合同 → 应付合同';toast('已恢复默认15列模板');};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.page=0;renderTable();});
$('search').oninput=()=>{state.page=0;renderTable();};$('logFilter').onchange=()=>{state.page=0;renderTable();};$('prevPage').onclick=()=>{state.page--;renderTable();};$('nextPage').onclick=()=>{state.page++;renderTable();};
$('downloadExcel').onclick=()=>exportResult(false);$('downloadBundle').onclick=()=>exportResult(true);
$('downloadLog').onclick=()=>state.result&&download('\ufeff'+C.logsTXT(state.result),`合同匹配日志_${timestamp()}.txt`,'text/plain;charset=utf-8');
$('downloadCSV').onclick=()=>state.result&&download(C.logsCSV(state.result),`合同匹配日志_${timestamp()}.csv`,'text/csv;charset=utf-8');
$('offlineDownload').onclick=()=>download(pristine,'合同匹配工作台_离线版.html','text/html;charset=utf-8');
$('helpBtn').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=$('helpDone').onclick=()=>$('helpDialog').close();
showSources();renderJoins();renderFields();
})();
