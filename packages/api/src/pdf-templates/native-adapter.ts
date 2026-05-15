import {
  resolvePDFStudioNativeFeatureFlagContract,
  type PDFStudioNativeBuilderEnv,
} from "@asym/config/pdf-studio-native";
import {
  composePdfDocumentHtml,
  composePrintDocumentHtml,
  createBrowserPdfPreview,
  preflightPdfTemplate,
} from "@asym/pdf-renderer";
import {
  createPdfStudioAdapter,
  type PdfStudioAdapter,
  type PdfStudioBatchAdapter,
  type PdfStudioTemplateRecord,
} from "@asym/pdf-studio-adapter";
import {
  authorizePdfSecurityAction,
  createUnlayerMigrationReport,
  DocumentTemplateV1Schema,
  LegacyPdfTemplateReferenceSchema,
  RenderResultSchema,
  type LegacyPdfTemplateReference,
  type LegacyPdfTemplateReferenceInput,
  type PdfAuthorizationDecision,
  type PdfPermissionAdapter,
  type PdfSecurityContextInput,
  type PdfSecurityPermission,
  type RenderWarning,
  type TemplateCategory,
  type UnlayerMigrationReportV1,
  type UnlayerUnsupportedFeatureInput,
} from "@asym/pdf-template-schema";

import {
  getPdfStudioDocRaptorClient,
  resolvePdfStudioDocRaptorRuntime,
} from "./docraptor";
import {
  createPdfTemplate,
  readPdfTemplate,
  updatePdfTemplate,
  type PdfTemplateCategory,
  type PdfTemplateRow,
} from "./store";

import type { AuthenticatedContext } from "@asym/auth/context";

export type CorePdfTemplateCategory = PdfTemplateCategory;

export interface CorePdfStudioAdapterOptions {
  auth: Pick<
    AuthenticatedContext,
    "profileId" | "role" | "tenantId" | "userId"
  >;
  env?: PDFStudioNativeBuilderEnv;
}

export interface CoreNativePdfMigrationReportInput {
  row: Pick<
    PdfTemplateRow,
    "category" | "design" | "html" | "id" | "name" | "tenant_id"
  >;
  unsupportedFeatures?: readonly UnlayerUnsupportedFeatureInput[];
  createdAt?: string;
  createdByActorId?: string;
}

const nativeToCoreCategory = {
  annual_giving_statement: "annual_statement",
  certificate: "certificate",
  custom: "custom",
  donation_receipt: "donation_receipt",
  donor_letter: "letter",
  financial_report: "report",
  invoice: "invoice",
  missionary_report: "missionary_report",
  tax_receipt: "tax_receipt",
} satisfies Record<TemplateCategory, CorePdfTemplateCategory>;

const coreToNativeCategory = {
  annual_statement: "annual_giving_statement",
  certificate: "certificate",
  custom: "custom",
  donation_receipt: "donation_receipt",
  invoice: "invoice",
  letter: "donor_letter",
  missionary_report: "missionary_report",
  report: "financial_report",
  tax_receipt: "tax_receipt",
} satisfies Record<CorePdfTemplateCategory, TemplateCategory>;

const allNativePermissions: readonly PdfSecurityPermission[] = [
  "asset.read",
  "asset.render_safe_url",
  "batch.start",
  "render.preview",
  "render.production",
  "template.edit",
  "template.publish",
];

