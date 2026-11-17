import source from './source.json';
export const tasks=source.tasks;
export const projects=source.projects;
export const sourceUrl='https://chatgpt.com/library?file_id=libfile_b07c3dd891f48191aeba1d4a0da2691d&account_id=personal';
export const policyReportUrl='https://chatgpt.com/library?file_id=libfile_c3450b0c05208191b22943bd80e67329&account_id=personal';
export const natures=['明确管理要求','政策鼓励方向','待制定规范','待学校确认'];
export const marks=['草案','待核实','已确认','需补充'];
export const stages=['草案','资源编制','校企初审','学校审查','整改复核','验收归档'];
export const resources=[
 {id:'student',name:'学生任务书',basis:'方案第27页',required:true},
 {id:'teacher',name:'教师指导书',basis:'方案第27页',required:true},
 {id:'sample',name:'原始样例',basis:'方案第27页',required:true},
 {id:'operations',name:'参数与操作记录',basis:'方案第27页',required:true},
 {id:'reference',name:'参考成果',basis:'方案第27页',required:true},
 {id:'errors',name:'错误样本',basis:'方案第27页',required:true},
 {id:'rubric',name:'评分表',basis:'方案第27页',required:true},
 {id:'rights',name:'版权与数据授权证据',basis:'方案第27、31页',required:true},
 {id:'simulation',name:'三维仿真素材',basis:'按教学适用性配置，待学校确认',required:false},
 {id:'learning',name:'学习过程记录',basis:'方案第30、32页',required:true},
 {id:'competency',name:'能力评价证据',basis:'方案第30、52页',required:true},
 {id:'review',name:'校企审核责任与审查记录',basis:'方案第27—28页；学校程序待确认',required:true},
 {id:'update',name:'资源更新机制',basis:'方案第28、52页',required:true},
];
export type Task=typeof tasks[number];
export type ResourceState={status:string;note:string;reviewer:string};
export type Review={integrityWarning?:string;id:string;revision:number;status:string;stage:string;schoolOwner:string;enterpriseOwner:string;currentCoverage:string;missing:string;improvement:string;conclusion:string;updateMechanism:string;sourceLinks:string;reviewer:string;reviewBasis:string;reviewDate:string;due:string;scope:string;resources:Record<string,ResourceState>;versionNote:string};
export type Evidence={id:string;task_id:string;resource_id:string;name:string;object_key?:string;url?:string;size:number;sha256?:string;note:string;created_at:string;actor:string};
export const defaultReview=(id:string):Review=>({id,revision:0,status:'草案',stage:'草案',schoolOwner:'',enterpriseOwner:'',currentCoverage:'方案已定义任务输入、操作、成果、质量检查与返工路径；未取得实际配套资源与验收记录。',missing:'任务配套资源、学习证据、授权资料及学校审查记录尚未提交。',improvement:'按任务卡编制资源包，开展校企初审和试教，补齐授权及评价证据后提交学校审查。',conclusion:'待验收；原方案描述不等同于建设完成。',updateMechanism:'建议每轮试教后复盘；技术、数据或政策变化时触发修订并重新审查。具体周期与责任人待学校确认。',sourceLinks:sourceUrl,reviewer:'',reviewBasis:'',reviewDate:'',due:'',scope:'校本教学资源',resources:Object.fromEntries(resources.map(r=>[r.id,{status:'需补充',note:'',reviewer:''}])),versionNote:''});
export type Settings={integrityWarning?:string;id:string;revision:number;confirmed:boolean;owner:string;basis:string;schoolFlow:string;scope:string};
export const defaultSettings:Settings={id:'settings',revision:0,confirmed:false,owner:'',basis:'',schoolFlow:'资源编制 → 校企初审 → 学校审查 → 整改复核 → 验收归档（建议流程，待学校审定）',scope:'校本教学资源'};
export const modules=['项目与任务','资产与场景','方案与分析','物联与事件','展示与交付','教学评价','运行保障'];
export function taskModules(t:Task){const n=Number(t.id.slice(1));return [...new Set(['项目与任务','教学评价',...(n<=15?['资产与场景']:n<=20?['资产与场景','展示与交付','运行保障']:n<=25?['方案与分析','展示与交付']:n<=30?['物联与事件','运行保障']:n<=35?['资产与场景','方案与分析','物联与事件']:['展示与交付','运行保障'])])];}
const all=tasks.map(t=>t.id);
const rule=(id:string,policyId:string,title:string,nature:string,scope:string,clause:string,requirement:string,resourceIds:string[],module:string,boundary:string,taskIds=all)=>({id,policyId,title,nature,scope,clause,requirement,resourceIds,module,boundary,taskIds});
export const rules=[
 rule('C01','POL09','教材编写、审核与选用程序',natures[0],'正式数字教材','职业院校教材管理办法：编写、审核、选用','确认教材属性、编审职责、审查与选用程序；保留正式审核依据。',['student','teacher','review'],'项目与任务','校本资源是否纳入教材管理须由学校按使用方式认定。'),
 rule('C02','POL02','校企行教材开发协作',natures[0],'职业教育教材改革','第二部分（三）教材改革','落实学校、企业、行业专家参与教材开发的职责；具体人员和合作关系须核实。',['teacher','review'],'项目与任务','政策改革部署不等同于本项目已建立三主编团队。'),
 rule('C03','POL02','数字教材与真实生产任务转化',natures[1],'职业教育教材改革','第二部分（三）教材改革','以真实工作过程组织任务、操作、错误样本和评价证据。',['sample','operations','reference','errors','rubric'],'教学评价','任务数量40、综合项目6来自建设方案，不是国家最低门槛。'),
 rule('C04','POL01','虚拟仿真与沉浸式学习',natures[1],'教育数字化建设','数字教材、虚拟仿真实验与教学场景相关部署','按能力目标选择三维交互、仿真和教学反馈，保留试用记录。',['simulation','learning'],'资产与场景','不要求每个任务都配备三维仿真；须记录适用性判断。'),
 rule('C05','POL03','精品数字教材与校企共同开发',natures[1],'教育数字化建设','数字教材建设相关部署','建设可用、可维护的教材及配套资源，形成试教与改进证据。',['student','teacher','reference','update'],'教学评价','精品方向不等于已获认定成果。'),
 rule('C06','POL02','数字教材标准制度体系',natures[2],'职业教育教材改革','逐步建立数字教材建设和管理标准制度体系','跟踪后续规范；学校先确认适用程序与验收口径。',['review','update'],'运行保障','不得将规划中的标准当作已施行强制条款。'),
 rule('C07','POL05','提供、上线与更新内容审核',natures[0],'国家智慧教育平台入库','提供必审、上线必审、更新必审','按七个审核维度开展内容审查，保留责任、结论与问题处理。',['review','update'],'项目与任务','仅在国家平台资源路径适用；校本使用可参考，不能自动扩大适用。'),
 rule('C08','POL06','版权授权与资源入库管理',natures[0],'国家智慧教育平台入库','授权、元数据、技术审查及动态管理','按平台申报要求提供授权、元数据及技术审查证据。',['rights','review','update'],'运行保障','平台层面年度更新率不等于每本教材章节年度更新率。'),
 rule('C09','POL08','数字资源技术适配',natures[0],'国家智慧教育平台入库','JY/T 0650—2022资源技术要求','按资源类型验证文本、图像、音视频、动画和虚拟仿真的适用技术项。',['reference','simulation'],'运行保障','推荐性行业标准；是否作为项目验收依据由适用规则和合同确认。'),
 rule('C10','POL07','本科国家级规划教材建设路径',natures[0],'本科国家级规划教材申报','实施方案的申报、审核与认定条件','确认申报对象和适用资格，再按当期通知提交资料。',['student','review','rights'],'项目与任务','不自动适用于所有职业教育校本资源。'),
 rule('C11','POL10','七部门专项意见原文核验',natures[3],'正式数字教材','教材厅〔2026〕1号（高校公开引用）','取得部委全文、准确日期及适用条款后再建立正式判定。',['review'],'项目与任务','[!!! 事实断层：资料不足，无法确认] 部委全文与准确发布日期。'),
 rule('C12','PLAN','每项任务配套资源与过程证据',natures[3],'校本教学资源','方案第27、30、32页','8类基础配套资源，加学习过程、能力评价、审核责任及更新机制；按需配置仿真素材。',resources.map(r=>r.id),'教学评价','方案资源建设建议；学校确认后形成项目验收基线。'),
 rule('C13','PLAN','平台功能与独立复现验收',natures[3],'实训平台功能','方案第25、30页','验证任务提交、对象追溯、方案复算、异常注入、独立打开、个人评价及恢复。',['operations','reference','learning','competency'],'运行保障','映射为工作台分析草案，未表示平台功能已实现。',tasks.filter(t=>Number(t.id.slice(1))>=16).map(t=>t.id)),
 rule('C14','PLAN','数据授权、脱敏和发布边界',natures[3],'校本教学资源','方案第31、52页','逐素材登记权利方、使用范围、期限、脱敏方式与对外展示权限。',['rights','sample','review'],'资产与场景','教学用途不能替代授权；原始样例与公开发布副本须区分。'),
 rule('C15','POL04','教育数字化与教材体系建设',natures[1],'教育数字化建设','教育数字化战略与教材体系建设部署','将数字资源建设与课程、教学和能力培养协同设计。',['student','teacher','competency'],'教学评价','战略方向不直接构成单项资源的验收通过条件。'),
];
export function completeness(r:Review,ev:Evidence[]){const valid=resources.filter(x=>x.required||r.resources[x.id]?.status!=='不适用');const submitted=valid.filter(x=>ev.some(e=>e.task_id===r.id&&e.resource_id===x.id));const confirmed=valid.filter(x=>r.resources[x.id]?.status==='已确认'&&submitted.includes(x));return {total:valid.length,submitted:submitted.length,confirmed:confirmed.length,percent:valid.length?Math.round(submitted.length/valid.length*100):0};}
export const constructionScopes=['校本教学资源','正式数字教材','国家智慧教育平台入库','本科国家级规划教材申报'];
export const resourceStatuses=['需补充','待核实','已确认','不适用'];
export function effectiveReviewStatus(r:Review){return r.integrityWarning?'待核实':r.status;}
export function isReviewConfirmed(r:Review){return !r.integrityWarning&&r.status==='已确认'&&r.stage==='验收归档';}
export function isFinalized(r:Pick<Review,'status'|'stage'>){return r.status==='已确认'||r.stage==='验收归档';}
export function settingsBasisChanged(previous:Settings,next:Settings){return ['confirmed','owner','basis','schoolFlow','scope'].some(k=>previous[k as keyof Settings]!==next[k as keyof Settings]);}
export function isValidDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T00:00:00.000Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}
export function validateSettings(settings:Settings,ev:Evidence[],previous?:Settings,confirmedTaskIds:string[]=[]):string|null{
 if(settings.id!=='settings'||typeof settings.confirmed!=='boolean'||!['owner','basis','schoolFlow','scope'].every(k=>typeof settings[k as keyof Settings]==='string'))return '学校流程信息不完整';
 if(!constructionScopes.includes(settings.scope))return '请选择有效建设路径';
 if(!settings.schoolFlow.trim())return '请填写学校审核流程或待确认说明';
 if(previous&&settingsBasisChanged(previous,settings)&&confirmedTaskIds.length)return `已有${confirmedTaskIds.length}项任务验收归档（${confirmedTaskIds.slice(0,5).join('、')}）。请先将相关任务退回整改复核，再调整学校审核基线`;
 if(settings.confirmed&&(!settings.owner.trim()||!settings.basis.trim()||!ev.some(e=>e.task_id==='GLOBAL'&&e.resource_id==='review')))return '确认学校流程须填写责任人、正式依据并归档全局审查证据';
 return null;
}
export function validateReview(r:Review,settings:Settings,ev:Evidence[],previous?:Review):string|null{
 if(!tasks.some(t=>t.id===r.id)||!marks.includes(r.status)||!stages.includes(r.stage))return '任务编号或状态无效';
 if(!constructionScopes.includes(r.scope))return '请选择有效建设路径';
 if(r.reviewDate&&!isValidDate(r.reviewDate))return '审核日期格式无效，请填写真实日期';
 if(r.due&&!isValidDate(r.due))return '补充期限格式无效，请填写真实日期';
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(r.reviewDate&&r.reviewDate>today)return '审核日期不能晚于今天';
 if(previous&&isFinalized(previous)){
  if(isFinalized(r)){
   const changed=(Object.keys(defaultReview(r.id)) as (keyof Review)[]).filter(k=>!['revision','versionNote'].includes(k)).some(k=>k==='resources'?resources.some(x=>['status','note','reviewer'].some(field=>previous.resources[x.id]?.[field as keyof ResourceState]!==r.resources[x.id]?.[field as keyof ResourceState])):previous[k]!==r[k]);
   if(changed)return '已归档任务不可直接改写。请先设置“待核实”或“需补充”，退回“整改复核”并填写原因';
  }else if(r.stage!=='整改复核'||!['待核实','需补充'].includes(r.status))return '重新审查须退回“整改复核”，并将状态改为“待核实”或“需补充”';
 }
 if(!r.resources||typeof r.resources!=='object'||Array.isArray(r.resources))return '资源记录字段无效';
 for(const x of resources){
  const v=r.resources[x.id];
  if(!v||!['status','note','reviewer'].every(k=>typeof v[k as keyof ResourceState]==='string')||!resourceStatuses.includes(v.status))return '资源状态或字段无效';
  if(x.required&&v.status==='不适用')return `${x.name}是方案要求的基础资源，不能直接排除`;
  if(v.status==='不适用'&&!v.note.trim())return '请填写不适用理由';
  if(v.status==='已确认'&&(!v.reviewer.trim()||!ev.some(e=>e.task_id===r.id&&e.resource_id===x.id)))return `${x.name}确认前需归档证据并填写核对人`;
  if(previous?.resources[x.id]?.status==='已确认'&&v.status==='已确认'&&['status','note','reviewer'].some(field=>previous.resources[x.id]?.[field as keyof ResourceState]!==v[field as keyof ResourceState]))return `${x.name}已确认；修改核对记录前请先将状态调整为“待核实”`;
 }
 if(isFinalized(r)){
  if(r.status!=='已确认'||r.stage!=='验收归档')return '正式验收应同时设置已确认和验收归档';
  if(!settings.confirmed)return '请先记录学校已确认的审核流程及正式依据';
  const settingsError=validateSettings(settings,ev);if(settingsError)return '学校审核基线无效：'+settingsError;
  if(!r.reviewer.trim()||!r.reviewBasis.trim()||!r.reviewDate||!r.schoolOwner.trim()||!r.enterpriseOwner.trim())return '请填写校企责任人、审核人、审核日期和正式依据';
  if(!r.conclusion.trim()||/待验收|待核实|尚未|未通过|不通过|待确认/.test(r.conclusion))return '请记录已完成审查且有依据的验收结论；未通过或待核实不能标记已确认';
  const baseline=defaultReview(r.id);if(!r.currentCoverage.trim()||r.currentCoverage===baseline.currentCoverage||r.missing===baseline.missing)return '请更新当前覆盖情况与缺失内容，明确资源交付情况和剩余缺口是否关闭';
  if(resources.some(x=>r.resources[x.id]?.status!=='已确认'&&r.resources[x.id]?.status!=='不适用'))return '所有适用资源须有已确认的核对记录';
  if(previous&&!isFinalized(previous)&&!r.versionNote.trim())return '确认验收须填写本次审核与变更说明';
 }
 if(previous&&previous.stage!==r.stage&&Math.abs(stages.indexOf(previous.stage)-stages.indexOf(r.stage))>1)return '请按相邻阶段流转并逐阶段留下记录';
 if(previous?.stage!==r.stage&&(!r.versionNote.trim()||!r.reviewer.trim()))return '阶段流转须填写经办/审核人和本次变更说明';
 return null;
}
