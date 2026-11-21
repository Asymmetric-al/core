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
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The source files Git knows under `dirs`, read with -z so that no path is
 * quoted (Git quotes one with a byte outside ASCII otherwise), less tests.
 */
const ls = (dirs: string[], cwd = process.cwd()) =>
  spawnSync("git", ["ls-files", "-z", "-co", "--exclude-standard", ...dirs], {
    cwd,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .stdout.split("\0")
    .filter(
      (f) =>
        /\.(m|c)?[jt]sx?$/.test(f) &&
        !/(\.test\.|\.spec\.|\/tests?\/|__tests__|\/e2e\/)/.test(f),
    );

/** `.from("profiles")` followed by an insert, update or upsert of an object written inline. */
const PROFILE_WRITE =
  /\.from\(\s*["'`]profiles["'`]\s*\)\s*\.(?:insert|update|upsert)\(\s*\{/g;

/** A `role` key, bare or quoted, then its value, the next property or the end. */
const ROLE_KEY = /(?:(["'])role\1|role(?![\w$]))\s*[:,}]/y;

/**
 * The inline writes of `profiles` whose object names `role` at its top level:
 * written out (`role: x`, `"role": x`) or shorthand (`role,`), before or after
 * nested objects, arrays, calls, strings and comments, which it steps over.
 */
function countProfileRoleWrites(source: string): number {
  let count = 0;
  for (const write of source.matchAll(PROFILE_WRITE))
    if (namesTopLevelRole(source, write.index + write[0].length)) count += 1;
  return count;
}

/** Whether the object literal whose body starts at `start` has a top-level `role` key. */
function namesTopLevelRole(source: string, start: number): boolean {
  let depth = 0;
  let atKey = true;
  for (let i = start; i < source.length; i += 1) {
    const c = source[i]!;
    if (/\s/.test(c)) continue;
    if (c === "/" && (source[i + 1] === "/" || source[i + 1] === "*")) {
      const end =
        source[i + 1] === "/"
          ? source.indexOf("\n", i)
          : source.indexOf("*/", i + 2) + 1;
      if (end <= 0) return false;
      i = end;
      continue;
    }
    if (depth === 0 && atKey) {
      ROLE_KEY.lastIndex = i;
      if (ROLE_KEY.test(source)) return true;
      atKey = false;
    }
    if (c === '"' || c === "'" || c === "`") i = endOfString(source, i);
    else if ("{[(".includes(c)) depth += 1;
    else if ("}])".includes(c)) {
      if (depth === 0) return false;
      depth -= 1;
    } else if (c === "," && depth === 0) atKey = true;
  }
  return false;
}

/** The index of the quote that closes the string opening at `start`. */
function endOfString(source: string, start: number): number {
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === "\\") i += 1;
    else if (source[i] === source[start]) return i;
  }
  return source.length;
}

/** Writes that stay, with the reason. */
const ALLOWED: Record<string, [number, string]> = {
  "packages/database/scripts/seed-demo-users.ts": [
    1,
    "local demo personas only (it refuses any project not on this machine); the role is display data and grants nothing, since only a membership does",
  ],
};

describe("AL-2675 WP2c: no code path writes profiles.role to grant access", () => {
  const files = ls(["apps", "packages", "scripts"]);

  it("finds a profile-role write only where the allowlist says why", () => {
    expect(files.length).toBeGreaterThan(500);
    const found: Record<string, number> = {};
    for (const f of files) {
      const n = countProfileRoleWrites(readFileSync(f, "utf8"));
      if (n > 0) found[f] = n;
    }
    expect(found).toEqual(
      Object.fromEntries(Object.entries(ALLOWED).map(([f, [n]]) => [f, n])),
    );
  });

  // Review 4650094393 on #2741: Git quotes a path with a byte outside ASCII
  // unless it is read with -z, and a quoted path ends in `"`, so the scan
  // would drop it.
  it("reads a path Git would quote, as it is named", () => {
    const repo = mkdtempSync(path.join(tmpdir(), "profile-role-writes-"));
    try {
      spawnSync("git", ["init", "-q"], { cwd: repo });
      mkdirSync(path.join(repo, "packages"));
      writeFileSync(path.join(repo, "packages", "café.ts"), "");
      writeFileSync(path.join(repo, "packages", "plain.ts"), "");
      expect(ls(["packages"], repo).sort()).toEqual([
        "packages/café.ts",
        "packages/plain.ts",
      ]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
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
      // Review 4650094394 on #2741: after a nested object, and quoted.
      'db.from("profiles").update({ metadata: { source: "fixture" }, role: nextRole })',
      'db.from("profiles").update({ "role": "admin" })',
      "db.from('profiles').upsert({ id, 'role': input.role })",
      'db.from("profiles").update({ note: `a}b`, tags: ["x", "y"], role })',
    ])
      expect(countProfileRoleWrites(planted), planted).toBe(1);
    for (const clean of [
      'db.from("profiles").update({ first_name: "A" }).eq("role", "x")',
      'db.from("profiles").update({ first_name: role, email })',
      'db.from("profiles").update({ ...profileUpdate, updated_at: now })',
      'db.from("profiles").update({ metadata: { role: "x" } })',
      'db.from("profiles").update({ roles: ["a"], roleName: "b" })',
      'db.from("profiles").update({ first_name: "role: admin" })',
    ])
      expect(countProfileRoleWrites(clean), clean).toBe(0);
  });
});
