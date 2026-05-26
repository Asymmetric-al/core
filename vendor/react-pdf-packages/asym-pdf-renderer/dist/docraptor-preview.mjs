import { a as preparePdfPreviewDocument, i as normalizeDiagnosticInput, n as createDocRaptorTestPreviewMetadata, r as createPdfPreviewResult } from "./preview-BmcBZiCw.mjs";
import { DocRaptorClientError, createDocRaptorClient } from "@asym/docraptor-client";
//#region src/docraptor-preview.ts
const docraptorPreviewBoundary = {
	packageName: "@asym/pdf-renderer/docraptor-preview",
	maturity: "phase-28-branding",
	owns: "docraptor-test-preview",
	runtime: "server-only",
	consumes: ["@asym/pdf-template-schema", "@asym/docraptor-client"]
};
async function createDocRaptorTestPdfPreview(request) {
	const prepared = await preparePdfPreviewDocument(request, "docraptor-test");
	if (!prepared.ok) return prepared.result;
	try {
		const renderResult = await createDocRaptorClient(createClientConfig(request)).renderSync({
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
		return createPdfPreviewResult({
			artifacts: [{
				bytes: renderResult.pdf,
				kind: "pdf-bytes",
				mimeType: renderResult.contentType,
				sizeBytes: renderResult.pdf.byteLength
			}],
			diagnostics: prepared.diagnostics,
			durationMs: measureDuration(prepared.startedAt, prepared.now),
			metadata: createDocRaptorTestPreviewMetadata(sanitizeRequestMetadata(renderResult.request)),
			mode: "docraptor-test",
			previewId: prepared.previewId,
			snapshots: prepared.snapshots
		});
	} catch (error) {
		return createPdfPreviewResult({
			artifacts: [],
			diagnostics: [...prepared.diagnostics, normalizeDocRaptorError(error)],
			durationMs: measureDuration(prepared.startedAt, prepared.now),
			metadata: createDocRaptorTestPreviewMetadata(),
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
	if (error instanceof DocRaptorClientError) return normalizeDiagnosticInput({
		code: `docraptor_${error.code}`,
		details: {
			retryable: error.retryable,
			status: error.status
		},
		message: error.message,
		severity: "error"
	}, "docraptor");
	return normalizeDiagnosticInput({
		code: "docraptor_unknown_error",
		message: error instanceof Error ? error.message : "DocRaptor test preview failed.",
		severity: "error"
	}, "docraptor");
}
function measureDuration(startedAt, now) {
	return Math.max(0, now() - startedAt);
}
//#endregion
export { createDocRaptorTestPdfPreview, docraptorPreviewBoundary };

//# sourceMappingURL=docraptor-preview.mjs.map