import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

/**
 * The pinned fork-reject step `if:` (the "FORK_REJECT_IF" of the #2160 review):
 * exactly {@link FORK_ONLY_STEP_GUARD}, as both real reject steps (migrate and
 * smoke) write it. Compared after {@link normalizeWorkflowExpression}
 * (whitespace runs collapsed to one space, trimmed — what YAML `>-` folding
 * produces); a `${{ }}` wrapper or any other change is not the pinned text.
 */
export const FORK_REJECT_IF = FORK_ONLY_STEP_GUARD;

export function isPinnedForkRejectIf(condition: unknown): boolean {
  return (
    typeof condition === "string" &&
    normalizeWorkflowExpression(condition) === FORK_REJECT_IF
  );
}

/**
 * Exact `if:` pins for the reject and gate jobs, as the real workflows write
 * them today (compared after {@link normalizeWorkflowExpression}); `null`
 * means "absent". Steps: in a reject job, step 0 is pinned to
 * {@link FORK_REJECT_IF} and every other step to absent; in a gate job every
 * step is absent (gate steps also have no `if` key in the key allowlist).
 */
export const PINNED_JOB_IFS: Record<
  string,
  { role: ModelledRole; jobIf: string | null }
> = {
  migrate: { role: "reject", jobIf: null },
  smoke: {
    role: "reject",
    jobIf:
      "always() && (needs.migrate.result == 'success' || (github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository))",
  },
  "e2e-smoke-gate": { role: "gate", jobIf: "always()" },
  "integration-gate": { role: "gate", jobIf: "always()" },
  "e2e-gate": {
    role: "gate",
    jobIf:
      "always() && ( (github.event_name == 'pull_request' && github.base_ref == 'production') || (github.event_name == 'push' && github.ref == 'refs/heads/production') )",
  },
  "ci-gate": { role: "gate", jobIf: "always()" },
};

function pinnedText(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return typeof value === "string"
    ? normalizeWorkflowExpression(value)
    : JSON.stringify(value);
}

/**
 * Problems with the job- and step-level `if:` of a pinned reject/gate job
 * (identified by its `jobs:` key; fixtures without one are not pinned): a
 * missing, added or changed `if:` "is not allowed".
 */
export function pinnedIfProblems(job: WorkflowJob): string[] {
  const jobId = jobIdByJob.get(job);
  const pin = jobId === undefined ? undefined : PINNED_JOB_IFS[jobId];
  if (!pin) return [];
  const problems: string[] = [];
  // "Absent" means the `if` key does not exist. A key that is present with a
  // null value (an unquoted YAML tag such as `if: !cancelled()`, or a bare
  // `if:` / `if: ~`) is not absent, so it fails every pin on its own,
  // independent of the key allowlist.
  const check = (
    where: string,
    holder: { if?: unknown },
    expected: string | null,
  ) => {
    const pinned = JSON.stringify(expected ?? "absent");
    if (
      Object.hasOwn(holder, "if") &&
      (holder.if === null || holder.if === undefined)
    ) {
      problems.push(
        `${where} if key is present with a null value (not absent) and is not allowed: pinned to ${pinned}`,
      );
      return;
    }
    const text = pinnedText(holder.if);
    if (text !== expected) {
      problems.push(
        `${where} if ${JSON.stringify(text ?? "absent")} is not allowed: pinned to ${pinned}`,
      );
    }
  };
  check(`Job '${jobId}'`, job, pin.jobIf);
  // Reject jobs: every step after the reject step — including the migrate
  // DATABASE_URL steps (8, 11, 12, 13), "Verify document-cutover reader role
  // (real stack)" (14), the #2254 identity step (15), "Verify tenant
  // isolation (real stack)" (16) and "Verify tenant table RLS posture (real
  // stack)" (17) — is pinned to no `if:`, so none can run after the fork
  // reject at step 0 has failed the job.
  allSteps(job).forEach((step, index) =>
    check(
      `Job '${jobId}' step ${index}`,
      step,
      pin.role === "reject" && index === 0 ? FORK_REJECT_IF : null,
    ),
  );
  return problems;
}

/** Throws "... is not allowed" unless the step `if:` is exactly {@link FORK_REJECT_IF}. */
export function assertPinnedForkRejectIf(step: WorkflowStep): void {
  if (!isPinnedForkRejectIf(step.if)) {
    throw new Error(
      `Fork-reject step if ${JSON.stringify(step.if ?? null)} is not allowed: it must be exactly FORK_REJECT_IF (${JSON.stringify(FORK_REJECT_IF)})`,
    );
  }
}

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

/** Owning workflow document of each job handed out by {@link workflowJobs}. */
const workflowDocByJob = new WeakMap<WorkflowJob, WorkflowDocument>();
/** Owning job of each step handed out by {@link workflowJobs}. */
const jobByStep = new WeakMap<WorkflowStep, WorkflowJob>();
/** Job id (its key under `jobs:`) of each job handed out by {@link workflowJobs}. */
const jobIdByJob = new WeakMap<WorkflowJob, string>();

/** The `jobs:` key a job was loaded under (undefined for fixtures). */
export function jobIdOf(job: WorkflowJob): string | undefined {
  return jobIdByJob.get(job);
}

export function workflowJobs(
  doc: WorkflowDocument,
  label = "workflow",
): WorkflowJobs {
  if (!doc?.jobs || typeof doc.jobs !== "object") {
    throw new Error(`Missing jobs map in ${label}`);
  }
  for (const [jobId, job] of Object.entries(doc.jobs)) {
    if (!job || typeof job !== "object") continue;
    workflowDocByJob.set(job, doc);
    jobIdByJob.set(job, jobId);
    for (const step of job.steps ?? []) {
      if (step && typeof step === "object") jobByStep.set(step, job);
    }
  }
  return doc.jobs;
}

/** The workflow-level `env` of the document a job was loaded from (undefined for fixtures). */
export function workflowEnvOf(job: WorkflowJob): unknown {
  return workflowDocByJob.get(job)?.env;
}

// ---------------------------------------------------------------------------
// Exact key allowlists for the reject and gate jobs (fail closed)
// ---------------------------------------------------------------------------

/**
 * Keys the harness models, derived from what ci.yml and ci-integration.yml use
 * today (union per role). Any other key throws/reports "... is not modelled".
 * - workflow top level (both files): `name`, `on`, `permissions`, `env`,
 *   `concurrency`, `jobs`.
 * - reject jobs (ci-integration migrate, smoke): `env`, `runs-on`, `services`,
 *   `steps`, `timeout-minutes`, plus `if`/`needs` (smoke).
 * - reject-job steps: `name`, `if`, `run`, `uses`, `with` (no step `env`).
 * - gate jobs (e2e-smoke-gate, integration-gate, e2e-gate, ci.yml ci-gate):
 *   `if`, `needs`, `runs-on`, `steps`.
 * - gate-job steps: `name`, `run`, `uses`, `with`, plus `env` (ci-gate); no
 *   step `if`.
 * Not modelled anywhere, for example: `defaults`, `container`, `strategy`
 * (and so `matrix`), `continue-on-error`, `shell`, `working-directory`,
 * step `timeout-minutes`, `outputs`, `permissions` on a job, `id`.
 */
