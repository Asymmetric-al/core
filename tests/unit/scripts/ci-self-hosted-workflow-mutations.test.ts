/**
 * Mutation coverage for the #2158 self-hosted CI workflow harness
 * (PR #2160 review MAJOR-1..4). Each reviewer mutation is applied to an
 * in-memory copy of the real workflow YAML; the harness must accept the real
 * workflow and reject every mutated copy.
 */

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  EVENT_SCENARIOS,
  FORK_FAIL_MESSAGE,
  FORK_ONLY_STEP_GUARD,
  MODELED_TRIGGER_EVENTS,
  analyzeSelfHostedForkSafety,
  evaluateIfCondition,
  executeCiGateResultsStep,
  forkRejectStepIndex,
  gateEnforcementProblems,
  hostedGateFailsClosedWhenHeavyNeedsSkipped,
  ifExpression,
  isForkAwareRunsOnExpression,
  isForkRejectStep,
  isSelfHostedJob,
  needsList,
  parseWorkflowSource,
  requiredJobFailsClosedOnFork,
  scenarioContext,
  unmodeledTriggerEvents,
  workflowJobs,
  workflowTriggerEvents,
  type WorkflowJob,
  type WorkflowJobs,
  type WorkflowStep,
} from "../helpers/workflow-yaml";

const CI = ".github/workflows/ci.yml";
const CI_INTEGRATION = ".github/workflows/ci-integration.yml";
const WORKFLOWS = [CI, CI_INTEGRATION] as const;
type WorkflowPath = (typeof WORKFLOWS)[number];

/** The only triggers allowed on workflows that host self-hosted jobs. */
const PINNED_TRIGGERS = ["pull_request", "push", "workflow_dispatch"];
const PINNED_PUSH_BRANCHES = ["develop", "production"];

const PROXMOX_FROM_JSON = `fromJSON('["self-hosted", "linux", "x64", "proxmox"]')`;

const source = (file: WorkflowPath): string => readFileSync(file, "utf8");

/**
 * Replace every `from` with `to`, asserting the hit count so a drifted
 * workflow can never turn a mutation into a silent no-op.
 */
function mutate(
  text: string,
  from: string,
  to: string,
  expectedCount: number,
): string {
  expect(text.split(from).length - 1, `occurrences of ${from}`).toBe(
    expectedCount,
  );
  return text.split(from).join(to);
}

/** Add a step-level key line right after the step's `- name:` line. */
function addStepKey(text: string, stepName: string, keyLine: string): string {
  const nameLine = `      - name: ${stepName}\n`;
  return mutate(text, nameLine, `${nameLine}        ${keyLine}\n`, 1);
}

const jobsOf = (text: string, label: string): WorkflowJobs =>
  workflowJobs(parseWorkflowSource(text), label);

/** Events whose job-level `if` runs the gate even when every need failed. */
function eventsWhereJobRuns(job: WorkflowJob) {
  const failedNeeds = Object.fromEntries(
    needsList(job).map((needId) => [
      needId,
      { result: "failure", outputs: {} },
    ]),
  );
  return EVENT_SCENARIOS.filter((scenario) =>
    evaluateIfCondition(
      ifExpression(job) || undefined,
      scenarioContext(scenario, failedNeeds),
    ),
  );
}

type EnforcingStep = {
  file: WorkflowPath;
  job: string;
  step: string;
  heavyNeeds: readonly string[];
  outputs?: Record<string, Record<string, string>>;
};

/** The steps whose exit status is the required verdict (ci.yml ~:292, ci-integration.yml ~:393, :478, :509). */
const ENFORCING_STEPS: readonly EnforcingStep[] = [
  {
    file: CI,
    job: "ci-gate",
    step: "Validate correctness checks and requested compilation",
    heavyNeeds: ["build", "test-unit"],
    outputs: { "compilation-plan": { requested: "true" } },
  },
  {
    file: CI_INTEGRATION,
    job: "e2e-smoke-gate",
    step: "Fail if E2E smoke failed",
    heavyNeeds: ["test-e2e-smoke"],
  },
  {
    file: CI_INTEGRATION,
    job: "integration-gate",
    step: "Fail if integration prerequisites failed",
    heavyNeeds: ["migrate", "smoke", "e2e-smoke-gate"],
  },
  {
    file: CI_INTEGRATION,
    job: "e2e-gate",
    step: "Fail if E2E failed on production",
    heavyNeeds: ["test-e2e", "instant-nav"],
  },
];

function enforcementProblems(text: string, gate: EnforcingStep): string[] {
  const job = jobsOf(text, gate.file)[gate.job];
  expect(job, `${gate.file} ${gate.job}`).toBeDefined();
  const scenarios = eventsWhereJobRuns(job!);
  expect(scenarios.length, `${gate.job} runs for some event`).toBeGreaterThan(
    0,
  );
  return gateEnforcementProblems(
    job!,
    gate.heavyNeeds,
    scenarios,
    gate.outputs,
  );
}

