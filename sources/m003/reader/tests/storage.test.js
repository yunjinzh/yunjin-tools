import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { listBooks, getBook, saveBook, updateBook, deleteBook, loadSettings, saveSettings } from '../src/storage.js';

test('version 1 books migrate PDF bytes into the version 2 file store', async () => {
  const legacy = await new Promise((resolve, reject) => {
    const request = indexedDB.open('yunjin-reader', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise((resolve, reject) => {
    const transaction = legacy.transaction('books', 'readwrite');
    transaction.objectStore('books').put({ id: 'legacy-book', title: '旧书架', currentPage: 2, blob: new Blob(['legacy PDF']) });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  legacy.close();
  const migrated = await getBook('legacy-book');
  assert.equal(migrated.currentPage, 2);
  assert.equal(await migrated.blob.text(), 'legacy PDF');
  assert.ok(!(await listBooks()).find((book) => book.id === 'legacy-book').blob);
  await deleteBook('legacy-book');
});

test('book storage supports CRUD, blobs, and most-recently-opened sorting', async () => {
  const first = { id: 'crud-first', title: '第一本', lastOpenedAt: 10, currentPage: 1, blob: new Blob(['%PDF-1.7']) };
  const second = { id: 'crud-second', title: '第二本', lastOpenedAt: 20, currentPage: 1 };
  await saveBook(first);
  await saveBook(second);
  assert.equal((await getBook(first.id)).title, '第一本');
  assert.equal(await (await getBook(first.id)).blob.text(), '%PDF-1.7');
  const list = await listBooks();
  assert.ok(list.every((book) => !Object.prototype.hasOwnProperty.call(book, 'blob')), 'book list contains metadata only');
  assert.ok(list.findIndex((book) => book.id === second.id) < list.findIndex((book) => book.id === first.id));
  const updated = await updateBook(first.id, { currentPage: 9, lastOpenedAt: 30 });
  assert.equal(updated.title, '第一本');
  assert.equal(updated.currentPage, 9);
  assert.equal((await getBook(first.id)).currentPage, 9);
  assert.equal(await (await getBook(first.id)).blob.text(), '%PDF-1.7', 'progress update preserves the separately stored PDF');
  assert.equal((await listBooks())[0].id, first.id);
  await deleteBook(first.id);
  await deleteBook(second.id);
  assert.equal(await getBook(first.id), undefined);
  const connection = await new Promise((resolve, reject) => {
    const request = indexedDB.open('yunjin-reader', 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const storedFile = await new Promise((resolve, reject) => {
    const request = connection.transaction('files').objectStore('files').get(first.id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  assert.equal(storedFile, undefined, 'deleting a book also deletes its PDF');
  connection.close();
});

test('updating a missing book rejects without creating a partial book', async () => {
  await assert.rejects(updateBook('missing-book', { currentPage: 4 }), /重新导入/);
  assert.equal(await getBook('missing-book'), undefined);
});

test('concurrent patches to a book preserve independent fields', async () => {
  await saveBook({ id: 'concurrent-book', title: '原书名', currentPage: 1 });
  await Promise.all([
    updateBook('concurrent-book', { currentPage: 5 }),
    updateBook('concurrent-book', { title: '新书名' }),
  ]);
  const result = await getBook('concurrent-book');
  assert.equal(result.currentPage, 5);
  assert.equal(result.title, '新书名');
  await updateBook('concurrent-book', { id: 'unexpected-id' });
  assert.equal((await getBook('concurrent-book')).id, 'concurrent-book');
  assert.equal(await getBook('unexpected-id'), undefined);
  await deleteBook('concurrent-book');
});

test('saving a book without a valid ID rejects', async () => {
  await assert.rejects(saveBook({ title: '没有标识' }), /有效标识/);
});

test('progress patches reject PDF replacement rather than copying file bytes', async () => {
  await saveBook({ id: 'no-file-patch', title: '稳定文件', blob: new Blob(['original']) });
  await assert.rejects(updateBook('no-file-patch', { blob: new Blob(['replacement']) }), /不能替换 PDF/);
  assert.equal(await (await getBook('no-file-patch')).blob.text(), 'original');
  await deleteBook('no-file-patch');
});

test('settings merge validated values and recover from corrupt storage', () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(loadSettings(), { theme: 'light', zoom: 1, fit: 'width' });
  saveSettings({ theme: 'dark', zoom: 1.5 });
  assert.deepEqual(loadSettings(), { theme: 'dark', zoom: 1.5, fit: 'width' });
  saveSettings({ fit: 'page', theme: 'invalid', zoom: -1, unknown: true });
  assert.deepEqual(loadSettings(), { theme: 'dark', zoom: 1.5, fit: 'page' });
  values.set('yunjin-reader-settings', '{broken');
  assert.deepEqual(loadSettings(), { theme: 'light', zoom: 1, fit: 'width' });
  values.set('yunjin-reader-settings', 'null');
  assert.deepEqual(loadSettings(), { theme: 'light', zoom: 1, fit: 'width' });
  delete globalThis.localStorage;
});

test('unavailable local settings storage never prevents reading', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
  assert.deepEqual(loadSettings(), { theme: 'light', zoom: 1, fit: 'width' });
  assert.deepEqual(saveSettings({ theme: 'sepia' }), { theme: 'sepia', zoom: 1, fit: 'width' });
  delete globalThis.localStorage;
});
