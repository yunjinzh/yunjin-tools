import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const temporary=await mkdtemp(join(tmpdir(),'compliance-filter-export-'));
try{
 const input=`export {selectWorkspace} from './lib/filter.ts'; export {buildExport} from './lib/export.ts'; export {tasks,defaultReview,defaultSettings} from './lib/model.ts';`;
 await build({stdin:{contents:input,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:join(temporary,'module.mjs'),logLevel:'silent'});
 const {selectWorkspace,buildExport,tasks,defaultReview,defaultSettings}=await import(pathToFileURL(join(temporary,'module.mjs')).href);
 const sample=[{id:'e1',task_id:'T01',resource_id:'student',name:'学生任务书',note:'校本任务资料',url:'https://example.org/student',size:0,created_at:'2026-11-16',actor:'QA'}, {id:'e2',task_id:'T01',resource_id:'rights',name:'授权证据 alpha',note:'权利方授权范围',url:'https://example.org/rights',size:0,created_at:'2026-11-16',actor:'QA'}, {id:'e3',task_id:'GLOBAL',resource_id:'review',name:'学校流程正式记录',note:'全局审核',url:'https://example.org/school',size:0,created_at:'2026-11-16',actor:'QA'}];
 const records={T01:defaultReview('T01')};
 const choose=(view,filters={})=>selectWorkspace({view,filters,records,evidence:sample});
 assert.equal(choose('tasks').tasks.length,40);
 assert.equal(choose('tasks',{q:'项目协作与交付'}).tasks.length,5);
 assert.deepEqual(choose('tasks',{q:'T40'}).tasks.map(t=>t.id),['T40']);
 const policy=choose('policies',{q:'人工智能'});assert.ok(policy.policies.some(p=>p.id==='POL01'));assert.equal(policy.tasks.length,40);assert.ok(policy.rules.length>0);
 const clause=choose('policies',{q:'三主编'});assert.ok(clause.policies.some(p=>p.id==='POL02'));assert.equal(clause.tasks.length,40);
 const fileFilter=choose('policies',{policy:'POL10'});assert.equal(fileFilter.policies.length,1);assert.equal(fileFilter.policies[0].date,null);
 const unknown=choose('policies',{q:'无此资料abcdef'});for(const k of ['tasks','rules','policies','evidence'])assert.equal(unknown[k].length,0);
 const scoped=choose('tasks',{task:'T01',resource:'rights'});assert.deepEqual(scoped.resources.map(x=>x.id),['rights']);assert.deepEqual(scoped.evidence.map(x=>x.id),['e2']);
 assert.deepEqual(choose('evidence',{q:'alpha'}).tasks.map(t=>t.id),['T01']);assert.deepEqual(choose('evidence',{q:'alpha'}).evidence.map(e=>e.id),['e2']);
 assert.deepEqual(choose('evidence',{q:'学校流程'}).evidence.map(e=>e.id),['e3']);assert.equal(choose('evidence',{q:'学校流程'}).tasks.length,0);
 assert.equal(choose('tasks',{coverage:'partial'}).tasks.length,1);assert.equal(choose('tasks',{coverage:'none'}).tasks.length,39);
 assert.equal(choose('tasks',{policy:'PLAN'}).policies.length,0);
 assert.ok(choose('matrix',{q:'独立复现'}).rules.every(r=>r.id==='C13'));assert.equal(choose('matrix',{q:'独立复现'}).tasks.length,25);
 const unzip=async blob=>{const b=Buffer.from(await blob.arrayBuffer()),files={};let at=0;while(b.readUInt32LE(at)===0x04034b50){assert.equal(b.readUInt16LE(at+8),0);const size=b.readUInt32LE(at+18),n=b.readUInt16LE(at+26),extra=b.readUInt16LE(at+28),name=b.subarray(at+30,at+30+n).toString();const start=at+30+n+extra;files[name]=b.subarray(start,start+size).toString();at=start+size;}return files;};
 const invalidRecords={T01:{...defaultReview('T01'),status:'已确认',stage:'验收归档',integrityWarning:'学校流程缺少正式证据'}};
 assert.equal(selectWorkspace({view:'tasks',filters:{status:'已确认'},records:invalidRecords,evidence:sample}).tasks.length,0);
 assert.deepEqual(selectWorkspace({view:'tasks',filters:{status:'待核实'},records:invalidRecords,evidence:sample}).tasks.map(t=>t.id),['T01']);
 const invalid=await unzip(buildExport('xlsx',tasks,invalidRecords,sample,[],defaultSettings,{view:'tasks',task:'T01'}));
 assert.match(invalid['xl/worksheets/sheet1.xml'],/当前审核状态/);assert.match(invalid['xl/worksheets/sheet1.xml'],/待核实/);assert.match(invalid['xl/worksheets/sheet1.xml'],/学校流程缺少正式证据/);
 const baseXlsx=buildExport('xlsx',tasks,records,sample,[],defaultSettings,{}),baseFiles=await unzip(baseXlsx);
 assert.equal((baseFiles['xl/workbook.xml'].match(/<sheet /g)||[]).length,7);
 const xlsx=buildExport('xlsx',scoped.tasks,records,sample,[],defaultSettings,{view:'tasks',task:'T01',resource:'rights'}),xf=await unzip(xlsx);
 assert.equal((xf['xl/worksheets/sheet2.xml'].match(/<row /g)||[]).length,2,'only matching resource type exports');
 assert.match(xf['xl/worksheets/sheet1.xml'],/>2\/13</,'total completeness uses all evidence, not resource-filtered subset');
 assert.match(xf['xl/worksheets/_rels/sheet4.xml.rels'],/TargetMode="External"/);assert.match(xf['xl/worksheets/sheet4.xml'],/<hyperlink ref=/);
 const docx=buildExport('docx',scoped.tasks,records,sample,[],defaultSettings,{view:'tasks',task:'T01',resource:'rights'}),df=await unzip(docx);
 assert.match(df['word/document.xml'],/证据类型已归档：2\/13/);assert.match(df['word/document.xml'],/版权与数据授权证据｜需补充/);assert.doesNotMatch(df['word/document.xml'],/学生任务书｜需补充/);
 assert.match(df['word/document.xml'],/<w:hyperlink r:id="link/);assert.doesNotMatch(df['word/document.xml'],/data-url=/);assert.match(df['word/_rels/document.xml.rels'],/TargetMode="External"/);
 const hugeHistory=[{record_id:'T01',revision:2,action:'记录更新',created_at:'2026-11-16',actor:'QA',previous:'{}',next:JSON.stringify({resources:{student:{note:'验'.repeat(65000)}}})}];
 const huge=await unzip(buildExport('xlsx',tasks,records,sample,hugeHistory,defaultSettings,{}));
 assert.match(huge['xl/worksheets/sheet7.xml'],/分段1\/3/);assert.match(huge['xl/worksheets/sheet7.xml'],/分段3\/3/);
 const auditHistory=[
  {record_id:'T01',revision:2,action:'记录更新',created_at:'2026-11-16',actor:'QA',previous:'{}',next:JSON.stringify({versionNote:'任务甲'})},
  {record_id:'T40',revision:3,action:'记录更新',created_at:'2026-11-16',actor:'QB',previous:'{}',next:JSON.stringify({versionNote:'任务乙'})},
  {record_id:'settings',revision:2,action:'流程更新',created_at:'2026-11-16',actor:'QC',previous:'{}',next:JSON.stringify({versionNote:'流程确认'})},
  {record_id:'GLOBAL',revision:0,action:'证据归档',created_at:'2026-11-16',actor:'QD',previous:'{}',next:JSON.stringify({name:'全局资料'})},
 ];
 const taskHistory=await unzip(buildExport('xlsx',tasks,records,sample,auditHistory,defaultSettings,{view:'history',historyQuery:'QB',historyPartial:1}));
 assert.equal((taskHistory['xl/worksheets/sheet1.xml'].match(/<row /g)||[]).length,2,'history search derives one related task');
 assert.match(taskHistory['xl/worksheets/sheet1.xml'],/>T40</);assert.doesNotMatch(taskHistory['xl/worksheets/sheet7.xml'],/>T01</);
 assert.match(taskHistory['xl/worksheets/sheet6.xml'],/不代表完整历史档案/);
 const settingsHistory=await unzip(buildExport('xlsx',tasks,records,sample,auditHistory,defaultSettings,{view:'history',historyRecord:'settings'}));
 assert.equal((settingsHistory['xl/worksheets/sheet1.xml'].match(/<row /g)||[]).length,1,'school history does not fabricate task scope');
 assert.equal((settingsHistory['xl/worksheets/sheet5.xml'].match(/<row /g)||[]).length,1,'school history does not pull unrelated evidence');
 assert.match(settingsHistory['xl/worksheets/sheet7.xml'],/>settings</);assert.doesNotMatch(settingsHistory['xl/worksheets/sheet7.xml'],/>GLOBAL</);
 const globalHistory=await unzip(buildExport('xlsx',tasks,records,sample,auditHistory,defaultSettings,{view:'history',historyRecord:'GLOBAL'}));
 assert.equal((globalHistory['xl/worksheets/sheet1.xml'].match(/<row /g)||[]).length,1);assert.match(globalHistory['xl/worksheets/sheet5.xml'],/学校流程正式记录/);
 assert.doesNotMatch(globalHistory['xl/worksheets/sheet5.xml'],/>e1</);assert.match(globalHistory['xl/worksheets/sheet7.xml'],/>GLOBAL</);
 const partialDoc=await unzip(buildExport('docx',tasks,records,sample,auditHistory,defaultSettings,{view:'history',historyRecord:'GLOBAL',historyPartial:'1'}));
 assert.match(partialDoc['word/document.xml'],/历史审查范围：0项关联任务；全局证据/);assert.match(partialDoc['word/document.xml'],/不代表完整历史档案/);assert.match(partialDoc['word/document.xml'],/GLOBAL｜证据事件/);
 const metadataOnly=await unzip(buildExport('xlsx',tasks.slice(0,1),records,sample,auditHistory,defaultSettings,{historyPartial:1}));
 assert.equal((metadataOnly['xl/worksheets/sheet1.xml'].match(/<row /g)||[]).length,2,'pagination metadata must not broaden selected task scope');
 const searched=await unzip(buildExport('xlsx',policy.tasks,records,sample,[],defaultSettings,{view:'policies',q:'人工智能'}));
 assert.match(searched['xl/worksheets/sheet4.xml'],/人工智能/);assert.doesNotMatch(searched['xl/worksheets/sheet4.xml'],/十四五/);
 const global=await unzip(buildExport('xlsx',[],records,sample,[],defaultSettings,{view:'evidence',q:'学校流程'}));assert.match(global['xl/worksheets/sheet5.xml'],/学校流程正式记录/);
 await writeFile(join(temporary,'audit.xlsx'),Buffer.from(await baseXlsx.arrayBuffer()));await writeFile(join(temporary,'audit.docx'),Buffer.from(await docx.arrayBuffer()));
 execFileSync('python3',['-c',`import sys,zipfile,xml.etree.ElementTree as ET\nfor path in sys.argv[1:]:\n with zipfile.ZipFile(path) as z:\n  assert z.testzip() is None\n  for name in z.namelist(): ET.fromstring(z.read(name))\nfrom openpyxl import load_workbook\nw=load_workbook(sys.argv[1]); assert len(w.sheetnames)==7; assert w['任务审查表'].max_row==41; assert w['资源建设清单'].max_row==521\nassert any(cell.hyperlink for row in w['政策时间轴'] for cell in row)\nfrom docx import Document\nd=Document(sys.argv[2]); assert len(d.paragraphs)>20\nprint('OOXML XML/ZIP integrity and Office document readers passed')`,join(temporary,'audit.xlsx'),join(temporary,'audit.docx')],{stdio:'inherit'});
 console.log('PASS: shared query semantics, task/policy/evidence relations, missing-resource scope, aggregate completeness, 7-sheet OOXML exports, clickable official links');
}finally{await rm(temporary,{recursive:true,force:true});}
