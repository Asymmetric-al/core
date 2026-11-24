import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ALL_SURFACES,
  HOME_SURFACES,
  caller,
  claimSql,
  resolveAsAnon,
  snapshot,
} from "./site-fixture";
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

describe.skipIf(!ADMIN_URL)("Site commands", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = fixtureIds();
  for (const key of [
    "UBADM",
    "mBAdm",
    "siteA",
    "siteB",
    "siteB2",
    "homeA",
    "homeB",
    "UDUAL",
    "mDualA",
    "mDualB",
  ])
    id[key] = randomUUID();
  id.USEED = "33333333-3333-3333-3333-333333333333";
  const host = {
    readyA: `ready.${id.TA}.example.org`,
    homeOnlyA: `home.${id.TA}.example.org`,
    claimedA: `claimed.${id.TA}.example.org`,
    lackingA: `lacking.${id.TA}.example.org`,
    hostB: `site.${id.TB}.example.org`,
  };
  const run = caller(db, id);
  const ADM: Caller = {
    sub: "UADM",
    headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mAdm! },
  };
  const DEV: Caller = {
    sub: "UDEV",
    headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mDev! },
  };
  const BADM: Caller = {
    sub: "UBADM",
    headers: { "x-asym-tenant": id.TB!, "x-asym-assignment": id.mBAdm! },
  };
  const db2 = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(async () => {
    await db.connect();
    await db2.connect();
  });
  afterAll(async () => {
    await db.end();
    await db2.end();
  });

  async function fixture(test: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      await db.query("insert into auth.users(id) values ($1)", [id.UBADM]);
      await db.query("delete from authz.memberships where user_id=$1", [
        id.UBADM,
      ]);
      await db.query(
        "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin,is_active) values ($1,$2,$3,'staff','development',true,true)",
        [id.mBAdm, id.UBADM, id.TB],
      );
      await db.query(
        "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default A',true),($3,$4,'Default B',true),($5,$4,'Second B',false)",
        [id.siteA, id.TA, id.siteB, id.TB, id.siteB2],
      );
      await db.query(
        "insert into public.donor_portal_hosts(id,tenant_id) values ($1,$2),($3,$4)",
        [id.homeA, id.TA, id.homeB, id.TB],
      );
      await db.query(
        "insert into public.donor_account_brands(tenant_id,display_name) values ($1,'Brand A'),($2,'Brand B')",
        [id.TA, id.TB],
      );
      for (const claim of [
        claimSql({
          host: host.readyA,
          tenant: id.TA!,
          site: id.siteA,
          proofs: 5,
        }),
        claimSql({ host: host.homeOnlyA, tenant: id.TA!, proofs: 5 }),
        claimSql({ host: host.claimedA, tenant: id.TA!, proofs: 4 }),
        claimSql({
          host: host.lackingA,
          tenant: id.TA!,
          site: id.siteA,
          surfaces: ["website", "donor_account"],
        }),
        claimSql({ host: host.hostB, tenant: id.TB!, site: id.siteB }),
      ])
        await db.query(claim);
      await db.query("update public.sites set primary_domain=$1 where id=$2", [
        host.readyA,
        id.siteA,
      ]);
      await db.query(
        "update public.donor_portal_hosts set primary_domain=$1 where id=$2",
        [host.hostB, id.homeB],
      );
      await db.query("set constraints all immediate");
      await test();
    } finally {
      await db.query("rollback");
    }
  }

  const both = () => snapshot(db, [id.TA!, id.TB!]);
  const onlyB = () => snapshot(db, [id.TB!]);

  async function refused(who: Caller, sql: string, code: string) {
    const before = await both();
    const result = await run("authenticated", who, sql);
    expect(result.code, `${sql}: ${result.message}`).toBe(code);
    expect(await both(), sql).toEqual(before);
  }

  async function changesOnlyA(who: Caller, sql: string) {
    const before = await onlyB();
    const result = await run("authenticated", who, sql, true);
    expect(result.code, `${sql}: ${result.message}`).toBeNull();
    await db.query("set constraints all immediate");
    expect(await onlyB(), sql).toEqual(before);
    return result.rows[0]?.result as Record<string, unknown>;
  }

  async function forEachInactiveStatus(check: () => Promise<void>) {
    for (const status of ["suspended", "closed"]) {
      await db.query("update public.tenants set status=$1 where id=$2", [
        status,
        id.TA,
      ]);
      await check();
    }
    await db.query("update public.tenants set status='active' where id=$1", [
      id.TA,
    ]);
  }

  it("creates a second Site by command: non-default, active, without a domain, writing no claimed name", () =>
    fixture(async () => {
      const create = `select public.create_site('${id.TA}','Another Site') as result`;
      await refused(DEV, create, "42501");
      await refused(
        ADM,
        `select public.create_site('${id.TB}','Another Site') as result`,
        "42501",
      );
      await forEachInactiveStatus(() => refused(ADM, create, "42501"));
      const names = async () =>
        (
          await db.query(
            "select count(*)::int as n from public.site_domains where tenant_id=$1",
            [id.TA],
          )
        ).rows[0]!.n;
      const before = await names();
      const site = await changesOnlyA(ADM, create);
      expect(site).toMatchObject({
        tenant_id: id.TA,
        name: "Another Site",
        is_default: false,
        status: "active",
        primary_domain: null,
      });
      expect(await names()).toBe(before);
      expect(
        (
          await db.query(
            "select count(*)::int as n from public.sites where tenant_id=$1",
            [id.TA],
          )
        ).rows[0]!.n,
      ).toBe(2);
    }));

  it("designates home once, to a ready name of this tenant with the three signed-in surfaces", () =>
    fixture(async () => {
      const designate = (tenant: string, value: string | null) =>
        `select public.designate_home('${tenant}',${value === null ? "null" : `'${value}'`}) as result`;
      await refused(BADM, designate(id.TB!, host.hostB), "55000");
      await refused(ADM, designate(id.TA!, null), "22004");
      await refused(ADM, designate(id.TA!, host.hostB), "P0002");
      await refused(
        ADM,
        designate(id.TA!, `missing.${id.TA}.example.org`),
        "P0002",
      );
      await refused(ADM, designate(id.TA!, host.claimedA), "23514");
      await refused(ADM, designate(id.TA!, host.lackingA), "23514");
      await refused(DEV, designate(id.TA!, host.readyA), "42501");
      await refused(ADM, designate(id.TB!, host.hostB), "42501");
      await forEachInactiveStatus(() =>
        refused(ADM, designate(id.TA!, host.readyA), "42501"),
      );
      await db.query("savepoint no_home");
      await db.query(
        "delete from public.donor_account_brands where tenant_id=$1",
        [id.TA],
      );
      await db.query(
        "delete from public.donor_portal_hosts where tenant_id=$1",
        [id.TA],
      );
      await refused(ADM, designate(id.TA!, host.readyA), "P0002");
      await db.query("rollback to savepoint no_home");

      await db.query("savepoint home_only");
      const homeOnly = await changesOnlyA(
        ADM,
        designate(id.TA!, host.homeOnlyA),
      );
      expect(homeOnly).toMatchObject({
        id: id.homeA,
        tenant_id: id.TA,
        primary_domain: host.homeOnlyA,
      });
      expect(await resolveAsAnon(db, host.homeOnlyA)).toMatchObject([
        {
          tenant_id: id.TA,
          site_id: null,
          surfaces: HOME_SURFACES,
          is_home: true,
        },
      ]);
      expect(await resolveAsAnon(db, host.readyA)).toMatchObject([
        { is_home: false },
      ]);
      await db.query("rollback to savepoint home_only");

      expect(await resolveAsAnon(db, host.readyA)).toMatchObject([
        { is_home: false },
      ]);
      const home = await changesOnlyA(ADM, designate(id.TA!, host.readyA));
      expect(home).toMatchObject({
        id: id.homeA,
        tenant_id: id.TA,
        primary_domain: host.readyA,
      });
      expect(await resolveAsAnon(db, host.readyA)).toMatchObject([
        {
          tenant_id: id.TA,
          site_id: id.siteA,
          surfaces: ALL_SURFACES,
          is_home: true,
        },
      ]);
      expect(await resolveAsAnon(db, host.homeOnlyA)).toMatchObject([
        { is_home: false },
      ]);
      expect(await resolveAsAnon(db, host.hostB)).toMatchObject([
        { tenant_id: id.TB, is_home: true },
      ]);
      await refused(ADM, designate(id.TA!, host.homeOnlyA), "55000");
      await refused(ADM, designate(id.TA!, host.readyA), "55000");
    }));

  it("changes a Site's status, never the default Site's, and only in the entered tenant", () =>
    fixture(async () => {
      const second = randomUUID();
      await db.query(
        "insert into public.sites(id,tenant_id,name) values ($1,$2,'Second A')",
        [second, id.TA],
      );
      const status = (tenant: string, site: string, value: string) =>
        `select public.set_site_status('${tenant}','${site}','${value}') as result`;
      await refused(ADM, status(id.TA!, id.siteA!, "inactive"), "23514");
      await refused(ADM, status(id.TA!, second, "paused"), "23514");
      await refused(ADM, status(id.TA!, id.siteB2!, "inactive"), "P0002");
      await refused(ADM, status(id.TB!, id.siteB2!, "inactive"), "42501");
      await refused(DEV, status(id.TA!, second, "inactive"), "42501");
      await forEachInactiveStatus(() =>
        refused(ADM, status(id.TA!, second, "inactive"), "42501"),
      );
      for (const value of ["inactive", "active"])
        expect(
          await changesOnlyA(ADM, status(id.TA!, second, value)),
        ).toMatchObject({
          id: second,
          status: value,
        });
    }));

  it("sets and replaces the account brand only in the entered tenant", () =>
    fixture(async () => {
      const brand = (tenant: string, value: string) =>
        `select public.set_account_brand('${tenant}','${value}') as result`;
      await refused(ADM, brand(id.TB!, "Taken"), "42501");
      await refused(DEV, brand(id.TA!, "New name"), "42501");
      await forEachInactiveStatus(() =>
        refused(ADM, brand(id.TA!, "New name"), "42501"),
      );
      await refused(ADM, brand(id.TA!, " padded "), "23514");
      expect(await changesOnlyA(ADM, brand(id.TA!, "New name"))).toEqual({
        tenant_id: id.TA,
        display_name: "New name",
      });
      expect(await changesOnlyA(ADM, brand(id.TA!, "Newer name"))).toEqual({
        tenant_id: id.TA,
        display_name: "Newer name",
      });
      await db.query(
        "delete from public.donor_account_brands where tenant_id=$1",
        [id.TA],
      );
      expect(await changesOnlyA(ADM, brand(id.TA!, "First name"))).toEqual({
        tenant_id: id.TA,
        display_name: "First name",
      });
    }));

  const SITE_ACTIONS = [
    "site_created",
    "site_status_changed",
    "account_brand_set",
    "home_designated",
  ];
  const audits = async () =>
    (
      await db.query(
        "select action, user_id, resource_type, resource_id, details from public.audit_logs where tenant_id=$1 and action=any($2::text[]) order by created_at, action",
        [id.TA, SITE_ACTIONS],
      )
    ).rows;

  it("writes one audit row for each successful command and none for a refusal, unreadable from another organization", () =>
    fixture(async () => {
      const second = randomUUID();
      await db.query(
        "insert into public.sites(id,tenant_id,name) values ($1,$2,'Second A')",
        [second, id.TA],
      );
      await refused(DEV, `select public.create_site('${id.TA}','X')`, "42501");
      await refused(
        ADM,
        `select public.set_site_status('${id.TA}','${id.siteA}','inactive')`,
        "23514",
      );
      await refused(
        ADM,
        `select public.designate_home('${id.TA}','${host.claimedA}')`,
        "23514",
      );
      await refused(
        ADM,
        `select public.set_account_brand('${id.TA}','\t')`,
        "23514",
      );
      expect(await audits()).toEqual([]);
      const site = await changesOnlyA(
        ADM,
        `select public.create_site('${id.TA}','Audited') as result`,
      );
      await changesOnlyA(
        ADM,
        `select public.set_site_status('${id.TA}','${second}','inactive') as result`,
      );
      await changesOnlyA(
        ADM,
        `select public.set_account_brand('${id.TA}','Renamed') as result`,
      );
      await changesOnlyA(
        ADM,
        `select public.designate_home('${id.TA}','${host.readyA}') as result`,
      );
      const rows = await audits();
      expect(rows).toHaveLength(4);
      const byAction = Object.fromEntries(rows.map((row) => [row.action, row]));
      for (const row of rows) {
        expect(row.user_id).toBe(id.UADM);
        expect(row.details.assignment_id).toBe(id.mAdm);
      }
      expect(byAction.site_created).toMatchObject({
        resource_type: "site",
        resource_id: site.id,
        details: {
          to: { name: "Audited", status: "active", is_default: false },
        },
      });
      expect(byAction.site_status_changed).toMatchObject({
        resource_type: "site",
        resource_id: second,
        details: { from: { status: "active" }, to: { status: "inactive" } },
      });
      expect(byAction.account_brand_set).toMatchObject({
        resource_type: "donor_account_brand",
        resource_id: id.TA,
        details: {
          from: { display_name: "Brand A" },
          to: { display_name: "Renamed" },
        },
      });
      expect(byAction.home_designated).toMatchObject({
        resource_type: "donor_portal_host",
        resource_id: id.homeA,
        details: {
          from: { primary_domain: null },
          to: { primary_domain: host.readyA },
        },
      });
      const fromB = await run(
        "authenticated",
        {
          sub: "UB",
          headers: { "x-asym-tenant": id.TB!, "x-asym-assignment": id.mB! },
        },
        `select id from public.audit_logs where tenant_id='${id.TA}'`,
      );
      expect(fromB.code, fromB.message).toBeNull();
      expect(fromB.rows).toEqual([]);
    }));

  it("refuses an administrator whose assignment was demoted or revoked before the command", () =>
    fixture(async () => {
      const second = randomUUID();
      await db.query(
        "insert into public.sites(id,tenant_id,name) values ($1,$2,'Second A')",
        [second, id.TA],
      );
      const commands = [
        `select public.create_site('${id.TA}','X')`,
        `select public.set_site_status('${id.TA}','${second}','inactive')`,
        `select public.set_account_brand('${id.TA}','X')`,
        `select public.designate_home('${id.TA}','${host.readyA}')`,
      ];
      for (const change of [
        "update authz.memberships set is_tenant_admin=false where id=$1",
        "update authz.memberships set is_active=false, revoked_at=now() where id=$1",
      ]) {
        await db.query("savepoint lost_authority");
        await db.query(change, [id.mAdm]);
        for (const command of commands) await refused(ADM, command, "42501");
        await db.query("rollback to savepoint lost_authority");
      }
      expect(await audits()).toEqual([]);
    }));

  it("acts only in the organization the request names, for a person who administers two", () =>
    fixture(async () => {
      await db.query("insert into auth.users(id) values ($1)", [id.UDUAL]);
      await db.query("delete from authz.memberships where user_id=$1", [
        id.UDUAL,
      ]);
      await db.query(
        "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin,is_active) values ($1,$2,$3,'staff','development',true,true),($4,$2,$5,'staff','development',true,true)",
        [id.mDualA, id.UDUAL, id.TA, id.mDualB, id.TB],
      );
      const fromA: Caller = {
        sub: "UDUAL",
        headers: { "x-asym-tenant": id.TA! },
      };
      for (const command of [
        `select public.create_site('${id.TB}','X')`,
        `select public.set_site_status('${id.TB}','${id.siteB2}','inactive')`,
        `select public.set_account_brand('${id.TB}','X')`,
        `select public.designate_home('${id.TB}','${host.hostB}')`,
      ])
        await refused(fromA, command, "42501");
      await refused(
        { sub: "UDUAL", headers: {} },
        `select public.create_site('${id.TA}','X')`,
        "42501",
      );
      await refused(
        {
          sub: "UDUAL",
          headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mDualA! },
        },
        `select public.create_site('${id.TB}','X')`,
        "42501",
      );
      const inB = await run(
        "authenticated",
        { sub: "UDUAL", headers: { "x-asym-tenant": id.TB! } },
        `select public.set_account_brand('${id.TB}','Named in B') as result`,
      );
      expect(inB.code, inB.message).toBeNull();
      expect(inB.rows[0]?.result).toEqual({
        tenant_id: id.TB,
        display_name: "Named in B",
      });
    }));

  it("holds the organization, the caller's assignment and its targets until the command's transaction ends", async () => {
    const tenant = "00000000-0000-0000-0000-000000000002";
    const assignment = (
      await db.query(
        "select id from authz.memberships where user_id=$1 and tenant_id=$2 and role='staff' and is_active",
        [id.USEED, tenant],
      )
    ).rows[0]?.id as string;
    expect(assignment).toBeTruthy();
    const seeded = (
      await db.query(
        "select s.id as site, h.id as home, h.primary_domain as host from public.sites s join public.donor_portal_hosts h on h.tenant_id=s.tenant_id where s.tenant_id=$1 and not s.is_default",
        [tenant],
      )
    ).rows[0] as { site: string; home: string; host: string };
    const who: Caller = {
      sub: "USEED",
      headers: { "x-asym-tenant": tenant, "x-asym-assignment": assignment },
    };
    const blocked = async (sql: string, params: unknown[]) => {
      try {
        await db2.query(sql, params);
        return null;
      } catch (e) {
        return (e as { code?: string }).code ?? "?";
      }
    };
    const held = async () => ({
      tenant: await blocked(
        "select 1 from public.tenants where id=$1 for no key update nowait",
        [tenant],
      ),
      assignment: await blocked(
        "select 1 from authz.memberships where id=$1 for no key update nowait",
        [assignment],
      ),
    });
    for (const [label, prepare, sql, targets] of [
      [
        "create_site",
        null,
        `select public.create_site('${tenant}','Held') as result`,
        [],
      ],
      [
        "set_site_status",
        null,
        `select public.set_site_status('${tenant}','${seeded.site}','inactive') as result`,
        [
          [
            "select 1 from public.sites where id=$1 for key share nowait",
            seeded.site,
          ],
        ],
      ],
      [
        "set_account_brand",
        null,
        `select public.set_account_brand('${tenant}','Held') as result`,
        [
          [
            "select 1 from public.donor_portal_hosts where id=$1 for no key update nowait",
            seeded.home,
          ],
        ],
      ],
      [
        "designate_home",
        "update public.donor_portal_hosts set primary_domain=null where tenant_id='" +
          tenant +
          "'",
        `select public.designate_home('${tenant}','${seeded.host}') as result`,
        [
          [
            "select 1 from public.site_domains where host=$1 for no key update nowait",
            seeded.host,
          ],
        ],
      ],
    ] as [string, string | null, string, [string, string][]][]) {
      await db.query("begin");
      try {
        if (prepare) await db.query(prepare);
        const result = await run("authenticated", who, sql, true);
        expect(result.code, `${label}: ${result.message}`).toBeNull();
        expect(await held(), label).toEqual({
          tenant: "55P03",
          assignment: "55P03",
        });
        for (const [lock, value] of targets)
          expect(await blocked(lock, [value]), `${label}: ${lock}`).toBe(
            "55P03",
          );
      } finally {
        await db.query("rollback");
      }
      expect(await held(), `${label} after rollback`).toEqual({
        tenant: null,
        assignment: null,
      });
    }
  });

  it("records the first writer's display name as the audit before-value when two first-time set_account_brand calls race", async () => {
    const tenant = randomUUID();
    const user = randomUUID();
    const assignment = randomUUID();
    const home = randomUUID();
    const observer = new pg.Client({ connectionString: ADMIN_URL });
    await observer.connect();

    const claims = JSON.stringify({ sub: user, role: "authenticated" });
    const headers = JSON.stringify({
      "x-asym-tenant": tenant,
      "x-asym-assignment": assignment,
    });

    let testError: unknown;
    try {
      await db.query("begin");
      await db.query(
        "insert into public.tenants(id,name,slug,status) values ($1,'Brand Race Org',$2,'active')",
        [tenant, `brand-race-${tenant.slice(0, 8)}`],
      );
      await db.query("insert into auth.users(id) values ($1)", [user]);
      await db.query("delete from authz.memberships where user_id=$1", [user]);
      await db.query(
        "insert into authz.memberships(id,user_id,tenant_id,role,staff_role,is_tenant_admin,is_active) values ($1,$2,$3,'staff','development',true,true)",
        [assignment, user, tenant],
      );
      await db.query(
        "insert into public.donor_portal_hosts(id,tenant_id,primary_domain) values ($1,$2,null)",
        [home, tenant],
      );
      await db.query("commit");

      const pid2 = (await db2.query("select pg_backend_pid() as pid")).rows[0]!
        .pid as number;

      await db.query("begin");
      await db.query("set local role authenticated");
      await db.query(
        "select set_config('request.jwt.claims',$1,true), set_config('request.jwt.claim.sub','',true), set_config('request.headers',$2,true)",
        [claims, headers],
      );
      const first = await db.query(
        "select public.set_account_brand($1,'Alpha') as result",
        [tenant],
      );
      expect(first.rows[0]!.result).toEqual({
        tenant_id: tenant,
        display_name: "Alpha",
      });

      await db2.query("begin");
      await db2.query("set local role authenticated");
      await db2.query(
        "select set_config('request.jwt.claims',$1,true), set_config('request.jwt.claim.sub','',true), set_config('request.headers',$2,true)",
        [claims, headers],
      );
      const secondPromise = db2.query(
        "select public.set_account_brand($1,'Beta') as result",
        [tenant],
      );

      let waiting = false;
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline) {
        const state = await observer.query(
          "select wait_event_type from pg_stat_activity where pid=$1",
          [pid2],
        );
        if (state.rows[0]?.wait_event_type === "Lock") {
          waiting = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      expect(waiting).toBe(true);

      await db.query("commit");
      const second = await secondPromise;
      await db2.query("commit");

      expect(second.rows[0]!.result).toEqual({
        tenant_id: tenant,
        display_name: "Beta",
      });

      const stored = await db.query(
        "select display_name from public.donor_account_brands where tenant_id=$1",
        [tenant],
      );
      expect(stored.rows).toEqual([{ display_name: "Beta" }]);

      const auditRows = await db.query(
        `select details
           from public.audit_logs
          where tenant_id=$1 and action='account_brand_set'
          order by created_at, id`,
        [tenant],
      );
      expect(auditRows.rows).toHaveLength(2);
      const alphaAudit = auditRows.rows.find(
        (row) => row.details?.to?.display_name === "Alpha",
      );
      const betaAudit = auditRows.rows.find(
        (row) => row.details?.to?.display_name === "Beta",
      );
      expect(alphaAudit?.details).toMatchObject({
        assignment_id: assignment,
        from: { display_name: null },
        to: { display_name: "Alpha" },
      });
      expect(betaAudit?.details).toMatchObject({
        assignment_id: assignment,
        from: { display_name: "Alpha" },
        to: { display_name: "Beta" },
      });
    } catch (error) {
      testError = error;
      throw error;
    } finally {
      await db.query("rollback").catch(() => {});
      await db2.query("rollback").catch(() => {});
      await observer.end().catch(() => {});
      try {
        await db.query("begin");
        await db.query("delete from public.audit_logs where tenant_id=$1", [
          tenant,
        ]);
        await db.query(
          "delete from public.donor_account_brands where tenant_id=$1",
          [tenant],
        );
        await db.query(
          "delete from public.donor_portal_hosts where tenant_id=$1",
          [tenant],
        );
        await db.query(
          "delete from authz.memberships where tenant_id=$1 or user_id=$2",
          [tenant, user],
        );
        await db.query("delete from public.profiles where user_id=$1", [user]);
        await db.query("delete from public.tenants where id=$1", [tenant]);
        await db.query("delete from auth.users where id=$1", [user]);
        await db.query("commit");
      } catch (cleanupError) {
        await db.query("rollback").catch(() => {});
        if (!testError) throw cleanupError;
      }
    }
  });
});
