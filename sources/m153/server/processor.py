import json
import math
import subprocess
import time
from fractions import Fraction
from pathlib import Path

import av
import cv2
import mediapipe as mp
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CLOCK = Fraction(1, 90000)
BODY = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]


def probe(path):
    data = subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)], timeout=45)
    return json.loads(data)


class Renderer:
    def __init__(self, w, h, bg, motion_path=None):
        self.w, self.h = w, h
        self.proc = subprocess.Popen(['node', str(ROOT / 'server/render.mjs'), str(w), str(h), bg] + ([str(motion_path)] if motion_path else []), stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    def draw(self, points):
        self.proc.stdin.write((json.dumps(points) + '\n').encode())
        self.proc.stdin.flush()
        raw = self.proc.stdout.read(self.w*self.h*4)
        if len(raw) != self.w*self.h*4:
            raise ValueError('三维白模渲染进程意外终止。')
        return np.frombuffer(raw, dtype=np.uint8).reshape(self.h, self.w, 4)

    def close(self):
        self.proc.stdin.close()
        self.proc.stdout.close()
        self.proc.wait(timeout=10)


def safe_json(path, value):
    temp = path.with_suffix('.writing')
    temp.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), 'utf-8')
    temp.replace(path)


def pose_box(points):
    visible = [p for p in points if p[3] > .45] or points
    return [max(0,min(p[0] for p in visible)-.02),max(0,min(p[1] for p in visible)-.02),
            min(1,max(p[0] for p in visible)+.02),min(1,max(p[1] for p in visible)+.02)]


def bridge_pose(a, b, aspect):
    def torso(p):
        points = np.asarray(p)[:, :2] * [aspect, 1]
        hips = (points[23] + points[24]) / 2
        shoulders = (points[11] + points[12]) / 2
        return hips, max(.025, np.linalg.norm(shoulders - hips))
    ca, sa = torso(a)
    cb, sb = torso(b)
    return np.linalg.norm(ca - cb) < 1.25*max(sa, sb) and max(sa, sb) < 2*min(sa, sb)


def describe(points, image):
    h,w=image.shape[:2]
    core=np.array([points[i][:2] for i in (11,12,23,24)])
    center=core.mean(axis=0)
    size=max(.035, np.linalg.norm((core[0]-core[2])*[w/h,1]))
    x,y=np.clip((center*[w,h]).astype(int),[2,2],[w-3,h-3])
    color=image[y-2:y+3,x-2:x+3].mean(axis=(0,1))/255
    return center,size,color


def extract(path, folder, state, update, choose, check):
    src=probe(path)
    v=next((s for s in src['streams'] if s['codec_type']=='video'),None)
    if not v: raise ValueError('文件中没有视频轨道。')
    rot=next((round(x['rotation']/90)%4 for x in v.get('side_data_list',[]) if 'rotation' in x),0)
    w,h=int(v['width']),int(v['height'])
    if rot%2: w,h=h,w
    duration=float(v.get('duration') or src['format']['duration'])
    if not 0<duration<=600: raise ValueError('请选择时长在 10 分钟以内的视频。')
    fps=float(Fraction(v.get('avg_frame_rate') or '30') or 30)
    base=float(v.get('start_time') or 0)
    opts=mp.tasks.vision.PoseLandmarkerOptions(base_options=mp.tasks.BaseOptions(model_asset_path=str(ROOT/'dist/assets/pose.task')),
        running_mode=mp.tasks.vision.RunningMode.VIDEO, num_poses=4, min_pose_detection_confidence=.46, min_tracking_confidence=.5)
    frames=[]; last=None; seen=0; last_update=0; prev=None; time_ms=-1
    preview=Renderer(max(2,round(w*min(1,400/max(w,h)))),max(2,round(h*min(1,400/max(w,h)))),'studio')
    try:
        with av.open(str(path)) as cap, mp.tasks.vision.PoseLandmarker.create_from_options(opts) as detector:
            for vf in cap.decode(video=0):
                check()
                if vf.pts is None: continue
                t=max(0,float(vf.pts*vf.time_base)-base)
                if frames and t<=frames[-1]['t']+1e-7: continue
                rgb=vf.to_ndarray(format='rgb24')
                if rot: rgb=np.rot90(rgb,k=rot)
                factor=min(1,640/max(w,h))
                rgb=cv2.resize(rgb,(max(4,round(w*factor)),max(4,round(h*factor))),interpolation=cv2.INTER_AREA)
                time_ms=max(time_ms+1,round(t*1000))
                res=detector.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.ascontiguousarray(rgb)),time_ms)
                candidates=[[[round(p.x,5),round(p.y,5),round(p.z,5),round(p.visibility,3),round(world[i].z,5)] for i,p in enumerate(person)] for person,world in zip(res.pose_landmarks,res.pose_world_landmarks)]
                target=None
                if candidates:
                    desc=[describe(p,rgb) for p in candidates]
                    if last is None:
                        idx=0
                        if len(candidates)>1:
                            cv2.imwrite(str(folder/'choice.jpg'),cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR))
                            idx=choose([pose_box(p) for p in candidates],t)
                        target=idx
                    else:
                        cs=[]
                        for i,(center,size,color) in enumerate(desc):
                            dist=np.linalg.norm((center-last[0])*[w/h,1])/max(size,last[1])
                            cd=np.linalg.norm(color-last[2]);score=dist+.48*abs(math.log(size/last[1]))+.61*cd
                            if dist<=min(2,.83+(t-seen)*.75) and (t-seen<=.5 or cd<=.9):cs.append((score,i))
                        if cs:target=min(cs)[1]
                    if target is not None:last=desc[target];seen=t
                p=candidates[target] if target is not None else None
                q='missing' if p is None else 'low' if sum(p[i][3]<.48 for i in BODY)>=3 else ''
                if prev:prev['d']=t-prev['t']
                prev={'t':round(t,6),'d':max(1/fps,.001),'p':p,'q':q};frames.append(prev)
                if time.monotonic()-last_update>1 or len(frames)==1:
                    rgba=preview.draw(p); tmp=folder/'p.tmp.jpg';cv2.imwrite(str(tmp),cv2.cvtColor(rgba,cv2.COLOR_RGBA2BGR));tmp.replace(folder/'preview.jpg')
                    update(state='running',stage='extract',title='正在提取动作',progress=min(.69,.04+.65*t/duration),time=t,preview=len(frames))
                    last_update=time.monotonic()
    finally:preview.close()
    if not any(f['p'] for f in frames):raise ValueError('整段视频未识别到人体，请换用人物清晰的素材。')
    if abs(frames[-1]['t']+frames[-1]['d']-duration)>max(.25,2/fps):raise ValueError('视频解码提前结束，请检查原片。')
    frames[-1]['d']=max(.0001,duration-frames[-1]['t'])
    i=0
    while i<len(frames):
        if frames[i]['p'] is not None:i+=1;continue
        j=i
        while j<len(frames) and frames[j]['p'] is None:j+=1
        if i>0 and j<len(frames) and frames[j]['t']-frames[i-1]['t']<=.28 and bridge_pose(frames[i-1]['p'], frames[j]['p'], w/h):
            a,b=frames[i-1],frames[j]
            for k in range(i,j):
                ratio=(frames[k]['t']-a['t'])/(b['t']-a['t']);frames[k]['p']=(np.array(a['p'])*(1-ratio)+np.array(b['p'])*ratio).round(5).tolist();frames[k]['q']='fill'
        i=j
    data=dict(frames=frames,w=w,h=h,duration=duration,base=base,fps=fps,audio=any(s['codec_type']=='audio' for s in src['streams']))
    safe_json(folder/'motion.json',data);return data


