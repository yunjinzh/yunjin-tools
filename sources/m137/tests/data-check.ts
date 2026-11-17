import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {seed,blankProject} from '../lib/model';
import {projectSchema,payloadSchema} from '../lib/validation';
import {wordBytes,excelBytes} from '../lib/export';
const s=seed(); assert.equal(s.projects.length,6);
for(const p of s.projects){assert(projectSchema.safeParse(p).success);assert.equal(p.status,'待验证');assert.equal(p.versions.length,1)}
let p=blankProject();p.name='测试项目';p.status='已确认';assert(!projectSchema.safeParse(p).success);p.evidence='确认文件';assert(projectSchema.safeParse(p).success);p.facts.budget={text:'100万',status:'已确认',evidence:''};assert(!projectSchema.safeParse(p).success);
assert(!payloadSchema.safeParse({revision:1,projects:[s.projects[0],s.projects[0]],modules:s.modules}).success);
writeFileSync('/tmp/workbench-check.docx',wordBytes(s.projects));writeFileSync('/tmp/workbench-check.xlsx',excelBytes(s.projects));console.log('PASS: seed states, confirmation validation, duplicate rejection, Office generation');
