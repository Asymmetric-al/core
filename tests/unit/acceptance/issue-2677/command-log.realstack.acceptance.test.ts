import { readFileSync } from "node:fs";
import pg from "pg";
import { expect, it } from "vitest";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
  migration,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "staff retain scoped command metadata but cannot select stored request content",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const {
        rows: [row],
      } = await db.query(
        `insert into public.crm_command_logs (tenant_id,actor_user_id,action,resource_type,status,command_payload,result_summary,idempotency_key) values ($1,$2,'crm.note.create','note','succeeded','{"body":"fixture"}','{"count":1}','fixture-retry') returning id`,
        [ids.TA, ids.UDEV],
      );
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      const read = asRole(db, ids);
      const grants = await read(
        "authenticated",
        caller,
        `select has_column_privilege(current_user,'public.crm_command_logs','command_payload','select') as payload`,
      );
      expect(grants.rows).toEqual([{ payload: false }]);
      const safe = await read(
        "authenticated",
        caller,
        `select idempotency_key from public.crm_command_logs where id='${row.id}'`,
      );
      expect(safe.rows).toEqual([{ idempotency_key: "fixture-retry" }]);
      await db.query(
        readFileSync(migration("scrub_crm_command_payloads"), "utf8"),
      );
      expect(
        (
          await db.query(
            "select command_payload, result_summary from public.crm_command_logs where id=$1",
            [row.id],
          )
        ).rows,
      ).toEqual([{ command_payload: {}, result_summary: { count: 1 } }]);
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
