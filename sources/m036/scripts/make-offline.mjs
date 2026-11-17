import {readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist/client');
const assets=['/'];
async function walk(dir){
 for(const file of await readdir(dir,{withFileTypes:true})){
  if(file.name.startsWith('.'))continue;
  const p=path.join(dir,file.name);
  if(file.isDirectory())await walk(p);
  else if(!p.endsWith('.map')&&!p.endsWith('offline-manifest.json')&&!p.endsWith('sw.js'))assets.push('/'+path.relative(root,p).split(path.sep).join('/'));
 }
}
await walk(root);
await writeFile(path.join(root,'offline-manifest.json'),JSON.stringify({assets}));
console.log(`Offline exhibition: ${assets.length} local resources.`);
