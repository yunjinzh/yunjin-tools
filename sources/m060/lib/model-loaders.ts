import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/addons/loaders/3MFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import { IfcAPI } from "web-ifc";
import type { LoadedModel, LoadProgress, ModelFormat } from "./model-types";
import { calculateModelStats, fileExtension, findPrimaryModelFile, normalizeFormat } from "./model-utils";

interface CadFace {
  first: number;
  last: number;
  color?: number[] | null;
}

interface CadMesh {
  name?: string;
  color?: number[];
  brep_faces?: CadFace[];
  attributes: {
    position: { array: number[] };
    normal?: { array: number[] };
  };
  index: { array: number[] };
}

interface CadNode {
  name?: string;
  meshes?: number[];
  children?: CadNode[];
}

interface CadResult {
  success: boolean;
  root?: CadNode;
  meshes?: CadMesh[];
}

type ProgressCallback = (progress: LoadProgress) => void;

function normalizedResourceKey(value: string) {
  let clean = value.replaceAll("\\", "/").split(/[?#]/)[0];
  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Keep the original key if it contains malformed percent escapes.
  }
  try {
    if (/^[a-z]+:/i.test(clean)) clean = new URL(clean).pathname;
  } catch {
    // Relative resource paths do not need URL parsing.
  }
  return clean.replace(/^\.?\//, "").replace(/^\//, "").toLowerCase();
}

function createResourceManager(files: File[]) {
  const manager = new THREE.LoadingManager();
  const objectUrls: string[] = [];
  const resources = new Map<string, string>();

  for (const file of files) {
    const url = URL.createObjectURL(file);
    objectUrls.push(url);
    const relative = normalizedResourceKey(file.webkitRelativePath || file.name);
    const basename = relative.split("/").pop() || relative;
    resources.set(relative, url);
    if (!resources.has(basename)) resources.set(basename, url);
  }

  manager.setURLModifier((requested) => {
    const key = normalizedResourceKey(requested);
    const basename = key.split("/").pop() || key;
    return resources.get(key) || resources.get(basename) || requested;
  });

  return {
    manager,
    dispose: () => objectUrls.forEach((url) => URL.revokeObjectURL(url)),
  };
}

function disposeMaterial(material: THREE.Material) {
  const values = Object.values(material as unknown as Record<string, unknown>);
  for (const value of values) {
    if (value && typeof value === "object" && "isTexture" in value) {
      (value as THREE.Texture).dispose();
    }
  }
  material.dispose();
}

export function disposeObject(root: THREE.Object3D) {
  const disposedMaterials = new Set<string>();
  const disposedGeometries = new Set<string>();
  root.traverse((object) => {
    const renderable = object as THREE.Mesh;
    if (renderable.geometry && !disposedGeometries.has(renderable.geometry.uuid)) {
      disposedGeometries.add(renderable.geometry.uuid);
      renderable.geometry.dispose();
    }
    const materials = renderable.material
      ? (Array.isArray(renderable.material) ? renderable.material : [renderable.material])
      : [];
    for (const material of materials) {
      if (!disposedMaterials.has(material.uuid)) {
        disposedMaterials.add(material.uuid);
        disposeMaterial(material);
      }
    }
  });
}

function prepareContent(content: THREE.Object3D, format: ModelFormat, fileName: string) {
  const sourceRoot = content;
  sourceRoot.name ||= fileName;
  if (["ifc", "step", "iges", "brep", "stl", "3mf"].includes(format)) {
    sourceRoot.rotation.x -= Math.PI / 2;
  }

  const root = new THREE.Group();
  root.name = fileName;
  root.add(sourceRoot);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -box.min.y, -center.z);
    root.updateMatrixWorld(true);
  }

  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.__originalVisible = mesh.visible;
  });

  return { root, sourceRoot };
}

