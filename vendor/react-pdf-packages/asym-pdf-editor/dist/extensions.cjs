Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _asym_pdf_template_schema = require("@asym/pdf-template-schema");
let _tiptap_core = require("@tiptap/core");
//#region src/extensions/asset-image/index.ts
const assetImageAttribute = "data-asym-asset-image";
function createAssetImageExtension() {
	return _tiptap_core.Node.create({
		name: "assetImage",
		atom: true,
		defining: true,
		group: "block",
		isolating: true,
		selectable: true,
		addAttributes() {
			return {
				asset: {
					default: null,
					parseHTML: (element) => readAssetFromElement(element)
				},
				assetId: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-id"))
				},
				role: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-role"))
				},
				url: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-url"))
				},
				renderSafeUrl: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-render-safe-url"))
				},
				mimeType: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-mime-type"))
				},
				altText: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-alt-text"))
				},
				width: {
					default: null,
					parseHTML: (element) => readNumberAttribute(element, "data-asset-width")
				},
				height: {
					default: null,
					parseHTML: (element) => readNumberAttribute(element, "data-asset-height")
				},
				alignment: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-alignment"))
				},
				linkUrl: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-link-url"))
				},
				renderSafe: {
					default: null,
					parseHTML: (element) => element.getAttribute("data-asset-render-safe") === "true"
				},
				tenantId: {
					default: null,
					parseHTML: (element) => readOptionalString$4(element.getAttribute("data-asset-tenant-id"))
				},
				source: {
					default: null,
					parseHTML: (element) => readSourceFromElement(element)
				}
			};
		},
		parseHTML() {
			return [{ tag: `figure[${assetImageAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeAssetImageAttributes(HTMLAttributes);
			const preview = getAssetImagePreview(attrs ?? {});
			const asset = attrs?.asset;
			const role = asset?.role ?? attrs?.role ?? "image";
			const src = asset?.renderSafeUrl ?? asset?.url ?? attrs?.renderSafeUrl ?? attrs?.url ?? "";
			const altText = asset?.altText ?? attrs?.altText ?? "";
			return [
				"figure",
				(0, _tiptap_core.mergeAttributes)({
					[assetImageAttribute]: "true",
					...asset ? { "data-asset": stringifyAsset(asset) } : {},
					...asset?.id ? { "data-asset-reference-id": asset.id } : {},
					...asset?.assetId ?? attrs?.assetId ? { "data-asset-id": asset?.assetId ?? attrs?.assetId } : {},
					"data-asset-role": role,
					...src ? { "data-asset-url": src } : {},
					...asset?.mimeType ?? attrs?.mimeType ? { "data-asset-mime-type": asset?.mimeType ?? attrs?.mimeType } : {},
					...altText ? { "data-asset-alt-text": altText } : {},
					...asset?.width ?? attrs?.width ? { "data-asset-width": String(asset?.width ?? attrs?.width) } : {},
					...asset?.height ?? attrs?.height ? { "data-asset-height": String(asset?.height ?? attrs?.height) } : {},
					...asset?.alignment ?? attrs?.alignment ? { "data-asset-alignment": asset?.alignment ?? attrs?.alignment } : {},
					...asset?.linkUrl ?? attrs?.linkUrl ? { "data-asset-link-url": asset?.linkUrl ?? attrs?.linkUrl } : {},
					...asset?.renderSafe ?? attrs?.renderSafe ? { "data-asset-render-safe": "true" } : {},
					...asset?.tenantId ?? attrs?.tenantId ? { "data-asset-tenant-id": asset?.tenantId ?? attrs?.tenantId } : {},
					class: resolveAssetImageClassName(preview),
					contenteditable: "false"
				}),
				["img", {
					alt: altText,
					...src ? { src } : {}
				}]
			];
		},
		addCommands() {
			return { insertAssetImage: (input) => ({ commands }) => {
				const attrs = normalizeInsertedAttributes$2(input);
				if (!attrs) return false;
				return commands.insertContent({
					attrs,
					type: this.name
				});
			} };
		}
	});
}
const AssetImageNode = createAssetImageExtension();
function getAssetImagePreview(input) {
	if (!hasAssetReferenceInput(input)) return {
		diagnostics: [{
			code: "missing_asset",
			message: "Phase 27 asset image preview requires an asset contract, asset id, or URL.",
			severity: "error"
		}],
		status: "missing_asset"
	};
	const normalized = normalizeAssetImageAttributes(input);
	if (!normalized) return {
		diagnostics: [{
			code: "invalid_asset",
			message: "Phase 27 asset image preview requires a valid structured asset contract.",
			severity: "error",
			validationError: getAssetImageValidationError(input)
		}],
		status: "invalid_asset"
	};
	const role = normalized.asset?.role ?? normalized.role ?? "image";
	const assetId = normalized.asset?.assetId ?? normalized.assetId;
	const altText = normalized.asset?.altText ?? normalized.altText;
	if (requiresAltText(role) && (!altText || altText.trim().length === 0)) return {
		asset: normalized.asset,
		assetId,
		diagnostics: [{
			assetId,
			code: "missing_asset_alt_text",
			message: "Phase 27 asset images should include alt text for accessibility and preflight.",
			role,
			severity: "warning"
		}],
		role,
		status: "missing_alt_text"
	};
	return {
		asset: normalized.asset,
		assetId,
		diagnostics: [],
		role,
		status: "valid"
	};
}
function isValidDocumentAssetImage(input) {
	return normalizeAssetImageAttributes(input) !== void 0;
}
function normalizeInsertedAttributes$2(input) {
	return normalizeAssetImageAttributes(input);
}
function normalizeAssetImageAttributes(input) {
	const parseResult = _asym_pdf_template_schema.DocumentAssetImageAttributesSchema.safeParse(stripNullValues(input));
	return parseResult.success ? parseResult.data : void 0;
}
function hasAssetReferenceInput(input) {
	return Boolean(input.asset || readOptionalString$4(input.assetId) || readOptionalString$4(input.url) || readOptionalString$4(input.renderSafeUrl));
}
function getAssetImageValidationError(input) {
	const parseResult = _asym_pdf_template_schema.DocumentAssetImageAttributesSchema.safeParse(stripNullValues(input));
	if (parseResult.success) return "";
	return parseResult.error.issues[0]?.message ?? "Unknown asset validation error.";
}
function readAssetFromElement(element) {
	return readAsset(element.getAttribute("data-asset")) ?? null;
}
function readAsset(value) {
	if (typeof value !== "string" || value.length === 0) return;
	try {
		const parsed = JSON.parse(value);
		const parseResult = _asym_pdf_template_schema.DocumentAssetReferenceSchema.safeParse(parsed);
		return parseResult.success ? parseResult.data : void 0;
	} catch {
		return;
	}
}
function readSourceFromElement(element) {
	const provider = readOptionalString$4(element.getAttribute("data-asset-source-provider"));
	const sourceId = readOptionalString$4(element.getAttribute("data-asset-source-id"));
	return provider || sourceId ? {
		provider,
		sourceId
	} : null;
}
function readOptionalString$4(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function readNumberAttribute(element, attribute) {
	const value = element.getAttribute(attribute);
	if (!value) return;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}
function stripNullValues(input) {
	const normalized = {};
	for (const [key, value] of Object.entries(input)) if (value !== null && value !== void 0) normalized[key] = value;
	return normalized;
}
function stringifyAsset(asset) {
	return stableStringify$4(asset) ?? JSON.stringify(asset);
}
function stableStringify$4(value) {
	if (value === void 0) return;
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((item) => stableStringify$4(item) ?? "null").join(",")}]`;
	return `{${Object.entries(value).filter(([, entryValue]) => entryValue !== void 0).sort(([left], [right]) => left.localeCompare(right)).map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify$4(entryValue)}`).join(",")}}`;
}
function requiresAltText(role) {
	return role === "image" || role === "logo" || role === "signature" || role === "qr";
}
function resolveAssetImageClassName(preview) {
	return `asym-asset-image ${preview.status === "valid" ? "asym-asset-image--valid" : "asym-asset-image--warning"}`;
}
//#endregion
//#region src/extensions/conditional-section/index.ts
const conditionalSectionDataAttribute = "data-asym-conditional-section";
function createConditionalSectionExtension(options = {}) {
	return _tiptap_core.Node.create({
		name: "conditionalSection",
		group: "block",
		content: "block+",
		defining: true,
		isolating: true,
		addOptions() {
			return { previewContext: options.previewContext };
		},
		addAttributes() {
			return { rule: {
				default: null,
				parseHTML: (element) => readRuleFromElement(element)
			} };
		},
		parseHTML() {
			return [{ tag: `section[${conditionalSectionDataAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeConditionalSectionAttributes(HTMLAttributes);
			const preview = attrs.rule ? getConditionalSectionPreview({
				context: this.options.previewContext,
				rule: attrs.rule
			}) : void 0;
			return [
				"section",
				(0, _tiptap_core.mergeAttributes)({
					[conditionalSectionDataAttribute]: "true",
					...attrs.rule ? {
						"data-condition-field-path": attrs.rule.fieldPath,
						"data-condition-operator": attrs.rule.operator,
						"data-condition-rule": stringifyRule(attrs.rule)
					} : {},
					"data-condition-visible": preview?.visible ? "true" : "false",
					class: resolveConditionalSectionClassName(preview)
				}),
				0
			];
		},
		addCommands() {
			return { insertConditionalSection: (input) => ({ commands }) => {
				if (!isValidConditionalRule(input.rule)) return false;
				return commands.insertContent({
					type: this.name,
					attrs: { rule: input.rule },
					content: normalizeInsertedContent$1(input.content)
				});
			} };
		}
	});
}
const ConditionalSection = createConditionalSectionExtension();
function getConditionalSectionPreview(input) {
	if (!input.context) return {
		diagnostics: [{
			code: "missing_condition_context",
			fieldPath: input.rule.fieldPath,
			message: "Phase 16 conditional section preview is visible because no data context was provided.",
			operator: input.rule.operator,
			severity: "warning"
		}],
		visible: true
	};
	const result = (0, _asym_pdf_template_schema.evaluateConditionalRule)({
		context: input.context,
		rule: input.rule
	});
	return {
		diagnostics: result.diagnostics,
		visible: result.matched
	};
}
function isValidConditionalRule(value) {
	return _asym_pdf_template_schema.ConditionalRuleSchema.safeParse(value).success;
}
function normalizeConditionalSectionAttributes(input) {
	return { rule: readRule(input.rule) };
}
function normalizeInsertedContent$1(content) {
	if (Array.isArray(content)) return [...content];
	if (content) return [content];
	return [{
		type: "paragraph",
		content: []
	}];
}
function readRuleFromElement(element) {
	const structuredRule = readRule(element.getAttribute("data-condition-rule"));
	if (structuredRule) return structuredRule;
	return readRule({
		fieldPath: element.getAttribute("data-condition-field-path"),
		operator: element.getAttribute("data-condition-operator")
	});
}
function readRule(value) {
	const parsedValue = typeof value === "string" ? parseRuleString(value) : value;
	const result = _asym_pdf_template_schema.ConditionalRuleSchema.safeParse(parsedValue);
	return result.success ? result.data : void 0;
}
function parseRuleString(value) {
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function stringifyRule(rule) {
	return stableStringify$3(rule) ?? JSON.stringify(rule);
}
function resolveConditionalSectionClassName(preview) {
	return `asym-conditional-section ${preview?.diagnostics.length ? "asym-conditional-section--warning" : "asym-conditional-section--valid"}`;
}
function stableStringify$3(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : void 0;
	if (Array.isArray(value)) {
		const items = value.map((item) => stableStringify$3(item));
		return items.every((item) => item !== void 0) ? `[${items.join(",")}]` : void 0;
	}
	if (isRecord$3(value)) {
		const items = Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)).map(([key, item]) => {
			const serializedValue = stableStringify$3(item);
			return serializedValue === void 0 ? void 0 : `${JSON.stringify(key)}:${serializedValue}`;
		});
		return items.every((item) => item !== void 0) ? `{${items.join(",")}}` : void 0;
	}
}
function isRecord$3(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/extensions/data-table/index.ts
const dataTableAttribute = "data-asym-data-table";
function createDataTableExtension(options = {}) {
	return _tiptap_core.Node.create({
		name: "dataTable",
		atom: true,
		defining: true,
		group: "block",
		isolating: true,
		selectable: true,
		addOptions() {
			return { previewContext: options.previewContext };
		},
		addAttributes() {
			return {
				binding: {
					default: null,
					parseHTML: (element) => readBindingFromElement$1(element)
				},
				bindingId: {
					default: null,
					parseHTML: (element) => readOptionalString$3(element.getAttribute("data-table-binding-id"))
				}
			};
		},
		parseHTML() {
			return [{ tag: `section[${dataTableAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeDataTableAttributes(HTMLAttributes);
			const preview = getDataTablePreview({
				binding: attrs.binding,
				bindingId: attrs.bindingId,
				context: this.options.previewContext
			});
			const binding = attrs.binding;
			return [
				"section",
				(0, _tiptap_core.mergeAttributes)({
					[dataTableAttribute]: "true",
					...binding ? {
						"data-table-binding": stringifyBinding$1(binding),
						"data-table-binding-id": binding.id,
						"data-table-column-count": String(binding.columns.length),
						"data-table-source-path": binding.sourcePath
					} : {},
					...!binding && attrs.bindingId ? { "data-table-binding-id": attrs.bindingId } : {},
					"data-table-preview-status": preview.status,
					class: resolveDataTableClassName(preview),
					contenteditable: "false"
				}),
				[
					"span",
					{ class: "asym-data-table-label" },
					binding ? "Financial data table" : "Financial data table binding"
				]
			];
		},
		addCommands() {
			return { insertDataTable: (input) => ({ commands }) => {
				const attrs = normalizeInsertedAttributes$1(input);
				if (!attrs) return false;
				return commands.insertContent({
					attrs,
					type: this.name
				});
			} };
		}
	});
}
const DataTableBlock = createDataTableExtension();
function getDataTablePreview(input) {
	if (!input.binding) return {
		bindingId: input.bindingId,
		diagnostics: [{
			bindingId: input.bindingId ?? "",
			code: "missing_table_binding",
			message: "Phase 18 data table preview requires a table binding or binding id.",
			severity: "error",
			sourcePath: ""
		}],
		rowCount: 0,
		status: "missing_binding"
	};
	const parseResult = _asym_pdf_template_schema.TableBindingSchema.safeParse(input.binding);
	if (!parseResult.success) {
		const result = (0, _asym_pdf_template_schema.resolveTableRows)({
			binding: input.binding,
			context: input.context ?? {}
		});
		return {
			bindingId: input.bindingId,
			diagnostics: result.diagnostics,
			rowCount: 0,
			status: "invalid_binding"
		};
	}
	if (!input.context) return {
		binding: parseResult.data,
		diagnostics: [],
		rowCount: 0,
		status: "valid"
	};
	const result = (0, _asym_pdf_template_schema.resolveTableRows)({
		binding: parseResult.data,
		context: input.context
	});
	return {
		binding: parseResult.data,
		diagnostics: result.diagnostics,
		rowCount: result.rows.length,
		status: result.diagnostics.some((diagnostic) => diagnostic.code === "invalid_table_binding") ? "invalid_binding" : "valid"
	};
}
function isValidTableBinding(value) {
	return _asym_pdf_template_schema.TableBindingSchema.safeParse(value).success;
}
function normalizeDataTableAttributes(input) {
	return {
		binding: readBinding$1(input.binding),
		bindingId: readOptionalString$3(input.bindingId)
	};
}
function normalizeInsertedAttributes$1(input) {
	const binding = readBinding$1(input.binding);
	if (binding) return {
		binding,
		bindingId: readOptionalString$3(input.bindingId)
	};
	const bindingId = readOptionalString$3(input.bindingId);
	return bindingId ? { bindingId } : void 0;
}
function readBindingFromElement$1(element) {
	const structuredBinding = readBinding$1(element.getAttribute("data-table-binding"));
	if (structuredBinding) return structuredBinding;
}
function readBinding$1(value) {
	if (value === void 0 || value === null) return;
	const parsedValue = typeof value === "string" ? parseBindingString$1(value) : value;
	const result = _asym_pdf_template_schema.TableBindingSchema.safeParse(parsedValue);
	return result.success ? result.data : void 0;
}
function parseBindingString$1(value) {
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function stringifyBinding$1(binding) {
	return stableStringify$2(binding) ?? JSON.stringify(binding);
}
function resolveDataTableClassName(preview) {
	return `asym-data-table ${preview.diagnostics.length > 0 ? "asym-data-table--warning" : "asym-data-table--valid"}`;
}
function stableStringify$2(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : void 0;
	if (Array.isArray(value)) {
		const items = value.map((item) => stableStringify$2(item));
		return items.every((item) => item !== void 0) ? `[${items.join(",")}]` : void 0;
	}
	if (isRecord$2(value)) {
		const items = Object.entries(value).sort(([leftKey], [rightKey]) => compareCodeUnitOrder(leftKey, rightKey)).map(([key, item]) => {
			const serializedValue = stableStringify$2(item);
			return serializedValue === void 0 ? void 0 : `${JSON.stringify(key)}:${serializedValue}`;
		});
		return items.every((item) => item !== void 0) ? `{${items.join(",")}}` : void 0;
	}
}
function compareCodeUnitOrder(left, right) {
	if (left < right) return -1;
	if (left > right) return 1;
	return 0;
}
function readOptionalString$3(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function isRecord$2(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/extensions/header-footer/index.ts
function getHeaderFooterPreview(input = {}) {
	const result = _asym_pdf_template_schema.DocumentHeaderFooterSettingsSchema.safeParse(input);
	if (!result.success) return {
		diagnostics: [{
			code: "invalid_header_footer",
			message: "Phase 26 header/footer preview requires a valid header/footer contract.",
			severity: "error",
			validationError: result.error.message
		}],
		status: "invalid_header_footer"
	};
	return {
		diagnostics: [],
		settings: result.data,
		status: "valid"
	};
}
function isValidDocumentHeaderFooterSettings(value) {
	return _asym_pdf_template_schema.DocumentHeaderFooterSettingsSchema.safeParse(value).success;
}
//#endregion
//#region src/extensions/page-flow/index.ts
const pageBreakAttribute = "data-asym-page-break";
function createPageBreakExtension() {
	return _tiptap_core.Node.create({
		name: "pageBreak",
		atom: true,
		defining: true,
		group: "block",
		isolating: true,
		selectable: true,
		addAttributes() {
			return {
				id: {
					default: null,
					parseHTML: (element) => readOptionalString$2(element.getAttribute("data-page-break-id"))
				},
				label: {
					default: null,
					parseHTML: (element) => readOptionalString$2(element.getAttribute("data-page-break-label"))
				}
			};
		},
		parseHTML() {
			return [{ tag: `hr[${pageBreakAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizePageBreakAttributes(HTMLAttributes) ?? {};
			const preview = getPageBreakPreview(attrs);
			return ["hr", (0, _tiptap_core.mergeAttributes)({
				[pageBreakAttribute]: "true",
				...attrs.id ? { "data-page-break-id": attrs.id } : {},
				...attrs.label ? { "data-page-break-label": attrs.label } : {},
				"data-page-break-preview-status": preview.status,
				class: resolvePageBreakClassName(preview),
				contenteditable: "false"
			})];
		},
		addCommands() {
			return { insertPageBreak: (input = {}) => ({ commands }) => {
				const attrs = normalizePageBreakAttributes(input);
				if (!attrs) return false;
				return commands.insertContent({
					attrs,
					type: this.name
				});
			} };
		}
	});
}
const PageBreakNode = createPageBreakExtension();
function getPageBreakPreview(input = {}) {
	const result = _asym_pdf_template_schema.DocumentPageBreakAttributesSchema.safeParse(input);
	if (!result.success) return {
		diagnostics: [{
			code: "invalid_page_break",
			message: "Phase 25 page break preview requires a valid page break contract.",
			severity: "error",
			validationError: result.error.message
		}],
		status: "invalid_page_break"
	};
	return {
		attrs: result.data,
		diagnostics: [],
		status: "valid"
	};
}
function isValidDocumentPageBreakNode(value) {
	return _asym_pdf_template_schema.DocumentPageBreakNodeSchema.safeParse(value).success;
}
function normalizePageBreakAttributes(input) {
	const source = isRecord$1(input) ? {
		...readOptionalString$2(input.id) ? { id: readOptionalString$2(input.id) } : {},
		...readOptionalString$2(input.label) ? { label: readOptionalString$2(input.label) } : {}
	} : {};
	const result = _asym_pdf_template_schema.DocumentPageBreakAttributesSchema.safeParse(source);
	return result.success ? result.data : void 0;
}
function resolvePageBreakClassName(preview) {
	return `asym-page-break ${preview.status === "valid" ? "asym-page-break--valid" : "asym-page-break--invalid"}`;
}
function readOptionalString$2(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function isRecord$1(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/extensions/placeholder/index.ts
const placeholderAttribute = "data-asym-document-placeholder";
function createDocumentPlaceholderExtension() {
	return _tiptap_core.Node.create({
		name: "documentPlaceholder",
		atom: true,
		defining: true,
		group: "block",
		isolating: true,
		selectable: true,
		addAttributes() {
			return {
				placeholder: {
					default: null,
					parseHTML: (element) => readPlaceholderFromElement(element)
				},
				placeholderId: {
					default: null,
					parseHTML: (element) => readOptionalString$1(element.getAttribute("data-placeholder-reference-id"))
				}
			};
		},
		parseHTML() {
			return [{ tag: `span[${placeholderAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeDocumentPlaceholderAttributes(HTMLAttributes);
			const preview = getDocumentPlaceholderPreview({
				placeholder: attrs.placeholder,
				placeholderId: attrs.placeholderId
			});
			const placeholder = attrs.placeholder;
			const referenceId = placeholder?.id ?? attrs.placeholderId;
			return [
				"span",
				(0, _tiptap_core.mergeAttributes)({
					[placeholderAttribute]: "true",
					...placeholder ? {
						"data-placeholder": stringifyPlaceholder(placeholder),
						"data-placeholder-id": placeholder.id,
						"data-placeholder-kind": placeholder.kind
					} : {},
					...!placeholder && attrs.placeholderId ? { "data-placeholder-reference-id": attrs.placeholderId } : {},
					...referenceId ? { "data-placeholder-preview-id": referenceId } : {},
					"data-placeholder-preview-status": preview.status,
					class: resolveDocumentPlaceholderClassName(preview),
					contenteditable: "false"
				}),
				resolveDocumentPlaceholderPreviewLabel(preview)
			];
		},
		addCommands() {
			return { insertDocumentPlaceholder: (input) => ({ commands }) => {
				const attrs = normalizeInsertedAttributes(input);
				if (!attrs) return false;
				return commands.insertContent({
					attrs,
					type: this.name
				});
			} };
		}
	});
}
const DocumentPlaceholderNode = createDocumentPlaceholderExtension();
function getDocumentPlaceholderPreview(input) {
	const placeholder = readPlaceholder(input.placeholder);
	const placeholderId = readOptionalString$1(input.placeholderId);
	if (placeholder) {
		const diagnostics = createPlaceholderDiagnostics(placeholder);
		return {
			diagnostics,
			placeholder,
			placeholderId: placeholder.id,
			status: diagnostics.length > 0 ? "missing_label" : "valid"
		};
	}
	if (input.placeholder !== void 0 && input.placeholder !== null) {
		const parseResult = _asym_pdf_template_schema.DocumentPlaceholderSchema.safeParse(input.placeholder);
		return {
			diagnostics: [{
				code: "invalid_placeholder",
				message: "Phase 24 document placeholder preview requires a valid placeholder contract.",
				severity: "error",
				validationError: parseResult.success ? "Unknown placeholder validation error." : parseResult.error.message
			}],
			placeholderId,
			status: "invalid_placeholder"
		};
	}
	if (placeholderId) return {
		diagnostics: [],
		placeholderId,
		status: "valid"
	};
	return {
		diagnostics: [{
			code: "missing_placeholder",
			message: "Phase 24 document placeholder preview requires a placeholder contract or placeholder id.",
			severity: "error"
		}],
		status: "missing_placeholder"
	};
}
function isValidDocumentPlaceholder(value) {
	return _asym_pdf_template_schema.DocumentPlaceholderSchema.safeParse(value).success;
}
function normalizeDocumentPlaceholderAttributes(input) {
	return {
		placeholder: readPlaceholder(input.placeholder),
		placeholderId: readOptionalString$1(input.placeholderId)
	};
}
function normalizeInsertedAttributes(input) {
	const placeholder = readPlaceholder(input.placeholder);
	if (placeholder) return {
		placeholder,
		placeholderId: readOptionalString$1(input.placeholderId)
	};
	if (input.placeholder !== void 0 && input.placeholder !== null) return;
	const placeholderId = readOptionalString$1(input.placeholderId);
	return placeholderId ? { placeholderId } : void 0;
}
function readPlaceholderFromElement(element) {
	return readPlaceholder(element.getAttribute("data-placeholder"));
}
function readPlaceholder(value) {
	if (value === void 0 || value === null) return;
	const parsedValue = typeof value === "string" ? parsePlaceholderString(value) : value;
	const result = _asym_pdf_template_schema.DocumentPlaceholderSchema.safeParse(parsedValue);
	return result.success ? result.data : void 0;
}
function parsePlaceholderString(value) {
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function stringifyPlaceholder(placeholder) {
	return stableStringify$1(placeholder) ?? JSON.stringify(placeholder);
}
function createPlaceholderDiagnostics(placeholder) {
	if (placeholder.label) return [];
	return [{
		code: "missing_placeholder_label",
		kind: placeholder.kind,
		message: "Phase 24 document placeholder should include a label for print output and future adapters.",
		placeholderId: placeholder.id,
		severity: "warning"
	}];
}
function resolveDocumentPlaceholderPreviewLabel(preview) {
	if (preview.placeholder?.label) return preview.placeholder.label;
	if (preview.placeholder) return `${formatPlaceholderKind(preview.placeholder.kind)} placeholder`;
	if (preview.placeholderId) return preview.placeholderId;
	return "Document placeholder";
}
function resolveDocumentPlaceholderClassName(preview) {
	return `asym-document-placeholder ${preview.diagnostics.length > 0 ? "asym-document-placeholder--warning" : "asym-document-placeholder--valid"}`;
}
function formatPlaceholderKind(kind) {
	return kind.replace(/_/g, " ").replace(/^\w/u, (character) => character.toUpperCase());
}
function readOptionalString$1(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function stableStringify$1(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : void 0;
	if (Array.isArray(value)) {
		const items = value.map((item) => stableStringify$1(item));
		return items.some((item) => item === void 0) ? void 0 : `[${items.join(",")}]`;
	}
	if (typeof value === "object") return `{${Object.entries(value).map(([key, entryValue]) => {
		const serializedValue = stableStringify$1(entryValue);
		return serializedValue === void 0 ? void 0 : `${JSON.stringify(key)}:${serializedValue}`;
	}).filter((entry) => entry !== void 0).sort().join(",")}}`;
}
//#endregion
//#region src/extensions/repeater/index.ts
const repeaterDataAttribute = "data-asym-repeater";
function createRepeaterSectionExtension(options = {}) {
	return _tiptap_core.Node.create({
		name: "repeater",
		group: "block",
		content: "block+",
		defining: true,
		isolating: true,
		addOptions() {
			return { previewContext: options.previewContext };
		},
		addAttributes() {
			return { binding: {
				default: null,
				parseHTML: (element) => readBindingFromElement(element)
			} };
		},
		parseHTML() {
			return [{ tag: `section[${repeaterDataAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeRepeaterSectionAttributes(HTMLAttributes);
			const preview = attrs.binding ? getRepeaterSectionPreview({
				binding: attrs.binding,
				context: this.options.previewContext
			}) : void 0;
			return [
				"section",
				(0, _tiptap_core.mergeAttributes)({
					[repeaterDataAttribute]: "true",
					...attrs.binding ? {
						"data-repeater-binding": stringifyBinding(attrs.binding),
						"data-repeater-binding-id": attrs.binding.id,
						"data-repeater-item-alias": attrs.binding.itemAlias,
						"data-repeater-source-path": attrs.binding.sourcePath
					} : {},
					"data-repeater-item-count": String(preview?.itemCount ?? 0),
					class: resolveRepeaterSectionClassName(preview)
				}),
				0
			];
		},
		addCommands() {
			return { insertRepeaterSection: (input) => ({ commands }) => {
				if (!isValidRepeaterBinding(input.binding)) return false;
				return commands.insertContent({
					attrs: { binding: input.binding },
					content: normalizeInsertedContent(input.content),
					type: this.name
				});
			} };
		}
	});
}
const RepeaterSection = createRepeaterSectionExtension();
function getRepeaterSectionPreview(input) {
	if (!input.context) return {
		diagnostics: [{
			bindingId: input.binding.id,
			code: "missing_repeater_context",
			itemAlias: input.binding.itemAlias,
			message: "Phase 17 repeater preview keeps content visible because no data context was provided.",
			severity: "warning",
			sourcePath: input.binding.sourcePath
		}],
		itemCount: 0,
		visible: true
	};
	const result = (0, _asym_pdf_template_schema.resolveRepeaterItems)({
		binding: input.binding,
		context: input.context
	});
	return {
		diagnostics: result.diagnostics,
		itemCount: result.items.length,
		visible: true
	};
}
function isValidRepeaterBinding(value) {
	return _asym_pdf_template_schema.RepeaterBindingSchema.safeParse(value).success;
}
function normalizeRepeaterSectionAttributes(input) {
	return { binding: readBinding(input.binding) };
}
function normalizeInsertedContent(content) {
	if (Array.isArray(content)) return [...content];
	if (content) return [content];
	return [{
		content: [],
		type: "paragraph"
	}];
}
function readBindingFromElement(element) {
	const structuredBinding = readBinding(element.getAttribute("data-repeater-binding"));
	if (structuredBinding) return structuredBinding;
	return readBinding({
		id: element.getAttribute("data-repeater-binding-id"),
		itemAlias: element.getAttribute("data-repeater-item-alias"),
		sourcePath: element.getAttribute("data-repeater-source-path")
	});
}
function readBinding(value) {
	const parsedValue = typeof value === "string" ? parseBindingString(value) : value;
	const result = _asym_pdf_template_schema.RepeaterBindingSchema.safeParse(parsedValue);
	return result.success ? result.data : void 0;
}
function parseBindingString(value) {
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function stringifyBinding(binding) {
	return stableStringify(binding) ?? JSON.stringify(binding);
}
function resolveRepeaterSectionClassName(preview) {
	return `asym-repeater-section ${preview?.diagnostics.length ? "asym-repeater-section--warning" : "asym-repeater-section--valid"}`;
}
function stableStringify(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : void 0;
	if (Array.isArray(value)) {
		const items = value.map((item) => stableStringify(item));
		return items.every((item) => item !== void 0) ? `[${items.join(",")}]` : void 0;
	}
	if (isRecord(value)) {
		const items = Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)).map(([key, item]) => {
			const serializedValue = stableStringify(item);
			return serializedValue === void 0 ? void 0 : `${JSON.stringify(key)}:${serializedValue}`;
		});
		return items.every((item) => item !== void 0) ? `{${items.join(",")}}` : void 0;
	}
}
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/extensions/variable/index.ts
const variableChipDataAttribute = "data-asym-variable-chip";
function createVariableChipExtension(options = {}) {
	return _tiptap_core.Node.create({
		name: "variable",
		inline: true,
		group: "inline",
		atom: true,
		selectable: true,
		addOptions() {
			return {
				previewContext: options.previewContext,
				registry: options.registry ?? _asym_pdf_template_schema.coreVariableRegistry
			};
		},
		addAttributes() {
			return {
				fallback: {
					default: null,
					parseHTML: (element) => readFallback(element.getAttribute("data-variable-fallback"))
				},
				formatter: {
					default: null,
					parseHTML: (element) => element.getAttribute("data-variable-formatter")
				},
				key: {
					default: "",
					parseHTML: (element) => element.getAttribute("data-variable-key")
				},
				label: {
					default: null,
					parseHTML: (element) => element.getAttribute("data-variable-label")
				}
			};
		},
		parseHTML() {
			return [{ tag: `span[${variableChipDataAttribute}]` }];
		},
		renderHTML({ HTMLAttributes }) {
			const attrs = normalizeVariableChipAttributes(HTMLAttributes);
			const preview = getVariableChipPreview({
				...attrs,
				context: this.options.previewContext,
				registry: this.options.registry
			});
			return [
				"span",
				(0, _tiptap_core.mergeAttributes)({
					[variableChipDataAttribute]: "true",
					"data-variable-key": attrs.key,
					...attrs.formatter ? { "data-variable-formatter": attrs.formatter } : {},
					...attrs.fallback !== void 0 ? { "data-variable-fallback": stringifyFallback(attrs.fallback) } : {},
					...attrs.label ? { "data-variable-label": attrs.label } : {},
					class: resolveVariableChipClassName(preview),
					contenteditable: "false"
				}),
				preview.displayValue
			];
		},
		addCommands() {
			return { insertVariableChip: (input) => ({ commands }) => {
				return commands.insertContent({
					type: this.name,
					attrs: normalizeVariableChipAttributes(input)
				});
			} };
		}
	});
}
const VariableChip = createVariableChipExtension();
function getVariableChipPreview(input) {
	const registry = input.registry ?? _asym_pdf_template_schema.coreVariableRegistry;
	const context = input.context ?? registry.createSampleData();
	const resolvedValue = (0, _asym_pdf_template_schema.createVariableResolver)({
		...input,
		registry
	}).resolve({
		fallback: normalizeFallback(input.fallback),
		formatter: input.formatter,
		key: input.key
	}, context);
	return {
		definition: resolvedValue.definition,
		diagnostics: resolvedValue.diagnostics,
		displayValue: resolveDisplayValue(input, resolvedValue),
		key: input.key,
		status: resolvedValue.status
	};
}
function isKnownVariableChipKey(key, registry = _asym_pdf_template_schema.coreVariableRegistry) {
	return registry.get(key) !== void 0;
}
function normalizeVariableChipAttributes(input) {
	return {
		fallback: readFallback(input.fallback),
		formatter: readOptionalString(input.formatter),
		key: readOptionalString(input.key) ?? "",
		label: readOptionalString(input.label)
	};
}
function resolveDisplayValue(input, resolvedValue) {
	if (resolvedValue.formattedValue) return resolvedValue.formattedValue;
	if (resolvedValue.status === "unknown_variable") return "Unknown variable";
	return input.label ?? resolvedValue.definition?.label ?? resolvedValue.key;
}
function resolveVariableChipClassName(preview) {
	return `asym-variable-chip ${preview.diagnostics.length > 0 ? "asym-variable-chip--warning" : "asym-variable-chip--valid"}`;
}
function readFallback(value) {
	if (typeof value === "string" && value.length > 0) return parseFallbackBehavior(value) ?? value;
	if (isFallbackBehavior(value)) return value;
}
function normalizeFallback(fallback) {
	if (typeof fallback === "string") return {
		mode: "use_value",
		value: fallback
	};
	return fallback;
}
function stringifyFallback(fallback) {
	return typeof fallback === "string" ? fallback : JSON.stringify(fallback);
}
function readOptionalString(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function parseFallbackBehavior(value) {
	try {
		const parsed = JSON.parse(value);
		return isFallbackBehavior(parsed) ? parsed : void 0;
	} catch {
		return;
	}
}
function isFallbackBehavior(value) {
	return typeof value === "object" && value !== null && "mode" in value && typeof value.mode === "string";
}
//#endregion
exports.AssetImageNode = AssetImageNode;
exports.ConditionalSection = ConditionalSection;
exports.DataTableBlock = DataTableBlock;
exports.DocumentPlaceholderNode = DocumentPlaceholderNode;
exports.PageBreakNode = PageBreakNode;
exports.RepeaterSection = RepeaterSection;
exports.VariableChip = VariableChip;
exports.createAssetImageExtension = createAssetImageExtension;
exports.createConditionalSectionExtension = createConditionalSectionExtension;
exports.createDataTableExtension = createDataTableExtension;
exports.createDocumentPlaceholderExtension = createDocumentPlaceholderExtension;
exports.createPageBreakExtension = createPageBreakExtension;
exports.createRepeaterSectionExtension = createRepeaterSectionExtension;
exports.createVariableChipExtension = createVariableChipExtension;
exports.getAssetImagePreview = getAssetImagePreview;
exports.getConditionalSectionPreview = getConditionalSectionPreview;
exports.getDataTablePreview = getDataTablePreview;
exports.getDocumentPlaceholderPreview = getDocumentPlaceholderPreview;
exports.getHeaderFooterPreview = getHeaderFooterPreview;
exports.getPageBreakPreview = getPageBreakPreview;
exports.getRepeaterSectionPreview = getRepeaterSectionPreview;
exports.getVariableChipPreview = getVariableChipPreview;
exports.isKnownVariableChipKey = isKnownVariableChipKey;
exports.isValidConditionalRule = isValidConditionalRule;
exports.isValidDocumentAssetImage = isValidDocumentAssetImage;
exports.isValidDocumentHeaderFooterSettings = isValidDocumentHeaderFooterSettings;
exports.isValidDocumentPageBreakNode = isValidDocumentPageBreakNode;
exports.isValidDocumentPlaceholder = isValidDocumentPlaceholder;
exports.isValidRepeaterBinding = isValidRepeaterBinding;
exports.isValidTableBinding = isValidTableBinding;
