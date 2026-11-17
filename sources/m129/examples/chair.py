# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"现代休闲椅\",\"prompt\":\"一把绿色休闲椅，木质四条腿，宽 65 cm，高 85 cm\",\"source\":\"parametric\",\"template\":\"chair\",\"targetSize\":[650,650,850],\"parts\":[{\"id\":\"part_1\",\"name\":\"坐垫\",\"type\":\"box\",\"dimensions\":[0.76,0.72,0.16],\"position\":[0,0,0.53],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"靠背\",\"type\":\"box\",\"dimensions\":[0.76,0.15,0.5],\"position\":[0,0.31,0.84],\"rotation\":[-7,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"木质椅腿\",\"type\":\"box\",\"dimensions\":[0.07,0.07,0.46],\"position\":[-0.3,-0.26,0.23],\"rotation\":[6,-6,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"木质椅腿\",\"type\":\"box\",\"dimensions\":[0.07,0.07,0.46],\"position\":[-0.3,0.26,0.23],\"rotation\":[-6,-6,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"木质椅腿\",\"type\":\"box\",\"dimensions\":[0.07,0.07,0.46],\"position\":[0.3,-0.26,0.23],\"rotation\":[6,6,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"木质椅腿\",\"type\":\"box\",\"dimensions\":[0.07,0.07,0.46],\"position\":[0.3,0.26,0.23],\"rotation\":[-6,6,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_7\",\"name\":\"扶手\",\"type\":\"box\",\"dimensions\":[0.1,0.7,0.08],\"position\":[-0.43,0,0.74],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"扶手支撑\",\"type\":\"box\",\"dimensions\":[0.06,0.06,0.2],\"position\":[-0.43,-0.25,0.63],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"扶手\",\"type\":\"box\",\"dimensions\":[0.1,0.7,0.08],\"position\":[0.43,0,0.74],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_10\",\"name\":\"扶手支撑\",\"type\":\"box\",\"dimensions\":[0.06,0.06,0.2],\"position\":[0.43,-0.25,0.63],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[677.0833322823617,838.8089117741288,771.2824027055459],\"position\":[0,-23.028779762055933,3.689760288871753]}}")
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
