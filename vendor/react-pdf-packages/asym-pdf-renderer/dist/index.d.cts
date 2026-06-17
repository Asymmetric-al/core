import { A as PdfDocumentMarkRenderer, B as PreflightPdfDocumentAssetsInput, C as PdfDocumentAssetDiagnosticSeverity, D as PdfDocumentCssMedia, E as PdfDocumentAssetRenderMode, F as PdfDocumentRenderWarningCode, H as composePdfDocumentHtml, I as PdfDocumentRenderWarningSeverity, L as PdfDocumentRenderWarningSource, M as PdfDocumentNodeRenderer, N as PdfDocumentNodeRendererContext, O as PdfDocumentCssRequirement, P as PdfDocumentRenderWarning, R as PdfDocumentVariableScope, S as PdfDocumentAssetDiagnosticCode, T as PdfDocumentAssetReference, U as preflightPdfDocumentAssets, V as PreflightPdfDocumentAssetsResult, _ as PdfPreviewStatus, a as PdfPreviewDiagnostic, b as ComposePdfDocumentHtmlResult, c as PdfPreviewDiagnosticSource, d as PdfPreviewPreflightHook, f as PdfPreviewPreflightInput, g as PdfPreviewSnapshots, h as PdfPreviewResult, i as PdfPreviewArtifactKind, j as PdfDocumentMarkRendererContext, k as PdfDocumentMark, l as PdfPreviewMetadata, m as PdfPreviewRequestMetadata, n as CreateBrowserPdfPreviewRequest, o as PdfPreviewDiagnosticInput, p as PdfPreviewRenderer, r as PdfPreviewArtifact, s as PdfPreviewDiagnosticSeverity, t as BasePdfPreviewRequest, u as PdfPreviewMode, v as createBrowserPdfPreview, w as PdfDocumentAssetLookupReference, x as PdfDocumentAssetDiagnostic, y as ComposePdfDocumentHtmlInput, z as PdfDocumentVariableUsage } from "./preview-CzVYZKyh.cjs";
import { ConditionalRule, DocumentAssetReference, DocumentContentNode, DocumentPageSettings, DocumentPageSettingsInput, DocumentThemeInput, PdfDocumentMetadataInput, PdfTemplateSchemaBoundary, RepeaterBindingInput, ResolveTableRowsInput, ResolvedRepeaterItem, ResolvedTableRow, ResolvedVariableValue, TableBinding, VariableDataContext, VariableResolutionDiagnostic, VariableResolverOptions } from "@asym/pdf-template-schema";

