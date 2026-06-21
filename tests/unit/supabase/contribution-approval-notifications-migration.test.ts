import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260611150000_contribution_approval_notifications.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution approval notification migration", () => {
  it("creates tenant settings, profile preferences, and delivery records", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_settings",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_preferences",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.contribution_approval_notifications",
    );
    expect(migrationSql).toContain("UNIQUE (tenant_id, profile_id)");
    expect(migrationSql).toContain("UNIQUE (tenant_id, dedupe_key)");
  });

  it("links notifications to correction requests and tracks SLA timestamps", () => {
    expect(migrationSql).toContain(
      "correction_request_id UUID NOT NULL REFERENCES public.contribution_correction_requests(id) ON DELETE CASCADE",
    );
    expect(migrationSql).toContain(
      "ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ",
    );
    expect(migrationSql).toContain(
      "ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ",
    );
  });

  it("locks approval notification tables to service role access", () => {
    expect(migrationSql).toContain(
      "ALTER TABLE public.contribution_approval_notification_settings ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "ALTER TABLE public.contribution_approval_notifications ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.contribution_approval_notifications FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT ALL ON TABLE public.contribution_approval_notifications TO service_role",
    );
  });

  it("enforces tenant ownership for approval notification references", () => {
    for (const triggerName of [
      "enforce_contribution_approval_settings_tenant_refs",
      "enforce_contribution_approval_preferences_tenant_refs",
      "enforce_contribution_approval_notifications_tenant_refs",
    ]) {
      expect(migrationSql).toContain(`CREATE TRIGGER ${triggerName}`);
    }

    for (const referencedTable of [
      "public.profiles",
      "public.contribution_correction_requests",
    ]) {
      expect(migrationSql).toContain(`FROM ${referencedTable}`);
    }

    for (const mismatchMessage of [
      "contribution operation profile tenant mismatch",
      "contribution operation recipient profile tenant mismatch",
      "contribution operation updater profile tenant mismatch",
      "contribution operation correction request tenant mismatch",
    ]) {
      expect(migrationSql).toContain(mismatchMessage);
    }

    expect(migrationSql).toContain(
      "EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs()",
    );
  });

  it("indexes request lookups for approval workflow surfaces", () => {
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_contribution_approval_notifications_request",
    );
    expect(migrationSql).toContain(
      "ON public.contribution_approval_notifications (tenant_id, correction_request_id, created_at DESC)",
    );
  });
});
