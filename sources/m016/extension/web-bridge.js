(()=>{
  'use strict';const ports=new Map();const allowed=new Set(['PING','GET_STATUS','GET_RECORDS','START_COLLECTION','STOP_COLLECTION']);
  function emit(id,data){window.postMessage({channel:'XAR_EXTENSION',id,...data},location.origin);}
  window.addEventListener('message',event=>{if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='XAR_APP')return;const m=event.data;if(typeof m.id!=='string'||m.id.length>100)return;
    if(m.action==='MEDIA_OPEN'){if(ports.has(m.id)||ports.size>=3)return;const port=chrome.runtime.connect({name:'media'});ports.set(m.id,port);port.onMessage.addListener(d=>{emit(m.id,{stream:true,...d});if(d.type==='end'||d.type==='error'){ports.delete(m.id);port.disconnect();}});port.onDisconnect.addListener(()=>{if(ports.has(m.id)){ports.delete(m.id);emit(m.id,{stream:true,type:'error',error:'扩展传输连接已关闭'});}});port.postMessage({type:'start',url:m.data?.url});}
    else if(m.action==='MEDIA_ACK')ports.get(m.id)?.postMessage({type:'ack',seq:m.data?.seq});
    else if(m.action==='MEDIA_CANCEL'){ports.get(m.id)?.disconnect();ports.delete(m.id);}
    else if(allowed.has(m.action))chrome.runtime.sendMessage({action:m.action,data:m.data}).then(result=>emit(m.id,{result}),e=>emit(m.id,{error:e.message}));
  });
})();
