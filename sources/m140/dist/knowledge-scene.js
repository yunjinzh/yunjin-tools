import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

// Deliberately schematic models: the teaching interface explains scale and dates.
const TOPIC_KEYS = ['astronomy', 'seasons', 'history'];
const SEASONS = {
  spring: { leaves: .48, color: '#b0cf6b', ground: '#627d61', fallen: .02 },
  summer: { leaves: 1, color: '#6eaa55', ground: '#496f58', fallen: .01 },
  autumn: { leaves: .72, color: '#e6b947', ground: '#7f7650', fallen: .82 },
  winter: { leaves: 0, color: '#c0a963', ground: '#6a7164', fallen: .22 }
};
function rng(seed=7281) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function glowTexture() {
  const size=48, pixels=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const d=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2));
    const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(Math.max(0,1-d)**2*180);
  }
  const texture=new THREE.DataTexture(pixels,size,size);texture.needsUpdate=true;return texture;
}
function textSprite(text, color='#e9dfc0') {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const c=canvas.getContext('2d');if(!c)return null;
  c.clearRect(0,0,512,128);c.textAlign='center';c.textBaseline='middle';
  c.shadowColor='#061b20';c.shadowBlur=10;c.font='500 52px AcademySerif, "Noto Serif CJK SC", serif';c.fillStyle=color;c.fillText(text,256,64);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false,transparent:true}));sprite.scale.set(2.8,.7,1);return sprite;
}
function disposeTree(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}

