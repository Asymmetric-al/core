import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATHS = [
  ".github/workflows/ci.yml",
  ".github/workflows/ci-integration.yml",
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
  it("reuses the integrity audit for Shadscan reporting without a second PR scan", () => {
    const reporter = readFileSync(".github/workflows/shadscan.yml", "utf8");
    expect(eventBlock(reporter, "workflow_call").trim()).toBe("workflow_call:");
    expect(onBlock(reporter)).not.toContain("pull_request:");
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).toContain("uses: ./.github/workflows/shadscan.yml");
  });
  it("runs PRs against every base branch, including automation stacks", () => {
    for (const workflowPath of WORKFLOW_PATHS) {
      const workflow = readFileSync(workflowPath, "utf8");
      const pullRequest = eventBlock(workflow, "pull_request");

      expect(pullRequest.trim(), workflowPath).toBe("pull_request:");
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
