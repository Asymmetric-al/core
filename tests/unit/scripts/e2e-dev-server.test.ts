import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadWorkflowJobs } from "../helpers/workflow-yaml";

const SCRIPT = path.join("scripts", "github", "e2e-dev-server.sh");

function runScript(args: string[], env: Record<string, string> = {}) {
  return spawnSync("bash", [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

describe("e2e-dev-server.sh", () => {
  it("does not inject per-app Node heap caps (runners sized for default dev memory)", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).not.toContain("--max-old-space-size");
    expect(source).toContain("log_runner_snapshot");
  });

  it("skips hermetic Supabase enforcement when ASYM_E2E_REQUIRE_HERMETIC_SUPABASE is unset", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      NEXT_PUBLIC_SUPABASE_URL: "https://real-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });

    expect(result.status).toBe(0);
  });

  it("refuses dev start when hermetic enforcement is on and Supabase URL is a non-hermetic remote host", () => {
    const result = runScript(["donor", "start", "3005"], {
      ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "https://real-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "Refusing to start E2E dev server",
    );
  });

  it("allows check when Supabase URL is the hermetic placeholder", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    expect(result.status).toBe(0);
  });

  it("allows check when Supabase URL uses loopback", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
    });

    expect(result.status).toBe(0);
  });

  it("allows check when Supabase URL uses bracketed IPv6 loopback", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://[::1]:54321",
    });

    expect(result.status).toBe(0);
  });

  it("refuses check when Supabase URL is unset under hermetic enforcement", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "",
    });

    expect(result.status).not.toBe(0);
  });

  it.each([
    ["https://example.supabase.co.evil.com"],
    ["https://evil.com/example.supabase.co"],
    ["https://user@example.supabase.co"],
    ["http://127.0.0.1.evil.com"],
    ["https://localhost:pass@evil.com"],
    ["not-a-valid-url"],
    ["https://localhost:x@real-project.supabase.co"],
    ["https://example.supabase.co:443@evil.example"],
  ])(
    "rejects bypass Supabase URL %s when hermetic enforcement is on",
    (url) => {
      const result = runScript(["donor", "check-dev-supabase"], {
        ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1",
        NEXT_PUBLIC_SUPABASE_URL: url,
      });

      expect(result.status).not.toBe(0);
    },
  );

  describe("readiness wait and process files", () => {
    const freePort = () =>
      new Promise<number>((resolve) => {
        const server = createServer();
        server.listen(0, "127.0.0.1", () => {
          const address = server.address();
          const port =
            typeof address === "object" && address ? address.port : 0;
          server.close(() => resolve(port));
        });
      });
    const alive = (pid: number) => {
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    };
    const withRunnerTemp = <T>(fn: (dir: string) => T): T => {
      const dir = mkdtempSync(path.join(tmpdir(), "e2e-dev-server-test-"));
      try {
        return fn(dir);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    };

    it("bounds both readiness probes by the time left before the deadline", () => {
      const source = readFileSync(SCRIPT, "utf8");
      // Each probe: --connect-timeout <= min(5, remaining), --max-time <=
      // min(10, remaining), remaining floored at 1s.
      expect(source).toContain(
        'curl -sf --connect-timeout "$connect_timeout" --max-time "$max_time" "$url"',
      );
      expect(source).toContain("local remaining=$((deadline - SECONDS))");
      expect(source).toContain('probe_url "$deadline" "${base}${health_path}"');
      expect(source).toContain('probe_url "$deadline" "${base}${extra_path}"');
      expect(source).not.toMatch(/^\s*if curl -sf "/m);
      expect(source).not.toContain('seq 1 "$max_seconds"');
    });

    it("max_seconds is an elapsed-time deadline even when the server accepts but never answers", async () => {
      // A listener whose connections are accepted by the kernel backlog but
      // never answered (spawnSync below blocks this process's event loop).
      const server = createServer(() => {});
      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      const dir = mkdtempSync(path.join(tmpdir(), "e2e-dev-server-test-"));
      let sleeperPid = 0;
      try {
        const sleeper = spawnSync(
          "bash",
          ["-c", "setsid sleep 60 >/dev/null 2>&1 </dev/null & echo $!"],
          { encoding: "utf8" },
        );
        sleeperPid = Number(sleeper.stdout.trim());
        const pidfile = path.join(dir, "donor-dev.pid");
        writeFileSync(pidfile, String(sleeperPid));
        writeFileSync(path.join(dir, "donor-dev.log"), "hung dev server\n");
        const started = Date.now();
        const result = runScript(
          [
            "donor",
            "wait",
            String(port),
            "127.0.0.1",
            "/api/health",
            "",
            "",
            "",
            "2",
          ],
          { RUNNER_TEMP: dir },
        );
        const elapsed = Date.now() - started;
        expect(result.status).not.toBe(0);
        expect(elapsed).toBeLessThan(5_000);
        expect(result.stderr).toContain("Timed out after 2s waiting for donor");
        expect(result.stdout + result.stderr).toContain("hung dev server");
        expect(existsSync(pidfile)).toBe(false);
      } finally {
        if (sleeperPid > 0) {
          try {
            process.kill(sleeperPid, "SIGKILL");
          } catch {
            // already gone
          }
        }
        await new Promise<void>((resolve) => server.close(() => resolve()));
        rmSync(dir, { recursive: true, force: true });
      }
    }, 40_000);

    it("fails fast with the log tail when the server process has exited", async () => {
      const port = await freePort();
      withRunnerTemp((dir) => {
        // A pid that has certainly exited (the spawned shell is gone).
        const dead = spawnSync("bash", ["-c", "echo $$"], { encoding: "utf8" });
        const pidfile = path.join(dir, "donor-dev.pid");
        writeFileSync(pidfile, dead.stdout.trim());
        writeFileSync(
          path.join(dir, "donor-dev.log"),
          "boom: dev server crashed\n",
        );
        const started = Date.now();
        const result = runScript(
          [
            "donor",
            "wait",
            String(port),
            "127.0.0.1",
            "/api/health",
            "",
            "",
            "",
            "30",
          ],
          { RUNNER_TEMP: dir },
        );
        expect(result.status).toBe(1);
        expect(Date.now() - started).toBeLessThan(10_000);
        expect(result.stderr).toContain("exited before becoming ready");
        expect(result.stdout + result.stderr).toContain(
          "boom: dev server crashed",
        );
        expect(existsSync(pidfile)).toBe(false);
      });
    }, 20_000);

    it("keeps pid and log files under RUNNER_TEMP and stops only that process group", () => {
      const source = readFileSync(SCRIPT, "utf8");
      expect(source).toContain('TMP_DIR="${RUNNER_TEMP:-/tmp}"');
      expect(source.match(/\/tmp\//g) ?? []).toEqual([]);
      withRunnerTemp((dir) => {
        const sleeper = spawnSync(
          "bash",
          ["-c", "setsid sleep 30 >/dev/null 2>&1 </dev/null & echo $!"],
          { encoding: "utf8" },
        );
        const pid = Number(sleeper.stdout.trim());
        expect(alive(pid)).toBe(true);
        const pidfile = path.join(dir, "donor-dev.pid");
        writeFileSync(pidfile, String(pid));
        try {
          const result = runScript(["donor", "stop"], { RUNNER_TEMP: dir });
          expect(result.status).toBe(0);
          expect(existsSync(pidfile)).toBe(false);
          expect(alive(pid)).toBe(false);
        } finally {
          if (alive(pid)) process.kill(pid, "SIGKILL");
        }
      });
    }, 20_000);
  });

  describe("ci-integration failure-log tails track the script's log paths", () => {
    const WORKFLOW = path.join(".github", "workflows", "ci-integration.yml");
    const STEP = "Show dev server logs on failure";

    /** Where the script writes `<app>`'s dev log: its TMP_DIR value plus `${APP}-dev.log`. */
    function scriptLogPath(app: string, source: string): string {
      const tmpDir = /^TMP_DIR="([^"]+)"$/m.exec(source)?.[1];
      if (tmpDir === undefined) throw new Error("no TMP_DIR assignment");
      if (!source.includes('local log="${TMP_DIR}/${APP}-dev.log"')) {
        throw new Error("start_app no longer writes ${TMP_DIR}/${APP}-dev.log");
      }
      return `${tmpDir}/${app}-dev.log`;
    }

    /** Problems with the step's tails against the apps the job starts and the script's paths. */
    function tailProblems(
      run: string,
      apps: string[],
      source: string,
    ): string[] {
      const problems: string[] = [];
      const tails = [
        ...run.matchAll(
          /^\s*echo "--- (\w+) dev log \(tail\) ---"\n\s*tail -n 150 (.+)$/gm,
        ),
      ];
      const seen = tails.map((m) => m[1]!);
      if (JSON.stringify(seen) !== JSON.stringify(apps)) {
        problems.push(
          `tails cover ${JSON.stringify(seen)}, job starts ${JSON.stringify(apps)}`,
        );
      }
      for (const [, app, rest] of tails) {
        const expected = `"${scriptLogPath(app!, source)}" || true`;
        if (rest!.trim() !== expected) {
          problems.push(
            `${app} tail is ${JSON.stringify(rest!.trim())}, expected ${JSON.stringify(expected)}`,
          );
        }
      }
      return problems;
    }

    const realJob = () => loadWorkflowJobs(WORKFLOW)["test-e2e-smoke"]!;
    const realRun = () =>
      realJob().steps!.find((step) => step.name === STEP)!.run!;
    const startedApps = () =>
      realJob()
        .steps!.map(
          (step) => /e2e-dev-server\.sh (\w+) start/.exec(step.run ?? "")?.[1],
        )
        .filter((app): app is string => app !== undefined);
    const source = () => readFileSync(SCRIPT, "utf8");

    it("each tail is exactly where e2e-dev-server.sh writes that app's log", () => {
      expect(startedApps()).toEqual(["donor", "admin"]);
      expect(scriptLogPath("donor", source())).toBe(
        "${RUNNER_TEMP:-/tmp}/donor-dev.log",
      );
      expect(tailProblems(realRun(), startedApps(), source())).toEqual([]);
      expect(realRun()).toContain(
        'tail -n 150 "${RUNNER_TEMP:-/tmp}/donor-dev.log" || true',
      );
      expect(realRun()).toContain(
        'tail -n 150 "${RUNNER_TEMP:-/tmp}/admin-dev.log" || true',
      );
    });

    it.each([
      [
        "back to /tmp",
        '"${RUNNER_TEMP:-/tmp}/donor-dev.log"',
        "/tmp/donor-dev.log",
      ],
      [
        "a different file name",
        '"${RUNNER_TEMP:-/tmp}/donor-dev.log"',
        '"${RUNNER_TEMP:-/tmp}/donor-dev-old.log"',
      ],
      [
        "admin swapped to the donor path",
        '"${RUNNER_TEMP:-/tmp}/admin-dev.log"',
        '"${RUNNER_TEMP:-/tmp}/donor-dev.log"',
      ],
      [
        "|| true dropped",
        '"${RUNNER_TEMP:-/tmp}/admin-dev.log" || true',
        '"${RUNNER_TEMP:-/tmp}/admin-dev.log"',
      ],
    ])("a tail mutated %s is caught", (_label, from, to) => {
      const run = realRun();
      expect(run.split(from)).toHaveLength(2);
      expect(
        tailProblems(run.replace(from, to), startedApps(), source()),
      ).not.toEqual([]);
    });

    it("the expected path follows the script: a script back on /tmp no longer matches", () => {
      const drifted = source().replace(
        'TMP_DIR="${RUNNER_TEMP:-/tmp}"',
        'TMP_DIR="/tmp"',
      );
      expect(drifted).not.toBe(source());
      expect(tailProblems(realRun(), startedApps(), drifted)).not.toEqual([]);
    });
  });
});