export function createCorePdfStudioAdapter(
  options: CorePdfStudioAdapterOptions,
): PdfStudioAdapter {
  const authContext = createCorePdfSecurityContext(options.auth);

  return createPdfStudioAdapter({
    assets: createAdapterOnlyAssetAdapter(authContext),
    auth: createCorePermissionAdapter(authContext),
    batch: createAdapterOnlyBatchAdapter(),
    editor: {
      createEditor(input) {
        return {
          engine: input.engine,
          mountId: input.mountId,
        };
      },
    },
    featureFlags: {
      resolveNativeBuilderFlag(input) {
        return resolvePDFStudioNativeFeatureFlagContract({
          env: options.env,
          tenantId: input.tenantId,
        });
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
    preflight: {
      run(input) {
        return preflightPdfTemplate(input);
      },
    },
    preview: {
      createPreview(input) {
        return createBrowserPdfPreview(input);
      },
    },
    render: {
      async render(input) {
        const runtime = resolvePdfStudioDocRaptorRuntime(options.env);
        const docraptorClient =
          input.docraptorClient ??
          (await getPdfStudioDocRaptorClient({ env: options.env }));

        if (!runtime.productionRenderingEnabled) {
          return createRenderError({
            code: "native_render_disabled",
            message:
              "Native production rendering is disabled by PDF Studio rollout flags.",
          });
        }

        if (!docraptorClient) {
          return createRenderError({
            code: "docraptor_not_configured",
            message:
              "DocRaptor is not configured for native PDF Studio production rendering.",
            details: {
              missing: runtime.missing,
            },
          });
        }

        const startedAt = Date.now();
        const serialized = composePdfDocumentHtml({
          assetReferences: input.template.assets,
          assetRenderMode: "production_render",
          dataContext: input.dataContext,
          document: input.template.content,
          placeholderBindings: input.template.placeholderBindings,
          repeaterBindings: input.template.repeaterBindings,
          summaryBlockBindings: input.template.summaryBlockBindings,
          tableBindings: input.template.tableBindings,
        });
        const printDocument = composePrintDocumentHtml({
          document: serialized,
          metadata: input.template.pdfSettings.metadata,
          pageSettings: input.template.pageSettings,
          theme: input.template.theme,
          title: input.template.name,
        });
        const result = await docraptorClient.renderSync({
          baseUrl: runtime.renderBaseUrl,
          html: printDocument.html,
          media: "print",
          name: input.template.name,
          pdfMetadata: input.template.pdfSettings.metadata,
          pdfProfile: input.template.pdfSettings.profile,
          tag: input.renderId,
        });

        return RenderResultSchema.parse({
          artifact: {
            createdAt: new Date().toISOString(),
            id: input.renderId,
            kind: "pdf",
            location: {
              reference: input.renderId,
              type: "adapter_reference",
            },
            mimeType: result.contentType,
            sizeBytes: result.pdf.byteLength,
          },
          durationMs: Date.now() - startedAt,
          errors: [],
          renderer: "docraptor",
          status: serialized.warnings.length > 0 ? "warning" : "success",
          warnings: serialized.warnings.map(toRenderWarning),
        });
      },
    },
    templates: {
      async loadTemplate(input) {
        const row = await readPdfTemplate(input.tenantId, input.templateId);
        if (!row) {
          throw new Error("PDF template not found.");
        }

        return rowToAdapterTemplateRecord(row);
      },
      async saveTemplate(input) {
        const template = DocumentTemplateV1Schema.parse(input.template);
        const tenantId = options.auth.tenantId;
        const existing = await readPdfTemplate(tenantId, template.id);
        const category = mapNativeCategoryToCoreCategory(template.category);
        const patch = {
          category,
          design: template,
          engine: "asym_pdf_document_builder" as const,
          html: null,
          migration_status: "rebuilt" as const,
          name: template.name,
          native_schema_version: template.version,
          status: template.status,
          tags: template.metadata.tags,
        };

        if (existing) {
          await updatePdfTemplate({
            patch,
            templateId: template.id,
            tenantId,
          });
        } else {
          await createPdfTemplate({
            profileId: options.auth.profileId,
            template: patch,
            tenantId,
          });
        }

        return {
          engine: "asym_pdf_document_builder",
          template,
        };
      },
    },
  });
}

export function mapCoreCategoryToNativeCategory(
  category: CorePdfTemplateCategory,
): TemplateCategory {
  return coreToNativeCategory[category];
}

export function mapNativeCategoryToCoreCategory(
  category: TemplateCategory,
): CorePdfTemplateCategory {
  return nativeToCoreCategory[category];
}

export function isNativePdfStudioRolloutCategory(category: string): boolean {
  return category in coreToNativeCategory;
}

export function createNativePdfStudioMigrationReport(
  input: CoreNativePdfMigrationReportInput,
): UnlayerMigrationReportV1 {
  const legacyTemplate = createLegacyTemplateReference(input.row);

  return createUnlayerMigrationReport({
    createdAt: input.createdAt,
    createdByActorId: input.createdByActorId,
    id: `migration:${input.row.id}`,
    legacyTemplate,
    metadata: {
      manualRebuildRequired: true,
      source: "core_pdf_studio",
    },
    strategy: "manual_rebuild_with_report",
    unsupportedFeatures: input.unsupportedFeatures,
  });
}

function rowToAdapterTemplateRecord(
  row: PdfTemplateRow,
): PdfStudioTemplateRecord {
  if (row.engine === "asym_pdf_document_builder") {
    return {
      engine: "asym_pdf_document_builder" as const,
      template: DocumentTemplateV1Schema.parse(row.design),
    };
  }

  return {
    engine: "unlayer" as const,
    legacyTemplate: createLegacyTemplateReference(row),
  };
}

function createLegacyTemplateReference(
  row: Pick<PdfTemplateRow, "category" | "html" | "id" | "name" | "tenant_id">,
): LegacyPdfTemplateReference {
  return LegacyPdfTemplateReferenceSchema.parse({
    category: mapCoreCategoryToNativeCategory(row.category),
    designJsonRef: row.id,
    engine: "unlayer",
    htmlArtifactRef: row.html ? `${row.id}:html` : undefined,
    legacyTemplateId: row.id,
    metadata: {
      manualNativeRebuildRequired: true,
    },
    name: row.name,
    sourceSystem: "unlayer",
    tenantId: row.tenant_id,
  } satisfies LegacyPdfTemplateReferenceInput);
}

export function createCorePdfSecurityContext(
  auth: CorePdfStudioAdapterOptions["auth"],
): PdfSecurityContextInput {
  const isStaff = auth.role === "admin" || auth.role === "super_admin";

  return {
    actor: {
      id: auth.userId,
      type: "user",
    },
    permissions: isStaff ? [...allNativePermissions] : [],
    tenantId: auth.tenantId,
  };
}

function createCorePermissionAdapter(
  context: PdfSecurityContextInput,
): PdfPermissionAdapter {
  return {
    authorize(request) {
      return authorizePdfSecurityAction({
        action: request.action,
        context: request.context ?? context,
        requiredPermission: request.requiredPermission,
        resource: request.resource,
      });
    },
  };
}

function createAdapterOnlyAssetAdapter(context: PdfSecurityContextInput) {
  return {
    authorizeAssetAccess(request: {
      tenantId: string;
      assetId: string;
      purpose: "browse" | "preview" | "production_render";
    }): PdfAuthorizationDecision {
      return authorizePdfSecurityAction({
        action:
          request.purpose === "production_render"
            ? "resolve_render_safe_url"
            : "read_asset",
        context,
        resource: {
          id: request.assetId,
          tenantId: request.tenantId,
          type: "asset",
        },
      });
    },
    createSignedRenderUrl() {
      return undefined;
    },
  };
}

function createAdapterOnlyBatchAdapter(): PdfStudioBatchAdapter {
  return {
    startBatch(input) {
      return {
        batchId: input.run.id,
        enqueuedJobIds: input.jobs.map((job) => job.id),
        run: input.run,
      };
    },
  };
}

function createRenderError(input: {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}) {
  return RenderResultSchema.parse({
    errors: [
      {
        code: input.code,
        details: input.details,
        message: input.message,
        path: [],
        retryable: false,
      },
    ],
    renderer: "docraptor",
    status: "error",
    warnings: [],
  });
}

function toRenderWarning(warning: {
  code: string;
  message: string;
  path: readonly string[];
}): RenderWarning {
  return {
    code: warning.code,
    message: warning.message,
    path: [...warning.path],
    severity: "warning",
  };
}
