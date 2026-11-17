(function(){
 'use strict';
 const requested=new URLSearchParams(location.search).get('book');
 const book=/^[1-6]$/.test(requested||'')?Number(requested):(window.OFFLINE_BOOK||4);
 function failed(){const app=document.getElementById('app');app.textContent='';const main=document.createElement('main');main.className='container';const h=document.createElement('h1');h.textContent='这册内容暂时没有加载成功';const p=document.createElement('p');p.textContent=window.OFFLINE_BOOK?'当前离线包只包含第 '+window.OFFLINE_BOOK+' 册。请打开对应的离线包，或联网进入六册书架。':'请刷新重试，或回到六册书架重新选择。';const a=document.createElement('a');a.className='primary';a.href=window.OFFLINE_BOOK?'https://storysprout-reading-a762.yunjinzh.chatgpt.site':'index.html';a.textContent='回到六册书架 →';main.append(h,p,a);app.append(main);}
 function script(src,next){const el=document.createElement('script');el.src=src;el.onload=next;el.onerror=failed;document.body.appendChild(el);}
 if(window.OFFLINE_BOOK&&window.OFFLINE_BOOK!==book){failed();return;}
 script(`books/${book}/course-data.js`,()=>{window.COURSE=window.STORYSPROUT_BOOKS?.[book];if(!window.COURSE){failed();return;}script('course-core.js',()=>script('course-app.js',()=>{}));});
})();
