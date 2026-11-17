import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export type Model = {root:T.Group; parts:Map<string,T.Group[]>; meshes:T.Mesh[]};
type V=[number,number,number];
const C={white:0xe4e9ed, light:0xf6f8fa, dark:0x27333d, black:0x141d26, steel:0x9dadb8, silver:0xd4dfe5, blue:0x22699a, glass:0x7ea8ba, orange:0xe77425, yellow:0xe5b82b, green:0x46b582, red:0xd9534f, rubber:0x17212a};
type Color=keyof typeof C;
class Builder {
 root=new T.Group(); parts=new Map<string,T.Group[]>(); meshes:T.Mesh[]=[];
 materials=new Map<string,T.MeshStandardMaterial>();
 mat(c:Color,opacity=1){const key=c+opacity;if(!this.materials.has(key))this.materials.set(key,new T.MeshStandardMaterial({color:C[c],metalness:c==='steel'||c==='silver'?0.72:0.18,roughness:c==='steel'?0.3:0.4,transparent:opacity<1,opacity,depthWrite:opacity===1,side:opacity<1?T.DoubleSide:T.FrontSide}));return this.materials.get(key)!;}
 part(id:string,pos:V=[0,0,0],parent:T.Group=this.root){const g=new T.Group();g.position.set(...pos);g.userData.partId=id;parent.add(g);this.parts.set(id,[...(this.parts.get(id)||[]),g]);return g;}
 group(parent:T.Group,pos:V=[0,0,0],yaw=0){const g=new T.Group();g.position.set(...pos);g.rotation.y=yaw;parent.add(g);return g;}
 mesh(g:T.Group,geo:T.BufferGeometry,pos:V,c:Color,opacity=1){const m=new T.Mesh(geo,this.mat(c,opacity));m.position.set(...pos);m.castShadow=opacity===1;m.receiveShadow=true;g.add(m);this.meshes.push(m);return m;}
 box(g:T.Group,pos:V,size:V,c:Color='white',round=0.025,opacity=1){return this.mesh(g,round?new RoundedBoxGeometry(...size,2,Math.min(round,...size.map(s=>s/4))):new T.BoxGeometry(...size),pos,c,opacity);}
 cyl(g:T.Group,pos:V,r:number,h:number,c:Color='steel',axis='y',r2=r,segments=24){const m=this.mesh(g,new T.CylinderGeometry(r2,r,h,segments),pos,c);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 ball(g:T.Group,pos:V,r:number,c:Color='steel'){return this.mesh(g,new T.SphereGeometry(r,20,12),pos,c);}
 rod(g:T.Group,a:V,b:V,r:number,c:Color='steel'){const va=new T.Vector3(...a),vb=new T.Vector3(...b);const m=this.cyl(g,va.clone().add(vb).multiplyScalar(.5).toArray() as V,r,va.distanceTo(vb),c);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return m;}
 beam(g:T.Group,a:V,b:V,width:number,depth:number,c:Color='white'){const va=new T.Vector3(...a),vb=new T.Vector3(...b);const m=this.box(g,va.clone().add(vb).multiplyScalar(.5).toArray() as V,[width,va.distanceTo(vb),depth],c,.04);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return m;}
 pipe(g:T.Group,points:V[],r=.022,c:Color='dark'){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return this.mesh(g,new T.TubeGeometry(curve,30,r,8,false),[0,0,0],c);}
 bolts(g:T.Group,x:number,y:number,z:number,n=4,r=.18,axis='y'){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;if(axis==='y')this.cyl(g,[x+Math.cos(a)*r,y,z+Math.sin(a)*r],.026,.024,'dark');else this.cyl(g,[x+Math.cos(a)*r,y+Math.sin(a)*r,z],.024,.025,'dark','z');}}
 feet(g:T.Group,w:number,d:number){for(const x of[-w/2+.17,w/2-.17])for(const z of[-d/2+.17,d/2-.17]){this.cyl(g,[x,.08,z],.13,.09,'rubber');this.cyl(g,[x,.15,z],.06,.14,'steel');}}
 screen(g:T.Group,x=0,y=1.5,z=0,w=.75,h=.5){this.box(g,[x,y,z],[w,h,.09],'dark');this.box(g,[x,y,z+.049],[w-.07,h-.065,.008],'blue',0);for(let i=0;i<4;i++)this.box(g,[x-w*.25,y+h*.28-i*.065,z+.055],[w*(.23+i*.04),.018,.009],'silver',0);this.box(g,[x+w*.21,y,z+.058],[w*.26,h*.65,.01],'black',0);for(let i=0;i<3;i++)this.box(g,[x+w*.21,y-h*.14+i*h*.17,z+.066],[w*.17,.016,.01],'green',0);}
 cabinet(g:T.Group,w=.64,h=1.85){this.box(g,[0,h/2,0],[w,h,.55],'white',.04);this.box(g,[0,.28,.282],[w-.1,.32,.012],'steel');for(let i=0;i<6;i++)this.box(g,[-w*.3+i*w*.12,.29,.294],[.018,.22,.01],'dark',0);this.screen(g,0,h*.76,.3,w*.83,.41);for(let i=0;i<5;i++)this.cyl(g,[-w*.3+i*w*.145,h*.56,.34],.026,.04,i===4?'red':'dark','z');this.box(g,[w*.31,h*.36,.31],[.025,.2,.04],'dark');this.cyl(g,[w*.28,h+.22,0],.025,.45,'steel');['green','yellow','red'].forEach((c,i)=>this.cyl(g,[w*.28,h+.29+i*.095,0],.043,.083,c as Color));}
 monitor(g:T.Group){this.box(g,[0,.07,0],[.85,.13,.6],'dark');this.box(g,[0,.8,-.05],[.11,1.5,.12],'steel');this.screen(g,0,1.68,0,1.22,.73);this.box(g,[0,1.11,.18],[.75,.055,.38],'dark');}
 robot(g:T.Group,scale=1,yaw=0,color:Color='orange'){const a=this.group(g,[0,0,0],yaw);a.scale.setScalar(scale);this.cyl(a,[0,.14,0],.31,.28,'dark');this.cyl(a,[0,.32,0],.25,.15,color);this.bolts(a,0,.23,0,6,.26);
  const pts:V[]=[[0,.38,0],[0,.65,0],[-.16,1.44,0],[.62,1.25,0],[.91,1.1,0],[1.01,.88,0]];
  this.beam(a,pts[0],pts[1],.32,.31,color);this.beam(a,pts[1],pts[2],.29,.22,color);this.beam(a,[-.1,.73,.126],[-.24,1.33,.126],.1,.022,'dark');this.beam(a,pts[2],pts[3],.23,.21,color);this.beam(a,pts[3],pts[4],.2,.19,color);this.beam(a,pts[4],pts[5],.13,.16,color);
  pts.slice(1,5).forEach((p,i)=>{this.cyl(a,p,.15-i*.017,.31-i*.03,'dark','z');this.cyl(a,[p[0],p[1],p[2]+.17-i*.012],.095-i*.008,.032,color,'z');this.bolts(a,p[0],p[1],p[2]+.192-i*.012,5,.067,'z');});
  this.cyl(a,[1.01,.83,0],.096,.09,'steel');this.box(a,[1.01,.755,0],[.17,.065,.14],'dark');for(const z of[-.07,.07])this.box(a,[1.01,.675,z],[.032,.16,.033],'silver');
  this.pipe(a,[[0,.48,-.19],[-.33,.9,-.18],[-.25,1.62,-.17],[.43,1.47,-.16],[.83,1.23,-.12]],.032,'dark');return a;
 }
 agv(g:T.Group,rollers=false){this.box(g,[0,.22,0],[1.05,.32,.77],'white',.09);this.box(g,[0,.1,0],[1.02,.15,.73],'dark',.06);this.box(g,[0,.35,0],[.88,.04,.64],'steel');for(const x of[-.36,.36])for(const z of[-.38,.38])this.cyl(g,[x,.14,z],.125,.08,'rubber','z');this.box(g,[0,.24,.4],[.64,.035,.015],'blue',0);this.cyl(g,[.37,.42,.25],.053,.07,'dark');for(const x of[-.49,.49])this.box(g,[x,.29,.38],[.09,.09,.025],'yellow');if(rollers){for(const x of[-.42,.42])this.box(g,[x,.64,0],[.06,.52,.63],'steel');for(let i=0;i<9;i++)this.cyl(g,[0,.9,-.28+i*.07],.028,.8,'silver','x');}}
 worktable(g:T.Group,w=1.35,d=.8,h=.9){for(const x of[-w/2+.055,w/2-.055])for(const z of[-d/2+.055,d/2-.055])this.box(g,[x,h/2,z],[.075,h,.075],'steel');this.box(g,[0,.22,0],[w-.08,.05,d-.08],'white');this.box(g,[0,h,0],[w,.09,d],'silver');for(let i=0;i<8;i++)for(let j=0;j<4;j++)this.cyl(g,[-w*.4+i*w*.115,h+.052,-d*.32+j*d*.22],.012,.008,'dark', 'y',.012,8);}
 rotary(g:T.Group,x=0,y=.8,z=0,r=.44){this.cyl(g,[x,y-.07,z],r*1.13,.19,'dark');this.cyl(g,[x,y+.06,z],r,.1,'silver');this.cyl(g,[x,y+.119,z],r*.8,.018,'steel');this.bolts(g,x,y+.132,z,8,r*.72);for(let i=-2;i<=2;i++)this.box(g,[x+i*r*.25,y+.135,z],[.019,.012,r*1.5],'dark',0);}
 spindle(g:T.Group,x=0,y=1.75,z=0){this.box(g,[x,y+.25,z-.1],[.48,.7,.44],'white');this.cyl(g,[x,y,z+.04],.155,.45,'steel');this.cyl(g,[x,y-.25,z+.04],.11,.12,'dark');this.cyl(g,[x,y-.37,z+.04],.045,.18,'silver');this.cyl(g,[x,y-.51,z+.04],.012,.15,'steel');this.pipe(g,[[x+.23,y+.2,z],[x+.24,y-.18,z],[x+.1,y-.39,z+.04]],.016,'blue');}
 rails(g:T.Group,w=2,d=1.2,y=.62){this.box(g,[0,y-.14,0],[w+.2,.25,d+.2],'dark');for(const z of[-d*.32,d*.32]){this.box(g,[0,y,z],[w,.08,.08],'steel');for(let i=0;i<10;i++)this.box(g,[-w*.45+i*w*.1,y-.1,z],[.06,.18,.17],'black',0);}this.cyl(g,[0,y,-.05],.035,w,'steel','x');this.box(g,[0,y+.09,0],[w*.63,.12,d],'steel');}
 housing(g:T.Group,w=2.6,h=2.4,d=1.65,open=true){const start=this.meshes.length;this.feet(g,w,d);this.box(g,[0,.32,0],[w,.3,d],'dark',.045);this.box(g,[0,.51,0],[w-.04,.13,d-.03],'white');this.box(g,[0,1.48,-d/2+.07],[w,1.82,.14],'white');for(const x of[-w/2+.08,w/2-.08])this.box(g,[x,1.49,0],[.16,1.87,d],'white');this.box(g,[0,h-.06,0],[w,.14,d],'white');this.box(g,[0,h-.19,-.08],[w-.3,.025,d-.33],'light');if(open){for(const x of[-w/2+.11,w/2-.11])this.box(g,[x,1.54,d/2],[.21,1.55,.08],'dark');this.box(g,[-w*.41,1.49,d/2+.03],[.24,1.35,.025],'glass',.01,.38);this.box(g,[w*.41,1.49,d/2+.03],[.24,1.35,.025],'glass',.01,.38);}this.box(g,[0,.37,d/2+.015],[w*.5,.016,.012],'steel');this.meshes.slice(start).forEach(m=>{m.userData.enclosure=true;});}
 magazine(g:T.Group,x:number,y:number,z:number,n=16,r=.42,vertical=false){const a=this.group(g,[x,y,z]);if(vertical)a.rotation.x=Math.PI/2;this.cyl(a,[0,0,0],r,.07,'dark');this.cyl(a,[0,.05,0],r*.82,.045,'silver');for(let i=0;i<n;i++){const t=i/n*Math.PI*2;this.cyl(a,[Math.cos(t)*r*.82,.14,Math.sin(t)*r*.82],.027,.2,'steel', 'y',.035,10);}this.cyl(a,[0,.08,0],r*.16,.05,'dark');}
 fence(g:T.Group,w=5.2,d=3.5){const y=1.15,h=1.55;for(const x of[-w/2,w/2])for(const z of[-d/2,0,d/2]){this.box(g,[x,y-.3,z],[.055,h,.055],'yellow');this.box(g,[x,.12,z],[.14,.035,.14],'dark');}for(const z of[-d/2,d/2])for(const yy of[.25,1.62])this.box(g,[0,yy,z],[w,.035,.035],'dark');for(const x of[-w/2,w/2])for(const yy of[.25,1.62])this.box(g,[x,yy,0],[.035,.035,d],'dark');
  for(const x of[-w/2,w/2]){this.box(g,[x,.92,0],[.009,1.32,d],'glass',0,.12);for(let z=-d/2;z<=d/2;z+=.18)this.rod(g,[x,.25,z],[x,1.62,z],.004,'dark');for(let yy=.25;yy<1.62;yy+=.18)this.rod(g,[x,yy,-d/2],[x,yy,d/2],.004,'dark');}
  this.box(g,[0,.92,-d/2],[w,1.32,.009],'glass',0,.1);for(let x=-w/2;x<=w/2;x+=.2)this.rod(g,[x,.25,-d/2],[x,1.62,-d/2],.004,'dark');
 }
 dock(g:T.Group){this.box(g,[0,.23,0],[1.3,.4,.86],'white');for(let i=0;i<10;i++)this.cyl(g,[-.56+i*.124,.48,0],.035,.7,'silver','z');this.box(g,[0,.55,0],[1.08,.08,.69],'dark');for(const x of[-.43,.43])for(const z of[-.26,.26]){this.cyl(g,[x,.63,z],.025,.12,'silver');this.box(g,[x,.22,z*1.75],[.12,.33,.04],'yellow');}for(let i=0;i<4;i++)this.cyl(g,[-.35+i*.23,.7,0],.072,.18,'steel');this.box(g,[.58,.44,.34],[.12,.12,.07],'blue');}
 cleaner(g:T.Group){this.box(g,[0,.48,0],[.85,.93,.66],'silver');this.box(g,[0,.96,0],[.7,.06,.51],'dark');this.box(g,[0,1.02,-.28],[.85,.08,.55],'steel').rotation.x=-.55;this.screen(g,0,.7,.343,.35,.16);this.cyl(g,[.27,.69,.35],.028,.03,'dark','z');for(const x of[-.32,.32])for(const z of[-.24,.24])this.cyl(g,[x,.035,z],.045,.05,'rubber');}
 toolRack(g:T.Group){this.worktable(g,.8,.55,.65);for(const x of[-.22,.22]){this.cyl(g,[x,.75,0],.1,.15,'dark');this.box(g,[x,.86,0],[.21,.06,.19],'silver');for(const z of[-.06,.06])this.box(g,[x,.94,z],[.035,.12,.034],'steel');this.box(g,[x,.72,.2],[.05,.04,.06],'green');}}
 dog(g:T.Group,s=1){const a=this.group(g);a.scale.setScalar(s);this.box(a,[0,.53,0],[.58,.2,.3],'white',.07);this.box(a,[.32,.54,0],[.12,.15,.26],'dark');for(const z of[-.09,.09])this.ball(a,[.387,.57,z],.023,'blue');for(const x of[-.23,.23])for(const z of[-.17,.17]){const knee:V=[x+.09,.3,z*1.4],foot:V=[x-.02,.07,z*1.5];this.cyl(a,[x,.49,z],.06,.06,'dark','z');this.beam(a,[x,.47,z],knee,.065,.065,'steel');this.ball(a,knee,.05,'dark');this.beam(a,knee,foot,.045,.045,'dark');this.ball(a,foot,.043,'rubber');}this.cyl(a,[0,.69,0],.06,.1,'dark');}
 finish(){this.root.updateMatrixWorld(true);this.meshes.forEach(m=>{let p:T.Object3D|null=m;while(p&&!p.userData.partId)p=p.parent;m.userData.partId=p?.userData.partId;});return {root:this.root,parts:this.parts,meshes:this.meshes};}
}

