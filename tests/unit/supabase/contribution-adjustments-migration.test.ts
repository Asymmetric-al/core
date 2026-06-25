import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const adjustmentSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260611100000_contribution_adjustments.sql",
    import.meta.url,
  ),
  "utf8",
);

const receiptDeliverySql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260611140000_contribution_receipt_delivery.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution adjustment migrations", () => {
  it("creates immutable adjustment records with idempotent retry support", () => {
    expect(adjustmentSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_adjustments",
    );
    expect(adjustmentSql).toContain(
      "donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE",
    );
    expect(adjustmentSql).toContain(
      "correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL",
    );
    expect(adjustmentSql).toContain(
      "effective_values JSONB NOT NULL DEFAULT '{}'::jsonb",
    );
    expect(adjustmentSql).toContain(
      "CHECK (status IN ('applied', 'reversed'))",
    );
    expect(adjustmentSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_adjustments_idempotency",
    );
    expect(adjustmentSql).toContain("WHERE idempotency_key IS NOT NULL");
    expect(adjustmentSql).toContain(
      "ALTER TABLE public.contribution_adjustments ENABLE ROW LEVEL SECURITY",
    );
    expect(adjustmentSql).toContain(
      "GRANT ALL ON TABLE public.contribution_adjustments TO service_role",
    );
  });

  it("creates receipt delivery policies and durable receipt snapshots", () => {
    expect(receiptDeliverySql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_receipt_delivery_policies",
    );
    expect(receiptDeliverySql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_receipt_snapshots",
    );
    expect(receiptDeliverySql).toContain(
      "adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL",
    );
    expect(receiptDeliverySql).toContain(
      "kind TEXT NOT NULL CHECK (kind IN ('email', 'pdf'))",
    );
    expect(receiptDeliverySql).toContain(
      "ALTER TABLE public.contribution_receipt_delivery_policies ENABLE ROW LEVEL SECURITY",
    );
    expect(receiptDeliverySql).toContain(
      "ALTER TABLE public.contribution_receipt_snapshots ENABLE ROW LEVEL SECURITY",
    );
    expect(receiptDeliverySql).toContain(
      "GRANT ALL ON TABLE public.contribution_receipt_snapshots TO service_role",
    );
  });
});
