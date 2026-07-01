import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260611120000_contribution_correction_requests.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution correction request migration", () => {
  it("creates approval policy and correction request tables with safe access", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_approval_policies",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_correction_requests",
    );
    expect(migrationSql).toContain(
      "donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE",
    );
    expect(migrationSql).toContain(
      "applied_adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL",
    );
    expect(migrationSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_correction_requests_idempotency",
    );
    expect(migrationSql).toContain("WHERE idempotency_key IS NOT NULL");
    expect(migrationSql).toContain(
      "ALTER TABLE public.contribution_approval_policies ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "ALTER TABLE public.contribution_correction_requests ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.contribution_correction_requests FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT ALL ON TABLE public.contribution_correction_requests TO service_role",
    );
  });

  it("keeps pending request lookup indexed for approver queues", () => {
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_contribution_correction_requests_pending",
    );
    expect(migrationSql).toContain(
      "ON public.contribution_correction_requests (tenant_id, status, created_at)",
    );
    expect(migrationSql).toContain("WHERE status = 'pending'");
  });
});
