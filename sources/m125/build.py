from pathlib import Path
import base64,re,json
root=Path(__file__).parent

def exports_object(names):
    out=[]
    for entry in names.split(','):
        bits=entry.strip().split(' as ')
        if not bits[0]:continue
        out.append(bits[1]+':'+bits[0] if len(bits)==2 else bits[0])
    return ','.join(out)
core=(root/'vendor/three.core.js').read_text()
core_export=re.search(r'^export \{ (.*?) \};',core,re.M).group(1)
core=re.sub(r'^export \{ .*? \};\s*','',core,flags=re.M)
web=(root/'vendor/three.module.js').read_text()
imports=re.search(r"^import \{ (.*?) \} from './three.core.js';",web,re.M).group(1)
web_export=re.findall(r'^export \{ (.*?) \};',web,re.M)[-1]
web=re.sub(r"^(?:import|export) \{ .*? \}(?: from './three.core.js')?;\s*",'',web,flags=re.M)
three='/* Three.js r180 — MIT; Copyright 2010-2025 Three.js Authors. */\nwindow.THREE=((core)=>{const {'+imports+'}=core;\n'+web+'\nreturn {...core,'+exports_object(web_export)+'};})((()=>{\n'+core+'\nreturn {'+exports_object(core_export)+'};})());'
(root/'vendor/three.embedded.js').write_text(three)
html=(root/'template.html').read_text().replace('<!--STYLE-->','<style>'+(root/'style.css').read_text()+'\n'+(root/'world.css').read_text()+'</style>')
script='\n'.join((root/p).read_text() for p in ['vendor/three.embedded.js','core.js','art.js','navigation.js','models3d.js','software3d.js','world3d.js','app.js'])
image='data:image/svg+xml;base64,'+base64.b64encode((root/'town.svg').read_bytes()).decode()
script=script.replace('src="town.svg"','src="'+image+'"')
script=script.replace('</script','<\\/script')
html=html.replace('<!--SCRIPT-->','<script>'+script+'</script>')
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print('Built self-contained Three.js game:',len(html.encode()),'bytes')
