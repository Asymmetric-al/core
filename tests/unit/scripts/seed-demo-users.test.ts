// Council round 2, A5 (record D-24): the demo-user seeder refused to give a
// hosted project's logins a password published in the repository. A local
// stack keeps the seed's password.
//
// Rewritten by AL-2675 (WP2c, part 1; record section 9, "seed:demo:users can
// still create demo users with a known password on a hosted project", owed by
// WP2c or WP10; record D-18). The seeder now refuses any project that is not
// on this machine, whatever the password, by the one loopback host list
// (`LOOPBACK_DATABASE_HOSTS` in packages/env/src/database-url.mjs, behind
// `isLoopbackDatabaseUrl`), so a hosted project gets no demo login at all,
// with a published password or any other. The published-password refusal is
// kept as the stronger case and the local stack still keeps its password.
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

const NOT_LOCAL = "not on this machine";

describe("seed:demo:users seeds only a project on this machine", () => {
  it.each([
    ["the seed's published password", "demo-password"],
    ["a password from a secret", "a-long-unpublished-secret-9f3c"],
  ])(
    "refuses a hosted project with %s, before it calls the project",
    (_what, password) => {
      const result = seed("https://abcdefghijklmnopqrst.supabase.co", password);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(NOT_LOCAL);
      expect(result.stderr).not.toMatch(
        /fetch|platform_health|environment marker/i,
      );
    },
  );

  it.each([
    "http://127.0.0.2:54321",
    "http://example.com:54321",
    "http://localhost.example.com:54321",
    "not a url",
  ])("refuses %s, which the one loopback host list does not name", (url) => {
    const result = seed(url, "demo-password");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(NOT_LOCAL);
  });

  it.each(["http://127.0.0.1:9", "http://localhost:9", "http://[::1]:9"])(
    "lets a local stack at %s keep the seed's password (it fails later, on the closed port)",
    (url) => {
      const result = seed(url, "demo-password");
      expect(result.status).toBe(1);
      expect(result.stderr).not.toContain(NOT_LOCAL);
      expect(result.stderr).not.toContain("published in the repository");
      // It got as far as asking the database for its environment marker,
      // which it does only after it accepted the address; an earlier failure
      // would show neither refusal either (review 4650094410 on #2741).
      expect(result.stderr).toContain("has no readable environment marker");
    },
  );
});
