import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,outfile:'dist/app.js',format:'iife',target:['es2020'],minify:true,legalComments:'eof'});
await Promise.all(['index.html','style.css'].map(f=>copyFile('src/'+f,'dist/'+f)));
console.log('Built static Three.js app; all runtime dependencies bundled locally.');
