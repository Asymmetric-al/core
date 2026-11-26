import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ALL_SURFACES, HOME_SURFACES, claimSql } from "./site-fixture";

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
              "public.audit_logs",
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

    it("gives service_role no command and PUBLIC no lookup (D-18: AL-2676: the grantee list is sorted by name)", async () => {
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
        `select coalesce(array_agg(case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end order by case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end), '{}') as grantees
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

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "The home read through PostgREST (WP3b part 2)",
  () => {
    const tenant = randomUUID(),
      site = randomUUID(),
      homeRecord = randomUUID();
    const homeHost = `home.${tenant}.example.org`;
    const siteHost = `site.${tenant}.example.org`;
    let db: pg.Client | undefined;
    const homeRead = (host: string) =>
      fetch(`${url}/rest/v1/rpc/resolve_home_host`, {
        method: "POST",
        headers: {
          apikey: anon!,
          Authorization: `Bearer ${anon}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_host: host }),
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
      db = new pg.Client({ connectionString: database });
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants(id,name,slug) values ($1,'Home read fixture',$1::uuid::text)",
          [tenant],
        );
        await db.query(
          "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default',true)",
          [site, tenant],
        );
        await db.query(
          claimSql({ host: homeHost, tenant, surfaces: HOME_SURFACES }),
        );
        await db.query(
          claimSql({ host: siteHost, tenant, site, surfaces: ["website"] }),
        );
        await db.query(
          "insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ($1,$2,$3)",
          [homeRecord, tenant, homeHost],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      if (!db) return;
      await db.query("begin");
      try {
        for (const table of [
          "public.donor_portal_hosts",
          "public.site_domains",
          "public.sites",
        ])
          await db.query(`delete from ${table} where tenant_id=$1`, [tenant]);
        await db.query("delete from public.tenants where id=$1", [tenant]);
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        await db.end();
      }
    });

    it("lets anon read the home of an active Site name, 200 with the one row, and [] for the home itself", async () => {
      const site = await homeRead(siteHost.toUpperCase());
      expect(site.status).toBe(200);
      expect(await site.json()).toEqual([{ primary_domain: homeHost }]);
      const itself = await homeRead(homeHost);
      expect(itself.status).toBe(200);
      expect(await itself.json()).toEqual([]);
    });

    it("gives PUBLIC no EXECUTE on the home read", async () => {
      const acl = await db!.query(
        `select coalesce(array_agg(g.grantee order by g.grantee), '{}') as grantees
           from (select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee
                   from pg_proc p, aclexplode(p.proacl) a
                  where p.oid = 'public.resolve_home_host(text)'::regprocedure
                    and a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) g`,
      );
      expect(acl.rows[0]!.grantees).not.toContain("PUBLIC");
      expect(acl.rows[0]!.grantees).toEqual([
        "anon",
        "authenticated",
        "service_role",
      ]);
    });
  },
);

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "Mission Control's Sites read and routes on the person's own token (WP3b part 3, T2)",
  () => {
    const tenant = randomUUID(),
      membership = randomUUID(),
      site = randomUUID(),
      home = randomUUID(),
      other = randomUUID(),
      otherSite = randomUUID(),
      otherHome = randomUUID(),
      forgedAssignment = randomUUID();
    const ENV_KEYS = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ] as const;
    const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string>> = {};
    let db: pg.Client | undefined;
    let user: string | undefined;
    let token = "";
    let forged = false;
    let unmock: (() => void) | undefined;
    type Handler = (request: Request) => Promise<Response>;
    let routes:
      | { read: Handler; create: Handler; status: Handler; brand: Handler }
      | undefined;

    const authFor = (tenantId: string, assignmentId: string) => ({
      userId: user,
      profileId: user,
      tenantId,
      isAuthenticated: true,
      role: "admin",
      memberships: [
        {
          tenantId,
          role: "staff",
          staffRole: "development",
          isActive: true,
          isTenantAdmin: true,
        },
      ],
      assignment: {
        assignmentId,
        userId: user,
        tenantId,
        revision: "1",
        membershipRole: "staff",
        staffRole: "development",
        isTenantAdmin: true,
      },
      assignmentDenial: null,
    });

    async function loadRoutes() {
      if (routes) return routes;
      const { vi } = await import("vitest");
      vi.doMock("@asym/auth/context", async (original) => ({
        ...(await original<Record<string, unknown>>()),
        getAuthContext: async () =>
          forged
            ? authFor(other, forgedAssignment)
            : authFor(tenant, membership),
      }));
      unmock = () => vi.doUnmock("@asym/auth/context");
      const settings =
        await import("../../../../packages/api/src/admin/sites/settings");
      const status =
        await import("../../../../packages/api/src/admin/sites/status");
      const brand =
        await import("../../../../packages/api/src/admin/sites/brand");
      routes = {
        read: settings.GET as unknown as Handler,
        create: settings.POST as unknown as Handler,
        status: status.POST as unknown as Handler,
        brand: brand.POST as unknown as Handler,
      };
      return routes;
    }

    const routeRequest = async (path: string, body?: object) => {
      const { NextRequest } = await import("next/server");
      return new NextRequest(`http://localhost${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          authorization: `Bearer ${token}`,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    const rpcAs = (key: string, bearer: string) =>
      fetch(`${url}/rest/v1/rpc/tenant_site_settings`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
          "x-asym-tenant": tenant,
          "x-asym-assignment": membership,
        },
        body: JSON.stringify({ p_tenant_id: tenant }),
      });

    const sitesOf = async (tenantId: string) =>
      (
        await db!.query(
          "select id::text, name, is_default, status, primary_domain from public.sites where tenant_id=$1 order by is_default desc, name, id",
          [tenantId],
        )
      ).rows;

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
      const authApi = (path: string, key: string, body: object) =>
        fetch(`${url}/auth/v1/${path}`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      const credentials = {
        email: `wp3-site-settings-${tenant}@example.test`,
        password: randomUUID(),
      };
      const signup = await authApi("admin/users", service, {
        ...credentials,
        email_confirm: true,
      });
      expect(signup.ok, `Auth fixture status: ${signup.status}`).toBe(true);
      user = (await signup.json()).id;
      const login = await authApi(
        "token?grant_type=password",
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
          "insert into public.tenants(id,name,slug) values ($1,'Site settings fixture',$1::uuid::text),($2,'Site settings other',$2::uuid::text)",
          [tenant, other],
        );
        await db.query(
          "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin) values ($1,$2,$3,'staff','development',true)",
          [membership, user, tenant],
        );
        await db.query(
          "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default',true),($3,$4,'Other default',true)",
          [site, tenant, otherSite, other],
        );
        await db.query(
          "insert into public.donor_portal_hosts(id,tenant_id) values ($1,$2),($3,$4)",
          [home, tenant, otherHome, other],
        );
        await db.query(
          "insert into public.donor_account_brands(tenant_id,display_name) values ($1,'Settings brand'),($2,'Other brand')",
          [tenant, other],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
      for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
      process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    });

    afterAll(async () => {
      for (const key of ENV_KEYS) {
        if (savedEnv[key] === undefined) delete process.env[key];
        else process.env[key] = savedEnv[key];
      }
      unmock?.();
      try {
        if (db) {
          await db.query("begin");
          try {
            for (const table of [
              "public.audit_logs",
              "public.donor_account_brands",
              "public.donor_portal_hosts",
              "public.sites",
              "authz.memberships",
            ])
              await db.query(
                `delete from ${table} where tenant_id = any($1::uuid[])`,
                [[tenant, other]],
              );
            await db.query(
              "delete from public.tenants where id = any($1::uuid[])",
              [[tenant, other]],
            );
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
              await fetch(`${url}/auth/v1/admin/users/${user}`, {
                method: "DELETE",
                headers: {
                  apikey: service,
                  Authorization: `Bearer ${service}`,
                },
              })
            ).ok,
          ).toBe(true);
      }
    });

    it("reads the Sites and brand through the RPC for the signed-in administrator, and refuses anon and service_role", async () => {
      const response = await rpcAs(anon!, token);
      const body = await response.json();
      expect(response.status, body?.message).toBe(200);
      expect(body).toEqual({
        sites: [
          {
            id: site,
            name: "Default",
            is_default: true,
            status: "active",
            primary_domain: null,
          },
        ],
        brand: { display_name: "Settings brand" },
      });
      for (const [label, key] of [
        ["anon", anon!],
        ["service_role", service!],
      ] as const) {
        const refused = await rpcAs(key, key);
        expect(refused.status, label).not.toBe(200);
        expect((await refused.json()).code, label).toBe("42501");
      }
    });

    it("runs the read, create, status and brand routes on the person's token, answering what the database holds", async () => {
      const { read, create, status, brand } = await loadRoutes();
      const loaded = await read(await routeRequest("/api/admin/sites"));
      expect(loaded.status).toBe(200);
      expect(loaded.headers.get("cache-control")).toBe("no-store");
      expect(await loaded.json()).toEqual({
        sites: await sitesOf(tenant),
        brand: { display_name: "Settings brand" },
      });

      const name = `Route Site ${randomUUID().slice(0, 8)}`;
      const created = await create(
        await routeRequest("/api/admin/sites", { name }),
      );
      const createdBody = await created.json();
      expect(created.status, JSON.stringify(createdBody)).toBe(201);
      const stored = (await sitesOf(tenant)).filter((row) => row.name === name);
      expect(stored).toHaveLength(1);
      expect(createdBody).toEqual({ site: stored[0] });
      expect(Object.keys(createdBody.site)).not.toContain("tenant_id");

      const before = await sitesOf(other);
      const foreign = await status(
        await routeRequest("/api/admin/sites/status", {
          siteId: otherSite,
          status: "inactive",
        }),
      );
      expect(foreign.status).toBe(404);
      expect((await foreign.json()).code).toBe("SITE_NOT_FOUND");
      expect(await sitesOf(other)).toEqual(before);

      const renamed = await brand(
        await routeRequest("/api/admin/sites/brand", {
          displayName: "Renamed by route",
        }),
      );
      expect(renamed.status).toBe(200);
      expect(await renamed.json()).toEqual({
        brand: { display_name: "Renamed by route" },
      });
      expect(
        (
          await db!.query(
            "select display_name from public.donor_account_brands where tenant_id=$1",
            [tenant],
          )
        ).rows,
      ).toEqual([{ display_name: "Renamed by route" }]);
    });

    it("refuses a context forged to hold sites.manage in an organization where the person has no row, from the database, writing nothing", async () => {
      const { read, create } = await loadRoutes();
      const snapshotOther = async () => ({
        sites: await sitesOf(other),
        audits: (
          await db!.query(
            "select count(*)::int as n from public.audit_logs where tenant_id=$1",
            [other],
          )
        ).rows[0]!.n,
      });
      const before = await snapshotOther();
      forged = true;
      try {
        const loaded = await read(await routeRequest("/api/admin/sites"));
        expect(loaded.status).toBe(403);
        expect((await loaded.json()).code).toBe("NOT_PERMITTED");
        const created = await create(
          await routeRequest("/api/admin/sites", { name: "Forged Site" }),
        );
        expect(created.status).toBe(403);
        expect((await created.json()).code).toBe("NOT_PERMITTED");
      } finally {
        forged = false;
      }
      expect(await snapshotOther()).toEqual(before);
    });
  },
);