const ciGateRun = (jobs: WorkflowJobs, overrides: Record<string, string>) =>
  executeCiGateResultsStep(jobs["ci-gate"]!, {
    results: {
      "compilation-plan": "success",
      format: "success",
      integrity: "success",
      lint: "success",
      typecheck: "success",
      build: "success",
      "test-unit": "success",
      ...overrides,
    },
    outputs: { "compilation-plan": { requested: "true" } },
  });

describe("MAJOR-4: trigger set is pinned on workflows that host self-hosted jobs", () => {
  it("the fork model covers exactly the pinned triggers", () => {
    expect([...MODELED_TRIGGER_EVENTS]).toEqual(PINNED_TRIGGERS);
  });

  for (const file of WORKFLOWS) {
    describe(file, () => {
      const doc = parseWorkflowSource(source(file));

      it("hosts self-hosted jobs (so the pin applies)", () => {
        expect(
          Object.values(workflowJobs(doc, file)).some(isSelfHostedJob),
        ).toBe(true);
      });

      it("triggers on exactly pull_request, push and workflow_dispatch", () => {
        expect(workflowTriggerEvents(doc)).toEqual(PINNED_TRIGGERS);
        expect(unmodeledTriggerEvents(doc)).toEqual([]);
        expect(
          (doc.on as { push?: { branches?: string[] } }).push?.branches,
        ).toEqual(PINNED_PUSH_BRANCHES);
      });

      it.each(["pull_request_target", "workflow_run", "issue_comment"])(
        "rejects an added %s trigger (mutation M4)",
        (event) => {
          const mutated = parseWorkflowSource(
            mutate(
              source(file),
              "on:\n  workflow_dispatch:\n",
              `on:\n  workflow_dispatch:\n  ${event}:\n`,
              1,
            ),
          );
          expect(workflowTriggerEvents(mutated)).not.toEqual(PINNED_TRIGGERS);
          expect(unmodeledTriggerEvents(mutated)).toEqual([event]);
        },
      );
    });
  }

  it("normalizes string and list on: forms", () => {
    expect(workflowTriggerEvents({ on: "pull_request_target" })).toEqual([
      "pull_request_target",
    ]);
    expect(
      unmodeledTriggerEvents({ on: ["push", "pull_request_target"] }),
    ).toEqual(["pull_request_target"]);
  });
});

describe("MAJOR-1: fork-aware runs-on is evaluated with GitHub string comparison", () => {
  const mutated = () =>
    mutate(
      source(CI_INTEGRATION),
      "&& 'ubuntu-latest' ||",
      `&& ('a' < 'z' && ${PROXMOX_FROM_JSON} || 'ubuntu-latest') ||`,
      2,
    );

  for (const jobId of ["migrate", "smoke"] as const) {
    it(`${jobId}: real runs-on is fork-aware and fails closed`, () => {
      const job = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION)[jobId]!;
      expect(isForkAwareRunsOnExpression(job["runs-on"])).toBe(true);
      expect(requiredJobFailsClosedOnFork(job)).toBe(true);
    });

    it(`${jobId}: ('a' < 'z' && proxmox || 'ubuntu-latest') sends forks to self-hosted (mutation M1)`, () => {
      const job = jobsOf(mutated(), "M1")[jobId]!;
      expect(isForkAwareRunsOnExpression(job["runs-on"])).toBe(false);
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
      expect(analyzeSelfHostedForkSafety(job).problems.join("\n")).toMatch(
        /fork pull_request fork -> \w+ .* runs on \["self-hosted"/,
      );
    });
  }
});

