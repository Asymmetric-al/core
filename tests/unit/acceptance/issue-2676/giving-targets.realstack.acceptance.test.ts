import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);
const D18 = "D-18, AL-2678: each fixture missionary names a Party";
describe.skipIf(!ADMIN_URL)(`giving target integrity (${D18})`, () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  it("keeps a primary key on the permanent lock and no unused guard policies", async () => {
    const result =
      await db.query(`select exists(select from pg_constraint where conrelid='public.giving_target_entity_locks'::regclass and contype='p') as keyed,
      (select count(*)::int from pg_policies where schemaname='public' and tablename in ('giving_target_entity_locks') and 'tenant_guard'=any(roles)) as unused,
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
  it("the seed owns, for each tenant, a legal entity with its fee-cover fund and an explicit approval policy", async () => {
    const result =
      await db.query(`select t.id, e.name as entity, a.ownership_mode, f.name
      from public.tenants t join public.legal_entities e on e.tenant_id=t.id
      join public.contribution_approval_policies a on a.tenant_id=t.id
      join public.funds f on f.tenant_id=t.id and f.legal_entity_id=e.id and f.system_purpose='fee_cover'
      where t.id in ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002') order by t.id`);
    expect(
      result.rows.map((row) => [row.id, row.ownership_mode, row.name]),
    ).toEqual([
      [
        "00000000-0000-0000-0000-000000000001",
        "no_approval_required",
        "Fee cover",
      ],
      [
        "00000000-0000-0000-0000-000000000002",
        "no_approval_required",
        "Fee cover",
      ],
    ]);
    expect(
      (
        await db.query(
          "select id from public.payment_account_bindings where tenant_id in ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')",
        )
      ).rowCount,
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
  it("grants clients no table or column writes on tenant or entity records", async () => {
    const violations = await db.query(
      `select relation, principal from unnest(array['tenants','legal_entities','payment_account_bindings','giving_target_entity_locks']) relation cross join unnest(array['anon','authenticated']) principal where has_any_column_privilege(principal,'public.'||relation,'insert,update,references') or has_table_privilege(principal,'public.'||relation,'delete,truncate,trigger')`,
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
        "insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$1,'First','US','usd','First'),($2,$1,'Second','US','usd','Second')",
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
          "insert into public.payment_account_bindings(tenant_id,legal_entity_id,version,status,provider_account_ref,livemode) values ($1,$2,1,'pending','acct_wrong',false)",
          [other, second],
        ),
      ).rejects.toMatchObject({
        code: "23503",
        constraint: "payment_account_bindings_tenant_id_legal_entity_id_fkey",
      });
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
        `insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$2,'First','US','usd','First'),($3,$2,'Second','US','usd','Second'),($4,$5,'Foreign','US','usd','Foreign')`,
        [first, tenant, second, foreign, other],
      );
      if (table === "missionaries")
        await db.query(
          "insert into public.parties(id,tenant_id,display_name) values ($1,$2,'Fixture')",
          [target, tenant],
        );
      await db.query(
        `insert into public.${table}(id,tenant_id,legal_entity_id${table === "funds" ? ",name" : ",party_id"}) values ($1,$2,$3${table === "funds" ? ",'Target'" : ",$1"})`,
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
          `insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$2,'First','US','usd','First')`,
          [entity, tenant],
        );
        await db.query(
          `insert into public.funds(id,tenant_id,legal_entity_id,name) values ($1,$2,$3,'Target')`,
          [fund, tenant, entity],
        );
        await db.query(
          `with party as (insert into public.parties(id,tenant_id,display_name) values ($1,$2,'Fixture') returning id) insert into public.missionaries(id,tenant_id,legal_entity_id,party_id) select $1,$2,$3,id from party`,
          [missionary, tenant, entity],
        );
        await db.query(
          `insert into public.donors(id,tenant_id,party_id) values ($1,$2,public.donor_party_for_insert($2,null,null,null))`,
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
          {
            fund_id: null,
            missionary_id: missionary,
            legal_entity_id: entity,
          },
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
  it("refuses to delete a fund or missionary that money named, after the money row is gone, and still deletes an unnamed one", async () => {
    const [tenant, entity, fund, missionary, spareFund, spareMissionary, gift] =
      Array.from({ length: 7 }, () => randomUUID());
    await db.query("begin");
    try {
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1,'test',$1::uuid::text)",
        [tenant],
      );
      await db.query(
        "insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$2,'First','US','usd','First')",
        [entity, tenant],
      );
      await db.query(
        "insert into public.funds(id,tenant_id,legal_entity_id,name) values ($1,$3,$4,'Named'),($2,$3,$4,'Spare')",
        [fund, spareFund, tenant, entity],
      );
      await db.query(
        "with party as (insert into public.parties(id,tenant_id,display_name) values ($1,$3,'Fixture'),($2,$3,'Fixture') returning id) insert into public.missionaries(id,tenant_id,legal_entity_id,party_id) select id,$3,$4,id from party",
        [missionary, spareMissionary, tenant, entity],
      );
      await db.query(
        "insert into public.donations(id,tenant_id,fund_id,missionary_id,amount) values ($1,$2,$3,$4,100)",
        [gift, tenant, fund, missionary],
      );
      await db.query("delete from public.donations where id=$1", [gift]);
      for (const [table, id] of [
        ["funds", fund],
        ["missionaries", missionary],
      ] as const) {
        await db.query("savepoint locked_target");
        await expect(
          db.query(`delete from public.${table} where id=$1`, [id]),
          table,
        ).rejects.toMatchObject({ code: "23503" });
        await db.query("rollback to savepoint locked_target");
      }
      expect(
        (
          await db.query(
            "select fund_id,missionary_id,legal_entity_id from public.giving_target_entity_locks where tenant_id=$1 order by fund_id nulls last",
            [tenant],
          )
        ).rows,
      ).toEqual([
        { fund_id: fund, missionary_id: null, legal_entity_id: entity },
        { fund_id: null, missionary_id: missionary, legal_entity_id: entity },
      ]);
      expect(
        (await db.query("delete from public.funds where id=$1", [spareFund]))
          .rowCount,
      ).toBe(1);
      expect(
        (
          await db.query("delete from public.missionaries where id=$1", [
            spareMissionary,
          ])
        ).rowCount,
      ).toBe(1);
    } finally {
      await db.query("rollback");
    }
  });
  it("donations.tenant_id has no default and is NOT NULL: a gift with no tenant is refused (23502); with the column nullable again it is stored with none if it names nothing, and refused (23514) if it names a donor, fund or missionary (D-18, AL-2681 PR 2a, W8-R16: the column is NOT NULL behind its count gate)", async () => {
    const { rows } = await db.query(
      "select column_default from information_schema.columns where table_schema='public' and table_name='donations' and column_name='tenant_id'",
    );
    expect(rows).toEqual([{ column_default: null }]);
    const [tenant, entity, donor, fund, missionary] = Array.from(
      { length: 5 },
      () => randomUUID(),
    );
    await db.query("begin");
    try {
      await db.query("savepoint not_null");
      await expect(
        db.query("insert into public.donations(id,amount) values ($1,100)", [
          randomUUID(),
        ]),
      ).rejects.toMatchObject({ code: "23502" });
      await db.query("rollback to savepoint not_null");
      await db.query(
        "alter table public.donations alter column tenant_id drop not null; alter table public.donations drop constraint donations_tenant_id_present",
      );
      const gift = await db.query(
        "insert into public.donations(id,amount) values ($1,100) returning tenant_id",
        [randomUUID()],
      );
      expect(gift.rows).toEqual([{ tenant_id: null }]);
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1,'test',$1::uuid::text)",
        [tenant],
      );
      await db.query(
        "insert into public.legal_entities(id,tenant_id,name,country_code,currency,legal_name) values ($1,$2,'First','US','usd','First')",
        [entity, tenant],
      );
      await db.query(
        "insert into public.donors(id,tenant_id,party_id) values ($1,$2,public.donor_party_for_insert($2,null,null,null))",
        [donor, tenant],
      );
      await db.query(
        "insert into public.funds(id,tenant_id,legal_entity_id,name) values ($1,$2,$3,'Target')",
        [fund, tenant, entity],
      );
      await db.query(
        "with party as (insert into public.parties(id,tenant_id,display_name) values ($1,$2,'Fixture') returning id) insert into public.missionaries(id,tenant_id,legal_entity_id,party_id) select $1,$2,$3,id from party",
        [missionary, tenant, entity],
      );
      for (const [column, id] of [
        ["donor_id", donor],
        ["fund_id", fund],
        ["missionary_id", missionary],
      ] as const) {
        await db.query("savepoint untenanted");
        await expect(
          db.query(
            `insert into public.donations(${column},amount) values ($1,100)`,
            [id],
          ),
          column,
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("rollback to savepoint untenanted");
      }
    } finally {
      await db.query("rollback");
    }
  });
  it("all ten gift target keys are composite, validated and replace their predecessors; with R2a's two line keys on staged_gift_allocations, twelve rows (D-18, AL-2681 WP8a part 2 R2a: an allocation of a line-based gift is also keyed to its fund with the fee flag and to its missionary with the entity)", async () => {
    const sources = [
      "donation_saga_outbox",
      "donations",
      "donor_pledges",
      "staged_gift_allocations",
      "staged_gifts",
    ] as const;
    const { rows } = await db.query(
      `select
         c.conrelid::regclass::text as source,
         c.confrelid::regclass::text as target,
         c.convalidated,
         array_agg(sa.attname::text order by u.ord) as source_cols,
         array_agg(ta.attname::text order by u.ord) as target_cols
       from pg_constraint c
       cross join lateral unnest(c.conkey, c.confkey) with ordinality as u(src_att, tgt_att, ord)
       join pg_attribute sa on sa.attrelid = c.conrelid and sa.attnum = u.src_att
       join pg_attribute ta on ta.attrelid = c.confrelid and ta.attnum = u.tgt_att
       where c.contype = 'f'
         and c.confrelid in ('public.funds'::regclass, 'public.missionaries'::regclass)
         and c.conrelid::regclass::text = any($1)
       group by c.oid, c.conrelid, c.confrelid, c.convalidated, c.conname
       order by c.conrelid::regclass::text collate "C", c.confrelid::regclass::text collate "C", array_length(c.conkey, 1), c.conname`,
      [sources],
    );
    const expected = sources.flatMap((source) => [
      {
        source,
        target: "funds",
        convalidated: true,
        source_cols: ["tenant_id", "fund_id"],
        target_cols: ["tenant_id", "id"],
      },
      ...(source === "staged_gift_allocations"
        ? [
            {
              source,
              target: "funds",
              convalidated: true,
              source_cols: [
                "tenant_id",
                "fund_id",
                "legal_entity_id",
                "is_fee_cover",
              ],
              target_cols: [
                "tenant_id",
                "id",
                "legal_entity_id",
                "is_reserved_fee_cover",
              ],
            },
          ]
        : []),
      {
        source,
        target: "missionaries",
        convalidated: true,
        source_cols: ["tenant_id", "missionary_id"],
        target_cols: ["tenant_id", "id"],
      },
      ...(source === "staged_gift_allocations"
        ? [
            {
              source,
              target: "missionaries",
              convalidated: true,
              source_cols: ["tenant_id", "missionary_id", "legal_entity_id"],
              target_cols: ["tenant_id", "id", "legal_entity_id"],
            },
          ]
        : []),
    ]);
    expect(expected).toHaveLength(12);
    expect(rows).toEqual(expected);
  });
  it("130004 stops on unconvertible targets before any change and names the operator's query", async () => {
    const read = (path: string) =>
      readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");
    const migration = read(
      "supabase/migrations/20261120130004_giving_target_entities.sql",
    );
    const start = migration.indexOf("DO $$");
    const end = migration.indexOf("END $$;", start) + "END $$;".length;
    expect(start).toBeGreaterThan(0);
    const opening = migration
      .slice(0, start)
      .replace(/--.*$/gm, "")
      .split(";")
      .map((statement) => statement.trim().split(/\s+/).slice(0, 2).join(" "))
      .filter(Boolean);
    expect(opening).toEqual(["BEGIN", "SET LOCAL", "LOCK TABLE"]);
    const lock = migration
      .slice(0, start)
      .replace(/--.*$/gm, "")
      .match(/LOCK TABLE ([^;]+) IN SHARE ROW EXCLUSIVE MODE;/);
    expect(
      lock?.[1]
        .split(",")
        .map((table) => table.trim())
        .sort(),
    ).toEqual(
      [
        "public.tenants",
        "public.funds",
        "public.missionaries",
        "public.donations",
        "public.donor_pledges",
        "public.staged_gifts",
        "public.staged_gift_allocations",
        "public.donation_saga_outbox",
      ].sort(),
    );
    const schema = `acc2676_preflight_${randomUUID().slice(0, 8)}`;
    const scratch = (sql: string) => sql.replaceAll("public.", `${schema}.`);
    const preflight = scratch(migration.slice(start, end));
    const operatorQuery = scratch(
      read("scripts/sql/giving-target-preflight.sql"),
    );
    const gifts = [
      "donations",
      "donor_pledges",
      "staged_gifts",
      "staged_gift_allocations",
      "donation_saga_outbox",
    ];
    const [a, b, fundA, fundB, missionaryA, missionaryB] = Array.from(
      { length: 6 },
      () => randomUUID(),
    );
    await db.query("begin");
    try {
      await db.query(
        `create schema ${schema};
         create table ${schema}.tenants(id uuid primary key, name text not null);
         create table ${schema}.funds(id uuid primary key, tenant_id uuid);
         create table ${schema}.missionaries(id uuid primary key, tenant_id uuid);
         ${gifts.map((gift) => `create table ${schema}.${gift}(id uuid primary key default gen_random_uuid(), tenant_id uuid, fund_id uuid, missionary_id uuid);`).join("\n")}`,
      );
      const results = async (sql: string) =>
        (await db.query(sql)) as unknown as pg.QueryResult[];
      await db.query(
        `insert into ${schema}.tenants values ('${a}','First'),('${b}','Second');
         insert into ${schema}.funds values ('${fundA}','${a}'),('${fundB}','${b}');
         insert into ${schema}.missionaries values ('${missionaryA}','${a}'),('${missionaryB}','${b}')`,
      );
      for (const gift of gifts)
        await db.query(
          `insert into ${schema}.${gift}(tenant_id,fund_id,missionary_id) values ($1,$2,$3)`,
          [a, fundA, missionaryA],
        );
      await db.query(preflight);
      expect((await results(operatorQuery)).map((r) => r.rowCount)).toEqual([
        0, 0,
      ]);

      const blank = randomUUID();
      await db.query(`insert into ${schema}.tenants values ('${blank}','   ')`);
      await db.query(
        `insert into ${schema}.funds values ('${randomUUID()}',null);
         insert into ${schema}.missionaries values ('${randomUUID()}',null)`,
      );
      for (const gift of gifts)
        await db.query(
          `insert into ${schema}.${gift}(tenant_id,fund_id,missionary_id) values ($1,$2,null),($1,null,$3)`,
          [a, fundB, missionaryB],
        );
      await db.query(
        `insert into ${schema}.donations(tenant_id,fund_id) values (null,$1)`,
        [fundA],
      );
      await db.query("savepoint refused");
      const refusal = await db.query(preflight).then(
        () => undefined,
        (error: {
          code?: string;
          message?: string;
          detail?: string;
          hint?: string;
        }) => error,
      );
      await db.query("rollback to savepoint refused");
      expect(refusal).toMatchObject({
        code: "P0001",
        message:
          "Giving-target preflight: tenantless funds=1, tenantless missionaries=1, wrong-tenant fund references=6, wrong-tenant missionary references=5, tenants with a blank name=1",
        detail: `Tenants with a blank name: ${blank}`,
        hint: expect.stringContaining(
          "scripts/sql/giving-target-preflight.sql",
        ),
      });
      const [targets, references] = await results(operatorQuery);
      expect(targets.rows.map((row) => row.source).sort()).toEqual([
        "funds",
        "missionaries",
        "tenants with a blank name",
      ]);
      expect(
        targets.rows.find((row) => row.source.startsWith("tenants"))?.id,
      ).toBe(blank);
      expect(references.rowCount).toBe(11);
      expect(
        [...new Set(references.rows.map((row) => row.source))].sort(),
      ).toEqual([...gifts].sort());
    } finally {
      await db.query("rollback");
    }
  });
});
