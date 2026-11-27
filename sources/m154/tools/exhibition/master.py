"""Master the five exhibition clips with restrained Chinese chapter captions and chapter metadata."""
from pathlib import Path
import sys,json,subprocess,tempfile
from PIL import Image,ImageDraw,ImageFont
sys.dont_write_bytecode=True
from credits import content,slate
root=Path(__file__).resolve().parents[2]
clips=root/'dist/exhibit'
rows=json.loads((clips/'chapters.json').read_text())
out=Path(sys.argv[1]).resolve()
out.parent.mkdir(parents=True,exist_ok=True)
serif=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',52,index=2)
small=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',20,index=2)
en=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',19)
with tempfile.TemporaryDirectory(prefix='jingguan-master-') as tmp:
 t=Path(tmp);names=[];meta=[';FFMETADATA1','title=京观 · 北京城市空间展','artist=京观','comment=城市几何展映 · 光照和镜头为模拟。'];elapsed=0
 for c in rows:
  src=clips/(c['id']+'.mp4');name=t/(c['id']+'.mp4');overlay=t/(c['id']+'.png')
  panel=Image.new('RGBA',(780,144))
  mask=ImageDraw.Draw(panel)
  for x in range(780):
   a=int(135*(1-x/780)**1.6);mask.line((x,0,x,144),fill=(16,26,24,a))
  mask.rectangle((38,19,41,121),fill=(213,184,137,240))
  mask.text((62,13),c['district']+'    '+c['time']+'   模拟日照',font=small,fill=(230,215,182,255),stroke_width=1,stroke_fill=(22,31,25,130))
  mask.text((59,42),c['name'],font=serif,fill=(246,241,224,255),stroke_width=1,stroke_fill=(22,31,25,170))
  mask.text((63,112),c['en'].upper(),font=en,fill=(229,212,182,255),stroke_width=1,stroke_fill=(22,31,25,138))
  panel.save(overlay)
  vf="[1:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.9:d=.65:alpha=1[label];[0:v][label]overlay=0:H-h-58:shortest=1"
  # Preserve each source clip's exact frame count with a constant-rate overlay.
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-loop','1','-framerate','24','-i',str(overlay),'-filter_complex_threads','1','-filter_complex',vf.replace('d=.65','d=0.65'),'-t',str(c['duration']),'-an','-c:v','libx264','-crf','17','-preset','veryfast','-threads','2','-pix_fmt','yuv420p',str(name)],check=True)
  names.append(f"file '{name}'")
  meta.extend(['[CHAPTER]','TIMEBASE=1/1000',f'START={elapsed}',f"END={elapsed+c['duration']*1000}",'title='+c['name']]);elapsed+=c['duration']*1000
 # All source references also travel inside the freestanding MP4.
 detail=content().replace('\\','\\\\').replace(';','\\;').replace('#','\\#').replace('=','\\=').replace('\n','  ')
 meta.insert(4,'description='+detail)
 slate(t/'end.png');end=t/'end.mp4'
 subprocess.run(['ffmpeg','-loglevel','error','-y','-loop','1','-framerate','24','-i',str(t/'end.png'),'-t','6','-vf','format=yuv420p','-an','-c:v','libx264','-preset','veryfast','-crf','17','-threads','2',str(end)],check=True)
 names.append(f"file '{end}'");meta.extend(['[CHAPTER]','TIMEBASE=1/1000',f'START={elapsed}',f'END={elapsed+6000}','title=数据与影像'])
 (t/'list.txt').write_text('\n'.join(names));(t/'chapters.ffmeta').write_text('\n'.join(meta)+'\n')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(t/'list.txt'),'-f','ffmetadata','-i',str(t/'chapters.ffmeta'),'-map','0:v','-map_metadata','1','-map_chapters','1','-c','copy','-movflags','+faststart',str(out)],check=True)
