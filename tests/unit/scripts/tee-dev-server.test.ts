import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = "scripts/e2e/tee-dev-server.mjs";
const dirs: string[] = [];

function scratch() {
  const dir = mkdtempSync(path.join(tmpdir(), "tee-dev-server-"));
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function run(args: string[], env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    timeout: 30_000,
    env: { ...process.env, ...env },
  });
}

describe("AL-2675 WP2c part 2a: the dev server tee of the auth email journeys", () => {
  it("mirrors the command's stdout and stderr to the log file, into a new folder, and exits with its code", () => {
    const dir = scratch();
    const child = path.join(dir, "child.mjs");
    writeFileSync(
      child,
      'process.stdout.write("to stdout\\n"); process.stderr.write("to stderr\\n"); process.exitCode = 3;\n',
    );
    const logFile = path.join(dir, "nested", "admin-server.log");
    const result = run([process.execPath, child], {
      AUTH_MAIL_ADMIN_LOG_FILE: logFile,
    });
    expect(result.status).toBe(3);
    expect(result.stdout).toContain("to stdout");
    expect(result.stderr).toContain("to stderr");
    const log = readFileSync(logFile, "utf8");
    expect(log).toContain("to stdout");
    expect(log).toContain("to stderr");
  });

  it("starts each run with an empty log", () => {
    const dir = scratch();
    const logFile = path.join(dir, "admin-server.log");
    writeFileSync(logFile, "from an earlier run\n");
    const result = run([process.execPath, "-e", "console.log('fresh')"], {
      AUTH_MAIL_ADMIN_LOG_FILE: logFile,
    });
    expect(result.status).toBe(0);
    const log = readFileSync(logFile, "utf8");
    expect(log).toContain("fresh");
    expect(log).not.toContain("from an earlier run");
  });

  it("refuses to start without a log file or a command", () => {
    const missingLog = run([process.execPath, "-e", "0"], {
      AUTH_MAIL_ADMIN_LOG_FILE: "",
    });
    expect(missingLog.status).not.toBe(0);
    expect(missingLog.stderr).toContain("AUTH_MAIL_ADMIN_LOG_FILE");
    const missingCommand = run([], {
      AUTH_MAIL_ADMIN_LOG_FILE: path.join(scratch(), "x.log"),
    });
    expect(missingCommand.status).not.toBe(0);
  });
});
