import type { Video, Experiment } from './types';
import { validateRecord } from '../api/_shared/validation';
export type ResearchBackup = { videos: Video[]; experiments: Experiment[]; exportedAt?: string };
export function parseResearchBackup(text:string):ResearchBackup {
 if(text.length>5_000_000)throw Error('备份文件超过 5 MB，请分批导入。');
 let data:any;try{data=JSON.parse(text);}catch{throw Error('无法读取 JSON，请选择研究站导出的备份文件。');}
 if(!data||typeof data!=='object'||data.schemaVersion!==1||!Array.isArray(data.videos)||!Array.isArray(data.experiments)||data.videos.length+data.experiments.length>500)throw Error('备份格式不匹配：需要版本 1，且最多包含 500 条资料。');
 const ids=new Set<string>(),errors:string[]=[];
 const clean=(kind:'video'|'experiment',entries:any[])=>entries.map((record,index)=>{
  const label=kind==='video'?'案例':'实验';
  try{
   if(!record||typeof record!=='object'||Array.isArray(record))throw Error('内容不是资料对象');
   const {revision:_,...payload}=record;
   const value=validateRecord(kind,payload);
   const key=kind+':'+value.id;if(ids.has(key))throw Error('同类资料的 ID 重复');ids.add(key);
   return value;
  }catch(e){errors.push(`${label} ${index+1}「${String(record?.title||'无标题').slice(0,35)}」：${(e as Error).message}`);return null;}
 });
 const videos=clean('video',data.videos),experiments=clean('experiment',data.experiments);
 if(errors.length)throw Error(`备份预检发现 ${errors.length} 条问题，尚未写入任何资料。\n${errors.slice(0,8).join('\n')}${errors.length>8?'\n其余问题请修正后重新检查。':''}`);
 return {videos:videos as Video[],experiments:experiments as Experiment[],exportedAt:typeof data.exportedAt==='string'?data.exportedAt:undefined};
}
