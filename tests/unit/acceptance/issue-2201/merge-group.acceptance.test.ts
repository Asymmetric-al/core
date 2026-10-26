/**
 * Acceptance tests for #2201 (CI on merge_group). Owned by Acceptance. Spec, base b17ce79e:
 * https://github.com/Asymmetric-al/core/issues/2201#issuecomment-6359486159
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { resolveCompilation } from "../../../../scripts/verify/ci-build-policy.mjs";
import * as E from "../../helpers/github-expression";
import * as W from "../issue-2158/workflow-yaml";

type Job = W.WorkflowJob;
type Scenario = W.EventScenario;
const CI = ".github/workflows/ci.yml";
const CII = ".github/workflows/ci-integration.yml";
const text = (file: string) => readFileSync(file, "utf8");
const doc = (file: string) => W.parseWorkflowSource(text(file));
const jobs = (file: string) => W.workflowJobs(doc(file), file);
const evalIf = W.evaluateIfCondition;
const eventOf = (s: Scenario) =>
  (s.github as { event_name: string }).event_name;

const OUT = { requested: "true" };
const TRIGGERS = ["merge_group", "pull_request", "push", "workflow_dispatch"];
/** Jobs reading secrets.* that run under merge_group (criterion 9). */
const MG_SECRET_JOBS = "format lint typecheck build test-unit";
/** test-e2e's job-level `if:` at b17ce79e (the same-repo guard). */
const OLD_E2E_IF =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";
const QUEUE =
  "gh-readonly-queue/develop/pr-2201-b17ce79ebd4b93df71fd0e210056d52da0dfeb92";
const MG: Scenario = {
  label: "merge_group",
  fork: false,
  github: {
    ...{ event_name: "merge_group", repository: W.REPOSITORY, ref_name: QUEUE },
    ...{ ref: `refs/heads/${QUEUE}`, base_ref: "", head_ref: "", event: {} },
  },
};
const ctxFor = (s: Scenario, job: Job, res: Record<string, string> = {}) =>
  W.scenarioContext(s, needs(job, res));
const needs = (job: Job, res: Record<string, string>) =>
  Object.fromEntries(
    W.needsList(job).map((n) => [
      n,
      { result: res[n] ?? "success", outputs: OUT },
    ]),
  );
const allJobs = [CI, CII].flatMap((f) => Object.entries(jobs(f)));
const ids = (pick: (j: Job) => unknown) =>
  allJobs.flatMap(([id, j]) => (pick(j) ? [id] : [])).join(" ");
/** "*" = every need (ci-gate: plan/format/integrity/lint/typecheck/build/unit). */
const heavyOf = (job: Job, heavy: string) =>
  heavy === "*" ? W.needsList(job) : heavy.split(" ");
const usesSecrets = (j: Job) => JSON.stringify(j).includes("secrets");
const runs = (job: Job, res?: Record<string, string>, s = MG) =>
  evalIf(W.ifExpression(job) || undefined, ctxFor(s, job, res));

describe("#2201 criteria 1-3, 13: on: triggers", () => {
  for (const file of [CI, CII]) {
    it(`${file}: on: is exactly the four triggers; merge_group unfiltered`, () => {
      const on = doc(file).on as Record<string, unknown>;
      expect(Object.keys(on).sort()).toEqual(TRIGGERS);
      expect(on.merge_group).toStrictEqual({ types: ["checks_requested"] });
    });
    it(`${file}: other triggers and push.branches byte-for-byte unchanged`, () => {
      expect(text(file)).toContain(
        "\non:\n  workflow_dispatch:\n  pull_request:\n  push:\n    branches: [develop, production]\n",
      );
    });
  }
});

