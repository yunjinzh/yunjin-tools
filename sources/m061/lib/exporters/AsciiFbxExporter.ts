import * as THREE from "three";

interface MeshRecord {
  name: string;
  vertices: number[];
  indices: number[];
  normals: number[];
  uvs: number[];
  color: THREE.Color;
  opacity: number;
  textureFile?: string;
}

export interface FbxExportOptions {
  textureFile?: string;
}

function safeName(name: string) {
  return (name || "Object").replace(/[\x00-\x1f\x7f"'\\]/g, "_").slice(0, 120);
}

function formatNumbers(values: number[], precision = 6) {
  return values.map((value) => Number.isInteger(value) ? String(value) : Number(value.toFixed(precision))).join(",");
}

function collectMeshes(input: THREE.Object3D, options: FbxExportOptions) {
  input.updateMatrixWorld(true);
  const records: MeshRecord[] = [];
  input.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.visible === false) return;
    const geometry = child.geometry.clone();
    geometry.applyMatrix4(child.matrixWorld);
    const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
    nonIndexed.computeVertexNormals();
    const position = nonIndexed.getAttribute("position");
    const normal = nonIndexed.getAttribute("normal");
    const uv = nonIndexed.getAttribute("uv");
    if (!position || position.count < 3) {
      geometry.dispose();
      if (nonIndexed !== geometry) nonIndexed.dispose();
      return;
    }

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    for (let index = 0; index < position.count; index += 1) {
      vertices.push(position.getX(index), position.getY(index), position.getZ(index));
      if (normal) {
        normals.push(normal.getX(index), normal.getY(index), normal.getZ(index));
      }
      if (uv) uvs.push(uv.getX(index), uv.getY(index));
    }

    const indices: number[] = [];
    for (let index = 0; index + 2 < position.count; index += 3) {
      indices.push(index, index + 1, -(index + 3));
    }

    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    const standard = material as THREE.MeshStandardMaterial;
    records.push({
      name: safeName(child.name || `Mesh_${records.length + 1}`),
      vertices,
      indices,
      normals,
      uvs,
      color: standard?.color?.clone?.() || new THREE.Color(0.8, 0.8, 0.8),
      opacity: typeof standard?.opacity === "number" ? standard.opacity : 1,
      textureFile: child.userData.exportTexture ? options.textureFile : undefined,
    });

    geometry.dispose();
    if (nonIndexed !== geometry) nonIndexed.dispose();
  });
  return records;
}

