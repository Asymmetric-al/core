import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260718102000_eve_final_launch_verification.sql",
);
const sql = await readFile(migrationPath, "utf8");
const schemaDdl = sql.split("CREATE OR REPLACE FUNCTION")[0]!;

describe("Eve final launch verification migration", () => {
  it("ships with no permission grant and no release-enabling seed", () => {
    expect(sql).toContain("is_active BOOLEAN NOT NULL DEFAULT FALSE");
    expect(schemaDdl).not.toMatch(
      /INSERT INTO public\.eve_launch_permission_grants/i,
    );
    expect(schemaDdl).not.toMatch(/INSERT INTO public\.eve_governance_state/i);
  });

  it("requires dedicated permissions and two independent review roles", () => {
    expect(sql).toContain("'release.review', 'release.activate'");
    expect(sql).toContain("review_count < 2 OR review_role_count <> 2");
    expect(sql).toContain(
      "p_actor_profile_id = manifest.created_by_profile_id",
    );
    expect(sql).toContain("count(DISTINCT reviewer_role)");
    expect(sql).toContain("p_actor_role IS DISTINCT FROM 'super_admin'");
  });

  it("binds activation to immutable deployment and policy coordinates", () => {
    for (const field of [
      "p_content_hash",
      "p_deployment_id",
      "p_eval_config_revision",
      "p_migration_version",
      "p_model_policy_revision",
      "p_policy_version",
      "p_revision",
    ]) {
      expect(sql).toContain(field);
    }
    expect(sql).toContain("stale_eve_governance_state");
    expect(sql).toContain("eve_launch_target_mismatch");
    expect(sql).toContain("status = 'active' AND eval_status = 'passed'");
    expect(sql).toContain("policy_hash = p_model_policy_revision");
  });

  it("provides fail-closed emergency, canary, and retention paths", () => {
    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.set_eve_release_safety_control",
    );
    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.expire_eve_launch_canaries",
    );
    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.expire_eve_launch_manifests",
    );
    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.is_eve_launch_safe_text",
    );
    expect(sql).toContain("release_enabled = FALSE");
    expect(sql).toContain("emergency_off = TRUE");
    expect(sql).toContain("retention_holds");
  });

  it("keeps all launch state service-role-only with RLS enabled", () => {
    for (const table of [
      "eve_launch_permission_grants",
      "eve_launch_manifests",
      "eve_launch_reviews",
      "eve_launch_records",
    ]) {
      expect(sql).toContain(
        `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`,
      );
    }
    expect(sql).toContain(
      "REVOKE ALL ON TABLE public.eve_launch_permission_grants",
    );
  });
});
