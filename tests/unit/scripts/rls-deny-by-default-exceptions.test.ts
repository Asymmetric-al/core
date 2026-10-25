/**
 * #2251: shape of docs/security/rls-deny-by-default-exceptions.json, the
 * reviewed list of public tenant tables that stay deny-by-default (ENABLE +
 * FORCE RLS, zero policies). No database: the catalog side is checked by
 * tests/unit/acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const LIST = "docs/security/rls-deny-by-default-exceptions.json";
const MIGRATIONS = path.join(root, "supabase/migrations");

type Entry = {
  table: string;
  outcome: string;
  reason: string;
  code_paths: string[];
  reviewed_by: string;
};

const raw = readFileSync(path.join(root, LIST), "utf8");
const doc = JSON.parse(raw) as {
  version: number;
  ruling: string;
  entries: Entry[];
};
const migrationSql = readdirSync(MIGRATIONS)
  .filter((f) => /^\d{14}_.+\.sql$/.test(f))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
/** `path/to/file.ts:123` -> [file, line]; null when it is not a file reference. */
const fileRef = (p: string) => {
  const m = /^([\w./-]+\.\w+):(\d+)$/.exec(p);
  return m ? ([m[1]!, Number(m[2])] as const) : null;
};
const DEFINER = /^(\w+)\.(\w+) \(SECURITY DEFINER, owner postgres\)$/;

describe(LIST, () => {
  it("has version 1, the Q5 + clash 2 ruling and at least the 86 reviewed entries", () => {
    expect(Object.keys(doc)).toEqual(["version", "ruling", "entries"]);
    expect(doc.version).toBe(1);
    expect(doc.ruling).toBe("Samson Q5 + clash 2, Oct 24, 2026");
    expect(doc.entries.length).toBeGreaterThanOrEqual(86);
  });

  it("keeps one entry per line, sorted by table and unique", () => {
    const lines = raw.split("\n").filter((l) => l.includes('"table"'));
    expect(lines.length).toBe(doc.entries.length);
    lines.forEach((l, i) =>
      expect(JSON.parse(l.trim().replace(/,$/, ""))).toEqual(doc.entries[i]),
    );
    const tables = doc.entries.map((e) => e.table);
    expect(tables).toEqual([...tables].sort());
    expect(new Set(tables).size).toBe(tables.length);
  });

  it("gives every entry exactly the reviewed shape", () => {
    for (const e of doc.entries) {
      expect(Object.keys(e), e.table).toEqual([
        "table",
        "outcome",
        "reason",
        "code_paths",
        "reviewed_by",
      ]);
      expect(e.table, e.table).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(["service_role_needed", "deny_by_default"], e.table).toContain(
        e.outcome,
      );
      expect(e.reason.trim().length, e.table).toBeGreaterThan(20);
      expect(e.reviewed_by, e.table).toMatch(
        /^Samson \(factory lead\), \d{4}-\d{2}-\d{2}$/,
      );
      expect(e.code_paths.length, e.table).toBeGreaterThan(0);
      expect(new Set(e.code_paths).size, e.table).toBe(e.code_paths.length);
    }
  });

  it("names only tables that a forward migration creates", () => {
    const missing = doc.entries
      .map((e) => e.table)
      .filter(
        (t) =>
          !new RegExp(
            `CREATE TABLE (IF NOT EXISTS )?(public\\.)?"?${t}"?[\\s(]`,
            "i",
          ).test(migrationSql),
      );
    expect(missing).toEqual([]);
  });

  // Files must name the table; the line is a pointer and is not pinned, so
  // unrelated edits to those files do not fail this test.
  it("points each service_role_needed code path at an existing file line in a file that names the table", () => {
    const bad: string[] = [];
    for (const e of doc.entries.filter(
      (x) => x.outcome === "service_role_needed",
    ))
      for (const p of e.code_paths) {
        const ref = fileRef(p);
        const text =
          ref && existsSync(path.join(root, ref[0])) ? read(ref[0]) : "";
        if (
          !ref ||
          !text.includes(`"${e.table}"`) ||
          ref[1] > text.split("\n").length
        )
          bad.push(`${e.table}: ${p}`);
      }
    expect(bad).toEqual([]);
  });

  it('names a deny_by_default reach as "none", an existing script line, or a migration-defined DEFINER function', () => {
    const bad: string[] = [];
    for (const e of doc.entries.filter((x) => x.outcome === "deny_by_default"))
      for (const p of e.code_paths) {
        const ref = fileRef(p);
        const definer = DEFINER.exec(p);
        const ok =
          p === "none"
            ? e.code_paths.length === 1
            : ref
              ? existsSync(path.join(root, ref[0])) &&
                read(ref[0]).includes(e.table)
              : definer
                ? new RegExp(
                    `FUNCTION\\s+${definer[1]}\\.${definer[2]}\\s*\\(`,
                    "i",
                  ).test(migrationSql)
                : false;
        if (!ok) bad.push(`${e.table}: ${p}`);
      }
    expect(bad).toEqual([]);
  });
});
