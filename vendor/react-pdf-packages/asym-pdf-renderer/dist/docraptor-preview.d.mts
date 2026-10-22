import { h as PdfPreviewResult, t as BasePdfPreviewRequest } from "./preview-3MYc_rMK.mjs";
import { DocRaptorFetch } from "@asym/docraptor-client";
export type DocRaptorPreviewPackageName = '@asym/pdf-renderer/docraptor-preview';
export type DocRaptorPreviewMaturity = 'phase-28-branding';
export type DocRaptorPreviewRuntime = 'server-only';
export type DocRaptorPreviewOwnership = 'docraptor-test-preview';
export interface DocRaptorPreviewBoundary {
  readonly packageName: DocRaptorPreviewPackageName;
  readonly maturity: DocRaptorPreviewMaturity;
  readonly owns: DocRaptorPreviewOwnership;
  readonly runtime: DocRaptorPreviewRuntime;
  readonly consumes: readonly ['@asym/pdf-template-schema', '@asym/docraptor-client'];
}
export declare const docraptorPreviewBoundary: DocRaptorPreviewBoundary;
export interface CreateDocRaptorTestPdfPreviewRequest extends BasePdfPreviewRequest {
  readonly apiKey: string;
  readonly fetch?: DocRaptorFetch;
  readonly apiBaseUrl?: string;
  readonly statusBaseUrl?: string;
  readonly defaultTimeoutMs?: number;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly baseUrl?: string;
  readonly name?: string;
  readonly tag?: string;
}
export declare function createDocRaptorTestPdfPreview(request: CreateDocRaptorTestPdfPreviewRequest): Promise<PdfPreviewResult>;
//# sourceMappingURL=docraptor-preview.d.mts.map