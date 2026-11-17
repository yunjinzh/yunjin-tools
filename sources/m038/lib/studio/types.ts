export type Tool = 'orbit'|'spray'|'brush'|'text'|'sticker'|'fill'|'select'|'erase'|'annotation'|'inspect';
export type Settings = {tool:Tool;color:string;size:number;opacity:number;softness:number;rotation:number;text:string;font:string;sticker:string;image:string|null;roughness:number;metalness:number;};
export type LayerInfo = {id:string;name:string;kind:string;color:string;visible:boolean;opacity:number;size:number;rotation:number;};
export const MODELS=[
 {id:'pump',name:'模块化离心泵',category:'教学教具 · 8 个部件',url:'',format:'教具',size:'原创模型'},
 {id:'su7',name:'SU7 汽车',category:'汽车设计',url:'/models/su7/su7.glb',format:'GLB',size:'11.5 MB'},
 {id:'cbd',name:'CBD001 电子烟',category:'产品设计',url:'/models/cbd/CBD001_G.gltf',format:'GLTF',size:'2.4 MB'},
 {id:'mx3',name:'MX3 遥控器',category:'工业设计',url:'/models/mx3/MX3_G.gltf',format:'GLTF',size:'8.7 MB'},
];
export const COLORS=['#4856ed','#a34ff5','#ed4f66','#ff923d','#f5cf45','#91cc55','#17b99d','#39b8d2','#20242e','#ffffff'];
export const STICKERS=[{id:'yours',label:'生而不同',text:'MAKE IT\nYOURS',color:'#d4fa74'},{id:'four',label:'四维灵感',text:'4D',color:'#4856ed'},{id:'speed',label:'极速玩家',text:'SPEED\nCLUB',color:'#ff713e'},{id:'hello',label:'你好世界',text:'你好\n世界',color:'#ef68a6'},{id:'bold',label:'保持热爱',text:'STAY\nBOLD.',color:'#272d36'},{id:'future',label:'未来已来',text:'FUTURE\nIS NOW',color:'#5dccde'}];
export const DEFAULT_SETTINGS:Settings={tool:'orbit',color:'#4856ed',size:28,opacity:90,softness:65,rotation:0,text:'由我定义',font:'noto-sans',sticker:'yours',image:null,roughness:35,metalness:35};
