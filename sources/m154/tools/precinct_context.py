"""Extract historical building parts and grounds from the city OSM snapshot.

Usage: /usr/bin/python3 tools/precinct_context.py local.gpkg beijing.osm.pbf
Building parts that GDAL classified as closed lines are essential here. Units
are metres in the two pre-existing landmark coordinate frames.
"""
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path
from osgeo import ogr

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist/heritage/precinct-data.js'
ANCHORS = {'palace': (116.3908139, 39.9158956, .0356),
           'tiananmen': (116.3912643, 39.9073379, .031)}
STANDS = [257208023, 257208024, 257208025, 257208026]
SURFACES = {523763740: 'river', **{i: 'grass' for i in [227192084,227192158,477732126,477732127]}}
MIDDLE_GATE = {8847696,8847697}
PALACE_ROOFS = {str(row[0]) for row in json.loads((ROOT/'dist/data/palace-roofs.js').read_text().split('palaceRoofs=')[1].rstrip(';\n'))}
def tags(f):
    return {**dict(re.findall(r'"([^"]+)"=>"([^"]+)"', f['other_tags'] or '')),
            **{k:v for k,v in f.items().items() if v and k!='other_tags'}}
def metric(value):
    try: return float(value)
    except (TypeError,ValueError): return None
def point(x, y, anchor):
    lon,lat,yaw = anchor
    px, pz = (x-lon)*85359.2, (lat-y)*111033.1
    return [round(px*math.cos(yaw)-pz*math.sin(yaw),2), round(px*math.sin(yaw)+pz*math.cos(yaw),2)]
def rings(g,anchor):
    return [[point(x,y,anchor) for x,y,*_ in g.GetGeometryRef(k).GetPoints()[:-1]] for k in range(g.GetGeometryCount())]
def polygons(g):
    if g.GetGeometryName()=='MULTIPOLYGON': return [g.GetGeometryRef(i).Clone() for i in range(g.GetGeometryCount())]
    if g.GetGeometryName()=='LINESTRING':
        pts=g.GetPoints()
        if len(pts)<4 or pts[0][:2]!=pts[-1][:2]: return []
        ring=ogr.Geometry(ogr.wkbLinearRing)
        for x,y,*_ in pts:ring.AddPoint_2D(x,y)
        p=ogr.Geometry(ogr.wkbPolygon);p.AddGeometry(ring);return [p]
    return [g.Clone()] if g.GetGeometryName()=='POLYGON' else []
def inside_hand_model(x,z):
    # Main halls, gates, four corner towers and foundations supplied by landmarks.js.
    rects=[(0,0,52,80),(0,-63,28,33),(0,-124,46,33),(0,212,102,19),
           (0,-217,22,12),(0,-317,28,15),(0,-354,13,13),(0,-386,25,16),
           (0,391,64,53),(0,-562,29,16)]
    return (any(abs(x-cx)<w and abs(z-cz)<d for cx,cz,w,d in rects)
            or abs(abs(x)-376.5)<12 and (abs(z-391)<15 or abs(z+562)<15))
def record(ref,t,g,anchor,inferred=False):
    r=rings(g,anchor)
    if len(r[0])<3:return None
    xs,zs=zip(*r[0]);w=max(xs)-min(xs);d=max(zs)-min(zs)
    if min(w,d)<.15:return None
    h=metric(t.get('height'));rh=metric(t.get('roof:height'));low=metric(t.get('min_height')) or 0
    name=t.get('name','');wall=t.get('building')=='wall' or '墙' in name
    shape=t.get('roof:shape','')
    ratio=g.GetArea()*85359.2*111033.1/max(.01,w*d)
    if inferred:
        if not h: h=(3.8 if wall else 4.6 if ratio<.5 else min(10.7,4.45+min(w,d)*.25))
        if not shape:shape='flat' if wall or len(r)>1 or ratio<.51 else 'hipped'
    if not h or h<=low:return None
    if shape not in ('skillion','gabled','hipped','pyramidal'):shape='flat'
    if shape!='flat' and not rh:rh=min(h-low-.2, max(.7,min(w,d)*.22))
    rh=max(0,min(h-low,rh or 0))
    rc=t.get('roof:colour','')
    mat=t.get('roof:material','')
    wc=t.get('building:colour','');wm=t.get('building:material','')
    roof=('stone' if mat=='stone' or (wm=='stone' and not rc) else
          'grey' if 'grey' in rc.lower() or 'gray' in rc.lower() else
          'gold' if rc=='#FB994D' or shape!='flat' and (wall or not inferred or any(ch in name for ch in '殿门宮宫庑阁亭')) else
          'grey' if shape!='flat' or wall else 'brick' if wc=='firebrick' else 'neutral')
    body=('stone' if wm=='stone' or wc in ('white','LightGrey') else
          'red' if wc.lower() in ('firebrick','indianred','lightcoral') or wm=='wood' or wall or roof=='gold' else 'neutral')
    direction=metric(t.get('roof:direction'))
    # OSM roof:direction is the downhill compass heading. Convert to our x/z frame.
    direction=round(math.radians(direction)+anchor[2],4) if direction is not None else None
    treatment=('plaster' if wall else 'timber' if wm=='wood' or (shape in ('hipped','gabled','pyramidal') and min(w,d)>5 and ratio>.68) else 'plain')
    return [ref, shape, round(low,2),round(h,2), round(rh,2),direction,t.get('roof:orientation')=='across',roof,body,r,treatment]
