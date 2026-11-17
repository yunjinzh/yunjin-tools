import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '../dist/vendor/addons/libs/meshopt_decoder.mjs';
import {SimReadyLibrary} from '../dist/simready-library.js';
const meta=JSON.parse(readFileSync(new URL('../dist/assets/robot/g1.json',import.meta.url)));
const bytes=readFileSync(new URL('../dist/assets/robot/g1.bin',import.meta.url));
const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
// Decode real meshes and material definitions. Only image upload and GPU
// submission are replaced, as no WebGL context is available in this test host.
export const testAssets=new SimReadyLibrary();
testAssets.manifest=JSON.parse(readFileSync(new URL('../dist/assets/simready/manifest.json',import.meta.url)));
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(()=>({name:'HEADLESS_TEXTURES',loadTexture:async()=>{const t=new THREE.Texture();t.flipY=false;return t;}}));
for(const item of testAssets.manifest.assets){
 const bytes=readFileSync(new URL('../dist/assets/simready/'+item.id+'.glb',import.meta.url));
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 testAssets.register(item,gltf.scene);
}
testAssets.loaded=true;
export function loadTestRobot(world){world.assets.models=testAssets.models;world.assets.manifest=testAssets.manifest;world.assets.loaded=true;world.rig.build(meta,buffer);world.pose(0,0);return world;}
