import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("keeps protected bytes and ordering, but formats the currency mirror", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "formatter-policy-"));
  const protectedPaths = [
    "config.toml",
    "docs/qa/probe.js",
    "docs/ops/phase-evidence/probe.js",
    "docs/features/support-hub/grill/decision.json",
    "docs/features/support-hub/docs/adr/decision.md",
    "docs/features/support-hub/CONTEXT.md",
    "docs/features/support-hub/README.md",
    "docs/features/support-hub/publication-provenance.json",
    "docs/features/support-hub/phase26-spec-publication.md",
    "docs/prds/sitestacker-parity/phase-26-support-hub-volume.md",
    "openspec/changes/add-support-hub-conversation-management/specs/support-hub/spec.md",
    "openspec/changes/archive/probe.js",
    "scripts/archon-factory/pack/probe.js",
    "docs/ai/skills/bendc-frontend-guidelines/references/readme-original.md",
    "docs/ai/skills/impeccable/scripts/modern-screenshot.umd.js",
    "other.generated.ts",
    "docs/prds/program-roadmap/source-2026-09-22/probe.md",
    "tests/fixtures/skills/emil-upstream/probe.js",
  ];
  const mirror = "packages/database/types/currency-foundation.generated.ts";
  try {
    await symlink(
      path.resolve("node_modules"),
      path.join(root, "node_modules"),
      "junction",
    );
    for (const file of [
      ".prettierignore",
      "oxfmt.config.mts",
      "scripts/lib/format-options.mts",
    ]) {
      await cp(path.resolve(file), path.join(root, file));
    }
    for (const file of [...protectedPaths, mirror, "source.tsx"]) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(
        path.join(root, file),
        file === "source.tsx"
          ? 'import {z} from "./z";\nimport {a} from "./a";\nexport const view=<p className="p-2 flex"/>;\n'
          : "const  value=1\r\n",
      );
    }
    const run = (mode: string) =>
      spawnSync(
        "bun",
        [
          "x",
          "--no-install",
          "oxfmt",
          "--no-error-on-unmatched-pattern",
          "--disable-nested-config",
          mode,
          ".",
        ],
        { cwd: root, encoding: "utf8" },
      );
    const listed = run("--list-different");
    expect(listed.status, listed.stderr).toBe(1);
    for (const file of protectedPaths)
      expect(listed.stdout.replaceAll("\\", "/")).not.toContain(file);
    expect(listed.stdout.replaceAll("\\", "/")).toContain(mirror);
    const written = run("--write");
    expect(written.status, written.stderr).toBe(0);
    for (const file of protectedPaths)
      expect(await readFile(path.join(root, file), "utf8")).toBe(
        "const  value=1\r\n",
      );
    expect(await readFile(path.join(root, mirror), "utf8")).toBe(
      "const value = 1;\n",
    );
    expect(await readFile(path.join(root, "source.tsx"), "utf8")).toMatch(
      /from "\.\/z";\nimport .*from "\.\/a";[\s\S]*className="p-2 flex"/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
