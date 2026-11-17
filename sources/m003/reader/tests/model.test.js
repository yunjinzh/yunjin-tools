import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PDF_BYTES, fileTitle, formatBytes, clampPage, progressPercent, validatePdfFile } from '../src/model.js';

test('book titles preserve Chinese and strip only the final PDF extension', () => {
  assert.equal(fileTitle('  云金的书.PDF'), '云金的书');
  assert.equal(fileTitle('paper.pdf.notes.pdf'), 'paper.pdf.notes');
  assert.equal(fileTitle('.pdf'), '未命名书籍');
  assert.equal(fileTitle('  书名.pdf  '), '书名');
  assert.equal(fileTitle(), '未命名书籍');
});

test('file size labels handle boundaries and invalid input', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(-1), '0 B');
  assert.equal(formatBytes(Infinity), '0 B');
  assert.equal(formatBytes(1023), '1023 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1024 * 1024), '1.0 MB');
});

test('page navigation clamps invalid, fractional, and out-of-range values', () => {
  assert.equal(clampPage(-2, 20), 1);
  assert.equal(clampPage('8', 20), 8);
  assert.equal(clampPage(8.8, 20), 8);
  assert.equal(clampPage(100, 20), 20);
  assert.equal(clampPage(NaN, 20), 1);
  assert.equal(clampPage(Infinity, 20), 1);
  assert.equal(clampPage(5, 0), 1);
  assert.equal(clampPage(5, Infinity), 1);
});

test('reading progress remains in range and reaches 100 on the last page', () => {
  assert.equal(progressPercent(3, 10), 30);
  assert.equal(progressPercent(100, 10), 100);
  assert.equal(progressPercent(1, 1), 100);
  assert.equal(progressPercent(1, 0), 0);
  assert.equal(progressPercent(1, NaN), 0);
});

test('PDF import accepts a PDF name or MIME, including missing MIME', () => {
  assert.equal(validatePdfFile({ name: '书.PDF', type: '', size: 100 }), true);
  assert.equal(validatePdfFile({ name: 'download', type: 'application/pdf', size: 100 }), true);
  assert.equal(validatePdfFile({ name: '书.pdf', type: 'application/octet-stream', size: MAX_PDF_BYTES }), true);
});

test('PDF import rejects unsupported, empty, oversized, and missing files', () => {
  assert.throws(() => validatePdfFile({ name: '书.epub', type: 'application/epub+zip', size: 100 }), /仅支持 PDF/);
  assert.throws(() => validatePdfFile({ name: 'empty.pdf', size: 0 }), /文件是空的/);
  assert.throws(() => validatePdfFile({ name: 'big.pdf', size: MAX_PDF_BYTES + 1 }), /超过 50 MB/);
  assert.throws(() => validatePdfFile({ name: 'bad.pdf', size: NaN }), /文件是空的/);
  assert.throws(() => validatePdfFile(null), /请选择/);
});
