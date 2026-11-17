export class ClientError extends Error {
  constructor(message: string, public status = 0, public uncertain = false, public retryAfter = 0) { super(message); }
}
export async function api(action: string, data: unknown, key: string, binary = false): Promise<any> {
  if (!key) throw new ClientError("请先连接 ListenHub API Key。", 401);
  let response: Response;
  try { response = await fetch("/api/listenhub", { method: "POST", headers: { "Content-Type": "application/json", "x-listenhub-key": key }, body: JSON.stringify({ action, data }), signal: AbortSignal.timeout(binary ? 120000 : 60000) }); }
  catch { throw new ClientError(action === "create" ? "提交连接中断，任务可能已创建，请先查看云端任务。" : "网络连接中断，请稍后重试。", 0, action === "create"); }
  if (binary && response.ok) return response.blob();
  let json: any;
  try { json = await response.json(); } catch { throw new ClientError("服务器响应无法读取，请稍后重试。", response.status, action === "create"); }
  if (!response.ok) throw new ClientError(json.error || "请求失败，请稍后重试。", response.status, Boolean(json.uncertain), Number(json.retryAfter) || 0);
  return json;
}
