import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import 'pdfjs-dist/legacy/web/pdf_viewer.css';
import './style.css';
import './integration.css';
import { listBooks, getBook, saveBook, updateBook, deleteBook, loadSettings, saveSettings } from './storage.js';
import { fileTitle, formatBytes, progressPercent, clampPage, validatePdfFile } from './model.js';
import { icon, fillIcons } from './icons.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
globalThis.pdfjsLib = pdfjs;
const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let books = [], activeBook = null, loadingTask = null, viewer = null, linkService = null, eventBus = null;
let location = null, restoring = false, openSequence = 0, saveTimer = 0, pendingDelete = null, importing = false;
let cancelViewerReady = null;
let settings = loadSettings();
let toastTimer;

function toast(message, error = false) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.toggle('toast-error', error);
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, error ? 6500 : 3500);
}

function applyTheme(theme) {
  settings = saveSettings({ ...settings, theme });
  document.body.dataset.theme = settings.theme;
  document.querySelector('meta[name=theme-color]').content = settings.theme === 'dark' ? '#1d2622' : '#f5f2eb';
  for (const radio of document.querySelectorAll('[name=theme]')) radio.checked = radio.value === settings.theme;
}

function bookCover(book, className = 'book-cover') {
  const image = typeof book.cover === 'string' && book.cover.startsWith('data:image/');
  return `<div class="${className}">${image ? `<img src="${escape(book.cover)}" alt="${escape(book.title)}的封面" loading="lazy" />` : `<span class="cover-placeholder">${icon('book')}<span>${escape(book.title)}</span></span>`}</div>`;
}

async function renderLibrary() {
  books = await listBooks();
  $('#book-count').textContent = books.length;
  $('#empty-state').hidden = books.length > 0;
  $('#book-grid').innerHTML = books.map((book) => `<article class="book-card"><button class="book-open" data-action="open-book" data-id="${escape(book.id)}" aria-label="阅读《${escape(book.title)}》">${bookCover(book)}<div class="book-meta"><h3 class="book-title">${escape(book.title)}</h3><p class="book-info">PDF <span>·</span> ${book.pageCount} 页 <span>·</span> ${formatBytes(book.size)}</p><div class="progress-track"><span class="progress-bar" style="width:${book.lastOpenedAt ? progressPercent(book.currentPage, book.pageCount) : 0}%"></span></div><p class="progress-label">${book.lastOpenedAt ? `已读 ${progressPercent(book.currentPage, book.pageCount)}%` : '还未开始，翻开看看'}</p></div></button><button class="icon-button book-menu" data-action="delete-book" data-id="${escape(book.id)}" aria-label="删除《${escape(book.title)}》">${icon('trash')}</button></article>`).join('');
  const recent = books.find((book) => book.lastOpenedAt > 0);
  $('#continue-section').hidden = !recent;
  if (recent) $('#continue-section').innerHTML = `<div class="continue-card">${bookCover(recent, 'continue-cover')}<div class="continue-content"><p class="continue-kicker">CONTINUE READING · 接着上次读</p><h2 class="continue-title">${escape(recent.title)}</h2><p class="continue-meta">第 ${recent.currentPage} / ${recent.pageCount} 页 <span>·</span> 已读 ${progressPercent(recent.currentPage, recent.pageCount)}%</p></div><button class="button button-primary continue-action" data-action="open-book" data-id="${escape(recent.id)}" aria-label="继续阅读《${escape(recent.title)}》"><span class="button-label">继续阅读</span>${icon('arrow-right')}</button></div>`;
}

