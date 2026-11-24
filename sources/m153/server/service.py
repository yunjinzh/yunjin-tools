import json
import os
import re
import secrets
import shutil
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlsplit

from processor import ROOT, extract, render, safe_json

DATA=Path(os.getenv('MOTION_JOBS',ROOT/'jobs')).resolve()
DATA.mkdir(parents=True,exist_ok=True)
GUARD=threading.RLock()
POOL=ThreadPoolExecutor(max_workers=1)
LIMIT=250*1024*1024
STATES={}
TASKS={}


def configure(v):
    size=int(v.get('size',720))
    if size not in (480,720,1080) or v.get('bg','sage') not in ('sage','sand','slate'):raise ValueError('无效的输出设置。')
    return dict(size=size,bg=v.get('bg','sage'),audio=v.get('audio',True) in (True,'1'))


def save(key, **changes):
    with GUARD:
        state=STATES[key];state.update(changes);state['updated']=time.time()
        safe_json(DATA/key/'state.json',state)


class WaitingForPerson(Exception):
    pass


def worker(key,stop):
    folder=DATA/key
    def check():
        if stop.is_set():raise InterruptedError()
    def update(**v):
        check();save(key,**v)
    def choose(boxes,t):
        with GUARD:
            prior=STATES[key].get('chosen_index')
            if prior is not None and 0<=prior<len(boxes):return prior
        update(state='choose',boxes=boxes,time=t,choiceNo=time.time_ns(),choice=None)
        raise WaitingForPerson()
    try:
        check();update(state='running',title='正在读取视频',message='页面关闭后后台处理继续。',progress=.01)
        if (folder/'motion.json').exists():motion=json.loads((folder/'motion.json').read_text('utf-8'))
        else:motion=extract(folder/'source',folder,STATES[key],update,choose,check)
        check();update(title='正在导出 MP4',progress=.70)
        result=render(motion,folder,STATES[key]['settings'],update,check);check();update(state='ready',title='白模视频已就绪',progress=1,**result)
    except WaitingForPerson:pass
    except InterruptedError:save(key,state='paused',message='任务已暂停。继续处理时会复用已完成的动作提取。')
    except Exception as exc:save(key,state='failed',message=str(exc)[:350] or '服务端处理失败。')
    finally:
        with GUARD:
            TASKS.pop(key,None)
            if STATES[key].get('delete_pending'):
                STATES.pop(key,None);shutil.rmtree(folder,ignore_errors=True)


def enqueue(key):
    with GUARD:
        if key in TASKS:return
        stop=threading.Event();TASKS[key]=stop
        save(key,state='queued',title='任务已排队',progress=0,message='处理完成后可在此下载。')
        POOL.submit(worker,key,stop)


def cleanup():
    while True:
        time.sleep(900)
        with GUARD:
            obsolete=[key for key,s in STATES.items() if key not in TASKS and time.time()-s['updated']>86400]
            for key in obsolete:STATES.pop(key);shutil.rmtree(DATA/key,ignore_errors=True)


