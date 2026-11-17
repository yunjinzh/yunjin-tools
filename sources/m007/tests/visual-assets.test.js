import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {RobotRig} from '../dist/robot-rig.js';
import {SurfaceLibrary} from '../dist/materials.js';
import {HDRLoader} from '../dist/vendor/addons/loaders/HDRLoader.js';
import {batchMeshes} from '../dist/mesh-batching.js';

const arrayBuffer=path=>{const b=readFileSync(new URL(path,import.meta.url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
function rig(){const r=new RobotRig(new SurfaceLibrary()),parent=new THREE.Group();parent.add(r.root);r.build(JSON.parse(readFileSync(new URL('../dist/assets/robot/g1.json',import.meta.url))),arrayBuffer('../dist/assets/robot/g1.bin'));return r;}

test('official G1 geometry decodes to a 29-joint human-scale model standing on the floor',()=>{
 const r=rig();assert.equal(Object.values(r.joints).filter(j=>j.type==='revolute').length,29);
 r.pose();r.root.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(r.root);
 assert.ok(r.height>1.3&&r.height<1.34);assert.ok(box.min.y>=.02&&box.min.y<.04);
 let count=0;r.root.traverse(o=>{if(!o.isMesh)return;count++;const a=o.geometry.attributes.position.array;assert.ok(a.every(Number.isFinite));assert.ok(o.geometry.boundingSphere.radius>0);});assert.equal(count,36);
});

test('G1 locomotion and reach solve stay within every published joint limit',()=>{
 const r=rig();
 for(let i=0;i<=20;i++){
  r.pose(i*.21,true,i/20,.82,.66,1.23,.545);
  for(const [name,j] of Object.entries(r.joints)){
   assert.ok(j.node.quaternion.toArray().every(Number.isFinite),name);
   if(j.type!=='fixed')assert.ok(j.angle>=j.min&&j.angle<=j.max,name);
  }
 }
 r.root.updateWorldMatrix(true,true);
 for(const side of ['left','right']){
  const hand=r.links[side+'_rubber_hand'].localToWorld(new THREE.Vector3(.035,0,0));
  const goal=new THREE.Vector3(side==='left'?.2296:-.2296,.91,.35);
  assert.ok(hand.distanceTo(goal)<.1,`${side} hand error ${hand.distanceTo(goal)}`);
 }
});

test('bundled HDR environment decodes as finite radiance data',()=>{
 const parsed=new HDRLoader().parse(arrayBuffer('../dist/assets/environment/studio_small_09_1k.hdr'));
 assert.equal(parsed.width,1024);assert.equal(parsed.height,512);assert.equal(parsed.data.length,1024*512*4);
 assert.ok(parsed.data.some(x=>x>0));
});

test('static mesh batching preserves world bounds and excludes selectable cargo and floor',()=>{
 const root=new THREE.Group(),material=new THREE.MeshStandardMaterial(),before=new THREE.Box3();
 for(let i=0;i<20;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,.4),material);m.position.set(i*.4,i*.01,.2);root.add(m);}
 const cargo=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);cargo.userData.entityId='cargo';root.add(cargo);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(10,.1,8),material);floor.userData.floor=true;root.add(floor);
 before.setFromObject(root);batchMeshes(root);const after=new THREE.Box3().setFromObject(root);
 assert.ok(before.min.distanceTo(after.min)<1e-6&&before.max.distanceTo(after.max)<1e-6);
 assert.equal(root.children.length,3);assert.equal(cargo.parent,root);assert.equal(floor.parent,root);
});
