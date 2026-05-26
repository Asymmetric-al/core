Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _asym_pdf_template_schema = require("@asym/pdf-template-schema");
//#region src/local-renderer.ts
const localRendererBoundary = {
	packageName: "@asym/pdf-renderer/local-renderer",
	maturity: "phase-35-local-renderer",
	owns: "playwright-local-renderer",
	runtime: "node-dev-test-only",
	consumes: ["@asym/pdf-template-schema"]
};
const productionFidelityMessage = "Local Playwright output is for development smoke tests only. DocRaptor remains the production-fidelity renderer.";
const standardPageSizes = {
	a4: {
		width: "210mm",
		height: "297mm"
	},
	legal: {
		width: "8.5in",
		height: "14in"
	},
	letter: {
		width: "8.5in",
		height: "11in"
	}
};
async function renderPlaywrightLocalPdf(input) {
	const now = input.now ?? defaultNow;
	const startedAt = now();
	const pageSettingsResult = _asym_pdf_template_schema.DocumentPageSettingsSchema.safeParse(input.pageSettings ?? {});
	if (!pageSettingsResult.success) {
		const page = resolvePageBox(_asym_pdf_template_schema.DocumentPageSettingsSchema.parse({}));
		return createResult({
			artifacts: [],
			diagnostics: pageSettingsResult.error.issues.map((issue) => ({
				code: "invalid_page_settings",
				details: {
					issueCode: issue.code,
					path: issue.path.map(String)
				},
				message: issue.message,
				severity: "error",
				source: "page-settings"
			})),
			durationMs: measureDuration(startedAt, now),
			page,
			status: "error"
		});
	}
	const pageBox = resolvePageBox(pageSettingsResult.data);
	const html = composeLocalRendererHtml(input.html, input.css);
	const setContentOptions = input.setContentOptions ?? { waitUntil: "networkidle" };
	const launchOptions = input.launchOptions ?? { headless: true };
	let browser;
	let page;
	try {
		browser = await input.browserLauncher.launch(launchOptions);
		page = await browser.newPage();
		await page.setContent(html, setContentOptions);
		const artifacts = [createArtifact("pdf-bytes", "application/pdf", await page.pdf(createPdfOptions(pageBox)))];
		if (input.includeScreenshot) {
			if (!page.screenshot) throw new Error("The injected Playwright page does not support screenshot output.");
			const screenshotBytes = await page.screenshot({
				fullPage: true,
				type: "png"
			});
			artifacts.push(createArtifact("screenshot-png", "image/png", screenshotBytes));
		}
		return createResult({
			artifacts,
			diagnostics: [],
			durationMs: measureDuration(startedAt, now),
			page: pageBox,
			status: "success"
		});
	} catch (error) {
		const diagnostic = createRenderErrorDiagnostic(error);
		const status = diagnostic.code === "playwright_browser_unavailable" ? "skipped" : "error";
		return createResult({
			artifacts: [],
			diagnostics: [diagnostic],
			durationMs: measureDuration(startedAt, now),
			page: pageBox,
			status
		});
	} finally {
		await closePlaywrightPage(page);
		await closePlaywrightBrowser(browser);
	}
}
function isPlaywrightBrowserUnavailable(error) {
	const message = getErrorMessage(error).toLowerCase();
	return [
		"browser executable",
		"executable doesn't exist",
		"please run playwright install",
		"browser has not been installed",
		"failed to launch",
		"enoent"
	].some((pattern) => message.includes(pattern));
}
function composeLocalRendererHtml(html, css) {
	const trimmedHtml = html.trim();
	if (isFullHtmlDocument(trimmedHtml)) return css ? injectCssIntoHtmlDocument(trimmedHtml, css) : trimmedHtml;
	return [
		"<!doctype html>",
		"<html>",
		"<head>",
		"<meta charset=\"utf-8\">",
		css ? `<style>${css}</style>` : "",
		"</head>",
		"<body>",
		trimmedHtml,
		"</body>",
		"</html>"
	].join("");
}
function isFullHtmlDocument(html) {
	const normalizedHtml = html.toLowerCase();
	return normalizedHtml.startsWith("<!doctype html") || normalizedHtml.startsWith("<html");
}
function injectCssIntoHtmlDocument(html, css) {
	const styleTag = `<style>${css}</style>`;
	if (html.includes("</head>")) return html.replace("</head>", `${styleTag}</head>`);
	return `${styleTag}${html}`;
}
function createPdfOptions(page) {
	return {
		height: page.height,
		margin: {
			bottom: page.margins.bottom,
			left: page.margins.left,
			right: page.margins.right,
			top: page.margins.top
		},
		preferCSSPageSize: true,
		printBackground: true,
		width: page.width
	};
}
function resolvePageBox(settings) {
	const baseSize = settings.pageSize === "custom" ? resolveCustomPageSize(settings) : standardPageSizes[settings.pageSize];
	const dimensions = settings.orientation === "landscape" ? {
		height: baseSize.width,
		width: baseSize.height
	} : baseSize;
	return {
		height: dimensions.height,
		margins: settings.margins,
		orientation: settings.orientation,
		pageSize: settings.pageSize,
		width: dimensions.width
	};
}
function resolveCustomPageSize(settings) {
	const customSize = settings.customSize;
	if (!customSize) throw new Error("Invariant violation: customSize is required when pageSize is \"custom\".");
	return {
		height: `${customSize.height}${customSize.unit}`,
		width: `${customSize.width}${customSize.unit}`
	};
}
function createRenderErrorDiagnostic(error) {
	const message = getErrorMessage(error);
	if (isPlaywrightBrowserUnavailable(error)) return {
		code: "playwright_browser_unavailable",
		message: "Playwright browser binaries are unavailable. Install browser binaries to enable local PDF smoke rendering.",
		severity: "warning",
		source: "playwright",
		details: { originalMessage: message }
	};
	return {
		code: "local_renderer_failed",
		message,
		severity: "error",
		source: "local-renderer"
	};
}
function createArtifact(kind, mimeType, bytes) {
	return {
		bytes,
		kind,
		mimeType,
		sizeBytes: bytes.byteLength
	};
}
function createResult(input) {
	return {
		artifacts: input.artifacts,
		diagnostics: input.diagnostics,
		durationMs: input.durationMs,
		errors: input.diagnostics.filter((diagnostic) => diagnostic.severity === "error"),
		metadata: {
			finalPdfFidelity: false,
			message: productionFidelityMessage,
			page: input.page,
			productionRender: false,
			productionRenderer: "docraptor",
			renderer: "playwright-local"
		},
		status: input.status,
		warnings: input.diagnostics.filter((diagnostic) => diagnostic.severity === "warning")
	};
}
async function closePlaywrightPage(page) {
	if (!page?.close) return;
	await page.close();
}
async function closePlaywrightBrowser(browser) {
	if (!browser) return;
	await browser.close();
}
function getErrorMessage(error) {
	if (error instanceof Error) return error.message;
	return String(error);
}
function measureDuration(startedAt, now) {
	return Math.max(0, now() - startedAt);
}
function defaultNow() {
	return Date.now();
}
//#endregion
exports.isPlaywrightBrowserUnavailable = isPlaywrightBrowserUnavailable;
exports.localRendererBoundary = localRendererBoundary;
exports.renderPlaywrightLocalPdf = renderPlaywrightLocalPdf;
