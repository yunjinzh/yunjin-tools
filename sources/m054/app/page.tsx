/* eslint-disable @next/next/no-img-element */
import { works } from "./generated/works";

const featuredWorks = works.filter((work) => work.featured);

const experience = [
  {
    period: "2007 — 2010",
    role: "三维数据工程",
    detail: "参与 4D 数据生产与 Skyline 三维场景建设，支撑西气东输二线选址分析。",
  },
  {
    period: "2010 — 2015",
    role: "三维 GIS 产品设计",
    detail: "负责 CityMaker Builder 多版本产品设计，让规划与交通空间数据更顺畅地进入三维场景。",
  },
  {
    period: "2015 — 至今",
    role: "空间信息与数字孪生",
    detail: "持续探索时空数据治理、空间智能、行业数字孪生与产教融合产品的落地方式。",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <span>YJ</span>
          <span className="brand-copy">SPACE · PRODUCT<br />PORTFOLIO</span>
        </a>
        <nav aria-label="主导航">
          <a href="#works">作品</a>
          <a href="#experience">经历</a>
          <a href="#about">关于</a>
        </nav>
        <a className="header-contact" href="#about">合作交流 <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> SPATIAL INTELLIGENCE · DIGITAL TWIN</p>
          <h1>把复杂空间，<br />变成<span>可理解</span>、<br />可行动的产品。</h1>
          <div className="hero-bottom">
            <p>
              云金，空间信息产品设计者。长期专注 GIS、数字孪生、
              三维可视化与产教融合，从多源数据治理一路走到真实场景中的产品落地。
            </p>
            <a className="round-link" href="#works" aria-label="浏览代表作品">↓</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-label label-top">106.71° E<br />26.58° N</div>
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-core"><span>空间</span><small>SPACE</small></div>
          <div className="visual-pin">●</div>
          <div className="visual-label label-bottom">DATA / MODEL / SCENE<br />SYSTEM / DECISION</div>
        </div>

        <div className="hero-stats">
          <div><strong>2007</strong><span>进入 GIS 行业</span></div>
          <div><strong>2,000<sup>+</sup></strong><span>公里三维场景经验</span></div>
          <div><strong>01—∞</strong><span>持续创造</span></div>
        </div>
      </section>

      <section className="works-section" id="works">
        <div className="section-heading">
          <div>
            <p className="section-no">01 / SELECTED WORKS</p>
            <h2>代表作品</h2>
          </div>
          <p>从一张地图、一个模型到一套真实运行的系统，作品最终要回答的都是同一个问题：它帮助谁做出了更好的决定？</p>
        </div>

        <div className="work-grid">
          {featuredWorks.map((work, index) => (
            <a
              className={`work-card ${work.tone} ${work.size}`}
              href={`/works/${encodeURIComponent(work.slug)}`}
              aria-label={`查看作品：${work.title}`}
              key={work.slug}
            >
              <div className="work-card-top">
                <span>{work.category}</span>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              {work.cover ? (
                <img className="work-cover" src={work.cover} alt="" />
              ) : (
                <div className="work-mark" aria-hidden="true"><i /><i /><i /></div>
              )}
              <div className="work-card-copy">
                <h3>{work.title}</h3>
                <p>{work.summary}</p>
              </div>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <p className="works-note"><span>●</span> 已从作品目录自动识别 {works.length} 项内容；新增文件后，卡片与详情页会同步生成。</p>
      </section>

      <section className="experience-section" id="experience">
        <div className="section-heading light">
          <div>
            <p className="section-no">02 / EXPERIENCE</p>
            <h2>经历不是履历，<br />是看问题的方式。</h2>
          </div>
          <p>跨越数据生产、三维 GIS 产品、时空大数据与数字孪生实践，我更关心不同技术如何在同一套业务逻辑中协同。</p>
        </div>

        <div className="timeline">
          {experience.map((item, index) => (
            <article key={item.period}>
              <span className="timeline-index">0{index + 1}</span>
              <p>{item.period}</p>
              <h3>{item.role}</h3>
              <div><span>{item.detail}</span><i>↗</i></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <p className="section-no">03 / ABOUT & CONTACT</p>
        <div className="about-grid">
          <h2>不止呈现空间，<br />更希望<span>连接现实。</span></h2>
          <div className="about-copy">
            <p>我相信好的空间产品不该停留在“看起来很真实”。它应当连接业务、组织数据、解释变化，并让复杂系统中的每个人更容易理解正在发生什么。</p>
            <p>目前重点关注：多源异构三维数据治理、数字孪生场景构建、空间智能产品，以及面向高校的产教融合实践。</p>
            <a href="#top">从一个具体问题开始聊聊 <span>↗</span></a>
          </div>
        </div>
        <footer>
          <span>YUNJIN · PORTFOLIO</span>
          <span>© 2026 — SPATIAL / DIGITAL TWIN</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </section>
    </main>
  );
}
