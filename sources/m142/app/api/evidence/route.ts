import {context,fail,limitedBody,safeFilename} from '@/lib/server';
import {tasks,resources,isFinalized,defaultReview,defaultSettings,type Review} from '@/lib/model';
export async function POST(request:Request){try{
 const {db,bucket,actor}=context(request,true);
 const body=await limitedBody(request,16*1024*1024,'单个文件最大15MB，表单总大小不得超过16MB');let form:FormData;
 try{form=await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('content-type')||''},body:body as BodyInit}).formData();}catch{throw new Error('422|上传表单无效，请重新选择附件');}
 const stringValue=(key:string,max:number)=>{const value=form.get(key);if(value!==null&&typeof value!=='string')throw new Error('422|证据字段格式无效');const text=String(value||'').trim();if(text.length>max)throw new Error('422|证据字段内容过长');return text;};
 const taskId=stringValue('taskId',10),resourceId=stringValue('resourceId',50),name=stringValue('name',240),note=stringValue('note',5000),url=stringValue('url',3000),file=form.get('file');
 if(taskId!=='GLOBAL'&&!tasks.some(t=>t.id===taskId))throw new Error('422|请选择有效任务');if(!resources.some(r=>r.id===resourceId))throw new Error('422|请选择资源类型');
 if(!note)throw new Error('422|请说明证据来源、权利方或授权范围');
 if(taskId==='GLOBAL'&&resourceId!=='review')throw new Error('422|全局证据用于学校审核流程，请选择“校企审核责任与审查记录”');
 const record:any=await db.prepare('SELECT * FROM records WHERE id=?').bind(taskId==='GLOBAL'?'settings':taskId).first();
 const data=record?{...JSON.parse(record.data),revision:record.revision}:null;
 if(taskId==='GLOBAL'&&data?.confirmed)throw new Error('422|学校流程已确认，新增依据前请先撤回流程确认；已有验收任务须先退回复核');
 if(taskId!=='GLOBAL'&&data){
  if(isFinalized(data as Review))throw new Error('422|任务已归档。请先退回“整改复核”并保存，再补充证据');
  if(data.resources?.[resourceId]?.status==='已确认')throw new Error('422|该资源已确认，请先将资源核对状态改为“待核实”并保存，再补充证据');
 }
 let key:null|string=null,hash:null|string=null,size=0,filename=name,originalFilename='';
 const id=crypto.randomUUID(),now=new Date().toISOString();
 if(file!==null&&!(file instanceof File))throw new Error('422|附件格式无效，请重新选择文件');
 if(file instanceof File){
  if(!file.size)throw new Error('422|附件为空，请选择非空文件或改用证据链接');
  if(url)throw new Error('422|文件和链接请只选择一种归档方式');
  if(file.size>15*1024*1024)throw new Error('413|单个文件最大15MB；大型模型可登记受控存储链接');
  if(!bucket)throw new Error('503|文件归档服务尚未就绪');
  const bytes=await file.arrayBuffer();size=bytes.byteLength;hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
  key='evidence/'+id;originalFilename=safeFilename(file.name);filename=name||originalFilename;
  await bucket.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'},customMetadata:{originalFilename}});
 }else{
  let u;try{u=new URL(url);}catch{throw new Error('422|请上传文件或填写有效https证据链接');}
  if(u.protocol!=='https:'||u.username||u.password)throw new Error('422|证据链接仅支持不含账号密码的https地址');if(!filename)throw new Error('422|请填写证据名称');
 }
 const entry={id,task_id:taskId,resource_id:resourceId,name:filename,object_key:key,url:key?null:url,size,sha256:hash,note,created_at:now,actor};
 // Evidence mutations advance the owning record version in the same transaction.
 // Other open editors must reload before approving a superseded evidence snapshot.
 const recordId=taskId==='GLOBAL'?'settings':taskId;
 const previous=data||(recordId==='settings'?defaultSettings:defaultReview(recordId));
 const next=structuredClone(previous);next.revision=previous.revision+1;
 if(recordId!=='settings')next.resources[resourceId].status='待核实';
 const nextJson=JSON.stringify(next);
 const recordWrite=record?
  db.prepare('UPDATE records SET data=?,revision=?,updated_at=? WHERE id=? AND revision=?').bind(nextJson,next.revision,now,recordId,previous.revision):
  db.prepare('INSERT INTO records (id,data,revision,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(recordId,nextJson,next.revision,now);
 try{
  const result=await db.batch([
   recordWrite,
   db.prepare('INSERT INTO evidence (id,task_id,resource_id,name,object_key,url,size,sha256,note,created_at,actor) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE changes()>0').bind(id,taskId,resourceId,filename,key,key?null:url,size,hash,note,now,actor),
   db.prepare('INSERT INTO history (id,record_id,revision,previous,next,action,actor,created_at) SELECT ?,?,?,?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),taskId,0,'{}',JSON.stringify({...entry,original_filename:originalFilename||undefined}),'证据归档',actor,now),
   db.prepare('INSERT INTO history (id,record_id,revision,previous,next,action,actor,created_at) SELECT ?,?,?,?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),recordId,next.revision,JSON.stringify(previous),nextJson,'证据关联更新',actor,now),
  ]);
  if(!result[0].meta.changes)throw new Error('409|任务或审核状态已变化，请重新载入后再归档');
 }catch(e){if(key&&bucket)await bucket.delete(key);throw e;}
 return Response.json({evidence:entry,record:next,previousRevision:previous.revision},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e);}}
