"use client";

import { useMemo, useState } from "react";

const scenarios = [
  {
    id: "ssp1",
    label: "SSP1",
    name: "绿色发展",
    result: "恢复较稳",
    note: "地下水储量逐步回升，波动相对较小。",
    image: "/ssp1.png",
    tone: "#2a7f86",
  },
  {
    id: "ssp2",
    label: "SSP2",
    name: "中间路径",
    result: "中等恢复",
    note: "整体改善，预测后期恢复速度有所加快。",
    image: "/ssp2.png",
    tone: "#3975a7",
  },
  {
    id: "ssp5",
    label: "SSP5",
    name: "高排放",
    result: "波动更大",
    note: "恢复较弱，中后期出现回落，南部亏损更明显。",
    image: "/ssp5.png",
    tone: "#d85f3f",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 64 24" aria-hidden="true">
      <path d="M1 14c8-13 14 11 23-2s16 8 23-1 12-2 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [gwsa, setGwsa] = useState(-130);
  const current = scenarios[activeScenario];

  const gauge = useMemo(() => {
    if (gwsa < -180) return { word: "严重亏损", text: "离基准状态很远", color: "#d85f3f" };
    if (gwsa < -90) return { word: "明显亏损", text: "地下水储量低于基准", color: "#dc8a3f" };
    if (gwsa < -30) return { word: "轻度亏损", text: "正在靠近基准状态", color: "#72a48e" };
    if (gwsa <= 0) return { word: "接近基准", text: "与基准期差距较小", color: "#2a7f86" };
    return { word: "高于基准", text: "储量高于基准期平均值", color: "#3975a7" };
  }, [gwsa]);

  return (
    <main>
      <header className="topbar" id="top">
        <a className="brand" href="#top">
          <strong>论文图解</strong>
          <span>GROUNDWATER · 2026</span>
        </a>
        <a className="paper-link" href="#source">17 页 → 1 张图</a>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">给第一次接触这个话题的人</p>
          <h1>京津冀地下水，<br /><em>未来会怎样？</em></h1>
          <p className="hero-lede">研究者做了一台“预测机”：既看地图，也看多年趋势，还看每月波动。</p>
          <a className="primary-button" href="#answer">先看答案 <ArrowIcon /></a>
        </div>
        <div className="hero-fact">
          <span>研究范围</span>
          <strong>155</strong>
          <p>个县级单元</p>
          <i>2002—2035</i>
        </div>
      </section>

      <section className="map-stage" id="answer">
        <div className="map-head shell">
          <div>
            <span className="section-no">01 / 一眼看答案</span>
            <h2>总体在缓解，<br />但南部仍更缺。</h2>
          </div>
          <p>高排放情景下，恢复更弱、波动更大，南北差异也更明显。</p>
        </div>
        <figure className="map-figure">
          <img src="/scenarios.png" alt="论文中 SSP1、SSP2、SSP5 三种情景下 2025 至 2035 年京津冀平原地下水储量异常预测地图" />
          <figcaption>
            <span>SSP1 · 恢复较稳</span>
            <span>SSP2 · 中等恢复</span>
            <span>SSP5 · 波动更大</span>
          </figcaption>
        </figure>
        <p className="figure-note">原始预测图来自论文图 8—10；红橙色表示亏损更重，蓝色表示更接近基准状态。</p>
      </section>

      <section className="gwsa-section shell">
        <div className="section-heading">
          <span className="section-no">02 / 先懂一个词</span>
          <h2>GWSA，不是水位。</h2>
          <p>它表示“现在的地下水储量，与基准期相比差多少”。论文基准期为 2004—2009 年平均值。</p>
        </div>

        <div className="gauge-card">
          <div className="gauge-value">
            <span>拖动试试</span>
            <strong style={{ color: gauge.color }}>{gwsa > 0 ? "+" : ""}{gwsa}<small> mm</small></strong>
            <b>{gauge.word}</b>
            <p>{gauge.text}</p>
          </div>
          <div className="range-wrap">
            <input
              aria-label="调整地下水储量异常值"
              type="range"
              min="-240"
              max="30"
              step="10"
              value={gwsa}
              onChange={(event) => setGwsa(Number(event.target.value))}
              style={{ "--range-color": gauge.color } as React.CSSProperties}
            />
            <div className="range-labels"><span>亏损更重</span><span>0 = 基准</span></div>
          </div>
          <div className="plain-language">
            <b>记住一句：</b>
            <span>越接近 0，通常代表越接近基准状态。</span>
          </div>
        </div>
      </section>

      <section className="model-section">
        <div className="shell">
          <div className="section-heading light">
            <span className="section-no">03 / 模型怎么想</span>
            <h2>三个脑区，<br />各管一件事。</h2>
            <p>复杂名字不用背。把它们理解成三位分工明确的专家就够了。</p>
          </div>

          <div className="model-flow">
            <article className="model-card gcn">
              <span>GCN</span>
              <div className="node-pattern" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <h3>看邻居</h3>
              <p>相邻县域、水文地质分区会互相影响。</p>
            </article>
            <article className="model-card transformer">
              <span>Transformer</span>
              <div className="long-line" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
              <h3>看长趋势</h3>
              <p>从多年序列里寻找长期变化规律。</p>
            </article>
            <article className="model-card bilstm">
              <span>BiLSTM</span>
              <WaveIcon />
              <h3>看短波动</h3>
              <p>捕捉月份之间的局部起伏与连续性。</p>
            </article>
          </div>

          <div className="data-river">
            <div className="river-input">
              <span>输入</span>
              <b>地下水 · 降水 · 气温 · 蒸散发 · 土地利用</b>
            </div>
            <ArrowIcon />
            <div className="river-output">
              <span>输出</span>
              <b>2025—2035 年三种未来地图</b>
            </div>
          </div>
        </div>
      </section>

      <section className="scenario-section shell">
        <div className="section-heading">
          <span className="section-no">04 / 三种未来</span>
          <h2>未来不是一个答案。</h2>
          <p>不同发展与排放路径，会得到不同的地下水变化结果。点击切换情景。</p>
        </div>

        <div className="scenario-tabs" role="tablist" aria-label="未来情景">
          {scenarios.map((scenario, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeScenario === index}
              className={activeScenario === index ? "active" : ""}
              key={scenario.id}
              onClick={() => setActiveScenario(index)}
            >
              <span>{scenario.label}</span>
              <b>{scenario.name}</b>
            </button>
          ))}
        </div>

        <div className="scenario-panel" style={{ "--scenario-color": current.tone } as React.CSSProperties}>
          <div className="scenario-map">
            <img src={current.image} alt={`${current.label} 情景下 2025 至 2035 年京津冀平原地下水储量预测地图`} />
          </div>
          <div className="scenario-copy">
            <span>{current.label} · {current.name}</span>
            <h3>{current.result}</h3>
            <p>{current.note}</p>
            <div className="scenario-key">
              <i />
              <b>共同点：南部亏损高于北部</b>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-section">
        <div className="shell">
          <div className="section-heading light">
            <span className="section-no">05 / 模型靠不靠谱</span>
            <h2>比单一模型更稳。</h2>
            <p>2023—2024 年独立验证中，预测与真实空间格局高度一致。</p>
          </div>

          <div className="proof-grid">
            <article>
              <span>空间相关</span>
              <strong>0.9675</strong>
              <p>预测地图与真实地图高度一致</p>
            </article>
            <article>
              <span>RMSE 改善</span>
              <strong>30.99%</strong>
              <p>相比 GCN-BiLSTM 测试结果</p>
            </article>
            <article>
              <span>MAE 改善</span>
              <strong>36.92%</strong>
              <p>同一对比模型、归一化测试数据</p>
            </article>
          </div>
        </div>
      </section>

      <section className="limits shell">
        <div className="limit-title">
          <span className="section-no">06 / 别这样误读</span>
          <h2>预测 ≠ 预言</h2>
        </div>
        <div className="limit-list">
          <article><b>01</b><p>地图表示相对基准期的储量变化，不是地下水埋深。</p></article>
          <article><b>02</b><p>开采强度、管理政策和社会经济指标尚未直接作为输入。</p></article>
          <article><b>03</b><p>三种情景用于比较趋势，不代表未来一定按其中一种发生。</p></article>
        </div>
      </section>

      <section className="takeaway">
        <p>一句话带走</p>
        <h2>未来总体<em>缓解，</em><br />但恢复并不<em>自动发生。</em></h2>
        <span>越高排放，恢复越弱，南北差异越明显。</span>
      </section>

      <footer className="shell" id="source">
        <p>内容依据：张瑞、成思远、李小娟，2026，《地球信息科学学报》28(7): 1909—1925。</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
