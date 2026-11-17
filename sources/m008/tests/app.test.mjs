// DOM integration only; this does not claim WebGL or browser visual QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
const window=new Window({url:'https://fieldlab.test/',settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
const document=window.document;document.write((await readFile(new URL('../dist/index.html',import.meta.url),'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
for(const [k,v] of Object.entries({window,document,localStorage:window.localStorage,history:window.history,location:window.location,devicePixelRatio:1,ResizeObserver:class{observe(){}},requestAnimationFrame:cb=>(frame=cb,1)}))Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});
let frame,now=performance.now();window.scrollTo=()=>{};
window.HTMLCanvasElement.prototype.getContext=function(type){return type==='2d'?{fillText(){},clearRect(){},fillRect(){},measureText(){return {width:20};}}:null;};
const dialog=document.querySelector('dialog');dialog.showModal=function(){this.open=true;};dialog.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
const oldError=console.error;console.error=()=>{};await import('../dist/app.js');console.error=oldError;
const q=s=>document.querySelector(s);const click=async s=>{assert.ok(q(s),`missing ${s}`);q(s).dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,0));};
const change=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new window.Event('change',{bubbles:true}));};
const tick=n=>{for(let i=0;i<n;i++){now+=50;frame(now);}};
const data=()=>JSON.parse(localStorage.getItem('fieldlab-v01'));

test('workspace initializes with a selected speed and seven skills',()=>{assert.equal(q('#speedSelect').value,'0.65');assert.equal(document.querySelectorAll('#skillList li').length,7);assert.match(q('#liveStatus').textContent,/就绪/);});
test('full task creates an evidence record visible in the records page',async()=>{await click('[data-action="run"]');tick(600);assert.equal(data().records.length,1);assert.equal(data().records[0].status,'SUCCEEDED');await click('[data-page="records"]');assert.match(q('#dynamicPage').textContent,/运动学仿真/);assert.ok(q('[data-record]'));});
test('trace modal and three-dimensional replay can be entered and exited',async()=>{await click('[data-record]');assert.equal(dialog.open,true);assert.ok(q('#replaySlider'));await click('[data-replay-3d]');tick(20);assert.ok(q('#threeReplayBar'));assert.match(q('#liveStatus').textContent,/轨迹回放/);await click('[data-action="stop-3d-replay"]');assert.equal(q('#threeReplayBar'),null);});
test('ambiguous command does not start a task and a valid target updates configuration',async()=>{q('#commandInput').value='给张老师送咖啡';await click('[data-action="parse"]');assert.match(q('#intentResult').textContent,/交付点/);q('#commandInput').value='把咖啡送到 02 号桌';await click('[data-action="parse"]');assert.equal(q('#targetSelect').value,'table2');assert.match(q('#liveStatus').textContent,/就绪/);});
test('teacher freezes a contest, student challenge produces the matching record',async()=>{change('#roleSelect','teacher');await click('[data-page="competition"]');q('#contestName').value='测试赛题';await click('[data-action="freeze-contest"]');assert.ok(data().contest?.id);const id=data().contest.id;await click('[data-action="challenge"]');assert.equal(q('#targetSelect').disabled,true);await click('[data-action="run"]');tick(600);assert.equal(data().records[0].contestId,id);await click('[data-page="competition"]');assert.match(q('#dynamicPage').textContent,/测试赛题/);assert.ok(q('[data-review]'));});
test('teacher publishes an assignment and submits an evidence-linked report',async()=>{await click('[data-page="courses"]');await click('[data-action="assignment"]');q('#assignmentTitle').value='课堂任务一';await click('[data-action="save-assignment"]');assert.equal(data().assignments.length,1);await click('[data-action="submit-report"]');q('#reportText').value='本次实验记录了咖啡递送路径与完整状态变化，观察到机器人按规划抵达交付点，后续需要验证真实设备的定位与抓取精度。';await click('[data-action="save-report"]');assert.equal(data().reports.length,1);assert.ok(data().records.some(r=>r.id===data().reports[0].runId));});
test('technical validation computes paired planning results and honest empty telemetry state',async()=>{await click('[data-page="validation"]');assert.match(q('#comparisonOutput').textContent,/等待实测轨迹/);await click('[data-action="run-batch"]');await new Promise(r=>setTimeout(r,180));assert.match(q('#batchOutput').textContent,/路径可行性对照/);assert.equal(document.querySelectorAll('#dynamicPage tbody tr').length,40);});
test('integration and help describe the real-device boundary',async()=>{await click('[data-page="integration"]');assert.match(q('#dynamicPage').textContent,/不发送机器人动作指令/);await click('[data-action="help"]');assert.equal(dialog.open,true);assert.match(q('#modalContent').textContent,/未接入|待接入/);await click('[data-action="close"]');});
test.after(async()=>{await window.happyDOM.cancelAsync();});
