import test from 'node:test';
import assert from 'node:assert/strict';
import {environment,SCENARIOS,Simulation,planPath,segmentClear,occupied,defaultSkills,validatePlan,parseCommand,scoreRecord,runBatch,trajectoryError,validateTelemetry} from '../dist/engine.js';

test('six delivery goals complete and leave the payload placed',()=>{
 for(const [scene,s] of Object.entries(SCENARIOS))for(const target of Object.keys(s.targets)){
  const sim=new Simulation({scene,target});sim.start();for(let n=0;n<4000&&sim.status==='RUNNING';n++)sim.update(.05);
  assert.equal(sim.status,'SUCCEEDED',`${scene}/${target}`);assert.equal(sim.placed,true);assert.equal(sim.carried,false);assert.equal(sim.completed,sim.skills.length);
  assert.ok(Math.hypot(sim.pos.x-s.targets[target].x,sim.pos.z-s.targets[target].z)<1e-6);
  assert.ok(sim.trace.every(p=>!occupied(p,sim.env.obstacles)));assert.equal(sim.events.at(-1).type,'SUCCESS');
 }
});
test('seed reproducibility and changed seed changes obstacle layout',()=>{
 assert.deepEqual(environment('coffee',42,3),environment('coffee',42,3));assert.notDeepEqual(environment('coffee',42,3).obstacles,environment('coffee',43,3).obstacles);
});
test('A* avoids a blocking obstacle that the direct baseline cannot pass',()=>{
 const obstacles=[{x:0,z:0,w:1,d:1}],a={x:-2,z:0},b={x:2,z:0};const p=planPath(a,b,obstacles);
 assert.ok(p?.length>2);assert.equal(planPath(a,b,obstacles,'direct'),null);assert.ok(p.slice(1).every((v,i)=>segmentClear(p[i],v,obstacles)));
});
test('blocked start and enclosed goal fail without unsafe motion',()=>{
 assert.equal(planPath({x:0,z:0},{x:2,z:0},[{x:0,z:0,w:1,d:1}]),null);
 const sim=new Simulation({algorithm:'direct',seed:42,count:4});sim.env.obstacles.push({x:sim.pos.x,z:sim.pos.z,w:.8,d:.8});sim.start();for(let i=0;i<100;i++)sim.update(.05);assert.equal(sim.status,'FAILED');assert.equal(sim.distance,0);assert.equal(sim.events.at(-1).type,'NO_PATH');
});
test('pause preserves state and resume advances, abort remains latched',()=>{
 const s=new Simulation();s.start();for(let i=0;i<50;i++)s.update(.1);s.pause();const snap=JSON.stringify({pos:s.pos,t:s.elapsed});for(let i=0;i<20;i++)s.update(.1);assert.equal(JSON.stringify({pos:s.pos,t:s.elapsed}),snap);s.resume();s.update(.1);assert.ok(s.elapsed>5);s.abort();const t=s.elapsed;s.update(.1);assert.equal(s.elapsed,t);assert.equal(s.resume(),false);assert.equal(s.start(),false);assert.equal(s.record().score.total,0);
});
test('plan dependencies reject place-before-grasp and optional return works',()=>{
 const bad=defaultSkills('coffee');[bad[3],bad[5]]=[bad[5],bad[3]];assert.ok(validatePlan(bad,'coffee'));const s=new Simulation({skills:[...defaultSkills('coffee'),'home']});s.start();for(let i=0;i<4000&&s.status==='RUNNING';i++)s.update(.05);assert.equal(s.status,'SUCCEEDED');assert.deepEqual(s.pos,s.env.start);
});
test('language parser handles ambiguity and never starts a task itself',()=>{
 assert.ok(parseCommand('给张老师送咖啡','coffee').error);assert.ok(parseCommand('送热咖啡到 01 号桌','coffee').error);assert.equal(parseCommand('把咖啡送到沙发交付点','coffee').target,'sofa');assert.equal(parseCommand('把箱子送到 B-02','logistics').target,'b02');assert.equal(parseCommand('紧急停止','coffee').action,'estop');assert.equal(parseCommand('暂停任务','coffee').action,'pause');
});
test('scores reproduce published formula and emergency stops have zero total',()=>{
 const r={completed:7,skills:Array(7),collisions:0,duration:45,status:'SUCCEEDED'};assert.deepEqual(scoreRecord(r),{completion:50,safety:30,efficiency:10,total:90});assert.equal(scoreRecord({...r,status:'ABORTED'}).total,0);assert.equal(scoreRecord({...r,collisions:1}).safety,0);assert.equal(scoreRecord({...r,status:'FAILED',completed:0}).efficiency,0);
});
test('batch uses paired seeds and identical outputs across repeated runs',()=>{
 const c={scene:'logistics',target:'b02',seed:23,count:3};const a=runBatch(c,20);assert.equal(a.length,40);assert.deepEqual(a,runBatch(c,20));for(let i=0;i<a.length;i+=2){assert.equal(a[i].seed,a[i+1].seed);assert.equal(a[i].algorithm,'astar');assert.equal(a[i+1].algorithm,'direct');if(a[i+1].success)assert.ok(a[i].success);}
});
test('trajectory interpolation gives known error and rejects no overlap',()=>{
 const sim=[{t:0,x:0,z:0},{t:2,x:2,z:0}],real=[{t:.5,x:.5,z:1},{t:1.5,x:1.5,z:1}];const e=trajectoryError(sim,real);assert.equal(e.rmse,1);assert.equal(e.max,1);assert.deepEqual(e.overlap,[.5,1.5]);assert.throws(()=>trajectoryError(sim,[{t:4,x:0,z:0},{t:5,x:1,z:1}]));
});
test('telemetry validation rejects invalid values, duplicates and reverse time',()=>{
 assert.throws(()=>validateTelemetry([{t:0,x:NaN,z:0},{t:1,x:0,z:0}]));assert.throws(()=>validateTelemetry([{t:1,x:0,z:0},{t:1,x:1,z:1}]));assert.throws(()=>validateTelemetry([{t:1,x:0,z:0},{t:0,x:1,z:1}]));assert.equal(validateTelemetry({trace:[{t:0,x:0,z:0},{t:1,x:1,z:1}]}).length,2);
});
