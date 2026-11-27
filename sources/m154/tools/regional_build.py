"""Build the streamed, non-core CMAB layer. Requires GDAL's Python bindings.
Usage: /usr/bin/python3 tools/regional_build.py PATH/TO/beijing.zip
"""
from collections import Counter, defaultdict
import hashlib
import json
from math import atan, ceil, degrees, floor, hypot, isfinite, log, pi, radians, sinh, sqrt, tan
from pathlib import Path
import re
import shutil
from struct import pack
import sys
from tempfile import TemporaryDirectory
from zipfile import ZipFile
from osgeo import ogr

BASE = Path(__file__).resolve().parents[1] / 'dist' / 'urban'
SOURCE = Path(sys.argv[1])
HASH = '35b084756364639871773be84cd00f1b'
TILE = 1600
PACK = 3
EARTH = 6378137.
MX, MZ = 85359.2, 111033.1
CORE = (116.35, 39.86, 116.498, 40.015)
STOPS = [
    ('haidian','中关村',116.3104743,39.9826335,1362276541),
    ('tongzhou','通州北苑',116.6314658,39.9027222,1304785099),
    ('yizhuang','亦庄文化园周边',116.4846211,39.8056285,5444691512)
]

def project(lon,lat):
    return (lon-116.407)*MX,(39.925-lat)*MZ

def from_merc(x,y):
    return degrees(x/EARTH),degrees(atan(sinh(y/EARTH)))

def rect_iou(a,b):
    x=max(0,min(a[2],b[2])-max(a[0],b[0]));z=max(0,min(a[3],b[3])-max(a[1],b[1]))
    intersection=x*z
    return intersection/max(1,(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-intersection)

def rings_of(poly,ix,iz):
    rings=[]
    for n in range(poly.GetGeometryCount()):
        ring=poly.GetGeometryRef(n); coords=[]
        for x,y,*_ in ring.GetPoints()[:-1]:
            px,pz=project(*from_merc(x,y));p=round(2*(px-ix*TILE)),round(2*(pz-iz*TILE))
            if max(map(abs,p))>32766:return []
            if not coords or coords[-1]!=p:coords.append(p)
        if len(coords)>1 and coords[-1]==coords[0]:coords.pop()
        if len(set(coords))<3 or len(coords)>65535:return []
        twice=sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(coords,coords[1:]+coords[:1]))
        if abs(twice)<3:return []
        rings.append(coords)
    return rings

if hashlib.md5(SOURCE.read_bytes()).hexdigest()!=HASH:raise ValueError('Expected the CMAB v7 Beijing release')
tiles=defaultdict(list);seen=defaultdict(list);counts=Counter();sources=[]
checks={s[0]:{'count':0,'heights':[],'sheets':set()}for s in STOPS}
locations={key:project(lon,lat)for key,_,lon,lat,_ in STOPS}
with ZipFile(SOURCE) as arc,TemporaryDirectory() as tmp:
    layers=sorted((n for n in arc.namelist() if n.endswith('.shp')),key=lambda n:(re.search(r'20\d{6}',n).group(),n),reverse=True)
    for i,name in enumerate(layers):
        stem=name[:-4]
        for ext in ('.shp','.shx','.dbf','.prj'):
            with arc.open(stem+ext)as src,open(Path(tmp)/('layer'+ext),'wb')as dst:shutil.copyfileobj(src,dst)
        ds=ogr.Open(str(Path(tmp)/'layer.shp'));layer=ds.GetLayer();extent=layer.GetExtent();date=re.search(r'20\d{6}',name).group()
        source={'file':Path(name).name,'date':date,'original':layer.GetFeatureCount(),'kept':0,'bounds':[*from_merc(extent[0],extent[2]),*from_merc(extent[1],extent[3])]}
        sources.append(source)
        for feature in layer:
            geom=feature.GetGeometryRef();height=feature.GetField('Height')
            if not geom or height is None or not isfinite(height) or height<2 or height>650:counts['height']+=1;continue
            x0,x1,y0,y1=geom.GetEnvelope();w,s=from_merc(x0,y0);e,n=from_merc(x1,y1)
            if not (e<CORE[0] or w>CORE[2] or n<CORE[1] or s>CORE[3]):counts['core']+=1;continue
            if geom.GetArea()*.58<65:counts['small']+=1;continue
            geom=geom.SimplifyPreserveTopology(1.17)
            if not geom:counts['invalid']+=1;continue
            polygons=[geom] if geom.GetGeometryName()=='POLYGON' else [geom.GetGeometryRef(k) for k in range(geom.GetGeometryCount())]
            kept=False
            for poly in polygons:
                if not poly or poly.GetGeometryName()!='POLYGON' or poly.GetGeometryCount()>255:continue
                x0,x1,y0,y1=poly.GetEnvelope();a,b=project(*from_merc(x0,y1));c,d=project(*from_merc(x1,y0));cx,cz=(a+c)/2,(b+d)/2
                bounds=(a,b,c,d);area=poly.GetArea()*.58
                if area<63:continue
                ix,iz=floor(cx/TILE),floor(cz/TILE);bx,bz=floor(cx/36),floor(cz/36)
                if any(si!=i and rect_iou(bounds,bb)>.79 for dx in (-1,0,1) for dz in (-1,0,1)for si,bb in seen.get((bx+dx,bz+dz),())):counts['crossSheet']+=1;continue
                rings=rings_of(poly,ix,iz)
                if not rings:counts['invalid']+=1;continue
                origid=feature.GetField('merged_id');dh=round(height*10)
                payload=bytearray(pack('<BBHI',i,len(rings),dh,int(origid)))
                for ring in rings:
                    payload.extend(pack('<H',len(ring)));payload.extend(pack('<'+'hh'*len(ring),*(v for pt in ring for v in pt)))
                rank=sqrt(area)*(height+5)**.9
                tiles[ix,iz].append((rank,bytes(payload)))
                seen[bx,bz].append((i,bounds));counts['parts']+=1;counts['holes']+=len(rings)-1;kept=True
                for key,(xx,zz) in locations.items():
                    if (cx-xx)**2+(cz-zz)**2<=800**2:
                        info=checks[key];info['count']+=1;info['heights'].append(round(height,1));info['sheets'].add(i)
            if kept:source['kept']+=1
        ds=None;print(source['file'],source['kept'],flush=True)
