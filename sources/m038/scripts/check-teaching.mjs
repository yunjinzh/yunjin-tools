import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';

await fs.mkdir('.sites-runtime',{recursive:true});
const temp=await fs.mkdtemp(path.resolve('.sites-runtime/teaching-check-'));
try{
 for(const name of ['engine','software-renderer','types','fonts','explode','tour','annotations','teaching','pump-model','pump-guide','project','project-engine']){
  const source=await fs.readFile(`lib/studio/${name}.ts`,'utf8');
  await fs.writeFile(path.join(temp,name+'.js'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.js'"));
 }
 const load=name=>import(pathToFileURL(path.join(temp,name+'.js')));
 const {createTeachingPump}=await load('pump-model');const {StudioEngine}=await load('engine');const {DEFAULT_SETTINGS}=await load('types');const {pumpLesson,objectiveScore,evaluateTask}=await load('teaching');const {encodePackage,decodePackage,validateBundle}=await load('project');const {cloneView}=await load('tour');
 const noop=()=>{};
 const createEngine=()=>Object.assign(Object.create(StudioEngine.prototype),{
  model:new THREE.Group(),decalRoot:new THREE.Group(),meshes:[],layers:[],resources:new Set(),textures:new Set(),history:[],redoStack:[],selected:null,settings:{...DEFAULT_SETTINGS},explodeOffsets:new Map(),stroke:null,part:null,annotations:[],keyframes:[],playback:{status:'stopped',time:0,duration:0,frameIndex:0},background:'#eef0f3',explosion:0,
  renderer:{toneMappingExposure:1.1,domElement:{style:{}}},scene:new THREE.Scene(),ground:new THREE.Object3D(),grid:Object.assign(new THREE.Object3D(),{visible:false}),boxHelper:new THREE.BoxHelper(),cursor:new THREE.Object3D(),
  camera:new THREE.PerspectiveCamera(38,1.5,.01,200),controls:{target:new THREE.Vector3(),enableDamping:false,update:noop,getAzimuthalAngle(){return 0;}},hooks:{onChange:noop,onPart:noop,onError(m){throw Error(m);}},
 });
 const engine=createEngine();engine.setModel(createTeachingPump(),'pump');
 assert.equal(engine.meshes.length,8);assert.equal(new Set(engine.partList().map(p=>p.id)).size,8);assert.ok(engine.partList().every(p=>p.knowledge?.purpose));
 const target=engine.meshes.find(m=>m.userData.partId==='pump-impeller');
 const texture=new THREE.DataTexture(new Uint8Array([255,0,0,255]),1,1);texture.needsUpdate=true;
 const group=new THREE.Group(),decal=new THREE.Mesh(new THREE.PlaneGeometry(.2,.2),new THREE.MeshStandardMaterial({map:texture,transparent:true}));decal.userData.targetMesh=target;group.add(decal);engine.decalRoot.add(group);engine.resources.add(group);engine.layers.push({info:{id:'decal-one',name:'DIY 贴纸',kind:'sticker',color:'#4856ed',visible:true,opacity:90,size:28,rotation:0},group,placement:{mesh:target,point:new THREE.Vector3(0,1,0),normal:new THREE.Vector3(0,0,1),size:28,rotation:0,aspect:1,texture}});
 engine.annotatePart('pump-impeller','叶轮与液体交换能量');engine.setExplode(55);engine.setPartDisplay('pump-body',false,.3);
 const view=engine.sceneView();engine.keyframes=[{id:'frame-one',name:'结构展示',hold:2,transition:3,thumbnail:'',view:cloneView(view)}];
 const bundle={app:'siwei-studio',version:1,name:'测试课件',modelId:'pump',modelName:'模块化离心泵',format:'教具',createdAt:new Date().toISOString(),scene:engine.exportProjectState(),teaching:pumpLesson(),fonts:[]};
 const guideEngine=createEngine();guideEngine.setModel(createTeachingPump(),'pump');guideEngine.saveKeyframe=async()=>{guideEngine.keyframes.push({id:crypto.randomUUID(),name:'demo',hold:2,transition:3,thumbnail:'',view:guideEngine.sceneView()});};const {createPumpGuide}=await load('pump-guide');const practiceViews=await createPumpGuide(guideEngine);assert.equal(guideEngine.keyframes.length,3);assert.equal(practiceViews.length,3);assert.ok(practiceViews.every(v=>v.annotations.length===0));assert.ok(guideEngine.keyframes[1].view.parts.some(p=>!p.visible));assert.equal(guideEngine.explosion,0);
 const blob=await encodePackage(bundle);assert.ok(blob.size<64*1024*1024);const decoded=await decodePackage(blob);const restored=createEngine();await restored.importProjectState(decoded.scene);
 assert.equal(restored.meshes.length,8);assert.equal(restored.layers.length,1);assert.equal(restored.layers[0].placement.mesh.uuid,target.uuid);assert.equal(restored.layers[0].group.children[0].userData.targetMesh.uuid,target.uuid);assert.deepEqual(restored.layers[0].placement.point.toArray(),[0,1,0]);
 assert.deepEqual(restored.sceneView(),view,'Round trip must preserve camera, explosion, annotations, visibility, opacity');
 assert.deepEqual(restored.meshes.map(m=>m.uuid),engine.meshes.map(m=>m.uuid));assert.deepEqual(restored.keyframes,engine.keyframes);assert.equal(restored.partList().find(p=>p.id==='pump-body').visible,false);
 restored.setExplode(0);assert.ok(restored.meshes.every(m=>m.position.length()===0));assert.ok(restored.meshes.every(m=>m.scale.equals(new THREE.Vector3(1,1,1))));assert.equal(restored.layers[0].group.children[0].position.length(),0);
 restored.setPartDisplay('pump-impeller',false);assert.equal(restored.layers[0].group.children[0].visible,false,'Hiding a part must hide its paint');restored.showAllParts();assert.equal(restored.layers[0].group.children[0].visible,true);
 const state=pumpLesson();assert.equal(evaluateTask(state.lesson.tasks[0],['pump-impeller'],'',[]),true);assert.equal(evaluateTask(state.lesson.tasks[0],['pump-body'],'',[]),false);assert.equal(evaluateTask(state.lesson.tasks[1],['pump-body','pump-impeller','pump-cover'],'',[]),true);assert.equal(evaluateTask(state.lesson.tasks[1],['pump-cover','pump-impeller','pump-body'],'',[]),false);assert.equal(evaluateTask(state.lesson.tasks[2],[],'',['pump-shaft']),true);assert.equal(evaluateTask(state.lesson.tasks[2],[],'',['pump-body']),false);assert.equal(evaluateTask(state.lesson.tasks[3],[],'说明',[]),null);
 state.attempts=[{taskId:state.lesson.tasks[0].id,correct:true},{taskId:state.lesson.tasks[0].id,correct:false}];assert.equal(objectiveScore(state).normalized,0,'Grading uses latest attempt');state.attempts=state.lesson.tasks.map(t=>({taskId:t.id,correct:t.kind==='explain'?null:true}));assert.equal(objectiveScore(state).normalized,70);assert.equal(objectiveScore(state).completed,4);
 const bad=structuredClone(bundle);bad.scene.model.images=[{uuid:'bad',url:'https://example.com/remote.jpg'}];assert.throws(()=>validateBundle(bad),/外部图片/);const invalid=structuredClone(bundle);invalid.teaching.lesson.tasks[0].targets=['missing'];assert.throws(()=>validateBundle(invalid),/部件不存在/);await assert.rejects(()=>decodePackage(new Blob(['not gzip'])));
 const prior=restored.meshes.map(m=>m.uuid);const invalidScene=structuredClone(decoded.scene);invalidScene.layers[0].groupId='missing-layer';await assert.rejects(()=>restored.importProjectState(invalidScene));assert.deepEqual(restored.meshes.map(m=>m.uuid),prior,'Invalid file must preserve the live scene');
 console.log('PASS: 8 semantic pump parts; compressed editable project round trip; textured decal target references; annotations & keyframes; visibility/opacity; no-scale explode/reassemble; task grading & latest-attempt scoring; invalid-package safety.');
}finally{await fs.rm(temp,{recursive:true,force:true});}
