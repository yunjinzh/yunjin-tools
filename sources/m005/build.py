import pathlib,json
p=pathlib.Path(__file__).parent
d=json.loads((p/'data.json').read_text())
# 领域间使用有业务依据的建议前置，避免人为串成单一长链。
first={'A21':['A11'],'A31':['A24'],'A41':['A13','A21'],'A51':['A33','A44'],'A61':['A24','A34'],'A71':['A54'],'A81':['A64','A74']}
for n in d['nodes']:
 if n['id'] in first:n['prerequisites']=first[n['id']]
d['edges']=[e for e in d['edges'] if not(e['type']=='前置' and e['target'] in first)]
for b,aa in first.items():
 for a in aa:d['edges'].append({'source':a,'target':b,'type':'前置'})
(p/'data.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
html=(p/'shell.html').read_text().replace('/*STYLE*/',(p/'style.css').read_text()).replace('/*DATA*/',json.dumps(d,ensure_ascii=False).replace('<','\\u003c')).replace('/*APP*/',(p/'app.js').read_text())
# 以实际数据统计替换呈现计数。
html=html.replace('386 关系',f"{len(d['edges'])} 关系").replace('386条关系',f"{len(d['edges'])}条关系")
(p/'dist/index.html').write_text(html)
(p/'dist/cim-atlas-offline.html').write_text(html)
print('Built',len(html.encode()),'bytes;',len(d['nodes']),'nodes;',len(d['edges']),'edges')
