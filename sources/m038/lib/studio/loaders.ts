import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {unzipSync} from 'fflate';
export type InputAsset={name:string;data:Uint8Array};
export const MODEL_RE=/\.(glb|gltf|fbx|stp|step|obj|stl)$/i;
const norm=(p:string)=>{const out:string[]=[];for(const part of p.replaceAll('\\','/').split('/')){if(part==='..')out.pop();else if(part&&part!=='.')out.push(part);}return out.join('/');};
export async function unpack(files:File[]):Promise<InputAsset[]>{
 const output:InputAsset[]=[];let total=0;
 for(const file of files){if(file.size>160*1024*1024)throw Error('单个文件请控制在 160 MB 以内。');
 const data=new Uint8Array(await file.arrayBuffer());
 if(/\.zip$/i.test(file.name)){
  let expanded=0,count=0;
  const entries=unzipSync(data,{filter:(entry)=>{expanded+=entry.originalSize;count++;if(expanded>220*1024*1024||count>3000)throw Error('压缩包展开后请控制在 220 MB 和 3000 个文件以内。');return !entry.name.endsWith('/')&&!entry.name.includes('__MACOSX');}});
  for(const [name,bytes] of Object.entries(entries)){total+=bytes.length;output.push({name:norm(name),data:bytes});}
 }else{total+=data.length;output.push({name:norm(file.webkitRelativePath||file.name),data});}
 if(total>220*1024*1024)throw Error('本次导入总量超过 220 MB，请简化模型后重试。');
 }
 if(!output.some(x=>MODEL_RE.test(x.name)))throw Error('未找到模型。支持 GLB、GLTF、FBX、STP/STEP、OBJ、STL。');return output;
}
function gltfLoader(manager?:THREE.LoadingManager){const draco=new DRACOLoader(manager).setDecoderPath('/draco/');return new GLTFLoader(manager).setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);}
export async function builtin(url:string){return (await gltfLoader().loadAsync(url)).scene;}
export async function loadAssets(assets:InputAsset[],entryName:string):Promise<THREE.Object3D>{
 const entry=assets.find(x=>x.name===entryName);if(!entry)throw Error('没有找到选中的模型文件。');
 const ext=entryName.split('.').pop()!.toLowerCase();
 if(ext==='step'||ext==='stp')return loadStep(entry.data);
 const urls:string[]=[];const missing=new Set<string>();const base=entryName.substring(0,entryName.lastIndexOf('/')+1);
 const manager=new THREE.LoadingManager();
 manager.setURLModifier((url)=>{
  if(/^(data:|blob:)/.test(url))return url;
  let clean;try{clean=decodeURIComponent(url);}catch{clean=url;}
  clean=norm(clean.replace(/^local-assets\//,''));
  let file=assets.find(x=>x.name===clean);
  if(!file){const same=assets.filter(x=>x.name.split('/').pop()===clean.split('/').pop());if(same.length===1)file=same[0];}
  if(!file){if(url.startsWith('/draco/'))return url;missing.add(clean);return 'data:application/octet-stream;base64,';}
  const u=URL.createObjectURL(new Blob([file.data as BlobPart]));urls.push(u);return u;
 });
 manager.onError=url=>missing.add(url);
 try{
 const ab=entry.data.buffer.slice(entry.data.byteOffset,entry.data.byteOffset+entry.data.byteLength) as ArrayBuffer;
 let model:THREE.Object3D;
 if(ext==='gltf'||ext==='glb')model=(await gltfLoader(manager).parseAsync(ext==='gltf'?new TextDecoder().decode(entry.data):ab,'local-assets/'+base)).scene;
 else if(ext==='fbx')model=new FBXLoader(manager).parse(ab,'local-assets/'+base);
 else if(ext==='obj')model=new OBJLoader(manager).parse(new TextDecoder().decode(entry.data));
 else{const geom=new STLLoader().parse(ab);geom.computeVertexNormals();model=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:'#c4c8d0',roughness:.4,metalness:.25}));}
 // FBX texture loaders finish asynchronously after parse.
 if(ext==='fbx')await new Promise<void>(resolve=>{const timer=setTimeout(resolve,4000);manager.onLoad=()=>{clearTimeout(timer);resolve();};});
 if(missing.size)throw Error('缺少关联资源：'+Array.from(missing).slice(0,3).map(x=>x.split('/').pop()).join('、')+'。请将模型、bin 和贴图一起打包为 ZIP。');
 return model;
 }finally{for(const u of urls)URL.revokeObjectURL(u);}
}
async function loadStep(bytes:Uint8Array):Promise<THREE.Object3D>{
 if(bytes.length>80*1024*1024)throw Error('STP/STEP 文件请控制在 80 MB 以内。');
 const worker=new Worker('/cad/step-worker.js');
 return new Promise((resolve,reject)=>{
 const timeout=setTimeout(()=>{worker.terminate();reject(Error('STP 解析超过 3 分钟，请减少零件或降低文件复杂度。'));},180000);
 worker.onerror=()=>{clearTimeout(timeout);worker.terminate();reject(Error('STP 转换器启动失败，请刷新后重试。'));};
 worker.onmessage=({data})=>{clearTimeout(timeout);worker.terminate();if(data.error){reject(Error(data.error));return;}
 const group=new THREE.Group();for(const m of data.meshes){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(m.attributes.position.array,3));if(m.attributes.normal)g.setAttribute('normal',new THREE.Float32BufferAttribute(m.attributes.normal.array,3));else g.computeVertexNormals();g.setIndex(m.index.array);
 if(!m.attributes.normal)g.computeVertexNormals();const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:m.color?new THREE.Color(...m.color):new THREE.Color('#c4c8d0'),roughness:.38,metalness:.25,side:THREE.DoubleSide}));mesh.name=m.name||'CAD 零件';group.add(mesh);}
 if(!group.children.length){reject(Error('STP 文件内没有可用的实体或曲面。'));return;}resolve(group);};
 const copy=new Uint8Array(bytes);worker.postMessage(copy,[copy.buffer]);
 });
}
