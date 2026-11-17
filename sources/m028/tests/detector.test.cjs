const assert=require('node:assert/strict'),D=require('../dist/detector.js');
const tiles=D.regions(3840,2160,'auto');assert.equal(tiles.length,16);assert.equal(D.regions(1280,720,'normal').length,1);
// Original-coordinate overlap is merged even when a vehicle's fine class changes between crops.
let items=[{class:'truck',score:.9,bbox:[100,100,100,200],edge:false},{class:'car',score:.7,bbox:[102,99,101,202],edge:false},{class:'car',score:.8,bbox:[400,100,100,200],edge:false},{class:'person',score:.85,bbox:[110,100,30,150],edge:false}];
assert.equal(D.merge(items).length,3);assert.equal(D.merge(items).filter(x=>x.class==='truck').length,1);
// A border fragment must not become a second vehicle; a separate nearby vehicle remains.
items.push({class:'truck',score:.65,bbox:[100,110,45,80],edge:true});assert.equal(D.merge(items).length,3);
// The tile grid covers every part of the frame and stays inside its source dimensions.
for(let y=0;y<2160;y+=80)for(let x=0;x<3840;x+=80)assert(tiles.slice(1).some(t=>x>=t.x&&x<t.x+t.w&&y>=t.y&&y<t.y+t.h));
assert(tiles.every(t=>t.x>=0&&t.y>=0&&t.x+t.w<=3840&&t.y+t.h<=2160));
console.log('PASS: aerial frame coverage, original-coordinate vehicle deduplication, edge fragments, person/vehicle separation');
