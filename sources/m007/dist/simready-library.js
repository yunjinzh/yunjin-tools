import * as THREE from 'three';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/addons/libs/meshopt_decoder.mjs';

const BASE = new URL('./assets/simready/', import.meta.url);

export class SimReadyLibrary {
  constructor() { this.models=new Map();this.loaded=false;this.completed=0;this.manifest=null; }
  has(id) { return this.models.has(id); }

  async load(anisotropy=4) {
    const response=await fetch(new URL('manifest.json',BASE));
    if(!response.ok)throw new Error('场景素材清单加载失败');
    this.manifest=await response.json();
    const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const queue=[...this.manifest.assets];
    await Promise.all(Array.from({length:4},async()=>{
      while(queue.length){
        const item=queue.shift(),gltf=await loader.loadAsync(new URL(item.id+'.glb',BASE).href);
        this.register(item,gltf.scene,anisotropy);this.completed++;
      }
    }));
    this.loaded=true;return this;
  }

  register(item,scene,anisotropy=4) {
    scene.traverse(mesh=>{
      if(!mesh.isMesh)return;
      // Static batching transforms geometry. Decode normalized integer data
      // before those transforms so coordinates are never clipped to [0,1].
      for(const key of ['position','normal','uv']){
        const attribute=mesh.geometry.getAttribute(key);
        if(!attribute?.normalized&&!attribute?.isInterleavedBufferAttribute)continue;
        const array=new Float32Array(attribute.count*attribute.itemSize);
        for(let i=0;i<attribute.count;i++)for(let c=0;c<attribute.itemSize;c++)array[i*attribute.itemSize+c]=attribute.getComponent(i,c);
        mesh.geometry.setAttribute(key,new THREE.BufferAttribute(array,attribute.itemSize));
      }
      mesh.geometry.userData.shared=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
      mesh.userData.simready=item.id;mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;
      mesh.material.userData.shared=true;
      if(item.id==='steak'){
        // The published scan depicts raw beef. Retain its geometry and detail
        // maps, and remap luminance to a cooked surface for the served dish.
        mesh.material.roughness=.72;mesh.material.metalness=0;
        mesh.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
          '#include <map_fragment>\nfloat meatDetail=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));\ndiffuseColor.rgb=mix(vec3(0.035,0.012,0.006),vec3(0.36,0.16,0.06),pow(clamp(meatDetail,0.0,1.0),0.7));');};
        mesh.material.customProgramCacheKey=()=> 'simready-cooked-steak-v1';
      }
      for(const value of Object.values(mesh.material))if(value?.isTexture){value.userData.shared=true;value.anisotropy=Math.min(8,anisotropy);}
    });
    this.models.set(item.id,{scene,item});
  }

  place(parent,id,x,y,z,options={}) {
    const model=this.models.get(id);if(!model)return null;
    const root=new THREE.Group();root.name='simready-'+id;root.userData.simreadyAsset=id;
    root.add(model.scene.clone(true));root.position.set(x,y,z);root.rotation.y=options.rotation||0;
    if(options.size)root.scale.set(...options.size.map((n,i)=>n/model.item.size[i]));
    else root.scale.setScalar(options.height?options.height/model.item.size[1]:options.scale??1);
    parent.add(root);return root;
  }
}