export const MODELLED_WORKFLOW_KEYS: readonly string[] = [
  "name",
  "on",
  "permissions",
  "env",
  "concurrency",
  "jobs",
];
export type ModelledRole = "reject" | "gate";
export const MODELLED_JOB_KEYS: Record<ModelledRole, readonly string[]> = {
  reject: [
    "env",
    "if",
    "needs",
    "runs-on",
    "services",
    "steps",
    "timeout-minutes",
  ],
  gate: ["if", "needs", "runs-on", "steps"],
};
export const MODELLED_STEP_KEYS: Record<ModelledRole, readonly string[]> = {
  reject: ["if", "name", "run", "uses", "with"],
  gate: ["env", "name", "run", "uses", "with"],
};

/**
 * Exact keys per real reject/gate job and per step, as ci.yml and
 * ci-integration.yml have them today (no union per role). Steps are identified
 * by `name:<name>`, or `uses:<action>` (ref dropped) for unnamed action steps;
 * each identity occurs at most once per job. A job loaded under one of these
 * `jobs:` keys is checked against this table; an unknown or repeated step is
 * itself not modelled. Jobs without a pinned id (synthetic fixtures) fall back
 * to the role lists {@link MODELLED_JOB_KEYS} / {@link MODELLED_STEP_KEYS}.
 * The only step `env` is ci.yml ci-gate's policy step.
 */
export const MODELLED_KEYS_BY_JOB: Record<
  string,
  { job: readonly string[]; steps: Record<string, readonly string[]> }
> = {
  migrate: {
    job: ["runs-on", "timeout-minutes", "env", "services", "steps"],
    steps: {
      "name:Reject fork pull requests": ["name", "if", "run"],
      "uses:actions/checkout": ["uses", "with"],
      "name:Install system dependencies (canvas)": ["name", "run"],
      "uses:actions/setup-node": ["uses", "with"],
      "uses:oven-sh/setup-bun": ["uses", "with"],
      "name:Install dependencies": ["name", "run"],
      "name:Install PostgreSQL client": ["name", "run"],
      "name:Apply migrations": ["name", "run"],
      "name:Verify disposable Supabase Auth compatibility": ["name", "run"],
      "name:Apply Payload migrations": ["name", "run"],
      "name:Verify Payload migration status": ["name", "run"],
      "name:Apply demo seed": ["name", "run"],
      "name:Verify donation fee replay": ["name", "run"],
      "name:Verify seed counts": ["name", "run"],
      "name:Verify document-cutover reader role (real stack)": [
        "name",
        "env",
        "run",
      ],
      "name:Verify identity email normalizer and donor keys (real stack)": [
        "name",
        "run",
      ],
      "name:Verify tenant isolation (real stack)": ["name", "env", "run"],
      "name:Verify tenant table RLS posture (real stack)": [
        "name",
        "env",
        "run",
      ],
    },
  },
  smoke: {
    job: [
      "needs",
      "if",
      "runs-on",
      "timeout-minutes",
      "services",
      "env",
      "steps",
    ],
    steps: {
      "name:Reject fork pull requests": ["name", "if", "run"],
      "uses:actions/checkout": ["uses", "with"],
      "name:Install system dependencies (canvas)": ["name", "run"],
      "uses:actions/setup-node": ["uses", "with"],
      "uses:oven-sh/setup-bun": ["uses", "with"],
      "name:Install dependencies": ["name", "run"],
      "name:Start donor app": ["name", "run"],
      "name:Wait for health endpoint": ["name", "run"],
      "name:Assert health response shape": ["name", "run"],
    },
  },
  "e2e-smoke-gate": {
    job: ["if", "needs", "runs-on", "steps"],
    steps: {
      "name:Fail if E2E smoke failed": ["name", "run"],
    },
  },
  "integration-gate": {
    job: ["if", "needs", "runs-on", "steps"],
    steps: {
      "name:Fail if integration prerequisites failed": ["name", "run"],
    },
  },
  "e2e-gate": {
    job: ["if", "needs", "runs-on", "steps"],
    steps: {
      "name:Fail if E2E failed on production": ["name", "run"],
    },
  },
  "ci-gate": {
    job: ["if", "needs", "runs-on", "steps"],
    steps: {
      "uses:actions/checkout": ["uses", "with"],
      "uses:actions/setup-node": ["uses", "with"],
      "name:Validate correctness checks and requested compilation": [
        "name",
        "env",
        "run",
      ],
    },
  },
};

/**
 * Steps pinned beyond their keys: exact position in the job, exact `run:` body
 * (trimmed) and exact step `env` values. Four migrate steps: "Verify
 * document-cutover reader role (real stack)" (from develop #2169) pins
 * DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL to exactly `${{ env.DATABASE_URL }}`;
 * the #2254 identity step after it has no step `env` (it uses the job's);
 * "Verify tenant isolation (real stack)" (#2250) and the last step, "Verify
 * tenant table RLS posture (real stack)" (#2251), each pin
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL to exactly `${{ env.DATABASE_URL }}`.
 */
export const PINNED_STEP_BODIES: Record<
  string,
  Record<
    string,
    { index: number; run: string; env: Readonly<Record<string, string>> }
  >
> = {
  migrate: {
    "name:Verify document-cutover reader role (real stack)": {
      index: 14,
      run: "bun x vitest run tests/unit/acceptance/issue-2067/reader-role.integration.acceptance.test.ts",
      env: {
        DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}",
      },
    },
    "name:Verify identity email normalizer and donor keys (real stack)": {
      index: 15,
      run: "bun x vitest run tests/unit/acceptance/issue-2254/identity.realstack.acceptance.test.ts",
      env: {},
    },
    "name:Verify tenant isolation (real stack)": {
      index: 16,
      run: "bun x vitest run tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts",
      env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
    },
    "name:Verify tenant table RLS posture (real stack)": {
      index: 17,
      run: "bun x vitest run tests/unit/acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts",
      env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
    },
  },
};

/** `name:<name>`, else `uses:<action>` without its ref; how {@link MODELLED_KEYS_BY_JOB} keys steps. */
export function stepIdentity(step: WorkflowStep): string {
  if (typeof step.name === "string") return `name:${step.name}`;
  if (typeof step.uses === "string") return `uses:${step.uses.split("@")[0]}`;
  return "(unnamed step)";
}

function assertKeysModelled(
  value: unknown,
  allowed: readonly string[],
  where: string,
): void {
  if (!value || typeof value !== "object") return;
  const extra = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extra.length > 0) {
    throw new Error(
      `${where} key ${extra.map((key) => `'${key}'`).join(", ")} is not modelled (modelled: ${allowed.join(", ")})`,
    );
  }
}

export function assertWorkflowKeysModelled(doc: WorkflowDocument): void {
  assertKeysModelled(doc, MODELLED_WORKFLOW_KEYS, "Workflow");
}

export function assertStepKeysModelled(
  step: WorkflowStep,
  role: ModelledRole,
  label = "Step",
): void {
  assertKeysModelled(step, MODELLED_STEP_KEYS[role], `${label} (${role})`);
}

