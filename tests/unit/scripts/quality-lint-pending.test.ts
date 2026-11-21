import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import config, { policyRules } from "../../../oxlint.config.mts";
import {
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";

import {
  countFindings,
  parsePending,
  pendingProblems,
} from "../../../scripts/verify/lint-pending.mts";

const rule = "typescript/no-floating-promises";
const entry = { rule, workspace: "apps/admin", task: "RS-admin", count: 1 };
const report = {
  number_of_files: 4,
  diagnostics: [
    {
      code: "typescript(no-floating-promises)",
      filename: "apps\\admin\\page.ts",
    },
    {
      code: "typescript(no-floating-promises)",
      filename: "apps/admin/page.test.ts",
    },
    { code: "anti-slop(no-reflect-get)", filename: "scripts/read.mts" },
    {
      code: "eslint-plugin-react-hooks(exhaustive-deps)",
      filename: "packages/ui/view.tsx",
      url: "https://oxc.rs/docs/guide/usage/linter/rules/react/exhaustive-deps.html",
    },
  ],
};
const active = new Set([rule, "react/exhaustive-deps", "eslint/curly"]);
const parity = new Set(["react/exhaustive-deps"]);
const counts = () => countFindings(report);

describe("pending lint policy", () => {
  it("exits 2 with the setup failure when its merge base cannot be resolved", () => {
    const run = spawnSync(
      process.execPath,
      [
        "scripts/verify/lint-pending.mts",
        "--base",
        "pl1-nonexistent-control-20261120",
      ],
      { cwd: root, encoding: "utf8", shell: false },
    );
    expect(run.status, run.stderr).toBe(2);
    expect(run.stderr).toContain("git rev-parse");
  });

  it("retains active product rules that a test preset disables", () => {
    expect(policyRules.has("eslint/no-empty-function")).toBe(true);
    expect(policyRules.has("eslint/no-await-in-loop")).toBe(false);
  });

  it("excludes exactly the pinned engine's type-aware rules from no-program fixtures", () => {
    const listed = spawnSync(
      process.execPath,
      ["node_modules/oxlint/bin/oxlint", "--rules", "--format", "json"],
      {
        cwd: root,
        encoding: "utf8",
        shell: false,
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    expect(listed.status, listed.stderr).toBe(0);
    const catalogue: unknown = JSON.parse(listed.stdout);
    if (!Array.isArray(catalogue))
      throw new Error("Expected native Oxlint rule catalogue");
    const typed = catalogue.flatMap((item: unknown) => {
      if (
        !item ||
        typeof item !== "object" ||
        !("type_aware" in item) ||
        item.type_aware !== true
      )
        return [];
      if (
        !("scope" in item) ||
        typeof item.scope !== "string" ||
        !("value" in item) ||
        typeof item.value !== "string"
      )
        throw new Error("Invalid native rule");
      return [`${item.scope}/${item.value}`];
    });
    const fixture = config.overrides?.find((override) =>
      override.files?.includes("tests/fixtures/base-ui-compliance/*.{ts,tsx}"),
    );
    expect(fixture?.rules).toEqual(
      Object.fromEntries(typed.map((name) => [name, "off"])),
    );
  });

  it("classifies a diagnostic by canonical rule, owning workspace and profile", () => {
    expect(counts()).toEqual([
      {
        rule: "anti-slop/no-reflect-get",
        workspace: "scripts",
        scope: "scripts",
        count: 1,
      },
      {
        rule: "react/exhaustive-deps",
        workspace: "packages/ui",
        scope: "product",
        count: 1,
      },
      { rule, workspace: "apps/admin", scope: "product", count: 1 },
      { rule, workspace: "apps/admin", scope: "tests", count: 1 },
    ]);
  });

  it("does not make a snapshot count a ceiling", () => {
    expect(pendingProblems([entry], active, parity, counts(), [entry])).toEqual(
      [],
    );
  });

  it("rejects a clean workspace even if the same rule fires elsewhere", () => {
    expect(
      pendingProblems(
        [{ ...entry, workspace: "apps/donor" }],
        active,
        parity,
        counts(),
      ),
    ).toEqual([expect.stringMatching(/clean.*apps\/donor/i)]);
  });

  it("rejects a rule outside the policy and a mapped incumbent rule", () => {
    expect(
      pendingProblems(
        [
          { ...entry, rule: "eslint/not-a-policy-rule" },
          { ...entry, rule: "react/exhaustive-deps" },
        ],
        active,
        parity,
        counts(),
      ),
    ).toEqual([
      expect.stringMatching(/not in.*policy/i),
      expect.stringMatching(/parity/i),
    ]);
  });

  it("allows removal and narrowing, never addition or widening relative to the base", () => {
    const all = { rule, task: "RS-promises", count: 2 };
    expect(pendingProblems([entry], active, parity, counts(), [all])).toEqual(
      [],
    );
    expect(pendingProblems([], active, parity, counts(), [entry])).toEqual([]);
    expect(pendingProblems([all], active, parity, counts(), [entry])).toEqual([
      expect.stringMatching(/added or widened/i),
    ]);
    expect(pendingProblems([entry], active, parity, counts(), [])).toEqual([
      expect.stringMatching(/added or widened/i),
    ]);
  });

  it.each(
    [
      {},
      [null],
      [{ ...entry, count: 0 }],
      [{ ...entry, count: 0.5 }],
      [{ ...entry, task: "later" }],
      [{ ...entry, scope: "**" }],
      [{ ...entry, workspace: "../apps" }],
      [{ ...entry, workspace: "apps/*" }],
      [entry, entry],
      [entry, { rule, task: "RS-promises", count: 2 }],
    ].map((value) => ({ value })),
  )("rejects malformed or overlapping entries: $value", ({ value }) => {
    expect(() => parsePending(value)).toThrow();
  });

  it("does not interpret a failed or unrecognizable audit as a clean workspace", () => {
    expect(() => countFindings({})).toThrow();
    expect(() =>
      countFindings({ ...report, number_of_files: 0, diagnostics: [] }),
    ).toThrow();
    expect(() =>
      countFindings({ ...report, diagnostics: [{ filename: "broken.ts" }] }),
    ).toThrow();
  });
});

it(
  "enforces literal parity and turns off a pending rule only in its workspace",
  { timeout },
  () => {
    const directory = mkdtempSync(join(tmpdir(), "quality-pending-"));
    try {
      for (const file of [
        "oxlint.config.mts",
        "scripts/verify/lint-pending.mts",
        "tooling/quality/lint.mts",
        "tooling/quality/eslint-parity.json",
        "tests/fixtures/base-ui-compliance/tsconfig.json",
      ]) {
        mkdirSync(dirname(join(directory, file)), { recursive: true });
        copyFileSync(join(root, file), join(directory, file));
      }
      symlinkSync(
        join(root, "node_modules"),
        join(directory, "node_modules"),
        "junction",
      );
      for (const app of ["admin", "donor"]) {
        mkdirSync(join(directory, "apps", app), { recursive: true });
        for (const ext of ["ts", "js"])
          writeFileSync(
            join(directory, "apps", app, `sample.${ext}`),
            "var unused = 1;\ndebugger;\n",
          );
      }
      writeFileSync(join(directory, "root.js"), "debugger;\n");
      writeFileSync(
        join(directory, "tooling/quality/pending.json"),
        JSON.stringify([
          { ...entry, rule: "eslint/no-debugger", workspace: "(root)" },
          { ...entry, rule: "eslint/no-debugger" },
        ]),
      );
      const probe = (raw: boolean) => {
        const result = spawnSync(
          process.execPath,
          ["tooling/quality/lint.mts", "--format", "json", "apps", "root.js"],
          {
            cwd: directory,
            encoding: "utf8",
            env: { ...process.env, CORE_LINT_AUDIT_PENDING: raw ? "1" : "0" },
            shell: false,
          },
        );
        expect(
          result.status,
          result.stderr || result.stdout.slice(0, 1200),
        ).toBe(1);
        const report: { diagnostics: { code: string; filename: string }[] } =
          JSON.parse(result.stdout);
        return (code: string) =>
          report.diagnostics
            .filter((item) => item.code === `eslint(${code})`)
            .map((item) => item.filename.replaceAll("\\", "/"))
            .sort();
      };
      const normal = probe(false);
      expect(normal("no-var")).toEqual([
        "apps/admin/sample.ts",
        "apps/donor/sample.ts",
      ]);
      expect(normal("no-unused-vars")).toEqual([
        "apps/admin/sample.js",
        "apps/donor/sample.js",
      ]);
      expect(normal("no-debugger")).toEqual([
        "apps/donor/sample.js",
        "apps/donor/sample.ts",
      ]);
      expect(probe(true)("no-debugger")).toHaveLength(5);
      const fixtures = join(directory, "tests/fixtures/base-ui-compliance");
      writeFileSync(
        join(fixtures, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { strict: true, target: "ES2022", types: [] },
          files: ["admin-shell-main.tsx", "workspace-main.tsx"],
          include: ["admin-shell-main.tsx"],
        }),
      );
      for (const file of ["admin-shell-main.tsx", "workspace-main.tsx"])
        writeFileSync(
          join(fixtures, file),
          "Promise.resolve(42);\ndebugger;\n",
        );
      const typed = spawnSync(
        process.execPath,
        ["tooling/quality/lint.mts", "--typed", "--format", "json", fixtures],
        { cwd: directory, encoding: "utf8", shell: false },
      );
      expect(typed.status, typed.stderr || typed.stdout.slice(0, 1200)).toBe(1);
      const findings = countFindings(JSON.parse(typed.stdout));
      expect(findings.find((row) => row.rule === rule)?.count).toBe(1);
      expect(
        findings.find((row) => row.rule === "eslint/no-debugger")?.count,
      ).toBe(2);
    } finally {
      removeFixture(tmpdir(), directory);
    }
  },
);
