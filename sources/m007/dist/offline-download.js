const BASE=new URL('./downloads/',import.meta.url);
export async function assembleOfflinePackage(onProgress=()=>{},fetcher=fetch){
 const response=await fetcher(new URL('source-manifest.json',BASE));
 if(!response.ok)throw new Error('请从在线工作台下载最新的完整离线包。');
 const manifest=await response.json(),buffers=[];
 for(const [index,part] of manifest.parts.entries()){
  onProgress(index,manifest.parts.length);
  const result=await fetcher(new URL(part.file,BASE));
  if(!result.ok)throw new Error('下载中断，请重试。');
  const bytes=await result.arrayBuffer();
  if(bytes.byteLength!==part.bytes)throw new Error('文件传输不完整，请重试。');
  if(globalThis.crypto?.subtle){
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
   if(hash!==part.sha256)throw new Error('文件校验失败，请刷新页面重试。');
  }
  buffers.push(bytes);
 }
 onProgress(manifest.parts.length,manifest.parts.length);
 return {name:manifest.name,blob:new Blob(buffers,{type:'application/zip'})};
}

const button=globalThis.document?.getElementById('downloadPackage');
button?.addEventListener('click',async()=>{
 const status=document.getElementById('downloadStatus');button.disabled=true;
 try{
  const {name,blob}=await assembleOfflinePackage((n,total)=>{status.textContent='正在下载 '+n+' / '+total+'，请保持页面打开…';});
  const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='完整 ZIP 已准备好，请解压后双击「启动训练系统.bat」。';
 }catch(error){status.textContent=error.message;}
 finally{button.disabled=false;}
});
