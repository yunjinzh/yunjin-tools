import type { PersonalArt } from './data/rooms';
export type EmbeddedGallery = {version: 2; storageId: string; assets: Record<string, string>; personal: PersonalArt[]};
let cached: EmbeddedGallery | null | undefined;
export function embeddedGallery(): EmbeddedGallery | null {
  if (typeof document === 'undefined') return null;
  if (cached !== undefined) return cached;
  const data = document.getElementById('atelier-data')?.textContent;
  if (!data) return cached = null;
  try { const parsed = JSON.parse(data); return cached = parsed.version === 2 && parsed.assets && Array.isArray(parsed.personal) ? parsed : null; }
  catch { return cached = null; }
}
export function galleryAsset(src: string) { return embeddedGallery()?.assets[src] ?? src; }
export function galleryStorageName() { const embedded = embeddedGallery(); return embedded ? `atelier-offline-gallery-${embedded.storageId}` : 'atelier-personal-gallery'; }
export type StoredArtwork = PersonalArt | {id: string; reset: true};
export function mergePersonalArt(initial: PersonalArt[], stored: StoredArtwork[]) {
  const all = new Map(initial.map(item => [item.id, item]));
  for (const item of stored) { if ('reset' in item) all.delete(item.id); else all.set(item.id, item); }
  return [...all.values()].map(item => ({...item, src: galleryAsset(item.src)}));
}
