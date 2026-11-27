// The local exhibition GLBs each contain one indexed, unlit primitive and an embedded JPEG atlas.
import * as T from '../../vendor/three.module.min.js';

export function meshView(canvas) {
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setClearColor(0x171d1b);renderer.setPixelRatio(Math.min(1.7,devicePixelRatio));
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(41.5,1,.025,19);
  let object=null,bitmap=null,version=0,abort;

  function clear(){
    ++version;abort?.abort();
    if(object){scene.remove(object);object.geometry.dispose();object.material.map.dispose();object.material.dispose();object=null;}
    bitmap?.close();bitmap=null;
  }

  async function load(file){
    clear();const current=version;abort=new AbortController();
    const response=await fetch(file,{signal:abort.signal});
    if(!response.ok)throw Error('模型暂时无法读取');
    const bytes=await response.arrayBuffer(),header=new DataView(bytes);
    const length=header.getUint32(12,true),start=28+length;
    const doc=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,length)));
    const primitive=doc.meshes[0].primitives[0],image=doc.bufferViews[doc.images[0].bufferView];
    const photo=await createImageBitmap(new Blob([new Uint8Array(bytes,start+image.byteOffset,image.byteLength)],{type:doc.images[0].mimeType}));
    if(current!==version){photo.close();return false;}
    bitmap=photo;
    function array(id,Type,size){const a=doc.accessors[id],view=doc.bufferViews[a.bufferView];return new Type(bytes,start+(view.byteOffset||0)+(a.byteOffset||0),a.count*size);}
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.BufferAttribute(array(primitive.attributes.POSITION,Float32Array,3),3));
    geometry.setAttribute('uv',new T.BufferAttribute(array(primitive.attributes.TEXCOORD_0,Float32Array,2),2));
    geometry.setIndex(new T.BufferAttribute(array(primitive.indices,Uint32Array,1),1));
    const texture=new T.Texture(photo);texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;
    object=new T.Mesh(geometry,new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));scene.add(object);
    return true;
  }

  function draw(yaw,elevation,distance){
    if(!object)return;
    const w=canvas.parentElement.clientWidth,h=canvas.parentElement.clientHeight;
    renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();
    const co=Math.cos(elevation),d=distance*(camera.aspect<1.35?1.35/camera.aspect:1);
    camera.position.set(d*Math.sin(yaw)*co,d*Math.sin(elevation),d*Math.cos(yaw)*co);
    camera.lookAt(0,0,0);renderer.render(scene,camera);
  }
  return {load,draw,clear};
}
