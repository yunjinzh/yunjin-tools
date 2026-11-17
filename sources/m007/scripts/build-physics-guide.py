from pathlib import Path
import json,html
root=Path(__file__).resolve().parent.parent
r=json.loads((root/'reports/physics-results.json').read_text())
rows=[]
for kind,label in [('cup','咖啡杯 0.35 kg'),('box','物流箱 0.50 kg')]:
    runs=[v for v in r['results'] if v.get('kind')==kind and 'reproducible' in v['id']]
    get=lambda key:max(v['metrics'][key] or 0 for v in runs)
    rows.append(f'<tr><td>{label}</td><td>{len(runs)} / {len(runs)}</td><td>{get("maxPenetration")*1000:.3f} mm</td><td>{get("maxSlip")*1000:.3f} mm</td><td>{get("positionError")*1000:.3f} mm</td><td>{get("maxSpeed"):.4f} m/s</td></tr>')
table='<table><thead><tr><th>任务</th><th>通过 / 总数</th><th>最大穿透</th><th>最大滑移</th><th>最大放置误差</th><th>最大速度</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'
ccd=next(v for v in r['results'] if v['id']=='ccd-thin-wall-80mps')
table+=f'<p>CCD 对照：墙面中心 x=0；启用时球心 x={ccd["enabledX"]:.6f} m，未越墙；关闭时 x={ccd["disabledX"]:.6f} m，已穿越。这是数值碰撞压力测试，不是机器人允许的执行速度。</p>'
text=(root/'physics/guide.html').read_text().replace('__PHYSICS_COUNT__',str(r['passed'])).replace('__ACTUAL_RESULTS__',table)
(root/'dist/physics-guide.html').write_text(text)
print('Technical implementation and verification guide generated')
