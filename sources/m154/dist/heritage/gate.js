import {lightsAlong,finishGateLights} from './gate-lights.js';
import * as THREE from 'three';

// Local coordinates in metres. +Z faces south. Surface photographs and dimensional
// references are documented in gate-credits.md. The timber storeys, five open barrel
// vaults, overhangs, bridges and their balustrades are independently modeled geometry.
const tau = Math.PI * 2;
const sides = [-1, 1];
const mix = (a, b, t) => a + (b - a) * t;
const stone = 0xd6cfc1, highStone = 0xe5dece, darkStone = 0xaaa596;
const red = 0xa5483d, darkTimber = 0x4f2824, lacquer = 0x9e352e;
const gold = 0xd69535, goldLight = 0xe9ad4e, teal = 0x2b514c;
const finishes = {
  roof: [gold, .45, true], paving: [0xbebbb5, .86, true], plaster: [0xab534d, .95, true], doors: [0x7e3c2e, .7],
  paint: [0x987c51, .72], 'lower-paint': [0x696c5c, .74], brackets: [0x655342, .88],
  gable: [0x9e8b6c, .8], portrait: [0xe1cb9d, .83], emblem: [0xc99339, .48],
  'plaque-west': [0xba3c37, .7], 'plaque-east': [0xb33a36, .7], 'bridge-relief': [stone, .85]
};
const uvRect = [[0, 0], [1, 0], [1, 1], [0, 1]];
class GateSurfaces {
  constructor() { this.layers = new Map(); }
  face(name, points, uv = uvRect) {
    if (!this.layers.has(name)) this.layers.set(name, {positions: [], uvs: [], index: []});
    const g = this.layers.get(name), start = g.positions.length / 3;
    for (let n = 0; n < points.length; n++) { g.positions.push(...points[n]); g.uvs.push(...uv[n]); }
    for (let i = 1; i + 1 < points.length; i++) g.index.push(start, start + i, start + i + 1);
  }
  finish(b) {
    for (const [name, g] of this.layers) {
      const [color, roughness, repeat] = finishes[name];
      const url = new URL(`./gate-${name}.webp`, import.meta.url).href;
      const texture = typeof document === 'undefined' ? null : new THREE.TextureLoader().load(url);
      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.userData.src = url;
        if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(g.positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(g.uvs, 2));
      geom.setIndex(g.index); geom.computeVertexNormals(); geom.computeBoundingSphere();
      const mat = new THREE.MeshStandardMaterial({color: texture ? 0xffffff : color, map: texture, roughness, side: THREE.DoubleSide});
      const mesh = new THREE.Mesh(geom, mat); mesh.name = 'Tiananmen ' + name;
      mesh.userData.panelUrl = url; mesh.receiveShadow = true; mesh.castShadow = name === 'roof' || name === 'plaster';
      b.decals.push(mesh);
    }
  }
}
function frontPanel(s, name, x, z, bottom, w, h, side = 1) {
  s.face(name, [[x-side*w/2,bottom,z],[x+side*w/2,bottom,z],[x+side*w/2,bottom+h,z],[x-side*w/2,bottom+h,z]]);
}
function wall(b, s) {
  const portals = [[-25.9,2.05,4.9],[-13.1,2.26,5.55],[0,2.625,6.58],[13.1,2.26,5.55],[25.9,2.05,4.9]];
  const crown = 13.18, hw = 59, hd = 19.40;
  const depth = y => hd - .085 * y;
  const point = (x,y,side) => [x,y,side*depth(y)];
  function facade(x0,x1,y0,y1,side) {
    const q = [point(x0,y0,side),point(x1,y1,side),point(x1,crown,side),point(x0,crown,side)];
    s.face('plaster', q, q.map(([x,y])=>[x/9,y/7]));
  }
  let last = -hw;
  for (const [cx,r,peak] of [...portals,[hw,0,0]]) {
    const left=cx-r, right=cx+r;
    if (left>last) {
      for (const sign of sides) {
        facade(last,left,0,0,sign);
        // Low white marble foundation profiles stop at each opening, leaving five usable passages.
        for (const [y,h,out,c] of [[.02,.20,.12,darkStone],[.22,.41,.06,stone],[.63,.12,.13,highStone]])
          b.box((last+left)/2,y,sign*(depth(y)+out/2),left-last,h,out,c);
      }
      b.rectFoot((left+last)/2,0,left-last,2*(hd-.25));
    }
    last=right;
    if (!r) break;
    const spring=peak-r;
    for (let j=0;j<18;j++) {
      const a=Math.PI*(1-j/18), c=Math.PI*(1-(j+1)/18);
      const x0=cx+r*Math.cos(a),x1=cx+r*Math.cos(c),y0=spring+r*Math.sin(a),y1=spring+r*Math.sin(c);
      for (const side of sides) facade(x0,x1,y0,y1,side);
      const p0=point(x0,y0,1),p1=point(x1,y1,1), n0=point(x0,y0,-1),n1=point(x1,y1,-1);
      b.face([p1,p0,n0,n1],j%6===0?0x734040:0x703a36);
      // Three lighter bands make the real barrel section legible in a ground-level approach.
      for (const zz of [-12,0,12]) b.face([[x0,y0-.012,zz-.11],[x1,y1-.012,zz-.11],[x1,y1-.012,zz+.11],[x0,y0-.012,zz+.11]],0x82504a);
    }
    for (const x of [left,right]) b.face([[x,0,hd],[x,spring,depth(spring)],[x,spring,-depth(spring)],[x,0,-hd]],0x743c36);
    b.box(cx,.025,0,2*r,.055,hd*2+.05,0xa49a89,'ground');
  }
  for (const k of sides) {
    const q=[[k*hw,0,-hd],[k*hw,0,hd],[k*hw,crown,depth(crown)],[k*hw,crown,-depth(crown)]];
    s.face('plaster',q,q.map(([,y,z])=>[z/9,y/7]));
  }
  b.box(0,crown-.015,0,118,.19,2*depth(crown),0x8b8073);
  for (const sign of sides) {
    b.box(0,12.15,sign*depth(12.15),118.05,.80,.14,0xc9bca5);
    b.box(0,12.94,sign*depth(12.94),118.11,.13,.31,0xdea04d);
    b.box(0,13.07,sign*depth(13.07),118.16,.13,.39,0x906538);
    b.box(sign*58.98,12.16,0,.18,.82,36.86,0xc8bca7);
    b.box(sign*59,12.98,0,.34,.19,36.75,0xc49249);
  }
  const terrace=[[-58.8,13.37,18.1],[58.8,13.37,18.1],[58.8,13.37,-18.1],[-58.8,13.37,-18.1]];
  s.face('paving',terrace,terrace.map(([x,,z])=>[x/6.8,z/5.1]));
  // There is a low trimmed planting strip immediately behind the parapet on the south elevation.
  for(let i=0;i<57;i++) {
    const x=-28+i, h=.16+.045*Math.sin(i*3.5);
    b.box(x,13.37,16.34,.997,h,.55,i%3===0?0x4f563b:0x555a3e);
  }
  const zz=depth(7)+.44;
  b.box(0,6.88,zz-.2,5.05,6.22,.48,0x806438);
  frontPanel(s,'portrait',0,zz+.055,6.95,4.95,6.12);
  for (const sign of sides) {
    const x=sign*25.85, z=depth(9.2)+.30;
    b.box(x,8.25,z,30.65,3.42,.30,0x694841);
    b.box(x,8.37,z+.13,30.57,3.27,.13,0xe0cdb1);
    frontPanel(s,sign<0?'plaque-west':'plaque-east',x,z+.22,8.49,30.28,3.03);
  }
}
function perimeter(b,s,w,d,y,h,name,repeatWidth) {
  const walk=[[-w,d],[w,d],[w,-d],[-w,-d]];
  for(let side=0;side<4;side++) {
    const [x0,z0]=walk[side],[x1,z1]=walk[(side+1)%4],n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/repeatWidth));
    for(let i=0;i<n;i++) {
      const a=i/n,c=(i+1)/n,p=[mix(x0,x1,a),y,mix(z0,z1,a)],q=[mix(x0,x1,c),y,mix(z0,z1,c)];
      s.face(name,[p,q,[q[0],y+h,q[2]],[p[0],y+h,p[2]]]);
    }
  }
}
function hall(b,s) {
  b.box(0,13.35,0,61.1,.38,26.3,stone);
  b.box(0,13.72,0,56.2,6.8,18.75,0x78362f);
  for (const sign of sides) {
    for (let i=0;i<9;i++) {
      const cx=(i-4)*6.13;
      b.box(cx,13.85,sign*9.50,5.91,5.45,.25,darkTimber);
      for(let d=0;d<4;d++) {
        const x=cx+(d-1.5)*1.40;
        const z=sign*9.70;
        frontPanel(s,'doors',x,z,14.06,1.31,4.76,sign);
        b.box(x,14.05,z+sign*.035,1.30,.35,.07,0x75362b);
      }
    }
    for(let i=0;i<10;i++) {
      const x=(i-4.5)*6.13,z=sign*12.45;
      b.lathe(x,z,[[.59,13.73],[.64,13.85],[.49,14.07],[.41,14.16]],12,stone);
      b.lathe(x,z,[[.43,14.04],[.41,18.96],[.48,19.36]],14,lacquer);
      // The capitals and tie beams sit ahead of the recessed rows of lattice doors.
      b.box(x,18.82,z,1.14,.20,.92,0xac9c7e);
      b.box(x,19.01,z,1.43,.18,1.08,teal);
      for(const k of sides) b.beam([x,18.91,z],[x+k*1.02,19.42,z],.18,0xb39c73,.23);
    }
    b.box(sign*27.72,13.79,0,.36,5.54,23.75,0x863b33);
    for(let i=1;i<5;i++) {
      const z=(i-2.5)*4.92;
      b.cylinder(sign*27.62,z,13.75,.41,5.69,lacquer,12);
    }
  }
  b.box(0,19.29,0,57,.45,25.72,darkTimber);
  perimeter(b,s,28.58,12.91,19.24,.68,'lower-paint',17);
  b.box(0,19.94,0,58,.66,26.5,0x40392d);
  // A separate upper timber frame, visible between the lower skirt and the upper weather roof.
  b.box(0,22.15,0,51.85,3.9,20.95,0x695544);
  perimeter(b,s,26,10.55,23.55,1.19,'paint',15.7);
  perimeter(b,s,26.23,10.78,24.72,1.40,'brackets',13.8);
  for (const sign of sides) for(let i=-5;i<=5;i++) {
    const x=i*4.92;
    b.box(x,24.54,sign*10.73,.31,.53,.43,0x87683f);
    b.box(x,25.01,sign*10.93,.70,.28,.56,0x5c6656);
    b.box(x,25.25,sign*11.13,1.14,.23,.62,0x987641);
  }
}
// Roof shells use independent curved sweeps for each plane. The vertical triangular
// gables only occupy the upper half of each end, above the swept hip skirts.
function roofShell(b,s,upper) {
  const W=upper?29.8:33.0,D=upper?15.2:17.35,base=upper?26.65:20.35;
  const wx=upper?[W,23.15,23.15]:[W,26.15],dz=upper?[D,8.05,0]:[D,10.61];
  const heights=upper?[base,28.58,33.48]:[base,23.62];
  function sweep(t,phase) {
    return [mix(wx[phase],wx[phase+1],t),mix(dz[phase],dz[phase+1],t),mix(heights[phase],heights[phase+1],t**1.40)];
  }
  function pos(side,u,v,phase=0) {
    const [w,d,y]=sweep(v,phase), o=2*u-1;
    const flare=(upper?1.24:1.05)*Math.pow(Math.max(0,(Math.abs(o)-.63)/.37),3)*(phase===0?(1-v)**1.8:0);
    if(side===0) return [o*w,y+flare,d];
    if(side===1) return [w,y+flare,-o*d];
    if(side===2) return [-o*w,y+flare,-d];
    return [-w,y+flare,o*d];
  }
  for (let face=0;face<4;face++) {
    const broad=face%2===0,n=broad?28:14,segments=upper&&broad?2:1,span=broad?2*W:2*D;
    lightsAlong(b,t=>pos(face,t,0),span);
    lightsAlong(b,t=>pos(face,0,t),upper?8.5:7.8);
    if(upper&&face===0)lightsAlong(b,t=>pos(face,t,1,1),46.3);
    for(let ph=0;ph<segments;ph++) for(let row=0;row<5;row++) {
      const v0=row/5,v1=(row+1)/5;
      for(let i=0;i<n;i++){
        const a=i/n,c=(i+1)/n;
        s.face('roof',[pos(face,a,v0,ph),pos(face,c,v0,ph),pos(face,c,v1,ph),pos(face,a,v1,ph)],[[a*span/2.25,(ph+v0)*1.14],[c*span/2.25,(ph+v0)*1.14],[c*span/2.25,(ph+v1)*1.14],[a*span/2.25,(ph+v1)*1.14]]);
      }
    }
    for(let i=0;i<n;i++) {
      const a=pos(face,i/n,0),c=pos(face,(i+1)/n,0),under=p=>[p[0]*.968,p[1]-.63,p[2]*.968];
      b.face([a,c,under(c),under(a)],0x60402c);
      b.beam([a[0],a[1]-.12,a[2]],[c[0],c[1]-.12,c[2]],.17,0xb8792c,.21);
    }
    // A real rafter soffit closes the underside of the projecting roof at eye level.
    // Without it the yellow tile surface would also be visible through the overhang.
    const inner=p=>[p[0]*(upper?26.18:28.55)/W,upper?25.58:19.86,p[2]*(upper?10.62:12.85)/D];
    const eave=p=>[p[0]*.968,p[1]-.63,p[2]*.968];
    for(let i=0;i<n;i++){
      const a=pos(face,i/n,0),c=pos(face,(i+1)/n,0);
      b.face([eave(a),eave(c),inner(c),inner(a)],upper?0x423b30:0x453b33);
    }
    const joists=Math.round(span/.58);
    for(let i=0;i<joists;i++) {
      const t=(i+.5)/joists, a=pos(face,t-.0015,0), c=pos(face,t+.0015,0);
      const p=eave(a),q=eave(c),r=inner(c),v=inner(a);
      for(const sub of [p,q,r,v])sub[1]-=.025;
      b.face([p,q,r,v],i%5===0?0x917954:0x795e41);
    }
    // Round cap tiles project beyond the fascia, casting a real scalloped eave silhouette.
    const runs=Math.round(span/.33);
    for(let i=0;i<runs;i++) {
      const u=(i+.5)/runs,a=pos(face,u,0),c=pos(face,u,.12),dx=c[0]-a[0],dz0=c[2]-a[2],l=Math.hypot(dx,dz0)||1;
      const nx=-dx/l,nz=-dz0/l,tx=-nz,tz=nx,r=.118;
      const ring=[];for(let k=0;k<6;k++){const ang=k*tau/6;ring.push([a[0]+nx*.056+tx*r*Math.cos(ang),a[1]-.04+r*Math.sin(ang),a[2]+nz*.056+tz*r*Math.cos(ang)]);}
      b.face(ring,i%5===0?goldLight:gold,'glaze');
    }
    // Raised hip ridges and individually spaced ridge beasts are visible against the sky.
    for(let j=0;j<10;j++) {
      const a=pos(face,0,j/10),c=pos(face,0,(j+1)/10);a[1]+=.13;c[1]+=.13;
      b.beam(a,c,.32,gold,.33,'glaze');
    }
    for(let j=0;j<7;j++){
      const t=.075+j*.066,a=pos(face,0,t),size=(j===0?.28:.20),y=a[1]+.16;
      b.lathe(a[0],a[2],[[.13,y],[size,y+.11],[size*.74,y+.30],[.06,y+.37]],6,j%2===0?goldLight:gold,'glaze');
    }
  }
  if(!upper)return;
  for(const sign of sides) {
    const x=sign*23.15,z=8.07,y=28.57,top=33.46;
    const A=[x,y,sign*z],B=[x,y,-sign*z],C=[x,top,0];
    s.face('gable',[A,B,C],[[.038,.03],[.964,.023],[.518,.943]]);
    b.beam(A,C,.29,0x85382a,.32);b.beam(B,C,.29,0x85382a,.32);
    b.beam([x,y+.04,-z],[x,y+.04,z],.26,gold,.34,'glaze');
    // Upturned chiwen at the ridge ends are shaped tails with a split jaw.
    b.lathe(x,0,[[.48,33.13],[.43,33.66],[.53,33.96],[.43,34.18],[.30,34.37]],8,gold,'glaze');
    for(const k of sides)b.beam([x+k*.18,34.01,0],[x+k*.39,34.67,.03],.20,goldLight,.20,'glaze');
  }
  b.beam([-23.18,33.48,0],[23.18,33.48,0],.38,goldLight,.40,'glaze');
}
function nationalEmblem(b,s) {
  const w=2.42,h=2.68,z=11.28,y=23.59;
  // The silhouette follows the ears of wheat, gear and ribbon around the photographed badge.
  const outline=[[.19,.13],[.28,.03],[.40,.08],[.50,.025],[.59,.08],[.73,.04],[.82,.14],[.75,.23],[.88,.37],[.96,.56],[.93,.73],[.82,.88],[.66,.96],[.49,.985],[.31,.95],[.16,.85],[.065,.72],[.04,.51],[.11,.34],[.25,.22]];
  const xyz=([u,v],depth)=>[(u-.5)*w,y+v*h,z+depth],center=[.5,.54];
  for(let i=0;i<outline.length;i++) {
    const a=outline[i],c=outline[(i+1)%outline.length];
    s.face('emblem',[xyz(center,.08),xyz(a,.08),xyz(c,.08)],[center,a,c]);
    b.face([xyz(a,.08),xyz(c,.08),xyz(c,-.21),xyz(a,-.21)],0x9e752d,'glaze');
  }
}
function flags(b) {
  for(const sign of sides) for(let i=0;i<4;i++){
    const x=sign*(36.6+i*6.13),z=15.05,top=20.19;
    b.cylinder(x,z,13.31,.072,top-13.31,0xc5bda7,8);
    b.lathe(x,z,[[.09,top-.08],[.105,top+.01],[.028,top+.28]],8,goldLight);
    const vol=(u,v)=>[x-u*(1.55+.35*Math.sin(i*2.1))+.15*u*Math.sin(v*4+i),top-.33-v*2.48-u*(1.83-1.50*v)+.27*u*Math.sin(.7+v*2.8)-.24*u*u,z+u*(.45*Math.sin(u*7.7+i+v*2.1)+.23*Math.sin(u*14.8+v*.7+i))];
    for(let j=0;j<6;j++) for(let k=0;k<3;k++) {
      const u=j/6,U=(j+1)/6,v=k/3,V=(k+1)/3;
      b.face([vol(u,v),vol(U,v),vol(U,V),vol(u,V)],j%3===0?0xc32726:0xd22c29);
    }
  }
}
function bridge(b,s,cx,cz,width,length) {
  const top=t=>.11+.83*Math.sin(Math.PI*t),z=t=>cz+(t-.5)*length;
  const n=32;
  for(let j=0;j<n;j++) {
    const a=j/n,c=(j+1)/n,ya=top(a),yc=top(c),za=z(a),zc=z(c);
    b.face([[cx-width/2,ya,za],[cx-width/2,yc,zc],[cx+width/2,yc,zc],[cx+width/2,ya,za]],j%4===0?0xc3bcb0:0xcac3b7,'ground');
    const deck=[[cx-width/2,ya+.009,za],[cx-width/2,yc+.009,zc],[cx+width/2,yc+.009,zc],[cx+width/2,ya+.009,za]];
    s.face('paving',deck,deck.map(([x,,z])=>[x/6.8,z/5.1]));
    for(const k of sides){
      const x=cx+k*width/2;
      // The voussoirs surround a real open span below the curved bridge deck.
      const intr=t=>Math.min(top(t)-.26,-2.9+3.48*Math.sqrt(Math.max(0,1-((t-.5)/.46)**2)));
      b.face([[x,ya,za],[x,yc,zc],[x,intr(c),zc],[x,intr(a),za]],j%3===0?0xb8b0a1:0xbfb8ac);
    }
  }
  const panels=Math.round(length/2.63);
  for(const k of sides) {
    const x=cx+k*(width/2-.15);
    for(let j=0;j<=panels;j++) {
      const t=j/panels,y=top(t),zz=z(t);
      b.box(x,y-.02,zz,.39,1.13,.43,stone);
      b.box(x,y+.81,zz,.46,.20,.49,highStone);
      b.lathe(x,zz,[[.21,y+1],[.23,y+1.12],[.18,y+1.19],[.20,y+1.33],[.15,y+1.45],[.04,y+1.51]],8,highStone);
      if(j===panels)continue;
      const next=(j+1)/panels,Y=top(next),Z=z(next),a=zz+.22,c=Z-.22;
      b.beam([x,y+.15,zz],[x,Y+.15,Z],.31,stone,.23);
      b.beam([x,y+.91,zz],[x,Y+.91,Z],.23,highStone,.16);
      b.face([[x,y+.31,a],[x,Y+.31,c],[x,Y+.82,c],[x,y+.82,a]],stone);
      for(const d of sides){
        // The stone face photograph is bounded by the actual wainscot and upper handrail.
        const xx=x+d*.018;
        s.face('bridge-relief',[[xx,y+.32,a],[xx,Y+.32,c],[xx,Y+.80,c],[xx,y+.80,a]]);
      }
    }
  }
}
function ellipsoid(b,x,y,z,rx,ry,rz,color,segments=10,rows=6){
  const at=(i,j)=>{const a=tau*i/segments,p=Math.PI*(j/rows-.5);return [x+rx*Math.cos(a)*Math.cos(p),y+ry*Math.sin(p),z+rz*Math.sin(a)*Math.cos(p)];};
  for(let row=0;row<rows;row++)for(let i=0;i<segments;i++)b.face([at(i,row),at(i,row+1),at(i+1,row+1),at(i+1,row)],color);
}
function huabiao(b,x,z,front) {
  // Locations and the 11 m overall reference are OSM nodes; the fine relief is interpreted.
  b.box(x,0,z,2.44,.28,2.44,darkStone);
  b.box(x,.28,z,2.19,.20,2.19,highStone);
  b.lathe(x,z,[[1.09,.48],[.98,.69],[.88,.78],[.75,.87],[.67,1.16],[.80,1.38],[.87,1.47],[.77,1.63],[.53,1.74]],8,stone);
  b.lathe(x,z,[[.50,1.70],[.48,4.0],[.42,7.2],[.39,8.91]],14,highStone);
  for(let j=0;j<48;j++){
    const pos=n=>{const t=n/48,r=mix(.50,.405,t),a=t*tau*2.8;return[x+r*Math.cos(a),1.88+t*6.68,z+r*Math.sin(a)];};
    b.beam(pos(j),pos(j+1),.095,stone,.10);
  }
  // Pierced cloud wings on the upper shaft. The cloud scrolls have open centres.
  for(const k of sides){
    for(let n=0;n<14;n++){
      const v=t=>[x+k*(.34+1.05*t),8.43+.44*Math.sin(t*Math.PI*1.45)+.27*t,z];
      b.beam(v(n/14),v((n+1)/14),.14,stone,.28);
    }
    for(let n=0;n<12;n++){
      const v=t=>[x+k*(.93+.29*Math.cos(t*tau)),8.66+.20*Math.sin(t*tau),z];
      b.beam(v(n/12),v((n+1)/12),.13,highStone,.22);
    }
  }
  b.lathe(x,z,[[.38,8.95],[.49,9.08],[.73,9.23],[.76,9.37],[.64,9.52],[.49,9.57]],12,stone);
  const dir=front?1:-1;
  ellipsoid(b,x,9.89,z,.40,.40,.31,stone);
  ellipsoid(b,x,10.27,z+dir*.14,.34,.36,.33,highStone);
  ellipsoid(b,x,10.43,z+dir*.32,.25,.21,.25,highStone);
  for(const k of sides)ellipsoid(b,x+k*.23,10.66,z+dir*.10,.11,.16,.11,stone,7,4);
  b.beam([x,9.69,z-dir*.22],[x+.20,10.13,z-dir*.42],.13,stone,.12);
}
function stoneLion(b,x,z,dir) {
  b.box(x,0,z,1.75,.27,2.0,darkStone);b.box(x,.27,z,1.63,.23,1.85,highStone);
  b.box(x,.50,z,1.46,.55,1.66,stone);b.box(x,1.05,z,1.72,.20,1.93,highStone);
  ellipsoid(b,x,1.83,z,.57,.66,.56,stone);
  ellipsoid(b,x,2.38,z+.13*dir,.55,.61,.54,stone);
  for(const k of sides){
    ellipsoid(b,x+k*.41,1.76,z+.35*dir,.18,.46,.19,highStone,8,5);
    ellipsoid(b,x+k*.40,1.43,z+.44*dir,.22,.14,.28,highStone,8,4);
  }
  ellipsoid(b,x,2.78,z+.33*dir,.47,.44,.40,highStone);
  ellipsoid(b,x,2.65,z+.61*dir,.34,.20,.24,highStone,9,5);
  for(let i=0;i<11;i++){
    const a=tau*i/11;ellipsoid(b,x+.45*Math.cos(a),2.80+.40*Math.sin(a),z+.22*dir,.15,.15,.12,stone,7,4);
  }
}
export function buildTiananmenGate(b) {
  const s=new GateSurfaces();
  wall(b,s);hall(b,s);roofShell(b,s,false);roofShell(b,s,true);nationalEmblem(b,s);flags(b);
  // WGS84-derived centres, widths and lengths of the five inner and two outer Jinshui bridges.
  for(const row of [[-28.7,62.4,6.7,34.8],[-17.8,62.3,7.8,35.4],[-3.9,62.3,9.9,41],[9.9,62.4,8.0,34.6],[21.1,61.8,6.4,33],[-157.9,47.8,8,26.7],[153.1,46.2,8,32.2]])bridge(b,s,...row);
  for(const [x,z] of [[-49.9,78.9],[44.9,78],[15.3,-33.1],[-37.2,-32.9]])huabiao(b,x,z,z>0);
  for(const x of [-7.7,7.7])stoneLion(b,x,23.3,1);
  s.finish(b);finishGateLights(b);
}
