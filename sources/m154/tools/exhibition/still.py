"""Denoise a 4K Cycles plate with overlapping tiles so memory stays bounded."""
import argparse
from pathlib import Path
import tempfile
import sys
sys.dont_write_bytecode=True
from PIL import Image
from encode import denoised
parser=argparse.ArgumentParser()
parser.add_argument('folder',type=Path)
parser.add_argument('destination',type=Path)
parser.add_argument('--oidn',type=Path,required=True)
args=parser.parse_args()
source=Image.open(args.folder/'master.png').convert('RGB')
if source.size!=(3840,2160):
    raise ValueError('Expected a native 4K frame')
result=Image.new('RGB',source.size)
# Input halos exceed the network's working neighbourhood; only central crops are composited.
size,pad=768,96
with tempfile.TemporaryDirectory(dir=args.folder) as tmp:
    work=Path(tmp)
    for y in range(0,source.height,size):
        for x in range(0,source.width,size):
            r=min(x+size,source.width);b=min(y+size,source.height)
            box=(max(0,x-pad),max(0,y-pad),min(source.width,r+pad),min(source.height,b+pad))
            file=work/f'tile-{x}-{y}.png'
            source.crop(box).save(file)
            data=denoised(file,work,args.oidn,2)
            filtered=Image.fromarray(data)
            result.paste(filtered.crop((x-box[0],y-box[1],r-box[0],b-box[1])),(x,y))
            del data,filtered
result.save(args.destination,quality=94,method=4)
