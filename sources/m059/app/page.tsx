"use client";

import { useMemo, useState } from "react";

type DimensionId = "design" | "process" | "outcome" | "feedback" | "equity" | "improve";
type SourceId = "SIS" | "LMS" | "OBS" | "EXAM" | "SURVEY" | "VIDEO" | "PORT" | "QA";

type Indicator = {
  id: string;
  dimension: DimensionId;
  name: string;
  weight: number;
  score: number;
  source: SourceId[];
  formula: string;
  definition: string;
};

type Dimension = {
  id: DimensionId;
  code: string;
  name: string;
  weight: number;
  color: string;
  summary: string;
};

const dimensions: Dimension[] = [
  { id: "design", code: "D1", name: "教学设计与目标", weight: 18, color: "#E07563", summary: "课程目标、教学内容与毕业要求之间是否形成清晰闭环。" },
  { id: "process", code: "D2", name: "课堂教学过程", weight: 20, color: "#2F7068", summary: "课堂组织、互动参与、形成性反馈与教学实施质量。" },
  { id: "outcome", code: "D3", name: "学生学习成效", weight: 28, color: "#D59D3D", summary: "关注学生真正学会了什么，以及学习前后的能力增值。" },
  { id: "feedback", code: "D4", name: "多元评价与反馈", weight: 12, color: "#6677A8", summary: "学生、同行、督导与数据证据相互校验，避免单一评价。" },
  { id: "equity", code: "D5", name: "学习公平与支持", weight: 12, color: "#8A6D8F", summary: "识别群体差距、困难学生支持与学习资源可及性。" },
  { id: "improve", code: "D6", name: "持续改进与创新", weight: 10, color: "#7B8260", summary: "评价结果是否转化为可验证的课程改进行动。" },
];

const sourceMeta: Record<SourceId, { name: string; detail: string; owner: string; frequency: string; grain: string; readiness: number }> = {
  SIS: { name: "教务系统", detail: "课程、选课、学生、排课与基础成绩", owner: "教务处", frequency: "学期 / 日", grain: "学生—课程", readiness: 96 },
  LMS: { name: "教学平台", detail: "学习行为、资源访问、作业、测验与反馈", owner: "信息中心 / 开课单位", frequency: "实时 / 日", grain: "学习事件", readiness: 93 },
  OBS: { name: "课堂观察", detail: "同行或督导按统一量规记录的观察证据", owner: "质量管理部门", frequency: "每学期 ≥ 2 次", grain: "课堂—观察项", readiness: 82 },
  EXAM: { name: "考试与测评", detail: "前测、后测、课程考核与能力任务数据", owner: "开课单位", frequency: "教学节点", grain: "学生—题项", readiness: 94 },
  SURVEY: { name: "问卷访谈", detail: "学生体验、获得感与教学支持反馈", owner: "质量管理部门", frequency: "期中 / 期末", grain: "匿名答卷", readiness: 78 },
  VIDEO: { name: "课堂感知", detail: "经授权、去标识化的出勤与互动事件统计", owner: "信息中心", frequency: "课堂事件", grain: "班级聚合事件", readiness: 72 },
  PORT: { name: "作品档案", detail: "项目、实验、作品集与真实任务产出", owner: "开课单位", frequency: "任务节点", grain: "学生—作品", readiness: 86 },
  QA: { name: "质量档案", detail: "课程大纲、达成分析、改进记录与审核材料", owner: "开课单位 / 学院", frequency: "学期", grain: "课程—材料", readiness: 90 },
};

