/**
 * #492 criteria 13, 15, 16 (diff parts), 17 and spec §6 "Nothing else changes"
 * (spec r1). Owned by Acceptance. Opt-in one-time PR checks: run with
 * ACCEPTANCE_492_SCOPE=1 or ACCEPTANCE_492_BASE=<ref> (default base: merge-base
 * with origin/develop, else a6f6de55; untracked files count). Criterion 17
 * reads the PR body from ACCEPTANCE_492_PR_BODY.
 */
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { CAP_DIR, DOC, MODULES } from "./harness";

const BASE = process.env.ACCEPTANCE_492_BASE?.trim() ?? "";
const ENABLED = process.env.ACCEPTANCE_492_SCOPE?.trim() === "1" || BASE !== "";
const git = (args: string[]) => spawnSync("git", args, { encoding: "utf8" });
const DECLARED = [...MODULES.map((m) => `${CAP_DIR}/${m}.ts`), DOC];
const ALLOWED = [
  /^packages\/auth\/capabilities\/(registry|bundles|errors|effective-capabilities|rows)\.ts$/,
  /^docs\/security\/capability-spine\/registry\.md$/,
  /^tests\/unit\/auth\/capabilities\/[^/]+\.test\.ts$/,
  /^tests\/fixtures\/capability-registry\/(tsconfig\.json|[^/]+\.ts)$/,
  /^tests\/unit\/acceptance\/issue-492\//,
];

/** Paths changed against the base; asserts the #492 slice is present first. */
function changed() {
  const mb = git(["merge-base", "HEAD", "origin/develop"]);
  const base = BASE || (mb.status === 0 && mb.stdout.trim()) || "a6f6de55";
  const diff = git(["diff", "--name-only", "--no-renames", base]);
  expect(diff.status, `git diff ${base}`).toBe(0);
  const paths = [
    ...diff.stdout.split("\n"),
    ...git(["ls-files", "--others", "--exclude-standard"]).stdout.split("\n"),
  ].filter(Boolean);
  for (const f of DECLARED)
    expect(paths, `the #492 diff adds ${f}`).toContain(f);
  return paths;
}

if (!ENABLED)
  describe("#492 diff scope (opt-in)", () => {
    it.skip("skipped: set ACCEPTANCE_492_SCOPE=1 or ACCEPTANCE_492_BASE=<ref> to check the #492 PR diff", () => {});
  });

describe.skipIf(!ENABLED)("#492 diff scope", () => {
  it("spec §6: the diff touches only the declared paths", () => {
    expect(changed().filter((f) => !ALLOWED.some((re) => re.test(f)))).toEqual(
      [],
    );
  });

  const UNCHANGED: [string, RegExp][] = [
    [
      "criterion 13: auth package.json, findings.json and the incumbent permission files and tests are byte-unchanged",
      /^(packages\/auth\/(package\.json|permissions\.ts)|tooling\/shadscan\/findings\.json|packages\/api\/src\/admin\/contribution-operations\/permissions\.ts|tests\/unit\/(auth\/permissions|packages\/api\/admin\/contribution-operations-permissions)\.test\.ts)$/,
    ],
    ["criterion 15: no supabase/** change", /^supabase\//],
    [
      "criterion 16: docs/ci.md and .github/workflows/** are unchanged",
      /^(docs\/ci\.md$|\.github\/workflows\/)/,
    ],
  ];
  it.each(UNCHANGED)("%s", (_name, re) => {
    expect(changed().filter((f) => re.test(f))).toEqual([]);
  });

  it("criterion 17: the PR body carries `Closes #492`", () => {
    expect(process.env.ACCEPTANCE_492_PR_BODY ?? "").toMatch(/\bCloses #492\b/);
  });
});
