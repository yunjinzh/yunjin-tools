import test from 'node:test';
import assert from 'node:assert/strict';
import {motionTrack,bridgePose} from '../dist/motion-track.mjs';
import {study,softwareStage} from '../dist/figure.mjs';
import {taskPolicy} from '../dist/workflow.mjs';

const raw=study(0,.5,1,1);
const frames=Array.from({length:35},(_,i)=>({p:raw.map((pt,j)=>[pt[0]+i*.001+(j===15?(-1)**i*.007:0),...pt.slice(1)]),t:i*.04,d:.04}));
test('remove alternating wrist jitter without lagging a moving shoulder or mutating checkpoints',()=>{
  const copy=JSON.stringify(frames),sample=motionTrack(frames,1);
  const error=(source,i,j)=>source[i].p[j][0]-raw[j][0]-i*.001;
  const sampled=frames.map((_,i)=>sample(i));
  for(let i=3;i<32;i++){
    assert.ok(Math.abs(error(sampled,i,11))<1e-6);
    assert.ok(Math.abs(error(sampled,i,15))<.002);
  }
  assert.equal(JSON.stringify(frames),copy);
});
test('cuts and absences are isolated; partial legacy tracks retain valid metric depths',()=>{
  const a=structuredClone(frames[10].p),b=structuredClone(a);
  b.forEach(pt=>pt[0]+=.8);assert.equal(bridgePose(a,b,1),false);
  assert.equal(bridgePose(a,a,1),true);
  const list=[{t:0,p:a},{t:.04,p:null},{t:.08,p:b},{t:.13,p:b.map(p=>[...p,0])}];
  const sample=motionTrack(list,1);assert.equal(sample(1),null);
  assert.ok(sample(3).p.every(p=>p.every(Number.isFinite)));assert.deepEqual(sample(0).p,a);
});
test('real mannequin paints a visible skin and a contact shadow on the same CPU camera',()=>{
  let pixels;const cmp={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:x=>{pixels=x.data.slice();}};
  const scene=softwareStage({getContext:()=>cmp},160,160);
  scene.draw([null],'studio');const empty=pixels;scene.draw([raw],'studio');
  let bright=0,dark=0;for(let i=0;i<empty.length;i+=4){if(pixels[i]>empty[i]+12)bright++;if(pixels[i]<empty[i]-7)dark++;}
  assert.ok(bright>500&&dark>30);assert.ok(pixels.every((v,i)=>i%4!==3||v===255));scene.dispose();
});
test('legacy results offer both immediate download and explicit rerender',()=>{
  const ctx={hasJob:true,hasResult:true,previousLook:true};assert.deepEqual(taskPolicy('ready',ctx).actions,['export','seek','download']);
  assert.equal(taskPolicy('ready',{...ctx,previousLook:false}).retry,null);
});