function finalizeModel(options: {
  content: THREE.Object3D;
  file: File;
  files: File[];
  format: ModelFormat;
  animations?: THREE.AnimationClip[];
  unit?: string;
  warnings?: string[];
  resourceDispose?: () => void;
  externalDispose?: () => void;
  getProperties?: LoadedModel["getProperties"];
}): LoadedModel {
  const { root, sourceRoot } = prepareContent(options.content, options.format, options.file.name);
  const stats = calculateModelStats(root);
  let disposed = false;
  return {
    root,
    sourceRoot,
    fileName: options.file.name,
    format: options.format,
    sizeBytes: options.files.reduce((total, file) => total + file.size, 0),
    resourceCount: options.files.length,
    animations: options.animations || [],
    stats,
    unit: options.unit || "unit",
    warnings: options.warnings || [],
    getProperties: options.getProperties,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      disposeObject(root);
      options.resourceDispose?.();
      options.externalDispose?.();
    },
  };
}

async function loadGltf(file: File, files: File[], format: "glb" | "gltf", onProgress: ProgressCallback) {
  const resources = createResourceManager(files);
  const draco = new DRACOLoader(resources.manager);
  draco.setDecoderPath("/draco/gltf/");
  const loader = new GLTFLoader(resources.manager);
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  onProgress({ phase: "正在解析 glTF 场景、材质和纹理…", percent: 34 });
  try {
    const data = format === "gltf" ? await file.text() : await file.arrayBuffer();
    const gltf = await loader.parseAsync(data, "");
    return finalizeModel({
      content: gltf.scene,
      file,
      files,
      format,
      animations: gltf.animations,
      unit: "m",
      resourceDispose: () => {
        draco.dispose();
        resources.dispose();
      },
    });
  } catch (error) {
    draco.dispose();
    resources.dispose();
    throw error;
  }
}

async function loadFbx(file: File, files: File[], onProgress: ProgressCallback) {
  const resources = createResourceManager(files);
  onProgress({ phase: "正在解析 FBX 层级、网格和材质…", percent: 35 });
  try {
    const object = new FBXLoader(resources.manager).parse(await file.arrayBuffer(), "");
    return finalizeModel({
      content: object,
      file,
      files,
      format: "fbx",
      animations: object.animations,
      resourceDispose: resources.dispose,
    });
  } catch (error) {
    resources.dispose();
    throw error;
  }
}

