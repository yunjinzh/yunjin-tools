import * as M from './assets/media.mjs';
import {makeStage} from './figure.mjs';
const wait=()=>new Promise(r=>setTimeout(r,0));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const roundEven=n=>Math.max(2,2*Math.round(n/2));
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function inspect(blob){
  const input=new M.Input({source:new M.BlobSource(blob),formats:M.ALL_FORMATS});
  try{
    const video=await input.getPrimaryVideoTrack();if(!video)throw Error('文件里没有可读取的视频轨道。');
    const audio=await input.getPrimaryAudioTrack();
    const start=Math.max(0,await video.getFirstTimestamp()),end=await video.computeDuration();
    if(!(end>start))throw Error('视频时长无效或文件尚未写入完整。');
    const fps=(await video.computePacketStats(100)).averagePacketRate;
    return{input,video,audio,start,duration:end-start,w:video.displayWidth,h:video.displayHeight,fps:Number.isFinite(fps)&&fps>0?fps:30};
  }catch(e){input.dispose();throw e;}
}
async function model(){
  const test=document.createElement('canvas'),gl=test.getContext('webgl2');
  if(!gl)return (await import('./cpu-pose.mjs')).cpuModel();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  try{const {FilesetResolver,PoseLandmarker}=await import('./assets/pose.mjs');
  const files=await FilesetResolver.forVisionTasks(new URL('assets/wasm',import.meta.url).href);
  return await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('assets/pose.task',import.meta.url).href,delegate:'CPU'},runningMode:'VIDEO',numPoses:4,minPoseDetectionConfidence:.46,minTrackingConfidence:.50,minPosePresenceConfidence:.48});}catch{return (await import('./cpu-pose.mjs')).cpuModel();}
}
function candidate(points,ctx,aspect){
  const pack=points.map(p=>[+p.x.toFixed(5),+p.y.toFixed(5),+p.z.toFixed(5),+(p.visibility??1).toFixed(3)]);
  const core=[11,12,23,24].map(i=>pack[i]);const x=core.reduce((a,p)=>a+p[0]/4,0),y=core.reduce((a,p)=>a+p[1]/4,0);
  const len=Math.max(.035,Math.hypot((core[0][0]-core[2][0])*aspect,core[0][1]-core[2][1]));
  const {width:w,height:h}=ctx.canvas, xx=Math.round(x*w),yy=Math.round(y*h);
  const rgb=Array.from(ctx.getImageData(clamp(xx-2,0,w-5),clamp(yy-2,0,h-5),5,5).data);
  const color=[0,1,2].map(i=>rgb.filter((_,j)=>j%4===i).reduce((a,b)=>a+b,0)/(25*255));
  const vis=pack.filter(p=>p[3]>.45);const range=(axis,fn)=>fn(...vis.map(p=>p[axis]));
  const box=vis.length?[clamp(range(0,Math.min)-.025,0,1),clamp(range(1,Math.min)-.025,0,1),clamp(range(0,Math.max)+.025,0,1),clamp(range(1,Math.max)+.025,0,1)]:[x-.1,y-.15,x+.1,y+.15];
  return{pose:pack,x,y,len,color,box};
}
function identify(options,last,elapsed,ar){
  const ranked=options.map(o=>{const distance=Math.hypot((last.x-o.x)*ar,last.y-o.y)/Math.max(last.len,o.len);
    const appearance=Math.hypot(...last.color.map((v,i)=>v-o.color[i])); const size=Math.abs(Math.log(o.len/last.len));return {o,score:distance+size*.48+appearance*.61,distance,appearance};
  }).sort((a,b)=>a.score-b.score);
  const m=ranked[0];if(!m||m.distance>Math.min(2.0,.83+elapsed*.75)||(elapsed>.5&&m.appearance>.9))return null;
  return m.o;
}
export function findFrame(frames,t){
  let lo=0,hi=frames.length;while(lo<hi){const mid=(lo+hi)>>>1;if(frames[mid].t<=t+.00001)lo=mid+1;else hi=mid;}return Math.max(0,lo-1);
}
async function* framesOf(meta,blob,start,signal){
  const shrink=Math.min(1,640/Math.max(meta.w,meta.h));const w=roundEven(meta.w*shrink),h=roundEven(meta.h*shrink);
  if(await meta.video.canDecode()){
    const sink=new M.CanvasSink(meta.video,{width:w,height:h,fit:'fill',poolSize:3});
    for await(const frame of sink.canvases(Math.max(0,meta.start+start-.00001))){signal?.throwIfAborted();yield{canvas:frame.canvas,t:frame.timestamp-meta.start,d:frame.duration};}return;
  }
  // A platform media element can support codecs missing from WebCodecs; seek at the source's actual presentation times.
  const video=document.createElement('video'),url=URL.createObjectURL(blob);video.preload='auto';video.muted=true;video.playsInline=true;
  function event(name,invoke){return new Promise((resolve,reject)=>{let id;const finish=err=>{clearTimeout(id);video.removeEventListener(name,ok);video.removeEventListener('error',bad);err?reject(err):resolve();};
    const ok=()=>finish(),bad=()=>finish(Error('浏览器无法解码此视频。请使用 H.264 MP4，或在服务器版中处理该素材。'));
    video.addEventListener(name,ok,{once:true});video.addEventListener('error',bad,{once:true});id=setTimeout(bad,10000);invoke();});}
  try{
    await event('loadeddata',()=>{video.src=url;});
    const times=[];for await(const p of new M.EncodedPacketSink(meta.video).packets(undefined,undefined,{metadataOnly:true})){if(p.timestamp>=meta.start+start-.00001)times.push(p.timestamp);}
    const ordered=[...new Set(times)].sort((a,b)=>a-b); const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
    for(let i=0;i<ordered.length;i++){signal?.throwIfAborted();const t=ordered[i], d=(ordered[i+1]??(meta.start+meta.duration))-t;
      const seek=Math.max(0,t+Math.min(.002,d/3));if(Math.abs(video.currentTime-seek)>.0001)await event('seeked',()=>{video.currentTime=seek;});ctx.drawImage(video,0,0,w,h);yield{canvas:c,t:t-meta.start,d};}
  }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
export async function extract(meta,blob,state,hooks){
  const saved=state.frames??[];const from=saved.length?saved.at(-1).t+Math.max(.0001,saved.at(-1).d*.45):0;
  let last=state.last??null,lastSeen=state.lastSeen??0,lastDisplay=-100,lastSave=performance.now(),count=0;state.frames=saved;
  const pose=await model();const source=document.createElement('canvas');const ctx=source.getContext('2d',{willReadFrequently:true});
  try{
    for await(const frame of framesOf(meta,blob,from,hooks.signal)){
      hooks.signal?.throwIfAborted();if(frame.t<from-.00001||frame.t>=meta.duration||!Number.isFinite(frame.t))continue;
      if(source.width!==frame.canvas.width||source.height!==frame.canvas.height){source.width=frame.canvas.width;source.height=frame.canvas.height;}
      ctx.drawImage(frame.canvas,0,0);const res=await pose.detectForVideo(source,Math.max(0,frame.t*1000));
      const candidates=res.landmarks.map(p=>candidate(p,ctx,meta.w/meta.h));let hit;
      if(last){hit=identify(candidates,last,frame.t-lastSeen,meta.w/meta.h);}
      else if(candidates.length){hit=candidates[candidates.length===1?0:await hooks.choose(source,candidates.map(c=>c.box),frame.t)];}
      if(hit){lastSeen=frame.t;const {pose:p,box,...descriptor}=hit;last=descriptor;}
      const low=hit&&[11,12,13,14,15,16,23,24,25,26,27,28].filter(i=>hit.pose[i][3]<.48).length>=3;
      const item={t:Math.max(0,frame.t),d:frame.d>0?frame.d:1/meta.fps,p:hit?.pose??null,q:!hit?'missing':low?'low':''};
      saved.push(item);state.last=last;state.lastSeen=lastSeen;
      if(performance.now()-lastDisplay>130||saved.length===1){hooks.preview(item,source);lastDisplay=performance.now();await wait();}
      if(performance.now()-lastSave>2800){await hooks.checkpoint(state);lastSave=performance.now();}
      if(++count%4===0)await wait();
    }
    if(!saved.some(f=>f.p))throw Error('整段视频未识别到人体。请选用人物清晰、身体大部分入镜的片段。');
    if(!saved.length||saved.at(-1).t+Math.max(saved.at(-1).d,1/meta.fps)<meta.duration-.15)throw Error('视频解码提前中止。请检查原文件能否完整播放。');
    for(let i=0;i<saved.length;i++){if(saved[i].p)continue;let j=i;while(j<saved.length&&!saved[j].p)j++;
      const prev=saved[i-1],next=saved[j];if(prev&&next&&next.t-prev.t<=.28){for(let k=i;k<j;k++){const mix=(saved[k].t-prev.t)/(next.t-prev.t);saved[k].p=prev.p.map((a,n)=>a.map((v,idx)=>v+(next.p[n][idx]-v)*mix));saved[k].q='fill';}}i=j-1;}
    state.complete=true;await hooks.checkpoint(state);return state;
  }finally{pose.close();}
}
export function warnings(frames){const groups=[];for(const f of frames){if(!f.q)continue;const p=groups.at(-1);
  if(p&&f.q===p.reason&&f.t-p.end<.04)p.end=f.t+f.d;else groups.push({start:f.t,end:f.t+f.d,reason:f.q});}return groups;}
let hmeReady;
async function hme(){return hmeReady??=(new Promise((ok,no)=>{const s=document.createElement('script');s.src=new URL('./assets/h264.js',import.meta.url).href;s.onload=()=>ok(window.HME);s.onerror=()=>{hmeReady=null;no(Error('软件编码器加载失败，请重新导出。'));};document.head.append(s);}));}
async function addAudio(output,meta,enabled){
  const a=meta.audio;if(!enabled||!a)return async()=>{};
  if(a.codec&&output.format.getSupportedAudioCodecs().includes(a.codec)){
    const source=new M.EncodedAudioPacketSource(a.codec);output.addAudioTrack(source);const config=await a.getDecoderConfig();
    return async()=>{let first=true;for await(const p of new M.EncodedPacketSink(a).packets()){const t=p.timestamp-meta.start;if(t+p.duration<=0||t>=meta.duration)continue;
      await source.add(p.clone({timestamp:Math.max(0,t),duration:Math.min(t+p.duration,meta.duration)-Math.max(0,t)}),first&&config?{decoderConfig:config}:undefined);first=false;}source.close();};
  }
  if(!await a.canDecode()||!await M.canEncodeAudio('aac',{sampleRate:a.sampleRate,numberOfChannels:a.numberOfChannels}))throw Error('当前浏览器不能转换这条音轨。可关闭“保留原声”，直接复用动作导出静音版。');
  const src=new M.AudioSampleSource({codec:'aac',bitrate:128000});output.addAudioTrack(src);
  return async()=>{for await(const sample of new M.AudioSampleSink(a).samples(meta.start,meta.start+meta.duration)){try{sample.setTimestamp(Math.max(0,sample.timestamp-meta.start));await src.add(sample);}finally{sample.close();}}src.close();};
}
export async function encode(meta,state,settings,progress,signal){
  const ratio=Math.min(1,settings.size/Math.min(meta.w,meta.h),settings.size*16/9/Math.max(meta.w,meta.h));
  const w=roundEven(meta.w*ratio),h=roundEven(meta.h*ratio);
  const canvas=document.createElement('canvas');const scene=makeStage(canvas,w,h);
  const out=new M.Output({format:new M.Mp4OutputFormat({fastStart:'in-memory'}),target:new M.BufferTarget()});
  const frames=state.frames,bitrate=Math.round(Math.max(700000,w*h*3.3));let enc,native,src,softIn; 
  try{
    native=await M.canEncodeVideo('avc',{width:w,height:h,bitrate});
    if(native){src=new M.CanvasSource(canvas,{codec:'avc',bitrate,latencyMode:'realtime'});}
    else{src=new M.EncodedVideoPacketSource('avc');enc=await (await hme()).createH264MP4Encoder();enc.width=w;enc.height=h;enc.frameRate=clamp(Math.round(meta.fps),1,120);enc.kbps=Math.round(bitrate/1000);enc.groupOfPictures=enc.frameRate;enc.initialize();}
    out.addVideoTrack(src);const writeAudio=await addAudio(out,meta,settings.audio);await out.start();
    const copy=document.createElement('canvas');copy.width=w;copy.height=h;const ctx=enc?copy.getContext('2d',{willReadFrequently:true}):null;
    for(let i=0;i<frames.length;i++){signal?.throwIfAborted();const f=frames[i],d=(frames[i+1]?.t??meta.duration)-f.t;if(d<=0)continue;scene.draw([f.p],settings.bg);
      if(native)await src.add(f.t,d);else{ctx.drawImage(canvas,0,0);enc.addFrameRgba(ctx.getImageData(0,0,w,h).data);}
      if(i%4===0){progress(.90*(i+1)/frames.length);await wait();}}
    if(enc){enc.finalize();const bytes=enc.FS.readFile(enc.outputFilename).slice();softIn=new M.Input({source:new M.BufferSource(bytes),formats:M.ALL_FORMATS});const track=await softIn.getPrimaryVideoTrack();const conf=await track.getDecoderConfig();let i=0;
      for await(const packet of new M.EncodedPacketSink(track).packets()){const f=frames[i];if(!f)throw Error('软件编码时间轴校验失败。');await src.add(packet.clone({timestamp:f.t,duration:(frames[i+1]?.t??meta.duration)-f.t}),i===0?{decoderConfig:conf}:undefined);i++;}
      if(i!==frames.length)throw Error('成片帧数不完整，请重新导出。');}
    src.close();await writeAudio();progress(.96);await out.finalize();
    const blob=new Blob([out.target.buffer],{type:'video/mp4'});const check=await inspect(blob);
    try{if(check.video.codec!=='avc'||Math.abs(check.duration-meta.duration)>Math.max(.05,1/meta.fps)||check.w!==w||check.h!==h||!!check.audio!==!!(settings.audio&&meta.audio))throw Error('成片完整性校验失败，请重试导出。');
      if(await check.video.canDecode()){const sink=new M.CanvasSink(check.video,{width:64,poolSize:1});if(!await sink.getCanvas(check.start)||!await sink.getCanvas(check.start+check.duration-Math.min(.002,check.duration/2)))throw Error('成片首尾解码校验失败。');}
    }finally{check.input.dispose();}progress(1);return blob;
  }finally{if(out.state==='started')await out.cancel().catch(()=>{});enc?.delete();softIn?.dispose();scene.dispose();}
}
