import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718005737_eve_model_policy_tracer.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("Eve model-policy tracer migration", () => {
  it("persists versioned policies, dedicated grants, and bounded overrides", () => {
    expect(migrationSql).toContain("CREATE TABLE public.eve_model_policies");
    expect(migrationSql).toContain(
      "CREATE TABLE public.eve_ai_settings_grants",
    );
    expect(migrationSql).toContain("CHECK (permission = 'ai.settings.manage')");
    expect(migrationSql).toContain(
      "CREATE TABLE public.eve_model_budget_overrides",
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER enforce_eve_ai_settings_grant_tenant",
    );
    expect(migrationSql).toContain(
      "eve_ai_settings_grant_profile_tenant_mismatch",
    );
    expect(migrationSql).toContain("INTERVAL '24 hours'");
    expect(migrationSql).toContain("p_additional_usd_micros > 100000000");
  });

  it("makes activation eval-gated, optimistic, atomic, and rollback-capable", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.activate_eve_model_policy",
    );
    expect(migrationSql).toContain(
      "current_active_id IS DISTINCT FROM p_expected_active_policy_id",
    );
    expect(migrationSql).toContain(
      "candidate.status <> 'evaluated' OR candidate.eval_status <> 'passed'",
    );
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.rollback_eve_model_policy",
    );
    expect(migrationSql).toContain("INSERT INTO public.eve_audit_events");
  });

  it("consumes persisted master and model-policy switches", () => {
    expect(migrationSql).toContain("FOR SHARE");
    expect(migrationSql).toContain("governance.emergency_off");
    expect(migrationSql).toContain(
      "governance.kill_switch_state ->> 'all_automation'",
    );
    expect(migrationSql).toContain(
      "governance.kill_switch_state ->> 'model_policy_changes'",
    );
  });

  it("keeps browser roles out and exposes mutations only to service_role", () => {
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.eve_model_policies FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT EXECUTE ON FUNCTION public.activate_eve_model_policy",
    );
    expect(migrationSql).toContain(
      "GRANT EXECUTE ON FUNCTION public.create_eve_model_budget_override(UUID, TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;",
    );
    expect(migrationSql).toContain(") TO service_role;");
    expect(migrationSql).not.toContain(
      "GRANT UPDATE ON TABLE public.eve_model_policies TO service_role",
    );
  });
});
