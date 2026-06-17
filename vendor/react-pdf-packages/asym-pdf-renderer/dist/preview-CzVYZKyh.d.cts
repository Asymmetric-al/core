import { DocumentAssetReference, DocumentAssetReferenceInput, DocumentAssetRole, DocumentAssetSourceMetadata, DocumentContentNode, DocumentPlaceholderInput, DocumentTemplateV1, FallbackBehavior, RepeaterBindingInput, SummaryBlockBindingInput, TableBindingInput, VariableDataContext } from "@asym/pdf-template-schema";

//#region src/compose-pdf-document-html.d.ts
type PdfDocumentCssMedia = 'all' | 'print';
interface PdfDocumentCssRequirement {
  readonly id: string;
  readonly media: PdfDocumentCssMedia;
  readonly css: string;
}
type PdfDocumentRenderWarningCode = 'empty_document' | 'invalid_page_settings' | 'invalid_theme' | 'invalid_document' | 'header_footer_margin_too_small' | 'invalid_page_break' | 'invalid_page_flow_placement' | 'invalid_placeholder' | 'missing_attribute' | 'invalid_asset_reference' | 'invalid_calculation_reference' | 'invalid_repeater_binding' | 'invalid_summary_block_binding' | 'invalid_table_binding' | 'asset_not_render_safe' | 'unsafe_url' | 'unsafe_asset_url' | 'unknown_mark' | 'unknown_node' | 'unsupported_mark' | 'unsupported_node' | 'condition_evaluation_error' | 'condition_evaluation_warning' | 'invalid_condition_rule' | 'missing_asset' | 'missing_asset_alt_text' | 'missing_condition_context' | 'missing_placeholder' | 'missing_placeholder_label' | 'missing_repeater_binding' | 'missing_repeater_context' | 'missing_repeater_source' | 'missing_summary_block_binding' | 'missing_summary_block_context' | 'missing_table_binding' | 'missing_table_context' | 'missing_table_source' | 'missing_theme_font_fallback' | 'non_array_repeater_source' | 'non_array_table_source' | 'pagination_hint_not_guaranteed' | 'repeater_filter_error' | 'repeater_filter_warning' | 'repeater_max_items_exceeded' | 'table_max_rows_exceeded' | 'unsupported_table_column_value';
type PdfDocumentRenderWarningSeverity = 'warning' | 'error';
type PdfDocumentRenderWarningSource = 'serializer' | 'print-shell';
interface PdfDocumentRenderWarning {
  readonly source?: PdfDocumentRenderWarningSource;
  readonly code: PdfDocumentRenderWarningCode;
  readonly severity: PdfDocumentRenderWarningSeverity;
  readonly message: string;
  readonly path: readonly string[];
  readonly nodeType?: string;
  readonly markType?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PdfDocumentAssetReference {
  readonly id?: string;
  readonly assetId?: string;
  readonly src: string;
  readonly altText?: string;
  readonly role?: string;
  readonly mimeType?: string;
  readonly width?: string;
  readonly height?: string;
  readonly alignment?: string;
  readonly linkUrl?: string;
  readonly renderSafe?: boolean;
  readonly tenantId?: string;
  readonly source?: DocumentAssetSourceMetadata;
  readonly path: readonly string[];
}
interface PdfDocumentVariableUsage {
  readonly key: string;
  readonly formatter?: string;
  readonly fallback?: FallbackBehavior;
  readonly scopes?: readonly PdfDocumentVariableScope[];
  readonly path: readonly string[];
}
interface PdfDocumentVariableScope {
  readonly sourcePath: string;
  readonly itemAlias: string;
  readonly sourceIndex: number;
  readonly renderedIndex: number;
  readonly indexAlias?: string;
}
interface PdfDocumentMark {
  readonly type: string;
  readonly attrs?: Readonly<Record<string, unknown>>;
}
interface PdfDocumentNodeRendererContext {
  readonly node: DocumentContentNode;
  readonly path: readonly string[];
  readonly childrenHtml: string;
  readonly assetRenderMode: PdfDocumentAssetRenderMode;
  readonly resolveAssetReference: (reference: PdfDocumentAssetLookupReference) => DocumentAssetReference | undefined;
  readonly renderChildren: (children: readonly unknown[] | undefined, path: readonly string[]) => string;
  readonly addWarning: (warning: PdfDocumentRenderWarning) => void;
  readonly addAsset: (asset: PdfDocumentAssetReference) => void;
  readonly addVariable: (usage: PdfDocumentVariableUsage) => void;
}
interface PdfDocumentAssetLookupReference {
  readonly assetId?: string;
  readonly referenceId?: string;
}
interface PdfDocumentNodeRenderer {
  readonly type: string;
  readonly render: (context: PdfDocumentNodeRendererContext) => string;
}
interface PdfDocumentMarkRendererContext {
  readonly mark: PdfDocumentMark;
  readonly node: DocumentContentNode;
  readonly path: readonly string[];
  readonly childrenHtml: string;
  readonly addWarning: (warning: PdfDocumentRenderWarning) => void;
}
interface PdfDocumentMarkRenderer {
  readonly type: string;
  readonly render: (context: PdfDocumentMarkRendererContext) => string;
}
interface ComposePdfDocumentHtmlInput {
  readonly document: DocumentContentNode;
  readonly assetReferences?: readonly DocumentAssetReferenceInput[];
  readonly assetRenderMode?: PdfDocumentAssetRenderMode;
  readonly dataContext?: VariableDataContext;
  readonly repeaterBindings?: readonly RepeaterBindingInput[];
  readonly tableBindings?: readonly TableBindingInput[];
  readonly summaryBlockBindings?: readonly SummaryBlockBindingInput[];
  readonly placeholderBindings?: readonly DocumentPlaceholderInput[];
  readonly nodeRenderers?: readonly PdfDocumentNodeRenderer[];
  readonly markRenderers?: readonly PdfDocumentMarkRenderer[];
}
type PdfDocumentAssetRenderMode = 'browser_preview' | 'production_render';
type PdfDocumentAssetDiagnosticCode = 'invalid_asset_reference' | 'missing_asset' | 'missing_asset_alt_text' | 'asset_not_render_safe' | 'unsafe_asset_url';
type PdfDocumentAssetDiagnosticSeverity = 'warning' | 'error';
interface PdfDocumentAssetDiagnostic {
  readonly code: PdfDocumentAssetDiagnosticCode;
  readonly severity: PdfDocumentAssetDiagnosticSeverity;
  readonly message: string;
  readonly path: readonly string[];
  readonly referenceId?: string;
  readonly assetId?: string;
  readonly role?: DocumentAssetRole;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PreflightPdfDocumentAssetsInput {
  readonly assets?: readonly DocumentAssetReferenceInput[];
  readonly mode?: PdfDocumentAssetRenderMode;
}
interface PreflightPdfDocumentAssetsResult {
  readonly diagnostics: readonly PdfDocumentAssetDiagnostic[];
  readonly assets: readonly DocumentAssetReference[];
}
interface ComposePdfDocumentHtmlResult {
  readonly html: string;
  readonly cssRequirements: readonly PdfDocumentCssRequirement[];
  readonly warnings: readonly PdfDocumentRenderWarning[];
  readonly assets: readonly PdfDocumentAssetReference[];
  readonly variables: readonly PdfDocumentVariableUsage[];
}
declare function composePdfDocumentHtml(input: ComposePdfDocumentHtmlInput): ComposePdfDocumentHtmlResult;
declare function preflightPdfDocumentAssets(input: PreflightPdfDocumentAssetsInput): PreflightPdfDocumentAssetsResult;
//#endregion
//#region src/preview.d.ts
type PdfPreviewMode = 'browser' | 'docraptor-test';
type PdfPreviewStatus = 'success' | 'warning' | 'error';
type PdfPreviewRenderer = 'browser' | 'docraptor';
type PdfPreviewDiagnosticSource = 'schema' | 'serializer' | 'print-shell' | 'preflight' | 'docraptor';
type PdfPreviewDiagnosticSeverity = 'info' | 'warning' | 'error';
type PdfPreviewArtifactKind = 'pdf-bytes' | 'hosted-url' | 'adapter-reference';
interface PdfPreviewDiagnostic {
  readonly source: PdfPreviewDiagnosticSource;
  readonly code: string;
  readonly severity: PdfPreviewDiagnosticSeverity;
  readonly message: string;
  readonly path: readonly string[];
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PdfPreviewDiagnosticInput {
  readonly source?: PdfPreviewDiagnosticSource;
  readonly code: string;
  readonly severity?: PdfPreviewDiagnosticSeverity;
  readonly message: string;
  readonly path?: readonly string[];
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PdfPreviewSnapshots {
  readonly html: string;
  readonly css: string;
  readonly bodyHtml: string;
  readonly cssRequirements: readonly PdfDocumentCssRequirement[];
}
interface PdfPreviewArtifact {
  readonly kind: PdfPreviewArtifactKind;
  readonly mimeType: string;
  readonly bytes?: Uint8Array;
  readonly url?: string;
  readonly reference?: string;
  readonly sizeBytes?: number;
}
interface PdfPreviewRequestMetadata {
  readonly url: string;
  readonly method: 'POST' | 'GET';
  readonly mode: string;
  readonly test: boolean;
  readonly media: string;
  readonly tag?: string;
}
interface PdfPreviewMetadata {
  readonly renderer: PdfPreviewRenderer;
  readonly finalPdfFidelity: boolean;
  readonly productionRender: false;
  readonly docraptorTestMode: boolean;
  readonly mayContainWatermark: boolean;
  readonly message: string;
  readonly request?: PdfPreviewRequestMetadata;
}
interface PdfPreviewPreflightInput {
  readonly template: DocumentTemplateV1;
  readonly mode: PdfPreviewMode;
  readonly previewId: string;
  readonly snapshots: PdfPreviewSnapshots;
}
type PdfPreviewPreflightHook = (input: PdfPreviewPreflightInput) => readonly PdfPreviewDiagnosticInput[] | Promise<readonly PdfPreviewDiagnosticInput[]>;
interface BasePdfPreviewRequest {
  readonly template: unknown;
  readonly dataContext?: VariableDataContext;
  readonly previewId?: string;
  readonly title?: string;
  readonly preflight?: PdfPreviewPreflightHook;
  readonly now?: () => number;
}
interface CreateBrowserPdfPreviewRequest extends BasePdfPreviewRequest {}
interface PdfPreviewResult {
  readonly mode: PdfPreviewMode;
  readonly status: PdfPreviewStatus;
  readonly previewId: string;
  readonly durationMs: number;
  readonly snapshots?: PdfPreviewSnapshots;
  readonly artifacts: readonly PdfPreviewArtifact[];
  readonly diagnostics: readonly PdfPreviewDiagnostic[];
  readonly warnings: readonly PdfPreviewDiagnostic[];
  readonly errors: readonly PdfPreviewDiagnostic[];
  readonly metadata: PdfPreviewMetadata;
}
declare function createBrowserPdfPreview(request: CreateBrowserPdfPreviewRequest): Promise<PdfPreviewResult>;
//#endregion
export { PdfDocumentMarkRenderer as A, PreflightPdfDocumentAssetsInput as B, PdfDocumentAssetDiagnosticSeverity as C, PdfDocumentCssMedia as D, PdfDocumentAssetRenderMode as E, PdfDocumentRenderWarningCode as F, composePdfDocumentHtml as H, PdfDocumentRenderWarningSeverity as I, PdfDocumentRenderWarningSource as L, PdfDocumentNodeRenderer as M, PdfDocumentNodeRendererContext as N, PdfDocumentCssRequirement as O, PdfDocumentRenderWarning as P, PdfDocumentVariableScope as R, PdfDocumentAssetDiagnosticCode as S, PdfDocumentAssetReference as T, preflightPdfDocumentAssets as U, PreflightPdfDocumentAssetsResult as V, PdfPreviewStatus as _, PdfPreviewDiagnostic as a, ComposePdfDocumentHtmlResult as b, PdfPreviewDiagnosticSource as c, PdfPreviewPreflightHook as d, PdfPreviewPreflightInput as f, PdfPreviewSnapshots as g, PdfPreviewResult as h, PdfPreviewArtifactKind as i, PdfDocumentMarkRendererContext as j, PdfDocumentMark as k, PdfPreviewMetadata as l, PdfPreviewRequestMetadata as m, CreateBrowserPdfPreviewRequest as n, PdfPreviewDiagnosticInput as o, PdfPreviewRenderer as p, PdfPreviewArtifact as r, PdfPreviewDiagnosticSeverity as s, BasePdfPreviewRequest as t, PdfPreviewMode as u, createBrowserPdfPreview as v, PdfDocumentAssetLookupReference as w, PdfDocumentAssetDiagnostic as x, ComposePdfDocumentHtmlInput as y, PdfDocumentVariableUsage as z };
//# sourceMappingURL=preview-CzVYZKyh.d.cts.map