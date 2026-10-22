/**
 * Mutation coverage for the #2158 self-hosted CI workflow harness
 * (PR #2160 review MAJOR-1..6, MINOR-7). Each reviewer mutation is applied to an
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
  effectiveStepEnv,
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

const REVIEW_GUARD = 'if [ "$REVIEW_ALLOW" = yes ]; then exit 0; fi';
const REVIEW_ALLOW = 'REVIEW_ALLOW: "yes"';

/** Add a key line to the workflow-level `env:` map. */
function addWorkflowEnv(text: string, keyLine: string): string {
  return mutate(text, "\nenv:\n", `\nenv:\n  ${keyLine}\n`, 1);
}

/** Apply `fn` to one job's block only (its `  <id>:` header up to the next job header). */
function mutateJob(
  text: string,
  jobId: string,
  fn: (block: string) => string,
): string {
  const header = `\n  ${jobId}:\n`;
  const start = text.indexOf(header);
  expect(start, `job ${jobId}`).toBeGreaterThanOrEqual(0);
  expect(text.indexOf(header, start + 1), `job ${jobId} is unique`).toBe(-1);
  const bodyStart = start + header.length;
  const next = text.slice(bodyStart).search(/\n  [A-Za-z0-9_-]+:\n/);
  const end = next === -1 ? text.length : bodyStart + next;
  return (
    text.slice(0, bodyStart) + fn(text.slice(bodyStart, end)) + text.slice(end)
  );
}

/** Add a key line to a job's existing job-level `env:` map. */
const addToJobEnv = (keyLine: string) => (block: string) =>
  mutate(block, "\n    env:\n", `\n    env:\n      ${keyLine}\n`, 1);

/** Add a step-level `env:` map with one key right after the step's `- name:` line. */
function addStepEnv(
  text: string,
  stepName: string,
  keyLine: string,
  expectedCount: number,
): string {
  const nameLine = `      - name: ${stepName}\n`;
  return mutate(
    text,
    nameLine,
    `${nameLine}        env:\n          ${keyLine}\n`,
    expectedCount,
  );
}

describe("MAJOR-5: fork-reject steps run with the runner's workflow -> job -> step env", () => {
  // Prepend an env-controlled early `exit 0` to both reject bodies.
  const guarded = () =>
    mutate(
      source(CI_INTEGRATION),
      `          echo "${FORK_FAIL_MESSAGE}"\n`,
      `          ${REVIEW_GUARD}\n          echo "${FORK_FAIL_MESSAGE}"\n`,
      2,
    );

  it("control: the guard alone (REVIEW_ALLOW unset) still rejects forks at step 0", () => {
    const jobs = jobsOf(guarded(), "guard only");
    for (const jobId of ["migrate", "smoke"] as const) {
      expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(0);
      expect(requiredJobFailsClosedOnFork(jobs[jobId]!), jobId).toBe(true);
    }
  });

  it.each([
    ["workflow env", () => addWorkflowEnv(guarded(), REVIEW_ALLOW)],
    [
      "job env",
      () =>
        mutateJob(
          mutateJob(guarded(), "migrate", addToJobEnv(REVIEW_ALLOW)),
          "smoke",
          addToJobEnv(REVIEW_ALLOW),
        ),
    ],
    [
      "step env",
      () => addStepEnv(guarded(), "Reject fork pull requests", REVIEW_ALLOW, 2),
    ],
  ])(
    "%s REVIEW_ALLOW=yes lets the reject body exit 0, so it is no longer a reject step",
    (_level, mutated) => {
      const jobs = jobsOf(mutated(), "env mutation");
      for (const jobId of ["migrate", "smoke"] as const) {
        const job = jobs[jobId]!;
        expect(forkRejectStepIndex(job), jobId).toBe(-1);
        expect(requiredJobFailsClosedOnFork(job), jobId).toBe(false);
        expect(
          analyzeSelfHostedForkSafety(job).problems.join("\n"),
          jobId,
        ).toMatch(/no fork-reject step/);
      }
    },
  );

  it("a step loaded from a workflow sees that workflow's env when checked directly", () => {
    const jobs = jobsOf(addWorkflowEnv(guarded(), REVIEW_ALLOW), "direct");
    expect(isForkRejectStep(jobs.migrate!.steps![0]!)).toBe(false);
  });

  it("an explicit env context is honored for fixture steps", () => {
    const step: WorkflowStep = {
      if: FORK_ONLY_STEP_GUARD,
      run: `${REVIEW_GUARD}\necho "${FORK_FAIL_MESSAGE}"\nexit 1\n`,
    };
    expect(isForkRejectStep(step)).toBe(true);
    expect(
      isForkRejectStep(step, { workflowEnv: { REVIEW_ALLOW: "yes" } }),
    ).toBe(false);
    expect(isForkRejectStep(step, { jobEnv: { REVIEW_ALLOW: "yes" } })).toBe(
      false,
    );
    // Step env wins over job and workflow env.
    expect(
      isForkRejectStep(
        { ...step, env: { REVIEW_ALLOW: "no" } },
        {
          workflowEnv: { REVIEW_ALLOW: "yes" },
          jobEnv: { REVIEW_ALLOW: "yes" },
        },
      ),
    ).toBe(true);
  });

  it.each([
    [
      "workflow",
      () =>
        addWorkflowEnv(source(CI_INTEGRATION), "ACTOR: ${{ github.actor }}"),
    ],
    [
      "job",
      () =>
        mutateJob(
          source(CI_INTEGRATION),
          "migrate",
          addToJobEnv("ACTOR: ${{ github.actor }}"),
        ),
    ],
  ])(
    "fails closed when a %s env value is an unrendered expression",
    (_level, mutated) => {
      const jobs = jobsOf(mutated(), "expr env");
      expect(forkRejectStepIndex(jobs.migrate!)).toBe(-1);
    },
  );
});

