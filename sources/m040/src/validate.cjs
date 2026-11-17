const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const base=__dirname,THREE=require('./three.cjs');
const DATA=JSON.parse(fs.readFileSync(path.join(base,'learning-data.json'),'utf8')),GEO=JSON.parse(fs.readFileSync(path.join(base,'china-boundaries.json'),'utf8'));
const context=vm.createContext({THREE,DATA,GEO,console,Math,Map,Set,Float32Array});
vm.runInContext(fs.readFileSync(path.join(base,'engine.js'),'utf8')+'\nglobalThis.ChinaWorld=ChinaWorld;globalThis.geoPoint=geoPoint;',context);
const obj=Object.create(context.ChinaWorld.prototype);Object.assign(obj,{scene:new THREE.Scene(),land:new THREE.Group(),features:new THREE.Group(),pickables:[],provinceMeshes:[],mapObjects:new Map()});obj.scene.add(obj.land,obj.features);obj.buildLand();obj.buildTerrain();obj.buildRivers();
let meshes=0,triangles=0;obj.scene.traverse(o=>{if(o.isMesh){meshes++;const p=o.geometry.getAttribute('position');assert(p&&p.count>0);for(let i=0;i<p.array.length;i++)assert(Number.isFinite(p.array[i]),'Invalid geometry coordinate');triangles+=(o.geometry.index?o.geometry.index.count:p.count)/3;}});
assert.equal(new Set(obj.provinceMeshes.map(m=>m.userData.id).filter(Boolean)).size,34);
assert.equal(DATA.places.length,70);assert.equal(DATA.places.filter(p=>p.category==='province').length,34);
for(const p of DATA.places){assert(p.quiz.question&&p.quiz.answer);assert.equal(new Set([p.quiz.answer,...p.quiz.wrong]).size,4);assert(p.coord[0]>=73&&p.coord[0]<=136);assert(p.coord[1]>=18&&p.coord[1]<=54);assert(p.description.trim().length>0);assert(DATA.categories.some(c=>c.id===p.category));}
for(const id of DATA.firstRoute)assert(DATA.places.some(p=>p.id===id));
// Verify progression validation without starting an app or browser.
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');const start=app.indexOf('function validateProgress('),end=app.indexOf('\nlet progress=',start);const functionCode=app.slice(start,end);const rules=vm.createContext({placeById:new Map(DATA.places.map(p=>[p.id,p])),Set,Array});vm.runInContext(functionCode+';globalThis.validateProgress=validateProgress;',rules);
const clean=rules.validateProgress({learned:['unknown',DATA.places[0].id,DATA.places[0].id,17],visited:'invalid',plane:'<script>',labels:false});assert.equal(clean.learned.length,1);assert.equal(clean.visited.length,0);assert.equal(clean.plane,'mint');assert.equal(clean.labels,false);
const html=fs.readFileSync(path.join(base,'../dist/index.html'),'utf8');const ids=[...html.matchAll(/\bid="([a-zA-Z][\w-]*)"/g)].map(x=>x[1]);
const literalIDs=[...app.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);for(const id of new Set(literalIDs))assert(ids.includes(id),`Missing ID ${id}`);
const out={destinations:70,provinceRegions:34,meshes,triangles:Math.round(triangles),geometryFinite:true,quizOptionsUnique:true,progressValidation:true};console.log(JSON.stringify(out,null,2));
fs.writeFileSync('/workspace/scratch/ecbbbe3ca03e/cloud-china-delivery/validation.json',JSON.stringify(out,null,2));
