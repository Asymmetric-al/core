/**
 * #2255 static acceptance (spec r2 §4, the (S) parts of criteria 6, 8, 9, 15,
 * 16, plus §1 migration discipline and In 5). Reads files only. Owned by
 * Acceptance; implementers must not edit.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  AFTER_STEPS,
  CI_STEP,
  CLAIMS,
  DOC,
  INVITES,
  MIGRATION,
  POLICIES,
  ROLLBACK,
  TABLES,
  code,
  sqlFile,
} from "./harness";
import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const DIR = path.dirname(MIGRATION);
const OWN = path.basename(MIGRATION);
const statements = (sql: string) =>
  code(sql)
    .replace(/'(?:[^']|'')*'/g, "''")
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
const TARGET = String.raw`(?:public\.)?"?(${TABLES.join("|")})"?`;
/** Statement 2's form after statements() blanks its literal (rulings (a)/(b)). */
const LT_STMT = /^SET LOCAL lock_timeout (?:=|TO) ''$/i;
/** Rulings (a)/(b): statement 2 is the file's only SET, `SET LOCAL lock_timeout = '<n>ms'|'<n>s'` (raw text, literal kept), 1s to 10s. */
function expectLockTimeout(sql: string) {
  const st = statements(sql);
  expect(
    st.filter((s) => /^SET\b/i.test(s)),
    "exactly one SET",
  ).toHaveLength(1);
  expect(st[1], "statement 2").toMatch(LT_STMT);
  const m =
    /^\s*BEGIN\s*;\s*SET\s+LOCAL\s+lock_timeout(?:\s*=\s*|\s+TO\s+)'(\d+)(ms|s)'\s*;/i.exec(
      code(sql),
    );
  expect(m, "BEGIN; SET LOCAL lock_timeout = '<n>ms'|'<n>s';").not.toBeNull();
  expect(m![2], "unit is lower case, as Postgres requires").toMatch(/^(ms|s)$/);
  const ms = Number(m![1]) * (m![2] === "s" ? 1000 : 1);
  expect(ms, "lock_timeout ms").toBeGreaterThanOrEqual(1000);
  expect(ms, "lock_timeout ms").toBeLessThanOrEqual(10000);
}

