(function(root){
'use strict';
const palettes={coral:{name:'瑞士 · 合欢红',bg:'F1F0EC',ink:'272C2A',accent:'E07563',soft:'E4E1D8'},forest:{name:'自然 · 森林绿',bg:'F0F0E7',ink:'253D35',accent:'658876',soft:'DDE4D9'},ink:{name:'学术 · 水墨蓝',bg:'ECEFF0',ink:'233845',accent:'688B9D',soft:'D7E0E5'},sand:{name:'手绘 · 麦芽黄',bg:'F5EDDE',ink:'493F32',accent:'B6874C',soft:'E8D8BD'}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const demo=`# 从空间模型到业务闭环
数字孪生课程需要同时关注物理对象、数据、模型与业务任务。三维场景可以帮助理解空间关系，业务流程则说明数据如何支持行动。
课堂任务：用校园设备巡检案例，说明发现异常、定位设备、派发工单、处理问题与复核结果的关系。
# 先定义业务问题
明确使用者、对象范围与交付成果，再选择技术。以校园巡检为例，先记录设备在哪里、谁负责、异常如何处理。
本次教学目标：学生能够画出流程，说明每个步骤的输入与输出，并识别资料中缺少的信息。
# 建立对象清单
为楼栋、房间、设备分别建立标识。将空间位置、设备属性和负责人组织到同一份对象清单中。
练习：为三栋教学楼的十台示例设备设置编号，建立设备编号与模型构件之间的对应关系。示例数据仅用于课堂练习。
# 整理数据来源
列出静态台账、巡检记录、传感器数据等来源。分别记录更新方式、责任人、时间和来源文件。
检查缺失值、单位、时间格式及重复编号。无法确认的数据应保留待核查标记。
# 设计三维交互
在场景中提供选择、定位、属性查看与状态筛选。颜色表达需要配合文字或图标，便于不同使用者理解。
练习：点击设备后显示编号、最近巡检记录、负责人和工单入口，并保留返回总览的路径。
# 串联巡检流程
课堂示例采用发现异常、生成工单、分派处理、上传结果、复核关闭的流程。
讨论：如果处理完成但没有复核记录，工单应处于什么状态？请结合课程任务说明理由。
# 让结果可验证
为每个任务定义检查方法：定位是否正确、属性能否追溯、工单状态是否一致、操作记录是否完整。
学生需要提交操作记录、流程图和问题清单。评价依据应在实训开始前提供。
# 形成项目交付
最终交付包含演示页面、数据字典、对象清单和操作说明。说明案例数据的来源与使用范围。
课后任务：选择一个新的校园场景，写出业务目标、对象清单和数据需求，并标注尚未确认的信息。`;
function newProject(){return {id:uid(),title:'数字孪生校园 · 从场景到业务闭环',audience:'高职学生 / 数字孪生应用技术',scene:'教学课件',theme:'coral',pages:10,source:demo,sourceName:'内置教学设计样例',sourceUrl:'',rights:'示例',slides:[],gates:[false,false,false,false,false],created:new Date().toISOString(),updated:new Date().toISOString(),market:{demand:3,pay:3,supply:3,advantage:4,timing:3,evidence:'待补充真实用户访谈、同类产品记录与素材权利说明。',price:29,cost:5,hours:2,rate:60,sales:20,fee:5},originality:'',history:[]};}
function sections(text){
 const lines=clean(text).split(/\r?\n/);let out=[],curr={title:'',lines:[]};
 const flush=()=>{if(curr.lines.length)out.push(curr);curr={title:'',lines:[]};};
 for(let l of lines){l=clean(l);if(!l)continue;if(/^#{1,6}\s+/.test(l)){flush();curr.title=l.replace(/^#{1,6}\s+/,'');}else{curr.lines.push(l.replace(/^[-*•]\s*/,''));}}
 flush();return out;
}
function sentences(text){return clean(text).split(/(?<=[。！？；])\s*/u).filter(Boolean);}
function generate(p){
 if(clean(p.source).length<30)throw Error('请先输入至少 30 字资料，或载入示例。');
 let sec=sections(p.source),max=Math.max(2,Math.min(22,Number(p.pages||10)-2));
 let chunks=[];
 for(const s of sec){let lines=s.lines.flatMap(sentences);for(let i=0;i<lines.length;i+=4)chunks.push({title:s.title||lines[i].slice(0,22),lines:lines.slice(i,i+4)});}
 if(chunks.length>max){const grouped=[];for(let i=0;i<max;i++){let g=chunks.slice(Math.floor(i*chunks.length/max),Math.floor((i+1)*chunks.length/max));grouped.push({title:g[0].title,lines:g.flatMap(x=>x.lines)});}chunks=grouped;}
 const make=(title,points,layout,sourceRef)=>({id:uid(),title:clean(title),subtitle:'',points:points.map(clean),notes:points.join('\n'),layout,image:'',sourceRef,checked:false});
 let slides=[make(p.title,[p.audience,p.scene],'cover','项目设定')];
 chunks.forEach((s,i)=>{const v=make(s.title,s.lines.slice(0,4),i%3===0?'split':i%3===1?'cards':'editorial',p.sourceName||'输入资料');v.notes=s.lines.join('\n');slides.push(v);});
 slides.push(make('回顾与行动',chunks.slice(0,4).map(x=>x.title),'summary',p.sourceName||'输入资料'));
 return slides;
}
function wrap(text,max){let lines=[],s='';for(const c of clean(text)){if(c==='\n'){lines.push(s);s='';continue;}s+=c;if(s.length>=max){lines.push(s);s='';}}if(s)lines.push(s);return lines;}
function textSvg(s,x,y,max,size,color,limit=9,weight=400){return wrap(s,max).slice(0,limit).map((t,i)=>`<text x="${x}" y="${y+i*size*1.5}" font-size="${size}" fill="#${color}" font-weight="${weight}" font-family="Noto Sans SC,Microsoft YaHei,Arial,sans-serif">${esc(t)}</text>`).join('');}
function svg(slide,p,index=0){
 const c=palettes[p.theme]||palettes.coral; const cover=slide.layout==='cover';let out=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#${c.bg}"/><rect x="58" y="55" width="44" height="5" fill="#${c.accent}"/>${textSvg(p.scene||'原创作品',116,64,40,16,c.ink,1)}<line x1="58" y1="652" x2="1222" y2="652" stroke="#${c.ink}" stroke-opacity=".2"/>${textSvg((p.title||'').slice(0,40),58,682,45,13,c.ink,1)}<text x="1220" y="682" text-anchor="end" fill="#${c.ink}" font-family="Arial" font-size="15">${String(index+1).padStart(2,'0')}</text>`;
 if(cover){out+=`<rect x="897" y="0" width="383" height="652" fill="#${c.accent}"/><circle cx="1087" cy="310" r="122" fill="none" stroke="#${c.bg}" stroke-width="2"/><circle cx="1087" cy="310" r="84" fill="none" stroke="#${c.bg}" stroke-width="2"/><path d="M945 480L1227 140M958 150L1214 475" stroke="#${c.bg}" stroke-width="2"/><text x="946" y="590" fill="#${c.bg}" font-family="Arial" font-size="65" font-weight="700">IDEA →</text>`;
 out+=textSvg(slide.title,58,230,13,58,c.ink,4,700);out+=textSvg(slide.points.join(' · '),62,553,30,23,c.ink,2);}
 else {out+=textSvg(slide.title,58,144,28,40,c.ink,2,700);if(slide.subtitle)out+=textSvg(slide.subtitle,60,215,48,20,c.accent,1);
 let points=slide.points.slice(0,4);
 if(slide.image && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(slide.image)){out+=`<image x="820" y="247" width="400" height="350" preserveAspectRatio="xMidYMid meet" href="${slide.image}"/>`;points.slice(0,3).forEach((b,i)=>{out+=`<circle cx="69" cy="${272+i*112}" r="5" fill="#${c.accent}"/>`+textSvg(b,91,280+i*112,26,23,c.ink,3);});}
 else if(slide.layout==='cards'){points.forEach((b,i)=>{const x=58+(i%2)*590,y=246+Math.floor(i/2)*181;out+=`<rect x="${x}" y="${y}" width="566" height="158" fill="#${c.soft}"/><text x="${x+22}" y="${y+40}" font-size="19" fill="#${c.accent}" font-family="Arial">0${i+1}</text>`+textSvg(b,x+22,y+81,24,21,c.ink,3);});}
 else if(slide.layout==='split'){out+=`<rect x="58" y="247" width="220" height="342" fill="#${c.accent}"/><text x="87" y="388" font-size="105" fill="#${c.bg}" font-family="Arial">${String(index).padStart(2,'0')}</text>`;points.forEach((b,i)=>{out+=textSvg(b,326,272+i*87,35,23,c.ink,2);});}
 else{points.forEach((b,i)=>{out+=`<text x="60" y="${279+i*88}" font-family="Arial" font-size="22" fill="#${c.accent}">${String(i+1).padStart(2,'0')}</text>`+textSvg(b,115,279+i*88,45,24,c.ink,2);});}}
 return out+'</svg>';
}
function issues(p){const a=[];if(!p.source.trim())a.push({level:'需补齐',text:'项目尚无来源资料。'});if(!p.sourceName.trim())a.push({level:'需补齐',text:'请补充资料名称或出处。'});if(!p.originality.trim())a.push({level:'需补齐',text:'请填写素材权利与原创贡献说明。'});if(!p.slides.length)a.push({level:'需补齐',text:'尚未生成页面。'});p.slides.forEach((s,i)=>{if(!s.title.trim())a.push({level:'需修改',text:`第 ${i+1} 页缺少标题。`});if(s.title.length>48)a.push({level:'需修改',text:`第 ${i+1} 页标题过长，请压缩至 48 字以内。`});if((s.image&&s.points.length>3)||s.points.length>4||s.points.some(t=>t.length>70))a.push({level:'需修改',text:`第 ${i+1} 页信息较密，请拆页或缩短要点（每项建议 ≤70 字，配图页最多 3 项）。`});if(!s.checked)a.push({level:'待核对',text:`第 ${i+1} 页尚未完成人工内容核对。`});});return a;}
function score(m){return Math.round((Number(m.demand)*.3+Number(m.pay)*.25+Number(m.supply)*.15+Number(m.advantage)*.2+Number(m.timing)*.1)*20);}
function economics(m){const price=Math.max(0,+m.price||0),cost=Math.max(0,+m.cost||0),fee=Math.min(100,Math.max(0,+m.fee||0)),fixed=Math.max(0,+m.hours||0)*Math.max(0,+m.rate||0),margin=price*(1-fee/100)-cost;return{fixed,margin,profit:margin*Math.max(0,+m.sales||0)-fixed,breakEven:margin>0?Math.ceil(fixed/margin):null};}
function normalizeAi(o,p){if(!o||!Array.isArray(o.slides)||o.slides.length<2)throw Error('模型未返回有效的 slides 数组。');return o.slides.slice(0,30).map(s=>({id:uid(),title:clean(s.title).slice(0,100),subtitle:clean(s.subtitle).slice(0,120),points:(Array.isArray(s.points)?s.points:[]).slice(0,8).map(x=>clean(x).slice(0,500)),notes:clean(s.notes).slice(0,6000),sourceRef:clean(s.sourceRef)||p.sourceName,layout:['cover','cards','split','editorial','summary'].includes(s.layout)?s.layout:'editorial',image:'',checked:false}));}
function hydrate(o){if(!o||typeof o!=='object'||!Array.isArray(o.slides)||o.slides.length>100)throw Error('不是有效的项目文件。');const p=newProject();for(const k of ['title','audience','scene','source','sourceName','sourceUrl','originality'])p[k]=clean(o[k]).slice(0,k==='source'?150000:6000);p.id=uid();p.theme=palettes[o.theme]?o.theme:'coral';p.pages=Math.max(6,Math.min(24,+o.pages||10));p.rights=clean(o.rights);p.slides=o.slides.map(s=>({id:uid(),title:clean(s.title).slice(0,100),subtitle:clean(s.subtitle).slice(0,120),points:(Array.isArray(s.points)?s.points:[]).slice(0,20).map(x=>clean(x).slice(0,2000)),notes:clean(s.notes).slice(0,8000),sourceRef:clean(s.sourceRef),layout:['cover','cards','split','editorial','summary'].includes(s.layout)?s.layout:'editorial',imageAspect:Number.isFinite(+s.imageAspect)&&+s.imageAspect>0?+s.imageAspect:1,image:/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(s.image||'')?s.image:'',checked:false}));p.gates=[false,false,false,false,false];const m=o.market||{};for(const k of ['demand','pay','supply','advantage','timing'])p.market[k]=Math.max(1,Math.min(5,Math.round(Number(m[k])||3)));for(const k of ['price','cost','hours','rate','sales','fee'])p.market[k]=Number.isFinite(+m[k])?Math.max(0,Math.min(k==='fee'?100:10000000,+m[k])):p.market[k];p.market.evidence=clean(m.evidence).slice(0,12000);return p;}
root.PPTLab={palettes,esc,clean,uid,demo,newProject,sections,generate,wrap,svg,issues,score,economics,normalizeAi,hydrate};if(typeof module!=='undefined')module.exports=root.PPTLab;
})(typeof globalThis!=='undefined'?globalThis:this);
