import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export class ProjectError extends Error{constructor(message:string,public status:number){super(message);}}
export async function projectContext(){
 const user=await getChatGPTUser();if(!user)throw new ProjectError('请先登录后保存云端项目。您仍可下载本地课件包。',401);
 const bindings=env as unknown as {DB?:D1Database;BUCKET?:R2Bucket};
 if(!bindings.DB||!bindings.BUCKET)throw new ProjectError('云端存储暂不可用，请先下载课件包保留当前成果。',503);
 return{db:bindings.DB,bucket:bindings.BUCKET,owner:user.userId};
}
export function validId(id:string){if(!/^[\da-f-]{36}$/i.test(id))throw new ProjectError('项目编号无效。',400);return id;}
export function jsonError(error:unknown){if(error instanceof ProjectError)return Response.json({error:error.message},{status:error.status});console.error('Project storage operation failed',error);return Response.json({error:'云端操作失败，当前编辑仍保留，请稍后重试或下载课件包。'},{status:503});}
export function requireSameSite(request:Request){if(request.headers.get('sec-fetch-site')==='cross-site')throw new ProjectError('请在工作台内保存项目。',403);}
export async function boundedBody(request:Request,max:number){const stream=request.body;if(!stream)throw new ProjectError('项目内容为空。',400);const reader=stream.getReader();const chunks:Uint8Array[]=[];let size=0;while(true){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>max){await reader.cancel();throw new ProjectError('项目包不能超过 64 MB。',413);}chunks.push(r.value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}if(bytes[0]!==31||bytes[1]!==139)throw new ProjectError('项目包格式无效。',400);return bytes;}
