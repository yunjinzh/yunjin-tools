export const statuses=['草案','待验证','已确认','需补充'];
export const stages=['需求梳理','方案设计','实施建设','验证验收','持续运营'];
export const types=['项目方案','课程体系','技术架构','招投标材料','制度文档','演示案例'];
export const fields=[['background','背景与问题'],['goals','建设目标'],['modules','业务模块'],['route','技术路线'],['sources','数据来源'],['steps','实施步骤'],['budget','预算与采购构成'],['demo','演示脚本'],['deliverables','交付物'],['missing','待补资料'],['risks','风险与跟进事项']] as const;
export type Fact={text:string;status:string;evidence:string};
export type Task={id:string;title:string;owner:string;due:string;done:boolean};
export type Material={id:string;name:string;type:string;status:string;evidence:string;key:string;url:string;date:string};
export type Snapshot=Omit<Project,'versions'>;
export type Version={id:string;date:string;note:string;snapshot:Snapshot};
export type Project={id:string;name:string;scene:string;audience:string;org:string;tech:string;stage:string;status:string;evidence:string;type:string;summary:string;updated:string;archived:boolean;facts:Record<string,Fact>;tasks:Task[];materials:Material[];moduleIds:string[];relatedIds:string[];versions:Version[]};
export type Module={id:string;name:string;category:string;description:string;inputs:string;outputs:string;status:string};
export type Workspace={projects:Project[];modules:Module[]};
export const uid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
export function blankProject():Project{return {id:uid(),name:'',scene:'数字孪生校园',audience:'高等教育',org:'',tech:'数字孪生',stage:stages[0],status:'草案',evidence:'',type:types[0],summary:'',updated:new Date().toISOString(),archived:false,facts:Object.fromEntries(fields.map(([k])=>[k,{text:'',status:'需补充',evidence:''}])),tasks:[],materials:[],moduleIds:[],relatedIds:[],versions:[]}}
export function snapshot(p:Project):Snapshot{const {versions,...rest}=p;return rest}
export function completeness(p:Project){return Math.round(fields.filter(([k])=>p.facts[k]?.text.trim()).length/fields.length*100)}
export function issues(p:Project){return fields.filter(([k])=>!p.facts[k]?.text.trim()||p.facts[k].status==='需补充'||p.facts[k].status==='待验证')}
export function seed():Workspace{
const modules:Module[]=[
{id:'m1',name:'时空数据底座',category:'空间智能',description:'统一管理空间、业务与时序数据，为场景应用提供可追溯的数据服务。',inputs:'GIS / BIM / 倾斜摄影 / IoT 接口',outputs:'场景数据服务、对象编码、更新机制',status:'草案'},
{id:'m2',name:'校园安防与应急联动',category:'数字孪生',description:'将安防事件关联至三维空间，串联研判、处置与复盘。',inputs:'视频点位、设备台账、告警事件',outputs:'告警定位、应急预案、处置记录',status:'草案'},
{id:'m3',name:'虚实融合任务训练',category:'具身智能',description:'围绕抓取、搬运和配送构建虚拟任务与现实验证流程。',inputs:'机器人模型、物理参数、任务约束',outputs:'任务脚本、训练场景、验证记录',status:'待验证'},
{id:'m4',name:'教学—实训—考核',category:'虚拟仿真',description:'将知识学习、操作训练与过程评价连接成完整的教学任务。',inputs:'课程标准、岗位流程、评分规则',outputs:'课程任务、实训案例、评价量表',status:'草案'},
{id:'m5',name:'城市体检与更新诊断',category:'城市更新',description:'以问题清单连接社区空间分析、更新措施与过程跟踪。',inputs:'社区边界、调查数据、设施清单',outputs:'问题地图、更新建议、跟踪台账',status:'草案'},
{id:'m6',name:'三维交互与演示',category:'数字孪生',description:'复用场景漫游、图层控制、设备查询与关键帧导览能力。',inputs:'三维模型、业务图层、导览脚本',outputs:'交互场景、演示流程、案例素材',status:'草案'}];
const data=[
['三峡大学 · 数字孪生校园','数字孪生校园','高等教育','三峡大学','数字孪生','方案设计','项目方案','连接校园空间与业务，让安防、资产和教学在同一张图上协同。','校域立体监控、智能巡更、AI预警、智慧停车、房产可视化、实验室综合管控。','时空数据平台 + 三维校园场景 + 业务服务接口；可探索行为分析与空间智能训练场。',['m1','m2','m6']],
['具身智能 · 虚实融合训练场','具身智能训练场','职业教育','合作单位待补充','具身智能','方案设计','演示案例','围绕咖啡制作配送与物流箱搬运，构建可观察、可验证的机器人任务场景。','咖啡制作与配送；物流箱搬运；多相机视角；任务过程记录。','Three.js 场景与物理交互；Real2Sim2Real 路线尚需验证。',['m3','m4','m6']],
['城检智诊 · 老旧社区体检更新','城市更新','政府 / 行业','合作单位待补充','空间智能','需求梳理','项目方案','从社区问题识别到空间诊断，探索可复用的城市体检与更新方法。','社区体检、问题定位、设施分析、更新建议与跟踪。','空间数据分析 + 问题清单 + 更新措施关联；具体指标待核实。',['m1','m5']],
['昆明冶金 · 建筑虚拟仿真实训','虚拟仿真','职业教育','昆明冶金职业大学','虚拟仿真','方案设计','课程体系','将实景三维建模与专业实训案例组合，支撑建筑工程教学。','实景三维建模平台、三维场景、虚拟仿真实训案例、课程培训。','实景采集 → 三维建模 → 教学任务 → 实训评价。',['m4','m6']],
['新能源汽车 · 维修实训','教学实训','职业教育','合作学校待补充','虚拟仿真','需求梳理','演示案例','以电池拆装与故障诊断为载体，串联教学、实训、考核。','电池拆装、故障诊断、教学指引、过程评价。','Three.js 交互场景与规则层分离；车型与模型授权待核实。',['m4','m6']],
['国土整治 · 监测监管','土地整治与生态修复','政府 / 行业','广东省土地开发整治中心（关联信息待验证）','空间智能','需求梳理','技术架构','围绕全域土地综合整治、耕地保护、生态修复，组织监管业务与空间数据。','全域土地综合整治、补充耕地、耕地集中整治区、山水林田湖草、矿山生态修复、拆旧复垦、临时用地、耕地占补平衡、一张图。','时空数据底座 + 项目业务管理 + 整治修复一张图；接口规范待补充。',['m1','m6']]
] as const;
const projects=data.map((r,i)=>{const p=blankProject();p.id='p'+(i+1);[p.name,p.scene,p.audience,p.org,p.tech,p.stage,p.type,p.summary]=r.slice(0,8) as string[];p.status='待验证';p.evidence='来源：历史讨论摘要整理，未核验原始文件；学校名称仅用于项目索引，不代表合作已确认。';p.moduleIds=[...r[10]];p.facts.background={text:r[7],status:'待验证',evidence:p.evidence};p.facts.modules={text:r[8],status:'待验证',evidence:p.evidence};p.facts.route={text:r[9],status:'草案',evidence:'规划思路，需技术评审'};p.facts.missing={text:'补充最新需求文件、合作边界、实施周期、预算依据与验收标准。',status:'需补充',evidence:''};p.tasks=[{id:'t'+i,title:'核实项目背景与合作边界',owner:'待分配',due:'',done:false}];p.updated='2026-11-10T01:00:00.000Z';p.versions=[{id:'v0-'+i,date:p.updated,note:'初始整理 · 待核实',snapshot:snapshot(p)}];return p});
projects[1].facts.demo={text:'从吧台起点抓取无盖陶瓷杯，完成持壶倒水或按钮出液，再配送至指定位置。物流场景拟搬运不超过10kg箱体，载荷能力待实测。',status:'待验证',evidence:'历史任务设想，非已验证能力'};
projects[3].facts.budget={text:'历史讨论预算草案：合计100万元，其中平台40万、三维场景40万、实训案例10万、课程培训10万。需以正式预算批复和采购清单为准。',status:'待验证',evidence:'仅来自历史讨论摘要，未核验预算文件'};
projects.forEach(p=>p.versions[0].snapshot=snapshot(p));return {projects,modules};}
