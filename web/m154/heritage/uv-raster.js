// A camera-space near clip retains the original UV endpoints. Interpolate UV/z
// and 1/z in screen space to keep painted details fixed while the camera moves.
const wrap=(u,mode)=>mode===1000?u-Math.floor(u):mode===1002?1-Math.abs((u-2*Math.floor(u/2))-1):Math.max(0,Math.min(1,u));
const byte=v=>v<0?0:v>255?255:v|0;
export function drawPhotographicFace(screen,clipX,clipY,inds,uv,texture,frame,light,air){
 const {W,H,fx,fy,px,py,pixels,depth}=frame;
 const poly=[];
 for(let i=0;i<3;i++){
  const j=(i+1)%3,a=inds[i],b=inds[j],za=screen[a+2],zb=screen[b+2],u=uv[i*2],v=uv[i*2+1];
  if(za>=.45)poly.push([screen[a],screen[a+1],1/za,u,v]);
  if((za>=.45)!==(zb>=.45)){
   const t=(.45-za)/(zb-za),ai=a/3,bi=b/3;
   poly.push([px+fx*(clipX[ai]+t*(clipX[bi]-clipX[ai]))/.45,py-fy*(clipY[ai]+t*(clipY[bi]-clipY[ai]))/.45,1/.45,u+t*(uv[j*2]-u),v+t*(uv[j*2+1]-v)]);
  }
 }
 for(let i=1;i+1<poly.length;i++){
  const a=poly[0],b=poly[i],c=poly[i+1],ax=a[0],ay=a[1],bx=b[0],by=b[1],cx=c[0],cy=c[1];
  const dx1=bx-ax,dx2=cx-ax,dy1=by-ay,dy2=cy-ay,det=dx1*dy2-dx2*dy1;if(Math.abs(det)<.04)continue;
  const y0=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5)),y1=Math.min(H-1,Math.floor(Math.max(ay,by,cy)-.5));
  const grad=(x,y)=>[(x*dy2-y*dy1)/det,(dx1*y-dx2*x)/det];
  const z=a[2],u=a[3]*z,v=a[4]*z,zBar=(z+b[2]+c[2])/3;
  const [zx,zy]=grad(b[2]-z,c[2]-z),[ux,uy]=grad(b[3]*b[2]-u,c[3]*c[2]-u),[vx,vy]=grad(b[4]*b[2]-v,c[4]*c[2]-v);
  const uc=(u+b[3]*b[2]+c[3]*c[2])/(3*zBar),vc=(v+b[4]*b[2]+c[4]*c[2])/(3*zBar);
  const base=texture.levels[0],footprint=Math.max(Math.hypot((ux-uc*zx)*base.w,(vx-vc*zx)*base.h),Math.hypot((uy-uc*zy)*base.w,(vy-vc*zy)*base.h))/zBar;
  const level=texture.levels[Math.min(texture.levels.length-1,Math.max(0,Math.floor(Math.log2(Math.max(1,footprint)))))],w=level.w,h=level.h,im=level.data;
  for(let y=y0;y<=y1;y++){
   const yc=y+.5;let lo=Infinity,hi=-Infinity;
   if((yc>=ay)!==(yc>=by)){const x=ax+dx1*(yc-ay)/dy1;lo=Math.min(lo,x);hi=Math.max(hi,x);}
   if((yc>=by)!==(yc>=cy)){const x=bx+(cx-bx)*(yc-by)/(cy-by);lo=Math.min(lo,x);hi=Math.max(hi,x);}
   if((yc>=cy)!==(yc>=ay)){const x=ax+dx2*(yc-ay)/dy2;lo=Math.min(lo,x);hi=Math.max(hi,x);}
   const x0=Math.max(0,Math.ceil(lo-.5)),x1=Math.min(W-1,Math.floor(hi-.5));
   let k=y*W+x0,d=z+zx*(x0+.5-ax)+zy*(yc-ay),s=u+ux*(x0+.5-ax)+uy*(yc-ay),t=v+vx*(x0+.5-ax)+vy*(yc-ay);
   for(let x=x0;x<=x1;x++,k++,d+=zx,s+=ux,t+=vx){
    if(d<depth[k])continue;
    const U=wrap(s/d,texture.repeatS)*(w-1),V=wrap(texture.flip?1-t/d:t/d,texture.repeatT)*(h-1);
    const ix=U|0,iy=V|0,j=(iy*w+ix)*4,j1=ix<w-1?j+4:j,j2=iy<h-1?j+4*w:j,j3=j2+j1-j;
    const f=U-ix,g=V-iy,a0=(1-f)*(1-g),a1=f*(1-g),a2=(1-f)*g,a3=f*g;
    if(im[j+3]*a0+im[j1+3]*a1+im[j2+3]*a2+im[j3+3]*a3<texture.alpha)continue;
    let wash=1;
    if(texture.plaster&&frame.night>.01){
     const horizontal=s/d*9,height=t/d*7;
     const pools=(1+Math.cos(horizontal*.29))*.5,above=Math.max(0,Math.min(1,height/13));
     wash=1+frame.night*(-.31+.29*(1-above)+.30*pools*(.35+.65*(1-above)));
    }
    const r=(im[j]*a0+im[j1]*a1+im[j2]*a2+im[j3]*a3)*light[0]*wash+air[0];
    const gg=(im[j+1]*a0+im[j1+1]*a1+im[j2+1]*a2+im[j3+1]*a3)*light[1]*wash+air[1];
    const bl=(im[j+2]*a0+im[j1+2]*a1+im[j2+2]*a2+im[j3+2]*a3)*light[2]*wash+air[2];
    pixels[k]=0xff000000|(byte(bl)<<16)|(byte(gg)<<8)|byte(r);depth[k]=d;
   }
  }
 }
}
