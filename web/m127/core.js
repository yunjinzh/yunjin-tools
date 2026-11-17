/* Ridge Atlas numerical and geometry core. No framework or remote code. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function readFloatTiff(buffer){
 const d=new DataView(buffer),le=d.getUint16(0,false)===0x4949;
 if(!(le||d.getUint16(0,false)===0x4d4d)||d.getUint16(2,le)!==42)throw Error('人口服务未返回有效的 TIFF 栅格');
 const sizes={1:1,2:1,3:2,4:4,5:8,11:4,12:8},tags={};let p=d.getUint32(4,le),n=d.getUint16(p,le);
 for(let k=0;k<n;k++){let o=p+2+k*12,id=d.getUint16(o,le),t=d.getUint16(o+2,le),c=d.getUint32(o+4,le),s=sizes[t];if(!s)continue;let q=c*s<=4?o+8:d.getUint32(o+8,le),v=[];if(q+c*s>buffer.byteLength)throw Error('TIFF 元数据不完整');for(let j=0;j<c;j++){let z=q+j*s;v.push(t===3?d.getUint16(z,le):t===4?d.getUint32(z,le):t===11?d.getFloat32(z,le):t===12?d.getFloat64(z,le):d.getUint8(z));}tags[id]=v;}
 const one=(t,f)=>tags[t]?.[0]??f,w=one(256),h=one(257),nodata=tags[42113]?Number(String.fromCharCode(...tags[42113]).replace(/\0/g,'')):-9999;
 if(one(259,1)!==1||one(258)!==32||one(339)!==3||one(277,1)!==1)throw Error('人口服务栅格编码已改变，暂不支持该编码');
 if(!w||!h||w*h>16777216)throw Error('栅格尺寸超出安全范围');
 let a=new Float32Array(w*h);a.fill(NaN);const tw=one(322,w),th=one(323,one(278,h)),off=tags[324]||tags[273],count=tags[325]||tags[279],cols=Math.ceil(w/tw);
 if(!off||!count)throw Error('栅格缺少数据块');
 for(let k=0;k<off.length;k++){if(!off[k]||!count[k])continue;let x0=k%cols*tw,y0=Math.floor(k/cols)*th;for(let y=0;y<Math.min(th,h-y0);y++)for(let x=0;x<Math.min(tw,w-x0);x++){let q=off[k]+(y*tw+x)*4;if(q+4>off[k]+count[k]||q+4>buffer.byteLength)throw Error('栅格数据截断');let v=d.getFloat32(q,le);if(Number.isFinite(v)&&v!==nodata&&v>=0&&v<1e7)a[(y0+y)*w+x0+x]=v;}}
 return {width:w,height:h,values:a,tags};
}
function features(g){if(g.type==='FeatureCollection')return g.features;if(g.type==='Feature')return[g];if(g.type==='Polygon'||g.type==='MultiPolygon')return[{type:'Feature',properties:{},geometry:g}];throw Error('仅支持 Polygon / MultiPolygon 类型的 GeoJSON');}
function polygons(g){let out=[];for(let f of features(g)){let s=f.geometry;if(!s)continue;if(s.type==='Polygon')out.push(s.coordinates);else if(s.type==='MultiPolygon')out.push(...s.coordinates);else throw Error('边界只能包含面要素，不能使用点或线');}return out;}
function validate(g){let ps=polygons(g),num=0;if(!ps.length)throw Error('GeoJSON 没有可用的面');if(g.crs&&!/4326|CRS84/i.test(JSON.stringify(g.crs)))throw Error('请先将边界重投影为 WGS84（EPSG:4326）经纬度');for(let p of ps)for(let r of p){if(r.length<4)throw Error('多边形环至少需要 4 个坐标');for(let a of r){num++;if(!Array.isArray(a)||!Number.isFinite(a[0])||!Number.isFinite(a[1])||Math.abs(a[0])>180||Math.abs(a[1])>85)throw Error('坐标须为经纬度，且纬度须位于 ±85° 以内');}if(r[0][0]!==r.at(-1)[0]||r[0][1]!==r.at(-1)[1])throw Error('多边形环未闭合，请修复后上传');}if(num>300000)throw Error('边界超过 30 万个顶点，请先简化');const b=bounds(g);if(b[2]-b[0]>180)throw Error('此版本暂不支持跨越 180° 经线的单次区域，请分区上传');if(b[2]===b[0]||b[3]===b[1])throw Error('边界没有有效面积');return g;}
function bounds(g){let b=[Infinity,Infinity,-Infinity,-Infinity];for(let p of polygons(g))for(let r of p)for(let [x,y] of r){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);}return b;}
function inRing(x,y,r){let v=false;for(let i=0,j=r.length-1;i<r.length;j=i++){let a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
function contains(g,x,y){return polygons(g).some(p=>inRing(x,y,p[0])&&!p.slice(1).some(r=>inRing(x,y,r)));}
function gcjInverse([lng,lat,...rest]){
 if(lng<72.004||lng>137.8347||lat<.8293||lat>55.8271)return[lng,lat,...rest];
 let x=lng-105,y=lat-35,pi=Math.PI;
 let a=-100+2*x+3*y+.2*y*y+.1*x*y+.2*Math.sqrt(Math.abs(x));
 a+=(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3+(20*Math.sin(y*pi)+40*Math.sin(y/3*pi))*2/3+(160*Math.sin(y/12*pi)+320*Math.sin(y*pi/30))*2/3;
 let b=300+x+2*y+.1*x*x+.1*x*y+.1*Math.sqrt(Math.abs(x));
 b+=(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3+(20*Math.sin(x*pi)+40*Math.sin(x/3*pi))*2/3+(150*Math.sin(x/12*pi)+300*Math.sin(x/30*pi))*2/3;
 let rad=lat*pi/180,m=1-.006693421622965943*Math.sin(rad)**2,s=Math.sqrt(m);a=a*180/((6378245*(1-.006693421622965943))/(m*s)*pi);b=b*180/(6378245/s*Math.cos(rad)*pi);return[lng-b,lat-a,...rest];
}
function transform(g,fn){g=JSON.parse(JSON.stringify(g));function walk(a){return typeof a[0]==='number'?fn(a):a.map(walk);}for(let f of features(g))if(f.geometry)f.geometry.coordinates=walk(f.geometry.coordinates);return g;}
function quantile(a,q){let b=Array.from(a).filter(Number.isFinite).sort((a,b)=>a-b);return b.length?b[Math.floor((b.length-1)*q)]:0;}
function sample(grid,key,lng,lat){let [a,b,c,d]=grid.bbox,x=Math.floor((lng-a)/(c-a)*grid.width),y=Math.floor((d-lat)/(d-b)*grid.height);if(x<0||y<0||x>=grid.width||y>=grid.height)return NaN;let v=grid[key]?.[y*grid.width+x];return v===null||v===undefined||v===-9999?NaN:v;}
function popScale(v,cap,mode){let a=clamp(v,0,cap)/cap;return mode==='linear'?a:mode==='log'?Math.log1p(a*99)/Math.log(100):Math.sqrt(a);}
const api={clamp,readFloatTiff,features,polygons,validate,bounds,contains,gcjInverse,transform,quantile,sample,popScale};if(typeof module!=='undefined')module.exports=api;else root.RidgeCore=api;
})(typeof window!=='undefined'?window:globalThis);
