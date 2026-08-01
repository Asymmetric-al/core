import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../../supabase/migrations/20260718093000_eve_email_discord_notifications.sql",
);

describe("Eve email and Discord notification migration", () => {
  it("persists no secrets and ships every channel off and paused", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("enabled BOOLEAN NOT NULL DEFAULT FALSE");
    expect(sql).toContain("paused BOOLEAN NOT NULL DEFAULT TRUE");
    expect(sql).toContain("safe_envelope JSONB NOT NULL");
    expect(sql).not.toContain("webhook_url");
    expect(sql).not.toContain("api_key");
  });

  it("enforces platform-owner recipients in the database", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("validate_eve_notification_recipient");
    expect(sql).toContain("role = 'super_admin'");
    expect(sql).toContain("eve_notification_platform_owner_required");
  });

  it("claims and completes attempts atomically as service role", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("claim_due_eve_notification_records");
    expect(sql).toContain("complete_eve_notification_attempt");
    expect(sql).toContain("FOR UPDATE OF record SKIP LOCKED");
    expect(sql).toContain("stale_eve_notification_lease");
    expect(sql).toContain("auth.role() <> 'service_role'");
  });

  it("registers bounded budget, retention, dedupe, and idempotency", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("'engineering.notification.deliver'");
    expect(sql).toContain("'expensive_feature', 'operator-notifications'");
    expect(sql).toContain("'notification_record', 180");
    expect(sql).toContain("expire_eve_notification_records");
    expect(sql).toContain("hold.scope_type = 'category'");
    expect(sql).toContain("UNIQUE (tenant_id, dedupe_key)");
    expect(sql).toContain("UNIQUE (tenant_id, idempotency_key)");
  });
});
