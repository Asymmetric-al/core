import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);
describe.skipIf(!ADMIN_URL)("Site administration", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = fixtureIds();
  const run = asRole(db, id);
  const caller = {
    sub: "UADM",
    headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mAdm! },
  };
  const site = randomUUID();
  const host = `${site}.ministry.org`;
  const create = `select public.create_site('${id.TA}','Another Site','${host}') as result`;
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  it("creates a non-default Site, only for an active tenant administrator", async () => {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      const result = await run("authenticated", caller, create);
      expect(result.code, result.message).toBeNull();
      expect(result.rows[0]?.result).toMatchObject({
        primary_domain: host,
        status: "active",
        is_default: false,
      });
      const staff = await run(
        "authenticated",
        {
          sub: "UDEV",
          headers: { ...caller.headers, "x-asym-assignment": id.mDev! },
        },
        create,
      );
      expect(staff.code).toBe("42501");
      for (const status of ["suspended", "closed"]) {
        await db.query("update public.tenants set status=$1 where id=$2", [
          status,
          id.TA,
        ]);
        expect((await run("authenticated", caller, create)).code).toBe("42501");
        expect(
          (
            await db.query("select id from public.sites where tenant_id=$1", [
              id.TA,
            ])
          ).rowCount,
        ).toBe(0);
      }
    } finally {
      await db.query("rollback");
    }
  });
  it("refuses foreign destinations, occupied hosts and platform siblings without changing either tenant", async () => {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      const otherSite = randomUUID(),
        otherPortal = randomUUID();
      const platform = `platform.${site}.org`,
        occupied = `occupied.${host}`;
      await db.query(
        `insert into public.sites(id,tenant_id,name,primary_domain) values ($1,$2,'Local',$3),($4,$5,'Other',$6)`,
        [site, id.TA, host, otherSite, id.TB, occupied],
      );
      await db.query(
        `insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ($1,$2,$3)`,
        [otherPortal, id.TB, `portal.${host}`],
      );
      await db.query(
        `insert into public.site_domains(host,tenant_id,site_id,is_platform_host) values ($1,$2,$3,false),($4,$5,$6,false),($7,$5,$6,true)`,
        [host, id.TA, site, occupied, id.TB, otherSite, platform],
      );
      await db.query(
        `insert into public.site_domains(host,tenant_id,portal_host_id) values ($1,$2,$3)`,
        [`portal.${host}`, id.TB, otherPortal],
      );
      const snapshot = async () => {
        const tables = [];
        for (const table of [
          "sites",
          "site_domains",
          "donor_portal_hosts",
          "donor_account_brands",
        ]) {
          const { rows } = await db.query(
            `select to_jsonb(record) as value from public.${table} record where tenant_id=any($1::uuid[]) order by to_jsonb(record)::text`,
            [[id.TA, id.TB]],
          );
          tables.push(rows);
        }
        return tables;
      };
      const before = await snapshot();
      await db.query(
        "select set_config('request.jwt.claims',$1,true),set_config('request.headers',$2,true)",
        [
          JSON.stringify({ sub: id.UADM, role: "authenticated" }),
          JSON.stringify(caller.headers),
        ],
      );
      for (const [statement, code] of [
        [`set_site_status('${id.TA}','${otherSite}','inactive')`, "P0002"],
        [
          `verify_domain('${id.TA}','free.${host}','${otherSite}',null)`,
          "22023",
        ],
        [
          `verify_domain('${id.TA}','free.${host}',null,'${otherPortal}')`,
          "22023",
        ],
        [`verify_domain('${id.TA}','${occupied}','${site}',null)`, "23505"],
        [`create_site('${id.TA}','Taken','${occupied}')`, "23505"],
        [
          `create_site('${id.TA}','Platform sibling','sibling.${site}.org')`,
          "23514",
        ],
        [`verify_domain('${id.TA}','${site}.org','${site}',null)`, "23514"],
      ]) {
        await db.query("savepoint request; set local role authenticated");
        await expect(
          db.query(`select public.${statement}`),
          statement,
        ).rejects.toMatchObject({ code });
        await db.query(
          "rollback to savepoint request; release savepoint request",
        );
        expect(await snapshot(), statement).toEqual(before);
      }
    } finally {
      await db.query("rollback");
    }
  });
  it("changes Site status and brand; requesting verification does not attach or allowlist", async () => {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      const portal = randomUUID();
      await db.query(
        `insert into public.sites(id,tenant_id,name,primary_domain) values ('${site}','${id.TA}','Home','${host}'); insert into public.site_domains(host,tenant_id,site_id) values ('${host}','${id.TA}','${site}'); insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ('${portal}','${id.TA}','portal.${host}'); insert into public.site_domains(host,tenant_id,portal_host_id) values ('portal.${host}','${id.TA}','${portal}')`,
      );
      for (const status of ["inactive", "active"]) {
        const result = await run(
          "authenticated",
          caller,
          `select public.set_site_status('${id.TA}','${site}','${status}') as result`,
        );
        expect(result.code, result.message).toBeNull();
        expect(result.rows[0]?.result).toMatchObject({ status });
      }
      await db.query("update public.sites set is_default=true where id=$1", [
        site,
      ]);
      expect(
        (
          await run(
            "authenticated",
            caller,
            `select public.set_site_status('${id.TA}','${site}','inactive')`,
          )
        ).code,
      ).toBe("23514");
      for (const [domain, siteArg, portalArg] of [
        [host, `'${site}'`, "null"],
        [`custom.${host}`, "null", `'${portal}'`],
      ]) {
        const result = await run(
          "authenticated",
          caller,
          `select public.verify_domain('${id.TA}','${domain}',${siteArg},${portalArg}) as result`,
        );
        expect(result.code, result.message).toBeNull();
        expect(result.rows[0]?.result).toMatchObject({
          verification_requested_by: id.UADM,
          deployment_attached_at: null,
          redirect_allowlisted_at: null,
        });
      }
      const brand = await run(
        "authenticated",
        caller,
        `select public.set_account_brand('${id.TA}','New name') as result`,
      );
      expect(brand.code, brand.message).toBeNull();
      expect(brand.rows[0]?.result).toMatchObject({ display_name: "New name" });
      for (const reserved of [
        "another.localhost",
        "capitalized.HOST.org",
        "has-port.org:443",
        "trailing.org.",
      ]) {
        expect(
          (
            await run(
              "authenticated",
              caller,
              `select public.create_site('${id.TA}','Bad','${reserved}')`,
            )
          ).code,
        ).toBe("23514");
      }
    } finally {
      await db.query("rollback");
    }
  });
});
