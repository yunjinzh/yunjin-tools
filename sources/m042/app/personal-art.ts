import type { PersonalArt } from './data/rooms';
import { embeddedGallery, galleryStorageName, mergePersonalArt, type StoredArtwork } from './gallery-assets';
const openDB=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(galleryStorageName(),1);r.onupgradeneeded=()=>r.result.createObjectStore('artworks',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export async function loadPersonalArt(){
 const initial=embeddedGallery()?.personal??[];
 try{const db=await openDB();const stored=await new Promise<StoredArtwork[]>((resolve,reject)=>{const t=db.transaction('artworks','readonly'),r=t.objectStore('artworks').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close();t.onabort=()=>{db.close();reject(t.error)}});return mergePersonalArt(initial,stored)}
 catch(error){if(embeddedGallery())return mergePersonalArt(initial,[]);throw error}
}
export async function savePersonalArt(art:PersonalArt){const db=await openDB();return new Promise<void>((resolve,reject)=>{const t=db.transaction('artworks','readwrite');t.objectStore('artworks').put(art);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>{db.close();reject(t.error)}});}
export async function removePersonalArt(id:string){const db=await openDB();return new Promise<void>((resolve,reject)=>{const t=db.transaction('artworks','readwrite');if(embeddedGallery()?.personal.some(item=>item.id===id))t.objectStore('artworks').put({id,reset:true});else t.objectStore('artworks').delete(id);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>{db.close();reject(t.error)}});}
export async function readImage(file:File):Promise<{src:string;width:number;height:number}>{
 if(!file.type.startsWith('image/'))throw new Error('请选择 JPG、PNG、WebP 等图片文件。');
 if(file.size>20*1024*1024)throw new Error('图片太大，请选择 20 MB 以内的文件。');
 const url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||!img.naturalHeight)throw new Error('无法识别图片尺寸。');const scale=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=c.getContext('2d')!;ctx.fillStyle='#f4f0e8';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return {src:c.toDataURL('image/jpeg',.9),width:c.width,height:c.height};}catch(e){if(e instanceof Error&&e.message==='无法识别图片尺寸。')throw e;throw new Error('无法读取这张图片，请转换为 JPG、PNG 或 WebP 后再试。');}finally{URL.revokeObjectURL(url)}
}
