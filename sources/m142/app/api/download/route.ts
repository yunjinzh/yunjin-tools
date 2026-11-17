import {context,fail,downloadFilename} from '@/lib/server';
export async function GET(request:Request){try{
 const {db,bucket}=context(request),id=new URL(request.url).searchParams.get('id');
 if(!id||id.length>100)throw new Error('422|证据编号无效');
 const e:any=await db.prepare('SELECT * FROM evidence WHERE id=?').bind(id).first();
 if(!e?.object_key||!bucket)throw new Error('404|未找到归档文件');
 const object=await bucket.get(e.object_key);if(!object)throw new Error('404|文件不存在');
 const name=downloadFilename(e.name,object.customMetadata?.originalFilename);
 return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(name),'Content-Length':String(object.size),'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
}catch(e){return fail(e);}}