folder=BASE/'regional-tiles';folder.mkdir(exist_ok=True)
packs=defaultdict(list);tileIndex=[]
for ix,iz in sorted(tiles):packs[ix//PACK,iz//PACK].append((ix,iz))
for (gx,gz),groups in packs.items():
    file=bytearray()
    for ix,iz in groups:
        rows=sorted(tiles[ix,iz],key=lambda r:-r[0]);start=len(file)
        file.extend(pack('<4sI',b'RBF1',len(rows)))
        for _,record in rows:file.extend(record)
        tileIndex.append([ix,iz,len(rows),start,len(file)-start])
    (folder/(f'{gx}_{gz}.bin')).write_bytes(file)
    if len(file)>=4000000:raise ValueError('pack too large')
stops=[]
for key,name,lon,lat,node in STOPS:
    c=checks[key];v=sorted(c['heights'])
    if c['count']<20:continue
    stops.append({'id':key,'name':name,'lon':lon,'lat':lat,'url':f'https://www.openstreetmap.org/node/{node}','radius':800,'count':c['count'],'medianHeight':v[len(v)//2],'sheets':sorted(c['sheets'])})
index={'version':1,'tile':TILE,'pack':PACK,'scale':.5,'tiles':tileIndex,'stops':stops}
(BASE/'regional-index.json').write_text(json.dumps(index,separators=(',',':'),ensure_ascii=False))
meta={'dataset':'CMAB 北京分卷 · Figshare v7','doi':'https://doi.org/10.6084/m9.figshare.27992417.v7','authors':['Yecheng Zhang','Huimin Zhao','Ying Long'],'license':'CC BY 4.0','licenseUrl':'https://creativecommons.org/licenses/by/4.0/','archiveMD5':HASH,'original':sum(s['original']for s in sources),'retainedBuildings':sum(s['kept']for s in sources),'counts':counts,'tiles':len(tiles),'packs':len(packs),'sheets':sources,'stops':stops,'boundsWgs84':[min(s['bounds'][0]for s in sources),min(s['bounds'][1]for s in sources),max(s['bounds'][2]for s in sources),max(s['bounds'][3]for s in sources)],'methods':'15 个异期研究分片，日期取自来源文件名。高度来自原 ML 预测字段 Height，保留 0.1 米；无逐栋实测含义。EPSG:3857 屋顶平面转 WGS84，再转项目局部东南坐标；拓扑保持简化约 0.9 地面米，量化至 0.5 米。保留内环与多部分；外包框接触核心 OSM 区的整栋排除。剔除面积约 65 平方米以下及高度不在 2–650 米内的记录。异期屋顶框重叠 IoU 大于 0.79 时偏向较新的分片。倾斜影像屋顶位置与地面轮廓可能有偏移，近似去重仍可能保留部分重叠或舍弃相邻物体。屋顶纹理、立面、底面及远景抽稀属于示意。分片边界内并非处处有建筑，数据不覆盖整个北京市。'}
(BASE/'regional-source.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(counts,'packs',len(packs),'bytes',sum(p.stat().st_size for p in folder.glob('*.bin')),'stops',stops,flush=True)
