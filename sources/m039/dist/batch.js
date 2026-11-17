import * as THREE from './vendor/three.module.js';

// Bake static transforms and group geometry by material to reduce draw calls.
// Dynamic objects and instanced forests remain independently animated.
export function batchStatic(root,predicate=()=>true){
  root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),batches=new Map();
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||!predicate(o))return;
    const key=o.material.uuid+'_'+o.castShadow+'_'+o.receiveShadow;
    if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);
  });
  for(const objects of batches.values()){
    if(objects.length<3)continue;
    let count=0;for(const o of objects)count+=o.geometry.index?.count||o.geometry.attributes.position.count;
    const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2);
    const v=new THREE.Vector3(),n=new THREE.Vector3(),transform=new THREE.Matrix4(),normalMatrix=new THREE.Matrix3();let offset=0;
    for(const o of objects){
      transform.multiplyMatrices(inverse,o.matrixWorld);normalMatrix.getNormalMatrix(transform);
      const g=o.geometry,position=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv,size=g.index?.count||position.count;
      for(let k=0;k<size;k++){
        const idx=g.index?g.index.getX(k):k;v.fromBufferAttribute(position,idx).applyMatrix4(transform);v.toArray(positions,offset*3);
        if(normal)n.fromBufferAttribute(normal,idx).applyNormalMatrix(normalMatrix);else n.set(0,1,0);n.toArray(normals,offset*3);
        if(uv){uvs[offset*2]=uv.getX(idx);uvs[offset*2+1]=uv.getY(idx);}offset++;
      }
      o.removeFromParent();
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('normal',new THREE.BufferAttribute(normals,3));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
    const first=objects[0],m=new THREE.Mesh(g,first.material);m.castShadow=first.castShadow;m.receiveShadow=first.receiveShadow;m.name='Static geometry batch';root.add(m);
  }
}
