import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {initWorkspaceShell} from '../dist/workspace-shell.js';

function fixture({compact=false,reduced=true}={}){
 const win=new Window({url:'http://localhost/'}),doc=win.document;
 doc.write(readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').replace(/<script[\s\S]*?<\/script>/g,''));
 doc.getElementById('sceneCards').innerHTML='<button class="scene-card active">仓库</button><button class="scene-card">咖啡</button>';
 const queries=new Map();win.matchMedia=query=>{const m=new win.EventTarget();m.matches=query.includes('1050')?compact:reduced;queries.set(query,m);return m;};
 const shell=initWorkspaceShell(doc,win),q=selector=>doc.querySelector(selector);
 const key=(value,target=doc.body,options={})=>target.dispatchEvent(new win.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...options}));
 return {win,doc,q,shell,key,queries,close:()=>win.happyDOM.abort()};
}

test('desktop focus mode hides sidebars from interaction and Escape restores them',async()=>{
 const f=fixture();f.key('f');assert.equal(f.shell.state.focused,true);assert.equal(f.q('#sceneSidebar').inert,true);assert.equal(f.q('#controlInspector').getAttribute('aria-hidden'),'true');assert.equal(f.q('.stage-column').inert,false);assert.equal(f.q('[data-shell="focus"]').getAttribute('aria-pressed'),'true');assert.equal(f.doc.activeElement,f.q('[data-shell="focus"]'));
 f.key('Escape');assert.equal(f.shell.state.focused,false);assert.equal(f.q('#sceneSidebar').inert,false);assert.equal(f.q('#controlInspector').inert,false);await f.close();
});
test('compact panels disable obscured stage controls and restore accessible navigation',async()=>{
 const f=fixture({compact:true});assert.equal(f.q('#sceneSidebar').inert,true);assert.equal(f.q('#controlInspector').inert,true);
 f.q('[data-shell="controls"]').click();assert.equal(f.shell.state.view,'controls');assert.equal(f.q('.stage-column').inert,true);assert.equal(f.q('#controlInspector').inert,false);assert.equal(f.doc.activeElement,f.q('.inspector-tabs .active'));
 f.q('[data-shell="scenes"]').click();assert.equal(f.q('#controlInspector').inert,true);assert.equal(f.q('#sceneSidebar').inert,false);assert.equal(f.doc.activeElement,f.q('.scene-card.active'));
 f.doc.dispatchEvent(new f.win.CustomEvent('studio:scenechange',{detail:{scene:'cafe',subtitle:'制作一杯咖啡'}}));assert.equal(f.shell.state.view,'stage');assert.equal(f.q('.stage-column').inert,false);assert.equal(f.q('#headingSubtitle').textContent,'制作一杯咖啡');assert.equal(f.doc.activeElement,f.q('[data-shell="stage"]'));assert.equal(f.q('#app').classList.contains('scene-arriving'),false);await f.close();
});
test('focus shortcut never steals typing, modified keys, held keys or modal input',async()=>{
 const f=fixture();f.key('f',f.q('#commandInput'));f.key('f',f.doc.body,{ctrlKey:true});f.key('f',f.doc.body,{repeat:true});assert.equal(f.shell.state.focused,false);
 f.q('#modal').setAttribute('open','');f.key('f');assert.equal(f.shell.state.focused,false);f.q('#modal').removeAttribute('open');f.key('F');assert.equal(f.shell.state.focused,true);await f.close();
});
test('opening controls from a scene shortcut exits focus and adapts after resizing',async()=>{
 const f=fixture();f.shell.toggleFocus();f.doc.dispatchEvent(new f.win.Event('studio:panel'));assert.equal(f.shell.state.focused,false);
 const media=f.queries.get('(max-width: 1050px)');media.matches=true;media.dispatchEvent(new f.win.Event('change'));f.doc.dispatchEvent(new f.win.Event('studio:panel'));assert.equal(f.shell.state.view,'controls');
 media.matches=false;media.dispatchEvent(new f.win.Event('change'));assert.equal(f.shell.state.view,'stage');assert.equal(f.q('.stage-column').inert,false);assert.equal(f.q('#sceneSidebar').inert,false);assert.equal(f.q('#controlInspector').inert,false);await f.close();
});
