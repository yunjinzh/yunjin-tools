import {
  modelEndpoint,
  parseCredentials,
  parsePublicImageUrl,
  upstreamErrorMessage,
} from "../shared";

export const runtime = "edge";

const ALLOWED_SIZES = new Set([
  "auto",
  "1024x1024",
  "1024x1536",
  "1536x1024",
]);

function decodeBase64Image(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export async function POST(request: Request) {
  try {
    const input = await request.formData();
    const image = input.get("image");
    const prompt = String(input.get("prompt") ?? "").trim();
    const size = String(input.get("size") ?? "auto");
    const credentials = parseCredentials({
      apiKey: String(input.get("apiKey") ?? ""),
      baseUrl: String(input.get("baseUrl") ?? ""),
      model: String(input.get("model") ?? ""),
    });

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return Response.json({ error: "请上传有效的图片文件。" }, { status: 400 });
    }
    if (image.size > 12 * 1024 * 1024) {
      return Response.json({ error: "图片不能超过 12 MB。" }, { status: 400 });
    }
    if (!prompt || prompt.length > 2400) {
      return Response.json({ error: "生成指令无效。" }, { status: 400 });
    }
    if (!ALLOWED_SIZES.has(size)) {
      return Response.json({ error: "输出尺寸无效。" }, { status: 400 });
    }

    const body = new FormData();
    body.set("model", credentials.model);
    body.set("image", image, image.name || "portrait.png");
    body.set("prompt", prompt);
    body.set("size", size);
    body.set("n", "1");

    const response = await fetch(
      modelEndpoint(credentials.baseUrl, "images/edits"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          Accept: "application/json",
        },
        body,
        signal: AbortSignal.timeout(120_000),
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: await upstreamErrorMessage(response) },
        { status: response.status >= 500 ? 502 : 400 },
      );
    }

    const payload = (await response.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    const result = payload.data?.[0];

    if (result?.b64_json) {
      return new Response(decodeBase64Image(result.b64_json), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    }

    if (result?.url) {
      const remoteUrl = parsePublicImageUrl(result.url);
      const imageResponse = await fetch(remoteUrl, {
        signal: AbortSignal.timeout(30_000),
      });
      const contentType = imageResponse.headers.get("content-type") ?? "";
      if (!imageResponse.ok || !contentType.startsWith("image/")) {
        throw new Error("模型返回的图片地址无法读取。");
      }

      return new Response(imageResponse.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    }

    return Response.json(
      { error: "模型没有返回可用图片，请确认它兼容图像编辑接口。" },
      { status: 502 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "模型生成超时，请稍后重试。"
        : error instanceof Error
          ? error.message
          : "模型生成失败。";
    return Response.json({ error: message }, { status: 400 });
  }
}
