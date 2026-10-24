/**
 * #2254 real-stack acceptance (spec r1 criteria 1-11) on the CI `migrate`
 * job's database: migrations + Payload + supabase/seed.sql applied. Uses the
 * job's DATABASE_URL (no step env, per Samson's clarification) and skips
 * unless it names a local host. Writes on that database roll back; the Q10
 * failure path (criterion 7) and the catalog diffs (10, 11) run on a
 * disposable database created here with the chain applied up to the prior
 * migration, dropped afterwards. Locally:
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5432/<migrated-db> \
 *     bun x vitest run tests/unit/acceptance/issue-2254/
 * Owned by Acceptance; implementers must not edit.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  FIXTURE,
  MIGRATIONS,
  NEW_ROWS,
  ROOT,
  forwardMigrations,
  inlineOf,
  migrationFile,
  psql,
} from "./harness";

const URL_ = process.env.DATABASE_URL ?? "";
const local = (() => {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(URL_).hostname);
  } catch {
    return false;
  }
})();
const TA = "22540000-0000-4000-8000-00000000000a";
const TB = "22540000-0000-4000-8000-00000000000b";
const P = "22540000-0000-4000-8000-0000000000f1";
const lit = (s: string | null) =>
  s === null ? "NULL" : `'${s.replace(/'/g, "''")}'`;
const SETUP = `BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES ('${TA}','acc2254 a','acc2254-a'),('${TB}','acc2254 b','acc2254-b');
INSERT INTO auth.users(id) VALUES ('${P}');`;
const donor = (
  t: string,
  email: string | null,
  profile: string | null = null,
  id = "gen_random_uuid()",
) =>
  `INSERT INTO public.donors(id,tenant_id,profile_id,email) VALUES (${id},'${t}',${profile ? `'${profile}'` : "NULL"},${lit(email)});`;
const tx = (body: string, url = URL_) =>
  psql(url, `${SETUP}\n${body}\nROLLBACK;`);
const q = (sql: string, url = URL_) => {
  const r = psql(url, sql);
  expect(r.status, r.stderr).toBe(0);
  return r.stdout;
};

describe.skipIf(!local)("#2254 real stack (DATABASE_URL)", () => {
  it.each(FIXTURE)(
    "criterion 1: normalize_email(%s) = %s",
    (input, expected) => {
      const out = q(
        `SELECT coalesce(public.normalize_email(${input}), '<NULL>');`,
      );
      expect(out).toBe(expected ?? "<NULL>");
    },
  );
  it.each(FIXTURE)(
    "Q1: the pre-check's inline expression agrees with normalize_email on %s",
    (input) => {
      expect(
        q(
          `SELECT ${inlineOf(input)} IS NOT DISTINCT FROM public.normalize_email(${input});`,
        ),
      ).toBe("t");
    },
  );
  it('criterion 1: one normalize_email, IMMUTABLE STRICT PARALLEL SAFE, search_path=""', () => {
    const fn = JSON.parse(
      q(`SELECT coalesce(json_agg(json_build_object('sig', p.oid::regprocedure::text, 'ret', p.prorettype::regtype::text,
      'vol', p.provolatile, 'strict', p.proisstrict, 'par', p.proparallel, 'cfg', p.proconfig, 'lang', l.lanname)), '[]')
      FROM pg_proc p JOIN pg_language l ON l.oid = p.prolang WHERE p.proname ~* 'normali[sz]e_?email|email_?normali[sz]e';`),
    );
    expect(fn).toEqual([
      {
        sig: "normalize_email(text)",
        ret: "text",
        vol: "i",
        strict: true,
        par: "s",
        cfg: ['search_path=""'],
        lang: "sql",
      },
    ]);
  });
  it("criterion 2: the database is UTF8", () => {
    expect(
      q(
        "SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = current_database();",
      ),
    ).toBe("UTF8");
  });
  it("criterion 3: email_normalized is generated, follows UPDATE and rejects direct writes", () => {
    expect(
      q(
        "SELECT count(*) FROM public.donors WHERE email_normalized IS DISTINCT FROM public.normalize_email(email);",
      ),
    ).toBe("0");
    expect(
      q(`SELECT a.attgenerated::text || '|' || pg_get_expr(d.adbin, d.adrelid) FROM pg_attribute a JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = 'public.donors'::regclass AND a.attname = 'email_normalized';`),
    ).toBe("s|normalize_email(email)");
    const id = "'22540000-0000-4000-8000-0000000000d1'";
    const r = tx(`${donor(TA, " MiXed@Case.COM ", null, id)}
      SELECT email_normalized FROM public.donors WHERE id = ${id};
      UPDATE public.donors SET email = 'Other@X.com' WHERE id = ${id};
      SELECT email_normalized FROM public.donors WHERE id = ${id};`);
    expect(r.stdout.split("\n"), r.stderr).toEqual([
      "mixed@case.com",
      "other@x.com",
    ]);
    expect(
      tx(
        `INSERT INTO public.donors(tenant_id,email,email_normalized) VALUES ('${TA}','a@x.com','a@x.com');`,
      ).sqlstate,
    ).toBe("428C9");
    expect(
      tx(
        `${donor(TA, "a@x.com", null, id)} UPDATE public.donors SET email_normalized = 'b@x.com' WHERE id = ${id};`,
      ).sqlstate,
    ).toBe("428C9");
  });
  it("criterion 4: email_verified_at is NULL everywhere, nullable timestamptz, no default, no trigger", () => {
    expect(
      q(
        "SELECT count(*) FROM public.donors WHERE email_verified_at IS NOT NULL;",
      ),
    ).toBe("0");
    expect(
      q(`SELECT format_type(atttypid, atttypmod) || '|' || attnotnull || '|' || atthasdef FROM pg_attribute
      WHERE attrelid = 'public.donors'::regclass AND attname = 'email_verified_at';`),
    ).toBe("timestamp with time zone|false|false");
    expect(
      q(
        `SELECT count(*) FROM pg_trigger t JOIN pg_proc p ON p.oid = t.tgfoid WHERE NOT t.tgisinternal AND p.prosrc ILIKE '%email_verified_at%';`,
      ),
    ).toBe("0");
  });
  it("criterion 5: one donor per (tenant_id, profile_id); same profile allowed across tenants; no UNIQUE(profile_id)", () => {
    expect(tx(`${donor(TA, null, P)} ${donor(TB, null, P)}`).status).toBe(0);
    expect(tx(`${donor(TA, null, P)} ${donor(TA, null, P)}`).sqlstate).toBe(
      "23505",
    );
    const defs: string[] = JSON.parse(
      q(
        "SELECT coalesce(json_agg(pg_get_indexdef(indexrelid)), '[]') FROM pg_index WHERE indrelid = 'public.donors'::regclass AND indisunique;",
      ),
    );
    expect(defs.some((d) => / \(tenant_id, profile_id\)$/.test(d))).toBe(true);
    expect(defs.filter((d) => / \(profile_id\)/.test(d))).toEqual([]);
  });
  it("criterion 6: partial unique (tenant_id, email_normalized) index, exactly as specified", () => {
    expect(
      q(
        "SELECT pg_get_indexdef('public.donors_tenant_email_normalized_uidx'::regclass);",
      ),
    ).toBe(
      "CREATE UNIQUE INDEX donors_tenant_email_normalized_uidx ON public.donors USING btree (tenant_id, email_normalized) WHERE (email_normalized IS NOT NULL)",
    );
  });
  it.each([
    [" A@X.com", "a@x.com"],
    ["ＦＯＯ@ＢＡＲ.ＣＯＭ", "foo@bar.com"],
  ])("criterion 6: %j then %j in one tenant is rejected", (a, b) => {
    const r = tx(`${donor(TA, a)} ${donor(TA, b)}`);
    expect(r.sqlstate).toBe("23505");
    expect(r.stderr).toContain("donors_tenant_email_normalized_uidx");
  });
  it("criterion 6: allowed in another tenant; two NULL and two blank emails allowed", () => {
    const r = tx(
      [
        donor(TA, " A@X.com"),
        donor(TB, "a@x.com"),
        donor(TA, null),
        donor(TA, null),
        donor(TA, "   "),
        donor(TA, ""),
      ].join("\n"),
    );
    expect(r.status, r.stderr).toBe(0);
  });
  it("criterion 8: the demo seed has no duplicate under either key", () => {
    expect(
      q(`SELECT count(*) FROM (SELECT 1 FROM public.donors WHERE public.normalize_email(email) IS NOT NULL
      GROUP BY tenant_id, public.normalize_email(email) HAVING count(*) > 1
      UNION ALL SELECT 1 FROM public.donors WHERE profile_id IS NOT NULL GROUP BY tenant_id, profile_id HAVING count(*) > 1) d;`),
    ).toBe("0");
  });
  it("criterion 9: the 10 new field_policies rows match In 4 exactly; 870 rows in total", () => {
    const rows = JSON.parse(
      q(`SELECT coalesce(json_agg(to_jsonb(p)), '[]') FROM public.field_policies p
      WHERE p.record_type = 'donors' AND p.field_key IN ('email_normalized','email_verified_at');`),
    );
    const key = (r: { field_key: string; surface: string }) =>
      `${r.field_key}/${r.surface}`;
    const sort = <T extends { field_key: string; surface: string }>(rs: T[]) =>
      [...rs].sort((a, b) => (key(a) < key(b) ? -1 : 1));
    expect(sort(rows)).toEqual(sort(NEW_ROWS));
    expect(q("SELECT count(*) FROM public.field_policies;")).toBe("870");
  });
  it("criterion 9: the census and supabase/tests/field_policies*.sql pass on this database", () => {
    const census = spawnSync(
      process.execPath,
      ["scripts/verify/field-policy-census.mjs"],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(census.status, census.stderr).toBe(0);
    expect(census.stdout).toContain("exactly 174 candidate columns");
    for (const f of [
      "field_policies_foundation.sql",
      "field_policies_rls.sql",
    ]) {
      const r = psql(URL_, "", path.join(ROOT, "supabase/tests", f));
      expect(r.status, `${f}: ${r.stderr}`).toBe(0);
    }
  });
});

/** Disposable database with the chain applied up to the prior migration. */
const DB = `acc2254_q10_${randomBytes(4).toString("hex")}`;
let disposable: string | undefined;
function prior(): string {
  const file = migrationFile();
  if (disposable) return disposable;
  q(`CREATE DATABASE ${DB};`);
  const url = Object.assign(new URL(URL_), { pathname: `/${DB}` }).toString();
  disposable = url;
  const files = [
    "scripts/sql/supabase-compat-bootstrap.sql",
    ...forwardMigrations()
      .filter((f) => f < file)
      .map((f) => `${MIGRATIONS}/${f}`),
  ];
  for (const f of files) {
    const r = psql(url, "", path.join(ROOT, f));
    expect(r.status, `${f}: ${r.stderr}`).toBe(0);
  }
  return url;
}
const apply = (url: string) =>
  psql(url, "", path.join(ROOT, MIGRATIONS, migrationFile()));