describe("MAJOR-2: enforcing gate steps honor step if and continue-on-error", () => {
  for (const gate of ENFORCING_STEPS) {
    describe(`${gate.file} ${gate.job} / ${gate.step}`, () => {
      it("real workflow: passes on success and fails on every non-success heavy need", () => {
        expect(enforcementProblems(source(gate.file), gate)).toEqual([]);
      });

      it.each([
        ["if: false (mutation M2a)", "if: false"],
        ["if: ${{ false }}", "if: ${{ false }}"],
        [
          "if: github.event_name == 'never'",
          "if: github.event_name == 'never'",
        ],
        ["continue-on-error: true (mutation M2b)", "continue-on-error: true"],
        [
          "continue-on-error: ${{ github.event_name == 'pull_request' }}",
          "continue-on-error: ${{ github.event_name == 'pull_request' }}",
        ],
      ])("rejects %s on the enforcing step", (_label, keyLine) => {
        const mutated = addStepKey(source(gate.file), gate.step, keyLine);
        expect(enforcementProblems(mutated, gate).join("\n")).toMatch(
          /gate passes when/,
        );
      });

      it("rejects job-level continue-on-error: true on the gate job", () => {
        const header = `  ${gate.job}:\n`;
        const mutated = mutate(
          source(gate.file),
          header,
          `${header}    continue-on-error: true\n`,
          1,
        );
        expect(enforcementProblems(mutated, gate).join("\n")).toMatch(
          /gate passes when/,
        );
      });
    });
  }

  it("the acceptance helpers see the M2a/M2b mutations too", () => {
    for (const keyLine of ["if: false", "continue-on-error: true"]) {
      const integration = jobsOf(
        addStepKey(
          addStepKey(
            source(CI_INTEGRATION),
            "Fail if E2E smoke failed",
            keyLine,
          ),
          "Fail if integration prerequisites failed",
          keyLine,
        ),
        CI_INTEGRATION,
      );
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(
          integration["e2e-smoke-gate"]!,
          ["test-e2e-smoke"],
        ),
      ).toBe(false);
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(
          integration["integration-gate"]!,
          ["migrate", "smoke", "e2e-smoke-gate"],
        ),
      ).toBe(false);

      const ci = jobsOf(
        addStepKey(
          source(CI),
          "Validate correctness checks and requested compilation",
          keyLine,
        ),
        CI,
      );
      expect(
        ciGateRun(ci, { build: "skipped", "test-unit": "skipped" }).status,
      ).toBe(0);
    }

    const realCi = jobsOf(source(CI), CI);
    expect(
      ciGateRun(realCi, { build: "skipped", "test-unit": "skipped" }).status,
    ).not.toBe(0);
    expect(ciGateRun(realCi, {}).status).toBe(0);
  });
});

describe("MAJOR-3: fork-reject steps are matched by executing them", () => {
  const rejectStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    name: "Reject fork pull requests",
    if: FORK_ONLY_STEP_GUARD,
    run: `echo "${FORK_FAIL_MESSAGE}"\nexit 1\n`,
    ...overrides,
  });

  it("accepts the exact reject body", () => {
    expect(isForkRejectStep(rejectStep())).toBe(true);
  });

  it("accepts a body that fails through bash -e", () => {
    expect(
      isForkRejectStep(
        rejectStep({
          run: `echo "${FORK_FAIL_MESSAGE}"\nfalse\necho unreachable\n`,
        }),
      ),
    ).toBe(true);
  });

  it.each([
    ["exit 0 before exit 1", `echo "${FORK_FAIL_MESSAGE}"\nexit 0\nexit 1\n`],
    [
      "a failure neutralized by || true",
      `echo "${FORK_FAIL_MESSAGE}"\nfalse || true\n`,
    ],
    ["exit 1 in a subshell", `echo "${FORK_FAIL_MESSAGE}"\n(exit 1) || :\n`],
    ["exit 1 only in a comment", `echo "${FORK_FAIL_MESSAGE}" # exit 1\n`],
    ["no message", "echo nope\nexit 1\n"],
    ["message only in a comment", `# ${FORK_FAIL_MESSAGE}\nexit 1\n`],
    [
      "an unrendered expression",
      `echo "\${{ github.actor }} ${FORK_FAIL_MESSAGE}"\nexit 1\n`,
    ],
  ])("rejects a body with %s", (_label, run) => {
    expect(isForkRejectStep(rejectStep({ run }))).toBe(false);
  });

  it.each([
    ["continue-on-error: true", { "continue-on-error": true }],
    [
      "continue-on-error for pull requests",
      { "continue-on-error": "${{ github.event_name == 'pull_request' }}" },
    ],
    ["a uses: action", { uses: "actions/checkout@v4" }],
    ["a same-repo-inclusive if", { if: `${FORK_ONLY_STEP_GUARD} || true` }],
    ["no if", { if: undefined }],
  ])("rejects a reject step with %s", (_label, overrides) => {
    expect(
      isForkRejectStep(rejectStep(overrides as Partial<WorkflowStep>)),
    ).toBe(false);
  });

  const mutated = () =>
    mutate(
      source(CI_INTEGRATION),
      `echo "${FORK_FAIL_MESSAGE}"\n          exit 1\n`,
      `echo "${FORK_FAIL_MESSAGE}"\n          exit 0\n          exit 1\n`,
      2,
    );

  for (const jobId of ["migrate", "smoke"] as const) {
    it(`${jobId}: real reject step is step 0`, () => {
      const job = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION)[jobId]!;
      expect(forkRejectStepIndex(job)).toBe(0);
      expect(requiredJobFailsClosedOnFork(job)).toBe(true);
    });

    it(`${jobId}: exit 0 before exit 1 no longer fails closed (mutation M3)`, () => {
      const job = jobsOf(mutated(), "M3")[jobId]!;
      expect(forkRejectStepIndex(job)).toBe(-1);
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
    });
  }
});
