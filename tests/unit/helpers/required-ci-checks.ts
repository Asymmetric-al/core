/**
 * Structural guard: a required status check must not be able to pass while
 * the work it stands for failed. Pure over parsed workflow documents so it can
 * be exercised against fixtures and against the real workflows.
 *
 * It is a heuristic: it reads run scripts as text and evaluates conditions
 * only for the events in {@link EVENT_SCENARIOS}. The exact step pins in
 * `workflow-yaml.ts` (`PINNED_STEP_BODIES`, `PINNED_JOB_IFS`) remain the
 * backstop for the `migrate` job.
 */
import {
  EVENT_SCENARIOS,
  evaluateIfCondition,
  ifExpression,
  isAlwaysExpression,
  jobCallsReusableWorkflow,
  needsList,
  scenarioContext,
  type EventScenario,
  type WorkflowDocument,
  type WorkflowJob,
  type WorkflowJobs,
  type WorkflowStep,
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

/** Problems that would let a required check pass while its work failed. */
export function requiredCheckProblems(workflows: Workflows): string[] {
  const problems: string[] = [];
  for (const [file, required] of Object.entries(REQUIRED_CHECKS)) {
    const jobs = workflows[file]?.jobs ?? {};
    for (const id of required) {
      if (!jobs[id]) problems.push(`${file}: required job ${id} is missing`);
      else if (!GATES[id]) problems.push(...skipProblems(file, id, jobs[id]));
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
  if (jobCallsReusableWorkflow(job)) {
    problems.push(
      `${at}: calls a reusable workflow (${job.uses}), so whether its steps can fail cannot be checked`,
    );
  }
  for (const [index, step] of (job.steps ?? []).entries()) {
    const name = step.name ?? step.uses ?? `#${index}`;
    if (!isFalseOrUnset(step["continue-on-error"])) {
      problems.push(`${at}: step "${name}" sets continue-on-error`);
    }
    if (onlyAfterFailure(step.if)) continue;
    if (neverRuns(step, job)) {
      problems.push(
        `${at}: step "${name}" never runs (if: ${JSON.stringify(step.if)})`,
      );
    }
    for (const swallow of swallowedFailures(step.run ?? "")) {
      problems.push(
        `${at}: step "${name}" run line swallows failure: ${swallow}`,
      );
    }
  }
  return problems;
}

/** Same-repo events whose results branch protection on `develop` reads. */
const DEVELOP_EVENTS: readonly EventScenario[] = EVENT_SCENARIOS.filter(
  (scenario) => {
    if (scenario.fork) return false;
    const github = scenario.github as Record<string, unknown>;
    const ref = String(github.ref ?? "");
    switch (github.event_name) {
      case "pull_request":
        return github.base_ref === "develop";
      case "push":
        return ref === "refs/heads/develop";
      case "merge_group":
        return ref.startsWith("refs/heads/gh-readonly-queue/develop/");
      default:
        return false;
    }
  },
);

/** Every job the given job needs, as having succeeded. */
function healthyNeeds(job: WorkflowJob) {
  return Object.fromEntries(
    needsList(job).map((id) => [id, { result: "success", outputs: {} }]),
  );
}

/**
 * A skipped job reports success to branch protection, so a required job's
 * own `if` must hold on every develop event once every job it needs has
 * succeeded. A condition the event model cannot evaluate fails closed.
 */
function skipProblems(file: string, id: string, job: WorkflowJob): string[] {
  if (job.if === undefined) return [];
  for (const scenario of DEVELOP_EVENTS) {
    let runs: boolean;
    try {
      runs = evaluateIfCondition(
        job.if,
        scenarioContext(scenario, healthyNeeds(job)),
      );
    } catch (error) {
      return [
        `${file} ${id}: job if cannot be shown to run on develop (${(error as Error).message})`,
      ];
    }
    if (!runs) {
      return [
        `${file} ${id}: job if skips this required check on ${scenario.label} although every job it needs succeeded`,
      ];
    }
  }
  return [];
}

/**
 * A step whose condition is false for every modelled event, whether the job
 * is passing or failing. A condition the model cannot evaluate is not
 * reported (heuristic).
 */
function neverRuns(step: WorkflowStep, job: WorkflowJob): boolean {
  if (step.if === undefined) return false;
  for (const scenario of EVENT_SCENARIOS) {
    const ctx = scenarioContext(scenario, healthyNeeds(job));
    for (const failed of [false, true]) {
      try {
        const status = { success: !failed, failure: failed, cancelled: false };
        if (evaluateIfCondition(step.if, { ...ctx, status })) return false;
      } catch {
        return false;
      }
    }
  }
  return true;
}

/** Commands that exit 0 whatever came before them. */
const NO_OP = new Set(["true", ":", "/bin/true", "/usr/bin/true"]);
/** Commands that only report, then exit 0. */
const MESSAGE = new Set(["echo", "printf", "/bin/echo", "/usr/bin/echo"]);

const isNoOp = (words: readonly string[]): boolean =>
  NO_OP.has(words[0]!) ||
  ((words[0] === "exit" || words[0] === "return") && words[1] === "0");

/** `exit` or `return` with no status or a non-zero one, or `false`. */
const fails = (words: readonly string[]): boolean =>
  ((words[0] === "exit" || words[0] === "return") && words[1] !== "0") ||
  ["false", "/bin/false", "/usr/bin/false"].includes(words[0]!);

/** `set +e`, `set +ex`, `set +o errexit`: later failures stop failing the step. */
const disablesErrexit = (words: readonly string[]): boolean =>
  words[0] === "set" &&
  words.some(
    (word, i) =>
      /^\+[a-zA-Z]*e/.test(word) ||
      (word === "+o" && words[i + 1] === "errexit"),
  );

type ShellToken =
  | { kind: "op"; value: string; at: number }
  | { kind: "cmd"; words: string[]; at: number };

const isOp = (token: ShellToken | undefined, value: string): boolean =>
  token?.kind === "op" && token.value === value;

/**
 * The script with every character that is not shell syntax blanked, offsets
 * unchanged: `${{ }}` expressions, quoted text and comments become filler,
 * and a backslash-newline continuation becomes spaces.
 */
function shellSyntax(script: string): string {
  const out = script.split("");
  const blank = (i: number, fill: string) => {
    if (out[i] !== "\n") out[i] = fill;
  };
  for (const m of script.matchAll(/\$\{\{[\s\S]*?\}\}/g)) {
    for (let i = m.index; i < m.index + m[0].length; i += 1) blank(i, "_");
  }
  let quote: string | null = null;
  let comment = false;
  for (let i = 0; i < out.length; i += 1) {
    const ch = out[i]!;
    if (comment) {
      if (ch === "\n") comment = false;
      else out[i] = " ";
    } else if (quote) {
      if (ch === quote) quote = null;
      else if (quote === '"' && ch === "\\") {
        blank(i, "_");
        blank(i + 1, "_");
        i += 1;
      } else blank(i, "_");
    } else if (ch === "\\") {
      // An escaped character, or a line continuation, is not syntax.
      const fill = out[i + 1] === "\n" ? " " : "_";
      out[i] = fill;
      if (i + 1 < out.length) out[i + 1] = fill;
      i += 1;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === "#" && (i === 0 || /\s/.test(out[i - 1]!))) {
      comment = true;
      out[i] = " ";
    }
  }
  return out.join("");
}

function shellTokens(script: string): ShellToken[] {
  const tokens: ShellToken[] = [];
  const syntax = shellSyntax(script);
  for (const m of syntax.matchAll(/\|\||&&|;;|[;&|(){}\n]|[^;&|(){}\n]+/g)) {
    const text = m[0];
    if (/^(?:\|\||&&|;;|[;&|(){}\n])$/.test(text)) {
      tokens.push({ kind: "op", value: text, at: m.index });
    } else if (text.trim()) {
      tokens.push({
        kind: "cmd",
        words: text.trim().split(/\s+/),
        at: m.index + text.search(/\S/),
      });
    }
  }
  return tokens;
}

/** The commands inside the `{ }` or `( )` group that opens at `start`. */
function groupCommands(tokens: ShellToken[], start: number): string[][] {
  const commands: string[][] = [];
  let depth = 0;
  for (let i = start; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    if (token.kind === "cmd") commands.push(token.words);
    else if (token.value === "{" || token.value === "(") depth += 1;
    else if (token.value === "}" || token.value === ")") depth -= 1;
    if (depth === 0) break;
  }
  return commands;
}

/**
 * Lines of a run script that let it exit 0 although a command failed: an
 * `||` fallback that is a no-op, a message or a group with no failing exit;
 * `; true`; or `set +e`. Quoted text, comments and `${{ }}` are ignored.
 */
export function swallowedFailures(script: string): string[] {
  const tokens = shellTokens(script);
  const lineAt = (at: number) =>
    script
      .slice(script.lastIndexOf("\n", at - 1) + 1)
      .split("\n")[0]!
      .trim();
  const found = new Set<string>();
  tokens.forEach((token, i) => {
    if (token.kind === "cmd") {
      if (disablesErrexit(token.words)) found.add(lineAt(token.at));
      return;
    }
    if (token.value === "||") {
      // A newline may follow `||` before its fallback command.
      let j = i + 1;
      while (isOp(tokens[j], "\n")) j += 1;
      const next = tokens[j];
      if (!next) return;
      const swallowed =
        next.kind === "cmd"
          ? isNoOp(next.words) || MESSAGE.has(next.words[0]!)
          : (next.value === "{" || next.value === "(") &&
            !groupCommands(tokens, j).some(fails);
      if (swallowed) found.add(lineAt(token.at));
    } else if (token.value === ";") {
      const next = tokens[i + 1];
      if (next?.kind === "cmd" && isNoOp(next.words))
        found.add(lineAt(token.at));
    }
  });
  return [...found];
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
