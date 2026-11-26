"""Rebuild the bundled OSM subset with GDAL 3.10+, its Python bindings, NumPy and SciPy.

Usage: /usr/bin/python3 tools/data_build.py --pbf beijing-261125.osm.pbf
Provide the optional --gpkg argument to reuse a previously extracted layer pair.
The feature database is made available under the Open Database License v1.0.
"""
import argparse
from collections import Counter
import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import re
import struct
import subprocess
import tempfile
import zlib
from osgeo import ogr, gdal
from data_neighbors import neighborhood_heights

gdal.UseExceptions()
ogr.UseExceptions()
BOUNDS = [116.350,39.860,116.498,40.015]
SCALE = 1_000_000
OUTPUT = Path(__file__).resolve().parents[1] / 'dist' / 'data'
SOURCE = 'https://download.geofabrik.de/asia/china/beijing/beijing-261125.osm.pbf'
GREEN_LAND = {'grass','forest','meadow','recreation_ground','flowerbed','greenfield','village_green','allotments','orchard','cemetery'}
GREEN_NATURAL = {'wood','scrub','shrubbery','grassland','grass','greenfield','heath'}
GREEN_LEISURE = {'park','garden','common','golf_course','nature_reserve','playground','pitch'}
HIGHWAYS = {'motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','service','living_street','pedestrian','path','footway','cycleway','steps','track','bridleway','road','busway','bus_guideway'}


def extract(pbf, directory):
    cfg=Path(gdal.FindFile('gdal','osmconf.ini')).read_text()
    cfg=cfg.replace('closed_ways_are_polygons=aeroway','closed_ways_are_polygons=area:highway,waterway=riverbank,water,highway=pedestrian,aeroway')
    cfg=cfg.replace('attributes=name,highway,waterway,aerialway,barrier,man_made,railway','attributes=name,name:zh,highway,waterway,aerialway,barrier,man_made,railway,width,lanes,bridge,tunnel,layer,area,access')
    cfg=cfg.replace('attributes=name,type,aeroway,amenity,admin_level,barrier,boundary,building,craft,geological,historic,land_area,landuse,leisure,man_made,military,natural,office,place,shop,sport,tourism','attributes=name,name:zh,type,amenity,building,landuse,leisure,natural,water,waterway,height,building:levels,highway,area:highway,place,tunnel,layer,surface')
    conf=directory/'osmconf.ini'; conf.write_text(cfg)
    gpkg=directory/'region.gpkg'; box=list(map(str,BOUNDS))
    subprocess.run(['ogr2ogr','-f','GPKG','-oo',f'CONFIG_FILE={conf}','-lco','SPATIAL_INDEX=NO','-spat',*box,'-clipsrc',*box,'-skipfailures',str(gpkg),str(pbf),'lines','multipolygons'],check=True)
    return gpkg


def proto_fields(raw):
    view=io.BytesIO(raw)
    def var():
        out=0; shift=0
        while True:
            value=view.read(1)[0]; out+=(value&127)<<shift
            if value<128:return out
            shift+=7
    while view.tell()<len(raw):
        key=var(); yield (key>>3, var() if key&7==0 else view.read(var()))


def timestamp(pbf):
    with pbf.open('rb') as source:
        length=struct.unpack('>I',source.read(4))[0]
        head=dict(proto_fields(source.read(length)))
        blob=dict(proto_fields(source.read(head[3])))
        decoded=dict(proto_fields(blob[1] if 1 in blob else zlib.decompress(blob[3])))
    return dt.datetime.fromtimestamp(decoded[32],dt.timezone.utc).isoformat().replace('+00:00','Z')


def number(value):
    if not value:return 0
    match=re.fullmatch(r'\s*(\d+(?:\.\d+)?)\s*(m|metres|meters|ft|feet|\')?\s*',str(value),re.I)
    if not match:return 0
    result=float(match[1]); unit=(match[2] or '').lower()
    if unit in {'ft','feet',"'"}:result*=.3048
    return round(result,2) if 0<result<=1000 else 0


def coord_path(geometry, closed):
    pts=[]
    for x,y,*_ in geometry.GetPoints():
        p=(round(x*SCALE),round(y*SCALE))
        if not pts or pts[-1]!=p:pts.append(p)
    if closed and len(pts)>1 and pts[-1]==pts[0]:pts.pop()
    return pts if len(pts)>=(3 if closed else 2) else []


def parts(geometry, target):
    if geometry.GetGeometryName()==target:yield geometry
    else:
        for i in range(geometry.GetGeometryCount()):yield from parts(geometry.GetGeometryRef(i),target)


def area_category(f):
    building=f['building']; leisure=f['leisure']; natural=f['natural']; landuse=f['landuse']
    if building:
        if building in ('no','construction','demolished','ruins','proposed','underground','basement'):return None,None
        if (f['layer'] or '').startswith('-'):return None,None
        return 'buildings',building
    if natural=='water' or f['waterway']=='riverbank' or landuse in ('reservoir','basin'):
        return 'water',f['water'] or f['waterway'] or landuse or natural
    if leisure in GREEN_LEISURE:return 'parks',leisure
    if natural in GREEN_NATURAL:return 'parks',natural
    if landuse in GREEN_LAND:return 'parks',landuse
    if f['place']=='square' or f['highway']=='pedestrian' or f['area_highway'] in ('footway','pedestrian'):
        return 'plazas',f['surface'] or 'paved'
    return None,None


