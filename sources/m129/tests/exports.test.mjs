import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Viewer} from '../src/viewer.js';
import {EXAMPLES,makeTemplate} from '../src/model.js';
import {pythonSource} from '../src/export-python.js';
import {mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
class FileReader {async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.({target:this});} async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.({target:this});}}
globalThis.FileReader=FileReader;
function model(doc){const v=Object.create(Viewer.prototype);v.root=new THREE.Group();v.root.name=doc.name;v.meshes=new Map();for(const p of doc.parts){const m=new THREE.Mesh(v.geometry(p),new THREE.MeshStandardMaterial({color:p.color}));m.name=p.name;m.userData={base:p.position};m.position.fromArray(p.position);m.rotation.set(...p.rotation.map(x=>x*Math.PI/180),'XYZ');v.meshes.set(p.id,m);v.root.add(m);}const b=new THREE.Box3().setFromObject(v.root),size=b.getSize(new THREE.Vector3());v.root.scale.set(...doc.targetSize.map((x,i)=>x/size.getComponent(i)));const scaled=new THREE.Box3().setFromObject(v.root),c=scaled.getCenter(new THREE.Vector3());v.root.position.set(-c.x,-c.y,-scaled.min.z);v.root.updateMatrixWorld(true);return v;}
const dir=process.env.SAND3D_TEST_DIR||join(tmpdir(),'yunjin-sand3d-tests');mkdirSync(dir,{recursive:true});
test('GLB and STL exports contain geometry with valid headers; Python fixtures generated',async()=>{for(const ex of EXAMPLES){const doc=makeTemplate(ex.prompt),v=model(doc);const glb=Buffer.from(await (await v.export('glb')).arrayBuffer());assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(8),glb.length);const len=glb.readUInt32LE(12);const json=JSON.parse(glb.subarray(20,20+len));assert.equal(json.meshes.length,doc.parts.length);assert.ok(json.materials.length);const stl=Buffer.from(await (await v.export('stl')).arrayBuffer());assert.equal(stl.length,84+stl.readUInt32LE(80)*50);assert.ok(stl.readUInt32LE(80)>0);writeFileSync(`${dir}/${ex.id}.glb`,glb);writeFileSync(`${dir}/${ex.id}.py`,pythonSource(doc,{scale:v.root.scale.toArray(),position:v.root.position.toArray()}));writeFileSync(`${dir}/${ex.id}.json`,JSON.stringify(doc));}});
