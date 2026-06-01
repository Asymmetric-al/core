import { mkdtempSync, writeFileSync } from "node:fs";
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

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const result = runGuard();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).toBe("");
  }, 30000);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const fakeBinDir = mkdtempSync(path.join(tmpdir(), "fake-bun-"));
    const realBun = process.execPath.includes("/bun")
      ? process.execPath
      : spawnSync("which", ["bun"], { encoding: "utf8" }).stdout.trim();

    writeFileSync(
      path.join(fakeBinDir, "bun"),
      [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        'if [[ "${1:-}" == "--version" ]]; then',
        '  echo "1.3.4"',
        "  exit 0",
        "fi",
        'exec "$REAL_BUN" "$@"',
      ].join("\n"),
      { mode: 0o755 },
    );

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
  }, 30000);
});
