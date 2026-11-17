import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='dist/client';
const files=(await fs.readdir(root,{recursive:true})).filter(f=>/\.(js|css|svg|png|jpg|json|webmanifest|woff2?)$/.test(f)&&f!=='sw.js').sort();
const hash=crypto.createHash('sha256');for(const file of files){hash.update(file);hash.update(await fs.readFile(path.join(root,file)))}
const source=await fs.readFile('pwa/service-worker.js','utf8');hash.update(source);
const version=hash.digest('hex').slice(0,20),assets=files.map(f=>'/'+f);
await fs.writeFile(path.join(root,'sw.js'),source.replace('__VERSION__',JSON.stringify(version)).replace('__ASSETS__',JSON.stringify(assets)));
await fs.appendFile(path.join(root,'_headers'),'\n/sw.js\n  Cache-Control: no-cache\n  Service-Worker-Allowed: /\n/manifest.webmanifest\n  Cache-Control: no-cache\n');
console.log(`Offline shell ${version}: ${assets.length} precached assets; private APIs excluded.`);
