import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {learning,catalogState} from '../../../db/schema';
import {eq,and} from 'drizzle-orm';
import {lessons} from '../../lib/catalog';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const user=await getChatGPTUser();if(!user)return reply({authenticated:false,ownerId:null,records:[]});const rows=await getDb().select().from(learning).where(eq(learning.owner,user.userId));return reply({authenticated:true,ownerId:user.userId,records:rows.map(({key,owner,videoId,...r})=>({...r,id:videoId}))});}catch{return reply({error:'学习记录暂时无法读取，请重试。'},503);}}
export async function POST(req:Request){try{
 const user=await getChatGPTUser();if(!user)return reply({error:'请先登录，再保存收藏和学习记录。'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply({error:'请求来源不一致，请从本站重新操作。'},403);
 const raw=await req.text();if(raw.length>40000)return reply({error:'笔记内容过长。'},413);
 let r;try{r=JSON.parse(raw);}catch{return reply({error:'无法读取保存内容。'},400);}
 const [catalog]=await getDb().select().from(catalogState).where(eq(catalogState.id,'main'));
 const known=catalog?JSON.parse(catalog.payload).lessons:lessons;
 if(!r||!known.some((l:{id:string})=>l.id===r.id)||typeof r.favorite!=='boolean'||!['未开始','学习中','已学完'].includes(r.status)||typeof r.notes!=='string'||r.notes.length>10000||!Number.isSafeInteger(r.revision)||r.revision<0)return reply({error:'学习记录格式不正确，请检查后重试。'},400);
 const db=getDb(),key=`${user.userId}:${r.id}`;
 const [old]=await db.select().from(learning).where(eq(learning.key,key));
 const publicRecord=(row:typeof old)=>row?{id:row.videoId,favorite:row.favorite,status:row.status,notes:row.notes,revision:row.revision,updated:row.updated}:null;
 if((old?.revision||0)!==r.revision)return reply({error:'这条记录已在其他页面更新。请对照云端版本后继续。',record:publicRecord(old)},409);
 const updated=new Date().toISOString(),revision=r.revision+1;
 const row={key,owner:user.userId,videoId:r.id,favorite:r.favorite,status:r.status,notes:r.notes,updated,revision};
 const changed=old?await db.update(learning).set(row).where(and(eq(learning.key,key),eq(learning.revision,r.revision))).returning({key:learning.key}):await db.insert(learning).values(row).onConflictDoNothing().returning({key:learning.key});
 if(!changed.length){const [latest]=await db.select().from(learning).where(eq(learning.key,key));return reply({error:'记录刚刚发生变化，请对照云端版本后继续。',record:publicRecord(latest)},409);}
 return reply({record:{id:r.id,favorite:r.favorite,status:r.status,notes:r.notes,updated,revision}});
}catch{return reply({error:'暂时无法确认保存结果，请保留当前笔记，重新载入核对。'},503);}}