/** Builds genuine Three.js objects without a renderer; labels can be disabled in Node tests. */
export function buildKnowledgeModels({labels=true}={}) {
  const root=new THREE.Group();root.name='knowledge-models';
  const topics=Object.fromEntries(TOPIC_KEYS.map(k=>{const g=new THREE.Group();g.name=k;root.add(g);return[k,g];}));
  const objects=new Map(),targets=[],rings=[],gold=new THREE.MeshStandardMaterial({color:'#c9ac70',metalness:.68,roughness:.36});
  const jade=new THREE.MeshStandardMaterial({color:'#2b5b58',roughness:.47,metalness:.2});
  const rimMat=new THREE.MeshBasicMaterial({color:'#d2bb86',transparent:true,opacity:.45});
  const glow=glowTexture();let selected='sun',topic='astronomy',disposed=false;
  const solarUniforms={time:{value:0}};
  function mesh(geometry,material,parent,x=0,y=0,z=0) {const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);parent.add(o);return o;}
  function ring(parent,radius,x=0,y=0,z=0,color=gold) {const o=mesh(new THREE.TorusGeometry(radius,.018,5,100),color,parent,x,y,z);o.rotation.x=Math.PI/2;return o;}
  function label(parent,text,x,y,z=0,color) {if(!labels)return;const s=textSprite(text,color);if(s){s.position.set(x,y,z);parent.add(s);}return s;}
  function register(key,object,hitMeshes,marker) {object.userData.key=key;objects.set(key,{object,marker});for(const hit of hitMeshes){hit.userData.key=key;targets.push(hit);}if(marker)rings.push(marker);}
  function pedestal(parent,x,z,radius=.9) {
    mesh(new THREE.CylinderGeometry(radius,radius*1.08,.18,64),jade,parent,x,.04,z).receiveShadow=true;
    ring(parent,radius*.96,x,.145,z);const r=ring(parent,radius*1.14,x,.12,z,new THREE.MeshBasicMaterial({color:'#f0cd82',transparent:true,opacity:.85}));r.visible=false;return r;
  }
  // Sun, reflected moonlight, and a distant star. Sizes/distances are illustrative.
  const sky=topics.astronomy;
  const sun=new THREE.Group();sun.position.set(-3.1,1.8,0);sky.add(sun);
  const sunMaterial=new THREE.ShaderMaterial({uniforms:solarUniforms,vertexShader:'varying vec3 vP; varying vec3 vN; void main(){vP=position;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vP; varying vec3 vN; uniform float time; void main(){float grain=sin(vP.x*27.0+sin(vP.z*19.0+time*.12))*sin(vP.y*31.0+vP.x*8.0);float rim=pow(1.0-abs(vN.z),2.0);vec3 c=mix(vec3(1.0,.43,.10),vec3(1.0,.84,.37),.62+grain*.10);gl_FragColor=vec4(c+rim*.14,1.0);}'});
  const sunBall=mesh(new THREE.SphereGeometry(1.12,48,32),sunMaterial,sun);sunBall.name='sun-surface';
  const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:'#ffc361',transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));sunGlow.scale.set(5.7,5.7,1);sun.add(sunGlow);
  const sunLight=new THREE.PointLight('#ffdaa1',30,20,1.8);sunLight.position.copy(sun.position);sky.add(sunLight);
  register('sun',sun,[sunBall],pedestal(sky,-3.1,0,1.25));label(sky,'太阳',-3.1,.32,1.25);
  const moon=new THREE.Group();moon.position.set(0,1.6,.1);sky.add(moon);
  const moonMat=new THREE.MeshStandardMaterial({color:'#d1d1bf',roughness:.95,metalness:0,emissive:'#000000'});
  const moonBall=mesh(new THREE.SphereGeometry(.78,40,28),moonMat,moon);moonBall.name='moon-reflected-light';moonBall.castShadow=true;
  const random=rng(73),craterMat=new THREE.MeshStandardMaterial({color:'#969f95',roughness:1});
  for(let i=0;i<22;i++){const p=new THREE.Vector3(random()*2-1,random()*2-1,random()*2-1).normalize();const patch=mesh(new THREE.CircleGeometry(.035+random()*.09,12),craterMat,moon);patch.position.copy(p.multiplyScalar(.781));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),p.clone().normalize());}
  // A soft directional source from the Sun makes the illuminated side unambiguous.
  const moonLight=new THREE.DirectionalLight('#ffe9c0',2.1);moonLight.position.set(-4,2,0);moonLight.target=moon;sky.add(moonLight);
  register('moon',moon,[moonBall],pedestal(sky,0,.1,.95));label(sky,'月亮',0,.32,1.35);
  const star=new THREE.Group();star.position.set(3.1,2.15,-.4);sky.add(star);
  const starBall=mesh(new THREE.SphereGeometry(.58,32,24),new THREE.MeshBasicMaterial({color:'#e6f4ff'}),star);starBall.name='distant-star';
  const starGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:'#93cfff',transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));starGlow.scale.set(3.5,3.5,1);star.add(starGlow);
  register('star',star,[starBall],pedestal(sky,3.1,-.4,.8));label(sky,'远方恒星',3.1,.32,.9);
  for(let i=0;i<3;i++){const arc=ring(sky,1.65,-3.1,.18,0,rimMat);arc.scale.setScalar(1+i*.12);}
  // One deciduous ginkgo tree is retained while its phenology changes.
  const garden=topics.seasons;
  const soil=new THREE.MeshStandardMaterial({color:SEASONS.spring.ground,roughness:.9});
  mesh(new THREE.CylinderGeometry(3.45,3.7,.32,80),jade,garden,0,-.1,0);
  mesh(new THREE.CylinderGeometry(3.35,3.35,.06,80),soil,garden,0,.09,0).receiveShadow=true;ring(garden,3.46,0,.085,0);
  const bark=new THREE.MeshStandardMaterial({color:'#78684d',roughness:.87});
  const tree=new THREE.Group();tree.name='same-ginkgo-tree';garden.add(tree);
  function branch(a,b,thick){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),direction=bv.clone().sub(av);const m=mesh(new THREE.CylinderGeometry(thick*.45,thick,direction.length(),9),bark,tree);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());m.castShadow=true;return m;}
  branch([0,.1,0],[.06,3.55,0],.24);
  const tips=[];
  for(let i=0;i<13;i++){const angle=i*2.4,y=1.2+(i%5)*.4,r=1.2+(i%3)*.3;const tip=[Math.cos(angle)*r,y+1.1,Math.sin(angle)*r];branch([.02,y,0],tip,.10-(i%3)*.012);tips.push(tip);for(let j=0;j<2;j++){const end=[tip[0]+Math.cos(angle+j*.8)*.52,tip[1]+.48,tip[2]+Math.sin(angle+j*.8)*.52];branch(tip,end,.04);}}
  const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(-.25,.12,-.26,.27);leafShape.quadraticCurveTo(-.12,.39,0,.31);leafShape.quadraticCurveTo(.12,.39,.26,.27);leafShape.quadraticCurveTo(.25,.12,0,0);
  const leafGeometry=new THREE.ShapeGeometry(leafShape,4),leafMat=new THREE.MeshStandardMaterial({color:SEASONS.spring.color,side:THREE.DoubleSide,roughness:.7});
  const leafCount=500,leaves=new THREE.InstancedMesh(leafGeometry,leafMat,leafCount);leaves.name='ginkgo-crown';leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);tree.add(leaves);
  const autumnMat=new THREE.MeshStandardMaterial({color:'#d1a542',side:THREE.DoubleSide,roughness:.9});
  const fallen=new THREE.InstancedMesh(leafGeometry,autumnMat,120);fallen.name='fallen-ginkgo-leaves';fallen.instanceMatrix.setUsage(THREE.DynamicDrawUsage);garden.add(fallen);
  const leafPos=[],fallPos=[],dummy=new THREE.Object3D(),leafRand=rng(163);
  for(let i=0;i<leafCount;i++){const tip=tips[i%tips.length];leafPos.push({x:tip[0]+(leafRand()-.5)*1.25,y:tip[1]+leafRand()*.9-.15,z:tip[2]+(leafRand()-.5)*1.25,rx:leafRand()*Math.PI,ry:leafRand()*Math.PI*2,rz:leafRand()*Math.PI*2,s:.7+leafRand()*.65});}
  for(let i=0;i<120;i++){const a=leafRand()*Math.PI*2,r=Math.sqrt(leafRand())*3.05;fallPos.push({x:Math.cos(a)*r,y:.14,z:Math.sin(a)*r,rx:-Math.PI/2,ry:0,rz:a,s:.6+leafRand()*.5});}
  let season='spring',seasonFrom={...SEASONS.spring},seasonTo=SEASONS.spring,seasonMix=1,currentLeaves=seasonTo.leaves,currentFallen=seasonTo.fallen;
  const fromLeafColor=new THREE.Color(seasonTo.color),toLeafColor=new THREE.Color(seasonTo.color),fromSoilColor=new THREE.Color(seasonTo.ground),toSoilColor=new THREE.Color(seasonTo.ground);
  function updateLeafMatrices(mesh,list,fraction){list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.setScalar(p.s*Math.min(1,Math.max(0,(fraction*list.length-i)/12)));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
  function seasonalUpdate(dt,reduced){seasonMix=reduced?1:Math.min(1,seasonMix+dt*1.6);const t=seasonMix*seasonMix*(3-2*seasonMix);currentLeaves=THREE.MathUtils.lerp(seasonFrom.leaves,seasonTo.leaves,t);currentFallen=THREE.MathUtils.lerp(seasonFrom.fallen,seasonTo.fallen,t);leafMat.color.lerpColors(fromLeafColor,toLeafColor,t);soil.color.lerpColors(fromSoilColor,toSoilColor,t);updateLeafMatrices(leaves,leafPos,currentLeaves);updateLeafMatrices(fallen,fallPos,currentFallen);}
  seasonalUpdate(1,true);label(garden,'同一棵银杏树',0,.35,3.25);
  const seasonDots=[];
  for(const [i,key]of Object.keys(SEASONS).entries()){const a=-Math.PI*.66+i*.43,group=new THREE.Group();garden.add(group);const x=Math.cos(a)*3.02,z=Math.sin(a)*3.02;group.position.set(x,.32,z);const dot=mesh(new THREE.SphereGeometry(.16,20,16),new THREE.MeshStandardMaterial({color:SEASONS[key].color,roughness:.35,metalness:.2}),group);const r=ring(garden,.24,x,.18,z);r.visible=false;register(key,group,[dot],r);seasonDots.push(group);}
  // Discrete order and coexistence are intentionally separate displays.
  const history=topics.history,sequence=new THREE.Group(),parallel=new THREE.Group();sequence.name='sequence';parallel.name='coexistence';history.add(sequence,parallel);
  const stone=new THREE.MeshStandardMaterial({color:'#c8ccb2',roughness:.58,metalness:.11});
  const eraColors={xia:'#ddbe84',shang:'#c39166',zhou:'#9fbea3',song:'#b4c995',liao:'#d3ac76',jin:'#8fb5bf'};
  function tablet(parent,key,title,x,z){const group=new THREE.Group();group.position.set(x,0,z);parent.add(group);const box=mesh(new THREE.BoxGeometry(1.55,2.45,.35,1,1,1),stone.clone(),group,0,1.52,0);box.material.color.set(eraColors[key]);box.castShadow=true;const base=mesh(new THREE.CylinderGeometry(.95,1.1,.2,48),jade,group,0,.18,0);ring(group,.96,0,.3,0);const marker=ring(group,1.16,0,.28,0);marker.visible=false;mesh(new THREE.BoxGeometry(1.4,.035,.37),gold,group,0,2.56,0);mesh(new THREE.BoxGeometry(1.4,.035,.37),gold,group,0,.48,0);label(group,title,0,1.55,.27,'#193d36');register(key,group,[box,base],marker);return group;}
  ['xia','shang','zhou'].forEach((key,i)=>tablet(sequence,key,['夏','商','周'][i],(i-1)*3,0));
  const sequenceCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.3,.12,0),new THREE.Vector3(0,.12,0),new THREE.Vector3(4.3,.12,0)]);mesh(new THREE.TubeGeometry(sequenceCurve,32,.018,5,false),gold,sequence);label(sequence,'先后顺序',0,.3,1.9);
  // Coexistence is represented as separate lanes, not a false succession chain.
  const eraRows=[['song','宋',-2.6,1.2],['liao','辽',0,-.3],['jin','金',2.6,-1.8]];
  for(const [key,title,x,z]of eraRows){tablet(parallel,key,title,x,z);const points=[new THREE.Vector3(-4.1,.13,z),new THREE.Vector3(4.1,.13,z)];mesh(new THREE.TubeGeometry(new THREE.LineCurve3(...points),1,.018,5,false),rimMat,parallel);}
  label(parallel,'不同政权，有过并存',0,.32,2.65);
  let historyView='sequence';
  function select(key,{reduced=false}={}){
    if(disposed)return false;
    const valid=topic==='astronomy'?['sun','moon','star']:topic==='seasons'?Object.keys(SEASONS):['xia','shang','zhou','song','liao','jin'];
    if(!valid.includes(key))return false;selected=key;
    if(topic==='seasons'){
      season=key;seasonFrom={leaves:currentLeaves,fallen:currentFallen};seasonTo=SEASONS[key];fromLeafColor.copy(leafMat.color);toLeafColor.set(seasonTo.color);fromSoilColor.copy(soil.color);toSoilColor.set(seasonTo.ground);seasonMix=0;seasonalUpdate(0,reduced);
    }
    if(topic==='history'){historyView=['xia','shang','zhou'].includes(key)?'sequence':'coexistence';sequence.visible=historyView==='sequence';parallel.visible=!sequence.visible;}
    for(const [k,{marker}]of objects)if(marker)marker.visible=k===selected;
    return true;
  }
  function setTopic(next,{reduced=false}={}){if(disposed||!TOPIC_KEYS.includes(next))return false;topic=next;for(const[k,g]of Object.entries(topics))g.visible=k===topic;select(topic==='astronomy'?'sun':topic==='seasons'?season:historyView==='sequence'?'xia':'song',{reduced});return true;}
  setTopic('astronomy');
  return {root,topics,objects,hitTargets:targets,setTopic,select,
    update(dt=0,reduced=false){if(disposed)return;if(topic==='seasons'&&seasonMix<1)seasonalUpdate(Math.max(0,Math.min(dt,.1)),reduced);if(topic==='astronomy'&&!reduced)solarUniforms.time.value+=Math.max(0,Math.min(dt,.1));},
    getState(){return{topic,selected,season,historyView,leaves:currentLeaves,fallen:currentFallen,transitioning:topic==='seasons'&&seasonMix<1,disposed};},
    dispose(){if(disposed)return;disposed=true;disposeTree(root);root.removeFromParent();}
  };
}

