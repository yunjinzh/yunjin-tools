"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CourseModule } from "../course-data";

const STORAGE_KEY = "dts-learned-lessons";

function loadLearned() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function CurriculumClient({ modules }: { modules: CourseModule[] }) {
  const [query, setQuery] = useState("");
  const [learned, setLearned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => setLearned(loadLearned());
    update();
    window.addEventListener("dts-progress-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("dts-progress-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    if (!keyword) return modules;
    return modules
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter((lesson) =>
          [lesson.title, lesson.eyebrow, lesson.summary, lesson.source]
            .join(" ")
            .toLocaleLowerCase("zh-CN")
            .includes(keyword)
        ),
      }))
      .filter((module) => module.lessons.length > 0);
  }, [modules, query]);

  const total = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const progress = Math.round((learned.size / total) * 100);

  return (
    <>
      <section className="curriculum-tools" aria-label="课程搜索与学习进度">
        <label className="search-box">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">搜索知识点</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索课程、能力或资料来源…"
          />
          <kbd>{filtered.reduce((sum, module) => sum + module.lessons.length, 0)} RESULTS</kbd>
        </label>
        <div className="progress-card">
          <div>
            <span>本机学习进度</span>
            <strong>{learned.size} / {total}</strong>
          </div>
          <div className="progress-track" aria-label={`学习进度 ${progress}%`}>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <div className="curriculum-list">
        {filtered.map((module) => (
          <section className="module-block" id={`module-${module.id}`} key={module.id}>
            <header className="module-head">
              <div className="module-number">{module.id}</div>
              <div>
                <span className="section-label">{module.english}</span>
                <h2>{module.title}</h2>
              </div>
              <p>{module.description}</p>
            </header>

            <div className="lesson-rows">
              {module.lessons.map((lesson) => {
                const isLearned = learned.has(lesson.slug);
                return (
                  <Link
                    className={`lesson-row ${isLearned ? "is-learned" : ""}`}
                    href={`/learn/${lesson.slug}`}
                    key={lesson.slug}
                  >
                    <span className="lesson-id">{lesson.id}</span>
                    <span className="lesson-main">
                      <small>{lesson.eyebrow}</small>
                      <strong>{lesson.title}</strong>
                    </span>
                    <span className="lesson-level">{lesson.level}</span>
                    <span className="lesson-time"><Clock3 size={15} /> {lesson.duration}</span>
                    <span className="lesson-status" aria-label={isLearned ? "已学会" : "未学习"}>
                      {isLearned ? <CheckCircle2 size={21} /> : "↗"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span>NO MATCH</span>
          <h2>没有找到对应课程</h2>
          <p>换一个关键词，试试“坐标系”“倾斜摄影”“Cloud”或“标签”。</p>
          <button type="button" onClick={() => setQuery("")}>清空搜索</button>
        </div>
      )}
    </>
  );
}