class DatabaseWriter:
    def __init__(self):
        self.buf=bytearray(); self.texts={'':0}; self.counts=Counter(); self.heights=Counter()
        self.observations=[]
        self.order=['buildings','roads','water','parks','plazas'];self.features={k:bytearray() for k in self.order}
    def var(self, n):
        while n>=128:
            self.buf.append(128+(n&127));n>>=7
        self.buf.append(n)
    def zig(self,n): self.var(n*2 if n>=0 else -n*2-1)
    def text(self,s):self.var(self.texts.setdefault(s or '',len(self.texts)))
    def path(self,pts):
        self.var(len(pts)); x0,y0=[round(i*SCALE) for i in BOUNDS[:2]]
        for x,y in pts:
            self.zig(x-x0);self.zig(y-y0);x0,y0=x,y
    def add(self,cat,r,kind,paths):
        if not paths:return
        self.buf=self.features[cat]; self.counts[cat]+=1
        way=True if cat=='roads' else bool(r['osm_way_id']); ref=r['osm_id'] if cat=='roads' or not way else r['osm_way_id']
        self.var(int(ref)*2+(0 if way else 1));self.text(kind);self.text(r['name_zh'] or r['name'])
        if cat=='buildings':
            h=number(r['height']); lv=number(r['building_levels']);self.var(round(h*100));self.var(round(lv*10));self.heights['taggedHeight' if h else 'levelsOnly' if lv else 'unknownHeight']+=1
        elif cat=='roads':
            self.var(round(number(r['width'])*100));self.var(round(number(r['lanes'])));self.var(int((r['bridge'] or 'no') not in ('no','false','0')))
        self.var(len(paths))
        for path in paths:self.path(path)
    def generate(self,dataset):
        for r in dataset.GetLayerByName('lines'):
            kind=r['highway']
            if kind not in HIGHWAYS or (r['tunnel'] or 'no') not in ('no','false','0') or (r['layer'] or '').startswith('-'):continue
            for line in parts(r.GetGeometryRef(),'LINESTRING'):
                pts=coord_path(line.Simplify(.000004),False)
                if pts:self.add('roads',r,kind,[pts])
        for r in dataset.GetLayerByName('multipolygons'):
            cat,kind=area_category(r)
            if not cat:continue
            for poly in parts(r.GetGeometryRef(),'POLYGON'):
                paths=[]
                for k in range(poly.GetGeometryCount()):
                    pts=coord_path(poly.GetGeometryRef(k),True)
                    if not pts and k==0:break
                    if pts:paths.append(pts)
                self.add(cat,r,kind,paths)
                if paths and cat=='buildings':
                    center=poly.Centroid(); self.observations.append((center.GetX(),center.GetY(),poly.Area(),kind,number(r['height']),number(r['building_levels'])))


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--pbf',required=True,type=Path);parser.add_argument('--gpkg',type=Path);options=parser.parse_args()
    with tempfile.TemporaryDirectory() as tmp:
        dataset=ogr.Open(str(options.gpkg or extract(options.pbf,Path(tmp))))
        writer=DatabaseWriter();writer.generate(dataset)
    meta={'bounds':BOUNDS,'crs':'EPSG:4326','coordinateOrder':'longitude, latitude','snapshot':timestamp(options.pbf),'counts':dict(writer.counts),'heightCoverage':dict(writer.heights),'license':'ODbL-1.0','credit':'© OpenStreetMap contributors','source':SOURCE,'attribution':'https://www.openstreetmap.org/copyright','pbfSha256':hashlib.sha256(options.pbf.read_bytes()).hexdigest(),'geometry':'Clipped OSM polygons with interiors; 1e-6 degree coordinate quantization. Multi-part objects may yield multiple features.','heightPolicy':'Tagged height in metres, tagged building:levels separately. Null when absent; neither is a survey guarantee.'}
    estimates,method=neighborhood_heights(writer.observations)
    assert len(writer.observations)==writer.counts['buildings']
    meta['neighborhoodEstimates']={'count':len(estimates),'unresolved':writer.heights['unknownHeight']-len(estimates),**method}
    header=json.dumps({'meta':meta,'strings':list(writer.texts),'order':writer.order,'neighborhoodHeights':estimates},ensure_ascii=False,separators=(',',':')).encode()
    OUTPUT.mkdir(parents=True,exist_ok=True)
    with (OUTPUT/'beijing.osm.bin').open('wb') as target:
        target.write(struct.pack('<I',len(header)));target.write(header)
        for cat in writer.order:target.write(writer.features[cat])
    (OUTPUT/'osm-source.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(meta,indent=2,ensure_ascii=False))

if __name__=='__main__':main()
