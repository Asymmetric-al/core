/**
 * Acceptance tests for GitHub issue #2158 — PR A (`.github/workflows/ci.yml`).
 * Spec (rev 3, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR;
 * change the workflow to match the approved spec instead.
 */

import { describe, expect, it } from "vitest";

import {
  SAME_REPO_GUARD,
  SELF_HOSTED_LABELS,
  analyzeSelfHostedForkSafety,
  assertMovedJobTimeoutMinutes,
  checkoutSteps,
  ciGateFailsClosedWhenHeavyNeedsSkippedOnFork,
  ciGatePolicyPassesWhenSameRepoChecksSucceeded,
  ciGateStepReferencesNeedResults,
  containsSameRepoGuard,
  executeCiGateResultsStep,
  findCiGatePolicyStep,
  findCiGateResultsStep,
  ifExpression,
  isAlwaysExpression,
  isForkAwareRunsOnExpression,
  isHostedUbuntuLatest,
  isSelfHostedJob,
  isSelfHostedRunsOn,
  jobRunsOn,
  loadWorkflowJobs,
  needsList,
  labelsEqual,
  normalizeRunsOn,
  normalizeWorkflowExpression,
  stripExpressionWrapper,
} from "./workflow-yaml";

const WORKFLOW_PATH = ".github/workflows/ci.yml";

/** Spec rev 3 before/after table — `runs-on after` for every job in ci.yml. */
const EXPECTED_RUNS_ON: Record<
  string,
  "ubuntu-latest" | "self-hosted" | "workflow-call"
> = {
  "compilation-plan": "ubuntu-latest",
  format: "ubuntu-latest",
  integrity: "ubuntu-latest",
  "shadscan-report": "workflow-call",
  lint: "ubuntu-latest",
  typecheck: "ubuntu-latest",
  build: "self-hosted",
  "test-unit": "self-hosted",
  "acceptance-tests": "ubuntu-latest",
  "ci-gate": "ubuntu-latest",
  "ci-gate-comment": "ubuntu-latest",
};

/** Spec rev 3 line 358 — exact timeout-minutes for moved jobs in ci.yml. */
const MOVED_JOBS = ["build", "test-unit"] as const;

const MOVED_JOB_EXACT_TIMEOUT_MINUTES: Record<
  (typeof MOVED_JOBS)[number],
  number
> = {
  build: 15,
  "test-unit": 25,
};

const REQUIRED_CHECK_JOB_IDS = ["ci-gate"] as const;

