import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Window} from 'happy-dom';
import {World} from '../dist/world.js';
import {Simulator} from '../dist/sim.js';
import {CupMotion,CUP_CONTACT_TOLERANCE} from '../dist/cup-motion.js';
import {findPath,blocked} from '../dist/planner.js';
import {loadTestRobot} from './robot-fixture.js';

const win=new Window({url:'http://localhost/'});
globalThis.window=win;globalThis.document=win.document;globalThis.localStorage=win.localStorage;
globalThis.ResizeObserver=class{observe(){}};
win.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this},{get(t,k){return k in t?t[k]:()=>{};}});};
const V=THREE.Vector3,Q=THREE.Quaternion;
function create(){
 const wrap=document.createElement('div'),canvas=document.createElement('canvas');wrap.append(canvas);document.body.append(wrap);
 wrap.getBoundingClientRect=()=>({width:900,height:650});
 const w=loadTestRobot(new World(canvas,()=>({shadowMap:{},setSize(){},setPixelRatio(){},render(){}})));
 const s=new Simulator(w);s.setup('cafe','espresso',2);return {w,s};
}
function advance(s,predicate,limit=20000){for(let i=0;i<limit&&!predicate();i++)s.update(1/60);assert.ok(predicate(),s.failure||'timeout');}

test('cup remains on counter until actual hand contact; attachment preserves world pose',()=>{
 const {w,s}=create(),cup=w.entities.cup.mesh,start=cup.getWorldPosition(new V());s.start();let checked=0,event;
 while(!w.held&&s.state==='running'){
  s.update(1/60);checked++;
  if(!w.held)assert.ok(cup.getWorldPosition(new V()).distanceTo(start)<1e-10,'cup moved before contact');
  else event=s.manipulation.contactEvent;
 }
 assert.ok(checked>60);assert.equal(w.held,'cup');assert.equal(cup.parent,w.rig.gripSocket);
 assert.ok(event.distance<=CUP_CONTACT_TOLERANCE);assert.ok(new V().fromArray(event.before).distanceTo(new V().fromArray(event.after))<1e-10);
});

test('cup stays rigidly attached to real hand during lift, walking and processing; releases on table',()=>{
 const {w,s}=create(),cup=w.entities.cup.mesh;s.start();let localP,localQ,attached=0,released=false,releasePosition;
 for(let i=0;i<20000&&s.state==='running';i++){
  const held=w.held;s.update(1/60);
  if(w.held==='cup'){
   localP??=cup.position.clone();localQ??=cup.quaternion.clone();attached++;
   assert.equal(cup.parent,w.rig.gripSocket);
   assert.ok(cup.position.distanceTo(localP)<1e-10);assert.ok(cup.quaternion.angleTo(localQ)<1e-7);
   // Upright throughout transit: no tipping the cup to satisfy arm IK.
   const up=new V(0,1,0).applyQuaternion(cup.getWorldQuaternion(new Q()));assert.ok(up.dot(new V(0,1,0))>.999);
  }
  if(held==='cup'&&w.held===null){released=true;releasePosition=cup.getWorldPosition(new V());assert.ok(releasePosition.distanceTo(new V(w.targets.table2.x,w.targets.table2.y,w.targets.table2.z))<.006);}
  if(released)assert.ok(cup.getWorldPosition(new V()).distanceTo(releasePosition)<1e-10,'cup moved after release');
 }
 assert.equal(s.state,'complete',s.failure);assert.ok(attached>300);assert.ok(released);assert.equal(cup.parent,w.environment);
 assert.ok(w.rig.contactPosition().distanceTo(cup.localToWorld(new V().fromArray(cup.userData.graspOffset)))>.2);
});

test('right arm meshes clear the counter during the pick motion',()=>{
 const {w,s}=create();s.start();let samples=0;
 advance(s,()=>s.current?.type==='pick');
 for(let frame=0;s.current?.type==='pick'&&s.state==='running';frame++){
  s.update(1/60);if(frame%5)continue;w.scene.updateMatrixWorld(true);
  for(const name of ['right_shoulder_yaw_link','right_elbow_link','right_wrist_roll_link','right_wrist_pitch_link','right_wrist_yaw_link','right_rubber_hand']){
   const mesh=w.rig.links[name].children.find(o=>o.isMesh),positions=mesh.geometry.attributes.position,p=new V();
   for(let i=0;i<positions.count;i++){
    p.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
    if(p.z< -2.17&&p.z> -3.53&&Math.abs(p.x)<5.6){samples++;assert.ok(p.y>1.08,`${name} crossed counter at ${p.toArray()}`);}
   }
  }
 }
 assert.ok(samples>100);assert.notEqual(s.state,'error',s.failure);
});

