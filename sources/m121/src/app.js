// SPDX-License-Identifier: AGPL-3.0-only
import { fitDimensions, inferBackground, composeRGBA, paintMask, alphaBounds, cleanMask } from './core.js';
import { pngFilename, pngDataURL, savePngToFile } from './export.js';
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const AI_BUSY_LABEL = '努力抠图中，稍微等待一下，马上搞定';
const state = { mode: 'ai', view: 'result', tool: null, bitmap: null, pixels: null, mask: null, baseMask: null,
  history: [], width: 0, height: 0, name: '', ready: false, busy: false, sequence: 0, loadSequence: 0,
  zoom: 1, scale: 1, background: 'transparent', worker: null, colorWorker: null, started: 0, inputBlob: null, rawAIMask: null,
  exportBlob: null, exportDataURL: null, exportFilename: '', saving: false };
const output = $('resultCanvas'), original = $('originalCanvas'), context = output.getContext('2d', { willReadFrequently: true });
let toastTimer, liveTimer, slowTimer, dragging = 0, pointer = null, lastPoint = null, paintFrame = null;

function toast(message, delay = 4500) {
  $('toast').textContent = message; $('toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, delay);
}
function status(message) { $('statusLine').querySelector('span').textContent = message; }
function setBusy(busy, title = '') {
  state.busy = busy; $('busyOverlay').hidden = !busy; $('stage').setAttribute('aria-busy', String(busy));
  if (title) $('busyLabel').textContent = title;
  $('processBtn').disabled = busy || !state.pixels;
  $('downloadBtn').disabled = busy || !state.ready;
  $$('.mode').forEach(button => button.disabled = busy);
  $$('[data-tool], #resetMaskBtn').forEach(button => button.disabled = busy || !state.ready);
  $$('[data-view]').forEach(button => button.disabled = busy || !state.pixels || (!state.ready && button.dataset.view !== 'original'));
  $('undoBtn').disabled = busy || !state.history.length;
  ['pickColorBtn', 'autoColorBtn', 'removeColor', 'tolerance', 'feather', 'colorScope'].forEach(id => $(id).disabled = busy || !state.pixels);
  if (!busy) { clearTimeout(slowTimer); $('progressBar').parentElement.classList.remove('indeterminate'); }
}
function progress(title, detail, percent = null) {
  $('busyLabel').textContent = title; $('busyDetail').textContent = detail;
  $('progressBar').parentElement.classList.toggle('indeterminate', percent === null);
  $('progressBar').style.width = `${percent ?? 40}%`;
}
function cancelJob(showMessage = false) {
  state.sequence++; clearTimeout(liveTimer); clearTimeout(slowTimer);
  if (state.busy) {
    state.worker?.terminate(); state.worker = null;
    state.colorWorker?.terminate(); state.colorWorker = null;
  }
  setBusy(false);
  if (showMessage) { status('处理已取消，可重新处理或更换图片'); toast('已取消处理'); }
  if (showMessage) state.loadSequence++;
}
function errorMessage(message, detail = '') {
  console.warn('Qingdi:', detail || message);
  $('errorMessage').textContent = message; $('errorBox').hidden = false;
  setBusy(false); status('处理未完成，请重试或选择纯色背景模式');
}
const canvasBlob = canvas => new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('图片编码失败')), 'image/png'));

