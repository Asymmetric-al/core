import { DocRaptorClient } from "@asym/docraptor-client";
import { PdfEditorPackageName } from "@asym/pdf-editor";
import { PdfPreviewResult, PreflightPdfTemplateInput, PreflightPdfTemplateResult } from "@asym/pdf-renderer";
import { BatchDocumentJobV1, BatchGenerationRunV1, BatchQueueEnqueueResult, DocumentTemplateV1, LegacyPdfTemplateReference, PdfAssetAccessAdapter, PdfAuthorizationDecision, PdfBuilderFeatureFlagContract, PdfPermissionAdapter, PdfSecurityContextInput, PdfSignedRenderUrlRequestInput, PdfSignedRenderUrlResult, PublishedTemplateSnapshotV1, RenderResult, TemplateLifecycleRecordV1, VariableDataContext, VariableRegistry, createFakePdfPermissionAdapter, selectPdfTemplateEngine, starterPdfTemplateFixtureByCategory } from "@asym/pdf-template-schema";
export type PdfStudioAdapterPackageName = '@asym/pdf-studio-adapter';
export type PdfStudioAdapterMaturity = 'phase-39-core-adapter-contract';
export type PdfStudioAdapterRuntime = 'shared-adapter-contract';
export type PdfStudioAdapterOwnership = 'core-integration-adapter';
export interface PdfStudioAdapterBoundary {
  readonly packageName: PdfStudioAdapterPackageName;
  readonly maturity: PdfStudioAdapterMaturity;
  readonly owns: PdfStudioAdapterOwnership;
  readonly runtime: PdfStudioAdapterRuntime;
  readonly consumes: readonly ['@asym/pdf-template-schema', PdfEditorPackageName, '@asym/pdf-renderer', '@asym/docraptor-client'];
}
export declare const pdfStudioAdapterBoundary: PdfStudioAdapterBoundary;
export type PdfStudioTemplateEngine = 'asym_pdf_document_builder' | 'unlayer';
export interface PdfStudioNativeTemplateRecord {
  readonly engine: 'asym_pdf_document_builder';
  readonly template: DocumentTemplateV1;
  readonly lifecycle?: TemplateLifecycleRecordV1;
  readonly publishedSnapshot?: PublishedTemplateSnapshotV1;
}
export interface PdfStudioLegacyTemplateRecord {
  readonly engine: 'unlayer';
  readonly legacyTemplate: LegacyPdfTemplateReference;
}
export type PdfStudioTemplateRecord = PdfStudioNativeTemplateRecord | PdfStudioLegacyTemplateRecord;
export interface PdfStudioLoadTemplateInput {
  readonly templateId: string;
  readonly tenantId: string;
}
export interface PdfStudioLoadedTemplate {
  readonly record: PdfStudioTemplateRecord;
  readonly featureFlag: PdfBuilderFeatureFlagContract;
  readonly engineSelection: ReturnType<typeof selectPdfTemplateEngine>;
}
export interface PdfStudioSaveTemplateInput {
  readonly template: DocumentTemplateV1;
  readonly lifecycle?: TemplateLifecycleRecordV1;
}
export interface PdfStudioTemplateRepository {
  loadTemplate(input: PdfStudioLoadTemplateInput): PdfStudioTemplateRecord | Promise<PdfStudioTemplateRecord>;
  saveTemplate(input: PdfStudioSaveTemplateInput): PdfStudioTemplateRecord | Promise<PdfStudioTemplateRecord>;
  loadPublishedSnapshot?(input: PdfStudioLoadTemplateInput): PublishedTemplateSnapshotV1 | undefined | Promise<PublishedTemplateSnapshotV1 | undefined>;
  savePublishedSnapshot?(input: PdfStudioSavePublishedSnapshotInput): PublishedTemplateSnapshotV1 | Promise<PublishedTemplateSnapshotV1>;
}
export interface PdfStudioSavePublishedSnapshotInput {
  readonly snapshot: PublishedTemplateSnapshotV1;
}
export interface PdfStudioLifecycleLoadInput {
  readonly templateId: string;
  readonly tenantId: string;
}
export interface PdfStudioLifecycleSaveInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
}
export interface PdfStudioLifecycleAdapter {
  loadLifecycle(input: PdfStudioLifecycleLoadInput): TemplateLifecycleRecordV1 | undefined | Promise<TemplateLifecycleRecordV1 | undefined>;
  saveLifecycle(input: PdfStudioLifecycleSaveInput): TemplateLifecycleRecordV1 | Promise<TemplateLifecycleRecordV1>;
}
export interface PdfStudioFeatureFlagInput {
  readonly tenantId: string;
  readonly templateId?: string;
  readonly engine?: PdfStudioTemplateEngine;
}
export interface PdfStudioFeatureFlagAdapter {
  resolveNativeBuilderFlag(input: PdfStudioFeatureFlagInput): PdfBuilderFeatureFlagContract | Promise<PdfBuilderFeatureFlagContract>;
}
export interface PdfStudioEditorInput {
  readonly engine: PdfStudioTemplateEngine;
  readonly mountId?: string;
  readonly template?: DocumentTemplateV1;
  readonly legacyTemplate?: LegacyPdfTemplateReference;
  readonly variableRegistry?: VariableRegistry;
}
export interface PdfStudioEditorHandle {
  readonly engine: PdfStudioTemplateEngine;
  readonly mountId?: string;
}
export interface PdfStudioEditorAdapter {
  createEditor(input: PdfStudioEditorInput): PdfStudioEditorHandle;
}
export interface PdfStudioPreflightAdapter {
  run(input: PreflightPdfTemplateInput): PreflightPdfTemplateResult | Promise<PreflightPdfTemplateResult>;
}
export interface PdfStudioPreviewInput {
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly previewId?: string;
}
export interface PdfStudioPreviewAdapter {
  createPreview(input: PdfStudioPreviewInput): PdfPreviewResult | Promise<PdfPreviewResult>;
}
export type PdfStudioRenderResult = RenderResult;
export interface PdfStudioRenderInput {
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly renderId: string;
  readonly renderer: 'docraptor';
  readonly docraptorClient?: DocRaptorClient;
}
export interface PdfStudioRenderAdapter {
  render(input: PdfStudioRenderInput): PdfStudioRenderResult | Promise<PdfStudioRenderResult>;
}
export interface PdfStudioBatchStartInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
export interface PdfStudioBatchStartResult extends BatchQueueEnqueueResult {
  readonly run: BatchGenerationRunV1;
}
export interface PdfStudioBatchAdapter {
  startBatch(input: PdfStudioBatchStartInput): PdfStudioBatchStartResult | Promise<PdfStudioBatchStartResult>;
}
export interface PdfStudioAssetAdapter extends PdfAssetAccessAdapter {}
export interface PdfStudioPreviewTemplateInput {
  readonly context: PdfSecurityContextInput;
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly previewId?: string;
}
export interface PdfStudioPreviewTemplateResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly preflight: PreflightPdfTemplateResult;
  readonly preview: PdfPreviewResult;
}
export interface PdfStudioRenderTemplateInput {
  readonly context: PdfSecurityContextInput;
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly renderId: string;
}
export interface PdfStudioRenderTemplateResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly preflight: PreflightPdfTemplateResult;
  readonly render: PdfStudioRenderResult;
}
export interface PdfStudioCreateSignedAssetUrlInput {
  readonly request: PdfSignedRenderUrlRequestInput;
}
export interface PdfStudioStartBatchInput {
  readonly context: PdfSecurityContextInput;
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
export interface PdfStudioStartBatchResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly result: PdfStudioBatchStartResult;
}
export interface PdfStudioAdapterDependencies {
  readonly editor: PdfStudioEditorAdapter;
  readonly templates: PdfStudioTemplateRepository;
  readonly lifecycle: PdfStudioLifecycleAdapter;
  readonly preview: PdfStudioPreviewAdapter;
  readonly render: PdfStudioRenderAdapter;
  readonly preflight: PdfStudioPreflightAdapter;
  readonly batch?: PdfStudioBatchAdapter;
  readonly featureFlags: PdfStudioFeatureFlagAdapter;
  readonly auth: PdfPermissionAdapter;
  readonly assets?: PdfStudioAssetAdapter;
  readonly variableRegistry?: VariableRegistry;
  readonly docraptorClient?: DocRaptorClient;
}
export interface PdfStudioAdapter {
  readonly boundary: PdfStudioAdapterBoundary;
  createEditor(input: Omit<PdfStudioEditorInput, 'variableRegistry'>): PdfStudioEditorHandle;
  loadTemplate(input: PdfStudioLoadTemplateInput): Promise<PdfStudioLoadedTemplate>;
  saveTemplate(input: PdfStudioSaveTemplateInput): Promise<PdfStudioTemplateRecord>;
  loadLifecycle(input: PdfStudioLifecycleLoadInput): Promise<TemplateLifecycleRecordV1 | undefined>;
  saveLifecycle(input: PdfStudioLifecycleSaveInput): Promise<TemplateLifecycleRecordV1>;
  previewTemplate(input: PdfStudioPreviewTemplateInput): Promise<PdfStudioPreviewTemplateResult>;
  renderTemplate(input: PdfStudioRenderTemplateInput): Promise<PdfStudioRenderTemplateResult>;
  createSignedAssetUrl(input: PdfStudioCreateSignedAssetUrlInput): Promise<PdfSignedRenderUrlResult | undefined>;
  startBatch(input: PdfStudioStartBatchInput): Promise<PdfStudioStartBatchResult>;
  selectTemplateEngine(input: {
    readonly templateEngine: PdfStudioTemplateEngine;
    readonly featureFlag: PdfBuilderFeatureFlagContract;
  }): ReturnType<typeof selectPdfTemplateEngine>;
}
export type PdfStudioAdapterErrorCode = 'missing_adapter' | 'preflight_failed' | 'unauthorized';
export declare class PdfStudioAdapterError extends Error {
  readonly code: PdfStudioAdapterErrorCode;
  readonly decision?: PdfAuthorizationDecision;
  constructor(input: {
    readonly code: PdfStudioAdapterErrorCode;
    readonly message: string;
    readonly decision?: PdfAuthorizationDecision;
  });
}
export declare function createPdfStudioAdapter(dependencies: PdfStudioAdapterDependencies): PdfStudioAdapter;
export { createFakePdfPermissionAdapter, starterPdfTemplateFixtureByCategory };
//# sourceMappingURL=index.d.cts.map