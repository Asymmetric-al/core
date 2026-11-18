// Council round 2, A5 (record D-24): the demo-user seeder refuses to give a
// hosted project's logins a password published in the repository. A local
// stack keeps the seed's password.
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const seeder = "packages/database/scripts/seed-demo-users.ts";

function seed(supabaseUrl: string, demoPassword: string) {
  return spawnSync("bun", [seeder], {
    encoding: "utf8",
    timeout: 60_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: "service-role-fixture",
      DEMO_PASSWORD: demoPassword,
      DEMO_ADMIN_EMAIL: "",
    },
  });
}

describe("seed:demo:users and published passwords", () => {
  it("refuses the seed's published password for a hosted project, before it calls the project", () => {
    const result = seed(
      "https://abcdefghijklmnopqrst.supabase.co",
      "demo-password",
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "DEMO_PASSWORD is a password published in the repository",
    );
    expect(result.stderr).not.toMatch(
      /fetch|platform_health|environment marker/i,
    );
  });

  it("lets a local stack keep the seed's password (it fails later, on the closed port)", () => {
    const result = seed("http://127.0.0.1:9", "demo-password");
    expect(result.status).toBe(1);
    expect(result.stderr).not.toContain("published in the repository");
  });
});
