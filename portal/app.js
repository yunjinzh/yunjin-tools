let modules=[],active='all';
const $=selector=>document.querySelector(selector);
const labels={web:'网页直达',server:'需要后端',extension:'浏览器扩展',desktop:'Windows 程序',missing:'待补原包'};
const actions={web:'打开工具',server:'查看运行方式',extension:'下载与安装',desktop:'下载完整程序',missing:'查看原交付'};
const colors=[['#dce6dc','#718e79','#b7c9b7'],['#eedfd3','#ba826a','#d9b59e'],['#dde6eb','#728da1','#b7c9d5'],['#eae3d4','#ac956c','#d6c5a3'],['#e6e1eb','#94829d','#c8b9d2'],['#dce8e5','#719794','#b3ccca']];
const art={'m121':'qingdi.svg','m127':'ridge.svg','m128':'earth-plates.svg','m129':'shape-studio.svg','m132':'cartography-evolution.svg','m134':'map-atelier.svg','m135':'funding-insights.svg','m137':'spatial-workbench.svg','m138':'factory-reconstruction.svg','m139':'kunye-training.svg','m123':'stageshow.svg','m124':'designlab.svg','m125':'gem.svg'};
function escape(text){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function apply(){
 const q=$('#search').value.trim().toLocaleLowerCase(),kind=$('#availability').value;
 const matches=modules.filter(m=>(active==='all'||m.category===active)&&(kind==='all'||kind==='package'&&['extension','desktop'].includes(m.kind)||kind===m.kind)&&(!q||(m.name+' '+m.description+' '+m.category).toLocaleLowerCase().includes(q)));
 $('#grid').innerHTML=matches.map(m=>{const c=colors[Number(m.id.slice(1))%colors.length];return `<a class="card" href="${escape(m.url)}" ${m.kind==='web'?'target="_blank" rel="noopener noreferrer"':''} style="--wash:${c[0]};--ink:${c[1]};--soft:${c[2]}"><div class="art">${art[m.id]?`<img src="portal/${art[m.id]}" alt="" loading="lazy">`:'<div class="diagram" aria-hidden="true"><div class="diagram-grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>'}<span class="number">${m.id.slice(1)}</span><span class="tag">${labels[m.kind]}</span></div><div class="card-content"><span class="category">${escape(m.category)}</span><h3>${escape(m.name)}</h3><p class="description">${escape(m.description)}</p><div class="card-bottom"><span>${actions[m.kind]}</span><b aria-hidden="true">↗</b></div></div></a>`;}).join('');
 $('#result').textContent=`${matches.length} / ${modules.length} 项`;$('#empty').hidden=matches.length>0;
}
fetch('modules.json').then(r=>{if(!r.ok)throw new Error('目录加载失败');return r.json();}).then(data=>{
 modules=data;$('#count-all').textContent=data.length;$('#count-web').textContent=data.filter(x=>x.kind==='web').length;$('#count-local').textContent=String(data.filter(x=>['extension','desktop'].includes(x.kind)).length).padStart(2,'0');
 const categories=[...new Set(data.map(x=>x.category))];
 $('#categories').innerHTML=['all',...categories].map(cat=>`<button type="button" data-category="${escape(cat)}" class="${cat==='all'?'active':''}" aria-pressed="${cat==='all'}">${cat==='all'?'全部作品':escape(cat)}<small>${cat==='all'?data.length:data.filter(x=>x.category===cat).length}</small></button>`).join('');
 $('#categories').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;active=b.dataset.category;document.querySelectorAll('#categories button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});apply();});apply();
}).catch(()=>{$('#result').textContent='目录暂时无法读取，请刷新页面。';});
$('#search').addEventListener('input',apply);$('#availability').addEventListener('change',apply);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus();}if(e.key==='Escape'&&document.activeElement===$('#search')){$('#search').value='';apply();}});
