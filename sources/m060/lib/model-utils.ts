import * as THREE from "three";
import type { ModelFormat, ModelStats } from "./model-types";

export const FORMAT_LABELS: Record<ModelFormat, string> = {
  glb: "GLB",
  gltf: "GLTF",
  fbx: "FBX",
  ifc: "IFC",
  step: "STEP / STP",
  stl: "STL",
  obj: "OBJ",
  ply: "PLY",
  "3mf": "3MF",
  dae: "DAE",
  iges: "IGES / IGS",
  brep: "BREP / BRP",
};

export const SUPPORTED_EXTENSIONS = [
  "glb", "gltf", "fbx", "ifc", "step", "stp", "stl", "obj", "ply", "3mf", "dae", "iges", "igs", "brep", "brp",
] as const;

export const MODEL_FILE_ACCEPT = SUPPORTED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export function fileExtension(name: string) {
  const clean = name.split(/[?#]/)[0];
  const index = clean.lastIndexOf(".");
  return index >= 0 ? clean.slice(index + 1).toLowerCase() : "";
}

export function normalizeFormat(extension: string): ModelFormat | null {
  const normalized = extension.toLowerCase();
  if (normalized === "stp") return "step";
  if (normalized === "igs") return "iges";
  if (normalized === "brp") return "brep";
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(normalized)
    ? normalized as ModelFormat
    : null;
}

export function findPrimaryModelFile(files: File[]) {
  return files.find((file) => normalizeFormat(fileExtension(file.name))) || null;
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function formatCount(value: number) {
  return value.toLocaleString("zh-CN");
}

export function formatLength(value: number, unit: string) {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  if (unit === "m") {
    if (absolute < 0.01) return `${(value * 1000).toFixed(2)} mm`;
    if (absolute < 1) return `${(value * 100).toFixed(2)} cm`;
    return `${value.toFixed(3)} m`;
  }
  return `${value.toFixed(3)} ${unit || "unit"}`;
}

export function calculateModelStats(root: THREE.Object3D): ModelStats {
  let objects = 0;
  let meshes = 0;
  let vertices = 0;
  let triangles = 0;
  const materials = new Set<string>();

  root.traverse((object) => {
    objects += 1;
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    meshes += 1;
    const geometry = mesh.geometry;
    const position = geometry.getAttribute("position");
    const instanceCount = (mesh as THREE.InstancedMesh).isInstancedMesh
      ? (mesh as THREE.InstancedMesh).count
      : 1;
    vertices += (position?.count || 0) * instanceCount;
    triangles += (geometry.index ? geometry.index.count / 3 : (position?.count || 0) / 3) * instanceCount;
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    meshMaterials.filter(Boolean).forEach((material) => materials.add(material.uuid));
  });

  const box = new THREE.Box3().setFromObject(root);
  const size = box.isEmpty() ? new THREE.Vector3() : box.getSize(new THREE.Vector3());
  return {
    objects,
    meshes,
    vertices: Math.round(vertices),
    triangles: Math.round(triangles),
    materials: materials.size,
    dimensions: { x: size.x, y: size.y, z: size.z },
  };
}
