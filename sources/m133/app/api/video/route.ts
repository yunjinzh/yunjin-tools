import { getChatGPTUser } from '../../chatgpt-auth';
import { env } from 'cloudflare:workers';
import { assertSameOrigin, failure, readJson, RequestError } from '../_shared/validation';

async function fetchJson(url: string, service: 'api' | 'oembed'): Promise<any> {
  let response: Response;
  try { response = await fetch(url,{signal:AbortSignal.timeout(10000)}); }
  catch (error) {
    if (error instanceof Error && ['TimeoutError','AbortError'].includes(error.name)) throw new RequestError('读取 YouTube 超时，本次未更改资料。可以重试，或先手动建档。',504);
    throw new RequestError('暂时无法连接 YouTube，本次未更改资料。可以重试，或先手动建档。',502);
  }
  if (!response.ok) {
    if ([404,410].includes(response.status)) throw new RequestError('视频不可用、已删除或设为私密。请检查原始链接。',404);
    if (response.status === 429) throw new RequestError('YouTube 请求过于频繁，请稍后重试；已有资料未改变。',429);
    if (service === 'oembed') throw new RequestError('YouTube 未返回公开元数据。可选择手动建档，保留原始链接。',502);
    if ([400,401,403].includes(response.status)) throw new RequestError('YouTube API 拒绝了请求，请检查服务端密钥、API 权限或今日配额；已有资料未改变。',502);
    throw new RequestError('YouTube 服务暂不可用，请稍后重试；已有资料未改变。',502);
  }
  try { return await response.json(); }
  catch { throw new RequestError('YouTube 返回了无法读取的数据，本次未更改资料，请稍后重试。',502); }
}
function publicCount(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}

export async function POST(req: Request) {
  try {
    if (!await getChatGPTUser()) throw new RequestError('请登录后导入或更新视频。',401);
    assertSameOrigin(req);
    const {id,action} = await readJson(req);
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(id)) throw new RequestError('请输入有效的 YouTube 视频链接。');
    if (typeof action !== 'string' || !['refresh','import'].includes(action)) throw new RequestError('视频操作无效，请从添加视频或刷新按钮重试。');
    const url = `https://www.youtube.com/watch?v=${id}`;
    const key = (env as unknown as Record<string,string>).YOUTUBE_API_KEY;
    if (action === 'refresh' || key) {
      if (!key) throw new RequestError('尚未配置 YouTube Data API 密钥。当前可在「编辑与核验」中记录官方页面数据及核查时间；配置服务端 YOUTUBE_API_KEY 后可刷新统计。',409);
      const result = await fetchJson(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${id}&key=${encodeURIComponent(key)}`,'api');
      const video = result?.items?.[0];
      if (!video) throw new RequestError('视频不可用、已删除或设为私密。请检查原始链接。',404);
      if (typeof video.snippet?.title !== 'string' || typeof video.snippet?.channelTitle !== 'string' || typeof video.snippet?.channelId !== 'string' || !/^[\w-]+$/.test(video.snippet.channelId)) throw new RequestError('YouTube 返回的视频字段不完整，本次未更新资料。',502);
      const channelResult = await fetchJson(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(video.snippet.channelId)}&key=${encodeURIComponent(key)}`,'api');
      const channel = channelResult?.items?.[0];
      const published = typeof video.snippet.publishedAt === 'string' && Number.isFinite(Date.parse(video.snippet.publishedAt)) ? video.snippet.publishedAt.slice(0,10) : '';
      return Response.json({id,title:video.snippet.title,channel:video.snippet.channelTitle,channelUrl:`https://www.youtube.com/channel/${video.snippet.channelId}`,published,
        views:publicCount(video.statistics?.viewCount),subscribers:channel?.statistics?.hiddenSubscriberCount ? null : publicCount(channel?.statistics?.subscriberCount),
        duration:typeof video.contentDetails?.duration === 'string' ? video.contentDetails.duration : '',metricsChecked:new Date().toISOString(),metricsSource:url,
        metricsCaveat:'YouTube Data API 在上述核查时间读取，订阅数经过平台取整。'},{headers:{'Cache-Control':'no-store'}});
    }
    const result = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,'oembed');
    if (typeof result?.title !== 'string' || typeof result?.author_name !== 'string') throw new RequestError('元数据缺少标题或频道名，请使用手动建档。',502);
    return Response.json({id,title:result.title,channel:result.author_name,channelUrl:typeof result.author_url === 'string' ? result.author_url : ''},{headers:{'Cache-Control':'no-store'}});
  } catch (error) { return failure(error,'暂时无法读取视频，请重试或使用手动建档。',502); }
}
