/**
 * #2260 acceptance, no database. Spec r2 (comment 6386169035, edited in place
 * with addendum 6407195511): criteria 17-20. The opt-in base-version and
 * diff-scope checks were retired by #2706 (diff scope belongs in review).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { existsSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";

const ver = (f: string) => f.slice(0, 14);
const forward = (fs: string[]) => fs.filter((f) => /^\d{14}_.+\.sql$/.test(f));
const sql = () => {
  expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
  return H.code(H.read(H.MIGRATION));
};
/** Criterion 20 doc rules, " ~ "-separated regexes. */
const DOC_RULES = String.raw`anon ~ authenticated ~ service_role ~ SELECT, INSERT, UPDATE ~ auth\.uid\(\) ~ authz\.current_tenant_id\(\) ~ cross[- ]tenant ~ default (privileges|grants) ~ DELETE ~ #2251 ~ #668 ~ Down`;

describe("#2260 static (17-20)", () => {
  it(`17: ${H.MIGRATION_NAME} is the only *_donor_feed_preferences_own_rows.sql, version unique and > ${H.DEVELOP_LATEST}`, () => {
    sql();
    const all = forward(readdirSync(H.MIG));
    expect(
      all.filter((f) =>
        /^\d{14}_donor_feed_preferences_own_rows\.sql$/.test(f),
      ),
    ).toEqual([H.MIGRATION_NAME]);
    expect(ver(H.MIGRATION_NAME) > H.DEVELOP_LATEST).toBe(true);
    expect(all.filter((f) => ver(f) === ver(H.MIGRATION_NAME))).toHaveLength(1);
  });
  it("17: -- Down: header, REVOKE ALL, #2251 precondition; no current_tenant_id, publication or DELETE grant", () => {
    sql();
    expect(H.read(H.MIGRATION)).toMatch(/^-- Down:/);
    const body = sql();
    expect(body).toMatch(
      /REVOKE\s+ALL\s+ON\s+(TABLE\s+)?public\.donor_feed_preferences\s+FROM\s+PUBLIC\s*,\s*anon\s*,\s*authenticated\s*;/i,
    );
    expect(body).toMatch(/relforcerowsecurity/i);
    expect(body).toMatch(/RAISE[\s\S]*#2251/i);
    expect(body).not.toMatch(
      /FUNCTION\s+authz\.current_tenant_id\s*\(|ALTER\s+PUBLICATION/i,
    );
    for (const g of body.match(/\bGRANT\b[^;]*;/gi) ?? [])
      expect(g).not.toMatch(/\b(DELETE|ALL|TRUNCATE)\b/i);
  });
  it("18: the exceptions list never names #2260's own table (D-18: AL-2671 ruling-pin-tax Q2)", () => {
    const raw = H.read(H.EXCEPTIONS);
    const lines = raw
      .split("\n")
      .filter((l) => l.includes('"table"'))
      .map((l) => l.trim().replace(/,$/, ""));
    const tables = lines.map((l) => (JSON.parse(l) as { table: string }).table);
    expect(tables).not.toContain(H.TABLE);
  });
  // Rewritten by the WP2a sweep (AL-2675; plan 5.4 NX-03, WP2 exit "no route
  // reads the token claim"): the route took its tenant from the token's
  // app_metadata claim; it now takes the request's resolved donor
  // assignment's, and reads no claim at all.
  it(`19: ${H.ROUTE}: no default/literal tenant, email lookup or admin client; tenant from the resolved assignment, no claim (D-18: AL-2671 ruling-pin-tax Q2)`, () => {
    const src = H.read(H.ROUTE);
    expect(src).toMatch(/\bgetAuthContext\(request\)/);
    expect(src).toMatch(/auth\.isAuthenticated \? auth\.tenantId : null/);
    expect(src).not.toMatch(/app_metadata|user_metadata|getClaims\(/);
    expect(src).not.toMatch(
      /DEFAULT_TENANT_ID|00000000-0000-0000-0000-000000000001|\.eq\(\s*["'`]email["'`]|\b(get|create)AdminClient\s*\(/,
    );
    const imports = src.match(/^import\b[^;]*;/gm) ?? [];
    expect(imports.filter((i) => /admin|service[-_]?role/i.test(i))).toEqual(
      [],
    );
    if (!existsSync(H.ALLOWLIST)) return;
    const a = (
      JSON.parse(H.read(H.ALLOWLIST)) as {
        entries: { file: string; follow_up: string }[];
      }
    ).entries;
    expect(a.map((x) => x.file)).not.toContain(H.ROUTE);
  });
  it.each(DOC_RULES.split(" ~ "))(`20: ${H.DOC} matches /%s/i`, (re) =>
    expect(H.read(H.DOC)).toMatch(new RegExp(re, "i")),
  );
});
