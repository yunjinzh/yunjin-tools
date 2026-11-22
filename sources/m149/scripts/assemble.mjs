import fs from 'node:fs';
const catalog=Object.fromEntries(['costumes','anime','portraits','expressions','hair','dynasties','scenes','poses'].map(t=>[t,JSON.parse(fs.readFileSync('data/'+t+'.json','utf8'))]));
const declarations={AGENT_INSTRUCTIONS:fs.readFileSync("docs/PROCESS-LOOK-TASKS.md","utf8"),CATALOG:catalog,HTML:fs.readFileSync('src/index.html','utf8'),CSS:fs.readFileSync('src/app.css','utf8'),JS:fs.readFileSync('src/app.js','utf8')};
fs.writeFileSync('worker/index.js',Object.entries(declarations).map(([k,v])=>'const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n'+fs.readFileSync('src/server.js','utf8'));