describe("#2201 criteria 4-6: required checks run and fail closed", () => {
  it("compilation plan requests all three apps under merge_group", () => {
    const plan = resolveCompilation({ event: "merge_group", branch: QUEUE });
    expect(plan).toEqual(["admin", "donor", "missionary"]);
  });
  it.each([
    [CI, "ci-gate", "*"],
    [CII, "e2e-smoke-gate", "test-e2e-smoke"],
    [CII, "integration-gate", "migrate smoke e2e-smoke-gate"],
  ])("%s %s runs, passes on success, fails otherwise", (file, id, heavy) => {
    const out = { "compilation-plan": OUT };
    const job = jobs(file)[id]!;
    const gate = W.gateEnforcementProblems(job, heavyOf(job, heavy), [MG], out);
    expect(gate).toEqual([]);
  });
  it.each("build test-unit migrate smoke test-e2e-smoke".split(" "))(
    "%s runs on proxmox with no fork-reject step",
    (id) => {
      const job = { ...jobs(CI), ...jobs(CII) }[id]!;
      const ctx = ctxFor(MG, job);
      expect(runs(job)).toBe(true);
      const labels = W.evaluateRunsOn(job["runs-on"] as string, ctx);
      expect(labels).toEqual(["self-hosted", "linux", "x64", "proxmox"]);
      expect(evalIf(W.FORK_REJECT_IF, ctx)).toBe(false);
    },
  );
  it("smoke does not run unless migrate succeeded", () => {
    expect(runs(jobs(CII).smoke!, { migrate: "failure" })).toBe(false);
  });
});

describe("#2201 criteria 7-9, 16: test-e2e skipped by its job-level if:", () => {
  const ci = jobs(CII);
  it("test-e2e (and e2e-gate) job-level if: is false under merge_group", () => {
    expect(runs(ci["test-e2e"]!)).toBe(false);
    expect(runs(ci["e2e-gate"]!)).toBe(false);
  });
  it("secret users that run under merge_group exclude test-e2e", () => {
    expect(ids((j) => usesSecrets(j) && runs(j))).toBe(MG_SECRET_JOBS);
  });
  it("test-e2e if: matches b17ce79e for every other scenario", () => {
    const job = ci["test-e2e"]!;
    for (const s of W.EVENT_SCENARIOS) {
      if (eventOf(s) === "merge_group") continue;
      for (const smoke of ["success", "failure"]) {
        const ctx = ctxFor(s, job, { smoke });
        expect(runs(job, { smoke }, s), s.label).toBe(evalIf(OLD_E2E_IF, ctx));
      }
    }
  });
});

