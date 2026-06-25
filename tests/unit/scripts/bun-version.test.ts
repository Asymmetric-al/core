import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.sh");
const bashSystemPath =
  "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";

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

function resolveBunPath(): string {
  const execPathBase = path.basename(process.execPath).toLowerCase();
  if (execPathBase === "bun" || execPathBase === "bun.exe") {
    return process.execPath;
  }

  const command =
    process.platform === "win32" ? "C:\\Windows\\System32\\where.exe" : "which";
  const result = spawnSync(command, ["bun"], { encoding: "utf8" });
  const firstMatch = result.stdout?.split(/\r?\n/).find(Boolean);

  if (!firstMatch) {
    throw new Error("Unable to resolve bun on PATH for bun-version test");
  }

  return firstMatch.trim();
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function runGuard(env: NodeJS.ProcessEnv = {}) {
  if (env.BUN_VERSION_GUARD_BUN || env.BUN_VERSION_GUARD_INSTALLED_VERSION) {
    const assignments = [
      env.BUN_VERSION_GUARD_BUN
        ? `BUN_VERSION_GUARD_BUN=${shellQuote(env.BUN_VERSION_GUARD_BUN)}`
        : "",
      env.BUN_VERSION_GUARD_INSTALLED_VERSION
        ? `BUN_VERSION_GUARD_INSTALLED_VERSION=${shellQuote(env.BUN_VERSION_GUARD_INSTALLED_VERSION)}`
        : "",
      env.REAL_BUN ? `REAL_BUN=${shellQuote(env.REAL_BUN)}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return spawnSync(
      "bash",
      ["-lc", `${assignments} ${shellQuote(toBashPath(scriptPath))}`],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          PATH: env.PATH ?? process.env.PATH,
        },
        encoding: "utf8",
      },
    );
  }

  return spawnSync("bash", [toBashPath(scriptPath)], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const realBun = toBashPath(resolveBunPath());
    const result = runGuard({
      BUN_VERSION_GUARD_BUN: realBun,
      REAL_BUN: realBun,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(result.stderr).not.toContain("error:");
  }, 30_000);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const realBun = toBashPath(resolveBunPath());
    const result = runGuard({
      BUN_VERSION_GUARD_BUN: realBun,
      BUN_VERSION_GUARD_INSTALLED_VERSION: "1.3.4",
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
  }, 30_000);
});
