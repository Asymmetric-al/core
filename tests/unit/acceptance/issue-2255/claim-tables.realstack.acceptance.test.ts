/**
 * #2255 real-stack acceptance (spec r2 §4 criteria 1-13, the (R) parts) on
 * the CI `migrate` job's database (migrations + seed applied, superuser URL in
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL). Every case runs in a transaction that
 * is rolled back; RLS cases use SET LOCAL ROLE + request.jwt.claim(s).
 * Fails (never skips) in the `migrate` job without the URL (OQ12); skips
 * everywhere else. Owned by Acceptance; implementers must not edit.
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CLAIMS,
  CLAIM_STATUSES,
  COLUMNS,
  INDEXES,
  INVITES,
  INVITE_STATUSES,
  MIGRATION,
  POLICIES,
  ROLLBACK,
  TABLES,
  body,
  read,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const PRIVS = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
  "REFERENCES",
  "TRIGGER",
];
const EXCEPTIONS = "docs/security/rls-deny-by-default-exceptions.json";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "OQ12: the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2255 claim tables on the real stack", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = () => randomUUID();
  const [A, B, DA, DB] = [id(), id(), id(), id()];
  const U = {
    staffA: id(),
    staffA_off: id(),
    staffB: id(),
    r1: id(),
    r2: id(),
  };
  const [cA1, cA2, cB1, iA, iB] = [id(), id(), id(), id(), id()];
  const rows = async (sql: string, p: unknown[] = []) =>
    (await db.query(sql, p)).rows;
  const one = async (sql: string, p: unknown[] = []) =>
    Object.values((await rows(sql, p))[0] ?? {})[0];

  /** Runs `sql` in a savepoint (optionally as `role` with `sub`), always rolled back; returns rows or the SQLSTATE. */
  async function run(
    sql: string,
    p: unknown[] = [],
    role?: string,
    sub?: string,
  ) {
    await db.query("SAVEPOINT s");
    try {
      if (role) {
        await db.query(`SET LOCAL ROLE ${role}`);
        await db.query(
          "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)",
          [sub ?? "", JSON.stringify({ sub: sub ?? null, role })],
        );
      }
      const r = await db.query(sql, p);
      return { rows: r.rows, count: r.rowCount, code: undefined as unknown };
    } catch (e) {
      return { rows: [], count: 0, code: (e as { code?: string }).code, e };
    } finally {
      await db.query("ROLLBACK TO SAVEPOINT s");
    }
  }
  const as = (who: keyof typeof U, sql: string, p: unknown[] = []) =>
    run(sql, p, "authenticated", U[who]);
  const ids = async (who: keyof typeof U, table: string) =>
    (await as(who, `SELECT id FROM public.${table} ORDER BY id`)).rows.map(
      (r) => r.id as string,
    );
  const sorted = (...xs: string[]) => [...xs].sort();
  const snap = (t: string) =>
    one(
      `SELECT json_agg(x ORDER BY x.id)::text FROM public.${t} x WHERE tenant_id = $1`,
      [B],
    );

  async function fixture() {
    await db.query(
      `INSERT INTO public.tenants (id, name, slug) VALUES ($1::uuid, 'acc2255 a', 'acc2255-a-' || $1::text), ($2::uuid, 'acc2255 b', 'acc2255-b-' || $2::text)`,
      [A, B],
    );
    await db.query("INSERT INTO auth.users (id) SELECT unnest($1::uuid[])", [
      Object.values(U),
    ]);
    await db.query(
      `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active) VALUES
       ($1, $5, 'staff', 'finance', true), ($2, $5, 'staff', 'finance', false),
       ($3, $6, 'staff', 'finance', true), ($4, $5, 'donor', NULL, true)`,
      [U.staffA, U.staffA_off, U.staffB, U.r1, A, B],
    );
    await db.query(
      "INSERT INTO public.donors (id, tenant_id) VALUES ($1, $2), ($3, $4)",
      [DA, A, DB, B],
    );
    await db.query(
      `INSERT INTO public.account_claim_requests (id, tenant_id, donor_id, email, requested_by) VALUES
       ($1, $4, $6, 'a1@x.com', $8), ($2, $4, NULL, 'a2@x.com', $9), ($3, $5, $7, 'b1@x.com', NULL)`,
      [cA1, cA2, cB1, A, B, DA, DB, U.r1, U.r2],
    );
    await db.query(
      `INSERT INTO public.legacy_account_invitations (id, tenant_id, donor_id, email) VALUES
       ($1, $3, $5, 'ia@x.com'), ($2, $4, $6, 'ib@x.com')`,
      [iA, iB, A, B, DA, DB],
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

  tx("1: staff see only their tenant; inactive staff see nothing", async () => {
    expect(await ids("staffA", CLAIMS)).toEqual(sorted(cA1, cA2));
    expect(await ids("staffA", INVITES)).toEqual([iA]);
    expect(await ids("staffB", CLAIMS)).toEqual([cB1]);
    expect(await ids("staffB", INVITES)).toEqual([iB]);
    expect(await ids("staffA_off", CLAIMS)).toEqual([]);
    expect(await ids("staffA_off", INVITES)).toEqual([]);
  });

  tx(
    "1: staff INSERT/UPDATE/DELETE fail with 42501; B's rows byte-identical",
    async () => {
      for (const t of TABLES) {
        const before = await snap(t);
        const donor = t === CLAIMS ? "NULL" : `'${DA}'`;
        for (const sql of [
          `INSERT INTO public.${t} (tenant_id, donor_id, email) VALUES ('${A}', ${donor}, 'n@x.com')`,
          `UPDATE public.${t} SET email = 'h@x.com' WHERE tenant_id = '${B}'`,
          `UPDATE public.${t} SET email = 'h@x.com' WHERE tenant_id = '${A}'`,
          `DELETE FROM public.${t} WHERE tenant_id = '${B}'`,
          `DELETE FROM public.${t} WHERE tenant_id = '${A}'`,
        ])
          expect((await as("staffA", sql)).code, `${t}: ${sql}`).toBe("42501");
        expect(await snap(t)).toBe(before);
      }
    },
  );

  tx(
    "2: a requester sees exactly their own claim requests; INSERT fails with 42501",
    async () => {
      expect(await ids("r1", CLAIMS)).toEqual([cA1]);
      expect(await ids("r2", CLAIMS)).toEqual([cA2]);
      const ins = await as(
        "r1",
        `INSERT INTO public.account_claim_requests (tenant_id, email, requested_by) VALUES ($1, 'me@x.com', $2)`,
        [A, U.r1],
      );
      expect(ins.code).toBe("42501");
    },
  );

  tx(
    "3: non-staff see 0 invitations; anon has no privilege; authenticated holds SELECT only",
    async () => {
      expect(await ids("r1", INVITES)).toEqual([]);
      expect(await ids("r2", INVITES)).toEqual([]);
      for (const t of TABLES) {
        expect((await run(`SELECT 1 FROM public.${t}`, [], "anon")).code).toBe(
          "42501",
        );
      }
      expect(await privileges()).toEqual(EXPECTED_PRIVS);
    },
  );

  const EXPECTED_PRIVS = TABLES.flatMap((t) =>
    PRIVS.flatMap((p) => [
      `anon ${t} ${p} f`,
      `authenticated ${t} ${p} ${p === "SELECT" ? "t" : "f"}`,
    ]),
  ).sort();
  const privileges = async () =>
    (
      await rows(
        `SELECT r || ' ' || t || ' ' || p || ' ' || CASE WHEN has_table_privilege(r, 'public.' || t, p) THEN 't' ELSE 'f' END AS v
         FROM unnest(array['anon', 'authenticated']) r, unnest($1::text[]) t, unnest($2::text[]) p`,
        [TABLES, PRIVS],
      )
    )
      .map((r) => r.v as string)
      .sort();

  tx(
    "4: after hosted-style GRANT ALL to anon/authenticated, re-applying the forward file restores criterion 3",
    async () => {
      await db.query(
        `GRANT ALL ON public.${CLAIMS}, public.${INVITES} TO anon, authenticated, PUBLIC`,
      );
      await db.query(body(MIGRATION));
      expect(await privileges()).toEqual(EXPECTED_PRIVS);
      const pub = await one(
        `SELECT count(*)::int FROM pg_class c, aclexplode(c.relacl) a WHERE c.oid IN ('public.${CLAIMS}'::regclass, 'public.${INVITES}'::regclass) AND a.grantee = 0`,
      );
      expect(pub, "no PUBLIC grant").toBe(0);
    },
  );

  tx(
    "5: a cross-tenant donor fails 23503 on the composite FK; NULL donor_id: claim ok, invitation 23502",
    async () => {
      for (const t of TABLES) {
        const r = await run(
          `INSERT INTO public.${t} (tenant_id, donor_id, email) VALUES ($1, $2, 'x@x.com')`,
          [A, DB],
        );
        expect(r.code, t).toBe("23503");
        const def = await one(
          "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = $1::regclass AND conname = $2",
          [`public.${t}`, (r.e as { constraint?: string }).constraint],
        );
        expect(def).toBe(
          "FOREIGN KEY (tenant_id, donor_id) REFERENCES donors(tenant_id, id)",
        );
      }
      const ok = await run(
        "INSERT INTO public.account_claim_requests (tenant_id, donor_id, email) VALUES ($1, NULL, 'x@x.com')",
        [A],
      );
      expect(ok.code).toBeUndefined();
      const inv = await run(
        "INSERT INTO public.legacy_account_invitations (tenant_id, donor_id, email) VALUES ($1, NULL, 'x@x.com')",
        [A],
      );
      expect(inv.code).toBe("23502");
    },
  );

  tx(
    "6: out-of-set status fails 23514, every listed status is accepted; defaults pending/sent",
    async () => {
      for (const [t, set] of [
        [CLAIMS, CLAIM_STATUSES],
        [INVITES, INVITE_STATUSES],
      ] as const) {
        const ins = (s: string) =>
          run(
            `INSERT INTO public.${t} (tenant_id, donor_id, email, status) VALUES ($1, $2, 'x@x.com', $3)`,
            [A, DA, s],
          );
        for (const bad of ["bogus", "Pending", "SENT", ""])
          expect((await ins(bad)).code, `${t} ${bad}`).toBe("23514");
        for (const s of set)
          expect((await ins(s)).code, `${t} ${s}`).toBeUndefined();
      }
      expect(
        await one(
          "SELECT status FROM public.account_claim_requests WHERE id = $1",
          [cA1],
        ),
      ).toBe("pending");
      expect(
        await one(
          "SELECT status FROM public.legacy_account_invitations WHERE id = $1",
          [iA],
        ),
      ).toBe("sent");
    },
  );

  tx(
    "7: an invitation without expires_at expires now() + 7 days (±1 minute)",
    async () => {
      const drift = await one(
        "SELECT abs(extract(epoch FROM expires_at - (clock_timestamp() + interval '7 days')))::float FROM public.legacy_account_invitations WHERE id = $1",
        [iA],
      );
      expect(drift as number).toBeLessThanOrEqual(60);
    },
  );

  tx(
    "8: email_normalized = normalize_email(email), follows UPDATE, can't be written; blank email 23514",
    async () => {
      for (const t of TABLES) {
        for (const [raw, want] of [
          [" Foo@Bar.COM ", "foo@bar.com"],
          ["ＦＯＯ@ＢＡＲ.ＣＯＭ", "foo@bar.com"],
        ]) {
          const r = await run(
            `INSERT INTO public.${t} (tenant_id, donor_id, email) VALUES ($1, $2, $3) RETURNING email, email_normalized, public.normalize_email(email) AS n`,
            [A, DA, raw],
          );
          expect(r.rows, `${t} ${raw}`).toEqual([
            { email: raw, email_normalized: want, n: want },
          ]);
        }
        const k = t === CLAIMS ? cA1 : iA;
        const up = await run(
          `UPDATE public.${t} SET email = ' Other@X.COM' WHERE id = $1 RETURNING email_normalized`,
          [k],
        );
        expect(up.rows).toEqual([{ email_normalized: "other@x.com" }]);
        expect(
          (
            await run(
              `INSERT INTO public.${t} (tenant_id, donor_id, email, email_normalized) VALUES ($1, $2, 'a@x.com', 'a@x.com')`,
              [A, DA],
            )
          ).code,
        ).toBe("428C9");
        expect(
          (
            await run(
              `UPDATE public.${t} SET email_normalized = 'b@x.com' WHERE id = $1`,
              [k],
            )
          ).code,
        ).toBe("428C9");
        for (const blank of ["   ", "", " \u00a0\u3000"])
          expect(
            (
              await run(
                `INSERT INTO public.${t} (tenant_id, donor_id, email) VALUES ($1, $2, $3)`,
                [A, DA, blank],
              )
            ).code,
            `${t} ${JSON.stringify(blank)}`,
          ).toBe("23514");
        expect(
          await one(
            `SELECT count(*)::int FROM public.${t} WHERE email_normalized IS DISTINCT FROM public.normalize_email(email)`,
          ),
        ).toBe(0);
      }
    },
  );

  tx(
    "9: link_token_sha256 takes exactly 32 bytes with an expiry; raw secrets 23514; duplicates 23505",
    async () => {
      const put = (hash: string | null, exp: string | null, t = A, d = DA) =>
        run(
          `INSERT INTO public.legacy_account_invitations (tenant_id, donor_id, email, link_token_sha256, link_token_expires_at)
         VALUES ($1, $2, 'x@x.com', ${hash ?? "NULL"}, ${exp ?? "NULL"})`,
          [t, d],
        );
      const h32 = "sha256('acc2255-token'::bytea)";
      const exp = "now() + interval '1 hour'";
      expect((await put(h32, exp)).code).toBeUndefined();
      for (const raw of [
        "sha224('t'::bytea)",
        `convert_to(repeat('ab', 28), 'UTF8')`,
        `convert_to('123456', 'UTF8')`,
        `convert_to('https://p.supabase.co/auth/v1/verify?token=' || repeat('ab', 28) || '&type=invite', 'UTF8')`,
        `convert_to(encode(sha256('t'::bytea), 'hex'), 'UTF8')`,
        "''::bytea",
      ])
        expect((await put(raw, exp)).code, raw).toBe("23514");
      expect((await put(h32, null)).code).toBe("23514");
      expect((await put(null, exp)).code).toBe("23514");
      expect((await put(null, null)).code).toBeUndefined();
      const dup = await run(
        `INSERT INTO public.legacy_account_invitations (tenant_id, donor_id, email, link_token_sha256, link_token_expires_at)
       VALUES ($1, $2, 'x@x.com', ${h32}, ${exp}), ($3, $4, 'y@x.com', ${h32}, ${exp})`,
        [A, DA, B, DB],
      );
      expect(dup.code).toBe("23505");
      const named = await rows(
        `SELECT c.relname || '.' || a.attname AS col FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid
       WHERE c.oid IN ('public.${CLAIMS}'::regclass, 'public.${INVITES}'::regclass) AND a.attnum > 0 AND NOT a.attisdropped
         AND a.attname ~* '(token|otp|link|secret|url)' ORDER BY 1`,
      );
      expect(named.map((r) => r.col)).toEqual([
        `${INVITES}.link_token_expires_at`,
        `${INVITES}.link_token_sha256`,
      ]);
      const comment = await one(
        `SELECT col_description('public.${INVITES}'::regclass, (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.${INVITES}'::regclass AND attname = 'link_token_sha256'))`,
      );
      expect(comment).toMatch(/never/i);
      expect(comment).toMatch(/raw/i);
    },
  );

  tx(
    "10: RLS enabled + forced, exactly the 3 SELECT policies to authenticated, owner super/bypassrls, not an exception",
    async () => {
      const flags = await rows(
        `SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity, r.rolsuper OR r.rolbypassrls AS owner_ok
       FROM pg_class c JOIN pg_roles r ON r.oid = c.relowner WHERE c.oid IN ('public.${CLAIMS}'::regclass, 'public.${INVITES}'::regclass) ORDER BY 1`,
      );
      expect(flags).toEqual(
        TABLES.map((t) => ({
          relname: t,
          relrowsecurity: true,
          relforcerowsecurity: true,
          owner_ok: true,
        })),
      );
      const pols = await rows(
        `SELECT tablename, policyname, cmd, roles::text[] AS roles, permissive, with_check,
              qual FROM pg_policies
       WHERE schemaname = 'public' AND tablename = ANY($1) ORDER BY 1, 2`,
        [TABLES],
      );
      const REQ =
        /^\(requested_by = \( SELECT auth\.uid\(\) AS uid\)\)$|^\(\( SELECT auth\.uid\(\) AS uid\) = requested_by\)$/;
      for (const p of pols) p.qual = String(p.qual).replace(REQ, "requester");
      expect(pols).toEqual(
        POLICIES.map(([t, n]) => ({
          tablename: t,
          policyname: n,
          cmd: "SELECT",
          roles: ["authenticated"],
          permissive: "PERMISSIVE",
          with_check: null,
          qual: n.endsWith("_requester_select")
            ? "requester"
            : "authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])",
        })),
      );
      if (existsSync(EXCEPTIONS))
        for (const t of TABLES) expect(read(EXCEPTIONS)).not.toContain(t);
    },
  );

  tx(
    "11: PKs (tenant_id, id), tenant FK, composite donor FKs, user FKs ON DELETE SET NULL, exact columns and indexes",
    async () => {
      for (const t of TABLES) {
        const cons = (
          await rows(
            `SELECT contype::text || ' ' || pg_get_constraintdef(oid) AS d FROM pg_constraint
           WHERE conrelid = $1::regclass AND contype IN ('p', 'f') ORDER BY 1`,
            [`public.${t}`],
          )
        ).map((r) => r.d);
        const user =
          t === CLAIMS ? ["requested_by", "resolved_by"] : ["invited_by"];
        expect(cons).toEqual(
          [
            "f FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
            "f FOREIGN KEY (tenant_id, donor_id) REFERENCES donors(tenant_id, id)",
            ...user.map(
              (c) =>
                `f FOREIGN KEY (${c}) REFERENCES auth.users(id) ON DELETE SET NULL`,
            ),
            "p PRIMARY KEY (tenant_id, id)",
          ].sort(),
        );
        const cols = await rows(
          `SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull,
                CASE WHEN a.attgenerated = '' THEN pg_get_expr(d.adbin, d.adrelid) END AS def,
                CASE WHEN a.attgenerated = 's' THEN pg_get_expr(d.adbin, d.adrelid) END AS gen
         FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
         WHERE a.attrelid = $1::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`,
          [`public.${t}`],
        );
        expect(
          cols
            .map((c) => [c.attname, c.type, c.attnotnull, c.def, c.gen])
            .sort(),
        ).toEqual([...COLUMNS[t]!].sort());
        const idx = (
          await rows(
            "SELECT pg_get_indexdef(indexrelid) AS d FROM pg_index WHERE indrelid = $1::regclass",
            [`public.${t}`],
          )
        ).map((r) =>
          (r.d as string).replace(
            /^CREATE (UNIQUE )?INDEX \S+ ON/,
            "$1INDEX ON",
          ),
        );
        expect(idx.sort()).toEqual([...INDEXES[t]!].sort());
      }
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
        UNION ALL SELECT 'col ' || attrelid::regclass || '.' || attname || ' ' || coalesce(col_description(attrelid, attnum), '') FROM pg_attribute WHERE attnum > 0 AND NOT attisdropped
          AND attrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace)`)
    )
      .map((r) => r.v as string)
      .sort();
  const ours = (v: string) =>
    /account_claim_requests|legacy_account_invitations/.test(v);

  tx(
    "12: re-applying the forward file succeeds twice and changes no catalog row",
    async () => {
      const before = await catalog();
      await db.query(body(MIGRATION));
      await db.query(body(MIGRATION));
      expect(await catalog()).toEqual(before);
    },
  );

  tx(
    "13: rollback removes both tables and nothing else; #2254 survives; forward re-creates them",
    async () => {
      await db.query(
        "DELETE FROM public.legacy_account_invitations; DELETE FROM public.account_claim_requests",
      );
      const before = await catalog();
      await db.query(body(ROLLBACK));
      const after = await catalog();
      for (const t of TABLES)
        expect(
          await one("SELECT to_regclass($1)::text", [`public.${t}`]),
        ).toBeNull();
      expect(
        after.filter((v) => !before.includes(v)),
        "rollback added nothing",
      ).toEqual([]);
      expect(
        before.filter((v) => !after.includes(v) && !ours(v)),
        "rollback removed only #2255 objects",
      ).toEqual([]);
      expect(
        await one(
          "SELECT to_regprocedure('public.normalize_email(text)')::text",
        ),
      ).toBe("normalize_email(text)");
      expect(
        await one(
          `SELECT count(*)::int FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname IN ('email_normalized', 'email_verified_at') AND NOT attisdropped`,
        ),
      ).toBe(2);
      await db.query(body(MIGRATION));
      expect(await catalog()).toEqual(before);
    },
  );
});
