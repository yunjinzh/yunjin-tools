import * as THREE from '../vendor/three.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette={cream:0xe4e2cf,light:0xd2d7c3,glass:0x829f98,metal:0x718c80,dark:0x2b4940,coral:0xe18b72,green:0x748c64,ground:0x607b66};
let state={running:true,fault:false,speed:55,field:'temperature',temp:42,threshold:65,alarm:false};
const mat = (color,roughness=.7,metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
function box(parent,w,h,d,x,y,z,material) {const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,rt,rb,h,x,y,z,material,segments=32) {const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function edges(mesh,color=0xa5b7a0,opacity=.35) {const e=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity}));mesh.add(e);return e;}
function tube(parent,points,radius,color) {const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(path,40,radius,8,false),mat(color,.45,.1));parent.add(m);return m;}
function disposeGroup(group) {const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.clear();}

class TwinScene {
  constructor(element,kind) {
    this.el=element;this.kind=kind;this.mode='hybrid';this.rotation=.3;this.targetRotation=.3;this.zoom=1;this.targetZoom=1;this.visible=true;this.rotors=[];this.stateMeshes=[];this.clock=new THREE.Clock();
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(kind==='hero'?0x263b37:0x233632);
    const w=element.clientWidth||600,h=element.clientHeight||500;
    this.camera=new THREE.OrthographicCamera(-8*w/h,8*w/h,8,-8,.1,100);this.camera.position.set(13,12,15);this.camera.lookAt(0,1,0);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setSize(w,h);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.5;
    element.replaceChildren(this.renderer.domElement);
    const hemi=new THREE.HemisphereLight(0xf5f5de,0x344b3d,3);this.scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xffefdb,4.3);sun.position.set(-5,13,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.normalBias=.04;sun.shadow.bias=-.0004;this.scene.add(sun);
    const rim=new THREE.DirectionalLight(0xb8dbda,1.1);rim.position.set(8,4,-6);this.scene.add(rim);
    this.model=new THREE.Group();this.scene.add(this.model);
    this.grid=new THREE.GridHelper(30,30,0x5b7564,0x3e5749);this.grid.position.y=-.45;this.grid.material.transparent=true;this.grid.material.opacity=.21;this.scene.add(this.grid);
    this.build(kind==='hero'?'city':'factory');
    const canvas=this.renderer.domElement;let down=false,lastX=0;
    canvas.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!down)return;this.targetRotation+=(e.clientX-lastX)*.008;lastX=e.clientX;});
    canvas.addEventListener('pointerup',()=>down=false);canvas.addEventListener('pointercancel',()=>down=false);
    canvas.addEventListener('wheel',e=>{if(!e.ctrlKey){e.preventDefault();this.targetZoom=THREE.MathUtils.clamp(this.targetZoom-e.deltaY*.0008,.72,1.6);}},{passive:false});
    canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',kind==='hero'?'数字孪生概念园区，可用左右方向键旋转，上下方向键缩放':'数字孪生设备教学模型，可用左右方向键旋转，上下方向键缩放');
    canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.targetRotation-=.15;if(e.key==='ArrowRight')this.targetRotation+=.15;if(e.key==='ArrowUp')this.targetZoom=Math.min(1.6,this.targetZoom+.1);if(e.key==='ArrowDown')this.targetZoom=Math.max(.72,this.targetZoom-.1);}});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(element);
    this.observer=new IntersectionObserver(entries=>this.visible=entries[0].isIntersecting,{rootMargin:'100px'});this.observer.observe(element);
    this.animate();
  }
  resize() {const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;const aspect=w/h;const scale=Math.max(this.kind==='hero'?6.5:6.2,6.8/(w/h));this.camera.left=-scale*aspect;this.camera.right=scale*aspect;this.camera.top=scale;this.camera.bottom=-scale;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
  build(name) {
    disposeGroup(this.model);this.rotors=[];this.stateMeshes=[];this.digitalObjects=[];this.sceneName=name;
    if(name==='city'||name==='campus')this.city();if(name==='factory')this.factory();if(name==='water')this.water();
    this.model.rotation.y=this.rotation;this.applyState();this.resize();
  }
  base(w,d) {const base=box(this.model,w,.45,d,0,-.12,0,mat(palette.ground));edges(base,0xaab99d,.18);const lower=box(this.model,w+.12,.12,d+.12,0,-.42,0,mat(0x344f41));edges(lower,0x809d77,.25);}
  tree(x,z,scale=1) {const g=new THREE.Group();g.position.set(x,.12,z);g.scale.setScalar(scale);cylinder(g,.045,.065,.55,0,.25,0,mat(0x918b6c),8);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.29,1),mat(0x809572));crown.position.y=.72;crown.scale.set(1,1.6,1);crown.castShadow=true;g.add(crown);this.model.add(g);}
  building(x,z,w,d,h,floors=4,accent=false) {
    const body=box(this.model,w,h,d,x,.14+h/2,z,mat(accent?0xd6c1a3:palette.cream));edges(body,0x415c4c,.25);this.stateMeshes.push(body);
    const glass=mat(0x6b8a7e,.28,.25);
    for(let i=1;i<=floors;i++) {const y=.15+i*h/(floors+1);box(this.model,w+.015,.14,d+.015,x,y,z,glass);box(this.model,w+.09,.045,d+.09,x,y-.09,z,mat(palette.light));}
    box(this.model,w+.1,.1,d+.1,x,h+.19,z,mat(0xc7cfb9));
    box(this.model,w*.65,.18,d*.6,x,h+.33,z,mat(0x8e9d8c));
    for(let i=0;i<Math.floor(w/.5);i++)box(this.model,.045,h-.15,.03,x-w/2+.25+i*.5,.18+h/2,z+d/2+.01,mat(0xc4cbbb));
    return body;
  }
  city() {
    this.base(11,8.5);
    const road=mat(0x4e6352);box(this.model,10.9,.025,.7,0,.12,.65,road);box(this.model,.65,.025,8.4,-.8,.13,0,road);
    const marking=mat(0xb1b99b);
    for(let i=-5;i<5;i++)box(this.model,.35,.015,.025,i+.2,.15,.65,marking);
    for(let i=-4;i<4;i++)box(this.model,.025,.015,.35,-.8,.16,i+.2,marking);
    this.building(-3.6,-2.1,2.2,2.2,1.7,3);this.building(-1.95,-2.7,.75,1.3,3.5,6,true);
    this.building(1.3,-2.0,2.45,1.9,2.65,5);this.building(3.85,-2.4,1.25,1.5,1.8,3);
    this.building(2.95,2.4,3.4,1.4,.9,2);this.building(-3.4,2.3,2.35,1.3,1.3,2);
    box(this.model,1.1,.12,1.7,.7,.2,2.4,mat(0x8eb4a6,.25,.1));
    cylinder(this.model,.76,.82,.12,3.8,.2,-.35,mat(0x91a17e));
    cylinder(this.model,.45,.45,.15,3.8,.3,-.35,mat(palette.coral));
    for(const [x,z,s] of [[-5,-3,.8],[-5,-1,.75],[-4.7,3.5,.9],[-2,3.5,.8],[.4,3.5,.7],[4.8,3.4,.8],[4.8,1.7,.7],[4.7,-3.6,.85],[.1,-3.8,.8],[2.8,-3.8,.8],[-1.5,1.9,.65],[-1.5,2.9,.8]])this.tree(x,z,s);
    for(let i=0;i<6;i++)box(this.model,.22,.15,.43,-4.5+i*.45,.22,1.2,mat(i%3===0?palette.coral:0xc0cbb8));
    box(this.model,2.5,.06,.38,1.3,2.25,-.65,mat(0xa3b5a1));
    this.digitalObjects=[];
    for(const [x,z,h] of [[1.3,-2,3.3],[-3.6,-2.1,2.4],[2.95,2.4,1.7]]){
      const pin=new THREE.Group();pin.position.set(x,h,z);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.16,.018,8,30),new THREE.MeshBasicMaterial({color:palette.coral}));ring.rotation.x=Math.PI/2;pin.add(ring);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-.6,0),new THREE.Vector3(0,0,0)]),new THREE.LineBasicMaterial({color:palette.coral,transparent:true,opacity:.7}));pin.add(line);this.model.add(pin);this.digitalObjects.push(pin);
    }
    tube(this.model,[[-3.6,2.3,-2.1],[-2,4.6,-2.1],[1.3,3.2,-2]],.012,0xe8a087);
    tube(this.model,[[1.3,3.2,-2],[3.7,3.9,.7],[2.95,1.7,2.4]],.012,0xe8a087);
    const fan=new THREE.Group();fan.position.set(2.95,1.28,2.4);for(let i=0;i<4;i++){const blade=box(fan,.12,.035,.54,0,0,.17,mat(0x435f51));blade.rotation.y=i*Math.PI/2;blade.position.set(Math.sin(i*Math.PI/2)*.17,0,Math.cos(i*Math.PI/2)*.17);}this.model.add(fan);this.rotors.push(fan);
    this.applyMode();
  }
  factory() {
    this.base(9.6,7);
    const cream=mat(palette.cream),metal=mat(0x829e8c,.35,.35),dark=mat(0x314e43,.4,.2),orange=mat(palette.coral);
    box(this.model,6.3,.28,3.8,0,.35,0,mat(0x4a6857));
    for(const x of [-2.5,2.5])for(const z of [-1.2,1.2])cylinder(this.model,.15,.22,.65,x,.5,z,metal);
    const motor=new THREE.Group();motor.position.set(.2,1.25,0);this.model.add(motor);
    const housing=cylinder(motor,1.0,1.0,2.1,0,0,0,cream,48);housing.rotation.z=Math.PI/2;this.stateMeshes.push(housing);
    for(let i=0;i<9;i++){const fin=cylinder(motor,1.06,1.06,.045,-.85+i*.22,0,0,metal,48);fin.rotation.z=Math.PI/2;}
    const front=cylinder(motor,.92,.92,.18,1.12,0,0,dark,48);front.rotation.z=Math.PI/2;
    const rotor=new THREE.Group();rotor.position.x=1.25;motor.add(rotor);this.rotors.push(rotor);
    const shaft=cylinder(rotor,.13,.13,1.0,.3,0,0,metal);shaft.rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){const blade=box(rotor,.08,.24,.82,0,0,.35,orange);blade.rotation.x=i*Math.PI*2/5;blade.position.set(0,-Math.sin(i*Math.PI*2/5)*.35,Math.cos(i*Math.PI*2/5)*.35);}
    box(this.model,1.3,.3,.9,-.3,2.37,0,cream);cylinder(this.model,.09,.09,.25,-.3,2.68,0,orange);
    box(this.model,.85,1.65,.65,-3.3,1.1,-1.3,cream);box(this.model,.68,.78,.04,-3.3,1.37,-.95,dark);box(this.model,.18,.1,.06,-3.5,.83,-.94,orange);box(this.model,.18,.1,.06,-3.1,.83,-.94,mat(0x8bae7d));
    tube(this.model,[[-3.3,.5,-1.2],[-2.7,.3,-.5],[-1.8,.5,0],[-1.5,1.4,0]],.055,0xc0c8af);
    box(this.model,3.8,.1,.7,.6,.3,2.5,dark);
    for(let i=0;i<8;i++){const roller=cylinder(this.model,.12,.12,.7,-1+i*.46,.42,2.5,metal,12);roller.rotation.x=Math.PI/2;}
    for(let i=0;i<3;i++)box(this.model,.6,.52,.55,-.7+i*1.05,.75,2.5,mat(i===1?palette.coral:0xc1be9c));
    for(let i=0;i<5;i++)box(this.model,.07,1.5,.07,-3.8+i*1.9,.92,-2.7,orange);
    box(this.model,7.7,.06,.05,0,1.45,-2.7,orange);box(this.model,7.7,.06,.05,0,.8,-2.7,orange);
    for(let i=0;i<6;i++)box(this.model,.3,.015,.06,-3+i*.7,.14,3.2,mat(0xbdc8a9));
  }
  water() {
    this.base(9.8,7.2);const cream=mat(palette.cream),metal=mat(palette.metal,.35,.3),coral=mat(palette.coral),dark=mat(palette.dark);
    for(const x of [-2.3,1.2]){
      cylinder(this.model,1.22,1.22,2.25,x,1.26,-1.25,cream,48);
      cylinder(this.model,1.25,1.25,.12,x,2.44,-1.25,metal,48);
      cylinder(this.model,.95,.95,.05,x,2.51,-1.25,mat(0x8cb5a5,.25,.2),48);
      for(let i=0;i<4;i++)box(this.model,.045,1.75,.03,x-.65+i*.43,1.25,-.015,metal);
    }
    tube(this.model,[[-2.3,.6,-1.25],[-2.3,.6,1.6],[.1,.6,1.6],[.1,1.1,1.6],[1.2,1.1,1.6],[1.2,1.1,-1.25]],.19,0xb3cab5);
    const pump=cylinder(this.model,.54,.54,1.0,-.6,.83,1.6,metal);pump.rotation.z=Math.PI/2;this.stateMeshes.push(pump);
    const rotor=new THREE.Group();rotor.position.set(.2,1.18,1.6);for(let i=0;i<4;i++){const b=box(rotor,.09,.035,.55,0,0,.16,coral);b.rotation.y=i*Math.PI/2;b.position.set(Math.sin(i*Math.PI/2)*.15,0,Math.cos(i*Math.PI/2)*.15);}this.model.add(rotor);this.rotors.push(rotor);
    cylinder(this.model,.18,.18,.38,1.2,1.48,1.6,metal);const valve=new THREE.Mesh(new THREE.TorusGeometry(.36,.045,8,28),coral);valve.rotation.x=Math.PI/2;valve.position.set(1.2,1.7,1.6);this.model.add(valve);
    box(this.model,1.2,1.65,.9,3.4,.96,1.5,cream);box(this.model,.9,.72,.035,3.4,1.22,1.97,dark);box(this.model,.25,.08,.03,3.25,.72,1.98,coral);
    box(this.model,1.8,.12,2.3,-3.4,.2,1.8,dark);
    for(let i=0;i<4;i++)box(this.model,.18,.06,2.1,-4+i*.4,.29,1.8,metal);
    this.tree(4,-2.7,.9);this.tree(-4.1,-2.7,.8);
  }
  applyMode() {
    if(this.kind!=='hero')return;
    const wire=this.mode==='digital';
    this.model.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial){o.material.wireframe=wire;if(wire){if(o.userData.originalColor===undefined)o.userData.originalColor=o.material.color.getHex();o.material.color.setHex(0xaccdb9);}else if(o.userData.originalColor!==undefined){o.material.color.setHex(o.userData.originalColor);delete o.userData.originalColor;}}});
    this.digitalObjects.forEach(o=>o.visible=this.mode!=='physical');
    this.scene.background.setHex(wire?0x1b3330:0x263b37);
  }
  applyState() {
    if(this.kind==='hero')return;
    const color=state.fault?0x879689:state.alarm?0xe18b72:palette.cream;
    this.stateMeshes.forEach(m=>{m.material.color.setHex(state.field==='temperature'?color:0xc6d1b8);m.material.emissive.setHex(state.alarm&&!state.fault?0x5d2112:0x000000);m.material.emissiveIntensity=.15;});
  }
  reset() {this.targetRotation=.3;this.targetZoom=1;}
  animate() {
    requestAnimationFrame(()=>this.animate());const dt=Math.min(this.clock.getDelta(),.05);
    if(!this.visible||document.hidden)return;
    this.rotation=THREE.MathUtils.lerp(this.rotation,this.targetRotation,.08);this.model.rotation.y=this.rotation;
    this.zoom=THREE.MathUtils.lerp(this.zoom,this.targetZoom,.08);this.camera.zoom=this.zoom;this.camera.updateProjectionMatrix();
    if(!reduced){this.rotors.forEach(rotor=>{if(this.kind==='hero')rotor.rotation.y+=dt*.6;else if(state.running&&!state.fault){if(this.sceneName==='factory')rotor.rotation.x+=dt*state.speed*.065;else rotor.rotation.y+=dt*state.speed*.065;}});}
    this.renderer.render(this.scene,this.camera);
  }
}

