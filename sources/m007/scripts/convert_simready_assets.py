"""Convert the selected NVIDIA SimReady USD assets into static glTF 2.0 visuals.

Requires: usd-core, numpy, Pillow. Geometry, UV seams, face material bindings,
normal maps and ORM channels are preserved. Physics schemas are not exported.
Input cache is populated by prepare_simready_assets.py from a pinned revision.
"""
from pathlib import Path
import argparse, hashlib, json, math, re, struct
import numpy as np
from PIL import Image
from pxr import Usd, UsdGeom, UsdShade

REVISION = '524747d9b5e1f21b5b18b56041788c01d745f1a1'
SELECTION = {
    'carton': 'box_corrugated_brown_b08',
    'parcel': 'box_corrugated_white_a08',
    'rack': 'rack_large_empty_a01',
    'pallet': 'pallet_a01',
    'pallet-jack': 'palletJack_lowProfile_a01',
    'coffee-machine': 'machine_coffee_vending_a01',
    'fridge': 'facilityEquipment_beverageFridge_display_a01',
    'kitchen': 'facilitySystem_kitchenette_module_a01',
    'croissant': 'food_prepared_croissant_a01',
    'baguette': 'food_prepared_baguette_b01',
    'jug': 'kitchenware_jug_a01',
    'tomato': 'food_produce_tomato_a01',
    'steak': 'food_prepared_steak_c01',
    'wine-glass': 'dishware_glass_wine_a01',
}


