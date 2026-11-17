(function(root){
'use strict';
const VERSION='1.0.0';
const SOURCES={list:'合同编码清单',ar:'应收合同表',ap:'应付合同表'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
const decode=v=>String(v||'').replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos);/gi,(m,n,e)=>n?String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[e.toLowerCase()]));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1],decode(m[2]??m[3])]));
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const colIndex=s=>[...s].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
const txt=s=>[...s.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map(m=>decode(m[1])).join('');
const val=(row,key)=>row?.cells?.[key]??null;
const norm=(x,c)=>{let s=String(x??'');if(c.trim)s=s.trim();return c.ignoreCase?s.toUpperCase():s;};
function parseMoney(x){
 if(x===null||x===undefined||String(x).trim()==='')return {ok:false,reason:'金额为空'};
 if(typeof x==='number')return Number.isFinite(x)&&Math.abs(x)<90071992547409?{ok:true,cents:Math.round(x*100)}:{ok:false,reason:'金额超出可计算范围'};
 let s=String(x).trim().replace(/[，,\s¥￥]/g,'');
 if(/^\(.*\)$/.test(s))s='-'+s.slice(1,-1);
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return {ok:false,reason:'金额不是有效数值'};
 const n=Number(s);return Number.isFinite(n)&&Math.abs(n)<90071992547409?{ok:true,cents:Math.round(n*100)}:{ok:false,reason:'金额超出可计算范围'};
}
function defaultConfig(){return {version:1,trim:true,ignoreCase:false,merge:true,autoUpdate:true,sourcePrefs:{},joins:{listKey:'销售合同编码',arKey:'合同编号',arProject:'项目编码',apProject:'项目编码',apIdentity:'应付合同编号'},aggregate:{group:'合同名称',payAmount:'合同总金额',arAmount:'合同金额'},columns:[
 ['应收合同编号','ar','合同编号'],['应收合同名称','ar','合同名称'],['签订主体','ar','甲方名称'],['应收合同金额','ar','合同金额','money'],['转分包情况','fixed','转分包'],['对方是否同意出具书面确认文件','fixed','否'],['销售负责人','ar','销售人员'],['销售部门','ar','销售部门'],['项目编码','ar','项目编码'],['应付合同编号','ap','应付合同编号'],['应付合同名称','ap','应付合同名称'],['供应商','ap','供应商'],['应付合同总金额','ap','合同总金额','money'],['同一应收合同不同应付合同总额','total','','money'],['占比','ratio','','percent']
 ].map(([name,source,field,format])=>({name,source,field,format:format||'text'}))};}
async function openXlsx(bytes,name,Zip){
 const zip=await Zip.loadAsync(bytes);let total=0;
 async function read(p){const f=zip.file(p);if(!f)return '';const s=await f.async('string');total+=s.length;if(total>200*1024*1024)throw Error('解压内容超过200MB，请拆分文件后处理');return s;}
 const book=await read('xl/workbook.xml');if(!book)throw Error('不是有效的.xlsx工作簿');
 const relations=await read('xl/_rels/workbook.xml.rels');
 const relMap=new Map([...relations.matchAll(/<Relationship\b([^>]*)\/?\s*>/g)].map(m=>{const a=attrs(m[1]);return [a.Id,a.Target]}));
 const sheets=[...book.matchAll(/<sheet\b([^>]*)\/?\s*>/g)].map(m=>{const a=attrs(m[1]);let p=relMap.get(a['r:id']);if(!p)return null;p=p.startsWith('/')?p.slice(1):'xl/'+p;const parts=[];for(const t of p.split('/'))t==='..'?parts.pop():t!=='.'&&parts.push(t);return {name:a.name,path:parts.join('/'),state:a.state||'visible'};}).filter(Boolean);
 const strings=[...(await read('xl/sharedStrings.xml')).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(m=>txt(m[1]));
 const styles=await read('xl/styles.xml');const custom=new Map([...styles.matchAll(/<numFmt\b([^>]*)\/?\s*>/g)].map(m=>{const a=attrs(m[1]);return [Number(a.numFmtId),a.formatCode]}));
 const xf=(styles.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/)||[])[1]||'';
 const dates=[...xf.matchAll(/<xf\b([^>]*)>/g)].map(m=>{const id=Number(attrs(m[1]).numFmtId||0);return (id>=14&&id<=22)||(id>=45&&id<=47)||/[yd]/i.test((custom.get(id)||'').replace(/"[^"]*"|\[[^\]]*\]/g,''));});
 const date1904=/date1904=["'](?:1|true)["']/.test(book);
 const cache=new Map();
 async function getSheet(index){
  if(cache.has(index))return cache.get(index);if(!sheets[index])throw Error('工作表不存在');
  const xml=await read(sheets[index].path);const rows=[],issues=[];
  for(const m of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)){
   const row={row:Number(attrs(m[1]).r),cells:{}};
   for(const cm of m[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
    const a=attrs(cm[1]),body=cm[2]||'',key=(a.r||'').replace(/\d/g,'');if(!key)continue;
    const vm=body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);let v=null;
    if(a.t==='s')v=vm?strings[Number(vm[1])]??null:null;
    else if(a.t==='inlineStr')v=txt(body);
    else if(vm){v=decode(vm[1]);if(!['str','e'].includes(a.t)){const n=Number(v);if(v!==''&&Number.isFinite(n))v=n;}if(a.t==='b')v=Number(v)?'是':'否';}
    if(typeof v==='number'&&dates[Number(a.s||0)]){const date=new Date((v-(date1904?24107:25569))*86400000);if(!Number.isNaN(date.getTime()))v=date.toISOString().slice(0,10);}
    if(a.t==='e')issues.push({row:row.row,cell:a.r,code:'SOURCE_CELL_ERROR',message:`源单元格错误：${v}`});
    if(/<f(?:\s|>)/.test(body)&&!vm)issues.push({row:row.row,cell:a.r,code:'FORMULA_NO_CACHE',message:'公式没有已保存的计算结果，请在Excel中重算并保存'});
    if(v!==null&&v!=='')row.cells[key]=v;
   }
   if(Object.keys(row.cells).length)rows.push(row);
  }
  const result={name:sheets[index].name,rows,issues};cache.set(index,result);return result;
 }
 return {name,sheets,getSheet};
}
function detectHeader(sheet){
 let best=sheet.rows[0]?.row||1,score=-1;
 for(const r of sheet.rows.slice(0,30)){const values=Object.values(r.cells);let n=values.filter(v=>typeof v==='string').length+values.filter(v=>/合同|编码|项目|供应商|金额|销售/.test(String(v))).length*3;if(n>score){score=n;best=r.row;}}
 return best;
}
function prepareSource(workbook,sheet,headerRow){
 const row=sheet.rows.find(r=>r.row===Number(headerRow));if(!row)throw Error('指定表头行没有数据');
 const headers=Object.entries(row.cells).map(([key,label])=>({key,label:String(label).trim()})).filter(h=>h.label);
 if(!headers.length)throw Error('没有识别到字段');
 return {fileName:workbook.name,sheetName:sheet.name,headerRow:Number(headerRow),headers,rows:sheet.rows.filter(r=>r.row>Number(headerRow)),issues:sheet.issues||[]};
}
function resolve(source,field){return source?.headers.find(h=>h.key===field)?.key||source?.headers.find(h=>h.label===field)?.key||null;}
function resolvedConfig(config,sources){
 const c=JSON.parse(JSON.stringify(config)),j=c.joins,a=c.aggregate;
 for(const [name,s]of Object.entries({listKey:'list',arKey:'ar',arProject:'ar',apProject:'ap',apIdentity:'ap'}))j[name]=j[name]?resolve(sources[s],j[name]):null;
 a.group=resolve(sources.ar,a.group);a.payAmount=resolve(sources.ap,a.payAmount);a.arAmount=resolve(sources.ar,a.arAmount);
 c.columns=c.columns.map(x=>({...x,field:['list','ar','ap'].includes(x.source)?resolve(sources[x.source],x.field):x.field}));return c;
}
function run(sources,config){
 const c=resolvedConfig(config,sources),logs=[],runId=new Date().toISOString(),j=c.joins;
 const log=(level,code,message,ctx={})=>logs.push({time:new Date().toISOString(),level,code,contract:'',project:'',file:'',sheet:'',rows:'',payable:'',...ctx,message});
 const sourceCtx=(kind,row)=>({file:sources[kind]?.fileName||'',sheet:sources[kind]?.sheetName||'',rows:row??''});
 const failure=msg=>log('ERROR','CONFIG_INVALID',msg);
 for(const kind of ['list','ar','ap'])if(!sources[kind])failure(`请导入${SOURCES[kind]}`);
 for(const field of ['listKey','arKey','arProject','apProject'])if(!j[field])failure(`匹配字段未配置或不存在：${field}`);
 for(const field of ['group','payAmount','arAmount'])if(!c.aggregate[field])failure(`汇总字段未配置或不存在：${field}`);
 if(!c.columns.length)failure('至少保留一个输出字段');
 if(c.columns.length>80)failure('输出字段最多80列');
 const headerNames=new Set();
 for(const x of c.columns){if(!x.name.trim())failure('输出列名不能为空');if(headerNames.has(x.name.trim()))failure(`输出列名重复：${x.name}`);headerNames.add(x.name.trim());if(['list','ar','ap'].includes(x.source)&&!x.field)failure(`字段不存在：${x.name}`);if(!['list','ar','ap','fixed','total','ratio'].includes(x.source))failure(`未知来源：${x.name}`);}
 if(logs.length)return {runId,logs,records:[],contracts:[],groups:[],config:c,stats:{},fatal:true};
 for(const [kind,s]of Object.entries(sources)){
  log('INFO','FILE_LOADED',`${SOURCES[kind]}已读取，数据行${s.rows.length}行`,sourceCtx(kind));
  for(const e of s.issues)log('WARNING',e.code,e.message,{...sourceCtx(kind,e.row),cell:e.cell});
 }
 const index=(rows,key)=>{const map=new Map();for(const row of rows){const k=norm(val(row,key),c);if(!k)continue;if(!map.has(k))map.set(k,[]);map.get(k).push(row);}return map;};
 const arIndex=index(sources.ar.rows,j.arKey),apIndex=index(sources.ap.rows,j.apProject),apIdIndex=j.apIdentity?index(sources.ap.rows,j.apIdentity):new Map();
 const contracts=[],seenList=new Map(),projectOwners=new Map(),usedAp=new Map(),groupsMap=new Map();
 for(const lr of sources.list.rows){
  const key=norm(val(lr,j.listKey),c);if(!key){log('WARNING','LIST_KEY_EMPTY','清单匹配字段为空，跳过该行',sourceCtx('list',lr.row));continue;}
  if(seenList.has(key)){log('WARNING','LIST_DUPLICATE','清单编码重复，保留首次记录',{contract:key,...sourceCtx('list',`${seenList.get(key)},${lr.row}`)});continue;}
  seenList.set(key,lr.row);
  const arMatches=arIndex.get(key)||[];
  const item={key,list:lr,ar:null,project:'',payables:[],status:'',group:null,partial:false,denom:null};contracts.push(item);
  if(arMatches.length!==1){item.status=arMatches.length?'应收匹配键重复':'未匹配应收';log(arMatches.length?'ERROR':'WARNING',arMatches.length?'AR_KEY_AMBIGUOUS':'AR_NOT_FOUND',arMatches.length?`找到${arMatches.length}条应收记录，未自动选择；请处理重复键`:'应收表中没有匹配记录',{contract:key,...sourceCtx('ar',arMatches.map(x=>x.row).join(',')||''),listRow:lr.row});continue;}
  const ar=item.ar=arMatches[0];item.project=norm(val(ar,j.arProject),c);
  const context={contract:key,project:item.project};
  log('SUCCESS','AR_MATCHED','成功匹配应收合同',{...context,...sourceCtx('ar',ar.row),listRow:lr.row});
  const rawGroup=val(ar,c.aggregate.group),groupKey=norm(rawGroup,c)||`__missing_group_${key}`;
  if(!groupsMap.has(groupKey))groupsMap.set(groupKey,{id:groupsMap.size+1,key:groupKey,label:rawGroup??'',contracts:[],payables:new Map(),partial:false,total:null});
  item.group=groupsMap.get(groupKey);item.group.contracts.push(item);
  if(!norm(rawGroup,c)){item.partial=true;log('ERROR','GROUP_EMPTY','汇总分组字段为空；本合同合计与占比留空',{...context,...sourceCtx('ar',ar.row)});}
  const denominator=parseMoney(val(ar,c.aggregate.arAmount));
  if(denominator.ok){item.denom=denominator.cents;if(!item.denom)log('WARNING','AR_AMOUNT_ZERO','应收金额为0，占比留空',{...context,...sourceCtx('ar',ar.row)});}
  else log('ERROR','AR_AMOUNT_INVALID',`${denominator.reason}；占比留空`,{...context,...sourceCtx('ar',ar.row)});
  if(!item.project){item.status='缺少项目编码';item.partial=true;log('WARNING','PROJECT_EMPTY','应收项目匹配字段为空，未执行空值关联',{...context,...sourceCtx('ar',ar.row)});continue;}
  if(!projectOwners.has(item.project))projectOwners.set(item.project,[]);projectOwners.get(item.project).push(item);
  const matches=apIndex.get(item.project)||[];
  if(!matches.length){item.status='未匹配应付';log('WARNING','AP_NOT_FOUND','应付表中没有该项目的匹配记录',{...context,...sourceCtx('ap'),arRow:ar.row});continue;}
  const payGroups=new Map();
  for(const row of matches){const id=j.apIdentity?norm(val(row,j.apIdentity),c):'';const uniq=id?`id:${id}`:`row:${row.row}`;if(!payGroups.has(uniq))payGroups.set(uniq,[]);payGroups.get(uniq).push(row);}
  for(const [uniq,ps]of payGroups){
   const p=ps[0],id=j.apIdentity?String(val(p,j.apIdentity)??''):'';
   if(j.apIdentity&&!id)log('WARNING','AP_ID_EMPTY','应付去重字段为空，按源表行保留',{...context,...sourceCtx('ap',p.row)});
   const idMatches=id?apIdIndex.get(norm(id,c))||[]:[];
   if(idMatches.some(x=>norm(val(x,j.apProject),c)!==item.project)){item.partial=true;log('ERROR','AP_ID_PROJECT_CONFLICT','同一应付编号对应不同项目，跳过关联并将受影响分组合计、占比留空',{...context,payable:id,...sourceCtx('ap',idMatches.map(x=>x.row).join(','))});continue;}
   if(ps.length>1){
    const signature=r=>JSON.stringify(Object.entries(r.cells).sort(([a],[b])=>a.localeCompare(b)));
    if(new Set(ps.map(signature)).size>1){item.partial=true;log('ERROR','AP_DUPLICATE_CONFLICT','同一应付编号存在不同内容，全部冲突记录跳过；所在分组合计与占比留空',{...context,payable:id,...sourceCtx('ap',ps.map(x=>x.row).join(','))});continue;}
    log('WARNING','AP_DUPLICATE_REMOVED','应付记录完全重复，仅保留首次记录',{...context,payable:id,...sourceCtx('ap',ps.map(x=>x.row).join(','))});
   }
   const amount=parseMoney(val(p,c.aggregate.payAmount));
   const pay={row:p,id,identity:uniq,cents:amount.ok?amount.cents:null,sourceId:`${item.project}|${uniq}`};
   item.payables.push(pay);usedAp.set(pay.sourceId,pay);
   if(!amount.ok){item.partial=true;log('ERROR','AP_AMOUNT_INVALID',`${amount.reason}；保留原始记录，所在分组合计与占比留空`,{...context,payable:id,...sourceCtx('ap',p.row)});}
   else log('SUCCESS','AP_MATCHED','成功匹配应付合同',{...context,payable:id,...sourceCtx('ap',p.row),arRow:ar.row,amount:amount.cents/100});
   item.group.payables.set(pay.sourceId,pay);
  }
  item.status=item.partial?'匹配存在异常':item.payables.length?'匹配成功':'应付记录均存在冲突';
 }
 for(const [project,items]of projectOwners)if(items.length>1)log('WARNING','PROJECT_SHARED',`同一项目被${items.length}份应收合同引用，按项目关联完整应付记录；未进行金额分摊`,{project,contract:items.map(x=>x.key).join('；')});
 const groups=[...groupsMap.values()];
 for(const group of groups){
  group.partial=group.contracts.some(x=>x.partial);
  if(group.contracts.length>1)log('WARNING','GROUP_SHARED',`同一汇总字段值对应${group.contracts.length}份应收，按当前分组规则汇总；组内相同应付只计一次`,{contract:group.contracts.map(x=>x.key).join('；'),messageGroup:group.label});
  if(group.payables.size&&!group.partial)group.total=[...group.payables.values()].reduce((s,p)=>s+p.cents,0);
 }
 const records=[];
 for(const item of contracts){
  item.ratio=item.group?.total!==null&&item.group?.total!==undefined&&item.denom?item.group.total/item.denom:null;
  if(item.ratio>1)log('WARNING','RATIO_OVER_100','应付合计占比超过100%，请核对合同分组与项目归属',{contract:item.key,project:item.project,ratio:item.ratio});
  const ps=item.payables.length?item.payables:[null];
  item.start=records.length;
  for(const pay of ps)records.push({item,pay,detailRow:records.length+2});
  item.end=records.length-1;
 }
 for(const rec of records){rec.values=c.columns.map(column=>{
  if(column.source==='fixed')return column.field;
  if(column.source==='total')return rec.item.group?.total===null||rec.item.group?.total===undefined?null:rec.item.group.total/100;
  if(column.source==='ratio')return rec.item.ratio;
  let value=column.source==='list'?val(rec.item.list,column.field):column.source==='ar'?val(rec.item.ar,column.field):val(rec.pay?.row,column.field);
  if(column.source==='ar'&&column.field===j.arKey&&!rec.item.ar)value=rec.item.key;
  if(column.format==='money'&&value!==null){const n=parseMoney(value);if(n.ok)return n.cents/100;log('WARNING','OUTPUT_AMOUNT_INVALID',`输出字段“${column.name}”不是有效金额，按原始文本保留`,{contract:rec.item.key,project:rec.item.project});}
  return value;
 });}
 const stats={inputRows:sources.list.rows.length,uniqueCodes:contracts.length,matchedAR:contracts.filter(x=>x.ar).length,unmatchedAR:contracts.filter(x=>!x.ar).length,withAP:contracts.filter(x=>x.payables.length).length,withoutAP:contracts.filter(x=>x.ar&&!x.payables.length).length,payableUnique:usedAp.size,payableLinks:records.filter(x=>x.pay).length,outputRows:records.length,arTotal:contracts.reduce((s,x)=>s+(x.denom??0),0)/100,payableTotal:[...usedAp.values()].reduce((s,x)=>s+(x.cents??0),0)/100,invalidPayableAmounts:[...usedAp.values()].filter(x=>x.cents===null).length,sharedGroups:groups.filter(x=>x.contracts.length>1).length,over100:contracts.filter(x=>x.ratio>1).length};
 log('INFO','RUN_FINISHED',`完成：${stats.uniqueCodes}个清单编码，${stats.matchedAR}份应收，${stats.payableUnique}笔去重应付，输出${stats.outputRows}行`);
 stats.success=logs.filter(x=>x.level==='SUCCESS').length;stats.warnings=logs.filter(x=>x.level==='WARNING').length;stats.errors=logs.filter(x=>x.level==='ERROR').length;
 return {runId,config:c,originalConfig:JSON.parse(JSON.stringify(config)),sources:Object.fromEntries(Object.entries(sources).map(([k,v])=>[k,{fileName:v.fileName,sheetName:v.sheetName,headerRow:v.headerRow,headers:v.headers}])),contracts,groups,records,logs,stats,fatal:false};
}
function logRows(result){return result.logs.map(l=>[l.time,l.level,l.code,l.contract,l.project,l.payable,l.file,l.sheet,l.rows,l.message,JSON.stringify(Object.fromEntries(Object.entries(l).filter(([k])=>!['time','level','code','contract','project','payable','file','sheet','rows','message'].includes(k))))]);}
const LOG_HEADERS=['时间','级别','事件编码','清单/应收合同','项目编码','应付合同编号','来源文件','工作表','源表行号','处理说明','补充信息'];
function csvCell(v){let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function logsCSV(result){return '\ufeff'+[LOG_HEADERS,...logRows(result)].map(r=>r.map(csvCell).join(',')).join('\r\n');}
function logsTXT(result){return `合同匹配工作台 v${VERSION}\n运行时间：${result.runId}\n统计：${JSON.stringify(result.stats)}\n\n`+result.logs.map(l=>`[${l.time}] [${l.level}] [${l.code}] ${l.contract?'合同='+l.contract+' ':''}${l.project?'项目='+l.project+' ':''}${l.file?'来源='+l.file+'/'+l.sheet+' 行'+l.rows+' ':''}${l.payable?'应付='+l.payable+' ':''}${l.message}${l.listRow?'；清单源行='+l.listRow:''}${l.arRow?'；应收源行='+l.arRow:''}${l.messageGroup?'；分组值='+l.messageGroup:''}`).join('\n');}
const formula=(f,v,style=0)=>({f,v,style});
function worksheetXML(rows,{widths=[],merges=[],freeze=1,filter=false,headerRows=[1],styleFn=null}={}){
 const rowHeight=(r,ri)=>{const lines=Math.max(1,...r.map((cell,ci)=>{const v=cell&&typeof cell==='object'?cell.v:cell;const units=[...String(v??'')].reduce((n,ch)=>n+(ch.charCodeAt(0)>255?2:1),0);const width=r.length===1?widths.reduce((a,b)=>a+b,0)||120:widths[ci]||22;return Math.ceil(units/Math.max(8,width-2));}));return Math.min(220,Math.max(ri<freeze?30:44,lines*15+8));};
 const xmlRows=rows.map((r,ri)=>`<row r="${ri+1}" ht="${rowHeight(r,ri)}" customHeight="1">${r.map((cell,ci)=>{
  const address=col(ci)+(ri+1);let v=cell,f=null,s=headerRows.includes(ri+1)?1:0;
  if(styleFn)s=styleFn(ri,ci,cell)??s;
  if(cell&&typeof cell==='object'){v=cell.v;f=cell.f;s=cell.style??s;}
  if(v===null||v===undefined||v==='')return f?`<c r="${address}" s="${s}" t="str"><f>${esc(f.replace(/^=/,''))}</f><v></v></c>`:`<c r="${address}" s="${s}"/>`;
  if(typeof v==='number')return `<c r="${address}" s="${s}">${f?`<f>${esc(f.replace(/^=/,''))}</f>`:''}<v>${v}</v></c>`;
  if(f)return `<c r="${address}" s="${s}" t="str"><f>${esc(f.replace(/^=/,''))}</f><v>${esc(v)}</v></c>`;
  return `<c r="${address}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
 }).join('')}</row>`).join('');
 const maxCols=Math.max(...rows.map(r=>r.length),1);return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${col(maxCols-1)}${rows.length}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane xSplit="1" ySplit="${freeze}" topLeftCell="B${freeze+1}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="30"/><cols>${Array.from({length:maxCols},(_,i)=>`<col min="${i+1}" max="${i+1}" width="${widths[i]||22}" customWidth="1"/>`).join('')}</cols><sheetData>${xmlRows}</sheetData>${filter?`<autoFilter ref="A${freeze}:${col(maxCols-1)}${rows.length}"/>`:''}${merges.length?`<mergeCells count="${merges.length}">${merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells>`:''}<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="8" fitToWidth="1" fitToHeight="0"/></worksheet>`;
}
function stylesXML(){
 const base=(id,fill=0,font=0)=>`<xf numFmtId="${id}" fontId="${font}" fillId="${fill}" borderId="1" xfId="0" applyAlignment="1" applyNumberFormat="1"><alignment vertical="center" horizontal="${id?'right':'left'}" wrapText="1"/></xf>`;
 return `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00;[Red](#,##0.00);0.00"/><numFmt numFmtId="165" formatCode="0.00%"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Microsoft YaHei"/><color rgb="FF243644"/></font><font><b/><sz val="11"/><name val="Microsoft YaHei"/><color rgb="FFFFFFFF"/></font><font><b/><sz val="16"/><name val="Microsoft YaHei"/><color rgb="FF243644"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF223B4E"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF0D4"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border/><border><bottom style="hair"><color rgb="FFD6DEE3"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8">${base(0)}${base(0,2,1)}${base(164)}${base(165)}${base(0,3)}${base(164,3)}${base(0,0,2)}${base(165,3)}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}
async function exportXlsx(result,Zip){
 if(result.fatal||!result.records.length)throw Error('没有可导出的处理结果');
 const cfg=result.config,detail=[],counted=new Set();
 const detailHeader=['序号','清单编码','应收匹配键','汇总分组ID','项目编码','应付去重标识','应收金额','应付金额','匹配状态','清单来源','清单源行','应收来源','应收源行','应付来源','应付源行','计入分组合计','汇总字段值','项目状态','项目经理'];
 for(const [i,r]of result.records.entries()){
  const k=`${r.item.group?.id}|${r.pay?.sourceId}`,count=r.pay&&!counted.has(k)?1:0;if(r.pay)counted.add(k);
  detail.push([i+1,r.item.key,val(r.item.ar,cfg.joins.arKey),r.item.group?.id??null,r.item.project,r.pay?.identity??null,r.item.denom===null?null:r.item.denom/100,r.pay?.cents===null||r.pay?.cents===undefined?null:r.pay.cents/100,r.item.status,`${result.sources.list.fileName}/${result.sources.list.sheetName}`,r.item.list.row,r.item.ar?`${result.sources.ar.fileName}/${result.sources.ar.sheetName}`:null,r.item.ar?.row??null,r.pay?`${result.sources.ap.fileName}/${result.sources.ap.sheetName}`:null,r.pay?.row.row??null,count,r.item.group?.label??null,val(r.item.ar,resolve(result.sources.ar,'项目状态')),val(r.pay?.row,resolve(result.sources.ap,'项目经理'))]);
 }
 const last=detail.length+1,mainRows=[['合同转分包情况汇总'],[`生成时间：${result.runId}；金额单位：元。按配置关联、分组与去重；异常详见处理日志。`],[`清单${result.stats.uniqueCodes}个；匹配应收${result.stats.matchedAR}份；去重应付${result.stats.payableUnique}笔；警告${result.stats.warnings}条；错误${result.stats.errors}条。`],cfg.columns.map(c=>c.name)];
 const merges=[];if(cfg.columns.length>1)for(let r=1;r<=3;r++)merges.push(`A${r}:${col(cfg.columns.length-1)}${r}`);
 const sumFormula=d=>`SUMIFS('匹配明细'!$H$2:$H$${last},'匹配明细'!$D$2:$D$${last},'匹配明细'!D${d},'匹配明细'!$P$2:$P$${last},1)`;
 for(const [i,r]of result.records.entries()){
  const excelRow=i+5,dr=i+2;
  mainRows.push(cfg.columns.map((cc,ci)=>{
   const same=cc.source!=='ap';if(cfg.merge&&same&&i!==r.item.start)return null;
   let v=r.values[ci],s=cc.format==='money'?2:cc.format==='percent'?3:0;
   if(r.item.status!=='匹配成功')s=s===2?5:s===3?7:4;
   if(cc.source==='total'&&v!==null)return formula('='+sumFormula(dr),v,s);
   if(cc.source==='ratio'&&v!==null)return formula(`=IF('匹配明细'!G${dr}=0,"",${sumFormula(dr)}/'匹配明细'!G${dr})`,v,s);
   if(cc.source==='ar'&&cc.field===cfg.aggregate.arAmount&&r.item.denom!==null)return formula(`='匹配明细'!G${dr}`,v,s);
   if(cc.source==='ap'&&cc.field===cfg.aggregate.payAmount&&r.pay?.cents!==null&&r.pay)return formula(`='匹配明细'!H${dr}`,v,s);
   return {v,style:s};
  }));
 }
 if(cfg.merge)for(const item of result.contracts)if(item.end>item.start)cfg.columns.forEach((cc,ci)=>{if(cc.source!=='ap')merges.push(`${col(ci)}${item.start+5}:${col(ci)}${item.end+5}`);});
 const sheets=[{name:'合同汇总',xml:worksheetXML(mainRows,{widths:cfg.columns.map(c=>/名称|主体|供应商/.test(c.name)?42:/编号|编码/.test(c.name)?27:/书面|总额/.test(c.name)?25:20),merges,freeze:4,headerRows:[4],styleFn:(ri,ci)=>ri===0?6:ri===3?1:null})},{name:'匹配明细',xml:worksheetXML([detailHeader,...detail],{widths:[10,29,29,12,29,30,20,20,24,44,12,44,12,44,12,18,48],filter:true,styleFn:(ri,ci)=>ri===0?1:[6,7].includes(ci)?2:0})},{name:'处理日志',xml:worksheetXML([LOG_HEADERS,...logRows(result)],{widths:[27,14,28,32,29,30,36,24,20,75,60],filter:true,styleFn:(ri,ci)=>ri===0?1:['WARNING','ERROR'].includes(result.logs[ri-1]?.level)?4:0})}];
 const zip=new Zip();
 zip.file('[Content_Types].xml',`<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
 zip.file('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 zip.file('xl/workbook.xml',`<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${s.name}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`);
 zip.file('xl/_rels/workbook.xml.rels',`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
 zip.file('xl/styles.xml',stylesXML());sheets.forEach((s,i)=>zip.file(`xl/worksheets/sheet${i+1}.xml`,s.xml));
 return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
root.ContractCore={VERSION,defaultConfig,openXlsx,detectHeader,prepareSource,resolve,resolvedConfig,parseMoney,run,logsCSV,logsTXT,exportXlsx,LOG_HEADERS,logRows,col};
if(typeof module!=='undefined')module.exports=root.ContractCore;
})(typeof globalThis!=='undefined'?globalThis:this);
