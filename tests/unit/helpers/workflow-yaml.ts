import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  conjuncts,
  evaluateExpression,
  exprEquals,
  parseExpression,
  truthy,
  usesStatusFunction,
  walkExpression,
  type EvalContext,
  type ExprNode,
  type ExprValue,
} from "./github-expression";
import { validateCiGate } from "../../../scripts/verify/ci-build-policy.mjs";

/** Parsed GitHub Actions workflow (jobs map only). */
export type WorkflowJobs = Record<string, WorkflowJob>;

export type WorkflowJob = {
  "runs-on"?: string | string[];
  "timeout-minutes"?: number;
  if?: string | boolean;
  needs?: string | string[];
  name?: string;
  uses?: string;
  steps?: WorkflowStep[];
  [key: string]: unknown;
};

export function jobTimeoutMinutes(job: WorkflowJob): number | undefined {
  const value = job["timeout-minutes"];
  return typeof value === "number" ? value : undefined;
}

export function jobRunsOn(job: WorkflowJob): string | string[] | undefined {
  return job["runs-on"];
}

export function jobCallsReusableWorkflow(job: WorkflowJob): boolean {
  return typeof job.uses === "string" && job.uses.length > 0;
}

export type WorkflowStep = {
  uses?: string;
  run?: string;
  name?: string;
  if?: string | boolean;
  shell?: string;
  env?: Record<string, unknown>;
  with?: Record<string, unknown>;
  [key: string]: unknown;
};

export const SPEC_COMMENT_URL =
  "https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612";

/** Spec rev 3 §3 guard `G` (same-repo only on self-hosted heavy jobs). */
export const SAME_REPO_GUARD =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";

/** Fork-only step guard (inverse of same-repo success on PRs). */
export const FORK_ONLY_STEP_GUARD =
  "github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository";

export const SELF_HOSTED_LABELS = [
  "self-hosted",
  "linux",
  "x64",
  "proxmox",
] as const;

/** Spec rev 3 §3 / done criterion 11 — required checks fail closed on forks with this message. */
export const FORK_FAIL_MESSAGE = "fork PRs need a maintainer to run CI";

/** Parsed GitHub Actions workflow document (`on`, `jobs`, and the rest). */
export type WorkflowDocument = {
  on?: unknown;
  jobs?: WorkflowJobs;
  [key: string]: unknown;
};

