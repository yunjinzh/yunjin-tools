import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
let result;
const sandbox=vm.createContext({self:{postMessage(v){result=v;},onmessage:null},OffscreenCanvas:class{
 constructor(w,h){this.image={data:new Uint8ClampedArray(w*h*4)};}
 getContext(){return{getImageData:()=>this.image,putImageData:image=>{this.image=image;}};}
 transferToImageBitmap(){return this.image;}
},Float32Array,Set,Map,Math,Infinity});
vm.runInContext(await fs.readFile('public/cpu-renderer.js','utf8'),sandbox);
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const plane=(id,z)=>({id,positions:new Float32Array([-1,-1,z,1,-1,z,1,1,z,-1,1,z]),normals:new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1]),uv:new Float32Array(8),index:new Uint32Array([0,1,2,0,2,3])});
const front={id:'front',matrix:identity,groups:[],order:0,materials:[{color:[0,0,1],opacity:.3,transparent:true,depthWrite:false}]},back={id:'back',matrix:identity,groups:[],order:0,materials:[{color:[1,0,0],opacity:1,transparent:false,depthWrite:true}]};
const frame={width:32,height:32,geometries:[plane('front',-.5),plane('back',.5)],textures:[],meshes:[front,back],vp:identity,exposure:1,seq:1,background:null};
sandbox.self.onmessage({data:frame});assert.ok(!result.error);const pixel=(16*32+15)*4;assert.ok(result.bitmap.data[pixel]>100&&result.bitmap.data[pixel+2]>30,'Transparent shell must reveal the opaque part behind it regardless of source order');
front.materials[0].opacity=1;front.materials[0].depthWrite=true;sandbox.self.onmessage({data:{...frame,meshes:[front,back]}});assert.equal(result.bitmap.data[pixel],0,'Opaque shell must occlude the part behind it');
console.log('PASS: CPU transparency draws interior parts through translucent shells; opaque depth occlusion remains intact.');
