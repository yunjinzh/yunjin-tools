"""Derive an Canvas-compatible LOD from the supplied GLB, never a replacement body.

Offline asset preparation only: pip install numpy pillow fast-simplification==0.2.0
Run from repository root: python scripts/prepare-model-compat.py
The full-resolution source and its embedded textures remain unchanged.
"""
import io
import json
import struct
from pathlib import Path

import fast_simplification
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
raw = (root / "public/models/tesla_2018_model_3.glb").read_bytes()
length = struct.unpack_from("<I", raw, 12)[0]
source = json.loads(raw[20:20 + length])
binary = raw[28 + length:]


def accessor(index):
    a = source["accessors"][index]
    view = source["bufferViews"][a["bufferView"]]
    dtype = np.dtype({5126: "<f4", 5125: "<u4", 5123: "<u2", 5121: "u1"}[a["componentType"]])
    width = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    return np.ndarray((a["count"], width), dtype=dtype, buffer=binary,
                      offset=view.get("byteOffset", 0) + a.get("byteOffset", 0),
                      strides=(view.get("byteStride", width * dtype.itemsize), dtype.itemsize)).copy()


out = {"asset": {**source["asset"], "generator": "EV-SIM compatibility LOD / fast-simplification 0.2.0"},
       "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [],
       "materials": [], "accessors": [], "bufferViews": []}
chunks = bytearray()


def emit(values, kind, component):
    while len(chunks) % 4:
        chunks.append(0)
    data = values.tobytes()
    vi = len(out["bufferViews"])
    out["bufferViews"].append({"buffer": 0, "byteOffset": len(chunks), "byteLength": len(data)})
    chunks.extend(data)
    a = {"bufferView": vi, "componentType": component, "count": len(values), "type": kind}
    if kind == "VEC3":
        a.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
    out["accessors"].append(a)
    return len(out["accessors"]) - 1


# The compatibility renderer cannot sample textures. Bake each material's mean base colour,
# in linear colour space, instead of losing the supplied dark trim/tyres.
for m in source["materials"]:
    pbr = m.get("pbrMetallicRoughness", {})
    color = np.array(pbr.get("baseColorFactor", [1, 1, 1, 1]), dtype=float)
    if "baseColorTexture" in pbr:
        image = source["images"][source["textures"][pbr["baseColorTexture"]["index"]]["source"]]
        v = source["bufferViews"][image["bufferView"]]
        img = Image.open(io.BytesIO(binary[v.get("byteOffset", 0):v.get("byteOffset", 0) + v["byteLength"]])).convert("RGB")
        img.thumbnail((64, 64))
        rgb = np.asarray(img) / 255
        color[:3] *= np.mean(np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4), axis=(0, 1))
    out["materials"].append({"name": m.get("name", ""), "doubleSided": True,
                             "alphaMode": m.get("alphaMode", "OPAQUE"),
                             "pbrMetallicRoughness": {"baseColorFactor": color.tolist(),
                             "metallicFactor": 0, "roughnessFactor": .6}})

face_count = 0
bounds = []


def visit(index, parent, hidden_interior=False):
    global face_count
    node = source["nodes"][index]
    hidden_interior = hidden_interior or node.get("name") in ["base", "steering_dummy", "dvornik_dummy"]
    # This attachment uses matrix transforms exclusively; fail if that changes.
    assert not any(k in node for k in ["rotation", "translation", "scale"])
    matrix = parent @ np.array(node.get("matrix", np.eye(4).flatten(order="F"))).reshape(4, 4, order="F")
    if "mesh" in node and not hidden_interior:
        for p in source["meshes"][node["mesh"]]["primitives"]:
            points = accessor(p["attributes"]["POSITION"]).astype(float)
            points = points @ matrix[:3, :3].T + matrix[:3, 3]
            bounds.extend([points.min(axis=0), points.max(axis=0)])
            if p["material"] in [0, 1, 2, 5, 19, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 46, 47]:
                continue
            if node.get("name", "").startswith("wheels") and p["material"] == 4:
                continue  # Tiny wheel bolts, retained in the full-detail asset.
            faces = accessor(p["indices"]).reshape(-1, 3).astype(np.int32)
            name = out["materials"][p["material"]]["name"]
            # Retain more silhouette geometry on painted panels and windows.
            ratio = .07 if name == "primary" else .045 if "glass" in name else .012
            target = min(len(faces), max(12, min(1400, int(len(faces) * ratio))))
            # UV seams duplicate positions; welding makes decimation reliable.
            points, remap = np.unique(np.round(points, 1), axis=0, return_inverse=True)
            faces = remap[faces].astype(np.int32)
            faces = faces[(faces[:, 0] != faces[:, 1]) & (faces[:, 0] != faces[:, 2]) & (faces[:, 1] != faces[:, 2])]
            target = min(target, len(faces))
            points, faces = fast_simplification.simplify(points, faces, target_count=target, agg=7)
            if not len(faces):
                continue
            face_count += len(faces)
            pos = emit(points.astype("<f4"), "VEC3", 5126)
            idx = emit(faces.flatten().astype("<u4"), "SCALAR", 5125)
            mesh_index = len(out["meshes"])
            out["meshes"].append({"name": node.get("name", ""), "primitives": [{"attributes": {"POSITION": pos}, "indices": idx, "material": p["material"]}]})
            out["scenes"][0]["nodes"].append(len(out["nodes"]))
            out["nodes"].append({"name": node.get("name", ""), "mesh": mesh_index})
    for child in node.get("children", []):
        visit(child, matrix, hidden_interior)


for index in source["scenes"][0]["nodes"]:
    visit(index, np.eye(4))
out["buffers"] = [{"byteLength": len(chunks)}]
bounds = np.array(bounds)
out["asset"]["extras"]["evSimSourceBounds"] = [bounds.min(axis=0).tolist(), bounds.max(axis=0).tolist()]
out["asset"]["extras"]["evSimModification"] = "Mesh decimation; texture colours averaged for non-WebGL compatibility. Full model is supplied separately."
j = json.dumps(out, separators=(",", ":")).encode()
j += b" " * (-len(j) % 4)
chunks += b"\0" * (-len(chunks) % 4)
result = struct.pack("<III", 0x46546c67, 2, 28 + len(j) + len(chunks)) + struct.pack("<II", len(j), 0x4e4f534a) + j + struct.pack("<II", len(chunks), 0x004e4942) + chunks
(root / "public/models/tesla_2018_model_3.compat.glb").write_bytes(result)
print(json.dumps({"triangles": face_count, "bytes": len(result), "sourceBounds": out["asset"]["extras"]["evSimSourceBounds"]}))