/** Parse workflow YAML text with Bun's YAML parser (in-process under Bun, else via `bun`). */
export function parseWorkflowSource(source: string): WorkflowDocument {
  const bun = globalThis.Bun as
    { YAML: { parse(input: string): unknown } } | undefined;
  if (bun?.YAML) {
    return bun.YAML.parse(source) as WorkflowDocument;
  }

  const result = spawnSync(
    "bun",
    [
      "-e",
      "console.log(JSON.stringify(Bun.YAML.parse(await Bun.stdin.text())))",
    ],
    { encoding: "utf8", input: source },
  );
  if (result.status !== 0) {
    throw new Error(`Bun YAML parse failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout) as WorkflowDocument;
}

export function loadWorkflowDocument(relativePath: string): WorkflowDocument {
  return parseWorkflowSource(readFileSync(path.resolve(relativePath), "utf8"));
}

/** Owning workflow-level `env` of each job handed out by {@link workflowJobs}. */
const workflowEnvByJob = new WeakMap<WorkflowJob, unknown>();
/** Owning job of each step handed out by {@link workflowJobs}. */
const jobByStep = new WeakMap<WorkflowStep, WorkflowJob>();

export function workflowJobs(
  doc: WorkflowDocument,
  label = "workflow",
): WorkflowJobs {
  if (!doc?.jobs || typeof doc.jobs !== "object") {
    throw new Error(`Missing jobs map in ${label}`);
  }
  for (const job of Object.values(doc.jobs)) {
    if (!job || typeof job !== "object") continue;
    workflowEnvByJob.set(job, doc.env);
    for (const step of job.steps ?? []) {
      if (step && typeof step === "object") jobByStep.set(step, job);
    }
  }
  return doc.jobs;
}

/** The workflow-level `env` of the document a job was loaded from (undefined for fixtures). */
export function workflowEnvOf(job: WorkflowJob): unknown {
  return workflowEnvByJob.get(job);
}

/** Env levels outside the step itself: workflow `env` and job `env`. */
export type StepEnvContext = { workflowEnv?: unknown; jobEnv?: unknown };

export function stepEnvContextOf(job: WorkflowJob): StepEnvContext {
  return { workflowEnv: workflowEnvOf(job), jobEnv: job.env };
}

function envLevel(level: unknown, label: string): Record<string, unknown> {
  if (level === undefined || level === null) return {};
  if (typeof level !== "object" || Array.isArray(level)) {
    throw new Error(`${label} env is not a map: ${JSON.stringify(level)}`);
  }
  return level as Record<string, unknown>;
}

function envValueText(key: string, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  throw new Error(`env.${key} is not a scalar: ${JSON.stringify(value)}`);
}

/**
 * The env a `run:` step sees, as the Actions runner builds it: workflow `env`,
 * then job `env`, then step `env`, later levels winning; scalar values are
 * stringified (`null` -> ""). A non-map level or a non-scalar value throws.
 */
export function effectiveStepEnv(
  workflowEnv: unknown,
  jobEnv: unknown,
  stepEnv: unknown,
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const [label, level] of [
    ["workflow", workflowEnv],
    ["job", jobEnv],
    ["step", stepEnv],
  ] as const) {
    for (const [key, value] of Object.entries(envLevel(level, label))) {
      merged[key] = envValueText(key, value);
    }
  }
  return merged;
}

export function loadWorkflowJobs(relativePath: string): WorkflowJobs {
  return workflowJobs(loadWorkflowDocument(relativePath), relativePath);
}

/** Event names from a workflow's `on:` (string, list, or map form), sorted. */
export function workflowTriggerEvents(doc: WorkflowDocument): string[] {
  const on = doc.on;
  if (typeof on === "string") return [on];
  if (Array.isArray(on)) return on.map(String).sort();
  if (on && typeof on === "object") return Object.keys(on).sort();
  throw new Error("Workflow has no on: triggers");
}

/** Trigger events that {@link EVENT_SCENARIOS} does not model, sorted. */
export function unmodeledTriggerEvents(doc: WorkflowDocument): string[] {
  const modeled = new Set(MODELED_TRIGGER_EVENTS);
  return workflowTriggerEvents(doc).filter((event) => !modeled.has(event));
}

export function normalizeWorkflowExpression(expression: string): string {
  return expression.replace(/\s+/g, " ").trim();
}

export function normalizeRunsOn(
  runsOn: string | string[] | undefined,
): string[] {
  if (runsOn === undefined) return [];
  if (Array.isArray(runsOn)) {
    return runsOn.map(String);
  }
  return [String(runsOn)];
}

export function labelsEqual(
  a: readonly string[],
  b: readonly string[],
): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

export function isSelfHostedRunsOn(
  runsOn: string | string[] | undefined,
): boolean {
  const labels = normalizeRunsOn(runsOn);
  return labelsEqual(labels, SELF_HOSTED_LABELS);
}

export function isHostedUbuntuLatest(
  runsOn: string | string[] | undefined,
): boolean {
  const labels = normalizeRunsOn(runsOn);
  return labels.length === 1 && labels[0] === "ubuntu-latest";
}

export function isHostedUbuntuSlim(
  runsOn: string | string[] | undefined,
): boolean {
  const labels = normalizeRunsOn(runsOn);
  return labels.length === 1 && labels[0] === "ubuntu-slim";
}

/**
 * Fork-aware runs-on: an expression that, evaluated for every modeled event,
 * sends fork pull requests to a GitHub-hosted `ubuntu-*` runner and every
 * same-repository event to exactly the proxmox labels.
 */
export function isForkAwareRunsOnExpression(
  runsOn: string | string[] | undefined,
): boolean {
  if (typeof runsOn !== "string" || !runsOn.includes("${{")) return false;
  try {
    return EVENT_SCENARIOS.every((scenario) => {
      const labels = evaluateRunsOn(runsOn, scenarioContext(scenario, {}));
      return scenario.fork
        ? isHostedUbuntuLabels(labels)
        : labelsEqual(labels, SELF_HOSTED_LABELS);
    });
  } catch {
    return false;
  }
}

/** Job `if` as expression text; YAML booleans/numbers (`if: false`) become literals, absent is "". */
export function ifExpression(job: WorkflowJob): string {
  return conditionText(job.if) ?? "";
}

function conditionText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return undefined;
}

export function needsList(job: WorkflowJob): string[] {
  const needs = job.needs;
  if (needs === undefined) return [];
  return Array.isArray(needs) ? [...needs] : [needs];
}

function tryParse(expression: string): ExprNode | undefined {
  try {
    return parseExpression(expression);
  } catch {
    return undefined;
  }
}

/**
 * Structural guard check: guard G must be one conjunct of the top-level `&&`
 * chain (or the whole expression), so `true || G`, `G || true` and
 * `always() || G` are rejected and G is a necessary condition for the job.
 */
export function containsSameRepoGuard(expression: string): boolean {
  const ast = tryParse(expression);
  if (!ast) return false;
  const guard = parseExpression(SAME_REPO_GUARD);
  return conjuncts(ast).some((part) => exprEquals(part, guard));
}

/** Structural: every conjunct of the fork-only condition is a top-level conjunct of the step `if`. */
export function isForkOnlyStepGuard(expression: unknown): boolean {
  if (typeof expression !== "string" || !expression) return false;
  const ast = tryParse(expression);
  if (!ast) return false;
  const parts = conjuncts(ast);
  return conjuncts(parseExpression(FORK_ONLY_STEP_GUARD)).every((required) =>
    parts.some((part) => exprEquals(part, required)),
  );
}

/** Structural: the expression is exactly `always()` (optionally `${{ }}`-wrapped). */
export function isAlwaysExpression(expression: unknown): boolean {
  if (typeof expression !== "string" || !expression) return false;
  const ast = tryParse(expression);
  return (
    ast !== undefined &&
    ast.kind === "call" &&
    ast.name === "always" &&
    ast.args.length === 0
  );
}

// ---------------------------------------------------------------------------
// Event model and evaluation of job `if` / `runs-on`
// ---------------------------------------------------------------------------

export const REPOSITORY = "Asymmetric-al/core";
export const FORK_REPOSITORY = "outside-contributor/core";

export type EventScenario = {
  label: string;
  /** True only for a pull_request whose head repo differs from the base repo. */
  fork: boolean;
  github: ExprValue;
};

function pullRequestScenario(fork: boolean, baseRef: string): EventScenario {
  const headRepo = fork ? FORK_REPOSITORY : REPOSITORY;
  return {
    label: `pull_request ${fork ? "fork" : "same-repo"} -> ${baseRef}`,
    fork,
    github: {
      event_name: "pull_request",
      repository: REPOSITORY,
      ref: "refs/pull/1/merge",
      base_ref: baseRef,
      head_ref: "feature",
      event: {
        pull_request: {
          number: 1,
          head: { ref: "feature", repo: { full_name: headRepo } },
          base: { ref: baseRef, repo: { full_name: REPOSITORY } },
        },
      },
    },
  };
}

function refScenario(eventName: string, branch: string): EventScenario {
  return {
    label: `${eventName} ${branch}`,
    fork: false,
    github: {
      event_name: eventName,
      repository: REPOSITORY,
      ref: `refs/heads/${branch}`,
      ref_name: branch,
      base_ref: "",
      head_ref: "",
      event: {},
    },
  };
}

/** Every event shape the CI workflows trigger on, fork and same-repo. */
export const EVENT_SCENARIOS: readonly EventScenario[] = [
  pullRequestScenario(true, "develop"),
  pullRequestScenario(true, "production"),
  pullRequestScenario(false, "develop"),
  pullRequestScenario(false, "production"),
  refScenario("push", "develop"),
  refScenario("push", "production"),
  refScenario("workflow_dispatch", "develop"),
  refScenario("workflow_dispatch", "production"),
  refScenario("workflow_dispatch", "feature"),
];

/**
 * The only trigger events the fork analysis models. Any other trigger (for
 * example `pull_request_target`, where the `event_name == 'pull_request'` fork
 * checks are false) is outside the model and must fail the trigger pin.
 */
export const MODELED_TRIGGER_EVENTS: readonly string[] = [
  ...new Set(
    EVENT_SCENARIOS.map((scenario) =>
      String((scenario.github as { event_name: string }).event_name),
    ),
  ),
].sort();

const NEED_RESULTS = ["success", "failure", "skipped", "cancelled"] as const;
const OUTPUT_VALUES = ["true", "false"] as const;

type NeedsState = Record<
  string,
  { result: string; outputs: Record<string, string> }
>;

/** All combinations of need results (and boolean-ish outputs) for a job's needs. */
export function needsScenarios(job: WorkflowJob): NeedsState[] {
  let states: NeedsState[] = [{}];
  for (const needId of needsList(job)) {
    const next: NeedsState[] = [];
    for (const state of states) {
      for (const result of NEED_RESULTS) {
        for (const output of OUTPUT_VALUES) {
          next.push({
            ...state,
            [needId]: { result, outputs: { requested: output } },
          });
        }
      }
    }
    states = next;
  }
  return states;
}

export function scenarioContext(
  scenario: EventScenario,
  needs: NeedsState,
): EvalContext {
  const results = Object.values(needs).map((need) => need.result);
  return {
    contexts: {
      github: scenario.github,
      needs: needs as unknown as ExprValue,
      inputs: {},
      vars: {},
    },
    status: {
      success: results.every((result) => result === "success"),
      failure: results.some((result) => result === "failure"),
      cancelled: false,
    },
  };
}

/** GitHub job/step `if`: absent means `success()`; no status function means `success() && (...)`. */
export function evaluateIfCondition(
  condition: unknown,
  ctx: EvalContext,
): boolean {
  const expression = conditionText(condition);
  if (expression === undefined || expression.trim() === "") {
    return ctx.status?.success ?? true;
  }
  const ast = parseExpression(expression);
  const value = evaluateExpression(ast, ctx);
  if (!usesStatusFunction(ast)) {
    return (ctx.status?.success ?? true) && truthy(value);
  }
  return truthy(value);
}

export function evaluateRunsOn(
  runsOn: string | string[] | undefined,
  ctx: EvalContext,
): string[] {
  if (typeof runsOn === "string" && runsOn.includes("${{")) {
    const value = evaluateExpression(parseExpression(runsOn), ctx);
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") return [value];
    throw new Error(`runs-on evaluated to ${JSON.stringify(value)}`);
  }
  return normalizeRunsOn(runsOn);
}

export function isHostedUbuntuLabels(labels: readonly string[]): boolean {
  return labels.length === 1 && /^ubuntu-[a-z0-9.-]+$/.test(labels[0]!);
}

/** A job is self-hosted when any same-repo event would put it on self-hosted labels. */
export function isSelfHostedJob(job: WorkflowJob): boolean {
  if (jobCallsReusableWorkflow(job)) return false;
  return EVENT_SCENARIOS.filter((scenario) => !scenario.fork).some((scenario) =>
    evaluateRunsOn(jobRunsOn(job), scenarioContext(scenario, {})).includes(
      "self-hosted",
    ),
  );
}

// ---------------------------------------------------------------------------
// Secret references
// ---------------------------------------------------------------------------

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value))
    value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, out));
  }
  return out;
}

function expressionUsesSecret(ast: ExprNode): boolean {
  let found = false;
  walkExpression(ast, (node) => {
    if (node.kind === "ident" && node.name.toLowerCase() === "secrets")
      found = true;
    const isGithubRoot = (n: ExprNode) =>
      n.kind === "ident" && n.name.toLowerCase() === "github";
    if (
      node.kind === "member" &&
      isGithubRoot(node.object) &&
      node.property.toLowerCase() === "token"
    ) {
      found = true;
    }
    if (
      node.kind === "index" &&
      isGithubRoot(node.object) &&
      node.index.kind === "literal" &&
      String(node.index.value).toLowerCase() === "token"
    ) {
      found = true;
    }
  });
  return found;
}

/**
 * True when any string anywhere in `value` contains a `${{ }}` expression that
 * reads `secrets.*` / `secrets[...]` / `github.token`. An expression that
 * cannot be parsed but mentions `secrets` or `token` counts as a secret use.
 */
export function referencesSecrets(value: unknown): boolean {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // `secrets: inherit` on a reusable-workflow call.
    if ((value as Record<string, unknown>).secrets !== undefined) return true;
  }
  return collectStrings(value).some((text) => {
    for (const match of text.matchAll(/\$\{\{([\s\S]*?)\}\}/g)) {
      const body = match[1]!;
      const ast = tryParse(body);
      if (!ast) {
        if (/secrets|token/i.test(body)) return true;
        continue;
      }
      if (expressionUsesSecret(ast)) return true;
    }
    return false;
  });
}

/** Job-level keys whose values reach every step (or the runner) before steps run. */
const JOB_LEVEL_KEYS_EXCLUDING_STEPS = (job: WorkflowJob) =>
  Object.fromEntries(Object.entries(job).filter(([key]) => key !== "steps"));

export function jobLevelReferencesSecrets(job: WorkflowJob): boolean {
  return referencesSecrets(JOB_LEVEL_KEYS_EXCLUDING_STEPS(job));
}

export function firstSecretStepIndex(job: WorkflowJob): number {
  return allSteps(job).findIndex((step) => referencesSecrets(step));
}

// ---------------------------------------------------------------------------
// Fork-reject step and self-hosted fork safety
// ---------------------------------------------------------------------------

/**
 * Structural fork-reject check: a `run:` step (no `uses:`) whose `if` is the
 * fork-only guard, that cannot be neutralized by `continue-on-error` on any
 * fork event, and whose body — executed under the step's real shell
 * (`bash -e` by default) with the runner's effective env (workflow, then job,
 * then step `env`) — exits non-zero and prints {@link FORK_FAIL_MESSAGE}.
 * A substring match is not enough: `exit 0` before `exit 1` must fail this.
 * `ctx` defaults to the workflow/job the step was loaded from; any env value
 * containing `${{` (or an env that cannot be built statically) fails closed.
 */
export function isForkRejectStep(
  step: WorkflowStep,
  ctx?: StepEnvContext,
): boolean {
  const run = step.run;
  if (typeof run !== "string" || step.uses !== undefined) return false;
  if (!isForkOnlyStepGuard(step.if)) return false;
  const owner = jobByStep.get(step);
  const envCtx = ctx ?? (owner ? stepEnvContextOf(owner) : {});
  try {
    const env = effectiveStepEnv(envCtx.workflowEnv, envCtx.jobEnv, step.env);
    if ([run, ...Object.values(env)].some((text) => text.includes("${{"))) {
      return false;
    }
    const neutralized = EVENT_SCENARIOS.filter((s) => s.fork).some((scenario) =>
      evaluateFlag(step["continue-on-error"], scenarioContext(scenario, {})),
    );
    if (neutralized) return false;
    const result = executeRunScript(step, run, env);
    return (
      result.status !== 0 &&
      `${result.stdout}\n${result.stderr}`.includes(FORK_FAIL_MESSAGE)
    );
  } catch {
    return false;
  }
}

export function forkRejectStepIndex(job: WorkflowJob): number {
  const ctx = stepEnvContextOf(job);
  return allSteps(job).findIndex((step) => isForkRejectStep(step, ctx));
}

/**
 * Problems with a fork-reachable job's fork-reject ordering. The reject step
 * must be the first step (so no action — including implicit `github.token`
 * users such as checkout — runs first), must run for every fork event and no
 * same-repo event, must precede every step that references secrets, and the
 * job must have no job-level secret references (job-level env/services/
 * container values exist before any step, so no step can precede them).
 */
export function forkRejectProblems(job: WorkflowJob): string[] {
  const problems: string[] = [];
  const steps = allSteps(job);
  const rejectIndex = forkRejectStepIndex(job);
  if (rejectIndex === -1) {
    // A job-level `${{ }}` env value also makes the reject step unprovable,
    // so report the job-level secret use alongside the missing reject step.
    return [
      "no fork-reject step (fork-only if; body exits non-zero printing the message; no continue-on-error)",
      ...(jobLevelReferencesSecrets(job)
        ? ["job-level keys reference secrets in a fork-reachable job"]
        : []),
    ];
  }
  if (rejectIndex !== 0) {
    problems.push(
      `fork-reject step is step ${rejectIndex}, not the first step`,
    );
  }
  const secretIndex = firstSecretStepIndex(job);
  if (secretIndex !== -1 && secretIndex <= rejectIndex) {
    problems.push(
      `step ${secretIndex} references secrets at or before the fork-reject step (${rejectIndex})`,
    );
  }
  if (jobLevelReferencesSecrets(job)) {
    problems.push("job-level keys reference secrets in a fork-reachable job");
  }
  const rejectStep = steps[rejectIndex]!;
  for (const scenario of EVENT_SCENARIOS) {
    const runs = evaluateIfCondition(
      rejectStep.if,
      scenarioContext(scenario, {}),
    );
    if (scenario.fork && !runs) {
      problems.push(`fork-reject step does not run for ${scenario.label}`);
    }
    if (!scenario.fork && runs) {
      problems.push(`fork-reject step runs for same-repo ${scenario.label}`);
    }
  }
  return problems;
}

export type ForkSafetyReport = {
  /** Some fork event (with some needs results) runs the job. */
  forkReachable: boolean;
  /** Every fork event, for every needs combination, runs the job. */
  runsForEveryFork: boolean;
  /** Some same-repo event runs the job (it is not dead code). */
  runsForSomeSameRepo: boolean;
  problems: string[];
};

/**
 * Evaluate a self-hosted job's `if` and `runs-on` across every modeled event
 * and needs-result combination: fork events must either skip the job or put
 * it on a hosted `ubuntu-*` runner (then fail closed via the reject step);
 * same-repo events must always resolve to exactly the proxmox labels.
 */
export function analyzeSelfHostedForkSafety(
  job: WorkflowJob,
): ForkSafetyReport {
  const problems: string[] = [];
  let forkReachable = false;
  let runsForEveryFork = true;
  let runsForSomeSameRepo = false;
  const needsStates = needsScenarios(job);

  for (const scenario of EVENT_SCENARIOS) {
    if (!scenario.fork) {
      const labels = evaluateRunsOn(
        jobRunsOn(job),
        scenarioContext(scenario, {}),
      );
      if (!labelsEqual(labels, SELF_HOSTED_LABELS)) {
        problems.push(
          `same-repo ${scenario.label} resolves runs-on to ${JSON.stringify(labels)}`,
        );
      }
    }
    for (const needs of needsStates) {
      const ctx = scenarioContext(scenario, needs);
      const runs = evaluateIfCondition(ifExpression(job) || undefined, ctx);
      if (!scenario.fork) {
        if (runs) runsForSomeSameRepo = true;
        continue;
      }
      if (!runs) {
        runsForEveryFork = false;
        continue;
      }
      forkReachable = true;
      const labels = evaluateRunsOn(jobRunsOn(job), ctx);
      if (!isHostedUbuntuLabels(labels)) {
        problems.push(
          `fork ${scenario.label} (needs ${JSON.stringify(needs)}) runs on ${JSON.stringify(labels)}`,
        );
      }
    }
  }

  if (!runsForSomeSameRepo)
    problems.push("job never runs for a same-repo event");
  if (forkReachable) problems.push(...forkRejectProblems(job));

  return {
    forkReachable,
    runsForEveryFork,
    runsForSomeSameRepo,
    problems: [...new Set(problems)],
  };
}

export function checkoutSteps(job: WorkflowJob): WorkflowStep[] {
  const steps = job.steps ?? [];
  return steps.filter((step) => {
    const uses = step.uses ?? "";
    return uses.startsWith("actions/checkout");
  });
}

export function allSteps(job: WorkflowJob): WorkflowStep[] {
  return job.steps ?? [];
}

export function stepRunText(job: WorkflowJob): string {
  return allSteps(job)
    .map((step) => step.run ?? "")
    .join("\n");
}

export function findCiGatePolicyStep(
  job: WorkflowJob,
): WorkflowStep | undefined {
  return allSteps(job).find((step) => {
    const run = step.run ?? "";
    return run.includes("ci-build-policy.mjs") && run.includes("--gate");
  });
}

const DEFAULT_CI_GATE_HEAVY_NEEDS = ["build", "test-unit"] as const;

export function ciGateStepReferencesNeedResults(
  step: WorkflowStep,
  needIds: readonly string[],
): boolean {
  const env = step.env ?? {};
  const ciResults = String(env.CI_RESULTS ?? "");
  return needIds.every(
    (needId) =>
      ciResults.includes(`needs.${needId}.result`) ||
      ciResults.includes(`needs['${needId}'].result`) ||
      ciResults.includes(`needs["${needId}"].result`),
  );
}

export function ciGateStepReferencesHeavyNeeds(step: WorkflowStep): boolean {
  return ciGateStepReferencesNeedResults(step, DEFAULT_CI_GATE_HEAVY_NEEDS);
}

const CI_GATE_SUCCESS_RESULTS = {
  plan: "success",
  format: "success",
  integrity: "success",
  lint: "success",
  typecheck: "success",
  unit: "success",
  build: "success",
} as const;

const CI_GATE_FORK_SKIP_RESULTS = {
  plan: "success",
  format: "success",
  integrity: "success",
  lint: "success",
  typecheck: "success",
  unit: "skipped",
  build: "skipped",
} as const;

export function ciGatePolicyPassesWhenSameRepoChecksSucceeded(): boolean {
  return validateCiGate({
    results: { ...CI_GATE_SUCCESS_RESULTS },
    buildRequested: true,
  });
}

export function ciGatePolicyFailsWhenHeavyNeedsSkipped(
  buildRequested: boolean,
): boolean {
  return !validateCiGate({
    results: { ...CI_GATE_FORK_SKIP_RESULTS },
    buildRequested,
  });
}

export function ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(
  job: WorkflowJob,
  requiredNeeds?: readonly string[],
): boolean {
  const heavyNeedIds =
    requiredNeeds !== undefined ? requiredNeeds : DEFAULT_CI_GATE_HEAVY_NEEDS;

  if (heavyNeedIds.length === 0) {
    return false;
  }

  if (!isAlwaysExpression(ifExpression(job))) {
    return false;
  }

  const needs = needsList(job);
  if (!heavyNeedIds.every((needId) => needs.includes(needId))) {
    return false;
  }

  const policyStep = findCiGatePolicyStep(job);
  if (
    !policyStep ||
    !ciGateStepReferencesNeedResults(policyStep, heavyNeedIds)
  ) {
    return false;
  }

  if (!heavyNeedIds.includes("build") || !heavyNeedIds.includes("test-unit")) {
    return false;
  }

  const failsWhenSkipped =
    ciGatePolicyFailsWhenHeavyNeedsSkipped(true) &&
    ciGatePolicyFailsWhenHeavyNeedsSkipped(false);
  const passesWhenSucceeded = ciGatePolicyPassesWhenSameRepoChecksSucceeded();

  return failsWhenSkipped && passesWhenSucceeded;
}

export function substituteNeedsExpressions(
  script: string,
  results: Record<string, string>,
): string {
  let rendered = script;
  for (const [needId, result] of Object.entries(results)) {
    const escaped = needId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`\\$\\{\\{\\s*needs\\.${escaped}\\.result\\s*\\}\\}`, "g"),
      new RegExp(
        `\\$\\{\\{\\s*needs\\['${escaped}'\\]\\.result\\s*\\}\\}`,
        "g",
      ),
      new RegExp(
        `\\$\\{\\{\\s*needs\\["${escaped}"\\]\\.result\\s*\\}\\}`,
        "g",
      ),
    ];
    for (const pattern of patterns) {
      rendered = rendered.replace(pattern, result);
    }
  }
  return rendered;
}

export function findPrimaryShellGateStep(
  job: WorkflowJob,
): WorkflowStep | undefined {
  return allSteps(job).find(
    (step) => typeof step.run === "string" && step.run.trim().length > 0,
  );
}

/** Strip one `${{ ... }}` wrapper (if present) and normalize whitespace. */
export function stripExpressionWrapper(expression: string): string {
  const compact = normalizeWorkflowExpression(expression);
  const match = /^\$\{\{\s*([\s\S]*?)\s*\}\}$/.exec(compact);
  return match ? normalizeWorkflowExpression(match[1]) : compact;
}

export type NeedsContext = {
  /** `needs.<id>.result` per need id. */
  results: Record<string, string>;
  /** `needs.<id>.outputs.<name>` per need id. */
  outputs?: Record<string, Record<string, string>>;
};

/**
 * Render `${{ needs.<id>.result }}` and `${{ needs.<id>.outputs.<name> }}`.
 * Throws if any other `${{ ... }}` expression remains, so a gate cannot hide
 * hard-coded or unrelated inputs behind expressions this harness ignores.
 */
export function renderNeedsContextExpressions(
  text: string,
  context: NeedsContext,
): string {
  const rendered = text.replace(
    /\$\{\{\s*needs\.([A-Za-z0-9_-]+)\.(result|outputs\.([A-Za-z0-9_-]+))\s*\}\}/g,
    (whole, needId: string, kind: string, outputName?: string) => {
      if (kind === "result") {
        const value = context.results[needId];
        if (value === undefined) {
          throw new Error(`No result supplied for needs.${needId}`);
        }
        return value;
      }
      const value = context.outputs?.[needId]?.[outputName ?? ""];
      if (value === undefined) {
        throw new Error(
          `No output supplied for needs.${needId}.outputs.${outputName}`,
        );
      }
      return value;
    },
  );
  if (rendered.includes("${{")) {
    throw new Error(`Unrendered expression left in gate input: ${rendered}`);
  }
  return rendered;
}

/** The ci.yml ci-gate step that hands needs results to the policy script via CI_RESULTS. */
export function findCiGateResultsStep(
  job: WorkflowJob,
): WorkflowStep | undefined {
  return allSteps(job).find((step) => typeof step.env?.CI_RESULTS === "string");
}

export type GateExecution = { status: number; stdout: string; stderr: string };

/**
 * Argv for a `run:` step under GitHub's shell rules on Linux runners: no
 * `shell:` means `bash -e {0}`; `shell: bash` means
 * `bash --noprofile --norc -eo pipefail {0}`; `shell: sh` means `sh -e {0}`.
 * Any other shell is outside this harness and throws.
 */
export function runStepShellArgv(step: WorkflowStep): [string, string[]] {
  const shell = step.shell;
  if (shell === undefined) return ["bash", ["-e", "-c"]];
  if (shell === "bash") {
    return ["bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c"]];
  }
  if (shell === "sh") return ["sh", ["-e", "-c"]];
  throw new Error(`Unsupported step shell: ${JSON.stringify(shell)}`);
}

const scriptExecutionCache = new Map<string, GateExecution>();

/** Run one rendered `run:` body (from the repo root) under the step's shell; memoized. */
export function executeRunScript(
  step: WorkflowStep,
  script: string,
  env: Record<string, string>,
): GateExecution {
  const [command, args] = runStepShellArgv(step);
  const key = JSON.stringify([command, args, script, env, process.cwd()]);
  const cached = scriptExecutionCache.get(key);
  if (cached) return cached;
  const proc = spawnSync(command, [...args, script], {
    encoding: "utf8",
    cwd: process.cwd(),
    env: { ...process.env, ...env },
  });
  const result = {
    status: proc.status ?? 1,
    stdout: proc.stdout ?? "",
    stderr: proc.stderr ?? "",
  };
  scriptExecutionCache.set(key, result);
  return result;
}

/**
 * Evaluate a boolean-ish workflow key such as `continue-on-error`: absent is
 * false, YAML booleans are themselves, `${{ }}` strings are evaluated, and any
 * other non-empty string other than `false` counts as true (fail closed).
 */
export function evaluateFlag(value: unknown, ctx: EvalContext): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.includes("${{")) {
      return truthy(evaluateExpression(parseExpression(value), ctx));
    }
    return value.trim() !== "" && value.trim().toLowerCase() !== "false";
  }
  return true;
}

/** Render `${{ needs.* }}` (dot or bracket form) in step text; throws on any other expression. */
export function renderStepText(text: string, context: NeedsContext): string {
  return renderNeedsContextExpressions(
    substituteNeedsExpressions(text, context.results),
    context,
  );
}

function needsStateFromContext(context: NeedsContext): NeedsState {
  return Object.fromEntries(
    Object.entries(context.results).map(([needId, result]) => [
      needId,
      { result, outputs: context.outputs?.[needId] ?? {} },
    ]),
  );
}

export type StepExecution = GateExecution & {
  index: number;
  name?: string;
  ran: boolean;
  continueOnError: boolean;
};

export type GateJobExecution = GateExecution & {
  /** False when the job-level `if` skipped the job (a skipped check does not fail). */
  jobRan: boolean;
  /** True when job-level `continue-on-error` let a failed job pass. */
  continueOnError: boolean;
  steps: StepExecution[];
};

/**
 * Model one run of a gate job for an event and needs results: the job `if`
 * (skipped job -> status 0), each step's `if` (with `success()`/`failure()`
 * reflecting earlier steps), each `run:` body executed under its real shell
 * with the effective workflow -> job -> step `env` (see
 * {@link effectiveStepEnv}) and body rendered from the needs context, step-level and
 * job-level `continue-on-error`, and `uses:` steps modeled as succeeding.
 * `status` is the job's effect on the workflow: non-zero only when the job
 * actually fails it.
 */
export function executeGateJob(
  job: WorkflowJob,
  context: NeedsContext,
  scenario: EventScenario,
): GateJobExecution {
  const jobCtx = scenarioContext(scenario, needsStateFromContext(context));
  if (!evaluateIfCondition(ifExpression(job) || undefined, jobCtx)) {
    return {
      status: 0,
      stdout: "",
      stderr: "",
      jobRan: false,
      continueOnError: false,
      steps: [],
    };
  }

  let failed = false;
  const steps: StepExecution[] = [];
  for (const [index, step] of allSteps(job).entries()) {
    const stepCtx: EvalContext = {
      ...jobCtx,
      status: { success: !failed, failure: failed, cancelled: false },
    };
    const base = { index, name: step.name };
    if (!evaluateIfCondition(step.if, stepCtx)) {
      steps.push({
        ...base,
        ran: false,
        continueOnError: false,
        status: 0,
        stdout: "",
        stderr: "",
      });
      continue;
    }
    const continueOnError = evaluateFlag(step["continue-on-error"], stepCtx);
    let result: GateExecution = { status: 0, stdout: "", stderr: "" };
    if (typeof step.run === "string") {
      const env = Object.fromEntries(
        Object.entries(
          effectiveStepEnv(workflowEnvOf(job), job.env, step.env),
        ).map(([key, value]) => [key, renderStepText(value, context)]),
      );
      result = executeRunScript(step, renderStepText(step.run, context), env);
    }
    steps.push({ ...base, ran: true, continueOnError, ...result });
    if (result.status !== 0 && !continueOnError) failed = true;
  }

  const continueOnError = evaluateFlag(job["continue-on-error"], jobCtx);
  return {
    status: failed && !continueOnError ? 1 : 0,
    stdout: steps.map((step) => step.stdout).join(""),
    stderr: steps.map((step) => step.stderr).join(""),
    jobRan: true,
    continueOnError: failed && continueOnError,
    steps,
  };
}

/**
 * Execute the real ci-gate job (its `run:` steps under the step shell, from the
 * repo root) with `env:` rendered from the supplied needs context, modeling
 * step `if` and `continue-on-error`. Proves the workflow's step — not a fixed
 * fixture — passes or fails for those results. The job is modeled for every
 * event in {@link EVENT_SCENARIOS}; if any event lets it pass, that passing
 * execution is returned, so a fail-closed claim must hold for every event.
 */
export function executeCiGateResultsStep(
  job: WorkflowJob,
  context: NeedsContext,
): GateExecution {
  const step = findCiGateResultsStep(job);
  if (!step?.run) {
    throw new Error("ci-gate has no run step with env.CI_RESULTS");
  }
  const executions = EVENT_SCENARIOS.map((scenario) =>
    executeGateJob(job, context, scenario),
  );
  return (
    executions.find((execution) => execution.status === 0) ?? executions[0]!
  );
}

export function buildNeedResultsForGateJob(
  job: WorkflowJob,
  overrides: Record<string, string>,
): Record<string, string> {
  const base = Object.fromEntries(
    needsList(job).map((needId) => [needId, "success"]),
  );
  return { ...base, ...overrides };
}

const GATE_NON_SUCCESS_RESULTS = ["failure", "cancelled", "skipped"] as const;

/**
 * Problems with a gate job's enforcement, by executing the modeled job (see
 * {@link executeGateJob}) for each event in `scenarios`: with every need
 * successful the job must run and pass; with any heavy need failed, cancelled
 * or skipped — or all of them skipped (the fork-PR shape) — it must run and
 * fail. A skipped gate step, `continue-on-error`, or a job `if` that skips the
 * gate all surface here. `outputs` supplies `needs.<id>.outputs.*` values.
 */
export function gateEnforcementProblems(
  job: WorkflowJob,
  heavyNeedIds: readonly string[],
  scenarios: readonly EventScenario[] = EVENT_SCENARIOS,
  outputs?: NeedsContext["outputs"],
): string[] {
  const problems: string[] = [];
  const cases: [string, Record<string, string>][] = [
    [
      "all heavy needs skipped",
      Object.fromEntries(heavyNeedIds.map((needId) => [needId, "skipped"])),
    ],
    ...heavyNeedIds.flatMap((needId) =>
      GATE_NON_SUCCESS_RESULTS.map(
        (result): [string, Record<string, string>] => [
          `${needId} ${result}`,
          { [needId]: result },
        ],
      ),
    ),
  ];
  for (const scenario of scenarios) {
    const run = (overrides: Record<string, string>) =>
      executeGateJob(
        job,
        { results: buildNeedResultsForGateJob(job, overrides), outputs },
        scenario,
      );
    try {
      const success = run({});
      if (!success.jobRan || success.status !== 0) {
        problems.push(
          `${scenario.label}: gate does not pass when every need succeeded`,
        );
      }
      for (const [label, overrides] of cases) {
        const execution = run(overrides);
        if (!execution.jobRan) {
          problems.push(`${scenario.label}: gate job skipped when ${label}`);
        } else if (execution.status === 0) {
          problems.push(`${scenario.label}: gate passes when ${label}`);
        }
      }
    } catch (error) {
      problems.push(`${scenario.label}: ${(error as Error).message}`);
    }
  }
  return [...new Set(problems)];
}

export function hostedGateFailsClosedWhenHeavyNeedsSkipped(
  job: WorkflowJob,
  heavyNeedIds: string[],
): boolean {
  if (!isAlwaysExpression(ifExpression(job))) {
    return false;
  }

  const needs = needsList(job);
  if (!heavyNeedIds.every((needId) => needs.includes(needId))) {
    return false;
  }

  const gateStep = findPrimaryShellGateStep(job);
  if (!gateStep?.run) {
    return false;
  }

  return gateEnforcementProblems(job, heavyNeedIds).length === 0;
}

/**
 * Required checks (migrate/smoke) must run for every fork event on a hosted
 * runner (fork-aware runs-on, evaluated) and fail there via the first step,
 * before anything that can read secrets.
 */
export function requiredJobFailsClosedOnFork(job: WorkflowJob): boolean {
  if (!isForkAwareRunsOnExpression(jobRunsOn(job))) {
    return false;
  }
  const report = analyzeSelfHostedForkSafety(job);
  return (
    report.runsForEveryFork &&
    report.forkReachable &&
    report.problems.length === 0
  );
}

export function assertMovedJobTimeoutMinutes(
  jobId: string,
  job: WorkflowJob,
  exactMinutesByJob: Record<string, number>,
): void {
  if (jobCallsReusableWorkflow(job)) {
    throw new Error(
      `${jobId} calls a reusable workflow; timeout-minutes belongs on callee jobs, not caller`,
    );
  }
  const timeout = jobTimeoutMinutes(job);
  if (timeout === undefined) {
    throw new Error(`${jobId} missing timeout-minutes (spec rev 3 moved jobs)`);
  }
  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(
      `${jobId} timeout-minutes must be a positive integer; got ${timeout}`,
    );
  }
  if (jobId in exactMinutesByJob) {
    if (timeout !== exactMinutesByJob[jobId]) {
      throw new Error(
        `${jobId} timeout-minutes must be ${exactMinutesByJob[jobId]} per spec rev 3; got ${timeout}`,
      );
    }
  }
}
