import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const FN = "public.donor_is_restricted_party(public.donors)";
const LOGINS = ["L", "L1", "L2", "M", "W"] as const;

type Ids = Record<string, string>;
function fresh(): Ids {
  const made: Ids = {};
  return new Proxy(made, {
    get: (target, key: string) => (target[key] ??= randomUUID()),
  });
}

const q = (value: string) => `'${value}'`;
const party = (v: Ids, key: string, tenant: string, level: string) =>
  `insert into public.parties (id, tenant_id, display_name, security_level, security_level_source) values (${q(v[key]!)}, ${q(v[tenant]!)}, 'r2s ${key}', '${level}', 'manual');`;
const donor = (
  v: Ids,
  key: string,
  tenant: string,
  partyKey: string | null,
  login: string | null,
) =>
  `insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values (${q(v[key]!)}, ${q(v[tenant]!)}, ${partyKey ? q(v[partyKey]!) : "null"}, ${login ? q(v[login]!) : "null"}, 'r2s ${key}', 'r2s-' || ${q(v[key]!)} || '@example.test');`;
const worker = (
  v: Ids,
  key: string,
  tenant: string,
  partyKey: string,
  login: string,
) =>
  `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values (${q(v[key]!)}, ${q(v[tenant]!)}, ${q(v[partyKey]!)}, ${q(v[login]!)}, ${q(v[tenant]!)});`;
const link = (v: Ids, tenant: string, login: string, partyKey: string) =>
  `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values (${q(v[tenant]!)}, ${q(v[login]!)}, ${q(v[partyKey]!)}, 'account_claim');`;

type Step = { sql: string; expected: boolean };
type Case = [string, (v: Ids) => Step[]];

const TRUTH: Case[] = [
  [
    "T1 own Party standard, no login, no link",
    (v) => [
      {
        sql: party(v, "P", "TA", "standard") + donor(v, "D", "TA", "P", null),
        expected: false,
      },
    ],
  ],
  [
    "T2 own Party sensitive",
    (v) => [
      {
        sql: party(v, "P", "TA", "sensitive") + donor(v, "D", "TA", "P", null),
        expected: false,
      },
    ],
  ],
  [
    "T3 own Party restricted",
    (v) => [
      {
        sql: party(v, "P", "TA", "restricted") + donor(v, "D", "TA", "P", null),
        expected: true,
      },
    ],
  ],
  [
    "T4 own Party high_risk",
    (v) => [
      {
        sql: party(v, "P", "TA", "high_risk") + donor(v, "D", "TA", "P", null),
        expected: true,
      },
    ],
  ],
  [
    "T5 the donor shares a restricted worker's Party: the restricted worker who gives",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "restricted") +
          worker(v, "MW", "TA", "P", "W") +
          donor(v, "D", "TA", "P", "W"),
        expected: true,
      },
    ],
  ],
  [
    "T6 the donor's login is linked in another organization to a restricted Party",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          donor(v, "D", "TA", "P", "L") +
          link(v, "TB", "L", "PB"),
        expected: true,
      },
    ],
  ],
  [
    "T7 the donor's login is a restricted worker in another organization, with no link",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          donor(v, "D", "TA", "P", "L") +
          worker(v, "MB", "TB", "PB", "L"),
        expected: true,
      },
    ],
  ],
  [
    "T8 the donor's login is a donor on a restricted Party in another organization",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          donor(v, "D", "TA", "P", "L") +
          donor(v, "DB", "TB", "PB", "L"),
        expected: true,
      },
    ],
  ],
  [
    "T9 a claimed donor with no login of its own: the login linked to its Party is restricted elsewhere",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          donor(v, "D", "TA", "P", null) +
          link(v, "TA", "L", "P") +
          link(v, "TB", "L", "PB"),
        expected: true,
      },
    ],
  ],
  [
    "T10 a donor with no login on a worker's Party: the worker's login is a restricted donor elsewhere",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          worker(v, "MA", "TA", "P", "L") +
          donor(v, "D", "TA", "P", null) +
          donor(v, "DB", "TB", "PB", "L"),
        expected: true,
      },
    ],
  ],
  [
    "T11 an organization but no Party",
    (v) => [
      {
        sql:
          "alter table public.donors disable trigger donors_fill_party_after_insert_temp;" +
          donor(v, "D", "TA", null, null),
        expected: true,
      },
    ],
  ],
  [
    "T12 no organization, so no Party",
    (v) => [
      {
        sql: `insert into public.donors (id, tenant_id, name, email) values (${q(v.D!)}, null, 'r2s D', 'r2s-' || ${q(v.D!)} || '@example.test');`,
        expected: true,
      },
    ],
  ],
  [
    "T14 every linked Party standard or sensitive, in both organizations",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "standard") +
          party(v, "PS", "TA", "sensitive") +
          donor(v, "D", "TA", "P", "L") +
          link(v, "TB", "L", "PB") +
          worker(v, "MS", "TA", "PS", "L"),
        expected: false,
      },
    ],
  ],
  [
    "T15 another, unrelated login restricted in the same organization",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PM", "TA", "restricted") +
          donor(v, "D", "TA", "P", "L") +
          worker(v, "MM", "TA", "PM", "M"),
        expected: false,
      },
    ],
  ],
  [
    "T16 a restriction lifted and set again shows at the next read",
    (v) => [
      {
        sql: party(v, "P", "TA", "restricted") + donor(v, "D", "TA", "P", null),
        expected: true,
      },
      {
        sql: `update public.parties set security_level = 'standard' where id = ${q(v.P!)};`,
        expected: false,
      },
      {
        sql: `update public.parties set security_level = 'restricted' where id = ${q(v.P!)};`,
        expected: true,
      },
    ],
  ],
  [
    "T17 a level the rule does not know, then none at all",
    (v) => [
      {
        sql: party(v, "P", "TA", "standard") + donor(v, "D", "TA", "P", null),
        expected: false,
      },
      {
        sql: `alter table public.parties drop constraint parties_security_level_check;
              alter table public.parties alter column security_level drop not null;
              update public.parties set security_level = 'unknown' where id = ${q(v.P!)};`,
        expected: true,
      },
      {
        sql: `update public.parties set security_level = null where id = ${q(v.P!)};`,
        expected: true,
      },
    ],
  ],
  [
    "T18 a Party with two logins: the donor's own login is standard everywhere, the other is restricted elsewhere (Q4)",
    (v) => [
      {
        sql:
          party(v, "P", "TA", "standard") +
          party(v, "PB", "TB", "restricted") +
          donor(v, "D", "TA", "P", "L1") +
          link(v, "TA", "L1", "P") +
          link(v, "TA", "L2", "P") +
          link(v, "TB", "L2", "PB"),
        expected: true,
      },
    ],
  ],
];

