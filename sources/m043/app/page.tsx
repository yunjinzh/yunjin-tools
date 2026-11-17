import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Code2,
  Database,
  Layers3,
  ServerCog,
} from "lucide-react";
import { modules } from "./course-data";

const pathSteps = [
  { no: "01", title: "理解", copy: "概念 · 架构 · ACP / 3DT", icon: Boxes },
  { no: "02", title: "处理", copy: "多源数据 → 3DT", icon: Database },
  { no: "03", title: "组景", copy: "图层 · 环境 · 分析", icon: Layers3 },
  { no: "04", title: "发布", copy: "Cloud · 节点 · 实例", icon: ServerCog },
  { no: "05", title: "开发", copy: "SDK · API · 业务闭环", icon: Code2 },
];

const audiences = [
  {
    number: "A",
    title: "GIS / 三维数据工程师",
    copy: "重点学习 Engine、坐标基线、数据发布与质量检查，把不同来源的数据稳定变成 3DT。",
    route: "建议从 02 数据生产开始",
  },
  {
    number: "B",
    title: "数字孪生方案与实施人员",
    copy: "沿主线完整学习产品矩阵、Explorer 组景、Cloud 发布与交付验收。",
    route: "建议从 01 认知基座开始",
  },
  {
    number: "C",
    title: "Web 前端 / 二次开发者",
    copy: "先理解 ACP、3DT 与云渲染，再进入 WebUI、WebSocket、异步调用和业务 API。",
    route: "建议先学 01，再进入 05 SDK",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <div className="hero-aside">
          <span className="section-label">DIGITAL TWIN / 2026</span>
          <p>依据 DTS 白皮书、Engine、Explorer、Cloud 与 SDK 五份资料，重构为一条可实操的学习路线。</p>
          <div className="coordinate-note">
            <span>X 116.4074</span>
            <span>Y 039.9042</span>
            <span>Z +128.00</span>
          </div>
        </div>

        <div className="hero-title">
          <span className="hero-overline">从数据到场景，从场景到应用</span>
          <h1>
            <span>学会</span>
            <strong>数字孪生</strong>
          </h1>
          <div className="hero-subrow">
            <div className="axis-symbol" aria-hidden="true">
              <i />
              <b>XYZ</b>
            </div>
            <p>不是把 2,023 页手册从头读完，而是沿着真实项目的生产链路，完成第一个可交付的孪生闭环。</p>
          </div>
        </div>

        <div className="hero-actions">
          <Link className="button-primary" href="/learn/digital-twin-not-a-dashboard">
            从第一课开始 <ArrowUpRight size={20} />
          </Link>
          <Link className="button-text" href="/learn">
            浏览全部课程 <ArrowDownRight size={18} />
          </Link>
        </div>
      </section>

      <section className="metric-band" aria-label="课程规模">
        <div><strong>06</strong><span>学习阶段<br />STAGES</span></div>
        <div><strong>35</strong><span>实战课程<br />LESSONS</span></div>
        <div><strong>2,023</strong><span>资料页数<br />SOURCE PAGES</span></div>
        <div><strong>01</strong><span>完整闭环<br />CAPSTONE</span></div>
      </section>

      <section className="section-shell path-section">
        <header className="split-heading">
          <div>
            <span className="section-label">LEARNING PATH</span>
            <h2>一条路<br />学到底</h2>
          </div>
          <p>学习顺序严格对应真实交付链：先统一空间与数据，再生产 3DT、搭建 ACP、发布云服务，最后接入业务系统。</p>
        </header>

        <div className="path-grid">
          {pathSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="path-card" key={step.no}>
                <span>{step.no}</span>
                <Icon size={28} strokeWidth={1.5} />
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell audience-section">
        <header className="split-heading reverse">
          <p>不同角色不必从同一页开始，但最终都要看懂数据、场景、服务与应用之间的依赖关系。</p>
          <div>
            <span className="section-label">FOR WHOM</span>
            <h2>找到你的<br />起跑线</h2>
          </div>
        </header>
        <div className="audience-grid">
          {audiences.map((audience) => (
            <article className="audience-card" key={audience.number}>
              <span className="audience-number">{audience.number}</span>
              <h3>{audience.title}</h3>
              <p>{audience.copy}</p>
              <small>{audience.route}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell home-curriculum">
        <header className="split-heading">
          <div>
            <span className="section-label">CURRICULUM</span>
            <h2>从入门<br />到精通</h2>
          </div>
          <div className="curriculum-intro">
            <p>每节课只解决一个明确问题，提供核心笔记、实操任务和对应资料页码。</p>
            <Link href="/learn">进入完整课程表 <ArrowUpRight size={17} /></Link>
          </div>
        </header>

        <div className="module-preview-grid">
          {modules.map((module) => (
            <Link className="module-preview" href={`/learn#module-${module.id}`} key={module.id}>
              <span>{module.id}</span>
              <small>{module.english}</small>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div>
                <b>{String(module.lessons.length).padStart(2, "0")}</b>
                <em>LESSONS</em>
                <ArrowUpRight size={19} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <span className="section-label">START NOW</span>
        <h2>打开第一份数据，<br />做出第一个闭环。</h2>
        <Link className="button-primary dark" href="/learn/digital-twin-not-a-dashboard">
          开始学习 <ArrowUpRight size={20} />
        </Link>
      </section>
    </main>
  );
}
