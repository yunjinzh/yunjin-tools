export const MODELS = [
  { id: "gpt-image-2", name: "GPT-Image-2", detail: "通用创作 · 按尺寸计价" },
  { id: "gpt-image-2.5-flare", name: "GPT-Image-2.5 Flare", detail: "Flare 视觉风格" },
  { id: "gpt-image-2.5-sunburst", name: "GPT-Image-2.5 Sunburst", detail: "Sunburst 视觉风格" },
  { id: "gpt-image-2-official", name: "GPT-Image-2 Pro", detail: "可调质量 · 按 token 预估" },
] as const;
export const RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];
export type Settings = { model: string; size: string; ratio: string; quality: string; copies: number; concurrency: number };
export type ImageResult = { url: string; mimeType?: string };
export type JobStatus = "queued" | "submitting" | "generating" | "success" | "failed" | "unknown" | "paused";
export type Job = { id: string; batchId: string; prompt: string; settings: Settings; status: JobStatus; taskId?: string; images?: ImageResult[]; error?: string; createdAt: number; sequence: number };
export const DEFAULT_SETTINGS: Settings = { model: "gpt-image-2", size: "2K", ratio: "1:1", quality: "medium", copies: 1, concurrency: 2 };
export function splitPrompts(text: string, mode: "lines" | "blocks"): string[] {
  return text.split(mode === "lines" ? /\r?\n/ : /\r?\n\s*---\s*\r?\n/).map(s => s.trim()).filter(Boolean);
}
export function generationBody(prompt: string, s: Settings) {
  return { provider: "openai", model: s.model, prompt, imageConfig: { imageSize: s.size, aspectRatio: s.ratio, ...(s.model === "gpt-image-2-official" ? { quality: s.quality } : {}) } };
}
export function restoreJobs(jobs: Job[]): Job[] {
  return jobs.map(job => ({ ...job, status: job.status === "submitting" ? "unknown" : ["generating", "queued"].includes(job.status) ? "paused" : job.status,
    ...(job.status === "submitting" ? { error: "上次提交被中断，是否已创建任务尚不确定。请先查看云端任务，避免重复扣费。" } : {}),
  }));
}
