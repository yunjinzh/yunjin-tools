from pathlib import Path
import base64, html, json, re
from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
from fontTools import subset

ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'src'
ASSET=ROOT/'assets'
OUT=ROOT/'dist'
OUT.mkdir(exist_ok=True)
REPORT=ASSET/'original-report.docx'
SOURCES=json.loads((SRC/'sources.json').read_text())
MEDIA=json.loads((SRC/'multimedia_detail.json').read_text())
H=html.escape

def rich(text):
    text=H(text).replace('\n','<br>')
    return re.sub(r'\[([PCT]\d\d)\]',lambda m:f'<a class="source-tag" href="#source-{m[1]}" data-source="{m[1]}">[{m[1]}]</a>',text)

doc=Document(REPORT)
sections=[]
heading='报告导读与研究模型'
chunks=[]
original_text=[]
for el in doc.element.body:
    if el.tag==qn('w:p'):
        p=Paragraph(el,doc)
        # w:t also preserves hyperlink text, independent of python-docx version.
        txt=''.join(el.itertext()) if False else ''.join(t.text or '' for t in el.iter(qn('w:t')))
        if not txt.strip():continue
        original_text.append(txt)
        style=p.style.name if p.style else ''
        if style=='Heading 1':
            sections.append((heading,''.join(chunks)));heading=txt;chunks=[]
        elif style.startswith('Heading'):
            chunks.append(f'<h3>{rich(txt)}</h3>')
        elif style=='Title':chunks.append(f'<h3>{rich(txt)}</h3>')
        else:chunks.append(f'<p>{rich(txt)}</p>')
    elif el.tag==qn('w:tbl'):
        table=Table(el,doc);rows=[]
        for i,row in enumerate(table.rows):
            cells=[]
            for cell in row.cells:
                txt=cell.text;original_text.append(txt)
                tag='th' if i==0 else 'td';cells.append(f'<{tag}>{rich(txt)}</{tag}>')
            rows.append('<tr>'+''.join(cells)+'</tr>')
        chunks.append('<div class="table-scroll"><table>'+''.join(rows)+'</table></div>')
if chunks:sections.append((heading,''.join(chunks)))
for c in MEDIA['courses']:
    chunks=[f'<p>{H(c["scene"])} {H(c["ability"])}</p>']
    for m in c['modules']:
        chunks.append(f'<h3>{H(m["id"].upper())} {H(m["name"])} · {m["hours"]}学时</h3><p>任务：'+H('；'.join(m['tasks']))+'</p>')
        chunks.append('<table><tr><th>媒体形式</th><th>内容</th><th>规格</th></tr>'+''.join(f'<tr><td>{H(a["type"])}</td><td>{H(a["title"])}</td><td>{H(a["spec"])}</td></tr>' for a in m['media'])+'</table>')
        for k,label in [('interaction','学生操作'),('feedback','即时反馈'),('deliverable','交付成果'),('expectedEffect','预期能力'),('check','效果核验')]:chunks.append(f'<p><strong>{label}：</strong>{H(m[k])}</p>')
    sections.append(('新增细案 '+c['title']+'多媒体建设', ''.join(chunks)))
chunks=[]
for l in MEDIA['microLessons']:
    chunks.append(f'<h3>{H(l["title"])} · 40秒</h3><p>{H(l["setup"])}</p><table><tr><th>时间</th><th>画面</th><th>字幕与讲解</th><th>学生动作</th></tr>')
    for shot in l['shots']:chunks.append(f'<tr><td>{shot["start"]}—{shot["start"]+8}s</td><td>{H(shot["visual"])}</td><td>{H(shot["caption"])}<br>{H(shot["narration"])}</td><td>{H(shot["action"])}</td></tr>')
    chunks.append('</table>')
chunks.append('<h3>多媒体教材验收建议</h3><table><tr><th>维度</th><th>目标</th><th>方法</th></tr>'+''.join(f'<tr><td>{H(a["dimension"])}</td><td>{H(a["target"])}</td><td>{H(a["method"])}</td></tr>' for a in MEDIA['acceptance'])+'</table>')
sections.append(('新增附录 微课分镜与多媒体验收', ''.join(chunks)))
report_html=''.join(f'<details class="report-section" id="report-{i+1}" {"open" if i==0 else ""}><summary>{H(title)}</summary><div class="report-content">{body}</div></details>' for i,(title,body) in enumerate(sections))

def b64(path):return base64.b64encode(Path(path).read_bytes()).decode()