async function loadStl(file: File, files: File[], onProgress: ProgressCallback) {
  onProgress({ phase: "正在解析 STL 三角网格…", percent: 42 });
  const geometry = new STLLoader().parse(await file.arrayBuffer());
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const hasColors = geometry.hasAttribute("color");
  const material = new THREE.MeshStandardMaterial({
    color: hasColors ? 0xffffff : 0xc8b58b,
    vertexColors: hasColors,
    roughness: 0.72,
    metalness: 0.03,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = file.name.replace(/\.[^.]+$/, "");
  return finalizeModel({ content: mesh, file, files, format: "stl" });
}

async function loadPly(file: File, files: File[], onProgress: ProgressCallback) {
  onProgress({ phase: "正在解析 PLY 顶点与面…", percent: 42 });
  const geometry = new PLYLoader().parse(await file.arrayBuffer());
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: geometry.hasAttribute("color") ? 0xffffff : 0xc8b58b,
    vertexColors: geometry.hasAttribute("color"),
    roughness: 0.72,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = file.name.replace(/\.[^.]+$/, "");
  return finalizeModel({ content: mesh, file, files, format: "ply" });
}

async function loadObj(file: File, files: File[], onProgress: ProgressCallback) {
  const resources = createResourceManager(files);
  onProgress({ phase: "正在解析 OBJ 与关联材质…", percent: 40 });
  try {
    const loader = new OBJLoader(resources.manager);
    const mtl = files.find((candidate) => fileExtension(candidate.name) === "mtl");
    if (mtl) {
      const materials = new MTLLoader(resources.manager).parse(await mtl.text(), "");
      materials.preload();
      loader.setMaterials(materials);
    }
    const object = loader.parse(await file.text());
    return finalizeModel({
      content: object,
      file,
      files,
      format: "obj",
      resourceDispose: resources.dispose,
      warnings: mtl ? [] : ["未选择 MTL 时，OBJ 将使用文件内已有信息或默认材质。"],
    });
  } catch (error) {
    resources.dispose();
    throw error;
  }
}

async function loadThreeMf(file: File, files: File[], onProgress: ProgressCallback) {
  onProgress({ phase: "正在解析 3MF 制造模型…", percent: 42 });
  const object = new ThreeMFLoader().parse(await file.arrayBuffer());
  return finalizeModel({ content: object, file, files, format: "3mf", unit: "mm" });
}

async function loadDae(file: File, files: File[], onProgress: ProgressCallback) {
  const resources = createResourceManager(files);
  onProgress({ phase: "正在解析 Collada 场景…", percent: 40 });
  try {
    const result = new ColladaLoader(resources.manager).parse(await file.text(), "");
    if (!result) throw new Error("DAE 文件没有可显示的场景内容");
    return finalizeModel({
      content: result.scene,
      file,
      files,
      format: "dae",
      animations: result.scene.animations,
      resourceDispose: resources.dispose,
    });
  } catch (error) {
    resources.dispose();
    throw error;
  }
}

function cadColor(value?: number[]) {
  if (!value || value.length < 3) return new THREE.Color(0xc7b58e);
  return new THREE.Color(value[0], value[1], value[2]);
}

function buildCadMesh(source: CadMesh, index: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(source.attributes.position.array, 3));
  if (source.attributes.normal) {
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(source.attributes.normal.array, 3));
  } else {
    geometry.computeVertexNormals();
  }
  geometry.setIndex(new THREE.BufferAttribute(Uint32Array.from(source.index.array), 1));
  geometry.name = source.name || `CAD Mesh ${index + 1}`;

  const defaultMaterial = new THREE.MeshStandardMaterial({ color: cadColor(source.color), roughness: 0.68, metalness: 0.04 });
  const materials: THREE.Material[] = [defaultMaterial];
  const materialByColor = new Map<string, number>();
  const faces = source.brep_faces || [];

  if (faces.length) {
    const triangleCount = source.index.array.length / 3;
    let triangle = 0;
    let faceIndex = 0;
    while (triangle < triangleCount) {
      const face = faces[faceIndex];
      let end: number;
      let materialIndex = 0;
      if (!face) {
        end = triangleCount;
      } else if (triangle < face.first) {
        end = face.first;
      } else {
        end = Math.min(triangleCount, face.last + 1);
        if (face.color) {
          const key = face.color.slice(0, 3).map((channel) => channel.toFixed(5)).join("/");
          materialIndex = materialByColor.get(key) || 0;
          if (!materialIndex) {
            materialIndex = materials.length;
            materialByColor.set(key, materialIndex);
            materials.push(new THREE.MeshStandardMaterial({ color: cadColor(face.color), roughness: 0.68, metalness: 0.04 }));
          }
        }
        faceIndex += 1;
      }
      if (end <= triangle) break;
      geometry.addGroup(triangle * 3, (end - triangle) * 3, materialIndex);
      triangle = end;
    }
  }

  const mesh = new THREE.Mesh(geometry, materials.length > 1 ? materials : defaultMaterial);
  mesh.name = source.name || `CAD Mesh ${index + 1}`;
  mesh.userData.CAD网格序号 = index + 1;
  mesh.userData.BREP面数量 = faces.length;
  return mesh;
}

function buildCadHierarchy(result: CadResult) {
  const meshObjects = (result.meshes || []).map(buildCadMesh);
  const used = new Set<number>();
  const visit = (node: CadNode, depth = 0): THREE.Group => {
    const group = new THREE.Group();
    group.name = node.name || (depth === 0 ? "CAD Assembly" : `CAD Node ${depth}`);
    for (const meshIndex of node.meshes || []) {
      const mesh = meshObjects[meshIndex];
      if (mesh && !used.has(meshIndex)) {
        used.add(meshIndex);
        group.add(mesh);
      }
    }
    for (const child of node.children || []) group.add(visit(child, depth + 1));
    return group;
  };
  const root = result.root ? visit(result.root) : new THREE.Group();
  root.name ||= "CAD Assembly";
  meshObjects.forEach((mesh, index) => {
    if (!used.has(index)) root.add(mesh);
  });
  return root;
}

