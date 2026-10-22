import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { applyTasteChartCompatibility } from "../../../scripts/lib/taste-charts-adapter.mjs";

const repo = process.cwd();
const fixturePath = path.join(
  repo,
  "tests/fixtures/managed-skill-refresh/design-taste-frontend/assets/charts.js.raw",
);
const canonicalPath = path.join(
  repo,
  "docs/ai/skills/design-taste-frontend/assets/charts.js",
);
const roots: string[] = [];
const hash = (content: string) =>
  createHash("sha256").update(content).digest("hex");

async function fixture() {
  const root = await mkdtemp(path.join(repo, ".tmp/taste-charts-test-"));
  roots.push(root);
  await mkdir(path.join(root, "assets"));
  const file = path.join(root, "assets/charts.js");
  await cp(fixturePath, file);
  return { root, file };
}

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("reviewed Taste chart refresh repair", () => {
  it("repairs exact pinned upstream bytes into the reviewed safe asset and is idempotent", async () => {
    const { root, file } = await fixture();
    expect(hash(await readFile(file, "utf8"))).toBe(
      "89071120bd09eb276d9e568bab433ed035ea8b3a1b72750a1fa204a63e3d4ab4",
    );
    await applyTasteChartCompatibility(root);
    const repaired = await readFile(file, "utf8");
    expect(repaired).toBe(await readFile(canonicalPath, "utf8"));
    // The only remaining HTML assignments clear containers with a fixed empty string.
    expect(repaired.match(/\.innerHTML\s*=/gu)).toHaveLength(5);
    expect(repaired.match(/\.innerHTML\s*=\s*"";/gu)).toHaveLength(5);
    await applyTasteChartCompatibility(root);
    expect(await readFile(file, "utf8")).toBe(repaired);
  });

  it("uses trusted repository formatting without executing source-local config or lifecycle code", async () => {
    const { root, file } = await fixture();
    const marker = path.join(root, "config-executed");
    await writeFile(
      path.join(root, ".prettierrc.mjs"),
      "import fs from 'node:fs'; fs.writeFileSync(" +
        JSON.stringify(marker) +
        ", 'unsafe'); export default {};",
    );
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        type: "module",
        scripts: { prepare: "exit 91", postinstall: "exit 92" },
        prettier: "./.prettierrc.mjs",
      }),
    );
    await applyTasteChartCompatibility(root);
    await expect(readFile(marker)).rejects.toMatchObject({ code: "ENOENT" });
    expect(await readFile(file, "utf8")).toBe(
      await readFile(canonicalPath, "utf8"),
    );
  });

  it.each(["upstream drift", "mixed source"] as const)(
    "rejects %s before changing the source",
    async (kind) => {
      const { root, file } = await fixture();
      const raw = await readFile(file, "utf8");
      const changed =
        kind === "upstream drift"
          ? raw.replace("function ring(", "function unreviewedRing(")
          : (await readFile(canonicalPath, "utf8")) +
            "\n// mixed stale copy\n" +
            raw;
      expect(changed).not.toBe(raw);
      await writeFile(file, changed);
      await expect(applyTasteChartCompatibility(root)).rejects.toThrow(
        /drifted or mixes upstream\/Core/u,
      );
      expect(await readFile(file, "utf8")).toBe(changed);
    },
  );

  it.skipIf(process.platform === "win32")(
    "rejects a symlinked asset directory before writing outside the skill",
    async () => {
      const { root, file } = await fixture();
      const outside = await mkdtemp(path.join(repo, ".tmp/taste-outside-"));
      roots.push(outside);
      await cp(file, path.join(outside, "charts.js"));
      const original = await readFile(path.join(outside, "charts.js"), "utf8");
      await rm(path.join(root, "assets"), { recursive: true });
      await symlink(outside, path.join(root, "assets"), "dir");
      await expect(applyTasteChartCompatibility(root)).rejects.toThrow(
        /regular files\/directories/u,
      );
      expect(await readFile(path.join(outside, "charts.js"), "utf8")).toBe(
        original,
      );
    },
  );
});
