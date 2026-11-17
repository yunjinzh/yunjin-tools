import {z} from 'zod';
import type {EngineSnapshot} from './project-engine';
import type {TeachingState} from './teaching';
import type {StudioFont} from './fonts';

export type ProjectBundle={app:'siwei-studio';version:1;name:string;modelId:string;modelName:string;format:string;createdAt:string;scene:EngineSnapshot;teaching:TeachingState;fonts:{font:StudioFont;data:string}[]};
export const MAX_PACKAGE=64*1024*1024,MAX_EXPANDED=256*1024*1024;
const num=z.number().finite(),id=z.string().min(1).max(128),short=z.string().max(180),text=z.string().max(4000),color=z.string().regex(/^#[\da-f]{6}$/i),vec=z.tuple([num,num,num]);
const annotation=z.object({id,meshId:id,partName:short,anchor:vec,text:z.string().max(280),color,visible:z.boolean(),offset:z.tuple([num,num])});
const view=z.object({position:vec,target:vec,fov:num.min(1).max(160),zoom:num.positive(),explosion:num.min(0).max(100),background:color,exposure:num.min(0).max(10),grid:z.boolean(),annotations:z.array(annotation).max(40),parts:z.array(z.object({id,visible:z.boolean(),opacity:num.min(.05).max(1)})).max(20000).optional()});
const task=z.object({id,title:short,instruction:text,kind:z.enum(['locate','sequence','annotate','explain']),targets:z.array(id).max(100),hint:text,points:num.int().min(0).max(100),view:view.optional()});
const teaching=z.object({parts:z.array(z.object({id,name:short,group:short,purpose:text,principle:text,source:text})).max(20000),lesson:z.object({id,title:short,objective:text,tasks:z.array(task).max(50)}),attempts:z.array(z.object({id,taskId:id,time:short,correct:z.boolean().nullable(),answer:text,selected:z.array(id).max(100),hintUsed:z.boolean(),view})).max(300),learner:short,review:z.object({knowledge:num.min(0).max(15),expression:num.min(0).max(15),comment:text,status:z.enum(['draft','returned','reviewed'])}),submittedAt:short.optional()});
const image=z.string().refine(v=>v===''||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),'项目图片必须内嵌');
const schema=z.object({app:z.literal('siwei-studio'),version:z.literal(1),name:short,modelId:short,modelName:short,format:short,createdAt:short,teaching,fonts:z.array(z.object({font:z.object({value:id,label:short,family:id,weight:num,local:z.boolean().optional()}),data:z.string().max(42*1024*1024).regex(/^[A-Za-z0-9+/=]+$/)})).max(12),scene:z.object({model:z.any(),decals:z.any(),layers:z.array(z.object({info:z.object({id,name:short,kind:short,color:z.string().max(100),visible:z.boolean(),opacity:num.min(0).max(100),size:num.min(1).max(100),rotation:num.min(-180).max(180)}),groupId:id,placement:z.object({meshId:id,point:vec,normal:vec,size:num,rotation:num,aspect:num.positive()}).optional()})).max(1000),view,keyframes:z.array(z.object({id,name:short,hold:num.min(.5).max(15),transition:num.min(.5).max(15),thumbnail:image,view})).max(30),settings:z.object({tool:z.enum(['orbit','spray','brush','text','sticker','fill','select','erase','annotation','inspect']),color,size:num.min(1).max(100),opacity:num.min(0).max(100),softness:num.min(0).max(100),rotation:num.min(-180).max(180),text:z.string().max(500),font:short,sticker:short,image:image.nullable(),roughness:num.min(0).max(100),metalness:num.min(0).max(100)})})});
function validateTree(value:unknown){
 const root=value as Record<string,any>;if(!root?.object||!root.metadata)throw Error('场景结构不完整。');
 // Never fetch URLs from imported packages. Only embedded pixel data is accepted.
 for(const item of root.images||[]){const urls=Array.isArray(item.url)?item.url:[item.url];for(const url of urls){if(typeof url==='string'){if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url))throw Error('课件包含外部图片地址，请重新导出内嵌图片。');}else if(!url||!Array.isArray(url.data)||!Number.isInteger(url.width)||!Number.isInteger(url.height)||url.width<1||url.height<1||url.width*url.height>64*1024*1024)throw Error('纹理数据无效。');}}
 let count=0;const visit=(o:any,depth:number)=>{if(depth>12||++count>30000||!['Group','Mesh','Object3D'].includes(o.type)||typeof o.uuid!=='string')throw Error('项目场景层级无效或过大。');if(o.userData?.targetMesh)throw Error('项目包含无效部件引用。');for(const c of o.children||[])visit(c,depth+1);};visit(root.object,0);
}
export function validateBundle(value:unknown):ProjectBundle{
 const parsed=schema.safeParse(value);if(!parsed.success)throw Error('课件格式或数据无效，请选择四维秀秀导出的 .siwei 文件。');
 validateTree(parsed.data.scene.model);validateTree(parsed.data.scene.decals);
 const b=parsed.data as ProjectBundle;
 const partIds=new Set((b.scene.model.object.children||[]).map((m:any)=>m.userData?.partId));
 if(partIds.size!==(b.scene.model.object.children||[]).length||partIds.has(undefined))throw Error('项目部件编号重复或缺失。');
 for(const t of b.teaching.lesson.tasks)if(t.targets.some(x=>!partIds.has(x)))throw Error('任务引用的部件不存在。');
 return b;
}
export async function encodePackage(bundle:ProjectBundle){
 const json=JSON.stringify(bundle);if(new TextEncoder().encode(json).byteLength>MAX_EXPANDED)throw Error('项目数据超过 256 MB，请减少模型面数或图层。');
 const blob=await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
 if(blob.size>MAX_PACKAGE)throw Error('项目包超过 64 MB，请精简模型或贴图。');return blob;
}
export async function decodePackage(blob:Blob):Promise<ProjectBundle>{
 if(blob.size>MAX_PACKAGE)throw Error('项目包不能超过 64 MB。');
 const reader=blob.stream().pipeThrough(new DecompressionStream('gzip')).getReader();let length=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX_EXPANDED){await reader.cancel();throw Error('解压后的项目过大。');}chunks.push(value);}}catch(e){if(e instanceof Error&&e.message==='解压后的项目过大。')throw e;throw Error('无法解压课件，请选择完整的 .siwei 文件。');}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return validateBundle(JSON.parse(new TextDecoder().decode(bytes)));
}
export function saveFile(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