function readCadInWorker(format: "step" | "iges" | "brep", buffer: ArrayBuffer, onProgress: ProgressCallback) {
  return new Promise<CadResult>((resolve, reject) => {
    const worker = new Worker("/occt/occt-import-js-worker.js");
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("CAD 模型解析超时，请尝试较小的文件或降低模型复杂度。"));
    }, 180_000);
    worker.onmessage = (event: MessageEvent<CadResult>) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error(event.message || "OpenCascade 解析器加载失败"));
    };
    onProgress({ phase: "正在由 OpenCascade 对 CAD 曲面进行三角化…", percent: 30 });
    const bytes = new Uint8Array(buffer);
    worker.postMessage({
      format,
      buffer: bytes,
      params: {
        linearUnit: "meter",
        linearDeflectionType: "bounding_box_ratio",
        linearDeflection: 0.001,
        angularDeflection: 0.5,
      },
    }, [bytes.buffer]);
  });
}

async function loadCad(file: File, files: File[], format: "step" | "iges" | "brep", onProgress: ProgressCallback) {
  const result = await readCadInWorker(format, await file.arrayBuffer(), onProgress);
  if (!result.success || !result.meshes?.length) throw new Error("CAD 文件没有生成可显示的三角网格。请确认文件未损坏且包含实体或曲面。 ");
  onProgress({ phase: "正在构建 CAD 装配结构和显示材质…", percent: 82 });
  return finalizeModel({
    content: buildCadHierarchy(result),
    file,
    files,
    format,
    unit: "m",
  });
}

function ifcValue(value: unknown): unknown {
  if (value == null) return "—";
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 12).map(ifcValue).join(", ");
  const record = value as Record<string, unknown>;
  if ("value" in record) return record.value;
  if ("expressID" in record) return `#${record.expressID}`;
  return Object.entries(record).slice(0, 8).map(([key, item]) => `${key}: ${String(ifcValue(item))}`).join(" · ");
}

function findIfcExpressId(object: THREE.Object3D | null) {
  let current = object;
  while (current) {
    if (Number.isInteger(current.userData.ifcExpressID)) return Number(current.userData.ifcExpressID);
    current = current.parent;
  }
  return null;
}

