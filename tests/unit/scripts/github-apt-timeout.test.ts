import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const TIMEOUT_FLAG = "timeout --kill-after=10s";

function readScript(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
}

function jobBlock(workflow: string, jobId: string): string {
  const jobsStart = workflow.indexOf("jobs:\n");
  expect(jobsStart).toBeGreaterThanOrEqual(0);

  const jobsYaml = workflow.slice(jobsStart);
  const headers = [...jobsYaml.matchAll(/^  ([a-z0-9][a-z0-9-]*):/gm)];
  const index = headers.findIndex((match) => match[1] === jobId);
  expect(index).toBeGreaterThanOrEqual(0);

  const blockStart = headers[index].index!;
  const blockEnd =
    index + 1 < headers.length ? headers[index + 1].index! : jobsYaml.length;

  return jobsYaml.slice(blockStart, blockEnd);
}

describe("github apt install scripts bound hung metadata fetches", () => {
  it("wraps apt-get update with GNU timeout and retries once", () => {
    const prepare = readScript("scripts/github/prepare-apt.sh");

    expect(prepare).toContain(TIMEOUT_FLAG);
    expect(prepare).toContain("apt-get update");
    expect(prepare).toContain("retrying once");
    expect(prepare).toContain("APT_GET_TIMEOUT_SECONDS");
  });

  it("wraps canvas and postgres client installs with GNU timeout", () => {
    const canvas = readScript("scripts/github/install-canvas-deps.sh");
    const postgres = readScript("scripts/github/install-postgresql-client.sh");

    expect(canvas).toContain(TIMEOUT_FLAG);
    expect(canvas).toContain("apt-get install");
    expect(postgres).toContain(TIMEOUT_FLAG);
    expect(postgres).toContain("apt-get install");
  });

  it("caps lint and migrate jobs so hung apt cannot occupy a runner for 6 hours", () => {
    const ci = readScript(".github/workflows/ci.yml");
    const integration = readScript(".github/workflows/ci-integration.yml");

    expect(jobBlock(ci, "lint")).toContain("timeout-minutes: 15");
    expect(jobBlock(integration, "migrate")).toContain("timeout-minutes: 15");
  });
});
