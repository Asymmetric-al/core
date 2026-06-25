import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationsDir = new URL("../../../supabase/migrations/", import.meta.url);

function readMigration(filename: string) {
  return readFileSync(new URL(filename, migrationsDir), "utf8");
}

const crmLinksSql = readMigration(
  "20260611155000_crm_links_parent_child_scope.sql",
);
const tablePreferencesSql = readMigration(
  "20260611160000_crm_table_preferences.sql",
);
const namedViewsSql = readMigration("20260611170000_crm_table_named_views.sql");

describe("CRM table preference migrations", () => {
  it("keeps Supabase migration versions unique", () => {
    const versions = readdirSync(migrationsDir)
      .filter((filename) => /^\d+_.*\.sql$/.test(filename))
      .map((filename) => filename.split("_")[0]);

    expect(new Set(versions).size).toBe(versions.length);
  });

  it("adds parent and designation scope fields to CRM link records", () => {
    expect(crmLinksSql).toContain("ALTER TABLE public.donation_crm_links");
    expect(crmLinksSql).toContain("ADD COLUMN IF NOT EXISTS scope TEXT");
    expect(crmLinksSql).toContain("CHECK (scope IN ('parent', 'designation'))");
    expect(crmLinksSql).toContain(
      "ADD COLUMN IF NOT EXISTS allocation_id UUID",
    );
    expect(crmLinksSql).toContain(
      "REFERENCES public.staged_gift_allocations(id) ON DELETE CASCADE",
    );
    expect(crmLinksSql).toContain("ADD COLUMN IF NOT EXISTS last_error TEXT");
    expect(crmLinksSql).toContain(
      "donation_crm_links_designation_allocation_check",
    );
    expect(crmLinksSql).toContain(
      "CHECK (scope <> 'designation' OR allocation_id IS NOT NULL)",
    );
    expect(crmLinksSql).toContain(
      "DROP INDEX IF EXISTS public.idx_donation_crm_links_donation_record",
    );
    expect(crmLinksSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_record",
    );
    expect(crmLinksSql).toContain("AND scope = 'parent'");
    expect(crmLinksSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_designation_record",
    );
    expect(crmLinksSql).toContain("AND allocation_id IS NOT NULL");
    expect(crmLinksSql).toContain("AND scope = 'designation'");
    expect(crmLinksSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_staged_gift",
    );
    expect(crmLinksSql).toContain(
      "ON public.donation_crm_links (tenant_id, staged_gift_id, crm_provider)",
    );
    expect(crmLinksSql).toContain("WHERE staged_gift_id IS NOT NULL");
    expect(crmLinksSql).toContain("idx_donation_crm_links_donation_scope");
  });

  it("deduplicates parent staged gift links before adding the singleton index", () => {
    expect(crmLinksSql).toContain("ranked_parent_staged_gift_links");
    expect(crmLinksSql).toContain(
      "PARTITION BY tenant_id, staged_gift_id, crm_provider",
    );
    expect(crmLinksSql).toContain("duplicate_parent_staged_gift_links");
    expect(crmLinksSql).toContain("SET staged_gift_id = NULL");
    expect(crmLinksSql).toContain("link_status = 'archived'");
    expect(crmLinksSql).toContain("'archivedDuplicateStagedGiftId'");
    expect(
      crmLinksSql.indexOf("duplicate_parent_staged_gift_links"),
    ).toBeLessThan(
      crmLinksSql.indexOf(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_staged_gift",
      ),
    );
  });

  it("creates server-only CRM table preference records and audit events", () => {
    for (const tableName of [
      "public.crm_table_user_preferences",
      "public.crm_table_tenant_defaults",
      "public.crm_table_preference_audit_events",
    ]) {
      expect(tablePreferencesSql).toContain(
        `CREATE TABLE IF NOT EXISTS ${tableName}`,
      );
      expect(tablePreferencesSql).toContain(
        `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
      );
      expect(tablePreferencesSql).toContain(
        `REVOKE ALL ON TABLE ${tableName} FROM anon, authenticated`,
      );
      expect(tablePreferencesSql).toContain(
        `GRANT ALL ON TABLE ${tableName} TO service_role`,
      );
    }

    expect(tablePreferencesSql).toContain(
      "UNIQUE (tenant_id, profile_id, table_id)",
    );
    expect(tablePreferencesSql).toContain("UNIQUE (tenant_id, table_id)");
    expect(tablePreferencesSql).toContain(
      "idx_crm_table_preference_audit_tenant",
    );
  });

  it("creates service-role-only RPCs for atomic table preference mutations", () => {
    for (const functionName of [
      "public.apply_crm_view_settings_patch",
      "public.save_crm_user_table_preference",
      "public.save_crm_tenant_table_default",
    ]) {
      expect(tablePreferencesSql).toContain(
        `CREATE OR REPLACE FUNCTION ${functionName}`,
      );
      expect(tablePreferencesSql).toContain(
        `REVOKE ALL ON FUNCTION ${functionName}`,
      );
      expect(tablePreferencesSql).toContain(
        `GRANT EXECUTE ON FUNCTION ${functionName}`,
      );
    }

    expect(tablePreferencesSql).toContain(
      "public.apply_crm_view_settings_patch(",
    );
    expect(tablePreferencesSql).toContain(
      "ON CONFLICT (tenant_id, profile_id, table_id)",
    );
    expect(tablePreferencesSql).toContain("pg_advisory_xact_lock(");
    expect(tablePreferencesSql).toContain(
      "INSERT INTO public.crm_table_preference_audit_events",
    );
    expect(tablePreferencesSql).toContain(
      "p_actor_can_manage_defaults BOOLEAN",
    );
    expect(tablePreferencesSql).toContain("delegatedManagerProfileIds");
    expect(tablePreferencesSql).toContain("USING ERRCODE = '42501'");
  });

  it("creates personal named views with one default per user and table", () => {
    expect(namedViewsSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.crm_table_named_views",
    );
    expect(namedViewsSql).toContain(
      "UNIQUE (tenant_id, profile_id, table_id, name)",
    );
    expect(namedViewsSql).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_table_named_views_default",
    );
    expect(namedViewsSql).toContain("WHERE is_default");
    expect(namedViewsSql).toContain(
      "ALTER TABLE public.crm_table_named_views ENABLE ROW LEVEL SECURITY",
    );
    expect(namedViewsSql).toContain(
      "REVOKE ALL ON TABLE public.crm_table_named_views FROM anon, authenticated",
    );
    expect(namedViewsSql).toContain(
      "GRANT ALL ON TABLE public.crm_table_named_views TO service_role",
    );
  });

  it("creates service-role-only RPCs for atomic named-view mutations", () => {
    for (const functionName of [
      "public.create_crm_table_named_view",
      "public.update_crm_table_named_view",
      "public.delete_crm_table_named_view",
    ]) {
      expect(namedViewsSql).toContain(
        `CREATE OR REPLACE FUNCTION ${functionName}`,
      );
      expect(namedViewsSql).toContain(`REVOKE ALL ON FUNCTION ${functionName}`);
      expect(namedViewsSql).toContain(
        `GRANT EXECUTE ON FUNCTION ${functionName}`,
      );
    }

    expect(namedViewsSql).toContain("SECURITY DEFINER");
    expect(namedViewsSql).toContain("SET search_path = public");
    expect(namedViewsSql).toContain("FOR UPDATE");
    expect(namedViewsSql).toContain(
      "CREATE OR REPLACE FUNCTION public.save_crm_user_table_preference",
    );
    expect(namedViewsSql).toContain("v_settings_patch ? 'activeViewId'");
    expect(namedViewsSql).toContain("v_active_view_id !~*");
    expect(namedViewsSql).toContain("Active named view id must be a UUID.");
    expect(namedViewsSql).toContain("id = v_active_view_id::UUID");
    expect(namedViewsSql).toContain("FOR KEY SHARE");
    expect(namedViewsSql).toContain("USING ERRCODE = 'P0002'");
    expect(namedViewsSql).toContain("public.apply_crm_view_settings_patch(");
    expect(namedViewsSql).toContain(
      "RETURN jsonb_build_object('deleted', FALSE, 'reason', 'view_not_found')",
    );
    expect(namedViewsSql).toContain("UPDATE public.crm_table_user_preferences");
    expect(namedViewsSql).toContain(
      "jsonb_build_object('activeViewId', p_next_default_view_id)",
    );
    expect(namedViewsSql).toContain("settings ->> 'activeViewId' = p_view_id");
    expect(namedViewsSql).toMatch(
      /IF p_next_default_view_id IS NOT NULL\s+AND v_deleted\.is_default THEN/,
    );
    expect(namedViewsSql).toMatch(
      /'promoted',\s+p_next_default_view_id IS NOT NULL\s+AND v_deleted\.is_default/,
    );
  });
});
