import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260710170000_contribution_refund_attempts.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution refund attempts migration", () => {
  it("creates a tenant-scoped replay ledger with one row per idempotency key", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_refund_attempts",
    );
    expect(migrationSql).toContain("UNIQUE (tenant_id, idempotency_key)");
    expect(migrationSql).toContain(
      "requested_amount BIGINT NOT NULL CHECK (requested_amount > 0)",
    );
    expect(migrationSql).toContain("state TEXT NOT NULL DEFAULT 'claimed'");
    expect(migrationSql).toContain("provider_outcome JSONB");
    expect(migrationSql).toContain("provider_reference_id TEXT");
    expect(migrationSql).toContain("finalized_at TIMESTAMPTZ");
    expect(migrationSql).toContain(
      "ON public.contribution_refund_attempts (donation_id)",
    );
  });

  it("enforces that the donation belongs to the attempt tenant", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.enforce_contribution_refund_attempt_tenant_ref()",
    );
    expect(migrationSql).toMatch(
      /FROM public\.donations\s+WHERE id = NEW\.donation_id\s+AND tenant_id = NEW\.tenant_id/,
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER enforce_contribution_refund_attempt_tenant_ref",
    );
    expect(migrationSql).toContain(
      "contribution refund attempt donation tenant mismatch",
    );
  });

  it("allows only the service role to read and mutate refund attempts", () => {
    expect(migrationSql).toContain(
      "ALTER TABLE public.contribution_refund_attempts ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.contribution_refund_attempts FROM PUBLIC, anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT SELECT, INSERT, UPDATE ON TABLE public.contribution_refund_attempts TO service_role",
    );
    expect(migrationSql).not.toContain(
      "GRANT ALL ON TABLE public.contribution_refund_attempts",
    );
  });
});
