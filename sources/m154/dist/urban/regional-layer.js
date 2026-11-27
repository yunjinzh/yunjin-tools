// Indexed CMAB regional roof silhouettes. Distances are metres in the atlas east/south frame.
// Each 4.8 km pack holds nine independent 1.6 km cells, sorted by projected prominence.
import * as T from 'three';
const tileSize=1600, packSize=3;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const core={w:(116.35-116.407)*85359.2,e:(116.498-116.407)*85359.2,n:(39.925-40.015)*111033.1,s:(39.925-39.86)*111033.1};
let inventory;
export function regionalInventory(){
  if(!inventory)inventory=fetch(new URL('regional-index.json',import.meta.url)).then(r=>{
    if(!r.ok)throw Error('区域建筑索引读取失败');return r.json();
  }).then(j=>{
    if(j.version!==1||j.tile!==tileSize||j.pack!==packSize)throw Error('区域建筑瓦片版本不匹配');
    const byCell=new Map(j.tiles.map(t=>[t[0]+','+t[1],t]));return {...j,byCell};
  }).catch(e=>{inventory=null;throw e;});
  return inventory;
}
const wallTints=[[169,160,146],[171,174,172],[150,156,153],[177,168,155],[147,154,156],[185,177,161]];
const roofTints=[[147,143,135],[155,156,149],[137,142,139],[162,155,140],[132,142,146],[154,148,136]];
const linear=Uint8Array.from({length:256},(_,v)=>Math.round(255*T.ColorManagement.toWorkingColorSpace(new T.Color().setRGB(v/255,v/255,v/255),T.SRGBColorSpace).r));
function meshCell(bytes,cell,limit,groundAt,gpu){
  const [ix,iz,available,offset,size]=cell,ox=ix*tileSize,oz=iz*tileSize;
  const src=new DataView(bytes,offset,size);if(src.getUint32(0)!==0x52424631||src.getUint32(4,true)!==available)throw Error('区域屋顶几何损坏');
  const pos=[],indices=[],norm=[],tints=[],vertexTints=[],uv=[];let pointer=8,count=0,low=Infinity,high=-Infinity;
  function vertex(x,y,z,c,nx,ny,nz,u,v){
    const id=pos.length/3;pos.push(x,y,z);low=Math.min(low,y);high=Math.max(high,y);
    if(gpu){norm.push(nx,ny,nz);vertexTints.push(linear[c[0]],linear[c[1]],linear[c[2]]);uv.push(u,v);}
    return id;
  }
  function triangle(a,b,c,t,nx,ny,nz){
    indices.push(a,b,c);if(!gpu){tints.push(...t);norm.push(Math.round(127*nx),Math.round(127*ny),Math.round(127*nz));}
  }
  for(let i=0;i<Math.min(available,limit);i++){
    const sheet=src.getUint8(pointer),nr=src.getUint8(pointer+1),h=src.getUint16(pointer+2,true)/10,id=src.getUint32(pointer+4,true);pointer+=8;
    const col=(id+sheet)%wallTints.length,wall=wallTints[col],roof=roofTints[col],rings=[];let gx=0,gz=0;
    for(let j=0;j<nr;j++){
      const n=src.getUint16(pointer,true);pointer+=2;const r=[];
      for(let k=0;k<n;k++){
        const x=src.getInt16(pointer,true)*.5,z=src.getInt16(pointer+2,true)*.5;pointer+=4;
        r.push(new T.Vector2(x,z));if(j===0){gx+=x/n;gz+=z/n;}
      }
      rings.push(r);
    }
    if(!rings.length)continue;
    const datum=groundAt(ox+gx,oz+gz);
    if(!Number.isFinite(datum))continue;
    const top=datum+h,roofBase=pos.length/3;
    const triangles=T.ShapeUtils.triangulateShape(rings[0],rings.slice(1));
    for(const r of rings)for(const pt of r)vertex(pt.x,top,pt.y,roof,0,1,0,0,-1);
    for(const [a,b,c]of triangles){
      const p=roofBase+a,q=roofBase+b,r=roofBase+c;
      // Earcut's x/y plane maps into x/z (opposite upward winding).
      const sign=(pos[q*3]-pos[p*3])*(pos[r*3+2]-pos[p*3+2])-(pos[q*3+2]-pos[p*3+2])*(pos[r*3]-pos[p*3]);
      triangle(p,sign>0?r:q,sign>0?q:r,roof,0,1,0);
    }
    for(let j=0;j<rings.length;j++){
      const r=rings[j],area=T.ShapeUtils.area(r),side=(area>=0?1:-1)*(j===0?1:-1);
      const ground=r.map(p=>Math.min(top-.20,(groundAt(ox+p.x,oz+p.y)??datum)-.36));
      for(let k=0;k<r.length;k++){
        const n=(k+1)%r.length,a=r[k],b=r[n],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<.12)continue;
        const nx=side*dz/len,nz=-side*dx/len;
        const A=vertex(a.x,ground[k],a.y,wall,nx,0,nz,0,0),B=vertex(a.x,top,a.y,wall,nx,0,nz,0,h);
        const C=vertex(b.x,top,b.y,wall,nx,0,nz,len,h),D=vertex(b.x,ground[n],b.y,wall,nx,0,nz,len,0);
        if(side>0){triangle(A,B,C,wall,nx,0,nz);triangle(A,C,D,wall,nx,0,nz);}
        else{triangle(A,C,B,wall,nx,0,nz);triangle(A,D,C,wall,nx,0,nz);}
      }
    }
    count++;
  }
  const out={count,pos:new Float32Array(pos),index:pos.length/3<65536?new Uint16Array(indices):new Uint32Array(indices),origin:[ox,0,oz]};
  if(!count)return out;
  if(gpu){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(out.pos,3));
    g.setAttribute('color',new T.Uint8BufferAttribute(vertexTints,3,true));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(new T.BufferAttribute(out.index,1));g.computeBoundingSphere();out.geom=g;
  }else{
    out.normals=new Int8Array(norm);out.colors=new Uint8Array(tints);
    out.bounds={center:[tileSize/2,(low+high)/2,tileSize/2],radius:Math.hypot(tileSize*.85,(high-low)/2)};
  }
  return out;
}
function facadeMaterial(){
  const m=new T.MeshLambertMaterial({color:0xffffff,vertexColors:true});
  m.name='CMAB 研究屋顶 · 区域示意立面';
  m.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 regionalUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nregionalUV=uv;');
    shader.fragmentShader='varying vec2 regionalUV;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      if(regionalUV.y>=0.){
        vec2 g=regionalUV/vec2(3.45,3.6),p=fract(g),aa=max(fwidth(g),vec2(.014));
        vec2 glass=smoothstep(vec2(.19,.20)-aa,vec2(.19,.20)+aa,p)*(1.-smoothstep(vec2(.80,.81)-aa,vec2(.80,.81)+aa,p));
        diffuseColor.rgb*=1.-.39*glass.x*glass.y*(1.-smoothstep(.15,.61,max(aa.x,aa.y)));
      }`);
  };
  return m;
}

export function createRegionalLayer({scene=null,groundAt,onChange=()=>{}}){
  const gpu=!!scene,group=gpu?new T.Group():null,material=gpu?facadeMaterial():null;
  if(group){group.name='北京区域建筑 · CMAB 2021–2023';scene.add(group);}
  let enabled=true,index=null,reading=false,last=null,wanted=new Map(),timer=0,retryIndex=0;
  const packs=new Map(),pending=new Map(),visible=new Map(),failures=new Map();
  const stats={requests:0,tiles:0,buildings:0,loadedBytes:0};
  const packKey=t=>Math.floor(t[0]/packSize)+'_'+Math.floor(t[1]/packSize);
  function discard(key){
    const old=visible.get(key);if(!old)return;
    if(old.mesh){old.mesh.removeFromParent();old.geom.dispose();}visible.delete(key);
  }
  function report(){stats.tiles=visible.size;stats.buildings=[...visible.values()].reduce((v,p)=>v+p.count,0);onChange();}
  function reset(){
    const changed=visible.size>0;for(const k of visible.keys())discard(k);
    wanted.clear();packs.clear();for(const item of pending.values())item.abort();pending.clear();stats.loadedBytes=0;
    if(timer){clearTimeout(timer);timer=0;}if(changed)report();
  }
  function queue(){if(!timer&&enabled&&wanted.size)timer=setTimeout(pump,4);}
  function trim(){
    const needed=new Set([...wanted.values()].map(o=>packKey(o.t)));
    for(const [k,buf]of packs)if(!needed.has(k)){packs.delete(k);stats.loadedBytes-=buf.byteLength;}
    for(const [k,ctrl] of pending)if(!needed.has(k)){ctrl.abort();pending.delete(k);}
  }
  function pump(){
    timer=0;if(!enabled||!wanted.size)return;
    const now=performance.now();let built=0,more=false;
    for(const [key,o] of wanted){
      const cur=visible.get(key);if(cur&&cur.limit===o.limit)continue;
      const file=packKey(o.t),buffer=packs.get(file);
      if(buffer){
        if(built>=2){more=true;continue;}
        const obj=meshCell(buffer,o.t,o.limit,groundAt,gpu);obj.limit=o.limit;
        discard(key);
        if(gpu&&obj.geom){obj.mesh=new T.Mesh(obj.geom,material);obj.mesh.position.set(...obj.origin);obj.mesh.receiveShadow=false;obj.mesh.name='CMAB '+key;group.add(obj.mesh);}
        visible.set(key,obj);built++;
      }else if(!pending.has(file)&&pending.size<2&&(failures.get(file)||0)<now){
        const ctrl=new AbortController();pending.set(file,ctrl);stats.requests++;
        fetch(new URL('regional-tiles/'+file+'.bin',import.meta.url),{signal:ctrl.signal}).then(r=>{
          if(!r.ok)throw Error('区域建筑分包 '+r.status);return r.arrayBuffer();
        }).then(data=>{
          if(pending.get(file)!==ctrl)return;packs.set(file,data);stats.loadedBytes+=data.byteLength;failures.delete(file);
        }).catch(e=>{if(e.name!=='AbortError')failures.set(file,performance.now()+15000);}).finally(()=>{
          if(pending.get(file)===ctrl)pending.delete(file);queue();
        });
      }
    }
    if(built)report();if(more)queue();
  }
  function update(camera){
    if(!enabled||!camera)return;
    const p=camera.position,m=camera.matrixWorld.elements,base=groundAt(p.x,p.z);
    if(!Number.isFinite(base))return;
    const altitude=Math.max(2,p.y-base),inside=p.x>=core.w&&p.x<=core.e&&p.z>=core.n&&p.z<=core.s;
    if(inside&&altitude<1450){if(wanted.size||visible.size)reset();last=null;return;}
    const now=performance.now();
    if(!index){
      if(!reading&&now>=retryIndex){reading=true;regionalInventory().then(idx=>{index=idx;last=null;update(camera);}).catch(()=>{retryIndex=performance.now()+15000;}).finally(()=>{reading=false;});}
      return;
    }
    const dx=-m[8],dy=-m[9],dz=-m[10];
    if(last&&now-last.when<2200&&Math.hypot(p.x-last.x,p.z-last.z,p.y-last.y)<110&&Math.abs(dx-last.dx)+Math.abs(dz-last.dz)+Math.abs(dy-last.dy)<.055)return;
    last={x:p.x,y:p.y,z:p.z,dx,dy,dz,when:now};
    const gaze=clamp(altitude/Math.max(.16,-dy),250,16000),cx=p.x+gaze*dx,cz=p.z+gaze*dz,radius=clamp(2350+1.35*altitude,2450,14500);
    const forward=Math.hypot(dx,dz),candidates=[];
    for(let ix=Math.floor((cx-radius)/tileSize);ix<=Math.floor((cx+radius)/tileSize);ix++){
      for(let iz=Math.floor((cz-radius)/tileSize);iz<=Math.floor((cz+radius)/tileSize);iz++){
        const key=ix+','+iz,t=index.byCell.get(key);if(!t)continue;
        const x=(ix+.5)*tileSize,z=(iz+.5)*tileSize,focusD=Math.hypot(cx-x,cz-z);
        if(focusD>radius+tileSize*.42)continue;
        const ex=x-p.x,ez=z-p.z;if(forward>.18&&(ex*dx+ez*dz)/forward < -tileSize*.79-altitude*.23)continue;
        const detail=Math.max(altitude*.65,focusD*.71);
        const cap=detail<1150?(gpu?700:400):detail<2500?(gpu?330:170):detail<4700?(gpu?100:58):(gpu?35:18);
        candidates.push({key,t,d:focusD,limit:Math.min(t[2],cap)});
      }
    }
    candidates.sort((a,b)=>a.d-b.d);
    wanted=new Map(candidates.slice(0,altitude>4000?(gpu?95:61):(gpu?44:30)).map(c=>[c.key,c]));
    let removed=false;for(const k of visible.keys())if(!wanted.has(k)){discard(k);removed=true;}trim();if(removed)report();queue();
  }
  return {update,stats,cpuParts:()=>visible.values(),setEnabled(v){enabled=!!v;last=null;if(!enabled)reset();},
    dispose(){enabled=false;reset();group?.removeFromParent();material?.dispose();}};
}
