from pathlib import Path
import zipfile
p=Path(__file__).resolve().parent.parent
target=p/'dist/source/qingdi-source.zip';target.parent.mkdir(exist_ok=True)
files=[]
for name in ['package.json','package-lock.json','README.md','MODEL-PROVENANCE.json','VALIDATION.md','.gitignore']:
    f=p/name
    if f.exists():files.append(f)
for directory in ['src','scripts','dist/licenses']:
    files.extend(f for f in (p/directory).rglob('*') if f.is_file())
for name in ['dist/index.html','dist/style.css','dist/app.js','dist/assets/plant.jpg','dist/assets/portrait.jpg','dist/assets/favicon.svg']:
    files.append(p/name)
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for f in files:z.write(f,'qingdi/'+str(f.relative_to(p)))
print(f'{target.name}: {target.stat().st_size} bytes, {len(files)} files')
