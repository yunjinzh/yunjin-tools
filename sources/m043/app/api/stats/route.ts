import { getD1 } from "../../../db";

export const dynamic = "force-dynamic";

function cleanPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("/") || path.length > 220 || path === "/__total__") return null;
  return path.split("?")[0].split("#")[0] || "/";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { path?: unknown };
    const path = cleanPath(payload.path);
    if (!path) {
      return Response.json({ error: "invalid path" }, { status: 400 });
    }

    const database = getD1();
    const now = Date.now();
    const upsertSql = `
      INSERT INTO page_stats (path, views, updated_at)
      VALUES (?, 1, ?)
      ON CONFLICT(path) DO UPDATE SET
        views = page_stats.views + 1,
        updated_at = excluded.updated_at
    `;
    const displayPath = path === "/" ? "/__total__" : path;

    const results = await database.batch([
      database.prepare(upsertSql).bind(path, now),
      database.prepare(upsertSql).bind("/__total__", now),
      database.prepare("SELECT views FROM page_stats WHERE path = ?").bind(displayPath),
    ]);

    const row = results[2]?.results?.[0] as { views?: number } | undefined;
    return Response.json({ path, views: Number(row?.views ?? 0) });
  } catch (error) {
    console.error("page stats error", error);
    return Response.json({ error: "statistics unavailable" }, { status: 503 });
  }
}
