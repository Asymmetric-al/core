import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = "scripts/verify/bun-version.sh";
const bashGuardTimeout = process.platform === "win32" ? 15_000 : 5_000;
const describeBashGuard =
  process.platform === "win32" ? describe.skip : describe;

function createFakeBunDir({
  expectedVersion,
  installedVersion,
}: {
  expectedVersion: string;
  installedVersion: string;
}) {
  const fakeBinDir = mkdtempSync(path.join(repoRoot, ".tmp-bun-version-"));

  writeFileSync(
    path.join(fakeBinDir, "bun"),
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      'if [[ "${1:-}" == "--version" ]]; then',
      `  echo "${installedVersion}"`,
      "  exit 0",
      "fi",
      'if [[ "${1:-}" == "-e" ]]; then',
      `  echo "${expectedVersion}"`,
      "  exit 0",
      "fi",
      'echo "unexpected bun invocation: $*" >&2',
      "exit 127",
    ].join("\n"),
    { mode: 0o755 },
  );

  return fakeBinDir;
}

function runGuard({
  expectedVersion = "1.3.14",
  installedVersion = "1.3.14",
}: {
  expectedVersion?: string;
  installedVersion?: string;
} = {}) {
  const fakeBinDir = createFakeBunDir({ expectedVersion, installedVersion });

  try {
    return spawnSync(
      "bash",
      [
        "-lc",
        `chmod +x "./${path.basename(fakeBinDir)}/bun" && PATH="./${path.basename(fakeBinDir)}:$PATH" bash ${scriptPath}`,
      ],
      {
        cwd: repoRoot,
        env: process.env,
        encoding: "utf8",
      },
    );
  } finally {
    rmSync(fakeBinDir, { recursive: true, force: true });
  }
}

describeBashGuard("bun version guard", () => {
  it(
    "accepts a Bun binary when it matches packageManager",
    () => {
      const result = runGuard();

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
      expect(result.stderr).not.toContain("error:");
    },
    bashGuardTimeout,
  );

  it("fails fast when the Bun binary does not match packageManager", () => {
    const result = runGuard({
      installedVersion: "1.3.4",
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
