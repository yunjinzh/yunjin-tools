# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"齿轮示意\",\"prompt\":\"一个蓝色带中心孔的 20 齿示意齿轮，直径 20 cm\",\"source\":\"parametric\",\"template\":\"gear\",\"targetSize\":[200,200,35],\"parts\":[{\"id\":\"part_1\",\"name\":\"轮体\",\"type\":\"tube\",\"dimensions\":[0.8,0.8,0.15],\"position\":[0,0,0.075],\"rotation\":[0,0,0],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08,\"wall\":0.25},{\"id\":\"part_2\",\"name\":\"轮齿 1\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.43,0,0.075],\"rotation\":[0,0,0],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"轮齿 2\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.408954302006916,0.13287730758122737,0.075],\"rotation\":[0,0,18],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"轮齿 3\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.3478773075812274,0.25274765848576347,0.075],\"rotation\":[0,0,36],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"轮齿 4\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.25274765848576347,0.3478773075812274,0.075],\"rotation\":[0,0,54],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"轮齿 5\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.1328773075812274,0.408954302006916,0.075],\"rotation\":[0,0,72],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_7\",\"name\":\"轮齿 6\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[2.6329906181668094e-17,0.43,0.075],\"rotation\":[0,0,90],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"轮齿 7\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.13287730758122734,0.40895430200691607,0.075],\"rotation\":[0,0,108],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"轮齿 8\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.2527476584857634,0.3478773075812274,0.075],\"rotation\":[0,0,126],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_10\",\"name\":\"轮齿 9\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.34787730758122737,0.25274765848576347,0.075],\"rotation\":[0,0,144],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_11\",\"name\":\"轮齿 10\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.408954302006916,0.13287730758122743,0.075],\"rotation\":[0,0,162],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"轮齿 11\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.43,5.265981236333619e-17,0.075],\"rotation\":[0,0,180],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_13\",\"name\":\"轮齿 12\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.4089543020069161,-0.13287730758122715,0.075],\"rotation\":[0,0,197.99999999999997],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_14\",\"name\":\"轮齿 13\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.3478773075812274,-0.2527476584857634,0.075],\"rotation\":[0,0,216],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_15\",\"name\":\"轮齿 14\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.25274765848576347,-0.34787730758122737,0.075],\"rotation\":[0,0,234],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_16\",\"name\":\"轮齿 15\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-0.13287730758122746,-0.408954302006916,0.075],\"rotation\":[0,0,252],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_17\",\"name\":\"轮齿 16\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[-7.898971854500428e-17,-0.43,0.075],\"rotation\":[0,0,270],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_18\",\"name\":\"轮齿 17\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.13287730758122732,-0.40895430200691607,0.075],\"rotation\":[0,0,288],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_19\",\"name\":\"轮齿 18\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.25274765848576336,-0.3478773075812274,0.075],\"rotation\":[0,0,306],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_20\",\"name\":\"轮齿 19\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.34787730758122737,-0.2527476584857635,0.075],\"rotation\":[0,0,324],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_21\",\"name\":\"轮齿 20\",\"type\":\"box\",\"dimensions\":[0.15,0.07,0.15],\"position\":[0.408954302006916,-0.13287730758122748,0.075],\"rotation\":[0,0,342],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[198.0198008115941,198.01980081159405,233.33332406150006],\"position\":[0,0,6.953874951420858e-7]}}")
s3d.empty_scene()
s3d.units("mm")
parts = []
factor = 1000 if max(max(p["dimensions"]) for p in DATA["scene"]["parts"]) < 10 else 1
for spec in DATA["scene"]["parts"]:
    w, d, h = [v * factor for v in spec["dimensions"]]
    name, kind = spec["name"], spec["type"]
    if kind == "box":
        ob = s3d.box(name, w, d, h)
    elif kind == "sphere":
        ob = s3d.sphere(name, w)
    elif kind == "cylinder":
        ob = s3d.cylinder(name, w, h)
    elif kind == "cone":
        ob = s3d.cone(name, w, h, d2=w * spec.get("topRatio", 0))
    elif kind == "tube":
        ob = s3d.tube(name, w, w - 2 * spec["wall"] * factor, h)
    elif kind == "torus":
        ob = s3d.torus(name, w, h)
    else:
        raise ValueError("Unsupported primitive")
    # sand3d solids stand on Z=0; the shared scene uses geometric centers.
    vertices = [v.co.copy() for v in ob.data.vertices]
    center = Vector(tuple((min(v[i] for v in vertices) + max(v[i] for v in vertices)) / 2 for i in range(3)))
    ob.data.transform(Matrix.Translation(-center))
    if kind == "sphere":
        ob.data.transform(Matrix.Diagonal((1, d / w, h / w, 1)))
    elif kind in ("cylinder", "cone", "tube"):
        ob.data.transform(Matrix.Diagonal((1, d / w, 1, 1)))
    rx, ry, rz = [math.radians(v) for v in spec["rotation"]]
    # Three.js intrinsic XYZ: Rx @ Ry @ Rz.
    rotation = Matrix.Rotation(rx, 4, "X") @ Matrix.Rotation(ry, 4, "Y") @ Matrix.Rotation(rz, 4, "Z")
    ob.matrix_world = Matrix.Translation(Vector([v * factor for v in spec["position"]])) @ rotation
    s3d.material(ob, "plastic", color=spec["color"], roughness=spec["roughness"], metallic=spec["metalness"])
    parts.append(ob)
root = s3d.assembly(DATA["scene"]["name"], *parts)
t = DATA["transform"]
root.root.matrix_world = Matrix.Translation(Vector(t["position"])) @ Matrix.Diagonal(tuple(v / factor for v in t["scale"]) + (1,))
output = sys.argv[1] if len(sys.argv) > 1 else "model.glb"
s3d.export(root, output)
print("Exported:", output)
