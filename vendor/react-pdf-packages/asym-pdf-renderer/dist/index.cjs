Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_preview = require("./preview-DfRauC4f.cjs");
let _asym_pdf_template_schema = require("@asym/pdf-template-schema");
//#region src/variables.ts
function resolvePdfDocumentVariables(input) {
	const resolver = (0, _asym_pdf_template_schema.createVariableResolver)(input);
	const values = input.variables.map((variable) => resolver.resolve({
		fallback: variable.fallback,
		formatter: variable.formatter,
		key: variable.key
	}, createScopedContextForVariable(input.context, variable)));
	return {
		diagnostics: values.flatMap((value) => value.diagnostics),
		values
	};
}
function createScopedContextForVariable(context, variable) {
	let scopedContext = context;
	for (const scope of variable.scopes ?? []) {
		const source = (0, _asym_pdf_template_schema.getValueAtDataPath)(scopedContext, scope.sourcePath);
		if (!source.found || !Array.isArray(source.value)) return scopedContext;
		const itemValue = source.value[scope.sourceIndex];
		if (itemValue === void 0) return scopedContext;
		scopedContext = (0, _asym_pdf_template_schema.createScopedRepeaterContext)({
			context: scopedContext,
			indexAlias: scope.indexAlias,
			itemAlias: scope.itemAlias,
			itemValue,
			renderedIndex: scope.renderedIndex
		});
	}
	return scopedContext;
}
//#endregion
//#region src/preflight.ts
const blockingModes = new Set([
	"batch",
	"production_render",
	"publish"
]);
const knownNodeTypes = new Set([
	"assetImage",
	"blockquote",
	"bulletList",
	"conditionalSection",
	"dataTable",
	"doc",
	"documentPlaceholder",
	"hardBreak",
	"heading",
	"horizontalRule",
	"image",
	"listItem",
	"orderedList",
	"pageBreak",
	"paragraph",
	"repeater",
	"summaryBlock",
	"table",
	"tableCell",
	"tableHeader",
	"tableRow",
	"text",
	"variable"
]);
function preflightPdfTemplate(input) {
	const mode = input.mode ?? "authoring";
	const diagnostics = (0, _asym_pdf_template_schema.findSecretLikeTemplateValues)(input.template).map((diagnostic) => ({
		code: diagnostic.code,
		details: {
			reason: diagnostic.reason,
			redactedPreview: diagnostic.redactedPreview
		},
		message: diagnostic.message,
		path: diagnostic.path,
		severity: diagnostic.severity,
		source: "security",
		suggestedFix: "Move credentials, tokens, API keys, and signed URLs into server-side adapter configuration."
	}));
	const templateResult = _asym_pdf_template_schema.DocumentTemplateV1Schema.safeParse(input.template);
	if (!templateResult.success) {
		diagnostics.push(...templateResult.error.issues.map((issue) => ({
			code: "invalid_template",
			details: { issueCode: issue.code },
			message: issue.message,
			path: issue.path.map(String),
			severity: "error",
			source: "schema",
			suggestedFix: "Update the structured template JSON so it matches DocumentTemplateV1Schema."
		})));
		return createResult({
			diagnostics,
			mode
		});
	}
	const template = templateResult.data;
	const dataContext = input.dataContext ?? {};
	const assetRenderMode = resolveAssetRenderMode(mode);
	const serializedDocument = require_preview.composePdfDocumentHtml({
		assetReferences: template.assets,
		assetRenderMode,
		dataContext,
		document: template.content,
		placeholderBindings: template.placeholderBindings,
		repeaterBindings: template.repeaterBindings,
		summaryBlockBindings: template.summaryBlockBindings,
		tableBindings: template.tableBindings
	});
	const printDocument = require_preview.composePrintDocumentHtml({
		document: serializedDocument,
		pageSettings: template.pageSettings,
		theme: template.theme,
		title: template.name
	});
	const assetPreflight = require_preview.preflightPdfDocumentAssets({
		assets: template.assets,
		mode: assetRenderMode
	});
	diagnostics.push(...collectBatchDiagnostics(template, mode), ...collectUnsupportedNodeDiagnostics(template.content), ...collectRequiredSectionDiagnostics(template, input.requiredSections ?? []), ...preflightPdfDocumentAccessibility({
		assets: template.assets,
		document: template.content,
		metadata: {
			...template.pdfSettings.metadata,
			title: template.pdfSettings.metadata.title ?? template.name
		}
	}).diagnostics, ...collectVariableDefinitionDiagnostics(template), ...collectDataBindingDiagnostics(template, dataContext), ...collectConditionalRuleDiagnostics(template, dataContext, mode), ...collectRepeaterBindingDiagnostics(template, dataContext, mode), ...collectTableBindingDiagnostics(template, dataContext, input, mode), ...collectSummaryBindingDiagnostics(template, dataContext, mode), ...printDocument.warnings.map((warning) => convertRenderWarningToDiagnostic(warning, mode)), ...assetPreflight.diagnostics.map(convertAssetDiagnostic), ...resolvePdfDocumentVariables({
		context: dataContext,
		currency: input.currency,
		formatters: input.formatters,
		locale: input.locale,
		timeZone: input.timeZone,
		variables: serializedDocument.variables
	}).diagnostics.map(convertVariableResolutionDiagnostic));
	return createResult({
		diagnostics: dedupeDiagnostics(diagnostics),
		mode,
		template
	});
}
function preflightPdfDocumentAccessibility(input) {
	const metadata = _asym_pdf_template_schema.PdfDocumentMetadataSchema.parse(input.metadata ?? {});
	const diagnostics = [];
	if (!metadata.title) diagnostics.push({
		code: "missing_pdf_title",
		message: "PDF metadata should include a title. This is an accessibility warning, not a PDF/UA guarantee.",
		path: [
			"pdfSettings",
			"metadata",
			"title"
		],
		severity: "warning",
		source: "accessibility",
		suggestedFix: "Set an explicit PDF metadata title before publish or production rendering."
	});
	diagnostics.push(...collectHeadingAccessibilityDiagnostics(input.document), ...collectImageAccessibilityDiagnostics(input.document, input.assets ?? []), ...collectTableAccessibilityDiagnostics(input.document), ...collectLinkAccessibilityDiagnostics(input.document));
	return {
		diagnostics,
		guaranteesPdfUaCompliance: false,
		ok: diagnostics.length === 0,
		warnings: diagnostics
	};
}
function collectBatchDiagnostics(template, mode) {
	if (mode !== "batch") return [];
	if (template.status === "published" && template.engine === "asym_pdf_document_builder") return [];
	return [{
		code: "batch_unsafe_template",
		details: {
			engine: template.engine,
			status: template.status
		},
		message: "Batch preflight requires a published Asym PDF template snapshot.",
		path: ["status"],
		severity: "error",
		source: "batch",
		suggestedFix: "Publish an immutable native PDF template version before creating batch jobs."
	}];
}
function collectUnsupportedNodeDiagnostics(content) {
	const diagnostics = [];
	visitContentNodes(content, [], (node, path) => {
		if (knownNodeTypes.has(node.type)) return;
		diagnostics.push({
			code: "unsupported_node",
			details: { nodeType: node.type },
			message: `Template contains unsupported node "${node.type}".`,
			nodeType: node.type,
			path,
			severity: "warning",
			source: "unsupported",
			suggestedFix: "Replace this block with a PDF Document Builder supported node before publishing."
		});
	});
	return diagnostics;
}
function collectRequiredSectionDiagnostics(template, sections) {
	if (sections.length === 0) return [];
	const nodeTypes = /* @__PURE__ */ new Set();
	visitContentNodes(template.content, [], (node) => {
		nodeTypes.add(node.type);
	});
	return sections.filter((section) => !nodeTypes.has(section.nodeType)).map((section, index) => ({
		code: "missing_required_section",
		details: {
			nodeType: section.nodeType,
			sectionId: section.id
		},
		message: `Template is missing required section "${section.label ?? section.id}".`,
		path: ["requiredSections", String(index)],
		severity: "error",
		source: "bindings",
		suggestedFix: section.suggestedFix ?? `Add a "${section.nodeType}" section before publish or production rendering.`
	}));
}
function collectHeadingAccessibilityDiagnostics(content) {
	const diagnostics = [];
	let previousLevel = 0;
	visitContentNodes(content, [], (node, path) => {
		if (node.type !== "heading") return;
		const level = readHeadingLevel(node);
		if (level === void 0) return;
		if (level > previousLevel + 1) diagnostics.push({
			code: "skipped_heading_level",
			details: {
				headingLevel: level,
				previousHeadingLevel: previousLevel
			},
			message: "Heading levels should not skip levels. This warning does not guarantee PDF/UA compliance.",
			nodeType: node.type,
			path,
			severity: "warning",
			source: "accessibility",
			suggestedFix: "Adjust heading levels so the document outline moves one level at a time."
		});
		previousLevel = level;
	});
	return diagnostics;
}
function collectImageAccessibilityDiagnostics(content, assets) {
	const diagnostics = [];
	visitContentNodes(content, [], (node, path) => {
		if (node.type !== "assetImage" && node.type !== "image") return;
		const role = readImageRole(node, assets);
		if (!requiresAltTextForRole(role)) return;
		if (hasNonEmptyString(readImageAltText(node, assets))) return;
		diagnostics.push({
			code: "missing_asset_alt_text",
			details: { role },
			message: "Meaningful images should include alt text. This warning does not guarantee PDF/UA compliance.",
			nodeType: node.type,
			path,
			severity: "warning",
			source: "accessibility",
			suggestedFix: "Add concise alt text or mark the asset decorative in a later accessibility policy."
		});
	});
	return diagnostics;
}
function collectTableAccessibilityDiagnostics(content) {
	const diagnostics = [];
	visitContentNodes(content, [], (node, path) => {
		if (node.type !== "table") return;
		if (hasDescendantNodeType(node, "tableHeader")) return;
		diagnostics.push({
			code: "missing_table_header",
			message: "Tables should include header cells for screen readers. This warning does not guarantee PDF/UA compliance.",
			nodeType: node.type,
			path,
			severity: "warning",
			source: "accessibility",
			suggestedFix: "Use table header cells for at least the first row of structured tables."
		});
	});
	return diagnostics;
}
function collectLinkAccessibilityDiagnostics(content) {
	const diagnostics = [];
	visitContentNodes(content, [], (node, path) => {
		if (node.type !== "text" || !hasLinkMark(node)) return;
		const linkText = (node.text ?? "").trim();
		if (isDescriptiveLinkText(linkText)) return;
		diagnostics.push({
			code: "non_descriptive_link_text",
			details: { linkText },
			message: "Link text should describe its destination. This warning does not guarantee PDF/UA compliance.",
			nodeType: node.type,
			path,
			severity: "warning",
			source: "accessibility",
			suggestedFix: "Replace generic link text with destination-specific wording."
		});
	});
	return diagnostics;
}
function collectVariableDefinitionDiagnostics(template) {
	const diagnostics = [];
	for (const [index, variable] of template.variables.entries()) {
		if (!_asym_pdf_template_schema.coreVariableRegistry.get(variable.key)) diagnostics.push({
			code: "unknown_variable",
			details: { variableKey: variable.key },
			message: `Template variable "${variable.key}" is not in the shared variable registry.`,
			path: [
				"variables",
				String(index),
				"key"
			],
			severity: "error",
			source: "bindings",
			suggestedFix: "Use a registered variable key or add a schema-owned variable registry entry."
		});
		diagnostics.push(...collectUnknownFormatterDiagnostics({
			formatter: variable.formatter,
			path: [
				"variables",
				String(index),
				"formatter"
			],
			variable
		}));
	}
	for (const [bindingIndex, binding] of template.tableBindings.entries()) for (const [columnIndex, column] of binding.columns.entries()) diagnostics.push(...collectUnknownFormatterDiagnostics({
		formatter: column.formatter,
		path: [
			"tableBindings",
			String(bindingIndex),
			"columns",
			String(columnIndex),
			"formatter"
		],
		variable: {
			key: `${binding.id}.${column.key}`,
			label: column.label,
			sampleValue: "",
			sourcePath: column.sourcePath
		}
	}));
	for (const [index, binding] of template.summaryBlockBindings.entries()) diagnostics.push(...collectUnknownFormatterDiagnostics({
		formatter: binding.formatter,
		path: [
			"summaryBlockBindings",
			String(index),
			"formatter"
		],
		variable: {
			key: `summary.${binding.id}`,
			label: binding.title ?? binding.id,
			sampleValue: 0
		}
	}));
	return diagnostics;
}
function collectUnknownFormatterDiagnostics(input) {
	if (!input.formatter || _asym_pdf_template_schema.defaultVariableFormatters[input.formatter]) return [];
	return [{
		code: "unknown_formatter",
		details: {
			formatter: input.formatter,
			sourcePath: input.variable.sourcePath,
			variableKey: input.variable.key
		},
		message: `Unknown variable formatter "${input.formatter}".`,
		path: input.path,
		severity: "error",
		source: "bindings",
		suggestedFix: "Use one of the package-supported deterministic formatters."
	}];
}
function collectDataBindingDiagnostics(template, dataContext) {
	const diagnostics = [];
	const templateVariableKeys = new Set(template.variables.map((variable) => variable.key));
	for (const [index, binding] of template.dataBindings.entries()) {
		if (!templateVariableKeys.has(binding.variableKey) && !_asym_pdf_template_schema.coreVariableRegistry.get(binding.variableKey)) diagnostics.push({
			code: "unknown_variable",
			details: {
				bindingId: binding.id,
				variableKey: binding.variableKey
			},
			message: `Data binding "${binding.id}" references unknown variable "${binding.variableKey}".`,
			path: [
				"dataBindings",
				String(index),
				"variableKey"
			],
			severity: "error",
			source: "bindings",
			suggestedFix: "Point this binding at a registered template variable key."
		});
		if (!binding.required) continue;
		const lookup = (0, _asym_pdf_template_schema.getValueAtDataPath)(dataContext, binding.sourcePath);
		if (lookup.found && !isMissingValue(lookup.value)) continue;
		diagnostics.push({
			code: "missing_required_variable",
			details: {
				bindingId: binding.id,
				sourcePath: binding.sourcePath,
				variableKey: binding.variableKey
			},
			message: `Required binding "${binding.variableKey}" is missing data at "${binding.sourcePath}".`,
			path: ["dataContext", ...binding.sourcePath.split(".")],
			severity: "error",
			source: "bindings",
			suggestedFix: "Provide this data path or remove the required binding before publishing."
		});
	}
	return diagnostics;
}
function collectConditionalRuleDiagnostics(template, dataContext, mode) {
	return template.conditionalRules.flatMap((rule, index) => {
		return (0, _asym_pdf_template_schema.evaluateConditionalRule)({
			context: dataContext,
			rule
		}).diagnostics.map((diagnostic) => convertConditionalDiagnostic(rule, index, diagnostic, mode));
	});
}
function collectRepeaterBindingDiagnostics(template, dataContext, mode) {
	return template.repeaterBindings.flatMap((binding, index) => {
		return (0, _asym_pdf_template_schema.resolveRepeaterItems)({
			binding,
			context: dataContext
		}).diagnostics.map((diagnostic) => convertRepeaterDiagnostic(index, diagnostic, mode));
	});
}
function collectTableBindingDiagnostics(template, dataContext, formatterOptions, mode) {
	return template.tableBindings.flatMap((binding, index) => {
		return (0, _asym_pdf_template_schema.resolveTableRows)({
			binding,
			context: dataContext,
			currency: formatterOptions.currency,
			locale: formatterOptions.locale,
			timeZone: formatterOptions.timeZone
		}).diagnostics.map((diagnostic) => convertTableDiagnostic(index, diagnostic, mode));
	});
}
function collectSummaryBindingDiagnostics(template, dataContext, mode) {
	return template.summaryBlockBindings.flatMap((binding, index) => validateSummaryBinding({
		binding,
		dataContext,
		index,
		mode,
		tableBindings: template.tableBindings
	}));
}
function validateSummaryBinding(input) {
	const calculation = input.binding.calculation;
	const path = [
		"summaryBlockBindings",
		String(input.index),
		"calculation"
	];
	return (calculation.type === "total_contributions" ? (0, _asym_pdf_template_schema.calculateNumericAggregate)({
		context: input.dataContext,
		operation: "sum",
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath,
		valuePath: calculation.amountPath
	}).diagnostics : calculation.type === "invoice_totals" ? (0, _asym_pdf_template_schema.calculateInvoiceTotals)({
		amountPath: calculation.amountPath,
		context: input.dataContext,
		discountPath: calculation.discountPath,
		lineItemsPath: calculation.lineItemsPath,
		precision: input.binding.precision,
		quantityPath: calculation.quantityPath,
		ratePath: calculation.ratePath,
		taxPath: calculation.taxPath
	}).diagnostics : calculation.type === "financial_report_totals" ? (0, _asym_pdf_template_schema.calculateFinancialTotals)({
		amountPath: calculation.amountPath,
		categoryPath: calculation.categoryPath,
		context: input.dataContext,
		expenseCategories: calculation.expenseCategories,
		incomeCategories: calculation.incomeCategories,
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath
	}).diagnostics : calculation.type === "grouped_subtotals" || calculation.type === "grand_total" ? (0, _asym_pdf_template_schema.calculateGroupedTableTotals)({
		context: input.dataContext,
		groupPath: calculation.groupPath,
		precision: input.binding.precision,
		sourcePath: calculation.sourcePath,
		valuePath: calculation.valuePath
	}).diagnostics : validateTableTotalSummary({
		binding: input.binding,
		dataContext: input.dataContext,
		path,
		tableBindings: input.tableBindings
	})).map((diagnostic) => convertCalculationDiagnostic({
		bindingId: input.binding.id,
		diagnostic,
		mode: input.mode,
		path
	}));
}
function validateTableTotalSummary(input) {
	const calculation = input.binding.calculation;
	if (calculation.type !== "table_total") return [];
	const tableBinding = input.tableBindings.find((binding) => binding.id === calculation.tableBindingId);
	if (!tableBinding) return [{
		code: "invalid_table_calculation_binding",
		details: { tableBindingId: calculation.tableBindingId },
		message: `Summary block references unknown table binding "${calculation.tableBindingId}".`,
		severity: "error"
	}];
	return (0, _asym_pdf_template_schema.calculateTableTotals)({
		context: input.dataContext,
		precision: input.binding.precision,
		tableBinding: {
			...tableBinding,
			totals: [{
				columnKey: calculation.columnKey,
				label: calculation.label,
				operation: calculation.operation ?? "sum"
			}]
		}
	}).diagnostics;
}
function convertConditionalDiagnostic(rule, index, diagnostic, mode) {
	return {
		code: diagnostic.code === "missing_condition_field" ? "missing_condition_source" : "invalid_condition_value",
		details: {
			fieldPath: diagnostic.fieldPath,
			operator: diagnostic.operator,
			ruleId: rule.id,
			...diagnostic.details
		},
		message: diagnostic.message,
		path: ["conditionalRules", String(index)],
		severity: normalizeBindingSeverity(diagnostic.severity, mode),
		source: "bindings",
		suggestedFix: "Update the condition source path or provide sample data that exercises this rule."
	};
}
function convertRepeaterDiagnostic(index, diagnostic, mode) {
	return {
		code: diagnostic.code,
		details: {
			bindingId: diagnostic.bindingId,
			itemAlias: diagnostic.itemAlias,
			sourceIndex: diagnostic.sourceIndex,
			sourcePath: diagnostic.sourcePath,
			...diagnostic.details
		},
		message: diagnostic.message,
		path: ["repeaterBindings", String(index)],
		severity: normalizeBindingSeverity(diagnostic.severity, mode),
		source: "bindings",
		suggestedFix: "Update the repeater source path, filters, or sample data so the source resolves to an array."
	};
}
function convertTableDiagnostic(index, diagnostic, mode) {
	return {
		code: diagnostic.code === "unsupported_table_column_value" ? "invalid_table_column" : diagnostic.code,
		details: {
			bindingId: diagnostic.bindingId,
			columnKey: diagnostic.columnKey,
			sourceIndex: diagnostic.sourceIndex,
			sourcePath: diagnostic.sourcePath,
			...diagnostic.details
		},
		message: diagnostic.message,
		path: ["tableBindings", String(index)],
		severity: normalizeBindingSeverity(diagnostic.severity, mode),
		source: "bindings",
		suggestedFix: diagnostic.code === "unsupported_table_column_value" ? "Point the table column at a field available on every resolved row or provide an approved fallback." : "Update the table source path or sample data so the table source resolves to an array."
	};
}
function convertCalculationDiagnostic(input) {
	return {
		code: "invalid_summary_calculation",
		details: {
			bindingId: input.bindingId,
			diagnosticCode: input.diagnostic.code,
			fieldPath: input.diagnostic.fieldPath,
			sourceIndex: input.diagnostic.sourceIndex,
			sourcePath: input.diagnostic.sourcePath,
			...input.diagnostic.details
		},
		message: input.diagnostic.message,
		path: input.path,
		severity: normalizeBindingSeverity(input.diagnostic.severity, input.mode),
		source: "bindings",
		suggestedFix: "Update the structured calculation reference so it points at resolved table or data fields."
	};
}
function convertRenderWarningToDiagnostic(warning, mode) {
	const code = mapRenderWarningCode(warning);
	const source = warning.source ?? resolveRenderWarningSource(warning);
	return {
		code,
		details: warning.details,
		message: warning.message,
		nodeId: readNodeId(warning.details),
		nodeType: warning.nodeType,
		path: warning.path,
		severity: normalizeRenderSeverity(warning, mode),
		source,
		suggestedFix: suggestFixForCode(code)
	};
}
function convertAssetDiagnostic(diagnostic) {
	return {
		code: diagnostic.code,
		details: {
			assetId: diagnostic.assetId,
			referenceId: diagnostic.referenceId,
			role: diagnostic.role,
			...diagnostic.details
		},
		message: diagnostic.message,
		path: diagnostic.path,
		severity: diagnostic.severity,
		source: "assets",
		suggestedFix: suggestFixForCode(diagnostic.code)
	};
}
function convertVariableResolutionDiagnostic(diagnostic) {
	return {
		code: mapVariableDiagnosticCode(diagnostic),
		details: {
			formatter: diagnostic.formatter,
			sourcePath: diagnostic.sourcePath,
			variableKey: diagnostic.variableKey,
			...diagnostic.details
		},
		message: diagnostic.message,
		path: diagnostic.sourcePath ? ["dataContext", ...diagnostic.sourcePath.split(".")] : ["variables", diagnostic.variableKey],
		severity: diagnostic.severity,
		source: "bindings",
		suggestedFix: suggestFixForCode(mapVariableDiagnosticCode(diagnostic))
	};
}
function mapVariableDiagnosticCode(diagnostic) {
	if (diagnostic.code === "missing_required_value") return "missing_required_variable";
	if (diagnostic.code === "missing_optional_value") return "missing_optional_variable";
	return diagnostic.code;
}
function mapRenderWarningCode(warning) {
	if (warning.code === "unsupported_table_column_value") return "invalid_table_column";
	if (warning.code === "invalid_calculation_reference") return warning.details && "formatter" in warning.details ? "unknown_formatter" : "invalid_summary_calculation";
	if (warning.code === "missing_table_source") return "missing_table_source";
	if (warning.code === "non_array_table_source") return "non_array_table_source";
	if (warning.code === "condition_evaluation_warning") return "missing_condition_source";
	if (warning.code === "condition_evaluation_error") return "invalid_condition_value";
	return warning.code;
}
function resolveRenderWarningSource(warning) {
	if (warning.source === "print-shell") return "print-shell";
	return "serializer";
}
function normalizeRenderSeverity(warning, mode) {
	if (warning.severity === "error") return "error";
	if (!blockingModes.has(mode)) return warning.severity;
	return new Set([
		"condition_evaluation_error",
		"condition_evaluation_warning",
		"invalid_calculation_reference",
		"invalid_document",
		"invalid_placeholder",
		"invalid_repeater_binding",
		"invalid_summary_block_binding",
		"invalid_table_binding",
		"missing_condition_context",
		"missing_repeater_context",
		"missing_summary_block_context",
		"missing_table_context",
		"missing_table_source",
		"non_array_table_source",
		"unsupported_table_column_value",
		"unsupported_node"
	]).has(warning.code) ? "error" : warning.severity;
}
function normalizeBindingSeverity(severity, mode) {
	if (severity === "error" || blockingModes.has(mode)) return "error";
	return severity;
}
function resolveAssetRenderMode(mode) {
	return mode === "production_render" || mode === "batch" ? "production_render" : "browser_preview";
}
function createResult(input) {
	const diagnostics = input.diagnostics;
	const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
	const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
	const info = diagnostics.filter((diagnostic) => diagnostic.severity === "info");
	const status = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "success";
	return {
		diagnostics,
		errors,
		info,
		mode: input.mode,
		ok: errors.length === 0,
		status,
		summary: {
			diagnosticCount: diagnostics.length,
			errorCount: errors.length,
			infoCount: info.length,
			mode: input.mode,
			templateId: input.template?.id,
			templateName: input.template?.name,
			warningCount: warnings.length
		},
		warnings
	};
}
function dedupeDiagnostics(diagnostics) {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const diagnostic of diagnostics) {
		const key = JSON.stringify({
			code: diagnostic.code,
			details: diagnostic.details,
			message: diagnostic.message,
			path: diagnostic.path,
			source: diagnostic.source
		});
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(diagnostic);
	}
	return deduped;
}
function visitContentNodes(node, path, visitor) {
	visitor(node, path);
	for (const [index, child] of (node.content ?? []).entries()) visitContentNodes(child, [
		...path,
		"content",
		String(index)
	], visitor);
}
function readHeadingLevel(node) {
	const level = node.attrs?.level;
	return typeof level === "number" && Number.isInteger(level) ? level : void 0;
}
function readImageRole(node, assets) {
	const nestedAsset = readRecord(node.attrs?.asset);
	const referencedAsset = resolveImageAssetReference(node, assets);
	return readString(node.attrs?.role) ?? readString(nestedAsset?.role) ?? referencedAsset?.role ?? "image";
}
function readImageAltText(node, assets) {
	const nestedAsset = readRecord(node.attrs?.asset);
	const referencedAsset = resolveImageAssetReference(node, assets);
	return readString(node.attrs?.altText) ?? readString(node.attrs?.alt) ?? readString(nestedAsset?.altText) ?? referencedAsset?.altText;
}
function resolveImageAssetReference(node, assets) {
	const nestedAsset = readRecord(node.attrs?.asset);
	const referenceId = readString(node.attrs?.assetId) ?? readString(node.attrs?.id) ?? readString(nestedAsset?.assetId) ?? readString(nestedAsset?.id);
	if (!referenceId) return;
	return assets.find((asset) => asset.id === referenceId || asset.assetId === referenceId);
}
function requiresAltTextForRole(role) {
	return role === "image" || role === "logo" || role === "signature";
}
function hasDescendantNodeType(node, nodeType) {
	let found = false;
	visitContentNodes(node, [], (candidate) => {
		if (candidate.type === nodeType) found = true;
	});
	return found;
}
function hasLinkMark(node) {
	return (node.marks ?? []).some((mark) => mark.type === "link");
}
function isDescriptiveLinkText(value) {
	const normalizedValue = value.trim().toLowerCase();
	if (!normalizedValue) return false;
	return !new Set([
		"click here",
		"here",
		"learn more",
		"more",
		"read more"
	]).has(normalizedValue);
}
function hasNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function readString(value) {
	return typeof value === "string" ? value : void 0;
}
function readRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function readNodeId(details) {
	const nodeId = details?.nodeId;
	return typeof nodeId === "string" ? nodeId : void 0;
}
function suggestFixForCode(code) {
	switch (code) {
		case "asset_not_render_safe":
		case "missing_asset":
		case "unsafe_asset_url": return "Resolve the asset through an adapter that provides a DocRaptor-reachable render-safe URL.";
		case "invalid_table_column": return "Point the table column at a row field that exists in the selected dataset.";
		case "invalid_summary_calculation":
		case "missing_summary_source": return "Update the summary calculation reference so it uses structured table or data paths that resolve.";
		case "missing_condition_source": return "Update the conditional field path or provide sample data for that path.";
		case "missing_required_variable": return "Provide the required source data before publish or production rendering.";
		case "unknown_formatter": return "Use one of the schema package deterministic formatter names.";
		case "unsupported_node": return "Replace the node with a supported PDF Document Builder block.";
		default: return;
	}
}
function isMissingValue(value) {
	return value === void 0 || value === null || value === "";
}
//#endregion
//#region src/index.ts
const pdfRendererBoundary = {
	packageName: "@asym/pdf-renderer",
	maturity: "phase-37-security-tenant-contracts",
	owns: "print-renderer",
	runtime: "browser-safe-root-with-server-subpath",
	consumes: ["@asym/pdf-template-schema"]
};
//#endregion
exports.composePdfDocumentHtml = require_preview.composePdfDocumentHtml;
exports.composePrintDocumentHtml = require_preview.composePrintDocumentHtml;
exports.createBrowserPdfPreview = require_preview.createBrowserPdfPreview;
exports.evaluatePdfDocumentCondition = require_preview.evaluatePdfDocumentCondition;
exports.pdfRendererBoundary = pdfRendererBoundary;
exports.preflightPdfDocumentAccessibility = preflightPdfDocumentAccessibility;
exports.preflightPdfDocumentAssets = require_preview.preflightPdfDocumentAssets;
exports.preflightPdfTemplate = preflightPdfTemplate;
exports.resolvePdfDocumentRepeaterItems = require_preview.resolvePdfDocumentRepeaterItems;
exports.resolvePdfDocumentTableRows = require_preview.resolvePdfDocumentTableRows;
exports.resolvePdfDocumentVariables = resolvePdfDocumentVariables;
