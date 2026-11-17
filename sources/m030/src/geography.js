// One geographic footprint for the map, elevation grid, and 3D island.
export const EARTH_RADIUS_M=6371000;
export const SELECTION_RADIUS_M=1800;
export const SELECTION_DIAMETER_M=SELECTION_RADIUS_M*2;
export const WORLD_DIAMETER=52;
export const GRID_SIZE=129;
export const GRID_LAYOUT='geodesic-local-129-v2';
export const METERS_TO_WORLD=WORLD_DIAMETER/SELECTION_DIAMETER_M;
const rad=d=>d*Math.PI/180;
const deg=r=>r*180/Math.PI;
export const wrapLongitude=lng=>((lng+180)%360+360)%360-180;
export function offsetCoordinate(lat,lng,eastM,northM){
 const distance=Math.hypot(eastM,northM);
 if(distance===0)return {lat,lng:wrapLongitude(lng)};
 const bearing=Math.atan2(eastM,northM),delta=distance/EARTH_RADIUS_M,a=rad(lat),b=rad(lng);
 const a2=Math.asin(Math.sin(a)*Math.cos(delta)+Math.cos(a)*Math.sin(delta)*Math.cos(bearing));
 const b2=b+Math.atan2(Math.sin(bearing)*Math.sin(delta)*Math.cos(a),Math.cos(delta)-Math.sin(a)*Math.sin(a2));
 return {lat:deg(a2),lng:wrapLongitude(deg(b2))};
}
export function gridCoordinate(lat,lng,x,y,n=GRID_SIZE){
 return offsetCoordinate(lat,lng,(x/(n-1)-.5)*SELECTION_DIAMETER_M,(.5-y/(n-1))*SELECTION_DIAMETER_M);
}
export function worldCoordinate(data,x,z){return offsetCoordinate(data.lat,data.lng,x/METERS_TO_WORLD,-z/METERS_TO_WORLD)}
export function footprintBounds(lat,lng){
 const nw=offsetCoordinate(lat,lng,-SELECTION_RADIUS_M,SELECTION_RADIUS_M),se=offsetCoordinate(lat,lng,SELECTION_RADIUS_M,-SELECTION_RADIUS_M);
 const unwrap=value=>lng+wrapLongitude(value-lng);
 return [[se.lat,unwrap(se.lng)],[nw.lat,unwrap(nw.lng)]];
}
export function sampleElevation(data,x,z){
 const n=data.n,fx=Math.max(0,Math.min(n-1,(x/WORLD_DIAMETER+.5)*(n-1))),fy=Math.max(0,Math.min(n-1,(z/WORLD_DIAMETER+.5)*(n-1)));
 const a=Math.floor(fx),b=Math.floor(fy),u=fx-a,v=fy-b;
 const h=(xx,yy)=>data.heights[Math.min(n-1,yy)*n+Math.min(n-1,xx)];
 return (h(a,b)*(1-u)+h(a+1,b)*u)*(1-v)+(h(a,b+1)*(1-u)+h(a+1,b+1)*u)*v;
}
export function footprintExtrema(heights,n){
 let min=Infinity,max=-Infinity;const c=(n-1)/2;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x-c)**2+(y-c)**2<=c*c){const h=heights[y*n+x];if(!Number.isFinite(h)||h< -11000||h>9000)throw new Error('圈选区域高程样本缺失');min=Math.min(min,h);max=Math.max(max,h)}
 return {min,max};
}
