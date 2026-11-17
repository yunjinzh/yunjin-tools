import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {SCENES} from './data.js';
import {SurfaceLibrary} from './materials.js';
import {batchMeshes} from './mesh-batching.js';
import {RobotRig} from './robot-rig.js';
import {RenderPipeline} from './render-pipeline.js';
import {WallBranding} from './wall-brand.js';
import {SimReadyLibrary} from './simready-library.js';
const V=THREE.Vector3;
const materials=new Map(), geometries=new Map();
function material(color,metal=.05,rough=.65){if(color?.isMaterial)return color;const k=color+'-'+metal+'-'+rough;if(!materials.has(k))materials.set(k,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(k);}
function rounded(w,h,d,r=.05){const key=[w,h,d,r].join(',');if(geometries.has(key))return geometries.get(key);r=Math.min(r,w/3,h/3,d/3);const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});g.translate(0,0,-d/2+r);g.userData.shared=true;geometries.set(key,g);return g;}
function mesh(g,color,x,y,z,parent,metal,rough){const m=new THREE.Mesh(g,material(color,metal,rough));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent?.add(m);return m;}
function box(parent,w,h,d,x,y,z,color,r=0){return mesh(r?rounded(w,h,d,r):new THREE.BoxGeometry(w,h,d),color,x,y,z,parent);}
function cylinder(parent,rt,rb,h,x,y,z,color,segments=24){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),color,x,y,z,parent);}
function sphere(parent,r,x,y,z,color,sx=1,sy=1,sz=1){const s=mesh(new THREE.SphereGeometry(r,20,16),color,x,y,z,parent);s.scale.set(sx,sy,sz);return s;}
function textureLabel(text,bg='#e9e0ce',fg='#403d33',width=512,height=256){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 '+Math.round(height*.22)+'px sans-serif';text.split('\n').forEach((line,i,arr)=>ctx.fillText(line,width/2,height/2+(i-(arr.length-1)/2)*height*.3));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function sign(parent,text,x,y,z,w=1.4,h=.5,bg='#f3f3e9',fg='#34463d'){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textureLabel(text,bg,fg),side:THREE.DoubleSide}));m.position.set(x,y,z);parent.add(m);return m;}
function lineSegment(parent,a,b,color,thickness=.04){const d=new V().subVectors(b,a),m=cylinder(parent,thickness,thickness,d.length(),0,0,0,color,12);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());return m;}
export class World{
 constructor(canvas,rendererFactory=null){
  this.canvas=canvas;this.headless=!!rendererFactory;this.assetReady=this.headless;
  this.surfaces=new SurfaceLibrary();this.assets=new SimReadyLibrary();this.branding=new WallBranding();this.scene=new THREE.Scene();
  this.camera=new THREE.PerspectiveCamera(40,1,.05,100);
  this.renderer=rendererFactory?rendererFactory(canvas):new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.08;
  this.controls.maxPolarAngle=Math.PI*.485;this.controls.minDistance=1.2;this.controls.maxDistance=28;
  this.controls.target.set(0,.4,0);
  this.environment=new THREE.Group();this.scene.add(this.environment);
  this.labelGroup=new THREE.Group();this.scene.add(this.labelGroup);
  this.sensorGroup=new THREE.Group();this.scene.add(this.sensorGroup);this.sensorGroup.visible=false;
  this.robot=this.createRobot();this.scene.add(this.robot);
  this.selection=new THREE.Box3Helper(new THREE.Box3(),0xc79c5d);this.selection.visible=false;this.scene.add(this.selection);
  this.raycaster=new THREE.Raycaster();this.cameraMode='orbit';this.camGoal=null;this.labelsEnabled=false;this.selected=null;this.gait=0;
  this.pipeline=new RenderPipeline(this);this.resize();new ResizeObserver(()=>this.resize()).observe(canvas.parentElement);this.setCamera('orbit',true);
  this.ready=this.headless?Promise.resolve(this):Promise.all([this.rig.load(),this.surfaces.load(this.renderer.capabilities.getMaxAnisotropy()),this.pipeline.load(),this.assets.load(this.renderer.capabilities.getMaxAnisotropy()),this.branding.load(this.renderer.capabilities.getMaxAnisotropy())]).then(()=>{this.assetReady=true;this.pose(0,0);return this;});
 }
 surface(name){return this.surfaces.get(name);}
 configureRender(settings){return this.pipeline.configure(settings);}

