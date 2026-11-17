# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"探索火箭\",\"prompt\":\"一枚白色火箭，红色锥形头部和三个助推器，高 2 m\",\"source\":\"parametric\",\"template\":\"rocket\",\"targetSize\":[750,750,2000],\"parts\":[{\"id\":\"part_1\",\"name\":\"主箭体\",\"type\":\"cylinder\",\"dimensions\":[0.28,0.28,0.9],\"position\":[0,0,0.73],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"整流罩\",\"type\":\"cone\",\"dimensions\":[0.28,0.28,0.27],\"position\":[0,0,1.315],\"rotation\":[0,0,0],\"color\":\"#be5a48\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_3\",\"name\":\"环形标记\",\"type\":\"torus\",\"dimensions\":[0.28,0.28,0.025],\"position\":[0,0,0.98],\"rotation\":[0,0,0],\"color\":\"#be5a48\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"发动机\",\"type\":\"cylinder\",\"dimensions\":[0.2,0.2,0.12],\"position\":[0,0,0.22],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"助推器\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.52],\"position\":[0.21,0,0.39],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"助推器头锥\",\"type\":\"cone\",\"dimensions\":[0.12,0.12,0.14],\"position\":[0.21,0,0.72],\"rotation\":[0,0,0],\"color\":\"#be5a48\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_7\",\"name\":\"喷口\",\"type\":\"cone\",\"dimensions\":[0.1,0.1,0.1],\"position\":[0.21,0,0.08],\"rotation\":[180,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_8\",\"name\":\"助推器\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.52],\"position\":[-0.10499999999999995,0.18186533479473213,0.39],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"助推器头锥\",\"type\":\"cone\",\"dimensions\":[0.12,0.12,0.14],\"position\":[-0.10499999999999995,0.18186533479473213,0.72],\"rotation\":[0,0,0],\"color\":\"#be5a48\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_10\",\"name\":\"喷口\",\"type\":\"cone\",\"dimensions\":[0.1,0.1,0.1],\"position\":[-0.10499999999999995,0.18186533479473213,0.08],\"rotation\":[180,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_11\",\"name\":\"助推器\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.52],\"position\":[-0.1050000000000001,-0.18186533479473208,0.39],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"助推器头锥\",\"type\":\"cone\",\"dimensions\":[0.12,0.12,0.14],\"position\":[-0.1050000000000001,-0.18186533479473208,0.72],\"rotation\":[0,0,0],\"color\":\"#be5a48\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0},{\"id\":\"part_13\",\"name\":\"喷口\",\"type\":\"cone\",\"dimensions\":[0.1,0.1,0.1],\"position\":[-0.1050000000000001,-0.18186533479473208,0.08],\"rotation\":[180,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08,\"topRatio\":0}]},\"transform\":{\"scale\":[1724.1379416655132,1550.4495606928228,1408.4506981655663],\"position\":[-90.51724193743937,-5.684341886080802e-14,-42.253519895589434]}}")
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
