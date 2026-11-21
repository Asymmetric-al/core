/**
 * Semantic check for a real-stack verification step in ci-integration.yml's
 * required `migrate` job (#2706). It replaces exact step indexes, exact `run:`
 * strings and relative-order pins: the step exists once, cannot be skipped or
 * made non-blocking, carries no key but `name`, `env` and `run`, runs after
 * the database is migrated, and runs the named files with vitest, on one line
 * with nothing but plain test paths after the command. A path may be a Bash
 * glob (`*`, `?`, `[...]`), which counts as the files it matches.
 * Which other files share the `run:` line and the step's position among
 * sibling verification steps are not asserted.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { expect } from "vitest";

import {
  loadWorkflowDocument,
  workflowJobs,
  type WorkflowJob,
  type WorkflowStep,
} from "../../helpers/workflow-yaml";

export const CII = ".github/workflows/ci-integration.yml";

/** The command every real-stack step runs, word by word. */
export const VITEST_RUN = ["bun", "x", "vitest", "run"] as const;

/** A repository-relative test file path and nothing else. */
const TEST_PATH = /^[\w./-]+\.test\.tsx?$/;

/**
 * A path with Bash glob characters and nothing else: no quote, `$`, brace,
 * operator or space, so Bash does nothing to it but pathname expansion.
 */
