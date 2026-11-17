/* Real raster snapshots and bounded network reads. */
(function(root){
'use strict';
async function boundedFetch(url,{signal,timeoutMs=25000,attempts=2,onRetry=()=>{}}={},fetcher=fetch){
 let last;
 for(let attempt=1;attempt<=attempts;attempt++){
  if(signal?.aborted)throw new DOMException('已取消','AbortError');
  const local=new AbortController(),abort=()=>local.abort(signal.reason);signal?.addEventListener('abort',abort,{once:true});let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;local.abort()},timeoutMs);
  try{
   const response=await fetcher(url,{signal:local.signal});
   if(!response.ok){const e=Error('HTTP '+response.status);e.retryable=response.status===408||response.status===429||response.status>=500;throw e}
   const bytes=await response.arrayBuffer();return new Response(bytes,{status:response.status,headers:response.headers});
  }catch(e){
   if(signal?.aborted)throw new DOMException('已取消','AbortError');
   last=Error(timedOut?'请求超时':e.message||'网络连接失败');
   if(e.retryable===false||attempt===attempts)throw last;
   onRetry(attempt,last);
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
 }
 throw last;
}
async function unpack(encoded){
 if(typeof DecompressionStream==='undefined')throw Error('此浏览器不支持内置数据解压，请使用较新的 Chrome 或 Edge');
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}
function covers(grid,bbox){return grid.bbox[0]<=bbox[0]&&grid.bbox[1]<=bbox[1]&&grid.bbox[2]>=bbox[2]&&grid.bbox[3]>=bbox[3]}
function crop(grid,bbox){
 if(!covers(grid,bbox))throw Error('内置数据没有覆盖完整边界，请切换实时读取');
 const [a,b,c,d]=grid.bbox,dx=(c-a)/grid.width,dy=(d-b)/grid.height;
 const x0=Math.max(0,Math.floor((bbox[0]-a)/dx)),x1=Math.min(grid.width,Math.ceil((bbox[2]-a)/dx)),y0=Math.max(0,Math.floor((d-bbox[3])/dy)),y1=Math.min(grid.height,Math.ceil((d-bbox[1])/dy));
 const width=x1-x0,height=y1-y0;if(width<3||height<3)throw Error('区域过小，内置快照不足 3 个采样单元，请切换实时读取');
 const result={...grid,width,height,bbox:[a+x0*dx,d-y1*dy,a+x1*dx,d-y0*dy],coarseCrop:true};
 for(const key of ['dem','pop'])if(grid[key]){result[key]=[];for(let y=y0;y<y1;y++)result[key].push(...grid[key].slice(y*grid.width+x0,y*grid.width+x1))}
 return result;
}
const api={boundedFetch,unpack,covers,crop};if(typeof module!=='undefined')module.exports=api;else root.RidgeData=api;
})(typeof window!=='undefined'?window:globalThis);
