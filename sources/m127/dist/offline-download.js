(function(){
 const button=document.getElementById('downloadLocal');
 if(!button||window.RIDGE_PACKED||window.RIDGE_BUNDLE)return;
 let busy=false,ready=false;
 button.removeAttribute('download');
 button.addEventListener('click',async event=>{
  if(ready)return;
  event.preventDefault();if(busy)return;busy=true;
  const status=document.getElementById('downloadStatus');
  const message=text=>{button.textContent=text;if(status)status.textContent=text};
  try{
   const response=await RidgeData.boundedFetch('offline/manifest.json');const manifest=await response.json(),chunks=[];
   for(let i=0;i<manifest.parts.length;i++){
    message('准备本地工具 '+Math.round(i/manifest.parts.length*100)+'%…');
    const r=await RidgeData.boundedFetch(manifest.parts[i],{timeoutMs:60000,attempts:2});chunks.push(await r.arrayBuffer());
   }
   const file=new Blob(chunks,{type:'text/html;charset=utf-8'});
   if(file.size!==manifest.bytes)throw Error('下载不完整，请重试');
   const url=URL.createObjectURL(file);
   if(button.tagName==='A'){button.href=url;button.download='山川人海_本地工作台.html'}
   else{const link=document.createElement('a');link.href=url;link.download='山川人海_本地工作台.html';link.textContent='点击保存本地 HTML ↓';button.after(link);button.hidden=true}
   ready=true;message('准备完成，点击保存 HTML ↓');
  }catch(e){message('下载失败，点击重试');if(status)status.textContent=e.message;else if(typeof toast==='function')toast('下载失败：'+e.message)}
  finally{busy=false}
 });
})();
