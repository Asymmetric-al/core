/**
 * Structural guard: a required status check must not be able to pass while
 * the work it stands for failed. Pure over parsed workflow documents so it can
 * be exercised against fixtures and against the real workflows.
 */
import {
  ifExpression,
  isAlwaysExpression,
  needsList,
  type WorkflowDocument,
  type WorkflowJob,
  type WorkflowJobs,
} from "./workflow-yaml";

export const CI = ".github/workflows/ci.yml";
export const CII = ".github/workflows/ci-integration.yml";

/** Workflow documents keyed by repository path. */
export type Workflows = Record<string, WorkflowDocument>;

/**
 * `develop`'s live required status checks (docs/ci.md § Branch protection),
 * by the workflow that emits each. Production-only contexts are out of scope:
 * `e2e-gate` needs jobs that are advisory on develop by design.
 */
export const REQUIRED_CHECKS: Readonly<Record<string, readonly string[]>> = {
  [CI]: ["ci-gate"],
  [CII]: ["e2e-smoke-gate", "migrate", "smoke"],
};

type Gate = {
  workflow: string;
  /** Jobs the gate must need and read; "every-other-job" = all other jobs of its workflow. */
  gates: "every-other-job" | readonly string[];
  /** Jobs of the workflow that are advisory by design and may stay ungated. */
  advisory?: readonly string[];
};

/** Gate jobs and the jobs each one exists to gate. */
export const GATES: Readonly<Record<string, Gate>> = {
  "ci-gate": {
    workflow: CI,
    gates: "every-other-job",
    advisory: ["shadscan-report"],
  },
  "e2e-smoke-gate": {
    workflow: CII,
    gates: ["migrate", "smoke", "test-e2e-smoke"],
  },
};

/** A run line ending in one of these exits 0 whatever the command did. */
const SWALLOWS_FAILURE = /\|\|\s*(?:true|:|exit\s+0)\s*;?\s*$/;

/** Problems that would let a required check pass while its work failed. */
export function requiredCheckProblems(workflows: Workflows): string[] {
  const problems: string[] = [];
  for (const [file, required] of Object.entries(REQUIRED_CHECKS)) {
    const jobs = workflows[file]?.jobs ?? {};
    for (const id of required) {
      if (!jobs[id]) problems.push(`${file}: required job ${id} is missing`);
    }
    for (const id of closure(jobs, required)) {
      problems.push(...blockingProblems(file, id, jobs[id]!));
    }
  }
  for (const [gateId, gate] of Object.entries(GATES)) {
    const jobs = workflows[gate.workflow]?.jobs ?? {};
    const job = jobs[gateId];
    if (job) problems.push(...gateProblems(gate, gateId, job, jobs));
  }
  return problems;
}

/** The required jobs that exist plus every job they need, transitively. */
function closure(jobs: WorkflowJobs, roots: readonly string[]): string[] {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id) || !jobs[id]) return;
    seen.add(id);
    for (const need of needsList(jobs[id])) visit(need);
  };
  roots.forEach(visit);
  return [...seen].sort();
}

function blockingProblems(
  file: string,
  id: string,
  job: WorkflowJob,
): string[] {
  const problems: string[] = [];
  const at = `${file} ${id}`;
  if (!isFalseOrUnset(job["continue-on-error"])) {
    problems.push(
      `${at}: job continue-on-error is ${JSON.stringify(job["continue-on-error"])}`,
    );
  }
  for (const [index, step] of (job.steps ?? []).entries()) {
    const name = step.name ?? step.uses ?? `#${index}`;
    if (!isFalseOrUnset(step["continue-on-error"])) {
      problems.push(`${at}: step "${name}" sets continue-on-error`);
    }
    if (onlyAfterFailure(step.if)) continue;
    for (const line of (step.run ?? "").split("\n")) {
      if (SWALLOWS_FAILURE.test(line)) {
        problems.push(
          `${at}: step "${name}" run line swallows failure: ${line.trim()}`,
        );
      }
    }
  }
  return problems;
}

function gateProblems(
  gate: Gate,
  gateId: string,
  job: WorkflowJob,
  jobs: WorkflowJobs,
): string[] {
  const problems: string[] = [];
  const at = `${gate.workflow} ${gateId}`;
  if (!isAlwaysExpression(ifExpression(job))) {
    problems.push(
      `${at}: if is not always(), so a skipped gate reports success`,
    );
  }
  const needs = new Set(needsList(job));
  const text = stringsOf(job.steps).join("\n");
  for (const id of gatedJobs(gate, gateId, jobs)) {
    if (!needs.has(id)) {
      problems.push(`${at}: ${gateId} does not need ${id}`);
    } else if (!readsResult(text, id)) {
      problems.push(`${at}: ${gateId} never reads needs.${id}.result`);
    }
  }
  return problems;
}

function gatedJobs(gate: Gate, gateId: string, jobs: WorkflowJobs): string[] {
  if (gate.gates !== "every-other-job") return [...gate.gates];
  const downstream = (id: string, seen = new Set<string>()): boolean => {
    if (seen.has(id) || !jobs[id]) return false;
    seen.add(id);
    return needsList(jobs[id]).some(
      (need) => need === gateId || downstream(need, seen),
    );
  };
  return Object.keys(jobs)
    .filter((id) => id !== gateId)
    .filter((id) => !(gate.advisory ?? []).includes(id))
    .filter((id) => !downstream(id))
    .sort();
}

function readsResult(text: string, id: string): boolean {
  const esc = id.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  return new RegExp(
    `needs(?:\\.${esc}|\\[\\s*['"]${esc}['"]\\s*\\])\\.result\\b`,
  ).test(text);
}

function isFalseOrUnset(value: unknown): boolean {
  return value === undefined || value === false;
}

/** A step whose condition is exactly failure() runs only once the job has failed. */
function onlyAfterFailure(condition: unknown): boolean {
  if (typeof condition !== "string") return false;
  const bare = condition
    .trim()
    .replace(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/, "$1")
    .trim();
  return bare === "failure()";
}

function stringsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsOf);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(stringsOf);
  }
  return [];
}
