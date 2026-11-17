import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "site");
const port = Number.parseInt(process.env.PORT || "4173", 10);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif",
  ".woff2": "font/woff2", ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".zip": "application/zip", ".csv": "text/csv; charset=utf-8", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".obj": "text/plain; charset=utf-8", ".stl": "model/stl"
};

async function resolveFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  const candidate = path.resolve(root, `.${decoded}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;
  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return resolveExisting(path.join(candidate, "index.html"));
    if (info.isFile()) return { path: candidate, info };
  } catch { /* try clean URL fallback */ }
  if (!path.extname(candidate)) return resolveExisting(path.join(candidate, "index.html"));
  return null;
}

async function resolveExisting(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() ? { path: filePath, info } : null;
  } catch { return null; }
}

function sendFile(request, response, file, statusCode = 200) {
  const extension = path.extname(file.path).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const range = request.headers.range;
  const cacheControl = extension === ".html" ? "no-cache" : "public, max-age=3600";
  const baseHeaders = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  if (statusCode === 200 && range && /^(video|audio)\//.test(contentType)) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : file.info.size - 1;
      if (start <= end && end < file.info.size) {
        response.writeHead(206, { ...baseHeaders, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${file.info.size}`, "Content-Length": end - start + 1 });
        if (request.method === "HEAD") return response.end();
        return createReadStream(file.path, { start, end }).pipe(response);
      }
    }
  }

  response.writeHead(statusCode, { ...baseHeaders, "Content-Length": file.info.size });
  if (request.method === "HEAD") return response.end();
  createReadStream(file.path).pipe(response);
}

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    return response.end("Method Not Allowed");
  }
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const file = await resolveFile(url.pathname);
  if (file) return sendFile(request, response, file);
  const fallback = await resolveExisting(path.join(root, "404.html"));
  if (fallback) {
    return sendFile(request, response, fallback, 404);
  }
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("404 Not Found");
});

server.on("error", (error) => {
  console.error(`网站启动失败：${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`个人作品网站已启动：http://127.0.0.1:${port}`);
  console.log("按 Ctrl+C 可停止服务。");
});
