#!/usr/bin/env node
'use strict';
// CPU-only integration checks. No browser, WebGL context, project writes or network.
// Usage: node qa-scene3d.cjs [path-to-dist]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');

const dist = path.resolve(process.argv[2] || path.join(__dirname, '../dist'));
const sources = ['data.js', 'engine.js', 'game-core.js', 'scene3d.js'];
const fileStats = Object.fromEntries(sources.map(name => [name, { bytes: fs.statSync(path.join(dist, name)).size, modified: fs.statSync(path.join(dist, name)).mtime.toISOString() }]));
const disposed = { geometry: new Set(), material: new Set(), texture: new Set() };
const stats = { scenarios: 0, stateChecks: 0, visualFrames: 0, switches: 0, switchResources: 0, geometryArraysChecked: 0, numericValuesChecked: 0, objectsChecked: 0, guardDirectionChecks: 0, terrainCornerProjections: 0, rendererCalls: 0, loadedCallbacks: 0, resizeDisconnects: 0, controlsDisposals: 0, rendererDisposals: 0, labelsDrawn: 0, canvasListenerRegistrations: 0 };
const coverage = new Set();
const failures = [];
const warnings = [];

class FakeElement {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this.style = {}; this.listeners = new Map(); this.attributes = {}; this.clientWidth = 1024; this.clientHeight = 600; this.classList = { values: new Set(), add: (...v) => v.forEach(x => this.classList.values.add(x)), remove: (...v) => v.forEach(x => this.classList.values.delete(x)) }; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, fn) { if (!this.listeners.has(k)) this.listeners.set(k, []); this.listeners.get(k).push(fn); stats.canvasListenerRegistrations++; }
  removeEventListener(k, fn) { this.listeners.set(k, (this.listeners.get(k) || []).filter(f => f !== fn)); }
  prepend(child) { child.parentNode = this; this.children.unshift(child); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(x => x !== this); this.parentNode = null; }
  setPointerCapture() {}
  releasePointerCapture() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
  getContext(kind) { assert.equal(kind, '2d'); return { clearRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, fillText() { stats.labelsDrawn++; } }; }
}

const context = { console: { ...console, warn: (...args) => warnings.push(args.join(' ')) }, performance, devicePixelRatio: 2, document: { createElement: tag => new FakeElement(tag), fonts: { ready: Promise.resolve() } }, requestAnimationFrame: () => 1, ResizeObserver: class { constructor(callback) { this.callback = callback; } observe(element) { this.element = element; } disconnect() { stats.resizeDisconnects++; } } };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(dist, 'vendor/three-r160.min.js'), 'utf8'), context, { filename: 'three-r160.min.js' });
const T = context.THREE;
assert.equal(T.REVISION, '160');

for (const [type, proto] of [['geometry', T.BufferGeometry.prototype], ['material', T.Material.prototype], ['texture', T.Texture.prototype]]) {
  const original = proto.dispose;
  proto.dispose = function () { disposed[type].add(this); return original.call(this); };
}
T.WebGLRenderer = class {
  constructor() { this.domElement = new FakeElement('canvas'); this.shadowMap = {}; }
  setPixelRatio(v) { assert.ok(Number.isFinite(v)); this.pixelRatio = v; }
  setSize(w, h) { assert.ok(w > 0 && h > 0); this.domElement.clientWidth = w; this.domElement.clientHeight = h; }
  render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); stats.rendererCalls++; }
  dispose() { stats.rendererDisposals++; }
};
T.OrbitControls = class {
  constructor(camera, canvas) { this.camera = camera; this.canvas = canvas; this.target = new T.Vector3(); this.enabled = true; }
  update() { this.camera.lookAt(this.target); this.camera.updateMatrixWorld(true); }
  dispose() { stats.controlsDisposals++; }
};
for (const name of sources) vm.runInContext(fs.readFileSync(path.join(dist, name), 'utf8'), context, { filename: name });
const scenarios = vm.runInContext('STRATAGEMS', context);
const E = context.StratagemEngine;
const Types = context.StratagemGameTypes;
const game = new context.StratagemGameplay();
game.reset(scenarios[0], E.start(scenarios[0])); // Actual app initializes game before constructing the scene.
const host = new FakeElement();
const scene = new context.StratagemThreeScene(host, game, { loaded() { stats.loadedCallbacks++; } });

