/**
 * #2256 static acceptance (spec r2 §4, the (S) parts of criteria 6-9, 14 and
 * 16, plus the §1/§2 migration discipline and In 8). Reads files only. The
 * opt-in criterion 8 PR-diff check was retired by #2706. Owned by Acceptance;
 * implementers must not edit.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONSTRAINTS,
  DOC,
  FP,
  MIGRATION,
  POLICY,
  READER_APPS,
  READER_FUNCTIONS,
  READER_POLICIES,
  ROLLBACK,
  SEAMS,
  V2_MIGRATION,
  V3,
  code,
  profileQueryFilterHits,
  sqlFile,
  statements,
} from "./harness";

const DIR = path.dirname(MIGRATION);
const OWN = path.basename(MIGRATION);
const sha256 = (p: string) =>
  createHash("sha256").update(readFileSync(p)).digest("hex");
const lsFiles = (...dirs: string[]) =>
  execFileSync("git", ["ls-files", "-z", ...dirs], { encoding: "utf8" })
    .split("\0")
    .filter((f) => f && !f.includes("node_modules/"));
const APP_DIRS = ["apps", "packages", "scripts", "tooling"];
const SRC = /\.(ts|tsx|js|jsx|mjs|cjs|mts)$/;
const TEST = /(\.test\.|\.spec\.|\/tests?\/|__tests__)/;

describe("#2256 forward migration text", () => {
  it(`${MIGRATION} exists, is BEGIN; ... COMMIT;, its version is unique and sorts after #2254's; statement 2 is SET LOCAL lock_timeout = '5s'`, () => {
    const st = statements(sqlFile(MIGRATION));
    expect(st[0]).toBe("BEGIN");
    expect(st.at(-1)).toBe("COMMIT");
    expect(st.filter((s) => /^(BEGIN|COMMIT)$/i.test(s))).toHaveLength(2);
    expect(OWN).toMatch(/^\d{14}_person_anchor\.sql$/);
    const version = OWN.slice(0, 14);
    expect(readdirSync(DIR).filter((f) => f.startsWith(`${version}_`))).toEqual(
      [OWN],
    );
    expect(OWN > path.basename(V2_MIGRATION)).toBe(true);
    expect(code(sqlFile(MIGRATION)), "OQ10: statement 2").toMatch(
      /^\s*BEGIN\s*;\s*SET\s+LOCAL\s+lock_timeout\s*(=|TO)\s*'5s'\s*;/i,
    );
  });

  it("§1.1 access contract: REVOKE ALL ... FROM PUBLIC, anon, authenticated before any GRANT; no anon/PUBLIC grant; RLS ENABLE + FORCE; no publication", () => {
    const st = statements(sqlFile(MIGRATION));
    const on = /\bON (TABLE )?(public\.)?"?persons"?\b/i;
    const rev = st.findIndex(
      (s) =>
        /^REVOKE ALL( PRIVILEGES)? ON /i.test(s) &&
        on.test(s) &&
        /FROM PUBLIC, anon, authenticated$/i.test(s),
    );
    expect(
      rev,
      "REVOKE ALL ON persons FROM PUBLIC, anon, authenticated",
    ).toBeGreaterThan(-1);
    const grants = st
      .map((s, i) => [s, i] as const)
      .filter(([s]) => /^GRANT /i.test(s) && on.test(s));
    expect(grants.map(([s]) => s.replace(/\s*ON TABLE\s*/i, " ON "))).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^GRANT SELECT ON (public\.)?persons TO authenticated$/i,
        ),
      ]),
    );
    for (const [s, i] of grants) {
      expect(i, s).toBeGreaterThan(rev);
      expect(s).not.toMatch(/\bTO\b.*\b(anon|PUBLIC)\b/i);
    }
    const sql = code(sqlFile(MIGRATION));
    expect(sql).toMatch(
      /ALTER TABLE (public\.)?persons ENABLE ROW LEVEL SECURITY/i,
    );
    expect(sql).toMatch(
      /ALTER TABLE (public\.)?persons FORCE ROW LEVEL SECURITY/i,
    );
    expect(sql).not.toMatch(/\bALTER\s+PUBLICATION\b/i);
  });

  it(`§2 idempotence: CREATE TABLE IF NOT EXISTS; ${POLICY} preceded by DROP POLICY IF EXISTS; ADD COLUMN IF NOT EXISTS; guarded constraints`, () => {
    const st = statements(sqlFile(MIGRATION));
    for (const s of st.filter((x) =>
      /^CREATE (UNIQUE )?(TABLE|INDEX)\b/i.test(x),
    ))
      expect(s).toMatch(/^CREATE (UNIQUE )?(TABLE|INDEX) IF NOT EXISTS /i);
    const c = st.findIndex((s) =>
      new RegExp(
        `^CREATE POLICY "?${POLICY}"? ON (public\\.)?persons`,
        "i",
      ).test(s),
    );
    const d = st.findIndex((s) =>
      new RegExp(
        `^DROP POLICY IF EXISTS "?${POLICY}"? ON (public\\.)?persons$`,
        "i",
      ).test(s),
    );
    expect(c, `CREATE POLICY ${POLICY}`).toBeGreaterThan(-1);
    expect(d, "DROP POLICY IF EXISTS before it").toBeGreaterThan(-1);
    expect(d).toBeLessThan(c);
    const sql = code(sqlFile(MIGRATION));
    for (const [t] of SEAMS)
      expect(sql, t).toMatch(
        new RegExp(
          `ALTER TABLE (ONLY )?(public\\.)?${t}\\s+ADD COLUMN IF NOT EXISTS person_id uuid(\\s+NULL)?\\s*[;,]`,
          "i",
        ),
      );
    for (const n of CONSTRAINTS) {
      expect(sql, `${n} guarded by a pg_constraint lookup`).toMatch(
        new RegExp(`conname\\s*=\\s*'${n}'`),
      );
      expect(sql, `${n} NOT VALID`).toMatch(
        new RegExp(`ADD CONSTRAINT ${n}\\b[^;]*\\bNOT VALID`, "i"),
      );
      expect(sql, `${n} VALIDATE`).toMatch(
        new RegExp(`VALIDATE CONSTRAINT ${n}\\b`, "i"),
      );
    }
  });

  it("OQ5/§1.2: no index on (tenant_id, person_id), no CONCURRENTLY, no DEFAULT or UPDATE for person_id, no donors.person_id; In 5 seed is ON CONFLICT ... DO NOTHING", () => {
    const sql = code(sqlFile(MIGRATION));
    expect(sql).not.toMatch(/CREATE (UNIQUE )?INDEX[^;]*\bperson_id\b/i);
    expect(sql).not.toMatch(/\bCONCURRENTLY\b/i);
    expect(sql).not.toMatch(/\bperson_id\s+uuid[^;,]*\bDEFAULT\b/i);
    expect(sql).not.toMatch(/\bUPDATE\s+(public\.)?(missionaries|profiles)\b/i);
    expect(sql).not.toMatch(/ALTER TABLE (ONLY )?(public\.)?donors\b/i);
    expect(sql).not.toMatch(/\b(party_id|party_type)\b/i);
    expect(sql, "§3: donor_merge_candidates untouched").not.toMatch(
      /\b(crm|donor)_merge_candidates\b/i,
    );
    const ins = statements(sqlFile(MIGRATION)).filter((s) =>
      /^INSERT INTO (public\.)?field_policies\b/i.test(s),
    );
    expect(ins.length).toBeGreaterThan(0);
    for (const s of ins)
      expect(s, "In 5").toMatch(
        /ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING$/i,
      );
  });

  it("no other forward migration names persons or person_id", () => {
    // Amended by AL-2675 (WP2b, second release; record D-18): the policy
    // migration rewrites the persons staff policy in place, by ALTER POLICY,
    // and names persons nowhere else. Any other statement there, and any
    // other migration, still fails.
    const POLICY_MIGRATION = /^\d{14}_request_tenant_policies\.sql$/;
    const re = /\b(persons|person_id)\b/i;
    const hits = readdirSync(DIR)
      .filter((f) => /^\d{14}_.*\.sql$/.test(f) && f !== OWN)
      .filter((f) => !POLICY_MIGRATION.test(f))
      .filter((f) => re.test(code(readFileSync(path.join(DIR, f), "utf8"))));
    expect(hits).toEqual([]);
    const policyMigration = readdirSync(DIR).find((f) =>
      POLICY_MIGRATION.test(f),
    );
    const naming = code(readFileSync(path.join(DIR, policyMigration!), "utf8"))
      .split("\n")
      .filter((line) => re.test(line));
    expect(naming).toEqual([
      'ALTER POLICY "persons_staff_select" ON public.persons',
    ]);
  });
});