function standardMachine(b:Builder,id:number){
 const shell=b.part('shell');b.housing(shell,2.8,2.4,1.65);
 const controller=b.part('control',[1.83,0,.46]);b.cabinet(controller,.64,1.9);
 const motion=b.part(id===4?'table':'motion');b.rails(motion,2.15,1.16,.65);
 if(id===3){
  const table=b.part('table');b.rotary(table,-.15,.98,.15,.49);b.cyl(table,[-.15,1.15,.15],.3,.08,'silver');
  const sp=b.part('spindle');b.box(sp,[-.2,1.85,-.4],[1.3,.36,.42],'steel');b.spindle(sp,-.1,1.84,.12);b.cyl(sp,[-.1,1.47,.16],.36,.08,'steel');b.cyl(sp,[.14,1.4,.16],.024,.1,'dark');
  const sen=b.part('sensor');b.box(sen,[-1,1.17,.2],[.16,.19,.13],'blue');b.rod(sen,[-1,.85,.2],[-1,1.1,.2],.034);b.box(sen,[.92,1.2,-.36],[.12,.16,.12],'dark');
 } else if(id===4){
  const table=b.part('table');b.box(table,[0,.87,.18],[1.8,.22,.84],'steel');b.box(table,[0,1.01,.18],[1.45,.075,.61],'silver');
  [['plasma',-.75],['laser',0],['electro',.75]].forEach(([key,x])=>{const g=b.part(key as string);const xx=x as number;b.box(g,[xx,1.76,-.38],[.27,.63,.27],'white');b.cyl(g,[xx,1.46,-.19],.095,.27,'steel');b.cyl(g,[xx,1.25,-.19],.023,.22,key==='laser'?'dark':'silver');b.pipe(g,[[xx,2,-.5],[xx+.13,2.14,-.29],[xx+.16,1.65,-.18]],.021,key==='plasma'?'blue':'dark');if(key==='electro')b.box(g,[xx,1.08,.1],[.42,.14,.42],'glass',.01,.45);});
 } else if(id===7){
  const base=b.part('base');b.box(base,[0,.57,0],[2.48,.34,1.47],'dark');for(const x of[-1.05,1.05])for(const z of[-.56,.56])b.cyl(base,[x,.1,z],.18,.16,'dark');
  const g=b.part('spindle');b.spindle(g,.15,1.84,-.14);b.cyl(g,[.15,1.38,-.1],.083,.06,'dark');
  const t=b.part('table');b.box(t,[.05,.93,.22],[.8,.21,.64],'silver');b.box(t,[.05,1.075,.22],[.43,.08,.3],'steel');
 } else if(id===8){
  const l=b.part('laser');b.box(l,[0,1.85,-.14],[.42,.57,.48],'white');b.cyl(l,[0,1.52,.01],.12,.17,'dark');b.cyl(l,[0,1.4,.01],.06,.13,'steel');
  const t=b.part('table');b.box(t,[0,.98,.23],[1.3,.29,.65],'silver');b.cyl(t,[-.32,1.22,.23],.2,.36,'dark','x');b.cyl(t,[-.05,1.22,.23],.1,.2,'steel','x');b.cyl(t,[.13,1.22,.23],.014,.2,'silver','x');b.cyl(t,[.39,1.11,.23],.16,.27,'dark','x');
  const s=b.part('sensor');b.box(s,[.63,1.65,.27],[.23,.24,.24],'dark');b.cyl(s,[.47,1.65,.27],.065,.15,'steel','x');b.rod(s,[.63,.8,-.15],[.63,1.65,-.15],.035);
 } else if(id===9){
  const t=b.part('turning');b.box(t,[-.88,1.24,-.16],[.52,.77,.7],'white');b.cyl(t,[-.51,1.27,.0],.29,.27,'steel','x');b.cyl(t,[-.3,1.27,0],.17,.2,'dark','x');b.cyl(t,[.0,1.27,0],.1,.43,'silver','x');
  const sp=b.part('spindle');b.spindle(sp,.33,1.96,-.26);
  const table=b.part('table');b.box(table,[.37,.86,.22],[.85,.16,.7],'dark');for(let i=0;i<4;i++)b.box(table,[.37,.91+i*.025,.22],[.82-i*.05,.012,.66-i*.04],'steel');
  const tool=b.part('toolholder');b.box(tool,[.46,1.05,.46],[.46,.3,.33],'silver');b.cyl(tool,[.32,1.24,.37],.027,.3,'dark','x');b.magazine(b.part('magazine'),.9,1.91,-.42,10,.24,true);
 }
}

