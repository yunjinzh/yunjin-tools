/* Spatial gameplay rules. All distances, resources and thresholds are teaching models. */
(function(root){
 'use strict';
 const TYPES=[
 ['river','sail','sail','sail'],['plain','inspect','move','move'],['plain','inspect','signal','observe'],
 ['mountain','move','time','move'],['plain','inspect','time','move'],['plain','place','observe','move'],
 ['plain','place','place','move'],['mountain','work','move','move'],['river','observe','time','move'],
 ['courtyard','signal','place','move'],['fort','inspect','allocate','observe'],['road','inspect','route','move'],
 ['forest','probe','inspect','move'],['fort','inspect','allocate','connect'],['mountain','place','observe','move'],
 ['plain','inspect','allocate','move'],['plain','allocate','observe','move'],['fort','inspect','cut','observe'],
 ['supply','inspect','cut','observe'],['swamp','place','allocate','move'],['fort','work','move','observe'],
 ['fort','observe','gate','gate'],['plain','signal','move','observe'],['fort','signal','move','move'],
 ['fort','work','replace','replace'],['courtyard','signal','connect','observe'],['fort','signal','work','move'],
 ['mountain','work','observe','cut'],['fort','allocate','allocate','observe'],['fort','work','replace','connect'],
 ['courtyard','place','observe','observe'],['fort','allocate','gate','move'],['courtyard','inspect','place','courier'],
 ['courtyard','signal','allocate','observe'],['river','place','connect','connect'],['mountain','inspect','route','evacuate']
 ];
 const KIND_LABEL={sail:'航行',move:'移动行动',route:'规划路线',evacuate:'有序撤离',place:'拖放部署',work:'布置作业',signal:'部署信号',observe:'观察响应',inspect:'调查对象',probe:'范围试探',allocate:'分配资源',connect:'建立连接',cut:'切断连接',gate:'操作出口',replace:'替换支撑',courier:'消息回传',time:'推进回合'};
 const MOVING=new Set(['sail','move','route','evacuate','courier']);
 const PLACING=new Set(['place','work','signal']);
 const STEALTH=new Set([1,6,7,8,10,13,20,21,27,33,36]);
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const pos=n=>({x:(n.x-450)/14,z:(n.y-210)/11});
 const clone=x=>JSON.parse(JSON.stringify(x));
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function mode(id,phase){return TYPES[id-1]?.[phase+1]||'inspect';}
 class StratagemGameplay{
  constructor(callbacks={}){this.callbacks=callbacks;this.paused=false;this.speed=1;this.active=null;this.planned=[];this.order=null;this.failed=false;this.t=0;}
  reset(s,state){
   this.s=s;this.state=state;this.biome=TYPES[s.id-1][0];this.nodes=new Map(state.nodes.map(n=>[n.id,{...n,...pos(n)}]));
   this.player=pos(s.nodes.find(n=>n.id==='own')||s.nodes[0]);this.player.angle=0;this.rear=s.id===36?{x:this.player.x+2,z:this.player.z+2}:null;this.playerTarget=null;
   this.guards=s.nodes.filter(n=>n.team==='enemy'&&n.id!=='own').map(n=>({id:n.id,...pos(n),angle:Math.PI*.75,target:null,watch:85}));
   this.flags={cover:false,shell:false,tracking:false,cut:false,permission:false,firstRing:false,secondRing:false,closedA:false,closedB:false,revealed:false};
   this.metrics={stamina:100,alarm:0,supply:100,resource:10,distance:0,actions:0,time:0,habit:0,pressure:0};
   this.active=null;this.planned=[];this.order=null;this.failed=false;this.paused=false;this.t=0;this.deployments=[];this.shippingLane=null;this.parameter=state.value;this.lastMessage='点击蓝色队伍选中；点击地面设置路点，或点击目标下达行动。';this.snapshots=[];this.lastPhase=state.phase;
   this.callbacks.change?.();
  }
  info(){const kind=mode(this.s.id,this.state.phase);return {kind,label:KIND_LABEL[kind],moving:MOVING.has(kind),placing:PLACING.has(kind),busy:!!this.order,failed:this.failed,paused:this.paused,metrics:{...this.metrics},route:clone(this.planned),message:this.lastMessage};}
  target(key){
   const task=this.s.steps[this.state.phase],choice=task?.options.find(o=>o.key===key);if(!choice)throw new Error('当前阶段没有此行动');
   if(this.s.id===1&&choice.key==='routine')return pos(this.s.nodes.find(n=>n.id===(this.state.phase===0?'dest':'own')));
   if(this.s.id===1&&choice.key==='cargo')return pos(this.s.nodes.find(n=>n.id==='dest'));
   if(this.s.id===32&&this.state.phase===2&&choice.key==='time')return {x:-27,z:13};
   const node=this.nodes.get(choice.node);return {x:node.x,z:node.z};
  }
  select(key){if(this.state.done)return false;if(this.failed){this.message('本局条件已失效，请重新推演。');return false;}if(this.order){this.message('当前行动正在进行，可暂停、单步或取消行动。');return false;}this.target(key);this.active=key;this.message(`${KIND_LABEL[mode(this.s.id,this.state.phase)]}：${this.s.steps[this.state.phase].options.find(o=>o.key===key).label}`);return true;}
  plan(point){if(this.order||this.failed||this.state.done)return false;if(!Number.isFinite(point.x)||!Number.isFinite(point.z))throw new Error('路点无效');if(Math.abs(point.x)>30||Math.abs(point.z)>19){this.message('路点超出沙盘边界。');return false;}if(this.planned.length>=10){this.message('最多设置10个路点，可清空后重画。');return false;}this.planned.push({x:point.x,z:point.z});this.message(`已设置${this.planned.length}个路点。点击行动目标或“执行路线”。`);return true;}
  clearRoute(){this.planned=[];this.callbacks.change?.();}
  connect(from,to){
   if(mode(this.s.id,this.state.phase)!=='connect'||this.order||this.failed||this.state.done){this.message('当前阶段不能建立连接，请先完成前置行动。');return false;}
   const pairs={14:['old','goal'],26:['a','b'],30:['key','host'],35:this.state.phase===1?['a','b']:['b','c']},pair=pairs[this.s.id];
   if(!pair||from!==pair[0]||to!==pair[1]){this.metrics.resource=Math.max(0,this.metrics.resource-1);this.message('连接方向不满足依赖关系。前一个对象必须为后一个对象提供条件。');return false;}
   const key=this.s.steps[this.state.phase].answer;this.select(key);return this.launch(key);
  }
  launchFree(){if(this.order||this.failed||!this.planned.length){this.message('先在地面设置路点，再执行自由移动。');return false;}this.order={key:'__free',kind:'move',target:this.planned.at(-1),route:clone(this.planned),index:0,elapsed:0,snapshot:this.snapshot(),phase:this.state.phase};this.playerTarget=null;this.planned=[];this.metrics.actions++;this.message('队伍自由移动中。位置、精力与警戒会真实改变。');return true;}
  cancel(){this.order=null;this.active=null;this.planned=[];this.message('行动已取消；已经发生的移动与消耗仍保留。');}
  message(text){this.lastMessage=text;this.callbacks.message?.(text);this.callbacks.change?.();}
  setParameter(value){const r=this.s.steps[this.state.phase]?.range;if(!r)throw new Error('当前阶段没有可调参数');if(!Number.isFinite(value)||value<r.min||value>r.max)throw new Error('参数超出边界');if(this.order){this.message('当前行动已锁定分配；行动结束后再调整参数。');return false;}this.callbacks.parameter?.(value);this.updateParameter(value);return true;}
  updateParameter(v){
   const id=this.s.id,phase=this.state.phase;this.parameter=v;
   if(id===4&&phase===1){this.metrics.stamina=90;const g=this.guards.find(x=>x.id==='enemy');if(g){g.x=(730-v*43-450)/14;g.z=(100+v*21-210)/11;g.energy=v<=6?Math.max(20,100-v*12):80;}}
   if(id===9&&phase===1)this.metrics.supply=v>5?80:Math.max(15,100-v*14);
   if(id===11&&phase===1)this.metrics.resource=10-v;
   if(id===16&&phase===1){const g=this.guards.find(x=>x.id==='enemy');if(g)g.target={x:(450+v*2.2-450)/14,z:(210+v*.6-210)/11};}
   if(id===20&&phase===1)for(const g of this.guards)g.watch=100-v*.65;
   if(id===32&&phase===0){const g=this.guards.find(x=>x.id==='enemy');if(g)g.watch=v;}
   this.callbacks.change?.();
  }
  advanceTurn(){if(this.failed||this.state.done)return;const r=this.s.steps[this.state.phase]?.range;if(r&&(mode(this.s.id,this.state.phase)==='time'))this.setParameter(clamp(this.state.value+1,r.min,r.max));this.tick(1.5,true);this.metrics.time++;this.message('局势推进一回合。');}
  toggleCover(){if(![8,21].includes(this.s.id))return;const flag=this.s.id===8?'cover':'shell';this.flags[flag]=!this.flags[flag];if(!this.flags[flag]&&this.order&&this.state.phase>0){this.order=null;this.failed=true;this.metrics.alarm=Math.min(100,this.metrics.alarm+40);this.message('转移期间掩护中断，真实行动暴露。本局条件失效，可撤销阶段或重新推演。');return;}this.message(this.flags[flag]?'掩护外观正在维持。':'掩护停止，对方开始关注真实力量。');}
  launch(key=this.active,point=null){
   if(!key){this.message('先选择行动目标。');return false;}if(this.failed||this.order||this.state.done)return false;
   const task=this.s.steps[this.state.phase];const choice=task.options.find(o=>o.key===key);if(!choice)throw new Error('行动无效');
   const kind=mode(this.s.id,this.state.phase),target=this.target(key),destination=point||target;
   if(PLACING.has(kind)&&dist(destination,target)>4){this.metrics.resource=Math.max(0,this.metrics.resource-1);this.deployments.push({kind,x:destination.x,z:destination.z,valid:false});this.message('部署离作用对象太远，没有形成牵动。已消耗1份资源，可重新布置。');return false;}
   if(this.metrics.stamina<=8&&MOVING.has(kind)){this.failed=true;this.message('剩余精力不足以继续移动，请重新推演或撤销阶段。');return false;}
   if(MOVING.has(kind)&&point&&dist(destination,target)>3){this.message('该行动需要抵达作用目标附近；其他位置可通过自由移动到达。');return false;}
   const route=MOVING.has(kind)?[...this.planned.map(p=>({...p})),{...destination}]:[];
   if(kind==='courier'){const channel=this.nodes.get('spy');if(channel)route.unshift({x:channel.x,z:channel.z});}
   if(this.s.id===1&&this.state.phase>0&&MOVING.has(kind)&&this.shippingLane){
    const [a,b]=this.shippingLane,dx=b.x-a.x,dz=b.z-a.z,len=Math.max(1,Math.hypot(dx,dz));
    if(route.some(p=>Math.abs((p.x-a.x)*dz-(p.z-a.z)*dx)/len>3)){
     this.metrics.alarm=clamp(this.metrics.alarm+40,0,100);this.message('航线外观明显改变，原来积累的习惯掩护失效。清空路线后保持相同航线。');return false;
    }
   }
   if(this.s.id===8&&this.state.phase>0&&key===task.answer&&!this.flags.cover){this.message('公开修路已经停止，隐蔽推进失去掩护。先恢复掩护作业。');return false;}
   if(this.s.id===21&&this.state.phase>0&&key===task.answer&&!this.flags.shell){this.message('阵地外观被撤掉，对方已经注意转移。先维持原阵地表象。');return false;}
   if(this.s.id===35&&this.state.phase===2&&key==='c'&&!this.flags.secondRing){this.message('限路环没有供给控制环所需的条件。');return false;}
   const snapshot=this.snapshot();
   this.active=key;this.order={key,kind,target:destination,route,index:0,elapsed:0,snapshot,phase:this.state.phase,duration:kind==='courier'?3:kind==='probe'?1.5:.9};
   if(MOVING.has(kind))this.playerTarget=null;
   this.planned=[];this.metrics.actions++;this.message(MOVING.has(kind)?'队伍正在按路线行动；红色扇区表示守备可见范围。':`${KIND_LABEL[kind]}正在发生，观察沙盘中的响应。`);return true;
  }
  tick(dt,force=false){
   if((this.paused&&!force)||this.failed)return;dt=Math.min(dt,.12);if(force)dt=1.5;this.t+=dt;
   const active=!!this.order||this.guards.some(g=>g.target)||this.flags.cut;
   if(active){this.metrics.time+=dt;for(const g of this.guards){
    if(g.target){const d=dist(g,g.target),step=6*dt;if(d<=step){g.x=g.target.x;g.z=g.target.z;g.target=null;}else{g.angle=Math.atan2(g.target.x-g.x,g.target.z-g.z);g.x+=(g.target.x-g.x)/d*step;g.z+=(g.target.z-g.z)/d*step;}}
    else g.angle+=dt*.18;
   }}
   if(this.flags.cut)this.metrics.supply=Math.max(0,this.metrics.supply-dt*19);
   if(this.playerTarget&&!this.order){const d=dist(this.player,this.playerTarget),step=5*dt;if(d<=step){Object.assign(this.player,this.playerTarget);this.playerTarget=null;}else{this.player.x+=(this.playerTarget.x-this.player.x)/d*step;this.player.z+=(this.playerTarget.z-this.player.z)/d*step;}}
   if(this.s.id===2&&this.state.phase<2&&this.order)this.metrics.pressure=clamp(this.metrics.pressure+dt*3,0,100);
   if(this.s.id===22&&this.state.phase>=1&&!this.state.done&&this.flags.entered&&!this.flags.closedB){
    const g=this.guards.find(g=>g.id==='enemy');if(g&&!g.target&&!this.flags.departing&&this.t-(this.flags.enteredAt??this.t)>=12){g.target={...this.nodes.get('b')};this.flags.departing=true;}
    if(g&&dist(g,this.nodes.get('b'))<1.2){this.failed=true;this.order=null;this.message('出口乙仍然开放，目标已经离开有限区域。本局围合条件失效。');return;}
   }
   if(this.order){
    const order=this.order;order.elapsed+=dt;
    if(MOVING.has(order.kind)){
     const target=order.route[order.index];if(target){const d=dist(this.player,target),step=8.5*dt,travel=Math.min(d,step);if(d>0){this.player.angle=Math.atan2(target.x-this.player.x,target.z-this.player.z);this.player.x+=(target.x-this.player.x)/d*travel;this.player.z+=(target.z-this.player.z)/d*travel;this.metrics.distance+=travel;this.metrics.stamina=Math.max(0,this.metrics.stamina-travel*.23);}if(d<=step+.05)order.index++;}
     const protectedMove=(this.s.id===1&&this.state.phase<2)||(this.s.id===8&&this.flags.cover)||(this.s.id===21&&this.flags.shell)||(this.s.id===6&&this.state.phase===2);
     if(STEALTH.has(this.s.id)&&!protectedMove){for(const g of this.guards){const d=dist(g,this.player),dx=this.player.x-g.x,dz=this.player.z-g.z,angle=Math.atan2(dx,dz),difference=Math.atan2(Math.sin(angle-g.angle),Math.cos(angle-g.angle));if(d<7&&Math.abs(difference)<.65)this.metrics.alarm=clamp(this.metrics.alarm+dt*21*(g.watch/85),0,100);}}
     if(this.metrics.alarm>=100){this.failed=true;this.order=null;this.message('真实行动持续暴露在守备视野中，警戒达到100。本局掩护失效，可重新布置路线。');return;}
     if(this.rear&&order.kind!=='evacuate'){const d=dist(this.rear,this.player);if(d>3){this.rear.x+=(this.player.x-this.rear.x)/d*Math.min(d-3,7*dt);this.rear.z+=(this.player.z-this.rear.z)/d*Math.min(d-3,7*dt);}}
     if(order.index>=order.route.length){if(order.kind==='evacuate'&&this.rear){const d=dist(this.rear,order.target),step=7.5*dt;if(d<=step+1){Object.assign(this.rear,order.target);this.finish();}else{this.rear.x+=(order.target.x-this.rear.x)/d*step;this.rear.z+=(order.target.z-this.rear.z)/d*step;}}else this.finish();}
    }else{
     let ready=order.elapsed>=order.duration;
     if(this.s.id===6&&this.state.phase===1&&order.key==='observe')ready=ready&&this.guardArrived('enemy');
     if(this.s.id===15&&this.state.phase===1&&order.key==='leave')ready=ready&&this.guardArrived('enemy');
     if(this.s.id===19&&this.state.phase===2&&order.key==='effect')ready=ready&&this.metrics.supply<=35;
     if(this.s.id===22&&this.state.phase===0&&order.key==='enter'){
      if(!this.flags.entering){this.setGuardTarget('enemy','zone');this.flags.entering=true;}ready=ready&&this.guardArrived('enemy');
     }
     if(this.s.id===28&&this.state.phase===1&&order.key==='enter'){if(!this.flags.climbing){this.setGuardTarget('enemy','roof');this.flags.climbing=true;}ready=ready&&this.guardArrived('enemy');}
     if(ready)this.finish();
    }
   }
   if(this.metrics.pressure>=100){this.failed=true;this.order=null;this.message('围攻压力过高，友方通道已失去救援窗口。重新安排后方行动。');}
   this.callbacks.frame?.();
  }
  guardArrived(id){return !this.guards.find(g=>g.id===id)?.target;}
  setGuardTarget(id,nodeId){const g=this.guards.find(g=>g.id===id),n=this.nodes.get(nodeId);if(g&&n)g.target={x:n.x,z:n.z};}
  finish(){
   const order=this.order;if(!order)return;this.order=null;
   if(order.key==='__free'){this.message('自由移动完成。可以从新位置安排下一次行动。');this.callbacks.change?.();return;}
   const previousPhase=this.state.phase,previousKind=order.kind,previousHistory=this.state.history.length;
   const accepted=this.callbacks.resolve?.(order.key)!==false;
   if(!accepted){if(this.state.history.length>previousHistory)this.snapshots.push(order.snapshot);this.metrics.stamina=Math.max(0,this.metrics.stamina-4);this.metrics.alarm=clamp(this.metrics.alarm+9,0,100);this.active=null;this.message(this.state.feedback);return;}
   this.snapshots.push(order.snapshot);
   const id=this.s.id,p=previousPhase;
   if(PLACING.has(previousKind))this.deployments.push({kind:previousKind,...order.target,valid:true});
   if(id===1&&p<2){this.metrics.habit++;this.metrics.alarm=Math.max(0,this.metrics.alarm-20);if(p===0)this.shippingLane=[{...order.snapshot.player},{...this.player}];}
   if(id===2&&p===1){this.setGuardTarget('enemy','rear');this.metrics.pressure=0;}
   if(id===3&&p===1)this.setGuardTarget('enemy','third');
   if(id===14&&p===1)this.metrics.resource=Math.max(0,this.metrics.resource-3);
   if(id===6&&p===0){this.setGuardTarget('enemy','east');this.flags.decoy=true;}
   if(id===7&&p<2){this.metrics.habit++;for(const g of this.guards)g.watch-=24;}
   if(id===8&&p===0)this.flags.cover=true;
   if(id===13&&p===0){this.flags.revealed=true;this.metrics.alarm+=18;}
   if(id===15&&p===0)this.setGuardTarget('enemy','low');
   if(id===17&&p===1)this.setGuardTarget('enemy','spot');
   if(id===16&&p===0)this.flags.tracking=true;
   if(id===18&&p===1){this.flags.commandCut=true;for(const g of this.guards)g.watch=0;}
   if(id===19&&p===1)this.flags.cut=true;
   if(id===21&&p===0)this.flags.shell=true;
   if(id===22&&p===0){this.flags.entered=true;this.flags.enteredAt=this.t;}
   if(id===22&&p===1)this.flags.closedA=true;
   if(id===22&&p===2)this.flags.closedB=true;
   if(id===24&&p===0)this.flags.permission=true;
   if(id===25&&p>0)this.flags['support'+p]=true;
   if(id===28&&p===2)this.flags.ladderRemoved=true;
   if(id===31&&p===0)this.setGuardTarget('enemy','music');
   if(id===33&&p===1)this.flags.informationPlaced=true;
   if(id===35&&p===0){this.flags.firstRing=true;this.setGuardTarget('enemy','a');}
   if(id===35&&p===1)this.flags.secondRing=true;
   if([11,17,29,34].includes(id)&&previousKind==='allocate')this.metrics.resource=Math.max(0,10-(order.snapshot.parameter??this.parameter??0));
   if(this.state.done)this.message(`推演完成：保留精力${Math.round(this.metrics.stamina)}，警戒${Math.round(this.metrics.alarm)}，行动${this.metrics.actions}次。`);
   else this.message(`${this.state.feedback} 接下来：${this.s.steps[this.state.phase].hint}`);
   this.active=null;this.callbacks.change?.();
  }
  sync(state){
   const old=this.state;this.state=state;for(const n of state.nodes){const point={...n,...pos(n)};this.nodes.set(n.id,point);const before=old.nodes.find(x=>x.id===n.id);if(n.id==='own'){if(before&&(before.x!==n.x||before.y!==n.y)&&!MOVING.has(mode(this.s.id,old.phase)))this.playerTarget={x:point.x,z:point.z};continue;}let g=this.guards.find(g=>g.id===n.id);if(n.team==='enemy'&&!g){g={id:n.id,x:point.x,z:point.z,angle:Math.PI*.75,target:null,watch:85};this.guards.push(g);}if(g&&n.team==='own')g.watch=0;if(before&&(before.x!==n.x||before.y!==n.y)&&g)g.target={x:point.x,z:point.z};}
   this.parameter=state.value;
  }
  snapshot(){return {t:this.t,player:clone(this.player),rear:clone(this.rear),guards:clone(this.guards),flags:clone(this.flags),metrics:clone(this.metrics),deployments:clone(this.deployments),shippingLane:clone(this.shippingLane||null),parameter:this.parameter};}
  restore(snapshot,state){this.state=state;this.t=snapshot.t??0;this.nodes=new Map(state.nodes.map(n=>[n.id,{...n,...pos(n)}]));this.player=clone(snapshot.player);this.rear=clone(snapshot.rear);this.playerTarget=null;this.guards=clone(snapshot.guards);this.flags=clone(snapshot.flags);this.metrics=clone(snapshot.metrics);this.deployments=clone(snapshot.deployments);this.shippingLane=clone(snapshot.shippingLane);this.parameter=state.value;this.order=null;this.failed=false;this.active=null;this.planned=[];this.message('已恢复到上一阶段的真实位置、资源与警戒状态。');}
 }
 root.StratagemGameplay=StratagemGameplay;root.StratagemGameTypes={TYPES,KIND_LABEL,MOVING,PLACING,pos,dist};
 if(typeof module!=='undefined')module.exports={StratagemGameplay,TYPES,KIND_LABEL,pos,dist};
})(typeof window!=='undefined'?window:globalThis);
