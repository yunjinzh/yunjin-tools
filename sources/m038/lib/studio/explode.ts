import * as THREE from 'three';

/** Imported geometry is baked into assembly coordinates, so mesh origins are not part centers. */
export function explosionOffsets(meshes:THREE.Mesh[]):Map<THREE.Mesh,THREE.Vector3>{
  const bounds=new THREE.Box3();
  const centers=meshes.map(mesh=>{
    mesh.geometry.computeBoundingBox();
    bounds.union(mesh.geometry.boundingBox!);
    return mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
  });
  const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  const span=Math.max(size.x,size.y,size.z,0.001),offsets=new Map<THREE.Mesh,THREE.Vector3>();
  meshes.forEach((mesh,index)=>{
    const relative=centers[index].clone().sub(center);
    const direction=new THREE.Vector3(relative.x/Math.max(size.x,.15*span),relative.y/Math.max(size.y,.15*span),relative.z/Math.max(size.z,.15*span));
    // Concentric shells and coincident mesh centers need distinct, deterministic directions.
    const coincident=centers.some((point,i)=>i!==index&&point.distanceTo(centers[index])<span*.055);
    const phi=index*2.399963229728653,y=1-2*(index+.5)/Math.max(meshes.length,1);
    const radial=Math.sqrt(1-y*y),fallback=new THREE.Vector3(Math.cos(phi)*radial,y,Math.sin(phi)*radial);
    if(direction.length()<.055)direction.copy(fallback);
    else if(coincident)direction.normalize().multiplyScalar(.65).addScaledVector(fallback,.65);
    direction.normalize();
    offsets.set(mesh,direction.multiplyScalar(span*.55+relative.length()*.7));
  });
  return offsets;
}
