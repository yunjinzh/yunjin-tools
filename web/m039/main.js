import * as THREE from './vendor/three.module.js';
import {createFlyer} from './aircraft.js';
import {makeWorld,riverX,terrainY,clamp,WORLD} from './world.js';
import {Flight} from './flight.js';

const $=id=>document.getElementById(id);
const icon=(name)=>{
  const paths={pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m9 5 10 7-10 7Z"/>',sound:'<path d="M11 5 6 9H3v6h3l5 4zM15 8c3 2 3 6 0 8M18 5c5 4 5 10 0 14"/>',muted:'<path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6M21 9l-5 6"/>',fullscreen:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9c0-4 7-4 6 0-.5 2-3 2-3 5M12 17v.2"/>',restart:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>'};
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.info}</svg>`;
};
$('app').innerHTML=`
  <div class="veil"></div><div id="danger" class="danger"></div>
  <header class="topbar"><div class="brand"><div class="seal" aria-hidden="true">森</div><div><div class="brand-title">森间飞行</div><small>KOMOREBI FLIGHT · 1903</small></div></div>
    <div class="top-actions"><button id="infoBtn" class="text-btn" title="认识 1903 莱特飞行器">${icon('info')}<span>飞行器档案</span></button><button id="helpBtn" class="icon-btn" title="操作说明 H" aria-label="操作说明">${icon('help')}</button><button id="soundBtn" class="icon-btn" title="开启声音 M" aria-label="开启声音" aria-pressed="false">${icon('muted')}</button><button id="cameraBtn" class="icon-btn" title="切换视角 C" aria-label="切换视角">${icon('camera')}</button><button id="pauseBtn" class="icon-btn" title="暂停 Esc" aria-label="暂停">${icon('pause')}</button><button id="fullBtn" class="icon-btn" title="全屏" aria-label="全屏">${icon('fullscreen')}</button></div>
  </header>
  <div class="compass" aria-label="航向"><div class="compass-scale"><span>NW</span><span>·</span><strong id="cardinal">N</strong><span>·</span><span>NE</span></div><div class="compass-needle"></div><div id="heading" class="heading">000°</div></div>
  <div id="goal" class="goal"><i></i><span id="goalName">杉林初见</span><b id="goalDistance">120 m</b></div>
  <section class="route-status" aria-label="鸟居进度"><div class="route-head"><span>穿越鸟居</span><strong><span id="gateCount">00</span><small> / 08</small></strong></div><div id="segments" class="segments">${Array.from({length:8},()=>'<i></i>').join('')}</div></section>
  <div class="vertical-label" aria-hidden="true">木漏れ日・風の旅</div>
  <section id="startPanel" class="start-panel"><div class="eyebrow">A little journey through Japan</div><h1>随风，<br>越过山林。</h1><p class="intro">驾驶莱特飞行器，沿着溪流深入杉林。轻轻转向，穿过八座朱红鸟居。</p><div class="flight-label"><span>本次旅程</span><strong>杉林 · 山村 · 远山</strong></div><button id="startBtn" class="primary"><span>开始飞行</span>${icon('arrow')}</button><div class="start-hint">按 Enter 出发 · 已在空中为你准备就绪</div><div class="key-explainer"><div><span class="keys"><kbd>W</kbd><kbd>S</kbd></span>升降</div><div><span class="keys"><kbd>A</kbd><kbd>D</kbd></span>转向</div><div><span class="keys"><kbd>⇧</kbd><kbd>空格</kbd></span>油门</div><div><span class="keys"><kbd>C</kbd></span>切换视角</div></div></section>
  <div id="aim" class="aim hidden"><i></i></div>
  <section class="instruments" aria-label="飞行仪表"><div class="instrument"><span class="instrument-label">离地高度</span><div class="reading"><span id="altitude">17</span><small>m</small></div></div><div class="instrument"><span class="instrument-label">飞行速度</span><div class="reading"><span id="speed">50</span><small>km/h</small></div></div><div class="instrument"><span class="instrument-label">油门</span><div class="reading"><span id="throttle">64</span><small>%</small></div><div class="throttle-track"><i id="throttleFill"></i></div></div></section>
  <div class="control-strip"><div class="hint-row"><span><kbd>W</kbd><kbd>S</kbd> 升降</span><span><kbd>A</kbd><kbd>D</kbd> 转向</span><span><kbd>⇧</kbd><kbd>空格</kbd> 油门</span></div><div class="flight-model">WRIGHT FLYER · FOREST EXPEDITION</div></div>
  <section class="map-card" aria-label="航线地图"><div class="map-title"><span>山林航图</span><span>N ↑</span></div><canvas id="minimap" width="380" height="290"></canvas><div class="map-caption">THE FOREST ROUTE</div></section>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <div id="mobileControls" class="mobile-controls" aria-label="触屏驾驶"><div class="dpad"><button data-control="up" aria-label="抬升">↑</button><button data-control="left" aria-label="左转">←</button><button data-control="down" aria-label="下降">↓</button><button data-control="right" aria-label="右转">→</button></div><div class="mobile-throttle"><button data-control="slow" aria-label="减小油门">−</button><button data-control="fast" aria-label="加大油门">＋</button></div></div>
  <div id="stateOverlay" class="modal-backdrop hidden"><section class="game-dialog" role="dialog" aria-modal="true" aria-labelledby="stateTitle"><div id="stateStamp" class="dialog-stamp"></div><h2 id="stateTitle"></h2><p id="stateText"></p><div id="stateStats" class="complete-stats hidden"></div><div id="stateButtons"></div></section></div>
  <dialog id="infoDialog" class="info-dialog"><div class="info-header"><div><div class="eyebrow">The original flying machine</div><h2>1903 莱特飞行器</h2><p>WRIGHT FLYER · KITTY HAWK</p></div><button class="icon-btn" id="closeInfo" aria-label="关闭飞行器档案">${icon('close')}</button></div><div class="info-content"><div class="facts"><div><strong>12.2 <small>m</small></strong><span>翼展 · NASA 约 40 英尺</span></div><div><strong>12 <small>hp</small></strong><span>四缸发动机</span></div><div><strong>1903</strong><span>首次动力飞行</span></div></div><div class="structure-list"><article><b>01</b><div><h3>双翼与翼面扭曲</h3><p>两层布质机翼由木制翼肋、支柱和张线连接。转弯时轻微扭曲翼面，改变两侧升力。</p></div></article><article><b>02</b><div><h3>前置双层升降舵</h3><p>小型双层翼面位于主翼前方，通过改变角度控制俯仰，是辨认飞行器的重要特征。</p></div></article><article><b>03</b><div><h3>后置双螺旋桨</h3><p>两副木桨位于主翼后方，由发动机通过链条驱动，以相反方向旋转。</p></div></article><article><b>04</b><div><h3>尾部双方向舵</h3><p>后方成对的垂直舵面配合翼面扭曲，帮助机头朝向转弯方向。</p></div></article><article><b>05</b><div><h3>俯卧驾驶与开放骨架</h3><p>驾驶员俯卧在下翼上，旁边是发动机；模型保留外露骨架与链条传动布局。</p></div></article><article><b>06</b><div><h3>滑橇式起落架</h3><p>底部使用木制滑橇。1903 年原机从导轨起飞，模型没有现代轮式起落架。</p></div></article></div><p class="source-note">结构参考：<a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/wright-brothers-aircraft/" target="_blank" rel="noopener noreferrer">NASA Glenn · Wright Brothers Aircraft</a>。这是一段虚构的森林旅程，操控、速度与飞行高度经过游戏化处理。所有场景模型均由几何生成，声音由程序合成。</p></div></dialog>
  <dialog id="helpDialog" class="info-dialog" style="max-width:475px"><div class="info-header"><div><div class="eyebrow">Flight controls</div><h2>先感受风，再转向。</h2></div><button id="closeHelp" class="icon-btn" aria-label="关闭操作说明">${icon('close')}</button></div><div class="info-content"><div class="help-keys"><span class="keys"><kbd>W</kbd><kbd>↑</kbd></span><span>抬升机头，向上飞行</span><span class="keys"><kbd>S</kbd><kbd>↓</kbd></span><span>压低机头，向下飞行</span><span class="keys"><kbd>A</kbd><kbd>D</kbd></span><span>左右转向，方向键也可使用</span><span class="keys"><kbd>Shift</kbd><kbd>空格</kbd></span><span>增加 / 减少油门</span><span class="keys"><kbd>C</kbd></span><span>追尾、侧后方、第一人称</span><span class="keys"><kbd>Esc</kbd><kbd>P</kbd></span><span>暂停 / 继续</span><span class="keys"><kbd>R</kbd></span><span>回到最近的检查点</span><span class="keys"><kbd>M</kbd></span><span>声音开关</span></div><p class="source-note">沿溪流依次穿过亮圈所在的鸟居。保持两侧机翼在立柱之间，并留意横梁高度。松开升降和转向键会逐渐恢复平飞；碰撞后可从检查点重试。手机使用屏幕方向键和油门按钮。</p></div></dialog>`;

let renderer;
try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
}catch(error){
  $('loading').innerHTML='<span class="loading-mark">森</span><p>浏览器暂时无法启用三维画面。</p><p>请开启浏览器硬件加速，或使用支持 WebGL 2 的浏览器重试。</p>';throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.domElement.setAttribute('aria-label','日式森林与莱特飞行器三维场景');$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8cbbb);scene.fog=new THREE.FogExp2(0xb8cbbb,.00165);
const camera=new THREE.PerspectiveCamera(53,innerWidth/innerHeight,.15,5200);
const hemi=new THREE.HemisphereLight(0xe5efd5,0x637359,2.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffdf9f,3.25);sun.position.set(-180,280,120);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:650});sun.shadow.bias=-.0006;sun.shadow.normalBias=.075;sun.shadow.radius=2;scene.add(sun,sun.target);
const sky=new THREE.Mesh(new THREE.SphereGeometry(4000,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 vSky;void main(){vSky=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vSky;void main(){vec3 d=normalize(vSky);float h=clamp(d.y,0.0,1.0);vec3 horizon=vec3(.77,.83,.72);vec3 zenith=vec3(.44,.66,.65);vec3 color=mix(horizon,zenith,pow(h,.55));float sun=pow(max(0.0,dot(d,normalize(vec3(-.45,.38,-.85)))),280.0);color+=vec3(.32,.22,.11)*sun;gl_FragColor=vec4(color,1.0);}'}));scene.add(sky);
const world=makeWorld(scene),flyer=createFlyer();scene.add(flyer.group);
const flight=new Flight(world.gates);
const keys=new Set(),touches=new Set();let cameraMode=0,displayTime=0,lastFrame=performance.now(),hudTimer=0,toastTimer=0,activeDialogReturn=null,audioEnabled=false;
const cameraTarget=new THREE.Vector3(),cameraDesired=new THREE.Vector3(),look=new THREE.Vector3();let cameraNeedsSnap=true;

// Sound is synthesized locally: a quiet engine pulse and filtered wind noise.
let audio=null;
function initAudio(){
  if(audio)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  const ctx=new Audio(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  const engine=ctx.createOscillator(),engineGain=ctx.createGain(),filter=ctx.createBiquadFilter();engine.type='sawtooth';engine.frequency.value=42;filter.type='lowpass';filter.frequency.value=230;engineGain.gain.value=.022;engine.connect(filter);filter.connect(engineGain);engineGain.connect(master);engine.start();
  const noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.2;
  const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;noise.loop=true;const wind=ctx.createBiquadFilter(),windGain=ctx.createGain();wind.type='lowpass';wind.frequency.value=750;windGain.gain.value=.12;noise.connect(wind);wind.connect(windGain);windGain.connect(master);noise.start();audio={ctx,master,engine,engineGain,windGain};
}
function setSound(enabled){
  initAudio();if(!audio){toast('当前浏览器暂不支持声音');return;}audio.ctx.resume().catch(()=>{});audioEnabled=enabled;
  $('soundBtn').innerHTML=icon(enabled?'sound':'muted');$('soundBtn').setAttribute('aria-label',enabled?'关闭声音':'开启声音');$('soundBtn').setAttribute('aria-pressed',String(enabled));$('soundBtn').title=(enabled?'关闭':'开启')+'声音 M';
}
function chime(){if(!audioEnabled||!audio)return;const t=audio.ctx.currentTime;[587.3,739.99,880].forEach((f,i)=>{const osc=audio.ctx.createOscillator(),gain=audio.ctx.createGain();osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,t+i*.12);gain.gain.linearRampToValueAtTime(.045,t+i*.12+.015);gain.gain.exponentialRampToValueAtTime(.001,t+i*.12+.8);osc.connect(gain);gain.connect(audio.master);osc.start(t+i*.12);osc.stop(t+i*.12+.85);});}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');toastTimer=3.5;}
function clearInput(){keys.clear();touches.clear();}
function syncUI(){
  const ready=flight.mode==='ready',playing=flight.mode==='flying';$('startPanel').classList.toggle('hidden',!ready);$('app').classList.toggle('playing',!ready);$('aim').classList.toggle('hidden',!playing||cameraMode!==2);
  $('pauseBtn').innerHTML=icon(playing?'pause':'play');$('pauseBtn').setAttribute('aria-label',playing?'暂停':'继续');
  $('gateCount').textContent=String(flight.nextGate).padStart(2,'0');Array.from($('segments').children).forEach((el,i)=>el.classList.toggle('done',i<flight.nextGate));
  const g=world.gates[flight.nextGate];$('goalName').textContent=flight.exploring?'自由飞行':g?g.name:'旅程完成';
  $('stateOverlay').classList.add('hidden');
  if(['paused','crashed','complete'].includes(flight.mode)&&!$('infoDialog').open&&!$('helpDialog').open)showState();
}
function start(){if(flight.start()){clearInput();cameraNeedsSnap=true;syncUI();toast('沿着溪流前进 · W / S 升降，A / D 转向');}}
function resume(){if(flight.resume()){clearInput();syncUI();}}
function retry(){flight.retry();clearInput();cameraNeedsSnap=true;syncUI();toast('已回到最近的检查点');}
function restart(){flight.reset();flight.start();clearInput();cameraNeedsSnap=true;syncUI();}
function pauseToggle(){if($('infoDialog').open||$('helpDialog').open)return;if(flight.mode==='flying'){flight.pause();clearInput();syncUI();}else if(flight.mode==='paused')resume();else if(flight.mode==='ready')start();}
function showState(){
  const mode=flight.mode;$('stateOverlay').classList.remove('hidden');$('stateStats').classList.add('hidden');
  if(mode==='paused'){
    $('stateStamp').textContent='憩';$('stateTitle').textContent='让风停一会儿';$('stateText').textContent='你的飞行已暂停。准备好后，继续穿过山林。';
    $('stateButtons').innerHTML='<button class="primary" data-action="resume">继续飞行</button><button class="secondary" data-action="retry">回到检查点</button><button class="secondary" data-action="restart">重新出发</button>';
  }else if(mode==='crashed'){
    $('stateStamp').textContent='风';$('stateTitle').textContent=flight.reason.startsWith('错过')?'与鸟居擦肩而过':'稍作调整，再次出发';$('stateText').textContent=flight.reason+'。试着保持平飞，提早、轻柔地转向。已通过的鸟居会为你保留。';
    $('stateButtons').innerHTML='<button class="primary" data-action="retry">从检查点重试</button><button class="secondary" data-action="restart">重新开始旅程</button>';
  }else{
    $('stateStamp').textContent='晴';$('stateTitle').textContent='山林记住了你的来访';$('stateText').textContent='八座鸟居都已飞越。风还在吹，你可以再多看一会儿。';$('stateStats').classList.remove('hidden');$('stateStats').innerHTML=`<div>08<small>穿越鸟居</small></div><div>${formatTime(flight.elapsed)}<small>飞行时间</small></div><div>${(flight.distance/1000).toFixed(1)}<small>航程 · km</small></div>`;
    $('stateButtons').innerHTML='<button class="primary" data-action="explore">继续自由飞行</button><button class="secondary" data-action="restart">再飞一次</button>';
  }
  $('stateButtons').querySelector('button')?.focus();
}
function formatTime(s){return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
function openDialog(id){
  if($('infoDialog').open||$('helpDialog').open)return;
  activeDialogReturn=flight.mode;if(flight.mode==='flying')flight.pause();clearInput();$('stateOverlay').classList.add('hidden');$(id).showModal();
}
function closeDialog(id){$(id).close();}
for(const id of ['infoDialog','helpDialog'])$(id).addEventListener('close',()=>{if(activeDialogReturn==='flying')flight.resume();activeDialogReturn=null;clearInput();syncUI();});
function cycleCamera(){cameraMode=(cameraMode+1)%3;cameraNeedsSnap=true;syncUI();toast(['追尾视角','侧后方视角','第一人称视角'][cameraMode]);}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前窗口无法全屏，可尝试浏览器 F11');}}
$('startBtn').onclick=start;$('pauseBtn').onclick=pauseToggle;$('cameraBtn').onclick=cycleCamera;$('soundBtn').onclick=()=>setSound(!audioEnabled);$('fullBtn').onclick=fullscreen;
$('infoBtn').onclick=()=>openDialog('infoDialog');$('helpBtn').onclick=()=>openDialog('helpDialog');$('closeInfo').onclick=()=>closeDialog('infoDialog');$('closeHelp').onclick=()=>closeDialog('helpDialog');
$('stateButtons').addEventListener('click',e=>{
  const action=e.target.closest('button')?.dataset.action;
  if(action==='resume')resume();if(action==='retry')retry();if(action==='restart')restart();if(action==='explore'){flight.explore();syncUI();toast('自由飞行 · 留意树木与山体');}
});
const handled=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight','KeyC','KeyP','KeyR','KeyM','KeyH','Escape','Enter'];
document.addEventListener('keydown',e=>{
  if($('infoDialog').open||$('helpDialog').open)return;
  if(e.code==='Tab'&&!$('stateOverlay').classList.contains('hidden')){
    const btns=Array.from($('stateButtons').querySelectorAll('button')),first=btns[0],last=btns.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;
  }
  if(!handled.includes(e.code))return;
  // Preserve keyboard activation for focused buttons.
  if((e.code==='Enter'||e.code==='Space')&&document.activeElement?.tagName==='BUTTON'&&flight.mode!=='flying')return;
  e.preventDefault();if(e.repeat)return;keys.add(e.code);
  if(e.code==='Enter'){if(flight.mode==='ready')start();else if(flight.mode==='paused')resume();else if(flight.mode==='crashed')retry();}
  if(e.code==='Escape'||e.code==='KeyP')pauseToggle();if(e.code==='KeyC')cycleCamera();if(e.code==='KeyM')setSound(!audioEnabled);if(e.code==='KeyH')openDialog('helpDialog');
  if(e.code==='KeyR'&&flight.mode!=='ready'&&flight.mode!=='complete')retry();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
document.querySelectorAll('[data-control]').forEach(btn=>{
  btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);touches.add(btn.dataset.control);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(event,()=>touches.delete(btn.dataset.control));
});
window.addEventListener('blur',()=>{clearInput();if(flight.mode==='flying'){flight.pause();syncUI();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(flight.mode==='flying'){flight.pause();syncUI();}}});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);cameraNeedsSnap=true;}
window.addEventListener('resize',resize);

const map=$('minimap').getContext('2d');
function drawMap(){
  if(!map)return;
  const w=380,h=290;map.clearRect(0,0,w,h);const px=x=>w/2+x*.74,pz=z=>(z-WORLD.minZ)/(WORLD.maxZ-WORLD.minZ)*h;
  // Contour-like navigation marks and the actual course share the same coordinates.
  map.strokeStyle='rgba(88,111,75,.14)';map.lineWidth=1;
  for(const side of [-1,1])for(let k=0;k<5;k++){map.beginPath();for(let j=0;j<=50;j++){let z=WORLD.minZ+j/50*(WORLD.maxZ-WORLD.minZ),x=riverX(z)+side*(47+k*18+Math.sin(j*.19+k)*12);j?map.lineTo(px(x),pz(z)):map.moveTo(px(x),pz(z));}map.stroke();}
  map.strokeStyle='rgba(105,152,146,.75)';map.lineWidth=7;map.lineCap='round';map.beginPath();for(let j=0;j<=120;j++){const z=WORLD.minZ+j/120*(WORLD.maxZ-WORLD.minZ);j?map.lineTo(px(riverX(z)),pz(z)):map.moveTo(px(riverX(z)),pz(z));}map.stroke();
  world.gates.forEach((g,i)=>{map.beginPath();map.arc(px(g.x),pz(g.z),i===flight.nextGate?5:3.5,0,Math.PI*2);map.fillStyle=g.passed?'#a44e36':i===flight.nextGate?'#e6b770':'#88957b';map.fill();if(i===flight.nextGate){map.strokeStyle='#ae6843';map.lineWidth=1;map.beginPath();map.arc(px(g.x),pz(g.z),8,0,Math.PI*2);map.stroke();}});
  const xx=clamp(px(flight.pos.x),10,w-10),zz=clamp(pz(flight.pos.z),10,h-10);map.save();map.translate(xx,zz);map.rotate(-flight.heading);map.fillStyle='#a9432f';map.strokeStyle='#f2edce';map.lineWidth=1.5;map.beginPath();map.moveTo(0,-10);map.lineTo(7,8);map.lineTo(0,4);map.lineTo(-7,8);map.closePath();map.fill();map.stroke();map.restore();
}
function updateHUD(){
  $('altitude').textContent=String(Math.round(flight.altitude));$('speed').textContent=String(Math.round(flight.speed*3.6));$('throttle').textContent=String(Math.round(flight.throttle*100));$('throttleFill').style.width=flight.throttle*100+'%';
  const deg=(((-flight.heading*180/Math.PI)%360)+360)%360;$('heading').textContent=String(Math.round(deg)%360).padStart(3,'0')+'°';const dirs=['N','NE','E','SE','S','SW','W','NW'];$('cardinal').textContent=dirs[Math.round(deg/45)%8];
  const g=world.gates[flight.nextGate];$('goalDistance').textContent=g&&!flight.exploring?Math.round(Math.hypot(flight.pos.x-g.x,flight.pos.z-g.z))+' m':formatTime(flight.elapsed);
  $('danger').classList.toggle('show',flight.mode==='flying'&&flight.altitude<5);drawMap();
}
function render(now){
  const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;displayTime+=dt;
  const input={turn:((keys.has('KeyA')||keys.has('ArrowLeft')||touches.has('left'))?1:0)-((keys.has('KeyD')||keys.has('ArrowRight')||touches.has('right'))?1:0),pitch:((keys.has('KeyW')||keys.has('ArrowUp')||touches.has('up'))?1:0)-((keys.has('KeyS')||keys.has('ArrowDown')||touches.has('down'))?1:0),throttle:((keys.has('ShiftLeft')||keys.has('ShiftRight')||touches.has('fast'))?1:0)-((keys.has('Space')||touches.has('slow'))?1:0)};
  const event=flight.step(dt,input,world.checkCollision);
  if(event){clearInput();syncUI();if(event.type==='gate'){toast('已穿越「'+event.name+'」 · '+flight.nextGate+' / 8');chime();}if(event.type==='complete')chime();}
  const active=flight.mode==='flying'||flight.mode==='ready';
  flyer.group.position.set(flight.pos.x,flight.pos.y+(flight.mode==='ready'?Math.sin(displayTime*.75)*.12:0),flight.pos.z);
  flyer.group.rotation.set(flight.pitch,flight.heading,flight.bank,'YXZ');
  if(active)flyer.update(displayTime,flight.mode==='ready' ? .25 : flight.throttle,flight.pitch,flight.bank);
  const forward=new THREE.Vector3(-Math.sin(flight.heading),0,-Math.cos(flight.heading)),right=new THREE.Vector3(Math.cos(flight.heading),0,-Math.sin(flight.heading));
  const pos=flyer.group.position;
  if(cameraMode===2){
    const local=new THREE.Vector3(-.65,.58,-.86).applyEuler(flyer.group.rotation);cameraDesired.copy(pos).add(local);cameraTarget.copy(pos).addScaledVector(forward,65);cameraTarget.y+=Math.sin(flight.pitch)*65+.2;flyer.group.visible=true;
  }else{
    flyer.group.visible=true;const lateral=cameraMode===1?20:flight.mode==='ready'?12:0;
    cameraDesired.copy(pos).addScaledVector(forward,cameraMode===1?-20:-29).addScaledVector(right,lateral);cameraDesired.y+=cameraMode===1?7:10;
    cameraDesired.y=Math.max(cameraDesired.y,terrainY(cameraDesired.x,cameraDesired.z)+5);
    cameraTarget.copy(pos).addScaledVector(forward,cameraMode===1?8:29);cameraTarget.y+=cameraMode===1?1:2.5;
    if(flight.mode==='ready')cameraTarget.addScaledVector(right,-7);
  }
  if(cameraNeedsSnap){camera.position.copy(cameraDesired);look.copy(cameraTarget);cameraNeedsSnap=false;}else{camera.position.lerp(cameraDesired,1-Math.exp(-3.7*dt));look.lerp(cameraTarget,1-Math.exp(-4.4*dt));}
  camera.lookAt(look);sky.position.copy(camera.position);
  sun.position.set(pos.x-130,pos.y+245,pos.z+130);sun.target.position.set(pos.x,pos.y-10,pos.z-35);
  world.update(displayTime,flight.exploring?world.gates.length:flight.nextGate);
  if(audio){const t=audio.ctx.currentTime;audio.master.gain.setTargetAtTime(audioEnabled&&active ? .55 : 0,t,.25);audio.engine.frequency.setTargetAtTime(30+flight.throttle*29,t,.15);audio.windGain.gain.setTargetAtTime(flight.speed*.005,t,.2);}
  hudTimer+=dt;if(hudTimer>.12){updateHUD();hudTimer=0;}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}
  renderer.render(scene,camera);
  requestAnimationFrame(render);
}
syncUI();updateHUD();requestAnimationFrame(render);requestAnimationFrame(()=>$('loading').classList.add('hidden'));
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(flight.mode==='flying')flight.pause();syncUI();toast('三维画面暂时中断，请刷新页面重新进入');});

// Same state and actions as the interface, when the browser exposes WebMCP.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();const result=()=>flight.snapshot();
  for(const tool of [
    {name:'read_flight_status',title:'读取飞行状态',description:'Read current game status, progress, altitude and speed.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>result()},
    {name:'control_flight_session',title:'管理飞行旅程',description:'Start, pause, resume, or retry the current flight using the visible game controls.',inputSchema:{type:'object',properties:{action:{type:'string',enum:['start','pause','resume','retry']}},required:['action'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{
      if(!input||typeof input!=='object'||!['start','pause','resume','retry'].includes(input.action)||Object.keys(input).some(k=>k!=='action'))throw new Error('Invalid flight action');
      if($('infoDialog').open||$('helpDialog').open)throw new Error('Close the open dialog first');
      const allowed={start:['ready'],pause:['flying'],resume:['paused'],retry:['flying','paused','crashed']};if(!allowed[input.action].includes(flight.mode))throw new Error('Action unavailable in current flight state');
      if(input.action==='start')start();if(input.action==='pause'){flight.pause();clearInput();syncUI();}if(input.action==='resume')resume();if(input.action==='retry')retry();return result();
    }}
  ]){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
