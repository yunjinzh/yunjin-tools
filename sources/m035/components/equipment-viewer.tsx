'use client';
import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {createEquipmentModel,type Model} from '@/lib/models';
import {catalog} from '@/lib/equipment';

export type ViewerHandle={view:(view:'home'|'front'|'side'|'top')=>void;zoom:(direction:number)=>void;focus:(part:string)=>void;};
type Props={id:number;mode:string;autoRotate:boolean;selected:string|null;onSelect:(part:string)=>void;onReady:(parts:string[])=>void};
let webglUnavailable=false;
type State={invalidate:()=>void;scene:T.Scene;camera:T.PerspectiveCamera;renderer:T.WebGLRenderer|SVGRenderer;controls:OrbitControls;model:Model;radius:number;center:T.Vector3;dist:number;fit:()=>void;highlight:(part:string|null)=>void;focus:(part:string)=>void;};

export default forwardRef<ViewerHandle,Props>(function EquipmentViewer({id,mode,autoRotate,selected,onSelect,onReady},ref){
 const host=useRef<HTMLDivElement>(null),state=useRef<State|null>(null),onSelectRef=useRef(onSelect),onReadyRef=useRef(onReady);
 const [error,setError]=useState(''),[hover,setHover]=useState(''),[ready,setReady]=useState(false);
 onSelectRef.current=onSelect;onReadyRef.current=onReady;
 useImperativeHandle(ref,()=>({
  view(v){const s=state.current;if(!s)return;if(v==='home'){s.fit();return;}s.controls.target.copy(s.center);const d=s.dist;const dirs={front:new T.Vector3(0,.15,1),side:new T.Vector3(1,.15,0),top:new T.Vector3(0,1,.001)};s.camera.position.copy(s.center).add(dirs[v].normalize().multiplyScalar(d));s.controls.update();},
  zoom(direction){const s=state.current;if(!s)return;const offset=s.camera.position.clone().sub(s.controls.target).multiplyScalar(direction>0?.78:1.28);offset.clampLength(s.controls.minDistance,s.controls.maxDistance);s.camera.position.copy(s.controls.target).add(offset);s.controls.update();},
  focus(part){state.current?.focus(part);},
 }),[]);
 useEffect(()=>{
  const el=host.current;if(!el)return;setError('');setReady(false);setHover('');
  let renderer:T.WebGLRenderer|SVGRenderer,software=false;try{if(webglUnavailable)throw new Error('Software rendering selected');renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{webglUnavailable=true;renderer=new SVGRenderer();renderer.setQuality('low');renderer.setPrecision(2);software=true;}
  let envMap:T.WebGLRenderTarget|null=null;const scene=new T.Scene();
  if(renderer instanceof T.WebGLRenderer){renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.setClearColor(0x000000,0);const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);envMap=pmrem.fromScene(env,.04);scene.environment=envMap.texture;scene.environmentIntensity=.55;env.dispose();pmrem.dispose();}
  const surface=renderer.domElement as unknown as HTMLElement;el.appendChild(surface);surface.setAttribute('aria-label',`${catalog[id-1].name}三维模型，拖动旋转，滚轮缩放，点击部件查看参数`);surface.setAttribute('role','img');surface.setAttribute('data-renderer',software?'software':'webgl');
  let dirty=true;const camera=new T.PerspectiveCamera(35,1,.01,250);const controls=new OrbitControls(camera,surface);controls.enableDamping=!software;controls.dampingFactor=.09;controls.enablePan=true;controls.autoRotateSpeed=.6;controls.maxPolarAngle=Math.PI-.03;controls.minPolarAngle=.03;controls.screenSpacePanning=true;controls.addEventListener('change',()=>{dirty=true;});
  scene.add(software?new T.AmbientLight(0x929ba2,1):new T.HemisphereLight(0xddeaff,0x707879,2.0));
  const key=new T.DirectionalLight(0xfff6e8,software?.58:3.5);key.position.set(4,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.02;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
  const fill=new T.DirectionalLight(0xc9e0ff,software?.17:2.0);fill.position.set(-6,4,0);scene.add(fill);const rim=new T.DirectionalLight(0xffffff,software?.13:2.4);rim.position.set(1,5,-6);scene.add(rim);
  const model=createEquipmentModel(id);const oldMaterials=new Set<T.Material>();model.meshes.forEach(m=>{oldMaterials.add(m.material as T.Material);m.material=(m.material as T.Material).clone();if(software){const old=m.geometry;const p=(old as T.BoxGeometry).parameters;if(old.type==='RoundedBoxGeometry')m.geometry=new T.BoxGeometry(p.width,p.height,p.depth);else if(old.type==='CylinderGeometry'){const q=(old as T.CylinderGeometry).parameters;m.geometry=new T.CylinderGeometry(q.radiusTop,q.radiusBottom,q.height,12);}else if(old.type==='SphereGeometry'){const q=(old as T.SphereGeometry).parameters;m.geometry=new T.SphereGeometry(q.radius,10,7,q.phiStart,q.phiLength,q.thetaStart,q.thetaLength);}else if(old.type==='TubeGeometry'){const q=(old as T.TubeGeometry).parameters;m.geometry=new T.TubeGeometry(q.path,12,q.radius,5,q.closed);}if(m.geometry!==old)old.dispose();}});oldMaterials.forEach(m=>m.dispose());const initial=new T.Box3().setFromObject(model.root),ic=initial.getCenter(new T.Vector3());model.root.position.set(-ic.x,0,-ic.z);scene.add(model.root);const bounds=new T.Box3().setFromObject(model.root),center=bounds.getCenter(new T.Vector3()),radius=bounds.getBoundingSphere(new T.Sphere()).radius;
  const platform=new T.Mesh(new T.CylinderGeometry(radius*1.01,radius*1.01,.07,96),new T.MeshStandardMaterial({color:0xd8e0e4,metalness:.15,roughness:.75}));platform.position.y=-.055;platform.receiveShadow=true;if(!software)scene.add(platform);else{platform.geometry.dispose();platform.material.dispose();}
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({color:0x526777,opacity:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-.095;floor.receiveShadow=true;if(!software)scene.add(floor);else{floor.geometry.dispose();floor.material.dispose();}
  const grid=new T.GridHelper(radius*2,20,0xa0b6c4,0xc4d1d8);grid.position.y=-.014;(grid.material as T.Material).transparent=true;(grid.material as T.Material).opacity=.4;scene.add(grid);
  const fit=()=>{const aspect=el.clientWidth/Math.max(1,el.clientHeight);camera.aspect=aspect;camera.updateProjectionMatrix();const half=Math.min(T.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(T.MathUtils.degToRad(camera.fov/2))*aspect));const direction=new T.Vector3(.61,.4,1).normalize(),right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right);const tanV=Math.tan(T.MathUtils.degToRad(camera.fov/2)),tanH=tanV*aspect;let d=0;for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const q=new T.Vector3(x,y,z).sub(center),depth=q.dot(direction);d=Math.max(d,Math.abs(q.dot(right))/tanH+depth,Math.abs(q.dot(up))/tanV+depth);}d*=1.12;camera.position.copy(center).add(direction.multiplyScalar(d));controls.target.copy(center);controls.minDistance=radius*.14;controls.maxDistance=radius*12;controls.update();if(state.current)state.current.dist=d;};
  const highlighted=new Map<T.Mesh,T.Material|T.Material[]>();
  const highlight=(part:string|null)=>{dirty=true;highlighted.forEach((original,m)=>{if(!Array.isArray(m.material))m.material.dispose();m.material=original;});highlighted.clear();if(!part)return;model.meshes.filter(m=>m.userData.partId===part).forEach(m=>{const material=m.material as T.MeshStandardMaterial;highlighted.set(m,m.material);const clone=material.clone();clone.emissive.set(0x147abd);clone.emissiveIntensity=.32;m.material=clone;});};
  const focus=(part:string)=>{const groups=model.parts.get(part);if(!groups?.length)return;const box=new T.Box3();groups.forEach(g=>box.expandByObject(g));const c=box.getCenter(new T.Vector3()),r=Math.max(.24,box.getBoundingSphere(new T.Sphere()).radius);const dir=camera.position.clone().sub(controls.target).normalize();controls.target.copy(c);camera.position.copy(c).add(dir.multiplyScalar(Math.max(r*3.6,radius*.48)));controls.update();};
  state.current={invalidate:()=>{dirty=true;},scene,camera,renderer,controls,model,radius,center,dist:radius*4,fit,highlight,focus};
  const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(w>0&&h>0){dirty=true;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}});resize.observe(el);renderer.setSize(el.clientWidth,el.clientHeight);fit();
  const ray=new T.Raycaster(),pointer=new T.Vector2();let downX=0,downY=0;let dragging=false;
  const pick=(ev:PointerEvent)=>{const rect=surface.getBoundingClientRect();pointer.set((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(model.meshes.filter(m=>m.visible&&(m.material as T.MeshStandardMaterial).opacity>.28),false).find(hit=>hit.object.userData.partId)?.object.userData.partId as string|undefined;};
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;dragging=true;};
  const up=(e:PointerEvent)=>{dragging=false;if(Math.hypot(e.clientX-downX,e.clientY-downY)<6){const p=pick(e);if(p){highlight(p);onSelectRef.current(p);}}};
  const move=(e:PointerEvent)=>{if(dragging)return;const p=pick(e);const name=catalog[id-1].parts.find(x=>x.id===p)?.name;setHover(name||'');surface.style.cursor=p?'pointer':'grab';};
  const leave=()=>{dragging=false;setHover('');};
  const lost=(e:Event)=>{e.preventDefault();setError('三维画面已暂停，请刷新页面恢复。设备参数和参考图片仍可查看。');};
  surface.addEventListener('pointerdown',down);surface.addEventListener('pointerup',up);surface.addEventListener('pointermove',move);surface.addEventListener('pointerleave',leave);surface.addEventListener('webglcontextlost',lost);
  let frame=0,prev=0;const tick=(time:number)=>{frame=requestAnimationFrame(tick);if(document.hidden||(software&&(time-prev<65||(!dirty&&!controls.autoRotate))))return;controls.update(Math.min((time-prev)/1000,.1));prev=time;renderer.render(scene,camera);dirty=false;};frame=requestAnimationFrame(tick);
  renderer.render(scene,camera);setReady(true);onReadyRef.current([...model.parts.keys()]);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();controls.dispose();highlight(null);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerleave',leave);surface.removeEventListener('webglcontextlost',lost);const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{const mesh=o as T.Mesh;if(mesh.geometry)geos.add(mesh.geometry);if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());envMap?.dispose();if(renderer instanceof T.WebGLRenderer){renderer.dispose();renderer.forceContextLoss();}surface.remove();state.current=null;};
 },[id]);
 useEffect(()=>{if(state.current)state.current.controls.autoRotate=autoRotate;},[autoRotate,id]);
 useEffect(()=>{state.current?.highlight(selected);},[selected,id]);
 useEffect(()=>{const s=state.current;if(!s)return;s.highlight(null);s.model.parts.forEach((groups,key)=>groups.forEach((g,i)=>{
  if(!g.userData.origin)g.userData.origin=g.position.clone();const origin=g.userData.origin as T.Vector3;g.position.copy(origin);
  if(mode==='explode'){const box=new T.Box3().setFromObject(g),c=box.getCenter(new T.Vector3()).sub(s.center);if(c.length()<.1)c.set(.2,.7,.2);c.normalize().multiplyScalar(s.radius*.22);if(key==='shell'||key==='fence')c.y+=s.radius*.12;g.position.add(c);}
 }));
 s.model.meshes.forEach(m=>{const mat=m.material as T.MeshStandardMaterial;if(m.userData.baseOpacity===undefined)m.userData.baseOpacity=mat.opacity;const outer=m.userData.enclosure||['shell','fence'].includes(m.userData.partId);mat.opacity=mode==='xray'&&outer?.15:m.userData.baseOpacity;mat.transparent=mat.opacity<1;mat.depthWrite=mat.opacity===1;mat.needsUpdate=true;});s.model.root.updateMatrixWorld(true);s.highlight(selected);s.invalidate();
 // Geometry is illustrative; exploded offsets are presentation-only.
 },[mode,id,selected]);
 return <div ref={host} className="viewer-canvas" data-ready={ready}>
  {!ready&&!error&&<div className="viewer-loading"><span className="loading-ring"/>正在构建设备模型</div>}
  {error&&<div className="viewer-error"><strong>三维展示暂不可用</strong><p>{error}</p></div>}
  {hover&&<div className="hover-hint">{hover}<span>点击查看</span></div>}
 </div>;
});
