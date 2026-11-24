"""Integration regression: real media, HTTP and the single processing worker."""
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import tempfile
import threading
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from functools import partial

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'server'))

def main():
    with tempfile.TemporaryDirectory() as tmp:
        os.environ['MOTION_JOBS']=tmp
        import service as server
        http=server.ThreadingHTTPServer(('127.0.0.1',0),partial(server.API,directory=str(server.ROOT/'dist')))
        threading.Thread(target=http.serve_forever,daemon=True).start()
        base=f'http://127.0.0.1:{http.server_port}/api/jobs'
        def request(url,data=None,headers=None):
            try:
                with urlopen(Request(base+url,data=data,headers=headers or {}),timeout=30) as res:return res.status,res.read()
            except HTTPError as e:return e.code,e.read()
        def post(key,action,body=b'',headers=None):
            return request('/'+key+'/'+action,body,headers)[0]
        def state(key):
            code,body=request('/'+key+'/status');assert code==200;return json.loads(body)
        def wait(key,phases):
            until=time.monotonic()+70
            while time.monotonic()<until:
                st=state(key)
                if st['state'] in phases:return st
                if st['state']=='failed':raise AssertionError(st)
                time.sleep(.02)
            raise TimeoutError(state(key))
        def upload(file,key=None):
            key=key or secrets.token_hex(24);code,raw=request('?name=sample.mp4',file,{'X-Motion-Upload':key})
            assert code==201,(code,raw)
            return json.loads(raw)['id']
        source=server.ROOT/'dist/assets/demo-jumping-jacks.mp4'
        key=secrets.token_hex(24);data=source.read_bytes()
        try:
            assert upload(data,key)==upload(data,key)
            assert post(key,'pause')==200
            assert wait(key,{'paused'})['actions']==['retry']
            assert post(key,'retry',b'{"size":480,"audio":true}')==200
            assert post(key,'retry')==409
            ready=wait(key,{'ready'});assert ready['actions']==['output','retry']
            assert post(key,'pause')==200 and state(key)['state']=='ready'
            assert post(key,'retry',b'{}',{'X-Motion-Revision':'0'})==409
            assert state(key)['state']=='ready'
            mp4=request('/'+key+'/output')[1]
            assert len(mp4)==ready['bytes']
            assert request('/'+key+'/output',headers={'Range':'bytes=0-63'})==(206,mp4[:64])
            clip=Path(tmp)/'checked.mp4';clip.write_bytes(mp4)
            subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(clip),'-f','null','-'],check=True)
            from processor import probe
            tracks=probe(clip)['streams'];assert [s['codec_name'] for s in tracks]==['h264','aac']
            assert int(tracks[0]['nb_frames'])==86 and abs(float(tracks[0]['duration'])-3.44)<.002
            mtime=(server.DATA/key/'motion.json').stat().st_mtime_ns
            assert post(key,'retry',b'{"audio":false}')==200;wait(key,{'ready'})
            assert (server.DATA/key/'motion.json').stat().st_mtime_ns==mtime
            clip.write_bytes(request('/'+key+'/output')[1]);assert len(probe(clip)['streams'])==1
            dual=Path(tmp)/'two.mp4'
            subprocess.run(['ffmpeg','-v','error','-i',str(source),'-filter_complex','[0:v]crop=228:360:124:0,split=2[a][b];[a][b]hstack','-t','1.25','-an','-c:v','libx264',str(dual)],check=True)
            pair=upload(dual.read_bytes());choices=wait(pair,{'choose'})
            assert post(pair,'choice',b'1',{'X-Choice-Version':'old'})==409
            assert post(pair,'choice',b'1',{'X-Choice-Version':str(choices['choiceNo'])})==200
            assert wait(pair,{'ready'})['bytes']>0
            assert post(pair,'delete')==200 and request('/'+pair+'/status')[0]==404
            # A second job queued behind a busy worker must acknowledge pause immediately.
            release=threading.Event()
            server.POOL.submit(release.wait,5)
            try:
                queued=upload(data)
                assert post(queued,'pause')==200
                assert state(queued)['state']=='paused'
            finally:release.set()
            # Simulate a previous process persisting a pending pause or choice.
            server.save(queued,state='queued',pause_requested=True)
            server.restore_jobs()
            assert state(queued)['state']=='paused'
            print('PASS queued cancellation, persisted pause on restart')
            print('PASS duplicate upload, pause/resume, in-flight retry, terminal pause, MP4 decoding, 86 frames, range download, silent re-export, versioned choice, expiry/missing response')
        finally:
            http.shutdown();http.server_close();server.POOL.shutdown(wait=True)

if __name__=='__main__':main()
