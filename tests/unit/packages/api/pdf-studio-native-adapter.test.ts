import { describe, expect, it } from "vitest";

import {
  createCorePdfSecurityContext,
  createCorePdfStudioAdapter,
  createNativePdfStudioMigrationReport,
  mapCoreCategoryToNativeCategory,
  mapNativeCategoryToCoreCategory,
} from "../../../../packages/api/src/pdf-templates/native-adapter";

import { starterPdfTemplateFixtureByCategory } from "@asym/pdf-template-schema";

const auth = {
  profileId: "profile_1",
  role: "admin" as const,
  tenantId: "tenant_1",
  userId: "user_1",
};

describe("core native PDF Studio adapter", () => {
  it("maps core legacy category aliases to native package categories", () => {
    expect(mapCoreCategoryToNativeCategory("annual_statement")).toBe(
      "annual_giving_statement",
    );
    expect(mapCoreCategoryToNativeCategory("letter")).toBe("donor_letter");
    expect(mapCoreCategoryToNativeCategory("report")).toBe("financial_report");
    expect(mapCoreCategoryToNativeCategory("missionary_report")).toBe(
      "missionary_report",
    );
    expect(mapNativeCategoryToCoreCategory("financial_report")).toBe("report");
  });

  it("runs package preflight and browser preview through the adapter", async () => {
    const fixture = starterPdfTemplateFixtureByCategory.donation_receipt;
    const adapter = createCorePdfStudioAdapter({
      auth,
      env: {
        PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
        PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_preview",
      },
    });

    const result = await adapter.previewTemplate({
      context: createCorePdfSecurityContext(auth),
      dataContext: fixture.sampleData,
      previewId: "native-adapter-preview",
      template: fixture.template,
    });

    expect(result.authorization.ok).toBe(true);
    expect(result.preflight.ok).toBe(true);
    expect(result.preview.status).toBe("success");
    expect(result.preview.metadata.finalPdfFidelity).toBe(false);
  });

  it("fails closed when official rendering is enabled but DocRaptor is not configured", async () => {
    const fixture = starterPdfTemplateFixtureByCategory.donation_receipt;
    const adapter = createCorePdfStudioAdapter({
      auth,
      env: {
        PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
        PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_render_test",
      },
    });

    const result = await adapter.renderTemplate({
      context: createCorePdfSecurityContext(auth),
      dataContext: fixture.sampleData,
      renderId: "render_missing_docraptor",
      template: fixture.template,
    });

    expect(result.authorization.ok).toBe(true);
    expect(result.preflight.ok).toBe(true);
    expect(result.render).toMatchObject({
      renderer: "docraptor",
      status: "error",
    });
    expect(result.render.errors[0]?.code).toBe("docraptor_not_configured");
    expect(JSON.stringify(result.render)).not.toContain("docraptor-secret");
  });

  it("creates manual Unlayer rebuild reports instead of claiming conversion", () => {
    const report = createNativePdfStudioMigrationReport({
      createdAt: "2026-05-15T00:00:00.000Z",
      createdByActorId: "user_1",
      row: {
        category: "report",
        design: { body: { rows: [] } },
        html: "<div>Legacy</div>",
        id: "6ff7cd0e-ad92-455f-9bfc-6da56ce7ff6d",
        name: "Legacy report",
        tenant_id: "tenant_1",
      },
      unsupportedFeatures: [
        {
          code: "raw_html_block",
          message: "Legacy raw HTML must be rebuilt manually.",
          severity: "warning",
        },
      ],
    });

    expect(report).toMatchObject({
      status: "needs_manual_rebuild",
      strategy: "manual_rebuild_with_report",
      targetEngine: "asym_pdf_document_builder",
      unsupportedFeatureCount: 1,
    });
    expect(report.legacyTemplate.category).toBe("financial_report");
    expect(report.metadata).toMatchObject({
      manualRebuildRequired: true,
      source: "core_pdf_studio",
    });
  });
});
