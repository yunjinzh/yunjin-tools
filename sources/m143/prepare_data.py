import json,re,hashlib,shutil
from pathlib import Path
root=Path(__file__).parent
order=['A26','A07','A08','A10','A12','A16','A15','A19','A20']
inputs=[json.loads((root/'source-data'/(k+'.json')).read_text()) for k in 'abc']
extras=[json.loads((root/'source-data'/('expansion_'+k+'.json')).read_text()) for k in 'abcd']
departments=sorted([d for p in inputs for d in p['departments'] if d['id'] in order],key=lambda d:order.index(d['id']))
# Citation-only leads do not qualify for the on-site full-text library.
removed_numbers={'教材厅〔2026〕1号','教语信司函〔2026〕1号','教学厅〔2026〕1号','教外厅函〔2026〕1号'}
original=[d for p in inputs for d in p['documents'] if d['departmentId'] in order and d['number'] not in removed_numbers]
documents=original+[d for p in extras for d in p['documents'] if d['departmentId'] in order]
# Retain the current and preceding two calendar years, by document date.
collection_start,collection_end=2024,2026
documents=[d for d in documents if f'{collection_start}-01-01' <= d.get('date','') <= f'{collection_end}-12-31']
departments=[d for d in departments if any(x['departmentId']==d['id'] for x in documents)]
short={'A15':'高校学生司（就业服务司）','A20':'国际合作与交流司'}
full={'A15':'高校学生司（高校毕业生就业服务司）','A20':'国际合作与交流司（港澳台办公室）'}
for d in departments:
 d['name']=full.get(d['id'],d['name']);d['shortName']=short.get(d['id'],d['name'])
 d['url']='https://www.moe.gov.cn/s78/'+d['id']+'/'
 d.pop('searches',None);d.pop('note',None);d.pop('status',None)
files=root/'dist'/'files';files.mkdir(exist_ok=True)
map_path=root/'source-data'/'local-asset-map.json'
asset_map=json.loads(map_path.read_text()) if map_path.exists() else {}
def local_copy(path):
 if not path:return None
 p=Path(path)
 if not p.is_absolute():p=root/p
 if not p.exists():
  cached=asset_map.get(str(path))
  return cached if cached and (root/'dist'/cached).is_file() else None
 if p.suffix.lower() not in ['.pdf','.doc','.docx','.xlsx','.xls','.txt']:return None
 name=hashlib.sha256(p.read_bytes()).hexdigest()[:12]+p.suffix.lower()
 dest=files/name
 if not dest.exists():shutil.copy2(p,dest)
 asset_map[str(path)]='files/'+name
 return 'files/'+name
for d in documents:
 d['id']='doc-'+d['departmentId'].lower()+'-'+hashlib.sha256(d['number'].encode()).hexdigest()[:8]
 n=re.split(r'[〔\[（(]',d['number'])[0]
 d['series']='其他' if '司函' in n or n.startswith('学位') else '厅函' if '厅函' in n else '厅文' if '厅' in n else '部函' if n.endswith('函') else '部文'
 m=re.search(r'(20\d{2})',d['number']);d['year']=int(m.group(1)) if m else int(d['date'][:4])
 d['isFirst']=bool(re.fullmatch(r'.+〔2026〕1号',d['number']))
 d['collection']='first' if d['isFirst'] else 'topic'
 t=d['title']
 d['nature']='行政批复' if '批复' in t else '人事任免' if '任职' in t else '名单与表彰' if any(s in t for s in ['获奖','奖励的决定','名单']) else '标准与规范' if any(s in t for s in ['标准','规范','管理办法','管理规定','底线要求']) else '改革与指导' if any(s in t for s in ['意见','改革','行动计划','行动方案','领航行动','指南']) else '工作部署'
 for k in ['points','tags','attachments']:d.setdefault(k,[])
 d['sourceClass']='ministry' if d['verification']=='official' else 'reprint'
 d['sourceLabel']='教育部官方原文' if d['sourceClass']=='ministry' else '其他官方公开原件'
 d['checkedAt']='2026-11-17'
 assert d['body'].strip() and len(d['body'])>100,d['number']
 assert d.get('summary') and d['points'] and d.get('date'),d['number']
 if d.get('index'):assert d['index'][3:6]==d['departmentId'],d['number']
 d['localOriginalURL']=local_copy(d.get('localOriginalPath'))
 d['localPreviewURL']=local_copy(d.get('localPreviewPath'))
 if d['number']=='教高〔2026〕1号':d['localOriginalURL']=local_copy('/workspace/research/b-gao1.pdf')
 if d['number']=='教高厅函〔2026〕1号':d['localOriginalURL']=local_copy('/workspace/research/b-gaoting1.pdf')
 for a in d['attachments']:
  a['localURL']=local_copy(a.get('localOriginalPath') or a.get('localPath'))
  a['localPreviewURL']=local_copy(a.get('localPreviewPath'))
  for k in ['localPath','localOriginalPath','localPreviewPath','localTextPath']:a.pop(k,None)
 for k in ['localOriginalPath','localPreviewPath','localTextPath','localHtmlPath','mainBody']:d.pop(k,None)
 if d['sourceClass']=='reprint':
  d['verificationNote']=d.get('verificationNote','').replace('正文为PDF文字提取，版式以PDF为准。','正文为公开原件文字提取，版式可在站内原件预览中核对。')
 # Topics are editorial filters; the full text remains unmodified.
 tags=' '.join(d['tags'])
 d['topics']=[topic for topic,terms in {
  '产教融合':['产教融合','市域联合体','行业共同体','现代产业学院'],
  '数字教材':['数字教材','新形态教材','规划教材'],
  '校企合作':['校企合作','产学合作','产学研','现代学徒制','供需对接','实习管理'],
  '虚拟仿真':['虚拟仿真'],
  '教育数字化':['教育数字化','数字校园','智慧校园','数字资源','数字教育资源','教学资源库','数字中文','教师数字'],
  '人工智能':['人工智能']}.items() if any(term in tags for term in terms)]
assert len(departments)>0
assert all(collection_start <= int(d['date'][:4]) <= collection_end for d in documents)
assert len(set(d['number'] for d in documents))==len(documents)
assert set(d['departmentId'] for d in documents)=={d['id'] for d in departments}
used_files={u for d in documents for u in [d.get('localOriginalURL'),d.get('localPreviewURL')]+[a.get('localURL') for a in d['attachments']]+[a.get('localPreviewURL') for a in d['attachments']] }
for p in files.iterdir():
 if re.fullmatch(r'[a-f0-9]{12}\.(pdf|docx?|xlsx?|txt)',p.name) and 'files/'+p.name not in used_files:
  p.unlink()
map_path.write_text(json.dumps(asset_map,ensure_ascii=False,indent=2))
data={'checkedAt':'2026-11-17','collectionWindow':{'startYear':collection_start,'endYear':collection_end,'basis':'成文日期'},'departments':departments,'documents':documents}
(root/'dist'/'data.js').write_text('window.POLICY_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
(root/'dist'/'index-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print(json.dumps({'departments':len(departments),'documents':len(documents),'first':sum(d['isFirst'] for d in documents),'topics':sum(not d['isFirst'] for d in documents),'onsiteText':len(documents),'localFiles':len(list(files.iterdir()))},ensure_ascii=False))
