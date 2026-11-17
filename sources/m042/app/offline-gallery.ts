import { composeOfflineHtml, extractOfflineData, replaceOfflineData } from '../lib/offline-document.mjs';
import { embeddedGallery } from './gallery-assets';
import type { PersonalArt } from './data/rooms';

export async function downloadGalleryHtml(personal: PersonalArt[]) {
  const embedded = embeddedGallery();
  let html: string;
  if (embedded) {
    const css = document.getElementById('atelier-styles')?.textContent;
    const javascript = document.getElementById('atelier-runtime')?.textContent;
    if (!css || !javascript) throw new Error('本地文件缺少必要资源，请重新下载本地版。');
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? '';
    html = composeOfflineHtml({css, javascript, data: embedded, favicon});
  } else {
    const response = await fetch('/offline-gallery.html', {credentials: 'same-origin'});
    if (!response.ok) throw new Error('本地版暂时未能下载，请稍后重试。');
    html = await response.text();
  }
  const data = extractOfflineData(html);
  // Keep original images as asset keys to avoid copying the same image twice.
  const assetKeys = new Map(Object.entries(data.assets as Record<string, string>).map(([path, src]) => [src, path]));
  const snapshot = personal.map(item => ({...item, src: assetKeys.get(item.src) ?? item.src}));
  const storageId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  html = replaceOfflineData(html, {...data, personal: snapshot, storageId});
  const url = URL.createObjectURL(new Blob([html], {type: 'text/html;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = '3D-无界画廊-我的布展.html'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
