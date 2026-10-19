/**
 * Acceptance tests for GitHub issue #2158 — PR A (`.github/workflows/ci.yml`).
 * Spec (rev 3, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR;
 * change the workflow to match the approved spec instead.
 */

import { describe, expect, it } from "vitest";

import {
  FORK_FAIL_MESSAGE,
  SAME_REPO_GUARD,
  SELF_HOSTED_LABELS,
  checkoutSteps,
  containsSameRepoGuard,
  gateTreatsSkippedAsFailureOnFork,
  ifExpression,
  isForkAwareRunsOnExpression,
  isHostedUbuntuLatest,
  isSelfHostedRunsOn,
  jobRunsOn,
  jobTimeoutMinutes,
  labelsEqual,
  loadWorkflowJobs,
  needsList,
  normalizeRunsOn,
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
  "ci-gate": "ubuntu-latest",
};

/** Spec rev 3 suggested timeouts (§3 + classification table). */
const EXPECTED_TIMEOUT_MINUTES: Record<string, number> = {
  "compilation-plan": 5,
  format: 10,
  integrity: 10,
  lint: 25,
  typecheck: 10,
  build: 15,
  "test-unit": 25,
  "ci-gate": 5,
};

const MOVED_JOBS = ["build", "test-unit"] as const;

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

  describe("(c) timeout-minutes on every job", () => {
    for (const jobId of jobIds) {
      it(`${jobId} has timeout-minutes`, () => {
        const timeout = jobTimeoutMinutes(jobs[jobId]);
        expect(timeout, `${jobId} missing timeout-minutes`).toBeDefined();
        if (jobId in EXPECTED_TIMEOUT_MINUTES) {
          expect(timeout).toBe(EXPECTED_TIMEOUT_MINUTES[jobId]);
        }
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
    it("build combines existing compilation if with G", () => {
      const expr = ifExpression(jobs.build);
      expect(expr).toContain("compilation-plan.outputs.requested");
      expect(containsSameRepoGuard(expr)).toBe(true);
    });

    it("test-unit skips fork PRs via G", () => {
      const expr = ifExpression(jobs["test-unit"]);
      expect(expr.length).toBeGreaterThan(0);
      expect(containsSameRepoGuard(expr)).toBe(true);
    });

    it("documents guard G for evaluators", () => {
      expect(SAME_REPO_GUARD).toContain("pull_request.head.repo.full_name");
    });
  });

  describe("(e) ci-gate fail-closed when heavy needs skipped on fork PRs", () => {
    it("ci-gate uses if: always()", () => {
      expect(ifExpression(jobs["ci-gate"])).toContain("always()");
    });

    it("ci-gate needs include heavy jobs build and test-unit", () => {
      const needs = needsList(jobs["ci-gate"]);
      expect(needs).toContain("build");
      expect(needs).toContain("test-unit");
    });

    it("ci-gate treats fork-driven skipped heavy needs as failure (spec §3 hosted gates)", () => {
      expect(
        gateTreatsSkippedAsFailureOnFork(jobs["ci-gate"], [
          "build",
          "test-unit",
        ]),
      ).toBe(true);
    });
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

    it("ci-gate does not reference fork maintainer message (hosted gate only)", () => {
      const run =
        jobs["ci-gate"].steps?.map((s) => s.run ?? "").join("\n") ?? "";
      expect(run).not.toContain(FORK_FAIL_MESSAGE);
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
