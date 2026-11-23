import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,validateSave,makeRoute,inWater,blocked,angleDelta,JOBS,TAPES,ROADS,settleJob} from '../dist/core.js';

test('存档往返保留进度、现金、调校、设置及位置',()=>{
 const a=freshSave();Object.assign(a,{cash:920,completed:['race','stealth'],tapes:['tape-2'],upgrade:2,paint:3,bestRace:61.5,position:{x:111,z:-43}});a.settings.sound=false;
 assert.deepEqual(validateSave(JSON.parse(JSON.stringify(a))),a);
});
test('拒绝无效存档并清理越界、未知和重复数据',()=>{
 for(const v of [null,{}, {version:2,cash:10},{version:1,cash:-2},{version:1,cash:Infinity}])assert.throws(()=>validateSave(v));
 const a=validateSave({...freshSave(),completed:['race','race','unknown'],tapes:['tape-0','bad','tape-0'],upgrade:999,position:{x:9999,z:-9999},settings:{quality:'ultra',sensitivity:999}});
 assert.deepEqual(a.completed,['race']);assert.deepEqual(a.tapes,['tape-0']);assert.equal(a.upgrade,3);assert.deepEqual(a.position,{x:475,z:-475});assert.equal(a.settings.quality,'medium');assert.equal(a.settings.sensitivity,180);
});
test('道路导航保持起终点，主路径使用横纵道路',()=>{
 const a={x:-18,z:35},b={x:218,z:-100},r=makeRoute(a,b);
 assert.deepEqual(r[0],a);assert.deepEqual(r.at(-1),b);
 for(let i=1;i<r.length;i++)assert.ok(r[i].x===r[i-1].x||r[i].z===r[i-1].z,'导航不能斜穿楼块');
 for(const p of r.slice(1,-1))assert.ok(ROADS.includes(p.x)||ROADS.includes(p.z));
 assert.deepEqual(makeRoute(a,b,ROADS,true),[a,b]);
});
test('碰撞半径、水岸与角度环绕边界',()=>{
 const box=[{x:0,z:0,w:10,d:20}];assert.equal(blocked({x:5.4,z:0},box,.5),true);assert.equal(blocked({x:5.6,z:0},box,.5),false);
 const lake={minX:-380,maxX:-218,minZ:-380,maxZ:-220};assert.equal(inWater({x:-225,z:-292},lake),true);assert.equal(inWater({x:-207,z:-292},lake),false);
 assert.ok(Math.abs(angleDelta(-Math.PI+.1,Math.PI-.1)-.2)<1e-10);
});
test('五个主线和重复配送均有可完成目标；磁带标识唯一',()=>{
 assert.equal(JOBS.length,6);assert.equal(JOBS.find(j=>j.id==='race').stages.length,9);assert.equal(TAPES.length,12);assert.equal(new Set(TAPES.map(t=>t.id)).size,12);
 for(const j of JOBS){assert.ok(j.reward>0&&j.limit>0&&j.stages.length>0);for(const s of j.stages){assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.z));assert.ok(s.auto||s.action);}}
});
test('任务结算正确区分无警报奖励、重复配送和竞速纪录',()=>{
 const s=freshSave();settleJob(s,{id:'stealth',alerted:false});assert.equal(s.cash,440);
 settleJob(s,{id:'stealth',alerted:true});assert.equal(s.cash,620);assert.deepEqual(s.completed,['stealth']);
 settleJob(s,{id:'delivery'});settleJob(s,{id:'delivery'});assert.equal(s.delivered,2);assert.equal(s.completed.length,1);
 settleJob(s,{id:'race',total:110,time:35});assert.equal(s.bestRace,75);
 settleJob(s,{id:'race',total:110,time:20});assert.equal(s.bestRace,75);
 settleJob(s,{id:'race',total:110,time:50});assert.equal(s.bestRace,60);
 assert.throws(()=>settleJob(s,{id:'invalid'}));
});
