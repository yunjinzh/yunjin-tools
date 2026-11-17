"""Shiguang local photo library. No network access; originals are read-only."""
from __future__ import annotations
import os, json, sqlite3, threading, time, hashlib, re, fnmatch, traceback, math
from pathlib import Path
from datetime import datetime
from contextlib import contextmanager
from PIL import Image, ImageOps, ImageCms
import numpy as np

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIF=True
except ImportError:
    HEIF=False

VERSION='1.0.1'
APP=Path(__file__).resolve().parent
SUPPORTED={'.jpg','.jpeg','.png','.webp','.bmp','.tif','.tiff','.gif','.heic','.heif','.avif','.dng','.cr2','.cr3','.nef','.arw','.raf','.rw2','.orf','.srw','.pef'}
RAW={'.dng','.cr2','.cr3','.nef','.arw','.raf','.rw2','.orf','.srw','.pef'}
MONTH_SQL="CASE WHEN p.manual_date IS NOT NULL AND p.precision='year' THEN substr(p.sort_time,1,4)||'-00' ELSE substr(p.sort_time,1,7) END"
DEFAULTS={'thumb_size':400,'preview_size':1920,'jpeg_quality':86,'face_enabled':True,
          'auto_threshold':0.55,'suggest_threshold':0.32,'face_size':1600,
          'exclude':'.git,node_modules,@eaDir,$RECYCLE.BIN,System Volume Information',
          'paused':False}

def now(): return datetime.now().isoformat(timespec='seconds')
def is_linklike(path): return path.is_symlink() or getattr(path,'is_junction',lambda:False)()
def normalize_date(value):
    if not value: return None
    s=str(value).strip().replace('\x00','')
    try:
        if re.match(r'^\d{4}:\d{2}:\d{2}',s): s=s[:10].replace(':','-')+s[10:]
        return datetime.fromisoformat(s.replace('Z','+00:00')).replace(tzinfo=None).isoformat(timespec='seconds')
    except (ValueError,TypeError): return None

def date_from_filename(name):
    m=re.search(r'(?<!\d)((?:19|20)\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:[T_ -]?([0-2]\d)[-.:]?([0-5]\d)[-.:]?([0-5]\d))?(?!\d)',name)
    if m:
        try:
            y,mo,d,h,mi,s=m.groups()
            return datetime(int(y),int(mo),int(d),int(h or 0),int(mi or 0),int(s or 0)).isoformat(timespec='seconds')
        except ValueError: pass
    return None

def read_metadata(im, filename, mtime):
    ex=im.getexif()
    try: detail=ex.get_ifd(34665)
    except Exception: detail={}
    capture=normalize_date(detail.get(36867) or ex.get(36867))
    source='exif' if capture else 'filename'
    if not capture: capture=date_from_filename(filename)
    if not capture: source='file';capture=datetime.fromtimestamp(mtime).isoformat(timespec='seconds')
    offset=str(detail.get(36881) or '')
    lat=lon=None
    try:
        gps=ex.get_ifd(34853)
        def coord(v): return float(v[0])+float(v[1])/60+float(v[2])/3600
        if gps.get(2) and gps.get(4):
            lat=coord(gps[2])*(-1 if gps.get(1)=='S' else 1)
            lon=coord(gps[4])*(-1 if gps.get(3)=='W' else 1)
            if not (-90<=lat<=90 and -180<=lon<=180): lat=lon=None
    except Exception: pass
    camera=' '.join(str(ex.get(k,'')).strip() for k in [271,272]).strip()
    return {'capture_time':capture,'capture_source':source,'timezone':offset,'latitude':lat,'longitude':lon,'camera':camera}

def display_rgb(im):
    im=ImageOps.exif_transpose(im)
    profile=im.info.get('icc_profile')
    if profile:
        try:
            import io
            im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(profile)),ImageCms.createProfile('sRGB'),outputMode='RGB')
        except Exception: pass
    if im.mode in ('RGBA','LA') or (im.mode=='P' and 'transparency' in im.info):
        rgba=im.convert('RGBA');background=Image.new('RGB',rgba.size,(241,240,236));background.paste(rgba,mask=rgba.getchannel('A'));return background
    return im.convert('RGB')

def atomic_jpeg(im,path,size,quality):
    copy=im.copy();copy.thumbnail((size,size),Image.Resampling.LANCZOS)
    tmp=path.with_suffix('.tmp')
    copy.save(tmp,format='JPEG',quality=quality,optimize=True)
    os.replace(tmp,path)

def bbox_iou(a,b):
    ax,ay,aw,ah=a;bx,by,bw,bh=b
    inter=max(0,min(ax+aw,bx+bw)-max(ax,bx))*max(0,min(ay+ah,by+bh)-max(ay,by))
    return inter/(aw*ah+bw*bh-inter+1e-10)

