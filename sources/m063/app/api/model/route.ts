type ProviderId = "openai" | "anthropic" | "deepseek" | "qwen";

type RelayPayload = {
  provider?: unknown;
  apiKey?: unknown;
  model?: unknown;
  system?: unknown;
  user?: unknown;
};

const PROVIDERS: Record<ProviderId, { endpoint: string; protocol: "openai" | "anthropic" }> = {
  openai: {
    endpoint: "https://api.openai.com/v1/chat/completions",
    protocol: "openai",
  },
  anthropic: {
    endpoint: "https://api.anthropic.com/v1/messages",
    protocol: "anthropic",
  },
  deepseek: {
    endpoint: "https://api.deepseek.com/chat/completions",
    protocol: "openai",
  },
  qwen: {
    endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    protocol: "openai",
  },
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const MAX_REQUEST_BYTES = 800_000;
const MAX_PROMPT_CHARACTERS = 600_000;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function providerErrorMessage(status: number, detail: string) {
  if (detail) return detail;
  if (status === 401 || status === 403) return "API Key 无效、权限不足，或当前 Key 无权使用所选模型。";
  if (status === 404) return "模型或接口不存在，请核对模型名称。";
  if (status === 429) return "请求过于频繁或账户额度不足，请稍后重试并检查余额。";
  if (status >= 500) return "模型服务商暂时不可用，请稍后重试。";
  return `模型服务商返回错误（${status}）。`;
}

function readProviderError(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  if (record.error && typeof record.error === "object") {
    const message = (record.error as Record<string, unknown>).message;
    if (typeof message === "string") return message.slice(0, 600);
  }
  if (typeof record.message === "string") return record.message.slice(0, 600);
  return "";
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: { code: "payload_too_large", message: "论文文本过长，请缩短内容后重试。" } }, 413);
  }

  let rawPayload = "";
  let payload: RelayPayload;
  try {
    rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > MAX_REQUEST_BYTES) {
      return json({ error: { code: "payload_too_large", message: "论文文本过长，请缩短内容后重试。" } }, 413);
    }
    payload = JSON.parse(rawPayload) as RelayPayload;
  } catch {
    return json({ error: { code: "invalid_json", message: "请求内容格式无效，请刷新页面后重试。" } }, 400);
  }

  const provider = asTrimmedString(payload.provider) as ProviderId;
  const apiKey = asTrimmedString(payload.apiKey);
  const model = asTrimmedString(payload.model);
  const system = asTrimmedString(payload.system);
  const user = asTrimmedString(payload.user);
  const config = PROVIDERS[provider];

  if (!config) {
    return json({ error: { code: "unsupported_provider", message: "本站转发仅支持 OpenAI、Claude、DeepSeek 和通义千问。" } }, 400);
  }
  if (!apiKey || apiKey.length > 500) {
    return json({ error: { code: "invalid_api_key", message: "请填写有效的 API Key。" } }, 400);
  }
  if (!model || model.length > 160) {
    return json({ error: { code: "invalid_model", message: "请填写有效的模型名称。" } }, 400);
  }
  if (!system || !user || system.length + user.length > MAX_PROMPT_CHARACTERS) {
    return json({ error: { code: "invalid_prompt", message: "论文文本为空或过长，请重新上传较短的 PDF。" } }, 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 145_000);

  try {
    const isAnthropic = config.protocol === "anthropic";
    const upstream = await fetch(config.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: isAnthropic
        ? {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          }
        : {
            "content-type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
      body: JSON.stringify(
        isAnthropic
          ? {
              model,
              max_tokens: 7000,
              system,
              messages: [{ role: "user", content: user }],
            }
          : {
              model,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
              stream: false,
            },
      ),
    });

    const upstreamText = await upstream.text();
    let upstreamJson: Record<string, unknown> = {};
    try {
      upstreamJson = upstreamText ? JSON.parse(upstreamText) as Record<string, unknown> : {};
    } catch {
      if (!upstream.ok) {
        return json({ error: { code: `provider_${upstream.status}`, message: providerErrorMessage(upstream.status, "") } }, upstream.status);
      }
      return json({ error: { code: "invalid_provider_response", message: "模型服务商返回了无法识别的内容。" } }, 502);
    }

    if (!upstream.ok) {
      const message = providerErrorMessage(upstream.status, readProviderError(upstreamJson));
      return json({ error: { code: `provider_${upstream.status}`, message } }, upstream.status);
    }

    let text = "";
    if (isAnthropic) {
      const content = Array.isArray(upstreamJson.content) ? upstreamJson.content : [];
      text = content
        .filter((item): item is { type?: string; text?: string } => Boolean(item && typeof item === "object"))
        .filter((item) => item.type === "text")
        .map((item) => typeof item.text === "string" ? item.text : "")
        .join("\n");
    } else {
      const choices = Array.isArray(upstreamJson.choices) ? upstreamJson.choices : [];
      const first = choices[0] as { message?: { content?: unknown } } | undefined;
      text = typeof first?.message?.content === "string" ? first.message.content : "";
    }

    if (!text) {
      return json({ error: { code: "empty_provider_response", message: "模型没有返回可用文本，请核对模型名称后重试。" } }, 502);
    }

    return json({ text });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "模型服务商响应超时，请缩短 PDF 或稍后重试。"
      : "转发服务暂时无法连接模型服务商，请稍后重试。";
    return json({ error: { code: "provider_unreachable", message } }, 502);
  } finally {
    clearTimeout(timer);
    rawPayload = "";
  }
}
