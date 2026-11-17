export const DEFAULT_ENDPOINT = 'https://overpass-api.de/api/interpreter';
export const SAMPLE_BOUNDS = {south:39.892,west:116.374,north:39.937,east:116.417};
export const PRESETS = [
 {name:'故宫与北海',aliases:'北京 故宫 北海 天安门 中轴线',lat:39.919,lng:116.3905,zoom:15},
 {name:'杭州 · 西湖',aliases:'杭州 西湖',lat:30.242,lng:120.143,zoom:14},
 {name:'上海 · 外滩',aliases:'上海 外滩 黄浦江 陆家嘴',lat:31.239,lng:121.493,zoom:15},
 {name:'苏州 · 古城',aliases:'苏州 拙政园',lat:31.319,lng:120.628,zoom:15},
 {name:'巴黎 · 塞纳河',aliases:'巴黎 Paris 塞纳河',lat:48.859,lng:2.339,zoom:15},
 {name:'伦敦 · 泰晤士河',aliases:'伦敦 London 泰晤士河',lat:51.506,lng:-0.116,zoom:15},
 {name:'纽约 · 中央公园',aliases:'纽约 New York 中央公园',lat:40.778,lng:-73.969,zoom:15},
 {name:'京都 · 御苑',aliases:'京都 Kyoto 日本',lat:35.025,lng:135.762,zoom:15}
];

