"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "farm" | "shop" | "codex" | "poems" | "parent";
type Stage = 0 | 1 | 2;
type ChallengeMode = "choice" | "fill" | "sort" | "voice";
type Mutation = "normal" | "silver" | "gold" | "rainbow";

type Plot = {
  plantId: string;
  stage: Stage;
  energy: number;
  plantedAt: number;
};

type CollectionItem = Record<Mutation, number>;

type GameState = {
  coins: number;
  inventory: Record<string, number>;
  plots: Array<Plot | null>;
  mastery: Record<string, number>;
  collection: Record<string, CollectionItem>;
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  plantedCount: number;
  harvestCount: number;
  sessionSeconds: number;
};

type SpeechResultEvent = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: SpeechResultEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const STORAGE_KEY = "shitian-siji-v1";
const STAGES = ["幼苗期", "童株期", "成熟期"];
const STAGE_REWARDS = [10, 20, 30];

const plants = [
  {
    id: "peach",
    name: "桃花",
    category: "春日花木",
    icon: "🌸",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#e78d95",
    price: 6,
    unlock: 0,
    rarity: "开园赠送",
    poem: {
      title: "大林寺桃花",
      author: "白居易",
      lines: ["人间四月芳菲尽", "山寺桃花始盛开", "长恨春归无觅处", "不知转入此中来"],
      choicePrompt: "“人间四月芳菲尽”的下一句是？",
      choiceOptions: ["山寺桃花始盛开", "二月春风似剪刀", "明月来相照", "粒粒皆辛苦"],
      choiceAnswer: "山寺桃花始盛开",
      fillBefore: "山寺桃花始",
      fillAfter: "开",
      fillAnswer: "盛",
      fillOptions: ["盛", "胜", "生", "升"],
      sortParts: ["长恨", "春归", "无觅处"],
    },
  },
  {
    id: "willow",
    name: "碧柳",
    category: "观赏乔木",
    icon: "🌳",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#75a66c",
    price: 7,
    unlock: 0,
    rarity: "开园赠送",
    poem: {
      title: "咏柳",
      author: "贺知章",
      lines: ["碧玉妆成一树高", "万条垂下绿丝绦", "不知细叶谁裁出", "二月春风似剪刀"],
      choicePrompt: "“碧玉妆成一树高”的下一句是？",
      choiceOptions: ["万条垂下绿丝绦", "春眠不觉晓", "山寺桃花始盛开", "独坐幽篁里"],
      choiceAnswer: "万条垂下绿丝绦",
      fillBefore: "二月春风似剪",
      fillAfter: "",
      fillAnswer: "刀",
      fillOptions: ["刀", "草", "花", "桃"],
      sortParts: ["不知", "细叶", "谁裁出"],
    },
  },
  {
    id: "carrot",
    name: "红萝卜",
    category: "田园蔬菜",
    icon: "🥕",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#df8a54",
    price: 5,
    unlock: 0,
    rarity: "开园赠送",
    poem: {
      title: "悯农（其二）",
      author: "李绅",
      lines: ["锄禾日当午", "汗滴禾下土", "谁知盘中餐", "粒粒皆辛苦"],
      choicePrompt: "“锄禾日当午”的下一句是？",
      choiceOptions: ["汗滴禾下土", "粒粒皆辛苦", "明月来相照", "闻歌始觉有人来"],
      choiceAnswer: "汗滴禾下土",
      fillBefore: "粒粒皆辛",
      fillAfter: "",
      fillAnswer: "苦",
      fillOptions: ["苦", "古", "谷", "固"],
      sortParts: ["谁知", "盘中", "餐"],
    },
  },
  {
    id: "bamboo",
    name: "青竹",
    category: "四季常青",
    icon: "🎋",
    youngIcon: "🌱",
    middleIcon: "🎍",
    color: "#4e8c68",
    price: 9,
    unlock: 0,
    rarity: "开园赠送",
    poem: {
      title: "竹里馆",
      author: "王维",
      lines: ["独坐幽篁里", "弹琴复长啸", "深林人不知", "明月来相照"],
      choicePrompt: "“独坐幽篁里”的下一句是？",
      choiceOptions: ["弹琴复长啸", "万条垂下绿丝绦", "遍绕篱边日渐斜", "汗滴禾下土"],
      choiceAnswer: "弹琴复长啸",
      fillBefore: "明月来相",
      fillAfter: "",
      fillAnswer: "照",
      fillOptions: ["照", "召", "昭", "找"],
      sortParts: ["深林", "人", "不知"],
    },
  },
  {
    id: "lotus",
    name: "荷花",
    category: "水生花卉",
    icon: "🪷",
    youngIcon: "🌱",
    middleIcon: "🍃",
    color: "#d982a0",
    price: 12,
    unlock: 3,
    rarity: "进阶种子",
    poem: {
      title: "采莲曲",
      author: "王昌龄",
      lines: ["荷叶罗裙一色裁", "芙蓉向脸两边开", "乱入池中看不见", "闻歌始觉有人来"],
      choicePrompt: "“荷叶罗裙一色裁”的下一句是？",
      choiceOptions: ["芙蓉向脸两边开", "山寺桃花始盛开", "万条垂下绿丝绦", "此花开尽更无花"],
      choiceAnswer: "芙蓉向脸两边开",
      fillBefore: "闻歌始",
      fillAfter: "有人来",
      fillAnswer: "觉",
      fillOptions: ["觉", "角", "脚", "决"],
      sortParts: ["乱入", "池中", "看不见"],
    },
  },
  {
    id: "chrysanthemum",
    name: "秋菊",
    category: "芳香花卉",
    icon: "🌼",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#d8a64b",
    price: 14,
    unlock: 5,
    rarity: "进阶种子",
    poem: {
      title: "菊花",
      author: "元稹",
      lines: ["秋丛绕舍似陶家", "遍绕篱边日渐斜", "不是花中偏爱菊", "此花开尽更无花"],
      choicePrompt: "“不是花中偏爱菊”的下一句是？",
      choiceOptions: ["此花开尽更无花", "万条垂下绿丝绦", "自有岁寒心", "粒粒皆辛苦"],
      choiceAnswer: "此花开尽更无花",
      fillBefore: "遍绕篱边日渐",
      fillAfter: "",
      fillAnswer: "斜",
      fillOptions: ["斜", "霞", "下", "夏"],
      sortParts: ["秋丛", "绕舍", "似陶家"],
    },
  },
  {
    id: "pomegranate",
    name: "石榴",
    category: "甜香果木",
    icon: "🔴",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#c96055",
    price: 16,
    unlock: 7,
    rarity: "珍藏种子",
    poem: {
      title: "榴花",
      author: "韩愈",
      lines: ["五月榴花照眼明", "枝间时见子初成", "可怜此地无车马", "颠倒青苔落绛英"],
      choicePrompt: "“五月榴花照眼明”的下一句是？",
      choiceOptions: ["枝间时见子初成", "江南有丹橘", "二月春风似剪刀", "明月来相照"],
      choiceAnswer: "枝间时见子初成",
      fillBefore: "五月榴花照眼",
      fillAfter: "",
      fillAnswer: "明",
      fillOptions: ["明", "名", "鸣", "茗"],
      sortParts: ["枝间", "时见", "子初成"],
    },
  },
  {
    id: "orange",
    name: "丹橘",
    category: "冬青果木",
    icon: "🍊",
    youngIcon: "🌱",
    middleIcon: "🌿",
    color: "#e49a46",
    price: 18,
    unlock: 9,
    rarity: "珍藏种子",
    poem: {
      title: "感遇·江南有丹橘（节选）",
      author: "张九龄",
      lines: ["江南有丹橘", "经冬犹绿林", "岂伊地气暖", "自有岁寒心"],
      choicePrompt: "“江南有丹橘”的下一句是？",
      choiceOptions: ["经冬犹绿林", "山寺桃花始盛开", "深林人不知", "汗滴禾下土"],
      choiceAnswer: "经冬犹绿林",
      fillBefore: "自有岁寒",
      fillAfter: "",
      fillAnswer: "心",
      fillOptions: ["心", "新", "欣", "辛"],
      sortParts: ["岂伊", "地气", "暖"],
    },
  },
] as const;

