import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";

import { countFindings } from "../../../scripts/verify/lint-pending.mts";

// Fixtures live at lint-scopes/<fail|clean>/<repository path>.txt so the root lint and typecheck never read them.
const fixtures = path.join(root, "tests/fixtures/quality/lint-scopes");
const imports = "eslint/no-restricted-imports";

type Case = {
  scope: string;
  rule: string;
  fail: string;
  count: number;
  clean: string;
};

// An import tier's clean twin sits at the same path and imports what the tier permits (VR-3). A framework scope's
// clean twin is the failing source unchanged, placed outside the scope. Counts are one per matching ban: like ESLint,
// Oxlint reports a cross-app path once for the relative-depth group and once for the named-app group.
const cases: Case[] = [
  {
    scope: "tier 0 (packages)",
    rule: imports,
    fail: "packages/lib/boundary.ts",
    count: 6,
    clean: "packages/lib/boundary.ts",
  },
  {
    scope: "tier 0 motion modules",
    rule: imports,
    fail: "packages/lib/motion.ts",
    count: 8,
    clean: "packages/lib/motion.ts",
  },
  {
    scope: "tier 1 (apps)",
    rule: imports,
    fail: "apps/admin/lib/boundary.ts",
    count: 5,
    clean: "apps/admin/lib/boundary.ts",
  },
  {
    scope: "tier 1 Payload admin UI",
    rule: imports,
    fail: "apps/admin/src/cms-ui/boundary.ts",
    count: 5,
    clean: "apps/admin/src/cms-ui/boundary.ts",
  },
  {
    scope: "tier 2 (app components)",
    rule: imports,
    fail: "apps/donor/components/boundary.ts",
    count: 4,
    clean: "apps/donor/components/boundary.ts",
  },
  {
    scope: "tier 2 (shared UI)",
    rule: imports,
    fail: "packages/ui/components/boundary.ts",
    count: 4,
    clean: "packages/ui/components/boundary.ts",
  },
  {
    scope: "tier 2 (app src components)",
    rule: imports,
    fail: "apps/factory-console/src/components/boundary.ts",
    count: 4,
    clean: "apps/factory-console/src/components/boundary.ts",
  },
  {
    scope: "tier 2 table boundary",
    rule: imports,
    fail: "packages/ui/components/shadcn/data-table/tanstack.ts",
    count: 4,
    clean: "packages/ui/components/shadcn/data-table/tanstack.ts",
  },
  {
    scope: "public-content contract",
    rule: imports,
    fail: "packages/api/src/cms/public/boundary.ts",
    count: 4,
    clean: "packages/api/src/cms/public/boundary.ts",
  },
  {
    scope: "tier 3 (app route handlers)",
    rule: imports,
    fail: "apps/missionary/app/api/boundary/route.ts",
    count: 7,
    clean: "apps/missionary/app/api/boundary/route.ts",
  },
  {
    scope: "tier 3 (app src route handlers)",
    rule: imports,
    fail: "apps/factory-console/src/app/api/boundary/route.ts",
    count: 8,
    clean: "apps/factory-console/src/app/api/boundary/route.ts",
  },
  {
    scope: "tier 3 health probe",
    rule: imports,
    fail: "apps/admin/app/api/health/route.ts",
    count: 4,
    clean: "apps/admin/app/api/health/route.ts",
  },
  ...[
    "apps/admin/lib",
    "apps/donor/lib",
    "apps/missionary/lib",
    "apps/factory-console/src/lib",
  ].map((directory) => ({
    scope: `Next (${directory.split("/")[1]})`,
    rule: "nextjs/no-assign-module-variable",
    fail: `${directory}/next-scope.ts`,
    count: 1,
    clean: "packages/lib/next-scope.ts",
  })),
  {
    scope: "React JSX",
    rule: "jsx-a11y/alt-text",
    fail: "packages/ui/components/react-scope.tsx",
    count: 1,
    clean: "scripts/react-scope.tsx",
  },
  ...[
    "tests/unit",
    "packages/api/tests/unit",
    "packages/auth/src",
    "apps/factory-console/tests",
  ].map((directory) => ({
    scope: `Vitest (${directory})`,
    rule: "vitest/no-identical-title",
    fail: `${directory}/vitest-scope.test.ts`,
    count: 1,
    clean: "tests/integration/vitest-scope.test.ts",
  })),
  ...[
    "tests/e2e",
    "tests/fixtures/base-ui-compliance/specs",
    "apps/factory-console/tests/e2e",
  ].map((directory) => ({
    scope: `Playwright (${directory})`,
    rule: "playwright/no-wait-for-timeout",
    fail: `${directory}/playwright-scope.spec.ts`,
    count: 1,
    clean: "tests/integration/playwright-scope.spec.ts",
  })),
];

