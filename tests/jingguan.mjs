import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.APP_URL||'http://127.0.0.1:4185/yunjin-tools/';
const local=['localhost','127.0.0.1'].includes(new URL(base).hostname);
const phase=process.env.QA_PHASE||'full';assert.ok(['full','mobile'].includes(phase));
const output=process.env.QA_DIR||path.join(root,'tests/jingguan-results');
fs.mkdirSync(output,{recursive:true});
const checks=[],errors=[],failures=[],weatherRequests=[],weatherConsole=[];
const result={base,phase,localAssets:local,checks,errors,failures,weatherRequests,weatherConsole};
const mark=message=>{checks.push(message);console.log(JSON.stringify({check:message}));};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const launch=cpu=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,
 args:['--disable-dev-shm-usage',...(cpu?['--disable-webgl']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])],
 ...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{})});
async function contextFor(browser,options={}){
 const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block',reducedMotion:'reduce',...options});
 if(local)await context.route('https://raw.githubusercontent.com/yunjinzh/yunjin-tools/main/assets/**',route=>{
  const file=path.join(root,'assets',path.basename(new URL(route.request().url()).pathname));
  return fs.existsSync(file)?route.fulfill({path:file,headers:{'Access-Control-Allow-Origin':'*'}}):route.abort();
 });
 context.on('page',page=>{
  page.setDefaultTimeout(30000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()!=='error'||m.text().startsWith('Failed to load resource:'))return;
   if(m.text().includes('https://api.open-meteo.com/v1/forecast?'))weatherConsole.push(m.text());else errors.push(m.text());});
  page.on('response',r=>{if(new URL(r.url()).hostname==='api.open-meteo.com')weatherRequests.push({url:r.url(),status:r.status()});else if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>{const error=r.failure()?.errorText;if(error&&error!=='net::ERR_ABORTED'){const x={url:r.url(),error};if(new URL(r.url()).hostname==='api.open-meteo.com')weatherRequests.push(x);else failures.push(x);}});
 });return context;
}
async function load(page,landmark='tiantan',cpu=false){
 const r=await page.goto(new URL('apps/m154/index.html?landmark='+landmark,base).href,{waitUntil:'domcontentloaded',timeout:60000});assert.equal(r.status(),200);
 await expect(page.locator('#loading')).toBeHidden({timeout:180000});
 await expect(page.locator('#stage')).toHaveAttribute('data-render',cpu?'cpu3d':'webgl2');
 await expect(page.locator('#stage')).toHaveAttribute('data-city','ready');
 await expect(page.locator('#stage')).toHaveAttribute('data-terrain','ready');
 await expect.poll(()=>page.locator('#cards img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0))).toBe(true);
}
async function closePanel(page){await page.locator('#closeDialog').click();await expect(page.locator('#dialog')).not.toBeVisible();}
let browser;
try{
 browser=await launch(false);
 if(phase==='full'){
 const context=await contextFor(browser),page=await context.newPage();
 await load(page);
 result.webgl=await page.locator('#stage').evaluate(e=>({...e.dataset}));
 assert.ok(Number(result.webgl.buildings)>30000);assert.ok(Number(result.webgl.triangles)>10000);
 await page.screenshot({path:path.join(output,'desktop.png')});
 await expect(page.locator('#cards .card')).toHaveCount(10);
 mark('WebGL scene, city geometry, terrain and all ten destination cards load');
 await page.locator('[data-cat="城市街区"]').click();await expect(page.locator('#cards .card:visible')).toHaveCount(2);
 await page.locator('[data-cat="古都建筑"]').click();await expect(page.locator('#cards .card:visible')).toHaveCount(3);
 await page.locator('[data-cat="当代地标"]').click();await expect(page.locator('#cards .card:visible')).toHaveCount(5);
 await page.locator('[data-cat="all"]').click();
 const landmarkPhotos=JSON.parse(fs.readFileSync(path.join(root,'web/m154/photos/index.json')));
 const streetPhotos=JSON.parse(fs.readFileSync(path.join(root,'web/m154/field/urban-index.json')));
 for(const id of ['palace','tiananmen','ncpa','zun','cctv','stadium','cube','tiantan','hutong','waterfront']){
  console.log(JSON.stringify({landmark:id}));await page.locator('#cards [data-id="'+id+'"]').click();await expect(page.locator('#stage')).toHaveAttribute('data-landmark',id);
  assert.equal(new URL(page.url()).searchParams.get('landmark'),id);
  await page.locator('#detailButton').click();await expect(page.locator('.doc-photo')).toBeVisible();
  await expect.poll(()=>page.locator('.doc-photo').evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
  await expect(page.locator('.photo-credit a')).toHaveCount(2);
  const photo=landmarkPhotos[id]||streetPhotos[id][0];
  await expect(page.locator('.photo-credit')).toContainText(photo.credit);
  await expect(page.locator('.photo-credit')).toContainText(photo.license);
  await closePanel(page);
 }
 mark('Category filters, ten destination selections, URL state and credited reference photos');
 const gallery=JSON.parse(fs.readFileSync(path.join(root,'web/m154/field/index.json')));
 result.fieldImages=[];
 for(const id of ['palace','tiananmen']){
  await page.locator('#cards [data-id="'+id+'"]').click();
  const shots=id==='palace'?['axis','roof','eaves','sundial']:['bridge','tower','gate'];
  await expect(page.locator('#views button')).toHaveCount(shots.length);
  for(let i=0;i<shots.length;i++){
   await page.locator('#views button').nth(i).click();await expect(page.locator('#stage')).toHaveAttribute('data-shot',String(i));
   assert.equal(new URL(page.url()).searchParams.get('view'),shots[i]);
  }
  await page.screenshot({path:path.join(output,id+'-detail.png')});
  await page.locator('#fieldButton').click();await expect(page.locator('#fieldDialog')).toBeVisible();
  await expect(page.locator('#fieldStrip button')).toHaveCount(5);
  await expect.poll(()=>page.locator('#fieldStrip img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0))).toBe(true);
  for(let i=0;i<gallery[id].length;i++){
   const item=gallery[id][i];await page.locator('#fieldStrip button').nth(i).click();
   await expect(page.locator('#fieldName')).toHaveText(item.name);await expect(page.locator('#fieldMessage')).toHaveText('',{timeout:30000});
   await expect(page.locator('#fieldCredit')).toContainText(item.credit);await expect(page.locator('#fieldCredit')).toContainText(item.license);
   if(item.type==='sphere'){
    await expect(page.locator('#fieldSphere')).toBeVisible();
    const pixelDigest=()=>page.locator('#fieldSphere').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(Math.imul(h,31)+d[i])>>>0;return h;});
    await expect.poll(pixelDigest).not.toBe(0);const before=await pixelDigest();
    const rect=await page.locator('#fieldScreen').boundingBox();await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.65,rect.y+rect.height*.55,{steps:10});await page.mouse.up();
    await expect.poll(pixelDigest).not.toBe(before);const rotated=await pixelDigest();await page.locator('#fieldPlus').click();await expect.poll(pixelDigest).not.toBe(rotated);
    await page.screenshot({path:path.join(output,'spherical-panorama.png')});await page.locator('#fieldReset').click();
   }else{
    await expect(page.locator('#fieldImage')).toBeVisible();await expect.poll(()=>page.locator('#fieldImage').evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);
    await page.locator('#fieldPlus').click();await expect.poll(()=>page.locator('#fieldImage').evaluate(im=>im.style.transform)).toContain('scale(1.45)');
    await page.locator('#fieldReset').click();await expect.poll(()=>page.locator('#fieldImage').evaluate(im=>im.style.transform)).toContain('scale(1)');
   }
   result.fieldImages.push({id:item.id,type:item.type,license:item.license,ok:true});
  }
  await page.locator('#fieldClose').click();await expect(page.locator('#fieldDialog')).not.toBeVisible();
 }
 mark('Seven heritage viewpoints and ten credited reference images, including real 360-degree pixel rendering, drag and zoom');

 const urbanGallery=JSON.parse(fs.readFileSync(path.join(root,'web/m154/field/urban-index.json')));
 await page.locator('#fieldButton').click();await expect(page.locator('#fieldGroup option')).toHaveCount(8);
 for(const [group,items] of Object.entries(urbanGallery)){
  await page.locator('#fieldGroup').selectOption(group);await expect(page.locator('#fieldStrip button')).toHaveCount(items.length);
  await expect.poll(()=>page.locator('#fieldStrip img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0))).toBe(true);
  for(let i=0;i<items.length;i++){
   const item=items[i];await page.locator('#fieldStrip button').nth(i).click();
   await expect(page.locator('#fieldName')).toHaveText(item.name);await expect(page.locator('#fieldMessage')).toHaveText('',{timeout:45000});
   await expect(page.locator('#fieldCredit')).toContainText(item.credit);await expect(page.locator('#fieldCredit')).toContainText(item.license);
   if(item.type==='sphere'){
    const digest=()=>page.locator('#fieldSphere').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let j=0;j<d.length;j+=97)h=(Math.imul(h,31)+d[j])>>>0;return h;});
    await expect.poll(digest).not.toBe(0);const before=await digest();await page.locator('#fieldPlus').click();await expect.poll(digest).not.toBe(before);await page.locator('#fieldReset').click();
   }else await expect.poll(()=>page.locator('#fieldImage').evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);
   result.fieldImages.push({group,id:item.id,type:item.type,license:item.license,ok:true});
  }
 }
 await page.screenshot({path:path.join(output,'urban-panorama.png')});await page.locator('#fieldClose').click();
 mark('Eight real-photo groups and fourteen additional credited photos, including two additional spherical panoramas');
 await page.locator('#cinema').click();await expect(page.locator('body')).toHaveClass(/immersive/);await expect(page.locator('.top')).not.toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/immersive/);await expect(page.locator('.top')).toBeVisible();
 const deep=new URL('apps/m154/index.html?landmark=tiananmen&view=gate&time=22:00&weather=snow',base);await page.goto(deep.href,{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.locator('#loading')).toBeHidden({timeout:180000});await expect(page.locator('#stage')).toHaveAttribute('data-render','webgl2');await expect(page.locator('#stage')).toHaveAttribute('data-shot','2');
 await expect(page.locator('#stage')).toHaveAttribute('data-weather','snow');await expect(page.locator('#clock')).toHaveText('22:00');
 await page.screenshot({path:path.join(output,'gate-night-snow.png')});
 await page.locator('#envButton').click();await page.locator('.preset button[data-t="12"]').click();await page.locator('[data-w="clear"]').click();await closePanel(page);
 mark('Immersive mode exit and saved viewpoint, time and weather restored from a real deep link');
 // A close heritage view can move less than the coordinate readout's 4-decimal resolution.
 const closeView=await page.locator('#coords').innerText();await page.locator('#cards [data-id="tiantan"]').click();
 await expect.poll(()=>page.locator('#coords').innerText(),{timeout:20000}).not.toBe(closeView);
 const initial=await page.locator('#coords').innerText();await page.locator('#zoomIn').click();
 await expect.poll(()=>page.locator('#coords').innerText(),{timeout:20000}).not.toBe(initial);
 await page.locator('#compass').click();await page.locator('#home').click();await page.locator('#cards [data-id="tiananmen"]').click();await page.locator('#walk').click();
 await expect(page.locator('#stage')).toHaveAttribute('data-mode','walk');
 await expect.poll(()=>page.locator('#alt').innerText()).toContain('1.72');
 const before=await page.locator('#coords').innerText();await page.locator('#stage').focus();await page.keyboard.down('Shift');await page.keyboard.down('s');
 try{await expect.poll(()=>page.locator('#coords').innerText(),{timeout:20000}).not.toBe(before);}finally{await page.keyboard.up('s');await page.keyboard.up('Shift');}
 await page.locator('#fly').click();await expect(page.locator('#stage')).toHaveAttribute('data-mode','fly');
 await page.locator('#home').click();await page.locator('#tour').click();await expect(page.locator('#tour')).toHaveAttribute('aria-pressed','true');
 await page.locator('#zoomOut').click();await expect(page.locator('#tour')).toHaveAttribute('aria-pressed','false');
 mark('Zoom, north/home views, keyboard walking at 1.72 m, flight and tour cancellation');
 await page.locator('.nav-item[data-panel="map"]').click();await expect(page.locator('.map-list').first().locator('button')).toHaveCount(10);
 await page.locator('[data-area="region"]').click();await expect(page.locator('[data-area="region"]')).toHaveClass('sel');
 await page.screenshot({path:path.join(output,'regional-map.png')});await page.locator('[data-area="city"]').click();
 await page.locator('.map-list').first().getByRole('button',{name:'中国尊',exact:true}).click();await expect(page.locator('#stage')).toHaveAttribute('data-landmark','zun');
 await page.locator('#envButton').click();await page.locator('.preset button[data-t="22"]').click();
 await expect(page.locator('#clock')).toHaveText('22:00');await page.screenshot({path:path.join(output,'night.png')});
 for(const weather of ['rain','snow','fog','cloud','clear']){await page.locator('[data-w="'+weather+'"]').click();await expect(page.locator('#stage')).toHaveAttribute('data-weather',weather);}
 await page.locator('#sdate').fill('2026-12-21');await page.locator('#sdate').dispatchEvent('change');
 for(const label of ['普通建筑','树冠','地表影像','国贸 2023 屋顶补充','区域建筑（2021–2023）']){await page.getByLabel(label,{exact:true}).uncheck();await expect(page.getByLabel(label,{exact:true})).not.toBeChecked();await page.getByLabel(label,{exact:true}).check();}
 await page.locator('#sync').click();await expect(page.locator('#sync')).toBeEnabled({timeout:20000});
 result.liveWeather=await page.locator('#syncState').innerText();assert.match(result.liveWeather,/模式值|连接失败/);
 await page.locator('.preset button[data-t="12"]').click();await page.locator('[data-w="clear"]').click();
 await expect(page.locator('#syncState')).toHaveText('手动模拟');await closePanel(page);
 mark('City/regional maps, map travel, date/time, five weather modes, layers and actual weather request');

 result.regionalStops=[];
 for(const name of ['中关村','通州北苑','亦庄文化园周边']){
  await page.locator('.nav-item[data-panel="map"]').click();await page.locator('[data-area="region"]').click();
  await page.getByRole('button',{name,exact:true}).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-region-view','true',{timeout:30000});
  await expect.poll(()=>page.locator('#stage').getAttribute('data-regional-buildings'),{timeout:60000}).toMatch(/^[1-9][0-9]*$/);
  result.regionalStops.push({name,buildings:Number(await page.locator('#stage').getAttribute('data-regional-buildings')),url:page.url()});
 }
 await page.screenshot({path:path.join(output,'regional-buildings.png')});
 await page.locator('#cards [data-id="zun"]').click();await expect(page.locator('#stage')).toHaveAttribute('data-region-view','false',{timeout:30000});
 await page.locator('#inspectBuilding').click();await expect(page.locator('#inspectBuilding')).toHaveAttribute('aria-pressed','true');
 const box=await page.locator('#world').boundingBox();let inspected=false;
 for(const [x,y] of [[.3,.7],[.4,.7],[.5,.7],[.6,.7],[.7,.7],[.3,.55],[.4,.55],[.55,.55],[.7,.55],[.25,.8],[.6,.8]]){
  await page.mouse.click(box.x+box.width*x,box.y+box.height*y);
  if(await page.locator('.building-record').isVisible()){inspected=true;break;}
  try{await expect(page.locator('.building-record')).toBeVisible({timeout:2000});inspected=true;break;}catch{}
 }
 assert.ok(inspected,'A visible ordinary building must be queryable');
 await expect(page.locator('.building-record')).toContainText('基底面积');await expect(page.locator('.building-record')).toContainText('WGS84');
 result.buildingQuery=await page.locator('.building-record').innerText();
 await page.screenshot({path:path.join(output,'building-query.png')});await page.getByRole('button',{name:'退出查询'}).click();
 await expect(page.locator('#inspectBuilding')).toHaveAttribute('aria-pressed','false');
 mark('Three regional observation stops load real building tiles; a clicked city building shows OSM provenance, area and height evidence');
 await page.locator('footer [data-panel="sources"]').click();await expect(page.locator('#modalBody')).toContainText('34,478');
 await expect(page.locator('#modalBody')).toContainText('ODbL');
 const dataLink=page.getByRole('link',{name:'下载本场景使用的 OSM 派生数据库'});const url=new URL(await dataLink.getAttribute('href'),page.url()).href;
 const response=await page.request.get(url);assert.equal(response.status(),200);const bytes=await response.body();
 const map=JSON.parse(fs.readFileSync(path.join(root,'web/m154/migration-assets.json')));
 const expected=fs.readFileSync(path.join(root,map['data/beijing.osm.bin']));assert.equal(hash(bytes),hash(expected));
 result.dataDownload={url,bytes:bytes.length,sha256:hash(bytes)};await closePanel(page);
 await page.getByRole('button',{name:'操作指南',exact:true}).click();await expect(page.locator('#modalBody')).toContainText('WebGL 2');await closePanel(page);
 mark('Attribution, accuracy notes, public map-data bytes and operating guide');
 await context.close();
 }
 const mobile=await contextFor(browser,{viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();await load(phone,'palace');
 result.mobileLayouts=[];
 for(const size of [{width:390,height:844},{width:360,height:800},{width:844,height:390}]){
  await phone.setViewportSize(size);await expect.poll(()=>phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),{timeout:30000}).toBe(true);
  result.mobileLayouts.push({...size,...await phone.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth}))});
  await phone.locator('#envButton').click();await expect(phone.locator('#hours')).toBeVisible();await closePanel(phone);
  await phone.screenshot({path:path.join(output,'mobile-'+size.width+'.png'),fullPage:true});
 }
 await phone.setViewportSize({width:390,height:844});await phone.locator('#walk').click();await expect(phone.locator('#stage')).toHaveAttribute('data-mode','walk');await expect(phone.locator('#touchpad')).toBeVisible();
 await phone.locator('#fieldButton').click();await expect(phone.locator('#fieldDialog')).toBeVisible();await expect(phone.locator('#fieldMessage')).toHaveText('');
 await expect.poll(()=>phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await phone.screenshot({path:path.join(output,'mobile-reference.png')});await phone.locator('#fieldClose').click();
 await mobile.close();mark('390/360 px touch layout, short landscape and mobile walking controls');
 await browser.close();browser=await launch(true);const cpuContext=await contextFor(browser,{viewport:{width:1000,height:760}}),cpuPage=await cpuContext.newPage();await load(cpuPage,'tiantan',true);
 await expect.poll(()=>cpuPage.locator('#world').getAttribute('data-cpu-triangles'),{timeout:20000}).not.toBeNull();
 result.cpu={...await cpuPage.locator('#stage').evaluate(e=>({...e.dataset})),triangles:await cpuPage.locator('#world').getAttribute('data-cpu-triangles')};assert.ok(Number(result.cpu.triangles)>1000);
 await cpuPage.locator('#cards [data-id="palace"]').click();await expect(cpuPage.locator('#stage')).toHaveAttribute('data-landmark','palace');await cpuPage.waitForTimeout(1500);
 await expect.poll(()=>cpuPage.locator('#world').getAttribute('data-photo-faces'),{timeout:30000}).not.toBe('0');
 await expect.poll(()=>cpuPage.locator('#world').getAttribute('data-photo-faces'),{timeout:30000}).not.toBeNull();
 result.cpu.photoFaces=await cpuPage.locator('#world').getAttribute('data-photo-faces');
 await cpuPage.screenshot({path:path.join(output,'cpu.png')});await cpuContext.close();mark('Actual WebGL-disabled browser uses CPU 3D, pixel-readback imagery, city and terrain');
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);result.ok=true;
}catch(e){result.ok=false;result.error=e.stack;process.exitCode=1;for(const c of browser?.contexts()||[])for(const p of c.pages())await p.screenshot({path:path.join(output,'failure.png'),timeout:10000}).catch(()=>{});}
finally{await browser?.close();fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
