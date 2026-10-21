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

function stepNames(jobYaml: string): string[] {
  return [...jobYaml.matchAll(/^      - name: (.+)$/gm)].map(
    (match) => match[1],
  );
}

function listPlaywrightTests(args: string[]): string {
  const result = spawnSync(
    process.execPath,
    [PLAYWRIGHT_CLI, "test", ...args, "--reporter=list"],
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

  it("runs the donation fee replay SQL proof after seeding in the required migration job", () => {
    const migrate = jobBlock(workflow, "migrate");
    expect(migrate).toContain(
      "tests/integration/supabase/donation-fee-replay-verification.sql",
    );
    expect(migrate.indexOf("Apply demo seed")).toBeLessThan(
      migrate.indexOf("Verify donation fee replay"),
    );
  });

  it("keeps develop merges gated by smoke while full E2E is continue-on-error on develop", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");
    const integrationGate = jobBlock(workflow, "integration-gate");
    const e2eSmokeGate = jobBlock(workflow, "e2e-smoke-gate");
    const e2eGate = jobBlock(workflow, "e2e-gate");

    expect(testE2eSmoke).toContain("needs: smoke");
    expect(testE2e).toContain("needs: [smoke, test-e2e-smoke]");
    expect(testE2e).toContain("fetch-depth: 0");
    expect(testE2eSmoke).toContain('E2E_AUTH_BYPASS: "true"');
    expect(testE2eSmoke).toContain('PLAYWRIGHT_REUSE_EXISTING_SERVER: "1"');
    expect(testE2eSmoke).toContain("run: bun run test:e2e:smoke");
    expect(testE2eSmoke).toContain('PLAYWRIGHT_INCLUDE_ADMIN: "1"');
    expect(testE2eSmoke).toContain("playwright-smoke-report");
    expect(testE2eSmoke).toContain("e2e-dev-server.sh");
    expect(testE2e).toContain("e2e-dev-server.sh");

    const smokeSteps = stepNames(testE2eSmoke);
    expect(smokeSteps).toContain("Start donor app");
    expect(smokeSteps).toContain("Start admin app");
    expect(smokeSteps).not.toContain("Build donor app (production)");

    const e2eSteps = stepNames(testE2e);
    expect(e2eSteps).toContain("Start donor app");
    expect(e2eSteps).toContain("Start admin app");
    expect(e2eSteps).toContain("Start missionary app");
    expect(e2eSteps).not.toContain(
      "Build production apps for e2e (sequential)",
    );
    expect(e2eSteps).not.toContain("Build donor app (production)");

    expect(testE2e).not.toContain("e2e-production-server.sh");
    expect(testE2e).not.toContain("build-all");
    expect(testE2e).not.toContain("ASYM_E2E_SERVER_MODE");
    expect(testE2e).not.toContain("next start");

    expect(testE2e).toContain(
      "continue-on-error: ${{ (github.event_name == 'pull_request' && github.base_ref == 'develop') || (github.event_name == 'push' && github.ref == 'refs/heads/develop') }}",
    );
    expect(testE2e).toContain(
      "Use placeholder Supabase for non-production E2E",
    );
    expect(testE2e).toContain("github.base_ref != 'production'");
    expect(testE2e).toContain(
      "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co",
    );
    expect(testE2e).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key");
    expect(testE2e).toContain("ASYM_E2E_REQUIRE_HERMETIC_SUPABASE=1");
    expect(testE2eSmoke).toContain('ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1"');

    expect(integrationGate).toContain(
      "needs: [migrate, smoke, e2e-smoke-gate]",
    );
    expect(integrationGate).not.toContain("test-e2e");

    expect(e2eSmokeGate).toContain("needs: [test-e2e-smoke]");
    expect(e2eSmokeGate).toContain('!= "success"');

    expect(e2eGate).toContain("needs: [test-e2e, instant-nav]");
    expect(e2eGate).toContain("needs['instant-nav'].result");
    expect(e2eGate).toContain("github.base_ref == 'production'");
    expect(e2eGate).toContain("refs/heads/production");
    expect(e2eGate).not.toContain("develop");
  });

  it("keeps auth, production, and CMS run artifacts distinct with retry diagnostics", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    expect(testE2e).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/auth-preflight"',
    );
    expect(testE2e).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/production-gate"',
    );
    expect(testE2e).toContain('PLAYWRIGHT_REPORT_DIR: "playwright-report/cms"');
    const upload = testE2e.slice(
      testE2e.indexOf("name: Upload artifact on failure"),
    );
    expect(upload).toContain("playwright-report/");
    expect(upload).toContain("test-results/");
    expect(upload).toContain("if: failure()");
    expect(testE2e).toContain("timeout-minutes: 10");
  });

  it("keeps instant navigation deterministic and production-gated", () => {
    const instantNav = jobBlock(workflow, "instant-nav");
    const e2eGate = jobBlock(workflow, "e2e-gate");

    expect(instantNav).toContain("--retries=0");
    expect(instantNav).toContain("bun run build:donor");
    expect(instantNav).toContain("apps/donor start");
    expect(e2eGate).toContain("needs: [test-e2e, instant-nav]");
    expect(e2eGate).toContain("needs['instant-nav'].result");
  });

  it("does not require the broad chromium inventory in CI integration", () => {
    expect(workflow).not.toContain("run: bun run test:e2e --project=chromium");
  });

  it("installs Playwright before dev smoke servers and proves demo auth", () => {
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");
    const installAt = testE2eSmoke.indexOf("name: Install Playwright Chromium");
    const startDonorAt = testE2eSmoke.indexOf("name: Start donor app");
    const waitDonorAt = testE2eSmoke.indexOf(
      "name: Wait for donor health endpoint",
    );
    const startAdminAt = testE2eSmoke.indexOf("name: Start admin app");

    expect(installAt).toBeGreaterThanOrEqual(0);
    expect(startDonorAt).toBeGreaterThan(installAt);
    expect(waitDonorAt).toBeGreaterThan(startDonorAt);
    expect(startAdminAt).toBeGreaterThan(waitDonorAt);
    expect(testE2eSmoke).toContain("/api/auth/demo-account");
  });

  it("keeps the blocking smoke job on the shared Bun install contract", () => {
    const smoke = jobBlock(workflow, "smoke");
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");

    expect(smoke).toContain("e2e-dev-server.sh donor start 3005");
    expect(smoke).not.toContain("Build donor app (production)");
    expect(testE2eSmoke).toContain("bun-version: ${{ env.BUN_VERSION }}");
    expect(testE2eSmoke).toContain("run: bun ci --no-cache --backend=copyfile");
    expect(testE2eSmoke).not.toContain('bun-version: "1.3.4"');
    expect(testE2eSmoke).not.toContain("bun install --frozen-lockfile");
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
  }, 60_000);

  it("can collect the admin table pages smoke spec for CMS E2E", () => {
    const listed = listPlaywrightTests([
      "tests/e2e/admin-table-pages-smoke.spec.ts",
      "--project=chromium",
      "--workers=1",
      "--list",
    ]);
    expect(listed).toContain("admin-table-pages-smoke.spec.ts");
    expect(listed).toContain("CRM Notes");
    expect(listed).not.toContain("CRM Projections");
    expect(listed).not.toContain("Cannot find module");
  }, 60_000);
});
