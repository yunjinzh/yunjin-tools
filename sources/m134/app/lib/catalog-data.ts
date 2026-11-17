import {z} from 'zod';
import {lessons} from './catalog';
import {coreContent} from './core-content';
const text=z.string().min(1).max(10000),url=z.string().url().refine(v=>new URL(v).protocol==='https:');
const lesson=z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{11}$/),title:text,zhTitle:text,context:text,channel:text,url,category:text,description:text,views:z.number().int().min(100000),likes:z.number().int().min(1000),published:z.string(),checked:text,duration:z.string().optional(),chapters:z.array(z.object({time:z.string().regex(/^\d{1,2}:\d{2}(?::\d{2})?$/),label:text})).optional(),takeaways:z.array(text).min(1),tools:z.array(text),source:url,metricsNote:text});
const core=z.object({gist:text,core:z.array(z.object({heading:text,body:text})).min(3).max(8),evidenceLevel:text,basis:text,sources:z.array(z.object({label:text,url})).min(1),checked:text,supplement:z.object({heading:text,body:text,url}).optional()});
export const catalogPayload=z.object({lessons:z.array(lesson).min(1).max(2000),coreContent:z.record(core)}).superRefine((v,ctx)=>{
 const ids=new Set<string>();
 for(const l of v.lessons){
  const source=new URL(l.source),original=new URL(l.url);
  if(ids.has(l.id)||!v.coreContent[l.id]||original.hostname!=='www.youtube.com'||original.searchParams.get('v')!==l.id||source.hostname!=='www.youtube.com'||source.searchParams.get('v')!==l.id)
   ctx.addIssue({code:z.ZodIssueCode.custom,message:'视频 ID、原始来源、重复项或核心内容不完整'});
  ids.add(l.id);
 }
});
export type CatalogPayload=z.infer<typeof catalogPayload>;
export type CatalogSnapshot=CatalogPayload&{revision:number;updatedAt:string;message:string};
export const seedCatalog:CatalogSnapshot={lessons,coreContent,revision:0,updatedAt:'2026-11-09T00:00:00.000Z',message:'首批 12 条已核验内容；具体热度日期见视频详情。'};
export function isCatalogSnapshot(value:unknown):value is CatalogSnapshot {
 if(!value||typeof value!=='object')return false;
 const v=value as CatalogSnapshot;
 return Number.isSafeInteger(v.revision)&&v.revision>=0&&typeof v.updatedAt==='string'&&typeof v.message==='string'&&catalogPayload.safeParse(v).success;
}
