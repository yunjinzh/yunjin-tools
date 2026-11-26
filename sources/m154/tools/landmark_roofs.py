"""Build compact ODbL roof features from the same GDAL GeoPackage as the city extract."""
import json
import math
import re
import sys
from pathlib import Path
from osgeo import ogr

ANCHOR = (116.3908139, 39.9158956)
YAW = .0356

def extract(source):
    dataset = ogr.Open(source)
    layer = dataset.GetLayerByName('multipolygons')
    layer.SetSpatialFilterRect(116.3860, 39.9114, 116.3955, 39.9213)
    features = list(layer)
    boundary = next(f.GetGeometryRef() for f in features
                    if f.GetField('name') == '故宫' and not f.GetField('building'))
    roofs = []
    for feature in features:
        if not feature.GetField('building'):
            continue
        tags = dict(re.findall(r'"([^"]+)"=>"([^"]+)"', feature.GetField('other_tags') or ''))
        shape = tags.get('roof:shape')
        geometry = feature.GetGeometryRef()
        if shape not in ['gabled', 'hipped', 'pyramidal'] or not boundary.Contains(geometry.Centroid()):
            continue
        if geometry.GetGeometryName() == 'MULTIPOLYGON':
            if geometry.GetGeometryCount() != 1:
                continue
            geometry = geometry.GetGeometryRef(0)
        if geometry.GetGeometryCount() != 1:
            continue
        points = []
        for lon, lat, *_ in geometry.GetGeometryRef(0).GetPoints()[:-1]:
            x = (lon - ANCHOR[0]) * 85360
            z = (ANCHOR[1] - lat) * 111030
            points.append((round(x * math.cos(YAW) - z * math.sin(YAW), 2),
                           round(z * math.cos(YAW) + x * math.sin(YAW), 2)))
        if len(points) < 3:
            continue
        # Use the direction of the minimum-area envelope rather than the first OSM vertex.
        xs, zs = zip(*points)
        amin = float('inf')
        for i, (px, pz) in enumerate(points):
            qx, qz = points[(i+1) % len(points)]
            ang = math.atan2(qz-pz, qx-px)
            c, s = math.cos(ang), math.sin(ang)
            u = [xx*c + zz*s for xx, zz in points]
            v = [-xx*s + zz*c for xx, zz in points]
            w, d = max(u)-min(u), max(v)-min(v)
            if w*d < amin:
                amin = w*d
                axis = ang if w >= d else ang + math.pi/2
        if amin < 16:
            continue
        area = abs(sum(x*points[(i+1)%len(points)][1]-z*points[(i+1)%len(points)][0] for i,(x,z) in enumerate(points)))/2
        if area < .87 * amin:
            continue
        if tags.get('roof:orientation') == 'across':
            axis += math.pi/2
        ref = feature.GetField('osm_way_id') or feature.GetField('osm_id')
        height = feature.GetField('height')
        roof_h = tags.get('roof:height')
        metric = lambda val: round(float(val), 2) if val and re.fullmatch(r'[0-9.]+', str(val)) else None
        roofs.append([str(ref), points, round(axis,5), metric(height),metric(roof_h),shape,tags.get('roof:colour','')])
    return roofs

if __name__ == '__main__':
    rows=extract(sys.argv[1])
    out=Path(__file__).resolve().parents[1] / 'dist/data/palace-roofs.js'
    out.write_text('// © OpenStreetMap contributors, ODbL 1.0. Same snapshot and attribution as osm-source.json.\nexport const palaceRoofs='+json.dumps(rows, separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
    print(len(rows))
