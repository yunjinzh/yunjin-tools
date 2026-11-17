// Re-run the builder's functional suite against the exact emitted offline app.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const offlineDir=process.env.MUSEUM_OFFLINE_DIR||'offline-portable';
let test=fs.readFileSync(path.join(root,'test.mjs'),'utf8');
const old="fs.readFileSync(new URL('./dist/app.js',import.meta.url),'utf8').replace(/^import \\* as THREE[^\\n]*\\n/,'')";
if(!test.includes(old))throw Error('Functional harness source changed; review adaptation');
test=test.replace(old,"fs.readFileSync(new URL('./offline/index.html',import.meta.url),'utf8').match(/<script id=\"museum-app\">([\\s\\S]*?)<\\/script>/)[1]");
test=test.replace("fs.readFileSync(new URL('./dist/gallery-config.js',import.meta.url),'utf8')", "fs.readFileSync(new URL('./offline/index.html',import.meta.url),'utf8').split('<script id=\"museum-gallery-config\">')[1].split('</script>')[0]");
test=test.replace("fs.readFileSync(new URL('./dist/index.html',import.meta.url),'utf8')", "fs.readFileSync(new URL('./offline/index.html',import.meta.url),'utf8')");
if(!test.includes('window:{'))throw Error('Functional harness window shape changed; review adaptation');
test=test.replace('window:{','window:{MUSEUM_MAPS:data,');
test=test.replace("JSON.parse(fs.readFileSync(new URL('./dist/maps.json',import.meta.url),'utf8'))", "JSON.parse(fs.readFileSync(new URL('./offline/index.html',import.meta.url),'utf8').split('<script id=\"museum-offline-data\" type=\"application/json\">')[1].split('</script>')[0]).maps");
test=test.replace(/fetch:async\(\)=>\(\{ok:true,json:async\(\)=>(?:maps|data)\}\)/, "fetch:async()=>{throw Error('Offline build attempted fetch')}");
test=test.replaceAll('./offline/index.html','./'+offlineDir+'/index.html');
test=test.replaceAll('./dist/','../dist/').replaceAll('./'+offlineDir+'/','../'+offlineDir+'/');
const temp=path.join(root,offlineDir,'functional.verify.mjs');fs.writeFileSync(temp,test);
try{execFileSync(process.execPath,[temp],{stdio:'inherit'});}finally{fs.unlinkSync(temp)}