function fiveAxis(b:Builder){b.housing(b.part('shell'),2.8,2.55,1.85);b.cabinet(b.part('control',[1.75,0,.57]),.59,1.9);b.spindle(b.part('spindle'),0,2.02,-.1);b.rails(b.part('motion'),2.1,1.25,.65);
 const t=b.part('table');b.box(t,[0,.78,.23],[1.73,.16,1.05],'dark');for(const x of[-.7,.7]){b.box(t,[x,1.0,.2],[.23,.55,.55],'white');b.cyl(t,[x,1.1,.2],.25,.27,'steel','x');}const r=b.group(t,[0,1.1,.2]);r.rotation.x=.48;b.box(r,[0,-.12,0],[1.37,.15,.54],'dark');b.rotary(r,0,.05,0,.49);b.cyl(r,[0,.2,0],.25,.13,'silver');
 const work=b.mesh(r,new T.TorusKnotGeometry(.14,.055,70,10),[0,.34,0],'steel');work.scale.y=.7;
 b.magazine(b.part('magazine'),1.03,2.12,-.27,42,.45,true);
}

function reconfigurable(b:Builder){
 const sh=b.part('shell');b.feet(sh,3.4,1.75);b.box(sh,[0,.28,0],[3.5,.3,1.8],'dark');b.box(sh,[0,.47,0],[3.4,.13,1.76],'steel');for(const x of[-1.3,1.3]){b.box(sh,[x,1.13,-.52],[.3,1.33,.4],'white');b.box(sh,[x,1.13,-.28],[.07,1.17,.025],'steel');}b.box(sh,[0,1.8,-.5],[2.9,.36,.44],'white');
 const table=b.part('table');b.rails(table,3.05,1.35,.59);b.rotary(table,.94,.88,.15,.36);b.box(table,[-1.13,.9,.13],[.38,.3,.46],'silver');
 const fix=b.part('fixture');b.box(fix,[0,.86,.18],[.77,.2,.7],'dark');b.box(fix,[0,.98,.18],[.67,.04,.6],'silver');for(let i=0;i<8;i++)b.box(fix,[-.3+i*.086,1.005,.18],[.026,.005,.57],'dark',0);
 const sp=b.part('spindle');b.spindle(sp,0,1.78,-.04);b.cyl(sp,[0,2.29,-.14],.11,.36,'dark');b.pipe(sp,[[.05,2.3,-.26],[.28,2.49,-.33],[.47,2.16,-.43]],.035,'dark');
 b.magazine(b.part('magazine'),-1.08,1.64,.07,16,.44);
 b.cabinet(b.part('control',[2.06,0,.13]),.62,1.97);
}

