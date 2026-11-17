import type { Landmark, ModelBundle, ModelFile } from './data/types';
export const MAX_BYTES=120*1024*1024;
export function cleanPath(path:string){let value=path;try{value=decodeURIComponent(path)}catch{}const parts:string[]=[];for(const p of value.replaceAll('\\','/').split('/')){if(!p||p==='.')continue;if(p==='..'){parts.pop();continue;}parts.push(p);}return parts.join('/');}
export function prepareBundle(files:File[],entry?:string):ModelBundle{
 if(!files.length)throw new Error('请先选择模型文件。');
 if(files.length>500)throw new Error('单次最多导入 500 个模型及资源文件。');
 if(files.reduce((sum,f)=>sum+f.size,0)>MAX_BYTES)throw new Error('模型和配套资源总大小不能超过 120 MB，请先压缩纹理或精简模型。');
 const packed:ModelFile[]=files.map(f=>({path:cleanPath(f.webkitRelativePath||f.name),blob:f}));
 const entries=packed.filter(f=>/\.(glb|gltf)$/i.test(f.path));
 if(!entries.length)throw new Error('未找到 .glb 或 .gltf 模型，请将模型和配套资源一起选择。');
 const main=entry?entries.find(f=>f.path===entry):entries[0];if(!main)throw new Error('未找到所选的主模型文件。');
 const duplicates=new Set<string>();for(const f of packed){if(duplicates.has(f.path))throw new Error('存在同名资源，请改用文件夹方式保留目录结构。');duplicates.add(f.path);}
 return {entry:main.path,files:packed};
}
export async function getModelDocument(bundle:ModelBundle){const file=bundle.files.find(f=>f.path===bundle.entry);if(!file)throw new Error('模型主文件缺失。');const data=await file.blob.arrayBuffer();let document:Record<string,any>;try{if(/\.glb$/i.test(bundle.entry)){if(data.byteLength<20)throw new Error();const view=new DataView(data);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.byteLength||view.getUint32(16,true)!==0x4e4f534a)throw new Error();const len=view.getUint32(12,true);if(len>data.byteLength-20)throw new Error();document=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,len)).replace(/\0+$/,''));}else document=JSON.parse(new TextDecoder().decode(data));}catch{throw new Error('文件不是有效的 glTF 2.0 / GLB 模型，或文件尚未完整下载。');}if(document.asset?.version!=='2.0')throw new Error('目前支持 glTF 2.0，请重新导出为 glTF 2.0 或 GLB。');return {document,data};}
export function createFileResolver(bundle:ModelBundle){
 const files=new Map(bundle.files.map(f=>[cleanPath(f.path),f]));const prefix=bundle.entry.includes('/')?bundle.entry.slice(0,bundle.entry.lastIndexOf('/')+1):'';
 return (uri:string):ModelFile|undefined=>{if(/^(data:|blob:)/i.test(uri))return undefined;if(/^(https?:|file:|\/\/)/i.test(uri))throw new Error('模型引用了外部资源，请下载该资源并与模型一起导入。');const path=cleanPath(prefix+uri),exact=files.get(path)||files.get(cleanPath(uri));if(exact)return exact;const name=cleanPath(uri).split('/').pop();const candidates=bundle.files.filter(f=>cleanPath(f.path).split('/').pop()===name);if(candidates.length===1)return candidates[0];if(candidates.length>1)throw new Error(`资源「${name}」有多个同名文件，请选择完整模型文件夹。`);throw new Error(`缺少资源「${uri}」。请选择 .gltf 文件及对应的 .bin、纹理，或导入整个模型文件夹。`);};
}
export async function validateBundle(bundle:ModelBundle){const parsed=await getModelDocument(bundle),resolve=createFileResolver(bundle);for(const item of [...(parsed.document.buffers||[]),...(parsed.document.images||[])])if(typeof item.uri==='string'&&!/^(data:|blob:)/i.test(item.uri))resolve(item.uri);return parsed;}
function openDB(){return new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('city-atlas-personal-models',1);request.onupgradeneeded=()=>{request.result.createObjectStore('landmarks',{keyPath:'id'});request.result.createObjectStore('models')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function readSavedLandmarks(){const db=await openDB();return new Promise<Landmark[]>((resolve,reject)=>{const tx=db.transaction('landmarks','readonly'),r=tx.objectStore('landmarks').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});}
export async function readSavedBundle(id:string){const db=await openDB();return new Promise<ModelBundle>((resolve,reject)=>{const tx=db.transaction('models','readonly'),r=tx.objectStore('models').get(id);r.onsuccess=()=>r.result?resolve(r.result):reject(new Error('未找到本地模型文件，请重新导入。'));r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});}
export async function saveLandmark(item:Landmark,bundle?:ModelBundle){const db=await openDB();return new Promise<void>((resolve,reject)=>{const tx=db.transaction(bundle?['landmarks','models']:['landmarks'],'readwrite');tx.objectStore('landmarks').put(item);if(bundle)tx.objectStore('models').put(bundle,item.id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(new Error('浏览器存储空间不足，或当前模式不允许保存。请释放空间后重试。'))};tx.onabort=()=>{db.close();reject(new Error('保存被中断，请重试。'))};});}