const GLOB_PATH = /^(?=[^*?[]*[*?[])[\w./*?[\]!-]+$/;

/** One path segment of a glob as a RegExp, or undefined when malformed. */
function globSegment(segment: string): RegExp | undefined {
  let source = "";
  for (let i = 0; i < segment.length; i += 1) {
    const c = segment[i]!;
    if (c === "*") source += "[^/]*";
    else if (c === "?") source += "[^/]";
    else if (c === "[") {
      const close = segment.indexOf("]", i + 2);
      if (close < 0) return undefined;
      const body = segment.slice(i + 1, close);
      if (!/^!?[\w.-]+$/.test(body)) return undefined;
      source += `[${body.replace(/^!/, "^")}]`;
      i = close;
    } else if (c === "]" || c === "!") return undefined;
    else source += c.replace(/[.\\^$+(){}|]/g, "\\$&");
  }
  // Bash's `*`, `?` and `[...]` do not match a leading dot.
  return new RegExp(`^${segment.startsWith(".") ? "" : "(?!\\.)"}${source}$`);
}

/**
 * The files a glob matches, relative to the repository root, as Bash expands
 * it there (no `globstar`, `dotglob` or `nullglob`); undefined when `word` is
 * not a glob this check models.
 */
export function expandGlob(word: string): string[] | undefined {
  if (!GLOB_PATH.test(word) || word.startsWith("/")) return undefined;
  let found = [""];
  for (const segment of word.split("/")) {
    if (!/[*?[]/.test(segment)) {
      found = found.map((dir) => (dir ? `${dir}/${segment}` : segment));
      continue;
    }
    const pattern = globSegment(segment);
    if (!pattern) return undefined;
    found = found.flatMap((dir) => {
      const at = dir || ".";
      if (!existsSync(at) || !statSync(at).isDirectory()) return [];
      return readdirSync(at)
        .filter((name) => pattern.test(name))
        .map((name) => (dir ? `${dir}/${name}` : name));
    });
  }
  return found.filter((f) => existsSync(f)).sort();
}

/**
 * The only keys a real-stack step may carry. Any other key (`shell`,
 * `working-directory`, `timeout-minutes`, ...) changes how the run line
 * executes without changing the line. `if` and `continue-on-error` are
 * reported on their own below.
 */
const STEP_KEYS = new Set(["name", "env", "run", "if", "continue-on-error"]);

export function migrateJob(): WorkflowJob | undefined {
  return workflowJobs(loadWorkflowDocument(CII), CII).migrate;
}

export function migrateSteps(): WorkflowStep[] {
  return migrateJob()?.steps ?? [];
}

/** Remove Bash backslash-newline continuations without inserting separators. */
function normalizeRunLine(run: unknown): string {
  return String(run ?? "")
    .replace(/\\\r?\n/g, "")
    .trim();
}

/** The whitespace-separated words of a step's `run:` text. */
export function runWords(step: WorkflowStep): string[] {
  return normalizeRunLine(step.run).split(/\s+/);
}

/**
 * The test files a `bun x vitest run` step runs, with each glob replaced by
 * the files it matches; none for a step that runs anything else.
 */
export function stepTestPaths(step: WorkflowStep): string[] {
  const words = runWords(step);
  if (words.slice(0, VITEST_RUN.length).join(" ") !== VITEST_RUN.join(" ")) {
    return [];
  }
  return words
    .slice(VITEST_RUN.length)
    .flatMap((word) =>
      TEST_PATH.test(word)
        ? [word]
        : (expandGlob(word) ?? []).filter((f) => TEST_PATH.test(f)),
    );
}

/**
 * Problems with the real-stack step `name` among `steps` (a `migrate` job's
 * steps). `env` entries must be present with these values. The job's
 * `DATABASE_URL` is the migrated database, so the step may set it only when
 * `env` expects it.
 */
export function realstackStepProblems(
  steps: readonly WorkflowStep[],
  name: string,
  files: readonly string[],
  env?: Record<string, string>,
): string[] {
  const matches = steps.filter((s) => s.name === name);
  if (matches.length !== 1) {
    return [
      `expected exactly one '${name}' step in migrate, found ${matches.length}`,
    ];
  }
  const step = matches[0]!;
  const problems: string[] = [];
  for (const key of Object.keys(step)) {
    if (!STEP_KEYS.has(key)) {
      problems.push(
        `${name}: sets '${key}', which can change how run executes`,
      );
    }
  }
  if (step["continue-on-error"] !== undefined) {
    problems.push(`${name}: sets continue-on-error, so it is not blocking`);
  }
  if (step.if !== undefined) {
    problems.push(`${name}: has an if, so it can be skipped`);
  }
  const migrated = steps.findIndex((s) => s.name === "Apply migrations");
  if (migrated < 0) problems.push("migrate has no 'Apply migrations' step");
  else {
    const migrateStep = steps[migrated]!;
    if (migrateStep["continue-on-error"] !== undefined) {
      problems.push(
        "Apply migrations: sets continue-on-error, so it is not blocking",
      );
    }
    if (migrateStep.if !== undefined) {
      problems.push("Apply migrations: has an if, so it can be skipped");
    }
    if (
      normalizeRunLine(migrateStep.run) !==
      "node scripts/verify/supabase-migrations.mjs"
    ) {
      problems.push(
        "Apply migrations: does not run 'node scripts/verify/supabase-migrations.mjs'",
      );
    }
    if (steps.indexOf(step) < migrated) {
      problems.push(`${name}: runs before Apply migrations`);
    }
  }
  // Bash runs each unescaped newline as its own command, so a path on a later
  // line without a backslash continuation is not a vitest argument.
  if (normalizeRunLine(step.run).includes("\n")) {
    problems.push(
      `${name}: run spans several lines, so Bash runs more than one command`,
    );
  }
  const words = runWords(step);
  if (words.slice(0, VITEST_RUN.length).join(" ") !== VITEST_RUN.join(" ")) {
    problems.push(`${name}: run does not start with '${VITEST_RUN.join(" ")}'`);
  }
  // Everything after the command must be a plain test path or a glob of them.
  // That rejects any shell operator, comment, quote, variable, redirect or
  // flag, so the step's exit status is vitest's own: nothing on the line can
  // swallow a failure.
  const args = words.slice(VITEST_RUN.length);
  const paths: string[] = [];
  if (args.length === 0) problems.push(`${name}: names no test file`);
  for (const word of args) {
    if (TEST_PATH.test(word)) {
      // vitest treats each path as a filter, so a missing one is skipped silently.
      if (!existsSync(path.resolve(word))) {
        problems.push(`${name}: runs ${word}, which does not exist`);
      }
      paths.push(word);
      continue;
    }
    const matches = expandGlob(word);
    if (matches === undefined) {
      problems.push(`${name}: run carries '${word}', not a plain test path`);
    } else if (matches.length === 0) {
      // Bash then passes the pattern to vitest as text, a filter.
      problems.push(`${name}: run carries '${word}', which matches no file`);
    }
    for (const match of matches ?? []) {
      if (TEST_PATH.test(match)) paths.push(match);
      else {
        problems.push(`${name}: '${word}' matches ${match}, not a test path`);
      }
    }
  }
  for (const file of files) {
    if (!paths.includes(file)) problems.push(`${name}: does not run ${file}`);
  }
  for (const [key, value] of Object.entries(env ?? {})) {
    if (step.env?.[key] !== value) {
      problems.push(
        `${name}: env ${key} is ${JSON.stringify(step.env?.[key])}, expected ${JSON.stringify(value)}`,
      );
    }
  }
  if (
    step.env &&
    "DATABASE_URL" in step.env &&
    !(env && "DATABASE_URL" in env)
  ) {
    problems.push(
      `${name}: sets DATABASE_URL, which redirects tests that read the job's migrated database`,
    );
  }
  return problems;
}

/** Asserts the step in the real `migrate` job and returns it. */
export function expectRealstackStep(
  name: string,
  files: readonly string[],
  env?: Record<string, string>,
): WorkflowStep {
  const steps = migrateSteps();
  expect(realstackStepProblems(steps, name, files, env)).toEqual([]);
  return steps.find((s) => s.name === name)!;
}
