import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { siteCards, sitePreferences } from "@/db/schema";
import { Accent, chatGptSites } from "@/lib/site-catalog";

export const accentValues = ["coral", "blue", "green", "violet", "amber", "slate"] as const;

export type SiteInput = {
  name: string;
  description: string;
  url: string | null;
  category: string;
  accent: Accent;
  hidden: boolean;
  published: boolean;
  versionCount: number;
};

export type PortalSite = SiteInput & {
  id: string;
  source: "chatgpt" | "manual";
  createdAt: string;
  updatedAt: string;
};

function requiredText(value: unknown, field: string, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${field}不能为空。`);
  if (text.length > maxLength) throw new Error(`${field}不能超过 ${maxLength} 个字符。`);
  return text;
}

function optionalText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > maxLength) throw new Error(`内容不能超过 ${maxLength} 个字符。`);
  return text;
}

function optionalWebUrl(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("站点地址格式不正确。");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("站点地址仅支持 HTTP 或 HTTPS。");
  }
  return parsed.toString();
}

export function parseSiteInput(payload: Record<string, unknown>): SiteInput {
  const requestedAccent = typeof payload.accent === "string" ? payload.accent : "coral";
  const url = optionalWebUrl(payload.url);
  const requestedVersionCount = Number(payload.versionCount ?? 1);
  return {
    name: requiredText(payload.name, "站点名称", 100),
    description: optionalText(payload.description, 260),
    url,
    category: requiredText(payload.category || "其他", "分类", 40),
    accent: accentValues.includes(requestedAccent as Accent)
      ? (requestedAccent as Accent)
      : "coral",
    hidden: Boolean(payload.hidden),
    published: Boolean(payload.published) && Boolean(url),
    versionCount: Number.isFinite(requestedVersionCount)
      ? Math.max(0, Math.min(999, Math.floor(requestedVersionCount)))
      : 1,
  };
}

export async function listSites(): Promise<PortalSite[]> {
  const db = getDb();
  const [preferences, manualSites] = await Promise.all([
    db.select().from(sitePreferences),
    db.select().from(siteCards).orderBy(asc(siteCards.sortOrder), asc(siteCards.createdAt)),
  ]);
  const preferenceMap = new Map(preferences.map((item) => [item.siteId, item]));

  const builtIn: PortalSite[] = chatGptSites.flatMap((item) => {
    const preference = preferenceMap.get(item.id);
    if (preference?.deleted) return [];
    return [{
      ...item,
      name: preference?.customName ?? item.name,
      description: preference?.customDescription ?? item.description,
      category: preference?.customCategory ?? item.category,
      accent: (preference?.customAccent as Accent | null) ?? item.accent,
      hidden: preference?.hidden ?? item.hidden,
      createdAt: item.updatedAt,
      updatedAt: preference?.updatedAt ?? item.updatedAt,
    }];
  });

  const manual: PortalSite[] = manualSites.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    category: item.category,
    accent: item.accent as Accent,
    hidden: item.hidden,
    published: item.published,
    versionCount: item.versionCount,
    source: "manual",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return [...manual, ...builtIn];
}

export async function findPortalSite(id: string) {
  return (await listSites()).find((site) => site.id === id) ?? null;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "请求处理失败，请稍后重试。";
  return Response.json({ error: message }, { status: 400 });
}
