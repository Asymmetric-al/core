import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);
describe.skipIf(!ADMIN_URL)("giving target integrity", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  it("keeps a primary key on the permanent lock and no unused guard policies", async () => {
    const result =
      await db.query(`select exists(select from pg_constraint where conrelid='public.giving_target_entity_locks'::regclass and contype='p') as keyed,
      (select count(*)::int from pg_policies where schemaname='public' and tablename in ('legal_entities','payment_account_bindings','giving_target_entity_locks') and 'tenant_guard'=any(roles)) as unused,
      (select count(*)::int from pg_constraint where (conrelid,conname) in (('public.donations'::regclass,'donations_target_requires_tenant'),('public.donor_pledges'::regclass,'donor_pledges_target_requires_tenant')) and contype='c') as checks`);
    expect(result.rows).toEqual([{ keyed: true, unused: 0, checks: 2 }]);
  });
  it("every reference to tenants restricts deletion", async () => {
    const { rows } = await db.query(
      "select count(*)::int as total, count(*) filter(where confdeltype<>'r')::int as invalid from pg_constraint where contype='f' and confrelid='public.tenants'::regclass",
    );
    expect(rows[0].total).toBeGreaterThan(100);
    expect(rows[0].invalid).toBe(0);
  });
  it("the seed owns two default Sites, portal hosts, brands, explicit approval policies and fee funds", async () => {
    const result =
      await db.query(`select t.id, s.id as site, portal.tenant_id as portal, b.display_name, a.ownership_mode, f.name,
      (select count(*)::int from public.sites all_sites where all_sites.tenant_id=t.id) as sites
      from public.tenants t join public.sites s on s.tenant_id=t.id and s.is_default
      join lateral public.resolve_verified_host(t.slug||'.localhost') h on h.site_id=s.id and h.tenant_id=t.id
      join lateral public.resolve_verified_host(t.slug||'-portal.localhost') portal on portal.site_id is null and portal.tenant_id=t.id
      join public.donor_account_brands b on b.tenant_id=t.id join public.contribution_approval_policies a on a.tenant_id=t.id
      join public.funds f on f.tenant_id=t.id and f.system_purpose='fee_cover'
      where t.id in ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002') order by t.id`);
    expect(result.rows.map((row) => [row.sites, row.ownership_mode])).toEqual([
      [1, "no_approval_required"],
      [2, "no_approval_required"],
    ]);
    expect(
      (await db.query("select id from public.payment_account_bindings"))
        .rowCount,
    ).toBe(0);
    await db.query("begin");
    try {
      await expect(
        db.query(
          "delete from public.tenants where id='00000000-0000-0000-0000-000000000001'",
        ),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await db.query("rollback");
    }
  });
  it("grants clients no table or column writes on tenant, entity or Site records", async () => {
    const violations = await db.query(
      `select relation, principal from unnest(array['tenants','legal_entities','payment_account_bindings','giving_target_entity_locks','sites','site_domains','donor_portal_hosts','donor_account_brands']) relation cross join unnest(array['anon','authenticated']) principal where has_any_column_privilege(principal,'public.'||relation,'insert,update,references') or has_table_privilege(principal,'public.'||relation,'delete,truncate,trigger')`,
    );
    expect(violations.rows).toEqual([]);
  });
  it("permits a fee fund per entity and enforces the binding tenant key for service writers", async () => {
    await db.query("begin");
    try {
      const tenant = randomUUID(),
        other = randomUUID(),
        second = randomUUID();
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1,'First',$1::uuid::text),($2,'Other',$2::uuid::text)",
        [tenant, other],
      );
      await db.query(
        "insert into public.legal_entities(id,tenant_id,name) values ($1,$1,'First'),($2,$1,'Second')",
        [tenant, second],
      );
      await db.query(
        "insert into public.funds(tenant_id,legal_entity_id,name,system_purpose) values ($1,$1,'Fee','fee_cover'),($1,$2,'Fee','fee_cover')",
        [tenant, second],
      );
      await db.query("savepoint duplicate_fee");
      await expect(
        db.query(
          "insert into public.funds(tenant_id,legal_entity_id,name,system_purpose) values ($1,$1,'Fee','fee_cover')",
          [tenant],
        ),
      ).rejects.toMatchObject({ code: "23505" });
      await db.query(
        "rollback to duplicate_fee; grant insert on public.payment_account_bindings to service_role; set local role service_role",
      );
      await expect(
        db.query(
          "insert into public.payment_account_bindings(tenant_id,legal_entity_id) values ($1,$2)",
          [other, second],
        ),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await db.query("rollback");
    }
  });
  it.each([
    ["funds", "fund_id"],
    ["missionaries", "missionary_id"],
  ])("fixes the entity on %s once a gift names it", async (table, column) => {
    await db.query("begin");
    try {
      const tenant = randomUUID(),
        other = randomUUID(),
        target = randomUUID(),
        first = randomUUID(),
        second = randomUUID(),
        foreign = randomUUID();
      await db.query(
        `insert into public.tenants(id,name,slug) values ($1,'test',$1::uuid::text),($2,'other',$2::uuid::text)`,
        [tenant, other],
      );
      await db.query(
        `insert into public.legal_entities(id,tenant_id,name) values ($1,$2,'First'),($3,$2,'Second'),($4,$5,'Foreign')`,
        [first, tenant, second, foreign, other],
      );
      await db.query(
        `insert into public.${table}(id,tenant_id,legal_entity_id${table === "funds" ? ",name" : ""}) values ($1,$2,$3${table === "funds" ? ",'Target'" : ""})`,
        [target, tenant, first],
      );
      await db.query(
        `update public.${table} set legal_entity_id=$1 where id=$2`,
        [second, target],
      );
      await db.query("savepoint wrong");
      await db.query(
        `grant select,update on public.${table} to service_role; set local role service_role`,
      );
      await expect(
        db.query(`update public.${table} set legal_entity_id=$1 where id=$2`, [
          foreign,
          target,
        ]),
      ).rejects.toMatchObject({ code: "23503" });
      await db.query("rollback to wrong");
      await db.query("savepoint gift");
      await expect(
        db.query(
          `insert into public.donations(tenant_id,${column},amount) values ($1,$2,100)`,
          [other, target],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await db.query("rollback to gift");
      await db.query(
        `insert into public.donations(tenant_id,${column},amount) values ($1,$2,100)`,
        [tenant, target],
      );
      await db.query(`delete from public.donations where tenant_id=$1`, [
        tenant,
      ]);
      await expect(
        db.query(`update public.${table} set legal_entity_id=$1 where id=$2`, [
          first,
          target,
        ]),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await db.query("rollback");
    }
  });
  it.each([
    "donations",
    "donor_pledges",
    "staged_gifts",
    "staged_gift_allocations",
    "donation_saga_outbox",
  ])(
    "locks both entities permanently from %s, including existing rows at upgrade",
    async (source) => {
      const tenant = randomUUID(),
        entity = randomUUID(),
        fund = randomUUID(),
        missionary = randomUUID(),
        gift = randomUUID(),
        donor = randomUUID(),
        staged = randomUUID();
      const migration = readFileSync(
        new URL(
          "../../../../supabase/migrations/20261120130004_giving_target_entities.sql",
          import.meta.url,
        ),
        "utf8",
      );
      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants(id,name,slug) values ($1,'test',$1::uuid::text)`,
          [tenant],
        );
        await db.query(
          `insert into public.legal_entities(id,tenant_id,name) values ($1,$2,'First')`,
          [entity, tenant],
        );
        await db.query(
          `insert into public.funds(id,tenant_id,legal_entity_id,name) values ($1,$2,$3,'Target')`,
          [fund, tenant, entity],
        );
        await db.query(
          `insert into public.missionaries(id,tenant_id,legal_entity_id) values ($1,$2,$3)`,
          [missionary, tenant, entity],
        );
        await db.query(
          `insert into public.donors(id,tenant_id) values ($1,$2)`,
          [donor, tenant],
        );
        await db.query(
          `insert into public.donations(id,tenant_id,amount) values ($1,$2,100)`,
          [gift, tenant],
        );
        if (source === "staged_gift_allocations")
          await db.query(
            `insert into public.staged_gifts(id,tenant_id,donation_id,amount) values ($1,$2,$3,100)`,
            [staged, tenant, gift],
          );
        const extras: Record<string, [string, string[]]> = {
          donations: ["", []],
          donor_pledges: ["", []],
          staged_gifts: [",donation_id", [gift]],
          staged_gift_allocations: [",staged_gift_id", [staged]],
          donation_saga_outbox: [
            ",donation_id,donor_id,idempotency_key",
            [gift, donor, randomUUID()],
          ],
        };
        const [columns, args] = extras[source]!;
        const inserted = await db.query(
          `insert into public.${source}(tenant_id,fund_id,missionary_id,amount${columns}) values ($1,$2,$3,100${args.map((_, index) => `,$${index + 4}`).join("")}) returning id`,
          [tenant, fund, missionary, ...args],
        );
        const locks = async () =>
          (
            await db.query(
              `select fund_id,missionary_id,legal_entity_id from public.giving_target_entity_locks where tenant_id=$1 order by fund_id nulls last`,
              [tenant],
            )
          ).rows;
        const expected = [
          { fund_id: fund, missionary_id: null, legal_entity_id: entity },
          { fund_id: null, missionary_id: missionary, legal_entity_id: entity },
        ];
        expect(await locks()).toEqual(expected);
        await db.query(
          `delete from public.giving_target_entity_locks where tenant_id=$1`,
          [tenant],
        );
        const backfill =
          migration.match(
            /^INSERT INTO public\.giving_target_entity_locks\b[^;]+;/gm,
          ) ?? [];
        await db.query(backfill.join("\n"));
        expect(await locks()).toEqual(expected);
        await db.query(`delete from public.${source} where id=$1`, [
          inserted.rows[0].id,
        ]);
        expect(await locks()).toEqual(expected);
      } finally {
        await db.query("rollback");
      }
    },
  );
  it("all ten gift target keys are composite, validated and replace their predecessors", async () => {
    const { rows } = await db.query(
      `select c.convalidated, cardinality(c.conkey) as width from pg_constraint c where c.contype='f' and c.confrelid in ('public.funds'::regclass,'public.missionaries'::regclass) and c.conrelid::regclass::text=any($1)`,
      [
        [
          "donations",
          "staged_gift_allocations",
          "staged_gifts",
          "donor_pledges",
          "donation_saga_outbox",
        ],
      ],
    );
    expect(rows).toHaveLength(10);
    expect(rows.every((row) => row.convalidated && row.width === 2)).toBe(true);
  });
});
