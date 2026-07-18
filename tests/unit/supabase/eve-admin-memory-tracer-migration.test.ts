import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718013531_eve_admin_memory_tracer.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("Eve admin-memory migration", () => {
  it("stores owner-bound entries, immutable history, category settings, and search", () => {
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_entries");
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_history");
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_settings");
    expect(sql).toContain("TSVECTOR GENERATED ALWAYS AS");
    expect(sql).toContain("UNIQUE (entry_id, version)");
    expect(sql).toContain("owner_profile_id = p_actor_profile_id");
  });

  it("keeps tenant operational memory schema-only and enforces exclusions on writes", () => {
    expect(sql).toContain(
      "scope_type IN ('admin_private', 'tenant_operational')",
    );
    expect(sql).toContain("eve_tenant_operational_memory_disabled");
    expect(sql).toContain("contains_eve_admin_memory_exclusion");
    expect(sql).toContain("eve_admin_memory_excluded");
  });

  it("gates auto-save, supports disable without deletion, and audits mutations atomically", () => {
    expect(sql).toContain("p_source = 'auto_save'");
    expect(sql).toContain("NOT governance.release_enabled");
    expect(sql).toContain("eve_admin_memory_auto_save_disabled");
    expect(sql).toContain("append_eve_admin_memory_audit");
    expect(sql).toContain(
      "ON CONFLICT (tenant_id, owner_profile_id, category) DO UPDATE",
    );
  });

  it("gives browser roles neither table nor mutation-function access", () => {
    expect(sql).toContain(
      "REVOKE ALL ON TABLE public.eve_admin_memory_entries FROM anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.create_eve_admin_memory",
    );
    expect(sql).not.toContain("TO authenticated;");
  });
});
