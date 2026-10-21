/**
 * Acceptance tests for GitHub issue #2158 — PR B (`.github/workflows/ci-integration.yml`).
 * Spec (rev 3, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR;
 * change the workflow to match the approved spec instead.
 */

import { describe, expect, it } from "vitest";

import {
  FORK_FAIL_MESSAGE,
  analyzeSelfHostedForkSafety,
  assertMovedJobTimeoutMinutes,
  checkoutSteps,
  containsSameRepoGuard,
  hostedGateFailsClosedWhenHeavyNeedsSkipped,
  forkRejectStepIndex,
  ifExpression,
  isAlwaysExpression,
  isForkAwareRunsOnExpression,
  isHostedUbuntuLatest,
  isHostedUbuntuSlim,
  isSelfHostedJob,
  isSelfHostedRunsOn,
  jobRunsOn,
  loadWorkflowJobs,
  needsList,
  requiredJobFailsClosedOnFork,
} from "./workflow-yaml";

const WORKFLOW_PATH = ".github/workflows/ci-integration.yml";

type RunsOnExpectation =
  | "ubuntu-latest"
  | "ubuntu-slim"
  | "self-hosted"
  | "fork-aware";

/** Spec rev 3 before/after table — `runs-on after` for every job in ci-integration.yml. */
const EXPECTED_RUNS_ON: Record<string, RunsOnExpectation> = {
  migrate: "fork-aware",
  smoke: "fork-aware",
  "test-e2e-smoke": "self-hosted",
  "test-e2e": "self-hosted",
  "e2e-smoke-gate": "ubuntu-slim",
  "instant-nav": "self-hosted",
  "integration-gate": "ubuntu-slim",
  "e2e-gate": "ubuntu-latest",
};

/** Spec rev 3 line 358 — exact timeout-minutes where rev 3 states the value for that moved job. */
const MOVED_JOBS = [
  "migrate",
  "smoke",
  "test-e2e-smoke",
  "test-e2e",
  "instant-nav",
] as const;

const MOVED_JOB_EXACT_TIMEOUT_MINUTES: Record<
  (typeof MOVED_JOBS)[number],
  number
> = {
  migrate: 50,
  smoke: 10,
  "test-e2e-smoke": 25,
  "test-e2e": 30,
  "instant-nav": 25,
};

const FORK_AWARE_REQUIRED = ["migrate", "smoke"] as const;

const REQUIRED_CHECK_JOB_IDS = ["migrate", "smoke", "e2e-smoke-gate"] as const;

