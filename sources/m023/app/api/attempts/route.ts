import {database} from '@/lib/storage';
import {reconstruct,score,diagnosisScore,faults,steps} from '@/lib/training';
export async function GET(){try{const data=await database().prepare('SELECT * FROM attempts ORDER BY created DESC LIMIT 100').all();return Response.json({attempts:data.results.map((r:any)=>({...r,payload:JSON.parse(r.payload),review:r.review?JSON.parse(r.review):null}))});}catch(e){console.error(e);return Response.json({error:'记录读取失败，请稍后重试。'},{status:503});}}
export async function POST(req:Request){try{
 const p:any=await req.json();if(!p.id||typeof p.id!=='string'||p.id.length>80||!p.student?.trim()||p.student.length>40||!['learn','practice','exam','diagnosis'].includes(p.mode))return Response.json({error:'记录格式不完整'},{status:400});
 let result=0,passed=false;
 if(p.course==='battery'){
  if(!Array.isArray(p.events)||p.events.length>500||p.events.some((e:any)=>!e||typeof e.target!=='string'||typeof e.tool!=='string'||!Number.isFinite(e.at)))return Response.json({error:'操作记录无效'},{status:400});
  const state=reconstruct(p.events,p.mode);result=score(state);passed=state.step===steps.length&&!state.fatal&&result>=80;p.events=state.events;p.state={step:state.step,bolts:state.bolts,tightened:state.tightened,fatal:state.fatal};
 }else if(p.course==='diagnosis'){
  const f=faults.find(f=>f.id===p.faultId);if(!f||!Array.isArray(p.evidence)||p.evidence.some((x:any)=>!Number.isInteger(x)||x<0||x>3))return Response.json({error:'诊断证据无效'},{status:400});
  const correct=p.answer===f.cause;const repaired=correct&&p.repaired===true;const verified=repaired&&p.verified===true;p.repaired=repaired;p.verified=verified;result=diagnosisScore(p.faultId,p.evidence,p.answer,repaired,verified);passed=result>=80&&verified;
 }else return Response.json({error:'课题不存在'},{status:400});
 const created=new Date().toISOString();const row={id:p.id,student:p.student.trim(),mode:p.mode,course:p.course,score:result,passed:passed?1:0,created,payload:p,review:null};
 await database().prepare('INSERT INTO attempts (id, student, mode, course, score, passed, created, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET student=excluded.student, mode=excluded.mode, course=excluded.course, score=excluded.score, passed=excluded.passed, created=excluded.created, payload=excluded.payload, review=NULL').bind(row.id,row.student,row.mode,row.course,row.score,row.passed,row.created,JSON.stringify(p)).run();
 return Response.json({attempt:row});
 }catch(e){console.error(e);return Response.json({error:'保存失败，当前报告已保留，请重试。'},{status:503});}}
