import { MODELS, RATIOS } from "./image-types";
const BASE = "https://api.marswave.ai/openapi/v1";
export class ApiError extends Error {
  constructor(message: string, public status = 400, public uncertain = false, public retryAfter = 0) { super(message); }
}
export function validateGeneration(value: unknown) {
  if (!value || typeof value !== "object") throw new ApiError("请求内容不正确。");
  const v = value as Record<string, any>;
  if (typeof v.prompt !== "string" || !v.prompt.trim() || v.prompt.length > 12000) throw new ApiError("每条提示词需为 1–12000 个字符。");
  if (!MODELS.some(m => m.id === v.model)) throw new ApiError("请选择受支持的 GPT-Image 模型。");
  const c = v.imageConfig;
  if (!c || !["1K", "2K", "4K"].includes(c.imageSize) || !RATIOS.includes(c.aspectRatio)) throw new ApiError("分辨率或比例不正确。");
  if (v.model === "gpt-image-2-official" && !["low", "medium", "high"].includes(c.quality)) throw new ApiError("请选择有效的质量档位。");
  return { provider: "openai", model: v.model, prompt: v.prompt.trim(), imageConfig: { imageSize: c.imageSize, aspectRatio: c.aspectRatio, ...(v.model === "gpt-image-2-official" ? { quality: c.quality } : {}) } };
}
export function validateTaskId(id: unknown): string {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) throw new ApiError("任务编号无效。");
  return id;
}
export function cleanMessage(message: unknown, key: string) {
  return String(message || "ListenHub 返回错误，请稍后重试。").split(key).join("[已隐藏]").replace(/Bearer\s+\S+/gi, "Bearer [已隐藏]").slice(0, 500);
}
export async function upstream(path: string, key: string, body?: unknown, fetcher: typeof fetch = fetch) {
  const creating = path === "/images/generation/async";
  let response: Response;
  try {
    response = await fetcher(BASE + path, { method: body === undefined ? "GET" : "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(45000), redirect: "error", cache: "no-store" });
  } catch { throw new ApiError(creating ? "提交响应中断，任务可能已创建。请查看云端任务后再决定是否重试。" : "暂时无法连接 ListenHub，请稍后重新查询。", 502, creating); }
  const retryHeader = response.headers.get("retry-after");
  const retrySeconds = retryHeader && /^\d+$/.test(retryHeader) ? Number(retryHeader) : retryHeader ? Math.ceil((Date.parse(retryHeader) - Date.now()) / 1000) : 0;
  const retryAfter = Math.max(0, retrySeconds || 0);
  let json: any;
  try { json = await response.json(); } catch { throw new ApiError("ListenHub 返回了无法识别的响应。", 502, creating); }
  if (!response.ok || json.code !== 0) {
    const status = response.status === 429 ? 429 : [401, 403].includes(response.status) ? response.status : [26004, 23016].includes(json.code) ? 403 : response.status >= 500 ? 502 : 400;
    const message = json.code === 26004 ? "ListenHub 积分不足，请补充额度后继续。" : json.code === 23016 ? "此配置需要有效的 ListenHub 订阅，请检查套餐或更换参数。" : status === 401 ? "API Key 无效或已过期，请重新连接。" : cleanMessage(json.message, key);
    throw new ApiError(message, status, creating && response.status >= 500, retryAfter);
  }
  if (!json.data || typeof json.data !== "object") throw new ApiError("ListenHub 响应缺少任务数据。", 502, creating);
  return json.data;
}
export function safeImageUrl(value: unknown) {
  if (typeof value !== "string") throw new ApiError("图片地址无效。");
  let url: URL;
  try { url = new URL(value); } catch { throw new ApiError("图片地址无效。"); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") || !host.includes(".") || /(^localhost$|\.localhost$|\.local$|\.internal$|^[\d.]+$|:)/.test(host)) throw new ApiError("图片地址不受支持。");
  return url.href;
}
export async function handleAction(action: string, data: any, key: string, fetcher: typeof fetch = fetch): Promise<Response> {
  if (action === "verify") { await upstream("/user/subscription", key, undefined, fetcher); return Response.json({ connected: true }); }
  if (action === "estimate" || action === "create") {
    const result = await upstream(`/images/generation/${action === "create" ? "async" : "estimate-credits"}`, key, validateGeneration(data), fetcher);
    if (action === "create" && (typeof result.taskId !== "string" || !result.taskId)) throw new ApiError("未收到任务编号，请先查看云端任务。", 502, true);
    if (action === "estimate" && (typeof result.credits !== "number" || !Number.isFinite(result.credits) || result.credits < 0)) throw new ApiError("积分预估响应不完整，请稍后重试。", 502);
    return Response.json(result);
  }
  if (action === "history") {
    const page = Number(data?.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new ApiError("页码无效。");
    return Response.json(await upstream(`/images/generation/tasks?page=${page}&pageSize=20`, key, undefined, fetcher));
  }
  if (action === "task" || action === "download") {
    const taskId = validateTaskId(data?.taskId);
    const task = await upstream(`/images/generation/tasks/${encodeURIComponent(taskId)}`, key, undefined, fetcher);
    if (action === "task") return Response.json(task);
    const index = Number(data?.index ?? 0);
    if (!Number.isInteger(index) || index < 0 || task.status !== "success" || !task.images?.[index]) throw new ApiError("图片尚未生成或不存在。");
    const image = await fetcher(safeImageUrl(task.images[index].url), { redirect: "error", signal: AbortSignal.timeout(60000) });
    const type = image.headers.get("content-type")?.split(";")[0] || "";
    if (!image.ok || !["image/png", "image/jpeg", "image/webp"].includes(type)) throw new ApiError("图片下载失败，请稍后重试或打开原图保存。", 502);
    if (Number(image.headers.get("content-length") || 0) > 30 * 1024 * 1024) throw new ApiError("单张图片超过 30 MB，请打开原图保存。");
    const ext = type === "image/jpeg" ? "jpg" : type.split("/")[1];
    return new Response(image.body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="listenhub-${taskId}-${index + 1}.${ext}"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
  throw new ApiError("不支持的操作。");
}
