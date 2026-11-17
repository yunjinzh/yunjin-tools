export function safeEmbeddedJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function composeOfflineHtml({css, javascript, data, favicon}) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3D 无界画廊 · 本地版</title><meta name="description" content="六个展厅、二十件名画，支持图片与讲解编辑、昼夜切换和离线浏览。"><link rel="icon" href="${favicon}"><style id="atelier-styles">${css.replace(/<\/style/gi, '<\\/style')}</style></head>
<body><div id="root"><div style="padding:40px;font-family:sans-serif">正在打开无界画廊…</div></div><noscript>请在浏览器中开启 JavaScript 后重新打开画廊。</noscript>
<script id="atelier-data" type="application/json">${safeEmbeddedJson(data)}</script>
<script id="atelier-runtime">${javascript.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
}

export function replaceOfflineData(html, data) {
  const marker = /(<script id="atelier-data" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!marker.test(html)) throw new Error('本地版模板不完整，请刷新页面后再试。');
  return html.replace(marker, (_, start, end) => start + safeEmbeddedJson(data) + end);
}

export function extractOfflineData(html) {
  const match = html.match(/<script id="atelier-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('未找到本地版所需的资源，请稍后重试。');
  return JSON.parse(match[1]);
}
