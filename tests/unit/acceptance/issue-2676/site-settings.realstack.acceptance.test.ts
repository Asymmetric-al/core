import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { caller } from "./site-fixture";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  type Caller,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const SITE_KEYS = ["id", "is_default", "name", "primary_domain", "status"];

describe.skipIf(!ADMIN_URL)(
  "The staff read of an organization's Sites and brand (WP3b part 3, T1)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    for (const key of [
      "UBADM",
      "mBAdm",
      "UMIS",
      "mMis",
      "UNONE",
      "UDUAL",
      "mDualA",
      "mDualB",
      "TC",
      "UCADM",
      "mCAdm",
      "siteA",
      "siteA2",
      "siteA3",
      "siteB",
      "siteB2",
      "homeA",
      "homeB",
    ])
      id[key] = randomUUID();
    const run = caller(db, id);
    const ADM: Caller = {
      sub: "UADM",
      headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mAdm! },
    };
    const BADM: Caller = {
      sub: "UBADM",
      headers: { "x-asym-tenant": id.TB!, "x-asym-assignment": id.mBAdm! },
    };

    beforeAll(async () => {
      await db.connect();
    });
    afterAll(async () => {
      await db.end();
    });

    async function fixture(test: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query("insert into auth.users(id) select unnest($1::uuid[])", [
          [id.UBADM, id.UMIS, id.UNONE, id.UDUAL, id.UCADM],
        ]);
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [[id.UBADM, id.UMIS, id.UNONE, id.UDUAL, id.UCADM]],
        );
        await db.query(
          "insert into public.tenants(id,name,slug) values ($1::uuid,'acc2676 C','acc2676-' || $1::uuid::text)",
          [id.TC],
        );
        await db.query(
          `insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin,is_active) values
             ($1,$2,$3,'staff','development',true,true),
             ($4,$5,$6,'missionary',null,false,true),
             ($7,$8,$6,'staff','development',true,true),
             ($9,$8,$3,'staff','development',true,true),
             ($10,$11,$12,'staff','development',true,true)`,
          [
            id.mBAdm,
            id.UBADM,
            id.TB,
            id.mMis,
            id.UMIS,
            id.TA,
            id.mDualA,
            id.UDUAL,
            id.mDualB,
            id.mCAdm,
            id.UCADM,
            id.TC,
          ],
        );
        await db.query(
          `insert into public.sites(id,tenant_id,name,is_default) values
             ($1,$2,'Default A',true),($3,$2,'Zeta A',false),($4,$2,'Alpha A',false),
             ($5,$6,'Default B secret',true),($7,$6,'Second B secret',false)`,
          [id.siteA, id.TA, id.siteA2, id.siteA3, id.siteB, id.TB, id.siteB2],
        );
        await db.query(
          "update public.sites set status='inactive' where id=$1",
          [id.siteA2],
        );
        await db.query(
          "insert into public.donor_portal_hosts(id,tenant_id) values ($1,$2),($3,$4)",
          [id.homeA, id.TA, id.homeB, id.TB],
        );
        await db.query(
          "insert into public.donor_account_brands(tenant_id,display_name) values ($1,'Brand A'),($2,'Brand B secret')",
          [id.TA, id.TB],
        );
        await test();
      } finally {
        await db.query("rollback");
      }
    }

    const read = (tenant: string | null) =>
      tenant === null
        ? "select public.tenant_site_settings(null) as result"
        : `select public.tenant_site_settings('${tenant}') as result`;

    async function settings(who: Caller, tenant: string) {
      const outcome = await run("authenticated", who, read(tenant));
      expect(outcome.code, outcome.message).toBeNull();
      return outcome.rows[0]!.result as {
        sites: Record<string, unknown>[];
        brand: { display_name: string } | null;
      };
    }

    async function ownerSites(tenant: string) {
      return (
        await db.query(
          "select id::text, name, is_default, status, primary_domain from public.sites where tenant_id=$1 order by is_default desc, name, id",
          [tenant],
        )
      ).rows;
    }

    async function refused(who: Caller, tenant: string | null, code: string) {
      const outcome = await run("authenticated", who, read(tenant));
      expect(outcome.code, `${JSON.stringify(who)}: ${outcome.message}`).toBe(
        code,
      );
      expect(outcome.rows).toEqual([]);
    }

    it("gives A's administrator exactly A's Sites (default first, then name, then id) and A's brand, nothing of B", () =>
      fixture(async () => {
        const answer = await settings(ADM, id.TA!);
        expect(Object.keys(answer).sort()).toEqual(["brand", "sites"]);
        expect(answer.sites).toEqual(await ownerSites(id.TA!));
        expect(answer.sites.map((site) => site.name)).toEqual([
          "Default A",
          "Alpha A",
          "Zeta A",
        ]);
        for (const site of answer.sites)
          expect(Object.keys(site).sort()).toEqual(SITE_KEYS);
        expect(
          answer.sites.find((site) => site.id === id.siteA2),
        ).toMatchObject({
          status: "inactive",
          is_default: false,
          primary_domain: null,
        });
        expect(answer.brand).toEqual({ display_name: "Brand A" });
        const text = JSON.stringify(answer);
        for (const absent of [id.TB!, id.siteB!, id.siteB2!, "secret", id.TA!])
          expect(text).not.toContain(absent);
      }));

    it("refuses with 42501 every caller who may not manage A's Sites, and NULL with 22004", () =>
      fixture(async () => {
        await refused(ADM, id.TB!, "42501");
        await refused(BADM, id.TA!, "42501");
        await refused(
          { sub: "UADM", headers: { "x-asym-assignment": id.mAdm! } },
          id.TA!,
          "42501",
        );
        await refused({ sub: "UADM", headers: {} }, id.TA!, "42501");
        await refused(
          {
            sub: "UDEV",
            headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mDev! },
          },
          id.TA!,
          "42501",
        );
        await refused(
          {
            sub: "UDON",
            headers: {
              "x-asym-tenant": id.TA!,
              "x-asym-assignment": id.mDonA!,
            },
          },
          id.TA!,
          "42501",
        );
        await refused(
          {
            sub: "UMIS",
            headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mMis! },
          },
          id.TA!,
          "42501",
        );
        await refused(
          { sub: "UNONE", headers: { "x-asym-tenant": id.TA! } },
          id.TA!,
          "42501",
        );
        await refused(
          { sub: null, headers: { "x-asym-tenant": id.TA! } },
          id.TA!,
          "42501",
        );
        for (const change of [
          "update authz.memberships set is_tenant_admin=false where id=$1",
          "update authz.memberships set is_active=false, revoked_at=now() where id=$1",
        ]) {
          await db.query("savepoint lost_authority");
          await db.query(change, [id.mAdm]);
          await refused(ADM, id.TA!, "42501");
          await db.query("rollback to savepoint lost_authority");
        }
        for (const status of ["suspended", "closed"]) {
          await db.query("savepoint inactive_tenant");
          await db.query("update public.tenants set status=$1 where id=$2", [
            status,
            id.TA,
          ]);
          await refused(ADM, id.TA!, "42501");
          await db.query("rollback to savepoint inactive_tenant");
        }
        await refused(ADM, null, "22004");
        expect((await settings(ADM, id.TA!)).brand).toEqual({
          display_name: "Brand A",
        });
      }));

    it("shows a person who administers two organizations each one only under its own headers", () =>
      fixture(async () => {
        const fromA: Caller = {
          sub: "UDUAL",
          headers: { "x-asym-tenant": id.TA! },
        };
        const fromB: Caller = {
          sub: "UDUAL",
          headers: { "x-asym-tenant": id.TB! },
        };
        const inA = await settings(fromA, id.TA!);
        expect(inA.brand).toEqual({ display_name: "Brand A" });
        expect(JSON.stringify(inA)).not.toContain("secret");
        const inB = await settings(fromB, id.TB!);
        expect(inB.brand).toEqual({ display_name: "Brand B secret" });
        expect(inB.sites.map((site) => site.id)).toEqual(
          (await ownerSites(id.TB!)).map((site) => site.id),
        );
        expect(JSON.stringify(inB)).not.toContain("Brand A");
        await refused(fromA, id.TB!, "42501");
        await refused(fromB, id.TA!, "42501");
        await refused(
          {
            sub: "UDUAL",
            headers: {
              "x-asym-tenant": id.TA!,
              "x-asym-assignment": id.mDualA!,
            },
          },
          id.TB!,
          "42501",
        );
      }));

    it("answers an organization with neither Sites nor brand with an empty list and a null brand", () =>
      fixture(async () => {
        expect(
          await settings(
            {
              sub: "UCADM",
              headers: {
                "x-asym-tenant": id.TC!,
                "x-asym-assignment": id.mCAdm!,
              },
            },
            id.TC!,
          ),
        ).toEqual({ sites: [], brand: null });
      }));

    it("writes no audit row and changes no Site or brand", () =>
      fixture(async () => {
        const state = async () =>
          (
            await db.query(
              `select (select count(*)::int from public.audit_logs where tenant_id=$1) as audits,
                      (select jsonb_agg(to_jsonb(s) order by s.id) from public.sites s where s.tenant_id=$1) as sites,
                      (select to_jsonb(b) from public.donor_account_brands b where b.tenant_id=$1) as brand`,
              [id.TA],
            )
          ).rows[0];
        const before = await state();
        const outcome = await run("authenticated", ADM, read(id.TA!), true);
        expect(outcome.code, outcome.message).toBeNull();
        expect(await state()).toEqual(before);
      }));

    it("gives anon and service_role no EXECUTE on either function", () =>
      fixture(async () => {
        const grants = await db.query(
          `select f.name, r.role_name, has_function_privilege(r.role_name, f.name::regprocedure, 'EXECUTE') as granted
             from unnest(array['public.tenant_site_settings(uuid)','tenant_guard.tenant_site_settings(uuid)']) f(name)
            cross join unnest(array['anon','service_role','authenticated']) r(role_name)
            order by 1, 2`,
        );
        expect(
          grants.rows.map((row) => [row.name, row.role_name, row.granted]),
        ).toEqual([
          ["public.tenant_site_settings(uuid)", "anon", false],
          ["public.tenant_site_settings(uuid)", "authenticated", true],
          ["public.tenant_site_settings(uuid)", "service_role", false],
          ["tenant_guard.tenant_site_settings(uuid)", "anon", false],
          ["tenant_guard.tenant_site_settings(uuid)", "authenticated", true],
          ["tenant_guard.tenant_site_settings(uuid)", "service_role", false],
        ]);
        for (const role of ["anon", "service_role"]) {
          const outcome = await run(role, ADM, read(id.TA!));
          expect(outcome.code, `${role}: ${outcome.message}`).toBe("42501");
        }
      }));

    it("has the owners, security, volatility and grants the migration's check after the release names", async () => {
      const { rows } = await db.query(
        `select p.oid::regprocedure::text as fn, p.prosecdef, p.provolatile, p.proisstrict,
                p.proowner::regrole::text as owner, p.proconfig,
                (select coalesce(array_agg(case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                                           order by a.grantee), '{}')
                   from aclexplode(p.proacl) a
                  where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) as execute_grantees
           from pg_proc p
          where p.oid in (to_regprocedure('tenant_guard.tenant_site_settings(uuid)'),
                          to_regprocedure('public.tenant_site_settings(uuid)'))
          order by fn`,
      );
      expect(rows).toEqual([
        {
          fn: "public.tenant_site_settings(uuid)",
          prosecdef: false,
          provolatile: "v",
          proisstrict: false,
          owner: "postgres",
          proconfig: ['search_path=""'],
          execute_grantees: ["authenticated"],
        },
        {
          fn: "tenant_guard.tenant_site_settings(uuid)",
          prosecdef: true,
          provolatile: "v",
          proisstrict: false,
          owner: "tenant_guard",
          proconfig: ['search_path=""'],
          execute_grantees: ["authenticated"],
        },
      ]);
    });
  },
);
