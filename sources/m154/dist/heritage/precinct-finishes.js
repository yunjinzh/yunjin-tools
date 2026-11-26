// Reuses the rectified surface photographs and credits of the gate and palace.
// Grey ceramic tiles are a desaturated derivative of gate-roof.webp.
import * as THREE from 'three';
const files={gold:'gate-roof',grey:'precinct-grey-tile',wall:'gate-plaster',stone:'gate-paving',doors:'gate-doors',beam:'gate-lower-paint'};
const materials=new Map();
function material(key){
  if(materials.has(key))return materials.get(key);
  const url=new URL('./'+files[key]+'.webp',import.meta.url).href;
  const tex=typeof document==='undefined'?new THREE.Texture():new THREE.TextureLoader().load(url);
  tex.userData.src=url;tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;tex.wrapT=tex.wrapS=THREE.RepeatWrapping;
  const mat=new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:key==='gold'?.54:.88,metalness:.018,
    color:key==='gold'?0xe8d8bd:key==='grey'?0xdfdfda:key==='wall'?0xf4d8cf:0xffffff});
  mat.name='中轴线 · '+files[key];materials.set(key,mat);return mat;
}
export class PrecinctFinishes {
  constructor(){this.layers=new Map();}
  face(key,positions,uv){
    if(!this.layers.has(key))this.layers.set(key,{positions:[],uv:[],indices:[]});
    const out=this.layers.get(key),offset=out.positions.length/3;
    for(const p of positions)out.positions.push(...p);
    for(const t of uv)out.uv.push(...t);
    for(let i=1;i+1<positions.length;i++)out.indices.push(offset,offset+i,offset+i+1);
  }
  roof(key,points){
    // Tile courses extend downhill. Use the 3D surface normal rather than the
    // bounding rectangle so every hip, gable and secondary roof pitches correctly.
    const a=new THREE.Vector3(...points[0]),c=new THREE.Vector3(...points[1]).sub(a),d=new THREE.Vector3(...points[2]).sub(a);
    const n=c.cross(d);let L=Math.hypot(n.x,n.z);
    if(L<1e-8){n.x=0;n.z=1;L=1;}
    const s=n.x/L,t=n.z/L;
    const tileWidth=key==='gold'?2.94:3.05;
    const uv=points.map(([x,y,z])=>[(x*t-z*s)/tileWidth,(x*s+z*t)*.33]);
    this.face(key,points,uv);
  }
  masonry(points){
    const a=points[0],c=points.find(p=>Math.hypot(p[0]-a[0],p[2]-a[2])>.05)||a;
    const len=Math.hypot(c[0]-a[0],c[2]-a[2])||1,dx=(c[0]-a[0])/len,dz=(c[2]-a[2])/len;
    this.face('wall',points,points.map(([x,y,z])=>[(x*dx+z*dz)/6.3,y/3.5]));
  }
  finish(b){
    for(const [key,layer] of this.layers){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(layer.positions,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(layer.uv,2));g.setIndex(layer.indices);g.computeVertexNormals();g.computeBoundingSphere();
      const mesh=new THREE.Mesh(g,material(key));
      mesh.castShadow=key==='gold'||key==='grey'||key==='wall';mesh.receiveShadow=true;b.decals.push(mesh);
    }
  }
}
// Older palace roof footprints have their own trustworthy shape. Remap just their
// existing triangle faces in the flanking courts to the same tile photographs.
export function finishPalaceFlanks(b,finishes){
  if(!b.groups)return;
  for(const [key,g] of b.groups){
    if(key!=='solid'&&key!=='glaze')continue;
    const keep=[];
    for(let k=0;k<g.idx.length;k+=3){
      const ids=g.idx.slice(k,k+3),o=ids[0]*3;
      const x=g.pos[o],y=g.pos[o+1],z=g.pos[o+2];
      const r=g.col[o],green=g.col[o+1],blue=g.col[o+2];
      const inFlanks=Math.abs(x)>48&&Math.abs(x)<190&&z>-167&&z<244;
      if(inFlanks&&y>4.4&&r>.33&&green>.12&&green<r*.75&&blue<green*.45){
        const pts=ids.map(i=>g.pos.slice(i*3,i*3+3)),t=pts[0];
        const A=pts[1].map((v,j)=>v-t[j]),B=pts[2].map((v,j)=>v-t[j]);
        const nx=A[1]*B[2]-A[2]*B[1],ny=A[2]*B[0]-A[0]*B[2],nz=A[0]*B[1]-A[1]*B[0],horiz=Math.hypot(nx,nz);
        if(Math.abs(ny)>horiz*.45&&horiz>.025*Math.abs(ny)){finishes.roof('gold',pts);continue;}
      }
      keep.push(...ids);
    }
    g.idx=keep;
  }
}
