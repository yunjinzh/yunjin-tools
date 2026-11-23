const W=(()=>{
 const T=THREE,host=document.getElementById('world'),labels=document.getElementById('labels');
 let renderer,scene,camera,root,ctx,flatCanvas,ray=new T.Raycaster(),rng=1,idx=0,t=0,person,foe,heroRig,foeRig,points=[],markers=[],ripples=[],dust,slash,foeRing,crest,beam,fxTime=0,foeFX=0,w=0,h=0;
 const mats=new Map(),geos=new Map(),v=new T.Vector3();
 function rand(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296}
 function mat(c,flat=true){let k=c+flat;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color:c,flatShading:flat,roughness:.94}));return mats.get(k)}
 function geom(k,fn){if(!geos.has(k))geos.set(k,fn());return geos.get(k)}
 function mesh(g,c,x,y,z,sx=1,sy=1,sz=1,parent=root){const m=new T.Mesh(g,typeof c==='string'?mat(c):c);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
 const box=()=>geom('box',()=>new T.BoxGeometry(1,1,1)),orb=()=>geom('orb',()=>new T.IcosahedronGeometry(1,0)),soft=()=>geom('soft',()=>new T.IcosahedronGeometry(1,1));
 function cyl(a,b,hh,n=12){return geom([a,b,hh,n].join('/'),()=>new T.CylinderGeometry(a,b,hh,n))}
 function brick(x,y,z,sx,sy,sz,c,p){return mesh(box(),c,x,y,z,sx,sy,sz,p)}
 function beamBetween(a,b,r,c,p=root,r2=r){let d=new T.Vector3(...b).sub(new T.Vector3(...a));let m=mesh(cyl(r2,r,1,6),c,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,1,d.length(),1,p);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
 function group(x,y,z,p=root){let g=new T.Group();p.add(g);g.position.set(x,y,z);return g}
 function disc(x,y,z,r,c,p=root){let m=mesh(geom('disc',()=>new T.CircleGeometry(1,26)),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.25,depthWrite:false}),x,y,z,r,r,1,p);m.rotation.x=-Math.PI/2;return m}
 function roof(p,x,y,z,s){const g=group(x,y,z,p);g.scale.setScalar(s);const eaves=[[-1.5,.20,-1],[-1.1,0,-1],[0,-.05,-1],[1.1,0,-1],[1.5,.20,-1],[1.5,.12,0],[1.5,.2,1],[1.1,0,1],[0,-.05,1],[-1.1,0,1],[-1.5,.2,1],[-1.5,.12,0]];let a=[];for(let i=0;i<12;i++){let e=eaves[i],f=eaves[(i+1)%12],re=q=>[q[0]*.62,.72,q[2]*.05];a.push(...e,...f,...re(e),...f,...re(f),...re(e));beamBetween(e,f,.045,'#393d35',g)}
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a,3));geo.computeVertexNormals();let rm=mat('#485751');rm.side=T.DoubleSide;mesh(geo,rm,0,0,0,1,1,1,g);beamBetween([-.99,.76,0],[.99,.76,0],.07,'#647166',g);for(let i=-5;i<=5;i++){let q=i*.23;for(let j of [-1,1])beamBetween([q*.65,.72,j*.04],[q,.02,j],.018,'#63726a',g)}}
 function pavilion(x,z,s=1,floors=1){let g=group(x,.05,z);g.scale.setScalar(s);brick(0,.11,0,2.75,.22,2,'#9b9884',g);for(let f=0;f<floors;f++){let a=1-f*.12,y=.24+f*1.25;for(let xx of [-1,1])for(let zz of [-.65,.65]){mesh(cyl(.074,.1,1.45), '#8c4636',xx*a,y+.72,zz*a,1,1,1,g)}if(f>0)brick(0,y+.38,0,1.45*a,.8,.95*a,'#b5a17c',g);brick(0,y+1.30,0,2.36*a,.14,1.53*a,'#673f2d',g);roof(g,0,y+1.45,0,a);for(let xx of [-1,1]){mesh(soft(),'#bb563c',xx*a,y+1,.7*a,.13,.20,.13,g)}}return g}
 function pine(x,z,s=1,autumn=false){const g=group(x,.05,z);g.scale.setScalar(s);let woody='#554b39';beamBetween([0,0,0],[.16,1.45,0],.105,woody,g,.075);beamBetween([.16,1.45,0],[-.09,2.65,.07],.08,woody,g,.03);let colors=autumn?['#9b4830','#ae5b39','#8b4835']:['#435c48','#49664f','#5d7656'];for(let i=0;i<7;i++){let ang=i*2.34+rand()*.28,rr=(1-i*.105)*.94,yy=1.05+i*.23,dx=Math.cos(ang)*rr,dz=Math.sin(ang)*rr;beamBetween([.05,yy-.35,0],[dx,yy,dz],.045,woody,g,.024);mesh(soft(),colors[i%3],dx,yy+.11,dz,.62-i*.037,.22,.48,g)}}
 function willow(x,z,s){const g=group(x,.03,z);g.scale.setScalar(s);beamBetween([0,0,0],[.15,2.5,0],.15,'#675440',g,.08);for(let i=0;i<18;i++){let a=i*2.40,r=.6+rand()*.6,xx=Math.cos(a)*r,zz=Math.sin(a)*r;beamBetween([.1,2,0],[xx,2.5,zz],.036,'#675440',g);mesh(soft(),'#687c4c',xx,2.47,zz,.48,.22,.38,g);for(let j=0;j<2;j++){let end=[xx+.18*Math.cos(a),.75+rand()*.8,zz+.18*Math.sin(a)];beamBetween([xx,2.46,zz],end,.019,j?'#798c59':'#809260',g,.008)}}}
 function boat(x,z,s=1){const g=group(x,.1,z);g.scale.setScalar(s);mesh(soft(),'#694b34',0,.04,0,1.3,.23,.47,g);mesh(soft(),'#ad8858',0,.18,0,1.07,.08,.35,g);for(let i of [-1,1])beamBetween([i*.68,.12,0],[i*1.39,.41,0],.09,'#5c4934',g);beamBetween([-.25,.2,0],[-.25,1.7,0],.03,'#674f34',g);const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(.77,.12);sh.lineTo(0,1.17);sh.closePath();let m=mat('#e6d1a3');m.side=T.DoubleSide;mesh(new T.ShapeGeometry(sh),m,-.23,.47,0,1,1,1,g);g.rotation.y=-.28}
 function lantern(x,z){const g=group(x,0,z);mesh(cyl(.055,.075,1.45,8),'#5f503a',0,.72,0,1,1,1,g);brick(.20,1.42,0,.5,.05,.07,'#5f503a',g);mesh(soft(),'#d18b4e',.34,1.16,0,.125,.19,.125,g);brick(.34,1.34,0,.22,.05,.21,'#5c4835',g)}
 function road(a,b){let n=15;for(let i=0;i<=n;i++){let u=i/n,x=a[0]*(1-u)+b[0]*u,z=a[1]*(1-u)+b[1]*u;let q=mesh(cyl(1,1,.024,7),['#baa98a','#c4b59a','#c8b99c'][i%3],x,.034,z,.49+rand()*.16,1,.32+rand()*.13);q.rotation.y=rand()*.26}}
 function character(enemy=false){
  let holder=group(0,0,0),body=group(0,0,0,holder),coat=enemy?'#524760':'#314d50',scarf=enemy?'#9181a0':'#ad4937',pants='#3b3934';
  disc(0,.025,0,.49,'#26362c',holder);let legs=[];for(let k of [-1,1]){let leg=group(k*.12,.65,0,body);mesh(cyl(.095,.073,.45,7),pants,0,-.19,0,1,1,1,leg);brick(0,-.43,.055,.14,.12,.28,'#343733',leg);legs.push(leg)}
  mesh(cyl(.19,.34,.53,10),coat,0,.68,-.01,1,1,.84,body);mesh(cyl(.22,.19,.40,9),coat,0,1.02,0,1,1,.82,body);mesh(cyl(.22,.22,.065,10),'#a88a56',0,.87,.005,1,1,.83,body);mesh(soft(),'#b98c63',0,1.38,0,.16,.20,.145,body);mesh(soft(),'#372e25',0,1.46,-.045,.165,.16,.145,body);
  mesh(cyl(.045,.405,.18,16),enemy?'#655c68':'#bd9962',0,1.6,0,1,1,.94,body);mesh(cyl(.39,.37,.037,16),enemy?'#494451':'#7e6846',0,1.507,0,1,1,.94,body);
  let cape=mesh(cyl(.19,.34,.66,6),scarf,.015,1.01,-.16,1,1,.39,body);cape.rotation.x=-.18;mesh(cyl(.19,.245,.105,9),scarf,0,1.23,0,1,1,.9,body);
  let arms=[];for(let k of [-1,1]){let arm=group(k*.22,1.2,0,body);mesh(cyl(.095,.108,.32,7),coat,0,-.15,.015,1,1,1,arm);mesh(soft(),'#b28a66',0,-.32,.06,.075,.082,.075,arm);arms.push(arm)}
  let sword=group(0,-.32,.10,arms[1]);beamBetween([0,0,-.08],[0,0,.67],.028,'#dbd9c3',sword,.004);brick(0,0,.07,.19,.038,.04,'#b59a58',sword);beamBetween([-.21,.58,-.22],[.28,1.34,-.22],.045,'#634c35',body);
  return {holder,body,arms,legs,cape,sword}
 }
 function terrain(){
  const n=54,co=[],tri=[];for(let i=0;i<n;i++){let a=i/n*Math.PI*2,ir=.97+.035*Math.sin(a*3)+.024*Math.cos(a*7);co.push([Math.cos(a)*8.3*ir,Math.sin(a)*5.55*ir])}const shape=new T.Shape();co.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  let top=mesh(new T.ShapeGeometry(shape),L[idx].ground,0,0,0);top.rotation.x=-Math.PI/2;
  for(let i=0;i<n;i++){let a=co[i],b=co[(i+1)%n];tri.push(a[0],-.012,a[1],b[0],-.012,b[1],a[0]*.96,-.52,a[1]*.96,b[0],-.012,b[1],b[0]*.96,-.52,b[1]*.96,a[0]*.96,-.52,a[1]*.96)}
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(tri,3));g.computeVertexNormals();let m=mat('#786d53');m.side=T.DoubleSide;mesh(g,m,0,0,0);
  let lake=mesh(cyl(1,1,.16,70),L[idx].water,0,-.54,0,9.2,1,6.6);let edges=mesh(cyl(1,.985,.2,70),'#736348',0,-.72,0,9.22,1,6.63);for(let i=0;i<100;i++){let a=rand()*6.283,r=.92+rand()*.08,x=Math.cos(a)*8.95*r,z=Math.sin(a)*6.33*r;let q=brick(x,-.446,z,.09+rand()*.42,.008,.018,'#bed1b8');ripples.push(q)}
  for(let k=0;k<300;k++){const a=rand()*Math.PI*2,r=Math.sqrt(rand()),x=7.7*r*Math.cos(a),z=5.0*r*Math.sin(a);let color=new T.Color(L[idx].ground);color.multiplyScalar(.90+rand()*.16);mesh(cyl(1,1,.006,5),'#'+color.getHexString(),x,.005+rand()*.004,z,.06+rand()*.29,1,.03+rand()*.12)}
  for(let k=0;k<30;k++){let a=k/30*Math.PI*2;let x=Math.cos(a)*8.35,z=Math.sin(a)*5.55;mesh(orb(),['#8c8d76','#707c72','#a2a18a'][k%3],x,-.27,z,.21+rand()*.27,.12+rand()*.22,.18+rand()*.22)}
  let prev=[0,3.1];for(let n of L[idx].nodes){road(prev,[n[1],n[2]]);prev=[n[1],n[2]]}
  for(let i=0;i<105;i++){let a=rand()*6.283,r=Math.sqrt(rand())*.96,x=Math.cos(a)*7.95*r,z=Math.sin(a)*5.2*r;if(z>-2.4&&Math.abs(x)<5.7)continue;let k=rand();if(k<.25)mesh(orb(),['#778077','#8d9081','#747969'][i%3],x,.08,z,.12+rand()*.32,.12+rand()*.24,.16+rand()*.25);else mesh(cyl(.01,.07,.2,4),'#6b774d',x,.1,z,1,1+rand(),1)}
  for(let i=0;i<9;i++){let a=3.45+i*.31,x=Math.cos(a)*7,z=Math.sin(a)*4.05;if(Math.abs(x)<1.9&&idx===1)continue;pine(x,z,.57+rand()*.38,idx===4&&i%2===0)}
  if(idx===0){willow(1.9,-2.9,1.08);pavilion(-4.8,-.9,.95);boat(6.6,2.4,.76)}
  if(idx===1){pavilion(.2,-2.8,1.10,3);boat(5.7,2.85,.9)}
  if(idx===2){pine(-4.6,-1.1,1.20);for(let j=0;j<5;j++)mesh(orb(),'#77857f',-4.4+j*.26,.22,-.9,.45,.4,.55);boat(5.6,2.2,.85);pavilion(.9,-3.3,.72)}
  if(idx===3){pavilion(-4.8,-.65,.83);boat(.7,-2.6,1.15);for(let i=0;i<5;i++)mesh(orb(),'#7f8879',3+i*.58,.45+rand()*.4,-3.1,.7,1+rand(),.75);boat(6.1,2.1,.65)}
  if(idx===4){pavilion(.3,-2.7,1.12);mesh(cyl(.18,.36,.57,10),'#937644',.3,1.14,-2.7);boat(5.65,2.4,.84);pine(-5,.1,1.16,true)}
  if(idx===5){pavilion(4.95,-.7,1.03,2);pavilion(-4.7,-1.15,.85);pine(-1.6,-2.8,.99)}
  for(let [x,z] of [[-3.7,2.2],[2.4,.9],[4.8,3.05],[-.6,-2.6]])lantern(x,z);
 }
 function batchLandscape(){
  root.updateMatrixWorld(true);
  const position=[],normal=[],colors=[],n=new T.Vector3(),pt=new T.Vector3(),nMat=new T.Matrix3();
  const staticObjects=[...root.children];
  root.traverse(obj=>{if(!obj.isMesh)return;let g=obj.geometry,stream=g.index?g.index.array:null,pos=g.attributes.position,norm=g.attributes.normal,col=obj.material.color;if(!pos||!norm)return;
   nMat.getNormalMatrix(obj.matrixWorld);let count=stream?stream.length:pos.count;
   for(let j=0;j<count;j++){let k=stream?stream[j]:j;pt.fromBufferAttribute(pos,k).applyMatrix4(obj.matrixWorld);n.fromBufferAttribute(norm,k).applyMatrix3(nMat).normalize();position.push(pt.x,pt.y,pt.z);normal.push(n.x,n.y,n.z);colors.push(col.r,col.g,col.b)}
   if(!Array.from(geos.values()).includes(g))g.dispose()
  });
  root.remove(...staticObjects);ripples=[];
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(position,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));root.add(new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.97,side:T.DoubleSide})));
 }
 function addRing(r,c){let g=geom('ring'+r,()=>new T.RingGeometry(r-.035,r,48));let m=new T.MeshBasicMaterial({color:c,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});let o=mesh(g,m,0,.07,0);o.rotation.x=-Math.PI/2;return o}
 function dispose(){if(!root)return;const usedG=new Set(geos.values()),usedM=new Set(mats.values());root.traverse(o=>{if(o.geometry&&!usedG.has(o.geometry))o.geometry.dispose();if(o.material&&!usedM.has(o.material))o.material.dispose()});scene.remove(root);root=null}
 function make(i){idx=i;rng=5913+i*23;points=L[i].nodes;labels.replaceChildren();markers=[];ripples=[];document.getElementById('scenic').style.backgroundImage='linear-gradient(0deg,#2e44386d,transparent 65%),url('+ART[i]+')';
 if(!renderer&&!ctx){try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.outputEncoding=T.sRGBEncoding;renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));host.append(renderer.domElement)}catch(e){flatCanvas=document.createElement('canvas');host.append(flatCanvas);ctx=flatCanvas.getContext('2d')}}
 if(!scene){scene=new T.Scene();camera=new T.OrthographicCamera(-10,10,7,-7,.1,120);camera.position.set(0,15,18);camera.lookAt(0,.3,0);scene.add(new T.HemisphereLight(0xfff1ce,0x657467,1.15));let sun=new T.DirectionalLight(0xffe5b2,1.1);sun.position.set(-5,10,6);scene.add(sun)}
 dispose();root=new T.Group();scene.add(root);terrain();batchLandscape();staticMesh=root.children[0];flatBackground=null;lastStaticSize="";heroRig=character();person=heroRig.holder;person.scale.setScalar(1.05);foeRig=character(true);foe=foeRig.holder;foe.visible=false;
 crest=addRing(.52,'#f7d891');foeRing=addRing(1.6,'#fa8f6a');slash=mesh(new T.RingGeometry(.65,1.25,36,1,0,2.7),new T.MeshBasicMaterial({color:0xffe4a1,side:T.DoubleSide,transparent:true,depthWrite:false}),0,.68,0);slash.rotation.x=-Math.PI/2;slash.visible=false;
 for(let j=0;j<points.length;j++){const n=points[j];let m=addRing(.48,'#dfc390');m.position.set(n[1],.1,n[2]);let b=document.createElement('button');b.className='mapLabel';b.textContent=n[0];b.onclick=()=>window.goMarker(j);labels.append(b);markers.push({m,b})}
 let ds=new Float32Array(42*3);for(let j=0;j<ds.length;j+=3){ds[j]=(rand()-.5)*16;ds[j+1]=rand()*4+.2;ds[j+2]=(rand()-.5)*9}let dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(ds,3));dust=new T.Points(dg,new T.PointsMaterial({size:.035,color:idx===2||idx===4?0xf9d887:0xe5cba2,transparent:true,opacity:.7}));root.add(dust);
 resize();fxTime=foeFX=0;
 }
 function resize(){w=host.clientWidth;h=host.clientHeight;if(!w||!h||!camera)return;let aspect=w/h,half=Math.max(5.8,9.65/aspect);camera.left=-half*aspect;camera.right=-camera.left;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();camera.updateMatrixWorld();if(renderer)renderer.setSize(w,h,false);if(ctx){flatCanvas.width=w;flatCanvas.height=h}}
 function project(x,y,z){v.set(x,y,z).project(camera);return [(v.x*.5+.5)*w,(-v.y*.5+.5)*h]}
 function ground(px,py){let b=host.getBoundingClientRect();ray.setFromCamera(new T.Vector2((px-b.left)/w*2-1,1-(py-b.top)/h*2),camera);let v=new T.Vector3();return ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),v)?{x:v.x,z:v.z}:null}
 function animateRig(rig,p,ang,speed,swing,stun){rig.holder.position.set(p.x,.045,p.z);rig.holder.rotation.y=ang;let gait=Math.sin(t*12)*Math.min(1,speed);rig.body.position.y=speed?Math.abs(gait)*.065:Math.sin(t*2.5)*.018;rig.legs[0].rotation.x=gait*.58;rig.legs[1].rotation.x=-gait*.58;rig.arms[0].rotation.x=-gait*.36;rig.arms[1].rotation.x=swing>0?-1.1:-.13+gait*.28;rig.arms[1].rotation.z=swing>0?Math.sin((1-swing/.32)*5)*1.15:0;rig.body.rotation.z=stun>0?Math.sin(t*42)*.085:0;rig.cape.rotation.x=-.18-Math.abs(gait)*.16}
 let flatBackground=null,staticMesh=null,lastStaticSize='',paintTick=0;
 const inkLight=new T.Vector3(-.5,.85,.45).normalize();
 function raster(target,objects,offsetX=0,offsetY=0){
  const faces=[],vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),temp=new T.Vector3(),rgb=new T.Color();
  for(const item of objects){if(!item||!item.visible)continue;item.updateMatrixWorld(true);
   item.traverse(o=>{if(!o.isMesh||!o.visible)return;const g=o.geometry,m=o.material;
    const pos=g.attributes.position,col=g.attributes.color,nor=g.attributes.normal,ind=g.index?.array,count=ind?ind.length:pos.count,verts=[],lights=[];
    const full=new T.Matrix4().multiplyMatrices(vp,o.matrixWorld),nm=new T.Matrix3().getNormalMatrix(o.matrixWorld);
    for(let j=0;j<pos.count;j++){temp.fromBufferAttribute(pos,j).applyMatrix4(full);verts.push([(temp.x*.5+.5)*w+offsetX,(-temp.y*.5+.5)*h+offsetY,temp.z]);if(nor){temp.fromBufferAttribute(nor,j).applyMatrix3(nm).normalize();lights.push(.81+.37*Math.max(0,temp.dot(inkLight)))}}
    for(let j=0;j<count;j+=3){let ia=ind?ind[j]:j,ib=ind?ind[j+1]:j+1,ic=ind?ind[j+2]:j+2;let a=verts[ia],b=verts[ib],c=verts[ic];const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<.16||(area>0&&m.side!==T.DoubleSide))continue;
     if(col)rgb.fromBufferAttribute(col,ia);else rgb.copy(m.color);let k=m.isMeshBasicMaterial?1:(lights[ia]+lights[ib]+lights[ic])/3;
     const r=Math.min(255,Math.round(rgb.r*k*255)),gg=Math.min(255,Math.round(rgb.g*k*255)),bb=Math.min(255,Math.round(rgb.b*k*255));faces.push({a,b,c,r,g:gg,bv:bb,z:a[2]+b[2]+c[2],fill:'rgba('+r+','+gg+','+bb+','+(m.transparent?m.opacity:1)+')'})
    }
   })
  }
  if(objects[0]===staticMesh){
   const pic=target.createImageData(w,h),buf=pic.data,depth=new Float32Array(w*h);depth.fill(Infinity);
   for(const f of faces){const [a,b,c]=[f.a,f.b,f.c],dx1=b[0]-a[0],dy1=b[1]-a[1],dx2=c[0]-a[0],dy2=c[1]-a[1],den=dx1*dy2-dy1*dx2;
    let minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    for(let yy=minY;yy<=maxY;yy++){let sy=yy+.5-a[1];for(let xx=minX;xx<=maxX;xx++){const sx=xx+.5-a[0],u=(sx*dy2-sy*dx2)/den,vv=(dx1*sy-dy1*sx)/den;if(u<-.00001||vv<-.00001||u+vv>1.00001)continue;const at=yy*w+xx,z=a[2]+u*(b[2]-a[2])+vv*(c[2]-a[2]);if(z>=depth[at])continue;depth[at]=z;let pix=at*4;buf[pix]=f.r;buf[pix+1]=f.g;buf[pix+2]=f.bv;buf[pix+3]=255}}
   }target.putImageData(pic,0,0);return
  }
  faces.sort((a,b)=>b.z-a.z);target.lineWidth=.48;target.lineJoin='round';for(const f of faces){target.fillStyle=target.strokeStyle=f.fill;target.beginPath();target.moveTo(f.a[0],f.a[1]);target.lineTo(f.b[0],f.b[1]);target.lineTo(f.c[0],f.c[1]);target.closePath();target.fill();target.stroke()}
 }
 function paintFlat(p,e,step){
  if(!flatBackground||lastStaticSize!==w+'x'+h){flatBackground=document.createElement('canvas');flatBackground.width=w;flatBackground.height=h;raster(flatBackground.getContext('2d'),[staticMesh]);lastStaticSize=w+'x'+h}
  ctx.clearRect(0,0,w,h);ctx.drawImage(flatBackground,0,0);let list=[crest,foeRing,...markers.map(x=>x.m),person,foe,slash];raster(ctx,list)
 }
 function draw(dt,p,e,step){if(!root||!w||!h)return;t+=dt;fxTime=Math.max(0,fxTime-dt);animateRig(heroRig,p,p.angle,p.moving,p.swing,p.inv);foe.visible=!!e;if(e){foe.scale.setScalar(e.boss?1.37:1.1);animateRig(foeRig,e,Math.atan2(p.x-e.x,p.z-e.z),e.moving,e.flash,0)}crest.position.set(p.x,.08,p.z);crest.material.opacity=.55+.28*Math.sin(t*3);foeRing.visible=!!e&&e.wind>0;if(foeRing.visible){foeRing.position.set(e.x,.09,e.z);foeRing.scale.setScalar(.6+.55*(1-e.wind/.84));foeRing.material.opacity=.65+.3*Math.sin(t*20)}slash.visible=fxTime>0;if(slash.visible){slash.position.set(p.x,.69,p.z);slash.rotation.z=-p.angle-1+(1-fxTime/.30)*1.8;slash.material.opacity=Math.min(1,fxTime*6)}
 dust.position.x=Math.sin(t*.32)*.2;dust.position.y=Math.sin(t*.6)*.12;ripples.forEach((m,j)=>m.scale.x=(.22+.15*Math.sin(t+j)));markers.forEach((mk,j)=>{let n=points[j];let [x,y]=project(n[1],.85,n[2]);mk.b.style.left=x+'px';mk.b.style.top=y+'px';let cl='mapLabel'+(step===j&&!e?' active':j<step?' done':'');if(mk.b.className!==cl)mk.b.className=cl;mk.m.scale.setScalar(1+(j===step?.15*Math.sin(t*3):0))});if(renderer)renderer.render(scene,camera);else paintFlat(p,e,step)}
 window.addEventListener('resize',resize);return {make,draw,ground,resize,swing(){fxTime=.3},renderer:()=>renderer?'WebGL':'Canvas'}
})();