export function cleanName(s) { return String(s||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,110); }
export function featureName(f,language='zh',overrides={}) {
 if(overrides[f.id]?.name !== undefined) return cleanName(overrides[f.id].name);
 const t=f.tags||{};
 return cleanName(language==='en'?(t['name:en']||t.name||t['name:zh']):language==='local'?(t.name||t['name:zh']||t['name:en']):(t['name:zh-Hans']||t['name:zh']||t['name:zh-Hant']||t.name||t['name:en']));
}
export function categoryOf(t) {
 if(t.highway && !['construction','proposed'].includes(t.highway)) return 'road';
 if(t.natural==='water'||t.water||t.waterway||['reservoir','basin'].includes(t.landuse)) return 'water';
 if(['park','garden','nature_reserve','golf_course'].includes(t.leisure)||['wood','wetland'].includes(t.natural)||['forest','grass','recreation_ground'].includes(t.landuse)||['island','islet'].includes(t.place)) return 'park';
 return 'landmark';
}
export function normalizeGeoJSON(collection) {
 if(collection?.type!=='FeatureCollection'||!Array.isArray(collection.features)) throw new Error('请导入 GeoJSON FeatureCollection 文件。');
 const result=[];let skipped=0;const seen=new Set();
 for(let i=0;i<collection.features.length;i++){
  const f=collection.features[i],p=f.properties||{},tags=p.tags||p,g=f.geometry;
  if(!g||!['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon'].includes(g.type)||p.tainted){skipped++;continue;}
  if(tags.type==='route'||tags.type==='site'||(p.type==='relation'&&tags.type&&!['multipolygon','boundary'].includes(tags.type))){skipped++;continue;}
  const named=Object.keys(tags).some(k=>/^name(?::.*)?$/.test(k)&&cleanName(tags[k]));
  if(!named){skipped++;continue;}
  let count=0,valid=true;
  function validate(c){ if(!Array.isArray(c)){valid=false;return;} if(typeof c[0]==='number'){count++;if(c.length<2||!Number.isFinite(c[0])||!Number.isFinite(c[1])||c[0]<-180||c[0]>180||c[1]<-85.1||c[1]>85.1)valid=false;} else for(const item of c)validate(item); }
  validate(g.coordinates);if(!valid||count>90000){skipped++;continue;}
  const id=String(f.id||`${p.type||'import'}/${p.id||i}`);if(seen.has(id))continue;seen.add(id);
  const safe={};for(const [k,v]of Object.entries(tags)) if(typeof v==='string'||typeof v==='number')safe[k]=String(v).slice(0,200);
  result.push({id,tags:safe,category:categoryOf(safe),geometry:g});
 }
 return {features:result,skipped};
}
export function areaKm2(b){let span=b.east-b.west;if(span<0)span+=360;return Math.abs(span*111.32*Math.cos((b.north+b.south)/2*Math.PI/180)*(b.north-b.south)*111.32);}
export function containsBounds(outer,inner,eps=0.00001){return inner.south>=outer.south-eps&&inner.north<=outer.north+eps&&inner.west>=outer.west-eps&&inner.east<=outer.east+eps;}
export function validateBounds(b){
 if(!b||!Object.values(b).every(Number.isFinite)||b.north<=b.south||b.south< -85||b.north>85)throw new Error('此视野超出了可转换的纬度范围，请调整地图。');
 const a=areaKm2(b);if(a>85)throw new Error(`当前视野约 ${a.toFixed(0)} km²，请放大地图到 85 km² 以内再生成。`);
 if(a<0.00001)throw new Error('地图范围过小，请稍微缩小。');
}
export function buildQuery(bounds){
 validateBounds(bounds);
 let w=bounds.west,e=bounds.east;while(w< -180){w+=360;e+=360;}while(w>=180){w-=360;e-=360;}if(e<w)e+=360;
 const boxes=e>180?[[w,180],[-180,e-360]]:[[w,e]];
 const selector='[~"^name(:zh(-Hans|-Hant)?)?$"~"."]';
 const filters=['way[highway][highway!~"^(construction|proposed)$"]','way[waterway~"^(river|stream|canal)$"]','nwr[natural~"^(water|wood|wetland)$"]','nwr[water]','nwr[landuse~"^(reservoir|basin|forest|grass|recreation_ground)$"]','nwr[leisure~"^(park|garden|nature_reserve|golf_course)$"]','nwr[building][building!="no"]','nwr[tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park)$"]','nwr[historic][historic!="no"]','nwr[amenity~"^(university|college|school|library|place_of_worship|theatre|townhall|hospital)$"]','nwr[place~"^(island|islet)$"]'];
 const clauses=boxes.flatMap(([west,east])=>filters.map(f=>`${f}${selector}(${[bounds.south,west,bounds.north,east].map(n=>n.toFixed(6)).join(',')});`));
 return `[out:json][timeout:40][maxsize:33554432];(${clauses.join('\n')})->.chosen;(node.chosen;way.chosen;rel.chosen[type=multipolygon];);out body geom qt;`;
}
export function parseLocation(input){
 const text=String(input||'').trim();if(!text)return null;
 const exact=PRESETS.find(p=>(p.name+' '+p.aliases).toLowerCase().includes(text.toLowerCase()));if(exact)return {...exact};
 const urlMatch=text.match(/#map=(\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/);
 const match=urlMatch?null:text.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
 const lat=Number(urlMatch?.[2]??match?.[1]),lng=Number(urlMatch?.[3]??match?.[2]);
 if((urlMatch||match)&&Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=85&&Math.abs(lng)<=180)return {name:`${lat.toFixed(4)}, ${lng.toFixed(4)}`,lat,lng,zoom:urlMatch?Math.min(19,Math.max(3,Number(urlMatch[1]))):15};
 return null;
}
export async function loadOSM(bounds,{endpoint=DEFAULT_ENDPOINT,signal,onProgress=()=>{}}={}){
 const query=buildQuery(bounds);const url=new URL(endpoint);if(url.protocol!=='https:')throw new Error('数据服务地址需要使用 HTTPS。');
 onProgress('正在读取当前视野的 OSM 名称与轮廓…');
 const response=await fetch(url,{method:'POST',body:new URLSearchParams({data:query}),credentials:'omit',signal,headers:{'Accept':'application/json'}});
 if(response.status===429){const e=new Error('地图数据服务暂时限流，请稍后再试；上一幅作品已保留。');e.code='RATE_LIMIT';throw e;}
 if(!response.ok)throw new Error(response.status===504?'地图数据服务繁忙，请稍后重试或缩小视野。':`地图数据请求未完成（${response.status}），请稍后重试。`);
 const size=Number(response.headers.get('content-length')||0);if(size>34e6)throw new Error('本次数据量过大，请缩小地图视野。');
 let body='';if(response.body?.getReader){const reader=response.body.getReader();const decoder=new TextDecoder();let total=0;while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>34e6){await reader.cancel();throw new Error('本次数据量过大，请缩小地图视野。');}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();}else body=await response.text();
 let data;try{data=JSON.parse(body);}catch{throw new Error('地图服务返回了无效数据，请稍后重试。');}
 if(data.remark)throw new Error('地图服务未能返回完整结果，请缩小视野后重试。');
 if(!Array.isArray(data.elements))throw new Error('未收到有效的地图要素。');
 onProgress('正在整理水域、道路和地标…');
 const converter=globalThis.osmtogeojson;if(!converter)throw new Error('地图转换组件未加载，请刷新页面。');
 const {features,skipped}=normalizeGeoJSON(converter(data,{flatProperties:false}));
 return {features,skipped,bounds:{...bounds},source:'OpenStreetMap',timestamp:data.osm3s?.timestamp_osm_base||new Date().toISOString(),retrievedAt:new Date().toISOString(),endpoint};
}

export async function cachedDataset(key,value){
 return new Promise(resolve=>{if(!globalThis.indexedDB){resolve(null);return;}const req=indexedDB.open('word-atlas-data',1);req.onupgradeneeded=()=>req.result.createObjectStore('snapshots');req.onerror=()=>resolve(null);req.onsuccess=()=>{const db=req.result;try{const tx=db.transaction('snapshots',value?'readwrite':'readonly');const store=tx.objectStore('snapshots');const op=value?store.put(value,key):store.get(key);op.onsuccess=()=>resolve(value||op.result||null);op.onerror=()=>resolve(null);tx.oncomplete=()=>db.close();}catch{db.close();resolve(null);}}});
}
