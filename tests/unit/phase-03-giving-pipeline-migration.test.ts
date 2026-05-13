import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql",
    import.meta.url,
  ),
  "utf8",
);
const restExposureMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260513173739_expose_phase_03_service_tables_to_rest.sql",
    import.meta.url,
  ),
  "utf8",
);
const restDenyPolicyMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260513173938_add_phase_03_rest_visibility_deny_policies.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("phase 03 giving pipeline migration", () => {
  it("adds durable raw Stripe event and staged gift tables", () => {
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.stripe_raw_events",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.staged_gifts",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.staged_gift_allocations",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.donation_crm_links",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.giving_reconciliation_runs",
    );
  });

  it("adds Stripe event lock RPCs and keeps browser roles out of finance tables", () => {
    expect(migration).toContain("claim_stripe_raw_event");
    expect(migration).toContain("complete_stripe_raw_event");
    expect(migration).toContain("record_stripe_raw_event_failure");
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.stripe_raw_events FROM anon, authenticated",
    );
    expect(migration).toContain(
      "GRANT SELECT, INSERT, UPDATE ON TABLE public.staged_gifts TO service_role",
    );
  });

  it("keeps Phase 3 tables visible to the service-role REST client without adding browser RLS policies", () => {
    expect(restExposureMigration).toContain(
      "GRANT SELECT, INSERT, UPDATE ON TABLE public.staged_gifts TO authenticated",
    );
    expect(restExposureMigration).toContain(
      "GRANT SELECT, INSERT, UPDATE ON TABLE public.donation_crm_links TO authenticated",
    );
    expect(restDenyPolicyMigration).toContain(
      'CREATE POLICY "phase3 staged gifts deny authenticated"',
    );
    expect(restDenyPolicyMigration).toContain("USING (false)");
    expect(restDenyPolicyMigration).toContain("WITH CHECK (false)");
  });
});
