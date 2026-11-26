import {solar} from './atmosphere.js';
import {loadCpuLandmark} from './cpu-landmarks.js';
import {loadCpuRelief} from './cpu-relief.js';
import {createCpuCity} from './cpu-city.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,k)=>a+(b-a)*k;
const pack=(r,g,b)=>(255<<24)|(clamp(b|0,0,255)<<16)|(clamp(g|0,0,255)<<8)|clamp(r|0,0,255);
async function rasterImage(src){const im=new Image();im.src=src;await im.decode();const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height)}
function boundsFor(m){const p=m.pos,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.length;i++){const k=i%3;if(p[i]<min[k])min[k]=p[i];if(p[i]>max[k])max[k]=p[i];}const center=min.map((v,k)=>(v+max[k])/2);return {min,max,center,radius:Math.hypot(max[0]-center[0],max[1]-center[1],max[2]-center[2])};}
function normalData(m){if(m.normals)return m.normals;const n=new Int8Array(m.index.length),p=m.pos,idx=m.index;for(let i=0;i<idx.length;i+=3){let a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3,ax=p[b]-p[a],ay=p[b+1]-p[a+1],az=p[b+2]-p[a+2],bx=p[c]-p[a],by=p[c+1]-p[a+1],bz=p[c+2]-p[a+2];let x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx,f=127/(Math.hypot(x,y,z)||1);n[i]=Math.round(x*f);n[i+1]=Math.round(y*f);n[i+2]=Math.round(z*f);}m.normals=n;return n;}
function makeShadow(mesh,sun){if(!mesh||sun.y<.065)return null;
 const p=mesh.pos,idx=mesh.index,size=250,l=Math.hypot(sun.x,sun.z)||1,ex=sun.z/l,ez=-sun.x/l,ux=-sun.y*ez,uy=ez*sun.x-ex*sun.z,uz=sun.y*ex;
 const pts=new Float32Array(p.length);let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(let k=0;k<p.length;k+=3){let x=p[k],y=p[k+1],z=p[k+2],u=ex*x+ez*z,v=ux*x+uy*y+uz*z;pts[k]=u;pts[k+1]=v;pts[k+2]=sun.x*x+sun.y*y+sun.z*z;x0=Math.min(x0,u);y0=Math.min(y0,v);x1=Math.max(x1,u);y1=Math.max(y1,v);}
 const sx=(size-3)/(x1-x0||1),sy=(size-3)/(y1-y0||1),depth=new Float32Array(size*size);depth.fill(-1e8);
 for(let i=0;i<pts.length;i+=3){pts[i]=(pts[i]-x0)*sx+1;pts[i+1]=(pts[i+1]-y0)*sy+1;}
 for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;const ax=pts[a],ay=pts[a+1],az=pts[a+2],bx=pts[b],by=pts[b+1],cx=pts[c],cy=pts[c+1];
 const area=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay);if(Math.abs(area)<.015)continue;const s0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),s1=Math.min(size-1,Math.ceil(Math.max(ax,bx,cx))),t0=Math.max(0,Math.floor(Math.min(ay,by,cy))),t1=Math.min(size-1,Math.ceil(Math.max(ay,by,cy)));
 for(let y=t0;y<=t1;y++)for(let x=s0;x<=s1;x++){const u=((x+.5-ax)*(cy-ay)-(y+.5-ay)*(cx-ax))/area,v=((bx-ax)*(y+.5-ay)-(by-ay)*(x+.5-ax))/area;if(u>=0&&v>=0&&u+v<=1){const d=az+u*(pts[b+2]-az)+v*(pts[c+2]-az);const k=y*size+x;if(d>depth[k])depth[k]=d;}}}
 return (x,y,z)=>{const u=((ex*x+ez*z-x0)*sx+1)|0,v=((ux*x+uy*y+uz*z-y0)*sy+1)|0;return u>0&&u<size-1&&v>0&&v<size-1&&depth[v*size+u]>(sun.x*x+sun.y*y+sun.z*z)+Math.max(.38,.85/sx);};
}
export async function makeSoftware({canvas,project,landmarks,selected,camera,state,onProgress}){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas 2D unavailable');
 const [manifest,noise,wideImage,nightImage]=await Promise.all([fetch('./imagery/manifest.json').then(r=>r.json()),rasterImage('./imagery/cloud-noise.png'),rasterImage('./terrain-data/beijing-region.webp'),rasterImage('./terrain-data/night-lights.webp')]);
 const groundImages=await Promise.all(manifest.layers.map(async l=>{const im=await rasterImage('./imagery/'+l.file),lt=project(l.bounds[0],l.bounds[3]),rb=project(l.bounds[2],l.bounds[1]);return {im,x0:lt.x,z0:lt.z,x1:rb.x,z1:rb.z,sx:(im.width-1)/(rb.x-lt.x),sz:(im.height-1)/(rb.z-lt.z)}}));groundImages.reverse();const ra=project(115.30,40.80),rb=project(117.52,39.23);const regional={im:wideImage,x0:ra.x,z0:ra.z,x1:rb.x,z1:rb.z,sx:(wideImage.width-1)/(rb.x-ra.x),sz:(wideImage.height-1)/(rb.z-ra.z)};
 let swCity,relief=[],land=new Map(),W=1,H=1,buffer,pixels,depth,fx,fy,px,py,active,shadow,sun,night=0,wet=0,snow=0,day=1,haze=.000028,grey=0,warm=0,horizon=[178,194,196],selId=selected.id,lastPaint=-Infinity,lastKey='',drawn=0,frameTime=25,serial=0,timeKey='';
 const moved=new Float64Array(16);let scr=new Float32Array(128),clipX=new Float32Array(64),clipY=new Float32Array(64);let cc,ss;
 const settings={buildings:true,vegetation:true,imagery:true};
 const localById=new Map(landmarks.map(lm=>{let {x,z}=project(lm.lon,lm.lat);return [lm.id,{x,z,lm}]}));
 async function load(id){if(!land.has(id))land.set(id,loadCpuLandmark(id).then(m=>{m.bounds=boundsFor(m);return m}));return land.get(id);}
 async function select(id){selId=id;const m=await load(id);if(selId!==id)return;active=m;serial++;timeKey='';}
 function env(){const k=[state.date,state.time,state.weather,selId].join('|');if(timeKey===k)return;timeKey=k;sun=solar(state.date,state.time);day=clamp((sun.y+.13)/.24,0,1);night=1-day;wet=+(state.weather==='rain');snow=+(state.weather==='snow');grey=({clear:0,cloud:.28,rain:.81,snow:.75,fog:.80})[state.weather];warm=clamp((.47-sun.y)/.40,0,1)*day;haze=({clear:.000029,cloud:.000065,rain:.00077,snow:.00092,fog:.00165})[state.weather];horizon=[mix(34,mix(186+warm*30,158,grey),day),mix(48,mix(208-warm*8,167,grey),day),mix(66,mix(217-warm*33,174,grey),day)];shadow=active&&!wet&&!snow&&state.weather!=='fog'?makeShadow(active,sun):null;}
 function size(still){let cw=canvas.clientWidth,ch=canvas.clientHeight;if(!cw||!ch)return;let cap=still?1640:cw<670?630:910;const scale=Math.min(still?1.6:1.15,cap/cw,Math.sqrt((still?1250000:465000)/(cw*ch)));const w=Math.round(cw*scale),h=Math.round(ch*scale);if(w===W&&h===H&&buffer)return;W=canvas.width=w;H=canvas.height=h;buffer=ctx.createImageData(W,H);pixels=new Uint32Array(buffer.data.buffer);depth=new Float32Array(W*H);lastKey='';}
 function drawBackground(now){const e=camera.matrixWorld.elements,dx=camera.position.x,dy=camera.position.y,dz=camera.position.z;
 const m=camera.projectionMatrix.elements,groundX=e[0]/fx,groundY=e[1]/fx,groundZ=e[2]/fx;
 const layer=groundImages[0],outer=groundImages[1],near=localById.get(selId),radius=(active?.bounds.radius||110)*1.4+55;
 const rday=.25+.76*day,rg=.35+.66*day,rb=.52+.50*day,noiseA=noise.data;const earthR=wet?.78:1,field=state.weather==='clear'?.52:state.weather==='cloud'?.32:.23;
 for(let y=0,idx=0;y<H;y++){
  const vy=(py-y-.5)/fy,vx=(.5-px)/fx;let rx=e[0]*vx+e[4]*vy-e[8],ry=e[1]*vx+e[5]*vy-e[9],rz=e[2]*vx+e[6]*vy-e[10];
  for(let x=0;x<W;x++,idx++,rx+=groundX,ry+=groundY,rz+=groundZ){let R,G,B,dep=0;
   const t=ry<-.00004?-dy/ry:1e9;
   if(t>0&&t<73000){const gx=dx+t*rx,gz=dz+t*rz;let L=layer;if(gx<layer.x0||gx>layer.x1||gz<layer.z0||gz>layer.z1)L=outer;
    if(settings.imagery&&gx>L.x0&&gx<L.x1&&gz>L.z0&&gz<L.z1){const u=(gx-L.x0)*L.sx,v=(gz-L.z0)*L.sz,ix=u|0,iy=v|0,s=L.im.width*4,off=iy*s+ix*4,im=L.im.data,ax=u-ix,az=v-iy;
     const aa=(1-ax)*(1-az),bb=ax*(1-az),cc=(1-ax)*az,dd=ax*az;
     R=im[off]*aa+im[off+4]*bb+im[off+s]*cc+im[off+s+4]*dd;G=im[off+1]*aa+im[off+5]*bb+im[off+s+1]*cc+im[off+s+5]*dd;B=im[off+2]*aa+im[off+6]*bb+im[off+s+2]*cc+im[off+s+6]*dd;
    }else{R=104;G=110;B=88;}
    if(t<550){const j=(Math.sin(Math.floor(gx*1.7)*2.23+Math.floor(gz*1.7)*9.72)*.5+.5)*5;R+=j;G+=j;B+=j;}
    const inShadow=shadow&&Math.abs(gx-near.x)<radius&&Math.abs(gz-near.z)<radius&&shadow(gx-near.x,0,gz-near.z);
    const sm=inShadow?.68:1,tone=sm*earthR;R=R*tone*rday;G=G*tone*rg;B=B*tone*rb;if(snow){R=mix(R,198,.55);G=mix(G,211,.55);B=mix(B,217,.55);}
    const f=clamp(t*haze/(1+t*haze),0,.97);R=mix(R,horizon[0],f);G=mix(G,horizon[1],f);B=mix(B,horizon[2],f);dep=1/t;
   }else{
    const inv=1/Math.sqrt(rx*rx+ry*ry+rz*rz),ux=rx*inv,uy=ry*inv,uz=rz*inv,h=clamp(Math.sqrt(Math.max(0,uy))*.94,0,1),dot=ux*sun.x+uy*sun.y+uz*sun.z;
    R=mix(horizon[0],mix(12,57+grey*66,day),h);G=mix(horizon[1],mix(21,117+grey*22,day),h);B=mix(horizon[2],mix(42,166-grey*16,day),h);
    if(uy>-.015){let az=Math.atan2(ux,-uz)/(2*Math.PI)+.5;
     let a=(az*noise.width+now*.0007)%noise.width,b=clamp((.2+Math.max(uy,0)*.8)*noise.height,0,noise.height-1.01);
     const ix=a|0,iy=b|0,off=(ix+iy*noise.width)*4,s=noise.width*4;const q=mix(mix(noiseA[off],noiseA[off+4]||noiseA[off],a-ix),mix(noiseA[off+s]||noiseA[off],noiseA[off+s+4]||noiseA[off],a-ix),b-iy)/255;
     const cloud=clamp((q-field)*3.3,0,.92)*clamp((uy+.017)*7,0,1),bright=clamp((q-.3)*1.3,0,1);R=mix(R,mix(28,193+bright*49-grey*32,day),cloud);G=mix(G,mix(36,202+bright*42-grey*34,day),cloud);B=mix(B,mix(52,210+bright*36-grey*34,day),cloud);
     if(dot>.91){const g=((dot-.91)/.09)**5*day*(1-grey)*(1-cloud);R+=50*g;G+=31*g;B+=10*g;if(dot>.9998){R=mix(R,255,g);G=mix(G,237,g);B=mix(B,198,g);}}
     if(night>.6&&uy>.08){const st=(ix*73+(iy+1)*977)%1999;if(st===13&&q<.48){R+=56;G+=62;B+=65;}}
    }
   }
   pixels[idx]=pack(R,G,B);depth[idx]=dep;
  }
 }
 }
 let surface=0,level=0,surfaceX=0,surfaceZ=0,localShadow=false,viewCosX=0,viewCosZ=0,viewOriginY=0;
 const shadeChannels=(rgb,f,ar=0,ag=0,ab=0)=>pack((rgb&255)*f+ar,((rgb>>>8)&255)*f+ag,((rgb>>>16)&255)*f+ab);
 function hash(x,z){let h=Math.imul(x|0,1597334677)^Math.imul(z|0,3812015801);h^=h>>>13;return ((h^h>>>9)>>>0)/4294967296;}
 function textureSurface(k,x,y,iz,rgb){
  const e=camera.matrixWorld.elements,ox=camera.position.x,oz=camera.position.z,dist=1/iz;
  const vx=(x+.5-px)/fx,vy=(py-y-.5)/fy;
  const wx=ox+(e[0]*vx+e[4]*vy-e[8])*dist,wz=oz+(e[2]*vx+e[6]*vy-e[10])*dist;
  if(surface===5){
   let l=groundImages[0];if(wx<l.x0||wx>l.x1||wz<l.z0||wz>l.z1)l=groundImages[1];if(wx<l.x0||wx>l.x1||wz<l.z0||wz>l.z1)l=regional;
   const u=clamp((wx-l.x0)*l.sx,0,l.im.width-1.01),v=clamp((wz-l.z0)*l.sz,0,l.im.height-1.01),i=u|0,j=v|0,im=l.im.data,k=(j*l.im.width+i)*4,str=l.im.width*4,a=u-i,b=v-j;
   let r=mix(mix(im[k],im[k+4],a),mix(im[k+str],im[k+str+4],a),b),g=mix(mix(im[k+1],im[k+5],a),mix(im[k+str+1],im[k+str+5],a),b),bl=mix(mix(im[k+2],im[k+6],a),mix(im[k+str+2],im[k+str+6],a),b);
   let lum=level*mix(.28,1.05,day);r*=lum;g*=lum;bl*=lum;
   if(night>.05){const nu=clamp((wx-regional.x0)/(regional.x1-regional.x0),0,.9999),nv=clamp((wz-regional.z0)/(regional.z1-regional.z0),0,.9999),off=((nv*nightImage.height|0)*nightImage.width+(nu*nightImage.width|0))*4,light=nightImage.data[off];r+=light*night*.78;g+=light*night*.66;bl+=light*night*.42;}
   if(snow){r=mix(r,183,.48);g=mix(g,194,.48);bl=mix(bl,201,.48);}
   const f=dist*haze/(1+dist*haze);return pack(mix(r,horizon[0],f),mix(g,horizon[1],f),mix(bl,horizon[2],f));}
  if(surface===3){
   const wy=camera.position.y+(e[1]*vx+e[5]*vy-e[9])*dist;
   const u=(wx*viewCosX+wz*viewCosZ)/2.35,t=wy/3.55,iu=Math.floor(u),iv=Math.floor(t),a=u-iu,b=t-iv;
   const pane=hash(iu,iv),v=.84+.12*Math.min(1,wy/140);
   if(a>.13&&a<.91&&b>.21&&b<.88){
    if(night>.45&&pane>.68)return shadeChannels(rgb,.48,95+pane*37,68+pane*26,31+pane*19);
    return shadeChannels(rgb,v*(.78+.18*pane),-4,1,8);}
   return shadeChannels(rgb,.97);
  }
  if(surface===4){const ripple=Math.sin(wx*1.04+wz*.89)*.03+Math.sin(wz*.63+wx*.3)*.035;return shadeChannels(rgb,.97+ripple,-2,1,4);}
  const gx=wx-surfaceX,gz=wz-surfaceZ;
  const slabW=surface===1?1.82:2.35,slabH=surface===1?1.08:1.48;
  const row=Math.floor(gz/slabH),u=gx/slabW+((row&1)*.5),col=Math.floor(u);
  const seam=Math.min((u-col)*slabW,(1-u+col)*slabW,gz-row*slabH,(1+row)*slabH-gz);
  const noise=hash(Math.floor(wx*7),Math.floor(wz*7));
  const line=seam<(.016+dist*.00015)?(.12*Math.max(.22,1-dist/480)):0;
  let f=.945+hash(col,row)*.087+(noise-.5)*.036-line;
  if(localShadow&&shadow&&shadow(gx,level,gz))f*=.72;
  return shadeChannels(rgb,f);
 }
 function triangle(ax,ay,az,bx,by,bz,cx,cy,cz,color){const div=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(Math.abs(div)<.045)return;
 const zx=((bz-az)*(cy-ay)-(cz-az)*(by-ay))/div,zy=((bx-ax)*(cz-az)-(cx-ax)*(bz-az))/div;
 const lo=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5)),hi=Math.min(H-1,Math.floor(Math.max(ay,by,cy)-.5));if(lo>hi)return;
 for(let y=lo;y<=hi;y++){const t=y+.5;let l=1e12,r=-1e12,u;
  if((t>=ay)!==(t>=by)){u=ax+(bx-ax)*(t-ay)/(by-ay);l=Math.min(l,u);r=Math.max(r,u);}
  if((t>=by)!==(t>=cy)){u=bx+(cx-bx)*(t-by)/(cy-by);l=Math.min(l,u);r=Math.max(r,u);}
  if((t>=cy)!==(t>=ay)){u=cx+(ax-cx)*(t-cy)/(ay-cy);l=Math.min(l,u);r=Math.max(r,u);}
  const x0=Math.max(0,Math.ceil(l-.5)),x1=Math.min(W-1,Math.floor(r-.5));let iz=az+zx*(x0+.5-ax)+zy*(t-ay),k=y*W+x0;
  for(let x=x0;x<=x1;x++,k++,iz+=zx){if(iz>=depth[k]){depth[k]=iz;pixels[k]=surface?textureSurface(k,x,y,iz,color):color;}}
 }}
 function nearClip(inds,col){const poly=[];for(let j=0;j<3;j++){const a=inds[j],b=inds[(j+1)%3],za=scr[a+2],zb=scr[b+2];if(za>=.45)poly.push([scr[a],scr[a+1],1/za]);if((za>=.45)!==(zb>=.45)){const f=(.45-za)/(zb-za),u=a/3,v=b/3;poly.push([px+fx*(clipX[u]+(clipX[v]-clipX[u])*f)/.45,py-fy*(clipY[u]+(clipY[v]-clipY[u])*f)/.45,1/.45]);}}for(let j=1;j<poly.length-1;j++)triangle(...poly[0],...poly[j],...poly[j+1],col);}
 function drawMesh(mesh,ox=0,oy=0,oz=0,type='city'){
  const bound=mesh.bounds?.center?mesh.bounds:(mesh._swBounds??=boundsFor(mesh)),bc=bound.center,e=camera.matrixWorld.elements,eye=camera.position;
  const dx=bc[0]+ox-eye.x,dy=bc[1]+oy-eye.y,dz=bc[2]+oz-eye.z,zc=-(e[8]*dx+e[9]*dy+e[10]*dz),xc=e[0]*dx+e[1]*dy+e[2]*dz,yc=e[4]*dx+e[5]*dy+e[6]*dz,rad=bound.radius;
  if(zc+rad<.45||Math.abs(xc)>Math.max(0,zc)*(W*.67/fx)+rad*2||Math.abs(yc)>Math.max(0,zc)*(H*.60/fy)+rad*2)return 0;
  const p=mesh.pos,idx=mesh.index,norm=normalData(mesh),colors=mesh.colors,N=p.length;if(scr.length<N){scr=new Float32Array(N);clipX=new Float32Array(N/3);clipY=new Float32Array(N/3);}
  const rx=ox-eye.x,ry=oy-eye.y,rz=oz-eye.z,dx0=e[0]*rx+e[1]*ry+e[2]*rz,dy0=e[4]*rx+e[5]*ry+e[6]*rz,dz0=-e[8]*rx-e[9]*ry-e[10]*rz;
  for(let i=0,j=0;i<N;i+=3,j++){const x=p[i],y=p[i+1],z=p[i+2],X=e[0]*x+e[1]*y+e[2]*z+dx0,Y=e[4]*x+e[5]*y+e[6]*z+dy0,Z=-e[8]*x-e[9]*y-e[10]*z+dz0;clipX[j]=X;clipY[j]=Y;scr[i]=px+X*fx/Z;scr[i+1]=py-Y*fy/Z;scr[i+2]=Z;}
  const terrain=type==='terrain',hero=type==='hero',kSun=.49*day*(1-.80*grey);
  for(let i=0;i<idx.length;i+=3){const a=3*idx[i],b=3*idx[i+1],c=3*idx[i+2],za=scr[a+2],zb=scr[b+2],zc=scr[c+2];if(Math.max(za,zb,zc)<.45)continue;
   const ax=scr[a],ay=scr[a+1],bx=scr[b],by=scr[b+1],cx=scr[c],cy=scr[c+1];const clip=Math.min(za,zb,zc)<.45;
   if(!clip&&((ax<0&&bx<0&&cx<0)||(ax>=W&&bx>=W&&cx>=W)||(ay<0&&by<0&&cy<0)||(ay>=H&&by>=H&&cy>=H)))continue;
   const area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(!clip&&Math.abs(area)<.09)continue;
   let nx=norm[i]/127,ny=norm[i+1]/127,nz=norm[i+2]/127;if(area>0&&!terrain){nx=-nx;ny=-ny;nz=-nz;}
   let r=colors[i],g=colors[i+1],bb=colors[i+2];const d=(za+zb+zc)/3,up=clamp(ny,0,1),sunlight=Math.max(0,nx*sun.x+ny*sun.y+nz*sun.z);
   const horizontal=Math.abs(ny)>.985&&Math.abs(p[a+1]-p[b+1])<.08&&Math.abs(p[b+1]-p[c+1])<.08;
   const stone=horizontal&&hero&&p[a+1]<11&&Math.abs(r-bb)<75&&Math.abs(g-bb)<57;
   const paved=horizontal&&type==='city'&&p[a+1]<.40&&d<630&&r>g&&g>bb;
   const water=horizontal&&type==='city'&&p[a+1]<.09&&bb>r*1.18;
   const facade=type==='city'&&Math.abs(ny)<.22&&r>120&&g>117&&Math.max(r,g,bb)-Math.min(r,g,bb)<48&&Math.max(p[a+1],p[b+1],p[c+1])>9&&d<1200;
   surface=stone?1:paved?2:facade?3:water?4:0;surfaceX=ox;surfaceZ=oz;level=p[a+1];
   localShadow=hero&&stone;viewCosX=nz;viewCosZ=-nx;
   let shade=1;if(hero&&!stone&&shadow&&sunlight>.06){const mx=(p[a]+p[b]+p[c])/3,my=(p[a+1]+p[b+1]+p[c+1])/3,mz=(p[a+2]+p[b+2]+p[c+2])/3;if(shadow(mx,my,mz))shade=.22;}
   let intensity=terrain?.80+.21*up:((.63+up*.14)*(1-.08*grey)+sunlight*kSun*shade);
   if(hero&&ny<-.4)intensity*=.83;
   if(night>.05){let illumination=hero?.38+.22*up+.19*Math.max(0,nx*.6+nz*.5):.24+.12*up;intensity=mix(intensity,illumination,night);if(hero&&bb>r*1.18){r+=10*night;g+=19*night;bb+=26*night;}}
   const snowCov=snow*(terrain?.44:Math.max(0,up-.12)*.72);r=mix(r,216,snowCov);g=mix(g,221,snowCov);bb=mix(bb,225,snowCov);
   r*=intensity*(1+.074*warm*sunlight)*(1-wet*.09);g*=intensity*(1-wet*.065);bb*=intensity*(1-.065*warm*sunlight)*(1-wet*.04);
   if(night>.05&&mesh.emissive){const glow=(mesh.emissive[i/3]||0)/255*night;r+=glow*161;g+=glow*122;bb+=glow*66;}
   const fog=clamp(d*haze/(1+Math.max(0,d)*haze),0,.97);r=mix(r,horizon[0],fog);g=mix(g,horizon[1],fog);bb=mix(bb,horizon[2],fog);
   if(terrain){surface=5;level=.92+Math.max(0,sunlight-.25)*.27;}const rgb=pack(r,g,bb);if(clip)nearClip([a,b,c],rgb);else triangle(ax,ay,1/za,bx,by,1/zb,cx,cy,1/zc,rgb);drawn++;
  }
  if(hero&&mesh.linePos&&zc<2200){
   const lines=mesh.linePos,lc=mesh.lineColors,opacity=.56;
   for(let i=0;i<lines.length;i+=6){const j=i+3;
    let x=lines[i],y=lines[i+1],z=lines[i+2];let z0=-e[8]*x-e[9]*y-e[10]*z+dz0;if(z0<.5)continue;let x0=px+(e[0]*x+e[1]*y+e[2]*z+dx0)*fx/z0,y0=py-(e[4]*x+e[5]*y+e[6]*z+dy0)*fy/z0;
    x=lines[j];y=lines[j+1];z=lines[j+2];let z1=-e[8]*x-e[9]*y-e[10]*z+dz0;if(z1<.5)continue;let x1=px+(e[0]*x+e[1]*y+e[2]*z+dx0)*fx/z1,y1=py-(e[4]*x+e[5]*y+e[6]*z+dy0)*fy/z1;
    if(Math.max(x0,x1)<0||Math.min(x0,x1)>=W||Math.max(y0,y1)<0||Math.min(y0,y1)>=H)continue;
    const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)));if(!n||n>1800)continue;const ii=i/2,r=lc[ii]*(.52+.48*day),g=lc[ii+1]*(.57+.43*day),b=lc[ii+2]*(.65+.35*day);
    for(let j=0;j<=n;j++){const f=j/n,xx=Math.round(x0+(x1-x0)*f),yy=Math.round(y0+(y1-y0)*f);if(xx<0||yy<0||xx>=W||yy>=H)continue;const k=yy*W+xx,iz=(1-f)/z0+f/z1;if(iz*(1+.0018)>=depth[k]){const old=pixels[k];pixels[k]=pack(mix(old&255,r,opacity),mix((old>>>8)&255,g,opacity),mix((old>>>16)&255,b,opacity));}}
   }
  }
 }
 let lastPose='',changedAt=0;
 function render(now,force=false){env();const cm=camera.matrixWorld.elements;const key=Array.from(cm).map(x=>x.toFixed(6)).join(',')+timeKey+serial;if(key!==lastPose){lastPose=key;changedAt=now;}size(now-changedAt>550&&!wet&&!snow);
 if(!force&&lastKey===key&&now-lastPaint<(wet||snow?75:1400))return;if(!force&&now-lastPaint<Math.max(29,Math.min(85,frameTime*.95)))return;
 const begin=performance.now();lastPaint=now;lastKey=key;const proj=camera.projectionMatrix.elements;fx=proj[0]*W/2;fy=proj[5]*H/2;px=(1-proj[8])*W/2;py=(1+proj[9])*H/2;drawn=0;drawBackground(now);
 surface=0;for(const m of relief)drawMesh(m,0,0,0,'terrain');
 if(swCity){const range=clamp(1350+camera.position.y*1.55,1350,5200),a=localById.get(selId);
  if(swCity.far&&settings.buildings){for(const m of swCity.far(camera.position.x,camera.position.z,clamp(3900+camera.position.y*2,3900,6000)))drawMesh(m);}
  const pieces=swCity.near(camera.position.x,camera.position.z,range,28);
  if(Math.hypot(camera.position.x-a.x,camera.position.z-a.z)<4200)pieces.push(...swCity.near(a.x,a.z,1250,32));
  const tiles=new Map();for(const m of pieces){const key=m.id.split('/')[0];if(!tiles.has(key)||m.id<tiles.get(key).id)tiles.set(key,m);}
  const parts=[...tiles.values()];for(const m of parts){const o=m.origin||[0,0,0];drawMesh(m,o[0],o[1],o[2]);}swCity.paintCpuTrees?.({parts,camera,fx,fy,px,py,width:W,height:H,pixels,depth,day,night,wet,snow,haze,horizon});}
 for(const [id,p] of localById){const distance=Math.hypot(camera.position.x-p.x,camera.position.z-p.z);if(distance<(id===selId?18000:clamp(p.lm.height*19,1500,10000))&&p.mesh)drawMesh(p.mesh,p.x,0,p.z,id===selId?'hero':'landmark');}
 ctx.putImageData(buffer,0,0);if(wet||snow){ctx.save();ctx.strokeStyle='rgba(198,217,233,.56)';ctx.fillStyle='rgba(242,245,249,.87)';ctx.lineWidth=Math.max(.6,W/1380);ctx.beginPath();const num=Math.round(W*H/1400);for(let i=0;i<num;i++){const x=((i*167.391+Math.sin(i)*81+now*(snow?.014:-.08))%(W+25)+W+25)%(W+25)-12,y=(i*107.79+now*(snow?.045:.46)*(1+(i%7)*.05))%H;if(wet){ctx.moveTo(x,y);ctx.lineTo(x-2,y+6+i%7);}else{ctx.moveTo(x+1,y);ctx.arc(x,y,.6+i%3*.4,0,Math.PI*2);}}if(snow)ctx.fill();else ctx.stroke();ctx.restore();}
 frameTime=mix(frameTime,performance.now()-begin,.2);canvas.dataset.cpuTriangles=drawn;canvas.dataset.renderMs=Math.round(frameTime);}
 await select(selId);localById.get(selId).mesh=active;
 const tasks=[loadCpuRelief(project).then(x=>{relief=x;serial++;}),createCpuCity({project,landmarks}).then(c=>{swCity=c;for(const [k,v] of Object.entries(settings))c.setLayer?.(k,v);serial++;})];
 async function bring(id){const m=await load(id);localById.get(id).mesh=m;serial++;return m;}
 for(const p of landmarks)if(p.id!==selId)setTimeout(()=>bring(p.id).catch(console.warn),400+250*landmarks.indexOf(p));
 const complete=Promise.allSettled(tasks).then(r=>{r.forEach(x=>{if(x.status==='rejected')console.warn(x.reason)});return {city:!!swCity,terrain:relief.length>0};});
 return {render,complete,async select(id){await select(id);localById.get(id).mesh=await load(id);},get stats(){return swCity?.stats},isBlocked:(x,z,r)=>swCity?.isBlocked(x,z,r)||false,setLayer(k,v){settings[k]=v;swCity?.setLayer?.(k,v);serial++;},groundAt(x,z){return relief.groundAt?.(x,z)||0;},get ready(){return !!swCity}};
}