function pdfOptions(data) {
  return { data, cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/standard_fonts/', wasmUrl: '/pdfjs/wasm/', iccUrl: '/pdfjs/iccs/', isEvalSupported: false, enableXfa: false };
}

function errorMessage(error) {
  if (error?.name === 'QuotaExceededError') return '设备存储空间不足，请先移除一些书籍再试。';
  if (error?.name === 'PasswordException') return '这本 PDF 需要密码，请先解密后重新导入。';
  if (['InvalidPDFException', 'FormatError', 'UnknownErrorException'].includes(error?.name)) return '无法读取这本 PDF，文件可能已损坏或格式不受支持。';
  return error?.message || '操作未完成，请重试。';
}

async function importPdf(file) {
  validatePdfFile(file);
  const buffer = await file.arrayBuffer();
  const header = new TextDecoder('latin1').decode(new Uint8Array(buffer, 0, Math.min(1024, buffer.byteLength)));
  if (!header.includes('%PDF-')) throw new Error('文件内容不是有效的 PDF，请检查后重新导入。');
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const id = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (await getBook(id)) return { id, duplicate: true };
  const task = pdfjs.getDocument(pdfOptions(new Uint8Array(buffer)));
  try {
    const doc = await task.promise;
    const metadata = await doc.getMetadata().catch(() => null);
    const metadataTitle = metadata?.info?.Title?.trim();
    const title = metadataTitle && !/^untitled$/i.test(metadataTitle) ? metadataTitle : fileTitle(file.name);
    const page = await doc.getPage(1);
    const original = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 320 / original.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
    const book = { id, title, fileName: file.name, blob: file.slice(0, file.size, 'application/pdf'), cover: canvas.toDataURL('image/webp', 0.82), size: file.size, pageCount: doc.numPages, currentPage: 1, lastOpenedAt: 0, addedAt: Date.now(), location: null };
    await saveBook(book);
    return { id, duplicate: false };
  } finally { await task.destroy(); }
}

async function importFiles(files, { sample = false } = {}) {
  if (importing || !files.length) return;
  importing = true;
  $('#import-loading').hidden = false;
  let success = 0, duplicate = 0, lastId;
  const errors = [];
  try {
    for (const [index, file] of [...files].entries()) {
      $('#import-status').textContent = `正在整理第 ${index + 1} / ${files.length} 本书…`;
      try { const result = await importPdf(file); result.duplicate ? duplicate++ : success++; lastId = result.id; }
      catch (error) { errors.push(`${file.name}：${errorMessage(error)}`); }
    }
    await renderLibrary();
    if (errors.length) toast(errors.join('；'), true);
    else if (duplicate && !success) toast('这本书已经在书架中，无需重复导入。');
    else toast(`已将 ${success} 本书放入书架${duplicate ? `，跳过 ${duplicate} 本重复书籍` : ''}。`);
    if (success) navigator.storage?.persist?.().catch(() => {});
  } finally { importing = false; $('#import-loading').hidden = true; $('#pdf-file').value = ''; }
  if (lastId && !errors.length && (sample || (success === 1 && files.length === 1))) await openBook(lastId);
}

function updatePageUi(page) {
  if (!activeBook) return;
  activeBook.currentPage = clampPage(page, activeBook.pageCount);
  $('#page-input').value = activeBook.currentPage;
  $('#page-input').max = activeBook.pageCount;
  $('#page-total').textContent = `/ ${activeBook.pageCount}`;
  $('#prev-page').disabled = activeBook.currentPage <= 1;
  $('#next-page').disabled = activeBook.currentPage >= activeBook.pageCount;
  $('#reader-progress-bar').style.width = `${progressPercent(activeBook.currentPage, activeBook.pageCount)}%`;
}

async function persistProgress() {
  clearTimeout(saveTimer);
  if (!activeBook || restoring) return;
  const id = activeBook.id;
  const patch = { currentPage: activeBook.currentPage, location, lastOpenedAt: Date.now() };
  try { await updateBook(id, patch); if (activeBook?.id === id) $('#reader-status').textContent = '进度已保存'; }
  catch (error) { if (activeBook?.id === id) { $('#reader-status').textContent = '进度未保存'; toast(errorMessage(error), true); } }
}

async function initViewer() {
  if (viewer) return;
  const components = await import('pdfjs-dist/legacy/web/pdf_viewer.mjs');
  if (viewer) return;
  eventBus = new components.EventBus();
  linkService = new components.PDFLinkService({ eventBus, externalLinkTarget: 2, externalLinkRel: 'noopener noreferrer' });
  viewer = new components.PDFViewer({ container: $('#pdf-container'), viewer: $('#pdf-viewer'), eventBus, linkService, textLayerMode: 1, annotationMode: 1, imageResourcesPath: '/pdfjs/images/', enableAutoLinking: false });
  linkService.setViewer(viewer);
  eventBus.on('pagechanging', ({ pageNumber }) => { if (!restoring && activeBook) { if (location?.pageNumber !== pageNumber) location = null; updatePageUi(pageNumber); persistProgress(); } });
  eventBus.on('updateviewarea', ({ location: next }) => {
    if (restoring || !activeBook || !next) return;
    location = { pageNumber: next.pageNumber, left: next.left, top: next.top };
    // The scroll anchor is the first visible page, which can differ from the
    // viewer's current page when the next page occupies most of the viewport.
    updatePageUi(viewer.currentPageNumber);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistProgress, 300);
  });
  eventBus.on('scalechanging', () => { if (activeBook) $('#fit-width').textContent = `${Math.round(viewer.currentScale * 100)}%`; });
  eventBus.on('pagerendered', ({ error }) => { if (error) toast('这一页渲染失败，可尝试重新打开书籍。', true); });
}

function setFit(fit) {
  if (!viewer || !activeBook) return;
  settings = saveSettings({ ...settings, fit });
  viewer.currentScaleValue = fit === 'page' ? 'page-fit' : fit === 'width' ? 'page-width' : settings.zoom;
  for (const button of document.querySelectorAll('[data-fit]')) button.setAttribute('aria-pressed', String(button.dataset.fit === fit));
}

