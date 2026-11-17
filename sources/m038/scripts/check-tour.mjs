import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';

const temp=await fs.mkdtemp(path.resolve('.sites-runtime/tour-check-'));
try {
 for(const name of ['tour','annotations','explode']){
  const source=await fs.readFile(`lib/studio/${name}.ts`,'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.js'");
  await fs.writeFile(path.join(temp,name+'.js'),compiled);
 }
 const {cloneView,sampleTour,tourDuration,frameTime,interpolateView,annotationCrossfade}=await import(pathToFileURL(path.join(temp,'tour.js')));
 const {annotationWorldPoint}=await import(pathToFileURL(path.join(temp,'annotations.js')));
 const {explosionOffsets}=await import(pathToFileURL(path.join(temp,'explode.js')));
 const parts=[-1,1].map(x=>new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(x,0,0)));
 const group=new THREE.Group();group.add(...parts);group.updateMatrixWorld(true);
 const annotation={id:'a',meshId:parts[0].uuid,partName:'左部件',anchor:[-1,0,.5],text:'第一视角',color:'#4856ed',visible:true,offset:[.05,-.1]};
 const base={position:[0,1,5],target:[0,1,0],fov:38,zoom:1,explosion:0,background:'#eef0f3',exposure:1.1,grid:false,annotations:[annotation]};
 const saved=cloneView(base);base.annotations[0].text='第二视角';base.annotations[0].anchor[0]=-1.1;
 assert.equal(saved.annotations[0].text,'第一视角','A saved frame must not share editable annotation content');
 assert.equal(saved.annotations[0].anchor[0],-1,'A saved frame must not share anchor arrays');
 const second={...cloneView(base),position:[5,1,0],explosion:80};
 const frames=[{id:'one',name:'one',hold:2,transition:3,thumbnail:'',view:saved},{id:'two',name:'two',hold:1,transition:7,thumbnail:'',view:second}];
 assert.equal(tourDuration(frames),6,'Ignore the last frame outgoing transition');
 assert.equal(frameTime(frames,1),5,'A frame starts after prior hold and transition');
 assert.equal(sampleTour(frames,1).from.id,'one');assert.equal(sampleTour(frames,1).mix,0);
 const midpoint=sampleTour(frames,3.5);assert.equal(midpoint.mix,.5);
 const mid=interpolateView(midpoint.from.view,midpoint.to.view,midpoint.mix);
 assert.ok(Math.abs(new THREE.Vector3(...mid.position).distanceTo(new THREE.Vector3(...mid.target))-5)<1e-9,'Orbit interpolation preserves radius instead of cutting through the model');
 assert.equal(mid.explosion,40,'Explosion must transition with the camera');
 assert.deepEqual(interpolateView(saved,second,0),saved);assert.deepEqual(interpolateView(saved,second,1),second);
 assert.equal(sampleTour(frames,6).from.id,'two');assert.equal(sampleTour(frames,999).from.id,'two');
 const point=theta=>new THREE.Vector3().setFromSphericalCoords(5,Math.PI/2,theta).toArray();
 const a={...saved,target:[0,0,0],position:point(179*Math.PI/180)},b={...saved,target:[0,0,0],position:point(-179*Math.PI/180)};
 assert.ok(interpolateView(a,b,.5).position[2]<-4.99,'Crossing the azimuth boundary must use the two-degree path');
 const original=annotationWorldPoint(saved.annotations[0],parts);const offsets=explosionOffsets(parts);
 parts.forEach(mesh=>mesh.position.copy(offsets.get(mesh)).multiplyScalar(.8));
 const expanded=annotationWorldPoint(saved.annotations[0],parts);
 assert.ok(expanded.clone().sub(original).distanceTo(parts[0].position)<1e-9,'A text anchor must follow the target mesh translation');
 parts.forEach(mesh=>mesh.position.set(0,0,0));assert.ok(annotationWorldPoint(saved.annotations[0],parts).distanceTo(original)<1e-9,'Reassembly restores the exact anchor');
 assert.equal(annotationWorldPoint({...annotation,meshId:'removed'},parts),null,'Missing targets should be omitted safely');
 const blend=annotationCrossfade(saved.annotations,second.annotations,.5);
 assert.equal(blend.length,2);assert.ok(blend.every(x=>x.opacity===.5),'Different text must crossfade');
 assert.equal(annotationCrossfade(saved.annotations,cloneView(saved).annotations,.5).length,1,'Identical labels should remain solid');
 console.log('PASS: independent snapshots; hold/transition timing; exact endpoints; smooth shortest camera orbit; explosion interpolation; local anchors through explode/reassemble; per-view annotation crossfade.');
} finally {await fs.rm(temp,{recursive:true,force:true});}
