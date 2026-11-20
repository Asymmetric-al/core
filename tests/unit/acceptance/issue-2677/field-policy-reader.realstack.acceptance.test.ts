import pg from "pg";
import { expect, it } from "vitest";
import {
  catalogProblems,
  catalogSql,
  loadManifest,
} from "../../../../scripts/verify/field-policy-census.mjs";

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
  "the catalog detects a physical relation shadowing the derived report",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      await db.query("create table public.crm_report_groups (id uuid)");
      const manifest = loadManifest();
      const result = await db.query({
        text: catalogSql(manifest),
        rowMode: "array",
      });
      expect(
        catalogProblems(manifest, JSON.parse(result.rows[0][0])),
      ).toContain(
        "RESERVED public.crm_report_groups exists but is reserved and must be absent",
      );
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);

it.skipIf(!ADMIN_URL)(
  "field-policy baseline is present only under the selected tenant and assignment",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const read = asRole(db, ids);
      const query =
        "select visible from public.field_policies where record_type='donations' and surface='missionary' and field_key='amount' and tenant_id is null";
      const scoped = await read(
        "authenticated",
        {
          sub: "UDEV",
          headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
        },
        query,
      );
      expect(scoped.code, scoped.message).toBeNull();
      expect(scoped.rows).toEqual([{ visible: true }]);
      const missing = await read("authenticated", { sub: "UDEV" }, query);
      expect(missing.code, missing.message).toBeNull();
      expect(missing.rows).toEqual([]);
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
