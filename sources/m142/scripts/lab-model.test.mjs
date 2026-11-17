import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import ts from 'typescript';

// Exercise the actual pure model without starting Three.js, a browser, or any acceptance API.
const source=await readFile(new URL('../lib/lab/model.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const m=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const near=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected} (±${tolerance})`);
const poseNear=(a,b)=>['x','z','yaw'].forEach(k=>near(a[k],b[k],1e-9));
const fresh=()=>m.defaultSensorStates().S01;
function alertState(){let s=m.configureSensor(fresh(),'S01',{fault:'high'});for(let n=0;n<3;n++)s=m.sampleSensor(s,'S01');return s;}
function treatedState(){let s=m.transitionSensor(alertState(),'assign');s=m.configureSensor(s,'S01',{fault:'normal'});s=m.sampleSensor(s,'S01');return m.transitionSensor(s,'treat');}

test('flight dimensions, GSD and planned/captured counts agree with virtual camera geometry',()=>{
 const f=m.flightMetrics(m.defaultFlight);
 near(f.width,67.5);near(f.depth,45);near(f.gsd,1.6875);
 assert.equal(f.rows,6);assert.equal(f.photos,54);assert.equal(f.capturedPhotos,54);
 near(f.actualSpacing,16);near(f.actualStep,15);near(f.coverage,100);
 assert.ok(f.actualSpacing<=f.spacing&&f.actualStep<=f.step);
 let length=0;for(let i=1;i<f.route.length;i++)length+=Math.hypot(...f.route[i].map((n,k)=>n-f.route[i-1][k]));
 near(length,f.length);
});

test('flight missing-strip footprint union is exact, including fully lost and overlap-covered cases',()=>{
 const lost=m.flightMetrics({...m.defaultFlight,missing:true});
 // Remaining centers: -40, -24, 40; footprint depths: 45. The uncovered gap is 19m.
 near(lost.coverage,61/80*100);assert.equal(lost.photos,54);assert.equal(lost.capturedPhotos,27);
 near(m.flightMetrics({...m.defaultFlight,height:40,side:0,missing:true}).coverage,0);
 near(m.flightMetrics({...m.defaultFlight,height:80,side:85,missing:true}).coverage,100);
});

test('flight supported controls never create coverage outside 0..100 or incomplete full plans',()=>{
 for(const height of [20,45,80])for(const side of [20,60,85])for(const forward of [40,75,90]){
  const f={height,side,forward,missing:false};near(m.flightMetrics(f).coverage,100);
  const missing=m.flightMetrics({...f,missing:true});assert.ok(missing.coverage>=0&&missing.coverage<=100);
 }
});

test('flight rejects singular overlaps, invalid numbers and runaway allocations',()=>{
 for(const changes of [{height:0},{height:NaN},{height:Number.MAX_VALUE},{forward:100},{side:100},{side:-1},{height:1e-9}])assert.throws(()=>m.flightMetrics({...m.defaultFlight,...changes}),RangeError);
});

test('cloud pose rigidly transforms the same local observations, including synthetic outliers',()=>{
 const base=m.transformedCloud({...m.defaultCloud,x:0,z:0,yaw:0});
 const moved=m.transformedCloud({...m.defaultCloud,x:7,z:-4,yaw:90});
 for(const i of [0,1,43,355,3099]){near(moved[i][0],base[i][2]+7);near(moved[i][1],base[i][1]);near(moved[i][2],-base[i][0]-4);}
});

test('cloud fit is pose independent and idempotent for the same fixed observation set',()=>{
 for(const filter of [false,true])for(const outliers of [false,true]){
  const solved=m.solveCloud({...m.defaultCloud,filter,outliers});
  poseNear(m.solveCloud({...m.defaultCloud,x:-8,z:9,yaw:-14,filter,outliers}),solved);
  poseNear(m.solveCloud(solved),solved);
  assert.ok(m.residual(solved).rmse<m.residual({...m.defaultCloud,filter,outliers}).rmse);
 }
});

test('cloud fit satisfies independent planar least-squares stationarity on training points',()=>{
 for(const filter of [false,true]){
  const c=m.solveCloud({...m.defaultCloud,filter}),moving=m.transformedCloud(c);
  const pairs=m.cloudPoints.map((p,i)=>({p,q:moving[i],i})).filter(({i})=>i%5!==0&&!(filter&&i%43===0));
  const mean=(key,j)=>pairs.reduce((sum,p)=>sum+p[key][j],0)/pairs.length;
  const px=mean('p',0),pz=mean('p',2),qx=mean('q',0),qz=mean('q',2);
  near(qx,px);near(qz,pz);
  const rotationGradient=pairs.reduce((sum,{p,q})=>sum+(q[2]-qz)*(p[0]-px)-(q[0]-qx)*(p[2]-pz),0);
  near(rotationGradient,0,1e-8);
 }
});

test('every fifth point is independently scored and excluded from fitting',()=>{
 assert.equal(m.residual(m.defaultCloud).count,3100);assert.equal(m.residual(m.defaultCloud,true).count,620);
 assert.equal(m.residual({...m.defaultCloud,filter:true}).count,3027);
 assert.equal(m.residual({...m.defaultCloud,filter:true},true).count,605);
 const before=m.solveCloud(m.defaultCloud),original=m.cloudPoints[0];
 try{
  // An extreme held-out coordinate must not influence the training solution.
  m.cloudPoints[0]=[original[0]+100_000,original[1],original[2]+100_000];
  poseNear(m.solveCloud(m.defaultCloud),before);
 }finally{m.cloudPoints[0]=original;}
 const solved=m.solveCloud({...m.defaultCloud,filter:true});
 const q=m.transformedCloud(solved),check=m.cloudPoints.map((p,i)=>({p,i})).filter(({i})=>i%5===0&&i%43!==0);
 const independent=Math.sqrt(check.reduce((sum,{p,i})=>sum+p.reduce((s,n,k)=>s+(n-q[i][k])**2,0),0)/check.length);
 near(m.residual(solved,true).rmse,independent);assert.ok(independent>0.02&&independent<0.06);
});

test('cloud invalid pose is rejected instead of returning NaN RMSE',()=>{
 assert.throws(()=>m.residual({...m.defaultCloud,x:NaN}),RangeError);
 assert.throws(()=>m.solveCloud({...m.defaultCloud,yaw:Infinity}),RangeError);
});

test('segment-box intersection handles crossing, reverse direction, tangency and finite segment bounds',()=>{
 const box={center:[0,0,0],size:[2,2,2]};
 near(m.segmentBox([-2,0,0],[2,0,0],box),.25);
 near(m.segmentBox([2,0,0],[-2,0,0],box),.25);
 near(m.segmentBox([-2,1,0],[2,1,0],box),.25);
 assert.equal(m.segmentBox([-3,0,0],[-2,0,0],box),null);
 assert.equal(m.segmentBox([-2,2,0],[2,2,0],box),null);
 assert.equal(m.segmentBox([0,0,0],[0,0,0],box),0);
 assert.equal(m.segmentBox([2,0,0],[2,0,0],box),null);
 // A short but nonzero segment is not parallel; its coordinates are in metres.
 near(m.segmentBox([-2e-10,0,0],[2e-10,0,0],{center:[0,0,0],size:[2e-10,2,2]}),.25);
 assert.throws(()=>m.segmentBox([0,0,0],[NaN,0,0],box),RangeError);
 assert.throws(()=>m.segmentBox([0,0,0],[1,0,0],{...box,size:[-1,1,1]}),RangeError);
});

test('A/B line-of-sight uses the same viewpoint and finds the first physical obstruction',()=>{
 const a=m.designMetrics({...m.defaultDesign,scheme:'A'});assert.equal(a.visible,false);near(a.hit,.38);near(a.volume,5760);assert.equal(a.route,144);
 const b=m.designMetrics({...m.defaultDesign,height:4});assert.equal(b.visible,false);near(b.hit,.37);near(b.volume,228.8+1.44*4);assert.equal(b.route,100);
 const b5=m.designMetrics({...m.defaultDesign,height:5});assert.equal(b5.visible,false);near(b5.hit,.5);
 for(const height of [3,6,10])assert.equal(m.designMetrics({...m.defaultDesign,height}).visible,true);
 assert.throws(()=>m.designMetrics({...m.defaultDesign,height:NaN}),RangeError);
});

test('IoT requires three consecutive samples and caps the visible count at three',()=>{
 let s=m.configureSensor(fresh(),'S01',{fault:'high'});
 for(let n=1;n<=8;n++){s=m.sampleSensor(s,'S01');assert.equal(s.samples,Math.min(n,3));assert.equal(s.incident,n<3?'none':'alert');}
 let intermittent=m.configureSensor(fresh(),'S01',{fault:'high'});
 intermittent=m.sampleSensor(m.sampleSensor(intermittent,'S01'),'S01');
 intermittent=m.configureSensor(intermittent,'S01',{fault:'offline'});intermittent=m.sampleSensor(intermittent,'S01');
 assert.equal(intermittent.samples,0);assert.equal(intermittent.incident,'none');
 intermittent=m.configureSensor(intermittent,'S01',{fault:'high'});intermittent=m.sampleSensor(intermittent,'S01');assert.equal(intermittent.samples,1);assert.equal(intermittent.incident,'none');
});

test('IoT configuration invalidates stale readings and recovery requires a fresh normal sample',()=>{
 assert.equal(fresh().value,null);assert.equal(m.isSensorSampleCurrent(fresh()),false);
 let s=m.transitionSensor(alertState(),'assign');s=m.configureSensor(s,'S01',{fault:'normal'});
 assert.equal(s.value,null);assert.equal(m.isSensorSampleCurrent(s),false);assert.equal(m.canTransitionSensor(s,'treat'),false);
 assert.throws(()=>m.transitionSensor(s,'treat'),/重新采样/);
 s=m.sampleSensor(s,'S01');assert.equal(m.isSensorSampleCurrent(s),true);assert.equal(m.canTransitionSensor(s,'treat'),true);
 s=m.transitionSensor(s,'treat');s=m.transitionSensor(s,'close');assert.equal(s.incident,'closed');
 const legacy={fault:'normal',threshold:45,samples:0,incident:'assigned',value:26,tick:10};
 assert.equal(m.canTransitionSensor(legacy,'treat'),false);
 // Even a direct property change cannot reuse the sample under the earlier threshold.
 const changed={...m.sampleSensor({...legacy,incident:'assigned'},'S01'),threshold:46};
 assert.equal(m.canTransitionSensor(changed,'treat'),false);
});

test('IoT threshold changes cannot reuse previous consecutive samples or treatment approval',()=>{
 let s=m.configureSensor(fresh(),'S01',{fault:'high'});s=m.sampleSensor(m.sampleSensor(s,'S01'),'S01');
 s=m.configureSensor(s,'S01',{threshold:44});assert.equal(s.samples,0);assert.equal(s.value,null);
 s=m.sampleSensor(s,'S01');assert.equal(s.samples,1);assert.equal(s.incident,'none');
 const changed=m.configureSensor(treatedState(),'S01',{threshold:46});assert.equal(changed.incident,'assigned');assert.equal(m.canTransitionSensor(changed,'close'),false);
 assert.equal(m.sampleSensor(changed,'S01').incident,'assigned');
});

test('IoT renewed faults revoke treatment review, offline never counts as recovery',()=>{
 for(const fault of ['high','offline']){
  let s=m.configureSensor(treatedState(),'S01',{fault});assert.equal(s.incident,'assigned');
  s=m.sampleSensor(s,'S01');assert.equal(m.canTransitionSensor(s,'treat'),false);assert.equal(m.canTransitionSensor(s,'close'),false);
  // Also guard a stale client that directly changed configuration without using configureSensor.
  const stale=m.sampleSensor({...treatedState(),fault},'S01');assert.equal(stale.incident,'assigned');
 }
});

test('IoT closed events remain closed on normal samples and reopen after three new over-limit samples',()=>{
 let s=m.transitionSensor(treatedState(),'close');s=m.sampleSensor(s,'S01');assert.equal(s.incident,'closed');
 s=m.configureSensor(s,'S01',{fault:'high'});
 for(let n=1;n<=3;n++){s=m.sampleSensor(s,'S01');assert.equal(s.incident,n<3?'closed':'alert');}
});

test('IoT rejects skipped transitions, unknown devices, invalid thresholds and invalid counters',()=>{
 assert.throws(()=>m.transitionSensor(fresh(),'assign'));
 assert.throws(()=>m.transitionSensor(alertState(),'close'));
 assert.throws(()=>m.sampleSensor(fresh(),'UNKNOWN'),RangeError);
 assert.throws(()=>m.sampleSensor({...fresh(),tick:NaN},'S01'),RangeError);
 assert.throws(()=>m.configureSensor(fresh(),'S01',{threshold:NaN}),RangeError);
 assert.throws(()=>m.configureSensor(m.defaultSensorStates().S02,'S02',{threshold:21}),RangeError);
 assert.throws(()=>m.configureSensor(fresh(),'S01',{threshold:151}),RangeError);
 assert.equal(m.configureSensor(fresh(),'S01',{threshold:0}).threshold,0);
});
