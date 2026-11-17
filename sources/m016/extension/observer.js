(()=>{
  'use strict';if(window.__xArchiveObserver)return;window.__xArchiveObserver=true;
  const C=window.XArchiveCore;
  const mutations={FavoriteTweet:{source:'likes',active:true,keys:['favorite_tweet']},UnfavoriteTweet:{source:'likes',active:false,keys:['unfavorite_tweet']},CreateBookmark:{source:'bookmarks',active:true,keys:['tweet_bookmark_put','create_bookmark']},DeleteBookmark:{source:'bookmarks',active:false,keys:['tweet_bookmark_delete','delete_bookmark']}};
  function name(url){try{const u=new URL(url,location.href);return ['x.com','twitter.com'].includes(u.hostname)&&u.pathname.includes('/graphql/')?u.pathname.split('/').at(-1):'';}catch{return '';}}
  function source(url){const op=name(url);if(op==='Likes'&&/\/likes\/?$/.test(location.pathname))return'likes';if(['Bookmarks','BookmarkFolderTimeline'].includes(op)&&/^\/i\/bookmarks/.test(location.pathname))return'bookmarks';if(op==='TweetDetail'&&/\/status\/\d+/.test(location.pathname))return'detail';return'';}
  function emit(data){window.postMessage({channel:'XAR_CAPTURE',...data},location.origin);}
  function requestError(status){emit({type:status===429?'rate-limit':'request-error',status});}
  function tweetId(body){try{const parsed=typeof body==='string'?JSON.parse(body):body;let vars=parsed?.variables;if(typeof vars==='string')vars=JSON.parse(vars);const id=String(vars?.tweet_id||vars?.tweetId||'');return /^\d{1,25}$/.test(id)?id:'';}catch{return '';}}
  function requestTweetId(input,init){if(init?.body)return Promise.resolve(tweetId(init.body));if(typeof input!=='string'&&input?.clone){try{return input.clone().text().then(tweetId).catch(()=>'');}catch{}}return Promise.resolve('');}
  function ingest(url,data,id){const mutation=mutations[name(url)];if(mutation){if(id&&!data.errors?.length&&mutation.keys.some(key=>data.data?.[key]==='Done'||data.data?.[key]?.success===true))emit({type:'interaction',tweetId:id,source:mutation.source,active:mutation.active,at:new Date().toISOString()});return;}const s=source(url);if(!s)return;try{const records=C.extractGraphQL(data,s);if(records.length)emit({type:'records',source:s,records});else if(data.errors?.length)requestError(200);}catch{}}
  const originalFetch=window.fetch;
  window.fetch=function(...args){const url=typeof args[0]==='string'?args[0]:args[0]?.url;const relevant=source(url)||mutations[name(url)];const id=relevant?requestTweetId(args[0],args[1]):Promise.resolve('');const response=originalFetch.apply(this,args);response.then(res=>{if(!relevant)return;if(res.status>=400&&source(url))requestError(res.status);if(res.ok)Promise.all([res.clone().json(),id]).then(([data,id])=>ingest(url,data,id)).catch(()=>{});}).catch(()=>{});return response;};
  const open=XMLHttpRequest.prototype.open,send=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(method,url,...args){this.__xarURL=String(url);return open.call(this,method,url,...args);};
  XMLHttpRequest.prototype.send=function(body,...args){const id=tweetId(body);this.addEventListener('load',()=>{if(!source(this.__xarURL)&&!mutations[name(this.__xarURL)])return;if(this.status>=400&&source(this.__xarURL))requestError(this.status);try{if(this.status>=200&&this.status<300)ingest(this.__xarURL,this.responseType==='json'?this.response:JSON.parse(this.responseText),id);}catch{}});return send.call(this,body,...args);};
})();
