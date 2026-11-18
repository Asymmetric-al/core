/**
 * The narrow-input analysis behind each scoped unit-test group
 * (scripts/verify/ci-test-scope.mjs, design.md §2). A pull request may skip a
 * group's test only when that test's imports and repository reads stay inside
 * the group's inputs; any test the analysis cannot clear stays in the run.
 * This file is not in a scoped group, so it runs on every unit-test run.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  SCOPED_TEST_GROUPS,
  analyzeGroupTests,
} from "../../../scripts/verify/ci-test-scope.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

describe("scoped groups in this repository", () => {
  it.each(SCOPED_TEST_GROUPS.map((group) => [group.id, group] as const))(
    "%s: the analysis clears most of the group and explains every exception",
    (_id, group) => {
      const { scoped, unscoped } = analyzeGroupTests(group, {
        root: REPO_ROOT,
      });
      expect(scoped.length).toBeGreaterThan(unscoped.length);
      for (const { file, reasons } of unscoped) {
        expect(scoped).not.toContain(file);
        expect(reasons.length, file).toBeGreaterThan(0);
      }
    },
  );
});

describe("the analysis keeps escaping tests in the run", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const root of roots.splice(0))
      rmSync(root, { recursive: true, force: true });
  });

  function fixture(files: Record<string, string>) {
    const root = mkdtempSync(path.join(os.tmpdir(), "ci-test-scope-"));
    roots.push(root);
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), text);
    }
    return root;
  }

  const group = {
    id: "fixture",
    description: "fixture tests",
    tests: ["tests/unit/scripts/tool-*.test.ts"],
    inputs: ["scripts/tool/**", "tests/unit/helpers/**", "docs/tool.md"],
  };
  const base = {
    "scripts/tool/main.mjs": "export const x = 1;\n",
    "scripts/other/lib.mjs": "export const y = 2;\n",
    "docs/tool.md": "# tool\n",
    "docs/other.md": "# other\n",
    "package.json": "{}\n",
    "README.md": "# readme\n",
  };
  const reasonsOf = (root: string, test: string) =>
    analyzeGroupTests(group, { root }).unscoped.find(
      (entry) => entry.file === test,
    )?.reasons;

  it("clears imports, URLs and root reads inside the inputs", () => {
    const root = fixture({
      ...base,
      "tests/unit/helpers/h.ts": 'import "../../../scripts/tool/main.mjs";\n',
      "tests/unit/scripts/tool-a.test.ts": [
        'import { x } from "../../../scripts/tool/main.mjs";',
        'import { h } from "../helpers/h";',
        'import { it } from "vitest";',
        'import path from "node:path";',
        'const u = new URL("../../../scripts/tool/main.mjs", import.meta.url);',
        'const root = path.resolve(import.meta.dirname, "../../..");',
        'const doc = path.join(root, "docs/tool.md");',
        // A full-run trigger: changing it runs every test anyway.
        'const manifest = path.join(root, "package.json");',
        'const word = "review";',
      ].join("\n"),
    });
    expect(analyzeGroupTests(group, { root })).toEqual({
      scoped: ["tests/unit/scripts/tool-a.test.ts"],
      unscoped: [],
    });
  });

  it("keeps a test whose import leaves the inputs, also transitively", () => {
    const root = fixture({
      ...base,
      "scripts/tool/main.mjs": 'export { y } from "../other/lib.mjs";\n',
      "tests/unit/scripts/tool-a.test.ts":
        'import { x } from "../../../scripts/tool/main.mjs";\n',
      "tests/unit/scripts/tool-z.test.ts": 'import { it } from "vitest";\n',
    });
    const result = analyzeGroupTests(group, { root });
    expect(result.scoped).toEqual(["tests/unit/scripts/tool-z.test.ts"]);
    expect(result.unscoped).toEqual([
      {
        file: "tests/unit/scripts/tool-a.test.ts",
        reasons: ["scripts/tool/main.mjs imports scripts/other/lib.mjs"],
      },
    ]);
  });

  it("keeps tests with dynamic imports, vi.mock or workspace packages outside", () => {
    const root = fixture({
      ...base,
      "tests/unit/scripts/tool-b.test.ts": [
        'await import("../../../scripts/other/lib.mjs");',
        'vi.mock("../../../scripts/other/lib.mjs", () => ({}));',
        'import { db } from "@asym/database";',
      ].join("\n"),
    });
    expect(reasonsOf(root, "tests/unit/scripts/tool-b.test.ts")).toEqual([
      "tests/unit/scripts/tool-b.test.ts imports scripts/other/lib.mjs",
      "tests/unit/scripts/tool-b.test.ts imports workspace package @asym/database",
    ]);
  });

  it("keeps a test that reads outside the inputs through a URL", () => {
    const root = fixture({
      ...base,
      "tests/unit/scripts/tool-c.test.ts":
        'const u = new URL("../../../docs/other.md", import.meta.url);\n',
    });
    expect(reasonsOf(root, "tests/unit/scripts/tool-c.test.ts")).toEqual([
      "tests/unit/scripts/tool-c.test.ts reads docs/other.md",
    ]);
  });

  it("keeps a test that reads outside the inputs through the repository root", () => {
    const root = fixture({
      ...base,
      "tests/unit/scripts/tool-d.test.ts": [
        "const root = process.cwd();",
        'read(path.join(root, "README.md"));',
        'read(path.join(root, "docs/other.md"));',
      ].join("\n"),
    });
    expect(reasonsOf(root, "tests/unit/scripts/tool-d.test.ts")).toEqual([
      "tests/unit/scripts/tool-d.test.ts reads README.md",
      "tests/unit/scripts/tool-d.test.ts reads docs/other.md",
    ]);
  });

  it("keeps a test whose imported module reads through the repository root", () => {
    const root = fixture({
      ...base,
      "scripts/tool/main.mjs": [
        'const root = fileURLToPath(new URL("../../", import.meta.url));',
        'export const read = () => readFileSync(path.join(root, "docs/other.md"));',
      ].join("\n"),
      "tests/unit/scripts/tool-f.test.ts":
        'import { read } from "../../../scripts/tool/main.mjs";\n',
    });
    expect(reasonsOf(root, "tests/unit/scripts/tool-f.test.ts")).toEqual([
      "scripts/tool/main.mjs reads docs/other.md",
    ]);
  });

  it("ignores fixture paths and entry-point checks that never read the repository", () => {
    const root = fixture({
      ...base,
      "scripts/tool/main.mjs": [
        "export const x = 1;",
        'const note = "docs/other.md";',
        "if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();",
      ].join("\n"),
      "tests/unit/scripts/tool-e.test.ts": [
        'import { x } from "../../../scripts/tool/main.mjs";',
        'const tmp = mkdtempSync("x");',
        'write(path.join(tmp, "docs/other.md"));',
      ].join("\n"),
    });
    expect(analyzeGroupTests(group, { root }).scoped).toEqual([
      "tests/unit/scripts/tool-e.test.ts",
    ]);
  });
});
