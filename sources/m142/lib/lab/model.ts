export type ModuleId='flight'|'cloud'|'design'|'iot';
export type Vec3=[number,number,number];
export const modules=[
 {id:'flight' as const,no:'01',name:'航线与采集',en:'FLIGHT PLANNING',subtitle:'从采集参数，理解覆盖与分辨率',tasks:['T03','T07'],steps:['调整航高与重叠率','播放航线，检查采集范围','检查漏拍与几何覆盖'],boundary:'虚拟相机与平坦场地的教学估算。没有接入真实机型、地形、空域或许可，不用于实际飞行。'},
 {id:'cloud' as const,no:'02',name:'点云配准',en:'POINT CLOUD LAB',subtitle:'看见重叠，也看见误差',tasks:['T08','T13','T15'],steps:['观察两组点云的错位','调整位姿或演示对应点求解','用独立检查点复核'],boundary:'合成点云带已知同名点。二维刚体求解仅演示平移与绕竖轴旋转，不是通用ICP，也不代表实测精度合格。'},
 {id:'design' as const,no:'03',name:'更新方案对比',en:'SPATIAL COMPARISON',subtitle:'在同一底座上比较空间决策',tasks:['T22','T23','T24'],steps:['保持视点，切换A/B方案','调整廊架，计算通视','比较路径与教学工程量'],boundary:'两方案共用示意场地与固定观察点。几何分析仅针对已建模对象；不作结构、消防、无障碍或工程安全判断。'},
 {id:'iot' as const,no:'04',name:'物联运维演练',en:'OPERATIONS SIMULATOR',subtitle:'从异常定位，到工单复核闭环',tasks:['T26','T28','T29','T30','T35'],steps:['定位设备并完成首次采样','注入故障并推进3次采样','派单、恢复、处置与复核'],boundary:'全部读数由本机模拟，无真实设备连接。阈值只用于规则练习，不适用于工程安全监测。'},
] as const;
export const defaultFlight={height:45,forward:75,side:60,missing:false};
export type Flight=typeof defaultFlight;
export function flightMetrics(f:Flight){
 if(!Number.isFinite(f.height)||f.height<=0||![f.forward,f.side].every(v=>Number.isFinite(v)&&v>=0&&v<100))throw new RangeError('航高须大于0，重叠率须在0%至100%之间（不含100%）。');
 // 13.2 / 8.8 is exactly 3 / 2; avoid rounding a whole-number spacing above its intended count.
 const width=f.height*1.5,depth=f.height,spacing=depth*(1-f.side/100),step=width*(1-f.forward/100);
 if(![width,depth,spacing,step].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('采集参数超出可计算范围。');
 const intervals=(extent:number,gap:number)=>{const ratio=extent/gap;return Math.max(1,Math.ceil(ratio-Number.EPSILON*Math.max(1,ratio)*4));};
 const rows=intervals(80,spacing)+1,photosPerRow=intervals(120,step)+1;
 if(!Number.isFinite(rows*photosPerRow)||rows*photosPerRow>1_000_000)throw new RangeError('采样密度超出教学模拟范围，请增大航高或降低重叠率。');
 const positions=Array.from({length:rows},(_,i)=>-40+80*i/(rows-1));
 const route:Vec3[]=[];positions.forEach((z,i)=>{route.push([i%2?60:-60,f.height,z],[i%2?-60:60,f.height,z]);});
 // The fixed camera width lies along X. Capture stations cover the full X extent;
 // therefore the exact rectangle union reduces to clipped Z-intervals, not a raster estimate.
 const capturedPositions=positions.filter((_,k)=>!(f.missing&&Math.abs(k-Math.floor(rows/2))<=1));
 let covered=0,end=-40;
 for(const z of capturedPositions){const lo=Math.max(-40,z-depth/2),hi=Math.min(40,z+depth/2);covered+=Math.max(0,hi-Math.max(lo,end));end=Math.max(end,hi);}
 return {width,depth,spacing,step,rows,positions,route,photos:rows*photosPerRow,capturedPhotos:capturedPositions.length*photosPerRow,actualSpacing:80/(rows-1),actualStep:120/(photosPerRow-1),gsd:width/4000*100,coverage:Math.min(100,Math.max(0,covered/80*100)),length:rows*120+80};
}
export const defaultCloud={x:5,z:-3,yaw:6,outliers:true,filter:false};export type Cloud=typeof defaultCloud;
export function referenceCloud():Vec3[]{const p:Vec3[]=[];let seed=12345;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<1000;i++){const x=random()*100-50,z=random()*70-35;p.push([x,.15+Math.sin(x*.08)*.08,z]);}
 for(const [cx,cz,w,d,h]of [[-22,-8,24,18,16],[16,7,18,28,24],[35,-22,15,12,10]])for(let i=0;i<700;i++){const face=i%5;const a=random(),b=random();p.push(face===4?[cx+(a-.5)*w,h,cz+(b-.5)*d]:face<2?[cx+(face?1:-1)*w/2,b*h,cz+(a-.5)*d]:[cx+(a-.5)*w,b*h,cz+(face===2?-1:1)*d/2]);}
 return p;}
