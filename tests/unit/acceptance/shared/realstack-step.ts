/**
 * Semantic check for a real-stack verification step in ci-integration.yml's
 * required `migrate` job (#2706). It replaces exact step indexes, exact `run:`
 * strings and relative-order pins: the step exists once, cannot be skipped or
 * made non-blocking, runs after the database is migrated, and runs the named
 * files with vitest. Other files on the same `run:` line and the step's
 * position among sibling verification steps are not asserted.
 */
import { expect } from "vitest";

import {
  loadWorkflowDocument,
  workflowJobs,
  type WorkflowStep,
} from "../../helpers/workflow-yaml";

export const CII = ".github/workflows/ci-integration.yml";

export function migrateSteps(): WorkflowStep[] {
  return workflowJobs(loadWorkflowDocument(CII), CII).migrate?.steps ?? [];
}

/** Asserts the step and returns it. `env` entries must be present with these values. */
export function expectRealstackStep(
  name: string,
  files: readonly string[],
  env?: Record<string, string>,
): WorkflowStep {
  const steps = migrateSteps();
  const matches = steps.filter((s) => s.name === name);
  expect(matches, `exactly one '${name}' step in migrate`).toHaveLength(1);
  const step = matches[0]!;
  expect(step["continue-on-error"], `${name}: blocking`).toBeUndefined();
  expect(step.if, `${name}: never skipped`).toBeUndefined();
  const migrated = steps.findIndex((s) => s.name === "Apply migrations");
  expect(migrated, "migrate applies migrations").toBeGreaterThanOrEqual(0);
  expect(
    steps.indexOf(step),
    `${name}: after Apply migrations`,
  ).toBeGreaterThan(migrated);
  const words = String(step.run ?? "")
    .trim()
    .split(/\s+/);
  expect(words.slice(0, 4), `${name}: runs vitest`).toEqual([
    "bun",
    "x",
    "vitest",
    "run",
  ]);
  for (const file of files)
    expect(words, `${name} runs ${file}`).toContain(file);
  if (env) expect(step.env ?? {}).toMatchObject(env);
  return step;
}
