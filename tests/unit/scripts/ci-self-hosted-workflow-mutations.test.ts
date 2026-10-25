/**
 * Mutation coverage for the #2158 self-hosted CI workflow harness
 * (PR #2160 review MAJOR-1..6, MINOR-7, the N1/N2 runner-variable follow-up,
 * the run-body allowlist bypasses, MAJOR-9 unmodelled context members, and
 * MAJOR-10 defaults.run shells plus the workflow key allowlist, and the
 * repair-6 if: pins, whole-object functions and second value set, and the
 * repair-7 per-job/per-step key allowlists, and the repair-8 env key names and
 * runner-faithful script execution, and the repair-9 document-cutover step).
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
  DENIED_ENV_KEY_PATTERNS,
  MODELLED_ENV_KEYS_BY_JOB,
  MODELLED_JOB_KEYS,
  MODELLED_RUNNER_ENV,
  MODELLED_WORKFLOW_ENV_KEYS,
  MODELLED_KEYS_BY_JOB,
  MODELLED_STEP_KEYS,
  MODELLED_WORKFLOW_KEYS,
  PINNED_JOB_IFS,
  PINNED_STEP_BODIES,
  PULL_REQUEST_VALUE_SETS,
  PINNED_CI_GATE_BODY,
  analyzeSelfHostedForkSafety,
  assertEnvKeysNotDenied,
  assertPinnedForkRejectIf,
  assertWorkflowKeysModelled,
  assertScriptAllowed,
  assertScriptVariablesModelled,
  assertStepKeysModelled,
  effectiveStepEnv,
  envKeyProblems,
  evaluateIfCondition,
  evaluateRunsOn,
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
  modelledKeyProblems,
  pinnedIfProblems,
  resolveRunSettings,
  runStepShellArgv,
  isSelfHostedJob,
  needsList,
  parseWorkflowSource,
  renderStepText,
  requiredJobFailsClosedOnFork,
  scanScriptVariables,
  scenarioContext,
  scriptSpawnEnv,
  stepIdentity,
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
const PINNED_TRIGGERS = [
  "merge_group",
  "pull_request",
  "push",
  "workflow_dispatch",
];
const PINNED_PUSH_BRANCHES = ["develop", "production"];

/** How the harness runs a reject/gate body (before the temp script file). */
const RUNNER_ARGV = ["bash", ["--noprofile", "--norc", "-eo", "pipefail"]];

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
    heavyNeeds: ["migrate", "smoke", "test-e2e-smoke"],
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
      "acceptance-tests": "success",
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

      it("triggers on exactly merge_group, pull_request, push and workflow_dispatch", () => {
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
        const key = keyLine.slice(0, keyLine.indexOf(":"));
        const index = jobsOf(source(gate.file), gate.file)[
          gate.job
        ]!.steps!.findIndex((step) => step.name === gate.step);
        // Step `if` and `continue-on-error` are outside the gate step allowlist.
        expect(enforcementProblems(mutated, gate).join("\n")).toContain(
          `Step ${index} (gate) key '${key}' is not modelled`,
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
        expect(enforcementProblems(mutated, gate).join("\n")).toContain(
          "Job (gate) key 'continue-on-error' is not modelled",
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
      const key = keyLine.slice(0, keyLine.indexOf(":"));
      expect(() =>
        ciGateRun(ci, { build: "skipped", "test-unit": "skipped" }),
      ).toThrow(`Step 2 (gate) key '${key}' is not modelled`);
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

  it("control: the guard with workflow env REVIEW_ALLOW=no fails closed on the env key name", () => {
    // REVIEW_ALLOW is not one of the pinned workflow env names, so even the
    // harmless value fails closed; value precedence is covered by the explicit
    // env context test below.
    const jobs = jobsOf(
      addWorkflowEnv(guarded(), 'REVIEW_ALLOW: "no"'),
      "guard, allow=no",
    );
    for (const jobId of ["migrate", "smoke"] as const) {
      expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(-1);
      expect(forkRejectProblems(jobs[jobId]!).join("\n"), jobId).toContain(
        "env key not allowed: REVIEW_ALLOW at workflow env (not in the pinned set)",
      );
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
    // A reject step's own `env` is outside the reject-step key allowlist (no
    // real reject step uses it), so it fails closed whatever its value;
    // step-over-job-over-workflow precedence is covered by effectiveStepEnv
    // and the gate step env tests.
    expect(
      isForkRejectStep(
        { ...step, env: { REVIEW_ALLOW: "no" } },
        {
          workflowEnv: { REVIEW_ALLOW: "yes" },
          jobEnv: { REVIEW_ALLOW: "yes" },
        },
      ),
    ).toBe(false);
    expect(() =>
      assertStepKeysModelled(
        { ...step, env: { REVIEW_ALLOW: "no" } },
        "reject",
      ),
    ).toThrow("Step (reject) key 'env' is not modelled");
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

  it("control: the guard with workflow env REVIEW_ALLOW=no fails closed on the env key name", () => {
    // Value precedence for gates is covered by the synthetic precedence test.
    const text = addWorkflowEnv(guarded(), 'REVIEW_ALLOW: "no"');
    expect(enforcementProblems(text, gate).join("\n")).toContain(
      "env key not allowed: REVIEW_ALLOW at workflow env (not in the pinned set)",
    );
  });

  it("the guard with REVIEW_ALLOW defined nowhere is reported as not modelled", () => {
    expect(enforcementProblems(guarded(), gate).join("\n")).toMatch(
      /not modelled/,
    );
  });

  it.each([
    [
      "workflow env",
      () => addWorkflowEnv(guarded(), REVIEW_ALLOW),
      "env key not allowed: REVIEW_ALLOW at workflow env (not in the pinned set)",
    ],
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
      "Job (gate) key 'env' is not modelled",
    ],
    [
      "step env",
      () => addStepEnv(guarded(), "Fail if E2E smoke failed", REVIEW_ALLOW, 1),
      "Step 0 (gate) key 'env' is not modelled",
    ],
  ])(
    "%s REVIEW_ALLOW=yes makes the gate pass on a skipped or failed smoke run",
    (_level, mutated, message) => {
      const text = mutated();
      expect(enforcementProblems(text, gate).join("\n")).toContain(message);
      expect(
        hostedGateFailsClosedWhenHeavyNeedsSkipped(gateJob(text), [
          "test-e2e-smoke",
        ]),
      ).toBe(false);
    },
  );

  it("step env overrides a workflow env that would open the gate", () => {
    // Step env is only modelled on ci-gate's policy step (a pinned body), so
    // precedence is exercised on a synthetic, unpinned gate job.
    const yaml = (stepEnv: boolean) =>
      [
        "on: push",
        "env:",
        '  REVIEW_ALLOW: "yes"',
        "jobs:",
        "  precedence-gate:",
        "    if: always()",
        "    needs: [heavy]",
        "    runs-on: ubuntu-slim",
        "    steps:",
        "      - name: Fail if heavy failed",
        ...(stepEnv ? ["        env:", '          REVIEW_ALLOW: "no"'] : []),
        "        run: |",
        `          ${REVIEW_GUARD}`,
        '          if [ "${{ needs.heavy.result }}" != "success" ]; then',
        "            exit 1",
        "          fi",
      ].join("\n");
    const problems = (stepEnv: boolean) =>
      gateEnforcementProblems(
        jobsOf(yaml(stepEnv), "precedence")["precedence-gate"]!,
        ["heavy"],
      );
    expect(problems(true)).toEqual([]);
    expect(problems(false).join("\n")).toContain(
      "gate passes when heavy skipped",
    );
    // On the real e2e-smoke-gate step the same env is not modelled.
    const real = addStepEnv(
      addWorkflowEnv(guarded(), REVIEW_ALLOW),
      "Fail if E2E smoke failed",
      'REVIEW_ALLOW: "no"',
      1,
    );
    expect(enforcementProblems(real, gate).join("\n")).toContain(
      "Step 0 (gate) key 'env' is not modelled",
    );
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
          hostedGateFailsClosedWhenHeavyNeedsSkipped(job, [
            "migrate",
            "smoke",
            "test-e2e-smoke",
          ]),
        ).toBe(false);
        expect(() =>
          executeGateJob(
            job,
            {
              results: {
                migrate: "success",
                smoke: "success",
                "test-e2e-smoke": "skipped",
              },
            },
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
      migrate: "success",
      smoke: "success",
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

  it("scriptSpawnEnv is exactly PATH, the given env and the modelled runner values", () => {
    withProcessEnv(
      { REVIEW_LEAK: "yes", GITHUB_JOB: "migrate", CI: "false" },
      () => {
        const env = scriptSpawnEnv({ STEP_ONLY: "1" });
        expect(Object.keys(env).sort()).toEqual([
          "CI",
          "GITHUB_ACTIONS",
          "PATH",
          "STEP_ONLY",
        ]);
        expect(env).toMatchObject({ CI: "true", GITHUB_ACTIONS: "true" });
      },
    );
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
      acceptance: "success",
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
    // Rejected by the gate job if pin before evaluation.
    expect(
      gateEnforcementProblems(job, ["test-e2e-smoke"]).join("\n"),
    ).toContain(
      `Job 'e2e-smoke-gate' if "always() && github.job != 'e2e-smoke-gate'" is not allowed: pinned to "always()"`,
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
    ).toContain("Step 0 (gate) key 'if' is not modelled");
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

describe("MAJOR-10: defaults.run shell resolution and the workflow key allowlist", () => {
  const SHELLS = [
    "bash --noprofile --norc -c 'exit 0' {0}",
    "true {0}",
  ] as const;
  const defaultsBlock = (indent: string, shell: string) =>
    `${indent}defaults:\n${indent}  run:\n${indent}    shell: ${JSON.stringify(shell)}\n`;
  const REJECT_JOBS = ["migrate", "smoke"] as const;
  const GATE_JOBS: [string, string][] = [
    [CI_INTEGRATION, "e2e-smoke-gate"],
    [CI_INTEGRATION, "integration-gate"],
    [CI_INTEGRATION, "e2e-gate"],
    [CI, "ci-gate"],
  ];
  const smokeGate = ENFORCING_STEPS.find(
    (entry) => entry.job === "e2e-smoke-gate",
  )!;

  for (const shell of SHELLS) {
    describe(`shell ${shell}`, () => {
      const b2 = () =>
        mutate(
          source(CI_INTEGRATION),
          "\njobs:\n",
          `\n${defaultsBlock("", shell)}jobs:\n`,
          1,
        );
      const b3 = () =>
        mutate(
          source(CI_INTEGRATION),
          "\n  migrate:\n",
          `\n  migrate:\n${defaultsBlock("    ", shell)}`,
          1,
        );
      const b4 = () =>
        mutate(
          source(CI_INTEGRATION),
          "\n  e2e-smoke-gate:\n",
          `\n  e2e-smoke-gate:\n${defaultsBlock("    ", shell)}`,
          1,
        );

      it("B2 (workflow defaults.run.shell): reject steps and the gate fail closed", () => {
        const jobs = jobsOf(b2(), "B2");
        for (const jobId of REJECT_JOBS) {
          expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(-1);
          expect(
            failsClosed(() => requiredJobFailsClosedOnFork(jobs[jobId]!)),
          ).toBe(true);
          expect(forkRejectProblems(jobs[jobId]!).join("\n")).toMatch(
            /'defaults' is not modelled/,
          );
        }
        expect(enforcementProblems(b2(), smokeGate).join("\n")).toMatch(
          /not modelled/,
        );
        expect(
          hostedGateFailsClosedWhenHeavyNeedsSkipped(jobs["e2e-smoke-gate"]!, [
            "migrate",
            "smoke",
            "test-e2e-smoke",
          ]),
        ).toBe(false);
      });

      it("B3 (migrate job defaults.run.shell): the migrate reject step fails closed", () => {
        const job = jobsOf(b3(), "B3").migrate!;
        expect(forkRejectStepIndex(job)).toBe(-1);
        expect(failsClosed(() => requiredJobFailsClosedOnFork(job))).toBe(true);
        expect(forkRejectProblems(job).join("\n")).toMatch(
          /'defaults' is not modelled/,
        );
      });

      it("B4 (e2e-smoke-gate job defaults.run.shell): the gate is reported, not fail-closed", () => {
        const problems = enforcementProblems(b4(), smokeGate);
        expect(problems).not.toEqual([]);
        expect(problems.join("\n")).toMatch(/not modelled/);
        expect(
          hostedGateFailsClosedWhenHeavyNeedsSkipped(
            jobsOf(b4(), "B4")["e2e-smoke-gate"]!,
            ["test-e2e-smoke"],
          ),
        ).toBe(false);
      });

      it("key allowlist alone: B2-B4 add an unmodelled 'defaults' key", () => {
        expect(() =>
          assertWorkflowKeysModelled(parseWorkflowSource(b2())),
        ).toThrow(/Workflow key 'defaults' is not modelled/);
        expect(
          modelledKeyProblems(jobsOf(b3(), "B3").migrate!, "reject").join("\n"),
        ).toMatch(/Job \(reject\) key 'defaults' is not modelled/);
        expect(
          modelledKeyProblems(
            jobsOf(b4(), "B4")["e2e-smoke-gate"]!,
            "gate",
          ).join("\n"),
        ).toMatch(/Job \(gate\) key 'defaults' is not modelled/);
      });

      it("shell resolution alone: B2-B4 resolve a non-default shell, which is not modelled", () => {
        const b2Jobs = jobsOf(b2(), "B2");
        for (const jobId of REJECT_JOBS) {
          expect(() => runStepShellArgv(b2Jobs[jobId]!.steps![0]!)).toThrow(
            /\(from workflow defaults\.run\) is not modelled/,
          );
        }
        expect(() =>
          runStepShellArgv(b2Jobs["e2e-smoke-gate"]!.steps![0]!),
        ).toThrow(/\(from workflow defaults\.run\) is not modelled/);
        expect(() =>
          runStepShellArgv(jobsOf(b3(), "B3").migrate!.steps![0]!),
        ).toThrow(/\(from job defaults\.run\) is not modelled/);
        expect(runStepShellArgv(jobsOf(b3(), "B3").smoke!.steps![0]!)).toEqual(
          RUNNER_ARGV,
        );
        expect(() =>
          runStepShellArgv(jobsOf(b4(), "B4")["e2e-smoke-gate"]!.steps![0]!),
        ).toThrow(/\(from job defaults\.run\) is not modelled/);
      });
    });
  }

  it("the real ci.yml and ci-integration.yml pass the key allowlist unchanged", () => {
    for (const file of WORKFLOWS) {
      expect(() =>
        assertWorkflowKeysModelled(parseWorkflowSource(source(file))),
      ).not.toThrow();
    }
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    for (const jobId of REJECT_JOBS) {
      expect(modelledKeyProblems(integration[jobId]!, "reject"), jobId).toEqual(
        [],
      );
    }
    for (const [file, jobId] of GATE_JOBS) {
      const job = jobsOf(source(file as WorkflowPath), file)[jobId]!;
      expect(modelledKeyProblems(job, "gate"), jobId).toEqual([]);
      for (const step of job.steps ?? []) {
        if (typeof step.run === "string") {
          expect(runStepShellArgv(step), jobId).toEqual(RUNNER_ARGV);
        }
      }
    }
    for (const jobId of REJECT_JOBS) {
      expect(runStepShellArgv(integration[jobId]!.steps![0]!)).toEqual(
        RUNNER_ARGV,
      );
    }
  });

  it("the allowlists are exactly the keys the real files use", () => {
    expect([...MODELLED_WORKFLOW_KEYS].sort()).toEqual([
      "concurrency",
      "env",
      "jobs",
      "name",
      "on",
      "permissions",
    ]);
    const used = (jobs: WorkflowJob[]) => ({
      job: [...new Set(jobs.flatMap((job) => Object.keys(job)))].sort(),
      step: [
        ...new Set(
          jobs.flatMap((job) =>
            (job.steps ?? []).flatMap((step) => Object.keys(step)),
          ),
        ),
      ].sort(),
    });
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    const ci = jobsOf(source(CI), CI);
    const reject = used(REJECT_JOBS.map((jobId) => integration[jobId]!));
    const gate = used([
      integration["e2e-smoke-gate"]!,
      integration["integration-gate"]!,
      integration["e2e-gate"]!,
      ci["ci-gate"]!,
    ]);
    expect([...MODELLED_JOB_KEYS.reject].sort()).toEqual(reject.job);
    // The role lists are only the fallback for unpinned (fixture) jobs. Real
    // reject-job steps use the exact per-step tables; the four real reject-job
    // step envs (migrate "Verify document-cutover reader role (real stack)",
    // "Verify tenant isolation (real stack)", "Verify authz EXECUTE grants
    // (real stack)" and "Verify donor spine composite FKs (real stack)", pinned
    // per step) are deliberately not in the fallback.
    expect([...MODELLED_STEP_KEYS.reject].sort()).toEqual(
      reject.step.filter((key) => key !== "env"),
    );
    expect(
      REJECT_JOBS.flatMap((jobId) =>
        (integration[jobId]!.steps ?? [])
          .filter((step) => step.env !== undefined)
          .map((step) => `${jobId} ${stepIdentity(step)}`),
      ),
    ).toEqual([
      "migrate name:Verify document-cutover reader role (real stack)",
      "migrate name:Verify tenant isolation (real stack)",
      "migrate name:Verify authz EXECUTE grants (real stack)",
      "migrate name:Verify donor spine composite FKs (real stack)",
    ]);
    expect([...MODELLED_JOB_KEYS.gate].sort()).toEqual(gate.job);
    expect([...MODELLED_STEP_KEYS.gate].sort()).toEqual(gate.step);
  });

  const realJob = (role: "reject" | "gate"): WorkflowJob =>
    role === "reject"
      ? jobsOf(source(CI_INTEGRATION), CI_INTEGRATION).migrate!
      : jobsOf(source(CI_INTEGRATION), CI_INTEGRATION)["e2e-smoke-gate"]!;

  it.each([
    ["reject", "defaults", { run: { shell: "bash" } }],
    ["gate", "defaults", { run: { "working-directory": "x" } }],
    ["reject", "container", { image: "node:24" }],
    ["gate", "container", { image: "node:24" }],
    ["reject", "strategy", { matrix: { os: ["a", "b"] } }],
    ["gate", "strategy", { matrix: { os: ["a", "b"] } }],
    ["reject", "continue-on-error", true],
    ["gate", "continue-on-error", true],
    ["gate", "env", { X: "1" }],
    ["gate", "timeout-minutes", 5],
    ["reject", "outputs", { a: "b" }],
  ] as const)("a %s job with '%s' is not modelled", (role, key, value) => {
    const job = { ...realJob(role), [key]: value } as WorkflowJob;
    expect(modelledKeyProblems(job, role).join("\n")).toMatch(
      new RegExp(`Job \\(${role}\\) key '${key}' is not modelled`),
    );
  });

  it.each([
    ["reject", "continue-on-error", true],
    ["gate", "continue-on-error", true],
    ["reject", "working-directory", "apps"],
    ["gate", "working-directory", "apps"],
    ["reject", "timeout-minutes", 1],
    ["gate", "timeout-minutes", 1],
    ["reject", "shell", "bash"],
    ["gate", "shell", "bash"],
    ["reject", "env", { X: "1" }],
    ["gate", "if", "always()"],
    ["reject", "id", "x"],
  ] as const)("a %s step with '%s' is not modelled", (role, key, value) => {
    const job = realJob(role);
    const steps = [{ ...job.steps![0]!, [key]: value }, ...job.steps!.slice(1)];
    expect(modelledKeyProblems({ ...job, steps }, role).join("\n")).toMatch(
      new RegExp(`Step 0 \\(${role}\\) key '${key}' is not modelled`),
    );
  });

  it("an unmodelled workflow top-level key is reported through the reject and gate checks", () => {
    const text = mutate(
      source(CI_INTEGRATION),
      "\njobs:\n",
      "\nrun-name: x\njobs:\n",
      1,
    );
    const jobs = jobsOf(text, "run-name");
    expect(forkRejectStepIndex(jobs.migrate!)).toBe(-1);
    expect(forkRejectProblems(jobs.migrate!).join("\n")).toMatch(
      /Workflow key 'run-name' is not modelled/,
    );
    expect(enforcementProblems(text, smokeGate).join("\n")).toMatch(
      /Workflow key 'run-name' is not modelled/,
    );
  });

  it("shell resolution precedence: step over job defaults.run over workflow defaults.run", () => {
    const yaml = (stepShell: boolean, jobShell: boolean) =>
      [
        "on: push",
        "defaults:",
        "  run:",
        "    shell: workflow-shell {0}",
        "    working-directory: wf-dir",
        "jobs:",
        "  j:",
        "    runs-on: ubuntu-latest",
        ...(jobShell
          ? ["    defaults:", "      run:", "        shell: job-shell {0}"]
          : []),
        "    steps:",
        "      - run: echo hi",
        ...(stepShell ? ["        shell: step-shell {0}"] : []),
      ].join("\n");
    const settings = (stepShell: boolean, jobShell: boolean) =>
      resolveRunSettings(
        jobsOf(yaml(stepShell, jobShell), "precedence").j!.steps![0]!,
      );
    expect(settings(true, true).shell).toEqual({
      value: "step-shell {0}",
      source: "step",
    });
    expect(settings(false, true).shell).toEqual({
      value: "job-shell {0}",
      source: "job defaults.run",
    });
    expect(settings(false, false).shell).toEqual({
      value: "workflow-shell {0}",
      source: "workflow defaults.run",
    });
    expect(settings(false, false).workingDirectory).toEqual({
      value: "wf-dir",
      source: "workflow defaults.run",
    });
    expect(resolveRunSettings({ run: "echo hi" })).toEqual({
      shell: { value: undefined, source: "unset" },
      workingDirectory: { value: undefined, source: "unset" },
    });
  });

  it.each([
    [
      "an explicit bash",
      { run: "echo hi", shell: "bash" },
      /Shell "bash" \(from step\) is not modelled/,
    ],
    [
      "sh",
      { run: "echo hi", shell: "sh" },
      /Shell "sh" \(from step\) is not modelled/,
    ],
    [
      "a step working-directory",
      { run: "echo hi", "working-directory": "apps" },
      /working-directory "apps" \(from step\) is not modelled/,
    ],
  ])(
    "only the default shell is modelled: %s throws",
    (_label, step, message) => {
      expect(() => runStepShellArgv(step as WorkflowStep)).toThrow(message);
      expect(() =>
        executeRunScript(step as WorkflowStep, "echo hi", {}),
      ).toThrow(/not modelled/);
    },
  );

  it("a job defaults.run.working-directory on a reject job fails closed", () => {
    const text = mutate(
      source(CI_INTEGRATION),
      "\n  smoke:\n",
      "\n  smoke:\n    defaults:\n      run:\n        working-directory: apps\n",
      1,
    );
    const job = jobsOf(text, "wd").smoke!;
    expect(() => runStepShellArgv(job.steps![0]!)).toThrow(
      /working-directory "apps" \(from job defaults\.run\) is not modelled/,
    );
    expect(forkRejectStepIndex(job)).toBe(-1);
  });
});

describe("repair 6: pinned reject/gate if, whole-object functions, second value set", () => {
  const PROBES = [
    ["P1", `\${{ !contains(toJSON(github), '"job"') }}`, "whole"],
    ["P2", "${{ !contains(toJSON(github.event), 'fork') }}", "whole"],
    [
      "P3",
      "${{ github.event_name != 'pull_request' || !contains(toJSON(github.event.pull_request.head.repo), 'fork') }}",
      "whole",
    ],
    ["P4", "!contains(toJSON(github.event.pull_request), 'draft')", "whole"],
    ["P5", "github.event.pull_request.number == 1", "value"],
    [
      "P6",
      "github.event.pull_request.head.repo.full_name == 'outside-contributor/core'",
      "value",
    ],
    ["P7", "github.event.pull_request.head.ref == 'feature'", "value"],
    ["P8", "github.ref == 'refs/pull/1/merge'", "value"],
  ] as const;
  const unwrap = (expr: string) =>
    expr.replace(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/, "$1");
  const forkScenarios = EVENT_SCENARIOS.filter((scenario) => scenario.fork);
  const smokeNeeds = { migrate: { result: "skipped", outputs: {} } };

  const onMigrateIf = (probe: string) =>
    mutate(
      source(CI_INTEGRATION),
      "\n  migrate:\n",
      `\n  migrate:\n    if: ${JSON.stringify(probe)}\n`,
      1,
    );
  const onSmokeIf = (probe: string) =>
    mutateJob(source(CI_INTEGRATION), "smoke", (block) =>
      mutate(
        block,
        "head.repo.full_name != github.repository))\n    runs-on:",
        `head.repo.full_name != github.repository))\n      && (${unwrap(probe)})\n    runs-on:`,
        1,
      ),
    );
  const onGateIf = (probe: string) =>
    mutate(
      source(CI_INTEGRATION),
      "  e2e-smoke-gate:\n    if: always()\n",
      `  e2e-smoke-gate:\n    if: ${JSON.stringify(`always() && (${unwrap(probe)})`)}\n`,
      1,
    );

  for (const [id, probe, kind] of PROBES) {
    for (const [where, build, jobId] of [
      ["the migrate job if", onMigrateIf, "migrate"],
      ["appended to the smoke job if", onSmokeIf, "smoke"],
    ] as const) {
      describe(`${id} ${where}: ${probe}`, () => {
        const job = () => jobsOf(build(probe), id)[jobId]!;
        const needs = jobId === "smoke" ? smokeNeeds : {};

        it("the required job fails closed end to end", () => {
          expect(String(job().if)).toContain(unwrap(probe).slice(0, 20));
          expect(failsClosed(() => requiredJobFailsClosedOnFork(job()))).toBe(
            true,
          );
        });

        it("the job if pin rejects it", () => {
          expect(pinnedIfProblems(job()).join("\n")).toMatch(
            new RegExp(`Job '${jobId}' if .* is not allowed: pinned to`),
          );
        });

        if (kind === "whole") {
          it("evaluating it reaches toJSON on a whole context value, which is not modelled", () => {
            for (const scenario of forkScenarios) {
              expect(() =>
                evaluateIfCondition(job().if, scenarioContext(scenario, needs)),
              ).toThrow(
                /tojson\(\)' on the non-leaf context value .*is not modelled/i,
              );
            }
          });
        } else {
          it("value set A makes it look fork-safe; value set B shows forks skip the job", () => {
            const runs = (scenario: (typeof forkScenarios)[number]) =>
              evaluateIfCondition(job().if, scenarioContext(scenario, needs));
            expect(
              forkScenarios.filter((s) => s.valueSet === "A").every(runs),
            ).toBe(true);
            expect(
              forkScenarios
                .filter((s) => s.valueSet === "B")
                .some((s) => !runs(s)),
            ).toBe(true);
          });
        }
      });
    }

    if (kind === "whole") {
      describe(`${id} inside the e2e-smoke-gate job if`, () => {
        const gate = () => jobsOf(onGateIf(probe), id)["e2e-smoke-gate"]!;

        it("the gate is reported, not fail-closed", () => {
          expect(
            gateEnforcementProblems(gate(), ["test-e2e-smoke"]),
          ).not.toEqual([]);
          expect(
            hostedGateFailsClosedWhenHeavyNeedsSkipped(gate(), [
              "test-e2e-smoke",
            ]),
          ).toBe(false);
        });

        it("the gate job if pin rejects it", () => {
          expect(pinnedIfProblems(gate()).join("\n")).toMatch(
            /Job 'e2e-smoke-gate' if .* is not allowed: pinned to "always\(\)"/,
          );
        });

        it("evaluating it reaches toJSON on a whole context value, which is not modelled", () => {
          const needs = {
            "test-e2e-smoke": { result: "skipped", outputs: {} },
          };
          for (const scenario of forkScenarios) {
            expect(() =>
              evaluateIfCondition(gate().if, scenarioContext(scenario, needs)),
            ).toThrow(/non-leaf context value .*is not modelled/);
          }
        });
      });
    }
  }

  it("every pinned job if and step if in the real files matches its pin", () => {
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    const ci = jobsOf(source(CI), CI);
    for (const jobId of Object.keys(PINNED_JOB_IFS)) {
      const job = (jobId === "ci-gate" ? ci : integration)[jobId]!;
      expect(pinnedIfProblems(job), jobId).toEqual([]);
    }
    expect(PINNED_JOB_IFS.migrate!.jobIf).toBeNull();
  });

  const withJob = (
    file: WorkflowPath,
    jobId: string,
    fn: (block: string) => string,
  ) => jobsOf(mutateJob(source(file), jobId, fn), `${jobId} pin`)[jobId]!;

  it.each([
    [
      "reject job: an if added to migrate (pinned absent)",
      () => withJob(CI_INTEGRATION, "migrate", (b) => `    if: always()\n${b}`),
      /Job 'migrate' if "always\(\)" is not allowed: pinned to "absent"/,
    ],
    [
      "reject job: smoke's if removed",
      () =>
        withJob(CI_INTEGRATION, "smoke", (b) =>
          b.replace(/    if: >-\n(?: {6,}.*\n)+/, ""),
        ),
      /Job 'smoke' if "absent" is not allowed: pinned to "always\(\) &&/,
    ],
    [
      "reject job: smoke's if changed",
      () =>
        withJob(CI_INTEGRATION, "smoke", (b) =>
          mutate(
            b,
            "    if: >-\n      always() &&\n",
            "    if: >-\n      always() && true &&\n",
            1,
          ),
        ),
      /Job 'smoke' if .* is not allowed/,
    ],
    [
      "reject step: step 0 if removed",
      () =>
        withJob(CI_INTEGRATION, "migrate", (b) =>
          b.replace(/        if: >-\n(?: {10,}.*\n)+/, ""),
        ),
      /Job 'migrate' step 0 if "absent" is not allowed: pinned to "github\.event_name/,
    ],
    [
      "reject step: an if added to step 1 (pinned absent)",
      () =>
        withJob(CI_INTEGRATION, "smoke", (b) =>
          mutate(
            b,
            "      - uses: actions/checkout@",
            "      - if: always()\n        uses: actions/checkout@",
            1,
          ),
        ),
      /Job 'smoke' step 1 if "always\(\)" is not allowed: pinned to "absent"/,
    ],
    [
      "gate job: e2e-gate's if removed",
      () =>
        withJob(CI_INTEGRATION, "e2e-gate", (b) =>
          b.replace(/    if: >\n(?: {6,}.*\n)+/, ""),
        ),
      /Job 'e2e-gate' if "absent" is not allowed: pinned to "always\(\) && \(/,
    ],
    [
      "gate job: integration-gate's if changed",
      () =>
        withJob(CI_INTEGRATION, "integration-gate", (b) =>
          mutate(b, "    if: always()\n", "    if: always() || true\n", 1),
        ),
      /Job 'integration-gate' if "always\(\) \|\| true" is not allowed/,
    ],
    [
      "gate job: ci-gate's if changed",
      () =>
        withJob(CI, "ci-gate", (b) =>
          mutate(b, "    if: always()\n", "    if: success()\n", 1),
        ),
      /Job 'ci-gate' if "success\(\)" is not allowed: pinned to "always\(\)"/,
    ],
  ])("%s fails closed", (_label, build, message) => {
    const job = build();
    expect(pinnedIfProblems(job).join("\n")).toMatch(message);
  });

  it("gate step: an if on a gate step fails both the pin and the key allowlist, separately", () => {
    const job = withJob(CI_INTEGRATION, "e2e-smoke-gate", (b) =>
      mutate(
        b,
        "      - name: Fail if E2E smoke failed\n",
        "      - name: Fail if E2E smoke failed\n        if: always()\n",
        1,
      ),
    );
    expect(pinnedIfProblems(job).join("\n")).toMatch(
      /Job 'e2e-smoke-gate' step 0 if "always\(\)" is not allowed: pinned to "absent"/,
    );
    expect(modelledKeyProblems(job, "gate").join("\n")).toMatch(
      /Step 0 \(gate\) key 'if' is not modelled/,
    );
    expect(
      gateEnforcementProblems(job, ["test-e2e-smoke"]).join("\n"),
    ).toContain("Step 0 (gate) key 'if' is not modelled");
  });

  it("reject job: an added migrate if is reported by the fork analysis and forkRejectProblems", () => {
    const job = withJob(
      CI_INTEGRATION,
      "migrate",
      (b) => `    if: always()\n${b}`,
    );
    expect(analyzeSelfHostedForkSafety(job).problems.join("\n")).toMatch(
      /Job 'migrate' if .* is not allowed/,
    );
    expect(forkRejectProblems(job).join("\n")).toMatch(
      /Job 'migrate' if .* is not allowed/,
    );
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("the two pull-request value sets differ in every varied field", () => {
    const [a, b] = PULL_REQUEST_VALUE_SETS;
    for (const key of [
      "number",
      "forkFullName",
      "headRef",
      "mergeRef",
      "sha",
    ] as const) {
      expect(a![key], key).not.toEqual(b![key]);
    }
    const byLabel = (label: string) =>
      EVENT_SCENARIOS.find((s) => s.label === label)!;
    expect(
      byLabel("pull_request fork -> develop [values B]").github,
    ).toMatchObject({
      ref: b!.mergeRef,
      head_ref: b!.headRef,
      event: {
        pull_request: {
          number: b!.number,
          head: { repo: { full_name: b!.forkFullName } },
        },
      },
    });
    expect(EVENT_SCENARIOS.filter((s) => s.valueSet === "B")).toHaveLength(4);
  });

  it("the real yml is fork-safe under both value sets", () => {
    const integration = jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
    for (const set of ["A", "B"] as const) {
      const prs = EVENT_SCENARIOS.filter((s) => s.valueSet === set);
      expect(prs.length, set).toBe(4);
      for (const jobId of ["migrate", "smoke"] as const) {
        const job = integration[jobId]!;
        for (const scenario of prs) {
          const ctx = scenarioContext(
            scenario,
            jobId === "smoke" ? smokeNeeds : {},
          );
          const labels = evaluateRunsOn(job["runs-on"], ctx);
          expect(labels, `${jobId} ${scenario.label}`).toEqual(
            scenario.fork
              ? ["ubuntu-latest"]
              : ["self-hosted", "linux", "x64", "proxmox"],
          );
          // Step-level success() reflects earlier steps (none before step 0).
          const stepCtx = {
            ...ctx,
            status: { success: true, failure: false, cancelled: false },
          };
          expect(
            evaluateIfCondition(job.steps![0]!.if, stepCtx),
            scenario.label,
          ).toBe(scenario.fork);
          if (scenario.fork)
            expect(evaluateIfCondition(job.if, ctx), scenario.label).toBe(true);
        }
      }
      const gate = integration["e2e-smoke-gate"]!;
      expect(
        gateEnforcementProblems(gate, ["test-e2e-smoke"], prs),
        set,
      ).toEqual([]);
    }
  });
});

describe("repair 7: per-job and per-step key allowlists (no union per role)", () => {
  const integration = () => jobsOf(source(CI_INTEGRATION), CI_INTEGRATION);
  const ciJobs = () => jobsOf(source(CI), CI);
  const withJob = (
    file: WorkflowPath,
    jobId: string,
    fn: (block: string) => string,
  ) => jobsOf(mutateJob(source(file), jobId, fn), `${jobId} keys`)[jobId]!;
  const addEnvAfter = (line: string) => (block: string) =>
    mutate(block, line, `${line}        env:\n          X: y\n`, 1);

  it("the per-job and per-step tables are exactly the real yml", () => {
    for (const [jobId, table] of Object.entries(MODELLED_KEYS_BY_JOB)) {
      const job = (jobId === "ci-gate" ? ciJobs() : integration())[jobId]!;
      expect([...table.job].sort(), jobId).toEqual(Object.keys(job).sort());
      const steps = Object.fromEntries(
        (job.steps ?? []).map((step) => [
          stepIdentity(step),
          Object.keys(step).sort(),
        ]),
      );
      expect(
        Object.fromEntries(
          Object.entries(table.steps).map(([id, keys]) => [
            id,
            [...keys].sort(),
          ]),
        ),
        jobId,
      ).toEqual(steps);
      expect(Object.keys(table.steps)).toHaveLength((job.steps ?? []).length);
    }
    const envSteps = Object.entries(MODELLED_KEYS_BY_JOB).flatMap(
      ([jobId, table]) =>
        Object.entries(table.steps)
          .filter(([, keys]) => keys.includes("env"))
          .map(([id]) => `${jobId} ${id}`),
    );
    expect(envSteps).toEqual([
      "migrate name:Verify document-cutover reader role (real stack)",
      "migrate name:Verify tenant isolation (real stack)",
      "migrate name:Verify authz EXECUTE grants (real stack)",
      "migrate name:Verify donor spine composite FKs (real stack)",
      "ci-gate name:Validate correctness checks and requested compilation",
    ]);
  });

  it("the real ci-gate policy step env is modelled", () => {
    expect(modelledKeyProblems(ciJobs()["ci-gate"]!, "gate")).toEqual([]);
  });

  it.each([
    ["e2e-smoke-gate", "      - name: Fail if E2E smoke failed\n", 0],
    [
      "integration-gate",
      "      - name: Fail if integration prerequisites failed\n",
      0,
    ],
    ["e2e-gate", "      - name: Fail if E2E failed on production\n", 0],
  ] as const)("env on the %s step is not modelled", (jobId, line, index) => {
    const job = withJob(CI_INTEGRATION, jobId, addEnvAfter(line));
    expect(modelledKeyProblems(job, "gate").join("\n")).toContain(
      `Step ${index} (gate) key 'env' is not modelled`,
    );
    expect(() =>
      executeGateJob(job, { results: buildResults(job) }, EVENT_SCENARIOS[0]!),
    ).toThrow(`Step ${index} (gate) key 'env' is not modelled`);
  });

  it.each([
    ["the checkout step", "      - uses: actions/checkout@", 0],
    ["the setup-node step", "      - uses: actions/setup-node@", 1],
  ] as const)(
    "env on ci-gate's %s (a second env-bearing step) is not modelled",
    (_label, prefix, index) => {
      const job = withJob(CI, "ci-gate", (block) => {
        const start = block.indexOf(prefix);
        const lineEnd = block.indexOf("\n", start) + 1;
        return `${block.slice(0, lineEnd)}        env:\n          X: y\n${block.slice(lineEnd)}`;
      });
      expect(modelledKeyProblems(job, "gate").join("\n")).toContain(
        `Step ${index} (gate) key 'env' is not modelled`,
      );
      expect(() =>
        executeCiGateResultsStep(job, {
          results: Object.fromEntries(
            needsList(job).map((id) => [id, "success"]),
          ),
          outputs: { "compilation-plan": { requested: "true" } },
        }),
      ).toThrow(`Step ${index} (gate) key 'env' is not modelled`);
    },
  );

  it("a new env-bearing step on ci-gate is not modelled", () => {
    const job = withJob(CI, "ci-gate", (block) =>
      mutate(
        block,
        "      - name: Validate correctness checks and requested compilation\n",
        "      - name: Extra policy step\n        env:\n          X: y\n        run: echo hi\n      - name: Validate correctness checks and requested compilation\n",
        1,
      ),
    );
    expect(modelledKeyProblems(job, "gate").join("\n")).toContain(
      `Step 2 (gate) "name:Extra policy step" of job 'ci-gate' is not modelled (not a step of the real job)`,
    );
  });

  it("a repeated step is not modelled", () => {
    const job = withJob(CI_INTEGRATION, "e2e-gate", (block) => {
      const start = block.indexOf(
        "      - name: Fail if E2E failed on production\n",
      );
      return block + block.slice(start);
    });
    expect(modelledKeyProblems(job, "gate").join("\n")).toContain(
      `Step 1 (gate) "name:Fail if E2E failed on production" of job 'e2e-gate' is not modelled (repeated step)`,
    );
  });

  it.each([
    [
      "needs on migrate (only smoke has it)",
      () => withJob(CI_INTEGRATION, "migrate", (b) => `    needs: smoke\n${b}`),
      "Job (reject) key 'needs' is not modelled",
    ],
    [
      "if on migrate (only smoke has it)",
      () => withJob(CI_INTEGRATION, "migrate", (b) => `    if: always()\n${b}`),
      "Job (reject) key 'if' is not modelled",
    ],
    [
      "with on the reject step (only action steps have it)",
      () =>
        withJob(CI_INTEGRATION, "smoke", (b) =>
          mutate(
            b,
            "      - name: Reject fork pull requests\n",
            "      - name: Reject fork pull requests\n        with:\n          x: y\n",
            1,
          ),
        ),
      "Step 0 (reject) key 'with' is not modelled",
    ],
    [
      "uses on a run step (only action steps have it)",
      () =>
        withJob(CI_INTEGRATION, "migrate", (b) =>
          mutate(
            b,
            "      - name: Install dependencies\n",
            "      - name: Install dependencies\n        uses: actions/cache@v4\n",
            1,
          ),
        ),
      "Step 5 (reject) key 'uses' is not modelled",
    ],
    [
      "if on a non-reject step (only step 0 has it)",
      () =>
        withJob(CI_INTEGRATION, "migrate", (b) =>
          mutate(
            b,
            "      - name: Install dependencies\n",
            "      - name: Install dependencies\n        if: always()\n",
            1,
          ),
        ),
      "Step 5 (reject) key 'if' is not modelled",
    ],
  ])(
    "reject %s fails closed with the exact message",
    (_label, build, message) => {
      const job = build();
      expect(modelledKeyProblems(job, "reject").join("\n")).toContain(message);
      expect(forkRejectProblems(job).join("\n")).toContain(message);
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
    },
  );

  function buildResults(job: WorkflowJob) {
    return Object.fromEntries(needsList(job).map((id) => [id, "success"]));
  }
});

describe("repair 8 (MAJOR-11): env key names and runner-faithful execution", () => {
  const BASH_ENV_VALUE = "$(echo exit 0 > /tmp/x; echo /tmp/x)";
  const NODE_OPTIONS_VALUE =
    "--import=data:text/javascript,if(process.env.GITHUB_ACTIONS)process.exit(0)";
  const envLine = (key: string, value: string) =>
    `${key}: ${JSON.stringify(value)}`;
  const denied = (key: string, level: string) =>
    `env key not allowed: ${key} at ${level} (denied process-level name)`;
  const notPinned = (key: string, level: string) =>
    `env key not allowed: ${key} at ${level} (not in the pinned set)`;
  const smokeGate = ENFORCING_STEPS.find((e) => e.job === "e2e-smoke-gate")!;
  const integrationGate = ENFORCING_STEPS.find(
    (e) => e.job === "integration-gate",
  )!;
  const ciGateEntry = ENFORCING_STEPS.find((e) => e.job === "ci-gate")!;
  const addCiGateStepEnv = (keyLine: string) =>
    mutate(
      source(CI),
      "        env:\n          CI_BUILD_REQUESTED:",
      `        env:\n          ${keyLine}\n          CI_BUILD_REQUESTED:`,
      1,
    );
  const ciGateOf = (text: string) => jobsOf(text, "ci-gate env")["ci-gate"]!;
  const runCiGate = (job: WorkflowJob) =>
    executeCiGateResultsStep(job, {
      results: {
        ...Object.fromEntries(needsList(job).map((id) => [id, "success"])),
        build: "skipped",
        "test-unit": "skipped",
      },
      outputs: { "compilation-plan": { requested: "true" } },
    });

  const Y = [
    [
      "Y1",
      "workflow env",
      () =>
        addWorkflowEnv(
          source(CI_INTEGRATION),
          envLine("BASH_ENV", BASH_ENV_VALUE),
        ),
      ["migrate", "smoke"],
    ],
    [
      "Y2",
      "job 'migrate' env",
      () =>
        mutateJob(
          source(CI_INTEGRATION),
          "migrate",
          addToJobEnv(envLine("BASH_ENV", BASH_ENV_VALUE)),
        ),
      ["migrate"],
    ],
    [
      "Y3",
      "job 'smoke' env",
      () =>
        mutateJob(
          source(CI_INTEGRATION),
          "smoke",
          addToJobEnv(envLine("BASH_ENV", BASH_ENV_VALUE)),
        ),
      ["smoke"],
    ],
  ] as const;

  for (const [id, level, build, jobIds] of Y) {
    it(`${id} (BASH_ENV at ${level}): the reject step is not recognised and the job fails closed`, () => {
      const jobs = jobsOf(build(), id);
      for (const jobId of jobIds) {
        expect(forkRejectStepIndex(jobs[jobId]!), jobId).toBe(-1);
        expect(
          failsClosed(() => requiredJobFailsClosedOnFork(jobs[jobId]!)),
          jobId,
        ).toBe(true);
      }
    });

    it(`${id} (BASH_ENV at ${level}): the exact denied-name message`, () => {
      const jobs = jobsOf(build(), id);
      for (const jobId of jobIds) {
        expect(forkRejectProblems(jobs[jobId]!).join("\n"), jobId).toContain(
          denied("BASH_ENV", level),
        );
      }
    });
  }

  it("Y1 at workflow env also reaches the bash gates, which report it", () => {
    const text = addWorkflowEnv(
      source(CI_INTEGRATION),
      envLine("BASH_ENV", BASH_ENV_VALUE),
    );
    for (const gate of [smokeGate, integrationGate]) {
      expect(enforcementProblems(text, gate).join("\n"), gate.job).toContain(
        denied("BASH_ENV", "workflow env"),
      );
    }
  });

  const X = [
    [
      "X3",
      "workflow env",
      () =>
        addWorkflowEnv(source(CI), envLine("NODE_OPTIONS", NODE_OPTIONS_VALUE)),
    ],
    [
      "X4",
      "step 2 env of job 'ci-gate'",
      () => addCiGateStepEnv(envLine("NODE_OPTIONS", NODE_OPTIONS_VALUE)),
    ],
  ] as const;

  for (const [id, level, build] of X) {
    it(`${id} (NODE_OPTIONS at ${level}): the ci-gate is reported, not fail-closed`, () => {
      expect(enforcementProblems(build(), ciGateEntry)).not.toEqual([]);
    });

    it(`${id} (NODE_OPTIONS at ${level}): the exact denied-name message`, () => {
      expect(enforcementProblems(build(), ciGateEntry).join("\n")).toContain(
        denied("NODE_OPTIONS", level),
      );
      expect(() => runCiGate(ciGateOf(build()))).toThrow(
        denied("NODE_OPTIONS", level),
      );
    });
  }

  it.each([
    "BASH_ENV",
    "ENV",
    "NODE_OPTIONS",
    "NODE_PATH",
    "LD_PRELOAD",
    "LD_LIBRARY_PATH",
    "DYLD_INSERT_LIBRARIES",
    "BASH_FUNC_echo%%",
    "SHELLOPTS",
    "BASHOPTS",
    "PS4",
  ])("%s is denied at every level, for pinned and unpinned jobs", (key) => {
    expect(DENIED_ENV_KEY_PATTERNS.some((pattern) => pattern.test(key))).toBe(
      true,
    );
    expect(() => assertEnvKeysNotDenied({ [key]: "x" }, "job env")).toThrow(
      denied(key, "job env"),
    );
    expect(() => effectiveStepEnv({ [key]: "x" }, {}, {})).toThrow(
      denied(key, "workflow env"),
    );
    expect(() => effectiveStepEnv({}, { [key]: "x" }, {})).toThrow(
      denied(key, "job env"),
    );
    expect(() => effectiveStepEnv({}, {}, { [key]: "x" })).toThrow(
      denied(key, "step env"),
    );
    expect(() => executeRunScript({}, "echo hi", { [key]: "x" })).toThrow(
      denied(key, "effective env"),
    );
    // An unpinned fixture job: only the denylist applies.
    expect(envKeyProblems({ env: { [key]: "x" }, steps: [] })).toEqual([
      denied(key, "job env"),
    ]);
  });

  it.each([
    [
      "workflow env (ci-integration)",
      () => addWorkflowEnv(source(CI_INTEGRATION), envLine("FOO", "bar")),
      CI_INTEGRATION,
      "migrate",
      "workflow env",
    ],
    [
      "job 'migrate' env",
      () =>
        mutateJob(
          source(CI_INTEGRATION),
          "migrate",
          addToJobEnv(envLine("FOO", "bar")),
        ),
      CI_INTEGRATION,
      "migrate",
      "job 'migrate' env",
    ],
    [
      "job 'smoke' env",
      () =>
        mutateJob(
          source(CI_INTEGRATION),
          "smoke",
          addToJobEnv(envLine("FOO", "bar")),
        ),
      CI_INTEGRATION,
      "smoke",
      "job 'smoke' env",
    ],
    [
      "workflow env (ci.yml)",
      () => addWorkflowEnv(source(CI), envLine("FOO", "bar")),
      CI,
      "ci-gate",
      "workflow env",
    ],
    [
      "the ci-gate step env",
      () => addCiGateStepEnv(envLine("FOO", "bar")),
      CI,
      "ci-gate",
      "step 2 env of job 'ci-gate'",
    ],
  ] as const)(
    "a name outside the pinned set at %s is not allowed",
    (_label, build, _file, jobId, level) => {
      const job = jobsOf(build(), "pinned env")[jobId]!;
      expect(envKeyProblems(job)).toEqual([notPinned("FOO", level)]);
      const role = jobId === "ci-gate" ? "gate" : "reject";
      expect(modelledKeyProblems(job, role).join("\n")).toContain(
        notPinned("FOO", level),
      );
    },
  );

  it("the real workflows' env key names are exactly the pinned sets", () => {
    for (const file of WORKFLOWS) {
      expect(
        Object.keys(parseWorkflowSource(source(file)).env as object).sort(),
      ).toEqual([...MODELLED_WORKFLOW_ENV_KEYS].sort());
    }
    for (const [jobId, pin] of Object.entries(MODELLED_ENV_KEYS_BY_JOB)) {
      const job = jobsOf(
        source(jobId === "ci-gate" ? CI : CI_INTEGRATION),
        "env pins",
      )[jobId]!;
      expect(envKeyProblems(job), jobId).toEqual([]);
      expect(Object.keys(job.env ?? {}).sort(), jobId).toEqual(
        [...pin.job].sort(),
      );
      const stepEnvs = Object.fromEntries(
        (job.steps ?? [])
          .filter((step) => step.env !== undefined)
          .map((step) => [stepIdentity(step), Object.keys(step.env!).sort()]),
      );
      expect(
        Object.fromEntries(
          Object.entries(pin.steps).map(([k, v]) => [k, [...v].sort()]),
        ),
        jobId,
      ).toEqual(stepEnvs);
    }
  });

  it("bodies run from a temp file under bash --noprofile --norc -eo pipefail", () => {
    expect(runStepShellArgv({ run: "echo hi" })).toEqual(RUNNER_ARGV);
    // No "-c": bash treats its argument as a file, so the body only runs if
    // it was written to the temp script file.
    expect(RUNNER_ARGV[1]).not.toContain("-c");
    const result = executeRunScript({}, "echo hi", {});
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("hi");
  });

  it("GITHUB_ACTIONS=true and CI=true are modelled in the scrubbed env", () => {
    expect(MODELLED_RUNNER_ENV).toEqual({ GITHUB_ACTIONS: "true", CI: "true" });
    const result = executeRunScript({}, 'echo "$GITHUB_ACTIONS $CI"', {});
    expect(result.stdout.trim()).toBe("true true");
    // The pinned ci-gate body runs with them too (a child program sees them).
    const passed = executeRunScript({}, PINNED_CI_GATE_BODY, {
      CI_RESULTS: JSON.stringify({
        plan: "success",
        format: "success",
        integrity: "success",
        lint: "success",
        typecheck: "success",
        unit: "success",
        build: "success",
        acceptance: "success",
      }),
      CI_BUILD_REQUESTED: "true",
    });
    expect(passed.status, passed.stdout + passed.stderr).toBe(0);
  });
});

describe("repair 9: the migrate 'Verify document-cutover reader role (real stack)' step", () => {
  const NAME = "Verify document-cutover reader role (real stack)";
  const ID = `name:${NAME}`;
  const KEY = "DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL";
  const RUN =
    "bun x vitest run tests/unit/acceptance/issue-2067/reader-role.integration.acceptance.test.ts";
  const STEP_TEXT = `      - name: ${NAME}\n        env:\n          ${KEY}: \${{ env.DATABASE_URL }}\n        run: ${RUN}\n`;
  const migrateOf = (text: string) => jobsOf(text, "repair 9").migrate!;
  const editMigrate = (fn: (block: string) => string) =>
    migrateOf(mutateJob(source(CI_INTEGRATION), "migrate", fn));
  const editStep = (replacement: string) =>
    editMigrate((block) => mutate(block, STEP_TEXT, replacement, 1));
  const level = (index: number) => `step ${index} env of job 'migrate'`;

  it("the real step is pinned exactly: name, position 14, run, env, no if", () => {
    const job = migrateOf(source(CI_INTEGRATION));
    const index = job.steps!.findIndex((step) => step.name === NAME);
    expect(index).toBe(14);
    const step = job.steps![index]!;
    expect(PINNED_STEP_BODIES.migrate![ID]).toEqual({
      index,
      run: step.run!.trim(),
      env: step.env,
    });
    expect(step.env).toEqual({ [KEY]: "${{ env.DATABASE_URL }}" });
    expect(step.if).toBeUndefined();
    expect(MODELLED_ENV_KEYS_BY_JOB.migrate!.steps[ID]).toEqual([KEY]);
  });

  it("the real migrate job passes every check with the step modelled", () => {
    const job = migrateOf(source(CI_INTEGRATION));
    expect(modelledKeyProblems(job, "reject")).toEqual([]);
    expect(envKeyProblems(job)).toEqual([]);
    expect(pinnedIfProblems(job)).toEqual([]);
    expect(forkRejectProblems(job)).toEqual([]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(true);
  });

  it("another env key on the step is not allowed", () => {
    const job = editStep(
      STEP_TEXT.replace("        run:", "          OTHER: x\n        run:"),
    );
    expect(envKeyProblems(job)).toEqual([
      `env key not allowed: OTHER at ${level(14)} (not in the pinned set)`,
    ]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it.each([
    ["another env reference", "${{ env.PAYLOAD_DATABASE_URI }}"],
    ["a literal URL", "postgresql://postgres:postgres@evil:5432/x"],
    ["a secret", "${{ secrets.ADMIN_DATABASE_URL }}"],
  ])("another value (%s) for the key is not allowed", (_label, value) => {
    const job = editStep(STEP_TEXT.replace("${{ env.DATABASE_URL }}", value));
    expect(envKeyProblems(job)).toEqual([
      `env value not allowed: ${KEY} at ${level(14)} (pinned to "\${{ env.DATABASE_URL }}")`,
    ]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it.each([
    ["migrate", "Verify seed counts", 13],
    ["smoke", "Assert health response shape", 8],
  ] as const)(
    "the key on another step (%s step %s) is not allowed",
    (jobId, stepName, index) => {
      const line = `      - name: ${stepName}\n`;
      const job = jobsOf(
        mutateJob(source(CI_INTEGRATION), jobId, (block) =>
          mutate(
            block,
            line,
            `${line}        env:\n          ${KEY}: \${{ env.DATABASE_URL }}\n`,
            1,
          ),
        ),
        "key elsewhere",
      )[jobId]!;
      const problems = modelledKeyProblems(job, "reject").join("\n");
      expect(problems).toContain(
        `Step ${index} (reject) key 'env' is not modelled`,
      );
      expect(problems).toContain(
        `env key not allowed: ${KEY} at step ${index} env of job '${jobId}' (not in the pinned set)`,
      );
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
    },
  );

  it("a changed run body is not modelled", () => {
    const job = editStep(
      STEP_TEXT.replace(RUN, "bun x vitest run tests/unit/"),
    );
    expect(modelledKeyProblems(job, "reject").join("\n")).toContain(
      `Step 14 (reject) "${ID}" of job 'migrate' is not modelled (run differs from the pinned body`,
    );
  });

  it("a moved step (right after the reject step) is not modelled", () => {
    const job = editMigrate((block) => {
      const without = mutate(block, STEP_TEXT, "", 1);
      const reject = `          echo "${FORK_FAIL_MESSAGE}"\n          exit 1\n`;
      return mutate(without, reject, `${reject}${STEP_TEXT}`, 1);
    });
    expect(modelledKeyProblems(job, "reject").join("\n")).toContain(
      `Step 1 (reject) "${ID}" of job 'migrate' is not modelled (pinned to position 14)`,
    );
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("moving the step ahead of the fork reject removes its guard and fails closed", () => {
    const job = editMigrate((block) => {
      const without = mutate(block, STEP_TEXT, "", 1);
      return mutate(
        without,
        "      - name: Reject fork pull requests\n",
        `${STEP_TEXT}      - name: Reject fork pull requests\n`,
        1,
      );
    });
    const problems = forkRejectProblems(job).join("\n");
    // The job is no longer the modelled job, so the reject step is not recognised.
    expect(problems).toContain("no fork-reject step");
    expect(problems).toContain(
      `Step 0 (reject) "${ID}" of job 'migrate' is not modelled (pinned to position 14)`,
    );
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it.each([
    ["always()", "always()"],
    ["${{ always() }}", "${{ always() }}"],
    ["failure()", "failure()"],
    ["!cancelled()", "${{ !cancelled() }}"],
  ])(
    "weakening the step's fork guard with if: %s fails closed (pinned absent)",
    (_label, condition) => {
      const job = editStep(
        STEP_TEXT.replace(
          "        env:",
          `        if: ${condition}\n        env:`,
        ),
      );
      expect(pinnedIfProblems(job)).toEqual([
        `Job 'migrate' step 14 if ${JSON.stringify(condition)} is not allowed: pinned to "absent"`,
      ]);
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
    },
  );

  it.each([
    [
      "success() || failure()",
      "success() || failure()",
      "success() || failure()",
    ],
    [
      "${{ success() || failure() }}",
      "${{ success() || failure() }}",
      "${{ success() || failure() }}",
    ],
    // Bare (no ${{ }}); YAML requires quoting a value that starts with "!".
    ['"!cancelled()" (bare)', '"!cancelled()"', "!cancelled()"],
  ])(
    "weakening the step's fork guard with if: %s fails closed (pinned absent)",
    (_label, yaml, parsed) => {
      const job = editStep(
        STEP_TEXT.replace("        env:", `        if: ${yaml}\n        env:`),
      );
      expect(job.steps![14]!.if).toBe(parsed);
      expect(pinnedIfProblems(job)).toEqual([
        `Job 'migrate' step 14 if ${JSON.stringify(parsed)} is not allowed: pinned to "absent"`,
      ]);
      expect(requiredJobFailsClosedOnFork(job)).toBe(false);
    },
  );

  it("an unquoted if: !cancelled() (a YAML tag, parsed as null) fails the if-pin itself, and the key allowlist", () => {
    const job = editStep(
      STEP_TEXT.replace(
        "        env:",
        "        if: !cancelled()\n        env:",
      ),
    );
    expect(job.steps![14]!.if).toBeNull();
    expect(pinnedIfProblems(job)).toEqual([
      `Job 'migrate' step 14 if key is present with a null value (not absent) and is not allowed: pinned to "absent"`,
    ]);
    expect(modelledKeyProblems(job, "reject").join("\n")).toContain(
      "Step 14 (reject) key 'if' is not modelled",
    );
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it.each([
    ["an unquoted YAML tag", "if: !cancelled()"],
    ["a bare if:", "if:"],
    ["if: ~", "if: ~"],
    ["if: null", "if: null"],
  ])(
    "pinnedIfProblems: an if key present with a null value (%s) is rejected; an absent key is accepted",
    (_label, line) => {
      const nullMessage = (where: string, pinned: string) =>
        `${where} if key is present with a null value (not absent) and is not allowed: pinned to ${JSON.stringify(pinned)}`;
      // Key absent: the real migrate job (no job if, no step if after step 0) passes.
      expect(pinnedIfProblems(migrateOf(source(CI_INTEGRATION)))).toEqual([]);
      // Present on step 14 (pinned absent).
      const onStep = editStep(
        STEP_TEXT.replace("        env:", `        ${line}\n        env:`),
      );
      expect(Object.hasOwn(onStep.steps![14]!, "if")).toBe(true);
      expect(onStep.steps![14]!.if ?? null).toBeNull();
      expect(pinnedIfProblems(onStep)).toEqual([
        nullMessage("Job 'migrate' step 14", "absent"),
      ]);
      // Present on the migrate job (pinned absent).
      const onJob = editMigrate((block) => `    ${line}\n${block}`);
      expect(pinnedIfProblems(onJob)).toEqual([
        nullMessage("Job 'migrate'", "absent"),
      ]);
      // General, not only step 14: a gate step (pinned absent).
      const gateLine = "      - name: Fail if E2E smoke failed\n";
      const gate = jobsOf(
        mutateJob(source(CI_INTEGRATION), "e2e-smoke-gate", (block) =>
          mutate(block, gateLine, `${gateLine}        ${line}\n`, 1),
        ),
        "null if gate",
      )["e2e-smoke-gate"]!;
      expect(pinnedIfProblems(gate)).toEqual([
        nullMessage("Job 'e2e-smoke-gate' step 0", "absent"),
      ]);
    },
  );

  it("the step gets exactly the fork protection of its DATABASE_URL siblings", () => {
    const job = migrateOf(source(CI_INTEGRATION));
    const siblings = job
      .steps!.map((step, index) => ({ step, index }))
      .filter(({ step }) =>
        /\$DATABASE_URL|env\.DATABASE_URL/.test(
          `${step.run ?? ""} ${JSON.stringify(step.env ?? {})}`,
        ),
      )
      .map(({ index }) => index);
    expect(siblings).toEqual([8, 11, 12, 13, 14, 16, 17, 18]);
    expect(job.if).toBeUndefined();
    for (const index of siblings) {
      expect(job.steps![index]!.if, `step ${index}`).toBeUndefined();
    }
    for (const index of siblings) {
      const name = job.steps![index]!.name!;
      const line = `      - name: ${name}\n`;
      const edited = editMigrate((block) =>
        mutate(block, line, `${line}        if: always()\n`, 1),
      );
      expect(pinnedIfProblems(edited), name).toEqual([
        `Job 'migrate' step ${index} if "always()" is not allowed: pinned to "absent"`,
      ]);
    }
  });
});

describe("#2252: the migrate 'Verify donor spine composite FKs (real stack)' step", () => {
  const NAME = "Verify donor spine composite FKs (real stack)";
  const ID = `name:${NAME}`;
  const KEY = "TENANT_GUARD_IT_ADMIN_DATABASE_URL";
  const RUN =
    "bun x vitest run tests/unit/acceptance/issue-2252/donor-spine-fk.realstack.acceptance.test.ts";
  const STEP_TEXT = `      - name: ${NAME}\n        env:\n          ${KEY}: \${{ env.DATABASE_URL }}\n        run: ${RUN}\n`;
  const migrateOf = (text: string) => jobsOf(text, "#2252").migrate!;
  const editStep = (replacement: string) =>
    migrateOf(
      mutateJob(source(CI_INTEGRATION), "migrate", (block) =>
        mutate(block, STEP_TEXT, replacement, 1),
      ),
    );

  it("the real step is the last migrate step, pinned exactly: name, position 18, run, env, no if", () => {
    const job = migrateOf(source(CI_INTEGRATION));
    const index = job.steps!.findIndex((step) => step.name === NAME);
    expect(index).toBe(18);
    expect(index).toBe(job.steps!.length - 1);
    const step = job.steps![index]!;
    expect(PINNED_STEP_BODIES.migrate![ID]).toEqual({
      index,
      run: step.run!.trim(),
      env: step.env,
    });
    expect(step.env).toEqual({ [KEY]: "${{ env.DATABASE_URL }}" });
    expect(step.if).toBeUndefined();
    expect(MODELLED_ENV_KEYS_BY_JOB.migrate!.steps[ID]).toEqual([KEY]);
    expect(modelledKeyProblems(job, "reject")).toEqual([]);
    expect(envKeyProblems(job)).toEqual([]);
    expect(pinnedIfProblems(job)).toEqual([]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(true);
  });

  it.each([
    ["a substring filter", "bun x vitest run realstack.acceptance"],
    ["a directory filter", "bun x vitest run tests/unit/acceptance/issue-2252"],
  ])("%s instead of the explicit file is not modelled", (_label, run) => {
    const job = editStep(STEP_TEXT.replace(RUN, run));
    expect(modelledKeyProblems(job, "reject").join("\n")).toContain(
      `Step 18 (reject) "${ID}" of job 'migrate' is not modelled (run differs from the pinned body`,
    );
  });

  it.each([
    ["a secret", "${{ secrets.ADMIN_DATABASE_URL }}"],
    ["a literal URL", "postgresql://postgres:postgres@evil:5432/x"],
  ])("another value (%s) for the key is not allowed", (_label, value) => {
    const job = editStep(STEP_TEXT.replace("${{ env.DATABASE_URL }}", value));
    expect(envKeyProblems(job)).toEqual([
      `env value not allowed: ${KEY} at step 18 env of job 'migrate' (pinned to "\${{ env.DATABASE_URL }}")`,
    ]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("if: always() on the step fails closed (pinned absent)", () => {
    const job = editStep(
      STEP_TEXT.replace("        env:", "        if: always()\n        env:"),
    );
    expect(pinnedIfProblems(job)).toEqual([
      `Job 'migrate' step 18 if "always()" is not allowed: pinned to "absent"`,
    ]);
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("removing the step is not modelled", () => {
    const job = editStep("");
    expect(job.steps!.some((step) => step.name === NAME)).toBe(false);
    expect(modelledKeyProblems(job, "reject")).toEqual([
      `Pinned step "${ID}" of job 'migrate' is missing (pinned to position 18)`,
    ]);
  });
});
