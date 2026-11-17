const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../extension/core.js');
const audit=require('../catalog-audit.json');
function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};}
test('目录完整性：526个唯一类型、14分类，逐类数量与网页提取审计一致',()=>{
 assert.equal(C.STYLES.length,526);assert.equal(C.CATALOG.groups.length,14);assert.equal(new Set(C.STYLES.map(s=>s.id)).size,526);assert.equal(new Set(C.STYLES.map(s=>s.name)).size,526);
 for(const g of audit.groups)assert.equal(C.STYLES.filter(s=>s.group===g.name).length,g.count);
 for(const [kind,count]of Object.entries(audit.kindCounts))assert.equal(C.STYLES.filter(s=>s.kind===kind).length,count);
 for(const s of C.STYLES)for(const f of ['id','name','en','group','kind','kindLabel','description','hint'])assert.ok(s[f],s.id+':'+f);
});
test('200批抽样各取10种，不重复且不修改原目录',()=>{
 const original=C.STYLES.map(s=>s.id);const results=new Set();
 for(let i=1;i<=200;i++){const styles=C.sampleStyles('all',rng(i)).styles;assert.equal(styles.length,10);assert.equal(new Set(styles.map(s=>s.id)).size,10);assert.ok(styles.every(s=>original.includes(s.id)));results.add(styles.map(s=>s.id).join(','));}
 assert.equal(results.size,200);assert.deepEqual(C.STYLES.map(s=>s.id),original);
});
test('分类定向：至少10种时全部来自本类，7种分类自动补足3种',()=>{
 for(const g of C.CATALOG.groups){const selection=C.sampleStyles(g.name,rng(12));assert.equal(selection.styles.length,10);assert.equal(selection.styles.filter(s=>s.group===g.name).length,Math.min(g.count,10));assert.equal(selection.fillCount,Math.max(0,10-g.count));}
});
test('所有526种类型保留自身名称、特征与分类语义，提示词无缺失字段',()=>{
 for(const s of C.STYLES){const j={...C.creativeStyle(s),theme:'校园成长',title:'测试曲',marker:'TEST',language:'普通话',voice:'童声独唱',voiceNote:'轻松自然',mood:'温暖',duration:'智能时长',imagery:'校园',arc:'成长'};
 const p=C.makePrompt(j);assert.ok(p.includes(s.name));assert.ok(p.includes(s.description));assert.ok(p.includes(s.en));assert.doesNotMatch(p,/undefined|\[object Object\]/);assert.ok(p.length<12000);}
});
test('11种童声及儿童成人组合都写入提示词与对应声部安排',()=>{
 const children=C.VOICES.filter(v=>/童|儿童/.test(v.label));assert.equal(children.length,11);
 for(const v of children){const b=C.generate({theme:'成长',voice:v.label});assert.equal(b.jobs.length,10);for(const j of b.jobs){assert.equal(j.voice,v.label);assert.ok(j.prompt.includes(v.note));assert.ok(j.prompt.includes('演唱：'+v.label));}}
 const duet=C.generate({theme:'成长',voice:'儿童与成人对唱'}).jobs[0];assert.match(duet.prompt,/轮流演唱主歌/);assert.match(duet.prompt,/副歌共同合唱/);
});
test('十首组合语种循环完整；纯器乐优先于童声设定',()=>{
 const b=C.generate({theme:'成长',language:'组合语种'});assert.equal(b.jobs[5].language,b.jobs[0].language);assert.ok(b.jobs.every(j=>j.language));
 const instrumental=C.generate({theme:'成长',voice:'儿童与成人对唱',language:'纯音乐'});for(const j of instrumental.jobs){assert.doesNotMatch(j.prompt,/演唱：|声部安排：|人声与伴奏平衡/);assert.match(j.prompt,/纯器乐/);}
});
