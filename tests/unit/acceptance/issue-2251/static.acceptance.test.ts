/**
 * #2251 acceptance, no database (runs in the normal acceptance run). Spec r2
 * (issue comment 6392690952, approved by Samson in 6392694469): §5 In 1 shape,
 * In 2 exception list against §3, In 3 doc (criterion 7). Criteria 1-4 and 6
 * on the real catalog live in rls-posture.realstack.acceptance.test.ts.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { existsSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  D,
  DOC,
  EXCEPTIONS,
  F,
  MIGRATION,
  RLS_OFF,
  RULING,
  S,
  TENANT_GUARD_MIGRATION,
  code,
  codePathFile,
  exceptions,
  read,
  reviewedByProblem,
} from "./harness";

const MIG = "supabase/migrations";
const FILE = MIGRATION.slice(MIG.length + 1);
const VERSION = FILE.slice(0, 14);
const forward = () =>
  readdirSync(MIG)
    .filter((f) => /^\d{14}_.*\.sql$/.test(f))
    .sort();

describe("#2251 In 1: the migration, by exact file name", () => {
  const sql = () => read(MIGRATION);
  const exec = () => code(sql());

  it(`${MIGRATION} exists`, () =>
    expect(existsSync(MIGRATION), "spec §5 In 1 file name").toBe(true));

  it("its version is unique and sorts after #2250's tenant_guard migration", () => {
    expect(existsSync(MIGRATION)).toBe(true);
    const all = readdirSync(MIG).filter((f) => f.includes(VERSION));
    expect(
      all,
      "no other file (forward or rollback_) reuses the version",
    ).toEqual([FILE]);
    expect(FILE > TENANT_GUARD_MIGRATION.slice(MIG.length + 1)).toBe(true);
  });

  it("has a -- Down: header: NO FORCE except crm_notes, DISABLE on exactly the 3 RLS-off tables", () => {
    const comments = (sql().match(/--[^\n]*/g) ?? []).join("\n");
    const down = comments.slice(comments.search(/--\s*Down:/i));
    expect(comments).toMatch(/--\s*Down:/i);
    expect(down).toMatch(/NO\s+FORCE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(down).toMatch(/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(down).toMatch(/crm_notes/);
    for (const t of RLS_OFF) expect(down, t).toContain(t);
  });

  it("ENABLEs and FORCEs RLS from a catalog loop keyed on tenant_id, with pre- and postconditions", () => {
    const body = exec();
    expect(body).toMatch(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(body).toMatch(/FORCE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(body).toMatch(/\bDO\b/i);
    expect(body).toMatch(/tenant_id/);
    expect(body).toMatch(/relkind/);
    for (const k of [
      "rolbypassrls",
      "rolsuper",
      "prosecdef",
      "relforcerowsecurity",
    ])
      expect(body, k).toContain(k);
    expect(
      body.match(/RAISE\s+EXCEPTION/gi)?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    expect(
      body.search(/rolbypassrls/),
      "precondition precedes every ALTER",
    ).toBeLessThan(body.search(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i));
  });

  it("changes nothing else: no policy, grant, owner, function, column, schema or row_security change", () => {
    const body = exec();
    expect(body).not.toBe("");
    for (const re of [
      /\b(CREATE|ALTER|DROP)\s+POLICY\b/i,
      /\bGRANT\s+[\w\s,]+\bON\b/i,
      /\bREVOKE\b[^;]*\bFROM\b/i,
      /\bOWNER\s+TO\b/i,
      /\b(CREATE|ALTER|DROP)\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE|TRIGGER|ROLE|SCHEMA)\b/i,
      /\b(ADD|DROP|ALTER)\s+COLUMN\b/i,
      /\brow_security\b/i,
      /\bNO\s+FORCE\b/i,
      /\bDISABLE\s+ROW\s+LEVEL\b/i,
    ])
      expect(body, String(re)).not.toMatch(re);
  });

  it("no later forward migration un-forces or disables RLS (rollback_* excluded)", () => {
    const later = forward().filter((f) => f > FILE);
    for (const f of later)
      expect(code(read(`${MIG}/${f}`)), f).not.toMatch(
        /\b(NO\s+FORCE|DISABLE)\s+ROW\s+LEVEL\s+SECURITY\b/i,
      );
  });
});

