(function(root){
'use strict';
const C=root.PPTLab;
async function pptx(p,Pptx){
 const ppt=new (Pptx||root.pptxgen)();ppt.layout='LAYOUT_WIDE';ppt.author='原作工坊';ppt.subject=p.scene;ppt.title=p.title;ppt.company='Originals Studio';ppt.lang='zh-CN';ppt.theme={headFontFace:'Microsoft YaHei',bodyFontFace:'Microsoft YaHei',lang:'zh-CN'};
 const c=C.palettes[p.theme]||C.palettes.coral,scale=13.333333/1280;
 const rect=(s,x,y,w,h,color)=>s.addShape(ppt.ShapeType.rect,{x:x*scale,y:y*scale,w:w*scale,h:h*scale,line:{color,transparency:100},fill:{color}});
 const tx=(s,text,x,y,w,h,size,color=c.ink,bold=false)=>s.addText(String(text||''),{x:x*scale,y:y*scale,w:w*scale,h:h*scale,fontFace:'Microsoft YaHei',fontSize:size*.75,color,bold,margin:0,breakLine:false,fit:'shrink',valign:'top',paraSpaceAfterPt:0});
 p.slides.forEach((v,i)=>{
  const s=ppt.addSlide();s.background={color:c.bg};rect(s,58,55,44,5,c.accent);tx(s,p.scene,116,46,600,26,16);rect(s,58,652,1164,1,c.soft);tx(s,p.title,58,664,1050,25,13);tx(s,String(i+1).padStart(2,'0'),1180,664,48,25,15);
  if(v.layout==='cover'){
   rect(s,897,0,383,652,c.accent);s.addShape(ppt.ShapeType.ellipse,{x:965*scale,y:188*scale,w:244*scale,h:244*scale,line:{color:c.bg,width:1.5},fill:{color:c.accent,transparency:100}});s.addShape(ppt.ShapeType.ellipse,{x:1003*scale,y:226*scale,w:168*scale,h:168*scale,line:{color:c.bg,width:1.5},fill:{color:c.accent,transparency:100}});s.addShape(ppt.ShapeType.line,{x:945*scale,y:140*scale,w:282*scale,h:340*scale,flipV:true,line:{color:c.bg,width:1.5}});s.addShape(ppt.ShapeType.line,{x:958*scale,y:150*scale,w:256*scale,h:325*scale,line:{color:c.bg,width:1.5}});tx(s,'IDEA →',945,520,300,90,65,c.bg,true);tx(s,C.wrap(v.title,13).join('\n'),58,165,786,320,58,c.ink,true);tx(s,v.points.join(' · '),62,510,756,100,23);
  }else{
   tx(s,v.title,58,100,1164,105,40,c.ink,true);if(v.subtitle)tx(s,v.subtitle,60,204,1100,33,20,c.accent);
   let pts=v.points.slice(0,4);
   if(v.image && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(v.image)){
    const ar=v.imageAspect||1,iw=Math.min(400,350*ar),ih=iw/ar;s.addImage({data:v.image,x:(820+(400-iw)/2)*scale,y:(247+(350-ih)/2)*scale,w:iw*scale,h:ih*scale});
    pts.slice(0,3).forEach((t,j)=>{rect(s,64,270+j*112,8,8,c.accent);tx(s,t,91,247+j*112,685,97,23);});
   }else if(v.layout==='cards')pts.forEach((t,j)=>{const x=58+(j%2)*590,y=246+Math.floor(j/2)*181;rect(s,x,y,566,158,c.soft);tx(s,'0'+(j+1),x+22,y+16,70,28,19,c.accent);tx(s,t,x+22,y+56,520,87,21);});
   else if(v.layout==='split'){rect(s,58,247,220,342,c.accent);tx(s,String(i).padStart(2,'0'),87,305,172,110,105,c.bg);pts.forEach((t,j)=>tx(s,t,326,245+j*87,875,77,23));}
   else pts.forEach((t,j)=>{tx(s,String(j+1).padStart(2,'0'),60,251+j*88,45,38,22,c.accent);tx(s,t,115,250+j*88,1100,76,24);});
  }
  s.addNotes(`${v.notes||''}\n\n来源：${v.sourceRef||p.sourceName||'未填写'}\n内容核对：${v.checked?'已人工核对':'待人工核对'}\n素材说明：${p.originality||'待填写'}`);
 });return ppt;
}
function deckHtml(p){const cards=p.slides.map((s,i)=>`<section class="slide${i===0?' active':''}">${C.svg(s,p,i)}<aside>${C.esc(s.notes)}</aside></section>`).join('');return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${C.esc(p.title)}</title><style>body{margin:0;background:#262d29;font-family:'Microsoft YaHei',sans-serif}main{min-height:100vh;display:grid;place-items:center}.slide{display:none;width:min(96vw,1400px)}.slide.active{display:block}svg{width:100%;height:auto;max-height:85vh}aside{display:none}nav{position:fixed;bottom:14px;display:flex;justify-content:center;gap:15px;width:100%;color:#f1f0ec;font-size:13px}button{background:#e8e5db;border:0;padding:9px 16px;border-radius:4px;cursor:pointer}#notes{position:fixed;inset:10% 12% auto;background:#f1f0ec;padding:25px;line-height:1.8;white-space:pre-wrap;max-height:65vh;overflow:auto;display:none}@media print{body{background:#f1f0ec}main{display:block}.slide{display:block;width:100%;break-after:page}svg{max-height:none}nav,#notes{display:none!important}@page{size:landscape;margin:0}}</style></head><body><main>${cards}</main><nav><button id="prev">← 上一页</button><span id="num"></span><button id="next">下一页 →</button><button id="note">讲稿</button><button onclick="window.print()">打印 / PDF</button></nav><div id="notes"></div><script>let i=0;const ss=[...document.querySelectorAll('.slide')];function show(n){i=Math.max(0,Math.min(ss.length-1,n));ss.forEach((s,j)=>s.classList.toggle('active',i===j));document.getElementById('num').textContent=(i+1)+' / '+ss.length;document.getElementById('notes').textContent=ss[i].querySelector('aside').textContent;}document.getElementById('prev').onclick=()=>show(i-1);document.getElementById('next').onclick=()=>show(i+1);document.getElementById('note').onclick=()=>{let n=document.getElementById('notes');n.style.display=n.style.display==='block'?'none':'block'};document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')show(i+1);if(e.key==='ArrowLeft')show(i-1);if(e.key==='Escape')document.getElementById('notes').style.display='none'});show(0);<\/script></body></html>`;}
function copy(p,channel='小红书'){
 const titles=[`${p.title}｜给${p.audience||'使用者'}的一份实践材料`,`${p.slides.length} 页梳理：${p.title}`,`从资料到行动：${p.title}`];
 const outline=p.slides.filter(s=>s.layout!=='cover').slice(0,5).map(s=>'· '+s.title).join('\n');
 return `【${channel}发布草稿 · 请按实际内容修改】\n\n标题备选\n${titles.map((t,i)=>(i+1)+'. '+t).join('\n')}\n\n正文\n这份「${p.title}」面向${p.audience||'目标用户'}，围绕${p.scene||'实际任务'}整理成 ${p.slides.length} 页。\n\n内容包括：\n${outline}\n\n交付格式：可编辑 PPTX、HTML 演示、逐页讲稿。\n使用前请核对素材授权、内容准确性与适用范围。\n\n#${p.scene||'PPT'} #资料整理 #原创设计\n\n商品说明建议\n使用对象：${p.audience}\n使用场景：${p.scene}\n可修改内容：文字、基础图形、配色；上传配图以图片对象保存。\n授权与售后范围：请自行填写真实条款。\n资料出处：${p.sourceName||'待补充'}\n来源链接：${p.sourceUrl||'待补充'}\n原创贡献：${p.originality||'待补充'}\n\n未自动发布；销售与触达结果需实际验证。`;
}
function notes(p){return `# ${p.title}\n\n受众：${p.audience}\n资料：${p.sourceName}\n来源链接：${p.sourceUrl||'未填写'}\n素材说明：${p.originality||'待补充'}\n\n`+p.slides.map((s,i)=>`## ${i+1}. ${s.title}\n\n${s.points.map(t=>'- '+t).join('\n')}\n\n讲稿：\n${s.notes}\n\n来源：${s.sourceRef}\n核对状态：${s.checked?'已人工核对':'待核对'}`).join('\n\n');}
root.LabExport={pptx,deckHtml,copy,notes};if(typeof module!=='undefined')module.exports=root.LabExport;
})(typeof globalThis!=='undefined'?globalThis:this);
