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

let cachedJob: WorkflowJob | undefined;

// Parsed once, so steps compare by identity across helpers.
function reportJob(): WorkflowJob {
  if (cachedJob) return cachedJob;
  const document = loadWorkflowDocument(".github/workflows/shadscan.yml");
  const jobs = Object.values(document.jobs ?? {});
  expect(jobs).toHaveLength(1);
  cachedJob = jobs[0]!;
  return cachedJob;
}

function steps(): WorkflowStep[] {
  return (reportJob().steps ?? []) as WorkflowStep[];
}

function stepWith(predicate: (step: WorkflowStep) => boolean): WorkflowStep {
  const found = steps().filter(predicate);
  expect(found).toHaveLength(1);
  return found[0]!;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const run = (step: WorkflowStep) => text(step.run);
const uses = (step: WorkflowStep) => text(step.uses);

function context(outcomes: Record<string, string>, pullRequest = true) {
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
function simulate(failing: string[], cancelledDuring?: string) {
  const outcomes: Record<string, string> = {};
  const ran: string[] = [];
  let failed = false;
  let cancelled = false;
  for (const step of steps()) {
    const name = stepName(step);
    const condition = stepCondition(step);
    const shouldRun = truthy(
      evaluateExpression(parseExpression(condition), {
        ...context(outcomes),
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
    const fails =
      failing.some((key) => matches(step, key)) || /\bexit 1\b/.test(run(step));
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
    expect(String(options.path)).toMatch(/shadscan\/shadscan\.raw\.json$/);
    expect(options["if-no-files-found"]).toBe("error");
  });

  it("publishes scores and keeps the job green when the audit succeeds", () => {
    const { ran, failed } = simulate([]);
    expect(ran.some((name) => /upload-artifact|raw report/i.test(name))).toBe(
      true,
    );
    expect(ran).toContain(text(stepWith(publishScores).name));
    expect(ran).not.toContain(text(stepWith(publishUnavailable).name));
    expect(failed).toBe(false);
  });

  it.each([["install"], ["audit"]])(
    "publishes unavailable evidence and fails the job when %s fails",
    (failing) => {
      const { ran, failed } = simulate([failing]);
      const unavailable = stepWith(publishUnavailable);
      expect(ran).toContain(text(unavailable.name));
      expect(ran).not.toContain(text(stepWith(publishScores).name));
      expect(failed).toBe(true);
      // The final step is what turns the job red after publishing.
      const last = steps().at(-1)!;
      expect(ran.at(-1)).toBe(text(last.name));
      // `!cancelled()` still runs after a failed step; unlike `always()`, it
      // does not run once the run is cancelled.
      expect(String(last.if)).toMatch(/!\s*cancelled\(\)/);
      expect(steps().indexOf(unavailable)).toBeLessThan(steps().indexOf(last));
      expect(text(unavailable.if)).toMatch(/!\s*cancelled\(\)/);
    },
  );

  it("publishes unavailable evidence and fails the job when a setup step fails before installation", () => {
    const setupBun = stepWith((step) =>
      uses(step).startsWith("oven-sh/setup-bun@"),
    );
    const { ran, failed, outcomes } = simulate([stepName(setupBun)]);
    expect(outcomes).toMatchObject({ install: "skipped", audit: "skipped" });
    const unavailable = stepWith(publishUnavailable);
    expect(ran).toContain(text(unavailable.name));
    expect(ran).not.toContain(text(stepWith(publishScores).name));
    expect(ran.at(-1)).toBe(text(steps().at(-1)!.name));
    expect(failed).toBe(true);
  });

  it.each([["install"], ["audit"], ["Retain the raw report"]])(
    "publishes nothing and adds no failing step when the run is cancelled during %s",
    (cancelledDuring) => {
      // ci.yml cancels a superseded pull request run when a newer push
      // arrives; the newer run owns the report comment.
      const { ran, failed, cancelled } = simulate([], cancelledDuring);
      expect(cancelled).toBe(true);
      expect(failed).toBe(false);
      expect(ran.at(-1)).toBe(
        stepName(stepWith((step) => matches(step, cancelledDuring))),
      );
      expect(ran).not.toContain(text(stepWith(publishUnavailable).name));
      expect(ran).not.toContain(text(stepWith(publishScores).name));
      expect(ran).not.toContain(text(steps().at(-1)!.name));
      for (const step of steps())
        expect(String(step.if ?? "")).not.toMatch(/\balways\(\)/);
    },
  );

  it("stops a hung installation as a failed step inside the job time limit", () => {
    // A job that reaches its own time limit is cancelled, and a cancelled
    // job publishes nothing. Step limits keep a hung step a failure, so
    // unavailable evidence is still published.
    const job = reportJob();
    const install = stepWith((step) => step.id === "install");
    const audit = stepWith((step) => step.id === "audit");
    expect(install["timeout-minutes"]).toBe(15);
    expect(
      Number(install["timeout-minutes"]) + Number(audit["timeout-minutes"]),
    ).toBeLessThan(Number(job["timeout-minutes"]));
  });

  it("gives both publishers the reporting token and the head commit", () => {
    const job = reportJob();
    expect(
      evaluate(
        String((job.env as Record<string, unknown>).SHADSCAN_HEAD_SHA),
        {},
      ),
    ).toBe(HEAD);
    for (const step of [stepWith(publishScores), stepWith(publishUnavailable)])
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
      (stepWith(publishUnavailable).env as Record<string, unknown>)
        .SHADSCAN_UNAVAILABLE_REASON,
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
