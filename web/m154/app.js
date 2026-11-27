import {createRegionalLayer,regionalInventory} from './urban/regional-layer.js';
import {nightLighting} from './heritage/gate-lights.js';
import {canalReflection} from './heritage/reflections.js';
import {views} from './heritage/views.js';
import {fieldViewer} from './heritage/field-view.js';
import * as T from 'three';
import {landmarks as catalogue,createLandmark} from './landmarks.js';
import {createCity} from './city.js';
import {createTerrain} from './terrain.js';
import {attachInspector} from './urban/inspect.js';
import {navigation,project,unproject,corePoint} from './navigation.js';
import {walkingGround} from './walk-surfaces.js';
import {makeAtmosphere,climates} from './atmosphere.js';
import {panels,dispTime} from './panels.js';
const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('#world');
const order=['zun','hutong','waterfront','palace','tiananmen','tiantan','ncpa','cctv','stadium','cube'];
const lms=order.map(id=>catalogue.find(l=>l.id===id)),historic=new Set(['tiantan','palace','tiananmen']);
const district={hutong:'东城区',waterfront:'西城区',tiantan:'东城区',palace:'东城区',tiananmen:'东城区',ncpa:'西城区',zun:'朝阳区',cctv:'朝阳区',stadium:'朝阳区',cube:'朝阳区'};
const category=id=>['hutong','waterfront'].includes(id)?'城市街区':historic.has(id)?'古都建筑':'当代地标';
const cardName={hutong:'钟库胡同',waterfront:'什刹海 · 前海',tiantan:'天坛 · 祈年殿',palace:'故宫 · 太和殿',tiananmen:'天安门',ncpa:'国家大剧院',zun:'中国尊',cctv:'央视总部',stadium:'国家体育场 · 鸟巢',cube:'水立方'};
const initial=new URLSearchParams(location.search).get('landmark');let selected=lms.find(l=>l.id===initial)||lms[0],filter='all';
const scene=new T.Scene(),camera=new T.PerspectiveCamera(43,1,.65,180000),models=new Map();
const state={date:'2026-09-22',time:16+20/60,weather:'clear',layers:{buildings:true,vegetation:true,imagery:true,cbd2023:false,regionalBuildings:true}};
const incomingEnvironment=new URLSearchParams(location.search);
const savedTime=/^(\d{1,2}):(\d{2})$/.exec(incomingEnvironment.get('time')||'');
if(savedTime&&+savedTime[1]<24&&+savedTime[2]<60)state.time=+savedTime[1]+(+savedTime[2])/60;
if(Object.hasOwn(climates,incomingEnvironment.get('weather')))state.weather=incomingEnvironment.get('weather');
let renderer,mirrorCanal,atmos,city,terrain,pan,cpu,software=false,loss=false,running=true,ready=false,toastTimer,touring=false,tourTime=0,last=performance.now(),tick=0;
let shadowStamp=null,shadowDirty=true;
let pixel=1,nightUniform={value:0},snowUniform={value:0},wetUniform={value:0};
function toast(s,ms=2600){clearTimeout(toastTimer);$('#toast').textContent=s;toastTimer=setTimeout(()=>$('#toast').textContent='',ms);}
function tourEnd(){if(!touring)return;touring=false;tourTime=0;$('#tour').classList.remove('on');$('#tour').innerHTML='<i>'+icon('play')+'</i><span>自动导览</span>';$('#tour').setAttribute('aria-pressed','false');}
let regionalLayer;
const stepHeight=walkingGround(project,lms);
const nav=navigation({camera,canvas,getCity:()=>city,getTerrain:()=>terrain||cpu,stepHeight,onInteraction:tourEnd,onMode:updateMode});
attachInspector({button:$('#inspectBuilding'),canvas,camera,project,unproject,toast,isVisible:()=>state.layers.buildings});
const gallery=fieldViewer();let shotIndex=0;
function showViews(){const dest=$('#views'),items=views[selected.id];dest.replaceChildren();dest.hidden=!items;$('#fieldButton').hidden=!items;if(!items)return;
 const title=document.createElement('small');title.textContent='取景';dest.append(title);
 items.forEach((v,i)=>{const btn=document.createElement('button');btn.textContent=v.name;btn.title=v.caption;btn.setAttribute('aria-label',v.caption);btn.setAttribute('aria-pressed',String(i===shotIndex));btn.onclick=()=>{tourEnd();nav.shot(selected,i);shotIndex=i;showViews();stage.dataset.shot=String(i);const url=new URL(location.href);url.searchParams.set("landmark",selected.id);url.searchParams.set("view",v.key);history.replaceState(null,"",url);};dest.append(btn);});}
