/**
 * Shared harness for the #2180 acceptance tests (self-hosted runner guard).
 * Owned by Acceptance; implementers must not edit. Spec (base 4e31ff33) and
 * approval:
 * https://github.com/Asymmetric-al/core/issues/2180#issuecomment-6370037299
 * https://github.com/Asymmetric-al/core/issues/2180#issuecomment-6370047702
 *
 * Guard contract these tests assume (spec §1.1 names only
 * `selfHostedRunnerProblems(workflows)`; the rest is Acceptance's reading):
 * - `loadWorkflows(dir = ".github/workflows")` returns `{ [fileName]: yamlSource }`
 *   for every `*.yml` and `*.yaml` file in `dir`, keyed by base name.
 * - `selfHostedRunnerProblems(workflows)` takes that map and returns one
 *   problem string per violation; it reads only the files it is given.
 * - `reachableWorkflows(workflows)` returns the sorted reachable file names.
 */
import { readFileSync, readdirSync } from "node:fs";

import { expect } from "vitest";

export type Workflows = Record<string, string>;
export type Guard = {
  loadWorkflows: (dir?: string) => Workflows;
  selfHostedRunnerProblems: (workflows: Workflows) => string[];
  reachableWorkflows: (workflows: Workflows) => string[];
};

/** Builder-owned (spec §2 I1); does not exist before the #2180 PR. */
export const GUARD_FILE = "tests/unit/helpers/self-hosted-runner-guard.ts";
const GUARD_SPECIFIER = "../../helpers/self-hosted-runner-guard";
export const DOC = "docs/ops/self-hosted-runners.md";
const EXPORTS = [
  "loadWorkflows",
  "selfHostedRunnerProblems",
  "reachableWorkflows",
] as const;

/** Import the guard at run time so a missing file fails each test by name. */
export async function guard(): Promise<Guard> {
  let mod: Record<string, unknown>;
  try {
    mod = (await import(/* @vite-ignore */ GUARD_SPECIFIER)) as never;
  } catch (error) {
    return expect.fail(`${GUARD_FILE} is missing: ${String(error)}`);
  }
  for (const name of EXPORTS) {
    expect(typeof mod[name], `${GUARD_FILE} must export ${name}()`).toBe(
      "function",
    );
  }
  return mod as unknown as Guard;
}

export const WORKFLOW_DIR = ".github/workflows";
/** The real tree, read by the test itself (not by the guard's loader). */
export function realTree(): Workflows {
  return Object.fromEntries(
    readdirSync(WORKFLOW_DIR)
      .filter((f) => /\.ya?ml$/.test(f))
      .sort()
      .map((f) => [f, readFileSync(`${WORKFLOW_DIR}/${f}`, "utf8")]),
  );
}

/** Replace `from` (asserting its hit count, so a drift can't hide a no-op). */
export function mutate(text: string, from: string, to: string, count = 1) {
  expect(text.split(from).length - 1, `occurrences of ${from}`).toBe(count);
  return text.split(from).join(to);
}

/** The real tree with one file replaced or added. */
export function treeWith(file: string, source: string): Workflows {
  return { ...realTree(), [file]: source };
}

/** The real tree with `file` edited by one exact replacement. */
export function mutated(file: string, from: string, to: string, count = 1) {
  const tree = realTree();
  return { ...tree, [file]: mutate(tree[file]!, from, to, count) };
}

/** A minimal workflow with one job `probe` (indent `runs-on` 4 spaces). */
export function workflow(on: string, job: string, jobId = "probe") {
  return [
    "name: Probe",
    `on: ${on}`,
    "permissions:",
    "  contents: read",
    "jobs:",
    `  ${jobId}:`,
    job,
    "",
  ].join("\n");
}
export const STEP = "    steps:\n      - run: echo ok";
export const PROXMOX = "[self-hosted, linux, x64, proxmox]";
export const hostedJob = `    runs-on: ubuntu-latest\n${STEP}`;
export const runsOnJob = (runsOn: string) => `    runs-on: ${runsOn}\n${STEP}`;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** `<file> <job|on> [R#] <reason>; see docs/ops/self-hosted-runners.md` (§1.1). */
export const PROBLEM_FORMAT =
  /^(?:\.github\/workflows\/)?(\S+\.ya?ml) (\S+) \[R([123])\] (\S.*); see docs\/ops\/self-hosted-runners\.md$/;

/** Problems for `file` (and `slot`, a job id or `on`, when given) under rule `rule`. */
export function matching(
  problems: string[],
  file: string,
  rule: 1 | 2 | 3,
  slot?: string,
) {
  const lead = `^(?:\\.github/workflows/)?${escape(file)} ${slot ? escape(slot) : "\\S+"} \\[R${rule}\\] `;
  return problems.filter((p) => new RegExp(lead).test(p));
}

/** Assert at least one `[R#]` problem names `file` (and `slot`). */
export function expectProblem(
  problems: string[],
  file: string,
  rule: 1 | 2 | 3,
  slot?: string,
  mention?: string,
) {
  const hits = matching(problems, file, rule, slot).filter(
    (p) => !mention || p.includes(mention),
  );
  const want = `${file} ${slot ?? "<job|on>"} [R${rule}]${mention ? ` …${mention}…` : ""}`;
  expect(
    hits,
    `expected a problem "${want}" in ${JSON.stringify(problems)}`,
  ).not.toHaveLength(0);
}