/**
 * Every allowlist problem for a reject or gate job: its owning workflow's top
 * level (when the job was loaded from a document), the job, and each step.
 */
export function modelledKeyProblems(
  job: WorkflowJob,
  role: ModelledRole,
): string[] {
  const problems: string[] = [];
  const check = (fn: () => void) => {
    try {
      fn();
    } catch (error) {
      problems.push((error as Error).message);
    }
  };
  const doc = workflowDocByJob.get(job);
  if (doc) check(() => assertWorkflowKeysModelled(doc));
  const jobId = jobIdByJob.get(job);
  const exact = jobId === undefined ? undefined : MODELLED_KEYS_BY_JOB[jobId];
  check(() =>
    assertKeysModelled(
      job,
      exact?.job ?? MODELLED_JOB_KEYS[role],
      `Job (${role})`,
    ),
  );
  const seen = new Set<string>();
  allSteps(job).forEach((step, index) =>
    check(() => {
      if (!exact) {
        assertStepKeysModelled(step, role, `Step ${index}`);
        return;
      }
      const identity = stepIdentity(step);
      const allowed = exact.steps[identity];
      if (allowed === undefined || seen.has(identity)) {
        throw new Error(
          `Step ${index} (${role}) ${JSON.stringify(identity)} of job '${jobId}' is not modelled (${allowed === undefined ? "not a step of the real job" : "repeated step"})`,
        );
      }
      seen.add(identity);
      assertKeysModelled(step, allowed, `Step ${index} (${role})`);
      const body = PINNED_STEP_BODIES[jobId!]?.[identity];
      if (body && body.index !== index) {
        throw new Error(
          `Step ${index} (${role}) ${JSON.stringify(identity)} of job '${jobId}' is not modelled (pinned to position ${body.index})`,
        );
      }
      if (
        body &&
        (typeof step.run !== "string" || step.run.trim() !== body.run)
      ) {
        throw new Error(
          `Step ${index} (${role}) ${JSON.stringify(identity)} of job '${jobId}' is not modelled (run differs from the pinned body ${JSON.stringify(body.run)})`,
        );
      }
    }),
  );
  // A pinned step that is gone (deleted, or renamed away) is a problem too.
  if (exact) {
    for (const [identity, body] of Object.entries(
      PINNED_STEP_BODIES[jobId!] ?? {},
    )) {
      if (!seen.has(identity)) {
        problems.push(
          `Pinned step ${JSON.stringify(identity)} of job '${jobId}' is missing (pinned to position ${body.index})`,
        );
      }
    }
  }
  problems.push(...envKeyProblems(job));
  return problems;
}

/** Throws the first {@link modelledKeyProblems} entry, if any. */
export function assertJobKeysModelled(
  job: WorkflowJob,
  role: ModelledRole,
): void {
  const [first] = modelledKeyProblems(job, role);
  if (first !== undefined) throw new Error(first);
}

// ---------------------------------------------------------------------------
// `run:` shell and working-directory resolution (GitHub order, fail closed)
// ---------------------------------------------------------------------------

export type RunSetting = {
  value: unknown;
  source: "step" | "job defaults.run" | "workflow defaults.run" | "unset";
};

function runDefaults(
  defaults: unknown,
  label: string,
): Record<string, unknown> {
  if (defaults === undefined || defaults === null) return {};
  if (typeof defaults !== "object" || Array.isArray(defaults)) {
    throw new Error(
      `${label} defaults ${JSON.stringify(defaults)} is not modelled`,
    );
  }
  const { run, ...rest } = defaults as Record<string, unknown>;
  if (Object.keys(rest).length > 0) {
    throw new Error(
      `${label} defaults keys ${Object.keys(rest).join(", ")} are not modelled`,
    );
  }
  if (run === undefined || run === null) return {};
  if (typeof run !== "object" || Array.isArray(run)) {
    throw new Error(
      `${label} defaults.run ${JSON.stringify(run)} is not modelled`,
    );
  }
  return run as Record<string, unknown>;
}

/**
 * A `run:` step's effective `shell` and `working-directory`, resolved as GitHub
 * does: the step's own key, else the job's `defaults.run`, else the owning
 * workflow's `defaults.run` (`job` defaults to the step's owner when it was
 * loaded through {@link workflowJobs}).
 */
