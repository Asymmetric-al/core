import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../../supabase/migrations/20260718074651_eve_dynamic_workflow_policy.sql",
);
const activeRunsGuardPath = path.resolve(
  import.meta.dirname,
  "../../../supabase/migrations/20260802064726_eve_runtime_active_runs_guard.sql",
);

describe("Eve dynamic workflow policy migration", () => {
  it("registers dynamic workflow actions and a separate bounded budget", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("'engineering.dynamic_workflow.execute'");
    expect(sql).toContain("'engineering.subagent.delegate'");
    expect(sql).toContain("'dynamic_workflows'");
    expect(sql).toContain("'dynamic_workflow', 'orchestration', 120");
  });

  it("binds service consultations to durable session ownership", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("consult_eve_runtime_budget_policy");
    expect(sql).toContain("FROM public.eve_session_ownership");
    expect(sql).toContain("owner_actor_id = p_actor_id");
    expect(sql).toContain("tenant_id = p_tenant_id");
    expect(sql).toContain("eve_runtime_session_identity_mismatch");
    expect(sql).toContain("eve_dynamic_action_requires_runtime_session");
    expect(sql).toContain("consult_eve_approval_budget_policy_legacy");
    expect(sql).not.toContain("p_identity_mode");
    expect(sql).not.toContain("p_governance_domain");
  });

  it("checks the catalog-owned domain and consumes budget atomically", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain(
      "governance.kill_switch_state ->> action_row.governance_domain",
    );
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain(
      "ON CONFLICT (budget_id, window_started_at) DO NOTHING",
    );
    expect(sql).toContain(
      "used_requests = used_requests + action_row.request_cost",
    );
  });

  it("checks active_runs independently before runtime budget consumption", async () => {
    const sql = await readFile(activeRunsGuardPath, "utf8");

    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.consult_eve_runtime_budget_policy",
    );
    expect(sql).toContain("governance.kill_switch_state ->> 'active_runs'");
    expect(sql).toContain(
      "governance.kill_switch_state ->> action_row.governance_domain",
    );
    expect(sql).toContain(
      "used_requests = used_requests + action_row.request_cost",
    );

    const activeRunsCheck = sql.indexOf(
      "governance.kill_switch_state ->> 'active_runs'",
    );
    const budgetConsumption = sql.indexOf(
      "used_requests = used_requests + action_row.request_cost",
    );
    expect(activeRunsCheck).toBeGreaterThan(-1);
    expect(budgetConsumption).toBeGreaterThan(activeRunsCheck);
    expect(sql).toContain("tenant_id, budget_id, window_started_at");
    expect(sql).toContain("p_tenant_id, budget_row.id, window_start");
    expect(sql).toContain(
      "ON CONFLICT (tenant_id, budget_id, window_started_at) DO NOTHING",
    );
    expect(sql).toContain("WHERE tenant_id = p_tenant_id");
    expect(sql).toContain(
      "WHERE tenant_id = p_tenant_id\n          AND id = usage_row.id",
    );
  });

  it("records unclassified actions and missing budgets truthfully", async () => {
    const sql = await readFile(activeRunsGuardPath, "utf8");

    expect(sql).toContain("reason := 'unknown_action'");
    expect(sql).toContain("reason := 'budget_not_configured'");
    expect(sql.match(/reason := 'budget_exhausted'/gu)).toHaveLength(1);
    expect(sql).toContain("COALESCE(resolved_trust_zone, 'unclassified')");
    expect(sql).toContain("COALESCE(resolved_write_class, 'unclassified')");
    expect(sql).toMatch(
      /trust_zone IN \(\s*'engineering', 'product_admin', 'memory', 'unclassified'\s*\)/u,
    );
    expect(sql).toContain(
      "write_class IN ('operational', 'business_data', 'unclassified')",
    );
    expect(sql).not.toContain("resolved_trust_zone TEXT := 'product_admin'");
    expect(sql).not.toContain("resolved_write_class TEXT := 'business_data'");
  });

  it("persists a service-safe decision and redacted audit in one function", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("INSERT INTO public.eve_policy_decisions");
    expect(sql).toContain("INSERT INTO public.eve_audit_events");
    expect(sql).toContain("ownership.identity_mode");
    expect(sql).toContain("dynamic_workflow.policy_consult");
    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("TO service_role");
  });
});
