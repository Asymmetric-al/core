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
  "returns only requested live profiles, once per person, with the directory's same labels",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      const read = asRole(db, ids);
      const original = await read(
        "authenticated",
        caller,
        `select distinct profile_id,display_name,email from public.tenant_member_directory('${ids.TA}') where profile_id='${ids.UFC}'`,
      );
      expect(original.rows).toHaveLength(1);
      const args = `'${ids.TA}',array['${ids.UFC}','${ids.UREV}','${ids.UB}']::uuid[]`;
      const narrow = await read(
        "authenticated",
        caller,
        `select profile_id,display_name,email from public.tenant_member_directory(${args})`,
      );
      expect(narrow.code).toBeNull();
      expect(narrow.rows).toEqual(original.rows);
      const refused = await read(
        "authenticated",
        {
          sub: "UDON",
          headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDonA },
        },
        `select * from public.tenant_member_directory(${args})`,
      );
      expect(refused.code).toBe("42501");
      const workers = await db.query(
        "insert into public.missionaries (tenant_id,profile_id) values ($1,$2),($3,$4) returning id,tenant_id",
        [ids.TA, ids.UFC, ids.TB, ids.UB],
      );
      const requested = workers.rows.map((row) => `'${row.id}'`).join(",");
      const labels = await read(
        "authenticated",
        caller,
        `select * from public.crm_missionary_labels('${ids.TA}',array[${requested}]::uuid[])`,
      );
      expect(labels.code).toBeNull();
      expect(labels.rows).toEqual([
        {
          ...original.rows[0],
          member_profile_id: ids.UFC,
          id: workers.rows.find((row) => row.tenant_id === ids.TA).id,
        },
      ]);
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
