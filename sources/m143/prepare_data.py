import json,re,hashlib
from pathlib import Path
root=Path(__file__).parent
order=['A01','A02','A03','A27','A04','A05','A26','A06','A29','A07','A08','A11','A09','A10','A17','A12','A13','A16','A15','A22','A18','A19','A20','A28','A21','A24','A23']
inputs=[json.load(open(root/'source-data'/(k+'.json'))) for k in 'abc']
departments=sorted([d for p in inputs for d in p['departments']],key=lambda d:order.index(d['id']))
documents=[d for p in inputs for d in p['documents']]
short={'A15':'高校学生司（就业服务司）','A22':'学位管理与研究生教育司','A20':'国际合作与交流司','A23':'教科文组织全国委秘书处'}
full={'A15':'高校学生司（高校毕业生就业服务司）','A22':'学位管理与研究生教育司（国务院学位委员会办公室）','A20':'国际合作与交流司（港澳台办公室）','A23':'中华人民共和国联合国教科文组织全国委员会秘书处'}
for d in departments:
 d['name']=full.get(d['id'],d['name'])
 d['shortName']=short.get(d['id'],d['name'])
 d['url']='https://www.moe.gov.cn/s78/'+d['id']+'/'
 ds=[x for x in documents if x['departmentId']==d['id']]
 d['status']='official' if any(x['verification']=='official' for x in ds) else 'lead' if ds else 'missing'
for d in documents:
 d['id']='doc-'+d['departmentId'].lower()+'-'+hashlib.sha256(d['number'].encode()).hexdigest()[:8]
 n=d['number'].split('〔')[0]
 d['series']='其他' if '司函' in n or n.startswith('学位') else '厅函' if '厅函' in n else '厅文' if '厅' in n else '部函' if n.endswith('函') else '部文'
 t=d['title']
 d['nature']='行政批复' if '批复' in t else '人事任免' if '任职' in t else '名单与表彰' if any(s in t for s in ['获奖','奖励的决定','名单']) else '标准与规范' if any(s in t for s in ['标准','底线要求']) else '改革与指导' if any(s in t for s in ['意见','改革','行动计划','行动方案','领航行动']) else '工作部署'
 if d['departmentId']=='A26' and d['verification']=='lead':
  d['body']=''
 for k in ['points','tags','attachments']:
  d.setdefault(k,[])
 assert re.fullmatch(r'.+〔2026〕1号',d['number']),d['number']
 if d['verification']=='official':
  assert 'moe.gov.cn/' in d['url'] and d['index'][3:6]==d['departmentId'],d['number']
  assert d['body'] and d['date'],d['number']
 d['checkedAt']='2026-11-17'
 assert d.get('summary') and d['points'],d['number']
assert len(departments)==27 and len(set(d['id'] for d in departments))==27
assert len(set(d['number'] for d in documents))==len(documents)
assert len(set(d['id'] for d in documents))==len(documents)
data={'checkedAt':'2026-11-17','departments':departments,'documents':documents,'exclusions':[x for p in inputs for x in p.get('exclusions',[])]}
(root/'dist'/'data.js').write_text('window.POLICY_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
(root/'dist'/'index-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print(json.dumps({'departments':len(departments),'documents':len(documents),'official':sum(d['verification']=='official' for d in documents),'lead':sum(d['verification']=='lead' for d in documents),'covered':sum(d['status']=='official' for d in departments),'missing':sum(d['status']=='missing' for d in departments)},ensure_ascii=False))
