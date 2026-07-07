import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260704140000_donor_matching_merge_candidates.sql",
    import.meta.url,
  ),
  "utf8",
);

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
    expect(migrationSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS donors_tenant_id_id_uidx",
    );
    expect(migrationSql).toContain(
      "FOREIGN KEY (tenant_id, merged_into_donor_id)",
    );
    expect(migrationSql).toContain(
      "FOREIGN KEY (tenant_id, existing_donor_id)",
    );
    expect(migrationSql).toContain(
      "FOREIGN KEY (tenant_id, incoming_donor_id)",
    );
    expect(migrationSql).toContain(
      "FOREIGN KEY (tenant_id, surviving_donor_id)",
    );
    expect(migrationSql).toContain("FOREIGN KEY (tenant_id, merged_donor_id)");
    expect(migrationSql).toContain("REFERENCES public.donors (tenant_id, id)");
  });
});