const close = (actual, expected, label, epsilon = 1e-5) => assert.ok(Math.abs(actual - expected) < epsilon, `${label}: ${actual} != ${expected}`);
function resources(groups) {
  const found = { geometry: new Set(), material: new Set(), texture: new Set() };
  for (const group of groups) group.traverse(object => {
    if (object.geometry) found.geometry.add(object.geometry);
    for (const mat of object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
      found.material.add(mat);
      if (mat.map) found.texture.add(mat.map);
    }
  });
  return found;
}
function assertDisposed(previous, label) {
  for (const type of Object.keys(previous)) for (const resource of previous[type]) {
    assert.ok(disposed[type].has(resource), `${label} did not dispose ${type} ${resource.uuid}`);
    stats.switchResources++;
  }
}
function finiteScene(label) {
  scene.scene.updateMatrixWorld(true);
  const geometries = new Set();
  scene.scene.traverse(object => {
    stats.objectsChecked++;
    for (const [field, values] of [['position', object.position.toArray()], ['rotation', [object.rotation.x, object.rotation.y, object.rotation.z]], ['quaternion', object.quaternion.toArray()], ['scale', object.scale.toArray()], ['matrixWorld', object.matrixWorld.elements]]) for (const value of values) assert.ok(Number.isFinite(value), `${label}: ${object.type}.${field} not finite`);
    if (object.geometry) geometries.add(object.geometry);
  });
  for (const geometry of geometries) {
    for (const [attribute, attr] of Object.entries(geometry.attributes)) {
      stats.geometryArraysChecked++;
      for (const value of attr.array) { stats.numericValuesChecked++; assert.ok(Number.isFinite(value), `${label}: ${geometry.type}.${attribute} not finite`); }
    }
    geometry.computeBoundingSphere();
    assert.ok(Number.isFinite(geometry.boundingSphere.radius), `${label}: invalid bounding sphere`);
  }
}
function checkPositions(state, label) {
  scene.scene.updateMatrixWorld(true);
  assert.equal(scene.nodeMeshes.size, state.nodes.filter(n => n.id !== 'own').length);
  assert.equal(scene.labels.size, scene.nodeMeshes.size + (scene.labels.has('own') ? 1 : 0));
  assert.equal(scene.pickables.length, scene.nodeMeshes.size + 1);
  for (const node of state.nodes) {
    if (node.id === 'own') continue;
    const p = Types.pos(node), mesh = scene.nodeMeshes.get(node.id), text = scene.labels.get(node.id);
    close(mesh.position.x, p.x, `${label}/${node.id} x`);
    close(mesh.position.z, p.z, `${label}/${node.id} z`);
    close(mesh.position.y, scene.floorY(p.x, p.z), `${label}/${node.id} y`);
    const guard = game.guards.find(g => g.id === node.id);
    const labelPoint = guard || p;
    close(text.position.y, scene.floorY(labelPoint.x, labelPoint.z) + 4.5, `${label}/${node.id} label`);
  }
  const p = game.player;
  close(scene.playerMesh.position.x, p.x, `${label}/player x`);
  close(scene.playerMesh.position.z, p.z, `${label}/player z`);
  close(scene.playerMesh.position.y, scene.floorY(p.x, p.z) + .2 + (game.biome === 'river' ? Math.sin(game.t * 2) * .045 : 0), `${label}/player y`);
  close(scene.playerMesh.rotation.y, p.angle, `${label}/player angle`);
  const ownLabel = scene.labels.get('own');
  if (ownLabel) {
    close(ownLabel.position.x, p.x, `${label}/player label x`);
    close(ownLabel.position.z, p.z, `${label}/player label z`);
    close(ownLabel.position.y, scene.floorY(p.x, p.z) + 5, `${label}/player label y`);
  }
  for (const guard of game.guards) {
    const { actor, cone } = scene.unitMeshes.get(guard.id);
    close(actor.position.x, guard.x, `${label}/${guard.id} actor x`);
    close(actor.position.z, guard.z, `${label}/${guard.id} actor z`);
    close(actor.position.y, scene.floorY(guard.x, guard.z) + .15, `${label}/${guard.id} actor y`);
    close(cone.position.y, scene.floorY(guard.x, guard.z) + .06, `${label}/${guard.id} cone y`);
    assert.equal(cone.visible, !game.state.done && guard.watch > 0);
    // The actual sector's two boundary rays define its forward bisector.
    // Transform that geometry direction, rather than asserting an Euler formula.
    const vertices = cone.geometry.attributes.position;
    const origin = new T.Vector3().fromBufferAttribute(vertices, 0);
    const start = new T.Vector3().fromBufferAttribute(vertices, 1);
    const end = new T.Vector3().fromBufferAttribute(vertices, vertices.count - 1);
    const sectorForward = start.add(end).multiplyScalar(.5).sub(origin).normalize().transformDirection(cone.matrixWorld);
    const guardForward = new T.Vector3(Math.sin(guard.angle), 0, Math.cos(guard.angle));
    close(sectorForward.dot(guardForward), 1, `${label}/${guard.id} perception sector heading`);
    stats.guardDirectionChecks++;
    coverage.add('perception sector transformed heading');
  }
  if (game.rear) {
    close(scene.rearMesh.position.x, game.rear.x, `${label}/rear x`);
    close(scene.rearMesh.position.y, scene.floorY(game.rear.x, game.rear.z) + .1, `${label}/rear y`);
    close(scene.rearMesh.position.z, game.rear.z, `${label}/rear z`);
  }
}
function frame(state, label) {
  scene.update(state);
  scene.visuals();
  stats.visualFrames++;
  checkPositions(state, label);
  finiteScene(label);
  stats.stateChecks++;
}

