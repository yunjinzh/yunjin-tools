// Local coordinates in metres relative to each building, east/up/south before site rotation.
import {hutongViews} from '../urban/hutong.js';
export const views={
 hutong:hutongViews,
 waterfront:[{key:'shore',name:'南沿',caption:'前海南沿望向湖心岛亭',eye:[27,2.46,-10],at:[-18,1.8,-43]},{key:'lake',name:'湖岸全貌',caption:'俯瞰前海南岸',eye:[67,31,29],at:[-9,1,-15]}],
 zun:[{key:'district',name:'塔群',caption:'从国贸东南远眺商务区',eye:[472.59,230,1349.01],at:[-392.41,160,124.01]},{key:'tower',name:'中国尊',caption:'仰望弧形塔冠',eye:[-230,91,415],at:[0,248,0]}],
 cctv:[{key:'frame',name:'悬挑',caption:'观察斜交网格与悬挑结构',eye:[285,92,323],at:[0,106,0]}],
 palace:[
  {key:'axis',name:'朝殿',caption:'太和殿正面',eye:[-5,10.5,105],at:[0,14.6,0]},
  {key:'roof',name:'重檐',caption:'东南侧望重檐',eye:[64,27,76],at:[4,16.2,0]},
  {key:'eaves',name:'檐下',caption:'柱头彩画与格扇',eye:[16,11.2,36],at:[7,15.8,13.2]},
  {key:'sundial',name:'日晷',caption:'月台东侧日晷',eye:[41.4,11.9,30],at:[37.3,10.1,24.2]}
 ],
 tiananmen:[
  {key:'bridge',name:'金水桥',caption:'从桥南向北望',eye:[-3,8,124],at:[0,15,0]},
  {key:'tower',name:'城楼',caption:'东南侧看城台与屋脊',eye:[68,22,111],at:[0,16,0]},
  {key:'gate',name:'门阙',caption:'近观券洞、门扇与彩画',eye:[20,8,43],at:[3,18,5]}
 ]
};
export function shotPose(id,index,projected,aspect){
 const a=views[id]?.[index];if(!a)return;
 const theta=id==='palace'?.0356:id==='tiananmen'?.031:0,cs=Math.cos(theta),sn=Math.sin(theta);
 const rotate=([x,y,z])=>[projected.x+x*cs+z*sn,y,projected.z+z*cs-x*sn];
 const [x,y,z]=rotate(a.eye),center=rotate(a.at),dx=x-center[0],dy=y-center[1],dz=z-center[2];
 const framing=Math.max(1,1.17/aspect);
 // Keep portrait front views inside the courtyard, clear of the enclosing buildings.
 const scale=id==='palace'&&a.key==='axis'?Math.min(1.2,framing):framing;
 return {center,alpha:Math.atan2(dx,-dz),elev:Math.atan2(dy,Math.hypot(dx,dz)),dist:Math.hypot(dx,dy,dz)*scale};
}
