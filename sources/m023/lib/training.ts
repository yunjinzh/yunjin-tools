export type Mode='learn'|'practice'|'exam';
export type SimEvent={action:string;target:string;tool:string;value?:number;at:number;step:number;ok:boolean;message:string;fatal?:boolean};
export const toolsList=[{id:'hand',name:'手部操作',short:'01'},{id:'ppe',name:'防护检查',short:'02'},{id:'meter',name:'万用表',short:'03'},{id:'socket',name:'绝缘套筒',short:'04'},{id:'torque',name:'扭力扳手',short:'05'},{id:'lift',name:'托举设备',short:'06'}];
export const parts:Record<string,string>={vehicle:'教学车辆',ppe:'防护用品',lv:'低压隔离点',ref:'仪表校验源',test:'高压模拟测点',lift:'车辆举升机',connector:'高压接插件',support:'电池托举台',bolts:'电池包紧固件',battery:'动力电池包',coolant:'冷却接口',bms:'电池管理单元'};
export const steps=[
 {id:'ppe',title:'工位与防护检查',group:'安全准备',target:'ppe',tool:'ppe',action:'确认防护',hint:'检查隔离区域、手套外观与有效期，并确认防护用品完好。',why:'作业条件与个人防护是后续操作的前提。'},
 {id:'isolate',title:'低压隔离与挂牌',group:'安全准备',target:'lv',tool:'hand',action:'隔离并挂牌',hint:'选择低压隔离点，执行本教学工单的隔离动作。',why:'低压隔离不代表电池内部能量消失，仍需完成规定的验证。'},
 {id:'ref1',title:'仪表使用前校验',group:'安全准备',target:'ref',tool:'meter',action:'测量校验源',hint:'选用直流电压挡，测量教学校验源。',why:'确认仪表能够正确显示已知电压。'},
 {id:'verify',title:'高压停用状态验证',group:'安全准备',target:'test',tool:'meter',action:'记录模拟测量',hint:'在直流电压挡下测量指定的教学测点；读数仅用于本模拟工单。',why:'用测量证据确认操作条件，而非仅依赖断电动作。'},
 {id:'ref2',title:'仪表使用后校验',group:'安全准备',target:'ref',tool:'meter',action:'完成再次校验',hint:'再次测量校验源，确认仪表在测量后仍有效。',why:'形成测前校验、目标测量、测后校验的证据闭环。'},
 {id:'raise',title:'车辆举升与锁止',group:'拆卸电池',target:'lift',tool:'lift',action:'举升并锁止',hint:'检查支撑位置后举升，确认机械锁止。',why:'车辆支撑与锁止状态独立记录。'},
 {id:'unlock',title:'接插件二次锁解锁',group:'拆卸电池',target:'connector',tool:'hand',action:'释放二次锁',hint:'先解除接插件二次锁，再进行分离操作。',why:'接插件锁止、机械连接和电气连接是三个不同状态。'},
 {id:'disconnect',title:'断开接插件与冷却接口',group:'拆卸电池',target:'connector',tool:'hand',action:'断开并封护接口',hint:'本原型合并表达冷却回收、接口分离与封护；正式规程需按车型展开。',why:'线束与管路都应在电池移动之前完成处理。'},
 {id:'support',title:'托举台对位与承托',group:'拆卸电池',target:'support',tool:'lift',action:'对位并锁定',hint:'将托举台对准电池支撑区域并锁定。',why:'拆卸承载紧固件前，电池包应有独立支撑。'},
 {id:'remove',title:'依次拆卸教学紧固件',group:'拆卸电池',target:'bolts',tool:'socket',action:'拆卸一颗紧固件',hint:'逐颗操作，六颗为教学简化数量。拆下的紧固件进入零件托盘。',why:'记录每颗紧固件状态，防止遗漏。'},
 {id:'lower',title:'下降并移出电池包',group:'拆卸电池',target:'battery',tool:'lift',action:'下降并移出',hint:'确认连接已分离、紧固件已拆除、支撑已锁定。',why:'状态联锁控制电池的移动条件。'},
 {id:'inspect',title:'检查与安装准备',group:'安装复核',target:'battery',tool:'hand',action:'完成外观及零件检查',hint:'检查壳体、接口和密封件；按教学工单确认替换件。',why:'拆卸和安装具有不同的质量检查要求。'},
 {id:'install',title:'电池包回装对位',group:'安装复核',target:'battery',tool:'lift',action:'回装并对位',hint:'将电池包提升到安装位置，保持托举台承托。',why:'对位完成后才能进行紧固操作。'},
 {id:'tighten',title:'紧固与质量确认',group:'安装复核',target:'bolts',tool:'torque',action:'紧固一颗教学螺栓',hint:'本模拟任务设定为 24 N·m，共六颗；此值不是 Model Y 维修参数。',why:'记录工具设定、紧固对象和完成状态。'},
 {id:'reconnect',title:'接口恢复与工具清点',group:'安装复核',target:'connector',tool:'hand',action:'恢复接口并清点',hint:'确认插接、二次锁、冷却接口及零件工具清点结果。',why:'接口恢复需要机械与电气状态同时确认。'},
 {id:'check',title:'恢复与完工验证',group:'安装复核',target:'bms',tool:'meter',action:'运行教学完工检查',hint:'读取教学诊断结果并核对完工检查项目。',why:'完成流程后仍需验证维修结果。'},
];
export type State={step:number;bolts:number;tightened:number;fatal:boolean;events:SimEvent[]};
export const initial:State={step:0,bolts:0,tightened:0,fatal:false,events:[]};
export function act(s:State,mode:Mode,input:{target:string;tool:string;value?:number;at:number}):State {
 if(s.fatal||s.step>=steps.length)return s;
 const r=steps[s.step];let ok=true,message='操作完成',fatal=false;
 if((input.target==='connector'||input.target==='bolts'||input.target==='battery')&&s.step<5&&input.tool!=='meter'){ok=false;message='安全违规：尚未完成停用状态验证，禁止拆卸高压相关部件。';fatal=mode==='exam';}
 else if(input.target!==r.target){ok=false;message='操作对象与当前工单条件不匹配，请检查任务及前置状态。';}
 else if(input.tool!==r.tool){ok=false;message='工具选择与当前操作不匹配。';}
 else if(['ref1','verify','ref2'].includes(r.id)&&input.value!==1){ok=false;message='测量挡位不正确，请依据任务选用直流电压挡。';}
 else if(r.id==='tighten'&&input.value!==24){ok=false;message='扭矩设定不符合本教学工单（模拟设定 24 N·m）。';}
 let step=s.step,bolts=s.bolts,tightened=s.tightened;
 if(ok){if(r.id==='remove'){bolts++;message=`紧固件 ${bolts}/6 已入托盘`;if(bolts===6)step++;}else if(r.id==='tighten'){tightened++;message=`紧固件 ${tightened}/6 已确认`;if(tightened===6)step++;}else step++;}
 return {step,bolts,tightened,fatal,events:[...s.events,{...input,action:r.action,step:s.step,ok,message,fatal}]};
}
export function score(s:State){return s.fatal?0:Math.max(0,Math.round((s.step/steps.length)*100)-s.events.filter(e=>!e.ok).length*5);}
export function reconstruct(events:SimEvent[],mode:Mode):State {return events.reduce<State>((s,e)=>act(s,mode,{target:e.target,tool:e.tool,value:e.value,at:e.at}),{...initial,events:[]});}
export const faults=[
 {id:'hvil',title:'无法进入运行状态',code:'SIM-HVIL-01',cause:'高压互锁连接异常',symptom:'工单记录：维护后无法进入运行状态，低压仪表正常。',readings:[['低压供电','13.2 V','正常'],['互锁回路','开路','异常'],['绝缘状态','正常','正常'],['温度采样','26 °C','正常']],evidence:[0,1,2],fix:'恢复互锁连接并检查二次锁'},
 {id:'isolation',title:'绝缘状态报警',code:'SIM-ISO-02',cause:'高压支路绝缘异常',symptom:'工单记录：系统报告绝缘异常，需定位异常支路。',readings:[['低压供电','13.2 V','正常'],['互锁回路','闭合','正常'],['绝缘状态','支路 B 异常','异常'],['温度采样','25 °C','正常']],evidence:[0,1,2],fix:'处理异常支路并按规程复测'},
 {id:'sensor',title:'温度数据异常',code:'SIM-TEMP-03',cause:'温度采样链路异常',symptom:'工单记录：冷车启动即显示温度异常，检查数据是否一致。',readings:[['低压供电','13.1 V','正常'],['温度采样','−40 °C','异常'],['独立温度','25 °C','正常'],['冷却回路','保持压力','正常']],evidence:[1,2,3],fix:'恢复采样链路并对照独立测量'},
 {id:'contactor',title:'停用状态检查异常',code:'SIM-CONT-04',cause:'接触器反馈不一致',symptom:'工单记录：停用检查出现异常反馈，停止拆卸并开展诊断。',readings:[['低压供电','13.2 V','正常'],['接触器指令','断开','正常'],['接触器反馈','闭合','异常'],['互锁回路','闭合','正常']],evidence:[0,1,2],fix:'升级维修处置并验证停用状态'},
 {id:'cooling',title:'温升与冷却异常',code:'SIM-COOL-05',cause:'冷却回路泄漏',symptom:'工单记录：运行后温度上升，需比较传感器与回路检测。',readings:[['温度采样','52 °C','异常'],['独立温度','51 °C','异常'],['冷却回路','保压下降','异常'],['互锁回路','闭合','正常']],evidence:[0,1,2],fix:'修复回路并完成补液与验证'},
];
export function diagnosisScore(faultId:string,evidence:number[],answer:string,repaired:boolean,verified:boolean){const f=faults.find(f=>f.id===faultId);if(!f)return 0;return Math.round(f.evidence.filter(i=>evidence.includes(i)).length/f.evidence.length*45)+(answer===f.cause?35:0)+(repaired?10:0)+(verified?10:0);}
