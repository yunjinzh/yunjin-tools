import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const maps=JSON.parse(await readFile('app/map-catalog.json','utf8'));
const credits=JSON.parse(await readFile('public/maps/credits.json','utf8'));
assert(maps.length>=20,'At least twenty map works are required');
assert.equal(new Set(maps.map(a=>a.id)).size,maps.length,'Duplicate map IDs');
assert.deepEqual(credits.works,maps,'Source archive must match displayed catalog');
function dimensions(bytes){
 assert.equal(bytes.readUInt16BE(0),0xffd8,'Invalid JPEG signature');
 for(let at=2;at<bytes.length;){
  assert.equal(bytes[at++],0xff,'Invalid JPEG segment');
  while(bytes[at]===0xff)at++;
  const marker=bytes[at++];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  const length=bytes.readUInt16BE(at);
  assert(length>=2&&at+length<=bytes.length,'Truncated JPEG');
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {height:bytes.readUInt16BE(at+3),width:bytes.readUInt16BE(at+5)};
  at+=length;
 }
 throw Error('Missing JPEG image frame');
}
let count=0,largest=0;
const paths=new Set();
for(const map of maps){
 for(const field of ['title','date','version','credit','source','rights'])assert(map[field],`${map.id}: missing ${field}`);
 assert(/^https:\/\//.test(map.source),`${map.id}: invalid source link`);
 for(const variant of ['thumb','preview','image']){
  const url=map[variant];assert(/^\/maps\/v2\/[a-z0-9-]+\.jpg$/.test(url),`${map.id}: nonlocal or unversioned image`);
  assert(!paths.has(url),'Duplicate image path');paths.add(url);
  const file=path.join('public',url);const bytes=await readFile(file);const size=(await stat(file)).size;const pixels=dimensions(bytes);
  assert(pixels.width>0&&pixels.height>0,`${url}: empty image`);
  if(variant==='image'){
   assert.equal(pixels.width,map.width);assert.equal(pixels.height,map.height);
   assert(Math.max(pixels.width,pixels.height)>=1900,`${map.id}: insufficient resolution`);
   assert(size<=4*1024*1024,`${map.id}: HD image exceeds loading budget`);largest=Math.max(largest,size);
  }
  count++;
 }
}
console.log(`Map validation passed: ${maps.length} works, ${count} valid JPEG assets, source metadata synchronized, largest HD ${(largest/1024/1024).toFixed(2)} MiB.`);
