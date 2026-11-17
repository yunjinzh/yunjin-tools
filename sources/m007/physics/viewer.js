import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RobotRig} from '../dist/robot-rig.js';
import {PhysicsTrial,initPhysics,STATES,LABELS,DIAG} from './core.js';
import {FixedClock} from './clock.js';
import {injectFault} from './faults.js';
const $=s=>document.querySelector(s),V=THREE.Vector3;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meta=JSON.parse($('#robot-meta').textContent),raw=atob($('#robot-binary').textContent.trim());
const buffer=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buffer[i]=raw.charCodeAt(i);
const material=(color,metalness=.15,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const robotMaterials={robotShell:material('#d5d9ce',.38,.35),robotDark:material('#24332e',.28,.38),robotJoint:material('#637066',.65,.28),rubber:material('#1b2522',.05,.9)};
function makeRig(){const robot=new THREE.Group(),rig=new RobotRig({get:n=>robotMaterials[n]||robotMaterials.robotShell});robot.add(rig.root);rig.build(meta,buffer.buffer);rig.links.right_rubber_hand.children.filter(x=>x.isMesh).forEach(x=>x.visible=false);return rig;}
let sim,rig,running=false,kind='cup',lastTime=0,viewNear=false,showColliders=false,pathKey=-1,uiTime=0,selftesting=false;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e4e8e1');scene.fog=new THREE.Fog('#e4e8e1',9,19);
const camera=new THREE.PerspectiveCamera(38,1,.01,50);let renderer=null,graphicsError='';
try{renderer=new THREE.WebGLRenderer({canvas:$('#view'),antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}
catch(error){graphicsError=error.message;$('#loading strong').textContent='当前浏览器的三维显示不可用';$('#loadingText').textContent='WebGL 初始化失败。物理计算、任务控制与证据导出仍可运行。';}
const controls=new OrbitControls(camera,$('#view'));controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.485;controls.minDistance=.5;controls.maxDistance=10;
scene.add(new THREE.HemisphereLight('#f5f2e6','#829180',2.8));const sun=new THREE.DirectionalLight('#fff4da',3.2);sun.position.set(-2,6,3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=3;sun.shadow.camera.bottom=-3;sun.shadow.normalBias=.015;sun.shadow.bias=-.00015;scene.add(sun);scene.add(new THREE.AmbientLight('#dce3dc',.3));
let group=new THREE.Group();scene.add(group);let links=[],debugs=[],pathLine,palmGroup,contactDots=[],baseDeck;
function mesh(geometry,mat,parent=group){const o=new THREE.Mesh(geometry,mat);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cube(w,h,d,color,p,parent){const o=mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?material(color):color,parent);o.position.copy(p);return o;}
function label(text,p,w=.7){const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#e7ece3';ctx.fillRect(0,0,768,160);ctx.fillStyle='#385446';ctx.font='500 56px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,80);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const o=mesh(new THREE.PlaneGeometry(w,w*160/768),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));o.position.copy(p);o.rotation.y=Math.PI;return o;}
function home(){camera.position.set(4.1,3.0,-4.8);controls.target.set(0,.8,.45);controls.update();viewNear=false;$('#camera').textContent='近看抓取';}
function rebuild(){
  sim?.dispose();scene.remove(group);group.traverse(o=>{o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();});
  group=new THREE.Group();scene.add(group);links=[];debugs=[];contactDots=[];pathKey=-1;
  rig=makeRig();group.add(rig.root.parent);
  sim=new PhysicsTrial({rig,kind,seed:Math.max(1,Math.min(10000,parseInt($('#seed').value)||1))});
  for(const part of sim.parts){
    let o;
    if(part.role==='floor'){o=cube(7,.1,5,'#d4ddd0',part.body.translation());const grid=new THREE.GridHelper(7,28,'#b4c4b3','#c0cebd');grid.position.y=.0005;group.add(grid);}
    if(['source','destination'].includes(part.role)){
      o=cube(part.half.x*2,part.half.y*2,part.half.z*2,'#b3bba9',part.body.translation());
      const p=part.body.translation();cube(.42,.89,.38,'#879980',new V(p.x,.465,p.z+.12));
      label(part.role==='source'?'01  /  PICK':'02  /  PLACE',new V(p.x,.955,.642),.66);
      const ring=mesh(new THREE.RingGeometry(kind==='cup'?.082:.16,kind==='cup'?.086:.166,60),new THREE.MeshBasicMaterial({color:part.role==='source'?'#d07f66':'#426b55',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,1.021,.72);
    }
    if(part.role==='obstacle'){o=cube(part.half.x*2,part.half.y*2,part.half.z*2,'#a88765',part.body.translation());cube(part.half.x*2+.008,.028,part.half.z*2+.008,'#dbb26f',new V(part.body.translation().x,part.body.translation().y+part.half.y-.04,part.body.translation().z));}
    if(part.role==='payload'){
      if(kind==='cup'){o=new THREE.Group();group.add(o);const shell=mesh(new THREE.CylinderGeometry(.055,.055,.13,48),material('#e9e3d0',.05,.28),o);const rim=mesh(new THREE.TorusGeometry(.051,.004,10,48),material('#ede7d8'),o);rim.rotation.x=Math.PI/2;rim.position.y=.066;const coffee=mesh(new THREE.CircleGeometry(.047,40),material('#5f4534',0,.26),o);coffee.rotation.x=-Math.PI/2;coffee.position.y=.0665;
      }else{o=cube(.26,.2,.18,material('#bca17c',0,.88),new V());cube(.035,.001,.18,'#dec9a4',new V(0,.101,0),o);}
      links.push({o,part});
    }
    if(part.role==='finger'){o=cube(.016,.07,.07,material('#303f36',.35,.5),new V());links.push({o,part});}
    if(part.collider){const geometry=part.role==='payload'&&kind==='cup'?new THREE.CylinderGeometry(sim.half.x,sim.half.x,sim.half.y*2,16):part.half?new THREE.BoxGeometry(part.half.x*2,part.half.y*2,part.half.z*2):new THREE.CapsuleGeometry(.032,part.collider.shape.halfHeight*2,4,8);
      const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:part.role==='payload'?0xe07563:0x436e55,transparent:true,opacity:.8}));wire.visible=showColliders;group.add(wire);debugs.push({o:wire,part});geometry.dispose();}
  }
  baseDeck=cube(.44,.025,.35,material('#778b73',.4,.5),new V());
  palmGroup=new THREE.Group();group.add(palmGroup);cube(sim.opening*2+.05,.035,.026,'#d5d9ce',new V(0,0,-.08),palmGroup);cube(.04,.04,.055,'#5b6e5c',new V(0,0,-.047),palmGroup);
  for(let i=0;i<2;i++){const dot=mesh(new THREE.SphereGeometry(.007,10,8),new THREE.MeshBasicMaterial({color:0xd7654b}));dot.visible=false;contactDots.push(dot);}
  pathLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:'#6d8b60',dashSize:.07,gapSize:.04}));group.add(pathLine);
  running=false;clock.reset();$('#run').textContent='开始任务 ↗';$('#faultResult').textContent='每次注入都会写入事件记录。';$('#faultResult').classList.remove('failure');
  $('#objectTitle').textContent=kind==='cup'?'咖啡杯 · 自主取送':'物流箱 · 抓取搬运';$('#objectSubtitle').textContent=`${sim.mass.toFixed(2)} KG / μ ${sim.mu.toFixed(2)} / RIGID BODY`;renderSync();updateUI();
}
function renderSync(){
  for(const {o,part}of [...links,...debugs]){o.position.copy(part.body.translation());o.quaternion.copy(part.body.rotation());}
  palmGroup.position.copy(sim.palm.body.translation());baseDeck.position.copy(sim.robot.position);baseDeck.position.y=.0125;
  sim.fingers.forEach((f,i)=>{const c=f.collider.contactCollider(sim.payload.collider,.001);contactDots[i].visible=!!c;if(c)contactDots[i].position.copy(c.point1);});
  const routes=sim.events.filter(e=>e.type==='PATH');if(routes.length!==pathKey){pathKey=routes.length;pathLine.geometry.dispose();pathLine.geometry=new THREE.BufferGeometry().setFromPoints((routes.at(-1)?.points||[]).map(p=>new V(p.x,.012,p.z)));pathLine.computeLineDistances();}
  if(viewNear){const p=sim.palm.body.translation();controls.target.lerp(new V(p.x,p.y,p.z),.14);camera.position.lerp(new V(p.x+1,p.y+.65,p.z-1.5),.07);}
}
function updateUI(){
  const e=sim.contactEvidence(),m=sim.metrics,failed=sim.state==='FAILED';$('#stageState').textContent=LABELS[sim.state];$('#monitorTitle').textContent=failed?sim.failures[0].code:LABELS[sim.state];$('#monitorTitle').classList.toggle('failure',failed);
  $('#monitorDesc').textContent=failed?sim.failures[0].description:sim.state==='SUCCESS'?'物体已释放，目标台面支撑成立，并通过连续 0.6 秒的独立稳定性检查。':sim.grip?'双侧接触与受力门槛已通过，持续检查接触丢失、相对滑移与扫掠碰撞。':'物体保持动态刚体，抓取约束由接触和受力证据决定。';
  $('#velocity').textContent=new V().copy(sim.payload.body.linvel()).length().toFixed(3);$('#slip').textContent=(m.maxSlip*1000).toFixed(2);$('#penetration').textContent=(m.maxPenetration*1000).toFixed(2);$('#placeError').textContent=m.positionError===null?'—':(m.positionError*1000).toFixed(2);
  $('#contact').textContent=e.both?'已成立':'未成立';$('#constraint').textContent=sim.grip?'已建立':'未建立';$('#teleport').textContent=sim.failures.some(f=>f.code==='TELEPORT')?'检测到瞬移':sim.steps?'检查通过':'待执行';$('#support').textContent=sim.support().valid?'接触成立':'未接触';$('#forces').textContent=e.pair.map(x=>x.force.toFixed(1)).join(' / ')+' N';$('#wrong').textContent=m.forbiddenContacts+' 次';
  $('#time').textContent='仿真时间 '+sim.t.toFixed(2)+' s';$('#ticks').textContent='STEP '+String(sim.steps).padStart(5,'0');
  const seen=new Set(sim.events.filter(e=>e.type==='STATE').map(e=>e.to));$('#states').innerHTML=STATES.map((s,i)=>`<div class="state ${s===sim.state?'now':seen.has(s)?'past':''}"><small>${String(i+1).padStart(2,'0')} / ${s}</small>${LABELS[s]}</div>`).join('');
  $('#events').innerHTML=sim.events.filter(e=>['STATE','GRASP_ATTACHED','GRASP_RELEASED','FAIL','FAULT_INJECTED','ACCEPT'].includes(e.type)).slice(-5).map(e=>`<div><time>${e.t.toFixed(2)}s</time><span>${esc(e.type==='STATE'?LABELS[e.to]:e.code||e.fault||e.type)}</span></div>`).join('')||'尚无任务事件。';
}
const clock=new FixedClock(()=>{if(running&&!['FAILED','SUCCESS','E_STOP'].includes(sim.state))sim.step();});
function resize(){const r=$('#viewport').getBoundingClientRect();renderer?.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('#viewport'));
function frame(time){const elapsed=lastTime?(time-lastTime)/1000:0;lastTime=time;if(sim){clock.advance(elapsed*Number($('#speed').value));if(['FAILED','SUCCESS','E_STOP'].includes(sim.state)&&running){running=false;$('#run').textContent='重新开始 ↗';}renderSync();if(time-uiTime>80){updateUI();uiTime=time;}}controls.update();renderer?.render(scene,camera);requestAnimationFrame(frame);}
$('#run').onclick=()=>{if(!sim||selftesting)return;if(['FAILED','SUCCESS','E_STOP'].includes(sim.state))rebuild();if(sim.state==='IDLE')sim.start();running=!running;clock.reset();$('#run').textContent=running?'暂停任务 Ⅱ':'继续任务 ↗';};
$('#step').onclick=()=>{if(!sim||selftesting)return;running=false;if(sim.state==='IDLE')sim.start();if(!['FAILED','SUCCESS','E_STOP'].includes(sim.state))sim.step();$('#run').textContent='继续任务 ↗';renderSync();updateUI();};
$('#reset').onclick=()=>{if(!selftesting)rebuild();};$('#seed').onchange=()=>{if(!selftesting)rebuild();};
document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{if(selftesting)return;kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));rebuild();});
$('#estop').onclick=()=>{sim.emergencyStop();for(let i=0;i<60;i++)sim.step();running=false;updateUI();};
$('#camera').onclick=()=>{viewNear=!viewNear;$('#camera').textContent=viewNear?'退出近看':'近看抓取';};$('#home').onclick=home;
$('#colliders').onclick=()=>{showColliders=!showColliders;$('#colliders').setAttribute('aria-pressed',String(showColliders));debugs.forEach(x=>x.o.visible=showColliders);};
document.querySelectorAll('[data-fault]').forEach(b=>b.onclick=()=>{
  if(!sim||['FAILED','SUCCESS','E_STOP'].includes(sim.state)){$('#faultResult').textContent='请先开始或重置任务。';return;}
  if(sim.state==='IDLE')sim.start();injectFault(sim,b.dataset.fault);
  if(b.dataset.fault==='penetration')sim.audit();else sim.step();
  if(['barrier','penetration'].includes(b.dataset.fault)){const p=sim.parts.at(-1);cube(p.half.x*2,p.half.y*2,p.half.z*2,material('#dc8067',.2,.4),p.body.translation());}
  $('#faultResult').textContent='已记录：'+b.textContent+'。'+(sim.failures[0]?.description||'继续运行以观察检测结果。');$('#faultResult').classList.add('failure');renderSync();updateUI();
});
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(sim.report(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`physics-${kind}-seed${sim.seed}-${sim.state}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#testreport').onclick=()=>{const r=JSON.parse($('#test-summary').textContent);$('#reportBody').innerHTML=`<p class="evidence-count">${r.passed} / ${r.total} 通过</p><p>2026-10-26 · Node.js 实际运行记录。仿真结果，不代表真机成功率。</p><table><thead><tr><th>测试</th><th>结果</th><th>终态 / 检测码</th></tr></thead><tbody>${r.results.map(x=>`<tr><td>${esc(x.id)}</td><td>${x.passed?'通过':'失败'}</td><td>${esc(x.failures?.[0]?.code||x.state||'PASS')}</td></tr>`).join('')}</tbody></table>`;$('#reportModal').hidden=false;};$('#closeReport').onclick=()=>$('#reportModal').hidden=true;
$('#selftest').onclick=async()=>{
  if(selftesting)return;selftesting=true;running=false;$('#selftest').disabled=true;const rows=[];
  const cases=[['咖啡取送',{kind:'cup'},'SUCCESS'],['物流搬运',{kind:'box'},'SUCCESS'],['空抓拦截',{noContact:true},'GRASP_FAILED'],['摩擦不足',{friction:.03},'GRIP_CAPACITY'],['瞬移拦截',{},'TELEPORT'],['穿透拦截',{},'PENETRATION']];
  for(let i=0;i<cases.length;i++){
    $('#selftestResult').textContent=`正在运行 ${i+1} / 6：${cases[i][0]}…`;await new Promise(r=>setTimeout(r,40));
    const [name,options,expected]=cases[i],r=makeRig(),t=new PhysicsTrial({rig:r,record:false,...options});
    try{if(expected==='TELEPORT'||expected==='PENETRATION'){t.start();injectFault(t,expected==='TELEPORT'?'teleport':'penetration');expected==='PENETRATION'?t.audit():t.step();}else t.run();const actual=t.failures[0]?.code||t.state;rows.push(`${actual===expected?'✓':'×'} ${name} · ${actual}`);}finally{t.dispose();r.root.traverse(o=>o.geometry?.dispose());}
  }
  $('#selftestResult').textContent=rows.join('\n');$('#selftest').disabled=false;selftesting=false;$('#run').textContent=sim.state==='IDLE'?'开始任务 ↗':'继续任务 ↗';
};
document.addEventListener('visibilitychange',()=>{lastTime=0;clock.reset();});
window.physicsWorkbench={get report(){return sim?.report();}};
initPhysics().then(()=>{rebuild();home();resize();$('#loading').hidden=!graphicsError;requestAnimationFrame(frame);}).catch(e=>{$('#loadingText').textContent='初始化失败：'+e.message;});
