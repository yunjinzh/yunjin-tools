import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {buildKnowledgeModels} from '../dist/knowledge-scene.js';
const m=buildKnowledgeModels({labels:false});let passed=0;
function check(name,fn){fn();passed++;console.log('PASS '+name);}
check('real Three.js geometries initialize without browser assets and have finite bounds',()=>{
  m.root.updateMatrixWorld(true);let count=0;m.root.traverse(o=>{if(!o.geometry)return;count++;o.geometry.computeBoundingSphere();assert(Number.isFinite(o.geometry.boundingSphere.radius));const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));});assert(count>70);const bounds=new THREE.Box3().setFromObject(m.root);assert(bounds.max.y>4);assert(bounds.max.x-bounds.min.x<20);
});
check('only the selected topic is visible and invalid topic requests preserve state',()=>{
  assert.equal(m.getState().topic,'astronomy');assert(m.topics.astronomy.visible);assert(!m.topics.seasons.visible);assert.equal(m.setTopic('unknown'),false);assert.equal(m.getState().topic,'astronomy');
});
check('Moon is a non-emissive rough surface illuminated by lights from the Sun side',()=>{
 const moon=m.root.getObjectByName('moon-reflected-light');assert(moon.material.isMeshStandardMaterial);assert.equal(moon.material.emissive.getHex(),0);const light=m.topics.astronomy.children.find(o=>o.isPointLight);assert(light.position.x<moon.parent.position.x);assert(m.hitTargets.some(x=>x===moon));
});
check('ray casting can independently select all three astronomy spheres',()=>{
 m.root.updateMatrixWorld(true);for(const key of ['sun','moon','star']){const object=m.objects.get(key).object,p=object.getWorldPosition(new THREE.Vector3());const ray=new THREE.Raycaster(p.clone().add(new THREE.Vector3(0,0,8)),new THREE.Vector3(0,0,-1));const hit=ray.intersectObjects(m.hitTargets.filter(o=>o.userData.key===key),false);assert(hit.length>0);assert.equal(hit[0].object.userData.key,key);}
});
check('season changes preserve the same tree and fully remove winter foliage in reduced motion',()=>{
 m.setTopic('seasons',{reduced:true});const tree=m.root.getObjectByName('same-ginkgo-tree');m.select('winter',{reduced:true});assert.equal(m.getState().leaves,0);assert.equal(m.root.getObjectByName('same-ginkgo-tree'),tree);const leaves=m.root.getObjectByName('ginkgo-crown'),mat=new THREE.Matrix4();for(let i=0;i<leaves.count;i++){leaves.getMatrixAt(i,mat);assert.equal(mat.determinant(),0);}
});
check('a rapid seasonal switch interpolates from the current appearance and settles correctly',()=>{
 m.select('summer');m.update(.1);const partial=m.getState().leaves;assert(partial>0&&partial<1);m.select('autumn');assert(Math.abs(m.getState().leaves-partial)<1e-8);for(let i=0;i<20;i++)m.update(.1);assert.equal(m.getState().season,'autumn');assert.equal(m.getState().leaves,.72);assert.equal(m.getState().fallen,.82);assert.equal(m.select('sun'),false);
});
check('history separates ordered succession from parallel government lanes',()=>{
 m.setTopic('history');m.select('zhou');assert(m.root.getObjectByName('sequence').visible);assert(!m.root.getObjectByName('coexistence').visible);m.select('song');assert(!m.root.getObjectByName('sequence').visible);assert(m.root.getObjectByName('coexistence').visible);const rows=['song','liao','jin'].map(k=>m.objects.get(k).object.position.z);assert.equal(new Set(rows).size,3);assert.equal(m.select('winter'),false);
});
check('topic changes and repeated selection keep exactly one selection marker',()=>{
 for(const [topic,key]of [['astronomy','moon'],['history','liao'],['seasons','spring']]){m.setTopic(topic,{reduced:true});m.select(key,{reduced:true});m.select(key,{reduced:true});assert.equal([...m.objects.values()].filter(x=>x.marker?.visible).length,1);assert(m.objects.get(key).marker.visible);}
});
check('dispose releases shared geometry/material/texture once and is idempotent',()=>{
 const resources=new Set();m.root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const mat of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){resources.add(mat);for(const value of Object.values(mat))if(value?.isTexture)resources.add(value);}});const counts=new Map();for(const r of resources){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}m.dispose();m.dispose();assert(m.getState().disposed);assert.equal(m.select('moon'),false);for(const n of counts.values())assert.equal(n,1);
});
console.log(JSON.stringify({passed,actualGpuRendering:false,scope:'real Three.js geometry, lighting metadata, raycasting, selection, seasonal state and disposal'}));
