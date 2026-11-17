# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"滚筒洗衣机\",\"prompt\":\"一台白色滚筒洗衣机，圆形舱门、旋钮和洗涤剂抽屉，高 85 cm\",\"source\":\"parametric\",\"template\":\"washer\",\"targetSize\":[600,600,850],\"parts\":[{\"id\":\"part_1\",\"name\":\"机身\",\"type\":\"box\",\"dimensions\":[0.7,0.65,0.93],\"position\":[0,0,0.49],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"顶部面板\",\"type\":\"box\",\"dimensions\":[0.72,0.67,0.035],\"position\":[0,0,0.97],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"控制区\",\"type\":\"box\",\"dimensions\":[0.66,0.015,0.13],\"position\":[0,-0.333,0.85],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"舱门外圈\",\"type\":\"torus\",\"dimensions\":[0.41,0.41,0.055],\"position\":[0,-0.36,0.46],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_5\",\"name\":\"舱门玻璃\",\"type\":\"cylinder\",\"dimensions\":[0.35,0.35,0.03],\"position\":[0,-0.367,0.46],\"rotation\":[90,0,0],\"color\":\"#374e58\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"内筒轮廓\",\"type\":\"torus\",\"dimensions\":[0.26,0.26,0.012],\"position\":[0,-0.386,0.46],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_7\",\"name\":\"舱门把手\",\"type\":\"box\",\"dimensions\":[0.035,0.045,0.13],\"position\":[0.22,-0.395,0.48],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"洗涤剂抽屉\",\"type\":\"box\",\"dimensions\":[0.26,0.03,0.07],\"position\":[-0.17,-0.353,0.86],\"rotation\":[0,0,0],\"color\":\"#e6e5df\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"程序旋钮\",\"type\":\"cylinder\",\"dimensions\":[0.075,0.075,0.035],\"position\":[0.1,-0.36,0.85],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_10\",\"name\":\"显示屏\",\"type\":\"box\",\"dimensions\":[0.12,0.02,0.05],\"position\":[0.24,-0.35,0.85],\"rotation\":[0,0,0],\"color\":\"#7eafb0\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_11\",\"name\":\"底脚\",\"type\":\"cylinder\",\"dimensions\":[0.06,0.06,0.03],\"position\":[-0.26,-0.24,0.015],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"底脚\",\"type\":\"cylinder\",\"dimensions\":[0.06,0.06,0.03],\"position\":[-0.26,0.24,0.015],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_13\",\"name\":\"底脚\",\"type\":\"cylinder\",\"dimensions\":[0.06,0.06,0.03],\"position\":[0.26,-0.24,0.015],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_14\",\"name\":\"底脚\",\"type\":\"cylinder\",\"dimensions\":[0.06,0.06,0.03],\"position\":[0.26,0.24,0.015],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[833.3333002196431,797.3421829017659,860.7594938981879],\"position\":[0,32.89036207436672,-2.885921084327947e-7]}}")
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
