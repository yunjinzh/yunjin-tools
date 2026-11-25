import json
import os
import re
import secrets
import shutil
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass
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
@dataclass
class WorkerSlot:
    stop: threading.Event
    future: Future

TASKS={}

# Wire states used by existing clients remain valid. Detailed stages are additive.
TRANSITIONS = {
    None: {'queued'}, 'queued': {'running','paused'}, 'running': {'choose','paused','ready','failed'},
    'choose': {'queued','paused'}, 'ready': {'queued'}, 'paused': {'queued'}, 'failed': {'queued'}
}
def public_state(state, key):
    result=state.copy()
    if 'choiceNo' in result:result['choiceNo']=str(result['choiceNo'])
    phase=state.get('state')
    if phase=='choose':actions=['choice','pause']
    elif phase in ('queued','running'):actions=['pause']
    elif phase=='ready':actions=['output','retry']
    else:actions=['retry'] if phase in ('paused','failed') else []
    if state.get('delete_pending') or (key in TASKS and TASKS[key].stop.is_set()):
        actions=[]
        result['pause_requested']=True
    result['actions']=actions
    return result


def configure(v):
    size=int(v.get('size',720))
    if size not in (480,720,1080) or v.get('bg','studio') not in ('studio','sage','sand','slate'):raise ValueError('无效的输出设置。')
    return dict(size=size,bg=v.get('bg','studio'),audio=v.get('audio',True) in (True,'1'))


def save(key, **changes):
    with GUARD:
        previous=STATES[key]
        phase=changes.get('state',previous.get('state'))
        if phase!=previous.get('state') and phase not in TRANSITIONS.get(previous.get('state'),set()):
            raise ValueError(f"非法任务转换 {previous.get('state')} -> {phase}")
        revision=previous.get('revision',0)
        if phase!=previous.get('state') or 'settings' in changes or 'pause_requested' in changes:
            revision+=1
        state={**previous,**changes,'updated':time.time(),'revision':revision}
        safe_json(DATA/key/'state.json',state)
        STATES[key]=state


class WaitingForPerson(Exception):
    pass


def worker(key,stop):
    folder=DATA/key
    def check():
        if stop.is_set():raise InterruptedError()
    def update(**v):
        with GUARD:
            check();save(key,**v)
    def choose(boxes,t):
        with GUARD:
            prior=STATES[key].get('chosen_index')
            if prior is not None and 0<=prior<len(boxes):return prior
        # Release worker ownership before exposing 'choose' to a polling client.
        raise WaitingForPerson(boxes,t)
    try:
        check();update(state='running',stage='inspect',title='正在读取视频',message='页面关闭后后台处理继续。',progress=.01)
        if (folder/'motion.json').exists():motion=json.loads((folder/'motion.json').read_text('utf-8'))
        else:motion=extract(folder/'source',folder,STATES[key],update,choose,check)
        check();update(stage='encode',title='正在导出 MP4',progress=.70)
        result=render(motion,folder,STATES[key]['settings'],update,check)
        final=dict(state='ready',stage='ready',title='白模视频已就绪',progress=1,**result)
    except WaitingForPerson as pending:
        boxes,t=pending.args
        final=dict(state='choose',stage='choose',boxes=boxes,time=t,choiceNo=str(time.time_ns()),choice=None)
    except InterruptedError:
        final=dict(state='paused',message='任务已暂停。继续时可复用已完成的动作提取。')
    except Exception as exc:
        final=dict(state='failed',message=str(exc)[:350] or '服务端处理失败。')
    with GUARD:
        TASKS.pop(key,None)
        if STATES[key].get('delete_pending'):
            STATES.pop(key,None);shutil.rmtree(folder,ignore_errors=True)
        else:
            if stop.is_set():
                final=dict(state='paused',message='任务已暂停。继续时可复用已完成的动作提取。')
            save(key,**final)



def enqueue(key):
    with GUARD:
        if key in TASKS:return
        stop=threading.Event()
        save(key,state='queued',stage='queued',pause_requested=False,title='任务已排队',progress=0,message='处理完成后可在此下载。')
        TASKS[key]=WorkerSlot(stop,POOL.submit(worker,key,stop))


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
            s=public_state(STATES[key],key)
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
            cfg=configure(q);key=self.headers.get('X-Motion-Upload') or secrets.token_hex(24)
            if not re.fullmatch('[0-9a-f]{48}',key):raise ValueError('无效的上传标识。')
            folder=DATA/key
            with GUARD:
                if key in STATES:
                    return self.response(201,dict(id=key,reused=True))
                try:folder.mkdir()
                except FileExistsError:return self.response(409,'原上传仍在进行，请稍后重试。')
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
            expected=self.headers.get('X-Motion-Revision')
            if expected is not None and expected!=str(s.get('revision',0)):
                return self.response(409,'任务状态已更新，请重新读取。')
            if s.get('delete_pending') and action!='delete':return self.response(409,'任务正在清除。')
            if action=='choice':
                i=int(raw.decode())
                version=self.headers.get('X-Choice-Version')
                if version and version!=str(s.get('choiceNo')):return self.response(409,'请重新读取人物列表。')
                if s['state']!='choose' or not 0<=i<len(s['boxes']):raise ValueError('人物选择已失效。')
                save(key,chosen_index=i);enqueue(key)
            elif action=='retry':
                if key in TASKS or s['state'] not in ('ready','failed','paused'):return self.response(409,'请先检查当前任务状态。')
                save(key,settings=configure(json.loads(raw or b'{}')));enqueue(key)
            elif action=='pause':
                if key in TASKS:
                    slot=TASKS[key]
                    slot.stop.set()
                    if slot.future.cancel():
                        TASKS.pop(key)
                        save(key,state='paused',pause_requested=False,message='排队任务已暂停。')
                    else:save(key,pause_requested=True)
                elif s['state']=='choose':save(key,state='paused',message='任务已暂停。')
                # A late pause on a finished task leaves the completed result downloadable.
            elif action=='delete':
                if key in TASKS:save(key,delete_pending=True);TASKS[key].stop.set()
                else:STATES.pop(key);shutil.rmtree(DATA/key,ignore_errors=True)
            else:return self.response(404,'操作不存在。')
        self.response(200,dict(ok=True))


def restore_jobs():
    # An interrupted upload has no durable job record. Only clean job-named
    # directories here, before the HTTP listener accepts new uploads.
    for folder in DATA.iterdir():
        if re.fullmatch('[0-9a-f]{48}',folder.name) and folder.is_dir() and not (folder/'state.json').exists():
            shutil.rmtree(folder,ignore_errors=True)
    for path in DATA.glob('*/state.json'):
        try:
            s=json.loads(path.read_text('utf-8'));key=path.parent.name
            if s.get('delete_pending') or time.time()-s['updated']>86400:shutil.rmtree(path.parent);continue
            STATES[key]=s
            if s.get('pause_requested') and s['state'] in ('queued','running'):save(key,state='paused',pause_requested=False)
            elif s.get('state') in ('queued','running'):
                # A stopped process owns no active worker. Requeue using its checkpoint.
                if s['state']=='running':save(key,state='paused')
                enqueue(key)
            elif s.get('state')=='choose' and not (path.parent/'choice.jpg').exists():enqueue(key)
        except (OSError,ValueError,KeyError):continue


if __name__=='__main__':
    restore_jobs()
    threading.Thread(target=cleanup,daemon=True).start()
    ThreadingHTTPServer((os.getenv('MOTION_HOST','127.0.0.1'),int(os.getenv('PORT','8765'))),partial(API,directory=str(ROOT/'dist'))).serve_forever()
