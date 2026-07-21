import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718015747_eve_approval_budget_policy.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("Eve approval and budget policy migration", () => {
  it("persists separate trust-zone policies and an app-owned action catalog", () => {
    expect(sql).toContain("CREATE TABLE public.eve_action_policy_catalog");
    expect(sql).toContain("CREATE TABLE public.eve_approval_policies");
    expect(sql).toContain("('engineering', 'allow')");
    expect(sql).toContain("('product_admin', 'require_approval')");
    expect(sql).toContain("('memory', 'require_approval')");
    expect(sql).toContain(
      "'product.donor.write', 'product_admin', 'business_data'",
    );
  });

  it("resolves classification and costs from persisted state rather than caller fields", () => {
    expect(sql).toContain(
      "SELECT * INTO action_row FROM public.eve_action_policy_catalog",
    );
    expect(sql).toContain("decision := 'deny'; reason := 'approval_required'");
    expect(sql).toContain("'deny', 'unknown_action'");
    expect(sql).toContain("action_row.request_cost");
  });

  it("accepts tenantless super admins without weakening tenant-bound actors", () => {
    expect(sql).toMatch(
      /WHERE id = p_actor_profile_id\s+AND \(tenant_id = p_tenant_id\s+OR \(tenant_id IS NULL AND role = 'super_admin'\)\)/,
    );
  });

  it("atomically reserves a deterministic window and pauses at hard ceilings", () => {
    expect(sql).toContain("UNIQUE (tenant_id, budget_id, window_started_at)");
    expect(sql).toContain(
      "ON CONFLICT (tenant_id, budget_id, window_started_at) DO NOTHING",
    );
    expect(sql).toContain("VALUES (p_tenant_id, budget_row.id, window_start)");
    expect(sql).toMatch(
      /SELECT \* INTO usage_row FROM public\.eve_budget_usage_windows\s+WHERE tenant_id = p_tenant_id\s+AND budget_id = budget_row\.id\s+AND window_started_at = window_start FOR UPDATE;/,
    );
    expect(sql).toContain("decision := 'pause'; reason := 'budget_exhausted'");
    expect(sql).toContain("UPDATE public.eve_budget_usage_windows SET");
  });

  it("requires dedicated permission and bounds emergency overrides to 24 hours", () => {
    expect(sql).toContain("'budget.emergency_override'");
    expect(sql).toContain("p_expires_at > NOW() + INTERVAL '24 hours'");
    expect(sql).toContain("p_additional_requests NOT BETWEEN 0 AND 1000");
    expect(sql).toContain("budget.emergency_override");
  });

  it("applies active emergency overrides only to their tenant", () => {
    expect(sql).toContain("active_override.tenant_id = p_tenant_id");
  });

  it("keeps browser roles out and makes decision plus audit one transaction", () => {
    expect(sql).toContain("FROM anon, authenticated");
    expect(sql).toContain("INSERT INTO public.eve_policy_decisions");
    expect(sql).toContain("append_eve_approval_budget_audit");
    expect(sql).not.toContain("TO authenticated;");
  });
});
