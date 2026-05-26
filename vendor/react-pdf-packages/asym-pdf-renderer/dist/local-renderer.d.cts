import { DocumentPageSettings, DocumentPageSettingsInput, PdfTemplateSchemaBoundary } from "@asym/pdf-template-schema";

//#region src/local-renderer.d.ts
type LocalRendererPackageName = '@asym/pdf-renderer/local-renderer';
type LocalRendererMaturity = 'phase-35-local-renderer';
type LocalRendererRuntime = 'node-dev-test-only';
type LocalRendererOwnership = 'playwright-local-renderer';
interface LocalRendererBoundary {
  readonly packageName: LocalRendererPackageName;
  readonly maturity: LocalRendererMaturity;
  readonly owns: LocalRendererOwnership;
  readonly runtime: LocalRendererRuntime;
  readonly consumes: readonly [PdfTemplateSchemaBoundary['packageName']];
}
declare const localRendererBoundary: LocalRendererBoundary;
type PlaywrightLocalWaitUntil = 'commit' | 'domcontentloaded' | 'load' | 'networkidle';
interface PlaywrightLocalLaunchOptions {
  readonly headless?: boolean;
  readonly timeout?: number;
}
interface PlaywrightLocalSetContentOptions {
  readonly waitUntil?: PlaywrightLocalWaitUntil;
  readonly timeout?: number;
}
interface PlaywrightLocalPdfMargin {
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly left: string;
}
interface PlaywrightLocalPdfOptions {
  readonly width: string;
  readonly height: string;
  readonly margin: PlaywrightLocalPdfMargin;
  readonly printBackground: boolean;
  readonly preferCSSPageSize: boolean;
}
interface PlaywrightLocalScreenshotOptions {
  readonly fullPage: boolean;
  readonly type: 'png';
}
interface PlaywrightLocalPage {
  readonly setContent: (html: string, options: PlaywrightLocalSetContentOptions) => Promise<void>;
  readonly pdf: (options: PlaywrightLocalPdfOptions) => Promise<Uint8Array>;
  readonly screenshot?: (options: PlaywrightLocalScreenshotOptions) => Promise<Uint8Array>;
  readonly close?: () => Promise<void>;
}
interface PlaywrightLocalBrowser {
  readonly newPage: () => Promise<PlaywrightLocalPage>;
  readonly close: () => Promise<void>;
}
interface PlaywrightLocalBrowserLauncher {
  readonly launch: (options?: PlaywrightLocalLaunchOptions) => Promise<PlaywrightLocalBrowser>;
}
type PlaywrightLocalRenderStatus = 'error' | 'skipped' | 'success';
type PlaywrightLocalDiagnosticSeverity = 'error' | 'info' | 'warning';
type PlaywrightLocalArtifactKind = 'pdf-bytes' | 'screenshot-png';
interface PlaywrightLocalRenderDiagnostic {
  readonly code: string;
  readonly severity: PlaywrightLocalDiagnosticSeverity;
  readonly message: string;
  readonly source: 'local-renderer' | 'page-settings' | 'playwright';
  readonly details?: Readonly<Record<string, unknown>>;
}
interface PlaywrightLocalRenderArtifact {
  readonly kind: PlaywrightLocalArtifactKind;
  readonly mimeType: string;
  readonly bytes: Uint8Array;
  readonly sizeBytes: number;
}
interface PlaywrightLocalRenderMetadata {
  readonly renderer: 'playwright-local';
  readonly finalPdfFidelity: false;
  readonly productionRender: false;
  readonly productionRenderer: 'docraptor';
  readonly message: string;
  readonly page: PlaywrightLocalPageBox;
}
interface PlaywrightLocalRenderResult {
  readonly status: PlaywrightLocalRenderStatus;
  readonly durationMs: number;
  readonly artifacts: readonly PlaywrightLocalRenderArtifact[];
  readonly diagnostics: readonly PlaywrightLocalRenderDiagnostic[];
  readonly warnings: readonly PlaywrightLocalRenderDiagnostic[];
  readonly errors: readonly PlaywrightLocalRenderDiagnostic[];
  readonly metadata: PlaywrightLocalRenderMetadata;
}
interface PlaywrightLocalPageBox {
  readonly pageSize: DocumentPageSettings['pageSize'];
  readonly orientation: DocumentPageSettings['orientation'];
  readonly width: string;
  readonly height: string;
  readonly margins: DocumentPageSettings['margins'];
}
interface RenderPlaywrightLocalPdfInput {
  readonly browserLauncher: PlaywrightLocalBrowserLauncher;
  readonly css?: string;
  readonly html: string;
  readonly includeScreenshot?: boolean;
  readonly launchOptions?: PlaywrightLocalLaunchOptions;
  readonly now?: () => number;
  readonly pageSettings?: DocumentPageSettingsInput;
  readonly setContentOptions?: PlaywrightLocalSetContentOptions;
}
declare function renderPlaywrightLocalPdf(input: RenderPlaywrightLocalPdfInput): Promise<PlaywrightLocalRenderResult>;
declare function isPlaywrightBrowserUnavailable(error: unknown): boolean;
//#endregion
export { LocalRendererBoundary, LocalRendererMaturity, LocalRendererOwnership, LocalRendererPackageName, LocalRendererRuntime, PlaywrightLocalArtifactKind, PlaywrightLocalBrowser, PlaywrightLocalBrowserLauncher, PlaywrightLocalDiagnosticSeverity, PlaywrightLocalLaunchOptions, PlaywrightLocalPage, PlaywrightLocalPageBox, PlaywrightLocalPdfMargin, PlaywrightLocalPdfOptions, PlaywrightLocalRenderArtifact, PlaywrightLocalRenderDiagnostic, PlaywrightLocalRenderMetadata, PlaywrightLocalRenderResult, PlaywrightLocalRenderStatus, PlaywrightLocalScreenshotOptions, PlaywrightLocalSetContentOptions, PlaywrightLocalWaitUntil, RenderPlaywrightLocalPdfInput, isPlaywrightBrowserUnavailable, localRendererBoundary, renderPlaywrightLocalPdf };
//# sourceMappingURL=local-renderer.d.cts.map