async function loadFile(file, forcedMode) {
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { toast('请上传 JPG、PNG 或 WebP 图片；此格式暂不支持'); return; }
  if (file.size > 25 * 1024 * 1024) { toast('图片超过 25 MB，请缩小文件后重试'); return; }
  const loadId = ++state.loadSequence;
  cancelJob(); $('errorBox').hidden = true;
  setBusy(true, '正在读取图片'); progress('正在读取图片', '正在准备可编辑的图片');
  status('正在读取图片…');
  let bitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { if (loadId === state.loadSequence) errorMessage('无法解码这张图片。请确认文件有效，或另存为 JPG / PNG 后重试。'); return; }
  if (loadId !== state.loadSequence) { bitmap.close(); return; }
  state.bitmap?.close(); state.bitmap = bitmap; state.ready = false; state.mask = null; state.baseMask = null; state.history = []; state.rawAIMask = null; state.inputBlob = null;
  state.name = file.name || '清底图片.png'; state.zoom = 1; setTool(null);
  const [width, height] = fitDimensions(bitmap.width, bitmap.height);
  state.width = width; state.height = height;
  original.width = output.width = width; original.height = output.height = height;
  const ctx = original.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, width, height); ctx.drawImage(bitmap, 0, 0, width, height);
  state.pixels = ctx.getImageData(0, 0, width, height);
  context.clearRect(0, 0, width, height); context.drawImage(original, 0, 0);
  $('welcome').hidden = true; $('canvasWrap').hidden = false; $('viewLabel').hidden = false;
  $('fileShort').textContent = state.name; $('fileShort').title = state.name;
  $('canvasInfo').textContent = `${width} × ${height} px${width !== bitmap.width || height !== bitmap.height ? ' · 已缩放' : ''}`;
  $('uploadText').textContent = '更换图片';
  ['zoomOut', 'zoomIn', 'zoomFit'].forEach(id => $(id).disabled = false);
  $('exportInfo').textContent = `${width} × ${height} px · PNG · 无水印`;
  if (width !== bitmap.width || height !== bitmap.height) toast(`原图 ${bitmap.width} × ${bitmap.height}，为控制内存，本次输出 ${width} × ${height} px。`, 7500);
  autoColor(false);
  if (forcedMode) setMode(forcedMode, false);
  setView('original'); resizeCanvas();
  try {
    const blob = await canvasBlob(original);
    if (loadId !== state.loadSequence) return;
    state.inputBlob = blob;
    setBusy(false);
    await processImage();
  } catch (error) { if (loadId === state.loadSequence) errorMessage('图片准备失败，请使用较小的图片重试。', error); }
}