async function loadOutline(doc, sequence) {
  const outline = await doc.getOutline().catch(() => null);
  if (sequence !== openSequence) return;
  $('#outline-list').replaceChildren();
  if (!outline?.length) {
    const note = document.createElement('p'); note.className = 'settings-note'; note.textContent = '这本 PDF 没有内置目录，可以使用底部页码跳转。'; $('#outline-list').append(note); return;
  }
  function append(items, depth = 0) {
    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'outline-item'; button.style.paddingLeft = `${16 + depth * 16}px`; button.textContent = item.title || '未命名章节';
      button.addEventListener('click', async () => { $('#outline-dialog').close(); if (item.dest) { try { await linkService.goToDestination(item.dest); } catch { toast('这个目录位置无法打开。', true); } } });
      $('#outline-list').append(button);
      if (item.items?.length) append(item.items, depth + 1);
    }
  }
  append(outline);
}

async function openBook(id, { replace = false } = {}) {
  const sequence = ++openSequence;
  cancelViewerReady?.();
  await persistProgress();
  if (sequence !== openSequence) return;
  restoring = true;
  try {
    const book = await getBook(id);
    if (sequence !== openSequence) return;
    if (!book?.blob) throw new Error('这本书已不在本机书架中，请重新导入。');
    if (loadingTask) { const previousTask = loadingTask; loadingTask = null; viewer?.setDocument(null); linkService?.setDocument(null); await previousTask.destroy(); }
    if (sequence !== openSequence) return;
    activeBook = book;
    location = book.location;
    $('#library').hidden = true; $('#reader').hidden = false; $('#page-loading').hidden = false;
    document.body.classList.add('reading');
    $('#reader-title').textContent = book.title; document.title = `${book.title} · 云金阅读`;
    updatePageUi(book.currentPage);
    await initViewer();
    if (sequence !== openSequence) return;
    const bytes = new Uint8Array(await book.blob.arrayBuffer());
    if (sequence !== openSequence) return;
    loadingTask = pdfjs.getDocument(pdfOptions(bytes));
    const doc = await loadingTask.promise;
    if (sequence !== openSequence) return;
    const ready = new Promise((resolve) => {
      const finish = (value) => { eventBus.off('pagesinit', handler); if (cancelViewerReady === cancel) cancelViewerReady = null; resolve(value); };
      const handler = () => finish(true);
      const cancel = () => finish(false);
      cancelViewerReady = cancel;
      eventBus.on('pagesinit', handler);
    });
    linkService.setDocument(doc); viewer.setDocument(doc);
    if (!(await ready) || sequence !== openSequence) return;
    setFit(settings.fit);
    const saved = book.location;
    viewer.scrollPageIntoView({ pageNumber: clampPage(saved?.pageNumber || book.currentPage, doc.numPages), destArray: saved ? [null, { name: 'XYZ' }, saved.left, saved.top, null] : undefined, ignoreDestinationZoom: true });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (sequence !== openSequence) return;
    updatePageUi(viewer.currentPageNumber);
    restoring = false;
    await persistProgress();
    if (sequence !== openSequence) return;
    await loadOutline(doc, sequence);
    if (sequence !== openSequence) return;
    $('#page-loading').hidden = true;
    const method = replace ? 'replaceState' : 'pushState';
    history[method]({ bookId: id }, '', `#book/${id}`);
  } catch (error) {
    if (sequence !== openSequence) return;
    cancelViewerReady?.();
    restoring = false; activeBook = null;
    viewer?.setDocument(null); linkService?.setDocument(null);
    const failedTask = loadingTask; loadingTask = null;
    if (failedTask) await failedTask.destroy().catch(() => {});
    if (sequence !== openSequence) return;
    $('#reader').hidden = true; $('#library').hidden = false; document.body.classList.remove('reading');
    history.replaceState(null, '', window.location.pathname + window.location.search);
    toast(errorMessage(error), true);
  }
}

async function closeBook() {
  const sequence = ++openSequence;
  cancelViewerReady?.();
  await persistProgress();
  if (sequence !== openSequence) return;
  restoring = false;
  activeBook = null; location = null;
  viewer?.setDocument(null); linkService?.setDocument(null);
  if (loadingTask) { const previousTask = loadingTask; loadingTask = null; await previousTask.destroy(); }
  if (sequence !== openSequence) return;
  $('#reader').hidden = true; $('#library').hidden = false; document.body.classList.remove('reading');
  document.title = '云金阅读 · 让阅读，慢下来';
  history.replaceState(null, '', window.location.pathname + window.location.search);
  await renderLibrary();
}