$('#fieldButton').onclick=()=>{tourEnd();nav.stop();gallery.open(selected.id,selected.name);};
function updateMode(){const w=nav.mode==='walk';$('#walk').classList.toggle('on',w);$('#fly').classList.toggle('on',!w);$('#walk').setAttribute('aria-pressed',w);$('#fly').setAttribute('aria-pressed',!w);$('#touchpad').classList.toggle('show',true);$('#touchpad').classList.toggle('flying',!w);$('#hint').innerHTML=w?'拖动转头 <b>·</b> WASD 行走 <b>·</b> Shift 加速':'拖动环视 <b>·</b> 滚轮缩放 <b>·</b> WASD 移动';}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.setViewOffset(w,h,-w*(w<620?.034:.075),-h*.015,w,h);camera.updateProjectionMatrix();renderer?.setSize(w,h,false);}
function makeModel(lm){
 if(models.has(lm.id))return models.get(lm.id);const g=createLandmark(lm.id),p=project(lm.lon,lm.lat);g.position.set(p.x,0,p.z);
 g.traverse(o=>{if(["tiananmen","waterfront","ncpa"].includes(lm.id))o.layers.enable(1);if(!o.isMesh)return;const m=o.material;if(!m.isMeshStandardMaterial||m.userData.atlasReady)return;m.userData.atlasReady=true;const glass=m.name==='Landmark glass',nightRoof=m.map?.userData?.src?.endsWith('gate-roof.webp'),nightBeam=/gate-(lower-paint|paint|brackets)\.webp/.test(m.map?.userData?.src||'');
 const prior=m.onBeforeCompile,priorKey=m.customProgramCacheKey();m.onBeforeCompile=(shader,renderer)=>{prior.call(m,shader,renderer);shader.uniforms.uLandNight=nightUniform;shader.uniforms.uLandSnow=snowUniform;shader.uniforms.uLandWet=wetUniform;
 shader.vertexShader='varying float vUp; varying vec3 vLocalStone;\n'+shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n vUp=normal.y; vLocalStone=position;');
 shader.fragmentShader='uniform float uLandNight; uniform float uLandSnow; uniform float uLandWet; varying float vUp; varying vec3 vLocalStone;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n if(vUp>.985 && vLocalStone.y<10.8 && diffuseColor.r>.25 && diffuseColor.g>diffuseColor.r*.64 && diffuseColor.b>diffuseColor.g*.52){vec2 tile=vLocalStone.xz/vec2(1.82,1.08);tile.x+=.5*mod(floor(tile.y),2.);vec2 st=fract(tile);float joint=min(min(st.x,1.-st.x),min(st.y,1.-st.y));float n=fract(sin(dot(floor(tile),vec2(17.31,91.77)))*42843.715);float edge=1.-smoothstep(.009,.016+fwidth(joint),joint);diffuseColor.rgb*=.945+.089*n-.16*edge;} diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.70,.77,.81),uLandSnow*.64*smoothstep(.1,.85,vUp)); diffuseColor.rgb*=1.-uLandWet*.09;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*uLandNight*'+(glass?'vec3(.46,.51,.62)':nightRoof?'vec3(.13,.096,.055)':nightBeam?'vec3(.84,.70,.53)':'vec3(.39,.27,.215)')+';');};m.customProgramCacheKey=()=>priorKey+(glass?'jingguan-glass':'jingguan-solid');});
 scene.add(g);shadowDirty=true;models.set(lm.id,g);return g;
}
function applyEnvironment(){shadowDirty=true;const env=atmos?.set(state.date,state.time,state.weather)||{night:state.time<6||state.time>19?1:0,wet:0,snow:0};nightLighting.value=env.night;nightUniform.value=env.night;wetUniform.value=env.wet;snowUniform.value=env.snow;
 $('#clock').textContent=dispTime(state.time);$('#weatherTag').textContent=climates[state.weather][0];$('#weatherIcon').innerHTML=icon(state.weather==='clear'&&env.night>.6?'moon':climates[state.weather][1]);
 terrain?.update(env);stage.dataset.weather=state.weather;stage.dataset.time=dispTime(state.time);}
