// Deterministic Canvas projection of the same Three.js geometry when WebGL is unavailable.
// Keeps object picking, camera rotation and lab state usable on restricted classroom devices.
class SoftwareRenderer {
  constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');this.shadowMap={};this.ratio=1;this.width=1;this.height=1;this.software=true;}
  setPixelRatio(r){this.ratio=Math.min(r,1.5);}
  setClearColor(){}
  setSize(w,h){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
  render(scene,camera){
    const ctx=this.ctx,w=this.width,h=this.height,r=this.ratio;ctx.setTransform(r,0,0,r,0,0);ctx.clearRect(0,0,w,h);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    const faces=[],sprites=[],light=new THREE.Vector3(-.4,.85,.5).normalize(),view=new THREE.Vector3();camera.getWorldDirection(view).negate();
    const ab=new THREE.Vector3(),ac=new THREE.Vector3(),normal=new THREE.Vector3();
    const project=v=>{const p=v.clone().applyMatrix4(vp);return [(p.x+1)*w/2,(1-p.y)*h/2,p.z];};
    scene.traverseVisible(obj=>{
      if(obj.isSprite){const pos=new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld),p=project(pos),scale=new THREE.Vector3();obj.getWorldScale(scale);const unit=h/(camera.top-camera.bottom)*camera.zoom;sprites.push({p,width:scale.x*unit,height:scale.y*unit,image:obj.material.map?.image});return;}
      if(!obj.isMesh||!obj.geometry?.attributes?.position)return;
      const pos=obj.geometry.attributes.position,indices=obj.geometry.index,verts=[],projected=[];
      for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(obj.matrixWorld);verts.push(v);projected.push(project(v));}
      const count=indices?indices.count:pos.count,material=Array.isArray(obj.material)?obj.material[0]:obj.material;
      if(!material||material.opacity===0)return;
      for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>indices?indices.getX(i+j):i+j),a=verts[ids[0]],b=verts[ids[1]],c=verts[ids[2]],ps=ids.map(i=>projected[i]);
        if(ps.every(p=>p[2]<-1||p[2]>1))continue;
        ab.subVectors(b,a);ac.subVectors(c,a);normal.crossVectors(ab,ac).normalize();
        if(material.side!==THREE.DoubleSide&&normal.dot(view)<0)continue;
        if(normal.dot(view)<0)normal.negate();
        const shade=material.isMeshBasicMaterial?1:.58+.42*Math.max(0,normal.dot(light));const color=material.color?material.color.clone():new THREE.Color(0xc5d3ca);color.multiplyScalar(shade);
        faces.push({p:ps,z:(ps[0][2]+ps[1][2]+ps[2][2])/3,color:color.getStyle(),opacity:material.opacity??1});
      }
    });
    faces.sort((a,b)=>b.z-a.z);
    for(const f of faces){ctx.globalAlpha=f.opacity;ctx.fillStyle=f.color;ctx.beginPath();ctx.moveTo(f.p[0][0],f.p[0][1]);ctx.lineTo(f.p[1][0],f.p[1][1]);ctx.lineTo(f.p[2][0],f.p[2][1]);ctx.closePath();ctx.fill();if(f.opacity>.8){ctx.strokeStyle=f.color;ctx.lineWidth=.4;ctx.stroke();}}
    ctx.globalAlpha=1;
    for(const s of sprites){if(s.image)ctx.drawImage(s.image,s.p[0]-s.width/2,s.p[1]-s.height/2,s.width,s.height);}
  }
}