class Library:
    def __init__(self,data,models=None,start_worker=True):
        self.data=Path(data).resolve();self.data.mkdir(parents=True,exist_ok=True)
        self.models=Path(models or APP/'models');self.dbpath=self.data/'library.sqlite3'
        for n in ('thumbs','previews','faces','exports','backups'): (self.data/n).mkdir(exist_ok=True)
        self.lock=threading.RLock();self.stop=threading.Event();self.wake=threading.Event()
        self.busy=False;self.phase='idle';self.current='';self.last_error='';self.revision=0
        self.reps=None;self.rep_people=[];self.detector=None;self.recognizer=None;self.model_error='';self.priority=[]
        self._schema()
        with self.db() as c:
            for k,v in DEFAULTS.items(): c.execute('INSERT OR IGNORE INTO settings VALUES(?,?)',(k,json.dumps(v)))
            c.execute("UPDATE roots SET status='pending' WHERE status='scanning'")
        self.settings=self.get_settings()
        self.worker=None
        if start_worker:
            self.worker=threading.Thread(target=self.loop,daemon=True,name='photo-indexer');self.worker.start()

    @contextmanager
    def db(self):
        c=sqlite3.connect(self.dbpath,timeout=30);c.row_factory=sqlite3.Row
        c.execute('PRAGMA foreign_keys=ON');c.execute('PRAGMA busy_timeout=30000')
        try:
            yield c;c.commit()
        except Exception:
            c.rollback();raise
        finally: c.close()

    def _schema(self):
        with self.db() as c:
            c.execute('PRAGMA journal_mode=WAL')
            c.executescript('''
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);
CREATE TABLE IF NOT EXISTS roots(id INTEGER PRIMARY KEY,path TEXT UNIQUE,name TEXT,status TEXT DEFAULT 'pending',recursive INTEGER DEFAULT 1,scan_at TEXT,error TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS photos(id INTEGER PRIMARY KEY,root_id INTEGER REFERENCES roots(id),rel TEXT,name TEXT,ext TEXT,size INTEGER,mtime_ns INTEGER,
sha256 TEXT,phash TEXT,width INTEGER,height INTEGER,capture_time TEXT,capture_source TEXT,timezone TEXT,latitude REAL,longitude REAL,camera TEXT,
manual_date TEXT,precision TEXT DEFAULT 'second',sort_time TEXT,status TEXT DEFAULT 'pending',face_status TEXT DEFAULT 'pending',error TEXT DEFAULT '',
favorite INTEGER DEFAULT 0,rating INTEGER DEFAULT 0,tags TEXT DEFAULT '',note TEXT DEFAULT '',seen TEXT,version INTEGER DEFAULT 0,UNIQUE(root_id,rel));
CREATE TABLE IF NOT EXISTS people(id INTEGER PRIMARY KEY,name TEXT DEFAULT '',cover_face INTEGER,favorite INTEGER DEFAULT 0,created TEXT);
CREATE TABLE IF NOT EXISTS faces(id INTEGER PRIMARY KEY,photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,x REAL,y REAL,w REAL,h REAL,
embedding BLOB,person_id INTEGER REFERENCES people(id),suggested_id INTEGER REFERENCES people(id),similarity REAL,confidence REAL,
confirmed INTEGER DEFAULT 0,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS exclusions(face_id INTEGER REFERENCES faces(id) ON DELETE CASCADE,person_id INTEGER REFERENCES people(id),PRIMARY KEY(face_id,person_id));
CREATE TABLE IF NOT EXISTS albums(id INTEGER PRIMARY KEY,name TEXT UNIQUE,created TEXT);
CREATE TABLE IF NOT EXISTS album_photos(album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,PRIMARY KEY(album_id,photo_id));
CREATE TABLE IF NOT EXISTS logs(id INTEGER PRIMARY KEY,time TEXT,level TEXT,stage TEXT,path TEXT,message TEXT);
CREATE INDEX IF NOT EXISTS idx_photo_date ON photos(sort_time DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_photo_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photo_face ON photos(face_status,status);
CREATE INDEX IF NOT EXISTS idx_photo_hash ON photos(sha256);
CREATE INDEX IF NOT EXISTS idx_face_person ON faces(person_id,active,photo_id);
CREATE INDEX IF NOT EXISTS idx_face_photo ON faces(photo_id,active);
CREATE INDEX IF NOT EXISTS idx_log_time ON logs(time DESC);
PRAGMA user_version=1;
''')

    def get_settings(self):
        with self.db() as c: return {r['key']:json.loads(r['value']) for r in c.execute('SELECT * FROM settings')}

    def set_settings(self,values):
        good={k:v for k,v in values.items() if k in DEFAULTS}
        for k,lo,hi in [('thumb_size',160,1000),('preview_size',800,3840),('jpeg_quality',50,96),('face_size',640,2400)]:
            if k in good: good[k]=max(lo,min(hi,int(good[k])))
        if 'auto_threshold' in good: good['auto_threshold']=max(.4,min(.85,float(good['auto_threshold'])))
        if 'suggest_threshold' in good: good['suggest_threshold']=max(.2,min(.39,float(good['suggest_threshold'])))
        if 'exclude' in good: good['exclude']=str(good['exclude'])[:4000]
        for k in ('paused','face_enabled'):
            if k in good: good[k]=bool(good[k])
        with self.db() as c:
            for k,v in good.items(): c.execute('INSERT OR REPLACE INTO settings VALUES(?,?)',(k,json.dumps(v)))
        self.settings=self.get_settings();self.wake.set();self.revision+=1
        return self.settings

    def log(self,level,stage,path,message):
        with self.db() as c: c.execute('INSERT INTO logs(time,level,stage,path,message) VALUES(?,?,?,?,?)',(now(),level,stage,str(path),str(message)))

    def root_add(self,path,recursive=True):
        p=Path(str(path).strip().strip('"')).expanduser().resolve()
        if not p.is_dir(): raise ValueError('目录不存在或当前账户没有读取权限。')
        if p==self.data or self.data in p.parents: raise ValueError('请选择照片目录，相册数据目录会被自动排除。')
        with self.db() as c:
            for r in c.execute('SELECT * FROM roots'):
                old=Path(r['path'])
                if p==old: c.execute("UPDATE roots SET status='pending' WHERE id=?",(r['id'],));self.wake.set();return r['id']
                if p in old.parents or old in p.parents: raise ValueError('该目录与已添加目录重叠，请使用已有根目录扫描。')
            cur=c.execute('INSERT INTO roots(path,name,recursive) VALUES(?,?,?)',(str(p),p.name or str(p),int(recursive)));rid=cur.lastrowid
        self.log('info','目录',p,'已添加照片目录');self.wake.set();return rid

    def root_update(self,rid,path=None,action='scan'):
        with self.lock,self.db() as c:
            r=c.execute('SELECT * FROM roots WHERE id=?',(rid,)).fetchone()
            if not r: raise ValueError('目录不存在')
            if path:
                p=Path(str(path).strip().strip('"')).expanduser().resolve()
                if not p.is_dir(): raise ValueError('新目录不存在')
                if p==self.data or self.data in p.parents: raise ValueError('不能关联到相册数据目录')
                for other in c.execute('SELECT path FROM roots WHERE id<>?',(rid,)):
                    old=Path(other['path'])
                    if p==old or p in old.parents or old in p.parents: raise ValueError('新目录与其他照片目录重叠')
                c.execute("UPDATE roots SET path=?,name=?,status='pending',error='' WHERE id=?",(str(p),p.name,rid))
            else: c.execute("UPDATE roots SET status='pending',error='' WHERE id=?",(rid,))
        self.wake.set()

    def checkpoint(self):
        while self.settings.get('paused') and not self.stop.is_set():
            self.phase='paused';self.wake.wait(.5);self.wake.clear()
        if self.stop.is_set(): raise InterruptedError('任务已停止，可在下次启动继续')

    def scan(self,root):
        p=Path(root['path']);rid=root['id'];stamp=now()+'-'+str(time.time_ns())
        if not p.is_dir():
            with self.db() as c: c.execute("UPDATE roots SET status='offline',error='目录未连接或无法访问' WHERE id=?",(rid,))
            self.log('warning','扫描',p,'目录未连接；保留现有索引和缩略图');return
        errors=[];found=added=changed=0
        excludes=[x.strip() for x in self.settings['exclude'].split(',') if x.strip()]
        with self.db() as c: c.execute("UPDATE roots SET status='scanning' WHERE id=?",(rid,))
        def onerror(e): errors.append(str(e));self.log('error','扫描',getattr(e,'filename',p),e)
        for directory,dirs,files in os.walk(p,followlinks=False,onerror=onerror):
            self.checkpoint();self.phase='scan';self.current=str(directory)
            dirs[:]=[d for d in dirs if not any(fnmatch.fnmatch(d,x) for x in excludes) and not is_linklike(Path(directory)/d) and (Path(directory)/d).resolve()!=self.data]
            if not root['recursive']: dirs[:]=[]
            batch=[]
            for name in files:
                path=Path(directory)/name
                if path.suffix.lower() not in SUPPORTED or is_linklike(path): continue
                try:
                    st=path.stat();rel=path.relative_to(p).as_posix();batch.append((rel,name,path.suffix.lower(),st.st_size,st.st_mtime_ns));found+=1
                except OSError as e: onerror(e)
            with self.lock,self.db() as c:
                for rel,name,ext,size,mt in batch:
                    prev=c.execute('SELECT * FROM photos WHERE root_id=? AND rel=?',(rid,rel)).fetchone()
                    if prev:
                        dirty=prev['size']!=size or prev['mtime_ns']!=mt
                        status='pending' if dirty or prev['status']=='missing' else prev['status']
                        c.execute('UPDATE photos SET size=?,mtime_ns=?,seen=?,status=? WHERE id=?',(size,mt,stamp,status,prev['id']))
                        if dirty:
                            c.execute("UPDATE photos SET sha256=NULL,phash=NULL,face_status='pending',error='' WHERE id=?",(prev['id'],));changed+=1
                    else:
                        c.execute('INSERT INTO photos(root_id,rel,name,ext,size,mtime_ns,seen,sort_time) VALUES(?,?,?,?,?,?,?,?)',(rid,rel,name,ext,size,mt,stamp,datetime.fromtimestamp(mt/1e9).isoformat(timespec='seconds')));added+=1
            self.revision+=1
        with self.db() as c:
            if not errors: c.execute("UPDATE photos SET status='missing' WHERE root_id=? AND (seen IS NULL OR seen<>?)",(rid,stamp))
            c.execute('UPDATE roots SET status=?,scan_at=?,error=? WHERE id=?',('warning' if errors else 'ready',now(),'; '.join(errors)[:1000],rid))
        self.log('info','扫描',p,f'发现 {found} 张；新增 {added}，变化 {changed}；扫描异常 {len(errors)} 条')
        self.revision+=1

    def photo_path(self,photo):
        with self.db() as c: root=c.execute('SELECT path FROM roots WHERE id=?',(photo['root_id'],)).fetchone()
        if not root: raise FileNotFoundError('原目录已移除')
        base=Path(root['path']).resolve();path=(base/photo['rel']).resolve()
        if base not in path.parents: raise ValueError('原图路径超出照片目录')
        return path

    def process_photo(self,photo):
        pid=photo['id'];path=self.photo_path(photo);self.phase='thumbnail';self.current=photo['name']
        try:
            if path.suffix.lower() in RAW: raise ValueError('RAW格式已登记；本版请导出JPEG/TIFF副本后重新扫描')
            st=path.stat();h=hashlib.sha256()
            with open(path,'rb') as f:
                while b:=f.read(1024*1024): h.update(b)
            with Image.open(path) as source:
                meta=read_metadata(source,path.name,st.st_mtime);rgb=display_rgb(source)
            width,height=rgb.size
            atomic_jpeg(rgb,self.data/'thumbs'/f'{pid}.jpg',self.settings['thumb_size'],self.settings['jpeg_quality'])
            atomic_jpeg(rgb,self.data/'previews'/f'{pid}.jpg',self.settings['preview_size'],self.settings['jpeg_quality'])
            tiny=np.asarray(rgb.convert('L').resize((9,8)),dtype=np.int16);bits=(tiny[:,1:]>tiny[:,:-1]).flatten()
            phash=f'{sum(int(v)<<i for i,v in enumerate(bits)):016x}'
            final_stat=path.stat()
            if final_stat.st_mtime_ns!=st.st_mtime_ns or final_stat.st_size!=st.st_size:
                raise ValueError('读取期间文件发生变化，请稍后重试')
            with self.db() as c:
                # Read latest override so edits made during decoding remain authoritative.
                current=c.execute('SELECT manual_date FROM photos WHERE id=?',(pid,)).fetchone()
                sort=current['manual_date'] or meta['capture_time']
                c.execute("UPDATE photos SET sha256=?,phash=?,width=?,height=?,capture_time=?,capture_source=?,timezone=?,latitude=?,longitude=?,camera=?,sort_time=?,status='ready',error='',version=version+1 WHERE id=?",
                          (h.hexdigest(),phash,width,height,meta['capture_time'],meta['capture_source'],meta['timezone'],meta['latitude'],meta['longitude'],meta['camera'],sort,pid))
                oldfaces=list(c.execute('SELECT * FROM faces WHERE photo_id=? AND active=1',(pid,)))
            for face in oldfaces:
                x,y,w,hh=[face[k] for k in ('x','y','w','h')]
                self.crop_face(rgb,face['id'],[x,y,w,hh])
            self.log('success','缩略图',path,'缩略图、预览图和元数据已保存'+('；日期待确认' if meta['capture_source']!='exif' else ''))
        except Exception as e:
            with self.db() as c: c.execute("UPDATE photos SET status='error',error=? WHERE id=?",(str(e),pid))
            self.log('error','缩略图',path,str(e))
        self.revision+=1

    def load_models(self):
        if self.detector is not None: return
        try:
            import cv2
            cv2.setNumThreads(max(1,min(4,(os.cpu_count() or 4)//2)))
            # Python opens Unicode paths; OpenCV receives bytes instead of a Windows ANSI path.
            empty=np.empty(0,dtype=np.uint8)
            detector_bytes=np.frombuffer((self.models/'yunet.onnx').read_bytes(),dtype=np.uint8)
            recognizer_bytes=np.frombuffer((self.models/'sface.onnx').read_bytes(),dtype=np.uint8)
            self.detector=cv2.FaceDetectorYN.create('onnx',detector_bytes,empty,(320,320),0.82,0.3,5000)
            self.recognizer=cv2.FaceRecognizerSF.create('onnx',recognizer_bytes,empty)
            self.cv2=cv2;self.model_error=''
        except Exception as e:
            self.model_error=str(e);raise RuntimeError('人脸模型加载失败：'+str(e))

    def load_reps(self):
        with self.db() as c:
            rows=c.execute('''SELECT f.person_id,f.embedding FROM faces f JOIN photos p ON p.id=f.photo_id
            WHERE f.active=1 AND f.person_id IS NOT NULL AND f.embedding IS NOT NULL AND p.status='ready'
            ORDER BY f.confirmed DESC,f.confidence DESC,f.id''').fetchall()
        counts={};vectors=[];ids=[]
        for r in rows:
            pid=r['person_id'];count=counts.get(pid,0)
            if count>=8: continue
            vec=np.frombuffer(r['embedding'],dtype=np.float32)
            if vec.size!=128: continue
            vectors.append(vec);ids.append(pid);counts[pid]=count+1
        self.reps=np.stack(vectors) if vectors else np.zeros((0,128),np.float32);self.rep_people=ids

    def match_face(self,vector,face_id=None,existing_photo_people=None):
        if self.reps is None: self.load_reps()
        excluded=set(existing_photo_people or [])
        if face_id:
            with self.db() as c: excluded.update(r[0] for r in c.execute('SELECT person_id FROM exclusions WHERE face_id=?',(face_id,)))
        if not len(self.reps): return None,None,None
        scores=self.reps@vector;sums={}
        for pid,score in zip(self.rep_people,scores):
            if pid not in excluded: sums[pid]=max(sums.get(pid,-1),float(score))
        ranked=sorted(sums.items(),key=lambda v:v[1],reverse=True)
        if not ranked: return None,None,None
        pid,score=ranked[0];runner=ranked[1][1] if len(ranked)>1 else -1
        if score>=self.settings['auto_threshold'] and score-runner>=.06: return pid,None,score
        if score>=self.settings['suggest_threshold']: return None,pid,score
        return None,None,score

    def crop_face(self,rgb,fid,bbox):
        x,y,w,h=bbox;W,H=rgb.size;pad=.22
        region=rgb.crop((max(0,int((x-w*pad)*W)),max(0,int((y-h*pad)*H)),min(W,int((x+w*(1+pad))*W)),min(H,int((y+h*(1+pad))*H))))
        if region.width>0 and region.height>0:
            region=ImageOps.fit(region,(160,160),method=Image.Resampling.LANCZOS)
            atomic_jpeg(region,self.data/'faces'/f'{fid}.jpg',160,88)

    def analyze(self,photo):
        pid=photo['id'];path=self.photo_path(photo);self.phase='faces';self.current=photo['name']
        try:
            self.load_models()
            with Image.open(path) as source: rgb=display_rgb(source)
            resized=rgb.copy();resized.thumbnail((self.settings['face_size'],self.settings['face_size']))
            arr=np.asarray(resized)[:,:,::-1].copy();H,W=arr.shape[:2]
            self.detector.setInputSize((W,H));_,found=self.detector.detect(arr)
            found=[] if found is None else found
            with self.db() as c:
                previous=[dict(r) for r in c.execute('SELECT * FROM faces WHERE photo_id=? AND active=1',(pid,))]
                c.execute('UPDATE faces SET active=0 WHERE photo_id=? AND NOT(confirmed=1 AND embedding IS NULL)',(pid,))
            used=set();photo_people=set()
            for detection in sorted(found,key=lambda r:float(r[-1]),reverse=True):
                if self.stop.is_set(): raise InterruptedError('已停止，稍后继续')
                self.phase='faces'
                x,y,w,h=[float(v) for v in detection[:4]]
                left,top=max(0,x/W),max(0,y/H)
                bbox=[left,top,max(0,min(1,(x+w)/W)-left),max(0,min(1,(y+h)/H)-top)]
                aligned=self.recognizer.alignCrop(arr,detection)
                vector=self.recognizer.feature(aligned).flatten().astype(np.float32);vector/=max(float(np.linalg.norm(vector)),1e-10)
                previous_match=None;best=.4
                for f in previous:
                    if f['id'] in used: continue
                    iou=bbox_iou(bbox,[f[k] for k in ('x','y','w','h')])
                    if iou>best: previous_match=f;best=iou
                fid=previous_match['id'] if previous_match else None
                if previous_match: used.add(fid)
                confirmed=previous_match['confirmed'] if previous_match else 0
                if confirmed:
                    person=previous_match['person_id'];suggest=None;similarity=previous_match['similarity']
                else: person,suggest,similarity=self.match_face(vector,fid,photo_people)
                with self.db() as c:
                    if person is None and suggest is None and not (previous_match and previous_match['confirmed']):
                        person=c.execute('INSERT INTO people(created) VALUES(?)',(now(),)).lastrowid
                    values=(pid,*bbox,vector.tobytes(),person,suggest,similarity,float(detection[-1]),confirmed)
                    if fid:
                        c.execute('UPDATE faces SET photo_id=?,x=?,y=?,w=?,h=?,embedding=?,person_id=?,suggested_id=?,similarity=?,confidence=?,confirmed=?,active=1 WHERE id=?',(*values,fid))
                    else: fid=c.execute('INSERT INTO faces(photo_id,x,y,w,h,embedding,person_id,suggested_id,similarity,confidence,confirmed) VALUES(?,?,?,?,?,?,?,?,?,?,?)',values).lastrowid
                    if person: c.execute('UPDATE people SET cover_face=COALESCE(cover_face,?) WHERE id=?',(fid,person))
                self.crop_face(rgb,fid,bbox)
                if person:
                    photo_people.add(person)
                    if self.rep_people.count(person)<8:
                        self.reps=np.vstack([self.reps,vector]);self.rep_people.append(person)
            with self.db() as c: c.execute("UPDATE photos SET face_status='done' WHERE id=?",(pid,))
            self.log('success','人脸',path,f'分析完成，检测到 {len(found)} 张人脸')
        except InterruptedError:
            raise
        except Exception as e:
            with self.db() as c: c.execute("UPDATE photos SET face_status='error',error=? WHERE id=?",(str(e),pid))
            self.log('error','人脸',path,str(e))
        self.revision+=1

    def loop(self):
        while not self.stop.is_set():
            try:
                self.checkpoint()
                with self.db() as c:
                    root=c.execute("SELECT * FROM roots WHERE status='pending' ORDER BY id LIMIT 1").fetchone()
                    photo=None
                    while self.priority and photo is None:
                        priority_id=self.priority.pop(0)
                        photo=c.execute("SELECT * FROM photos WHERE id=? AND status='pending'",(priority_id,)).fetchone()
                    if photo is None: photo=c.execute("SELECT * FROM photos WHERE status='pending' ORDER BY id LIMIT 1").fetchone()
                    face=c.execute("SELECT * FROM photos WHERE status='ready' AND face_status='pending' ORDER BY id LIMIT 1").fetchone() if self.settings['face_enabled'] else None
                self.busy=bool(root or photo or face)
                if root: self.scan(dict(root))
                elif photo:
                    with self.lock: self.process_photo(dict(photo))
                elif face:
                    with self.lock: self.analyze(dict(face))
                else:
                    self.phase='idle';self.current='';self.busy=False;self.wake.wait(.8);self.wake.clear()
            except InterruptedError: break
            except Exception as e:
                self.last_error=str(e);self.phase='error';self.busy=False
                self.log('error','任务',self.current,traceback.format_exc());self.wake.wait(2);self.wake.clear()

    def close(self):
        self.stop.set();self.wake.set()
        if self.worker: self.worker.join(10)

    def query(self,params):
        where=['1=1'];args=[]
        mode=params.get('mode','all')
        if mode!='missing': where.append("p.status<>'missing'")
        if mode=='favorites': where.append('p.favorite=1')
        elif mode=='undated': where.append("p.manual_date IS NULL AND COALESCE(p.capture_source,'file')<>'exif'")
        elif mode=='errors': where.append("(p.status='error' OR p.face_status='error')")
        elif mode=='missing': where.append("p.status='missing'")
        elif mode=='review': where.append('EXISTS(SELECT 1 FROM faces f WHERE f.photo_id=p.id AND f.active=1 AND f.person_id IS NULL)')
        elif mode=='duplicates': where.append("p.sha256 IN(SELECT sha256 FROM photos WHERE sha256 IS NOT NULL AND status='ready' GROUP BY sha256 HAVING COUNT(*)>1)")
        elif mode=='map': where.append('p.latitude IS NOT NULL AND p.longitude IS NOT NULL')
        if params.get('root'): where.append('p.root_id=?');args.append(int(params['root']))
        if params.get('q'):
            like='%'+str(params['q']).replace('!','!!').replace('%','!%').replace('_','!_')+'%'
            where.append("(p.name LIKE ? ESCAPE '!' OR p.tags LIKE ? ESCAPE '!' OR p.note LIKE ? ESCAPE '!' OR p.rel LIKE ? ESCAPE '!')");args.extend([like]*4)
        if params.get('person'):
            ids=[int(v) for v in str(params['person']).split(',') if v.isdigit()][:20]
            if ids:
                marks=','.join('?'*len(ids));n=len(set(ids)) if params.get('match','all')=='all' else 1
                where.append(f'(SELECT COUNT(DISTINCT f.person_id) FROM faces f WHERE f.photo_id=p.id AND f.active=1 AND f.person_id IN({marks}))>=?');args+=ids+[n]
        if params.get('album'): where.append('EXISTS(SELECT 1 FROM album_photos a WHERE a.photo_id=p.id AND a.album_id=?)');args.append(int(params['album']))
        for k,op in [('from','>='),('to','<=')]:
            if params.get(k):
                val=str(params[k])[:10];val+=('T23:59:59' if k=='to' else 'T00:00:00');where.append(f'p.sort_time{op}?');args.append(val)
        if params.get('hash'): where.append('p.sha256=?');args.append(params['hash'])
        if params.get('rating'): where.append('p.rating>=?');args.append(int(params['rating']))
        if params.get('format'): where.append('p.ext=?');args.append('.'+params['format'].lower().lstrip('.'))
        if params.get('source')=='confirmed': where.append("(p.manual_date IS NOT NULL OR p.capture_source='exif')")
        sort=params.get('sort','date_desc')
        order={'date_desc':f'{MONTH_SQL} DESC,p.sort_time DESC,p.id DESC','date_asc':f'{MONTH_SQL} ASC,p.sort_time ASC,p.id ASC','name':'p.name COLLATE NOCASE,p.id','rating':'p.rating DESC,p.sort_time DESC,p.id DESC'}.get(sort,f'{MONTH_SQL} DESC,p.sort_time DESC,p.id DESC')
        return ' AND '.join(where),args,order

    def photos(self,params):
        where,args,order=self.query(params);limit=max(1,min(500,int(params.get('limit',200))));offset=max(0,int(params.get('offset',0)))
        with self.db() as c:
            rows=c.execute(f'''SELECT p.id,p.root_id,p.name,p.ext,p.width,p.height,p.status,p.face_status,p.favorite,p.rating,p.tags,p.manual_date,p.capture_time,p.capture_source,p.sort_time,p.precision,p.version,p.sha256,
            (SELECT COUNT(*) FROM faces f WHERE f.photo_id=p.id AND active=1) face_count FROM photos p WHERE {where} ORDER BY {order} LIMIT ? OFFSET ?''',args+[limit,offset]).fetchall()
        return [dict(r) for r in rows]

    def timeline(self,params):
        where,args,order=self.query(params)
        with self.db() as c:
            total=c.execute(f'SELECT COUNT(*) FROM photos p WHERE {where}',args).fetchone()[0]
            direction='ASC' if params.get('sort')=='date_asc' else 'DESC'
            rows=[dict(r) for r in c.execute(f"SELECT {MONTH_SQL} month,COUNT(*) count FROM photos p WHERE {where} GROUP BY month ORDER BY month {direction}",args)]
        if params.get('sort') in ('name','rating'): rows=[{'month':'全部结果','count':total}]
        return {'total':total,'months':rows}

    def detail(self,pid):
        with self.db() as c:
            photo=c.execute('SELECT p.*,r.name root_name,r.path root_path FROM photos p JOIN roots r ON r.id=p.root_id WHERE p.id=?',(pid,)).fetchone()
            if not photo: raise ValueError('照片不存在')
            faces=c.execute('''SELECT f.id,f.x,f.y,f.w,f.h,f.person_id,f.suggested_id,f.similarity,f.confidence,f.confirmed,pe.name,s.name suggested_name
            FROM faces f LEFT JOIN people pe ON pe.id=f.person_id LEFT JOIN people s ON s.id=f.suggested_id WHERE f.photo_id=? AND f.active=1''',(pid,)).fetchall()
            duplicate=c.execute("SELECT COUNT(*) FROM photos WHERE sha256=? AND status='ready'",(photo['sha256'],)).fetchone()[0] if photo['sha256'] else 0
        out=dict(photo);out['faces']=[dict(f) for f in faces];out['duplicate_count']=duplicate;out['path']=str(Path(out['root_path'])/out['rel']);return out

    def people(self):
        with self.db() as c:
            return [dict(r) for r in c.execute('''SELECT pe.*,COUNT(DISTINCT f.photo_id) photo_count,COUNT(f.id) face_count,SUM(f.confirmed) confirmed_count,
            COALESCE((SELECT ff.id FROM faces ff JOIN photos pp ON pp.id=ff.photo_id WHERE ff.id=pe.cover_face AND ff.active=1 AND ff.person_id=pe.id AND pp.status<>'missing'),MIN(f.id)) cover
            FROM people pe LEFT JOIN faces f ON f.person_id=pe.id AND f.active=1 LEFT JOIN photos p ON p.id=f.photo_id
            WHERE p.status<>'missing' OR f.id IS NULL GROUP BY pe.id HAVING face_count>0 OR pe.name<>'' ORDER BY pe.favorite DESC,photo_count DESC,pe.id''')]

    def person_edit(self,pid,values):
        with self.lock,self.db() as c:
            if not c.execute('SELECT 1 FROM people WHERE id=?',(pid,)).fetchone(): raise ValueError('人物不存在')
            for k in ('name','favorite','cover_face'):
                if k in values:
                    val=str(values[k]).strip()[:80] if k=='name' else int(values[k])
                    if k=='cover_face' and not c.execute('SELECT 1 FROM faces WHERE id=? AND person_id=? AND active=1',(val,pid)).fetchone(): raise ValueError('封面人脸不属于该人物')
                    c.execute(f'UPDATE people SET {k}=? WHERE id=?',(val,pid))
        self.revision+=1

    def merge_people(self,ids,target):
        ids=list(set(int(x) for x in ids));target=int(target);sources=[x for x in ids if x!=target]
        if not sources: return
        with self.lock,self.db() as c:
            if not c.execute('SELECT 1 FROM people WHERE id=?',(target,)).fetchone(): raise ValueError('目标人物不存在')
            for pid in sources:
                c.execute('UPDATE faces SET person_id=?,confirmed=1 WHERE person_id=?',(target,pid))
                c.execute('UPDATE faces SET suggested_id=? WHERE suggested_id=?',(target,pid))
                c.execute('INSERT OR IGNORE INTO exclusions SELECT face_id,? FROM exclusions WHERE person_id=?',(target,pid))
                c.execute('DELETE FROM exclusions WHERE person_id=?',(pid,))
                c.execute('DELETE FROM people WHERE id=?',(pid,))
            c.execute('UPDATE faces SET confirmed=1 WHERE person_id=?',(target,))
            c.execute('DELETE FROM exclusions WHERE person_id=? AND face_id IN(SELECT id FROM faces WHERE person_id=?)',(target,target))
        self.reps=None;self.revision+=1;self.log('info','人物','',f'人物 {sources} 合并到 {target}，已保留人工确认')

    def face_assign(self,fids,person=None,new_name=None,exclude=False):
        with self.lock,self.db() as c:
            if new_name is not None: person=c.execute('INSERT INTO people(name,created) VALUES(?,?)',(str(new_name).strip()[:80],now())).lastrowid
            if person is not None and not c.execute('SELECT 1 FROM people WHERE id=?',(person,)).fetchone(): raise ValueError('人物不存在')
            for fid in fids:
                f=c.execute('SELECT * FROM faces WHERE id=?',(int(fid),)).fetchone()
                if not f: continue
                if f['person_id'] and f['person_id']!=person: c.execute('INSERT OR IGNORE INTO exclusions VALUES(?,?)',(fid,f['person_id']))
                if exclude and f['suggested_id']: c.execute('INSERT OR IGNORE INTO exclusions VALUES(?,?)',(fid,f['suggested_id']))
                if person: c.execute('DELETE FROM exclusions WHERE face_id=? AND person_id=?',(fid,person))
                c.execute('UPDATE faces SET person_id=?,suggested_id=NULL,confirmed=1 WHERE id=?',(person,fid))
                if person: c.execute('UPDATE people SET cover_face=COALESCE(cover_face,?) WHERE id=?',(fid,person))
        self.reps=None;self.revision+=1
        return person

    def manual_face(self,pid,bbox,person=None,new_name=None):
        if len(bbox)!=4: raise ValueError('需要人脸区域')
        x,y,w,h=[float(x) for x in bbox]
        if min(x,y)<0 or min(w,h)<.005 or x+w>1.001 or y+h>1.001: raise ValueError('人脸区域超出照片')
        photo=self.detail(pid)
        with self.lock,self.db() as c:
            fid=c.execute('INSERT INTO faces(photo_id,x,y,w,h,confidence,confirmed) VALUES(?,?,?,?,?,1,1)',(pid,x,y,w,h)).lastrowid
        with Image.open(self.photo_path(photo)) as im: self.crop_face(display_rgb(im),fid,[x,y,w,h])
        self.face_assign([fid],person,new_name)
        return fid

    def photo_edit(self,ids,values):
        if len(ids)>20000: raise ValueError('单次最多处理20000张照片，请按日期或目录分批选择')
        ids=[int(i) for i in ids]
        with self.lock,self.db() as c:
            for pid in ids:
                r=c.execute('SELECT * FROM photos WHERE id=?',(pid,)).fetchone()
                if not r: continue
                for k in ('favorite','rating','note','tags'):
                    if k in values:
                        value=int(bool(values[k])) if k=='favorite' else max(0,min(5,int(values[k]))) if k=='rating' else str(values[k])[:4000]
                        c.execute(f'UPDATE photos SET {k}=? WHERE id=?',(value,pid))
                if 'append_tags' in values:
                    tags=list(dict.fromkeys([s.strip() for s in re.split(r'[,，]',r['tags']+','+str(values['append_tags'])) if s.strip()]))
                    c.execute('UPDATE photos SET tags=? WHERE id=?',(', '.join(tags)[:4000],pid))
                if 'manual_date' in values:
                    raw=str(values['manual_date'] or '').strip()
                    precision='year' if len(raw)==4 else 'month' if len(raw)==7 else 'day' if len(raw)==10 else 'second'
                    expanded=raw+'-01-01' if precision=='year' else raw+'-01' if precision=='month' else raw
                    val=normalize_date(expanded) if raw else None
                    if raw and not val: raise ValueError('日期格式应为 YYYY、YYYY-MM、YYYY-MM-DD 或完整日期时间')
                    c.execute('UPDATE photos SET manual_date=?,precision=?,sort_time=COALESCE(?,capture_time,sort_time) WHERE id=?',(val,precision,val,pid))
                if 'shift_hours' in values:
                    from datetime import timedelta
                    val=(datetime.fromisoformat(r['manual_date'] or r['capture_time'] or r['sort_time'])+timedelta(hours=float(values['shift_hours']))).isoformat(timespec='seconds')
                    c.execute("UPDATE photos SET manual_date=?,sort_time=?,precision='second' WHERE id=?",(val,val,pid))
                if values.get('confirm_date'):
                    c.execute("UPDATE photos SET manual_date=COALESCE(capture_time,sort_time),precision='second' WHERE id=?",(pid,))
        self.revision+=1

    def retry(self,kind='errors',ids=None):
        with self.lock,self.db() as c:
            clause='';args=[]
            if ids: clause=' AND id IN('+','.join('?'*len(ids))+')';args=[int(i) for i in ids]
            if kind=='rebuild': c.execute("UPDATE photos SET status='pending' WHERE status<>'missing'"+clause,args)
            elif kind=='faces':
                c.execute("UPDATE photos SET face_status='pending' WHERE status='ready'"+clause,args)
                self.reps=None
            else:
                c.execute("UPDATE photos SET status='pending',error='' WHERE status='error'"+clause,args)
                c.execute("UPDATE photos SET face_status='pending',error='' WHERE face_status='error'"+clause,args)
        self.wake.set();self.revision+=1

    def state(self):
        with self.db() as c:
            stats=dict(c.execute('''SELECT COUNT(*) total,SUM(status='ready') ready,SUM(status='pending') pending,SUM(status='error') errors,
            SUM(status='missing') missing,SUM(status='ready' AND face_status='done') face_done,SUM(status='ready' AND face_status='pending') face_pending,
            SUM(status='ready' AND face_status='error') face_errors,SUM(favorite=1 AND status<>'missing') favorites,SUM(manual_date IS NULL AND COALESCE(capture_source,'file')<>'exif' AND status<>'missing') undated,
            COALESCE(SUM(size),0) bytes,MIN(substr(sort_time,1,4)) first_year,MAX(substr(sort_time,1,4)) last_year FROM photos''').fetchone())
            stats={k:(0 if v is None and k not in ('first_year','last_year') else v) for k,v in stats.items()}
            stats['people']=c.execute('SELECT COUNT(DISTINCT person_id) FROM faces WHERE active=1').fetchone()[0]
            stats['review']=c.execute("SELECT COUNT(DISTINCT f.photo_id) FROM faces f JOIN photos p ON p.id=f.photo_id WHERE f.active=1 AND f.person_id IS NULL AND p.status<>'missing'").fetchone()[0]
            stats['duplicates']=c.execute("SELECT COALESCE(SUM(n),0) FROM(SELECT COUNT(*) n FROM photos WHERE sha256 IS NOT NULL AND status='ready' GROUP BY sha256 HAVING n>1)").fetchone()[0]
            roots=[dict(r) for r in c.execute('SELECT r.*,COUNT(p.id) count FROM roots r LEFT JOIN photos p ON p.root_id=r.id GROUP BY r.id')]
            albums=[dict(r) for r in c.execute('SELECT a.*,COUNT(ap.photo_id) count FROM albums a LEFT JOIN album_photos ap ON ap.album_id=a.id GROUP BY a.id ORDER BY a.id')]
        return {'app':'shiguang-photo','version':VERSION,'stats':stats,'roots':roots,'albums':albums,'settings':self.settings,
                'task':{'phase':'paused' if self.settings['paused'] else self.phase,'current':self.current,'busy':self.busy,'error':self.last_error},
                'revision':self.revision,'data_path':str(self.data),'models':{'available':(self.models/'yunet.onnx').exists() and (self.models/'sface.onnx').exists(),'error':self.model_error},'heif':HEIF}

    def album_edit(self,action,aid=None,name=None,ids=None):
        with self.db() as c:
            if action=='create': return c.execute('INSERT INTO albums(name,created) VALUES(?,?)',(str(name).strip()[:80] or '未命名相册',now())).lastrowid
            if action=='delete': c.execute('DELETE FROM albums WHERE id=?',(aid,))
            elif action=='rename': c.execute('UPDATE albums SET name=? WHERE id=?',(str(name).strip()[:80],aid))
            elif action=='add':
                for pid in ids or []: c.execute('INSERT OR IGNORE INTO album_photos VALUES(?,?)',(aid,int(pid)))
            elif action=='remove':
                for pid in ids or []: c.execute('DELETE FROM album_photos WHERE album_id=? AND photo_id=?',(aid,int(pid)))
        self.revision+=1

    def review_faces(self,offset=0):
        with self.db() as c:
            return [dict(r) for r in c.execute('''SELECT f.id,f.photo_id,f.suggested_id,f.similarity,f.confirmed,pe.name,p.name photo_name FROM faces f
            JOIN photos p ON p.id=f.photo_id LEFT JOIN people pe ON pe.id=f.suggested_id WHERE f.active=1 AND f.person_id IS NULL AND p.status='ready' ORDER BY f.id LIMIT 100 OFFSET ?''',(int(offset),))]

    def locations(self,params):
        opts=dict(params);opts['mode']='map';where,args,order=self.query(opts)
        with self.db() as c: return [dict(r) for r in c.execute(f'SELECT p.id,p.name,p.latitude,p.longitude,p.sort_time FROM photos p WHERE {where} ORDER BY {order} LIMIT 50000',args)]

    def logs(self,level='',limit=200):
        with self.db() as c:
            if level: return [dict(r) for r in c.execute('SELECT * FROM logs WHERE level=? ORDER BY id DESC LIMIT ?',(level,limit))]
            return [dict(r) for r in c.execute('SELECT * FROM logs ORDER BY id DESC LIMIT ?',(limit,))]
