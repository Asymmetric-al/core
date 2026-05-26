import { ConditionalRuleSchema, DocumentAssetReferenceSchema, DocumentPageBreakAttributesSchema, DocumentPageSettingsSchema, DocumentPlaceholderSchema, DocumentTemplateV1Schema, DocumentThemeSchema, PageFlowControlAttributesSchema, PdfDocumentMetadataSchema, RepeaterBindingSchema, SummaryBlockBindingSchema, TableBindingSchema, calculateFinancialTotals, calculateGroupedTableTotals, calculateInvoiceTotals, calculateNumericAggregate, calculateTableTotals, evaluateConditionalRule, formatVariableValue, getValueAtDataPath, resolveRepeaterItems, resolveTableRows } from "@asym/pdf-template-schema";
//#region src/conditions.ts
function evaluatePdfDocumentCondition(input) {
	if (!input.context) return {
		visible: true,
		warnings: [{
			code: "missing_condition_context",
			message: "Phase 16 conditional section rendered content because no data context was provided.",
			nodeType: input.nodeType,
			path: input.path,
			severity: "warning"
		}]
	};
	const evaluation = evaluateConditionalRule({
		context: input.context,
		rule: input.rule
	});
	const warnings = evaluation.diagnostics.map((diagnostic) => toRenderWarning(diagnostic, input));
	return {
		visible: evaluation.matched,
		warnings
	};
}
function toRenderWarning(diagnostic, input) {
	return {
		code: diagnostic.severity === "error" ? "condition_evaluation_error" : "condition_evaluation_warning",
		details: {
			conditionCode: diagnostic.code,
			fieldPath: diagnostic.fieldPath,
			operator: diagnostic.operator
		},
		message: diagnostic.message,
		nodeType: input.nodeType,
		path: input.path,
		severity: diagnostic.severity
	};
}
//#endregion
//#region src/data-table.ts
function resolvePdfDocumentTableRows(input) {
	const result = resolveTableRows(input);
	return {
		binding: result.binding,
		rows: result.rows,
		warnings: result.diagnostics.map((diagnostic) => ({
			code: diagnostic.code,
			details: {
				bindingId: diagnostic.bindingId,
				columnKey: diagnostic.columnKey,
				sourceIndex: diagnostic.sourceIndex,
				sourcePath: diagnostic.sourcePath,
				...diagnostic.details
			},
			message: diagnostic.message,
			nodeType: input.nodeType,
			path: input.path,
			severity: diagnostic.severity
		}))
	};
}
//#endregion
//#region src/repeaters.ts
function resolvePdfDocumentRepeaterItems(input) {
	const result = resolveRepeaterItems({
		binding: input.binding,
		context: input.context
	});
	return {
		items: result.items,
		warnings: result.diagnostics.map((diagnostic) => ({
			code: diagnostic.code,
			details: {
				bindingId: diagnostic.bindingId,
				itemAlias: diagnostic.itemAlias,
				sourceIndex: diagnostic.sourceIndex,
				sourcePath: diagnostic.sourcePath,
				...diagnostic.details
			},
			message: diagnostic.message,
			nodeType: input.nodeType,
			path: input.path,
			severity: diagnostic.severity
		}))
	};
}
//#endregion
//#region src/compose-pdf-document-html.ts
const phase09CssRequirement = {
	id: "phase-09-document-serializer",
	media: "all",
	css: [
		".pdf-button{display:inline-block;text-decoration:none;}",
		".pdf-column{box-sizing:border-box;display:table-cell;vertical-align:top;width:50%;}",
		".pdf-columns{box-sizing:border-box;display:table;width:100%;}",
		".pdf-conditional-section{display:block;}",
		".pdf-image{max-width:100%;}",
		".pdf-asset-image--center{display:block;margin-left:auto;margin-right:auto;}",
		".pdf-asset-image--full_width{display:block;width:100%;}",
		".pdf-asset-image--right{display:block;margin-left:auto;}",
		".pdf-repeater{display:block;}",
		".pdf-repeater-empty{display:block;}",
		".pdf-repeater-item{display:block;}",
		".pdf-data-table{border-collapse:collapse;width:100%;}",
		".pdf-data-table-empty{display:block;}",
		".pdf-data-table-footer{display:table-footer-group;}",
		".pdf-data-table-group-subtotal{font-weight:600;}",
		".pdf-data-table-header{display:table-header-group;}",
		".pdf-data-table-total-row{font-weight:700;}",
		".pdf-document-placeholder{border:1px solid #6b7280;box-sizing:border-box;display:inline-flex;gap:0.375rem;padding:0.25rem 0.5rem;vertical-align:middle;}",
		".pdf-document-placeholder-box{border:1px solid #111827;display:inline-block;height:0.8rem;width:0.8rem;}",
		".pdf-document-placeholder-control{color:#6b7280;}",
		".pdf-document-placeholder-label{font-weight:600;}",
		".pdf-document-placeholder-line{border-bottom:1px solid #111827;display:inline-block;min-width:8rem;}",
		".pdf-document-placeholder-qr-box{align-items:center;border:1px solid #111827;display:inline-flex;height:4rem;justify-content:center;width:4rem;}",
		".pdf-avoid-break-after-heading{break-after:avoid;page-break-after:avoid;}",
		".pdf-keep-together{break-inside:avoid;page-break-inside:avoid;}",
		".pdf-page-break{break-after:page;height:0;page-break-after:always;}",
		".pdf-start-on-new-page{break-before:page;page-break-before:always;}",
		".pdf-summary-block{display:block;}",
		".pdf-summary-list{margin:0;}",
		".pdf-summary-item{display:grid;grid-template-columns:1fr auto;}",
		".pdf-table{border-collapse:collapse;width:100%;}",
		".pdf-table-row-avoid-break{break-inside:avoid;page-break-inside:avoid;}",
		".pdf-variable{white-space:nowrap;}"
	].join("\n")
};
const safeAlignmentValues = new Set([
	"left",
	"center",
	"right",
	"justify"
]);
const safeHrefSchemes = new Set([
	"http",
	"https",
	"mailto",
	"tel"
]);
function composePdfDocumentHtml(input) {
	const warnings = [];
	const assets = [];
	const variables = [];
	const nodeRenderers = createNodeRendererMap(input.nodeRenderers);
	const markRenderers = createMarkRendererMap(input.markRenderers);
	const assetReferences = createAssetReferenceRegistry(input.assetReferences);
	const repeaterBindings = createRepeaterBindingRegistry(input.repeaterBindings);
	const tableBindings = createTableBindingRegistry(input.tableBindings);
	const summaryBlockBindings = createSummaryBlockBindingRegistry(input.summaryBlockBindings);
	const placeholderBindings = createPlaceholderRegistry(input.placeholderBindings);
	const state = {
		dataContext: input.dataContext,
		nodeRenderers,
		markRenderers,
		assetReferences,
		assetRenderMode: input.assetRenderMode ?? "browser_preview",
		repeaterBindings,
		summaryBlockBindings,
		tableBindings,
		placeholderBindings,
		ancestors: [],
		scopes: [],
		warnings,
		assets,
		variables
	};
	if (!isDocumentNode(input.document)) {
		warnings.push({
			code: "invalid_document",
			severity: "error",
			message: "Phase 09 composePdfDocumentHtml requires a structured document node.",
			path: []
		});
		return {
			html: "",
			cssRequirements: [],
			warnings,
			assets,
			variables
		};
	}
	if (isDocumentEmpty(input.document)) warnings.push({
		code: "empty_document",
		severity: "warning",
		message: "Phase 09 composePdfDocumentHtml received an empty document.",
		path: [],
		nodeType: input.document.type
	});
	for (const invalidReference of assetReferences.invalidReferences) warnings.push({
		code: "invalid_asset_reference",
		details: { validationError: invalidReference.validationError },
		message: "Phase 27 asset reference failed schema validation.",
		path: ["assetReferences", invalidReference.referenceId],
		severity: "error"
	});
	return {
		html: renderNode(input.document, [], state),
		cssRequirements: [phase09CssRequirement],
		warnings,
		assets,
		variables
	};
}
function createNodeRendererMap(customRenderers) {
	const renderers = /* @__PURE__ */ new Map();
	for (const renderer of builtInNodeRenderers) renderers.set(renderer.type, renderer);
	for (const renderer of customRenderers ?? []) renderers.set(renderer.type, renderer);
	return renderers;
}
function createMarkRendererMap(customRenderers) {
	const renderers = /* @__PURE__ */ new Map();
	for (const renderer of builtInMarkRenderers) renderers.set(renderer.type, renderer);
	for (const renderer of customRenderers ?? []) renderers.set(renderer.type, renderer);
	return renderers;
}
function createAssetReferenceRegistry(inputs) {
	const byReferenceId = /* @__PURE__ */ new Map();
	const byAssetId = /* @__PURE__ */ new Map();
	const invalidReferences = [];
	for (const [index, input] of (inputs ?? []).entries()) {
		const parseResult = DocumentAssetReferenceSchema.safeParse(input);
		if (!parseResult.success) {
			invalidReferences.push({
				assetId: typeof input.assetId === "string" ? input.assetId : void 0,
				referenceId: typeof input.id === "string" && input.id.length > 0 ? input.id : String(index),
				role: isDocumentAssetRole(input.role) ? input.role : void 0,
				validationError: parseResult.error.issues[0]?.message ?? "Unknown asset reference validation error."
			});
			continue;
		}
		const asset = parseResult.data;
		byReferenceId.set(asset.id, asset);
		if (asset.assetId) byAssetId.set(asset.assetId, asset);
	}
	return {
		byAssetId,
		byReferenceId,
		invalidReferences
	};
}
function preflightPdfDocumentAssets(input) {
	const mode = input.mode ?? "browser_preview";
	const diagnostics = [];
	const assets = [];
	for (const [index, assetInput] of (input.assets ?? []).entries()) {
		const path = ["assets", String(index)];
		const parseResult = DocumentAssetReferenceSchema.safeParse(assetInput);
		if (!parseResult.success) {
			diagnostics.push({
				code: "invalid_asset_reference",
				message: parseResult.error.issues[0]?.message ?? "Phase 27 asset preflight found an invalid asset reference.",
				path,
				severity: "error"
			});
			continue;
		}
		const asset = parseResult.data;
		assets.push(asset);
		const src = resolveAssetSource(asset);
		if (mode === "production_render") {
			if (!src) {
				diagnostics.push({
					assetId: asset.assetId,
					code: "missing_asset",
					message: "Phase 27 asset preflight requires a render-safe URL before production rendering.",
					path,
					referenceId: asset.id,
					role: asset.role,
					severity: "error"
				});
				continue;
			}
			if (isUnsafeProductionAssetUrl(src)) diagnostics.push({
				code: "unsafe_asset_url",
				message: "Phase 27 asset preflight rejected a blob URL for production rendering.",
				path: [...path, src === asset.renderSafeUrl ? "renderSafeUrl" : "url"],
				referenceId: asset.id,
				role: asset.role,
				severity: "error"
			});
			else if (!asset.renderSafe && !asset.renderSafeUrl) diagnostics.push({
				assetId: asset.assetId,
				code: "asset_not_render_safe",
				message: "Phase 27 asset preflight received a production asset that is not marked render-safe.",
				path,
				referenceId: asset.id,
				role: asset.role,
				severity: "warning"
			});
		}
		if (requiresAssetAltText(asset.role) && !hasNonEmptyString(asset.altText)) diagnostics.push({
			assetId: asset.assetId,
			code: "missing_asset_alt_text",
			message: "Phase 27 asset preflight recommends alt text for meaningful images.",
			path: [...path, "altText"],
			referenceId: asset.id,
			role: asset.role,
			severity: "warning"
		});
	}
	return {
		assets,
		diagnostics
	};
}
function createRepeaterBindingRegistry(bindings) {
	const bindingMap = /* @__PURE__ */ new Map();
	const invalidBindings = /* @__PURE__ */ new Map();
	for (const binding of bindings ?? []) {
		const result = RepeaterBindingSchema.safeParse(binding);
		if (result.success) {
			bindingMap.set(result.data.id, result.data);
			continue;
		}
		const reference = createInvalidRepeaterBindingReference(binding, result.error.message);
		if (reference.bindingId) invalidBindings.set(reference.bindingId, reference);
	}
	return {
		bindings: bindingMap,
		invalidBindings
	};
}
function createInvalidRepeaterBindingReference(binding, validationError) {
	const bindingRecord = isRecord(binding) ? binding : {};
	return {
		bindingId: readDiagnosticString(bindingRecord.id),
		sourcePath: readDiagnosticString(bindingRecord.sourcePath),
		validationError
	};
}
function createTableBindingRegistry(bindings) {
	const bindingMap = /* @__PURE__ */ new Map();
	const invalidBindings = /* @__PURE__ */ new Map();
	for (const binding of bindings ?? []) {
		const result = TableBindingSchema.safeParse(binding);
		if (result.success) {
			bindingMap.set(result.data.id, result.data);
			continue;
		}
		const reference = createInvalidTableBindingReference(binding, result.error.message);
		if (reference.bindingId) invalidBindings.set(reference.bindingId, reference);
	}
	return {
		bindings: bindingMap,
		invalidBindings
	};
}
function createInvalidTableBindingReference(binding, validationError) {
	const bindingRecord = isRecord(binding) ? binding : {};
	return {
		bindingId: readDiagnosticString(bindingRecord.id),
		sourcePath: readDiagnosticString(bindingRecord.sourcePath),
		validationError
	};
}
function createSummaryBlockBindingRegistry(bindings) {
	const bindingMap = /* @__PURE__ */ new Map();
	const invalidBindings = /* @__PURE__ */ new Map();
	for (const binding of bindings ?? []) {
		const result = SummaryBlockBindingSchema.safeParse(binding);
		if (result.success) {
			bindingMap.set(result.data.id, result.data);
			continue;
		}
		const reference = createInvalidSummaryBlockBindingReference(binding, result.error.message);
		if (reference.bindingId) invalidBindings.set(reference.bindingId, reference);
	}
	return {
		bindings: bindingMap,
		invalidBindings
	};
}
function createInvalidSummaryBlockBindingReference(binding, validationError) {
	return {
		bindingId: readDiagnosticString((isRecord(binding) ? binding : {}).id),
		validationError
	};
}
function createPlaceholderRegistry(placeholders) {
	const bindingMap = /* @__PURE__ */ new Map();
	const invalidBindings = /* @__PURE__ */ new Map();
	for (const placeholder of placeholders ?? []) {
		const result = DocumentPlaceholderSchema.safeParse(placeholder);
		if (result.success) {
			bindingMap.set(result.data.id, result.data);
			continue;
		}
		const reference = createInvalidPlaceholderReference(placeholder, result.error.message);
		if (reference.placeholderId) invalidBindings.set(reference.placeholderId, reference);
	}
	return {
		bindings: bindingMap,
		invalidBindings
	};
}
function createInvalidPlaceholderReference(placeholder, validationError) {
	return {
		placeholderId: readDiagnosticString((isRecord(placeholder) ? placeholder : {}).id),
		validationError
	};
}
function renderNode(value, path, state) {
	if (!isDocumentNode(value)) {
		state.warnings.push({
			code: "invalid_document",
			severity: "error",
			message: "Phase 09 serializer skipped an invalid document node.",
			path
		});
		return "";
	}
	if (value.type === "text") return renderTextNode(value, path, state);
	if (value.type === "conditionalSection") return renderConditionalSection(value, path, state);
	if (value.type === "repeater") return renderRepeater(value, path, state);
	if (value.type === "dataTable") return renderDataTable(value, path, state);
	if (value.type === "summaryBlock") return renderSummaryBlock(value, path, state);
	if (value.type === "documentPlaceholder") return renderDocumentPlaceholder(value, path, state);
	if (value.type === "pageBreak") return renderPageBreak(value, path, state);
	const childrenHtml = renderChildren(value.content, path, state, value.type);
	const renderer = state.nodeRenderers.get(value.type);
	if (renderer) return renderer.render({
		node: value,
		path,
		childrenHtml,
		assetRenderMode: state.assetRenderMode,
		resolveAssetReference: (reference) => resolveAssetReference(reference, state.assetReferences),
		renderChildren: (children, childPath) => renderChildren(children, childPath, state, value.type),
		addWarning: (warning) => {
			state.warnings.push(warning);
		},
		addAsset: (asset) => {
			state.assets.push(asset);
		},
		addVariable: (usage) => {
			addVariableUsage(state, usage);
		}
	});
	if (hasRenderableChildren(value)) {
		state.warnings.push({
			code: "unknown_node",
			severity: "warning",
			message: `Phase 09 serializer rendered children for unknown node "${value.type}".`,
			path,
			nodeType: value.type
		});
		return childrenHtml;
	}
	state.warnings.push({
		code: "unsupported_node",
		severity: "warning",
		message: `Phase 09 serializer omitted unsupported leaf node "${value.type}".`,
		path,
		nodeType: value.type
	});
	return "";
}
function renderRepeater(node, path, state) {
	const bindingResult = readRepeaterBinding(node.attrs, state.repeaterBindings);
	if (bindingResult.status === "invalid") {
		state.warnings.push({
			code: "invalid_repeater_binding",
			details: {
				bindingId: bindingResult.reference.bindingId,
				sourcePath: bindingResult.reference.sourcePath,
				validationError: bindingResult.reference.validationError
			},
			message: "Phase 17 repeater rendered author content once because the referenced binding is invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderRepeaterElement({
			binding: void 0,
			childrenHtml: renderChildren(node.content, path, state, node.type),
			node,
			path
		});
	}
	if (bindingResult.status === "missing") {
		state.warnings.push({
			code: "missing_repeater_binding",
			message: "Phase 17 repeater rendered author content once because the binding is missing or invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderRepeaterElement({
			binding: void 0,
			childrenHtml: renderChildren(node.content, path, state, node.type),
			node,
			path
		});
	}
	const binding = bindingResult.binding;
	if (!state.dataContext) {
		state.warnings.push({
			code: "missing_repeater_context",
			message: "Phase 17 repeater rendered author content once because no data context was provided.",
			nodeType: node.type,
			path,
			severity: "warning"
		});
		return renderRepeaterElement({
			binding,
			childrenHtml: renderChildren(node.content, path, state, node.type),
			node,
			path
		});
	}
	const result = resolvePdfDocumentRepeaterItems({
		binding,
		context: state.dataContext,
		nodeType: node.type,
		path
	});
	state.warnings.push(...result.warnings);
	if (result.items.length === 0) return renderRepeaterElement({
		binding,
		childrenHtml: renderRepeaterEmptyState(binding),
		node,
		path
	});
	return renderRepeaterElement({
		binding,
		childrenHtml: result.items.map((item) => {
			const scope = {
				itemAlias: binding.itemAlias,
				renderedIndex: item.renderedIndex,
				sourceIndex: item.sourceIndex,
				sourcePath: binding.sourcePath,
				...binding.indexAlias ? { indexAlias: binding.indexAlias } : {}
			};
			const itemState = {
				...state,
				dataContext: item.context,
				scopes: [...state.scopes, scope]
			};
			const itemHtml = renderChildren(node.content, [
				...path,
				"items",
				String(item.renderedIndex)
			], itemState, node.type);
			return renderElement$1("div", {
				class: "pdf-repeater-item",
				"data-repeater-rendered-index": String(item.renderedIndex),
				"data-repeater-source-index": String(item.sourceIndex)
			}, itemHtml);
		}).join(""),
		node,
		path
	});
}
function renderRepeaterElement(input) {
	return renderElement$1("section", {
		...getElementAttributes(input.node, {
			className: "pdf-repeater",
			excludedAttributeNames: ["binding", "bindingId"]
		}),
		"data-asym-repeater": "true",
		"data-repeater-path": input.path.join("."),
		...input.binding ? {
			"data-repeater-binding-id": input.binding.id,
			"data-repeater-item-alias": input.binding.itemAlias,
			"data-repeater-source-path": input.binding.sourcePath
		} : {}
	}, input.childrenHtml);
}
function renderRepeaterEmptyState(binding) {
	if (!binding.emptyState) return "";
	return renderElement$1("div", {
		class: "pdf-repeater-empty",
		"data-repeater-empty-state": "true"
	}, escapeHtml$1(binding.emptyState));
}
function renderDataTable(node, path, state) {
	const bindingResult = readTableBinding(node.attrs, state.tableBindings);
	if (bindingResult.status === "invalid") {
		state.warnings.push({
			code: "invalid_table_binding",
			details: {
				bindingId: bindingResult.reference.bindingId,
				sourcePath: bindingResult.reference.sourcePath,
				validationError: bindingResult.reference.validationError
			},
			message: "Phase 20 data table renderer emitted a diagnostic placeholder because the referenced binding is invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderDataTableShell({
			binding: void 0,
			bodyHtml: "",
			node,
			path,
			totalPlaceholdersHtml: ""
		});
	}
	if (bindingResult.status === "missing") {
		state.warnings.push({
			code: "missing_table_binding",
			message: "Phase 20 data table renderer emitted a diagnostic placeholder because the binding is missing or invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderDataTableShell({
			binding: void 0,
			bodyHtml: "",
			node,
			path,
			totalPlaceholdersHtml: ""
		});
	}
	const binding = bindingResult.binding;
	if (!state.dataContext) {
		state.warnings.push({
			code: "missing_table_context",
			message: "Phase 20 data table renderer emitted headers and placeholders because no data context was provided.",
			nodeType: node.type,
			path,
			severity: "warning"
		});
		return renderDataTableShell({
			binding,
			bodyHtml: renderDataTableEmptyState(binding),
			node,
			path,
			totalPlaceholdersHtml: renderDataTableTotalPlaceholders(binding)
		});
	}
	const result = resolvePdfDocumentTableRows({
		binding,
		context: state.dataContext,
		nodeType: node.type,
		path
	});
	state.warnings.push(...result.warnings);
	const totals = canCalculateDataTableTotals(result.warnings) ? resolveRenderedTableTotals({
		binding,
		context: state.dataContext,
		nodeType: node.type,
		path,
		state
	}) : [];
	return renderDataTableShell({
		binding,
		bodyHtml: result.rows.length === 0 ? renderDataTableEmptyState(binding) : renderDataTableBodyRows({
			binding,
			nodeType: node.type,
			path,
			rows: result.rows,
			state,
			totals
		}),
		node,
		path,
		totalPlaceholdersHtml: totals.length ? renderDataTableTotalRows(binding, totals) : renderDataTableTotalPlaceholders(binding)
	});
}
function canCalculateDataTableTotals(warnings) {
	return !warnings.some((warning) => warning.code === "missing_table_source" || warning.code === "non_array_table_source" || warning.code === "invalid_table_binding");
}
function resolveRenderedTableTotals(input) {
	if (input.binding.totals.length === 0) return [];
	const result = calculateTableTotals({
		context: input.context,
		tableBinding: input.binding
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	return result.totals.flatMap((total) => {
		if (!total.value) return [];
		const column = input.binding.columns.find((candidate) => candidate.key === total.columnKey);
		if (!column) return [];
		return [{
			column,
			displayValue: formatCalculationValue({
				formatter: resolveCalculationFormatter(column, total.operation),
				key: `table.${input.binding.id}.${total.columnKey}.${total.operation}`,
				label: total.label ?? column.label,
				path: input.path,
				sourcePath: input.binding.sourcePath,
				state: input.state,
				value: total.value
			}),
			total
		}];
	});
}
function renderDataTableBodyRows(input) {
	if (!input.binding.grouping || input.totals.length === 0) return renderDataTableRows(input.rows, input.binding.avoidRowSplit);
	return renderDataTableGroupedRows(input);
}
function renderDataTableGroupedRows(input) {
	const grouping = input.binding.grouping;
	if (!grouping || !input.state.dataContext) return renderDataTableRows(input.rows, input.binding.avoidRowSplit);
	const groups = groupRows(input.rows, grouping.fieldPath);
	const subtotalByColumn = createGroupedSubtotalMap({
		binding: input.binding,
		context: input.state.dataContext,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state,
		totals: input.totals
	});
	return groups.map((group) => {
		return `${renderDataTableRows(group.rows, input.binding.avoidRowSplit)}${input.totals.flatMap((renderedTotal) => {
			const subtotal = subtotalByColumn.get(renderedTotal.total.columnKey)?.get(group.key);
			if (!subtotal) return [];
			const label = `${group.label} subtotal`;
			const displayValue = formatCalculationValue({
				formatter: resolveCalculationFormatter(renderedTotal.column, renderedTotal.total.operation),
				key: `table.${input.binding.id}.${renderedTotal.total.columnKey}.${group.key}.subtotal`,
				label,
				path: input.path,
				sourcePath: input.binding.sourcePath,
				state: input.state,
				value: subtotal.total
			});
			return [renderDataTableTotalRow({
				binding: input.binding,
				className: "pdf-data-table-group-subtotal",
				column: renderedTotal.column,
				avoidRowSplit: input.binding.avoidRowSplit,
				extraAttributes: {
					"data-table-group-key": group.key,
					"data-table-total-decimal": subtotal.total.decimal,
					"data-table-total-minor-units": subtotal.total.minorUnits,
					"data-table-total-scale": String(subtotal.total.scale)
				},
				label,
				value: displayValue
			})];
		}).join("")}`;
	}).join("");
}
function createGroupedSubtotalMap(input) {
	const grouping = input.binding.grouping;
	const groupedTotals = /* @__PURE__ */ new Map();
	if (!grouping) return groupedTotals;
	for (const renderedTotal of input.totals) {
		const result = calculateGroupedTableTotals({
			context: input.context,
			groupPath: grouping.fieldPath,
			sourcePath: input.binding.sourcePath,
			valuePath: renderedTotal.column.sourcePath
		});
		pushCalculationDiagnostics({
			bindingId: input.binding.id,
			diagnostics: result.diagnostics,
			nodeType: input.nodeType,
			path: input.path,
			state: input.state
		});
		const groupTotals = new Map(result.groups.map((group) => [group.key, { total: group.total }]));
		groupedTotals.set(renderedTotal.total.columnKey, groupTotals);
	}
	return groupedTotals;
}
function groupRows(rows, groupPath) {
	const order = [];
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const lookup = getValueAtDataPath(isRecord(row.value) ? row.value : {}, groupPath);
		const key = lookup.found && lookup.value !== void 0 && lookup.value !== null ? String(lookup.value) : "";
		if (!groups.has(key)) {
			groups.set(key, []);
			order.push(key);
		}
		groups.get(key)?.push(row);
	}
	return order.map((key) => ({
		key,
		label: key || "Ungrouped",
		rows: groups.get(key) ?? []
	}));
}
function renderSummaryBlock(node, path, state) {
	const bindingResult = readSummaryBlockBinding(node.attrs, state.summaryBlockBindings);
	if (bindingResult.status === "invalid") {
		state.warnings.push({
			code: "invalid_summary_block_binding",
			details: {
				bindingId: bindingResult.reference.bindingId,
				validationError: bindingResult.reference.validationError
			},
			message: "Phase 23 summary block rendered without values because the referenced binding is invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderSummaryBlockShell({
			binding: void 0,
			items: [],
			node,
			path
		});
	}
	if (bindingResult.status === "missing") {
		state.warnings.push({
			code: "missing_summary_block_binding",
			message: "Phase 23 summary block rendered without values because the binding is missing or invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return renderSummaryBlockShell({
			binding: void 0,
			items: [],
			node,
			path
		});
	}
	const binding = bindingResult.binding;
	if (!state.dataContext) {
		state.warnings.push({
			code: "missing_summary_block_context",
			message: "Phase 23 summary block rendered without values because no data context was provided.",
			nodeType: node.type,
			path,
			severity: "warning"
		});
		return renderSummaryBlockShell({
			binding,
			items: [],
			node,
			path
		});
	}
	return renderSummaryBlockShell({
		binding,
		items: resolveSummaryBlockItems({
			binding,
			context: state.dataContext,
			nodeType: node.type,
			path,
			state
		}),
		node,
		path
	});
}
function renderDocumentPlaceholder(node, path, state) {
	const placeholderResult = readDocumentPlaceholder(node.attrs, state.placeholderBindings);
	if (placeholderResult.status === "invalid") {
		state.warnings.push({
			code: "invalid_placeholder",
			details: {
				placeholderId: placeholderResult.reference.placeholderId,
				validationError: placeholderResult.reference.validationError
			},
			message: "Phase 24 document placeholder was omitted because the referenced placeholder contract is invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return "";
	}
	if (placeholderResult.status === "missing") {
		state.warnings.push({
			code: "missing_placeholder",
			message: "Phase 24 document placeholder was omitted because the placeholder contract is missing or invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return "";
	}
	const placeholder = placeholderResult.placeholder;
	if (!placeholder.label) state.warnings.push({
		code: "missing_placeholder_label",
		details: {
			kind: placeholder.kind,
			placeholderId: placeholder.id
		},
		message: "Phase 24 document placeholder rendered with a fallback label because no label was provided.",
		nodeType: node.type,
		path,
		severity: "warning"
	});
	return renderDocumentPlaceholderElement(placeholder);
}
function renderPageBreak(node, path, state) {
	const result = DocumentPageBreakAttributesSchema.safeParse(node.attrs ?? {});
	if (!result.success) {
		state.warnings.push({
			code: "invalid_page_break",
			details: { validationError: result.error.message },
			message: "Phase 25 page break was omitted because its structured attributes are invalid.",
			nodeType: node.type,
			path,
			severity: "error"
		});
		return "";
	}
	if (isInvalidPageBreakPlacement(state.ancestors)) state.warnings.push({
		code: "invalid_page_flow_placement",
		details: { ancestors: state.ancestors },
		message: "Phase 25 page break is nested inside content that may not honor block pagination.",
		nodeType: node.type,
		path,
		severity: "warning"
	});
	return renderPageBreakElement(result.data);
}
function renderPageBreakElement(attrs) {
	return renderElement$1("div", {
		"aria-hidden": "true",
		class: "pdf-page-break",
		"data-asym-page-break": "true",
		...attrs.id ? { "data-page-break-id": attrs.id } : {},
		...attrs.label ? { "data-page-break-label": attrs.label } : {}
	}, "");
}
function resolveSummaryBlockItems(input) {
	const calculation = input.binding.calculation;
	switch (calculation.type) {
		case "total_contributions": return resolveTotalContributionsSummary(input, calculation);
		case "invoice_totals": return resolveInvoiceSummary(input, calculation);
		case "financial_report_totals": return resolveFinancialReportSummary(input, calculation);
		case "grouped_subtotals": return resolveGroupedSubtotalSummary(input, calculation);
		case "grand_total": return resolveGrandTotalSummary(input, calculation);
		case "table_total": return resolveTableTotalSummary(input, calculation);
	}
}
function resolveTotalContributionsSummary(input, calculation) {
	const result = calculateNumericAggregate({
		context: input.context,
		operation: "sum",
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath,
		valuePath: calculation.amountPath
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	if (!result.value) return [];
	return [createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: calculation.amountPath,
		key: "total_contributions",
		label: calculation.label ?? "Total contributions",
		path: input.path,
		sourcePath: calculation.sourcePath,
		state: input.state,
		value: result.value
	})];
}
function resolveInvoiceSummary(input, calculation) {
	const result = calculateInvoiceTotals({
		amountPath: calculation.amountPath,
		context: input.context,
		discountPath: calculation.discountPath,
		lineItemsPath: calculation.lineItemsPath,
		precision: input.binding.precision,
		quantityPath: calculation.quantityPath,
		ratePath: calculation.ratePath,
		taxPath: calculation.taxPath
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	const values = {
		discounts: result.discounts,
		subtotal: result.subtotal,
		taxes: result.taxes,
		total: result.total
	};
	const defaultLabels = {
		discounts: "Discount",
		subtotal: "Subtotal",
		taxes: "Tax",
		total: "Total"
	};
	return calculation.fields.map((field) => createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: field,
		key: field,
		label: calculation.labels?.[field] ?? defaultLabels[field],
		path: input.path,
		sourcePath: calculation.lineItemsPath,
		state: input.state,
		value: values[field]
	}));
}
function resolveFinancialReportSummary(input, calculation) {
	const result = calculateFinancialTotals({
		amountPath: calculation.amountPath,
		categoryPath: calculation.categoryPath,
		context: input.context,
		expenseCategories: calculation.expenseCategories,
		incomeCategories: calculation.incomeCategories,
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	const values = {
		expense: result.expense,
		income: result.income,
		net: result.net
	};
	const defaultLabels = {
		expense: "Expense",
		income: "Income",
		net: "Net"
	};
	return calculation.fields.map((field) => createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: field,
		key: field,
		label: calculation.labels?.[field] ?? defaultLabels[field],
		path: input.path,
		sourcePath: calculation.sourcePath,
		state: input.state,
		value: values[field]
	}));
}
function resolveGroupedSubtotalSummary(input, calculation) {
	const result = calculateGroupedTableTotals({
		context: input.context,
		groupPath: calculation.groupPath,
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath,
		valuePath: calculation.valuePath
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	const groupItems = result.groups.map((group) => createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: calculation.valuePath,
		groupKey: group.key,
		key: `group.${group.key}`,
		label: calculation.labels?.[group.key] ?? group.label,
		path: input.path,
		sourcePath: calculation.sourcePath,
		state: input.state,
		value: group.total
	}));
	if (!calculation.includeGrandTotal) return groupItems;
	return [...groupItems, createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: calculation.valuePath,
		key: "grand_total",
		label: calculation.grandTotalLabel ?? "Grand total",
		path: input.path,
		sourcePath: calculation.sourcePath,
		state: input.state,
		value: result.grandTotal
	})];
}
function resolveGrandTotalSummary(input, calculation) {
	const result = calculateGroupedTableTotals({
		context: input.context,
		groupPath: calculation.groupPath,
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath,
		valuePath: calculation.valuePath
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	return [createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: calculation.valuePath,
		key: "grand_total",
		label: calculation.label ?? "Grand total",
		path: input.path,
		sourcePath: calculation.sourcePath,
		state: input.state,
		value: result.grandTotal
	})];
}
function resolveTableTotalSummary(input, calculation) {
	const tableBinding = input.state.tableBindings.bindings.get(calculation.tableBindingId);
	if (!tableBinding) {
		input.state.warnings.push({
			code: "invalid_calculation_reference",
			details: { tableBindingId: calculation.tableBindingId },
			message: `Summary block references unknown table binding "${calculation.tableBindingId}".`,
			nodeType: input.nodeType,
			path: input.path,
			severity: "error"
		});
		return [];
	}
	const column = tableBinding.columns.find((candidate) => candidate.key === calculation.columnKey);
	const operation = calculation.operation ?? tableBinding.totals.find((total) => total.columnKey === calculation.columnKey)?.operation ?? "sum";
	const totalBinding = {
		columnKey: calculation.columnKey,
		label: calculation.label,
		operation
	};
	const result = calculateTableTotals({
		context: input.context,
		tableBinding: {
			...tableBinding,
			totals: [totalBinding]
		}
	});
	pushCalculationDiagnostics({
		bindingId: input.binding.id,
		diagnostics: result.diagnostics,
		nodeType: input.nodeType,
		path: input.path,
		state: input.state
	});
	const total = result.totals[0];
	if (!column || !total?.value) return [];
	return [createRenderedSummaryItem({
		binding: input.binding,
		fieldPath: column.sourcePath,
		key: `table.${calculation.tableBindingId}.${calculation.columnKey}`,
		label: calculation.label ?? total.label ?? column.label,
		path: input.path,
		sourcePath: tableBinding.sourcePath,
		state: input.state,
		value: total.value
	})];
}
function createRenderedSummaryItem(input) {
	return {
		displayValue: formatCalculationValue({
			formatter: input.binding.formatter,
			key: `summary.${input.binding.id}.${input.key}`,
			label: input.label,
			path: input.path,
			sourcePath: input.sourcePath,
			state: input.state,
			value: input.value
		}),
		fieldPath: input.fieldPath,
		groupKey: input.groupKey,
		key: input.key,
		label: input.label,
		sourcePath: input.sourcePath,
		value: input.value
	};
}
function renderSummaryBlockShell(input) {
	const titleHtml = input.binding?.title ? renderElement$1("h2", { class: "pdf-summary-block-title" }, escapeHtml$1(input.binding.title)) : "";
	const listHtml = renderElement$1("dl", { class: "pdf-summary-list" }, input.items.map((item) => renderElement$1("div", {
		class: "pdf-summary-item",
		"data-summary-count": String(item.value.count),
		"data-summary-decimal": item.value.decimal,
		...item.fieldPath ? { "data-summary-field-path": item.fieldPath } : {},
		...item.groupKey ? { "data-summary-group-key": item.groupKey } : {},
		"data-summary-item-key": item.key,
		"data-summary-minor-units": item.value.minorUnits,
		"data-summary-scale": String(item.value.scale),
		...item.sourcePath ? { "data-summary-source-path": item.sourcePath } : {}
	}, `${renderElement$1("dt", {}, escapeHtml$1(item.label))}${renderElement$1("dd", {}, escapeHtml$1(item.displayValue))}`)).join(""));
	return renderElement$1("section", {
		...getElementAttributes(input.node, {
			className: "pdf-summary-block",
			excludedAttributeNames: ["binding", "bindingId"]
		}),
		"data-asym-summary-block": "true",
		...input.binding ? {
			"data-summary-block-binding-id": input.binding.id,
			"data-summary-calculation-type": input.binding.calculation.type
		} : {},
		"data-summary-block-path": input.path.join(".")
	}, `${titleHtml}${listHtml}`);
}
function renderDocumentPlaceholderElement(placeholder) {
	const attributes = createDocumentPlaceholderAttributes(placeholder);
	const label = placeholder.label ?? `${formatPlaceholderKind(placeholder.kind)} placeholder`;
	if (placeholder.kind === "checkbox") return renderElement$1("span", attributes, `${renderElement$1("span", {
		"aria-hidden": "true",
		class: "pdf-document-placeholder-box"
	}, "")}${renderPlaceholderLabel(label)}`);
	if (placeholder.kind === "signature" || placeholder.kind === "initials") return renderElement$1("span", attributes, `${renderPlaceholderLabel(label)}${renderElement$1("span", {
		"aria-hidden": "true",
		class: "pdf-document-placeholder-line"
	}, "")}`);
	if (placeholder.kind === "qr") return renderElement$1("span", attributes, `${renderElement$1("span", {
		"aria-hidden": "true",
		class: "pdf-document-placeholder-qr-box"
	}, "QR")}${renderPlaceholderLabel(label)}`);
	const controlText = placeholder.kind === "date" ? "Date" : formatPlaceholderKind(placeholder.kind);
	return renderElement$1("span", attributes, `${renderPlaceholderLabel(label)}${renderElement$1("span", { class: "pdf-document-placeholder-control" }, escapeHtml$1(controlText))}`);
}
function createDocumentPlaceholderAttributes(placeholder) {
	const attributes = {
		class: `pdf-document-placeholder pdf-document-placeholder--${placeholder.kind.replace(/_/g, "-")}`,
		contenteditable: "false",
		"data-placeholder-id": placeholder.id,
		"data-placeholder-kind": placeholder.kind,
		"data-placeholder-required": String(placeholder.required)
	};
	if (placeholder.adapterKey) attributes["data-placeholder-adapter-key"] = placeholder.adapterKey;
	if (placeholder.dataPath) attributes["data-placeholder-data-path"] = placeholder.dataPath;
	if (placeholder.kind === "text_field") {
		if (placeholder.placeholderText) attributes["data-placeholder-text"] = placeholder.placeholderText;
		if (placeholder.maxLength) attributes["data-placeholder-max-length"] = String(placeholder.maxLength);
		attributes["data-placeholder-multiline"] = String(placeholder.multiline);
	}
	if (placeholder.kind === "checkbox") attributes["data-placeholder-checked-by-default"] = String(placeholder.checkedByDefault);
	if (placeholder.kind === "signature" || placeholder.kind === "initials") {
		if (placeholder.signerRole) attributes["data-placeholder-signer-role"] = placeholder.signerRole;
		if (placeholder.width) attributes["data-placeholder-width"] = String(placeholder.width);
		if (placeholder.height) attributes["data-placeholder-height"] = String(placeholder.height);
	}
	if (placeholder.kind === "date" && placeholder.dateFormat) attributes["data-placeholder-date-format"] = placeholder.dateFormat;
	if (placeholder.kind === "qr") {
		attributes["data-placeholder-qr-payload-type"] = placeholder.payload.type;
		const payloadValue = getQrPayloadAttributeValue(placeholder.payload);
		if (payloadValue) attributes[payloadValue.name] = payloadValue.value;
		if (placeholder.size) attributes["data-placeholder-size"] = String(placeholder.size);
		if (placeholder.errorCorrectionLevel) attributes["data-placeholder-qr-error-correction-level"] = placeholder.errorCorrectionLevel;
	}
	return attributes;
}
function getQrPayloadAttributeValue(payload) {
	if (payload.type === "variable") return {
		name: "data-placeholder-qr-payload-key",
		value: payload.key
	};
	return {
		name: "data-placeholder-qr-payload-value",
		value: payload.value
	};
}
function renderPlaceholderLabel(label) {
	return renderElement$1("span", { class: "pdf-document-placeholder-label" }, escapeHtml$1(label));
}
function formatPlaceholderKind(kind) {
	return kind.replace(/_/g, " ").replace(/^\w/u, (character) => character.toUpperCase());
}
function formatCalculationValue(input) {
	const formatted = formatVariableValue({
		definition: createCalculationValueDefinition(input),
		formatter: input.formatter,
		value: Number(input.value.decimal)
	});
	for (const diagnostic of formatted.diagnostics) input.state.warnings.push({
		code: "invalid_calculation_reference",
		details: {
			formatter: diagnostic.formatter,
			sourcePath: diagnostic.sourcePath,
			variableKey: diagnostic.variableKey
		},
		message: diagnostic.message,
		path: input.path,
		severity: diagnostic.severity
	});
	return formatted.formattedValue || input.value.decimal;
}
function createCalculationValueDefinition(input) {
	const valueType = input.formatter.startsWith("currency") ? "currency" : "number";
	return {
		description: `Phase 23 calculated value "${input.label}".`,
		documentCategories: ["financial_report"],
		fallback: { mode: "omit" },
		formatter: input.formatter,
		group: "computed",
		key: normalizeComputedVariableKey(input.key),
		label: input.label,
		privacy: "financial",
		required: false,
		sampleValue: 0,
		sourcePath: input.sourcePath ?? "computed",
		type: valueType
	};
}
function normalizeComputedVariableKey(key) {
	return key.replace(/[^A-Za-z0-9_.-]/g, "_");
}
function resolveCalculationFormatter(column, operation) {
	if (operation === "count") return "number.integer";
	return column.formatter ?? (column.type === "currency" ? "currency.usd" : "number");
}
function pushCalculationDiagnostics(input) {
	input.state.warnings.push(...input.diagnostics.map((diagnostic) => ({
		code: "invalid_calculation_reference",
		details: {
			bindingId: input.bindingId,
			diagnosticCode: diagnostic.code,
			fieldPath: diagnostic.fieldPath,
			sourceIndex: diagnostic.sourceIndex,
			sourcePath: diagnostic.sourcePath,
			...diagnostic.details
		},
		message: diagnostic.message,
		nodeType: input.nodeType,
		path: input.path,
		severity: diagnostic.severity
	})));
}
function renderDataTableShell(input) {
	const headerHtml = input.binding ? renderDataTableHeader(input.binding) : "";
	const footerHtml = input.totalPlaceholdersHtml ? renderElement$1("tfoot", { class: "pdf-data-table-footer" }, input.totalPlaceholdersHtml) : "";
	const bodyHtml = renderElement$1("tbody", { class: "pdf-data-table-body" }, input.bodyHtml);
	return renderElement$1("table", {
		...getElementAttributes(input.node, {
			className: "pdf-data-table",
			excludedAttributeNames: ["binding", "bindingId"]
		}),
		"data-asym-data-table": "true",
		"data-data-table-path": input.path.join("."),
		...input.binding ? {
			"data-table-binding-id": input.binding.id,
			"data-table-repeat-header": String(input.binding.repeatHeader),
			"data-table-source-path": input.binding.sourcePath
		} : {}
	}, `${headerHtml}${bodyHtml}${footerHtml}`);
}
function renderDataTableHeader(binding) {
	return renderElement$1("thead", { class: "pdf-data-table-header" }, renderElement$1("tr", {}, binding.columns.map((column) => renderElement$1("th", {
		class: "pdf-data-table-heading",
		"data-table-column-key": column.key,
		scope: "col",
		...getDataTableCellStyleAttributes(column)
	}, escapeHtml$1(column.label))).join("")));
}
function renderDataTableRows(rows, avoidRowSplit) {
	return rows.map((row) => renderElement$1("tr", {
		class: joinClassNames("pdf-data-table-row", avoidRowSplit ? "pdf-table-row-avoid-break" : void 0),
		...avoidRowSplit ? { "data-table-avoid-row-split": "true" } : {},
		"data-table-rendered-index": String(row.renderedIndex),
		"data-table-source-index": String(row.sourceIndex)
	}, row.cells.map(renderDataTableCell).join(""))).join("");
}
function renderDataTableCell(cell) {
	return renderElement$1("td", {
		class: "pdf-data-table-cell",
		"data-table-column-key": cell.columnKey,
		...getDataTableCellStyleAttributes(cell)
	}, escapeHtml$1(cell.displayValue));
}
function renderDataTableEmptyState(binding) {
	if (!binding.emptyState) return "";
	return renderElement$1("tr", {
		class: joinClassNames("pdf-data-table-empty", binding.avoidRowSplit ? "pdf-table-row-avoid-break" : void 0),
		...binding.avoidRowSplit ? { "data-table-avoid-row-split": "true" } : {},
		"data-table-empty-state": "true"
	}, renderElement$1("td", { colspan: String(binding.columns.length) }, escapeHtml$1(binding.emptyState)));
}
function renderDataTableTotalPlaceholders(binding) {
	if (binding.totals.length === 0) return "";
	return binding.totals.map((total) => renderElement$1("tr", {
		class: joinClassNames("pdf-data-table-total-placeholder", binding.avoidRowSplit ? "pdf-table-row-avoid-break" : void 0),
		...binding.avoidRowSplit ? { "data-table-avoid-row-split": "true" } : {},
		"data-table-total-column-key": total.columnKey,
		"data-table-total-operation": total.operation,
		"data-table-total-placeholder": "true"
	}, renderElement$1("td", { colspan: String(binding.columns.length) }, escapeHtml$1(total.label ?? total.columnKey)))).join("");
}
function renderDataTableTotalRows(binding, totals) {
	return totals.map((total) => renderDataTableTotalRow({
		binding,
		className: "pdf-data-table-total-row",
		column: total.column,
		avoidRowSplit: binding.avoidRowSplit,
		extraAttributes: {
			"data-table-total-column-key": total.total.columnKey,
			"data-table-total-count": total.total.value ? String(total.total.value.count) : "0",
			"data-table-total-decimal": total.total.value?.decimal ?? "",
			"data-table-total-minor-units": total.total.value?.minorUnits ?? "",
			"data-table-total-operation": total.total.operation,
			"data-table-total-scale": total.total.value ? String(total.total.value.scale) : "0"
		},
		label: total.total.label ?? total.column.label,
		value: total.displayValue
	})).join("");
}
function renderDataTableTotalRow(input) {
	const columnIndex = input.binding.columns.findIndex((column) => column.key === input.column.key);
	const resolvedColumnIndex = columnIndex < 0 ? 0 : columnIndex;
	const leadingSpan = Math.max(resolvedColumnIndex, 1);
	const trailingSpan = input.binding.columns.length - resolvedColumnIndex - 1;
	const cellsHtml = [
		renderElement$1("td", {
			class: "pdf-data-table-total-label",
			colspan: String(leadingSpan)
		}, escapeHtml$1(input.label)),
		renderElement$1("td", {
			class: "pdf-data-table-total-value",
			"data-table-column-key": input.column.key,
			...getDataTableCellStyleAttributes(input.column)
		}, escapeHtml$1(input.value)),
		trailingSpan > 0 ? renderElement$1("td", {
			class: "pdf-data-table-total-empty",
			colspan: String(trailingSpan)
		}, "") : ""
	].join("");
	return renderElement$1("tr", {
		class: joinClassNames(input.className, input.avoidRowSplit ? "pdf-table-row-avoid-break" : void 0),
		...input.avoidRowSplit ? { "data-table-avoid-row-split": "true" } : {},
		...input.extraAttributes ?? {}
	}, cellsHtml);
}
function getDataTableCellStyleAttributes(input) {
	const style = { "text-align": input.align };
	if (input.width) style.width = input.width;
	return { style: serializeStyle(style) };
}
function renderChildren(children, path, state, parentType) {
	if (!children) return "";
	const childState = parentType ? {
		...state,
		ancestors: [...state.ancestors, parentType]
	} : state;
	return children.map((child, index) => renderNode(child, [
		...path,
		"content",
		String(index)
	], childState)).join("");
}
function renderTextNode(node, path, state) {
	let renderedText = escapeHtml$1(node.text ?? "");
	for (const mark of getNodeMarks(node)) {
		const renderer = state.markRenderers.get(mark.type);
		if (!renderer) {
			state.warnings.push({
				code: "unknown_mark",
				severity: "warning",
				message: `Phase 09 serializer ignored unknown mark "${mark.type}".`,
				path,
				markType: mark.type
			});
			continue;
		}
		renderedText = renderer.render({
			mark,
			node,
			path,
			childrenHtml: renderedText,
			addWarning: (warning) => {
				state.warnings.push(warning);
			}
		});
	}
	return renderedText;
}
function renderDoc(context) {
	return context.childrenHtml;
}
function renderBody(context) {
	return renderElement$1("div", getElementAttributes(context.node, { className: "pdf-document-body" }), context.childrenHtml);
}
function renderContainer(context) {
	return renderElement$1("div", getElementAttributes(context.node, { className: "pdf-document-container" }), context.childrenHtml);
}
function renderSection(context) {
	const pageFlow = readPageFlowControls(context.node.attrs);
	const className = joinClassNames("pdf-document-section", pageFlow.keepTogether ? "pdf-keep-together" : void 0, pageFlow.startOnNewPage ? "pdf-start-on-new-page" : void 0);
	if (pageFlow.keepTogether) addPaginationHintWarning({
		control: "keepTogether",
		context,
		message: "Phase 25 keep-together is a print pagination hint and may not be honored by browser preview or every renderer."
	});
	return renderElement$1("section", {
		...getElementAttributes(context.node, {
			className,
			excludedAttributeNames: ["keepTogether", "startOnNewPage"]
		}),
		...pageFlow.keepTogether ? { "data-page-flow-keep-together": "true" } : {},
		...pageFlow.startOnNewPage ? { "data-page-flow-start-on-new-page": "true" } : {}
	}, context.childrenHtml);
}
function renderConditionalSection(node, path, state) {
	const rule = readConditionalRule(node.attrs);
	if (!rule) {
		state.warnings.push({
			code: "invalid_condition_rule",
			severity: "error",
			message: "Phase 16 conditional section rendered content because the rule is missing or invalid.",
			path,
			nodeType: node.type
		});
		return renderConditionalSectionElement(node, path, renderChildren(node.content, path, state, node.type), "true");
	}
	const evaluation = evaluatePdfDocumentCondition({
		context: state.dataContext,
		nodeType: node.type,
		path,
		rule
	});
	state.warnings.push(...evaluation.warnings);
	if (!evaluation.visible) return "";
	return renderConditionalSectionElement(node, path, renderChildren(node.content, path, state, node.type), "true", rule);
}
function renderConditionalSectionElement(node, path, childrenHtml, visible, rule) {
	return renderElement$1("section", {
		...getElementAttributes(node, {
			className: "pdf-conditional-section",
			excludedAttributeNames: ["condition", "rule"]
		}),
		"data-asym-conditional-section": "true",
		"data-condition-path": path.join("."),
		"data-condition-visible": visible,
		...rule ? {
			"data-condition-field-path": rule.fieldPath,
			"data-condition-operator": rule.operator
		} : {}
	}, childrenHtml);
}
function renderParagraph(context) {
	const alignment = readAlignmentAttribute(context.node.attrs);
	const alignmentStyle = alignment ? { "text-align": alignment } : void 0;
	return renderElement$1("p", getElementAttributes(context.node, {
		excludedAttributeNames: ["alignment"],
		extraStyle: alignmentStyle
	}), context.childrenHtml);
}
function renderHeading(context) {
	const level = clampHeadingLevel(readNumberAttribute(context.node.attrs, "level"));
	const avoidBreakAfter = readPageFlowControls(context.node.attrs).avoidBreakAfter !== false;
	return renderElement$1(`h${level}`, {
		...getElementAttributes(context.node, {
			className: avoidBreakAfter ? "pdf-heading-avoid-break-after" : void 0,
			excludedAttributeNames: ["avoidBreakAfter", "level"]
		}),
		...avoidBreakAfter ? { "data-page-flow-avoid-break-after": "true" } : {}
	}, context.childrenHtml);
}
function renderImage(context) {
	const asset = resolveNodeAsset(context);
	const src = asset ? resolveAssetSource(asset) : readStringAttribute(context.node.attrs, "src");
	if (!src) {
		context.addWarning({
			code: asset ? "missing_asset" : "missing_attribute",
			severity: asset ? "error" : "warning",
			message: asset ? "Phase 27 asset image node is missing a renderable asset URL." : "Phase 09 image node is missing a src attribute.",
			path: context.path,
			nodeType: context.node.type,
			details: asset ? {
				assetId: asset.assetId,
				referenceId: asset.id
			} : { attribute: "src" }
		});
		return "";
	}
	if (context.assetRenderMode === "production_render" && isUnsafeProductionAssetUrl(src)) {
		context.addWarning({
			code: "unsafe_asset_url",
			details: {
				assetId: asset?.assetId,
				referenceId: asset?.id
			},
			message: "Phase 27 asset image node rejected a URL that production rendering cannot fetch safely.",
			nodeType: context.node.type,
			path: context.path,
			severity: "error"
		});
		return "";
	}
	if (context.assetRenderMode === "production_render" && asset && !asset.renderSafe && !asset.renderSafeUrl) context.addWarning({
		code: "asset_not_render_safe",
		details: {
			assetId: asset.assetId,
			referenceId: asset.id
		},
		message: "Phase 27 asset image node rendered a production asset that is not marked render-safe.",
		nodeType: context.node.type,
		path: context.path,
		severity: "warning"
	});
	const altText = asset?.altText ?? readStringAttribute(context.node.attrs, "alt") ?? readStringAttribute(context.node.attrs, "altText");
	const width = asset?.width !== void 0 ? String(asset.width) : readScalarAttribute(context.node.attrs, "width");
	const height = asset?.height !== void 0 ? String(asset.height) : readScalarAttribute(context.node.attrs, "height");
	const role = asset?.role ?? readStringAttribute(context.node.attrs, "role") ?? "image";
	const alignment = asset?.alignment ?? readStringAttribute(context.node.attrs, "alignment");
	const linkUrl = asset?.linkUrl ?? readStringAttribute(context.node.attrs, "linkUrl");
	if (asset && requiresAssetAltText(asset.role) && !hasNonEmptyString(altText)) context.addWarning({
		code: "missing_asset_alt_text",
		details: {
			assetId: asset.assetId,
			referenceId: asset.id
		},
		message: "Phase 27 asset image node should include alt text for accessibility and preflight.",
		nodeType: context.node.type,
		path: context.path,
		severity: "warning"
	});
	const attributes = {
		...getElementAttributes(context.node, {
			className: resolveImageClassName(asset, role, alignment),
			excludedAttributeNames: [
				"alignment",
				"alt",
				"altText",
				"asset",
				"assetId",
				"height",
				"linkUrl",
				"mimeType",
				"renderSafe",
				"renderSafeUrl",
				"role",
				"source",
				"src",
				"tenantId",
				"url",
				"width"
			]
		}),
		src
	};
	if (asset?.id) attributes["data-asset-reference-id"] = asset.id;
	if (asset?.assetId) attributes["data-asset-id"] = asset.assetId;
	if (asset && role) attributes["data-asset-role"] = role;
	if (asset?.renderSafe) attributes["data-asset-render-safe"] = "true";
	if (asset?.tenantId) attributes["data-asset-tenant-id"] = asset.tenantId;
	if (asset?.source?.provider) attributes["data-asset-source-provider"] = asset.source.provider;
	if (asset?.source?.sourceId) attributes["data-asset-source-id"] = asset.source.sourceId;
	if (altText !== void 0) attributes.alt = altText;
	if (width !== void 0) attributes.width = width;
	if (height !== void 0) attributes.height = height;
	context.addAsset({
		...asset?.id ? { id: asset.id } : {},
		...asset?.assetId ? { assetId: asset.assetId } : {},
		src,
		altText,
		role,
		...asset?.mimeType ? { mimeType: asset.mimeType } : {},
		width,
		height,
		...asset?.alignment ? { alignment: asset.alignment } : {},
		...linkUrl ? { linkUrl } : {},
		...asset ? { renderSafe: asset.renderSafe } : {},
		...asset?.tenantId ? { tenantId: asset.tenantId } : {},
		...asset?.source ? { source: asset.source } : {},
		path: context.path
	});
	if (!linkUrl) return renderElement$1("img", attributes, "", true);
	const safeHref = normalizeSafeHref(linkUrl);
	if (!safeHref) {
		context.addWarning({
			code: "unsafe_url",
			details: { attribute: "linkUrl" },
			message: "Phase 27 asset image node omitted an unsafe link URL.",
			nodeType: context.node.type,
			path: context.path,
			severity: "warning"
		});
		return renderElement$1("img", attributes, "", true);
	}
	return renderElement$1("a", {
		class: "pdf-asset-image-link",
		href: safeHref
	}, renderElement$1("img", attributes, "", true));
}
function resolveNodeAsset(context) {
	const inlineAsset = readInlineAssetReference(context);
	if (inlineAsset) return applyNodeAssetOverrides(inlineAsset, context.node.attrs);
	const referenceId = readStringAttribute(context.node.attrs, "assetReferenceId") ?? readStringAttribute(context.node.attrs, "assetRefId");
	const assetId = readStringAttribute(context.node.attrs, "assetId");
	const referencedAsset = context.resolveAssetReference({
		assetId,
		referenceId
	});
	if (referencedAsset) return applyNodeAssetOverrides(referencedAsset, context.node.attrs);
	const directAsset = createDirectNodeAsset(context);
	if (directAsset) return directAsset;
	if (context.node.type === "assetImage" || assetId || referenceId) context.addWarning({
		code: "missing_asset",
		details: {
			assetId,
			referenceId
		},
		message: "Phase 27 asset image node references an asset that was not provided to the renderer.",
		nodeType: context.node.type,
		path: context.path,
		severity: "error"
	});
}
function readInlineAssetReference(context) {
	const asset = context.node.attrs?.asset;
	if (!isRecord(asset)) return;
	const parseResult = DocumentAssetReferenceSchema.safeParse(asset);
	if (parseResult.success) return parseResult.data;
	context.addWarning({
		code: "invalid_asset_reference",
		details: { validationError: parseResult.error.issues[0]?.message ?? "Unknown asset reference validation error." },
		message: "Phase 27 inline asset image reference failed validation.",
		nodeType: context.node.type,
		path: context.path,
		severity: "error"
	});
}
function createDirectNodeAsset(context) {
	const renderSafeUrl = readStringAttribute(context.node.attrs, "renderSafeUrl");
	const url = readStringAttribute(context.node.attrs, "url") ?? (context.node.type === "assetImage" ? readStringAttribute(context.node.attrs, "src") : void 0);
	const assetId = readStringAttribute(context.node.attrs, "assetId");
	const mimeType = readStringAttribute(context.node.attrs, "mimeType");
	const altText = readStringAttribute(context.node.attrs, "altText") ?? readStringAttribute(context.node.attrs, "alt");
	const width = readNumberAssetAttribute(context.node.attrs, "width");
	const height = readNumberAssetAttribute(context.node.attrs, "height");
	const alignment = readAssetAlignment(context.node.attrs);
	const linkUrl = readStringAttribute(context.node.attrs, "linkUrl");
	const renderSafe = readBooleanAttribute(context.node.attrs, "renderSafe");
	const tenantId = readStringAttribute(context.node.attrs, "tenantId");
	if (!renderSafeUrl && !url && !assetId) return;
	const input = {
		id: readStringAttribute(context.node.attrs, "id") ?? `asset-${context.path.join("-") || "root"}`,
		role: readNodeAssetRole(context.node.attrs) ?? "image",
		...assetId ? { assetId } : {},
		...url ? { url } : {},
		...renderSafeUrl ? { renderSafeUrl } : {},
		...mimeType ? { mimeType } : {},
		...altText ? { altText } : {},
		...width ? { width } : {},
		...height ? { height } : {},
		...alignment ? { alignment } : {},
		...linkUrl ? { linkUrl } : {},
		...renderSafe !== void 0 ? { renderSafe } : {},
		...tenantId ? { tenantId } : {}
	};
	const parseResult = DocumentAssetReferenceSchema.safeParse(input);
	if (parseResult.success) return parseResult.data;
	context.addWarning({
		code: "invalid_asset_reference",
		details: { validationError: parseResult.error.issues[0]?.message ?? "Unknown asset reference validation error." },
		message: "Phase 27 direct asset image attributes failed validation.",
		nodeType: context.node.type,
		path: context.path,
		severity: "error"
	});
}
function applyNodeAssetOverrides(asset, attrs) {
	const role = readNodeAssetRole(attrs);
	const altText = readStringAttribute(attrs, "altText") ?? readStringAttribute(attrs, "alt");
	const width = readNumberAssetAttribute(attrs, "width");
	const height = readNumberAssetAttribute(attrs, "height");
	const alignment = readAssetAlignment(attrs);
	const linkUrl = readStringAttribute(attrs, "linkUrl");
	const renderSafe = readBooleanAttribute(attrs, "renderSafe");
	return {
		...asset,
		role: role ?? asset.role,
		...altText !== void 0 ? { altText } : {},
		...width !== void 0 ? { width } : {},
		...height !== void 0 ? { height } : {},
		...alignment !== void 0 ? { alignment } : {},
		...linkUrl !== void 0 ? { linkUrl } : {},
		...renderSafe !== void 0 ? { renderSafe } : {}
	};
}
function resolveAssetReference(reference, registry) {
	if (reference.referenceId) {
		const asset = registry.byReferenceId.get(reference.referenceId);
		if (asset) return asset;
	}
	if (reference.assetId) return registry.byAssetId.get(reference.assetId) ?? registry.byReferenceId.get(reference.assetId);
}
function resolveAssetSource(asset) {
	return asset.renderSafeUrl ?? asset.url;
}
function resolveImageClassName(asset, role, alignment) {
	if (!asset) return "pdf-image";
	return joinClassNames("pdf-image", "pdf-asset-image", role ? `pdf-asset-image--${role}` : void 0, alignment && alignment !== "left" ? `pdf-asset-image--${alignment}` : void 0) ?? "pdf-image pdf-asset-image";
}
function readNodeAssetRole(attrs) {
	const role = readStringAttribute(attrs, "role");
	return isDocumentAssetRole(role) ? role : void 0;
}
function readAssetAlignment(attrs) {
	const alignment = readStringAttribute(attrs, "alignment");
	return alignment === "left" || alignment === "center" || alignment === "right" || alignment === "full_width" ? alignment : void 0;
}
function readNumberAssetAttribute(attrs, name) {
	const value = attrs?.[name];
	if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
	if (typeof value === "string" && /^\d+$/.test(value)) {
		const parsed = Number(value);
		return parsed > 0 ? parsed : void 0;
	}
}
function renderButton(context) {
	const hrefResult = readSafeHrefAttribute(context.node.attrs);
	const alignment = readAlignmentAttribute(context.node.attrs);
	const alignmentStyle = alignment ? { "text-align": alignment } : void 0;
	if (hrefResult.unsafeHref) context.addWarning({
		code: "unsafe_url",
		severity: "warning",
		message: "Pre-Phase 18 button node omitted an unsafe href attribute.",
		path: context.path,
		nodeType: context.node.type,
		details: { attribute: "href" }
	});
	if (!hrefResult.href) {
		if (!hrefResult.unsafeHref) context.addWarning({
			code: "missing_attribute",
			severity: "warning",
			message: "Phase 09 button node is missing an href attribute.",
			path: context.path,
			nodeType: context.node.type,
			details: { attribute: "href" }
		});
		return renderElement$1("span", getElementAttributes(context.node, {
			className: "pdf-button",
			excludedAttributeNames: ["alignment", "href"],
			extraStyle: alignmentStyle
		}), context.childrenHtml);
	}
	return renderElement$1("a", {
		...getElementAttributes(context.node, {
			className: "pdf-button",
			excludedAttributeNames: ["alignment", "href"],
			extraStyle: alignmentStyle
		}),
		href: hrefResult.href
	}, context.childrenHtml);
}
function renderColumns(context) {
	const columnCount = Array.isArray(context.node.content) ? context.node.content.length : 0;
	const className = columnCount > 0 ? `pdf-columns pdf-columns--${columnCount}` : "pdf-columns";
	return renderElement$1("div", getElementAttributes(context.node, { className }), context.childrenHtml);
}
function renderColumn(context) {
	return renderElement$1("div", getElementAttributes(context.node, { className: "pdf-column" }), context.childrenHtml);
}
function renderTable(context) {
	const alignment = readAlignmentAttribute(context.node.attrs);
	const alignmentStyle = alignment ? { margin: alignmentToMargin(alignment) } : void 0;
	return renderElement$1("table", getElementAttributes(context.node, {
		className: "pdf-table",
		excludedAttributeNames: ["alignment"],
		extraStyle: alignmentStyle
	}), context.childrenHtml);
}
function renderTableRow(context) {
	const pageFlow = readPageFlowControls(context.node.attrs);
	return renderElement$1("tr", {
		...getElementAttributes(context.node, {
			className: pageFlow.avoidRowSplit ? "pdf-table-row-avoid-break" : void 0,
			excludedAttributeNames: ["avoidRowSplit"]
		}),
		...pageFlow.avoidRowSplit ? { "data-table-avoid-row-split": "true" } : {}
	}, context.childrenHtml);
}
function renderTableCell(context) {
	return renderTableCellElement("td", context);
}
function renderTableHeader(context) {
	return renderTableCellElement("th", context);
}
function renderTableCellElement(tagName, context) {
	const alignment = readAlignmentAttribute(context.node.attrs);
	const alignmentStyle = alignment ? { "text-align": alignment } : void 0;
	return renderElement$1(tagName, getElementAttributes(context.node, {
		excludedAttributeNames: ["alignment"],
		extraStyle: alignmentStyle
	}), context.childrenHtml);
}
function renderVariable(context) {
	const key = readStringAttribute(context.node.attrs, "key") ?? readStringAttribute(context.node.attrs, "variableKey");
	if (!key) {
		context.addWarning({
			code: "missing_attribute",
			severity: "warning",
			message: "Phase 09 variable node is missing a key attribute.",
			path: context.path,
			nodeType: context.node.type,
			details: { attribute: "key" }
		});
		return "";
	}
	const formatter = readStringAttribute(context.node.attrs, "formatter");
	const fallback = readVariableFallback(context.node.attrs);
	context.addVariable({
		key,
		formatter,
		...fallback ? { fallback } : {},
		path: context.path
	});
	const fallbackAttribute = fallback?.mode === "use_value" ? String(fallback.value) : void 0;
	return renderElement$1("span", {
		class: "pdf-variable",
		"data-variable-key": key,
		...formatter ? { "data-variable-formatter": formatter } : {},
		...fallbackAttribute ? { "data-variable-fallback": fallbackAttribute } : {}
	}, "");
}
function addVariableUsage(state, usage) {
	const scopes = [...state.scopes, ...usage.scopes ?? []];
	state.variables.push({
		...usage,
		...scopes.length > 0 ? { scopes } : {}
	});
}
function renderLinkMark(context) {
	const hrefResult = readSafeHrefAttribute(context.mark.attrs);
	if (hrefResult.unsafeHref) {
		context.addWarning({
			code: "unsafe_url",
			severity: "warning",
			message: "Pre-Phase 18 link mark omitted an unsafe href attribute.",
			path: context.path,
			markType: context.mark.type,
			details: { attribute: "href" }
		});
		return context.childrenHtml;
	}
	if (!hrefResult.href) {
		context.addWarning({
			code: "missing_attribute",
			severity: "warning",
			message: "Phase 09 link mark is missing an href attribute.",
			path: context.path,
			markType: context.mark.type,
			details: { attribute: "href" }
		});
		return context.childrenHtml;
	}
	return renderElement$1("a", getMarkAttributes(context.mark, {
		href: hrefResult.href,
		excludedAttributeNames: ["href"]
	}), context.childrenHtml);
}
function renderStrongMark(context) {
	return renderElement$1("strong", getMarkAttributes(context.mark), context.childrenHtml);
}
function renderEmphasisMark(context) {
	return renderElement$1("em", getMarkAttributes(context.mark), context.childrenHtml);
}
function renderUnderlineMark(context) {
	return renderElement$1("span", getMarkAttributes(context.mark, { extraStyle: { "text-decoration": "underline" } }), context.childrenHtml);
}
const builtInNodeRenderers = [
	{
		type: "doc",
		render: renderDoc
	},
	{
		type: "body",
		render: renderBody
	},
	{
		type: "container",
		render: renderContainer
	},
	{
		type: "section",
		render: renderSection
	},
	{
		type: "paragraph",
		render: renderParagraph
	},
	{
		type: "heading",
		render: renderHeading
	},
	{
		type: "image",
		render: renderImage
	},
	{
		type: "assetImage",
		render: renderImage
	},
	{
		type: "button",
		render: renderButton
	},
	{
		type: "twoColumns",
		render: renderColumns
	},
	{
		type: "threeColumns",
		render: renderColumns
	},
	{
		type: "fourColumns",
		render: renderColumns
	},
	{
		type: "columnsColumn",
		render: renderColumn
	},
	{
		type: "table",
		render: renderTable
	},
	{
		type: "tableRow",
		render: renderTableRow
	},
	{
		type: "tableCell",
		render: renderTableCell
	},
	{
		type: "tableHeader",
		render: renderTableHeader
	},
	{
		type: "variable",
		render: renderVariable
	},
	{
		type: "variableReference",
		render: renderVariable
	}
];
const builtInMarkRenderers = [
	{
		type: "link",
		render: renderLinkMark
	},
	{
		type: "bold",
		render: renderStrongMark
	},
	{
		type: "italic",
		render: renderEmphasisMark
	},
	{
		type: "underline",
		render: renderUnderlineMark
	}
];
function isDocumentNode(value) {
	if (!isRecord(value)) return false;
	return typeof value.type === "string" && value.type.length > 0;
}
function isDocumentEmpty(document) {
	return document.type === "doc" && (!document.content || document.content.length === 0);
}
function hasRenderableChildren(node) {
	return Array.isArray(node.content) && node.content.length > 0;
}
function getNodeMarks(node) {
	if (!Array.isArray(node.marks)) return [];
	return node.marks.filter(isPdfDocumentMark);
}
function isPdfDocumentMark(value) {
	return isRecord(value) && typeof value.type === "string" && value.type.length > 0;
}
function getElementAttributes(node, options = {}) {
	return getAttributes(node.attrs, options);
}
function getMarkAttributes(mark, options = {}) {
	return getAttributes(mark.attrs, options);
}
function getAttributes(sourceAttributes, options) {
	const attributes = {};
	const excludedAttributeNames = new Set(["style", ...options.excludedAttributeNames ?? []]);
	if (sourceAttributes) for (const [name, value] of Object.entries(sourceAttributes)) {
		if (excludedAttributeNames.has(name)) continue;
		const normalizedName = normalizeAttributeName(name);
		const stringValue = stringifyAttributeValue(value);
		if (stringValue !== void 0 && isSafeAttributeName(normalizedName)) attributes[normalizedName] = stringValue;
	}
	if (options.href) attributes.href = options.href;
	const sourceClass = readStringAttribute(sourceAttributes, "class");
	const sourceClassName = readStringAttribute(sourceAttributes, "className");
	const className = joinClassNames(options.className, sourceClass, sourceClassName);
	if (className) attributes.class = className;
	const style = mergeStyles(parseStyleAttribute(sourceAttributes?.style), options.extraStyle);
	if (Object.keys(style).length > 0) attributes.style = serializeStyle(style);
	return attributes;
}
function mergeStyles(...styleInputs) {
	const style = {};
	for (const styleInput of styleInputs) {
		if (!styleInput) continue;
		for (const [key, value] of Object.entries(styleInput)) {
			const normalizedKey = normalizeStyleName(key);
			if (normalizedKey && value.trim()) style[normalizedKey] = value.trim();
		}
	}
	return style;
}
function parseStyleAttribute(value) {
	if (typeof value === "string") return parseInlineStyle(value);
	if (!isRecord(value)) return {};
	const style = {};
	for (const [key, rawValue] of Object.entries(value)) if (typeof rawValue === "string" || typeof rawValue === "number") style[normalizeStyleName(key)] = String(rawValue);
	return style;
}
function parseInlineStyle(value) {
	const style = {};
	for (const declaration of value.split(";")) {
		const separatorIndex = declaration.indexOf(":");
		if (separatorIndex === -1) continue;
		const property = normalizeStyleName(declaration.slice(0, separatorIndex));
		const propertyValue = declaration.slice(separatorIndex + 1).trim();
		if (property && propertyValue) style[property] = propertyValue;
	}
	return style;
}
function serializeStyle(style) {
	return Object.keys(style).sort().map((property) => `${property}:${style[property]}`).join(";");
}
function renderElement$1(tagName, attributes, childrenHtml, voidElement = false) {
	const serializedAttributes = serializeAttributes(attributes);
	const openingTag = serializedAttributes ? `<${tagName} ${serializedAttributes}>` : `<${tagName}>`;
	if (voidElement) return serializedAttributes ? `<${tagName} ${serializedAttributes} />` : `<${tagName} />`;
	return `${openingTag}${childrenHtml}</${tagName}>`;
}
function serializeAttributes(attributes) {
	return Object.keys(attributes).sort().map((name) => `${name}="${escapeAttribute(attributes[name])}"`).join(" ");
}
function normalizeAttributeName(name) {
	if (name === "className") return "class";
	if (name === "colSpan") return "colspan";
	if (name === "rowSpan") return "rowspan";
	return name;
}
function normalizeStyleName(name) {
	return name.trim().replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`).toLowerCase();
}
function isSafeAttributeName(name) {
	if (/^on[a-z]/.test(name)) return false;
	return /^(aria-[a-z0-9-]+|data-[a-z0-9-]+|[a-z][a-z0-9-]*)$/.test(name);
}
function stringifyAttributeValue(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
}
function readStringAttribute(attributes, name) {
	const value = attributes?.[name];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function readSafeHrefAttribute(attributes) {
	const href = readStringAttribute(attributes, "href");
	if (!href) return {};
	const safeHref = normalizeSafeHref(href);
	return safeHref ? { href: safeHref } : { unsafeHref: href };
}
function normalizeSafeHref(value) {
	const href = value.trim();
	if (href.length === 0 || hasUnsafeHrefCharacters(href) || href.includes("\\") || href.startsWith("//")) return;
	if (href.startsWith("#")) return href;
	const scheme = readHrefScheme(href);
	if (scheme) return isSafeSchemeHref(href, scheme) ? href : void 0;
	return isSafeRelativeHref(href) ? href : void 0;
}
function hasUnsafeHrefCharacters(value) {
	return Array.from(value).some((character) => {
		const codePoint = character.codePointAt(0);
		return codePoint !== void 0 && (codePoint <= 32 || codePoint === 127);
	});
}
function readHrefScheme(value) {
	return /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(value)?.[1].toLowerCase();
}
function isSafeSchemeHref(href, scheme) {
	if (!safeHrefSchemes.has(scheme)) return false;
	if (scheme === "http" || scheme === "https") return isValidAbsoluteHref(href, scheme);
	return href.length > `${scheme}:`.length;
}
function isValidAbsoluteHref(href, scheme) {
	try {
		return new URL(href).protocol === `${scheme}:`;
	} catch {
		return false;
	}
}
function isSafeRelativeHref(href) {
	return href.startsWith("/") || href.startsWith("./") || href.startsWith("../") || /^[A-Za-z0-9._~-]/.test(href);
}
function readPageFlowControls(attributes) {
	const result = PageFlowControlAttributesSchema.safeParse({
		...readOptionalBooleanProperty(attributes, "avoidBreakAfter"),
		...readOptionalBooleanProperty(attributes, "avoidRowSplit"),
		...readOptionalBooleanProperty(attributes, "keepTogether"),
		...readOptionalBooleanProperty(attributes, "startOnNewPage")
	});
	return result.success ? result.data : {};
}
function readOptionalBooleanProperty(attributes, name) {
	const value = attributes?.[name];
	if (typeof value === "boolean") return { [name]: value };
	if (value === "true") return { [name]: true };
	if (value === "false") return { [name]: false };
	return {};
}
function addPaginationHintWarning(input) {
	input.context.addWarning({
		code: "pagination_hint_not_guaranteed",
		details: { control: input.control },
		message: input.message,
		nodeType: input.context.node.type,
		path: input.context.path,
		severity: "warning"
	});
}
function isInvalidPageBreakPlacement(ancestors) {
	return ancestors.some((ancestor) => invalidPageBreakAncestorTypes.has(ancestor));
}
const invalidPageBreakAncestorTypes = new Set([
	"heading",
	"paragraph",
	"table",
	"tableCell",
	"tableHeader",
	"tableRow"
]);
function readDiagnosticString(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function readVariableFallback(attributes) {
	const value = attributes?.fallback;
	if (isFallbackBehavior(value)) return value;
	if (typeof value === "string" && value.length > 0) return {
		mode: "use_value",
		value
	};
}
function readConditionalRule(attributes) {
	const rawRule = attributes?.rule ?? attributes?.condition;
	const parsedRule = typeof rawRule === "string" ? parseConditionalRuleString(rawRule) : rawRule;
	const result = ConditionalRuleSchema.safeParse(parsedRule);
	return result.success ? result.data : void 0;
}
function readRepeaterBinding(attributes, registry) {
	const inlineBinding = readStructuredAttribute(attributes, "binding");
	if (inlineBinding !== void 0) {
		const inlineResult = RepeaterBindingSchema.safeParse(inlineBinding);
		if (inlineResult.success) return {
			binding: inlineResult.data,
			status: "valid"
		};
		return {
			reference: createInvalidRepeaterBindingReference(inlineBinding, inlineResult.error.message),
			status: "invalid"
		};
	}
	const bindingId = readStringAttribute(attributes, "bindingId");
	if (!bindingId) return { status: "missing" };
	const binding = registry.bindings.get(bindingId);
	if (binding) return {
		binding,
		status: "valid"
	};
	const invalidBinding = registry.invalidBindings.get(bindingId);
	return invalidBinding ? {
		reference: invalidBinding,
		status: "invalid"
	} : { status: "missing" };
}
function readTableBinding(attributes, registry) {
	const inlineBinding = readStructuredAttribute(attributes, "binding");
	if (inlineBinding !== void 0) {
		const inlineResult = TableBindingSchema.safeParse(inlineBinding);
		if (inlineResult.success) return {
			binding: inlineResult.data,
			status: "valid"
		};
		return {
			reference: createInvalidTableBindingReference(inlineBinding, inlineResult.error.message),
			status: "invalid"
		};
	}
	const bindingId = readStringAttribute(attributes, "bindingId");
	if (!bindingId) return { status: "missing" };
	const binding = registry.bindings.get(bindingId);
	if (binding) return {
		binding,
		status: "valid"
	};
	const invalidBinding = registry.invalidBindings.get(bindingId);
	return invalidBinding ? {
		reference: invalidBinding,
		status: "invalid"
	} : { status: "missing" };
}
function readSummaryBlockBinding(attributes, registry) {
	const inlineBinding = readStructuredAttribute(attributes, "binding");
	if (inlineBinding !== void 0) {
		const inlineResult = SummaryBlockBindingSchema.safeParse(inlineBinding);
		if (inlineResult.success) return {
			binding: inlineResult.data,
			status: "valid"
		};
		return {
			reference: createInvalidSummaryBlockBindingReference(inlineBinding, inlineResult.error.message),
			status: "invalid"
		};
	}
	const bindingId = readStringAttribute(attributes, "bindingId");
	if (!bindingId) return { status: "missing" };
	const binding = registry.bindings.get(bindingId);
	if (binding) return {
		binding,
		status: "valid"
	};
	const invalidBinding = registry.invalidBindings.get(bindingId);
	return invalidBinding ? {
		reference: invalidBinding,
		status: "invalid"
	} : { status: "missing" };
}
function readDocumentPlaceholder(attributes, registry) {
	const inlinePlaceholder = readStructuredAttribute(attributes, "placeholder");
	if (inlinePlaceholder !== void 0) {
		const inlineResult = DocumentPlaceholderSchema.safeParse(inlinePlaceholder);
		if (inlineResult.success) return {
			placeholder: inlineResult.data,
			status: "valid"
		};
		return {
			reference: createInvalidPlaceholderReference(inlinePlaceholder, inlineResult.error.message),
			status: "invalid"
		};
	}
	const placeholderId = readStringAttribute(attributes, "placeholderId");
	if (!placeholderId) return { status: "missing" };
	const placeholder = registry.bindings.get(placeholderId);
	if (placeholder) return {
		placeholder,
		status: "valid"
	};
	const invalidPlaceholder = registry.invalidBindings.get(placeholderId);
	return invalidPlaceholder ? {
		reference: invalidPlaceholder,
		status: "invalid"
	} : { status: "missing" };
}
function readStructuredAttribute(attributes, name) {
	const value = attributes?.[name];
	if (typeof value !== "string") return value;
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function parseConditionalRuleString(value) {
	try {
		return JSON.parse(value);
	} catch {
		return;
	}
}
function readNumberAttribute(attributes, name) {
	const value = attributes?.[name];
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const numericValue = Number(value);
		return Number.isFinite(numericValue) ? numericValue : void 0;
	}
}
function readBooleanAttribute(attributes, name) {
	const value = attributes?.[name];
	if (typeof value === "boolean") return value;
	if (value === "true") return true;
	if (value === "false") return false;
}
function readScalarAttribute(attributes, name) {
	const value = attributes?.[name];
	if (typeof value === "string" || typeof value === "number") return String(value);
}
function readAlignmentAttribute(attributes) {
	const value = readStringAttribute(attributes, "alignment");
	return value && safeAlignmentValues.has(value) ? value : void 0;
}
function joinClassNames(...values) {
	const className = values.flatMap((value) => value?.split(/\s+/) ?? []).filter((value) => value.length > 0).join(" ");
	return className.length > 0 ? className : void 0;
}
function hasNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function isDocumentAssetRole(value) {
	return value === "logo" || value === "image" || value === "signature" || value === "font" || value === "qr" || value === "attachment";
}
function requiresAssetAltText(role) {
	return role === "logo" || role === "image" || role === "signature" || role === "qr";
}
function isUnsafeProductionAssetUrl(value) {
	const normalized = value.trim().toLowerCase();
	return normalized.startsWith("blob:") || normalized.startsWith("file:") || normalized.startsWith("data:") || normalized.startsWith("http://localhost") || normalized.startsWith("http://127.0.0.1") || normalized.startsWith("http://[::1]");
}
function clampHeadingLevel(level) {
	if (!level) return 1;
	return Math.min(Math.max(Math.trunc(level), 1), 6);
}
function alignmentToMargin(alignment) {
	if (alignment === "center") return "0 auto";
	if (alignment === "right") return "0 0 0 auto";
	return "0 auto 0 0";
}
function escapeHtml$1(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function escapeAttribute(value) {
	return escapeHtml$1(value).replaceAll("\"", "&quot;");
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isFallbackBehavior(value) {
	if (!isRecord(value) || typeof value.mode !== "string") return false;
	if (value.mode === "use_value") return "value" in value;
	return value.mode === "none" || value.mode === "omit";
}
//#endregion
//#region src/print-shell.ts
const standardPageSizes = {
	letter: {
		width: "8.5in",
		height: "11in"
	},
	a4: {
		width: "210mm",
		height: "297mm"
	},
	legal: {
		width: "8.5in",
		height: "14in"
	}
};
const printShellCssRequirementId = "phase-10-print-shell";
function composePrintDocumentHtml(input) {
	const pageSettingsResult = DocumentPageSettingsSchema.safeParse(input.pageSettings ?? {});
	const themeResult = DocumentThemeSchema.safeParse(input.theme ?? {});
	const theme = themeResult.success ? themeResult.data : DocumentThemeSchema.parse({});
	const metadata = resolvePrintMetadata(input.title, input.metadata);
	if (!pageSettingsResult.success) return {
		html: "",
		css: "",
		cssRequirements: [],
		page: void 0,
		warnings: [...input.document.warnings, {
			code: "invalid_page_settings",
			source: "print-shell",
			severity: "error",
			message: "Phase 10 print shell received invalid page settings.",
			path: ["pageSettings"],
			details: { issues: pageSettingsResult.error.issues.map((issue) => ({
				message: issue.message,
				path: issue.path
			})) }
		}],
		assets: input.document.assets,
		variables: input.document.variables
	};
	const page = resolvePageBox(pageSettingsResult.data);
	const themeWarnings = createThemeWarnings(theme, themeResult);
	const headerFooterWarnings = createHeaderFooterMarginWarnings(pageSettingsResult.data.headerFooter, pageSettingsResult.data.margins);
	const headerFooterHtml = renderHeaderFooterRegions(pageSettingsResult.data.headerFooter, {
		theme,
		title: input.title
	});
	const shellCss = composePrintShellCss(page, pageSettingsResult.data.headerFooter, theme);
	const css = composeFullCss(input.document.cssRequirements, shellCss);
	const cssRequirements = [...input.document.cssRequirements, {
		id: printShellCssRequirementId,
		media: "print",
		css: shellCss
	}];
	const escapedTitle = escapeHtml(metadata.title ?? input.title);
	const html = ["<!doctype html>", `<html lang="${escapeHtml(metadata.language)}">`];
	html.push("<head>", "<meta charset=\"utf-8\">", `<title>${escapedTitle}</title>`, ...renderMetadataElements(metadata), `<style>${css}</style>`, "</head>", renderElement("body", createBodyAttributes(theme), `${headerFooterHtml}<main class="asym-print-document">${input.document.html}</main>`), "</html>");
	return {
		html: html.join(""),
		css,
		cssRequirements,
		warnings: [
			...input.document.warnings,
			...headerFooterWarnings,
			...themeWarnings
		],
		assets: input.document.assets,
		variables: input.document.variables,
		page
	};
}
function resolvePrintMetadata(title, metadata) {
	const parsedMetadata = PdfDocumentMetadataSchema.parse(metadata ?? {});
	return {
		...parsedMetadata,
		title: parsedMetadata.title ?? title
	};
}
function renderMetadataElements(metadata) {
	const elements = [];
	if (metadata.author) elements.push(createMetaElement("author", metadata.author));
	if (metadata.subject) elements.push(createMetaElement("subject", metadata.subject));
	if (metadata.keywords.length > 0) elements.push(createMetaElement("keywords", metadata.keywords.join(", ")));
	if (metadata.organization) elements.push(createMetaElement("organization", metadata.organization));
	elements.push(createMetaElement("generator", "Asymmetric.al PDF Document Builder"));
	return elements;
}
function createMetaElement(name, content) {
	return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
}
function resolvePageBox(settings) {
	const size = settings.pageSize === "custom" ? resolveCustomPageSize(settings) : standardPageSizes[settings.pageSize];
	const dimensions = settings.orientation === "landscape" ? {
		width: size.height,
		height: size.width
	} : size;
	return {
		pageSize: settings.pageSize,
		orientation: settings.orientation,
		width: dimensions.width,
		height: dimensions.height,
		margins: settings.margins
	};
}
function resolveCustomPageSize(settings) {
	const customSize = settings.customSize;
	if (!customSize) throw new Error("Invariant violation: customSize is required when pageSize is \"custom\".");
	return {
		width: `${customSize.width}${customSize.unit}`,
		height: `${customSize.height}${customSize.unit}`
	};
}
function composeFullCss(serializerCssRequirements, shellCss) {
	const serializerCss = serializerCssRequirements.map((requirement) => requirement.css.trim()).filter((css) => css.length > 0).join("\n");
	return serializerCss ? `${serializerCss}\n${shellCss}` : shellCss;
}
function composePrintShellCss(page, headerFooter, theme) {
	const headerFooterCss = createHeaderFooterCss(page, headerFooter);
	return [
		headerFooterCss.pageRule,
		...headerFooterCss.firstPageRule ? [headerFooterCss.firstPageRule] : [],
		createRootCssVariables(page, theme),
		"html,body{margin:0;padding:0;}",
		"body{background:var(--asym-brand-background);color:var(--asym-brand-text);font-family:var(--asym-font-body);}",
		".asym-print-document{box-sizing:border-box;}",
		".asym-print-document h1,.asym-print-document h2,.asym-print-document h3,.asym-print-document h4,.asym-print-document h5,.asym-print-document h6{color:var(--asym-brand-primary);font-family:var(--asym-font-heading);}",
		".asym-print-document a{color:var(--asym-brand-accent);}",
		".asym-page-region{box-sizing:border-box;font-size:9pt;line-height:1.3;}",
		".asym-page-region-content{text-align:center;}",
		".asym-page-region-token{display:inline;}",
		...headerFooterCss.regionCss,
		".asym-page-break{break-after:page;page-break-after:always;}",
		".asym-page-break-before{break-before:page;page-break-before:always;}",
		".asym-keep-together{break-inside:avoid;page-break-inside:avoid;}",
		".asym-avoid-break-after{break-after:avoid;page-break-after:avoid;}",
		"table.asym-repeat-header thead{display:table-header-group;}",
		"table.asym-repeat-header tfoot{display:table-footer-group;}",
		".asym-page-number::after{content:counter(page);}",
		".asym-total-pages::after{content:counter(pages);}",
		"@media print{.asym-screen-only{display:none !important;}.asym-print-document{width:100%;}}"
	].join("\n");
}
function createRootCssVariables(page, theme) {
	const bodyFontStack = createFontStack([theme.fonts.body, ...theme.fonts.fallback]);
	const headingFontStack = createFontStack([theme.fonts.heading, ...theme.fonts.fallback]);
	return [
		":root{",
		`--asym-page-width:${page.width};`,
		`--asym-page-height:${page.height};`,
		`--asym-page-margin-top:${page.margins.top};`,
		`--asym-page-margin-right:${page.margins.right};`,
		`--asym-page-margin-bottom:${page.margins.bottom};`,
		`--asym-page-margin-left:${page.margins.left};`,
		`--asym-brand-primary:${theme.colors.primary};`,
		`--asym-brand-accent:${theme.colors.accent};`,
		`--asym-brand-text:${theme.colors.text};`,
		`--asym-brand-background:${theme.colors.background};`,
		`--asym-font-body:${bodyFontStack};`,
		`--asym-font-heading:${headingFontStack};`,
		"}"
	].join("");
}
function createBodyAttributes(theme) {
	const attributes = {
		"data-asym-theme-name": theme.name,
		"data-asym-brand-source": theme.branding.source
	};
	if (theme.branding.tenantBrandId) attributes["data-asym-tenant-brand-id"] = theme.branding.tenantBrandId;
	if (theme.organization.name) attributes["data-asym-organization-name"] = theme.organization.name;
	return attributes;
}
function createThemeWarnings(theme, themeResult) {
	const warnings = [];
	if (!themeResult.success) warnings.push({
		code: "invalid_theme",
		details: { issues: themeResult.error.issues.map((issue) => ({
			message: issue.message,
			path: issue.path
		})) },
		message: "Phase 28 print shell received invalid theme settings.",
		path: ["theme"],
		severity: "error",
		source: "print-shell"
	});
	if (theme.fonts.fallback.length === 0 && (!isGenericFontFamily(theme.fonts.body) || !isGenericFontFamily(theme.fonts.heading))) warnings.push({
		code: "missing_theme_font_fallback",
		details: {
			bodyFont: theme.fonts.body,
			headingFont: theme.fonts.heading
		},
		message: "Phase 28 theme uses custom fonts without an approved fallback font stack.",
		path: [
			"theme",
			"fonts",
			"fallback"
		],
		severity: "warning",
		source: "print-shell"
	});
	return warnings;
}
const genericFontFamilies = new Set([
	"cursive",
	"emoji",
	"fangsong",
	"fantasy",
	"math",
	"monospace",
	"sans-serif",
	"serif",
	"system-ui",
	"ui-monospace",
	"ui-rounded",
	"ui-sans-serif",
	"ui-serif"
]);
function createFontStack(families) {
	const uniqueFamilies = [];
	for (const family of families) {
		const normalized = family.trim();
		if (!normalized || uniqueFamilies.includes(normalized)) continue;
		uniqueFamilies.push(normalized);
	}
	return uniqueFamilies.map(formatFontFamily).join(",");
}
function formatFontFamily(family) {
	return isGenericFontFamily(family) ? family : `"${escapeCssString(family)}"`;
}
function isGenericFontFamily(family) {
	return genericFontFamilies.has(family.trim().toLowerCase());
}
function escapeCssString(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
function renderHeaderFooterRegions(headerFooter, context) {
	return headerFooter.regions.filter((region) => region.enabled).map((region) => renderHeaderFooterRegion(region, context)).join("");
}
function renderHeaderFooterRegion(region, context) {
	const contentHtml = region.content.map((token) => renderHeaderFooterToken(token, context)).join("");
	return renderElement("div", {
		class: [
			"asym-page-region",
			`asym-page-region-${region.placement}`,
			`asym-page-region-${toCssName(region.placement, region.scope)}`
		].join(" "),
		"data-asym-page-region": `${region.placement}:${region.scope}`,
		"data-page-region-placement": region.placement,
		"data-page-region-scope": region.scope
	}, renderElement("div", {
		class: "asym-page-region-content",
		"data-page-region-alignment": region.alignment,
		...region.alignment === "center" ? {} : { style: `text-align:${region.alignment};` }
	}, contentHtml));
}
function renderHeaderFooterToken(token, context) {
	if (token.kind === "text") return renderElement("span", {
		class: "asym-page-region-token",
		"data-asym-page-token": token.kind
	}, escapeHtml(token.text));
	if (token.kind === "document_title") return renderElement("span", {
		class: "asym-page-region-token",
		"data-asym-page-token": token.kind
	}, escapeHtml(context.title));
	if (token.kind === "organization_footer") return renderElement("span", {
		class: "asym-page-region-token",
		"data-asym-page-token": token.kind
	}, escapeHtml(context.theme?.footerText ?? token.fallbackText ?? ""));
	if (token.kind === "page_number") return renderElement("span", {
		class: "asym-page-region-token asym-page-number",
		"data-asym-page-token": token.kind
	}, "");
	return renderElement("span", {
		class: "asym-page-region-token asym-total-pages",
		"data-asym-page-token": token.kind
	}, "");
}
function createHeaderFooterCss(page, headerFooter) {
	const repeatingRules = createRepeatingPageRegionRules(headerFooter.regions);
	const firstPageRules = createFirstPageRegionRules(headerFooter.regions);
	const regionCss = createHeaderFooterRegionCss(headerFooter.regions);
	const pageRule = [
		"@page{size:",
		page.width,
		" ",
		page.height,
		";margin:",
		page.margins.top,
		" ",
		page.margins.right,
		" ",
		page.margins.bottom,
		" ",
		page.margins.left,
		";",
		repeatingRules,
		"}"
	].join("");
	return {
		firstPageRule: firstPageRules.length > 0 ? `@page:first{${firstPageRules}}` : void 0,
		pageRule,
		regionCss
	};
}
function createRepeatingPageRegionRules(regions) {
	return regions.filter((region) => region.enabled && region.scope === "repeating").map((region) => createPageRegionRule(region)).join("");
}
function createFirstPageRegionRules(regions) {
	return regions.filter((region) => region.scope === "first_page").map((region) => region.enabled ? createPageRegionRule(region) : createDisabledPageRegionRule(region.placement)).join("");
}
function createPageRegionRule(region) {
	return `@${getPageMarginBox(region.placement)}{content:element(${getRunningElementName(region.placement, region.scope)});}`;
}
function createDisabledPageRegionRule(placement) {
	return `@${getPageMarginBox(placement)}{content:normal;}`;
}
function createHeaderFooterRegionCss(regions) {
	return regions.filter((region) => region.enabled).map((region) => `.asym-page-region-${toCssName(region.placement, region.scope)}{position:running(${getRunningElementName(region.placement, region.scope)});}`);
}
function createHeaderFooterMarginWarnings(headerFooter, margins) {
	const warnings = [];
	for (const [index, region] of headerFooter.regions.entries()) {
		if (!region.enabled) continue;
		const actualMargin = region.placement === "header" ? margins.top : margins.bottom;
		const actualInches = convertLengthToInches(actualMargin);
		const minimumInches = convertLengthToInches(region.minimumMargin);
		if (actualInches === void 0 || minimumInches === void 0) continue;
		if (actualInches >= minimumInches) continue;
		warnings.push({
			code: "header_footer_margin_too_small",
			details: {
				actualMargin,
				minimumMargin: region.minimumMargin,
				placement: region.placement,
				scope: region.scope
			},
			message: "Phase 26 header/footer output may overlap document content because the configured page margin is smaller than the region minimum.",
			path: [
				"pageSettings",
				"headerFooter",
				"regions",
				String(index)
			],
			severity: "warning",
			source: "print-shell"
		});
	}
	return warnings;
}
function convertLengthToInches(value) {
	const match = /^(\d+(?:\.\d+)?)(in|cm|mm|pt|px)$/.exec(value);
	if (!match) return;
	const amount = Number(match[1]);
	const unit = match[2];
	if (!Number.isFinite(amount)) return;
	if (unit === "in") return amount;
	if (unit === "cm") return amount / 2.54;
	if (unit === "mm") return amount / 25.4;
	if (unit === "pt") return amount / 72;
	return amount / 96;
}
function getPageMarginBox(placement) {
	return placement === "header" ? "top-center" : "bottom-center";
}
function getRunningElementName(placement, scope) {
	if (placement === "header" && scope === "first_page") return "asymHeaderFirstPage";
	if (placement === "header") return "asymHeaderRepeating";
	if (scope === "first_page") return "asymFooterFirstPage";
	return "asymFooterRepeating";
}
function toCssName(placement, scope) {
	if (scope === "first_page") return `${placement}-first-page`;
	return `${placement}-repeating`;
}
function renderElement(tagName, attributes, childrenHtml) {
	return `<${tagName}${Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join("")}>${childrenHtml}</${tagName}>`;
}
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
//#endregion
//#region src/preview.ts
const printShellWarningCodes = new Set(["invalid_page_settings"]);
async function createBrowserPdfPreview(request) {
	const prepared = await preparePdfPreviewDocument(request, "browser");
	if (!prepared.ok) return prepared.result;
	return createPdfPreviewResult({
		artifacts: [],
		diagnostics: prepared.diagnostics,
		durationMs: measureDuration(prepared.startedAt, prepared.now),
		metadata: createBrowserPreviewMetadata(),
		mode: "browser",
		previewId: prepared.previewId,
		snapshots: prepared.snapshots
	});
}
async function preparePdfPreviewDocument(request, mode) {
	const now = request.now ?? defaultNow;
	const startedAt = now();
	const templateParseResult = DocumentTemplateV1Schema.safeParse(request.template);
	const previewId = request.previewId ?? createDefaultPreviewId(mode, templateParseResult.success ? templateParseResult.data.id : void 0);
	if (!templateParseResult.success) return {
		ok: false,
		result: createPdfPreviewResult({
			artifacts: [],
			diagnostics: templateParseResult.error.issues.map((issue) => ({
				code: "invalid_template",
				details: { issueCode: issue.code },
				message: issue.message,
				path: issue.path.map(String),
				severity: "error",
				source: "schema"
			})),
			durationMs: measureDuration(startedAt, now),
			metadata: createPreviewMetadata(mode),
			mode,
			previewId
		})
	};
	const template = templateParseResult.data;
	const serializedDocument = composePdfDocumentHtml({
		assetReferences: template.assets,
		assetRenderMode: mode === "docraptor-test" ? "production_render" : "browser_preview",
		dataContext: request.dataContext,
		document: template.content,
		placeholderBindings: template.placeholderBindings,
		repeaterBindings: template.repeaterBindings,
		summaryBlockBindings: template.summaryBlockBindings,
		tableBindings: template.tableBindings
	});
	const printDocument = composePrintDocumentHtml({
		document: serializedDocument,
		metadata: template.pdfSettings.metadata,
		pageSettings: template.pageSettings,
		theme: template.theme,
		title: request.title ?? template.name
	});
	const snapshots = {
		bodyHtml: serializedDocument.html,
		css: printDocument.css,
		cssRequirements: printDocument.cssRequirements,
		html: printDocument.html
	};
	const diagnostics = [...printDocument.warnings.map(convertRenderWarningToDiagnostic), ...await runPreflight(request, template, mode, previewId, snapshots)];
	if (hasErrorDiagnostics(diagnostics)) return {
		ok: false,
		result: createPdfPreviewResult({
			artifacts: [],
			diagnostics,
			durationMs: measureDuration(startedAt, now),
			metadata: createPreviewMetadata(mode),
			mode,
			previewId,
			snapshots
		})
	};
	return {
		diagnostics,
		now,
		ok: true,
		previewId,
		snapshots,
		startedAt,
		template
	};
}
function createPdfPreviewResult(input) {
	const errors = input.diagnostics.filter((diagnostic) => diagnostic.severity === "error");
	const warnings = input.diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
	return {
		artifacts: input.artifacts,
		diagnostics: input.diagnostics,
		durationMs: input.durationMs,
		errors,
		metadata: input.metadata,
		mode: input.mode,
		previewId: input.previewId,
		snapshots: input.snapshots,
		status: resolvePreviewStatus(warnings, errors),
		warnings
	};
}
function createBrowserPreviewMetadata() {
	return {
		docraptorTestMode: false,
		finalPdfFidelity: false,
		mayContainWatermark: false,
		message: "Browser preview is generated from print HTML/CSS for authoring feedback and is not final PDF fidelity.",
		productionRender: false,
		renderer: "browser"
	};
}
function createDocRaptorTestPreviewMetadata(request) {
	return {
		docraptorTestMode: true,
		finalPdfFidelity: true,
		mayContainWatermark: true,
		message: "DocRaptor test preview uses the production PDF renderer path in test mode and may include a watermark.",
		productionRender: false,
		renderer: "docraptor",
		...request ? { request } : {}
	};
}
function createPreviewMetadata(mode) {
	return mode === "browser" ? createBrowserPreviewMetadata() : createDocRaptorTestPreviewMetadata();
}
function convertRenderWarningToDiagnostic(warning) {
	const source = resolveRenderWarningSource(warning);
	return {
		code: warning.code,
		details: warning.details,
		message: warning.message,
		path: warning.path,
		severity: warning.severity,
		source
	};
}
function resolveRenderWarningSource(warning) {
	if (warning.source === "print-shell" || warning.source === "serializer") return warning.source;
	return printShellWarningCodes.has(warning.code) ? "print-shell" : "serializer";
}
async function runPreflight(request, template, mode, previewId, snapshots) {
	if (!request.preflight) return [];
	try {
		return (await request.preflight({
			mode,
			previewId,
			snapshots,
			template
		})).map((diagnostic) => normalizeDiagnosticInput(diagnostic, "preflight"));
	} catch (error) {
		return [{
			code: "preflight_failed",
			details: { errorName: error instanceof Error ? error.name : typeof error },
			message: error instanceof Error ? error.message : "Preview preflight failed before rendering.",
			path: [],
			severity: "error",
			source: "preflight"
		}];
	}
}
function normalizeDiagnosticInput(diagnostic, defaultSource) {
	return {
		code: diagnostic.code,
		details: diagnostic.details,
		message: diagnostic.message,
		path: diagnostic.path ?? [],
		severity: diagnostic.severity ?? "warning",
		source: diagnostic.source ?? defaultSource
	};
}
function hasErrorDiagnostics(diagnostics) {
	return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}
function resolvePreviewStatus(warnings, errors) {
	if (errors.length > 0) return "error";
	if (warnings.length > 0) return "warning";
	return "success";
}
function measureDuration(startedAt, now) {
	return Math.max(0, now() - startedAt);
}
function defaultNow() {
	return Date.now();
}
function createDefaultPreviewId(mode, templateId) {
	return `${mode}-${templateId ?? "invalid-template"}`;
}
//#endregion
export { preparePdfPreviewDocument as a, preflightPdfDocumentAssets as c, evaluatePdfDocumentCondition as d, normalizeDiagnosticInput as i, resolvePdfDocumentRepeaterItems as l, createDocRaptorTestPreviewMetadata as n, composePrintDocumentHtml as o, createPdfPreviewResult as r, composePdfDocumentHtml as s, createBrowserPdfPreview as t, resolvePdfDocumentTableRows as u };

//# sourceMappingURL=preview-BmcBZiCw.mjs.map