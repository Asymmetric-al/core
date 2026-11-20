import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)("verified host routing", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  async function fixture(
    run: (
      tenant: string,
      site: string,
      portal: string,
      host: string,
    ) => Promise<void>,
  ) {
    const tenant = randomUUID(),
      site = randomUUID(),
      portal = randomUUID();
    const host = `${tenant}.localhost`;
    await db.query("begin");
    try {
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1,'Fixture',$1::uuid::text)",
        [tenant],
      );
      await db.query(
        "insert into public.sites(id,tenant_id,name,is_default,primary_domain) values ($1,$2,'Default',true,$3)",
        [site, tenant, host],
      );
      await db.query(
        "insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ($1,$2,$3)",
        [portal, tenant, `portal.${host}`],
      );
      await db.query(
        "insert into public.site_domains(host,tenant_id,site_id,is_platform_host) values ($1,$2,$3,true)",
        [host, tenant, site],
      );
      await db.query(
        "insert into public.site_domains(host,tenant_id,portal_host_id,is_platform_host) values ($1,$2,$3,true)",
        [`portal.${host}`, tenant, portal],
      );
      await db.query("set constraints all immediate");
      await run(tenant, site, portal, host);
    } finally {
      await db.query("rollback");
    }
  }

  async function resolve(host: string) {
    await db.query("set local role anon");
    const result = await db.query(
      "select * from public.resolve_verified_host($1)",
      [host],
    );
    await db.query("reset role");
    return result.rows;
  }

  it("returns nothing for an unknown host", async () => {
    await db.query("begin");
    try {
      expect(await resolve(`${randomUUID()}.invalid`)).toEqual([]);
    } finally {
      await db.query("rollback");
    }
  });

  it("admits only verified hosts and returns exactly their public fields", () =>
    fixture(async (tenant, site, _portal, host) => {
      const portal = `portal.${host}`;
      expect(await resolve(host)).toEqual([]);
      await db.query(
        "update public.site_domains set verification_requested_at=now() where tenant_id=$1",
        [tenant],
      );
      expect(await resolve(host)).toEqual([]);
      await db.query(
        "update public.site_domains set deployment_attached_at=now() where tenant_id=$1",
        [tenant],
      );
      expect(await resolve(host)).toEqual([
        { tenant_id: tenant, site_id: site },
      ]);
      expect(await resolve(portal)).toEqual([]);
      await db.query(
        "update public.site_domains set redirect_allowlisted_at=now() where host=$1",
        [portal],
      );
      expect(await resolve(portal)).toEqual([
        { tenant_id: tenant, site_id: null },
      ]);
      const fields = await db.query(
        "select field_key from public.field_policies where record_type='site_domains' and surface='public' and visible order by 1",
      );
      expect(fields.rows.map((row) => row.field_key)).toEqual([
        "site_id",
        "tenant_id",
      ]);
    }));

  it.each([
    "sites",
    "site_domains",
    "donor_portal_hosts",
    "donor_account_brands",
  ])("no direct client access to %s", async (table) => {
    const result = await db.query(
      `select role_name, privilege from unnest(array['anon','authenticated']) role_name cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) privilege where has_table_privilege(role_name,$1,privilege)`,
      [`public.${table}`],
    );
    expect(result.rows).toEqual([]);
    expect(
      (
        await db.query(
          "select relrowsecurity and relforcerowsecurity as forced from pg_class where oid=$1::regclass",
          [`public.${table}`],
        )
      ).rows,
    ).toEqual([{ forced: true }]);
  });

  it("rejects cross-tenant Site and portal bindings, even for privileged writers", () =>
    fixture(async (tenant, site, portal, host) => {
      const other = randomUUID();
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1,'Other',$1::uuid::text)",
        [other],
      );
      for (const [column, id] of [
        ["site_id", site],
        ["portal_host_id", portal],
      ]) {
        await db.query("savepoint invalid_host");
        await expect(
          db.query(
            `insert into public.site_domains(host,tenant_id,${column}) values ($1,$2,$3)`,
            [`other.${host}`, other, id],
          ),
        ).rejects.toMatchObject({ code: "23503" });
        await db.query("rollback to invalid_host");
      }
      await expect(
        db.query(
          "update public.sites set status='inactive' where tenant_id=$1",
          [tenant],
        ),
      ).rejects.toMatchObject({ code: "23514" });
    }));

  it("keeps the primary domain on the same Site and reserves each hostname globally", () =>
    fixture(async (tenant, site, _portal, host) => {
      await db.query("savepoint invalid_primary");
      await expect(
        db.query("update public.sites set primary_domain=$1 where id=$2", [
          `portal.${host}`,
          site,
        ]),
      ).rejects.toMatchObject({ code: "23503" });
      await db.query("rollback to invalid_primary");
      await expect(
        db.query(
          "insert into public.site_domains(host,tenant_id,site_id) values ($1,$2,$3)",
          [host, tenant, site],
        ),
      ).rejects.toMatchObject({ code: "23505" });
    }));

  it("accepts only canonical ASCII DNS names in storage", () =>
    fixture(async (tenant, site) => {
      for (const host of [
        "www.Example.org",
        "example.org.",
        "example.org:443",
        "bücher.example",
        "first..example",
        "-invalid.example",
        "192.0.2.1",
      ]) {
        await db.query("savepoint malformed_domain");
        await expect(
          db.query(
            "insert into public.site_domains(host,tenant_id,site_id) values ($1,$2,$3)",
            [host, tenant, site],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("rollback to malformed_domain");
      }
      await db.query(
        "insert into public.site_domains(host,tenant_id,site_id) values ($1,$2,$3)",
        [`xn--bcher-kva.${tenant}.example`, tenant, site],
      );
    }));
});