describe("MAJOR-6: gate jobs run with the runner's workflow -> job -> step env", () => {
  const gate = ENFORCING_STEPS.find((entry) => entry.job === "e2e-smoke-gate")!;
  const echoLine =
    "          echo \"test-e2e-smoke: ${{ needs['test-e2e-smoke'].result }}\"\n";
  // Prepend an env-controlled early `exit 0` to "Fail if E2E smoke failed".
  const guarded = () =>
    mutate(
      source(CI_INTEGRATION),
      echoLine,
      `          ${REVIEW_GUARD}\n${echoLine}`,
      1,
    );
  const gateJob = (text: string) => jobsOf(text, "gate")["e2e-smoke-gate"]!;

  it("control: the guard alone (REVIEW_ALLOW unset) still fails closed", () => {
    expect(enforcementProblems(guarded(), gate)).toEqual([]);
    expect(
      hostedGateFailsClosedWhenHeavyNeedsSkipped(gateJob(guarded()), [
        "test-e2e-smoke",
      ]),
    ).toBe(true);
  });

  it.each([
    ["workflow env", () => addWorkflowEnv(guarded(), REVIEW_ALLOW)],
    [
      "job env",
      () =>
        mutateJob(guarded(), "e2e-smoke-gate", (block) =>
          mutate(
            block,
            "    runs-on: ubuntu-slim\n",
            `    runs-on: ubuntu-slim\n    env:\n      ${REVIEW_ALLOW}\n`,
            1,
          ),
        ),
    ],
    [
      "step env",
      () => addStepEnv(guarded(), "Fail if E2E smoke failed", REVIEW_ALLOW, 1),
    ],
  ])(
    "%s REVIEW_ALLOW=yes makes the gate pass on a skipped or failed smoke run",
    (_level, mutated) => {
      const text = mutated();
      expect(enforcementProblems(text, gate).join("\n")).toMatch(
        /gate passes when test-e2e-smoke (skipped|failure)/,
      );
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(gateJob(text), [
          "test-e2e-smoke",
        ]),
      ).toBe(false);
    },
  );

  it("step env overrides a workflow env that would open the gate", () => {
    const text = addStepEnv(
      addWorkflowEnv(guarded(), REVIEW_ALLOW),
      "Fail if E2E smoke failed",
      'REVIEW_ALLOW: "no"',
      1,
    );
    expect(enforcementProblems(text, gate)).toEqual([]);
  });
});

describe("effectiveStepEnv follows the runner's precedence", () => {
  it("step overrides job overrides workflow", () => {
    expect(
      effectiveStepEnv(
        { A: "workflow", B: "workflow", C: "workflow" },
        { B: "job", C: "job" },
        { C: "step" },
      ),
    ).toEqual({ A: "workflow", B: "job", C: "step" });
  });

  it("stringifies scalars and treats missing levels as empty", () => {
    expect(
      effectiveStepEnv(undefined, { N: 1, T: true, Z: null }, undefined),
    ).toEqual({ N: "1", T: "true", Z: "" });
  });

  it("throws on a non-map level or a non-scalar value", () => {
    expect(() => effectiveStepEnv("${{ fromJSON('{}') }}", {}, {})).toThrow(
      /not a map/,
    );
    expect(() => effectiveStepEnv({}, { X: { y: 1 } }, {})).toThrow(
      /not a scalar/,
    );
  });
});

describe("MINOR-7: non-ASCII literals cannot fake a fork-aware runs-on", () => {
  const condition =
    "${{ github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository && 'ubuntu-latest'";

  for (const literal of ["('ı' == 'I')", "('ſ' == 'S')"]) {
    it(`rejects ${literal} && in the fork branch of migrate/smoke runs-on`, () => {
      const mutated = mutate(
        source(CI_INTEGRATION),
        condition,
        condition.replace("${{ ", `\${{ ${literal} && `),
        2,
      );
      const jobs = jobsOf(mutated, "MINOR-7");
      for (const jobId of ["migrate", "smoke"] as const) {
        expect(
          isForkAwareRunsOnExpression(jobs[jobId]!["runs-on"]),
          jobId,
        ).toBe(false);
        expect(requiredJobFailsClosedOnFork(jobs[jobId]!), jobId).toBe(false);
      }
    });
  }
});
