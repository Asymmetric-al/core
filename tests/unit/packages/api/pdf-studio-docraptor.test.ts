import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  getPdfStudioDocRaptorClient,
  loadPdfStudioDocRaptorPreviewModule,
  resolvePdfStudioDocRaptorRuntime,
} from "../../../../packages/api/src/pdf-templates/docraptor";

describe("PDF Studio DocRaptor server boundary", () => {
  it("does not require provider credentials when native production rendering is disabled", async () => {
    const runtime = resolvePdfStudioDocRaptorRuntime({});
    const client = await getPdfStudioDocRaptorClient({
      env: {},
    });

    expect(runtime).toMatchObject({
      callbackConfigured: false,
      configured: false,
      missing: [],
      mode: "test",
      productionRenderingEnabled: false,
    });
    expect(client).toBeUndefined();
    expect(JSON.stringify(runtime)).not.toContain("DOCRAPTOR_API_KEY");
  });

  it("creates the DocRaptor client lazily only when a server key is present", async () => {
    const client = await getPdfStudioDocRaptorClient({
      env: {
        DOCRAPTOR_API_KEY: "docraptor-secret",
        PDF_STUDIO_NATIVE_BUILDER_ENABLED: true,
        PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: "native_render_test",
        PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET: "callback-secret",
        PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL:
          "https://admin.example.test/api/pdf/render-callback",
      },
      fetch: async () =>
        new Response(new Uint8Array([37, 80, 68, 70]), {
          headers: {
            "content-type": "application/pdf",
          },
        }),
    });

    expect(client).toBeDefined();
    expect(typeof client?.renderSync).toBe("function");
  });

  it("keeps DocRaptor and production preview imports behind server-only dynamic imports", async () => {
    const source = readFileSync(
      new URL(
        "../../../../packages/api/src/pdf-templates/docraptor.ts",
        import.meta.url,
      ),
      "utf8",
    );
    const previewModule = await loadPdfStudioDocRaptorPreviewModule();

    expect(source).toContain('await import("@asym/docraptor-client")');
    expect(source).toContain(
      'return import("@asym/pdf-renderer/docraptor-preview")',
    );
    expect(source).not.toMatch(
      /import\s+\{[^}]*createDocRaptorClient[^}]*\}\s+from\s+["']@asym\/docraptor-client["']/,
    );
    expect(previewModule.docraptorPreviewBoundary).toMatchObject({
      packageName: "@asym/pdf-renderer/docraptor-preview",
      runtime: "server-only",
    });
  });
});
