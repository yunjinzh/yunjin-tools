import {regionalInventory} from './urban/regional-layer.js';
import {fieldGroups,loadFieldCatalog} from './field-catalog.js';
import {climates} from './atmosphere.js';
import {locator} from './locator.js';
export const dispTime=t=>{const n=Math.min(1439,Math.max(0,Math.round(t*60)));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
const link=(url,name)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>';
const meta=fetch('./data/osm-source.json').then(r=>r.json()).catch(()=>null);
const photos=fetch('./photos/index.json').then(r=>r.json()).catch(()=>({}));
export function panels({landmarks,getSelected,go,nav,state,apply,toast,onLayer,getRenderer,getStats}){
 const dlg=document.querySelector('#dialog'),body=document.querySelector('#modalBody');let panel='',sourceNote='',weatherRun=0;
 function observe(site){close();nav.mapFly(site.lon,site.lat,1550,site);const url=new URL(location.href);url.searchParams.set('region',site.id);for(const k of ['landmark','view','mode','field','sources'])url.searchParams.delete(k);history.replaceState(null,'',url);toast(site.name+' · 周边 800 米内收录 '+site.count+' 个屋顶面');}
 const maps=locator({landmarks,observe,getCamera:()=>nav.getCamera(),go:id=>{close();go(id);},flyTo:(lon,lat)=>{close();nav.mapFly(lon,lat);toast('已定位至所选坐标');}});
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
   body.innerHTML='<div class="map-switch"><button data-area="city" class="sel">核心城区</button><button data-area="region">区域地形</button></div><canvas class="mapview" aria-label="北京三维场景覆盖范围和可访问地点"></canvas><div class="map-list"></div><p class="fine">点击地标飞往现场。滚轮缩放，拖动平移，双击覆盖区内的空白位置可自由定位。</p>';
   const list=body.querySelector('.map-list');landmarks.forEach(lm=>{const b=document.createElement('button');b.textContent=lm.short;b.classList.toggle('selected',lm.id===getSelected().id);b.onclick=()=>{close();go(lm.id)};list.append(b)});maps.attach(body.querySelector('canvas'));
   const regional=document.createElement('section');regional.hidden=true;
   regional.innerHTML='<h3>区域建筑观测点</h3><label><input type="checkbox"> 区域建筑（2021–2023）</label><p class="fine">CMAB 研究数据按视点加载，楼高为预测值。下列地点已核验周边屋顶覆盖。</p><div class="map-list"></div>';
   const enabled=regional.querySelector('input');enabled.checked=state.layers.regionalBuildings;
   enabled.onchange=()=>{state.layers.regionalBuildings=enabled.checked;onLayer('regionalBuildings',enabled.checked);};
   const regionList=regional.querySelector('.map-list');body.append(regional);
   body.querySelectorAll('[data-area]').forEach(btn=>btn.onclick=async()=>{
    const wide=btn.dataset.area==='region';maps.setRegion(wide);regional.hidden=!wide;list.hidden=wide;
    body.querySelectorAll('[data-area]').forEach(x=>x.classList.toggle('sel',x===btn));
    if(!wide||regionList.childElementCount)return;
    try{const data=await regionalInventory();if(!regional.isConnected)return;
     regionList.replaceChildren();maps.setSites(data.stops);
     for(const site of data.stops){const b=document.createElement('button');b.textContent=site.name;b.title='800 米内 '+site.count+' 个屋顶面';b.onclick=()=>observe(site);regionList.append(b);}
    }catch{regionList.textContent='区域覆盖索引暂时无法读取。';}
   });
   const panoHeading=document.createElement('h3');panoHeading.textContent='城区外实拍全景';
   const panoList=document.createElement('div');panoList.className='map-list';
   for(const id of ['garden','neighborhood']){
    const b=document.createElement('button');b.textContent=fieldGroups[id];b.onclick=()=>{close();document.dispatchEvent(new CustomEvent('atlas:open-field',{detail:{group:id}}));};panoList.append(b);
   }
   body.append(panoHeading,panoList);
  }else if(key==='detail'){const lm=getSelected();const street=['hutong','waterfront'].includes(lm.id);
   const [assets,catalog]=await Promise.all([photos,street?loadFieldCatalog().catch(()=>({})):{}]);if(panel!==key||!dlg.open)return;
   const record=catalog[lm.id]?.[0],pic=assets[lm.id]||(record?{...record,src:record.file}:null);
   body.innerHTML=(pic?'<img class="doc-photo" src="'+esc(pic.src)+'" alt="'+esc(record?.name||lm.name)+'实景参考照片"><div class="photo-credit">'+(record?esc(record.name)+'　':'实景摄影　')+link(pic.url,pic.credit)+' · '+link(pic.licenseUrl,pic.license)+' · '+esc(pic.changes)+'</div>':'')+'<p>'+esc(lm.description)+'</p><dl class="detail-table"><dt>所在位置</dt><dd>'+esc(lm.area)+'</dd>'+(street?'<dt>场所类型</dt><dd>'+esc(lm.category)+'</dd>':'<dt>建筑高度</dt><dd>'+esc(lm.height)+' m</dd>')+'<dt>场景坐标</dt><dd>'+lm.lon.toFixed(6)+'° E，'+lm.lat.toFixed(6)+'° N</dd><dt>资料核对</dt><dd>'+link(lm.url,lm.source)+' · '+link(lm.coordUrl,'地图坐标')+'</dd></dl><p class="fine">'+(street?'街巷与湖岸轮廓取自公开地图。街区照片提供周边环境参照，可在实景对照中查看摄影者标注的拍摄位置。':'三维外观依据公开建筑资料参数化重建。照片可用于对照屋顶、结构和立面细节。')+'</p>'+(['tiantan','palace'].includes(lm.id)&&pic?'<p class="fine">建筑匾额与彩绘纹理取自 '+link(pic.url,pic.credit+' 的实景照片')+'，经裁切、缩放、镜像拼接和色片采样，沿用 '+link(pic.licenseUrl,'CC BY-SA 4.0')+'。</p>':'');
  }else if(key==='help'){body.innerHTML='<h3>飞行观察</h3><ul class="guides"><li>拖动画面环视，滚轮或双指捏合调整距离。鼠标右键拖动可平移镜头。</li><li><span class="key">W A S D</span> 前后左右飞行，<span class="key">Q / E</span> 下降或上升，按住 <span class="key">Shift</span> 加速。</li><li>指南针切换至朝北俯视，定位按钮返回当前地标的取景点。</li></ul><h3>地面漫游</h3><p>切换至漫游可进入约 1.72 米的视点。拖动调整朝向，键盘或触屏方向键移动。步行时会检测建筑与水面边界。</p><h3>地标与环境</h3><p>选择底部地标，或在城市地图中定位。右上时间控件可模拟日照、雨雪和雾，也可联网同步北京时刻与天气模式。</p><p class="fine">当前渲染方式　'+esc(getRenderer?.())+'</p>';
  }else if(key==='env'){environment();}
  else if(key==='sources'){const [m,imgs,field]=await Promise.all([meta,photos,loadFieldCatalog().catch(()=>({}))]);if(panel!==key||!dlg.open)return;const n=m?.counts,h=m?.heightCoverage,st=getStats?.();
   let copy='<div class="source-row"><b>城区覆盖 · WGS84</b><small>东经 116.350°–116.498°，北纬 39.860°–40.015°，约 12.6 × 17.2 公里。三维城区使用局部米制平面。区域地形覆盖东经 115.30°–117.52°、北纬 39.23°–40.80°。周边山体使用真实高程，城区核心地面统一置平。</small></div>';
   const places=landmarks.filter(Boolean), districts=places.filter(l=>['hutong','waterfront'].includes(l.id)).length, heritage=places.filter(l=>['tiantan','palace','tiananmen'].includes(l.id)).length;
   copy+='<div class="source-row"><b>可漫游地点</b><small>'+places.length+' 处，含 '+districts+' 处城市街区、'+heritage+' 处古都建筑与 '+(places.length-districts-heritage)+' 处当代地标。核心城区外的两处相机视点可在地图中打开全景。</small></div>';
   copy+='<div class="source-row"><b>建筑、道路与水域</b><small>'+link('https://www.openstreetmap.org/copyright','© OpenStreetMap contributors · ODbL 1.0')+'，由 '+link('https://download.geofabrik.de/asia/china/beijing.html','Geofabrik')+' 提供。'+(n?'原始快照 '+esc(m.snapshot.slice(0,10))+' UTC，含 '+n.buildings.toLocaleString()+' 个建筑面、'+n.roads.toLocaleString()+' 段地面道路、'+n.water+' 个水面。':'')+'多部件对象可能拆为多个面。'+link('./data/beijing.osm.bin','下载本场景使用的 OSM 派生数据库')+' · '+link('./data/beijing.js','数据解码器')+'</small></div>';
   copy+='<div class="source-row"><b>高度与外观</b><small>'+(h?h.taggedHeight+' 个建筑面有 OSM 高度，'+h.levelsOnly.toLocaleString()+' 个仅标注层数，'+h.unknownHeight.toLocaleString()+' 个缺少二者。':'')+'一般建筑优先采用标注高度，再按层数推算。缺项中，1,434 个由邻近同类建筑推估，23,168 个按用途或基底面积概化。重点建筑参考公开外形、尺度与 OSM 地标位置。钟库胡同采用街巷和院落轮廓，前海采用公开地图中的水岸轮廓；门窗、店铺陈设及部分岸线设施依据同类实景重建。'+(st?.heightNote?esc(st.heightNote):'')+'</small></div>';
   copy+='<div class="source-row"><b>地面影像与山脊</b><small>'+link('https://s2maps.eu','Sentinel-2 cloudless by EOX IT Services GmbH')+'，含经处理的 Copernicus Sentinel 2016–2017 数据。场景裁切、重采样并转码，'+link('https://creativecommons.org/licenses/by/4.0/','CC BY 4.0')+'。远景采用 '+link('https://registry.opendata.aws/terrain-tiles/','Mapzen Terrain Tiles / USGS SRTM、GMTED2010')+'；夜间远景使用 '+link('https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/','NASA Earth Observatory / Joshua Stevens，Suomi NPP VIIRS 2016 夜光合成')+'。历史影像、夜光与建筑快照的年份不同。</small></div>';
   copy+='<div class="source-row"><b>天气与日照</b><small>太阳方向按北京经纬度、日期和北京时间计算。默认环境为手动模拟。联网同步使用 '+link('https://open-meteo.com/','Open-Meteo')+' 在北京中心网格的当前模式值，依 WMO 代码映射为场景天气。</small></div>';
   copy+='<h3>实景照片</h3><div class="fine">'+landmarks.map(lm=>{const p=imgs[lm.id];return p?esc(lm.short)+' · '+link(p.url,p.credit)+' · '+link(p.licenseUrl,p.license):''}).filter(Boolean).join('<br>')+'<br>照片已等比缩放、转为 WebP，卡片采用裁切显示。祈年殿纹理来自 Shujianyang 原图，经裁切、镜像拼接和色片采样，沿用 CC BY-SA 4.0。</div>';copy+='<h3>古建筑重建与现场影像</h3><div class="source-row"><small>太和殿柱网、重檐、三层台基依据故宫博物院公布尺寸重建。四面共用同类材质，局部构件间距依据照片估计。'+link('./heritage/palace-credits.json','太和殿摄影、衍生材质及授权')+' · '+link('./heritage/gate-credits.md','天安门建筑与摄影来源')+' · '+link('./heritage/furniture-credits.json','月台陈设资料')+'。院落的屋顶、墙基及廊庑按 OSM 部件分层；有缺项的高度、色彩及檐部按周边建筑估算。'+link('./heritage/precinct-source.json','宫殿区构件精度与来源')+' · '+link('./heritage/precinct-data.js','OSM 派生数据')+'</small></div><div class="source-row"><small>六张天气天幕来自开放 HDRI 实拍，根据天气及太阳角度合成。'+link('./heritage/sky-credits.json','天幕摄影及授权')+'</small></div>';const entries=Object.entries(fieldGroups).filter(([id])=>field[id]?.length);
   if(entries.length){
    const rows=entries.flatMap(([id])=>field[id]),spheres=rows.filter(r=>r.type==='sphere');
    copy+='<h3>实景摄影与球形全景</h3><div class="source-row"><small>'+entries.length+' 组共 '+rows.length+' 幅，含 '+spheres.length+' 幅可拖动环视的球形全景。王府井、什刹海与南锣鼓巷等组收录街区内不同机位。谐趣园与望春园可直接进入独立全景。</small></div><div class="field-sources">';
    for(const [id,label] of entries){
     copy+='<details><summary>'+esc(label)+' <small>'+field[id].length+' 幅</small></summary><ul>'+field[id].map(r=>'<li>'+esc(r.name)+' · '+link(r.url,r.credit)+' · '+link(r.licenseUrl,r.license)+'</li>').join('')+'</ul><button class="action" data-field-group="'+esc(id)+'">查看实景</button></details>';
    }
    copy+='</div><p class="fine">实景图片保留完整构图，经等比缩放并转为 WebP，缩略图依显示区域裁切。'+link('./field/index.json','古建筑影像目录')+' · '+link('./field/urban-index.json','街区与全景目录')+'</p>';
   }
   copy+='<h3>摄影测量模型</h3><div class="source-row"><small>798 艺术区街墙由 Antzed 用 227 张照片重建；怀柔长城由 Lionel 用 156 张无人机照片重建。两件作品均按 CC BY 4.0 提供本地纹理网格及离线多角度视图。后海胡同与故宫麒麟铜像连接作者发布的在线原作。'+link('./field/survey/index.html?model=art798','进入摄影测量')+' · '+link('./field/survey/index.json','原作、授权及转换记录')+'</small></div>';
   copy+='<h3>城市街区重建</h3><div class="source-row"><small>建筑和街道以开放地图定位；人物、车流与室内照明用于表现街道尺度和时段。'+link('./urban/streets-source.json','街道路网与设施说明')+' · '+link('./urban/facades-sources.json','建筑立面影像与许可')+' · '+link('./urban/cbd-sources.md','国贸塔群逐栋依据')+' · '+link('./urban/hutong-source.json','钟库胡同轮廓与材质')+' · '+link('./urban/waterfront-credits.json','前海水岸与植被依据')+'</small></div>';
   copy+='<h3>核心城区外的区域建筑</h3><div class="source-row"><small>Yecheng Zhang、Huimin Zhao、Ying Long 发布的 CMAB 北京 15 个研究分片，日期分布在 2021–2023 年。筛选后保留约 27 万条原记录，按镜头距离抽稀；预测高度、影像屋顶位移、分片间时差都会影响外观。地面贴合当地 DEM；核心城区沿用原有精模。'+link('https://doi.org/10.6084/m9.figshare.27992417.v7','CMAB v7 原始数据')+' · '+link('https://creativecommons.org/licenses/by/4.0/','CC BY 4.0')+' · '+link('./urban/regional-source.json','逐片日期、范围与处理记录')+'</small></div>';
   copy+='<h3>国贸 2023 屋顶补充</h3><div class="source-row"><small>Yecheng Zhang、Huimin Zhao、Ying Long（CMAB v7）发布的 2023 年北京分片。选取 329 处独立屋顶，校正位置并排除与已建模楼体、机动车道和水体重叠的候选。楼高为模型估计。'+link('https://doi.org/10.6084/m9.figshare.27992417.v7','原始数据')+' · '+link('https://creativecommons.org/licenses/by/4.0/','CC BY 4.0')+' · '+link('./urban/cmab-2023-source.json','分片、处理与位置精度')+'</small></div>';
   copy+='<p class="fine">'+link('exhibit/credits.html','完整数据与素材署名')+'</p>';body.innerHTML=copy;
   for(const b of body.querySelectorAll('[data-field-group]'))b.onclick=()=>{close();document.dispatchEvent(new CustomEvent('atlas:open-field',{detail:{group:b.dataset.fieldGroup}}));};
  }
 }
 function manual(){sourceNote='手动模拟';weatherRun++;apply();}
 function environment(){
  body.innerHTML='<div class="subhead"><label for="hours">北京时间</label><output id="hread" class="read-time"></output></div><input id="hours" aria-label="北京时间" type="range" min="0" max="1439" step="1"><div class="preset"></div><div class="date-row"><label for="sdate">模拟日期</label><input type="date" id="sdate" min="1900-01-01" max="2100-12-31"></div><div class="section-block"><div class="subhead">天气效果</div><div class="weather-options"></div></div><div class="pair"><button id="sync" class="action sync">'+icon('locate')+'同步北京实况</button><span class="fine" id="syncState"></span></div><div class="section-block"><div class="switch-row"><span>场景图层</span><span class="fine">城区</span></div><div id="layers"></div><p class="fine">国贸补充层含 CMAB 2023 年影像识别的 329 处屋顶。楼高为模型估计，屋顶位置可能与地面墙基有数米偏差。</p></div>';
  const get=s=>body.querySelector(s),range=get('#hours'),date=get('#sdate'),hour=get('#hread'),msg=get('#syncState');
  function refresh(){hour.textContent=dispTime(state.time);range.value=Math.round(state.time*60);date.value=state.date;msg.textContent=sourceNote||'手动模拟';get('.weather-options').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.w===state.weather);b.setAttribute('aria-pressed',b.dataset.w===state.weather)});get('.preset').querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.t)===state.time));}
  range.oninput=()=>{state.time=+range.value/60;manual();refresh()};date.onchange=()=>{if(date.value&&date.validity.valid){state.date=date.value;manual();refresh()}else{date.value=state.date}};
  for(const [label,val] of [['清晨',6.25],['正午',12],['傍晚',17.5],['深夜',22]]){const b=document.createElement('button');b.textContent=label;b.dataset.t=val;b.onclick=()=>{state.time=val;manual();refresh()};get('.preset').append(b);}
  for(const [w,[name,ic]] of Object.entries(climates)){const b=document.createElement('button');b.dataset.w=w;b.innerHTML=icon(ic)+name;b.onclick=()=>{state.weather=w;manual();refresh()};get('.weather-options').append(b);}
  for(const [id,label] of [['buildings','普通建筑'],['vegetation','树冠'],['imagery','地表影像'],['cbd2023','国贸 2023 屋顶补充'],['regionalBuildings','区域建筑（2021–2023）']]){const l=document.createElement('label');l.innerHTML='<input type="checkbox" '+(state.layers[id]?'checked':'')+'>'+label;l.querySelector('input').onchange=e=>{state.layers[id]=e.target.checked;onLayer(id,e.target.checked)};get('#layers').append(l);}
  get('#sync').onclick=async()=>{const btn=get('#sync'),seq=++weatherRun;btn.disabled=true;msg.textContent='正在获取…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
   try{const res=await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.91&longitude=116.40&current=temperature_2m,weather_code&timezone=Asia%2FShanghai',{signal:controller.signal});if(!res.ok)throw Error('服务暂不可用');const data=await res.json(),c=data.current;if(!c||!Number.isInteger(c.weather_code)||!/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(c.time))throw Error('天气数据无效');if(seq!==weatherRun||!dlg.open)return;const w=c.weather_code;state.weather=w<=1?'clear':w<=3?'cloud':w===45||w===48?'fog':([71,73,75,77,85,86].includes(w)?'snow':'rain');
   state.date=c.time.slice(0,10);state.time=+c.time.slice(11,13)+Number(c.time.slice(14,16))/60;sourceNote='模式值 '+c.time.slice(11,16)+' · '+Number(c.temperature_2m).toFixed(1)+'°C';apply();refresh();
   }catch(e){if(seq===weatherRun)msg.textContent='连接失败，可重试或手动模拟';}finally{clearTimeout(timer);btn.disabled=false;}};
  refresh();
 }
 return {maps,open,close,clearSync(){sourceNote='手动模拟'},isOpen:()=>dlg.open};
}
