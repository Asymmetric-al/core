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

    it("bounds both readiness probes with connect and total timeouts", () => {
      const source = readFileSync(SCRIPT, "utf8");
      expect(source).toContain(
        "local probe=(curl -sf --connect-timeout 5 --max-time 10)",
      );
      expect(source).toContain('"${probe[@]}" "${base}${health_path}"');
      expect(source).toContain('"${probe[@]}" "${base}${extra_path}"');
      expect(source).not.toMatch(/^\s*if curl -sf "/m);
    });

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
});
