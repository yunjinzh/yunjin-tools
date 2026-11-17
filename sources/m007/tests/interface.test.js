import test from 'node:test';
import {loadTestRobot} from './robot-fixture.js';
import {World} from '../dist/world.js';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

test('workbench controls bind to the actual task engine in an in-memory DOM',async()=>{
 const win=new Window({url:'http://localhost/'});
 globalThis.window=win;globalThis.document=win.document;globalThis.localStorage=win.localStorage;
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 win.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:()=>({width:30})},{get(t,k){return k in t?t[k]:()=>{};}});};
 let callback;globalThis.requestAnimationFrame=fn=>callback=fn;
 globalThis.__createTestWorld=canvas=>loadTestRobot(new World(canvas,globalThis.__testRendererFactory));
 globalThis.__testRendererFactory=()=>({shadowMap:{},setSize(){},setPixelRatio(){},render(){}});
 document.write(readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').replace(/<script[\s\S]*?<\/script>/g,''));
 document.querySelector('.viewport').getBoundingClientRect=()=>({width:900,height:650});
 // Dependency injection only: this test does not claim to validate WebGL rendering.
 let code=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 code=code.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${pathToFileURL(resolve('dist',p)).href}'`).replace("new World($('#sceneCanvas'))","globalThis.__createTestWorld($('#sceneCanvas'))");
 await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const q=s=>document.querySelector(s),click=s=>q(s).click();
 assert.equal(document.querySelectorAll('[data-scene]').length,3);
 assert.equal(q('#loader').hidden,true);
 assert.equal(window.fieldStudio.state.status,'ready');
 q('.stage-column').inert=true;document.body.dispatchEvent(new win.KeyboardEvent('keydown',{key:' ',bubbles:true}));assert.equal(window.fieldStudio.state.status,'ready');q('.stage-column').inert=false;
 let now=performance.now();function frames(count){for(let i=0;i<count;i++){now+=1000/30;callback(now);}}
 click('[data-action="play"]');frames(30);assert.equal(window.fieldStudio.state.status,'running');assert.ok(window.fieldStudio.state.elapsed>0);
 click('[data-action="play"]');assert.equal(window.fieldStudio.state.status,'paused');const stopped=window.fieldStudio.state.elapsed;frames(20);assert.equal(window.fieldStudio.state.elapsed,stopped);
 click('[data-action="reset"]');assert.equal(window.fieldStudio.state.status,'ready');
 click('[data-scene="cafe"]');assert.equal(q('#sceneTitle').textContent,'咖啡制作训练场');assert.equal(q('#taskSelect').options.length,4);assert.equal(window.fieldStudio.state.total,9);
 click('[data-camera="first"]');assert.equal(q('[data-camera="first"]').classList.contains('active'),true);
 click('[data-action="editor"]');assert.equal(q('#modal').open,true);const before=q('#editorRows').children.length;click('[data-action="addWait"]');assert.equal(q('#editorRows').children.length,before+1);click('[data-action="savePlan"]');assert.equal(q('#modal').open,false);assert.equal(window.fieldStudio.state.total,before+1);
 click('[data-panel="robot"]');assert.equal(q('#panel-robot').hidden,false);click('[data-action="manual"]');assert.equal(window.fieldStudio.state.status,'manual');click('[data-action="estop"]');assert.equal(window.fieldStudio.state.status,'emergency');click('[data-action="estop"]');assert.equal(window.fieldStudio.state.status,'ready');
 click('[data-scene="restaurant"]');q('#commandInput').value='给3号桌上菜';q('#commandForm').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));assert.equal(window.fieldStudio.state.preset,'single');assert.equal(window.fieldStudio.state.status,'running');q('#speed').value='4';q('#speed').dispatchEvent(new win.Event('change'));frames(1000);assert.equal(window.fieldStudio.state.status,'complete');assert.equal(window.fieldStudio.state.result.score,100);assert.match(q('#statusText').textContent,/100/);
 click('[data-action="replay"]');assert.equal(window.fieldStudio.state.status,'replay');assert.equal(q('#replayControls').hidden,false);q('#replaySlider').value=q('#replaySlider').max;q('#replaySlider').dispatchEvent(new win.Event('input'));assert.equal(q('#stepCount').textContent,'4');click('[data-action="exitReplay"]');assert.equal(window.fieldStudio.state.status,'complete');
 click('[data-action="records"]');assert.equal(q('#modal').open,true);assert.equal(q('.record-card h3').textContent,'智慧餐厅 · 指定桌位上菜');click('[data-action="closeModal"]');click('[data-action="result"]');assert.equal(q('.result-number').textContent,'100');
 click('[data-action="closeModal"]');click('[data-action="renderSettings"]');assert.equal(q('#panel-environment').hidden,false);
 q('#qualitySelect').value='performance';q('#qualitySelect').dispatchEvent(new win.Event('change'));assert.equal(window.fieldStudio.state.render.quality,'performance');assert.equal(q('#aoCheck').disabled,true);
 q('#lightingSelect').value='night';q('#lightingSelect').dispatchEvent(new win.Event('change'));assert.equal(window.fieldStudio.state.render.lighting,'night');
 q('#exposureRange').value='1.35';q('#exposureRange').dispatchEvent(new win.Event('input'));assert.equal(window.fieldStudio.state.render.exposure,1.35);assert.equal(q('#exposureValue').textContent,'1.35');
 click('[data-action="resetRender"]');assert.equal(window.fieldStudio.state.render.quality,'balanced');assert.equal(window.fieldStudio.state.render.exposure,1.05);assert.equal(q('#aoCheck').disabled,false);
 await win.happyDOM.abort();
});
