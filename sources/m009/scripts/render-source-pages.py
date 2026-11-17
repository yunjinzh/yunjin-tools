"""Render uploaded Student's Book scans; the PDFs themselves are never published.
Usage: python scripts/render-source-pages.py /path/to/upload
"""
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor,as_completed
import sys,fitz
ROOT=Path(__file__).resolve().parents[1]
# 1-based PDF page = printed page + offset. Confirmed from contents + numbered pages.
OFFSETS={1:-1,2:1,3:2,5:0,6:0}
def task(arg):
 n,source,p=arg;out=ROOT/f'dist/books/{n}/pages';out.mkdir(parents=True,exist_ok=True);target=out/f'{p:03d}.webp'
 if target.exists():return target.stat().st_size
 d=fitz.open(source);pix=d[p+OFFSETS[n]-1].get_pixmap(matrix=fitz.Matrix(1.8,1.8),colorspace=fitz.csRGB)
 pix.pil_save(target,format='WEBP',quality=80,method=4)
 return target.stat().st_size
if __name__=='__main__':
 src=Path(sys.argv[1]);jobs=[]
 for n in OFFSETS:
  source=next(f for f in src.glob('*.pdf') if ('Level 1 Student' in f.name if n==1 else f'Super Minds {n}.' in f.name and 'tudent' in f.name))
  jobs.extend((n,str(source),p) for p in range(2,129 if n in [1,2] else 128))
 with ProcessPoolExecutor(max_workers=5) as pool:
  total=sum(f.result() for f in as_completed([pool.submit(task,j) for j in jobs]))
 print(f'Checked/rendered {len(jobs)} pages; {total:,} bytes. Book 4 original images stay in dist/pages.')
