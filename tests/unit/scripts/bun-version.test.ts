import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.mjs");

function runGuard(env: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const result = runGuard();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).toBe("");
  });

  it("fails fast when the Bun binary does not match packageManager", () => {
    const fakeBinDir = mkdtempSync(path.join(tmpdir(), "fake-bun-"));
    const realBunResult = spawnSync("bun", ["--version"], {
      encoding: "utf8",
    });

    expect(realBunResult.status).toBe(0);

    if (process.platform === "win32") {
      writeFileSync(
        path.join(fakeBinDir, "bun.cmd"),
        [
          "@echo off",
          'if "%1"=="--version" (',
          "  echo 1.3.4",
          "  exit /b 0",
          ")",
          "exit /b 1",
        ].join("\r\n"),
      );
    } else {
      writeFileSync(
        path.join(fakeBinDir, "bun"),
        [
          "#!/usr/bin/env bash",
          "set -euo pipefail",
          'if [[ "${1:-}" == "--version" ]]; then',
          '  echo "1.3.4"',
          "  exit 0",
          "fi",
          "exit 1",
        ].join("\n"),
        { mode: 0o755 },
      );
    }

    const result = runGuard({
      BUN_BINARY: path.join(
        fakeBinDir,
        process.platform === "win32" ? "bun.cmd" : "bun",
      ),
      PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH ?? ""}`,
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
