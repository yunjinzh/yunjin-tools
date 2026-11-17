# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"开放书架\",\"prompt\":\"一个 5 层木质书架，宽 100 cm，高 180 cm\",\"source\":\"parametric\",\"template\":\"shelf\",\"targetSize\":[1000,350,1800],\"parts\":[{\"id\":\"part_1\",\"name\":\"侧板\",\"type\":\"box\",\"dimensions\":[0.05,0.34,1.3],\"position\":[-0.47,0,0.65],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"侧板\",\"type\":\"box\",\"dimensions\":[0.05,0.34,1.3],\"position\":[0.47,0,0.65],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"第 1 层隔板\",\"type\":\"box\",\"dimensions\":[0.9,0.34,0.035],\"position\":[0,0,0.045],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"第 2 层隔板\",\"type\":\"box\",\"dimensions\":[0.9,0.34,0.035],\"position\":[0,0,0.3475],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"第 3 层隔板\",\"type\":\"box\",\"dimensions\":[0.9,0.34,0.035],\"position\":[0,0,0.65],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"第 4 层隔板\",\"type\":\"box\",\"dimensions\":[0.9,0.34,0.035],\"position\":[0,0,0.9525],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_7\",\"name\":\"第 5 层隔板\",\"type\":\"box\",\"dimensions\":[0.9,0.34,0.035],\"position\":[0,0,1.255],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"背板\",\"type\":\"box\",\"dimensions\":[0.9,0.025,1.3],\"position\":[0,0.16,0.65],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.33,-0.035,0.14],\"rotation\":[0,0,0],\"color\":\"#708a7c\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_10\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.255,-0.035,0.14],\"rotation\":[0,0,0],\"color\":\"#cc775d\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_11\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.18000000000000002,-0.035,0.14],\"rotation\":[0,0,0],\"color\":\"#d1b679\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.10500000000000004,-0.035,0.14],\"rotation\":[0,0,0],\"color\":\"#748994\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_13\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.33,-0.035,0.4425],\"rotation\":[0,0,0],\"color\":\"#708a7c\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_14\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.255,-0.035,0.4425],\"rotation\":[0,0,0],\"color\":\"#cc775d\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_15\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.18000000000000002,-0.035,0.4425],\"rotation\":[0,0,0],\"color\":\"#d1b679\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_16\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.10500000000000004,-0.035,0.4425],\"rotation\":[0,0,0],\"color\":\"#748994\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_17\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.33,-0.035,0.745],\"rotation\":[0,0,0],\"color\":\"#708a7c\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_18\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.255,-0.035,0.745],\"rotation\":[0,0,0],\"color\":\"#cc775d\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_19\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.18000000000000002,-0.035,0.745],\"rotation\":[0,0,0],\"color\":\"#d1b679\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_20\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.10500000000000004,-0.035,0.745],\"rotation\":[0,0,0],\"color\":\"#748994\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_21\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.33,-0.035,1.0474999999999999],\"rotation\":[0,0,0],\"color\":\"#708a7c\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_22\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.255,-0.035,1.0474999999999999],\"rotation\":[0,0,0],\"color\":\"#cc775d\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_23\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.16],\"position\":[-0.18000000000000002,-0.035,1.0474999999999999],\"rotation\":[0,0,0],\"color\":\"#d1b679\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_24\",\"name\":\"书籍\",\"type\":\"box\",\"dimensions\":[0.065,0.2,0.2],\"position\":[-0.10500000000000004,-0.035,1.0474999999999999],\"rotation\":[0,0,0],\"color\":\"#748994\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[1010.1010093408244,1021.8978043280613,1384.615435402776],\"position\":[0,-1.2773714369338904,-0.000033011804475790996]}}")
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
