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
    "%s runs on hosted Ubuntu without executing fork rejection",
    (id) => {
      const job = { ...jobs(CI), ...jobs(CII) }[id]!;
      const ctx = ctxFor(MG, job);
      expect(runs(job)).toBe(true);
      const labels = W.evaluateRunsOn(job["runs-on"] as string, ctx);
      expect(labels).toEqual(["ubuntu-latest"]);
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
  const CI_PRINTS = [
    { ref: "CI runner fallback", hash: "89fce96b9365d5a9" },
    // Hosted-CI amendment: only build/test-unit runs-on become literal ubuntu-latest.
    { ref: "Hosted CI baseline", hash: "cbe3c295f9dd6832" },
    // Amended by AL-2674 (WP1.2, Payload 4.0.0-beta.9): only NODE_VERSION
    // moved from 24.22.1 to 24.22.3 (.node-version). With that line put back,
    // the fingerprint is the entry above.
    { ref: "AL-2674 Node 24.22.3", hash: "ab279b66def51683" },
  ] as const;
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
    // #2258: Builder c3f71ffe (on develop a1375d46, after #2260) appends the issue-2258 real-stack path to tenant isolation
    { ref: "#2258 Builder c3f71ffe", hash: "8ac7feb33d789d3d" },
    // #2312: Builder e518a845 (develop f8ef44f8 merged, after #2258) appends the issue-2312 real-stack path to tenant isolation
    { ref: "#2312 Builder e518a845", hash: "3e026b8f31f34dda" },
    { ref: "#2402 Builder 28ac3c13", hash: "7755cfddb8cb875c" },
    { ref: "#2364 Builder 0cf86552", hash: "21073c70380a4f90" },
    // #2406: Builder 9563beea (develop 629cb71d merged) appends the issue-2406 real-stack path to tenant isolation
    { ref: "#2406 Builder 9563beea", hash: "925cfd8de36c75a3" },
    // #2407 PR (a): develop after #2406, plus the issue-2407 real-stack path
    { ref: "#2407a after #2406", hash: "beea3b344a58ae76" },
    // GitHub-hosted runner fallback: self-hosted runs-on honour vars.CI_RUNNER_FALLBACK
    { ref: "CI runner fallback after #2407a", hash: "d5c4968b54a5018b" },
    // Hosted-CI amendment: only the five heavy jobs' runs-on become literal ubuntu-latest.
    { ref: "Hosted CI baseline after #2407a", hash: "e2884b2dac1415b3" },
    // Amended by AL-2674 (stage 1 of the AL-2671 program, plan 7.1), the file
    // stage 1 ends on. From the entry above: NODE_VERSION moved from 24.22.1
    // to 24.22.3 (.node-version, Payload 4.0.0-beta.9); migrate step 13
    // ("Verify seed counts") runs scripts/verify/seed-counts.mjs, which reads
    // the expected counts from supabase/seed-expectations.json, so a seed
    // change no longer changes this file; step 22 runs the AL-2671 program's
    // real-stack suites (one glob over issue-2670 to issue-2689), step 23 the
    // release job's suites with Payload's database-role suite and its URL, and
    // step 24 the Payload qualification (plan 6.7). Each step is pinned
    // exactly in tests/unit/helpers/workflow-yaml.ts. Council round 2 (A8d)
    // removed the two intermediate states of stage 1's integration, which
    // develop never held.
    { ref: "AL-2674 seed counts and program steps", hash: "bf3afd9e9950a9f5" },
    // Amended by AL-2675 (WP2b release 1, slices A and B joined; record
    // D-18). The test-e2e job runs the program's five specs on the servers it
    // already started: "Tenant address (admin app)" and "Request scope (admin
    // app)" after the admin boneyard smoke, the same two for the missionary
    // app after its boneyard smoke, and "Request scope (donor app)" after the
    // donor boneyard smoke (bun run test:e2e:tenant-address:* and
    // test:e2e:request-scope:*). Each step has a limit set from measured times
    // (10 minutes for the admin tenant-address step, 5 for the others; the
    // job's 30 unchanged), runs after an earlier failure (if: !cancelled()),
    // and writes its evidence to folders of its own: the donor step has its
    // own report folder and no admin server. All pinned in
    // tests/unit/scripts/ci-integration-workflow.contract.test.ts. Slice A's
    // and slice B's earlier entries were intermediate states of the joined
    // branch, which develop never held, and are replaced by this one.
    // Council on the joined release, JB4 and JB5 (the coordinator's list B):
    // Web Studio's spec leaves the CMS step for a step of its own, "Web
    // Studio tenant (admin app)" (bun run test:e2e:web-studio-tenant, no
    // retries, if: !cancelled(), its own folders, 18 minutes from a measured
    // replay of the whole job); "Start missionary app" and its wait run after
    // an earlier failure; the upload runs on failure or cancellation. The
    // job keeps its 30 minutes. Pinned in the same contract test; the entry
    // before this one was the joined branch's, which develop never held.
    // Check of the fix lists, JR12: each step that needs a server runs after
    // an earlier failure only when that server's health check passed (ids
    // donor-ready, admin-ready and missionary-ready), and the CMS step runs on
    // the Web Studio step's condition, so the Web Studio step never runs
    // cold. Pinned in the same contract test, which now also lists the CMS
    // step's selection to show it leaves the Web Studio spec out.
    {
      ref: "AL-2675 tenant address and request scope in test-e2e",
      hash: "e324361ee00091db",
    },
  ] as const;
  it("non-trigger content matches an individually reviewed fingerprint", () => {
    const prints = [CI, CII].map((file) => {
      const { on: _on, ...rest } = doc(file);
      delete (rest.jobs as W.WorkflowJobs)["ci-gate-comment"];
      delete (rest.jobs as W.WorkflowJobs)["test-e2e"]?.if;
      return createHash("sha256")
        .update(JSON.stringify(rest))
        .digest("hex")
        .slice(0, 16);
    });
    expect(
      CI_PRINTS.map((p) => p.hash),
      `ci.yml fingerprint ${prints[0]} is not reviewed`,
    ).toContain(prints[0]);
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
