import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
export class Viewer{
 constructor(host,onSelect){
  this.host=host;this.onSelect=onSelect;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#eaece4');
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;}catch{this.fallback=true;this.renderer=new SVGRenderer();this.renderer.setQuality('high');}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(this.renderer.domElement);this.renderer.domElement.style.touchAction='none';
  this.camera=new THREE.PerspectiveCamera(36,1,.01,1000000);this.camera.up.set(0,0,1);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.autoRotateSpeed=.7;this.controls.maxPolarAngle=Math.PI*.49;
  if(!this.fallback){const pmrem=new THREE.PMREMGenerator(this.renderer);const env=new RoomEnvironment();this.env=pmrem.fromScene(env,.04);this.scene.environment=this.env.texture;env.dispose();pmrem.dispose();}
  this.scene.add(new THREE.AmbientLight(0xffffff,this.fallback?.85:.65));this.sun=new THREE.DirectionalLight(0xfff5e5,this.fallback?.8:3.5);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.normalBias=.01;this.scene.add(this.sun);this.scene.add(this.sun.target);
  this.ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:.13}));this.ground.receiveShadow=true;this.ground.visible=!this.fallback;this.scene.add(this.ground);
  this.ray=new THREE.Raycaster();this.pointer=new THREE.Vector2();let down;
  host.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});host.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=host.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObjects(this.root?.children||[],true).find(h=>h.object.isMesh&&h.object.visible);onSelect(hit?.object.userData.id||null);});
  new ResizeObserver(()=>this.resize()).observe(host);this.resize();let last=0;const frame=t=>{requestAnimationFrame(frame);if(this.fallback&&t-last<80)return;last=t;this.controls.update();this.renderer.render(this.scene,this.camera);};requestAnimationFrame(frame);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 geometry(p){const [w,d,h]=p.dimensions;let g;
  if(p.type==='box')g=new THREE.BoxGeometry(w,d,h);
  if(p.type==='sphere'){g=new THREE.SphereGeometry(w/2,32,20);g.scale(1,d/w,h/w);}
  if(p.type==='cylinder'||p.type==='cone'){g=new THREE.CylinderGeometry(p.type==='cone'?w/2*(p.topRatio||0):w/2,w/2,h,40);g.rotateX(Math.PI/2);g.scale(1,d/w,1);}
  if(p.type==='torus')g=new THREE.TorusGeometry(w/2,h/2,12,48);
  if(p.type==='tube'){const shape=new THREE.Shape();shape.absarc(0,0,w/2,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,w/2-p.wall,0,Math.PI*2,true);shape.holes.push(hole);g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:32});g.translate(0,0,-h/2);g.scale(1,d/w,1);}
  return g;
 }
 setModel(doc){if(this.root){this.scene.remove(this.root);this.root.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}this.root=new THREE.Group();this.root.name=doc.name;this.meshes=new Map();this.selected=null;
  for(const p of doc.parts){const mesh=new THREE.Mesh(this.geometry(p),new THREE.MeshStandardMaterial({color:p.color,roughness:p.roughness,metalness:p.metalness}));mesh.name=p.name;mesh.position.fromArray(p.position);mesh.rotation.set(...p.rotation.map(x=>x*Math.PI/180),'XYZ');mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={id:p.id,base:p.position,source:'Yunjin Shape Studio'};this.root.add(mesh);this.meshes.set(p.id,mesh);}
  this.scene.add(this.root);this.root.updateMatrixWorld(true);const rawBox=new THREE.Box3().setFromObject(this.root);const rawSize=rawBox.getSize(new THREE.Vector3());if(doc.targetSize)this.root.scale.set(...doc.targetSize.map((v,i)=>v/rawSize.getComponent(i)));
  this.root.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(this.root),center=b.getCenter(new THREE.Vector3());this.root.position.set(-center.x,-center.y,-b.min.z);this.root.updateMatrixWorld(true);this.bounds=new THREE.Box3().setFromObject(this.root);this.size=this.bounds.getSize(new THREE.Vector3());this.radius=Math.max(...this.size.toArray());this.center=this.bounds.getCenter(new THREE.Vector3());
  this.ground.scale.set(this.radius*200,this.radius*200,1);this.ground.position.z=-this.radius*.004;
  if(this.grid){this.scene.remove(this.grid);this.grid.geometry.dispose();this.grid.material.dispose();}
  this.grid=new THREE.GridHelper(this.radius*6,60,'#b6c0ab','#cdd4c4');this.grid.rotateX(Math.PI/2);this.grid.position.z=-this.radius*.005;this.grid.material.transparent=true;this.grid.material.opacity=.4;this.scene.add(this.grid);
  const r=this.radius;this.sun.position.set(r*2,-r*2,r*3);this.sun.target.position.copy(this.center);Object.assign(this.sun.shadow.camera,{left:-r*1.5,right:r*1.5,top:r*1.5,bottom:-r*1.5,near:r*.01,far:r*10});this.sun.shadow.camera.updateProjectionMatrix();this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=r*.003;
  this.camera.near=r/1000;this.camera.far=r*100;this.camera.updateProjectionMatrix();this.controls.minDistance=r*.15;this.controls.maxDistance=r*10;this.fit();return this.stats();
 }
 stats(){let triangles=0;for(const m of this.meshes.values())triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;return {triangles,parts:this.meshes.size,size:this.size.toArray(),transform:{scale:this.root.scale.toArray(),position:this.root.position.toArray()}};}
 fit(direction){const r=this.radius||1;this.controls.target.copy(this.center||new THREE.Vector3());const dist=r*(this.camera.aspect<1?3.0:2.25);const dir=direction==='front'?new THREE.Vector3(0,-1,.001):direction==='top'?new THREE.Vector3(.001,0,1):new THREE.Vector3(1.4,-2.3,1.35).normalize();this.camera.position.copy(this.controls.target).addScaledVector(dir,dist);this.controls.update();}
 select(id){for(const [key,m]of this.meshes)m.material.emissive.set(key===id?'#3b240e':'#000000');this.selected=id;}
 explode(value){const k=value/100;const maxraw=Math.max(...this.size.toArray());for(const m of this.meshes.values()){const base=new THREE.Vector3(...m.userData.base);const world=base.clone().multiply(this.root.scale).add(this.root.position);const direction=world.sub(this.center);if(direction.length()<maxraw*.05)direction.set(0,0,1);direction.normalize().multiplyScalar(maxraw*.65*k).divide(this.root.scale);m.position.copy(base).add(direction);}this.root.updateMatrixWorld(true);}
 wireframe(value){for(const m of this.meshes.values())m.material.wireframe=value;}
 async export(format){const clone=this.root.clone(true);clone.traverse(m=>{if(m.isMesh){m.position.fromArray(m.userData.base);m.material=m.material.clone();m.material.wireframe=false;m.material.emissive.set(0);m.userData={};}});clone.updateMatrixWorld(true);
  if(format==='stl'){clone.traverse(o=>{if(o.isMesh&&!o.visible)o.geometry=new THREE.BufferGeometry();});return new Blob([new STLExporter().parse(clone,{binary:true})],{type:'application/octet-stream'});}
  const container=new THREE.Group();container.rotation.x=-Math.PI/2;container.scale.setScalar(.001);container.add(clone);container.updateMatrixWorld(true);const glb=await new GLTFExporter().parseAsync(container,{binary:true,onlyVisible:true});return new Blob([glb],{type:'model/gltf-binary'});
 }
 screenshot(){this.renderer.render(this.scene,this.camera);if(!this.fallback)return new Promise(resolve=>this.renderer.domElement.toBlob(resolve,'image/png'));return new Promise((resolve,reject)=>{const svg=new XMLSerializer().serializeToString(this.renderer.domElement);const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=this.host.clientWidth*2;canvas.height=this.host.clientHeight*2;const ctx=canvas.getContext('2d');ctx.fillStyle='#eaece4';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(resolve,'image/png');};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('截图失败'));};img.src=url;});}
}
