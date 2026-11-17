import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isAllowedEndpoint(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && [
      "overpass-api.de",
      "overpass.kumi.systems",
      "overpass.nchc.org.tw",
      "overpass.private.coffee",
    ].includes(url.hostname);
  } catch {
    return false;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOverpassError(value: string) {
  const messages = [...value.matchAll(/<p>\s*<strong[^>]*>Error<\/strong>\s*:\s*([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean);
  return messages.slice(0, 3).join("；") || decodeHtml(value).slice(0, 700);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: string; query?: string };
    if (!body.endpoint || !isAllowedEndpoint(body.endpoint)) {
      return NextResponse.json({ error: "不受支持的 Overpass 服务地址" }, { status: 400 });
    }
    if (!body.query || body.query.length > 20_000) {
      return NextResponse.json({ error: "OSM 查询为空或过长" }, { status: 400 });
    }

    const response = await fetch(body.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        accept: "application/json",
        "user-agent": "GeoSceneBuilder/1.0 (OSM 3D scene generator)",
      },
      body: new URLSearchParams({ data: body.query }),
      signal: AbortSignal.timeout(95_000),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = extractOverpassError(await response.text());
      return NextResponse.json(
        { error: `Overpass 返回 ${response.status}: ${message || response.statusText}` },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ data, endpoint: body.endpoint });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `OSM 请求失败：${message}` }, { status: 502 });
  }
}
