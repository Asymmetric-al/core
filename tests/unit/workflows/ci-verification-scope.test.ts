/**
 * Workflow structure for openspec/changes/rebalance-ci-test-scope: where the
 * unit selection gets its change set, the design-system verifier in lint,
 * the failure-only debug-prerender rebuild, the parallel browser smoke and
 * the instant-nav trigger. It reads parsed workflow structure, never bytes.
 */
import { describe, expect, it } from "vitest";

import {
  EVENT_SCENARIOS,
  evaluateFlag,
  evaluateIfCondition,
  loadWorkflowJobs,
  needsList,
  scenarioContext,
  type WorkflowJob,
} from "../helpers/workflow-yaml";

type Step = Record<string, unknown> & {
  name?: string;
  run?: string;
  uses?: string;
  if?: string;
  id?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
};

const CI = loadWorkflowJobs(".github/workflows/ci.yml");
const CII = loadWorkflowJobs(".github/workflows/ci-integration.yml");
const stepsOf = (job: WorkflowJob | undefined) =>
  ((job?.steps ?? []) as Step[]).filter(Boolean);
const checkoutOf = (job: WorkflowJob | undefined) =>
  stepsOf(job).find((step) => step.uses?.startsWith("actions/checkout@"));
const PR_SHAS = {
  CI_BASE_SHA: "${{ github.event.pull_request.base.sha }}",
  CI_HEAD_SHA: "${{ github.event.pull_request.head.sha }}",
};

describe("test-unit gives the selection the pull request's change set", () => {
  const job = CI["test-unit"];

  it("runs the unit suite with the pull request base and head", () => {
    const step = stepsOf(job).find((s) => s.run === "bun run test:unit");
    expect(step?.env).toMatchObject(PR_SHAS);
  });

  it("checks out full history so the diff never comes from a shallow clone", () => {
    expect(checkoutOf(job)?.with?.["fetch-depth"]).toBe(0);
  });
});

describe("lint enforces the design-system configuration", () => {
  it("runs verify:shadcn-config as a blocking step", () => {
    const step = stepsOf(CI.lint).find(
      (s) => s.run === "bun run verify:shadcn-config",
    );
    expect(step).toBeDefined();
    expect(step?.if).toBeUndefined();
    expect(step?.["continue-on-error"]).toBeUndefined();
  });
});

describe("a failed build prints prerender diagnostics", () => {
  const steps = stepsOf(CI.build);
  const compile = steps.findIndex((s) => s.name === "Compile requested apps");
  const debug = steps.findIndex((s) =>
    s.run?.includes("scripts/verify/ci-build.mjs --debug-prerender"),
  );

  it("rebuilds failed apps only after a failure, after the compile step", () => {
    expect(debug).toBeGreaterThan(compile);
    expect(compile).toBeGreaterThanOrEqual(0);
    expect(steps[debug]?.if).toBe("failure()");
  });

  it("never adds the flag to the compile step Vercel shares", () => {
    expect(steps[compile]?.run).not.toContain("debug-prerender");
  });

  // Review round 6 (c2.2): without its own limit the rebuild could use up the
  // job's budget, so the job would end cancelled at its limit instead of
  // failed with the compile step's error.
  it("bounds the rebuild by its own timeout, at most half the job's budget", () => {
    const stepLimit = steps[debug]?.["timeout-minutes"];
    const jobLimit = CI.build?.["timeout-minutes"];
    expect(Number.isInteger(stepLimit)).toBe(true);
    expect(stepLimit as number).toBeGreaterThan(0);
    expect(2 * (stepLimit as number)).toBeLessThanOrEqual(jobLimit as number);
  });
});

describe("the required browser smoke starts beside migrate", () => {
  it("test-e2e-smoke waits for no other job", () => {
    expect(needsList(CII["test-e2e-smoke"]!)).toEqual([]);
  });

  it("smoke still waits for migrate and the gate still reads all three", () => {
    expect(needsList(CII.smoke!)).toEqual(["migrate"]);
    expect(needsList(CII["e2e-smoke-gate"]!)).toEqual([
      "migrate",
      "smoke",
      "test-e2e-smoke",
    ]);
  });
});

describe("instant-nav runs on develop pull requests as a non-required job", () => {
  const job = CII["instant-nav"]!;
  const github = (scenario: (typeof EVENT_SCENARIOS)[number]) =>
    scenario.github as { event_name: string; base_ref: string; ref: string };

  it.each(EVENT_SCENARIOS.map((scenario) => [scenario.label, scenario]))(
    "%s",
    (_label, scenario) => {
      const { event_name, base_ref, ref } = github(scenario);
      const expected =
        !scenario.fork &&
        (event_name === "workflow_dispatch" ||
          (event_name === "pull_request" &&
            (base_ref === "production" || base_ref === "develop")) ||
          (event_name === "push" && ref === "refs/heads/production"));
      const ctx = scenarioContext(scenario, {});
      expect(evaluateIfCondition(job.if, ctx)).toBe(expected);
      expect(evaluateFlag(job["continue-on-error"], ctx)).toBe(false);
    },
  );

  const steps = stepsOf(job);
  const scope = steps.find(
    (s) => s.run === "node scripts/verify/instant-navigation-scope.mjs",
  );
  // Every step after the scope step does the guards' work, except the report
  // upload, which runs always().
  const work = steps
    .slice(steps.indexOf(scope!) + 1)
    .filter((step) => step.if !== "always()");

  it("decides from the change set before building, with full history", () => {
    expect(scope?.id).toBeTruthy();
    expect(scope?.env).toMatchObject(PR_SHAS);
    expect(checkoutOf(job)?.with?.["fetch-depth"]).toBe(0);
    expect(work.map((step) => step.name)).toEqual(
      expect.arrayContaining([
        "Install Playwright Chromium",
        "Build donor with the testing API exposed",
        "Start donor production server",
        "Instant navigation guards",
      ]),
    );
  });

  // GitHub renders a step output that was never written as '' ("If you
  // attempt to dereference a nonexistent property, it will evaluate to an
  // empty string"), so '' models a scope step that wrote nothing.
  const RUNS_JOB = EVENT_SCENARIOS.filter((scenario) =>
    evaluateIfCondition(job.if, scenarioContext(scenario, {})),
  );
  it.each(
    RUNS_JOB.flatMap((scenario) =>
      ["true", "false", ""].map(
        (output) => [scenario.label, JSON.stringify(output), scenario] as const,
      ),
    ),
  )(
    "%s with run=%s: only a develop pull request the script clears skips the guards",
    (_label, output, scenario) => {
      const { event_name, base_ref } = github(scenario);
      const ctx = scenarioContext(scenario, {});
      ctx.contexts.steps = {
        [scope!.id!]: { outputs: { run: JSON.parse(output) as string } },
      };
      const expected = !(
        event_name === "pull_request" &&
        base_ref === "develop" &&
        output === '"false"'
      );
      for (const step of work)
        expect(evaluateIfCondition(step.if, ctx), step.name).toBe(expected);
    },
  );

  it("feeds no develop gate; only the production e2e-gate needs it", () => {
    for (const [id, other] of Object.entries(CII))
      if (id !== "e2e-gate")
        expect(needsList(other!), id).not.toContain("instant-nav");
    expect(needsList(CII["e2e-gate"]!)).toContain("instant-nav");
  });
});
