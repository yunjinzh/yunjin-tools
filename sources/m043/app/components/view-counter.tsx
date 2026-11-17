"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ViewCounter() {
  const pathname = usePathname();
  const countedPath = useRef<string | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!pathname || countedPath.current === pathname) return;
    countedPath.current = pathname;
    setViews(null);
    setUnavailable(false);

    const controller = new AbortController();
    fetch("/api/stats", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) throw new Error("counter unavailable");
        return response.json() as Promise<{ views: number }>;
      })
      .then((data) => setViews(data.views))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setUnavailable(true);
      });

    return () => controller.abort();
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <div className="view-counter" aria-live="polite">
      <span>{isHome ? "网站访问量" : "本页阅读量"}</span>
      <strong>
        {unavailable ? "—" : views === null ? "···" : views.toLocaleString("zh-CN")}
      </strong>
      <small>{isHome ? "TOTAL VISITS" : "PAGE READS"}</small>
    </div>
  );
}
