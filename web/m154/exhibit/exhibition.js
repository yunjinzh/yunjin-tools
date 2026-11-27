import {plateViewer} from './plates.js';
const $=s=>document.querySelector(s), frames=[...document.querySelectorAll('video')];
const chapterBox=$('#chapters'),poster=$('#poster'),photo=$('#documentary'),seek=$('#seek'),dialog=$('#about');
const state={index:0,slot:0,serial:0,playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,photograph:false,needsPlay:false,clean:false};
const format=t=>String(Math.floor((t||0)/60)).padStart(2,'0')+':'+String(Math.floor((t||0)%60)).padStart(2,'0');
let chapters=[],gallery={},startFrame=0;
const current=()=>frames[state.slot],row=()=>chapters[state.index];
const openPlate=plateViewer(()=>{current().pause();},()=>{if(state.playing&&!state.photograph)setPlay(true);});
$('#nativePlate').onclick=()=>{if(row())openPlate(row());};
const mediaSrc=c=>'exhibit/'+c.id+(frames[0].canPlayType('video/mp4; codecs="avc1.42E01E"')?'.mp4':'.webm');
const docKey={cbd:['cbd','cbd-dusk'],hutong:['hutong','lane-trees'],waterfront:['waterfront','lake-path'],palace:['palace','twilight'],avenue:['tiananmen','bridge']};
function inform(message){$('#status').textContent=message||'';}
function setPlay(value){
 state.playing=value;state.needsPlay=false;
 const b=$('#play');b.textContent=value?'Ⅱ':'▶';b.title=value?'暂停播放':'继续播放';b.setAttribute('aria-label',b.title);
 if(state.photograph||!value){current().pause();return;}
 const movie=current();movie.play().catch(error=>{
  if(movie!==current()||!state.playing||error.name==='AbortError')return;
  if(error.name==='NotAllowedError'){setPlay(false);inform('点击播放即可开始展映');}
  else if(!movie.error)inform('影片正在载入');
 });
}
function prep(v,c,priority){
 if(v.dataset.id===c.id)return;
 v.pause();v.classList.remove('active');v.dataset.id=c.id;v.preload=priority?'auto':'metadata';
 v.src=mediaSrc(c);v.load();
}
function updateTimeline(){
 const c=row();if(c){const v=current(),t=v.currentTime||0,d=Number.isFinite(v.duration)?v.duration:c.duration;
  $('#elapsed').textContent=format(t);$('#duration').textContent=format(d);seek.value=String(Math.round(1000*t/d));}
 startFrame=requestAnimationFrame(updateTimeline);
}
function syncDocument(){
 const c=row(),[group,id]=docKey[c.id],doc=(gallery[group]||[]).find(p=>p.id===id)||(gallery[group]||[])[0];
 if(!doc){state.photograph=false;return;}
 photo.src=doc.file;photo.alt=doc.name;
 $('#medium').textContent='实景摄影';$('#district').textContent=({hutong:'南锣鼓巷及周边',waterfront:'什刹海水岸',avenue:'北京中轴线'}[c.id]||c.district);$('#english').textContent='Field photography';$('#title').textContent=doc.name;
 $('#caption').replaceChildren();const a=document.createElement('a');a.href=doc.url;a.textContent=doc.credit;a.target='_blank';a.rel='noopener';
 const license=document.createElement('a');license.href=doc.licenseUrl;license.textContent=doc.license;license.target='_blank';license.rel='noopener';
 $('#caption').append((doc.date?doc.date.slice(0,10)+'　':'')+'摄影　',a,'　',license);
}
function showPhoto(value){
 state.photograph=value;
 if(value){current().pause();syncDocument();}
 if(!state.photograph){const c=row();$('#title').textContent=c.name;$('#english').textContent=c.en;$('#medium').textContent='三维展映';$('#district').textContent=c.district;$('#caption').textContent=c.caption;setPlay(state.playing);}
 photo.hidden=!state.photograph;document.body.classList.toggle('photo',state.photograph);
 $('#photos').textContent=state.photograph?'返回三维展映':'同区域实景';$('#photos').setAttribute('aria-pressed',String(state.photograph));$('#play').disabled=state.photograph;seek.disabled=state.photograph;
}
function select(i,write=true){
 i=(i+chapters.length)%chapters.length;state.index=i;state.serial++;
 const c=row(),other=frames[1-state.slot];document.documentElement.style.setProperty('--focus-x',({cbd:'80%',palace:'54%',hutong:'52%',waterfront:'56%',avenue:'53%'}[c.id]||'50%'));if(other.dataset.id===c.id){current().pause();current().classList.remove('active');state.slot=1-state.slot;}
 const movie=current();prep(movie,c,true);movie.classList.remove('active');
 if(movie.readyState>=1)movie.currentTime=0;
 poster.src='exhibit/'+c.id+'.webp';$('#english').textContent=c.en;$('#title').textContent=c.name;$('#position').innerHTML=c.anchor[1].toFixed(4)+'° N<br>'+c.anchor[0].toFixed(4)+'° E';
 $('#explore').href='explore.html?'+new URLSearchParams({landmark:c.scene,view:c.view,time:c.time,...(c.id==='hutong'||c.id==='waterfront'?{mode:'walk'}:{})});
 [...chapterBox.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
 if(write){const url=new URL(location.href);url.searchParams.set('chapter',c.id);history.replaceState(null,'',url);}
 inform('');showPhoto(state.photograph);prep(frames[1-state.slot],chapters[(i+1)%chapters.length],false);
 if(movie.readyState>=2)movie.classList.add('active');
}
for(const m of frames){
 m.addEventListener('loadeddata',()=>{if(m===current()){inform('');m.classList.add('active');}});
 m.addEventListener('playing',()=>{if(m===current()){m.classList.add('active');inform('');}});
 m.addEventListener('ended',()=>{if(m===current()&&state.playing&&!state.photograph)select(state.index+1);});
 m.addEventListener('error',()=>{if(m!==current())return;m.classList.remove('active');setPlay(false);inform('影片未能载入。可选择下一章，或进入三维漫游。');});
}
function clean(v){state.clean=v;document.body.classList.toggle('clean',v);$('#reveal').hidden=!v;(v?$('#reveal'):$('#clean')).focus({preventScroll:true});}
$('#clean').onclick=()=>clean(true);$('#reveal').onclick=()=>clean(false);
$('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{inform('本浏览器可通过系统全屏键进入展览模式');}};
function toggleAbout(){if(dialog.open){dialog.close();return;}state.needsPlay=state.playing;current().pause();dialog.showModal();}
$('#guide').onclick=toggleAbout;dialog.addEventListener('close',()=>{if(state.needsPlay){state.needsPlay=false;setPlay(true);}});
$('#photos').onclick=()=>showPhoto(!state.photograph);$('#play').onclick=()=>setPlay(!state.playing);
$('#prev').onclick=()=>select(state.index-1);$('#next').onclick=()=>select(state.index+1);
seek.oninput=()=>{const v=current();if(Number.isFinite(v.duration))v.currentTime=v.duration*(Number(seek.value)/1000);};
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target===seek||!chapters.length)return;
 if(e.key==='ArrowLeft')select(state.index-1);else if(e.key==='ArrowRight')select(state.index+1);
 else if(e.code==='Space'&&!state.photograph){if(e.target.matches('button,a'))return;setPlay(!state.playing);}
 else if(e.key.toLowerCase()==='h')clean(!state.clean);else if(e.key==='Escape'&&state.clean)clean(false);else return;
 e.preventDefault();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)current().pause();else if(state.playing&&!state.photograph&&!document.querySelector('dialog[open]'))setPlay(true);});
