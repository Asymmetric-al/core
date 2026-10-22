/**
 * Mutation coverage for the #2158 self-hosted CI workflow harness
 * (PR #2160 review MAJOR-1..6, MINOR-7, the N1/N2 runner-variable follow-up,
 * the run-body allowlist bypasses, and MAJOR-9 unmodelled context members).
 * Each reviewer mutation is applied to an
 * in-memory copy of the real workflow YAML; the harness must accept the real
 * workflow and reject every mutated copy.
 */

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  EVENT_SCENARIOS,
  FORK_FAIL_MESSAGE,
  FORK_ONLY_STEP_GUARD,
  FORK_REJECT_IF,
  MODELED_TRIGGER_EVENTS,
  PINNED_CI_GATE_BODY,
  analyzeSelfHostedForkSafety,
  assertPinnedForkRejectIf,
  assertScriptAllowed,
  assertScriptVariablesModelled,
  effectiveStepEnv,
  evaluateIfCondition,
  executeCiGateResultsStep,
  executeGateJob,
  executeRunScript,
  forkRejectProblems,
  forkRejectStepIndex,
  gateEnforcementProblems,
  hostedGateFailsClosedWhenHeavyNeedsSkipped,
  ifExpression,
  isForkAwareRunsOnExpression,
  isForkRejectStep,
  isPinnedForkRejectIf,
  isSelfHostedJob,
  needsList,
  parseWorkflowSource,
  renderStepText,
  requiredJobFailsClosedOnFork,
  scanScriptVariables,
  scenarioContext,
  scriptSpawnEnv,
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

  it("rejects a body that fails through bash -e via `false` (not on the run-body allowlist)", () => {
    expect(
      isForkRejectStep(
        rejectStep({
          run: `echo "${FORK_FAIL_MESSAGE}"\nfalse\necho unreachable\n`,
        }),
      ),
    ).toBe(false);
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

  it("control: the guard with workflow env REVIEW_ALLOW=no still rejects forks at step 0", () => {
    const jobs = jobsOf(
      addWorkflowEnv(guarded(), 'REVIEW_ALLOW: "no"'),
      "guard, allow=no",
    );
    for (const jobId of ["migrate", "smoke"] as const) {
      expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(0);
      expect(requiredJobFailsClosedOnFork(jobs[jobId]!), jobId).toBe(true);
    }
  });

  it("the guard with REVIEW_ALLOW defined nowhere is not modelled, so it fails closed", () => {
    const jobs = jobsOf(guarded(), "guard only");
    for (const jobId of ["migrate", "smoke"] as const) {
      expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(-1);
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
    // REVIEW_ALLOW defined nowhere: the reference is not modelled (fail closed).
    expect(isForkRejectStep(step)).toBe(false);
    expect(
      isForkRejectStep(step, { workflowEnv: { REVIEW_ALLOW: "no" } }),
    ).toBe(true);
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

  it("control: the guard with workflow env REVIEW_ALLOW=no still fails closed", () => {
    const text = addWorkflowEnv(guarded(), 'REVIEW_ALLOW: "no"');
    expect(enforcementProblems(text, gate)).toEqual([]);
    expect(
      hostedGateFailsClosedWhenHeavyNeedsSkipped(gateJob(text), [
        "test-e2e-smoke",
      ]),
    ).toBe(true);
  });

  it("the guard with REVIEW_ALLOW defined nowhere is reported as not modelled", () => {
    expect(enforcementProblems(guarded(), gate).join("\n")).toMatch(
      /not modelled/,
    );
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

/** Run `fn` with `process.env` overrides, restoring the previous values after. */
function withProcessEnv<T>(overrides: Record<string, string>, fn: () => T): T {
  const previous = Object.fromEntries(
    Object.keys(overrides).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, overrides);
  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe("runner variables do not leak: scrubbed script env, fail-closed references (N1/N2)", () => {
  const N1 =
    'if [ "$GITHUB_JOB" = migrate ] || [ "$GITHUB_JOB" = smoke ]; then exit 0; fi';
  const N2 = 'if [ "$GITHUB_JOB" = e2e-smoke-gate ]; then exit 0; fi';
  const n1 = () =>
    mutate(
      source(CI_INTEGRATION),
      `          echo "${FORK_FAIL_MESSAGE}"\n`,
      `          ${N1}\n          echo "${FORK_FAIL_MESSAGE}"\n`,
      2,
    );
  const gateEcho =
    "          echo \"test-e2e-smoke: ${{ needs['test-e2e-smoke'].result }}\"\n";
  const n2 = () =>
    mutate(source(CI_INTEGRATION), gateEcho, `          ${N2}\n${gateEcho}`, 1);
  const smokeGate = ENFORCING_STEPS.find(
    (entry) => entry.job === "e2e-smoke-gate",
  )!;
  // As on a GitHub-hosted runner, where the unit tests themselves run in a job.
  const runnerEnv = {
    GITHUB_JOB: "migrate",
    GITHUB_EVENT_NAME: "pull_request",
  };

  it("N1: $GITHUB_JOB early exit in both reject steps is not a reject step (mutation N1)", () => {
    for (const env of [{}, runnerEnv]) {
      withProcessEnv(env, () => {
        const jobs = jobsOf(n1(), "N1");
        for (const jobId of ["migrate", "smoke"] as const) {
          const job = jobs[jobId]!;
          expect(forkRejectStepIndex(job), jobId).toBe(-1);
          expect(requiredJobFailsClosedOnFork(job), jobId).toBe(false);
          expect(
            analyzeSelfHostedForkSafety(job).problems.join("\n"),
            jobId,
          ).toMatch(/no fork-reject step/);
          expect(() =>
            executeRunScript(job.steps![0]!, job.steps![0]!.run!, {}),
          ).toThrow(/\$GITHUB_JOB.*not modelled/);
        }
      });
    }
  });

  it("N2: $GITHUB_JOB early exit in the e2e-smoke-gate step is reported, not fail-closed (mutation N2)", () => {
    for (const env of [{}, runnerEnv]) {
      withProcessEnv(env, () => {
        const text = n2();
        const problems = enforcementProblems(text, smokeGate);
        expect(problems).not.toEqual([]);
        expect(problems.join("\n")).toMatch(/\$GITHUB_JOB.*not modelled/);
        const job = jobsOf(text, "N2")["e2e-smoke-gate"]!;
        expect(
          hostedGateFailsClosedWhenHeavyNeedsSkipped(job, ["test-e2e-smoke"]),
        ).toBe(false);
        expect(() =>
          executeGateJob(
            job,
            { results: { "test-e2e-smoke": "skipped" } },
            EVENT_SCENARIOS[0]!,
          ),
        ).toThrow(/not modelled/);
      });
    }
  });

  it.each([
    ['echo "$UNSET_X"'],
    ["echo $UNSET_X"],
    ["echo ${UNSET_X}"],
    ['echo "${UNSET_X:-default}"'],
    ["echo ${#UNSET_X}"],
    ['echo "${OK:-$UNSET_X}"'],
    ["export UNSET_X; echo $UNSET_X"],
  ])("throws 'not modelled' for an unmodelled reference: %s", (script) => {
    expect(() => assertScriptVariablesModelled(script, { OK: "1" })).toThrow(
      /\$UNSET_X .*not modelled/,
    );
    // The run-body allowlist may reject the form first; either way it fails closed.
    expect(() => executeRunScript({}, script, { OK: "1" })).toThrow(
      /not (modelled|allowed)/,
    );
  });

  it.each([
    ["$( ) substitution", 'echo "$(printenv X)"'],
    ["backticks", "echo `id`"],
    ["arithmetic", "echo $((1 + 1))"],
    ["eval", 'eval "echo hi"'],
    ["printenv", "printenv GITHUB_JOB | grep -q migrate && exit 0"],
    ["env", "env | grep -q GITHUB_JOB=migrate && exit 0"],
    ["source", "source ./x.sh"],
    ["dot", ". ./x.sh"],
    ["indirection", "echo ${!X}"],
    ["/proc", "grep -q GITHUB_JOB=migrate /proc/self/environ && exit 0"],
    ["heredoc", "cat <<EOF\n$X\nEOF"],
    ["bare set", "set | grep -q GITHUB_JOB"],
    ["declare -p", "declare -p GITHUB_JOB"],
    ["unterminated quote", "echo 'x"],
  ])("throws 'not modelled' for %s", (_label, script) => {
    expect(() => assertScriptVariablesModelled(script, {})).toThrow(
      /not modelled/,
    );
  });

  it.each([
    [
      "special parameters",
      'echo "$? $# $$ $! $- $@ $* $0 $1 ${10} ${#}"; set -e',
    ],
    ["single quotes", "echo '$X ${Y} $(id)'"],
    ["escaped dollar", 'echo \\$X "\\$Y"'],
    ["comments", "echo ok # uses $X\n# and ${Y}"],
    ["assigned locals", 'failed=0; if [ "$failed" -ne 0 ]; then exit 1; fi'],
    ["prefix assignments", "A=1 B=2 true; echo $A $B"],
    ["declarations", 'export C=1; readonly D=2; echo "$C $D"'],
    ["loop variables", 'for result in a b; do echo "$result"; done'],
    ["read targets", 'read -r line other; echo "$line $other"'],
    ["effective-env names", 'echo "$CI_RESULTS ${CI_BUILD_REQUESTED:-true}"'],
  ])("accepts %s", (_label, script) => {
    expect(() =>
      assertScriptVariablesModelled(script, {
        CI_RESULTS: "{}",
        CI_BUILD_REQUESTED: "true",
      }),
    ).not.toThrow();
  });

  it("the real integration-gate script only reads its own locals", () => {
    const job = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION)[
      "integration-gate"
    ]!;
    const script = renderStepText(job.steps![0]!.run!, {
      results: {
        migrate: "success",
        smoke: "success",
        "e2e-smoke-gate": "success",
      },
    });
    const scanned = scanScriptVariables(script);
    expect(scanned.references).toEqual(["failed", "result"]);
    expect(scanned.locals).toEqual(
      expect.arrayContaining(["failed", "result"]),
    );
  });

  it("the real reject and gate scripts reference no environment variables", () => {
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    const results = {
      "test-e2e-smoke": "success",
      "test-e2e": "success",
      "instant-nav": "success",
    };
    for (const [jobId, index] of [
      ["migrate", 0],
      ["smoke", 0],
      ["e2e-smoke-gate", 0],
      ["e2e-gate", 0],
    ] as const) {
      const script = renderStepText(integration[jobId]!.steps![index]!.run!, {
        results,
      });
      expect(scanScriptVariables(script).references, jobId).toEqual([]);
    }
    const ciGate = jobsOf(source(CI), CI)["ci-gate"]!.steps!.find(
      (step) => step.env?.CI_RESULTS !== undefined,
    )!;
    expect(scanScriptVariables(ciGate.run!).references).toEqual([]);
  });

  it("scriptSpawnEnv is exactly PATH plus the given env", () => {
    withProcessEnv({ REVIEW_LEAK: "yes", GITHUB_JOB: "migrate" }, () => {
      expect(Object.keys(scriptSpawnEnv({ STEP_ONLY: "1" })).sort()).toEqual([
        "PATH",
        "STEP_ONLY",
      ]);
    });
  });

  it("variables set in the test process are not visible to the spawned script", () => {
    // Observed through the pinned ci-gate body (the only allowed child program):
    // an all-success CI_RESULTS planted in the test process must not reach it.
    const allSuccess = JSON.stringify({
      plan: "success",
      format: "success",
      integrity: "success",
      lint: "success",
      typecheck: "success",
      unit: "success",
      build: "success",
    });
    const leaked = withProcessEnv(
      {
        CI_RESULTS: allSuccess,
        CI_BUILD_REQUESTED: "true",
        REVIEW_LEAK: "yes",
        GITHUB_JOB: "migrate",
        CI: "true",
      },
      () => executeRunScript({}, PINNED_CI_GATE_BODY, { STEP_ONLY: "1" }),
    );
    expect(leaked.stdout).toContain("CI results: {}");
    expect(leaked.status).not.toBe(0);
    // The effective env given to the script does reach the child.
    const passed = executeRunScript({}, PINNED_CI_GATE_BODY, {
      CI_RESULTS: allSuccess,
      CI_BUILD_REQUESTED: "true",
    });
    expect(passed.status, passed.stdout + passed.stderr).toBe(0);
  });
});

describe("reject/gate run bodies are limited to an exact command allowlist", () => {
  const BYPASSES = [
    ["[[ -v ]]", "if [[ -v GITHUB_JOB ]]; then exit 0; fi"],
    ["(( ))", "if (( GITHUB_RUN_ATTEMPT )); then exit 0; fi"],
    ["nested bash", `bash -c '[ -n "$GITHUB_JOB" ]' && exit 0`],
    [
      "nested node",
      "node -e 'process.exit(process.env.GITHUB_ACTIONS ? 0 : 1)' && exit 0",
    ],
  ] as const;
  const rejectEcho = `          echo "${FORK_FAIL_MESSAGE}"\n`;
  const gateEcho =
    "          echo \"test-e2e-smoke: ${{ needs['test-e2e-smoke'].result }}\"\n";
  const smokeGate = ENFORCING_STEPS.find(
    (entry) => entry.job === "e2e-smoke-gate",
  )!;

  for (const [label, line] of BYPASSES) {
    it(`${label} early exit in both reject steps is not a reject step: ${line}`, () => {
      const text = mutate(
        source(CI_INTEGRATION),
        rejectEcho,
        `          ${line}\n${rejectEcho}`,
        2,
      );
      const jobs = jobsOf(text, label);
      for (const jobId of ["migrate", "smoke"] as const) {
        const job = jobs[jobId]!;
        expect(forkRejectStepIndex(job), jobId).toBe(-1);
        expect(requiredJobFailsClosedOnFork(job), jobId).toBe(false);
        expect(
          analyzeSelfHostedForkSafety(job).problems.join("\n"),
          jobId,
        ).toMatch(/no fork-reject step/);
        expect(() =>
          executeRunScript(job.steps![0]!, job.steps![0]!.run!, {}),
        ).toThrow(/not allowed/);
      }
    });

    it(`${label} early exit in "Fail if E2E smoke failed" is reported, not fail-closed: ${line}`, () => {
      const text = mutate(
        source(CI_INTEGRATION),
        gateEcho,
        `          ${line}\n${gateEcho}`,
        1,
      );
      const problems = enforcementProblems(text, smokeGate);
      expect(problems).not.toEqual([]);
      expect(problems.join("\n")).toMatch(/not allowed/);
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(
          jobsOf(text, label)["e2e-smoke-gate"]!,
          ["test-e2e-smoke"],
        ),
      ).toBe(false);
    });
  }

  it.each([
    ["let", "let x=1", "let"],
    ["declare", "declare X=1", "declare"],
    ["local", "local x=1", "local"],
    ["export", "export X=1", "export"],
    ["read", "read x", "read"],
    ["sh -c", "sh -c 'exit 0'", "sh"],
    ["python3 -c", "python3 -c 'print(1)'", "python3"],
    ["true", "true", "true"],
    ["false", "false", "false"],
    ["test", "test -n x", "test"],
    ["printf", "printf x", "printf"],
    [":", ": x", ":"],
    ["set", "set -e", "set"],
    ["eval", "eval echo", "eval"],
    ["exec", "exec echo x", "exec"],
    ["source", "source ./x.sh", "source"],
    ["dot", ". ./x.sh", "."],
    ["env", "env", "env"],
    ["printenv", "printenv X", "printenv"],
    ["case", "case x in x) exit 0;; esac", "`)`"],
    ["while", "while [ 1 = 1 ]; do exit 0; done", "while"],
    ["until", "until [ 1 = 1 ]; do exit 0; done", "until"],
    [
      "elif",
      "if [ a = b ]; then echo; elif [ a = a ]; then exit 0; fi",
      "elif",
    ],
    ["a function definition", "f() { exit 0; }", "("],
    ["the function keyword", "function f", "function"],
    ["[[", '[[ "$X" = x ]]', "[["],
    ["(( ))", "(( 1 ))", "("],
    ["$(( ))", "echo $((1 + 1))", "$(("],
    ["$( )", 'echo "$(id)"', "$("],
    ["backticks", "echo `id`", "Backtick"],
    ["${X@P}", 'echo "${GITHUB_JOB@P}"', "${GITHUB_JOB@P}"],
    ["${X+x}", 'echo "${GITHUB_JOB+x}"', "${GITHUB_JOB+x}"],
    ["${X:-d}", 'echo "${GITHUB_JOB:-d}"', "${GITHUB_JOB:-d}"],
    ["${#X}", 'echo "${#GITHUB_JOB}"', "${#GITHUB_JOB}"],
    ["${!X}", 'echo "${!GITHUB_JOB}"', "${!GITHUB_JOB}"],
    ["${X/a/b}", 'echo "${GITHUB_JOB/a/b}"', "${GITHUB_JOB/a/b}"],
    ["positional $1", 'echo "$1"', "$1"],
    ["a /dev/tcp redirection", "echo x > /dev/tcp/127.0.0.1/80", ">"],
    ["an input redirection", "echo < /etc/passwd", "<"],
    ["2> redirection", "echo x 2>/dev/null", ">"],
    ["&> redirection", "echo x &>/dev/null", "&"],
    ["a heredoc", "echo <<EOF\nx\nEOF", "<"],
    ["a pipe", "echo x | cat", "|"],
    ["background", "echo x &", "&"],
    ["a subshell", "(exit 0)", "("],
    ["a group", "{ exit 0; }", "{"],
    ["a prefix assignment", "X=1 echo x", "prefix assignment"],
    ["[ -v ]", "[ -v GITHUB_JOB ]", "-v"],
    ["[ -R ]", "[ -R GITHUB_JOB ]", "-R"],
    ["[ -o ]", "[ a = b -o c = d ]", "-o"],
    ["[ -a ]", "[ a = b -a c = d ]", "-a"],
    ["a file test", "[ -f /etc/passwd ]", "-f"],
    ["an unquoted expansion", "echo $GITHUB_JOB", "Unquoted expansion"],
    ["a glob", "echo /home/*", "*"],
    ["a tilde", "echo ~", "~"],
    ["exit with two arguments", "exit 1 2", "exit"],
    ["exit with a variable", 'exit "$X"', "exit"],
    ["a quoted command name", '"echo" x', "quoted or expanded command name"],
    ["an unterminated if", "if [ a = a ]; then exit 0", "unterminated"],
  ])("throws 'not allowed' for %s", (_label, script, token) => {
    expect(() => assertScriptAllowed(script)).toThrow(/not allowed/);
    expect(() => assertScriptAllowed(script)).toThrow(token);
  });

  it("every real reject and gate body passes the allowlist", () => {
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    const results = {
      migrate: "success",
      smoke: "success",
      "e2e-smoke-gate": "success",
      "test-e2e-smoke": "skipped",
      "test-e2e": "failure",
      "instant-nav": "success",
    };
    for (const jobId of [
      "migrate",
      "smoke",
      "e2e-smoke-gate",
      "integration-gate",
      "e2e-gate",
    ]) {
      const script = renderStepText(integration[jobId]!.steps![0]!.run!, {
        results,
      });
      expect(() => assertScriptAllowed(script), jobId).not.toThrow();
    }
  });

  it("the ci.yml ci-gate body is exactly the pinned body and passes", () => {
    const ciGate = jobsOf(source(CI), CI)["ci-gate"]!.steps!.find(
      (step) => step.env?.CI_RESULTS !== undefined,
    )!;
    expect(ciGate.run!.trim()).toBe(PINNED_CI_GATE_BODY);
    expect(() => assertScriptAllowed(ciGate.run!)).not.toThrow();
    expect(() =>
      assertScriptAllowed(`\n  ${PINNED_CI_GATE_BODY}\n`),
    ).not.toThrow();
  });

  it.each([
    ["other arguments", "node scripts/verify/ci-build-policy.mjs --build"],
    ["an extra argument", `${PINNED_CI_GATE_BODY} --verbose`],
    ["an extra command", `${PINNED_CI_GATE_BODY}\necho hi`],
    ["a chained exit", `${PINNED_CI_GATE_BODY} || exit 0`],
    ["another script", "node scripts/verify/other.mjs --gate"],
    ["node -e", "node -e 'process.exit(0)'"],
  ])("the pinned ci-gate exception rejects %s", (_label, script) => {
    expect(() => assertScriptAllowed(script)).toThrow(/not allowed/);
  });

  it.each([
    [
      "if/else with && and ||",
      'if [ -n "$X" ] && [ "$Y" = y ] || [ "$Z" != z ]; then exit 0; else echo no; fi',
    ],
    ["negated test", 'if [ ! "$X" = x ]; then exit 1; fi'],
    ["numeric tests", 'if [ "$N" -lt 2 ] || [ "$N" -ge 9 ]; then exit 1; fi'],
    ["-z test", 'if [ -z "$X" ]; then exit 1; fi'],
    ["exit $?", "echo hi\nexit $?"],
    ["bare exit", "exit"],
    ["assignments", "x=1\ny=\"$X\"\nz=$X\nw='lit'"],
    ["for loop", 'for x in a "b" \\\n  c; do echo "$x"; done'],
    [
      "comments and escapes",
      'echo ok # trailing $X\n# full line\necho "\\$HOME" \\$x',
    ],
    ["single quotes", "echo '$X ${Y} $(id) `id`'"],
  ])("accepts %s", (_label, script) => {
    expect(() => assertScriptAllowed(script)).not.toThrow();
  });
});

/** True when `fn` fails closed: returns false or throws (never a pass). */
function failsClosed(fn: () => boolean): boolean {
  try {
    return fn() === false;
  } catch {
    return true;
  }
}

describe("MAJOR-9: pinned fork-reject if; unmodelled context members fail closed", () => {
  const rejectIfTail =
    "          github.event.pull_request.head.repo.full_name != github.repository\n        run: |\n";
  const appendToRejectIf = (jobId: string, clause: string) =>
    mutateJob(source(CI_INTEGRATION), jobId, (block) =>
      mutate(
        block,
        rejectIfTail,
        rejectIfTail.replace(
          "github.repository\n",
          `github.repository\n          ${clause}\n`,
        ),
        1,
      ),
    );
  const forkScenarios = EVENT_SCENARIOS.filter((scenario) => scenario.fork);

  it("both real reject steps use exactly the pinned FORK_REJECT_IF (= FORK_ONLY_STEP_GUARD)", () => {
    expect(FORK_REJECT_IF).toBe(FORK_ONLY_STEP_GUARD);
    const jobs = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    for (const jobId of ["migrate", "smoke"] as const) {
      const step = jobs[jobId]!.steps![0]!;
      expect(step.if, jobId).toBe(FORK_REJECT_IF);
      expect(() => assertPinnedForkRejectIf(step)).not.toThrow();
      expect(forkRejectProblems(jobs[jobId]!), jobId).toEqual([]);
    }
  });

  for (const [label, clause, member] of [
    ["A1", "&& github.job != 'migrate'", "github.job"],
    [
      "A2",
      "&& github.event.pull_request.head.repo.fork != true",
      "github.event.pull_request.head.repo.fork",
    ],
  ] as const) {
    for (const jobId of ["migrate", "smoke"] as const) {
      describe(`${label} on the ${jobId} reject step if: ${clause}`, () => {
        const job = () =>
          jobsOf(appendToRejectIf(jobId, clause), label)[jobId]!;

        it("is rejected by the pinned if (no reject step, named in the problems)", () => {
          const step = job().steps![0]!;
          expect(String(step.if)).toContain(clause);
          expect(isForkRejectStep(step)).toBe(false);
          expect(forkRejectStepIndex(job())).toBe(-1);
          expect(() => assertPinnedForkRejectIf(step)).toThrow(
            /is not allowed: it must be exactly FORK_REJECT_IF/,
          );
          expect(forkRejectProblems(job()).join("\n")).toMatch(
            /step 0: .*not allowed: it must be exactly FORK_REJECT_IF/,
          );
        });

        it(`evaluating it reads the unmodelled ${member}, which throws "not modelled"`, () => {
          for (const scenario of forkScenarios) {
            expect(() =>
              evaluateIfCondition(
                job().steps![0]!.if,
                scenarioContext(scenario, {}),
              ),
            ).toThrow(
              new RegExp(`'${member.replace(/\./g, "\\.")}' is not modelled`),
            );
          }
        });

        it("the required job fails closed end to end", () => {
          expect(failsClosed(() => requiredJobFailsClosedOnFork(job()))).toBe(
            true,
          );
        });
      });
    }
  }

  it.each([
    ["a ${{ }} wrapper", `\${{ ${FORK_ONLY_STEP_GUARD} }}`],
    ["an extra || clause", `${FORK_ONLY_STEP_GUARD} || false`],
    [
      "swapped conjuncts",
      "github.event.pull_request.head.repo.full_name != github.repository && github.event_name == 'pull_request'",
    ],
    ["no if", undefined],
  ])(
    "a reject body under a non-pinned if (%s) fails closed",
    (_label, condition) => {
      const step: WorkflowStep = {
        name: "Reject fork pull requests",
        ...(condition === undefined ? {} : { if: condition }),
        run: `echo "${FORK_FAIL_MESSAGE}"\nexit 1\n`,
      };
      expect(isPinnedForkRejectIf(step.if)).toBe(false);
      expect(isForkRejectStep(step)).toBe(false);
      expect(() => assertPinnedForkRejectIf(step)).toThrow(/is not allowed/);
    },
  );

  it("the pin tolerates only whitespace normalisation (YAML >- folding)", () => {
    expect(
      isPinnedForkRejectIf(
        "  github.event_name == 'pull_request' &&\n   github.event.pull_request.head.repo.full_name != github.repository\n",
      ),
    ).toBe(true);
  });

  it.each([
    ["github.job == 'migrate'", "'github.job' is not modelled"],
    [
      "github.event.pull_request.head.repo.fork",
      "head.repo.fork' is not modelled",
    ],
    ["github.actor == 'x'", "'github.actor' is not modelled"],
    ["needs.migrate.result == 'success'", "'needs.migrate' is not modelled"],
    ["vars.X == 'y'", "'vars.X' is not modelled"],
    ["inputs.x == 'y'", "'inputs.x' is not modelled"],
    ["env.X == 'y'", "Unknown context 'env'"],
    ["secrets.X == 'y'", "Unknown context 'secrets'"],
    ["runner.os == 'Linux'", "Unknown context 'runner'"],
  ])("looking up an unmodelled member throws: %s", (expr, message) => {
    for (const scenario of EVENT_SCENARIOS.filter((s) => s.fork)) {
      expect(() =>
        evaluateIfCondition(expr, scenarioContext(scenario, {})),
      ).toThrow(message);
    }
  });

  it("a modelled needs output is readable; an unmodelled one throws", () => {
    const ctx = scenarioContext(EVENT_SCENARIOS[0]!, {
      build: { result: "success", outputs: { requested: "true" } },
    });
    expect(
      evaluateIfCondition("needs.build.outputs.requested == 'true'", ctx),
    ).toBe(true);
    expect(() =>
      evaluateIfCondition("needs.build.outputs.other == 'true'", ctx),
    ).toThrow(/'needs\.build\.outputs\.other' is not modelled/);
  });

  it("an unmodelled member in a gate job if is reported, not treated as passing", () => {
    const text = mutate(
      source(CI_INTEGRATION),
      "  e2e-smoke-gate:\n    if: always()\n",
      "  e2e-smoke-gate:\n    if: always() && github.job != 'e2e-smoke-gate'\n",
      1,
    );
    const job = jobsOf(text, "gate if")["e2e-smoke-gate"]!;
    expect(gateEnforcementProblems(job, ["test-e2e-smoke"]).join("\n")).toMatch(
      /'github\.job' is not modelled/,
    );
    expect(
      hostedGateFailsClosedWhenHeavyNeedsSkipped(job, ["test-e2e-smoke"]),
    ).toBe(false);
  });

  it("an unmodelled member in a gate step if is reported, not treated as passing", () => {
    const text = addStepKey(
      source(CI_INTEGRATION),
      "Fail if E2E failed on production",
      "if: github.job != 'e2e-gate'",
    );
    const job = jobsOf(text, "gate step if")["e2e-gate"]!;
    const production = EVENT_SCENARIOS.filter(
      (scenario) =>
        scenario.label.includes("production") &&
        !scenario.label.startsWith("workflow_dispatch"),
    );
    expect(
      gateEnforcementProblems(
        job,
        ["test-e2e", "instant-nav"],
        production,
      ).join("\n"),
    ).toMatch(/'github\.job' is not modelled/);
  });

  it("an unmodelled member in the fork-aware runs-on is not fork-aware", () => {
    const text = mutate(
      source(CI_INTEGRATION),
      "${{ github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository && 'ubuntu-latest'",
      "${{ github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository && github.job != 'x' && 'ubuntu-latest'",
      2,
    );
    const jobs = jobsOf(text, "runs-on");
    for (const jobId of ["migrate", "smoke"] as const) {
      expect(isForkAwareRunsOnExpression(jobs[jobId]!["runs-on"]), jobId).toBe(
        false,
      );
      expect(
        failsClosed(() => requiredJobFailsClosedOnFork(jobs[jobId]!)),
      ).toBe(true);
    }
  });
});
