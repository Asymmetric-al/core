import { docraptorClientBoundary } from "@asym/docraptor-client";
import { pdfEditorBoundary } from "@asym/pdf-editor";
import {
  createBrowserPdfPreview,
  preflightPdfTemplate,
  pdfRendererBoundary,
} from "@asym/pdf-renderer";
import {
  createPdfStudioAdapter,
  pdfStudioAdapterBoundary,
} from "@asym/pdf-studio-adapter";
import {
  createFakePdfPermissionAdapter,
  pdfTemplateSchemaBoundary,
  starterPdfTemplateFixtureByCategory,
} from "@asym/pdf-template-schema";

const fixture = starterPdfTemplateFixtureByCategory.donation_receipt;
const preflight = preflightPdfTemplate({
  template: fixture.template,
  dataContext: fixture.sampleData,
  mode: "authoring",
});

const preview = await createBrowserPdfPreview({
  template: fixture.template,
  dataContext: fixture.sampleData,
  previewId: "core-bun-consumption-smoke",
});

const adapter = createPdfStudioAdapter({
  editor: {
    createEditor(input) {
      return {
        engine: input.engine,
        mountId: input.mountId,
      };
    },
  },
  templates: {
    loadTemplate() {
      return {
        engine: "asym_pdf_document_builder",
        template: fixture.template,
      };
    },
    saveTemplate(input) {
      return {
        engine: "asym_pdf_document_builder",
        template: input.template,
      };
    },
  },
  lifecycle: {
    loadLifecycle() {
      return undefined;
    },
    saveLifecycle(input) {
      return input.lifecycle;
    },
  },
  preview: {
    createPreview() {
      return preview;
    },
  },
  render: {
    render() {
      return {
        status: "error",
        renderer: "docraptor",
        errors: [
          {
            code: "not_configured",
            message:
              "DocRaptor is intentionally not configured for this smoke.",
            path: [],
            retryable: false,
          },
        ],
        warnings: [],
      };
    },
  },
  preflight: {
    run() {
      return preflight;
    },
  },
  featureFlags: {
    resolveNativeBuilderFlag() {
      return {
        flagName: "pdf_studio.native_builder",
        enabled: true,
        rolloutMode: "native_preview",
        fallbackEngine: "unlayer",
        metadata: {
          reason: "core-bun-consumption-smoke",
        },
      };
    },
  },
  auth: createFakePdfPermissionAdapter({
    context: {
      tenantId: "tenant_core_smoke",
      actor: {
        type: "user",
        id: "user_core_smoke",
      },
      permissions: [
        "render.preview",
        "render.production",
        "template.edit",
        "template.publish",
        "batch.start",
        "asset.read",
        "asset.render_safe_url",
      ],
    },
  }),
});

const consumedPackageNames = [
  pdfTemplateSchemaBoundary.packageName,
  pdfRendererBoundary.packageName,
  pdfEditorBoundary.packageName,
  docraptorClientBoundary.packageName,
  pdfStudioAdapterBoundary.packageName,
];

if (!preflight.ok) {
  throw new Error("Expected package preflight fixture to pass.");
}

if (preview.status !== "success") {
  throw new Error("Expected package browser preview fixture to pass.");
}

if (adapter.boundary.packageName !== "@asym/pdf-studio-adapter") {
  throw new Error("Expected package adapter boundary to load.");
}

console.log(
  `Bun consumed native PDF Studio packages: ${consumedPackageNames.join(", ")}`,
);