const agg = (expr: string, from: string) =>
  `(SELECT json_agg(x ORDER BY x) FROM (SELECT ${expr} AS x FROM ${from}) s)`;
const CATALOG = `SELECT json_build_object(
  'fn', (SELECT count(*) FROM pg_proc WHERE proname = 'normalize_email'),
  'cols', ${agg("table_name || '.' || column_name", "information_schema.columns WHERE table_schema = 'public'")},
  'rels', ${agg("concat_ws(':', c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity, c.relacl)", "pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r','p','v','m','f')")},
  'donor_keys', ${agg("pg_get_indexdef(indexrelid)", "pg_index WHERE indrelid = 'public.donors'::regclass")},
  'donor_cons', ${agg("conname::text", "pg_constraint WHERE conrelid = 'public.donors'::regclass")},
  'policies', ${agg("row_to_json(p)::text", "pg_policies p")},
  'triggers', ${agg("tgrelid::regclass::text || '.' || tgname", "pg_trigger WHERE NOT tgisinternal")});`;
const CLEAN = `DELETE FROM public.donors WHERE tenant_id = '${TA}'; DELETE FROM public.tenants WHERE id IN ('${TA}','${TB}');
DELETE FROM public.profiles WHERE id = '${P}'; DELETE FROM auth.users WHERE id = '${P}';`;
const snapshot = (url: string) => JSON.parse(q(CATALOG, url));
const rows = (url: string, t: string) =>
  q(
    `SELECT json_agg(to_jsonb(d) ORDER BY d.id) FROM public.donors d WHERE tenant_id = '${t}';`,
    url,
  );

