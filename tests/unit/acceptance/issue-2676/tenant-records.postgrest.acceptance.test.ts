import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.WP3_TENANT_IT_URL;
const database = process.env.WP3_TENANT_IT_DATABASE_URL;
const anon = process.env.WP3_TENANT_IT_ANON_KEY;
const service = process.env.WP3_TENANT_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";
describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "Tenant records on a signed-in person's token",
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
          "insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$1,'Fixture','US','usd','Fixture')",
          [tenant],
        );
        await db.query(
          "insert into public.funds(id,tenant_id,name,legal_entity_id,system_purpose) values ($1,$2,'General',$2,null),(gen_random_uuid(),$2,'Fee',$2,'fee_cover')",
          [fund, tenant],
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

    it.each([
      ["donations", "fund:funds(id),missionary:missionaries(id)"],
      [
        "donor_pledges",
        "fund:funds(id),missionary:missionaries!inner(profile_id)",
      ],
    ])(
      "resolves the existing %s portal embeds without an added hint",
      async (table, select) => {
        const response = await api(
          `rest/v1/${table}?${new URLSearchParams({ select, limit: "1" })}`,
          service!,
          service!,
        );
        const body = await response.json();
        expect(response.status, body?.code).toBe(200);
        expect(Array.isArray(body)).toBe(true);
      },
    );

    it("uses both headers on browser reads and live assignments, and answers nothing for a suspended or closed tenant", async () => {
      const rpc = (name: string, args: object) =>
        api(`rest/v1/rpc/${name}`, anon!, token, args);
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
      }
    });
  },
);
