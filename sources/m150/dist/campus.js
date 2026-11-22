/* Original procedural architectural model. Distances in metres, Y axis up. */
(() => {
  'use strict';

  const objects = [];
  const palette = {
    concrete: '#c6c9bf', facing: '#e2dfcf', trim: '#d5dace', metal: '#899b9d',
    seam: '#52696d', dark: '#334c52', glass: '#508d96', darkGlass: '#396d79',
    aqua: '#78aaab', roof: '#a5b1aa', warm: '#c57452', timber: '#b49170',
    grass: '#829879', grassLight: '#a2b396', path: '#bbb9a8', road: '#596265',
    line: '#d3cdad', deep: '#35494b'
  };

  const make = (id, name, group, x, z, parts) => objects.push({id, name, group, x, y:0, z, parts});
  const box = (x,y,z,w,h,d,color,ry=0) => ({type:'box',x,y,z,w,h,d,color,ry});
  const cylinder = (x,y,z,w,h,d,color,sides=8) => ({type:'cylinder',x,y,z,w,h,d,color,sides});
  const mesh = (vertices,faces,color) => ({type:'mesh',x:0,y:0,z:0,w:1,h:1,d:1,vertices,faces,color});
  const signedArea = points => points.reduce((area,[x,z],i) => {
    const q=points[(i+1)%points.length];
    return area+x*q[1]-z*q[0];
  },0);
  // Rings wind counterclockwise as viewed in 3D from above.
  function slab(outline, bottom, top, color) {
    const ring=signedArea(outline)>0 ? [...outline].reverse() : outline;
    const n=ring.length;
    const vertices=[...ring.map(([x,z])=>[x,bottom,z]),...ring.map(([x,z])=>[x,top,z])];
    const ids=Array.from({length:n},(_,i)=>i);
    const faces=[[...ids].reverse(),ids.map(i=>i+n)];
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      faces.push([i,j,j+n,i+n]);
    }
    return mesh(vertices,faces,color);
  }
  function beam(x1,z1,x2,z2,y,width,height,color) {
    const dx=x2-x1,dz=z2-z1;
    return box((x1+x2)/2,y,(z1+z2)/2,Math.hypot(dx,dz),height,width,color,-Math.atan2(dz,dx)*180/Math.PI);
  }
  const outline=[[-80,-51],[-83,-48],[-83,49],[-79,53],[79,53],[83,49],[83,-47],[79,-51]];
  const quay=[[-83,29],[-52,29],[-47,26],[-14,26],[-10,28],[15,28],[21,32],[52,32],[57,29],[83,29]];
  // Convex shoreline strips let simple renderers triangulate every face reliably.
  const landParts=[slab(outline,-3.8,-2.7,'#45575a'),slab(outline.map(([x,z])=>[x*0.985,z*0.984]),-2.7,-2.4,'#859093'),
    box(0,-1.18,-10.8,165.9,2.55,71.5,'#9b9e90')];
  landParts.push(slab([[-80,-51],[-83,-48],[-83,24.7],[83,24.7],[83,-47],[79,-51]],-2.38,0,'#adaf9f'));
  const waterParts=[];
  // Water's convex outline is separate from the quay so it can be selected and restyled.
  waterParts.push(slab([[-83,24.3],[-83,49],[-79,53],[79,53],[83,49],[83,24.3]],-2.38,-0.64,'#3d868d'));
  // Shallow bands beneath the ripples give the water volume from aerial views.
  for(let i=0;i<32;i++){
    const x=-76+((i*47.3+10)%149),z=35+((i*6.67)%15.5);
    const w=1.0+((i*1.2)%4.6);
    waterParts.push(beam(x,z,x+w,z+.16,-.607,.12,.026,i%3?'#518e92':'#65a1a0'));
    if(i%4===0)waterParts.push(beam(x+.5,z+.35,x+w*.76,z+.41,-.605,.09,.025,'#72a9a3'));
  }
  for(let i=1;i<quay.length;i++){
    const a=quay[i-1],b=quay[i];
    landParts.push(slab([[a[0],24.45],a,b,[b[0],24.45]],-1.58,0.13,palette.path));
    landParts.push(beam(a[0],a[1],b[0],b[1],0.23,0.39,0.2,palette.facing));
  }
  make('campus-base','园区地台与滨河驳岸','landscape',0,0,landParts);
  make('river','汀湾河 · 动态水面','water',0,0,waterParts);

  const roads=[];
  function road(x,z,length,width,vertical=false){
    const w=vertical?width:length, d=vertical?length:width;
    roads.push(box(x,0.05,z,w+1.25,0.10,d+1.25,'#c6c5b4'),box(x,0.14,z,w,0.10,d,palette.road));
  }
  road(-5,10,134,7.4); road(-5,-40,134,6.6);
  road(-68,-15,49,7.1,true);road(58,-15,49,7.1,true);road(16,-15,49,6.5,true);
  for(const z of [10,-40]) for(let x=-62;x<=54;x+=7){
    if(Math.abs(x-16)>6) roads.push(box(x,.208,z,3.25,.028,.20,palette.line));
  }
  for(const x of [-68,16,58])for(let z=-32;z<5;z+=6.1)roads.push(box(x,.209,z,.19,.028,2.6,palette.line));
  for(const [cx,cz,vertical] of [[-54,10,false],[6,10,false],[46,-40,false],[58,-1,true],[-68,-31,true]]){
    for(let i=-2;i<=2;i++) roads.push(box(cx+(vertical?i*1.03:0),.216,cz+(vertical?0:i*1.03),vertical?.53:2.25,.026,vertical?2.25:.53,'#d9d9c8'));
  }
  make('park-roads','环园路与支路','road',0,0,roads);

  const gardens=[];
  const bed=(x,z,w,d) => gardens.push(box(x,.13,z,w+.55,.22,d+.55,palette.concrete),box(x,.27,z,w,.10,d,palette.grass));
  bed(-76,-12,9,52); bed(-41,-32.8,40,3.8);bed(-40,3.3,40,3.7);bed(-6,3.7,25,3.0);
  bed(36,-33.2,30,3.8);bed(37,3.35,29,4);bed(71,-36.5,13,13);bed(-38,-46.9,53,4.0);
  bed(-49.5,20.7,23,6.7);bed(-17,20,12,6.3);bed(13,20.4,16,7.2);bed(65,20.9,19,7);
  // Paths and seating form a continuous promenade beside the river.
  gardens.push(box(-2,.16,24.25,157,.12,2.8,'#d5c7ad'),box(-1,.15,15.37,155,.10,1.65,palette.facing));
  for(const x of [-64,-29,-7,24,53,75])gardens.push(box(x,.18,20,1.75,.13,10.3,palette.facing));
  for(const x of [-70,-61,-35,-24,-5,8,20,51,62,76])gardens.push(box(x,.64,25.2,2.9,.56,.78,palette.timber));
  make('gardens','滨河绿带与园区步道','landscape',0,0,gardens);

  const pad=(parts,w,d) => {
    parts.push(box(0,.22,0,w+.9,.40,d+.9,palette.concrete));
    parts.push(box(0,.51,0,w,.22,d,palette.facing));
  };
  function roofParapet(parts,cx,cz,w,d,bottom,color=palette.trim) {
    for(const s of [-1,1]){
      parts.push(box(cx,bottom+.35,cz+s*(d/2-.14),w,.7,.27,color));
      parts.push(box(cx+s*(w/2-.14),bottom+.34,cz,.27,.68,d-.4,color));
    }
  }
  function hvac(parts,x,y,z,w,d){
    parts.push(box(x,y+.16,z,w+.24,.32,d+.24,palette.seam),box(x,y+.74,z,w,1.02,d,palette.metal));
    for(const s of [-1,1]) parts.push(cylinder(x+s*w*.24,y+1.28,z,d*.56,.08,d*.56,palette.dark,8));
  }
  // Horizontal glazing ribbons wrap all four faces. The alternating sill, overhang
  // and glass depths produce actual shadows and legibility at both close and full extent.
  function wing(parts,{x=0,z=0,w,d,bottom=0.58,floors,story=3.05,glass=palette.glass,slabColor=palette.facing,fins=5}){
    const h=floors*story;
    parts.push(box(x,bottom+h/2,z,w-.45,h,d-.45,glass));
    for(let i=1;i<=floors;i++){
      const y=bottom+i*story;
      parts.push(box(x,y-.22,z,w+.22,.45,d+.22,slabColor));
    }
    for(const s of [-1,1]){
      for(let j=1;j<fins;j++)parts.push(box(x-w/2+j*w/fins,bottom+h/2,z+s*d/2,.19,h,.26,palette.metal));
      const count=Math.max(2,Math.round(d/4));
      for(let j=1;j<count;j++)parts.push(box(x+s*w/2,bottom+h/2,z-d/2+j*d/count,.26,h,.18,palette.metal));
    }
    return bottom+h;
  }
  // Innovation tower with successive setbacks and roof terraces.
  {
    const p=[];pad(p,32.8,23.4);
    let h=wing(p,{w:31.7,d:22.1,floors:2,story:3.25,glass:palette.darkGlass,fins:8});
    p.push(box(-2.2,h+.08,1,21,.16,17,palette.grassLight));
    h=wing(p,{x:-1.65,z:-.8,w:24.4,d:17.45,bottom:h,floors:6,story:3.04,glass:palette.glass,fins:7});
    p.push(box(-1.5,h+.12,-.8,23,.24,16.2,palette.roof));
    h=wing(p,{x:-3.4,z:-2.15,w:19.6,d:13.7,bottom:h,floors:3,story:3.12,glass:palette.aqua,fins:5});
    roofParapet(p,-3.4,-2.15,20.1,14.2,h);
    p.push(box(-3.5,h+.15,-2.15,18.9,.24,13.1,palette.roof));
    hvac(p,-7.2,h+.2,-2.3,4.8,3);hvac(p,-1,h+.2,-2.3,4.8,3);
    p.push(box(4.5,3.55,11.8,17.2,.65,3.4,palette.facing));
    for(const x of [-3,12])p.push(box(x,1.72,12.8,.45,3.35,.45,palette.seam));
    p.push(box(-14.75,3.65,11.3,1.0,5.7,.52,palette.warm));
    make('research-tower','科研主楼 · 云汀中心','building',-42,-19.7,p);
  }
  // Lower white-framed laboratory topped by a north-light industrial sawtooth roof.
  {
    const p=[];pad(p,26.2,21.7);
    const h=wing(p,{w:25.1,d:20.55,floors:3,story:2.76,glass:'#5f888d',slabColor:'#c7ccbd',fins:7});
    const near=h+.12, span=6.10, depth=19.8;
    for(let i=0;i<4;i++) {
      const x=-12.2+i*span;
      const v=[[x,near,-depth/2],[x+span,near,-depth/2],[x+span,near+2.9,-depth/2],[x,near,depth/2],[x+span,near,depth/2],[x+span,near+2.9,depth/2]];
      p.push(mesh(v,[[2,1,0],[4,5,3],[1,4,3,0],[3,5,2,0]],'#cbd4ca'));
      p.push(box(x+span-.03,near+1.44,0,.19,2.87,depth,'#679ba0'));
      p.push(box(x+span-.02,near+2.93,0,.36,.20,depth+.24,palette.facing));
    }
    p.push(box(-.7,2.9,11.3,20,.4,2,palette.warm));
    for(const x of [-8.7,.1,8.2])p.push(box(x,1.43,12.0,.25,2.75,.25,palette.dark));
    make('pilot-lab','中试工坊 · 锯齿天窗厂房','building',-5.2,-20.65,p);
  }
  {
    const p=[];
    p.push(box(0,4.48,0,10.8,.54,2.65,palette.facing),box(0,5.51,0,10.65,1.73,2.33,palette.aqua),box(0,6.48,0,10.95,.25,2.76,palette.facing));
    for(const x of [-4.6,-2.3,0,2.3,4.6]) p.push(box(x,5.5,0,.12,1.9,2.52,palette.trim));
    make('research-link','实验楼架空连廊','building',-21.2,-19.7,p);
  }
  // A deep recessed courtyard at the entrance separates the two research wings.
  {
    const p=[];pad(p,27,19.6);
    const h=wing(p,{x:-1.6,z:-.8,w:22.3,d:16.9,floors:5,story:2.93,glass:'#6d9395',slabColor:'#c3cbbd',fins:6});
    const h2=wing(p,{x:1.6,z:-2.6,w:14.6,d:12,bottom:h,floors:2,story:2.9,glass:palette.darkGlass,slabColor:palette.trim,fins:4});
    roofParapet(p,1.6,-2.6,15.0,12.4,h2);
    hvac(p,.8,h2,-2.9,5,3.8);
    // Tall vertical screen and cantilevered portico.
    for(let i=0;i<7;i++) p.push(box(9.8,8.1,-7.6+i*2.22,.87,14.9,.34,palette.facing));
    p.push(box(.3,3.8,9.8,23.2,.61,3,palette.facing));
    for(const x of [-10,10])p.push(box(x,1.91,10.9,.44,3.55,.44,palette.seam));
    make('design-building','联合研发楼 · 北庭','building',36,-17.2,p);
  }
  {
    const p=[];pad(p,13.4,13.6);
    const h=wing(p,{w:12.4,d:12.4,floors:2,story:2.65,glass:'#638587',slabColor:'#d3c8af',fins:3});
    roofParapet(p,0,0,12.6,12.6,h,palette.roof);hvac(p,1.8,h,0,4,3.4);
    p.push(box(-.3,2.91,6.8,10.0,.43,1.5,palette.warm));
    make('service-building','园区运维中心','building',71.7,-12.9,p);
  }
  // Waterfront exhibition pavilion. Two offset volumes share an eye-catching folded roof.
  {
    const p=[];pad(p,24.9,9.50);
    p.push(box(0,2.5,0,23.4,3.8,8.8,'#57898f'),box(1.3,4.66,0,23.2,.42,9.25,palette.seam));
    const profile=[[-13,4.71],[-5.4,6.5],[2.1,5.12],[12.1,6.83],[12.1,7.22],[2.1,5.51],[-5.4,6.89],[-13,5.10]];
    for(let i=0;i<3;i++){
      const a=profile[i],b=profile[i+1],v=[];
      for(const yoff of [0,.41])for(const z of [-5.35,5.35])v.push([a[0],a[1]+yoff,z],[b[0],b[1]+yoff,z]);
      p.push(mesh(v,[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]],'#ece0c6'));
      const z=4.43;
      p.push(mesh([[a[0],4.49,z],[b[0],4.49,z],[b[0],b[1],z],[a[0],a[1],z]],[[0,1,2,3]],'#89aca8'));
    }
    for(const x of [-10.2,-6.8,-3.4,0,3.4,6.8,10.2]){
      p.push(box(x,2.76,4.48,.19,4.23,.21,palette.trim));
      p.push(box(x,2.78,-4.48,.19,4.23,.21,palette.trim));
    }
    make('exhibition-hall','滨水展厅 · 折板屋面','building',38,21.7,p);
  }
  {
    const p=[];
    for(const x of [-6.7,-3.35,0,3.35,6.7]){
      for(const z of [-2.2,2.2])p.push(box(x,1.66,z,.32,3.32,.32,palette.timber));
      p.push(box(x,3.43,0,.34,.31,5.16,palette.timber));
    }
    for(let z=-2.45;z<2.7;z+=.56)p.push(box(0,3.66,z,14.6,.20,.27,'#c5ae86'));
    make('garden-arbor','滨河木构廊架','prop',-48,21.5,p);
  }
  function makeJetty(id,name,x,z,w,length) {
    const p=[box(0,-.05,0,w,.59,length,'#9b7d62')];
    for(let i=0;i<length;i+=1.65)p.push(box(0,.255,-length/2+i+.38,w*.97,.07,.75,'#c2a383'));
    for(const s of [-1,1]){
      for(const l of [-length*.42,0,length*.42])p.push(cylinder(s*(w*.44),-.53,l,.55,2.15,.55,'#596362',8));
      p.push(box(s*w*.46,.59,length*.35,.26,.53,.53,palette.seam));
    }
    make(id,name,'prop',x,z,p);
  }
  makeJetty('dock-a','游船靠泊栈桥',-2,34.5,4.2,15.0);
  makeJetty('dock-b','观景码头',-46.5,31.95,3.7,10.9);
  {
    const p=[];
    const hull=[[-4.5,0,-1.45],[3.15,0,-1.50],[5.6,0,0],[3.15,0,1.50],[-4.5,0,1.45],[-3.9,-.65,-1.0],[3.1,-.65,-.9],[4.8,-.58,0],[3.1,-.65,.9],[-3.9,-.65,1.0]];
    p.push(mesh(hull,[[0,4,3,2,1],[0,1,6,5],[1,2,7,6],[2,3,8,7],[3,4,9,8],[4,0,5,9]],palette.facing));
    p.push(box(-.4,.18,0,6.6,.25,2.54,'#bc986f'),box(-.38,.64,0,4.9,.78,1.78,palette.darkGlass),box(-.37,1.09,0,5.51,.19,2.12,palette.facing));
    make('passenger-ferry','滨水接驳艇','prop',2.6,40.1,p);
  }

  function rng(seed){
    let n=seed>>>0;
    return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0; return n/4294967296;};
  }
  const rand=rng(92857);
  const greens=['#728f74','#859e7d','#68846f','#96ac85','#718f7d','#a0ac81'];
  function canopy(radius,height,cx,base,cz,color,phase){
    const vertices=[[cx,base,cz]],n=6,faces=[];
    const rings=[[.26,.84],[.62,1],[.84,.66]];
    for(let k=0;k<rings.length;k++){
      const [y,scale]=rings[k];
      for(let i=0;i<n;i++){
        const theta=phase+i*Math.PI*2/n+k*.18, variation=.89+rand()*.19;
        vertices.push([cx+Math.cos(theta)*radius*scale*variation,base+height*y,cz+Math.sin(theta)*radius*scale*variation]);
      }
    }
    const top=vertices.push([cx-radius*.06,base+height,cz+radius*.1])-1;
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      faces.push([0,1+i,1+j]);
      for(let k=0;k<rings.length-1;k++){
        const a=1+k*n+i,b=1+k*n+j,c=b+n,d=a+n;
        faces.push([a,d,c],[a,c,b]);
      }
      faces.push([1+2*n+i,top,1+2*n+j]);
    }
    return mesh(vertices,faces,color);
  }
  let treeNo=0;
  function tree(x,z,kind='broad',size=1){
    const idx=++treeNo,s=size*(.88+rand()*.2),p=[];
    const shade=greens[Math.floor(rand()*greens.length)];
    p.push(cylinder(0,1.41*s,0,.40*s,2.78*s,.40*s,'#706e5c',6));
    if(kind==='spire'){
      p.push({type:'cone',x:0,y:3.6*s,z:0,w:3.1*s,h:5.6*s,d:3.2*s,sides:7,color:shade});
      p.push({type:'cone',x:.10*s,y:5.13*s,z:0,w:2.35*s,h:4.3*s,d:2.4*s,sides:7,color:'#74907a'});
    }else{
      p.push(canopy((1.75+rand()*.27)*s,3.45*s,-.38*s,1.72*s,0,shade,rand()));
      if(idx%3!==0) p.push(canopy(1.26*s,2.42*s,1.0*s,2.08*s,.32*s,shade,rand()));
    }
    make('tree-'+String(idx).padStart(3,'0'),(kind==='spire'?'园区针叶树':'滨水朴树')+' '+String(idx).padStart(2,'0'),'plant',x,z,p);
  }
  for(const x of [-59,-52,-45,-38,-31,-24,-17,-10,-3,4])tree(x+rand(),-46.8+.55*rand(),'broad',1.11);
  for(const z of [-34,-27,-20,-13,-6,1,7.5,14,20])tree(-76+rand(),z,'broad',1.06);
  for(const x of [-58,-51,-45,-35,-28,-22,-13,-6,1,8,23,30,38,44.5,50])tree(x,3.7+rand()*.49,'broad',.78);
  for(const x of [-60,-54,-47,-39,-32,-25,23,30,37,43,49])tree(x,-33.1+rand()*.5,'spire',.79);
  for(const x of [-72,-64,-60,-36,-31,-23,-20,-15,-9,6,12,18,55,60,67,73,78]) tree(x,20.45+(rand()-.5)*3.1,'broad',.78);
  for(const [x,z] of [[66,-38],[71,-39],[77,-36],[66,-33],[73,-32],[77,0],[69,3],[66,1],[-80,24]]) tree(x,z,'spire',.93);
  // A low planting bed adds a second vegetation scale behind the pavilion.
  const hedge=[];
  for(const [x,z,w,d] of [[-53,-5,12,1.3],[-30,-5,9,1.3],[28,-5,7,1.35],[43,-5,7,1.35],[-13,16,8,1.0],[13,16,8,1.0],[-35,25,10,1.0],[65,25,12,1.0]]){
    hedge.push(box(x,.53,z,w,.81,d,'#78916f'));
  }
  make('hedges','修剪灌篱','landscape',0,0,hedge);

  const bollards=[];
  for(const [begin,end,z] of [[-78,-54,28.5],[-45,-14,25.65],[-7,13,27.5],[23,50,31.4],[59,79,28.5]]){
    for(let x=begin;x<=end;x+=4.2){
      const last=Math.min(x+4.2,end);
      bollards.push(cylinder(x,.71,z,.18,1.09,.18,palette.metal,6));
      if(last-x>.16)bollards.push(beam(x,z,last,z,1.23,.115,.13,palette.trim));
    }
  }
  make('quay-rails','亲水步道护栏','prop',0,0,bollards);

  const lights=[];
  for(const x of [-59,-37,-15,7,29,51,71]){
    lights.push(cylinder(x,2.42,14.36,.22,4.76,.22,palette.seam,6));
    lights.push(box(x,4.78,13.90,.27,.22,1.1,palette.seam),box(x,4.78,13.36,.64,.23,.62,palette.facing));
  }
  make('promenade-lights','步道照明','prop',0,0,lights);
  // A series of photovoltaic arrays extends the technology campus's roof vocabulary.
  const pv=[];
  for(const x of [-5.1,0,5.1]){
    pv.push(box(x,2.15,0,.36,4.26,.36,palette.seam),box(x,4.32,0,4.85,.35,7.15,palette.seam));
    for(const z of [-2.25,0,2.25])pv.push(box(x,4.56,z,4.64,.15,2.06,'#507887'));
  }
  make('energy-canopy','光伏停车棚','prop',71.7,1.95,pv);
  // Compact cars parked beneath the solar canopy distinguish the technical yard.
  for(const [x,z,paint] of [[68.5,1.8,'#bdc8c4'],[71.6,1.5,'#be7d60'],[75,2.2,'#758e99']]){
    const q=[box(0,.68,0,1.66,.66,3.74,paint),box(0,1.20,-.12,1.43,.52,2.04,'#647e82'),box(0,1.51,-.2,1.23,.14,1.28,paint)];
    for(const sx of [-.76,.76])for(const sz of [-1.05,1.05])q.push(box(sx,.36,sz,.29,.49,.52,palette.deep));
    make('solar-car-'+String(x).replace('.','-'),'停放通勤车','prop',x,z,q);
  }
  window.CAMPUS={
    objects,
    views:{
      overview:{eye:[145,125,180],target:[0,6,0]},
      tower:{eye:[-4,38,42],target:[-39,17,-17]},
      waterfront:{eye:[96,34,64],target:[22,5,19]},
      workshop:{eye:[36,30,24],target:[-4,7,-19]}
    }
  };
})();
