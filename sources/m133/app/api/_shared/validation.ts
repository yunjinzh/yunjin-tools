import type { Experiment, Video } from '../../lib/types';

export class RequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

const recordId = /^[-_a-zA-Z0-9]{1,100}$/;
const videoId = /^[a-zA-Z0-9_-]{11}$/;
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function text(value: unknown, label: string, max = 10000, required = false): asserts value is string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    throw new RequestError(`${label}${required ? '不能为空，且' : ''}必须为不超过 ${max} 字的文本。`);
  }
}
function httpUrl(value: unknown, label: string, optional = true): asserts value is string {
  text(value, label, 3000);
  if (optional && value === '') return;
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
  } catch { throw new RequestError(`${label}需要有效的 http 或 https 链接。`); }
}
function date(value: unknown, label: string, optional = true): asserts value is string {
  text(value, label, 40);
  if (optional && value === '') return;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value.slice(0,10)) {
    throw new RequestError(`${label}需要有效日期或 UTC 时间。`);
  }
}
function count(value: unknown, label: string, nullable = true): asserts value is number | null {
  if (nullable && value === null) return;
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new RequestError(`${label}需为非负整数；未知时请留空。`);
}
function metricText(value: unknown, label: string, max?: number) {
  text(value, label, 30);
  if (value === '') return;
  const n = Number(value);
  if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(n) || n < 0 || (max !== undefined ? n > max : !Number.isSafeInteger(n))) {
    throw new RequestError(max === undefined ? `${label}需为非负整数。` : `${label}需在 0 至 ${max} 之间。`);
  }
}

export function validateRecord(kind: unknown, value: unknown): Video | Experiment {
  if (typeof kind !== 'string' || !['video','experiment'].includes(kind) || !object(value)) throw new RequestError('资料类型或内容格式无效。');
  const d = value;
  if (typeof d.id !== 'string' || !(kind === 'video' ? videoId : recordId).test(d.id)) throw new RequestError('资料标识无效。');
  text(d.title, '标题', 500, true);
  if (d.revision !== undefined && (!Number.isSafeInteger(d.revision) || (d.revision as number) < 0)) throw new RequestError('资料版本无效，请重新载入后保存。');
  if (kind === 'video') {
    if (d.provenance !== undefined && (typeof d.provenance !== 'string' || !['research','education','vendor','unknown'].includes(d.provenance))) throw new RequestError('来源类型无效，请选择原始研究、教学内容、品牌演示或待分类。');
    text(d.channel, '频道名称', 300, true);
    if (typeof d.topic !== 'string' || !['地图设计','空间智能','数字孪生','具身智能'].includes(d.topic)) throw new RequestError('请选择支持的研究题材。');
    if (typeof d.evergreen !== 'string' || !['待评估','高','中','低'].includes(d.evergreen)) throw new RequestError('常青程度无效。');
    for (const [key,label] of [['description','研究摘要'],['reason','常青判断依据'],['notes','研究笔记']] as const) text(d[key], label, 15000);
    text(d.duration, '视频时长', 100);
    if (d.metricsCaveat !== undefined) text(d.metricsCaveat, '统计说明', 3000);
    if (typeof d.favorite !== 'boolean') throw new RequestError('收藏状态无效。');
    httpUrl(d.url, '原视频链接', false);
    const url = new URL(d.url);
    const normalizedHost = url.hostname.replace(/^www\./, '');
    const id = normalizedHost === 'youtu.be' ? url.pathname.slice(1).split('/')[0] : ['youtube.com','m.youtube.com'].includes(normalizedHost) ? url.searchParams.get('v') || url.pathname.split('/')[2] : null;
    if (id !== d.id) throw new RequestError('原视频链接与视频标识不一致。');
    if (d.channelUrl !== undefined) httpUrl(d.channelUrl, '频道链接');
    date(d.published, '发布日期'); date(d.checked, '资料核查日期'); date(d.metricsChecked, '统计核查日期');
    httpUrl(d.metricsSource, '统计证据链接');
    count(d.views, '播放量'); count(d.subscribers, '订阅数');
    if ((d.views !== null || d.subscribers !== null) && (!d.metricsSource || !d.metricsChecked)) throw new RequestError('填写统计数据时，必须同时记录来源与核查日期。');
    if (!Array.isArray(d.sources) || d.sources.length < 1 || d.sources.length > 50) throw new RequestError('请保留 1 至 50 个原始来源。');
    for (const source of d.sources) {
      if (!object(source)) throw new RequestError('来源资料格式无效。');
      text(source.label, '来源名称', 300, true); httpUrl(source.url, '来源链接', false);
    }
    if (!object(d.analysis)) throw new RequestError('研究拆解格式无效。');
    for (const key of ['hook','structure','turn','retention','rhythm','evidence','titlePattern']) text(d.analysis[key], '研究拆解', 15000);
    if (typeof d.analysis.verified !== 'boolean') throw new RequestError('核验状态无效。');
    if (d.analysis.verified && !(d.analysis.evidence as string).trim()) throw new RequestError('标为已核验前，请填写时间戳与证据。');
    if (!Array.isArray(d.snapshots) || d.snapshots.length > 100) throw new RequestError('最多保留 100 条统计快照。');
    for (const snapshot of d.snapshots) {
      if (!object(snapshot)) throw new RequestError('统计快照格式无效。');
      date(snapshot.at, '快照记录时间', false); count(snapshot.views, '快照播放量', false); count(snapshot.subscribers, '快照订阅数');
    }
  } else {
    text(d.hypothesis, '实验假设或脚本', 30000, true);
    text(d.result, '实验结果', 15000);
    if (typeof d.status !== 'string' || !['待测试','制作中','已发布','已复盘'].includes(d.status)) throw new RequestError('请选择有效的实验进度。');
    if (d.status === '已复盘' && !(d.result as string).trim()) throw new RequestError('已复盘的实验需要记录结果与下一步。');
    if (!Array.isArray(d.sourceIds) || d.sourceIds.length > 100 || d.sourceIds.some(id => typeof id !== 'string' || !videoId.test(id))) throw new RequestError('关联研究案例格式无效。');
    date(d.date, '实验日期', false); httpUrl(d.url, '发布链接');
    metricText(d.views, '实验播放量'); metricText(d.ctr, '点击率', 100); metricText(d.retention, '完播率', 100);
  }
  if (JSON.stringify(d).length > 60000) throw new RequestError('这条资料超过 60,000 字符，请精简后重试。', 413);
  return d as unknown as Video | Experiment;
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return;
  try { if (new URL(origin).origin !== new URL(req.url).origin) throw new Error(); }
  catch { throw new RequestError('请求来源不匹配，请从研究站页面重试。', 403); }
}
export async function readJson(req: Request) {
  if (Number(req.headers.get('content-length') || 0) > 250000) throw new RequestError('提交内容过大，请精简后重试。', 413);
  const raw = await req.text();
  if (raw.length > 65000) throw new RequestError('提交内容过大，请精简后重试。', 413);
  try { const data = JSON.parse(raw); if (!object(data)) throw new Error(); return data; }
  catch { throw new RequestError('提交内容不是有效的资料对象，请重新载入后重试。'); }
}
export function failure(error: unknown, fallback: string, status = 503) {
  return Response.json({error: error instanceof RequestError ? error.message : fallback}, {status:error instanceof RequestError ? error.status : status, headers:{'Cache-Control':'no-store'}});
}
