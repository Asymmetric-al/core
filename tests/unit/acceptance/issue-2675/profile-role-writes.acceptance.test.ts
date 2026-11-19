/**
 * AL-2675 (WP2c, part 1; brief acceptance): "No route or resolver named
 * updateUserRole remains, and no code path writes profiles.role to grant
 * access." Membership is the only authority since WP2a; the role-change and
 * revoke commands write the membership. This scans the application, package
 * and script code for literal writes of `role` into `profiles` (not computed
 * table names or payloads constructed elsewhere) and for the retired
 * mutation's names. The SQL side (no function in the chain sets
 * `profiles.role`) is proved on the migrated database in
 * membership-role-commands.realstack.acceptance.test.ts.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ls = (...dirs: string[]) =>
  spawnSync("git", ["ls-files", "-co", "--exclude-standard", ...dirs], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .stdout.split("\n")
    .filter(
      (f) =>
        /\.(m|c)?[jt]sx?$/.test(f) &&
        !/(\.test\.|\.spec\.|\/tests?\/|__tests__|\/e2e\/)/.test(f),
    );

/**
 * `.from("profiles")` followed by an insert, update or upsert whose object has
 * a `role` property, written out (`role: x`) or shorthand (`role,`).
 */
const PROFILE_ROLE_WRITE =
  /\.from\(\s*["'`]profiles["'`]\s*\)\s*\.(?:insert|update|upsert)\(\s*\{(?:[^}]*?,)?\s*role\s*(?::|,|\})/gs;

/** Writes that stay, with the reason. */
const ALLOWED: Record<string, [number, string]> = {
  "packages/database/scripts/seed-demo-users.ts": [
    1,
    "local demo personas only (it refuses any project not on this machine); the role is display data and grants nothing, since only a membership does",
  ],
};

describe("AL-2675 WP2c: no code path writes profiles.role to grant access", () => {
  const files = ls("apps", "packages", "scripts");

  it("finds a profile-role write only where the allowlist says why", () => {
    expect(files.length).toBeGreaterThan(500);
    const found: Record<string, number> = {};
    for (const f of files) {
      const n = [...readFileSync(f, "utf8").matchAll(PROFILE_ROLE_WRITE)]
        .length;
      if (n > 0) found[f] = n;
    }
    expect(found).toEqual(
      Object.fromEntries(Object.entries(ALLOWED).map(([f, [n]]) => [f, n])),
    );
  });

  it("names no updateUserRole route, resolver or input, nor the retired SQL function", () => {
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const name of [
        "updateUserRole",
        "UpdateUserRoleInput",
        "atomic_update_user_role_with_audit",
      ])
        expect([f, text.includes(name)]).toEqual([f, false]);
    }
  });

  it("catches the planted forms", () => {
    for (const planted of [
      'await db.from("profiles").update({ role: "admin" }).eq("id", id);',
      "await db.from('profiles').upsert({ id, role: input.role, email });",
      'db.from("profiles")\n  .insert({\n    id,\n    role,\n  })',
    ])
      expect([...planted.matchAll(PROFILE_ROLE_WRITE)].length, planted).toBe(1);
    for (const clean of [
      'db.from("profiles").update({ first_name: "A" }).eq("role", "x")',
      'db.from("profiles").update({ first_name: role, email })',
      'db.from("profiles").update({ ...profileUpdate, updated_at: now })',
    ])
      expect([...clean.matchAll(PROFILE_ROLE_WRITE)].length, clean).toBe(0);
  });
});
