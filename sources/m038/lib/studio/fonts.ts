export type StudioFont = {value:string;label:string;family:string;weight:number;local?:boolean};

export const BUILTIN_FONTS:StudioFont[] = [
  {value:'noto-sans',label:'Noto 黑体',family:'Noto Sans SC',weight:700},
  {value:'noto-serif',label:'Noto 宋体',family:'Noto Serif SC',weight:700},
  {value:'zcool-kuaile',label:'站酷快乐体',family:'ZCOOL KuaiLe',weight:400},
];

// Uploaded faces use an internal family identifier, never the user-supplied filename.
export function resolveFont(value:string):StudioFont {
  return BUILTIN_FONTS.find(font=>font.value===value) ??
    (/^SiweiLocal_[a-f0-9]+$/.test(value)
      ? {value,label:'本地字体',family:value,weight:400,local:true}
      : BUILTIN_FONTS[0]);
}

export function fontFamily(value:string){return `"${resolveFont(value).family}", "Noto Sans SC", sans-serif`;}
export function canvasFont(value:string,size=90){const font=resolveFont(value);return `${font.weight} ${size}px ${fontFamily(value)}`;}
