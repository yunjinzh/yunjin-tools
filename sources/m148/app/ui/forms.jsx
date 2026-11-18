import React,{useState} from 'react';
import {checks,statuses,editions,problemTypes,validate} from '../../lib/policy';
import {Modal,Btn,Field,pad} from './common';
import {Save} from 'lucide-react';
export function Editor({record,onSave,close,catalog}){
 const [p,set]=useState({...record.data});const [error,err]=useState('');const [busy,wait]=useState(false); const [op]=useState(()=>crypto.randomUUID());
 const put=(k,v)=>{set(old=>({...old,[k]:v}));err('')};
 const fld=(title,k,{opts,wide=false,long=false,type='text',placeholder='',required=false}={})=><Field title={title} wide={wide}>{opts?<select disabled={k==='volume'&&p.kind==='part'} value={p[k]||''} onChange={e=>put(k,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:long?<textarea required={required} value={p[k]||''} placeholder={placeholder} onChange={e=>put(k,e.target.value)}/>:<input required={required} type={type} value={p[k]??''} placeholder={placeholder} onChange={e=>put(k,e.target.value)}/>}</Field>;
 const selectCard=(id,ed)=>{const c=catalog.find(c=>c.id===id&&c.edition===ed);if(c)set(v=>({...v,edition:ed,cardId:c.id,han:c.han,filename:c.file,volume:c.volume||'',evidence:c.evidence||v.evidence,title:c.han+' · '+ed}));else set(v=>({...v,edition:ed,cardId:id,han:'',filename:'',volume:'',evidence:''}))};
 async function save(e){e.preventDefault();const val={...p};if(val.kind==='review'){val.title=val.scope==='批次'?val.batch:val.han+' · '+val.edition; if(val.scope==='单张'){const c=catalog.find(c=>c.edition===val.edition&&c.id===val.cardId);if(!c||c.file!==val.filename||c.han!==val.han){err('编号、汉字和文件名须与所选版本的卡片清单一致。');return}}}
 if(val.kind==='baseline'){val.chars=[...new Set(val.chars.match(/\p{Script=Han}/gu)||[])].join('');if(!val.evidence?.trim()){err('请填写目标字表的来源。');return}}
 const msg=validate(val);if(msg){err(msg);return}wait(true);try{await onSave(record,val,op);close()}catch(e){err(e.message)}finally{wait(false)}}
 const isR=p.kind==='review';const card=catalog.find(c=>c.id===p.cardId&&c.edition===p.edition);
 return <Modal title={record.label} onClose={()=>{if(!busy)close()}} wide={isR}><form onSubmit={save}><div className="formScroll"><div className="formgrid">
 {isR?<><Field title="复核范围"><select disabled={!!record.entity} value={p.scope} onChange={e=>put('scope',e.target.value)}>{['单张','批次'].map(v=><option key={v}>{v}</option>)}</select></Field><Field title="资源版本"><select disabled={!!record.entity} value={p.edition} onChange={e=>p.scope==='单张'?selectCard(p.cardId,e.target.value):put('edition',e.target.value)}>{editions.map(v=><option key={v}>{v}</option>)}</select></Field>
 {p.scope==='单张'&&<Field title="选择卡片" wide><select required disabled={!!record.entity} value={p.cardId||''} onChange={e=>selectCard(e.target.value,p.edition)}><option value="">请选择编号或汉字</option>{catalog.filter(c=>c.edition===p.edition).map(c=><option key={c.id+c.file} value={c.id}>{c.id} · {c.han} · {c.file}</option>)}</select></Field>}
 {fld('汉字','han',{required:true})}{fld(p.scope==='批次'?'文件名或抽样清单':'文件名','filename',{required:true})}{fld('分卷编号（如适用）','volume',{placeholder:'例如 001'})}{fld('抽样批次','batch',{placeholder:'例如 首轮抽样 A',required:true})}
 {p.scope==='单张'&&card?.preview&&<div className="formPreview full"><a href={card.preview} target="_blank" rel="noreferrer"><img src={card.preview} alt={p.han+'字阅读版预览'}/></a><span><b>阅读版画面参考</b><small>核验原图清晰度时，请打开对应 PNG 原文件。</small></span></div>}
 <div className="full criteria"><h3>内容复核</h3>{checks.map(k=><label key={k}>{k}<select value={p.criteria?.[k]||'未检查'} onChange={e=>put('criteria',{...p.criteria,[k]:e.target.value})}>{['未检查','通过','不通过','待补证据'].map(o=><option key={o}>{o}</option>)}</select></label>)}</div>
 {fld('复核结论','conclusion',{long:true,wide:true,placeholder:'记录观测到的细节及结论',required:true})}</>:<>
 {fld(p.kind==='version'?'版本名称':'记录名称','title',{wide:true,required:true})}
 {p.kind==='part'&&<>{fld('分卷编号','volume',{opts:Array.from({length:25},(_,i)=>pad(i+1,3))})}{fld('实测字节数','bytes',{type:'number',required:true})}{fld('文件名','filename',{wide:true,required:true})}{fld('SHA-256（如有）','hash',{wide:true})}</>}
 {p.kind==='issue'&&<>{fld('问题类型','problem',{opts:problemTypes})}{fld('资源版本','edition',{opts:['跨版本',...editions]})}{fld('分卷','volume')}{fld('汉字或编号','han')}{fld('抽样批次','batch')}{fld('补齐措施','advice',{long:true,wide:true,required:true})}</>}
 {p.kind==='baseline'&&fld('目标汉字（可粘贴完整字表，自动去重）','chars',{long:true,wide:true,required:true})}
 {p.kind==='resource'&&fld('资料入口或清单地址','link',{wide:true,required:true})}
 {fld(p.kind==='version'?'变更说明':'核验说明','conclusion',{wide:true,long:true})}
 </>}
 {fld('核验状态','status',{opts:statuses})}{fld('复核人','reviewer',{required:true})}{fld(isR?'证据位置（归档路径、文件或链接）':'证据位置或来源','evidence',{wide:true,placeholder:'可定位到文件、页码、截图或审核单'})}
 </div>{error&&<p className="error" role="alert">{error}</p>}</div><div className="formFoot"><button type="button" disabled={busy} className="btn" onClick={close}>取消</button><Btn icon={Save} primary disabled={busy}>{busy?'保存中…':'保存记录'}</Btn></div></form></Modal>
}
