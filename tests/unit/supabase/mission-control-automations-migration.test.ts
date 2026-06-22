import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260526200500_mission_control_automations.sql",
    import.meta.url,
  ),
  "utf8",
);

const automationTables = [
  "mission_control_automation_rules",
  "mission_control_automation_rule_versions",
  "mission_control_automation_previews",
  "mission_control_automation_test_runs",
  "mission_control_automation_activity_logs",
] as const;

describe("mission control automations migration", () => {
  it("creates automation definition, preview, test-run, and activity tables", () => {
    for (const tableName of automationTables) {
      expect(migrationSql).toContain(
        `CREATE TABLE IF NOT EXISTS public.${tableName}`,
      );
    }
  });

  it("keeps automation access service-role only", () => {
    for (const tableName of automationTables) {
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

  it("indexes rule and activity queries used by the dashboard", () => {
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_mission_control_automation_rules_tenant_status",
    );
    expect(migrationSql).toContain(
      "ON public.mission_control_automation_rules (tenant_id, activation_status, updated_at DESC)",
    );
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_mission_control_automation_activity_tenant_rule",
    );
    expect(migrationSql).toContain(
      "ON public.mission_control_automation_activity_logs (tenant_id, rule_id, created_at DESC)",
    );
  });
});
