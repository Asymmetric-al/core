import pg from "pg";
import { expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "protects restricted CRM notes using the selected tenant assignment on the joined chain",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      const policies = await db.query<{
        policyname: string;
        qual: string;
        with_check: string;
      }>(
        "select policyname, qual, with_check from pg_policies where schemaname = 'public' and tablename = 'crm_notes'",
      );
      for (const row of policies.rows) {
        expect(`${row.qual} ${row.with_check}`).not.toMatch(
          /profiles\.role|authz\.is_super_admin\(/i,
        );
      }
      const restricted =
        /visibility <> 'restricted'::text\) OR \( SELECT authz\.assignment_is_tenant_admin\(\)/i;
      expect(
        policies.rows.find(
          (row) => row.policyname === "crm_notes_tenant_select",
        )?.qual,
      ).toMatch(restricted);
      expect(
        policies.rows.find(
          (row) => row.policyname === "crm_notes_tenant_insert",
        )?.with_check,
      ).toMatch(restricted);
    } finally {
      await db.end();
    }
  },
);
