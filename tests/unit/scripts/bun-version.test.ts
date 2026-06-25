import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath =
  process.platform === "win32"
    ? "scripts/verify/bun-version.sh"
    : path.join(repoRoot, "scripts", "verify", "bun-version.sh");

function runGuard(env: NodeJS.ProcessEnv = {}) {
  const childEnv = { ...process.env, ...env };
  if (process.platform === "win32") {
    childEnv.Path = childEnv.PATH ?? childEnv.Path;
    delete childEnv.PATH;
  }
  const args =
    process.platform === "win32" && env.BUN_VERSION_GUARD_BIN
      ? [
          "-lc",
          `BUN_VERSION_GUARD_BIN=${JSON.stringify(
            env.BUN_VERSION_GUARD_BIN,
          )} ${scriptPath}`,
        ]
      : [scriptPath];

  return spawnSync("bash", args, {
    cwd: repoRoot,
    env: childEnv,
    encoding: "utf8",
  });
}

function createFakeBun(version: string): string {
  const fakeBinDir = mkdtempSync(path.join(tmpdir(), "fake-bun-"));
  const script = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    `echo "${version}"`,
  ].join("\n");
  writeFileSync(path.join(fakeBinDir, "bun"), script, { mode: 0o755 });
  writeFileSync(path.join(fakeBinDir, "bun.exe"), script, { mode: 0o755 });

  return fakeBinDir;
}

function toBashPath(filePath: string): string {
  return filePath
    .replace(
      /^([A-Za-z]):\\/,
      (_, drive: string) => `/mnt/${drive.toLowerCase()}/`,
    )
    .replace(/\\/g, "/");
}

function withFakeBun(version: string): NodeJS.ProcessEnv {
  const fakeBinDir = createFakeBun(version);
  const fakeBunPath = toBashPath(path.join(fakeBinDir, "bun"));
  return {
    PATH: `${toBashPath(fakeBinDir)}:${process.env.PATH ?? process.env.Path ?? ""}`,
    BUN_VERSION_GUARD_BIN: fakeBunPath,
    FAKE_BUN_DIR: fakeBinDir,
  };
}

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const env = withFakeBun("1.3.14");
    const result = runGuard(env);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).not.toContain("error:");
    rmSync(env.FAKE_BUN_DIR!, { recursive: true, force: true });
  }, 15_000);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const env = withFakeBun("1.3.4");
    const result = runGuard(env);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("error: Bun version mismatch.");
    expect(result.stderr).toContain(
      "expected (package.json packageManager): bun@1.3.14",
    );
    expect(result.stderr).toContain(
      "installed (bun --version):              bun@1.3.4",
    );
    rmSync(env.FAKE_BUN_DIR!, { recursive: true, force: true });
  }, 15_000);
});
