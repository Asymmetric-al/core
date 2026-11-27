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
        "insert into public.donors (tenant_id,party_id,name,type) select $1,public.donor_party_for_insert($1,null,null,null),string_agg(md5(i::text),''),string_agg(md5((i+1)::text),'') from generate_series(1,400) i returning id",
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
        `select id from public.crm_donor_text_page('${ids.TA}','name',false,101) where id='${result.rows[0].id}' order by name,id`,
      );
      expect(scoped.code).toBeNull();
      expect(scoped.rows).toEqual(result.rows);
      await db.query(
        "insert into public.donors (tenant_id,party_id,name,type,status) select $1,public.donor_party_for_insert($1,null,'Member '||i,null),'Member '||i, 'member','active' from generate_series(1,105) i",
        [ids.TA],
      );
      for (const column of ["name", "type", "status"]) {
        for (const descending of [false, true]) {
          const direction = descending ? "desc" : "asc";
          const order = `order by ${column} ${direction} nulls last, id ${direction}`;
          const native = await read(
            "authenticated",
            caller,
            `select id from public.donors where tenant_id='${ids.TA}' ${order} limit 51`,
          );
          const paged = await read(
            "authenticated",
            caller,
            `select id from public.crm_donor_text_page('${ids.TA}','${column}',${descending},51) ${order}`,
          );
          expect(native.code).toBeNull();
          expect(paged.code).toBeNull();
          expect(paged.rows).toEqual(native.rows);
        }
      }
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
  "D-18 (AL-2678 r3: the search returns the record's assignment key last, which the records list names its owner by): searches the four CRM fields under the staff token using the same substring patterns",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      for (const tenant of [ids.TA, ids.TB])
        await db.query(
          "insert into public.donors (tenant_id,party_id,name,email,organization,phone) values ($1,public.donor_party_for_insert($1,null,null,null),'Fixture aBc12',null,null,null),($1,public.donor_party_for_insert($1,null,null,null),null,'prefixAbC12@example.test',null,null),($1,public.donor_party_for_insert($1,null,null,null),null,null,'Group ABC12',null),($1,public.donor_party_for_insert($1,null,null,null),null,null,null,'+abc12')",
          [tenant],
        );
      const read = asRole(db, ids);
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      const shape = await read(
        "authenticated",
        caller,
        `select to_jsonb(result) as row from public.search_crm_donors('${ids.TA}','b_12') as result limit 1`,
      );
      expect(shape.code).toBeNull();
      expect(Object.keys(shape.rows[0]!.row as object).sort()).toEqual(
        [
          "tenant_id",
          "id",
          "profile_id",
          "missionary_id",
          "name",
          "email",
          "phone",
          "avatar_url",
          "location",
          "type",
          "status",
          "total_given",
          "last_gift_date",
          "tags",
          "organization",
          "title",
          "notes",
          "created_at",
          "updated_at",
          "ministry_assignment_id",
        ].sort(),
      );
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
        "insert into public.donors (tenant_id,party_id,name) values ($1,public.donor_party_for_insert($1,null,null,null),'Müller Straße'),($1,public.donor_party_for_insert($1,null,null,null),'Ångström'),($1,public.donor_party_for_insert($1,null,null,null),'Σίγμα'),($1,public.donor_party_for_insert($1,null,null,null),'a_b'),($1,public.donor_party_for_insert($1,null,null,null),'İstanbul')",
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
