/** #2402 r1 + addendum criterion mapping:
 * c1: reserved version/header; c2a: named revokes incl. M1/M3 text mutants;
 * c4/5: five DEFINER wrappers, empty path, reduced signatures; c12: no touch;
 * c13: session helper (five RPCs/status mapping in routes.acceptance.test.ts);
 * c14: contract/docs; c15: rollback; c16: CI step; c17: immutable hashes.
 * c6-11/M2/M4 runtime checks are in realstack. The §6/9 declared-edit check
 * of the merged PR was retired by #2706 (diff scope belongs in review).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { expectRealstackStep } from "../shared/realstack-step";

const sql = () => H.code(H.read(H.FORWARD));
const REAL =
  "tests/unit/acceptance/issue-2402/crm-table-preferences.realstack.acceptance.test.ts";
const revoke = (text: string, schema: string, fn: string, roles: string[]) => {
  const statements =
    text.match(
      new RegExp(
        `REVOKE\\s+ALL(?:\\s+PRIVILEGES)?\\s+ON\\s+FUNCTION\\s+${schema}\\.${fn}\\s*\\([^;]*?\\)\\s+FROM\\s+([^;]+);`,
        "gi",
      ),
    ) ?? [];
  const named = statements.flatMap((s) =>
    s
      .split(/\bFROM\b/i)[1]!
      .replace(";", "")
      .toLowerCase()
      .split(",")
      .map((r) => r.trim()),
  );
  return roles.every((r) => named.includes(r));
};
describe("#2402 static contract", () => {
  it("1/15: reserved forward migration, later than PR base, with rollback header and schema reloads", () => {
    expect(H.read(H.FORWARD), H.FORWARD).not.toBe("");
    expect(H.NAME.slice(0, 14) > "20261025120000").toBe(true);
    expect(H.read(H.FORWARD)).toMatch(
      new RegExp(`^--.*rollback_${H.NAME}`, "m"),
    );
    expect(H.read(H.ROLLBACK), H.ROLLBACK).not.toBe("");
    for (const path of [H.FORWARD, H.ROLLBACK])
      expect(H.code(H.read(path)).trim()).toMatch(
        /SELECT\s+(?:pg_catalog\.)?pg_notify\('pgrst',\s*'reload schema'\);(?:\s*COMMIT;)?$/i,
      );
    expect(H.code(H.read(H.ROLLBACK))).not.toMatch(
      /GRANT\s+EXECUTE[^;]*\bTO\b[^;]*\b(?:anon|authenticated)\b/i,
    );
  });
  it.each(H.FNS)(
    "2a/4/5: %s wrapper and private body have explicit named revokes",
    (fn) => {
      expect(
        revoke(sql(), "public", fn, ["public", "anon", "service_role"]),
      ).toBe(true);
      expect(
        revoke(sql(), "private", fn, [
          "public",
          "anon",
          "authenticated",
          "service_role",
        ]),
      ).toBe(true);
      expect(sql()).toMatch(
        new RegExp(
          `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${fn}\\([^;]*\\)\\s+TO\\s+authenticated\\s*;`,
          "i",
        ),
      );
      const definition = sql().match(
        new RegExp(
          `CREATE(?:\\s+OR\\s+REPLACE)?\\s+FUNCTION\\s+public\\.${fn}\\s*\\(([^)]*)\\)([\\s\\S]*?)AS\\s+\\$`,
          "i",
        ),
      );
      expect(definition, `public.${fn} wrapper definition`).not.toBeNull();
      expect(definition![1]).not.toMatch(/profile|actor|user_id|can_manage/i);
      expect(definition![2]).toMatch(/SECURITY\s+DEFINER/i);
      expect(definition![2]).toMatch(/SET\s+search_path\s*(?:=|TO)\s*''/i);
    },
  );
  it.each(["anon", "service_role"])(
    "2a mutant: validator rejects wrapper retaining %s (M1/M3)",
    (role) => {
      const valid = `REVOKE ALL ON FUNCTION public.f(uuid) FROM PUBLIC, anon, service_role;`;
      expect(
        revoke(valid, "public", "f", ["public", "anon", "service_role"]),
      ).toBe(true);
      expect(
        revoke(valid.replace(new RegExp(`, ${role}\\b`), ""), "public", "f", [
          "public",
          "anon",
          "service_role",
        ]),
      ).toBe(false);
    },
  );
  it("12: neither new migration touches current_user_memberships", () => {
    for (const p of [H.FORWARD, H.ROLLBACK])
      expect(H.code(H.read(p))).not.toMatch(/current_user_memberships/i);
  });
  it("13: session helper accepts bearer and cookie sessions", () => {
    const helper = H.read("packages/api/src/shared/request-session-client.ts");
    expect(helper).toMatch(/authorization/i);
    expect(helper).toMatch(/bearer/i);
    expect(helper).toMatch(/cookie|createClient/i);
  });
  it("14: exact contract rows, scope pruning and paired deploy/rollback notes", () => {
    const doc = H.read("docs/security/function-execute-grants.md"),
      tail = doc.split("## Same pattern, not fixed here")[1] ?? "";
    for (const fn of H.FNS) {
      const row = doc
        .split("\n")
        .find((l) => l.startsWith("|") && l.includes(`public.${fn}(`));
      expect(row ?? "").toMatch(
        /DEFINER.*`postgres`\s*\(owner\).*`authenticated`/,
      );
      expect(row).not.toMatch(/`(?:anon|service_role|PUBLIC)`/);
      expect(tail).not.toContain(fn);
    }
    expect(tail).toContain("apply_crm_view_settings_patch");
    expect(doc).toContain(H.NAME);
    expect(doc).toContain(`rollback_${H.NAME}`);
    expect(doc).toMatch(/same (?:release|window)|paired|together/i);
  });
  it("16: the tenant isolation migrate step runs the #2402 real-stack file", () => {
    expectRealstackStep("Verify tenant isolation (real stack)", [REAL], {
      TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}",
    });
  });
  // Pinned bytes from a1375d46; one file per row for review.
  it.each(
    `
20260611160000_crm_table_preferences.sql c62575d0a11a1aa2a8ad20a07e0f4a2ea102253a35863b36b1960f9c32745755
20260611170000_crm_table_named_views.sql 8c4f13ecb242c37295c484196c9b75f75f4550af534356c80082e03e9596b7c5
20260802041500_current_user_memberships_rpc.sql f17ac524c738494050ea33e1a7a6608aa081e294266d71d73e7fb31efec38451
20261024163000_authz_definer_execute_lockdown.sql f0c0446d5f648dae8e796c476192eede0286fce7b2837453f32d9b1eb6e3b8e7
`
      .trim()
      .split("\n")
      .map((line) => line.split(" ")),
  )("17: %s retains baseline bytes", (file, hash) => {
    const bytes = readFileSync(`${H.MIG}/${file}`);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
  });
});
