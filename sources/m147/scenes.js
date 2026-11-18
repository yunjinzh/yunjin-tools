(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MirrorScenes=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
let serial=0;
const scenes=[
{id:'studio',name:'镜间试衣室',tag:'衣橱',subtitle:'一束柔光，留给今天的你',palette:['#ede8de','#c6cbbf','#b5a593']},
{id:'subway',name:'地铁站台',tag:'都市',subtitle:'末班之后，城市还醒着',palette:['#e8dfc6','#7e9185','#b68157']},
{id:'greenhouse',name:'植物温室',tag:'自然',subtitle:'把日光，穿在身上',palette:['#e9eadc','#7c8f70','#b9c7ad']},
{id:'orbit',name:'轨道观测舱',tag:'未来',subtitle:'下一站，星光之外',palette:['#233d41','#91b4ac','#d7b793']},
{id:'gallery',name:'美术展厅',tag:'人文',subtitle:'你也是，一件作品',palette:['#eeebe3','#b48b73','#a4ac9d']}
];
const line=(x1,y1,x2,y2,color,width=1,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
function leaf(x,y,scale,angle,color){return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><path d="M0 0C-44 -38 -75 -107 -29 -143C11 -138 44 -83 0 0Z" fill="${color}"/><path d="M0 0Q-24 -61 -29 -132M-15 -53L-45 -73M-21 -80L0 -104" fill="none" stroke="#f1f2dc" stroke-opacity=".2" stroke-width="2"/></g>`;}
function plant(x,y,s=1,direction=1){let out=`<g transform="translate(${x} ${y}) scale(${s})">`;out+='<path d="M-38 -8L-28 78Q0 93 29 78L40 -8Z" fill="#c5b49b"/><ellipse cx="1" cy="-8" rx="39" ry="10" fill="#928773"/><path d="M-29 4L-20 73M-12 4L-7 81M9 4L7 81M27 4L20 75" stroke="#e6dcc8" stroke-width="2" opacity=".45"/>';
for(let i=0;i<7;i++){const t=i/6;out+=`<path d="M0 -8Q${(i%2?1:-1)*35} ${-45-i*8} ${direction*(i%2?45:-37)} ${-85-i*21}" fill="none" stroke="#6e7d5c" stroke-width="3"/>`;out+=leaf(direction*(i%2?45:-37),-85-i*21,.6+t*.2,(i%2?53:-30)*direction,['#82936d','#596f54','#a2af87'][i%3]);}return out+'</g>';}
function studio(p){let out=`<rect width="800" height="1000" fill="#eee9df"/><rect width="800" height="752" fill="url(#${p}wall)"/><path d="M148 752V309C148 161 261 89 400 89S652 161 652 309V752" fill="#d4cfc2"/><path d="M166 752V311C166 174 272 107 400 107S634 174 634 311V752" fill="url(#${p}arch)"/><path d="M178 752V312C178 183 280 120 400 120S622 183 622 312V752" fill="none" stroke="#f5f0e5" stroke-width="2"/><path d="M0 752H800V1000H0Z" fill="url(#${p}floor)"/><path d="M0 752H800" stroke="#d3cbbb"/>
<path d="M32 125H115V506H32Z" fill="#e9e5d8" stroke="#c1b69f"/><path d="M38 131H109V500H38Z" fill="#e0e0d1"/><path d="M53 143L96 143L71 491L40 491Z" fill="#faf7ed" opacity=".65"/><path d="M707 225H760V616H707Z" fill="#dedbce"/><path d="M714 233H753V607H714Z" fill="#e8e5db"/>
<path d="M174 496L634 642V702L174 556Z M174 589L610 727H433L174 647Z" fill="#faf7ec" opacity=".38"/>
<path d="M0 863L266 752M800 863L534 752M0 969L347 752M800 969L453 752" fill="none" stroke="#d5cec0" opacity=".5"/>
<ellipse cx="400" cy="949" rx="245" ry="37" fill="#c3b9a4" opacity=".12"/><ellipse cx="400" cy="928" rx="227" ry="31" fill="#e7dfd0"/><ellipse cx="400" cy="921" rx="225" ry="30" fill="#f2ede3"/>
<path d="M668 694H774L787 720H655Z" fill="#bab5a6"/><path d="M665 720V805M777 720V805" stroke="#9d9b8d" stroke-width="4"/><rect x="675" y="659" width="88" height="35" rx="9" fill="#c9c9b8"/>
<path d="M49 691V785M123 691V785M39 693H134" stroke="#9c8b71" stroke-width="4"/><path d="M50 684Q88 664 124 684" stroke="#dfd4bf" stroke-width="15" fill="none"/>`;
out+=plant(94,649,.43,-1);return out;}
function subway(p){let out=`<rect width="800" height="1000" fill="#e7dfc8"/><rect width="800" height="742" fill="url(#${p}tile)"/><path d="M0 245Q400 -45 800 245V0H0Z" fill="#d8d3bc"/><path d="M20 235Q400 -14 780 235M77 213Q400 13 723 213" fill="none" stroke="#f8f3da" stroke-width="7"/><path d="M0 592H800V710H0Z" fill="#859387"/><path d="M0 590H800" stroke="#b2b9a6" stroke-width="7"/>
<path d="M0 348H800V582H0Z" fill="#b4b7a7"/><path d="M0 358H800V570H0Z" fill="#c6cbbd"/>
<rect x="-61" y="386" width="220" height="149" rx="29" fill="#6a817b" stroke="#e5e7d8" stroke-width="8"/><rect x="189" y="386" width="171" height="149" rx="25" fill="#80958b" stroke="#e5e7d8" stroke-width="8"/><rect x="432" y="386" width="171" height="149" rx="25" fill="#738b83" stroke="#e5e7d8" stroke-width="8"/><rect x="633" y="386" width="220" height="149" rx="29" fill="#6a817b" stroke="#e5e7d8" stroke-width="8"/>
<path d="M-20 406L128 406L82 515H-20Z M215 406H337L291 515H215Z M454 406H582L536 515H454Z M654 406H790L744 515H654Z" fill="#dfe6d6" opacity=".22"/>
<path d="M389 359V571M404 359V571" stroke="#9da99a" stroke-width="3"/><path d="M0 556H800" stroke="#a5b1a0" stroke-width="3"/>
<path d="M0 709H800V1000H0Z" fill="url(#${p}floor)"/><path d="M0 721H800" stroke="#c3b399" stroke-width="13"/><path d="M0 744H800" stroke="#e5d3a0" stroke-width="20" stroke-dasharray="3 8"/><path d="M0 840H800M0 953H800M35 1000L222 760M770 1000L580 760M255 1000L344 760M548 1000L466 760" fill="none" stroke="#bdbbaa" stroke-width="1"/>
<rect x="46" y="199" width="196" height="83" rx="4" fill="#f2efde" stroke="#aaad94"/><rect x="59" y="213" width="38" height="38" rx="19" fill="#8d9d88"/><text x="78" y="237" fill="#f8f6e8" font-size="17" text-anchor="middle" font-family="sans-serif">07</text><text x="112" y="233" fill="#4f6257" font-size="16" letter-spacing="2" font-family="sans-serif">镜间站</text><text x="113" y="252" fill="#77816c" font-size="8" letter-spacing="1.4" font-family="sans-serif">MIRROR STATION</text><path d="M206 239H226L220 232M226 239L220 246" stroke="#667762" stroke-width="1.5" fill="none"/>
<path d="M668 244V687M733 244V687" stroke="#a4ad97" stroke-width="18"/><path d="M671 244V687M736 244V687" stroke="#c0c5ae" stroke-width="6"/>
<ellipse cx="400" cy="930" rx="175" ry="27" fill="#6d7b6c" opacity=".1"/>`;return out;}
function greenhouse(p){let out=`<rect width="800" height="1000" fill="#e8e9db"/><path d="M53 752V345Q53 51 400 51Q747 51 747 345V752Z" fill="url(#${p}glass)"/><path d="M73 752V345Q73 73 400 73Q727 73 727 345V752Z" fill="none" stroke="#a6b5a1" stroke-width="4"/><path d="M400 75V750M210 127V750M590 127V750M80 334H720M76 527H725M144 207H655" fill="none" stroke="#a8b6a4" stroke-width="4"/>
<path d="M73 345Q400 240 727 345M73 537Q400 469 727 537" stroke="#f9fbec" stroke-width="2" fill="none"/><path d="M131 229L194 148L326 750H253Z M431 82L470 88L607 750H547Z" fill="#fffef0" opacity=".45"/>
<path d="M0 752H800V1000H0Z" fill="url(#${p}floor)"/><path d="M0 753H800" stroke="#c2c6b2" stroke-width="3"/><path d="M0 810L308 752M0 920L360 752M800 825L500 752M800 936L449 752M112 1000L377 752M682 1000L424 752" fill="none" stroke="#d1d1bc"/><path d="M88 1000L391 752H439L238 1000Z M496 1000L467 752H493L632 1000Z" fill="#faf8e5" opacity=".55"/>
<rect x="17" y="615" width="151" height="11" rx="3" fill="#a5ad96"/><path d="M31 626L22 787M155 626L164 787" stroke="#a4aa95" stroke-width="5"/><path d="M638 622H784M654 622V781M770 622V781" stroke="#a4aa95" stroke-width="6"/>
<path d="M30 370Q-11 458 35 578M721 385Q779 464 743 601" fill="none" stroke="#869c78" stroke-width="4"/>`;
out+=plant(42,767,1.1,-1)+plant(755,735,1.12,1)+plant(110,602,.53,1)+plant(693,606,.57,-1);
out+=leaf(19,562,1.2,-55,'#768d68')+leaf(779,588,1.3,51,'#6c845f');
out+=`<path d="M50 51V0M750 51V0" stroke="#bbc4af" stroke-width="2"/><path d="M23 39H79L68 75H34Z M722 39H778L767 75H733Z" fill="#a6b497"/><ellipse cx="400" cy="930" rx="181" ry="29" fill="#899b7d" opacity=".12"/>`;return out;}
function orbit(p,fill){let out=`<rect width="800" height="1000" fill="#213b40"/><path d="M0 0H800V755H0Z" fill="url(#${p}spacewall)"/><circle cx="400" cy="381" r="326" fill="#263f45" stroke="#506b6c" stroke-width="28"/><circle cx="400" cy="381" r="301" fill="#132a32" stroke="#90aaa3" stroke-width="3"/><circle cx="400" cy="381" r="287" fill="url(#${p}space)"/>`;
for(let i=0;i<62;i++){const x=150+(i*137%500),y=125+(i*73%500);if((x-400)**2+(y-381)**2<274**2)out+=`<circle cx="${x}" cy="${y}" r="${i%5===0?1.7:.8}" fill="#d8e7d9" opacity="${.25+(i%5)*.13}"/>`;}
out+=`<circle cx="521" cy="264" r="109" fill="#a5c7bd"/><path d="M487 163Q568 204 535 281Q520 318 543 371A109 109 0 0 0 487 163Z" fill="#476f78"/><path d="M444 201Q470 184 514 206T594 222M416 245Q478 220 519 246T625 271M419 283Q464 264 489 282T614 313" fill="none" stroke="#d9e4c9" stroke-width="13" opacity=".35"/>
<path d="M303 0L315 79M497 0L485 79M0 352L75 358M800 352L725 358M151 635L94 706M649 635L706 706" stroke="#657f7d" stroke-width="3"/>
<path d="M0 758H800V1000H0Z" fill="url(#${p}deck)"/><path d="M0 760H800" stroke="#516f6c" stroke-width="3"/><path d="M0 1000L225 758M800 1000L575 758M151 1000L313 758M649 1000L487 758M0 881H800" fill="none" stroke="#456360" stroke-width="1.5"/>
<path d="M22 612H152L175 691H0Z M648 612H778L800 691H625Z" fill="#4e6968"/><path d="M32 622H138L151 669H17Z M663 622H767L781 669H649Z" fill="#233f42"/>
<path d="M36 636H94M38 644H71M42 654H113M674 639H747M668 650H724" stroke="#8fb6aa" stroke-width="2" opacity=".75"/><circle cx="125" cy="644" r="9" fill="none" stroke="#c5bc91" stroke-width="2"/><circle cx="750" cy="650" r="5" fill="#afbd9c"/>
<path d="M29 691V771M144 691V771M659 691V771M776 691V771" stroke="#65817b" stroke-width="5"/>
<ellipse cx="400" cy="930" rx="242" ry="48" fill="#162e33"/><path d="M158 916V933C158 962 642 962 642 933V916" fill="#4b6867"/><ellipse cx="400" cy="916" rx="242" ry="43" fill="#76918a"/><ellipse cx="400" cy="916" rx="229" ry="37" fill="#b7c8b6"/><ellipse cx="400" cy="917" rx="211" ry="29" fill="#cad4c0" opacity=".28"/>
<path d="M59 80H140M59 89H110" stroke="#8ba59b" stroke-width="2"/><text x="61" y="111" fill="#8ba59b" font-family="sans-serif" font-size="8" letter-spacing="3">OBSERVATORY / 07</text>`;
if(fill)out+=`<ellipse cx="400" cy="512" rx="250" ry="360" fill="url(#${p}softfill)"/>`;return out;}
function gallery(p){return `<rect width="800" height="1000" fill="#eeebe2"/><rect width="800" height="743" fill="url(#${p}wall)"/><path d="M0 0H800L702 86H97Z" fill="#e0ddd3"/><path d="M98 87H701" stroke="#faf7ed" stroke-width="4"/><path d="M34 742H765" stroke="#d3cebf" stroke-width="4"/>
<path d="M0 743H800V1000H0Z" fill="url(#${p}floor)"/><path d="M0 881H800M133 1000L274 743M672 1000L531 743" fill="none" stroke="#d5cfc2"/>
<rect x="43" y="242" width="177" height="249" fill="#c5b99f"/><rect x="49" y="248" width="165" height="237" fill="#f4ede0"/><path d="M67 467V357Q70 283 130 280Q191 284 192 355V467Z" fill="#b18369"/><path d="M105 467V368Q105 316 143 314Q181 318 181 368V467" fill="#d5b8a0"/><circle cx="104" cy="323" r="24" fill="#c3c7ac"/><path d="M69 450Q124 412 194 429" fill="none" stroke="#705f50" stroke-width="2"/>
<rect x="639" y="218" width="121" height="170" fill="#bfb49d"/><rect x="644" y="223" width="111" height="160" fill="#e5e6d9"/><path d="M657 375V267H715V375Z" fill="#9ca88b"/><path d="M695 375V249H741V375Z" fill="#bec7ad"/><circle cx="713" cy="282" r="26" fill="#d8c4a6"/>
<path d="M52 525H90M52 533H112M646 413H690M646 420H706" stroke="#adac9c" stroke-width="2"/>
<path d="M36 81L99 113M756 81L695 113" stroke="#adae9f" stroke-width="2"/><path d="M89 107L105 116L98 128L81 119Z M686 116L701 107L709 119L692 128Z" fill="#9c9e90"/><path d="M94 127L35 247H218L100 125Z M693 127L625 225H766L701 125Z" fill="#fffdf1" opacity=".22"/>
<path d="M637 621L714 603L766 625L690 645Z" fill="#e8e5d9"/><path d="M637 621V789L690 815V645Z" fill="#d6d4c7"/><path d="M690 645V815L766 788V625Z" fill="#c5c8b8"/>
<path d="M677 606C636 553 659 488 696 488C735 488 746 547 719 567C696 584 674 558 689 539C700 525 715 539 708 550" fill="none" stroke="#9eac99" stroke-width="24" stroke-linecap="round"/>
<path d="M28 712H171L193 750H9Z" fill="#b6b4a3"/><path d="M26 751V827M172 751V827" stroke="#9f9e8b" stroke-width="7"/><ellipse cx="400" cy="932" rx="168" ry="27" fill="#a69e89" opacity=".11"/>`;}
function render(id,width=800,height=1000,fill=true){if(!scenes.some(s=>s.id===id))id='studio';width=Number(width)||800;height=Number(height)||1000;const p=`ms-${id}-${++serial}-`;const defs=`<defs>
<linearGradient id="${p}wall" x2=".9" y2="1"><stop stop-color="#f3eee5"/><stop offset="1" stop-color="#e9e4da"/></linearGradient>
<linearGradient id="${p}arch" x2="1" y2=".4"><stop stop-color="#d9d8c9"/><stop offset=".48" stop-color="#eeece1"/><stop offset="1" stop-color="#e4e2d6"/></linearGradient>
<linearGradient id="${p}floor" x2="0" y2="1"><stop stop-color="${id==='subway'?'#cacbbb':id==='greenhouse'?'#e2e3ce':'#e7e0d3'}"/><stop offset="1" stop-color="${id==='subway'?'#e2dfce':id==='greenhouse'?'#f0eddc':'#f1ebe1'}"/></linearGradient>
<linearGradient id="${p}glass" x2="1" y2="1"><stop stop-color="#e6edda"/><stop offset=".55" stop-color="#f3f2df"/><stop offset="1" stop-color="#d1ddc3"/></linearGradient>
<linearGradient id="${p}spacewall" x2="1" y2="1"><stop stop-color="#345253"/><stop offset="1" stop-color="#233c40"/></linearGradient>
<linearGradient id="${p}space" x2=".8" y2="1"><stop stop-color="#142932"/><stop offset="1" stop-color="#335854"/></linearGradient>
<linearGradient id="${p}deck" x2="0" y2="1"><stop stop-color="#304c4e"/><stop offset="1" stop-color="#496763"/></linearGradient>
<radialGradient id="${p}softfill"><stop stop-color="#e2ecd1" stop-opacity=".13"/><stop offset="1" stop-color="#e2ecd1" stop-opacity="0"/></radialGradient>
<pattern id="${p}tile" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#e9e1c8"/><path d="M0 0H80V40" fill="none" stroke="#d8d2b9" stroke-width="1"/><path d="M1 39H79" stroke="#f3ecd8" stroke-width="1"/></pattern>
</defs>`;let content=id==='subway'?subway(p):id==='greenhouse'?greenhouse(p):id==='orbit'?orbit(p,fill):id==='gallery'?gallery(p):studio(p);return defs+`<g transform="scale(${width/800} ${height/1000})">${content}</g>`;}
return {scenes,render};
});
