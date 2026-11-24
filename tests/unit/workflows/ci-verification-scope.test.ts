/**
 * Workflow structure for openspec/changes/rebalance-ci-test-scope: the
 * sharded unit-test job, the design-system verifier in lint, the
 * failure-only debug-prerender rebuild, the parallel browser smoke and the
 * instant-nav trigger. It reads parsed workflow structure, never bytes.
 * tests/unit/scripts/unit-test-shards.test.ts checks which files the shards
 * run.
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

describe("test-unit runs every unit test as shards", () => {
  const job = CI["test-unit"]!;
  const strategy = (job.strategy ?? {}) as Record<string, unknown>;
  const steps = stepsOf(job);
  const tests = steps.find((s) => s.name === "Run unit tests");

  it("lets every shard finish when another fails, so no failure hides another", () => {
    expect(strategy["fail-fast"]).toBe(false);
    expect(strategy["max-parallel"]).toBeUndefined();
  });

  it("hands each shard its index and the shard count, and nothing else", () => {
    expect(tests?.run).toBe(
      "bun run test:unit --shard=${{ matrix.shard }}/${{ strategy.job-total }}",
    );
    expect(tests?.env).toBeUndefined();
    expect(tests?.if).toBeUndefined();
    expect(tests?.["continue-on-error"]).toBeUndefined();
  });

  it("uploads each shard's coverage under its own name", () => {
    const upload = steps.find((s) =>
      s.uses?.startsWith("actions/upload-artifact@"),
    );
    expect(upload?.if).toBe("always()");
    expect(String(upload?.with?.name)).toBe(
      "unit-test-coverage-${{ matrix.shard }}",
    );
  });

  it("is still needed and read by ci-gate, which accepts only success", () => {
    const gate = CI["ci-gate"]!;
    expect(needsList(gate)).toContain("test-unit");
    expect(JSON.stringify(gate.steps)).toContain(
      '\\"unit\\":\\"${{ needs.test-unit.result }}\\"',
    );
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

  it("checks the service-key ceiling against the base right after the comment ratchet (D-18: AL-2671 ruling-pin-tax Q1)", () => {
    const steps = stepsOf(CI.lint);
    const run = "bun run verify:service-role-clients -- --require-base";
    const matching = steps.filter((s) =>
      s.run?.includes("verify:service-role-clients"),
    );
    expect(matching).toHaveLength(1);
    const step = matching[0]!;
    expect(step.run).toBe(run);
    expect(step.if).toBeUndefined();
    expect(step["continue-on-error"]).toBeUndefined();
    expect(step.env).toEqual({
      SERVICE_ROLE_CEILING_BASE:
        "${{ github.event_name == 'pull_request' && format('origin/{0}', github.base_ref) || '' }}",
      SERVICE_ROLE_CEILING_PUSHED_FROM:
        "${{ github.event_name == 'push' && github.event.before || '' }}",
    });
    const ratchet = steps.findIndex(
      (s) => s.name === "Check the comment ratchet",
    );
    expect(ratchet).toBeGreaterThanOrEqual(0);
    expect(steps.indexOf(step)).toBe(ratchet + 1);
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

  // Review round 8 (c2b.1): the scope step ran on every event, so on
  // production a failing helper skipped every guard (the job failed closed,
  // but a release depended on a helper that matters only on develop).
  it.each(RUNS_JOB.map((scenario) => [scenario.label, scenario] as const))(
    "%s: the scope step runs only on a develop pull request",
    (_label, scenario) => {
      const { event_name, base_ref } = github(scenario);
      expect(
        evaluateIfCondition(scope?.if, scenarioContext(scenario, {})),
      ).toBe(event_name === "pull_request" && base_ref === "develop");
    },
  );

  it.each(RUNS_JOB.map((scenario) => [scenario.label, scenario] as const))(
    "%s: a failed scope step runs no guard step, so the job fails",
    (_label, scenario) => {
      const ctx = scenarioContext(scenario, {});
      // It wrote nothing, which GitHub reads as ''.
      ctx.contexts.steps = { [scope!.id!]: { outputs: { run: "" } } };
      ctx.status = { success: false, failure: true, cancelled: false };
      for (const step of work)
        expect(evaluateIfCondition(step.if, ctx), step.name).toBe(false);
    },
  );

  // Review round 8 (c2b.2): production's e2e-gate needs this job, so its
  // steps keep the rule for jobs a required check reaches.
  it("swallows no failure outside failure()-only steps", () => {
    for (const step of steps.filter((s) => s.if !== "failure()"))
      expect(step.run ?? "", step.name).not.toMatch(
        /\|\|\s*(?:true|:|echo)\b|;\s*true\b|\bset\s+\+e/,
      );
  });

  it("feeds no develop gate; only the production e2e-gate needs it", () => {
    for (const [id, other] of Object.entries(CII))
      if (id !== "e2e-gate")
        expect(needsList(other!), id).not.toContain("instant-nav");
    expect(needsList(CII["e2e-gate"]!)).toContain("instant-nav");
  });
});