videos=[]
for course in ['cim','dt']:
    l=next(l for l in MEDIA['microLessons'] if l['course']==course)
    chapters=''.join(f'<button data-video="{course}" data-seek="{s["start"]}" title="{H(s["caption"])}">0:{s["start"]:02d}</button>' for s in l['shots'])
    transcript=''.join(f'<p><strong>{s["start"]:02d}—{s["start"]+8:02d}s</strong> {H(s["narration"])}</p>' for s in l['shots'])
    videos.append(f'''<article class="video-card"><video id="video-{course}" controls preload="metadata" playsinline poster="data:image/jpeg;base64,{b64(ASSET/(course+'-poster.jpg'))}" aria-label="{H(l['title'])}"><source src="data:video/mp4;base64,{b64(ASSET/(course+'-micro.mp4'))}" type="video/mp4">您的浏览器不支持此视频，请阅读下方文字稿。</video><div class="video-info"><span class="eyebrow">{course.upper()} / 00:40 / 原创字幕动画</span><h3>{H(l['title'])}</h3><p>{H(l['setup'])}</p><div class="shot-nav" aria-label="按镜头跳转">{chapters}</div><div class="actions"><button class="btn small" data-speak="{course}">朗读文字稿 ▷</button><button class="btn small" data-stop-speech>停止朗读</button></div><details style="margin-top:14px"><summary style="font-size:11px;cursor:pointer">阅读完整文字稿</summary>{transcript}</details></div></article>''')

core=(ROOT/'vendor/three.core.js').read_text()
three=(ROOT/'vendor/three.module.js').read_text().replace("'./three.core.js'","'three/core'")
orbit=(ROOT/'vendor/OrbitControls.js').read_text()
asdata=lambda s:'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
importmap=json.dumps({'imports':{'three/core':asdata(core),'three':asdata(three),'three/addons/controls/OrbitControls.js':asdata(orbit)}},separators=(',',':'))
template=(SRC/'template.html').read_text()
style=(SRC/'style.css').read_text().replace("'SimSun',serif","'SimSun','BookSans',serif")
style+='\n.table-scroll{overflow:auto}.scene canvas{display:block;width:100%;height:100%}.report-section[hidden]{display:none!important}.timeline-nav button strong,.timeline-nav button small{display:block}.policy-panel .year small{display:block;font:11px BookSans,sans-serif;margin-top:12px;color:var(--muted)}.rail-foot button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #b66a56;outline-offset:3px}.report-content p{overflow-wrap:anywhere}.report-content table a{font-size:10px}\n'
app=(SRC/'app.js').read_text()
threeapp=(SRC/'three-labs.js').read_text().replace('__SOFTWARE_RENDERER__',(SRC/'software-renderer.js').read_text())
# Embed a subset of the local Noto CJK font, so the offline document keeps Chinese glyphs.
alltext=template+app+threeapp+report_html+json.dumps(MEDIA,ensure_ascii=False)+json.dumps(SOURCES,ensure_ascii=False)
options=subset.Options();options.flavor='woff'
font=subset.load_font(str(ASSET/'Chinese.ttf'),options)
subsetter=subset.Subsetter(options=options);subsetter.populate(text=alltext);subsetter.subset(font)
subset.save_font(font,str(ASSET/'book-subset.woff'),options)
style="@font-face{font-family:BookSans;src:url(data:font/woff;base64,"+b64(ASSET/'book-subset.woff')+") format('woff');font-style:normal;font-weight:100 900;font-display:swap;}\n"+style
payload={'sources':SOURCES,'multimedia':MEDIA,'reportWord':b64(REPORT)}
replacements={'__STYLE__':style,'__IMPORTMAP__':importmap,'__VIDEOS__':''.join(videos),'__REPORT__':report_html,'__LICENSE__':H((ROOT/'vendor/THREE-LICENSE.txt').read_text()+'\n\n字体版权与许可\n'+(ROOT/'vendor/NOTO-OFL.txt').read_text()),'__DATA__':json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/'),'__APP__':app,'__THREE__':threeapp}
for marker,value in replacements.items():template=template.replace(marker,value)
if re.search(r'__[A-Z]+__',template):raise RuntimeError('Unreplaced marker')
(OUT/'index.html').write_text(template)
(ROOT/'README.md').write_text('''# 职业教育数字教材研究与设计\n\nCIM与数字孪生的政策、案例、教材策划、交互样章与原创字幕动画。\n\n静态发布入口：`dist/index.html`，资源与研究报告内嵌，可离线使用。\n\n源文件：`src/`；Three.js MIT依赖：`vendor/`；原创微课与字体子集：`assets/`。\n\n课程资源规模为策划建议。交互数值、对象与路径为教学合成数据，不用于实际工程决策。\n\n构建：使用含python-docx、fonttools的Python运行`src/build.py`。原报告快照见`assets/original-report.docx`。视频源脚本：`src/render_videos.py`，需要Pillow与FFmpeg。\n''')
print(json.dumps({'output':str(OUT/'index.html'),'bytes':(OUT/'index.html').stat().st_size,'report_sections':len(sections),'original_text_entries':len(original_text),'sources':len(SOURCES),'modules':sum(len(c['modules']) for c in MEDIA['courses']),'videos':len(videos)},ensure_ascii=False))
