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
      // Fix check G4: staff could once insert free JSON and text into
      // result_summary and error_message, so a signed-in caller reads none of
      // the three request-shaped columns.
      const grants = await read(
        "authenticated",
        caller,
        `select ${["command_payload", "result_summary", "error_message"]
          .map(
            (column) =>
              `has_column_privilege(current_user,'public.crm_command_logs','${column}','select') as ${column}`,
          )
          .join(",")}`,
      );
      expect(grants.rows).toEqual([
        {
          command_payload: false,
          result_summary: false,
          error_message: false,
        },
      ]);
      const safe = await read(
        "authenticated",
        caller,
        `select idempotency_key, status from public.crm_command_logs where id='${row.id}'`,
      );
      expect(safe.rows).toEqual([
        { idempotency_key: "fixture-retry", status: "succeeded" },
      ]);
      const counted = await read(
        "authenticated",
        caller,
        `select count(*)::int as n from public.crm_command_logs where id='${row.id}'`,
      );
      expect(counted.rows).toEqual([{ n: 1 }]);
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
