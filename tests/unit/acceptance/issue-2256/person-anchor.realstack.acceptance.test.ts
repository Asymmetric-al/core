import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { UNADMITTED_TABLE_GRANTS_SQL } from "../../../../scripts/verify/tenant-rls-catalog.mjs";
import {
  CONSTRAINTS,
  EXCEPTIONS,
  READER_FUNCTIONS,
  READER_POLICIES,
  read,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const POINTER = "see docs/security/identity-person-anchor.md and #2267";
const RETIRED =
  "D-18, AL-2678 (WP5 part 1, plan lines 988 and 1011): the empty persons scaffold of #2256 is dropped and public.parties with donors.party_id and missionaries.party_id takes its place, so each assertion on persons now proves its absence and the same property of the Party that replaces it";
const NOT_A_TENANT_READER = new Set([
  "donors_fill_party_after_insert_temp true",
  "donor_party_for_insert true",
]);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "OQ9: the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2256 person anchor on the real stack", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = () => randomUUID();
  const [A, B, PA, PB, MA] = [id(), id(), id(), id(), id()];
  const [DA1, DA2, DB] = [id(), id(), id()];
  const USERS = ["staffA", "staffA_off", "staffB", "u"] as const;
  const U = Object.fromEntries(USERS.map((k) => [k, id()])) as Record<
    (typeof USERS)[number],
    string
  >;
  const rows = async (sql: string, p: unknown[] = []) =>
    (await db.query(sql, p)).rows;
  const one = async (sql: string, p: unknown[] = []) =>
    Object.values((await rows(sql, p))[0] ?? {})[0];

  async function run(
    sql: string,
    p: unknown[] = [],
    role = "",
    sub = "",
    tenant = "",
  ) {
    await db.query("SAVEPOINT s");
    try {
      if (role) {
        await db.query(`SET LOCAL ROLE ${role}`);
        await db.query(
          "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true), set_config('request.headers', $3, true)",
          [
            sub,
            JSON.stringify({ sub: sub || null, role }),
            tenant ? JSON.stringify({ "x-asym-tenant": tenant }) : "",
          ],
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
    run(sql, p, "authenticated", U[who], who === "staffB" ? B : A);
  const partyIds = async (who: keyof typeof U) =>
    (
      await as(
        who,
        "SELECT id FROM public.parties WHERE id = ANY($1::uuid[]) ORDER BY id",
        [[PA, PB]],
      )
    ).rows.map((r) => r.id as string);

  async function fixture() {
    await db.query(
      `INSERT INTO public.tenants (id, name, slug) VALUES ($1::uuid, 'acc2256 a', 'acc2256-a-' || $1::text), ($2::uuid, 'acc2256 b', 'acc2256-b-' || $2::text)`,
      [A, B],
    );
    await db.query("INSERT INTO auth.users (id) SELECT unnest($1::uuid[])", [
      Object.values(U),
    ]);
    await db.query(
      "DELETE FROM authz.memberships WHERE user_id = ANY($1::uuid[])",
      [Object.values(U)],
    );
    await db.query(
      `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active) VALUES
       ($1, $4, 'staff', 'finance', true), ($2, $4, 'staff', 'finance', false), ($3, $5, 'staff', 'finance', true)`,
      [U.staffA, U.staffA_off, U.staffB, A, B],
    );
    await db.query(
      "INSERT INTO public.parties (tenant_id, id, display_name) VALUES ($1, $2, 'Party A'), ($3, $4, 'Party B')",
      [A, PA, B, PB],
    );
    await db.query(
      "WITH entity AS (INSERT INTO public.legal_entities(tenant_id,name,country_code,currency,legal_name) VALUES ($2,'Fixture','US','usd','Fixture') RETURNING id) INSERT INTO public.missionaries (id, tenant_id, legal_entity_id, party_id) SELECT $1, $2, id, $3 FROM entity",
      [MA, A, PA],
    );
    await db.query(
      "INSERT INTO public.donors (id, tenant_id) VALUES ($1, $3), ($2, $3), ($4, $5)",
      [DA1, DA2, A, DB, B],
    );
  }
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

  it(`1/16: after migrate + seed, no persons table and no person_id column remain; every missionary names its Party and every donor with a tenant names one (${RETIRED})`, async () => {
    expect(await one("SELECT to_regclass('public.persons')")).toBeNull();
    expect(
      await one(
        "SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'person_id'",
      ),
    ).toBe("0");
    expect(
      await one(
        "SELECT (SELECT count(*) FROM public.missionaries WHERE party_id IS NULL) + (SELECT count(*) FROM public.donors WHERE tenant_id IS NOT NULL AND party_id IS NULL)",
      ),
    ).toBe("0");
  });

  it("1: parties has the persons anchor's keys: primary key id, UNIQUE (tenant_id, id), a tenant key that restricts deletion, RLS enabled + forced", async () => {
    expect(
      (
        await rows(
          `SELECT conname, pg_get_constraintdef(oid) d FROM pg_constraint WHERE conrelid = 'public.parties'::regclass AND contype IN ('p', 'u', 'f') ORDER BY conname`,
        )
      )
        .map((r) => r.d)
        .sort(),
    ).toEqual(
      [
        "FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT",
        "PRIMARY KEY (id)",
        "UNIQUE (tenant_id, id)",
      ].sort(),
    );
    expect(
      await one(
        "SELECT relrowsecurity AND relforcerowsecurity FROM pg_class WHERE oid = 'public.parties'::regclass",
      ),
    ).toBe(true);
  });

  tx(
    "2: staff see only their tenant's parties; inactive staff and non-members see 0",
    async () => {
      expect(await partyIds("staffA")).toEqual([PA]);
      expect(await partyIds("staffB")).toEqual([PB]);
      expect(await partyIds("staffA_off")).toEqual([]);
      expect(await partyIds("u")).toEqual([]);
    },
  );

  tx("2: staff INSERT/UPDATE/DELETE on parties fail with 42501", async () => {
    for (const sql of [
      `INSERT INTO public.parties (tenant_id, display_name) VALUES ('${A}', 'x')`,
      `UPDATE public.parties SET display_name = 'x' WHERE id = '${PA}'`,
      `DELETE FROM public.parties WHERE id = '${PA}'`,
    ])
      expect((await as("staffA", sql)).code, sql).toBe("42501");
  });

  tx(
    "2: anon has no privilege and SELECT fails 42501; authenticated SELECT only; exactly one signed-in policy; not published",
    async () => {
      expect((await run("SELECT 1 FROM public.parties", [], "anon")).code).toBe(
        "42501",
      );
      expect(
        await one(
          `SELECT string_agg(r || ':' || p, ',' ORDER BY r, p) FROM unnest(array['anon', 'authenticated']) r,
            unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) p
           WHERE has_table_privilege(r, 'public.parties', p)`,
        ),
      ).toBe("authenticated:SELECT");
      expect(
        await one(
          "SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'parties' AND 'authenticated' = ANY(roles)",
        ),
      ).toBe("1");
      expect(
        await one(
          "SELECT count(*) FROM pg_publication_tables WHERE schemaname = 'public' AND tablename = 'parties'",
        ),
      ).toBe("0");
    },
  );

  tx(
    "3: after a hosted-style GRANT ALL to anon/authenticated/PUBLIC, the catalog gate names every widened grant on parties",
    async () => {
      await db.query(
        "GRANT ALL ON TABLE public.parties TO anon, authenticated, PUBLIC",
      );
      const widened = (await rows(UNADMITTED_TABLE_GRANTS_SQL)).filter(
        (r) => r.relation === "parties",
      );
      expect(new Set(widened.map((r) => r.grantee))).toEqual(
        new Set(["PUBLIC", "anon", "authenticated"]),
      );
    },
  );

  tx(
    "4/5: the Party keys are same-tenant only; a missionary names exactly one Party; a donor naming a Party carries a tenant",
    async () => {
      expect(
        await one(
          "SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'missionaries' AND column_name = 'party_id'",
        ),
      ).toBe("NO");
      expect(
        await fails(
          "UPDATE public.missionaries SET party_id = $1 WHERE id = $2",
          [PB, MA],
        ),
      ).toBe("23503");
      expect(
        await fails("UPDATE public.donors SET party_id = $1 WHERE id = $2", [
          PB,
          DA1,
        ]),
      ).toBe("23503");
      expect(
        await fails(
          "UPDATE public.donors SET tenant_id = NULL, party_id = $1 WHERE id = $2",
          [PA, DA1],
        ),
      ).toBe("23514");
      expect(
        await fails(
          "WITH entity AS (SELECT id FROM public.legal_entities WHERE tenant_id = $1 LIMIT 1) INSERT INTO public.missionaries (tenant_id, legal_entity_id) SELECT $1, id FROM entity",
          [A],
        ),
      ).toBe("23502");
      expect(
        await one(
          "SELECT count(*) FROM pg_constraint WHERE conname = ANY($1::text[])",
          [CONSTRAINTS],
        ),
      ).toBe("0");
    },
  );

  tx(
    "4: no donors.person_id; donors.party_id is the donor's Party key",
    async () => {
      expect(
        (
          await rows(
            "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'donors' AND column_name IN ('person_id', 'party_id', 'party_type') ORDER BY 1",
          )
        ).map((r) => r.column_name),
      ).toEqual(["party_id"]);
    },
  );

  tx(
    "5: a referenced Party can't be deleted (23503); an unreferenced one can",
    async () => {
      expect(
        await fails("DELETE FROM public.parties WHERE id = $1", [PA]),
      ).toBe("23503");
      expect(
        await fails("DELETE FROM public.parties WHERE id = $1", [PB]),
      ).toBeUndefined();
    },
  );

  tx(
    `6: profiles.tenant_id is a nullable uuid FK -> tenants(id); the reader set equals §1.3 (${POINTER}; D-18, AL-2678 WP5 rest: the Party writer names profiles and tenant_id but reads only a profile's display_name and full_name by id, never profiles.tenant_id, so it is no reader, as the temporary fill trigger is not)`,
    async () => {
      expect(
        await one(
          `SELECT data_type || ' ' || is_nullable || ' ' || (SELECT count(*) FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass
           AND pg_get_constraintdef(oid) = 'FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT') FROM information_schema.columns
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
      ).toEqual(READER_POLICIES.filter(() => false));
      const fns = await rows(
        `SELECT CASE WHEN p.proname = 'tenant_member_directory'
          THEN p.proname || '(' || oidvectortypes(p.proargtypes) || ')'
          ELSE p.proname END AS proname, p.prosecdef FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname IN ('public', 'authz', 'private') AND p.prosrc ~* '\\mprofiles\\M' AND p.prosrc ~ '\\mtenant_id\\M'`,
      );
      expect(
        fns
          .map((f) => `${f.proname} ${f.prosecdef}`)
          .filter((f) => !NOT_A_TENANT_READER.has(f))
          .sort(),
        `function readers of profiles.tenant_id changed; ${POINTER}`,
      ).toEqual(
        Object.entries(READER_FUNCTIONS)
          .flatMap(([name, definer]) =>
            name === "tenant_member_directory"
              ? [`${name}(uuid) ${definer}`, `${name}(uuid, uuid[]) ${definer}`]
              : [`${name} ${definer}`],
          )
          .sort(),
      );
      const trigger = String(
        await one(
          "SELECT prosrc FROM pg_proc WHERE oid = 'public.donors_fill_party_after_insert_temp()'::regprocedure",
        ),
      );
      expect(trigger).not.toMatch(/\bp\.tenant_id\b|profiles\.tenant_id/);
      const directorySrc = await one(
        "SELECT prosrc FROM pg_proc WHERE oid = 'public.member_care_directory_rows(uuid,uuid,integer)'::regprocedure",
      );
      expect(String(directorySrc)).toMatch(/\bm\.tenant_id\b/);
      expect(String(directorySrc)).not.toMatch(/\b(?:p|profiles)\.tenant_id\b/);
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

  it("9: field_policies holds no person_id row, and five rows for every column of parties", async () => {
    expect(
      await one(
        "SELECT count(*) FROM public.field_policies WHERE field_key = 'person_id'",
      ),
    ).toBe("0");
    expect(
      await one(
        `SELECT count(*) FROM public.field_policies f JOIN information_schema.columns c
           ON c.table_schema = 'public' AND c.table_name = 'parties' AND c.column_name = f.field_key
          WHERE f.record_type = 'parties' AND f.tenant_id IS NULL`,
      ),
    ).toBe(
      String(
        5 *
          Number(
            await one(
              "SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'parties'",
            ),
          ),
      ),
    );
  });

  it("10: parties is not an RLS exception; its owner is superuser or BYPASSRLS (D-18, AL-2678 bot review #9: persons and parties are each checked on their own)", async () => {
    const exceptionTables = JSON.parse(read(EXCEPTIONS)).entries.map(
      (e: { table: string }) => e.table,
    );
    expect(exceptionTables).not.toContain("parties");
    expect(exceptionTables).not.toContain("persons");
    expect(
      await one(
        "SELECT r.rolsuper OR r.rolbypassrls FROM pg_class c JOIN pg_roles r ON r.oid = c.relowner WHERE c.oid = 'public.parties'::regclass",
      ),
    ).toBe(true);
  });

  it("16: no function names person_id, no rule on missionaries, anon/authenticated can't INSERT/UPDATE party_id", async () => {
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
           FROM unnest(array['anon', 'authenticated']) r, unnest(array['INSERT', 'UPDATE']) p, unnest(array['public.missionaries', 'public.donors']) t
           WHERE has_column_privilege(r, t, 'party_id', p)`,
      ),
      "no rule; no anon/authenticated INSERT/UPDATE on party_id",
    ).toBe("0 0");
  });
});