export class AsciiFbxExporter {
  parse(input: THREE.Object3D, options: FbxExportOptions = {}) {
    const meshes = collectMeshes(input, options);
    const date = new Date();
    const startId = 1_000_000;
    const definitions = meshes.map((mesh, index) => ({
      ...mesh,
      geometryId: startId + index * 10 + 1,
      modelId: startId + index * 10 + 2,
      materialId: startId + index * 10 + 3,
      textureId: startId + index * 10 + 4,
      videoId: startId + index * 10 + 5,
    }));
    const textureCount = definitions.filter((mesh) => mesh.textureFile).length;

    const objects = definitions.map((mesh) => {
      const polygonCount = mesh.indices.length / 3;
      const normalIndices = Array.from({ length: mesh.normals.length / 3 }, (_, index) => index);
      const uvIndices = Array.from({ length: mesh.uvs.length / 2 }, (_, index) => index);
      const texture = mesh.textureFile ? `
    Texture: ${mesh.textureId}, "Texture::${mesh.name}_texture", "" {
      Type: "TextureVideoClip"
      Version: 202
      TextureName: "Texture::${mesh.name}_texture"
      Media: "Video::${mesh.name}_texture"
      FileName: "${mesh.textureFile}"
      RelativeFilename: "${mesh.textureFile}"
      ModelUVTranslation: 0,0
      ModelUVScaling: 1,1
      Texture_Alpha_Source: "None"
      Cropping: 0,0,0,0
    }
    Video: ${mesh.videoId}, "Video::${mesh.name}_texture", "Clip" {
      Type: "Clip"
      Properties70:  {
        P: "Path", "KString", "XRefUrl", "", "${mesh.textureFile}"
      }
      UseMipMap: 0
      Filename: "${mesh.textureFile}"
      RelativeFilename: "${mesh.textureFile}"
    }` : "";

      return `
    Geometry: ${mesh.geometryId}, "Geometry::${mesh.name}", "Mesh" {
      GeometryVersion: 124
      Vertices: *${mesh.vertices.length} {
        a: ${formatNumbers(mesh.vertices)}
      }
      PolygonVertexIndex: *${mesh.indices.length} {
        a: ${mesh.indices.join(",")}
      }
      LayerElementNormal: 0 {
        Version: 101
        Name: ""
        MappingInformationType: "ByPolygonVertex"
        ReferenceInformationType: "Direct"
        Normals: *${mesh.normals.length} {
          a: ${formatNumbers(mesh.normals)}
        }
      }
      ${mesh.uvs.length ? `LayerElementUV: 0 {
        Version: 101
        Name: "UVMap"
        MappingInformationType: "ByPolygonVertex"
        ReferenceInformationType: "IndexToDirect"
        UV: *${mesh.uvs.length} {
          a: ${formatNumbers(mesh.uvs)}
        }
        UVIndex: *${uvIndices.length} {
          a: ${uvIndices.join(",")}
        }
      }` : ""}
      LayerElementMaterial: 0 {
        Version: 101
        Name: ""
        MappingInformationType: "AllSame"
        ReferenceInformationType: "IndexToDirect"
        Materials: *1 { a: 0 }
      }
      Layer: 0 {
        Version: 100
        LayerElement:  { Type: "LayerElementNormal" TypedIndex: 0 }
        ${mesh.uvs.length ? "LayerElement:  { Type: \"LayerElementUV\" TypedIndex: 0 }" : ""}
        LayerElement:  { Type: "LayerElementMaterial" TypedIndex: 0 }
      }
    }
    Model: ${mesh.modelId}, "Model::${mesh.name}", "Mesh" {
      Version: 232
      Properties70:  {
        P: "Lcl Translation", "Lcl Translation", "", "A",0,0,0
        P: "Lcl Rotation", "Lcl Rotation", "", "A",0,0,0
        P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
      }
      Shading: T
      Culling: "CullingOff"
    }
    Material: ${mesh.materialId}, "Material::${mesh.name}_material", "" {
      Version: 102
      ShadingModel: "phong"
      MultiLayer: 0
      Properties70:  {
        P: "DiffuseColor", "Color", "", "A",${mesh.color.r},${mesh.color.g},${mesh.color.b}
        P: "DiffuseFactor", "Number", "", "A",1
        P: "TransparencyFactor", "Number", "", "A",${1 - mesh.opacity}
        P: "Shininess", "double", "Number", "",12
      }
    }${texture}`;
    }).join("\n");

    const connections = definitions.map((mesh) => `
    C: "OO",${mesh.geometryId},${mesh.modelId}
    C: "OO",${mesh.modelId},0
    C: "OO",${mesh.materialId},${mesh.modelId}${mesh.textureFile ? `
    C: "OO",${mesh.videoId},${mesh.textureId}
    C: "OP",${mesh.textureId},${mesh.materialId},"DiffuseColor"` : ""}`).join("\n");

    return `; FBX 7.4.0 project file
; Generated by GeoScene Builder
FBXHeaderExtension:  {
  FBXHeaderVersion: 1003
  FBXVersion: 7400
  CreationTimeStamp:  {
    Version: 1000
    Year: ${date.getUTCFullYear()}
    Month: ${date.getUTCMonth() + 1}
    Day: ${date.getUTCDate()}
    Hour: ${date.getUTCHours()}
    Minute: ${date.getUTCMinutes()}
    Second: ${date.getUTCSeconds()}
    Millisecond: ${date.getUTCMilliseconds()}
  }
  Creator: "GeoScene Builder 1.0"
}
GlobalSettings:  {
  Version: 1000
  Properties70:  {
    P: "UpAxis", "int", "Integer", "",1
    P: "UpAxisSign", "int", "Integer", "",1
    P: "FrontAxis", "int", "Integer", "",2
    P: "FrontAxisSign", "int", "Integer", "",-1
    P: "CoordAxis", "int", "Integer", "",0
    P: "CoordAxisSign", "int", "Integer", "",1
    P: "UnitScaleFactor", "double", "Number", "",100
    P: "OriginalUnitScaleFactor", "double", "Number", "",100
  }
}
Documents:  {
  Count: 1
  Document: 100, "Document::Scene", "Scene" {
    Properties70:  { P: "SourceObject", "object", "", "" }
    RootNode: 0
  }
}
References:  { }
Definitions:  {
  Version: 100
  Count: ${1 + meshes.length * 3 + textureCount * 2}
  ObjectType: "GlobalSettings" { Count: 1 }
  ObjectType: "Model" { Count: ${meshes.length} }
  ObjectType: "Geometry" { Count: ${meshes.length} }
  ObjectType: "Material" { Count: ${meshes.length} }
  ${textureCount ? `ObjectType: "Texture" { Count: ${textureCount} }
  ObjectType: "Video" { Count: ${textureCount} }` : ""}
}
Objects:  {${objects}
}
Connections:  {${connections}
}
Takes:  { Current: "" }
`;
  }
}
