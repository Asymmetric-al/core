import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.sh");

function toBashPath(value: string): string {
  const normalized = value.replaceAll("\\", "/");
  return normalized.replace(/^([A-Za-z]):/, (_, drive: string) => {
    return `/mnt/${drive.toLowerCase()}`;
  });
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function runGuard(env: NodeJS.ProcessEnv = {}) {
  const scriptCommand = shellQuote(toBashPath(scriptPath));
  const command =
    typeof env.BUN_BIN === "string"
      ? `BUN_BIN=${shellQuote(env.BUN_BIN)} ${scriptCommand}`
      : scriptCommand;

  let result = spawnSync("bash", ["-lc", command], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
  });

  for (let attempt = 0; attempt < 2 && result.status === 127; attempt += 1) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    result = spawnSync("bash", ["-lc", command], {
      cwd: repoRoot,
      env: process.env,
      encoding: "utf8",
    });
  }

  return result;
}

function createFakeBun(version: string): string {
  const fakeRoot = path.join(repoRoot, ".tmp", "bun-version-test");
  mkdirSync(fakeRoot, { recursive: true });
  const fakeBinDir = mkdtempSync(path.join(fakeRoot, "fake-bun-"));

  const fakeBunPath = path.join(fakeBinDir, "bun");
  writeFileSync(
    fakeBunPath,
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      'if [[ "${1:-}" == "--version" ]]; then',
      `  echo "${version}"`,
      "  exit 0",
      "fi",
      'if [[ "${1:-}" == "-e" ]]; then',
      '  package_json="${@: -1}"',
      '  sed -n \'s/.*"packageManager": "bun@\\([^"]*\\)".*/\\1/p\' "$package_json"',
      "fi",
      "exit 127",
    ].join("\n"),
    { mode: 0o755 },
  );
  spawnSync("bash", ["-lc", `chmod +x ${shellQuote(toBashPath(fakeBunPath))}`]);

  return fakeBinDir;
}

function fakeBunEnv(fakeBinDir: string): NodeJS.ProcessEnv {
  return {
    BUN_BIN: toBashPath(path.join(fakeBinDir, "bun")),
  };
}

const describeBunVersionGuard =
  process.platform === "win32" ? describe.skip : describe;

describeBunVersionGuard("bun version guard", () => {
  it("accepts Bun when it matches packageManager", () => {
    const fakeBinDir = createFakeBun("1.3.14");

    const result = runGuard(fakeBunEnv(fakeBinDir));

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).toBe("");
  }, 30_000);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const fakeBinDir = createFakeBun("1.3.4");

    const result = runGuard(fakeBunEnv(fakeBinDir));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("error: Bun version mismatch.");
    expect(result.stderr).toContain(
      "expected (package.json packageManager): bun@1.3.14",
    );
    expect(result.stderr).toContain(
      "installed (bun --version):              bun@1.3.4",
    );
  }, 30_000);
});
