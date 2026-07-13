import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260704120000_gift_receipt_records.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("gift receipt records migration", () => {
  it("creates durable receipt records without cascading donation deletes", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.gift_receipt_records",
    );
    expect(migrationSql).toContain(
      "donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE RESTRICT",
    );
    expect(migrationSql).not.toContain(
      "donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE",
    );
    expect(migrationSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS uq_gift_receipt_records_donation",
    );
    expect(migrationSql).toContain(
      "ON public.gift_receipt_records (donation_id)",
    );
    expect(migrationSql).toContain(
      "snapshot JSONB NOT NULL DEFAULT '{}'::jsonb",
    );
  });

  it("keeps receipt records server-only behind RLS", () => {
    expect(migrationSql).toContain(
      "ALTER TABLE public.gift_receipt_records ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.gift_receipt_records FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT ALL ON TABLE public.gift_receipt_records TO service_role",
    );
  });
});
