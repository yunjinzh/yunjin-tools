// Child-facing knowledge, independent of the 3D renderer and application UI.
// Sources and display conventions are documented in KNOWLEDGE-SOURCES.md.
export const KNOWLEDGE_TOPICS = [
  {
    id: 'astronomy', title: '日月星，谁在发光？', subtitle: '认识天空中的三位朋友',
    goal: '找出月亮的光从哪里来。', chapterIds: [5, 7],
    verseLinks: [{ chapterId: 5, verseIndex: 1 }],
    items: [
      { id: 'sun', title: '太阳', pinyin: 'tài yáng', summary: '太阳会发光，也会发热；它是一颗离我们很近的恒星。', detail: '恒星能发出自己的光。白天照亮地面的阳光，来自太阳。我们在画面里观察，不直视真实的太阳。' },
      { id: 'moon', title: '月亮', pinyin: 'yuè liang', summary: '月亮反射太阳的光；我们看见的月光来自阳光。', detail: '月亮本身不发出照亮夜空的可见光。它朝向太阳的一面被照亮，另一面较暗。画面只示意受光，不是月相或距离的精确模型。' },
      { id: 'star', title: '远方恒星', pinyin: 'yuǎn fāng héng xīng', summary: '这里的远方恒星也会发光，太阳同样是一颗恒星。', detail: '恒星离我们很远，看起来像小亮点。夜空里有些亮点其实是行星；古书的“星”不能一律理解成恒星。' }
    ],
    question: {
      prompt: '我们看到的月光，主要是怎样来的？',
      options: [{ id: 'reflect', text: '月亮把太阳的光反射过来' }, { id: 'own-light', text: '月亮像太阳一样自己发光' }],
      answer: 'reflect', explanation: '阳光照到月亮，部分光被反射到我们这里。太阳和远方恒星能发出自己的光。'
    },
    note: '物体大小、颜色和距离经过示意处理。“星”在本场景选取远方恒星作例子。请勿直视真实太阳。',
    sources: [
      { title: 'NASA：太阳的科学事实', url: 'https://science.nasa.gov/sun/facts/' },
      { title: 'NASA：月光来自哪里', url: 'https://science.nasa.gov/moon/moonlight/' },
      { title: 'NASA：观星入门', url: 'https://science.nasa.gov/skywatching/' }
    ]
  },
  {
    id: 'seasons', title: '同一棵树，四个季节', subtitle: '观察一棵银杏的变化',
    goal: '比较叶子的颜色和多少，说出一处变化。', chapterIds: [6, 9],
    verseLinks: [{ chapterId: 6, verseIndex: 0 }, { chapterId: 9, verseIndex: 2 }],
    items: [
      { id: 'spring', title: '春', pinyin: 'chūn', summary: '春天，这棵银杏的芽慢慢展开，长出嫩叶。', detail: '看看枝条上新出现的小叶子。不同地方回暖的时间不同，真实银杏不会在同一天一起发芽。' },
      { id: 'summer', title: '夏', pinyin: 'xià', summary: '夏天，树上有许多绿色的扇形叶片。', detail: '叶片展开后像小扇子。和春天相比，画面里的树冠更茂密；可以找找叶子的形状。' },
      { id: 'autumn', title: '秋', pinyin: 'qiū', summary: '秋天，这棵银杏的叶子变黄，随后落下。', detail: '同一棵树，叶色会随季节改变。银杏秋叶常呈黄色，落叶的时间也会随天气和地区不同。' },
      { id: 'winter', title: '冬', pinyin: 'dōng', summary: '冬天，叶子落去后，更容易看清枝条和芽。', detail: '落叶不等于树死了。这里展示北半球温带银杏的季节变化，不表示所有树冬天都落叶，也不表示冬天一定下雪。' }
    ],
    question: {
      prompt: '这棵银杏的叶子变成黄色、随后落下，是哪个季节的示意？',
      options: [{ id: 'autumn', text: '秋天' }, { id: 'summer', text: '夏天' }],
      answer: 'autumn', explanation: '这是秋天的变化。我们观察的是北半球温带的一棵银杏；别的植物、地区可能不同。'
    },
    note: '以北半球温带银杏为例。画面简化了变化过程；实际物候随地区、天气与树木而异，不用于解释四季成因。',
    sources: [
      { title: '哈佛大学阿诺德树木园：银杏及物候差异', url: 'https://arboretum.harvard.edu/arnoldia-stories/wake-up-and-smell-the-ginkgos/' },
      { title: '北卡罗来纳州立大学：银杏植物资料', url: 'https://plants.ces.ncsu.edu/plants/ginkgo-biloba/' },
      { title: '密苏里大学：银杏秋叶观察', url: 'https://ipm.missouri.edu/garden/rock_F10.cfm' }
    ]
  },
  {
    id: 'history', title: '先后发生，也能同时存在', subtitle: '用时间卡读懂历史',
    goal: '先排夏商周，再找出曾同时存在的政权。', chapterIds: [23, 24, 29, 33],
    verseLinks: [{ chapterId: 24, verseIndex: 0 }, { chapterId: 24, verseIndex: 1 }, { chapterId: 24, verseIndex: 2 }, { chapterId: 29, verseIndex: 0 }, { chapterId: 29, verseIndex: 1 }],
    items: [
      { id: 'xia', title: '夏', pinyin: 'xià', summary: '在夏、商、周的传统顺序中，夏排在前面。', detail: '先按“夏、商、周”认识顺序。早期年代与细节仍有研究，本页不把推算年份当成精确刻度。' },
      { id: 'shang', title: '商', pinyin: 'shāng', summary: '商接在夏之后，周之前。', detail: '顺序卡帮助我们看先后，不表示同一时期只有一个人群或文化生活在这片土地上。' },
      { id: 'zhou', title: '周', pinyin: 'zhōu', summary: '周接在商之后；周又分为西周和东周。', detail: '这三个字先连成一条顺序。下一步看看宋、辽、金：历史中也有多个政权同时存在。' },
      { id: 'song', title: '宋', pinyin: 'sòng', summary: '宋从 960 年到 1279 年，分为北宋和南宋。', detail: '1127 年是北宋到南宋的转折年。1100 年宋、辽同时存在；1150 年则是南宋与金同时存在。' },
      { id: 'liao', title: '辽', pinyin: 'liáo', summary: '辽与北宋曾同时存在，并不是等宋结束才开始。', detail: '本页以 916—1125 年表示辽。也有年表从 907 年契丹建政起算；选择 1120 年，可看到北宋、辽、金都在。' },
      { id: 'jin', title: '金', pinyin: 'jīn', summary: '金从 1115 年到 1234 年，与宋曾同时存在。', detail: '1120 年，北宋、辽、金同时存在；1150 年，辽已结束，南宋与金仍在。它们并非从头到尾都同时存在。' }
    ],
    question: {
      prompt: '选到 1120 年，宋、辽、金的时间条告诉我们什么？',
      options: [{ id: 'coexist', text: '三个政权曾在同一年存在' }, { id: 'one-by-one', text: '必须等宋结束，辽和金才开始' }],
      answer: 'coexist', explanation: '1120 年处在三个时间范围内，所以当时北宋、辽、金同时存在。换一年，结果可能不同。'
    },
    note: '只选部分政权比较时间，不是完整历史，也不是疆域地图。起止年按年粒度示意；交替年份不代表全年局势相同。',
    sources: [
      { title: '中国国家博物馆：夏商西周时期', url: 'https://www.chnmuseum.cn/portals/0/web/zt/gudai/detail2.html' },
      { title: '香港艺术馆茶具文物馆：年代参照表', url: 'https://hk.art.museum/documents/tea-ware/Getting_to_know_about_CHINA.pdf' },
      { title: '教育部辞典附录：中国历代年号表', url: 'https://dict.revised.moe.edu.tw/appendix.jsp?ID=3&page=5' },
      { title: '亚洲艺术博物馆：宋与并存政权', url: 'https://education.asianart.org/resources/an-introduction-to-the-song-dynasty/' }
    ]
  }
];

