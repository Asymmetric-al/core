import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  migration,
  read,
} from "../issue-2675/harness";

const DROP = read(migration("_drop_crm_merge_candidates"));
const BODY = DROP.replace(/^BEGIN;$/m, "").replace(/^COMMIT;$/m, "");

it("is one migration that drops the table and nothing else", () => {
  expect(DROP).toMatch(/^BEGIN;$/m);
  expect(DROP).toMatch(/^COMMIT;$/m);
  expect(DROP).toMatch(/SET LOCAL lock_timeout = '5s';/);
  expect(
    DROP.split("\n")
      .filter((line) => /^\s*DROP\b/i.test(line))
      .map((line) => line.trim()),
  ).toEqual(["DROP TABLE public.crm_merge_candidates;"]);
  expect(
    DROP.split("\n").filter(
      (line) => !line.trimStart().startsWith("--") && /\bCASCADE\b/i.test(line),
    ),
  ).toEqual([]);
  expect(DROP).toMatch(/superseded for this one table by\s+-- decision D-14/);
});

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("crm_merge_candidates is retired", () => {
  let db: pg.Client;
  const notices: string[] = [];

  beforeEach(async () => {
    notices.length = 0;
    db = new pg.Client({ connectionString: ADMIN_URL });
    db.on("notice", (notice) => notices.push(notice.message ?? ""));
    await db.connect();
    await db.query("begin");
  });

  afterEach(async () => {
    await db.query("rollback");
    await db.end();
  });

  it("is gone from the migrated chain, and CRM detail's table stays", async () => {
    const { rows } = await db.query(
      "select to_regclass('public.crm_merge_candidates')::text as retired, to_regclass('public.donor_merge_candidates')::text as kept",
    );
    expect(rows).toEqual([{ retired: null, kept: "donor_merge_candidates" }]);
  });

  async function attempt() {
    await db.query("savepoint drop_attempt");
    try {
      await db.query(BODY);
      await db.query("release savepoint drop_attempt");
      return { code: null, message: "" };
    } catch (error) {
      await db.query("rollback to savepoint drop_attempt");
      const failure = error as { code?: string; message?: string };
      return { code: failure.code ?? "?", message: failure.message ?? "" };
    }
  }

  it("refuses while a function, a view or a policy still names the table, and reports the rows it drops", async () => {
    const suffix = randomUUID().replaceAll("-", "");
    await db.query(
      "create table public.crm_merge_candidates (id integer); insert into public.crm_merge_candidates values (1), (2), (3)",
    );
    const reader = `public.wp4a2b_reader_${suffix}`;
    const view = `public.wp4a2b_view_${suffix}`;
    const guarded = `public.wp4a2b_guarded_${suffix}`;
    for (const [name, sql, drop] of [
      [
        `function ${reader}()`,
        `create function ${reader}() returns bigint language plpgsql as $f$ begin return (select count(*) from public.crm_merge_candidates); end $f$`,
        `drop function ${reader}()`,
      ],
      [
        `view ${view}`,
        `create view ${view} as select id from public.crm_merge_candidates`,
        `drop view ${view}`,
      ],
      [
        `policy wp4a2b_policy on ${guarded}`,
        `create table ${guarded} (id integer); create policy wp4a2b_policy on ${guarded} using (exists (select 1 from public.crm_merge_candidates))`,
        `drop table ${guarded}`,
      ],
    ] as const) {
      await db.query(sql);
      const refused = await attempt();
      expect(refused.code, name).toBe("2BP01");
      expect(refused.message, name).toContain(name);
      await db.query(drop);
    }
    expect(await attempt()).toEqual({ code: null, message: "" });
    expect(notices).toContain("crm_merge_candidates: dropping 3 row(s)");
    const { rows } = await db.query(
      "select to_regclass('public.crm_merge_candidates') as retired",
    );
    expect(rows).toEqual([{ retired: null }]);
  });
});
