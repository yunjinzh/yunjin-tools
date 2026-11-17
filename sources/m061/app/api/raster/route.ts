import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (BLOCKED_HOSTS.has(url.hostname)) return false;
    if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url || body.url.length > 4096 || !isPublicHttpUrl(body.url)) {
      return NextResponse.json({ error: "无效或不安全的栅格服务地址" }, { status: 400 });
    }

    const response = await fetch(body.url, {
      headers: { "user-agent": "GeoSceneBuilder/1.0 (raster client)" },
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `影像/地形服务返回 ${response.status} ${response.statusText}` },
        { status: 502 },
      );
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      const message = (await response.text()).slice(0, 300);
      return NextResponse.json({ error: `服务未返回图片：${message}` }, { status: 502 });
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 24 * 1024 * 1024) {
      return NextResponse.json({ error: "单张栅格图片超过24MB限制" }, { status: 413 });
    }
    return new NextResponse(buffer, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=604800",
        "x-raster-source": new URL(body.url).hostname,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `栅格请求失败：${message}` }, { status: 502 });
  }
}
