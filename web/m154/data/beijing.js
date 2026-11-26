// Decodes the locally bundled ODbL database in data/beijing.osm.bin.
// Geometry retains WGS84 polygon holes. Missing height and level tags stay null.
let cached;
export function loadBeijing() {
  if (!cached) cached = fetch(new URL('./beijing.osm.bin', import.meta.url))
    .then(response => {
      if (!response.ok) throw new Error(`北京空间数据读取失败（${response.status}）`);
      return response.arrayBuffer();
    }).then(decodeBeijing).catch(error => { cached = undefined; throw error; });
  return cached;
}

export function decodeBeijing(buffer) {
  const bytes = new Uint8Array(buffer);
  const headSize = new DataView(buffer).getUint32(0, true);
  if (headSize + 4 > bytes.length) throw new Error('城市数据头不完整');
  const raw = JSON.parse(new TextDecoder().decode(bytes.subarray(4, 4 + headSize)));
  const { meta, strings, order } = raw;
  const x0 = Math.round(meta.bounds[0] * 1e6), y0 = Math.round(meta.bounds[1] * 1e6);
  let pos = headSize + 4;
  function readVar() {
    let number = 0, factor = 1;
    while (pos < bytes.length) {
      const b = bytes[pos++];
      number += (b & 127) * factor;
      if (b < 128) return number;
      factor *= 128;
      if (factor > Number.MAX_SAFE_INTEGER) break;
    }
    throw new Error('城市数据文件包含不完整的坐标或属性');
  }
  function delta() {
    const n = readVar();
    return n % 2 ? -(n+1)/2 : n/2;
  }
  function readPath(closed) {
    const length = readVar(), path = new Array(length + Number(closed));
    let x = x0, y = y0;
    for (let j = 0; j < length; j++) {
      x += delta(); y += delta(); path[j] = [x/1e6, y/1e6];
    }
    if (closed) path[length] = path[0];
    return path;
  }
  const data = { meta };
  for (const category of order) {
    const count = meta.counts[category] || 0;
    const features = new Array(count);
    const linear = category === 'roads';
    for (let i = 0; i < count; i++) {
      const ref = readVar();
      const feature = { osmId: Math.floor(ref/2), osmType: ref%2 ? 'relation':'way', kind: strings[readVar()], name: strings[readVar()] };
      if (category === 'buildings') {
        feature.height = readVar()/100 || null;
        feature.levels = readVar()/10 || null;
        feature.neighborHeight = raw.neighborhoodHeights?.[i] || null;
      } else if (linear) {
        feature.width = readVar()/100 || null;
        feature.lanes = readVar() || null;
        feature.bridge = Boolean(readVar());
      }
      const n = readVar();
      if (linear) feature.line = readPath(false);
      else {
        feature.ring = readPath(true);
        feature.holes = new Array(n-1);
        for (let j = 1; j<n; j++) feature.holes[j-1] = readPath(true);
      }
      features[i] = feature;
    }
    data[category] = features;
  }
  if (pos !== bytes.length) throw new Error('城市数据长度校验失败');
  return data;
}