function jumpPage(value) { if (activeBook && viewer && !restoring) { viewer.currentPageNumber = clampPage(value, activeBook.pageCount); updatePageUi(viewer.currentPageNumber); persistProgress(); } }
function changeZoom(delta) {
  if (!viewer || !activeBook) return;
  const zoom = Math.round(Math.min(3, Math.max(0.5, viewer.currentScale + delta)) * 10) / 10;
  settings = saveSettings({ ...settings, fit: 'custom', zoom });
  viewer.currentScaleValue = zoom;
}

function wireEvents() {
  fillIcons(); applyTheme(settings.theme);
  $('#import-button').onclick = () => $('#pdf-file').click();
  $('#pdf-file').onchange = (event) => importFiles([...event.target.files]).catch((error) => toast(errorMessage(error), true));
  $('#sample-button').onclick = async () => {
    if (importing) return;
    try { const response = await fetch('/samples/quiet-reading.pdf'); if (!response.ok) throw new Error('示例书暂时无法打开，请稍后重试。'); const blob = await response.blob(); await importFiles([new File([blob], '把时间还给阅读.pdf', { type: 'application/pdf' })], { sample: true }); }
    catch (error) { toast(errorMessage(error), true); }
  };
  $('#back-button').onclick = () => closeBook().catch((error) => toast(errorMessage(error), true));
  $('#about-button').onclick = () => $('#about-dialog').showModal();
  $('#settings-button').onclick = () => $('#settings-dialog').showModal();
  $('#outline-button').onclick = () => $('#outline-dialog').showModal();
  $('#prev-page').onclick = () => jumpPage(activeBook.currentPage - 1);
  $('#next-page').onclick = () => jumpPage(activeBook.currentPage + 1);
  $('#page-input').onchange = (event) => jumpPage(event.target.value);
  $('#page-input').onkeydown = (event) => { if (event.key === 'Enter') { jumpPage(event.target.value); event.target.blur(); } };
  $('#zoom-in').onclick = () => changeZoom(0.2); $('#zoom-out').onclick = () => changeZoom(-0.2); $('#fit-width').onclick = () => setFit('width');
  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close]'); if (close) document.getElementById(close.dataset.close).close();
    const fit = event.target.closest('[data-fit]'); if (fit) setFit(fit.dataset.fit);
    const action = event.target.closest('[data-action]');
    if (action?.dataset.action === 'open-book') openBook(action.dataset.id).catch((error) => toast(errorMessage(error), true));
    if (action?.dataset.action === 'delete-book') { pendingDelete = action.dataset.id; const book = books.find((item) => item.id === pendingDelete); $('#delete-description').textContent = `确定将《${book?.title || '这本书'}》移出书架吗？`; $('#delete-dialog').showModal(); }
  });
  for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', (event) => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  $('#confirm-delete').onclick = async () => { if (!pendingDelete) return; try { await deleteBook(pendingDelete); $('#delete-dialog').close(); pendingDelete = null; await renderLibrary(); toast('已将这本书移出书架。'); } catch (error) { toast(errorMessage(error), true); } };
  for (const radio of document.querySelectorAll('[name=theme]')) radio.onchange = () => applyTheme(radio.value);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persistProgress(); });
  window.addEventListener('pagehide', () => persistProgress());
  window.addEventListener('popstate', () => { const id = window.location.hash.match(/^#book\/([a-f0-9]+)$/)?.[1]; if (id) openBook(id, { replace: true }); else if (activeBook) closeBook(); });
  window.addEventListener('keydown', (event) => { if (!activeBook || ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || document.querySelector('dialog[open]')) return; if (event.key === 'ArrowRight') jumpPage(activeBook.currentPage + 1); if (event.key === 'ArrowLeft') jumpPage(activeBook.currentPage - 1); });
}

async function registerOffline() {
  const status = $('#offline-status');
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) { status.textContent = import.meta.env.PROD ? '当前浏览器不支持离线启动' : '开发预览 · 联网模式'; return; }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const announceReady = () => { status.textContent = '● 离线已就绪'; status.dataset.ready = 'true'; };
    if (registration.active) announceReady();
    else { const worker = registration.installing || registration.waiting; worker?.addEventListener('statechange', () => { if (worker.state === 'activated') announceReady(); else if (worker.state === 'redundant') status.textContent = '离线准备失败，请联网刷新重试'; }); }
    await navigator.serviceWorker.ready;
    announceReady();
  } catch { status.textContent = '离线准备失败，请联网刷新重试'; }
}

async function boot() {
  wireEvents();
  const onlineLabel = () => { $('#connection-status').textContent = navigator.onLine ? '你的私人阅读角落' : '离线阅读中'; };
  window.addEventListener('online', onlineLabel); window.addEventListener('offline', onlineLabel); onlineLabel();
  await renderLibrary();
  registerOffline();
  const id = window.location.hash.match(/^#book\/([a-f0-9]+)$/)?.[1];
  if (id) await openBook(id, { replace: true });
}
boot().catch((error) => toast(errorMessage(error), true));
