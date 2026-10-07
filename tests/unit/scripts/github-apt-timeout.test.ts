import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

const TIMEOUT_FLAG = "timeout --kill-after=10s";
const POSITIVE_INSTALL_TIMEOUT_PATTERN =
  '[[ "$APT_GET_INSTALL_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]';
const POSITIVE_UPDATE_TIMEOUT_PATTERN =
  '[[ "$APT_GET_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]';

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
  const validationIndex = script.indexOf(POSITIVE_INSTALL_TIMEOUT_PATTERN);
  const retryIndex = script.indexOf("if ! bounded_apt_install; then");

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(validationIndex).toBeGreaterThan(defaultIndex);
  expect(retryIndex).toBeGreaterThan(validationIndex);
  expect(script).toContain("must be a positive integer");
}

function expectPositiveUpdateTimeoutValidatedBeforeRetry(script: string) {
  const defaultIndex = script.indexOf(
    'APT_GET_TIMEOUT_SECONDS="${APT_GET_TIMEOUT_SECONDS:-180}"',
  );
  const validationIndex = script.indexOf(POSITIVE_UPDATE_TIMEOUT_PATTERN);
  const retryIndex = script.indexOf("if ! bounded_apt_get update; then");

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(validationIndex).toBeGreaterThan(defaultIndex);
  expect(retryIndex).toBeGreaterThan(validationIndex);
  expect(script).toContain(
    "APT_GET_TIMEOUT_SECONDS must be a positive integer",
  );
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

  it("pins Ubuntu apt to HTTPS away from Azure mirrors before update", () => {
    const prepare = readScript("scripts/github/prepare-apt.sh");

    expect(prepare).toContain("https://archive.ubuntu.com/ubuntu/");
    expect(prepare).toContain("https://security.ubuntu.com/ubuntu/");
    expect(prepare).toContain("mirror+file:/etc/apt/apt-mirrors.txt");
    expect(prepare).toContain('Acquire::http::Timeout "20"');
    expect(prepare).toContain('Acquire::https::Timeout "20"');
    expect(prepare).toContain('Acquire::Retries "2"');
  });

  // This helper runs only on Ubuntu CI; its shell behavior needs GNU sed.
  it.skipIf(process.platform !== "linux")(
    "normalizes Ubuntu list and deb822 sources while retaining signatures and unrelated feeds",
    () => {
      const fixtureRoot = mkdtempSync(path.join(tmpdir(), "core-github-apt-"));
      const aptRoot = path.join(fixtureRoot, "apt");
      const sourcesRoot = path.join(aptRoot, "sources.list.d");
      const commandLog = path.join(fixtureRoot, "commands.log");
      const keyring = "/usr/share/keyrings/ubuntu-archive-keyring.gpg";

      try {
        mkdirSync(sourcesRoot, { recursive: true });
        mkdirSync(path.join(aptRoot, "apt.conf.d"));
        writeFileSync(path.join(aptRoot, "apt-mirrors.txt"), "old mirror\n");
        writeFileSync(
          path.join(aptRoot, "sources.list"),
          [
            "deb http://archive.ubuntu.com/ubuntu noble main",
            "deb-src http://security.ubuntu.com/ubuntu noble-security main",
            "deb https://azure.archive.ubuntu.com/ubuntu noble-updates main",
            "deb http://example.org/ubuntu noble main",
            "deb https://example.org/ubuntu noble main",
            "",
          ].join("\n"),
        );
        writeFileSync(
          path.join(sourcesRoot, "ubuntu.list"),
          "deb http://azure.archive.ubuntu.com/ubuntu noble-backports main\n",
        );
        writeFileSync(
          path.join(sourcesRoot, "ubuntu.sources"),
          `Types: deb\nURIs: mirror+file:${aptRoot}/apt-mirrors.txt http://security.ubuntu.com/ubuntu/\nSuites: noble noble-security\nComponents: main\nSigned-By: ${keyring}\n`,
        );
        writeFileSync(
          path.join(sourcesRoot, "microsoft.sources"),
          "Types: deb\nURIs: https://packages.microsoft.com/ubuntu\n",
        );

        const prepare = readScript("scripts/github/prepare-apt.sh");
        execFileSync(
          "bash",
          [
            "-c",
            // Run the real helper against temporary apt files. Intercept only
            // the privileged boundary; no apt/network operation is executed.
            `sudo() { if [[ "$1" == timeout ]]; then printf '%s\\n' "$*" >> "$APT_TEST_COMMAND_LOG"; else "$@"; fi; }\n${prepare.replaceAll("/etc/apt", aptRoot)}`,
          ],
          {
            env: {
              ...process.env,
              APT_GET_TIMEOUT_SECONDS: "9",
              APT_TEST_COMMAND_LOG: commandLog,
            },
            timeout: 10_000,
          },
        );

        expect(readFileSync(path.join(aptRoot, "sources.list"), "utf8")).toBe(
          [
            "deb https://archive.ubuntu.com/ubuntu noble main",
            "deb-src https://security.ubuntu.com/ubuntu noble-security main",
            "deb https://archive.ubuntu.com/ubuntu noble-updates main",
            "deb http://example.org/ubuntu noble main",
            "deb https://example.org/ubuntu noble main",
            "",
          ].join("\n"),
        );
        expect(
          readFileSync(path.join(sourcesRoot, "ubuntu.list"), "utf8"),
        ).toBe("deb https://archive.ubuntu.com/ubuntu noble-backports main\n");
        expect(
          readFileSync(path.join(sourcesRoot, "ubuntu.sources"), "utf8"),
        ).toBe(
          `Types: deb\nURIs: https://archive.ubuntu.com/ubuntu https://security.ubuntu.com/ubuntu/\nSuites: noble noble-security\nComponents: main\nSigned-By: ${keyring}\n`,
        );
        expect(
          readFileSync(path.join(aptRoot, "apt-mirrors.txt"), "utf8"),
        ).toBe(
          "https://archive.ubuntu.com/ubuntu/\nhttps://security.ubuntu.com/ubuntu/\n",
        );
        expect(existsSync(path.join(sourcesRoot, "microsoft.sources"))).toBe(
          false,
        );
        expect(
          existsSync(
            path.join(sourcesRoot, "microsoft.sources.disabled-by-core-ci"),
          ),
        ).toBe(true);
        expect(readFileSync(commandLog, "utf8")).toBe(
          "timeout --kill-after=10s 9s apt-get update\n",
        );
      } finally {
        rmSync(fixtureRoot, { recursive: true, force: true });
      }
    },
  );

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

  it("rejects non-positive update timeouts before retrying apt-get update", () => {
    expectPositiveUpdateTimeoutValidatedBeforeRetry(
      readScript("scripts/github/prepare-apt.sh"),
    );
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
