import type * as THREE from "three";

export type ModelFormat =
  | "glb"
  | "gltf"
  | "fbx"
  | "ifc"
  | "step"
  | "stl"
  | "obj"
  | "ply"
  | "3mf"
  | "dae"
  | "iges"
  | "brep";

export type InteractionMode = "orbit" | "select" | "measure";
export type CameraProjection = "perspective" | "orthographic";
export type StandardView = "iso" | "top" | "front" | "right" | "left" | "back";

export interface ModelStats {
  objects: number;
  meshes: number;
  vertices: number;
  triangles: number;
  materials: number;
  dimensions: { x: number; y: number; z: number };
}

export interface LoadedModel {
  root: THREE.Group;
  sourceRoot: THREE.Object3D;
  fileName: string;
  format: ModelFormat;
  sizeBytes: number;
  resourceCount: number;
  animations: THREE.AnimationClip[];
  stats: ModelStats;
  unit: string;
  warnings: string[];
  getProperties?: (object: THREE.Object3D) => Promise<Record<string, unknown>>;
  dispose: () => void;
}

export interface ViewerSettings {
  projection: CameraProjection;
  background: string;
  grid: boolean;
  axes: boolean;
  shadows: boolean;
  wireframe: boolean;
  opacity: number;
  sectionEnabled: boolean;
  sectionPercent: number;
  animationPlaying: boolean;
}

export interface SelectionInfo {
  object: THREE.Object3D;
  point?: THREE.Vector3;
}

export interface Measurement {
  id: string;
  distance: number;
  start: [number, number, number];
  end: [number, number, number];
}

export interface LoadProgress {
  phase: string;
  percent?: number;
}
