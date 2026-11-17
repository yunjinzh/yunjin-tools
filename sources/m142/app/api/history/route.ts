import {context,fail} from '@/lib/server';
export async function GET(request:Request){try{
 const {db}=context(request),url=new URL(request.url);const raw=url.searchParams.get('cursor');
 const requested=Number(url.searchParams.get('limit')||100);if(!Number.isInteger(requested)||requested<1||requested>500)throw new Error('422|历史记录页大小应为1—500');
 let after:{createdAt:string;id:string}|null=null;
 if(raw){try{const value=JSON.parse(atob(raw));if(typeof value.createdAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(value.createdAt)||typeof value.id!=='string'||value.id.length>100)throw Error();after=value;}catch{throw new Error('422|历史记录分页标记无效，请重新载入');}}
 const query=after?db.prepare('SELECT * FROM history WHERE created_at < ? OR (created_at = ? AND id < ?) ORDER BY created_at DESC,id DESC LIMIT ?').bind(after.createdAt,after.createdAt,after.id,requested+1):db.prepare('SELECT * FROM history ORDER BY created_at DESC,id DESC LIMIT ?').bind(requested+1);
 const result=await query.all(),items=result.results.slice(0,requested),last:any=items[items.length-1];
 const nextCursor=result.results.length>requested?btoa(JSON.stringify({createdAt:last.created_at,id:last.id})):null;
 return Response.json({history:items,nextCursor},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e);}}
