"use client";

import { Check, Circle } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dts-learned-lessons";

function readLearned() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function LessonProgressButton({ slug }: { slug: string }) {
  const [learned, setLearned] = useState(false);

  useEffect(() => {
    setLearned(readLearned().has(slug));
  }, [slug]);

  function toggleLearned() {
    const lessons = readLearned();
    if (lessons.has(slug)) lessons.delete(slug);
    else lessons.add(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...lessons]));
    setLearned(lessons.has(slug));
    window.dispatchEvent(new Event("dts-progress-updated"));
  }

  return (
    <button
      className={`learn-button ${learned ? "is-learned" : ""}`}
      type="button"
      onClick={toggleLearned}
      aria-pressed={learned}
    >
      {learned ? <Check size={18} /> : <Circle size={18} />}
      {learned ? "已学会 · 点击撤销" : "学会了！记录本机进度"}
    </button>
  );
}