describe("issue #2158 PR A — ci.yml acceptance", () => {
  const jobs = loadWorkflowJobs(WORKFLOW_PATH);
  const jobIds = Object.keys(jobs).sort();

  it("includes exactly the spec job inventory (no missing/extra jobs)", () => {
    expect(jobIds).toEqual(Object.keys(EXPECTED_RUNS_ON).sort());
  });

  describe("(a) runs-on mapping from spec rev 3 table", () => {
    for (const [jobId, expected] of Object.entries(EXPECTED_RUNS_ON)) {
      it(`${jobId} → ${expected}`, () => {
        const job = jobs[jobId];
        expect(job, `missing job ${jobId}`).toBeDefined();

        if (expected === "workflow-call") {
          expect(job.uses).toBe("./.github/workflows/shadscan.yml");
          expect(job["runs-on"]).toBeUndefined();
          return;
        }

        const runsOn = jobRunsOn(job);
        if (expected === "self-hosted") {
          expect(
            isSelfHostedRunsOn(runsOn),
            `expected self-hosted labels ${SELF_HOSTED_LABELS.join(", ")}; got ${JSON.stringify(runsOn)}`,
          ).toBe(true);
          return;
        }

        expect(isHostedUbuntuLatest(runsOn)).toBe(true);
        expect(isForkAwareRunsOnExpression(runsOn)).toBe(false);
      });
    }
  });

  describe("(b) required check names unchanged (job id = GitHub check name)", () => {
    for (const checkId of REQUIRED_CHECK_JOB_IDS) {
      it(`job id ${checkId} exists and has no check-renaming name:`, () => {
        const job = jobs[checkId];
        expect(job).toBeDefined();
        expect(job.name).toBeUndefined();
      });
    }

    it("required migrate/smoke/e2e-smoke-gate are out of scope for ci.yml", () => {
      expect(jobs.migrate).toBeUndefined();
      expect(jobs.smoke).toBeUndefined();
      expect(jobs["e2e-smoke-gate"]).toBeUndefined();
    });
  });

  describe("(c) timeout-minutes on moved jobs only (spec rev 3 §3 / line 358)", () => {
    for (const jobId of MOVED_JOBS) {
      it(`${jobId} has timeout-minutes per moved-job rules`, () => {
        expect(() =>
          assertMovedJobTimeoutMinutes(
            jobId,
            jobs[jobId],
            MOVED_JOB_EXACT_TIMEOUT_MINUTES,
          ),
        ).not.toThrow();
      });
    }
  });

  describe("(d) checkout persist-credentials: false on moved jobs", () => {
    for (const jobId of MOVED_JOBS) {
      it(`${jobId} checkouts set persist-credentials: false`, () => {
        const checkouts = checkoutSteps(jobs[jobId]);
        expect(checkouts.length).toBeGreaterThan(0);
        for (const step of checkouts) {
          expect(step.with?.["persist-credentials"]).toBe(false);
        }
      });
    }
  });

  describe("(e) same-repo guard G on moved non-required jobs", () => {
    it("guard G is the exact spec rev 3 expression", () => {
      expect(SAME_REPO_GUARD).toBe(
        "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository",
      );
    });

    it("build combines existing compilation if with the exact guard G, parenthesized", () => {
      const expr = stripExpressionWrapper(ifExpression(jobs.build));
      expect(expr).toContain(
        "needs.compilation-plan.outputs.requested == 'true'",
      );
      // Exact G as one parenthesized operand of &&, so precedence cannot let a
      // fork PR through and an inverted/loosened guard cannot match.
      expect(expr).toContain(`&& (${SAME_REPO_GUARD})`);
      expect(normalizeWorkflowExpression(expr)).toContain(SAME_REPO_GUARD);
      expect(containsSameRepoGuard(expr)).toBe(true);
    });

    it("test-unit if is exactly guard G", () => {
      const expr = stripExpressionWrapper(ifExpression(jobs["test-unit"]));
      expect(expr).toBe(SAME_REPO_GUARD);
      expect(containsSameRepoGuard(expr)).toBe(true);
    });
  });

  describe("(e) ci-gate fail-closed when heavy needs skipped on fork PRs", () => {
    const CI_GATE_NEEDS = [
      "compilation-plan",
      "format",
      "integrity",
      "lint",
      "typecheck",
      "build",
      "test-unit",
      "acceptance-tests",
    ] as const;

    const allSuccess = (): Record<string, string> =>
      Object.fromEntries(CI_GATE_NEEDS.map((id) => [id, "success"]));

    const runGate = (
      overrides: Record<string, string>,
      requested: "true" | "false" = "true",
    ) =>
      executeCiGateResultsStep(jobs["ci-gate"], {
        results: { ...allSuccess(), ...overrides },
        outputs: { "compilation-plan": { requested } },
      });

    it("ci-gate uses if: always()", () => {
      expect(isAlwaysExpression(ifExpression(jobs["ci-gate"]))).toBe(true);
    });

    it("ci-gate needs include heavy jobs build and test-unit", () => {
      const needs = needsList(jobs["ci-gate"]);
      expect(needs).toContain("build");
      expect(needs).toContain("test-unit");
    });

    it("ci-gate step invokes node scripts/verify/ci-build-policy.mjs --gate", () => {
      const step = findCiGateResultsStep(jobs["ci-gate"]);
      expect(step, "ci-gate step with env.CI_RESULTS").toBeDefined();
      expect(normalizeWorkflowExpression(step?.run ?? "")).toBe(
        "node scripts/verify/ci-build-policy.mjs --gate",
      );
      expect(findCiGatePolicyStep(jobs["ci-gate"])).toBe(step);
    });

    it("ci-gate CI_RESULTS is built from needs.*.result for every gate need", () => {
      const step = findCiGateResultsStep(jobs["ci-gate"]);
      expect(step).toBeDefined();
      expect(ciGateStepReferencesNeedResults(step!, CI_GATE_NEEDS)).toBe(true);
      expect(String(step?.env?.CI_BUILD_REQUESTED ?? "")).toMatch(
        /\$\{\{\s*needs\.compilation-plan\.outputs\.requested\s*\}\}/,
      );
    });

    it("executing the ci-gate step passes when every need succeeded", () => {
      const result = runGate({});
      expect(result.status, result.stdout + result.stderr).toBe(0);
    });

    it("executing the ci-gate step fails when fork guard skipped build and test-unit", () => {
      const result = runGate({ build: "skipped", "test-unit": "skipped" });
      expect(result.status, result.stdout + result.stderr).not.toBe(0);
    });

    it("executing the ci-gate step fails when fork guard skipped them with no compilation requested", () => {
      const result = runGate(
        { build: "skipped", "test-unit": "skipped" },
        "false",
      );
      expect(result.status, result.stdout + result.stderr).not.toBe(0);
    });

    for (const heavy of ["build", "test-unit"] as const) {
      for (const outcome of ["skipped", "failure", "cancelled"] as const) {
        it(`executing the ci-gate step fails when ${heavy} is ${outcome} (compilation requested)`, () => {
          const result = runGate({ [heavy]: outcome });
          expect(result.status, result.stdout + result.stderr).not.toBe(0);
        });
      }
    }

    for (const need of CI_GATE_NEEDS) {
      it(`executing the ci-gate step fails when ${need} failed (result is wired from needs)`, () => {
        const result = runGate({ [need]: "failure" });
        expect(result.status, result.stdout + result.stderr).not.toBe(0);
      });
    }

    it("executing the ci-gate step passes when build was legitimately skipped (no compilation requested)", () => {
      const result = runGate({ build: "skipped" }, "false");
      expect(result.status, result.stdout + result.stderr).toBe(0);
    });

    it("ci-gate fails closed when build and test-unit were skipped with compilation requested", () => {
      expect(
        ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(jobs["ci-gate"], [
          "build",
          "test-unit",
        ]),
      ).toBe(true);
    });

    it("ci-gate policy allows same-repo success when heavy jobs succeeded", () => {
      expect(ciGatePolicyPassesWhenSameRepoChecksSucceeded()).toBe(true);
    });
  });

  describe("fork safety: every self-hosted job, evaluated per event (Reviewer MAJOR)", () => {
    const selfHosted = jobIds.filter((jobId) => isSelfHostedJob(jobs[jobId]));

    it("auto-detected self-hosted jobs are exactly build and test-unit", () => {
      expect(selfHosted).toEqual(["build", "test-unit"]);
    });

    for (const jobId of ["build", "test-unit"]) {
      it(`${jobId}: fork events skip it or run on hosted ubuntu-* and fail closed; same-repo events resolve to exactly proxmox`, () => {
        const report = analyzeSelfHostedForkSafety(jobs[jobId]);
        expect(report.problems).toEqual([]);
        expect(report.runsForSomeSameRepo).toBe(true);
        expect(report.forkReachable).toBe(false);
      });
    }
  });

  describe("negative: fork-aware runs-on belongs in ci-integration, not ci.yml", () => {
    it("no ci.yml job uses fork-aware runs-on (migrate/smoke are in PR B)", () => {
      for (const jobId of jobIds) {
        expect(
          isForkAwareRunsOnExpression(jobRunsOn(jobs[jobId])),
          `${jobId} must not use fork-aware runs-on in PR A`,
        ).toBe(false);
      }
    });
  });

  describe("helper: label equality is order-insensitive", () => {
    it("matches self-hosted label arrays in any order", () => {
      expect(
        labelsEqual(
          [...SELF_HOSTED_LABELS].reverse(),
          normalizeRunsOn([...SELF_HOSTED_LABELS]),
        ),
      ).toBe(true);
    });
  });
});
