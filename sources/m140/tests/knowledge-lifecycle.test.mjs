import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as RealThree from '../dist/vendor/three.module.js';

// The renderer is mocked here; geometry, cameras and ray casting remain real Three.js.
const frames=new Map();let nextFrame=1,disconnected=0,rendered=0,rendererDisposed=0,controlsDisposed=0;
let renderer, observer;
class Target {
 constructor(){this.events=new Map();this.style={};this.width=640;this.height=420;}
 addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
 removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
 fire(name,e={}){for(const fn of [...this.events.get(name)||[]])fn({type:name,button:0,pointerType:'mouse',...e});}
 setAttribute(){}
 remove(){this.removed=true;}
 getBoundingClientRect(){return{left:0,top:0,width:640,height:420};}
 getContext(){return{clearRect(){},fillText(){}};}
}
const win=new Target();win.devicePixelRatio=1;
class Renderer {
 constructor(){renderer=this;this.domElement=new Target();this.shadowMap={};}
 setPixelRatio(){} setSize(){} dispose(){rendererDisposed++;}
 render(scene,camera){rendered++;this.scene=scene;this.camera=camera;scene.updateMatrixWorld(true);camera.updateMatrixWorld();}
}
class Controls extends RealThree.EventDispatcher {
 constructor(camera){super();this.camera=camera;this.target=new RealThree.Vector3();}
 update(){this.camera.lookAt(this.target);return false;}
 dispose(){controlsDisposed++;}
}
const context=vm.createContext({THREE:{...RealThree,WebGLRenderer:Renderer},OrbitControls:Controls,
 document:{createElement(){return new Target();}},window:win,console,
 ResizeObserver:class{constructor(fn){this.fn=fn;observer=this;}observe(){}disconnect(){disconnected++;}},
 requestAnimationFrame(fn){const id=nextFrame++;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);}
});
const source=readFileSync(new URL('../dist/knowledge-scene.js',import.meta.url),'utf8').replace(/^import.*$/gm,'').replace(/export function /g,'function ');
vm.runInContext(source+'\nthis.create=createKnowledgeScene;',context);
const host={clientWidth:640,clientHeight:420,appendChild(canvas){this.canvas=canvas;}};
const statuses=[],selected=[];
const app=context.create(host,{onSelect:k=>selected.push(k),onStatus:s=>statuses.push(s)});
let now=0,passed=0;
function tick(){const batch=[...frames];frames.clear();now+=16;for(const[,fn]of batch)fn(now);}
function check(name,fn){fn();passed++;console.log('PASS '+name);}
function pointFor(x,y,z){const p=new RealThree.Vector3(x,y,z).project(renderer.camera);return{clientX:(p.x+1)*320,clientY:(1-p.y)*210};}
check('pause cancels frames and resume creates one render loop',()=>{assert.equal(frames.size,1);app.setPaused(true);assert.equal(frames.size,0);app.setPaused(false);app.setPaused(false);assert.equal(frames.size,1);tick();assert.equal(rendered,1);assert.equal(frames.size,1);});
check('stationary pointer selects a sphere but drag and multi-touch do not',()=>{
 const p=pointFor(-3.1,1.8,0);host.canvas.fire('pointerdown',{pointerId:1,...p});host.canvas.fire('pointerup',{pointerId:1,...p});assert.deepEqual(selected,['sun']);
 host.canvas.fire('pointerdown',{pointerId:2,...p});host.canvas.fire('pointermove',{pointerId:2,...p,clientX:p.clientX+25});host.canvas.fire('pointerup',{pointerId:2,...p});assert.equal(selected.length,1);
 host.canvas.fire('pointerdown',{pointerId:3,...p});host.canvas.fire('pointerdown',{pointerId:4,...p});host.canvas.fire('pointerup',{pointerId:4,...p});host.canvas.fire('pointerup',{pointerId:3,...p});assert.equal(selected.length,1);
});
check('reduced motion and static history render on demand instead of idle loops',()=>{app.setReduced(true);tick();assert.equal(frames.size,0);app.setTopic('history');tick();assert.equal(frames.size,0);app.select('song');assert.equal(frames.size,1);tick();assert.equal(frames.size,0);});
check('context loss pauses rendering and restoration reports availability',()=>{
 let prevented=false;host.canvas.fire('webglcontextlost',{preventDefault(){prevented=true;}});assert(prevented);assert.equal(frames.size,0);assert.equal(statuses.at(-1).available,false);app.select('liao');assert.equal(frames.size,0);host.canvas.fire('webglcontextrestored');assert.equal(statuses.at(-1).available,true);assert.equal(frames.size,1);tick();
});
check('dispose removes input, resize and control resources and cancels scheduled work',()=>{app.setReduced(false);app.setTopic('astronomy');assert(frames.size>0);app.dispose();app.dispose();assert.equal(frames.size,0);assert.equal(disconnected,1);assert.equal(rendererDisposed,1);assert.equal(controlsDisposed,1);assert(host.canvas.removed);for(const set of host.canvas.events.values())assert.equal(set.size,0);assert.equal(win.events.get('blur').size,0);observer.fn();app.setPaused(false);assert.equal(frames.size,0);});
console.log(JSON.stringify({passed,actualGpuRendering:false,scope:'mock renderer lifecycle; real geometry/camera/raycast; pointer safety, pause, restore and disposal'}));
