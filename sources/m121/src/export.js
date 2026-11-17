// SPDX-License-Identifier: AGPL-3.0-only
export function pngFilename(name, withBackground = false) {
  const base = String(name || '清底图片').replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '').slice(0, 120) || '清底图片';
  return base + (withBackground ? '_背景合成' : '_透明背景') + '.png';
}

export function pngDataURL(blob) {
  return new Promise((resolve, reject) => {
    if (blob.type !== 'image/png' || !blob.size) { reject(new Error('无效的 PNG 文件')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.startsWith('data:image/png;base64,')) reject(new Error('PNG 数据编码失败'));
      else resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error || new Error('PNG 数据读取失败'));
    reader.onabort = () => reject(new Error('PNG 数据读取已取消'));
    reader.readAsDataURL(blob);
  });
}

export async function savePngToFile(blob, filename, showPicker) {
  // The picker must be the first async operation in the click handler.
  const handle = await showPicker({
    suggestedName: filename,
    types: [{ description: 'PNG 图片', accept: { 'image/png': ['.png'] } }],
    excludeAcceptAllOption: true
  });
  const writable = await handle.createWritable();
  try { await writable.write(blob); await writable.close(); }
  catch (error) {
    try { await writable.abort?.(); } catch { /* Preserve the original write error. */ }
    throw error;
  }
  return handle.name || filename;
}
