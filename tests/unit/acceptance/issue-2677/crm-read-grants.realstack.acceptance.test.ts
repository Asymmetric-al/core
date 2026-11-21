import pg from "pg";
import { expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

const readColumns = {
  missionaries: "created_at id location profile_id tenant_id updated_at",
  contribution_approval_policies:
    "escalation_hours ownership_mode reminder_hours stronger_approval_categories suppressed_gates tenant_id",
  contribution_corrections: "donation_id status tenant_id",
  contribution_correction_requests: "donation_id status tenant_id",
  contribution_adjustments:
    "created_at donation_id effective_values id status tenant_id",
  donor_merge_candidates:
    "existing_donor_id id incoming_donor_id status tenant_id",
  crm_table_user_preferences:
    "pinned_action_id profile_id schema_version settings table_id tenant_id",
  crm_table_tenant_defaults:
    "pinned_action_id schema_version settings table_id tenant_id",
  crm_table_named_views:
    "id is_default name pinned_action_id profile_id schema_version settings table_id tenant_id",
};

it.skipIf(!ADMIN_URL)(
  "grants exactly the columns the CRM queries, without direct writes or anonymous access",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      for (const [table, columns] of Object.entries(readColumns)) {
        const { rows } = await db.query(
          `select a.attname, has_column_privilege('authenticated',a.attrelid,a.attnum,'select') as readable,
         has_column_privilege('anon',a.attrelid,a.attnum,'select') as public_read,
         has_column_privilege('authenticated',a.attrelid,a.attnum,'insert,update') as writable
         from pg_attribute a where a.attrelid = $1::regclass and a.attnum > 0 and not a.attisdropped
         order by a.attname`,
          [`public.${table}`],
        );
        expect(
          rows.filter((row) => row.readable).map((row) => row.attname),
          table,
        ).toEqual(columns.split(" "));
        expect(
          rows.some((row) => row.public_read || row.writable),
          table,
        ).toBe(false);
        expect(
          (
            await db.query(
              "select has_table_privilege('authenticated',$1,'delete') as can_delete",
              [`public.${table}`],
            )
          ).rows[0].can_delete,
          table,
        ).toBe(false);
      }
    } finally {
      await db.end();
    }
  },
);
