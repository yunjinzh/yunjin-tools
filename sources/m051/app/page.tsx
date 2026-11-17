"use client";

import { useMemo, useState } from "react";

const shifts = [
  { old: "会做东西", next: "知道做什么", note: "执行越来越便宜，判断越来越值钱。" },
  { old: "卖一套软件", next: "交付一个结果", note: "客户买的不是按钮，是省下的人力。" },
  { old: "团队越大越强", next: "小团队 + Agent", note: "少数人也能指挥一整条工作流。" },
  { old: "功能就是优势", next: "信任才是优势", note: "功能容易复制，关系和口碑复制不了。" },
  { old: "想清楚再开始", next: "小步试、快速改", note: "先让真实客户告诉你答案。" },
];

const examples = ["回复客户", "整理资料", "制作报价", "写周报"];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [activeShift, setActiveShift] = useState(0);
  const [task, setTask] = useState("回复客户");
  const [showPlan, setShowPlan] = useState(false);

  const shortTask = useMemo(() => task.trim() || "这件重复工作", [task]);

  const selectExample = (value: string) => {
    setTask(value);
    setShowPlan(false);
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回顶部">
          <span>AGENT</span>
          <i>生意新地图</i>
        </a>
        <a className="source-pill" href="#takeaway">100 条 → 1 张图</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">给完全不懂 AI 的人</p>
          <h1>不是多了一个工具，<br /><em>而是多了一支队伍。</em></h1>
          <p className="hero-lede">Agent，就是能接目标、会用工具、把流程跑完的数字员工。</p>
          <a className="primary-link" href="#understand">
            30 秒看懂 <ArrowIcon />
          </a>
        </div>

        <figure className="hero-visual">
          <img src="/agent-business-hero.png" alt="一位创业者正在指挥多个数字协作者完成不同工作" />
          <figcaption>
            <span><b>人</b> 定方向</span>
            <span><b>Agent</b> 跑流程</span>
            <span><b>人</b> 做验收</span>
          </figcaption>
        </figure>
      </section>

      <section className="understand section-shell" id="understand">
        <div className="section-heading">
          <p className="section-no">01</p>
          <h2>最重要的变化</h2>
          <p>过去买工具，自己干活。<br />现在交目标，验收结果。</p>
        </div>

        <div className="three-scene" aria-label="过去、现在和人的新价值">
          <article className="scene scene-old">
            <span>过去</span>
            <strong>软件</strong>
            <p>给你一把锤子</p>
          </article>
          <div className="scene-arrow"><ArrowIcon /></div>
          <article className="scene scene-now">
            <span>现在</span>
            <strong>Agent</strong>
            <p>直接帮你钉好</p>
          </article>
          <div className="scene-arrow"><ArrowIcon /></div>
          <article className="scene scene-you">
            <span>人的价值</span>
            <strong>判断</strong>
            <p>决定钉在哪里</p>
          </article>
        </div>
      </section>

      <section className="shifts section-shell">
        <div className="section-heading compact">
          <p className="section-no">02</p>
          <h2>五个认知翻转</h2>
          <p>点一下，看新旧地图的差别。</p>
        </div>

        <div className="shift-board">
          <div className="shift-tabs" role="tablist" aria-label="五个认知翻转">
            {shifts.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeShift === index}
                className={activeShift === index ? "active" : ""}
                key={item.old}
                onClick={() => setActiveShift(index)}
              >
                <span>0{index + 1}</span>
                {item.next}
              </button>
            ))}
          </div>

          <div className="shift-result" role="tabpanel" aria-live="polite">
            <div className="old-map">
              <span>旧常识</span>
              <strong>{shifts[activeShift].old}</strong>
            </div>
            <div className="flip-arrow"><ArrowIcon /></div>
            <div className="new-map">
              <span>新常识</span>
              <strong>{shifts[activeShift].next}</strong>
            </div>
            <p>{shifts[activeShift].note}</p>
          </div>
        </div>
      </section>

      <section className="workflow section-shell">
        <div className="section-heading compact">
          <p className="section-no">03</p>
          <h2>普通人怎么开始</h2>
          <p>别先做大项目，先交出一件重复小事。</p>
        </div>

        <ol className="flow-list">
          <li><span>1</span><strong>挑一件重复工作</strong></li>
          <li><span>2</span><strong>写清“合格结果”</strong></li>
          <li><span>3</span><strong>让 Agent 跑流程</strong></li>
          <li><span>4</span><strong>人检查关键风险</strong></li>
        </ol>

        <div className="try-card">
          <div className="try-copy">
            <span className="micro-label">现在试一下</span>
            <h3>你想先交出哪件小事？</h3>
            <div className="quick-picks" aria-label="常见任务示例">
              {examples.map((item) => (
                <button
                  type="button"
                  className={task === item ? "selected" : ""}
                  key={item}
                  onClick={() => selectExample(item)}
                >{item}</button>
              ))}
            </div>
          </div>

          <div className="task-input-wrap">
            <label htmlFor="first-task">我的第一件任务</label>
            <div className="task-input-row">
              <input
                id="first-task"
                value={task}
                onChange={(event) => {
                  setTask(event.target.value);
                  setShowPlan(false);
                }}
                placeholder="例如：整理客户反馈"
              />
              <button type="button" onClick={() => setShowPlan(true)}>
                生成小实验 <ArrowIcon />
              </button>
            </div>

            {showPlan && (
              <div className="mini-plan" aria-live="polite">
                <p><CheckIcon />把“{shortTask}”的资料集中到一个地方</p>
                <p><CheckIcon />让 Agent 先做 80% 的初稿</p>
                <p><CheckIcon />由你核查数字、承诺与最终质量</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="moat section-shell">
        <div className="section-heading compact light">
          <p className="section-no">04</p>
          <h2>真正带不走的东西</h2>
          <p>功能容易被抄，下面五样很难。</p>
        </div>
        <div className="moat-list">
          <span>触达</span>
          <span>信任</span>
          <span>网络</span>
          <span>独占数据</span>
          <span>工作流</span>
        </div>
      </section>

      <section className="guardrails section-shell">
        <div className="guardrail-title">
          <span>安全提醒</span>
          <h2>Agent 很能干，<br />但不能放任不管。</h2>
        </div>
        <div className="guardrail-grid">
          <article><b>01</b><strong>会出错</strong><p>重要结果必须验收</p></article>
          <article><b>02</b><strong>会花钱</strong><p>设置用量和重试上限</p></article>
          <article><b>03</b><strong>会越权</strong><p>危险动作人工确认</p></article>
        </div>
      </section>

      <section className="takeaway" id="takeaway">
        <p>一句话带走</p>
        <h2>Agent 改变的是<br /><em>怎么做，</em><br />没有改变<em>做什么。</em></h2>
        <div className="takeaway-note">
          <span>为人创造价值</span>
          <i>→</i>
          <span>收合理的钱</span>
        </div>
      </section>

      <footer>
        <span>内容提炼自《Agent 时代做生意的 100 条反常识》</span>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
