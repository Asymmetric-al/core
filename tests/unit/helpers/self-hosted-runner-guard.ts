/**
 * #2180 self-hosted runner guard (R1-R3). Pure functions over a map of
 * workflow file name to YAML source; the guard reads only the files it is
 * given. Rules and rationale: docs/ops/self-hosted-runners.md.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  MODELED_TRIGGER_EVENTS,
  isHostedUbuntuLabels,
  jobCallsReusableWorkflow,
  jobRunsOn,
  parseWorkflowSource,
  workflowTriggerEvents,
  type WorkflowDocument,
  type WorkflowJob,
  type WorkflowStep,
} from "./workflow-yaml";

export type Workflows = Record<string, string>;

/** The only workflows that may reach a self-hosted runner (R1). */
export const SELF_HOSTED_ALLOWLIST: readonly string[] = [
  "ci-integration.yml",
  "ci.yml",
];

/** Events where untrusted content arrives with base-repository privileges (R3). */
export const PRIVILEGED_TRIGGER_EVENTS: readonly string[] = [
  "issue_comment",
  "pull_request_review",
  "pull_request_review_comment",
  "pull_request_target",
  "workflow_run",
];

const DOC_POINTER = "see docs/ops/self-hosted-runners.md";
const LOCAL_WORKFLOW = /^\.\/\.github\/workflows\/([^/@]+\.ya?ml)$/;
const EXPRESSION = /\$\{\{([\s\S]*?)\}\}/g;

type Rule = 1 | 2 | 3;
type Parsed = Record<string, WorkflowDocument>;

function problem(file: string, slot: string, rule: Rule, reason: string) {
  return `${file} ${slot} [R${rule}] ${reason}; ${DOC_POINTER}`;
}

/** Every `*.yml` and `*.yaml` file in `dir`, keyed by base name. */
export function loadWorkflows(dir = ".github/workflows"): Workflows {
  return Object.fromEntries(
    readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file))
      .sort()
      .map((file) => [file, readFileSync(path.join(dir, file), "utf8")]),
  );
}

function parseAll(workflows: Workflows): Parsed {
  return Object.fromEntries(
    Object.entries(workflows).map(([file, source]) => [
      file,
      parseWorkflowSource(source) ?? {},
    ]),
  );
}

function jobsOf(doc: WorkflowDocument): [string, WorkflowJob][] {
  const jobs = doc.jobs && typeof doc.jobs === "object" ? doc.jobs : {};
  return Object.entries(jobs).filter(
    (entry): entry is [string, WorkflowJob] =>
      !!entry[1] && typeof entry[1] === "object",
  );
}

function triggersOf(doc: WorkflowDocument): string[] {
  try {
    return workflowTriggerEvents(doc);
  } catch {
    return [];
  }
}

/** Hosted only for a literal `ubuntu-*` label (OQ-4); anything else fails closed. */
function isHostedJob(job: WorkflowJob): boolean {
  const runsOn = jobRunsOn(job) as unknown;
  const labels = Array.isArray(runsOn) ? runsOn : [runsOn];
  return (
    labels.every(
      (label) => typeof label === "string" && !label.includes("${{"),
    ) && isHostedUbuntuLabels(labels as string[])
  );
}

/** The called workflow's file name for a local reusable call, else undefined. */
function localCallee(job: WorkflowJob): string | undefined {
  return LOCAL_WORKFLOW.exec(String(job.uses))?.[1];
}

function isRemoteCall(job: WorkflowJob): boolean {
  return jobCallsReusableWorkflow(job) && !String(job.uses).startsWith("./");
}

/** Workflow file name to whether it can reach a self-hosted runner (R1). */
function reachability(parsed: Parsed): Map<string, boolean> {
  const reach = new Map(Object.keys(parsed).map((file) => [file, false]));
  const jobReaches = (job: WorkflowJob): boolean => {
    if (!jobCallsReusableWorkflow(job)) return !isHostedJob(job);
    const callee = localCallee(job);
    // Remote calls and unresolvable local calls fail closed.
    if (callee === undefined || !(callee in parsed)) return true;
    return reach.get(callee)!;
  };
  // Fixpoint over local calls, so call cycles terminate without losing reach.
  for (let changed = true; changed;) {
    changed = false;
    for (const [file, doc] of Object.entries(parsed)) {
      if (reach.get(file) || !jobsOf(doc).some(([, job]) => jobReaches(job)))
        continue;
      reach.set(file, true);
      changed = true;
    }
  }
  return reach;
}

/** Sorted names of the workflows that can reach a self-hosted runner. */
export function reachableWorkflows(workflows: Workflows): string[] {
  const reach = reachability(parseAll(workflows));
  return [...reach]
    .filter(([, r]) => r)
    .map(([file]) => file)
    .sort();
}

function r1Problems(parsed: Parsed, reach: Map<string, boolean>): string[] {
  const problems: string[] = [];
  for (const [file, doc] of Object.entries(parsed)) {
    const allowed = SELF_HOSTED_ALLOWLIST.includes(file);
    if (allowed && !reach.get(file)) {
      problems.push(
        problem(
          file,
          "on",
          1,
          "allowlisted workflow no longer reaches a self-hosted runner; the reachable set must equal the allowlist",
        ),
      );
    }
    for (const [jobId, job] of jobsOf(doc)) {
      if (isRemoteCall(job)) {
        problems.push(
          problem(
            file,
            jobId,
            1,
            `calls remote reusable workflow ${String(job.uses)} (fails closed)`,
          ),
        );
      } else if (jobCallsReusableWorkflow(job)) {
        const callee = localCallee(job);
        if (callee === undefined || !(callee in parsed) || reach.get(callee)) {
          problems.push(
            problem(
              file,
              jobId,
              1,
              `calls ${String(job.uses)}, which can reach a self-hosted runner`,
            ),
          );
        }
      } else if (!allowed && !isHostedJob(job)) {
        problems.push(
          problem(
            file,
            jobId,
            1,
            `runs-on ${JSON.stringify(jobRunsOn(job) ?? null)} is not a literal ubuntu-* label; only ${SELF_HOSTED_ALLOWLIST.join(" and ")} may reach a self-hosted runner`,
          ),
        );
      }
    }
  }
  return problems;
}

