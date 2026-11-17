import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { records } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { seeds } from '../../lib/seed';
import type { Experiment, Video } from '../../lib/types';
import { assertSameOrigin, failure, readJson, RequestError, validateRecord } from '../_shared/validation';

export const dynamic = 'force-dynamic';
const noStore = {'Cache-Control':'no-store'};

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({videos:seeds,experiments:[],authenticated:false}, {headers:noStore});
    const rows = await getDb().select().from(records).where(eq(records.owner,user.userId));
    const videos = new Map(seeds.map(v => [v.id,v]));
    const experiments: Experiment[] = [];
    let damaged = 0;
    for (const row of rows) {
      try {
        const record = validateRecord(row.kind, JSON.parse(row.payload));
        if (row.key !== `${user.userId}:${row.kind}:${record.id}`) throw new Error('Mismatched record');
        const data = {...record,revision:row.revision};
        if (row.kind === 'video') {
          const video = data as Video;
          // Older saved copies predate source classification; inherit only the new
          // classification while preserving all of the user's saved research.
          videos.set(data.id,{...video,provenance:video.provenance ?? videos.get(data.id)?.provenance});
        }
        else experiments.push(data as Experiment);
      } catch { damaged++; }
    }
    return Response.json({videos:[...videos.values()],experiments,authenticated:true,
      warnings:damaged ? [`有 ${damaged} 条历史资料格式异常，暂未显示；其原始数据仍保留，请联系维护者检查后恢复。`] : []}, {headers:noStore});
  } catch { return failure(null,'研究资料暂时无法读取，请重新连接。'); }
}

export async function POST(req: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) throw new RequestError('请登录后保存研究资料。',401);
    assertSameOrigin(req);
    const body = await readJson(req);
    const kind = body.kind as 'video' | 'experiment';
    const data = validateRecord(kind,body.data);
    const key = `${user.userId}:${kind}:${data.id}`;
    const db = getDb();
    const [current] = await db.select().from(records).where(eq(records.key,key));
    if ((current?.revision || 0) !== (data.revision || 0)) throw new RequestError('这条资料已在其他页面更新，请重新载入后再保存；当前输入尚未保存。',409);
    if (kind === 'experiment') {
      const sourceIds = (data as Experiment).sourceIds;
      const knownIds = new Set(seeds.map(video => video.id));
      if (sourceIds.some(id => !knownIds.has(id))) {
        const ownedVideos = await db.select({key:records.key,payload:records.payload}).from(records)
          .where(and(eq(records.owner,user.userId),eq(records.kind,'video')));
        for (const row of ownedVideos) {
          try {
            const source = validateRecord('video',JSON.parse(row.payload));
            if (row.key === `${user.userId}:video:${source.id}`) knownIds.add(source.id);
          }
          catch { /* Unreadable cases cannot provide a usable experiment link. */ }
        }
      }
      if (sourceIds.some(id => !knownIds.has(id))) {
        throw new RequestError('关联案例不在当前研究库中，请先添加或恢复对应视频，再保存实验。');
      }
    }
    const revision = (current?.revision || 0)+1;
    const updated = new Date().toISOString();
    const {revision: _,...payload} = data;
    const values = {key,owner:user.userId,kind,payload:JSON.stringify(payload),updated,revision};
    const changed = current
      ? await db.update(records).set(values).where(and(eq(records.key,key),eq(records.revision,current.revision))).returning({key:records.key})
      : await db.insert(records).values(values).onConflictDoNothing({target:records.key}).returning({key:records.key});
    if (!changed.length) throw new RequestError('这条资料刚刚在其他页面保存，请重新载入后重试；当前输入尚未保存。',409);
    return Response.json({ok:true,revision,updated},{headers:noStore});
  } catch (error) {
    return failure(error,'暂时无法确认保存结果，请保留当前输入，重新载入核对后再试。');
  }
}
