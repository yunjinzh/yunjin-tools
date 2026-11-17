'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {CompatibilityRenderer} from './CompatibilityRenderer';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {loadVehicleModel,type ModelStatus} from './VehicleModel';
export type SceneProps={step:number;bolts:number;tightened:number;view:string;xray:boolean;explode:number;selected:string;quality:string;onPick:(id:string)=>void};
export default function Scene(props:SceneProps){
 const host=useRef<HTMLDivElement>(null),data=useRef(props);data.current=props;
 const [error,setError]=useState('');
 const [modelStatus,setModelStatus]=useState<ModelStatus>({phase:'loading',progress:0,compat:false});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
 if(!host.current)return;
 let renderer:any;let software=false;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{software=true;renderer=new CompatibilityRenderer();renderer.setQuality('low');renderer.setPixelRatio=()=>{};renderer.shadowMap={enabled:false};renderer.dispose=()=>{};setError('兼容模式 · 附件轻量车模 · 开启 WebGL 可查看完整材质');}
 const root=host.current;renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;root.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#bfc9ca');scene.fog=new T.Fog('#bfc9ca',15,35);
 const camera=new T.PerspectiveCamera(36,1,.1,80);camera.position.set(-6,4.5,6.4);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.1,0);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.49;
 const pmrem=software?null:new T.PMREMGenerator(renderer);const env=new RoomEnvironment();const envMap=pmrem?.fromScene(env,.04);if(envMap)scene.environment=envMap.texture;env.dispose();
 scene.add(new T.HemisphereLight(0xf4ffff,0x48535b,2.1));const sun=new T.DirectionalLight(0xfff3df,4.4);sun.position.set(3,9,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.bias=-.0006;scene.add(sun);const rim=new T.DirectionalLight(0xc6eaff,2);rim.position.set(-6,4,-4);scene.add(rim);if(software){sun.intensity=.65;rim.intensity=.25;scene.add(new T.AmbientLight(0xe5efee,.8));}
 const materials:T.Material[]=[];const mat=(c:string,m=.1,r=.5)=>{const a=new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});materials.push(a);return a;};
 
 const black=mat('#182429',.25,.32),rubber=mat('#14191d',.05,.85),steel=mat('#768992',.8,.24),mint=mat('#74c5b3',.4,.25),orange=mat('#ee782d',.05,.45);
 const pickables:T.Object3D[]=[];const objects:Record<string,T.Object3D[]>={};
 function addPick(o:T.Object3D,id:string){o.userData.id=id;pickables.push(o);(objects[id]??=[]).push(o);return o;}
 function box(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,round=.03){const o=new T.Mesh(round&&!software?new RoundedBoxGeometry(w,h,d,2,round):new T.BoxGeometry(w,h,d,software?Math.max(1,Math.ceil(w*4)):1,software?Math.max(1,Math.ceil(h*2)):1,software?Math.max(1,Math.ceil(d*4)):1),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function cyl(parent:T.Object3D,r:number,h:number,x:number,y:number,z:number,m:T.Material,segments=32){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,software?12:segments),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function tube(parent:T.Object3D,pts:number[][],m:T.Material,r=.025){const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p as [number,number,number])));const o=new T.Mesh(new T.TubeGeometry(curve,software?8:30,r,software?4:8,false),m);parent.add(o);return o;}
 const floor=box(scene,40,.15,40,0,-.12,0,mat('#9eacaf',.25,.7),0);
 floor.visible=!software;const grid=new T.GridHelper(40,40,'#a0afb2','#a8b6b8');grid.position.y=-.036;scene.add(grid);grid.visible=!software;
 const platform=box(scene,7,.12,5,0,.02,0,mat('#596a70',.3,.52));const deck=box(scene,6.8,.025,4.8,0,.09,0,mat('#64777e',.3,.5));platform.visible=deck.visible=true;
 for(const z of [-2.15,2.15])box(scene,6.4,.012,.035,0,.111,z,mint,0);
 for(const x of [-3.1,3.1])box(scene,.035,.012,4.3,x,.111,0,mint,0);
 // Two-column workshop lift, equipment and floor bay markings.
 const liftArms=new T.Group();scene.add(liftArms);
 for(const z of [-1.8,1.8]){
  box(scene,.65,.18,.72,.4,.2,z,black);box(scene,.25,2.6,.34,.4,1.52,z,mat('#526d72',.65,.35));
  box(scene,.28,.5,.37,.4,1.55,z,mint);box(scene,.23,.5,.015,.4,1.55,z+(z>0?.2:-.2),black);
  for(const x of [-1.2,1.2]){const arm=box(liftArms,1.7,.13,.14,x/2,0,z/1.6,steel);arm.rotation.y=z>0?-.3:.3;}
  addPick(box(scene,.35,.45,.2,.4,1.65,z+(z>0?.3:-.3),black),'lift');
 }
 const cart=new T.Group();cart.position.set(-3,.1,-2.7);scene.add(cart);box(cart,.9,.9,.5,0,.55,0,mat('#466163',.5,.4));box(cart,1,.06,.56,0,1.03,0,black);for(let i=0;i<4;i++){box(cart,.8,.025,.025,0,.3+i*.18,.27,steel);}for(const x of [-.32,.32])for(const z of [-.18,.18])cyl(cart,.07,.04,x,.06,z,rubber).rotation.x=Math.PI/2;addPick(box(cart,.5,.1,.3,0,1.13,0,orange),'ppe');
 for(const x of [-3.5,3.5]){cyl(scene,.07,.8,x,.5,-2.2,black);cyl(scene,.15,.05,x,.14,-2.2,orange);}tube(scene,[[-3.5,.8,-2.2],[0,.73,-2.2],[3.5,.8,-2.2]],orange,.014);
 const vehicle=new T.Group();scene.add(vehicle);const shell=new T.Group();vehicle.add(shell);
 const wheels=new T.Group();vehicle.add(wheels);
 let modelRevision=0;
 const carModel=loadVehicleModel(shell,wheels,software,status=>{modelRevision++;setModelStatus(status);},mesh=>addPick(mesh,'vehicle'));
 // Battery pack, cells, rails, busbars and orange HV harnesses.
 const internals=new T.Group();vehicle.add(internals);
 const battery=new T.Group();internals.add(battery);addPick(box(battery,2.85,.17,1.55,0,.35,0,steel),'battery');box(battery,2.7,.12,1.4,0,.45,0,black);
 const modules=new T.Group();battery.add(modules);for(let i=0;i<4;i++)for(let j=0;j<3;j++){const module=box(modules,.57,.12,.37,-1.02+i*.68,.55,-.46+j*.46,mat('#5b8992',.62,.35));addPick(module,'battery');for(let k=0;k<5;k++)box(modules,.025,.015,.33,-1.23+i*.68+k*.095,.617,-.46+j*.46,steel,.003);}
 for(const z of [-.67,.67])tube(battery,[[-1.22,.56,z],[0,.56,z],[1.22,.56,z]],orange,.022);
 const cover=box(battery,2.83,.07,1.52,0,.65,0,mat('#6d8188',.65,.38));addPick(cover,'battery');
 const fasteners:T.Object3D[]=[];for(const x of [-1.25,0,1.25])for(const z of [-.79,.79]){const b=cyl(battery,.056,.07,x,.47,z,steel,6);fasteners.push(b);addPick(b,'bolts');}
 const connector=box(internals,.23,.15,.3,-1.6,.5,.55,orange);addPick(connector,'connector');box(internals,.06,.09,.32,-1.65,.6,.55,black);
 tube(internals,[[-1.61,.51,.54],[-1.87,.5,.52],[-1.85,.6,0],[-1.85,.62,-.6]],orange,.038);
 addPick(box(internals,.34,.17,.37,1.65,.56,0,black),'bms');addPick(box(internals,.3,.2,.35,-1.6,.82,-.45,black),'lv');
 addPick(cyl(internals,.08,.04,-1.4,.63,.45,mint),'test');addPick(box(scene,.3,.15,.3,-2.8,1.17,-2.7,mint),'ref');addPick(box(internals,.25,.09,.2,1.4,.5,.55,mint),'coolant');
 const support=new T.Group();scene.add(support);addPick(box(support,2.9,.12,1.55,0,.5,0,mat('#647778',.6,.4)),'support');for(const z of [-.55,.55]){const a=box(support,1.8,.09,.06,0,.3,z,steel);a.rotation.z=.25;const b=box(support,1.8,.09,.06,0,.3,z,steel);b.rotation.z=-.25;}box(support,2,.08,1.3,0,.14,0,black);
 const highlight=new T.BoxHelper(new T.Object3D(),0x86ead0);highlight.visible=false;scene.add(highlight);
 const ray=new T.Raycaster(),mouse=new T.Vector2();let downX=0,downY=0;const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;};const pick=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(pickables.filter(o=>!(data.current.xray&&o.userData.id==='vehicle')),false).filter(h=>{let o:T.Object3D|null=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(hits[0])data.current.onPick(hits[0].object.userData.id);};renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',pick);
 const resize=new ResizeObserver(()=>{const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(root);
 let frame=0,lastRender=0,lastView='',lastQuality='',lastSignature='',lastExplode=-1,lastRemoved=false;const clock=new T.Clock();let camTo:T.Vector3|null=null;
 function loop(){frame=requestAnimationFrame(loop);const p=data.current,dt=Math.min(clock.getDelta(),.06),speed=1-Math.exp(-dt*4);const raised=p.step>=6||p.explode>0;vehicle.position.y=T.MathUtils.lerp(vehicle.position.y,raised?1.15:.1,speed);liftArms.position.y=vehicle.position.y+.16;
 shell.visible=true;carModel.update(p.xray);
 const removed=p.step>=11&&p.step<13;internals.visible=!software||p.xray||p.explode>0||removed;const bx=removed?2.6:0;const by=removed?-.5:0;battery.position.x=T.MathUtils.lerp(battery.position.x,bx,speed);battery.position.y=T.MathUtils.lerp(battery.position.y,by-p.explode*.45,speed);
 shell.position.y=T.MathUtils.lerp(shell.position.y,p.explode*1.2,speed);cover.position.y=T.MathUtils.lerp(cover.position.y,.65+p.explode*.8,speed);modules.position.y=T.MathUtils.lerp(modules.position.y,p.explode*.25,speed);
 support.visible=p.step>=9||p.explode>0;support.position.x=T.MathUtils.lerp(support.position.x,bx,speed);support.position.y=T.MathUtils.lerp(support.position.y,vehicle.position.y+by-p.explode*.45-.295,speed);
 fasteners.forEach((b,i)=>{b.visible=!(i<p.bolts&&p.step<13);b.position.y=.47+p.explode*.23;});connector.position.z=T.MathUtils.lerp(connector.position.z,p.step>=8&&p.step<15?.94:.55,speed);
 if(p.view!==lastView||p.explode!==lastExplode||removed!==lastRemoved){lastView=p.view;lastExplode=p.explode;lastRemoved=removed;const pos:Record<string,number[]>={iso:[-6,4.5,6.4],front:[-8,3,0],top:[.01,11,.01],bottom:[5,1.1,6],battery:[4.8,4.2,4.8]};camTo=new T.Vector3(...(pos[p.view]??pos.iso) as [number,number,number]);if(p.explode)camTo.multiplyScalar(1.12);if(p.view==='battery'&&removed)camTo.x+=2.6;}
 controls.target.x=T.MathUtils.lerp(controls.target.x,p.view==='battery'&&removed?2.6:0,speed);
 controls.target.y=T.MathUtils.lerp(controls.target.y,p.explode?1.9:1.1,speed);
 if(camTo){camera.position.lerp(camTo,speed);if(camera.position.distanceTo(camTo)<.03)camTo=null;}
 if(lastQuality!==p.quality){lastQuality=p.quality;renderer.setPixelRatio(p.quality==='low'?1:Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=p.quality!=='low';}
 const chosen=objects[p.selected]?.find(o=>{let a:T.Object3D|null=o;while(a){if(!a.visible)return false;a=a.parent;}return true;});highlight.visible=!!chosen&&p.selected!=='vehicle';if(chosen)highlight.setFromObject(chosen);controls.update();if(!software||performance.now()-lastRender>180){const signature=software?[p.step,p.bolts,p.tightened,p.xray,p.explode,p.selected,p.quality,root.clientWidth,root.clientHeight,modelRevision,...camera.position.toArray(),...camera.quaternion.toArray(),vehicle.position.y,battery.position.x,battery.position.y,shell.position.y,cover.position.y,modules.position.y,support.position.x,support.position.y,connector.position.z].map(n=>typeof n==='number'?n.toFixed(3):n).join('|'):'';if(!software||signature!==lastSignature){renderer.render(scene,camera);lastSignature=signature;}lastRender=performance.now();}
 }loop();
 return()=>{carModel.dispose();cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerup',pick);renderer.domElement.removeEventListener('pointerdown',down);scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());envMap?.dispose();pmrem?.dispose();renderer.dispose();renderer.domElement.remove();};
 },[retry]);
 return <div className="scene-canvas"><div className="scene-mount" ref={host}/>{error&&modelStatus.phase==='ready'&&<div className="compat-label">{error}</div>}{modelStatus.phase!=='ready'&&<div className="model-loading" role="status">{modelStatus.phase==='error'?<><strong>车模加载未完成</strong><span>请检查网络后重新加载附件车模。</span><button onClick={()=>setRetry(n=>n+1)}>重新加载</button></>:<><span className="model-spinner"/><strong>正在加载 Tesla Model 3</strong><span>{modelStatus.progress>=96?'正在准备模型与材质…':`附件${modelStatus.compat?'轻量':'完整'}车模 · ${modelStatus.progress}%`}</span><progress max={100} value={modelStatus.progress}/></>}</div>}</div>;
}
