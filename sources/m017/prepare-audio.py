import hashlib,json,shutil
from pathlib import Path
root=Path(__file__).parent
src=root.parent/'recorded-audio'
manifest=json.loads((src/'manifest.json').read_text())
assert manifest['complete'] and manifest['completed']==104
poems=json.loads((root.parent/'poems.json').read_text())
expected={(p['id'],k) for p in poems for k in ('recitation','explanation')}
assert {(x['poem_id'],x['kind']) for x in manifest['items']}==expected
assert len(manifest['items'])==104
out=root/'dist/assets/audio';out.mkdir(parents=True,exist_ok=True)
mapping={}
for x in manifest['items']:
 filename=f"{x['poem_id']}-{x['kind']}.mp3"
 assert x['file']=='assets/audio/'+filename
 audio=src/x['file'];assert hashlib.sha256(audio.read_bytes()).hexdigest()==x['audio_sha256']
 shutil.copy2(audio,out/filename)
 mapping.setdefault(x['poem_id'],{})[x['kind']]={'src':x['file'],'duration':x['duration_seconds']}
(root/'dist/audio-manifest.js').write_text('window.RECORDED_AUDIO='+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+';')
print('Verified and copied 104 MP3s:',sum(x['bytes'] for x in manifest['items']),'bytes')
