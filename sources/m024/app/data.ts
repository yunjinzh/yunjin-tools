export type Material={id:string;name:string;en:string;kind:'wood'|'stone'|'fabric'|'paint';color:string;rough:number;price:number};
export type Item={id:string;type:string;name:string;en:string;category:string;w:number;d:number;h:number;x:number;z:number;rotation:number;color:string;material:string;locked?:boolean};
export type Room={id:string;name:string;en:string;x:number;z:number;w:number;d:number;material:string;bay?:boolean};
export type Wall={id:string;x1:number;z1:number;x2:number;z2:number;bearing:boolean;outside?:boolean;removed?:boolean;material:string;openings?:{from:number;width:number;type:'window'|'door'}[]};
export type Measure={id:string;a:[number,number];b:[number,number]};
export type Settings={time:number;exposure:number;sun:number;ambient:number;lamps:number;softness:number;ao:boolean;bloom:boolean;dof:boolean;shadow:boolean;quality:number;wallHeight:number;wallMode:'cut'|'full'|'low';snap:boolean;collision:boolean;grid:boolean;labels:boolean;dims:boolean;furniture:boolean;bearing:boolean;annotations:boolean;north:number};
export type Design={version:2;title:string;rooms:Room[];walls:Wall[];items:Item[];measures:Measure[];settings:Settings;prices:Record<string,number>;loss:number};
export type Selection={kind:'item'|'room'|'wall';id:string}|null;
export const MATERIALS:Material[]=[
 ['oak','自然橡木','Natural oak','wood','#bb956c',.7,320],['walnut','烟熏胡桃','Smoked walnut','wood','#674535',.6,380],['ash','浅色白蜡木','Pale ash','wood','#d6c6a5',.72,290],['teak','蜂蜜柚木','Honey teak','wood','#a97e4b',.6,360],['darkwood','深色乌木','Dark ebony','wood','#40362f',.5,420],['bleached','漂白木纹','Bleached wood','wood','#dcd7c6',.78,310],
 ['travertine','米色洞石','Travertine','stone','#d0c3a9',.76,280],['marble','云纹大理石','Cloud marble','stone','#deded8',.2,650],['slate','深灰板岩','Dark slate','stone','#525b5b',.82,240],['terrazzo','浅灰水磨石','Terrazzo','stone','#bebcb2',.55,260],['tile600','600 灰色地砖','600 grey tile','stone','#b3b7b4',.36,160],['tile300','300 防滑砖','300 non-slip tile','stone','#98a79e',.85,140],['tile800','800 米色地砖','800 beige tile','stone','#d8d1c2',.36,220],
 ['linen','亚麻本色','Natural linen','fabric','#d3cdbb',.96,0],['olive','苔绿绒布','Olive velvet','fabric','#70806c',.98,0],['clay','陶土织物','Terracotta weave','fabric','#b98166',.96,0],['ivory','象牙羊毛','Ivory wool','fabric','#e7e1d1',1,0],['ocean','海蓝织物','Ocean fabric','fabric','#52747d',.9,0],['charcoal','炭灰绒布','Charcoal velvet','fabric','#51575b',.98,0],
 ['chalk','暖白石灰','Warm chalk','paint','#e9e5d8',.95,0],['sage','鼠尾草绿','Sage green','paint','#a4b4a0',.93,0],['sand','砂岩米色','Sand beige','paint','#cbbfa6',.97,0],['ink','墨绿墙面','Forest ink','paint','#3d514b',.9,0],['blue','雾蓝墙面','Misty blue','paint','#8cabb2',.9,0],['rose','雾粉陶土','Dusty rose','paint','#c69c87',.96,0],['black','石墨灰','Graphite','paint','#43484c',.92,0]
].map(a=>({id:a[0] as string,name:a[1] as string,en:a[2] as string,kind:a[3] as Material['kind'],color:a[4] as string,rough:a[5] as number,price:a[6] as number}));
export const matById=(id:string)=>MATERIALS.find(m=>m.id===id)||MATERIALS[0];
const catalogRows:(string|number)[][]=[
 ['bed18','双人床 1.8m','King bed','卧室',1800,2000,950,'bed','linen'],['bed15','双人床 1.5m','Queen bed','卧室',1500,2000,900,'bed','ocean'],['single','单人床','Single bed','卧室',1200,2000,850,'bed','linen'],['crib','婴儿床','Baby cot','卧室',1250,700,900,'crib','ash'],['nightstand','床头柜','Nightstand','卧室',450,400,460,'cabinet','oak'],['wardrobe','衣柜','Wardrobe','卧室',2000,600,2400,'wardrobe','ash'],['smallwardrobe','小衣柜','Small wardrobe','卧室',1200,550,2200,'wardrobe','oak'],['vanity','梳妆台','Dressing table','卧室',1000,450,1300,'vanity','walnut'],['desk','书桌','Desk','卧室',1200,600,750,'desk','oak'],['chair','椅子','Chair','卧室',450,480,850,'chair','linen'],['shelf','书架','Bookcase','卧室',800,300,1800,'shelf','walnut'],['windowseat','飘窗垫','Window cushion','卧室',520,1800,150,'rug','ivory'],
 ['sofa3','三人沙发','Three-seat sofa','客厅',2400,900,820,'sofa','olive'],['sofa2','双人沙发','Two-seat sofa','客厅',1700,880,820,'sofa','linen'],['sectional','转角沙发','Sectional sofa','客厅',2800,1700,850,'sectional','ivory'],['armchair','单人沙发','Armchair','客厅',850,850,800,'armchair','clay'],['beanbag','懒人沙发','Beanbag','客厅',800,800,650,'beanbag','olive'],['coffee','茶几','Coffee table','客厅',1300,650,400,'table','walnut'],['side','边几','Side table','客厅',500,500,520,'round','oak'],['tvstand','电视柜','TV console','客厅',2400,400,450,'cabinet','oak'],['rug','地毯','Rug','客厅',2400,1700,20,'rug','ivory'],['shoe','鞋柜','Shoe cabinet','客厅',1000,350,1100,'cabinet','ash'],['console','玄关柜','Entry console','客厅',1400,380,900,'cabinet','walnut'],['lamp','落地灯','Floor lamp','客厅',450,450,1700,'lamp','chalk'],['plant','绿植','Indoor plant','客厅',500,500,1100,'plant','sage'],['plantbig','大绿植','Large plant','客厅',700,700,1800,'plant','sage'],
 ['dining','餐桌','Dining table','餐厨',1400,800,760,'table','oak'],['dining6','六人餐桌','Six-seat table','餐厨',1800,900,760,'table','walnut'],['roundtable','圆桌','Round table','餐厨',1000,1000,760,'round','oak'],['diningchair','餐椅','Dining chair','餐厨',450,480,820,'chair','olive'],['island','岛台','Kitchen island','餐厨',1800,900,900,'island','travertine'],['stool','吧椅','Bar stool','餐厨',420,420,980,'stool','walnut'],['kitchen','橱柜台面','Kitchen counter','餐厨',1600,600,880,'kitchen','chalk'],['stove','燃气灶','Gas hob','餐厨',750,450,920,'stove','black'],['sink','水槽','Kitchen sink','餐厨',800,450,920,'sink','marble'],['fridge','冰箱','Refrigerator','餐厨',700,700,1800,'fridge','chalk'],['sideboard','餐边柜','Sideboard','餐厨',1600,400,900,'cabinet','walnut'],
 ['toilet','马桶','Toilet','卫浴',400,700,750,'toilet','chalk'],['basin','浴室柜','Bathroom vanity','卫浴',800,500,830,'basin','oak'],['basin2','双盆浴室柜','Double vanity','卫浴',1200,500,830,'basin','walnut'],['shower','淋浴房','Shower enclosure','卫浴',900,900,2100,'shower','marble'],['bath','浴缸','Bathtub','卫浴',1600,750,560,'bath','chalk'],['washer','洗衣机','Washing machine','卫浴',600,600,850,'washer','chalk'],['heater','电热水器','Water heater','卫浴',800,450,650,'heater','chalk'],['storage','储物柜','Storage cabinet','卫浴',1000,400,1600,'wardrobe','ash'],
 ['tv65','65 寸电视','65-inch TV','家电',1450,80,850,'tv','black'],['tv55','55 寸电视','55-inch TV','家电',1230,80,720,'tv','black'],['fridge2','对开门冰箱','Double-door fridge','家电',910,700,1800,'fridge','tile600'],['acfloor','柜机空调','Standing AC','家电',500,380,1800,'acfloor','chalk'],['acwall','挂机空调','Wall AC','家电',900,250,300,'acwall','chalk'],['dishwasher','洗碗机','Dishwasher','家电',600,600,850,'dishwasher','tile600'],['oven','蒸烤箱高柜','Oven tower','家电',600,600,2100,'oven','black'],['dryer','烘干机','Tumble dryer','家电',600,600,850,'washer','chalk'],['purifier','空气净化器','Air purifier','家电',400,300,600,'purifier','chalk'],
 ['longdesk','长书桌','Long desk','书房',1600,700,750,'desk','walnut'],['officechair','办公椅','Office chair','书房',620,620,1050,'officechair','charcoal'],['bigshelf','大书架','Large bookcase','书房',1600,350,2100,'shelf','oak'],['piano','立式钢琴','Upright piano','书房',1500,600,1200,'piano','black'],['treadmill','跑步机','Treadmill','书房',800,1800,1200,'treadmill','charcoal'],['readingchair','阅读椅','Reading chair','书房',750,800,900,'armchair','ivory']
];
export type CatalogItem=Omit<Item,'id'|'x'|'z'|'rotation'> & {key:string};
export const CATALOG:CatalogItem[]=catalogRows.map(a=>({key:String(a[0]),name:String(a[1]),en:String(a[2]),category:String(a[3]),w:Number(a[4])/1000,d:Number(a[5])/1000,h:Number(a[6])/1000,type:String(a[7]),material:String(a[8]),color:matById(String(a[8])).color}));
export const uid=()=>Math.random().toString(36).slice(2,10);
export function makeItem(key:string,x=0,z=0,rotation=0):Item {const c=CATALOG.find(c=>c.key===key)||CATALOG[0];return {...c,id:uid(),x,z,rotation};}
export const DEFAULT_SETTINGS:Settings={time:16.5,exposure:1.12,sun:3.2,ambient:.75,lamps:1,softness:2,ao:true,bloom:true,dof:false,shadow:true,quality:1.5,wallHeight:2.8,wallMode:'cut',snap:true,collision:true,grid:false,labels:true,dims:true,furniture:true,bearing:false,annotations:true,north:0};
export function defaultDesign():Design{
 const rooms:Room[]=[
 {id:'master',name:'主卧室',en:'Master bedroom',x:-5.2,z:-4,w:3.15,d:3.3,material:'oak'},
 {id:'bath1',name:'主卫浴',en:'Ensuite',x:-1.85,z:-4,w:1.65,d:2.1,material:'tile300'},
 {id:'hall',name:'过道',en:'Hall',x:-1.85,z:-1.75,w:1.65,d:1.05,material:'travertine'},
 {id:'kids',name:'儿童房',en:'Children’s room',x:0,z:-4,w:2.45,d:3.3,material:'ash'},
 {id:'study',name:'次卧 · 书房',en:'Bedroom & study',x:2.65,z:-4,w:2.55,d:3.3,material:'walnut'},
 {id:'kitchen',name:'厨房',en:'Kitchen',x:-5.2,z:-.5,w:2.3,d:2.5,material:'tile600'},
 {id:'bath2',name:'客卫浴',en:'Bathroom',x:-5.2,z:2.2,w:2.3,d:1.8,material:'tile300'},
 {id:'dining',name:'餐厅 · 玄关',en:'Dining & entry',x:-2.7,z:-.5,w:3,d:4.5,material:'travertine'},
 {id:'living',name:'客厅',en:'Living room',x:.5,z:-.5,w:4.7,d:3.1,material:'oak'},
 {id:'balcony',name:'休闲阳台',en:'Balcony',x:.5,z:2.8,w:4.7,d:1.2,material:'teak'}];
 const wall=(id:string,x1:number,z1:number,x2:number,z2:number,bearing=false,outside=false,openings:Wall['openings']=[]):Wall=>({id,x1,z1,x2,z2,bearing,outside,material:'chalk',openings});
 const walls:Wall[]=[
 wall('north',-5.3,-4.1,5.3,-4.1,true,true,[{from:.6,width:1.85,type:'window'},{from:3.75,width:.8,type:'window'},{from:5.6,width:1.35,type:'window'},{from:8.4,width:1.4,type:'window'}]),
 wall('west',-5.3,-4.1,-5.3,4.1,true,true,[{from:4.3,width:1.3,type:'window'},{from:6.65,width:.8,type:'window'}]),
 wall('east',5.3,-4.1,5.3,4.1,true,true,[{from:4.25,width:2.65,type:'window'}]),
 wall('south',-5.3,4.1,5.3,4.1,true,true,[{from:3.7,width:1,type:'door'},{from:6,width:4.1,type:'window'}]),
 wall('p1',-1.95,-4.1,-1.95,-.6,false,false,[{from:2.5,width:.85,type:'door'}]),
 wall('p2',-.1,-4.1,-.1,-.6,false),wall('p3',2.55,-4.1,2.55,-.6,false),
 wall('p4',-5.3,-.6,5.3,-.6,false,false,[{from:2.25,width:.85,type:'door'},{from:3.35,width:1.85,type:'door'},{from:5.4,width:.85,type:'door'},{from:8.1,width:.85,type:'door'}]),
 wall('p5',-1.95,-1.85,-.1,-1.85,false,false,[{from:.45,width:.8,type:'door'}]),
 wall('p6',-2.8,-.6,-2.8,4.1,false,false,[{from:.8,width:1.2,type:'door'},{from:3.2,width:.8,type:'door'}]),
 wall('p7',-5.3,2.1,-2.8,2.1,false),wall('p8',.4,2.7,5.3,2.7,false,false,[{from:.2,width:4.35,type:'door'}])];
 const items:Item[]=[
 makeItem('bed18',-3.65,-2.8),makeItem('nightstand',-4.86,-3.42),makeItem('nightstand',-2.44,-3.42),makeItem('wardrobe',-3.6,-1.02,180),
 makeItem('toilet',-.7,-3.58),makeItem('basin',-1.48,-2.65,90),makeItem('single',1.35,-2.9),makeItem('desk',1.15,-1.06,180),makeItem('chair',1.15,-1.7,180),
 makeItem('single',4.4,-2.9),makeItem('longdesk',3.85,-1.08,180),makeItem('officechair',3.75,-1.75,180),makeItem('shelf',2.9,-3.2,90),
 makeItem('kitchen',-4.86,.5,90),makeItem('stove',-4.84,-.04,90),makeItem('sink',-4.84,1.13,90),makeItem('fridge',-3.33,-.1),makeItem('kitchen',-3.75,1.64,180),
 makeItem('shower',-4.67,2.76),makeItem('toilet',-3.28,2.68),makeItem('basin',-3.39,3.7,180),makeItem('washer',-4.77,3.61,90),
 makeItem('dining',-1.22,1.1),makeItem('diningchair',-1.6,.36),makeItem('diningchair',-.88,.36),makeItem('diningchair',-1.6,1.87,180),makeItem('diningchair',-.88,1.87,180),makeItem('sideboard',-1.3,-.2),makeItem('shoe',-2.43,3.2,90),
 makeItem('rug',2.7,1.2),makeItem('sofa3',2.9,2.02,180),makeItem('coffee',2.65,.96),makeItem('tvstand',2.75,-.25),makeItem('tv65',2.75,-.37),makeItem('armchair',4.55,.99,270),makeItem('lamp',4.85,2.2),makeItem('plantbig',.95,-.12),makeItem('roundtable',2.85,3.4),makeItem('readingchair',1.3,3.4,90),makeItem('plant',4.76,3.4)];
 return {version:2,title:'三室两厅 · 光影样板间',rooms,walls,items,measures:[],settings:{...DEFAULT_SETTINGS},prices:{},loss:5};
}
export const area=(r:Room)=>r.w*r.d;
export function bounds(i:Item){const a=i.rotation*Math.PI/180;return {w:Math.abs(Math.cos(a))*i.w+Math.abs(Math.sin(a))*i.d,d:Math.abs(Math.sin(a))*i.w+Math.abs(Math.cos(a))*i.d};}
export function solidSegments(w:Wall){const len=Math.hypot(w.x2-w.x1,w.z2-w.z1),dx=(w.x2-w.x1)/len,dz=(w.z2-w.z1)/len;let p=0;const seg:{x1:number;z1:number;x2:number;z2:number}[]=[];for(const o of [...w.openings||[]].sort((a,b)=>a.from-b.from)){if(o.from>p)seg.push({x1:w.x1+p*dx,z1:w.z1+p*dz,x2:w.x1+o.from*dx,z2:w.z1+o.from*dz});p=o.from+o.width;}if(p<len)seg.push({x1:w.x1+p*dx,z1:w.z1+p*dz,x2:w.x2,z2:w.z2});return seg;}
export function collisionAt(design:Design,item:Item,x:number,z:number){
 const b=bounds(item),pad=.015;if(x-b.w/2< -5.24||x+b.w/2>5.24||z-b.d/2< -4.04||z+b.d/2>4.04)return true;
 const soft=['rug','stove','sink','tv','acwall','heater'];if(soft.includes(item.type))return false;
 for(const w of design.walls.filter(w=>!w.removed))for(const s of solidSegments(w))if(x+b.w/2>Math.min(s.x1,s.x2)-.07+pad&&x-b.w/2<Math.max(s.x1,s.x2)+.07-pad&&z+b.d/2>Math.min(s.z1,s.z2)-.07+pad&&z-b.d/2<Math.max(s.z1,s.z2)+.07-pad)return true;
 for(const other of design.items){if(other.id===item.id||soft.includes(other.type))continue;const o=bounds(other);if(Math.abs(x-other.x)<(b.w+o.w)/2-.055&&Math.abs(z-other.z)<(b.d+o.d)/2-.055)return true;}return false;
}
export function placement(design:Design,item:Item,x:number,z:number){
 const b=bounds(item);let nx=x,nz=z;
 if(design.settings.snap){nx=Math.round(nx*10)/10;nz=Math.round(nz*10)/10;for(const w of design.walls.filter(w=>!w.removed))for(const s of solidSegments(w)){if(Math.abs(s.x2-s.x1)<.02&&nz>Math.min(s.z1,s.z2)-b.d/2&&nz<Math.max(s.z1,s.z2)+b.d/2)for(const sign of [-1,1]){const edge=s.x1+sign*(b.w/2+.1);if(Math.abs(nx-edge)<.12)nx=edge;}if(Math.abs(s.z2-s.z1)<.02&&nx>Math.min(s.x1,s.x2)-b.w/2&&nx<Math.max(s.x1,s.x2)+b.w/2)for(const sign of [-1,1]){const edge=s.z1+sign*(b.d/2+.1);if(Math.abs(nz-edge)<.12)nz=edge;}}}
 nx=Math.max(-5.2+b.w/2,Math.min(5.2-b.w/2,nx));nz=Math.max(-4+b.d/2,Math.min(4-b.d/2,nz));if(design.settings.collision&&collisionAt(design,item,nx,nz))return null;return {x:+nx.toFixed(3),z:+nz.toFixed(3)};
}
export function findSpace(d:Design,item:Item,x=0,z=0){const direct=placement(d,item,x,z);if(direct)return direct;for(let radius=.2;radius<12;radius+=.2)for(let angle=0;angle<Math.PI*2;angle+=.3){const p=placement(d,item,x+Math.cos(angle)*radius,z+Math.sin(angle)*radius);if(p)return p;}return null;}
export function validateDesign(raw:unknown):Design{
 if(!raw||typeof raw!=='object')throw new Error('方案格式无效');const v=raw as Design;if(v.version!==2||!Array.isArray(v.items)||!Array.isArray(v.rooms)||!Array.isArray(v.walls)||v.items.length>300||v.rooms.length>60||v.walls.length>150)throw new Error('请选择光境导出的 JSON 方案（版本 2）');
 const finite=(x:unknown,min:number,max:number)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;const color=(s:unknown)=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
 for(const i of v.items)if(!CATALOG.some(c=>c.type===i.type)||!finite(i.w,.05,10)||!finite(i.d,.05,10)||!finite(i.h,.01,5)||!finite(i.x,-6,6)||!finite(i.z,-5,5)||!finite(i.rotation,-3600,3600)||!color(i.color)||typeof i.id!=='string'||typeof i.name!=='string')throw new Error('家具参数超出允许范围');
 for(const r of v.rooms)if(!finite(r.x,-6,6)||!finite(r.z,-5,5)||!finite(r.w,.1,12)||!finite(r.d,.1,10)||typeof r.id!=='string'||typeof r.name!=='string')throw new Error('房间数据无效');
 for(const w of v.walls){if(![w.x1,w.x2].every(x=>finite(x,-6,6))||![w.z1,w.z2].every(x=>finite(x,-5,5))||Math.hypot(w.x2-w.x1,w.z2-w.z1)<.02||typeof w.id!=='string')throw new Error('墙体数据无效');for(const o of w.openings||[])if(!finite(o.from,0,12)||!finite(o.width,.1,5)||!['door','window'].includes(o.type))throw new Error('门窗数据无效');}
 const settings={...DEFAULT_SETTINGS,...v.settings};for(const [k,range] of Object.entries({time:[0,24],exposure:[.4,2],sun:[0,6],ambient:[0,2],lamps:[0,3],softness:[0,5],quality:[1,2],wallHeight:[2,4],north:[0,360]}))if(!finite(settings[k as keyof Settings],range[0],range[1]))throw new Error('渲染参数无效');if(!['cut','full','low'].includes(settings.wallMode))throw new Error('墙体模式无效');
 for(const m of v.measures||[])if(!Array.isArray(m.a)||!Array.isArray(m.b)||![...m.a,...m.b].every(n=>finite(n,-20,20)))throw new Error('测量数据无效');
 return {...v,title:String(v.title||'我的设计方案').slice(0,80),settings,prices:Object.fromEntries(Object.entries(v.prices||{}).filter(([,p])=>finite(p,0,100000))),loss:finite(v.loss,0,30)?v.loss:5,measures:v.measures||[]};
}
