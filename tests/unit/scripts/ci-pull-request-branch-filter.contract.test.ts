import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATHS = [
  ".github/workflows/ci.yml",
  ".github/workflows/ci-integration.yml",
  ".github/workflows/shadscan.yml",
] as const;

function onBlock(workflow: string): string {
  const onStart = workflow.indexOf("\non:\n");
  expect(onStart).toBeGreaterThanOrEqual(0);

  const afterOn = onStart === 0 ? 0 : onStart;
  const permissionsStart = workflow.indexOf("\npermissions:", afterOn);
  const jobsStart = workflow.indexOf("\njobs:", afterOn);
  const blockEnd = [permissionsStart, jobsStart]
    .filter((index) => index >= 0)
    .toSorted((left, right) => left - right)[0];

  expect(blockEnd).toBeGreaterThan(afterOn);
  return workflow.slice(afterOn, blockEnd);
}

function eventBlock(workflow: string, eventName: string): string {
  const triggerBlock = onBlock(workflow);
  const eventStart = triggerBlock.search(
    new RegExp(`(?:^|\\n)  ${eventName}:\\n`),
  );
  expect(eventStart).toBeGreaterThanOrEqual(0);

  const fromEvent = triggerBlock.slice(eventStart);
  const nextEvent = fromEvent.slice(1).search(/\n  [a-z_]+:\n/);
  return nextEvent === -1 ? fromEvent : fromEvent.slice(0, nextEvent + 1);
}

describe("CI pull_request branch filter", () => {
  it("runs stacked Cursor Cloud PRs whose base is a cursor/* branch", () => {
    for (const workflowPath of WORKFLOW_PATHS) {
      const workflow = readFileSync(workflowPath, "utf8");
      const pullRequest = eventBlock(workflow, "pull_request");

      expect(pullRequest, workflowPath).toContain("develop");
      expect(pullRequest, workflowPath).toContain("production");
      expect(pullRequest, workflowPath).toContain("cursor/**");
    }
  });

  it("does not run full CI on every cursor/* push without a pull request", () => {
    for (const workflowPath of WORKFLOW_PATHS) {
      const workflow = readFileSync(workflowPath, "utf8");
      const push = eventBlock(workflow, "push");

      expect(push, workflowPath).toContain("develop");
      expect(push, workflowPath).not.toContain("cursor/**");
    }
  });
});
