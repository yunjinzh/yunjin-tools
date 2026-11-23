export const ROADS=[-400,-200,0,200,400];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const JOBS=[
 {id:'handover',name:'夜班交接',type:'限时送件',area:'前门 → 国贸',reward:280,limit:180,brief:'老陈的夜班资料需要在三分钟内送到国贸。先到前门取件，再开车沿城市道路送达。',stages:[{x:-18,z:110,label:'到前门取夜班资料',action:'取件'},{x:218,z:-100,label:'把资料送到国贸路口',action:'交付'}]},
 {id:'echo',name:'胡同回声',type:'取件与追逐',area:'鼓楼 → 前门',reward:360,limit:240,brief:'从鼓楼取回旧电台磁带。取件后会有巡逻车追踪，离开巡逻视线，警戒消退后再交给前门联络人。',stages:[{x:-110,z:-218,label:'在鼓楼南侧取回磁带',action:'取回磁带'},{x:-18,z:110,label:'甩开巡逻后交还磁带',action:'交还'}]},
 {id:'race',name:'二环夜跑',type:'九道门计时赛',area:'城市环线',reward:420,limit:110,brief:'驾驶汽车依次通过九道检查门。沿路面导航行驶，在110秒内返回起点；个人最佳成绩会自动保存。',stages:[{x:0,z:0},{x:0,z:-200},{x:200,z:-200},{x:400,z:-200},{x:400,z:0},{x:400,z:200},{x:200,z:200},{x:0,z:200},{x:0,z:0}].map((p,i)=>({...p,label:`通过检查门 ${i+1} / 9`,auto:true}))},
 {id:'stealth',name:'雨夜寻声',type:'潜入与撤离',area:'798 艺术街区',reward:320,limit:240,brief:'雨夜里，到798街区取回一份录音。步行进入，按Q蹲行可以降低被发现的概率。避开巡逻人员后沿原路撤离。无警报完成可获得完整奖励。',stages:[{x:315,z:215,label:'步行进入798南侧入口',action:'进入街区',foot:true},{x:340,z:245,label:'找到录音盒并拾取',action:'拾取录音',foot:true},{x:218,z:215,label:'返回街区外的接应点',action:'完成撤离',foot:true}]},
 {id:'ferry',name:'什海夜渡',type:'游船接驳',area:'什刹海',reward:300,limit:240,brief:'前往什刹海东岸码头，按E上船。沿水面标记收取两封岸边邮袋，再低速返回东岸泊位。',stages:[{x:-224,z:-292,label:'到东岸码头登船',auto:true,boat:true},{x:-270,z:-350,label:'驶近北岸收取邮袋',auto:true,boat:true},{x:-350,z:-260,label:'驶近西岸收取邮袋',auto:true,boat:true},{x:-224,z:-292,label:'低速返回东岸泊位',auto:true,boat:true,stop:true}]},
 {id:'delivery',name:'街巷速递',type:'循环配送',area:'前门街坊',reward:95,limit:150,brief:'从前门街坊领取包裹，按导航送到指定地点。完成后可以继续接单，配送累计次数自动保存。',stages:[{x:-18,z:110,label:'到前门领取街坊包裹',action:'领取包裹'},{x:-218,z:-100,label:'送到北海东侧路口',action:'送达'}]}
];
export const TAPES=[[-18,-130],[218,-100],[-110,-218],[-208,-292],[105,218],[418,-300],[-218,100],[218,320],[-418,-100],[-100,418],[110,-418],[-418,320]].map(([x,z],i)=>({id:'tape-'+i,x,z,name:['胡同清晨','晚高峰','鼓楼电波','什海晚风','祈年回响','奥体夜色','前门旧事','工厂留声','西城落日','南城晚班','中轴线','末班车'][i]}));
export const PAINTS=[{name:'京墨绿',value:'#315d50',price:0},{name:'宫墙红',value:'#a93630',price:120},{name:'银杏金',value:'#d5a53c',price:120},{name:'月光白',value:'#dbdfd8',price:120},{name:'夜幕蓝',value:'#344c78',price:120}];
export const UPGRADES=[320,600,950];
export function settleJob(save,mission){
 const job=JOBS.find(j=>j.id===mission?.id);if(!job)throw Error('未知任务');
 const reward=job.id==='stealth'&&mission.alerted?180:job.reward;
 if(job.id==='race'){const time=Math.max(.01,mission.total-mission.time);if(!save.bestRace||time<save.bestRace)save.bestRace=time;}
 if(job.id==='delivery')save.delivered++;else if(!save.completed.includes(job.id))save.completed.push(job.id);
 save.cash+=reward;return {job,reward};
}
export function inWater(p,water,margin=0){return p.x>water.minX-margin&&p.x<water.maxX+margin&&p.z>water.minZ-margin&&p.z<water.maxZ+margin;}
export function blocked(p,colliders,radius=.7){return colliders.some(b=>Math.abs(p.x-b.x)<b.w/2+radius&&Math.abs(p.z-b.z)<b.d/2+radius);}
export function makeRoute(start,end,roads=ROADS,boat=false){
 if(boat)return [start,end];
 const nearest=v=>roads.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a,roads[0]);
 const anchor=p=>{const x=nearest(p.x),z=nearest(p.z);return Math.abs(x-p.x)<Math.abs(z-p.z)?{x,z:p.z}:{x:p.x,z};};
 const a=anchor(start),b=anchor(end),an={x:nearest(a.x),z:nearest(a.z)},bn={x:nearest(b.x),z:nearest(b.z)};
 return [start,a,an,{x:bn.x,z:an.z},bn,b,end].filter((p,i,arr)=>i===0||distance(p,arr[i-1])>.5);
}
export function freshSave(){return {version:1,cash:120,completed:[],tapes:[],delivered:0,bestRace:null,upgrade:0,paint:0,hour:17.4,weather:0,position:{x:-18,z:35},settings:{sound:true,quality:'medium',sensitivity:100,touch:'auto',vibration:true}};}
export function validateSave(raw){
 if(!raw||raw.version!==1||!Number.isFinite(raw.cash)||raw.cash<0||raw.cash>10000000)throw Error('不是有效的京城夜行存档。');
 const s=freshSave();s.cash=Math.round(raw.cash);s.completed=[...new Set((raw.completed||[]).filter(id=>JOBS.some(j=>j.id===id)))];s.tapes=[...new Set((raw.tapes||[]).filter(id=>TAPES.some(t=>t.id===id)))];
 for(const [k,max] of [['delivered',100000],['upgrade',3],['paint',4],['weather',2]])if(Number.isInteger(raw[k]))s[k]=clamp(raw[k],0,max);
 if(Number.isFinite(raw.hour))s.hour=clamp(raw.hour,0,24);if(Number.isFinite(raw.bestRace)&&raw.bestRace>0)s.bestRace=raw.bestRace;
 if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.z))s.position={x:clamp(raw.position.x,-475,475),z:clamp(raw.position.z,-475,475)};
 const q=raw.settings||{};for(const k of ['sound','vibration'])if(typeof q[k]==='boolean')s.settings[k]=q[k];if(['low','medium','high'].includes(q.quality))s.settings.quality=q.quality;if(['auto','on','off'].includes(q.touch))s.settings.touch=q.touch;if(Number.isFinite(q.sensitivity))s.settings.sensitivity=clamp(q.sensitivity,30,180);
 return s;
}
