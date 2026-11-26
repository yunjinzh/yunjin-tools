// Local photographic hemispheres. Provenance and processing are in sky-credits.json.
const TAU = 2 * Math.PI;
const DEG = 180 / Math.PI;
const profiles = [
  {name: 'clear', sourceSun: 42.98},
  {name: 'midday', sourceSun: 47.90},
  {name: 'late', sourceSun: 4.66},
  {name: 'belfast', sourceSun: 2.02},
  {name: 'bluehour', sourceSun: null},
  {name: 'overcast', sourceSun: null}
];
const weatherTint = {
  clear: [180, 198, 209, 0, 1],
  cloud: [169, 181, 199, 0, .45],
  rain: [76, 88, 104, .58, 0],
  snow: [218, 223, 228, .40, 0],
  fog: [177, 189, 194, .79, 0]
};
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function smooth(low, high, value) {
  const x = clamp((value - low) / (high - low), 0, 1);
  return x * x * (3 - 2 * x);
}

export function skyWeights(elevationDeg, weather) {
  const overcast = ({cloud: .14, rain: 1, snow: 1, fog: .94})[weather] || 0;
  const high = smooth(16, 34, elevationDeg);
  const golden = smooth(1.5, 13, elevationDeg);
  const twilight = smooth(-5, 1, elevationDeg);
  const open = 1 - overcast;
  const cumulus = weather === 'cloud' ? 1 : .20;
  return [
    open * high * (1 - cumulus),
    open * high * cumulus,
    open * (1 - high) * golden,
    open * (1 - high) * (1 - golden) * twilight,
    open * (1 - high) * (1 - golden) * (1 - twilight),
    overcast
  ];
}

// The texture uses browser display sRGB. Sample it directly in a display-space
// custom shader. CanvasTexture uses flipY=true; wrapS must be RepeatWrapping.
export const PHOTO_SKY_GLSL = `
vec3 samplePhotoSky(sampler2D atlas, vec3 direction, float sunAzimuthTurns) {
  float u = fract(0.5 + atan(direction.x, -direction.z) * 0.15915494309 - sunAzimuthTurns);
  float v = asin(clamp(direction.y, 0.0, 1.0)) * 0.63661977237;
  return texture2D(atlas, vec2(u,v)).rgb;
}`;

function loadImage(name) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load sky-' + name));
    image.src = new URL('./sky-' + name + '.webp', import.meta.url).href;
  });
}

// Keep the horizon and the zenith fixed, and map the source's broad bright
// region towards today's solar altitude. The original sun disk was removed.
function drawLayer(ctx, source, sourceSun, elevation, width, height) {
  if (sourceSun === null) {
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }
  // Restrict angular warping where the source has no resolved sun, so cloud
  // shapes remain natural even when several recorded skies are being blended.
  const targetSun = clamp(elevation, Math.max(1.0, sourceSun - 18), Math.min(82, sourceSun + 13, sourceSun * 1.48));
  const s = sourceSun / 90, t = targetSun / 90;
  const factor = s * (1 - t) / (t * (1 - s));
  const sourceHeightAt = y => {
    const angle = 1 - y / height;
    return (1 - angle * factor / (1 + (factor - 1) * angle)) * source.height;
  };
  let y0 = 0, sy0 = 0;
  for (let j = 1; j <= 32; j++) {
    const y1 = Math.round(j * height / 32);
    const sy1 = sourceHeightAt(y1);
    ctx.drawImage(source, 0, sy0, source.width, sy1 - sy0, 0, y0, width, y1 - y0);
    y0 = y1;
    sy0 = sy1;
  }
}

function addSolarDisk(ctx, width, height, elevation, intensity) {
  const edge = smooth(-.27, .25, elevation);
  if (edge <= 0 || intensity <= 0) return;
  const angle = Math.max(0, elevation) / DEG;
  const x = width * .5, y = height * (1 - elevation / 90);
  const pixelPerDegree = width / 360;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 / Math.max(.16, Math.cos(angle)), 1);
  const radius = 4.2 * pixelPerDegree;
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  const warm = 1 - smooth(0, 19, elevation);
  const green = Math.round(247 - 35 * warm);
  const blue = Math.round(225 - 95 * warm);
  glow.addColorStop(0, 'rgba(255,' + green + ',' + blue + ',.86)');
  glow.addColorStop(.12, 'rgba(255,' + green + ',' + blue + ',.51)');
  glow.addColorStop(.39, 'rgba(255,' + green + ',' + blue + ',.16)');
  glow.addColorStop(1, 'rgba(255,' + green + ',' + blue + ',0)');
  ctx.globalAlpha = intensity * edge;
  ctx.fillStyle = glow;
  ctx.fillRect(-radius,-radius,2*radius,2*radius);
  ctx.fillStyle = 'rgb(255,' + Math.round(252 - 14 * warm) + ',' + Math.round(236 - 58 * warm) + ')';
  ctx.beginPath();
  ctx.arc(0,0,.266 * pixelPerDegree,0,TAU);
  ctx.fill();
  ctx.restore();
}

