/**
 * Acceptance tests for #2153 (`acceptance-tests` job folded into `ci-gate`),
 * done criteria 1, 2, 4, 5, 6 and 10. Owned by Acceptance; implementers must
 * not edit this file to satisfy their PR. Spec (base 4e31ff33) and approval:
 * https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367102223
 * https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367121658
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as W from "../issue-2158/workflow-yaml";

const CI = ".github/workflows/ci.yml";
const ID = "acceptance-tests";
const doc = () => W.parseWorkflowSource(readFileSync(CI, "utf8"));
const jobs = () => W.workflowJobs(doc(), CI);
const job = () => jobs()[ID]!;
const gate = () => jobs()["ci-gate"]!;
const OUTCOMES = ["success", "failure", "skipped", "cancelled"];
const RESULTS_STEP = "Validate correctness checks and requested compilation";
/** ci-gate `needs` and CI_RESULTS keys at 4e31ff33. */
const BASE_KEYS: Record<string, string> = {
  ...{ plan: "compilation-plan", format: "format", integrity: "integrity" },
  ...{
    lint: "lint",
    typecheck: "typecheck",
    unit: "test-unit",
    build: "build",
  },
};
const res = (id: string) => `\${{ needs.${id}.result }}`;
const forks = W.EVENT_SCENARIOS.filter((s) => s.fork);
type R = Record<string, string>;
const outs = (requested: string) => ({ "compilation-plan": { requested } });
const runGate = (r: R, s: W.EventScenario, requested = "true") => {
  const results = W.buildNeedResultsForGateJob(gate(), r);
  return W.executeGateJob(gate(), { results, outputs: outs(requested) }, s);
};
/** The real `ci-gate` policy CLI (`--gate`) with a given CI_RESULTS. */
const policyGate = (results: R, requested = "true") => {
  const env = { PATH: process.env.PATH, CI_BUILD_REQUESTED: requested };
  const argv = ["scripts/verify/ci-build-policy.mjs", "--gate"];
  const CI_RESULTS = JSON.stringify(results);
  return spawnSync(process.execPath, argv, { env: { ...env, CI_RESULTS } })
    .status;
};
const keys = [...Object.keys(BASE_KEYS), "acceptance"];
const allOk: R = Object.fromEntries(keys.map((k) => [k, "success"]));

describe("#2153 criterion 1: a check named exactly acceptance-tests runs the suite", () => {
  it("ci.yml has job id acceptance-tests with no check-renaming name:", () => {
    expect(Object.keys(jobs())).toContain(ID);
    expect(job().name).toBeUndefined();
  });
  it("one step runs exactly `bun run test:acceptance`, after bun ci, within 15 minutes", () => {
    const runs = W.allSteps(job()).map((s) => s.run?.trim());
    const install = runs.indexOf("bun ci --no-cache --backend=copyfile");
    expect(install).toBeGreaterThan(-1);
    expect(runs.indexOf("bun run test:acceptance")).toBeGreaterThan(install);
    expect(runs.filter((r) => r?.includes("test:acceptance"))).toHaveLength(1);
    expect(job()["timeout-minutes"]).toBe(15);
  });
  it("package.json test:acceptance is the fail-closed runner, never --passWithNoTests", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts["test:acceptance"]).toBe(
      "node scripts/verify/acceptance-tests.mjs",
    );
    const runner = readFileSync("scripts/verify/acceptance-tests.mjs", "utf8");
    expect(runner + JSON.stringify(job())).not.toMatch(/passWithNoTests/i);
  });
});

describe("#2153 criterion 2: acceptance-tests never concludes skipped", () => {
  it("no job-level if:, needs, continue-on-error or reusable-workflow call", () => {
    for (const key of "if needs continue-on-error uses strategy".split(" ")) {
      expect(job()[key], key).toBeUndefined();
    }
  });
  it.each(W.EVENT_SCENARIOS.map((s) => [s.label, s] as const))(
    "%s: the job and every step (incl. the test step) run; none may error out",
    (_label, s) => {
      const ctx = W.scenarioContext(s, {});
      const jobIf = W.ifExpression(job()) || undefined;
      expect(W.evaluateIfCondition(jobIf, ctx)).toBe(true);
      for (const step of W.allSteps(job())) {
        const id = W.stepIdentity(step);
        expect(W.evaluateIfCondition(step.if, ctx), id).toBe(true);
        expect(step["continue-on-error"], id).toBeUndefined();
      }
    },
  );
});