type Plant = (typeof plants)[number];

const plantById = Object.fromEntries(plants.map((plant) => [plant.id, plant])) as Record<string, Plant>;

const emptyCollection = (): CollectionItem => ({ normal: 0, silver: 0, gold: 0, rainbow: 0 });

const DEFAULT_GAME: GameState = {
  coins: 120,
  inventory: { peach: 2, willow: 2, carrot: 2, bamboo: 1 },
  plots: [
    { plantId: "peach", stage: 0, energy: 15, plantedAt: Date.now() },
    { plantId: "willow", stage: 1, energy: 40, plantedAt: Date.now() },
    null,
    null,
    null,
    null,
  ],
  mastery: { willow: 1 },
  collection: {},
  attempts: 1,
  correct: 1,
  streak: 1,
  bestStreak: 1,
  plantedCount: 0,
  harvestCount: 0,
  sessionSeconds: 0,
};

const navItems: Array<{ id: Tab; icon: string; label: string; hint: string }> = [
  { id: "farm", icon: "⌂", label: "我的诗田", hint: "种植与收获" },
  { id: "shop", icon: "籽", label: "种子铺", hint: "解锁新植物" },
  { id: "codex", icon: "册", label: "植物图鉴", hint: "收藏变异果实" },
  { id: "poems", icon: "诗", label: "唐诗书房", hint: "听读与复习" },
  { id: "parent", icon: "家", label: "家长中心", hint: "查看学习报告" },
];

const normalizeText = (value: string) => value.replace(/[，。！？、；：\s]/g, "");

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function plantIcon(plant: Plant, stage: Stage) {
  if (stage === 0) return plant.youngIcon;
  if (stage === 1) return plant.middleIcon;
  return plant.icon;
}

