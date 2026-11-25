import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  HOME_SURFACES,
  SITE_TABLES,
  claimSql,
  homeAsAnon,
  resolveAsAnon,
  setProofsSql,
} from "./site-fixture";
import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const MANIFEST = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        "../../../../docs/security/field-policies/manifest.json",
        import.meta.url,
      ),
    ),
    "utf8",
  ),
) as {
  surfaces: string[];
  record_types: Record<string, Record<string, Record<string, string>>>;
};

describe.skipIf(!ADMIN_URL)(
  "the anonymous home read, public.resolve_home_host",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    type Fixture = {
      ta: string;
      tb: string;
      siteA: string;
      siteB: string;
      homeA: string;
      homeB: string;
      siteNameA: string;
      siteNameB: string;
      homeRecordA: string;
      homeRecordB: string;
    };

    async function fixture(run: (f: Fixture) => Promise<void>) {
      const ta = randomUUID();
      const tb = randomUUID();
      const f: Fixture = {
        ta,
        tb,
        siteA: randomUUID(),
        siteB: randomUUID(),
        homeA: `home.${ta}.example.org`,
        homeB: `home.${tb}.example.org`,
        siteNameA: `site.${ta}.example.org`,
        siteNameB: `site.${tb}.example.org`,
        homeRecordA: randomUUID(),
        homeRecordB: randomUUID(),
      };
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants(id,name,slug) values ($1::uuid,'Home A','home-'||$1::uuid::text),($2::uuid,'Home B','home-'||$2::uuid::text)",
          [f.ta, f.tb],
        );
        await db.query(
          "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default A',true),($3,$4,'Default B',true)",
          [f.siteA, f.ta, f.siteB, f.tb],
        );
        for (const [tenant, home, site, name] of [
          [f.ta, f.homeA, f.siteA, f.siteNameA],
          [f.tb, f.homeB, f.siteB, f.siteNameB],
        ] as const) {
          await db.query(
            claimSql({ host: home, tenant, surfaces: HOME_SURFACES }),
          );
          await db.query(
            claimSql({ host: name, tenant, site, surfaces: ["website"] }),
          );
        }
        await db.query(
          "insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ($1,$2,$3),($4,$5,$6)",
          [f.homeRecordA, f.ta, f.homeA, f.homeRecordB, f.tb, f.homeB],
        );
        await db.query("set constraints all immediate");
        await db.query("set constraints all deferred");
        await run(f);
      } finally {
        await db.query("rollback");
      }
    }

    const home = (domain: string) => [{ primary_domain: domain }];

    it("gives an active website name that is not home exactly its organization's home, in every HTTP spelling", () =>
      fixture(async (f) => {
        for (const spelling of [
          f.siteNameA,
          f.siteNameA.toUpperCase(),
          `${f.siteNameA}.`,
          `${f.siteNameA}:443`,
        ])
          expect(await homeAsAnon(db, spelling), spelling).toEqual(
            home(f.homeA),
          );
      }));

    it("gives nothing for the home itself, a ready or claimed name, an unknown name, an active name without website, over 300 bytes or NULL", () =>
      fixture(async (f) => {
        const ready = `ready.${f.ta}.example.org`;
        const claimed = `claimed.${f.ta}.example.org`;
        const account = `account.${f.ta}.example.org`;
        await db.query(
          claimSql({ host: ready, tenant: f.ta, site: f.siteA, proofs: 5 }),
        );
        await db.query(
          claimSql({ host: claimed, tenant: f.ta, site: f.siteA, proofs: 1 }),
        );
        await db.query(
          claimSql({
            host: account,
            tenant: f.ta,
            surfaces: ["donor_account"],
          }),
        );
        const long = `${f.siteNameA}:${"0".repeat(300 - f.siteNameA.length)}`;
        expect(Buffer.byteLength(long)).toBe(301);
        for (const asked of [
          f.homeA,
          ready,
          claimed,
          `unknown.${f.ta}.example.org`,
          account,
          long,
          null,
        ])
          expect(await homeAsAnon(db, asked), String(asked)).toEqual([]);
      }));

    it("gives nothing when the home record names no host, the home is ready, or the home lacks donor_account", async () => {
      await fixture(async (f) => {
        await db.query(
          "update public.donor_portal_hosts set primary_domain=null where id=$1",
          [f.homeRecordA],
        );
        expect(await homeAsAnon(db, f.siteNameA)).toEqual([]);
      });
      await fixture(async (f) => {
        await db.query(setProofsSql(f.homeA, 5));
        expect(await homeAsAnon(db, f.siteNameA)).toEqual([]);
      });
      await fixture(async (f) => {
        await db.query(
          "update public.site_domains set surfaces=array['staff','missionary'] where host=$1",
          [f.homeA],
        );
        expect(await homeAsAnon(db, f.siteNameA)).toEqual([]);
      });
    });

    it("keeps each organization's Site names on its own home", () =>
      fixture(async (f) => {
        expect(await homeAsAnon(db, f.siteNameA)).toEqual(home(f.homeA));
        expect(await homeAsAnon(db, f.siteNameB)).toEqual(home(f.homeB));
      }));

    it("still gives the home for a suspended organization and an inactive Site (no status is read, ruling Q6)", () =>
      fixture(async (f) => {
        const second = randomUUID();
        const name = `second.${f.ta}.example.org`;
        await db.query(
          "insert into public.sites(id,tenant_id,name,status) values ($1,$2,'Second A','inactive')",
          [second, f.ta],
        );
        await db.query(
          claimSql({
            host: name,
            tenant: f.ta,
            site: second,
            surfaces: ["website"],
          }),
        );
        await db.query(
          "update public.tenants set status='suspended' where id=$1",
          [f.ta],
        );
        await db.query("set constraints all immediate");
        expect(await homeAsAnon(db, name)).toEqual(home(f.homeA));
        expect(await homeAsAnon(db, f.siteNameA)).toEqual(home(f.homeA));
      }));

    it("answers exactly when the verified-host lookup answers an active website name that is not home (note 5: one normalization)", () =>
      fixture(async (f) => {
        const at300 = `${f.siteNameA}:${"0".repeat(299 - f.siteNameA.length)}`;
        const at301 = `${at300}0`;
        expect(Buffer.byteLength(at300)).toBe(300);
        const spellings: Array<[string, boolean]> = [
          [f.siteNameA.toUpperCase(), true],
          [`${f.siteNameA}.`, true],
          [`${f.siteNameA}:443`, true],
          [`${f.siteNameA}.:443`, true],
          [`${f.siteNameA}:443.`, false],
          [`${f.siteNameA}:abc`, false],
          [at300, true],
          [at301, false],
        ];
        for (const [spelling, answers] of spellings) {
          const lookup = await resolveAsAnon(db, spelling);
          const lookupAnswers = lookup.some(
            (row) =>
              row.state === "active" &&
              (row.surfaces as string[]).includes("website") &&
              row.is_home === false,
          );
          const homeRows = await homeAsAnon(db, spelling);
          expect(lookupAnswers, spelling).toBe(answers);
          expect(homeRows.length === 1, spelling).toBe(answers);
        }
        expect(await homeAsAnon(db, null)).toEqual([]);
        await db.query("savepoint null_lookup");
        try {
          await db.query("set local role anon");
          expect(
            (await db.query("select * from public.resolve_verified_host(null)"))
              .rows,
          ).toEqual([]);
        } finally {
          await db.query("rollback to savepoint null_lookup");
        }
      }));

    it("is a postgres-owned STABLE STRICT definer with an empty search path, one output column, and EXECUTE for exactly anon, authenticated and service_role", async () => {
      const { rows } = await db.query(
        `select p.prosecdef, p.provolatile, p.proisstrict, p.proretset, p.proowner::regrole::text as owner, p.proconfig,
                (select array_agg(name order by ord) from unnest(p.proargnames, p.proargmodes::text[]) with ordinality as a(name, mode, ord) where mode = 't') as columns,
                (select coalesce(array_agg(g.grantee order by g.grantee), '{}')
                   from (select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee
                           from aclexplode(p.proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) g) as grantees
           from pg_proc p where p.oid = 'public.resolve_home_host(text)'::regprocedure`,
      );
      expect(rows[0]).toEqual({
        prosecdef: true,
        provolatile: "s",
        proisstrict: true,
        proretset: true,
        owner: "postgres",
        proconfig: ['search_path=""'],
        columns: ["primary_domain"],
        grantees: ["anon", "authenticated", "service_role"],
      });
    });

    it("holds the five field-policy rows of donor_portal_hosts.primary_domain to the manifest: public, visible on Mission Control and the public surface only", async () => {
      const column = MANIFEST.record_types.donor_portal_hosts!.primary_domain!;
      expect(column.category).toBe("public");
      const { rows } = await db.query(
        "select surface, visible, editable, exportable, sensitivity_category::text as category from public.field_policies where record_type='donor_portal_hosts' and field_key='primary_domain' and tenant_id is null order by surface",
      );
      expect(rows).toEqual(
        [...MANIFEST.surfaces].sort().map((surface) => ({
          surface,
          visible: column[surface]![0] === "v",
          editable: column[surface]![1] === "e",
          exportable: column[surface]![2] === "x",
          category: "public",
        })),
      );
      expect(
        rows.filter((row) => row.visible).map((row) => row.surface),
      ).toEqual(["mission_control", "public"]);
      expect(rows.some((row) => row.editable || row.exportable)).toBe(false);
    });

    it("gives no client role a read of the four tables beneath it (guard)", async () => {
      const { rows } = await db.query(
        `select r.role_name, t.table_name from unnest(array['anon','authenticated','service_role']) r(role_name)
           cross join unnest($1::text[]) t(table_name)
          where has_table_privilege(r.role_name, 'public.'||t.table_name, 'SELECT')`,
        [[...SITE_TABLES]],
      );
      expect(rows).toEqual([]);
    });
  },
);
