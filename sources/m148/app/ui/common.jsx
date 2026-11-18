import React from 'react';
import {X,Check,Clock3,CircleAlert,LockKeyhole,FileQuestion,ExternalLink,Plus,ChevronRight} from 'lucide-react';
export const num=n=>new Intl.NumberFormat('en-US').format(n);
export const mb=n=>n>=1e9?(n/1e9).toFixed(2)+' GB':(n/1e6).toFixed(2)+' MB';
export function Badge({s,children}){const map={'已确认':[Check,'green'],'待核验':[Clock3,'amber'],'核验失败':[CircleAlert,'red'],'无法访问':[LockKeyhole,'gray'],'需补充':[FileQuestion,'purple']};const [I,c]=map[s]||[Clock3,'gray'];return <span className={'badge '+c}><I size={13}/>{children||s}</span>}
export function Link({href,children,className=''}){return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={14}/></a>}
export function Empty({children}){return <p className="empty">{children}</p>}
export function Btn({icon:I=Plus,children,primary=false,...p}){return <button className={'btn '+(primary?'primary':'')} {...p}><I size={16}/>{children}</button>}
export function Section({title,action,onClick,children,icon:I}){return <section className="panel"><div className="panelHead"><h2>{I&&<I size={19}/>} {title}</h2>{action&&<button className="textbtn" onClick={onClick}>{action}<ChevronRight size={14}/></button>}</div>{children}</section>}
export function Modal({title,onClose,children,wide=false}){
 const ref=React.useRef(null);const close=React.useRef(onClose);close.current=onClose;
 React.useEffect(()=>{const last=document.activeElement;const node=ref.current;node.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{node.close();document.body.style.overflow=overflow;last?.focus?.()}},[]);
 return <dialog className={'dialog '+(wide?'wide':'')} ref={ref} onCancel={e=>{e.preventDefault();close.current()}}><div className="dialogHead"><h2>{title}</h2><button className="iconBtn" aria-label="关闭" onClick={onClose}><X size={20}/></button></div>{children}</dialog>
}
export function Field({title,wide,children}){return <label className={'field '+(wide?'full':'')}><span>{title}</span>{children}</label>}
export const pad=(n,size=4)=>String(n).padStart(size,'0');
export function volumes(c){return c?.volume ? (c.volume===c.volumeEnd||!c.volumeEnd?c.volume:c.volume+'–'+c.volumeEnd):'—'}
export function inVolume(c,v){return !v||!!c.volume&&Number(v)>=Number(c.volume)&&Number(v)<=Number(c.volumeEnd||c.volume)}
export function dateTime(x){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(x))}