const BASE = (v: Ids) => {
  const logins = LOGINS.map((k) => q(v[k]!)).join(", ");
  return `insert into public.tenants (id, name, slug) values (${q(v.TA!)}, 'r2s A', 'r2s-a-' || ${q(v.TA!)}), (${q(v.TB!)}, 'r2s B', 'r2s-b-' || ${q(v.TB!)});
    insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values (${q(v.TA!)}, ${q(v.TA!)}, 'A', 'US', 'usd', 'A'), (${q(v.TB!)}, ${q(v.TB!)}, 'B', 'US', 'usd', 'B');
    insert into auth.users (id, email, email_confirmed_at) select u, 'r2s-' || u || '@example.test', now() from unnest(array[${logins}]::uuid[]) u;
    delete from authz.memberships where user_id = any(array[${logins}]::uuid[]);`;
};

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r2s: public.donor_is_restricted_party, the one fact a colleague's reader asks (ruling point 2; Q4)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(async () => {
      await db.connect();
    });
    afterAll(async () => {
      await db.end();
    });

    const read = async (donorId: string) => {
      const r = await db.query(
        "select v, v is not null as known from (select public.donor_is_restricted_party(d) as v from public.donors as d where d.id = $1) as s",
        [donorId],
      );
      expect(r.rows, "the donor row is read").toHaveLength(1);
      return r.rows[0] as { v: boolean | null; known: boolean };
    };

    it.each(TRUTH)("%s", async (_label, build) => {
      const v = fresh();
      await db.query("begin");
      try {
        await db.query(BASE(v));
        for (const step of build(v)) {
          await db.query(step.sql);
          const got = await read(v.D!);
          expect(got.known).toBe(true);
          expect(got.v).toBe(step.expected);
        }
      } finally {
        await db.query("rollback");
      }
    });

    it("T13 a NULL row is restricted, never NULL", async () => {
      const r = await db.query(
        "select public.donor_is_restricted_party(null::public.donors) as v",
      );
      expect(r.rows[0].v).toBe(true);
    });

    it("the function is a service-key definer owned by postgres with an empty search path, stable, boolean, executable only by postgres and service_role, and its body never names profiles", async () => {
      const r = await db.query(
        `select pg_catalog.pg_get_userbyid(p.proowner) as owner, p.prosecdef, p.proconfig, p.provolatile,
                p.prorettype::regtype::text as returns,
                p.prosrc ~* '\\mprofiles\\M' as names_profiles,
                p.prosrc ~ '--' as has_comment,
                (select coalesce(array_agg(distinct case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end order by 1), '{}')
                   from pg_catalog.aclexplode(p.proacl) as a) as grantees,
                (select coalesce(array_agg(distinct a.privilege_type order by 1), '{}')
                   from pg_catalog.aclexplode(p.proacl) as a
                  where a.grantee = 'service_role'::regrole) as service_role_privileges,
                pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE') as anon_executes,
                pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_executes,
                pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_executes
           from pg_catalog.pg_proc as p
          where p.oid = to_regprocedure($1)`,
        [FN],
      );
      expect(r.rows).toHaveLength(1);
      expect(r.rows[0]).toEqual({
        owner: "postgres",
        prosecdef: true,
        proconfig: ['search_path=""'],
        provolatile: "s",
        returns: "boolean",
        names_profiles: false,
        has_comment: false,
        grantees: ["postgres", "service_role"],
        service_role_privileges: ["EXECUTE"],
        anon_executes: false,
        authenticated_executes: false,
        service_role_executes: true,
      });
    });

    it("the two indexes it reads by login exist with r2a's one definition", async () => {
      const r = await db.query(
        `select c.relname as name, pg_catalog.pg_get_indexdef(c.oid) as def
           from pg_catalog.pg_class as c
          where c.oid in (to_regclass('public.missionaries_profile_party_idx'), to_regclass('public.donors_profile_party_idx'))
          order by 1`,
      );
      expect(r.rows).toEqual([
        {
          name: "donors_profile_party_idx",
          def: "CREATE INDEX donors_profile_party_idx ON public.donors USING btree (profile_id, tenant_id, party_id) WHERE (profile_id IS NOT NULL)",
        },
        {
          name: "missionaries_profile_party_idx",
          def: "CREATE INDEX missionaries_profile_party_idx ON public.missionaries USING btree (profile_id, tenant_id, party_id) WHERE (profile_id IS NOT NULL)",
        },
      ]);
    });

    it("guard: on the seeded database no donor is restricted, so nothing a seeded screen shows moves", async () => {
      const r = await db.query(
        "select count(*)::int as n from public.donors as d where public.donor_is_restricted_party(d)",
      );
      expect(r.rows[0].n).toBe(0);
    });
  },
);
