import * as THREE from 'three';
import {mergeGeometries} from './vendor/addons/utils/BufferGeometryUtils.js';

// Batch static furniture by material, while keeping selectable cargo and the
// navigation floor separate. The real robot retains its articulated hierarchy.
export function batchMeshes(group,includeEntities=false) {
  group.updateWorldMatrix(true,true);
  const inverse=group.matrixWorld.clone().invert(),buckets=new Map();
  const instances=new Map();
  group.traverse(mesh=>{
    if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.userData.simready||mesh.userData.entityId||mesh.material.transparent)return;
    const key=mesh.geometry.uuid+'-'+mesh.material.uuid;
    if(!instances.has(key))instances.set(key,[]);instances.get(key).push(mesh);
  });
  for(const list of instances.values()){
    if(list.length<2)continue;
    const instanced=new THREE.InstancedMesh(list[0].geometry,list[0].material,list.length);
    instanced.userData.simready=list[0].userData.simready;instanced.castShadow=true;instanced.receiveShadow=true;
    list.forEach((mesh,i)=>{instanced.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));mesh.removeFromParent();});
    instanced.computeBoundingSphere();group.add(instanced);
  }
  group.traverse(mesh=>{
    if(!mesh.isMesh||mesh.isSkinnedMesh||mesh.isInstancedMesh||mesh.userData.simready||mesh.userData.floor||mesh.material?.transparent||Array.isArray(mesh.material))return;
    if(!includeEntities&&mesh.userData.entityId)return;
    if(!mesh.geometry.attributes.position||!mesh.geometry.attributes.normal||!mesh.geometry.attributes.uv)return;
    const key=mesh.material.uuid;
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(mesh);
  });
  for(const list of buckets.values()){
    if(list.length<2)continue;
    const pieces=list.map(mesh=>{
      const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));return geometry;
    });
    const merged=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
    if(!merged)continue;
    const mesh=new THREE.Mesh(merged,list[0].material);mesh.castShadow=true;mesh.receiveShadow=true;
    if(includeEntities)mesh.userData.entityId=list[0].userData.entityId;
    group.add(mesh);
    for(const original of list){original.removeFromParent();if(!original.geometry.userData.shared)original.geometry.dispose();}
  }
}
