'use strict';
importScripts('vendor/ort/ort.wasm.min.js','detector.js');
let detector,epoch=0;
const message=(id,type,data={})=>postMessage({id,type,...data});
async function loadModel(id){
  ort.env.wasm.numThreads=1;
  ort.env.wasm.wasmPaths=new URL('vendor/ort/',self.location.href).href;
  const response=await fetch(new URL('models/yolox/yolox_tiny.onnx',self.location.href));
  if(!response.ok)throw new Error(`检测模型下载失败（HTTP ${response.status}）`);
  const total=Number(response.headers.get('content-length'))||20219662,parts=[];let count=0;
  if(response.body?.getReader){const reader=response.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;parts.push(value);count+=value.byteLength;message(id,'progress',{stage:'download',percent:Math.min(100,Math.round(count/total*100))})}}
  else{parts.push(new Uint8Array(await response.arrayBuffer()));count=parts[0].length}
  const bytes=new Uint8Array(count);let at=0;for(const p of parts){bytes.set(p,at);at+=p.length}
  message(id,'progress',{stage:'initialize'});
  const session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  detector=new FramewiseDetector.Detector(session,ort);message(id,'ready',{backend:'WASM'});
}
self.onmessage=async({data})=>{
  const {id,type}=data;
  if(type==='cancel'){epoch++;return}
  try{
    if(type==='init'){await loadModel(id);return}
    if(type==='detect'){
      if(!detector)throw new Error('检测模型尚未就绪');const token=epoch;
      try{const result=await detector.detect(data.image,data.options,p=>message(id,'progress',{stage:'detect',...p}),()=>token!==epoch);message(id,'result',{result})}finally{data.image.close?.()}
    }
  }catch(error){message(id,'error',{error:error.message||String(error),name:error.name})}
};
