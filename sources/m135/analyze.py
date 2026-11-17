import openpyxl, glob, json, re, unicodedata, collections, pathlib, hashlib
ROOT=pathlib.Path(__file__).parent
IN=ROOT/'sources'
def norm(x): return re.sub(r'\s+','',unicodedata.normalize('NFKC',str(x or '')))
def val(x): return str(x).strip() if x is not None else ''
topics=[
 ('人工智能','人工智能|大模型|生成式|机器学习|深度学习|强化学习|神经网络|智能体|多智能体|具身智能|(?<![a-zA-Z])(?:AI|GenAI)(?![a-zA-Z])|artificial intelligence|machine learning|deep learning'),
 ('数字孪生与仿真','数字孪生|虚拟仿真|仿真|虚实融合|虚实交互|digital twin|simulation'),
 ('空间信息与遥感','遥感|地理信息|时空数据|空间信息|空间智能|三维重建|实景三维|GIS|GNSS|点云|remote sensing'),
 ('机器人与自主系统','机器人|无人机|无人系统|无人驾驶|自动驾驶|自主系统|具身智能|robot'),
 ('生态环境与资源','生态|环境治理|生态修复|耕地|土地整治|土地利用|水资源|碳中和|碳排放|双碳|生物多样性'),
 ('教育与人才','教育|教学|人才培养|产教融合|职业院校|职业本科|课程|教材'),
 ('文化与文旅','文旅|旅游|文化遗产|非遗|博物馆|文化数字化|文化产业'),
 ('健康与生命','疾病|肿瘤|癌|免疫|细胞|基因|蛋白|糖尿病|阿尔茨海默|健康|医疗|医学|临床|心血管|脑卒中'),
 ('产业与治理','产业链|供应链|新质生产力|数字经济|公共治理|社会治理|城市治理|数据治理|数字治理|企业|营商环境'),
 ('能源与材料','能源|电池|光伏|储能|氢能|催化|材料|合金|半导体|电极|燃料电池')]
patterns=[re.compile(p,re.I) for _,p in topics]
sources=[]; records=[]; dup=[]
paths=[next(IN.glob('2024*')), next(IN.glob('2025年*')),next(IN.glob('2025国*')),next(IN.glob('2026*'))]
for sid,f in enumerate(paths):
 w=openpyxl.load_workbook(f,read_only=True,data_only=True); raw=0; removed=0; sheets=[]; seen={}
 for s in w:
  rows=list(s.values); head=3 if sid==3 else 1
  if not rows: sheets.append({'name':s.title,'count':0}); continue
  count=0
  for rowno,r in enumerate(rows[head:],head+1):
   if not any(v is not None for v in r):continue
   raw+=1; count+=1
   if sid<2: y,cat,seq,disc,title,person,org,code,att,page,url=r; money=None; extra=''
   elif sid==2: title,person,org=r; y=2025; cat=disc=code=att=page=url=extra='';money=None
   else: seq,title,cat,y,person,org,money,disc,code,school,unit=r; att=page=url='';extra={'原资助金额':money,'985/211归属学校':school,'所属学院/发布单位':unit}
   title=val(title); person=val(person); org=val(org); cat=val(cat); disc=val(disc); code=val(code)
   known=bool(title and title not in ['本项目名称未公开','未知','未公开','未披露','项目名称未公开'])
   key=('id',norm(code)) if code else ('triple',norm(title),norm(person),norm(org)) if known and person and org else ('row',s.title,rowno)
   if key in seen: removed+=1; dup.append({'source':sid,'sheet':s.title,'row':rowno,'kept':seen[key],'title':title});continue
   seen[key]=[s.title,rowno]
   amt=float(money) if isinstance(money,(int,float)) else None
   # Original discipline labels retained; selected legacy labels are analytic alignment only.
   dc={'马列·科社':'马克思主义理论','党史·党建':'中共党史党建学','图书馆·情报与文献学':'信息资源管理与文献学','体育学':'体育学与健康管理'}.get(disc,disc)
   tags=[i for i,p in enumerate(patterns) if known and p.search(title)]
   # compact schema documented in meta; raw values preserved except null-to-empty display.
   records.append([sid,title,person,org,norm(org),cat,unicodedata.normalize('NFKC',cat),disc,dc,code,amt,s.title,rowno,att,page,url,tags,known,extra])
  sheets.append({'name':s.title,'count':count})
 sources.append({'name':f.name,'year':2024 if sid==0 else 2026 if sid==3 else 2025,'fund':'社科基金' if sid<2 else '国自然','raw':raw,'removed':removed,'sheets':sheets,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
for sid,src in enumerate(sources):
 rs=[r for r in records if r[0]==sid]; n=len(rs); am=[r[10] for r in rs if r[10] is not None]
 src.update(count=n,known=sum(r[17] for r in rs),orgs=len({r[4] for r in rs if r[4]}),amountCount=len(am),amount=sum(am),codes=sum(bool(r[9]) for r in rs),disciplineCount=sum(bool(r[7]) for r in rs),personCount=sum(bool(r[2]) for r in rs),orgCount=sum(bool(r[3]) for r in rs),categoryCount=sum(bool(r[5]) for r in rs))
meta={'sources':sources,'topics':[{'name':n,'pattern':p} for n,p in topics],'duplicates':dup,'columns':['source','title','person','org','orgKey','categoryRaw','category','disciplineRaw','discipline','code','amount','sheet','row','sourceAttachment','sourcePage','url','topics','knownTitle','extra'],'analysisDate':'2026-11-09'}
(ROOT/'data.json').write_text(json.dumps({'meta':meta,'rows':records},ensure_ascii=False,separators=(',',':')))
print(json.dumps(sources,ensure_ascii=False,indent=2))
for sid in range(4):
 rs=[r for r in records if r[0]==sid]
 print('SOURCE',sid,'Top institutions',collections.Counter(r[4] for r in rs if r[4]).most_common(10))
 print('Categories',collections.Counter(r[6] for r in rs))
 print('Topics',[(n,sum(i in r[16] for r in rs)) for i,(n,_) in enumerate(topics)])
print('DUPLICATES',len(dup),dup[:5])
