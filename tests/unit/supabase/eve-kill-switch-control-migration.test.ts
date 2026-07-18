import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718003127_eve_kill_switch_control.sql",
    import.meta.url,
  ),
  "utf8",
);

const switchKeys = [
  "all_automation",
  "active_runs",
  "github_actions",
  "production_writes",
  "sandbox_networking",
  "dynamic_workflows",
  "model_policy_changes",
  "force_approval",
] as const;

describe("Eve kill-switch control migration", () => {
  it("normalizes and constrains all eight app-owned switch values", () => {
    expect(migrationSql).toContain(
      "ADD CONSTRAINT eve_governance_state_kill_switch_shape_check",
    );
    for (const switchKey of switchKeys) {
      expect(migrationSql).toContain(`'${switchKey}'`);
      expect(migrationSql).toContain(
        `jsonb_typeof(kill_switch_state -> '${switchKey}') = 'boolean'`,
      );
    }
  });

  it("locks and version-checks the singleton before changing state", () => {
    expect(migrationSql).toContain("FOR UPDATE");
    expect(migrationSql).toContain(
      "current_state.state_version <> p_expected_state_version",
    );
    expect(migrationSql).toContain("state_version = state_version + 1");
  });

  it("updates state and appends an accountable audit event in one function", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.set_eve_kill_switch",
    );
    expect(migrationSql).toContain("UPDATE public.eve_governance_state");
    expect(migrationSql).toContain("INSERT INTO public.eve_audit_events");
    expect(migrationSql).toContain("'kill_switch.set'");
    expect(migrationSql).toContain("'eve-audit-v1'");
  });

  it("exposes the mutation only to the service role", () => {
    expect(migrationSql).toContain("SECURITY DEFINER");
    expect(migrationSql).toContain(
      "REVOKE ALL ON FUNCTION public.set_eve_kill_switch",
    );
    expect(migrationSql).toContain(") FROM PUBLIC, anon, authenticated;");
    expect(migrationSql).toContain(") TO service_role;");
  });
});
