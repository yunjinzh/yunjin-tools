import {eq,and} from 'drizzle-orm';
import {getDb} from '../../../db';
import {catalogState} from '../../../db/schema';
import {catalogPayload,seedCatalog} from '../../lib/catalog-data';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const snapshot=(row:typeof catalogState.$inferSelect)=>({...JSON.parse(row.payload),revision:row.revision,updatedAt:row.updatedAt,message:row.message});
export async function GET(){try{const [row]=await getDb().select().from(catalogState).where(eq(catalogState.id,'main'));return reply(row?snapshot(row):seedCatalog);}catch{return reply({error:'资料更新通道暂不可用，继续使用已下载内容。'},503)}}
/** Shared curator writer: authorization is the owner-private Sites dispatch boundary.
 * Service access does not impersonate a learner and never writes learning records.
 * Do not make this Site public without adding explicit writer authorization. */
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply({error:'请求来源不一致'},403);
 const raw=await req.text();if(raw.length>2000000)return reply({error:'内容包过大'},413);
 let input;try{input=JSON.parse(raw)}catch{return reply({error:'JSON 格式错误'},400)}
 const parsed=catalogPayload.safeParse(input.payload);
 if(!parsed.success||!Number.isSafeInteger(input.baseRevision)||input.baseRevision<0||typeof input.requestId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(input.requestId)||typeof input.message!=='string'||input.message.length>2000)return reply({error:'内容包、核验说明或版本格式错误'},400);
 const db=getDb(),[old]=await db.select().from(catalogState).where(eq(catalogState.id,'main'));
 if(old?.requestId===input.requestId)return reply(snapshot(old));
 if((old?.revision||0)!==input.baseRevision)return reply({error:'内容版本已改变，请读取后重新合并'},409);
 const previous=old?snapshot(old):seedCatalog;
 const ids=new Set(parsed.data.lessons.map(l=>l.id));
 if(previous.lessons.some((l:{id:string})=>!ids.has(l.id)))return reply({error:'更新必须保留已收录视频 ID，以保护收藏和笔记'},400);
 const row={id:'main',payload:JSON.stringify(parsed.data),revision:input.baseRevision+1,updatedAt:new Date().toISOString(),message:input.message,requestId:input.requestId};
 const changed=old?await db.update(catalogState).set(row).where(and(eq(catalogState.id,'main'),eq(catalogState.revision,input.baseRevision))).returning():await db.insert(catalogState).values(row).onConflictDoNothing().returning();
 if(!changed.length)return reply({error:'发生并发更新，请重新读取'},409);
 return reply(snapshot(row));
}catch{return reply({error:'内容更新失败，请读取版本确认结果'},503)}}
