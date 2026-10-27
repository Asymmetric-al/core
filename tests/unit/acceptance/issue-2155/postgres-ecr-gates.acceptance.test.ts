/**
 * Acceptance tests for #2155 (postgres from ECR Public; gate root-cause line).
 * Owned by Acceptance. Spec (base 4e31ff33) and approval:
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367102104
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367121666
 * Addendum 1 (A1-A4, approved):
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367407479
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as W from "../issue-2158/workflow-yaml";

type Scenario = W.EventScenario;
const CII = ".github/workflows/ci-integration.yml";
const raw = readFileSync(CII, "utf8");
const doc = W.parseWorkflowSource(raw);
const jobs = W.workflowJobs(doc, CII);
const docs = readFileSync("docs/ci.md", "utf8");

const DIGEST =
  "sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";
const IMAGE = `public.ecr.aws/docker/library/postgres:17.11-alpine@${DIGEST}`;
const SERVICE_JOBS = ["migrate", "smoke", "test-e2e-smoke", "test-e2e"];
const RESULTS = ["success", "failure", "cancelled", "skipped"] as const;
const OWN_SKIP =
  "test-e2e-smoke skipped by its own condition (same-repo guard)";
/** Every scenario a gate runs under, incl. fork PRs and merge_group. */
const SCENARIOS = W.EVENT_SCENARIOS;
const MG = SCENARIOS.find((s) => s.label.startsWith("merge_group"))!;
const FORKS = SCENARIOS.filter((s) => s.fork);

type Containers = Record<string, Record<string, unknown>>;
/** Every service/container block in the workflow, keyed `job/name`. */
const containers = (): Containers =>
  Object.fromEntries(
    Object.entries(jobs).flatMap(([id, job]) => {
      const services = (job.services ?? {}) as Containers;
      const entries = Object.entries(services).map(([n, s]) => [
        `${id}/${n}`,
        s,
      ]);
      if (job.container) entries.push([`${id}/(container)`, job.container]);
      return entries as [string, Record<string, unknown>][];
    }),
  );

const combos = (ids: readonly string[]): Record<string, string>[] =>
  ids.reduce<Record<string, string>[]>(
    (acc, id) => acc.flatMap((c) => RESULTS.map((r) => ({ ...c, [id]: r }))),
    [{}],
  );
const run = (id: string, results: Record<string, string>, s: Scenario) =>
  W.executeGateJob(jobs[id]!, { results }, s);
/**
 * Scope ruling: the §1.2 own-condition wording may appear on a separate log
 * line but is not tested (neither required nor forbidden), so it is ignored.
 */
const rootCauses = (stdout: string) =>
  stdout
    .split("\n")
    .filter((line) => line.trim().startsWith("Root cause:"))
    .filter((line) => !line.includes(OWN_SKIP));

/**
 * Addendum 1 (A1) and §1.2: a gate passes only when every listed need
 * succeeded; otherwise the root cause is the first non-success in this order,
 * for every combination (including ones GitHub cannot produce). null = pass.
 */
const SMOKE_NEEDS = ["migrate", "smoke", "test-e2e-smoke"];
const ORDER = ["migrate", "smoke", "e2e-smoke-gate"];
const firstCause = (order: string[], r: Record<string, string>) => {
  const id = order.find((n) => r[n] !== "success");
  return id === undefined ? null : `${id} (${r[id]})`;
};