/** One canvas per open laboratory. All learning choices also exist as HTML controls. */
export function createKnowledgeScene(container,{onSelect=()=>{},onStatus=()=>{},reduced=false}={}) {
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});}catch(error){throw new Error('当前设备无法开启 3D，可继续使用图解。',{cause:error});}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','知识物件：拖动转动视角，点选物件查看。也可使用旁边的文字按钮。');canvas.style.touchAction='none';canvas.style.display='block';canvas.style.width='100%';canvas.style.height='100%';
  const scene=new THREE.Scene();scene.background=new THREE.Color('#102f32');scene.fog=new THREE.Fog('#102f32',21,42);
  const camera=new THREE.PerspectiveCamera(39,1,.1,80),target=new THREE.Vector3(0,1.55,0);
  const controls=new OrbitControls(camera,canvas);controls.target.copy(target);controls.enablePan=false;controls.enableDamping=!reduced;controls.dampingFactor=.09;controls.rotateSpeed=.55;controls.zoomSpeed=.65;controls.minPolarAngle=.22;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=8;controls.maxDistance=25;
  const hemi=new THREE.HemisphereLight('#a1c5bd','#202e2e',1.15);scene.add(hemi);
  const keyLight=new THREE.DirectionalLight('#ffe8b7',2.7);keyLight.position.set(-4,9,6);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);Object.assign(keyLight.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:28});keyLight.shadow.normalBias=.035;scene.add(keyLight);
  const rim=new THREE.DirectionalLight('#74b6bf',1.4);rim.position.set(4,5,-5);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(8.8,96),new THREE.MeshStandardMaterial({color:'#153c3b',metalness:.18,roughness:.73}));floor.rotation.x=-Math.PI/2;floor.position.y=-.31;floor.receiveShadow=true;scene.add(floor);
  const models=buildKnowledgeModels();scene.add(models.root);
  const starRandom=rng(61),positions=[];for(let i=0;i<150;i++){positions.push((starRandom()-.5)*30,4+starRandom()*10,-7-starRandom()*12);}
  const pointGeo=new THREE.BufferGeometry();pointGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const dust=new THREE.Points(pointGeo,new THREE.PointsMaterial({color:'#cfc7a1',size:.028,transparent:true,opacity:.5,depthWrite:false}));scene.add(dust);
  container.appendChild(canvas);
  let paused=false,disposed=false,lost=false,raf=null,lastTime=0,pointerCandidate=null,topic='astronomy';
  const pointers=new Set(),raycaster=new THREE.Raycaster(),point=new THREE.Vector2();
  let resizeObserver;
  function notify(available,message){try{onStatus({available,message});}catch(error){console.warn('Knowledge status callback',error);}}
  function halt(){if(raf!==null)cancelAnimationFrame(raf);raf=null;lastTime=0;}
  function frame(now){raf=null;if(disposed||paused||lost)return;const dt=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;models.update(dt,reduced);const cameraChanged=controls.update();try{renderer.render(scene,camera);}catch(error){lost=true;halt();notify(false,'3D 暂时中断，图解和题目仍可继续。');return;}if((topic==='astronomy'&&!reduced)||models.getState().transitioning||cameraChanged)start();else lastTime=0;}
  function start(){if(!disposed&&!paused&&!lost&&raf===null)raf=requestAnimationFrame(frame);}
  function resize(){if(disposed)return;const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();start();}
  function reset(){if(disposed)return;const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);const portrait=width/height<1.15;camera.fov=portrait?48:39;camera.position.set(topic==='seasons'?6.7:5.7,topic==='seasons'?5.4:6.8,portrait?16.8:13.5);controls.target.copy(target);controls.minDistance=portrait?11:8;camera.updateProjectionMatrix();controls.update();}
  function visible(object){for(let p=object;p;p=p.parent)if(!p.visible)return false;return true;}
  function pick(e){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return null;point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);scene.updateMatrixWorld(true);camera.updateMatrixWorld();raycaster.setFromCamera(point,camera);return raycaster.intersectObjects(models.hitTargets.filter(visible),false)[0]?.object.userData.key??null;}
  function down(e){if(disposed||paused||lost||e.button!==0)return;pointers.add(e.pointerId);if(pointers.size===1)pointerCandidate={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,key:pick(e)};else pointerCandidate=null;}
  function move(e){if(pointerCandidate?.id===e.pointerId&&Math.hypot(e.clientX-pointerCandidate.x,e.clientY-pointerCandidate.y)>7)pointerCandidate.moved=true;if(e.pointerType!=='touch'&&!paused&&!lost)canvas.style.cursor=pick(e)?'pointer':'grab';}
  function up(e){const candidate=pointerCandidate,single=pointers.size===1;pointers.delete(e.pointerId);pointerCandidate=null;if(disposed||paused||lost||!single||!candidate||candidate.id!==e.pointerId||candidate.moved||!candidate.key||Math.hypot(e.clientX-candidate.x,e.clientY-candidate.y)>7)return;const key=pick(e);if(key===candidate.key){models.select(key,{reduced});start();onSelect(key);}}
  function cancel(e){pointers.delete(e.pointerId);pointerCandidate=null;}
  function clearPointers(){pointers.clear();pointerCandidate=null;}
  function contextLost(e){e.preventDefault();if(disposed)return;lost=true;controls.enabled=false;clearPointers();halt();notify(false,'3D 暂时中断，图解和题目仍可继续。');}
  function contextRestored(){if(disposed)return;lost=false;controls.enabled=!paused;resize();notify(true,'3D 已恢复。拖动观察，点物件认识它。');start();}
  const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['webglcontextlost',contextLost],['webglcontextrestored',contextRestored]];
  for(const[name,handler]of listeners)canvas.addEventListener(name,handler);
  window.addEventListener('blur',clearPointers);
  controls.addEventListener('change',start);controls.addEventListener('start',start);
  resizeObserver=new ResizeObserver(()=>{resize();reset();});resizeObserver.observe(container);
  function setTopic(next){if(disposed||!TOPIC_KEYS.includes(next))return;topic=next;models.setTopic(next,{reduced});hemi.intensity=next==='astronomy'?.26:1.15;keyLight.intensity=next==='astronomy'?.15:2.7;rim.intensity=next==='astronomy'?.18:1.4;reset();start();}
  resize();setTopic('astronomy');start();notify(true,'拖动观察，点物件认识它。');
  return {setTopic,select(key){models.select(key,{reduced});start();},setPaused(value){paused=Boolean(value);controls.enabled=!paused&&!lost;clearPointers();if(paused)halt();else start();},setReduced(value){reduced=Boolean(value);controls.enableDamping=!reduced;models.update(0,reduced);start();},reset,
    dispose(){if(disposed)return;disposed=true;halt();resizeObserver.disconnect();window.removeEventListener('blur',clearPointers);for(const[name,handler]of listeners)canvas.removeEventListener(name,handler);controls.removeEventListener('change',start);controls.removeEventListener('start',start);controls.dispose();models.dispose();disposeTree(scene);renderer.dispose();canvas.remove();clearPointers();}
  };
}
