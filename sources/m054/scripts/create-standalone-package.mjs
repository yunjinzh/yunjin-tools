import { access, chmod, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (!output) {
  console.error("请提供输出目录。");
  process.exit(1);
}

try {
  await access(output);
  console.error(`输出目录已经存在：${output}`);
  process.exit(1);
} catch {
  // A fresh destination is required.
}

await mkdir(output, { recursive: true });
await cp(path.join(projectRoot, "standalone"), output, { recursive: true });
await cp(path.join(projectRoot, "public", "works"), path.join(output, "作品文件"), { recursive: true });
await mkdir(path.join(output, "site", "fonts"), { recursive: true });
await cp(path.join(projectRoot, "public", "fonts"), path.join(output, "site", "fonts"), { recursive: true });

const css = await readFile(path.join(projectRoot, "app", "globals.css"), "utf8");
await writeFile(path.join(output, "site.css"), css, "utf8");
await writeFile(path.join(output, "版本信息.txt"), "云金个人作品网站独立部署版\n版本：1.0.0\n生成日期：2026-08-16\n", "utf8");

try {
  await cp(path.join(projectRoot, "public", "favicon.svg"), path.join(output, "site", "favicon.svg"));
} catch {
  // Favicon is optional.
}

await chmod(path.join(output, "start.sh"), 0o755);
await chmod(path.join(output, "rebuild.sh"), 0o755);

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(output, "build-site.mjs")], { cwd: output, stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`静态网站生成失败，退出码 ${code}`)));
});

console.log(`独立部署包已生成：${output}`);
