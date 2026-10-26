/**
 * #2256 real-stack acceptance (spec r2 §4, the (R) parts of criteria 1-6, 8-12
 * and 16) on the CI `migrate` job's database (migrations + seed applied,
 * superuser URL in TENANT_GUARD_IT_ADMIN_DATABASE_URL). Every case runs in a
 * transaction that is rolled back; RLS cases use SET LOCAL ROLE +
 * request.jwt.claim(s). Fails (never skips) in the `migrate` job without the
 * URL (OQ9); skips everywhere else. Owned by Acceptance; implementers must not
 * edit.
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CONSTRAINTS,
  EXCEPTIONS,
  FP,
  MIGRATION,
  NEW_ROWS,
  POLICY,
  READER_FUNCTIONS,
  READER_POLICIES,
  ROLLBACK,
  SEAMS,
  V3,
  body,
  read,
  sqlFile,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const PRIVS = "SELECT INSERT UPDATE DELETE TRUNCATE REFERENCES TRIGGER".split(
  " ",
);
const POINTER = "see docs/security/identity-person-anchor.md and #2267";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "OQ9: the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2256 person anchor on the real stack", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = () => randomUUID();
  const [A, B, PA, PB, MA, M0] = [id(), id(), id(), id(), id(), id()];
  const [DA1, DA2, DB] = [id(), id(), id()];
  const USERS = ["staffA", "staffA_off", "staffB", "u", "pra", "pr0"] as const;
  const U = Object.fromEntries(USERS.map((k) => [k, id()])) as Record<
    (typeof USERS)[number],
    string
  >;
  const [PRA, PR0] = [U.pra, U.pr0];
  const rows = async (sql: string, p: unknown[] = []) =>
    (await db.query(sql, p)).rows;
  const one = async (sql: string, p: unknown[] = []) =>
    Object.values((await rows(sql, p))[0] ?? {})[0];

  /** Runs `sql` in a savepoint (optionally as `role` with `sub`), always rolled back; returns rows or the error. */
  async function run(sql: string, p: unknown[] = [], role = "", sub = "") {
    await db.query("SAVEPOINT s");
    try {
      if (role) {
        await db.query(`SET LOCAL ROLE ${role}`);
        await db.query(
          "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)",
          [sub, JSON.stringify({ sub: sub || null, role })],
        );
      }
      const r = await db.query(sql, p);
      return { rows: r.rows, code: undefined as unknown, constraint: "" };
    } catch (e) {
      const err = e as { code?: string; constraint?: string };
      return { rows: [], code: err.code, constraint: err.constraint ?? "" };
    } finally {
      await db.query("ROLLBACK TO SAVEPOINT s");
    }
  }
  const fails = async (sql: string, p: unknown[] = []) =>
    (await run(sql, p)).code;
  const as = (who: keyof typeof U, sql: string, p: unknown[] = []) =>
    run(sql, p, "authenticated", U[who]);
  const personIds = async (who: keyof typeof U) =>
    (await as(who, "SELECT id FROM public.persons ORDER BY id")).rows.map(
      (r) => r.id as string,
    );

  async function fixture() {
    await db.query(
      `INSERT INTO public.tenants (id, name, slug) VALUES ($1::uuid, 'acc2256 a', 'acc2256-a-' || $1::text), ($2::uuid, 'acc2256 b', 'acc2256-b-' || $2::text)`,
      [A, B],
    );
    await db.query("INSERT INTO auth.users (id) SELECT unnest($1::uuid[])", [
      Object.values(U),
    ]);
    await db.query(
      `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active) VALUES
       ($1, $4, 'staff', 'finance', true), ($2, $4, 'staff', 'finance', false), ($3, $5, 'staff', 'finance', true)`,
      [U.staffA, U.staffA_off, U.staffB, A, B],
    );
    await db.query(
      "INSERT INTO public.persons (tenant_id, id) VALUES ($1, $2), ($3, $4)",
      [A, PA, B, PB],
    );
    await db.query(
      `INSERT INTO public.profiles (id, user_id, tenant_id) VALUES ($1, $1, $3), ($2, $2, NULL)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, tenant_id = EXCLUDED.tenant_id`,
      [PRA, PR0, A],
    );
    await db.query(
      "INSERT INTO public.missionaries (id, tenant_id) VALUES ($1, $2), ($3, NULL)",
      [MA, A, M0],
    );
    await db.query(
      "INSERT INTO public.donors (id, tenant_id) VALUES ($1, $3), ($2, $3), ($4, $5)",
      [DA1, DA2, A, DB, B],
    );
  }
  /** Each case: BEGIN, fixture, case, ROLLBACK. */
  const tx = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      await db.query("BEGIN");
      try {
        await fixture();
        await fn();
      } finally {
        await db.query("ROLLBACK");
      }
    });

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  it("1/16: after migrate + seed, persons has 0 rows and no missionaries row has a person_id", async () => {
    expect(
      await one(
        "SELECT (SELECT count(*) FROM public.persons) || ' ' || (SELECT count(*) FROM public.missionaries WHERE person_id IS NOT NULL)",
      ),
    ).toBe("0 0");
  });

  tx(
    "1: persons shape, PK (tenant_id, id), tenant FK, RLS enabled + forced",
    async () => {
      expect(
        await one(`SELECT string_agg(attname || ' ' || format_type(atttypid, atttypmod) || ' ' || attnotnull, ', ' ORDER BY attname)
          FROM pg_attribute WHERE attrelid = 'public.persons'::regclass AND attnum > 0 AND NOT attisdropped`),
      ).toBe(
        "created_at timestamp with time zone true, id uuid true, tenant_id uuid true",
      );
      expect(
        await one(`SELECT string_agg(contype::text || ' ' || pg_get_constraintdef(oid), '; ' ORDER BY 1) FROM pg_constraint
          WHERE conrelid = 'public.persons'::regclass AND contype IN ('p', 'f', 'u')`),
      ).toBe(
        "f FOREIGN KEY (tenant_id) REFERENCES tenants(id); p PRIMARY KEY (tenant_id, id)",
      );
      expect(
        await rows(
          "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid = 'public.persons'::regclass",
        ),
      ).toEqual([{ relrowsecurity: true, relforcerowsecurity: true }]);
    },
  );

  tx(
    "2: staff see only their tenant's persons; inactive staff and non-members see 0",
    async () => {
      expect(await personIds("staffA")).toEqual([PA]);
      expect(await personIds("staffB")).toEqual([PB]);
      expect(await personIds("staffA_off")).toEqual([]);
      expect(await personIds("u")).toEqual([]);
    },
  );

  tx("2: staff INSERT/UPDATE/DELETE fail with 42501", async () => {
    for (const sql of [
      `INSERT INTO public.persons (tenant_id) VALUES ('${A}')`,
      `UPDATE public.persons SET created_at = now() WHERE tenant_id = '${A}'`,
      `DELETE FROM public.persons WHERE tenant_id = '${A}'`,
    ])
      expect((await as("staffA", sql)).code, sql).toBe("42501");
  });

  const EXPECTED_PRIVS = PRIVS.flatMap((p) => [
    `anon ${p} f`,
    `authenticated ${p} ${p === "SELECT" ? "t" : "f"}`,
    `service_role ${p} t`,
  ]).sort();
  const privileges = async () =>
    (
      await rows(
        `SELECT r || ' ' || p || ' ' || CASE WHEN has_table_privilege(r, 'public.persons', p) THEN 't' ELSE 'f' END AS v
         FROM unnest(array['anon', 'authenticated', 'service_role']) r, unnest($1::text[]) p`,
        [PRIVS],
      )
    )
      .map((r) => r.v as string)
      .sort();
  const publicGrants = () =>
    one(
      "SELECT count(*)::int FROM pg_class c, aclexplode(c.relacl) a WHERE c.oid = 'public.persons'::regclass AND a.grantee = 0",
    );

  tx(
    "2: anon has no privilege and SELECT fails 42501; authenticated SELECT only; exactly one policy; not published",
    async () => {
      expect(await privileges()).toEqual(EXPECTED_PRIVS);
      expect(await publicGrants(), "no PUBLIC grant").toBe(0);
      const anon = await run("SELECT 1 FROM public.persons", [], "anon");
      expect(anon.code).toBe("42501");
      const pols = await rows(
        "SELECT policyname, cmd, roles::text[] AS roles, permissive, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'persons'",
      );
      expect(pols).toHaveLength(1);
      expect(pols[0]).toMatchObject({
        policyname: POLICY,
        cmd: "SELECT",
        roles: ["authenticated"],
        permissive: "PERMISSIVE",
        with_check: null,
      });
      expect(String(pols[0]!.qual)).toMatch(
        /authz\.has_staff_membership\((persons\.)?tenant_id, NULL(::authz\.staff_role\[\])?\)/,
      );
      expect(
        await one(
          "SELECT count(*)::int FROM pg_publication_tables WHERE schemaname = 'public' AND tablename = 'persons'",
        ),
      ).toBe(0);
    },
  );

  tx(
    "3: after hosted-style GRANT ALL to anon/authenticated/PUBLIC, re-applying the forward file restores criterion 2",
    async () => {
      await db.query("GRANT ALL ON persons TO anon, authenticated, PUBLIC");
      await db.query(body(MIGRATION));
      expect(await privileges()).toEqual(EXPECTED_PRIVS);
      expect(await publicGrants(), "no PUBLIC grant").toBe(0);
    },
  );

  const link = (t: string, row: string, to: string) =>
    run(`UPDATE public.${t} SET person_id = $2 WHERE id = $1`, [row, to]);

  tx(
    "4/5: person_id is uuid, nullable, no default; donors has none; same-tenant link ok, cross-tenant 23503, tenant-less 23514; constraints validated",
    async () => {
      for (const [table, fk, ck] of SEAMS) {
        const [own, none] = table === "missionaries" ? [MA, M0] : [PRA, PR0];
        expect(
          await one(
            `SELECT format_type(atttypid, atttypmod) || ' ' || attnotnull || ' ' || atthasdef || ' ' || attgenerated::text FROM pg_attribute
             WHERE attrelid = $1::regclass AND attname = 'person_id' AND NOT attisdropped`,
            [`public.${table}`],
          ),
          table,
        ).toBe("uuid false false ");
        expect(
          (await link(table, own, PA)).code,
          `${table} -> PA`,
        ).toBeUndefined();
        expect(await link(table, own, PB)).toMatchObject({
          code: "23503",
          constraint: fk,
        });
        expect(await link(table, none, PA)).toMatchObject({
          code: "23514",
          constraint: ck,
        });
        expect(
          await one(
            "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = $1::regclass AND conname = $2",
            [`public.${table}`, fk],
          ),
        ).toBe(
          "FOREIGN KEY (tenant_id, person_id) REFERENCES persons(tenant_id, id)",
        );
      }
      expect(
        await one(
          "SELECT count(*) FILTER (WHERE convalidated)::int FROM pg_constraint WHERE conname = ANY($1)",
          [CONSTRAINTS],
        ),
      ).toBe(CONSTRAINTS.length);
      expect(
        await one(
          `SELECT count(*)::int FROM information_schema.columns WHERE table_schema = 'public'
           AND ((table_name = 'donors' AND column_name = 'person_id') OR column_name IN ('party_id', 'party_type'))`,
        ),
        "4: no donors.person_id, no party_id/party_type",
      ).toBe(0);
    },
  );

  tx(
    "5: a linked profile can't be re-homed (23503); a referenced person can't be deleted (23503); an unreferenced one can",
    async () => {
      await db.query(
        "UPDATE public.profiles SET person_id = $2 WHERE id = $1",
        [PRA, PA],
      );
      const rehome = "UPDATE public.profiles SET tenant_id = $2 WHERE id = $1";
      expect(await fails(rehome, [PRA, B])).toBe("23503");
      const del = "DELETE FROM public.persons WHERE id = $1";
      expect(await fails(del, [PA])).toBe("23503");
      expect(await fails(del, [PB])).toBeUndefined();
    },
  );

  tx(
    `6: profiles.tenant_id is a nullable uuid FK -> tenants(id); the reader set equals §1.3 (${POINTER})`,
    async () => {
      expect(
        await one(
          `SELECT data_type || ' ' || is_nullable || ' ' || (SELECT count(*) FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass
           AND pg_get_constraintdef(oid) = 'FOREIGN KEY (tenant_id) REFERENCES tenants(id)') FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tenant_id'`,
        ),
      ).toBe("uuid YES 1");
      const pols = (
        await rows(
          "SELECT schemaname, tablename, policyname, qual, with_check FROM pg_policies",
        )
      ).filter((p) => {
        const expr = `${p.qual ?? ""} ${p.with_check ?? ""}`;
        if (p.tablename === "profiles" && /\btenant_id\b/.test(expr))
          return true;
        if (/\bprofiles\.tenant_id\b/.test(expr)) return true;
        return [...expr.matchAll(/\bprofiles\s+(?:AS\s+)?(\w+)/gi)].some((m) =>
          new RegExp(`\\b${m[1]}\\.tenant_id\\b`).test(expr),
        );
      });
      expect(
        pols
          .map((p) => `${p.schemaname}.${p.tablename} ${p.policyname}`)
          .sort(),
        `policy readers of profiles.tenant_id changed; ${POINTER}`,
      ).toEqual(READER_POLICIES);
      const fns = await rows(
        `SELECT p.proname, p.prosecdef FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname IN ('public', 'authz') AND p.prosrc ~* '\\mprofiles\\M' AND p.prosrc ~ '\\mtenant_id\\M'`,
      );
      expect(
        fns.map((f) => `${f.proname} ${f.prosecdef}`).sort(),
        `function readers of profiles.tenant_id changed; ${POINTER}`,
      ).toEqual(
        Object.entries(READER_FUNCTIONS)
          .map(([n, d]) => `${n} ${d}`)
          .sort(),
      );
    },
  );

  tx(
    "8: donor_merge_candidates: same-tenant pair is 'open'; cross-tenant pairs 23503 on the composite FKs; no trigger",
    async () => {
      const pair = (t: string, e: string, i: string | null) =>
        run(
          "INSERT INTO public.donor_merge_candidates (tenant_id, existing_donor_id, incoming_donor_id, confidence) VALUES ($1, $2, $3, 'possible') RETURNING status",
          [t, e, i],
        );
      expect((await pair(A, DA1, DA2)).rows).toEqual([{ status: "open" }]);
      expect(await pair(A, DA1, DB)).toMatchObject({
        code: "23503",
        constraint: "donor_merge_candidates_incoming_donor_same_tenant_fk",
      });
      expect(await pair(A, DB, null)).toMatchObject({
        code: "23503",
        constraint: "donor_merge_candidates_existing_donor_same_tenant_fk",
      });
      expect(
        await one(
          `SELECT (SELECT count(*) FROM pg_trigger WHERE tgrelid = d.adrelid AND NOT tgisinternal) || ' ' || pg_get_expr(d.adbin, d.adrelid)
           FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
           WHERE d.adrelid = 'public.donor_merge_candidates'::regclass AND a.attname = 'status'`,
        ),
        "no trigger; status default 'open'",
      ).toBe("0 'open'::text");
    },
  );

  tx(
    "9: field_policies holds exactly the 10 new rows; the v3 local_catalog query equals its recorded result",
    async () => {
      const got = await rows(
        `SELECT record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category
         FROM public.field_policies WHERE field_key = 'person_id'`,
      );
      expect(got).toHaveLength(NEW_ROWS.length);
      expect(got).toEqual(expect.arrayContaining(NEW_ROWS));
      const v3 = JSON.parse(sqlFile(`${FP}/${V3}`));
      const q = String(v3.local_catalog?.query ?? "").replace(/;\s*$/, "");
      expect(q, "v3 local_catalog.query").not.toBe("");
      expect(await one(q)).toEqual(v3.local_catalog.result);
    },
  );

  tx(
    "10: persons is not an RLS exception; its owner is superuser or BYPASSRLS",
    async () => {
      if (existsSync(EXCEPTIONS))
        expect(
          JSON.parse(read(EXCEPTIONS)).entries.map(
            (e: { table: string }) => e.table,
          ),
        ).not.toContain("persons");
      expect(
        await one(
          "SELECT r.rolsuper OR r.rolbypassrls FROM pg_class c JOIN pg_roles r ON r.oid = c.relowner WHERE c.oid = 'public.persons'::regclass",
        ),
      ).toBe(true);
    },
  );

  /** Name-level catalog snapshot (no oids) of everything the forward file could touch. */
  const catalog = async () =>
    (
      await rows(`
        SELECT 'rel ' || n.nspname || '.' || c.relname || ' ' || c.relkind::text || ' rls=' || c.relrowsecurity || c.relforcerowsecurity || ' acl=' || coalesce((SELECT string_agg(a.grantee::regrole::text || ':' || a.privilege_type, ',' ORDER BY a.grantee::regrole::text, a.privilege_type) FROM aclexplode(c.relacl) a), '-') AS v
          FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        UNION ALL SELECT 'con ' || conrelid::regclass || ' ' || conname || ' ' || pg_get_constraintdef(oid) || ' ' || convalidated FROM pg_constraint
        UNION ALL SELECT 'pol ' || schemaname || '.' || tablename || ' ' || policyname || ' ' || cmd || ' ' || roles::text || ' ' || coalesce(qual, '') || ' ' || coalesce(with_check, '') FROM pg_policies
        UNION ALL SELECT 'idx ' || pg_get_indexdef(indexrelid) FROM pg_index WHERE indrelid::regclass::text NOT LIKE 'pg_toast.%'
        UNION ALL SELECT 'typ ' || n.nspname || '.' || t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        UNION ALL SELECT 'fn ' || oid::regprocedure::text || ' ' || coalesce(proacl::text, '-') FROM pg_proc
        UNION ALL SELECT 'col ' || attrelid::regclass || '.' || attname || ' ' || format_type(atttypid, atttypmod) || ' ' || attnotnull || ' ' || atthasdef FROM pg_attribute WHERE attnum > 0 AND NOT attisdropped
          AND attrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace)
        UNION ALL SELECT 'fp ' || record_type || '.' || field_key || ' ' || surface || ' ' || visible || editable || exportable || ' ' || sensitivity_category FROM public.field_policies`)
    )
      .map((r) => r.v as string)
      .sort();
  const ours = (v: string) => /persons|person_id|_person_/.test(v);

  tx(
    "11: re-applying the forward file succeeds twice and changes no catalog or field_policies row",
    async () => {
      const before = await catalog();
      await db.query(body(MIGRATION));
      await db.query(body(MIGRATION));
      expect(await catalog()).toEqual(before);
    },
  );

  tx(
    "12: rollback removes persons, both columns, the 4 constraints and the 10 rows, nothing else; #2254 survives; forward restores",
    async () => {
      const before = await catalog();
      await db.query(body(ROLLBACK));
      const after = await catalog();
      expect(await one("SELECT to_regclass('public.persons')")).toBeNull();
      expect(after.filter(ours), "no #2256 object left").toEqual([]);
      expect(
        after.filter((v) => !before.includes(v)),
        "rollback added nothing",
      ).toEqual([]);
      expect(
        before.filter((v) => !after.includes(v) && !ours(v)),
        "rollback removed only #2256 objects",
      ).toEqual([]);
      expect(
        await one(
          "SELECT to_regprocedure('public.normalize_email(text)')::text",
        ),
      ).toBe("normalize_email(text)");
      await db.query(body(MIGRATION));
      expect(await catalog()).toEqual(before);
    },
  );

  tx(
    "16: no function names person_id, no rule on missionaries, anon/authenticated can't INSERT/UPDATE person_id",
    async () => {
      expect(
        await rows(
          `SELECT n.nspname || '.' || p.proname AS f FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_%' AND p.prosrc ~ '\\mperson_id\\M'`,
        ),
        "see #2268",
      ).toEqual([]);
      expect(
        await one(
          `SELECT (SELECT count(*) FROM pg_rules WHERE schemaname = 'public' AND tablename = 'missionaries') || ' ' || count(*)
           FROM unnest(array['anon', 'authenticated']) r, unnest(array['INSERT', 'UPDATE']) p
           WHERE has_column_privilege(r, 'public.missionaries', 'person_id', p)`,
        ),
        "no rule; no anon/authenticated INSERT/UPDATE on person_id (see #2268)",
      ).toBe("0 0");
    },
  );
});
