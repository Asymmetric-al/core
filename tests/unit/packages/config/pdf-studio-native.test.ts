import { describe, expect, it } from "vitest";

import {
  PDF_STUDIO_NATIVE_BUILDER_FLAG_NAME,
  resolvePDFStudioNativeBuilderConfig,
  resolvePDFStudioNativeFeatureFlagContract,
} from "../../../../packages/config/pdf-studio-native";

describe("native PDF Studio config", () => {
  it("keeps the native builder disabled and Unlayer fallback enabled by default", () => {
    const config = resolvePDFStudioNativeBuilderConfig({});

    expect(config.enabled).toBe(false);
    expect(config.rolloutMode).toBe("legacy_only");
    expect(config.legacyFallbackEnabled).toBe(true);
    expect(config.browserPreviewIsAuthoringFeedbackOnly).toBe(true);
    expect(config.productionRenderingEnabled).toBe(false);
    expect(config.docraptor.configured).toBe(false);
    expect(config.docraptor.missing).toEqual([]);
  });

  it("parses rollout, tenant, category, and DocRaptor boundaries without serializing secrets", () => {
    const config = resolvePDFStudioNativeBuilderConfig({
      DOCRAPTOR_API_KEY: "docraptor-secret",
      PDF_STUDIO_DOCRAPTOR_MODE: "production",
      PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS: "45000",
      PDF_STUDIO_NATIVE_BUILDER_CATEGORIES:
        "missionary_report, invoice, unsupported",
      PDF_STUDIO_NATIVE_BUILDER_ENABLED: "true",
      PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_render_test",
      PDF_STUDIO_NATIVE_BUILDER_TENANTS: "tenant_a, tenant_b",
      PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET: "callback-secret",
      PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL:
        "https://admin.example.test/api/pdf/render-callback",
      PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS: "1200",
      PDF_STUDIO_RENDER_BASE_URL: "https://admin.example.test",
    });

    expect(config.enabled).toBe(true);
    expect(config.rolloutMode).toBe("native_render_test");
    expect(config.packageRolloutMode).toBe("native_preview");
    expect(config.tenantAllowlist).toEqual(["tenant_a", "tenant_b"]);
    expect(config.categoryAllowlist).toEqual(["missionary_report", "invoice"]);
    expect(config.productionRenderingEnabled).toBe(true);
    expect(config.docraptor).toMatchObject({
      assetUrlTtlSeconds: 1200,
      callbackConfigured: true,
      configured: true,
      mode: "production",
      renderBaseUrl: "https://admin.example.test",
      timeoutMs: 45000,
    });
    expect(JSON.stringify(config)).not.toContain("docraptor-secret");
    expect(JSON.stringify(config)).not.toContain("callback-secret");
  });

  it("reports missing provider config only when a native production renderer mode is enabled", () => {
    const config = resolvePDFStudioNativeBuilderConfig({
      PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
      PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_publish",
    });

    expect(config.productionRenderingEnabled).toBe(true);
    expect(config.docraptor.configured).toBe(false);
    expect(config.docraptor.missing).toEqual([
      "DOCRAPTOR_API_KEY",
      "PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET",
      "PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL",
    ]);
  });

  it("resolves a package-compatible feature flag contract with tenant and category allowlists", () => {
    const enabled = resolvePDFStudioNativeFeatureFlagContract({
      category: "missionary_report",
      tenantId: "tenant_a",
      env: {
        PDF_STUDIO_NATIVE_BUILDER_CATEGORIES: "missionary_report",
        PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
        PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_default",
        PDF_STUDIO_NATIVE_BUILDER_TENANTS: "tenant_a",
      },
    });
    const disabled = resolvePDFStudioNativeFeatureFlagContract({
      category: "tax_receipt",
      tenantId: "tenant_b",
      env: {
        PDF_STUDIO_NATIVE_BUILDER_CATEGORIES: "missionary_report",
        PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
        PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_default",
        PDF_STUDIO_NATIVE_BUILDER_TENANTS: "tenant_a",
      },
    });

    expect(enabled).toMatchObject({
      enabled: true,
      fallbackEngine: "unlayer",
      flagName: PDF_STUDIO_NATIVE_BUILDER_FLAG_NAME,
      rolloutMode: "native_new_templates",
      tenantId: "tenant_a",
    });
    expect(disabled.enabled).toBe(false);
    expect(disabled.fallbackEngine).toBe("unlayer");
  });
});
