"""Loopback-only HTTP interface and Windows portable launcher."""
from __future__ import annotations
import argparse, csv, io, json, mimetypes, os, secrets, shutil, sqlite3, subprocess, sys, tempfile, threading, time, traceback, urllib.parse, urllib.request, webbrowser, zipfile
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from engine import Library, VERSION, APP, now

TOKEN=secrets.token_urlsafe(32)
PLACEHOLDER=b'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e5de"/><g fill="none" stroke="#a8b0a4" stroke-width="3"><rect x="150" y="105" width="100" height="80" rx="8"/><path d="m155 174 28-30 22 18 18-24 22 36"/><circle cx="180" cy="127" r="7"/></g></svg>'''

def native_folder():
    if sys.platform=='win32':
        code="""[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false); Add-Type -AssemblyName System.Windows.Forms; $f=New-Object System.Windows.Forms.FolderBrowserDialog; $f.Description='选择照片所在目录'; $f.ShowNewFolderButton=$false; $hostForm=New-Object System.Windows.Forms.Form; $hostForm.TopMost=$true; $hostForm.ShowInTaskbar=$false; $hostForm.Opacity=0; $hostForm.Show(); if($f.ShowDialog($hostForm) -eq [System.Windows.Forms.DialogResult]::OK){[Console]::Write($f.SelectedPath)}; $hostForm.Dispose()"""
        # EncodedCommand is a fixed script, never interpolated user input.
        import base64
        encoded=base64.b64encode(code.encode('utf-16-le')).decode()
        result=subprocess.run(['powershell.exe','-NoProfile','-STA','-EncodedCommand',encoded],capture_output=True,timeout=300,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if result.returncode: raise RuntimeError('系统目录选择器未打开，请在输入框粘贴目录完整路径。')
        return result.stdout.decode('utf-8-sig').strip()
    if sys.platform=='darwin':
        r=subprocess.run(['osascript','-e','POSIX path of (choose folder with prompt "选择照片目录")'],capture_output=True,text=True)
        return r.stdout.strip()
    try:
        import tkinter as tk
        from tkinter import filedialog
        root=tk.Tk();root.withdraw();p=filedialog.askdirectory(title='选择照片目录');root.destroy();return p
    except Exception: raise RuntimeError('当前系统没有图形目录选择器，请粘贴目录完整路径。')

def csv_bytes(rows,columns):
    f=io.StringIO();w=csv.writer(f);w.writerow([c[1] for c in columns])
    for row in rows:
        values=[]
        for key,_ in columns:
            value=str(row.get(key,'') if row.get(key) is not None else '')
            if value.startswith(('=','+','-','@','\t','\r')): value="'"+value
            values.append(value)
        w.writerow(values)
    return ('\ufeff'+f.getvalue()).encode('utf-8')

class Server(ThreadingHTTPServer):
    daemon_threads=True
    allow_reuse_address=True
    def __init__(self,address,library):
        self.library=library;self.exports={};self.picker_lock=threading.Lock()
        super().__init__(address,Handler)

class Handler(BaseHTTPRequestHandler):
    server_version='Shiguang/1.0'
    def log_message(self,*args): pass

    def common_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Cross-Origin-Resource-Policy','same-origin')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'")

    def answer(self,data,status=200,ctype='application/json; charset=utf-8',filename=None):
        if not isinstance(data,bytes): data=json.dumps(data,ensure_ascii=False).encode('utf-8')
        self.send_response(status);self.common_headers();self.send_header('Content-Type',ctype)
        self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)))
        if filename: self.send_header('Content-Disposition',"attachment; filename*=UTF-8''"+urllib.parse.quote(filename))
        self.end_headers()
        try: self.wfile.write(data)
        except (BrokenPipeError,ConnectionResetError): pass

    def file(self,path,ctype=None,filename=None,cache=False):
        path=Path(path)
        if not path.is_file(): self.answer({'error':'文件不存在或原目录未连接'},404);return
        stat=path.stat();etag=f'"{stat.st_mtime_ns:x}-{stat.st_size:x}"'
        if cache and self.headers.get('If-None-Match')==etag:
            self.send_response(304);self.common_headers();self.send_header('ETag',etag)
            self.send_header('Cache-Control','private, max-age=0, must-revalidate');self.end_headers();return
        self.send_response(200);self.common_headers()
        types={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.geojson':'application/geo+json','.json':'application/json; charset=utf-8'}
        self.send_header('Content-Type',ctype or types.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or 'application/octet-stream')
        self.send_header('Cache-Control','private, max-age=0, must-revalidate' if cache else 'no-store')
        if cache:self.send_header('ETag',etag)
        self.send_header('Content-Length',str(stat.st_size))
        if filename: self.send_header('Content-Disposition',"attachment; filename*=UTF-8''"+urllib.parse.quote(filename))
        self.end_headers()
        try:
            with open(path,'rb') as f: shutil.copyfileobj(f,self.wfile,1024*1024)
        except (BrokenPipeError,ConnectionResetError): pass

    def allowed(self,write=False):
        port=self.server.server_port
        allowed={f'127.0.0.1:{port}',f'localhost:{port}'}
        if self.headers.get('Host') not in allowed:
            self.answer({'error':'仅接受本机地址'},403);return False
        origin=self.headers.get('Origin')
        if origin and origin not in {'http://'+v for v in allowed}:
            self.answer({'error':'跨来源请求已拒绝'},403);return False
        if self.headers.get('Sec-Fetch-Site')=='cross-site':
            self.answer({'error':'跨来源请求已拒绝'},403);return False
        if write and self.headers.get('X-Shiguang-Token')!=TOKEN:
            self.answer({'error':'会话已更新，请刷新页面'},403);return False
        return True

    def do_GET(self):
        if not self.allowed(): return
        try: self.get()
        except Exception as e: self.answer({'error':str(e)},400)

    def get(self):
        lib=self.server.library;url=urllib.parse.urlsplit(self.path);path=urllib.parse.unquote(url.path)
        p={k:v[-1] for k,v in urllib.parse.parse_qs(url.query).items()}
        if path=='/api/ping': self.answer({'app':'shiguang-photo','version':VERSION,'data':str(lib.data)});return
        if path=='/api/state':
            data=lib.state();data['token']=TOKEN;self.answer(data);return
        if path=='/api/photos': self.answer(lib.photos(p));return
        if path=='/api/ids':
            where,args,order=lib.query(p)
            with lib.db() as c: ids=[r[0] for r in c.execute(f'SELECT p.id FROM photos p WHERE {where} ORDER BY {order}',args)]
            self.answer(ids);return
        if path=='/api/timeline': self.answer(lib.timeline(p));return
        if path=='/api/photo': self.answer(lib.detail(int(p['id'])));return
        if path=='/api/people': self.answer(lib.people());return
        if path=='/api/review': self.answer(lib.review_faces(p.get('offset',0)));return
        if path=='/api/locations': self.answer(lib.locations(p));return
        if path=='/api/logs': self.answer(lib.logs(p.get('level','')));return
        if path=='/api/logs.csv':
            data=csv_bytes(lib.logs(p.get('level',''),1000000),[('time','时间'),('level','结果'),('stage','阶段'),('path','文件'),('message','详情')])
            self.answer(data,ctype='text/csv; charset=utf-8',filename='拾光智能相册管理系统_处理日志.csv');return
        if path=='/api/catalog.csv':
            where,args,order=lib.query(p)
            with lib.db() as c: rows=[dict(r) for r in c.execute(f'SELECT p.*,r.path root FROM photos p JOIN roots r ON r.id=p.root_id WHERE {where} ORDER BY {order}',args)]
            cols=[('id','照片编号'),('root','原目录'),('rel','相对路径'),('sort_time','排序日期'),('capture_time','提取日期'),('capture_source','日期来源'),('manual_date','人工校正日期'),('precision','日期精度'),('width','宽'),('height','高'),('favorite','收藏'),('rating','评分'),('tags','标签'),('note','备注'),('status','处理状态'),('error','异常')]
            self.answer(csv_bytes(rows,cols),ctype='text/csv; charset=utf-8',filename='拾光智能相册管理系统_照片清单.csv');return
        if path=='/api/backup': self.backup();return
        if path.startswith('/export/'):
            key=path.split('/')[-1];entry=self.server.exports.get(key)
            if not entry: self.answer({'error':'导出链接已过期，请重新导出'},404);return
            self.file(entry,'application/zip','拾光智能相册管理系统_照片导出.zip');return
        if path.startswith('/media/'):
            parts=path.strip('/').split('/');kind=parts[1];pid=int(parts[2]);photo=lib.detail(pid) if kind in ('full','original') else None
            if kind in ('thumb','preview','face'):
                folder={'thumb':'thumbs','preview':'previews','face':'faces'}[kind];fp=lib.data/folder/f'{pid}.jpg'
                if fp.is_file(): self.file(fp,'image/jpeg',cache=True)
                else: self.answer(PLACEHOLDER,ctype='image/svg+xml')
            elif kind=='full':
                fp=lib.photo_path(photo)
                if photo['ext'] in ('.jpg','.jpeg','.png','.webp','.gif','.bmp'): self.file(fp)
                else:
                    from PIL import Image
                    from engine import display_rgb,atomic_jpeg
                    target=lib.data/'exports'/f'full_{pid}_{photo["version"]}.jpg'
                    with lib.lock:
                        if not target.is_file():
                            with Image.open(fp) as im: rgb=display_rgb(im)
                            atomic_jpeg(rgb,target,max(rgb.size),95)
                    self.file(target,'image/jpeg')
            elif kind=='original':
                fp=lib.photo_path(photo);self.file(fp,filename=fp.name if p.get('download') else None)
            else: self.answer({'error':'不存在'},404)
            return
        if path=='/': path='/index.html'
        fp=(APP/'web'/path.lstrip('/')).resolve()
        if (APP/'web').resolve() not in fp.parents: self.answer({'error':'不存在'},404);return
        self.file(fp)

    def do_POST(self):
        if not self.allowed(True): return
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<0 or length>256*1024*1024: raise ValueError('请求文件超过256MB限制')
            if self.path=='/api/restore':
                self.restore(length);return
            if length>8*1024*1024: raise ValueError('请求过大')
            data=json.loads(self.rfile.read(length) or b'{}');self.post(data)
        except Exception as e:
            self.answer({'error':str(e)},400)

    def post(self,d):
        lib=self.server.library;path=self.path
        if path=='/api/pick':
            if not self.server.picker_lock.acquire(blocking=False): raise ValueError('已有目录选择窗口打开，请切换到该窗口')
            try: self.answer({'path':native_folder()})
            finally: self.server.picker_lock.release()
            return
        if path=='/api/roots': self.answer({'id':lib.root_add(d['path'],d.get('recursive',True))});return
        if path=='/api/root': lib.root_update(int(d['id']),d.get('path'));self.answer({'ok':True});return
        if path=='/api/settings': self.answer(lib.set_settings(d));return
        if path=='/api/prioritize':
            lib.priority=list(dict.fromkeys([int(i) for i in d.get('ids',[])[:100]]+lib.priority))[:200]
            lib.wake.set();self.answer({'ok':True});return
        if path=='/api/person': lib.person_edit(int(d['id']),d);self.answer({'ok':True});return
        if path=='/api/face-ids':
            if len(d.get('ids',[]))>20000: raise ValueError('单次最多处理20000张照片，请分批选择')
            ids=[int(x) for x in d.get('ids',[])]
            if not ids: self.answer([]);return
            marks=','.join('?'*len(ids))
            with lib.db() as c: result=[r[0] for r in c.execute(f'SELECT id FROM faces WHERE person_id=? AND active=1 AND photo_id IN({marks})',[int(d['person'])]+ids)]
            self.answer(result);return
        if path=='/api/merge': lib.merge_people(d['ids'],d['target']);self.answer({'ok':True});return
        if path=='/api/assign': self.answer({'person':lib.face_assign(d['ids'],d.get('person'),d.get('new_name'),d.get('exclude',False))});return
        if path=='/api/manual-face': self.answer({'id':lib.manual_face(int(d['photo_id']),d['bbox'],d.get('person'),d.get('new_name'))});return
        if path=='/api/edit': lib.photo_edit(d['ids'],d['values']);self.answer({'ok':True});return
        if path=='/api/retry': lib.retry(d.get('kind','errors'),d.get('ids'));self.answer({'ok':True});return
        if path=='/api/album': self.answer({'id':lib.album_edit(d['action'],d.get('id'),d.get('name'),d.get('ids'))});return
        if path=='/api/export': self.export(d);return
        if path=='/api/reveal':
            photo=lib.detail(int(d['id']));fp=lib.photo_path(photo)
            if not fp.exists(): raise ValueError('原图未连接')
            if sys.platform=='win32': subprocess.Popen(['explorer.exe','/select,',str(fp)])
            elif sys.platform=='darwin': subprocess.Popen(['open','-R',str(fp)])
            else: raise ValueError('当前系统请使用照片信息中的完整路径定位')
            self.answer({'ok':True});return
        if path=='/api/data-folder':
            if sys.platform=='win32': os.startfile(str(lib.data))
            elif sys.platform=='darwin': subprocess.Popen(['open',str(lib.data)])
            self.answer({'path':str(lib.data)});return
        if path=='/api/shutdown':
            self.answer({'ok':True});threading.Thread(target=self.server.shutdown,daemon=True).start();return
        self.answer({'error':'接口不存在'},404)

    def backup(self):
        lib=self.server.library
        with tempfile.TemporaryDirectory(dir=lib.data/'backups') as tmp:
            temp=Path(tmp);db=temp/'library.sqlite3'
            with lib.lock,lib.db() as src,sqlite3.connect(db) as dst: src.backup(dst)
            target=temp/'backup.zip'
            with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
                z.write(db,'library.sqlite3');z.writestr('manifest.json',json.dumps({'app':'shiguang-photo','version':VERSION,'created':now(),'includes':'index, people, embeddings, corrections, albums; originals and thumbnails excluded'},ensure_ascii=False))
            self.file(target,'application/zip','拾光智能相册管理系统_索引备份_'+time.strftime('%Y%m%d_%H%M%S')+'.zip')

    def restore(self,length):
        lib=self.server.library
        if not lib.settings['paused']: raise ValueError('请先暂停任务，再恢复索引')
        with tempfile.TemporaryDirectory(dir=lib.data/'backups') as tmp:
            temp=Path(tmp);archive=temp/'restore.zip'
            remain=length
            with open(archive,'wb') as f:
                while remain:
                    b=self.rfile.read(min(remain,1024*1024))
                    if not b: raise ValueError('备份上传中断')
                    f.write(b);remain-=len(b)
            with zipfile.ZipFile(archive) as z:
                manifest=json.loads(z.read('manifest.json'))
                if manifest.get('app')!='shiguang-photo': raise ValueError('不是拾光智能相册管理系统的索引备份')
                info=z.getinfo('library.sqlite3')
                if info.file_size>1024*1024*1024: raise ValueError('备份索引超过1GB限制')
                newdb=temp/'library.sqlite3'
                with z.open(info) as src,open(newdb,'wb') as dst: shutil.copyfileobj(src,dst)
            with sqlite3.connect(newdb) as src:
                if src.execute('PRAGMA integrity_check').fetchone()[0]!='ok': raise ValueError('备份数据库校验失败')
                if src.execute('PRAGMA user_version').fetchone()[0]!=1: raise ValueError('备份版本不兼容')
                required={'photos','people','faces','roots','albums','settings','exclusions','logs','album_photos'}
                tables={r[0] for r in src.execute("SELECT name FROM sqlite_master WHERE type='table'")}
                if not required<=tables: raise ValueError('备份缺少必要数据表')
                if src.execute("SELECT count(*) FROM sqlite_master WHERE type IN ('trigger','view')").fetchone()[0]: raise ValueError('备份含有不支持的数据库结构')
                # Ensure expected columns exist before touching the current database.
                for table in required:
                    with lib.db() as current: expected={r[1] for r in current.execute(f'PRAGMA table_info({table})')}
                    if not expected<={r[1] for r in src.execute(f'PRAGMA table_info({table})')}: raise ValueError('备份数据字段不兼容')
                # Finish the active file and abandon any in-flight scan before swapping libraries.
                had_worker=lib.worker is not None
                if had_worker:
                    lib.stop.set();lib.wake.set();lib.worker.join(60)
                    if lib.worker.is_alive(): raise ValueError('当前照片仍在处理，请等待处理结束后重新启动程序再恢复')
                with lib.lock:
                    previous=lib.data/'backups'/('before_restore_'+time.strftime('%Y%m%d_%H%M%S')+'.sqlite3')
                    with lib.db() as current,sqlite3.connect(previous) as dst: current.backup(dst)
                    with sqlite3.connect(lib.dbpath) as dst: src.backup(dst)
                    # Cache IDs can belong to a different library: invalidate every derivative.
                    for folder in ('thumbs','previews','faces'):
                        for fp in (lib.data/folder).glob('*.jpg'): fp.unlink()
                    with lib.db() as c:
                        c.execute("UPDATE photos SET status='pending' WHERE status<>'missing'")
                        c.execute("UPDATE roots SET status='pending'")
                        c.execute('INSERT OR REPLACE INTO settings VALUES(?,?)',('paused','true'))
                    lib.settings=lib.get_settings();lib.reps=None;lib.revision+=1
                if had_worker:
                    lib.stop.clear();lib.worker=threading.Thread(target=lib.loop,daemon=True,name='photo-indexer');lib.worker.start()
        self.answer({'ok':True,'message':'索引已恢复，任务保持暂停；检查目录连接后点击继续。原索引已自动备份。'})

    def export(self,d):
        lib=self.server.library;ids=list(dict.fromkeys(int(i) for i in d.get('ids',[])))
        if not ids or len(ids)>20000: raise ValueError('请选择1至20000张照片')
        # Expired export files are removed only from the app-managed export directory.
        for old in (lib.data/'exports').glob('*.zip'):
            if time.time()-old.stat().st_mtime>86400:
                try: old.unlink()
                except OSError: pass
        key=secrets.token_urlsafe(18);target=lib.data/'exports'/(key+'.zip');rows=[];success=0
        try:
            with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
                for pid in ids:
                    photo=lib.detail(pid);fp=lib.photo_path(photo)
                    if fp.is_file():
                        arc=f"photos/{pid}_{fp.name}";z.write(fp,arc);success+=1;photo['export_status']='成功'
                    else: photo['export_status']='原图不可访问'
                    rows.append(photo)
                z.writestr('照片清单.csv',csv_bytes(rows,[('id','编号'),('name','文件名'),('path','原路径'),('sort_time','日期'),('tags','标签'),('note','备注'),('export_status','导出状态')]))
            self.server.exports[key]=target;lib.log('info','导出','',f'请求 {len(ids)} 张，成功 {success} 张，缺失 {len(ids)-success} 张')
            self.answer({'url':'/export/'+key,'count':success,'missing':len(ids)-success})
        except Exception:
            target.unlink(missing_ok=True);raise

def acquire_lock(data):
    f=open(data/'instance.lock','a+b');f.seek(0);f.write(b'1');f.flush();f.seek(0)
    try:
        if sys.platform=='win32':
            import msvcrt
            msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK,1)
        else:
            import fcntl
            fcntl.flock(f.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
        return f
    except OSError:
        f.close();return None

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--data');parser.add_argument('--port',type=int,default=8765);parser.add_argument('--no-browser',action='store_true');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    data=Path(args.data).expanduser().resolve() if args.data else APP/'data'
    cfg=APP/'data-location.txt'
    if not args.data and cfg.exists():
        custom=cfg.read_text(encoding='utf-8-sig').strip()
        if custom: data=Path(custom).expanduser().resolve()
    data.mkdir(parents=True,exist_ok=True)
    if args.check:
        import cv2,numpy,PIL
        check=Library(data,start_worker=False);check.load_models();check.close()
        print(json.dumps({'python':sys.version,'opencv':cv2.__version__,'numpy':numpy.__version__,'pillow':PIL.__version__,'heif':check.state()['heif'],'models':'OK','data':str(data)},ensure_ascii=False,indent=2));return
    lock=acquire_lock(data)
    if not lock:
        try:
            url=(data/'running-url.txt').read_text().strip()
            with urllib.request.urlopen(url+'/api/ping',timeout=3) as r: current=json.load(r)
            if current.get('app')=='shiguang-photo' and Path(current['data']).resolve()==data.resolve():
                if not args.no_browser: webbrowser.open(url)
                print('拾光智能相册管理系统已在运行：'+url);return
        except Exception: pass
        raise RuntimeError('拾光智能相册管理系统已有进程正在使用此照片库。请查看原启动窗口，或等待正在关闭的进程退出。')
    lib=Library(data)
    server=None
    for port in range(args.port,args.port+10):
        try: server=Server(('127.0.0.1',port),lib);break
        except OSError: continue
    if not server: lib.close();raise RuntimeError('本地端口被占用，请使用 --port 指定其他端口')
    url=f'http://127.0.0.1:{server.server_port}';(data/'running-url.txt').write_text(url)
    print(f'\n拾光智能相册管理系统 {VERSION}\n访问地址：{url}\n数据目录：{data}\n照片仅在本机处理。保留此窗口可继续后台任务。\n',flush=True)
    if not args.no_browser: threading.Timer(.6,lambda:webbrowser.open(url)).start()
    try: server.serve_forever(poll_interval=.4)
    except KeyboardInterrupt: print('正在保存任务状态…',flush=True)
    finally:
        lib.close();server.server_close();(data/'running-url.txt').unlink(missing_ok=True);lock.close()

if __name__=='__main__':
    try: main()
    except Exception:
        text=traceback.format_exc();print(text,file=sys.stderr)
        try: (APP/'startup-error.log').write_text(text,encoding='utf-8')
        except Exception: pass
        sys.exit(1)