// Root tests and scripts are outside every tier: they import app code and motion/react directly.
const outside = ["tests/support/boundary.ts"];

type Tree = "fail" | "clean";

type Finding = { file: string; rule: string; line: number };

type Run = { status: number | null; files: number; findings: Finding[] };

type Labelled = { span: { line: number } };

type Diagnostic = { filename: string; labels: Labelled[] };

type Report = { number_of_files: number; diagnostics: unknown[] };

function isReport(value: unknown): value is Report {
  return (
    typeof value === "object" &&
    value !== null &&
    "number_of_files" in value &&
    typeof value.number_of_files === "number" &&
    "diagnostics" in value &&
    Array.isArray(value.diagnostics)
  );
}

function isLabelled(value: unknown): value is Labelled {
  return (
    typeof value === "object" &&
    value !== null &&
    "span" in value &&
    typeof value.span === "object" &&
    value.span !== null &&
    "line" in value.span &&
    typeof value.span.line === "number"
  );
}

function isDiagnostic(value: unknown): value is Diagnostic {
  return (
    typeof value === "object" &&
    value !== null &&
    "filename" in value &&
    typeof value.filename === "string" &&
    "labels" in value &&
    Array.isArray(value.labels) &&
    value.labels.every(isLabelled)
  );
}

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesUnder(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}

function treeFiles(tree: Tree) {
  const base = path.join(fixtures, tree);

  return filesUnder(base)
    .map((file) =>
      path
        .relative(base, file)
        .split(path.sep)
        .join("/")
        .replace(/\.txt$/, ""),
    )
    .sort();
}

function source(tree: Tree, file: string) {
  return readFileSync(path.join(fixtures, tree, `${file}.txt`), "utf-8");
}

// The rule name comes from the pending verifier's classifier; the file and first label line from the report.
function finding(diagnostic: unknown): Finding {
  const [row] = countFindings({
    number_of_files: 1,
    diagnostics: [diagnostic],
  });

  const label = isDiagnostic(diagnostic) ? diagnostic.labels[0] : undefined;

  if (!row || !label || !isDiagnostic(diagnostic)) {
    throw new Error(`Unexpected diagnostic: ${JSON.stringify(diagnostic)}`);
  }

  return {
    file: diagnostic.filename.replaceAll("\\", "/"),
    rule: row.rule,
    line: label.span.line,
  };
}

function report(output: string, status: number | null): Run {
  const parsed: unknown = JSON.parse(output);

  if (!isReport(parsed)) {
    throw new Error(`Expected an Oxlint JSON report: ${output.slice(0, 1200)}`);
  }

  return {
    status,
    files: parsed.number_of_files,
    findings: parsed.diagnostics.map(finding),
  };
}

const directories: string[] = [];

