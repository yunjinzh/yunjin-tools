const xml=s=>String(s??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let promise;
async function zip(){if(!window.JSZip){promise??=new Promise((ok,no)=>{const s=document.createElement('script');s.src='/jszip.min.js';s.onload=ok;s.onerror=()=>{promise=null;no(Error('导出组件加载失败，请重试'))};document.head.append(s)});await promise}return new window.JSZip()}
export function blobSave(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
export function csvFile(name,rows){const safe=s=>{let v=String(s??'');if(/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};blobSave(new Blob(['\ufeff'+rows.map(r=>r.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),name+'.csv')}
const header='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const pkg='http://schemas.openxmlformats.org/package/2006',doc='http://schemas.openxmlformats.org/officeDocument/2006/relationships',sheet='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
function rels(items){return header+'<Relationships xmlns="'+pkg+'/relationships">'+items.map(([i,t,target])=>'<Relationship Id="rId'+i+'" Type="'+doc+'/'+t+'" Target="'+target+'"/>').join('')+'</Relationships>'}
function types(items){return header+'<Types xmlns="'+pkg+'/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+items.map(([name,type])=>'<Override PartName="/'+name+'" ContentType="application/vnd.openxmlformats-officedocument.'+type+'"/>').join('')+'</Types>'}
export async function workbook(name,tables){
 const z=await zip(),rel=[],t=[['xl/workbook.xml','spreadsheetml.sheet.main+xml']];z.file('_rels/.rels',rels([[1,'officeDocument','xl/workbook.xml']]));
 let wb='';tables.forEach(([title,rows],i)=>{const n=i+1;wb+='<sheet name="'+xml(title)+'" sheetId="'+n+'" r:id="rId'+n+'"/>';rel.push([n,'worksheet','worksheets/sheet'+n+'.xml']);t.push(['xl/worksheets/sheet'+n+'.xml','spreadsheetml.worksheet+xml']);const col=k=>k<26?String.fromCharCode(65+k):'A'+String.fromCharCode(65+k-26);
 const specs=rows[0].map((x,k)=>'<col min="'+(k+1)+'" max="'+(k+1)+'" width="'+(/证据|文件|说明|结论|措施|SHA|来源|链接|内容/.test(x)?44:18)+'" customWidth="1"/>').join('');
 const body=rows.map((r,j)=>'<row r="'+(j+1)+'">'+r.map((v,k)=>typeof v==='number'?'<c r="'+col(k)+(j+1)+'"><v>'+v+'</v></c>':'<c r="'+col(k)+(j+1)+'" t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>').join('')+'</row>').join('');
 z.file('xl/worksheets/sheet'+n+'.xml',header+'<worksheet xmlns="'+sheet+'"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>'+specs+'</cols><sheetData>'+body+'</sheetData></worksheet>')});
 z.file('xl/workbook.xml',header+'<workbook xmlns="'+sheet+'" xmlns:r="'+doc+'"><sheets>'+wb+'</sheets></workbook>');z.file('xl/_rels/workbook.xml.rels',rels(rel));z.file('[Content_Types].xml',types(t));blobSave(await z.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),name+'.xlsx')
}
export async function wordFile(name,sections){
 const z=await zip();const para=(v,size=22,bold=false)=>'<w:p><w:pPr><w:spacing w:after="90"/></w:pPr><w:r><w:rPr>'+(bold?'<w:b/>':'')+'<w:rFonts w:eastAsia="微软雅黑"/><w:color w:val="'+(bold?'205140':'283A32')+'"/><w:sz w:val="'+size+'"/></w:rPr><w:t xml:space="preserve">'+xml(v)+'</w:t></w:r></w:p>';
 const body=para('苗苗汉字学习卡',42,true)+para(name,29,true)+sections.map(([title,items])=>para(title,28,true)+items.map(x=>para(x)).join('')).join('');
 z.file('word/document.xml',header+'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1100" w:bottom="1100" w:left="1300" w:right="1300"/></w:sectPr></w:body></w:document>');
 z.file('_rels/.rels',rels([[1,'officeDocument','word/document.xml']]));z.file('[Content_Types].xml',types([['word/document.xml','wordprocessingml.document.main+xml']]));blobSave(await z.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),name+'.docx')
}
