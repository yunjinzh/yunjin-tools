// Original procedural models for Beijing Nightline. No external model or image assets.
// Models face local +Z; feet/wheels meet y=0 and a boat floats at water y=0.
import * as THREE from './vendor/three.module.js';

const cache = new Map();
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .65, ...extra });
const rubber = mat('#15191b', { roughness: .95 });
const metal = mat('#a9b6b8', { metalness: .75, roughness: .3 });
const trim = mat('#20292d', { metalness: .3, roughness: .42 });
const glass = mat('#365364', { metalness: .45, roughness: .16, transparent: true, opacity: .84, side: THREE.DoubleSide });
const cream = mat('#e8dfc5');
const headlamp = mat('#fff2cd', { emissive: '#ffe1a0', emissiveIntensity: 1.1, roughness: .15 });
const taillamp = mat('#9c1e20', { emissive: '#f13223', emissiveIntensity: .75 });

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function box(parent, w, h, d, material, x = 0, y = 0, z = 0) {
  return mesh(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}
function sphere(parent, radius, material, x, y, z, width = 8, height = 5) {
  return mesh(parent, new THREE.SphereGeometry(radius, width, height), material, x, y, z);
}
function rod(parent, a, b, radius, material, radial = 6) {
  const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
  const direction = bv.clone().sub(av);
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, direction.length(), radial), material);
  object.position.copy(av.add(bv).multiplyScalar(.5));
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return object;
}
function polygon(parent, points, material) {
  const vertices = [];
  for (let i = 1; i < points.length - 1; i++) vertices.push(...points[0], ...points[i], ...points[i + 1]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return mesh(parent, geo, material);
}
function prism(parent, profile, width, material) {
  const geo = new THREE.BufferGeometry(), positions = [], ids = [];
  for (const x of [-width / 2, width / 2]) for (const [z, y] of profile) positions.push(x, y, z);
  const n = profile.length;
  for (let i = 1; i < n - 1; i++) ids.push(0, i + 1, i, n, n + i, n + i + 1);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ids.push(i, j, n + j, i, n + j, n + i);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(ids);
  geo.computeVertexNormals();
  return mesh(parent, geo, material);
}
function textMaterial(text, background = '#143883', foreground = '#f6f4e5', width = 256, height = 96) {
  const key = [text, background, foreground, width, height].join('|');
  if (cache.has(key)) return cache.get(key);
  if (typeof document === 'undefined') return mat(background);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = foreground; ctx.lineWidth = 3; ctx.strokeRect(5, 5, width - 10, height - 10);
  ctx.fillStyle = foreground;
  ctx.font = `bold ${Math.floor(height * .54)}px "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, width / 2, height * .53, width * .91);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .65, side: THREE.DoubleSide });
  cache.set(key, material);
  return material;
}
function plate(parent, z, text = '京A·02861') {
  const p = mesh(parent, new THREE.PlaneGeometry(.66, .24), textMaterial(text), 0, .56, z);
  if (z < 0) p.rotation.y = Math.PI;
}
// Static details share a vertex-colour batch; Chinese signs occupy a tiny local atlas.
// Snapshot all transforms before removing meshes (mirrors and lifebuoys have children).
function rigidRecords(root, exclude = []) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(), skip = new Set(exclude), records = [];
  function visit(node) {
    if (skip.has(node)) return;
    if (node.isMesh) records.push({ node, matrix: inverse.clone().multiply(node.matrixWorld) });
    for (const child of node.children) visit(child);
  }
  for (const child of root.children) visit(child);
  return records;
}
const atlasCache = new Map();
const solidBatchMaterial = mat('#ffffff', { vertexColors: true, metalness: .15, side: THREE.DoubleSide });
function paletteFor(records) {
  const maps = [...new Set(records.map(({ node }) => node.material.map).filter(Boolean))];
  if (!maps.length || typeof document === 'undefined') return { material: solidBatchMaterial };
  maps.sort((a, b) => a.id - b.id);
  const key = maps.map(map => map.uuid).join('|');
  if (atlasCache.has(key)) return atlasCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = Math.ceil((maps.length + 1) / 2) * 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const regions = new Map();
  maps.forEach((map, i) => {
    const x = ((i + 1) % 2) * 256 + 2, y = Math.floor((i + 1) / 2) * 128 + 2;
    ctx.drawImage(map.image, x, y, 252, 124);
    regions.set(map, [x / canvas.width, 1 - (y + 124) / canvas.height, 252 / canvas.width, 124 / canvas.height]);
  });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const palette = {
    material: mat('#ffffff', { map: texture, vertexColors: true, metalness: .15, side: THREE.DoubleSide }),
    regions, white: [128 / canvas.width, 1 - 64 / canvas.height]
  };
  atlasCache.set(key, palette);
  return palette;
}
function mergeRecords(parent, records, material = null, hinge = null) {
  if (!records.length) return null;
  const palette = material ? { material } : paletteFor(records);
  const shapes = records.map(({ node, matrix }) =>
    (node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone()).applyMatrix4(matrix));
  const count = shapes.reduce((n, shape) => n + shape.attributes.position.count, 0);
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3), uvs = new Float32Array(count * 2);
  const hinges = hinge ? new Float32Array(count) : null;
  let offset = 0;
  shapes.forEach((shape, i) => {
    const { node } = records[i], vertices = shape.attributes.position.count;
    const color = node.material.color, region = palette.regions?.get(node.material.map), uv = shape.attributes.uv;
    positions.set(shape.attributes.position.array, offset * 3);
    normals.set(shape.attributes.normal.array, offset * 3);
    let belowHinge = false;
    if (hinge) for (let ancestor = node; ancestor && ancestor !== parent; ancestor = ancestor.parent) {
      if (ancestor === hinge) { belowHinge = true; break; }
    }
    for (let v = 0; v < vertices; v++) {
      const index = offset + v;
      colors.set([color.r, color.g, color.b], index * 3);
      if (region && uv) uvs.set([region[0] + uv.getX(v) * region[2], region[1] + uv.getY(v) * region[3]], index * 2);
      else uvs.set(palette.white || [0, 0], index * 2);
      if (hinges) hinges[index] = belowHinge ? 1 : 0;
    }
    offset += vertices;
  });
  const combined = new THREE.BufferGeometry();
  combined.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  combined.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  combined.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  combined.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  if (hinges) combined.setAttribute('hingePart', new THREE.BufferAttribute(hinges, 1));
  // Only now detach originals: descendants keep their saved transforms and hinge membership.
  for (const { node } of records) { node.removeFromParent(); node.geometry.dispose(); }
  for (const shape of shapes) shape.dispose();
  const result = mesh(parent, combined, palette.material);
  result.name = hinge ? 'articulated-batch' : 'rigid-batch';
  return result;
}
function lampBatchMaterial() {
  const material = mat('#ffffff', { vertexColors: true, emissive: '#ffffff', emissiveIntensity: 1.1, roughness: .2 });
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor;\n#endif');
  };
  material.customProgramCacheKey = () => 'nightline-coloured-lamps-v1';
  return material;
}
function compactCar(group, paint) {
  const wheels = group.userData.wheels;
  const lamps = new Set([...group.userData.headlights, ...group.userData.taillights]);
  const beacons = new Set(group.userData.beacons || []);
  const records = rigidRecords(group, wheels);
  const lampRecords = records.filter(({ node }) => lamps.has(node));
  const beaconRecords = records.filter(({ node }) => beacons.has(node));
  const bodyRecords = records.filter(({ node }) => node.material === paint);
  const staticRecords = records.filter(({ node }) => node.material !== paint && !lamps.has(node) && !beacons.has(node));
  mergeRecords(group, bodyRecords, paint);
  mergeRecords(group, staticRecords);
  const light = mergeRecords(group, lampRecords, lampBatchMaterial());
  // Both arrays intentionally refer to one batch; the engine sets the same night brightness.
  group.userData.headlights = [light]; group.userData.taillights = [light];
  if (beaconRecords.length) group.userData.beacons = [mergeRecords(group, beaconRecords, lampBatchMaterial())];
  for (const wheel of wheels) mergeRecords(wheel, rigidRecords(wheel));
}
function compactLimb(limb, hinge) {
  const angle = { value: 0 }, pivot = { value: hinge.position.y };
  const material = solidBatchMaterial.clone();
  material.onBeforeCompile = shader => {
    shader.uniforms.hingeAngle = angle; shader.uniforms.hingeY = pivot;
    shader.vertexShader = 'attribute float hingePart; uniform float hingeAngle; uniform float hingeY;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>',
      '#include <beginnormal_vertex>\n if (hingePart > 0.5) { float c = cos(hingeAngle), s = sin(hingeAngle); objectNormal.yz = mat2(c, s, -s, c) * objectNormal.yz; }');
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n if (hingePart > 0.5) { float c = cos(hingeAngle), s = sin(hingeAngle); transformed.yz = mat2(c, s, -s, c) * (transformed.yz - vec2(hingeY, 0.0)) + vec2(hingeY, 0.0); }');
  };
  material.customProgramCacheKey = () => 'nightline-hinged-limb-v1';
  const batch = mergeRecords(limb, rigidRecords(limb), material, hinge);
  // Generous local bounds account for shader deformation during running and crouching.
  batch.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -.35, 0), .85);
  limb.userData.hingeAngle = angle;
}

/** Sedan is 5.15m long, 2.4m wide at mirrors, and 1.62m tall. */
export function createCar(color = '#315d5d', kind = 'sedan') {
  const group = new THREE.Group(); group.name = `vehicle-${kind}`;
  if (kind === 'taxi') color = '#d9ae45';
  if (kind === 'police') color = '#dce6e6';
  if (kind === 'sport' && color === '#315d5d') color = '#a5362e';
  const paint = mat(color, { metalness: .5, roughness: .32 });
  const roofPaint = kind === 'taxi' ? trim : paint;
  group.userData.bodyMaterials = [paint]; group.userData.wheels = [];
  group.userData.headlights = []; group.userData.taillights = [];
  group.userData.kind = kind;
  const sport = kind === 'sport', van = kind === 'van';
  const floor = sport ? .36 : .45;
  prism(group, [[-2.5, floor], [-2.48, .82], [-1.72, 1], [.9, 1.02], [1.8, .94], [2.5, .77], [2.55, floor]], 2.12, paint);
  box(group, 1.94, .11, 4.8, trim, 0, floor - .03, 0);
  box(group, 2.19, .12, .16, metal, 0, .48, 2.5);
  box(group, 2.19, .1, .17, trim, 0, .48, -2.49);
  if (van) {
    box(group, 2.04, 1.05, 2.5, paint, 0, 1.45, -.8);
    box(group, 2.07, .08, 2.56, roofPaint, 0, 2.02, -.8);
    prism(group, [[.4, 1], [.46, 1.93], [1.24, 1.93], [1.7, 1.06]], 1.9, glass);
    box(group, 1.92, .07, .76, paint, 0, 1.97, .85);
    for (const x of [-1.028, 1.028]) {
      const label = mesh(group, new THREE.PlaneGeometry(1.35, .4), textMaterial('京城速递', color, '#f5e7c9'), x, 1.48, -.7);
      label.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
      rod(group, [x, .97, -1.7], [x, 1.92, -1.7], .015, trim);
    }
    box(group, .025, .93, .025, trim, 0, 1.45, -2.06);
  } else {
    const roofY = sport ? 1.38 : 1.59;
    prism(group, [[-1.42, 1], [-.94, roofY], [.56, roofY], [1.3, 1.01]], 1.82, glass);
    box(group, 1.67, .075, 1.51, roofPaint, 0, roofY + .015, -.18);
    for (const x of [-.92, .92]) {
      rod(group, [x, 1.01, 1.3], [x * .9, roofY, .56], .04, paint);
      rod(group, [x, 1.01, -1.42], [x * .9, roofY, -.94], .055, paint);
      rod(group, [x, 1.02, -.27], [x * .9, roofY, -.27], .035, trim);
      box(group, .025, .035, 2.53, metal, x, 1.015, -.06);
      box(group, .045, .04, .2, metal, x * 1.15, .91, -.28);
      box(group, .045, .04, .2, metal, x * 1.15, .91, -1.25);
    }
    // Cabin furnishings are retained in the combined detail geometry.
    box(group, 1.63, .12, .36, trim, 0, 1.04, .7);
    for (const x of [-.44, .44]) box(group, .53, .36, .25, trim, x, 1.08, -.48);
  }
  for (const side of [-1, 1]) {
    for (const z of [-1.58, 1.55]) {
      const wheel = new THREE.Group(); wheel.position.set(side * 1.025, .43, z); group.add(wheel);
      const tire = mesh(wheel, new THREE.CylinderGeometry(.43, .43, .28, 12), rubber); tire.rotation.z = Math.PI / 2;
      const rim = mesh(wheel, new THREE.CylinderGeometry(.235, .235, .018, 10), metal, side * .151, 0, 0); rim.rotation.z = Math.PI / 2;
      const hub = mesh(wheel, new THREE.CylinderGeometry(.09, .09, .023, 8), trim, side * .163, 0, 0); hub.rotation.z = Math.PI / 2;
      group.userData.wheels.push(wheel);
    }
    const mirror = box(group, .22, .16, .32, paint, side * 1.075, van ? 1.48 : 1.12, .78);
    box(mirror, .015, .095, .23, glass, side * .115, 0, -.015);
    const front = box(group, .61, .13, .07, headlamp, side * .68, .78, 2.435);
    const rear = box(group, .68, .12, .075, taillamp, side * .67, .79, -2.49);
    group.userData.headlights.push(front); group.userData.taillights.push(rear);
    box(group, .12, .06, .08, mat('#eaa535', { emissive: '#995317', emissiveIntensity: .3 }), side * .98, .78, 2.46);
  }
  for (const y of [.59, .66, .73]) box(group, .64, .025, .035, trim, 0, y, 2.53);
  const badge = sphere(group, .065, metal, 0, .86, 2.4, 6, 4); badge.scale.y = .6; badge.scale.z = .25;
  plate(group, 2.57); plate(group, -2.585);
  if (sport) {
    for (const x of [-.7, .7]) box(group, .055, .2, .05, trim, x, 1.08, -1.91);
    box(group, 1.88, .075, .32, trim, 0, 1.19, -1.94);
    for (const x of [-.17, .17]) box(group, .09, .015, 1.12, trim, x, 1.015, 1.75);
  }
  if (kind === 'taxi') {
    box(group, .66, .19, .28, cream, 0, 1.75, -.05);
    mesh(group, new THREE.PlaneGeometry(.57, .15), textMaterial('TAXI', '#eddfb8', '#182f31'), 0, 1.75, .096);
    for (const x of [-1.072, 1.072]) box(group, .025, .14, 2.7, trim, x, .77, -.1);
  }
  if (kind === 'police') {
    box(group, 1.04, .07, .27, trim, 0, 1.69, -.1);
    const red = mat('#a93630', { emissive: '#f1312a', emissiveIntensity: 1.3 });
    const blue = mat('#306da7', { emissive: '#4b9fff', emissiveIntensity: 1.3 });
    group.userData.beacons = [box(group, .43, .14, .23, red, -.27, 1.78, -.1), box(group, .43, .14, .23, blue, .27, 1.78, -.1)];
    for (const x of [-1.072, 1.072]) box(group, .025, .2, 2.2, mat('#253f66'), x, .8, -.2);
  }
  group.userData.bounds = { w: 2.4, h: van ? 2.08 : kind === 'taxi' || kind === 'police' ? 1.86 : 1.65, d: 5.4 };
  compactCar(group, paint);
  return group;
}

export function createPerson(color = '#b94d3f') {
  const group = new THREE.Group(); group.name = 'city-resident';
  const shirt = mat(color), pants = mat('#25333e'), shoe = mat('#202b30'), skin = mat('#d5aa87'), hair = mat('#252726');
  const torso = new THREE.Group(); group.add(torso);
  const upper = mesh(torso, new THREE.CylinderGeometry(.22, .19, .45, 8), shirt, 0, 1.16, 0); upper.scale.z = .66;
  const hips = mesh(group, new THREE.CylinderGeometry(.19, .18, .16, 8), pants, 0, .88, 0); hips.scale.z = .67;
  mesh(torso, new THREE.CylinderGeometry(.075, .085, .1, 7), skin, 0, 1.43, 0);
  const head = sphere(torso, .18, skin, 0, 1.625, 0, 10, 7); head.scale.set(.88, 1, .9);
  const coiffure = mesh(torso, new THREE.SphereGeometry(.182, 10, 5, 0, Math.PI * 2, 0, Math.PI * .52), hair, 0, 1.644, -.018); coiffure.scale.set(.91, .93, .94);
  box(torso, .034, .025, .012, hair, -.06, 1.65, .15); box(torso, .034, .025, .012, hair, .06, 1.65, .15);
  sphere(torso, .025, skin, 0, 1.61, .164, 6, 4);
  const backpack = box(torso, .31, .37, .16, mat('#83704d'), 0, 1.15, -.205);
  box(backpack, .23, .15, .045, mat('#aa9064'), 0, -.055, -.095);
  for (const x of [-.14, .14]) rod(torso, [x, 1.38, .1], [x, 1.02, .12], .018, mat('#ac9973'));
  group.userData.legs = []; group.userData.arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .105, .81, 0); group.add(leg);
    mesh(leg, new THREE.CylinderGeometry(.09, .078, .36, 7), pants, 0, -.18, 0);
    const knee = new THREE.Group(); knee.position.y = -.36; leg.add(knee);
    mesh(knee, new THREE.CylinderGeometry(.078, .062, .34, 7), pants, 0, -.17, 0);
    box(knee, .16, .1, .29, shoe, 0, -.385, .06);
    box(knee, .17, .025, .3, mat('#abb1a9'), 0, -.425, .06);
    leg.userData.knee = knee; group.userData.legs.push(leg);
    const arm = new THREE.Group(); arm.position.set(side * .235, 1.36, 0); arm.rotation.z = side * .08; torso.add(arm);
    mesh(arm, new THREE.CylinderGeometry(.086, .067, .29, 7), shirt, 0, -.145, 0);
    const elbow = new THREE.Group(); elbow.position.y = -.28; arm.add(elbow);
    mesh(elbow, new THREE.CylinderGeometry(.065, .045, .25, 7), shirt, 0, -.125, 0);
    const hand = sphere(elbow, .058, skin, 0, -.28, .012, 7, 5); hand.scale.y = 1.16;
    arm.userData.elbow = elbow; group.userData.arms.push(arm);
  }
  group.userData.torso = torso; group.userData.hips = hips; group.userData.height = 1.81;
  for (const leg of group.userData.legs) compactLimb(leg, leg.userData.knee);
  for (const arm of group.userData.arms) compactLimb(arm, arm.userData.elbow);
  mergeRecords(torso, rigidRecords(torso, group.userData.arms));
  return group;
}

/** time is seconds, speed is world units per second; root placement is untouched. */
export function animatePerson(group, time, speed = 0, crouch = false) {
  if (!group?.userData?.legs) return;
  const moving = Math.min(1, Math.abs(speed) / 2), running = Math.abs(speed) > 5;
  const phase = time * (running ? 11.5 : crouch ? 6 : 8);
  const amplitude = (crouch ? .25 : running ? .72 : .48) * moving;
  group.userData.legs.forEach((leg, i) => {
    const wave = Math.sin(phase + i * Math.PI);
    leg.rotation.x = wave * amplitude + (crouch ? -.45 : 0);
    leg.position.y = crouch ? .64 : .81;
    leg.userData.knee.rotation.x = Math.max(0, -wave) * amplitude * .9 + (crouch ? .85 : 0);
    leg.userData.hingeAngle.value = leg.userData.knee.rotation.x;
  });
  group.userData.arms.forEach((arm, i) => {
    arm.rotation.x = -Math.sin(phase + i * Math.PI) * amplitude * .72 - (crouch ? .4 : 0);
    arm.userData.elbow.rotation.x = running ? -.8 : -.12;
    arm.userData.hingeAngle.value = arm.userData.elbow.rotation.x;
  });
  group.userData.torso.position.y = (crouch ? -.29 : 0) + Math.sin(phase * 2) * .013 * moving;
  group.userData.torso.rotation.x = crouch ? .15 : running ? .07 : 0;
  group.userData.hips.position.y = crouch ? .71 : .88;
}

export function createBoat(color = '#bf433c') {
  const group = new THREE.Group(); group.name = 'shichahai-launch';
  const paint = mat(color, { metalness: .23, roughness: .43 });
  const deck = mat('#e6d9b8'); const dark = mat('#28373b');
  const top = [[-1.02, .32, -2.4], [1.02, .32, -2.4], [1.28, .32, 1.05], [.7, .36, 2], [0, .42, 2.5], [-.7, .36, 2], [-1.28, .32, 1.05]];
  const bottom = top.map(([x, , z]) => [x * .62, -.43, z * .87]);
  for (let i = 0; i < top.length; i++) {
    const j = (i + 1) % top.length;
    polygon(group, [top[i], top[j], bottom[j], bottom[i]], paint);
    rod(group, top[i], top[j], .055, cream, 6);
  }
  polygon(group, bottom, dark);
  polygon(group, [top[0], top[1], [1.1, .32, -.65], [-1.1, .32, -.65]].reverse(), deck);
  polygon(group, [[-1.19, .32, .78], [1.19, .32, .78], ...top.slice(3)].reverse(), deck);
  box(group, 1.85, .08, 1.55, dark, 0, -.1, -.05);
  for (const x of [-.52, .52]) {
    box(group, .65, .13, .55, cream, x, .34, -.9);
    box(group, .65, .52, .14, cream, x, .57, -1.12);
    box(group, .55, .11, .5, deck, x, .32, -.05);
    box(group, .55, .42, .12, deck, x, .5, -.28);
  }
  polygon(group, [[-1.03, .36, .84], [1.03, .36, .84], [.92, 1.07, .52], [-.92, 1.07, .52]], glass);
  rod(group, [-1.03, .36, .84], [-.92, 1.07, .52], .035, metal);
  rod(group, [1.03, .36, .84], [.92, 1.07, .52], .035, metal);
  rod(group, [-.92, 1.07, .52], [.92, 1.07, .52], .035, metal);
  const helm = mesh(group, new THREE.TorusGeometry(.18, .025, 6, 12), dark, -.48, .63, .4); helm.rotation.x = -.5;
  for (const side of [-1, 1]) {
    const ring = mesh(group, new THREE.TorusGeometry(.255, .065, 6, 12), mat('#e67836'), side * 1.09, .37, -1.58);
    ring.rotation.y = Math.PI / 2;
    for (const y of [-.255, .255]) box(ring, .12, .08, .14, cream, 0, y, 0);
    rod(group, [side * .9, .44, 1.05], [side * .5, .72, 1.92], .025, metal);
    rod(group, [side * .5, .72, 1.92], [0, .78, 2.2], .025, metal);
  }
  box(group, .49, .63, .42, dark, 0, .14, -2.46);
  box(group, .18, .64, .16, metal, 0, -.36, -2.49);
  const propeller = new THREE.Group(); propeller.position.set(0, -.65, -2.61); group.add(propeller);
  for (let i = 0; i < 3; i++) { const blade = box(propeller, .09, .37, .025, metal, 0, 0, 0); blade.rotation.z = i * Math.PI * 2 / 3; }
  const badge = mesh(group, new THREE.PlaneGeometry(.82, .25), textMaterial('什刹海', color, '#f7e7c0'), 0, .35, -2.425); badge.rotation.y = Math.PI;
  group.userData.propeller = propeller; group.userData.bodyMaterials = [paint];
  group.userData.bounds = { w: 2.6, h: 1.1, d: 5.2 };
  const records = rigidRecords(group, [propeller]);
  mergeRecords(group, records.filter(({ node }) => node.material === paint), paint);
  mergeRecords(group, records.filter(({ node }) => node.material !== paint));
  mergeRecords(propeller, rigidRecords(propeller));
  return group;
}
