(function(root,factory){const reader=typeof module==='object'&&module.exports?require('./reader.js'):root.XArchiveReader;const api=factory(reader);if(typeof module==='object'&&module.exports)module.exports=api;else root.XArchiveCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Reader){
  'use strict';
  const enc=new TextEncoder();
  const missing='[!!! 事实断层：资料不足，无法确认]';
  const sourceNames={bookmarks:'收藏',likes:'点赞',manual:'手动导入',detail:'详情补全',demo:'示例'};
  const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const xml=s=>escapeHTML(String(s??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,''));
  const safeName=(s,max=90)=>{let name=String(s||'未命名').replace(/[<>:"/\\|?*#%\u0000-\u001F]/g,'_').replace(/\.{2,}/g,'_').replace(/[. ]+$/g,'').slice(0,max)||'未命名';if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))name='_'+name;return name;};
  const iso=v=>v&&Number.isFinite(new Date(v).getTime())?new Date(v).toISOString():null;
  const dateText=v=>iso(v)?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(v))+' UTC+8':missing;
  function safeURL(v,hosts){try{const u=new URL(v);return u.protocol==='https:'&&(!hosts||hosts.includes(u.hostname))?u.href:'';}catch{return '';}}
  function mediaURL(v){return safeURL(v,['pbs.twimg.com','video.twimg.com']);}
  function originalPhoto(v){const valid=mediaURL(v);if(!valid)return '';const u=new URL(valid);if(u.hostname!=='pbs.twimg.com')return valid;const m=u.pathname.match(/\.([a-zA-Z0-9]+)$/);if(m){u.pathname=u.pathname.replace(/\.[a-zA-Z0-9]+$/,'');u.searchParams.set('format',m[1]);}u.searchParams.set('name','orig');return u.href;}
  function chooseVideo(variants,quality='highest'){
    const list=(variants||[]).filter(x=>(x.content_type||x.contentType)==='video/mp4'&&mediaURL(x.url)).sort((a,b)=>(a.bitrate||0)-(b.bitrate||0));
    return (quality==='small'?list[0]:quality==='balanced'?list[Math.floor((list.length-1)/2)]:list.at(-1))?.url||'';
  }
  function normalizedMedia(m,i){
    const type=m.type==='photo'||m.type==='image'?'photo':m.type==='animated_gif'?'animated_gif':'video';
    const variants=(m.variants||m.video_info?.variants||[]).map(v=>({url:mediaURL(v.url),content_type:v.content_type||v.contentType||'video/mp4',bitrate:Number(v.bitrate)||0})).filter(v=>v.url);
    const isDemo=m.demo===true;const demoURL=isDemo&&/^media\/demo-[a-z0-9-]+\.(svg|mp4)$/.test(m.url||'')?m.url:'';
    const direct=mediaURL(m.url);const url=demoURL||(type==='photo'?originalPhoto(m.url||m.media_url_https||m.media_url):chooseVideo(variants)||(/\.mp4(?:\?|$)/i.test(direct)?direct:''));
    return {id:String(m.id||m.id_str||m.media_key||i+1),type,url,preview:demoURL||mediaURL(m.preview||m.preview_image_url||m.media_url_https||m.url),variants,alt:String(m.alt||m.ext_alt_text||''),demo:isDemo};
  }
  function normalizeRecord(o,source='manual'){
    if(!o||typeof o!=='object')return null;const rawId=o.id||o.id_str||o.rest_id||o.tweetId||'';if(typeof rawId==='number'&&!Number.isSafeInteger(rawId))return null;const id=String(rawId);if(!/^(\d{1,25}|demo_[a-z0-9_]+)$/.test(id))return null;
    const author=o.author||{};const handle=String(author.handle||author.username||o.username||o.handle||'').replace(/^@/,'');
    const sources=[...new Set([...(Array.isArray(o.sources)?o.sources:[]),source])].filter(s=>sourceNames[s]);
    const text=String(o.text??o.full_text??o.fullText??'');
    const createdAt=iso(o.createdAt||o.created_at);const notes=String(o.notes||'');const tags=Array.isArray(o.tags)?o.tags.map(String).slice(0,30):[];
    const media=(o.media||[]).map(normalizedMedia);
    const url=/^\d+$/.test(id)?`https://x.com/${/^[A-Za-z0-9_]{1,15}$/.test(handle)?handle:'i'}/status/${id}`:'';
    const textComplete=o.textComplete===true||o.demo===true||(o.textComplete!==false&&o.provenance==='X 官方 API 响应');
    const warnings=[];if(!createdAt)warnings.push('发文时间缺失');if(!author.name&&!o.authorName&&!handle)warnings.push('作者缺失');if(!text)warnings.push('正文缺失');if(!textComplete)warnings.push('正文完整性未核验');if(media.some(m=>m.type!=='photo'&&!m.url))warnings.push('视频直链缺失');
    return {id,url,author:{name:String(author.name||o.authorName||''),handle,id:String(author.id||o.author_id||'')},createdAt,text,media,sources,notes,tags,textComplete,interactionTimes:Reader.normalizeInteractionTimes(o),owner:String(o.owner||''),capturedAt:iso(o.capturedAt)||new Date().toISOString(),warnings,provenance:String(o.provenance||'导入数据'),demo:o.demo===true,lastExport:o.lastExport||null};
  }
  function mergeRecords(a,b){
    if(!a)return b;if(!b)return a;
    const score=x=>(x.textComplete?10000:0)+(x.text?.length||0);const best=score(b)>score(a)?b:a;
    const media=new Map();for(const m of [...a.media,...b.media]){const key=m.type+':'+(m.type==='photo'?m.url:m.preview||m.url||m.id);const prev=media.get(key);media.set(key,prev?{...prev,...m,id:prev.id.length>=m.id.length?prev.id:m.id,url:m.url||prev.url,variants:m.variants?.length?m.variants:prev.variants}:m);}
    const out={...a,...best,author:{name:b.author.name||a.author.name,handle:b.author.handle||a.author.handle,id:b.author.id||a.author.id},createdAt:b.createdAt||a.createdAt,media:[...media.values()],sources:[...new Set([...a.sources,...b.sources])],interactionTimes:{...a.interactionTimes,...b.interactionTimes},owner:b.owner||a.owner,capturedAt:b.capturedAt,notes:a.notes||b.notes,tags:[...new Set([...a.tags,...b.tags])],lastExport:a.lastExport||b.lastExport};
    out.warnings=[];if(!out.createdAt)out.warnings.push('发文时间缺失');if(!out.author.name&&!out.author.handle)out.warnings.push('作者缺失');if(!out.text)out.warnings.push('正文缺失');if(!out.textComplete)out.warnings.push('正文完整性未核验');if(out.media.some(m=>m.type!=='photo'&&!m.url))out.warnings.push('视频直链缺失');return out;
  }
  function fromTweet(t,source){
    if(t?.tweet)t=t.tweet;if(!t?.legacy||!t.rest_id)return null;
    const l=t.legacy;const u=t.core?.user_results?.result||{};const ul=u.legacy||{};const note=t.note_tweet?.note_tweet_results?.result;
    let text=note?.text??l.full_text??'';const entities=note?.entity_set||l.entities||{};for(const e of entities.urls||[])if(e.url&&e.expanded_url)text=text.split(e.url).join(e.expanded_url);
    text=text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    return normalizeRecord({id:t.rest_id,text,created_at:l.created_at,liked_at:t.liked_at,bookmarked_at:t.bookmarked_at,author:{name:ul.name||u.core?.name||'',handle:ul.screen_name||u.core?.screen_name||'',id:u.rest_id||''},media:l.extended_entities?.media||l.entities?.media||[],textComplete:!!note?.text||l.truncated!==true,provenance:note?.text?'X 页面响应 长文正文':'X 页面响应'},source);
  }
  function extractGraphQL(data,source='manual'){
    const found=new Map();const skip=new Set(['quoted_status_result','retweeted_status_result','quoted_status','retweeted_status','user_results','card','promotedMetadata']);
    function walk(o,depth=0){if(!o||typeof o!=='object'||depth>45)return;if(o.__typename==='Tweet'||o.__typename==='TweetWithVisibilityResults'||(o.rest_id&&o.legacy?.full_text!==undefined)){const r=fromTweet(o,source);if(r)found.set(r.id,mergeRecords(found.get(r.id),r));return;}if(Array.isArray(o)){for(const v of o)walk(v,depth+1);return;}if(o.promotedMetadata||o.promoted_metadata)return;for(const [k,v]of Object.entries(o))if(!skip.has(k))walk(v,depth+1);}
    walk(data);return [...found.values()];
  }
  function parseInput(text,source='manual'){
    text=String(text).replace(/^\uFEFF/,'').trim();text=text.replace(/^window\.YTD\.[A-Za-z0-9_]+\.part\d+\s*=\s*/,'').replace(/;\s*$/,'');
    let data;try{data=JSON.parse(text);}catch{throw new Error('无法解析资料。请导入 JSON，或 X 导出包中的 like.js／bookmark.js。');}
    let arr=[];
    if(Array.isArray(data))arr=data;else if(Array.isArray(data.records))arr=data.records;else if(Array.isArray(data.posts))arr=data.posts;
    else if(Array.isArray(data.data)&&data.includes){const users=new Map((data.includes.users||[]).map(u=>[u.id,u]));const media=new Map((data.includes.media||[]).map(m=>[m.media_key,m]));arr=data.data.map(t=>({...t,text:t.note_post?.text||t.note_tweet?.text||t.text,author:users.get(t.author_id)||{},media:(t.attachments?.media_keys||[]).map(k=>media.get(k)).filter(Boolean),provenance:'X 官方 API 响应'}));}
    else if(Array.isArray(data.data))arr=data.data;
    else {const gql=extractGraphQL(data,source);if(gql.length)return gql;arr=[data];}
    const out=new Map();for(const item of arr){const obj=item.like?{...item.like,textComplete:false,provenance:'X 导出包 点赞清单'}:item.bookmark?{...item.bookmark,textComplete:false,provenance:'X 导出包 收藏清单'}:item;const s=item.like?'likes':item.bookmark?'bookmarks':source;const r=normalizeRecord(obj,s);if(r)out.set(r.id,mergeRecords(out.get(r.id),r));}
    if(!out.size)throw new Error('资料中未找到可识别的推文记录。请查看导入格式示例。');return [...out.values()];
  }
  const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crcChunk(c,b){for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return c>>>0;}
  class ZipArchive{
    constructor(maxBytes=0xffffffff){this.entries=[];this.maxBytes=maxBytes;this.bytes=0;}
    async add(path,data){if(!path||path.startsWith('/')||path.split(/[\/\\]/).some(x=>x==='..')||path.includes('\\'))throw new Error('不安全的文件路径');if(this.entries.some(e=>e.path===path))throw new Error('压缩包文件重名');
      const chunks=Array.isArray(data)?data:[typeof data==='string'?enc.encode(data):data instanceof Blob?new Uint8Array(await data.arrayBuffer()):data];let size=0,crc=0xffffffff;for(const chunk of chunks){if(!(chunk instanceof Uint8Array))throw new Error('文件数据格式错误');size+=chunk.byteLength;crc=crcChunk(crc,chunk);}if(this.bytes+size>this.maxBytes)throw new Error('ZIP 超过本次容量上限，请改用指定文件夹保存');this.bytes+=size;this.entries.push({path,chunks,size,crc:(crc^0xffffffff)>>>0});}
    finish(mime='application/zip'){
      const parts=[],central=[];let offset=0;const now=new Date();const time=(now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2),date=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
      for(const e of this.entries){const name=enc.encode(e.path);const head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(10,time,true);v.setUint16(12,date,true);v.setUint32(14,e.crc,true);v.setUint32(18,e.size,true);v.setUint32(22,e.size,true);v.setUint16(26,name.length,true);head.set(name,30);parts.push(head,...e.chunks);
        const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,e.crc,true);cv.setUint32(20,e.size,true);cv.setUint32(24,e.size,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=head.length+e.size;}
      if(this.entries.length>65535||offset>0xffffffff)throw new Error('压缩包超过 ZIP 格式上限');const size=central.reduce((s,c)=>s+c.length,0);const tail=new Uint8Array(22),tv=new DataView(tail.buffer);tv.setUint32(0,0x06054b50,true);tv.setUint16(8,this.entries.length,true);tv.setUint16(10,this.entries.length,true);tv.setUint32(12,size,true);tv.setUint32(16,offset,true);return new Blob([...parts,...central,tail],{type:mime});
    }
  }
  function paragraph(text,style='Normal'){const lines=String(text).split('\n');return `<w:p><w:pPr><w:pStyle w:val="${style}"/><w:keepLines/><w:widowControl/></w:pPr><w:r>${lines.map((s,i)=>(i?'<w:br/>':'')+`<w:t xml:space="preserve">${xml(s)}</w:t>`).join('')}</w:r></w:p>`;}
  function interactionText(r){return ['likes','bookmarks'].filter(source=>r.sources.includes(source)||r.interactionTimes?.[source]).map(source=>{const t=r.interactionTimes?.[source],name=sourceNames[source],basis={source_provided:'来源记录提供',browser_observed:'本浏览器记录操作成功时间',user_provided:'用户补录'};return t?.active===false?`已取消${name} 取消记录时间 ${dateText(t.at)}  ${basis[t.basis]}`:`${name}时间 ${t?dateText(t.at)+'  '+basis[t.basis]:missing}`;}).join('\n');}
  async function makeDocx(records,opts={}){
    const title=opts.title||'X 推文研究资料汇编';let body=paragraph(title,'Title')+paragraph(`归档时间 ${dateText(opts.exportedAt||new Date().toISOString())}    收录 ${records.length} 条`)+paragraph('本文件整理推文作者、发文时间、正文与媒体文件位置。所选内容统一收录于本汇编。图片和视频集中保存于 media 目录，可通过同一交互式 HTML 页面浏览。');
    records.forEach((r,i)=>{body+=paragraph(`${i+1} ${r.author.name||r.author.handle||'作者资料缺失'}`,'Heading1');body+=paragraph(`账号 ${r.author.handle?'@'+r.author.handle:missing}    来源 ${r.sources.map(s=>sourceNames[s]).join('、')}\n发文时间 ${dateText(r.createdAt)}${interactionText(r)?'\n'+interactionText(r):''}\n推文编号 ${r.id}\n原文链接 ${r.url||'示例记录'}`);body+=paragraph(r.text||missing);if(!r.textComplete)body+=paragraph('正文完整性未核验 请在原文页面核对折叠内容');if(r.tags?.length)body+=paragraph('研究标签 '+r.tags.join('、'));if(r.notes)body+=paragraph('研究笔记','Heading2')+paragraph(r.notes);if(r.media.length){body+=paragraph('媒体资料','Heading2');for(const m of r.media){const a=r.assets?.find(x=>x.mediaId===m.id);body+=paragraph(`${m.type==='photo'?'图片':m.type==='animated_gif'?'动图视频':'视频'} ${m.id}  ${a?.status==='saved'||a?.status==='skipped'?a.path:a?.error||'媒体另存待核对'}\n媒体来源 ${m.url||missing}`);}}if(r.warnings.length)body+=paragraph('资料核对 '+r.warnings.join('；'));});
    const document=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
    const styles=`<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Noto Sans CJK SC"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="110" w:line="280" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="240"/><w:keepNext/></w:pPr><w:rPr><w:rFonts w:eastAsia="Noto Serif CJK SC"/><w:b/><w:sz w:val="40"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="140" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style></w:styles>`;
    const zip=new ZipArchive();await zip.add('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');await zip.add('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');await zip.add('word/document.xml',document);await zip.add('word/styles.xml',styles);await zip.add('word/_rels/document.xml.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');return zip.finish('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }
  function markdown(r){return `# ${r.author.name||r.author.handle||'作者缺失'}\n\n- 账号：${r.author.handle?'@'+r.author.handle:missing}\n- 发文时间：${dateText(r.createdAt)}\n- 原始时间：${r.createdAt||missing}\n- 原文链接：${r.url||'示例'}\n- 来源：${r.sources.map(s=>sourceNames[s]).join('、')}\n- 互动时间：${interactionText(r)||missing}\n- 正文完整性：${r.textComplete?'来自结构化响应':'未核验'}\n\n## 正文\n\n${r.text||missing}\n\n## 研究笔记\n\n${r.notes||'暂无笔记'}\n\n## 媒体\n\n${(r.assets||[]).map(a=>`- ${a.path||a.mediaId}：${a.status} ${a.error||''}`).join('\n')}\n`;}
  function csv(records){const cell=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return '\uFEFF'+[['推文编号','作者','账号','发文时间 UTC','发文时间 UTC+8','点赞时间 UTC','收藏时间 UTC','互动时间依据','采集时间 UTC','正文','原文链接','来源','标签','研究笔记','媒体数量','资料缺失'],...records.map(r=>[r.id,r.author.name,r.author.handle,r.createdAt||'',r.createdAt?dateText(r.createdAt):'',r.interactionTimes?.likes?.active!==false?r.interactionTimes?.likes?.at||'':'',r.interactionTimes?.bookmarks?.active!==false?r.interactionTimes?.bookmarks?.at||'':'',interactionText(r),r.capturedAt,r.text,r.url,r.sources.map(s=>sourceNames[s]).join('、'),r.tags.join('、'),r.notes,r.media.length,r.warnings.join('；')])].map(row=>row.map(cell).join(',')).join('\r\n');}

  return {missing,sourceNames,escapeHTML,safeName,safeURL,mediaURL,originalPhoto,chooseVideo,normalizeRecord,mergeRecords,fromTweet,extractGraphQL,parseInput,ZipArchive,makeDocx,markdown,csv,offlineIndex:Reader.createHTML,interactionText,dateText,iso,rangeStatus:Reader.rangeStatus,timeRangeBounds:Reader.timeRangeBounds,timeValues:Reader.timeValues,preferredInteractionTime:Reader.preferredInteractionTime};
});