class API(SimpleHTTPRequestHandler):
    def log_message(self,fmt,*args):pass
    def response(self,status,obj):
        raw=json.dumps(obj,ensure_ascii=False).encode('utf8');self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw)
    def route(self):
        url=urlsplit(self.path);match=re.fullmatch(r'/api/jobs/([0-9a-f]{48})/(status|output|choice|choice.jpg|preview.jpg|pause|retry|delete)',url.path)
        if not match:return None,None
        return match.groups()
    def do_GET(self):
        url=urlsplit(self.path)
        if url.path=='/server-mode.json':return self.response(200,dict(background=True))
        if not url.path.startswith('/api/'):return super().do_GET()
        key,action=self.route()
        with GUARD:
            if key not in STATES:return self.response(404,'任务不存在或已到期。')
            s=STATES[key].copy()
        if action=='status':return self.response(200,s)
        if action=='output' and s['state']=='ready':filename='output.mp4'
        elif action in ('choice.jpg','preview.jpg'):filename=action
        else:return self.response(409,'任务尚未完成。')
        path=DATA/key/filename
        try:file=path.open('rb')
        except FileNotFoundError:return self.response(404,'文件尚未生成。')
        with file:
            n=os.fstat(file.fileno()).st_size;start=0;end=n-1;partial=False
            header=self.headers.get('Range','')
            if header:
                match=re.fullmatch(r'bytes=(\d*)-(\d*)',header)
                if not match or not any(match.groups()):return self.response(416,'无效的下载区间。')
                a,b=match.groups()
                if a:start=int(a);end=min(end,int(b)) if b else end
                else:start=max(0,n-int(b))
                if start>end or start>=n:return self.response(416,'下载区间超出文件大小。')
                partial=True
            self.send_response(206 if partial else 200);self.send_header('Accept-Ranges','bytes')
            if partial:self.send_header('Content-Range',f'bytes {start}-{end}/{n}')
            self.send_header('Content-Length',str(end-start+1));self.send_header('Content-Type','video/mp4' if filename=='output.mp4' else 'image/jpeg');self.send_header('Cache-Control','no-store')
            if 'download' in parse_qs(url.query):self.send_header('Content-Disposition',"attachment; filename*=UTF-8''"+quote(Path(s['name']).stem+'-白模.mp4'))
            self.end_headers();file.seek(start);left=end-start+1
            try:
                while left:
                    chunk=file.read(min(65536,left))
                    if not chunk:break
                    self.wfile.write(chunk);left-=len(chunk)
            except (BrokenPipeError,ConnectionResetError):pass
    def do_POST(self):
        try:self.post()
        except (ValueError,KeyError,json.JSONDecodeError) as error:self.response(400,str(error))
        except (BrokenPipeError,ConnectionResetError):pass
    def post(self):
        url=urlsplit(self.path);q={k:v[-1] for k,v in parse_qs(url.query).items()};length=int(self.headers.get('Content-Length',0))
        origin=self.headers.get('Origin')
        if origin and urlsplit(origin).netloc!=self.headers.get('Host'):return self.response(403,'请求来源与站点不匹配。')
        if url.path=='/api/jobs':
            if not 0<length<=LIMIT:return self.response(413,'文件大小必须在 250 MB 以内。')
            cfg=configure(q);key=secrets.token_hex(24);folder=DATA/key;folder.mkdir()
            try:
                with (folder/'source').open('wb') as file:
                    left=length
                    while left:
                        block=self.rfile.read(min(left,1024*1024))
                        if not block:raise ValueError('上传中断。')
                        file.write(block);left-=len(block)
            except Exception:shutil.rmtree(folder,ignore_errors=True);raise
            with GUARD:STATES[key]=dict(name=Path(q.get('name','动作')).name[:150],settings=cfg);enqueue(key)
            return self.response(201,dict(id=key))
        key,action=self.route()
        with GUARD:
            if key not in STATES:return self.response(404,'任务不存在或已过期。')
            if length>8192:return self.response(413,'请求过大。')
            raw=self.rfile.read(length);s=STATES[key]
            if action=='choice':
                i=int(raw.decode())
                if s['state']!='choose' or not 0<=i<len(s['boxes']):raise ValueError('人物选择已失效。')
                save(key,chosen_index=i);enqueue(key)
            elif action=='retry':
                if key in TASKS:return self.response(409,'请等待当前任务结束。')
                save(key,settings=configure(json.loads(raw or b'{}')));enqueue(key)
            elif action=='pause':
                if key in TASKS:TASKS[key].set()
                else:save(key,state='paused',message='任务已暂停。')
            elif action=='delete':
                if key in TASKS:save(key,delete_pending=True);TASKS[key].set()
                else:STATES.pop(key);shutil.rmtree(DATA/key,ignore_errors=True)
            else:return self.response(404,'操作不存在。')
        self.response(200,dict(ok=True))


if __name__=='__main__':
    for path in DATA.glob('*/state.json'):
        try:
            s=json.loads(path.read_text('utf-8'));key=path.parent.name
            if s.get('delete_pending') or time.time()-s['updated']>86400:shutil.rmtree(path.parent);continue
            STATES[key]=s
            if s.get('state') in ('queued','running','choose'):enqueue(key)
        except (OSError,ValueError,KeyError):continue
    threading.Thread(target=cleanup,daemon=True).start()
    ThreadingHTTPServer((os.getenv('MOTION_HOST','127.0.0.1'),int(os.getenv('PORT','8765'))),partial(API,directory=str(ROOT/'dist'))).serve_forever()
