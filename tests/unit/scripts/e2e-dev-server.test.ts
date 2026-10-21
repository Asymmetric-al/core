import { spawnSync } from "node:child_process";
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
  it("refuses dev start when Supabase URL is a non-hermetic remote host", () => {
    const result = runScript(["donor", "start", "3005"], {
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
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    expect(result.status).toBe(0);
  });

  it("allows check when Supabase URL uses loopback", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
    });

    expect(result.status).toBe(0);
  });

  it("refuses check when Supabase URL is unset", () => {
    const result = runScript(["donor", "check-dev-supabase"], {
      NEXT_PUBLIC_SUPABASE_URL: "",
    });

    expect(result.status).not.toBe(0);
  });
});
