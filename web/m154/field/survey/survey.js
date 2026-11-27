const $=selector=>document.querySelector(selector);
const stage=$('#stage'),frame=$('#frame'),canvas=$('#canvas'),remote=$('#remote');
const params=new URLSearchParams(location.search),rad=Math.PI/180;
const state={row:null,version:0,az:0,el:0,zoom:1,model:false,renderer:null,drag:null,request:0};
let catalog;
function link(url,label){const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';return a;}
function redraw(){
  if(!state.row?.file||state.request)return;
  state.request=requestAnimationFrame(()=>{state.request=0;if(!state.row?.file)return;
    if(state.model){state.renderer.draw(state.az,state.el,state.row.distance/state.zoom);return;}
    const count=state.row.frameCount,index=((Math.round(state.az/(2*Math.PI)*count)%count)+count)%count;
    const src='frames/'+state.row.id+'-'+String(index).padStart(2,'0')+'.webp';
    if(frame.getAttribute('src')!==src)frame.src=src;
    frame.style.transform='scale('+state.zoom+')';
  });
}
function reset(){const r=state.row;state.az=r.frame*2*Math.PI/r.frameCount;state.el=r.pitch*rad;state.zoom=1;redraw();}
function turn(n){state.az+=n*2*Math.PI/state.row.frameCount;redraw();}
function zoom(n){state.zoom=Math.min(4,Math.max(.75,state.zoom*n));redraw();}
function fallback(){
  state.model=false;canvas.hidden=true;frame.hidden=false;$('#status').textContent='';
  $('#mode').textContent='16 向离线视图 · 拖动旋转';redraw();
}
function remotePlayer(r){
  remote.replaceChildren();
  const button=document.createElement('button');button.textContent='加载在线三维原作';
  const note=document.createElement('p');note.textContent='由 Sketchfab 提供，需要联网。';
  remote.append(note,button,link(r.url,'在原站查看'));
  button.onclick=()=>{const player=document.createElement('iframe');player.title=r.title;player.allow='fullscreen; xr-spatial-tracking';player.allowFullscreen=true;const embed=new URL(r.embed);embed.searchParams.set('autostart','1');player.src=embed.href;remote.replaceChildren(player);};
}
async function choose(id){
  const r=catalog[id]||catalog.art798;state.row=r;const version=++state.version;state.model=false;state.drag=null;state.renderer?.clear();
  const u=new URL(location.href);u.searchParams.set('model',r.id);history.replaceState(null,'',u);
  document.title=r.title+' · 京观摄影测量';
  for(const b of $('#works').children)b.setAttribute('aria-pressed',String(b.dataset.id===r.id));
  $('#title').textContent=r.title;$('#area').textContent=r.area;$('#description').textContent=r.description;$('#location').textContent=r.location;if(r.locationUrl)$('#location').append('\u0020',link(r.locationUrl,'地区资料'));
  $('#credit').replaceChildren('作者 ',link(r.url,r.author),' · ',link(r.licenseUrl,r.license),' · 发布于 '+r.published);
  $('#details').hidden=!r.file;$('#changes').textContent=r.changes||'';
  $('#download').replaceChildren();$('#tools').hidden=!r.file;
  remote.hidden=!!r.file;frame.hidden=!r.file;canvas.hidden=true;$('#status').textContent='';remote.replaceChildren();
  if(!r.file){$('#mode').textContent='在线原作 · '+r.author;remotePlayer(r);return;}
  $('#download').append('展示网格 '+r.faces.toLocaleString('zh-CN')+' 个三角面。',link(r.file,'打开 GLB 文件'),' · ',link(r.sourceUrl,'来源仓库'));
  frame.alt=r.title+'摄影测量模型';fallback();reset();
  if(params.get('mode')==='frames'||!('WebGL2RenderingContext'in window))return;
  try{
    if(!state.renderer){const {meshView}=await import('./mesh.js');if(version!==state.version)return;state.renderer=meshView(canvas);}
    $('#status').textContent='正在载入三维网格…';
    if(!await state.renderer.load(r.file)||version!==state.version)return;
    state.model=true;frame.hidden=true;canvas.hidden=false;$('#mode').textContent='纹理网格 · 拖动旋转，滚轮缩放';$('#status').textContent='';redraw();
  }catch{if(version===state.version)fallback();}
}

$('#left').onclick=()=>turn(-1);$('#right').onclick=()=>turn(1);$('#minus').onclick=()=>zoom(1/1.25);$('#plus').onclick=()=>zoom(1.25);$('#reset').onclick=reset;
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(state.row?.file)fallback();});
stage.onpointerdown=e=>{if(!state.row?.file)return;stage.setPointerCapture(e.pointerId);state.drag={x:e.clientX,y:e.clientY};};
stage.onpointermove=e=>{if(!state.drag)return;const x=e.clientX-state.drag.x,y=e.clientY-state.drag.y;state.drag={x:e.clientX,y:e.clientY};state.az-=x*.011;state.el=Math.max(-1.38,Math.min(1.38,state.el+y*.009));redraw();};
stage.onpointerup=stage.onpointercancel=stage.onlostpointercapture=()=>{state.drag=null;};
stage.onwheel=e=>{if(!state.row?.file)return;e.preventDefault();zoom(Math.exp(Math.max(-300,Math.min(300,-e.deltaY))*.002));};
stage.onkeydown=e=>{if(!state.row?.file)return;const actions={ArrowLeft:()=>turn(-1),ArrowRight:()=>turn(1),'+':()=>zoom(1.25),'-':()=>zoom(.8),Home:reset};if(actions[e.key]){e.preventDefault();actions[e.key]();}};
new ResizeObserver(redraw).observe(stage);
try{
  const response=await fetch('index.json');if(!response.ok)throw Error();
  catalog=await response.json();
  for(const r of Object.values(catalog)){
    const b=document.createElement('button'),title=document.createElement('strong'),type=document.createElement('small');
    b.dataset.id=r.id;title.textContent=r.title;type.textContent=r.area+' · '+(r.file?'离线模型':'在线原作');
    b.append(title,type);b.onclick=()=>choose(r.id);$('#works').append(b);
  }
  await choose(params.get('model'));
}catch{$('#status').textContent='作品目录加载失败，请刷新重试。';}
