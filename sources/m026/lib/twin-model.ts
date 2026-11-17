export type Asset={id:string;name:string;kind:'device'|'person'|'vehicle'|'camera';zone:string;position:[number,number,number];capacity?:number;temp?:number;load?:number;role?:string};
export const assets:Asset[]=[
{id:'CNC-01',name:'五轴加工中心 01',kind:'device',zone:'A区 · 精密加工',position:[-21,0,-12],capacity:30,temp:58,load:82},
{id:'CNC-02',name:'五轴加工中心 02',kind:'device',zone:'A区 · 精密加工',position:[-11,0,-12],capacity:30,temp:55,load:74},
{id:'ROB-01',name:'装配机器人 01',kind:'device',zone:'B区 · 柔性装配',position:[11,0,-12],capacity:50,temp:42,load:76},
{id:'ROB-02',name:'装配机器人 02',kind:'device',zone:'B区 · 柔性装配',position:[21,0,-12],capacity:50,temp:41,load:63},
{id:'QC-01',name:'在线检测单元',kind:'device',zone:'C区 · 质量检测',position:[-17,0,14],capacity:90,temp:36,load:67},
{id:'ST-01',name:'智能立体仓库',kind:'device',zone:'D区 · 智能仓储',position:[17,0,15],capacity:80,temp:30,load:51},
{id:'P-01',name:'李工 · 设备工程师',kind:'person',zone:'A区东侧通道',position:[-3,0,-8],role:'检修 / 当班'},
{id:'P-02',name:'张工 · 生产班长',kind:'person',zone:'B区南侧通道',position:[12,0,-3],role:'调度 / 当班'},
{id:'P-03',name:'王工 · 质量工程师',kind:'person',zone:'C区检测工位',position:[-10,0,13],role:'质检 / 当班'},
{id:'AGV-01',name:'物料运输 AGV 01',kind:'vehicle',zone:'中央物流通道',position:[-3,0,3],role:'负载 240 kg / 电量 86%'},
{id:'AGV-02',name:'成品运输 AGV 02',kind:'vehicle',zone:'南侧物流通道',position:[12,0,25],role:'负载 180 kg / 电量 72%'},
{id:'CAM-01',name:'加工区全景摄像机',kind:'camera',zone:'A区东南角',position:[-3,0,-20],role:'模拟机位 / 3D场景画面'},
{id:'CAM-02',name:'仓储区全景摄像机',kind:'camera',zone:'D区西北角',position:[4,0,9],role:'模拟机位 / 3D场景画面'}];
export type DeviceState={temp:number;load:number;running:boolean;sampleAt:number;receivedAt:number;renderedAt:number;seq:number};
export type States=Record<string,DeviceState>;
export function initialStates():States{return Object.fromEntries(assets.filter(a=>a.kind==='device').map(a=>[a.id,{temp:a.temp!,load:a.load!,running:true,sampleAt:0,receivedAt:0,renderedAt:0,seq:0}]))}
export type PlanInput={quantity:number;repair:number;reserve:number;deadline:number};
export function computePlans(p:PlanInput){
 if(![p.quantity,p.repair,p.reserve,p.deadline].every(Number.isFinite)||p.quantity<=0||p.repair<0||p.reserve<=0||p.deadline<=0)throw new Error('计划参数需为有效正数');
 const base=30; const firstStart=Math.min(8,p.repair), secondStart=Math.max(8,p.repair), firstRate=p.repair<8?base:p.reserve, earlyOutput=(secondStart-firstStart)*firstRate/60; const parallelTime=p.quantity<=earlyOutput?firstStart+p.quantity/firstRate*60:secondStart+(p.quantity-earlyOutput)/(base+p.reserve)*60; const rows=[{id:'wait',name:'等待检修后生产',time:p.repair+p.quantity/base*60,energy:p.quantity*.82,cost:0,logic:`检修 ${p.repair} min + ${p.quantity} 件 ÷ 30 件/h × 60`},
 {id:'reserve',name:'切换备用加工线',time:8+p.quantity/p.reserve*60,energy:p.quantity*.94,cost:180,logic:`换线 8 min + ${p.quantity} 件 ÷ ${p.reserve} 件/h × 60`},
 {id:'parallel',name:'备用与检修后并行',time:parallelTime,energy:p.quantity*1.02,cost:320,logic:`备用线第 8 min 启动；主线第 ${p.repair} min 恢复；分段累计产量达到 ${p.quantity} 件`}];
 const feasible=rows.filter(r=>r.time<=p.deadline);const best=feasible.length?feasible.reduce((a,b)=>a.energy<b.energy?a:b):rows.reduce((a,b)=>a.time<b.time?a:b);
 return rows.map(r=>({...r,time:Math.round(r.time*10)/10,energy:Math.round(r.energy*10)/10,late:Math.max(0,Math.round((r.time-p.deadline)*10)/10),recommended:r.id===best.id}));
}
export type RawRow={id:string;device:string;time:string;temp:number|null;unit:string};
export const rawRows:RawRow[]=[
{id:'001',device:'CNC-01',time:'2026-10-07T08:00:00+08:00',temp:58.2,unit:'°C'},
{id:'002',device:'CNC-02',time:'2026-10-07T08:00:00+08:00',temp:131,unit:'°F'},
{id:'003',device:'ROB-01',time:'2026-10-07T08:00:00+08:00',temp:42,unit:'°C'},
{id:'004',device:'CNC-01',time:'2026-10-07T08:00:00+08:00',temp:58.2,unit:'°C'},
{id:'005',device:'QC-01',time:'2026-10-07T08:00:01+08:00',temp:null,unit:'°C'},
{id:'006',device:'ST-01',time:'2026-10-07T08:00:01+08:00',temp:999,unit:'°C'},
{id:'007',device:'ROB-02',time:'2026-10-07T08:00:01+08:00',temp:41.1,unit:'°C'},
{id:'008',device:'CNC-01',time:'2026-10-07T08:00:02+08:00',temp:59.1,unit:'°C'},
{id:'009',device:'UNKNOWN',time:'2026-10-07T08:00:02+08:00',temp:39,unit:'°C'},
{id:'010',device:'ST-01',time:'2026-10-07T08:00:02+08:00',temp:30.5,unit:'°C'}];
export function cleanRows(rows:RawRow[]){const seen=new Set<string>();return rows.map(r=>{let result='通过',valid=true;let temp=r.temp;const key=`${r.device}/${r.time}`;if(!assets.some(a=>a.id===r.device&&a.kind==='device')){result='隔离 · 未注册设备';valid=false}else if(seen.has(key)){result='去重 · 同设备同时间';valid=false}else if(temp===null){result='隔离 · 缺失值';valid=false}else {if(r.unit==='°F'){temp=Math.round((temp-32)*5/9*10)/10;result='标准化 · °F 转 °C'}if(temp<-20||temp>150){result='隔离 · 越界值';valid=false}}seen.add(key);return {...r,cleanTemp:temp,result,valid}})}
export function replaySnapshot(second:number){const t=Math.max(0,Math.min(120,second));const fault=t>=25&&t<90;return {second:t,fault,status:t<25?'稳定生产':t<40?'温度越限，告警触发':t<60?'调度确认，检修派单':t<90?'备用线承接，人员到场':'检修完成，生产恢复',temp:fault?86+Math.sin(t)*1.5:58+Math.sin(t)*1.2,agv:[-23+(t%60)*.8,0,3] as [number,number,number],person:[t<60?-3:-17,0,t<60?-8:-8] as [number,number,number]}}
export const integrationContract={version:'1.0-demo',mode:'simulation-only',description:'拟对接契约；当前页面仅浏览器内模拟，以下为设计端点，未连接现网。',identity:{asset_id:'CNC-01',coordinate_frame:'LOCAL_FACTORY_METER',real_world_transform:'待项目测绘坐标及模型原点确认'},telemetry:{transport:'MQTT → 接入网关 → WebSocket',proposed_endpoint:'wss://<gateway>/v1/telemetry',fields:{asset_id:'CNC-01',sequence:101,event_time:'ISO8601 with timezone',gateway_received_at:'ISO8601',quality:'GOOD | BAD | UNCERTAIN',values:{temperature:{value:58.2,unit:'degC'},running:true}}},alarms:{proposed_endpoint:'GET /v1/alarms',fields:['alarm_id','asset_id','rule_id','severity','event_time','ack_by','closed_at']},control:{proposed_endpoint:'POST /v1/commands',fields:['command_id','idempotency_key','asset_id','action','requested_by','expires_at','interlock_snapshot'],ack_states:['accepted','executing','succeeded','rejected','timed_out'],boundary:'现网网关执行权限、联锁、超时及审计；浏览器不直连PLC'},position:{proposed_endpoint:'WS /v1/positions',fields:['asset_id','event_time','coordinate_frame','x','y','z','accuracy_m']},video:{proposed_endpoint:'POST /v1/video/sessions',protocol:'WebRTC / HLS，由视频平台授权转码'},communication:{proposed_endpoint:'POST /v1/calls',protocol:'融合通信平台 SIP/WebRTC 适配',fields:['call_id','participant_ids','media_type','status']},sla:{definition:'首次画面反映样本时刻 - 设备事件采集时刻',target_ms:3000,prerequisites:['端到端时钟同步','设备/网关/服务/浏览器同一trace_id','按设备记录最大值、P95、P99及超限数量','生产网络、规模、采样频率、后台页面与断网恢复测试'],demo:'浏览器模拟采集→延迟队列→接收→Three.js渲染回执；不构成真实验收结果'}};