describe("#2153 criterion 4: hosted runner, no secrets/vars/permissions", () => {
  it("runs-on is exactly ubuntu-latest (no fork-aware or self-hosted labels)", () => {
    expect(job()["runs-on"]).toBe("ubuntu-latest");
  });
  it("references no secrets.*, github.token or vars.*; no permissions/environment/container", () => {
    expect(W.referencesSecrets(job())).toBe(false);
    const forbidden = /\bvars\s*[.[]|github\s*\.\s*token|TURBO_/i;
    expect(JSON.stringify(job())).not.toMatch(forbidden);
    for (const key of "permissions environment container services".split(" ")) {
      expect(job()[key], key).toBeUndefined();
    }
  });
  it("every checkout sets persist-credentials: false", () => {
    const checkouts = W.checkoutSteps(job());
    expect(checkouts.length).toBeGreaterThan(0);
    for (const s of checkouts)
      expect(s.with?.["persist-credentials"]).toBe(false);
  });
  it("self-hosted jobs in ci.yml are still exactly build, test-unit", () => {
    const all = Object.entries(jobs());
    const self = all.filter(([, j]) => W.isSelfHostedJob(j)).map(([id]) => id);
    expect(self.sort()).toEqual(["build", "test-unit"]);
  });
});

describe("#2153 criterion 5: ci-gate fails closed unless acceptance-tests succeeded", () => {
  it("ci-gate needs acceptance-tests and wires its own result into CI_RESULTS.acceptance", () => {
    const needs = [...Object.values(BASE_KEYS), ID].sort();
    expect(W.needsList(gate()).sort()).toEqual(needs);
    const step = W.findCiGateResultsStep(gate());
    const parsed = JSON.parse(String(step?.env?.CI_RESULTS));
    const base = Object.entries(BASE_KEYS).map(([k, id]) => [k, res(id)]);
    const want = { ...Object.fromEntries(base), acceptance: res(ID) };
    expect(parsed).toStrictEqual(want);
  });
  it("executed gate passes only on success, for every modelled event (incl. merge_group)", () => {
    const all = W.EVENT_SCENARIOS;
    expect(W.gateEnforcementProblems(gate(), [ID], all, outs("true"))).toEqual(
      [],
    );
  });
  it.each(OUTCOMES)(
    "build legitimately skipped + acceptance-tests %s: gate passes only on success",
    (outcome) => {
      for (const s of W.EVENT_SCENARIOS.filter((x) => !x.fork)) {
        const run = runGate({ build: "skipped", [ID]: outcome }, s, "false");
        expect(run.jobRan, s.label).toBe(true);
        const passed = run.status === 0;
        expect(passed, `${s.label}: ${run.stdout}`).toBe(outcome === "success");
      }
    },
  );
  it.each([
    ["missing (old CI_RESULTS)", undefined],
    ["empty", ""],
    ["skipped", "skipped"],
    ["neutral", "neutral"],
    ["cancelled", "cancelled"],
  ])(
    "policy --gate rejects acceptance %s (with or without a build)",
    (_, v) => {
      const { acceptance: _a, ...rest } = allOk;
      const results = v === undefined ? rest : { ...rest, acceptance: v };
      expect(policyGate(results)).toBe(1);
      expect(policyGate({ ...results, build: "skipped" }, "false")).toBe(1);
    },
  );
  it("policy --gate control: all success (and legitimate build skip) passes", () => {
    expect(policyGate(allOk)).toBe(0);
    expect(policyGate({ ...allOk, build: "skipped" }, "false")).toBe(0);
  });
});

describe("#2153 criterion 6: fork-PR fail-closed behaviour unchanged", () => {
  it.each(["true", "false"])(
    "fork PRs (build/test-unit skipped, acceptance-tests success, requested=%s) fail the gate",
    (requested) => {
      expect(forks.length).toBeGreaterThan(0);
      for (const s of forks) {
        const r = { build: "skipped", "test-unit": "skipped", [ID]: "success" };
        const run = runGate(r, s, requested);
        expect([run.jobRan, run.status !== 0], s.label).toEqual([true, true]);
      }
    },
  );
});

describe("#2153 criterion 10: nothing else in ci.yml changes", () => {
  it("ci.yml minus the acceptance-tests job and ci-gate needs/CI_RESULTS matches 4e31ff33", () => {
    const d = doc() as W.WorkflowDocument & { jobs: W.WorkflowJobs };
    delete d.jobs[ID];
    delete d.jobs["ci-gate"]!.needs;
    const steps = W.allSteps(d.jobs["ci-gate"]!);
    const step = steps.find((s) => s.name === RESULTS_STEP);
    delete (step?.env as Record<string, unknown> | undefined)?.CI_RESULTS;
    const print = createHash("sha256").update(JSON.stringify(d)).digest("hex");
    expect(print.slice(0, 16)).toBe("5965edc843d252bf");
  });
});
