import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
});
