import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Window} from 'happy-dom';
import {testAssets,loadTestRobot} from './robot-fixture.js';
import {World} from '../dist/world.js';
import {batchMeshes} from '../dist/mesh-batching.js';

const win=new Window({url:'http://localhost/'});
globalThis.window=win;globalThis.document=win.document;
globalThis.ResizeObserver=class{observe(){}};
win.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this},{get(t,k){return k in t?t[k]:()=>{};}});};
const V=THREE.Vector3;
function create(){
 const wrap=document.createElement('div'),canvas=document.createElement('canvas');wrap.append(canvas);document.body.append(wrap);
 wrap.getBoundingClientRect=()=>({width:900,height:650});
 return loadTestRobot(new World(canvas,()=>({shadowMap:{},setSize(){},setPixelRatio(){},render(){}})));
}

test('all 14 optimized GLBs match provenance hashes and contain their images and buffers locally',()=>{
 assert.equal(testAssets.manifest.assets.length,14);
 for(const item of testAssets.manifest.assets){
  const bytes=readFileSync(new URL('../dist/assets/simready/'+item.id+'.glb',import.meta.url));
  assert.equal(bytes.readUInt32LE(0),0x46546c67,item.id);assert.equal(bytes.length,bytes.readUInt32LE(8));
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.id);
  assert.equal(item.license,'CC-BY-4.0');assert.equal(item.author,'NVIDIA');
  assert.equal(item.sourceRevision,testAssets.manifest.revision);
  assert.ok(json.extensionsRequired.includes('EXT_meshopt_compression'));
  for(const image of json.images??[]){assert.equal(image.uri,undefined,item.id);assert.ok(Number.isInteger(image.bufferView));}
  for(const buffer of json.buffers)assert.equal(buffer.uri,undefined,item.id);
 }
});

test('real decoded meshes retain metre dimensions, grounded origins and finite usable attributes',()=>{
 for(const {scene,item} of testAssets.models.values()){
  const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new V());
  assert.ok(Math.abs(bounds.min.y)<.002,item.id+' floor');
  size.toArray().forEach((n,i)=>assert.ok(Math.abs(n-item.size[i])<.003,item.id+' extent'));
  scene.traverse(mesh=>{if(!mesh.isMesh)return;
   for(const key of ['position','normal',...(mesh.geometry.hasAttribute('uv')?['uv']:[])]){
    const attr=mesh.geometry.getAttribute(key);assert.ok(attr,item.id+' '+key);
    assert.ok(attr.array.every(Number.isFinite));assert.equal(attr.normalized,false);
   }
   if(Object.values(mesh.material).some(v=>v?.isTexture))assert.ok(mesh.geometry.hasAttribute('uv'),item.id+' textured UVs');
   assert.ok(mesh.geometry.boundingSphere.radius>0);
  });
 }
});

test('SimReady instancing preserves transformed bounds while leaving interactive copies independent',()=>{
 function vertexBounds(root){
  root.updateWorldMatrix(true,true);const bounds=new THREE.Box3(),p=new V(),matrix=new THREE.Matrix4();
  root.traverse(o=>{if(!o.isMesh)return;
   const positions=o.geometry.getAttribute('position');
   for(let instance=0;instance<(o.isInstancedMesh?o.count:1);instance++){
    if(o.isInstancedMesh){o.getMatrixAt(instance,matrix);matrix.premultiply(o.matrixWorld);}else matrix.copy(o.matrixWorld);
    for(let i=0;i<positions.count;i++)bounds.expandByPoint(p.fromBufferAttribute(positions,i).applyMatrix4(matrix));
   }
  });return bounds;
 }
 const root=new THREE.Group();root.position.set(2,.4,-1);root.rotation.y=.33;
 for(let i=0;i<5;i++)testAssets.place(root,'carton',i*.6,.2,i*.13,{size:[.3,.4,.5],rotation:i*.23});
 const cargo=testAssets.place(root,'carton',-.8,.2,0,{size:[.5,.6,.4]});cargo.traverse(o=>o.userData.entityId='cargo');
 const before=vertexBounds(root);let beforeMeshes=0;root.traverse(o=>{if(o.isMesh)beforeMeshes++;});
 batchMeshes(root);const after=vertexBounds(root);let afterMeshes=0,instanced=0;
 root.traverse(o=>{if(o.isMesh)afterMeshes++;if(o.isInstancedMesh)instanced++;});
 assert.ok(before.min.distanceTo(after.min)<1e-5&&before.max.distanceTo(after.max)<1e-5);
 assert.ok(instanced>0&&afterMeshes<beforeMeshes);assert.ok(cargo.children.length);
 cargo.traverse(o=>{if(o.isMesh){assert.equal(o.userData.entityId,'cargo');assert.equal(o.isInstancedMesh,undefined);}});
});

test('imported warehouse cargo fits its interactive envelope and starts on its declared support',()=>{
 const w=create().load('warehouse');
 for(const entity of Object.values(w.entities)){
  const bounds=new THREE.Box3().setFromObject(entity.mesh),size=bounds.getSize(new V());
  assert.ok(Math.abs(bounds.min.y-entity.initial[1])<.002,entity.id+' base');
  [entity.w,entity.h,entity.d].forEach((n,i)=>assert.ok(Math.abs(size.getComponent(i)-n)<.003,entity.id+' size'));
  let imported=0;entity.mesh.traverse(o=>{if(o.isMesh&&o.userData.simready){imported++;assert.equal(o.userData.entityId,entity.id);}});assert.ok(imported);
 }
});

test('floor-standing coffee appliance retains its actual size and faces the work area',()=>{
 const w=create().load('cafe'),machine=w.environment.getObjectByName('simready-coffee-machine');
 assert.ok(machine);const bounds=new THREE.Box3().setFromObject(machine);
 assert.ok(Math.abs(bounds.min.y-.025)<.002);
 assert.ok(Math.abs(bounds.max.y-bounds.min.y-1.83)<.003);
 const front=new V(1,0,0).applyQuaternion(machine.getWorldQuaternion(new THREE.Quaternion()));
 assert.ok(front.z>.999,'machine display must face the robot');
 // A raycast through the operator-facing panel hits the actual imported mesh.
 const ray=new THREE.Raycaster(new V(6.02,1.15,-2.6),new V(0,0,-1));
 assert.ok(ray.intersectObject(machine,true).length>0);
});

test('repeated scene changes preserve shared imported materials, geometry and cup contact points',()=>{
 const w=create();let disposed=0;
 for(const {scene} of testAssets.models.values())scene.traverse(o=>{if(o.isMesh){o.geometry.addEventListener('dispose',()=>disposed++);o.material.addEventListener('dispose',()=>disposed++);}});
 for(const id of ['warehouse','cafe','restaurant','warehouse','restaurant','cafe']){
  w.load(id);let imported=0;w.environment.traverse(o=>{if(o.isMesh&&o.userData.simready)imported++;});assert.ok(imported>0,id);
 }
 assert.equal(disposed,0);assert.deepEqual(w.entities.cup.initial,[-4.4,1.08,-2.26]);
 assert.deepEqual(w.entities.cup.mesh.userData.graspOffset,[.065*1.42,.065*2*.57,0]);
});