def render(data, folder, config, update, check):
    frames=data['frames'];size=config['size']
    scale=min(1,size/min(data['w'],data['h']),size*16/9/max(data['w'],data['h']))
    w,h=[max(2,round(dim*scale/2)*2) for dim in (data['w'],data['h'])]
    painter=Renderer(w,h,config['bg'],folder/'motion.json')
    durations={};since=0
    try:
        with av.open(str(folder/'picture.mp4'),'w') as out:
            stream=out.add_stream('libx264',rate=Fraction(data['fps']).limit_denominator(10000))
            stream.width=w;stream.height=h;stream.pix_fmt='yuv420p';stream.time_base=CLOCK;stream.codec_context.time_base=CLOCK
            stream.options={'preset':'veryfast','crf':'21','bf':'0'}
            def mux(packet):
                if packet.pts in durations:packet.duration=durations[packet.pts]
                out.mux(packet)
            for i,item in enumerate(frames):
                check();rgb=painter.draw(i);v=av.VideoFrame.from_ndarray(rgb,format='rgba');v.time_base=CLOCK
                v.pts=round(item['t']/CLOCK);durations[v.pts]=max(1,round(item['d']/CLOCK))
                for pkt in stream.encode(v):mux(pkt)
                if time.monotonic()-since>.6:update(title='正在导出 MP4',progress=.7+.24*(i+1)/len(frames));since=time.monotonic()
            for pkt in stream.encode():mux(pkt)
    finally:painter.close()
    check();update(stage='verify',title='正在校验成片',progress=.96)
    cmd=['ffmpeg','-v','error','-nostdin','-y','-copyts','-i',str(folder/'picture.mp4')]
    has_audio=config['audio'] and data['audio']
    if has_audio:cmd+=['-itsoffset',str(-data['base']),'-i',str(folder/'source'),'-map','0:v:0','-map','1:a:0','-af','atrim=start=0','-c:a','aac','-b:a','160k']
    cmd+=['-c:v','copy','-t',str(data['duration']),'-movflags','+faststart',str(folder/'finished.mp4')]
    subprocess.run(cmd,check=True,timeout=300);check();out=probe(folder/'finished.mp4');v=next(s for s in out['streams'] if s['codec_type']=='video')
    if v.get('codec_name')!='h264' or abs(float(v['duration'])-data['duration'])>max(.05,1/data['fps']) or int(v['nb_frames'])!=len(frames) or bool(has_audio)!=any(s['codec_type']=='audio' for s in out['streams']):raise ValueError('导出文件未通过音视频完整性校验。')
    subprocess.run(['ffmpeg','-v','error','-xerror','-nostdin','-i',str(folder/'finished.mp4'),'-f','null','-'],timeout=300,check=True)
    (folder/'finished.mp4').replace(folder/'output.mp4');(folder/'picture.mp4').unlink(missing_ok=True)
    groups=[]
    for f in frames:
        if not f['q']:continue
        if groups and groups[-1]['reason']==f['q'] and f['t']-groups[-1]['end']<.04:groups[-1]['end']=f['t']+f['d']
        else:groups.append({'reason':f['q'],'start':f['t'],'end':f['t']+f['d']})
    return dict(renderVersion='atelier-2',duration=data['duration'],fps=data['fps'],times=[f['t'] for f in frames],issues=groups,bytes=(folder/'output.mp4').stat().st_size)
