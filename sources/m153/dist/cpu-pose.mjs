// MediaPipe person detector and landmark geometry, adapted from OpenCV Zoo (Apache-2.0).
const anchors=[];for(const [n,b] of [[28,2],[14,2],[7,6]])for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(let i=0;i<b;i++)anchors.push([(x+.5)/n,(y+.5)/n]);
const sigmoid=x=>1/(1+Math.exp(-x));
let runtime;
async function getOrt(){if(!runtime)runtime=new Promise((ok,no)=>{const script=document.createElement('script');script.src=new URL('./assets/cpu/ort.wasm.min.js',import.meta.url).href;script.onload=()=>ok(window.ort);script.onerror=()=>{runtime=null;no(Error('CPU 推理组件加载失败，请重试。'));};document.head.append(script);});return runtime;}
function surface(n){const c=document.createElement('canvas');c.width=c.height=n;return c.getContext('2d',{willReadFrequently:true});}
export async function cpuModel(){
  const ort=await getOrt();ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;ort.env.wasm.wasmPaths=new URL('./assets/cpu/',import.meta.url).href;
  const options={executionProviders:['wasm'],graphOptimizationLevel:'all'};
  const [det,pose]=await Promise.all(['person','pose'].map(name=>ort.InferenceSession.create(new URL('./assets/cpu/'+name+'.onnx',import.meta.url).href,options)));
  const a=surface(224),b=surface(256),detData=new Float32Array(224*224*3),poseData=new Float32Array(256*256*3);
  const dTensor=new ort.Tensor('float32',detData,[1,3,224,224]),pTensor=new ort.Tensor('float32',poseData,[1,256,256,3]);
  let count=0,previous=[];
  async function detect(c){
    const w=c.width,h=c.height,scale=224/Math.max(w,h),dx=(224-w*scale)/2,dy=(224-h*scale)/2;
    a.fillStyle='#808080';a.fillRect(0,0,224,224);a.drawImage(c,dx,dy,w*scale,h*scale);const img=a.getImageData(0,0,224,224).data,N=224*224;
    for(let i=0;i<N;i++)for(let j=0;j<3;j++)detData[j*N+i]=img[i*4+j]/127.5-1;
    const out=await det.run({[det.inputNames[0]]:dTensor});const tensors=Object.values(out),scores=tensors.find(o=>o.data.length===2254).data,regs=tensors.find(o=>o.data.length===2254*12).data,list=[];
    for(let i=0;i<2254;i++){if(scores[i]<-.12)continue;const j=i*12,ax=anchors[i][0]*224,ay=anchors[i][1]*224;
      const x=(regs[j+4]+ax-dx)/scale,y=(regs[j+5]+ay-dy)/scale,topX=(regs[j+6]+ax-dx)/scale,topY=(regs[j+7]+ay-dy)/scale;
      const r=Math.hypot(topX-x,topY-y);if(r<4)continue;list.push({x,y,r,angle:Math.atan2(topX-x,y-topY),score:scores[i]});}
    const kept=[];for(const o of list.sort((a,b)=>b.score-a.score)){if(kept.some(q=>Math.hypot(q.x-o.x,q.y-o.y)<Math.min(q.r,o.r)*.53))continue;kept.push(o);if(kept.length===4)break;}return kept;
  }
  async function landmark(c,roi){
    const {x,y,r,angle}=roi,scale=128/r;
    b.setTransform(1,0,0,1,0,0);b.fillStyle='#000';b.fillRect(0,0,256,256);b.translate(128,128);b.rotate(-angle);b.scale(scale,scale);b.translate(-x,-y);b.drawImage(c,0,0);b.resetTransform();
    const img=b.getImageData(0,0,256,256).data;for(let i=0;i<65536;i++){poseData[3*i]=img[4*i]/255;poseData[3*i+1]=img[4*i+1]/255;poseData[3*i+2]=img[4*i+2]/255;}
    const outputs=Object.values(await pose.run({[pose.inputNames[0]]:pTensor}));if(outputs.find(v=>v.data.length===1).data[0]<.48)return null;
    const raw=outputs.find(v=>v.data.length===195).data,cos=Math.cos(angle),sin=Math.sin(angle),points=[];
    for(let i=0;i<33;i++){const off=i*5,u=(raw[off]-128)/scale,v=(raw[off+1]-128)/scale;points.push({x:(x+cos*u-sin*v)/c.width,y:(y+sin*u+cos*v)/c.height,z:raw[off+2]/scale/c.width,visibility:Math.min(sigmoid(raw[off+3]),sigmoid(raw[off+4]))});}return points;
  }
  return{async detectForVideo(c){let rois=(++count%5===1||!previous.length)?await detect(c):previous;const landmarks=[],next=[];
    for(const roi of rois){const pts=await landmark(c,roi);if(!pts)continue;landmarks.push(pts);
      const x=(pts[23].x+pts[24].x)*.5*c.width,y=(pts[23].y+pts[24].y)*.5*c.height;
      const radius=Math.max(...pts.filter(p=>p.visibility>.5).map(p=>Math.hypot(p.x*c.width-x,p.y*c.height-y)));
      next.push({...roi,x:x*.4+roi.x*.6,y:y*.4+roi.y*.6,r:Math.min(roi.r*1.1,Math.max(roi.r*.97,radius*1.10))});}
    previous=next;return{landmarks};},close(){det.release();pose.release();}};
}
