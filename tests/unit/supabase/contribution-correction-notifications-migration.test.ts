import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260611151000_contribution_correction_notifications.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution correction notifications migration", () => {
  it("creates Email Studio bindings, notification settings, and notification events", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.email_template_system_bindings",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_notification_settings",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_notification_events",
    );
    expect(migrationSql).toContain(
      "UNIQUE (tenant_id, family_key, variant_key)",
    );
    expect(migrationSql).toContain("idempotency_key TEXT NOT NULL");
    expect(migrationSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_notification_events_idempotency",
    );
  });

  it("locks notification tables to service role access", () => {
    for (const table of [
      "email_template_system_bindings",
      "contribution_notification_settings",
      "contribution_notification_events",
    ]) {
      expect(migrationSql).toContain(
        `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`,
      );
      expect(migrationSql).toContain(
        `REVOKE ALL ON TABLE public.${table} FROM anon, authenticated`,
      );
      expect(migrationSql).toContain(
        `GRANT ALL ON TABLE public.${table} TO service_role`,
      );
    }
  });

  it("enforces tenant ownership for notification references", () => {
    for (const triggerName of [
      "enforce_email_template_system_bindings_tenant_refs",
      "enforce_contribution_notification_settings_tenant_refs",
      "enforce_contribution_notification_events_tenant_refs",
    ]) {
      expect(migrationSql).toContain(`CREATE TRIGGER ${triggerName}`);
    }

    for (const referencedTable of [
      "public.profiles",
      "public.email_templates",
      "public.email_template_versions",
      "public.contribution_operation_audit_events",
      "public.contribution_corrections",
      "public.donors",
    ]) {
      expect(migrationSql).toContain(`FROM ${referencedTable}`);
    }

    for (const mismatchMessage of [
      "contribution notification updater profile tenant mismatch",
      "contribution notification template tenant mismatch",
      "contribution notification template version tenant mismatch",
      "contribution notification audit event tenant mismatch",
      "contribution notification correction tenant mismatch",
      "contribution notification donor tenant mismatch",
    ]) {
      expect(migrationSql).toContain(mismatchMessage);
    }
  });
});
