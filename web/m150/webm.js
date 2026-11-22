/* All-intra VP8 WebM. Frame timestamps come from the tour clock, not the device frame rate. */
(()=>{'use strict';const U=Uint8Array;
function uint(n){const a=[];do{a.unshift(n%256);n=Math.floor(n/256);}while(n>0);return new U(a);}
function size(n){let len=1;while(n>=2**(7*len)-1)len++;const out=new U(len);for(let i=len-1;i>=0;i--){out[i]=n%256;n=Math.floor(n/256);}out[0]|=1<<(8-len);return out;}
function el(id,data){let parts=Array.isArray(data)?data:[data];const len=parts.reduce((v,p)=>v+(p.size??p.byteLength),0);return new Blob([uint(id),size(len),...parts]);}
const num=(id,n)=>el(id,uint(n)),str=(id,s)=>el(id,new TextEncoder().encode(s)),float=(id,x)=>{let b=new ArrayBuffer(8);new DataView(b).setFloat64(0,x);return el(id,b);};
async function vp8(canvas){const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('浏览器未能生成视频帧')),'image/webp',.89)),b=new U(await blob.arrayBuffer()),dv=new DataView(b.buffer);for(let pos=12;pos+8<=b.length;){let four=String.fromCharCode(...b.subarray(pos,pos+4)),n=dv.getUint32(pos+4,true);if(four==='VP8 ')return b.slice(pos+8,pos+8+n);pos+=8+n+(n&1);}throw Error('此浏览器缺少 VP8 图片编码，请使用桌面版 Chrome 或 Edge。');}
function mux(frames,w,h,fps){const header=el(0x1a45dfa3,[num(0x4286,1),num(0x42f7,1),num(0x42f2,4),num(0x42f3,8),str(0x4282,'webm'),num(0x4287,2),num(0x4285,2)]);
const info=el(0x1549a966,[num(0x2ad7b1,1000000),str(0x4d80,'Isle Twin Studio'),str(0x5741,'Isle Twin Studio'),float(0x4489,frames.length*1000/fps)]);
const track=el(0x1654ae6b,el(0xae,[num(0xd7,1),num(0x73c5,1),num(0x83,1),num(0x23e383,Math.round(1e9/fps)),str(0x86,'V_VP8'),el(0xe0,[num(0xb0,w),num(0xba,h)])]));
let clusters=[],blocks=[],start=0;function flush(){if(blocks.length)clusters.push(el(0x1f43b675,[num(0xe7,start),...blocks]));blocks=[];}
frames.forEach((frame,i)=>{let t=Math.round(i*1000/fps);if(t-start>=5000){flush();start=t;}let d=t-start;blocks.push(el(0xa3,[new U([129,(d>>8)&255,d&255,128]),frame]));});flush();return new Blob([header,el(0x18538067,[info,track,...clusters])],{type:'video/webm'});}
window.TwinVideo={vp8,mux};})();
