import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
const bundle=await build({entryPoints:['src/game.js'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],write:false,legalComments:'inline'});
const html=await readFile('src/index.html','utf8');
const css=await readFile('src/fonts.css','utf8')+'\n'+await readFile('node_modules/leaflet/dist/leaflet.css','utf8')+'\n'+await readFile('src/style.css','utf8');
const script=bundle.outputFiles[0].text.replaceAll('</script','<\\/script');
await writeFile('dist/index.html',html.replace('<!--STYLE-->',()=>`<style>${css}</style>`).replace('<!--SCRIPT-->',()=>`<script>${script}</script>`));
console.log('Built self-contained dist/index.html');
