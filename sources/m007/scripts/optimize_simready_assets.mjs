// Build-time only: npm install @gltf-transform/{core,extensions,functions} meshoptimizer
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const require=createRequire(process.env.SIMREADY_TOOLS_ROOT?path.join(process.env.SIMREADY_TOOLS_ROOT,'package.json'):import.meta.url);
const {NodeIO}=await import(require.resolve('@gltf-transform/core'));
const {ALL_EXTENSIONS}=await import(require.resolve('@gltf-transform/extensions'));
const {dedup,dequantize,flatten,join,weld,simplify,prune,meshopt}=await import(require.resolve('@gltf-transform/functions'));
const {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier}=await import(require.resolve('meshoptimizer'));
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist/assets/simready');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
for(const item of manifest.assets){
  const file=path.join(root,item.id+'.glb'),document=await io.read(file);
  const ratio=({kitchen:.18,'pallet-jack':.35,'coffee-machine':.35,fridge:.4,rack:.65,carton:.55})[item.id]??.7;
  await document.transform(dequantize(),dedup(),flatten(),join(),weld(),
    simplify({simplifier:MeshoptSimplifier,ratio,error:.001}),prune(),meshopt({encoder:MeshoptEncoder,level:'medium'}));
  const triangles=document.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);
  const output=await io.writeBinary(document);await writeFile(file,output);
  Object.assign(item,{originalTriangles:item.originalTriangles??item.triangles,triangles,originalBytes:item.originalBytes??item.bytes,
    bytes:output.length,sha256:createHash('sha256').update(output).digest('hex'),
    optimization:{targetRatio:ratio,maxRelativeError:.001,compression:'EXT_meshopt_compression',textureMaxSize:1024}});
  await writeFile(path.join(root,item.id+'.json'),JSON.stringify(item,null,2)+'\n');
  console.log(item.id,`${item.originalTriangles} → ${triangles} triangles`,`${(output.length/1e6).toFixed(2)} MB`);
}
await writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const decoder=path.join(path.dirname(require.resolve('meshoptimizer')),'meshopt_decoder.mjs');
const vendor=path.resolve(root,'../../vendor/addons/libs');await mkdir(vendor,{recursive:true});
await writeFile(path.join(vendor,'meshopt_decoder.mjs'),await readFile(decoder));
