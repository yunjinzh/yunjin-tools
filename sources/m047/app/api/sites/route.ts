import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { siteCards } from "@/db/schema";
import { identityRequired, requirePortalIdentity } from "@/lib/portal-auth";
import { apiError, listSites, parseSiteInput } from "@/lib/site-service";

export async function GET(request: Request) {
  if (!requirePortalIdentity(request)) return identityRequired();
  try {
    return Response.json({ sites: await listSites() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  if (!requirePortalIdentity(request)) return identityRequired();
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = parseSiteInput(payload);
    const db = getDb();
    const [last] = await db
      .select({ sortOrder: siteCards.sortOrder })
      .from(siteCards)
      .orderBy(desc(siteCards.sortOrder))
      .limit(1);
    const now = new Date().toISOString();
    const [created] = await db.insert(siteCards).values({
      id: `custom_${crypto.randomUUID()}`,
      ...input,
      sortOrder: (last?.sortOrder ?? 0) + 10,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return Response.json({ site: { ...created, source: "manual" } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