test('manual E uses the same walk/reach/contact/lift sequence and table release',()=>{
 const {w,s}=create(),cup=w.entities.cup.mesh;s.manual();w.robot.position.set(-4.4,0,-.8);w.robot.rotation.y=Math.PI;
 const start=cup.getWorldPosition(new V());s.interact();assert.ok(s.manipulation);assert.equal(w.held,null);assert.ok(cup.getWorldPosition(new V()).distanceTo(start)<1e-10);
 advance(s,()=>!s.manipulation);assert.equal(w.held,'cup');assert.equal(cup.parent,w.rig.gripSocket);
 s.goTo(0,1.19);advance(s,()=>!s.manualTarget);const before=cup.getWorldPosition(new V());s.interact();assert.ok(s.manipulation);assert.equal(w.held,'cup');assert.ok(cup.getWorldPosition(new V()).distanceTo(before)<1e-10);
 advance(s,()=>!s.manipulation);assert.equal(w.held,null);assert.equal(cup.parent,w.environment);assert.equal(w.entities.cup.status,'已交付');
});

test('pause, emergency stop and replay preserve the hand/cup relationship mid-lift',()=>{
 const {w,s}=create();s.start();advance(s,()=>s.manipulation?.label==='垂直抬杯离开台面');s.update(.04);s.toggle();
 const cup=w.entities.cup.mesh,position=cup.getWorldPosition(new V()),joints=w.rig.jointState();
 for(let i=0;i<60;i++)s.update(.02);assert.ok(cup.getWorldPosition(new V()).distanceTo(position)<1e-10);assert.deepEqual(w.rig.jointState(),joints);
 s.enterReplay();s.seek(s.frames.length-1);assert.equal(cup.parent,w.rig.gripSocket);s.exitReplay();assert.ok(cup.getWorldPosition(new V()).distanceTo(position)<1e-7);
 s.stop();for(let i=0;i<60;i++)s.update(.02);assert.ok(cup.getWorldPosition(new V()).distanceTo(position)<1e-7);
 s.release();s.start();advance(s,()=>s.state==='complete'||s.state==='error');assert.equal(s.state,'complete',s.failure);
});

test('unreachable grasp never attracts or attaches cup',()=>{
 const {w}=create();w.entities.cup.mesh.position.y=2.4;const start=w.entities.cup.mesh.position.clone();
 w.robot.position.set(-4.51,0,-1.76);w.robot.rotation.y=Math.PI;
 const motion=new CupMotion(w,'pick');for(let i=0;i<1200&&!motion.error&&!motion.done;i++)motion.tick(1/60);
 assert.match(motion.error,/手臂|接触/);assert.equal(w.held,null);assert.ok(w.entities.cup.mesh.position.distanceTo(start)<1e-10);
});

test('blocked docking and reset while holding leave no orphan cup on robot',()=>{
 const {w,s}=create();w.addObstacle(-4.51,-1.76);const blockedMotion=new CupMotion(w,'pick');assert.match(blockedMotion.error,/站位/);assert.equal(w.held,null);
 s.reset();w.clearObstacles();s.start();advance(s,()=>w.held==='cup');const old=w.entities.cup.mesh;s.reset();
 assert.equal(w.held,null);assert.equal(w.cupGrip,null);assert.equal(old.parent,null);assert.equal(w.rig.gripSocket.children.length,0);assert.equal(w.entities.cup.mesh.parent,w.environment);
});

test('precise table approach remains reachable when rounding lands inside inflated obstacle',()=>{
 const obstacles=[{x:0,z:2.5,w:1.8,d:1.8}];assert.ok(blocked(0,1.25,obstacles));assert.ok(!blocked(0,1.19,obstacles));
 const path=findPath({x:0,z:0},{x:0,z:1.19},obstacles);assert.ok(path);assert.equal(path.at(-1).z,1.19);
 for(let i=1;i<path.length;i++)for(let t=0;t<=1;t+=.05)assert.ok(!blocked(path[i-1].x*(1-t)+path[i].x*t,path[i-1].z*(1-t)+path[i].z*t,obstacles));
});