describe("#2256 rollback", () => {
  it(`In 8: ${ROLLBACK} deletes the seed rows, drops the 4 constraints, both columns and persons, in that order; the runner skips it`, () => {
    const sql = code(sqlFile(ROLLBACK));
    const at = (re: RegExp) => sql.search(re);
    const del = at(/DELETE FROM (public\.)?field_policies\b[^;]*person_id/i);
    const cons = CONSTRAINTS.map((n) =>
      at(new RegExp(`DROP CONSTRAINT (IF EXISTS )?${n}\\b`, "i")),
    );
    const dropCol = "\\b[^;]*DROP COLUMN (IF EXISTS )?person_id\\b";
    const cols = SEAMS.map(([t]) =>
      at(new RegExp(`ALTER TABLE (ONLY )?(public\\.)?${t}${dropCol}`, "i")),
    );
    const drop = at(/DROP TABLE (IF EXISTS )?(public\.)?persons\b/i);
    for (const i of [del, ...cons, ...cols, drop])
      expect(i).toBeGreaterThan(-1);
    expect(del).toBeLessThan(Math.min(...cons));
    expect(Math.max(...cons)).toBeLessThan(Math.min(...cols));
    expect(Math.max(...cols)).toBeLessThan(drop);
    expect(sql).not.toMatch(/\bCASCADE\b/i);
    expect(/^\d{14}_/.test(path.basename(ROLLBACK))).toBe(false);
  });
});

