Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_preview = require("./preview-DfRauC4f.cjs");
let _asym_docraptor_client = require("@asym/docraptor-client");
//#region src/docraptor-preview.ts
const docraptorPreviewBoundary = {
	packageName: "@asym/pdf-renderer/docraptor-preview",
	maturity: "phase-28-branding",
	owns: "docraptor-test-preview",
	runtime: "server-only",
	consumes: ["@asym/pdf-template-schema", "@asym/docraptor-client"]
};
async function createDocRaptorTestPdfPreview(request) {
	const prepared = await require_preview.preparePdfPreviewDocument(request, "docraptor-test");
	if (!prepared.ok) return prepared.result;
	try {
		const renderResult = await (0, _asym_docraptor_client.createDocRaptorClient)(createClientConfig(request)).renderSync({
			baseUrl: request.baseUrl,
			html: prepared.snapshots.html,
			media: "print",
			name: request.name ?? prepared.template.name,
			pdfMetadata: prepared.template.pdfSettings.metadata,
			pdfProfile: prepared.template.pdfSettings.profile,
			signal: request.signal,
			tag: request.tag ?? prepared.previewId,
			timeoutMs: request.timeoutMs
		});
		return require_preview.createPdfPreviewResult({
			artifacts: [{
				bytes: renderResult.pdf,
				kind: "pdf-bytes",
				mimeType: renderResult.contentType,
				sizeBytes: renderResult.pdf.byteLength
			}],
			diagnostics: prepared.diagnostics,
			durationMs: measureDuration(prepared.startedAt, prepared.now),
			metadata: require_preview.createDocRaptorTestPreviewMetadata(sanitizeRequestMetadata(renderResult.request)),
			mode: "docraptor-test",
			previewId: prepared.previewId,
			snapshots: prepared.snapshots
		});
	} catch (error) {
		return require_preview.createPdfPreviewResult({
			artifacts: [],
			diagnostics: [...prepared.diagnostics, normalizeDocRaptorError(error)],
			durationMs: measureDuration(prepared.startedAt, prepared.now),
			metadata: require_preview.createDocRaptorTestPreviewMetadata(),
			mode: "docraptor-test",
			previewId: prepared.previewId,
			snapshots: prepared.snapshots
		});
	}
}
function createClientConfig(request) {
	return {
		apiKey: request.apiKey,
		apiBaseUrl: request.apiBaseUrl,
		defaultTimeoutMs: request.defaultTimeoutMs,
		fetch: request.fetch,
		mode: "test",
		statusBaseUrl: request.statusBaseUrl
	};
}
function sanitizeRequestMetadata(request) {
	return {
		media: request.media,
		method: request.method,
		mode: request.mode,
		tag: request.tag,
		test: request.test,
		url: request.url
	};
}
function normalizeDocRaptorError(error) {
	if (error instanceof _asym_docraptor_client.DocRaptorClientError) return require_preview.normalizeDiagnosticInput({
		code: `docraptor_${error.code}`,
		details: {
			retryable: error.retryable,
			status: error.status
		},
		message: error.message,
		severity: "error"
	}, "docraptor");
	return require_preview.normalizeDiagnosticInput({
		code: "docraptor_unknown_error",
		message: error instanceof Error ? error.message : "DocRaptor test preview failed.",
		severity: "error"
	}, "docraptor");
}
function measureDuration(startedAt, now) {
	return Math.max(0, now() - startedAt);
}
//#endregion
exports.createDocRaptorTestPdfPreview = createDocRaptorTestPdfPreview;
exports.docraptorPreviewBoundary = docraptorPreviewBoundary;
