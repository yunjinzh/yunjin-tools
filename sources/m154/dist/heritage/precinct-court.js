// Zhongzuomen / Zhongyoumen. OSM parts supply the roof outline, eave and ridge
// elevations. The three-bay portico, carved gable, upturned eaves and stepped
// wall caps follow N509FZ's 2024 frontal photograph of both gates.
// https://commons.wikimedia.org/wiki/File:Hall_of_Supreme_Harmony_and_Mid_L-R_gates_(20241127120000).jpg
import {detailRegions} from './palace-profiles.js';
const lerp=(a,b,t)=>a+(b-a)*t;
const uvQuad=[[0,0],[1,0],[1,1],[0,1]];
function patch(s,key,points,uv=uvQuad){
  const [a,b,c,d]=detailRegions[key],coords=uv.map(([u,v])=>[(a+.6+(c-a-1.2)*u)/2048,1-(d-.6-(d-b-1.2)*v)/2048]);
  s.face('court',points,coords);
}
const roofIds=new Set([638507778,638507784,638507794,638507831,638507832,638507835,638507846,638507847,638507849,638507852,638507853]);
// One of the four slopes is centred slightly outside the nominal bounding box.
const collarIds=new Set([638449280,638449292,638449303,638449315,638507588,638507590]);
export function replacedGatePart(row){
  const n=Number(row[0].slice(4));
  if(roofIds.has(n))return true;
  const r=row[9][0],x=r.reduce((v,p)=>v+p[0]/r.length,0),z=r.reduce((v,p)=>v+p[1]/r.length,0);
  return row[1]==='skillion'&&row[2]===13&&row[3]===16&&Math.abs(x-77)<15&&Math.abs(z-12)<13;
}
export function finishSleeveWall(b,s,row){
  if(!collarIds.has(Number(row[0].slice(4))))return;
  const [,,,hi,rise,,,,,rings]=row,r=rings[0],top=hi-rise;
  const cx=r.reduce((v,p)=>v+p[0]/r.length,0),cz=r.reduce((v,p)=>v+p[1]/r.length,0);
  for(let i=0;i<r.length;i++){
    const a=r[i],c=r[(i+1)%r.length],dx=c[0]-a[0],dz=c[1]-a[1],L=Math.hypot(dx,dz);
    if(L<2.6)continue;
    let nx=dz/L,nz=-dx/L;if(nx*((a[0]+c[0])/2-cx)+nz*((a[1]+c[1])/2-cz)<0){nx=-nx;nz=-nz;}
    const p=(t,h,o)=>[lerp(a[0],c[0],t)+nx*o,h,lerp(a[1],c[1],t)+nz*o];
    const course=(h,d,t,col)=>b.beam(p(0,h,d),p(1,h,d),t,col,t);
    patch(s,'marble',[p(0,.04,.028),p(1,.04,.028),p(1,.53,.028),p(0,.53,.028)]);
    course(.55,.04,.10,0xaba293);
    course(top-.38,.05,.14,0x996e43);course(top-.25,.08,.16,0xb08749);
    course(top-.14,.10,.12,0x567061);course(top-.035,.14,.14,0xbf964e);
    const count=Math.max(1,Math.round(L/.235));
    for(let j=0;j<count;j++){
      const t=(j+.5)/count,x=p(t,top+.005,.18);
      b.beam([x[0]-.13*nx,x[1]+.10,x[2]-.13*nz],[x[0]+.14*nx,x[1],x[2]+.14*nz],.092,0xa47b46,.095);
    }
  }
}
const gateSteps=new Set([638449434,638449435,638507589,638507591,638507786,638507808,638507823,638507848,638507850,638507851]);
export function outerCourtStone(ref){return gateSteps.has(Number(ref.slice(4)));}
export function gateStoneSide(b,s,a,c,y0,y1,sloping){
  const L=Math.hypot(c[0]-a[0],c[1]-a[1]);if(L<.05)return;
  const pos=(t,h)=>[lerp(a[0],c[0],t),h,lerp(a[1],c[1],t)];
  s.face('stone',[pos(0,0),pos(0,y0),pos(1,y1),pos(1,0)],[[0,0],[0,y0/2.3],[L/4.1,y1/2.3],[L/4.1,0]]);
  if(!sloping||L<4.2||Math.abs(y1-y0)<1.25)return;
  const n=Math.max(1,Math.round(L/2.25)),h=t=>lerp(y0,y1,t);
  b.beam(pos(0,y0+.055),pos(1,y1+.055),.30,0xc6bdad,.16);
  for(let j=0;j<=n;j++){
    const t=j/n,[x,y,z]=pos(t,h(t));
    b.box(x,y,z,.24,.87,.24,0xd0c6b4);
    b.lathe(x,z,[[.17,y+.84],[.20,y+.96],[.09,y+1.07],[.12,y+1.12],[.035,y+1.17]],6,0xd6cebe);
    if(j===n)continue;
    const k=(j+1)/n;
    patch(s,'rail',[pos(t,h(t)+.20),pos(k,h(k)+.20),pos(k,h(k)+.64),pos(t,h(t)+.64)]);
  }
  b.beam(pos(0,y0+.77),pos(1,y1+.77),.16,0xcac2b1,.17);
}
function gate(b,s,cx,cz,angle){
  const ca=Math.cos(angle),sa=Math.sin(angle);
  const P=(x,y,z)=>[cx+x*ca-z*sa,y,cz+x*sa+z*ca];
  const beam=(a,c,w,cl,d=w)=>b.beam(P(...a),P(...c),w,cl,d);
  const face=(pts,color)=>b.face(pts.map(v=>P(...v)),color);
  // OSM eaves at 13 m, crown at 21 m. Section is concave between the ridge
  // and the upturned lower rim. A hip skirt returns below the upper gable.
  const base=13,half=13.4,deep=8.8,ridge=9.27;
  function slope(side,u,t){
    const y=base+8*(.55*t+.45*t*t)+1.09*(1-t)**2*Math.abs(u)**4;
    const x=lerp(half,ridge,Math.min(1,t/.48))*u,z=side*deep*(1-t);
    return [x,y,z];
  }
  const rim=(a,c,w,col)=>b.beam(P(...a),P(...c),w,col,.87*w);
  for(const side of [-1,1]){
    for(let col=0;col<14;col++){
      const u=2*col/14-1,v=2*(col+1)/14-1;
      for(let j=0;j<8;j++){
        const t=j/8,k=(j+1)/8;
        const pts=[slope(side,u,t),slope(side,v,t),slope(side,v,k),slope(side,u,k)];
        patch(s,'tile',pts.map(i=>P(...i)),[[col%7/7,t],[(col%7+1)/7,t],[(col%7+1)/7,k],[col%7/7,k]]);
      }
      const a=slope(side,u,0),c=slope(side,v,0);
      patch(s,'eave',[[a[0],a[1]-.27,a[2]],[c[0],c[1]-.27,c[2]],c,a].map(i=>P(...i)));
      rim(a,c,.13,0xbe955d);
    }
  }
  for(const sign of [-1,1]){
    const sidePoint=(u,t)=>{
      const k=.48*t,edgeY=slope(1,1,k)[1],midY=lerp(base,16.23,t)-.14*t*(1-t);
      return [sign*lerp(half,ridge,t),lerp(midY,edgeY,Math.abs(u)**4),u*deep*(1-k)];
    };
    for(let col=0;col<8;col++){
      const u=col/4-1,v=(col+1)/4-1;
      for(let j=0;j<4;j++){
        const t=j/4,k=(j+1)/4;
        patch(s,'tile',[sidePoint(u,t),sidePoint(v,t),sidePoint(v,k),sidePoint(u,k)].map(i=>P(...i)),[[col%4/4,t],[(col%4+1)/4,t],[(col%4+1)/4,k],[col%4/4,k]]);
      }
      const a=sidePoint(u,0),c=sidePoint(v,0);
      patch(s,'eave',[[a[0],a[1]-.24,a[2]],[c[0],c[1]-.24,c[2]],c,a].map(i=>P(...i)));
    }
    for(const dir of [-1,1]){
      for(let j=0;j<5;j++)rim(sidePoint(dir,j/5),sidePoint(dir,(j+1)/5),.22,0xc6a065);
      const gableX=sign*(ridge-.15);
      for(let j=0;j<7;j++){
        const t=j/7,k=(j+1)/7,z0=dir*4.58*(1-t),z1=dir*4.58*(1-k);
        const Y=t=>16+5*(.64*t+.36*t*t);
        const panel=[[gableX,16.03,z0],[gableX,16.03,z1],[gableX,Y(k),z1],[gableX,Y(t),z0]];
        // Sample the carved gilt timber from the interior of an existing
        // gable photo. Omit the skyline beyond its verge and ridge edges.
        s.face('gable',panel.map(q=>P(...q)),panel.map(([,y,z])=>[.50+z/13.7,.095+.74*(y-16)/5]));
        for(const inset of [-.02,.11]){
          const x=sign*(ridge+inset);
          rim([x,Y(t)-.10,z0],[x,Y(k)-.10,z1],inset>0?.20:.35,inset>0?0xd1a65e:0x754a32);
        }
      }
      // Vertical timber boards terminate inside the sloping head.
      for(let j=1;j<13;j++){
        const t=j/13,z=dir*4.58*(1-t);rim([gableX+sign*.03,16.03,z],[gableX+sign*.03,16+5*(.64*t+.36*t*t)-.14,z],.055,0xa08456);
      }
    }
  }
  patch(s,'ridge',[P(-ridge,21.0,.14),P(ridge,21.0,.14),P(ridge,21.30,.14),P(-ridge,21.30,.14)]);
  beam([-ridge-.12,21.32,0],[ridge+.12,21.32,0],.22,0xc39653,.29);
  for(const sign of [-1,1]){
    const loc=[0,.13,.29,.46,.52],ele=[21.11,21.38,21.74,21.91,21.73];
    for(let i=1;i<loc.length;i++)beam([sign*(ridge-.1+loc[i-1]),ele[i-1],0],[sign*(ridge-.1+loc[i]),ele[i],0],.26,0xbf965d,.33);
  }
  // The open centre is flanked by lattice door leaves, with columns in front.
  for(const sign of [-1,1]){
    const z=7.11*sign,back=5.2*sign,span=21.18/3;
    for(const axis of [-10.60,-3.53,3.53,10.60]){
      const [x,y,v]=P(axis,4.98,z);
      b.cylinder(x,v,4.98,.48,.32,0xb3aa97,12);b.cylinder(x,v,5.30,.325,7.45,0x9d3e34,12);
    }
    for(const bay of [-1,0,1]){
      const x=span*bay;
      if(bay!==0){
        face([[x-span/2,5.0,back],[x+span/2,5.0,back],[x+span/2,12.1,back],[x-span/2,12.1,back]],0x843c31);
        patch(s,'door2',[P(x-2.33,5.4,back+.025*sign),P(x+2.33,5.4,back+.025*sign),P(x+2.33,10.55,back+.025*sign),P(x-2.33,10.55,back+.025*sign)]);
      }
      patch(s,'lowerband',[P(x-span/2,11.66,z+.05*sign),P(x+span/2,11.66,z+.05*sign),P(x+span/2,12.92,z+.05*sign),P(x-span/2,12.92,z+.05*sign)]);
    }
    for(const x of [-10.6,-7.1,-3.53,0,3.53,7.1,10.6]){
      const y=12.88;beam([x-.38,y,z],[x+.38,y,z],.33,0x507166,.48);
      beam([x,y+.16,z-.46],[x,y+.16,z+.46],.32,0x4a665c,.26);
    }
    face([[-12.9,12.88,z], [12.9,12.88,z],[13.45,13.10,8.8*sign],[-13.45,13.10,8.8*sign]],0x634b36);
  }
  for(const sign of [-1,1]){
    const x=sign*10.9;face([[x,5,5.23],[x,5,-5.23],[x,12.94,-5.23],[x,12.94,5.23]],0x874438);
    const z=5.16;beam([x,12.63,-z],[x,12.63,z],.65,0x3d594e,.38);
  }
}
function platform(b,s,z,w,d){
  for(let i=0;i<3;i++){
    const base=i*2.6,top=base+2.6,hw=(w-i*3.8)/2,hd=(d-i*3.8)/2;
    for(const side of [-1,1]){
      // Set the side and front balustrades back from the tread noses.
      const bands=[
        [[side*hw,z-hd],[side*hw,z+hd]],
        [[side*hw,z+hd],[side*Math.min(12,hw*.55),z+hd]],
        [[side*hw,z-hd],[side*Math.min(12,hw*.55),z-hd]]
      ];
      for(const [a,c] of bands){
        const dx=c[0]-a[0],dz=c[1]-a[1],L=Math.hypot(dx,dz);
        const nx=dx===0?side:0,nz=dx===0?0:Math.sign(a[1]-z);
        const p=(t,y,o)=>[lerp(a[0],c[0],t)+o*nx,y,lerp(a[1],c[1],t)+o*nz];
        const n=Math.max(1,Math.round(L/2.55));
        for(let j=0;j<n;j++){
          for(const [name,h0,h1,off] of [['apron',base+.23,top-.24,.015],['rail',top+.19,top+.76,-.15]]){
            patch(s,name,[p(j/n,h0,off),p((j+1)/n,h0,off),p((j+1)/n,h1,off),p(j/n,h1,off)]);
          }
          const [x,y,v]=p(j/n,top,-.15);b.box(x,top,v,.26,.97,.26,0xcfc7b7);
          b.lathe(x,v,[[.20,top+.95],[.23,top+1.08],[.11,top+1.17],[.14,top+1.24],[.04,top+1.29]],6,0xd7cdb8);
        }
        b.beam(p(0,top+.87,-.15),p(1,top+.87,-.15),.16,0xcfc9bb,.17);
        b.beam(p(0,top-.23,.10),p(1,top-.23,.10),.15,0xc5beaf,.17);
        b.beam(p(0,base+.23,.09),p(1,base+.23,.09),.13,0xb3ab9c,.16);
      }
    }
  }
}
export function finishOuterCourt(b,s){
  gate(b,s,-79.815,11.855,.0085);gate(b,s,76.73,12.37,.0085);
  platform(b,s,-65,49,44);platform(b,s,-126,84,48);
}
