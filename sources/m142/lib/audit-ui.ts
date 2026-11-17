import {resources} from './model';
const labels:Record<string,string>={status:'审核状态',stage:'流转阶段',conclusion:'验收结论',schoolOwner:'学校责任',enterpriseOwner:'企业责任',versionNote:'变更说明',revision:'版本',reviewer:'核对 / 审核人',reviewBasis:'审核依据',reviewDate:'审核日期',currentCoverage:'当前覆盖',missing:'缺失内容',improvement:'改进措施',updateMechanism:'更新机制',sourceLinks:'来源链接',due:'补充期限',scope:'适用范围',note:'说明',name:'证据名称',task_id:'关联任务',resource_id:'资源类型',sha256:'文件校验值',size:'文件大小（字节）',actor:'操作人',created_at:'操作时间',owner:'学校确认人',basis:'正式依据',confirmed:'流程是否确认',schoolFlow:'学校实际流程',url:'来源链接',object_key:'归档位置',id:'记录编号'};
const display=(value:unknown)=>value===undefined||value===null||value===''?'未填写':typeof value==='boolean'?(value?'是':'否'):Array.isArray(value)?value.join('、'):String(value);
export function versionChanges(previous:string,next:string){let before:any={},after:any={};try{before=JSON.parse(previous);after=JSON.parse(next);}catch{return[{label:'记录内容',before:previous,after:next}];}const result:{label:string;before:string;after:string}[]=[];
 for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
  if(JSON.stringify(before[key])===JSON.stringify(after[key]))continue;
  if(key==='resources'){for(const r of resources)for(const field of ['status','reviewer','note']){const a=before.resources?.[r.id]?.[field],b=after.resources?.[r.id]?.[field];if(a!==b)result.push({label:r.name+' · '+(labels[field]||field),before:display(a),after:display(b)});}}
  else result.push({label:labels[key]||key,before:display(before[key]),after:display(after[key])});
 }return result;
}
export function localDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());}
export function bytesLabel(size:number){return size<1024?`${size} B`:size<1024*1024?`${(size/1024).toFixed(1)} KB`:`${(size/1024/1024).toFixed(1)} MB`;}
export async function requestJson(url:string,init:RequestInit={},timeout=30000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{...init,signal:controller.signal});let d:any;try{d=await r.json();}catch{throw Error('服务暂时没有返回有效结果，请刷新后重试；现有编辑内容已保留。');}if(!r.ok){const error=new Error(d.error||'操作失败，请稍后重试') as Error&{status:number};error.status=r.status;throw error;}return d;}catch(e){if(e instanceof Error&&e.name==='AbortError')throw Error(init.method?'请求结果尚未确认。请先刷新记录核对是否保存成功，避免重复提交。':'同步超时，请重试；已载入的数据仍保留。');throw e;}finally{clearTimeout(timer);}}