function r2Problems(parsed: Parsed, reach: Map<string, boolean>): string[] {
  const modeled = new Set(MODELED_TRIGGER_EVENTS);
  return Object.entries(parsed)
    .filter(([file]) => reach.get(file))
    .flatMap(([file, doc]) =>
      triggersOf(doc)
        .filter((event) => !modeled.has(event))
        .map((event) =>
          problem(
            file,
            "on",
            2,
            `trigger ${event} is not modelled (allowed: ${MODELED_TRIGGER_EVENTS.join(", ")}) on a workflow that can reach a self-hosted runner`,
          ),
        ),
    );
}

function expressions(text: string): string[] {
  return [...text.matchAll(EXPRESSION)].map((match) => match[1]!);
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(strings);
  return [];
}

/** `secrets.*` / `secrets[...]` in any expression; `github.token` is allowed (R3e). */
function usesSecrets(value: unknown): boolean {
  return strings(value).some((text) =>
    expressions(text).some((e) => /\bsecrets\b/i.test(e)),
  );
}

function grantsWrite(permissions: unknown): boolean {
  if (typeof permissions === "string") return /write/i.test(permissions);
  return strings(permissions).some((scope) => /write/i.test(scope));
}

const UNTRUSTED_IN_RUN =
  /\bgithub\s*(?:\.\s*(?:event|head_ref)\b|\[\s*['"](?:event|head_ref)['"])|\binputs\s*[.[]/i;

function stepProblems(step: WorkflowStep): string[] {
  const uses = typeof step.uses === "string" ? step.uses : "";
  const run = typeof step.run === "string" ? step.run : "";
  const found: string[] = [];
  if (/^actions\/checkout(?:@|$)/.test(uses))
    found.push("(b) uses actions/checkout");
  if (uses.startsWith("./")) found.push(`(b) uses local ${uses}`);
  if (/^actions\/download-artifact(?:@|$)/.test(uses))
    found.push("(b) uses actions/download-artifact");
  if (/\bgh\s+run\s+download\b/.test(run))
    found.push("(b) runs gh run download");
  if (/^actions\/cache(?:[/@]|$)/.test(uses))
    found.push("(c) uses actions/cache");
  const cache = (step.with as Record<string, unknown> | undefined)?.cache;
  if (
    /\/setup-[^@]+/.test(uses) &&
    cache !== undefined &&
    cache !== false &&
    cache !== ""
  ) {
    found.push(`(c) ${uses.split("@")[0]} with cache:`);
  }
  if (expressions(run).some((e) => UNTRUSTED_IN_RUN.test(e))) {
    found.push(
      "(f) interpolates github.event, github.head_ref or inputs into run:; pass it through env:",
    );
  }
  if (usesSecrets(step)) found.push("(e) references secrets");
  return found;
}

function jobProblems(job: WorkflowJob): string[] {
  const found: string[] = [];
  if (jobCallsReusableWorkflow(job))
    found.push(`(b) calls reusable workflow ${String(job.uses)}`);
  else if (!isHostedJob(job)) found.push("(a) is not hosted-only");
  if ("permissions" in job && grantsWrite(job.permissions))
    found.push("(d) job-level permissions grant write");
  const { steps, ...jobLevel } = job;
  if (job.secrets !== undefined || usesSecrets(jobLevel))
    found.push("(e) references secrets");
  for (const step of Array.isArray(steps) ? steps : []) {
    if (step && typeof step === "object") found.push(...stepProblems(step));
  }
  return [...new Set(found)];
}

function r3Problems(parsed: Parsed): string[] {
  const problems: string[] = [];
  for (const [file, doc] of Object.entries(parsed)) {
    const privileged = triggersOf(doc).filter((e) =>
      PRIVILEGED_TRIGGER_EVENTS.includes(e),
    );
    if (privileged.length === 0) continue;
    const add = (slot: string, reason: string) =>
      problems.push(
        problem(
          file,
          slot,
          3,
          `${reason} under privileged trigger ${privileged.join(", ")}`,
        ),
      );
    if (!("permissions" in doc) || doc.permissions === null)
      add("on", "(d) missing explicit top-level permissions");
    else if (grantsWrite(doc.permissions))
      add("on", "(d) top-level permissions grant write");
    if (usesSecrets(doc.env))
      add("on", "(e) workflow-level env references secrets");
    for (const [jobId, job] of jobsOf(doc)) {
      for (const reason of jobProblems(job)) add(jobId, reason);
    }
  }
  return problems;
}

/** One problem per R1-R3 violation (§1.1); an empty list means pass. */
export function selfHostedRunnerProblems(workflows: Workflows): string[] {
  const parsed = parseAll(workflows);
  const reach = reachability(parsed);
  return [
    ...r1Problems(parsed, reach),
    ...r2Problems(parsed, reach),
    ...r3Problems(parsed),
  ];
}
