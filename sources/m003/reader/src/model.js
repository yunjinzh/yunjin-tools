export const MAX_PDF_BYTES = 50 * 1024 * 1024;

export function fileTitle(name = '') {
  const title = String(name).trim().replace(/\.pdf$/i, '').trim();
  return title || '未命名书籍';
}

export function formatBytes(bytes = 0) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return '0 B';
  if (size < 1024) return `${Math.round(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function clampPage(value, count) {
  const numericCount = Number(count);
  const total = Number.isFinite(numericCount) ? Math.max(1, Math.trunc(numericCount)) : 1;
  const page = Number(value);
  if (!Number.isFinite(page)) return 1;
  return Math.min(total, Math.max(1, Math.trunc(page)));
}

export function progressPercent(page, count) {
  const total = Number(count);
  if (!Number.isFinite(total) || total < 1) return 0;
  return Math.round((clampPage(page, total) / total) * 100);
}

export function validatePdfFile(file) {
  if (!file || typeof file.name !== 'string') {
    throw new Error('请选择一本 PDF 电子书。');
  }
  const hasPdfName = /\.pdf$/i.test(file.name);
  const mime = String(file.type || '').toLowerCase();
  if (!hasPdfName && mime !== 'application/pdf') {
    throw new Error('目前仅支持 PDF 格式，请选择 PDF 文件。');
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error('这个文件是空的，请重新选择。');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error('文件超过 50 MB，请选择小一些的 PDF。');
  }
  return true;
}