const initialIndicators: Indicator[] = [
  { id: "I101", dimension: "design", name: "目标—毕业要求对齐度", weight: 5, score: 88, source: ["QA", "SIS"], formula: "专家量规评分 × 0.6 + 对齐矩阵完整度 × 0.4", definition: "课程目标可观测、可测量，并能明确支撑专业毕业要求。" },
  { id: "I102", dimension: "design", name: "教学内容适切与更新", weight: 4, score: 82, source: ["QA", "LMS"], formula: "内容审查得分 × 0.7 + 资源年度更新率 × 0.3", definition: "内容难度、前后衔接、学科前沿与行业实践保持适切。" },
  { id: "I103", dimension: "design", name: "学习活动设计质量", weight: 4, score: 86, source: ["QA", "LMS", "OBS"], formula: "情境任务、合作探究与反馈机制量规均值", definition: "活动能够激活学生参与并支撑目标达成，而非简单堆叠形式。" },
  { id: "I104", dimension: "design", name: "考核与目标一致性", weight: 5, score: 84, source: ["QA", "EXAM"], formula: "考核覆盖度 × 0.5 + 难度匹配度 × 0.5", definition: "考核内容、认知层级和评分标准与课程目标一致。" },
  { id: "I201", dimension: "process", name: "有效到课率", weight: 4, score: 91, source: ["SIS", "VIDEO"], formula: "有效参与课次 ÷ 应参与课次 × 100", definition: "剔除请假、调课等合理因素后的有效到课水平。" },
  { id: "I202", dimension: "process", name: "课堂参与度", weight: 5, score: 78, source: ["LMS", "OBS", "VIDEO"], formula: "行为事件标准分 × 0.4 + 观察量规 × 0.6", definition: "学生提问、讨论、练习、展示等可观测学习参与。" },
  { id: "I203", dimension: "process", name: "高阶认知活动占比", weight: 5, score: 76, source: ["OBS", "LMS"], formula: "分析、评价、创造类活动时长 ÷ 有效教学时长", definition: "课堂是否超越记忆理解，进入分析、综合、评价和创造。" },
  { id: "I204", dimension: "process", name: "形成性反馈及时性", weight: 3, score: 85, source: ["LMS", "SURVEY"], formula: "按约定时限完成反馈的任务数 ÷ 应反馈任务数", definition: "反馈是否及时、具体，并能指向学生下一步行动。" },
  { id: "I205", dimension: "process", name: "课堂组织与节奏", weight: 3, score: 87, source: ["OBS", "SURVEY"], formula: "课堂观察量规 × 0.7 + 学生体验校正分 × 0.3", definition: "教学环节转换、时间分配和学习负荷保持合理。" },
  { id: "I301", dimension: "outcome", name: "知识掌握增值", weight: 8, score: 83, source: ["EXAM", "SIS"], formula: "标准化增值 g = (后测−前测) ÷ (100−前测)", definition: "比较同一批学生学习前后的变化，降低生源基础差异影响。" },
  { id: "I302", dimension: "outcome", name: "能力任务达成度", weight: 7, score: 86, source: ["PORT", "EXAM"], formula: "各能力点量规得分按支撑权重加权", definition: "学生在项目、实验或真实任务中呈现的综合能力。" },
  { id: "I303", dimension: "outcome", name: "课程目标达成度", weight: 5, score: 84, source: ["EXAM", "QA"], formula: "直接证据 × 0.8 + 间接证据 × 0.2", definition: "以考试、任务等直接证据为主，学生感知等间接证据为辅。" },
  { id: "I304", dimension: "outcome", name: "低成效学生改善率", weight: 4, score: 72, source: ["SIS", "LMS", "EXAM"], formula: "预警后显著改善人数 ÷ 获得支持的预警人数", definition: "教学支持是否真正帮助原本处于风险区的学生。" },
  { id: "I305", dimension: "outcome", name: "迁移与综合应用", weight: 4, score: 80, source: ["PORT", "EXAM"], formula: "陌生情境任务量规得分的标准化结果", definition: "学生能否将所学迁移到新问题、跨章节或真实情境。" },
  { id: "I401", dimension: "feedback", name: "学生评价校正分", weight: 3, score: 82, source: ["SURVEY", "SIS"], formula: "去极值后，按课程类型与班额进行分层校正", definition: "学生体验是重要证据，但不直接等同于教学质量。" },
  { id: "I402", dimension: "feedback", name: "同行评价", weight: 3, score: 88, source: ["OBS"], formula: "不少于 2 名同行的量规评分均值", definition: "由熟悉课程内容与教学法的同行提供专业判断。" },
  { id: "I403", dimension: "feedback", name: "督导评价", weight: 3, score: 85, source: ["OBS", "QA"], formula: "多次观察得分按观察时长加权", definition: "基于统一标准对课堂规范与教学实施进行观察。" },
  { id: "I404", dimension: "feedback", name: "反馈闭环完成度", weight: 3, score: 79, source: ["QA", "SURVEY"], formula: "已回应且有证据的反馈事项 ÷ 应回应事项", definition: "评价意见是否被分析、回应，并形成可追踪行动。" },
  { id: "I501", dimension: "equity", name: "关键群体成效差距", weight: 4, score: 74, source: ["SIS", "EXAM"], formula: "100 − min(100, 群体效应量绝对值 × 50)", definition: "关注不同基础、性别、地区等群体的成效差距，不用于标签化。" },
  { id: "I502", dimension: "equity", name: "学业预警响应率", weight: 3, score: 81, source: ["LMS", "QA"], formula: "时限内完成人工复核与支持的人数 ÷ 预警人数", definition: "预警必须经过人工复核，并对应到具体支持措施。" },
  { id: "I503", dimension: "equity", name: "资源可及性", weight: 2, score: 92, source: ["LMS", "SURVEY"], formula: "无障碍、移动端与低带宽可用性量规得分", definition: "学习资源在设备、网络和身心条件差异下仍可使用。" },
  { id: "I504", dimension: "equity", name: "学习支持获得感", weight: 3, score: 84, source: ["SURVEY", "LMS"], formula: "支持可获得性 × 0.5 + 支持有效性感知 × 0.5", definition: "学生是否知道如何求助，并认为支持对学习确有帮助。" },
  { id: "I601", dimension: "improve", name: "改进措施完成率", weight: 3, score: 90, source: ["QA"], formula: "按期完成且留有证据的措施 ÷ 计划措施", definition: "改进事项具备责任人、期限、资源与可验证成果。" },
  { id: "I602", dimension: "improve", name: "改进有效性", weight: 4, score: 77, source: ["QA", "EXAM", "LMS"], formula: "改进后关键指标变化的标准化效应值", definition: "不只看措施是否完成，更看是否真正改善学生学习。" },
  { id: "I603", dimension: "improve", name: "教学创新证据", weight: 2, score: 83, source: ["PORT", "QA"], formula: "创新相关性 × 0.4 + 实施质量 × 0.3 + 成效证据 × 0.3", definition: "创新必须服务学习问题，并由实施过程和学生成效共同证明。" },
  { id: "I604", dimension: "improve", name: "质量材料完整性", weight: 1, score: 95, source: ["QA"], formula: "必要材料完整项 ÷ 应归档项 × 100", definition: "保留可复核的目标、过程、结果与改进证据。" },
];

