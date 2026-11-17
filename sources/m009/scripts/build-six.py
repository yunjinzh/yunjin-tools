"""Compile six source-backed curricula. Book 4 IDs and legacy state remain stable."""
from pathlib import Path
import json,runpy,sys
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';sys.path.insert(0,str(ROOT/'scripts'))
META={
1:('勇敢开口的第一步','认识自己和身边的世界','短句启蒙','🌱','#dfefdf','从问候、物品和动作开始，把一句话说清楚。'),
2:('把小句子连起来','用英语聊聊我的生活','日常表达','☀️','#eee6ff','读懂日常生活中的小故事，试着多说一句。'),
3:('跟着线索读故事','和探险家一起发现答案','故事探索','🧭','#fbe5d3','发现故事里的关键线索，把先后顺序讲明白。'),
4:('读懂一场小探险','让每段阅读都有回响','阅读进阶','🗺️','#deebfa','听懂、读懂，也能说出故事为什么这样发展。'),
5:('带着问题去旅行','走进奇妙的时空故事','段落理解','🚀','#fff0c8','连接细节与主旨，练习有原因、有结果的表达。'),
6:('思考，然后说出来','让英语成为表达的工具','思辨表达','🔭','#e8e2f8','比较、推理和表达观点，把理解变成自己的话。')}
books=[]
for n in range(1,7):
 if '--only4' in sys.argv and n!=4:continue
 selected=next((a.split('=',1)[1] for a in sys.argv if a.startswith('--books=')),None)
 if selected and str(n) not in selected.split(','):continue
 if n==4:
  text=(DIST/'course-data.js').read_text();d=json.loads(text.split('=',1)[1].strip().rstrip(';'))
  d.update(number=4,bookSummary='听一句，懂一句，把寻宝故事讲清楚',storyGuide='跟着 Ben 和 Lucy 寻宝',teacherAvailable=True,pageMin=2,pageMax=127,pageBase='pages',grammarAppendix=True,finalPrompt='Ben 和 Lucy 得到地图，收集六句诗，最终在灯塔找到宝藏。试着用自己的话说清主要经过，再说说他们为什么把宝藏交给博物馆。')
 else:
  f=ROOT/f'scripts/books/book{n}.py'
  if not f.exists():
   if '--partial' in sys.argv:continue
   raise FileNotFoundError(f)
  d=runpy.run_path(str(f))['BOOK']
 d['shortLabel']=META[n][1]
 d['storyHint']='认识伙伴，讲清小故事' if n<=2 else '跟着探险家发现线索' if n<=4 else '跟着伙伴穿越时空'
 d.update(version=2,number=n,storageKey=f'storysprout:super-minds-{n}-v2',draftMin=6 if n<=2 else 15)
 d.setdefault('edition','Cambridge University Press · 用户提供版本')
 d.setdefault('glossary',[])
 d.setdefault('audioNote','电脑语音合成，不是教材 CD 原声；录音回听与朗读打卡不提供自动发音评分。')
 for u in d['units']:
  u.setdefault('extra',[])
  for area in ['story','reading','world']:
   for i,s in enumerate(u[area]['sentences']):s['id']=f"u{u['id']}-{area}-s{i}"
   for i,q in enumerate(u[area]['questions']):q['id']=f"u{u['id']}-{area}-q{i}"
  for gi,g in enumerate(u['grammar']):
   for qi,q in enumerate(g['questions']):q.update(id=f"u{u['id']}-g{gi}-q{qi}",kind='grammar')
  for i,q in enumerate(u['phonics']['questions']):q.update(id=f"u{u['id']}-ph-q{i}",kind='phonics')
  u['questions']=[q for g in u['grammar'] for q in g['questions']]+u['story']['questions']+u['reading']['questions']+u['world']['questions']+u['phonics']['questions']
  for q in u['questions']:q.setdefault('kind','meaning')
  if 'dialogue' in u['song']['title'].lower() or 'functional' in u['song']['title'].lower():u['song']['type']='dialogue'
  assert len(u['grammar'])==2 and all(len(g['questions'])==2 for g in u['grammar']), (n,u['id'],'grammar')
  assert len(u['create']['tasks'])==3,(n,u['id'],'create tasks')
  for q in u['questions']:assert len(q['options'])>=3 and len(set(q['options']))==len(q['options']) and 0<=q['answer']<len(q['options']),(n,u['id'],q)
 assert [u['id'] for u in d['units']]==list(range(10)),n
 out=DIST/f'books/{n}';out.mkdir(parents=True,exist_ok=True)
 (out/'course-data.js').write_text('window.STORYSPROUT_BOOKS=window.STORYSPROUT_BOOKS||{};\nwindow.STORYSPROUT_BOOKS['+str(n)+']='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
 title,subtitle,stage,icon,color,desc=META[n]
 c=dict(number=n,title=title,subtitle=subtitle,stage=stage,icon=icon,color=color,description=desc,units=len(d['units']),missions=len(d['units'])*8,words=sum(len(u['vocab']) for u in d['units']),cards=sum(len(u[a]['sentences']) for u in d['units'] for a in ['story','reading','world']),questions=sum(len(u['questions']) for u in d['units']),pages=d['pageMax']-d['pageMin']+1)
 books.append(c)
 print('Book',n,'units',c['units'],'words',c['words'],'cards',c['cards'],'base questions',c['questions'])
(DIST/'catalog.js').write_text('window.BOOK_CATALOG='+json.dumps(books,ensure_ascii=False,separators=(',',':'))+';\n')
