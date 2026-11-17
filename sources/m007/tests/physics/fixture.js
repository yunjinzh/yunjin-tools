import * as THREE from 'three';
import fs from 'node:fs';
import {RobotRig} from '../../dist/robot-rig.js';
import {PhysicsTrial,initPhysics} from '../../physics/core.js';
const meta=JSON.parse(fs.readFileSync(new URL('../../dist/assets/robot/g1.json',import.meta.url)));
const bytes=fs.readFileSync(new URL('../../dist/assets/robot/g1.bin',import.meta.url));
const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
await initPhysics();
export function trial(options={}){
  const robot=new THREE.Group(),material=new THREE.MeshStandardMaterial();
  const rig=new RobotRig({get:()=>material});robot.add(rig.root);rig.build(meta,buffer);
  return new PhysicsTrial({rig,...options});
}
export function until(t,predicate,seconds=150){
  for(let n=0;n<seconds*120&&!predicate()&&!['FAILED','SUCCESS','E_STOP'].includes(t.state);n++)t.step();
  return predicate();
}
