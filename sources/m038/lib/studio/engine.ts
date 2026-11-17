import * as THREE from 'three';
import {SoftwareRenderer} from './software-renderer';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {DEFAULT_SETTINGS, STICKERS, type Settings, type LayerInfo} from './types';
import {canvasFont} from './fonts';
import {explosionOffsets} from './explode';
import {captureEngine,restoreEngine,type EngineSnapshot} from './project-engine';
import type {PartKnowledge} from './teaching';
import {paintAnnotations} from './annotations';
import {cloneAnnotations,cloneView,tourDuration,frameTime,sampleTour,interpolateView,annotationCrossfade,MAX_KEYFRAMES,MAX_TOUR_SECONDS,EMPTY_PLAYBACK,type AnnotationInfo,type SceneView,type TourKeyframe,type TourPlayback,type AnnotationPaint} from './tour';

// Placement coordinates belong to the target mesh and stay stable during exploded views.
type Placement={mesh:THREE.Mesh;point:THREE.Vector3;normal:THREE.Vector3;size:number;rotation:number;aspect:number;texture:THREE.Texture;};
type Layer={info:LayerInfo;group:THREE.Group;placement?:Placement;};
type Command={undo:()=>void;redo:()=>void};
type Hooks={onChange:(layers:LayerInfo[],selected:string|null,undo:boolean,redo:boolean)=>void;onPart:(name:string)=>void;onInspect?:(id:string)=>void;onError:(message:string)=>void;onAnnotations?:(items:AnnotationInfo[],selected:string|null)=>void;onKeyframes?:(frames:TourKeyframe[],selected:string|null)=>void;onPlayback?:(state:TourPlayback)=>void;onScene?:(view:SceneView)=>void;};
export class StudioEngine{
 renderer:THREE.WebGLRenderer;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.01,200);controls:OrbitControls;
 model=new THREE.Group();decalRoot=new THREE.Group();meshes:THREE.Mesh[]=[];layers:Layer[]=[];selected:string|null=null;part:THREE.Mesh|null=null;
 settings:Settings={...DEFAULT_SETTINGS};background='#eef0f3';autoRotate=false;history:Command[]=[];redoStack:Command[]=[];
 explosion=0;private explodeOffsets=new Map<THREE.Mesh,THREE.Vector3>();
 private ground:THREE.Mesh;private grid:THREE.GridHelper;private boxHelper:THREE.BoxHelper;private ray=new THREE.Raycaster();private observer:ResizeObserver;
 private frame=0;private running=true;private down=false;private space=false;private stroke:Layer|null=null;private lastPoint:THREE.Vector3|null=null;private brushTexture:THREE.Texture|null=null;
 private drag:Layer|null=null;private dragStart:Placement|null=null;private startXY={x:0,y:0};private moved=false;private lastStamp=0;private stampCount=0;private height=1;private width=4;
 private cursor:THREE.Mesh;private env:THREE.WebGLRenderTarget|null=null;software=false;private resources=new Set<THREE.Object3D>();private textures=new Set<THREE.Texture>();private hooks:Hooks;
 private captureCanvas:HTMLCanvasElement|null=null;private captureCtx:CanvasRenderingContext2D|null=null;private recorder:MediaRecorder|null=null;private recordChunks:BlobPart[]=[];private recordStream:MediaStream|null=null;
 private recording=false;private tour=false;private tourStart=0;private tourDuration=0;private tourAngle=0;private onRecordDone:((blob:Blob)=>void)|null=null;private initialAzimuth=0;
 annotations:AnnotationInfo[]=[];selectedAnnotation:string|null=null;keyframes:TourKeyframe[]=[];selectedKeyframe:string|null=null;playback:TourPlayback={...EMPTY_PLAYBACK};
 private annotationDraft={text:'部件说明',color:'#4856ed'};private relocateAnnotation:string|null=null;
 private annotationCanvas:HTMLCanvasElement;private pendingAnnotationCanvas:HTMLCanvasElement;private annotationBlend:AnnotationPaint[]|null=null;
 private playbackEpoch=0;private playbackNotice=0;private recordingKeyframes=false;private captureBusy=false;private exportBusy=false;
 constructor(private host:HTMLElement,hooks:Hooks){
 this.hooks=hooks;try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer() as unknown as THREE.WebGLRenderer;this.software=true;}
 this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
 this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.domElement.setAttribute('aria-label','可交互的三维模型画布');host.appendChild(this.renderer.domElement);
 this.annotationCanvas=document.createElement('canvas');this.annotationCanvas.className='annotation-overlay';this.annotationCanvas.setAttribute('aria-label','模型部件文本标注');this.annotationCanvas.style.cssText='position:absolute;inset:0;pointer-events:none;';host.appendChild(this.annotationCanvas);
 this.pendingAnnotationCanvas=document.createElement('canvas');
 if(this.software){const renderer=this.renderer as unknown as SoftwareRenderer;renderer.onBeforeFrame=()=>this.drawAnnotationCanvas(this.pendingAnnotationCanvas);renderer.onAfterFrame=()=>{const ctx=this.annotationCanvas.getContext('2d')!;ctx.clearRect(0,0,this.annotationCanvas.width,this.annotationCanvas.height);ctx.drawImage(this.pendingAnnotationCanvas,0,0,this.annotationCanvas.width,this.annotationCanvas.height);this.captureFrame();};}
 this.scene.background=new THREE.Color(this.background);
 if(!this.software){const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(this.renderer);this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;pmrem.dispose();room.dispose();}
 this.scene.add(new THREE.HemisphereLight(0xffffff,0x8993a4,2));
 const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,7,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.018;key.shadow.bias=-.0004;this.scene.add(key);
 const rim=new THREE.DirectionalLight(0xb3c8ff,2);rim.position.set(-4,3,-4);this.scene.add(rim);
 this.ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));this.ground.rotation.x=-Math.PI/2;this.ground.position.y=-.02;this.ground.receiveShadow=true;this.scene.add(this.ground);
 this.grid=new THREE.GridHelper(20,40,0xa4acbc,0xd6dae3);this.grid.position.y=-.018;this.grid.visible=false;this.scene.add(this.grid);
 this.scene.add(this.model,this.decalRoot);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.1;this.controls.minDistance=.4;this.controls.maxDistance=30;this.controls.maxPolarAngle=Math.PI*.95;
 this.boxHelper=new THREE.BoxHelper(new THREE.Object3D(),0x4856ed);this.boxHelper.visible=false;this.scene.add(this.boxHelper);
 this.cursor=new THREE.Mesh(new THREE.RingGeometry(.46,.5,48),new THREE.MeshBasicMaterial({color:'#4856ed',side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.75}));this.cursor.visible=false;this.cursor.renderOrder=10000;this.scene.add(this.cursor);
 this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
 const el=this.renderer.domElement;el.addEventListener('pointerdown',this.pointerDown,true);el.addEventListener('pointermove',this.pointerMove);window.addEventListener('pointerup',this.pointerUp);el.addEventListener('pointerleave',this.leave);el.addEventListener('contextmenu',this.context);window.addEventListener('keydown',this.keydown);window.addEventListener('keyup',this.keyup);window.addEventListener('blur',this.blur);
 this.loop();
 }
 private context=(e:Event)=>e.preventDefault();
 private leave=()=>{this.cursor.visible=false;};
 private resize=()=>{if(this.exportBusy)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(w<1||h<1)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.annotationCanvas.width=this.renderer.domElement.width;this.annotationCanvas.height=this.renderer.domElement.height;};
 get tourActive(){return !!this.playback&&this.playback.status!=='stopped';}
 private get inputLocked(){return this.tourActive||this.captureBusy||this.exportBusy||this.recording&&this.tour;}
 private loop=()=>{
 if(!this.running)return;this.frame=requestAnimationFrame(this.loop);if(this.exportBusy)return;
 let complete=false;
 if(this.playback.status==='playing'){const seconds=Math.min(this.playback.duration,(performance.now()-this.playbackEpoch)/1000);this.applyTourTime(seconds);complete=seconds>=this.playback.duration;}
 else if(!this.tourActive&&!this.captureBusy){this.controls.autoRotate=this.autoRotate&&!this.down&&!this.recording;this.controls.autoRotateSpeed=1.7;this.controls.update();}
 if(this.recording&&this.tour){const progress=Math.min(1,(performance.now()-this.tourStart)/this.tourDuration);const radius=this.camera.position.distanceTo(this.controls.target);const polar=this.controls.getPolarAngle();const theta=this.tourAngle+progress*Math.PI*2;this.camera.position.setFromSphericalCoords(radius,polar,theta).add(this.controls.target);this.camera.lookAt(this.controls.target);complete=progress>=1;}
 this.renderer.render(this.scene,this.camera);
 if(!this.software||!(this.renderer as unknown as SoftwareRenderer).isRendering){this.drawAnnotationCanvas(this.annotationCanvas);this.captureFrame();}
 if(complete){if(this.recording)this.stopRecording();else this.stopTour();}
 };
 private drawAnnotationCanvas(canvas:HTMLCanvasElement){
 const source=this.renderer.domElement;if(canvas.width!==source.width)canvas.width=source.width;if(canvas.height!==source.height)canvas.height=source.height;
 const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,canvas.width,canvas.height);
 paintAnnotations(ctx,canvas.width,canvas.height,this.camera,this.meshes,this.annotationBlend??this.annotations.map(annotation=>({annotation,opacity:1})),this.tourActive||this.recording?null:this.selectedAnnotation);
 }
 private captureFrame(){
 if(!this.recording||!this.captureCanvas||!this.captureCtx)return;
 const c=this.captureCanvas,ctx=this.captureCtx;ctx.fillStyle=this.background;ctx.fillRect(0,0,c.width,c.height);const src=this.renderer.domElement;const scale=Math.min(c.width/src.width,c.height/src.height);const x=(c.width-src.width*scale)/2,y=(c.height-src.height*scale)/2;
 ctx.drawImage(src,x,y,src.width*scale,src.height*scale);ctx.drawImage(this.annotationCanvas,x,y,src.width*scale,src.height*scale);
 }
 setModel(root:THREE.Object3D,id:string){
 root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root);let size=box.getSize(new THREE.Vector3());
 if(id==='cbd'||id==='mx3'){
 if(size.z>size.y&&size.z>size.x)root.rotateX(-Math.PI/2);else if(size.x>size.y&&size.x>size.z)root.rotateZ(Math.PI/2);
 root.updateMatrixWorld(true);box.setFromObject(root);size=box.getSize(new THREE.Vector3());
 }
 const center=box.getCenter(new THREE.Vector3()),max=Math.max(size.x,size.y,size.z);
 if(!Number.isFinite(max)||max<1e-10)throw Error('模型为空，或尺寸数据无效。');
 let validMeshes=0;root.traverse(o=>{if((o as THREE.Mesh).isMesh&&(o as THREE.Mesh).geometry?.getAttribute('position')?.count>0)validMeshes++;});if(!validMeshes)throw Error('模型内没有可显示的网格。');
 this.stopTour();this.annotations=[];this.selectedAnnotation=null;this.keyframes=[];this.selectedKeyframe=null;this.playback={...EMPTY_PLAYBACK};this.annotationBlend=null;this.relocateAnnotation=null;this.notifyAnnotations();this.notifyKeyframes();this.notifyPlayback(true);
 this.finishStroke();this.clearHistory();this.disposeModel();
 const s=4.6/max;const normalize=new THREE.Matrix4().makeScale(s,s,s).multiply(new THREE.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
 root.traverse(obj=>{if(!(obj as THREE.Mesh).isMesh)return;const orig=obj as THREE.Mesh;if(!orig.geometry?.getAttribute('position'))return;
 const geometry=orig.geometry.clone();geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(normalize,obj.matrixWorld));geometry.computeBoundingBox();geometry.computeBoundingSphere();
 if(!geometry.getAttribute('normal'))geometry.computeVertexNormals();
 const cloneMat=(m:THREE.Material)=>{const mat=m.clone() as THREE.MeshStandardMaterial;mat.side=THREE.DoubleSide;if('envMapIntensity'in mat)mat.envMapIntensity=1.0;return mat;};
 const mat=Array.isArray(orig.material)?orig.material.map(cloneMat):cloneMat(orig.material);const mesh=new THREE.Mesh(geometry,mat);mesh.name=orig.name||'模型零件 '+(this.meshes.length+1);mesh.userData={partId:orig.userData.partId||'part-'+String(this.meshes.length+1).padStart(4,'0'),...(orig.userData.knowledge?{knowledge:orig.userData.knowledge}:{})};mesh.castShadow=true;mesh.receiveShadow=true;this.model.add(mesh);this.meshes.push(mesh);
 });
 if(!this.meshes.length)throw Error('模型内没有可显示的网格。');
 // Dispose original geometry/material wrappers; texture resources are shared with clones.
 root.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh;m.geometry.dispose();(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>x.dispose());}});
 this.explosion=0;this.explodeOffsets=explosionOffsets(this.meshes);this.ground.position.y=-.02;this.grid.position.y=-.018;
 this.height=size.y*s;this.width=size.x*s;this.controls.target.set(0,this.height/2,0);this.part=this.meshes.find(m=>(Array.isArray(m.material)?m.material:[m.material]).some(x=>/car_body/i.test(x.name)))||this.meshes[0];this.hooks.onPart(this.part.name);this.fit();this.notify();
 }
 private notifyAnnotations(){this.hooks.onAnnotations?.(cloneAnnotations(this.annotations),this.selectedAnnotation);}
 private notifyKeyframes(){this.playback.duration=tourDuration(this.keyframes);this.playback.time=THREE.MathUtils.clamp(this.playback.time,0,this.playback.duration);this.playback.frameIndex=Math.min(this.playback.frameIndex,Math.max(0,this.keyframes.length-1));this.hooks.onKeyframes?.(this.keyframes.map(f=>({...f,view:cloneView(f.view)})),this.selectedKeyframe);this.notifyPlayback(true);}
 private notifyPlayback(force=false){if(force||performance.now()-this.playbackNotice>100){this.playbackNotice=performance.now();this.hooks.onPlayback?.({...this.playback});}}
 setAnnotationDraft(draft:{text:string;color:string}){this.annotationDraft={text:draft.text.slice(0,280),color:/^#[\da-f]{6}$/i.test(draft.color)?draft.color:'#4856ed'};}
 selectAnnotation(id:string|null){if(this.inputLocked)return;this.selectedAnnotation=id&&this.annotations.some(a=>a.id===id)?id:null;this.relocateAnnotation=null;this.notifyAnnotations();}
 updateAnnotation(id:string,changes:Partial<Pick<AnnotationInfo,'text'|'color'|'visible'|'offset'>>){
 if(this.inputLocked)return;const annotation=this.annotations.find(a=>a.id===id);if(!annotation)return;
 if(changes.text!==undefined)annotation.text=changes.text.slice(0,280);
 if(changes.color&&/^#[\da-f]{6}$/i.test(changes.color))annotation.color=changes.color;
 if(changes.visible!==undefined)annotation.visible=changes.visible;
 if(changes.offset)annotation.offset=[THREE.MathUtils.clamp(changes.offset[0],-.8,.8),THREE.MathUtils.clamp(changes.offset[1],-.8,.8)];
 this.notifyAnnotations();
 }
 removeAnnotation(id:string){if(this.inputLocked)return;this.annotations=this.annotations.filter(a=>a.id!==id);if(this.selectedAnnotation===id)this.selectedAnnotation=null;this.relocateAnnotation=null;this.notifyAnnotations();}
 relocateSelectedAnnotation(){if(this.inputLocked||!this.selectedAnnotation)return;this.relocateAnnotation=this.selectedAnnotation;}
 private placeAnnotation(hit:THREE.Intersection){
 const mesh=hit.object as THREE.Mesh;const anchor=mesh.worldToLocal(hit.point.clone()).toArray() as [number,number,number];
 const moving=this.annotations.find(a=>a.id===this.relocateAnnotation);
 if(moving){moving.meshId=mesh.uuid;moving.partName=mesh.name;moving.anchor=anchor;this.relocateAnnotation=null;}
 else{if(this.annotations.length>=40){this.hooks.onError('当前视角最多添加 40 条标注，请先精简内容。');return;}
 const annotation:AnnotationInfo={id:THREE.MathUtils.generateUUID(),meshId:mesh.uuid,partName:mesh.name,anchor,text:this.annotationDraft.text.trim()||'部件说明',color:this.annotationDraft.color,visible:true,offset:[.055,-.11]};this.annotations.push(annotation);this.selectedAnnotation=annotation.id;}
 this.notifyAnnotations();
 }
 sceneView():SceneView{return{position:this.camera.position.toArray() as [number,number,number],target:this.controls.target.toArray() as [number,number,number],fov:this.camera.fov,zoom:this.camera.zoom,explosion:this.explosion,background:this.background,exposure:this.renderer.toneMappingExposure,grid:this.grid.visible,annotations:cloneAnnotations(this.annotations),parts:this.partList().map(({id,visible,opacity})=>({id,visible,opacity}))};}
 private applyView(view:SceneView){
 this.camera.position.fromArray(view.position);this.controls.target.fromArray(view.target);this.camera.fov=view.fov;this.camera.zoom=view.zoom;this.camera.lookAt(this.controls.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);
 if(Math.abs(this.explosion-view.explosion)>.00001)this.setExplode(view.explosion);
 if(view.parts){for(const p of view.parts)this.setPartDisplay(p.id,p.visible,p.opacity);}
 this.setBackground(view.background);this.setGrid(view.grid);this.setExposure(view.exposure);this.annotations=cloneAnnotations(view.annotations);
 }
 private resetControls(){const damping=this.controls.enableDamping;this.controls.autoRotate=false;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;}
 async saveKeyframe(updateId?:string){
 if(this.inputLocked||this.recording)throw Error('请先停止播放或录制，再保存关键帧。');
 if(!this.meshes.length)throw Error('请先载入模型。');
 if(!updateId&&this.keyframes.length>=MAX_KEYFRAMES)throw Error('一个导览最多包含 30 个关键帧。');
 if(updateId&&!this.keyframes.some(f=>f.id===updateId))throw Error('该关键帧已被删除。');
 this.finishStroke();this.autoRotate=false;this.resetControls();this.captureBusy=true;this.controls.enabled=false;
 try{
 if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();
 this.renderer.render(this.scene,this.camera);if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();
 this.drawAnnotationCanvas(this.annotationCanvas);
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=Math.round(320/this.camera.aspect);const ctx=canvas.getContext('2d')!;ctx.drawImage(this.renderer.domElement,0,0,canvas.width,canvas.height);ctx.drawImage(this.annotationCanvas,0,0,canvas.width,canvas.height);
 const old=this.keyframes.find(f=>f.id===updateId);
 const frame:TourKeyframe={id:old?.id??THREE.MathUtils.generateUUID(),name:old?.name??`视角 ${String(this.keyframes.length+1).padStart(2,'0')}`,hold:old?.hold??2,transition:old?.transition??3,thumbnail:canvas.toDataURL('image/jpeg',.72),view:this.sceneView()};
 const next=old?this.keyframes.map(f=>f.id===old.id?frame:f):[...this.keyframes,frame];
 if(tourDuration(next)>MAX_TOUR_SECONDS)throw Error('导览总时长最多 180 秒，请缩短停留或过渡时间。');
 this.keyframes=next;this.selectedKeyframe=frame.id;this.playback.time=frameTime(next,next.indexOf(frame));this.playback.frameIndex=next.indexOf(frame);this.notifyKeyframes();
 }finally{this.captureBusy=false;this.controls.enabled=this.settings.tool==='orbit'||this.space;}
 }
 updateKeyframe(id:string,changes:Partial<Pick<TourKeyframe,'name'|'hold'|'transition'>>){
 if(this.tourActive||this.recording||this.captureBusy)return;
 const next=this.keyframes.map(frame=>frame.id!==id?frame:{...frame,...(changes.name!==undefined?{name:changes.name.slice(0,40)}:{}),...(changes.hold!==undefined?{hold:THREE.MathUtils.clamp(Number.isFinite(changes.hold)?changes.hold:2,.5,15)}:{}),...(changes.transition!==undefined?{transition:THREE.MathUtils.clamp(Number.isFinite(changes.transition)?changes.transition:3,.5,15)}:{})});
 if(tourDuration(next)>MAX_TOUR_SECONDS){this.hooks.onError('导览总时长最多 180 秒。');return;}this.keyframes=next;this.notifyKeyframes();
 }
 moveKeyframe(id:string,delta:number){if(this.tourActive||this.recording||this.captureBusy)return;const index=this.keyframes.findIndex(f=>f.id===id),to=index+delta;if(index<0||to<0||to>=this.keyframes.length)return;const next=[...this.keyframes];[next[index],next[to]]=[next[to],next[index]];if(tourDuration(next)>MAX_TOUR_SECONDS){this.hooks.onError('调整顺序后超过 180 秒，请先缩短时长。');return;}this.keyframes=next;this.notifyKeyframes();}
 removeKeyframe(id:string){if(this.tourActive||this.recording||this.captureBusy)return;this.keyframes=this.keyframes.filter(f=>f.id!==id);if(this.selectedKeyframe===id)this.selectedKeyframe=null;this.playback.time=0;this.playback.frameIndex=0;this.notifyKeyframes();}
 jumpKeyframe(id:string){
 if(this.recording||this.captureBusy)return;const frame=this.keyframes.find(f=>f.id===id);if(!frame)return;
 this.stopTour();this.autoRotate=false;this.resetControls();this.applyView(frame.view);this.annotationBlend=null;this.selectedAnnotation=null;this.selectedKeyframe=id;this.playback.time=frameTime(this.keyframes,this.keyframes.indexOf(frame));this.playback.frameIndex=this.keyframes.indexOf(frame);this.relocateAnnotation=null;this.notifyAnnotations();this.notifyKeyframes();this.hooks.onScene?.(this.sceneView());
 }
 private beginTour(){
 if(this.keyframes.length<2)throw Error('请至少添加 2 个关键帧，再播放或导出导览。');
 this.finishStroke();this.autoRotate=false;this.resetControls();this.controls.enabled=false;this.cursor.visible=false;this.boxHelper.visible=false;this.annotationBlend=null;
 const resume=this.playback.status==='paused';const time=resume?this.playback.time:0;
 this.playback={status:'playing',time,duration:tourDuration(this.keyframes),frameIndex:0};this.playbackEpoch=performance.now()-time*1000;this.applyTourTime(time);this.notifyPlayback(true);
 }
 playTour(){if(this.recording||this.captureBusy||this.exportBusy)throw Error('请先结束当前操作。');this.beginTour();}
 pauseTour(){if(this.recording||this.playback.status!=='playing')return;this.playback.status='paused';this.notifyPlayback(true);}
 stopTour(){
 if(!this.playback||this.playback.status==='stopped')return;const sample=this.keyframes.length?sampleTour(this.keyframes,this.playback.time):null;this.selectedKeyframe=sample?(sample.mix===0?sample.from.id:sample.mix===1?sample.to.id:null):null;this.playback.status='stopped';this.annotationBlend=null;this.selectedAnnotation=null;this.controls.enabled=this.settings.tool==='orbit'||this.space;this.notifyAnnotations();this.notifyKeyframes();this.hooks.onScene?.(this.sceneView());
 }
 seekTour(seconds:number){if(this.recording||this.captureBusy||this.keyframes.length<2)return;this.autoRotate=false;this.resetControls();const playing=this.playback.status==='playing';this.playback.status=playing?'playing':'paused';this.controls.enabled=false;const time=THREE.MathUtils.clamp(seconds,0,tourDuration(this.keyframes));this.playbackEpoch=performance.now()-time*1000;this.applyTourTime(time);this.notifyPlayback(true);}
 private applyTourTime(seconds:number){const sample=sampleTour(this.keyframes,seconds);this.applyView(interpolateView(sample.from.view,sample.to.view,sample.mix));this.annotationBlend=annotationCrossfade(sample.from.view.annotations,sample.to.view.annotations,sample.mix);this.playback.time=seconds;this.playback.frameIndex=sample.mix>=.5?Math.min(sample.index+1,this.keyframes.length-1):sample.index;this.notifyPlayback();}
 stats(){let triangles=0;for(const m of this.meshes)triangles+=(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3;return{parts:this.meshes.length,triangles:Math.round(triangles)};}
 setExplode(percent:number){
 if(!Number.isFinite(percent))return;
 this.finishStroke();this.explosion=this.meshes.length>1?THREE.MathUtils.clamp(percent,0,100):0;
 for(const mesh of this.meshes)mesh.position.copy(this.explodeOffsets.get(mesh)??new THREE.Vector3()).multiplyScalar(this.explosion/100);
 this.model.updateMatrixWorld(true);this.syncDecals();this.cursor.visible=false;
 if(this.part&&this.boxHelper.visible)this.boxHelper.setFromObject(this.part);
 const minY=new THREE.Box3().setFromObject(this.model).min.y;if(Number.isFinite(minY)){this.ground.position.y=minY-.02;this.grid.position.y=minY-.018;}
 // Exploding changes part positions only. Keep the user's camera, zoom and orbit target.
 }
 private syncDecals(){
 // Include detached undo/redo layers so restoring one also restores its current position.
 for(const group of this.resources)group.traverse(object=>{const target=object.userData.targetMesh as THREE.Mesh|undefined;if(target){object.position.copy(target.position);object.visible=target.visible;}});
 this.decalRoot.updateMatrixWorld(true);
 }
 fit(preserveDirection=false){
 if(this.inputLocked)return;
 this.model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(this.model);if(box.isEmpty())return;
 const center=box.getCenter(new THREE.Vector3());const direction=preserveDirection?this.camera.position.clone().sub(this.controls.target).normalize():new THREE.Vector3(1,.45,1.5).normalize();
 this.controls.target.copy(center);this.camera.position.copy(center).add(direction);this.camera.lookAt(center);
 const inverseRotation=this.camera.quaternion.clone().invert(),tan=Math.tan(THREE.MathUtils.degToRad(this.camera.fov)/2);let distance=.4;
 // Used only by an explicit fit/view action or when loading a model.
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
 const point=new THREE.Vector3(x,y,z).sub(center).applyQuaternion(inverseRotation);
 distance=Math.max(distance,point.z+Math.abs(point.x)/(tan*this.camera.aspect*.82),point.z+Math.abs(point.y)/(tan*.74));
 }
 this.camera.position.copy(direction.multiplyScalar(distance*1.02).add(center));this.camera.lookAt(center);this.camera.updateMatrixWorld(true);

 const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;this.initialAzimuth=this.controls.getAzimuthalAngle();
 }
 view(view:string){if(this.inputLocked)return;const dist=this.camera.position.distanceTo(this.controls.target);const dirs:Record<string,number[]>={front:[0,.06,1],back:[0,.06,-1],left:[-1,.06,0],right:[1,.06,0],top:[0,1,.001]};if(view==='perspective'){this.fit();return;}const p=dirs[view];if(!p)return;this.camera.position.copy(new THREE.Vector3(...p).normalize().multiplyScalar(dist).add(this.controls.target));this.controls.update();}
 zoom(factor:number){if(this.inputLocked)return;this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);this.controls.update();}
 setSettings(s:Settings){this.settings={...s};this.controls.enabled=!this.inputLocked&&(s.tool==='orbit'||this.space);this.cursor.visible=false;this.renderer.domElement.style.cursor=s.tool==='orbit'?'grab':s.tool==='select'?'move':'crosshair';this.boxHelper.visible=!this.inputLocked&&(s.tool==='fill'||s.tool==='inspect')&&!!this.part;if(this.part&&this.boxHelper.visible)this.boxHelper.setFromObject(this.part);}
 setBackground(color:string){this.background=color;this.scene.background=new THREE.Color(color);}
 setGrid(value:boolean){this.grid.visible=value;}
 setExposure(value:number){this.renderer.toneMappingExposure=value;}
 private hit(e:{clientX:number;clientY:number}){this.model.updateMatrixWorld(true);this.decalRoot.updateMatrixWorld(true);const rect=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),this.camera);return this.ray.intersectObjects(this.meshes.filter(m=>m.visible),false)[0];}
 private surface(hit:THREE.Intersection){const normal=hit.face!.normal.clone().transformDirection(hit.object.matrixWorld);if(normal.dot(this.ray.ray.direction)>0)normal.negate();return normal;}
 private pointerDown=(e:PointerEvent)=>{
 if(!this.meshes.length||this.inputLocked)return;
 this.controls.enabled=this.settings.tool==='orbit'||this.space||e.button!==0;
 if(this.controls.enabled)return;
 e.preventDefault();this.down=true;this.moved=false;this.startXY={x:e.clientX,y:e.clientY};this.lastPoint=null;this.stampCount=0;
 const hit=this.hit(e);if(!hit)return;
 if(this.settings.tool==='inspect'){this.selectPart((hit.object as THREE.Mesh).userData.partId);return;}
 if(this.settings.tool==='annotation'){this.placeAnnotation(hit);return;}
 if(this.settings.tool==='fill'){this.part=hit.object as THREE.Mesh;this.hooks.onPart(this.part.name);this.boxHelper.setFromObject(this.part);this.boxHelper.visible=true;this.paintPart(this.settings.color,false);return;}
 if(this.settings.tool==='erase'){const layer=this.pickLayer();if(layer)this.removeLayer(layer.info.id);return;}
 if(this.settings.tool==='select'){const layer=this.pickLayer();this.selected=layer?.info.id||null;this.notify();if(layer?.placement){this.drag=layer;this.dragStart=this.clonePlacement(layer.placement);}return;}
 if(this.settings.tool==='text'||this.settings.tool==='sticker'){this.addStamp(hit);return;}
 if(this.settings.tool==='brush'||this.settings.tool==='spray'){
 this.stroke=this.newLayer(this.settings.tool,this.settings.tool==='spray'?'喷涂':'笔刷');this.brushTexture=this.makeBrush();this.stampStroke(hit);}
 };
 private pointerMove=(e:PointerEvent)=>{
 if(this.settings.tool==='orbit'||this.space||!this.meshes.length||this.inputLocked)return;
 const hit=this.hit(e);if(!hit){this.cursor.visible=false;return;}
 const normal=this.surface(hit);const width=this.sizeWorld(this.settings.size);
 this.cursor.visible=['spray','brush','text','sticker'].includes(this.settings.tool)&&!this.recording;
 this.cursor.position.copy(hit.point).addScaledVector(normal,.003);this.cursor.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);this.cursor.scale.setScalar(width);(this.cursor.material as THREE.MeshBasicMaterial).color.set(this.settings.color);
 if(!this.down)return;this.moved ||=Math.hypot(e.clientX-this.startXY.x,e.clientY-this.startXY.y)>3;
 if(this.drag?.placement){this.drag.placement.mesh=hit.object as THREE.Mesh;this.drag.placement.point.copy(this.drag.placement.mesh.worldToLocal(hit.point.clone()));this.drag.placement.normal.copy(normal).transformDirection(this.drag.placement.mesh.matrixWorld.clone().invert());this.rebuildPlacement(this.drag);}
 if(this.stroke&&performance.now()-this.lastStamp>22){const distance=this.lastPoint?.distanceTo(hit.point)??0;if(!this.lastPoint||distance>width*.09){const from=this.lastPoint?.clone();const steps=from&&distance<width*5?Math.min(10,Math.ceil(distance/(width*.23))):1;for(let i=1;i<=steps&&this.stroke;i++){this.stampStroke({...hit,point:from?from.clone().lerp(hit.point,i/steps):hit.point});}}}
 };
 private pointerUp=()=>{this.down=false;this.controls.enabled=!this.inputLocked&&(this.settings.tool==='orbit'||this.space);this.finishStroke();
 if(this.drag?.placement&&this.dragStart&&this.moved){const layer=this.drag,before=this.dragStart,after=this.clonePlacement(layer.placement!);this.commit({undo:()=>{layer.placement=this.clonePlacement(before);this.rebuildPlacement(layer);},redo:()=>{layer.placement=this.clonePlacement(after);this.rebuildPlacement(layer);}});}
 this.drag=null;this.dragStart=null;};
 private keydown=(e:KeyboardEvent)=>{const tag=(e.target as HTMLElement)?.tagName;if(this.inputLocked||['INPUT','TEXTAREA','SELECT'].includes(tag)||(e.target as HTMLElement)?.isContentEditable)return;
 if(e.code==='Space'){e.preventDefault();this.space=true;this.controls.enabled=true;this.cursor.visible=false;}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?this.redo():this.undo();}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();this.redo();}
 if(e.key==='Delete'&&this.selected)this.removeLayer(this.selected);
 };
 private keyup=(e:KeyboardEvent)=>{if(e.code==='Space'){this.space=false;this.controls.enabled=!this.inputLocked&&this.settings.tool==='orbit';}};
 private blur=()=>{this.space=false;this.pointerUp();};
 private newLayer(kind:string,label:string){const layer:Layer={info:{id:THREE.MathUtils.generateUUID(),name:label+' '+(this.layers.length+1),kind,color:this.settings.color,visible:true,opacity:this.settings.opacity,size:this.settings.size,rotation:this.settings.rotation},group:new THREE.Group()};this.layers.push(layer);this.decalRoot.add(layer.group);this.resources.add(layer.group);this.selected=layer.info.id;return layer;}
 private sizeWorld(v:number){return .025+v/100*2;}
 private stampStroke(hit:THREE.Intersection){if(!this.stroke||!this.brushTexture)return;if(this.stampCount>=350){this.finishStroke();this.hooks.onError('这一笔已达到长度上限，请松开后继续绘制。');return;}
 const mesh=hit.object as THREE.Mesh;const placement:Placement={mesh,point:mesh.worldToLocal(hit.point.clone()),normal:this.surface(hit).transformDirection(mesh.matrixWorld.clone().invert()),size:this.settings.size,rotation:0,aspect:1,texture:this.brushTexture};
 const m=this.createDecal(placement,this.stroke.info.opacity);if(m){this.stroke.group.add(m);this.stampCount++;this.lastStamp=performance.now();this.lastPoint=hit.point.clone();}
 }
 private finishStroke(){if(!this.stroke)return;const layer=this.stroke;this.stroke=null;this.brushTexture=null;
 if(!layer.group.children.length){this.layers=this.layers.filter(x=>x!==layer);this.decalRoot.remove(layer.group);this.notify();return;}
 // Merge per target part: a stroke can cross several parts that move independently.
 const byPart=new Map<THREE.Mesh,THREE.Mesh[]>();
 for(const mesh of [...layer.group.children] as THREE.Mesh[]){const target=mesh.userData.targetMesh as THREE.Mesh;const group=byPart.get(target)??[];group.push(mesh);byPart.set(target,group);}
 for(const [target,meshes] of byPart){if(meshes.length<2)continue;const merged=mergeGeometries(meshes.map(x=>x.geometry));if(!merged)continue;const material=meshes[0].material;meshes.forEach((mesh,index)=>{mesh.geometry.dispose();if(index)(mesh.material as THREE.Material).dispose();layer.group.remove(mesh);});const combined=new THREE.Mesh(merged,material);combined.userData.targetMesh=target;combined.position.copy(target.position);layer.group.add(combined);}
 this.recordAdd(layer);}
 private makeBrush(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const rgb=new THREE.Color(this.settings.color);const hex='#'+rgb.getHexString();if(this.settings.tool==='spray'){
 const g=ctx.createRadialGradient(64,64,Math.max(1,55*(1-this.settings.softness/100)),64,64,62);g.addColorStop(0,hex);g.addColorStop(1,hex+'00');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 }else{ctx.fillStyle=hex;ctx.beginPath();ctx.arc(64,64,62,0,Math.PI*2);ctx.fill();}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;this.textures.add(texture);return texture;}
 private async addStamp(hit:THREE.Intersection){const mode=this.settings.tool;const params={...this.settings};const mesh=hit.object as THREE.Mesh;const point=mesh.worldToLocal(hit.point.clone()),normal=this.surface(hit).transformDirection(mesh.matrixWorld.clone().invert());
 try{const {texture,aspect}=await this.stampTexture(params);if(!this.meshes.includes(mesh))return;const name=mode==='text'?(params.text||'文字').slice(0,14):params.image?'自定义图片':(STICKERS.find(s=>s.id===params.sticker)?.label||'贴纸');
 const layer=this.newLayer(mode,name);layer.placement={mesh,point,normal,size:params.size,rotation:params.rotation,aspect,texture};layer.info.opacity=params.opacity;this.rebuildPlacement(layer);this.recordAdd(layer);
 }catch{this.hooks.onError(mode==='text'?'文字或字体加载失败，请重新选择字体后再试。':'图片无法读取，请尝试 PNG、JPG 或 WebP 图片。');}}
 private async stampTexture(params:Settings):Promise<{texture:THREE.Texture;aspect:number}>{
 const c=document.createElement('canvas');const ctx=c.getContext('2d')!;let aspect=1;
 if(params.tool==='sticker'&&params.image){const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=params.image!;});const scale=Math.min(1,2048/Math.max(img.width,img.height));c.width=Math.ceil(img.width*scale);c.height=Math.ceil(img.height*scale);ctx.drawImage(img,0,0,c.width,c.height);aspect=c.width/c.height;
 }else if(params.tool==='text'){const lines=(params.text.trim()||'由我定义').split('\n').slice(0,5);const font=canvasFont(params.font);await document.fonts.load(font,lines.join(''));ctx.font=font;c.width=Math.max(160,Math.min(2048,Math.ceil(Math.max(...lines.map(x=>ctx.measureText(x).width)))+50));c.height=lines.length*114+30;ctx.font=font;ctx.fillStyle=params.color;ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((line,i)=>ctx.fillText(line,c.width/2,74+i*114,c.width-30));aspect=c.width/c.height;
 }else{const s=STICKERS.find(s=>s.id===params.sticker)||STICKERS[0];c.width=640;c.height=480;ctx.fillStyle=s.color;ctx.beginPath();ctx.roundRect(14,14,612,452,params.sticker==='four'?226:50);ctx.fill();ctx.strokeStyle=s.color==='#272d36'?'#d4fa74':'#fff';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle=['yours','speed','future'].includes(s.id)?'#1b2431':'#fff';ctx.textAlign='center';ctx.textBaseline='middle';const lines=s.text.split('\n');ctx.font=`900 ${lines.length===1?240:100}px "Noto Sans SC",sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,320,240+(i-(lines.length-1)/2)*115,560));aspect=4/3;}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();this.textures.add(texture);return{texture,aspect};
 }
 private createDecal(p:Placement,opacity:number){const orientation=new THREE.Object3D();orientation.position.copy(p.point);orientation.lookAt(p.point.clone().add(p.normal));orientation.rotateZ(THREE.MathUtils.degToRad(p.rotation));const w=this.sizeWorld(p.size);
 const depth=Math.min(.34,Math.max(.035,w*.35)),radius=Math.max(w,w/p.aspect,depth)*.8;
 // Cull and project in mesh-local coordinates; exploded translations are applied afterwards.
 const source=p.mesh.geometry,srcPos=source.getAttribute('position'),srcNormal=source.getAttribute('normal'),indices=source.index;
 const localPositions:number[]=[],localNormals:number[]=[];const count=indices?.count??srcPos.count;const px=p.point.x,py=p.point.y,pz=p.point.z;
 for(let i=0;i<count;i+=3){const ia=indices?indices.getX(i):i,ib=indices?indices.getX(i+1):i+1,ic=indices?indices.getX(i+2):i+2;
 const ax=srcPos.getX(ia),ay=srcPos.getY(ia),az=srcPos.getZ(ia),bx=srcPos.getX(ib),by=srcPos.getY(ib),bz=srcPos.getZ(ib),cx=srcPos.getX(ic),cy=srcPos.getY(ic),cz=srcPos.getZ(ic);
 if(Math.min(ax,bx,cx)>px+radius||Math.max(ax,bx,cx)<px-radius||Math.min(ay,by,cy)>py+radius||Math.max(ay,by,cy)<py-radius||Math.min(az,bz,cz)>pz+radius||Math.max(az,bz,cz)<pz-radius)continue;
 localPositions.push(ax,ay,az,bx,by,bz,cx,cy,cz);for(const j of [ia,ib,ic])localNormals.push(srcNormal.getX(j),srcNormal.getY(j),srcNormal.getZ(j));}
 if(!localPositions.length)return null;
 const patch=new THREE.BufferGeometry();patch.setAttribute('position',new THREE.Float32BufferAttribute(localPositions,3));patch.setAttribute('normal',new THREE.Float32BufferAttribute(localNormals,3));const patchMesh=new THREE.Mesh(patch);const geometry=new DecalGeometry(patchMesh,p.point,orientation.rotation,new THREE.Vector3(w,w/p.aspect,depth));patch.dispose();(patchMesh.material as THREE.Material).dispose();
 // Reject opposite-facing faces so thin parts are painted on the selected surface only.
 const pos=geometry.getAttribute('position'),nor=geometry.getAttribute('normal'),uv=geometry.getAttribute('uv');const kept:number[]=[];
 for(let i=0;i<pos.count;i+=3){if(new THREE.Vector3(nor.getX(i),nor.getY(i),nor.getZ(i)).dot(p.normal)>.1)kept.push(i,i+1,i+2);}
 if(!kept.length){geometry.dispose();return null;}
 if(kept.length!==pos.count){const filtered=new THREE.BufferGeometry();for(const [name,attr]of [['position',pos],['normal',nor],['uv',uv]] as const){const array:number[]=[];for(const index of kept)for(let k=0;k<attr.itemSize;k++)array.push(attr.array[index*attr.itemSize+k]);filtered.setAttribute(name,new THREE.Float32BufferAttribute(array,attr.itemSize));}geometry.dispose();return this.attachDecal(new THREE.Mesh(filtered,this.decalMaterial(p.texture,opacity)),p.mesh);}
 return this.attachDecal(new THREE.Mesh(geometry,this.decalMaterial(p.texture,opacity)),p.mesh);
 }
 private attachDecal(decal:THREE.Mesh,target:THREE.Mesh){decal.userData.targetMesh=target;decal.position.copy(target.position);return decal;}
 private decalMaterial(texture:THREE.Texture,opacity:number){return new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.65,metalness:.05,opacity:opacity/100,side:THREE.DoubleSide});}
 private rebuildPlacement(layer:Layer){if(!layer.placement)return;for(const o of layer.group.children as THREE.Mesh[]){o.geometry.dispose();(o.material as THREE.Material).dispose();}layer.group.clear();const m=this.createDecal(layer.placement,layer.info.opacity);if(m)layer.group.add(m);this.orderLayers();}
 private clonePlacement(p:Placement){return{...p,point:p.point.clone(),normal:p.normal.clone()};}
 private pickLayer(){const hits=this.ray.intersectObjects(this.layers.filter(l=>l.info.visible).map(l=>l.group),true);if(!hits.length)return null;return this.layers.find(l=>hits[0].object.parent===l.group)||null;}
 private recordAdd(layer:Layer){const index=this.layers.indexOf(layer);this.commit({undo:()=>{this.layers=this.layers.filter(x=>x!==layer);this.decalRoot.remove(layer.group);if(this.selected===layer.info.id)this.selected=null;},redo:()=>{this.layers.splice(Math.min(index,this.layers.length),0,layer);this.decalRoot.add(layer.group);this.selected=layer.info.id;}});}
 selectLayer(id:string){this.selected=id;this.notify();}
 updateLayer(id:string,changes:Partial<LayerInfo>,commit=true){const layer=this.layers.find(l=>l.info.id===id);if(!layer)return;const before={...layer.info},after={...layer.info,...changes};const apply=(v:LayerInfo)=>{layer.info={...v};layer.group.visible=v.visible;if(layer.placement){layer.placement.size=v.size;layer.placement.rotation=v.rotation;this.rebuildPlacement(layer);}layer.group.traverse(o=>{if((o as THREE.Mesh).isMesh)((o as THREE.Mesh).material as THREE.Material).opacity=v.opacity/100;});};apply(after);if(commit)this.commit({undo:()=>apply(before),redo:()=>apply(after)});else this.notify();}
 removeLayer(id:string){const index=this.layers.findIndex(x=>x.info.id===id);if(index<0)return;const layer=this.layers[index];const remove=()=>{this.layers=this.layers.filter(x=>x!==layer);this.decalRoot.remove(layer.group);this.selected=null;};remove();this.commit({undo:()=>{this.layers.splice(index,0,layer);this.decalRoot.add(layer.group);this.selected=id;},redo:remove});}
 reorder(id:string,delta:number){const from=this.layers.findIndex(l=>l.info.id===id),to=from+delta;if(from<0||to<0||to>=this.layers.length)return;const swap=()=>{[this.layers[from],this.layers[to]]=[this.layers[to],this.layers[from]];};swap();this.commit({undo:swap,redo:swap});}
 paintPart(color:string,all:boolean){const selected=all?this.meshes:this.part?[this.part]:[];const materials=selected.flatMap(m=>Array.isArray(m.material)?m.material:[m.material]).filter(m=>(m as THREE.MeshStandardMaterial).color) as THREE.MeshStandardMaterial[];
 const before=materials.map(m=>({color:m.color.clone(),roughness:m.roughness,metalness:m.metalness,map:m.map}));const r=this.settings.roughness/100,metal=this.settings.metalness/100;
 const apply=()=>materials.forEach(m=>{m.color.set(color);m.roughness=r;m.metalness=metal;m.map=null;m.needsUpdate=true;});apply();this.commit({undo:()=>materials.forEach((m,i)=>{m.color.copy(before[i].color);m.roughness=before[i].roughness;m.metalness=before[i].metalness;m.map=before[i].map;m.needsUpdate=true;}),redo:apply});}
 private commit(c:Command){this.history.push(c);if(this.history.length>60)this.history.shift();this.redoStack=[];this.notify();}
 undo(){if(this.inputLocked)return;this.finishStroke();const c=this.history.pop();if(c){c.undo();this.redoStack.push(c);this.notify();}}
 redo(){if(this.inputLocked)return;const c=this.redoStack.pop();if(c){c.redo();this.history.push(c);this.notify();}}
 private orderLayers(){this.layers.forEach((layer,index)=>layer.group.traverse(o=>{o.renderOrder=index+1;if((o as THREE.Mesh).isMesh){const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;m.polygonOffsetFactor=-2-index*.15;}}));}
 private notify(){this.orderLayers();this.hooks.onChange(this.layers.map(l=>({...l.info})),this.selected,!!this.history.length,!!this.redoStack.length);}
 private clearHistory(){this.history=[];this.redoStack=[];this.layers=[];this.selected=null;this.decalRoot.clear();this.boxHelper.visible=false;this.cursor.visible=false;}
 async exportImage(width:number,height:number,transparent:boolean,format:'png'|'jpeg'){
 if(this.tourActive||this.recording||this.captureBusy||this.exportBusy)throw Error('请先停止导览或录制，再导出图片。');this.exportBusy=true;
 const size=this.renderer.getSize(new THREE.Vector2()),ratio=this.renderer.getPixelRatio(),aspect=this.camera.aspect,bg=this.scene.background,grid=this.grid.visible,helper=this.boxHelper.visible,cursor=this.cursor.visible;
 try{this.renderer.setPixelRatio(1);this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.boxHelper.visible=false;this.cursor.visible=false;if(transparent){this.scene.background=null;this.grid.visible=false;}this.renderer.render(this.scene,this.camera);
 if(this.software){await(this.renderer as unknown as SoftwareRenderer).flush();this.renderer.render(this.scene,this.camera);await(this.renderer as unknown as SoftwareRenderer).flush();}
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;ctx.drawImage(this.renderer.domElement,0,0,width,height);paintAnnotations(ctx,width,height,this.camera,this.meshes,this.annotations.map(annotation=>({annotation,opacity:1})));
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片生成失败。')),format==='png'?'image/png':'image/jpeg',.95));return blob;
 }finally{this.renderer.setPixelRatio(ratio);this.renderer.setSize(size.x,size.y,false);this.camera.aspect=aspect;this.camera.updateProjectionMatrix();this.scene.background=bg;this.grid.visible=grid;this.boxHelper.visible=helper;this.cursor.visible=cursor;this.exportBusy=false;this.resize();this.renderer.render(this.scene,this.camera);}
 }
 async startRecording(options:{tour:boolean;keyframes?:boolean;duration:number;width:number;height:number;done:(blob:Blob)=>void}){
 if(typeof MediaRecorder==='undefined'||!HTMLCanvasElement.prototype.captureStream)throw Error('此浏览器不支持视频录制，请使用新版 Chrome 或 Edge。');if(this.recording)return;
 if(this.captureBusy||this.exportBusy)throw Error('请等待当前操作完成。');if(options.keyframes&&this.keyframes.length<2)throw Error('请至少添加 2 个关键帧，再导出导览。');this.stopTour();
 const types=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];const mime=types.find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('浏览器没有可用的视频编码器。');
 this.captureBusy=true;this.autoRotate=false;this.controls.enabled=false;this.resetControls();
 try{if(options.keyframes)this.applyView(this.keyframes[0].view);if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();this.renderer.render(this.scene,this.camera);if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();this.drawAnnotationCanvas(this.annotationCanvas);}finally{this.captureBusy=false;this.controls.enabled=this.settings.tool==='orbit'||this.space;}
 const c=document.createElement('canvas');c.width=options.width;c.height=options.height;this.captureCanvas=c;this.captureCtx=c.getContext('2d');this.recordStream=c.captureStream(30);
 try{this.recorder=new MediaRecorder(this.recordStream,{mimeType:mime,videoBitsPerSecond:10000000});}catch(e){this.recordStream.getTracks().forEach(t=>t.stop());throw e;}
 this.recordChunks=[];this.onRecordDone=options.done;this.recorder.ondataavailable=e=>{if(e.data.size)this.recordChunks.push(e.data);};this.recorder.onstop=()=>{const blob=new Blob(this.recordChunks,{type:mime});this.recordStream?.getTracks().forEach(t=>t.stop());this.captureCanvas=null;this.captureCtx=null;this.recordChunks=[];this.onRecordDone?.(blob);this.onRecordDone=null;};
 this.recorder.onerror=()=>{this.onRecordDone=null;this.stopRecording();this.recordStream?.getTracks().forEach(t=>t.stop());this.hooks.onError('视频录制失败，请降低分辨率后重试。');};
 this.tour=options.tour;this.recordingKeyframes=!!options.keyframes;this.tourStart=performance.now();this.tourDuration=options.duration*1000;this.tourAngle=this.controls.getAzimuthalAngle();this.autoRotate=false;this.controls.autoRotate=false;this.cursor.visible=false;this.boxHelper.visible=false;
 if(options.keyframes)this.beginTour();if(options.tour)this.controls.enabled=false;
 this.recording=true;this.renderer.render(this.scene,this.camera);if(!this.software)this.drawAnnotationCanvas(this.annotationCanvas);this.captureFrame();
 try{this.recorder.start(1000);}catch(error){this.recording=false;this.tour=false;this.recordingKeyframes=false;this.stopTour();this.recordStream.getTracks().forEach(t=>t.stop());this.captureCanvas=null;this.captureCtx=null;throw error;}return mime;
 }
 stopRecording(){if(!this.recording)return;this.captureFrame();this.recording=false;this.tour=false;this.recordingKeyframes=false;this.stopTour();this.controls.enabled=this.settings.tool==='orbit'||this.space;if(this.recorder?.state==='recording')this.recorder.stop();}
 async thumbnail(){if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();this.renderer.render(this.scene,this.camera);if(this.software)await(this.renderer as unknown as SoftwareRenderer).flush();return this.renderer.domElement.toDataURL('image/jpeg',.7);}

 partList(){return this.meshes.map(m=>({id:String(m.userData.partId),meshId:m.uuid,name:m.name,visible:m.visible,opacity:(Array.isArray(m.material)?m.material[0]:m.material).opacity,knowledge:m.userData.knowledge as PartKnowledge|undefined}));}
 selectPart(id:string,focus=false){
 if(this.inputLocked)return;const mesh=this.meshes.find(m=>m.userData.partId===id);if(!mesh)return;
 this.part=mesh;this.hooks.onPart(mesh.name);this.hooks.onInspect?.(id);this.boxHelper.setFromObject(mesh);this.boxHelper.visible=mesh.visible;
 if(focus){const box=new THREE.Box3().setFromObject(mesh),center=box.getCenter(new THREE.Vector3()),radius=Math.max(.25,box.getSize(new THREE.Vector3()).length()/2);const direction=this.camera.position.clone().sub(this.controls.target).normalize();this.controls.target.copy(center);this.camera.position.copy(center).addScaledVector(direction,radius*3.2);this.resetControls();}
 }
 setPartDisplay(id:string,visible:boolean,opacity?:number){
 const mesh=this.meshes.find(m=>m.userData.partId===id);if(!mesh)return;const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];const nextOpacity=opacity===undefined?undefined:THREE.MathUtils.clamp(opacity,.05,1);if(mesh.visible===visible&&(nextOpacity===undefined||materials.every(m=>Math.abs(m.opacity-nextOpacity)<.00001)))return;mesh.visible=visible;
 if(nextOpacity!==undefined)for(const m of materials){const before=m.transparent;m.opacity=nextOpacity;m.transparent=m.opacity<1||!!(m as THREE.MeshStandardMaterial).alphaMap;m.depthWrite=m.opacity>=.99;if(before!==m.transparent)m.needsUpdate=true;}
 if(this.part===mesh&&!visible)this.boxHelper.visible=false;this.syncDecals();
 }
 showAllParts(){for(const p of this.partList())this.setPartDisplay(p.id,true,1);}
 isolatePart(id:string){for(const p of this.partList())this.setPartDisplay(p.id,p.id===id);this.selectPart(id,true);}
 annotatePart(id:string,text:string){
 if(this.inputLocked)return;const mesh=this.meshes.find(m=>m.userData.partId===id);if(!mesh||!text.trim())return;
 if(this.annotations.length>=40)throw Error('当前视角最多 40 条标注。');
 mesh.geometry.computeBoundingBox();const anchor=mesh.geometry.boundingBox!.getCenter(new THREE.Vector3()).toArray() as [number,number,number];
 const annotation:AnnotationInfo={id:THREE.MathUtils.generateUUID(),meshId:mesh.uuid,partName:mesh.name,anchor,text:text.slice(0,280),color:'#4856ed',visible:true,offset:[.055,-.11]};
 this.annotations.push(annotation);this.selectedAnnotation=annotation.id;this.notifyAnnotations();
 }
 restoreView(view:SceneView){if(this.recording||this.captureBusy)return;this.stopTour();this.autoRotate=false;this.resetControls();this.applyView(view);this.notifyAnnotations();this.hooks.onScene?.(this.sceneView());}
 exportProjectState():EngineSnapshot{if(this.inputLocked||this.recording)throw Error('请先停止导览或录制，再保存项目。');this.finishStroke();return captureEngine(this);}
 async importProjectState(data:EngineSnapshot){
 if(this.recording||this.captureBusy)throw Error('请先结束录制或关键帧保存。');
 // Parse before touching the live scene, so a malformed file preserves the user's work.
 const restored=await restoreEngine(data);
 this.stopTour();this.finishStroke();this.clearHistory();this.disposeModel();
 this.model.add(...[...restored.model.children]);this.meshes=this.model.children.filter(o=>(o as THREE.Mesh).isMesh) as THREE.Mesh[];
 this.decalRoot.add(...[...restored.decals.children]);this.layers=restored.layers;
 this.layers.forEach(l=>{this.resources.add(l.group);l.group.traverse(o=>{if((o as THREE.Mesh).isMesh){const mat=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;if(mat.map)this.textures.add(mat.map);}});});
 this.meshes.forEach(m=>m.position.set(0,0,0));this.explodeOffsets=explosionOffsets(this.meshes);const size=new THREE.Box3().setFromObject(this.model).getSize(new THREE.Vector3());this.height=size.y;this.width=size.x;
 this.explosion=-1;this.part=this.meshes[0];this.selectedAnnotation=null;this.selectedKeyframe=null;this.annotationBlend=null;this.relocateAnnotation=null;this.selected=null;
 this.keyframes=data.keyframes.map(f=>({...f,view:cloneView(f.view)}));this.settings={...data.settings};this.setSettings(this.settings);this.restoreView(data.view);this.hooks.onPart(this.part?.name||'');this.notify();this.notifyKeyframes();
 }
 private disposeModel(){const tex=new Set<THREE.Texture>();this.model.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh;m.geometry.dispose();for(const mat of Array.isArray(m.material)?m.material:[m.material]){for(const value of Object.values(mat))if(value instanceof THREE.Texture)tex.add(value);mat.dispose();}}});tex.forEach(t=>t.dispose());this.model.clear();this.meshes=[];this.explodeOffsets.clear();for(const group of this.resources){group.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh;m.geometry.dispose();(m.material as THREE.Material).dispose();}});}this.resources.clear();this.textures.forEach(t=>t.dispose());this.textures.clear();}
 dispose(){this.running=false;cancelAnimationFrame(this.frame);this.stopRecording();this.observer.disconnect();this.controls.dispose();const el=this.renderer.domElement;el.removeEventListener('pointerdown',this.pointerDown,true);el.removeEventListener('pointermove',this.pointerMove);window.removeEventListener('pointerup',this.pointerUp);el.removeEventListener('pointerleave',this.leave);el.removeEventListener('contextmenu',this.context);window.removeEventListener('keydown',this.keydown);window.removeEventListener('keyup',this.keyup);window.removeEventListener('blur',this.blur);this.disposeModel();this.env?.dispose();this.scene.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh;m.geometry?.dispose();if(Array.isArray(m.material))m.material.forEach(x=>x.dispose());else m.material?.dispose();}});this.renderer.dispose();el.remove();this.annotationCanvas.remove();}
}
