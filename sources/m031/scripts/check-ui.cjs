/* DOM integration only: this harness does not claim browser or GPU coverage. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist/'),{STRATAGEMS}=require(root+'data.js');
function boot(enable3D){
 const elements=new Map(),html=fs.readFileSync(root+'index.html','utf8');let scene;
 class Element{
  constructor(tag='div',id='',attrs={}){this.tagName=tag.toUpperCase();this.id=id;this.attrs=attrs;this.dataset={};for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;this.children=[];this.style={setProperty(){}};this.events={};this.hidden=false;this.className=attrs.class||'';this.offsetLeft=0;this.open=false;this.value=attrs.value||'';this.classList={add:()=>{},remove:()=>{},toggle:()=>{}};}
  set innerHTML(s){this._html=s;this.children=[];for(const m of s.matchAll(/<(button|input|output|div)\b([^>]*)>/g)){const attrs={};for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];const child=new Element(m[1],attrs.id||'',attrs);if(child.id)elements.set(child.id,child);this.children.push(child);}}
  get innerHTML(){return this._html||'';}querySelectorAll(s){return s==='button'?this.children.filter(x=>x.tagName==='BUTTON'):[];}
  querySelector(s){return s==='.active'?this.children.find(x=>x.className.includes('active')):null;}
  addEventListener(k,cb){this.events[k]=cb;}setAttribute(k,v){this.attrs[k]=v;}focus(){}remove(){elements.delete(this.id);}scrollIntoView(){}showModal(){this.open=true;}close(){this.open=false;}setPointerCapture(){}getBoundingClientRect(){return {left:0,top:0,right:100,bottom:100,width:100,height:100};}
 }
 for(const m of html.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g))elements.set(m[2],new Element(m[1],m[2]));
 const registry=new Map(),document={getElementById:id=>elements.get(id),title:'',activeElement:{tagName:'BODY'},querySelectorAll:s=>s==='dialog'?[elements.get('indexDialog'),elements.get('sourcesDialog')]:[],querySelector:s=>s==='dialog[open]'?[...elements.values()].find(x=>x.open):null,modelContext:{registerTool(t){registry.set(t.name,t);}}};
 const ctx={document,window:null,location:{hash:''},history:{replaceState(a,b,c){ctx.location.hash=c}},console:{warn(){}},AbortController,requestAnimationFrame:()=>{},setTimeout,clearTimeout};ctx.window=ctx;ctx.matchMedia=()=>({matches:false});ctx.addEventListener=()=>{};
 if(enable3D)ctx.StratagemThreeScene=class{
  constructor(el,game,callbacks){this.game=game;this.callbacks=callbacks;this.canvas=new Element('canvas');scene=this;}
  load(){}update(){}drawPlan(){}dispose(){}topView(){}resetCamera(){}point(){return {x:0,z:0};}pick(){return null;}
 };
 vm.createContext(ctx);for(const f of ['data.js','engine.js','game-core.js','app.js'])vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});
 assert.equal(registry.size,3);
 const start=registry.get('start_stratagem'),act=registry.get('start_stratagem_action'),read=registry.get('read_stratagem_state');
 function settle(){if(!enable3D)return;for(let i=0;scene.game.order&&!scene.game.failed&&i<1200;i++)scene.game.tick(.1);assert(!scene.game.failed);assert(!scene.game.order);}
 function action(key,value){const before=read.execute().phase,result=act.execute({key,...(value===undefined?{}:{value})});if(enable3D)assert.equal(result.phase,before);settle();return read.execute();}
 for(const s of STRATAGEMS){start.execute({id:s.id});for(const t of s.steps)action(t.answer,t.range?Math.ceil((t.range.low+t.range.high)/2):undefined);assert(read.execute().completed);assert.equal(elements.get('replay').hidden,false);if(enable3D)assert.equal(elements.get('worldHud').hidden,false);}
 let previous=JSON.stringify(read.execute());assert.throws(()=>start.execute({id:99}));assert.equal(JSON.stringify(read.execute()),previous);assert.throws(()=>act.execute({key:'invalid'}));assert.equal(JSON.stringify(read.execute()),previous);
 start.execute({id:32});assert.equal(action('doubt',0).phase,0);assert.equal(action('doubt',70).phase,1);action('open');assert(action('time').completed);
 elements.get('reset').events.click();assert.equal(read.execute().phase,0);elements.get('viewToggle').events.click();assert.equal(elements.get('perspective').hidden,false);
 if(enable3D){
  start.execute({id:35});action('a');action('b');assert.equal(action('break').phase,1);elements.get('undo').events.click();assert.equal(read.execute().phase,2);assert.equal(read.execute().gameplay.flags.secondRing,true);assert(action('c').completed);
  start.execute({id:4});action(STRATAGEMS[3].steps[0].answer);elements.get('parameterSlider').events.input({target:{value:'5'}});assert.equal(read.execute().parameter,5);elements.get('stepGame').events.click();assert.equal(read.execute().parameter,6);
  start.execute({id:11});action('core');act.execute({key:'allocate',value:8});previous=JSON.stringify(read.execute());assert.throws(()=>act.execute({key:'allocate',value:5}));assert.equal(JSON.stringify(read.execute()),previous);assert.equal(elements.get('parameterSlider').disabled,true);settle();assert.equal(scene.game.metrics.resource,2);
 }
 return {mode:enable3D?'spatial':'fallback',flows:36,tools:3};
}
console.log(JSON.stringify({DOMIntegration:[boot(true),boot(false)],atomicInvalidInputs:true,chainUndo:true,sliderAndTurnSync:true,note:'Mock DOM and renderer bridge, not a browser visual test.'}));
