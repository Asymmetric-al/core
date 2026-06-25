import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.sh");

function toBashPath(filePath: string): string {
  if (process.platform !== "win32") {
    return filePath;
  }

  return filePath
    .replaceAll("\\", "/")
    .replace(
      /^([A-Za-z]):/,
      (_, drive: string) => `/mnt/${drive.toLowerCase()}`,
    );
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function runGuard(installedVersion: string) {
  const assignments = [
    "BUN_VERSION_GUARD_BUN=true",
    "BUN_VERSION_GUARD_EXPECTED_VERSION=1.3.14",
    `BUN_VERSION_GUARD_INSTALLED_VERSION=${shellQuote(installedVersion)}`,
  ].join(" ");

  return spawnSync(
    "bash",
    ["-lc", `${assignments} ${shellQuote(toBashPath(scriptPath))}`],
    {
      cwd: repoRoot,
      env: { ...process.env },
      encoding: "utf8",
    },
  );
}

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const result = runGuard("1.3.14");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).not.toContain("error:");
  }, 30_000);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const result = runGuard("1.3.4");

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
