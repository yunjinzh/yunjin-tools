// SPDX-License-Identifier: AGPL-3.0-only
import { colorMask } from './core.js';
self.onmessage = ({ data: job }) => {
  try {
    const mask = colorMask(job.data, job.width, job.height, job.rgb, job.tolerance, job.feather, job.edgeOnly);
    self.postMessage({ type: 'done', mask }, [mask.buffer]);
  } catch (error) { self.postMessage({ type: 'error', message: String(error.message || error) }); }
};
