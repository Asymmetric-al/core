/**
 * #2253 static acceptance (runs in test:unit): r1 §6 criteria 1 and 12, the
 * opt-in scope check and the lead's CI-step ruling. Owned by Acceptance.
 *
 * The scope check follows #2183's pattern (issue-2183/criterion-6-diff-scope):
 * it is a one-time check for the #2253 PR and is skipped unless
 * `ACCEPTANCE_2253_SCOPE=1` (diff against `git merge-base origin/develop HEAD`)
 * or `ACCEPTANCE_2253_BASE=<ref|sha>` (diff against that base) is set. Run in
 * test:unit after merge it would see an empty diff and fail develop and every
 * later PR (factory/review F1). The CI-step pin below stays permanent.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import {
  AFTER_STEPS,
  ALLOWLIST,
  CATALOG,
  CI_STEP,
  CII,
  DOC,
  EXCEPTIONS,
  GATE,
  KINDS,
  MARKER,
  REALSTACK,
  VERIFIER,
  read,
} from "./harness";
import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const git = (...args: string[]) => spawnSync("git", args, { encoding: "utf8" });
const BASE_OVERRIDE = process.env.ACCEPTANCE_2253_BASE?.trim() ?? "";
const SCOPE =
  process.env.ACCEPTANCE_2253_SCOPE?.trim() === "1" || BASE_OVERRIDE !== "";
function scopeBase(): string {
  if (BASE_OVERRIDE) return BASE_OVERRIDE;
  const b = git("merge-base", "origin/develop", "HEAD").stdout.trim();
  if (!b) throw new Error("ACCEPTANCE_2253_SCOPE=1 needs origin/develop");
  return b;
}

describe("#2253 static (1, 12)", () => {
  it(`1: ${CATALOG} exports the marked SQL, the evaluator and the runner`, async () => {
    expect(read(CATALOG), `${CATALOG} exists`).not.toBe("");
    const m = (await import(
      pathToFileURL(path.resolve(CATALOG)).href
    )) as Record<string, unknown>;
    expect(String(m.TENANT_RLS_CATALOG_SQL)).toContain(MARKER);
    expect(typeof m.evaluateTenantRlsCatalog).toBe("function");
    expect(typeof m.runTenantRlsCatalogGate).toBe("function");
  });

  it(`1: ${VERIFIER} runs the gate after the census and before the success line`, () => {
    const src = read(VERIFIER);
    const [census = -1, gate = -1, done = -1] = [
      "field-policy-census.mjs",
      "runTenantRlsCatalogGate(",
      "forward Supabase migrations",
    ].map((s) => src.lastIndexOf(s));
    expect(src).toContain("tenant-rls-catalog.mjs");
    expect(census).toBeGreaterThan(0);
    expect(gate).toBeGreaterThan(census);
    expect(done).toBeGreaterThan(gate);
  });

  it(`12: ${DOC} has a "CI gates" section covering both gates, where they run, the kinds and the review rules`, () => {
    const doc = read(DOC);
    const i = doc.search(/^#+ CI gates\s*$/m);
    expect(i, "CI gates heading").toBeGreaterThan(-1);
    const sec = doc.slice(i);
    for (const s of [
      CATALOG,
      VERIFIER,
      GATE,
      ALLOWLIST,
      EXCEPTIONS,
      "migrate",
      "test:unit",
      "verify:service-role-clients",
      "#516",
      ...KINDS,
    ])
      expect(sec, s).toContain(s);
    expect(sec).toMatch(/shrink[- ]only/i);
    expect(sec).toMatch(/re-?export/i);
  });

  if (!SCOPE)
    it.skip("skipped: the scope check is a one-time check for the #2253 PR and would fail develop and every later PR; set ACCEPTANCE_2253_SCOPE=1 (diff against git merge-base origin/develop HEAD) or ACCEPTANCE_2253_BASE=<ref|sha> (diff against that base) to run it", () => {});

  it.skipIf(!SCOPE)(
    "1, 12 (opt-in scope vs the PR base): the only .github change is the CI step in ci-integration.yml; docs/ci.md unchanged",
    () => {
      const base = scopeBase();
      const changed = git(
        "diff",
        "--name-only",
        base,
        "--",
        ".github",
        "docs/ci.md",
      ).stdout.trim();
      expect(changed).toBe(CII);
      // Removing the one step block must give back the merge-base file exactly.
      const lines = read(CII).split("\n");
      const at = lines.indexOf(`      - name: ${CI_STEP.name}`);
      expect(at, "step block").toBeGreaterThan(-1);
      let end = at + 1;
      while (end < lines.length && /^ {8}/.test(lines[end]!)) end++;
      lines.splice(at, end - at);
      expect(lines.join("\n")).toBe(git("show", `${base}:${CII}`).stdout);
    },
  );
});

describe("#2253 CI step (lead's ruling: own explicit-path migrate step, relative order only)", () => {
  it(`migrate has exactly one '${CI_STEP.name}' step, exactly this env and run, after #2250's, #2270's, #2251's and #2255's real-stack steps`, () => {
    const steps = workflowJobs(loadWorkflowDocument(CII)).migrate?.steps ?? [];
    const idx = (n: string) => steps.findIndex((s) => s.name === n);
    expect(steps.filter((s) => s.name === CI_STEP.name)).toHaveLength(1);
    const i = idx(CI_STEP.name);
    expect(steps[i]).toEqual(CI_STEP);
    for (const name of AFTER_STEPS) {
      expect(idx(name), `${name} present`).toBeGreaterThanOrEqual(0);
      expect(i, `after ${name}`).toBeGreaterThan(idx(name));
    }
  });

  it("the real-stack suite fails (not skips) in the migrate job when the URL is empty", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_JOB: "migrate",
    };
    env.TENANT_GUARD_IT_ADMIN_DATABASE_URL = env.VITEST = "";
    const r = spawnSync(
      process.execPath,
      ["node_modules/vitest/vitest.mjs", "run", REALSTACK],
      { env, encoding: "utf8" },
    );
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toContain("TENANT_GUARD_IT_ADMIN_DATABASE_URL");
  }, 120_000);
});
