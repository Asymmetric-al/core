import { randomBytes, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  bootCmsStack,
  type CmsStack,
  type Doc,
} from "./cms-harness";
import {
  requireDisposableAdmin,
  setDisposableRolePassword,
} from "./disposable-cluster";
import { queryJson } from "../../../../scripts/release/lib/postgres.mjs";

vi.mock(
  "@payload-config",
  () => import("../../../../apps/admin/payload.config"),
);

const REF = "wp6rest1sweeptestref";

type Org = { tenant: string; site: string };
type Query = (options: {
  databaseUrl: string;
  sql: string;
  label?: string;
}) => unknown;

const stepModule = () =>
  import("../../../../apps/admin/src/cms/site-presentation-step");
const recordsModule = () =>
  import("../../../../scripts/cms/lib/site-presentation-records.mjs");
const sweepModule = () =>
  import("../../../../scripts/cms/sweep-site-presentations.mjs");
const releaseModule = () =>
  import("../../../../scripts/release/release-database.mjs");

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2679 WP6 rest: every Site has exactly one presentation (real stack; it sets a cluster-wide role password, so it runs only on a local cluster of its own)",
  { timeout: 240_000 },
  () => {
    let s: CmsStack;
    const runtimePassword = randomBytes(24).toString("hex");
    const made = {
      tenants: [] as string[],
      sites: [] as string[],
      users: [] as string[],
    };
    const caller = {
      user: "",
      tenant: "",
      assignment: "",
    };

    beforeAll(async () => {
      requireDisposableAdmin(ADMIN_URL);
      s = await bootCmsStack();
      await setDisposableRolePassword({
        adminUrl: ADMIN_URL,
        client: s.admin,
        role: "cms_runtime",
        password: runtimePassword,
      });
    }, 180_000);

    afterAll(async () => {
      const cleanup = [
        [
          "delete from cms._pages_v where version_tenant = any($1)",
          [made.tenants],
        ],
        ["delete from cms.pages where tenant = any($1)", [made.tenants]],
        [
          "delete from cms.site_presentations where tenant = any($1) or id = any($2::uuid[])",
          [made.tenants, made.sites],
        ],
        [
          "delete from platform.tenant_provisioning where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.membership_invitations where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.donor_account_brands where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.donor_portal_hosts where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.sites where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.contribution_approval_policies where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.funds where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.legal_entities where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from public.audit_logs where tenant_id = any($1::uuid[])",
          [made.tenants],
        ],
        [
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [made.users],
        ],
        [
          "delete from authz.platform_operators where user_id = any($1::uuid[])",
          [made.users],
        ],
      ] as const;
      for (const [text, values] of cleanup)
        await s?.admin.query(text, [...values]).catch(() => undefined);
      for (const user of made.users)
        await s?.admin
          .query("delete from auth.users where id = $1", [user])
          .catch(() => undefined);
      for (const tenant of made.tenants)
        await s?.admin
          .query("delete from public.tenants where id = $1", [tenant])
          .catch(() => undefined);
      if (s)
        await setDisposableRolePassword({
          adminUrl: ADMIN_URL,
          client: s.admin,
          role: "cms_runtime",
          password: null,
        }).catch(() => undefined);
      vi.doUnmock("@asym/auth/context");
      vi.doUnmock("../../../../packages/api/src/shared/request-session-client");
      await s?.cleanup();
    });

    async function organizations(count: number): Promise<Org[]> {
      const orgs: Org[] = [];
      for (let index = 0; index < count; index += 1) {
        const tenant = randomUUID();
        const site = randomUUID();
        await s.admin.query(
          "insert into public.tenants (id, name, slug) values ($1, $2, $3)",
          [tenant, `wp6r1 ${index}`, `wp6r1-${tenant}`],
        );
        await s.admin.query(
          "insert into public.sites (id, tenant_id, name, is_default) values ($1, $2, 'Default', true)",
          [site, tenant],
        );
        made.tenants.push(tenant);
        made.sites.push(site);
        orgs.push({ tenant, site });
      }
      return orgs;
    }

    async function administrator(tenant: string) {
      const user = randomUUID();
      const assignment = randomUUID();
      await s.admin.query("insert into auth.users (id) values ($1)", [user]);
      await s.admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      await s.admin.query(
        "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, $3, 'staff', 'development', true, true)",
        [assignment, user, tenant],
      );
      made.users.push(user);
      Object.assign(caller, { user, tenant, assignment });
    }

    function sessionClient() {
      return {
        async rpc(fn: string, args: Record<string, unknown>) {
          if (!/^[a-z_]+$/.test(fn)) throw new Error(`refused rpc ${fn}`);
          const client = new pg.Client({ connectionString: ADMIN_URL });
          await client.connect();
          try {
            await client.query("begin");
            await client.query("set local role authenticated");
            await client.query(
              "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
              [
                JSON.stringify({ sub: caller.user, role: "authenticated" }),
                JSON.stringify({
                  "x-asym-tenant": caller.tenant,
                  "x-asym-assignment": caller.assignment,
                }),
              ],
            );
            const names = Object.keys(args);
            const result = await client.query(
              `select public.${fn}(${names.map((name, index) => `${name} => $${index + 1}`).join(", ")}) as result`,
              names.map((name) => args[name]),
            );
            await client.query("commit");
            return { data: result.rows[0]?.result ?? null, error: null };
          } catch (error) {
            await client.query("rollback").catch(() => undefined);
            const failure = error as { code?: string; message?: string };
            return {
              data: null,
              error: { code: failure.code, message: failure.message },
            };
          } finally {
            await client.end();
          }
        },
      };
    }

    function authFor() {
      return {
        userId: caller.user,
        email: `${caller.user}@example.org`,
        profileId: caller.user,
        tenantId: caller.tenant,
        isAuthenticated: true,
        role: "admin",
        memberships: [
          {
            tenantId: caller.tenant,
            role: "staff",
            staffRole: "development",
            isActive: true,
            isTenantAdmin: true,
          },
        ],
        assignment: {
          assignmentId: caller.assignment,
          userId: caller.user,
          tenantId: caller.tenant,
          revision: "1",
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: true,
        },
        assignmentDenial: null,
      };
    }

    let mocked = false;
    async function signedIn() {
      if (!mocked) {
        vi.doMock("@asym/auth/context", async (original) => ({
          ...(await original<Record<string, unknown>>()),
          getAuthContext: async () => authFor(),
        }));
        vi.doMock(
          "../../../../packages/api/src/shared/request-session-client",
          async (original) => ({
            ...(await original<Record<string, unknown>>()),
            requestCarriesSupabaseSession: () => true,
            createRequestSessionClient: async () => sessionClient(),
          }),
        );
        mocked = true;
      }
      const { NextRequest } = await import("next/server");
      return (name: string) =>
        new NextRequest("http://localhost/api/admin/sites", {
          method: "POST",
          headers: {
            authorization: "Bearer realstack",
            "content-type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
    }

    function coreReader() {
      return async (siteId: string) => {
        const { rows } = await s.admin.query(
          'select id::text as id, tenant_id::text as "tenantId" from public.sites where id = $1',
          [siteId],
        );
        return (
          (rows[0] as { id: string; tenantId: string } | undefined) ?? null
        );
      };
    }

    function scoped(
      orgs: { tenants: string[]; sites: string[] },
      between?: () => void,
    ): Query {
      let arrays = 0;
      return (options) => {
        const value = queryJson(options);
        if (!Array.isArray(value)) return value;
        arrays += 1;
        const kept = value.filter(
          (row: { id: string; tenant?: string; tenantId?: string }) =>
            orgs.tenants.includes(row.tenant ?? row.tenantId ?? "") ||
            orgs.sites.includes(row.id),
        );
        if (arrays === 1) between?.();
        return kept;
      };
    }

    const scopeOf = (orgs: Org[]) => ({
      tenants: orgs.map((org) => org.tenant),
      sites: orgs.map((org) => org.site),
    });

    async function presentationsOf(ids: string[]) {
      const { rows } = await s.admin.query(
        "select id::text as id, tenant, created_at::text as created from cms.site_presentations where id = any($1::uuid[]) order by id",
        [ids],
      );
      return rows as Array<{ id: string; tenant: string; created: string }>;
    }

    async function presentationCount() {
      const { rows } = await s.admin.query(
        "select count(*)::int as n from cms.site_presentations",
      );
      return rows[0].n as number;
    }

    async function sweepInProcess(query: Query) {
      const { readSitePresentationState, judgeSitePresentations } =
        await recordsModule();
      const { presentSites } = await sweepModule();
      const judged = judgeSitePresentations(
        readSitePresentationState({ databaseUrl: ADMIN_URL, query }),
      );
      const handled = await presentSites(s.payload as never, judged.missing, {
        log: () => undefined,
      });
      return { judged, handled };
    }

    async function releaseSettings() {
      const { readReleaseSettings } = await releaseModule();
      return readReleaseSettings({
        RELEASE_ENVIRONMENT: "preview",
        RELEASE_SUPABASE_PROJECT_REF: REF,
        RELEASE_DATABASE_URL: ADMIN_URL,
        RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
        RELEASE_CMS_RUNTIME_PASSWORD: runtimePassword,
      });
    }

    it("A's administrator creates a Site through Mission Control's Sites route: exactly one presentation, under the Site's ID and A; New page in A lists it and creates a draft", async () => {
      const [a] = await organizations(1);
      await administrator(a!.tenant);
      const post = await signedIn();
      const route =
        await import("../../../../apps/admin/app/api/admin/sites/route");
      const response = await route.POST(post("Spanish site") as never);
      expect(response.status).toBe(201);
      const { site } = (await response.json()) as { site: { id: string } };
      made.sites.push(site.id);
      expect(
        (await presentationsOf([site.id])).map(({ id, tenant }) => ({
          id,
          tenant,
        })),
      ).toEqual([{ id: site.id, tenant: a!.tenant }]);
      const editor = await s.person(a!.tenant);
      const listed = await s.restAs(
        editor,
        "GET",
        "/web-studio/api/site-presentations?limit=100&pagination=false&depth=0",
      );
      expect(listed.status).toBe(200);
      expect(
        ((listed.json?.docs ?? []) as Doc[]).map((doc) => String(doc.id)),
      ).toEqual([site.id]);
      const draft = await s.restAs(
        editor,
        "POST",
        "/web-studio/api/web-studio/create-from-template",
        {
          starterKey: "standard",
          site: site.id,
          title: "Welcome",
          slug: `welcome-${randomUUID().slice(0, 8)}`,
        },
      );
      expect(draft.status, JSON.stringify(draft.json)).toBe(200);
      expect(draft.json).toMatchObject({ collectionSlug: "pages" });
      const { rows } = await s.admin.query(
        "select site_id::text as site, tenant from cms.pages where id = $1",
        [draft.json?.id],
      );
      expect(rows).toEqual([{ site: site.id, tenant: a!.tenant }]);
    });

    it("with the step made to fail after create_site commits, the Site stands and is answered as created, and the next sweep gives it exactly one presentation", async () => {
      const [a] = await organizations(1);
      await administrator(a!.tenant);
      const post = await signedIn();
      const { createSitePost } =
        await import("../../../../packages/api/src/admin/sites/settings");
      const failing = createSitePost(async () => {
        throw new Error("the CMS cannot be reached");
      });
      const response = await failing(post("Second site") as never);
      expect(response.status).toBe(201);
      const { site } = (await response.json()) as { site: { id: string } };
      made.sites.push(site.id);
      const { rows } = await s.admin.query(
        "select tenant_id::text as tenant from public.sites where id = $1",
        [site.id],
      );
      expect(rows).toEqual([{ tenant: a!.tenant }]);
      expect(await presentationsOf([site.id])).toEqual([]);
      const scope = { tenants: [a!.tenant], sites: [a!.site, site.id] };
      await sweepInProcess(scoped(scope));
      expect(
        (await presentationsOf([site.id, a!.site])).map(({ id, tenant }) => ({
          id,
          tenant,
        })),
      ).toEqual(
        [site.id, a!.site].sort().map((id) => ({ id, tenant: a!.tenant })),
      );
    });

    it("refuses a random UUID, and a Site of B while acting for A, and writes nothing", async () => {
      const { ensureSitePresentation } = await stepModule();
      const [a, b] = await organizations(2);
      const readSite = coreReader();
      const before = await presentationCount();
      await expect(
        ensureSitePresentation(s.payload as never, {
          siteId: randomUUID(),
          readSite,
        }),
      ).rejects.toMatchObject({ reason: "not-a-site" });
      await expect(
        ensureSitePresentation(s.payload as never, {
          siteId: b!.site,
          readSite,
          actingTenantId: a!.tenant,
        }),
      ).rejects.toMatchObject({ reason: "other-organization" });
      expect(await presentationCount()).toBe(before);
      expect(await presentationsOf([a!.site, b!.site])).toEqual([]);
    });

    it("provisioning commits and the step does not run; the same request re-run answers created false with no Site; the sweep finds the default Site and writes one presentation; a second sweep writes nothing", async () => {
      const operator = randomUUID();
      await s.admin.query("insert into auth.users (id) values ($1)", [
        operator,
      ]);
      await s.admin.query("delete from authz.memberships where user_id = $1", [
        operator,
      ]);
      await s.admin.query(
        "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'wp6r1 acceptance', 'WP6 rest acceptance operator')",
        [operator],
      );
      made.users.push(operator);
      const tag = randomUUID().slice(0, 8);
      const request = [
        `wp6r1-${tag}`,
        `Provisioned Mission ${tag}`,
        `wp6r1-${tag}`,
        `first-admin-${tag}@example.org`,
        null,
        "WP6 rest: the kill between the Core step and the CMS step",
      ];
      const provision = async () => {
        const client = new pg.Client({ connectionString: ADMIN_URL });
        await client.connect();
        try {
          await client.query("begin");
          await client.query("set local role authenticated");
          await client.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', '', true)",
            [
              JSON.stringify({
                sub: operator,
                role: "authenticated",
                aal: "aal2",
              }),
            ],
          );
          const { rows } = await client.query(
            "select public.provision_tenant($1, $2, $3, $4, $5, $6) as r",
            request,
          );
          await client.query("commit");
          return rows[0].r as { tenant_id: string; created: boolean };
        } finally {
          await client.end();
        }
      };
      const first = await provision();
      expect(first.created).toBe(true);
      made.tenants.push(first.tenant_id);
      const { rows: defaults } = await s.admin.query(
        "select id::text as id from public.sites where tenant_id = $1 and is_default",
        [first.tenant_id],
      );
      expect(defaults).toHaveLength(1);
      const site = defaults[0].id as string;
      made.sites.push(site);
      expect(await presentationsOf([site])).toEqual([]);
      const again = await provision();
      expect(again).toEqual({ tenant_id: first.tenant_id, created: false });
      const scope = { tenants: [first.tenant_id], sites: [site] };
      const swept = await sweepInProcess(scoped(scope));
      expect(swept.judged.missing).toEqual([
        { id: site, tenantId: first.tenant_id },
      ]);
      const once = await presentationsOf([site]);
      expect(once.map(({ id, tenant }) => ({ id, tenant }))).toEqual([
        { id: site, tenant: first.tenant_id },
      ]);
      const second = await sweepInProcess(scoped(scope));
      expect(second.judged.missing).toEqual([]);
      expect(second.handled).toBe(0);
      expect(await presentationsOf([site])).toEqual(once);
    });

    it("two sessions run the step for one Site at once: one row, and both answer it", async () => {
      const { ensureSitePresentation } = await stepModule();
      const [a] = await organizations(1);
      const readSite = coreReader();
      const [one, two] = await Promise.all([
        ensureSitePresentation(s.payload as never, {
          siteId: a!.site,
          readSite,
        }),
        ensureSitePresentation(s.payload as never, {
          siteId: a!.site,
          readSite,
        }),
      ]);
      expect(String(one.id)).toBe(a!.site);
      expect(String(two.id)).toBe(a!.site);
      expect(await presentationsOf([a!.site])).toHaveLength(1);
    });

    it("a planted presentation under another tenant for a Site, and one with no Site: the release's check refuses naming each; the step refuses the first and changes nothing", async () => {
      const { ensureSitePresentation } = await stepModule();
      const { checkSitePresentations } = await releaseModule();
      const [a, b] = await organizations(2);
      const loose = randomUUID();
      made.sites.push(loose);
      await s.service.createSitePresentation(s.payload as never, {
        siteId: a!.site,
        tenantId: b!.tenant,
      });
      await s.service.createSitePresentation(s.payload as never, {
        siteId: loose,
        tenantId: a!.tenant,
      });
      const query = scoped({
        tenants: [a!.tenant, b!.tenant],
        sites: [a!.site, b!.site, loose],
      });
      let refusal = "";
      try {
        checkSitePresentations({ databaseUrl: ADMIN_URL, query });
      } catch (error) {
        refusal = (error as Error).message;
      }
      expect(refusal).toContain(loose);
      expect(refusal).toMatch(
        new RegExp(`${a!.site}[^;]*${b!.tenant}[^;]*${a!.tenant}`),
      );
      const before = await presentationsOf([a!.site, b!.site, loose]);
      await expect(
        ensureSitePresentation(s.payload as never, {
          siteId: a!.site,
          readSite: coreReader(),
        }),
      ).rejects.toMatchObject({ reason: "presentation-elsewhere" });
      expect(await presentationsOf([a!.site, b!.site, loose])).toEqual(before);
    });

    it("the release's sweep, in its own process as cms_runtime, gives three organizations' Sites one presentation each, and a second sweep writes nothing", async () => {
      const { sweepSitePresentations } = await releaseModule();
      const orgs = await organizations(3);
      const settings = await releaseSettings();
      const query = scoped(scopeOf(orgs));
      expect(
        sweepSitePresentations({ settings, query, log: () => undefined }),
      ).toEqual({ handed: 3 });
      const sites = orgs.map((org) => org.site);
      const once = await presentationsOf(sites);
      expect(once.map(({ id, tenant }) => ({ id, tenant }))).toEqual(
        [...orgs]
          .sort((left, right) => (left.site < right.site ? -1 : 1))
          .map((org) => ({ id: org.site, tenant: org.tenant })),
      );
      expect(
        sweepSitePresentations({
          settings,
          query: scoped(scopeOf(orgs)),
          log: () => undefined,
        }),
      ).toEqual({ handed: 0 });
      expect(await presentationsOf(sites)).toEqual(once);
    });

    it("where one Site has its presentation, the sweep makes only the others and leaves that one as it was", async () => {
      const { ensureSitePresentation } = await stepModule();
      const orgs = await organizations(3);
      await ensureSitePresentation(s.payload as never, {
        siteId: orgs[0]!.site,
        readSite: coreReader(),
      });
      const kept = await presentationsOf([orgs[0]!.site]);
      const swept = await sweepInProcess(scoped(scopeOf(orgs)));
      expect(swept.handled).toBe(2);
      expect(swept.judged.missing.map((site) => site.id).sort()).toEqual(
        [orgs[1]!.site, orgs[2]!.site].sort(),
      );
      expect(await presentationsOf([orgs[0]!.site])).toEqual(kept);
      expect(await presentationsOf(orgs.map((org) => org.site))).toHaveLength(
        3,
      );
    });

    it("a sweep stopped after one write and run again writes the rest, with no duplicate", async () => {
      const { readSitePresentationState, judgeSitePresentations } =
        await recordsModule();
      const { presentSites } = await sweepModule();
      const orgs = await organizations(3);
      const judged = judgeSitePresentations(
        readSitePresentationState({
          databaseUrl: ADMIN_URL,
          query: scoped(scopeOf(orgs)),
        }),
      );
      let creates = 0;
      const stopping = new Proxy(s.payload as Record<string, unknown>, {
        get(target, key) {
          const value = Reflect.get(target, key);
          if (key !== "create" || typeof value !== "function")
            return typeof value === "function" ? value.bind(target) : value;
          return async (args: unknown) => {
            creates += 1;
            if (creates > 1) throw new Error("the runner was stopped");
            return value.call(target, args);
          };
        },
      });
      await expect(
        presentSites(stopping as never, judged.missing, {
          log: () => undefined,
        }),
      ).rejects.toThrow(/stopped/);
      expect(await presentationsOf(orgs.map((org) => org.site))).toHaveLength(
        1,
      );
      const rerun = await sweepInProcess(scoped(scopeOf(orgs)));
      expect(rerun.handled).toBe(2);
      const all = await presentationsOf(orgs.map((org) => org.site));
      expect(all.map(({ id, tenant }) => ({ id, tenant }))).toEqual(
        [...orgs]
          .sort((left, right) => (left.site < right.site ? -1 : 1))
          .map((org) => ({ id: org.site, tenant: org.tenant })),
      );
    });

    it("a Site created between the sweep's two reads is not called an orphan, and keeps the one presentation its own step made", async () => {
      const { sweepSitePresentations } = await releaseModule();
      const [a] = await organizations(1);
      const late = randomUUID();
      made.sites.push(late);
      const scope = { tenants: [a!.tenant], sites: [a!.site, late] };
      const lateRow = () =>
        queryJson({
          databaseUrl: ADMIN_URL,
          label: "the late Site's presentation row",
          sql: `SELECT json_build_object('row', (SELECT xmin::text || '/' || created_at::text FROM cms.site_presentations WHERE id = '${late}'), 'rows', (SELECT count(*) FROM cms.site_presentations WHERE id = '${late}'))::text;`,
        }) as { row: string | null; rows: number };
      let before: { row: string | null; rows: number } | undefined;
      const between = () => {
        queryJson({
          databaseUrl: ADMIN_URL,
          label: "a Site and its presentation made between the reads",
          sql: `INSERT INTO public.sites (id, tenant_id, name) VALUES ('${late}', '${a!.tenant}', 'Late');
INSERT INTO cms.site_presentations (id, tenant) VALUES ('${late}', '${a!.tenant}');
SELECT json_build_object('made', true)::text;`,
        });
        before = lateRow();
      };
      const settings = await releaseSettings();
      expect(
        sweepSitePresentations({
          settings,
          query: scoped(scope, between),
          log: () => undefined,
        }),
      ).toEqual({ handed: 2 });
      expect(
        (await presentationsOf([a!.site, late])).map(({ id, tenant }) => ({
          id,
          tenant,
        })),
      ).toEqual(
        [a!.site, late].sort().map((id) => ({ id, tenant: a!.tenant })),
      );
      expect(before?.rows).toBe(1);
      expect(lateRow()).toEqual(before);
    });

    it("refuses, with the repository's own marker check, a loopback database that does not carry the disposable mark, and sends no ALTER ROLE", async () => {
      const name = `wp6r1_unmarked_${randomUUID().slice(0, 8)}`;
      await s.admin.query(`CREATE DATABASE ${name}`);
      try {
        const unmarked = new URL(ADMIN_URL);
        unmarked.pathname = `/${name}`;
        const sent: string[] = [];
        const recording = {
          query: async (text: string) => {
            sent.push(text);
            return { rows: [] };
          },
          escapeLiteral: (value: string) => `'${value}'`,
        };
        await expect(
          setDisposableRolePassword({
            adminUrl: unmarked.toString(),
            client: recording,
            role: "cms_runtime",
            password: runtimePassword,
          }),
        ).rejects.toThrow(/refusing/i);
        expect(sent).toEqual([]);
      } finally {
        await s.admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      }
    });
  },
);