function scoreLevel(score: number) {
  if (score >= 90) return { label: "卓越", note: "形成可推广的有效实践" };
  if (score >= 80) return { label: "良好", note: "总体有效，仍有结构性提升空间" };
  if (score >= 70) return { label: "合格", note: "达到基本要求，需聚焦薄弱指标" };
  if (score >= 60) return { label: "待改进", note: "制定限期改进计划并跟踪复评" };
  return { label: "重点改进", note: "启动专项支持与教学诊断" };
}

const improvementAdvice: Record<string, string> = {
  I203: "将课堂任务按“理解—分析—评价—创造”分层，至少安排一个需要解释依据或生成方案的高阶任务。",
  I304: "对预警学生先做原因复核，再配置同伴辅导、分层任务与二次反馈，连续跟踪两次测评变化。",
  I501: "按前测基础分层比较学习增值，定位差距出现的知识点和教学环节，避免仅比较期末绝对成绩。",
  I602: "为每项改进措施绑定一个可观测成效指标，采用改进前后同口径数据验证效果。",
};

const defaultDimensionWeights = Object.fromEntries(dimensions.map((item) => [item.id, item.weight])) as Record<DimensionId, number>;

export default function Home() {
  const [selectedDimension, setSelectedDimension] = useState<DimensionId | "all">("all");
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator>(initialIndicators[9]);
  const [indicators, setIndicators] = useState<Indicator[]>(initialIndicators);
  const [dimensionWeights, setDimensionWeights] = useState<Record<DimensionId, number>>(defaultDimensionWeights);
  const [libraryDimension, setLibraryDimension] = useState<DimensionId | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const dimensionScores = useMemo(() => Object.fromEntries(dimensions.map((dimension) => {
    const rows = indicators.filter((item) => item.dimension === dimension.id);
    const totalWeight = rows.reduce((sum, item) => sum + item.weight, 0);
    return [dimension.id, rows.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight];
  })) as Record<DimensionId, number>, [indicators]);
  const totalDimensionWeight = Object.values(dimensionWeights).reduce((sum, value) => sum + value, 0);
  const totalScore = dimensions.reduce((sum, item) => sum + dimensionScores[item.id] * dimensionWeights[item.id], 0) / Math.max(1, totalDimensionWeight);
  const evidenceConfidence = indicators.reduce((sum, item) => {
    const sourceAverage = item.source.reduce((sourceSum, source) => sourceSum + sourceMeta[source].readiness, 0) / item.source.length;
    return sum + sourceAverage * item.weight;
  }, 0) / indicators.reduce((sum, item) => sum + item.weight, 0);
  const selectedLiveIndicator = indicators.find((item) => item.id === selectedIndicator.id) ?? selectedIndicator;
  const filteredIndicators = indicators.filter((item) => (libraryDimension === "all" || item.dimension === libraryDimension) && `${item.id}${item.name}${item.definition}`.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  const sortedIndicators = [...indicators].sort((a, b) => a.score - b.score);
  const weakest = sortedIndicators.slice(0, 3);
  const strongest = sortedIndicators.slice(-3).reverse();
  const level = scoreLevel(totalScore);

  function updateIndicatorScore(id: string, value: number) {
    const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    setIndicators((current) => current.map((item) => item.id === id ? { ...item, score: safeValue } : item));
  }

  function updateDimensionWeight(id: DimensionId, value: number) {
    const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    setDimensionWeights((current) => ({ ...current, [id]: safeValue }));
  }

  function resetEvaluation() {
    setIndicators(initialIndicators);
    setDimensionWeights(defaultDimensionWeights);
  }

  function downloadEvaluation() {
    const payload = {
      framework: "高校教学成效评价知识图谱 V1.0",
      generatedAt: new Date().toISOString(),
      totalScore: Number(totalScore.toFixed(2)),
      level: level.label,
      evidenceConfidence: Number(evidenceConfidence.toFixed(2)),
      dimensions: dimensions.map((item) => ({ code: item.code, name: item.name, weight: dimensionWeights[item.id], score: Number(dimensionScores[item.id].toFixed(2)) })),
      indicators,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "高校教学成效评价示例数据.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回页面顶部"><span className="brand-mark">TE</span><span><b>教学成效评价</b><small>Teaching Effectiveness Framework</small></span></a>
        <nav aria-label="页面导航"><a href="#framework">评价框架</a><a href="#graph">知识图谱</a><a href="#indicators">指标库</a><a href="#method">综合测评</a><a href="#governance">评价规范</a></nav>
        <button className="outline-button" type="button" onClick={downloadEvaluation}>下载数据</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>高校课堂质量治理</span><span>V 1.0 · 示范框架</span></p>
          <h1>教学成效，<br /><em>不是一次打分。</em></h1>
          <p className="hero-intro">从课堂活动出发，以学生学习增值为核心，用多源证据回答三个问题：教得是否有效、学生是否真正学会、评价结果是否推动持续改进。</p>
          <div className="hero-actions"><a className="primary-button" href="#graph">探索评价图谱 <span>↘</span></a><a className="text-link" href="#method">查看计算逻辑 →</a></div>
        </div>
        <aside className="score-panel" aria-label="综合评价得分">
          <div className="panel-index">00 / 综合结果</div>
          <div className="score-ring" style={{ "--score": `${totalScore * 3.6}deg` } as React.CSSProperties}><div><strong>{totalScore.toFixed(1)}</strong><span>/ 100</span></div></div>
          <div className="score-level"><span>{level.label}</span><p>{level.note}</p></div>
          <div className="score-meta"><div><b>06</b><span>评价维度</span></div><div><b>26</b><span>核心指标</span></div><div><b>{evidenceConfidence.toFixed(0)}%</b><span>证据可信度</span></div></div>
        </aside>
      </section>

      <section className="framework-section" id="framework">
        <div className="section-heading"><div><span className="section-no">01</span><p>评价框架</p></div><h2>从“教了什么”转向<br />“学生获得了什么”</h2><p>六个维度构成从设计、实施、成效到改进的完整证据链。学生学习成效权重最高，同时保留课堂过程、公平支持与专业判断。</p></div>
        <div className="dimension-grid">
          {dimensions.map((dimension) => <button className={`dimension-card ${selectedDimension === dimension.id ? "active" : ""}`} key={dimension.id} onClick={() => setSelectedDimension(dimension.id)} style={{ "--accent": dimension.color } as React.CSSProperties} type="button">
            <span className="dimension-top"><b>{dimension.code}</b><i>{dimensionWeights[dimension.id]}%</i></span><strong>{dimension.name}</strong><p>{dimension.summary}</p><span className="dimension-score">当前得分 <b>{dimensionScores[dimension.id].toFixed(1)}</b></span>
          </button>)}
        </div>
      </section>

      <section className="graph-section" id="graph">
        <div className="section-heading light"><div><span className="section-no">02</span><p>知识图谱</p></div><h2>把指标、证据与规则<br />连接为可追溯网络</h2><p>点击维度进入局部图谱，再选择指标查看定义、数据来源和计算规则。评价结论可以沿关系链回溯到原始证据。</p></div>
        <div className="graph-toolbar" role="group" aria-label="图谱维度筛选"><button className={selectedDimension === "all" ? "active" : ""} onClick={() => setSelectedDimension("all")} type="button">全景</button>{dimensions.map((d) => <button className={selectedDimension === d.id ? "active" : ""} onClick={() => setSelectedDimension(d.id)} key={d.id} type="button">{d.code}</button>)}</div>
        <div className="graph-workspace">
          <KnowledgeGraph selectedDimension={selectedDimension} indicators={indicators} dimensionWeights={dimensionWeights} onDimensionSelect={setSelectedDimension} onIndicatorSelect={setSelectedIndicator} />
          <aside className="node-inspector">
            <div className="inspector-label">当前指标 · {selectedLiveIndicator.id}</div><h3>{selectedLiveIndicator.name}</h3><p className="definition">{selectedLiveIndicator.definition}</p>
            <dl><div><dt>所属维度</dt><dd>{dimensions.find((d) => d.id === selectedLiveIndicator.dimension)?.name}</dd></div><div><dt>指标权重</dt><dd>{selectedLiveIndicator.weight} / 100</dd></div><div><dt>当前得分</dt><dd>{selectedLiveIndicator.score.toFixed(1)}</dd></div></dl>
            <div className="formula-box"><span>初步计算</span><p>{selectedLiveIndicator.formula}</p></div>
            <div className="source-list"><span>数据证据</span>{selectedLiveIndicator.source.map((source) => <button key={source} title={sourceMeta[source].detail} type="button"><b>{source}</b>{sourceMeta[source].name}</button>)}</div>
          </aside>
        </div>
      </section>

      <section className="indicator-section" id="indicators">
        <div className="section-heading"><div><span className="section-no">03</span><p>指标与数据</p></div><h2>每一个分数，<br />都能找到证据出处</h2><p>指标库给出操作性定义、建议权重、数据来源与初步公式。下方示例分值可直接调整，综合结果会同步重算。</p></div>
        <div className="library-toolbar">
          <label className="search-box"><span>检索指标</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="输入指标编号、名称或定义" /></label>
          <div className="library-filters" role="group" aria-label="指标维度筛选"><button className={libraryDimension === "all" ? "active" : ""} onClick={() => setLibraryDimension("all")} type="button">全部 26</button>{dimensions.map((item) => <button className={libraryDimension === item.id ? "active" : ""} onClick={() => setLibraryDimension(item.id)} key={item.id} type="button">{item.code}</button>)}</div>
        </div>
        <div className="indicator-table-wrap">
          <table className="indicator-table">
            <thead><tr><th>编号 / 指标</th><th>维度</th><th>数据来源</th><th>初步计算规则</th><th>权重</th><th>当前得分</th></tr></thead>
            <tbody>{filteredIndicators.map((item) => {
              const dimension = dimensions.find((d) => d.id === item.dimension)!;
              return <tr key={item.id} onClick={() => setSelectedIndicator(item)}>
                <td><span className="row-code">{item.id}</span><strong>{item.name}</strong><small>{item.definition}</small></td>
                <td><span className="dimension-pill" style={{ "--pill": dimension.color } as React.CSSProperties}>{dimension.code}</span>{dimension.name}</td>
                <td><div className="table-sources">{item.source.map((source) => <span key={source} title={sourceMeta[source].name}>{source}</span>)}</div></td>
                <td><p className="table-formula">{item.formula}</p></td>
                <td><b className="weight-value">{item.weight}</b></td>
                <td><div className="score-input"><input aria-label={`${item.name}得分滑块`} type="range" min="0" max="100" value={item.score} onChange={(event) => updateIndicatorScore(item.id, Number(event.target.value))} /><input aria-label={`${item.name}得分`} type="number" min="0" max="100" value={item.score} onChange={(event) => updateIndicatorScore(item.id, Number(event.target.value))} /></div></td>
              </tr>;
            })}</tbody>
          </table>
          {filteredIndicators.length === 0 && <div className="empty-state">没有找到匹配指标，请调整检索条件。</div>}
        </div>

        <div className="source-heading"><div><span>08</span><p>数据源字典</p></div><h3>跨系统汇聚，但不混淆证据性质</h3><p>行为日志、考核结果与专业观察分别回答不同问题。系统数据提供规模与连续性，人工量规提供语境与专业解释。</p></div>
        <div className="source-matrix">
          {(Object.entries(sourceMeta) as [SourceId, typeof sourceMeta[SourceId]][]).map(([id, source]) => <article key={id}>
            <div className="source-code"><b>{id}</b><span>{source.readiness}%</span></div><h4>{source.name}</h4><p>{source.detail}</p>
            <dl><div><dt>责任单位</dt><dd>{source.owner}</dd></div><div><dt>采集频率</dt><dd>{source.frequency}</dd></div><div><dt>最小粒度</dt><dd>{source.grain}</dd></div></dl>
          </article>)}
        </div>
      </section>

      <section className="calculator-section" id="method">
        <div className="section-heading light"><div><span className="section-no">04</span><p>综合测评</p></div><h2>调整分值与权重，<br />实时生成综合诊断</h2><p>先在维度内部按指标权重求得分，再按维度权重汇总。权重合计偏离 100% 时自动按比例归一化，避免误算。</p></div>

        <div className="calculator-grid">
          <aside className="weights-editor">
            <div className="lab-title"><span>01</span><h3>维度权重</h3><p className={Math.abs(totalDimensionWeight - 100) < .01 ? "valid" : "warning"}>合计 {totalDimensionWeight.toFixed(0)}%</p></div>
            {dimensions.map((item) => <label className="weight-row" key={item.id}><span><i style={{ background: item.color }} />{item.code} {item.name}</span><span><input aria-label={`${item.name}权重`} type="number" min="0" max="100" value={dimensionWeights[item.id]} onChange={(event) => updateDimensionWeight(item.id, Number(event.target.value))} />%</span></label>)}
            <p className="weight-note">建议由学校根据人才培养定位、课程类型和评价用途，经专家论证后确定权重；不同课程不宜机械套用同一组参数。</p>
          </aside>

          <div className="dimension-analysis">
            <div className="lab-title"><span>02</span><h3>维度得分</h3><p>分层加权结果</p></div>
            <div className="bar-list">{dimensions.map((item) => <div className="bar-row" key={item.id}><div><span>{item.code} {item.name}</span><b>{dimensionScores[item.id].toFixed(1)}</b></div><div className="bar-track"><i style={{ width: `${dimensionScores[item.id]}%`, background: item.color }} /></div><small>综合贡献 {(dimensionScores[item.id] * dimensionWeights[item.id] / Math.max(1, totalDimensionWeight)).toFixed(1)} 分</small></div>)}</div>
            <div className="calculation-formula"><span>分层加权公式</span><strong>T = Σ W<sub>j</sub> × (Σ w<sub>ij</sub>S<sub>ij</sub> / Σ w<sub>ij</sub>)</strong><p>直接证据建议不低于 70%；学生评价等间接证据一般不宜超过 30%。证据可信度独立披露，不直接乘入得分。</p></div>
          </div>

          <aside className="live-result">
            <div className="lab-title"><span>03</span><h3>综合结果</h3><p>即时更新</p></div>
            <div className="live-score"><strong>{totalScore.toFixed(1)}</strong><span>/ 100</span></div>
            <div className="result-level"><b>{level.label}</b><p>{level.note}</p></div>
            <div className="confidence-row"><span>证据可信度</span><b>{evidenceConfidence.toFixed(1)}%</b><div><i style={{ width: `${evidenceConfidence}%` }} /></div></div>
            <div className="result-actions"><button type="button" onClick={() => window.print()}>打印 / PDF</button><button type="button" onClick={resetEvaluation}>恢复示例</button></div>
          </aside>
        </div>

        <div className="standardization-grid">
          <article><span>A / 正向指标</span><h4>目标达成型</h4><strong>S = min(100, x ÷ 目标值 × 100)</strong><p>适用于到课率、反馈及时率、任务达成度等“越高越好”指标。</p></article>
          <article><span>B / 逆向指标</span><h4>风险控制型</h4><strong>S = max(0, 100 − 超阈值幅度)</strong><p>适用于群体差距、异常率、延期率等“越低越好”指标。</p></article>
          <article><span>C / 增值指标</span><h4>学习增值型</h4><strong>g = (后测 − 前测) ÷ (100 − 前测)</strong><p>同一学生前后对比，并按课程难度和群体基线进行分层解释。</p></article>
        </div>

        <div className="diagnosis-heading"><span>自动诊断</span><h3>分数的终点，是下一步行动</h3><p>以下结果随指标分值实时变化。诊断首先定位证据充分的薄弱指标，再提出可执行、可复评的改进建议。</p></div>
        <div className="diagnosis-grid">
          <article className="strength-card"><span>相对优势</span>{strongest.map((item, index) => <div key={item.id}><b>0{index + 1}</b><p><strong>{item.name}</strong><small>{dimensions.find((d) => d.id === item.dimension)?.name}</small></p><em>{item.score.toFixed(0)}</em></div>)}</article>
          <article className="risk-card"><span>优先改进</span>{weakest.map((item, index) => <div key={item.id}><b>0{index + 1}</b><p><strong>{item.name}</strong><small>{improvementAdvice[item.id] ?? "结合该指标的原始证据开展课程组复盘，明确责任人、完成期限和复评数据。"}</small></p><em>{item.score.toFixed(0)}</em></div>)}</article>
        </div>
      </section>

      <section className="governance-section" id="governance">
        <div className="section-heading"><div><span className="section-no">05</span><p>评价规范</p></div><h2>让评价促进学习，<br />而不是制造排名</h2><p>同一套数据可以用于诊断，也可能被滥用于简单排序。评价制度必须同时规定指标、证据、使用边界与申诉复核机制。</p></div>
        <div className="principle-grid">
          <article><span>01</span><h3>目标一致</h3><p>指标必须回到课程目标、毕业要求和学生发展，不以容易采集的数据替代真正重要的成效。</p></article>
          <article><span>02</span><h3>多源互证</h3><p>考核、作品、学习过程、学生反馈与专业观察交叉验证，任何单一来源不得直接决定结论。</p></article>
          <article><span>03</span><h3>增值与公平</h3><p>同时报告绝对达成和学习增值，控制生源基础、班额与课程类型差异，避免不公平比较。</p></article>
          <article><span>04</span><h3>闭环改进</h3><p>每项问题形成“证据—原因—措施—责任—期限—复评”记录，下一轮评价验证改进是否有效。</p></article>
        </div>

        <div className="ai-boundary">
          <div><span>AI 课堂感知边界</span><h3>摄像头数据只能提供线索，不能替代教学判断</h3></div>
          <div className="boundary-list"><p><b>01</b>只采集完成评价所必需的聚合事件，优先边缘计算与去标识化。</p><p><b>02</b>不使用情绪识别、面部表情推断“专注度”，不将人脸身份数据直接关联课程成绩。</p><p><b>03</b>算法异常必须由教师或质量人员复核，学生可查询、说明并申请更正。</p><p><b>04</b>明确授权、访问权限、保存期限和删除规则，原始视频原则上不进入评价数据仓库。</p></div>
        </div>

        <div className="grade-scale"><span>结果等级建议</span><div><b>≥ 90</b><p>卓越<small>形成可推广实践</small></p></div><div><b>80–89</b><p>良好<small>结构性提升</small></p></div><div><b>70–79</b><p>合格<small>聚焦薄弱项</small></p></div><div><b>60–69</b><p>待改进<small>限期复评</small></p></div><div><b>＜ 60</b><p>重点改进<small>专项支持</small></p></div></div>
      </section>

      <footer><p>高校教学成效评价知识图谱 · V1.0 示范框架</p><p>评价用于诊断与改进，不替代专业判断 · 示例数据非真实评价结果</p></footer>
    </main>
  );
}

function KnowledgeGraph({ selectedDimension, indicators, dimensionWeights, onDimensionSelect, onIndicatorSelect }: { selectedDimension: DimensionId | "all"; indicators: Indicator[]; dimensionWeights: Record<DimensionId, number>; onDimensionSelect: (id: DimensionId | "all") => void; onIndicatorSelect: (indicator: Indicator) => void; }) {
  if (selectedDimension === "all") {
    const positions = [[350, 70], [570, 150], [570, 350], [350, 430], [130, 350], [130, 150]];
    return <div className="graph-canvas"><svg viewBox="0 0 700 500" role="img" aria-label="高校教学成效评价六维知识图谱总览"><g className="edges">{positions.map(([x, y], index) => <line key={index} x1="350" y1="250" x2={x} y2={y} />)}</g>{dimensions.map((dimension, index) => { const [x, y] = positions[index]; return <g className="graph-node dimension-node" key={dimension.id} transform={`translate(${x} ${y})`} onClick={() => onDimensionSelect(dimension.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onDimensionSelect(dimension.id); }} tabIndex={0} role="button" aria-label={`查看${dimension.name}`}><circle r="53" fill={dimension.color} /><text y="-5">{dimension.code}</text><text className="node-name" y="16">{dimension.name}</text><text className="node-weight" y="34">权重 {dimensionWeights[dimension.id]}%</text></g>; })}<g className="graph-node root-node" transform="translate(350 250)"><circle r="75" /><text y="-12">高校课堂</text><text y="12">教学成效</text><text className="node-weight" y="36">综合评价</text></g></svg><p className="graph-hint">选择外围维度，展开指标与数据证据</p></div>;
  }
  const dimension = dimensions.find((item) => item.id === selectedDimension)!;
  const dimensionIndicators = indicators.filter((item) => item.dimension === selectedDimension);
  const sourceIds = [...new Set(dimensionIndicators.flatMap((item) => item.source))];
  const sourcePositions = sourceIds.map((_, index) => { const angle = Math.PI * 2 * index / sourceIds.length - Math.PI / 2; return [350 + Math.cos(angle) * 300, 250 + Math.sin(angle) * 205]; });
  const indicatorPositions = dimensionIndicators.map((_, index) => { const angle = Math.PI * 2 * index / dimensionIndicators.length - Math.PI / 2; return [350 + Math.cos(angle) * 150, 250 + Math.sin(angle) * 125]; });
  return <div className="graph-canvas"><svg viewBox="0 0 700 500" role="img" aria-label={`${dimension.name}指标与数据来源图谱`}><g className="edges indicator-edges">{indicatorPositions.map(([x, y], index) => <line key={`di-${index}`} x1="350" y1="250" x2={x} y2={y} />)}{dimensionIndicators.flatMap((indicator, indicatorIndex) => indicator.source.map((source) => { const sourceIndex = sourceIds.indexOf(source); return <line key={`${indicator.id}-${source}`} x1={indicatorPositions[indicatorIndex][0]} y1={indicatorPositions[indicatorIndex][1]} x2={sourcePositions[sourceIndex][0]} y2={sourcePositions[sourceIndex][1]} />; }))}</g>{sourceIds.map((source, index) => <g className="graph-node source-node" key={source} transform={`translate(${sourcePositions[index][0]} ${sourcePositions[index][1]})`}><circle r="35" /><text y="-2">{source}</text><text className="source-name" y="14">{sourceMeta[source].name}</text></g>)}{dimensionIndicators.map((indicator, index) => <g className="graph-node indicator-node" key={indicator.id} transform={`translate(${indicatorPositions[index][0]} ${indicatorPositions[index][1]})`} onClick={() => onIndicatorSelect(indicator)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onIndicatorSelect(indicator); }} tabIndex={0} role="button" aria-label={`查看${indicator.name}`}><circle r="44" fill={dimension.color} /><text y="-8">{indicator.id}</text><text className="indicator-name" y="10">{shortName(indicator.name, 8)}</text><text className="node-weight" y="27">{indicator.score} 分</text></g>)}<g className="graph-node root-node dimension-root" transform="translate(350 250)" onClick={() => onDimensionSelect("all")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onDimensionSelect("all"); }} tabIndex={0} role="button" aria-label="返回全景图谱"><circle r="64" style={{ fill: dimension.color }} /><text y="-8">{dimension.code}</text><text y="15">{dimension.name}</text><text className="node-weight" y="36">点击返回全景</text></g></svg><p className="graph-hint">内圈为指标，外圈为数据来源；点击中心返回全景</p></div>;
}

function shortName(value: string, max: number) { return value.length > max ? `${value.slice(0, max)}…` : value; }
