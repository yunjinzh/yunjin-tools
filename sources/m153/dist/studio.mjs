export const backgrounds={studio:'#a59e92',sage:'#78857e',slate:'#394851',sand:'#b8a99a'};
const palettes={
  studio:[[118,114,109],[158,152,144],[210,203,192]],
  sage:[[89,105,98],[121,138,128],[176,187,177]],
  slate:[[48,63,73],[68,85,98],[127,143,151]],
  sand:[[141,124,109],[171,152,133],[219,202,182]]
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
export function backdrop(w,h,transparent){
  const data=new Uint8Array(w*h*4),base=new Uint8Array(data.length);
  let previous;
  function gradient(bg){
    const [top,middle,bottom]=palettes[bg]||palettes.studio;
    for(let y=0;y<h;y++){
      const v=(y+.5)/h,floor=.5+.5*Math.tanh((v-.746)/.055);
      for(let x=0;x<w;x++){
        const u=(x+.5)/w,light=4.2*(1.08-(u-.33)**2*1.5)-2*(u-.5)**2;
        const dither=(((x*47+y*97+(x*y)%31)%17)/16-.5)*.8;
        const k=(y*w+x)*4;
        for(let c=0;c<3;c++)base[k+c]=Math.round(mix(mix(top[c],middle[c],v),bottom[c],floor*.95)+light+dither);
        base[k+3]=255;
      }
    }
  }
  function shadow(cx,cy,rx,ry,opacity){
    if(rx<.5||ry<.2||opacity<=.001)return;
    const x0=Math.max(0,Math.floor(cx-rx*2.8)),x1=Math.min(w-1,Math.ceil(cx+rx*2.8));
    const y0=Math.max(0,Math.floor(cy-ry*2.8)),y1=Math.min(h-1,Math.ceil(cy+ry*2.8));
    for(let y=y0;y<=y1;y++){
      const row=opacity*Math.exp(-.5*((y-cy)/ry)**2);
      for(let x=x0;x<=x1;x++){
        const a=row*Math.exp(-.5*((x-cx)/rx)**2);if(a<.001)continue;
        const k=(y*w+x)*4;for(let c=0;c<3;c++)data[k+c]*=(1-a);
      }
    }
  }
  return {data,paint(figures,bg){
    if(transparent)return;
    if(bg!==previous||previous===undefined){gradient(bg);previous=bg;}
    data.set(base);
    for(const item of figures){if(!item)continue;
      const {feet,scale}=item,s=scale*h;
      const low=Math.max(...feet.map(v=>.5-v.y));
      const clearance=item.clearance??0;
      const ground=low+clearance;
      const cx=w*.5+h*(feet[0].x+feet[1].x)/2;
      const lift=clamp((ground-low)/scale,0,.85);
      shadow(cx+s*.09,ground*h+s*.009,s*(.23+.10*lift),s*(.035+lift*.027),.14/(1+lift*3));
      for(const foot of feet){
        const raw=.5-foot.y,gap=clamp((ground-raw)/scale,0,1);
        // Foot contact softens and disperses with clearance. A nearer foot can be lower on screen.
        const floor=raw+Math.max(0,ground-raw-.045*scale);
        const x=w*.5+h*foot.x,y=h*floor;
        shadow(x+s*.036,y,s*(.094+gap*.12),s*(.023+gap*.034),.19*Math.exp(-gap*7));
        shadow(x,y,s*(.047+gap*.04),s*(.008+gap*.024),.21*Math.exp(-gap*18));
      }
    }
  }};
}
