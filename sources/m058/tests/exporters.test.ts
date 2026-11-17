import { beforeAll, describe, expect, it } from "vitest";
import * as THREE from "three";

import { createFbxAscii, createGlb } from "../lib/exporters";

beforeAll(() => {
  class TestFileReader {
    result: ArrayBuffer | string | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      this.onloadend?.();
    }
    async readAsDataURL(blob: Blob) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      this.result = `data:${blob.type};base64,${Buffer.from(bytes).toString("base64")}`;
      this.onloadend?.();
    }
  }
  Object.assign(globalThis, { FileReader: TestFileReader });
});

function sampleScene() {
  const root = new THREE.Group();
  root.name = "GeoPBF_Scene";
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 150, 2, 2), new THREE.MeshStandardMaterial({ color: 0x8aa478 }));
  ground.rotation.x = -Math.PI / 2;
  ground.name = "terrain";
  root.add(ground);
  const building = new THREE.Mesh(new THREE.BoxGeometry(30, 42, 20), new THREE.MeshStandardMaterial({ color: 0xc09b75 }));
  building.position.set(15, 21, -12);
  building.name = "building-demo";
  root.add(building);
  root.updateMatrixWorld(true);
  return root;
}

describe("model exporters", () => {
  it("creates a structurally valid FBX 7.4 ASCII scene", () => {
    const data = createFbxAscii(sampleScene());
    expect(data.startsWith("; FBX 7.4.0 project file")).toBe(true);
    expect(data).toContain("Geometry::building-demo");
    expect(data).toContain("PolygonVertexIndex");
    expect(data).toContain("Connections:");
    expect(data.length).toBeGreaterThan(2_000);
  });

  it("creates a GLB 2.0 whose JSON chunk describes two meshes", async () => {
    const data = await createGlb(sampleScene());
    const view = new DataView(data);
    expect(view.getUint32(0, true)).toBe(0x46546c67);
    expect(view.getUint32(4, true)).toBe(2);
    expect(view.getUint32(8, true)).toBe(data.byteLength);
    const jsonLength = view.getUint32(12, true);
    expect(view.getUint32(16, true)).toBe(0x4e4f534a);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 20, jsonLength)).trim());
    expect(json.asset.version).toBe("2.0");
    expect(json.meshes).toHaveLength(2);
    expect(json.accessors.length).toBeGreaterThanOrEqual(4);
  });
});
