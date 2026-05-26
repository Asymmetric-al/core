import { h as PdfPreviewResult, t as BasePdfPreviewRequest } from "./preview-BNR9SGDr.mjs";
import { DocRaptorFetch } from "@asym/docraptor-client";

//#region src/docraptor-preview.d.ts
type DocRaptorPreviewPackageName = '@asym/pdf-renderer/docraptor-preview';
type DocRaptorPreviewMaturity = 'phase-28-branding';
type DocRaptorPreviewRuntime = 'server-only';
type DocRaptorPreviewOwnership = 'docraptor-test-preview';
interface DocRaptorPreviewBoundary {
  readonly packageName: DocRaptorPreviewPackageName;
  readonly maturity: DocRaptorPreviewMaturity;
  readonly owns: DocRaptorPreviewOwnership;
  readonly runtime: DocRaptorPreviewRuntime;
  readonly consumes: readonly ['@asym/pdf-template-schema', '@asym/docraptor-client'];
}
declare const docraptorPreviewBoundary: DocRaptorPreviewBoundary;
interface CreateDocRaptorTestPdfPreviewRequest extends BasePdfPreviewRequest {
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
declare function createDocRaptorTestPdfPreview(request: CreateDocRaptorTestPdfPreviewRequest): Promise<PdfPreviewResult>;
//#endregion
export { CreateDocRaptorTestPdfPreviewRequest, DocRaptorPreviewBoundary, DocRaptorPreviewMaturity, DocRaptorPreviewOwnership, DocRaptorPreviewPackageName, DocRaptorPreviewRuntime, createDocRaptorTestPdfPreview, docraptorPreviewBoundary };
//# sourceMappingURL=docraptor-preview.d.mts.map