/**
 * #2252 acceptance, no database (runs in the normal unit run). Spec r2
 * (approved by Samson Oct 24, 2026): criteria 7, 9, 10, 12.1, the §3
 * append-only pins and the pure evaluator cases of criterion 5/6/12.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  CHECK_DEF,
  DOC,
  FOLLOW_UPS,
  MIGRATION,
  NEW_CHECK,
  NEW_FK,
  OLD_FK,
  PREFLIGHT_QUERY,
  ROLLBACK,
  SECTION,
  SPINE,
  body,
  code,
  evaluate,
  read,
  type FkRow,
} from "./harness";

const MIG = "supabase/migrations";
const ws = (s: string) => s.replace(/\s+/g, " ").trim();
/** Executable statements, whitespace-normalized (dollar-quoted bodies kept inline). */
const stmts = (sql: string) => ws(code(sql));
/** Index of the first match of `re` in the normalized executable text, or -1. */
const at = (s: string, re: RegExp) => s.search(re);
const fwd = () => stmts(read(MIGRATION));
const back = () => stmts(read(ROLLBACK));
const addRe = (n: string) => new RegExp(`ADD CONSTRAINT "?${n}"?\\b`, "i");
const valRe = (n: string) => new RegExp(`VALIDATE CONSTRAINT "?${n}"?\\b`, "i");
const DROP_OLD = new RegExp(`DROP CONSTRAINT IF EXISTS "?${OLD_FK}"?\\b`, "i");
const dropRe = (n: string) =>
  new RegExp(`DROP CONSTRAINT (IF EXISTS )?"?${n}"?\\b`, "i");
/** Every ADD CONSTRAINT <n> sits behind IF NOT EXISTS (… pg_constraint … conname = '<n>' … conrelid = 'public.donations'::regclass …). */
function guarded(s: string, n: string) {
  const i = at(s, addRe(n));
  const guard = s.slice(
    s.slice(0, i).search(/IF NOT EXISTS(?![\s\S]*IF NOT EXISTS)/i),
    i,
  );
  return (
    i > 0 &&
    /pg_constraint/i.test(guard) &&
    new RegExp(`conname = '${n}'`, "i").test(guard) &&
    /conrelid = 'public\.donations'::regclass/i.test(guard)
  );
}
const between = (s: string, re: RegExp) => {
  const [b, c, i] = [at(s, /\bBEGIN ;/i), at(s, /\bCOMMIT ;/i), at(s, re)];
  return b >= 0 && b < i && i < c;
};

