import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > 200) {
    return NextResponse.json({ error: "请输入有效地点" }, { status: 400 });
  }
  try {
    const endpoint = new URL("https://nominatim.openstreetmap.org/search");
    endpoint.searchParams.set("q", query);
    endpoint.searchParams.set("format", "jsonv2");
    endpoint.searchParams.set("limit", "5");
    endpoint.searchParams.set("addressdetails", "1");
    const response = await fetch(endpoint, {
      headers: {
        "user-agent": "GeoSceneBuilder/1.0 (geocoder)",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.7",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Nominatim 返回 ${response.status}`);
    const results = await response.json();
    return NextResponse.json({ results }, { headers: { "cache-control": "public, max-age=86400" } });
  } catch (error) {
    return NextResponse.json(
      { error: `地点搜索失败：${error instanceof Error ? error.message : String(error)}` },
      { status: 502 },
    );
  }
}
