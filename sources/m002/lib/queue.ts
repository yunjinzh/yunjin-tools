import { generationBody, type Job, type Settings } from "./image-types";
import { ClientError } from "./client-api";
type Requester = (action: string, data: unknown) => Promise<any>;
export class ImageQueue {
  jobs: Job[];
  active = new Set<string>();
  enabled = false;
  disposed = false;
  cooldownUntil = 0;
  constructor(jobs: Job[], private request: Requester, private change: (jobs: Job[]) => void, private pollMs = 5000, private sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))) { this.jobs = jobs; }
  emit() { this.change([...this.jobs]); }
  update(id: string, patch: Partial<Job>) { this.jobs = this.jobs.map(j => j.id === id ? { ...j, ...patch } : j); this.emit(); }
  add(prompts: string[], settings: Settings) {
    const batchId = crypto.randomUUID(), createdAt = Date.now();
    const additions = prompts.flatMap(prompt => Array.from({ length: settings.copies }, () => ({ id: crypto.randomUUID(), batchId, prompt, settings: { ...settings }, status: "queued" as const, createdAt, sequence: 0 })));
    additions.forEach((j, i) => j.sequence = i + 1);
    this.jobs = [...additions, ...this.jobs]; this.enabled = true; this.emit(); this.pump(); return batchId;
  }
  pause() { this.enabled = false; this.jobs = this.jobs.map(j => j.status === "queued" ? { ...j, status: "paused" } : j); this.emit(); }
  resume() {
    if (Date.now() < this.cooldownUntil) throw new Error(`接口正在限流，请在 ${Math.ceil((this.cooldownUntil - Date.now()) / 1000)} 秒后继续。`);
    this.jobs = this.jobs.map(j => j.status === "paused" ? { ...j, status: "queued", error: undefined } : j); this.enabled = true; this.emit(); this.pump();
  }
  retry(id: string) {
    if (Date.now() < this.cooldownUntil) throw new Error(`接口正在限流，请在 ${Math.ceil((this.cooldownUntil - Date.now()) / 1000)} 秒后重试。`);
    const job = this.jobs.find(j => j.id === id); if (!job || job.status !== "failed") return;
    this.update(id, { status: "queued", taskId: undefined, images: undefined, error: undefined }); this.enabled = true; this.pump();
  }
  import(job: Job) {
    if (this.jobs.some(j => j.taskId === job.taskId)) return;
    this.jobs = [job, ...this.jobs]; this.emit();
  }
  clearCompleted() { this.jobs = this.jobs.filter(j => !["success", "failed"].includes(j.status)); this.emit(); }
  pump() {
    if (!this.enabled || this.disposed) return;
    for (const job of this.jobs.filter(j => j.status === "queued")) {
      if (this.active.size >= job.settings.concurrency) break;
      if (!this.active.has(job.id)) { this.active.add(job.id); void this.run(job); }
    }
  }
  async run(job: Job) {
    let taskId = job.taskId;
    try {
      if (!taskId) {
        this.update(job.id, { status: "submitting" });
        const result = await this.request("create", generationBody(job.prompt, job.settings));
        if (typeof result.taskId !== "string" || !result.taskId) throw new ClientError("未收到任务编号，请查看云端任务。", 502, true);
        taskId = result.taskId;
        this.update(job.id, { taskId, status: "generating", error: undefined });
      } else this.update(job.id, { status: "generating", error: undefined });
      const started = Date.now(); let failures = 0;
      while (!this.disposed && Date.now() - started < 20 * 60 * 1000) {
        await this.sleep(this.pollMs);
        if (this.disposed) return;
        try {
          const result = await this.request("task", { taskId }); failures = 0;
          if (result.status === "success") {
            if (!Array.isArray(result.images) || !result.images.length) throw new ClientError("任务已完成但图片列表为空，请重新查询。", 502);
            this.update(job.id, { status: "success", images: result.images, error: undefined }); return;
          }
          if (result.status === "fail") { this.update(job.id, { status: "failed", error: result.failMsg || "生成失败，可以手动重试。" }); return; }
          if (!["pending", "generating"].includes(result.status)) throw new ClientError("任务状态暂时无法识别。", 502);
        } catch (error) {
          const err = error as ClientError; failures++;
          if ([401, 403].includes(err.status) || failures >= 5) throw error;
          this.update(job.id, { error: `查询暂时失败，正在重连（${failures}/5）。` });
          await this.sleep(Math.max(err.retryAfter * 1000 || 0, Math.min(30000, failures * 3000)));
        }
      }
      if (!this.disposed) this.update(job.id, { status: "paused", error: "查询已超过 20 分钟，任务仍保留在云端。点击继续队列可重新查询，不会重复生成。" });
    } catch (error) {
      const err = error as ClientError;
      this.update(job.id, { taskId, status: taskId ? "paused" : err.uncertain ? "unknown" : "failed", error: err.message });
      if (err.uncertain || [401, 403, 429].includes(err.status)) {
        this.cooldownUntil = Date.now() + (err.retryAfter || (err.status === 429 ? 30 : 0)) * 1000;
        this.pause();
      }
    } finally { this.active.delete(job.id); if (!this.disposed) this.pump(); }
  }
}
