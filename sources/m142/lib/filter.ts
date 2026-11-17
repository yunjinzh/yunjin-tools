import policyData from './policies.json';
import { tasks as taskData, rules as ruleData, resources as resourceData, completeness, defaultReview, effectiveReviewStatus, type Task, type Review, type Evidence } from './model';

export type WorkspaceFilters = { q?:string; project?:string; task?:string; major?:string; policy?:string; nature?:string; scope?:string; resource?:string; status?:string; coverage?:string };
export type WorkspaceView = 'overview'|'policies'|'matrix'|'tasks'|'resources'|'workflow'|'evidence'|'history'|string;
export type SelectionInput = { view?:WorkspaceView; filters?:WorkspaceFilters; records:Record<string,Review>; evidence:Evidence[]; taskPool?:Task[] };
const contains=(query:string,...values:unknown[])=>values.flat(Infinity).join(' ').toLocaleLowerCase().includes(query);
const policyText=(p:typeof policyData[number])=>[p.id,p.title,p.docNo,p.summary,p.scope,p.boundary,...p.requirements.flatMap(r=>[r.text,r.clause,r.nature])];

/** One query contract for the screen and both export formats. Completeness always uses all evidence. */
export function selectWorkspace({view='tasks',filters={},records,evidence,taskPool=taskData}:SelectionInput){
 const f=filters,q=(f.q||'').trim().toLocaleLowerCase();
 const isPolicy=view==='policies',isMatrix=view==='matrix',isEvidence=view==='evidence';
 const taskDimension=Boolean(f.project||f.task||f.major||f.status||f.coverage||taskPool.length!==taskData.length);
 const relationDimension=Boolean(f.policy||f.nature||f.scope||f.resource);
 const getReview=(id:string)=>records[id]||defaultReview(id);
 let rules=ruleData.filter(r=>(!f.policy||r.policyId===f.policy)&&(!f.nature||r.nature===f.nature)&&(!f.scope||r.scope===f.scope)&&(!f.resource||r.resourceIds.includes(f.resource||'')));
 let policies=policyData.filter(p=>(!f.policy||p.id===f.policy)&&(!f.nature||p.natures.includes(f.nature))&&(!f.scope||ruleData.some(r=>r.policyId===p.id&&r.scope===f.scope))&&(!f.resource||ruleData.some(r=>r.policyId===p.id&&r.resourceIds.includes(f.resource||''))));
 if(isPolicy&&q){policies=policies.filter(p=>contains(q,...policyText(p)));const pids=new Set(policies.map(p=>p.id));rules=rules.filter(r=>pids.has(r.policyId));}
 if(isMatrix&&q){rules=rules.filter(r=>contains(q,r.id,r.title,r.requirement,r.clause,r.module,r.scope,r.nature,r.boundary,...policyText(policyData.find(p=>p.id===r.policyId)||{id:'PLAN',title:'原建设方案 V3.0',docNo:'',summary:'',scope:'',boundary:'',requirements:[]} as any)));}
 let tasks=taskPool.filter(t=>{
  const r=getReview(t.id),c=completeness(r,evidence);
  return (!f.project||t.projectIds.includes(f.project))&&(!f.task||t.id===f.task)&&(!f.major||t.majors.includes(f.major))&&(!f.status||effectiveReviewStatus(r)===f.status)&&(!f.coverage||(f.coverage==='none'?c.submitted===0:f.coverage==='partial'?c.submitted>0&&c.submitted<c.total:f.coverage==='full'?c.submitted===c.total:false))&&(!q||isPolicy||isMatrix||isEvidence||contains(q,t.id,t.title,t.group,t.input,t.steps,t.output,t.lead,t.majors,r.currentCoverage,r.missing,r.improvement,r.schoolOwner,r.enterpriseOwner))&&(!relationDimension&&!((isPolicy||isMatrix)&&q)||rules.some(rule=>rule.taskIds.includes(t.id)));
 });
 let ids=new Set(tasks.map(t=>t.id));
 const includeGlobal=!taskDimension&&!f.policy&&!f.nature&&!f.scope&&(!q||isEvidence);
 let selectedEvidence=evidence.filter(e=>(ids.has(e.task_id)||(e.task_id==='GLOBAL'&&includeGlobal))&&(!f.resource||e.resource_id===f.resource)&&(!isEvidence||!q||contains(q,e.name,e.note,e.task_id,e.actor,resourceData.find(r=>r.id===e.resource_id)?.name)));
 if(isEvidence&&q){const evidenceTaskIds=new Set(selectedEvidence.map(e=>e.task_id));tasks=tasks.filter(t=>evidenceTaskIds.has(t.id));ids=new Set(tasks.map(t=>t.id));}
 rules=rules.filter(r=>r.taskIds.some(id=>ids.has(id)));
 if(taskDimension||(!isPolicy&&q)||f.resource){policies=policies.filter(p=>rules.some(r=>r.policyId===p.id));}
 // Empty task result under an active relation must not leak unrelated evidence or policies.
 if(!tasks.length&&(taskDimension||relationDimension||q)&&!(isEvidence&&selectedEvidence.some(e=>e.task_id==='GLOBAL')))selectedEvidence=[];
 if(isPolicy&&q&&!policies.length){tasks=[];rules=[];selectedEvidence=[];}
 return { tasks, rules, policies, evidence:selectedEvidence, resources:resourceData.filter(r=>!f.resource||r.id===f.resource), hasTaskFilter:taskDimension };
}
