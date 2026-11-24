import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { claimSql, resolveAsAnon, snapshot } from "./site-fixture";
import { migrationBody } from "../issue-2674/harness";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  type Outcome,
  fixtureIds,
  fixtureSql,
  migration,
  read,
} from "../issue-2675/harness";

const SEED = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
];
const NO_CALLER = "platform: a platform command needs a signed-in caller";
const NOT_OPERATOR = "platform: the caller is not a platform operator";
const NO_SECOND_FACTOR =
  "platform: a platform command needs a session verified with a second factor";
const BAD_KEY =
  "platform: a provisioning key is required: not blank, no whitespace at either end, at most 200 characters";
const BAD_NAME =
  "platform: the organization name must have no whitespace at either end and 1 to 160 characters";
const BAD_SLUG =
  "platform: the slug must be 1 to 63 lower-case letters, digits or inner hyphens";
const BAD_REASON = "platform: a reason is required";
const BAD_EMAIL = "platform: a valid email address is required";
const BAD_STAFF_ROLE =
  "platform: the first administrator's sub-role must be finance, mobilizer, development, hr or member_care";
const KEY_REUSED =
  "platform: this provisioning key was used for a different request";
const SLUG_TAKEN = "platform: the slug is taken";
const HELPER_NOT_FOUND = "private: organization not found";
const HELPER_BAD_NAME =
  "private: the organization name cannot name a Site or brand";
const BACKFILL_REFUSAL = (n: number) =>
  `WP3a part 2 backfill preflight: organizations whose name cannot name a Site or brand=${n}`;
const DENIED = "permission denied for function provision_tenant";
const STAFF_ROLES = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
];
const TENANT_TABLES = [
  "public.sites",
  "public.site_domains",
  "public.donor_portal_hosts",
  "public.donor_account_brands",
  "public.legal_entities",
  "public.funds",
  "public.contribution_approval_policies",
  "public.membership_invitations",
  "public.audit_logs",
  "authz.memberships",
  "public.payment_account_bindings",
  "platform.tenant_provisioning",
];
const SIGNATURE = "(text,text,text,text,text,text)";
const FUNCTIONS = ["public.provision_tenant", "platform.provision_tenant"];