export const cloudPoints=referenceCloud();
export function transformedCloud(c:Cloud):Vec3[]{
 if(![c.x,c.z,c.yaw].every(Number.isFinite))throw new RangeError('点云位姿须为有限数值。');
 const a=c.yaw*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
 return cloudPoints.map(([x,y,z],i)=>{const noise=Math.sin(i*12.9898)*.04,bad=c.outliers&&i%43===0;
  // Keep observations fixed in the moving cloud's local frame. Changing its pose
  // must rigidly transform the same noise and outliers instead of regenerating them in world axes.
  const qx=x+noise+(bad?5:0),qz=z-noise+(bad?-4:0);
  return[co*qx+si*qz+c.x,y+noise+(bad?3:0),-si*qx+co*qz+c.z];
 });
}
export function residual(c:Cloud,checkOnly=false){const moving=transformedCloud(c);let sum=0,count=0;cloudPoints.forEach((p,i)=>{if((c.filter&&c.outliers&&i%43===0)||(checkOnly&&i%5!==0))return;sum+=p.reduce((s,v,k)=>s+(v-moving[i][k])**2,0);count++;});return{rmse:Math.sqrt(sum/count),count};}
/** Planar least-squares rigid fit from known correspondences. Every fifth point is held out. */
export function solveCloud(c:Cloud):Cloud {const moving=transformedCloud(c),pairs=cloudPoints.map((p,i)=>({p,q:moving[i],i})).filter(({i})=>i%5!==0&&!(c.filter&&c.outliers&&i%43===0));
 const mean=(key:'p'|'q',j:number)=>pairs.reduce((n,t)=>n+t[key][j],0)/pairs.length;const px=mean('p',0),pz=mean('p',2),qx=mean('q',0),qz=mean('q',2);let a=0,b=0;for(const {p,q}of pairs){a+=(q[0]-qx)*(p[0]-px)+(q[2]-qz)*(p[2]-pz);b+=(q[2]-qz)*(p[0]-px)-(q[0]-qx)*(p[2]-pz);}const theta=Math.atan2(b,a),co=Math.cos(theta),si=Math.sin(theta);const tx=px-co*qx-si*qz,tz=pz+si*qx-co*qz;return{...c,x:co*c.x+si*c.z+tx,z:-si*c.x+co*c.z+tz,yaw:c.yaw+theta*180/Math.PI};}