describe("#2252 C9 + 12.1: forward migration discipline", () => {
  it(`${MIGRATION} exists`, () =>
    expect(existsSync(MIGRATION), "spec §2 In 1 file name").toBe(true));
  it("BEGIN; is the first and COMMIT; the last statement, each exactly once; SET LOCAL lock_timeout = '5s' comes first", () => {
    const s = fwd().replace(/;/g, " ;");
    expect(() => body(MIGRATION)).not.toThrow();
    expect(s).toMatch(/^BEGIN ; SET LOCAL lock_timeout = '5s' ;/i);
    expect(s).toMatch(/\bCOMMIT ;$/i);
  });
  it("the preflight DO block comes before the first ALTER TABLE and raises 23503", () => {
    const s = fwd();
    const [d, a] = [at(s, /\bDO\s+\$/i), at(s, /\bALTER TABLE\b/i)];
    expect(d, "DO block").toBeGreaterThan(0);
    expect(d).toBeLessThan(a);
    expect(s.slice(d, a)).toMatch(/ERRCODE\s*=\s*'23503'/i);
    expect(s.slice(d, a)).toMatch(/preflight failed/);
  });
  it("both ADD CONSTRAINTs are NOT VALID and guarded by pg_constraint scoped to conrelid", () => {
    const s = fwd();
    for (const n of [NEW_CHECK, NEW_FK]) {
      const i = at(s, addRe(n));
      expect(i, `ADD CONSTRAINT ${n}`).toBeGreaterThan(0);
      expect(s.slice(i).split(";")[0], n).toMatch(/\bNOT VALID\s*$/i);
      expect(guarded(s, n), `${n} guard`).toBe(true);
    }
    expect(at(s, addRe(NEW_CHECK)), "CHECK first, then the FK").toBeLessThan(
      at(s, addRe(NEW_FK)),
    );
    expect((s.match(/ADD CONSTRAINT/gi) ?? []).length).toBe(2);
  });
  it("12.1: ADD, both VALIDATEs, then DROP CONSTRAINT IF EXISTS donations_donor_id_fkey, all inside the single BEGIN/COMMIT", () => {
    const s = fwd().replace(/;/g, " ;");
    const drop = at(s, DROP_OLD);
    expect(drop, "drops the old FK").toBeGreaterThan(0);
    for (const n of [NEW_CHECK, NEW_FK]) {
      expect(at(s, valRe(n)), `VALIDATE ${n}`).toBeGreaterThan(at(s, addRe(n)));
      expect(at(s, valRe(n))).toBeLessThan(drop);
    }
    for (const re of [addRe(NEW_FK), valRe(NEW_FK), DROP_OLD])
      expect(between(s, re), String(re)).toBe(true);
  });
  it("12.1: no other forward migration adds or drops a donations -> donors FK (all forward, rollback_* excluded)", () => {
    const own = MIGRATION.split("/").pop();
    const bad: string[] = [];
    for (const f of readdirSync(MIG).filter(
      (x) => /^\d{14}_.*\.sql$/.test(x) && x !== own,
    ))
      for (const st of code(read(`${MIG}/${f}`))
        .split(";")
        .map(ws))
        if (
          /^ALTER TABLE (IF EXISTS )?(ONLY )?("?public"?\.)?"?donations"? /i.test(
            st,
          ) &&
          (/REFERENCES ("?public"?\.)?"?donors"?\b/i.test(st) ||
            /CONSTRAINT (IF EXISTS )?"?donations_donor_\w*/i.test(st))
        )
          bad.push(`${f}: ${st.slice(0, 120)}`);
    expect(bad).toEqual([]);
  });
});

describe("#2252 C9 + 12.1: rollback discipline", () => {
  it(`${ROLLBACK} exists with one BEGIN; first and one COMMIT; last`, () => {
    expect(existsSync(ROLLBACK)).toBe(true);
    expect(() => body(ROLLBACK)).not.toThrow();
    expect(back().replace(/;/g, " ;")).toMatch(/^BEGIN ;[\s\S]*\bCOMMIT ;$/i);
  });
  it("re-adds donations_donor_id_fkey NOT VALID (guarded), validates it, then drops the composite FK and the CHECK", () => {
    const s = back().replace(/;/g, " ;");
    const add = at(s, addRe(OLD_FK));
    expect(add, `ADD ${OLD_FK}`).toBeGreaterThan(0);
    expect(s.slice(add).split(";")[0]).toMatch(
      /FOREIGN KEY \(donor_id\) REFERENCES (public\.)?donors ?\(id\) NOT VALID\s*$/i,
    );
    expect(guarded(s, OLD_FK), "guard").toBe(true);
    const val = at(s, valRe(OLD_FK));
    for (const n of [NEW_FK, NEW_CHECK]) {
      const d = at(s, dropRe(n));
      expect(d, `DROP ${n}`).toBeGreaterThan(add);
      expect(d, `VALIDATE before DROP ${n}`).toBeGreaterThan(val);
      expect(val).toBeGreaterThan(add);
      expect(between(s, dropRe(n))).toBe(true);
    }
    expect(between(s, addRe(OLD_FK))).toBe(true);
  });
});

describe("#2252 C10: no new objects or grants", () => {
  for (const f of [MIGRATION, ROLLBACK])
    it(`${f.split("/").pop()}: no CREATE <object>, GRANT, ALTER DEFAULT PRIVILEGES or OWNER TO`, () => {
      const s = code(read(f));
      expect(s.trim(), "file exists").not.toBe("");
      expect(s).not.toMatch(
        /\bCREATE\s+(OR\s+REPLACE\s+)?(TABLE|VIEW|FUNCTION|PROCEDURE|SEQUENCE|SCHEMA|ROLE|POLICY|TRIGGER)\b/i,
      );
      expect(s).not.toMatch(/\bGRANT\b/i);
      expect(s).not.toMatch(/ALTER\s+DEFAULT\s+PRIVILEGES/i);
      expect(s).not.toMatch(/\bOWNER\s+TO\b/i);
    });
});

/** The dedented lines from the one holding "SELECT d.id AS donation_id" to the one ending "ORDER BY d.id;". */
function queryBlock(lines: string[]) {
  const a = lines.findIndex((l) => l.includes("SELECT d.id AS donation_id"));
  const b = lines.findIndex((l, i) => i >= a && /ORDER BY d\.id;\s*$/.test(l));
  if (a < 0 || b < 0) return "";
  const block = lines.slice(a, b + 1);
  const pad = Math.min(...block.map((l) => l.match(/^ */)![0].length));
  return block.map((l) => l.slice(pad).trimEnd()).join("\n");
}

describe("#2252 C7: docs/security/tenant-guard.md `## Composite tenant FKs`", () => {
  const section = () => {
    const doc = read(DOC);
    const i = doc.split("\n").findIndex((l) => l.trim() === SECTION);
    if (i < 0) return "";
    const rest = doc.split("\n").slice(i + 1);
    const end = rest.findIndex((l) => /^## /.test(l));
    return rest.slice(0, end < 0 ? undefined : end).join("\n");
  };
  it("has the section, naming the 7 spine FKs and the 14 follow-ups", () => {
    const s = section();
    expect(s, SECTION).not.toBe("");
    for (const n of [...SPINE.map(([, x]) => x), ...FOLLOW_UPS])
      expect(s, n).toContain(n);
  });
  it("states the composite + CHECK rule and the deploy step", () => {
    const s = ws(section());
    expect(s).toMatch(
      /\(tenant_id, <?\w+>?\)\s*(→|->)\s*`?donors\s?\(tenant_id, id\)/,
    );
    expect(s).toMatch(/tenant_id NOT NULL/);
    expect(s).toMatch(/CHECK \(<?\w+>? IS NULL OR tenant_id IS NOT NULL\)/);
    expect(s).toMatch(/deploy/i);
  });
  it("the preflight query is byte-identical in a ```sql fence in the doc and in the migration header, and equals spec In 3", () => {
    const fence = /```sql\n([\s\S]*?)```/g;
    const docQ =
      [...section().matchAll(fence)]
        .map((m) => queryBlock(m[1]!.split("\n")))
        .find(Boolean) ?? "";
    const header = read(MIGRATION).split(/^\s*BEGIN\s*;\s*$/im)[0]!;
    const migQ = queryBlock(
      header
        .split("\n")
        .filter((l) => l.startsWith("--"))
        .map((l) => l.replace(/^--/, "")),
    );
    expect(docQ, "doc query").not.toBe("");
    expect(migQ, "migration header query").toBe(docQ);
    expect(ws(docQ)).toBe(ws(PREFLIGHT_QUERY));
  });
});

describe("#2252 §3: existing migrations are append-only", () => {
  it.each([
    [
      "20250101000000_init_schema.sql",
      "c5cc1775d6914b613730822d920f4ec3ba189cdb5e2f98fadb8981238e76635a",
    ],
    [
      "20260704140000_donor_matching_merge_candidates.sql",
      "e5c442e173834e4d39a280346eb449ab7bd6ddae1649e4f1009bf5f90f5e6412",
    ],
    [
      "rollback_20260704140000_donor_matching_merge_candidates.sql",
      "0feebe416860626142ef45cc7170bc258215dc95cfc01638599ebb27607290c7",
    ],
  ])("%s is unchanged", (f, h) =>
    expect(
      createHash("sha256")
        .update(read(`${MIG}/${f}`))
        .digest("hex"),
    ).toBe(h),
  );
});

describe("#2252 C5/C6/12: pure evaluator cases", () => {
  const fk = (
    name: string,
    table: string,
    cols: string[],
    over: Partial<FkRow> = {},
  ): FkRow => ({
    name,
    table,
    validated: true,
    cols,
    refTable: "donors",
    refCols: cols.length === 2 ? ["tenant_id", "id"] : ["id"],
    tenantNotNull: table !== "donations",
    checks: table === "donations" ? [CHECK_DEF] : [],
    ...over,
  });
  const colOf = (n: string) =>
    (/existing|incoming|merged|surviving/.exec(n)?.[0] ?? "donor") +
    "_donor_id";
  const good = (): FkRow[] => [
    ...SPINE.map(([t, n]) =>
      fk(n, t, ["tenant_id", t === "donations" ? "donor_id" : colOf(n)]),
    ),
    ...FOLLOW_UPS.map((n) =>
      fk(n, n.replace(/_(recipient_|creator_)?donor_id_fkey$/, ""), [
        "donor_id",
      ]),
    ),
  ];
  const swap = (n: string, f: (r: FkRow) => FkRow | null) =>
    good().flatMap((r) => (r.name === n ? (f(r) ? [f(r)!] : []) : [r]));
  it("a well-formed catalog has no problems", () =>
    expect(evaluate(good())).toEqual([]));
  it.each(SPINE.map(([, n]) => n))(
    "%s: missing / single-column / NOT VALID / wrong target are each named",
    (n) => {
      expect(evaluate(swap(n, () => null))).toContain(`${n}: missing`);
      expect(
        evaluate(
          swap(n, (r) => ({ ...r, cols: [r.cols[1]!], refCols: ["id"] })),
        ).join(),
      ).toContain(`${n}: not composite`);
      expect(evaluate(swap(n, (r) => ({ ...r, validated: false })))).toContain(
        `${n}: NOT VALID`,
      );
      expect(
        evaluate(swap(n, (r) => ({ ...r, refTable: "profiles" }))).join(),
      ).toContain(`${n}: does not reference donors(tenant_id, id)`);
    },
  );
  it("donations FK without the CHECK and with a nullable tenant_id is not tenant-complete", () => {
    expect(
      evaluate(swap(NEW_FK, (r) => ({ ...r, checks: [] }))).join(),
    ).toContain(`${NEW_FK}: not tenant-complete`);
    expect(
      evaluate(
        swap(NEW_FK, (r) => ({ ...r, checks: [], tenantNotNull: true })),
      ),
    ).toEqual([]);
  });
  it("ratchet: new single-column reference; stale follow-up (composite or gone); new composite reference is allowed", () => {
    expect(
      evaluate([
        ...good(),
        fk("t2252_probe", "donor_activities", ["donor_id"]),
      ]),
    ).toEqual(["t2252_probe: new single-column donor reference"]);
    expect(
      evaluate([
        ...good(),
        fk("x_same_tenant_fk", "x", ["tenant_id", "donor_id"]),
      ]),
    ).toEqual([]);
    const s = "staged_gifts_donor_id_fkey";
    expect(
      evaluate(
        swap(s, (r) => ({
          ...r,
          cols: ["tenant_id", "donor_id"],
          refCols: ["tenant_id", "id"],
        })),
      ),
    ).toEqual([`${s}: stale entry: remove it from the follow-up list`]);
    expect(evaluate(swap(s, () => null))).toEqual([
      `${s}: stale entry: remove it from the follow-up list`,
    ]);
  });
  it("12.3: a second donations -> donors FK is an ambiguous embed naming both", () => {
    const p = evaluate([
      ...good(),
      fk(OLD_FK, "donations", ["donor_id"]),
    ]).filter((x) => x.includes("PGRST201"));
    expect(p).toHaveLength(1);
    expect(p[0]).toContain(OLD_FK);
    expect(p[0]).toContain(NEW_FK);
  });
});
