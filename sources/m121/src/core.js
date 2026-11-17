// SPDX-License-Identifier: AGPL-3.0-only
export function fitDimensions(width, height, maxEdge = 4096, maxPixels = 8388608) {
  const scale = Math.min(1, maxEdge / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));
  return [Math.max(1, Math.floor(width * scale)), Math.max(1, Math.floor(height * scale))];
}

export function cleanMask(mask, threshold = 24) {
  const result = new Uint8ClampedArray(mask.length);
  if (!threshold) return new Uint8ClampedArray(mask);
  for (let i = 0; i < mask.length; i++) {
    const x = Math.max(0, Math.min(1, (mask[i] - threshold) / (255 - threshold)));
    result[i] = Math.round(255 * x);
  }
  return result;
}

export function inferBackground(data, width, height) {
  const samples = [], groups = new Map();
  const sample = (x, y) => {
    const i = (y * width + x) * 4;
    if (data[i + 3] < 220) return;
    const rgb = [data[i], data[i + 1], data[i + 2]];
    const key = rgb.map(v => Math.round(v / 16)).join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rgb); samples.push(rgb);
  };
  const step = Math.max(1, Math.floor(Math.max(width, height) / 100));
  for (let x = 0; x < width; x += step) { sample(x, 0); sample(x, height - 1); }
  for (let y = 0; y < height; y += step) { sample(0, y); sample(width - 1, y); }
  if (!samples.length) return [255, 255, 255];
  const dominant = [...groups.values()].sort((a, b) => b.length - a.length)[0];
  return [0, 1, 2].map(k => Math.round(dominant.reduce((s, c) => s + c[k], 0) / dominant.length));
}

export function colorMask(data, width, height, rgb, tolerance = 24, feather = 12, edgeOnly = true) {
  const count = width * height, mask = new Uint8ClampedArray(count), distance = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const j = i * 4;
    distance[i] = Math.hypot(data[j] - rgb[0], data[j + 1] - rgb[1], data[j + 2] - rgb[2]) / Math.sqrt(3);
    mask[i] = data[j + 3] === 0 ? 0 : 255;
  }
  const limit = tolerance + Math.max(1, feather);
  const alpha = i => {
    const d = distance[i];
    if (d <= tolerance) return 0;
    if (feather <= 0 || d >= limit) return 255;
    const x = (d - tolerance) / feather;
    return Math.round(255 * x * x * (3 - 2 * x));
  };
  if (!edgeOnly) {
    for (let i = 0; i < count; i++) mask[i] = alpha(i);
    return mask;
  }
  const visited = new Uint8Array(count), queue = new Uint32Array(count);
  let head = 0, tail = 0;
  const add = i => {
    if (visited[i]) return;
    visited[i] = 1;
    if (distance[i] <= limit || data[i * 4 + 3] === 0) queue[tail++] = i;
  };
  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  while (head < tail) {
    const i = queue[head++], x = i % width;
    mask[i] = alpha(i);
    if (x > 0) add(i - 1);
    if (x < width - 1) add(i + 1);
    if (i >= width) add(i - width);
    if (i < count - width) add(i + width);
  }
  return mask;
}

export function composeRGBA(original, mask, shift = 0) {
  const out = new Uint8ClampedArray(original);
  for (let i = 0; i < mask.length; i++) {
    // Keep fully transparent/opaque endpoints fixed while adjusting only transition pixels.
    const m = mask[i];
    const a = m === 0 || m === 255 ? m : Math.max(0, Math.min(255, m + shift));
    out[i * 4 + 3] = Math.round(original[i * 4 + 3] * a / 255);
  }
  return out;
}

export function paintMask(mask, width, height, x, y, radius, restore = false) {
  const x0 = Math.max(0, Math.floor(x - radius)), x1 = Math.min(width - 1, Math.ceil(x + radius));
  const y0 = Math.max(0, Math.floor(y - radius)), y1 = Math.min(height - 1, Math.ceil(y + radius));
  for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
    const d = Math.hypot(xx - x, yy - y) / radius;
    if (d > 1) continue;
    const weight = Math.min(1, (1 - d) / .18), i = yy * width + xx;
    mask[i] = Math.round(mask[i] * (1 - weight) + (restore ? 255 : 0) * weight);
  }
}

export function alphaBounds(data, width, height) {
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] < 2) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return right < 0 ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
