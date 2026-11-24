/**
 * Acceptance tests for #2155 (postgres from ECR Public; gate root-cause line).
 * Owned by Acceptance. Spec (base 4e31ff33) and approval:
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367102104
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367121666
 * Addendum 1 (A1-A4, approved):
 * https://github.com/Asymmetric-al/core/issues/2155#issuecomment-6367407479
 */
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
const IMAGE = `ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine@${DIGEST}`;
const SERVICE_JOBS = ["migrate", "smoke", "test-e2e-smoke", "test-e2e"];
const RESULTS = ["success", "failure", "cancelled", "skipped"] as const;
/** §1.2 own-condition wording; used only by the rootCauses self-check (#2234). */
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
 * Every log line whose trimmed text starts with "Root cause:", with no
 * exceptions (#2234). Scope ruling: the §1.2 own-condition wording may still
 * appear on a separate log line that does not start with "Root cause:" (neither
 * required nor forbidden), but a "Root cause:" line is always counted, even one
 * carrying that wording, so the exactly-one checks below admit no second one.
 */
const rootCauses = (stdout: string) =>
  stdout.split("\n").filter((line) => line.trim().startsWith("Root cause:"));

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

describe("#2234 oracle self-check: rootCauses counts every Root cause line", () => {
  it("a second Root cause line carrying the own-skip text is counted", () => {
    const out = `Root cause: migrate (failure)\nRoot cause: ${OWN_SKIP}`;
    expect(rootCauses(out)).toHaveLength(2);
  });
  it("an indented Root cause line is counted", () => {
    const out =
      "  Root cause: smoke (cancelled)\n\tRoot cause: migrate (failure)";
    expect(rootCauses(out)).toHaveLength(2);
  });
  it("own-condition wording on a non-Root-cause line is not counted", () => {
    const out = `${OWN_SKIP}\nRoot cause: test-e2e-smoke (skipped)`;
    expect(rootCauses(out)).toEqual(["Root cause: test-e2e-smoke (skipped)"]);
  });
});

describe("#2155 criterion 1, amended by AL-2671 (ruling D-16): every postgres image comes from the organization's mirror, pinned", () => {
  it("exactly the four service jobs pull the one pinned mirrored image", () => {
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

describe("#2155 criterion 2, amended by AL-2671 (ruling D-16): only the workflow's own token, no secret; fork jobs stay safe", () => {
  it.each(Object.entries(containers()))(
    "%s pulls with github.actor and github.token and references no secret",
    (_, c) => {
      const { credentials, ...rest } = c;
      expect(credentials).toStrictEqual(W.PINNED_SERVICE_CREDENTIALS);
      expect(W.referencesSecrets(rest)).toBe(false);
      expect(JSON.stringify(rest)).not.toMatch(/secrets|github\.token|\$\{\{/);
      expect(JSON.stringify(c)).not.toMatch(/secrets/);
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
    expect(section).toContain("ghcr.io/asymmetric-al/core-ci-postgres");
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
        // A1 governs every row: every Root cause line counts, exactly one.
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

describe("#2155 criterion 9: integration-gate wiring", () => {
  it("integration-gate needs are unchanged", () => {
    expect(W.needsList(jobs["integration-gate"]!)).toEqual(ORDER);
  });
});