def main(src,raw):
    ds=ogr.Open(src);out={};suppress=set();counts=Counter()
    for name,anchor in ANCHORS.items():
        is_palace=name=='palace';lon,lat,a=anchor
        rect=(lon-.006,lat-.0065,lon+.006,lat+.0065) if is_palace else (lon-.005,lat-.0012,lon+.005,lat+.0049)
        shape_layer=ds.GetLayerByName('multipolygons');shape_layer.SetSpatialFilterRect(*rect)
        shapes=list(shape_layer)
        boundary=next((f.GetGeometryRef().Clone() for f in shapes if f['name']=='故宫' and not f['building']),None) if is_palace else None
        parts=[];structures=[];grounds=[];rows=[]
        def eligible(g):
            center=g.Centroid();x,z=point(center.GetX(),center.GetY(),anchor)
            if is_palace:return boundary.Contains(center)
            return abs(x)<333 and -496<z<50
        for lname in ('lines','multipolygons'):
            l=ds.GetLayerByName(lname);l.SetSpatialFilterRect(*rect)
            for f in l:
                t=tags(f)
                if not (t.get('building:part') or t.get('building') or t.get('osm_way_id') and int(t['osm_way_id']) in SURFACES):continue
                typ='way' if lname=='lines' or t.get('osm_way_id') else 'relation'
                num=int(t.get('osm_way_id') or t['osm_id']);ref=typ+'/'+str(num)
                for g in polygons(f.GetGeometryRef()):
                    if num in SURFACES and not is_palace:
                        grounds.append([num,SURFACES[num],rings(g,anchor)[0]]);continue
                    if not eligible(g):continue
                    if not is_palace and (num in MIDDLE_GATE or (t.get('building:part') and -21<point(g.Centroid().GetX(),g.Centroid().GetY(),anchor)[1]<21 and abs(point(g.Centroid().GetX(),g.Centroid().GetY(),anchor)[0])<60)):continue
                    if t.get('building'):suppress.add(ref)
                    if num in STANDS:
                        grounds.append([num,'stand',rings(g,anchor)[0]]);continue
                    geom=(g,ref,t)
                    if t.get('building:part'):parts.append(geom)
                    else:structures.append(geom)
        # Unqualified parent footprints overlap many individually mapped roofs, stairs and platforms.
        # A parent must never be extruded over those objects.
        existing=[g for g,ref,t in structures if is_palace and ref.split('/')[1] in PALACE_ROOFS]
        detailed=parts+[(g,'',{}) for g in existing]
        for g,ref,t in parts+structures:
            center=g.Centroid();x,z=point(center.GetX(),center.GetY(),anchor)
            if is_palace and inside_hand_model(x,z):continue
            if is_palace and ref.split('/')[1] in PALACE_ROOFS:continue
            derived=not t.get('building:part')
            if derived:
                envelope=g.GetEnvelope()
                def contained(child):
                    env=child.GetEnvelope()
                    if env[1]<envelope[0] or env[0]>envelope[1] or env[3]<envelope[2] or env[2]>envelope[3]:return False
                    a=min(g.GetArea(),child.GetArea())
                    overlap=child.Intersection(g)
                    return overlap.GetDimension()==2 and a>0 and overlap.GetArea()>.72*a
                if any(contained(k) for k,_,_ in detailed):continue
            row=record(ref,t,g,anchor,derived)
            if row:rows.append(row);counts[(name,'estimated' if derived and not t.get('height') else 'tagged')]+=1
        out[name]={'volumes':rows,'grounds':grounds,'trees':[]}
    # Original points include rows of individually mapped trees between Duanmen and Tiananmen.
    raw_dataset=ogr.Open(raw);l=raw_dataset.GetLayerByName('points')
    anchor=ANCHORS['tiananmen'];lon,lat,_=anchor
    l.SetSpatialFilterRect(lon-.0037,lat-.0002,lon+.0037,lat+.0042)
    for f in l:
        t=tags(f)
        if t.get('natural')!='tree':continue
        p=f.GetGeometryRef();x,z=point(p.GetX(),p.GetY(),anchor)
        if -495<z<16 and abs(x)<295:
            out['tiananmen']['trees'].append([x,z,metric(t.get('height')) or 7.8])
    with OUTPUT.open('w') as s:
        s.write('// © OpenStreetMap contributors, ODbL 1.0. Source snapshot as in data/osm-source.json.\n')
        for key,val in [('precinctData',out),('precinctRefs',sorted(suppress))]:
            s.write('export const '+key+'='+json.dumps(val,separators=(',',':'),ensure_ascii=False)+';\n')
    print(counts,'replacement outlines',len(suppress),'trees',len(out['tiananmen']['trees']),'bytes',OUTPUT.stat().st_size)
if __name__=='__main__':main(*sys.argv[1:])
