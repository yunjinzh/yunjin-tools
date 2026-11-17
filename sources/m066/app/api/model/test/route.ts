import {
  modelEndpoint,
  parseCredentials,
  upstreamErrorMessage,
} from "../shared";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      apiKey?: string;
      baseUrl?: string;
      model?: string;
    };
    const credentials = parseCredentials(payload);
    const endpoint = modelEndpoint(
      credentials.baseUrl,
      `models/${encodeURIComponent(credentials.model)}`,
    );

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: await upstreamErrorMessage(response) },
        { status: response.status >= 500 ? 502 : 400 },
      );
    }

    return Response.json({
      ok: true,
      message: `连接成功，已识别模型 ${credentials.model}。`,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "连接超时，请检查 API Base。"
        : error instanceof Error
          ? error.message
          : "模型连接测试失败。";
    return Response.json({ error: message }, { status: 400 });
  }
}
