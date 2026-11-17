export async function parseFile(file: File) {
  if(file.size>20*1024*1024)throw Error('单个文件上限为20MB。');
  const ext=file.name.split('.').pop()?.toLowerCase();
  const rows: {text:string,name:string,location:string}[]=[];
  const add=(text:string,location:string)=>{if(text.trim())rows.push({text:text.trim(),name:file.name,location});};
  if(['txt','md'].includes(ext||'')){
    const buf=await file.arrayBuffer();let text=new TextDecoder('utf-8').decode(buf);if(text.includes('\ufffd'))text=new TextDecoder('gb18030').decode(buf);text.split(/\n+/).forEach((t,i)=>add(t,'段落 '+(i+1)));
  }else if(ext==='pdf'){
    const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
    const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),cMapUrl:'/cmaps/',cMapPacked:true,standardFontDataUrl:'/standard_fonts/'}).promise;
    try{if(pdf.numPages>100)throw Error('PDF超过100页，请拆分后导入。');for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const data=await page.getTextContent();let txt='';for(const it of data.items){if('str' in it)txt+=it.str+(it.hasEOL?'\n':' ');}add(txt,'第 '+i+' 页');}}finally{await pdf.destroy();}
  }else if(['docx','pptx'].includes(ext||'')){
    const {unzipSync,strFromU8}=await import('fflate');let total=0;
    const zip=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:f=>{const wanted=ext==='docx'?/^word\/document.xml$/.test(f.name):/^ppt\/slides\/slide\d+\.xml$/.test(f.name);if(wanted){total+=f.originalSize;if(total>40*1024*1024)throw Error('文档解压文本过大。');}return wanted;}});
    const files=Object.keys(zip).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1]||0)-Number(b.match(/slide(\d+)/)?.[1]||0));
    for(const path of files){const xml=new DOMParser().parseFromString(strFromU8(zip[path]),'text/xml');if(xml.getElementsByTagName('parsererror').length)throw Error('文档XML格式错误。');const ps=Array.from(xml.getElementsByTagNameNS('*','p'));ps.forEach((p,i)=>{const text=Array.from(p.getElementsByTagNameNS('*','t')).map(n=>n.textContent||'').join('');add(text,ext==='docx'?'段落 '+(i+1):'幻灯片 '+(path.match(/slide(\d+)/)?.[1]||''));});}
  }else throw Error('支持 PDF、DOCX、PPTX、TXT、MD；旧版 DOC/PPT 请先另存为新格式。');
  if(!rows.length||rows.map(r=>r.text).join('').replace(/\s/g,'').length<10)throw Error('未提取到可用正文。扫描件或图片型文档需先做 OCR，再导入文字。');
  if(rows.reduce((n,r)=>n+r.text.length,0)>80000)throw Error('单份资料超过80,000字，请拆分后导入。');
  return rows;
}
