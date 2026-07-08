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
  it("keeps merge candidate and audit tables server-only behind RLS", () => {
    for (const tableName of ["donor_merge_candidates", "donor_merge_audit"]) {
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
      "merged_into_donor_id",
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

  it("blocks donors from redirecting to themselves", () => {
    expect(migrationSql).toContain("donors_merged_into_not_self_check");
    expect(migrationSql).toContain(
      "CHECK (merged_into_donor_id IS NULL OR merged_into_donor_id <> id)",
    );
    expect(rollbackSql).toContain(
      "DROP CONSTRAINT IF EXISTS donors_merged_into_not_self_check",
    );
  });

  it("keeps donor merge redirect and timestamp fields consistent", () => {
    expect(migrationSql).toContain("donors_merge_timestamp_consistency_check");
    expect(migrationSql).toContain(
      "(merged_into_donor_id IS NULL AND merged_at IS NULL)",
    );
    expect(migrationSql).toContain(
      "(merged_into_donor_id IS NOT NULL AND merged_at IS NOT NULL)",
    );
    expect(rollbackSql).toContain(
      "DROP CONSTRAINT IF EXISTS donors_merge_timestamp_consistency_check",
    );
  });

  it("scopes idempotent constraint lookups to each target table", () => {
    for (const [tableName, constraintName] of [
      ["public.donors", "donors_merged_requires_tenant_check"],
      ["public.donors", "donors_merged_into_same_tenant_fk"],
      ["public.donors", "donors_merged_into_not_self_check"],
      ["public.donors", "donors_merge_timestamp_consistency_check"],
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
    expect(migrationSql).toContain(
      "CREATE INDEX CONCURRENTLY IF NOT EXISTS donors_merged_into_donor_id_idx",
    );
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
