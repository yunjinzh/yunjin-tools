(function(){
 'use strict';
 const $=id=>document.getElementById(id), E=window.StratagemEngine, CN=['一','二','三','四','五','六'];
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let selected=1, scenario=STRATAGEMS[0], state=E.start(scenario), opponent=false, game=null, world=null;
 const initialId=Number(location.hash.slice(1));if(Number.isInteger(initialId)&&initialId>=1&&initialId<=36){selected=initialId;scenario=STRATAGEMS[selected-1];state=E.start(scenario);}
 function choose(id,updateHash=true){if(!Number.isInteger(id)||id<1||id>36)throw new Error('计策编号应为1–36');selected=id;scenario=STRATAGEMS[id-1];state=E.start(scenario);opponent=false;if(game){game.reset(scenario,state);world?.load(scenario,state);}if(updateHash)history.replaceState(null,'','#'+id);renderAll();}
 function commit(key){const previous=state.phase,result=E.act(scenario,state,key);state=result.state;game?.sync(state);if(selected===35&&!result.accepted&&state.phase!==previous){game.flags.secondRing=false;if(state.phase===0)game.flags.firstRing=false;}renderSimulation();return result.accepted;}
 function act(key,point=null){
  if(!world)return commit(key);
  if(!game.select(key))return read();
  const info=game.info();
  if(info.placing&&!point){game.message('在三维场景中点击或拖放部署位置；靠近相关目标才能产生作用。');$('board').classList.add('deployment-mode');world.canvas.focus({preventScroll:true});updateHUD();return read();}
  if(info.kind==='connect'&&!point&&key===scenario.steps[state.phase].answer){game.message('从前一个对象拖到后一个对象建立连接；也可使用“确认连接”执行当前连接。');world.canvas.focus({preventScroll:true});updateHUD();return read();}
  $('board').classList.remove('deployment-mode');game.launch(key,point);updateHUD();return read();
 }
 function reset(){state=E.start(scenario);if(game){game.reset(scenario,state);world?.load(scenario,state);}renderSimulation();return read();}
 function read(){return {id:selected,name:scenario.name,phase:state.phase,completed:state.done,parameter:state.value,feedback:state.feedback,actions:state.done?[]:scenario.steps[state.phase].options.map(x=>({key:x.key,label:x.label})),gameplay:game?{...game.info(),position:{x:game.player.x,z:game.player.z},flags:{...game.flags}}:null,nodes:state.nodes.map(x=>({id:x.id,label:x.label,team:x.team}))};}
 function initializeGame(){
  try{
   game=new window.StratagemGameplay({resolve:commit,parameter:value=>{state=E.parameter(scenario,state,value);game.sync(state);const slider=$('parameterSlider');if(slider)slider.value=String(value);const output=$('parameterOutput');if(output)output.innerHTML=`${value}<small>${esc(scenario.steps[state.phase].range.unit)}</small>`;},change:()=>{if(world){world.update(state);updateHUD();}},message:text=>{if($('worldInstruction'))$('worldInstruction').textContent=text;}});
   game.reset(scenario,state);
   world=new window.StratagemThreeScene($('board'),game,{
    node:id=>{if(state.done||game.order)return;const choice=scenario.steps[state.phase].options.find(o=>o.node===id);if(choice){game.select(choice.key);game.launch(choice.key);$('board').classList.remove('deployment-mode');}else if(game.info().moving){const node=game.nodes.get(id);if(node)game.plan(node);}else game.message(game.nodes.get(id)?.label||'选择当前阶段的作用对象。');updateHUD();},
    selection:enabled=>{game.message(enabled?'队伍已选中。点击地面设置路点，点击目标执行当前行动。':'已取消队伍选择，拖动空白处可旋转镜头。');updateHUD();},
    route:point=>{game.plan(point);world.drawPlan();updateHUD();},
    drag:(point,id)=>{const choice=scenario.steps[state.phase]?.options.find(o=>o.node===id);if(choice){game.select(choice.key);game.launch(choice.key,game.target(choice.key));}else{game.plan(point);game.launchFree();}updateHUD();},
    place:point=>{if(game.active)game.launch(game.active,point);$('board').classList.remove('deployment-mode');updateHUD();},
    connect:(from,to)=>{game.connect(from,to);updateHUD();},
    frame:updateHUD,pause:updateHUD,error:text=>game.message(text)
   });
   world.load(scenario,state);$('worldHud').hidden=false;
   $('routeMode').addEventListener('click',()=>{world.navigation=!world.navigation;game.message(world.navigation?'队伍已选中：点击地面设置路点，或拖动蓝色队伍。':'镜头模式：拖动空白处旋转，滚轮缩放。');updateHUD();});
   $('executeRoute').addEventListener('click',()=>{if(game.active)game.launch(game.active);else game.launchFree();updateHUD();});
   $('clearRoute').addEventListener('click',()=>{game.clearRoute();world.drawPlan();updateHUD();});
   $('cancelOrder').addEventListener('click',()=>{game.cancel();updateHUD();});$('retryWorld').addEventListener('click',reset);
   $('pauseGame').addEventListener('click',()=>{game.paused=!game.paused;updateHUD();});
   $('stepGame').addEventListener('click',()=>{game.paused=true;game.advanceTurn();updateHUD();});
   $('speedGame').addEventListener('click',()=>{game.speed=game.speed===1?2:game.speed===2?.5:1;updateHUD();});
   $('topView').addEventListener('click',()=>world.topView());$('homeView').addEventListener('click',()=>world.resetCamera());
   $('fullScreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('arenaFull').requestFullscreen();}catch{game.message('当前浏览器不支持全屏，可使用缩放与俯视镜头。');}});
   $('coverToggle').addEventListener('click',()=>{game.toggleCover();updateHUD();});
   for(const [id,delta]of [['lessResource',-1],['moreResource',1]])$(id).addEventListener('click',()=>adjustResource(delta));
  }catch(error){world?.dispose();world=null;game=null;$('worldHud').hidden=true;$('board').classList.remove('is-3d');state.feedback='此设备未能启动三维画面，已切换至平面推演。';console.warn('3D scene unavailable:',error.message);}
 }
 function adjustResource(delta){const r=scenario.steps[state.phase]?.range;if(!r||game.order||game.failed)return;game.setParameter(Math.max(r.min,Math.min(r.max,state.value+delta*(r.max>10?10:1))));renderSimulation();}
 function updateHUD(){
  if(!world||!game)return;const info=game.info(),task=scenario.steps[state.phase];$('board').classList.toggle('route-mode',world.navigation);
  $('staminaMeter').textContent=Math.round(game.metrics.stamina);$('alarmMeter').textContent=Math.round(game.metrics.alarm);$('actionMeter')?.remove();
  $('specialMetric').innerHTML=selected===19?`前沿供给 <b>${Math.round(game.metrics.supply)}</b>`:selected===1?`日常航行 <b>${game.metrics.habit}</b>`:selected===2?`围攻压力 <b>${Math.round(game.metrics.pressure)}</b>`:selected===22&&game.flags.entered&&!state.done?`出逃窗口 <b>${Math.max(0,Math.ceil(12-(game.t-(game.flags.enteredAt||0))))}秒</b>`:`行动 <b>${game.metrics.actions}</b>`;
  $('worldBiome').textContent=({river:'河谷渡口',mountain:'山地关隘',plain:'营地与通道',fort:'城池与阵地',forest:'林间侦察',supply:'补给与前沿',road:'主路与近旁资源',swamp:'水泽与迷雾',courtyard:'会谈与情报'})[game.biome];
  if($('worldInstruction').textContent!==game.lastMessage)$('worldInstruction').textContent=game.lastMessage;$('gameMode').textContent=info.failed?'本局条件失效':info.busy?`${info.label}进行中`:state.done?'此局完成':info.label;
  $('pauseGame').textContent=game.paused?'继续':'暂停';$('speedGame').textContent=`×${game.speed}`;$('routeMode').classList.toggle('active',world.navigation);$('routeMode').textContent=world.navigation?'队伍已选中':'选中队伍';
  $('executeRoute').textContent=info.kind==='connect'?'确认连接':info.placing?'确认部署':info.moving?'执行路线':'执行行动';$('executeRoute').disabled=info.busy||info.failed||state.done;$('clearRoute').disabled=!game.planned.length;$('cancelOrder').disabled=!info.busy;$('coverToggle').hidden=![8,21].includes(selected)||state.phase===0||state.done;$('coverToggle').textContent=(selected===8?game.flags.cover:game.flags.shell)?'停止掩护':'恢复掩护';
  for(const id of ['actions','worldActions'])$(id).querySelectorAll('button').forEach(b=>{b.disabled=info.busy||info.failed;b.classList.toggle('selected',b.dataset.key===game.active);});$('resourceTokens').querySelectorAll('button').forEach(b=>b.disabled=info.busy||info.failed);const slider=$('parameterSlider');if(slider)slider.disabled=info.busy||info.failed;for(const id of ['lessResource','moreResource'])$(id).disabled=info.busy||info.failed;
  const tokens=task?.range&&info.kind==='allocate';$('tokenTray').hidden=!tokens;
  if(tokens){$('tokenTitle').textContent=task.range.label;$('resourceCount').textContent=`${state.value}${task.range.unit}`;$('tokenHint').textContent=selected===11?'拖到核心增加，拖到外围减少':'拖到作用对象增加分配，或使用加减按钮';
   const signature=`${selected}:${state.phase}:${state.value}`;if($('resourceTokens').dataset.signature!==signature){$('resourceTokens').dataset.signature=signature;$('resourceTokens').innerHTML=Array.from({length:Math.min(10,task.range.max)},(_,i)=>`<button class="resource-token ${i<Math.round(state.value/task.range.max*Math.min(10,task.range.max))?'allocated':''}" aria-label="分配第${i+1}枚筹码" data-token="${i}">${i+1}</button>`).join('');$('resourceTokens').querySelectorAll('button').forEach(button=>{
    button.disabled=info.busy||info.failed;button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);button.classList.add('dragging');});
    button.addEventListener('pointerup',e=>{button.classList.remove('dragging');const point=world.point(e);if(!point)return;const core=game.nodes.get(selected===11?'core':task.options.find(o=>o.key===task.answer)?.node);if(!core)return;const delta=selected===11&&world.pick(e)==='outer'?-1:rootDistance(point,core)<7?1:0;if(delta)adjustResource(delta);else game.message('将筹码拖到沙盘中的作用对象上。');});
    button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();adjustResource(1);}});
   });}
  }
 }
 function rootDistance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
 function renderAll(){
  const g=GROUPS[scenario.group];
  $('groupNav').innerHTML=GROUPS.map((x,i)=>`<button class="group-button ${i===scenario.group?'active':''}" data-group="${i}" aria-pressed="${i===scenario.group}" title="${x.name}">${x.short}</button>`).join('');
  $('groupNav').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.group)*6+1)));
  $('volumeName').textContent=`第${CN[scenario.group]}卷 · ${g.name}`;$('volumeTheme').textContent=g.theme;$('volumeDesc').textContent=g.desc;
  $('stratagemNav').innerHTML=STRATAGEMS.filter(x=>x.group===scenario.group).map(x=>`<button class="strategy-item ${x.id===selected?'active':''}" data-id="${x.id}" ${x.id===selected?'aria-current="page"':''}><span>${String(x.id).padStart(2,'0')}</span><span>${x.name}</span>${x.id===selected?'<span class="item-dot"></span>':''}</button>`).join('');
  $('stratagemNav').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.id))));
  $('groupLabel').textContent=`卷${CN[scenario.group]} · ${g.name}`;$('strategyNumber').textContent=`第${String(selected).padStart(2,'0')}计`;
  $('strategyName').textContent=scenario.name;$('tagline').textContent=scenario.tag;$('pageCount').textContent=`${String(selected).padStart(2,'0')} / 36`;
  $('readingNumber').textContent=String(selected).padStart(2,'0');$('readingTitle').textContent=scenario.tag;$('core').textContent=scenario.core;$('setting').textContent=scenario.setting;$('missionGoal').textContent=scenario.goal;$('logic').textContent=scenario.lesson.replaceAll('=>','→');$('limit').textContent=scenario.limit;
  $('previous').disabled=selected===1;$('next').disabled=selected===36;
  document.title=`${scenario.name} · 三十六计智谋沙盘`;
  renderSimulation();renderIndex();
  if(window.matchMedia('(max-width:760px)').matches){const active=$('stratagemNav').querySelector('.active');if(active)$('stratagemNav').scrollLeft=Math.max(0,active.offsetLeft-$('stratagemNav').offsetLeft-30);}
 }
 function parameterPreview(){
  const nodes=state.nodes.map(x=>({...x})),r=scenario.steps[state.phase]?.range,v=state.value;let text='';
  const set=(id,patch)=>{const item=nodes.find(n=>n.id===id);if(item)Object.assign(item,patch);};
  if(r){
   switch(selected){
    case 4:set('enemy',{x:730-v*43,y:100+v*21,label:`推进${v}回合`});text=`模拟精力：我方保持90，对方 ${v<=6?Math.max(20,100-v*12):80}。${v>6?'对方已获得休整机会。':'推进使对方消耗。'}`;break;
    case 5:set('gate',{label:v<3?'空缺未确认':v<=6?'危机窗口开放':'守备已恢复'});text=`模拟进程：${v<3?'危机已发生，通道空缺尚未确认。':v<=6?'调度失序持续，存在短暂窗口。':'守备已恢复，原窗口关闭。'}`;break;
    case 9:set('a',{label:`甲方精力 ${Math.max(15,100-v*14)}`});set('b',{label:`乙方精力 ${Math.max(20,100-v*13)}`});text=v>5?'双方开始休整，观察获得的条件已经变化。':'模拟进程：我方保留力量，甲乙正在相互消耗。';break;
    case 11:set('core',{label:`核心保护 ${v}份`});set('outer',{label:`外围保护 ${10-v}份`});text=`总资源10份：核心${v}份，外围${10-v}份。比较核心保存与局部代价。`;break;
    case 12:set('small',{label:`偏移 ${v}格`});text=`模拟额外成本：${v}格偏移。${v>2?'主任务将明显延误。':v===0?'还没有取得近旁资源。':'偏移保持在顺路范围。'}`;break;
    case 16:set('exit',{label:`包围开口 ${v}%`});set('enemy',{x:450+v*2.2,y:210+v*.6,label:v<35?'仍高度警戒':v>60?'已脱离控制':'分散移动 · 可追踪'});text=v<35?'压力仍然较高，组织与戒备保持紧密。':v>60?'开口过大，目标将脱离可控与追踪范围。':'压力降低，目标开始分散移动；外围观察仍在。';break;
    case 17:set('bait',{label:`诱因 ${v}份`});text=v<2?'诱因不足以牵动目标。':v>4?'投入已超出小额诱因的设定边界。':'小额诱因足以引起重要目标响应。';break;
    case 20:set('enemy',{label:`辨识混乱 ${v}%`});text=v<50?'对方仍能清楚辨识局势。':v>75?'混乱过高，己方也难以维持行动条件。':'对方辨识受扰，己方仍保有目标定位。';break;
    case 29:set('show',{label:`展示 ${v}层`});text=`模拟展示：真实资源未变，可见布局${v}层。${v>6?'拥挤布局暴露重复。':v<4?'可见声势仍有限。':'布局放大声势。'}`;break;
    case 32:set('doubt',{label:`对方疑虑 ${v}%`});text=v<50?'前提不足：对方没有足够疑虑，反常镇定不能保证使其迟疑。':'前提成立：对方已有疑虑，反常表象会进入其风险判断。';break;
    case 34:set('cost',{label:`真实代价 ${v}枚`});text=v<3?'可见代价不足以形成可信信号。':v>5?'代价超过可承受边界。':'损失是真实的，对方将其纳入可信判断。';break;
   }
  }
  return {nodes,text};
 }
 function renderSimulation(){
  $('viewToggle').setAttribute('aria-pressed',String(opponent));$('viewToggle').textContent=opponent?'回到全局所见':'查看对方所见';
  $('perspective').hidden=!opponent;$('perspective').innerHTML=`<strong>对方所见</strong>${esc(scenario.views[Math.min(state.phase,scenario.views.length-1)])}`;
  $('stepsBar').innerHTML=scenario.steps.map((x,i)=>`<div class="stage-step ${i<state.phase?'finished':i===state.phase?'current':''}" ${i===state.phase?'aria-current="step"':''}><span>${i<state.phase?'✓':i+1}</span><span>${esc(x.title)}</span></div>`).join('');
  $('undo').disabled=!state.history.length;
  const task=scenario.steps[state.phase];
  $('stageLabel').textContent=state.done?'三阶段推演结束':`第 ${state.phase+1} / ${scenario.steps.length} 阶段`;
  $('taskTitle').textContent=state.done?'此局已完成':task.title;
  $('taskHint').textContent=state.done?'查看行动代价与因果复盘；撤销后可重新比较路线与部署。':task.hint+(world?' 可直接点击三维对象，或使用下方行动指令。':'');
  const sorted=state.done?[]:[...task.options].sort((a,b)=>{const hash=k=>[...k].reduce((v,c)=>(v*31+c.charCodeAt(0))%997,selected*17+state.phase*47);return hash(a.key)-hash(b.key);});
  $('actions').innerHTML=sorted.map(x=>`<button class="action-button" data-key="${esc(x.key)}">${esc(x.label)}</button>`).join('');
  $('actions').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>act(b.dataset.key)));
  $('worldStage').hidden=state.done;$('worldTask').textContent=state.done?'此局完成':`0${state.phase+1} · ${task.title}`;$('worldActions').innerHTML=sorted.map(x=>`<button data-key="${esc(x.key)}">${esc(x.label)}</button>`).join('');$('worldActions').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>act(b.dataset.key)));
  $('parameter').hidden=state.done||!task.range;
  if(task?.range){const r=task.range;$('parameter').innerHTML=`<div class="parameter-head"><label for="parameterSlider">${esc(r.label)}</label><output id="parameterOutput" for="parameterSlider">${state.value}<small>${esc(r.unit)}</small></output></div><input type="range" id="parameterSlider" min="${r.min}" max="${r.max}" step="1" value="${state.value}"><div class="parameter-endpoints"><span>${r.min}${esc(r.unit)}</span><span>拖动以比较局势</span><span>${r.max}${esc(r.unit)}</span></div><p class="parameter-live" id="parameterLive"></p>`;
   $('parameterSlider').addEventListener('input',event=>{if(game)game.setParameter(Number(event.target.value));else state=E.parameter(scenario,state,Number(event.target.value));$('parameterOutput').innerHTML=`${state.value}<small>${esc(r.unit)}</small>`;renderBoard();});
  }
  $('feedback').className=`feedback ${state.tone}`;$('feedback').innerHTML=`<span class="feedback-icon" aria-hidden="true">${state.tone==='warning'?'!':state.tone==='success'||state.tone==='complete'?'✓':'◎'}</span><span>${esc(state.feedback)}</span>`;
  $('replay').hidden=!state.done;
  if(state.done){$('replayLesson').textContent=scenario.lesson.replaceAll('=>','→');if(game)$('gameResults').innerHTML=`<span>保留精力<strong>${Math.round(game.metrics.stamina)}</strong></span><span>警戒程度<strong>${Math.round(game.metrics.alarm)}</strong></span><span>行动次数<strong>${game.metrics.actions}</strong></span><span>行进距离<strong>${Math.round(game.metrics.distance)}</strong></span>`;$('replayLog').innerHTML=state.log.map((x,i)=>`<li><span>0${i+1}</span><div><strong>${esc(x.choice)}${x.value!==null?` · ${x.value}${esc(x.unit)}`:''}</strong><small>${esc(x.result)}</small></div></li>`).join('');$('continue').textContent=selected===36?'回到第一计':'体验下一计';}
  renderBoard();
 }
 function renderBoard(){
  if($('parameterLive'))$('parameterLive').textContent=parameterPreview().text;
  if(world){world.update(state);updateHUD();return;}
  const preview=parameterPreview(),nodes=preview.nodes,task=scenario.steps[state.phase],previous=state.history.at(-1)?.nodes||state.nodes;
  if($('parameterLive'))$('parameterLive').textContent=preview.text;
  const displayNodes=nodes.map(x=>({...x}));
  // Keep resource tokens readable when a moving unit arrives at an occupied position.
  for(let i=0;i<displayNodes.length;i++)for(let j=i+1;j<displayNodes.length;j++){const a=displayNodes[i],b=displayNodes[j];if(Math.hypot(a.x-b.x,a.y-b.y)<78){if(a.id==='own'){a.x=Math.max(85,a.x-65);a.y=Math.max(65,a.y-55);}else{b.x=Math.min(825,b.x+65);b.y=Math.min(335,b.y+45);}}}
  const priorPositions=new Map([...$('nodes').children].map(el=>[el.dataset.node,{left:el.style.left,top:el.style.top}]));
  $('nodes').innerHTML=displayNodes.map(x=>{
   const choice=task?.options.find(o=>o.node===x.id),actionable=!!choice&&!state.done;
   const glyph=x.team==='own'?'我':x.team==='enemy'?'彼':x.id==='doubt'?'疑':x.id==='gate'?'门':x.id==='supply'?'源':x.id==='king'?'令':x.id==='hidden'?'隐':x.id==='shell'?'壳':'位';
   const style=`left:${x.x/9}%;top:${x.y/4.2}%`;
   return `<${actionable?'button':'div'} class="map-node ${x.team} ${actionable?'actionable':''}" data-node="${x.id}" ${actionable?`data-key="${esc(choice.key)}" aria-label="${esc(choice.label)}，${esc(x.label)}"`:''} style="${style}" title="${esc(actionable?choice.label:x.label)}"><span class="node-token" aria-hidden="true">${glyph}</span><span class="node-label">${esc(x.label)}</span></${actionable?'button':'div'}>`;
  }).join('');
  $('nodes').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>act(b.dataset.key)));
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){for(const node of $('nodes').children){const old=priorPositions.get(node.dataset.node);if(old&&(old.left!==node.style.left||old.top!==node.style.top)){const target={left:node.style.left,top:node.style.top};node.style.left=old.left;node.style.top=old.top;requestAnimationFrame(()=>{node.style.left=target.left;node.style.top=target.top;});}}}
  const defs=`<defs><marker id="arrow-own" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="#314e57"/></marker><marker id="arrow-enemy" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="#a83d2e"/></marker><marker id="arrow-decoy" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="#b79759"/></marker></defs>`;
  $('connections').innerHTML=defs+state.paths.map((p,i)=>{
   let from=nodes.find(x=>x.id===p.from),to=nodes.find(x=>x.id===p.to);if(!from||!to)return '';
   const old=previous.find(x=>x.id===p.from);
   if(old&&(old.x!==from.x||old.y!==from.y))from=old;
   const dx=to.x-from.x,dy=to.y-from.y,len=Math.max(1,Math.hypot(dx,dy));const x1=from.x+dx/len*29,y1=from.y+dy/len*29,x2=to.x-dx/len*29,y2=to.y-dy/len*29;
   const bend=i%2===0?-24:24,cx=(x1+x2)/2-dy/len*bend,cy=(y1+y2)/2+dx/len*bend;
   const marker=p.kind==='cut'?'':`marker-end="url(#arrow-${p.kind==='enemy'?'enemy':p.kind==='decoy'?'decoy':'own'})"`;
   return `<path class="route ${p.kind} ${p.kind==='own'?'flow':''}" d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" ${marker}/><text class="path-label" x="${cx}" y="${cy-10}" text-anchor="middle">${esc(p.label)}</text>`;
  }).join('');
  $('board').style.setProperty('--noise',selected===20&&task?.range?state.value/100:0);
 }
 function renderIndex(){
  $('indexGrid').innerHTML=GROUPS.map((g,i)=>`<section class="index-volume"><h3>${g.name}<small>卷${CN[i]} · ${g.theme}</small></h3>${STRATAGEMS.filter(x=>x.group===i).map(s=>`<button data-id="${s.id}" class="${selected===s.id?'active':''}"><span>${String(s.id).padStart(2,'0')}</span>${s.name}${selected===s.id?'<i>当前</i>':''}</button>`).join('')}</section>`).join('');
  $('indexGrid').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{choose(Number(b.dataset.id));$('indexDialog').close();}));
 }
 $('sourcesContent').innerHTML=`<p>本页按通行的六套、36计顺序组织。计名与目录依据出版机构及官方节目页面核验，释义为现代教学提炼。交互场景、参数阈值、坐标和模拟结果为本页原创设定，不是历史统计，也不构成成功率预测。</p><p>《三十六计》与《孙子兵法》是不同文本。异写说明：暗度 / 暗渡陈仓、浑水 / 混水摸鱼、假道 / 假途伐虢、假痴不癫 / 假痴不颠、走为上计 / 走为上。</p>${SOURCES.map(x=>`<article class="source-card"><small>${x.year}年 · ${esc(x.institution)}</small><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a><p>${esc(x.note)}</p></article>`).join('')}<div class="fact-gap"><strong>[!!! 事实断层：资料不足，无法确认]</strong><br>《三十六计》的唯一作者与确切成书年份，当前所核资料不足以确认。本页不据此安排年代或署名。</div>`;
 $('previous').addEventListener('click',()=>{if(selected>1)choose(selected-1);});$('next').addEventListener('click',()=>{if(selected<36)choose(selected+1);});
 $('continue').addEventListener('click',()=>{choose(selected===36?1:selected+1);$('main').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});});
 $('reset').addEventListener('click',reset);$('undo').addEventListener('click',()=>{if(!state.history.length)return;state=E.undo(state);if(game){const snapshot=game.snapshots.pop();if(snapshot)game.restore(snapshot,state);else game.reset(scenario,state);world?.load(scenario,state);}renderSimulation();});
 $('viewToggle').addEventListener('click',()=>{opponent=!opponent;renderSimulation();});
 $('openIndex').addEventListener('click',()=>$('indexDialog').showModal());$('openSources').addEventListener('click',()=>$('sourcesDialog').showModal());
 document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',event=>{const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}));
 window.addEventListener('hashchange',()=>{const id=Number(location.hash.slice(1));if(Number.isInteger(id)&&id>=1&&id<=36&&id!==selected)choose(id,false);});
 window.addEventListener('keydown',event=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||document.querySelector('dialog[open]'))return;if(event.key==='ArrowLeft'&&selected>1){event.preventDefault();choose(selected-1);}if(event.key==='ArrowRight'&&selected<36){event.preventDefault();choose(selected+1);}});
 initializeGame();
 renderAll();
 // Feature-detected agent access shares exactly the same visible actions and state.
 const context=document.modelContext;if(context?.registerTool){
  const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const tools=[
   {name:'read_stratagem_state',title:'读取计策推演',description:'Read the current strategy, stage, available actions and teaching result.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>read()},
   {name:'start_stratagem',title:'开始指定计策',description:'Open strategy 1–36 and reset its visible teaching simulation.',inputSchema:{type:'object',properties:{id:{type:'integer',minimum:1,maximum:36}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>k!=='id'))throw new Error('无效输入');choose(input.id);return read();}},
   {name:'start_stratagem_action',title:'开始三维行动',description:'Start an available action in the current stage. Movement and NPC response occur over time; read state afterward to check completion. Placement defaults to the selected target. Optionally set its range parameter.',inputSchema:{type:'object',properties:{key:{type:'string'},value:{type:'number'}},required:['key'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input!=='object'||typeof input.key!=='string'||Object.keys(input).some(k=>!['key','value'].includes(k)))throw new Error('无效输入');const task=scenario.steps[state.phase];if(!task||!task.options.some(o=>o.key===input.key))throw new Error('当前阶段没有此操作');if(world&&(game.order||game.failed))throw new Error('当前无法开始新行动');if(input.value!==undefined){if(game)game.setParameter(input.value);else state=E.parameter(scenario,state,input.value);}if(world){game.select(input.key);game.launch(input.key);updateHUD();}else commit(input.key);return read();}}
  ];
  for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 }
})();
