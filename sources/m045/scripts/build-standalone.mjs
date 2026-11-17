import { build } from "esbuild"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { promisify } from "node:util"
import { execFile } from "node:child_process"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const execFileAsync = promisify(execFile)
const work = await mkdtemp(resolve(tmpdir(), "math-offline-"))
const pagePrefix = resolve(work, "page")
const lightweightPdf = resolve(work, "textbook.pdf")

await execFileAsync("pdftoppm", [
  "-jpeg", "-r", "95", "-jpegopt", "quality=68,optimize=y,progressive=y",
  resolve(root, "public/textbook.pdf"), pagePrefix,
])
await execFileAsync("python3", [
  resolve(root, "scripts/make-offline-pdf.py"), work, lightweightPdf,
])

const pdf = await readFile(lightweightPdf)
const css = await readFile(resolve(root, "standalone/style.css"), "utf8")

const result = await build({
  entryPoints: [resolve(root, "standalone/app.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  define: {
    __PDF_BASE64__: JSON.stringify(pdf.toString("base64")),
  },
})

const script = result.outputFiles[0].text.replaceAll("</script", "<\\/script")
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="四年级数学上册全册自主学习平台离线版">
  <title>四年级数学AI自主学习平台 · 离线版</title>
  <style>${css}</style>
</head>
<body>
  <div id="root"></div>
  <script>${script}</script>
</body>
</html>`

await writeFile(resolve(root, "public/四年级数学AI自主学习平台.html"), html)
await rm(work, { recursive: true, force: true })
console.log(`standalone: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB`)