let previous = null;
const scenarioResults = [];
for (const s of scenarios) {
  try {
    let state = E.start(s);
    game.reset(s, state);
    scene.load(s, state);
    if (previous) { assertDisposed(previous, `switch to ${s.id}`); stats.switches++; }
    assert.equal(scene.fx.children.length, 0, 'deployments reset');
    assert.equal(scene.deploymentCount, 0);
    assert.equal(scene.unitMeshes.size, game.guards.length, 'guard map reset');
    frame(state, `${s.id}/initial`);
    coverage.add(game.biome);
    if (scene.water) coverage.add('water');
    if (scene.ladder) coverage.add('ladder');
    if (scene.rearMesh) coverage.add('rear');
    // Planned route includes adjacent duplicate points and a loop, exercising
    // real CatmullRom/Tubular/Dash geometry and its replace/dispose lifecycle.
    game.planned = [{ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 9, z: 4 }, { x: -4, z: -5 }, { x: 0, z: 0 }];
    scene.update(state);
    assert.ok(scene.planLine);
    const oldPlan = resources([scene.planLine]);
    scene.update(state);
    assertDisposed(oldPlan, `${s.id}/plan replacement`);
    finiteScene(`${s.id}/planned route`);
    coverage.add('planned route and repeated points');
    game.planned = [];
    scene.update(state);
    assert.equal(scene.planLine, null);
    game.order = { route: [{x:5,z:-2},{x:7,z:3}], snapshot: {player:{...game.player}} };
    scene.update(state);
    assert.ok(scene.planLine, 'active order route visible');
    const activeRoute = resources([scene.planLine]);
    game.order = null;
    scene.update(state);
    assertDisposed(activeRoute, `${s.id}/active route cleanup`);
    coverage.add('active order route');
    // Actual engine patches/paths drive every reachable successful phase.
    for (let phase = 0; phase < s.steps.length; phase++) {
      const task = s.steps[state.phase];
      if (task.range) { state = E.parameter(s, state, (task.range.low + task.range.high) / 2); game.sync(state); game.updateParameter(state.value); }
      const result = E.act(s, state, task.answer);
      assert.equal(result.accepted, true, `${s.id}/phase ${phase} accepted`);
      state = result.state;
      game.sync(state);
      game.t += 1.25;
      game.player.x += .2;
      game.player.z -= .1;
      game.player.angle = phase * .7;
      for (const guard of game.guards) { guard.x += .1; guard.z -= .2; guard.angle += .35; }
      game.flags.closedA = phase >= 1;
      game.flags.closedB = phase >= 2;
      game.flags.ladderRemoved = phase >= 2;
      game.flags.firstRing = phase >= 0;
      game.flags.secondRing = phase >= 1;
      const gears = [];
      if (s.id === 35) for (const [id, station] of scene.nodeMeshes) station.traverse(object => { if (object.geometry?.type === 'TorusGeometry') gears.push({id, object, angle:object.rotation.z}); });
      frame(state, `${s.id}/phase ${state.phase}`);
      if (state.paths.length) coverage.add('engine paths');
      if (scene.ladder) assert.equal(scene.ladder.visible, !game.flags.ladderRemoved);
      if (s.id === 35) {
        assert.ok(gears.length > 0, 'visible ring gear models');
        for (const gear of gears) { const rotating = gear.id === 'a' ? game.flags.firstRing : gear.id === 'b' ? game.flags.secondRing : state.done; close(gear.object.rotation.z, gear.angle + (rotating ? .025 : 0), 'conditional ring rotation'); }
        coverage.add('conditional ring rotation');
      }
      if (s.id === 22 || s.id === 32) {
        let doors = 0;
        for (const [id, station] of scene.nodeMeshes) station.traverse(object => {
          if (!object.userData.door) return;
          doors++;
          const closed = s.id === 22 ? (id === 'a' ? game.flags.closedA : game.flags.closedB) : state.phase < 2;
          assert.ok(closed ? object.scale.y <= 1 : object.scale.y < 1, `${s.id}/${id} door response`);
        });
        assert.ok(doors > 0);
        coverage.add('gate scaling');
      }
    }
    assert.ok(state.done);
    if (s.id === 20) {
      const range = s.steps.find(step => step.range)?.range;
      assert.ok(range, 'fog parameter range');
      const savedParameter = game.parameter;
      const cameraPosition = scene.camera.position.clone();
      const cameraTarget = scene.controls.target.clone();
      const nearSamples = [];
      for (let i = 0; i <= 4; i++) {
        game.parameter = range.min + (range.max - range.min) * i / 4;
        scene.visuals(); stats.visualFrames++;
        assert.ok(scene.camera.position.equals(cameraPosition) && scene.controls.target.equals(cameraTarget), 'fog comparison uses a fixed camera');
        assert.ok(Number.isFinite(scene.scene.fog.near) && Number.isFinite(scene.scene.fog.far) && scene.scene.fog.near > 0 && scene.scene.fog.far > scene.scene.fog.near, 'valid fog distances');
        nearSamples.push(scene.scene.fog.near);
      }
      for (let i = 1; i < nearSamples.length; i++) assert.ok(nearSamples[i] <= nearSamples[i - 1], 'greater confusion cannot move fog farther away');
      assert.ok(nearSamples.at(-1) < nearSamples[0], 'maximum confusion moves fog nearer than minimum');
      game.parameter = savedParameter;
      scene.visuals(); stats.visualFrames++;
      coverage.add('fixed-camera monotonic fog response');
    }
    // Valid/invalid deployments create finite flag and ring geometry once.
    game.deployments.push({ x: 2, z: -3, valid: true }, { x: -4, z: 5, valid: false });
    scene.visuals(); stats.visualFrames++;
    assert.equal(scene.deploymentCount, 2);
    assert.equal(scene.fx.children.length, 4);
    scene.visuals(); stats.visualFrames++;
    assert.equal(scene.fx.children.length, 4, 'deployment duplication');
    if (scene.resourcePiles) {
      game.metrics.resource = 4;
      scene.visuals(); stats.visualFrames++;
      assert.equal(scene.resourcePiles.core.filter(block => block.visible).length, 6);
      assert.equal(scene.resourcePiles.outer.filter(block => block.visible).length, 4);
      coverage.add('resource pile split');
    }
    if (scene.supplyMarkers?.length) {
      assert.equal(scene.supplyMarkers.length, 6);
      game.flags.cut = true; game.metrics.supply = 25;
      scene.visuals(); stats.visualFrames++;
      assert.ok(scene.supplyMarkers.every(marker => !marker.visible));
      close(scene.supplyBar.scale.x, .25, 'supply bar response');
      coverage.add('supply transport cut and bar scale');
    }
    finiteScene(`${s.id}/deployments`);
    coverage.add('valid and invalid deployment');
    // Label recreation must dispose its replaced texture and material.
    const oldLabels = resources([...scene.labels.values()]);
    // Sprite geometry is an internal shared singleton, not owned by one label.
    oldLabels.geometry.clear();
    scene.refreshLabels();
    assertDisposed(oldLabels, `${s.id}/labels`);
    // Camera fitting/projection use real PerspectiveCamera matrices at desktop
    // and portrait phone sizes, using the actual terrain corner vertices.
    const terrainVertices = scene.ground.geometry.attributes.position;
    const terrainCorners = [];
    for (const x of [-33, 33]) for (const z of [-22, 22]) {
      let found = null;
      for (let i = 0; i < terrainVertices.count; i++) if (Math.abs(terrainVertices.getX(i) - x) < 1e-5 && Math.abs(terrainVertices.getZ(i) - z) < 1e-5) { found = new T.Vector3().fromBufferAttribute(terrainVertices, i); break; }
      assert.ok(found, 'actual terrain corner vertex');
      terrainCorners.push(found);
    }
    const fitSamples = [];
    for (const [width, height, label] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
      host.clientWidth = width; host.clientHeight = height; scene.resize();
      close(scene.camera.aspect, width / height, `${label} resized aspect`);
      const fit = scene.cameraFit();
      assert.ok(Number.isFinite(fit) && fit > 0, `${label} finite cameraFit`);
      fitSamples.push(fit);
      for (const mode of ['perspective', 'top']) {
        if (mode === 'top') scene.topView(); else scene.resetCamera();
        assert.equal(scene.view, mode);
        assert.ok(scene.camera.position.toArray().every(Number.isFinite));
        scene.scene.updateMatrixWorld(true);
        scene.camera.updateMatrixWorld(true);
        for (const corner of terrainCorners) {
          const projected = corner.clone().applyMatrix4(scene.ground.matrixWorld).project(scene.camera);
          assert.ok(projected.toArray().every(Number.isFinite), `${label}/${mode} finite terrain corner projection`);
          stats.terrainCornerProjections++;
        }
      }
    }
    assert.ok(fitSamples[1] >= fitSamples[0], 'portrait fit accommodates narrower viewport');
    coverage.add('desktop and phone cameraFit and terrain corner projection');
    // Leave the scene in a desktop perspective for the subsequent real raycast.
    host.clientWidth = 1440; host.clientHeight = 900; scene.resize(); scene.resetCamera();
    scene.animate();
    assert.ok(scene.pointerRay({clientX:720,clientY:450}).ray.direction.toArray().every(Number.isFinite));
    const point = scene.point({clientX:720,clientY:450});
    assert.ok(point && Number.isFinite(point.x) && Number.isFinite(point.z), 'ground ray intersection');
    coverage.add('camera resize and real terrain raycast');
    previous = resources([scene.world, scene.routes, scene.fx]);
    scenarioResults.push({ id: s.id, name: s.name, biome: game.biome, passed: true, worldChildren: scene.world.children.length });
    stats.scenarios++;
  } catch (error) {
    failures.push({ id: s.id, name: s.name, error: error.stack });
    scenarioResults.push({ id: s.id, name: s.name, passed: false });
    previous = resources([scene.world, scene.routes, scene.fx]);
  }
}

