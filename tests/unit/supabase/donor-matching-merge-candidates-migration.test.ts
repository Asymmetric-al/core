import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260704140000_donor_matching_merge_candidates.sql",
    import.meta.url,
  ),
  "utf8",
);
const rollbackSql = readFileSync(
  new URL(
    "../../../supabase/migrations/rollback_20260704140000_donor_matching_merge_candidates.sql",
    import.meta.url,
  ),
  "utf8",
);

function scopedConstraintLookup(
  tableName: string,
  constraintName: string,
): RegExp {
  const escapedTableName = tableName.replace(".", "\\.");
  return new RegExp(
    `WHERE\\s+conname = '${constraintName}'\\s+AND conrelid = '${escapedTableName}'::regclass`,
  );
}

describe("donor matching merge candidate migration", () => {
  it("keeps merge candidate, redirect, and audit tables server-only behind RLS", () => {
    for (const tableName of [
      "donor_merge_candidates",
      "donor_merge_redirects",
      "donor_merge_audit",
    ]) {
      expect(migrationSql).toContain(
        `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY`,
      );
      expect(migrationSql).toContain(
        `REVOKE ALL ON TABLE public.${tableName} FROM anon, authenticated`,
      );
      expect(migrationSql).toContain(
        `GRANT ALL ON TABLE public.${tableName} TO service_role`,
      );
    }
  });

  it("enforces that every donor reference belongs to the row tenant", () => {
    expect(migrationSql).toContain("donors_tenant_id_id_uidx");
    for (const donorIdColumn of [
      "existing_donor_id",
      "incoming_donor_id",
      "surviving_donor_id",
      "merged_donor_id",
    ]) {
      expect(migrationSql).toMatch(
        new RegExp(
          `FOREIGN KEY \\(tenant_id, ${donorIdColumn}\\)\\s+REFERENCES public\\.donors \\(tenant_id, id\\)`,
        ),
      );
    }
  });

  it("keeps donor redirect metadata off the public donors row shape", () => {
    expect(migrationSql).not.toContain(
      "ADD COLUMN IF NOT EXISTS merged_into_donor_id",
    );
    expect(migrationSql).not.toContain("ADD COLUMN IF NOT EXISTS merged_at");
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.donor_merge_redirects",
    );
    expect(migrationSql).toContain(
      "merged_at TIMESTAMPTZ NOT NULL DEFAULT now()",
    );
    expect(rollbackSql).toContain(
      "DROP TABLE IF EXISTS public.donor_merge_redirects",
    );
    expect(rollbackSql).not.toContain("DROP COLUMN IF EXISTS merged_at");
    expect(rollbackSql).not.toContain(
      "DROP COLUMN IF EXISTS merged_into_donor_id",
    );
  });

  it("blocks redirect rows from pointing at themselves", () => {
    expect(migrationSql).toContain("donor_merge_redirects_distinct_check");
    expect(migrationSql).toContain(
      "CHECK (surviving_donor_id <> merged_donor_id)",
    );
  });

  it("scopes idempotent constraint lookups to each target table", () => {
    for (const [tableName, constraintName] of [
      [
        "public.donor_merge_redirects",
        "donor_merge_redirects_merged_donor_same_tenant_fk",
      ],
      [
        "public.donor_merge_redirects",
        "donor_merge_redirects_surviving_donor_same_tenant_fk",
      ],
      [
        "public.donor_merge_candidates",
        "donor_merge_candidates_existing_donor_same_tenant_fk",
      ],
      [
        "public.donor_merge_candidates",
        "donor_merge_candidates_incoming_donor_same_tenant_fk",
      ],
      [
        "public.donor_merge_audit",
        "donor_merge_audit_surviving_donor_same_tenant_fk",
      ],
      [
        "public.donor_merge_audit",
        "donor_merge_audit_merged_donor_same_tenant_fk",
      ],
    ] as const) {
      expect(migrationSql).toMatch(
        scopedConstraintLookup(tableName, constraintName),
      );
    }
  });

  it("builds public.donors indexes concurrently for live deploy safety", () => {
    expect(migrationSql).not.toContain("donors_merged_into_donor_id_idx");
    expect(migrationSql).toContain(
      "CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS donors_tenant_id_id_uidx",
    );
    expect(migrationSql).toContain(
      "CREATE INDEX CONCURRENTLY IF NOT EXISTS donors_tenant_lower_email_idx",
    );
  });

  it("limits merge candidate confidence values to reviewable levels", () => {
    expect(migrationSql).toContain("CHECK (confidence IN ('possible', 'low'))");
    expect(migrationSql).not.toContain(
      "CHECK (confidence IN ('exact', 'high', 'possible', 'low', 'none'))",
    );
  });

  it("does not drop a composite donor index the forward migration may not own", () => {
    expect(rollbackSql).toContain("Keep donors_tenant_id_id_uidx");
    expect(rollbackSql).not.toContain(
      "DROP INDEX IF EXISTS public.donors_tenant_id_id_uidx",
    );
  });
});
