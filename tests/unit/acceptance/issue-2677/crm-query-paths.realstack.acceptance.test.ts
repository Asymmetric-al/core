import pg from "pg";
import { expect, it } from "vitest";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);
it.skipIf(!ADMIN_URL)(
  "keeps long existing donor names and record types writable and sortable",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const result = await db.query(
        "insert into public.donors (tenant_id,name,type) select $1,string_agg(md5(i::text),''),string_agg(md5((i+1)::text),'') from generate_series(1,400) i returning id",
        [ids.TA],
      );
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      const read = asRole(db, ids);
      const scoped = await read(
        "authenticated",
        caller,
        `select id from public.crm_donors_for_text_order('${ids.TA}') where id='${result.rows[0].id}' order by name,id`,
      );
      expect(scoped.code).toBeNull();
      expect(scoped.rows).toEqual(result.rows);
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
it.skipIf(!ADMIN_URL)(
  "keeps each CRM list ordering indexable including the specified NULL placement",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      const indexes = (
        await db.query(
          "select indexdef from pg_indexes where schemaname='public' and tablename='donors'",
        )
      ).rows
        .map((r) => r.indexdef)
        .join("\n");
      for (const col of [
        "created_at",
        "updated_at",
        "name",
        "status",
        "type",
        "total_given",
        "last_gift_date",
      ]) {
        expect(indexes).toContain(
          `(tenant_id, ${col} DESC NULLS LAST, id DESC)`,
        );
        if (col !== "last_gift_date")
          expect(indexes).toContain(`(tenant_id, ${col}, id)`);
      }
    } finally {
      await db.end();
    }
  },
);
it.skipIf(!ADMIN_URL)(
  "searches the four CRM fields under the staff token using the same substring patterns",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      for (const tenant of [ids.TA, ids.TB])
        await db.query(
          "insert into public.donors (tenant_id,name,email,organization,phone) values ($1,'Fixture aBc12',null,null,null),($1,null,'prefixAbC12@example.test',null,null),($1,null,null,'Group ABC12',null),($1,null,null,null,'+abc12')",
          [tenant],
        );
      const read = asRole(db, ids);
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      for (const [tenant, n] of [
        [ids.TA, 4],
        [ids.TB, 0],
      ] as const) {
        const r = await read(
          "authenticated",
          caller,
          `select tenant_id from public.search_crm_donors('${tenant}','b_12')`,
        );
        expect(r.code).toBeNull();
        expect(r.rows).toEqual(
          Array.from({ length: n }, () => ({ tenant_id: ids.TA })),
        );
      }
      await db.query(
        "insert into public.donors (tenant_id,name) values ($1,'Müller Straße'),($1,'Ångström'),($1,'Σίγμα'),($1,'a_b'),($1,'İstanbul')",
        [ids.TA],
      );
      for (const term of [
        "ÜLL",
        "straße",
        "ÅNG",
        "ΣΊ",
        "a\\_b",
        "ist",
        "_tr",
        "M%r",
      ]) {
        const value = pg.escapeLiteral(term);
        const native = await read(
          "authenticated",
          caller,
          `select id from public.donors where tenant_id='${ids.TA}' and (name ilike '%'||${value}||'%' or email ilike '%'||${value}||'%' or organization ilike '%'||${value}||'%' or phone ilike '%'||${value}||'%') order by id`,
        );
        const scoped = await read(
          "authenticated",
          caller,
          `select id from public.search_crm_donors('${ids.TA}',${value}) order by id`,
        );
        expect(native.code).toBeNull();
        expect(scoped.code).toBeNull();
        expect(scoped.rows, term).toEqual(native.rows);
      }
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
