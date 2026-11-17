'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, ImagePlus, LoaderCircle, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Artwork, PersonalArt } from './data/rooms';
import { artworkDraft, validateArtworkDraft } from './artwork-details';
import { readImage } from './personal-art';

export default function ArtworkEditor({art, personal, initialFile, night, onClose, onSave}: {
  art: Artwork; personal?: PersonalArt; initialFile?: File | null; night: boolean;
  onClose: () => void; onSave: (item: PersonalArt) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => artworkDraft(art, personal));
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState(() => artworkDraft(art, personal).description?.join('\n\n') ?? '');
  const picker = useRef<HTMLInputElement>(null);
  const mounted = useRef(true), sequence = useRef(0), initialDone = useRef(false);
  const busy = reading || saving;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current++; }; }, []);
  useEffect(() => { if (initialFile && !initialDone.current) { initialDone.current = true; void chooseImage(initialFile); } }, [initialFile]);

  async function chooseImage(file: File) {
    const request = ++sequence.current;
    setReading(true); setError('');
    try {
      const image = await readImage(file);
      if (!mounted.current || sequence.current !== request) return;
      setDraft(current => {
        const next = {...current, ...image, imageChanged: true};
        // Clear untouched original labels only when an original image is replaced.
        // Preserve text the user has already written for their exhibit.
        if (!current.imageChanged) {
          if (current.name === art.title) next.name = file.name.replace(/\.[^.]+$/, '').slice(0, 100) || '我的作品';
          for (const field of ['artist', 'year', 'originalTitle', 'medium', 'sourceName', 'sourceUrl'] as const) {
            if (current[field] === (art[field] ?? '')) next[field] = field === 'sourceName' ? '个人收藏' : '';
          }
        }
        return next;
      });
      if (!draft.imageChanged && story.trim() === art.description.join('\n\n').trim()) setStory('');
    } catch (e) { if (mounted.current && sequence.current === request) setError((e as Error).message); }
    finally { if (mounted.current && sequence.current === request) setReading(false); }
  }

  async function save() {
    if (busy) return;
    setError('');
    let item: PersonalArt;
    try { item = validateArtworkDraft({...draft, description: story.split(/\n\s*\n|\n/)}); }
    catch (e) { setError((e as Error).message); return; }
    setSaving(true);
    try { await onSave(item); onClose(); }
    catch (e) { setError((e as Error).message || '保存失败，请重试。'); }
    finally { if (mounted.current) setSaving(false); }
  }

  const field = (key: 'name' | 'artist' | 'year' | 'originalTitle' | 'medium' | 'sourceName' | 'sourceUrl', label: string, maxLength: number, placeholder: string) => (
    <label className="art-edit-field"><span>{label}{key === 'name' && <em>*</em>}</span><Input value={draft[key] ?? ''} onChange={e => setDraft(current => ({...current, [key]: e.target.value}))} disabled={busy} maxLength={maxLength} placeholder={placeholder} required={key === 'name'}/></label>
  );

  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className={`art-editor ${night ? 'night' : ''}`} showCloseButton={false} onEscapeKeyDown={e => { if (busy) e.preventDefault(); }} onPointerDownOutside={e => e.preventDefault()}>
    <div className="art-editor-header"><div><span className="eyebrow">CURATE YOUR OWN STORY</span><DialogTitle className="serif">编辑画作与讲解</DialogTitle><DialogDescription>图片、作品信息和墙边铭牌会在保存后一起更新。</DialogDescription></div><Button variant="ghost" size="icon" aria-label="关闭编辑窗口" disabled={busy} onClick={onClose}><X size={20}/></Button></div>
    <div className="art-editor-body">
      <section className="art-editor-visual"><div className="editor-step"><span>01</span><h3>作品图片</h3></div>
        <div className="editor-image-space" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy && e.dataTransfer.files[0]) void chooseImage(e.dataTransfer.files[0]); }}><div className="editor-frame" style={{aspectRatio: `${art.width} / ${art.height}`, width: `min(100%, calc(var(--editor-preview-height) * ${art.width / art.height}))`}}><img src={draft.src} alt="当前画框中的图片预览" style={{objectFit: draft.fit}}/></div>{reading && <div className="editor-image-loading"><LoaderCircle size={26} className="spinning"/><span>正在读取图片…</span></div>}</div>
        <Button variant="outline" className="editor-upload" disabled={busy} onClick={() => picker.current?.click()}><ImagePlus size={18}/>选择或更换图片</Button>
        <input className="sr-only" type="file" accept="image/*" ref={picker} aria-label="选择新的画作图片" onChange={e => { if (e.target.files?.[0]) void chooseImage(e.target.files[0]); e.target.value = ''; }}/>
        <p className="editor-image-note">也可拖入图片，单张最大 20 MB。保持原画框比例，图片不会拉伸。</p>
        <RadioGroup value={draft.fit} onValueChange={fit => setDraft(current => ({...current, fit: fit as 'contain' | 'cover'}))} className="fit-options editor-fit" disabled={busy} aria-label="画框中的图片适配方式">{[{value:'contain',label:'完整显示',note:'保留全部内容，可能留边'},{value:'cover',label:'铺满画框',note:'等比填充，裁切边缘'}].map(option => <label key={option.value}><RadioGroupItem value={option.value}/><span><strong>{option.label}</strong><small>{option.note}</small></span></label>)}</RadioGroup>
        <div className="editor-caption-preview"><span>墙边铭牌预览</span><strong>{draft.name.trim() || '未命名作品'}</strong><p>{[draft.artist?.trim() || '未署名', draft.year?.trim()].filter(Boolean).join(' · ')}</p></div>
      </section>
      <section className="art-editor-fields"><div className="editor-step"><span>02</span><h3>作品信息</h3></div>
        {field('name','作品名称',100,'为这件作品起一个名字')}
        <div className="editor-field-row">{field('artist','作者 / 创作者',100,'例如：张三')}{field('year','创作年代',80,'例如：2026 年')}</div>
        {field('originalTitle','原文名 / 副标题',180,'可选，补充作品的其他名称')}
        <div className="editor-field-row">{field('medium','材质 / 类型',120,'例如：油画、摄影、数字艺术')}{field('sourceName','收藏方 / 来源',160,'例如：个人收藏')}</div>
        <label className="art-edit-field editor-story-field"><span>作品讲解<small>{story.length} / 6000</small></span><Textarea value={story} onChange={e => setStory(e.target.value)} disabled={busy} maxLength={6000} rows={7} placeholder="写下创作背景、画面内容、观看提示或这件作品的故事。换行后会按段落展示。"/></label>
        {field('sourceUrl','资料链接（可选）',1000,'https://')}
      </section>
    </div>
    <div className="art-editor-footer">{error && <div className="editor-error" role="alert"><CircleAlert size={17}/><span>{error}</span></div>}<div className="editor-save-row"><p>修改保存在当前浏览器。保存后可将整个布展导出为本地 HTML。</p><div><Button variant="outline" disabled={busy} onClick={onClose}>取消</Button><Button disabled={busy} onClick={() => void save()}>{saving ? <LoaderCircle className="spinning" size={17}/> : <Save size={17}/>}<span>{saving ? '正在保存…' : '保存图片与文字'}</span></Button></div></div></div>
  </DialogContent></Dialog>;
}
