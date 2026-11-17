'use client';
import {useEffect,useState} from 'react';
import {Download,RefreshCw,Wifi,WifiOff} from 'lucide-react';
interface InstallEvent extends Event{prompt():Promise<void>;userChoice:Promise<{outcome:string}>}
export function OfflineControls({message,checking,refresh,pending,offline,sync}:{message:string;checking:boolean;refresh:()=>void;pending:number;offline:boolean;sync:()=>void}){
 const [ready,setReady]=useState(false),[status,setStatus]=useState('正在准备离线资料…'),[install,setInstall]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(false);
 useEffect(()=>{
  setInstalled(window.matchMedia('(display-mode: standalone)').matches);
  const capture=(e:Event)=>{e.preventDefault();setInstall(e as InstallEvent)},done=()=>{setInstalled(true);setInstall(null)};
  window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',done);
  if(!('serviceWorker' in navigator)||!window.isSecureContext){setStatus('请在正式 HTTPS 网站启用离线应用');return()=>{window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',done)}}
  let alive=true;
  const setup=async()=>{try{
   const r=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
   const check=()=>{if(alive&&r.active){setReady(true);setStatus('离线资料已就绪')}};
   check();r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated')check();if(worker.state==='redundant'&&!r.active&&alive)setStatus('离线下载未完成，请联网刷新重试');if(worker.state==='installed'&&r.active&&alive)setStatus('应用更新已下载，关闭所有本站窗口后生效')})});
   await navigator.serviceWorker.ready;check();
  }catch{const old=await navigator.serviceWorker.getRegistration().catch(()=>null);if(alive){setReady(!!old?.active);setStatus(old?.active?'离线资料已就绪':'离线下载未完成，请联网刷新重试')}}};
  void setup();return()=>{alive=false;window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',done)};
 },[]);
 async function installApp(){
  if(install){await install.prompt();const choice=await install.userChoice;setInstall(null);if(choice.outcome==='accepted')setStatus('安装请求已发送，请按浏览器提示完成')}
  else setStatus('Chrome / Edge：浏览器菜单 → 安装此网站为应用；Safari：共享 → 添加到主屏幕');
  try{await navigator.storage?.persist?.()}catch{}
 }
 return <section className="offline-bar" aria-label="离线与自动更新" data-offline-ready={ready}>
  <div className="offline-status">{offline?<WifiOff size={16}/>:<Wifi size={16}/>}<strong>{offline?'离线 / 本机模式':'联网学习'}</strong><span>{status}</span></div>
  <div className="offline-schedule">每周一、三、五 08:00 核验更新 · 北京时间<span role="status">{message}</span><small>网页打开或恢复联网时自动检查；离线笔记保存在此浏览器，联网后同步。视频播放需联网。</small></div>
  <div className="offline-actions"><button className="outline" onClick={installApp}><Download size={15}/>{installed?'已安装 · 使用说明':'安装离线版'}</button><button className="outline" disabled={checking} onClick={refresh}><RefreshCw size={15} className={checking?'spin':''}/>{checking?'检查中…':'检查更新'}</button>{pending>0&&<button className="outline" onClick={sync}>同步本机记录（{pending}）</button>}</div>
 </section>
}
