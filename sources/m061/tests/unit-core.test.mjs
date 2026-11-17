import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import ts from "typescript";
import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function importTs(relativePath, mocks = {}) {
  const filename = path.join(projectRoot, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const dirname = path.dirname(filename);
  const localRequire = (specifier) => {
    if (specifier in mocks) return mocks[specifier];
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const resolved = path.relative(projectRoot, path.resolve(dirname, specifier)).replaceAll("\\", "/");
      const withExtension = fs.existsSync(path.join(projectRoot, `${resolved}.ts`)) ? `${resolved}.ts` : resolved;
      return importTs(withExtension, mocks);
    }
    return require(specifier);
  };
  const context = vm.createContext({ module, exports: module.exports, require: localRequire, __dirname: dirname, __filename: filename, console, URL, Blob, TextEncoder, TextDecoder });
  new vm.Script(output, { filename }).runInContext(context);
  return module.exports;
}

test("rectangle selection computes an area close to one square kilometre", () => {
  const geo = importTs("lib/geo.ts");
  const center = [121.47, 31.23];
  const degreesLng = 1000 / (111_319.49079327358 * Math.cos(center[1] * Math.PI / 180));
  const degreesLat = 1000 / 111_319.49079327358;
  const selection = geo.createSelection("rectangle", [
    [center[0], center[1]],
    [center[0] + degreesLng, center[1]],
    [center[0] + degreesLng, center[1] + degreesLat],
    [center[0], center[1] + degreesLat],
  ]);
  assert.ok(selection.areaM2 > 990_000 && selection.areaM2 < 1_010_000, selection.areaM2);
});

test("circle selection preserves radius and area", () => {
  const geo = importTs("lib/geo.ts");
  const polygon = geo.createCirclePolygon([0, 0], 500, 180);
  const selection = geo.createSelection("circle", polygon, 500);
  assert.equal(selection.radiusM, 500);
  assert.ok(Math.abs(selection.areaM2 - Math.PI * 500 * 500) / selection.areaM2 < 0.002);
});

test("selection longitudes are normalized from repeated Leaflet world copies", () => {
  const geo = importTs("lib/geo.ts");
  const selection = geo.createSelection("rectangle", [
    [481.47, 31.23],
    [481.48, 31.23],
    [481.48, 31.24],
    [481.47, 31.24],
  ]);
  assert.ok(selection.bbox[0] >= -180 && selection.bbox[2] <= 180);
  assert.ok(Math.abs(selection.center[0] - 121.475) < 1e-9);
});

test("Overpass query splits an antimeridian selection into valid bounding boxes", () => {
  const osm = importTs("lib/osm.ts", { osmtogeojson: () => ({}) });
  const selection = {
    kind: "rectangle",
    polygon: [],
    bbox: [179.99, -0.01, 180.01, 0.01],
    center: [180, 0],
    areaM2: 1,
  };
  const bboxes = osm.buildOverpassBboxes(selection);
  assert.deepEqual(Array.from(bboxes), ["-0.01,179.99,0.01,180", "-0.01,-180,0.01,-179.99"]);
  const query = osm.buildOverpassQuery(selection);
  assert.match(query, /nwr\["building"\]\(-0\.01,179\.99,0\.01,180\)/);
  assert.match(query, /nwr\["building"\]\(-0\.01,-180,0\.01,-179\.99\)/);
  assert.match(query, /\.selection0 out body geom\(-0\.01,179\.99,0\.01,180\)/);
  assert.match(query, /\.selection1 out body geom\(-0\.01,-180,0\.01,-179\.99\)/);
  assert.doesNotMatch(query, /180\.01/);
});

test("OSM classification and height precedence follow the declared rules", () => {
  const osm = importTs("lib/osm.ts", { osmtogeojson: () => ({}) });
  const style = { defaultFloorHeight: 3.2, defaultBuildingLevels: 3 };
  const building = { properties: { building: "office", height: "21 m", "building:levels": "4" } };
  assert.equal(osm.classifyFeature(building), "building");
  assert.equal(osm.getBuildingHeight(building, style).height, 21);
  assert.equal(osm.getBuildingHeight(building, style).source, "height");
  const levelBuilding = { properties: { building: "residential", "building:levels": "6" } };
  assert.ok(Math.abs(osm.getBuildingHeight(levelBuilding, style).height - 19.2) < 1e-9);
  assert.equal(osm.getBuildingHeight(levelBuilding, style).source, "levels");
  assert.equal(osm.classifyFeature({ properties: { natural: "water" } }), "water");
  assert.equal(osm.classifyFeature({ properties: { leisure: "park" } }), "green");
  assert.equal(osm.classifyFeature({ properties: { highway: "primary" } }), "road");
});

test("ASCII FBX exporter emits valid structural sections and polygon indices", () => {
  const { AsciiFbxExporter } = importTs("lib/exporters/AsciiFbxExporter.ts", { three: THREE });
  const root = new THREE.Group();
  root.name = "TestScene";
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 30), new THREE.MeshStandardMaterial({ color: "#cdbb91" }));
  mesh.name = "Building_01";
  root.add(mesh);
  const output = new AsciiFbxExporter().parse(root);
  assert.match(output, /FBXVersion: 7400/);
  assert.match(output, /Geometry::Building_01/);
  assert.match(output, /PolygonVertexIndex:/);
  assert.match(output, /Material::Building_01_material/);
  assert.match(output, /Connections:/);
});