async function boot(){
 const response=await fetch('exhibit/chapters.json');if(!response.ok)throw Error('chapters');
 chapters=await response.json();$('#cycleInfo').textContent=chapters.length+' 章 · '+chapters.reduce((sum,c)=>sum+c.duration,0)+' 秒';
 for(const [i,c] of chapters.entries()){
  const b=document.createElement('button');b.className='chapter';b.setAttribute('aria-label','播放'+c.name);
  const img=document.createElement('img');img.src='exhibit/'+c.id+'-thumb.webp';img.alt='';const box=document.createElement('span');
  const meta=document.createElement('small');meta.textContent=c.district+' · '+String(c.duration)+' s';const name=document.createElement('strong');name.textContent=c.name;box.append(meta,name);b.append(img,box);b.onclick=()=>select(i);chapterBox.append(b);
 }
 const pick=new URLSearchParams(location.search).get('chapter');select(Math.max(0,chapters.findIndex(c=>c.id===pick)),false);updateTimeline();
 const files=await Promise.all(['field/index.json','field/urban-index.json'].map(p=>fetch(p).then(r=>r.json()).catch(()=>({}))));gallery=Object.assign({},...files);$('#photos').disabled=!Object.keys(gallery).length;
}
boot().catch(()=>inform('展映目录载入失败，可进入三维漫游。'));
