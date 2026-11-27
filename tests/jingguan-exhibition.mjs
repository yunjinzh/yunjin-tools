import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.APP_URL||'http://127.0.0.1:4185/yunjin-tools/';
const local=['localhost','127.0.0.1'].includes(new URL(base).hostname);
const output=process.env.QA_DIR||path.join(root,'tests/jingguan-exhibition-results');
fs.mkdirSync(output,{recursive:true});
const result={base,localAssets:local,checks:[],errors:[],failures:[],external:[],chapters:[],survey:[]};
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const mark=check=>{result.checks.push(check);console.log(JSON.stringify({check}));};
const entry=relative=>new URL('apps/m154/'+relative,base).href;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,
 args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
 ...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{})});
async function contextFor(options={}){
 const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block',reducedMotion:'reduce',...options});
 if(local)await context.route('https://raw.githubusercontent.com/yunjinzh/yunjin-tools/main/assets/**',route=>{
  const file=path.join(root,'assets',path.basename(new URL(route.request().url()).pathname));
  if(!fs.existsSync(file))return route.abort();
  // Video seeking needs byte ranges. This preview route never runs for public HTTPS tests.
  if(/\.(mp4|webm)$/.test(file)){
   const data=fs.readFileSync(file),range=/^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range||'');
   const headers={'Access-Control-Allow-Origin':'*','Accept-Ranges':'bytes','Content-Type':file.endsWith('.mp4')?'video/mp4':'video/webm'};
   if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),data.length-1):data.length-1;
    return route.fulfill({status:206,body:data.subarray(start,end+1),headers:{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':String(end-start+1)}});}
   return route.fulfill({body:data,headers:{...headers,'Content-Length':String(data.length)}});
  }
  return route.fulfill({path:file,headers:{'Access-Control-Allow-Origin':'*'}});
 });
 context.on('page',page=>{
  page.setDefaultTimeout(30000);
  page.on('pageerror',error=>result.errors.push(error.message));
  page.on('response',response=>{
   if(response.status()<400)return;
   const item={url:response.url(),status:response.status()};
   (/githubusercontent\.com|github\.io|127\.0\.0\.1/.test(new URL(item.url).hostname)?result.failures:result.external).push(item);
  });
  page.on('requestfailed',request=>{
   const error=request.failure()?.errorText;if(!error||error==='net::ERR_ABORTED')return;
   const item={url:request.url(),error};
   (/githubusercontent\.com|github\.io|127\.0\.0\.1/.test(new URL(item.url).hostname)?result.failures:result.external).push(item);
  });
 });
 return context;
}
try{
 const context=await contextFor(),page=await context.newPage();
 const response=await page.goto(entry('index.html'),{waitUntil:'domcontentloaded',timeout:60000});assert.equal(response.status(),200);
 const chapters=JSON.parse(fs.readFileSync(path.join(root,'web/m154/exhibit/chapters.json')));
 await expect(page.locator('#chapters button')).toHaveCount(5);
 await expect.poll(()=>page.locator('#chapters img').evaluateAll(images=>images.every(im=>im.complete&&im.naturalWidth>0))).toBe(true);
 await expect(page.locator('#photos')).toBeEnabled();
 await page.screenshot({path:path.join(output,'exhibition-desktop.png')});
 for(const chapter of chapters){
  await page.getByRole('button',{name:'播放'+chapter.name,exact:true}).click();
  await expect(page.locator('#title')).toHaveText(chapter.name);
  assert.equal(new URL(page.url()).searchParams.get('chapter'),chapter.id);
  const video=page.locator('video[data-id="'+chapter.id+'"]');
  await expect.poll(()=>video.evaluate(v=>v.readyState),{timeout:120000}).toBeGreaterThanOrEqual(2);
  const media=await video.evaluate(v=>({url:v.currentSrc,width:v.videoWidth,height:v.videoHeight,duration:v.duration,error:v.error?.code||null}));
  assert.ok(media.width>=1280&&media.height>=720);assert.ok(Math.abs(media.duration-chapter.duration)<1);assert.equal(media.error,null);
  if(await video.evaluate(v=>v.paused))await page.locator('#play').click();
  await expect.poll(()=>video.evaluate(v=>v.currentTime),{timeout:20000}).toBeGreaterThan(.3);
  await page.locator('#play').click();await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(true);
  const slider=await page.locator('#seek').boundingBox();await page.mouse.click(slider.x+slider.width*.5,slider.y+slider.height*.5);
  await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(chapter.duration*.4);
  await page.locator('#nativePlate').click();await expect(page.locator('#plate')).toBeVisible();
  await expect(page.locator('#plate .plate-stage [role=status]')).toHaveText('',{timeout:60000});
  const plate=page.locator('#plate img');const dimensions=await plate.evaluate(im=>[im.naturalWidth,im.naturalHeight]);assert.deepEqual(dimensions,[3840,2160]);
  await page.locator('#plate [data-action=actual]').click();await expect(page.locator('#plate output')).toHaveText('100%');
  await page.locator('#plate [data-action=in]').click();await expect(page.locator('#plate output')).toHaveText('140%');
  if(chapter.id==='cbd')await page.screenshot({path:path.join(output,'native-4k.png')});
  await page.locator('#plate [data-action=fit]').click();await page.locator('#plate [data-action=close]').click();
  await page.locator('#photos').click();await expect(page.locator('#photos')).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.locator('#documentary').evaluate(im=>im.complete&&im.naturalWidth>0),{timeout:45000}).toBe(true);
  await expect(page.locator('#caption a')).toHaveCount(2);await expect(page.locator('#play')).toBeDisabled();
  await page.locator('#photos').click();await expect(page.locator('#title')).toHaveText(chapter.name);
  const explore=await page.locator('#explore').getAttribute('href');assert.equal(new URL(explore,page.url()).searchParams.get('landmark'),chapter.scene);
  result.chapters.push({id:chapter.id,...media,plate:dimensions,photo:true});
 }
 mark('All five films decode and play, pause and seek; five native 4K plates and credited area photos load');
 await page.locator('#next').click();await expect(page.locator('#title')).toHaveText(chapters[0].name);
 await page.locator('#prev').click();await expect(page.locator('#title')).toHaveText(chapters.at(-1).name);
 await page.locator('#clean').click();await expect(page.locator('body')).toHaveClass(/clean/);
 await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/clean/);
 await page.locator('#guide').click();await expect(page.locator('#about')).toBeVisible();await expect(page.locator('#about')).toContainText('Blender Cycles');
 await page.locator('#about form button').click();
 const credits=await context.newPage();assert.equal((await credits.goto(entry('exhibit/credits.html'))).status(),200);
 await expect(credits.locator('body')).toContainText('OpenStreetMap');await credits.close();
 await page.goto(entry('index.html?chapter=hutong'));await expect(page.locator('#title')).toHaveText('钟库胡同');
 await page.reload();await expect(page.locator('#title')).toHaveText('钟库胡同');
 mark('Chapter wraparound and deep links, clean mode, exhibition guide and real credits page');
 await page.goto(entry('field/survey/index.html?model=art798'));
 await expect(page.locator('#works button')).toHaveCount(4);
 const survey=JSON.parse(fs.readFileSync(path.join(root,'web/m154/field/survey/index.json')));
 for(const id of ['art798','hills']){
  await page.locator('#works [data-id="'+id+'"]').click();
  await expect(page.locator('#mode')).toContainText('纹理网格',{timeout:120000});
  await expect(page.locator('#canvas')).toBeVisible();await expect(page.locator('#status')).toHaveText('');
  await expect(page.locator('#credit')).toContainText(survey[id].author);await expect(page.locator('#credit')).toContainText('CC BY 4.0');
  await expect(page.locator('#location')).toHaveText(survey[id].location+(survey[id].locationUrl?' 地区资料':''));
  const canvas=page.locator('#canvas'),before=hash(await canvas.screenshot());
  await page.locator('#right').click();await expect.poll(async()=>hash(await canvas.screenshot())).not.toBe(before);
  const rotated=hash(await canvas.screenshot());await page.locator('#plus').click();await expect.poll(async()=>hash(await canvas.screenshot())).not.toBe(rotated);
  await page.locator('#reset').click();
  await page.screenshot({path:path.join(output,'survey-'+id+'.png')});
  if(!await page.locator('#details').evaluate(el=>el.open))await page.locator('#details summary').click();
  const link=page.locator('#download').getByRole('link',{name:'打开 GLB 文件'}),url=new URL(await link.getAttribute('href'),page.url()).href;
  const download=await page.request.get(url,{timeout:120000});assert.equal(download.status(),200);
  const data=await download.body();const expected=fs.readFileSync(path.join(root,'_site/apps/m154/field/survey',id+'.glb'));
  assert.equal(hash(data),hash(expected));assert.equal(data.readUInt32LE(0),0x46546c67);
  result.survey.push({id,mode:'mesh',url,bytes:data.length,sha256:hash(data),rotation:true,zoom:true});
 }
 mark('Two CC BY photogrammetry meshes render and rotate/zoom; actual GLB downloads match source bytes');
 for(const id of ['art798','hills']){
  await page.goto(entry('field/survey/index.html?model='+id+'&mode=frames'));
  await expect(page.locator('#mode')).toContainText('16 向离线视图');
  const seen=new Set();
  for(let i=0;i<16;i++){
   await expect.poll(()=>page.locator('#frame').evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);
   seen.add(await page.locator('#frame').getAttribute('src'));
   const before=await page.locator('#frame').getAttribute('src');await page.locator('#right').click();
   await expect.poll(()=>page.locator('#frame').getAttribute('src')).not.toBe(before);
  }
  assert.equal(seen.size,16);result.survey.push({id,mode:'frames',views:seen.size});
 }
 for(const id of ['houhai','qilin']){
  await page.locator('#works [data-id="'+id+'"]').click();await expect(page.locator('#mode')).toContainText('在线原作');
  await expect(page.locator('#remote')).toContainText('需要联网');await expect(page.locator('#remote iframe')).toHaveCount(0);
  assert.equal(await page.locator('#remote a').getAttribute('href'),survey[id].url);
  await page.getByRole('button',{name:'加载在线三维原作'}).click();await expect(page.locator('#remote iframe')).toHaveCount(1);
  assert.equal(await page.locator('#remote iframe').getAttribute('src'),survey[id].embed+'?autostart=1');
  result.survey.push({id,mode:'external_embed',url:survey[id].embed,loaded_on_request:true});
 }
 mark('Both 16-view fallbacks load all frames; external originals stay labeled and load only after a click');
 await context.close();
 const mobile=await contextFor({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();
 for(const size of [{width:390,height:844},{width:360,height:800},{width:844,height:390}]){
  await phone.setViewportSize(size);await phone.goto(entry('index.html'));
  await expect(phone.locator('#chapters button')).toHaveCount(5);
  await expect.poll(()=>phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await phone.getByRole('button',{name:'播放什刹海前海',exact:true}).click();await expect(phone.locator('#title')).toHaveText('什刹海前海');
  await phone.screenshot({path:path.join(output,'exhibition-mobile-'+size.width+'.png'),fullPage:true});
 }
 await phone.setViewportSize({width:390,height:844});await phone.goto(entry('field/survey/index.html?model=art798&mode=frames'));
 await expect(phone.locator('#mode')).toContainText('16 向离线视图');await expect.poll(()=>phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await phone.screenshot({path:path.join(output,'survey-mobile.png'),fullPage:true});await mobile.close();
 mark('Exhibition and survey controls work at 390/360 px and short landscape without horizontal overflow');
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.failures,[]);result.ok=true;
}catch(error){result.ok=false;result.error=error.stack;process.exitCode=1;
 for(const context of browser.contexts())for(const page of context.pages())await page.screenshot({path:path.join(output,'failure.png'),timeout:10000}).catch(()=>{});
}finally{await browser.close();fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