function heatPress(b:Builder){
 const p=b.part('press');b.box(p,[0,.22,0],[1.48,.36,1.14],'dark');b.box(p,[0,.48,0],[1.56,.15,1.2],'steel');for(const x of[-.63,.63])for(const z of[-.41,.41])b.cyl(p,[x,1.51,z],.073,2.03,'steel');b.box(p,[0,2.37,0],[1.56,.2,1.2],'silver');b.cyl(p,[0,2.65,0],.21,.43,'steel');b.cyl(p,[0,2.94,0],.095,.19,'dark');b.cyl(p,[0,2.07,0],.095,.39,'steel');
 const h=b.part('heat');b.cyl(h,[0,1.31,0],.5,1.17,'silver');b.cyl(h,[0,1.31,.49],.33,.12,'dark','z');b.cyl(h,[0,1.31,.575],.26,.06,'steel','z');b.cyl(h,[0,1.31,.615],.14,.035,'glass','z');b.bolts(h,0,1.31,.629,12,.27,'z');for(const y of[.73,1.9])b.cyl(h,[0,y,0],.57,.075,'steel');for(const x of[-.33,.33])b.pipe(h,[[x,.77,.43],[x*1.4,1,.64],[x*1.6,1.72,.57]],.024,'silver');
 const v=b.part('vacuum',[-1.12,0,-.3]);b.box(v,[0,.28,0],[.62,.45,.57],'dark');b.cyl(v,[0,.64,0],.2,.4,'steel','x');b.pipe(v,[[.2,.63,.0],[.53,.7,.0],[.64,1.04,.0]],.05,'steel');
 const c=b.part('cooling',[-1.93,0,.14]);b.cabinet(c,.71,1.02);b.pipe(c,[[.3,.6,-.2],[.61,.43,-.49],[1.66,.78,-.55]],.023,'blue');
 b.cabinet(b.part('control',[1.42,0,.0]),.73,1.86);
}

