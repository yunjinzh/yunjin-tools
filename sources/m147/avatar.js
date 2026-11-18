(function(root){
'use strict';
let avatarSerial=0;
const n=id=>Number((id||'').split('-').pop());
const path=(d,f,stroke='#403b35',w=1.4,extra='')=>`<path d="${d}" fill="${f}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const line=(d,c='#403b35',w=1.4)=>path(d,'none',c,w);
const ellipse=(x,y,rx,ry,f,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${extra}/>`;
const circle=(x,y,r,f)=>ellipse(x,y,r,r,f);
function avatar(s){
 const renderId=`mirror-person-${++avatarSerial}`;
 const sl=s.slots,c=s.colors,masc=s.body==='masculine',h=n(sl.hair),t=n(sl.top),b=n(sl.bottom),shoe=n(sl.shoes),hat=n(sl.hat),neck=n(sl.necklace),hair=c.hair,skin=c.skin,ink='#52453d',metal=c.metal||'#b89a62',eye=n(sl.eyes),ear=n(sl.ears),mouth=n(sl.mouth),brow=n(sl.brow),wave=s.pose==='wave';
 const H=(d)=>path(d,hair,hair,1),seam=(d)=>line(d,ink,.9);
 // Local body adaptation broadens shoulders and straightens the waist while
 // keeping the neck, wrists, fingers, legs and attachment points in place.
 const torsoShape=d=>{if(!masc)return d;return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(_,xs,ys)=>{let x=Number(xs),y=Number(ys);let weight=y<150?0:y<195?(y-150)/45:y<250?1:y<365?1-(y-250)/115*.72:y<400?.28*(400-y)/35:0;weight*=Math.max(0,Math.min(1,(115-Math.abs(x-200))/30));return `${(200+(x-200)*(1+weight*.18)).toFixed(2)} ${y}`;});};
 let out=`<g stroke-linecap="round" stroke-linejoin="round">`;
 // Hair sits behind the face and the shoulders; all silhouettes are independent.
 if([11,12,15].includes(h)) out+=H(h===11?'M155 75 Q159 29 201 31 Q247 33 249 91 L255 310 Q232 329 218 307 L181 302 Q162 323 146 311Z':h===12?'M158 67 Q177 25 215 35 Q252 44 245 101 Q272 139 252 169 Q275 201 251 231 Q269 275 242 313 Q224 325 219 299 L178 292 Q148 314 139 286 Q119 248 144 215 Q122 181 148 151 Q133 115 158 67Z':hat===1?'M235 68 Q267 70 273 117 Q277 172 286 228 Q255 217 251 177 Q252 109 225 95Z':'M231 61 Q283 38 279 110 Q277 172 286 228 Q255 217 251 177 Q252 109 225 95Z');
 if(h===6)out+=H('M153 78 Q154 31 199 31 Q244 31 249 80 L254 167 Q226 184 202 173 Q179 183 145 168Z');
 if(h===18&&hat!==1) out+=H('M177 43 Q159 12 190 7 Q226 1 234 26 Q234 41 218 49Z');
 // Neck, sculpted shoulder line, and covered torso.
 out+=path(torsoShape('M181 137 L180 174 Q166 185 149 194 L162 296 L238 296 L251 194 Q233 185 220 174 L219 137Z'),skin,ink,1.2);
 out+=path('M184 145 Q201 164 218 145 L217 162 Q201 179 183 163Z','#b67d62','none',0,'opacity=".16"');
 out+=line('M175 179 Q187 189 198 185 M205 185 Q217 188 227 179','#bb8d72',1);
 // Bare forearms (clothed sleeves are painted later).
 out+=path(torsoShape('M151 195 Q135 204 131 237 L113 354 L105 438 Q102 461 110 472 Q116 478 119 469 L118 452 Q125 468 127 460 L126 439 L141 363 L167 249Z'),skin,ink,1.2);
 out+=wave?path(torsoShape('M244 195 Q261 203 269 237 L278 291 Q280 303 290 287 L313 229 L312 206 L307 187 Q310 178 315 188 L320 203 L321 177 Q325 169 328 178 L328 202 L335 181 Q341 176 341 185 L337 206 L348 194 Q354 192 352 200 L341 225 L306 312 Q288 346 268 321 L235 247Z'),skin,ink,1.2):path(torsoShape('M247 195 Q263 205 269 239 L287 354 L296 437 Q301 457 294 470 Q289 480 285 468 L286 451 Q278 466 276 459 L275 439 L261 366 L234 249Z'),skin,ink,1.2);
 // Adult leg proportions with subtle shading and knee marks.
 out+=path('M160 367 Q151 422 164 519 L168 639 L162 784 L187 787 L202 599 L207 455 L215 599 L217 786 L242 786 L238 636 L246 515 Q254 421 238 367Z',skin,ink,1.2);
 out+=path('M192 468 L190 604 L178 770 L185 772 L201 602 L207 459Z','#a77660','none',0,'opacity=".12"');
 out+=line('M173 595 Q182 601 191 596 M221 595 Q231 601 238 596','#bd8d75',1);
 // Shoes and shafts.
 const sc=c.shoes;[0,1].forEach(side=>{const x=side?223:175;let d='';
 if(shoe===18)d=`M${x-13} 640 L${x+17} 640 L${x+15} 786 Q${x+36} 799 ${x+31} 810 L${x-17} 810 L${x-18} 798Z`;
 else if(shoe===16)d=`M${x-13} 743 L${x+15} 743 L${x+15} 786 Q${x+35} 800 ${x+29} 811 L${x-18} 811 L${x-18} 798Z`;
 else if(shoe===10)d=`M${x-11} 779 Q${x+2} 801 ${x+14} 781 L${x+15} 793 L${x+39} 805 Q${x+41} 810 ${x+26} 812 L${x-16} 808 L${x-15} 798Z`;
 else d=`M${x-13} 780 Q${x} 790 ${x+13} 778 L${x+17} 790 Q${x+34} 794 ${x+33} 808 L${x-18} 808 L${x-18} 795Z`;
 out+=path(d,sc,ink,1.5);
 if(shoe===3||shoe===1)out+=path(`M${x-18} 804 L${x+34} 804 L${x+33} ${shoe===3?819:813} L${x-18} ${shoe===3?819:813}Z`,'#ece5da',ink,1.2)+line(`M${x-6} 788 l13 2 m-15 4 l15 2`, '#e8e1d5',2);
 if(shoe===6)out+=line(`M${x-11} 795 Q${x+6} 790 ${x+19} 797`,metal,2.4);
 if(shoe===10)out+=path(`M${x-16} 806 l2 15 h4 l2 -15Z`,sc,ink,1);
 if(shoe===16||shoe===18)out+=line(`M${x+8} ${shoe===18?651:753} L${x+8} 782`, '#8b7e6e',1.4);
 });
 // Six distinct lower garments.
 if(b===11){out+=path('M158 352 L240 352 L272 483 Q205 501 137 483Z',c.bottom,ink,1.6);for(let i=0;i<8;i++)out+=line(`M${163+i*10} 365 L${145+i*17} 485`,ink,.9);}
 else if(b===14)out+=path('M159 354 L239 354 Q249 469 255 566 L275 765 Q208 785 137 765 L154 557Z',c.bottom,ink,1.6)+seam('M177 387 Q175 566 158 756 M225 387 Q228 605 250 759 M202 444 L205 768');
 else if(b===16)out+=path('M159 354 L240 354 L264 663 Q210 696 143 671Z',c.bottom,ink,1.6)+path('M239 360 Q215 438 160 484 L145 669 Q205 630 256 577Z',c.bottom,ink,1.1)+seam('M233 374 Q212 435 181 466');
 else {const wide=b===2;out+=path(wide?'M158 353 L241 353 L250 516 L258 782 L210 784 L203 486 L190 784 L143 782 L151 522Z':'M158 353 L241 353 L243 505 L241 775 L211 777 L203 482 L190 776 L160 774 L155 510Z',c.bottom,ink,1.6);out+=seam('M159 375 L239 375 M202 377 L203 480 M170 380 Q171 409 157 413 M230 380 Q226 409 242 413');if(b===4){out+=path('M156 472 h32 v43 l-17 6 -17 -7Z',c.bottom,ink,1.3)+path('M216 472 h29 v43 l-15 6 -14 -7Z',c.bottom,ink,1.3)+seam('M157 480 h30 M217 480 h27');}if(b===1)out+=line('M167 433 L169 752 M235 434 L231 755','#aab1aa',.7);}
 out+=path('M159 352 L241 352 L241 367 L158 367Z',c.bottom,ink,1)+`<rect x="194" y="353" width="16" height="12" rx="2" fill="none" stroke="${metal}" stroke-width="2"/>`;
 // Upper garments: shape, construction and collars are different, not color swaps.
 let topPath;
 if(t===1)topPath='M177 176 Q161 181 145 193 L119 248 L146 260 L160 238 L160 360 Q200 370 240 360 L240 238 L255 260 L282 248 L256 194 Q239 180 222 176 Q201 203 177 176Z';
 if(t===6)topPath='M179 173 L147 192 Q137 207 130 249 L114 382 L137 388 L161 264 L158 359 Q201 377 244 359 L239 265 L263 389 L287 382 L269 249 Q264 209 253 193 L220 173Z';
 if(t===12)topPath='M179 171 Q199 157 223 171 L256 188 Q273 206 279 253 L292 383 L263 391 L240 271 L247 371 Q200 380 153 371 L159 272 L138 391 L108 383 L123 253 Q131 209 145 191Z';
 if(t===13)topPath='M179 157 L221 157 L224 181 L251 191 Q265 208 271 244 L288 384 L264 389 L240 265 L241 361 Q199 370 158 361 L160 265 L137 389 L112 384 L129 242 Q136 206 148 193 L177 181Z';
 if(t===15)topPath='M179 173 L149 188 Q138 204 133 242 L114 388 L138 392 L163 263 L153 386 L194 385 L202 372 L210 385 L250 386 L237 265 L262 392 L286 388 L269 241 Q264 203 253 189 L221 173Z';
 if(t===19)topPath='M178 172 L148 188 L119 232 L109 316 L145 327 L162 246 L155 364 Q200 373 246 364 L239 246 L260 328 L295 317 L282 230 L253 189 L222 172Z';
 if(wave){const raisedSleeves={
6:['L239 265 L263 389 L287 382 L269 249 Q264 209 253 193','L239 265 L266 319 Q288 340 308 314 L329 261 L305 249 L290 287 L279 247 Q268 208 253 193'],
12:['L263 391 L240 271','L306 314 Q288 340 266 319 L240 271'],
13:['L288 384 L264 389 L240 265','L279 291 Q280 303 290 287 L305 249 L329 261 L307 314 Q287 339 266 319 L240 265'],
15:['L237 265 L262 392 L286 388 L269 241 Q264 203 253 189','L237 265 L266 319 Q287 339 307 313 L329 260 L305 247 L289 286 L278 243 Q266 204 253 189'],
19:['L239 246 L260 328 L295 317 L282 230','L239 246 L265 313 Q286 335 308 306 L324 272 L291 255 L282 230']};
if(raisedSleeves[t])topPath=topPath.replace(...raisedSleeves[t]);
if(t===12)topPath=topPath.replace('Q273 206 279 253 L292 383','Q273 206 279 253 L289 287 L304 246 L330 260');
}
 out+=path(torsoShape(topPath||''),c.top,ink,1.6);
 if(t===1)out+=line('M178 179 Q201 208 221 179 M126 243 L145 251 M257 251 L276 243 M162 353 Q201 362 237 353',ink,1.1);
 if(t===6){out+=path('M180 173 L199 192 L186 217 L168 185Z','#eee8dc',ink,1)+path('M220 173 L202 192 L216 217 L233 185Z','#eee8dc',ink,1)+line('M202 194 L202 365',ink,1);for(let y=228;y<349;y+=29)out+=circle(208,y,1.8,metal);out+=path('M219 229 h17 v28 q-8 9 -17 0Z',c.top,ink,1);}
 if(t===12)out+=path('M179 171 Q159 163 160 190 Q170 216 199 220 Q228 213 242 190 Q237 165 221 171 Q204 200 179 171Z',c.top,ink,1.3)+line('M187 207 L182 256 M216 207 L222 255', '#eee6d9',2.3)+path('M178 296 L225 296 L238 339 Q204 351 166 339Z',c.top,ink,1)+line('M157 361 Q201 370 243 361',ink,1.2);
 if(t===13){out+=line('M179 165 L221 165 M179 173 L221 173 M167 219 L164 350 M179 222 L178 356 M192 223 L192 357 M207 223 L207 357 M220 222 L222 356 M232 219 L236 350',ink,.6);out+=line(wave?'M120 374 L135 377 M307 254 L323 263':'M120 374 L135 377 M266 378 L281 375',ink,1);}
 if(t===15)out+=path('M179 175 L202 216 L222 175 L216 300 L200 343 L182 296Z','#e6dfd3',ink,1)+path('M178 177 L165 216 L177 229 L170 244 L201 335 L193 235Z',c.top,ink,1.1)+path('M223 177 L237 216 L224 229 L230 244 L201 335 L210 235Z',c.top,ink,1.1)+circle(207,344,3,metal)+line('M164 320 L184 320 M220 320 L241 320',ink,1.4);
 if(t===19){out+=line('M181 175 Q210 202 233 222 L218 250 L183 275',metal,3)+line('M178 176 L219 220 L207 236',ink,.8);for(let y=239;y<281;y+=15)out+=path(`M217 ${y} q10 -5 11 0 q-3 7 -11 0`,'none',metal,2);out+=line('M115 304 L144 314 M263 314 L289 305',metal,2);}
 // Pendant necklaces remain equipped behind a high collar.
 if(neck&&!(t===13&&[3,4].includes(neck))){if(neck===3){for(let i=0;i<13;i++){let a=Math.PI*i/12;out+=circle(201-23*Math.cos(a),184+18*Math.sin(a),3.4,'#f7ecd6');}}else if(neck===4)out+=path('M179 173 Q200 184 221 173 L221 181 Q200 191 179 181Z','#4e4140',ink,.7);else if(neck===6)out+=line('M178 181 Q179 228 200 238 Q222 225 223 181',metal,1.7)+path('M204 236 Q192 235 194 247 Q201 255 208 247 Q199 248 204 236Z',metal,metal,.4);else out+=line('M177 182 L201 242 L224 182 M201 242 L201 284',metal,1.7)+circle(201,285,3,metal);}
 // Wrist, finger, and ear jewelry use independent slots.
 if(sl.wrist){const beads=n(sl.wrist)===13;out+=beads?Array.from({length:5},(_,i)=>circle(109+i*3.6,430,2.8,metal)).join(''):line('M107 429 L124 432',metal,5);}
 if(sl.ring)out+=line('M109 458 L117 458',metal,2)+(n(sl.ring)===19?ellipse(113,456,3,4,'#54837b'):'');
 // Face and actual ear contours.
 [false,true].forEach(right=>{let transform=right?'translate(400 0) scale(-1 1)':'';out+=`<g transform="${transform}">`+path(ear===17?'M160 102 L128 82 Q133 118 158 129Z':ear===3?'M161 100 Q138 90 144 117 Q148 133 161 125Z':ear===12?'M161 102 Q145 94 146 115 Q148 124 151 134 Q160 139 161 124Z':'M161 102 Q148 96 149 114 Q150 129 162 124Z',skin,ink,1)+line(ear===17?'M153 109 L139 96 L153 120':'M156 108 Q150 106 154 120','#b98166',1)+`</g>`;});
 out+=path(masc?'M160 76 Q160 39 201 40 Q242 41 241 77 L238 125 L224 146 Q203 159 182 146 L165 128Z':'M160 76 Q159 41 199 40 Q242 39 242 77 L237 122 Q228 147 201 156 Q174 147 164 122Z',skin,ink,1.2);
 out+=path('M162 78 Q161 117 178 136 L195 151 Q173 144 165 126Z','#a76c56','none',0,'opacity=".12"');
 out+=ellipse(174,119,9,4,'#d58575','opacity=".19"')+ellipse(226,119,9,4,'#d58575','opacity=".19"');
 // Eyes have distinct silhouette; paired with fine lashes, iris and highlights.
 [false,true].forEach(right=>{out+=`<g ${right?'transform="translate(400 0) scale(-1 1)"':''}>`;let d=eye===2?'M169 103 Q178 91 189 102 Q181 114 169 103Z':eye===6?'M167 98 Q179 96 190 103 Q179 110 167 98Z':eye===12?'M168 103 Q179 100 190 103 Q181 111 168 103Z':'M168 103 Q178 94 190 103 Q180 111 168 103Z';out+=path(d,'#f8f4e9',ink,.9)+`<defs><clipPath id="${renderId}-eye-${right?1:0}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${renderId}-eye-${right?1:0})">`+ellipse(180,103,3.8,eye===12?3.2:4.6,c.eyes)+ellipse(180,103,1.6,3,'#302f2a')+circle(178.5,101.3,1.2,'#fffaf0')+'</g>'+line(eye===6?'M165 95 L169 99 Q180 96 190 103':'M166 101 L169 103 Q179 94 190 103',ink,1.4);let bd=brow===6?'M169 89 Q179 81 190 88':brow===11?'M167 89 L177 83 L190 89':brow===17?'M169 87 L178 86 M183 86 L191 88':'M168 87 Q178 84 190 87';out+=line(bd,c.brow,brow===1?3:1.8)+`</g>`;});
 out+=line('M202 105 L198 120 Q201 123 205 120','#ac7964',1.1)+line('M196 124 Q201 126 206 124','#ca9c83',.7);
 out+=path(mouth===4?'M187 134 Q194 129 201 132 Q207 129 215 134 Q201 148 187 134Z':mouth===9?'M190 134 Q197 127 201 132 Q206 126 212 134 Q202 144 190 134Z':mouth===16?'M188 132 Q201 137 214 131 Q203 145 188 132Z':'M188 134 Q195 131 201 133 Q207 131 214 134 Q202 141 188 134Z',c.mouth,'none',0)+line('M190 134 Q201 137 212 134','#8d5550',.7)+line('M198 139 L205 139','#ffe1ce',.7);
 // Fringe is separate from back hair; hat-safe top silhouette.
 const fringes={2:'M158 91 L155 67 Q159 33 198 31 Q236 30 247 63 L240 97 L229 74 L215 65 L209 77 L198 62 L183 78 L179 66 L168 89Z',6:'M154 106 L153 71 Q154 30 199 30 Q244 31 249 75 L247 126 L236 127 L231 76 Q204 89 175 74 L167 126 L154 127Z',11:'M153 91 Q152 33 198 30 Q243 30 248 79 L244 171 L232 171 L232 80 L220 82 L220 72 L212 82 L178 82 L175 72 L169 82 L169 171 L156 171Z',12:'M156 95 Q141 62 173 39 Q202 18 230 44 Q252 56 244 94 Q227 83 220 58 Q195 96 157 112Z',15:'M158 100 Q149 68 169 44 Q196 21 226 40 Q249 57 242 103 L231 80 Q209 76 201 58 Q187 80 166 88Z',18:'M158 98 Q147 66 166 43 Q198 24 227 43 Q252 63 242 100 L231 79 Q210 67 199 50 Q185 77 168 83Z'};
 out+=H(fringes[h]||fringes[6]);
 out+=line(h===11?'M161 66 Q166 42 190 38 M239 91 L242 159':h===12?'M161 84 Q183 67 205 41 M233 114 Q249 146 238 166':'M162 63 Q172 43 194 39 M219 42 Q236 49 239 64','#a99580',.7);
 if(sl.earjewel){[153,247].forEach(x=>{out+=n(sl.earjewel)===3?ellipse(x,133,6,10,'none',`stroke="${metal}" stroke-width="2.5"`):circle(x,128,3.4,'#f3e7cc');});}
 if(sl.glasses){if(n(sl.glasses)===6)out+=`<g fill="none" stroke="${metal}" stroke-width="1.8"><circle cx="179" cy="104" r="14"/><circle cx="222" cy="104" r="14"/><path d="M193 103 Q200 99 208 103 M165 100 L157 97 M236 100 L242 97"/></g>`;else out+=path('M160 95 L192 99 Q195 118 175 114Z','#3b4541',metal,1.5)+path('M209 99 L241 95 L226 114 Q207 119 209 99Z','#3b4541',metal,1.5)+line('M192 101 Q201 97 210 101',metal,2);}
 if(hat===1)out+=path('M151 59 Q144 31 187 25 Q206 8 239 29 Q261 42 243 61 L230 67 L161 65Z','#756d5d',ink,1.5)+path('M157 58 Q198 64 239 57 L238 67 Q194 74 158 67Z','#585244',ink,1);
 if(hat===5)out+=path('M155 70 Q190 32 242 70 L239 80 Q199 47 160 81Z','#e3b59b',ink,1)+path('M193 49 Q181 28 174 40 Q175 56 199 60 Q217 34 223 43 Q218 60 202 61Z','#e3b59b',ink,1);
 if(sl.bag){const messenger=n(sl.bag)===11;out+=line('M151 194 L258 398', '#674e3e',8)+line('M151 194 L258 398','#ae8b65',5)+path(messenger?'M232 366 L286 370 L294 439 Q267 451 234 441Z':'M241 365 L282 367 L288 409 Q263 423 240 412Z','#a78a62',ink,1.5)+path(messenger?'M232 367 L287 370 L281 399 L238 398Z':'M241 366 L282 368 L277 389 L244 389Z','#b79b71',ink,1.3)+`<rect x="258" y="389" width="8" height="10" fill="${metal}" stroke="${ink}" stroke-width="1"/>`;}
 if(sl.held){if(n(sl.held)===16)out+=path('M290 449 L279 374 Q320 366 343 406Z','#dbbda0',ink,1.4)+Array.from({length:6},(_,i)=>line(`M290 449 L${280+i*12} ${374+i*i*1.3}`, '#917e66',.8)).join('');else {out+=path('M287 447 L267 391 L321 393Z','#b6c1a6',ink,1);for(let i=0;i<7;i++){let x=273+(i%3)*17,y=378-Math.floor(i/3)*13;out+=line(`M287 444 L${x} ${y}`,'#668069',2)+ellipse(x-4,y+3,11,5,'#718570')+circle(x,y,9,i%2?'#ead4bd':'#c78a7d')+circle(x-2,y-2,4,'#f0d8c1');}}}
 out+='</g>';
 // Poses are deliberately illustrated 2D gestures, not simulated 3D views.
 if(s.pose==='lean')out=`<g transform="rotate(-2.5 200 800)">${out}</g>`;
 if(s.pose==='turn')out=`<g transform="rotate(2.2 200 800) translate(200 0) scale(.93 1) skewX(-1.2) translate(-200 0)">${out}</g>`;
 return `<g transform="translate(${masc?-4:0} 0) scale(${masc?1.02:1} 1)">${out}</g>`;
}
function frame(s,{width=800,height=1000,background=true}={}){
 const landscape=width>height;let v=s.framing==='face'?[100,0,200,250]:s.framing==='half'?[85,0,230,480]:[0,0,400,850];
 let area=landscape?{x:width*.29,y:height*.04,w:width*.42,h:height*.92}:{x:width*.18,y:height*.07,w:width*.64,h:height*.88};
 const art=`<svg x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" viewBox="${v.join(' ')}" preserveAspectRatio="xMidYMax meet">${avatar(s)}</svg>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="当前角色造型预览">${background&&root.MirrorScenes?root.MirrorScenes.render(s.scene,width,height,s.fill):`<rect width="100%" height="100%" fill="#eae7df"/>`}${art}</svg>`;
}
function thumbnail(s,category,item){let v={hair:'116 0 180 205',brow:'148 71 104 40',eyes:'152 83 96 40',ears:'124 76 153 74',mouth:'177 121 48 31',jewelry:item.slot==='wrist'?'90 390 55 85':item.slot==='ring'?'92 433 42 44':'132 96 139 62',necklace:'161 159 80 138',accessory:item.slot==='hat'?'128 0 149 120':item.slot==='glasses'?'149 78 105 57':item.slot==='bag'?'218 345 90 120':'251 340 110 134',top:'95 155 205 250',bottom:'119 340 165 452',shoes:'142 635 132 199'}[category];let copy=JSON.parse(JSON.stringify(s));copy.slots[item.slot]=item.id;copy.pose='relaxed';copy.body='feminine';if(['hair','brow','eyes','ears','mouth'].includes(category)){copy.slots.hat=null;copy.slots.glasses=null;copy.slots.earjewel=null;}if(category==='necklace')copy.slots.top='top-01';if(category==='shoes')copy.slots.bottom='bottom-11';return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v}" aria-hidden="true">${avatar(copy)}</svg>`;}
root.MirrorArt={avatar,frame,thumbnail};if(typeof module!=='undefined')module.exports=root.MirrorArt;
})(typeof window!=='undefined'?window:globalThis);
