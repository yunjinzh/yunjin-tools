const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../dist/core.js');
const root=path.join(__dirname,'../dist');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('data/preset-manifest.json');
const world=read('data/world.json').features;
const china=read('data/china.json').features.filter(f=>typeof f.properties.adcode==='number');
const expected=[['CHN',null],...world.map(f=>[f.properties.code==='AUS'?'AUS':'country-'+f.properties.code,f]),...china.map(f=>['cn-'+f.properties.adcode,f])];
assert.equal(expected.length,57);
for(const [key,feature] of expected){
 const meta=manifest[key];assert.ok(meta,'Missing preset '+key);const grid=read(meta.path);
 assert.equal(grid.year,2020);assert.equal(grid.resolution,'1km');assert.deepEqual(meta.bbox,grid.bbox);
 for(const layer of ['dem','pop']){
  assert.equal(grid[layer].length,grid.width*grid.height,key+' '+layer+' size');
  assert.ok(grid[layer].every(v=>v===null||Number.isFinite(v)),key+' '+layer+' invalid values');
  let valid=0;
  for(let y=0;y<grid.height;y+=8)for(let x=0;x<grid.width;x+=8){
   const lon=grid.bbox[0]+(x+.5)/grid.width*(grid.bbox[2]-grid.bbox[0]),lat=grid.bbox[3]-(y+.5)/grid.height*(grid.bbox[3]-grid.bbox[1]);
   if(feature&&!C.contains(feature,lon,lat))continue;const v=grid[layer][y*grid.width+x];
   if(Number.isFinite(v)&&(layer==='pop'?v>=0:v!==-9999))valid++;
  }
  assert.ok(valid>0,key+' '+layer+' has no valid samples inside boundary');
 }
}
console.log('PASS: all 23 country and 34 provincial presets have matching 2020 / 1 km rasters with valid data inside their boundaries, including Taiwan, Hong Kong and Macao');
