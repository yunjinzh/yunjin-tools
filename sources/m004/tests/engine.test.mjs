import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildScene,insidePolygon,scanIntervals,subtractIntervals,makeProjector,sceneSVG,escapeXML} from '../dist/engine.mjs';
import {buildQuery,parseLocation,normalizeGeoJSON,featureName,areaKm2,loadOSM} from '../dist/data.mjs';

test('polygon holes remain empty and scanlines preserve them',()=>{
 const polygon=[[[0,0],[100,0],[100,100],[0,100],[0,0]],[[30,30],[70,30],[70,70],[30,70],[30,30]]];
 assert.equal(insidePolygon([10,50],polygon),true);assert.equal(insidePolygon([50,50],polygon),false);
 assert.deepEqual(scanIntervals(polygon,50),[[0,30],[70,100]]);
 assert.deepEqual(subtractIntervals([[0,100]],[[20,40],[60,80]]),[[0,20],[40,60],[80,100]]);
});
test('OSM query requests only named selected features, complete geometry and safe small bboxes',()=>{
 const q=buildQuery({south:39.91,west:116.38,north:39.93,east:116.4});assert.match(q,/out body geom qt/);assert.doesNotMatch(q,/geom\(/);assert.match(q,/rel\.chosen\[type=multipolygon\]/);assert.match(q,/name/);
 assert.throws(()=>buildQuery({south:0,west:0,north:20,east:20}),/85 km²/);
 const crossing=buildQuery({south:0,west:179.995,north:.01,east:180.005});assert.match(crossing,/180\.000000/);assert.match(crossing,/-180\.000000/);
});
test('dateline projection keeps the two sides spatially close',()=>{
 const p=makeProjector({south:0,west:179.99,north:.01,east:180.01},1000,500);assert.ok(Math.abs(p([179.999,.005])[0]-p([-179.999,.005])[0])<150);
});
test('coordinate navigation is explicit and never guesses an unknown city',()=>{
 assert.equal(parseLocation('故宫').lat,39.919);assert.equal(parseLocation('39.916, 116.397').lng,116.397);
 assert.equal(parseLocation('https://www.openstreetmap.org/#map=16/48.858/2.294').zoom,16);
 assert.equal(parseLocation('this-place-does-not-exist'),null);assert.equal(parseLocation('95, 116'),null);
});
test('tainted polygons, unnamed geometry, invalid coordinates and route relations are excluded',()=>{
 const poly={type:'Polygon',coordinates:[[[0,0],[.01,0],[.01,.01],[0,.01],[0,0]]]};
 const g={type:'FeatureCollection',features:[{id:'way/1',type:'Feature',properties:{tags:{name:'湖',natural:'water'},tainted:true},geometry:poly},{id:'way/2',type:'Feature',properties:{name:'正确',leisure:'park'},geometry:poly},{id:'way/3',type:'Feature',properties:{building:'yes'},geometry:poly},{id:'way/4',type:'Feature',properties:{name:'坏坐标'},geometry:{type:'Point',coordinates:[181,91]}}]};
 const data=normalizeGeoJSON(g);assert.equal(data.features.length,1);assert.equal(data.features[0].category,'park');assert.equal(data.skipped,3);
});
test('language preference and explicit edited name are respected',()=>{
 const f={id:'a',tags:{name:'Local','name:zh':'中文','name:en':'English'}};assert.equal(featureName(f,'zh'),'中文');assert.equal(featureName(f,'en'),'English');assert.equal(featureName(f,'local'),'Local');assert.equal(featureName(f,'zh',{a:{name:'手动名称'}}),'手动名称');
});
test('all geometry fill text is from its own feature and lake holes stay empty',()=>{
 const outer=[[0,0],[.02,0],[.02,.02],[0,.02],[0,0]],hole=[[.007,.007],[.013,.007],[.013,.013],[.007,.013],[.007,.007]];
 const features=[{id:'lake',category:'water',tags:{name:'青湖'},geometry:{type:'Polygon',coordinates:[outer,hole]}},{id:'island',category:'park',tags:{name:'绿洲'},geometry:{type:'Polygon',coordinates:[hole]}}];
 const b={south:0,west:0,north:.02,east:.02};const scene=buildScene(features,b,800,800,{fontSize:14,contours:false});assert.ok(scene.commands.length>20);
 const project=makeProjector(b,800,800),phole=hole.map(project);
 for(const c of scene.commands){assert.ok((c.id==='lake'?'青湖':'绿洲').includes(c.text));if(c.id==='lake')assert.equal(insidePolygon([c.x,c.y],[phole]),false);}
});
test('layer visibility and per-feature hide really remove drawing commands',()=>{
 const f={id:'r',category:'road',tags:{name:'测试路',highway:'primary'},geometry:{type:'LineString',coordinates:[[0,.005],[.02,.005]]}};
 const b={south:0,west:0,north:.01,east:.02};assert.ok(buildScene([f],b,800,400,{}).commands.length>0);assert.equal(buildScene([f],b,800,400,{layers:{road:false}}).commands.length,0);assert.equal(buildScene([f],b,800,400,{overrides:{r:{hidden:true}}}).commands.length,0);
});
test('SVG export escapes user text, retains provenance and embeds a real font data URL',()=>{
 const f={id:'test',category:'landmark',tags:{name:'A<svg>&B'},geometry:{type:'Point',coordinates:[.005,.005]}};
 const s=buildScene([f],{south:0,west:0,north:.01,east:.01},800,800,{});const svg=sceneSVG(s,{title:'<script>x</script>',fontData:'AAEC',transparent:true});assert.match(svg,/&lt;script&gt;/);assert.doesNotMatch(svg,/<script>/);assert.match(svg,/font\/woff2;base64,AAEC/);assert.match(svg,/openstreetmap.org\/copyright/);assert.match(svg,/data-osm-id="test"/);assert.doesNotMatch(svg,/<rect/);
});
test('real Beijing OSM snapshot renders meaningful roads, parks, water and landmarks',()=>{
 const sample=JSON.parse(fs.readFileSync(new URL('../dist/data/beijing.json',import.meta.url)));assert.equal(sample.source,'OpenStreetMap');assert.ok(sample.features.length>1000);
 const s=buildScene(sample.features,{south:39.908,west:116.372,north:39.93,east:116.411},1050,700,{fontSize:14,density:1.05});assert.ok(s.featureCount>40);assert.ok(s.counts.water>0);assert.ok(s.counts.park>0);assert.ok(s.counts.road>0);assert.ok(s.counts.landmark>0);
 const byId=new Map(sample.features.map(f=>[f.id,f]));
 for(const c of s.commands){assert.ok(Number.isFinite(c.x)&&Number.isFinite(c.y));assert.ok(c.x>=0&&c.x<=1050&&c.y>=0&&c.y<=700);assert.ok(featureName(byId.get(c.id)).includes(c.text),'each rendered word belongs to its own named OSM feature');}
});
test('Overpass partial results and rate limits never become a successful data snapshot',async()=>{
 const oldFetch=globalThis.fetch;try{globalThis.fetch=async()=>new Response(JSON.stringify({remark:'runtime error',elements:[]}),{status:200});await assert.rejects(()=>loadOSM({south:39.91,west:116.38,north:39.92,east:116.39}),/完整结果/);globalThis.fetch=async()=>new Response('',{status:429});await assert.rejects(()=>loadOSM({south:39.91,west:116.38,north:39.92,east:116.39}),e=>e.code==='RATE_LIMIT');}finally{globalThis.fetch=oldFetch;}
});
