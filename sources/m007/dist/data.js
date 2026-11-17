export const SCENES = {
  warehouse: {name:'仓储物流',english:'WAREHOUSE',desc:'多规格货物 · 分拣与搬运',color:'#bd8654',tag:'09 件可交互货物',title:'仓储物流训练场',subtitle:'从识别到交付，让每一次搬运有迹可循。',robot:[0,3.5],time:140},
  cafe: {name:'咖啡工坊',english:'COFFEE LAB',desc:'四种配方 · 制作与配送',color:'#81916e',tag:'04 种咖啡配方',title:'咖啡制作训练场',subtitle:'把一杯咖啡，拆解成可学习的动作序列。',robot:[1.9,3.8],time:90},
  restaurant: {name:'智慧餐厅',english:'RESTAURANT',desc:'按桌配送 · 多订单协同',color:'#c78972',tag:'03 个服务桌位',title:'餐饮服务训练场',subtitle:'从出餐口到餐桌，训练有序的服务能力。',robot:[0,3.8],time:130}
};
export const PRESETS={warehouse:[['sort','混合货物分拣','依次将三种规格货物送至出库台'],['fragile','易碎品专线','搬运易碎品，训练低速安全交付'],['restock','入库与上架','将收货区货物放入指定货架']],cafe:[['latte','拿铁制作与配送','萃取浓缩 → 加入牛奶 → 送至客桌'],['americano','美式咖啡制作','萃取浓缩 → 加入热水 → 配送'],['cappuccino','卡布奇诺制作','萃取浓缩 → 牛奶 → 绵密奶泡'],['espresso','意式浓缩制作','单份萃取，直接交付']],restaurant:[['service','三桌连续上菜','三个餐品依次送达对应桌位'],['single','指定桌位上菜','选择餐桌，完成单次配送'],['return','餐盘回收','从餐桌取回餐盘并送入回收区']]};
export const COFFEE={latte:'拿铁',americano:'美式',cappuccino:'卡布奇诺',espresso:'意式浓缩'};
export function makePlan(scene,preset,table=2,selected=null){
  const plan=[];
  const nav=(label,x,z,look)=>plan.push({type:'move',label,x,z,look});
  const grab=(id,label)=>plan.push({type:'pick',id,label,duration:id==='cup'?4:1.8});
  const drop=(id,target,label)=>plan.push({type:'place',id,target,label,duration:id==='cup'?4:1.8});
  const process=(kind,label,duration)=>plan.push({type:'process',kind,label,duration});
  if(scene==='warehouse'){
    const ids=selected?[selected]:preset==='fragile'?['w3']:preset==='restock'?['w7']:['w1','w2','w3'];
    const positions={w1:[-4.5,-2.1],w2:[-3,-2.1],w3:[-1.5,-2.1],w4:[1.5,-2.1],w5:[3,-2.1],w6:[4.5,-2.1],w7:[-4.5,1.0],w8:[-3.2,1.0],w9:[-5.4,1.0]};
    ids.forEach((id,i)=>{const p=positions[id]||positions.w1;nav('接近货物 '+id.toUpperCase(),...p,[p[0],p[1]<0?-3.6:2.4]);grab(id,'双臂抓取货物');if(preset==='restock'){nav('导航至 A 区货架',-3,-2.1,[-3,-3.6]);drop(id,'shelf','放置到入库货位');}else{nav('导航至出库工作台',3.8,1.0,[3.8,2.5]);drop(id,'out'+(i%3),'放置到出库台');}});
  }else if(scene==='cafe'){
    nav('前往取杯区',-4.51,-1.76,[-4.51,-2.6]);grab('cup','伸手握住杯柄并抬起');nav('对准咖啡机',-2,-1.25,[-2,-2.6]);process('espresso','萃取意式浓缩',5);
    if(preset==='americano'){nav('前往热水区',0,-1.25,[0,-2.6]);process('water','注入热水',3);}
    if(preset==='latte'||preset==='cappuccino'){nav('前往奶泡工作站',0,-1.25,[0,-2.6]);process('milk','注入蒸汽牛奶',3.5);process(preset==='latte'?'latte':'foam',preset==='latte'?'完成拉花':'加入绵密奶泡',3);}
    const x=[-4,0,4][table-1];nav('配送至 '+table+' 号桌',x,1.19,[x,2.4]);drop('cup','table'+table,'交付'+(COFFEE[preset]||'咖啡'));
  }else{
    const ids=preset==='single'?[table]:[1,2,3];
    if(preset==='return'){const x=[-4,0,4][table-1];nav('前往 '+table+' 号桌',x,.0,[x,1.5]);grab('used'+table,'取回已用餐盘');nav('前往回收工作台',4.5,-1.25,[4.5,-2.8]);drop('used'+table,'recycle','放入餐盘回收区');}
    else ids.forEach((n)=>{const x=[-4,0,4][n-1];nav('前往 '+n+' 号出餐口',[-3,0,3][n-1],-1.25,[[-3,0,3][n-1],-2.8]);grab('dish'+n,'托起'+['香煎牛排','田园沙拉','番茄意面'][n-1]);nav('前往 '+n+' 号桌',x,.0,[x,1.5]);drop('dish'+n,'table'+n,'为 '+n+' 号桌上菜');});
  }
  return plan.map((p,i)=>({...p,key:'step-'+i}));
}
export const ACTION_NAMES={move:'导航',pick:'抓取',place:'放置',process:'加工',wait:'等待'};
export function validatePlan(plan,entities,targets){
  if(!Array.isArray(plan)||!plan.length||plan.length>100)return '请保留 1–100 个动作';
  let held=null;const used=new Set();
  for(const [i,p] of plan.entries()){
    const fail=s=>'第 '+(i+1)+' 步：'+s;
    if(!ACTION_NAMES[p.type])return fail('动作类型无效');
    if(p.type==='move'&&(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>6.5||Math.abs(p.z)>4.5))return fail('导航点超出场地');
    if(p.type==='pick'){if(!entities[p.id])return fail('目标不存在');if(held)return fail('请先放下手中的物品');if(used.has(p.id))return fail('同一物品请勿重复抓取');held=p.id;used.add(p.id);}
    if(p.type==='place'){if(held!==p.id)return fail('放置物品与持有物品不匹配');if(!targets[p.target])return fail('放置区域不存在');held=null;}
    if(p.type==='process'&&!held)return fail('请先抓取容器');
    if(p.id==='cup'&&['pick','place'].includes(p.type)&&p.duration<3)return fail('取放杯动作至少需要 3 秒');
    if(p.type!=='move'&&(!Number.isFinite(p.duration)||p.duration<.1||p.duration>60))return fail('动作时长须在 0.1–60 秒之间');
  }
  if(held)return '请添加放置动作，完成物品交付';
  return null;
}
