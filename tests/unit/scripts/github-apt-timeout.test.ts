import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const TIMEOUT_FLAG = "timeout --kill-after=10s";
const POSITIVE_TIMEOUT_PATTERN =
  '[[ "$APT_GET_INSTALL_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]';

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

function expectJobLevelTimeout(block: string, jobId: string, minutes: number) {
  expect(block).toMatch(
    new RegExp(`^  ${jobId}:\\n(?:  .*\\n)*    timeout-minutes: ${minutes}\\n`),
  );
}

function expectTimeoutWrappedInstall(script: string) {
  expect(script).toMatch(
    /sudo timeout --kill-after=10s "\$\{APT_GET_INSTALL_TIMEOUT_SECONDS\}s" \\\n\s+apt-get install -y/,
  );
  expect(script).toMatch(
    /if ! bounded_apt_install; then\n(?:.*\n)*?  bounded_apt_install\nfi/,
  );
}

function expectPositiveInstallTimeoutValidatedBeforeRetry(script: string) {
  const defaultIndex = script.indexOf(
    'APT_GET_INSTALL_TIMEOUT_SECONDS="${APT_GET_INSTALL_TIMEOUT_SECONDS:-600}"',
  );
  const validationIndex = script.indexOf(POSITIVE_TIMEOUT_PATTERN);
  const retryIndex = script.indexOf("if ! bounded_apt_install; then");

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(validationIndex).toBeGreaterThan(defaultIndex);
  expect(retryIndex).toBeGreaterThan(validationIndex);
  expect(script).toContain("must be a positive integer");
}

describe("github apt install scripts bound hung metadata fetches", () => {
  it("wraps apt-get update with GNU timeout and retries once", () => {
    const prepare = readScript("scripts/github/prepare-apt.sh");

    expect(prepare).toContain(TIMEOUT_FLAG);
    expect(prepare).toContain('apt-get "$@"');
    expect(prepare).toContain("bounded_apt_get update");
    expect(prepare).toContain("retrying once");
    expect(prepare).toContain("APT_GET_TIMEOUT_SECONDS");
  });

  it("pins Ubuntu apt away from Azure mirrors before update", () => {
    const prepare = readScript("scripts/github/prepare-apt.sh");

    expect(prepare).toContain("http://archive.ubuntu.com/ubuntu/");
    expect(prepare).toContain("http://security.ubuntu.com/ubuntu/");
    expect(prepare).toContain("azure.archive.ubuntu.com/ubuntu");
    expect(prepare).toContain("mirror+file:/etc/apt/apt-mirrors.txt");
    expect(prepare).toContain('Acquire::http::Timeout "20"');
    expect(prepare).toContain('Acquire::https::Timeout "20"');
    expect(prepare).toContain('Acquire::Retries "2"');
  });

  it("wraps canvas and postgres client installs with a longer GNU timeout and retries once", () => {
    const canvas = readScript("scripts/github/install-canvas-deps.sh");
    const postgres = readScript("scripts/github/install-postgresql-client.sh");

    expectTimeoutWrappedInstall(canvas);
    expectTimeoutWrappedInstall(postgres);
    expect(canvas).toContain("APT_GET_INSTALL_TIMEOUT_SECONDS");
    expect(canvas).toContain(":-600");
    expect(canvas).toContain("retrying once");
    expect(postgres).toContain("APT_GET_INSTALL_TIMEOUT_SECONDS");
    expect(postgres).toContain(":-600");
    expect(postgres).toContain("retrying once");
  });

  it("rejects non-positive install timeouts before retrying apt-get install", () => {
    const canvas = readScript("scripts/github/install-canvas-deps.sh");
    const postgres = readScript("scripts/github/install-postgresql-client.sh");

    expectPositiveInstallTimeoutValidatedBeforeRetry(canvas);
    expectPositiveInstallTimeoutValidatedBeforeRetry(postgres);
  });

  it("caps lint and migrate jobs so hung apt cannot occupy a runner for 6 hours", () => {
    const ci = readScript(".github/workflows/ci.yml");
    const integration = readScript(".github/workflows/ci-integration.yml");

    expectJobLevelTimeout(jobBlock(ci, "lint"), "lint", 25);
    expectJobLevelTimeout(jobBlock(integration, "migrate"), "migrate", 50);
  });
});
