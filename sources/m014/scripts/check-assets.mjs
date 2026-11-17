import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "../dist");
const assets = join(root, "assets");
const checks = [];
for (const name of readdirSync(assets)) {
  const file = join(assets, name);
  if (!statSync(file).isFile()) continue;
  if (name.endsWith(".js")) {
    const content = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    for (const match of content.matchAll(
      /(?:from\s*|import\s*)['"]([^'"]+)['"]/g,
    )) {
      const ref = match[1];
      assert.ok(ref.startsWith("."), "unexpected external module " + ref);
      assert.ok(
        existsSync(resolve(dirname(file), ref)),
        `missing module ${name} -> ${ref}`,
      );
      checks.push(ref);
    }
  }
  if (name.endsWith(".css")) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
      assert.ok(
        existsSync(resolve(dirname(file), match[1])),
        "missing CSS asset " + match[1],
      );
      checks.push(match[1]);
    }
  }
}
const html = readFileSync(join(root, "index.html"), "utf8");
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))
  assert.ok(
    existsSync(resolve(root, match[1])),
    "missing HTML asset " + match[1],
  );
assert.ok(statSync(join(assets, "ev-training-prd.pdf")).size > 10000);
assert.ok(statSync(join(assets, "ev-sans.woff")).size > 10000);
assert.ok(statSync(join(assets, "ev-serif.woff")).size > 10000);
assert.ok(existsSync(resolve(root, "../.openai/hosting.json")));
console.log(
  JSON.stringify({
    moduleAndStyleReferences: checks.length,
    staticFiles: readdirSync(assets).length,
    externalRuntimeCDN: false,
    result: "passed",
  }),
);
