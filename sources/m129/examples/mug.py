# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"陶瓷马克杯\",\"prompt\":\"一个橙色陶瓷马克杯，空心杯体和圆形把手，高 12 cm\",\"source\":\"parametric\",\"template\":\"mug\",\"targetSize\":[155,100,120],\"parts\":[{\"id\":\"part_1\",\"name\":\"杯壁\",\"type\":\"tube\",\"dimensions\":[0.75,0.75,0.88],\"position\":[0,0,0.48],\"rotation\":[0,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08,\"wall\":0.045},{\"id\":\"part_2\",\"name\":\"杯底\",\"type\":\"cylinder\",\"dimensions\":[0.75,0.75,0.06],\"position\":[0,0,0.06],\"rotation\":[0,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"杯口\",\"type\":\"torus\",\"dimensions\":[0.705,0.705,0.045],\"position\":[0,0,0.92],\"rotation\":[0,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"杯把\",\"type\":\"torus\",\"dimensions\":[0.48,0.48,0.08],\"position\":[0.47,0,0.49],\"rotation\":[90,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[137.77777763178318,133.33333333333334,131.5068492828558],\"position\":[-25.833333388081297,0,-3.945205566667888]}}")
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