let sourceImages;
export async function createPhotoSky({cpu = false, width = cpu ? 1024 : 2048} = {}) {
  if (![512,1024,2048].includes(width)) throw new RangeError('Use a sky width of 512, 1024 or 2048');
  if (!sourceImages) sourceImages = Promise.all(profiles.map(p => loadImage(p.name))).catch(error => {
    sourceImages = null;
    throw error;
  });
  const images = await sourceImages;
  const height = width / 4;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d',{alpha:false,willReadFrequently:cpu});
  let lastKey = '', pixels = null, azimuthTurns = 0;
  const mask = width - 1;
  function update(sun, weather = 'clear') {
    azimuthTurns = Math.atan2(sun.x, -sun.z) / TAU;
    const elevation = Math.asin(clamp(sun.y, -1, 1)) * DEG;
    const key = Math.round(elevation * 4) + '/' + weather;
    if (key === lastKey) return false;
    lastKey = key;
    const weights = skyWeights(elevation, weather);
    const [r, g, b, opacity, disk] = weatherTint[weather] || weatherTint.clear;
    let weightSum = 0;
    for (let i = 0; i < profiles.length; i++) {
      const weight = weights[i];
      if (weight < .0005) continue;
      weightSum += weight;
      ctx.globalAlpha = weight / weightSum;
      drawLayer(ctx, images[i], profiles[i].sourceSun, elevation, width, height);
    }
    ctx.globalAlpha = 1;
    if (opacity) {
      ctx.fillStyle = 'rgba(' + [r,g,b,opacity].join(',') + ')';
      ctx.fillRect(0,0,width,height);
    }
    const night = 1 - smooth(-15, 2, elevation);
    if (night > .0002) {
      const dark = ctx.createLinearGradient(0,0,0,height);
      dark.addColorStop(0, 'rgba(7,15,31,' + (.97 * night) + ')');
      dark.addColorStop(.70, 'rgba(19,31,49,' + (.94 * night) + ')');
      dark.addColorStop(1, 'rgba(46,55,69,' + (.86 * night) + ')');
      ctx.fillStyle = dark;
      ctx.fillRect(0,0,width,height);
    }
    addSolarDisk(ctx,width,height,elevation,disk);
    if (cpu) pixels = ctx.getImageData(0,0,width,height).data;
    return true;
  }
  // Input direction is unit length in east/up/south coordinates. The returned
  // ABGR word can be assigned directly into the software renderer's pixel view.
  function sample(x,y,z) {
    const u = .5 + Math.atan2(x,-z)/TAU - azimuthTurns;
    const tx = (u - Math.floor(u)) * width - .5;
    const ty = clamp((1 - Math.asin(clamp(y,0,1)) * (2/Math.PI)) * height - .5,0,height - 1);
    const ix = Math.floor(tx), iy = Math.floor(ty);
    const row = iy * width, nextRow = Math.min(iy + 1,height - 1) * width;
    const a = (row + (ix & mask)) * 4, b = (row + ((ix+1) & mask)) * 4;
    const c = (nextRow + (ix & mask)) * 4, d = (nextRow + ((ix+1) & mask)) * 4;
    const dx = tx - ix, dy = ty - iy;
    const wa = (1-dx)*(1-dy), wb = dx*(1-dy), wc = (1-dx)*dy, wd = dx*dy;
    const rgba = pixels;
    const red = rgba[a]*wa + rgba[b]*wb + rgba[c]*wc + rgba[d]*wd;
    const green = rgba[a+1]*wa + rgba[b+1]*wb + rgba[c+1]*wc + rgba[d+1]*wd;
    const blue = rgba[a+2]*wa + rgba[b+2]*wb + rgba[c+2]*wc + rgba[d+2]*wd;
    return (0xff000000 | (Math.round(blue)<<16) | (Math.round(green)<<8) | Math.round(red)) >>> 0;
  }
  return {canvas,update,sample,get azimuthTurns(){return azimuthTurns;}};
}
