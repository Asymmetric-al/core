import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.sh");

function runGuard(env: NodeJS.ProcessEnv = {}) {
  return spawnSync("bash", [scriptPath], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

function getExpectedBunVersion() {
  const packageJson = JSON.parse(
    readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  ) as { packageManager?: string };

  return packageJson.packageManager?.replace(/^bun@/, "") ?? "";
}

function getInstalledBunVersion() {
  return spawnSync("bun", ["--version"], {
    encoding: "utf8",
  }).stdout.trim();
}

function isWindowsBashUnavailable(result: ReturnType<typeof runGuard>) {
  return (
    process.platform === "win32" &&
    result.status !== 0 &&
    result.stderr.includes("execvpe(/bin/bash) failed")
  );
}

function resolveRealBun() {
  const execBasename = path.basename(process.execPath).toLowerCase();
  if (execBasename === "bun" || execBasename === "bun.exe") {
    return process.execPath;
  }

  const lookup = spawnSync(
    process.platform === "win32" ? "where.exe" : "which",
    ["bun"],
    {
      encoding: "utf8",
    },
  );
  const candidate = lookup.stdout
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!candidate) {
    throw new Error("Could not locate the real bun binary for this test.");
  }

  return candidate;
}

function writeFakeBun(binDir: string, version: string) {
  writeFileSync(
    path.join(binDir, "bun"),
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      'if [[ "${1:-}" == "--version" ]]; then',
      `  echo "${version}"`,
      "  exit 0",
      "fi",
      'exec "$REAL_BUN" "$@"',
    ].join("\n"),
    { mode: 0o755 },
  );
}

describe("bun version guard", () => {
  it("reports whether installed Bun matches packageManager", () => {
    const expected = getExpectedBunVersion();
    const installed = getInstalledBunVersion();
    const result = runGuard();

    if (isWindowsBashUnavailable(result)) {
      expect(result.stderr).toContain("execvpe(/bin/bash) failed");
      return;
    }

    if (installed !== expected) {
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("error: Bun version mismatch.");
      expect(result.stderr).toContain(
        `expected (package.json packageManager): bun@${expected}`,
      );
      expect(result.stderr).toContain(
        `installed (bun --version):              bun@${installed}`,
      );
      return;
    }

    expect(installed).toBe("1.3.14");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).toBe("");
  });

  it("fails fast when the Bun binary does not match packageManager", () => {
    if (process.platform === "win32") {
      const expected = getExpectedBunVersion();
      const installed = getInstalledBunVersion();
      const result = runGuard();

      if (isWindowsBashUnavailable(result)) {
        expect(result.stderr).toContain("execvpe(/bin/bash) failed");
        return;
      }

      if (installed === expected) {
        expect(result.status).toBe(0);
        return;
      }

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("error: Bun version mismatch.");
      expect(result.stderr).toContain(
        `expected (package.json packageManager): bun@${expected}`,
      );
      expect(result.stderr).toContain(
        `installed (bun --version):              bun@${installed}`,
      );
      return;
    }

    const fakeBinDir = mkdtempSync(path.join(tmpdir(), "fake-bun-"));
    const realBun = resolveRealBun();
    writeFakeBun(fakeBinDir, "1.3.4");

    const result = runGuard({
      PATH: `${fakeBinDir}:${process.env.PATH ?? ""}`,
      REAL_BUN: realBun,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("error: Bun version mismatch.");
    expect(result.stderr).toContain(
      "expected (package.json packageManager): bun@1.3.14",
    );
    expect(result.stderr).toContain(
      "installed (bun --version):              bun@1.3.4",
    );
  });
});
