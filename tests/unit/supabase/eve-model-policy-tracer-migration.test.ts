import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718005737_eve_model_policy_tracer.sql",
    import.meta.url,
  ),
  "utf8",
);

function functionBody(name: string): string {
  const startMarker = `CREATE OR REPLACE FUNCTION public.${name}(`;
  const start = migrationSql.indexOf(startMarker);
  expect(start, `${name} should exist`).toBeGreaterThanOrEqual(0);

  const end = migrationSql.indexOf("\n$$;", start);
  expect(end, `${name} should have a complete body`).toBeGreaterThan(start);
  return migrationSql.slice(start, end + "\n$$;".length);
}

function blockedBranch(body: string): string {
  const start = body.indexOf("IF governance.emergency_off");
  expect(start).toBeGreaterThanOrEqual(0);

  const end = body.indexOf("END IF;", start);
  expect(end).toBeGreaterThan(start);
  return body.slice(start, end + "END IF;".length);
}

function occurrenceCount(value: string, search: string): number {
  return value.split(search).length - 1;
}

const mutations = [
  {
    name: "create_eve_model_policy_draft",
    action: "'model_policy.draft'",
    target: "'model_policy:platform'",
    blockedResult: "RETURN NULL;",
    successResult: "RETURN new_policy_id;",
    normalPathMarker: "IF p_actor_profile_id IS NULL",
    returnType: "RETURNS UUID",
  },
  {
    name: "evaluate_eve_model_policy_draft",
    action: "'model_policy.evaluate'",
    target: "'model_policy:' || p_policy_id",
    blockedResult: "RETURN FALSE;",
    successResult: "RETURN TRUE;",
    normalPathMarker: "IF p_eval_status NOT IN",
    returnType: "RETURNS BOOLEAN",
  },
  {
    name: "activate_eve_model_policy",
    action: "'model_policy.activate'",
    target: "'model_policy:' || p_policy_id",
    blockedResult: "RETURN FALSE;",
    successResult: "RETURN TRUE;",
    normalPathMarker:
      "PERFORM pg_advisory_xact_lock(hashtext('eve_model_policy:platform'));",
    returnType: "RETURNS BOOLEAN",
  },
  {
    name: "rollback_eve_model_policy",
    action: "'model_policy.rollback'",
    target: "'model_policy:' || p_expected_active_policy_id",
    blockedResult: "RETURN FALSE;",
    successResult: "RETURN TRUE;",
    normalPathMarker:
      "PERFORM pg_advisory_xact_lock(hashtext('eve_model_policy:platform'));",
    returnType: "RETURNS BOOLEAN",
  },
  {
    name: "create_eve_model_budget_override",
    action: "'model_policy.budget_override'",
    target: "p_scope_type || ':' || p_scope_id",
    blockedResult: "RETURN NULL;",
    successResult: "RETURN override_id;",
    normalPathMarker: "SELECT * INTO active_policy",
    returnType: "RETURNS UUID",
  },
] as const;

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

  it("locks and returns the persisted governance row without raising a blocked exception", () => {
    const guard = functionBody("assert_eve_model_policy_change_allowed");

    expect(guard).toContain("FOR SHARE");
    expect(guard).toContain("RAISE EXCEPTION 'missing_eve_governance_state'");
    expect(guard).toContain("RETURN governance;");
    expect(guard).not.toContain("eve_model_policy_changes_blocked");
  });

  it.each(mutations)(
    "audits a governance-blocked $name before returning its sentinel",
    ({
      action,
      blockedResult,
      name,
      normalPathMarker,
      returnType,
      successResult,
      target,
    }) => {
      const body = functionBody(name);
      const blocked = blockedBranch(body);

      expect(body).toContain(returnType);
      expect(body).toContain(
        "governance := public.assert_eve_model_policy_change_allowed();",
      );
      expect(blocked).toContain(
        "governance.kill_switch_state ->> 'all_automation'",
      );
      expect(blocked).toContain(
        "governance.kill_switch_state ->> 'model_policy_changes'",
      );
      expect(blocked).toContain(
        "PERFORM public.append_eve_model_policy_audit(",
      );
      expect(blocked).toContain("p_audit_id");
      expect(blocked).toContain("p_actor_id");
      expect(blocked).toContain("p_actor_profile_id");
      expect(blocked).toContain("p_actor_role");
      expect(blocked).toContain("p_tenant_id");
      expect(blocked).toContain("p_initiator_type");
      expect(blocked).toContain("p_initiator_id");
      expect(blocked).toContain("governance.state_version");
      expect(blocked).toContain("'governanceStateVersion'");
      expect(blocked).toContain(action);
      expect(blocked).toContain(target);
      expect(blocked).toContain("'blocked'");
      expect(blocked).toContain("'stateUnchanged', TRUE");
      expect(blocked).toContain("'policyMutationApplied', FALSE");
      expect(blocked).toContain("'overrideMutationApplied', FALSE");
      expect(blocked).toContain("'governanceMutationApplied', FALSE");
      expect(blocked).toContain(blockedResult);
      expect(occurrenceCount(blocked, "append_eve_model_policy_audit")).toBe(1);
      expect(blocked).not.toContain("INSERT INTO public.eve_model_policies");
      expect(blocked).not.toContain(
        "INSERT INTO public.eve_model_budget_overrides",
      );
      expect(blocked).not.toContain("UPDATE public.eve_model_policies");
      expect(blocked).not.toContain("UPDATE public.eve_governance_state");
      expect(blocked.indexOf("append_eve_model_policy_audit")).toBeLessThan(
        blocked.indexOf(blockedResult),
      );
      expect(body.indexOf(blockedResult)).toBeLessThan(
        body.indexOf(normalPathMarker),
      );
      expect(body).toContain(successResult);
      expect(occurrenceCount(body, "append_eve_model_policy_audit")).toBe(2);
    },
  );

  it("retains eval gates, optimistic concurrency, and domain failures", () => {
    expect(migrationSql).toContain(
      "current_active_id IS DISTINCT FROM p_expected_active_policy_id",
    );
    expect(migrationSql).toContain(
      "candidate.status <> 'evaluated' OR candidate.eval_status <> 'passed'",
    );
    expect(migrationSql).toContain("invalid_eve_model_policy_draft");
    expect(migrationSql).toContain("invalid_eve_model_policy_evaluation");
    expect(migrationSql).toContain("stale_eve_model_policy_evaluation");
    expect(migrationSql).toContain("stale_eve_active_model_policy");
    expect(migrationSql).toContain("missing_eve_model_policy");
    expect(migrationSql).toContain("eve_model_policy_eval_required");
    expect(migrationSql).toContain("eve_model_budget_override_limit_exceeded");
  });

  it("keeps browser roles out and exposes mutations only to service_role", () => {
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.eve_model_policies FROM anon, authenticated",
    );
    expect(migrationSql).not.toContain(
      "GRANT UPDATE ON TABLE public.eve_model_policies TO service_role",
    );

    for (const { name } of mutations) {
      expect(migrationSql).toMatch(
        new RegExp(
          `REVOKE ALL ON FUNCTION public\\.${name}\\([^;]+ FROM PUBLIC, anon, authenticated;`,
        ),
      );
      expect(migrationSql).toMatch(
        new RegExp(
          `GRANT EXECUTE ON FUNCTION public\\.${name}\\([^;]+ TO service_role;`,
        ),
      );
    }

    expect(migrationSql).not.toMatch(
      /GRANT EXECUTE ON FUNCTION public\.(?:create|evaluate|activate|rollback)_eve_model_[^(]+\([^;]+ TO (?:anon|authenticated)/,
    );
  });
});
