import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = "scripts/verify/bun-version.sh";
const bashLauncher = resolveBashLauncher();
const bashTestTimeout = 60_000;

function resolveWindowsCommand(command: string) {
  const result = spawnSync("where.exe", [command], { encoding: "utf8" });

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveBashLauncher() {
  if (process.platform === "win32") {
    const bashCommand = resolveWindowsCommand("bash").find((candidate) =>
      candidate.toLowerCase().includes("\\git\\"),
    );
    if (bashCommand) {
      return { command: bashCommand, args: [] };
    }

    const wslCommand = resolveWindowsCommand("wsl.exe");
    if (wslCommand[0]) {
      return { command: wslCommand[0], args: ["--exec", "bash"] };
    }
  }

  return { command: "bash", args: [] };
}

function spawnBash(args: string[], options: Parameters<typeof spawnSync>[2]) {
  return spawnSync(
    bashLauncher.command,
    [...bashLauncher.args, ...args],
    options,
  );
}

function runGuardWithFakeBun(version: string) {
  const script = [
    'fake_bin_dir="/tmp/core-fake-bun-$$"',
    'mkdir -p "$fake_bin_dir"',
    "cat > \"$fake_bin_dir/bun\" <<'EOF'",
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'if [[ "${1:-}" == "--version" ]]; then',
    `  echo "${version}"`,
    "  exit 0",
    "fi",
    'if [[ "${1:-}" == "-e" ]]; then',
    '  package_json="${3:-}"',
    '  sed -n \'s/.*"packageManager"[[:space:]]*:[[:space:]]*"bun@\\([^"]*\\)".*/\\1/p\' "$package_json" | head -n 1',
    "  exit 0",
    "fi",
    'echo "unexpected fake bun args: $*" >&2',
    "exit 127",
    "EOF",
    'chmod +x "$fake_bin_dir/bun"',
    'export BUN_BIN="$fake_bin_dir/bun"',
    `bash ${scriptPath}`,
  ].join("\n");

  return spawnBash(["-lc", script], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    timeout: bashTestTimeout,
  });
}

function stripWslStartupWarning(stderr: string) {
  return stderr.replace(
    /^wsl: Failed to start the systemd user session[^\n]*\n?/gm,
    "",
  );
}

describe("bun version guard", () => {
  it("accepts the installed Bun when it matches packageManager", () => {
    const result = runGuardWithFakeBun("1.3.14");
    const stderr = stripWslStartupWarning(result.stderr);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Bun version OK: bun@1.3.14");
    expect(stderr).toBe("");
  }, bashTestTimeout);

  it("fails fast when the Bun binary does not match packageManager", () => {
    const result = runGuardWithFakeBun("1.3.4");
    const stderr = stripWslStartupWarning(result.stderr);

    expect(result.status).toBe(1);
    expect(stderr).toContain("error: Bun version mismatch.");
    expect(stderr).toContain(
      "expected (package.json packageManager): bun@1.3.14",
    );
    expect(stderr).toContain(
      "installed (bun --version):              bun@1.3.4",
    );
  }, bashTestTimeout);
});