export function resolveRunSettings(
  step: WorkflowStep,
  job: WorkflowJob | undefined = jobByStep.get(step),
): { shell: RunSetting; workingDirectory: RunSetting } {
  const jobRun = runDefaults(job?.defaults, "Job");
  const doc = job ? workflowDocByJob.get(job) : undefined;
  const workflowRun = runDefaults(doc?.defaults, "Workflow");
  const resolve = (key: "shell" | "working-directory"): RunSetting => {
    if (step[key] !== undefined) return { value: step[key], source: "step" };
    if (jobRun[key] !== undefined) {
      return { value: jobRun[key], source: "job defaults.run" };
    }
    if (workflowRun[key] !== undefined) {
      return { value: workflowRun[key], source: "workflow defaults.run" };
    }
    return { value: undefined, source: "unset" };
  };
  return {
    shell: resolve("shell"),
    workingDirectory: resolve("working-directory"),
  };
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
 * Process-level variable names that change how bash or node start (sourced
 * files, injected options, preloaded libraries, exported functions, xtrace
 * prompts). Denied at every env level, for every job, before anything runs.
 */
export const DENIED_ENV_KEY_PATTERNS: readonly RegExp[] = [
  /^BASH_ENV$/,
  /^ENV$/,
  /^NODE_OPTIONS$/,
  /^NODE_PATH$/,
  /^LD_/,
  /^DYLD_/,
  /^BASH_FUNC_/,
  /^SHELLOPTS$/,
  /^BASHOPTS$/,
  /^PS4$/,
];

function envKeyNotAllowed(key: string, level: string, why: string): string {
  return `env key not allowed: ${key} at ${level} (${why})`;
}

/** Throws "env key not allowed: <KEY> at <level>" for a denied process-level name. */
export function assertEnvKeysNotDenied(env: unknown, level: string): void {
  for (const key of Object.keys(envLevel(env, level))) {
    if (DENIED_ENV_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      throw new Error(
        envKeyNotAllowed(key, level, "denied process-level name"),
      );
    }
  }
}

/**
 * Exact env key names the real workflows set today, per level (both files use
 * the same workflow env). Gate jobs have no job env; the only step env is
 * ci.yml ci-gate's policy step. Any other name at a pinned level is
 * "env key not allowed".
 */
export const MODELLED_WORKFLOW_ENV_KEYS: readonly string[] = [
  "BUN_VERSION",
  "NODE_VERSION",
];
export const MODELLED_ENV_KEYS_BY_JOB: Record<
  string,
  { job: readonly string[]; steps: Record<string, readonly string[]> }
> = {
  migrate: {
    job: [
      "DATABASE_URL",
      "PAYLOAD_DATABASE_URI",
      "PAYLOAD_SECRET",
      "SKIP_ENV_VALIDATION",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ],
    steps: {
      "name:Verify document-cutover reader role (real stack)": [
        "DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL",
      ],
      "name:Verify tenant isolation (real stack)": [
        "TENANT_GUARD_IT_ADMIN_DATABASE_URL",
      ],
      "name:Verify tenant table RLS posture (real stack)": [
        "TENANT_GUARD_IT_ADMIN_DATABASE_URL",
      ],
    },
  },
  smoke: {
    job: [
      "DATABASE_URL",
      "SKIP_ENV_VALIDATION",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "ASYM_E2E_REQUIRE_HERMETIC_SUPABASE",
    ],
    steps: {},
  },
  "e2e-smoke-gate": { job: [], steps: {} },
  "integration-gate": { job: [], steps: {} },
  "e2e-gate": { job: [], steps: {} },
  "ci-gate": {
    job: [],
    steps: {
      "name:Validate correctness checks and requested compilation": [
        "CI_BUILD_REQUESTED",
        "CI_RESULTS",
      ],
    },
  },
};

/**
 * Every env key-name problem for a job: denied names at the workflow, job and
 * step levels (any job), plus names outside the exact pinned sets (jobs loaded
 * under a pinned `jobs:` key, and their workflow).
 */
export function envKeyProblems(job: WorkflowJob): string[] {
  const problems: string[] = [];
  const jobId = jobIdByJob.get(job);
  const pin = jobId === undefined ? undefined : MODELLED_ENV_KEYS_BY_JOB[jobId];
  const check = (
    env: unknown,
    level: string,
    allowed?: readonly string[],
    values?: Readonly<Record<string, string>>,
  ) => {
    if (!env || typeof env !== "object" || Array.isArray(env)) return;
    for (const [key, value] of Object.entries(env)) {
      if (DENIED_ENV_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
        problems.push(
          envKeyNotAllowed(key, level, "denied process-level name"),
        );
      } else if (allowed && !allowed.includes(key)) {
        problems.push(envKeyNotAllowed(key, level, "not in the pinned set"));
      } else if (values && key in values && value !== values[key]) {
        problems.push(
          `env value not allowed: ${key} at ${level} (pinned to ${JSON.stringify(values[key])})`,
        );
      }
    }
  };
  check(
    workflowDocByJob.get(job)?.env,
    "workflow env",
    pin ? MODELLED_WORKFLOW_ENV_KEYS : undefined,
  );
  check(job.env, pin ? `job '${jobId}' env` : "job env", pin?.job);
  allSteps(job).forEach((step, index) =>
    check(
      step.env,
      pin ? `step ${index} env of job '${jobId}'` : `step ${index} env`,
      pin ? (pin.steps[stepIdentity(step)] ?? []) : undefined,
      jobId === undefined
        ? undefined
        : PINNED_STEP_BODIES[jobId]?.[stepIdentity(step)]?.env,
    ),
  );
  return problems;
}

/**
 * The env a `run:` step sees, as the Actions runner builds it: workflow `env`,
 * then job `env`, then step `env`, later levels winning; scalar values are
 * stringified (`null` -> ""). A non-map level, a non-scalar value, or a denied
 * process-level name ({@link DENIED_ENV_KEY_PATTERNS}) throws.
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
    assertEnvKeysNotDenied(level, `${label} env`);
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
  /** Pull-request value set ("A" or "B"); undefined for push/dispatch. */
  valueSet?: PullRequestValueSet["id"];
  github: ExprValue;
};

/**
 * Concrete pull-request values. Every pull_request scenario runs under two
 * distinct sets, so an expression that only holds for one fixed value (for
 * example `github.event.pull_request.number == 1`) cannot pass as fork-safe.
 * `sha` varies too but is deliberately not put in the `github` context: no
 * reject/gate expression reads `github.sha` or `head.sha`, so it stays
 * unmodelled (a read throws "not modelled").
 */
export type PullRequestValueSet = {
  id: "A" | "B";
  number: number;
  forkFullName: string;
  headRef: string;
  mergeRef: string;
  sha: string;
};

export const PULL_REQUEST_VALUE_SETS: readonly PullRequestValueSet[] = [
  {
    id: "A",
    number: 1,
    forkFullName: FORK_REPOSITORY,
    headRef: "feature",
    mergeRef: "refs/pull/1/merge",
    sha: "1111111111111111111111111111111111111111",
  },
  {
    id: "B",
    number: 2160,
    forkFullName: "second-contributor/core-fork",
    headRef: "fix/other-branch",
    mergeRef: "refs/pull/2160/merge",
    sha: "2160216021602160216021602160216021602160",
  },
];

