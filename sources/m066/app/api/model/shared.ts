const MAX_BASE_URL_LENGTH = 500;
const MAX_API_KEY_LENGTH = 512;
const MAX_MODEL_LENGTH = 160;

export type ModelCredentials = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }

  const numbers = parts.map(Number);
  if (numbers.some((part) => part < 0 || part > 255)) return true;

  return (
    numbers[0] === 10 ||
    numbers[0] === 127 ||
    numbers[0] === 0 ||
    (numbers[0] === 169 && numbers[1] === 254) ||
    (numbers[0] === 100 && numbers[1] >= 64 && numbers[1] <= 127) ||
    (numbers[0] === 172 && numbers[1] >= 16 && numbers[1] <= 31) ||
    (numbers[0] === 192 && numbers[1] === 168) ||
    (numbers[0] === 198 && (numbers[1] === 18 || numbers[1] === 19)) ||
    numbers[0] >= 224
  );
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^\[|\]$/g, "");
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];

  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "::1" ||
    normalized === "::" ||
    Boolean(mappedIpv4 && isPrivateIpv4(mappedIpv4)) ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    isPrivateIpv4(normalized)
  );
}

export function parsePublicBaseUrl(value: string) {
  if (!value || value.length > MAX_BASE_URL_LENGTH) {
    throw new Error("API Base 地址无效。");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("API Base 不是有效的网址。");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    isBlockedHostname(url.hostname)
  ) {
    throw new Error("API Base 必须是公开可访问的 HTTPS 地址。");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

export function parsePublicImageUrl(value: string) {
  if (!value || value.length > 2_000) {
    throw new Error("模型返回的图片地址无效。");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("模型返回的图片地址无效。");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    isBlockedHostname(url.hostname)
  ) {
    throw new Error("模型返回的图片地址不安全。");
  }

  return url;
}

export function parseCredentials(input: Partial<ModelCredentials>) {
  const apiKey = input.apiKey?.trim() ?? "";
  const model = input.model?.trim() ?? "";

  if (!apiKey || apiKey.length > MAX_API_KEY_LENGTH) {
    throw new Error("请填写有效的 API Key。");
  }
  if (!model || model.length > MAX_MODEL_LENGTH) {
    throw new Error("请填写有效的模型 ID。");
  }

  return {
    apiKey,
    model,
    baseUrl: parsePublicBaseUrl(input.baseUrl?.trim() ?? ""),
  };
}

export function modelEndpoint(baseUrl: URL, pathname: string) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${pathname.replace(
    /^\/+/,
    "",
  )}`;
  return url;
}

export async function upstreamErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string; code?: string } | string;
      message?: string;
    };
    const rawMessage =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message ?? payload.message;
    if (rawMessage) {
      return rawMessage.replace(/\s+/g, " ").slice(0, 360);
    }
  } catch {
    // Some compatible APIs return HTML or an empty body. Hide it from the UI.
  }

  if (response.status === 401 || response.status === 403) {
    return "鉴权失败，请检查 API Key。";
  }
  if (response.status === 404) {
    return "接口或模型不存在，请检查 API Base 与模型 ID。";
  }
  if (response.status === 429) {
    return "请求频率或额度已达上限，请稍后再试。";
  }
  return `上游服务返回 ${response.status}。`;
}
