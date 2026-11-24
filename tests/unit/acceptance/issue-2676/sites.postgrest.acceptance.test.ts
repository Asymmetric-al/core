import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ALL_SURFACES, claimSql } from "./site-fixture";

const url = process.env.WP3_TENANT_IT_URL;
const database = process.env.WP3_TENANT_IT_DATABASE_URL;
const anon = process.env.WP3_TENANT_IT_ANON_KEY;
const service = process.env.WP3_TENANT_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

const COMMANDS = [
  "create_site(uuid,text)",
  "set_site_status(uuid,uuid,text)",
  "set_account_brand(uuid,text)",
  "designate_home(uuid,text)",
];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "Sites, claimed names and the home record through PostgREST",
  () => {
    const tenant = randomUUID(),
      membership = randomUUID(),
      site = randomUUID(),
      home = randomUUID();
    const host = `ready.${tenant}.example.org`;
    let db: pg.Client | undefined;
    let user: string | undefined;
    let token: string;
    let created: string | undefined;
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
    const rpc = (name: string, key: string, bearer: string, args: object) =>
      api(`rest/v1/rpc/${name}`, key, bearer, args);
    const args = (): Record<string, object> => ({
      create_site: { p_tenant_id: tenant, p_name: "Second Site" },
      set_site_status: {
        p_tenant_id: tenant,
        p_site_id: created ?? site,
        p_status: "inactive",
      },
      set_account_brand: { p_tenant_id: tenant, p_display_name: "Renamed" },
      designate_home: { p_tenant_id: tenant, p_host: host },
    });

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
        email: `wp3-sites-${tenant}@example.test`,
        password: randomUUID(),
      };
      const signup = await api("auth/v1/admin/users", service, service, {
        ...credentials,
        email_confirm: true,
      });
      expect(signup.ok, `Auth fixture status: ${signup.status}`).toBe(true);
      user = (await signup.json()).id;
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
          "insert into public.tenants(id,name,slug) values ($1,'Sites fixture',$1::uuid::text)",
          [tenant],
        );
        await db.query(
          "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin) values ($1,$2,$3,'staff','development',true)",
          [membership, user, tenant],
        );
        await db.query(
          "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default',true)",
          [site, tenant],
        );
        await db.query(
          "insert into public.donor_portal_hosts(id,tenant_id) values ($1,$2)",
          [home, tenant],
        );
        await db.query(
          "insert into public.donor_account_brands(tenant_id,display_name) values ($1,'Sites fixture')",
          [tenant],
        );
        await db.query(claimSql({ host, tenant, site, proofs: 5 }));
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
              "public.donor_account_brands",
              "public.donor_portal_hosts",
              "public.site_domains",
              "public.sites",
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

    it("lets anon resolve a ready name and call none of the commands", async () => {
      const lookup = await rpc("resolve_verified_host", anon!, anon!, {
        p_host: host.toUpperCase(),
      });
      expect(lookup.status).toBe(200);
      expect(await lookup.json()).toMatchObject([
        {
          tenant_id: tenant,
          site_id: site,
          surfaces: ALL_SURFACES,
          state: "ready",
          is_home: false,
        },
      ]);
      for (const [name, body] of Object.entries(args())) {
        const response = await rpc(name, anon!, anon!, body);
        expect(response.status, name).not.toBe(200);
        expect((await response.json()).code, name).toBe("42501");
      }
    });

    it("gives service_role no command and PUBLIC no lookup", async () => {
      for (const [name, body] of Object.entries(args())) {
        const response = await rpc(name, service!, service!, body);
        expect(response.status, name).not.toBe(200);
        expect((await response.json()).code, name).toBe("42501");
      }
      const grants = await db!.query(
        `select f.name, r.role_name, has_function_privilege(r.role_name, f.name::regprocedure, 'EXECUTE') as granted
           from unnest($1::text[]) f(name) cross join unnest(array['anon','service_role','authenticated']) r(role_name)
          order by 1, 2`,
        [COMMANDS.flatMap((fn) => [`public.${fn}`, `tenant_guard.${fn}`])],
      );
      expect(
        grants.rows.filter(
          (row) => row.granted !== (row.role_name === "authenticated"),
        ),
      ).toEqual([]);
      const lookupAcl = await db!.query(
        `select coalesce(array_agg(case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end order by 1), '{}') as grantees
           from pg_proc p, aclexplode(p.proacl) a
          where p.oid = 'public.resolve_verified_host(text)'::regprocedure and a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner`,
      );
      expect(lookupAcl.rows[0]!.grantees).toEqual([
        "anon",
        "authenticated",
        "service_role",
      ]);
    });

    it("gives no role any privilege on the generation sequence on the Supabase image", async () => {
      const granted = await db!.query(
        `select role_name, privilege from unnest(array['public','anon','authenticated','service_role','tenant_guard']) role_name
           cross join unnest(array['USAGE','SELECT','UPDATE']) privilege
          where has_sequence_privilege(role_name,'public.site_domains_generation_seq',privilege)`,
      );
      expect(granted.rows).toEqual([]);
    });

    it("refuses direct reads of the four tables to anon, a signed-in administrator and service_role", async () => {
      for (const table of [
        "sites",
        "site_domains",
        "donor_portal_hosts",
        "donor_account_brands",
      ])
        for (const [label, key, bearer] of [
          ["anon", anon!, anon!],
          ["administrator", anon!, token],
          ["service_role", service!, service!],
        ] as [string, string, string][]) {
          const response = await api(
            `rest/v1/${table}?select=tenant_id&tenant_id=eq.${tenant}`,
            key,
            bearer,
          );
          const body = await response.json();
          expect(response.status, `${label} ${table}`).not.toBe(200);
          expect(body.code, `${label} ${table}`).toBe("42501");
        }
    });

    it("runs each command for the administrator through PostgREST with both request headers", async () => {
      const call = async (name: string) => {
        const response = await rpc(name, anon!, token, args()[name]!);
        const body = await response.json();
        expect(response.status, `${name}: ${body?.message}`).toBe(200);
        return body;
      };
      const second = await call("create_site");
      expect(second).toMatchObject({
        tenant_id: tenant,
        is_default: false,
        status: "active",
        primary_domain: null,
      });
      created = second.id;
      expect(await call("set_site_status")).toMatchObject({
        id: created,
        status: "inactive",
      });
      expect(await call("set_account_brand")).toEqual({
        tenant_id: tenant,
        display_name: "Renamed",
      });
      expect(await call("designate_home")).toMatchObject({
        id: home,
        primary_domain: host,
      });
      const lookup = await rpc("resolve_verified_host", anon!, anon!, {
        p_host: host,
      });
      expect(await lookup.json()).toMatchObject([{ is_home: true }]);
    });
  },
);
