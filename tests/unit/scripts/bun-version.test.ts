import { mkdtempSync, writeFileSync } from "node:fs";
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

  const command = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(command, ["bun"], { encoding: "utf8" });
  const firstMatch = result.stdout?.split(/\r?\n/).find(Boolean);

  if (!firstMatch) {
    throw new Error("Unable to resolve bun on PATH for bun-version test");
  }

  return firstMatch.trim();
}

function runGuard(env: NodeJS.ProcessEnv = {}) {
  const bunPath = resolveBunPath();
  const bashBunDir = toBashPath(path.dirname(bunPath));

  return spawnSync("bash", [scriptPath], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PATH: `${bashBunDir}:${bashSystemPath}:${process.env.PATH ?? ""}`,
      ...env,
    },
    encoding: "utf8",
  });
}

function canRunBunVersionGuard(): boolean {
  try {
    const bunPath = resolveBunPath();
    const bashBunDir = toBashPath(path.dirname(bunPath));
    const result = spawnSync(
      "bash",
      ["-lc", "command -v bun >/dev/null 2>&1 && bun --version >/dev/null"],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          PATH: `${bashBunDir}:${bashSystemPath}:${process.env.PATH ?? ""}`,
        },
        encoding: "utf8",
      },
    );

    return result.status === 0;
  } catch {
    return false;
  }
}

const itIfBashCanRunBun = canRunBunVersionGuard() ? it : it.skip;
const itIfFakeBunCanShadowPath =
  process.platform === "win32" ? it.skip : itIfBashCanRunBun;

describe("bun version guard", () => {
  itIfBashCanRunBun(
    "accepts the installed Bun when it matches packageManager",
    () => {
      const result = runGuard();

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
      expect(result.stderr).toBe("");
    },
    30000,
  );

  itIfFakeBunCanShadowPath(
    "fails fast when the Bun binary does not match packageManager",
    () => {
      const fakeBinDir = mkdtempSync(path.join(tmpdir(), "fake-bun-"));
      const bashFakeBinDir = toBashPath(fakeBinDir);
      const realBun = toBashPath(resolveBunPath());

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
        PATH: `${bashFakeBinDir}:${bashSystemPath}:${process.env.PATH ?? ""}`,
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
    },
    30000,
  );
});
