// Presentation state is independent of the simulation and its WebGL lifecycle.
export function initWorkspaceShell(doc=document,win=window){
 const app=doc.getElementById('app');if(!app)return;
 const sidebar=doc.getElementById('sceneSidebar'),inspector=doc.getElementById('controlInspector'),stage=doc.querySelector('.stage-column');
 const compact=win.matchMedia('(max-width: 1050px)'),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 let view='stage',focused=false,animationTimer;
 function sync(){
  app.dataset.view=view;app.classList.toggle('is-focused',focused);
  sidebar.inert=focused||(compact.matches&&view!=='scenes');
  inspector.inert=focused||(compact.matches&&view!=='controls');
  stage.inert=compact.matches&&view!=='stage';stage.setAttribute('aria-hidden',String(stage.inert));
  sidebar.setAttribute('aria-hidden',String(sidebar.inert));inspector.setAttribute('aria-hidden',String(inspector.inert));
  doc.querySelectorAll('[data-shell]').forEach(button=>{
   const name=button.dataset.shell;
   if(['stage','scenes','controls'].includes(name)){button.classList.toggle('active',view===name);button.setAttribute('aria-pressed',String(view===name));}
   if(name==='focus'){button.classList.toggle('active',focused);button.setAttribute('aria-pressed',String(focused));button.setAttribute('aria-label',focused?'退出专注模式':'开启专注模式');button.querySelector('span').textContent=focused?'退出专注':'专注';}
  });
 }
 function showView(next){const changed=view!==next;view=next;if(next!=='stage')focused=false;sync();if(changed&&compact.matches){const target=next==='controls'?inspector.querySelector('.inspector-tabs .active'):next==='scenes'?sidebar.querySelector('.scene-card.active'):doc.querySelector('[data-shell="stage"]');target?.focus();}}
 function toggleFocus(){focused=!focused;view='stage';sync();if(focused)doc.querySelector('[data-shell="focus"]')?.focus();}
 doc.addEventListener('click',event=>{
  const button=event.target.closest('[data-shell]');if(!button)return;
  const action=button.dataset.shell;
  if(action==='focus')toggleFocus();else if(action==='closePanel'){showView('stage');doc.querySelector('[data-shell="controls"]')?.focus();}else showView(action);
 });
 win.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.target?.closest?.('input,textarea,select,[contenteditable="true"]')||doc.querySelector('dialog[open]'))return;
  if(event.key.toLowerCase()==='f'){event.preventDefault();toggleFocus();}
  if(event.key==='Escape'&&(focused||view!=='stage')){focused=false;showView('stage');doc.querySelector('[data-shell="focus"]')?.focus();}
 });
 doc.addEventListener('studio:panel',()=>{if(compact.matches)showView('controls');else if(focused){focused=false;sync();}});
 doc.addEventListener('studio:scenechange',event=>{
  app.dataset.environment=event.detail.scene;
  doc.getElementById('headingSubtitle').textContent=event.detail.subtitle;
  if(compact.matches)showView('stage');
  if(!reduced.matches){clearTimeout(animationTimer);app.classList.remove('scene-arriving');void app.offsetWidth;app.classList.add('scene-arriving');animationTimer=setTimeout(()=>app.classList.remove('scene-arriving'),500);}
 });
 compact.addEventListener('change',()=>{focused=false;view='stage';sync();});sync();
 return {showView,toggleFocus,get state(){return {view,focused,compact:compact.matches};}};
}

if(typeof document!=='undefined')initWorkspaceShell();
