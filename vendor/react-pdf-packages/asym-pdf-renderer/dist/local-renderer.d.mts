import { DocumentPageSettings, DocumentPageSettingsInput, PdfTemplateSchemaBoundary } from "@asym/pdf-template-schema";
export type LocalRendererPackageName = '@asym/pdf-renderer/local-renderer';
export type LocalRendererMaturity = 'phase-35-local-renderer';
export type LocalRendererRuntime = 'node-dev-test-only';
export type LocalRendererOwnership = 'playwright-local-renderer';
export interface LocalRendererBoundary {
  readonly packageName: LocalRendererPackageName;
  readonly maturity: LocalRendererMaturity;
  readonly owns: LocalRendererOwnership;
  readonly runtime: LocalRendererRuntime;
  readonly consumes: readonly [PdfTemplateSchemaBoundary['packageName']];
}
export declare const localRendererBoundary: LocalRendererBoundary;
export type PlaywrightLocalWaitUntil = 'commit' | 'domcontentloaded' | 'load' | 'networkidle';
export interface PlaywrightLocalLaunchOptions {
  readonly headless?: boolean;
  readonly timeout?: number;
}
export interface PlaywrightLocalSetContentOptions {
  readonly waitUntil?: PlaywrightLocalWaitUntil;
  readonly timeout?: number;
}
export interface PlaywrightLocalPdfMargin {
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly left: string;
}
export interface PlaywrightLocalPdfOptions {
  readonly width: string;
  readonly height: string;
  readonly margin: PlaywrightLocalPdfMargin;
  readonly printBackground: boolean;
  readonly preferCSSPageSize: boolean;
}
export interface PlaywrightLocalScreenshotOptions {
  readonly fullPage: boolean;
  readonly type: 'png';
}
export interface PlaywrightLocalPage {
  readonly setContent: (html: string, options: PlaywrightLocalSetContentOptions) => Promise<void>;
  readonly pdf: (options: PlaywrightLocalPdfOptions) => Promise<Uint8Array>;
  readonly screenshot?: (options: PlaywrightLocalScreenshotOptions) => Promise<Uint8Array>;
  readonly close?: () => Promise<void>;
}
export interface PlaywrightLocalBrowser {
  readonly newPage: () => Promise<PlaywrightLocalPage>;
  readonly close: () => Promise<void>;
}
export interface PlaywrightLocalBrowserLauncher {
  readonly launch: (options?: PlaywrightLocalLaunchOptions) => Promise<PlaywrightLocalBrowser>;
}
export type PlaywrightLocalRenderStatus = 'error' | 'skipped' | 'success';
export type PlaywrightLocalDiagnosticSeverity = 'error' | 'info' | 'warning';
export type PlaywrightLocalArtifactKind = 'pdf-bytes' | 'screenshot-png';
export interface PlaywrightLocalRenderDiagnostic {
  readonly code: string;
  readonly severity: PlaywrightLocalDiagnosticSeverity;
  readonly message: string;
  readonly source: 'local-renderer' | 'page-settings' | 'playwright';
  readonly details?: Readonly<Record<string, unknown>>;
}
export interface PlaywrightLocalRenderArtifact {
  readonly kind: PlaywrightLocalArtifactKind;
  readonly mimeType: string;
  readonly bytes: Uint8Array;
  readonly sizeBytes: number;
}
export interface PlaywrightLocalRenderMetadata {
  readonly renderer: 'playwright-local';
  readonly finalPdfFidelity: false;
  readonly productionRender: false;
  readonly productionRenderer: 'docraptor';
  readonly message: string;
  readonly page: PlaywrightLocalPageBox;
}
export interface PlaywrightLocalRenderResult {
  readonly status: PlaywrightLocalRenderStatus;
  readonly durationMs: number;
  readonly artifacts: readonly PlaywrightLocalRenderArtifact[];
  readonly diagnostics: readonly PlaywrightLocalRenderDiagnostic[];
  readonly warnings: readonly PlaywrightLocalRenderDiagnostic[];
  readonly errors: readonly PlaywrightLocalRenderDiagnostic[];
  readonly metadata: PlaywrightLocalRenderMetadata;
}
export interface PlaywrightLocalPageBox {
  readonly pageSize: DocumentPageSettings['pageSize'];
  readonly orientation: DocumentPageSettings['orientation'];
  readonly width: string;
  readonly height: string;
  readonly margins: DocumentPageSettings['margins'];
}
export interface RenderPlaywrightLocalPdfInput {
  readonly browserLauncher: PlaywrightLocalBrowserLauncher;
  readonly css?: string;
  readonly html: string;
  readonly includeScreenshot?: boolean;
  readonly launchOptions?: PlaywrightLocalLaunchOptions;
  readonly now?: () => number;
  readonly pageSettings?: DocumentPageSettingsInput;
  readonly setContentOptions?: PlaywrightLocalSetContentOptions;
}
export declare function renderPlaywrightLocalPdf(input: RenderPlaywrightLocalPdfInput): Promise<PlaywrightLocalRenderResult>;
export declare function isPlaywrightBrowserUnavailable(error: unknown): boolean;
//# sourceMappingURL=local-renderer.d.mts.map