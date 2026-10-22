import { PdfDocumentMetadata, PdfDocumentMetadataInput, PdfDocumentProfileOptions, PdfDocumentProfileOptionsInput } from "@asym/pdf-template-schema";
type DocRaptorClientPackageName = '@asym/docraptor-client';
type DocRaptorClientMaturity = 'phase-36-accessibility-metadata';
type DocRaptorClientRuntime = 'server-only';
type DocRaptorClientOwnership = 'docraptor-client';
type DocRaptorSecretPolicy = 'credentials-stay-server-side';
interface DocRaptorClientBoundary {
  readonly packageName: DocRaptorClientPackageName;
  readonly maturity: DocRaptorClientMaturity;
  readonly owns: DocRaptorClientOwnership;
  readonly runtime: DocRaptorClientRuntime;
  readonly secretPolicy: DocRaptorSecretPolicy;
}
type DocRaptorMode = 'test' | 'production';
type DocRaptorMedia = 'print' | 'screen';
type DocRaptorFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;
interface DocRaptorClientConfig {
  readonly apiKey: string;
  readonly mode?: DocRaptorMode;
  readonly apiBaseUrl?: string;
  readonly statusBaseUrl?: string;
  readonly fetch?: DocRaptorFetch;
  readonly defaultTimeoutMs?: number;
}
interface DocRaptorIdempotencyMetadata {
  readonly key: string;
  readonly scope?: string;
  readonly templateId?: string;
  readonly templateVersion?: string | number;
  readonly dataSnapshotHash?: string;
  readonly renderIntent?: string;
  readonly recordId?: string;
}
interface DocRaptorRequestOptions {
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
}
interface DocRaptorRenderRequest extends DocRaptorRequestOptions {
  readonly html: string;
  readonly name?: string;
  readonly baseUrl?: string;
  readonly media?: DocRaptorMedia;
  readonly tag?: string;
  readonly callbackUrl?: string;
  readonly idempotency?: DocRaptorIdempotencyMetadata;
  readonly pdfMetadata?: PdfDocumentMetadataInput;
  readonly pdfProfile?: PdfDocumentProfileOptionsInput;
}
interface DocRaptorRequestMetadata {
  readonly url: string;
  readonly method: 'POST' | 'GET';
  readonly mode: DocRaptorMode;
  readonly test: boolean;
  readonly media: DocRaptorMedia;
  readonly tag?: string;
  readonly idempotency?: DocRaptorIdempotencyMetadata;
  readonly pdfMetadata?: PdfDocumentMetadata;
  readonly pdfProfile?: PdfDocumentProfileOptions;
}
interface DocRaptorSyncRenderResult {
  readonly kind: 'sync';
  readonly pdf: Uint8Array;
  readonly contentType: string;
  readonly pageCount?: number;
  readonly request: DocRaptorRequestMetadata;
  readonly idempotency?: DocRaptorIdempotencyMetadata;
}
interface DocRaptorAsyncRenderJob {
  readonly kind: 'async_job';
  readonly statusId: string;
  readonly statusUrl: string;
  readonly request: DocRaptorRequestMetadata;
  readonly idempotency?: DocRaptorIdempotencyMetadata;
}
type DocRaptorAsyncRenderStatusValue = 'queued' | 'working' | 'completed' | 'failed' | 'unknown';
interface DocRaptorAsyncRenderStatus {
  readonly statusId: string;
  readonly status: DocRaptorAsyncRenderStatusValue;
  readonly message?: string;
  readonly downloadUrl?: string;
  readonly numberOfPages?: number;
  readonly validationErrors?: readonly string[];
  readonly raw: Readonly<Record<string, unknown>>;
}
interface DocRaptorPollAsyncRenderStatusOptions extends DocRaptorRequestOptions {
  readonly intervalMs?: number;
  readonly maxAttempts?: number;
}
interface DocRaptorClient {
  renderSync(input: DocRaptorRenderRequest): Promise<DocRaptorSyncRenderResult>;
  createAsyncRender(input: DocRaptorRenderRequest): Promise<DocRaptorAsyncRenderJob>;
  getAsyncRenderStatus(statusId: string, options?: DocRaptorRequestOptions): Promise<DocRaptorAsyncRenderStatus>;
  pollAsyncRenderStatus(statusId: string, options?: DocRaptorPollAsyncRenderStatusOptions): Promise<DocRaptorAsyncRenderStatus>;
}
type DocRaptorAsyncRenderExecutionStatus = 'succeeded' | 'failed' | 'canceled';
type DocRaptorRetryClassification = 'transient' | 'permanent' | 'canceled';
type DocRaptorStructuredLogLevel = 'info' | 'warning' | 'error';
interface DocRaptorAsyncRetryPolicy {
  readonly maxAttempts?: number;
  readonly initialDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly multiplier?: number;
}
interface DocRaptorAsyncPollPolicy {
  readonly intervalMs?: number;
  readonly maxAttempts?: number;
  readonly timeoutMs?: number;
}
interface DocRaptorStructuredLogEntry {
  readonly level: DocRaptorStructuredLogLevel;
  readonly event: string;
  readonly message: string;
  readonly at?: string;
  readonly attempt?: number;
  readonly statusId?: string;
  readonly retryable?: boolean;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface DocRaptorAsyncRenderAttempt {
  readonly attempt: number;
  readonly status: DocRaptorAsyncRenderExecutionStatus;
  readonly classification?: DocRaptorRetryClassification;
  readonly statusId?: string;
  readonly statusUrl?: string;
  readonly errorCode?: string;
  readonly message?: string;
  readonly retryable: boolean;
  readonly nextRetryDelayMs?: number;
  readonly validationErrors?: readonly string[];
}
interface DocRaptorAsyncRenderExecutionResult {
  readonly kind: 'async_render_execution';
  readonly status: DocRaptorAsyncRenderExecutionStatus;
  readonly request: DocRaptorRenderRequest;
  readonly idempotency?: DocRaptorIdempotencyMetadata;
  readonly statusId?: string;
  readonly statusUrl?: string;
  readonly downloadUrl?: string;
  readonly numberOfPages?: number;
  readonly validationErrors?: readonly string[];
  readonly attempts: readonly DocRaptorAsyncRenderAttempt[];
  readonly logs: readonly DocRaptorStructuredLogEntry[];
}
interface ExecuteDocRaptorAsyncRenderInput {
  readonly client: Pick<DocRaptorClient, 'createAsyncRender' | 'pollAsyncRenderStatus'>;
  readonly request: DocRaptorRenderRequest;
  readonly retryPolicy?: DocRaptorAsyncRetryPolicy;
  readonly pollPolicy?: DocRaptorAsyncPollPolicy;
  readonly signal?: AbortSignal;
  readonly sleep?: (delayMs: number, signal?: AbortSignal) => Promise<void> | void;
  readonly now?: () => string;
  readonly logger?: (entry: DocRaptorStructuredLogEntry) => void;
  readonly redactValues?: readonly string[];
}
interface DocRaptorAsyncRenderSummary {
  readonly total: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly canceled: number;
  readonly partial: boolean;
}
interface DocRaptorAsyncCallbackPayload {
  readonly statusId?: string;
  readonly status: DocRaptorAsyncRenderStatusValue;
  readonly downloadUrl?: string;
  readonly numberOfPages?: number;
  readonly validationErrors?: readonly string[];
  readonly receivedAt?: string;
  readonly raw: Readonly<Record<string, unknown>>;
}
interface DocRaptorRenderErrorClassification {
  readonly classification: DocRaptorRetryClassification;
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly status?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}
export declare function executeDocRaptorAsyncRender(input: ExecuteDocRaptorAsyncRenderInput): Promise<DocRaptorAsyncRenderExecutionResult>;
export declare function classifyDocRaptorRenderError(error: unknown): DocRaptorRenderErrorClassification;
export declare function calculateDocRaptorRetryDelay(attemptNumber: number, policy?: DocRaptorAsyncRetryPolicy): number;
export declare function summarizeDocRaptorAsyncRenderExecutions(results: readonly DocRaptorAsyncRenderExecutionResult[]): DocRaptorAsyncRenderSummary;
export declare function normalizeDocRaptorAsyncCallbackPayload(payload: unknown, receivedAt?: string): DocRaptorAsyncCallbackPayload;
export declare function createDocRaptorClient(config: DocRaptorClientConfig): DocRaptorClient;
type DocRaptorClientErrorCode = 'missing_api_key' | 'http_error' | 'docraptor_error' | 'invalid_request' | 'network_error' | 'timeout' | 'aborted' | 'invalid_response';
interface DocRaptorClientErrorOptions {
  readonly code: DocRaptorClientErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly status?: number;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;
}
export declare class DocRaptorClientError extends Error {
  readonly code: DocRaptorClientErrorCode;
  readonly retryable: boolean;
  readonly status?: number;
  readonly details?: Readonly<Record<string, unknown>>;
  constructor(options: DocRaptorClientErrorOptions);
}
export declare const docraptorClientBoundary: {
  readonly packageName: "@asym/docraptor-client";
  readonly maturity: "phase-36-accessibility-metadata";
  readonly owns: "docraptor-client";
  readonly runtime: "server-only";
  readonly secretPolicy: "credentials-stay-server-side";
};
export type { DocRaptorAsyncCallbackPayload, DocRaptorAsyncPollPolicy, DocRaptorAsyncRenderAttempt, DocRaptorAsyncRenderExecutionResult, DocRaptorAsyncRenderExecutionStatus, DocRaptorAsyncRenderJob, DocRaptorAsyncRenderStatus, DocRaptorAsyncRenderStatusValue, DocRaptorAsyncRenderSummary, DocRaptorAsyncRetryPolicy, DocRaptorClient, DocRaptorClientBoundary, DocRaptorClientConfig, DocRaptorClientErrorCode, DocRaptorClientMaturity, DocRaptorClientOwnership, DocRaptorClientPackageName, DocRaptorClientRuntime, DocRaptorFetch, DocRaptorIdempotencyMetadata, DocRaptorMedia, DocRaptorMode, DocRaptorPollAsyncRenderStatusOptions, DocRaptorRenderErrorClassification, DocRaptorRenderRequest, DocRaptorRequestMetadata, DocRaptorRequestOptions, DocRaptorRetryClassification, DocRaptorSecretPolicy, DocRaptorStructuredLogEntry, DocRaptorStructuredLogLevel, DocRaptorSyncRenderResult, ExecuteDocRaptorAsyncRenderInput };
//# sourceMappingURL=index.d.mts.map