function cards(){const wrap=$('#cards');wrap.innerHTML='';for(const lm of lms){const b=document.createElement('button');b.className='card';b.dataset.id=lm.id;b.setAttribute('aria-label','前往'+lm.name);b.title=lm.name;const photo=['hutong','waterfront'].includes(lm.id)?'exhibit/'+lm.id+'-thumb.webp':'photos/'+lm.id+'.webp';b.innerHTML='<img src="'+(window.__resolveToolURL?.(photo)||photo)+'" alt="" draggable="false"><strong>'+cardName[lm.id]+'</strong>';b.onclick=()=>{tourEnd();go(lm.id)};wrap.append(b);}drawCards();}
function drawCards(){let n=0;$('#cards').querySelectorAll('.card').forEach(b=>{b.hidden=filter!=='all'&&category(b.dataset.id)!==filter;if(!b.hidden)n++;const sel=b.dataset.id===selected.id;b.classList.toggle('selected',sel);b.setAttribute('aria-pressed',sel);});$('#count').textContent=String(n).padStart(2,'0');requestAnimationFrame(cardArrows);}
function cardArrows(){const row=$('#cards');$('#prev').disabled=row.scrollLeft<3;$('#next').disabled=row.scrollLeft+row.clientWidth>=row.scrollWidth-3;}
function coverFor(id){const url=['hutong','waterfront'].includes(id)?'exhibit/'+id+'.webp':'photos/'+id+'.webp';return window.__resolveToolURL?.(url)||url;}
function go(id,instant=false,scroll=true){
 const lm=lms.find(m=>m.id===id);if(!lm)return;selected=lm;$('#backFilm').href='./?chapter='+({zun:'cbd',cctv:'cbd',tiananmen:'avenue'}[id]||(['hutong','waterfront','palace'].includes(id)?id:'cbd'));shotIndex=0;showViews();stage.dataset.shot="0";if(renderer)makeModel(lm);if(cpu)cpu.select(id).catch(e=>console.warn(e));
 $('#place').textContent=lm.name;$('#enplace').textContent=lm.en.toUpperCase();$('#kind').textContent=category(id);$('#region').textContent=district[id];
 if(!renderer&&!cpu)$('#backdrop').style.backgroundImage='url("'+coverFor(id)+'")';
 if(filter!=='all'&&category(lm.id)!==filter){filter='all';document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('sel',b.dataset.cat==='all'));}
 drawCards();const incoming=instant?new URLSearchParams(location.search).get('view'):null,viewIndex=views[id]?.findIndex(v=>v.key===incoming)??-1;
 if(viewIndex>0){nav.shot(lm,viewIndex,instant);shotIndex=viewIndex;stage.dataset.shot=String(viewIndex);showViews();}else nav.go(lm,instant);pan?.maps.select(id);stage.dataset.landmark=id;if(!instant){const url=new URL(location.href);url.searchParams.set('landmark',id);url.searchParams.delete('region');url.searchParams.delete('view');history.replaceState(null,'',url);}
 if(scroll){const wrap=$('#cards'),b=wrap.querySelector('[data-id="'+id+'"]');const diff=b.getBoundingClientRect().left-wrap.getBoundingClientRect().left;if(diff<0||diff+b.offsetWidth>wrap.clientWidth)wrap.scrollTo({left:wrap.scrollLeft+diff-wrap.clientWidth/2+b.offsetWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
}
pan=panels({landmarks:lms,getSelected:()=>selected,go:id=>{tourEnd();go(id)},nav,state,apply:applyEnvironment,toast,onLayer:(l,v)=>{if(l==='regionalBuildings')regionalLayer?.setEnabled(v);city?.setLayer(l,v);shadowDirty=true},getRenderer:()=>renderer?'Three.js · WebGL 2':cpu?'Three.js 几何 · CPU 三维栅格化':'载入中',getStats:()=>city?.stats});
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{tourEnd();filter=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(t=>{t.classList.toggle('sel',t===b);t.setAttribute('aria-pressed',t===b)});drawCards();$('#cards').scrollTo({left:0});});
$('#prev').onclick=()=>$('#cards').scrollBy({left:-Math.max(155,$('#cards').clientWidth*.58),behavior:'smooth'});$('#next').onclick=()=>$('#cards').scrollBy({left:Math.max(155,$('#cards').clientWidth*.58),behavior:'smooth'});$('#cards').addEventListener('scroll',cardArrows,{passive:true});
$('#home').onclick=()=>{tourEnd();go(selected.id);toast('已返回'+selected.short+'视角')};
$('#compass').onclick=()=>{nav.north();updateMode();toast('朝北俯瞰')};
$('#zoomIn').onclick=()=>nav.zoom(.76);$('#zoomOut').onclick=()=>nav.zoom(1/.76);
function mode(m){if(!renderer&&!cpu){toast('场景正在载入');return;}if(m==='walk'&&!city){toast('城区几何正在载入，完成后即可步行');return;}if(!nav.switchMode(m)){const eye=nav.getCamera();toast(corePoint(eye.lon,eye.lat)?'附近没有找到可通行的地面':'地面漫游覆盖核心城区，可先选择一处地标进入');return;}updateMode();toast(m==='walk'?'已落地 · 拖动转头，WASD 或方向键行走':'已进入飞行模式');}
$('#walk').onclick=()=>mode('walk');$('#fly').onclick=()=>mode('fly');
$('#tour').onclick=()=>{if(touring){tourEnd();return;}if(nav.mode==='walk')nav.switchMode('fly');const seq=lms.filter(l=>filter==='all'||category(l.id)===filter);if(!seq.includes(selected))go(seq[0].id);else if(!nav.focused)go(selected.id);touring=true;tourTime=0;$('#tour').classList.add('on');$('#tour').innerHTML='<i>'+icon('pause')+'</i><span>暂停导览</span>';$('#tour').setAttribute('aria-pressed','true');toast('开始沿所选地标自动导览');};
document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);nav.key(b.dataset.move,true)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>nav.key(b.dataset.move,false)});
function immersive(yes){document.body.classList.toggle('immersive',yes);const b=$('#cinema');b.setAttribute('aria-pressed',yes);b.querySelector('span').textContent=yes?'退出沉浸':'沉浸';requestAnimationFrame(resize);}
 $('#cinema').onclick=()=>immersive(!document.body.classList.contains('immersive'));addEventListener('keydown',e=>{if(e.code==='Escape'&&!document.querySelector('dialog[open]'))immersive(false);});
 $('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('当前浏览器限制了全屏显示')}};document.addEventListener('fullscreenchange',()=>{const f=document.fullscreenElement?'退出全屏':'全屏';$('#full').setAttribute('aria-label',f);$('#full').title=f;resize()});
const ro=new ResizeObserver(()=>{resize();cardArrows()});ro.observe(stage);
resize();cards();go(selected.id,true,false);updateMode();applyEnvironment();
function telemetry(){const c=nav.getCamera();const area=corePoint(c.lon,c.lat),a=project(selected.lon,selected.lat),away=!nav.focused&&Math.hypot(nav.target.x-a.x,nav.target.z-a.z)>1400;const regionView=away&&!area;
 if(stage.dataset.regionView!==String(regionView)){stage.dataset.regionView=String(regionView);$('.place-actions').hidden=regionView;$('#views').hidden=regionView||!views[selected.id];}
 if(away){$('#place').textContent=nav.observation?.name||(area?'北京城区':'北京区域地形');$('#enplace').textContent=area?'BEIJING URBAN AREA':nav.observation?'CMAB · REGIONAL BUILDINGS':'BEIJING REGIONAL TERRAIN';$('#region').textContent='北京';$('#kind').textContent=area?'自由飞行':state.layers.regionalBuildings?'2021–2023 研究建筑 · 预测高度':'区域飞行';}else if($('#place').textContent!==selected.name){$('#place').textContent=selected.name;$('#enplace').textContent=selected.en.toUpperCase();$('#kind').textContent=category(selected.id);$('#region').textContent=district[selected.id];}$('#coords').textContent=c.lat.toFixed(4)+'° N　'+c.lon.toFixed(4)+'° E';$('#alt').textContent='视点离地 '+(nav.mode==='walk'?c.height.toFixed(2):Math.round(c.height))+' m';$('#needle').style.transform='rotate('+(-c.heading*180/Math.PI)+'deg)';pan.maps.draw();stage.dataset.mode=nav.mode;if(renderer){stage.dataset.triangles=renderer.info.render.triangles;stage.dataset.calls=renderer.info.render.calls;}}
function animate(now){
 if(!running)return;requestAnimationFrame(animate);const dt=Math.min(cpu?.24:.09,(now-last)/1000);last=now;if(document.hidden||gallery.isOpen())return;
 if(touring&&!pan.isOpen()){tourTime+=dt;nav.orbit(dt*.043);if(tourTime>10){const seq=lms.filter(l=>filter==='all'||category(l.id)===filter);go(seq[(seq.indexOf(selected)+1)%seq.length].id);tourTime=0;}}
 nav.update(dt);const env=atmos?.state||{night:0,wet:0,snow:0};if(renderer&&!loss){atmos?.update(camera,nav.target,dt,nav.distance);city?.update({...env,time:state.time,camera,dt});mirrorCanal?.(camera,city,['tiananmen','waterfront','ncpa'].includes(selected.id)&&nav.distance<750&&!software,state.date+state.time+state.weather,now);
  if(renderer.shadowMap.enabled){
   const t=nav.target,d=nav.distance;
   if(shadowDirty||!shadowStamp||Math.hypot(t.x-shadowStamp.x,t.y-shadowStamp.y,t.z-shadowStamp.z)>Math.min(3,Math.max(.2,d*.002))||Math.abs(d-shadowStamp.d)>1){
    renderer.shadowMap.needsUpdate=true;shadowStamp={x:t.x,y:t.y,z:t.z,d};shadowDirty=false;
   }
  }
  regionalLayer?.update(camera);renderer.render(scene,camera);}
 if(cpu)cpu.render(now);if(renderer||cpu)stage.classList.add("painted");if(now-tick>260){telemetry();tick=now;}
}
function fallback(reason){renderer=null;canvas.style.visibility='hidden';$('#backdrop').style.backgroundImage='url("'+coverFor(selected.id)+'")';$('#loading').hidden=true;stage.dataset.render='photo';$('#hint').textContent='实景照片浏览 · 三维模式需要 WebGL 2';$('#hint').style.display='block';for(const id of ['fly','walk','compass','zoomIn','zoomOut','home','envButton'])$('#'+id).disabled=true;$('#envButton').title='三维环境需要 WebGL 2';toast(reason||'当前设备无法创建 WebGL 2 场景，已显示可切换的实景照片和城市地图',8500);}
async function startCpu(){
 $('#loadingText').textContent='正在载入兼容三维场景';
 const {makeSoftware}=await import('./software.js');
 cpu=await makeSoftware({canvas,project,landmarks:lms,selected,camera,state});
 canvas.style.visibility='visible';stage.dataset.render='cpu3d';$('#loadingText').textContent='正在载入北京建筑与地表';
 go(selected.id,true,false);updateMode();applyEnvironment();requestAnimationFrame(animate);
 const status=await cpu.complete;city=status.city?cpu:null;
 Object.entries(state.layers).forEach(([key,value])=>city?.setLayer(key,value));stage.dataset.city=status.city?'ready':'missing';stage.dataset.terrain=status.terrain?'ready':'missing';ready=!!city;nav.safe();$('#loading').hidden=true;
 if(!city)toast('城区几何未能载入，地标仍可浏览');else if(!status.terrain)toast('远景地形未能载入');
}
async function start(){
 const options={antialias:devicePixelRatio<1.8,alpha:false,powerPreference:'high-performance'};let context;try{context=canvas.getContext('webgl2',options)}catch{}if(!context){await startCpu();return;}renderer=new T.WebGLRenderer({canvas,context,...options,logarithmicDepthBuffer:true});
 const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');software=Boolean(info&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)));
 pixel=software?.75:Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.3:1.65);
 renderer.setPixelRatio(pixel);renderer.shadowMap.enabled=!software;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;resize();
 atmos=makeAtmosphere(scene,renderer);mirrorCanal=canalReflection(scene,renderer);makeModel(selected);go(selected.id,true,false);applyEnvironment();
 const tmpGround=new T.Mesh(new T.PlaneGeometry(18000,20000),new T.MeshLambertMaterial({color:0x696b52}));tmpGround.rotation.x=-Math.PI/2;tmpGround.position.y=-.35;tmpGround.receiveShadow=true;scene.add(tmpGround);
 stage.dataset.render='webgl2';stage.dataset.software=String(software);$('#loadingText').textContent='读取地形与城区';requestAnimationFrame(animate);
 const relief=createTerrain({scene,project}).then(v=>{terrain=v;terrain.update(atmos.state)}).catch(e=>{console.warn('Terrain',e);toast('远景地形未能载入');});
 try{city=await createCity({scene,project,landmarks:lms,onProgress:(f,t)=>{$('#loadingText').textContent=t+'　'+Math.round(f*100)+'%';}});
  Object.entries(state.layers).forEach(([key,value])=>city.setLayer(key,value));nav.safe();scene.remove(tmpGround);tmpGround.geometry.dispose();tmpGround.material.dispose();
  for(const lm of lms){makeModel(lm);await new Promise(r=>setTimeout(r,0));}
  ready=true;stage.dataset.city='ready';stage.dataset.buildings=city.stats.buildingMeshes;telemetry();
 }catch(e){console.error('City load',e);stage.dataset.city='error';toast('城区载入失败，可刷新页面重试；仍可浏览地标',9000);}
 await relief;
 if(terrain){
  // The DEM already carries the regional imagery. Its flat fallback would obscure roofs in low terrain.
  const flat=city?.group.getObjectByName('Sentinel-2 region.webp');if(flat)flat.visible=false;
  regionalLayer=createRegionalLayer({scene,groundAt:(x,z)=>terrain.groundAt(x,z),onChange:()=>{stage.dataset.regionalBuildings=String(regionalLayer.stats.buildings);}});
  regionalLayer.setEnabled(state.layers.regionalBuildings);
 }
 $('#loading').hidden=true;stage.dataset.terrain=terrain?'ready':'missing';
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();loss=true;tourEnd();toast('图形上下文已中断，正在等待浏览器恢复',8000)});canvas.addEventListener('webglcontextrestored',()=>{loss=false;toast('三维场景已恢复')});
start().then(async()=>{
 const params=new URLSearchParams(location.search);
 if(params.has('region')){
  try{const index=await regionalInventory(),site=index.stops.find(s=>s.id===params.get('region'));
   if(site){nav.mapFly(site.lon,site.lat,1550,site);stage.dataset.observation=site.id;}
   else toast('该区域观测点不存在，可从城市地图选择。');
  }catch{toast('区域建筑覆盖索引暂时无法读取。');}
 }else if(params.get('mode')==='walk')nav.switchMode('walk');
 if(params.has('sources'))pan.open('sources');
 else if(params.has('field'))gallery.open(selected.id,selected.name);
}).catch(e=>{console.error('Scene startup',e);fallback('当前图形环境未能完成初始化，已切换至实景照片浏览')});
