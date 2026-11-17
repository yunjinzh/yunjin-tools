import { copyFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const pdf = "/workspace/scratch/872e9ce682d1/upload/（根据2022年版课程标准修订）义务教育教科书·语文四年级上册.pdf";

const maps = {
  "u1-1": { pages: [7,8,9], tasks: ["有感情地朗读课文。背诵第3—4自然段。", "说说课文是按照什么顺序描写钱塘江大潮的，你的脑海中浮现出怎样的画面，选择印象最深的和同学交流。", "读《浪淘沙（其七）》，从课文中找出与诗的内容相关的句子，再抄写下来。"] },
  "u1-2": { pages: [10,11], tasks: ["有感情地朗读课文。说说你的脑海中浮现出怎样的画面。", "作者在家乡、南京、海上看繁星，感受有什么不同？", "小练笔：你也看过夜晚的星空吧？试着写写你当时的所见所想。"] },
  "u1-3": { pages: [12,13], tasks: ["反复朗读《秋晚的江上》《花牛歌》，说说诗中描绘了哪些景物，这些景物构成了怎样的画面。"] },
  "u1-talk": { pages: [14], tasks: ["围绕身边的环境问题、危害、治理情况和可行做法进行交流。", "围绕话题发表看法，不跑题；判断别人的发言是否与话题相关。", "讨论后选出十项简单易行的做法，形成《保护环境小建议》。"] },
  "u1-write": { pages: [15], tasks: ["推荐一个好地方，写清楚这个地方在哪里、有什么特别之处。", "如果有多个推荐理由，可以分段说明。", "写完先自读，再请同学提出修改建议。"] },
  "u1-garden": { pages: [16,17], tasks: ["结合文章交流自己怎样展开想象。", "由词语想象画面，比较句式表达效果。", "用表示时间变化的词语描绘一个事物。"] },

  "u2-4": { pages: [19,20,21,22,23], tasks: ["把你读课文时想到的问题写下来。", "小组交流并整理问题清单，说说问题可以从哪些范围提出。", "思考豌豆苗的成长为什么会给小女孩带来变化。"] },
  "u2-5": { pages: [24,25,26,27], tasks: ["分小组整理问题清单，说一说问题是从哪些角度提出的。", "从课文内容、课文写法、联系生活等不同角度提出问题。", "读科普片段，试着从不同角度提出问题并交流。"] },
  "u2-6": { pages: [28,29,30,31,32], tasks: ["分小组整理问题清单，筛选出对理解课文最有帮助的问题。", "讨论哪些问题不影响理解、哪些问题能帮助理解、哪些问题能引发深入思考。", "结合生活实际，说说这个故事给你的启发。"] },
  "u2-7": { pages: [33,34], tasks: ["默读课文，提出自己的问题，再试着把问题分分类。", "选出你认为值得思考的问题，并尝试解决。"] },
  "u2-write": { pages: [35], tasks: ["选择一个或几个家人，结合具体事例写出特点。", "注意把印象最深的地方写出来。", "读给同桌和家人听，根据反馈修改。"] },
  "u2-garden": { pages: [36,37], tasks: ["交流主动提问、从不同角度提问、筛选有价值问题的体会。", "体会重复表达与概括表达的不同效果。", "学习设问句，积累有关求学与提问的名句。"] },

  "u3-8": { pages: [39,40], tasks: ["有感情地朗读并背诵三首古诗，默写《题西林壁》。", "说说《暮江吟》写了哪两个时间段的景色，作者观察了哪些景物。", "理解“不识庐山真面目，只缘身在此山中”和“梅须逊雪三分白，雪却输梅一段香”。"] },
  "u3-9": { pages: [41,42,43], tasks: ["朗读课文，说说从哪些地方可以看出作者观察得特别仔细。", "结合相关语句，说说爬山虎是怎样一脚一脚往上爬的。", "找出写得准确、形象的句子，抄写下来。"] },
  "u3-10": { pages: [44,45,46,47], tasks: ["默读课文，说说课文围绕蟋蟀的住宅讲了哪两方面的内容，作者是怎样观察的。", "用自己的话介绍蟋蟀住宅的修建过程，想想为什么称为伟大的工程。", "比较课文的拟人表达与说明性片段在表达上的不同。"] },
  "u3-talk": { pages: [48], tasks: ["调查本班视力情况，分析影响视力的原因并提出保护建议。", "小组讨论时控制音量，不干扰其他小组。", "不重复别人说过的话；想法接近时，先认同再补充。"] },
  "u3-write": { pages: [49], tasks: ["选择一个对象进行连续观察。", "分次记录对象的变化、观察过程、想法和心情，可配图或表格。", "整理观察日记并分享，评价是否细致、准确、丰富。"] },
  "u3-garden": { pages: [50,51], tasks: ["交流细致观察、连续观察和多感官观察的认识。", "比较“逐渐、最多”等词语在准确表达中的作用。", "积累与秋季气候有关的谚语。"] },

  "u4-11": { pages: [53,54], tasks: ["按照故事的发展顺序，说说盘古开天地的过程。", "找出神奇的地方，边读边想象画面，再说说心目中的盘古。", "选做：收集中国神话故事，讲给同学听。"] },
  "u4-12": { pages: [55], tasks: ["正确、流利地朗读课文并背诵。", "结合注释，用自己的话讲讲精卫填海的故事。", "精卫给你留下了怎样的印象？和同学交流。"] },
  "u4-13": { pages: [56,57,58], tasks: ["朗读课文，注意读好故事中人物的名字。", "按照起因、经过、结果的顺序复述故事。", "故事中哪个情节触动了你？和同学交流。"] },
  "u4-14": { pages: [59,60], tasks: ["默读课文，说说故事的起因、经过和结果。", "发挥想象，把女娲从各地拣来五种颜色石头的过程说清楚、说生动。"] },
  "u4-write": { pages: [61], tasks: ["选择一位熟悉、喜欢的故事人物，想象和他（她）共度一天。", "想清楚去哪里、做什么、发生什么故事。", "先在小组交流，再写下来，根据意见认真修改。"] },
  "u4-garden": { pages: [62,63], tasks: ["交流自己对神话的想象、人物和文化意义的认识。", "由词语联想神话人物或故事，体会省略号的作用。", "积累古诗《嫦娥》。"] },
  "u4-read": { pages: [64,65], tasks: ["阅读更多中国神话，感受神话的宏大想象和开拓精神。", "阅读世界各地神话，认识鲜明人物形象。", "发挥想象，并与他人交流阅读感受。"] },

  "u5-15": { pages: [67,68,69], tasks: ["朗读课文，说说事情的起因、经过和结果。", "找出相关句子，说说课文怎样写清老麻雀的无畏、猎狗的攻击与退缩。"] },
  "u5-16": { pages: [70,71], tasks: ["说说课文写了一件什么事，是按照什么顺序写的。", "找出课文怎样把“我”从不敢爬到爬上峰顶的过程写清楚。"] },
  "u5-try": { pages: [72,74,75,76,77], tasks: ["看图并发挥想象，把图片内容说清楚。", "观察家人做家务的过程，用动作词写一段话。", "借助《我家的杏熟了》《小木船》学习按顺序、抓重点、处理详略。"] },
  "u5-write": { pages: [73], tasks: ["选择一件印象深的事，按一定顺序写清楚。", "写前想清起因、经过和结果。", "读给同学听，根据“是否写清楚”修改。"] },

  "u6-17": { pages: [79,80,81], tasks: ["朗读课文，说说哪些地方可以看出长城是世界历史上的伟大奇迹。", "默读第2自然段，借助图示介绍长城的构造及各部分作用。", "收集资料，制作一张中国世界文化遗产资料卡。"] },
  "u6-18": { pages: [82,83,84], tasks: ["朗读课文，梳理作者的游览顺序并找出依据。", "说说颐和园有哪些吸引你的地方，摘抄喜欢的句段。", "结合材料说明颐和园的独特之处。", "借助资料卡，交流自己了解的中国世界文化遗产。"] },
  "u6-19": { pages: [85,86], tasks: ["默读课文，说说课文从哪些方面介绍秦兵马俑。", "说说印象最深的是哪个方面；有兴趣可以继续查找资料。"] },
  "u6-talk": { pages: [87], tasks: ["根据介绍内容分类、筛选资料，撰写讲解词。", "按一定顺序讲述，语气语速适当，用动作表情辅助。", "根据听众反应调整讲解内容，并参考建议完善。"] },
  "u6-write": { pages: [88], tasks: ["选择一项中国世界文化遗产介绍。", "将整理后的资料用自己的话写下来；引用时注明来源，可用图片或表格。", "互评并修改完善，形成班级作品集。"] },
  "u6-garden": { pages: [89,90,91], tasks: ["交流怎样借助关键语句把握文章主要内容。", "学习易错字、数字说明和修改符号。", "练习连贯、匀速书写，积累《黄鹤楼送孟浩然之广陵》。"] },

  "u7-20": { pages: [93,94,95,96,97], tasks: ["结合课文批注，说说可以从哪些角度作批注。", "边默读边画词句，体会“我”见到鹅和被鹅袭击时的心情。", "说说为什么直到现在“我”还记着金奎叔的话。"] },
  "u7-21": { pages: [98,99,100,101,102], tasks: ["默读课文，在不理解的地方作批注并交流。", "填写“心情—原因”表格，再借助表格复述课文。", "结合生活经验说说“我”的演出是否窝囊，可以怎样开导“我”。", "选做：写一次自己记忆模糊却印象深刻的经历。"] },
  "u7-22": { pages: [103,104,105,106], tasks: ["默读课文，在体会比较深的地方作批注。", "找出心情变化的相关语句，交流体会。", "结合课文理解“人不可貌相，海水不可斗量”。"] },
  "u7-23": { pages: [107], tasks: ["正确、流利地朗读并背诵课文。", "结合注释，用自己的话讲讲故事。", "说说王戎为什么认为“树在道边而多子，此必苦李”。"] },
  "u7-talk": { pages: [108], tasks: ["选择一个情境，设身处地体会对方心情。", "选择合适方式进行安慰，语气诚恳、态度真诚。", "和同学模拟练习，并尝试安慰身边有需要的人。"] },
  "u7-write": { pages: [109], tasks: ["选择一件令自己心儿怦怦跳的事情。", "写清楚事情的经过和当时的感受。", "运用恰当的心情词句，写完修改并誊写。"] },
  "u7-garden": { pages: [110,111], tasks: ["交流批注的位置、角度、方法和回读习惯。", "理解并运用生活中的惯用语。", "用动作描写表现心情，积累有关长处、机会、诚信的名句。"] },

  "u8-24": { pages: [113,114], tasks: ["朗读课文，用自己的话说说主要内容。", "联系新时代发展成就，说说对“我将无我，不负人民”的理解。", "分享一句自己印象深刻、充满智慧的“金句”。"] },
  "u8-25": { pages: [115,116,117,118,119], tasks: ["默读课文，想想讲了哪几件事，再连起来说说主要内容。", "查阅资料了解当时的社会状况，理解少年周恩来立志的原因。", "小练笔：写清楚自己为什么而读书。"] },
  "u8-26": { pages: [120,121], tasks: ["有感情地朗读诗歌。", "查找资料，了解延河、枣园、南泥湾、杨家岭的光辉历史。", "思考诗中追寻的是什么，为什么今天仍需要追寻。"] },
  "u8-27": { pages: [122,123], tasks: ["有感情地朗读并背诵三首古诗，默写《出塞》《夏日绝句》。", "结合注释说说重点诗句的意思，交流从中体会到的情感。"] },
  "u8-write": { pages: [124], tasks: ["学习称呼、问候语、正文、祝福语、署名和日期的书信格式。", "给亲友或其他人写一封信。", "了解写信封的注意事项，可通过邮局或电子邮件发送。"] },
  "u8-garden": { pages: [125,126], tasks: ["交流关注人物言行、串联事件、借助关键句等概括方法。", "积累形容志向、品格和公正的词语。", "体会反问与陈述的不同语气，并在情境中练习表达。"] }
};

const raw = execFileSync("pdftotext", ["-raw", pdf, "-"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
const pdfPages = raw.split("\f");

const pinyinOnly = /^[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/;
const labelPattern = /^(阅读|口语交际|习作|语文园地|资料袋|阅读链接|小练笔|选做|你读过吗|相信你可以读更多|梳理与交流|词句段运用|识字加油站|书写提示|日积月累|初试身手|快乐读书吧)$/;
const headingPattern = /^(观潮|繁星|现代诗二首|秋晚的江上|花牛歌|一个豆荚里的五粒豆|夜间飞行的秘密|方帽子店|田忌赛马|古诗三首|暮江吟|题西林壁|雪梅|爬山虎的脚|蟋蟀的住宅|盘古开天地|精卫填海|普罗米修斯|女娲补天|麻雀|爬天都峰|我家的杏熟了|小木船|长城|颐和园|秦兵马俑|牛和鹅|一只窝囊的大老虎|陀螺|王戎不取道旁李|我将无我，不负人民|为中华之崛起而读书|延安，我把你追寻|凉州词|出塞|夏日绝句|写信|推荐一个好地方|我的家人|写观察日记|生活万花筒|中国的世界文化遗产|我的心儿怦怦跳|很久很久以前)$/;

function cleanPage(pageNo) {
  const source = pdfPages[pageNo - 1] ?? "";
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const kept = [];
  for (let line of lines) {
    if (/仅供个人学习使用/.test(line)) continue;
    if (/^\d{1,3}$/.test(line)) continue;
    if (pinyinOnly.test(line) && /[A-Za-z]/.test(line)) continue;
    line = line.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
    line = line.replace(/(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, "");
    line = line.replace(/\s+([，。！？；：、])/g, "$1");
    if (line) kept.push(line);
  }

  const grouped = [];
  const vocabCandidate = (line) => {
    if (/[。！？；：，、（）《》]/.test(line)) return false;
    const chars = line.match(/[\u3400-\u9fff]/g) ?? [];
    return chars.length > 0 && chars.length <= 12 && line.replace(/[\u3400-\u9fff\s*①②③④⑤⑥⑦⑧⑨]/g, "") === "";
  };
  for (let i = 0; i < kept.length;) {
    if (!vocabCandidate(kept[i]) || headingPattern.test(kept[i]) || labelPattern.test(kept[i])) {
      grouped.push(kept[i]);
      i += 1;
      continue;
    }
    let end = i;
    while (end < kept.length && vocabCandidate(kept[end]) && !headingPattern.test(kept[end]) && !labelPattern.test(kept[end])) end += 1;
    if (end - i >= 3) grouped.push(`【生字词】${kept.slice(i, end).join(" ")}`);
    else grouped.push(...kept.slice(i, end));
    i = end;
  }

  const blocks = [];
  let buffer = "";
  const flush = () => {
    const text = buffer.trim();
    if (text) blocks.push({ type: "text", text });
    buffer = "";
  };
  for (const line of grouped) {
    if (line.startsWith("【生字词】")) {
      flush();
      blocks.push({ type: "vocabulary", text: line.replace("【生字词】", "") });
      continue;
    }
    const isLabel = labelPattern.test(line);
    const isHeading = headingPattern.test(line);
    if (isLabel || isHeading) {
      flush();
      blocks.push({ type: isLabel ? "label" : "heading", text: line });
      continue;
    }
    buffer += line;
    if (/[。！？；… ”》）]$/.test(line) || buffer.length >= 180) flush();
  }
  flush();
  return { pdfPage: pageNo, textbookPage: Math.max(1, pageNo - 5), blocks };
}

const output = {};
for (const [id, item] of Object.entries(maps)) {
  output[id] = { pages: item.pages.map(cleanPage), tasks: item.tasks, pdfStart: Math.min(...item.pages), pdfEnd: Math.max(...item.pages) };
}

await copyFile(pdf, path.join(root, "public/textbook.pdf"));
await writeFile(path.join(root, "app/textbook-content.json"), JSON.stringify(output), "utf8");
console.log(`Extracted ${Object.keys(output).length} learning modules from ${pdfPages.length} PDF pages.`);
