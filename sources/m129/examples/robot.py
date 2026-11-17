# 云金造物 / sand3d 1.6.3
# Python 3.11 or 3.13: pip install sand3d==1.6.3
# Run: python model.py [output.glb]
# Fixed primitive bridge; no generated Python is evaluated.
import json, sys, math
import sand3d as s3d
from mathutils import Matrix, Vector, Quaternion

DATA = json.loads("{\"scene\":{\"version\":1,\"name\":\"工业机械臂\",\"prompt\":\"一台橙色工业机械臂，深灰色底座，两段关节臂和双指夹爪，高 100 cm\",\"source\":\"parametric\",\"template\":\"robot\",\"targetSize\":[720,520,1000],\"parts\":[{\"id\":\"part_1\",\"name\":\"安装底盘\",\"type\":\"cylinder\",\"dimensions\":[0.54,0.54,0.09],\"position\":[0,0,0.045],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_2\",\"name\":\"旋转基座\",\"type\":\"cylinder\",\"dimensions\":[0.4,0.4,0.15],\"position\":[0,0,0.16],\"rotation\":[0,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_3\",\"name\":\"底座上盖\",\"type\":\"cylinder\",\"dimensions\":[0.32,0.32,0.04],\"position\":[0,0,0.255],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_4\",\"name\":\"肩部支架\",\"type\":\"box\",\"dimensions\":[0.25,0.22,0.2],\"position\":[0,0,0.34],\"rotation\":[0,0,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_5\",\"name\":\"肩关节\",\"type\":\"cylinder\",\"dimensions\":[0.24,0.24,0.3],\"position\":[0,0,0.41],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_6\",\"name\":\"肩部端盖\",\"type\":\"cylinder\",\"dimensions\":[0.16,0.16,0.32],\"position\":[0,0,0.41],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_7\",\"name\":\"主臂\",\"type\":\"box\",\"dimensions\":[0.16,0.16,0.42],\"position\":[-0.12,0,0.61],\"rotation\":[0,-32,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_8\",\"name\":\"主臂盖板\",\"type\":\"box\",\"dimensions\":[0.11,0.175,0.3],\"position\":[-0.12,0,0.61],\"rotation\":[0,-32,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_9\",\"name\":\"肘关节\",\"type\":\"cylinder\",\"dimensions\":[0.22,0.22,0.25],\"position\":[-0.24,0,0.79],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_10\",\"name\":\"肘部端盖\",\"type\":\"cylinder\",\"dimensions\":[0.13,0.13,0.27],\"position\":[-0.24,0,0.79],\"rotation\":[90,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_11\",\"name\":\"前臂\",\"type\":\"box\",\"dimensions\":[0.13,0.14,0.48],\"position\":[-0.03,0,0.91],\"rotation\":[0,63,0],\"color\":\"#e07552\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_12\",\"name\":\"腕关节\",\"type\":\"cylinder\",\"dimensions\":[0.17,0.17,0.2],\"position\":[0.18,0,1.02],\"rotation\":[90,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_13\",\"name\":\"末端连接\",\"type\":\"box\",\"dimensions\":[0.15,0.16,0.13],\"position\":[0.28,0,0.99],\"rotation\":[0,25,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_14\",\"name\":\"夹爪基座\",\"type\":\"box\",\"dimensions\":[0.14,0.26,0.08],\"position\":[0.31,0,0.91],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_15\",\"name\":\"夹爪左\",\"type\":\"box\",\"dimensions\":[0.08,0.04,0.17],\"position\":[0.31,-0.11,0.81],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_16\",\"name\":\"夹指左\",\"type\":\"box\",\"dimensions\":[0.08,0.06,0.04],\"position\":[0.31,-0.09,0.72],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_17\",\"name\":\"夹爪右\",\"type\":\"box\",\"dimensions\":[0.08,0.04,0.17],\"position\":[0.31,0.11,0.81],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_18\",\"name\":\"夹指右\",\"type\":\"box\",\"dimensions\":[0.08,0.06,0.04],\"position\":[0.31,0.09,0.72],\"rotation\":[0,0,0],\"color\":\"#343b40\",\"roughness\":0.45,\"metalness\":0.08},{\"id\":\"part_19\",\"name\":\"固定螺栓 1\",\"type\":\"cylinder\",\"dimensions\":[0.035,0.035,0.012],\"position\":[0.14849242404917498,0.14849242404917495,0.095],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_20\",\"name\":\"固定螺栓 2\",\"type\":\"cylinder\",\"dimensions\":[0.035,0.035,0.012],\"position\":[-0.14849242404917495,0.14849242404917498,0.095],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_21\",\"name\":\"固定螺栓 3\",\"type\":\"cylinder\",\"dimensions\":[0.035,0.035,0.012],\"position\":[-0.148492424049175,-0.14849242404917495,0.095],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65},{\"id\":\"part_22\",\"name\":\"固定螺栓 4\",\"type\":\"cylinder\",\"dimensions\":[0.035,0.035,0.012],\"position\":[0.14849242404917493,-0.148492424049175,0.095],\"rotation\":[0,0,0],\"color\":\"#929d9d\",\"roughness\":0.45,\"metalness\":0.65}]},\"transform\":{\"scale\":[986.3013702656722,962.9629246982543,904.9773733689244],\"position\":[-14.794520994896146,0,0.0000016182256459273958]}}")
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
