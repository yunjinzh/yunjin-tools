import * as THREE from 'three';

// Small, deterministic surface maps complement the photographed CC0 materials.
// DataTextures avoid browser drawing dependencies and are reused across objects.
function microSurface(kind, size = 256) {
  const color = new Uint8Array(size * size * 4);
  const relief = new Uint8Array(size * size * 4);
  let seed = 2189;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const n = rand(), i = (y * size + x) * 4;
    let v = .5 + (n - .5) * .25;
    if (kind === 'paper') v = .55 + (n - .5) * .24 + Math.sin(y * 2.3) * .055 + Math.sin(x * .08 + y * .003) * .025;
    if (kind === 'metal') v = .6 + (n - .5) * .1 + Math.sin(y * 7.19) * .16;
    if (kind === 'rubber') v = .45 + Math.sin(x * 1.9) * Math.sin(y * 1.9) * .12 + (n - .5) * .14;
    if (kind === 'stone') v = .77 + Math.sin(x * .043 + Math.sin(y * .025) * 2) ** 24 * .09 + (n - .5) * .05;
    const c = Math.round(THREE.MathUtils.clamp(v, 0, 1) * 255);
    color.set([c, c, c, 255], i);
    relief.set([c, c, c, 255], i);
  }
  const texture = bytes => {
    const t = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true; t.needsUpdate = true; t.userData.shared = true;
    return t;
  };
  return { color: texture(color), relief: texture(relief) };
}

export class SurfaceLibrary {
  constructor() {
    this.cache = new Map(); this.pending = []; this.loaded = false;
    this.paper = microSurface('paper'); this.brushed = microSurface('metal');
    this.rubber = microSurface('rubber'); this.stone = microSurface('stone');
    const add = (name, p) => {
      const m = new THREE.MeshPhysicalMaterial(p); m.name = name; m.userData.shared = true;
      this.cache.set(name, m); return m;
    };
    add('cardboard', { color: '#bb915d', roughness: .91, bumpMap: this.paper.relief, bumpScale: .004, roughnessMap: null });
    add('tape', { color: '#b8955a', roughness: .31, clearcoat: .32, clearcoatRoughness: .23 });
    add('steel', { color: '#91989e', metalness: .92, roughness: .29, roughnessMap: this.brushed.color, bumpMap: this.brushed.relief, bumpScale: .0012, envMapIntensity: 1.2 });
    add('chrome', { color: '#c4c9ce', metalness: 1, roughness: .14, envMapIntensity: 1.1 });
    add('blackSteel', { color: '#252b30', metalness: .7, roughness: .34, bumpMap: this.brushed.relief, bumpScale: .0007 });
    add('paintSteel', { color: '#3e505d', metalness: .55, roughness: .39, clearcoat: .24, clearcoatRoughness: .45 });
    add('beam', { color: '#c38338', metalness: .45, roughness: .43, clearcoat: .2 });
    add('rubber', { color: '#15191d', roughness: .82, bumpMap: this.rubber.relief, bumpScale: .002 });
    add('leather', { color: '#5b3725', roughness: .62, bumpMap: this.rubber.relief, bumpScale: .004, sheen: .25, sheenColor: new THREE.Color('#9c765c') });
    add('ceramic', { color: '#eae6dc', roughness: .16, clearcoat: .5, clearcoatRoughness: .12 });
    add('glass', { color: '#d4e0df', metalness: .05, roughness: .08, transparent: true, opacity: .27, depthWrite: false, side: THREE.DoubleSide });
    add('plaster', { color: '#c9c5ba', roughness: .94, bumpMap: this.paper.relief, bumpScale: .009 });
    add('stone', { color: '#bdb9b1', roughness: .33, clearcoat: .2, bumpMap: this.stone.relief, bumpScale: .006 });
    add('concrete', { color: '#b0ada6', roughness: .78, bumpMap: this.paper.relief, bumpScale: .008 });
    add('wood', { color: '#7a5635', roughness: .51, clearcoat: .18, clearcoatRoughness: .4, bumpMap: this.paper.relief, bumpScale: .005 });
    add('woodFloor', { color: '#9d7852', roughness: .53, clearcoat: .18, clearcoatRoughness: .5 });
    add('wallTile', { color: '#d7d7d1', roughness: .27, clearcoat: .18 });
    add('brass', { color: '#9a743b', metalness: .83, roughness: .3 });
    add('cloth', { color: '#b3a48c', roughness: .99, bumpMap: this.rubber.relief, bumpScale: .004, sheen: .45 });
    add('robotShell', { color: '#afb4b7', metalness: .7, roughness: .29, clearcoat: .28, clearcoatRoughness: .22, envMapIntensity: 1.05 });
    add('robotDark', { color: '#171b20', metalness: .3, roughness: .38, clearcoat: .45, clearcoatRoughness: .18 });
    add('robotJoint', { color: '#343c42', metalness: .85, roughness: .25, roughnessMap: this.brushed.color });
  }
  get(name) { return this.cache.get(name) || this.cache.get('plaster'); }
  async load(anisotropy = 4) {
    const loader = new THREE.TextureLoader();
    const get = async (asset, channel, repeat) => {
      const t = await loader.loadAsync(`./assets/textures/${asset}_${channel}_1k.jpg`);
      t.colorSpace = channel === 'diff' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
      t.anisotropy = Math.min(8, anisotropy); t.userData.shared = true;
      return t;
    };
    const tasks = [['concrete', 'concrete_floor_02', [7,5]], ['woodFloor','wood_floor_worn',[4,3]], ['wood','wood_floor_worn',[.8,.35]]];
    await Promise.all(tasks.map(async ([name, asset, repeat]) => {
      const [map, normalMap, roughnessMap] = await Promise.all(['diff','nor_gl','rough'].map(c => get(asset,c,repeat)));
      const m = this.get(name); m.map = map; m.normalMap = normalMap; m.roughnessMap = roughnessMap;
      m.color.set(name === 'concrete' ? '#c8c6bf' : name === 'wood' ? '#a58d71' : '#c5b18f');
      m.roughness = name === 'concrete' ? .82 : .63;
      m.normalScale.set(name === 'concrete' ? .25 : .5, name === 'concrete' ? .25 : .5);
      m.bumpMap = null; m.needsUpdate = true;
    }));
    this.loaded = true;
  }
}
