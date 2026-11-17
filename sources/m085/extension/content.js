(() => {
  'use strict';
  if (globalThis.__jmMusicAssistant) return;
  globalThis.__jmMusicAssistant = '1.2.0';
  const C=MusicCore;
  let pickedCleanup=null;
  const visible=e=>!!e && !!(e.getBoundingClientRect().width&&e.getBoundingClientRect().height) && getComputedStyle(e).visibility!=='hidden' && getComputedStyle(e).display!=='none';
  const ours=e=>e?.id==='jm-music-picker'||e?.closest?.('#jm-music-picker');
  function query(selector,root=document){
    if(!selector)return [];
    if(selector.startsWith('text=')){const t=selector.slice(5);return [...root.querySelectorAll('button,[role="button"],a')].filter(e=>(e.textContent||'').trim()===t&&visible(e));}
    try{return [...root.querySelectorAll(selector)].filter(e=>visible(e)&&!ours(e));}catch{throw Error('页面绑定选择器无效：'+selector);}
  }
  function unique(selector,label){const es=query(selector);if(es.length!==1)throw Error(`${label}匹配到${es.length}个元素，请用页面绑定重新选择`);return es[0];}
  function editor(cfg){
    if(cfg.prompt)return unique(cfg.prompt,'提示词框');
    for(const selector of ['textarea[class*="prompt-textarea-"]','textarea','[contenteditable="true"][role="textbox"]','[contenteditable="true"]']){
      const es=query(selector).filter(e=>!e.closest('[role="dialog"]'));
      if(es.length===1)return es[0];
    }
    throw Error('未找到唯一的音乐提示词框，请先绑定提示词框');
  }
  function submitButton(cfg,input){
    if(cfg.submit)return unique(cfg.submit,'创建按钮');
    const es=query('button[data-generator-submit-available],button[class*="submit-button-"]');
    if(es.length===1)return es[0];
    if(es.length>1){
      let node=input.parentElement;
      for(let i=0;node&&i<7;i++,node=node.parentElement){const local=es.filter(e=>node.contains(e));if(local.length===1)return local[0];}
      const a=input.getBoundingClientRect();
      const sorted=es.map(e=>({e,d:Math.hypot(e.getBoundingClientRect().x-a.right,e.getBoundingClientRect().y-a.bottom)})).sort((a,b)=>a.d-b.d);
      if(sorted[0].d+30<sorted[1].d)return sorted[0].e;
    }
    throw Error('未找到唯一的创建按钮，请先绑定创建按钮');
  }
  function blocker(){
    const alerts=query('[role="dialog"],[role="alert"],[class*="login-modal"],[class*="captcha"]');
    const text=alerts.map(e=>e.innerText||'').join('\n');
    if(/验证码|安全验证|滑块|人机验证|完成验证/.test(text))return '页面出现登录或安全验证，请在即梦页面完成后继续';
    if(/欢迎登录|扫码登录|登录即梦/.test(text))return '即梦要求登录，请在当前浏览器完成登录';
    if(/积分不足|余额不足|额度不足|次数已用完|购买会员|立即充值/.test(text))return '页面提示额度或会员限制，请在即梦页面核对';
    if(/操作频繁|请求过于频繁|稍后重试|服务繁忙/.test(text))return '页面提示频率或服务限制，队列已暂停';
    if(query('button').some(e=>(e.innerText||'').trim()==='请先登录'))return '当前即梦页面尚未登录';
    return '';
  }
  function musicMode(cfg){
    if(cfg.mode){const es=query(cfg.mode);return es.length===1 && /音乐|SeedMusic/i.test(es[0].innerText||es[0].getAttribute('aria-label')||'');}
    return query('[role="combobox"],[class*="toolbar-select-"]').some(e=>/音乐生成|SeedMusic/i.test(e.innerText||e.getAttribute('aria-label')||''));
  }
  function inspect(cfg={}){
    let prompt=false,submit=false,error='';
    try{const el=editor(cfg);prompt=true;submit=!!submitButton(cfg,el);}catch(e){error=e.message;}
    return {version:'1.2.0',url:location.href,title:document.title,prompt,submit,music:musicMode(cfg),blocker:blocker(),error,cardBound:!!cfg.card,autoAdapter:!cfg.card,cards:recordRoots(cfg).length};
  }
  async function fill(cfg,text){
    const b=blocker();if(b)throw Error(b);
    if(!musicMode(cfg))throw Error('请在即梦把创作类型切换为“音乐生成”；如页面改版，请绑定音乐模式标识');
    const el=editor(cfg);el.focus();
    if(el.tagName==='TEXTAREA'||el.tagName==='INPUT'){
      const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto,'value').set.call(el,text);
      el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
    }else if(el.isContentEditable){
      const range=document.createRange();range.selectNodeContents(el);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);
      document.execCommand('insertText',false,text);
      el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));
    }else throw Error('所绑定的元素不是可编辑的输入框');
    await new Promise(r=>setTimeout(r,250));
    const actual=(el.value??el.innerText??'').trim();
    if(actual!==text.trim())throw Error('填写后的文本未完全匹配，请重新绑定输入框');
    return {filled:true,length:actual.length};
  }
  function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(36);}
  function urlKey(url){try{const u=new URL(url);['Expires','Signature','x-expires','x-signature','token','sign'].forEach(k=>u.searchParams.delete(k));return u.href;}catch{return url;}}
  function cardIdentity(el){
    for(const a of ['data-generated-record-handoff-key','data-generated-record-key','data-task-id','data-item-id','data-id','id'])if(el.getAttribute(a))return a+':'+el.getAttribute(a);
    const link=el.querySelector('a[href*="work-detail"],a[href*="task_id"],a[href*="item_id"]');
    if(link)return link.href;
    // Element-only identity remains stable during in-place status updates and changes after a full page load.
    if(!el.dataset.jmObservedId)el.dataset.jmObservedId=crypto.randomUUID();
    return 'dom:'+el.dataset.jmObservedId;
  }
  function downloadControls(root,cfg){
    if(cfg.download)return query(cfg.download,root);
    return query('button,[role="button"],a',root).filter(e=>/^(下载|下载音频|下载音乐|Download)$/i.test((e.innerText||'').trim())||/下载|download/i.test(e.getAttribute('aria-label')||e.getAttribute('title')||''));
  }
  // These attributes were observed in the signed-in music UI on 2026-10-11.
  const RECORD='[data-generated-record-key]';
  const AUDIO='[data-vinyl-audio-card-presentation]';
  function recordRoots(cfg={}){
    const roots=cfg.card?query(cfg.card):query(RECORD).filter(e=>e.querySelector('[data-generated-record-body="audio"]')||e.querySelector(AUDIO)||/SeedMusic/.test(e.innerText||''));
    return [...new Set(roots.map(e=>e.closest(RECORD)||e))];
  }
  function scan(cfg={},job={}){
    const out=[],records=[],tasks=[];
    for(const root of recordRoots(cfg)){
      const record=cardIdentity(root);records.push(record);
      const txt=(root.innerText||'').trim();
      const body=root.querySelector('[data-generated-record-body="audio"]')||root;
      const bodyText=(body.innerText||'').trim();
      const matchType=job.marker?(txt.split(/[^A-Za-z0-9_-]+/).includes(job.marker)?'marker':''):(job.title&&txt.includes(job.title)?'title':'');
      const matched=!!matchType;
      const state=/生成失败|创建失败|生成出错/.test(bodyText)?'failed':/生成中|排队中|创作中|正在生成|等待生成/.test(bodyText)?'pending':'unknown';
      tasks.push({record,matched,state});
      if(state==='failed'||state==='pending')continue;
      const cards=query(AUDIO,root);
      if(cards.length){
        cards.forEach((card,variant)=>{
          const duration=(card.querySelector('[class*="total-time-"]')?.textContent||'').trim();
          const playable=card.querySelector('[class*="play-button-"]');
          if(!playable||!/^\d{1,3}:\d{2}$/.test(duration)||!/[1-9]/.test(duration))return;
          const title=card.querySelector('[class*="title-container-"] [class*="title-"]')?.textContent?.trim()||'';
          out.push({key:'card:'+record+':'+variant,record,variant,kind:'menu',title,duration,text:txt.slice(0,180),matched,matchType});
        });
        continue;
      }
      const media=[...root.querySelectorAll('audio,audio source,a[href]')].filter(e=>e.tagName!=='A'||C.fileExt(e.href)||e.hasAttribute('download'));
      let count=0;
      for(const el of media){
        const url=el.currentSrc||el.src||el.href;if(!url||!C.audioUrl(url))continue;
        const mime=el.getAttribute('type')||'';
        if(el.tagName==='A'&&!C.fileExt(url,mime)&&!/音频|音乐|audio|music|下载/i.test(el.innerText||el.download||''))continue;
        const key='url:'+urlKey(url);
        if(!out.some(x=>x.key===key)){out.push({key,record,url,mime,kind:'url',text:txt.slice(0,180),matched,matchType});count++;}
      }
      if(!count){const buttons=downloadControls(root,cfg).filter(e=>!e.disabled&&e.getAttribute('aria-disabled')!=='true');
        if(buttons.length===1)out.push({key:'control:'+record,record,kind:'button',text:txt.slice(0,180),matched,matchType});
      }
    }
    return {outputs:out,records,tasks};
  }
  function status(cfg,job){
    const data=scan(cfg,job),b=blocker();
    const alerts=query('[role="alert"]');
    const failure=alerts.map(e=>e.innerText||'').find(t=>/生成失败|创建失败|请求失败/.test(t));
    return {...data,blocker:b||failure||'',bound:!!cfg.card||musicMode(cfg),documentId,
      workspace:new URL(location.href).searchParams.get('workspace')||''};
  }
  async function clickDownload(cfg,msg){
    const root=recordRoots(cfg).find(e=>cardIdentity(e)===msg.record);
    if(!root)throw Error('本首作品未加载在当前对话中。请回到创作时的对话并滚动到该曲，再重试下载；音乐不会重新创建。');
    const cards=query(AUDIO,root);
    if(cards.length){
      const card=cards[msg.variant||0];if(!card)throw Error('本首作品版本已变化，请重新检查结果');
      card.scrollIntoView({block:'center',behavior:'instant'});
      // Never click the batch "..." operation: its menu contains deletion, not download.
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
      const r=card.getBoundingClientRect();
      card.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,buttons:2,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
      for(let i=0;i<20;i++){
        await new Promise(resolve=>setTimeout(resolve,100));
        const entries=query('[class*="context-menu-item-"],[role="menuitem"]').filter(e=>/^(下载|下载音频|下载音乐)$/.test((e.innerText||'').trim()));
        // Keep only leaf menu entries; parent and visual child can both match the CSS prefix.
        const leaf=entries.filter(e=>!entries.some(n=>n!==e&&e.contains(n)));
        if(leaf.length===1){
          const el=leaf[0];if(el.getAttribute('aria-disabled')==='true'||/disabled/.test(el.className))throw Error('即梦当前不允许下载本首作品');
          el.click();return {clicked:true,route:'audio-context-menu'};
        }
        if(leaf.length>1)throw Error('出现多个下载菜单，请关闭额外菜单后重试');
      }
      throw Error('音乐右键菜单未出现下载项，请在本首音乐卡片上右键核对，再重试下载');
    }
    const buttons=downloadControls(root,cfg).filter(e=>!e.disabled);
    if(buttons.length!==1)throw Error('未找到唯一下载入口，请绑定卡片内直接下载按钮');
    buttons[0].click();return {clicked:true,route:'bound-button'};
  }
  const documentId=crypto.randomUUID();
  function selectorFor(el,kind=''){
    const escape=CSS.escape;
    if(kind==='card'&&el.closest(RECORD))return RECORD+'[class*="audio-record-"]';
    if(el.getAttribute('data-testid'))return `[data-testid="${escape(el.getAttribute('data-testid'))}"]`;
    if(el.getAttribute('aria-label')&&kind!=='card')return `${el.tagName.toLowerCase()}[aria-label="${escape(el.getAttribute('aria-label'))}"]`;
    if(el.id&&kind!=='card'&&kind!=='download')return '#'+escape(el.id);
    const classes=[...el.classList].filter(c=>!/(active|hover|focus|selected|disabled)/i.test(c));
    if(classes.length)return el.tagName.toLowerCase()+classes.slice(0,3).map(c=>'.'+escape(c)).join('');
    if(el.tagName==='BUTTON'&&el.innerText?.trim())return 'text='+el.innerText.trim();
    if(el.tagName==='TEXTAREA')return 'textarea';
    if(kind==='card'&&el.tagName==='ARTICLE')return 'article';
    const path=[];let node=el;
    for(let i=0;node&&node!==document.body&&i<7;i++,node=node.parentElement){const siblings=[...node.parentElement.children].filter(x=>x.tagName===node.tagName);path.unshift(node.tagName.toLowerCase()+`:nth-of-type(${siblings.indexOf(node)+1})`);}
    return 'body > '+path.join(' > ');
  }
  function startPicker(field){
    if(pickedCleanup)pickedCleanup();
    const labels={prompt:'提示词输入框',submit:'创建按钮',card:'一张完整音乐结果卡片',download:'结果卡片内的下载按钮',mode:'显示音乐生成 / SeedMusic 的模式标识'};
    const host=document.createElement('div');host.id='jm-music-picker';document.documentElement.append(host);
    const shadow=host.attachShadow({mode:'open'});
    shadow.innerHTML=`<style>:host{all:initial} .box{position:fixed;z-index:2147483647;left:24px;top:24px;width:350px;padding:20px;background:#292b2a;color:#f1f0ec;border-radius:18px;font:14px/1.7 system-ui;box-shadow:0 15px 60px #0006}b{font-size:17px}p{color:#d4d4cc;margin:8px 0}button{background:#e07563;color:#211d19;border:0;border-radius:8px;padding:9px 13px;margin:4px;cursor:pointer}code{display:block;word-break:break-all;color:#d8c6ad;max-height:100px;overflow:auto}.outline{position:fixed;pointer-events:none;z-index:2147483646;border:3px solid #e07563;background:#e075631c;box-sizing:border-box}</style><div class="box"><b>绑定${labels[field]}</b><p>移动鼠标定位，点击锁定。按 ↑ 选父容器，按 ↓ 返回子容器。音乐结果卡片应包含曲名、播放器和下载入口。</p><code>尚未选择</code><button id="save">使用此元素</button><button id="cancel">取消</button></div><div class="outline"></div>`;
    let selected=null,locked=false,previous=[];
    const outline=shadow.querySelector('.outline'),code=shadow.querySelector('code');
    const show=()=>{if(!selected)return;const r=selected.getBoundingClientRect();Object.assign(outline.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});code.textContent=selectorFor(selected,field);};
    const move=e=>{if(locked||e.composedPath().includes(host)||ours(e.target))return;selected=e.target;show();};
    const click=e=>{if(e.composedPath().includes(host))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();selected=e.target;locked=true;show();};
    const key=e=>{if(e.key==='Escape'){cleanup();return;}if(!selected)return;if(e.key==='ArrowUp'&&selected.parentElement&&selected.parentElement!==document.body){e.preventDefault();previous.push(selected);selected=selected.parentElement;locked=true;show();}else if(e.key==='ArrowDown'&&previous.length){e.preventDefault();selected=previous.pop();show();}};
    function cleanup(){document.removeEventListener('mousemove',move,true);document.removeEventListener('click',click,true);document.removeEventListener('keydown',key,true);host.remove();pickedCleanup=null;}
    document.addEventListener('mousemove',move,true);document.addEventListener('click',click,true);document.addEventListener('keydown',key,true);pickedCleanup=cleanup;
    shadow.querySelector('#cancel').onclick=cleanup;
    shadow.querySelector('#save').onclick=async()=>{if(!selected)return;const selector=selectorFor(selected,field);if(field==='card'&&(selected===document.body||selected===document.documentElement||query(selector).length>200)){code.textContent='选择范围过大，请选择一张完整音乐卡片';return;}const response=await chrome.runtime.sendMessage({type:'BINDING',field,selector,pickedRecord:field==='card'?cardIdentity(selected.closest(RECORD)||selected):null,records:field==='card'?recordRoots({card:selector}).map(cardIdentity):[],documentId});if(response?.ok)cleanup();else code.textContent=response?.error||'保存失败';};
    return {picking:true};
  }
  chrome.runtime.onMessage.addListener((msg,_sender,respond)=>{
    if(!msg?.type?.startsWith('PAGE_'))return;
    (async()=>{
      const cfg=msg.adapter||{};
      if(msg.type==='PAGE_INSPECT')return inspect(cfg);
      if(msg.type==='PAGE_SCAN')return status(cfg,msg.job);
      if(msg.type==='PAGE_FILL')return fill(cfg,msg.prompt);
      if(msg.type==='PAGE_PICK')return startPicker(msg.field);
      if(msg.type==='PAGE_SUBMIT'){
        const b=blocker();if(b)throw Error(b);if(!musicMode(cfg))throw Error('当前页面未确认处于音乐模式');
        const input=editor(cfg),actual=(input.value??input.innerText??'').trim();
        if(actual!==msg.prompt.trim())throw Error('提示词发生变化，已停止提交');
        const button=submitButton(cfg,input);if(button.disabled||button.getAttribute('aria-disabled')==='true'||/disabled/.test(button.className))throw Error('创建按钮不可用，请核对提示词、登录与积分');
        button.click();return {clicked:true,documentId};
      }
      if(msg.type==='PAGE_DOWNLOAD')return clickDownload(cfg,msg);
      throw Error('未知页面命令');
    })().then(data=>respond({ok:true,data})).catch(e=>respond({ok:false,error:e.message}));return true;
  });
  setInterval(()=>chrome.runtime.sendMessage({type:'PULSE'}).catch(()=>{}),5000);
})();