function pullRequestScenario(
  fork: boolean,
  baseRef: string,
  values: PullRequestValueSet = PULL_REQUEST_VALUE_SETS[0]!,
): EventScenario {
  const headRepo = fork ? values.forkFullName : REPOSITORY;
  return {
    label: `pull_request ${fork ? "fork" : "same-repo"} -> ${baseRef}${values.id === "A" ? "" : ` [values ${values.id}]`}`,
    fork,
    valueSet: values.id,
    github: {
      event_name: "pull_request",
      repository: REPOSITORY,
      ref: values.mergeRef,
      base_ref: baseRef,
      head_ref: values.headRef,
      event: {
        pull_request: {
          number: values.number,
          head: { ref: values.headRef, repo: { full_name: headRepo } },
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

/** A merge-queue entry for develop: same-repo, no pull_request payload. */
function mergeGroupScenario(pr: number, sha: string): EventScenario {
  const branch = `gh-readonly-queue/develop/pr-${pr}-${sha}`;
  return {
    label: `merge_group develop pr-${pr}`,
    fork: false,
    github: {
      event_name: "merge_group",
      repository: REPOSITORY,
      ref: `refs/heads/${branch}`,
      ref_name: branch,
      base_ref: "",
      head_ref: "",
      event: {},
    },
  };
}

/**
 * Every event shape the CI workflows trigger on, fork and same-repo. The
 * pull_request scenarios run under value set A first (the original nine, in
 * their original order) and again under value set B (appended).
 */
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
  mergeGroupScenario(1, "1".repeat(40)),
  ...PULL_REQUEST_VALUE_SETS.slice(1).flatMap((values) => [
    pullRequestScenario(true, "develop", values),
    pullRequestScenario(true, "production", values),
    pullRequestScenario(false, "develop", values),
    pullRequestScenario(false, "production", values),
  ]),
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

/**
 * Expression contexts for one modeled event. Fail closed: only what is listed
 * here is modelled, and a member missing from it throws "not modelled" (see
 * `lookup` in github-expression.ts) instead of defaulting to null.
 * - `github`: the scenario's object (see {@link EVENT_SCENARIOS}).
 * - `needs.<id>.result` / `needs.<id>.outputs.*`: from the needs state given
 *   (only the job's declared needs; only the outputs supplied).
 * - `inputs`, `vars`: modelled as empty, so every member throws.
 * - `env`, `secrets`, `runner`, `steps`, `matrix`, `job`, `strategy`: not
 *   contexts here, so any reference throws "Unknown context ... not modelled".
 * - Status functions: `success()`/`failure()` from the needs results,
 *   `cancelled()` false, `always()` true; other functions throw.
 */
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
 * Structural fork-reject check: a `run:` step (no `uses:`) whose `if` is exactly
 * the pinned {@link FORK_REJECT_IF}, that cannot be neutralized by `continue-on-error` on any
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
  if (!isPinnedForkRejectIf(step.if)) return false;
  const owner = jobByStep.get(step);
  const envCtx = ctx ?? (owner ? stepEnvContextOf(owner) : {});
  try {
    assertStepKeysModelled(step, "reject");
    if (owner) assertJobKeysModelled(owner, "reject");
    const env = effectiveStepEnv(envCtx.workflowEnv, envCtx.jobEnv, step.env);
    if ([run, ...Object.values(env)].some((text) => text.includes("${{"))) {
      return false;
    }
    const neutralized = EVENT_SCENARIOS.filter((s) => s.fork).some((scenario) =>
      evaluateFlag(step["continue-on-error"], scenarioContext(scenario, {})),
    );
    if (neutralized) return false;
    const result = executeRunScript(step, run, env, owner);
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
  const problems: string[] = [
    ...modelledKeyProblems(job, "reject"),
    ...pinnedIfProblems(job),
  ];
  const steps = allSteps(job);
  const rejectIndex = forkRejectStepIndex(job);
  if (rejectIndex === -1) {
    // A job-level `${{ }}` env value also makes the reject step unprovable,
    // so report the job-level secret use alongside the missing reject step.
    // A step that prints the reject message under a different `if:` is named.
    const unpinned = steps.flatMap((step, index) => {
      if (typeof step.run !== "string" || !step.run.includes(FORK_FAIL_MESSAGE))
        return [];
      try {
        assertPinnedForkRejectIf(step);
        return [];
      } catch (error) {
        return [`step ${index}: ${(error as Error).message}`];
      }
    });
    return [
      "no fork-reject step (pinned FORK_REJECT_IF; body exits non-zero printing the message; no continue-on-error)",
      ...problems,
      ...unpinned,
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
  const problems: string[] = [...pinnedIfProblems(job)];
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
  acceptance: "success",
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
 * Argv (before the script file) for a reject/gate `run:` step. Only an unset
 * shell (no `shell` at the step, job `defaults.run` or workflow `defaults.run`
 * level) is modelled. The script is written to a temp file and run as
 * `bash --noprofile --norc -eo pipefail <file>`, as ruled for #2160: a file
 * (not `-c`), so bash honours `BASH_ENV` the way it does on the runner. The
 * documented runner default for an unset shell is `bash -e {0}`; for allowed
 * bodies the two are equivalent (pipes are not allowed, and non-interactive
 * bash reads no profile or rc file). Any resolved shell — including an
 * explicit `bash` or `sh` and any custom template such as `true {0}` — and any
 * resolved `working-directory` throws "... is not modelled" (fail closed);
 * see {@link resolveRunSettings}.
 */
export function runStepShellArgv(
  step: WorkflowStep,
  job: WorkflowJob | undefined = jobByStep.get(step),
): [string, string[]] {
  const { shell, workingDirectory } = resolveRunSettings(step, job);
  if (workingDirectory.value !== undefined) {
    throw new Error(
      `working-directory ${JSON.stringify(workingDirectory.value)} (from ${workingDirectory.source}) is not modelled`,
    );
  }
  if (shell.value !== undefined) {
    throw new Error(
      `Shell ${JSON.stringify(shell.value)} (from ${shell.source}) is not modelled: only the default \`bash -e {0}\` (no shell at step, job or workflow level) is`,
    );
  }
  return ["bash", ["--noprofile", "--norc", "-eo", "pipefail"]];
}

const scriptExecutionCache = new Map<string, GateExecution>();

/**
 * Runner variables modelled with the values Actions sets on every job, so a
 * script or a child program that branches on them behaves as on the runner.
 */
export const MODELLED_RUNNER_ENV: Readonly<Record<string, string>> = {
  GITHUB_ACTIONS: "true",
  CI: "true",
};

/**
 * Env for a spawned `run:` script: `PATH` from the test process (so the shell
 * can find `bash`, `node`, ...), the given env — the effective workflow ->
 * job -> step env — and {@link MODELLED_RUNNER_ENV}. Nothing else from the
 * test process leaks in (no `HOME`, other `GITHUB_*`, ...). A child program's
 * own env reads (for example `node scripts/verify/ci-build-policy.mjs --gate`
 * reading `CI_RESULTS`) cannot be text-checked; they see only this env.
 */
export function scriptSpawnEnv(
  env: Record<string, string>,
): Record<string, string> {
  return {
    PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
    ...env,
    ...MODELLED_RUNNER_ENV,
  };
}

function notModelled(what: string): never {
  throw new Error(`Script ${what} is not modelled`);
}

/** Commands that read the environment or run code the scanner cannot see. */
const ENV_READING_COMMANDS = new Set([
  "eval",
  "source",
  ".",
  "printenv",
  "env",
  "compgen",
]);
const SEGMENT_PREFIX_WORDS = new Set([
  "then",
  "do",
  "else",
  "elif",
  "if",
  "while",
  "until",
  "!",
  "time",
]);
const DECLARATION_COMMANDS = new Set([
  "local",
  "export",
  "readonly",
  "declare",
  "typeset",
]);
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
/** Stands in for quoted text and expansions in the unquoted command text. */
const PLACEHOLDER = "\u0000";

export type ScriptVariables = {
  /** Environment-style names the script expands (`$NAME`, `${NAME...}`). */
  references: string[];
  /** Names the script itself assigns (`name=`, `local name=`, `for name`, `read name`). */
  locals: string[];
};

/** Index just past `$...` starting at `start`; records referenced names. */
function scanDollar(script: string, start: number, refs: Set<string>): number {
  const next = script[start + 1];
  if (next === "(") notModelled("with $( ) command or arithmetic substitution");
  if (next === "{") {
    const close = script.indexOf("}", start + 2);
    if (close === -1) notModelled("with an unterminated ${");
    const body = script.slice(start + 2, close);
    if (/[{`]|\$\(/.test(body))
      notModelled(`with a nested expansion \${${body}}`);
    if (body.startsWith("!")) notModelled(`with \${!...} indirection`);
    const name = /^#?([A-Za-z_][A-Za-z0-9_]*)/.exec(body);
    const special = /^#?(?:[0-9]+|[?#$!@*-])/.exec(body);
    const match = name ?? special;
    if (!match) notModelled(`with \${${body}}`);
    if (name) refs.add(name[1]!);
    const rest = body.slice(match[0].length);
    if (rest.includes("$")) {
      for (const ref of scanScriptVariables(rest).references) refs.add(ref);
    }
    return close + 1;
  }
  if (next === "'") {
    // ANSI-C `$'...'`: literal text, `\'` does not end it.
    let end = start + 2;
    while (end < script.length && script[end] !== "'") {
      end += script[end] === "\\" ? 2 : 1;
    }
    if (end >= script.length) notModelled("with an unterminated $'");
    return end + 1;
  }
  const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(script.slice(start + 1));
  if (name) {
    refs.add(name[0]);
    return start + 1 + name[0].length;
  }
  if (next !== undefined && /[0-9?#$!@*-]/.test(next)) return start + 2;
  return start + 1; // A lone `$` (or `$"..."`) is literal.
}

/** Assignments, loop variables and `read` targets in one simple command. */
function collectLocals(tokens: string[], locals: Set<string>): void {
  let i = 0;
  while (i < tokens.length && SEGMENT_PREFIX_WORDS.has(tokens[i]!)) i += 1;
  const first = tokens[i];
  if (first === undefined) return;
  if (first === "for" || first === "select") {
    const name = tokens[i + 1] ?? "";
    if (NAME.test(name)) locals.add(name);
    return;
  }
  if (first === "read") {
    for (const token of tokens.slice(i + 1)) {
      if (NAME.test(token)) locals.add(token);
    }
    return;
  }
  if (DECLARATION_COMMANDS.has(first)) {
    for (const token of tokens.slice(i + 1)) {
      if (/^-\w*p/.test(token)) notModelled(`listing variables (${first} -p)`);
      const assigned = /^([A-Za-z_][A-Za-z0-9_]*)\+?=/.exec(token);
      if (assigned) locals.add(assigned[1]!);
    }
    return;
  }
  while (i < tokens.length) {
    const assigned = /^([A-Za-z_][A-Za-z0-9_]*)\+?=/.exec(tokens[i]!);
    if (!assigned) break;
    locals.add(assigned[1]!);
    i += 1;
  }
  const command = tokens[i];
  if (command !== undefined) {
    if (ENV_READING_COMMANDS.has(command)) {
      notModelled(`running \`${command}\``);
    }
    if (command === "set" && tokens.length === i + 1) {
      notModelled("listing variables (bare `set`)");
    }
  }
}

/**
 * Variable-reference rule for `run:` scripts executed by this harness.
 *
 * - Expansions are `$NAME` and `${NAME...}` (including `${#NAME}`,
 *   `${NAME:-word}`; names inside `word` count too) outside single quotes.
 *   `'...'` and `$'...'` are literal; a backslash escapes the next character
 *   (so `\$X` is literal). `#` starting a word outside quotes is a comment.
 * - Shell special parameters (`$?`, `$#`, `$$`, `$!`, `$-`, `$@`, `$*`,
 *   `$0`-`$9`, `${10}`) are not environment and are always allowed.
 * - Script-local names are allowed anywhere in the script if the script assigns
 *   them anywhere (simple rule; a read before the assignment is not
 *   distinguished): `name=` / `name+=` at the start of a simple command
 *   (after newline, `;`, `&&`, `||`, `|`, `(`, `{`, `then`, `do`, ...),
 *   `local`/`export`/`readonly`/`declare`/`typeset name=`, `for`/`select name`
 *   and `read name` targets. `export NAME` without `=` is not an assignment.
 * - Fail closed (throw "... not modelled"): `$(...)`, `$((...))`, backticks,
 *   heredocs/here-strings (`<<`), `${!name}` indirection, nested `${...}`,
 *   unterminated quotes, and the env-reading or code-loading commands `eval`,
 *   `source`, `.`, `printenv`, `env`, `compgen`, bare `set`, `<decl> -p`, and
 *   any mention of `/proc/` (e.g. `/proc/self/environ`).
 */
export function scanScriptVariables(script: string): ScriptVariables {
  if (script.includes("/proc/")) notModelled("reading /proc");
  const refs = new Set<string>();
  let bare = "";
  let inDouble = false;
  let i = 0;
  while (i < script.length) {
    const c = script[i]!;
    if (!inDouble) {
      if (c === "'") {
        const end = script.indexOf("'", i + 1);
        if (end === -1) notModelled("with an unterminated single quote");
        bare += PLACEHOLDER;
        i = end + 1;
        continue;
      }
      if (c === '"') {
        inDouble = true;
        bare += PLACEHOLDER;
        i += 1;
        continue;
      }
      if (c === "#" && (bare === "" || /[\s;&|(){}]$/.test(bare))) {
        const end = script.indexOf("\n", i);
        i = end === -1 ? script.length : end;
        continue;
      }
      if (c === "<" && script[i + 1] === "<") {
        notModelled("with a heredoc or here-string");
      }
    } else if (c === '"') {
      inDouble = false;
      i += 1;
      continue;
    }
    if (c === "\\") {
      if (!inDouble) bare += PLACEHOLDER;
      i += 2;
      continue;
    }
    if (c === "`") notModelled("with backtick command substitution");
    if (c === "$") {
      i = scanDollar(script, i, refs);
      if (!inDouble) bare += PLACEHOLDER;
      continue;
    }
    if (!inDouble) bare += c;
    i += 1;
  }
  if (inDouble) notModelled("with an unterminated double quote");

  const locals = new Set<string>();
  for (const segment of bare.split(/\n|;|&&|\|\||\||&|\(|\)|\{|\}/)) {
    collectLocals(segment.trim().split(/\s+/).filter(Boolean), locals);
  }
  return { references: [...refs].sort(), locals: [...locals].sort() };
}

/**
 * Throw "... not modelled" unless every name the script expands is in the
 * spawned env (the effective env; `PATH` is deliberately not counted, since its
 * value differs from the runner's) or assigned by the script itself.
 */
export function assertScriptVariablesModelled(
  script: string,
  env: Record<string, string>,
): void {
  const { references, locals } = scanScriptVariables(script);
  const missing = references.filter(
    (name) => !Object.hasOwn(env, name) && !locals.includes(name),
  );
  if (missing.length > 0) {
    notModelled(
      `reading ${missing.map((name) => `$${name}`).join(", ")} (not in the effective env, not a special parameter, not script-local)`,
    );
  }
}

// ---------------------------------------------------------------------------
// Exact command allowlist for reject/gate run bodies
// ---------------------------------------------------------------------------

/**
 * The one pinned non-shell body: ci.yml `ci-gate` runs this repo script with
 * fixed arguments (it reads `CI_RESULTS`/`CI_BUILD_REQUESTED` from the step
 * env). Only this exact whole body (after trimming) is allowed; any other
 * `node` use, other arguments, or an extra command fails as "not allowed".
 */
export const PINNED_CI_GATE_BODY =
  "node scripts/verify/ci-build-policy.mjs --gate";

type ShellWord = {
  /** Text with quotes removed; expansions appear as `$NAME` / `$?`. */
  text: string;
  /** Any part was quoted or backslash-escaped. */
  quoted: boolean;
  /** Unquoted literal text before the first quoted/expanded part. */
  plainPrefix: string;
  /** Expansions in the word and whether each was inside double quotes. */
  expansions: { name: string; quoted: boolean }[];
  /** An unquoted `[` or `]` appeared in the word. */
  bracket: boolean;
};
type ShellOp = ";" | "&&" | "||" | "\n";
type ShellToken =
  { kind: "word"; word: ShellWord } | { kind: "op"; op: ShellOp };

function notAllowed(what: string): never {
  throw new Error(`${what} is not allowed in reject/gate run bodies`);
}

const UNQUOTED_WORD_CHAR = /[A-Za-z0-9_./:=+,@%!-]/;
const TEST_UNARY = new Set(["-n", "-z"]);
const TEST_BINARY = new Set([
  "=",
  "==",
  "!=",
  "-eq",
  "-ne",
  "-lt",
  "-le",
  "-gt",
  "-ge",
]);

/** Read `$NAME`, `${NAME}` or `$?` at `start`; every other `$` form is not allowed. */
function readExpansion(
  script: string,
  start: number,
  quoted: boolean,
  word: ShellWord,
): number {
  const rest = script.slice(start + 1);
  if (rest.startsWith("?")) {
    word.expansions.push({ name: "?", quoted });
    word.text += "$?";
    return start + 2;
  }
  const name =
    /^\{([A-Za-z_][A-Za-z0-9_]*)\}/.exec(rest) ??
    /^([A-Za-z_][A-Za-z0-9_]*)/.exec(rest);
  if (!name) {
    const close = rest.startsWith("{") ? rest.indexOf("}") : -1;
    const shown = close === -1 ? rest.slice(0, 12) : rest.slice(0, close + 1);
    notAllowed(`Expansion \`$${shown}\``);
  }
  word.expansions.push({ name: name[1]!, quoted });
  word.text += `$${name[1]}`;
  return start + 1 + name[0].length;
}

function tokenizeAllowedScript(script: string): ShellToken[] {
  const tokens: ShellToken[] = [];
  let word: ShellWord | undefined;
  let plain = true;
  const current = (): ShellWord =>
    (word ??= {
      text: "",
      quoted: false,
      plainPrefix: "",
      expansions: [],
      bracket: false,
    });
  const flush = () => {
    if (word) tokens.push({ kind: "word", word });
    word = undefined;
    plain = true;
  };
  const op = (value: ShellOp) => {
    flush();
    tokens.push({ kind: "op", op: value });
  };
  let i = 0;
  while (i < script.length) {
    const c = script[i]!;
    if (c === "\\") {
      const next = script[i + 1];
      if (next === "\n") {
        i += 2; // line continuation
        continue;
      }
      if (next === undefined) notAllowed("A trailing backslash");
      const w = current();
      w.text += next;
      w.quoted = true;
      plain = false;
      i += 2;
      continue;
    }
    if (c === "'") {
      const end = script.indexOf("'", i + 1);
      if (end === -1) notAllowed("An unterminated single quote");
      const w = current();
      w.text += script.slice(i + 1, end);
      w.quoted = true;
      plain = false;
      i = end + 1;
      continue;
    }
    if (c === '"') {
      const w = current();
      w.quoted = true;
      plain = false;
      i += 1;
      for (;;) {
        if (i >= script.length) notAllowed("An unterminated double quote");
        const d = script[i]!;
        if (d === '"') {
          i += 1;
          break;
        }
        if (d === "`") notAllowed("Backtick command substitution");
        if (d === "$") {
          i = readExpansion(script, i, true, w);
          continue;
        }
        if (d === "\\") {
          const n = script[i + 1];
          if (n === "\n") {
            i += 2;
            continue;
          }
          if (n !== undefined && '$`"\\'.includes(n)) {
            w.text += n;
            i += 2;
            continue;
          }
        }
        w.text += d;
        i += 1;
      }
      continue;
    }
    if (c === "$") {
      i = readExpansion(script, i, false, current());
      plain = false;
      continue;
    }
    if (c === "#" && word === undefined) {
      const end = script.indexOf("\n", i);
      i = end === -1 ? script.length : end;
      continue;
    }
    if (c === " " || c === "\t") {
      flush();
      i += 1;
      continue;
    }
    if (c === "\n") {
      op("\n");
      i += 1;
      continue;
    }
    if (c === ";") {
      if (script[i + 1] === ";") notAllowed("`;;`");
      op(";");
      i += 1;
      continue;
    }
    if (c === "&" && script[i + 1] === "&") {
      op("&&");
      i += 2;
      continue;
    }
    if (c === "|" && script[i + 1] === "|") {
      op("||");
      i += 2;
      continue;
    }
    if ("|&()<>{}`".includes(c)) {
      const what: Record<string, string> = {
        "|": "A pipe `|`",
        "&": "Background or redirection `&`",
        "(": "A subshell, `((` or function definition `(`",
        ")": "`)`",
        "<": "A redirection `<`",
        ">": "A redirection `>`",
        "{": "A group or brace expansion `{`",
        "}": "`}`",
        "`": "Backtick command substitution",
      };
      notAllowed(what[c]!);
    }
    const w = current();
    if (c === "[" || c === "]") w.bracket = true;
    else if (!UNQUOTED_WORD_CHAR.test(c)) notAllowed(`Unquoted \`${c}\``);
    w.text += c;
    if (plain) w.plainPrefix += c;
    i += 1;
  }
  flush();
  return tokens;
}

const plainWord = (word: ShellWord | undefined): string | undefined =>
  word && !word.quoted && word.expansions.length === 0 ? word.text : undefined;

/** An argument: literal or quoted text; expansions must be double-quoted. */
function checkArgument(word: ShellWord): void {
  if (word.bracket) notAllowed(`Word \`${word.text}\``);
  const bare = word.expansions.find((expansion) => !expansion.quoted);
  if (bare) notAllowed(`Unquoted expansion \`$${bare.name}\``);
}

function checkTest(inner: ShellWord[]): void {
  for (const word of inner) {
    const text = plainWord(word) ?? (word.expansions.length ? "" : word.text);
    if (
      text.startsWith("-") &&
      !TEST_UNARY.has(text) &&
      !TEST_BINARY.has(text)
    ) {
      notAllowed(`Test operator \`${text}\``);
    }
  }
  const args = plainWord(inner[0]) === "!" ? inner.slice(1) : inner;
  const operator = (word: ShellWord | undefined) =>
    word && word.expansions.length === 0 ? word.text : undefined;
  if (args.length === 2 && TEST_UNARY.has(operator(args[0]) ?? "")) {
    checkArgument(args[1]!);
    return;
  }
  if (args.length === 3 && TEST_BINARY.has(operator(args[1]) ?? "")) {
    checkArgument(args[0]!);
    checkArgument(args[2]!);
    return;
  }
  notAllowed(
    `Test expression \`[ ${inner.map((word) => word.text).join(" ")} ]\``,
  );
}

function checkSimpleCommand(words: ShellWord[]): void {
  const first = words[0]!;
  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(first.plainPrefix)) {
    if (words.length > 1) {
      notAllowed(`A prefix assignment before \`${words[1]!.text}\``);
    }
    if (first.bracket) notAllowed(`Assignment \`${first.text}\``);
    return; // NAME=value (no word splitting in assignments)
  }
  const name = plainWord(first);
  if (name === undefined) {
    notAllowed(`A quoted or expanded command name \`${first.text}\``);
  }
  const args = words.slice(1);
  if (name === "echo") {
    args.forEach(checkArgument);
    return;
  }
  if (name === "exit") {
    const [code, extra] = args;
    const ok =
      extra === undefined &&
      (code === undefined ||
        /^\d+$/.test(plainWord(code) ?? "") ||
        (code.text === "$?" && code.expansions.length === 1));
    if (!ok) notAllowed(`\`exit ${args.map((w) => w.text).join(" ")}\``);
    return;
  }
  if (name === "[") {
    if (plainWord(words.at(-1)) !== "]" || words.length < 2) {
      notAllowed("A `[` test without a closing `]`");
    }
    checkTest(words.slice(1, -1));
    return;
  }
  notAllowed(`Command \`${name}\``);
}

type BlockState = "if-cond" | "if-body" | "else-body" | "for-head" | "for-body";

function checkSegment(words: ShellWord[], stack: BlockState[]): void {
  let rest = words;
  while (rest.length > 0) {
    const head = plainWord(rest[0]);
    const top = stack.at(-1);
    const advance = (state: BlockState) => {
      stack[stack.length - 1] = state;
      rest = rest.slice(1);
    };
    if (head === "if") {
      stack.push("if-cond");
      rest = rest.slice(1);
      if (rest.length === 0) notAllowed("An empty `if` condition");
      continue;
    }
    if (head === "then") {
      if (top !== "if-cond") notAllowed("`then` outside an `if` condition");
      advance("if-body");
      continue;
    }
    if (head === "else") {
      if (top !== "if-body") notAllowed("`else` outside an `if` body");
      advance("else-body");
      continue;
    }
    if (head === "do") {
      if (top !== "for-head") notAllowed("`do` outside a `for` loop");
      advance("for-body");
      continue;
    }
    if (head === "fi" || head === "done") {
      const open = head === "fi" ? ["if-body", "else-body"] : ["for-body"];
      if (!open.includes(top ?? "")) notAllowed(`An unmatched \`${head}\``);
      if (rest.length > 1) notAllowed(`Words after \`${head}\``);
      stack.pop();
      return;
    }
    if (head === "for") {
      const [, loopName, inWord, ...items] = rest;
      if (!NAME.test(plainWord(loopName) ?? "") || plainWord(inWord) !== "in") {
        notAllowed("A `for` loop other than `for NAME in ...`");
      }
      items.forEach(checkArgument);
      stack.push("for-head");
      return;
    }
    checkSimpleCommand(rest);
    return;
  }
}

/**
 * Fail-closed allowlist for reject/gate `run:` bodies (checked by
 * {@link executeRunScript} before the `$`-reference scan and before spawning).
 * Anything not listed throws "... is not allowed ...", naming the token.
 *
 * Inventory of the real bodies (after `${{ }}` rendering), which this allows:
 * - ci-integration migrate/smoke "Reject fork pull requests": `echo`, `exit 1`.
 * - e2e-smoke-gate "Fail if E2E smoke failed": `echo`,
 *   `if [ "…" != "…" ]; then … fi`, `exit 1`.
 * - integration-gate: `echo`, `failed=0`/`failed=1`,
 *   `for result in \ "…" \ … do … done` (backslash-newline), `if [ "$result"
 *   != "success" ]; then … fi`, `[ "$failed" -ne 0 ]`, `exit 1`.
 * - e2e-gate: `echo`, `if [ … ] || \ [ … ]; then … fi`, `exit 1`.
 * - ci.yml ci-gate: exactly {@link PINNED_CI_GATE_BODY} (pinned-body exception).
 *
 * Allowed: commands `echo`, `[ … ]`, `exit` (no argument, an integer literal,
 * or `$?`); whole-command assignments `NAME=value`; keywords
 * `if`/`then`/`else`/`fi` and `for NAME in …; do … done`; separators `;`,
 * `&&`, `||`, newline; backslash-newline; single/double quotes and backslash
 * escapes; `#` comments. `[` tests: `-n X`, `-z X`, `X op Y` with op in
 * `=`, `==`, `!=`, `-eq`, `-ne`, `-lt`, `-le`, `-gt`, `-ge`, optionally negated
 * by a leading `!`. Expansions: only `$NAME`, `${NAME}` (double-quoted, except
 * in assignment values) and `$?`; unquoted words use `[A-Za-z0-9_./:=+,@%!-]`.
 *
 * Not allowed (examples): `[[`, `elif`, `((`, `$((`, `$( )`, backticks, `let`,
 * `declare`/`local`/`export`/`readonly`/`typeset`/`read`, `eval`, `exec`,
 * `source`, `.`, `case`, `while`, `until`, `select`, functions, `( )`, `{ }`,
 * `|`, `&`, every redirection, `${…}` forms other than `${NAME}`, `[` operators
 * `-v`/`-R`/`-o`/`-a`/file tests, prefix assignments (`X=1 cmd`), globs, `~`,
 * and every other command (`true`, `false`, `test`, `printf`, `:`, `set`,
 * `bash`, `sh`, `node`, `python3`, …).
 */
export function assertScriptAllowed(script: string): void {
  if (script.trim() === PINNED_CI_GATE_BODY) return;
  const stack: BlockState[] = [];
  let segment: ShellWord[] = [];
  for (const token of [
    ...tokenizeAllowedScript(script),
    { kind: "op", op: "\n" } as const,
  ]) {
    if (token.kind === "word") {
      segment.push(token.word);
      continue;
    }
    if (segment.length > 0) checkSegment(segment, stack);
    segment = [];
  }
  if (stack.length > 0) notAllowed(`An unterminated \`${stack.at(-1)}\` block`);
}

/**
 * Run one rendered `run:` body (from the repo root) under the step's shell with
 * the scrubbed {@link scriptSpawnEnv}; memoized on the full spawned env. Throws
 * before running a script that is outside the {@link assertScriptAllowed}
 * allowlist ("not allowed") or whose variable references are not modelled
 * ({@link scanScriptVariables}), so callers fail closed.
 */
export function executeRunScript(
  step: WorkflowStep,
  script: string,
  env: Record<string, string>,
  job: WorkflowJob | undefined = jobByStep.get(step),
): GateExecution {
  assertScriptAllowed(script);
  assertEnvKeysNotDenied(env, "effective env");
  assertScriptVariablesModelled(script, { ...env, ...MODELLED_RUNNER_ENV });
  const [command, args] = runStepShellArgv(step, job);
  const spawnEnv = scriptSpawnEnv(env);
  const key = JSON.stringify([command, args, script, spawnEnv, process.cwd()]);
  const cached = scriptExecutionCache.get(key);
  if (cached) return cached;
  // As the runner does: the body goes to a temp file that bash runs.
  const dir = mkdtempSync(path.join(tmpdir(), "workflow-run-"));
  let proc: ReturnType<typeof spawnSync>;
  try {
    const file = path.join(dir, "run.sh");
    writeFileSync(file, script);
    proc = spawnSync(command, [...args, file], {
      encoding: "utf8",
      cwd: process.cwd(),
      env: spawnEnv,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const result = {
    status: proc.status ?? 1,
    stdout: String(proc.stdout ?? ""),
    stderr: String(proc.stderr ?? ""),
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
  assertJobKeysModelled(job, "gate");
  const [pinProblem] = pinnedIfProblems(job);
  if (pinProblem !== undefined) throw new Error(pinProblem);
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
      result = executeRunScript(
        step,
        renderStepText(step.run, context),
        env,
        job,
      );
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
