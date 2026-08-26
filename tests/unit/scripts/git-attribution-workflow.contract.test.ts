import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/ci.yml";

function jobBlock(workflow: string, jobName: string): string {
  const jobStart = workflow.indexOf(`\n  ${jobName}:\n`);
  expect(jobStart).toBeGreaterThanOrEqual(0);

  const afterJob = workflow.slice(jobStart + 1);
  const nextJobOffset = afterJob.slice(1).search(/\n  [a-zA-Z0-9_-]+:\n/);

  return nextJobOffset === -1 ? afterJob : afterJob.slice(0, nextJobOffset + 1);
}

function stepContaining(job: string, command: string): string {
  const commandIndex = job.indexOf(command);
  expect(commandIndex).toBeGreaterThanOrEqual(0);

  const stepStart = job.lastIndexOf("\n      - ", commandIndex);
  const stepEnd = job.indexOf("\n      - ", commandIndex);

  expect(stepStart).toBeGreaterThanOrEqual(0);
  return job.slice(stepStart, stepEnd === -1 ? undefined : stepEnd);
}

describe("CI Git attribution contract", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");
  const formatJob = jobBlock(workflow, "format");
  const ciGateJob = jobBlock(workflow, "ci-gate");

  it("checks out full history before attribution verification", () => {
    expect(formatJob).toContain("fetch-depth: 0");

    const attributionIndex = formatJob.indexOf(
      "run: bun run verify:git-attribution -- --ci",
    );
    const formatIndex = formatJob.indexOf("run: bun run format:check");

    expect(attributionIndex).toBeGreaterThanOrEqual(0);
    expect(attributionIndex).toBeLessThan(formatIndex);
  });

  it("passes bounded event and repository metadata only to the CI attribution step", () => {
    const attributionStep = stepContaining(
      formatJob,
      "run: bun run verify:git-attribution -- --ci",
    );

    expect(attributionStep).toContain("GH_TOKEN: ${{ github.token }}");
    expect(attributionStep).toContain(
      "ASYM_GITHUB_EVENT_NAME: ${{ github.event_name }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.before }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_HEAD_REPOSITORY: ${{ github.event.pull_request.head.repo.full_name || github.repository }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_REPOSITORY: ${{ github.repository }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_REF_NAME: ${{ github.ref_name }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_REF_TYPE: ${{ github.ref_type }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_EVENT_ACTOR_LOGIN: ${{ github.actor }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_EVENT_ACTOR_ID: ${{ github.actor_id }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_EVENT_SENDER_LOGIN: ${{ github.event.sender.login || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_EVENT_SENDER_ID: ${{ github.event.sender.id || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_PULL_REQUEST_AUTHOR_LOGIN: ${{ github.event.pull_request.user.login || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_PULL_REQUEST_AUTHOR_ID: ${{ github.event.pull_request.user.id || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_HEAD_OWNER_LOGIN: ${{ github.event.pull_request.head.repo.owner.login || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_HEAD_OWNER_ID: ${{ github.event.pull_request.head.repo.owner.id || '' }}",
    );
    expect(attributionStep).toContain(
      "ASYM_GITHUB_TRIGGERING_ACTOR_LOGIN: ${{ github.triggering_actor }}",
    );
    expect(attributionStep).not.toContain("toJSON(github)");
    expect(attributionStep).not.toContain("secrets.");

    const keys = [...attributionStep.matchAll(/^\s{10}([A-Z0-9_]+):/gm)].map(
      ([, key]) => key,
    );
    expect(keys).toEqual([
      "GH_TOKEN",
      "ASYM_GITHUB_EVENT_NAME",
      "ASYM_GITHUB_BASE_SHA",
      "ASYM_GITHUB_HEAD_SHA",
      "ASYM_GITHUB_HEAD_REPOSITORY",
      "ASYM_GITHUB_REPOSITORY",
      "ASYM_GITHUB_REF_NAME",
      "ASYM_GITHUB_REF_TYPE",
      "ASYM_GITHUB_EVENT_ACTOR_LOGIN",
      "ASYM_GITHUB_EVENT_ACTOR_ID",
      "ASYM_GITHUB_EVENT_SENDER_LOGIN",
      "ASYM_GITHUB_EVENT_SENDER_ID",
      "ASYM_GITHUB_PULL_REQUEST_AUTHOR_LOGIN",
      "ASYM_GITHUB_PULL_REQUEST_AUTHOR_ID",
      "ASYM_GITHUB_HEAD_OWNER_LOGIN",
      "ASYM_GITHUB_HEAD_OWNER_ID",
      "ASYM_GITHUB_TRIGGERING_ACTOR_LOGIN",
    ]);
  });

  it("makes attribution a prerequisite of the protected ci-gate", () => {
    expect(ciGateJob).toContain(
      "needs: [format, lint, typecheck, build, test-unit]",
    );
  });
});
