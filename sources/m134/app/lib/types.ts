export type Lesson = {
 id:string; title:string; zhTitle:string; context:string; channel:string; url:string; category:string; description:string;
 views:number; likes:number; published:string; checked:string; duration?:string;
 chapters?:{time:string;label:string}[]; takeaways:string[]; tools:string[]; source:string; metricsNote:string;
};
export type LearningRecord = {id:string;favorite:boolean;status:'未开始'|'学习中'|'已学完';notes:string;revision:number;updated:string};
export const emptyRecord=(id:string):LearningRecord=>({id,favorite:false,status:'未开始',notes:'',revision:0,updated:''});
