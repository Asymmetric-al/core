import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, expect, it } from "vitest";

const roots: string[] = [];
async function fixture() {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(path.resolve(".tmp/formatter-generator-"));
  roots.push(root);
  return root;
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

it("formats extracted currency rows before replacing the generated file", async () => {
  const root = await fixture();
  const script = "scripts/generate-currency-foundation-types.mjs";
  for (const file of [
    script,
    "scripts/lib/format-source.mts",
    "scripts/lib/format-options.mts",
  ])
    await cp(file, path.join(root, file));
  const target = path.join(
    root,
    "packages/database/types/currency-foundation.generated.ts",
  );
  await mkdir(path.dirname(target), { recursive: true });
  const tables = ["campaigns", "currency_metadata", "currency_rate_snapshots"]
    .map((name) => `${name}:{Row:{code:string}};`)
    .join("");
  await writeFile(
    path.join(root, "input.ts"),
    `type Database={public:{Tables:{${tables}}}};`,
  );
  const run = () =>
    spawnSync(process.execPath, [script, "input.ts"], {
      cwd: root,
      encoding: "utf8",
    });
  const first = run();
  expect(first.status, first.stderr).toBe(0);
  const bytes = await readFile(target, "utf8");
  expect(bytes).toContain("  currency_metadata: { Row: { code: string } };\n");
  expect(run().status).toBe(0);
  expect(await readFile(target, "utf8")).toBe(bytes);
  const shadow = path.join(root, "node_modules/oxfmt");
  await mkdir(shadow, { recursive: true });
  await writeFile(
    path.join(shadow, "package.json"),
    '{"exports":"./unavailable.js"}',
  );
  const missing = run();
  expect(missing.status).toBe(1);
  expect(missing.stderr).toMatch(/oxfmt/i);
  expect(await readFile(target, "utf8")).toBe(bytes);
});

it("removes only the obsolete Payload header, once, and validates both maps before publishing", async () => {
  const root = await fixture();
  const maps = ["web-studio", "admin"].map((name) =>
    path.join(root, "app/(payload)", name, "importMap.js"),
  );
  for (const file of maps) await mkdir(path.dirname(file), { recursive: true });
  const source =
    "/* eslint-disable import-x/no-duplicates, import-x/order -- TODO(AL-000): auto-generated Payload import map */\r\n/* keep */\r\nexport const importMap = {a:1}\r\n";
  await writeFile(maps[0], source);
  await writeFile(maps[1], "export const =");
  const run = () =>
    spawnSync(
      process.execPath,
      [path.resolve("scripts/dev/postprocess-payload-importmap.mjs")],
      { cwd: root, encoding: "utf8" },
    );
  expect(run().status).toBe(1);
  expect(await readFile(maps[0], "utf8")).toBe(source);
  await writeFile(maps[1], "/* keep */\nexport const importMap = {a:1}\n");
  for (let pass = 0; pass < 2; pass++) {
    const result = run();
    expect(result.status, result.stderr).toBe(0);
    for (const file of maps)
      expect(await readFile(file, "utf8")).toBe(
        "/* keep */\n/** @type {Record<string, unknown>} */\nexport const importMap = { a: 1 };\n",
      );
  }
});
