import { context,fail,limitedBody } from '@/lib/server';
import {tasks,resources,defaultReview,defaultSettings,validateReview,validateSettings,isFinalized,settingsBasisChanged,type Evidence,type Review,type Settings} from '@/lib/model';
const cursor=(row:any)=>btoa(JSON.stringify({createdAt:row.created_at,id:row.id}));
export async function GET(request:Request){try{
 const {db}=context(request);const [records,evidence,history]=await db.batch([db.prepare('SELECT * FROM records'),db.prepare('SELECT * FROM evidence ORDER BY created_at DESC,id DESC'),db.prepare('SELECT * FROM history ORDER BY created_at DESC,id DESC LIMIT 501')]);
 const first=history.results.slice(0,500);
 const loaded=records.results.map((r:any)=>({...JSON.parse(r.data),revision:r.revision}));
 const settings=loaded.find(r=>r.id==='settings')||defaultSettings,ev=evidence.results as Evidence[];
 const integrityWarnings:{recordId:string;message:string}[]=[];
 const checked=loaded.map(r=>{
  let warning:string|null=null;
  try{if(r.id==='settings'&&r.confirmed)warning=validateSettings(r,ev);else if(r.id!=='settings'&&isFinalized(r))warning=validateReview(r,settings,ev,r);}catch{warning='历史记录字段不完整，请重新核对后保存';}
  if(warning){integrityWarnings.push({recordId:r.id,message:warning});return {...r,integrityWarning:warning};}
  const {integrityWarning:_obsolete,...record}=r;return record;
 });
 return Response.json({records:checked,evidence:evidence.results,history:first,historyCursor:history.results.length>500?cursor(first[first.length-1]):null,integrityWarnings},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e);}}
export async function PUT(request:Request){try{
 const {db,actor}=context(request,true);const bytes=await limitedBody(request,150000,'记录内容过长');let incoming:any;
 try{incoming=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('422|记录格式无效，请重新载入后重试');}
 if(!incoming||typeof incoming!=='object'||Array.isArray(incoming)||typeof incoming.id!=='string'||!Number.isInteger(incoming.revision)||incoming.revision<0)throw new Error('422|记录格式无效');
 if(incoming.id!=='settings'&&!tasks.some(t=>t.id===incoming.id))throw new Error('422|任务编号不存在');
 const [allRows,allEvidence]=await db.batch([db.prepare('SELECT * FROM records'),db.prepare('SELECT * FROM evidence')]);
 const row:any=allRows.results.find((row:any)=>row.id===incoming.id);
 if((row?.revision||0)!==incoming.revision)throw new Error('409|记录已被其他页面更新，请重新载入再编辑');
 const ev=allEvidence.results as Evidence[];
 const old=row?{...JSON.parse(row.data),revision:row.revision}:(incoming.id==='settings'?defaultSettings:defaultReview(incoming.id));
 const settingsRow:any=allRows.results.find((row:any)=>row.id==='settings');
 const settings:Settings=settingsRow?{...JSON.parse(settingsRow.data),revision:settingsRow.revision}:defaultSettings;
 const template=incoming.id==='settings'?defaultSettings:defaultReview(incoming.id);
 const r:any=Object.fromEntries(Object.keys(template).map(k=>[k,incoming[k]]));
 const stringFields=Object.keys(template).filter(k=>!['revision','resources','confirmed'].includes(k));
 if(!stringFields.every(k=>typeof r[k]==='string'&&r[k].length<=20000))throw new Error('422|记录字段不完整或内容过长');
 let protectSettings=false;
 if(r.id==='settings'){
  const finalized=allRows.results.filter((x:any)=>x.id!=='settings'&&isFinalized(JSON.parse(x.data))).map((x:any)=>x.id);
  const error=validateSettings(r,ev,old,finalized);if(error)throw new Error('422|'+error);
  protectSettings=settingsBasisChanged(old,r);
 }else{
  if(!r.resources||typeof r.resources!=='object'||Array.isArray(r.resources)||Object.keys(r.resources).length!==resources.length)throw new Error('422|资源记录字段不完整');
  for(const x of resources){const v=r.resources[x.id];if(!v||!['status','note','reviewer'].every(k=>typeof v[k]==='string'&&v[k].length<=20000))throw new Error('422|资源记录字段无效');}
  r.resources=Object.fromEntries(resources.map(x=>[x.id,{status:r.resources[x.id].status,note:r.resources[x.id].note,reviewer:r.resources[x.id].reviewer}]));
  const error=validateReview(r,settings,ev,old);if(error)throw new Error('422|'+error);
 }
 const now=new Date().toISOString(),revision=r.revision+1,data=JSON.stringify({...r,revision});
 // Couple task approval to the exact validated school baseline, and couple baseline edits
 // to absence of finalized tasks. These conditions run inside the write transaction.
 const gate=r.id!=='settings'?" AND COALESCE((SELECT revision FROM records WHERE id='settings'),0)=?":protectSettings?" AND NOT EXISTS(SELECT 1 FROM records WHERE id<>'settings' AND (json_extract(data,'$.status')='已确认' OR json_extract(data,'$.stage')='验收归档'))":'';
 const gateParams=r.id!=='settings'?[settings.revision]:[];
 const statement=row?
  db.prepare('UPDATE records SET data=?,revision=?,updated_at=? WHERE id=? AND revision=?'+gate).bind(data,revision,now,r.id,r.revision,...gateParams):
  db.prepare('INSERT INTO records (id,data,revision,updated_at) SELECT ?,?,?,? WHERE 1=1'+gate+' ON CONFLICT(id) DO NOTHING').bind(r.id,data,revision,now,...gateParams);
 const out=await db.batch([statement,db.prepare('INSERT INTO history (id,record_id,revision,previous,next,action,actor,created_at) SELECT ?,?,?,?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),r.id,revision,JSON.stringify(old),data,r.id==='settings'?'学校流程登记':r.stage!==old.stage?'阶段流转':'记录更新',actor,now)]);
 if(!out[0].meta.changes)throw new Error('409|记录或学校审核基线已变化，请重新载入后再保存');
 return Response.json({record:JSON.parse(data)},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e);}}