// The real root config, launcher and backend in an isolated copy. No pending list is copied, so the whole policy
// applies and a clean twin is clean under every rule, not just the one its case names.
function lint(tree: Tree): Run {
  const directory = mkdtempSync(
    path.join(tmpdir(), `quality-lint-scopes-${tree}-`),
  );

  directories.push(directory);

  for (const file of [
    "oxlint.config.mts",
    "scripts/verify/lint-pending.mts",
    "tooling/quality/lint.mts",
    "tooling/quality/eslint-parity.json",
    "tests/fixtures/base-ui-compliance/tsconfig.json",
  ]) {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    copyFileSync(path.join(root, file), path.join(directory, file));
  }

  symlinkSync(
    path.join(root, "node_modules"),
    path.join(directory, "node_modules"),
    "junction",
  );

  const targets = treeFiles(tree);

  for (const file of targets) {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    copyFileSync(
      path.join(fixtures, tree, `${file}.txt`),
      path.join(directory, file),
    );
  }

  const result = spawnSync(
    process.execPath,
    ["tooling/quality/lint.mts", "--format", "json", ...targets],
    {
      cwd: directory,
      encoding: "utf-8",
      env: { ...process.env, CORE_LINT_PARALLEL: "1" },
      maxBuffer: 64 * 1024 * 1024,
      shell: false,
      timeout: timeout - 10_000,
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(
      `Launcher failed (${result.status}): ${result.stderr || result.stdout.slice(0, 1200)}`,
    );
  }

  return report(result.stdout, result.status);
}

describe("lint scopes through the real root config", () => {
  let fail: Run;
  let clean: Run;

  beforeAll(() => {
    fail = lint("fail");
    clean = lint("clean");
  }, 2 * timeout);

  afterAll(() => {
    for (const directory of directories) {
      removeFixture(tmpdir(), directory);
    }
  });

  it("has a fixture for every case and a case for every fixture", () => {
    expect(treeFiles("fail")).toEqual(
      [...new Set(cases.map((item) => item.fail))].sort(),
    );
    expect(treeFiles("clean")).toEqual(
      [...new Set([...cases.map((item) => item.clean), ...outside])].sort(),
    );
  });

  it("lints every fixture rather than ignoring it", () => {
    expect(fail.files).toBe(treeFiles("fail").length);
    expect(clean.files).toBe(treeFiles("clean").length);
  });

  it("exercises value, type, re-export and dynamic imports in every tier fixture (VR-3)", () => {
    const forms = {
      value: /^import \{/m,
      type: /^import type \{/m,
      reexport: /^export \{[^}]+\} from /m,
      dynamic: /\bimport\("/,
    };

    const missing = cases
      .flatMap((item) =>
        item.rule === imports
          ? [`fail/${item.fail}`, `clean/${item.clean}`]
          : [],
      )
      .flatMap((fixture) => {
        const text = readFileSync(
          path.join(fixtures, `${fixture}.txt`),
          "utf-8",
        );

        return Object.entries(forms)
          .filter(([, pattern]) => !pattern.test(text))
          .map(([form]) => `${fixture}: ${form}`);
      });

    expect(missing).toEqual([]);
  });

  it.each(cases)(
    "$scope: the failing fixture reports only $rule",
    ({ rule, fail: file, count }) => {
      const findings = fail.findings.filter((item) => item.file === file);

      expect(findings.map((item) => item.rule)).toEqual(
        Array.from({ length: count }, () => rule),
      );

      if (rule !== imports) {
        return;
      }

      const lines = source("fail", file)
        .split("\n")
        .flatMap((text, index) =>
          / from "|\bimport\("/.test(text) ? [index + 1] : [],
        );

      const reported = new Set(findings.map((item) => item.line));

      expect([...reported].sort((a, b) => a - b)).toEqual(lines);
    },
  );

  it("reports nothing in the failing tree beyond the cases", () => {
    const files = new Set(cases.map((item) => item.fail));

    expect(fail.status).toBe(1);
    expect(fail.findings.filter((item) => !files.has(item.file))).toEqual([]);
  });

  it("reports nothing on any clean twin, including code outside every tier", () => {
    expect(clean.findings).toEqual([]);
    expect(clean.status).toBe(0);
  });
});
