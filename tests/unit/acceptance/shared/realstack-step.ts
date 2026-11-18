/**
 * Semantic check for a real-stack verification step in ci-integration.yml's
 * required `migrate` job (#2706). It replaces exact step indexes, exact `run:`
 * strings and relative-order pins: the step exists once, cannot be skipped or
 * made non-blocking, runs after the database is migrated, and runs the named
 * files with vitest, with nothing but plain test paths after the command.
 * Which other files share the `run:` line and the step's position among
 * sibling verification steps are not asserted.
 */
import { existsSync } from "node:fs";
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

export function migrateJob(): WorkflowJob | undefined {
  return workflowJobs(loadWorkflowDocument(CII), CII).migrate;
}

export function migrateSteps(): WorkflowStep[] {
  return migrateJob()?.steps ?? [];
}

/** The whitespace-separated words of a step's `run:` text. */
export function runWords(step: WorkflowStep): string[] {
  return String(step.run ?? "")
    .trim()
    .split(/\s+/);
}

/**
 * Problems with the real-stack step `name` among `steps` (a `migrate` job's
 * steps). `env` entries must be present with these values.
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
  if (step["continue-on-error"] !== undefined) {
    problems.push(`${name}: sets continue-on-error, so it is not blocking`);
  }
  if (step.if !== undefined) {
    problems.push(`${name}: has an if, so it can be skipped`);
  }
  const migrated = steps.findIndex((s) => s.name === "Apply migrations");
  if (migrated < 0) problems.push("migrate has no 'Apply migrations' step");
  else if (steps.indexOf(step) < migrated) {
    problems.push(`${name}: runs before Apply migrations`);
  }
  const words = runWords(step);
  if (words.slice(0, VITEST_RUN.length).join(" ") !== VITEST_RUN.join(" ")) {
    problems.push(`${name}: run does not start with '${VITEST_RUN.join(" ")}'`);
  }
  // Everything after the command must be a plain test path. That rejects any
  // shell operator, comment, quote, variable, redirect or flag, so the step's
  // exit status is vitest's own: nothing on the line can swallow a failure.
  const paths = words.slice(VITEST_RUN.length);
  if (paths.length === 0) problems.push(`${name}: names no test file`);
  for (const word of paths) {
    if (!TEST_PATH.test(word)) {
      problems.push(`${name}: run carries '${word}', not a plain test path`);
    } else if (!existsSync(path.resolve(word))) {
      // vitest treats each path as a filter, so a missing one is skipped silently.
      problems.push(`${name}: runs ${word}, which does not exist`);
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
