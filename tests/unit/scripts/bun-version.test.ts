import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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
    process.platform === "win32"
      ? "C:\\Windows\\System32\\where.exe"
      : "which";
  const result = spawnSync(command, ["bun"], { encoding: "utf8" });
  const firstMatch = result.stdout?.split(/\r?\n/).find(Boolean);

  if (!firstMatch) {
    throw new Error("Unable to resolve bun on PATH for bun-version test");
  }

  return firstMatch.trim();
}

function createFakeBun(version: string): {
  command: string;
  dir: string;
  realBun: string;
} {
  const realBun = toBashPath(resolveBunPath());
  const fakeBinDir = mkdtempSync(path.join(tmpdir(), "bun-version-test-"));
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
      'exec "$REAL_BUN" "$@"',
    ].join("\n"),
    { mode: 0o755 },
  );

  const bashFakeBunPath = toBashPath(fakeBunPath);
  const result = spawnSync("bash", ["-lc", `chmod +x "${bashFakeBunPath}"`], {
    cwd: repoRoot,
    env: { ...process.env, REAL_BUN: realBun },
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Unable to make fake Bun executable");
  }

  return {
    command: bashFakeBunPath,
    dir: fakeBinDir,
    realBun,
  };
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function runGuard(env: NodeJS.ProcessEnv = {}) {
  if (env.BUN_VERSION_GUARD_BUN) {
    const assignments = [
      `BUN_VERSION_GUARD_BUN=${shellQuote(env.BUN_VERSION_GUARD_BUN)}`,
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
    const fakeBun = createFakeBun("1.3.4");
    const bashFakeBinDir = fakeBun.command.slice(
      0,
      fakeBun.command.lastIndexOf("/"),
    );

    try {
      const result = runGuard({
        PATH: `${bashFakeBinDir}:${bashSystemPath}:${process.env.PATH ?? ""}`,
        BUN_VERSION_GUARD_BUN: fakeBun.command,
        REAL_BUN: fakeBun.realBun,
      });

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("error: Bun version mismatch.");
      expect(result.stderr).toContain(
        "expected (package.json packageManager): bun@1.3.14",
      );
      expect(result.stderr).toContain(
        "installed (bun --version):              bun@1.3.4",
      );
    } finally {
      rmSync(fakeBun.dir, { force: true, recursive: true });
    }
  }, 30_000);
});
