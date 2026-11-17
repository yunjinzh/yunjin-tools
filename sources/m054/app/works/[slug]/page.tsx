/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkBySlug, works } from "../../generated/works";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(decodeURIComponent(slug));
  if (!work) return { title: "作品未找到｜云金作品集" };
  return {
    title: `${work.title}｜云金作品集`,
    description: work.summary,
  };
}

function FilePreview({ url, kind, title }: { url: string; kind: string | null; title: string }) {
  if (kind === "image") return <img className="detail-media" src={url} alt={`${title} 预览`} />;
  if (kind === "video") return <video className="detail-media" src={url} controls preload="metadata" />;
  if (kind === "web") return <iframe className="detail-frame" src={url} title={`${title} 交互预览`} loading="lazy" />;
  if (kind === "pdf") return <object className="detail-frame" data={url} type="application/pdf"><a href={url}>打开 PDF 文件</a></object>;
  return null;
}

export default async function WorkDetail({ params }: PageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(decodeURIComponent(slug));
  if (!work) notFound();

  const currentIndex = works.findIndex((item) => item.slug === work.slug);
  const nextWork = works[(currentIndex + 1) % works.length];

  return (
    <main className="detail-page">
      <header className="site-header detail-header">
        <a className="brand" href="/" aria-label="返回作品集首页">
          <span>YJ</span>
          <span className="brand-copy">SPACE · PRODUCT<br />PORTFOLIO</span>
        </a>
        <nav aria-label="作品导航">
          <a href="/#works">全部作品</a>
          <a href="/#experience">经历</a>
          <a href="/#about">关于</a>
        </nav>
        <a className="header-contact" href="/#works">返回作品集 <span>↙</span></a>
      </header>

      <section className="detail-hero">
        <div className="detail-kicker">
          <span>{String(currentIndex + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}</span>
          <span>{work.category}</span>
          <span>{work.year}</span>
        </div>
        <h1>{work.title}</h1>
        <div className="detail-intro">
          <p>{work.summary}</p>
          <div className="tag-list" aria-label="项目标签">
            {work.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </section>

      <section className={`detail-visual ${work.tone}`}>
        {work.cover ? (
          <img src={work.cover} alt={`${work.title} 封面`} />
        ) : (
          <div className="detail-art" aria-hidden="true">
            <span className="detail-art-label">PROJECT / {String(currentIndex + 1).padStart(2, "0")}</span>
            <i /><i /><i />
            <strong>{work.title.slice(0, 2)}</strong>
            <small>DATA · SPACE · SYSTEM · DECISION</small>
          </div>
        )}
      </section>

      <section className="detail-overview">
        <div className="overview-meta">
          <p className="section-no">PROJECT OVERVIEW</p>
          <dl>
            <div><dt>年份</dt><dd>{work.year}</dd></div>
            <div><dt>角色</dt><dd>{work.role}</dd></div>
            {work.client && <div><dt>领域</dt><dd>{work.client}</dd></div>}
            <div><dt>文件</dt><dd>{work.attachments.length ? `${work.attachments.length} 项` : "项目说明"}</dd></div>
          </dl>
        </div>
        <div className="overview-copy">
          <p className="detail-lead">{work.description}</p>
          {work.sections.map((section, index) => (
            <article className="detail-section" key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {work.metrics.length > 0 && (
        <section className="detail-metrics" aria-label="项目数据">
          {work.metrics.map((metric) => (
            <div key={`${metric.value}-${metric.label}`}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>
      )}

      {work.primaryUrl && work.primaryKind && ["image", "video", "web", "pdf"].includes(work.primaryKind) && (
        <section className="detail-preview-section">
          <div className="preview-heading">
            <p className="section-no">LIVE PREVIEW</p>
            <h2>作品预览</h2>
          </div>
          <FilePreview url={work.primaryUrl} kind={work.primaryKind} title={work.title} />
        </section>
      )}

      {work.attachments.length > 0 && (
        <section className="attachments-section">
          <div>
            <p className="section-no">PROJECT FILES</p>
            <h2>项目文件</h2>
          </div>
          <div className="attachment-list">
            {work.attachments.map((asset, index) => (
              <a href={asset.url} target="_blank" rel="noreferrer" key={asset.url}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{asset.name}</strong>
                <small>{asset.extension} · {asset.sizeLabel}</small>
                <i>↗</i>
              </a>
            ))}
          </div>
        </section>
      )}

      <a className={`next-work ${nextWork.tone}`} href={`/works/${encodeURIComponent(nextWork.slug)}`}>
        <span>NEXT PROJECT</span>
        <strong>{nextWork.title}</strong>
        <i>→</i>
      </a>

      <footer className="detail-footer">
        <span>YUNJIN · PORTFOLIO</span>
        <span>© 2026 — SPATIAL / DIGITAL TWIN</span>
        <a href="/">HOME ↑</a>
      </footer>
    </main>
  );
}
