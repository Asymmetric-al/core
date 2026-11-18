import { describe, expect, it } from "vitest";

import {
  evaluateExpression,
  parseExpression,
  truthy,
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

// Walks the job in order: a step without `if` runs only while every earlier
// step succeeded, `always()` ignores earlier failures, and a step that runs
// fails when the scenario says so (or, for this job, when it ends in exit 1).
function simulate(failing: string[]) {
  const outcomes: Record<string, string> = {};
  const ran: string[] = [];
  let failed = false;
  for (const step of steps()) {
    const name = text(step.name) || uses(step);
    const condition = step.if === undefined ? "success()" : String(step.if);
    const shouldRun = truthy(
      evaluateExpression(parseExpression(condition), {
        ...context(outcomes),
        status: { success: !failed, failure: failed, cancelled: false },
      }),
    );
    const id = typeof step.id === "string" ? step.id : null;
    if (!shouldRun) {
      if (id) outcomes[id] = "skipped";
      continue;
    }
    ran.push(name);
    const fails =
      (id !== null && failing.includes(id)) || /\bexit 1\b/.test(run(step));
    if (id) outcomes[id] = fails ? "failure" : "success";
    if (fails) failed = true;
  }
  return { ran, failed };
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
      expect(String(last.if)).toMatch(/always\(\)/);
      expect(steps().indexOf(unavailable)).toBeLessThan(steps().indexOf(last));
      expect(text(unavailable.if)).toMatch(/always\(\)/);
    },
  );

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
