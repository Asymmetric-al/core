import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/ci-integration.yml";
const PACKAGE_JSON_PATH = "package.json";
const PLAYWRIGHT_CLI = path.join(
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

function readWorkflow(): string {
  return readFileSync(WORKFLOW_PATH, "utf8");
}

function readPackageScripts(): Record<string, string> {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
    scripts?: Record<string, string>;
  };

  return packageJson.scripts ?? {};
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

function listPlaywrightTests(args: string[]): string {
  const result = spawnSync(
    process.execPath,
    [PLAYWRIGHT_CLI, "test", ...args],
    {
      encoding: "utf8",
    },
  );
  const output = `${result.stdout}\n${result.stderr}`;

  expect(output).not.toContain("Error:");
  expect(result.status).toBe(0);

  return output;
}

describe("ci-integration workflow contract", () => {
  const workflow = readWorkflow();
  const scripts = readPackageScripts();

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
    expect(testE2eSmoke).toContain("Start admin app");
    expect(testE2eSmoke).toContain("Wait for admin health endpoint");
    expect(testE2eSmoke).toContain(
      'PLAYWRIGHT_ADMIN_BASE_URL: "http://127.0.0.1:3030"',
    );
    expect(testE2eSmoke).toContain('PLAYWRIGHT_INCLUDE_ADMIN: "1"');
    expect(testE2eSmoke).toContain("playwright-smoke-report");

    expect(testE2e).toContain("continue-on-error:");
    expect(testE2e).toContain("github.base_ref == 'develop'");
    expect(testE2e).toContain("refs/heads/develop");

    expect(integrationGate).toContain(
      "needs: [migrate, smoke, e2e-smoke-gate]",
    );
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

  it("runs the resolved smoke inventory under projects that include each file", () => {
    expect(scripts["test:e2e:smoke"]).toContain("--project=chromium");
    expect(scripts["test:e2e:smoke"]).toContain("--project=chromium-donor");

    const chromiumSmoke = listPlaywrightTests([
      "tests/e2e/demo-auth-preflight.spec.ts",
      "tests/e2e/usability-smoke.spec.ts",
      "tests/e2e/donate.spec.ts",
      "tests/e2e/support-hub.smoke.spec.ts",
      "--project=chromium",
      "--workers=1",
      "--list",
    ]);
    expect(chromiumSmoke).toContain("support-hub.smoke.spec.ts");
    expect(chromiumSmoke).not.toContain("upload-crop.spec.ts");

    const donorSmoke = listPlaywrightTests([
      "tests/e2e/upload-crop.spec.ts",
      "--project=chromium-donor",
      "--workers=1",
      "--list",
    ]);
    expect(donorSmoke).toContain("[chromium-donor]");
    expect(donorSmoke).toContain("upload-crop.spec.ts");
  }, 20_000);
});