// Final disposal includes a live planned route so scene-level resource ownership
// is measured separately from the successful per-scenario group disposal.
game.planned = [{x:0,z:0},{x:5,z:3}];
scene.update(game.state);
const allBeforeDispose = resources([scene.scene]);
const resourceOwners = new Map();
scene.scene.traverse(object => { const owner = object === scene.ghost ? 'ghost' : object === scene.planLine ? 'planLine' : object.type; if (object.geometry) resourceOwners.set(object.geometry, owner); if (object.material) for (const m of Array.isArray(object.material) ? object.material : [object.material]) resourceOwners.set(m, owner); });
const groupsBeforeDispose = resources([scene.world, scene.routes, scene.fx]);
scene.dispose();
assertDisposed(groupsBeforeDispose, 'final world/routes/fx disposal');
assert.equal(host.children.includes(scene.canvas), false);
assert.equal(stats.rendererDisposals, 1);
assert.equal(stats.controlsDisposals, 1);
assert.equal(stats.resizeDisconnects, 1);
const sceneResourceLeaks = Object.fromEntries(Object.entries(allBeforeDispose).map(([type, set]) => [type, [...set].filter(resource => !disposed[type].has(resource)).map(resource => ({ uuid: resource.uuid, type: resource.type, owner:resourceOwners.get(resource) }))]));
const constructionPass = failures.length === 0, cleanupPass = Object.values(sceneResourceLeaks).every(resources => resources.length === 0);
const result = { pass: constructionPass && cleanupPass, constructionPass, cleanupPass, threeRevision: T.REVISION, dist, fileStats, stats, coverage: [...coverage].sort(), failures, warnings, scenarioResults, finalDisposal: { groupResourcesAllDisposed: true, canvasRemoved: true, rendererDisposed: true, controlsDisposed: true, resizeObserverDisconnected: true, undisposedSceneResources: sceneResourceLeaks }, limitations: ['No browser, real WebGLRenderer, GPU draw, shader compilation, screenshot or visual quality verification.', 'OrbitControls and DOM/canvas drawing are simulated; gesture behavior, CSS layout, real text rasterization, context loss and browser listener cleanup are not validated.', 'Engine states drive phase updates; this checks 3D construction/update/visuals, not every gameplay action/branch or victory path.', 'Scene-level resource disposal is reported separately; GPU allocation/leaks are not measured.'] };
const reportPath = process.env.STRATAGEM_QA_REPORT || null;
if(reportPath)fs.writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ pass: result.pass, constructionPass, cleanupPass, threeRevision: T.REVISION, stats, coverage: result.coverage, failures, undisposedSceneResources: sceneResourceLeaks, report: reportPath }, null, 2));
process.exitCode = result.pass ? 0 : 1;
