import type { LonLat, ParseResult, SceneFeature, SelectionShape } from "./types";

const bounds = { west: 116.379, south: 39.899, east: 116.404, north: 39.916 };

function rect(id: number, layer: SceneFeature["layer"], x: number, y: number, w: number, h: number, tags: Record<string, string>): SceneFeature {
  const ring: LonLat[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  return { id: `demo/${id}`, osmId: id, source: "way", layer, geometry: "polygon", coordinates: [ring], tags };
}

function line(id: number, layer: SceneFeature["layer"], coordinates: LonLat[], tags: Record<string, string>): SceneFeature {
  return { id: `demo/${id}`, osmId: id, source: "way", layer, geometry: "line", coordinates: [coordinates], tags };
}

export function createDemoResult(): ParseResult {
  const polygon: LonLat[] = [[bounds.west, bounds.south], [bounds.east, bounds.south], [bounds.east, bounds.north], [bounds.west, bounds.north], [bounds.west, bounds.south]];
  const selection: SelectionShape = { type: "rectangle", bounds, polygon, areaKm2: 4.01 };
  const features: SceneFeature[] = [
    rect(1, "water", 116.379, 39.9108, 0.0105, 0.0044, { natural: "water", name: "示例水面" }),
    rect(2, "green", 116.394, 39.9095, 0.009, 0.0055, { leisure: "park", name: "示例公园" }),
    line(3, "roads", [[116.379, 39.905], [116.387, 39.906], [116.394, 39.9058], [116.404, 39.907]], { highway: "primary", lanes: "6" }),
    line(4, "roads", [[116.391, 39.899], [116.3915, 39.905], [116.392, 39.911], [116.3925, 39.916]], { highway: "secondary", lanes: "4" }),
    line(5, "roads", [[116.382, 39.899], [116.382, 39.916]], { highway: "residential" }),
    line(6, "roads", [[116.400, 39.899], [116.399, 39.916]], { highway: "residential" }),
    line(7, "rail", [[116.379, 39.901], [116.389, 39.902], [116.404, 39.901]], { railway: "rail" }),
  ];
  let id = 20;
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const x = 116.3805 + col * 0.00225 + (row % 2) * 0.00025;
      const y = 39.9025 + row * 0.00178;
      if (x > 116.389 && x < 116.394 && y > 39.909) continue;
      const level = 2 + ((row * 3 + col * 5) % 10);
      const type = (row + col) % 9 === 0 ? "commercial" : (row + col) % 7 === 0 ? "school" : "residential";
      features.push(rect(id, "buildings", x, y, 0.00125 + (col % 3) * 0.00018, 0.00075 + (row % 2) * 0.0002, { building: type, "building:levels": String(level) }));
      id += 1;
    }
  }
  const layers = { buildings: 0, roads: 0, water: 0, green: 0, rail: 0 };
  features.forEach((feature) => { layers[feature.layer] += 1; });
  return { features, selection, stats: { nodesRead: 0, nodesKept: 0, waysRead: features.length, relationsRead: 0, layers, elapsedMs: 0, truncated: false } };
}
