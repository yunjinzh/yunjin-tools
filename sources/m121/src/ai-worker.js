// SPDX-License-Identifier: AGPL-3.0-only
import { removeBackground } from '@imgly/background-removal';
let running = false;
self.onmessage = async ({ data }) => {
  if (running) return;
  running = true;
  try {
    const result = await removeBackground(data.blob, {
      publicPath: new URL('../assets/ai/', self.location.href).href,
      model: 'isnet_quint8', device: 'cpu', proxyToWorker: false, rescale: true,
      output: { format: 'image/png', quality: 1 },
      progress: (key, current, total) => self.postMessage({ type: 'progress', key, current, total })
    });
    self.postMessage({ type: 'done', blob: result });
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error?.message || error) });
  } finally { running = false; }
};
