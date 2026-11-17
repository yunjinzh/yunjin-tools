import fs from 'node:fs/promises';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/app.js'],bundle:true,minify:true,format:'iife',target:['es2020'],write:false,legalComments:'inline'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=(await fs.readFile('src/template.html','utf8')).replace('/*STYLE*/',await fs.readFile('src/style.css','utf8')).replace('/*SCRIPT*/',()=>js);
await fs.mkdir('dist',{recursive:true});await fs.writeFile('dist/index.html',html);
console.log(JSON.stringify({file:'dist/index.html',bytes:Buffer.byteLength(html),selfContained:true}));
