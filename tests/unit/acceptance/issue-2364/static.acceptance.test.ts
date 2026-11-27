/** #2364 [A][S] criteria 8-10, §6/7 and H1. Runtime criteria live alongside. */
import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { expectRealstackStep } from "../shared/realstack-step";

const REGISTRY = "packages/database/collections/registry.ts";
const DOC = "docs/guides/architecture/data-access-boundary.md";
const sql = () => {
  expect(H.read(H.FORWARD), H.FORWARD).not.toBe("");
  return H.code(H.read(H.FORWARD));
};
describe("#2364 static [A][S]", () => {
  it("#2364 criterion 8: reserved migration is unique, later than corrected #2312 version (H1), forward-fix only", () => {
    sql();
    const files = readdirSync(H.MIG);
    expect(
      files.filter((f) =>
        /^\d{14}_missionaries_server_only_reads\.sql$/.test(f),
      ),
    ).toEqual([H.NAME]);
    expect(files.filter((f) => f.startsWith(H.NAME.slice(0, 14)))).toEqual([
      H.NAME,
    ]);
    expect(H.NAME.slice(0, 14) > "20261025120800").toBe(true);
    expect(H.read(`${H.MIG}/rollback_${H.NAME}`)).toBe("");
    expect(H.read(H.FORWARD)).toMatch(/^--\s*Down:.*forward[- ]fix.*only/im);
  });
  it("#2364 criterion 8: all four named policy drops use IF EXISTS and authenticated gets exactly id/profile_id SELECT", () => {
    const text = sql();
    for (const name of [
      "tanstack browser read",
      "public read",
      "tenant scoped read",
      H.OWN,
    ])
      expect(text).toMatch(
        new RegExp(
          `DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"${name}"\\s+ON\\s+public\\.missionaries\\s*;`,
          "i",
        ),
      );
    expect(text).not.toMatch(/\bDROP\s+POLICY\b(?!\s+IF\s+EXISTS\b)/i);
    const revoke = text.match(
      /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+(?:TABLE\s+)?public\.missionaries\s+FROM\s+([^;]+);/i,
    );
    expect(
      revoke?.[1]
        ?.toLowerCase()
        .split(",")
        .map((r) => r.trim())
        .sort(),
    ).toEqual(["anon", "authenticated", "public"]);
    const grants = [
      ...text.matchAll(
        /GRANT\s+SELECT\s*\(([^)]+)\)\s+ON\s+(?:TABLE\s+)?public\.missionaries\s+TO\s+authenticated\s*;/gi,
      ),
    ];
    expect(grants).toHaveLength(1);
    expect(
      grants[0]?.[1]
        ?.split(",")
        .map((s) => s.trim().replaceAll('"', ""))
        .sort(),
    ).toEqual([...H.KEYS].sort());
  });
  it("#2364 criterion 8: one transaction, pre/post asserts, own policy and enabled RLS; no forbidden statements", () => {
    const text = sql();
    const top = text.replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, " ").trim();
    expect(top).toMatch(/^BEGIN\s*;/i);
    expect(top).toMatch(/COMMIT\s*;$/i);
    expect(top.match(/\bBEGIN\s*;/gi)).toHaveLength(1);
    expect(top.match(/\bCOMMIT\s*;/gi)).toHaveLength(1);
    expect(
      text.match(/RAISE\s+EXCEPTION/gi)?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    expect(text).toMatch(/relrowsecurity/i);
    expect(text).toMatch(/to_regclass|pg_class/i);
    for (const role of ["anon", "authenticated", "service_role"])
      expect(text).toMatch(
        new RegExp(`has_table_privilege\\s*\\(\\s*'${role}'`, "i"),
      );
    expect(text).toMatch(/pg_policies/i);
    expect(text).toMatch(
      /ALTER\s+TABLE\s+public\.missionaries\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
    );
    expect(text).toMatch(
      /CREATE\s+POLICY\s+"missionaries own row key read"[\s\S]*?FOR\s+SELECT\s+TO\s+authenticated[\s\S]*?USING/i,
    );
    for (const pattern of [
      /GRANT[^;]*\bTO\b[^;]*\banon\b/i,
      /\bTO\s+public\b/i,
      /USING\s*\(\s*true\s*\)/i,
      /\b(?:GRANT|REVOKE)[^;]*\bservice_role\b/i,
      /ALTER\s+PUBLICATION/i,
      /\bperson_id\b/i,
    ])
      expect(text).not.toMatch(pattern);
    // §1.1 says unforced. NO FORCE may be needed because #2251/#2312 now
    // force it; reject forcing, while preserving the approved target state.
    expect(text.replace(/\bNO\s+FORCE\b/gi, "")).not.toMatch(/\bFORCE\b/i);
  });
  it("#2364 criterion 9 (D-18, AL-2681 PR 2b: the legacy GET config of /api/donate retires with its route, and its suite with it; checkout reads /api/checkout/config): the donate route mounts only the guest intake's POST", () => {
    expect(H.read("apps/donor/app/api/donate/route.ts").trim()).toBe(
      'export { POST } from "@asym/api/donate/guest/intake-route";',
    );
  });
  it("#2364 criterion 10: the missionaries registry entry stays read-only and docs explain service-role missionaries reads/config-only GET", () => {
    const entry =
      H.read(REGISTRY).match(
        /supabaseEntry\("missionariesCollection"[\s\S]*?\n  \}\),/,
      )?.[0] ?? "";
    expect(entry).toContain('rls: "demo-review-required"');
    expect(entry).toContain('mutationPolicy: "read-only"');
    expect(entry).toMatch(/notes:[\s\S]*server[\s\S]*routes?/i);
    const doc = H.read(DOC);
    expect(doc).toMatch(/missionaries reads/i);
    expect(doc).toMatch(/server.only/i);
    expect(doc).toMatch(/service.role/i);
    expect(doc).toMatch(/\/api\/missionaries/);
    expect(doc).toMatch(/GraphQL/i);
    expect(doc).toMatch(/\/api\/donate[\s\S]*(?:config|publishableKey)/);
  });
  // #2706: the real-stack file skips cleanly without an admin URL, so CI must
  // run it with one. This replaces the retired exact run string in #2250.
  it("#2364 [A][R] criteria 1-4, 11-14 run in CI: a blocking migrate step runs the real-stack file against the migrated database", () => {
    expectRealstackStep(
      "Verify tenant isolation (real stack)",
      [
        "tests/unit/acceptance/issue-2364/missionaries-reads.realstack.acceptance.test.ts",
      ],
      { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
    );
  });
});