 clearGroup(group){const sharedG=new Set(geometries.values()),sharedM=new Set(materials.values());group.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!o.geometry.userData.shared&&!sharedG.has(o.geometry))o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m&&!m.userData.shared&&!sharedM.has(m)){if(m.map&&!m.map.userData.shared)m.map.dispose();m.dispose();}});group.clear();}
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();if(r.width<1||r.height<1)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.pipeline?.resize(r.width,r.height);}
 obstacle(x,z,w,d,meshObj,custom=false){const obj={x,z,w,d,mesh:meshObj,custom};this.obstacles.push(obj);return obj;}
 label(text,x,y,z,bg='#ffffff'){const t=textureLabel(text,bg,'#314c41',512,128);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,opacity:.94}));s.position.set(x,y,z);s.scale.set(1.55,.39,1);this.labelGroup.add(s);return s;}
 load(id,seed=1){if(this.entities?.cup){const cup=this.entities.cup.mesh;cup.removeFromParent();this.clearGroup(cup);}this.cupGrip=null;this.id=id;this.seed=seed;this.clearGroup(this.holdAnchor);this.clearGroup(this.environment);this.clearGroup(this.labelGroup);this.clearGroup(this.sensorGroup);this.entities={};this.targets={};this.obstacles=[];this.select(null);this.held=null;
 this.architecture(id);
 if(id==='warehouse')this.warehouse();if(id==='cafe')this.cafe();if(id==='restaurant')this.restaurant();batchMeshes(this.environment);
 this.robot.position.set(...[SCENES[id].robot[0],0,SCENES[id].robot[1]]);this.robot.rotation.y=Math.PI;this.robot.visible=true;this.pose(0,0);this.labelGroup.visible=this.labelsEnabled;this.setCamera('orbit');this.updateSensors();this.pipeline.sceneChanged(id);return this;
 }
 architecture(id){
  const e=this.environment,m=n=>this.surface(n);
  box(e,14,.22,10,0,-.13,0,m('blackSteel'),.035);
  this.floor=box(e,14,.045,10,0,-.002,0,m(id==='cafe'?'woodFloor':'concrete'));this.floor.userData.floor=true;
  if(id==='restaurant'){
   // Large stone slabs with restrained, physically sized grout joints.
   for(let x=-6;x<=6;x+=2)box(e,.009,.002,10,x,.023,0,'#666760');
   for(let z=-4;z<=4;z+=2)box(e,14,.002,.009,0,.023,z,'#666760');
  }
  box(e,14,1.85,.18,0,.925,-5,m('plaster'));
  box(e,14,.46,.18,0,3.67,-5,m('plaster'));
  box(e,.18,3.9,10,-7,1.95,0,m('plaster'));
  box(e,14,.12,.07,0,.06,-4.88,m('blackSteel'));
  box(e,.07,.12,10,-6.88,.06,0,m('blackSteel'));
  for(const x of [-6.95,-2.3,2.3,6.95])box(e,.16,1.6,.18,x,2.64,-5,m('plaster'));
  for(const x of [-4.62,0,4.62]){
   const windowGlass=new THREE.MeshPhysicalMaterial({color:'#a6bfcb',roughness:.1,metalness:.25,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide});
   const pane=box(e,4.43,1.54,.035,x,2.63,-5,windowGlass);pane.castShadow=false;
   for(const dx of [-2.24,0,2.24])box(e,.04,1.62,.1,x+dx,2.63,-4.94,m('blackSteel'));
   for(const y of [1.85,2.65,3.42])box(e,4.5,.035,.1,x,y,-4.94,m('blackSteel'));
   box(e,4.55,.055,.22,x,1.83,-4.88,m('stone'));
  }
  if(id==='warehouse'){
   for(const x of [-6.8,0,6.8]){box(e,.17,3.9,.17,x,1.95,-4.7,m('paintSteel'));box(e,.24,.24,.28,x,.12,-4.7,m('beam'));}
   for(const z of [-2,2.8]){
    box(e,13.6,.1,.1,0,3.62,z,m('steel'));
    for(const x of [-3.4,3.4])this.fixture(x,3.47,z,2.2,.16,false);
   }
   // Loading-door slats and conduit sit flush to the perimeter wall.
   box(e,.06,2.6,2.4,-6.87,1.3,.7,m('steel'));
   for(let y=.15;y<2.6;y+=.19)box(e,.08,.016,2.36,-6.82,y,.7,m('blackSteel'));
   for(const z of [-.57,1.97])box(e,.14,2.75,.1,-6.8,1.38,z,m('paintSteel'));
   this.branding.sign(e,-6.74,2.98,.7,1.9,.65);
   lineSegment(e,new V(-6.82,3.2,-4.6),new V(-6.82,3.2,4.6),m('steel'),.018);
  }else{
   box(e,11.8,.06,.22,0,1.55,-4.72,m('wood'));
   for(let x=-5.7;x<5.8;x+=.44){
    const g=this.cupShape(e,x,1.59,-4.7,.045);g.scale.setScalar(.9);
   }
   for(const x of [-4,0,4])this.fixture(x,2.9,1.75,.6,.6,true);
   for(const x of [-2,2])this.fixture(x,3.15,-2.6,1.4,.12,false);
   for(let z=-4.6;z<4.8;z+=.19)box(e,.04,1.05,.026,-6.87,.55,z,m('wood'));
   this.branding.sign(e,-6.82,2.6,1.3);
  }
 }
 fixture(x,y,z,w,d,pendant){
  const e=this.environment,m=n=>this.surface(n);
  const bulb=new THREE.MeshStandardMaterial({color:'#fff3d8',emissive:'#ffe4b0',emissiveIntensity:3,roughness:.4});
  if(pendant){
   cylinder(e,.008,.008,3.8-y,x,(3.8+y)/2,z,m('blackSteel'),8);
   cylinder(e,.09,w*.5,.24,x,y,z,m(this.id==='restaurant'?'brass':'blackSteel'),32);
   cylinder(e,w*.43,w*.43,.012,x,y-.126,z,bulb,32);
  }else{box(e,w,.065,d,x,y,z,m('blackSteel'));box(e,w*.94,.015,d*.7,x,y-.04,z,bulb);}
  const light=new THREE.RectAreaLight('#ffe2b9',2.2,w,d);light.position.set(x,y-.16,z);light.lookAt(x,0,z);light.userData.fixture=true;e.add(light);
 }
 rack(x){
  const e=this.environment,m=n=>this.surface(n);
  if(this.assets.has('rack')){
   this.assets.place(e,'rack',x,.025,-3.72,{scale:1.1});
   // A reachable middle picking deck supplements the two original USD shelves.
   box(e,4.25,.045,2.05,x,1.0575,-3.72,m('steel'));
   for(const z of [-4.78,-2.66])box(e,4.25,.1,.05,x,1.015,z,m('beam'));
   this.obstacle(x,-3.72,4.4,2.274);
   sign(e,x<0?'A-01 / GENERAL':'B-02 / FRAGILE',x,2.5,-2.56,1.6,.16,'#263540','#e8c988');
   return;
  }
  for(const dx of [-2.25,2.25])for(const z of [-4.15,-3.03]){
   box(e,.085,2.9,.085,x+dx,1.45,z,m('paintSteel'));
   box(e,.21,.026,.2,x+dx,.036,z,m('steel'));
   for(let y=.25;y<2.85;y+=.16)box(e,.025,.044,.004,x+dx,y,z+.044,m('blackSteel'));
  }
  for(const dx of [-2.25,2.25])for(const y of [.25,1.1,1.95]){
   lineSegment(e,new V(x+dx,y,-4.15),new V(x+dx,y+.78,-3.03),m('steel'),.018);
   lineSegment(e,new V(x+dx,y,-3.03),new V(x+dx,y+.78,-4.15),m('steel'),.018);
  }
  for(const y of [.22,1.02,1.88,2.72]){
   box(e,4.65,.065,1.25,x,y,-3.6,m('steel'));
   for(const z of [-4.23,-2.96])box(e,4.65,.125,.065,x,y,z,m('beam'));
   for(const dx of [-2.18,2.18]){const bolt=cylinder(e,.015,.015,.008,x+dx,y,-2.921,m('chrome'),8);bolt.rotation.x=Math.PI/2;}
  }
  this.obstacle(x,-3.6,4.65,1.25);
  sign(e,x<0?'A-01 / GENERAL':'B-02 / FRAGILE',x,2.58,-2.915,2,.22,'#263540','#e8c988');
 }

 carton(id,name,x,y,z,w,h,d,color='#ba925f',fragile=false){
  const g=new THREE.Group();g.position.set(x,y,z);
  const imported=this.assets.place(g,fragile||['w4','w8'].includes(id)?'parcel':'carton',0,0,0,{size:[w,h,d]});
  if(!imported){box(g,w,h,d,0,h/2,0,this.surface('cardboard'),.008);
  box(g,.075,.004,d+.006,0,h+.004,0,this.surface('tape'));box(g,.075,h,.003,0,h/2,d/2+.005,this.surface('tape'));
  const lab=sign(g,id.toUpperCase()+' / '+(fragile?'HANDLE WITH CARE':'GENERAL CARGO')+'\n'+(fragile?'FRAGILE  /  UP':'LOT 026  /  UP'),w*.12,h*.59,d/2+.009,w*.55,h*.3,'#e4dfce','#292b28');
  for(let i=0;i<24;i++)box(g,(i%3+1)*w*.003,h*.09,.002,-w*.16+i*w*.012,h*.31,d/2+.01,'#343633');
  box(g,w,.002,.004,0,h+.004,0,'#796443');
  if(fragile){sign(g,'↑  ↑',-w*.3,h*.58,d/2+.012,w*.18,h*.23,'#bba079','#473c30');}
  }
  this.environment.add(g);const entity={id,name,mesh:g,w,h,d,weight:Math.round(w*h*d*12*10)/10,fragile,kind:'cargo',initial:[x,y,z],status:'待搬运'};
  g.traverse(o=>o.userData.entityId=id);this.entities[id]=entity;batchMeshes(g,true);return g;
 }

 pallet(x,z,w=2,d=1.3){
  const e=this.environment,m=this.surface('wood');
  if(this.assets.has('pallet')){
   const count=w>2.5?2:1;
   for(let i=0;i<count;i++)this.assets.place(e,'pallet',x+(i-(count-1)/2)*w/count,.025,z,{size:[w/count-.025,.295,d]});
   return;
  }
  for(const y of [.08,.26])for(let i=0;i<6;i++)box(e,w,.065,d/7,x,y,z+(i-2.5)*d/6,m);
  for(const dx of [-w*.4,0,w*.4])box(e,.13,.18,d,x+dx,.17,z,m);
  for(const dx of [-w*.4,w*.4])for(let i=0;i<6;i++)cylinder(e,.008,.008,.002,x+dx,.294,z+(i-2.5)*d/6,this.surface('steel'),6);
 }

 warehouse(){const e=this.environment;this.rack(-3);this.rack(3);
 const specs=[['w1','小型零配件箱',-4.5,1.08,-3.5,.55,.5,.55,'#ad9970'],['w2','中型日用商品箱',-3,1.08,-3.5,.82,.66,.65,'#bd9767'],['w3','精密仪器 · 易碎',-1.5,1.08,-3.5,.95,.62,.72,'#819881',true],['w4','电子设备箱',1.5,1.08,-3.5,.7,.54,.65,'#a68b68'],['w5','大型家居商品',3,1.08,-3.5,1.05,.78,.8,'#c6a572'],['w6','轻型食品箱',4.5,1.08,-3.5,.6,.58,.62,'#b68c58'],['w7','待入库商品',-4.5,.32,2.5,.78,.7,.65,'#bb9462'],['w8','日用品补货箱',-3.2,.32,2.5,.65,.52,.58,'#718d82'],['w9','小件快递',-5.4,.32,2.5,.5,.42,.5,'#c3a578']];
 specs.forEach(s=>{if(this.seed!==1){const idx=Number(s[0].slice(1));s[5]*=.85+((this.seed*13+idx*7)%30)/100;s[6]*=.85+((this.seed*17+idx*3)%25)/100;}this.carton(...s);});
 for(const x of [-4.5,-3,-1.5,1.5,3,4.5]){
  if(this.assets.has('rack')){this.decorBox(x,.6091,-3.65,.9,.34,.8);this.decorBox(x,2.6749,-3.65,.75,.42,.7);}
  else{this.decorBox(x,.27,-3.6,.9,.66,.8);this.decorBox(x,1.94,-3.6,.75,.62,.7);}
 }
 if(this.assets.place(e,'pallet-jack',5.8,.025,-.2,{scale:.85,rotation:-Math.PI/2}))this.obstacle(5.8,-.2,1.39,.56);
 this.pallet(-4.25,2.5,3.4,1.35);this.obstacle(-4.25,2.5,3.4,1.35);this.label('收货暂存区',-4.3,1.7,2.5);this.table(3.8,2.6,3.1,1.25,'#517c6b',false);this.targets.out0={x:2.9,y:1.03,z:2.6};this.targets.out1={x:3.8,y:1.03,z:2.6};this.targets.out2={x:4.8,y:1.03,z:2.6};this.targets.shelf={x:-3,y:1.08,z:-3.5};this.label('出库工作台',3.8,1.8,2.6);
 for(const z of [-1.3,3.7])for(let x=-1.8;x<6;x+=.7)box(e,.42,.01,.035,x,.035,z,'#d9b872');
 this.label('A 区 / 日用商品',-3,3.05,-3.5);this.label('B 区 / 多规格商品',3,3.05,-3.5);this.plant(6,-4.1);this.plant(-6.3,4.0);}
 decorBox(x,y,z,w,h,d){
  const e=this.environment,g=new THREE.Group();e.add(g);g.position.set(x,y,z);
  if(this.assets.place(g,Math.round(x*2)%3===0?'parcel':'carton',0,0,0,{size:[w,h,d]}))return;
  box(g,w,h,d,0,h/2,0,this.surface('cardboard'),.006);box(g,.07,.004,d,0,h+.003,0,this.surface('tape'));
  sign(g,'LOGISTICS / '+Math.abs(Math.round(x*2))+'\n↑  DRY STORAGE',.12,h/2,d/2+.006,w*.48,h*.26,'#e5e0d4','#46443b');
 }

 table(x,z,w=1.6,d=1.3,color='#c6a77d',chairs=true){
  const e=this.environment,m=n=>this.surface(n),top=chairs?m('wood'):m('steel');
  box(e,w,.07,d,x,1.005,z,top,.015);
  for(const dx of [-w*.37,w*.37])for(const dz of [-d*.34,d*.34]){
   box(e,.045,.96,.045,x+dx,.51,z+dz,m('blackSteel'));
   cylinder(e,.032,.032,.045,x+dx,.042,z+dz,m('rubber'),12);
  }
  box(e,w*.75,.05,.04,x,.8,z,m('blackSteel'));this.obstacle(x,z,w,d);
  if(chairs){for(const side of [-1,1])this.chair(x,z+side*(d/2+.4),side>0?0:Math.PI);}
  else{box(e,w*.8,.035,d*.7,x,.27,z,m('steel'));this.pallet(x,z,w*.68,d*.55);}
  return {x,y:1.05,z};
 }

 roundTable(x,z,n){
  const e=this.environment,m=v=>this.surface(v);
  cylinder(e,.9,.9,.055,x,1.023,z,m('wood'),64);
  cylinder(e,.065,.1,.98,x,.5,z,m('blackSteel'));
  cylinder(e,.43,.43,.025,x,.035,z,m('blackSteel'),48);
  this.obstacle(x,z,1.8,1.8);this.chair(x,z+1.3,0);this.targets['table'+n]={x:x-.11,y:1.06,z:z-.81};
  this.label(String(n).padStart(2,'0')+' 号桌',x,1.8,z);this.vase(x+.45,1.06,z);
  box(e,.15,.006,.2,x-.38,1.056,z+.15,m('cloth'));this.cutlery(x-.44,1.065,z+.15);
 }

 chair(x,z,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;this.environment.add(g);const m=n=>this.surface(n);
  box(g,.48,.07,.45,0,.49,0,m('leather'),.025);box(g,.48,.38,.045,0,.71,.21,m('leather'),.026);
  for(const dx of [-.2,.2])for(const dz of [-.18,.18]){
   lineSegment(g,new V(dx,.47,dz),new V(dx*1.16,.03,dz*1.2),m('blackSteel'),.015);
  }
  for(const dx of [-.2,.2])lineSegment(g,new V(dx,.48,.18),new V(dx,.87,.215),m('blackSteel'),.012);
  this.obstacle(x,z,.6,.6);
 }

 bar(){
  const e=this.environment,m=n=>this.surface(n);
  box(e,11,.92,1.2,0,.48,-2.85,m(this.id==='restaurant'?'blackSteel':'wood'),.012);
  box(e,11.2,.075,1.36,0,1.037,-2.85,m(this.id==='restaurant'?'steel':'stone'),.014);
  if(this.id==='cafe')for(let x=-5.2;x<5.2;x+=.08)box(e,.014,.75,.018,x,.52,-2.235,m('wood'));
  else for(let x=-5.25;x<5.3;x+=1.5){box(e,1.4,.75,.018,x,.52,-2.235,m('steel'));box(e,.3,.022,.035,x,.8,-2.21,m('blackSteel'));}
  box(e,10.9,.09,.04,0,.065,-2.22,m('blackSteel'));this.obstacle(0,-2.85,11.2,1.36);
 }

 cafe(){
  const e=this.environment,m=n=>this.surface(n);this.bar();
  for(const x of [-5,5.5])this.plant(x,-4.25);
  // Preserve the published floor-standing appliance's actual scale.
  if(this.assets.place(e,'coffee-machine',6.02,.025,-3.35,{rotation:-Math.PI/2}))this.obstacle(6.02,-3.35,.82,.8);
  // Two-group commercial espresso machine: brushed panels, boiler groups, steam wand and drip tray.
  box(e,1.18,.46,.57,-2,1.37,-2.96,m('steel'),.025);
  box(e,1.1,.36,.025,-2,1.4,-2.66,m('blackSteel'),.008);
  box(e,1.2,.055,.58,-2,1.115,-2.81,m('steel'),.012);
  for(let x=-2.52;x<-1.45;x+=.05)box(e,.012,.007,.39,x,1.147,-2.75,m('blackSteel'));
  for(const x of [-2.3,-1.73]){
   const dial=cylinder(e,.043,.043,.018,x,1.47,-2.638,m('ceramic'),32);dial.rotation.x=Math.PI/2;
   lineSegment(e,new V(x,1.47,-2.625),new V(x+.021,1.49,-2.625),m('blackSteel'),.003);
   cylinder(e,.065,.065,.07,x,1.25,-2.61,m('chrome'));
   lineSegment(e,new V(x,1.23,-2.61),new V(x,1.23,-2.39),m('rubber'),.018);
   cylinder(e,.011,.011,.045,x,1.19,-2.61,m('chrome'),12);
  }
  lineSegment(e,new V(-1.45,1.39,-2.66),new V(-1.34,1.16,-2.49),m('chrome'),.009);
  box(e,1.08,.018,.45,-2,1.614,-2.97,m('blackSteel'));
  for(let i=0;i<4;i++)this.cupShape(e,-2.4+i*.25,1.63,-2.95,.043);
  sign(e,'FIELD / ESPRESSO',-2,1.545,-2.638,.42,.055,'#252b30','#ece6d8');
  // Coffee grinder, visible hopper and actual-sized tools.
  cylinder(e,.115,.145,.31,-3.05,1.245,-2.9,m('blackSteel'),32);
  cylinder(e,.11,.08,.19,-3.05,1.5,-2.9,m('glass'),32);
  cylinder(e,.1,.1,.075,-3.05,1.47,-2.9,'#34251b',32);
  cylinder(e,.12,.12,.018,-3.05,1.6,-2.9,m('blackSteel'));
  box(e,.09,.04,.15,-3.05,1.3,-2.73,m('steel'));
  this.label('01 / 萃取工作站',-2,2.05,-2.8);
  if(!this.assets.place(e,'jug',0,1.08,-2.7,{height:.16})){
   cylinder(e,.065,.052,.14,0,1.15,-2.7,m('steel'));
   const jugHandle=new THREE.Mesh(new THREE.TorusGeometry(.052,.007,8,20,Math.PI*1.5),m('steel'));jugHandle.position.set(.075,1.16,-2.7);e.add(jugHandle);
  }
  this.assets.place(e,'fridge',.95,1.08,-2.93,{height:.52,rotation:-Math.PI/2});
  if(this.assets.has('kitchen'))this.backKitchen();
  if(this.assets.has('croissant'))this.pastryDisplay();
  box(e,.14,.23,.12,.42,1.195,-2.85,m('ceramic'),.004);
  sign(e,'MILK',.42,1.22,-2.787,.1,.06,'#e9e4db','#3c474b');
  this.label('02 / 牛奶 · 热水',.2,1.9,-2.8);
  for(let i=0;i<4;i++)this.cupShape(e,-4.5+i*.2,1.08,-3.05,.055);
  const g=this.cupShape(e,-4.4,1.08,-2.26,.065,true);
  this.entities.cup={id:'cup',name:'陶瓷咖啡杯',mesh:g,w:.18,h:.145,d:.14,weight:.35,kind:'cup',initial:[-4.4,1.08,-2.26],status:'空杯',liquid:g.userData.liquid,foam:g.userData.foam};
  g.traverse(o=>o.userData.entityId='cup');this.label('取杯区',-4.4,1.7,-2.7);
  for(const [i,x] of [-4,0,4].entries())this.roundTable(x,2.5,i+1);
  this.plant(6,3.9);this.vase(4.5,1.08,-2.8);
  sign(e,'ESPRESSO   /   AMERICANO\nCAPPUCCINO   /   LATTE',3.6,2.45,-4.87,1.8,.8,'#2f3634','#dfd3b9');
 }

 backKitchen(){
  const e=this.environment;
  for(const x of [-3.5,1.8])this.assets.place(e,'kitchen',x,.025,-4.37,{rotation:-Math.PI/2,scale:.87});
  this.assets.place(e,'fridge',5.1,.025,-4.2,{scale:1.16,rotation:-Math.PI/2});
  // These fixtures sit behind the existing full-width counter collision zone.
  for(const x of [-3.5,1.8])this.obstacle(x,-4.37,1.59,.54);
  this.obstacle(5.1,-4.2,.53,.57);
  if(this.id==='restaurant'){
   const deck=.025+.918*.87;
   box(e,.48,.018,.32,-3.2,deck+.009,-4.23,this.surface('wood'),.012);
   this.assets.place(e,'baguette',-3.2,deck+.018,-4.23,{scale:1.2,rotation:Math.PI/2});
  }
 }

 pastryDisplay(){
  const e=this.environment,m=n=>this.surface(n),x=3.05,z=-2.84;
  box(e,1.94,.035,.72,x,1.099,z,m('stone'),.012);
  const glass=new THREE.MeshPhysicalMaterial({color:'#d9e4e8',roughness:.09,metalness:0,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide});
  for(const dx of [-.98,.98]){const panel=box(e,.008,.43,.72,x+dx,1.33,z,glass);panel.castShadow=false;}
  const front=box(e,1.96,.43,.008,x,1.33,z+.36,glass);front.castShadow=false;
  const top=box(e,1.97,.008,.73,x,1.545,z,glass);top.castShadow=false;
  for(const dx of [-.98,.98])for(const dz of [-.36,.36])box(e,.012,.43,.012,x+dx,1.33,z+dz,m('brass'));
  for(const dz of [-.36,.36])box(e,1.97,.012,.012,x,1.55,z+dz,m('brass'));
  for(let i=0;i<5;i++)this.assets.place(e,'croissant',x-.73+i*.36,1.118,z+.08,{scale:1.5,rotation:Math.PI/2+(i%2)*.1});
  for(let i=0;i<3;i++)this.assets.place(e,'baguette',x-.6+i*.59,1.118,z-.19,{scale:1.4,rotation:Math.PI/2});
  sign(e,'FRESHLY BAKED',x,1.20,z+.372,.7,.09,'#242a2b','#e8dfce');
 }

 cupShape(parent,x,y,z,r=.065,interactive=false){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const h=r*2,m=this.surface('ceramic');
  cylinder(g,r,r*.76,h,0,h/2,0,m,40);cylinder(g,r*.86,r*.86,.005,0,h+.001,0,'#42352c',40);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r*.92,r*.06,8,40),m);rim.rotation.x=Math.PI/2;rim.position.y=h;g.add(rim);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(r*.52,r*.095,10,28,Math.PI*1.55),m);handle.position.set(r*1.42,h*.57,0);g.userData.graspOffset=[r*1.42,h*.57,0];handle.rotation.z=-Math.PI*.275;g.add(handle);
  const liquid=cylinder(g,r*.85,r*.85,.004,0,h+.002,0,'#39291c',40);liquid.visible=false;
  const foam=cylinder(g,r*.82,r*.82,.004,0,h+.005,0,'#d8c3a0',40);foam.visible=false;
  g.userData.liquid=liquid;g.userData.foam=foam;
  if(interactive)for(let i=0;i<5;i++){const art=new THREE.Mesh(new THREE.TorusGeometry(r*(.18+i*.1),.003,5,24,Math.PI*1.45),material('#f1e7d0'));art.rotation.x=Math.PI/2;art.position.set(0,h+.008,-r*.15+i*r*.05);art.visible=false;art.userData.art=true;g.add(art);}
  return g;
 }

 restaurant(){
  const e=this.environment,m=n=>this.surface(n);this.bar();
  if(this.assets.has('kitchen'))this.backKitchen();
  box(e,9,.07,.9,0,2.15,-3.1,m('steel'),.008);
  for(const x of [-3,0,3]){
   box(e,.025,1.1,.025,x,1.62,-3.3,m('steel'));
   cylinder(e,.065,.16,.18,x,1.98,-2.8,m('brass'),32);
   cylinder(e,.14,.14,.008,x,1.885,-2.8,new THREE.MeshStandardMaterial({color:'#fff0d7',emissive:'#ffbd69',emissiveIntensity:2.5}),32);
  }
  for(let n=1;n<=3;n++){
   const x=[-3,0,3][n-1],g=this.dish(e,x,1.08,-2.65,n),id='dish'+n;
   this.entities[id]={id,name:['香煎牛排','田园沙拉','番茄意面'][n-1],mesh:g,w:.34,h:.09,d:.34,weight:.9,kind:'dish',initial:[x,1.08,-2.65],status:'待配送'};g.traverse(o=>o.userData.entityId=id);
   this.label('出餐口 '+n,x,2.48,-2.8);
   const tx=[-4,0,4][n-1];this.targets['table'+n]=this.table(tx,1.75,2.1,1.3);this.label(String(n).padStart(2,'0')+' 号桌',tx,1.8,1.75);this.vase(tx+.68,1.05,1.9);
   for(const side of [-1,1]){box(e,.18,.004,.25,tx+side*.4,1.048,1.75+side*.32,m('cloth'));this.cutlery(tx+side*.62,1.06,1.75+side*.32);this.wineGlass(tx+side*.7,1.05,1.7);}
   const used=this.dish(e,tx-.55,1.05,1.8,0);this.entities['used'+n]={id:'used'+n,name:n+' 号桌餐盘',mesh:used,w:.34,h:.035,d:.34,weight:.4,kind:'dish',initial:[tx-.55,1.05,1.8],status:'待回收'};used.traverse(o=>o.userData.entityId='used'+n);
  }
  this.targets.recycle={x:4.8,y:1.08,z:-2.8};box(e,.55,.07,.4,4.8,1.11,-2.8,m('steel'),.018);this.plant(-6,3.8);this.plant(6,3.8);
  sign(e,'ATELIER / SEASONAL DINING',0,3.65,-4.86,4,.22,'#c9c5ba','#454039');
 }
 cutlery(x,y,z){
  const e=this.environment,m=this.surface('chrome');
  box(e,.012,.005,.17,x,y,z,m,.002);box(e,.025,.004,.06,x,y,z-.1,m,.002);
  for(let i=0;i<4;i++)box(e,.003,.004,.04,x+(i-1.5)*.007,y,z-.145,m);
  box(e,.012,.006,.2,x+.055,y,z,m,.002);box(e,.022,.005,.085,x+.06,y,z-.1,m,.002);
 }
 wineGlass(x,y,z){
  const e=this.environment,m=this.surface('glass');
  if(this.assets.place(e,'wine-glass',x,y,z,{scale:.9}))return;
  cylinder(e,.035,.035,.004,x,y+.003,z,m,32);cylinder(e,.003,.003,.08,x,y+.043,z,m,12);
  const glass=cylinder(e,.038,.019,.075,x,y+.118,z,m,32);glass.material.side=THREE.DoubleSide;
 }

 dish(parent,x,y,z,type){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(.5);cylinder(g,.34,.29,.045,0,.03,0,this.surface('ceramic'),48);cylinder(g,.26,.26,.01,0,.057,0,'#e0decf',36);if(type===1){
 if(this.assets.has('steak')){this.assets.place(g,'steak',0,.065,0,{size:[.18,.06,.39],rotation:Math.PI/2});for(let i=0;i<3;i++)this.assets.place(g,'tomato',.18,.065,(i-1)*.09,{height:.08});}
 else{sphere(g,.18,0,.11,0,'#76513a',1.1,.4,.7);for(let i=0;i<3;i++)box(g,.008,.008,.15,(i-1)*.08,.182,0,'#452e25');for(let i=0;i<3;i++)sphere(g,.05,.19,.1,(i-1)*.08,'#6e8645');}
 }if(type===2){for(let i=0;i<8;i++){const a=i*2.4;sphere(g,.095,Math.cos(a)*.15,.1+i*.005,Math.sin(a)*.13,i%2?'#8da452':'#587d49',1,.5,.8);}if(this.assets.has('tomato')){this.assets.place(g,'tomato',.1,.13,.08,{height:.09});this.assets.place(g,'tomato',-.1,.13,-.08,{height:.09});}else{sphere(g,.05,.1,.15,.08,'#be6040');sphere(g,.05,-.1,.15,-.08,'#cf7952');}}if(type===3){for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.12-i*.015,.023,8,30),material('#d3aa55'));m.rotation.x=Math.PI/2;m.position.set(0,.09+i*.017,0);g.add(m);}sphere(g,.09,0,.19,0,'#b55939',1,.4,1);sphere(g,.04,.04,.23,0,'#5c824e',1,.3,1.5);}return g;}
 vase(x,y,z){
  const e=this.environment;cylinder(e,.043,.055,.14,x,y+.07,z,this.surface('ceramic'),32);
  for(let i=0;i<3;i++){const a=i*2.1;lineSegment(e,new V(x,y+.13,z),new V(x+Math.cos(a)*.08,y+.38,z+Math.sin(a)*.08),'#586347',.003);this.leaf(e,x+Math.cos(a)*.08,y+.32,z+Math.sin(a)*.08,.09,a);}
 }
 leaf(parent,x,y,z,size,angle){
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-size*.5,size*.3,-size*.48,size*.72,0,size);shape.bezierCurveTo(size*.48,size*.72,size*.5,size*.3,0,0);
  const mat=material('#465b35',0,.62);mat.side=THREE.DoubleSide;
  const leaf=new THREE.Mesh(new THREE.ShapeGeometry(shape,6),mat);leaf.position.set(x,y,z);leaf.rotation.set(-.5,angle,.6);leaf.castShadow=true;parent.add(leaf);
 }

 plant(x,z){
  const e=this.environment;cylinder(e,.25,.18,.38,x,.2,z,this.surface('stone'),40);cylinder(e,.23,.23,.012,x,.396,z,'#3d3327',32);
  for(let i=0;i<15;i++){const a=i*2.4,y=.5+(i%5)*.17,dx=Math.cos(a)*.22,dz=Math.sin(a)*.22;
   lineSegment(e,new V(x,.39,z),new V(x+dx,y,z+dz),'#515e3e',.004);this.leaf(e,x+dx,y,z+dz,.28+(i%3)*.06,a);
  }
  this.obstacle(x,z,.65,.65);
 }

 createRobot(){
  const root=new THREE.Group();this.rig=new RobotRig(this.surfaces);root.add(this.rig.root);root.userData.isRobot=true;
  const halo=new THREE.Mesh(new THREE.RingGeometry(.37,.385,64),new THREE.MeshBasicMaterial({color:0xb58e59,transparent:true,opacity:.6,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;halo.position.y=.03;root.add(halo);halo.userData.isRobot=true;
  this.holdAnchor=new THREE.Group();this.holdAnchor.position.set(0,1.05,.43);root.add(this.holdAnchor);return root;
 }

 pose(walk=0,reach=0,heldWidth=.65,graspY=1.05,object=null){
  this.gait+=walk;
  if(this.cupGrip&&this.rig.ready){this.rig.pose(this.gait,Math.abs(walk)>.001,0,.65,.3,1.05,.35,true);this.rig.solveGrip(new V().fromArray(this.cupGrip.carry),new THREE.Quaternion().fromArray(this.cupGrip.orientation),12);return;}
  const item=object||this.entities?.[this.held],height=item?.h||.3;
  const carryY=.9+height/2+(graspY-1.05),forward=.22+(item?.d||.4)/2;
  this.holdAnchor.position.set(0,carryY,forward);
  this.rig.pose(this.gait,Math.abs(walk)>.001,reach,heldWidth,height,carryY,forward);
 }

 link(obj,a,b){const diff=new V().subVectors(b,a);obj.position.copy(a).add(b).multiplyScalar(.5);obj.scale.y=diff.length();obj.quaternion.setFromUnitVectors(new V(0,1,0),diff.normalize());}
 setCamera(mode,instant=false){this.cameraMode=mode;this.controls.enabled=mode==='orbit'||mode==='top'||mode==='close';const p=this.robot?.position||new V();let pos,target;if(mode==='orbit'){pos=new V(10.5,5.9,13.4);target=new V(0,.95,-.6);}if(mode==='top'){pos=new V(0,19,.01);target=new V(0,0,0);}if(mode==='close'){pos=p.clone().add(new V(1.75,1.45,2.35));target=p.clone().add(new V(0,.75,0));}if(pos){if(instant){this.camera.position.copy(pos);this.controls.target.copy(target);this.camera.lookAt(target);}else this.camGoal={pos,target};}else this.camGoal=null;}
 select(id){this.selected=id;this.selection.visible=!!(id&&this.entities?.[id]);if(this.selection.visible)this.selection.box.setFromObject(this.entities[id].mesh);}
 hit(clientX,clientY){const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),this.camera);const hits=this.raycaster.intersectObjects([this.environment,this.robot],true);for(const h of hits){if(h.object.userData.entityId)return {entity:h.object.userData.entityId,point:h.point};if(h.object.userData.isRobot)return {robot:true,point:h.point};if(h.object.userData.floor)return {floor:true,point:h.point};}return null;}
 pick(id){if(id==='cup')throw new Error('咖啡杯须通过接触检测后抓取');const en=this.entities[id];if(!en)return;this.pose(0,1,en.w,1.05,en);this.holdAnchor.attach(en.mesh);en.mesh.position.set(0,-en.h/2,0);en.mesh.rotation.set(0,0,0);en.status='搬运中';this.held=id;}
 put(id,target){if(id==='cup')throw new Error('咖啡杯须落稳后松手');const en=this.entities[id];if(!en)return;this.environment.attach(en.mesh);en.mesh.position.set(target.x,target.y,target.z);en.mesh.rotation.set(0,0,0);en.status='已交付';this.held=null;}
 process(kind){const e=this.entities.cup;if(!e)return;if(e.liquid){e.liquid.visible=true;e.liquid.material=material(kind==='milk'?'#b59464':kind==='water'?'#68442b':'#493021');}if(kind==='foam'||kind==='latte'){e.foam.visible=true;e.mesh.traverse(m=>{if(m.userData.art)m.visible=kind==='latte';});}e.status='已制作';}
 addObstacle(x,z){const e=this.environment;const g=new THREE.Group();g.position.set(x,0,z);e.add(g);box(g,.7,.7,.7,0,.35,0,'#d29b61',.045);for(let y=.17;y<.7;y+=.3)box(g,.71,.08,.71,0,y,0,'#f4d49a');return this.obstacle(x,z,.7,.7,g,true);}
 clearObstacles(){for(const o of this.obstacles.filter(o=>o.custom))this.environment.remove(o.mesh);this.obstacles=this.obstacles.filter(o=>!o.custom);}
 updateSensors(){this.clearGroup(this.sensorGroup);const points=[],p=this.robot.position;for(let i=0;i<48;i++){const a=i*Math.PI/24;let d=3;for(let n=.5;n<=3;n+=.1){const x=p.x+Math.sin(a)*n,z=p.z+Math.cos(a)*n;if(this.obstacles.some(o=>Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2)){d=n;break;}}points.push(new V(p.x,.2,p.z),new V(p.x+Math.sin(a)*d,.2,p.z+Math.cos(a)*d));}this.sensorGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#6eac8b',transparent:true,opacity:.2})));}
 render(dt){const p=this.robot.position;if(this.camGoal){this.camera.position.lerp(this.camGoal.pos,.08);this.controls.target.lerp(this.camGoal.target,.08);if(this.camera.position.distanceTo(this.camGoal.pos)<.02)this.camGoal=null;}
 if(this.cameraMode==='follow'){const dir=new V(0,0,1).applyAxisAngle(new V(0,1,0),this.robot.rotation.y);this.camera.position.lerp(p.clone().addScaledVector(dir,-4).add(new V(1.35,2,0)),.05);this.camera.lookAt(p.clone().add(new V(0,1,0)));}else if(this.cameraMode==='first'){const dir=new V(0,0,1).applyAxisAngle(new V(0,1,0),this.robot.rotation.y);this.camera.position.copy(p).add(new V(0,1.23,0)).addScaledVector(dir,.24);this.camera.lookAt(this.camera.position.clone().add(dir).add(new V(0,-.15,0)));}else this.controls.update();
 if(this.selection.visible&&this.entities[this.selected])this.selection.box.setFromObject(this.entities[this.selected].mesh);this.rig.root.visible=this.cameraMode!=='first';this.pipeline.render();this.rig.root.visible=true;}
 snapshot(){this.scene.updateMatrixWorld(true);return {r:[...this.robot.position.toArray(),this.robot.rotation.y],held:this.held,joints:Object.values(this.rig.joints).filter(j=>j.type!=='fixed').map(j=>Number(j.angle.toFixed(6))),rigY:this.rig.root.position.y,cupGrip:this.cupGrip?structuredClone(this.cupGrip):null,entities:Object.fromEntries(Object.values(this.entities).map(e=>[e.id,{p:e.mesh.getWorldPosition(new V()).toArray(),q:e.mesh.getWorldQuaternion(new THREE.Quaternion()).toArray(),s:e.status}])),coffee:this.entities.cup?{liquid:this.entities.cup.liquid.visible,color:this.entities.cup.liquid.material.color.getHex(),foam:this.entities.cup.foam.visible,art:this.entities.cup.mesh.children.some(m=>m.userData.art&&m.visible)}:null};}
 restore(s){
  this.cupGrip=null;this.robot.position.fromArray(s.r);this.robot.rotation.y=s.r[3];
  for(const [id,t] of Object.entries(s.entities)){const en=this.entities[id];if(en){this.environment.attach(en.mesh);en.mesh.position.fromArray(t.p);en.mesh.quaternion.fromArray(t.q);en.status=t.s;}}
  this.held=s.held;this.pose(0,s.held?1:0,this.entities[s.held]?.w||.6);
  if(Array.isArray(s.joints)){const names=Object.entries(this.rig.joints).filter(([,j])=>j.type!=='fixed').map(([name])=>name);names.forEach((name,i)=>{if(Number.isFinite(s.joints[i]))this.rig.set(name,s.joints[i]);});if(Number.isFinite(s.rigY))this.rig.root.position.y=s.rigY;}
  if(s.held==='cup'&&s.cupGrip&&this.rig.ready){this.cupGrip=structuredClone(s.cupGrip);this.rig.gripSocket.attach(this.entities.cup.mesh);}
  if(this.entities.cup&&s.coffee){const c=this.entities.cup;c.liquid.visible=s.coffee.liquid;c.liquid.material=material(s.coffee.color);c.foam.visible=s.coffee.foam;c.mesh.traverse(m=>{if(m.userData.art)m.visible=s.coffee.art;});}
 }

 reattachHeld(){if(this.held==='cup'){if(this.cupGrip&&this.rig.ready)this.rig.gripSocket.attach(this.entities.cup.mesh);}else if(this.held)this.pick(this.held);}
}
