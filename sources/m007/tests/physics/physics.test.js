import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {trial,until} from './fixture.js';
import {DT,LIMITS,continuity,allowedContact,graspCapacity} from '../../physics/core.js';
import {injectFault} from '../../physics/faults.js';
import {FixedClock} from '../../physics/clock.js';
import RAPIER from '@dimforge/rapier3d-compat/rapier.es.js';
const results=[];
function runCase(id,options,fn){test(id,()=>{const t=trial({record:false,...options});let passed=false;
  try{fn(t);passed=true;}finally{results.push({id,passed,kind:t.kind,seed:t.seed,state:t.state,seconds:t.t,metrics:t.metrics,failures:t.failures});t.dispose();}});}
function expectFailure(t,codes){t.run();assert.equal(t.state,'FAILED');assert.ok(codes.includes(t.failures[0]?.code),JSON.stringify(t.failures));assert.ok(!t.events.some(e=>e.type==='ACCEPT'));}
for(const kind of ['cup','box'])for(let seed=1;seed<=10;seed++)runCase(`${kind}: reproducible pick-carry-place seed ${seed}`,{kind,seed},t=>{
  const r=t.run();assert.equal(r.state,'SUCCESS',JSON.stringify(r.failures));
  assert.equal(r.metrics.attachJump,0);assert.equal(r.metrics.forbiddenContacts,0);
  assert.ok(r.metrics.maxSlip<=LIMITS.gripSlip);assert.ok(r.metrics.maxPenetration<=LIMITS.penetration);
  assert.ok(r.metrics.positionError<=LIMITS.position);assert.ok(r.metrics.maxJointSpeed<=LIMITS.jointSpeed+1e-9);
  assert.equal(t.grip,null);assert.ok(t.support().valid);assert.ok(t.releaseEvidence.valid);
  const states=r.events.filter(e=>e.type==='STATE').map(e=>e.to);
  for(const expected of ['IDENTIFY','PLAN_PICK','NAVIGATE','PREGRASP','DOCK','APPROACH','CLOSE','VERIFY_GRASP','LIFT','PLAN_CARRY','TRANSPORT','LOWER','RELEASE','RETREAT','SETTLE','SUCCESS'])assert.ok(states.includes(expected));
});
runCase('payload remains still before bilateral contact and attachment has no snap',{},t=>{
  t.start();const start=new THREE.Vector3().copy(t.payload.body.translation());
  until(t,()=>!!t.grip,80);assert.ok(t.grip,JSON.stringify(t.failures));
  assert.ok(new THREE.Vector3().copy(t.payload.body.translation()).distanceTo(start)<.002);
  const event=t.events.find(e=>e.type==='GRASP_ATTACHED');assert.ok(event.evidence.both);assert.ok(event.evidence.capacity.ok);assert.equal(event.jump,0);
});
runCase('low friction rejects grasp instead of magnetically holding',{friction:.03},t=>expectFailure(t,['GRIP_CAPACITY']));
runCase('empty grasp never creates a joint',{noContact:true},t=>{expectFailure(t,['GRASP_FAILED']);assert.equal(t.grip,null);});
runCase('overloaded box fails measured friction capacity',{kind:'box',mass:5},t=>expectFailure(t,['GRIP_CAPACITY','PENETRATION']));
runCase('missing target fails before movement',{missing:true},t=>expectFailure(t,['NO_TARGET']));
runCase('stale observation fails before planning',{stale:true},t=>expectFailure(t,['STALE_TARGET']));
runCase('blocked docking fails without moving the object',{blocked:true},t=>{const p={...t.payload.body.translation()};expectFailure(t,['NO_PATH','SWEEP_BLOCKED']);assert.deepEqual({...t.payload.body.translation()},p);});
runCase('unreachable target is rejected',{unreachable:true},t=>expectFailure(t,['UNREACHABLE']));
runCase('object teleport is detected before solver can hide it',{},t=>{
  t.start();injectFault(t,'teleport');t.step();assert.equal(t.failures[0]?.code,'TELEPORT');
});
runCase('interpenetration is detected by narrow phase geometry',{},t=>{
  t.start();injectFault(t,'penetration');t.audit();assert.equal(t.failures[0]?.code,'PENETRATION');
});
runCase('unreasonable impulse is detected',{},t=>{
  t.start();injectFault(t,'impulse');t.step();assert.equal(t.failures[0]?.code,'UNREASONABLE_MOTION');
});
runCase('new obstacle during transport blocks the swept payload',{},t=>{
  t.start();assert.ok(until(t,()=>t.state==='TRANSPORT'));injectFault(t,'barrier');
  until(t,()=>t.state==='FAILED');assert.equal(t.failures[0]?.code,'SWEEP_BLOCKED');
});
runCase('friction loss breaks grasp and diagnoses capacity',{},t=>{
  t.start();assert.ok(until(t,()=>t.state==='TRANSPORT'));injectFault(t,'slip');
  until(t,()=>t.state==='FAILED');assert.equal(t.failures[0]?.code,'GRIP_CAPACITY');assert.equal(t.grip,null);
});
runCase('missing constraint cannot silently continue transport',{},t=>{
  t.start();assert.ok(until(t,()=>t.state==='TRANSPORT'));injectFault(t,'drop');t.step();assert.equal(t.failures[0]?.code,'CONTACT_LOST');
});
runCase('release without table support is rejected',{},t=>{
  t.start();assert.ok(until(t,()=>t.state==='TRANSPORT'));t.release();assert.equal(t.failures[0]?.code,'NO_SUPPORT');assert.ok(t.grip);
});
runCase('unsupported dynamic object follows gravity without position animation',{},t=>{
  // Test reset fixture, not a task action: a fixed support is removed physically.
  t.world.removeRigidBody(t.sourceTable.body);t.lastAudit=t.snapshotPayload();
  const start={...t.payload.body.translation()},v0={...t.payload.body.linvel()};
  for(let i=0;i<24;i++)t.world.step();
  const p=t.payload.body.translation(),velocity=t.payload.body.linvel();
  assert.ok(Math.abs(velocity.y-(v0.y-9.81*.2))<.04);assert.ok(p.y<start.y-.18);
});
runCase('actual contact with a forbidden support is rejected',{},t=>{
  t.start();t.sourceTable.role='obstacle';t.step();assert.equal(t.failures[0]?.code,'WRONG_COLLISION');
});
test('CCD prevents high-speed tunnelling through a 5 mm wall',()=>{
  const run=ccd=>{const w=new RAPIER.World({x:0,y:0,z:0});w.timestep=DT;w.integrationParameters.maxCcdSubsteps=4;
    w.createCollider(RAPIER.ColliderDesc.cuboid(.0025,.5,.5),w.createRigidBody(RAPIER.RigidBodyDesc.fixed()));
    const body=w.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-.3,0,0).setLinvel(80,0,0).setCcdEnabled(ccd));w.createCollider(RAPIER.ColliderDesc.ball(.01).setMass(.1),body);
    w.step();const x=body.translation().x;w.free();return x;};
  const enabled=run(true),disabled=run(false);assert.ok(enabled<0,'CCD crossed the thin wall');assert.ok(disabled>.1,'control should expose tunnelling');
  results.push({id:'ccd-thin-wall-80mps',passed:true,enabledX:enabled,disabledX:disabled});
});
runCase('emergency stop holds robot command but physics continues',{},t=>{
  t.start();assert.ok(until(t,()=>t.state==='TRANSPORT'));t.emergencyStop();const p=t.robot.position.toArray(),j=t.rig.jointState();
  for(let i=0;i<120;i++)t.step();assert.equal(t.state,'E_STOP');assert.deepEqual(t.robot.position.toArray(),p);assert.deepEqual(t.rig.jointState(),j);assert.ok(t.grip);
});
test('contact matrix is symmetric and forbids premature placement',()=>{
  assert.ok(allowedContact('payload','destination','LOWER'));assert.ok(allowedContact('destination','payload','LOWER'));
  assert.equal(allowedContact('destination','payload','TRANSPORT'),false);
  assert.equal(allowedContact('finger','payload','PREGRASP'),false);
  assert.equal(allowedContact('payload','obstacle','TRANSPORT'),false);
  results.push({id:'contact-policy',passed:true});
});
test('continuity bound flags a small jump even when final speed is low',()=>{
  assert.ok(continuity({p:{x:0,y:0,z:0},v:{x:0,y:0,z:0}},{p:{x:.02,y:0,z:0},v:{x:0,y:0,z:0}}).violation);
  assert.equal(continuity({p:{x:0,y:0,z:0},v:{x:1,y:0,z:0}},{p:{x:DT,y:0,z:0},v:{x:1,y:0,z:0}}).violation,false);
  assert.equal(graspCapacity(1,.01,20,20).ok,false);results.push({id:'continuity-capacity',passed:true});
});
test('30/60/144 Hz render schedules give identical fixed physics ticks',()=>{
  const counts=[];for(const fps of [30,60,144]){let n=0;const c=new FixedClock(()=>n++);for(let i=0;i<fps*10;i++)c.advance(1/fps);counts.push(n);assert.equal(c.droppedSeconds,0);}
  assert.deepEqual(counts,[1200,1200,1200]);results.push({id:'fixed-clock',passed:true,counts});
});
after(()=>{
  const summary={generatedAt:new Date().toISOString(),scope:'simulation-only; 20 seeded end-to-end trials plus deterministic faults and invariants',versions:{three:'0.180.0',rapier:'0.17.3'},passed:results.filter(r=>r.passed).length,total:results.length,results};
  fs.mkdirSync(new URL('../../reports/',import.meta.url),{recursive:true});
  fs.writeFileSync(new URL('../../reports/physics-results.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
});