//#region src/conditions.d.ts
interface EvaluatePdfDocumentConditionInput {
  readonly rule: ConditionalRule;
  readonly context?: VariableDataContext;
  readonly path: readonly string[];
  readonly nodeType?: string;
}
interface PdfDocumentConditionEvaluation {
  readonly visible: boolean;
  readonly warnings: readonly PdfDocumentRenderWarning[];
}
declare function evaluatePdfDocumentCondition(input: EvaluatePdfDocumentConditionInput): PdfDocumentConditionEvaluation;
//#endregion
//#region src/data-table.d.ts
interface ResolvePdfDocumentTableRowsInput extends ResolveTableRowsInput {
  readonly path: readonly string[];
  readonly nodeType?: string;
}
interface ResolvePdfDocumentTableRowsResult {
  readonly binding?: TableBinding;
  readonly rows: readonly ResolvedTableRow[];
  readonly warnings: readonly PdfDocumentRenderWarning[];
}
declare function resolvePdfDocumentTableRows(input: ResolvePdfDocumentTableRowsInput): ResolvePdfDocumentTableRowsResult;
//#endregion
//#region src/preflight.d.ts
type PdfTemplatePreflightMode = 'authoring' | 'publish' | 'production_render' | 'batch';
type PdfTemplatePreflightStatus = 'success' | 'warning' | 'error';
type PdfTemplatePreflightSeverity = 'info' | 'warning' | 'error';
type PdfTemplatePreflightSource = 'accessibility' | 'assets' | 'batch' | 'bindings' | 'print-shell' | 'schema' | 'security' | 'serializer' | 'unsupported';
type PdfTemplatePreflightDiagnosticCode = 'asset_not_render_safe' | 'batch_unsafe_template' | 'header_footer_margin_too_small' | 'invalid_condition_value' | 'invalid_page_settings' | 'invalid_summary_calculation' | 'invalid_table_column' | 'invalid_template' | 'invalid_theme' | 'invalid_variable_type' | 'invalid_variable_value' | 'missing_pdf_title' | 'missing_asset' | 'missing_asset_alt_text' | 'missing_condition_source' | 'missing_optional_variable' | 'missing_required_section' | 'missing_required_variable' | 'missing_summary_source' | 'missing_table_source' | 'missing_table_header' | 'non_descriptive_link_text' | 'non_array_table_source' | 'secret_like_template_value' | 'skipped_heading_level' | 'unknown_formatter' | 'unknown_variable' | 'unsafe_asset_url' | 'unsupported_node' | (string & {});
interface PdfTemplatePreflightDiagnostic {
  readonly code: PdfTemplatePreflightDiagnosticCode;
  readonly severity: PdfTemplatePreflightSeverity;
  readonly source: PdfTemplatePreflightSource;
  readonly message: string;
  readonly path: readonly string[];
  readonly nodeId?: string;
  readonly nodeType?: string;
  readonly suggestedFix?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PdfTemplateRequiredSection {
  readonly id: string;
  readonly nodeType: string;
  readonly label?: string;
  readonly suggestedFix?: string;
}
interface PreflightPdfTemplateInput extends VariableResolverOptions {
  readonly template: unknown;
  readonly dataContext?: VariableDataContext;
  readonly mode?: PdfTemplatePreflightMode;
  readonly requiredSections?: readonly PdfTemplateRequiredSection[];
}
interface PdfTemplatePreflightSummary {
  readonly diagnosticCount: number;
  readonly errorCount: number;
  readonly infoCount: number;
  readonly mode: PdfTemplatePreflightMode;
  readonly templateId?: string;
  readonly templateName?: string;
  readonly warningCount: number;
}
interface PreflightPdfTemplateResult {
  readonly ok: boolean;
  readonly status: PdfTemplatePreflightStatus;
  readonly mode: PdfTemplatePreflightMode;
  readonly diagnostics: readonly PdfTemplatePreflightDiagnostic[];
  readonly errors: readonly PdfTemplatePreflightDiagnostic[];
  readonly warnings: readonly PdfTemplatePreflightDiagnostic[];
  readonly info: readonly PdfTemplatePreflightDiagnostic[];
  readonly summary: PdfTemplatePreflightSummary;
}
interface PreflightPdfDocumentAccessibilityInput {
  readonly assets?: readonly DocumentAssetReference[];
  readonly document: DocumentContentNode;
  readonly metadata?: PdfDocumentMetadataInput;
}
interface PreflightPdfDocumentAccessibilityResult {
  readonly ok: boolean;
  readonly diagnostics: readonly PdfTemplatePreflightDiagnostic[];
  readonly warnings: readonly PdfTemplatePreflightDiagnostic[];
  readonly guaranteesPdfUaCompliance: false;
}
type PdfTemplatePreflightResult = PreflightPdfTemplateResult;
declare function preflightPdfTemplate(input: PreflightPdfTemplateInput): PreflightPdfTemplateResult;
declare function preflightPdfDocumentAccessibility(input: PreflightPdfDocumentAccessibilityInput): PreflightPdfDocumentAccessibilityResult;
//#endregion
//#region src/print-shell.d.ts
interface PrintDocumentPageBox {
  readonly pageSize: DocumentPageSettings['pageSize'];
  readonly orientation: DocumentPageSettings['orientation'];
  readonly width: string;
  readonly height: string;
  readonly margins: DocumentPageSettings['margins'];
}
interface ComposePrintDocumentHtmlInput {
  readonly title: string;
  readonly document: ComposePdfDocumentHtmlResult;
  readonly metadata?: PdfDocumentMetadataInput;
  readonly pageSettings?: DocumentPageSettingsInput;
  readonly theme?: DocumentThemeInput;
}
interface ComposePrintDocumentHtmlResult {
  readonly html: string;
  readonly css: string;
  readonly cssRequirements: readonly PdfDocumentCssRequirement[];
  readonly warnings: readonly PdfDocumentRenderWarning[];
  readonly assets: readonly PdfDocumentAssetReference[];
  readonly variables: readonly PdfDocumentVariableUsage[];
  readonly page?: PrintDocumentPageBox;
}
declare function composePrintDocumentHtml(input: ComposePrintDocumentHtmlInput): ComposePrintDocumentHtmlResult;
//#endregion
//#region src/repeaters.d.ts
interface ResolvePdfDocumentRepeaterItemsInput {
  readonly binding: RepeaterBindingInput;
  readonly context: VariableDataContext;
  readonly path: readonly string[];
  readonly nodeType?: string;
}
interface ResolvePdfDocumentRepeaterItemsResult {
  readonly items: readonly ResolvedRepeaterItem[];
  readonly warnings: readonly PdfDocumentRenderWarning[];
}
declare function resolvePdfDocumentRepeaterItems(input: ResolvePdfDocumentRepeaterItemsInput): ResolvePdfDocumentRepeaterItemsResult;
//#endregion
//#region src/variables.d.ts
interface ResolvePdfDocumentVariablesInput extends VariableResolverOptions {
  readonly variables: readonly PdfDocumentVariableUsage[];
  readonly context: VariableDataContext;
}
interface ResolvePdfDocumentVariablesResult {
  readonly values: readonly ResolvedVariableValue[];
  readonly diagnostics: readonly VariableResolutionDiagnostic[];
}
declare function resolvePdfDocumentVariables(input: ResolvePdfDocumentVariablesInput): ResolvePdfDocumentVariablesResult;
//#endregion
//#region src/index.d.ts
type PdfRendererPackageName = '@asym/pdf-renderer';
type PdfRendererMaturity = 'phase-37-security-tenant-contracts';
type PdfRendererRuntime = 'browser-safe-root-with-server-subpath';
type PdfRendererOwnership = 'print-renderer';
interface PdfRendererBoundary {
  readonly packageName: PdfRendererPackageName;
  readonly maturity: PdfRendererMaturity;
  readonly owns: PdfRendererOwnership;
  readonly runtime: PdfRendererRuntime;
  readonly consumes: readonly [PdfTemplateSchemaBoundary['packageName']];
}
declare const pdfRendererBoundary: PdfRendererBoundary;
//#endregion
export { type BasePdfPreviewRequest, type ComposePdfDocumentHtmlInput, type ComposePdfDocumentHtmlResult, type ComposePrintDocumentHtmlInput, type ComposePrintDocumentHtmlResult, type CreateBrowserPdfPreviewRequest, type EvaluatePdfDocumentConditionInput, type PdfDocumentAssetDiagnostic, type PdfDocumentAssetDiagnosticCode, type PdfDocumentAssetDiagnosticSeverity, type PdfDocumentAssetLookupReference, type PdfDocumentAssetReference, type PdfDocumentAssetRenderMode, type PdfDocumentConditionEvaluation, type PdfDocumentCssMedia, type PdfDocumentCssRequirement, type PdfDocumentMark, type PdfDocumentMarkRenderer, type PdfDocumentMarkRendererContext, type PdfDocumentNodeRenderer, type PdfDocumentNodeRendererContext, type PdfDocumentRenderWarning, type PdfDocumentRenderWarningCode, type PdfDocumentRenderWarningSeverity, type PdfDocumentRenderWarningSource, type PdfDocumentVariableScope, type PdfDocumentVariableUsage, type PdfPreviewArtifact, type PdfPreviewArtifactKind, type PdfPreviewDiagnostic, type PdfPreviewDiagnosticInput, type PdfPreviewDiagnosticSeverity, type PdfPreviewDiagnosticSource, type PdfPreviewMetadata, type PdfPreviewMode, type PdfPreviewPreflightHook, type PdfPreviewPreflightInput, type PdfPreviewRenderer, type PdfPreviewRequestMetadata, type PdfPreviewResult, type PdfPreviewSnapshots, type PdfPreviewStatus, PdfRendererBoundary, PdfRendererMaturity, PdfRendererOwnership, PdfRendererPackageName, PdfRendererRuntime, type PdfTemplatePreflightDiagnostic, type PdfTemplatePreflightDiagnosticCode, type PdfTemplatePreflightMode, type PdfTemplatePreflightResult, type PdfTemplatePreflightSeverity, type PdfTemplatePreflightSource, type PdfTemplatePreflightStatus, type PdfTemplatePreflightSummary, type PdfTemplateRequiredSection, type PreflightPdfDocumentAccessibilityInput, type PreflightPdfDocumentAccessibilityResult, type PreflightPdfDocumentAssetsInput, type PreflightPdfDocumentAssetsResult, type PreflightPdfTemplateInput, type PreflightPdfTemplateResult, type PrintDocumentPageBox, type ResolvePdfDocumentRepeaterItemsInput, type ResolvePdfDocumentRepeaterItemsResult, type ResolvePdfDocumentTableRowsInput, type ResolvePdfDocumentTableRowsResult, type ResolvePdfDocumentVariablesInput, type ResolvePdfDocumentVariablesResult, composePdfDocumentHtml, composePrintDocumentHtml, createBrowserPdfPreview, evaluatePdfDocumentCondition, pdfRendererBoundary, preflightPdfDocumentAccessibility, preflightPdfDocumentAssets, preflightPdfTemplate, resolvePdfDocumentRepeaterItems, resolvePdfDocumentTableRows, resolvePdfDocumentVariables };
//# sourceMappingURL=index.d.cts.map