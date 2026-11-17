/// <reference lib="webworker" />

import { inspectPbf, parsePbf } from "../lib/pbf-parser";
import type { WorkerRequest, WorkerResponse } from "../lib/types";

const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  const send = (message: WorkerResponse) => worker.postMessage(message);
  try {
    if (request.action === "inspect") {
      const header = await inspectPbf(request.file);
      send({ type: "header", requestId: request.requestId, header });
      return;
    }
    const result = await parsePbf(request.file, request.selection, (progress, stage) => {
      send({ type: "progress", requestId: request.requestId, progress, stage });
    });
    send({ type: "result", requestId: request.requestId, result });
  } catch (error) {
    send({
      type: "error",
      requestId: request.requestId,
      error: error instanceof Error ? error.message : "PBF 解析失败。",
    });
  }
};

export {};
