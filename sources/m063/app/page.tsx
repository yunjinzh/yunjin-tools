"use client";

import {
  ChangeEvent,
  CSSProperties,
  DragEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Link2,
  LoaderCircle,
  Minus,
  Plus,
  Printer,
  QrCode,
  RefreshCcw,
  Settings2,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";

type Tone = "orange" | "teal" | "blue" | "purple";
type ProviderId = "openai" | "anthropic" | "deepseek" | "qwen" | "custom";
type TabId = "input" | "prompt" | "settings";
type ConnectionMode = "relay" | "direct";

type Metric = {
  value: string;
  unit: string;
  label: string;
  note: string;
  tone: Tone;
};

type InfoCard = {
  eyebrow?: string;
  title: string;
  body: string;
  tag?: string;
  tone: Tone;
};

type ListItem = {
  label: string;
  title: string;
  body: string;
  tone: Tone;
};

type DigestData = {
  journal: string;
  journalEn: string;
  issue: string;
  title: string;
  subtitle: string;
  authors: string;
  affiliation: string;
  doi: string;
  background: string;
  metrics: Metric[];
  framework: InfoCard[];
  knowledgeTitle: string;
  knowledgeIntro: string;
  challenges: InfoCard[];
  evolution: ListItem[];
  responses: ListItem[];
  directions: InfoCard[];
  quote: string;
};

type ProviderConfig = {
  label: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  rememberKey: boolean;
};

const DEFAULT_PROMPT = `你是一位严谨的中文学术编辑、科学传播设计师与信息架构师。请只依据我提供的论文抽取文本，生成一份适合纵向信息长图的“论文可视化解读”。

【任务目标】
把论文从“原始章节结构”重组为读者可快速扫描的研究叙事：论文身份 → 研究背景 → 核心数据 → 理论与分析框架 → 主题知识结构 → 机制演进与治理响应 → 未来方向 → 一句总结。强调证据、逻辑关系与研究贡献，不写空泛宣传语。

【内容原则】
1. 绝不编造。数值、年份、样本量、比例、地名、方法、作者、机构和 DOI 必须能在原文中找到；无法确认时写“原文未说明”。
2. 核心数据优先选择 4 个最能证明研究尺度、研究跨度、关键发现或现实影响的数字；没有足够数字时可少于 4 个，禁止补造。
3. 理论与分析框架固定提炼 3 项，分别优先覆盖“理论基础、分析模型、研究方法”。
4. 知识结构固定提炼 4 个彼此区分、共同构成论文核心问题链的主题模块，每项包含标题、解释和一个短标签。
5. 演进与响应分别提炼 3 项，形成“识别问题—解释机制—提出方案”与“监测/制度—空间/技术—市场/协同”等可读关系。
6. 未来方向固定提炼 3 项，标题短、建议具体。
7. 中文表达准确、克制、学术化；标题不超过 18 字，模块正文约 45—90 字。不要使用 Markdown，不要输出分析过程。
8. quote 是对论文启示的凝练转述，不伪装成作者原句，不加引号。

【视觉语义】
tone 只能使用 orange、teal、blue、purple。四个挑战依次使用四种颜色；其余模块按语义交替使用，颜色只作分组与导航，不表达未经论文支持的正负判断。

【输出要求】
只返回一个可解析的 JSON 对象，不要代码围栏，不要任何前后说明。字段必须完整并严格遵循以下结构：
{
  "journal": "中文期刊名或来源",
  "journalEn": "英文期刊名；无则为空字符串",
  "issue": "年份、卷期信息",
  "title": "论文主标题",
  "subtitle": "可选副标题；无则为空字符串",
  "authors": "作者，使用 · 分隔",
  "affiliation": "主要机构",
  "doi": "DOI；无则写原文未说明",
  "background": "研究对象、问题、数据范围、方法和关键发现组成的背景摘要",
  "metrics": [{"value":"1422","unit":"篇","label":"WoS核心合集文献","note":"1995—2024","tone":"orange"}],
  "framework": [{"eyebrow":"理论基础","title":"标题","body":"正文","tone":"teal"}],
  "knowledgeTitle": "四类核心……",
  "knowledgeIntro": "四个模块之间的总体关系",
  "challenges": [{"title":"标题","body":"正文","tag":"案例/地区/关键词","tone":"orange"}],
  "evolution": [{"label":"1","title":"标题","body":"正文","tone":"orange"}],
  "responses": [{"label":"A","title":"标题","body":"正文","tone":"blue"}],
  "directions": [{"eyebrow":"研究范式","title":"短标题","body":"正文","tone":"orange"}],
  "quote": "全文最重要的综合启示"
}`;

const SAMPLE_DATA: DigestData = {
  journal: "热带地理",
  journalEn: "TROPICAL GEOGRAPHY",
  issue: "2026 年第46卷第7期",
  title: "巴西城市化生态环境挑战研究脉络与进展评述",
  subtitle: "——基于 CiteSpace 的可视化分析",
  authors: "赵博轩 · 徐鹏贺 · 杨园园",
  affiliation: "中国人民大学 公共管理学院",
  doi: "10.13284/j.cnki.rddl.20250811",
  background:
    "巴西是全球南方快速城市化与生态环境压力交织的典型案例。本研究基于 Web of Science 核心合集 1,422 篇文献，运用 CiteSpace 对 1995—2024 年相关研究进行知识图谱分析，系统梳理其知识结构、主题演进与前沿动态。2017 年后研究进入快速增长阶段。",
  metrics: [
    { value: "1422", unit: "篇", label: "WoS 核心合集文献", note: "1995—2024", tone: "orange" },
    { value: "30", unit: "年", label: "研究时间跨度", note: "知识演进全过程", tone: "blue" },
    { value: "88.02", unit: "%", label: "巴西城市化率", note: "2024 年，世界前列", tone: "blue" },
    { value: "50", unit: "万km²+", label: "亚马逊累计毁林面积", note: "生态退化代价", tone: "orange" },
  ],
  framework: [
    { eyebrow: "理论基础", title: "行星城市化理论", body: "将巴西城市化理解为集聚式城市化与延伸式城市化两个相互嵌套的空间过程，解释城市需求向亚马逊、塞拉多等生态敏感区的跨区域传导。", tone: "teal" },
    { eyebrow: "分析模型", title: "DPSIR 模型", body: "以“驱动力—压力—状态—影响—响应”构建系统分析框架，揭示城市化驱动与生态环境后果的关键传导环节。", tone: "orange" },
    { eyebrow: "研究方法", title: "CiteSpace 知识图谱", body: "基于文献计量学方法进行共现、聚类与突现词检测，绘制该领域的知识结构、主题演进与前沿动态。", tone: "purple" },
  ],
  knowledgeTitle: "四类核心生态环境挑战",
  knowledgeIntro: "四大挑战相互嵌套，共同构成巴西城市化生态环境问题的复合风险链条。",
  challenges: [
    { title: "森林砍伐与生境退化", body: "亚马逊累计毁林超过 50 万 km²，城市需求经基础设施走廊向生态敏感区外溢，引发生境破碎化。", tag: "亚马逊 · 塞拉多", tone: "orange" },
    { title: "生物多样性丧失与同质化", body: "原生栖息地丧失导致物种减少与生物群落同质化，生态系统结构与服务功能持续衰退。", tag: "大西洋森林 · 热带草原", tone: "teal" },
    { title: "环境污染与公共健康风险", body: "空气、水体污染与人居环境恶化叠加社会分化，健康负担与环境风险分配不均加剧。", tag: "圣保罗 · 里约都市圈", tone: "blue" },
    { title: "碳排放增长与能源转型约束", body: "城市以极小土地消耗约 75% 资源并产生超 70% 温室气体，可再生能源转型面临结构与政策约束。", tag: "能源系统 · 气候政策", tone: "purple" },
  ],
  evolution: [
    { label: "1", title: "识别与量化生态问题", body: "早期聚焦森林砍伐、城市扩张等问题的识别与定量化测度。", tone: "orange" },
    { label: "2", title: "剖析传导机制", body: "深入解析生物多样性丧失、公共健康影响的内在路径与中介过程。", tone: "teal" },
    { label: "3", title: "系统性解决方案", body: "近期转向可再生能源转型等预测与干预导向的系统治理研究。", tone: "blue" },
  ],
  responses: [
    { label: "A", title: "监测支撑", body: "强化监测与信息透明，为毁林管控与执法提供科学支撑。", tone: "blue" },
    { label: "B", title: "空间约束", body: "将生态约束嵌入公私土地，实施源头导向的空间管控。", tone: "teal" },
    { label: "C", title: "市场协同", body: "引入金融与供应链工具，构建激励相容的治理框架。", tone: "orange" },
  ],
  directions: [
    { eyebrow: "研究范式", title: "价值取向升级", body: "推动兼顾社会公平与生态修复的转型，平衡增长与保护。", tone: "orange" },
    { eyebrow: "研究主题", title: "复合风险识别", body: "加强纽带关联与系统性复合风险识别，突破碎片化研究局限。", tone: "teal" },
    { eyebrow: "研究方法", title: "预测与协同", body: "发展融合大数据预测与多方协同的分析路径，提升前瞻干预能力。", tone: "purple" },
  ],
  quote: "巴西经验的启示，不在于具体制度的直接移植，而在于围绕高风险环节构建监测、约束、激励与反馈相互衔接的治理链条。",
};

const PROVIDER_DEFAULTS: Record<ProviderId, ProviderConfig> = {
  openai: { label: "OpenAI", model: "gpt-4.1-mini", baseUrl: "https://api.openai.com/v1", apiKey: "", rememberKey: false },
  anthropic: { label: "Claude", model: "claude-sonnet-4-20250514", baseUrl: "https://api.anthropic.com/v1", apiKey: "", rememberKey: false },
  deepseek: { label: "DeepSeek", model: "deepseek-chat", baseUrl: "https://api.deepseek.com", apiKey: "", rememberKey: false },
  qwen: { label: "通义千问", model: "qwen-plus", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", apiKey: "", rememberKey: false },
  custom: { label: "自定义兼容接口", model: "your-model", baseUrl: "https://example.com/v1", apiKey: "", rememberKey: false },
};

const TONES: Tone[] = ["orange", "teal", "blue", "purple"];

function cleanText(value: unknown, fallback = "原文未说明") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanTone(value: unknown, index = 0): Tone {
  return TONES.includes(value as Tone) ? (value as Tone) : TONES[index % TONES.length];
}

function normalizeCards(value: unknown, count: number, withTag = false): InfoCard[] {
  const list = Array.isArray(value) ? value.slice(0, count) : [];
  return Array.from({ length: Math.min(count, Math.max(1, list.length)) }, (_, index) => {
    const item = (list[index] ?? {}) as Record<string, unknown>;
    return {
      eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : undefined,
      title: cleanText(item.title),
      body: cleanText(item.body),
      tag: withTag && typeof item.tag === "string" ? item.tag : undefined,
      tone: cleanTone(item.tone, index),
    };
  });
}

function normalizeList(value: unknown, count: number, alpha = false): ListItem[] {
  const list = Array.isArray(value) ? value.slice(0, count) : [];
  return Array.from({ length: Math.min(count, Math.max(1, list.length)) }, (_, index) => {
    const item = (list[index] ?? {}) as Record<string, unknown>;
    return {
      label: cleanText(item.label, alpha ? String.fromCharCode(65 + index) : String(index + 1)),
      title: cleanText(item.title),
      body: cleanText(item.body),
      tone: cleanTone(item.tone, index + (alpha ? 2 : 0)),
    };
  });
}

function normalizeDigest(raw: unknown): DigestData {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const metricRaw = Array.isArray(data.metrics) ? data.metrics.slice(0, 4) : [];
  const metrics: Metric[] = metricRaw.map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      value: cleanText(item.value, "—"),
      unit: cleanText(item.unit, ""),
      label: cleanText(item.label),
      note: cleanText(item.note, ""),
      tone: cleanTone(item.tone, index),
    };
  });
  return {
    journal: cleanText(data.journal),
    journalEn: cleanText(data.journalEn, ""),
    issue: cleanText(data.issue),
    title: cleanText(data.title),
    subtitle: cleanText(data.subtitle, ""),
    authors: cleanText(data.authors),
    affiliation: cleanText(data.affiliation),
    doi: cleanText(data.doi),
    background: cleanText(data.background),
    metrics,
    framework: normalizeCards(data.framework, 3),
    knowledgeTitle: cleanText(data.knowledgeTitle, "四类核心研究主题"),
    knowledgeIntro: cleanText(data.knowledgeIntro),
    challenges: normalizeCards(data.challenges, 4, true),
    evolution: normalizeList(data.evolution, 3),
    responses: normalizeList(data.responses, 3, true),
    directions: normalizeCards(data.directions, 3),
    quote: cleanText(data.quote),
  };
}

