import { env } from 'cloudflare:workers';
export function context(request:Request,write=false){
 const actor=request.headers.get('oai-authenticated-user-email')||request.headers.get('oai-authenticated-user-id')||(process.env.NODE_ENV==='development'?'本地测试':'');
 if(!actor)throw new Error('401|请登录后访问工作台');
 if(write){const origin=request.headers.get('origin');if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')throw new Error('403|来源校验失败');}
 if(!env.DB)throw new Error('503|数据服务尚未就绪，请稍后重试');
 return {db:env.DB,bucket:env.BUCKET,actor};
}
export async function limitedBody(request:Request,maxBytes:number,message:string){
 const advertised=Number(request.headers.get('content-length'));
 if(Number.isFinite(advertised)&&advertised>maxBytes)throw new Error('413|'+message);
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error('413|'+message);}chunks.push(value);}}finally{reader.releaseLock();}
 const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}return body;
}
export function safeFilename(name:string,fallback='证据附件'){return name.replace(/[\\/\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'_').trim().replace(/^\.+|\.+$/g,'').slice(0,180)||fallback;}
export function downloadFilename(displayName:string,originalName?:string){
 const name=safeFilename(displayName),original=safeFilename(originalName||displayName);const extension=original.match(/(\.[a-z\d]{1,16})$/i)?.[1]||'';
 return extension&&!name.toLowerCase().endsWith(extension.toLowerCase())?name+extension:name;
}
export const fail=(e:unknown)=>{const raw=String(e instanceof Error?e.message:e),separator=raw.indexOf('|'),code=Number(raw.slice(0,separator));const known=[400,401,403,404,409,413,415,422,503].includes(code);return Response.json({error:known?raw.slice(separator+1):'操作失败，请重试；现有记录未覆盖'}, {status:known?code:500,headers:{'Cache-Control':'no-store'}});};
