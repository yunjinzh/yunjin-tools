import * as THREE from 'three';
import type {StudioEngine} from './engine';
import type {Settings,LayerInfo} from './types';
import type {SceneView,TourKeyframe} from './tour';

type PlacementData={meshId:string;point:[number,number,number];normal:[number,number,number];size:number;rotation:number;aspect:number};
export type EngineSnapshot={model:ReturnType<THREE.Group['toJSON']>;decals:ReturnType<THREE.Group['toJSON']>;layers:{info:LayerInfo;groupId:string;placement?:PlacementData}[];view:SceneView;keyframes:TourKeyframe[];settings:Settings};

// Copy only serializable scene data. Decals hold live mesh references at runtime.
export function serializableTree(source:THREE.Object3D):THREE.Object3D{
 const mesh=source as THREE.Mesh;
 const target=mesh.isMesh?new THREE.Mesh(mesh.geometry,mesh.material):new THREE.Group();
 target.uuid=source.uuid;target.name=source.name;target.position.copy(source.position);target.quaternion.copy(source.quaternion);target.scale.copy(source.scale);target.visible=source.visible;target.castShadow=source.castShadow;target.receiveShadow=source.receiveShadow;target.renderOrder=source.renderOrder;
 const {targetMesh,...data}=source.userData;target.userData={...data,...(targetMesh?{targetMeshId:targetMesh.uuid}:{})};
 source.children.forEach(child=>target.add(serializableTree(child)));return target;
}
export function captureEngine(engine:StudioEngine):EngineSnapshot{
 return {model:serializableTree(engine.model).toJSON(),decals:serializableTree(engine.decalRoot).toJSON(),layers:engine.layers.map(l=>({info:{...l.info},groupId:l.group.uuid,...(l.placement?{placement:{meshId:l.placement.mesh.uuid,point:l.placement.point.toArray() as [number,number,number],normal:l.placement.normal.toArray() as [number,number,number],size:l.placement.size,rotation:l.placement.rotation,aspect:l.placement.aspect}}:{})})),view:engine.sceneView(),keyframes:structuredClone(engine.keyframes),settings:{...engine.settings}};
}
export async function restoreEngine(data:EngineSnapshot){
 const loader=new THREE.ObjectLoader();
 const [model,decals]=await Promise.all([loader.parseAsync(data.model),loader.parseAsync(data.decals)]);
 const meshes=new Map(model.children.map(m=>[m.uuid,m as THREE.Mesh]));
 if(!meshes.size||model.children.some(m=>!(m as THREE.Mesh).isMesh))throw Error('项目模型结构无效。');
 decals.traverse(o=>{const id=o.userData.targetMeshId;if(id){const target=meshes.get(id);if(!target)throw Error('图层引用了不存在的部件。');o.userData={targetMesh:target};}});
 const layers=data.layers.map(l=>{const group=decals.children.find(g=>g.uuid===l.groupId) as THREE.Group|undefined;if(!group)throw Error('图层数据不完整。');
  const p=l.placement;let placement;
  if(p){const mesh=meshes.get(p.meshId);const material=(group.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial|undefined;if(!mesh||!material?.map)throw Error('文字或贴纸图层数据不完整。');placement={mesh,texture:material.map,point:new THREE.Vector3(...p.point),normal:new THREE.Vector3(...p.normal),size:p.size,rotation:p.rotation,aspect:p.aspect};}
  return {info:{...l.info},group,placement};
 });return{model,decals,layers};
}
