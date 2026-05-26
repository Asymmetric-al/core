import { BatchDocumentJobV1, BatchGenerationRunV1, BatchQueueEnqueueResult, DocumentTemplateV1, LegacyPdfTemplateReference, PdfAssetAccessAdapter, PdfAuthorizationDecision, PdfBuilderFeatureFlagContract, PdfPermissionAdapter, PdfSecurityContextInput, PdfSignedRenderUrlRequestInput, PdfSignedRenderUrlResult, PublishedTemplateSnapshotV1, RenderResult, TemplateLifecycleRecordV1, VariableDataContext, VariableRegistry, createFakePdfPermissionAdapter, selectPdfTemplateEngine, starterPdfTemplateFixtureByCategory } from "@asym/pdf-template-schema";
import { DocRaptorClient } from "@asym/docraptor-client";
import { PdfEditorPackageName } from "@asym/pdf-editor";
import { PdfPreviewResult, PreflightPdfTemplateInput, PreflightPdfTemplateResult } from "@asym/pdf-renderer";

//#region src/index.d.ts
type PdfStudioAdapterPackageName = '@asym/pdf-studio-adapter';
type PdfStudioAdapterMaturity = 'phase-39-core-adapter-contract';
type PdfStudioAdapterRuntime = 'shared-adapter-contract';
type PdfStudioAdapterOwnership = 'core-integration-adapter';
interface PdfStudioAdapterBoundary {
  readonly packageName: PdfStudioAdapterPackageName;
  readonly maturity: PdfStudioAdapterMaturity;
  readonly owns: PdfStudioAdapterOwnership;
  readonly runtime: PdfStudioAdapterRuntime;
  readonly consumes: readonly ['@asym/pdf-template-schema', PdfEditorPackageName, '@asym/pdf-renderer', '@asym/docraptor-client'];
}
declare const pdfStudioAdapterBoundary: PdfStudioAdapterBoundary;
type PdfStudioTemplateEngine = 'asym_pdf_document_builder' | 'unlayer';
interface PdfStudioNativeTemplateRecord {
  readonly engine: 'asym_pdf_document_builder';
  readonly template: DocumentTemplateV1;
  readonly lifecycle?: TemplateLifecycleRecordV1;
  readonly publishedSnapshot?: PublishedTemplateSnapshotV1;
}
interface PdfStudioLegacyTemplateRecord {
  readonly engine: 'unlayer';
  readonly legacyTemplate: LegacyPdfTemplateReference;
}
type PdfStudioTemplateRecord = PdfStudioNativeTemplateRecord | PdfStudioLegacyTemplateRecord;
interface PdfStudioLoadTemplateInput {
  readonly templateId: string;
  readonly tenantId: string;
}
interface PdfStudioLoadedTemplate {
  readonly record: PdfStudioTemplateRecord;
  readonly featureFlag: PdfBuilderFeatureFlagContract;
  readonly engineSelection: ReturnType<typeof selectPdfTemplateEngine>;
}
interface PdfStudioSaveTemplateInput {
  readonly template: DocumentTemplateV1;
  readonly lifecycle?: TemplateLifecycleRecordV1;
}
interface PdfStudioTemplateRepository {
  loadTemplate(input: PdfStudioLoadTemplateInput): PdfStudioTemplateRecord | Promise<PdfStudioTemplateRecord>;
  saveTemplate(input: PdfStudioSaveTemplateInput): PdfStudioTemplateRecord | Promise<PdfStudioTemplateRecord>;
  loadPublishedSnapshot?(input: PdfStudioLoadTemplateInput): PublishedTemplateSnapshotV1 | undefined | Promise<PublishedTemplateSnapshotV1 | undefined>;
  savePublishedSnapshot?(input: PdfStudioSavePublishedSnapshotInput): PublishedTemplateSnapshotV1 | Promise<PublishedTemplateSnapshotV1>;
}
interface PdfStudioSavePublishedSnapshotInput {
  readonly snapshot: PublishedTemplateSnapshotV1;
}
interface PdfStudioLifecycleLoadInput {
  readonly templateId: string;
  readonly tenantId: string;
}
interface PdfStudioLifecycleSaveInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
}
interface PdfStudioLifecycleAdapter {
  loadLifecycle(input: PdfStudioLifecycleLoadInput): TemplateLifecycleRecordV1 | undefined | Promise<TemplateLifecycleRecordV1 | undefined>;
  saveLifecycle(input: PdfStudioLifecycleSaveInput): TemplateLifecycleRecordV1 | Promise<TemplateLifecycleRecordV1>;
}
interface PdfStudioFeatureFlagInput {
  readonly tenantId: string;
  readonly templateId?: string;
  readonly engine?: PdfStudioTemplateEngine;
}
interface PdfStudioFeatureFlagAdapter {
  resolveNativeBuilderFlag(input: PdfStudioFeatureFlagInput): PdfBuilderFeatureFlagContract | Promise<PdfBuilderFeatureFlagContract>;
}
interface PdfStudioEditorInput {
  readonly engine: PdfStudioTemplateEngine;
  readonly mountId?: string;
  readonly template?: DocumentTemplateV1;
  readonly legacyTemplate?: LegacyPdfTemplateReference;
  readonly variableRegistry?: VariableRegistry;
}
interface PdfStudioEditorHandle {
  readonly engine: PdfStudioTemplateEngine;
  readonly mountId?: string;
}
interface PdfStudioEditorAdapter {
  createEditor(input: PdfStudioEditorInput): PdfStudioEditorHandle;
}
interface PdfStudioPreflightAdapter {
  run(input: PreflightPdfTemplateInput): PreflightPdfTemplateResult | Promise<PreflightPdfTemplateResult>;
}
interface PdfStudioPreviewInput {
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly previewId?: string;
}
interface PdfStudioPreviewAdapter {
  createPreview(input: PdfStudioPreviewInput): PdfPreviewResult | Promise<PdfPreviewResult>;
}
type PdfStudioRenderResult = RenderResult;
interface PdfStudioRenderInput {
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly renderId: string;
  readonly renderer: 'docraptor';
  readonly docraptorClient?: DocRaptorClient;
}
interface PdfStudioRenderAdapter {
  render(input: PdfStudioRenderInput): PdfStudioRenderResult | Promise<PdfStudioRenderResult>;
}
interface PdfStudioBatchStartInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
interface PdfStudioBatchStartResult extends BatchQueueEnqueueResult {
  readonly run: BatchGenerationRunV1;
}
interface PdfStudioBatchAdapter {
  startBatch(input: PdfStudioBatchStartInput): PdfStudioBatchStartResult | Promise<PdfStudioBatchStartResult>;
}
interface PdfStudioAssetAdapter extends PdfAssetAccessAdapter {}
interface PdfStudioPreviewTemplateInput {
  readonly context: PdfSecurityContextInput;
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly previewId?: string;
}
interface PdfStudioPreviewTemplateResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly preflight: PreflightPdfTemplateResult;
  readonly preview: PdfPreviewResult;
}
interface PdfStudioRenderTemplateInput {
  readonly context: PdfSecurityContextInput;
  readonly template: DocumentTemplateV1;
  readonly dataContext?: VariableDataContext;
  readonly renderId: string;
}
interface PdfStudioRenderTemplateResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly preflight: PreflightPdfTemplateResult;
  readonly render: PdfStudioRenderResult;
}
interface PdfStudioCreateSignedAssetUrlInput {
  readonly request: PdfSignedRenderUrlRequestInput;
}
interface PdfStudioStartBatchInput {
  readonly context: PdfSecurityContextInput;
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
interface PdfStudioStartBatchResult {
  readonly authorization: PdfAuthorizationDecision;
  readonly result: PdfStudioBatchStartResult;
}
interface PdfStudioAdapterDependencies {
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
interface PdfStudioAdapter {
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
type PdfStudioAdapterErrorCode = 'missing_adapter' | 'preflight_failed' | 'unauthorized';
declare class PdfStudioAdapterError extends Error {
  readonly code: PdfStudioAdapterErrorCode;
  readonly decision?: PdfAuthorizationDecision;
  constructor(input: {
    readonly code: PdfStudioAdapterErrorCode;
    readonly message: string;
    readonly decision?: PdfAuthorizationDecision;
  });
}
declare function createPdfStudioAdapter(dependencies: PdfStudioAdapterDependencies): PdfStudioAdapter;
//#endregion
export { PdfStudioAdapter, PdfStudioAdapterBoundary, PdfStudioAdapterDependencies, PdfStudioAdapterError, PdfStudioAdapterErrorCode, PdfStudioAdapterMaturity, PdfStudioAdapterOwnership, PdfStudioAdapterPackageName, PdfStudioAdapterRuntime, PdfStudioAssetAdapter, PdfStudioBatchAdapter, PdfStudioBatchStartInput, PdfStudioBatchStartResult, PdfStudioCreateSignedAssetUrlInput, PdfStudioEditorAdapter, PdfStudioEditorHandle, PdfStudioEditorInput, PdfStudioFeatureFlagAdapter, PdfStudioFeatureFlagInput, PdfStudioLegacyTemplateRecord, PdfStudioLifecycleAdapter, PdfStudioLifecycleLoadInput, PdfStudioLifecycleSaveInput, PdfStudioLoadTemplateInput, PdfStudioLoadedTemplate, PdfStudioNativeTemplateRecord, PdfStudioPreflightAdapter, PdfStudioPreviewAdapter, PdfStudioPreviewInput, PdfStudioPreviewTemplateInput, PdfStudioPreviewTemplateResult, PdfStudioRenderAdapter, PdfStudioRenderInput, PdfStudioRenderResult, PdfStudioRenderTemplateInput, PdfStudioRenderTemplateResult, PdfStudioSavePublishedSnapshotInput, PdfStudioSaveTemplateInput, PdfStudioStartBatchInput, PdfStudioStartBatchResult, PdfStudioTemplateEngine, PdfStudioTemplateRecord, PdfStudioTemplateRepository, createFakePdfPermissionAdapter, createPdfStudioAdapter, pdfStudioAdapterBoundary, starterPdfTemplateFixtureByCategory };
//# sourceMappingURL=index.d.mts.map