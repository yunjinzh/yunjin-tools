"""Extract the Gulou west residential block from a WGS84 OSM API XML extract.

Usage: /usr/bin/python3 tools/hutong_extract.py area.osm
Requires GDAL with GEOS. Courtyard walls and tree positions are typological.
"""
import json
import math
import random
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from osgeo import ogr

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 116.38875, 39.94020
LANES = {1467919218: 1.48, 1468345156: 1.68, 1468427002: 2.13}


def position(p):
    return [round((p[0] - ORIGIN[0]) * 85359.2, 2),
            round((ORIGIN[1] - p[1]) * 111033.1, 2)]


def geom(kind, coords):
    g = ogr.Geometry(kind)
    for x, y in coords:
        g.AddPoint_2D(x, y)
    return g


def polygon(ring):
    g = ogr.Geometry(ogr.wkbPolygon)
    g.AddGeometry(geom(ogr.wkbLinearRing, ring + [ring[0]]))
    return g


def line_parts(g):
    if g.IsEmpty():
        return
    if g.GetGeometryName() == 'LINESTRING':
        yield g
    else:
        for i in range(g.GetGeometryCount()):
            yield from line_parts(g.GetGeometryRef(i))


def extract(source):
    osm = ET.parse(source)
    nodes = {n.get('id'): (float(n.get('lon')), float(n.get('lat'))) for n in osm.iter('node')}
    houses, lanes, all_roads = [], [], ogr.Geometry(ogr.wkbMultiLineString)
    occupied = ogr.Geometry(ogr.wkbMultiPolygon)
    for way in osm.iter('way'):
        tags = {t.get('k'): t.get('v') for t in way.iter('tag')}
        path = [nodes[nd.get('ref')] for nd in way.iter('nd')]
        osm_id = int(way.get('id'))
        coords = [position(p) for p in path]
        if 'highway' in tags and any(-110 < x < 100 and -135 < z < 132 for x, z in coords):
            all_roads.AddGeometry(geom(ogr.wkbLineString, coords))
        if osm_id in LANES:
            lanes.append([osm_id, tags['name'], LANES[osm_id], coords])
        if (tags.get('building') == 'bungalow' and all(
                116.38766 < x < 116.38954 and 39.93922 < y < 39.9412 for x, y in path)):
            ring = coords[:-1]
            if not polygon(ring).IsValid():
                continue
            houses.append([osm_id, ring])
            occupied.AddGeometry(polygon(ring))

    solid = occupied.UnionCascaded()
    walls = []
    blocked = solid.Buffer(.35)
    for ref, _, half, points in lanes:
        for side in (-1, 1):
            for a, b in zip(points, points[1:]):
                dx, dz = (b[0] - a[0]), (b[1] - a[1])
                length = math.hypot(dx, dz)
                ux, uz = dx / length, dz / length
                dx, dz = side * -uz * (half + .37), side * ux * (half + .37)
                start = .4 if a != points[0] else 2.8
                end = .4 if b != points[-1] else 1.25
                if length <= start + end:
                    continue
                line = geom(ogr.wkbLineString, [(a[0]+dx+start*ux, a[1]+dz+start*uz),
                                               (b[0]+dx-end*ux, b[1]+dz-end*uz)])
                for part in line_parts(line.Difference(blocked)):
                    if part.Length() >= 1:
                        ends = [list(map(lambda v: round(v, 2), p[:2])) for p in part.GetPoints()]
                        walls.append([ref, side, ends[0], ends[-1]])

    # Keep trees in open spaces surrounded by neighbours in at least 3 directions.
    # Aerial vegetation is not resolved at individual-tree scale by the bundled imagery.
    rng = random.Random(1472)
    candidates = []
    for _ in range(2400):
        x, z = rng.uniform(-65, 38), rng.uniform(-92, 80)
        point = geom(ogr.wkbPoint, [(x, z)])
        clearance = point.Distance(solid)
        if not 2.3 < clearance < 8 or point.Distance(all_roads) < 2.7:
            continue
        quadrants = set()
        for _, pts in houses:
            px = sum(p[0] for p in pts) / len(pts) - x
            pz = sum(p[1] for p in pts) / len(pts) - z
            if math.hypot(px, pz) < 18:
                quadrants.add((px > 0, pz > 0))
        if len(quadrants) >= 3:
            candidates.append((rng.random(), x, z, clearance))
    trees = []
    for _, x, z, clearance in sorted(candidates):
        if len(trees) == 41:
            break
        if all(math.hypot(x-a, z-b) > 12.7 for a, b, *_ in trees):
            radius = min(clearance + .9, rng.uniform(2.1, 4.0))
            trees.append([round(x, 2), round(z, 2), round(radius, 2), round(rng.uniform(5.5, 9.5), 2)])
    return {'houses': sorted(houses), 'lanes': sorted(lanes), 'walls': walls, 'trees': trees}


if __name__ == '__main__':
    data = extract(sys.argv[1])
    out = ROOT/'dist/urban/hutong-data.js'
    with out.open('w') as file:
        file.write('// © OpenStreetMap contributors, ODbL 1.0. See hutong-source.json.\n')
        for name, records in data.items():
            file.write('export const '+name+'='+json.dumps(records, separators=(',', ':'), ensure_ascii=False)+';\n')
    print({name: len(records) for name, records in data.items()})
