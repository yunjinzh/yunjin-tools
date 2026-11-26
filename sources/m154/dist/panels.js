import {climates} from './atmosphere.js';
import {locator} from './locator.js';
export const dispTime=t=>{const n=Math.min(1439,Math.max(0,Math.round(t*60)));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
const link=(url,name)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>';
const meta=fetch('./data/osm-source.json').then(r=>r.json()).catch(()=>null);
const photos=fetch('./photos/index.json').then(r=>r.json()).catch(()=>({}));
export function panels({landmarks,getSelected,go,nav,state,apply,toast,onLayer,getRenderer,getStats}){
 const dlg=document.querySelector('#dialog'),body=document.querySelector('#modalBody');let panel='',sourceNote='',weatherRun=0;
 const maps=locator({landmarks,getCamera:()=>nav.getCamera(),go:id=>{close();go(id);},flyTo:(lon,lat)=>{close();nav.mapFly(lon,lat);toast('已定位至所选坐标');}});
 const titles={map:['城市地图','CITY MAP'],env:['时间与天气','ENVIRONMENT'],detail:['地标档案','LANDMARK ARCHIVE'],sources:['数据来源与精度','DATA & CREDITS'],help:['漫游指南','FIELD GUIDE']};
 const close=()=>dlg.close();
 function reset(){maps.detach();weatherRun++;panel='';document.querySelector('#navScene').classList.add('active');document.querySelector('.nav-item[data-panel="map"]').classList.remove('active');}
 dlg.addEventListener('close',()=>{if(!dlg.open)reset()});document.querySelector('#closeDialog').onclick=close;
 dlg.addEventListener('click',e=>{const r=dlg.getBoundingClientRect();if(e.target===dlg&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))close()});
 document.addEventListener('pointerdown',e=>{if(dlg.open&&panel==='env'&&!dlg.contains(e.target)&&!e.target.closest('[data-panel="env"]'))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dlg.open)close()});
 document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>open(b.dataset.panel));
 document.querySelector('#navScene').onclick=()=>{if(dlg.open)close();document.querySelector('#stage').focus({preventScroll:true})};
 async function open(key){
  nav.stop();if(dlg.open&&panel===key){close();return;}if(dlg.open)dlg.close();panel=key;
  dlg.className=key==='map'?'map-dialog':key==='env'?'env-dialog':'';const [t,en]=titles[key];
  document.querySelector('#modalTitle').textContent=key==='detail'?getSelected().name:t;document.querySelector('#modalEn').textContent=en;body.innerHTML='';
  if(key==='env')dlg.show();else dlg.showModal();
  if(key==='map'){document.querySelector('#navScene').classList.remove('active');document.querySelector('.nav-item[data-panel="map"]').classList.add('active');
   body.innerHTML='<div class="map-switch"><button data-area="city" class="sel">核心城区</button><button data-area="region">区域地形</button></div><canvas class="mapview" aria-label="北京三维场景覆盖范围和八处地标"></canvas><div class="map-list"></div><p class="fine">点击地标飞往现场。滚轮缩放，拖动平移，双击覆盖区内的空白位置可自由定位。</p>';
   const list=body.querySelector('.map-list');landmarks.forEach(lm=>{const b=document.createElement('button');b.textContent=lm.short;b.classList.toggle('selected',lm.id===getSelected().id);b.onclick=()=>{close();go(lm.id)};list.append(b)});maps.attach(body.querySelector('canvas'));body.querySelectorAll('[data-area]').forEach(btn=>btn.onclick=()=>{maps.setRegion(btn.dataset.area==='region');body.querySelectorAll('[data-area]').forEach(x=>x.classList.toggle('sel',x===btn))});
  }else if(key==='detail'){const lm=getSelected();const assets=await photos;if(panel!==key||!dlg.open)return;const pic=assets[lm.id];
   body.innerHTML=(pic?'<img class="doc-photo" src="'+esc(pic.src)+'" alt="'+esc(lm.name)+'实景参考照片"><div class="photo-credit">实景摄影　'+link(pic.url,pic.credit)+' · '+link(pic.licenseUrl,pic.license)+' · '+esc(pic.changes)+'</div>':'')+'<p>'+esc(lm.description)+'</p><dl class="detail-table"><dt>建筑位置</dt><dd>'+esc(lm.area)+'</dd><dt>建筑高度</dt><dd>'+esc(lm.height)+' m</dd><dt>地标坐标</dt><dd>'+lm.lon.toFixed(6)+'° E，'+lm.lat.toFixed(6)+'° N</dd><dt>资料核对</dt><dd>'+link(lm.url,lm.source)+' · '+link(lm.coordUrl,'地图坐标')+'</dd></dl><p class="fine">三维外观依据公开建筑资料参数化重建。照片可用于对照屋顶、结构和立面细节。</p>'+(['tiantan','palace'].includes(lm.id)&&pic?'<p class="fine">建筑匾额与彩绘纹理取自 '+link(pic.url,pic.credit+' 的实景照片')+'，经裁切、缩放、镜像拼接和色片采样，沿用 '+link(pic.licenseUrl,'CC BY-SA 4.0')+'。</p>':'');
  }else if(key==='help'){body.innerHTML='<h3>飞行观察</h3><ul class="guides"><li>拖动画面环视，滚轮或双指捏合调整距离。鼠标右键拖动可平移镜头。</li><li><span class="key">W A S D</span> 前后左右飞行，<span class="key">Q / E</span> 下降或上升，按住 <span class="key">Shift</span> 加速。</li><li>指南针切换至朝北俯视，定位按钮返回当前地标的取景点。</li></ul><h3>地面漫游</h3><p>切换至漫游可进入约 1.72 米的视点。拖动调整朝向，键盘或触屏方向键移动。步行时会检测建筑与水面边界。</p><h3>地标与环境</h3><p>选择底部地标，或在城市地图中定位。右上时间控件可模拟日照、雨雪和雾，也可联网同步北京时刻与天气模式。</p><p class="fine">当前渲染方式　'+esc(getRenderer?.())+'</p>';
  }else if(key==='env'){environment();}
  else if(key==='sources'){const [m,imgs]=await Promise.all([meta,photos]);if(panel!==key||!dlg.open)return;const n=m?.counts,h=m?.heightCoverage,st=getStats?.();
   let copy='<div class="source-row"><b>城区覆盖 · WGS84</b><small>东经 116.350°–116.498°，北纬 39.860°–40.015°，约 12.6 × 17.2 公里。三维城区使用局部米制平面。区域地形覆盖东经 115.30°–117.52°、北纬 39.23°–40.80°。周边山体使用真实高程，城区核心地面统一置平。</small></div>';
   copy+='<div class="source-row"><b>建筑、道路与水域</b><small>'+link('https://www.openstreetmap.org/copyright','© OpenStreetMap contributors · ODbL 1.0')+'，由 '+link('https://download.geofabrik.de/asia/china/beijing.html','Geofabrik')+' 提供。'+(n?'原始快照 '+esc(m.snapshot.slice(0,10))+' UTC，含 '+n.buildings.toLocaleString()+' 个建筑面、'+n.roads.toLocaleString()+' 段地面道路、'+n.water+' 个水面。':'')+'多部件对象可能拆为多个面。'+link('./data/beijing.osm.bin','下载本场景使用的 OSM 派生数据库')+' · '+link('./data/beijing.js','数据解码器')+'</small></div>';
   copy+='<div class="source-row"><b>高度与外观</b><small>'+(h?h.taggedHeight+' 个建筑面有 OSM 高度，'+h.levelsOnly.toLocaleString()+' 个仅标注层数，'+h.unknownHeight.toLocaleString()+' 个缺少二者。':'')+'一般建筑优先采用标注高度，再按层数推算。缺项中，1,434 个由邻近同类建筑推估，23,168 个按用途或基底面积概化。八处重点建筑按公开外形、尺度和 OSM 地标位置重建。窗格、树木和路灯的位置、材质及夜间泛光为模拟。'+(st?.heightNote?esc(st.heightNote):'')+'</small></div>';
   copy+='<div class="source-row"><b>地面影像与山脊</b><small>'+link('https://s2maps.eu','Sentinel-2 cloudless by EOX IT Services GmbH')+'，含经处理的 Copernicus Sentinel 2016–2017 数据。场景裁切、重采样并转码，'+link('https://creativecommons.org/licenses/by/4.0/','CC BY 4.0')+'。远景采用 '+link('https://registry.opendata.aws/terrain-tiles/','Mapzen Terrain Tiles / USGS SRTM、GMTED2010')+'；夜间远景使用 '+link('https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/','NASA Earth Observatory / Joshua Stevens，Suomi NPP VIIRS 2016 夜光合成')+'。历史影像、夜光与建筑快照的年份不同。</small></div>';
   copy+='<div class="source-row"><b>天气与日照</b><small>太阳方向按北京经纬度、日期和北京时间计算。默认环境为手动模拟。联网同步使用 '+link('https://open-meteo.com/','Open-Meteo')+' 在北京中心网格的当前模式值，依 WMO 代码映射为场景天气。</small></div>';
   copy+='<h3>实景照片</h3><div class="fine">'+landmarks.map(lm=>{const p=imgs[lm.id];return p?esc(lm.short)+' · '+link(p.url,p.credit)+' · '+link(p.licenseUrl,p.license):''}).filter(Boolean).join('<br>')+'<br>照片已等比缩放、转为 WebP，卡片采用裁切显示。祈年殿纹理来自 Shujianyang 原图，经裁切、镜像拼接和色片采样，沿用 CC BY-SA 4.0。太和殿匾额与梁枋取自 N509FZ 原图，经裁切、镜像拼接，沿用 CC BY-SA 4.0。天安门城楼正面肖像纹理取自 Balon Greyjoy 的 CC0 照片。</div>';body.innerHTML=copy;
  }
 }
 function manual(){sourceNote='手动模拟';weatherRun++;apply();}
 function environment(){
  body.innerHTML='<div class="subhead"><label for="hours">北京时间</label><output id="hread" class="read-time"></output></div><input id="hours" aria-label="北京时间" type="range" min="0" max="1439" step="1"><div class="preset"></div><div class="date-row"><label for="sdate">模拟日期</label><input type="date" id="sdate" min="1900-01-01" max="2100-12-31"></div><div class="section-block"><div class="subhead">天气效果</div><div class="weather-options"></div></div><div class="pair"><button id="sync" class="action sync">'+icon('locate')+'同步北京实况</button><span class="fine" id="syncState"></span></div><div class="section-block"><div class="switch-row"><span>场景图层</span><span class="fine">城区</span></div><div id="layers"></div></div>';
  const get=s=>body.querySelector(s),range=get('#hours'),date=get('#sdate'),hour=get('#hread'),msg=get('#syncState');
  function refresh(){hour.textContent=dispTime(state.time);range.value=Math.round(state.time*60);date.value=state.date;msg.textContent=sourceNote||'手动模拟';get('.weather-options').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.w===state.weather);b.setAttribute('aria-pressed',b.dataset.w===state.weather)});get('.preset').querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.t)===state.time));}
  range.oninput=()=>{state.time=+range.value/60;manual();refresh()};date.onchange=()=>{if(date.value&&date.validity.valid){state.date=date.value;manual();refresh()}else{date.value=state.date}};
  for(const [label,val] of [['清晨',6.25],['正午',12],['傍晚',17.5],['深夜',22]]){const b=document.createElement('button');b.textContent=label;b.dataset.t=val;b.onclick=()=>{state.time=val;manual();refresh()};get('.preset').append(b);}
  for(const [w,[name,ic]] of Object.entries(climates)){const b=document.createElement('button');b.dataset.w=w;b.innerHTML=icon(ic)+name;b.onclick=()=>{state.weather=w;manual();refresh()};get('.weather-options').append(b);}
  for(const [id,label] of [['buildings','普通建筑'],['vegetation','树冠'],['imagery','地表影像']]){const l=document.createElement('label');l.innerHTML='<input type="checkbox" '+(state.layers[id]?'checked':'')+'>'+label;l.querySelector('input').onchange=e=>{state.layers[id]=e.target.checked;onLayer(id,e.target.checked)};get('#layers').append(l);}
  get('#sync').onclick=async()=>{const btn=get('#sync'),seq=++weatherRun;btn.disabled=true;msg.textContent='正在获取…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
   try{const res=await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.91&longitude=116.40&current=temperature_2m,weather_code&timezone=Asia%2FShanghai',{signal:controller.signal});if(!res.ok)throw Error('服务暂不可用');const data=await res.json(),c=data.current;if(!c||!Number.isInteger(c.weather_code)||!/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(c.time))throw Error('天气数据无效');if(seq!==weatherRun||!dlg.open)return;const w=c.weather_code;state.weather=w<=1?'clear':w<=3?'cloud':w===45||w===48?'fog':([71,73,75,77,85,86].includes(w)?'snow':'rain');
   state.date=c.time.slice(0,10);state.time=+c.time.slice(11,13)+Number(c.time.slice(14,16))/60;sourceNote='模式值 '+c.time.slice(11,16)+' · '+Number(c.temperature_2m).toFixed(1)+'°C';apply();refresh();
   }catch(e){if(seq===weatherRun)msg.textContent='连接失败，可重试或手动模拟';}finally{clearTimeout(timer);btn.disabled=false;}};
  refresh();
 }
 return {maps,open,close,clearSync(){sourceNote='手动模拟'},isOpen:()=>dlg.open};
}