export default function Home() {
  const [game, setGame] = useState<GameState>(DEFAULT_GAME);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("farm");
  const [plantingPlot, setPlantingPlot] = useState<number | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [challenge, setChallenge] = useState<{ plantId: string; plotIndex: number | null } | null>(null);
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>("choice");
  const [feedback, setFeedback] = useState("");
  const [sortSelection, setSortSelection] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as GameState;
          setGame({ ...DEFAULT_GAME, ...parsed });
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }, [game, hydrated]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => ({ ...current, sessionSeconds: current.sessionSeconds + 1 }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const poemStars = useMemo(
    () => Object.values(game.mastery).reduce((total, level) => total + level, 0),
    [game.mastery],
  );
  const learnedPoems = useMemo(
    () => Object.values(game.mastery).filter((level) => level >= 3).length,
    [game.mastery],
  );
  const accuracy = game.attempts ? Math.round((game.correct / game.attempts) * 100) : 100;

  const openChallenge = (plantId: string, plotIndex: number | null) => {
    const stage = plotIndex === null ? 2 : (game.plots[plotIndex]?.stage ?? 0);
    setChallengeMode(stage === 0 ? "choice" : stage === 1 ? "fill" : "sort");
    setChallenge({ plantId, plotIndex });
    setFeedback("");
    setSortSelection([]);
    setTranscript("");
    setSelectedPlot(null);
  };

  const closeChallenge = () => {
    setChallenge(null);
    setFeedback("");
    setSortSelection([]);
    setTranscript("");
    setListening(false);
  };

  const completeChallenge = (source: "answer" | "voice" | "parent" = "answer") => {
    if (!challenge) return;
    const { plantId, plotIndex } = challenge;
    const previousLevel = game.mastery[plantId] ?? 0;
    const nextLevel = Math.min(5, previousLevel + 1);

    setGame((current) => {
      const plots = [...current.plots];
      if (plotIndex !== null && plots[plotIndex]) {
        const plot = plots[plotIndex] as Plot;
        plots[plotIndex] = {
          ...plot,
          stage: plot.stage < 2 ? ((plot.stage + 1) as Stage) : plot.stage,
          energy: Math.min(100, plot.energy + (plot.stage < 2 ? 35 : 30)),
        };
      }
      const newStreak = current.streak + 1;
      return {
        ...current,
        plots,
        mastery: { ...current.mastery, [plantId]: nextLevel },
        attempts: current.attempts + 1,
        correct: current.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(current.bestStreak, newStreak),
      };
    });

    const sourceText = source === "voice" ? "背诵识别成功" : source === "parent" ? "家长已确认完成" : "答对啦";
    setToast(`${sourceText}，诗意值上升！`);
    closeChallenge();
  };

  const wrongAnswer = () => {
    setGame((current) => ({ ...current, attempts: current.attempts + 1, streak: 0 }));
    setFeedback("别着急，再读一遍诗句。答错不会扣金币。🍃");
  };

  const chooseAnswer = (answer: string) => {
    if (!challenge) return;
    const plant = plantById[challenge.plantId];
    const expected = challengeMode === "choice" ? plant.poem.choiceAnswer : plant.poem.fillAnswer;
    if (answer === expected) completeChallenge();
    else wrongAnswer();
  };

  const submitSort = () => {
    if (!challenge) return;
    const plant = plantById[challenge.plantId];
    if (sortSelection.join("") === plant.poem.sortParts.join("")) completeChallenge();
    else wrongAnswer();
  };

  const startListening = () => {
    if (!challenge) return;
    const browserWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setFeedback("当前浏览器不支持语音识别，请切换为填字题，或请家长确认。🌿");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(heard);
      const expected = normalizeText(plantById[challenge.plantId].poem.lines.join(""));
      const normalizedHeard = normalizeText(heard);
      const keyChars = [...new Set(expected)];
      const score = keyChars.filter((character) => normalizedHeard.includes(character)).length / keyChars.length;
      if (score >= 0.58) completeChallenge("voice");
      else {
        setFeedback("听见啦！还有几处没有听清，可以再背一次，或者改用填字题。🎋");
        setGame((current) => ({ ...current, attempts: current.attempts + 1, streak: 0 }));
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setFeedback("没有听清楚，可以靠近麦克风再试一次，也可以改用填字题。🍃");
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    setFeedback("正在听，请从诗名开始慢慢背诵……");
    recognition.start();
  };

  const readPoem = (plant: Plant) => {
    if (!("speechSynthesis" in window)) {
      setToast("当前浏览器暂不支持朗读，可以请家长陪读。 ");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${plant.poem.title}，${plant.poem.author}。${plant.poem.lines.join("。")}。`);
    utterance.lang = "zh-CN";
    utterance.rate = 0.78;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  };

  const plantSeed = (plotIndex: number, plantId: string) => {
    const count = game.inventory[plantId] ?? 0;
    if (count <= 0) {
      setToast("这种种子还没有，先去种子铺看看吧。 ");
      return;
    }
    setGame((current) => {
      const plots = [...current.plots];
      plots[plotIndex] = { plantId, stage: 0, energy: 0, plantedAt: Date.now() };
      return {
        ...current,
        plots,
        inventory: { ...current.inventory, [plantId]: count - 1 },
        plantedCount: current.plantedCount + 1,
      };
    });
    setPlantingPlot(null);
    setToast(`种下${plantById[plantId].name}啦！完成诗题，它就会长大。`);
  };

  const buySeed = (plant: Plant) => {
    if (poemStars < plant.unlock) {
      setToast(`还需要 ${plant.unlock - poemStars} 颗诗星才能解锁。`);
      return;
    }
    if (game.coins < plant.price) {
      setToast("金币不够啦，成熟采摘能获得更多金币。 ");
      return;
    }
    setGame((current) => ({
      ...current,
      coins: current.coins - plant.price,
      inventory: { ...current.inventory, [plant.id]: (current.inventory[plant.id] ?? 0) + 1 },
    }));
    setToast(`买到一颗${plant.name}种子！`);
  };

  const harvestPlant = (plotIndex: number) => {
    const plot = game.plots[plotIndex];
    if (!plot) return;
    const level = game.mastery[plot.plantId] ?? 0;
    let mutation: Mutation = "normal";
    let reward = STAGE_REWARDS[plot.stage];
    if (plot.stage === 2 && plot.energy >= 100) {
      mutation = level >= 5 ? "rainbow" : level >= 4 ? "gold" : "silver";
      reward = mutation === "rainbow" ? 70 : mutation === "gold" ? 60 : 50;
    }
    setGame((current) => {
      const plots = [...current.plots];
      plots[plotIndex] = null;
      const currentCollection = current.collection[plot.plantId] ?? emptyCollection();
      return {
        ...current,
        coins: current.coins + reward,
        plots,
        harvestCount: current.harvestCount + 1,
        collection: {
          ...current.collection,
          [plot.plantId]: { ...currentCollection, [mutation]: currentCollection[mutation] + 1 },
        },
      };
    });
    setSelectedPlot(null);
    const mutationName = mutation === "normal" ? "" : mutation === "silver" ? "银色变异 · " : mutation === "gold" ? "金色变异 · " : "炫彩变异 · ";
    setToast(`${mutationName}采摘成功，获得 ${reward} 金币！`);
  };

  const resetGame = () => {
    if (!window.confirm("要重新开始诗田吗？当前种植和学习记录都会清空。")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setGame({ ...DEFAULT_GAME, sessionSeconds: 0 });
    setTab("farm");
    setToast("诗田已经重新整理好啦。 ");
  };

  const currentChallengePlant = challenge ? plantById[challenge.plantId] : null;
  const selectedPlantPlot = selectedPlot !== null ? game.plots[selectedPlot] : null;
  const selectedPlant = selectedPlantPlot ? plantById[selectedPlantPlot.plantId] : null;

  return (
    <main className="game-shell">
      <div className="paper-noise" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={() => setTab("farm")} aria-label="返回我的诗田">
          <span className="brand-seal">诗</span>
          <span>
            <strong>诗田四季</strong>
            <small>唐诗种植乐园</small>
          </span>
        </button>
        <div className="season-note"><span>春风田</span><b>谷雨 · 万物生</b></div>
        <div className="top-stats">
          <div className="profile-chip"><span className="avatar">🌱</span><span><small>小诗农</small><b>芽芽 · 3级</b></span></div>
          <div className="stat-pill coin"><span>●</span><b>{game.coins}</b><small>金币</small></div>
          <div className="stat-pill star"><span>✦</span><b>{poemStars}</b><small>诗星</small></div>
          <div className="session-clock"><small>本次学习</small><b>{formatTime(game.sessionSeconds)}</b></div>
        </div>
      </header>

      <div className="content-frame">
        {tab === "farm" && (
          <section className="farm-layout" aria-label="我的诗田">
            <div className="farm-scene">
              <div className="scene-wash" />
              <div className="scene-head">
                <div>
                  <p className="eyebrow">MY POETRY GARDEN · 01</p>
                  <h1>春风田</h1>
                  <p>每答对一道唐诗题，植物就会向阳长大一点。</p>
                </div>
                <div className="season-path" aria-label="四季田地进度">
                  <button className="season active"><span>春</span><small>已开放</small></button>
                  <button className="season locked" onClick={() => setToast("掌握 5 首诗后开放夏荷田。") }><span>夏</span><small>5首诗</small></button>
                  <button className="season locked" onClick={() => setToast("掌握 15 首诗后开放秋实田。") }><span>秋</span><small>15首诗</small></button>
                  <button className="season locked" onClick={() => setToast("掌握 30 首诗后开放冬雪田。") }><span>冬</span><small>30首诗</small></button>
                </div>
              </div>

              <div className="floating-poem">
                <span className="quote-mark">“</span>
                <p>碧玉妆成一树高，万条垂下绿丝绦。</p>
                <small>《咏柳》· 贺知章</small>
                <button onClick={() => readPoem(plantById.willow)} aria-label="听示范朗读">♪</button>
              </div>

              <div className="plots-grid">
                {game.plots.map((plot, index) => {
                  if (!plot) {
                    return (
                      <button key={index} className="plot empty" onClick={() => setPlantingPlot(index)} aria-label={`第${index + 1}块空田，点击播种`}>
                        <span className="soil-lines" />
                        <span className="plus">＋</span>
                        <b>播种</b>
                        <small>选择一颗诗种子</small>
                      </button>
                    );
                  }
                  const plant = plantById[plot.plantId];
                  return (
                    <button key={index} className={`plot planted stage-${plot.stage}`} onClick={() => setSelectedPlot(index)} aria-label={`${plant.name}，${STAGES[plot.stage]}`}>
                      <span className="plot-number">0{index + 1}</span>
                      <span className="plant-aura" style={{ background: plant.color }} />
                      <span className="plant-emoji">{plantIcon(plant, plot.stage)}</span>
                      <span className="plot-copy"><b>{plant.name}</b><small>{STAGES[plot.stage]} · 可得 {STAGE_REWARDS[plot.stage]} 币</small></span>
                      <span className="energy"><i style={{ width: `${plot.energy}%` }} /><em>诗意 {plot.energy}%</em></span>
                    </button>
                  );
                })}
              </div>
              <div className="scene-tip"><span>☞</span> 点击植物浇灌成长，或点击空田开始播种</div>
            </div>

            <aside className="farm-sidebar">
              <section className="side-card guide-card">
                <div className="card-title"><div><span className="mini-seal">今日</span><h2>诗田小目标</h2></div><small>轻松完成，不会断签</small></div>
                <div className="task-list">
                  <TaskRow icon="◌" title="种下一颗种子" progress={Math.min(game.plantedCount, 1)} total={1} reward="+1 诗露" />
                  <TaskRow icon="句" title="完成两次诗句挑战" progress={Math.min(game.correct, 2)} total={2} reward="+1 诗星" />
                  <TaskRow icon="篮" title="完成一次快乐采摘" progress={Math.min(game.harvestCount, 1)} total={1} reward="收藏果实" />
                </div>
                <div className="gentle-note"><span>☁</span><p><b>慢慢来就很好</b><br />答错不扣金币，植物也永远不会枯萎。</p></div>
              </section>

              <section className="side-card progress-card">
                <div className="card-title"><div><span className="mini-seal green">成长</span><h2>本园学习进度</h2></div><b className="accuracy">{accuracy}%</b></div>
                <div className="ring-row">
                  <div className="progress-ring" style={{ "--value": `${Math.min(poemStars * 8, 100)}%` } as React.CSSProperties}><span>{poemStars}<small>诗星</small></span></div>
                  <div className="progress-details">
                    <p><span>已熟悉诗歌</span><b>{learnedPoems} / 8</b></p>
                    <p><span>最高连续答对</span><b>{game.bestStreak} 题</b></p>
                    <p><span>图鉴收获</span><b>{game.harvestCount} 次</b></p>
                  </div>
                </div>
                <button className="text-button" onClick={() => setTab("parent")}>请家长查看完整报告 <span>→</span></button>
              </section>

              <section className="side-card mutation-card">
                <div className="mutation-orb"><span>✦</span></div>
                <div><small>诗意值达到 100%</small><h3>下一次成熟采摘必定变异</h3><p>银色 50 · 金色 60 · 炫彩 70 金币</p></div>
              </section>
            </aside>
          </section>
        )}

        {tab === "shop" && (
          <SectionPage eyebrow="SEED SHOP · 02" title="种子铺" description="金币来自采摘，所有种子都能通过学习和游戏获得。">
            <div className="shop-banner">
              <div><span>今日种子札记</span><h2>一颗种子，一首唐诗</h2><p>先种熟悉的植物，再慢慢解锁新朋友。</p></div>
              <div className="seed-pouch">籽<small>你有 {Object.values(game.inventory).reduce((a, b) => a + b, 0)} 颗</small></div>
            </div>
            <div className="card-grid seed-grid">
              {plants.map((plant) => {
                const unlocked = poemStars >= plant.unlock;
                return (
                  <article key={plant.id} className={`seed-card ${unlocked ? "" : "is-locked"}`}>
                    <div className="seed-card-top" style={{ background: `${plant.color}22` }}><span>{plant.icon}</span><em>{plant.rarity}</em></div>
                    <div className="seed-card-body">
                      <div><small>{plant.category}</small><h3>{plant.name}</h3></div>
                      <p>关联《{plant.poem.title}》<br />{plant.poem.author}</p>
                      <div className="seed-meta"><span>背包 <b>{game.inventory[plant.id] ?? 0}</b></span><span>成熟收益 <b>30+</b></span></div>
                      <button disabled={!unlocked} onClick={() => buySeed(plant)}>
                        {unlocked ? <><span className="coin-dot">●</span> {plant.price} · 购买种子</> : <>🔒 需要 {plant.unlock} 颗诗星</>}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </SectionPage>
        )}

        {tab === "codex" && (
          <SectionPage eyebrow="BOTANICAL ALBUM · 03" title="植物图鉴" description="每一次采摘都会留下收藏；变异果实拥有独一无二的光泽。">
            <div className="collection-summary">
              <div><small>已发现植物</small><b>{new Set(game.plots.filter(Boolean).map((plot) => (plot as Plot).plantId)).size + Object.keys(game.collection).length}<em>/ 8</em></b></div>
              <div><small>累计采摘</small><b>{game.harvestCount}<em>次</em></b></div>
              <div><small>稀有变异</small><b>{Object.values(game.collection).reduce((sum, item) => sum + (item.silver ?? 0) + (item.gold ?? 0) + (item.rainbow ?? 0), 0)}<em>枚</em></b></div>
              <div className="rarity-legend"><span className="silver">银色 50</span><span className="gold">金色 60</span><span className="rainbow">炫彩 70</span></div>
            </div>
            <div className="card-grid codex-grid">
              {plants.map((plant) => {
                const item = game.collection[plant.id] ?? emptyCollection();
                const discovered = Object.values(item).some(Boolean) || game.plots.some((plot) => plot?.plantId === plant.id);
                return (
                  <article key={plant.id} className={`codex-card ${discovered ? "" : "undiscovered"}`}>
                    <span className="botanical-number">{String(plants.indexOf(plant) + 1).padStart(2, "0")}</span>
                    <div className="specimen" style={{ background: `${plant.color}1d` }}><span>{discovered ? plant.icon : "?"}</span></div>
                    <h3>{discovered ? plant.name : "尚未发现"}</h3>
                    <p>{discovered ? `《${plant.poem.title}》` : `还需 ${Math.max(0, plant.unlock - poemStars)} 颗诗星解锁`}</p>
                    <div className="variant-row"><span title="普通">● {item.normal}</span><span className="silver" title="银色">● {item.silver}</span><span className="gold" title="金色">● {item.gold}</span><span className="rainbow" title="炫彩">● {item.rainbow}</span></div>
                  </article>
                );
              })}
            </div>
          </SectionPage>
        )}

        {tab === "poems" && (
          <SectionPage eyebrow="POETRY STUDY · 04" title="唐诗书房" description="听一听、读一读、练一练。每首诗有五颗掌握星。">
            <div className="study-layout">
              <div className="poem-shelf">
                {plants.map((plant) => {
                  const level = game.mastery[plant.id] ?? 0;
                  return (
                    <article key={plant.id} className="poem-card">
                      <div className="poem-ribbon" style={{ background: plant.color }}><span>{plant.icon}</span><small>{plant.category}</small></div>
                      <div className="poem-copy"><small>唐 · {plant.poem.author}</small><h3>{plant.poem.title}</h3><div className="verse">{plant.poem.lines.map((line) => <p key={line}>{line}</p>)}</div></div>
                      <div className="mastery-row"><span>掌握度</span><div>{[1, 2, 3, 4, 5].map((star) => <i key={star} className={star <= level ? "filled" : ""}>✦</i>)}</div></div>
                      <div className="poem-actions"><button onClick={() => readPoem(plant)}>♪ 听一听</button><button className="primary" onClick={() => openChallenge(plant.id, null)}>练一练 →</button></div>
                    </article>
                  );
                })}
              </div>
              <aside className="study-aside">
                <div className="ink-card"><span className="ink-moon">月</span><p>温故而知新</p><h3>今日复习建议</h3><ul><li>《咏柳》再读一遍</li><li>《悯农》完成一次排序</li><li>任选一首背给家长听</li></ul></div>
                <div className="level-card"><small>书房等级</small><b>{poemStars < 8 ? "初识花木" : poemStars < 20 ? "诗意萌芽" : "满园诗香"}</b><span><i style={{ width: `${Math.min((poemStars / 20) * 100, 100)}%` }} /></span><p>再获得 {Math.max(0, 20 - poemStars)} 颗诗星解锁专属诗笺</p></div>
              </aside>
            </div>
          </SectionPage>
        )}

        {tab === "parent" && (
          <SectionPage eyebrow="PARENT REPORT · 05" title="家长中心" description="关注真实掌握，不用排名制造焦虑。数据仅保存在当前浏览器。">
            <div className="parent-hero">
              <div><span className="report-avatar">🌱</span><div><small>芽芽的今日学习</small><h2>完成得很专注，正在建立诗句顺序感。</h2><p>建议今晚一起朗读《咏柳》，不必要求一次背完。</p></div></div>
              <span className="report-date">今天<br /><b>08.12</b></span>
            </div>
            <div className="report-grid">
              <article className="report-card metric-card"><span>学习时长</span><b>{Math.max(1, Math.ceil(game.sessionSeconds / 60))}<small>分钟</small></b><p>建议单次 10—15 分钟</p></article>
              <article className="report-card metric-card"><span>答题正确率</span><b>{accuracy}<small>%</small></b><p>共尝试 {game.attempts} 次</p></article>
              <article className="report-card metric-card"><span>已掌握诗歌</span><b>{learnedPoems}<small>首</small></b><p>掌握度达到 3 星</p></article>
              <article className="report-card metric-card"><span>持续专注</span><b>{game.bestStreak}<small>题</small></b><p>最高连续答对</p></article>
              <article className="report-card wide learning-chart">
                <div className="report-title"><div><small>八首诗学习进度</small><h3>从“听过”走向“会背”</h3></div><span>五阶掌握模型</span></div>
                <div className="bar-list">{plants.map((plant) => { const level = game.mastery[plant.id] ?? 0; return <div key={plant.id}><span>{plant.poem.title.replace("（节选）", "")}</span><i><em style={{ width: `${level * 20}%`, background: plant.color }} /></i><b>{level}/5</b></div>; })}</div>
              </article>
              <article className="report-card parent-advice">
                <div className="report-title"><div><small>陪伴建议</small><h3>今晚可以这样做</h3></div><span className="mini-seal">3分钟</span></div>
                <ol><li><b>先听：</b>让孩子选择一首喜欢的诗。</li><li><b>再说：</b>问问诗里看到了什么颜色。</li><li><b>最后背：</b>只背最喜欢的一句也很好。</li></ol>
                <button onClick={() => setTab("poems")}>打开唐诗书房 →</button>
              </article>
            </div>
            <div className="parent-settings"><div><b>儿童友好设置</b><span>植物不枯萎 · 无排行榜 · 无连续签到惩罚 · 无真实付费</span></div><button onClick={resetGame}>重新开始诗田</button></div>
          </SectionPage>
        )}
      </div>

      <nav className="bottom-nav" aria-label="游戏功能导航">
        {navItems.map((item) => (
          <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
            <span>{item.icon}</span><div><b>{item.label}</b><small>{item.hint}</small></div>
          </button>
        ))}
      </nav>

      {plantingPlot !== null && (
        <Modal title={`给第 ${plantingPlot + 1} 块田选择种子`} subtitle="种下后，完成唐诗挑战就能让它长大。" onClose={() => setPlantingPlot(null)}>
          <div className="seed-picker">
            {plants.map((plant) => {
              const count = game.inventory[plant.id] ?? 0;
              const unlocked = poemStars >= plant.unlock;
              return (
                <button key={plant.id} disabled={!count || !unlocked} onClick={() => plantSeed(plantingPlot, plant.id)}>
                  <span className="picker-icon" style={{ background: `${plant.color}22` }}>{plant.icon}</span>
                  <span><b>{plant.name}</b><small>《{plant.poem.title}》</small></span>
                  <em>{unlocked ? `种子 × ${count}` : `${plant.unlock} 诗星解锁`}</em>
                </button>
              );
            })}
          </div>
          <button className="modal-link" onClick={() => { setPlantingPlot(null); setTab("shop"); }}>没有想要的种子？去种子铺看看 →</button>
        </Modal>
      )}

      {selectedPlot !== null && selectedPlantPlot && selectedPlant && (
        <Modal title={`${selectedPlant.name} · ${STAGES[selectedPlantPlot.stage]}`} subtitle={`关联唐诗《${selectedPlant.poem.title}》· ${selectedPlant.poem.author}`} onClose={() => setSelectedPlot(null)}>
          <div className="plant-detail">
            <div className="plant-portrait" style={{ background: `${selectedPlant.color}20` }}><span>{plantIcon(selectedPlant, selectedPlantPlot.stage)}</span><i style={{ borderColor: selectedPlant.color }} /></div>
            <div className="plant-status">
              <div className="growth-steps">{STAGES.map((stage, index) => <span key={stage} className={index <= selectedPlantPlot.stage ? "done" : ""}><i>{index + 1}</i><b>{stage}</b></span>)}</div>
              <div className="energy-detail"><span><b>诗意值</b><em>{selectedPlantPlot.energy}%</em></span><i><em style={{ width: `${selectedPlantPlot.energy}%` }} /></i><p>{selectedPlantPlot.energy >= 100 ? "诗意已满，下一次成熟采摘必定变异！" : "答对诗题可增加诗意值，达到100%开启变异。"}</p></div>
              <div className="harvest-preview"><span>现在采摘可获得</span><b>{selectedPlantPlot.stage === 2 && selectedPlantPlot.energy >= 100 ? "50—70" : STAGE_REWARDS[selectedPlantPlot.stage]} <small>金币</small></b></div>
            </div>
          </div>
          <div className="modal-actions"><button className="secondary" onClick={() => harvestPlant(selectedPlot)}>现在采摘</button><button className="primary" onClick={() => openChallenge(selectedPlant.id, selectedPlot)}>{selectedPlantPlot.stage < 2 ? "完成诗题，让它长大" : "诗意灌溉，冲刺变异"} →</button></div>
        </Modal>
      )}

      {challenge && currentChallengePlant && (
        <Modal title={`唐诗挑战 ·《${currentChallengePlant.poem.title}》`} subtitle="答错不会扣金币，可以随时切换挑战方式。" onClose={closeChallenge} wide>
          <div className="challenge-layout">
            <section className="poem-scroll">
              <span className="scroll-tag">唐 · {currentChallengePlant.poem.author}</span>
              <h3>{currentChallengePlant.poem.title}</h3>
              <div>{currentChallengePlant.poem.lines.map((line) => <p key={line}>{line}</p>)}</div>
              <button onClick={() => readPoem(currentChallengePlant)}>♪ 听完整朗读</button>
            </section>
            <section className="challenge-panel">
              <div className="challenge-tabs">
                <button className={challengeMode === "choice" ? "active" : ""} onClick={() => { setChallengeMode("choice"); setFeedback(""); }}>选下一句</button>
                <button className={challengeMode === "fill" ? "active" : ""} onClick={() => { setChallengeMode("fill"); setFeedback(""); }}>填一个字</button>
                <button className={challengeMode === "sort" ? "active" : ""} onClick={() => { setChallengeMode("sort"); setFeedback(""); setSortSelection([]); }}>排好诗句</button>
                <button className={challengeMode === "voice" ? "active" : ""} onClick={() => { setChallengeMode("voice"); setFeedback(""); }}>背诵</button>
              </div>

              {challengeMode === "choice" && <div className="question-block"><small>请选择正确的下一句</small><h3>{currentChallengePlant.poem.choicePrompt}</h3><div className="answer-grid">{currentChallengePlant.poem.choiceOptions.map((option) => <button key={option} onClick={() => chooseAnswer(option)}>{option}</button>)}</div></div>}
              {challengeMode === "fill" && <div className="question-block"><small>请把诗句补充完整</small><h3 className="fill-line">{currentChallengePlant.poem.fillBefore}<span>？</span>{currentChallengePlant.poem.fillAfter}</h3><div className="character-grid">{currentChallengePlant.poem.fillOptions.map((option) => <button key={option} onClick={() => chooseAnswer(option)}>{option}</button>)}</div></div>}
              {challengeMode === "sort" && <div className="question-block"><small>按顺序点选，排成一句诗</small><div className="sort-target">{sortSelection.length ? sortSelection.map((part) => <button key={part} onClick={() => setSortSelection((current) => current.filter((item) => item !== part))}>{part}</button>) : <span>从下方选择词语</span>}</div><div className="sort-options">{currentChallengePlant.poem.sortParts.filter((part) => !sortSelection.includes(part)).map((part) => <button key={part} onClick={() => setSortSelection((current) => [...current, part])}>{part}</button>)}</div><button className="submit-sort" disabled={sortSelection.length !== currentChallengePlant.poem.sortParts.length} onClick={submitSort}>检查顺序</button></div>}
              {challengeMode === "voice" && <div className="question-block voice-block"><small>从诗名开始，慢慢背诵整首诗</small><div className={`voice-orb ${listening ? "listening" : ""}`}><span>♪</span><i /><i /><i /></div><button className="voice-button" onClick={startListening} disabled={listening}>{listening ? "正在认真听……" : "开始背诵"}</button>{transcript && <p className="transcript">我听到：{transcript}</p>}<button className="parent-confirm" onClick={() => { if (window.confirm("请家长确认：孩子已经完成本首诗的背诵。")) completeChallenge("parent"); }}>识别不方便？由家长确认</button></div>}
              {feedback && <div className="feedback">{feedback}</div>}
              <div className="challenge-foot"><span>提示：先读出声，再看看前后两个字。</span><b>连续答对 {game.streak} 题</b></div>
            </section>
          </div>
        </Modal>
      )}

      {toast && <div className="toast" role="status"><span>✦</span>{toast}</div>}
      <div className="landscape-hint">横屏游玩，诗田会更宽阔哦 ↻</div>
    </main>
  );
}

function TaskRow({ icon, title, progress, total, reward }: { icon: string; title: string; progress: number; total: number; reward: string }) {
  const complete = progress >= total;
  return <div className={`task-row ${complete ? "complete" : ""}`}><span className="task-icon">{complete ? "✓" : icon}</span><div><b>{title}</b><small>{reward}</small></div><em>{progress}/{total}</em></div>;
}

function SectionPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="section-page"><header className="section-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><span className="brush-mark" aria-hidden="true">〰</span></header>{children}</section>;
}

function Modal({ title, subtitle, onClose, children, wide = false }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><div><small>诗田四季 · 学习与成长</small><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose} aria-label="关闭">×</button></header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
