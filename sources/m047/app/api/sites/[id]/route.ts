import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteCards, sitePreferences } from "@/db/schema";
import { catalogSiteIds } from "@/lib/site-catalog";
import { identityRequired, requirePortalIdentity } from "@/lib/portal-auth";
import { apiError, findPortalSite, parseSiteInput } from "@/lib/site-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requirePortalIdentity(request)) return identityRequired();
  try {
    const { id } = await params;
    const current = await findPortalSite(id);
    if (!current) return Response.json({ error: "未找到该站点。" }, { status: 404 });
    const payload = (await request.json()) as Record<string, unknown>;
    const input = parseSiteInput({ ...current, ...payload });
    const now = new Date().toISOString();

    if (catalogSiteIds.has(id)) {
      await getDb().insert(sitePreferences).values({
        siteId: id,
        customName: input.name,
        customDescription: input.description,
        customCategory: input.category,
        customAccent: input.accent,
        hidden: input.hidden,
        deleted: false,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: sitePreferences.siteId,
        set: {
          customName: input.name,
          customDescription: input.description,
          customCategory: input.category,
          customAccent: input.accent,
          hidden: input.hidden,
          deleted: false,
          updatedAt: now,
        },
      });
    } else {
      await getDb().update(siteCards).set({ ...input, updatedAt: now })
        .where(eq(siteCards.id, id));
    }

    return Response.json({ site: await findPortalSite(id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!requirePortalIdentity(request)) return identityRequired();
  try {
    const { id } = await params;
    if (catalogSiteIds.has(id)) {
      const now = new Date().toISOString();
      await getDb().insert(sitePreferences).values({
        siteId: id,
        hidden: false,
        deleted: true,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: sitePreferences.siteId,
        set: { deleted: true, updatedAt: now },
      });
    } else {
      await getDb().delete(siteCards).where(eq(siteCards.id, id));
    }
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
