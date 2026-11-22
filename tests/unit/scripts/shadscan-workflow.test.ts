import { describe, expect, it } from "vitest";

import {
  evaluateExpression,
  parseExpression,
  truthy,
  unwrapExpression,
  usesStatusFunction,
  type ExprValue,
} from "../helpers/github-expression";
import {
  loadWorkflowDocument,
  type WorkflowJob,
  type WorkflowStep,
} from "../helpers/workflow-yaml";

const HEAD = "0123456789abcdef0123456789abcdef01234567";
const MERGE = "fedcba9876543210fedcba9876543210fedcba98";

const { jobs: reportJobs = {} } = loadWorkflowDocument(
  ".github/workflows/shadscan.yml",
);
const scanJob = reportJobs.report!;
const publishJob = reportJobs.publish!;

function steps(job: WorkflowJob = scanJob): WorkflowStep[] {
  return job.steps ?? [];
}

function stepWith(
  predicate: (step: WorkflowStep) => boolean,
  job: WorkflowJob = scanJob,
): WorkflowStep {
  const found = steps(job).filter(predicate);
  expect(found).toHaveLength(1);
  return found[0]!;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const run = (step: WorkflowStep) => text(step.run);
const uses = (step: WorkflowStep) => text(step.uses);

function context(
  outcomes: Record<string, string>,
  pullRequest = true,
  scan = "success",
) {
  return {
    contexts: {
      github: {
        sha: MERGE,
        token: "test-token",
        event_name: pullRequest ? "pull_request" : "push",
        event: { pull_request: pullRequest ? { head: { sha: HEAD } } : null },
      },
      steps: Object.fromEntries(
        Object.entries(outcomes).map(([id, outcome]) => [
          id,
          { outcome, conclusion: outcome },
        ]),
      ),
      needs: { report: { result: scan } },
      runner: { temp: "/runner/temp" },
      env: {},
    } as Record<string, ExprValue>,
  };
}

function evaluate(source: string, outcomes: Record<string, string>) {
  return evaluateExpression(parseExpression(source), context(outcomes));
}

const stepName = (step: WorkflowStep) => text(step.name) || uses(step);
const matches = (step: WorkflowStep, key: string) =>
  step.id === key || stepName(step) === key;

// The runner's reading of a step condition: one without a status function
// runs only while every earlier step succeeded, as if it began `success() &&`.
function stepCondition(step: WorkflowStep): string {
  if (step.if === undefined) return "success()";
  const source = unwrapExpression(String(step.if));
  return usesStatusFunction(parseExpression(source))
    ? source
    : `success() && (${source})`;
}

// Walks the job in order: `always()` ignores earlier failures and
// cancellation, and `!cancelled()` ignores failures but not cancellation. A
// step that runs fails when the scenario says so (or, for this job, when it
// ends in exit 1). `cancelledDuring` cancels the run, as a newer push to the
// pull request does, while that step runs: its outcome is `cancelled` and
// later steps see a cancelled job.
function simulate(
  job: WorkflowJob,
  failing: string[] = [],
  cancelledDuring?: string,
  scan = "success",
) {
  const outcomes: Record<string, string> = {};
  const ran: string[] = [];
  let failed = false;
  let cancelled = false;
  for (const step of steps(job)) {
    const name = stepName(step);
    const condition = stepCondition(step);
    const shouldRun = truthy(
      evaluateExpression(parseExpression(condition), {
        ...context(outcomes, true, scan),
        status: {
          success: !failed && !cancelled,
          failure: failed && !cancelled,
          cancelled,
        },
      }),
    );
    const id = typeof step.id === "string" ? step.id : null;
    if (!shouldRun) {
      if (id) outcomes[id] = "skipped";
      continue;
    }
    ran.push(name);
    if (cancelledDuring !== undefined && matches(step, cancelledDuring)) {
      if (id) outcomes[id] = "cancelled";
      cancelled = true;
      continue;
    }
    const fails = failing.some((key) => matches(step, key));
    if (id) outcomes[id] = fails ? "failure" : "success";
    if (fails) failed = true;
  }
  return { ran, failed, cancelled, outcomes };
}

const publishScores = (step: WorkflowStep) =>
  /node scripts\/shadscan-publish\.mjs "\$RUNNER_TEMP\/shadscan"/.test(
    run(step),
  );
const publishUnavailable = (step: WorkflowStep) =>
  /node scripts\/shadscan-publish\.mjs --unavailable/.test(run(step));

describe("Shadscan reporting workflow", () => {
  it("isolates dependency installation and the audit from write permissions", () => {
    const { jobs = {} } = loadWorkflowDocument(
      ".github/workflows/shadscan.yml",
    );
    const scan = Object.values(jobs).find((job) =>
      job.steps?.some((step) => step.id === "install"),
    );
    const publisher = Object.values(jobs).find((job) =>
      job.steps?.some(publishScores),
    );
    expect(scan?.permissions).toEqual({ contents: "read" });
    expect(publisher).not.toBe(scan);
    expect(publisher?.needs).toBe("report");
    expect(
      publisher?.steps?.some((step) => /bun ci|shadscan:audit/.test(run(step))),
    ).toBe(false);
  });

  it("scans the submitted head commit, not the merge ref, with one checkout", () => {
    const checkouts = steps().filter((step) =>
      uses(step).startsWith("actions/checkout@"),
    );
    expect(checkouts).toHaveLength(1);
    const checkout = checkouts[0]!;
    const options = checkout.with as Record<string, unknown>;
    // A second checkout inside the workspace would add duplicate projects.
    expect(options.path).toBeUndefined();
    expect(options["persist-credentials"]).toBe(false);
    expect(evaluate(String(options.ref), {})).toBe(HEAD);
    expect(
      evaluateExpression(parseExpression(String(options.ref)), {
        contexts: {
          ...context({}, false).contexts,
        },
      }),
    ).toBe(MERGE);
  });

  it("installs, then audits once with a 10-minute limit and no continue-on-error", () => {
    const install = stepWith((step) => step.id === "install");
    expect(run(install)).toMatch(/\bbun ci\b/);
    const audit = stepWith((step) => step.id === "audit");
    expect(run(audit)).toBe(
      'bun run shadscan:audit -- --output "$RUNNER_TEMP/shadscan"',
    );
    expect(audit["timeout-minutes"]).toBe(10);
    expect(audit["continue-on-error"]).toBeUndefined();
    expect(audit.if).toBeUndefined();
    expect(
      steps().filter((step) => /shadscan:audit/.test(run(step))),
    ).toHaveLength(1);
    expect(steps().indexOf(install)).toBeLessThan(steps().indexOf(audit));
  });

  it("uploads the raw report as the shadscan-audit artifact", () => {
    const upload = stepWith((step) =>
      uses(step).startsWith("actions/upload-artifact@"),
    );
    const options = upload.with as Record<string, unknown>;
    expect(options.name).toBe("shadscan-audit");
    expect(String(options.path).trim().split("\n")).toEqual([
      "${{ runner.temp }}/shadscan/shadscan.raw.json",
      "${{ runner.temp }}/shadscan/shadscan.summary.json",
    ]);
    expect(options["if-no-files-found"]).toBe("error");
    const download = stepWith((step) => step.id === "download", publishJob);
    expect(uses(download)).toMatch(/^actions\/download-artifact@[a-f0-9]{40}$/);
    expect(download.with).toEqual({
      name: options.name,
      path: "${{ runner.temp }}/shadscan",
    });
  });

  it("publishes scores when the audit and artifact transfer succeed", () => {
    expect(simulate(scanJob).outcomes.upload).toBe("success");
    const { ran, failed } = simulate(publishJob);
    expect(ran).toContain(stepName(stepWith(publishScores, publishJob)));
    expect(ran).not.toContain(
      stepName(stepWith(publishUnavailable, publishJob)),
    );
    expect(failed).toBe(false);
  });

  it.each(["install", "audit", "upload", "oven-sh/setup-bun"])(
    "reports unavailable evidence when %s fails and retains the scan failure",
    (failing) => {
      const failedStep =
        failing === "oven-sh/setup-bun"
          ? stepName(
              stepWith((step) => uses(step).startsWith("oven-sh/setup-bun@")),
            )
          : failing;
      const scan = simulate(scanJob, [failedStep]);
      expect(scan.failed).toBe(true);
      expect(scan.outcomes.unavailable).toBe("success");
      if (failing === "oven-sh/setup-bun") {
        expect(scan.outcomes).toMatchObject({
          install: "skipped",
          audit: "skipped",
        });
      }
      const condition = unwrapExpression(String(publishJob.if));
      expect(usesStatusFunction(parseExpression(condition))).toBe(true);
      expect(
        evaluateExpression(
          parseExpression(condition),
          context({}, true, "failure"),
        ),
      ).toBe(true);
      const publish = simulate(publishJob, [], undefined, "failure");
      expect(publish.outcomes.download).toBe("skipped");
      expect(publish.ran).toContain(
        stepName(stepWith(publishUnavailable, publishJob)),
      );
      expect(publish.ran).not.toContain(
        stepName(stepWith(publishScores, publishJob)),
      );
    },
  );

  it("publishes unavailable evidence when the report cannot be downloaded", () => {
    const { ran, failed } = simulate(publishJob, ["download"]);
    expect(ran).toContain(stepName(stepWith(publishUnavailable, publishJob)));
    expect(ran).not.toContain(stepName(stepWith(publishScores, publishJob)));
    expect(failed).toBe(true);
  });

  it.each(["install", "audit", "upload"])(
    "publishes nothing when the scan is cancelled during %s",
    (cancelledDuring) => {
      const scan = simulate(scanJob, [], cancelledDuring);
      expect(scan.cancelled).toBe(true);
      expect(scan.outcomes.unavailable).toBe("skipped");
      const condition = parseExpression(
        unwrapExpression(String(publishJob.if)),
      );
      expect(
        evaluateExpression(condition, context({}, true, "cancelled")),
      ).toBe(false);
      expect(
        evaluateExpression(condition, {
          ...context({}, true, "success"),
          status: { success: false, failure: false, cancelled: true },
        }),
      ).toBe(false);
    },
  );

  it("publishes nothing when cancellation interrupts artifact download", () => {
    const { ran, cancelled } = simulate(publishJob, [], "download");
    expect(cancelled).toBe(true);
    expect(ran).not.toContain(stepName(stepWith(publishScores, publishJob)));
    expect(ran).not.toContain(
      stepName(stepWith(publishUnavailable, publishJob)),
    );
  });

  it("stops a hung installation as a failed step inside the job time limit", () => {
    // A job that reaches its own time limit is cancelled, and a cancelled
    // job publishes nothing. Step limits keep a hung step a failure, so
    // unavailable evidence is still published.
    const job = scanJob;
    const install = stepWith((step) => step.id === "install");
    const audit = stepWith((step) => step.id === "audit");
    expect(install["timeout-minutes"]).toBe(15);
    expect(
      Number(install["timeout-minutes"]) + Number(audit["timeout-minutes"]),
    ).toBeLessThan(Number(job["timeout-minutes"]));
  });

  it("gives both publishers the reporting token and the head commit", () => {
    const job = publishJob;
    expect(
      evaluate(
        String((job.env as Record<string, unknown>).SHADSCAN_HEAD_SHA),
        {},
      ),
    ).toBe(HEAD);
    for (const step of [
      stepWith(publishScores, publishJob),
      stepWith(publishUnavailable, publishJob),
    ])
      expect((step.env as Record<string, unknown>).GH_TOKEN).toBe(
        "${{ github.token }}",
      );
    expect(job.permissions).toEqual({
      contents: "read",
      issues: "write",
      "pull-requests": "write",
    });
  });

  it("names which step failed in unavailable evidence", () => {
    const reason = String(
      stepWith((step) => step.id === "unavailable").env?.UNAVAILABLE_REASON,
    );
    expect(evaluate(reason, { install: "failure", audit: "skipped" })).toMatch(
      /installation/i,
    );
    expect(evaluate(reason, { install: "success", audit: "failure" })).toMatch(
      /audit/i,
    );
    // A failed setup step skips installation; it did not fail.
    const skipped = String(
      evaluate(reason, { install: "skipped", audit: "skipped" }),
    );
    expect(skipped).toMatch(/setup/i);
    expect(skipped).not.toMatch(/installation failed/i);
    expect(
      evaluate(reason, {
        install: "success",
        audit: "success",
        upload: "failure",
      }),
    ).toMatch(/uploaded/i);
  });
});

describe("CI keeps Shadscan off the required path", () => {
  const ci = loadWorkflowDocument(".github/workflows/ci.yml");
  const jobs = ci.jobs ?? {};

  it("runs the reusable report job without waiting for integrity", () => {
    const report = jobs["shadscan-report"]!;
    expect(report.uses).toBe("./.github/workflows/shadscan.yml");
    expect(report.needs).toBeUndefined();
  });

  it("leaves ci-gate independent of the report job", () => {
    expect(jobs["ci-gate"]?.needs).not.toContain("shadscan-report");
  });

  it("runs no Shadscan step in integrity", () => {
    const integrity = (jobs.integrity?.steps ?? []) as WorkflowStep[];
    expect(integrity.length).toBeGreaterThan(0);
    for (const step of integrity)
      expect(JSON.stringify(step)).not.toMatch(/shadscan/i);
  });
});
