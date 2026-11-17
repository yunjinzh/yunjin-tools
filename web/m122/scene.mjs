import * as THREE from './vendor/three.module.js';
import {CanvasRenderer} from './canvas-renderer.mjs';
import {OrbitControls} from './vendor/OrbitControls.js';
import {ballistic,stepBody,avoidancePath,samplePath,smooth} from './physics.mjs';
// Scene events only contain resolved piece movements. This module never imports the chess engine.
const Y=.31,NAME={1:'帥',2:'仕',3:'相',4:'馬',5:'車',6:'炮',7:'兵','-1':'將','-2':'士','-3':'象','-4':'馬','-5':'車','-6':'砲','-7':'卒'};
const world=s=>({x:s%9-4,z:Math.floor(s/9)-4.5});
const geometries=new Map();
const geo=(type,args)=>{const key=type+args.join(',');if(!geometries.has(key))geometries.set(key,new THREE[type](...args));return geometries.get(key);};
const mat=(color,roughness=.7,metalness=.0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const MAT={wood:mat('#593c2c',.4),edge:mat('#3c2d23',.4),red:mat('#a74e37',.55),black:mat('#34483f',.6),skin:mat('#c9af7c',.75),gold:mat('#b29152',.48,.35),iron:mat('#686c59',.5,.25),rope:mat('#9c865c'),horse:mat('#796049'),elephant:mat('#979381'),ivory:mat('#d5c9a5'),floor:mat('#e8e4d8',.9),dark:mat('#383e33'),cream:mat('#e0cd9e'),jade:mat('#8a9a85',.3)};
function mesh(parent,type,args,material,pos=[0,0,0],rot=[0,0,0]){const m=new THREE.Mesh(geo(type,args),material);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,r,material,pos,scale){const m=mesh(parent,'SphereGeometry',[r,8,6],material,pos);if(scale)m.scale.set(...scale);return m;}
function box(parent,w,h,d,material,pos,rot){return mesh(parent,'BoxGeometry',[w,h,d],material,pos,rot);}
function cyl(parent,a,b,h,material,pos,rot){return mesh(parent,'CylinderGeometry',[a,b,h,12],material,pos,rot);}
function rod(parent,start,end,r,material){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),d=b.clone().sub(a),m=cyl(parent,r,r,d.length(),material,a.add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
const textCache=new Map();
function textTex(text,color='#8c4a32',size=128){const key=text+color+size;if(textCache.has(key))return textCache.get(key);const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle=color;x.font=`600 ${size*.72}px "Noto Serif CJK SC","Songti SC","SimSun",serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,size/2,size*.52);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textCache.set(key,t);return t;}
function horizontalLabel(parent,text,w,h,pos,color){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTex(text,color),transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(...pos);parent.add(m);return m;}
function soldier(parent,side,kind=7,scale=1){const g=new THREE.Group();g.scale.setScalar(scale);parent.add(g);const cloth=side===1?MAT.red:MAT.black;
 // Small lacquered wooden figures, articulated arms and lamellar cuirass.
 for(const x of [-.09,.09]){box(g,.12,.12,.19,MAT.dark,[x,.08,.03]);cyl(g,.055,.06,.20,cloth,[x,.23,0]);}
 cyl(g,.13,.19,.32,cloth,[0,.43,0]);box(g,.27,.23,.19,MAT.iron,[0,.53,.01]);
 for(let i=0;i<3;i++)box(g,.285,.017,.205,MAT.gold,[0,.46+i*.058,.01]);
 cyl(g,.15,.15,.045,MAT.gold,[0,.35,0]);sphere(g,.115,MAT.skin,[0,.75,0],[1,1.1,.9]);
 const helmet=sphere(g,.139,cloth,[0,.80,0],[1,1,.94]);box(g,.32,.034,.23,MAT.gold,[0,.78,0]);cyl(g,.025,.047,.14,MAT.gold,[0,.97,0]);
 sphere(g,.033,cloth,[0,1.055,0],[1,1.4,1]);
 for(const x of [-.06,.06])sphere(g,.012,MAT.dark,[x,.76,.103]);
 if(kind===1){box(g,.10,.15,.11,MAT.gold,[0,1.03,0]);box(g,.31,.035,.13,MAT.gold,[0,1.10,0]);box(g,.07,.22,.04,MAT.dark,[0,.64,.105]);}
 if(kind===2){helmet.material=MAT.dark;box(g,.40,.035,.07,MAT.dark,[0,.85,0]);rod(g,[.13,.5,.03],[.02,.58,.22],.045,cloth);rod(g,[-.13,.5,.03],[-.02,.58,.22],.045,cloth);box(g,.15,.20,.035,MAT.ivory,[0,.58,.23]);}
 else {rod(g,[-.16,.56,0],[-.21,.34,.06],.06,cloth);rod(g,[.16,.56,0],[.24,.49,.14],.055,cloth);sphere(g,.055,MAT.skin,[.24,.49,.14]);}
 const spear=new THREE.Group();g.add(spear);if(kind===7){rod(spear,[.24,.12,.14],[.24,1.21,.14],.014,MAT.wood);mesh(spear,'ConeGeometry',[.045,.18,6],MAT.gold,[.24,1.30,.14]);}
 g.userData.spear=spear;return {g,spear};}
function makeActor(p){const side=Math.sign(p),kind=Math.abs(p),g=new THREE.Group(),body=new THREE.Group(),cloth=side===1?MAT.red:MAT.black;g.add(body);body.position.y=.13;body.rotation.y=side===1?Math.PI:0;const wheels=[],flags=[];
 cyl(g,.335,.37,.11,MAT.edge,[0,.055,0]);cyl(g,.32,.335,.045,cloth,[0,.122,0]);mesh(g,'TorusGeometry',[.315,.012,4,20],MAT.gold,[0,.151,0],[Math.PI/2,0,0]);
 horizontalLabel(g,NAME[p],.26,.26,[0,.156,.18],side===1?'#efd6a7':'#d1cfaa');
 const banner=(height=1.2)=>{rod(body,[-.22,.15,-.12],[-.22,height,-.12],.014,MAT.gold);const geometry=new THREE.PlaneGeometry(.34,.25,8,4),material=new THREE.MeshStandardMaterial({color:side===1?'#af533b':'#3a5548',roughness:.85,side:THREE.DoubleSide});const flag=new THREE.Mesh(geometry,material);flag.position.set(-.05,height-.15,-.12);body.add(flag);flags.push(flag);};
 if(kind===1||kind===2||kind===7){const unit=soldier(body,side,kind,kind===1?1:kind===2?.82:.72);body.userData.spear=unit.spear;if(kind===1)banner(1.25);}
 if(kind===4){
  for(const x of [-.13,.13])for(const z of [-.16,.17]){const leg=rod(body,[x,.12,z],[x,.39,z],.045,MAT.horse);if(z>0){body.userData.kickLegs??=[];body.userData.kickLegs.push(leg);}box(body,.10,.07,.12,MAT.dark,[x,.08,z+.02]);}
  sphere(body,.23,MAT.horse,[0,.46,0],[.85,1,1.35]);sphere(body,.16,MAT.horse,[0,.65,.18],[.8,1.5,.8]);sphere(body,.14,MAT.horse,[0,.79,.26],[.75,.85,1.3]);
  for(const x of [-.07,.07])mesh(body,'ConeGeometry',[.035,.14,6],MAT.horse,[x,.94,.22]);
  box(body,.30,.065,.29,cloth,[0,.64,-.07]);rod(body,[0,.53,-.25],[0,.25,-.34],.026,MAT.dark);
  const rider=soldier(body,side,7,.50);rider.g.position.set(0,.59,-.08);banner(1.1);
 }
 if(kind===3){
  for(const x of [-.15,.15])for(const z of [-.19,.19])cyl(body,.065,.075,.25,MAT.elephant,[x,.18,z]);
  sphere(body,.27,MAT.elephant,[0,.44,-.03],[.95,.9,1.3]);sphere(body,.20,MAT.elephant,[0,.53,.23]);
  for(const x of [-.21,.21])sphere(body,.13,MAT.elephant,[x,.51,.19],[.55,1,1]);
  rod(body,[0,.53,.39],[0,.18,.44],.055,MAT.elephant);sphere(body,.06,MAT.elephant,[0,.17,.43]);
  for(const x of [-.12,.12])rod(body,[x,.43,.35],[x,.40,.50],.022,MAT.ivory);
  box(body,.37,.055,.33,cloth,[0,.66,-.06]);box(body,.21,.09,.22,MAT.gold,[0,.72,-.06]);
  const rider=soldier(body,side,2,.42);rider.g.position.set(0,.74,-.07);
 }
 if(kind===5||kind===6){
  box(body,.45,.12,.58,MAT.wood,[0,.23,0]);for(const x of [-.27,.27])for(const z of [-.18,.18]){const wheel=cyl(body,.135,.135,.06,MAT.edge,[x,.17,z],[0,0,Math.PI/2]);wheels.push(wheel);cyl(body,.055,.055,.066,MAT.gold,[x,.17,z],[0,0,Math.PI/2]);for(let i=0;i<4;i++)box(wheel,.026,.07,.24,MAT.gold,[0,0,0],[0,i*Math.PI/4,0]);}
  if(kind===5){box(body,.45,.26,.055,cloth,[0,.42,.23]);box(body,.05,.26,.48,cloth,[-.22,.42,0]);box(body,.05,.26,.48,cloth,[.22,.42,0]);for(const x of [-.19,0,.19])box(body,.11,.07,.065,MAT.gold,[x,.58,.23]);const driver=soldier(body,side,7,.58);driver.g.position.set(0,.28,-.03);banner(1.16);}
  else {for(const x of [-.18,.18]){rod(body,[x,.27,-.22],[x,.70,0],.035,MAT.wood);rod(body,[x,.27,.22],[x,.70,0],.035,MAT.wood);}rod(body,[-.22,.69,0],[.22,.69,0],.035,MAT.gold);const arm=new THREE.Group();arm.position.set(0,.70,0);arm.rotation.x=-.45;body.add(arm);box(arm,.07,.065,.75,MAT.wood,[0,0,.08]);sphere(arm,.12,MAT.iron,[0,.04,.43],[1,.42,1]);sphere(arm,.10,MAT.dark,[0,.10,.43]);body.userData.arm=arm;rod(body,[0,.26,-.20],[0,.69,-.26],.012,MAT.rope);}
 }
 g.userData={p,side,kind,body,wheels,flags,phase:((p*19)%17)*.4,baseY:Y};return g;
}
function boardTexture(){const c=document.createElement('canvas');c.width=1536;c.height=1690;const ctx=c.getContext('2d'),sx=c.width/10.3,sz=c.height/11.3;const px=x=>(x+5.15)*sx,pz=z=>(z+5.65)*sz;
 ctx.fillStyle='#d5b982';ctx.fillRect(0,0,c.width,c.height);
 let random=12345;const rand=()=>{random=(Math.imul(1664525,random)+1013904223)>>>0;return random/4294967296;};
 for(let i=0;i<4200;i++){const y=rand()*c.height;ctx.strokeStyle=`rgba(97,68,30,${rand()*.05})`;ctx.lineWidth=rand()*2+.2;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(400,y+rand()*8,900,y-rand()*8,1536,y+rand()*4);ctx.stroke();}
 function line(x1,z1,x2,z2,width=2){ctx.strokeStyle='#705735';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(px(x1),pz(z1));ctx.lineTo(px(x2),pz(z2));ctx.stroke();}
 for(let i=0;i<10;i++)line(-4,i-4.5,4,i-4.5);for(let i=0;i<9;i++){const x=i-4;line(x,-4.5,x,-.5);line(x,.5,x,4.5);}line(-4,-.5,-4,.5);line(4,-.5,4,.5);
 for(const z of [-4.5,2.5]){line(-1,z,1,z+2);line(1,z,-1,z+2);}
 ctx.strokeStyle='#705735';ctx.lineWidth=5;ctx.strokeRect(px(-4.10),pz(-4.60),8.2*sx,9.2*sz);
 for(const [x,z] of [[-3,-2.5],[3,-2.5],[-3,2.5],[3,2.5],...[-4,-2,0,2,4].flatMap(x=>[[x,-1.5],[x,1.5]])])for(const dx of [-1,1])for(const dz of [-1,1]){if(Math.abs(x+dx*.15)>4.1)continue;line(x+dx*.06,z+dz*.06,x+dx*.18,z+dz*.06,1.5);line(x+dx*.06,z+dz*.06,x+dx*.06,z+dz*.18,1.5);}
 ctx.font='64px "Noto Serif CJK SC","Songti SC","SimSun",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#77603e';ctx.fillText('楚 河',px(-2),pz(0));ctx.fillText('漢 界',px(2),pz(0));
 ctx.font='24px serif';ctx.fillStyle='#947744';for(let i=0;i<9;i++){ctx.fillText('九八七六五四三二一'[i],px(i-4),pz(4.98));ctx.fillText(String(i+1),px(i-4),pz(-4.98));}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;
}
export class BattleScene {
 constructor(el,onSquare,onFrame){this.el=el;this.onSquare=onSquare;this.onFrame=onFrame;this.units=new Map();this.captured=[];this.particles=[];this.marks=[];this.time=0;this.animation=null;this.paused=false;this.speed=1;this.effects=true;this.cameraMode='director';this.phase=0;this.lastTime=0;this.onImpact=()=>{};
 this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f1ede4');this.scene.fog=new THREE.Fog('#f1ede4',25,55);
 try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});this.compatibility=false;}catch{this.renderer=new CanvasRenderer();this.compatibility=true;console.info('[兼容模式] WebGL 不可用，使用同一三维场景的 Canvas 渲染。');}this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;el.appendChild(this.renderer.domElement);
 this.camera=new THREE.PerspectiveCamera(35,1,.1,90);this.camera.position.set(12,15,17);this.camera.lookAt(0,0,0);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.target.set(0,0,0);this.controls.maxPolarAngle=Math.PI*.47;this.controls.minDistance=8;this.controls.maxDistance=32;this.controls.enablePan=true;this.controls.enabled=false;this.desiredPos=new THREE.Vector3(12,15,17);this.desiredTarget=new THREE.Vector3(0,0,0);
 this.scene.add(new THREE.HemisphereLight('#fff6dc','#8b907e',2.9));const light=new THREE.DirectionalLight('#fff1d2',3.6);light.position.set(-7,16,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40});light.shadow.bias=-.00035;light.shadow.normalBias=.03;this.scene.add(light);const fill=new THREE.DirectionalLight('#d6e6e0',1.1);fill.position.set(7,8,-10);this.scene.add(fill);
 this.props=new THREE.Group();this.scene.add(this.props);this.setupTable();
 this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.plane=new THREE.Plane(new THREE.Vector3(0,1,0),-Y);
 let down=null;this.renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});this.renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const rect=el.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);
 const hit=this.raycaster.intersectObjects([...this.units.values()],true);if(hit.length){let obj=hit[0].object;while(obj&&!obj.userData.square&&obj.userData.square!==0)obj=obj.parent;if(obj&&obj.userData.square!==undefined){this.onSquare(obj.userData.square);return;}}
 const point=new THREE.Vector3();if(this.raycaster.ray.intersectPlane(this.plane,point)){const x=Math.round(point.x+4),y=Math.round(point.z+4.5);if(x>=0&&x<9&&y>=0&&y<10)this.onSquare(y*9+x);}});
 new ResizeObserver(()=>this.resize()).observe(el);this.resize();this.renderer.setAnimationLoop(t=>this.tick(t));}
 setupTable(){
 const g=this.props;box(g,200,.20,200,MAT.floor,[0,-2.35,0]);
 box(g,14.2,.46,13.0,MAT.wood,[0,-.18,0]);box(g,14.4,.10,13.2,MAT.edge,[0,.02,0]);box(g,13.8,.12,12.6,MAT.wood,[0,.11,0]);
 for(const x of [-5.6,5.6])for(const z of [-5,5]){box(g,.55,1.85,.55,MAT.edge,[x,-1.2,z],[0,0,x>0?-.07:.07]);box(g,.65,.08,.65,MAT.gold,[x,-1.7,z]);}
 for(const z of [-5.5,5.5])box(g,11,.8,.16,MAT.wood,[0,-.8,z]);
 box(g,10.65,.20,11.65,MAT.edge,[0,.20,0]);box(g,10.5,.06,11.50,MAT.gold,[0,.26,0]);
 const top=new THREE.Mesh(new THREE.PlaneGeometry(10.3,11.3),new THREE.MeshStandardMaterial({map:boardTexture(),roughness:.84}));top.rotation.x=-Math.PI/2;top.position.y=.303;top.receiveShadow=true;g.add(top);
 for(const x of [-6.05,6.05]){box(g,1.20,.08,7.1,MAT.edge,[x,.19,.25]);box(g,1.1,.025,6.95,MAT.wood,[x,.24,.25]);for(const xx of [-.6,.6])box(g,.045,.18,7.1,MAT.wood,[x+xx,.24,.25]);for(const zz of [-3.55,3.55])box(g,1.2,.18,.045,MAT.wood,[x,.24,.25+zz]);}
 // Tea and folded manuscript lend scale to the low lacquered table.
 cyl(g,.40,.44,.06,MAT.jade,[-6,.24,-4.4]);cyl(g,.20,.15,.22,MAT.cream,[-6,.36,-4.4]);cyl(g,.17,.17,.012,MAT.wood,[-6,.48,-4.4]);mesh(g,'TorusGeometry',[.105,.025,8,16],MAT.cream,[-5.8,.37,-4.4],[0,Math.PI/2,0]);
 box(g,.75,.05,.95,MAT.ivory,[6,.25,-4.55],[0,.12,0]);for(let i=0;i<5;i++)box(g,.4,.002,.012,MAT.gold,[6,.28,-4.9+i*.13],[0,.12,0]);
 for(const x of [-.45,.45])cyl(g,.065,.065,1.05,MAT.wood,[6+x,.31,-4.55],[Math.PI/2,0,0]);
 }
 resize(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.setCamera(this.cameraMode,true);}
 setCamera(mode,instant=false){this.cameraMode=mode;this.controls.enabled=mode==='free';const aspect=this.el.clientWidth/this.el.clientHeight;const narrow=aspect<1.1,scale=narrow?1.20:1;this.desiredTarget.set(0,-.1,.4);
 if(mode==='top'){this.desiredPos.set(.001,25*scale,1.8);this.desiredTarget.set(0,0,0);}
 else if(mode==='wide'||mode==='free'||mode==='director')this.desiredPos.set(12*scale,15.5*scale,17*scale);
 if(instant||this.paused){this.camera.position.copy(this.desiredPos);this.controls.target.copy(this.desiredTarget);this.camera.lookAt(this.desiredTarget);} }
 sync(board,captures=[]){if(this.animation){if(this.animation.projectile)this.scene.remove(this.animation.projectile);for(const p of this.animation.petals??[])this.scene.remove(p);this.animation=null;}for(const g of this.units.values())this.scene.remove(g);for(const g of this.captured)this.scene.remove(g);this.units.clear();this.captured=[];this.clearEffects();
 for(let i=0;i<90;i++)if(board[i]){const g=makeActor(board[i]),p=world(i);g.position.set(p.x,Y,p.z);g.userData.square=i;this.units.set(i,g);this.scene.add(g);}
 const counts={1:0,'-1':0};for(const p of captures){const g=makeActor(p);this.scene.add(g);const pos=this.trayPoint(Math.sign(p),counts[Math.sign(p)]++);g.position.set(pos.x,pos.y,pos.z);g.scale.setScalar(.45);g.userData.body.rotation.set(0,Math.sign(p)===1?Math.PI:0,0);g.userData.tray=true;this.captured.push(g);}this.highlight([]);}
 trayPoint(side,n){return {x:side===1?-6.05:6.05,y:.29,z:-2.7+n*.40};}
 highlight(squares,selected=-1,last=false){for(const m of this.marks){this.scene.remove(m);m.geometry.dispose();m.material.dispose();}this.marks=[];for(const i of squares){const p=world(i),m=new THREE.Mesh(new THREE.RingGeometry(selected===i?.37:.23,selected===i?.43:.29,40),new THREE.MeshBasicMaterial({color:last?'#a68b51':selected===i?'#b55235':'#64826d',transparent:true,opacity:last?.55:.9,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.316,p.z);this.scene.add(m);this.marks.push(m);} }
 begin(move,callback){const actor=this.units.get(move.from),victim=this.units.get(move.to);if(!actor)return callback();const start=world(move.from),end=world(move.to),obstacles=[...this.units.entries()].filter(([sq])=>sq!==move.from&&sq!==move.to).map(([sq])=>world(sq));let path=avoidancePath(start,end,obstacles,.65);const fallback=!path;if(!path)path=[start,end];const kind=Math.abs(move.piece),capture=!!victim,cannon=kind===6&&capture,trajectory=cannon?ballistic({x:start.x,y:Y+1.0,z:start.z},{x:end.x,y:Y+.65,z:end.z},3.15):null;
 const attackEnd=capture?(cannon?trajectory.time+.45:1.35):0,moveDuration=Math.max(1.6,Math.hypot(end.x-start.x,end.z-start.z)*.28),duration=attackEnd+moveDuration+.25;
 this.highlight([move.from,move.to],-1,true);this.animation={move,actor,victim,start,end,path,fallback,t:0,duration,moveDuration,attackEnd,trajectory,impact:false,callback,body:null,settled:false,projectile:null};
 if(cannon){const stone=mesh(this.scene,'IcosahedronGeometry',[.12,1],MAT.dark,[start.x,Y+1.0,start.z]);this.animation.projectile=stone;}
 if(this.cameraMode==='director'){const close=capture||this.phase++%4===2;const s=move.piece>0?1:-1;if(close){const mid={x:(start.x+end.x)/2,z:(start.z+end.z)/2};this.desiredTarget.set(mid.x*.65,.25,mid.z*.55);this.desiredPos.set(mid.x*.6+(s>0?10:-11),capture?13:16,mid.z*.5+16);}else{this.setCamera('director');if(this.phase%3===0)this.desiredPos.x=-11;}if(this.camera.aspect<1.1)this.desiredPos.multiplyScalar(1.12);}
 }
 impact(a){a.impact=true;this.onImpact(a.move);if(a.projectile){this.scene.remove(a.projectile);a.projectile=null;}if(a.victim){const dx=a.end.x-a.start.x,dz=a.end.z-a.start.z,len=Math.hypot(dx,dz)||1;a.body={p:{x:a.end.x,y:Y+.08,z:a.end.z},v:{x:dx/len*.65,y:1.9,z:dz/len*.65},rotation:0,spin:5};}
 if(this.effects){for(let i=0;i<20;i++){const angle=i*2.3999,vel=.4+(i%5)*.22;const m=sphere(this.scene,.025+(i%3)*.01,i%4===0?MAT.gold:MAT.cream,[a.end.x,Y+.4,a.end.z]);this.particles.push({mesh:m,p:{x:a.end.x,y:Y+.4,z:a.end.z},v:{x:Math.cos(angle)*vel,y:1.2+(i%4)*.32,z:Math.sin(angle)*vel},life:0,rotation:0,spin:0});}const flash=new THREE.PointLight('#ffe1a5',5,3);flash.position.set(a.end.x,Y+.6,a.end.z);this.scene.add(flash);a.flash=flash;}}
 updateAnimation(dt){const a=this.animation;if(!a)return;a.t+=dt;const t=a.t,kind=Math.abs(a.move.piece),g=a.actor;
 if(a.trajectory&&a.projectile){const flight=Math.max(0,t-.15),pos=a.trajectory.at(flight);a.projectile.position.set(pos.x,pos.y,pos.z);a.projectile.rotation.x+=dt*6;if(g.userData.body.userData.arm)g.userData.body.userData.arm.rotation.x=-.45-Math.sin(Math.min(t/.45,1)*Math.PI)*.9;if(flight>=a.trajectory.time&&!a.impact)this.impact(a);}
 if(a.victim&&!a.trajectory&&!a.impact){
 // Close combat: advance into attack range, leaving a clear gap before striking.
 const p=samplePath(a.path,smooth(Math.min(t/.72,1))*.76);g.position.set(p.x,Y,p.z);g.userData.body.rotation.y=p.angle;g.userData.body.rotation.x=Math.sin(Math.min(t/.9,1)*Math.PI)*.18;
 if(g.userData.body.userData.spear){const weapon=g.userData.body.userData.spear;weapon.rotation.x=Math.sin(Math.min(t/.85,1)*Math.PI)*.9;weapon.position.z=Math.sin(Math.min(t/.85,1)*Math.PI)*.23;}for(const leg of g.userData.body.userData.kickLegs??[])leg.rotation.x=-Math.sin(Math.min(t/.85,1)*Math.PI)*1.1;if(t>=.80)this.impact(a);
 }
 if(a.body&&a.victim&&!a.settled){for(let elapsed=0;elapsed<dt;elapsed+=.016)stepBody(a.body,Math.min(.016,dt-elapsed),Y+.08);const v=a.victim;const since=t-(a.trajectory?a.trajectory.time+.15:.8);
 if(since<.8){v.position.set(a.body.p.x,a.body.p.y,a.body.p.z);v.userData.body.rotation.z=Math.min(1.5,a.body.rotation);v.userData.body.rotation.x=.3;}
 else {const side=v.userData.side,n=this.captured.filter(g=>g.userData.side===side).length,dest=this.trayPoint(side,n),q=smooth(Math.min(1,(since-.8)/1.1));
 if(!a.petals){a.petals=[];for(let i=0;i<14;i++){const petal=sphere(this.scene,.04,side===1?MAT.red:MAT.gold,[a.body.p.x,Y+.2,a.body.p.z],[.6,.18,1.4]);a.petals.push(petal);}}
 v.scale.setScalar(Math.max(0,1-q*2.7));
 for(let i=0;i<a.petals.length;i++){const petal=a.petals[i],f=Math.min(1,q*1.2),phase=i*2.399;petal.position.set(THREE.MathUtils.lerp(a.body.p.x,dest.x,f)+Math.sin(phase+f*5)*.25*Math.sin(f*Math.PI),Y+.22+Math.sin(f*Math.PI)*(1.3+i*.035),THREE.MathUtils.lerp(a.body.p.z,dest.z,f)+Math.cos(phase+f*5)*.3*Math.sin(f*Math.PI));petal.rotation.set(f*8+phase,f*5,phase);petal.scale.setScalar(Math.max(.01,Math.sin(f*Math.PI)));}
 if(q>=1){for(const p of a.petals)this.scene.remove(p);a.petals=[];v.position.set(dest.x,dest.y,dest.z);v.scale.setScalar(.45);v.userData.body.rotation.set(0,side===1?Math.PI:0,0);a.settled=true;v.userData.tray=true;this.captured.push(v);}}
 }
 if(t>=a.attackEnd){const q=smooth(Math.min(1,(t-a.attackEnd)/a.moveDuration));const from=a.victim&&!a.trajectory?.76:0;const pos=samplePath(a.path,from+(1-from)*q);g.position.set(pos.x,Y,pos.z);g.userData.body.rotation.y=pos.angle;g.userData.body.rotation.x=0;
 if(kind===4)g.position.y+=Math.sin(q*Math.PI)*1.8;
 else if(a.fallback)g.position.y+=Math.sin(q*Math.PI)*2.0;
 else if(kind===3||kind===7||kind===1||kind===2){g.position.y+=Math.abs(Math.sin(q*Math.PI*8))*.055;g.userData.body.rotation.z=Math.sin(q*Math.PI*8)*.045;}
 for(const w of g.userData.wheels)w.rotation.x-=dt*4;
 }
 if(a.flash){a.flash.intensity*=Math.exp(-dt*15);if(a.flash.intensity<.01){this.scene.remove(a.flash);a.flash=null;}}
 if(t>=a.duration&&(!a.victim||a.settled)){g.position.set(a.end.x,Y,a.end.z);g.userData.body.rotation.set(0,a.move.piece>0?Math.PI:0,0);g.userData.square=a.move.to;this.units.delete(a.move.from);this.units.delete(a.move.to);this.units.set(a.move.to,g);if(a.flash)this.scene.remove(a.flash);this.animation=null;a.callback();}
 }
 clearEffects(){for(const p of this.particles)this.scene.remove(p.mesh);this.particles=[];for(const o of [...this.scene.children])if(o.type==='PointLight')this.scene.remove(o);}
 tick(now){const realDt=Math.min(this.compatibility?.25:.05,(now-this.lastTime)/1000||0);this.lastTime=now;const dt=this.paused?0:realDt*this.speed;this.time+=dt;
 if(dt>0){this.updateAnimation(dt);for(const [sq,g]of this.units){if(this.animation&&(g===this.animation.actor||g===this.animation.victim))continue;const u=g.userData;if(this.effects){u.body.position.y=.13+Math.sin(this.time*1.5+sq)*.007;u.body.rotation.z=Math.sin(this.time*.9+sq)*.008;}for(const f of u.flags){const attr=f.geometry.attributes.position;for(let i=0;i<attr.count;i++){const x=attr.getX(i);attr.setZ(i,this.effects?Math.sin(this.time*3+x*10+i*.1)*(x+.17)*.11:0);}attr.needsUpdate=true;}}
 this.particles=this.particles.filter(p=>{p.life+=dt;for(let elapsed=0;elapsed<dt;elapsed+=.016)stepBody(p,Math.min(.016,dt-elapsed),Y+.02);p.mesh.position.set(p.p.x,p.p.y,p.p.z);p.mesh.scale.setScalar(Math.max(0,1-p.life/1.2));if(p.life>1.2){this.scene.remove(p.mesh);return false;}return true;});}
 if(this.cameraMode!=='free'){if(!this.paused){const ease=1-Math.exp(-realDt*1.6);this.camera.position.lerp(this.desiredPos,ease);this.controls.target.lerp(this.desiredTarget,ease);}this.camera.lookAt(this.controls.target);}else this.controls.update();this.renderer.render(this.scene,this.camera);this.onFrame?.(dt);}
}