function additive(b:Builder){
 const arm=b.part('robot',[-.92,.1,-.4]);b.robot(arm,1.4,.0);const table=b.part('table',[.85,0,.39]);b.worktable(table,1.6,1.12,.61);b.box(table,[0,.72,0],[1.07,.11,.66],'steel');for(let j=0;j<12;j++)b.box(table,[0,.8+j*.023,0],[.61,.024,.33],'silver',.06);
 const laser=b.part('laser',[.52,1.38,-.2]);b.box(laser,[0,0,0],[.25,.35,.2],'dark');b.cyl(laser,[0,-.25,0],.057,.2,'steel');b.rod(laser,[.13,-.02,.05],[.055,-.35,.025],.03,'silver');
 const wire=b.part('wire',[-1.94,0,-.5]);b.worktable(wire,.71,.63,.68);for(const z of[-.18,.18]){b.cyl(wire,[0,1.08,z],.25,.18,'dark','z');b.cyl(wire,[0,1.08,z+.1],.19,.015,'silver','z');}b.pipe(wire,[[.05,1.3,0],[.63,2.44,-.4],[1.56,2.41,-.3],[2.47,1.54,.3]],.025,'dark');
 const sensor=b.part('sensor',[1.61,0,-.48]);b.box(sensor,[0,1.63,0],[.18,.18,.22],'dark');b.rod(sensor,[0,.08,0],[0,1.5,0],.031);b.cyl(sensor,[0,1.63,.15],.045,.08,'blue','z');
 b.cabinet(b.part('control',[2.18,0,.45]),.66,1.77);b.fence(b.part('fence'),4.9,2.65);
}