export const HISTORY_ERAS = [
  { id: 'song', title: '宋', start: 960, end: 1279, color: '#dfb77b', phases: [{ title: '北宋', start: 960, end: 1127 }, { title: '南宋', start: 1127, end: 1279 }] },
  { id: 'liao', title: '辽', start: 916, end: 1125, color: '#88b6a5' },
  { id: 'jin', title: '金', start: 1115, end: 1234, color: '#c98a67' }
];

/** Annual comparison, inclusive of labelled start/end years; not a day-level chronology. */
export function activeDynasties(year) {
  if (!Number.isInteger(year)) return [];
  return HISTORY_ERAS.filter(era => year >= era.start && year <= era.end).map(era => ({
    ...era,
    ...(era.phases ? { phases: era.phases.map(phase => ({ ...phase })) } : {}),
    label: era.id === 'song' ? year === 1127 ? '北宋转南宋' : year < 1127 ? '北宋' : '南宋' : era.title,
    transition: era.id === 'song' && year === 1127
  }));
}

const topicById = new Map(KNOWLEDGE_TOPICS.map(topic => [topic.id, topic]));
const earlyOrderIds = new Set(['xia', 'shang', 'zhou']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const uniqueKnown = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string' && allowed.has(item)))] : [];
function freshProgress(topic) { return { seen: [], solved: false, helped: false, ...(topic === 'history' ? { order: [] } : {}) }; }

/** Only known topics/items are retained; no completion percentage or ability score. */
export function normalizeKnowledgeProgress(raw) {
  const clean = {};
  if (!isRecord(raw)) return clean;
  for (const topic of KNOWLEDGE_TOPICS) {
    if (!Object.hasOwn(raw, topic.id) || !isRecord(raw[topic.id])) continue;
    const entry = raw[topic.id];
    clean[topic.id] = {
      seen: uniqueKnown(entry.seen, new Set(topic.items.map(item => item.id))),
      solved: entry.solved === true,
      helped: entry.helped === true,
      ...(topic.id === 'history' ? { order: uniqueKnown(entry.order, earlyOrderIds).slice(0, 3) } : {})
    };
  }
  return clean;
}

/** Return a new validated map. Reading an item does not solve its question. */
export function recordKnowledgeVisit(progress, topic, item) {
  const clean = normalizeKnowledgeProgress(progress);
  if (!topicById.get(topic)?.items.some(candidate => candidate.id === item)) return clean;
  const entry = clean[topic] ?? freshProgress(topic);
  if (!entry.seen.includes(item)) entry.seen.push(item);
  clean[topic] = entry;
  return clean;
}

/** `solved` means this question was answered, including after help, never mastery. */
export function recordKnowledgeAnswer(progress, topic, result = {}) {
  const clean = normalizeKnowledgeProgress(progress);
  if (!topicById.has(topic) || !isRecord(result) || typeof result.correct !== 'boolean') return clean;
  const entry = clean[topic] ?? freshProgress(topic);
  entry.solved = entry.solved || result.correct;
  // A retry is retained as a need for support instead of being erased by a later click.
  entry.helped = entry.helped || result.helped === true || !result.correct;
  clean[topic] = entry;
  return clean;
}

/** Keep the child's chosen order, including an incorrect one, so it can be resumed. */
export function recordKnowledgeOrder(progress, order) {
  const clean = normalizeKnowledgeProgress(progress);
  const entry = clean.history ?? freshProgress('history');
  entry.order = uniqueKnown(order, earlyOrderIds).slice(0, 3);
  clean.history = entry;
  return clean;
}

/** Union observations; keep assistance; the longer order wins, ties stay local. */
export function mergeKnowledgeProgress(local, incoming) {
  const a = normalizeKnowledgeProgress(local), b = normalizeKnowledgeProgress(incoming);
  for (const topic of KNOWLEDGE_TOPICS) {
    const left = a[topic.id], right = b[topic.id];
    if (!right) continue;
    if (!left) { a[topic.id] = right; continue; }
    a[topic.id] = {
      seen: [...new Set([...left.seen, ...right.seen])],
      solved: left.solved || right.solved,
      helped: left.helped || right.helped,
      ...(topic.id === 'history' ? { order: [...(right.order.length > left.order.length ? right.order : left.order)] } : {})
    };
  }
  return a;
}