describe.skipIf(!local)(
  "#2254 criterion 7 (Q10) and catalog diffs, disposable database",
  () => {
    afterAll(() => {
      if (disposable) psql(URL_, `DROP DATABASE IF EXISTS ${DB} WITH (FORCE);`);
    });
    it.each([
      [
        "case/whitespace email duplicate",
        ["Dup.Person@Example.org", "  dup.person@EXAMPLE.ORG "],
        false,
      ],
      [
        "(tenant_id, profile_id) duplicate",
        ["p1.2254@example.net", "p2.2254@example.net"],
        true,
      ],
    ] as const)(
      "fails loudly on a %s with an ids-only report and leaves schema and rows unchanged",
      (_n, emails, sameProfile) => {
        const url = prior();
        const ids = [
          "22540000-0000-4000-8000-0000000000e1",
          "22540000-0000-4000-8000-0000000000e2",
        ];
        q(
          `${CLEAN}${SETUP.replace("BEGIN;", "")}\n${emails.map((e, i) => donor(TA, e, sameProfile ? P : null, `'${ids[i]}'`)).join("\n")}`,
          url,
        );
        const before = { catalog: snapshot(url), rows: rows(url, TA) };
        const r = apply(url);
        expect(r.status, "the migration must fail").not.toBe(0);
        for (const id of [...ids, TA]) expect(r.stderr).toContain(id);
        expect(r.stderr, "no email text in the report").not.toContain("@");
        for (const e of emails)
          for (const part of e.trim().toLowerCase().split("@"))
            expect(r.stderr.toLowerCase()).not.toContain(part);
        const after = snapshot(url);
        expect(after.fn).toBe(0);
        expect(after.cols).not.toContain("donors.email_normalized");
        expect(after.cols).not.toContain("donors.email_verified_at");
        expect(after).toEqual(before.catalog);
        expect(rows(url, TA)).toBe(before.rows);
      },
    );
    it("criteria 10 + 11: without duplicates it applies; RLS, triggers and tables unchanged, only the two columns added", () => {
      const url = prior();
      q(CLEAN, url); // drop the duplicate fixtures the Q10 cases left behind
      const before = snapshot(url);
      const r = apply(url);
      expect(r.status, r.stderr).toBe(0);
      const after = snapshot(url);
      expect(after.policies, "policy catalog diff is empty").toEqual(
        before.policies,
      );
      expect(
        after.rels,
        "no new relation; RLS flags and grants unchanged",
      ).toEqual(before.rels);
      expect(after.triggers, "no new trigger (donations included)").toEqual(
        before.triggers,
      );
      expect(
        after.cols.filter((c: string) => !before.cols.includes(c)),
      ).toEqual(["donors.email_normalized", "donors.email_verified_at"]);
      expect(
        before.cols.filter((c: string) => !after.cols.includes(c)),
      ).toEqual([]);
      expect(after.fn).toBe(1);
    });
  },
);
