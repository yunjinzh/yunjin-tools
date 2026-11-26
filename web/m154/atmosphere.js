import * as T from 'three';
const rad=Math.PI/180, clamp=T.MathUtils.clamp;
export const climates={clear:['晴天','sun',0.12],cloud:['多云','cloud',0.66],rain:['降雨','rain',0.92],snow:['降雪','snow',0.89],fog:['雾天','fog',0.63]};
export function solar(date,time,lat=39.91,lon=116.40){
 const d=new Date(date+'T12:00:00Z'),start=Date.UTC(d.getUTCFullYear(),0,0),N=Math.floor((d.getTime()-start)/864e5);
 const g=2*Math.PI/365*(N-1+(time-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const h=(time*15+eq/4+lon-120-180)*rad,p=lat*rad;
 return new T.Vector3(-Math.cos(dec)*Math.sin(h),Math.sin(p)*Math.sin(dec)+Math.cos(p)*Math.cos(dec)*Math.cos(h),-(Math.cos(p)*Math.sin(dec)-Math.sin(p)*Math.cos(dec)*Math.cos(h))).normalize();
}
const skyvs='varying vec3 dir; void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const skyfs=`
varying vec3 dir; uniform vec3 sunDir; uniform float day; uniform float warm; uniform float clouds; uniform float weatherDark; uniform float t;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float f=0.;float s=.52;for(int i=0;i<5;i++){f+=s*noise(p);p=mat2(1.67,1.,-1.,1.67)*p+5.4;s*=.49;}return f;}
void main(){vec3 v=normalize(dir);float y=max(0.,v.y);float sd=dot(v,sunDir);
 vec3 horizon=mix(vec3(.026,.048,.09),mix(vec3(.67,.80,.86),vec3(.98,.69,.46),warm*(.48+.52*max(sd,0.))),day);
 vec3 zenith=mix(vec3(.004,.009,.026),mix(vec3(.115,.34,.56),vec3(.18,.32,.48),warm),day);
 vec3 col=mix(horizon,zenith,pow(y,.53));col=mix(col,mix(vec3(.027,.044,.06),vec3(.36,.41,.44),day),weatherDark*.76);
 float stars=step(.9975,hash(floor(v.xz*900./(abs(v.y)+.24))))*smoothstep(.07,.29,y)*(1.-day);
 col+=stars*.50;
 vec2 uv=v.xz/(y+.075)*1.1+vec2(t*.00075,t*.00032);
 float cd=fbm(uv*1.36);float a=smoothstep(.70-clouds*.43,.86-clouds*.29,cd)*smoothstep(-.015,.12,v.y);
 vec3 cc=mix(vec3(.07,.09,.12),mix(vec3(.91,.94,.95),vec3(.99,.80,.65),warm*max(sd,.22)),day);
 cc*=mix(.68,1.,smoothstep(.26,.72,cd))*(1.-weatherDark*.36);
 col=mix(col,cc,a*(.72+.26*clouds));
 float glow=pow(max(sd,0.),16.0)*.27+pow(max(sd,0.),180.)*.43;col+=vec3(1.,.69,.38)*glow*(1.-weatherDark)*(1.-.8*a)*day;
 col=mix(col,vec3(1.,.93,.72),smoothstep(.9998,.99995,sd)*day*(1.-a)*(1.-weatherDark));
 float moon=smoothstep(.99975,.9999,dot(v,normalize(vec3(-.28,.65,-.71))));col+=vec3(.62,.73,.81)*moon*(1.-day)*(1.-a);
 gl_FragColor=vec4(col,1.);
}`;
function envMap(){
 const w=256,h=128,a=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h,b=v>.50?[99,108,101]:[81+120*v,124+113*v,155+94*v];const gl=Math.exp(-((u-.64)**2/.013+(v-.42)**2/.004));let k=(y*w+x)*4;for(let c=0;c<3;c++)a[k+c]=Math.min(255,b[c]+gl*(130-c*18));a[k+3]=255;}
 const tex=new T.DataTexture(a,w,h,T.RGBAFormat);tex.mapping=T.EquirectangularReflectionMapping;tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;return tex;
}
export function makeAtmosphere(scene,renderer){
 const uni={sunDir:{value:new T.Vector3()},day:{value:1},warm:{value:0},clouds:{value:.1},weatherDark:{value:0},t:{value:0}};
 const sky=new T.Mesh(new T.SphereGeometry(115000,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,uniforms:uni,vertexShader:skyvs,fragmentShader:skyfs}));sky.renderOrder=-10000;sky.frustumCulled=false;scene.add(sky);
 scene.background=new T.Color('#94acb6');scene.fog=new T.FogExp2('#adc2c6',.000017);
 const hemi=new T.HemisphereLight(0xe6efff,0xb0a087,1.2),sun=new T.DirectionalLight(0xffe6be,2),fill=new T.DirectionalLight(0xc4d6fb,.55);
 fill.position.set(-450,400,-280);scene.add(hemi,sun,sun.target,fill);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00015;sun.shadow.normalBias=.1;sun.shadow.camera.near=1;sun.shadow.camera.far=4200;
 if(renderer){const env=envMap(),baker=new T.PMREMGenerator(renderer),pm=baker.fromEquirectangular(env);scene.environment=pm.texture;scene.environmentIntensity=.46;env.dispose();baker.dispose();}
 const count=820, coords=new Float32Array(count*6),seeds=new Float32Array(count*4);
 for(let i=0;i<seeds.length;i++)seeds[i]=Math.random();
 const geo=new T.BufferGeometry(),attr=new T.BufferAttribute(coords,3);attr.setUsage(T.DynamicDrawUsage);geo.setAttribute('position',attr);
 const rain=new T.LineSegments(geo,new T.LineBasicMaterial({color:0xc3d2d7,transparent:true,opacity:.6,depthWrite:false,fog:false}));
 const flakePos=new Float32Array(count*3),sg=new T.BufferGeometry(),sa=new T.BufferAttribute(flakePos,3);sa.setUsage(T.DynamicDrawUsage);sg.setAttribute('position',sa);
 const snow=new T.Points(sg,new T.PointsMaterial({color:0xf3f4ff,size:.19,sizeAttenuation:true,transparent:true,opacity:.85,depthWrite:false}));
 rain.frustumCulled=snow.frustumCulled=false;scene.add(snow,rain);
 let weather='clear',sunVector=new T.Vector3(),clock=0,lastRange=0,result={night:0,wet:0,snow:0};
 const dark=new T.Color('#172942'),dayColor=new T.Color('#b7c7cb'),warmFog=new T.Color('#e0be9d'),tint=new T.Color(),silver=new T.Color('#95a1a6'),v=new T.Vector3();
 function set(date,time,w){weather=w;const dir=solar(date,time);sunVector.copy(dir);const day=T.MathUtils.smoothstep(dir.y,-.12,.105),warm=(1-T.MathUtils.smoothstep(dir.y,.04,.43))*day,severity=({clear:0,cloud:.23,rain:.83,snow:.72,fog:.72})[w];
 uni.sunDir.value.copy(dir);uni.day.value=day;uni.warm.value=warm;uni.clouds.value=climates[w][2];uni.weatherDark.value=severity;
 hemi.intensity=.35+day*(1.25+severity*.22);hemi.color.set('#e2eeff');hemi.groundColor.set(day>.3?'#b6a391':'#4d526b');
 sun.color.set(day>.5?'#ffead4':'#a5bcff');if(day>.5)sun.color.lerp(new T.Color('#ffad71'),warm*.75);
 sun.intensity=day*(2.6+warm*.25)*(1-severity*.9)+(1-day)*.37;
 fill.intensity=.12+.38*day;sun.castShadow=day>.1&&w!=='fog';scene.environmentIntensity=.13+day*(.4-severity*.14);
 tint.copy(dayColor).lerp(warmFog,warm*.55).lerp(silver,severity*.7);scene.fog.color.copy(dark).lerp(tint,day);scene.background.copy(scene.fog.color);
 scene.fog.density=({clear:.000017,cloud:.000032,rain:.00033,snow:.00030,fog:.00107})[w];
 rain.visible=w==='rain';snow.visible=w==='snow';result={night:1-day,wet:w==='rain'?1:0,snow:w==='snow'?1:0};
 return result;}
 function update(camera,target,dt,dist){clock+=dt;uni.t.value=clock;sky.position.copy(camera.position);
 const range=clamp(dist*.86,95,600);if(Math.abs(lastRange-range)>1){const c=sun.shadow.camera;c.left=c.bottom=-range;c.right=c.top=range;c.updateProjectionMatrix();lastRange=range;}
 sun.target.position.copy(target);v.copy(sunVector);if(v.y<.06)v.set(-.42,.56,-.65).normalize();sun.position.copy(target).addScaledVector(v,1600);
 if(!rain.visible&&!snow.visible)return;const fl=weather==='snow',r=fl?48:68;rain.position.copy(camera.position);snow.position.copy(camera.position);
 for(let i=0;i<count;i++){const j=i*4,k=i*6,l=i*3,s=seeds[j],p=seeds[j+1],q=seeds[j+2],f=seeds[j+3];
 const y=((q*r+clock*(fl?2.3:26)*(1+f*.4))%r);const x=(s-.5)*r+(fl?Math.sin(clock*.7+f*40)*.9:0),z=(p-.5)*r,yy=r*.47-y;
 if(fl){flakePos[l]=x;flakePos[l+1]=yy;flakePos[l+2]=z;}else{coords[k]=x;coords[k+1]=yy;coords[k+2]=z;coords[k+3]=x+.17;coords[k+4]=yy-.97;coords[k+5]=z;}}
 (fl?sa:attr).needsUpdate=true;}
 return {set,update,get state(){return result}};
}
