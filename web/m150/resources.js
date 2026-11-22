/* Original parametric scene assets. Dimensions are metres. Local +Z is vehicle forward. */
(() => {
  "use strict";
  const assets = [];
  const body = {role: "body"};
  const part = (type, x, y, z, w, h, d, color, extra = {}) =>
    ({type, x, y, z, w, h, d, color, ...extra});
  const box = (...args) => part("box", ...args);
  const ball = (...args) => part("sphere", ...args);
  const cyl = (...args) => part("cylinder", ...args);
  const cone = (...args) => part("cone", ...args);
  const face = (vertices, faces, color, extra = {}) =>
    ({type: "mesh", x:0,y:0,z:0,w:1,h:1,d:1,vertices,faces,color,...extra});
  // A tapered section optionally displaced at its tip. Supports branches, inclined columns, blades and roofs.
  function taper(a,b,r0,r1,color,sides=6,extra={}) {
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2], len=Math.hypot(dx,dy,dz)||1;
    const n=[dx/len,dy/len,dz/len];
    const q=Math.abs(n[1])<.9 ? [0,1,0] : [1,0,0];
    const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const ur=cross(n,q), ul=Math.hypot(...ur),u=ur.map(v=>v/ul),v=cross(n,u);
    const vertices=[],faces=[];
    for (const [p,r] of [[a,r0],[b,r1]]) {
      for(let i=0;i<sides;i++){
        const t=2*Math.PI*i/sides;
        vertices.push(p.map((s,k)=>s+(u[k]*Math.cos(t)+v[k]*Math.sin(t))*r));
      }
    }
    for(let j=0;j<sides;j++){const k=(j+1)%sides;faces.push([j,k,k+sides,j+sides]);}
    faces.push(Array.from({length:sides},(_,i)=>sides-1-i),Array.from({length:sides},(_,i)=>sides+i));
    return face(vertices,faces,color,extra);
  }
  function ring(x,y,z,r,width,color,n=20) {
    const vs=[],fs=[];
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n;
      for(const t of [r,r-width]) vs.push([x+Math.cos(a)*t,y,z+Math.sin(a)*t]);
    }
    for(let i=0;i<n;i++){const j=(i+1)%n;fs.push([i*2,i*2+1,j*2+1,j*2]);}
    return face(vs,fs,color);
  }
  const grey="#9ba9a8", steel="#657d84", charcoal="#38494d", glass="#79acb6", wood="#a47b55", lamp="#f1dba1";
  const bulb=(x,y,z,w,h,d,color,extra={})=>ball(x,y,z,w,h,d,color,{sides:8,...extra});
  const byName = (group, code, index, family, name, color, parts, extra={}) => {
    assets.push({id:group+"-"+code+"-"+String(index+1).padStart(2,"0"),group,family,name,color,parts,...extra});
  };
  // Each family has a separate optical profile and five purpose-specific colourways.
  const materialFamilies = [
    ["glass","建筑玻璃","smooth",.10,.10,.53,0,["超白","湖蓝","浅茶","烟灰","青绿"],["#bce3e4","#73aac2","#aeaca0","#899ca6","#73b1a1"]],
    ["night-glass","夜景玻璃","grid",.18,.22,.87,.48,["暖窗","冷窗","琥珀","青光","紫灰"],["#d3ad6d","#80a9b9","#c98a48","#61a7a4","#9897b8"]],
    ["metal","建筑金属","brushed",.26,.84,1,0,["原铝","钛灰","青铜","紫铜","香槟"],["#afbfc1","#777f88","#8e856d","#a57760","#baac8b"]],
    ["wall","墙体涂层","grain",.82,.01,1,0,["陶红","暖白","林绿","黛蓝","砂灰"],["#b06e5d","#d6cec0","#6f8978","#708997","#aaa69c"]],
    ["water","动态水面","ripple",.10,.20,.68,.02,["河湾","近海","浅池","深水","山泉"],["#529a9e","#487e90","#81bec1","#355f77","#79a99a"]],
    ["neon","霓虹发光","smooth",.18,.1,1,.94,["冰蓝","暖橙","玉绿","莓红","柠黄"],["#73e4ec","#ffac70","#70e7b4","#e77d9e","#f0db80"]],
    ["concrete","清水混凝土","stone",.90,.01,1,0,["冷灰","浅暖灰","暖褐","象牙","炭灰"],["#ababaa","#bbb8ae","#9c9082","#d2c9b9","#7c8080"]],
    ["brick","烧结砖","brick",.86,0,1,0,["赤陶","深红","咖棕","灰蓝","砂黄"],["#b46e54","#955a4e","#967766","#77858c","#be9f79"]],
    ["wood","天然木饰面","grain",.64,.01,1,0,["白橡","胡桃","柚木","红松","灰榆"],["#bda582","#816551","#a57c54","#b58d70","#9c9383"]],
    ["marble","天然大理石","stone",.19,.08,1,0,["雪白","青黛","云灰","米黄","墨黑"],["#d5d3c8","#779390","#a8ada9","#c9b797","#555d60"]],
    ["granite","花岗岩","stone",.78,.06,1,0,["芝麻灰","樱红","珍珠白","墨绿","金砂"],["#999e9c","#ad8e83","#c9c7be","#75837c","#b3a18c"]],
    ["tile","陶瓷面砖","tile",.30,.05,1,0,["钴蓝","月白","竹青","深灰","赤褐"],["#68859a","#d3d0c6","#8aa99a","#747f85","#ac7e68"]],
    ["asphalt","沥青路面","grain",.92,0,1,0,["原黑","暖灰","赤色","石灰","青灰"],["#485255","#707571","#946d61","#828783","#606e73"]],
    ["paving","铺地石板","tile",.79,0,1,0,["花灰","米白","栗褐","碳黑","灰绿"],["#a9aaa1","#c7c5b7","#9f8a76","#737877","#91a198"]],
    ["polymer","工程塑料","smooth",.44,.02,1,0,["雾白","海蓝","信号橙","锌黄","墨绿"],["#ced4cd","#6699aa","#d88c63","#cfaf61","#688984"]],
    ["rubber","橡胶地坪","grain",.94,.0,1,0,["跑道红","深绿","橄榄","沙黄","灰蓝"],["#b37b67","#688d78","#9c9e77","#c8ac78","#7997a6"]],
    ["roof","金属屋面","ribs",.44,.65,1,0,["浅铝","氧化红","海军蓝","哑青","岩灰"],["#b7c1bd","#a57164","#59788b","#78988e","#838f92"]],
    ["screen","穿孔板","perforated",.46,.64,1,0,["浅银","烟金","枪灰","深铜","冰蓝"],["#c0c6c0","#b39c72","#737f87","#977865","#92aeb8"]],
    ["fabric","编织织物","fabric",.87,.01,1,0,["亚麻","苔绿","褚红","水蓝","淡墨"],["#c0b79e","#879781","#b68776","#8ca8b4","#8a8f91"]],
    ["soil","自然土壤","grain",.98,0,1,0,["表土","棕壤","砂壤","黏土","腐殖"],["#89755c","#927964","#b3a07e","#a2846a","#706557"]],
    ["grass","草坪覆面","grain",.91,0,1,0,["春芽","夏茵","秋草","苔地","深翠"],["#99aa75","#789760","#aca57c","#849b81","#638968"]],
    ["stone-wall","叠砌石墙","brick",.89,.01,1,0,["米砂","页岩","青石","黄砂","山灰"],["#b9a88f","#8b9291","#8a9b95","#b29a76","#a4a49a"]],
    ["coating","工业烤漆","smooth",.31,.32,1,0,["设备绿","工程黄","安全橙","海港蓝","乳灰"],["#779989","#d2ae62","#d88a5f","#6a91a1","#c4cac5"]],
    ["solar","光伏组件","grid",.21,.61,1,.02,["靛青","蓝黑","银蓝","深蓝","石墨"],["#425e78","#33495b","#68839a","#395a77","#56646c"]]
  ];
  for(const [code,family,pattern,rough,metal,alpha,light,labels,colors] of materialFamilies){
    for(let i=0;i<10;i++){
      const variant=i%5, smooth=i>=5, color=colors[variant];
      const attrs={pattern,roughness:Math.max(.02,Math.min(1,rough+(smooth?-0.075:.075))),
        metalness:metal,opacity:alpha,emissive:light,patternScale:smooth?1.8:1};
      byName("material",code,i,family,labels[variant]+" · "+(smooth?"精饰":"原饰")+family,color,
        [ball(0,.85,0,1.7,1.7,1.7,color,{sides:16,...body})],attrs);
    }
  }
  const palettes=[
    ["雾灰", "#a2b3af","#647c80"],["海青","#689698","#d1c7a7"],
    ["赤陶","#be806c","#586c73"],["砂金","#b29c74","#687e80"]
  ];
  const names=["紧凑型","标准型","延展型"];
  const propFamilies=[
    ["bench","休憩长椅"],["light","道路灯杆"],["signal","交通信号灯"],["sign","道路指示牌"],
    ["shelter","公交站亭"],["bin","分类垃圾桶"],["bollard","阻车柱"],["planter","景观花箱"],
    ["bike","自行车架"],["fence","园区围栏"],["solar","光伏设施"],["utility","配电柜"],
    ["stair","景观台阶"],["canopy","遮阳构架"],["hydrant","消防栓"],["geo","基础几何体"],
    ["table","户外桌组"],["dock","码头设施"]
  ];
  function makeProp(code,form,c,a){
    const p=[], f=form, scale=.85+f*.2;
    const b=(...args)=>p.push(box(...args)), k=(...args)=>p.push(cyl(...args)), s=(...args)=>p.push(bulb(...args));
    switch(code){
      case "bench":{
        const w=1.5+f*.55;
        for (const x of [-w*.35,w*.35]) {b(x,.27,0,.11,.49,.65,a);b(x,.64,-.23,.08,.58,.08,a);}
        for(let i=0;i<4;i++) b(0,.51,-.21+i*.14,w,.10,.11,c,body);
        b(0,.74,-.24,w,.13,.09,c,body);b(0,.93,-.26,w,.15,.09,c,body);break;
      }
      case "light":{
        const h=3.8+f*1.35;
        k(0,.13,0,.47,.26,.47,a);k(0,h/2,0,.15,h,.15,c,body);
        for(const dir of (f===2?[-1,1]:[1])){b(dir*.58,h-.1,0,1.15,.12,.14,c,body);b(dir*1.05,h-.13,0,.58,.17,.33,a);b(dir*1.05,h-.24,0,.5,.04,.25,lamp);}
        break;
      }
      case "signal":{
        const h=2.9+f*.8;k(0,.12,0,.42,.24,.42,steel);k(0,h/2,0,.14,h,.14,a);
        const x=f===2?.9:0;
        if(x)b(.45,h-.65,0,1.1,.14,.13,a);
        b(x,h-.5,0,.57,1.60,.36,c,body);
        ["#d97865","#e0bc71","#70b397"].forEach((col,j)=>{s(x,h+.01-j*.48,.22,.31,.31,.13,col);b(x,h+.20-j*.48,.22,.38,.06,.29,charcoal);});
        break;
      }
      case "sign":{
        const h=2.25+f*.38;k(0,h/2,0,.13,h,.13,a);k(0,.09,0,.44,.18,.44,grey);
        for(let i=0;i<f+1;i++){const dx=i%2?-1:1;b(dx*.3,h-.28*i,0,1.25,.25,.09,c,body);b(dx*.3,h-.28*i,.055,.65,.045,.02,"#d7e1d7");}
        break;
      }
      case "shelter":{
        const w=2.8+f*1.35;
        b(0,.10,0,w+.32,.2,1.88,grey);[-1,0,1].forEach(j=>b(j*w*.46,1.37,-.62,.12,2.6,.15,a));
        b(0,1.53,-.65,w*.9,1.69,.08,glass);b(0,2.72,0,w+.44,.27,2,c,body);
        b(-w*.1,.60,-.33,w*.62,.15,.48,wood);b(w*.4,1.46,-.47,.45,1.05,.13,"#c3bc9a");break;
      }
      case "bin":{
        const n=f+1;
        for(let j=0;j<n;j++){const x=(j-(n-1)/2)*.63; b(x,.53,0,.55,1,.54,c,body);b(x,1.07,0,.58,.12,.58,a);
          b(x,.89,.277,.34,.14,.025,charcoal);b(x,.61,.28,.16,.14,.02,["#69a899","#b89d65","#76a1b1"][j]);}
        break;
      }
      case "bollard":{
        const h=.62+f*.16;
        k(0,.085,0,.43,.17,.43,a,{sides:10}); k(0,h/2+.1,0,.29,h,.29,c,{sides:f===0?5:12,...body});
        k(0,h+.01,0,.30,.095,.30,"#d9bd77");s(0,h+.11,0,.29,.13,.29,a);break;
      }
      case "planter":{
        const w=1.05+f*.65;b(0,.34,0,w,.65,.86,c,body);b(0,.68,0,w+.08,.11,.94,a);b(0,.748,0,w-.12,.04,.73,"#776c54");
        for(let j=0;j<3+f;j++){const x=(j/(2+f)-.5)*w*.75; p.push(cone(x,.99,.06*Math.sin(j),.44,.64,.44,j%2?"#70956e":"#88a677",{sides:7}));}
        break;
      }
      case "bike":{
        const n=2+f; b(0,.055,0,n*.64+.4,.11,.93,a);
        for(let j=0;j<n;j++){const x=(j-(n-1)/2)*.62;b(x,.39,-.31,.075,.72,.075,c,body);b(x,.39,.31,.075,.72,.075,c,body);b(x,.76,0,.075,.075,.67,c,body);}break;
      }
      case "fence":{
        const w=2+f*.69,h=1.08+f*.12;
        for(const x of [-w/2,w/2]){b(x,h*.5,0,.16,h,.16,a);b(x,h+.04,0,.21,.10,.21,c,body);}
        for(let i=0;i<2;i++)b(0,.23+i*(h-.38),0,w,.09,.11,c,body);
        for(let j=1;j<5+f;j++) b(-w/2+w*j/(5+f),h*.5,0,.055,h*.64,.06,c,body);break;
      }
      case "solar":{
        const w=2.2+f*.75;b(0,.15,0,w*.6,.30,1.2,grey);for(const x of [-.5,.5])b(x,.91,0,.13,1.5,.13,a);
        b(0,1.73,0,w,.15,1.67,c,body);
        for(let i=0;i<3+f;i++){const ww=w/(3+f);b(-w/2+ww*(i+.5),1.82,0,ww-.04,.035,1.58,"#51728a");}
        for(const z of [-.4,0,.4]) b(0,1.845,z,w-.04,.025,.025,"#8ba1a8");break;
      }
      case "utility":{
        const w=.83+f*.45,h=1.5+f*.2;b(0,.12,0,w+.16,.24,.81,grey);b(0,h/2+.17,0,w,h,.72,c,body);b(0,h+.23,0,w+.1,.13,.8,a);
        const n=1+f;for(let j=0;j<n;j++){const x=(j-(n-1)/2)*w/n;b(x,h*.50+.18,.372,w/n-.06,h-.12,.035,c,body);b(x+.12,h*.50+.19,.405,.035,.20,.04,charcoal);
          for(let i=0;i<3;i++)b(x,h*.78+.08+i*.07,.4,w/n*.55,.033,.02,a);}
        break;
      }
      case "stair":{
        const n=3+f,w=1.9+f*.6;for(let j=0;j<n;j++){const h=(j+1)*.17; b(0,h/2,(n/2-j)*.35,w,h,.37,c,body);
          b(0,h+.012,(n/2-j)*.35+.12,w,.02,.055,a);}
        for(const x of [-w*.46,w*.46]){b(x,.61,n*.16,.055,.83,.055,a);b(x,.61+n*.15,-n*.13,.055,.84,.055,a);
          p.push(taper([x,1.0,n*.16],[x,1.01+n*.15,-n*.13],.045,.045,a));}break;
      }
      case "canopy":{
        const w=2.2+f*.8;for(const x of [-w*.43,w*.43])for(const z of [-.85,.85]) b(x,1.32,z,.16,2.64,.16,a);
        for(const z of [-.85,.85])b(0,2.65,z,w+.2,.18,.19,c,body);
        for(let j=0;j<7+f*2;j++) b((j/(6+2*f)-.5)*w,2.8,0,.12,.16,2.24,c,body);break;
      }
      case "hydrant":{
        const h=.84+f*.15;k(0,.09,0,.53,.18,.53,a);k(0,.23+h/2,0,.36,h,.36,c,body);s(0,h+.25,0,.43,.27,.43,c,body);
        b(0,h*.68+.18,0,.76,.21,.23,c,body);for(const x of [-.37,.37])b(x,h*.68+.18,0,.13,.28,.28,a);
        k(0,h+.43,0,.13,.14,.13,a,{sides:6});break;
      }
      case "geo":{
        const kinds=["box","cylinder","cone","sphere"];
        const i=palettes.findIndex(v=>v[1]===c);const sh=kinds[i];const h=.9+f*.75, w=1+f*.28;
        p.push(part(sh,0,h*.5,0,w,h,w,c,{sides:f===0?5:f===1?8:16,...body}));break;
      }
      case "table":{
        const w=1.2+f*.44; b(0,.83,0,w,.12,.96,c,body);
        for(const x of [-w*.35,w*.35])for(const z of [-.31,.31])b(x,.4,z,.11,.8,.11,a);
        for(const z of [-.82,.82]){b(0,.48,z,w,.12,.37,c,body);for(const x of [-w*.32,w*.32])b(x,.22,z,.10,.44,.26,a);}break;
      }
      case "dock":{
        if(f===0){k(0,.13,0,.72,.26,.72,a);k(0,.40,0,.44,.40,.44,c,body);b(0,.64,0,.88,.18,.34,c,body);}
        else if(f===1){for(const x of [-.33,.33])b(x,1,0,.10,2,.13,c,body);for(let i=0;i<6;i++)b(0,.12+i*.33,0,.72,.08,.09,a);}
        else {b(0,.13,0,1.35,.26,1.35,a);k(0,.95,0,.24,1.64,.24,c,body);k(0,1.87,0,.54,.21,.54,lamp,body);p.push(cone(0,2.08,0,.59,.24,.59,c));}
        break;
      }
    }
    return p;
  }
  for(const [code,family] of propFamilies) for(let i=0;i<12;i++){
    const [tone,c,a]=palettes[i%4],f=Math.floor(i/4);
    const title=code==="geo"?["方体","棱柱","圆锥","球体"][i%4]:family;
    byName("prop",code,i,family,tone+title+" · "+names[f],c,makeProp(code,f,c,a));
  }
  const plantFamilies=[
    ["canopy","常绿乔木",["香樟","广玉兰","桂花","榕树","杜英"],["#739172","#708b72","#869970","#66866b","#7d9576"]],
    ["hedge","常绿灌木",["海桐","冬青","黄杨","红叶石楠","栀子"],["#81936c","#6c896d","#9ea974","#a07f66","#849a76"]],
    ["palm","棕榈类",["蒲葵","华盛顿棕","布迪椰子","海枣","鱼尾葵"],["#829968","#899e72","#91aaa0","#79927a","#8b9b71"]],
    ["bamboo","竹类",["毛竹","紫竹","凤尾竹","孝顺竹","刚竹"],["#739775","#77957c","#91a472","#7f996c","#809a75"]],
    ["flowers","花草",["鸢尾","狼尾草","绣球","玉簪","金鸡菊"],["#a394b1","#b6a47c","#aba5c0","#91aa8a","#c6ae67"]],
    ["deciduous","落叶乔木",["银杏","榉树","三角枫","朴树","乌桕"],["#b4af72","#9a9f6c","#b48d6d","#8e9c75","#a4896c"]],
    ["shrubs","落叶灌木",["紫薇","连翘","绣线菊","木槿","迎春"],["#a8919d","#b7a464","#aa9189","#a39aa6","#b6ab72"]],
    ["conifer","针叶树",["雪松","云杉","侧柏","圆柏","杉木"],["#66877b","#6f887c","#7c9279","#719183","#81927c"]]
  ];
  const offsetColor=(hex,amount)=>"#"+[1,3,5].map(i=>Math.min(255,Math.max(0,parseInt(hex.slice(i,i+2),16)+amount)).toString(16).padStart(2,"0")).join("");
  function leaves(x,y,z,angle,len,width,rise,sag,c){
    const dx=Math.cos(angle),dz=Math.sin(angle), px=-dz,pz=dx;
    const pt=(s,ht,off)=>[x+dx*len*s+px*off,y+ht,z+dz*len*s+pz*off];
    return face([pt(0,0,0),pt(.48,rise,-width),pt(.5,rise+.08,0),pt(.48,rise,width),pt(1,-sag,0)],
      [[0,2,1],[0,3,2],[1,2,4],[2,3,4]],c,body);
  }
  function plantParts(code,species,stage,color){
    const p=[], mul=[.73,1,1.29][stage], v=species, skew=(v-2)*.08;
    const crown=(x,y,z,w,h,d,col)=>p.push(bulb(x*mul,y*mul,z*mul,w*mul,h*mul,d*mul,col,{sides:7+v%3,...body}));
    const trunk=(x,y,z,w,h,d,col="#806f58")=>p.push(cyl(x*mul,y*mul,z*mul,w*mul,h*mul,d*mul,col,{sides:7}));
    const branch=(a,b,r0,r1,col)=>p.push(taper(a.map(n=>n*mul),b.map(n=>n*mul),r0*mul,r1*mul,col));
    const crownCone=(x,y,z,w,h,d,col)=>p.push(cone(x*mul,y*mul,z*mul,w*mul,h*mul,d*mul,col,{sides:7+v%4,...body}));
    if(code==="canopy" || code==="deciduous"){
      const dec=code==="deciduous",h=(dec?6.4:6.0)+v*.27;
      const broad=(dec?2.7:2.85)+Math.sin(v*1.8)*.36;
      branch([0,0,0],[skew,h*.67,0],.19+.018*v,.085,"#857364");
      const n=4+v%3;
      for(let j=0;j<n;j++){const a=j*2*Math.PI/n+v*.48;const rr=broad*(.38+.13*Math.sin(j*2+v));
        const x=Math.cos(a)*rr,z=Math.sin(a)*rr,cy=h*(.66+.075*Math.cos(j*2));
        branch([skew*.5,h*.39,0],[x,cy,z],.115,.037,"#8b7966");
        crown(x,cy,z,broad*(1.02+.09*(j%3)),h*(dec?.38:.46),broad*1.08,offsetColor(color,(j%3-1)*6));}
      crown(skew,h*.82,0,broad*1.07,h*.39,broad*1.07,offsetColor(color,8));
    }else if(code==="hedge" || code==="shrubs"){
      const flowering=code==="shrubs",h=1.02+.15*v,n=5+v%3;
      for(let j=0;j<n;j++){const a=j*2*Math.PI/n+skew, r=.4+.07*(j%2)+.03*v;
        const x=Math.cos(a)*r,z=Math.sin(a)*r, ht=h*(.74+.1*Math.cos(j*1.4));
        branch([x*.13,.05,z*.13],[x,ht*.72,z],.045,.02,"#88765e");
        crown(x,ht*.68,z,.82+v*.08,ht,.82+v*.04,offsetColor(flowering?"#809475":color,(j%3-1)*7));
        if(flowering){for(let k=0;k<2;k++)crown(x+.18*Math.cos(a+k),ht*(1.01+.07*k),z+.13*Math.sin(a+k),.23,.18,.23,offsetColor(color,8*k));}
      }crown(0,h*.88,0,.93,h*.83,.96,flowering?"#88a07d":offsetColor(color,8));
    }else if(code==="palm"){
      const h=4.1+v*.5;
      branch([0,0,0],[skew*1.35,h,skew],.22,.15,"#9f8e70");
      for(let j=1;j<6;j++)trunk(skew*j*.21,h*j/6,skew*j/6,.36,.065,.36,"#b9a57f");
      const n=8+v;
      for(let j=0;j<n;j++){const a=2*Math.PI*j/n+skew;const len=(1.38+.17*(j%3)+.09*v)*mul;
        p.push(leaves(skew*1.35*mul,h*mul,skew*mul,a,len,.22*mul,(.46+.11*(j%2))*mul,(.24+.11*(j%3))*mul,offsetColor(color,(j%3-1)*12)));}
      crown(0,h-.22,0,.53,.58,.56,"#8d9162");
    }else if(code==="bamboo"){
      const n=4+v,h=3.1+v*.35;
      for(let j=0;j<n;j++){const a=j*2.4+.2*v,r=(.18+.09*(j%3)),x=r*Math.cos(a),z=r*Math.sin(a),t=h*(.69+.12*(j%4));
        branch([x,0,z],[x*1.7,t,z*1.7],.064,.041,v===1?"#635e5c":"#8c996e");
        for(let k=1;k<=3;k++){const u=k*.21+.13;
          p.push(leaves(x*(1+u)*mul,t*u*mul,z*(1+u)*mul,a+k, (.57+.11*k)*mul,.115*mul,.13*mul,.11*mul,offsetColor(color,(k-2)*5)));}}
    }else if(code==="flowers"){
      const h=.55+.07*v, n=7+v;
      for(let j=0;j<n;j++){const a=j*2.39996+v*.41, r=.15+.42*((j*7)%11)/11,x=r*Math.cos(a),z=r*Math.sin(a),ht=h*(.65+.09*(j%5));
        branch([x*.7,0,z*.7],[x,ht,z],.022,.014,"#85976b");
        p.push(leaves(x*mul,ht*.30*mul,z*mul,a,.28*mul,.07*mul,.11*mul,-.025*mul,"#8fa27a"));
        if(v===1)crown(x,ht+.04,z,.135,.38,.12,offsetColor(color,5*(j%3)));else crown(x,ht,z,.20+.035*v,.16+.034*v,.21+.035*v,offsetColor(color,(j%3-1)*6));}
    }else{
      const h=5.0+.45*v,w=2.6+.12*(v%3);
      trunk(0,h*.36,0,.28,h*.72,.28);
      for(let j=0;j<3+v%2;j++){const t=j/(3+v%2);
        crownCone(skew*t,h*(.40+.56*t),0,w*(1-.73*t),h*(.56-.20*t),w*(1-.73*t),offsetColor(color,j*5-6));}
    }
    return p;
  }
  for(const [code,family,species,colors] of plantFamilies){
    for(let j=0;j<5;j++)for(let k=0;k<3;k++){
      const color=offsetColor(colors[j],k===0?7:k===2?-5:0);
      byName("plant",code,j*3+k,family,species[j]+" · "+["幼株","成株","盛龄"][k],color,plantParts(code,j,k,color));
    }
  }
  // Build both sides of each wheel with a mesh axle so tyres actually roll perpendicular to +Z.
  function wheel(parts,x,y,z,diameter,thickness) {
    parts.push(taper([x-thickness*.5,y,z],[x+thickness*.5,y,z],diameter*.5,diameter*.5,"#424c4e",10));
    const side=x<0?-1:1, out=x+side*(thickness*.5+.012);
    parts.push(taper([out,y,z],[out+side*.025,y,z],diameter*.25,diameter*.25,"#a6b1ad",8));
  }
  function cabin(w,low,high,z0,z1,inset,color,extra={}){
    return face([[-w/2,low,z0],[w/2,low,z0],[w/2,low,z1],[-w/2,low,z1],
      [-w*.43,high,z0+inset],[w*.43,high,z0+inset],[w*.43,high,z1-inset],[-w*.43,high,z1-inset]],
      [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]],color,extra);
  }
  const vehicleFamilies=[
    ["bus","公交车",["城市巴士","园区接驳","低地板巴士","快速公交"],["青白","暖灰"],["#68a99d","#a9a495"]],
    ["car","私家车",["四门轿车","紧凑掀背","旅行轿车","城市越野"],["海蓝","珠白"],["#7399a9","#d0d0c4"]],
    ["taxi","出租车",["巡游出租","新能源出租","商务出租"],["顶灯黄","蓝白"],["#d5b363","#76a5b5"]],
    ["truck","工程车",["翻斗运输车","市政平板车","抢修厢车"],["工程橙","沙黄"],["#d39465","#bea76c"]],
    ["delivery","物流车辆",["末端配送车","保温厢货","园区货运"],["浅银","青绿"],["#a8b6b2","#77a093"]]
  ];
  function vehicleParts(code,design,col){
    const p=[], b=(...args)=>p.push(box(...args)),k=design;
    let w,l,wh,ax=[];
    if(code==="bus"){
      w=2.45;l=[9.2,7.15,10.45,11.7][k];wh=.91;ax=[-l*.31,l*.31];
      b(0,.88,0,w,1.02,l,col,body);b(0,1.79,0,w*.985,1.40,l*.98,glass);
      b(0,2.57,0,w*1.01,.25,l,"#c7cbc1");b(0,2.77,-l*.13,w*.63,.19,l*.29,grey);
      const windows=Math.ceil(l/1.45);
      for(const s of [-1,1]){for(let j=0;j<windows+1;j++)b(s*w*.496,1.81,-l*.472+j*l*.944/windows,.05,1.31,.10,col,body);
        b(s*w*.494,1.29,0,.047,.16,l*.98,col,body);}
      b(0,1.79,l*.496,.085,1.41,.04,charcoal);
      b(0,2.25,l*.497,.99,.20,.055,charcoal);
      b(0,2.25,l*.502,.61,.06,.015,lamp);
    }else if(code==="car"||code==="taxi"){
      w=k===3?1.94:1.78;l=[4.5,3.8,4.9,4.6][k];wh=k===3?.78:.64;ax=[-l*.31,l*.30];
      b(0,.58,0,w,.54,l*.97,col,body);b(0,.86,0,w*.99,.19,l,col,body);
      const high=k===3?1.65:1.47,z0=k===2?-l*.40:-l*.32,z1=l*.25;
      p.push(cabin(w*.93,.94,high,z0,z1,k===1?.29:.42,glass));
      b(0,high+.045,(z0+z1)*.5,w*.80,.09,Math.max(.40,z1-z0-.77),col,body);
      for(const s of [-1,1]){b(s*w*.45,(high+.94)/2,-.29,.07,high-.94,.09,charcoal);}
      if(code==="taxi")b(0,high+.19,-.1,.53,.24,.35,"#f2d984");
      if(k===3)for (const x of [-.61,.61])b(x,high+.12,-.1,.065,.07,l*.35,charcoal);
    }else{
      w=code==="truck"?2.22:2.05;l=[5.9,6.7,6.25][k];wh=.82;ax=[-l*.30,l*.30];
      b(0,.63,0,w*.84,.44,l,charcoal);b(0,.99,l*.305,w,.72,l*.31,col,body);
      p.push(cabin(w*.975,1.32,2.16,l*.13,l*.48,.12,glass));b(0,2.22,l*.304,w*.98,.14,l*.315,col,body);
      if(code==="delivery" || k===2) {b(0,1.59,-l*.165,w+.10,1.80,l*.62,col,body);
        for(const s of [-1,1])for(let j=0;j<5;j++)b(s*(w*.5+.053),1.63,-l*.42+j*l*.126,.035,1.6,.045,offsetColor(col,-12));
        b(0,2.52,-l*.165,w+.15,.10,l*.63,grey);}
      else{b(0,.99,-l*.16,w+.1,.20,l*.64,col,body);
        if(k===0) {for(const s of [-1,1])b(s*w*.48,1.42,-l*.16,.13,.87,l*.64,col,body);b(0,1.42,-l*.47,w,.86,.12,col,body);b(0,1.58,l*.15,w,1.18,.14,col,body);}}
    }
    for(const z of ax)for(const s of [-1,1])wheel(p,s*w*.49,wh*.5,z,wh,wh*.30);
    for(const s of [-1,1]) {b(s*w*.36,.78,l*.498,.27,.16,.07,"#ecd399");b(s*w*.36,.83,-l*.499,.23,.18,.065,"#b66a5e");}
    return p;
  }
  for(const [code,family,types,paints,colors] of vehicleFamilies)for(let i=0;i<types.length;i++)for(let j=0;j<2;j++){
    byName("vehicle",code,i*2+j,family,types[i]+" · "+paints[j],colors[j],vehicleParts(code,i,colors[j]));
  }
  function person(style,pose,c){
    const p=[], skin=["#c59d7b","#cda886","#bd977c"][pose], trousers=style==="visitor"?"#697d7d":"#5b6e78";
    const hip=.95,step=[.02,.22,-.18][pose],swing=[0,-.13,.16][pose];
    for(const dir of [-1,1]){
      const x=dir*.13,z=dir*step, handZ=dir*swing+.035;
      p.push(taper([x,.17,z],[x,hip,0],.083,.098,trousers));
      p.push(box(x,.115,z+.04,.19,.19,.31,"#526263"));
      p.push(taper([dir*.245,1.43,0],[dir*.31,1.11,handZ],.092,.069,c,6,body));
      p.push(taper([dir*.31,1.11,handZ],[dir*.28,.94,handZ+.05],.064,.052,c,6,body));
      p.push(bulb(dir*.28,.92,handZ+.05,.11,.14,.12,skin));
    }
    p.push(taper([0,hip,0],[0,1.44,0],.195,.245,c,8,body));
    p.push(bulb(0,1.61,0,.30,.36,.30,skin));
    if(style==="worker"||style==="surveyor"){
      p.push(bulb(0,1.76,0,.35,.22,.34,style==="worker"?"#e2bf77":"#d0b69b"));
      p.push(cyl(0,1.705,.015,.39,.045,.38,style==="worker"?"#e2bf77":"#d0b69b",{sides:10}));
      p.push(cyl(0,1.16,0,.437,.06,.437,"#d3ca8a",{sides:8}));
      if(style==="surveyor"){
        p.push(box(.31,1.14,.17,.20,.07,.32,"#829598"));
        p.push(box(.31,1.18,.17,.15,.025,.22,"#aec5bd"));
      }
    }else if(style==="guard"){
      p.push(cyl(0,1.76,0,.35,.135,.34,"#526772",{sides:8}));
      p.push(box(0,1.706,.13,.26,.038,.22,"#526772"));
      p.push(box(.13,1.37,.18,.056,.078,.022,lamp));
    }else{p.push(bulb(0,1.738,-.025,.314,.15,.30,"#776b60"));p.push(box(-.23,1.15,-.1,.15,.34,.18,"#aa947b"));}
    return p;
  }
  function dog(st,cat,c){
    const p=[], sz=cat?.76:1, mult=(v)=>v*sz;
    const add=(type,x,y,z,w,h,d,col)=>p.push(part(type,mult(x),mult(y),mult(z),mult(w),mult(h),mult(d),col,{sides:8,...body}));
    const off=[.03,.12,-.10][st];
    add("sphere",0,.47,0,.35,.39,.75,c);
    add("sphere",0,.70,.39,.29,.31,.31,c);
    add("box",0,.64,.59,.19,.13,.19,offsetColor(c,12));
    for(const x of [-.1,.1]){add("cone",x,.86,.36,.13,.19,.13,c);}
    for(const s of [-1,1])for(const j of [-1,1])p.push(taper([mult(s*.10),mult(.43),mult(j*.23)],[mult(s*.115),mult(.055),mult(j*.23+s*j*off)],mult(.057),mult(.043),offsetColor(c,-10)));
    p.push(taper([0,mult(.47),mult(-.30)],[mult(.1),mult(cat?.84:.67),mult(-.53)],mult(.055),mult(.032),c));
    return p;
  }
  function gull(pose,c){
    const p=[bulb(0,.31,0,.25,.30,.55,c),bulb(0,.51,.20,.18,.19,.20,c),
      taper([0,.51,.25],[0,.48,.41],.05,.012,"#be9f68")];
    for(const s of [-1,1]){
      if(pose===1){
        p.push(face([[s*.08,.34,.09],[s*.45,.63,-.06],[s*.88,.47,-.21],[s*.42,.52,-.18],[s*.09,.34,-.20]],[[0,1,3,4],[1,2,3]],"#8e9da0",body));
      }else{
        p.push(bulb(s*.104,.34,-.04,.10,.19,.36,offsetColor(c,-19)));
        p.push(taper([s*.051,.22,0],[s*.06,.035,.025],.018,.014,"#b09a70"));
      }
    }return p;
  }
  const characterTypes=[
    ["worker","作业人员","园区检修员","#b9976a"],["surveyor","作业人员","测绘技术员","#99aa81"],
    ["guard","安保人员","巡逻人员","#708999"],["visitor","园区行人","参观访客","#bd8a77"],
    ["dog","园区动物","牧羊犬","#ab9373"],["cat","园区动物","短毛猫","#a89f8e"],["gull","滨水鸟类","银鸥","#c0c7bf"]
  ];
  for(const [code,family,title,c] of characterTypes)for(let k=0;k<3;k++){
    const animal=["dog","cat","gull"].includes(code), tint=offsetColor(c,k===1?6:k===2?-8:0);
    const parts=code==="gull"?gull(k,tint):animal?dog(k,code==="cat",tint):person(code,k,tint);
    const pose=code==="gull"?["驻足","展翅","栖息"][k]:["驻足","迈步","缓行"][k];
    byName("character",code,k,family,title+" · "+pose,tint,parts);
  }
  const markerTints=[["湖蓝","#79c8db"],["琥珀","#eba964"],["薄荷","#8ad3ab"],["珊瑚","#e68f82"]];
  for(const [code,family] of [["pin","定位图钉"],["ring","地面光环"],["beacon","信标光柱"]]){
    for(let i=0;i<4;i++){
      const [tone,c]=markerTints[i],p=[];
      if(code==="pin"){
        p.push(ring(0,.045,0,.71,.10,c),taper([0,.1,0],[0,1.12,0],.07,.20,c,7,body),
          bulb(0,1.46,0,.74,.74,.74,c,body),bulb(0,1.46,.35,.33,.33,.09,"#e7e8d6"));
      }else if(code==="ring"){
        p.push(ring(0,.065,0,1.36,.13,c),ring(0,.085,0,.82,.07,c),cyl(0,.09,0,.28,.17,.28,c,{sides:8,...body}));
        for(let j=0;j<4;j++){const a=j*Math.PI/2;p.push(box(Math.cos(a)*1.45,.10,Math.sin(a)*1.45,.27,.10,.15,c,{ry:-j*90,...body}));}
      }else{
        p.push(cyl(0,.085,0,1.46,.17,1.46,"#647b80",{sides:8}),cyl(0,.21,0,1.06,.11,1.06,c,{sides:8,...body}),
          taper([0,.26,0],[0,2.9,0],.16,.07,c,7,body),bulb(0,3.03,0,.40,.43,.40,c,body));
      }
      byName("marker",code,i,family,tone+family,c,p,{kind:code});
    }
  }
  const effects=[
    ["fire","火焰",["火盆","地面火焰","篝火"],["#e49e59","#d99062","#e0aa61"]],
    ["smoke","烟柱",["烟囱白烟","设备灰烟","上升烟柱"],["#c4cac4","#9aa5a5","#b4bdb8"]],
    ["fountain","喷泉",["涌泉","直射喷泉","环形水花"],["#87c9ce","#96d2db","#82bcc9"]],
    ["mist","低空薄雾",["岸线薄雾","草坪水雾","池边蒸汽"],["#aacccc","#a8c4bd","#c2cfca"]],
    ["sparks","光点",["萤光","焊花","漫游光尘"],["#c2ca83","#e9b779","#9ad8c3"]]
  ];
  for(const [kind,family,names,colors] of effects) for(let i=0;i<names.length;i++){
    const c=colors[i],p=[];
    if(kind==="fire"){
      p.push(cyl(0,.12,0,1.15,.24,1.15,"#796e61",{sides:10}));
      for(let j=0;j<6;j++){
        const a=2*Math.PI*j/5, q=j===5?0:.27, h=j===5?1.7:.85+.28*(j%3);
        p.push(taper([Math.cos(a)*q,.19,Math.sin(a)*q],[Math.cos(a+.4)*q,h*(1+.2*i),Math.sin(a+.4)*q],.23,.025,j%2?c:"#e6bb73",7,body));}
    }else if(kind==="smoke"||kind==="mist"){
      for(let j=0;j<6;j++){const high=kind==="smoke", r=.5+j*.10;
        const x=high?.15*Math.sin(j):Math.cos(j*2.41)*j*.31;
        const z=high?j*.083:Math.sin(j*2.41)*j*.31;
        p.push(bulb(x,(high?.42+j*.48:.24+.12*(j%3))*(1+.12*i),z,r*1.6,r*(high?1.50:.60),r*1.45,offsetColor(c,(j%3-1)*4),body));}
    }else if(kind==="fountain"){
      p.push(cyl(0,.09,0,2.48,.18,2.48,"#8ca5a4",{sides:14}),cyl(0,.19,0,2.26,.04,2.26,"#75adb4",{sides:14}));
      for(let j=0;j<6;j++){const a=j*Math.PI/3,x=Math.cos(a),z=Math.sin(a), h=1+.31*i;
        p.push(taper([x*.2,.20,z*.2],[x*.53,h,z*.53],.061,.042,c),taper([x*.53,h,z*.53],[x*.88,.39,z*.88],.042,.025,c));}
      p.push(taper([0,.20,0],[0,1.52+.45*i,0],.09,.028,c));
    }else{
      for(let j=0;j<12;j++){const a=j*2.399, r=.30+.17*(j%4),q=.07+.035*(j%3);p.push(bulb(Math.cos(a)*r,.23+(j%7)*.29,Math.sin(a)*r,q,q*1.6,q,c,body));}
    }
    byName("effect",kind,i,family,names[i],c,p,{kind});
  }
  const waterTypes=[
    ["reflect","镜面水池",["方形浅池","线性浅池","庭院静水"],[4,8,5],[4,2.5,3.4],"#83b2b6"],
    ["shore","滨水水域",["滨岸水面","景观河段","码头水面"],[8,7,10],[5,12,8],"#729fae"],
    ["basin","圆形水池",["圆形景池","中心水池","广场水盘"],[3.5,5,6.5],[3.5,5,6.5],"#85b6b5"]
  ];
  for(const [code,family,names,widths,depths,c] of waterTypes)for(let i=0;i<3;i++){
    const w=widths[i],d=depths[i],p=[],color=offsetColor(c,i*3);
    if(code==="basin"){
      p.push(cyl(0,.10,0,w+.28,.20,d+.28,"#a7b3aa",{sides:24}),
        cyl(0,.22,0,w,.055,d,color,{sides:24,...body}));
      p.push(ring(-w*.09,.257,d*.05,w*.23,.035,offsetColor(c,15)),ring(-w*.09,.258,d*.05,w*.13,.026,offsetColor(c,14)));
    }else{
      p.push(box(0,.065,0,w,.13,d,color,body));
      if(code==="reflect"){
        for(const s of [-1,1]){p.push(box(s*(w/2+.07),.11,0,.14,.22,d+.28,"#adbaaf"),box(0,.11,s*(d/2+.07),w,.22,.14,"#adbaaf"));}
      }
      for(let j=0;j<4;j++){let xx=(j%2?.21:-.19)*w,zz=(j/4-.36)*d; p.push(box(xx,.14,zz,w*(.11+.03*(j%3)),.022,.032+d*.003,offsetColor(color,13),{ry:-8+3*j}));}
    }
    byName("water",code,i,family,names[i],color,p,{kind:"water"});
  }
  window.RESOURCES=assets;
})();
