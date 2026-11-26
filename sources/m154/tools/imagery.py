"""Prepare the CC BY 4.0 Sentinel-2 cloudless 2016 basemap from the EOX WMTS."""
import concurrent.futures
import io
import json
import math
import pathlib
import time
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'dist' / 'imagery'
ROOT.mkdir(parents=True, exist_ok=True)
CACHE = pathlib.Path('/tmp/beijing-eox-cache')
CACHE.mkdir(exist_ok=True)
BASE = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g'
LAYERS = [('region', 10, [115.84, 39.56, 116.95, 40.40]), ('urban', 13, [116.33, 39.844, 116.57, 40.055])]

def tile_xy(lon, lat, zoom):
    n = 2 ** zoom
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n

def lonlat(x, y, zoom):
    return 360*x/2**zoom - 180, math.degrees(math.atan(math.sinh(math.pi*(1-2*y/2**zoom))))

def tile(coords):
    x, y, z = coords
    path = CACHE / f'{z}-{x}-{y}.jpg'
    if not path.is_file():
        for attempt in range(4):
            try:
                req = urllib.request.Request(f'{BASE}/{z}/{y}/{x}.jpg', headers={'User-Agent': 'Beijing urban atlas, open geo visualization'})
                with urllib.request.urlopen(req, timeout=25) as resp:
                    data = resp.read()
                with Image.open(io.BytesIO(data)) as im:
                    assert im.size == (256, 256)
                path.write_bytes(data)
                break
            except Exception:
                if attempt == 3: raise
                time.sleep(1+attempt)
    with Image.open(path) as image:
        return x, y, image.convert('RGB')

def layer(name, zoom, bbox):
    west, south, east, north = bbox
    x0, y0 = tile_xy(west, north, zoom)
    x1, y1 = tile_xy(east, south, zoom)
    left, top = math.floor(x0), math.floor(y0)
    right, bottom = math.ceil(x1), math.ceil(y1)
    mosaic = Image.new('RGB', ((right-left)*256, (bottom-top)*256))
    indices = [(x, y, zoom) for y in range(top, bottom) for x in range(left, right)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as workers:
        for x, y, image in workers.map(tile, indices):
            mosaic.paste(image, ((x-left)*256, (y-top)*256))
    w,n=lonlat(left,top,zoom)
    e,s=lonlat(right,bottom,zoom)
    filename=name+'.webp'
    mosaic.save(ROOT / filename, quality=88,method=6)
    print(name, len(indices), mosaic.size, (ROOT / filename).stat().st_size, flush=True)
    return {'file':filename,'bounds':[w,s,e,n],'zoom':zoom,'size':list(mosaic.size)}

if __name__ == '__main__':
    layers = [layer(*args) for args in LAYERS]
    manifest={'layers':layers,'attribution':'Sentinel-2 cloudless – https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)','license':'https://creativecommons.org/licenses/by/4.0/','source':BASE,'modifications':'Mosaicked into regional and city textures and encoded as WebP.'}
    (ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False))
    # Compact Sentinel vegetation-colour index for the software renderer.
    city = Image.open(ROOT / 'urban.webp').convert('RGB').resize((512, 597), Image.Resampling.BILINEAR)
    (ROOT / 'canopy.bin').write_bytes(bytes(
        max(0, min(255, round(4 * max(0, (g-r*.93)-(b-g)*.33))))
        for r,g,b in city.getdata()))
