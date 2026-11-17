import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ApiError, handleAction } from "@/lib/listenhub";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    if (!(await getChatGPTUser())) throw new ApiError("请先登录后使用。", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new ApiError("请求来源不受支持。", 403);
    const key = request.headers.get("x-listenhub-key")?.trim();
    if (!key || key.length > 1024 || !/^[\x21-\x7e]+$/.test(key)) throw new ApiError("请先填写有效的 ListenHub API Key。", 401);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError("请发送 JSON 请求。", 415);
    if (Number(request.headers.get("content-length") || 0) > 64000) throw new ApiError("请求内容过大。", 413);
    const raw = await request.text();
    if (raw.length > 64000) throw new ApiError("请求内容过大。", 413);
    let body;
    try { body = JSON.parse(raw); } catch { throw new ApiError("请求格式无效。"); }
    const response = await handleAction(body?.action, body?.data, key);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    const err = error instanceof ApiError ? error : new ApiError("服务暂时不可用，请稍后重试。", 502);
    return Response.json({ error: err.message, uncertain: err.uncertain, retryAfter: err.retryAfter }, { status: err.status, headers: { "Cache-Control": "no-store", ...(err.retryAfter ? { "Retry-After": String(err.retryAfter) } : {}) } });
  }
}
