import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

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

export type WorkflowStep = {
  uses?: string;
  run?: string;
  name?: string;
  if?: string;
  with?: Record<string, unknown>;
  [key: string]: unknown;
};

export const SPEC_COMMENT_URL =
  "https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612";

/** Spec rev 3 §3 guard `G` (same-repo only on self-hosted heavy jobs). */
export const SAME_REPO_GUARD =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";

export const SELF_HOSTED_LABELS = [
  "self-hosted",
  "linux",
  "x64",
  "proxmox",
] as const;

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
  const compact = expression.replace(/\s+/g, " ");
  return (
    compact.includes("github.event_name != 'pull_request'") &&
    compact.includes("github.event.pull_request.head.repo.full_name") &&
    compact.includes("github.repository")
  );
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

export function gateTreatsSkippedAsFailureOnFork(
  job: WorkflowJob,
  heavyNeedIds: string[],
): boolean {
  const run = stepRunText(job);
  const expr = ifExpression(job);
  const needs = needsList(job);
  const needsHeavy = heavyNeedIds.every((id) => needs.includes(id));
  const always = expr.includes("always()");
  const mentionsFork =
    containsSameRepoGuard(run) ||
    containsSameRepoGuard(expr) ||
    run.includes("head.repo.full_name") ||
    run.includes("fork PR");
  const mentionsSkipped =
    run.includes("skipped") ||
    heavyNeedIds.some(
      (id) =>
        run.includes(`needs.${id}.result`) ||
        run.includes(`needs['${id}'].result`) ||
        run.includes(`"${id}"`),
    );
  return always && needsHeavy && mentionsFork && mentionsSkipped;
}

export function requiredJobFailsClosedOnFork(job: WorkflowJob): boolean {
  const forkAwareRunsOn = isForkAwareRunsOnExpression(jobRunsOn(job));
  const run = stepRunText(job);
  const hasMessage =
    run.includes(FORK_FAIL_MESSAGE) ||
    allSteps(job).some(
      (step) =>
        (step.run?.includes(FORK_FAIL_MESSAGE) ?? false) ||
        (step.name?.toLowerCase().includes("fork") ?? false),
    );
  return forkAwareRunsOn && hasMessage;
}
