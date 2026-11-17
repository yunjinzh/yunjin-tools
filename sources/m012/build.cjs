const fs=require('fs'),path=require('path');
const root=__dirname;
let html=fs.readFileSync(path.join(root,'index.template.html'),'utf8');
for(const [token,file]of [['STYLE',path.join(root,'style.css')],['ZIP',path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'jszip/dist/jszip.min.js')],['CORE',path.join(root,'core.js')],['APP',path.join(root,'app.js')]]){
 const text=fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script');html=html.replace('/*'+token+'*/',()=>text);
}
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);console.log('Built standalone HTML:',Buffer.byteLength(html),'bytes');
