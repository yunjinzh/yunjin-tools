(()=>{
  'use strict';let running=false,stop=false,captured=0,lastCapture=0;let scrollTimer=null,stoppedInfo=null;
  function send(message){return chrome.runtime.sendMessage(message).catch(()=>({error:'扩展连接已断开，请刷新页面'}));}
  function currentSource(){return /^\/i\/bookmarks/.test(location.pathname)?'bookmarks':/\/likes\/?$/.test(location.pathname)?'likes':'detail';}
  function owner(){return document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')?.split('/')[1]||'';}
  window.addEventListener('message',event=>{if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='XAR_CAPTURE')return;const d=event.data;if(d.type==='interaction'){if(/^\d{1,25}$/.test(d.tweetId)&&['likes','bookmarks'].includes(d.source)){const found=visibleRecords().find(r=>r.id===d.tweetId);send({action:'CAPTURE_INTERACTION',data:{event:{tweetId:d.tweetId,source:d.source,at:d.at,active:d.active},record:found?{...found,sources:[d.source]}:null,owner:owner()}});}return;}if(d.type==='rate-limit'||d.type==='request-error'){stop=true;stoppedInfo={state:'paused',at:Date.now(),message:d.type==='rate-limit'?'X 返回请求频率限制，采集已停止，请稍后重试':`X 页面读取返回错误（HTTP ${d.status}），请在 X 检查账号权限后重试`};send({action:'COLLECT_PROGRESS',data:stoppedInfo});return;}if(d.type==='records'&&Array.isArray(d.records)){const source=currentSource();if(d.source!==source||d.records.length>1000)return;captured+=d.records.length;lastCapture=Date.now();send({action:'CAPTURE',data:{records:d.records,source,owner:owner()}});}});
  function visibleRecords(){const records=[];for(const article of document.querySelectorAll('article[data-testid="tweet"]')){const time=article.querySelector('time');const link=time?.closest('a');const href=link?.getAttribute('href')||'';const match=href.match(/^\/([^/]+)\/status\/(\d+)/);if(!match)continue;
      const textNode=article.querySelector('[data-testid="tweetText"]');const user=article.querySelector('[data-testid="User-Name"]');const name=user?.querySelector('a span')?.textContent||'';const media=[];for(const img of article.querySelectorAll('[data-testid="tweetPhoto"] img'))if(img.src.startsWith('https://pbs.twimg.com/media/'))media.push({id:String(media.length+1),type:'photo',url:img.src,alt:img.alt});
      const video=article.querySelector('video');if(video)media.push({id:String(media.length+1),type:'video',url:video.src.startsWith('https://video.twimg.com/')?video.src:'',preview:video.poster});
      records.push({id:match[2],author:{name,handle:match[1]},createdAt:time?.dateTime||null,text:textNode?.innerText||'',media,textComplete:false,provenance:'X 可见页面 正文完整性未核验',sources:[currentSource()]});}
    return records;}
  async function start(opts){if(running)return;running=true;stop=!!stoppedInfo&&Date.now()-stoppedInfo.at<15000;if(!stop)stoppedInfo=null;captured=0;lastCapture=Date.now();const target=Math.max(1,Math.min(10000,Number(opts.limit)||200));const delay=Math.max(1500,Math.min(10000,Number(opts.interval)||2200));const seen=new Set();let stale=0;let rounds=0;const initialY=scrollY;
    async function tick(){if(stop){finish(stoppedInfo?.state||'stopped',stoppedInfo?.message||'采集已停止，已取得的内容已保留');return;}
      if(/\/i\/flow\/login/.test(location.pathname)||(!document.querySelector('[data-testid="AppTabBar_Profile_Link"]')&&document.querySelector('[data-testid="loginButton"]'))){finish('blocked','请在 X 页面登录自己的账号，再重新采集');return;}
      const visible=visibleRecords();let fresh=0;for(const r of visible)if(!seen.has(r.id)){seen.add(r.id);fresh++;}if(visible.length)await send({action:'CAPTURE',data:{records:visible,source:currentSource(),owner:owner()}});
      stale=fresh||Date.now()-lastCapture<delay*2?0:stale+1;rounds++;
      await send({action:'COLLECT_PROGRESS',data:{state:'running',visible:seen.size,rounds,message:`已浏览 ${seen.size} 条，正在向下读取页面`}});
      if(seen.size>=target){finish('limit','已达到本次浏览条数上限，可提高上限继续读取');return;}
      if(stale>=9){finish('idle','页面连续未返回新增记录，本次采集结束；历史内容是否完整需对照 X 页面核验');return;}
      if(rounds>=Math.max(100,target*3)){finish('limit','已达到本次滚动上限，已取得的资料已保留');return;}
      window.scrollBy({top:Math.max(700,innerHeight*.86),behavior:'instant'});scrollTimer=setTimeout(tick,delay);
    }
    function finish(state,message){running=false;clearTimeout(scrollTimer);send({action:'COLLECT_PROGRESS',data:{state,visible:seen.size,rounds,message}});}
    if(initialY>100)window.scrollTo({top:0,behavior:'instant'});scrollTimer=setTimeout(tick,1200);
  }
  chrome.runtime.onMessage.addListener((msg,sender,respond)=>{if(msg.action==='START_SCROLL'){start(msg.data||{});respond({ok:true});}else if(msg.action==='STOP_SCROLL'){stop=true;stoppedInfo=null;respond({ok:true});}else if(msg.action==='CAPTURE_VISIBLE'){const records=visibleRecords();send({action:'CAPTURE',data:{records,source:currentSource(),owner:owner()}}).then(respond);return true;}});
})();
