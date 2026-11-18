import { env } from "cloudflare:workers";
import identities from "../../../lib/card-identities.json";
import stats from "../../../lib/initial.json";
import resources from "../../../lib/resources.json";
import { editions, validate } from "../../../lib/policy";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status=200) => Response.json(data, {status, headers:{"Cache-Control":"private, no-store"}});
export async function GET(req:Request) {
  try {
    const after = Number(new URL(req.url).searchParams.get("after")||0);
    if(!Number.isSafeInteger(after)||after<0)return reply({error:"分页参数无效"},400);
    const {results} = await env.DB!.prepare("SELECT seq,entity,revision,payload,at FROM audit_events WHERE seq>? ORDER BY seq LIMIT 150").bind(after).all();
    return reply({events:results.map(r=>({...r,payload:JSON.parse(String(r.payload))})),more:results.length===150});
  }catch{return reply({error:"暂时无法读取已保存记录，请重试。"},503);}
}
export async function POST(req:Request){
  const origin=req.headers.get("Origin");
  if(!origin||new URL(origin).origin!==new URL(req.url).origin) return reply({error:"来源无效"},403);
  try {
    const raw=await req.text();
    if(raw.length>90000)return reply({error:"单条记录过大，请拆分批次"},413);
    const {op,entity,revision,payload}=JSON.parse(raw);
    if(typeof op!=="string"||!/^[a-zA-Z0-9-]{16,80}$/.test(op)||typeof entity!=="string"||!/^([a-z]+):[\w.-]{1,100}$/.test(entity)||!Number.isSafeInteger(revision)||revision<1)return reply({error:"记录标识无效"},400);
    const msg=validate(payload);
    if(msg||entity.split(":")[0]!==payload.kind)return reply({error:msg||"记录类型不匹配"},400);
    if(payload.kind==="review" && payload.scope==="单张") {
      const suffix=editions.indexOf(payload.edition)+"-"+payload.cardId;
      const card=identities[suffix as keyof typeof identities];
      if(!card||entity!=="review:"+suffix||card[0]!==payload.han||card[1]!==payload.filename) return reply({error:"卡片信息与版本清单不符"},400);
    }
    if(payload.kind==="baseline" && (entity!=="baseline:target"||!payload.evidence?.trim()))return reply({error:"请填写字表来源"},400);
    if(payload.kind==="part"){
      const ref=resources.parts.find(p=>p.name.endsWith("."+payload.volume));
      if(entity!=="part:"+payload.volume||!ref)return reply({error:"分卷标识无效"},400);
      if(payload.status==="已确认" && (ref.name!==payload.filename||ref.bytes!==Number(payload.bytes)||stats.partHashes[payload.volume as keyof typeof stats.partHashes]!==payload.hash?.trim().toLowerCase()))return reply({error:"分卷信息与归档指纹不符"},400);
    }
    const db=env.DB!;
    const prior=await db.prepare("SELECT entity,revision,payload FROM audit_events WHERE op=?").bind(op).first();
    const body=JSON.stringify(payload);
    if(prior)return prior.entity===entity&&prior.revision===revision&&prior.payload===body?reply({ok:true}):reply({error:"请求冲突"},409);
    const q=await db.prepare("INSERT INTO audit_events (op,entity,revision,payload,at) SELECT ?,?,?,?,? WHERE COALESCE((SELECT MAX(revision) FROM audit_events WHERE entity=?),0)=? ON CONFLICT DO NOTHING")
      .bind(op,entity,revision,body,new Date().toISOString(),entity,revision-1).run();
    return q.meta.changes===1?reply({ok:true},201):reply({error:"该记录已有更新，请关闭表单并读取最新版本。"},409);
  }catch{return reply({error:"保存失败，请检查连接后重试。"},503);}
}
