import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({ entryPoints: ["tests/core.test.ts"], outfile: ".sites-runtime/core.test.mjs", bundle: true, platform: "node", format: "esm" });
const result = spawnSync(process.execPath, ["--test", ".sites-runtime/core.test.mjs"], { stdio: "inherit" });
process.exit(result.status ?? 1);