describe("#2155 criterion 1: every postgres image comes from ECR Public, pinned", () => {
  it("exactly the four service jobs pull the one pinned ECR Public image", () => {
    const images = Object.entries(containers()).map(([k, c]) => [k, c.image]);
    expect(images).toEqual(SERVICE_JOBS.map((id) => [`${id}/postgres`, IMAGE]));
  });
  it("every raw image: line is byte-identical (no anchors, expressions or Docker Hub)", () => {
    const lines = raw.split("\n").filter((l) => /^\s*image\s*:/.test(l));
    expect(lines.map((l) => l.trim())).toEqual(
      Array(4).fill(`image: ${IMAGE}`),
    );
    expect(raw).not.toMatch(/docker\.io|registry-1\.docker|[\s"']postgres:\S/);
    expect(raw).not.toMatch(/[&*][A-Za-z0-9_-]+\s*$/m);
  });
});

describe("#2155 criterion 2: no credentials anywhere; fork jobs stay safe", () => {
  it.each(Object.entries(containers()))(
    "%s has no credentials or secret",
    (_, c) => {
      expect(Object.keys(c)).not.toContain("credentials");
      expect(W.referencesSecrets(c)).toBe(false);
      expect(JSON.stringify(c)).not.toMatch(/secrets|github\.token|\$\{\{/);
    },
  );
  it.each(["migrate", "smoke"])(
    "%s still passes the #2158 fork model",
    (id) => {
      expect(W.forkRejectProblems(jobs[id]!)).toEqual([]);
      expect(W.requiredJobFailsClosedOnFork(jobs[id]!)).toBe(true);
      expect(W.jobLevelReferencesSecrets(jobs[id]!)).toBe(false);
    },
  );
});

describe("#2155 criterion 3: docs/ci.md documents the image source", () => {
  const section =
    /\n## Integration workflow[\s\S]*?(?=\n## )/.exec(docs)?.[0] ?? "";
  it("names registry, tag and digest; drops the stale postgres:15 text", () => {
    expect(section).toContain("public.ecr.aws/docker/library/postgres");
    expect(section).toContain("17.11-alpine");
    expect(section).toContain(DIGEST);
    expect(docs).not.toContain("postgres:15");
  });
  it("says no secret/credential is required", () => {
    expect(section).toMatch(
      /\b(no|not|without)\b[^.\n]*\b(secrets?|credentials?)\b|\b(secrets?|credentials?)\b[^.\n]*\bnot (required|needed)\b/i,
    );
  });
});

describe("#2155 criteria 4-5 (addendum 1 A1): e2e-smoke-gate pass/fail and root cause", () => {
  const gate = jobs["e2e-smoke-gate"]!;
  it("needs migrate, smoke, test-e2e-smoke; stays always() on ubuntu-slim", () => {
    expect(W.needsList(gate)).toEqual(["migrate", "smoke", "test-e2e-smoke"]);
    expect(W.isAlwaysExpression(W.ifExpression(gate))).toBe(true);
    expect(gate["runs-on"]).toBe("ubuntu-slim");
    expect(W.allSteps(gate).map((s) => s.name)).toEqual([
      "Fail if E2E smoke failed",
    ]);
  });
  for (const s of SCENARIOS) {
    it(`${s.label}: passes only on all-success; exact first-non-success Root cause`, () => {
      for (const r of combos(SMOKE_NEEDS)) {
        const ex = run("e2e-smoke-gate", r, s);
        const want = firstCause(SMOKE_NEEDS, r);
        const tag = JSON.stringify(r);
        expect(ex.jobRan, tag).toBe(true);
        expect(ex.status === 0, tag).toBe(want === null);
        expect(ex.stdout, tag).not.toContain(W.FORK_FAIL_MESSAGE);
        const lines = rootCauses(ex.stdout).map((l) => l.trim());
        // A1 governs every row, incl. the own-condition skip (Scope ruling).
        expect(lines, tag).toEqual(
          want === null ? [] : [`Root cause: ${want}`],
        );
      }
    });
  }
  it("an empty/unknown result fails and blames test-e2e-smoke", () => {
    const ex = run(
      "e2e-smoke-gate",
      { migrate: "success", smoke: "success", "test-e2e-smoke": "" },
      MG,
    );
    expect(ex.status).not.toBe(0);
    expect(rootCauses(ex.stdout).map((l) => l.trim())).toEqual([
      "Root cause: test-e2e-smoke ()",
    ]);
  });
  it("logs all three need results", () => {
    const r = {
      migrate: "cancelled",
      smoke: "failure",
      "test-e2e-smoke": "skipped",
    };
    const out = run("e2e-smoke-gate", r, MG).stdout;
    for (const [id, v] of Object.entries(r)) {
      expect(out).toMatch(new RegExp(`^\\W*${id}\\W[^\\n]*\\b${v}\\b`, "m"));
    }
  });
  it("fails closed on any non-success of any need (#2158/#2160 harness)", () => {
    expect(W.gateEnforcementProblems(gate, SMOKE_NEEDS)).toEqual([]);
    expect(
      W.hostedGateFailsClosedWhenHeavyNeedsSkipped(gate, SMOKE_NEEDS),
    ).toBe(true);
  });
});

describe("#2155 criterion 7: integration-gate names the first non-success", () => {
  for (const s of SCENARIOS) {
    it(`${s.label}: passes only when all three succeed`, () => {
      for (const r of combos(ORDER)) {
        const ex = run("integration-gate", r, s);
        const want = firstCause(ORDER, r);
        const tag = JSON.stringify(r);
        expect(ex.status === 0, tag).toBe(want === null);
        const lines = rootCauses(ex.stdout).map((l) => l.trim());
        expect(lines.length, tag).toBe(want === null ? 0 : 1);
        if (want === null) continue;
        const esc = want.replace(/[()]/g, "\\$&");
        expect(lines[0], tag).toMatch(
          new RegExp(`^Root cause: ${esc}(?:$|[^\\w(])`),
        );
      }
    });
  }
});

describe("#2155 criterion 6: fork PRs stay red end to end", () => {
  const fork = {
    migrate: "failure",
    smoke: "failure",
    "test-e2e-smoke": "skipped",
  };
  it.each(FORKS.map((s) => [s.label, s]))(
    "%s: both gates fail, blaming migrate",
    (_, s) => {
      const smokeGate = run("e2e-smoke-gate", fork, s);
      expect(smokeGate.status).not.toBe(0);
      expect(rootCauses(smokeGate.stdout).map((l) => l.trim())).toEqual([
        "Root cause: migrate (failure)",
      ]);
      const integ = run(
        "integration-gate",
        { ...fork, "e2e-smoke-gate": "failure" },
        s,
      );
      expect(integ.status).not.toBe(0);
      expect(rootCauses(integ.stdout)[0]?.trim()).toMatch(
        /^Root cause: migrate \(failure\)/,
      );
    },
  );
});

describe("#2155 criterion 8: merge_group with test-e2e skipped", () => {
  it("test-e2e is skipped, yet both gates pass when the rest is green", () => {
    const ctx = W.scenarioContext(MG, {
      smoke: { result: "success", outputs: {} },
    });
    expect(W.evaluateIfCondition(W.ifExpression(jobs["test-e2e"]!), ctx)).toBe(
      false,
    );
    for (const id of ["e2e-smoke-gate", "integration-gate"]) {
      expect(W.needsList(jobs[id]!)).not.toContain("test-e2e");
      expect(W.needsList(jobs[id]!)).not.toContain("instant-nav");
      const ok = Object.fromEntries(
        W.needsList(jobs[id]!).map((n) => [n, "success"]),
      );
      const ex = run(id, ok, MG);
      expect([ex.jobRan, ex.status, rootCauses(ex.stdout)]).toEqual([
        true,
        0,
        [],
      ]);
    }
  });
});

describe("#2155 criterion 9: nothing else in ci-integration.yml changes", () => {
  /** Whole workflow minus the three regions #2155 owns (spec §8). */
  const surface = (d: W.WorkflowDocument) => {
    const copy = structuredClone(d);
    const js = copy.jobs as W.WorkflowJobs;
    for (const job of Object.values(js)) {
      for (const svc of Object.values((job.services ?? {}) as Containers))
        delete svc.image;
    }
    delete js["e2e-smoke-gate"]!.needs;
    for (const id of ["e2e-smoke-gate", "integration-gate"]) {
      for (const step of W.allSteps(js[id]!)) step.run = "<owned by #2155>";
    }
    return createHash("sha256")
      .update(JSON.stringify(copy))
      .digest("hex")
      .slice(0, 16);
  };
  /**
   * Accepted surface fingerprints, CI_BASES-style: one entry per reviewed
   * ci-integration.yml. A later spec'd step (e.g. #2250) adds exactly one
   * entry after its diff is reviewed; any unlisted surface fails.
   */
  const SURFACES = [
    // develop: 4e31ff33 (= develop c541b84b)
    { ref: "develop c541b84b", hash: "bc8d57a2be564d61" },
    // #2254: Builder ea6878ad adds the migrate identity real-stack step
    { ref: "#2254 Builder ea6878ad", hash: "583578adf0fa92db" },
    // #2250: Builder 0cdce1bd adds the last migrate step (tenant isolation)
    { ref: "#2250 Builder 0cdce1bd", hash: "0aa8f1258b667d40" },
    // #2270: Builder b671a0e3 adds migrate step 17 (authz EXECUTE grants)
    { ref: "#2270 Builder b671a0e3", hash: "a3a581fb1e366a32" },
    // #2251: Builder 2039d580 adds migrate step 18 (tenant table RLS posture)
    { ref: "#2251 Builder 2039d580", hash: "57928e0ae6a0a428" },
    // #2255: Builder 6446bb59 adds migrate step 19 (claim tables)
    { ref: "#2255 Builder 6446bb59", hash: "52490f9e8ed02dcd" },
    // #2252: Builder 03a8d5b2 adds migrate step 19 (donor spine composite FKs)
    { ref: "#2252 Builder 03a8d5b2", hash: "d53818aa481a0738" },
    // #2252 synced on develop d1f0af94: Builder 70d1497a, donor spine step moves to migrate 20 (after #2255's 19)
    { ref: "#2252 Builder 70d1497a", hash: "1672e709e8080c86" },
    // #2253: Builder 88aeebc2 adds migrate step 19 (RLS catalog gate)
    { ref: "#2253 Builder 88aeebc2", hash: "ec63a22095a74446" },
    // #2253 sync: Builder c9f11d54 (develop d1f0af94 merged) has both, #2253's step now 20
    { ref: "#2253 Builder c9f11d54", hash: "06b4d8a5c2f60255" },
    // #2253 sync2: Builder 18d490e9 (develop c4d4fbc5 merged) has #2252's step 20, #2253's step now 21
    { ref: "#2253 Builder 18d490e9", hash: "5cd8e2ab83707292" },
    // #2256: Builder 157724da (develop 0727d810 merged) appends the issue-2256 real-stack path to tenant isolation
    { ref: "#2256 Builder 157724da", hash: "8b308b93d56c32b1" },
    // #2260: Builder e1657b68 (develop e25d7727 merged, after #2256) appends the issue-2260 real-stack path to tenant isolation
    { ref: "#2260 Builder e1657b68", hash: "cc73ff47ddb1fb60" },
    // #2258: Builder c3f71ffe (on develop a1375d46, after #2260) appends the issue-2258 real-stack path to tenant isolation
    { ref: "#2258 Builder c3f71ffe", hash: "ba8686b43db76750" },
    // #2312: Builder e518a845 (develop f8ef44f8 merged, after #2258) appends the issue-2312 real-stack path to tenant isolation
    { ref: "#2312 Builder e518a845", hash: "52e534b2e20a3ae2" },
    { ref: "#2402 Builder 28ac3c13", hash: "999bf6013d1b18ca" },
    // #2406 spec r2 §10: develop 2b028084 + the issue-2406 real-stack path appended to tenant isolation
    { ref: "#2406 Acceptance on 2b028084", hash: "5bfe15e378e3eb02" },
  ] as const;
  it("triggers, permissions, concurrency, runs-on, if:, needs, services, steps match a reviewed ci-integration.yml", () => {
    expect(
      SURFACES.map((s) => s.hash),
      `surface ${surface(doc)} is not a reviewed ci-integration.yml`,
    ).toContain(surface(doc));
  });
  it("integration-gate needs are unchanged", () => {
    expect(W.needsList(jobs["integration-gate"]!)).toEqual(ORDER);
  });
});