async function loadIfc(file: File, files: File[], onProgress: ProgressCallback) {
  const api = new IfcAPI();
  api.SetWasmPath("/web-ifc/", true);
  onProgress({ phase: "正在初始化 IFC BIM 解析引擎…", percent: 15 });
  await api.Init(undefined, true);
  let modelID = -1;
  try {
    modelID = api.OpenModel(new Uint8Array(await file.arrayBuffer()), {
      COORDINATE_TO_ORIGIN: true,
      CIRCLE_SEGMENTS: 16,
    });
    if (!api.IsModelOpen(modelID)) throw new Error("IFC 模型无法打开");
    onProgress({ phase: "正在读取 IFC 构件几何与空间位置…", percent: 32 });
    const flatMeshes = api.LoadAllGeometry(modelID);
    const root = new THREE.Group();
    root.name = file.name.replace(/\.[^.]+$/, "");
    const materialCache = new Map<string, THREE.MeshStandardMaterial>();

    for (let meshIndex = 0; meshIndex < flatMeshes.size(); meshIndex += 1) {
      const flatMesh = flatMeshes.get(meshIndex);
      const element = new THREE.Group();
      element.name = `IFC #${flatMesh.expressID}`;
      element.userData.ifcExpressID = flatMesh.expressID;
      element.userData.IFC构件编号 = `#${flatMesh.expressID}`;

      for (let geometryIndex = 0; geometryIndex < flatMesh.geometries.size(); geometryIndex += 1) {
        const placed = flatMesh.geometries.get(geometryIndex);
        const ifcGeometry = api.GetGeometry(modelID, placed.geometryExpressID);
        const interleaved = api.GetVertexArray(ifcGeometry.GetVertexData(), ifcGeometry.GetVertexDataSize()).slice();
        const indices = api.GetIndexArray(ifcGeometry.GetIndexData(), ifcGeometry.GetIndexDataSize()).slice();
        ifcGeometry.delete();

        const vertexCount = interleaved.length / 6;
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        for (let vertex = 0; vertex < vertexCount; vertex += 1) {
          positions[vertex * 3] = interleaved[vertex * 6];
          positions[vertex * 3 + 1] = interleaved[vertex * 6 + 1];
          positions[vertex * 3 + 2] = interleaved[vertex * 6 + 2];
          normals[vertex * 3] = interleaved[vertex * 6 + 3];
          normals[vertex * 3 + 1] = interleaved[vertex * 6 + 4];
          normals[vertex * 3 + 2] = interleaved[vertex * 6 + 5];
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        const color = placed.color;
        const key = [color.x, color.y, color.z, color.w].map((channel) => channel.toFixed(4)).join("/");
        let material = materialCache.get(key);
        if (!material) {
          material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color.x, color.y, color.z),
            opacity: Math.max(0.05, color.w),
            transparent: color.w < 0.999,
            roughness: 0.72,
            metalness: 0.02,
            side: color.w < 0.999 ? THREE.DoubleSide : THREE.FrontSide,
          });
          materialCache.set(key, material);
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `IFC Geometry ${placed.geometryExpressID}`;
        mesh.userData.ifcExpressID = flatMesh.expressID;
        mesh.userData.ifcGeometryExpressID = placed.geometryExpressID;
        mesh.matrix.fromArray(placed.flatTransformation);
        mesh.matrixAutoUpdate = false;
        element.add(mesh);
      }
      root.add(element);
      if (typeof flatMesh.delete === "function") flatMesh.delete();
      if (meshIndex % 250 === 0) {
        onProgress({ phase: `正在构建 IFC 构件 ${meshIndex + 1} / ${flatMeshes.size()}…`, percent: 35 + Math.round((meshIndex / Math.max(1, flatMeshes.size())) * 50) });
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    }
    (flatMeshes as unknown as { delete?: () => void }).delete?.();

    const getProperties: LoadedModel["getProperties"] = async (object) => {
      const expressID = findIfcExpressId(object);
      if (expressID == null || !api.IsModelOpen(modelID)) return {};
      const line = api.GetLine(modelID, expressID, false);
      const type = api.GetNameFromTypeCode(line.type) || "IFCENTITY";
      return {
        "Express ID": `#${expressID}`,
        "IFC 类型": type,
        GlobalId: ifcValue(line.GlobalId),
        Name: ifcValue(line.Name),
        Description: ifcValue(line.Description),
        ObjectType: ifcValue(line.ObjectType),
        Tag: ifcValue(line.Tag),
        PredefinedType: ifcValue(line.PredefinedType),
      };
    };

    return finalizeModel({
      content: root,
      file,
      files,
      format: "ifc",
      unit: "m",
      warnings: ["IFC 几何已移至局部原点，以避免大坐标造成显示抖动。"],
      getProperties,
      externalDispose: () => {
        if (api.IsModelOpen(modelID)) api.CloseModel(modelID);
        api.Dispose();
      },
    });
  } catch (error) {
    if (modelID >= 0 && api.IsModelOpen(modelID)) api.CloseModel(modelID);
    api.Dispose();
    throw error;
  }
}

export async function loadModelFiles(inputFiles: File[], onProgress: ProgressCallback): Promise<LoadedModel> {
  const files = inputFiles.filter((file) => file.size > 0);
  const file = findPrimaryModelFile(files);
  if (!file) {
    throw new Error("没有发现可识别的三维模型。请选择 FBX、GLB、GLTF、IFC、STEP/STP、STL、OBJ、PLY、3MF 或 DAE 文件。 ");
  }
  const format = normalizeFormat(fileExtension(file.name));
  if (!format) throw new Error(`暂不支持 ${fileExtension(file.name).toUpperCase()} 格式`);

  onProgress({ phase: `正在读取 ${file.name}…`, percent: 8 });
  switch (format) {
    case "glb":
    case "gltf":
      return loadGltf(file, files, format, onProgress);
    case "fbx":
      return loadFbx(file, files, onProgress);
    case "ifc":
      return loadIfc(file, files, onProgress);
    case "step":
    case "iges":
    case "brep":
      return loadCad(file, files, format, onProgress);
    case "stl":
      return loadStl(file, files, onProgress);
    case "obj":
      return loadObj(file, files, onProgress);
    case "ply":
      return loadPly(file, files, onProgress);
    case "3mf":
      return loadThreeMf(file, files, onProgress);
    case "dae":
      return loadDae(file, files, onProgress);
  }
}

export async function loadDemoStep(onProgress: ProgressCallback) {
  const response = await fetch("/samples/demo-cube.stp");
  if (!response.ok) throw new Error("示例模型加载失败");
  const file = new File([await response.blob()], "GeoModel_STEP_Demo.stp");
  return loadModelFiles([file], onProgress);
}
