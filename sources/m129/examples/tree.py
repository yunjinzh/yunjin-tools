# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"景观树\",\"prompt\":\"一棵绿色景观树，树干和多团球形树冠，高 3 m\",\"source\":\"parametric\",\"template\":\"tree\",\"targetSize\":[2200,2000,3000],\"parts\":[{\"id\":\"part_1\",\"name\":\"树干\",\"type\":\"cylinder\",\"dimensions\":[0.12,0.12,0.65],\"position\":[0,0,0.325],\"rotation\":[0,0,0],\"color\":\"#b58a60\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"树冠\",\"type\":\"sphere\",\"dimensions\":[0.63,0.63,0.63],\"position\":[0,0,0.95],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"树冠\",\"type\":\"sphere\",\"dimensions\":[0.48,0.48,0.48],\"position\":[-0.22,0,0.76],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_4\",\"name\":\"树冠\",\"type\":\"sphere\",\"dimensions\":[0.5,0.5,0.5],\"position\":[0.22,0.05,0.82],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"树冠\",\"type\":\"sphere\",\"dimensions\":[0.47,0.47,0.47],\"position\":[0,-0.2,0.84],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"树冠\",\"type\":\"sphere\",\"dimensions\":[0.5,0.5,0.5],\"position\":[0.08,0.2,0.88],\"rotation\":[0,0,0],\"color\":\"#648578\",\"roughness\":0.45,\"metalness\":0.08}]},\"transform\":{\"scale\":[2365.5914114946468,2259.887007171749,2371.541528794604],\"position\":[-11.82796340248376,-16.9491532272869,-0.000028270978077671316]}}")
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