function flexible(b:Builder,variant=false){
 const m=b.part('machine',[-1.8,0,-.48]);const mc=b.group(m);mc.scale.setScalar(.74);b.housing(mc,2.1,2.4,1.65);b.spindle(mc,0,1.8,0);b.rotary(mc,0,.85,.1,.4);b.screen(mc,.73,1.67,.88,.36,.37);
 const st=b.part('machine',[.05,0,-.89]);b.worktable(st,1.34,.82,.71);for(const x of[-.54,.54])b.box(st,[x,1.29,-.24],[.055,1.1,.055],'steel');b.box(st,[0,1.79,-.24],[1.16,.08,.13],'silver');b.cyl(st,[0,1.52,-.16],.1,.43,'steel');b.rotary(st,0,.82,.03,.37);b.screen(st,.58,1.4,.24,.43,.31);
 const st2=b.part('machine',[1.54,0,-.35]);b.box(st2,[0,.43,0],[1.45,.77,1.03],'white');b.box(st2,[0,.87,0],[1.43,.13,1.0],'steel');for(const x of[-.52,.52]){b.cyl(st2,[x,1.31,-.31],.033,.76,'steel');b.cyl(st2,[x,1.22,-.15],.085,.42,'yellow');}b.box(st2,[0,1.7,-.34],[1.2,.1,.25],'white');for(let i=0;i<4;i++)b.cyl(st2,[-.4+i*.26,.98,.18],.095,.17,'steel');b.screen(st2,.63,1.39,.04,.42,.31);
 const mobile=b.part('mobile',[-.57,0,1.07]);b.agv(mobile);const arm=b.part('robot',[-.57,.37,1.07]);b.robot(arm,variant?1.15:1.25,-Math.PI*.53);
 b.dock(b.part('dock',[1.55,0,1.03]));b.monitor(b.part('control',[-2.75,0,1.03]));
}

function transport(b:Builder){
 const mobile=b.part('mobile');for(let i=0;i<3;i++){const g=b.group(mobile,[-1.55+i*.13,0,-1.05+i*1.04]);g.scale.setScalar(.76);b.agv(g,true);b.box(g,[0,1.01,0],[.48,.18,.4],'dark');}
 const dual=b.part('dual');for(let i=0;i<2;i++){const g=b.group(dual,[-.4+i*1.15,0,-1.02]);b.agv(g);b.box(g,[0,1.05,0],[.25,1.26,.24],'silver');b.box(g,[0,1.5,0],[.56,.38,.3],'white');b.box(g,[0,1.83,.03],[.33,.25,.22],'white',.055);b.box(g,[0,1.83,.16],[.24,.06,.02],'dark');for(const x of[-.3,.3]){const arm=b.group(g,[x,1.28,0],x<0?Math.PI:.0);b.robot(arm,.42,Math.PI*.2,'white');}}
 const robots=b.part('robot');for(let i=0;i<2;i++){const g=b.group(robots,[.03+i*1.24,0,.18]);g.scale.setScalar(.82);b.agv(g);b.robot(b.group(g,[0,.38,0]),.83,-Math.PI*.2);}
 const dogs=b.part('dog');b.dog(b.group(dogs,[.04,0,1.47]),.8);b.dog(b.group(dogs,[1.11,0,1.48]),1.12);
 b.monitor(b.part('control',[2.22,0,-.88]));
}

