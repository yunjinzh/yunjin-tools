const fs=require('fs'),path=require('path'),assert=require('assert');
const Zip=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'jszip'));
const C=require('./core.js');
const inputDir=process.env.CONTRACT_TEST_INPUT_DIR;
const outputDir=process.env.CONTRACT_TEST_OUTPUT_DIR;
const clone=x=>JSON.parse(JSON.stringify(x));
const src=(file,headers,rows)=>({fileName:file,sheetName:'Sheet1',headerRow:1,headers:headers.map((label,i)=>({key:C.col(i),label})),rows:rows.map((cells,i)=>({row:i+2,cells:Object.fromEntries(cells.map((x,k)=>[C.col(k),x]))})),issues:[]});
function fixture(){return {list:src('list.xlsx',['销售合同编码'],[['X1'],['X2']]),ar:src('ar.xlsx',['合同编号','合同名称','甲方名称','合同金额','销售部门','销售人员','项目编码','项目状态'],[['X1','同名项目','客户A',100,'销售','甲','P1','在建'],['X2','同名项目','客户B',200,'销售','乙','P2','在建']]),ap:src('ap.xlsx',['项目编码','项目经理','供应商','合同总金额','应付合同编号','应付合同名称'],[['P1','经理甲','供应商A',20,'Y1','采购A'],['P2','经理乙','供应商B',30,'Y2','采购B']])};}
function verify(name,fn){fn();console.log('PASS',name);}
async function main(){
verify('same-name aggregation',()=>{const r=C.run(fixture(),C.defaultConfig());assert.equal(r.stats.matchedAR,2);assert.equal(r.groups.length,1);assert.equal(r.groups[0].total,5000);assert.equal(r.contracts[0].ratio,.5);assert.equal(r.contracts[1].ratio,.25);});
verify('group by contract number',()=>{const c=C.defaultConfig();c.aggregate.group='合同编号';const r=C.run(fixture(),c);assert.equal(r.groups.length,2);assert.equal(r.contracts[0].ratio,.2);assert.equal(r.contracts[1].ratio,.15);});
verify('ambiguous receivable is not selected',()=>{const s=fixture();s.ar.rows.push({...clone(s.ar.rows[0]),row:20});const r=C.run(s,C.defaultConfig());assert.equal(r.stats.matchedAR,1);assert(r.logs.some(x=>x.code==='AR_KEY_AMBIGUOUS'));});
verify('blank project does not match blanks',()=>{const s=fixture();s.ar.rows[0].cells.G='';s.ap.rows[0].cells.A='';const r=C.run(s,C.defaultConfig());assert.equal(r.contracts[0].payables.length,0);assert.equal(r.contracts[0].ratio,null);assert(r.logs.some(x=>x.code==='PROJECT_EMPTY'));});
verify('exact duplicate payable counted once',()=>{const s=fixture();s.ap.rows.push({...clone(s.ap.rows[0]),row:30});const r=C.run(s,C.defaultConfig());assert.equal(r.stats.payableUnique,2);assert.equal(r.groups[0].total,5000);assert(r.logs.some(x=>x.code==='AP_DUPLICATE_REMOVED'));});
verify('conflicting payable suppresses group total',()=>{const s=fixture();const p=clone(s.ap.rows[0]);p.row=30;p.cells.D=45;s.ap.rows.push(p);const r=C.run(s,C.defaultConfig());assert.equal(r.groups[0].total,null);assert.equal(r.contracts[0].ratio,null);assert(r.logs.some(x=>x.code==='AP_DUPLICATE_CONFLICT'));});
verify('invalid payable amount stays unavailable',()=>{const s=fixture();s.ap.rows[0].cells.D='金额待定';const r=C.run(s,C.defaultConfig());assert.equal(r.groups[0].total,null);assert.equal(r.contracts[0].payables[0].cents,null);assert(r.logs.some(x=>x.code==='AP_AMOUNT_INVALID'));});
verify('same payable ID in different projects is flagged',()=>{const s=fixture();s.ap.rows[1].cells.E='Y1';const r=C.run(s,C.defaultConfig());assert.equal(r.stats.payableUnique,0);assert.equal(r.groups[0].total,null);assert(r.logs.some(x=>x.code==='AP_ID_PROJECT_CONFLICT'));});
verify('zero payable is preserved, zero denominator is guarded',()=>{const s=fixture(),c=C.defaultConfig();c.aggregate.group='合同编号';s.ap.rows[0].cells.D=0;s.ar.rows[1].cells.D=0;const r=C.run(s,c);assert.equal(r.contracts[0].ratio,0);assert.equal(r.contracts[1].ratio,null);});
verify('shared project deduplicates within group',()=>{const s=fixture();s.ar.rows[1].cells.G='P1';const r=C.run(s,C.defaultConfig());assert.equal(r.stats.payableUnique,1);assert.equal(r.stats.payableLinks,2);assert.equal(r.groups[0].total,2000);assert(r.logs.some(x=>x.code==='PROJECT_SHARED'));});
verify('input duplicate and unmatched retained in log',()=>{const s=fixture();s.list.rows.push({row:4,cells:{A:'X1'}},{row:5,cells:{A:'X3'}});const r=C.run(s,C.defaultConfig());assert.equal(r.stats.uniqueCodes,3);assert.equal(r.stats.unmatchedAR,1);assert(r.logs.some(x=>x.code==='LIST_DUPLICATE'));});
verify('custom mapping and monetary parsing',()=>{assert.deepEqual(C.parseMoney('￥1,234.50'),{ok:true,cents:123450});assert.deepEqual(C.parseMoney('(120.00)'),{ok:true,cents:-12000});const c=C.defaultConfig();c.columns=[{name:'编号',source:'ar',field:'合同编号',format:'text'},{name:'自定义',source:'fixed',field:'测试',format:'text'},{name:'汇总',source:'total',field:'',format:'money'}];assert.deepEqual(C.run(fixture(),c).records[0].values,['X1','测试',50]);});
verify('invalid configuration blocks export',()=>{const c=C.defaultConfig();c.joins.arKey='不存在';assert(C.run(fixture(),c).fatal);assert(C.run({},c).fatal);});
const sources={};
if(inputDir){
 const files={list:'XS合同编码.xlsx',ar:'应收删减（1017）.xlsx',ap:'应付合同列表 (1017).xlsx'};
 for(const [kind,name]of Object.entries(files)){const book=await C.openXlsx(fs.readFileSync(path.join(inputDir,name)),name,Zip);const sheet=await book.getSheet(0);sources[kind]=C.prepareSource(book,sheet,C.detectHeader(sheet));console.log('INPUT',kind,sources[kind].headerRow,sources[kind].rows.length);}
 const result=C.run(sources,C.defaultConfig());
 assert.equal(result.stats.uniqueCodes,187);assert.equal(result.stats.matchedAR,182);assert.equal(result.stats.payableUnique,321);assert.equal(result.stats.outputRows,375);assert.equal(result.stats.withoutAP,49);assert.equal(result.stats.unmatchedAR,5);assert.equal(result.stats.sharedGroups,4);assert.equal(result.stats.over100,15);assert.equal(result.stats.arTotal,176772715.76);assert.equal(result.stats.payableTotal,91346378.78);assert.equal(result.stats.errors,0);
 assert.equal(result.logs.filter(x=>x.code==='AR_MATCHED').length,182);assert.equal(result.logs.filter(x=>x.code==='AP_MATCHED').length,321);
 console.log('PASS original-three-workbooks',JSON.stringify(result.stats));
 const bytes=await C.exportXlsx(result,Zip);const book=await C.openXlsx(bytes,'output.xlsx',Zip);
 assert.equal(book.sheets.length,3);const sheet=await book.getSheet(0);const rows=new Map(sheet.rows.map(r=>[r.row,r.cells]));assert.equal(rows.get(5).A,'FDKJ-XS-202402-003');assert.equal(rows.get(5).N,1852452.83);assert(Math.abs(rows.get(5).O-1.1261111428571429)<1e-12);
 assert.equal(rows.get(7).A,'FDKJ-KC-202606-006');assert.equal(rows.get(7).D,undefined);
 console.log('PASS exported workbook cached values, merged result, and unmatched blanks');
 if(outputDir){fs.mkdirSync(outputDir,{recursive:true});fs.writeFileSync(path.join(outputDir,'示例运行_合同汇总.xlsx'),bytes);fs.writeFileSync(path.join(outputDir,'示例运行_处理日志.txt'),'\ufeff'+C.logsTXT(result));fs.writeFileSync(path.join(outputDir,'示例运行_处理日志.csv'),C.logsCSV(result));fs.writeFileSync(path.join(outputDir,'验证结果.json'),JSON.stringify({version:C.VERSION,stats:result.stats,checks:15},null,2));fs.writeFileSync(path.join(outputDir,'默认字段配置.json'),JSON.stringify(C.defaultConfig(),null,2));}
}
}
main().catch(e=>{console.error(e);process.exitCode=1});
