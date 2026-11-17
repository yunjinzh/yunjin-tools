import { env } from "cloudflare:workers";
import { seeds, type Row } from "./model";
export function database() {
  if (!env.DB) throw new Error("数据库未连接");
  return env.DB;
}
export async function currentRows(): Promise<Row[]> {
  const result = await database()
    .prepare(
      "SELECT r.body FROM revisions r INNER JOIN (SELECT id,MAX(revision) AS rev FROM revisions GROUP BY id) latest ON r.id=latest.id AND r.revision=latest.rev",
    )
    .all<{ body: string }>();
  const merged = new Map(seeds.map((r) => [r.id, r]));
  for (const item of result.results) {
    const row = JSON.parse(item.body) as Row;
    merged.set(row.id, row);
  }
  return [...merged.values()];
}
export async function versions(id: string) {
  const q = await database()
    .prepare("SELECT body FROM revisions WHERE id=? ORDER BY revision DESC")
    .bind(id)
    .all<{ body: string }>();
  return [
    ...q.results.map((v) => JSON.parse(v.body) as Row),
    ...seeds.filter((s) => s.id === id),
  ];
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("Origin");
  return !origin || origin === new URL(req.url).origin;
}
export function error(message: string, status = 400) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export const noCache = { "Cache-Control": "no-store" };

export async function projectHistory(id: string) {
  const q = await database()
    .prepare(
      "SELECT body FROM revisions WHERE id=? OR json_extract(body,'$.parent')=? ORDER BY changed_at DESC",
    )
    .bind(id, id)
    .all<{ body: string }>();
  return [
    ...q.results.map((v) => JSON.parse(v.body) as Row),
    ...seeds.filter((r) => r.id === id || r.parent === id),
  ];
}