function multiRobot(b:Builder){
 const t=b.part('table');b.worktable(t,1.65,1.35,.8);for(const x of[-.59,.59])for(const z of[-.44,.44])b.box(t,[x,1.17,z],[.05,.65,.05],'steel');for(const z of[-.44,.44])b.box(t,[0,1.49,z],[1.25,.05,.05],'silver');for(const x of[-.3,0,.3])b.box(t,[x,.97,0],[.14,.23,.4],'dark');
 const r=b.part('robot');[[-1.5,.0,-.73,.0],[1.5,.0,-.73,Math.PI],[-1.5,.0,.77,.0],[1.5,.0,.77,Math.PI]].forEach(v=>{const g=b.group(r,[v[0],v[1],v[2]],v[3]);b.cyl(g,[0,.31,0],.26,.6,'dark');b.robot(b.group(g,[0,.63,0]),.84);});
 b.fence(b.part('fence'),4.5,3.45);b.cabinet(b.part('control',[2.65,0,-.33]),.58,1.65);const sen=b.part('sensor',[2.7,0,1.0]);b.worktable(sen,.55,.43,.78);b.box(sen,[0,.87,0],[.48,.1,.31],'dark');
}

function assembly(b:Builder){
 const a=b.part('assembly');for(let i=0;i<3;i++){const g=b.group(a,[-1.8+i*1.65,0,-.7]);b.agv(g);b.worktable(b.group(g,[0,.38,0]),1.31,.88,.7);for(let j=0;j<3;j++){b.cyl(g,[-.38+j*.35,1.22,.1],.088,.23,'steel');b.box(g,[-.38+j*.35,1.16,.31],[.18,.11,.17],'blue');}b.screen(g,.42,1.56,-.18,.42,.33);b.box(g,[-.48,1.43,-.29],[.06,.7,.06],'silver');if(i===1){for(const x of[-.45,.45])b.box(g,[x,1.39,-.23],[.045,.6,.045],'steel');b.box(g,[0,1.69,-.23],[.99,.075,.15],'white');}}
 const robots=b.part('robot');for(let i=0;i<2;i++){const g=b.group(robots,[-.95+i*2,0,.92]);b.agv(g);b.robot(b.group(g,[0,.37,0]),.82,-Math.PI*.4);}
 const l=b.part('laser',[2.74,0,-.68]);b.agv(l);b.box(l,[0,.92,0],[.87,1.08,.72],'white');b.box(l,[0,1.01,.37],[.57,.53,.02],'glass',.02,.6);b.box(l,[0,1.32,-.21],[.17,.36,.2],'dark');
 b.dock(b.part('dock',[.07,0,1.75]));b.monitor(b.part('control',[2.71,0,.99]));
}

function lathe(b:Builder,g:T.Group){
 b.housing(g,2.4,1.9,1.29);b.box(g,[0,.66,0],[1.97,.23,.82],'steel');b.box(g,[-.73,1.1,-.14],[.49,.75,.69],'white');b.cyl(g,[-.4,1.12,.03],.24,.21,'steel','x');b.cyl(g,[-.26,1.12,.03],.18,.08,'dark','x');for(let j=0;j<3;j++){const a=j/3*Math.PI*2;b.box(g,[-.19,1.12+Math.cos(a)*.12,Math.sin(a)*.12+.03],[.12,.065,.07],'silver');}b.cyl(g,[.01,1.12,.03],.072,.33,'silver','x');b.cyl(g,[.55,1.02,.22],.24,.23,'dark','z');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;b.box(g,[.55+Math.cos(a)*.21,1.02+Math.sin(a)*.21,.38],[.04,.04,.22],'steel');}b.screen(g,.99,1.47,.7,.32,.29);
}