describe("#2251 In 2: docs/security/rls-deny-by-default-exceptions.json", () => {
  const raw = () => read(EXCEPTIONS);

  it("exists with version 1, the Q5 ruling, and one entry per line", () => {
    expect(existsSync(EXCEPTIONS)).toBe(true);
    const doc = JSON.parse(raw()) as Record<string, unknown>;
    expect(Object.keys(doc).sort()).toEqual(["entries", "ruling", "version"]);
    expect(doc.version).toBe(1);
    expect(doc.ruling).toBe(RULING);
    const lines = raw()
      .split("\n")
      .filter((l) => l.includes('"table"'));
    expect(lines.length).toBe(exceptions().length);
    for (const l of lines)
      expect(() => JSON.parse(l.trim().replace(/,$/, "")), l).not.toThrow();
  });

  it("entries are sorted by table, unique, exactly shaped, with a named, dated reviewer", () => {
    const e = exceptions();
    expect(e.length).toBeGreaterThan(0);
    const tables = e.map((x) => x.table);
    expect(tables).toEqual([...tables].sort());
    expect(new Set(tables).size).toBe(tables.length);
    for (const x of e) {
      expect(Object.keys(x).sort(), x.table).toEqual([
        "code_paths",
        "outcome",
        "reason",
        "reviewed_by",
        "table",
      ]);
      expect(["service_role_needed", "deny_by_default"], x.table).toContain(
        x.outcome,
      );
      expect(x.reason.trim(), x.table).not.toBe("");
      expect(reviewedByProblem(x.reviewed_by), x.table).toBeNull();
      expect(Array.isArray(x.code_paths), x.table).toBe(true);
      expect(
        x.code_paths.length,
        `${x.table} names its paths, definer, script or "none"`,
      ).toBeGreaterThan(0);
    }
  });

  it("every service_role_needed code path is an existing file", () => {
    const e = exceptions().filter((x) => x.outcome === "service_role_needed");
    expect(e.length).toBeGreaterThan(0);
    for (const x of e)
      for (const p of x.code_paths)
        expect(existsSync(codePathFile(p)), `${x.table}: ${p}`).toBe(true);
  });

  it("contains the 67 §3 S tables (with a §3 code path) and the 18 D tables, and no F table", () => {
    const by = new Map(exceptions().map((x) => [x.table, x]));
    const wrong: string[] = [];
    for (const [t, files] of Object.entries(S)) {
      const x = by.get(t);
      const got = new Set((x?.code_paths ?? []).map(codePathFile));
      if (x?.outcome !== "service_role_needed")
        wrong.push(`${t}: not service_role_needed`);
      else if (!files.some((f) => got.has(`packages/api/src/${f}`)))
        wrong.push(`${t}: no §3 code path (${files.join(", ")})`);
    }
    for (const t of D)
      if (by.get(t)?.outcome !== "deny_by_default")
        wrong.push(`${t}: not deny_by_default`);
    for (const t of F) if (by.has(t)) wrong.push(`${t}: F table listed`);
    expect(Object.keys(S).length + D.length + F.length).toBe(143);
    expect(wrong).toEqual([]);
  });
});

describe("#2251 In 3 / criterion 7: the doc section", () => {
  it(`${DOC} has "Tenant table RLS posture" naming the JSON, the rule, B1-B4 and the exception process`, () => {
    const doc = read(DOC);
    const at = doc.search(/^#+\s*Tenant table RLS posture\s*$/m);
    expect(at, "section heading").toBeGreaterThanOrEqual(0);
    const level = /^#+/.exec(doc.slice(at))![0].length;
    const rest = doc.slice(at).split("\n").slice(1).join("\n");
    const end = rest.search(new RegExp(`^#{1,${level}}\\s`, "m"));
    const section = end < 0 ? rest : rest.slice(0, end);
    for (const k of [
      EXCEPTIONS,
      "BYPASSRLS",
      "FORCE",
      "tenant_guard",
      "B1",
      "B2",
      "B3",
      "B4",
      "Samson",
    ])
      expect(section, k).toContain(k);
    expect(section).toMatch(/SECURITY DEFINER|DEFINER/);
  });
});
