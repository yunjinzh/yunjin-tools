"""Build original alpha-masked tree impostors for the CPU renderer."""
import math
import random
import struct
from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]/'dist'/'imagery'
W,H,N=152,196,8
S=2

def tree(kind):
    rng=random.Random(493100+kind*171)
    wide=kind not in (2,5,7)
    image=Image.new('RGBA',(W*S,H*S),(0,0,0,0))
    draw=ImageDraw.Draw(image)
    def pixel(x,y):
        return ((.5+.46*x)*W*S,(.985-.951*y)*H*S)
    def stroke(points,width,color):
        draw.line([pixel(*p) for p in points],fill=color,width=max(1,round(width*W*S)),joint='curve')
    lean=rng.uniform(-.1,.1)
    def spine(y):return lean*y+.024*math.sin(y*9)
    for i in range(16):
        y=i/20
        stroke([(spine(y),y),(spine(y+.055),y+.055)],.068*(1-.98*y),(86,76,52,255))
        stroke([(spine(y)-.02*(1-y),y),(spine(y+.056)-.02*(1-y),y+.056)],.012*(1-.7*y),(120,111,80,255))
    clusters=[]
    layers=3 if wide else 5
    for layer in range(layers):
        yy=(.49+.162*layer) if wide else (.32+.13*layer)
        breadth=(.52,.64,.30)[layer] if wide else (.42,.38,.31,.24,.135)[layer]
        count=(8,8,5)[layer] if wide else (7,7,6,5,4)[layer]
        for j in range(count):
            angle=(j/count+.12*layer+rng.uniform(-.028,.028))*math.tau
            cx=math.cos(angle)*breadth*rng.uniform(.82,1.15)+spine(yy)
            cy=yy+rng.uniform(-.045,.04)
            cz=math.sin(angle)*breadth*.80+rng.uniform(-.06,.06)
            rx=(.30 if wide else .23)*rng.uniform(.73,1.19)*(1-.04*layer)
            ry=(.126 if wide else .114)*rng.uniform(.85,1.25)
            rz=rx*rng.uniform(.62,.87)
            y0=max(.15,cy-rng.uniform(.19,.32))
            bend=(spine(y0)+cx*.46,y0+(cy-y0)*.31)
            stroke([(spine(y0),y0),bend,(cx,cy+.03)],.018 if layer<2 else .012,(90,79,50,255))
            stroke([bend,(cx*.93+.07,cy-.008),(cx+.055,cy+.052)],.009,(107,94,67,255))
            clusters.append((cx,cy,cz,rx,ry,rz))
    clusters.append((spine(.89),.885,0,.24 if wide else .14,.10,.18))
    shapes=[]
    for ci,(cx,cy,cz,rx,ry,rz) in enumerate(clusters):
        for j in range(270 if wide else 215):
            # Ellipsoidal foliage shells split into irregular small bunches.
            a=rng.random()*math.tau
            vz=rng.uniform(-1,1); rr=math.sqrt(max(0,1-vz*vz))
            vx=rr*math.cos(a);vy=rr*math.sin(a)
            shell=rng.uniform(.52,1.08)
            x=cx+rx*vx*shell;y=cy+ry*vy*shell;z=cz+rz*vz*shell
            if rng.random()<.04:continue
            local=.5+.5*(-.58*vx+.65*vy+.48*vz)
            globalLight=.48+.36*y-.065*x+.07*z
            fleck= .42*local+.58*globalLight+rng.uniform(-.18,.12)
            f=max(0,min(1,(fleck-.21)*1.49))
            greenBias=(.02*math.sin(ci*1.74)+.015*math.sin(j*2.3))
            warm=kind in (0,1,4)
            low=(30,50,37) if not warm else (40,55,29)
            high=(123,150,88) if not warm else (152,158,79)
            color=tuple(int(max(0,min(255,low[k]+f*(high[k]-low[k])+(greenBias*170 if k==1 else 0)))) for k in range(3))
            size=rng.uniform(.0035,.0145)*(1.12 if not wide else 1)
            shapes.append((z,x,y,size,rng.uniform(.52,.94),color))
    shapes.sort(key=lambda a:a[0])
    for z,x,y,size,ratio,color in shapes:
        px,py=pixel(x,y);r=max(1,size*W*S)
        draw.ellipse((px-r,py-r*ratio,px+r,py+r*ratio),fill=(*color,255))
    return image.resize((W,H),Image.Resampling.LANCZOS)

atlas=Image.new('RGBA',(W*N,H))
for n in range(N):atlas.paste(tree(n),(n*W,0))
# Quantize using a shared palette. Zero-alpha pixels carry zero contribution.
p=atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
rgba=p.convert('RGBA')
inds=p.tobytes()
palette=bytearray(1024)
for idx,color in zip(inds,rgba.getdata()):palette[idx*4:idx*4+4]=bytes(color)
with (ROOT/'canopies.bin').open('wb') as f:
    f.write(b'BJT1'+struct.pack('<HHH',W,H,N)+palette+inds)