// CPU projection keeps the interactive models usable on devices without WebGL.
class SoftwareScene {
  constructor(element,kind) {
    this.el=element;this.kind=kind;this.mode='hybrid';this.rotation=.3;this.targetRotation=.3;this.zoom=1;this.targetZoom=1;this.visible=true;this.rotors=[];this.stateMeshes=[];this.clock=new THREE.Clock();
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x263b37);
    this.model=new THREE.Group();this.scene.add(this.model);
    this.camera=new THREE.OrthographicCamera(-8,8,6.5,-6.5,.1,100);this.camera.position.set(13,12,15);this.camera.lookAt(0,1,0);this.camera.updateMatrixWorld();
    this.canvas=document.createElement('canvas');this.canvas.dataset.renderer='software-3d';this.canvas.tabIndex=0;this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label',kind==='hero'?'可旋转的数字孪生概念园区三维场景；方向键旋转与缩放':'可旋转的数字孪生设备三维教学模型；方向键旋转与缩放');this.ctx=this.canvas.getContext('2d');element.replaceChildren(this.canvas);
    this.build(kind==='hero'?'city':'factory');
    let down=false,lastX=0;
    this.canvas.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;this.canvas.setPointerCapture(e.pointerId);});
    this.canvas.addEventListener('pointermove',e=>{if(down){this.targetRotation+=(e.clientX-lastX)*.008;lastX=e.clientX;}});
    this.canvas.addEventListener('pointerup',()=>down=false);this.canvas.addEventListener('pointercancel',()=>down=false);
    this.canvas.addEventListener('wheel',e=>{if(!e.ctrlKey){e.preventDefault();this.targetZoom=THREE.MathUtils.clamp(this.targetZoom-e.deltaY*.0008,.72,1.6);}},{passive:false});
    this.canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.targetRotation-=.15;if(e.key==='ArrowRight')this.targetRotation+=.15;if(e.key==='ArrowUp')this.targetZoom=Math.min(1.6,this.targetZoom+.1);if(e.key==='ArrowDown')this.targetZoom=Math.max(.72,this.targetZoom-.1);}});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(element);
    this.observer=new IntersectionObserver(entries=>this.visible=entries[0].isIntersecting,{rootMargin:'100px'});this.observer.observe(element);
    this.animate();
  }
  resize() {
    const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;
    this.w=w;this.h=h;this.dpr=Math.min(devicePixelRatio,1.7);this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);
    const scale=Math.max(this.kind==='hero'?6.5:6.2,6.8/(w/h));this.camera.left=-scale*w/h;this.camera.right=scale*w/h;this.camera.top=scale;this.camera.bottom=-scale;this.camera.updateProjectionMatrix();
  }
  draw() {
    const ctx=this.ctx,w=this.w,h=this.h;if(!w||!h)return;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.fillStyle=this.kind==='hero'?'#263b37':'#233632';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(w/2,h*.57);ctx.scale(1,.32);const shadow=ctx.createRadialGradient(0,0,15,0,0,w*.4);shadow.addColorStop(0,'#0a241d88');shadow.addColorStop(1,'#0a241d00');ctx.fillStyle=shadow;ctx.fillRect(-w/2,-w/2,w,w);ctx.restore();
    this.camera.zoom=this.zoom;this.camera.updateProjectionMatrix();this.model.updateMatrixWorld(true);this.camera.updateMatrixWorld();
    const view=new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse);
    const project=v=>{const p=v.clone().applyMatrix4(view);return {x:(p.x+1)*w/2,y:(1-p.y)*h/2,z:p.z};};
    ctx.strokeStyle='#56725d36';ctx.lineWidth=.5;
    for(let k=-14;k<=14;k+=1.5){const a=project(new THREE.Vector3(k,-.5,-14)),b=project(new THREE.Vector3(k,-.5,14));ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();const c=project(new THREE.Vector3(-14,-.5,k)),d=project(new THREE.Vector3(14,-.5,k));ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();}
    const triangles=[],cam=this.camera.position,light=new THREE.Vector3(-.4,.8,.5).normalize();
    this.model.traverse(mesh=>{
      if(!mesh.isMesh||!mesh.visible||!mesh.geometry?.attributes.position)return;
      let ancestor=mesh.parent;while(ancestor){if(!ancestor.visible)return;ancestor=ancestor.parent;}
      const attr=mesh.geometry.attributes.position,index=mesh.geometry.index;
      const verts=[];for(let i=0;i<attr.count;i++)verts.push(new THREE.Vector3().fromBufferAttribute(attr,i).applyMatrix4(mesh.matrixWorld));
      const n=index?index.count:attr.count;
      for(let i=0;i<n;i+=3){
        const a=verts[index?index.getX(i):i],b=verts[index?index.getX(i+1):i+1],c=verts[index?index.getX(i+2):i+2];
        const normal=new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(b,a),new THREE.Vector3().subVectors(c,a)).normalize();
        if(normal.dot(new THREE.Vector3().subVectors(cam,a))<=0)continue;
        const pa=project(a),pb=project(b),pc=project(c);
        const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
        const base=material.color?.getHex()||0xc7d5bf;const shade=.65+Math.max(0,normal.dot(light))*.4;
        const r=Math.min(255,((base>>16)&255)*shade)|0,g=Math.min(255,((base>>8)&255)*shade)|0,bl=Math.min(255,(base&255)*shade)|0;
        triangles.push({a:pa,b:pb,c:pc,z:(pa.z+pb.z+pc.z)/3,color:`rgb(${r},${g},${bl})`,wire:this.kind==='hero'&&this.mode==='digital'});
      }
    });
    triangles.sort((a,b)=>b.z-a.z);
    for(const t of triangles){ctx.beginPath();ctx.moveTo(t.a.x,t.a.y);ctx.lineTo(t.b.x,t.b.y);ctx.lineTo(t.c.x,t.c.y);ctx.closePath();ctx.fillStyle=t.wire?'#28483e':t.color;ctx.fill();if(t.wire){ctx.strokeStyle='#a3cbb76b';ctx.lineWidth=.45;ctx.stroke();}else{ctx.strokeStyle=t.color;ctx.lineWidth=.45;ctx.stroke();}}
  }
  animate(now=0) {
    requestAnimationFrame(t=>this.animate(t));this.clock.getDelta();
    if(!this.visible||document.hidden)return;
    if(this.lastFrame&&now-this.lastFrame<45)return;
    this.lastFrame=now;this.rotation=THREE.MathUtils.lerp(this.rotation,this.targetRotation,.18);this.model.rotation.y=this.rotation;this.zoom=THREE.MathUtils.lerp(this.zoom,this.targetZoom,.18);
    if(!reduced)this.rotors.forEach(rotor=>{if(this.kind==='hero')rotor.rotation.y+=.015;else if(state.running&&!state.fault){if(this.sceneName==='factory')rotor.rotation.x+=state.speed*.004;else rotor.rotation.y+=state.speed*.004;}});
    this.draw();
  }
}
for(const method of ['base','tree','building','city','factory','water','build','applyMode','applyState','reset'])SoftwareScene.prototype[method]=TwinScene.prototype[method];

const scenes={};
let supportsWebGL=false;
try{const probe=document.createElement('canvas');const gl=probe.getContext('webgl2');supportsWebGL=!!gl;gl?.getExtension('WEBGL_lose_context')?.loseContext();}catch{}
for(const [key,id] of [['hero','hero-scene'],['lab','lab-scene']]){
  const element=document.getElementById(id);
  try {scenes[key]=supportsWebGL?new TwinScene(element,key):new SoftwareScene(element,key);}catch(error){console.warn('3D rendering unavailable:',key,error.message);element.innerHTML=`<div class="scene-fallback"><svg aria-hidden="true"><use href="#i-cube"/></svg><p>当前设备未启用三维渲染</p><small>参数、趋势与实验记录仍可使用</small></div>`;}
}
window.addEventListener('twin:hero-view',e=>{if(scenes.hero){scenes.hero.mode=e.detail;scenes.hero.applyMode();}});
window.addEventListener('twin:scene',e=>scenes.lab?.build(e.detail==='campus'?'campus':e.detail));
window.addEventListener('twin:state',e=>{state=e.detail;scenes.lab?.applyState();});
window.addEventListener('twin:reset-camera',()=>scenes.lab?.reset());
window.dispatchEvent(new CustomEvent('twin:ready'));
