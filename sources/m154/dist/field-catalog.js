export const fieldGroups = {
  cbd: '国贸与朝阳',
  hutong: '南锣鼓巷与周边胡同',
  waterfront: '什刹海水岸',
  palace: '故宫太和殿',
  avenue: '东长安街',
  tiananmen: '天安门与正阳门',
  garden: '海淀 · 谐趣园全景',
  neighborhood: '朝阳 · 望春园全景'
};

const aliases = {zun: 'cbd', cctv: 'cbd', guomao: 'cbd', gate: 'tiananmen', xiequ: 'garden', wangchunyuan: 'neighborhood'};
export const fieldGroupFor = id => aliases[id] || id;

let pending;

export function loadFieldCatalog() {
  if (!pending) {
    pending = Promise.all(['field/index.json', 'field/urban-index.json'].map(async url => {
      const response = await fetch(new URL(url, import.meta.url));
      if (!response.ok) throw new Error('影像目录读取失败');
      return response.json();
    })).then(groups => Object.assign({}, ...groups)).catch(error => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
