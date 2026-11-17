import { describe, expect, it } from "vitest";
import { PbfWriter } from "pbf";
import { deflateSync } from "node:zlib";

import { inspectPbf, parsePbf } from "../lib/pbf-parser";
import type { SelectionShape } from "../lib/types";

const enc = new TextEncoder();

function writeBBox(value: { west: number; east: number; north: number; south: number }, pbf: PbfWriter) {
  pbf.writeSVarintField(1, value.west * 1e9);
  pbf.writeSVarintField(2, value.east * 1e9);
  pbf.writeSVarintField(3, value.north * 1e9);
  pbf.writeSVarintField(4, value.south * 1e9);
}
function writeHeader(_: null, pbf: PbfWriter) {
  pbf.writeMessage(1, writeBBox, { west: 116.38, east: 116.41, north: 39.92, south: 39.89 });
  pbf.writeStringField(4, "OsmSchema-V0.6");
  pbf.writeStringField(4, "DenseNodes");
  pbf.writeStringField(16, "GeoPBF test writer");
  pbf.writeStringField(17, "unit-test");
}
function writeStringTable(strings: string[], pbf: PbfWriter) { strings.forEach((value) => pbf.writeBytesField(1, enc.encode(value))); }
function writeDense(_: null, pbf: PbfWriter) {
  pbf.writePackedSVarint(1, [1, 1, 1, 1]);
  pbf.writePackedSVarint(8, [399_000_000, 0, 10_000, 0]);
  pbf.writePackedSVarint(9, [1_164_000_000, 10_000, 0, -10_000]);
}
function writeWay(_: null, pbf: PbfWriter) {
  pbf.writeVarintField(1, 100);
  pbf.writePackedVarint(2, [1, 3]);
  pbf.writePackedVarint(3, [2, 4]);
  pbf.writePackedSVarint(8, [1, 1, 1, 1, -3]);
}
function writeNodeGroup(_: null, pbf: PbfWriter) { pbf.writeMessage(2, writeDense, null); }
function writeWayGroup(_: null, pbf: PbfWriter) { pbf.writeMessage(3, writeWay, null); }
function writePrimitive(_: null, pbf: PbfWriter) {
  pbf.writeMessage(1, writeStringTable, ["", "building", "yes", "building:levels", "5"]);
  pbf.writeMessage(2, writeNodeGroup, null);
  pbf.writeMessage(2, writeWayGroup, null);
  pbf.writeVarintField(17, 100);
}
function writeBlob(data: Uint8Array, compressed: boolean, pbf: PbfWriter) {
  if (compressed) {
    pbf.writeVarintField(2, data.length);
    pbf.writeBytesField(3, deflateSync(data));
  } else pbf.writeBytesField(1, data);
}
function writeBlobHeader(value: { type: string; size: number }, pbf: PbfWriter) {
  pbf.writeStringField(1, value.type);
  pbf.writeVarintField(3, value.size);
}
function fileBlock(type: string, message: Uint8Array, compressed = true) {
  const blobWriter = new PbfWriter();
  writeBlob(message, compressed, blobWriter);
  const blob = blobWriter.finish();
  const headerWriter = new PbfWriter();
  writeBlobHeader({ type, size: blob.length }, headerWriter);
  const header = headerWriter.finish();
  const prefix = new Uint8Array(4);
  new DataView(prefix.buffer).setUint32(0, header.length, false);
  const result = new Uint8Array(4 + header.length + blob.length);
  result.set(prefix); result.set(header, 4); result.set(blob, 4 + header.length);
  return result;
}
function fixtureFile() {
  const headerWriter = new PbfWriter(); writeHeader(null, headerWriter);
  const primitiveWriter = new PbfWriter(); writePrimitive(null, primitiveWriter);
  const header = fileBlock("OSMHeader", headerWriter.finish());
  const data = fileBlock("OSMData", primitiveWriter.finish());
  const bytes = new Uint8Array(header.length + data.length); bytes.set(header); bytes.set(data, header.length);
  return new File([bytes], "fixture.osm.pbf");
}

describe("browser PBF parser", () => {
  it("reads HeaderBBox and decodes dense nodes + building ways", async () => {
    const file = fixtureFile();
    const header = await inspectPbf(file);
    expect(header.bounds).toEqual({ west: 116.38, east: 116.41, north: 39.92, south: 39.89 });
    const bounds = { west: 116.399, south: 39.899, east: 116.402, north: 39.902 };
    const selection: SelectionShape = { type: "rectangle", bounds, polygon: [[bounds.west,bounds.south],[bounds.east,bounds.south],[bounds.east,bounds.north],[bounds.west,bounds.north],[bounds.west,bounds.south]], areaKm2: .1 };
    const result = await parsePbf(file, selection, () => undefined);
    expect(result.stats.nodesRead).toBe(4);
    expect(result.stats.nodesKept).toBe(4);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].layer).toBe("buildings");
    expect(result.features[0].tags["building:levels"]).toBe("5");
    expect(result.features[0].coordinates[0]).toHaveLength(5);
  });
});