function setMode(mode, run = true) {
  state.mode = mode; setTool(null);
  $$('.mode').forEach(button => { button.classList.toggle('active', button.dataset.mode === mode); button.setAttribute('aria-pressed', String(button.dataset.mode === mode)); });
  $('colorSettings').hidden = mode !== 'color';
  $('aiSettings').hidden = mode !== 'ai';
  $('modeHint').textContent = mode === 'ai'
    ? '自动识别画面主体，保留轮廓与细节。首次运行需加载约 55 MB 模型及运行文件。'
    : '适合底色均匀的图片。调节容差与移除范围，检查文字、孔洞与主体中的相似颜色。';
  if (state.pixels && run) processImage();
}
async function processImage() {
  if (!state.pixels || !state.inputBlob || state.busy) return;
  const token = ++state.sequence;
  state.started = performance.now(); setTool(null); $('errorBox').hidden = true;
  setBusy(true, state.mode === 'ai' ? AI_BUSY_LABEL : '正在清除背景色');
  progress(state.mode === 'ai' ? AI_BUSY_LABEL : '正在清除背景色', '图片始终留在你的设备中');
  status(state.mode === 'ai' ? 'AI 正在识别主体…' : '正在计算背景颜色…');
  if (state.mode === 'color') {
    try {
      if (!state.colorWorker) state.colorWorker = new Worker(new URL('workers/color-worker.js', location.href), { type: 'module' });
      state.colorWorker.onmessage = event => {
        if (token !== state.sequence) return;
        if (event.data.type === 'error') { errorMessage('颜色处理失败，请缩小图片后重试。', event.data.message); return; }
        finish(event.data.mask, token);
      };
      state.colorWorker.onerror = event => { if (token === state.sequence) errorMessage('纯色处理引擎未能加载，请刷新页面重试。', event.message); };
      const copy = new Uint8ClampedArray(state.pixels.data);
      state.colorWorker.postMessage({ data: copy, width: state.width, height: state.height, rgb: hexRGB($('removeColor').value),
        tolerance: Number($('tolerance').value), feather: Number($('feather').value), edgeOnly: $('colorScope').value === 'edge' }, [copy.buffer]);
    } catch (error) { errorMessage('浏览器无法启动处理引擎，请更新浏览器后重试。', error); }
    return;
  }
  try {
    if (!state.worker) state.worker = new Worker(new URL('workers/ai-worker.js', location.href), { type: 'module' });
    state.worker.onmessage = async event => {
      if (token !== state.sequence) return;
      const message = event.data;
      if (message.type === 'progress') {
        const percent = Math.round(message.current / message.total * 100);
        const model = message.key.includes('/models/');
        if (model) progress(AI_BUSY_LABEL, `${(message.current / 1048576).toFixed(1)} / ${(message.total / 1048576).toFixed(1)} MB · 首次使用需要下载`, percent);
        else if (message.key.includes('.wasm')) progress(AI_BUSY_LABEL, `${(message.current / 1048576).toFixed(1)} / ${(message.total / 1048576).toFixed(1)} MB`, percent);
        if (message.key.includes('.mjs') && percent === 100) progress(AI_BUSY_LABEL, '模型已就绪，正在本地计算。你可以随时取消。');
      } else if (message.type === 'done') {
        try {
          const image = await createImageBitmap(message.blob);
          if (token !== state.sequence) { image.close(); return; }
          const temp = document.createElement('canvas'); temp.width = state.width; temp.height = state.height;
          const ctx = temp.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0, state.width, state.height); image.close();
          const rgba = ctx.getImageData(0, 0, state.width, state.height).data;
          const mask = new Uint8ClampedArray(state.width * state.height);
          for (let i = 0; i < mask.length; i++) mask[i] = rgba[i * 4 + 3];
          temp.width = temp.height = 0;
          state.rawAIMask = mask;
          finish(cleanMask(mask, Number($('cleanup').value)), token);
        } catch (error) { errorMessage('结果解码失败，请缩小图片重试。', error); }
      } else if (message.type === 'error') {
        state.worker?.terminate(); state.worker = null;
        errorMessage('AI 模型或运行引擎未能完成处理。请检查网络后重试；内存不足时请缩小图片，或使用纯色背景模式。', message.message);
      }
    };
    state.worker.onerror = event => {
      if (token !== state.sequence) return;
      state.worker?.terminate(); state.worker = null;
      errorMessage('AI 引擎运行失败，请刷新页面并使用近期版本 Chrome / Edge 重试。纯色背景模式仍可使用。', event.message);
    };
    slowTimer = setTimeout(() => {
      if (token === state.sequence && state.busy) $('busyDetail').textContent = '仍在处理中。首次加载或较慢设备需要更长时间；可取消后切换纯色模式。';
    }, 45000);
    state.worker.postMessage({ blob: state.inputBlob });
  } catch (error) { errorMessage('当前浏览器未能启动 AI 引擎，请更新 Chrome / Edge 后重试。', error); }
}
function finish(mask, token) {
  if (token !== state.sequence) return;
  state.mask = mask; state.baseMask = new Uint8ClampedArray(mask); state.history = []; state.ready = true;
  renderResult(); setView('result'); setBusy(false);
  let visible = 0, removed = 0;
  for (let i = 0; i < mask.length; i++) { if (mask[i] > 5 && state.pixels.data[i * 4 + 3] > 5) visible++; if (mask[i] < 250) removed++; }
  const time = ((performance.now() - state.started) / 1000).toFixed(1);
  status(`${state.mode === 'ai' ? 'AI 抠图' : '纯色去底'}完成 · 用时 ${time} 秒 · 可下载 PNG`);
  if (!visible) toast('结果全部透明。请降低颜色容差、切换去底方式，或用“恢复”画笔找回内容。', 8000);
  else if (!removed) toast('未检测到明显背景变化，请调整颜色或改用另一种去底方式。', 6500);
}
function renderResult() {
  if (!state.mask) return;
  context.putImageData(new ImageData(composeRGBA(state.pixels.data, state.mask), state.width, state.height), 0, 0);
  $('undoBtn').disabled = !state.history.length || state.busy;
}
function setView(view) {
  state.view = view;
  $$('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === view); button.setAttribute('aria-pressed', String(button.dataset.view === view)); });
  original.hidden = view === 'result';
  output.hidden = view === 'original';
  original.style.clipPath = view === 'compare' ? `inset(0 ${100 - Number($('compareSlider').value)}% 0 0)` : 'none';
  $('compareLine').hidden = view !== 'compare'; $('compareControl').hidden = view !== 'compare';
  $('viewLabel').textContent = view === 'original' ? '原图' : view === 'compare' ? '左侧原图 · 右侧处理结果' : state.background === 'transparent' ? '透明背景' : '背景色预览';
  if (view !== 'result' && state.tool !== 'pick') setTool(null);
  resizeCanvas();
}
function resizeCanvas() {
  if (!state.pixels) return;
  const pad = matchMedia('(max-width:660px)').matches ? 40 : 56;
  const availableWidth = Math.max(100, $('stage').clientWidth - pad), availableHeight = Math.max(100, $('stage').clientHeight - pad);
  const fit = Math.min(availableWidth / state.width, availableHeight / state.height, 1);
  state.scale = fit * state.zoom;
  $('imageFrame').style.width = `${state.width * state.scale}px`; $('imageFrame').style.height = `${state.height * state.scale}px`;
  $('zoomValue').textContent = state.zoom === 1 ? '适应画布' : `${Math.round(state.scale * 100)}%`;
  $('zoomOut').disabled = state.zoom <= .5; $('zoomIn').disabled = state.zoom >= 6;
}
function setTool(tool) {
  state.tool = tool; $('brushCursor').hidden = true;
  $$('[data-tool]').forEach(button => { button.classList.toggle('active', button.dataset.tool === tool); button.setAttribute('aria-pressed', String(button.dataset.tool === tool)); });
  $('pickColorBtn').classList.toggle('active', tool === 'pick');
  $('imageFrame').classList.toggle('painting', tool === 'erase' || tool === 'restore');
  $('imageFrame').classList.toggle('picking', tool === 'pick');
  if ((tool === 'erase' || tool === 'restore') && state.view !== 'result') setView('result');
  if (tool === 'pick') { setView('original'); toast('点击原图中的背景区域，选择要清除的颜色'); }
}
function addHistory() {
  state.history.push(new Uint8ClampedArray(state.mask));
  if (state.history.length > 8) state.history.shift();
  $('undoBtn').disabled = false;
}
function undo() {
  if (state.busy || !state.history.length) return;
  state.mask = state.history.pop(); renderResult(); status('已撤销上一次修边');
}
function locationOnImage(event) {
  const rect = $('imageFrame').getBoundingClientRect();
  return { x: (event.clientX - rect.left) / state.scale, y: (event.clientY - rect.top) / state.scale,
    cx: event.clientX - rect.left, cy: event.clientY - rect.top };
}
function drawStroke(point) {
  const radius = Number($('brushSize').value) / (state.scale * 2);
  if (lastPoint) {
    const dist = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y), n = Math.max(1, Math.ceil(dist / Math.max(1, radius * .25)));
    for (let i = 1; i <= n; i++) paintMask(state.mask, state.width, state.height, lastPoint.x + (point.x - lastPoint.x) * i / n, lastPoint.y + (point.y - lastPoint.y) * i / n, radius, state.tool === 'restore');
  } else paintMask(state.mask, state.width, state.height, point.x, point.y, radius, state.tool === 'restore');
  lastPoint = point;
  if (!paintFrame) paintFrame = requestAnimationFrame(() => { paintFrame = null; renderResult(); });
}
function updateCursor(point) {
  const cursor = $('brushCursor'); cursor.hidden = false;
  cursor.style.left = `${point.cx}px`; cursor.style.top = `${point.cy}px`;
  cursor.style.width = cursor.style.height = `${$('brushSize').value}px`;
}
$('imageFrame').addEventListener('pointerdown', event => {
  if (state.busy || !state.pixels) return;
  const point = locationOnImage(event);
  if (state.tool === 'pick') {
    const x = Math.min(state.width - 1, Math.max(0, Math.floor(point.x))), y = Math.min(state.height - 1, Math.max(0, Math.floor(point.y)));
    const index = (y * state.width + x) * 4;
    if (state.pixels.data[index + 3] < 20) { toast('这个位置已经透明，请选择有颜色的背景'); return; }
    setRemoveColor([...state.pixels.data.slice(index, index + 3)]); setTool(null); processImage(); return;
  }
  if (!state.ready || !['erase', 'restore'].includes(state.tool)) return;
  event.preventDefault(); pointer = event.pointerId; $('imageFrame').setPointerCapture(pointer); addHistory(); lastPoint = null; drawStroke(point); updateCursor(point);
});
$('imageFrame').addEventListener('pointermove', event => {
  if (!['erase', 'restore'].includes(state.tool) || state.busy) return;
  const point = locationOnImage(event); updateCursor(point);
  if (pointer === event.pointerId) drawStroke(point);
});
const finishStroke = () => { if (pointer !== null) { pointer = null; lastPoint = null; renderResult(); status('修边已更新 · Ctrl / ⌘ + Z 可撤销'); } };
$('imageFrame').addEventListener('pointerup', finishStroke); $('imageFrame').addEventListener('pointercancel', finishStroke);
$('imageFrame').addEventListener('pointerleave', () => $('brushCursor').hidden = true);