describe("#2201 criteria 9-12: threat-model invariants pinned at b17ce79e", () => {
  it("permissions, secret users and environment unchanged", () => {
    expect([CI, CII].map((f) => doc(f).permissions)).toStrictEqual([
      { contents: "read", "pull-requests": "read" },
      { contents: "read" },
    ]);
    expect(ids((j) => j.permissions)).toBe("shadscan-report ci-gate-comment");
    expect(ids((j) => j.environment)).toBe("");
    expect(ids(usesSecrets)).toBe(`${MG_SECRET_JOBS} test-e2e`);
  });
  it("concurrency unchanged; merge_group group is unique and never cancels", () => {
    for (const prefix of ["ci-", "ci-integration-"]) {
      const cancel = "${{ github.event_name == 'pull_request' }}";
      const groupExpr = "${{ github.event.pull_request.number || github.ref }}";
      expect(doc(prefix === "ci-" ? CI : CII).concurrency).toStrictEqual({
        group: prefix + groupExpr,
        "cancel-in-progress": cancel,
      });
      const group = (s: Scenario) => {
        const g = s.github as { event: object };
        const github = { ...g, event: { pull_request: null, ...g.event } };
        return E.evaluateExpression(E.parseExpression(groupExpr), {
          contexts: { github },
        });
      };
      expect(group(MG)).toBe(`refs/heads/${QUEUE}`);
      const others = W.EVENT_SCENARIOS.filter((s) => eventOf(s) !== MG.label);
      expect(others.map(group)).not.toContain(group(MG));
      expect(evalIf(cancel, W.scenarioContext(MG, {}))).toBe(false);
    }
  });
  it("no pull_request_target; release-source.yml stays its only user", () => {
    const dir = ".github/workflows";
    const users = readdirSync(dir).filter((f) =>
      text(`${dir}/${f}`).includes("pull_request_target"),
    );
    expect(users).toEqual(["release-source.yml"]);
  });
  /**
   * Accepted ci-integration.yml fingerprints, CI_BASES-style: one entry per
   * reviewed file. A later spec'd step (e.g. #2250) adds exactly one entry
   * after its diff is reviewed; any unlisted fingerprint fails.
   */
  const CII_PRINTS = [
    // develop
    { ref: "develop c541b84b", hash: "1078832efaff84e6" },
    // #2254: Builder ea6878ad adds the migrate identity real-stack step
    { ref: "#2254 Builder ea6878ad", hash: "e72e09b4d720835c" },
    // #2250: Builder 0cdce1bd adds the last migrate step (tenant isolation)
    { ref: "#2250 Builder 0cdce1bd", hash: "d49376af6b9ca7e7" },
    // #2270: Builder b671a0e3 adds migrate step 17 (authz EXECUTE grants)
    { ref: "#2270 Builder b671a0e3", hash: "62f202ecfaca7a3f" },
    // #2251: Builder 2039d580 adds migrate step 18 (tenant table RLS posture)
    { ref: "#2251 Builder 2039d580", hash: "4b9f9d19330793f6" },
    // #2255: Builder 6446bb59 adds migrate step 19 (claim tables)
    { ref: "#2255 Builder 6446bb59", hash: "d3893a68b1cf0d6e" },
    // #2252: Builder 03a8d5b2 adds migrate step 19 (donor spine composite FKs)
    { ref: "#2252 Builder 03a8d5b2", hash: "ab8fec8cfaa6a7d3" },
    // #2252 synced on develop d1f0af94: Builder 70d1497a, donor spine step moves to migrate 20 (after #2255's 19)
    { ref: "#2252 Builder 70d1497a", hash: "d6d855999c1bea0b" },
    // #2253: Builder 88aeebc2 adds migrate step 19 (RLS catalog gate)
    { ref: "#2253 Builder 88aeebc2", hash: "edaf3b22c468fb20" },
    // #2253 sync: Builder c9f11d54 (develop d1f0af94 merged) has both, #2253's step now 20
    { ref: "#2253 Builder c9f11d54", hash: "39e8eec12b28c87e" },
    // #2253 sync2: Builder 18d490e9 (develop c4d4fbc5 merged) has #2252's step 20, #2253's step now 21
    { ref: "#2253 Builder 18d490e9", hash: "f7866ec7ed2060ae" },
    // #2256: Builder 157724da (develop 0727d810 merged) appends the issue-2256 real-stack path to tenant isolation
    { ref: "#2256 Builder 157724da", hash: "a41d2f366062b967" },
    // #2260: Builder e1657b68 (develop e25d7727 merged, after #2256) appends the issue-2260 real-stack path to tenant isolation
    { ref: "#2260 Builder e1657b68", hash: "534cbcf817506336" },
    // #2312: Builder 66d63c47 (on develop 88eefbd9, after #2260) appends the issue-2312 real-stack path to tenant isolation
    { ref: "#2312 Builder 66d63c47", hash: "abb961dfc85026c9" },
  ] as const;
  it("nothing but on: and test-e2e's if: changes (fingerprint)", () => {
    const prints = [CI, CII].map((file) => {
      const { on: _on, ...rest } = doc(file);
      delete (rest.jobs as W.WorkflowJobs)["ci-gate-comment"];
      delete (rest.jobs as W.WorkflowJobs)["test-e2e"]?.if;
      return createHash("sha256")
        .update(JSON.stringify(rest))
        .digest("hex")
        .slice(0, 16);
    });
    expect(prints[0], "ci.yml fingerprint").toBe("cd62e4e85c2cc658");
    expect(
      CII_PRINTS.map((p) => p.hash),
      `ci-integration.yml fingerprint ${prints[1]} is not reviewed`,
    ).toContain(prints[1]);
  });
});

describe("#2201 criteria 14-15: #2160 pin and fork model include merge_group", () => {
  it("#2160 PINNED_TRIGGERS is the sorted four-trigger list", () => {
    const src = text(
      "tests/unit/scripts/ci-self-hosted-workflow-mutations.test.ts",
    );
    const pin = /const PINNED_TRIGGERS = \[([^\]]*)\];/.exec(src)?.[1] ?? "";
    expect([...pin.matchAll(/"([^"]+)"/g)].map((m) => m[1])).toEqual(TRIGGERS);
  });
  it("EVENT_SCENARIOS has a non-fork merge_group scenario", () => {
    const mg = W.EVENT_SCENARIOS.filter((s) => eventOf(s) === "merge_group");
    expect(mg.length).toBeGreaterThan(0);
    for (const { fork, github } of mg) {
      const g = github as Record<string, string> & { event: object };
      expect([fork, g.base_ref, g.head_ref]).toEqual([false, "", ""]);
      expect("pull_request" in g.event).toBe(false);
      expect(g.ref).toMatch(
        /^refs\/heads\/gh-readonly-queue\/develop\/pr-\d+-[0-9a-f]{40}$/,
      );
    }
    expect([...W.MODELED_TRIGGER_EVENTS]).toEqual(TRIGGERS);
  });
});