describe("#2255 forward migration text", () => {
  it(`${MIGRATION} exists, is BEGIN; ... COMMIT; and its version is unique and after #2254`, () => {
    const st = statements(sqlFile(MIGRATION));
    expect(st[0]).toBe("BEGIN");
    expect(st.at(-1)).toBe("COMMIT");
    expect(st.filter((s) => /^(BEGIN|COMMIT)$/i.test(s))).toHaveLength(2);
    const version = OWN.slice(0, 14);
    expect(OWN).toMatch(/^\d{14}_account_claim_and_invitation_tables\.sql$/);
    expect(readdirSync(DIR).filter((f) => f.startsWith(`${version}_`))).toEqual(
      [OWN],
    );
    expect(
      OWN > "20261024141000_begin_donation_saga_donor_conflict_reuse.sql",
    ).toBe(true);
  });

  it("rulings (a)/(b): statement 2 is the file's only SET: SET LOCAL lock_timeout = '<n>ms'|'<n>s', 1s to 10s", () => {
    expectLockTimeout(sqlFile(MIGRATION));
  });

  it("6/§1: TEXT + CHECK only: no CREATE TYPE or DOMAIN; brand-new tables need no NOT VALID", () => {
    const sql = code(sqlFile(MIGRATION));
    expect(sql).not.toMatch(/\bCREATE\s+(TYPE|DOMAIN)\b/i);
    expect(sql).not.toMatch(/\bNOT\s+VALID\b/i);
    expect(sql).not.toMatch(/\bCONCURRENTLY\b/i);
  });

  it("8: no lower( applied to an email", () => {
    expect(code(sqlFile(MIGRATION))).not.toMatch(
      /\blower\s*\(\s*[\w."]*email/i,
    );
  });

  it("§1 idempotence: CREATE TABLE/INDEX IF NOT EXISTS; each CREATE POLICY preceded by its DROP POLICY IF EXISTS", () => {
    const st = statements(sqlFile(MIGRATION));
    for (const s of st.filter((x) =>
      /^CREATE (UNIQUE )?(TABLE|INDEX)\b/i.test(x),
    ))
      expect(s).toMatch(/^CREATE (UNIQUE )?(TABLE|INDEX) IF NOT EXISTS /i);
    for (const [t, n] of POLICIES) {
      const c = st.findIndex((s) =>
        new RegExp(`^CREATE POLICY "?${n}"? ON ${TARGET}`, "i").test(s),
      );
      const d = st.findIndex((s) =>
        new RegExp(
          `^DROP POLICY IF EXISTS "?${n}"? ON (?:public\\.)?"?${t}"?$`,
          "i",
        ).test(s),
      );
      expect(c, `CREATE POLICY ${n}`).toBeGreaterThan(-1);
      expect(d, `DROP POLICY IF EXISTS ${n} ON ${t} before it`).toBeGreaterThan(
        -1,
      );
      expect(d).toBeLessThan(c);
    }
  });

  it("4/§1: each table REVOKEs ALL from PUBLIC, anon, authenticated before any GRANT; never grants anon or PUBLIC", () => {
    const st = statements(sqlFile(MIGRATION));
    for (const t of TABLES) {
      const on = new RegExp(
        `\\bON (TABLE )?([\\w."]+, )*(public\\.)?"?${t}"?\\b`,
        "i",
      );
      const rev = st.findIndex(
        (s) =>
          /^REVOKE ALL( PRIVILEGES)? ON /i.test(s) &&
          on.test(s) &&
          /FROM PUBLIC, anon, authenticated$/i.test(s),
      );
      const grants = st
        .map((s, i) => [s, i] as const)
        .filter(([s]) => /^GRANT /i.test(s) && on.test(s));
      expect(
        rev,
        `${t}: REVOKE ALL ... FROM PUBLIC, anon, authenticated`,
      ).toBeGreaterThan(-1);
      expect(grants.length, `${t}: GRANTs`).toBeGreaterThan(0);
      for (const [s, i] of grants) {
        expect(i, s).toBeGreaterThan(rev);
        expect(s).not.toMatch(/\bTO\b.*\b(anon|PUBLIC)\b/i);
      }
    }
  });

  it("§3: touches only its two tables: no other table, function, default privilege or owner change; the only SET is statement 2's lock_timeout", () => {
    const sql = code(sqlFile(MIGRATION));
    expect(sql).not.toMatch(
      /\bALTER\s+DEFAULT\s+PRIVILEGES\b|\bOWNER\s+TO\b|\bCREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE|TRIGGER|VIEW|SCHEMA|ROLE)\b/i,
    );
    for (const [i, s] of statements(sql).entries()) {
      const m =
        /^(?:ALTER TABLE(?: IF EXISTS)?(?: ONLY)?|CREATE (?:UNIQUE )?INDEX IF NOT EXISTS \S+ ON|CREATE TABLE IF NOT EXISTS|(?:DROP|CREATE) POLICY(?: IF EXISTS)? \S+ ON|COMMENT ON (?:TABLE|COLUMN)) ([\w."]+)/i.exec(
          s,
        );
      if (m)
        expect(
          m[1]!
            .replace(/"/g, "")
            .replace(/^public\./, "")
            .split(".")[0],
          s,
        ).toMatch(new RegExp(`^(${TABLES.join("|")})$`));
      else if (!(i === 1 && LT_STMT.test(s)))
        expect(s, "unexpected statement kind").toMatch(
          /^(BEGIN|COMMIT|REVOKE|GRANT)\b/i,
        );
    }
  });

  it("9: COMMENT ON COLUMN legacy_account_invitations.link_token_sha256 states the never-raw rule", () => {
    const c = new RegExp(
      `COMMENT ON COLUMN (public\\.)?"?${INVITES}"?\\."?link_token_sha256"?\\s+IS\\s+'((?:[^']|'')*)'`,
      "i",
    ).exec(code(sqlFile(MIGRATION)))?.[2];
    expect(c).toBeDefined();
    expect(c).toMatch(/never/i);
    expect(c).toMatch(/raw/i);
  });

  it("no other forward migration creates or alters these tables (redefinition scan, all forward files)", () => {
    const re = new RegExp(`\\b(${TABLES.join("|")})\\b`, "i");
    const hits = readdirSync(DIR)
      .filter((f) => /^\d{14}_.*\.sql$/.test(f) && f !== OWN)
      .filter((f) => re.test(code(readFileSync(path.join(DIR, f), "utf8"))));
    expect(hits).toEqual([]);
  });
});

describe("#2255 rollback", () => {
  it(`In 5: ${ROLLBACK} drops both tables and nothing else; the forward runner skips it`, () => {
    const st = statements(sqlFile(ROLLBACK)).filter(
      (s) => !/^(BEGIN|COMMIT)$/i.test(s),
    );
    const dropped = st.map((s) => {
      const m = /^DROP TABLE (?:IF EXISTS )?([\w.", ]+?)(?: RESTRICT)?$/i.exec(
        s,
      );
      expect(m, `only DROP TABLE statements (no CASCADE): ${s}`).not.toBeNull();
      return m![1]!.split(",").map((x) =>
        x
          .trim()
          .replace(/"/g, "")
          .replace(/^public\./, ""),
      );
    });
    expect(dropped.flat().sort()).toEqual([...TABLES].sort());
    expect(/^\d{14}_/.test(path.basename(ROLLBACK))).toBe(false);
  });
});

describe("#2255 consumers and docs", () => {
  it("15: no code in apps/, packages/, scripts/, tooling/ names either table; database.ts byte-unchanged", () => {
    const files = execFileSync(
      "git",
      ["ls-files", "-z", "apps", "packages", "scripts", "tooling"],
      { encoding: "utf8" },
    )
      .split("\0")
      .filter(Boolean);
    const re = new RegExp(`${CLAIMS}|${INVITES}`);
    expect(files.filter((f) => re.test(readFileSync(f, "utf8")))).toEqual([]);
    expect(
      createHash("sha256")
        .update(readFileSync("packages/database/types/database.ts"))
        .digest("hex"),
    ).toBe("03e9e030ec511a62d96f2461e822fe4185ca42ec56d0182964f6e26b54466934");
  });

  it(`16: ${DOC} covers both tables, columns, access matrix, Q15, Q16, writers and rollback order`, () => {
    const doc = sqlFile(DOC);
    for (const t of TABLES) expect(doc).toContain(t);
    for (const c of [
      "donor_id",
      "email_normalized",
      "requested_by",
      "resolved_by",
      "invited_by",
      "link_token_sha256",
      "link_token_expires_at",
      "expires_at",
      "status",
    ])
      expect(doc, `column ${c}`).toContain(c);
    for (const r of [
      /\banon\b/,
      /\bauthenticated\b/,
      /\bservice_role\b/,
      /has_staff_membership/,
    ])
      expect(doc, `access matrix ${r}`).toMatch(r);
    expect(doc, "Q15").toMatch(/auth\.uid\(\)/);
    expect(doc, "Q16 hash").toMatch(/SHA-256/i);
    expect(doc, "Q16 never raw").toMatch(/never[^.]*raw|raw[^.]*never/i);
    expect(doc, "S3 hashed_token").toMatch(/hashed_token/);
    expect(doc, "writers").toMatch(/#509/);
    expect(doc, "writers").toMatch(/#510/);
    expect(doc, "rollback file").toContain(path.basename(ROLLBACK));
    expect(doc, "rollback before #2254").toMatch(/#2254/);
    for (const s of ["42501", "23514"])
      expect(doc, `contract ${s}`).toContain(s);
  });
});

describe("#2255 CI step (Samson's ruling: own migrate step, relative order only)", () => {
  it("ci-integration.yml migrate has exactly one 'Verify claim tables (real stack)' step, with exactly this env and run, after #2250's and #2270's real-stack steps", () => {
    const steps =
      workflowJobs(loadWorkflowDocument(".github/workflows/ci-integration.yml"))
        .migrate?.steps ?? [];
    const idx = (n: string) => steps.findIndex((s) => s.name === n);
    expect(steps.filter((s) => s.name === CI_STEP.name)).toHaveLength(1);
    const i = idx(CI_STEP.name);
    expect(steps[i]).toEqual(CI_STEP);
    for (const name of AFTER_STEPS) {
      expect(idx(name), `${name} present`).toBeGreaterThanOrEqual(0);
      expect(i, `after ${name}`).toBeGreaterThan(idx(name));
    }
  });
});
