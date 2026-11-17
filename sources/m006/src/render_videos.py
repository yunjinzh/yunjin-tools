from pathlib import Path
import json, math, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'src/multimedia_detail.json').read_text())
FONT=ROOT/'assets/Chinese.ttf'
W,H,FPS=960,540,15
BG='#EDECE6'; INK='#253C42'; CORAL='#D97864'; BLUE='#437B89'; GREY='#A9B8B8'
def font(size): return ImageFont.truetype(str(FONT),size)
def txt(d,xy,s,size=22,fill=INK): d.text(xy,s,font=font(size),fill=fill)
def box(d,x,y,w,h,c,outline=None):d.rounded_rectangle([x,y,x+w,y+h],radius=8,fill=c,outline=outline,width=2)
def iso(d,x,y,w,h,z,c):
    a=(x,y-z);b=(x+w,y+w*.40-z);cc=(x+w-h,y+(w+h)*.40-z);dd=(x-h,y+h*.40-z)
    d.polygon([a,b,cc,dd],fill=c)
    d.polygon([b,cc,(cc[0],cc[1]+z),(b[0],b[1]+z)],fill='#9EAEAE')
    d.polygon([dd,cc,(cc[0],cc[1]+z),(dd[0],dd[1]+z)],fill='#C5CECA')
    d.line([a,b,cc,dd,a],fill='#7F9598',width=1)
def frame(lesson,t):
    im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
    shot=min(4,int(t//8));u=(t%8)/8
    txt(d,(42,24),'TEXTBOOK LAB  /  '+('DIGITAL TWIN' if lesson['course']=='dt' else 'CITY INFORMATION MODEL'),15,BLUE)
    txt(d,(42,57),lesson['title'],29)
    txt(d,(758,28),'教学合成示例',16,CORAL)
    if lesson['course']=='dt':
        # An engineering schematic, not a device render or physical simulation.
        box(d,42,118,500,302,'#E2E6E1')
        d.line([(105,302),(105,203),(270,203),(270,302),(458,302)],fill=BLUE,width=16)
        d.ellipse([65,270,145,350],fill='#7E9FA3',outline=INK,width=3)
        d.ellipse([230,270,310,350],fill='#7E9FA3',outline=INK,width=3)
        for cx in [105,270]:
            a=t*3
            d.line([(cx-22*math.cos(a),310-22*math.sin(a)),(cx+22*math.cos(a),310+22*math.sin(a))],fill='#F0EEE7',width=7)
        txt(d,(80,365),'P-01',18);txt(d,(245,365),'P-02',18)
        for k in range(9):
            px=110+((t*40+k*39)%340)
            d.ellipse([px-4,198,px+4,206],fill='#EAD0A8')
        txt(d,(66,139),'对象 / 数据 / 规则 / 验证',21)
        if shot==0:
            box(d,580,135,330,105,'#F2D9CF');txt(d,(602,153),'高压告警',20,CORAL);txt(d,(600,187),'320 MPa ?',38,CORAL)
            txt(d,(580,276),'先查看原始记录与单位',23);txt(d,(580,319),'同一对象 · 同一时刻',19)
        elif shot==1:
            box(d,575,130,340,115,'#DFE8E5');txt(d,(595,148),'原始记录',18);txt(d,(595,180),'320 kPa',34,BLUE)
            box(d,575,267,340,115,'#F2D9CF');txt(d,(595,285),'映射配置',18);txt(d,(595,320),'按 MPa 解释',28,CORAL)
        elif shot==2:
            txt(d,(570,155),'核对换算系数',23);txt(d,(570,209),'320 × 0.001',33,BLUE);txt(d,(570,271),'= 0.32 MPa',36,BLUE)
            txt(d,(570,351),'保留原始值与处理规则',19)
        elif shot==3:
            txt(d,(565,139),'保持输入与阈值不变',22)
            for j,v in enumerate(['修复前  320 MPa','修复后  0.32 MPa','教学阈值  0.50 MPa']):txt(d,(567,193+j*56),v,26,CORAL if j==0 else BLUE)
            d.line([(72,400),(72+420*u,400)],fill=CORAL,width=5)
        else:
            for j,v in enumerate(['01  异常证据','02  原因与配置','03  同片段复测','04  新设备迁移']):
                box(d,577,126+j*69,330,52,'#DDE6E1');txt(d,(595,137+j*69),v,23)
    else:
        box(d,42,118,500,302,'#DDE5DF')
        for p in [[(55,245),(500,245)],[(280,130),(280,407)],[(75,345),(500,345)]]:d.line(p,fill='#B1BEB7',width=21)
        buildings=[(150,180,50,35,40),(240,210,45,30,55),(410,190,55,35,72),(160,305,55,34,50),(380,320,58,40,61)]
        radius=65+40*u if shot==1 else 100
        if shot>=1:
            d.ellipse([280-radius,245-radius*.6,280+radius,245+radius*.6],fill='#B7D3D5',outline=BLUE,width=3)
        for b in buildings:iso(d,*b,'#E3C0A7' if shot>=1 else '#F1EFE3')
        d.ellipse([270,235,290,255],fill=CORAL);txt(d,(293,233),'E-01',16,CORAL)
        if shot>=2:
            d.line([(80,345),(280,345),(280,245)],fill='#E07563',width=6)
            d.line([(80,245),(200,245)],fill='#835853',width=7)
            for xx in range(90,200,25):d.line([(xx,233),(xx+10,257)],fill='#E8B3A4',width=3)
        labels=[['事件 E-01','核对位置、时间、版本','教学街区 · 局部坐标'],['关联周边对象','查询半径随参数变化','保存对象编码与结果'],['纳入道路封闭条件','沿可通行网络重新计算','保留路径与约束'],['生成可复核工单','事件 + 对象 + 参数','附加选择依据与证据'],['切换条件，完成迁移','解释结果为什么变化','分析范围：邻近与可达性']][shot]
        for j,v in enumerate(labels):txt(d,(577,155+j*64),v,25 if j==0 else 21,INK if j==0 else BLUE)
        if shot==4:
            for j in range(4):box(d,581+j*73,365,49,7,CORAL)
    d.rectangle([0,453,W,H],fill=INK)
    txt(d,(42,466),lesson['shots'][shot]['caption'],25,'#F1F0EC')
    txt(d,(43,508),f'{shot+1:02d} / 05    原创字幕动画 · 无内嵌配音',13,'#ACC0C2')
    txt(d,(827,506),f'{int(t):02d} / 40 s',15,'#ACC0C2')
    d.rectangle([0,449,int(W*t/40),453],fill=CORAL)
    return im
for lesson in DATA['microLessons']:
    out=ROOT/'assets'/f"{lesson['course']}-micro.mp4"
    cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for i in range(FPS*40):proc.stdin.write(frame(lesson,i/FPS).tobytes())
    proc.stdin.close();rc=proc.wait();assert rc==0
    frame(lesson,1).save(ROOT/'assets'/f"{lesson['course']}-poster.jpg",quality=88)
    print(out.name,out.stat().st_size,flush=True)
