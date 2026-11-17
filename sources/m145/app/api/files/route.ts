import { env } from "cloudflare:workers";
import { database, error, sameOrigin } from "../../../lib/repository";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("请求来源无效。", 403);
  const limit = 20 * 1024 * 1024;
  if (Number(req.headers.get("Content-Length")) > limit + 16384)
    return error("单个文件上限为 20 MB。", 413);
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size || file.size > limit)
    return error("请选择 20 MB 以内的非空文件。");
  if (!env.BUCKET) return error("附件存储未连接。", 503);
  const id = crypto.randomUUID(),
    name = file.name.slice(0, 220);
  await env.BUCKET.put(id, file.stream());
  try {
    await database()
      .prepare("INSERT INTO uploads(id,name,size,created_at) VALUES(?,?,?,?)")
      .bind(id, name, file.size, new Date().toISOString())
      .run();
  } catch (e) {
    await env.BUCKET.delete(id);
    throw e;
  }
  return Response.json({ id, name });
}
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  const file = await database()
    .prepare("SELECT name FROM uploads WHERE id=?")
    .bind(id)
    .first<{ name: string }>();
  if (!file) return error("附件不存在。", 404);
  const obj = await env.BUCKET?.get(id);
  if (!obj) return error("附件无法读取。", 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition":
        "attachment; filename*=UTF-8''" + encodeURIComponent(file.name),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
