const fs=require('fs');
const base=__dirname;let html=fs.readFileSync(base+'/src/index.html','utf8');
const items={'STYLES':'src/styles.css','ZIP':'dist/vendor/jszip.min.js','PPTX':'dist/vendor/pptxgen.bundle.js','CORE':'src/core.js','EXPORTS':'src/exports.js','APP':'src/app.js'};
for(const [tag,path] of Object.entries(items)){let txt=fs.readFileSync(base+'/'+path,'utf8');if(tag!=='STYLES')txt=txt.replace(/<\/script/gi,'<\\/script');html=html.replace('/*'+tag+'*/',()=>txt);}
fs.writeFileSync(base+'/dist/index.html',html);console.log('Standalone HTML built: '+Buffer.byteLength(html)+' bytes');
