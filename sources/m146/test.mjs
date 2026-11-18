import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const d='dist/',col={window:{}};vm.runInNewContext(fs.readFileSync(d+'data.js','utf8'),col);
const levels=col.window.LEVELS,data=levels.flatMap(l=>l.cards);assert.equal(levels.length,8);assert.equal(data.length,414);assert.equal(new Set(data.map(c=>c.id)).size,414);
for(const c of data){assert(c.char.length===1&&c.pinyin&&/^\d{4}$/.test(c.id));const f=fs.readFileSync(d+'cards/'+c.id+'.webp');assert.equal(f.subarray(8,12).toString(),'WEBP')}
const app=fs.readFileSync(d+'app.js','utf8'); const clues=vm.runInNewContext(app.match(/const clues=(\[[\s\S]*?\n\]);/)[1]);assert.equal(clues.length,8);
for(let i=0;i<8;i++){assert.equal(clues[i].length,3);for(const [a,p,opts] of clues[i]){assert(p&&opts.includes(a)&&new Set(opts).size===3);for(const ch of opts)assert(levels[i].cards.some(c=>c.char===ch),'missing clue '+ch+' at '+i);}}
const html=fs.readFileSync(d+'index.html','utf8');for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(m[1].startsWith('#'))continue;assert(fs.existsSync(d+m[1]));assert(!m[1].includes('://'))}
for(const name of ['vendor/three.js','soft3d.js','world.js','app.js'])new vm.Script(fs.readFileSync(d+name,'utf8'));
console.log('PASS: 8 levels, 414 unique records, 414 WebP headers, all 24 clue answer/choices in matching levels, local entry dependencies and JS parse.');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML id (including SVG symbols)');
const chunks=vm.runInNewContext("const L=levels,byId=new Map(levels.flatMap((s,li)=>s.cards.map((c,i)=>[c.id,{...c,li,i}])));"+app.slice(app.indexOf("const route=[]"),app.indexOf("let storeOK="))+";({route,chapters})",{levels});
assert.equal(chunks.route.length,414);assert.equal(new Set(chunks.route.map(c=>c.id)).size,414);assert.equal(chunks.chapters.length,107);assert(chunks.chapters.every(x=>x.n>=1&&x.n<=4));
for(const f of ['road.js','scenery.js','soft3d.js'])new vm.Script(fs.readFileSync(d+f,'utf8'));
console.log('PASS: unique HTML ids, 414 distinct roadside cards across 107 stretches, all runtime modules parse.');
