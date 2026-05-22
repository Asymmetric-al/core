import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/ci-integration.yml";

function readWorkflow(): string {
  return readFileSync(WORKFLOW_PATH, "utf8");
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

describe("ci-integration workflow contract", () => {
  const workflow = readWorkflow();

  it("keeps develop merges gated by smoke while full E2E stays informational", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");
    const integrationGate = jobBlock(workflow, "integration-gate");
    const e2eSmokeGate = jobBlock(workflow, "e2e-smoke-gate");
    const e2eGate = jobBlock(workflow, "e2e-gate");

    expect(testE2eSmoke).toContain("needs: smoke");
    expect(testE2eSmoke).toContain('E2E_AUTH_BYPASS: "true"');
    expect(testE2eSmoke).toContain('PLAYWRIGHT_REUSE_EXISTING_SERVER: "1"');
    expect(testE2eSmoke).toContain("run: bun run test:e2e:smoke");
    expect(testE2eSmoke).toContain("playwright-smoke-report");

    expect(testE2e).toContain("continue-on-error:");
    expect(testE2e).toContain("github.base_ref == 'develop'");
    expect(testE2e).toContain("refs/heads/develop");

    expect(integrationGate).toContain("needs: [migrate, smoke, e2e-smoke-gate]");
    expect(integrationGate).not.toContain("test-e2e");

    expect(e2eSmokeGate).toContain("needs: [test-e2e-smoke]");
    expect(e2eSmokeGate).toContain('!= "success"');

    expect(e2eGate).toContain("needs: [test-e2e]");
    expect(e2eGate).toContain("github.base_ref == 'epic'");
    expect(e2eGate).toContain("refs/heads/epic");
    expect(e2eGate).not.toContain("develop");
  });

  it("does not require the broad chromium inventory in CI integration", () => {
    expect(workflow).not.toContain("run: bun run test:e2e --project=chromium");
  });
});