describe("#2256 seams, readers and writers", () => {
  it("6 (S): the app readers of profile.tenant_id equal the §1.3 app rows (see the doc and #2267)", () => {
    const re = /\bprofiles?\??\.tenant_id\b/;
    const hits = lsFiles("packages", "apps", "supabase/functions")
      .filter((f) => SRC.test(f) && !TEST.test(f))
      .filter((f) => re.test(readFileSync(f, "utf8")));
    expect(hits.sort()).toEqual(READER_APPS);
  });

  /**
   * AL-2675 (the WP2a sweep; plan WP2a paragraph, NR-68): no code filters
   * `profiles` by tenant or role, the generic tenant-row helper included.
   * The sweep moved every such query to membership or the member directory.
   */
  it("6b (S): no app code filters profiles by tenant or role (the reader manifest's filter half)", () => {
    const hits = lsFiles("packages", "apps", "supabase/functions")
      .filter((f) => SRC.test(f) && !TEST.test(f))
      .flatMap((f) => profileQueryFilterHits(f, readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });

  it("6b (S): the filter half fails on each planted profile filter and passes clean queries", () => {
    const planted = [
      'await admin.from("profiles").select("id").eq("tenant_id", tenantId);',
      'await admin.from("profiles").select("id").in("role", ["admin", "super_admin"]);',
      "await admin.from('profiles').select('*').or(`tenant_id.eq.${t},role.eq.staff`);",
      'let query = admin.from("profiles").select("*");\nif (role) query = query.eq("role", role);',
      'const rows = await selectTenantRows(supabase, "profiles", tenantId);',
      'await admin.from("profiles").select("id").match({ tenant_id: t });',
      // Council round 1 on WP2a, F14: a filter on profiles joined from
      // another table, by dotted column or by the referenced-table option.
      'await admin.from("donors").select("id, profiles!inner(id)").eq("profiles.tenant_id", tenantId);',
      'await admin.from("donors").select("id, profiles(role)").in("profiles.role", ["admin"]);',
      'await admin.from("donors").select("id, profiles(id)").or(`tenant_id.eq.${t}`, { referencedTable: "profiles" });',
      'await admin.from("donors").select("id, profiles(id)").or("role.eq.admin", { foreignTable: "profiles" });',
    ];
    for (const text of planted)
      expect(profileQueryFilterHits("planted.ts", text), text).not.toEqual([]);
    const clean = [
      'await admin.from("profiles").select("id").eq("id", profileId);',
      'await admin.from("profiles").select("id").in("id", memberIds);',
      'await admin.from("donors").select("id").eq("tenant_id", tenantId);',
      'await selectTenantRows(supabase, "donors", tenantId);',
      'await Promise.all([admin.from("profiles").select("id").in("id", ids), admin.from("prefs").select("*").eq("tenant_id", t)]);',
      'await admin.from("donors").select("id, profiles(id)").eq("profiles.id", profileId);',
      'await admin.from("donors").select("id, profiles(id)").order("created_at", { referencedTable: "profiles" });',
    ];
    for (const text of clean)
      expect(profileQueryFilterHits("clean.ts", text), text).toEqual([]);
  });

  it("7: no app/script/tooling code names person_id or persons (D-18: AL-2671 ruling-pin-tax Q2)", () => {
    // Pre-existing prose on develop (#2257, Phase 9 concept docs): two string lines naming `persons`, no reads.
    const PROSE = new Map([["packages/api/src/crm/identity/concepts.ts", 2]]);
    const re = /\b(person_id|persons)\b/;
    const hits: string[] = [];
    for (const f of lsFiles(...APP_DIRS, "supabase/functions")) {
      if (f === "scripts/verify/field-policy-census.mjs") continue;
      const lines = readFileSync(f, "utf8")
        .split("\n")
        .filter((l) => re.test(l));
      if (
        lines.length &&
        !(
          PROSE.get(f) === lines.length &&
          lines.every((l) => !/\bperson_id\b/.test(l))
        )
      )
        hits.push(`${f} (${lines.length})`);
    }
    expect(hits).toEqual([]);
  });

  it("16 (S): the direct and scoped missionary writers never update person_id (see #2268, AL-2675)", () => {
    const sites: string[] = [];
    for (const f of lsFiles(...APP_DIRS).filter(
      (x) => SRC.test(x) && !TEST.test(x),
    )) {
      const t = readFileSync(f, "utf8");
      for (const m of t.matchAll(/\.from\(\s*["'`]missionaries["'`]\s*\)/g)) {
        const rest = t.slice(m.index! + m[0].length);
        const chain = rest.slice(
          0,
          rest.includes(";") ? rest.indexOf(";") : undefined,
        );
        const w = /\.(insert|update|upsert)\(([^)]*)\)/.exec(chain);
        if (w) {
          sites.push(f);
          expect(w[2], `${f} payload`).not.toMatch(/person_id/);
        }
      }
    }
    expect(sites.sort()).toEqual([]);
    const profile = readFileSync("packages/api/src/profile/index.ts", "utf8");
    const keys = new Set(
      [...profile.matchAll(/\bmissionaryUpdate\.(\w+)\s*=/g)].map((m) => m[1]),
    );
    expect([...keys].sort().join(" ")).toBe(
      "bio cover_url location mission_field phone social_links tagline",
    );
    expect(profile).toMatch(
      /\.rpc\("missionary_own_record_write",\s*\{\s*\.\.\.missionaryArgs\(scope\),\s*p_patch: missionaryUpdate,?\s*\}\)/,
    );
    // AL-2675 moves the profile write into SQL. Pin its target columns as well as the route payload.
    const authorityFiles = readdirSync(DIR).filter((name) =>
      name.endsWith("_missionary_handler_authority.sql"),
    );
    expect(authorityFiles).toHaveLength(1);
    const authority = readFileSync(path.join(DIR, authorityFiles[0]!), "utf8");
    const writer =
      /CREATE FUNCTION public\.missionary_own_record_write\([\s\S]*?AS \$\$([\s\S]*?)\$\$;/i.exec(
        authority,
      )?.[1];
    expect(writer).toMatch(
      /UPDATE public\.missionaries AS missionary\s+SET \(phone, bio, tagline, mission_field, location, cover_url, social_links\) =/i,
    );
    expect(writer).not.toMatch(/\bperson_id\b/i);
    const careCommandFiles = readdirSync(DIR).filter((name) =>
      name.endsWith("_member_care_commands.sql"),
    );
    expect(careCommandFiles).toHaveLength(1);
    const careCommands = readFileSync(
      path.join(DIR, careCommandFiles[0]!),
      "utf8",
    );
    const attentionWriter =
      /CREATE (?:OR REPLACE )?FUNCTION tenant_guard\.set_manual_attention_flag\([\s\S]*?AS \$\$([\s\S]*?)\$\$;/i.exec(
        careCommands,
      )?.[1];
    expect(attentionWriter).toMatch(
      /UPDATE public\.missionaries(?:\s+AS\s+\w+)?\s+SET manual_attention = p_manual_attention/i,
    );
    expect(attentionWriter).not.toMatch(/\bperson_id\b/i);
  });

  it("16 (S): no INSERT/UPDATE/COPY statement on missionaries in seed.sql or any migration names person_id", () => {
    const files = [
      "supabase/seed.sql",
      ...readdirSync(DIR)
        .filter((f) => f.endsWith(".sql"))
        .map((f) => path.join(DIR, f)),
    ];
    const bad: string[] = [];
    for (const f of files)
      for (const s of code(readFileSync(f, "utf8")).split(";"))
        if (
          /\b(INSERT\s+INTO|UPDATE|COPY)\s+(ONLY\s+)?(public\.)?"?missionaries"?\b/i.test(
            s,
          ) &&
          /\bperson_id\b/i.test(s)
        )
          bad.push(`${f}: ${s.trim().slice(0, 80)}`);
    expect(bad).toEqual([]);
  });
});

describe("#2256 census artifacts and docs", () => {
  const json = (p: string) => JSON.parse(sqlFile(p));

  it("9: census-v1.json lists v3 last with its SHA-256; counts 176 / 880; v3 binds the forward file by path + SHA-256", () => {
    const census = json(`${FP}/census-v1.json`);
    expect([census.column_count, census.candidate_column_count]).toEqual([
      171, 176,
    ]);
    expect(census.baseline_row_count).toBe(880);
    const refs = census.repository_supplements as {
      artifact: string;
      sha256: string;
    }[];
    expect(refs.map((r) => r.artifact)).toEqual([
      "repository-supplement-v1.json",
      "repository-supplement-v2-donor-identity.json",
      V3,
    ]);
    expect(refs.at(-1)!.sha256).toBe(sha256(`${FP}/${V3}`));
    const v3 = json(`${FP}/${V3}`);
    expect(v3.source_path).toBe(MIGRATION);
    expect(v3.source_sha256).toBe(sha256(MIGRATION));
    const cols = (v3.columns as Record<string, unknown>[]).map((c) =>
      [
        `${c.recordType}.${c.name}`,
        ...[c.type, c.nullable, c.default ?? null, c.generated ?? null],
        ...[c.category, c.semantic_category, c.processor_identifier],
        JSON.stringify(c.policies).includes("true") ? "some flag true" : "",
      ].join(" "),
    );
    expect(cols.sort()).toEqual(
      ["missionaries", "profiles"].map(
        (t) => `${t}.person_id uuid true   security security false `,
      ),
    );
  });

  it("6/14: the doc covers the seam rules, FK/CHECK form, re-homing, the §1.3 finding, the pair store, S3 and rollback order", () => {
    const doc = sqlFile(DOC);
    for (const n of [
      ...CONSTRAINTS,
      ...Object.keys(READER_FUNCTIONS),
      ...READER_APPS,
      // Every policy reader by name, incl. #2406 addendum 1's storage policies.
      ...READER_POLICIES.map((p) => p.replace(/^\S+ /, "")),
    ])
      expect(doc, n).toContain(n);
    const rollback = path.basename(ROLLBACK).replace(/\./g, "\\.");
    for (const re of [
      ...[/inert/i, /\bpersons\b/, /\(tenant_id, person_id\)/, /re-?hom/i],
      /person_id IS NULL OR tenant_id IS NOT NULL/i,
      ...[/23503/, /donor_merge_candidates/, /\banon\b/, new RegExp(rollback)],
      ...[/#2254/, /#2267/, /#2268/],
    ])
      expect(doc).toMatch(re);
  });

  it("14: the field-policies README states 176 / 880 and the v3 supplement", () => {
    const readme = sqlFile(`${FP}/README.md`);
    for (const re of [
      /\b176\b/,
      /\b880\b/,
      new RegExp(V3.replace(/\./g, "\\.")),
    ])
      expect(readme).toMatch(re);
  });
});
