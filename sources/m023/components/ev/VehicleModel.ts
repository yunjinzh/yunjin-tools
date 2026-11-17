import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export type ModelStatus={phase:'loading'|'ready'|'error';progress:number;compat:boolean};
type Surface={mesh:T.Mesh;material:T.MeshStandardMaterial;opacity:number;transparent:boolean;depthWrite:boolean;paint:boolean;wheel:boolean};
const RAW_BOUNDS=new T.Box3(new T.Vector3(-122.40715473890305,-75.15860547631961,-263.87998417464973),new T.Vector3(122.45935797691345,82.64574562429442,261.9639898989471));

/** Full source GLB for WebGL; a decimated derivative of that same asset for Canvas. */
export function loadVehicleModel(shell:T.Group,wheels:T.Group,compat:boolean,onStatus:(s:ModelStatus)=>void,onMesh:(mesh:T.Mesh)=>void){
 const abort=new AbortController(),geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>(),surfaces:Surface[]=[];
 let disposed=false,lastXray:boolean|undefined;
 const status=(phase:ModelStatus['phase'],progress=0)=>{if(!disposed)onStatus({phase,progress,compat});};
 const release=()=>{
  geometries.forEach(g=>g.dispose());
  materials.forEach(m=>m.dispose());
  textures.forEach(t=>{t.dispose();const image=t.image as {close?:()=>void}|undefined;if(typeof image?.close==='function')image.close();});
  geometries.clear();materials.clear();textures.clear();
 };
 function collect(m:T.Material){materials.add(m);Object.values(m).forEach(v=>{if(v instanceof T.Texture)textures.add(v);});}
 async function load(){
  status('loading');
  const url=`/models/tesla_2018_model_3${compat?'.compat':''}.glb`;
  const response=await fetch(url,{signal:abort.signal});
  if(!response.ok)throw new Error(`Vehicle asset HTTP ${response.status}`);
  const length=Number(response.headers.get('content-length'));
  let buffer:ArrayBuffer;
  if(response.body&&length){
   const reader=response.body.getReader(),chunks:Uint8Array[]=[];let received=0;
   for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.length;status('loading',Math.min(95,Math.round(received/length*95)));}
   const joined=new Uint8Array(received);let offset=0;chunks.forEach(c=>{joined.set(c,offset);offset+=c.length;});buffer=joined.buffer;
  }else buffer=await response.arrayBuffer();
  if(disposed)return;
  status('loading',96);
  const gltf=await new GLTFLoader().parseAsync(buffer,'/models/');
  const model=gltf.scene;
  model.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(collect);}});
  if(disposed){release();return;}
  // Source is centimetre-scaled, front -Z. Teaching scene is metre-scaled, front -X.
  const rotation=new T.Matrix4().makeRotationY(Math.PI/2),bounds=RAW_BOUNDS.clone().applyMatrix4(rotation),scale=4.69/bounds.getSize(new T.Vector3()).x;
  model.rotation.y=Math.PI/2;model.scale.setScalar(scale);
  const center=bounds.getCenter(new T.Vector3()).multiplyScalar(scale);
  model.position.set(-center.x,.03-bounds.min.y*scale,-center.z);model.updateMatrixWorld(true);
  const converted=new Map<T.Material,T.MeshStandardMaterial>();
  model.traverse(o=>{
   if(!(o instanceof T.Mesh))return;
   const original=(Array.isArray(o.material)?o.material[0]:o.material) as T.MeshStandardMaterial;
   let material=converted.get(original);
   if(!material){
    material=original.clone();collect(material);
    if(original.name==='primary'){
     material=new T.MeshPhysicalMaterial({name:original.name,color:original.color,map:original.map,metalness:.36,roughness:.24,clearcoat:1,clearcoatRoughness:.12,side:T.DoubleSide});collect(material);
    }
    if(original.name.startsWith('glass')){
     // Dark glass also closes the shell when the compatibility LOD omits seats.
     material.color.set('#273b47');material.metalness=.15;material.roughness=.13;
     material.opacity=compat?1:.72;material.transparent=!compat;material.depthWrite=compat;
    }
    if(material.emissive)material.emissiveIntensity=.35;
    if(compat)material.side=T.FrontSide;
    material.envMapIntensity=.85;
    converted.set(original,material);
   }
   if(!o.geometry.getAttribute('normal'))o.geometry.computeVertexNormals();
   const mesh=new T.Mesh(o.geometry,material);mesh.name=o.name;mesh.matrix.copy(o.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.castShadow=!material.transparent;mesh.receiveShadow=true;
   const wheel=/^(wheels|hub_)/.test(o.name),paint=original.name==='primary';
   (wheel?wheels:shell).add(mesh);onMesh(mesh);
   surfaces.push({mesh,material,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,paint,wheel});
  });
  status('ready',100);
 }
 void load().catch(error=>{if(!disposed&&error?.name!=='AbortError'){console.error('Model 3 asset load failed',error);status('error');}});
 return {
  update(xray:boolean){
   if(lastXray===xray||!surfaces.length)return;
   lastXray=xray;
   for(const s of surfaces){
    // Hide interior/trim in teaching cutaway; only the actual painted silhouette remains.
    s.mesh.visible=!xray||s.paint||s.wheel;
    s.material.transparent=xray||s.transparent;
    s.material.opacity=xray?(s.wheel?.16:.065):s.opacity;
    s.material.depthWrite=xray?false:s.depthWrite;
    s.mesh.castShadow=!xray&&!s.transparent;
    s.material.needsUpdate=true;
   }
  },
  dispose(){disposed=true;abort.abort();release();}
 };
}
