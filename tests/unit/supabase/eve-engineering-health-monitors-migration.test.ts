import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../../supabase/migrations/20260718083000_eve_engineering_health_monitors.sql",
);

describe("Eve engineering health monitor migration", () => {
  it("persists the exact six-type registry off and paused by default", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain(
      "CREATE TABLE public.eve_engineering_monitor_configs",
    );
    expect(sql).toContain("enabled BOOLEAN NOT NULL DEFAULT FALSE");
    expect(sql).toContain("paused BOOLEAN NOT NULL DEFAULT TRUE");
    expect(sql).toContain("schedule = '*/5 * * * *'");
    for (const type of [
      "ci_failure",
      "stale_pull_request",
      "failing_eval",
      "dependency_security_alert",
      "protected_area_pull_request",
      "budget_rate_limit",
    ]) {
      expect(sql).toContain(`'${type}'`);
    }
    expect(sql).not.toContain("product_opportunity");
  });

  it("claims due schedules atomically with service-only leases", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("claim_due_eve_engineering_monitors");
    expect(sql).toContain("FOR UPDATE SKIP LOCKED");
    expect(sql).toContain("auth.role() <> 'service_role'");
    expect(sql).toContain("stale_eve_engineering_monitor_lease");
    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("TO service_role");
  });

  it("deduplicates safe findings inside the tenant and validates run ownership", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("UNIQUE (tenant_id, dedupe_key)");
    expect(sql).toContain("ON CONFLICT (tenant_id, dedupe_key) DO UPDATE");
    expect(sql).toContain("eve_engineering_monitor_run_mismatch");
    expect(sql).toContain(
      "safe_evidence ->> 'repository' = 'Asymmetric-al/core'",
    );
    expect(sql).toContain("octet_length(safe_evidence::TEXT) <= 16384");
  });

  it("registers monitor collection under the active-runs budget boundary", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("'engineering.monitor.collect'");
    expect(sql).toContain("'active_runs'");
    expect(sql).toContain("'expensive_feature', 'engineering-health-monitors'");
  });
});
