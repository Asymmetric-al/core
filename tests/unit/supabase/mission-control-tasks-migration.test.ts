import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260526193000_mission_control_tasks.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("mission control tasks migration", () => {
  it("creates task, link, event, reminder, queue, and attention tables", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_queues",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_tasks",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_task_links",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_task_comments",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_task_reminders",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_task_events",
    );
    expect(migrationSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.mission_control_attention_items",
    );
  });

  it("keeps queue and attention writes idempotent by tenant", () => {
    expect(migrationSql).toContain("UNIQUE (tenant_id, key)");
    expect(migrationSql).toContain("UNIQUE (tenant_id, dedupe_key)");
  });

  it("locks task tables to service role access", () => {
    expect(migrationSql).toContain(
      "ALTER TABLE public.mission_control_tasks ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "ALTER TABLE public.mission_control_attention_items ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.mission_control_tasks FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.mission_control_attention_items FROM anon, authenticated",
    );
    expect(migrationSql).toContain(
      "GRANT ALL ON TABLE public.mission_control_tasks TO service_role",
    );
    expect(migrationSql).toContain(
      "GRANT ALL ON TABLE public.mission_control_attention_items TO service_role",
    );
  });

  it("indexes open task and attention queues for Mission Control dashboards", () => {
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_mission_control_tasks_tenant_status",
    );
    expect(migrationSql).toContain(
      "ON public.mission_control_tasks (tenant_id, status, urgency, updated_at DESC)",
    );
    expect(migrationSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_mission_control_attention_tenant_status",
    );
    expect(migrationSql).toContain(
      "ON public.mission_control_attention_items (tenant_id, status, urgency, last_seen_at DESC)",
    );
  });
});