type Who = {
  sub?: string | null;
  aal?: string;
  headers?: Record<string, string>;
};
type Request = {
  key: string | null;
  name: string | null;
  slug: string | null;
  email: string | null;
  staffRole: string | null;
  reason: string | null;
};

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676 WP3a part 2a: provisioning, the default Site, home record and brand of every organization (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    for (const key of ["UOP", "tbSite", "tbHome", "tbEntity", "tbFund"])
      id[key] = randomUUID();
    const OPERATOR: Who = { sub: "UOP", aal: "aal2" };
    let tbBaseline: Record<string, unknown[]> = {};

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    function fixture() {
      const q = (k: string) => `'${id[k]}'`;
      return `${fixtureSql(id)}
        insert into auth.users (id) values (${q("UOP")});
        delete from authz.memberships where user_id = ${q("UOP")};
        insert into authz.platform_operators (user_id, added_by, reason)
          values (${q("UOP")}, 'acc2676 provisioning', 'WP3a part 2a acceptance operator');
        insert into public.sites (id, tenant_id, name, is_default) values (${q("tbSite")}, ${q("TB")}, 'acc2675 B', true);
        insert into public.donor_portal_hosts (id, tenant_id) values (${q("tbHome")}, ${q("TB")});
        insert into public.donor_account_brands (tenant_id, display_name) values (${q("TB")}, 'acc2675 B');
        insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name)
          values (${q("tbEntity")}, ${q("TB")}, 'acc2675 B', 'US', 'usd', 'acc2675 B');
        insert into public.funds (id, tenant_id, legal_entity_id, name, system_purpose)
          values (${q("tbFund")}, ${q("TB")}, ${q("tbEntity")}, 'Fee cover', 'fee_cover');
        insert into public.contribution_approval_policies (tenant_id, ownership_mode)
          values (${q("TB")}, 'no_approval_required');
        insert into public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
          values (${q("TB")}, ${q("UB")}, 'acc2676_fixture', 'tenant', ${q("TB")}, '{}'::jsonb);`;
    }

    async function rowsOf(tenants: string[]) {
      const out: Record<string, unknown[]> = {};
      out["public.tenants"] = (
        await db.query(
          "select to_jsonb(t) as v from public.tenants t where t.id = any($1::uuid[]) order by to_jsonb(t)::text",
          [tenants],
        )
      ).rows.map((r) => r.v);
      for (const table of TENANT_TABLES)
        out[table] = (
          await db.query(
            `select to_jsonb(t) as v from ${table} t where t.tenant_id = any($1::uuid[]) order by to_jsonb(t)::text`,
            [tenants],
          )
        ).rows.map((r) => r.v);
      return out;
    }

    async function totals() {
      const out: Record<string, number> = {};
      for (const table of ["public.tenants", ...TENANT_TABLES])
        out[table] = (await db.query(`select count(*)::int as n from ${table}`))
          .rows[0].n as number;
      return out;
    }

    async function expectTbUnchanged() {
      expect(await rowsOf([id.TB!])).toEqual(tbBaseline);
    }

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(fixture());
        tbBaseline = await rowsOf([id.TB!]);
        await fn();
        await expectTbUnchanged();
      } finally {
        await db.query("rollback");
      }
    }

    async function act(
      role: string,
      who: Who,
      sql: string,
      params: unknown[] = [],
    ): Promise<Outcome> {
      await db.query("savepoint acc2676p");
      try {
        await db.query(`set local role ${role}`);
        const claims = JSON.stringify({
          role,
          ...(who.sub ? { sub: id[who.sub] } : {}),
          ...(who.aal ? { aal: who.aal } : {}),
        });
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [claims, who.headers ? JSON.stringify(who.headers) : ""],
        );
        const result = await db.query(sql, params);
        await db.query("reset role");
        await db.query("release savepoint acc2676p");
        return {
          rows: result.rows as Record<string, unknown>[],
          code: null,
          message: "",
        };
      } catch (e) {
        await db.query("rollback to savepoint acc2676p");
        const err = e as { code?: string; message?: string };
        return {
          rows: [],
          code: err.code ?? "?",
          message: err.message ?? String(e),
        };
      }
    }

    function request(overrides: Partial<Request> = {}): Request {
      const tag = randomUUID().slice(0, 8);
      return {
        key: `acc2676-${tag}`,
        name: `Provisioned Mission ${tag}`,
        slug: `acc2676-${tag}`,
        email: `first-admin-${tag}@example.org`,
        staffRole: null,
        reason: "Onboarding a new sending organization",
        ...overrides,
      };
    }

    function provision(
      who: Who,
      r: Request,
      fn = "public.provision_tenant",
      role = "authenticated",
    ) {
      return act(role, who, `select ${fn}($1, $2, $3, $4, $5, $6) as r`, [
        r.key,
        r.name,
        r.slug,
        r.email,
        r.staffRole,
        r.reason,
      ]);
    }

    async function provisioned(r: Request, fn = "public.provision_tenant") {
      const out = await provision(OPERATOR, r, fn);
      expect(out.message).toBe("");
      return out.rows[0]!.r as Record<string, unknown> & {
        tenant_id: string;
        invitation: Record<string, unknown>;
      };
    }

    async function refused(
      who: Who,
      r: Request,
      code: string,
      message: string,
      fn = "public.provision_tenant",
      role = "authenticated",
    ) {
      const before = await totals();
      const out = await provision(who, r, fn, role);
      expect([fn, role, who.sub, who.aal, out.code, out.message]).toEqual([
        fn,
        role,
        who.sub,
        who.aal,
        code,
        message,
      ]);
      expect(await totals()).toEqual(before);
    }

    async function homeIffBrand(tenants: string[]) {
      return (
        await db.query(
          `select t.id::text as tenant,
                  exists (select 1 from public.donor_portal_hosts h where h.tenant_id = t.id) as home,
                  exists (select 1 from public.donor_account_brands b where b.tenant_id = t.id) as brand
             from public.tenants t where t.id = any($1::uuid[]) order by 1`,
          [tenants],
        )
      ).rows as { tenant: string; home: boolean; brand: boolean }[];
    }

    async function kinds(tenants: string[]) {
      return (
        await db.query(
          `select distinct k from (
             select 'tenant:' || t.status as k from public.tenants t where t.id = any($1::uuid[])
             union all select case when s.is_default then 'site:default:' || s.status else 'site:second' end
               from public.sites s where s.tenant_id = any($1::uuid[])
             union all select 'claimed_name' from public.sites s where s.tenant_id = any($1::uuid[]) and s.primary_domain is not null
             union all select 'claimed_name' from public.site_domains d where d.tenant_id = any($1::uuid[])
             union all select 'home' from public.donor_portal_hosts h where h.tenant_id = any($1::uuid[])
             union all select 'home:designated' from public.donor_portal_hosts h where h.tenant_id = any($1::uuid[]) and h.primary_domain is not null
             union all select case when b.display_name = t.name then 'brand:organization_name' else 'brand:other' end
               from public.donor_account_brands b join public.tenants t on t.id = b.tenant_id where b.tenant_id = any($1::uuid[])
             union all select 'legal_entity:' || e.country_code || ':' || e.currency from public.legal_entities e where e.tenant_id = any($1::uuid[])
             union all select 'fund:' || f.system_purpose from public.funds f where f.tenant_id = any($1::uuid[]) and f.system_purpose is not null
             union all select 'approval:' || p.ownership_mode from public.contribution_approval_policies p where p.tenant_id = any($1::uuid[])
           ) x order by 1`,
          [tenants],
        )
      ).rows.map((r) => r.k as string);
    }

    async function runBackfill() {
      await db.query(migrationBody(migration("wp3a2_existing_tenant_homes")));
    }

    async function plant(
      name: string,
      status = "active",
    ): Promise<{ tenant: string }> {
      const tenant = randomUUID();
      await db.query(
        "insert into public.tenants (id, name, slug, status) values ($1, $2, $3, $4)",
        [tenant, name, `acc2676-plant-${tenant}`, status],
      );
      return { tenant };
    }

    async function homeRows(tenant: string) {
      return (
        await db.query(
          `select
             (select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'status', s.status, 'primary_domain', s.primary_domain) order by s.id)
                from public.sites s where s.tenant_id = $1 and s.is_default) as sites,
             (select jsonb_agg(jsonb_build_object('id', h.id, 'primary_domain', h.primary_domain)) from public.donor_portal_hosts h where h.tenant_id = $1) as homes,
             (select jsonb_agg(b.display_name) from public.donor_account_brands b where b.tenant_id = $1) as brands`,
          [tenant],
        )
      ).rows[0] as {
        sites: Record<string, unknown>[] | null;
        homes: Record<string, unknown>[] | null;
        brands: string[] | null;
      };
    }

    it("test 9: the step record is forced, has no policy and no grant; the helper and both commands have exactly the grants they need", () =>
      tx(async () => {
        expect(
          (
            await db.query(
              `select c.relrowsecurity, c.relforcerowsecurity, pg_get_userbyid(c.relowner) as owner,
                      (select count(*)::int from pg_policy p where p.polrelid = c.oid) as policies,
                      coalesce((select array_agg(distinct a.grantee::regrole::text order by a.grantee::regrole::text)
                                  from aclexplode(c.relacl) a where a.grantee <> c.relowner), '{}') as grantees
                 from pg_class c where c.oid = 'platform.tenant_provisioning'::regclass`,
            )
          ).rows,
        ).toEqual([
          {
            relrowsecurity: true,
            relforcerowsecurity: true,
            owner: "postgres",
            policies: 0,
            grantees: [],
          },
        ]);
        for (const role of [
          "anon",
          "authenticated",
          "service_role",
          "tenant_guard",
        ])
          for (const privilege of [
            "SELECT",
            "INSERT",
            "UPDATE",
            "DELETE",
            "TRUNCATE",
            "REFERENCES",
            "TRIGGER",
          ])
            expect([
              role,
              privilege,
              (
                await db.query(
                  "select has_table_privilege($1, 'platform.tenant_provisioning', $2) as ok",
                  [role, privilege],
                )
              ).rows[0].ok,
            ]).toEqual([role, privilege, false]);
        expect(
          (
            await db.query(
              `select p.oid::regprocedure::text as fn, pg_get_userbyid(p.proowner) as owner, p.prosecdef as definer,
                      p.proconfig as config,
                      (select coalesce(array_agg(g.name order by g.name), '{}')
                         from (select case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end as name
                                 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                                where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) g) as execute
                 from pg_proc p
                where p.oid in ('private.ensure_tenant_home(uuid)'::regprocedure,
                                'platform.provision_tenant${SIGNATURE}'::regprocedure,
                                'public.provision_tenant${SIGNATURE}'::regprocedure)
                order by 1`,
            )
          ).rows,
        ).toEqual([
          {
            fn: "platform.provision_tenant(text,text,text,text,text,text)",
            owner: "postgres",
            definer: true,
            config: ['search_path=""'],
            execute: ["authenticated"],
          },
          {
            fn: "private.ensure_tenant_home(uuid)",
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            execute: [],
          },
          {
            fn: "provision_tenant(text,text,text,text,text,text)",
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            execute: ["authenticated"],
          },
        ]);
        for (const role of [
          "anon",
          "authenticated",
          "service_role",
          "tenant_guard",
        ])
          expect([
            role,
            (
              await db.query(
                "select has_function_privilege($1, 'private.ensure_tenant_home(uuid)', 'EXECUTE') as ok",
                [role],
              )
            ).rows[0].ok,
          ]).toEqual([role, false]);
        const commands = (
          await db.query(
            `select p.oid::regprocedure::text as fn from pg_proc p
              where p.pronamespace = 'platform'::regnamespace
                and has_function_privilege('authenticated', p.oid, 'EXECUTE') order by 1`,
          )
        ).rows.map((r) => r.fn as string);
        expect(commands).toContain(
          "platform.provision_tenant(text,text,text,text,text,text)",
        );
      }));

    it("test 1: refuses no caller, a non-operator at aal2 (the other organization's administrator with both headers too) and an operator at aal1 before any input check, writes nothing, and serves an operator at aal2", () =>
      tx(async () => {
        const taken = await provisioned(request());
        const takenRow = (
          await db.query(
            "select t.slug, p.provisioning_key from public.tenants t join platform.tenant_provisioning p on p.tenant_id = t.id where t.id = $1",
            [taken.tenant_id],
          )
        ).rows[0] as { slug: string; provisioning_key: string };
        const inputs: Request[] = [
          request(),
          request({ slug: takenRow.slug }),
          request({ key: takenRow.provisioning_key }),
          request({ key: " ", name: " bad", slug: "Bad Slug", email: "x" }),
          request({ staffRole: "bogus", reason: "  " }),
          {
            key: null,
            name: null,
            slug: null,
            email: null,
            staffRole: null,
            reason: null,
          },
        ];
        const refusals: [Who, string][] = [
          [{ sub: null }, NO_CALLER],
          [{ sub: null, aal: "aal2" }, NO_CALLER],
          [{ sub: "UDEV", aal: "aal2" }, NOT_OPERATOR],
          [
            {
              sub: "UADM",
              aal: "aal2",
              headers: {
                "x-asym-tenant": id.TA!,
                "x-asym-assignment": id.mAdm!,
              },
            },
            NOT_OPERATOR,
          ],
          [{ sub: "UOP", aal: "aal1" }, NO_SECOND_FACTOR],
          [{ sub: "UOP" }, NO_SECOND_FACTOR],
        ];
        for (const fn of FUNCTIONS)
          for (const [who, message] of refusals)
            for (const r of inputs) await refused(who, r, "42501", message, fn);
        for (const role of ["anon", "service_role"])
          await refused(
            { sub: "UOP", aal: "aal2" },
            request(),
            "42501",
            DENIED,
            "public.provision_tenant",
            role,
          );
        for (const fn of FUNCTIONS) {
          for (const role of ["anon", "service_role", "authenticated"])
            expect([
              fn,
              role,
              (
                await db.query(
                  `select has_function_privilege($1, '${fn}${SIGNATURE}', 'EXECUTE') as ok`,
                  [role],
                )
              ).rows[0].ok,
            ]).toEqual([fn, role, role === "authenticated"]);
          expect(
            (
              await db.query(
                `select exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                                where a.grantee = 0 and a.privilege_type = 'EXECUTE') as public_execute
                   from pg_proc p where p.oid = '${fn}${SIGNATURE}'::regprocedure`,
              )
            ).rows[0].public_execute,
          ).toBe(false);
          const served = await provisioned(request(), fn);
          expect(served.created).toBe(true);
        }
      }));

    it("test 3: writes one active organization with its default Site, home record, brand, US legal entity, fee-cover fund, approval row, administrator invitation, step record and audit rows, and nothing else", () =>
      tx(async () => {
        const r = request({
          email: "  First.Admin+Mission@Example.ORG ",
          reason: "  Onboarding a new sending organization \t",
        });
        const out = await provisioned(r);
        const tenant = out.tenant_id;
        const invitation = out.invitation as {
          invitation_id: string;
          tenant_id: string;
          selector: string;
          verifier: string;
          expires_at: string;
          staff_role: string;
        };
        expect(Object.keys(out).sort()).toEqual([
          "created",
          "fund_id",
          "home_id",
          "invitation",
          "legal_entity_id",
          "site_id",
          "tenant_id",
        ]);
        expect(out.created).toBe(true);
        expect(Object.keys(invitation).sort()).toEqual([
          "expires_at",
          "invitation_id",
          "selector",
          "staff_role",
          "tenant_id",
          "verifier",
        ]);
        expect(invitation).toMatchObject({
          tenant_id: tenant,
          staff_role: "development",
        });
        const rows = await rowsOf([tenant]);
        expect(rows["public.tenants"]).toEqual([
          expect.objectContaining({
            id: tenant,
            name: r.name,
            slug: r.slug,
            status: "active",
          }),
        ]);
        expect(rows["public.sites"]).toEqual([
          {
            id: out.site_id,
            tenant_id: tenant,
            name: r.name,
            is_default: true,
            status: "active",
            primary_domain: null,
          },
        ]);
        expect(rows["public.site_domains"]).toEqual([]);
        expect(rows["public.donor_portal_hosts"]).toEqual([
          { id: out.home_id, tenant_id: tenant, primary_domain: null },
        ]);
        expect(rows["public.donor_account_brands"]).toEqual([
          { tenant_id: tenant, display_name: r.name },
        ]);
        expect(rows["public.legal_entities"]).toEqual([
          expect.objectContaining({
            id: out.legal_entity_id,
            tenant_id: tenant,
            name: r.name,
            legal_name: r.name,
            country_code: "US",
            currency: "usd",
            tax_id: null,
          }),
        ]);
        expect(rows["public.funds"]).toEqual([
          expect.objectContaining({
            id: out.fund_id,
            tenant_id: tenant,
            legal_entity_id: out.legal_entity_id,
            name: "Fee cover",
            system_purpose: "fee_cover",
          }),
        ]);
        expect(rows["public.contribution_approval_policies"]).toEqual([
          expect.objectContaining({
            tenant_id: tenant,
            ownership_mode: "no_approval_required",
          }),
        ]);
        expect(rows["public.membership_invitations"]).toEqual([
          expect.objectContaining({
            id: invitation.invitation_id,
            tenant_id: tenant,
            email_normalized: "first.admin+mission@example.org",
            role: "staff",
            staff_role: "development",
            is_tenant_admin: true,
            purpose: "operator_admin_invite",
            status: "issued",
          }),
        ]);
        expect(rows["authz.memberships"]).toEqual([]);
        expect(rows["public.payment_account_bindings"]).toEqual([]);
        const digest = (
          await db.query(
            "select encode(sha256(convert_to(jsonb_build_array($1::text, $2::text, $3::text, $4::text)::text, 'UTF8')), 'hex') as d",
            [r.name, r.slug, "first.admin+mission@example.org", "development"],
          )
        ).rows[0].d as string;
        expect(rows["platform.tenant_provisioning"]).toEqual([
          {
            provisioning_key: r.key,
            tenant_id: tenant,
            request_digest: digest,
            requested_by: id.UOP,
            admin_invitation_id: invitation.invitation_id,
            core_completed_at: expect.any(String),
            created_at: expect.any(String),
          },
        ]);
        expect(
          JSON.stringify(rows["platform.tenant_provisioning"]),
        ).not.toContain("@");
        const audits = rows["public.audit_logs"] as {
          action: string;
          user_id: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, unknown>;
        }[];
        expect(audits.map((a) => a.action).sort()).toEqual([
          "operator_admin_invitation_issued",
          "tenant_provisioned",
        ]);
        const audit = audits.find((a) => a.action === "tenant_provisioned")!;
        expect(audit).toMatchObject({
          user_id: id.UOP,
          resource_type: "tenant",
          resource_id: tenant,
        });
        expect(audit.details).toEqual({
          provisioning_key: r.key,
          reason: "Onboarding a new sending organization",
          operator_id: id.UOP,
          tenant_id: tenant,
          site_id: out.site_id,
          home_id: out.home_id,
          legal_entity_id: out.legal_entity_id,
          fund_id: out.fund_id,
          invitation_id: invitation.invitation_id,
        });
        const details = JSON.stringify(audit.details);
        for (const secret of [invitation.verifier, invitation.selector, "@"])
          expect(details).not.toContain(secret);

        for (const staffRole of STAFF_ROLES) {
          const named = await provisioned(request({ staffRole }));
          expect(named.invitation.staff_role).toBe(staffRole);
          expect(
            (
              await db.query(
                "select staff_role::text as s from public.membership_invitations where tenant_id = $1",
                [named.tenant_id],
              )
            ).rows,
          ).toEqual([{ s: staffRole }]);
        }
      }));

    it("test 3 (Q2): the provisioned row kinds are the seed fixture's, less only the claimed name, the designated home and the second Site", () =>
      tx(async () => {
        const out = await provisioned(request());
        const mine = await kinds([out.tenant_id]);
        const seed = await kinds(SEED);
        expect(mine.filter((k) => !seed.includes(k))).toEqual([]);
        expect(seed.filter((k) => !mine.includes(k))).toEqual([
          "claimed_name",
          "home:designated",
          "site:second",
        ]);
      }));

    it("test 3: bad input is 22023 with its own message, and writes nothing", () =>
      tx(async () => {
        const cases: [Partial<Request>, string][] = [
          [{ key: null }, BAD_KEY],
          [{ key: "" }, BAD_KEY],
          [{ key: " leading" }, BAD_KEY],
          [{ key: "trailing\t" }, BAD_KEY],
          [{ key: "k".repeat(201) }, BAD_KEY],
          [{ name: null }, BAD_NAME],
          [{ name: "" }, BAD_NAME],
          [{ name: " Leading" }, BAD_NAME],
          [{ name: "Trailing\n" }, BAD_NAME],
          [{ name: "n".repeat(161) }, BAD_NAME],
          [{ slug: null }, BAD_SLUG],
          [{ slug: "" }, BAD_SLUG],
          [{ slug: "Upper" }, BAD_SLUG],
          [{ slug: "-lead" }, BAD_SLUG],
          [{ slug: "trail-" }, BAD_SLUG],
          [{ slug: "has space" }, BAD_SLUG],
          [{ slug: "under_score" }, BAD_SLUG],
          [{ slug: "s".repeat(64) }, BAD_SLUG],
          [{ reason: null }, BAD_REASON],
          [{ reason: "" }, BAD_REASON],
          [{ reason: " \t\n " }, BAD_REASON],
          [{ email: null }, BAD_EMAIL],
          [{ email: "" }, BAD_EMAIL],
          [{ email: "not-an-email" }, BAD_EMAIL],
          [{ email: "a b@example.org" }, BAD_EMAIL],
          [{ email: "two@@example.org" }, BAD_EMAIL],
          [{ email: "no-dot@example" }, BAD_EMAIL],
          [{ email: "a b@example.org" }, BAD_EMAIL],
          [{ email: "a\tb@example.org" }, BAD_EMAIL],
          [{ email: " \t\n" }, BAD_EMAIL],
          [{ staffRole: "bogus" }, BAD_STAFF_ROLE],
          [{ staffRole: "staff" }, BAD_STAFF_ROLE],
          [{ staffRole: "Finance" }, BAD_STAFF_ROLE],
          [{ staffRole: "finance\t" }, BAD_STAFF_ROLE],
          [{ staffRole: " finance" }, BAD_STAFF_ROLE],
          [{ staffRole: "\n" }, BAD_STAFF_ROLE],
        ];
        for (const [change, message] of cases)
          for (const fn of FUNCTIONS)
            await refused(OPERATOR, request(change), "22023", message, fn);
        const edge = await provisioned(
          request({ slug: "a", name: "n".repeat(160), key: "k".repeat(200) }),
        );
        expect(edge.created).toBe(true);
        const longest = await provisioned(request({ slug: "s".repeat(63) }));
        expect(longest.created).toBe(true);
      }));

    it("test 4: a re-run with the same key and request returns the organization without the link and writes nothing; another request on the key, or a taken slug, is 23505 and writes nothing", () =>
      tx(async () => {
        const r = request({ email: "Re-Run@Example.org" });
        const first = await provisioned(r);
        const before = await totals();
        const rowsBefore = await rowsOf([first.tenant_id]);
        expect(rowsBefore["platform.tenant_provisioning"]).toHaveLength(1);
        expect(rowsBefore["public.membership_invitations"]).toHaveLength(1);
        for (const same of [
          r,
          { ...r, reason: "Asked again later" },
          { ...r, email: "  re-run@example.ORG " },
          { ...r, staffRole: "development" },
          { ...r, staffRole: "  " },
        ]) {
          const again = await provision(OPERATOR, same);
          expect(again.message).toBe("");
          expect(again.rows[0]!.r).toEqual({
            tenant_id: first.tenant_id,
            created: false,
          });
          expect(await totals()).toEqual(before);
          expect(await rowsOf([first.tenant_id])).toEqual(rowsBefore);
        }
        for (const other of [
          { name: `${r.name} Two` },
          { slug: `${r.slug}-two` },
          { email: "someone-else@example.org" },
          { staffRole: "finance" },
        ])
          await refused(OPERATOR, { ...r, ...other }, "23505", KEY_REUSED);
        for (const [bad, message] of [
          [{ email: null }, BAD_EMAIL],
          [{ email: "bad" }, BAD_EMAIL],
          [{ email: "re-run@example.org x" }, BAD_EMAIL],
          [{ staffRole: "bogus" }, BAD_STAFF_ROLE],
          [{ staffRole: "development\t" }, BAD_STAFF_ROLE],
        ] as [Partial<Request>, string][])
          await refused(OPERATOR, { ...r, ...bad }, "22023", message);
        for (const slug of [r.slug, `acc2675-${id.TA}`])
          await refused(OPERATOR, request({ slug }), "23505", SLUG_TAKEN);
      }));

    it("test 5: the anonymous lookup returns nothing for a provisioned organization's slug, its .localhost name or any host of it", () =>
      tx(async () => {
        const r = request();
        const out = await provisioned(r);
        for (const host of [
          `${r.slug}.localhost`,
          `${r.slug}.localhost.`,
          `${r.slug}.localhost:3000`,
          r.slug!,
          `${r.slug}.example.org`,
        ])
          expect([host, await resolveAsAnon(db, host)]).toEqual([host, []]);
        expect(
          (
            await db.query(
              "select count(*)::int as n from public.site_domains where tenant_id = $1",
              [out.tenant_id],
            )
          ).rows[0].n,
        ).toBe(0);
      }));

    it("test 6: a home record never stands without its brand, after provisioning and after the backfill; a name that cannot name a Site is 22023 from the helper and the backfill, and writes nothing", () =>
      tx(async () => {
        const out = await provisioned(request());
        const both = (tenants: string[]) =>
          tenants.map((tenant) => ({ tenant, home: true, brand: true }));
        const afterProvisioning = [out.tenant_id, ...SEED].sort();
        expect(await homeIffBrand(afterProvisioning)).toEqual(
          both(afterProvisioning),
        );
        const homeOnly = await plant("acc2676 home without brand");
        await db.query(
          "insert into public.donor_portal_hosts (tenant_id) values ($1)",
          [homeOnly.tenant],
        );
        const bare = await plant("acc2676 bare");
        await runBackfill();
        const afterBackfill = [
          out.tenant_id,
          homeOnly.tenant,
          bare.tenant,
          id.TA!,
          id.TB!,
          ...SEED,
        ].sort();
        expect(await homeIffBrand(afterBackfill)).toEqual(both(afterBackfill));

        const padded = await plant(" Padded Mission");
        const long = await plant("L".repeat(161));
        for (const bad of [padded.tenant, long.tenant]) {
          const helper = await act(
            "postgres",
            {},
            "select private.ensure_tenant_home($1)",
            [bad],
          );
          expect([helper.code, helper.message]).toEqual([
            "22023",
            HELPER_BAD_NAME,
          ]);
          expect(await homeRows(bad)).toEqual({
            sites: null,
            homes: null,
            brands: null,
          });
        }
        const missing = await act(
          "postgres",
          {},
          "select private.ensure_tenant_home($1)",
          [randomUUID()],
        );
        expect([missing.code, missing.message]).toEqual([
          "P0002",
          HELPER_NOT_FOUND,
        ]);
        const unrelated = await plant("acc2676 untouched while refused");
        await db.query("savepoint backfill_refused");
        let refusal: { code?: string; message?: string; detail?: string } = {};
        try {
          await runBackfill();
        } catch (e) {
          refusal = e as typeof refusal;
        }
        await db.query("rollback to savepoint backfill_refused");
        expect([refusal.code, refusal.message]).toEqual([
          "22023",
          BACKFILL_REFUSAL(2),
        ]);
        const said = `${refusal.message} ${JSON.stringify(refusal)}`;
        for (const secret of [padded.tenant, long.tenant, "Padded", "LLLL"])
          expect(said).not.toContain(secret);
        for (const tenant of [padded.tenant, long.tenant, unrelated.tenant])
          expect(await homeRows(tenant)).toEqual({
            sites: null,
            homes: null,
            brands: null,
          });
      }));

    it("test 7: the backfill gives every organization, whatever its status, exactly one default Site, home record and brand, keeps what exists (a brand renamed by set_account_brand too), and creates nothing on a second run", () =>
      tx(async () => {
        const seedBefore = await snapshot(db, SEED);
        const siteOnly = await plant("acc2676 site only");
        await db.query(
          "insert into public.sites (tenant_id, name, is_default) values ($1, 'Kept Site Name', true)",
          [siteOnly.tenant],
        );
        const homeAndBrand = await plant("acc2676 home and brand");
        await db.query(
          "insert into public.donor_portal_hosts (tenant_id) values ($1)",
          [homeAndBrand.tenant],
        );
        await db.query(
          "insert into public.donor_account_brands (tenant_id, display_name) values ($1, 'Kept Brand Name')",
          [homeAndBrand.tenant],
        );
        const homeNoBrand = await plant("acc2676 home and no brand");
        await db.query(
          "insert into public.donor_portal_hosts (tenant_id) values ($1)",
          [homeNoBrand.tenant],
        );
        const suspended = await plant("acc2676 suspended", "suspended");
        const closed = await plant("acc2676 closed", "closed");
        const secondOnly = await plant("acc2676 second Site only");
        const secondSite = randomUUID();
        await db.query(
          "insert into public.sites (id, tenant_id, name, is_default, status) values ($1, $2, 'Inactive Second Site', false, 'inactive')",
          [secondSite, secondOnly.tenant],
        );
        const secondSiteBefore = (
          await db.query(
            "select to_jsonb(s) as v from public.sites s where s.id = $1",
            [secondSite],
          )
        ).rows;
        const host = `www.${id.TA}.example.org`;
        const siteA = randomUUID();
        await db.query(
          "insert into public.sites (id, tenant_id, name, is_default) values ($1, $2, 'TA Website', true)",
          [siteA, id.TA],
        );
        await db.query(claimSql({ host, tenant: id.TA!, site: siteA }));
        await db.query(
          "update public.sites set primary_domain = $1 where id = $2",
          [host, siteA],
        );
        await db.query(
          "insert into public.donor_portal_hosts (tenant_id, primary_domain) values ($1, $2)",
          [id.TA, host],
        );
        await db.query(
          "insert into public.donor_account_brands (tenant_id, display_name) values ($1, 'acc2675 A')",
          [id.TA],
        );
        const renamed = await act(
          "authenticated",
          {
            sub: "UADM",
            headers: {
              "x-asym-tenant": id.TA!,
              "x-asym-assignment": id.mAdm!,
            },
          },
          "select public.set_account_brand($1, 'Renamed By Command') as r",
          [id.TA],
        );
        expect(renamed.message).toBe("");
        const planted = {
          siteOnly: await homeRows(siteOnly.tenant),
          homeAndBrand: await homeRows(homeAndBrand.tenant),
          homeNoBrand: await homeRows(homeNoBrand.tenant),
          full: await homeRows(id.TA!),
        };

        await runBackfill();

        const name = async (tenant: string) =>
          (
            await db.query("select name from public.tenants where id = $1", [
              tenant,
            ])
          ).rows[0].name as string;
        const after = async (tenant: string) => {
          const rows = await homeRows(tenant);
          expect([tenant, rows.sites?.length, rows.homes?.length]).toEqual([
            tenant,
            1,
            1,
          ]);
          expect([tenant, rows.brands?.length]).toEqual([tenant, 1]);
          return rows;
        };
        const siteOnlyAfter = await after(siteOnly.tenant);
        expect(siteOnlyAfter.sites).toEqual(planted.siteOnly.sites);
        expect(siteOnlyAfter.brands).toEqual([await name(siteOnly.tenant)]);
        const homeAndBrandAfter = await after(homeAndBrand.tenant);
        expect(homeAndBrandAfter.homes).toEqual(planted.homeAndBrand.homes);
        expect(homeAndBrandAfter.brands).toEqual(["Kept Brand Name"]);
        expect(homeAndBrandAfter.sites![0]).toMatchObject({
          name: await name(homeAndBrand.tenant),
          status: "active",
          primary_domain: null,
        });
        const homeNoBrandAfter = await after(homeNoBrand.tenant);
        expect(homeNoBrandAfter.homes).toEqual(planted.homeNoBrand.homes);
        expect(homeNoBrandAfter.brands).toEqual([
          await name(homeNoBrand.tenant),
        ]);
        for (const tenant of [suspended.tenant, closed.tenant]) {
          const rows = await after(tenant);
          expect(rows.sites![0]).toMatchObject({
            name: await name(tenant),
            status: "active",
            primary_domain: null,
          });
          expect(rows.homes![0]).toMatchObject({ primary_domain: null });
          expect(rows.brands).toEqual([await name(tenant)]);
        }
        const secondOnlyAfter = await after(secondOnly.tenant);
        expect(secondOnlyAfter.sites![0]).toMatchObject({
          name: await name(secondOnly.tenant),
          status: "active",
          primary_domain: null,
        });
        expect(secondOnlyAfter.sites![0]!.id).not.toBe(secondSite);
        expect(secondOnlyAfter.brands).toEqual([await name(secondOnly.tenant)]);
        expect(
          (
            await db.query(
              "select to_jsonb(s) as v from public.sites s where s.tenant_id = $1 and not s.is_default",
              [secondOnly.tenant],
            )
          ).rows,
        ).toEqual(secondSiteBefore);
        expect(await homeRows(id.TA!)).toEqual(planted.full);
        expect(planted.full.brands).toEqual(["Renamed By Command"]);
        expect(planted.full.sites![0]).toMatchObject({
          name: "TA Website",
          primary_domain: host,
        });
        expect(await snapshot(db, SEED)).toEqual(seedBefore);
        const domains = (
          await db.query(
            "select count(*)::int as n from public.site_domains where tenant_id = any($1::uuid[])",
            [
              [
                siteOnly.tenant,
                homeAndBrand.tenant,
                homeNoBrand.tenant,
                suspended.tenant,
                closed.tenant,
                secondOnly.tenant,
              ],
            ],
          )
        ).rows[0].n;
        expect(domains).toBe(0);

        const everything = await snapshot(db, [
          siteOnly.tenant,
          homeAndBrand.tenant,
          homeNoBrand.tenant,
          suspended.tenant,
          closed.tenant,
          secondOnly.tenant,
          id.TA!,
          id.TB!,
          ...SEED,
        ]);
        const counts = await totals();
        await runBackfill();
        expect(await totals()).toEqual(counts);
        expect(
          await snapshot(db, [
            siteOnly.tenant,
            homeAndBrand.tenant,
            homeNoBrand.tenant,
            suspended.tenant,
            closed.tenant,
            secondOnly.tenant,
            id.TA!,
            id.TB!,
            ...SEED,
          ]),
        ).toEqual(everything);
        const rerun = await act(
          "postgres",
          {},
          "select private.ensure_tenant_home($1) as r",
          [suspended.tenant],
        );
        expect(rerun.rows[0]!.r).toEqual({
          site_id: (await homeRows(suspended.tenant)).sites![0]!.id,
          home_id: (await homeRows(suspended.tenant)).homes![0]!.id,
          site_created: false,
          home_created: false,
          brand_created: false,
        });
      }));

    it("test 7: Migration B holds, inside BEGIN and COMMIT, its lock timeout, the table lock, a counts-only 22023 preflight and then the helper over every organization", () => {
      const file = migration("wp3a2_existing_tenant_homes");
      const text = read(file);
      const body = migrationBody(file);
      const timeout = body.indexOf("SET LOCAL lock_timeout = '5s';");
      const lock = body.indexOf(
        "LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;",
      );
      const preflight = body.search(
        /DO \$\$[\s\S]*?ERRCODE = '22023'[\s\S]*?\$\$;/,
      );
      const perform = body.indexOf(
        "PERFORM private.ensure_tenant_home(t.id) FROM public.tenants AS t ORDER BY t.id;",
      );
      expect([timeout, lock, preflight, perform].every((i) => i >= 0)).toBe(
        true,
      );
      expect(timeout).toBeLessThan(lock);
      expect(lock).toBeLessThan(preflight);
      expect(preflight).toBeLessThan(perform);
      expect(text.indexOf("BEGIN;")).toBeLessThan(text.indexOf(body));
      expect(body).not.toMatch(/string_agg|array_agg/i);
      expect(body).not.toMatch(/\b(UPDATE|DELETE)\b/);
      expect(body).not.toMatch(/site_domains|legal_entities|funds/);
    });

    it("test 8: the helper for one organization and provisioning leave every other organization unchanged", () =>
      tx(async () => {
        const seedBefore = await rowsOf(SEED);
        const taBefore = await rowsOf([id.TA!]);
        const helper = await act(
          "postgres",
          {},
          "select private.ensure_tenant_home($1) as r",
          [id.TA],
        );
        expect(helper.message).toBe("");
        const created = helper.rows[0]!.r as Record<string, unknown>;
        expect(created).toMatchObject({
          site_created: true,
          home_created: true,
          brand_created: true,
        });
        expect(await homeRows(id.TA!)).toEqual({
          sites: [
            {
              id: created.site_id,
              name: "acc2675 A",
              status: "active",
              primary_domain: null,
            },
          ],
          homes: [{ id: created.home_id, primary_domain: null }],
          brands: ["acc2675 A"],
        });
        await expectTbUnchanged();
        expect(await rowsOf(SEED)).toEqual(seedBefore);
        const taAfterHelper = await rowsOf([id.TA!]);
        expect(taAfterHelper["public.tenants"]).toEqual(
          taBefore["public.tenants"],
        );
        await provisioned(request());
        expect(await rowsOf([id.TA!])).toEqual(taAfterHelper);
        await expectTbUnchanged();
        expect(await rowsOf(SEED)).toEqual(seedBefore);
      }));

    it("test 10: provisioning and the backfill leave the seed's organizations, Sites, names and homes unchanged", () =>
      tx(async () => {
        const before = await rowsOf(SEED);
        await provisioned(request());
        await runBackfill();
        expect(await rowsOf(SEED)).toEqual(before);
      }));

    it("test 4 (two connections): a call with another key and the same slug waits for the first and gets the slug refusal; two calls with one key and one request end as one organization, created once", async () => {
      const a = new pg.Client({ connectionString: ADMIN_URL });
      const b = new pg.Client({ connectionString: ADMIN_URL });
      const operator = randomUUID();
      const keys: string[] = [];
      const pending: Promise<unknown>[] = [];
      let failure: unknown = null;
      const cleanupErrors: unknown[] = [];
      const connected = new Set<pg.Client>();

      const pidOf = async (c: pg.Client) =>
        (await c.query("select pg_backend_pid() as p")).rows[0].p as number;
      const begin = async (c: pg.Client) => {
        await c.query("begin");
        await c.query("set local role authenticated");
        await c.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '', true)`,
          [
            JSON.stringify({
              role: "authenticated",
              sub: operator,
              aal: "aal2",
            }),
          ],
        );
      };
      const call = (c: pg.Client, r: Request) =>
        c.query("select public.provision_tenant($1, $2, $3, $4, $5, $6) as r", [
          r.key,
          r.name,
          r.slug,
          r.email,
          r.staffRole,
          r.reason,
        ]);
      type Settled = {
        error: { code?: string; message?: string } | null;
        rows: Record<string, unknown>[];
      };
      const start = (c: pg.Client, r: Request) => {
        keys.push(r.key!);
        const state: { done: Settled | null } = { done: null };
        const settled = call(c, r).then(
          (res): Settled =>
            (state.done = {
              error: null,
              rows: res.rows as Record<string, unknown>[],
            }),
          (e: { code?: string; message?: string }): Settled =>
            (state.done = { error: e, rows: [] }),
        );
        pending.push(settled);
        return { settled, state };
      };
      const waitsOn = async (
        waiter: number,
        holder: number,
        state: { done: Settled | null },
      ) => {
        const deadline = Date.now() + 15_000;
        while (Date.now() < deadline) {
          if (state.done)
            return `settled without waiting: ${
              state.done.error
                ? `${state.done.error.code} ${state.done.error.message}`
                : JSON.stringify(state.done.rows)
            }`;
          const { rows } = await db.query(
            "select $2::int = any(pg_blocking_pids($1)) as waiting",
            [waiter, holder],
          );
          if (rows[0].waiting) return "waiting";
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return "timed out";
      };
      const counts = async (slug: string) =>
        (
          await db.query(
            `select (select count(*)::int from public.tenants t where t.slug = $1) as organizations,
                    (select count(*)::int from platform.tenant_provisioning p join public.tenants t on t.id = p.tenant_id where t.slug = $1) as steps,
                    (select count(*)::int from public.membership_invitations i join public.tenants t on t.id = i.tenant_id where t.slug = $1) as invitations`,
            [slug],
          )
        ).rows[0];

      try {
        await a.connect();
        connected.add(a);
        await b.connect();
        connected.add(b);
        await db.query("insert into auth.users (id) values ($1)", [operator]);
        await db.query("delete from authz.memberships where user_id = $1", [
          operator,
        ]);
        await db.query(
          "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acc2676 provisioning', 'WP3a part 2a two-connection operator')",
          [operator],
        );
        const pidA = await pidOf(a);
        const pidB = await pidOf(b);

        const first = request();
        const sameSlug = request({ slug: first.slug });
        keys.push(first.key!);
        await begin(a);
        expect((await call(a, first)).rows[0].r.created).toBe(true);
        await begin(b);
        const raced = start(b, sameSlug);
        expect(await waitsOn(pidB, pidA, raced.state)).toBe("waiting");
        await a.query("commit");
        const refusal = (await raced.settled).error;
        await b.query("rollback");
        expect([refusal?.code, refusal?.message]).toEqual([
          "23505",
          SLUG_TAKEN,
        ]);
        expect(await counts(first.slug!)).toEqual({
          organizations: 1,
          steps: 1,
          invitations: 1,
        });
        expect(
          (
            await db.query(
              "select count(*)::int as n from platform.tenant_provisioning where provisioning_key = $1",
              [sameSlug.key],
            )
          ).rows[0].n,
        ).toBe(0);

        const once = request();
        keys.push(once.key!);
        await begin(a);
        const created = (await call(a, once)).rows[0].r as {
          tenant_id: string;
          created: boolean;
        };
        expect(created.created).toBe(true);
        await begin(b);
        const repeated = start(b, once);
        expect(await waitsOn(pidB, pidA, repeated.state)).toBe("waiting");
        await a.query("commit");
        const settled = await repeated.settled;
        expect(settled.error).toBeNull();
        const again = settled.rows[0]!.r;
        await b.query("commit");
        expect(again).toEqual({ tenant_id: created.tenant_id, created: false });
        expect(await counts(once.slug!)).toEqual({
          organizations: 1,
          steps: 1,
          invitations: 1,
        });
      } catch (e) {
        failure = e;
      }

      for (const c of [a, b]) {
        if (connected.has(c))
          try {
            await c.query("rollback");
          } catch (e) {
            cleanupErrors.push(e);
          }
        await Promise.allSettled(pending);
      }
      try {
        const tenants = (
          await db.query(
            "select tenant_id from platform.tenant_provisioning where provisioning_key = any($1::text[])",
            [keys],
          )
        ).rows.map((row) => row.tenant_id as string);
        for (const table of [
          "platform.tenant_provisioning",
          "public.membership_invitations",
          "public.donor_account_brands",
          "public.donor_portal_hosts",
          "public.sites",
          "public.contribution_approval_policies",
          "public.funds",
          "public.legal_entities",
          "public.audit_logs",
        ])
          await db.query(
            `delete from ${table} where tenant_id = any($1::uuid[])`,
            [tenants],
          );
        await db.query(
          "delete from public.tenants where id = any($1::uuid[])",
          [tenants],
        );
      } catch (e) {
        cleanupErrors.push(e);
      }
      try {
        await db.query(
          "delete from authz.platform_operators where user_id = $1",
          [operator],
        );
        await db.query("delete from authz.memberships where user_id = $1", [
          operator,
        ]);
        await db.query("delete from public.profiles where user_id = $1", [
          operator,
        ]);
        await db.query("delete from auth.users where id = $1", [operator]);
      } catch (e) {
        cleanupErrors.push(e);
      }
      for (const c of connected)
        try {
          await c.end();
        } catch (e) {
          cleanupErrors.push(e);
        }

      if (failure && cleanupErrors.length > 0)
        throw new AggregateError(
          [failure, ...cleanupErrors],
          "the two-connection case failed, and so did its cleanup",
        );
      if (failure) throw failure;
      if (cleanupErrors.length > 0)
        throw new AggregateError(
          cleanupErrors,
          "the two-connection case's cleanup failed",
        );
    });
  },
);
