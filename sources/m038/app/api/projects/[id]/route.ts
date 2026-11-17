import {projectContext,validId,jsonError,ProjectError,requireSameSite,boundedBody} from '@/lib/server/projects';
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){try{
 const {db,bucket,owner}=await projectContext();const id=validId((await context.params).id);
 const project=await db.prepare('SELECT revision, blob_key FROM teaching_projects WHERE id = ? AND owner = ?').bind(id,owner).first<{revision:number;blob_key:string}>();if(!project)throw new ProjectError('项目不存在或无权访问。',404);
 const wanted=new URL(request.url).searchParams.get('revision');let key=project.blob_key,revision=project.revision;
 if(wanted!==null){revision=Number(wanted);if(!Number.isInteger(revision)||revision<1)throw new ProjectError('版本编号无效。',400);const version=await db.prepare('SELECT blob_key FROM teaching_versions WHERE project_id = ? AND revision = ?').bind(id,revision).first<{blob_key:string}>();if(!version)throw new ProjectError('此版本不存在。',404);key=version.blob_key;}
 const blob=await bucket.get(key);if(!blob)throw new ProjectError('项目文件暂不可用，请稍后重试。',503);
 return new Response(blob.body,{headers:{'Content-Type':'application/octet-stream','Cache-Control':'private, no-store','X-Project-Revision':String(revision),'X-Content-Type-Options':'nosniff'}});
 }catch(e){return jsonError(e);}}
export async function PUT(request:Request,context:Context){try{
 requireSameSite(request);const{db,bucket,owner}=await projectContext();const id=validId((await context.params).id);
 const previous=Number(request.headers.get('x-project-revision'));if(!Number.isInteger(previous)||previous<0||previous>100000)throw new ProjectError('项目版本无效，请重新打开项目。',400);
 let name:string,modelName:string;try{name=decodeURIComponent(request.headers.get('x-project-name')||'').trim();modelName=decodeURIComponent(request.headers.get('x-model-name')||'').trim();}catch{throw new ProjectError('项目名称无效。',400);}
 if(!name||name.length>180||modelName.length>180)throw new ProjectError('项目名称应为 1–180 个字符。',400);
 const existing=await db.prepare('SELECT owner, revision FROM teaching_projects WHERE id = ?').bind(id).first<{owner:string;revision:number}>();
 if(existing&&existing.owner!==owner)throw new ProjectError('项目不存在或无权访问。',404);
 if((existing?.revision??0)!==previous)throw new ProjectError('云端已有更新版本，当前内容未覆盖。请另存项目或重新打开最新版本。',409);
 const bytes=await boundedBody(request,64*1024*1024),revision=previous+1,time=new Date().toISOString(),key=`teaching/${id}/${revision}-${crypto.randomUUID()}.siwei`;
 await bucket.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
 try{
  const update=previous===0?db.prepare('INSERT INTO teaching_projects (id,owner,name,model_name,revision,blob_key,bytes,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,owner,name,modelName,revision,key,bytes.length,time):db.prepare('UPDATE teaching_projects SET name=?,model_name=?,revision=?,blob_key=?,bytes=?,updated_at=? WHERE id=? AND owner=? AND revision=?').bind(name,modelName,revision,key,bytes.length,time,id,owner,previous);
  const results=await db.batch([update,db.prepare('INSERT INTO teaching_versions (project_id,revision,blob_key,bytes,created_at) SELECT id,revision,blob_key,bytes,updated_at FROM teaching_projects WHERE id=? AND owner=? AND blob_key=?').bind(id,owner,key)]);
  if(!results[0].meta.changes)throw new ProjectError('保存时出现版本冲突，当前编辑已保留，请另存项目。',409);
 }catch(e){
  // A transport failure may occur after D1 committed. Never delete a referenced blob.
  let referenced=true;try{referenced=!!await db.prepare('SELECT id FROM teaching_projects WHERE id=? AND blob_key=?').bind(id,key).first();}catch{}
  if(!referenced)await bucket.delete(key).catch(()=>{});throw e;
 }
 return Response.json({id,revision,updatedAt:time,bytes:bytes.length});
 }catch(e){return jsonError(e);}}
