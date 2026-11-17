// Regression coverage for decal alignment across explode / reassemble / undo / redo.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';

const temp=await fs.mkdtemp(path.resolve('.sites-runtime/explosion-check-'));
try {
  for(const name of ['engine','software-renderer','types','fonts','explode','tour','annotations','project-engine']){
    const source=await fs.readFile(`lib/studio/${name}.ts`,'utf8');
    const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.js'");
    await fs.writeFile(path.join(temp,`${name}.js`),compiled);
  }
  const {StudioEngine}=await import(pathToFileURL(path.join(temp,'engine.js')));
  const {explosionOffsets}=await import(pathToFileURL(path.join(temp,'explode.js')));
  const {DEFAULT_SETTINGS}=await import(pathToFileURL(path.join(temp,'types.js')));
  const meshes=[-1,1].map(x=>new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(x,0,0),new THREE.MeshStandardMaterial()));
  const engine=Object.assign(Object.create(StudioEngine.prototype),{
    model:new THREE.Group(),decalRoot:new THREE.Group(),meshes,layers:[],resources:new Set(),textures:new Set(),history:[],redoStack:[],selected:null,
    settings:{...DEFAULT_SETTINGS},explodeOffsets:explosionOffsets(meshes),stroke:null,part:meshes[0],
    ground:new THREE.Object3D(),grid:new THREE.Object3D(),boxHelper:new THREE.BoxHelper(),cursor:new THREE.Object3D(),
    camera:new THREE.PerspectiveCamera(38,1.5,.01,200),controls:{target:new THREE.Vector3(),enableDamping:false,update(){},getAzimuthalAngle(){return 0;}},
    hooks:{onChange(){},onPart(){},onError(message){throw Error(message);}},
  });
  engine.camera.position.set(5,3,7);engine.model.add(...meshes);engine.model.updateMatrixWorld(true);
  const texture=new THREE.Texture();
  const placement=(mesh,x)=>({mesh,point:new THREE.Vector3(x,0,.5),normal:new THREE.Vector3(0,0,1),size:28,rotation:0,aspect:1,texture});
  const layer=engine.newLayer('text','alignment');layer.placement=placement(meshes[0],-1);engine.rebuildPlacement(layer);engine.recordAdd(layer);
  assert.equal(layer.group.children.length,1,'Text must produce a surface decal');
  const originalVertices=Array.from(layer.group.children[0].geometry.attributes.position.array);
  const originalView={position:engine.camera.position.toArray(),quaternion:engine.camera.quaternion.toArray(),zoom:engine.camera.zoom,fov:engine.camera.fov,target:engine.controls.target.toArray(),projection:engine.camera.projectionMatrix.toArray()};
  const checkUnchangedView=()=>{
    assert.deepEqual({position:engine.camera.position.toArray(),quaternion:engine.camera.quaternion.toArray(),zoom:engine.camera.zoom,fov:engine.camera.fov,target:engine.controls.target.toArray(),projection:engine.camera.projectionMatrix.toArray()},originalView,'Exploding must preserve the camera and projected scale settings');
    for(const mesh of meshes)assert.deepEqual(mesh.scale.toArray(),[1,1,1],'Exploding must never shrink parts');
  };
  engine.setExplode(40);
  checkUnchangedView();
  assert.ok(meshes[0].position.distanceTo(meshes[1].position)>1,'Parts must separate');
  assert.ok(layer.group.children[0].position.equals(meshes[0].position),'Decal must follow its own part');
  assert.deepEqual(Array.from(layer.group.children[0].geometry.attributes.position.array),originalVertices,'Explosion must not distort painted geometry');
  const offset40=meshes[0].position.clone();engine.setExplode(80);
  checkUnchangedView();
  assert.ok(meshes[0].position.distanceTo(offset40.multiplyScalar(2))<1e-9,'Slider distance must be proportional');
  engine.undo();engine.setExplode(15);engine.redo();
  assert.ok(layer.group.children[0].position.equals(meshes[0].position),'Redo must restore a layer at the current exploded position');
  const worldPoint=meshes[1].localToWorld(new THREE.Vector3(1,0,.5));
  const added=engine.newLayer('sticker','while exploded');added.placement=placement(meshes[1],1);added.placement.point=meshes[1].worldToLocal(worldPoint);engine.rebuildPlacement(added);
  assert.equal(added.group.children.length,1,'Placement on an exploded part must hit the surface');
  const stroke=engine.newLayer('brush','across parts');engine.stroke=stroke;
  for(const [i,mesh] of meshes.entries())for(let j=0;j<2;j++)stroke.group.add(engine.createDecal(placement(mesh,i?1:-1),90));
  engine.finishStroke();
  assert.equal(stroke.group.children.length,2,'A cross-part stroke must retain one render mesh per part');
  engine.setExplode(65);
  for(const decal of stroke.group.children)assert.ok(decal.position.equals(decal.userData.targetMesh.position),'Every merged stroke fragment must follow its target');
  engine.setExplode(0);
  checkUnchangedView();
  for(const mesh of meshes)assert.ok(mesh.position.equals(new THREE.Vector3()),'Reassembly must exactly restore every part');
  for(const group of engine.resources)for(const decal of group.children)assert.ok(decal.position.equals(new THREE.Vector3()),'Reassembly must exactly restore every decal');
  assert.ok(added.placement.point.distanceTo(new THREE.Vector3(1,0,.5))<1e-9,'New exploded placement must preserve local coordinates');
  const concentric=[0,1,2].map(()=>new THREE.Mesh(new THREE.BoxGeometry(1,1,1)));
  const offsets=[...explosionOffsets(concentric).values()];
  assert.ok(offsets.every((offset,i)=>offset.length()>0&&offsets.every((other,j)=>i===j||offset.distanceTo(other)>.1)),'Concentric parts must have distinct offsets');
  console.log('PASS: fixed camera/zoom/part scale, proportional separation, exact reassembly, existing and new decals, cross-part strokes, undo/redo, concentric parts.');
} finally {await fs.rm(temp,{recursive:true,force:true});}
