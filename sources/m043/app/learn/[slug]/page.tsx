import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { LessonProgressButton } from "../../components/lesson-progress-button";
import { allLessons, getAdjacentLessons, getLesson } from "../../course-data";
import { getLessonPresentation } from "../../lesson-presentation";

type LessonPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "课程未找到" };
  return {
    title: `${lesson.id} ${lesson.title}｜DTS 数字孪生学习门户`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const adjacent = getAdjacentLessons(slug);
  const presentation = getLessonPresentation(lesson);

  return (
    <main className="lesson-page">
      <nav className="lesson-breadcrumb" aria-label="课程位置">
        <Link href="/learn">全部课程</Link>
        <span>/</span>
        <a href={`/learn#module-${lesson.module.id}`}>{lesson.module.title}</a>
        <span>/</span>
        <strong>{lesson.id}</strong>
      </nav>

      <article className={`lesson-article mode-${presentation.mode}`}>
        <header className="lesson-hero">
          <div className="lesson-module-stamp">
            <span>{lesson.module.id}</span>
            <small>{lesson.module.english}</small>
            <b><em>LESSON</em>{lesson.id}</b>
          </div>
          <div className="lesson-title-wrap">
            <span className="section-label">{lesson.eyebrow}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="lesson-meta">
              <span><Clock3 size={17} /> {lesson.duration}</span>
              <span><BookOpen size={17} /> {lesson.level}</span>
              <span>{lesson.id}</span>
            </div>
          </div>
        </header>

        <div className="lesson-content-grid">
          <aside className="lesson-aside">
            <span className="section-label">YOU WILL LEARN</span>
            <ol>
              {lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ol>
            <div className="source-card">
              <small>资料依据</small>
              <strong>{lesson.source}</strong>
              <span>{lesson.sourcePage}</span>
            </div>
          </aside>

          <div className="lesson-body">
            <header className="content-intro">
              <span className="section-label">{presentation.notesEyebrow}</span>
              <h2>{presentation.notes}</h2>
              <p>{presentation.notesIntro}</p>
            </header>
            <div className={`core-notes mode-${presentation.mode}`}>
              {lesson.core.map((note, index) => (
                <section key={note.title}>
                  <span>0{index + 1}</span>
                  <h3>{note.title}</h3>
                  <p>{note.body}</p>
                </section>
              ))}
            </div>

            <section className={`walkthrough-section mode-${presentation.mode}`}>
              <header>
                <span className="section-label">{presentation.guideEyebrow}</span>
                <h2>{presentation.guide}</h2>
                <p>{presentation.guideIntro}</p>
              </header>
              <div className="walkthrough-steps">
                {presentation.steps.map((step) => (
                  <article key={step.number}>
                    <div className="step-rail">
                      <span>{step.number}</span>
                      <small>{step.kicker}</small>
                    </div>
                    <div className="step-copy">
                      <h3>{step.title}</h3>
                      <p>{step.detail}</p>
                      <strong>{step.check}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="exercise-block">
              <header>
                <span className="section-label">YOUR TURN</span>
                <h2>讲解结束，现在轮到你练习</h2>
              </header>
              <div className="exercise-prompt">
                <small>本课任务</small>
                <p>{lesson.practice}</p>
              </div>
              <div className="exercise-delivery">
                <div>
                  <small>你需要提交</small>
                  <p>{presentation.expected}</p>
                </div>
                <div>
                  <small>完成前自检</small>
                  <ul>
                    {presentation.checks.map((check) => <li key={check}>{check}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <div className="lesson-complete">
              <div>
                <strong>完成实操后，再标记本课。</strong>
                <span>学习进度保存在当前浏览器。</span>
              </div>
              <LessonProgressButton slug={lesson.slug} />
            </div>
          </div>
        </div>

        <nav className="lesson-pagination" aria-label="上一课和下一课">
          {adjacent.previous ? (
            <Link href={`/learn/${adjacent.previous.slug}`}>
              <ArrowLeft size={22} />
              <span><small>上一课 {adjacent.previous.id}</small><strong>{adjacent.previous.title}</strong></span>
            </Link>
          ) : <div />}
          {adjacent.next ? (
            <Link className="next" href={`/learn/${adjacent.next.slug}`}>
              <span><small>下一课 {adjacent.next.id}</small><strong>{adjacent.next.title}</strong></span>
              <ArrowRight size={22} />
            </Link>
          ) : (
            <Link className="next" href="/learn">
              <span><small>课程完成</small><strong>返回全部课程</strong></span>
              <ArrowRight size={22} />
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
