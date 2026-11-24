import test from 'node:test';
import assert from 'node:assert/strict';
import {taskPolicy,restoration,registerStateTools,serverPhase} from '../dist/workflow.mjs';

const settings={size:720,audio:true,bg:'sage'};
const saved={result:{settings,out:new Blob(['valid'])},motion:{complete:true},settings};
test('restore paused and failed tasks even with a previous completed result',()=>{
  assert.equal(restoration({...saved,paused:true}),'pause');
  assert.equal(restoration({...saved,failure:'encode'}),'failed');
});
test('restore matched legacy exports, drafts and interrupted re-exports distinctly',()=>{
  assert.equal(restoration(saved),'ready');
  const dirty={...saved,settings:{...settings,audio:false}};
  assert.equal(restoration(dirty),'changed');
  assert.equal(restoration({...dirty,draft:false}),'continue');
  assert.equal(restoration({motion:{frames:[]}}),'continue');
});
test('download availability, stage-specific retry and choice are derived together',()=>{
  const ctx={hasJob:true,hasMotion:true,hasResult:true};
  for(const phase of ['read','preparing','loading','upload','queued','remote','choose','extract','pausing','export','verify','failed','pause','expired','disconnected','changed']){
    assert.equal(taskPolicy(phase,ctx).download,false,phase);
  }
  assert.equal(taskPolicy('ready',ctx).download,true);
  assert.equal(taskPolicy('ready',{hasJob:true}).download,false);
  assert.equal(taskPolicy('disconnected',ctx).retry,'reconnect');
  assert.equal(taskPolicy('changed',ctx).retry,'export');
  assert.equal(taskPolicy('expired',ctx).retry,'upload');
  assert.equal(taskPolicy('choose',ctx).choose,true);
  assert.equal(taskPolicy('pausing',ctx).pause,false);
});
test('existing server statuses still map to useful browser phases',()=>{
  assert.equal(serverPhase('running'),'remote');
  assert.equal(serverPhase('running','verify'),'verify');
  assert.equal(serverPhase('paused'),'pause');
});
test('agents share the same eligibility checks, including stale tasks and invalid ranges',async()=>{
  const tools={},state={phase:'choose',task:'test',revision:10,actions:['choose'],candidates:2,duration:3.44},calls=[];
  registerStateTools({registerTool(t){tools[t.name]=t;}},()=>({...state}),(a,v)=>calls.push([a,v]));
  assert.equal(tools.get_motion_state.execute().phase,'choose');
  const act=tools.act_on_motion_task.execute,valid={action:'choose',task:'test',revision:10,value:2};
  for(const bad of [{revision:9},{task:'other'},{value:0},{value:3},{action:'retry'},{unknown:1}])await assert.rejects(act({...valid,...bad}));
  await act(valid);state.actions=['seek'];await assert.rejects(act({...valid,action:'seek',value:5}));
  await act({...valid,action:'seek',value:1.25});assert.deepEqual(calls,[['choose',2],['seek',1.25]]);
});
