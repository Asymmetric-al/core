import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.WP3_SITE_IT_URL;
const database = process.env.WP3_SITE_IT_DATABASE_URL;
const anon = process.env.WP3_SITE_IT_ANON_KEY;
const service = process.env.WP3_SITE_IT_SERVICE_KEY;
describe.skipIf(![url, database, anon, service].some(Boolean))(
  "Site administration on a signed-in person's token",
  () => {
    const tenant = randomUUID(),
      membership = randomUUID(),
      fund = randomUUID();
    let db: pg.Client | undefined;
    let user: string | undefined;
    let token: string;
    async function api(
      path: string,
      key: string,
      bearer: string,
      body?: object,
      method?: string,
    ) {
      return fetch(`${url}/${path}`, {
        method: method ?? (body ? "POST" : "GET"),
        headers: {
          apikey: key,
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
          "x-asym-tenant": tenant,
          "x-asym-assignment": membership,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    }
    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anon ||
        !service ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      const credentials = {
        email: `wp3-${tenant}@example.test`,
        password: randomUUID(),
      };
      const created = await api("auth/v1/admin/users", service, service, {
        ...credentials,
        email_confirm: true,
      });
      expect(created.ok, `Auth fixture status: ${created.status}`).toBe(true);
      user = (await created.json()).id;
      const login = await api(
        "auth/v1/token?grant_type=password",
        anon,
        anon,
        credentials,
      );
      expect(login.ok, `Sign-in status: ${login.status}`).toBe(true);
      token = (await login.json()).access_token;
      db = new pg.Client({ connectionString: database });
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants(id,name,slug) values ($1,'Fixture',$1::uuid::text)",
          [tenant],
        );
        await db.query(
          "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin) values ($1,$2,$3,'staff','development',true)",
          [membership, user, tenant],
        );
        await db.query(
          "insert into public.legal_entities(id,tenant_id,name) values ($1,$1,'Fixture')",
          [tenant],
        );
        await db.query(
          "insert into public.funds(id,tenant_id,name,legal_entity_id,system_purpose) values ($1,$2,'General',$2,null),(gen_random_uuid(),$2,'Fee',$2,'fee_cover')",
          [fund, tenant],
        );
        await db.query(
          "insert into public.sites(id,tenant_id,name,is_default,primary_domain) values ($1,$1,'Default',true,$2)",
          [tenant, `default.${tenant}.org`],
        );
        await db.query(
          "insert into public.site_domains(host,tenant_id,site_id) values ($1,$2,$2)",
          [`default.${tenant}.org`, tenant],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });
    afterAll(async () => {
      try {
        if (db) {
          await db.query("begin");
          try {
            for (const table of [
              "public.site_domains",
              "public.sites",
              "public.funds",
              "public.legal_entities",
              "authz.memberships",
            ])
              await db.query(`delete from ${table} where tenant_id=$1`, [
                tenant,
              ]);
            await db.query("delete from public.tenants where id=$1", [tenant]);
            await db.query("commit");
          } catch (error) {
            await db.query("rollback");
            throw error;
          } finally {
            await db.end();
          }
        }
      } finally {
        if (user && service)
          expect(
            (
              await api(
                `auth/v1/admin/users/${user}`,
                service,
                service,
                undefined,
                "DELETE",
              )
            ).ok,
          ).toBe(true);
      }
    });
    it("uses both headers on browser reads, live assignments and Site commands", async () => {
      const rpc = (name: string, args: object) =>
        api(`rest/v1/rpc/${name}`, anon!, token, args);
      const create = () =>
        rpc("create_site", {
          p_tenant_id: tenant,
          p_name: "Second",
          p_primary_domain: `${randomUUID()}.org`,
        });
      expect((await create()).ok).toBe(true);
      const deactivate = await rpc("set_site_status", {
        p_tenant_id: tenant,
        p_site_id: tenant,
        p_status: "inactive",
      });
      expect((await deactivate.json()).code).toBe("23514");
      await db!.query(
        "update authz.memberships set is_tenant_admin=false where id=$1",
        [membership],
      );
      expect((await (await create()).json()).code).toBe("42501");
      await db!.query(
        "update authz.memberships set is_tenant_admin=true where id=$1",
        [membership],
      );
      for (const status of ["active", "suspended", "closed"]) {
        await db!.query("update public.tenants set status=$2 where id=$1", [
          tenant,
          status,
        ]);
        const response = await api(
          `rest/v1/funds?select=id&tenant_id=eq.${tenant}`,
          anon!,
          token,
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(
          status === "active" ? [{ id: fund }] : [],
        );
        const assignments = await rpc("current_user_assignments", {});
        expect(assignments.status).toBe(200);
        expect(
          ((await assignments.json()) as { tenant_id: string }[]).some(
            (row) => row.tenant_id === tenant,
          ),
        ).toBe(status === "active");
        if (status !== "active")
          expect((await (await create()).json()).code).toBe("42501");
      }
      expect(
        (
          await db!.query("select id from public.sites where tenant_id=$1", [
            tenant,
          ])
        ).rowCount,
      ).toBe(2);
    });
  },
);
