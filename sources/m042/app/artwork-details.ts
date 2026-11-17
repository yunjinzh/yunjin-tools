import type { Artwork, PersonalArt } from './data/rooms';

export function artworkDetails(base: Artwork, personal?: PersonalArt): Artwork {
  if (!personal) return base;
  // Earlier saved exhibits contain only an image and filename. Do not inherit
  // the original painting's authorship or interpretation for those images.
  return {
    ...base,
    title: personal.name || '未命名作品',
    image: personal.src,
    artist: personal.artist ?? '未署名',
    year: personal.year ?? '',
    originalTitle: personal.originalTitle ?? '',
    medium: personal.medium ?? '',
    sourceName: personal.sourceName ?? '个人收藏',
    sourceUrl: personal.sourceUrl ?? '',
    description: personal.description ?? [],
  };
}

export function artworkDraft(base: Artwork, personal?: PersonalArt): PersonalArt {
  const art = artworkDetails(base, personal);
  return {
    id: base.id,
    src: art.image,
    name: art.title,
    artist: art.artist,
    year: art.year,
    originalTitle: art.originalTitle ?? '',
    medium: art.medium ?? '',
    sourceName: art.sourceName,
    sourceUrl: art.sourceUrl,
    description: [...art.description],
    fit: personal?.fit ?? 'contain',
    width: personal?.width ?? base.width,
    height: personal?.height ?? base.height,
    imageChanged: personal?.imageChanged ?? (!!personal && personal.src !== base.image),
  };
}

export function validateArtworkDraft(draft: PersonalArt): PersonalArt {
  const limits = { name: 100, artist: 100, year: 80, originalTitle: 180, medium: 120, sourceName: 160, sourceUrl: 1000 } as const;
  const result = { ...draft };
  for (const [key, max] of Object.entries(limits)) {
    const field = key as keyof typeof limits;
    const value = (draft[field] ?? '').trim();
    if (value.length > max) throw new Error('文字超过长度限制，请适当精简。');
    result[field] = value;
  }
  if (!result.name) throw new Error('请填写作品名称。');
  if (result.sourceUrl && !/^https?:\/\//i.test(result.sourceUrl)) throw new Error('资料链接请填写以 https:// 或 http:// 开头的网址。');
  result.description = (draft.description ?? []).map(p => p.trim()).filter(Boolean);
  if (result.description.join('\n\n').length > 6000) throw new Error('作品讲解请控制在 6000 字以内。');
  return result;
}