export type Box={center:Vec3;size:Vec3;kind?:string};
export const defaultDesign={scheme:'B' as 'A'|'B',height:4,ghost:false,sight:true};export type Design=typeof defaultDesign;
export const observer:Vec3=[-50,1.6,0],target:Vec3=[50,8,0];
export function designBoxes(d:Design):Box[]{if(d.scheme==='A')return[{center:[0,6,0],size:[24,12,20]}];if(d.scheme!=='B'||!Number.isFinite(d.height)||d.height<=0)throw new RangeError('方案或廊架标高无效。');return[{center:[0,d.height,0],size:[26,.4,22],kind:'roof'},...[-12,12].flatMap(x=>[-10,10].map(z=>({center:[x,d.height/2,z] as Vec3,size:[.6,d.height,.6] as Vec3,kind:'column'})))];}
/** Returns the first closed-segment hit (0..1), including tangency, or null. */
export function segmentBox(a:Vec3,b:Vec3,box:Box){
 if(![a,b,box.center,box.size].every(v=>v.length===3&&v.every(Number.isFinite))||box.size.some(v=>v<0))throw new RangeError('线段与包围盒须使用有限坐标，尺寸不得为负。');
 let lo=0,hi=1;for(let k=0;k<3;k++){const delta=b[k]-a[k],min=box.center[k]-box.size[k]/2,max=box.center[k]+box.size[k]/2;if(delta===0){if(a[k]<min||a[k]>max)return null;}else{const x=(min-a[k])/delta,y=(max-a[k])/delta;lo=Math.max(lo,Math.min(x,y));hi=Math.min(hi,Math.max(x,y));if(lo>hi)return null;}}return lo;
}
export function designMetrics(d:Design){const boxes=designBoxes(d),intersections=boxes.map(b=>segmentBox(observer,target,b)).filter(x=>x!==null) as number[];const hit=intersections.length?Math.min(...intersections):null;return{visible:hit===null,hit,route:d.scheme==='A'?144:100,volume:boxes.reduce((s,b)=>s+b.size[0]*b.size[1]*b.size[2],0),green:d.scheme==='A'?720:1200,boxes};}
export const sensors=[{id:'S01',name:'能源站 · 温度',asset:'ASSET-01',unit:'°C',base:26,high:58,threshold:45,pos:[-28,18,-14] as Vec3},{id:'S02',name:'设备房 · 振动',asset:'ASSET-02',unit:'mm/s',base:.8,high:4.6,threshold:3,pos:[25,22,-12] as Vec3},{id:'S03',name:'调蓄池 · 水位',asset:'ASSET-03',unit:'cm',base:42,high:92,threshold:80,pos:[5,3,25] as Vec3}];
export type Incident='none'|'alert'|'assigned'|'treated'|'closed';
export type SensorState={fault:'normal'|'high'|'offline';threshold:number;samples:number;incident:Incident;value:number|null;tick:number;sampleValid?:boolean;sampledFault?:'normal'|'high'|'offline';sampledThreshold?:number};
export type SensorAction='assign'|'treat'|'close';
function sensorDefinition(id:string){const def=sensors.find(x=>x.id===id);if(!def)throw new RangeError('未知教学设备。');return def;}
function validateSensorConfig(s:Pick<SensorState,'fault'|'threshold'>,id:string){sensorDefinition(id);if(!['normal','high','offline'].includes(s.fault)||!Number.isFinite(s.threshold)||s.threshold<0||s.threshold>(id==='S02'?20:150))throw new RangeError('教学故障类型或阈值超出允许范围。');}
export function defaultSensorStates():Record<string,SensorState>{return Object.fromEntries(sensors.map(s=>[s.id,{fault:'normal',threshold:s.threshold,samples:0,incident:'none',value:null,tick:0,sampleValid:false}]));}
/** No reading, including a legacy snapshot, proves recovery until sampled under current settings. */
export function isSensorSampleCurrent(s:SensorState):boolean{return s.sampleValid===true&&Number.isSafeInteger(s.tick)&&s.tick>0&&s.sampledFault===s.fault&&s.sampledThreshold===s.threshold;}
export function configureSensor(s:SensorState,id:string,changes:{fault?:SensorState['fault'];threshold?:number}):SensorState{
 const next={...s,...changes};validateSensorConfig(next,id);
 return{...next,value:null,samples:0,sampleValid:false,incident:s.incident==='treated'?'assigned':s.incident};
}
export function sampleSensor(s:SensorState,id:string):SensorState{
 validateSensorConfig(s,id);const def=sensorDefinition(id);
 if(!Number.isSafeInteger(s.tick)||s.tick<0||s.tick>=Number.MAX_SAFE_INTEGER||!Number.isInteger(s.samples)||s.samples<0||!['none','alert','assigned','treated','closed'].includes(s.incident))throw new RangeError('教学设备采样状态无效。');
 const tick=s.tick+1,value=s.fault==='offline'?null:Number(((s.fault==='high'?def.high:def.base)+Math.sin(tick*.7)*(id==='S02'?.08:.6)).toFixed(2));
 const exceed=value!==null&&value>s.threshold,samples=exceed?Math.min(3,(isSensorSampleCurrent(s)?s.samples:0)+1):0;
 // A fresh abnormal or missing reading invalidates an earlier treatment review.
 let incident=s.incident==='treated'&&(!isSensorSampleCurrent(s)||s.fault!=='normal'||value===null||exceed)?'assigned' as const:s.incident;
 if(samples>=3&&(incident==='none'||incident==='closed'))incident='alert';
 return{...s,tick,value,samples,incident,sampleValid:true,sampledFault:s.fault,sampledThreshold:s.threshold};
}
export const incidentLabels:Record<Incident,string>={none:'暂无事件',alert:'告警待派单',assigned:'工单处理中',treated:'处置待复核',closed:'教学闭环已记录'};
export function canTransitionSensor(s:SensorState,action:SensorAction):boolean{
 if(action==='assign')return s.incident==='alert';
 const recovered=isSensorSampleCurrent(s)&&s.fault==='normal'&&s.value!==null&&Number.isFinite(s.value)&&Number.isFinite(s.threshold)&&s.value<=s.threshold;
 return recovered&&(action==='treat'?s.incident==='assigned':action==='close'&&s.incident==='treated');
}
export function transitionSensor(s:SensorState,action:SensorAction):SensorState {if(canTransitionSensor(s,action))return{...s,incident:action==='assign'?'assigned':action==='treat'?'treated':'closed'};throw Error('当前条件不满足：按派单、恢复输入并重新采样、记录处置、复核关闭的顺序操作。');}
export type LabConfig={module:ModuleId;flight:Flight;cloud:Cloud;design:Design;sensors:Record<string,SensorState>;selectedSensor:string;playing:boolean;night:boolean;labels:boolean;quality:'high'|'low'};
export type LabEvent={id:string;time:string;module:ModuleId;action:string;detail:string};
export type Snapshot={id:string;time:string;module:ModuleId;note:string;config:LabConfig;summary:string;events:LabEvent[];status:'教学练习 · 待教师核对'};
export const simulationBoundary='教学模拟 / 合成数据 / 草案。练习完成不等于能力评价通过，不自动写入正式审查或验收。';
