import { Buffer } from "node:buffer";
import { PdfDocumentMetadataSchema, PdfDocumentProfileOptionsSchema } from "@asym/pdf-template-schema";
//#region src/server-only.ts
const serverOnlyMessage = "@asym/docraptor-client is server-only and must not be imported in browser bundles.";
function assertDocRaptorServerRuntime() {
	const runtime = globalThis;
	if (runtime.window !== void 0 && runtime.document !== void 0) throw new Error(serverOnlyMessage);
}
//#endregion
//#region src/errors.ts
var DocRaptorClientError = class extends Error {
	code;
	retryable;
	status;
	details;
	constructor(options) {
		super(options.message);
		this.name = "DocRaptorClientError";
		this.code = options.code;
		this.retryable = options.retryable;
		this.status = options.status;
		this.details = options.details;
		if (options.cause !== void 0) Object.defineProperty(this, "cause", {
			configurable: true,
			enumerable: false,
			value: options.cause,
			writable: true
		});
	}
};
function isRetryableHttpStatus(status) {
	return status === 429 || status >= 500;
}
//#endregion
//#region src/async-render.ts
const defaultRetryPolicy = {
	initialDelayMs: 1e3,
	maxAttempts: 1,
	maxDelayMs: 3e4,
	multiplier: 2
};
const defaultPollPolicy = {
	intervalMs: 1e3,
	maxAttempts: 60
};
async function executeDocRaptorAsyncRender(input) {
	assertDocRaptorServerRuntime();
	const retryPolicy = normalizeRetryPolicy(input.retryPolicy);
	const pollPolicy = normalizePollPolicy(input.pollPolicy);
	const attempts = [];
	const logs = [];
	const signal = input.signal ?? input.request.signal;
	const emitLog = createLogEmitter(input, logs);
	for (let attemptNumber = 1; attemptNumber <= retryPolicy.maxAttempts; attemptNumber += 1) {
		emitLog({
			attempt: attemptNumber,
			event: "docraptor.async.create.started",
			level: "info",
			message: "Creating DocRaptor async render job."
		});
		try {
			throwIfCanceled(signal);
			const asyncJob = await input.client.createAsyncRender({
				...input.request,
				signal
			});
			emitLog({
				attempt: attemptNumber,
				event: "docraptor.async.create.succeeded",
				level: "info",
				message: "DocRaptor async render job was created.",
				statusId: asyncJob.statusId
			});
			const status = await input.client.pollAsyncRenderStatus(asyncJob.statusId, createPollOptions(pollPolicy, signal));
			if (status.status === "completed") {
				const successAttempt = createSucceededAttempt(attemptNumber, asyncJob);
				attempts.push(successAttempt);
				emitLog({
					attempt: attemptNumber,
					event: "docraptor.async.poll.succeeded",
					level: "info",
					message: "DocRaptor async render completed.",
					statusId: asyncJob.statusId
				});
				return createExecutionResult({
					asyncJob,
					attempts,
					downloadUrl: status.downloadUrl,
					logs,
					numberOfPages: status.numberOfPages,
					request: input.request,
					status: "succeeded",
					validationErrors: status.validationErrors
				});
			}
			const failedAttempt = createFailedStatusAttempt({
				asyncJob,
				attemptNumber,
				status
			});
			attempts.push(failedAttempt);
			emitLog({
				attempt: attemptNumber,
				details: {
					errorCode: failedAttempt.errorCode,
					validationErrors: failedAttempt.validationErrors
				},
				event: "docraptor.async.poll.failed",
				level: "error",
				message: failedAttempt.message ?? "DocRaptor async render failed.",
				retryable: false,
				statusId: asyncJob.statusId
			});
			return createExecutionResult({
				asyncJob,
				attempts,
				logs,
				request: input.request,
				status: "failed",
				validationErrors: status.validationErrors
			});
		} catch (error) {
			const classification = classifyDocRaptorRenderError(error);
			const shouldRetry = classification.classification === "transient" && attemptNumber < retryPolicy.maxAttempts;
			const nextRetryDelayMs = shouldRetry ? calculateDocRaptorRetryDelay(attemptNumber, retryPolicy) : void 0;
			const failedAttempt = createErrorAttempt({
				attemptNumber,
				classification,
				nextRetryDelayMs,
				retryable: shouldRetry
			});
			attempts.push(failedAttempt);
			emitLog({
				attempt: attemptNumber,
				details: {
					errorCode: classification.code,
					status: classification.status
				},
				event: classification.classification === "canceled" ? "docraptor.async.canceled" : "docraptor.async.failed",
				level: classification.classification === "canceled" ? "warning" : "error",
				message: classification.message,
				retryable: shouldRetry
			});
			if (classification.classification === "canceled") return createExecutionResult({
				attempts,
				logs,
				request: input.request,
				status: "canceled"
			});
			if (!shouldRetry || nextRetryDelayMs === void 0) return createExecutionResult({
				attempts,
				logs,
				request: input.request,
				status: "failed"
			});
			emitLog({
				attempt: attemptNumber,
				details: { delayMs: nextRetryDelayMs },
				event: "docraptor.async.retry.scheduled",
				level: "warning",
				message: "Retrying DocRaptor async render after transient failure.",
				retryable: true
			});
			await sleepBeforeRetry(input, nextRetryDelayMs, signal);
		}
	}
	return createExecutionResult({
		attempts,
		logs,
		request: input.request,
		status: "failed"
	});
}
function classifyDocRaptorRenderError(error) {
	if (error instanceof DocRaptorClientError) {
		if (error.code === "aborted") return {
			classification: "canceled",
			code: error.code,
			details: error.details,
			message: error.message,
			retryable: false,
			status: error.status
		};
		return {
			classification: error.retryable ? "transient" : "permanent",
			code: error.code,
			details: error.details,
			message: error.message,
			retryable: error.retryable,
			status: error.status
		};
	}
	if (error instanceof Error) return {
		classification: "transient",
		code: "unknown_error",
		message: error.message,
		retryable: true
	};
	return {
		classification: "transient",
		code: "unknown_error",
		message: "DocRaptor async render failed.",
		retryable: true
	};
}
function calculateDocRaptorRetryDelay(attemptNumber, policy = {}) {
	const normalized = normalizeRetryPolicy(policy);
	const exponent = Math.max(0, attemptNumber - 1);
	const rawDelay = normalized.initialDelayMs * normalized.multiplier ** exponent;
	return Math.min(normalized.maxDelayMs, Math.round(rawDelay));
}
function summarizeDocRaptorAsyncRenderExecutions(results) {
	const summary = {
		canceled: 0,
		failed: 0,
		succeeded: 0,
		total: results.length
	};
	for (const result of results) if (result.status === "succeeded") summary.succeeded += 1;
	else if (result.status === "failed") summary.failed += 1;
	else summary.canceled += 1;
	const terminalKinds = [
		summary.succeeded > 0,
		summary.failed > 0,
		summary.canceled > 0
	].filter(Boolean).length;
	return {
		...summary,
		partial: terminalKinds > 1
	};
}
function normalizeDocRaptorAsyncCallbackPayload(payload, receivedAt) {
	const raw = isRecord$1(payload) ? payload : {};
	return {
		downloadUrl: readString$1(raw, "download_url"),
		numberOfPages: readNumber$1(raw, "number_of_pages"),
		raw,
		receivedAt,
		status: readAsyncStatusValue$1(raw),
		statusId: readString$1(raw, "status_id"),
		validationErrors: normalizeValidationErrors$1(raw.validation_errors)
	};
}
function createSucceededAttempt(attemptNumber, asyncJob) {
	return {
		attempt: attemptNumber,
		retryable: false,
		status: "succeeded",
		statusId: asyncJob.statusId,
		statusUrl: asyncJob.statusUrl
	};
}
function createFailedStatusAttempt(input) {
	return {
		attempt: input.attemptNumber,
		classification: "permanent",
		errorCode: "docraptor_failed_status",
		message: input.status.message ?? "DocRaptor async render failed.",
		retryable: false,
		status: "failed",
		statusId: input.asyncJob.statusId,
		statusUrl: input.asyncJob.statusUrl,
		validationErrors: input.status.validationErrors
	};
}
function createErrorAttempt(input) {
	return {
		attempt: input.attemptNumber,
		classification: input.classification.classification,
		errorCode: input.classification.code,
		message: input.classification.message,
		nextRetryDelayMs: input.nextRetryDelayMs,
		retryable: input.retryable,
		status: input.classification.classification === "canceled" ? "canceled" : "failed"
	};
}
function createExecutionResult(input) {
	return {
		attempts: input.attempts,
		downloadUrl: input.downloadUrl,
		idempotency: input.asyncJob?.idempotency ?? input.request.idempotency,
		kind: "async_render_execution",
		logs: input.logs,
		numberOfPages: input.numberOfPages,
		request: input.request,
		status: input.status,
		statusId: input.asyncJob?.statusId,
		statusUrl: input.asyncJob?.statusUrl,
		validationErrors: input.validationErrors
	};
}
function createPollOptions(policy, signal) {
	return {
		intervalMs: policy.intervalMs,
		maxAttempts: policy.maxAttempts,
		signal,
		timeoutMs: policy.timeoutMs
	};
}
function createLogEmitter(input, logs) {
	return (entry) => {
		const logEntry = redactStructuredLogEntry({
			...entry,
			at: input.now?.()
		}, input.redactValues ?? []);
		logs.push(logEntry);
		input.logger?.(logEntry);
	};
}
function redactStructuredLogEntry(entry, redactValues) {
	return {
		...entry,
		details: entry.details ? redactUnknown(entry.details, redactValues) : void 0,
		message: redactString(entry.message, redactValues)
	};
}
async function sleepBeforeRetry(input, delayMs, signal) {
	await (input.sleep ?? defaultSleep)(delayMs, signal);
}
async function defaultSleep(delayMs, signal) {
	if (delayMs <= 0) return;
	await new Promise((resolve, reject) => {
		const timeout = setTimeout(resolve, delayMs);
		const abort = () => {
			clearTimeout(timeout);
			reject(new DocRaptorClientError({
				code: "aborted",
				message: "DocRaptor request was aborted.",
				retryable: false
			}));
		};
		signal?.addEventListener("abort", abort, { once: true });
	});
}
function normalizeRetryPolicy(policy = {}) {
	return {
		initialDelayMs: normalizeNonNegativeInteger(policy.initialDelayMs, defaultRetryPolicy.initialDelayMs),
		maxAttempts: Math.max(1, normalizeNonNegativeInteger(policy.maxAttempts, defaultRetryPolicy.maxAttempts)),
		maxDelayMs: normalizeNonNegativeInteger(policy.maxDelayMs, defaultRetryPolicy.maxDelayMs),
		multiplier: normalizePositiveNumber(policy.multiplier, defaultRetryPolicy.multiplier)
	};
}
function normalizePollPolicy(policy = {}) {
	return {
		intervalMs: normalizeNonNegativeInteger(policy.intervalMs, defaultPollPolicy.intervalMs),
		maxAttempts: Math.max(1, normalizeNonNegativeInteger(policy.maxAttempts, defaultPollPolicy.maxAttempts)),
		timeoutMs: policy.timeoutMs
	};
}
function normalizeNonNegativeInteger(value, fallback) {
	if (value === void 0 || !Number.isFinite(value)) return fallback;
	return Math.max(0, Math.floor(value));
}
function normalizePositiveNumber(value, fallback) {
	if (value === void 0 || !Number.isFinite(value) || value <= 0) return fallback;
	return value;
}
function throwIfCanceled(signal) {
	if (!signal?.aborted) return;
	throw new DocRaptorClientError({
		code: "aborted",
		message: "DocRaptor request was aborted.",
		retryable: false
	});
}
function readAsyncStatusValue$1(value) {
	const status = readString$1(value, "status");
	if (status === "queued" || status === "working" || status === "completed" || status === "failed") return status;
	return "unknown";
}
function normalizeValidationErrors$1(value) {
	if (Array.isArray(value)) {
		const errors = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => item.length > 0);
		return errors.length > 0 ? errors : void 0;
	}
	if (typeof value === "string") {
		const errors = value.split(/\r?\n/u).map((item) => item.trim()).filter((item) => item.length > 0);
		return errors.length > 0 ? errors : void 0;
	}
}
function readString$1(value, key) {
	const candidate = value[key];
	return typeof candidate === "string" && candidate.length > 0 ? candidate : void 0;
}
function readNumber$1(value, key) {
	const candidate = value[key];
	return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : void 0;
}
function redactUnknown(value, redactValues) {
	if (typeof value === "string") return redactString(value, redactValues);
	if (Array.isArray(value)) return value.map((item) => redactUnknown(item, redactValues));
	if (isRecord$1(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => {
		if (isSecretLikeKey(key)) return [key, "[redacted]"];
		return [key, redactUnknown(item, redactValues)];
	}));
	return value;
}
function redactString(value, redactValues) {
	let redacted = value;
	for (const secret of redactValues) if (secret.length > 0) redacted = redacted.split(secret).join("[redacted]");
	redacted = redacted.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/giu, "Bearer [redacted]");
	redacted = redacted.replace(/\b[rs]k_(?:live|test)_[A-Za-z0-9]+/gu, "[redacted]");
	redacted = redacted.replace(/\bAKIA[0-9A-Z]{16}\b/gu, "[redacted]");
	redacted = redacted.replace(/(api[_-]?key|authorization|cookie|password|secret|token)(\s*[=:]\s*)[^\s,;]+/giu, "$1$2[redacted]");
	redacted = redacted.replace(/([?&](?:x-amz-signature|x-amz-credential|x-amz-security-token|x-goog-signature|signature|sig|token|access_token|policy|key-pair-id)=)[^&#\s]+/giu, "$1[redacted]");
	return redacted;
}
function isSecretLikeKey(key) {
	return /api[_-]?key|authorization|cookie|password|secret|token/iu.test(key);
}
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region src/client.ts
const defaultApiBaseUrl = "https://api.docraptor.com";
const defaultStatusBaseUrl = "https://docraptor.com";
const defaultTimeoutMs = 6e4;
const defaultPollIntervalMs = 1e3;
const defaultMaxPollAttempts = 60;
const completedStatuses = new Set(["completed", "failed"]);
function createDocRaptorClient(config) {
	assertDocRaptorServerRuntime();
	const normalizedConfig = normalizeConfig(config);
	return {
		createAsyncRender: (input) => createAsyncRender(normalizedConfig, input),
		getAsyncRenderStatus: (statusId, options) => getAsyncRenderStatus(normalizedConfig, statusId, options),
		pollAsyncRenderStatus: (statusId, options) => pollAsyncRenderStatus(normalizedConfig, statusId, options),
		renderSync: (input) => renderSync(normalizedConfig, input)
	};
}
async function renderSync(config, input) {
	const payload = createDocumentPayload(config, input, false);
	const url = createEndpointUrl(config.apiBaseUrl, "/docs");
	const request = createRequestMetadata(config, input, url, "POST");
	const response = await sendJsonRequest(config, {
		apiKey: config.apiKey,
		body: JSON.stringify(payload),
		defaultTimeoutMs: config.defaultTimeoutMs,
		headers: createJsonHeaders(config.apiKey, "application/pdf"),
		method: "POST",
		signal: input.signal,
		timeoutMs: input.timeoutMs,
		url
	});
	const pdf = new Uint8Array(await readResponseArrayBuffer(response));
	const contentType = response.headers.get("content-type") ?? "application/pdf";
	const pageCount = readPositiveIntegerHeader(response.headers, "x-docraptor-num-pages");
	return {
		contentType,
		idempotency: input.idempotency,
		kind: "sync",
		pageCount,
		pdf,
		request
	};
}
async function createAsyncRender(config, input) {
	const payload = createDocumentPayload(config, input, true);
	const url = createEndpointUrl(config.apiBaseUrl, "/docs");
	const request = createRequestMetadata(config, input, url, "POST");
	const body = await readJsonObject(await sendJsonRequest(config, {
		apiKey: config.apiKey,
		body: JSON.stringify(payload),
		defaultTimeoutMs: config.defaultTimeoutMs,
		headers: createJsonHeaders(config.apiKey, "application/json"),
		method: "POST",
		signal: input.signal,
		timeoutMs: input.timeoutMs,
		url
	}), config.apiKey);
	const statusId = readString(body, "status_id");
	if (!statusId) throw new DocRaptorClientError({
		code: "invalid_response",
		details: { response: sanitizeUnknown(body, config.apiKey) },
		message: "DocRaptor async render response did not include status_id.",
		retryable: false
	});
	return {
		idempotency: input.idempotency,
		kind: "async_job",
		request,
		statusId,
		statusUrl: createStatusUrl(config.statusBaseUrl, statusId)
	};
}
async function getAsyncRenderStatus(config, statusId, options = {}) {
	const url = createStatusUrl(config.statusBaseUrl, statusId);
	const body = await readJsonObject(await sendJsonRequest(config, {
		apiKey: config.apiKey,
		defaultTimeoutMs: config.defaultTimeoutMs,
		headers: createJsonHeaders(config.apiKey, "application/json", false),
		method: "GET",
		signal: options.signal,
		timeoutMs: options.timeoutMs,
		url
	}), config.apiKey);
	const status = readAsyncStatusValue(body);
	return {
		downloadUrl: readString(body, "download_url"),
		message: readString(body, "message"),
		numberOfPages: readNumber(body, "number_of_pages"),
		raw: body,
		status,
		statusId,
		validationErrors: normalizeValidationErrors(body.validation_errors)
	};
}
async function pollAsyncRenderStatus(config, statusId, options = {}) {
	const maxAttempts = options.maxAttempts ?? defaultMaxPollAttempts;
	const intervalMs = options.intervalMs ?? defaultPollIntervalMs;
	const timeoutAt = options.timeoutMs === void 0 ? void 0 : Date.now() + options.timeoutMs;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		throwIfAborted(options.signal);
		throwIfPollTimedOut(timeoutAt);
		const status = await getAsyncRenderStatus(config, statusId, {
			signal: options.signal,
			timeoutMs: timeoutAt === void 0 ? options.timeoutMs : Math.max(0, timeoutAt - Date.now())
		});
		if (completedStatuses.has(status.status)) return status;
		if (attempt < maxAttempts) await sleep(intervalMs, options.signal, timeoutAt);
	}
	throw new DocRaptorClientError({
		code: "timeout",
		details: {
			maxAttempts,
			statusId
		},
		message: `DocRaptor async status polling exceeded ${maxAttempts} attempts.`,
		retryable: true
	});
}
async function sendJsonRequest(config, request) {
	const abortState = createAbortState(request);
	try {
		const response = await config.fetch(request.url, {
			body: request.body,
			headers: request.headers,
			method: request.method,
			signal: abortState.signal
		});
		if (!response.ok) throw await createHttpError(response, request.apiKey);
		return response;
	} catch (error) {
		if (error instanceof DocRaptorClientError) throw error;
		const abortReason = abortState.getReason();
		if (abortReason === "timeout") throw new DocRaptorClientError({
			code: "timeout",
			message: "DocRaptor request timed out.",
			retryable: true,
			cause: error
		});
		if (abortReason === "aborted" || request.signal?.aborted) throw new DocRaptorClientError({
			code: "aborted",
			message: "DocRaptor request was aborted.",
			retryable: false,
			cause: error
		});
		throw new DocRaptorClientError({
			code: "network_error",
			message: "DocRaptor request failed before receiving a response.",
			retryable: true,
			cause: error
		});
	} finally {
		abortState.cleanup();
	}
}
function normalizeConfig(config) {
	const apiKey = config.apiKey.trim();
	if (!apiKey) throw new DocRaptorClientError({
		code: "missing_api_key",
		message: "DocRaptor API key is required.",
		retryable: false
	});
	return {
		apiBaseUrl: config.apiBaseUrl ?? defaultApiBaseUrl,
		apiKey,
		defaultTimeoutMs: config.defaultTimeoutMs ?? defaultTimeoutMs,
		fetch: config.fetch ?? globalThis.fetch.bind(globalThis),
		mode: config.mode ?? "test",
		statusBaseUrl: config.statusBaseUrl ?? defaultStatusBaseUrl
	};
}
function createDocumentPayload(config, input, isAsyncRender) {
	const media = input.media ?? "print";
	const tag = input.tag ?? input.idempotency?.key;
	const pdfMetadata = input.pdfMetadata === void 0 ? void 0 : parsePdfMetadata(input.pdfMetadata);
	const pdfProfile = input.pdfProfile === void 0 ? void 0 : parsePdfProfile(input.pdfProfile);
	const princeOptions = {
		media,
		...input.baseUrl ? { baseurl: input.baseUrl } : {},
		...pdfMetadata?.title ? { pdf_title: pdfMetadata.title } : {},
		...pdfProfile?.profile ? { profile: pdfProfile.profile } : {}
	};
	return {
		...isAsyncRender ? { async: true } : {},
		...isAsyncRender && input.callbackUrl ? { callback_url: input.callbackUrl } : {},
		...input.name ? { name: input.name } : {},
		...tag ? { tag } : {},
		document_content: input.html,
		prince_options: princeOptions,
		test: config.mode === "test",
		type: "pdf"
	};
}
function createRequestMetadata(config, input, url, method) {
	const pdfMetadata = input.pdfMetadata === void 0 ? void 0 : parsePdfMetadata(input.pdfMetadata);
	const pdfProfile = input.pdfProfile === void 0 ? void 0 : parsePdfProfile(input.pdfProfile);
	return {
		idempotency: input.idempotency,
		media: input.media ?? "print",
		method,
		mode: config.mode,
		...pdfMetadata ? { pdfMetadata } : {},
		...pdfProfile ? { pdfProfile } : {},
		tag: input.tag ?? input.idempotency?.key,
		test: config.mode === "test",
		url
	};
}
function parsePdfMetadata(metadata) {
	try {
		return PdfDocumentMetadataSchema.parse(metadata ?? {});
	} catch (error) {
		throw createInvalidRequestError("Invalid PDF metadata.", error);
	}
}
function parsePdfProfile(profile) {
	try {
		return PdfDocumentProfileOptionsSchema.parse(profile ?? {});
	} catch (error) {
		throw createInvalidRequestError("Invalid PDF profile options.", error);
	}
}
function createInvalidRequestError(message, error) {
	return new DocRaptorClientError({
		code: "invalid_request",
		details: { message: error instanceof Error ? error.message : String(error) },
		message,
		retryable: false
	});
}
function createJsonHeaders(apiKey, accept, hasBody = true) {
	return {
		accept,
		authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
		...hasBody ? { "content-type": "application/json" } : {}
	};
}
function createEndpointUrl(baseUrl, path) {
	return new URL(path, ensureTrailingSlash(baseUrl)).toString();
}
function createStatusUrl(statusBaseUrl, statusId) {
	return createEndpointUrl(statusBaseUrl, `/status/${encodeURIComponent(statusId)}`);
}
function ensureTrailingSlash(value) {
	return value.endsWith("/") ? value : `${value}/`;
}
function readPositiveIntegerHeader(headers, name) {
	const value = headers.get(name);
	if (!value) return;
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : void 0;
}
async function createHttpError(response, apiKey) {
	const details = await readDocRaptorErrorDetails(response, apiKey);
	const retryable = isRetryableHttpStatus(response.status);
	const code = selectHttpErrorCode(response.status, details.errors);
	const messageSuffix = details.errors && details.errors.length > 0 ? `: ${details.errors.join("; ")}` : "";
	return new DocRaptorClientError({
		code,
		details,
		message: `DocRaptor request failed with HTTP ${response.status}${messageSuffix}.`,
		retryable,
		status: response.status
	});
}
function selectHttpErrorCode(status, errors) {
	if (isRetryableHttpStatus(status)) return "http_error";
	if (errors && errors.length > 0) return "docraptor_error";
	return "http_error";
}
async function readDocRaptorErrorDetails(response, apiKey) {
	const sanitizedBody = redactSecret(await response.text(), apiKey);
	const errors = (response.headers.get("content-type") ?? "").includes("json") ? readJsonErrors(sanitizedBody) : readXmlErrors(sanitizedBody);
	const details = {
		body: sanitizedBody,
		statusText: response.statusText
	};
	if (errors.length > 0) details.errors = errors;
	return details;
}
function readJsonErrors(body) {
	const parsed = parseJsonObject(body);
	if (!parsed) return [];
	return normalizeValidationErrors([
		parsed.error,
		parsed.errors,
		parsed.message,
		parsed.validation_errors
	].find(Boolean)) ?? [];
}
function readXmlErrors(body) {
	return [...body.matchAll(/<error>([\s\S]*?)<\/error>/giu)].map((match) => decodeXmlEntities(match[1] ?? "").trim()).filter((message) => message.length > 0);
}
async function readJsonObject(response, apiKey) {
	const body = await readResponseText(response);
	const parsed = parseJsonObject(redactSecret(body, apiKey));
	if (!parsed) throw new DocRaptorClientError({
		code: "invalid_response",
		details: { body: redactSecret(body, apiKey) },
		message: "DocRaptor returned an invalid JSON response.",
		retryable: false
	});
	return parsed;
}
async function readResponseArrayBuffer(response) {
	try {
		return await response.arrayBuffer();
	} catch (error) {
		throw createBodyReadError(error);
	}
}
async function readResponseText(response) {
	try {
		return await response.text();
	} catch (error) {
		throw createBodyReadError(error);
	}
}
function createBodyReadError(error) {
	return new DocRaptorClientError({
		cause: error,
		code: "network_error",
		message: "DocRaptor response body could not be read.",
		retryable: true
	});
}
function parseJsonObject(value) {
	try {
		const parsed = JSON.parse(value);
		return isRecord(parsed) ? parsed : void 0;
	} catch {
		return;
	}
}
function readString(value, key) {
	const candidate = value[key];
	return typeof candidate === "string" && candidate.length > 0 ? candidate : void 0;
}
function readNumber(value, key) {
	const candidate = value[key];
	return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : void 0;
}
function readAsyncStatusValue(value) {
	const status = readString(value, "status");
	if (status === "queued" || status === "working" || status === "completed" || status === "failed") return status;
	return "unknown";
}
function normalizeValidationErrors(value) {
	if (Array.isArray(value)) {
		const errors = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => item.length > 0);
		return errors.length > 0 ? errors : void 0;
	}
	if (typeof value === "string") {
		const errors = value.split(/\r?\n/u).map((item) => item.trim()).filter((item) => item.length > 0);
		return errors.length > 0 ? errors : void 0;
	}
}
function createAbortState(request) {
	const controller = new AbortController();
	const timeoutMs = request.timeoutMs ?? request.defaultTimeoutMs;
	let reason;
	let timeout;
	const abortFromCaller = () => {
		reason = "aborted";
		controller.abort(request.signal?.reason);
	};
	if (request.signal?.aborted) abortFromCaller();
	else if (request.signal) request.signal.addEventListener("abort", abortFromCaller, { once: true });
	if (timeoutMs > 0) timeout = setTimeout(() => {
		reason = "timeout";
		controller.abort();
	}, timeoutMs);
	return {
		cleanup: () => {
			if (timeout) clearTimeout(timeout);
			request.signal?.removeEventListener("abort", abortFromCaller);
		},
		getReason: () => reason,
		signal: controller.signal
	};
}
function throwIfAborted(signal) {
	if (signal?.aborted) throw new DocRaptorClientError({
		code: "aborted",
		message: "DocRaptor request was aborted.",
		retryable: false
	});
}
function throwIfPollTimedOut(timeoutAt) {
	if (timeoutAt !== void 0 && Date.now() >= timeoutAt) throw new DocRaptorClientError({
		code: "timeout",
		message: "DocRaptor async status polling timed out.",
		retryable: true
	});
}
async function sleep(intervalMs, signal, timeoutAt) {
	throwIfAborted(signal);
	throwIfPollTimedOut(timeoutAt);
	const remainingMs = timeoutAt === void 0 ? intervalMs : Math.min(intervalMs, timeoutAt - Date.now());
	if (remainingMs <= 0) {
		throwIfPollTimedOut(timeoutAt);
		return;
	}
	await new Promise((resolve, reject) => {
		const cleanup = () => {
			signal?.removeEventListener("abort", abort);
		};
		const timeout = setTimeout(() => {
			cleanup();
			resolve();
		}, remainingMs);
		const abort = () => {
			clearTimeout(timeout);
			cleanup();
			reject(new DocRaptorClientError({
				code: "aborted",
				message: "DocRaptor request was aborted.",
				retryable: false
			}));
		};
		signal?.addEventListener("abort", abort, { once: true });
	});
}
function sanitizeUnknown(value, apiKey) {
	if (typeof value === "string") return redactSecret(value, apiKey);
	if (Array.isArray(value)) return value.map((item) => sanitizeUnknown(item, apiKey));
	if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeUnknown(item, apiKey)]));
	return value;
}
function redactSecret(value, apiKey) {
	return value.split(apiKey).join("[redacted]");
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function decodeXmlEntities(value) {
	return value.replaceAll("&quot;", "\"").replaceAll("&apos;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}
//#endregion
//#region src/index.ts
assertDocRaptorServerRuntime();
const docraptorClientBoundary = {
	packageName: "@asym/docraptor-client",
	maturity: "phase-36-accessibility-metadata",
	owns: "docraptor-client",
	runtime: "server-only",
	secretPolicy: "credentials-stay-server-side"
};
//#endregion
export { DocRaptorClientError, calculateDocRaptorRetryDelay, classifyDocRaptorRenderError, createDocRaptorClient, docraptorClientBoundary, executeDocRaptorAsyncRender, normalizeDocRaptorAsyncCallbackPayload, summarizeDocRaptorAsyncRenderExecutions };

//# sourceMappingURL=index.mjs.map