class Exporter:
    def __init__(self, cache, output, key, asset):
        self.cache, self.output, self.key, self.asset = cache, output, key, asset
        self.root = cache / asset
        package = json.loads((self.root / 'com.nvidia.simready.packaging.json').read_text())
        assert package['license'] == 'CC-BY-4.0', f'Unreviewed license: {asset}'
        self.usd = next((self.root / 'simready_usd').glob('sm_*.usd*'))
        self.stage = Usd.Stage.Open(str(self.usd))
        self.xforms = UsdGeom.XformCache()
        self.unit = UsdGeom.GetStageMetersPerUnit(self.stage)
        self.z_up = UsdGeom.GetStageUpAxis(self.stage) == 'Z'
        self.binary = bytearray()
        self.gltf = {'asset': {'version': '2.0', 'generator': 'Embodied Studio / OpenUSD conversion',
                     'copyright': 'NVIDIA / CC BY 4.0'}, 'scene': 0, 'scenes': [{'nodes': []}],
                     'nodes': [], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [],
                     'textures': [], 'images': [], 'samplers': [{'magFilter': 9729, 'minFilter': 9987,
                     'wrapS': 10497, 'wrapT': 10497}], 'extensionsUsed': ['KHR_mesh_quantization'],
                     'extensionsRequired': ['KHR_mesh_quantization']}
        self.materials, self.textures, self.inputs, self.raw = {}, {}, {}, []
        source_map = cache / 'download-selection.json'
        self.source_map = {x['local']: x['remote'] for x in json.loads(source_map.read_text())['sources']} if source_map.exists() else {}

    def record(self, path):
        path = Path(path)
        if path.is_file():
            relative = str(path.relative_to(self.cache))
            self.inputs[self.source_map.get(relative, relative)] = hashlib.sha256(path.read_bytes()).hexdigest()

    def accessor(self, array, kind, component, normalized=False, bounds=False):
        array = np.ascontiguousarray(array)
        while len(self.binary) % 4: self.binary.append(0)
        storage = array
        if kind == 'VEC3' and array.dtype.itemsize == 2:
            storage = np.zeros((len(array), 4), dtype=array.dtype); storage[:, :3] = array
        start = len(self.binary); self.binary.extend(storage.tobytes())
        view = len(self.gltf['bufferViews'])
        self.gltf['bufferViews'].append({'buffer': 0, 'byteOffset': start, 'byteLength': storage.nbytes})
        if storage is not array: self.gltf['bufferViews'][-1]['byteStride'] = 8
        item = {'bufferView': view, 'componentType': component, 'count': len(array), 'type': kind}
        if normalized: item['normalized'] = True
        if bounds:
            item['min'] = array.min(axis=0).tolist(); item['max'] = array.max(axis=0).tolist()
        self.gltf['accessors'].append(item)
        return len(self.gltf['accessors']) - 1

    def texture(self, shader, role):
        if not shader: return None
        value = shader.GetInput('file').Get()
        if not value: return None
        path = Path(value.resolvedPath) if value.resolvedPath else self.root / 'simready_usd/Textures' / Path(value.path).name
        atlas_transform = None
        if '<UDIM>' in str(path):
            tiles = []
            for tile in sorted(path.parent.glob(path.name.replace('<UDIM>', '*'))):
                match = re.search(r'\.(1\d{3})\.', tile.name)
                if match:
                    number = int(match[1]) - 1001; tiles.append((number % 10, number // 10, tile))
            if not tiles: raise FileNotFoundError(path)
            min_u, min_v = min(x for x,y,p in tiles), min(y for x,y,p in tiles)
            cols, rows = max(x for x,y,p in tiles)-min_u+1, max(y for x,y,p in tiles)-min_v+1
            image = Image.new('RGB', (cols * 1024, rows * 1024), (128, 128, 255) if role == 'normal' else (0, 0, 0))
            for x, y, tile in tiles:
                self.record(tile)
                part = Image.open(tile).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
                image.paste(part, ((x-min_u)*1024, (rows-1-y+min_v)*1024))
            atlas_transform = {'scale': [1/cols, 1/rows], 'offset': [-min_u/cols, (rows-1+min_v)/rows]}
            if 'KHR_texture_transform' not in self.gltf['extensionsUsed']: self.gltf['extensionsUsed'].append('KHR_texture_transform')
        if role == 'normal' and 'orm' in path.name.lower():
            # The source cardboard trim accidentally binds its ORM map as a normal.
            return None
        if atlas_transform is None:
            if not path.is_file(): raise FileNotFoundError(path)
            self.record(path)
            image = Image.open(path).convert('RGB')
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        raw = image.tobytes(); digest = hashlib.sha256(raw + str(image.size).encode()).hexdigest()[:20]
        is_normal = role == 'normal'
        name = f'{digest}.{"png" if is_normal else "jpg"}'
        target = self.output / 'textures' / name; target.parent.mkdir(exist_ok=True)
        if not target.exists():
            if is_normal: image.save(target, optimize=True)
            else: image.save(target, quality=90, subsampling=0, optimize=True)
        if name not in self.textures:
            idx = len(self.gltf['images']); self.gltf['images'].append({'uri': 'textures/' + name})
            self.gltf['textures'].append({'source': idx, 'sampler': 0}); self.textures[name] = idx
        result = {'index': self.textures[name]}
        if atlas_transform: result['extensions'] = {'KHR_texture_transform': atlas_transform}
        return result

    def material(self, mat):
        if not mat: raise ValueError('Mesh has no bound material')
        path = str(mat.GetPath())
        if path in self.materials: return self.materials[path]
        prim = mat.GetPrim()
        shaders = {p.GetName(): UsdShade.Shader(p) for p in prim.GetChildren() if p.GetTypeName() == 'Shader'}
        bsdf = next((s for s in shaders.values() if s.GetIdAttr().Get() == 'UsdPreviewSurface'), None)
        if not bsdf: raise ValueError(f'No UsdPreviewSurface: {path}')
        def value(name, default):
            v = bsdf.GetInput(name).Get(); return default if v is None else v
        def connected(name):
            i = bsdf.GetInput(name)
            paths = i.GetAttr().GetConnections() if i else []
            return UsdShade.Shader(self.stage.GetPrimAtPath(paths[0].GetPrimPath())) if paths else None
        base = self.texture(connected('diffuseColor'), 'color')
        orm = self.texture(connected('roughness'), 'orm')
        normal = self.texture(connected('normal'), 'normal')
        color = list(value('diffuseColor', [1, 1, 1])); opacity = float(value('opacity', 1))
        pbr = {'baseColorFactor': color + [opacity], 'metallicFactor': float(value('metallic', 1 if orm else 0)),
               'roughnessFactor': float(value('roughness', 1 if orm else .65))}
        if base: pbr['baseColorTexture'] = base
        if orm: pbr['metallicRoughnessTexture'] = orm
        item = {'name': prim.GetName(), 'pbrMetallicRoughness': pbr, 'doubleSided': True}
        if orm: item['occlusionTexture'] = {**orm, 'strength': .7}
        if normal: item['normalTexture'] = normal
        emission = list(value('emissiveColor', [0, 0, 0]))
        emap = self.texture(connected('emissiveColor'), 'color')
        if emap: item.update(emissiveTexture=emap, emissiveFactor=[1, 1, 1])
        elif max(emission) > 0: item['emissiveFactor'] = [min(1, float(x)) for x in emission]
        if opacity < 1:
            item['alphaMode'] = 'BLEND'
        if 'glass' in prim.GetName().lower():
            item['pbrMetallicRoughness']['baseColorFactor'][3] = max(.16, min(opacity, .28))
            item['pbrMetallicRoughness']['roughnessFactor'] = .12
            item['alphaMode'] = 'BLEND'
        mapping = shaders.get('Mapping')
        scale, rotation, translation = [1, 1], 0, [0, 0]
        if mapping:
            scale = mapping.GetInput('scale').Get() or scale
            rotation = mapping.GetInput('rotation').Get() or 0
            translation = mapping.GetInput('translation').Get() or translation
        idx = len(self.gltf['materials']); self.gltf['materials'].append(item)
        result = (idx, np.array(scale), math.radians(rotation), np.array(translation))
        self.materials[path] = result
        return result

    def collect(self):
        for prim in Usd.PrimRange(self.stage.GetPseudoRoot(), Usd.TraverseInstanceProxies()):
            if not prim.IsA(UsdGeom.Mesh): continue
            mesh = UsdGeom.Mesh(prim)
            if mesh.ComputeVisibility() == 'invisible' or mesh.ComputePurpose() in ('guide', 'proxy'): continue
            points = np.array(mesh.GetPointsAttr().Get(), dtype=np.float64)
            counts = np.array(mesh.GetFaceVertexCountsAttr().Get(), dtype=np.int64)
            indices = np.array(mesh.GetFaceVertexIndicesAttr().Get(), dtype=np.int64)
            matrix = np.array(self.xforms.GetLocalToWorldTransform(prim))
            positions = (points @ matrix[:3, :3] + matrix[3, :3]) * self.unit
            if self.z_up: positions = positions[:, [0, 2, 1]] * [1, 1, -1]
            face_ids = np.repeat(np.arange(len(counts)), counts)
            uvvar = UsdGeom.PrimvarsAPI(prim).GetPrimvar('st')
            def expand(data, mode):
                a = np.array(data)
                if mode == 'faceVarying': return a
                if mode in ('vertex', 'varying'): return a[indices]
                if mode == 'uniform': return a[face_ids]
                return np.tile(a[0], (len(indices), 1))
            uvs = expand(uvvar.ComputeFlattened(), str(uvvar.GetInterpolation())) if uvvar.HasValue() else np.zeros((len(indices), 2))
            ns = mesh.GetNormalsAttr().Get()
            normals = expand(ns, str(mesh.GetNormalsInterpolation())) if ns is not None and len(ns) else None
            if normals is not None:
                normals = normals @ np.linalg.inv(matrix[:3, :3]).T
                if self.z_up: normals = normals[:, [0, 2, 1]] * [1, 1, -1]
                normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
            bound = UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()[0]
            groups = [(bound, np.arange(len(counts)))]
            subsets = [p for p in prim.GetChildren() if p.IsA(UsdGeom.Subset)]
            if subsets:
                groups = [(UsdShade.MaterialBindingAPI(p).ComputeBoundMaterial()[0], np.array(UsdGeom.Subset(p).GetIndicesAttr().Get())) for p in subsets]
            starts = np.r_[0, np.cumsum(counts)[:-1]]
            reverse = (np.linalg.det(matrix[:3, :3]) < 0) != (mesh.GetOrientationAttr().Get() == 'leftHanded')
            holes = set(mesh.GetHoleIndicesAttr().Get() or [])
            for mat, faces in groups:
                tri = []
                for face in faces:
                    if int(face) in holes: continue
                    start, count = starts[face], counts[face]
                    tri.extend((start, start + n, start + n + 1) for n in range(1, count - 1))
                if not tri: continue
                tri = np.array(tri, dtype=np.int64)
                if reverse: tri = tri[:, [0, 2, 1]]
                corners = tri.reshape(-1)
                pos = positions[indices[corners]]
                norm = normals[corners] if normals is not None else None
                if norm is None:
                    t = pos.reshape(-1, 3, 3); n = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0])
                    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12); norm = np.repeat(n, 3, axis=0)
                mid, scale, rotation, offset = self.material(mat)
                uv = uvs[corners] * scale
                rot = np.array([[math.cos(rotation), math.sin(rotation)], [-math.sin(rotation), math.cos(rotation)]])
                uv = uv @ rot + offset
                uv[:, 1] = 1 - uv[:, 1]
                self.raw.append((prim.GetName(), mid, pos, norm, uv))
        if not self.raw: raise ValueError(f'No visible mesh geometry: {self.asset}')

    def save(self):
        self.collect()
        lo = np.min([p.min(axis=0) for _, _, p, _, _ in self.raw], axis=0)
        hi = np.max([p.max(axis=0) for _, _, p, _, _ in self.raw], axis=0)
        origin = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
        triangles = 0
        for name, material, positions, normals, uvs in self.raw:
            joined = np.round(np.c_[positions - origin, normals, uvs], 6).astype(np.float32)
            vertices, indices = np.unique(joined, axis=0, return_inverse=True)
            p, n, uv = vertices[:, :3], vertices[:, 3:6], vertices[:, 6:]
            low = p.min(axis=0); span = max(float(np.ptp(p, axis=0).max()), 1e-8)
            q = np.clip(np.rint((p - low) / span * 65535), 0, 65535).astype('<u2')
            nq = np.clip(np.rint(n * 32767), -32767, 32767).astype('<i2')
            ix = indices.astype('<u2' if len(vertices) <= 65535 else '<u4')
            primitive = {'attributes': {'POSITION': self.accessor(q, 'VEC3', 5123, True, True),
                         'NORMAL': self.accessor(nq, 'VEC3', 5122, True),
                         'TEXCOORD_0': self.accessor(uv.astype('<f4'), 'VEC2', 5126)},
                         'indices': self.accessor(ix, 'SCALAR', 5123 if ix.dtype.itemsize == 2 else 5125),
                         'material': material}
            mesh_id = len(self.gltf['meshes']); self.gltf['meshes'].append({'name': name, 'primitives': [primitive]})
            node_id = len(self.gltf['nodes']); self.gltf['nodes'].append({'mesh': mesh_id, 'name': name,
                                     'translation': low.tolist(), 'scale': [span, span, span]})
            self.gltf['scenes'][0]['nodes'].append(node_id); triangles += len(indices) // 3
        for layer in self.stage.GetUsedLayers():
            if layer.realPath: self.record(layer.realPath)
        for p in [self.root / 'com.nvidia.simready.packaging.json', self.root / '.metadata/LICENSE.txt']: self.record(p)
        while len(self.binary) % 4: self.binary.append(0)
        self.gltf['buffers'] = [{'byteLength': len(self.binary)}]
        data = json.dumps(self.gltf, separators=(',', ':')).encode(); data += b' ' * (-len(data) % 4)
        glb = struct.pack('<III', 0x46546c67, 2, 12 + 8 + len(data) + 8 + len(self.binary))
        glb += struct.pack('<II', len(data), 0x4e4f534a) + data + struct.pack('<II', len(self.binary), 0x004e4942) + self.binary
        (self.output / (self.key + '.glb')).write_bytes(glb)
        meta = {'id': self.key, 'sourceAsset': self.asset, 'sourceUrl': f'https://huggingface.co/datasets/nvidia/simready-assets/tree/{REVISION}/{self.asset}',
                'author': 'NVIDIA', 'license': 'CC-BY-4.0', 'sourceRevision': REVISION,
                'size': (hi - lo).tolist(), 'sourceOrigin': origin.tolist(), 'triangles': triangles,
                'materials': len(self.gltf['materials']), 'bytes': len(glb), 'sha256': hashlib.sha256(glb).hexdigest(),
                'sourceFiles': self.inputs}
        (self.output / (self.key + '.json')).write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
        print(self.key, f'{triangles:,} triangles', f'{len(glb)/1e6:.2f} MB', 'size', np.round(hi-lo, 3).tolist(), flush=True)
        return meta


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'dist/assets/simready')
    parser.add_argument('--only', nargs='*'); args = parser.parse_args(); args.output.mkdir(parents=True, exist_ok=True)
    for key, name in SELECTION.items():
        if args.only and key not in args.only: continue
        Exporter(args.cache, args.output, key, name).save()
    all_meta = [json.loads((args.output / (k + '.json')).read_text()) for k in SELECTION if (args.output / (k + '.json')).exists()]
    (args.output / 'manifest.json').write_text(json.dumps({'source': 'NVIDIA SimReady Assets', 'revision': REVISION, 'assets': all_meta}, ensure_ascii=False, indent=2) + '\n')