function processCell(b:Builder,id:number){
 let main=b.part('machine',[.6,0,-.47]);
 if(id===15){
  b.box(main,[0,.45,0],[2,.79,1.57],'white');b.box(main,[0,.9,0],[2.09,.15,1.67],'dark');for(const x of[-.82,.82]){b.box(main,[x,1.55,-.32],[.24,1.23,.26],'white');b.box(main,[x,1.1,0],[.31,.18,1.39],'silver');}b.box(main,[0,2.15,-.32],[1.92,.24,.3],'white');b.box(main,[.12,1.96,-.32],[.29,.73,.35],'white');b.cyl(main,[.12,1.38,-.21],.044,.47,'steel');b.ball(main,[.12,1.13,-.21],.026,'red');b.cyl(main,[-.12,1.1,.08],.23,.27,'silver');
  const s=b.part('sensor',[1.72,0,.7]);b.worktable(s,.57,.6,.83);b.box(s,[0,1.32,-.15],[.046,1,.046],'steel');b.box(s,[0,1.73,-.03],[.25,.12,.22],'dark');b.cyl(s,[0,1.62,.03],.06,.13,'blue');b.box(s,[.33,1.65,-.18],[.18,.16,.2],'white');
 }else if(id===16){
  b.box(main,[0,.22,0],[1.8,.36,1.28],'white');for(const x of[-.48,.48]){b.box(main,[x,1.14,-.1],[.61,1.55,.53],'white');b.cyl(main,[x,1.73,.23],.2,.28,'dark','z');b.cyl(main,[x,.61,.23],.2,.28,'dark','z');b.box(main,[x,1.17,.382],[.37,1.12,.025],'dark',0);b.box(main,[x,1.14,.402],[.33,1.06,.02],'red',0);b.box(main,[x,.85,.53],[.46,.06,.32],'silver');}b.pipe(main,[[0,.5,-.4],[0,1.8,-.45],[.5,2.08,-.37]],.07,'steel');
  const s=b.part('sensor',[-.16,0,1.22]);b.worktable(s,.44,.4,.72);b.box(s,[0,.84,0],[.3,.13,.23],'dark');b.cyl(s,[0,.84,.14],.025,.07,'red','z');
 }else if(id===17){
  b.box(main,[0,.23,0],[2.11,.37,1.4],'white');b.box(main,[0,1.27,-.64],[2.11,1.92,.1],'steel');b.box(main,[0,2.19,0],[2.18,.2,1.47],'white');for(const x of[-1.03,1.03])b.box(main,[x,1.28,0],[.1,1.79,1.35],'white');b.cyl(main,[0,2.5,-.29],.2,.47,'steel');for(const x of[-.5,.5]){b.rotary(main,x,.71,.06,.3);b.mesh(main,new T.SphereGeometry(.22,22,12,0,Math.PI*2,0,Math.PI/2),[x,.89,.06],'silver');}for(let i=0;i<12;i++)b.box(main,[-.85+i*.155,.49,.12],[.018,.03,1.07],'dark',0);
  const s=b.part('sensor',[1.7,0,.8]);b.worktable(s,.44,.4,.8);b.box(s,[0,.96,0],[.2,.25,.22],'dark');b.ball(s,[0,.96,.12],.025,'red');
  const spray=b.part('spray',[-.46,1.43,.12]);b.cyl(spray,[0,0,0],.04,.29,'silver','x');b.cyl(spray,[.21,0,0],.035,.14,'steel','x');b.pipe(spray,[[-.08,-.07,0],[-.2,-.47,.12],[-.44,-.93,.22]],.018,'dark');
 }else if(id===18){
  b.box(main,[0,.37,0],[1.9,.58,1.38],'white');b.box(main,[0,.71,.07],[1.68,.21,1.16],'steel');b.box(main,[0,.87,.1],[1.43,.15,.94],'dark');for(const x of[-.75,.75])b.box(main,[x,1.05,.1],[.08,.41,1.05],'steel');b.box(main,[0,.93,.59],[1.5,.32,.07],'silver');b.box(main,[0,1.44,-.48],[.43,1.59,.47],'white');b.box(main,[0,2.08,-.03],[.38,.26,1.05],'white');b.cyl(main,[0,1.8,.34],.06,.33,'steel');b.rod(main,[0,1.68,.34],[0,.93,.34],.005,'dark');b.box(main,[.05,1.04,.12],[.39,.15,.43],'steel');b.cyl(main,[-.64,.53,-.66],.17,.32,'dark','x');
  b.cleaner(b.part('cleaner',[2.02,0,1.13]));
 }else if(id===19){
  b.housing(main,2.7,2.14,1.7);for(let i=0;i<16;i++)b.box(main,[-1.05+i*.14,.69,.02],[.017,.16,1.35],'steel',0);b.box(main,[0,1.4,-.15],[2.3,.2,.25],'silver');b.box(main,[.24,1.13,-.11],[.2,.51,.2],'white');b.cyl(main,[.24,.81,-.08],.049,.17,'dark');b.box(main,[.0,.795,.26],[.9,.017,.54],'silver',0);b.cleaner(b.part('cleaner',[2.13,0,1.25]));
 }else if(id===20){
  main.position.set(0,0,0);
 }
 if(id===20){main.clear();for(const x of[-1.19,1.19]){const g=b.group(main,[x,0,-.64]);g.scale.setScalar(.83);lathe(b,g);}const r=b.part('robot',[0,0,.57]);b.cyl(r,[0,.2,0],.28,.4,'dark');b.robot(b.group(r,[0,.4,0]),.9,Math.PI*.93);b.cleaner(b.part('cleaner',[2.13,0,1.11]));}
 else{const r=b.part('robot',[-1.04,0,.34]);b.cyl(r,[0,.19,0],.29,.38,'dark');b.robot(b.group(r,[0,.4,0]),1.08,-.24);}
 b.dock(b.part('dock',[-1.48,0,1.62]));b.toolRack(b.part('tool',[.24,0,1.67]));b.cabinet(b.part('control',[2.25,0,-.58]),.57,1.75);b.monitor(b.part('control',[2.92,0,.48]));b.fence(b.part('fence'),5.1,3.52);
}

export function createEquipmentModel(id:number):Model{
 const b=new Builder();
 if(id===1||id===11)flexible(b,id===11);
 else if(id===2)reconfigurable(b);
 else if([3,4,7,8,9].includes(id))standardMachine(b,id);
 else if(id===5)heatPress(b);
 else if(id===6)fiveAxis(b);
 else if(id===10)additive(b);
 else if(id===12)transport(b);
 else if(id===13)multiRobot(b);
 else if(id===14)assembly(b);
 else if(id>=15&&id<=20)processCell(b,id);
 else throw new Error('未知设备编号');
 return b.finish();
}