function parseJsonResponse(text: string) {
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("模型没有返回可解析的 JSON 数据");
  return JSON.parse(stripped.slice(start, end + 1));
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="section-title">
      <span aria-hidden="true" />
      <h2 className="digest-section-title" data-font-role="source-han-serif-section-title">{children}</h2>
    </div>
  );
}

function RoundLabel({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`round-label tone-${tone}`}>{children}</span>;
}

function DigestSheet({ data, qrDataUrl, sourceUrl }: { data: DigestData; qrDataUrl: string; sourceUrl: string }) {
  return (
    <article className="digest-sheet" aria-label="论文可视化解读预览">
      <header className="digest-hero">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-copy">
          <p className="journal-line">
            {data.journal}
            {data.journalEn ? ` · ${data.journalEn}` : ""}
            {data.issue ? ` · ${data.issue}` : ""}
          </p>
          <h1 className="digest-title" data-font-role="source-han-serif-title">{data.title}</h1>
          {data.subtitle && <h2>{data.subtitle}</h2>}
          <p className="meta-line">
            <span>{data.authors}</span>
            <span>{data.affiliation}</span>
            <span>DOI: {data.doi}</span>
          </p>
        </div>
        <div className="hero-qr">
          {qrDataUrl ? <img src={qrDataUrl} alt="来源网址二维码" /> : <QrCode aria-hidden="true" />}
          <span>{sourceUrl ? "扫码访问原文" : "填写网址生成"}</span>
        </div>
      </header>

      <div className="digest-body">
        <section>
          <SectionTitle>研究背景</SectionTitle>
          <div className="background-callout">{data.background}</div>
        </section>

        <section>
          <SectionTitle>核心数据一览</SectionTitle>
          <div className={`metrics-grid metrics-${Math.max(1, data.metrics.length)}`}>
            {data.metrics.map((metric, index) => (
              <div className="metric-card" key={`${metric.label}-${index}`}>
                <div className={`metric-value tone-text-${metric.tone}`}>
                  {metric.value}<small>{metric.unit}</small>
                </div>
                <strong>{metric.label}</strong>
                {metric.note && <span>{metric.note}</span>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>理论与分析框架</SectionTitle>
          <div className="framework-grid">
            {data.framework.map((item, index) => (
              <div className={`framework-card border-${item.tone}`} key={`${item.title}-${index}`}>
                <span>{item.eyebrow || ["理论基础", "分析模型", "研究方法"][index]}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>知识结构：{data.knowledgeTitle}</SectionTitle>
          <p className="section-intro">{data.knowledgeIntro}</p>
          <div className="challenge-grid">
            {data.challenges.map((item, index) => (
              <div className={`challenge-card surface-${item.tone}`} key={`${item.title}-${index}`}>
                <div className="challenge-heading">
                  <RoundLabel tone={item.tone}>{index + 1}</RoundLabel>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.body}</p>
                {item.tag && <span className={`tag tag-${item.tone}`}>{item.tag}</span>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>范式演进与治理响应</SectionTitle>
          <div className="dual-grid">
            <div className="list-panel">
              <h3><i />研究范式三阶段演进</h3>
              <div className="numbered-list">
                {data.evolution.map((item, index) => (
                  <div className="list-row" key={`${item.title}-${index}`}>
                    <RoundLabel tone={item.tone}>{item.label}</RoundLabel>
                    <p><strong>{item.title}：</strong>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="list-panel">
              <h3><i />综合治理体系三维响应</h3>
              <div className="numbered-list">
                {data.responses.map((item, index) => (
                  <div className="list-row" key={`${item.title}-${index}`}>
                    <RoundLabel tone={item.tone}>{item.label}</RoundLabel>
                    <p><strong>{item.title}：</strong>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle>未来深化方向</SectionTitle>
          <div className="directions-grid">
            {data.directions.map((item, index) => (
              <div className={`direction-card border-left-${item.tone}`} key={`${item.title}-${index}`}>
                <span className={`tone-text-${item.tone}`}>{item.eyebrow || `方向 ${index + 1}`}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <blockquote>
          <span aria-hidden="true">“</span>
          <p>{data.quote}</p>
        </blockquote>
      </div>
    </article>
  );
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("input");
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("relay");
  const [configs, setConfigs] = useState(PROVIDER_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfInfo, setPdfInfo] = useState("");
  const [sourceUrl, setSourceUrl] = useState("https://doi.org/10.13284/j.cnki.rddl.20250811");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [data, setData] = useState<DigestData>(SAMPLE_DATA);
  const [busy, setBusy] = useState<"extracting" | "generating" | "exporting" | "">("");
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [zoom, setZoom] = useState(0.82);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentConfig = configs[provider];
  const canGenerate = Boolean(pdfText && currentConfig.apiKey && currentConfig.model && currentConfig.baseUrl);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("paper-digest-provider-configs");
        const session = window.sessionStorage.getItem("paper-digest-session-keys");
        const savedConnectionMode = window.localStorage.getItem("paper-digest-connection-mode");
        const localData = saved ? JSON.parse(saved) : {};
        const sessionData = session ? JSON.parse(session) : {};
        setConfigs((previous) => {
          const next = { ...previous };
          (Object.keys(next) as ProviderId[]).forEach((id) => {
            next[id] = { ...next[id], ...(localData[id] || {}), apiKey: sessionData[id] || localData[id]?.apiKey || "" };
          });
          return next;
        });
        const savedPrompt = window.localStorage.getItem("paper-digest-prompt");
        if (savedPrompt) setPrompt(savedPrompt);
        if (savedConnectionMode === "relay" || savedConnectionMode === "direct") {
          setConnectionMode(savedConnectionMode);
        }
      } catch {
        // Ignore malformed local preferences and keep safe defaults.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const localConfig: Partial<Record<ProviderId, Partial<ProviderConfig>>> = {};
    const sessionKeys: Partial<Record<ProviderId, string>> = {};
    (Object.keys(configs) as ProviderId[]).forEach((id) => {
      const item = configs[id];
      localConfig[id] = { ...item, apiKey: item.rememberKey ? item.apiKey : "" };
      sessionKeys[id] = item.apiKey;
    });
    window.localStorage.setItem("paper-digest-provider-configs", JSON.stringify(localConfig));
    window.localStorage.setItem("paper-digest-prompt", prompt);
    window.localStorage.setItem("paper-digest-connection-mode", connectionMode);
    window.sessionStorage.setItem("paper-digest-session-keys", JSON.stringify(sessionKeys));
  }, [configs, connectionMode, prompt, hydrated]);

  useEffect(() => {
    let cancelled = false;
    const createQr = async () => {
      if (!sourceUrl.trim()) {
        setQrDataUrl("");
        return;
      }
      try {
        const result = await QRCode.toDataURL(sourceUrl.trim(), {
          width: 220,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: "#0b6073", light: "#ffffff" },
        });
        if (!cancelled) setQrDataUrl(result);
      } catch {
        if (!cancelled) setQrDataUrl("");
      }
    };
    createQr();
    return () => { cancelled = true; };
  }, [sourceUrl]);

  const updateConfig = (patch: Partial<ProviderConfig>) => {
    setConfigs((previous) => ({ ...previous, [provider]: { ...previous[provider], ...patch } }));
  };

  const chooseProvider = (id: ProviderId) => {
    setProvider(id);
    if (id === "custom") setConnectionMode("direct");
  };

  const extractPdf = async (file: File) => {
    setBusy("extracting");
    setNotice(null);
    setPdfText("");
    setPdfInfo("");
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const document = await pdfjs.getDocument({ data: bytes }).promise;
      const chunks: string[] = [];
      let totalLength = 0;
      let processedPages = 0;
      const maxCharacters = 120000;
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = (content.items as Array<{ str?: string; hasEOL?: boolean }>)
          .map((item) => `${item.str || ""}${item.hasEOL ? "\n" : " "}`)
          .join("")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/[ \t]{2,}/g, " ")
          .trim();
        if (pageText) {
          const chunk = `\n\n--- 第 ${pageNumber} 页 ---\n${pageText}`;
          const remaining = maxCharacters - totalLength;
          chunks.push(chunk.slice(0, remaining));
          totalLength += Math.min(chunk.length, remaining);
        }
        processedPages = pageNumber;
        if (totalLength >= maxCharacters) break;
      }
      const extracted = chunks.join("").trim();
      if (!extracted) throw new Error("未能从该 PDF 中提取文字。扫描版 PDF 请先进行 OCR。 ");
      setPdfText(extracted);
      setPdfInfo(`已提取 ${processedPages}/${document.numPages} 页 · ${extracted.length.toLocaleString("zh-CN")} 字符${processedPages < document.numPages ? " · 已按模型上下文截取" : ""}`);
      setNotice({ type: "success", text: "PDF 解析完成，可以开始生成。" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "PDF 解析失败";
      setNotice({ type: "error", text: message });
      setPdfFile(null);
    } finally {
      setBusy("");
    }
  };

  const acceptFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setNotice({ type: "error", text: "请上传 PDF 文件。" });
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setNotice({ type: "error", text: "PDF 不能超过 40 MB。" });
      return;
    }
    setPdfFile(file);
    extractPdf(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const buildModelRequest = async () => {
    const config = configs[provider];
    const system = `${prompt}\n\n补充要求：二维码来源网址为 ${sourceUrl || "未提供"}。网址只用于二维码与来源说明，不得据此编造论文内容。`;
    const user = `请根据以下 PDF 抽取文本生成 JSON：\n\n${pdfText}`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 150000);
    try {
      if (connectionMode === "relay") {
        if (provider === "custom") {
          throw new Error("自定义兼容接口不能使用本站转发，请选择“浏览器直连”并填写支持 CORS 的代理地址。");
        }
        const response = await fetch("/api/model", {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            provider,
            apiKey: config.apiKey,
            model: config.model,
            system,
            user,
          }),
        });
        const raw = await response.text();
        let result: { text?: string; error?: { message?: string } } = {};
        try {
          result = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error(`转发服务返回了无法识别的内容（${response.status}）`);
        }
        if (!response.ok) throw new Error(result.error?.message || `转发请求失败（${response.status}）`);
        if (!result.text) throw new Error("模型没有返回可用文本，请检查模型名称后重试。");
        return result.text;
      }

      if (provider === "anthropic") {
        const base = config.baseUrl.replace(/\/$/, "");
        const endpoint = base.endsWith("/messages") ? base : `${base}/messages`;
        const response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 7000,
            system,
            messages: [{ role: "user", content: user }],
          }),
        });
        const raw = await response.text();
        let result: { error?: { message?: string }; content?: Array<{ type?: string; text?: string }> } = {};
        try {
          result = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error(`Claude 接口返回了无法识别的内容（${response.status}）`);
        }
        if (!response.ok) throw new Error(result?.error?.message || `Claude 请求失败（${response.status}）`);
        const text = Array.isArray(result.content)
          ? result.content.filter((item: { type?: string }) => item.type === "text").map((item: { text?: string }) => item.text || "").join("\n")
          : "";
        return text;
      }

      const base = config.baseUrl.replace(/\/$/, "");
      const endpoint = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
      const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          stream: false,
        }),
      });
      const raw = await response.text();
      let result: { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> } = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`模型接口返回了无法识别的内容（${response.status}）`);
      }
      if (!response.ok) throw new Error(result?.error?.message || `模型请求失败（${response.status}）`);
      return result?.choices?.[0]?.message?.content || "";
    } finally {
      window.clearTimeout(timer);
    }
  };

  const generate = async () => {
    if (!pdfText) {
      setNotice({ type: "error", text: "请先上传并解析 PDF。" });
      return;
    }
    if (!currentConfig.apiKey) {
      setTab("settings");
      setNotice({ type: "error", text: `请先填写 ${currentConfig.label} API Key。` });
      return;
    }
    setBusy("generating");
    setNotice(null);
    try {
      const responseText = await buildModelRequest();
      const parsed = parseJsonResponse(responseText);
      setData(normalizeDigest(parsed));
      setNotice({ type: "success", text: "可视化解读已生成。请核对关键数据后再发布。" });
    } catch (error) {
      const isNetworkFailure = error instanceof TypeError && /fetch|network|load failed/i.test(error.message);
      const message = error instanceof Error
        ? error.name === "AbortError"
          ? "请求超时，请缩短 PDF 或稍后重试。"
          : isNetworkFailure
            ? connectionMode === "direct"
              ? "浏览器阻止了模型直连请求。请在“模型”中切换到“本站转发”，或填写支持 CORS 的自定义代理地址。"
              : "无法连接本站转发服务，请检查当前网络后重试。"
            : error.message
        : "生成失败";
      setNotice({ type: "error", text: message });
    } finally {
      setBusy("");
    }
  };

  const exportPng = async () => {
    if (!previewRef.current) return;
    setBusy("exporting");
    setNotice(null);
    try {
      await Promise.all([
        document.fonts.load('700 30px "Source Han Serif SC Embedded"', data.title || "论文标题"),
        document.fonts.load(
          '700 21px "Source Han Serif SC Embedded"',
          "研究背景 核心数据一览 理论与分析框架 知识结构 范式演进与治理响应 未来深化方向",
        ),
      ]);
      await document.fonts.ready;
      const url = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fbfaf6",
      });
      const anchor = document.createElement("a");
      anchor.download = `${data.title.replace(/[\\/:*?"<>|]/g, "_") || "论文可视化解读"}.png`;
      anchor.href = url;
      anchor.click();
      setNotice({ type: "success", text: "高清 PNG 已导出。" });
    } catch {
      setNotice({ type: "error", text: "PNG 导出失败，请尝试使用“打印 / PDF”。" });
    } finally {
      setBusy("");
    }
  };

  const providerOptions = useMemo(() => Object.entries(configs) as [ProviderId, ProviderConfig][], [configs]);

  return (
    <main className="tool-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark"><WandSparkles aria-hidden="true" /></div>
          <div>
            <span>PAPER VISUAL DIGEST</span>
            <strong>论文可视化解读生成器</strong>
          </div>
        </div>
        <div className="header-note">
          <span className="status-dot" />
          PDF 本地解析 · 同源转发解决跨域
        </div>
      </header>

      <div className="workspace">
        <aside className="control-panel">
          <div className="control-intro">
            <span className="step-kicker">01 / CREATE</span>
            <h1>把一篇论文，<br />变成一张可读的长图。</h1>
            <p>上传 PDF、填写原文网址，模型会按附件样式重组论文，并自动生成二维码。</p>
          </div>

          <nav className="tabs" aria-label="工具设置">
            <button className={tab === "input" ? "active" : ""} onClick={() => setTab("input")}><UploadCloud />输入</button>
            <button className={tab === "prompt" ? "active" : ""} onClick={() => setTab("prompt")}><Sparkles />提示词</button>
            <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}><Settings2 />模型</button>
          </nav>

          <div className="panel-scroll">
            {tab === "input" && (
              <div className="tab-content">
                <div className="field-group">
                  <div className="field-label"><span>01</span><label>论文 PDF</label><small>最大 40 MB</small></div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    hidden
                    onChange={(event: ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0])}
                  />
                  <div
                    className={`dropzone ${isDragging ? "dragging" : ""} ${pdfText ? "complete" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click(); }}
                  >
                    <div className="drop-icon">{busy === "extracting" ? <LoaderCircle className="spin" /> : pdfText ? <Check /> : <FileText />}</div>
                    <div>
                      <strong>{pdfFile ? pdfFile.name : "拖入或点击选择 PDF"}</strong>
                      <span>{busy === "extracting" ? "正在提取论文文字…" : pdfInfo || "文字仅在当前浏览器中解析"}</span>
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label"><span>02</span><label htmlFor="source-url">原文 / 成果网址</label><small>用于二维码</small></div>
                  <div className="input-with-icon">
                    <Link2 aria-hidden="true" />
                    <input id="source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://doi.org/…" />
                  </div>
                  <div className="qr-inline">
                    {qrDataUrl && <img src={qrDataUrl} alt="二维码预览" />}
                    <p><strong>二维码即时生成</strong><span>网址不会参与论文内容推断。</span></p>
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label"><span>03</span><label htmlFor="quick-provider">生成模型</label><button onClick={() => setTab("settings")}>配置 Key</button></div>
                  <div className="select-wrap">
                    <select id="quick-provider" value={provider} onChange={(event) => chooseProvider(event.target.value as ProviderId)}>
                      {providerOptions.map(([id, item]) => <option value={id} key={id}>{item.label} · {item.model}</option>)}
                    </select>
                    <ChevronDown aria-hidden="true" />
                  </div>
                </div>

                <button className="generate-button" onClick={generate} disabled={busy === "generating"}>
                  {busy === "generating" ? <LoaderCircle className="spin" /> : <Sparkles />}
                  <span>{busy === "generating" ? "正在阅读与重组论文…" : "生成可视化解读"}</span>
                </button>
                {!canGenerate && <p className="generate-hint">需要完成 PDF 解析，并在“模型”中填写当前接口的 Key。</p>}
                <p className="model-disclosure"><AlertCircle />{connectionMode === "relay" ? "转发模式下，Key 与提取后的论文文字会经本站即时转发给模型服务商，应用不保存；PDF 文件始终只在本机解析。" : "直连模式下，Key 与提取后的论文文字由浏览器直接发送给模型服务商；PDF 文件始终只在本机解析。"}</p>
              </div>
            )}

            {tab === "prompt" && (
              <div className="tab-content">
                <div className="prompt-heading">
                  <div><span>STYLE PROMPT</span><h2>附件样式提示词</h2></div>
                  <div className="mini-actions">
                    <button title="复制提示词" onClick={() => { navigator.clipboard.writeText(prompt); setNotice({ type: "success", text: "提示词已复制。" }); }}><Clipboard /></button>
                    <button title="恢复默认" onClick={() => setPrompt(DEFAULT_PROMPT)}><RefreshCcw /></button>
                  </div>
                </div>
                <p className="prompt-tip">你可以修改模块数量、文字长度或研究叙事规则。JSON 字段名不建议更改，否则页面可能无法完整渲染。</p>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} spellCheck={false} aria-label="生成提示词" />
              </div>
            )}

            {tab === "settings" && (
              <div className="tab-content">
                <div className="settings-heading">
                  <span>MODEL ACCESS</span>
                  <h2>模型接口设置</h2>
                  <p>支持 OpenAI、Claude、DeepSeek、通义千问及任意 OpenAI 兼容接口。</p>
                </div>

                <div className="provider-pills" role="list">
                  {providerOptions.map(([id, item]) => (
                    <button key={id} onClick={() => chooseProvider(id)} className={provider === id ? "active" : ""}>{item.label}</button>
                  ))}
                </div>

                <div className="field-group compact">
                  <div className="field-label"><label>连接方式</label><small>{connectionMode === "relay" ? "推荐" : "需接口支持 CORS"}</small></div>
                  <div className="connection-modes" role="group" aria-label="模型连接方式">
                    <button
                      type="button"
                      className={connectionMode === "relay" ? "active" : ""}
                      onClick={() => setConnectionMode("relay")}
                      disabled={provider === "custom"}
                    >
                      <strong>本站转发</strong><span>解决 Failed to fetch</span>
                    </button>
                    <button
                      type="button"
                      className={connectionMode === "direct" ? "active" : ""}
                      onClick={() => setConnectionMode("direct")}
                    >
                      <strong>浏览器直连</strong><span>Key 不经过本站</span>
                    </button>
                  </div>
                  {provider === "custom" && <p className="connection-help">自定义兼容接口仅支持浏览器直连，请确保该地址允许当前网页跨域访问。</p>}
                </div>

                <div className="field-group compact">
                  <div className="field-label"><label htmlFor="model-name">模型名称</label></div>
                  <input id="model-name" value={currentConfig.model} onChange={(event) => updateConfig({ model: event.target.value })} />
                </div>
                <div className="field-group compact">
                  <div className="field-label"><label htmlFor="base-url">Base URL</label><small>{connectionMode === "relay" ? "转发时使用官方地址" : "当前生效"}</small></div>
                  <input id="base-url" value={currentConfig.baseUrl} onChange={(event) => updateConfig({ baseUrl: event.target.value })} disabled={connectionMode === "relay"} />
                </div>
                <div className="field-group compact">
                  <div className="field-label"><label htmlFor="api-key">API Key</label><small>{currentConfig.apiKey ? "已填写" : "未填写"}</small></div>
                  <div className="password-input">
                    <KeyRound aria-hidden="true" />
                    <input id="api-key" type={showKey ? "text" : "password"} value={currentConfig.apiKey} onChange={(event) => updateConfig({ apiKey: event.target.value })} placeholder="sk-…" autoComplete="off" />
                    <button onClick={() => setShowKey((value) => !value)} aria-label={showKey ? "隐藏密钥" : "显示密钥"}>{showKey ? <EyeOff /> : <Eye />}</button>
                  </div>
                </div>

                <label className="remember-toggle">
                  <input type="checkbox" checked={currentConfig.rememberKey} onChange={(event) => updateConfig({ rememberKey: event.target.checked })} />
                  <span><i><Check /></i><strong>在本机浏览器中记住此 Key</strong><small>关闭时只保留到本次浏览器会话结束。</small></span>
                </label>

                <div className="security-note">
                  <AlertCircle />
                  <p><strong>安全提示</strong>{connectionMode === "relay" ? "本站转发用于避开浏览器跨域限制。Key 与论文文本仅随本次请求转发给所选厂商，应用不写入数据库；请勿在公共电脑保存密钥。" : "浏览器直连时，Key 不经过本站，但厂商接口若未开放 CORS 会出现 Failed to fetch。此时请切换到本站转发。"}</p>
                </div>
              </div>
            )}
          </div>

          {notice && (
            <div className={`notice notice-${notice.type}`}>
              {notice.type === "success" ? <Check /> : <AlertCircle />}
              <span>{notice.text}</span>
              <button onClick={() => setNotice(null)}>×</button>
            </div>
          )}
        </aside>

        <section className="preview-area">
          <div className="preview-toolbar">
            <div className="preview-label"><span>02 / PREVIEW</span><strong>实时成稿</strong></div>
            <div className="toolbar-actions">
              <div className="zoom-control">
                <button onClick={() => setZoom((value) => Math.max(0.5, +(value - 0.1).toFixed(2)))} aria-label="缩小"><Minus /></button>
                <span>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((value) => Math.min(1.1, +(value + 0.1).toFixed(2)))} aria-label="放大"><Plus /></button>
              </div>
              <button className="tool-button" onClick={() => window.print()}><Printer />打印 / PDF</button>
              <button className="tool-button primary" onClick={exportPng} disabled={busy === "exporting"}>{busy === "exporting" ? <LoaderCircle className="spin" /> : <Download />}导出 PNG</button>
            </div>
          </div>
          <div className="preview-stage">
            <div className="preview-scale" style={{ zoom } as CSSProperties & { zoom: number }}>
              <div ref={previewRef}>
                <DigestSheet data={data} qrDataUrl={qrDataUrl} sourceUrl={sourceUrl} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
