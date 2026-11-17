/* Gallery configuration: add a real gallery only after its artworks are available.
   IDs and artwork IDs are permanent; changing the style never changes a saved collection. */
window.MUSEUM_GALLERY_CONFIG = {
  version: 1,
  layout: { maxZonesPerPage: 10, worksPerZone: 10 },
  galleries: [
    { id: 'A', title: 'A馆 · 文明回廊', subtitle: '暖石 / 黄铜 / 日光', style: 'classic', layout: 'ring', enabled: true },
    { id: 'B', title: 'B馆 · 叠院美术馆', subtitle: '双翼 / 中庭 / 空中连桥', style: 'modern', layout: 'terraced', enabled: true },
    { id: 'C', title: 'C馆 · 京华院落', subtitle: '北京 / 中轴 / 回廊', style: 'beijing', layout: 'courtyard', pageCapacity: 30, enabled: true }
  ],
  styles: {
    beijing: { name: '京华院落馆', status: 'ready', accent: '#c4a575', description: '灰砖朱柱、木檐回廊、串联院落与开放中轴；北京艺术地图主题。' },
    classic: { name: '经典暖石馆', status: 'ready', accent: '#d9b676', description: '厚石墙、黄铜画框、立式展板与中央玻璃天窗。' },
    modern: { name: '现代叠院馆', status: 'ready', accent: '#b88b59', description: '矩形双翼、两层展廊、中央挑空、暖木展墙与两座空中连桥。' },
    sculpture: { name: '白色雕塑馆', status: 'template', accent: '#d4cdbd', description: '扩展风格蓝图：白色体块、曲面展墙与雕塑式基座。尚未建馆，不包含展品。' },
    conservatory: { name: '植物光庭', status: 'template', accent: '#a8c887', description: '扩展风格蓝图：植物庭院、透光屋面与木质展示架。尚未建馆，不包含展品。' }
  }
};
