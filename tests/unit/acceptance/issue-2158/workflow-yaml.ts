import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { validateCiGate } from "../../../../scripts/verify/ci-build-policy.mjs";

/** Parsed GitHub Actions workflow (jobs map only). */
export type WorkflowJobs = Record<string, WorkflowJob>;

export type WorkflowJob = {
  "runs-on"?: string | string[];
  "timeout-minutes"?: number;
  if?: string;
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
  if?: string;
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

function parseWorkflowYamlFile(absolutePath: string): { jobs?: WorkflowJobs } {
  const bun = globalThis.Bun as
    | { YAML: { parse(input: string): unknown } }
    | undefined;
  const source = readFileSync(absolutePath, "utf8");
  if (bun?.YAML) {
    return bun.YAML.parse(source) as { jobs?: WorkflowJobs };
  }

  const result = spawnSync(
    "bun",
    [
      "-e",
      "console.log(JSON.stringify(Bun.YAML.parse(await Bun.file(process.argv.at(-1)).text())))",
      absolutePath,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`Bun YAML parse failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout) as { jobs?: WorkflowJobs };
}

export function loadWorkflowJobs(relativePath: string): WorkflowJobs {
  const absolutePath = path.resolve(relativePath);
  const doc = parseWorkflowYamlFile(absolutePath);
  if (!doc?.jobs || typeof doc.jobs !== "object") {
    throw new Error(`Missing jobs map in ${relativePath}`);
  }
  return doc.jobs;
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

/** Fork-aware required jobs use an expression referencing fork + hosted + self-hosted labels. */
export function isForkAwareRunsOnExpression(
  runsOn: string | string[] | undefined,
): boolean {
  if (runsOn === undefined || Array.isArray(runsOn)) return false;
  const text = runsOn;
  return (
    text.includes("pull_request.head.repo.full_name") &&
    text.includes("ubuntu-latest") &&
    text.includes("self-hosted")
  );
}

export function ifExpression(job: WorkflowJob): string {
  const value = job.if;
  return typeof value === "string" ? value : "";
}

export function needsList(job: WorkflowJob): string[] {
  const needs = job.needs;
  if (needs === undefined) return [];
  return Array.isArray(needs) ? [...needs] : [needs];
}

export function containsSameRepoGuard(expression: string): boolean {
  const compact = normalizeWorkflowExpression(expression);
  const guard = normalizeWorkflowExpression(SAME_REPO_GUARD);

  if (/head\.repo\.full_name\s*!=/.test(compact)) {
    return false;
  }
  if (/github\.repository\s*!=/.test(compact)) {
    return false;
  }

  return compact.includes(guard);
}

export function isForkOnlyStepGuard(expression: string | undefined): boolean {
  if (!expression) return false;
  const compact = normalizeWorkflowExpression(expression);
  const guard = normalizeWorkflowExpression(FORK_ONLY_STEP_GUARD);
  if (/head\.repo\.full_name\s*==/.test(compact)) {
    return false;
  }
  return compact.includes(guard);
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

export function ciGateStepReferencesHeavyNeeds(step: WorkflowStep): boolean {
  const env = step.env ?? {};
  const ciResults = String(env.CI_RESULTS ?? "");
  return (
    ciResults.includes("needs.test-unit.result") &&
    ciResults.includes("needs.build.result")
  );
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
): boolean {
  if (!ifExpression(job).includes("always()")) {
    return false;
  }

  const needs = needsList(job);
  if (!needs.includes("build") || !needs.includes("test-unit")) {
    return false;
  }

  const policyStep = findCiGatePolicyStep(job);
  if (!policyStep || !ciGateStepReferencesHeavyNeeds(policyStep)) {
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

export function executeGateShellScript(
  script: string,
  results: Record<string, string>,
): number {
  const rendered = substituteNeedsExpressions(script, results);
  const proc = spawnSync("bash", ["-c", rendered], {
    encoding: "utf8",
  });
  return proc.status ?? 1;
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

export function hostedGateFailsClosedWhenHeavyNeedsSkipped(
  job: WorkflowJob,
  heavyNeedIds: string[],
): boolean {
  if (!ifExpression(job).includes("always()")) {
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

  const successResults = buildNeedResultsForGateJob(job, {});
  const skippedResults = buildNeedResultsForGateJob(
    job,
    Object.fromEntries(heavyNeedIds.map((needId) => [needId, "skipped"])),
  );

  const exitAllSuccess = executeGateShellScript(gateStep.run, successResults);
  const exitHeavySkipped = executeGateShellScript(gateStep.run, skippedResults);

  return exitAllSuccess === 0 && exitHeavySkipped !== 0;
}

export function requiredJobFailsClosedOnFork(job: WorkflowJob): boolean {
  if (!isForkAwareRunsOnExpression(jobRunsOn(job))) {
    return false;
  }

  return allSteps(job).some((step) => {
    const run = step.run ?? "";
    if (!run.includes(FORK_FAIL_MESSAGE)) {
      return false;
    }
    if (!/\bexit\s+1\b/.test(run)) {
      return false;
    }
    return isForkOnlyStepGuard(step.if);
  });
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
