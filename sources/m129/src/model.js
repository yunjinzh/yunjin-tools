export const EXAMPLES = [
 {id:'robot',name:'工业机械臂',tag:'工业 · 结构',prompt:'一台橙色工业机械臂，深灰色底座，两段关节臂和双指夹爪，高 100 cm',size:[720,520,1000]},
 {id:'chair',name:'现代休闲椅',tag:'家具 · 产品',prompt:'一把绿色休闲椅，木质四条腿，宽 65 cm，高 85 cm',size:[650,650,850]},
 {id:'building',name:'教学楼',tag:'建筑 · 空间',prompt:'一栋 5 层现代教学楼，米白色外墙、蓝色窗户，宽 24 m，高 18 m',size:[24000,12000,18000]},
 {id:'lamp',name:'极简台灯',tag:'家居 · 设计',prompt:'一盏橙色极简台灯，圆形底座和锥形灯罩，高 50 cm',size:[260,260,500]},
 {id:'washer',name:'滚筒洗衣机',tag:'设备 · 装配',prompt:'一台白色滚筒洗衣机，圆形舱门、旋钮和洗涤剂抽屉，高 85 cm',size:[600,600,850]},
 {id:'car',name:'城市小汽车',tag:'交通 · 概念',prompt:'一辆蓝色小汽车，四个黑色轮胎和玻璃车窗，长 4 m',size:[4000,1800,1500]},
 {id:'table',name:'工作桌',tag:'家具 · 尺寸',prompt:'一张木质工作桌，四条深灰色桌腿，宽 140 cm，深 70 cm，高 75 cm',size:[1400,700,750]},
 {id:'rocket',name:'探索火箭',tag:'科教 · 创意',prompt:'一枚白色火箭，红色锥形头部和三个助推器，高 2 m',size:[750,750,2000]},
 {id:'shelf',name:'开放书架',tag:'家具 · 阵列',prompt:'一个 5 层木质书架，宽 100 cm，高 180 cm',size:[1000,350,1800]},
 {id:'tree',name:'景观树',tag:'场景 · 环境',prompt:'一棵绿色景观树，树干和多团球形树冠，高 3 m',size:[2200,2000,3000]},
 {id:'mug',name:'陶瓷马克杯',tag:'产品 · 容器',prompt:'一个橙色陶瓷马克杯，空心杯体和圆形把手，高 12 cm',size:[155,100,120]},
 {id:'gear',name:'齿轮示意',tag:'机械 · 阵列',prompt:'一个蓝色带中心孔的 20 齿示意齿轮，直径 20 cm',size:[200,200,35]}
];
const COLORS={橙:'#e07552',红:'#b94d44',绿:'#648578',蓝:'#477c9a',白:'#e6e5df',黑:'#34383b',黄:'#cfa550',紫:'#8271a8',灰:'#939998',粉:'#d69a9a',木:'#b58a60',orange:'#e07552',red:'#b94d44',green:'#648578',blue:'#477c9a',white:'#e6e5df',black:'#34383b',yellow:'#cfa550',purple:'#8271a8'};
export function parsePrompt(prompt){
 const p=prompt.toLowerCase();
 const kinds=[['robot',/机械臂|机器人|robot|manipulator/],['washer',/洗衣机|washing|washer/],['chair',/椅|chair/],['lamp',/台灯|灯具|lamp/],['building',/楼|建筑|building|school/],['car',/汽车|小车|\bcar\b|vehicle/],['table',/桌|table|desk/],['rocket',/火箭|rocket/],['shelf',/书架|货架|shelf/],['tree',/树|tree/],['mug',/杯|mug|cup/],['gear',/齿轮|gear/]];
 const id=kinds.find(([,r])=>r.test(p))?.[0];
 if(!id) throw new Error('当前参数化模式暂不支持这个类别。请选择下方示例，或接入 AI 生成更自由的模型。');
 const example=EXAMPLES.find(e=>e.id===id); const size=[...example.size];
 const unit={mm:1,毫米:1,cm:10,厘米:10,m:1000,米:1000};
 const tokens=[...p.matchAll(/(宽|width|长|length|深|depth|高|height|直径|diameter)\s*[:：=]?\s*(\d+(?:\.\d+)?)\s*(毫米|厘米|mm|cm|米|m)?/g)];
 for(const m of tokens){const v=Number(m[2])*(unit[m[3]]||1);if(v<1||v>100000) throw new Error('尺寸应为 1–100,000 mm，可使用 mm、cm 或 m。');let k=/宽|width|长|length/.test(m[1])?0:/高|height/.test(m[1])?2:1;size[k]=v;if(/直径|diameter/.test(m[1])){size[0]=v;size[1]=v;}}
 const colorEntry=Object.entries(COLORS).map(([s,c])=>[p.indexOf(s),c]).filter(([i])=>i>=0).sort((a,b)=>a[0]-b[0])[0];
 const countMatch=p.match(/(\d+)\s*(层|齿)/);const count=countMatch?Math.max(2,Math.min(id==='gear'?40:10,+countMatch[1])):id==='building'?5:id==='shelf'?5:20;
 return {id,size,color:colorEntry?.[1],count};
}
export function makeTemplate(prompt){
 const {id,size,color,count}=parsePrompt(prompt);const ex=EXAMPLES.find(e=>e.id===id);const parts=[];
 const primary=color||({robot:'#e07552',chair:'#648578',building:'#dedbd1',lamp:'#e07552',washer:'#e6e5df',car:'#477c9a',table:'#b58a60',shelf:'#b58a60',rocket:'#e6e5df',tree:'#648578',mug:'#e07552',gear:'#477c9a'}[id]);
 const dark='#343b40',metal='#929d9d',wood='#b58a60',glass='#86abb5';
 function add(type,name,dimensions,position,c=primary,rotation=[0,0,0],extra={}){parts.push({id:`part_${parts.length+1}`,name,type,dimensions,position,rotation,color:c,roughness:.45,metalness:c===metal?.65:.08,...extra});}
 const box=(n,d,p,c,r)=>add('box',n,d,p,c,r);const cyl=(n,d,h,p,c,r)=>add('cylinder',n,[d,d,h],p,c,r);const sph=(n,d,p,c)=>add('sphere',n,[d,d,d],p,c);const cone=(n,d,h,p,c,r)=>add('cone',n,[d,d,h],p,c,r);const tor=(n,d,t,p,c,r)=>add('torus',n,[d,d,t],p,c,r);
 if(id==='robot'){
  cyl('安装底盘',.54,.09,[0,0,.045],dark);cyl('旋转基座',.40,.15,[0,0,.16]);cyl('底座上盖',.32,.04,[0,0,.255],metal);
  box('肩部支架',[.25,.22,.20],[0,0,.34]);cyl('肩关节',.24,.30,[0,0,.41],dark,[90,0,0]);cyl('肩部端盖',.16,.32,[0,0,.41],metal,[90,0,0]);
  box('主臂',[.16,.16,.42],[-.12,0,.61],primary,[0,-32,0]);box('主臂盖板',[.11,.175,.30],[-.12,0,.61],primary,[0,-32,0]);
  cyl('肘关节',.22,.25,[-.24,0,.79],dark,[90,0,0]);cyl('肘部端盖',.13,.27,[-.24,0,.79],metal,[90,0,0]);
  box('前臂',[.13,.14,.48],[-.03,0,.91],primary,[0,63,0]);cyl('腕关节',.17,.20,[.18,0,1.02],dark,[90,0,0]);
  box('末端连接',[.15,.16,.13],[.28,0,.99],metal,[0,25,0]);box('夹爪基座',[.14,.26,.08],[.31,0,.91],dark);
  for(const s of [-1,1]){box('夹爪'+(s<0?'左':'右'),[.08,.04,.17],[.31,s*.11,.81],metal);box('夹指'+(s<0?'左':'右'),[.08,.06,.04],[.31,s*.09,.72],dark);}
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;cyl('固定螺栓 '+(i+1),.035,.012,[.21*Math.cos(a),.21*Math.sin(a),.095],metal);}
 } else if(id==='chair'){
  box('坐垫',[.76,.72,.16],[0,0,.53]);box('靠背',[.76,.15,.50],[0,.31,.84],primary,[-7,0,0]);
  for(const x of [-.3,.3])for(const y of [-.26,.26])box('木质椅腿',[.07,.07,.46],[x,y,.23],wood,[y>0?-6:6,x>0?6:-6,0]);
  for(const x of [-.43,.43]){box('扶手',[.10,.7,.08],[x,0,.74],wood);box('扶手支撑',[.06,.06,.20],[x,-.25,.63],wood);}
 } else if(id==='table'){
  box('桌面',[1,.5,.045],[0,0,.70]);for(const x of [-.44,.44])for(const y of [-.19,.19])box('金属桌腿',[.045,.045,.675],[x,y,.3375],dark);box('桌下横梁',[.88,.035,.06],[0,.19,.61],dark);
 } else if(id==='building'){
  box('主体建筑',[1,.48,.85],[0,0,.475]);box('基座',[1.08,.55,.05],[0,0,.025],metal);box('屋顶',[1.04,.52,.035],[0,0,.92],dark);
  for(let z=0;z<count;z++){for(let x=0;x<6;x++)for(const side of [-1,1])box(`第 ${z+1} 层窗 ${x+1}`,[.10,.009,.55/count],[(x-2.5)*.15,side*.245,.13+z*.77/count],glass);box('楼层线',[1.02,.50,.015],[0,0,.08+z*.83/count],metal);}
  box('入口',[.14,.012,.12],[0,-.25,.10],dark);box('雨棚',[.22,.12,.02],[0,-.29,.17],metal);
 } else if(id==='lamp'){
  cyl('圆形底座',.42,.045,[0,0,.0225],dark);cyl('灯杆',.035,.55,[0,0,.32],metal);add('cone','灯罩',[.42,.42,.28],[0,0,.71],primary,[0,0,0],{topRatio:.46});cyl('灯罩下沿',.425,.02,[0,0,.57],dark);sph('灯泡',.09,[0,0,.55],'#f5dd9d');
 } else if(id==='washer'){
  box('机身',[.7,.65,.93],[0,0,.49]);box('顶部面板',[.72,.67,.035],[0,0,.97]);box('控制区',[.66,.015,.13],[0,-.333,.85],dark);
  tor('舱门外圈',.41,.055,[0,-.36,.46],metal,[90,0,0]);cyl('舱门玻璃',.35,.03,[0,-.367,.46],'#374e58',[90,0,0]);tor('内筒轮廓',.26,.012,[0,-.386,.46],dark,[90,0,0]);box('舱门把手',[.035,.045,.13],[.22,-.395,.48],dark);
  box('洗涤剂抽屉',[.26,.03,.07],[-.17,-.353,.86]);cyl('程序旋钮',.075,.035,[.10,-.36,.85],metal,[90,0,0]);box('显示屏',[.12,.02,.05],[.24,-.35,.85],'#7eafb0');for(const x of [-.26,.26])for(const y of [-.24,.24])cyl('底脚',.06,.03,[x,y,.015],dark);
 } else if(id==='car'){
  box('车身',[1,.45,.19],[0,0,.22]);box('驾驶舱',[.50,.39,.21],[-.05,0,.405]);box('挡风玻璃',[.02,.35,.15],[.21,0,.42],glass,[0,-12,0]);for(const s of [-1,1]){box('侧窗',[.40,.01,.13],[-.06,s*.202,.43],glass);for(const x of [-.32,.32]){cyl('轮胎',.23,.09,[x,s*.235,.13],dark,[90,0,0]);cyl('轮毂',.12,.095,[x,s*.24,.13],metal,[90,0,0]);}box('车灯',[.02,.09,.05],[.51,s*.14,.25],'#f3e1b4');}
 } else if(id==='rocket'){
  cyl('主箭体',.28,.9,[0,0,.73]);cone('整流罩',.28,.27,[0,0,1.315],'#be5a48');tor('环形标记',.28,.025,[0,0,.98],'#be5a48');cyl('发动机',.20,.12,[0,0,.22],dark);
  for(let i=0;i<3;i++){const a=i*2*Math.PI/3;const x=.21*Math.cos(a),y=.21*Math.sin(a);cyl('助推器',.12,.52,[x,y,.39]);cone('助推器头锥',.12,.14,[x,y,.72],'#be5a48');cone('喷口',.10,.10,[x,y,.08],dark,[180,0,0]);}
 } else if(id==='shelf'){
  for(const x of [-.47,.47])box('侧板',[.05,.34,1.3],[x,0,.65]);for(let j=0;j<count;j++)box('第 '+(j+1)+' 层隔板',[.90,.34,.035],[0,0,.045+j*1.21/(count-1)]);box('背板',[.9,.025,1.3],[0,.16,.65]);
  for(let j=0;j<count-1;j++)for(let i=0;i<4;i++)box('书籍',[.065,.20,.16+(i%2)*.04],[-.33+i*.075,-.035,.14+j*1.21/(count-1)],['#708a7c','#cc775d','#d1b679','#748994'][i]);
 } else if(id==='tree'){
  cyl('树干',.12,.65,[0,0,.325],wood);for(const [x,y,z,d] of [[0,0,.95,.63],[-.22,0,.76,.48],[.22,.05,.82,.50],[0,-.2,.84,.47],[.08,.2,.88,.50]])sph('树冠',d,[x,y,z],primary);
 } else if(id==='mug'){
  add('tube','杯壁',[.75,.75,.88],[0,0,.48],primary,[0,0,0],{wall:.045});cyl('杯底',.75,.06,[0,0,.06]);tor('杯口',.705,.045,[0,0,.92]);tor('杯把',.48,.08,[.47,0,.49],primary,[90,0,0]);
 } else if(id==='gear'){
  add('tube','轮体',[.8,.8,.15],[0,0,.075],primary,[0,0,0],{wall:.25});for(let j=0;j<count;j++){const a=j*2*Math.PI/count;box('轮齿 '+(j+1),[.15,.07,.15],[.43*Math.cos(a),.43*Math.sin(a),.075],primary,[0,0,a*180/Math.PI]);}
 }
 return validateScene({version:1,name:ex.name,prompt,source:'parametric',template:id,targetSize:size,parts});
}
const vec=(v,n,lo,hi,label)=>{if(!Array.isArray(v)||v.length!==n||v.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi))throw new Error(`${label} 数据不合法`);return [...v];};
export function validateScene(s){
 if(!s||typeof s!=='object'||!Array.isArray(s.parts)||!s.parts.length||s.parts.length>180)throw new Error('模型需包含 1–180 个部件');
 const types=['box','cylinder','cone','sphere','torus','tube'];
 return {version:1,name:String(s.name||'未命名模型').slice(0,60),prompt:String(s.prompt||'').slice(0,3000),source:['parametric','ai','import'].includes(s.source)?s.source:'import',template:s.template?String(s.template).slice(0,30):undefined,targetSize:s.targetSize?vec(s.targetSize,3,.01,100000,'整体尺寸'):undefined,parts:s.parts.map((p,i)=>{
  if(!types.includes(p.type))throw new Error(`部件 ${i+1}：不支持 ${p.type} 几何体`);
  const dimensions=vec(p.dimensions,3,.00001,100000,`部件 ${i+1} 尺寸`);
  if(p.type==='torus'&&dimensions[2]>=dimensions[0]/2)throw new Error(`部件 ${i+1}：圆环线径过大`);
  const wall=typeof p.wall==='number'?p.wall:dimensions[0]*.08;
  if(p.type==='tube'&&(!Number.isFinite(wall)||wall<=0||wall>=dimensions[0]/2))throw new Error(`部件 ${i+1}：管壁厚度不合法`);
  const scalar=(x,f)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(1,x)):f;
  return {id:`part_${i+1}`,name:String(p.name||`部件 ${i+1}`).slice(0,80),type:p.type,dimensions,position:vec(p.position||[0,0,0],3,-100000,100000,'位置'),rotation:vec(p.rotation||[0,0,0],3,-3600,3600,'角度'),color:/^#[a-f0-9]{6}$/i.test(p.color)?p.color:'#e07552',roughness:scalar(p.roughness,.45),metalness:scalar(p.metalness,.1),...(p.type==='tube'?{wall}:{}),...(p.type==='cone'?{topRatio:scalar(p.topRatio,0)}:{})};})};
}
export const SYSTEM_PROMPT=`You are a precise industrial 3D scene designer. Return ONLY a JSON object, no markdown. Turn the user's description into a detailed, recognizable assembly of 8-100 named solid parts. Use sensible real-world proportions and enough details for recognizability. Schema: {"version":1,"name":"Chinese title","parts":[{"name":"part name in Chinese","type":"box|cylinder|cone|sphere|torus|tube","dimensions":[width,depth,height],"position":[x,y,z],"rotation":[rx,ry,rz],"color":"#rrggbb","roughness":0.45,"metalness":0.1}]}. All lengths are millimetres. Z is up, front is -Y, X right. Position is GEOMETRIC CENTER, rotation is Three.js intrinsic XYZ Euler in degrees. box dimensions are XYZ. sphere is ellipsoid XYZ. cylinder and cone use diameter dimensions[0], diameter dimensions[1], height dimensions[2], axis Z. cone may have topRatio 0..1, 0=pointed. torus has major centerline diameter dimensions[0], ignored dimensions[1], wire diameter dimensions[2], lies in XY. tube is cylinder with open center, add wall thickness (less than radius). Parts must touch or assemble coherently. Use rotation for arms and legs. No code, scripts, URLs or external assets. Don't include targetSize. Avoid organic subjects needing sculpting; approximate geometrically and say 概念模型 in the name when appropriate. Respect given measurements and colors. Do not claim engineering tolerances or physical validity.`;
