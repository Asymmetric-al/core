import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDir = join(process.cwd(), "supabase", "migrations");

function readNativePdfStudioMigration() {
  const migration = readdirSync(migrationsDir).find((file) =>
    file.endsWith("_native_pdf_studio_foundation.sql"),
  );

  if (!migration) {
    throw new Error("Native PDF Studio migration not found.");
  }

  return readFileSync(join(migrationsDir, migration), "utf8");
}

describe("native PDF Studio storage migration", () => {
  it("keeps pdf_templates as the root table and adds native engine state", () => {
    const sql = readNativePdfStudioMigration();

    expect(sql).toContain("ALTER TABLE public.pdf_templates");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS engine TEXT");
    expect(sql).toContain("'unlayer', 'asym_pdf_document_builder'");
    expect(sql).toContain(
      "ADD COLUMN IF NOT EXISTS native_schema_version INTEGER",
    );
    expect(sql).toContain(
      "ADD COLUMN IF NOT EXISTS native_template_current_draft_version_id UUID",
    );
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS migration_report JSONB");
    expect(sql).toContain("Generated HTML is not native source of truth.");
  });

  it("adds durable native version, render, artifact, audit, and batch tables", () => {
    const sql = readNativePdfStudioMigration();

    for (const tableName of [
      "public.pdf_template_versions",
      "public.pdf_template_renders",
      "public.pdf_template_artifacts",
      "public.pdf_template_audit_events",
      "public.pdf_template_batches",
      "public.pdf_template_batch_jobs",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${tableName}`);
      expect(sql).toContain(
        `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
      );
      expect(sql).toContain(`REVOKE ALL ON TABLE ${tableName} FROM anon`);
    }
  });

  it("preserves native history by withholding authenticated delete grants", () => {
    const sql = readNativePdfStudioMigration();

    expect(sql).toContain(
      "REVOKE DELETE ON TABLE public.pdf_templates FROM authenticated",
    );
    expect(sql).not.toMatch(
      /GRANT\s+SELECT,\s*INSERT,\s*UPDATE,\s*DELETE\s+ON TABLE public\.pdf_template_/i,
    );
    expect(sql).toContain("COMMENT ON TABLE public.pdf_template_audit_events");
  });

  it("uses staff-tenant RLS policies and service-role bypass for native tables", () => {
    const sql = readNativePdfStudioMigration();

    expect(sql).toContain("authz.has_staff_membership(tenant_id, NULL)");
    expect(sql).toContain('CREATE POLICY "pdf template versions service role"');
    expect(sql).toContain('CREATE POLICY "pdf template renders service role"');
    expect(sql).toContain('CREATE POLICY "pdf template batches service role"');
  });
});
