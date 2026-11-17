import json, zipfile
from pathlib import Path
r=Path(__file__).parent/'dist'
out=r.parent.parent/'诗画有声_离线阅读版.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in r.rglob('*'):
  if p.is_file() and not p.name.endswith('-original.png'):
   if p.name=='poems.js':
    d=json.loads(p.read_text()[13:-1])
    for x in d:x['original']=x['image']
    z.writestr('诗画有声/poems.js','window.POEMS='+json.dumps(d,ensure_ascii=False)+';')
   else:z.write(p,'诗画有声/'+str(p.relative_to(r)))
 z.writestr('诗画有声/使用说明.txt','诗画有声 · 离线阅读版\n解压整个文件夹后，用浏览器打开 index.html。请保留 assets 文件夹。\n收录52首诗词、逐字带调拼音、原文、原创浅显讲解与优化阅读图。高清原图请在在线版放大查看。\n拼音默认开启，可用诗句上方“拼音”按钮切换；“复制原文”不含拼音，语音也只朗读原文。\n完整内置104段ListenHub暮歌AI配音：每诗朗读和讲解各一段，解压后无需联网即可播放，也无需系统中文声线。请保留assets/audio目录全部MP3文件。\n离线文件的收藏、拼音偏好和阅读位置保存能力因浏览器而异。\n本包不含PDF；PDF单独提供。')
assert out.stat().st_size<50*1024*1024
print(out, out.stat().st_size)
