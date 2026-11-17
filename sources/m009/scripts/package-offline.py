"""Package one complete, self-contained local course per book, below hosting limits."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
ONLINE='https://storysprout-reading-a762.yunjinzh.chatgpt.site'
common=['book.html','book-loader.js','course-app.js','course-core.js','course.css']
summary=[]
for n in range(1,7):
 datafile=DIST/f'books/{n}/course-data.js';d=json.loads(datafile.read_text().split(f'BOOKS[{n}]=',1)[1].strip().rstrip(';'))
 words=sum(len(u['vocab']) for u in d['units']);cards=sum(len(u[a]['sentences']) for u in d['units'] for a in ['story','reading','world'])
 guide=f'''故事芽 · Super Minds 第 {n} 册完整离线学习包

1. 完整解压 ZIP，保留所有文件夹与文件，不要删除图片。
2. 用浏览器打开最外层 index.html，即可进入第 {n} 册课程地图。
3. 本包包含这一册的入门 + 9 单元，80 个任务，{words} 个词语练习项，{cards} 张双语阅读卡。
4. 听读 → 看中文解释 → 自己读 → 回答理解题 → 用自己的话讲清楚。
5. 原页书架收录学生用书印刷 p.{d['pageMin']}–{d['pageMax']}，可以放大和翻页。
6. 首页品牌入口可联网返回六册总书架；其余五册请分别下载。
{('7. 金猫完整精读在 cat/index.html；cat/offline.html 是独立单文件版。' if n==4 else '')}

内容是核心选读与教学改写，不是每页练习、歌曲与听力的逐字复制；新编部分有标注。
电脑朗读不是教材 CD 原声。离线声音是否可用，取决于设备预装的语音。
录音需要浏览器支持和权限；无法录音时可口头复述。录音在本机暂存，刷新前请下载。
录音和自读打卡均不自动评分。进度保存在当前浏览器，不自动同步。
在家长陪学里可导出本册进度，在在线总书架可导入单册或六册备份。
文件位置或浏览器改变时，原记录可能不可见；请先备份。

在线六册书架：{ONLINE}
第 {n} 册在线直达：{ONLINE}/book.html?book={n}

素材依据：用户提供的 Super Minds Student’s Book。
{('另参考所提供的 Teacher’s Book。' if d['teacherAvailable'] else '本册未提供 Teacher’s Book；依据学生用书编写。')}
仅用于用户的私人学习。
'''
 output=DIST/f'storysprout-super-minds-{n}.zip';base=d['pageBase']
 with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=6) as z:
  z.writestr('START-HERE.txt',guide)
  z.writestr('index.html',(DIST/'book.html').read_text())
  z.writestr('offline-env.js',f'window.OFFLINE_BOOK={n};\n')
  for f in common:z.write(DIST/f,f)
  z.write(datafile,datafile.relative_to(DIST))
  for p in sorted((DIST/base).glob('*.webp')):z.write(p,p.relative_to(DIST))
  if n==4:
   for p in sorted((DIST/'cat').rglob('*')):
    if p.is_file():z.write(p,p.relative_to(DIST))
 size=output.stat().st_size
 assert size<25*1024*1024,(n,size,'single static asset limit')
 with ZipFile(output) as z:
  assert z.testzip() is None,n
  assert 'index.html' in z.namelist() and f'books/{n}/course-data.js' in z.namelist()
  pagecount=len([name for name in z.namelist() if name.startswith(base+'/') and name.endswith('.webp')]);assert pagecount==d['pageMax']-d['pageMin']+1,(n,pagecount)
 summary.append({'book':n,'bytes':size,'pages':pagecount,'files':len(z.namelist())})
 print(f'Book {n} ZIP verified: {size:,} bytes, {pagecount} source pages')
(DIST/'offline-guide.txt').write_text('故事芽六册课程：请下载相应的 storysprout-super-minds-N.zip，完整解压后打开 index.html。每册包内包含完整使用说明 START-HERE.txt。\n电脑朗读取决于设备语音，非教材原声。\n在线六册书架：'+ONLINE+'\n')
(ROOT/'qa').mkdir(exist_ok=True)
(ROOT/'qa/offline-packages.json').write_text(json.dumps(summary,indent=2))