function hexRGB(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
function setRemoveColor(rgb) {
  const hex = '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  $('removeColor').value = hex; $('removeColorHex').textContent = hex.toUpperCase();
}
function autoColor(run = true) { if (!state.pixels) return; setRemoveColor(inferBackground(state.pixels.data, state.width, state.height)); if (run) processImage(); }
function scheduleColor() { clearTimeout(liveTimer); liveTimer = setTimeout(() => { if (state.mode === 'color' && state.pixels) processImage(); }, 260); }
function setBackground(color) {
  state.background = color;
  $('imageFrame').classList.toggle('checker', color === 'transparent');
  $('imageFrame').style.backgroundColor = color === 'transparent' ? '' : color;
  $$('.swatch').forEach(button => { button.classList.toggle('selected', button.dataset.bg === color); button.setAttribute('aria-pressed', String(button.dataset.bg === color)); });
  if (state.view === 'result') $('viewLabel').textContent = color === 'transparent' ? '透明背景' : '背景色预览';
  updateDownloadLabel();
}
function updateDownloadLabel() {
  const withBg = $('includeBg').checked && state.background !== 'transparent';
  $('downloadBtn').innerHTML = `<svg><use href="#i-download"/></svg>${withBg ? '下载背景合成 PNG' : '下载透明 PNG'}`;
}
async function download() {
  if (!state.ready || state.busy) return;
  const exportImage = state.loadSequence;
  const sourceName = state.name;
  $('downloadBtn').disabled = true;
  try {
    let bounds = { x: 0, y: 0, width: state.width, height: state.height };
    if ($('trimExport').checked) {
      const trimmed = alphaBounds(context.getImageData(0, 0, state.width, state.height).data, state.width, state.height);
      if (!trimmed) { toast('当前结果全透明，无法裁切。请恢复主体后再下载。'); return; }
      bounds = trimmed;
    }
    const target = document.createElement('canvas'); target.width = bounds.width; target.height = bounds.height;
    const ctx = target.getContext('2d');
    const withBackground = $('includeBg').checked && state.background !== 'transparent';
    if (withBackground) { ctx.fillStyle = state.background; ctx.fillRect(0, 0, target.width, target.height); }
    ctx.drawImage(output, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
    const blob = await canvasBlob(target);
    const dataURL = await pngDataURL(blob);
    if (state.loadSequence !== exportImage) { target.width = target.height = 0; return; }
    state.exportBlob = blob; state.exportDataURL = dataURL; state.exportFilename = pngFilename(sourceName, withBackground);
    setExportFeedback('ready');
    $('saveExport').href = dataURL;
    $('saveExport').download = state.exportFilename;
    $('directDownload').href = dataURL;
    $('directDownload').download = state.exportFilename;
    $('directDownload').hidden = !canChooseSaveLocation();
    $('copyExport').hidden = !window.isSecureContext || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined';
    $('exportSaveStatus').textContent = canChooseSaveLocation()
      ? '点击“保存 PNG”选择保存位置；也可使用直接下载。'
      : '点击保存下载 PNG；也可右键或长按上方图片保存。';
    $('exportPreview').src = dataURL;
    $('exportSummary').textContent = `${bounds.width} × ${bounds.height} px · ${(blob.size / 1024).toFixed(0)} KB · ${withBackground ? '已添加背景色' : '透明 PNG'}`;
    $('exportDialog').showModal();
    target.width = target.height = 0;
    status('PNG 已生成，点击“保存 PNG”下载到设备');
  } catch (error) { toast('导出失败，请关闭其他占用内存的页面后重试'); console.warn(error); }
  finally { $('downloadBtn').disabled = !state.ready || state.busy; }
}

function canChooseSaveLocation() {
  return window.isSecureContext && window.top === window.self && typeof window.showSaveFilePicker === 'function';
}

function setExportFeedback(phase, detail = '') {
  const labels = {
    ready: ['保存 PNG', '', 'i-download'],
    saving: ['正在保存…', '正在保存图片', 'i-download'],
    saved: ['已保存 · 再存一份', '图片保存成功', 'i-check'],
    requested: ['已发起下载 · 再下载', '已发起 PNG 下载', 'i-download'],
    cancelled: ['重新保存 PNG', '已取消保存', 'i-undo'],
    error: ['重新保存 PNG', '保存未完成', 'i-close']
  };
  const [buttonLabel, title, icon] = labels[phase];
  $('exportDialog').dataset.saveState = phase;
  $('saveExportLabel').textContent = buttonLabel;
  $('saveExportIcon').setAttribute('href', `#${icon}`);
  $('exportFeedbackIcon').setAttribute('href', `#${icon}`);
  $('exportFeedback').hidden = phase === 'ready';
  $('exportFeedbackTitle').textContent = title;
  $('exportFeedbackDetail').textContent = detail;
}

function downloadRequested() {
  setExportFeedback('requested', '请在浏览器下载列表中查看 PNG 文件。');
  $('exportSaveStatus').textContent = '需要再次下载时，可点击上方按钮；也可右键 / 长按预览图保存。';
  status('已发起 PNG 下载 · 请查看浏览器下载列表');
}

function saveExport(event) {
  if (state.saving) { event.preventDefault(); return; }
  // On supported desktop browsers, write the file directly after the user
  // chooses its location instead of relying on the browser's download manager.
  if (canChooseSaveLocation()) { event.preventDefault(); void saveToLocation(); return; }
  // The visible link has the complete PNG before the click. Let the browser
  // perform its normal download action without synthetic clicks or awaited work.
  downloadRequested();
}

async function saveToLocation() {
  if (!state.exportBlob || state.saving) return;
  state.saving = true; $('saveExport').setAttribute('aria-disabled', 'true');
  setExportFeedback('saving', '请选择保存位置，完成后会在这里显示保存结果。');
  try {
    const name = await savePngToFile(state.exportBlob, state.exportFilename, options => window.showSaveFilePicker(options));
    setExportFeedback('saved', `已保存文件：${name}`);
    $('exportSaveStatus').textContent = '图片已保存到你选择的位置，可继续处理下一张图片。';
    status('PNG 已保存成功 · 可继续处理下一张图片');
    toast('PNG 已保存到你选择的位置');
  } catch (error) {
    setExportFeedback(error.name === 'AbortError' ? 'cancelled' : 'error', error.name === 'AbortError'
      ? '图片仍保留在此窗口，可随时重新保存。'
      : '请尝试“直接下载 PNG”，或右键 / 长按上方图片保存。');
    $('exportSaveStatus').textContent = '预览图片仍可使用，重新保存即可继续。';
    status(error.name === 'AbortError' ? '保存已取消 · 可重新保存' : 'PNG 保存未完成 · 请重试');
    if (error.name !== 'AbortError') $('directDownload').hidden = false;
  } finally { state.saving = false; $('saveExport').removeAttribute('aria-disabled'); }
}

async function copyExport() {
  if (!state.exportBlob) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': state.exportBlob })]);
    $('exportSaveStatus').textContent = '图片已复制，可粘贴到支持透明 PNG 的图像编辑软件中保存。';
  } catch { $('exportSaveStatus').textContent = '当前窗口未能复制图片，请使用保存 PNG 或右键保存。'; }
}
async function loadSample(kind) {
  if (kind === 'logo') {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1200, 800);
    ctx.strokeStyle = '#344d3b'; ctx.lineWidth = 7; ctx.strokeRect(210, 140, 780, 520);
    ctx.fillStyle = '#344d3b'; ctx.textAlign = 'center'; ctx.font = 'bold 150px "Microsoft YaHei", sans-serif'; ctx.fillText('清底', 600, 380);
    ctx.font = '30px sans-serif'; ctx.fillStyle = '#df7665'; ctx.fillText('LESS BACKGROUND. MORE POSSIBILITY.', 600, 470);
    ctx.strokeStyle = '#df7665'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(330, 540); ctx.lineTo(870, 540); ctx.stroke();
    $('colorScope').value = 'all'; $('tolerance').value = 20; $('toleranceValue').textContent = '20';
    const blob = await canvasBlob(canvas); await loadFile(new File([blob], '文字图案示例.png', { type: 'image/png' }), 'color'); return;
  }
  try {
    const response = await fetch(`assets/${kind === 'portrait' ? 'portrait' : 'plant'}.jpg`);
    if (!response.ok) throw new Error('sample unavailable');
    const blob = await response.blob();
    await loadFile(new File([blob], kind === 'portrait' ? '人像示例.jpg' : '植物示例.jpg', { type: 'image/jpeg' }), 'ai');
  } catch { toast('示例图片加载失败，请直接上传自己的图片'); }
}

