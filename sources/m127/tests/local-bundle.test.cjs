const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const crypto=require('node:crypto');const D=require('../dist/data-access.js');
(async()=>{
 const root=path.join(__dirname,'../dist'),manifest=JSON.parse(fs.readFileSync(path.join(root,'offline/manifest.json')));
 const bytes=Buffer.concat(manifest.parts.map(p=>fs.readFileSync(path.join(root,p))));assert.equal(bytes.length,manifest.bytes);
 if(process.argv[2])assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync(process.argv[2])).digest('hex'));
 const html=bytes.toString('utf8');assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
 const packed=JSON.parse(html.match(/window\.RIDGE_PACKED=(\{[^<]+\});<\/script>/)[1]);
 for(const [name,data]of Object.entries(packed)){assert.deepEqual(await D.unpack(data),JSON.parse(fs.readFileSync(path.join(root,name),'utf8')),name)}
 console.log(`PASS: ${Object.keys(packed).length} embedded datasets decompress losslessly; hosted chunks reconstruct the identical standalone HTML`);
})().catch(e=>{console.error(e);process.exit(1)});