describe("issue #2158 PR B — ci-integration.yml acceptance", () => {
  const jobs = loadWorkflowJobs(WORKFLOW_PATH);
  const jobIds = Object.keys(jobs).sort();

  it("includes exactly the spec job inventory (no missing/extra jobs)", () => {
    expect(jobIds).toEqual(Object.keys(EXPECTED_RUNS_ON).sort());
  });

  describe("(a) runs-on mapping from spec rev 3 table", () => {
    for (const [jobId, expected] of Object.entries(EXPECTED_RUNS_ON)) {
      it(`${jobId} → ${expected}`, () => {
        const job = jobs[jobId];
        expect(job).toBeDefined();

        const runsOn = jobRunsOn(job);
        switch (expected) {
          case "self-hosted":
            expect(isSelfHostedRunsOn(runsOn)).toBe(true);
            break;
          case "ubuntu-latest":
            expect(isHostedUbuntuLatest(runsOn)).toBe(true);
            break;
          case "ubuntu-slim":
            expect(isHostedUbuntuSlim(runsOn)).toBe(true);
            break;
          case "fork-aware":
            expect(isForkAwareRunsOnExpression(runsOn)).toBe(true);
            break;
          default:
            throw new Error(`Unhandled expectation ${expected}`);
        }
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

  describe("(e) same-repo guard G on moved non-required heavy jobs", () => {
    for (const jobId of ["test-e2e-smoke", "test-e2e"] as const) {
      it(`${jobId} skips fork PRs via G`, () => {
        const expr = ifExpression(jobs[jobId]);
        expect(expr.length).toBeGreaterThan(0);
        expect(containsSameRepoGuard(expr)).toBe(true);
      });
    }

    it("instant-nav keeps production/dispatch if and adds G", () => {
      const expr = ifExpression(jobs["instant-nav"]);
      expect(expr).toContain("workflow_dispatch");
      expect(expr).toContain("production");
      expect(containsSameRepoGuard(expr)).toBe(true);
    });

    it("smoke keeps needs: migrate (fork path uses fork-aware runs-on, not G skip)", () => {
      expect(needsList(jobs.smoke)).toContain("migrate");
      const expr = ifExpression(jobs.smoke);
      if (expr.length > 0) {
        expect(containsSameRepoGuard(expr)).toBe(false);
      }
    });

    it("migrate does not skip fork PRs via G (required checks fail closed instead)", () => {
      const expr = ifExpression(jobs.migrate);
      if (expr.length > 0) {
        expect(containsSameRepoGuard(expr)).toBe(false);
      }
    });
  });

  describe("(e) required migrate/smoke fail closed on fork PRs (spec rev 3)", () => {
    for (const jobId of FORK_AWARE_REQUIRED) {
      it(`${jobId} uses fork-aware runs-on and fails with maintainer message`, () => {
        expect(requiredJobFailsClosedOnFork(jobs[jobId])).toBe(true);
      });
    }
  });

  describe("(e) hosted gates fail closed when heavy needs skipped on fork", () => {
    it("e2e-smoke-gate uses if: always() and needs test-e2e-smoke", () => {
      expect(isAlwaysExpression(ifExpression(jobs["e2e-smoke-gate"]))).toBe(
        true,
      );
      expect(needsList(jobs["e2e-smoke-gate"])).toEqual(["test-e2e-smoke"]);
    });

    it("e2e-smoke-gate fails closed when test-e2e-smoke was skipped", () => {
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(jobs["e2e-smoke-gate"], [
          "test-e2e-smoke",
        ]),
      ).toBe(true);
    });

    it("integration-gate uses if: always() and needs migrate, smoke, e2e-smoke-gate", () => {
      expect(isAlwaysExpression(ifExpression(jobs["integration-gate"]))).toBe(
        true,
      );
      expect(needsList(jobs["integration-gate"])).toEqual([
        "migrate",
        "smoke",
        "e2e-smoke-gate",
      ]);
    });

    it("integration-gate fails closed when fork-driven dependencies were skipped", () => {
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(jobs["integration-gate"], [
          "migrate",
          "smoke",
          "e2e-smoke-gate",
        ]),
      ).toBe(true);
    });
  });

  describe("spec labels on self-hosted jobs", () => {
    it("every self-hosted job uses the proxmox label set", () => {
      for (const jobId of MOVED_JOBS) {
        if (
          FORK_AWARE_REQUIRED.includes(
            jobId as (typeof FORK_AWARE_REQUIRED)[number],
          )
        ) {
          continue;
        }
        expect(isSelfHostedRunsOn(jobRunsOn(jobs[jobId]))).toBe(true);
      }
    });
  });

  describe("fork safety: every self-hosted job, evaluated per event (Reviewer MAJOR)", () => {
    const selfHosted = jobIds.filter((jobId) => isSelfHostedJob(jobs[jobId]));

    it("auto-detected self-hosted jobs are exactly the moved jobs", () => {
      expect(selfHosted).toEqual([...MOVED_JOBS].sort());
    });

    for (const jobId of MOVED_JOBS) {
      const forkReachable = FORK_AWARE_REQUIRED.includes(
        jobId as (typeof FORK_AWARE_REQUIRED)[number],
      );
      it(`${jobId}: fork events ${forkReachable ? "run on hosted ubuntu-* and fail closed at step 0" : "skip it"}; same-repo events resolve to exactly proxmox`, () => {
        const report = analyzeSelfHostedForkSafety(jobs[jobId]);
        expect(report.problems).toEqual([]);
        expect(report.runsForSomeSameRepo).toBe(true);
        expect(report.forkReachable).toBe(forkReachable);
        expect(report.runsForEveryFork).toBe(forkReachable);
        if (forkReachable) {
          expect(forkRejectStepIndex(jobs[jobId])).toBe(0);
        }
      });
    }
  });

  describe("fork fail message is exact (spec rev 3 required checks)", () => {
    it("uses the prescribed maintainer message text from spec rev 3", () => {
      expect(FORK_FAIL_MESSAGE).toBe("fork PRs need a maintainer to run CI");
    });
  });
});
