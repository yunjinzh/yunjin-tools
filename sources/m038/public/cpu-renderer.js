/* Real triangle rasterization fallback: depth buffer, perspective UVs, alpha and lighting. */
const geometryCache=new Map(),textureCache=new Map();
const srgb=(x)=>Math.round(Math.max(0,Math.min(1,x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055))*255);
self.onmessage=({data:d})=>{try{
 for(const g of d.geometries)geometryCache.set(g.id,g);for(const t of d.textures)textureCache.set(t.id,t);
 const W=d.width,H=d.height,canvas=new OffscreenCanvas(W,H),ctx=canvas.getContext('2d');
 if(d.background){ctx.fillStyle=d.background;ctx.fillRect(0,0,W,H);const grad=ctx.createRadialGradient(W*.5,H*.7,1,W*.5,H*.7,W*.33);grad.addColorStop(0,'rgba(32,42,62,.1)');grad.addColorStop(1,'rgba(32,42,62,0)');ctx.save();ctx.translate(0,H*.525);ctx.scale(1,.25);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.restore();}
 if(d.lines?.length){ctx.strokeStyle='rgba(125,140,165,.23)';ctx.lineWidth=.6;ctx.beginPath();for(const l of d.lines){ctx.moveTo((l[0]*.5+.5)*W,(.5-l[1]*.5)*H);ctx.lineTo((l[2]*.5+.5)*W,(.5-l[3]*.5)*H);}ctx.stroke();}
 const image=ctx.getImageData(0,0,W,H),pixels=image.data,depth=new Float32Array(W*H);depth.fill(Infinity);
 const translucent=m=>m.materials.some(material=>material.opacity<.98);
 const meshes=d.meshes.sort((a,b)=>a.order-b.order||Number(translucent(a))-Number(translucent(b)));
 for(const mesh of meshes){const g=geometryCache.get(mesh.id);if(!g)continue;const p=g.positions,n=g.normals,uv=g.uv,index=g.index,count=p.length/3;const world=mesh.matrix,v=d.vp;const projected=new Float32Array(count*6);
 for(let i=0;i<count;i++){const j=i*3;const x=p[j],y=p[j+1],z=p[j+2];const X=world[0]*x+world[4]*y+world[8]*z+world[12],Y=world[1]*x+world[5]*y+world[9]*z+world[13],Z=world[2]*x+world[6]*y+world[10]*z+world[14];const w=v[3]*X+v[7]*Y+v[11]*Z+v[15];const q=i*6;projected[q]=((v[0]*X+v[4]*Y+v[8]*Z+v[12])/w*.5+.5)*W;projected[q+1]=(0.5-(v[1]*X+v[5]*Y+v[9]*Z+v[13])/w*.5)*H;projected[q+2]=(v[2]*X+v[6]*Y+v[10]*Z+v[14])/w;projected[q+3]=1/w;
 const nx=n[j],ny=n[j+1],nz=n[j+2];const l=.36+Math.max(0,nx*.34+ny*.78+nz*.52)*.64+Math.max(0,-nx*.6+ny*.3-nz*.7)*.15;projected[q+4]=l;projected[q+5]=w;}
 let gi=0;const groups=mesh.groups;
 for(let t=0;t<index.length;t+=3){while(groups.length&&gi<groups.length-1&&t>=groups[gi].start+groups[gi].count)gi++;const material=mesh.materials[groups.length?groups[gi].materialIndex:0]||mesh.materials[0];if(material.opacity<.03)continue;
 const i0=index[t],i1=index[t+1],i2=index[t+2],a=i0*6,b=i1*6,c=i2*6;if(projected[a+5]<=0||projected[b+5]<=0||projected[c+5]<=0)continue;
 const ax=projected[a],ay=projected[a+1],bx=projected[b],by=projected[b+1],cx=projected[c],cy=projected[c+1];
 const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))),minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));if(minX>maxX||minY>maxY)continue;
 const denom=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(denom)<.001)continue;const inv=1/denom;
 const tex=material.map?textureCache.get(material.map):null,col=material.color;const zBias=mesh.order?-.000012-mesh.order*.0000005:0;const tm=material.transform;
 for(let y=minY;y<=maxY;y++){const py=y+.5;for(let x=minX;x<=maxX;x++){const px=x+.5;const wa=((by-cy)*(px-cx)+(cx-bx)*(py-cy))*inv;if(wa<-.001)continue;const wb=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))*inv;if(wb<-.001)continue;const wc=1-wa-wb;if(wc<-.001)continue;
 const z=wa*projected[a+2]+wb*projected[b+2]+wc*projected[c+2]+zBias;const offset=y*W+x;if(z>depth[offset]+.000001)continue;
 let alpha=material.opacity,rr=col[0],gg=col[1],bb=col[2];const light=(wa*projected[a+4]+wb*projected[b+4]+wc*projected[c+4])*Math.sqrt(d.exposure);
 if(tex){const q=wa*projected[a+3]+wb*projected[b+3]+wc*projected[c+3];let U=(wa*uv[i0*2]*projected[a+3]+wb*uv[i1*2]*projected[b+3]+wc*uv[i2*2]*projected[c+3])/q;let V=(wa*uv[i0*2+1]*projected[a+3]+wb*uv[i1*2+1]*projected[b+3]+wc*uv[i2*2+1]*projected[c+3])/q;
 if(tm){const u=tm[0]*U+tm[3]*V+tm[6],v=tm[1]*U+tm[4]*V+tm[7];U=u;V=v;}if(material.flipY)V=1-V;U=Math.max(0,Math.min(.999999,U));V=Math.max(0,Math.min(.999999,V));const ti=(Math.floor(V*tex.height)*tex.width+Math.floor(U*tex.width))*4;alpha*=tex.data[ti+3]/255;if(alpha<.025)continue;rr*=Math.pow(tex.data[ti]/255,2.2);gg*=Math.pow(tex.data[ti+1]/255,2.2);bb*=Math.pow(tex.data[ti+2]/255,2.2);}
 const k=offset*4;let r=srgb(rr*light),gr=srgb(gg*light),bl=srgb(bb*light);if(alpha>=.98){pixels[k]=r;pixels[k+1]=gr;pixels[k+2]=bl;pixels[k+3]=255;depth[offset]=z;}else{pixels[k]=r*alpha+pixels[k]*(1-alpha);pixels[k+1]=gr*alpha+pixels[k+1]*(1-alpha);pixels[k+2]=bl*alpha+pixels[k+2]*(1-alpha);pixels[k+3]=Math.min(255,255*alpha+pixels[k+3]*(1-alpha));if(!mesh.order&&material.depthWrite!==false)depth[offset]=z;}
 }}
 }
 }
 const active=new Set(d.meshes.map(m=>m.id));for(const id of geometryCache.keys())if(!active.has(id))geometryCache.delete(id);
 ctx.putImageData(image,0,0);const bitmap=canvas.transferToImageBitmap();self.postMessage({bitmap,seq:d.seq},[bitmap]);
 }catch(e){self.postMessage({error:e.message,seq:d.seq});}};
