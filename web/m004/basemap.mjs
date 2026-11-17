// A Canvas-rendered OpenMapTiles style: no WebGL or browser GPU is required.
export function baseRules(p){
 const polygon=(dataLayer,fill,filter)=>({dataLayer,symbolizer:new p.PolygonSymbolizer({fill}),...(filter?{filter}:{})});
 const roadWidth=(z,f)=>Math.max(.5,(z-10)*(['motorway','trunk'].includes(f.props.class)?1.35:['primary','secondary'].includes(f.props.class)?1:.58));
 const road=(color,extra)=>new p.LineSymbolizer({color,width:(z,f)=>roadWidth(z,f)+extra,lineCap:'round',lineJoin:'round'});
 const names=['name:zh','name:zh-Hans','name','name:en'];
 const label=(size,color)=>({labelProps:names,fill:color,stroke:'#fbf9f1',width:2,font:`400 ${size}px sans-serif`,maxLineChars:20});
 return {
  paintRules:[
   polygon('landcover','#dde6d2'),
   polygon('landuse','#dbe5cf',(z,f)=>['grass','forest','wood','cemetery','allotments','recreation_ground'].includes(f.props.class)),
   polygon('landuse','#ede2d4',(z,f)=>['residential','commercial','industrial'].includes(f.props.class)),
   polygon('park','#d5e4c8'),
   polygon('water','#afd1d5'),
   {dataLayer:'waterway',symbolizer:new p.LineSymbolizer({color:'#afd1d5',width:z=>Math.max(1,(z-10)*.8)})},
   {...polygon('building','#d6d2c9'),minzoom:13},
   {dataLayer:'transportation',symbolizer:road('#d5c5ab',2),filter:(z,f)=>f.props.class!=='rail'},
   {dataLayer:'transportation',symbolizer:road('#fffdf5',0),filter:(z,f)=>f.props.class!=='rail'},
   {dataLayer:'transportation',symbolizer:new p.LineSymbolizer({color:'#b3aaa1',width:1,dash:[3,3]}),filter:(z,f)=>f.props.class==='rail'},
   {dataLayer:'boundary',symbolizer:new p.LineSymbolizer({color:'#b9b1a5',width:1,dash:[3,4]}),maxzoom:12}
  ],
  labelRules:[
   {dataLayer:'place',symbolizer:new p.CenteredTextSymbolizer(label(16,'#535e55')),filter:(z,f)=>['country','state','city','town'].includes(f.props.class),sort:(a,b)=>(a.rank||9)-(b.rank||9)},
   {dataLayer:'water_name',symbolizer:new p.CenteredTextSymbolizer(label(13,'#497c8b'))},
   {dataLayer:'transportation_name',minzoom:12,symbolizer:new p.LineLabelSymbolizer({...label(11,'#7b7267'),repeatDistance:180})},
   {dataLayer:'place',minzoom:12,symbolizer:new p.CenteredTextSymbolizer(label(12,'#6b756b')),filter:(z,f)=>!['country','state','city','town'].includes(f.props.class)},
   {dataLayer:'poi',minzoom:15,symbolizer:new p.CenteredTextSymbolizer(label(10,'#75816e')),sort:(a,b)=>(a.rank||20)-(b.rank||20)}
  ]
 };
}

let tileInfoPromise;
export async function createVectorBase(){
 if(!globalThis.protomapsL)throw new Error('底图组件未载入');
 tileInfoPromise ||= fetch('https://tiles.openfreemap.org/planet',{signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw new Error('底图源暂不可用');return r.json();}).catch(e=>{tileInfoPromise=null;throw e;});
 const info=await tileInfoPromise,url=info.tiles?.find(t=>typeof t==='string'&&t.startsWith('https://'));
 if(!url)throw new Error('底图源未返回有效瓦片');
 return protomapsL.leafletLayer({url,maxDataZoom:info.maxzoom||14,maxZoom:19,minZoom:2,backgroundColor:'#f2f0e8',...baseRules(protomapsL),attribution:'<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
}
