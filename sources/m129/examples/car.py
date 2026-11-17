# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"城市小汽车\",\"prompt\":\"一辆蓝色小汽车，四个黑色轮胎和玻璃车窗，长 4 m\",\"source\":\"parametric\",\"template\":\"car\",\"targetSize\":[4000,1800,1500],\"parts\":[{\"id\":\"part_1\",\"name\":\"车身\",\"type\":\"box\",\"dimensions\":[1,0.45,0.19],\"position\":[0,0,0.22],\"rotation\":[0,0,0],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"驾驶舱\",\"type\":\"box\",\"dimensions\":[0.5,0.39,0.21],\"position\":[-0.05,0,0.405],\"rotation\":[0,0,0],\"color\":\"#477c9a\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"挡风玻璃\",\"type\":\"box\",\"dimensions\":[0.02,0.35,0.15],\"position\":[0.21,0,0.42],\"rotation\":[0,-12,0],\"color\":\"#86abb5\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"侧窗\",\"type\":\"box\",\"dimensions\":[0.4,0.01,0.13],\"position\":[-0.06,-0.202,0.43],\"rotation\":[0,0,0],\"color\":\"#86abb5\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"轮胎\",\"type\":\"cylinder\",\"dimensions\":[0.23,0.23,0.09],\"position\":[-0.32,-0.235,0.13],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"轮毂\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.095],\"position\":[-0.32,-0.24,0.13],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_7\",\"name\":\"轮胎\",\"type\":\"cylinder\",\"dimensions\":[0.23,0.23,0.09],\"position\":[0.32,-0.235,0.13],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"轮毂\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.095],\"position\":[0.32,-0.24,0.13],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_9\",\"name\":\"车灯\",\"type\":\"box\",\"dimensions\":[0.02,0.09,0.05],\"position\":[0.51,-0.14,0.25],\"rotation\":[0,0,0],\"color\":\"#f3e1b4\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_10\",\"name\":\"侧窗\",\"type\":\"box\",\"dimensions\":[0.4,0.01,0.13],\"position\":[-0.06,0.202,0.43],\"rotation\":[0,0,0],\"color\":\"#86abb5\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_11\",\"name\":\"轮胎\",\"type\":\"cylinder\",\"dimensions\":[0.23,0.23,0.09],\"position\":[-0.32,0.235,0.13],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"轮毂\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.095],\"position\":[-0.32,0.24,0.13],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_13\",\"name\":\"轮胎\",\"type\":\"cylinder\",\"dimensions\":[0.23,0.23,0.09],\"position\":[0.32,0.235,0.13],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_14\",\"name\":\"轮毂\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.095],\"position\":[0.32,0.24,0.13],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_15\",\"name\":\"车灯\",\"type\":\"box\",\"dimensions\":[0.02,0.09,0.05],\"position\":[0.51,0.14,0.25],\"rotation\":[0,0,0],\"color\":\"#f3e1b4\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[3921.5686283103323,3130.4347890987287,3030.3030376008132],\"position\":[-39.215685844833956,0,-45.45453924230736]}}")
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