$('uploadBtn').onclick = $('mobileUploadBtn').onclick = () => $('fileInput').click();
$('fileInput').onchange = event => { const file = event.target.files?.[0]; event.target.value = ''; loadFile(file); };
$('welcomeSample').onclick = $('plantSample').onclick = () => loadSample('plant');
$('portraitSample').onclick = () => loadSample('portrait'); $('logoSample').onclick = () => loadSample('logo');
$$('.mode').forEach(button => button.onclick = () => setMode(button.dataset.mode));
$$('[data-view]').forEach(button => button.onclick = () => setView(button.dataset.view));
$$('[data-tool]').forEach(button => button.onclick = () => setTool(state.tool === button.dataset.tool ? null : button.dataset.tool));
$$('.swatch').forEach(button => button.onclick = () => setBackground(button.dataset.bg));
$('customBg').oninput = event => setBackground(event.target.value);
$('processBtn').onclick = $('retryBtn').onclick = () => processImage();
$('colorFallbackBtn').onclick = () => setMode('color'); $('cancelBtn').onclick = () => cancelJob(true);
$('downloadBtn').onclick = download; $('includeBg').onchange = updateDownloadLabel;
$('saveExport').onclick = saveExport;
$('directDownload').onclick = event => { if (state.saving) { event.preventDefault(); return; } downloadRequested(); };
$('copyExport').onclick = copyExport;
$('undoBtn').onclick = undo;
$('resetMaskBtn').onclick = () => { if (!state.baseMask) return; addHistory(); state.mask = new Uint8ClampedArray(state.baseMask); renderResult(); toast('已恢复到本次自动处理结果'); };
$('brushSize').oninput = event => $('brushValue').textContent = event.target.value;
$('autoColorBtn').onclick = () => autoColor();
$('pickColorBtn').onclick = () => setTool(state.tool === 'pick' ? null : 'pick');
$('removeColor').oninput = event => { $('removeColorHex').textContent = event.target.value.toUpperCase(); scheduleColor(); };
['tolerance', 'feather'].forEach(id => $(id).oninput = () => { $(id + 'Value').textContent = $(id).value; scheduleColor(); });
$('colorScope').onchange = scheduleColor;
$('cleanup').oninput = () => {
  $('cleanupValue').textContent = $('cleanup').value;
  if (!state.rawAIMask || state.busy || state.mode !== 'ai') return;
  state.mask = cleanMask(state.rawAIMask, Number($('cleanup').value));
  state.baseMask = new Uint8ClampedArray(state.mask); state.history = []; renderResult();
  status('背景净化已更新，手动修边已重置');
};
$('compareSlider').oninput = () => { original.style.clipPath = `inset(0 ${100 - Number($('compareSlider').value)}% 0 0)`; $('compareLine').style.left = `${$('compareSlider').value}%`; };
$('zoomIn').onclick = () => { state.zoom = Math.min(6, state.zoom * 1.35); resizeCanvas(); };
$('zoomOut').onclick = () => { state.zoom = Math.max(.5, state.zoom / 1.35); resizeCanvas(); };
$('zoomFit').onclick = () => { state.zoom = 1; resizeCanvas(); };
new ResizeObserver(resizeCanvas).observe($('stage'));
const isTyping = target => /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName) || target?.isContentEditable;
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTyping(event.target)) { event.preventDefault(); undo(); }
  if (event.key === 'Escape') setTool(null);
});
document.addEventListener('paste', event => {
  if (isTyping(event.target) || document.querySelector('dialog[open]')) return;
  const item = [...(event.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
  if (item) { event.preventDefault(); loadFile(item.getAsFile()); }
});
document.addEventListener('dragenter', event => {
  if (![...(event.dataTransfer?.types || [])].includes('Files')) return;
  event.preventDefault(); dragging++; $('dropOverlay').hidden = false;
});
document.addEventListener('dragover', event => { if ([...(event.dataTransfer?.types || [])].includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; } });
document.addEventListener('dragleave', event => { event.preventDefault(); dragging = Math.max(0, dragging - 1); if (!dragging) $('dropOverlay').hidden = true; });
document.addEventListener('drop', event => {
  event.preventDefault(); dragging = 0; $('dropOverlay').hidden = true;
  const files = event.dataTransfer?.files; if (files?.length) { if (files.length > 1) toast('本工具一次处理一张图片，已选择第一张'); loadFile(files[0]); }
});
function showDialog(id) { $(id).showModal(); }
$('helpOpen').onclick = () => showDialog('helpDialog');
$('sourceOpen').onclick = $('footerSource').onclick = () => showDialog('sourceDialog');
$$('dialog').forEach(dialog => { dialog.querySelector('[data-close]').onclick = () => dialog.close(); dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }); });
setMode('ai', false); setBusy(false);
