Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let zod = require("zod");
//#region src/primitives.ts
const NonEmptyStringSchema = zod.z.string().trim().min(1);
const IdentifierSchema = NonEmptyStringSchema.regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, "Expected a stable identifier.");
const VariableKeySchema = NonEmptyStringSchema.regex(/^[a-z][a-z0-9]*(?:[._][a-z0-9]+)*$/, "Expected a lower-case dotted variable key.");
const DataPathSchema = NonEmptyStringSchema.regex(/^[a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)*$/, "Expected a dotted data path.");
const JsonValueSchema = zod.z.lazy(() => zod.z.union([
	zod.z.string(),
	zod.z.number().finite(),
	zod.z.boolean(),
	zod.z.null(),
	zod.z.array(JsonValueSchema),
	zod.z.record(zod.z.string(), JsonValueSchema)
]));
const JsonObjectSchema = zod.z.record(zod.z.string(), JsonValueSchema);
const IsoDateTimeSchema = zod.z.string().datetime({ offset: true });
const PositiveIntegerSchema = zod.z.number().int().positive();
const NonNegativeIntegerSchema = zod.z.number().int().nonnegative();
const NonNegativeNumberSchema = zod.z.number().finite().nonnegative();
const UrlSchema = zod.z.string().url();
const UnitLengthSchema = NonEmptyStringSchema.regex(/^\d+(?:\.\d+)?(?:in|cm|mm|pt|px)$/, "Expected a CSS length using in, cm, mm, pt, or px.");
//#endregion
//#region src/assets.ts
const DocumentAssetRoleSchema = zod.z.enum([
	"logo",
	"image",
	"signature",
	"font",
	"qr",
	"attachment"
]);
const AssetRoleSchema = DocumentAssetRoleSchema;
const DocumentAssetUrlClassificationSchema = zod.z.enum([
	"render_safe_public",
	"signed_render_url",
	"browser_blob",
	"data_url",
	"private_app_session",
	"non_https_url",
	"unsafe_scheme",
	"invalid_url"
]);
const DocumentAssetAlignmentSchema = zod.z.enum([
	"left",
	"center",
	"right",
	"full_width"
]);
const DocumentAssetSourceMetadataSchema = zod.z.object({
	provider: NonEmptyStringSchema.optional(),
	sourceId: NonEmptyStringSchema.optional(),
	version: NonEmptyStringSchema.optional(),
	checksum: NonEmptyStringSchema.optional(),
	uploadedBy: IdentifierSchema.optional()
}).strict();
const DocumentAssetReferenceSchema = zod.z.object({
	id: IdentifierSchema,
	role: DocumentAssetRoleSchema,
	assetId: IdentifierSchema.optional(),
	url: UrlSchema.optional(),
	renderSafeUrl: UrlSchema.optional(),
	mimeType: NonEmptyStringSchema.optional(),
	altText: zod.z.string().optional(),
	width: PositiveIntegerSchema.optional(),
	height: PositiveIntegerSchema.optional(),
	alignment: DocumentAssetAlignmentSchema.default("left"),
	linkUrl: UrlSchema.optional(),
	renderSafe: zod.z.boolean().default(false),
	required: zod.z.boolean().default(true),
	tenantId: IdentifierSchema.optional(),
	source: DocumentAssetSourceMetadataSchema.optional()
}).strict().superRefine((asset, context) => {
	if (!(asset.assetId !== void 0 || asset.url !== void 0 || asset.renderSafeUrl !== void 0)) context.addIssue({
		code: "custom",
		message: "Asset references require assetId, url, or renderSafeUrl for adapter resolution.",
		path: ["assetId"]
	});
	if (asset.renderSafe && hasBlobUrl(asset.url)) context.addIssue({
		code: "custom",
		message: "Render-safe asset references cannot use browser blob URLs for production rendering.",
		path: ["url"]
	});
	if (hasBlobUrl(asset.renderSafeUrl)) context.addIssue({
		code: "custom",
		message: "Render-safe asset URLs cannot be browser blob URLs for production rendering.",
		path: ["renderSafeUrl"]
	});
});
const AssetReferenceSchema = DocumentAssetReferenceSchema;
const DocumentAssetImageAttributesSchema = zod.z.object({
	asset: DocumentAssetReferenceSchema.optional(),
	assetId: IdentifierSchema.optional(),
	id: IdentifierSchema.optional(),
	role: DocumentAssetRoleSchema.default("image"),
	url: UrlSchema.optional(),
	renderSafeUrl: UrlSchema.optional(),
	mimeType: NonEmptyStringSchema.optional(),
	altText: zod.z.string().optional(),
	width: PositiveIntegerSchema.optional(),
	height: PositiveIntegerSchema.optional(),
	alignment: DocumentAssetAlignmentSchema.default("left"),
	linkUrl: UrlSchema.optional(),
	renderSafe: zod.z.boolean().default(false),
	required: zod.z.boolean().default(true),
	tenantId: IdentifierSchema.optional(),
	source: DocumentAssetSourceMetadataSchema.optional()
}).strict().superRefine((attrs, context) => {
	const hasAssetContract = attrs.asset !== void 0;
	const hasReference = attrs.assetId !== void 0 || attrs.url !== void 0 || attrs.renderSafeUrl !== void 0;
	if (!hasAssetContract && !hasReference) context.addIssue({
		code: "custom",
		message: "Asset image nodes require a structured asset, assetId, url, or renderSafeUrl.",
		path: ["asset"]
	});
	if (attrs.renderSafe && hasBlobUrl(attrs.url)) context.addIssue({
		code: "custom",
		message: "Render-safe asset image nodes cannot use browser blob URLs for production rendering.",
		path: ["url"]
	});
	if (hasBlobUrl(attrs.renderSafeUrl)) context.addIssue({
		code: "custom",
		message: "Render-safe asset image node URLs cannot be browser blob URLs for production rendering.",
		path: ["renderSafeUrl"]
	});
});
const DocumentAssetImageNodeSchema = zod.z.object({
	type: zod.z.literal("assetImage"),
	attrs: DocumentAssetImageAttributesSchema
}).strict();
const signedAssetUrlParamPattern = /(?:^|[?&])(?:x-amz-signature|x-amz-credential|x-amz-security-token|x-goog-signature|signature|sig|token|access_token|policy|key-pair-id)=/iu;
const privateAppSessionParamPattern = /(?:^|[?&])(?:session|sessionid|sid|cookie|jwt|auth|authorization|bearer)=/iu;
const redactedAssetUrlParamPattern = /([?&](?:x-amz-signature|x-amz-credential|x-amz-security-token|x-goog-signature|signature|sig|token|access_token|policy|key-pair-id|session|sessionid|sid|cookie|jwt|auth|authorization|bearer)=)[^&#\s]+/giu;
function classifyDocumentAssetUrl(url) {
	const trimmedUrl = url.trim();
	const lowerUrl = trimmedUrl.toLowerCase();
	if (lowerUrl.startsWith("blob:")) return createAssetUrlClassification({
		classification: "browser_blob",
		reason: "Browser blob URLs cannot be fetched by DocRaptor.",
		safeForProductionRender: false,
		url: trimmedUrl
	});
	if (lowerUrl.startsWith("data:")) return createAssetUrlClassification({
		classification: "data_url",
		reason: "Inline data URLs are not treated as production render-safe asset URLs.",
		safeForProductionRender: false,
		url: trimmedUrl
	});
	let parsedUrl;
	try {
		parsedUrl = new URL(trimmedUrl);
	} catch {
		return createAssetUrlClassification({
			classification: "invalid_url",
			reason: "Asset URL could not be parsed.",
			safeForProductionRender: false,
			url: trimmedUrl
		});
	}
	if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return createAssetUrlClassification({
		classification: "unsafe_scheme",
		reason: `Asset URL scheme "${parsedUrl.protocol}" is not render-safe.`,
		safeForProductionRender: false,
		url: trimmedUrl
	});
	if (parsedUrl.protocol !== "https:") return createAssetUrlClassification({
		classification: "non_https_url",
		reason: "Production render-safe asset URLs should use HTTPS.",
		safeForProductionRender: false,
		url: trimmedUrl
	});
	if (isPrivateAssetHostname(parsedUrl.hostname) || parsedUrl.pathname.includes("/api/") || privateAppSessionParamPattern.test(parsedUrl.search)) return createAssetUrlClassification({
		classification: "private_app_session",
		reason: "Private app-session URLs and local URLs must be resolved through an asset adapter before production rendering.",
		safeForProductionRender: false,
		url: trimmedUrl
	});
	if (signedAssetUrlParamPattern.test(parsedUrl.search)) return createAssetUrlClassification({
		classification: "signed_render_url",
		reason: "Signed render URLs can be production-fetchable, but their signature values must be redacted from client-facing metadata.",
		redactedUrl: redactSensitiveAssetUrl(trimmedUrl),
		safeForProductionRender: true,
		url: trimmedUrl
	});
	return createAssetUrlClassification({
		classification: "render_safe_public",
		reason: "HTTPS asset URL has no known private-session or signed parameters.",
		safeForProductionRender: true,
		url: trimmedUrl
	});
}
function hasBlobUrl(value) {
	return typeof value === "string" && value.trim().toLowerCase().startsWith("blob:");
}
function createAssetUrlClassification(input) {
	return {
		classification: DocumentAssetUrlClassificationSchema.parse(input.classification),
		reason: input.reason,
		safeForProductionRender: input.safeForProductionRender,
		url: input.url,
		...input.redactedUrl ? { redactedUrl: input.redactedUrl } : {}
	};
}
function isPrivateAssetHostname(hostname) {
	const lowerHostname = hostname.toLowerCase();
	return lowerHostname === "localhost" || lowerHostname.endsWith(".local") || lowerHostname === "127.0.0.1" || lowerHostname.startsWith("127.") || lowerHostname.startsWith("10.") || lowerHostname.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./u.test(lowerHostname);
}
function redactSensitiveAssetUrl(url) {
	return url.replace(redactedAssetUrlParamPattern, "$1[redacted]");
}
//#endregion
//#region src/categories.ts
const TemplateCategorySchema = zod.z.enum([
	"donation_receipt",
	"tax_receipt",
	"annual_giving_statement",
	"donor_letter",
	"missionary_report",
	"financial_report",
	"invoice",
	"certificate",
	"custom"
]);
//#endregion
//#region src/variables.ts
const VariableGroupSchema = zod.z.enum([
	"organization",
	"recipient",
	"donation",
	"document",
	"missionary",
	"tax_receipt",
	"financial_report",
	"statement",
	"invoice",
	"asset",
	"computed",
	"custom"
]);
const VariableValueTypeSchema = zod.z.enum([
	"string",
	"rich_text",
	"date",
	"currency",
	"number",
	"percentage",
	"boolean",
	"address",
	"image_url",
	"url",
	"id"
]);
const PrivacyClassificationSchema = zod.z.enum([
	"public",
	"internal",
	"pii",
	"financial",
	"sensitive"
]);
const FallbackBehaviorSchema = zod.z.discriminatedUnion("mode", [
	zod.z.object({ mode: zod.z.literal("none") }),
	zod.z.object({
		mode: zod.z.literal("use_value"),
		value: JsonValueSchema
	}),
	zod.z.object({ mode: zod.z.literal("omit") })
]);
const VariableDefinitionBaseSchema = zod.z.object({
	key: VariableKeySchema,
	label: NonEmptyStringSchema,
	group: VariableGroupSchema,
	description: NonEmptyStringSchema.optional(),
	type: VariableValueTypeSchema,
	sampleValue: JsonValueSchema,
	required: zod.z.boolean().default(false),
	fallback: FallbackBehaviorSchema.default({ mode: "none" }),
	formatter: NonEmptyStringSchema.optional(),
	privacy: PrivacyClassificationSchema.default("internal"),
	sourcePath: DataPathSchema.optional()
}).strict();
const VariableDefinitionSchema = VariableDefinitionBaseSchema.superRefine((definition, context) => {
	if (definition.required && definition.fallback.mode === "omit") context.addIssue({
		code: "custom",
		message: "Required variables cannot use omit fallback behavior.",
		path: ["fallback"]
	});
});
const RegistryVariableDefinitionSchema = VariableDefinitionBaseSchema.extend({
	description: NonEmptyStringSchema,
	required: zod.z.boolean(),
	fallback: FallbackBehaviorSchema,
	formatter: NonEmptyStringSchema,
	privacy: PrivacyClassificationSchema,
	sourcePath: DataPathSchema,
	documentCategories: zod.z.array(TemplateCategorySchema).min(1)
}).strict().superRefine((definition, context) => {
	if (definition.required && definition.fallback.mode === "omit") context.addIssue({
		code: "custom",
		message: "Required variables cannot use omit fallback behavior.",
		path: ["fallback"]
	});
});
const VariableReferenceSchema = zod.z.object({
	type: zod.z.literal("variable"),
	key: VariableKeySchema,
	formatter: NonEmptyStringSchema.optional(),
	fallback: FallbackBehaviorSchema.optional()
}).strict();
var VariableRegistryError = class extends Error {
	code;
	variableKeys;
	cause;
	constructor(options) {
		super(options.message);
		this.name = "VariableRegistryError";
		this.code = options.code;
		this.variableKeys = options.variableKeys ?? [];
		this.cause = options.cause;
	}
};
function categoryList(...categories) {
	return categories;
}
function compareDefinitions(left, right) {
	return left.key.localeCompare(right.key);
}
function cloneJsonValue(value) {
	if (Array.isArray(value)) return value.map((item) => cloneJsonValue(item));
	if (value !== null && typeof value === "object") {
		const entries = Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
		return Object.fromEntries(entries.map(([key, item]) => [key, cloneJsonValue(item)]));
	}
	return value;
}
function isJsonRecord(value) {
	return value !== void 0 && value !== null && typeof value === "object" && !Array.isArray(value);
}
function setSampleValue(sampleData, sourcePath, value) {
	const segments = sourcePath.split(".");
	let current = sampleData;
	for (const [index, segment] of segments.entries()) {
		if (index === segments.length - 1) {
			current[segment] = cloneJsonValue(value);
			return;
		}
		const existingValue = current[segment];
		if (isJsonRecord(existingValue)) {
			current = existingValue;
			continue;
		}
		const nextValue = {};
		current[segment] = nextValue;
		current = nextValue;
	}
}
function isDefinitionForCategory(definition, category) {
	return category === void 0 || definition.documentCategories.includes(category);
}
function parseRegistryDefinition(definition) {
	const result = RegistryVariableDefinitionSchema.safeParse(definition);
	if (result.success) return result.data;
	throw new VariableRegistryError({
		code: "invalid_definition",
		message: "Invalid variable registry definition.",
		variableKeys: typeof definition === "object" && definition !== null && "key" in definition && typeof definition.key === "string" ? [definition.key] : [],
		cause: result.error
	});
}
function findDuplicateKeys(definitions) {
	const seenKeys = /* @__PURE__ */ new Set();
	const duplicateKeys = /* @__PURE__ */ new Set();
	for (const definition of definitions) {
		if (seenKeys.has(definition.key)) {
			duplicateKeys.add(definition.key);
			continue;
		}
		seenKeys.add(definition.key);
	}
	return [...duplicateKeys].sort();
}
function createVariableRegistry(definitions) {
	const parsedDefinitions = definitions.map((definition) => parseRegistryDefinition(definition));
	const duplicateKeys = findDuplicateKeys(parsedDefinitions);
	if (duplicateKeys.length > 0) throw new VariableRegistryError({
		code: "duplicate_key",
		message: `Duplicate variable registry key: ${duplicateKeys.join(", ")}`,
		variableKeys: duplicateKeys
	});
	const registryDefinitions = Object.freeze([...parsedDefinitions].sort(compareDefinitions));
	const definitionsByKey = new Map(registryDefinitions.map((definition) => [definition.key, definition]));
	return Object.freeze({
		definitions: registryDefinitions,
		get(key) {
			return definitionsByKey.get(key);
		},
		listByGroup(group) {
			return registryDefinitions.filter((definition) => definition.group === group);
		},
		listRequired(category) {
			return registryDefinitions.filter((definition) => definition.required && isDefinitionForCategory(definition, category));
		},
		detectUnknownKeys(keys) {
			const unknownKeys = /* @__PURE__ */ new Set();
			for (const key of keys) if (!definitionsByKey.has(key)) unknownKeys.add(key);
			return [...unknownKeys].sort();
		},
		createSampleData(category) {
			const sampleData = {};
			for (const definition of registryDefinitions) {
				if (!isDefinitionForCategory(definition, category)) continue;
				setSampleValue(sampleData, definition.sourcePath, definition.sampleValue);
			}
			return sampleData;
		}
	});
}
const receiptCategories = categoryList("donation_receipt", "tax_receipt");
const statementCategories = categoryList("annual_giving_statement");
const donorLetterCategories = categoryList("donor_letter");
const missionaryCategories = categoryList("missionary_report");
const financialReportCategories = categoryList("financial_report");
const invoiceCategories = categoryList("invoice");
const certificateCategories = categoryList("certificate");
const allDocumentCategories = categoryList("donation_receipt", "tax_receipt", "annual_giving_statement", "donor_letter", "missionary_report", "financial_report", "invoice", "certificate", "custom");
const coreVariableRegistry = createVariableRegistry([
	{
		key: "organization.name",
		label: "Organization Name",
		group: "organization",
		description: "Public-facing organization name for branded documents.",
		type: "string",
		sampleValue: "Asymmetric Giving",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "public",
		sourcePath: "organization.name",
		documentCategories: allDocumentCategories
	},
	{
		key: "organization.legal_name",
		label: "Organization Legal Name",
		group: "organization",
		description: "Legal organization name for official receipts and reports.",
		type: "string",
		sampleValue: "Asymmetric Giving Foundation",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "public",
		sourcePath: "organization.legalName",
		documentCategories: receiptCategories
	},
	{
		key: "organization.ein",
		label: "Organization EIN",
		group: "organization",
		description: "Tax identifier used on tax receipts when applicable.",
		type: "id",
		sampleValue: "12-3456789",
		required: false,
		fallback: { mode: "omit" },
		formatter: "id.tax",
		privacy: "sensitive",
		sourcePath: "organization.ein",
		documentCategories: receiptCategories
	},
	{
		key: "organization.address",
		label: "Organization Address",
		group: "organization",
		description: "Mailing address used in letters, receipts, and invoices.",
		type: "address",
		sampleValue: {
			line1: "100 Mission Way",
			city: "Franklin",
			region: "TN",
			postalCode: "37064",
			country: "US"
		},
		required: false,
		fallback: { mode: "omit" },
		formatter: "address.multiline",
		privacy: "public",
		sourcePath: "organization.address",
		documentCategories: allDocumentCategories
	},
	{
		key: "organization.website",
		label: "Organization Website",
		group: "organization",
		description: "Website URL used in branded footers and letters.",
		type: "url",
		sampleValue: "https://example.org",
		required: false,
		fallback: { mode: "omit" },
		formatter: "url",
		privacy: "public",
		sourcePath: "organization.website",
		documentCategories: allDocumentCategories
	},
	{
		key: "recipient.id",
		label: "Recipient ID",
		group: "recipient",
		description: "Stable recipient identifier for audit and batch output.",
		type: "id",
		sampleValue: "recipient-1001",
		required: true,
		fallback: { mode: "none" },
		formatter: "id",
		privacy: "pii",
		sourcePath: "recipient.id",
		documentCategories: allDocumentCategories
	},
	{
		key: "recipient.full_name",
		label: "Recipient Full Name",
		group: "recipient",
		description: "Full display name for donors, invoice recipients, or honorees.",
		type: "string",
		sampleValue: "Jordan Lee",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "pii",
		sourcePath: "recipient.fullName",
		documentCategories: allDocumentCategories
	},
	{
		key: "recipient.email",
		label: "Recipient Email",
		group: "recipient",
		description: "Recipient email address for contact display where appropriate.",
		type: "string",
		sampleValue: "jordan.lee@example.test",
		required: false,
		fallback: { mode: "omit" },
		formatter: "email",
		privacy: "pii",
		sourcePath: "recipient.email",
		documentCategories: allDocumentCategories
	},
	{
		key: "recipient.address",
		label: "Recipient Address",
		group: "recipient",
		description: "Recipient mailing address for receipts, statements, and invoices.",
		type: "address",
		sampleValue: {
			line1: "42 Donor Lane",
			city: "Austin",
			region: "TX",
			postalCode: "78701",
			country: "US"
		},
		required: false,
		fallback: { mode: "omit" },
		formatter: "address.multiline",
		privacy: "pii",
		sourcePath: "recipient.address",
		documentCategories: allDocumentCategories
	},
	{
		key: "donation.id",
		label: "Donation ID",
		group: "donation",
		description: "Stable gift identifier for receipt audit trails.",
		type: "id",
		sampleValue: "gift-2001",
		required: true,
		fallback: { mode: "none" },
		formatter: "id",
		privacy: "financial",
		sourcePath: "donation.id",
		documentCategories: receiptCategories
	},
	{
		key: "donation.date",
		label: "Donation Date",
		group: "donation",
		description: "Date the donation was received.",
		type: "date",
		sampleValue: "2026-04-15",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "financial",
		sourcePath: "donation.date",
		documentCategories: receiptCategories
	},
	{
		key: "donation.amount",
		label: "Donation Amount",
		group: "donation",
		description: "Gift amount for receipts and donor-facing summaries.",
		type: "currency",
		sampleValue: 125,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "donation.amount",
		documentCategories: receiptCategories
	},
	{
		key: "donation.method",
		label: "Donation Method",
		group: "donation",
		description: "Gift payment method label for receipt context.",
		type: "string",
		sampleValue: "Credit card",
		required: false,
		fallback: { mode: "omit" },
		formatter: "text",
		privacy: "financial",
		sourcePath: "donation.method",
		documentCategories: receiptCategories
	},
	{
		key: "donation.designation",
		label: "Donation Designation",
		group: "donation",
		description: "Fund, campaign, or designation associated with the gift.",
		type: "string",
		sampleValue: "General Fund",
		required: false,
		fallback: {
			mode: "use_value",
			value: "General Fund"
		},
		formatter: "text",
		privacy: "financial",
		sourcePath: "donation.designation",
		documentCategories: receiptCategories
	},
	{
		key: "donation.goods_services_value",
		label: "Goods or Services Value",
		group: "donation",
		description: "Value of goods or services received by the donor.",
		type: "currency",
		sampleValue: 0,
		required: false,
		fallback: {
			mode: "use_value",
			value: 0
		},
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "donation.goodsServicesValue",
		documentCategories: receiptCategories
	},
	{
		key: "donation.receipt_number",
		label: "Donation Receipt Number",
		group: "donation",
		description: "Receipt number shown on official donation receipts.",
		type: "id",
		sampleValue: "REC-2026-0001",
		required: true,
		fallback: { mode: "none" },
		formatter: "receipt.number",
		privacy: "internal",
		sourcePath: "donation.receiptNumber",
		documentCategories: receiptCategories
	},
	{
		key: "document.title",
		label: "Document Title",
		group: "document",
		description: "Human-readable title for the rendered document.",
		type: "string",
		sampleValue: "Sample Document",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "internal",
		sourcePath: "document.title",
		documentCategories: allDocumentCategories
	},
	{
		key: "document.date",
		label: "Document Date",
		group: "document",
		description: "Date displayed as the document issue or generation date.",
		type: "date",
		sampleValue: "2026-04-28",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "internal",
		sourcePath: "document.date",
		documentCategories: allDocumentCategories
	},
	{
		key: "document.number",
		label: "Document Number",
		group: "document",
		description: "Optional official document number or reference code.",
		type: "id",
		sampleValue: "DOC-2026-0001",
		required: false,
		fallback: { mode: "omit" },
		formatter: "id",
		privacy: "internal",
		sourcePath: "document.number",
		documentCategories: allDocumentCategories
	},
	{
		key: "document.footer_text",
		label: "Document Footer Text",
		group: "document",
		description: "Reusable footer language for branded templates.",
		type: "rich_text",
		sampleValue: "Thank you for partnering with our mission.",
		required: false,
		fallback: { mode: "omit" },
		formatter: "rich_text",
		privacy: "public",
		sourcePath: "document.footerText",
		documentCategories: allDocumentCategories
	},
	{
		key: "missionary.id",
		label: "Missionary ID",
		group: "missionary",
		description: "Stable missionary or field worker identifier.",
		type: "id",
		sampleValue: "missionary-3001",
		required: false,
		fallback: { mode: "omit" },
		formatter: "id",
		privacy: "internal",
		sourcePath: "missionary.id",
		documentCategories: missionaryCategories
	},
	{
		key: "missionary.full_name",
		label: "Missionary Full Name",
		group: "missionary",
		description: "Display name for the missionary or field worker.",
		type: "string",
		sampleValue: "Avery Carter",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "pii",
		sourcePath: "missionary.fullName",
		documentCategories: missionaryCategories
	},
	{
		key: "missionary.location",
		label: "Missionary Location",
		group: "missionary",
		description: "Public location label for missionary support reports.",
		type: "string",
		sampleValue: "Southeast Asia",
		required: false,
		fallback: {
			mode: "use_value",
			value: "Field location"
		},
		formatter: "text",
		privacy: "sensitive",
		sourcePath: "missionary.location",
		documentCategories: missionaryCategories
	},
	{
		key: "missionary.support_goal",
		label: "Missionary Support Goal",
		group: "missionary",
		description: "Support goal shown in missionary support reports.",
		type: "currency",
		sampleValue: 5e3,
		required: false,
		fallback: { mode: "omit" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "missionary.supportGoal",
		documentCategories: missionaryCategories
	},
	{
		key: "missionary.prayer_update",
		label: "Missionary Prayer Update",
		group: "missionary",
		description: "Optional rich-text update for missionary reports.",
		type: "rich_text",
		sampleValue: "Please pray for continued community partnerships.",
		required: false,
		fallback: { mode: "omit" },
		formatter: "rich_text",
		privacy: "sensitive",
		sourcePath: "missionary.prayerUpdate",
		documentCategories: missionaryCategories
	},
	{
		key: "tax_receipt.tax_year",
		label: "Tax Receipt Year",
		group: "tax_receipt",
		description: "Tax year covered by the receipt.",
		type: "number",
		sampleValue: 2026,
		required: true,
		fallback: { mode: "none" },
		formatter: "number.integer",
		privacy: "internal",
		sourcePath: "taxReceipt.taxYear",
		documentCategories: categoryList("tax_receipt", "annual_giving_statement")
	},
	{
		key: "tax_receipt.deductible_amount",
		label: "Tax Deductible Amount",
		group: "tax_receipt",
		description: "Amount eligible for tax deduction according to receipt rules.",
		type: "currency",
		sampleValue: 125,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "taxReceipt.deductibleAmount",
		documentCategories: categoryList("tax_receipt", "annual_giving_statement")
	},
	{
		key: "tax_receipt.goods_services_statement",
		label: "Goods or Services Statement",
		group: "tax_receipt",
		description: "Receipt language describing goods or services received.",
		type: "rich_text",
		sampleValue: "No goods or services were provided in exchange for this contribution.",
		required: true,
		fallback: { mode: "none" },
		formatter: "rich_text",
		privacy: "public",
		sourcePath: "taxReceipt.goodsServicesStatement",
		documentCategories: receiptCategories
	},
	{
		key: "tax_receipt.issued_date",
		label: "Tax Receipt Issued Date",
		group: "tax_receipt",
		description: "Date the official tax receipt was issued.",
		type: "date",
		sampleValue: "2026-04-28",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "internal",
		sourcePath: "taxReceipt.issuedDate",
		documentCategories: receiptCategories
	},
	{
		key: "financial_report.period",
		label: "Financial Report Period",
		group: "financial_report",
		description: "Period label for a financial report.",
		type: "string",
		sampleValue: "Q1 2026",
		required: true,
		fallback: { mode: "none" },
		formatter: "fiscal.period",
		privacy: "internal",
		sourcePath: "financialReport.period",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.fund_name",
		label: "Financial Report Fund Name",
		group: "financial_report",
		description: "Fund or reporting segment name.",
		type: "string",
		sampleValue: "General Fund",
		required: false,
		fallback: { mode: "omit" },
		formatter: "text",
		privacy: "financial",
		sourcePath: "financialReport.fundName",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.income_total",
		label: "Income Total",
		group: "financial_report",
		description: "Total income for the report period.",
		type: "currency",
		sampleValue: 25e3,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "financialReport.incomeTotal",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.expense_total",
		label: "Expense Total",
		group: "financial_report",
		description: "Total expenses for the report period.",
		type: "currency",
		sampleValue: 18250,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "financialReport.expenseTotal",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.net_balance",
		label: "Net Balance",
		group: "financial_report",
		description: "Net balance for the report period.",
		type: "currency",
		sampleValue: 6750,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "financialReport.netBalance",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.row_count",
		label: "Financial Report Row Count",
		group: "financial_report",
		description: "Number of rows included in the report fixture.",
		type: "number",
		sampleValue: 12,
		required: false,
		fallback: {
			mode: "use_value",
			value: 0
		},
		formatter: "number.integer",
		privacy: "internal",
		sourcePath: "financialReport.rowCount",
		documentCategories: financialReportCategories
	},
	{
		key: "financial_report.variance_percentage",
		label: "Financial Report Variance Percentage",
		group: "financial_report",
		description: "Percentage variance used in finance summary blocks.",
		type: "percentage",
		sampleValue: .08,
		required: false,
		fallback: { mode: "omit" },
		formatter: "percentage",
		privacy: "financial",
		sourcePath: "financialReport.variancePercentage",
		documentCategories: financialReportCategories
	},
	{
		key: "statement.period",
		label: "Statement Period",
		group: "statement",
		description: "Human-readable statement period label.",
		type: "string",
		sampleValue: "2026 Year to Date",
		required: true,
		fallback: { mode: "none" },
		formatter: "fiscal.period",
		privacy: "internal",
		sourcePath: "statement.period",
		documentCategories: statementCategories
	},
	{
		key: "statement.start_date",
		label: "Statement Start Date",
		group: "statement",
		description: "Start date of the statement period.",
		type: "date",
		sampleValue: "2026-01-01",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "financial",
		sourcePath: "statement.startDate",
		documentCategories: statementCategories
	},
	{
		key: "statement.end_date",
		label: "Statement End Date",
		group: "statement",
		description: "End date of the statement period.",
		type: "date",
		sampleValue: "2026-12-31",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "financial",
		sourcePath: "statement.endDate",
		documentCategories: statementCategories
	},
	{
		key: "statement.total_contributions",
		label: "Statement Total Contributions",
		group: "statement",
		description: "Total contributions in an annual giving statement.",
		type: "currency",
		sampleValue: 2400,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "statement.totalContributions",
		documentCategories: statementCategories
	},
	{
		key: "statement.donation_count",
		label: "Statement Donation Count",
		group: "statement",
		description: "Number of donations included in a statement.",
		type: "number",
		sampleValue: 18,
		required: false,
		fallback: {
			mode: "use_value",
			value: 0
		},
		formatter: "number.integer",
		privacy: "financial",
		sourcePath: "statement.donationCount",
		documentCategories: statementCategories
	},
	{
		key: "invoice.number",
		label: "Invoice Number",
		group: "invoice",
		description: "Human-readable invoice number.",
		type: "id",
		sampleValue: "INV-1001",
		required: true,
		fallback: { mode: "none" },
		formatter: "invoice.number",
		privacy: "internal",
		sourcePath: "invoice.number",
		documentCategories: invoiceCategories
	},
	{
		key: "invoice.due_date",
		label: "Invoice Due Date",
		group: "invoice",
		description: "Date by which invoice payment is due.",
		type: "date",
		sampleValue: "2026-05-15",
		required: true,
		fallback: { mode: "none" },
		formatter: "date.medium",
		privacy: "financial",
		sourcePath: "invoice.dueDate",
		documentCategories: invoiceCategories
	},
	{
		key: "invoice.subtotal",
		label: "Invoice Subtotal",
		group: "invoice",
		description: "Invoice subtotal before tax or adjustments.",
		type: "currency",
		sampleValue: 1200,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "invoice.subtotal",
		documentCategories: invoiceCategories
	},
	{
		key: "invoice.tax_rate",
		label: "Invoice Tax Rate",
		group: "invoice",
		description: "Tax rate applied to invoice line items when needed.",
		type: "percentage",
		sampleValue: .0825,
		required: false,
		fallback: {
			mode: "use_value",
			value: 0
		},
		formatter: "percentage",
		privacy: "financial",
		sourcePath: "invoice.taxRate",
		documentCategories: invoiceCategories
	},
	{
		key: "invoice.total",
		label: "Invoice Total",
		group: "invoice",
		description: "Final invoice amount due.",
		type: "currency",
		sampleValue: 1299,
		required: true,
		fallback: { mode: "none" },
		formatter: "currency.usd",
		privacy: "financial",
		sourcePath: "invoice.total",
		documentCategories: invoiceCategories
	},
	{
		key: "invoice.paid",
		label: "Invoice Paid",
		group: "invoice",
		description: "Whether the invoice is already paid.",
		type: "boolean",
		sampleValue: false,
		required: false,
		fallback: {
			mode: "use_value",
			value: false
		},
		formatter: "boolean.yes_no",
		privacy: "financial",
		sourcePath: "invoice.paid",
		documentCategories: invoiceCategories
	},
	{
		key: "asset.logo_url",
		label: "Logo URL",
		group: "asset",
		description: "Render-safe logo URL for preview fixtures.",
		type: "image_url",
		sampleValue: "https://assets.example.test/logo.png",
		required: false,
		fallback: { mode: "omit" },
		formatter: "image_url",
		privacy: "public",
		sourcePath: "asset.logoUrl",
		documentCategories: allDocumentCategories
	},
	{
		key: "asset.logo_alt_text",
		label: "Logo Alt Text",
		group: "asset",
		description: "Accessible alt text for organization logos.",
		type: "string",
		sampleValue: "Asymmetric Giving logo",
		required: false,
		fallback: { mode: "omit" },
		formatter: "text",
		privacy: "public",
		sourcePath: "asset.logoAltText",
		documentCategories: allDocumentCategories
	},
	{
		key: "asset.signature_url",
		label: "Signature Image URL",
		group: "asset",
		description: "Render-safe signature image URL for letters and certificates.",
		type: "image_url",
		sampleValue: "https://assets.example.test/signature.png",
		required: false,
		fallback: { mode: "omit" },
		formatter: "image_url",
		privacy: "sensitive",
		sourcePath: "asset.signatureUrl",
		documentCategories: categoryList("donor_letter", "donation_receipt", "tax_receipt", "certificate")
	},
	{
		key: "asset.portal_url",
		label: "Donor Portal URL",
		group: "asset",
		description: "Safe public URL used for donor portal links or QR codes.",
		type: "url",
		sampleValue: "https://example.org/donor-portal",
		required: false,
		fallback: { mode: "omit" },
		formatter: "url",
		privacy: "public",
		sourcePath: "asset.portalUrl",
		documentCategories: allDocumentCategories
	},
	{
		key: "computed.current_page",
		label: "Current Page Number",
		group: "computed",
		description: "Current page number placeholder for future headers and footers.",
		type: "number",
		sampleValue: 1,
		required: false,
		fallback: { mode: "omit" },
		formatter: "number.integer",
		privacy: "public",
		sourcePath: "computed.currentPage",
		documentCategories: allDocumentCategories
	},
	{
		key: "computed.total_pages",
		label: "Total Page Count",
		group: "computed",
		description: "Total page count placeholder for future headers and footers.",
		type: "number",
		sampleValue: 3,
		required: false,
		fallback: { mode: "omit" },
		formatter: "number.integer",
		privacy: "public",
		sourcePath: "computed.totalPages",
		documentCategories: allDocumentCategories
	},
	{
		key: "computed.generated_at",
		label: "Generated At",
		group: "computed",
		description: "Timestamp placeholder for generated sample output.",
		type: "date",
		sampleValue: "2026-04-28T00:00:00.000Z",
		required: false,
		fallback: { mode: "omit" },
		formatter: "datetime.medium",
		privacy: "internal",
		sourcePath: "computed.generatedAt",
		documentCategories: allDocumentCategories
	},
	{
		key: "computed.is_tax_deductible",
		label: "Is Tax Deductible",
		group: "computed",
		description: "Structured boolean indicating whether a gift is deductible.",
		type: "boolean",
		sampleValue: true,
		required: false,
		fallback: {
			mode: "use_value",
			value: true
		},
		formatter: "boolean.yes_no",
		privacy: "financial",
		sourcePath: "computed.isTaxDeductible",
		documentCategories: receiptCategories
	},
	{
		key: "document.certificate_title",
		label: "Certificate Title",
		group: "document",
		description: "Title displayed on certificate-style documents.",
		type: "string",
		sampleValue: "Certificate of Appreciation",
		required: true,
		fallback: { mode: "none" },
		formatter: "text",
		privacy: "public",
		sourcePath: "document.certificateTitle",
		documentCategories: certificateCategories
	},
	{
		key: "document.donor_letter_body",
		label: "Donor Letter Body",
		group: "document",
		description: "Sample rich-text body for donor letter templates.",
		type: "rich_text",
		sampleValue: "Your generosity helps sustain this work.",
		required: false,
		fallback: { mode: "omit" },
		formatter: "rich_text",
		privacy: "internal",
		sourcePath: "document.donorLetterBody",
		documentCategories: donorLetterCategories
	}
]);
const coreVariableDefinitions = coreVariableRegistry.definitions;
//#endregion
//#region src/bindings.ts
const DataBindingSchema = zod.z.object({
	id: IdentifierSchema,
	variableKey: VariableKeySchema,
	sourcePath: DataPathSchema,
	required: zod.z.boolean().default(false)
}).strict();
const ConditionalOperatorSchema = zod.z.enum([
	"exists",
	"not_exists",
	"equals",
	"not_equals",
	"greater_than",
	"greater_than_or_equal",
	"less_than",
	"less_than_or_equal",
	"contains",
	"not_contains",
	"is_empty",
	"is_not_empty",
	"in",
	"not_in"
]);
const operatorsWithoutValue = new Set([
	"exists",
	"not_exists",
	"is_empty",
	"is_not_empty"
]);
const operatorsWithArrayValue = new Set(["in", "not_in"]);
const ConditionalRuleSchema = zod.z.object({
	id: IdentifierSchema.optional(),
	fieldPath: DataPathSchema,
	operator: ConditionalOperatorSchema,
	value: JsonValueSchema.optional()
}).strict().superRefine((rule, context) => {
	const acceptsValue = !operatorsWithoutValue.has(rule.operator);
	if (acceptsValue && rule.value === void 0) context.addIssue({
		code: "custom",
		message: `Operator "${rule.operator}" requires a comparison value.`,
		path: ["value"]
	});
	if (!acceptsValue && rule.value !== void 0) context.addIssue({
		code: "custom",
		message: `Operator "${rule.operator}" must not define a value.`,
		path: ["value"]
	});
	if (operatorsWithArrayValue.has(rule.operator) && !Array.isArray(rule.value)) context.addIssue({
		code: "custom",
		message: `Operator "${rule.operator}" requires an array comparison value.`,
		path: ["value"]
	});
});
const RepeaterBindingSchema = zod.z.object({
	id: IdentifierSchema,
	sourcePath: DataPathSchema,
	itemAlias: DataPathSchema,
	indexAlias: DataPathSchema.optional(),
	emptyState: NonEmptyStringSchema.optional(),
	filters: zod.z.array(ConditionalRuleSchema).default([]),
	maxItems: PositiveIntegerSchema.max(1e3).default(1e3),
	sort: zod.z.object({
		fieldPath: DataPathSchema,
		direction: zod.z.enum(["asc", "desc"]).default("asc")
	}).strict().optional()
}).strict();
const TableColumnWidthSchema = zod.z.string().regex(/^(?:auto|(?:0|[1-9]\d*)(?:\.\d+)?(?:%|px|pt|in|cm|mm))$/, "Table column width must be auto or a positive CSS length/percentage.");
const TableColumnBindingSchema = zod.z.object({
	key: IdentifierSchema,
	label: NonEmptyStringSchema,
	sourcePath: DataPathSchema,
	type: VariableValueTypeSchema.default("string"),
	formatter: NonEmptyStringSchema.optional(),
	width: TableColumnWidthSchema.optional(),
	align: zod.z.enum([
		"left",
		"center",
		"right"
	]).default("left")
}).strict();
const TableGroupingBindingSchema = zod.z.object({
	fieldPath: DataPathSchema,
	label: NonEmptyStringSchema.optional()
}).strict();
const TableTotalBindingSchema = zod.z.object({
	columnKey: IdentifierSchema,
	operation: zod.z.enum(["sum", "count"]),
	label: NonEmptyStringSchema.optional()
}).strict();
const TableBindingSchema = zod.z.object({
	id: IdentifierSchema,
	sourcePath: DataPathSchema,
	columns: zod.z.array(TableColumnBindingSchema).min(1),
	emptyState: NonEmptyStringSchema.optional(),
	grouping: TableGroupingBindingSchema.optional(),
	repeatHeader: zod.z.boolean().default(true),
	avoidRowSplit: zod.z.boolean().default(true),
	maxRows: NonNegativeIntegerSchema.max(5e3).default(5e3),
	totals: zod.z.array(TableTotalBindingSchema).default([])
}).strict().superRefine((binding, context) => {
	const columnKeys = new Set(binding.columns.map((column) => column.key));
	for (const total of binding.totals) if (!columnKeys.has(total.columnKey)) context.addIssue({
		code: "custom",
		message: `Total references unknown table column "${total.columnKey}".`,
		path: ["totals"]
	});
});
//#endregion
//#region src/header-footer.ts
const HeaderFooterPlacementSchema = zod.z.enum(["header", "footer"]);
const HeaderFooterScopeSchema = zod.z.enum(["first_page", "repeating"]);
const HeaderFooterAlignmentSchema = zod.z.enum([
	"left",
	"center",
	"right"
]);
const HeaderFooterTextTokenSchema = zod.z.object({
	kind: zod.z.literal("text"),
	text: zod.z.string().min(1)
}).strict();
const HeaderFooterDocumentTitleTokenSchema = zod.z.object({ kind: zod.z.literal("document_title") }).strict();
const HeaderFooterOrganizationFooterTokenSchema = zod.z.object({
	kind: zod.z.literal("organization_footer"),
	fallbackText: zod.z.string().optional()
}).strict();
const HeaderFooterPageNumberTokenSchema = zod.z.object({ kind: zod.z.literal("page_number") }).strict();
const HeaderFooterTotalPagesTokenSchema = zod.z.object({ kind: zod.z.literal("total_pages") }).strict();
const HeaderFooterContentTokenSchema = zod.z.discriminatedUnion("kind", [
	HeaderFooterTextTokenSchema,
	HeaderFooterDocumentTitleTokenSchema,
	HeaderFooterOrganizationFooterTokenSchema,
	HeaderFooterPageNumberTokenSchema,
	HeaderFooterTotalPagesTokenSchema
]);
const HeaderFooterRegionSchema = zod.z.object({
	id: IdentifierSchema.optional(),
	placement: HeaderFooterPlacementSchema,
	scope: HeaderFooterScopeSchema,
	enabled: zod.z.boolean().default(true),
	alignment: HeaderFooterAlignmentSchema.default("center"),
	minimumMargin: UnitLengthSchema.default("0.5in"),
	content: zod.z.array(HeaderFooterContentTokenSchema).default([])
}).strict().superRefine((region, context) => {
	if (region.enabled && region.content.length === 0) context.addIssue({
		code: "custom",
		message: "Enabled header/footer regions require at least one token.",
		path: ["content"]
	});
});
const defaultDocumentHeaderFooterSettings = { regions: [] };
const DocumentHeaderFooterSettingsSchema = zod.z.object({ regions: zod.z.array(HeaderFooterRegionSchema).default([]) }).strict().default(defaultDocumentHeaderFooterSettings).superRefine((settings, context) => {
	const seenRegions = /* @__PURE__ */ new Set();
	for (const [index, region] of settings.regions.entries()) {
		const regionKey = `${region.placement}:${region.scope}`;
		if (seenRegions.has(regionKey)) context.addIssue({
			code: "custom",
			message: "Header/footer regions must be unique by placement and scope.",
			path: ["regions", index]
		});
		seenRegions.add(regionKey);
	}
});
//#endregion
//#region src/pdf-metadata.ts
const PdfDocumentLanguageSchema = NonEmptyStringSchema.regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, "Expected a BCP 47-style language tag.");
const defaultPdfDocumentMetadata = {
	keywords: [],
	language: "en-US"
};
const PdfDocumentMetadataSchema = zod.z.object({
	title: NonEmptyStringSchema.optional(),
	subject: NonEmptyStringSchema.optional(),
	author: NonEmptyStringSchema.optional(),
	organization: NonEmptyStringSchema.optional(),
	language: PdfDocumentLanguageSchema.default("en-US"),
	keywords: zod.z.array(NonEmptyStringSchema).default([])
}).strict().default(defaultPdfDocumentMetadata);
const PdfDocumentProfileSchema = zod.z.enum([
	"PDF/A-1a",
	"PDF/A-1a+PDF/UA-1",
	"PDF/A-1b",
	"PDF/A-2a",
	"PDF/A-2a+PDF/UA-1",
	"PDF/A-2b",
	"PDF/A-3a",
	"PDF/A-3a+PDF/UA-1",
	"PDF/A-3b",
	"PDF/UA-1"
]);
const PdfDocumentProfileOptionsSchema = zod.z.object({ profile: PdfDocumentProfileSchema.optional() }).strict().default({});
const PdfDocumentOutputSettingsSchema = zod.z.object({
	metadata: PdfDocumentMetadataSchema,
	profile: PdfDocumentProfileOptionsSchema
}).strict().default({
	metadata: defaultPdfDocumentMetadata,
	profile: {}
});
//#endregion
//#region src/placeholders.ts
const DocumentPlaceholderKindSchema = zod.z.enum([
	"text_field",
	"checkbox",
	"signature",
	"initials",
	"qr",
	"date"
]);
const DocumentPlaceholderSignerRoleSchema = zod.z.enum([
	"organization",
	"recipient",
	"witness",
	"staff",
	"custom"
]);
const QrPlaceholderPayloadSchema = zod.z.discriminatedUnion("type", [
	zod.z.object({
		type: zod.z.literal("url"),
		value: UrlSchema.refine((value) => isSafeQrUrl(value), "QR URL payloads must use http or https URLs.")
	}).strict(),
	zod.z.object({
		type: zod.z.literal("text"),
		value: NonEmptyStringSchema.max(2048)
	}).strict(),
	zod.z.object({
		type: zod.z.literal("variable"),
		key: VariableKeySchema
	}).strict()
]);
const BaseDocumentPlaceholderSchema = zod.z.object({
	id: IdentifierSchema,
	kind: DocumentPlaceholderKindSchema,
	label: NonEmptyStringSchema.optional(),
	required: zod.z.boolean().default(false),
	adapterKey: IdentifierSchema.optional(),
	dataPath: DataPathSchema.optional(),
	description: zod.z.string().trim().min(1).optional()
}).strict();
const TextFieldPlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("text_field"),
	placeholderText: zod.z.string().trim().min(1).optional(),
	maxLength: PositiveIntegerSchema.optional(),
	multiline: zod.z.boolean().default(false)
}).strict();
const CheckboxPlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("checkbox"),
	checkedByDefault: zod.z.boolean().default(false)
}).strict();
const SignaturePlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("signature"),
	signerRole: DocumentPlaceholderSignerRoleSchema.optional(),
	width: PositiveIntegerSchema.optional(),
	height: PositiveIntegerSchema.optional()
}).strict();
const InitialsPlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("initials"),
	signerRole: DocumentPlaceholderSignerRoleSchema.optional(),
	width: PositiveIntegerSchema.optional(),
	height: PositiveIntegerSchema.optional()
}).strict();
const QrPlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("qr"),
	payload: QrPlaceholderPayloadSchema,
	size: PositiveIntegerSchema.optional(),
	errorCorrectionLevel: zod.z.enum([
		"low",
		"medium",
		"quartile",
		"high"
	]).optional()
}).strict();
const DatePlaceholderSchema = BaseDocumentPlaceholderSchema.extend({
	kind: zod.z.literal("date"),
	dateFormat: NonEmptyStringSchema.optional()
}).strict();
const DocumentPlaceholderSchema = zod.z.discriminatedUnion("kind", [
	TextFieldPlaceholderSchema,
	CheckboxPlaceholderSchema,
	SignaturePlaceholderSchema,
	InitialsPlaceholderSchema,
	QrPlaceholderSchema,
	DatePlaceholderSchema
]);
function isSafeQrUrl(value) {
	if (containsControlCharacter(value)) return false;
	try {
		const parsedUrl = new URL(value);
		return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
	} catch {
		return false;
	}
}
function containsControlCharacter(value) {
	for (const character of value) {
		const codePoint = character.codePointAt(0);
		if (codePoint !== void 0 && (codePoint <= 31 || codePoint === 127)) return true;
	}
	return false;
}
//#endregion
//#region src/summary-blocks.ts
const SummaryCalculationPrecisionSchema = zod.z.object({
	scale: zod.z.number().int().nonnegative().optional(),
	roundingMode: zod.z.literal("half_away_from_zero").optional()
}).strict();
const SummaryDisplayLabelsSchema = zod.z.record(zod.z.string(), NonEmptyStringSchema).optional();
const TotalContributionsCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("total_contributions"),
	sourcePath: DataPathSchema,
	amountPath: DataPathSchema,
	label: NonEmptyStringSchema.optional()
}).strict();
const TableTotalCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("table_total"),
	tableBindingId: IdentifierSchema,
	columnKey: IdentifierSchema,
	operation: zod.z.enum(["sum", "count"]).optional(),
	label: NonEmptyStringSchema.optional()
}).strict();
const InvoiceTotalsCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("invoice_totals"),
	lineItemsPath: DataPathSchema,
	amountPath: DataPathSchema.optional(),
	quantityPath: DataPathSchema.optional(),
	ratePath: DataPathSchema.optional(),
	discountPath: DataPathSchema.optional(),
	taxPath: DataPathSchema.optional(),
	fields: zod.z.array(zod.z.enum([
		"subtotal",
		"discounts",
		"taxes",
		"total"
	])).min(1).default([
		"subtotal",
		"discounts",
		"taxes",
		"total"
	]),
	labels: SummaryDisplayLabelsSchema
}).strict();
const FinancialReportTotalsCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("financial_report_totals"),
	sourcePath: DataPathSchema,
	amountPath: DataPathSchema,
	categoryPath: DataPathSchema,
	incomeCategories: zod.z.array(NonEmptyStringSchema).min(1),
	expenseCategories: zod.z.array(NonEmptyStringSchema).min(1),
	fields: zod.z.array(zod.z.enum([
		"income",
		"expense",
		"net"
	])).min(1).default([
		"income",
		"expense",
		"net"
	]),
	labels: SummaryDisplayLabelsSchema
}).strict();
const GroupedSubtotalsCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("grouped_subtotals"),
	sourcePath: DataPathSchema,
	groupPath: DataPathSchema,
	valuePath: DataPathSchema,
	includeGrandTotal: zod.z.boolean().default(false),
	labels: SummaryDisplayLabelsSchema,
	grandTotalLabel: NonEmptyStringSchema.optional()
}).strict();
const GrandTotalCalculationReferenceSchema = zod.z.object({
	type: zod.z.literal("grand_total"),
	sourcePath: DataPathSchema,
	groupPath: DataPathSchema,
	valuePath: DataPathSchema,
	label: NonEmptyStringSchema.optional()
}).strict();
const SummaryCalculationReferenceSchema = zod.z.discriminatedUnion("type", [
	TotalContributionsCalculationReferenceSchema,
	TableTotalCalculationReferenceSchema,
	InvoiceTotalsCalculationReferenceSchema,
	FinancialReportTotalsCalculationReferenceSchema,
	GroupedSubtotalsCalculationReferenceSchema,
	GrandTotalCalculationReferenceSchema
]);
const SummaryBlockBindingSchema = zod.z.object({
	id: IdentifierSchema,
	title: NonEmptyStringSchema.optional(),
	formatter: NonEmptyStringSchema.default("currency.usd"),
	precision: SummaryCalculationPrecisionSchema.optional(),
	calculation: SummaryCalculationReferenceSchema
}).strict();
//#endregion
//#region src/themes.ts
const defaultThemeColors = {
	primary: "#1f2937",
	accent: "#2563eb",
	text: "#111827",
	background: "#ffffff"
};
const defaultThemeFonts = {
	body: "Arial",
	heading: "Arial",
	fallback: ["sans-serif"]
};
const DocumentBrandSourceSchema = zod.z.enum([
	"system_default",
	"tenant_default",
	"template_override"
]);
const DocumentBrandFieldSchema = zod.z.enum([
	"organization_name",
	"logo_asset",
	"primary_color",
	"accent_color",
	"text_color",
	"background_color",
	"heading_font",
	"body_font",
	"fallback_fonts",
	"footer_text",
	"receipt_defaults"
]);
const DocumentBrandingMetadataSchema = zod.z.object({
	source: DocumentBrandSourceSchema.default("system_default"),
	tenantBrandId: IdentifierSchema.optional(),
	overriddenFields: zod.z.array(DocumentBrandFieldSchema).default([])
}).strict().default({
	source: "system_default",
	overriddenFields: []
});
const DocumentThemeColorSchema = NonEmptyStringSchema.regex(/^#[0-9a-fA-F]{6}$/, "Expected a six-digit hex color token.").transform((value) => value.toLowerCase());
const DocumentThemeColorsSchema = zod.z.object({
	primary: DocumentThemeColorSchema.default(defaultThemeColors.primary),
	accent: DocumentThemeColorSchema.default(defaultThemeColors.accent),
	text: DocumentThemeColorSchema.default(defaultThemeColors.text),
	background: DocumentThemeColorSchema.default(defaultThemeColors.background)
}).strict().default(defaultThemeColors);
const DocumentThemeFontFamilySchema = NonEmptyStringSchema.regex(/^[A-Za-z0-9 ._-]+$/, "Expected a plain font family name without CSS syntax.");
const DocumentThemeFontsSchema = zod.z.object({
	body: DocumentThemeFontFamilySchema.default(defaultThemeFonts.body),
	heading: DocumentThemeFontFamilySchema.default(defaultThemeFonts.heading),
	fallback: zod.z.array(DocumentThemeFontFamilySchema).default([...defaultThemeFonts.fallback])
}).strict().default(defaultThemeFonts);
const DocumentThemeOrganizationSchema = zod.z.object({
	name: NonEmptyStringSchema.optional(),
	legalName: NonEmptyStringSchema.optional(),
	websiteUrl: UrlSchema.optional()
}).strict().default({});
const DocumentReceiptDefaultsSchema = zod.z.object({
	thankYouMessage: NonEmptyStringSchema.optional(),
	taxLanguage: NonEmptyStringSchema.optional(),
	goodsServicesStatement: NonEmptyStringSchema.optional()
}).strict().default({});
const DocumentThemeSchema = zod.z.object({
	name: NonEmptyStringSchema.default("Default"),
	branding: DocumentBrandingMetadataSchema,
	organization: DocumentThemeOrganizationSchema,
	colors: DocumentThemeColorsSchema,
	fonts: DocumentThemeFontsSchema,
	logoAsset: DocumentAssetReferenceSchema.optional(),
	logoAssetId: IdentifierSchema.optional(),
	footerText: zod.z.string().optional(),
	receiptDefaults: DocumentReceiptDefaultsSchema
}).strict().default({
	name: "Default",
	branding: {
		source: "system_default",
		overriddenFields: []
	},
	colors: defaultThemeColors,
	fonts: defaultThemeFonts,
	organization: {},
	receiptDefaults: {}
}).superRefine((theme, context) => {
	if (theme.logoAsset && theme.logoAsset.role !== "logo") context.addIssue({
		code: "custom",
		message: "Theme logo assets must use the logo role.",
		path: ["logoAsset", "role"]
	});
});
function resolveDocumentTheme(input = {}) {
	const mergedTheme = mergeThemeInputs(input.systemDefaults, input.tenantDefaults, input.templateOverrides);
	return DocumentThemeSchema.parse(mergedTheme);
}
function mergeThemeInputs(...themes) {
	let mergedTheme = {};
	for (const theme of themes) {
		if (!theme || typeof theme !== "object") continue;
		const nextTheme = theme;
		mergedTheme = {
			...mergedTheme,
			...withoutUndefinedValues(nextTheme),
			branding: mergeNestedObject(mergedTheme.branding, nextTheme.branding),
			colors: mergeNestedObject(mergedTheme.colors, nextTheme.colors),
			fonts: mergeNestedObject(mergedTheme.fonts, nextTheme.fonts),
			organization: mergeNestedObject(mergedTheme.organization, nextTheme.organization),
			receiptDefaults: mergeNestedObject(mergedTheme.receiptDefaults, nextTheme.receiptDefaults)
		};
	}
	return mergedTheme;
}
function mergeNestedObject(current, next) {
	const currentObject = isPlainObject(current) ? current : {};
	if (!isPlainObject(next)) return Object.keys(currentObject).length > 0 ? currentObject : void 0;
	return {
		...currentObject,
		...withoutUndefinedValues(next)
	};
}
function withoutUndefinedValues(value) {
	return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== void 0));
}
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region src/template.ts
const defaultPageMargins = {
	top: "0.5in",
	right: "0.5in",
	bottom: "0.5in",
	left: "0.5in"
};
const defaultPageSettings = {
	pageSize: "letter",
	orientation: "portrait",
	margins: defaultPageMargins,
	headerFooter: defaultDocumentHeaderFooterSettings
};
const DocumentEngineSchema = zod.z.enum(["asym_pdf_document_builder", "unlayer"]);
const PageSizeSchema = zod.z.enum([
	"letter",
	"a4",
	"legal",
	"custom"
]);
const PageOrientationSchema = zod.z.enum(["portrait", "landscape"]);
const PageUnitSchema = zod.z.enum([
	"in",
	"cm",
	"mm",
	"pt",
	"px"
]);
const PageMarginsSchema = zod.z.object({
	top: UnitLengthSchema.default("0.5in"),
	right: UnitLengthSchema.default("0.5in"),
	bottom: UnitLengthSchema.default("0.5in"),
	left: UnitLengthSchema.default("0.5in")
}).strict().default(defaultPageMargins);
const CustomPageSizeSchema = zod.z.object({
	width: PositiveIntegerSchema,
	height: PositiveIntegerSchema,
	unit: PageUnitSchema.default("in")
}).strict();
const DocumentPageSettingsSchema = zod.z.object({
	pageSize: PageSizeSchema.default("letter"),
	orientation: PageOrientationSchema.default("portrait"),
	margins: PageMarginsSchema,
	customSize: CustomPageSizeSchema.optional(),
	headerFooter: DocumentHeaderFooterSettingsSchema
}).strict().default(defaultPageSettings).superRefine((settings, context) => {
	if (settings.pageSize === "custom" && settings.customSize === void 0) context.addIssue({
		code: "custom",
		message: "customSize is required when pageSize is custom.",
		path: ["customSize"]
	});
	if (settings.pageSize !== "custom" && settings.customSize !== void 0) context.addIssue({
		code: "custom",
		message: "customSize can only be used when pageSize is custom.",
		path: ["customSize"]
	});
});
const DocumentMarkSchema = zod.z.object({
	type: NonEmptyStringSchema,
	attrs: zod.z.record(zod.z.string(), JsonValueSchema).optional()
}).strict();
const DocumentContentNodeSchema = zod.z.lazy(() => zod.z.object({
	type: NonEmptyStringSchema,
	attrs: zod.z.record(zod.z.string(), JsonValueSchema).optional(),
	text: zod.z.string().optional(),
	marks: zod.z.array(DocumentMarkSchema).optional(),
	content: zod.z.array(DocumentContentNodeSchema).optional()
}).strict());
const DocumentContentSchema = zod.z.object({
	type: zod.z.literal("doc"),
	content: zod.z.array(DocumentContentNodeSchema).default([])
}).strict();
const DocumentTemplateV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	name: NonEmptyStringSchema,
	category: TemplateCategorySchema,
	engine: DocumentEngineSchema.default("asym_pdf_document_builder"),
	status: zod.z.enum([
		"draft",
		"published",
		"archived"
	]).default("draft"),
	pageSettings: DocumentPageSettingsSchema,
	theme: DocumentThemeSchema,
	pdfSettings: PdfDocumentOutputSettingsSchema,
	content: DocumentContentSchema,
	variables: zod.z.array(VariableDefinitionSchema).default([]),
	dataBindings: zod.z.array(DataBindingSchema).default([]),
	conditionalRules: zod.z.array(ConditionalRuleSchema).default([]),
	repeaterBindings: zod.z.array(RepeaterBindingSchema).default([]),
	tableBindings: zod.z.array(TableBindingSchema).default([]),
	summaryBlockBindings: zod.z.array(SummaryBlockBindingSchema).default([]),
	placeholderBindings: zod.z.array(DocumentPlaceholderSchema).default([]),
	assets: zod.z.array(AssetReferenceSchema).default([]),
	metadata: zod.z.object({
		description: zod.z.string().optional(),
		tags: zod.z.array(NonEmptyStringSchema).default([]),
		createdAt: IsoDateTimeSchema.optional(),
		updatedAt: IsoDateTimeSchema.optional()
	}).strict().default({ tags: [] })
}).strict();
//#endregion
//#region src/lifecycle.ts
const TemplateLifecycleStatusSchema = zod.z.enum([
	"draft",
	"published",
	"archived"
]);
const TemplateLifecycleEventSchema = zod.z.enum([
	"created",
	"updated",
	"published",
	"archived",
	"restored",
	"duplicated"
]);
const TemplateLifecycleCheckStatusSchema = zod.z.enum([
	"not_run",
	"passed",
	"warning",
	"failed"
]);
const TemplateLifecycleCheckSchema = zod.z.object({
	status: TemplateLifecycleCheckStatusSchema.default("not_run"),
	checkedAt: IsoDateTimeSchema.optional(),
	diagnosticCount: NonNegativeIntegerSchema.default(0),
	errorCount: NonNegativeIntegerSchema.default(0),
	warningCount: NonNegativeIntegerSchema.default(0),
	summary: JsonObjectSchema.optional()
}).strict().superRefine((check, context) => {
	if (check.status !== "failed" && check.errorCount > 0) context.addIssue({
		code: "custom",
		message: "Only failed checks may include blocking errors.",
		path: ["errorCount"]
	});
});
const TemplateLifecycleEngineMetadataSchema = zod.z.object({
	engine: DocumentEngineSchema.default("asym_pdf_document_builder"),
	schemaVersion: PositiveIntegerSchema.default(1),
	legacyTemplateId: IdentifierSchema.optional(),
	migrationId: IdentifierSchema.optional()
}).strict();
const TemplateLifecycleChangelogEntrySchema = zod.z.object({
	id: IdentifierSchema,
	event: TemplateLifecycleEventSchema,
	at: IsoDateTimeSchema,
	actorId: IdentifierSchema.optional(),
	message: NonEmptyStringSchema.optional(),
	changes: zod.z.array(NonEmptyStringSchema).default([]),
	metadata: JsonObjectSchema.default({})
}).strict();
const TemplateLifecycleRecordV1Schema = zod.z.object({
	version: zod.z.literal(1),
	templateId: IdentifierSchema,
	status: TemplateLifecycleStatusSchema.default("draft"),
	currentDraftId: IdentifierSchema.optional(),
	currentDraftVersion: PositiveIntegerSchema.default(1),
	latestVersion: PositiveIntegerSchema.default(1),
	currentPublishedVersion: PositiveIntegerSchema.optional(),
	currentPublishedSnapshotId: IdentifierSchema.optional(),
	engine: TemplateLifecycleEngineMetadataSchema,
	validation: TemplateLifecycleCheckSchema.default({
		status: "not_run",
		diagnosticCount: 0,
		errorCount: 0,
		warningCount: 0
	}),
	preflight: TemplateLifecycleCheckSchema.default({
		status: "not_run",
		diagnosticCount: 0,
		errorCount: 0,
		warningCount: 0
	}),
	createdAt: IsoDateTimeSchema,
	updatedAt: IsoDateTimeSchema,
	publishedAt: IsoDateTimeSchema.optional(),
	archivedAt: IsoDateTimeSchema.optional(),
	restoredAt: IsoDateTimeSchema.optional(),
	createdByActorId: IdentifierSchema.optional(),
	updatedByActorId: IdentifierSchema.optional(),
	publishedByActorId: IdentifierSchema.optional(),
	archivedByActorId: IdentifierSchema.optional(),
	restoredByActorId: IdentifierSchema.optional(),
	changelog: zod.z.array(TemplateLifecycleChangelogEntrySchema).default([])
}).strict().superRefine((record, context) => {
	if (record.currentDraftVersion > record.latestVersion) context.addIssue({
		code: "custom",
		message: "currentDraftVersion cannot be greater than latestVersion.",
		path: ["currentDraftVersion"]
	});
	if (record.status === "published" && (record.currentPublishedVersion === void 0 || record.currentPublishedSnapshotId === void 0)) context.addIssue({
		code: "custom",
		message: "Published lifecycle records require a published snapshot.",
		path: ["currentPublishedSnapshotId"]
	});
});
const PublishedTemplateSnapshotV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	templateId: IdentifierSchema,
	templateVersion: PositiveIntegerSchema,
	status: zod.z.literal("published"),
	immutable: zod.z.literal(true),
	template: DocumentTemplateV1Schema,
	engine: TemplateLifecycleEngineMetadataSchema,
	validation: TemplateLifecycleCheckSchema,
	preflight: TemplateLifecycleCheckSchema,
	publishedAt: IsoDateTimeSchema,
	publishedByActorId: IdentifierSchema.optional(),
	changelog: zod.z.array(TemplateLifecycleChangelogEntrySchema).default([])
}).strict().superRefine((snapshot, context) => {
	if (snapshot.template.id !== snapshot.templateId) context.addIssue({
		code: "custom",
		message: "Published snapshot template id must match templateId.",
		path: ["template", "id"]
	});
	if (snapshot.template.status !== "published") context.addIssue({
		code: "custom",
		message: "Published snapshots must contain a published template.",
		path: ["template", "status"]
	});
	if (snapshot.template.engine !== snapshot.engine.engine) context.addIssue({
		code: "custom",
		message: "Published snapshot engine metadata must match the template.",
		path: ["engine", "engine"]
	});
	if (!checkAllowsPublish(snapshot.validation)) context.addIssue({
		code: "custom",
		message: "Published snapshots require passing validation.",
		path: ["validation", "status"]
	});
	if (!checkAllowsPublish(snapshot.preflight)) context.addIssue({
		code: "custom",
		message: "Published snapshots require passing preflight.",
		path: ["preflight", "status"]
	});
});
function createTemplateLifecycle(input) {
	const template = DocumentTemplateV1Schema.parse(input.template);
	const engine = TemplateLifecycleEngineMetadataSchema.parse(input.engine ?? {
		engine: template.engine,
		schemaVersion: 1
	});
	const draftId = input.draftId ?? createDraftId(template.id, 1);
	const changelog = [createChangelogEntry({
		actorId: input.actorId,
		at: input.now,
		event: "created",
		message: input.changelogMessage,
		sequence: 1,
		templateId: template.id,
		templateVersion: 1
	})];
	return TemplateLifecycleRecordV1Schema.parse({
		version: 1,
		templateId: template.id,
		status: "draft",
		currentDraftId: draftId,
		currentDraftVersion: 1,
		latestVersion: 1,
		engine,
		validation: createLifecycleCheck(),
		preflight: createLifecycleCheck(),
		createdAt: input.now,
		updatedAt: input.now,
		createdByActorId: input.actorId,
		changelog
	});
}
function publishTemplateVersion(input) {
	const lifecycle = TemplateLifecycleRecordV1Schema.parse(input.lifecycle);
	const draft = DocumentTemplateV1Schema.parse(input.draft);
	const validation = createLifecycleCheck(input.validation);
	const preflight = createLifecycleCheck(input.preflight);
	if (lifecycle.status === "archived") throw new Error("Archived templates must be restored before publishing.");
	if (lifecycle.engine.engine !== "asym_pdf_document_builder" || draft.engine !== "asym_pdf_document_builder") throw new Error("Only native Asym PDF templates can be published.");
	if (draft.status !== "draft") throw new Error("Only draft templates can be published.");
	if (!checkAllowsPublish(validation)) throw new Error("Template validation must pass before publish.");
	if (!checkAllowsPublish(preflight)) throw new Error("Template preflight must pass before publish.");
	const templateVersion = lifecycle.currentDraftVersion;
	const snapshotId = input.snapshotId ?? createPublishedSnapshotId(draft.id, templateVersion);
	const publishedTemplate = DocumentTemplateV1Schema.parse({
		...cloneJson(draft),
		status: "published",
		metadata: {
			...draft.metadata,
			updatedAt: input.now
		}
	});
	const publishedEntry = createChangelogEntry({
		actorId: input.actorId,
		at: input.now,
		event: "published",
		message: input.changelogMessage,
		sequence: lifecycle.changelog.length + 1,
		templateId: lifecycle.templateId,
		templateVersion
	});
	const nextChangelog = [...lifecycle.changelog, publishedEntry];
	return {
		lifecycle: TemplateLifecycleRecordV1Schema.parse({
			...lifecycle,
			status: "published",
			currentPublishedVersion: templateVersion,
			currentPublishedSnapshotId: snapshotId,
			validation,
			preflight,
			updatedAt: input.now,
			publishedAt: input.now,
			updatedByActorId: input.actorId,
			publishedByActorId: input.actorId,
			changelog: nextChangelog
		}),
		snapshot: deepFreeze(PublishedTemplateSnapshotV1Schema.parse({
			version: 1,
			id: snapshotId,
			templateId: lifecycle.templateId,
			templateVersion,
			status: "published",
			immutable: true,
			template: publishedTemplate,
			engine: lifecycle.engine,
			validation,
			preflight,
			publishedAt: input.now,
			publishedByActorId: input.actorId,
			changelog: nextChangelog
		}))
	};
}
function updateTemplateDraft(input) {
	const lifecycle = TemplateLifecycleRecordV1Schema.parse(input.lifecycle);
	const template = DocumentTemplateV1Schema.parse(input.template);
	if (lifecycle.status === "archived") throw new Error("Archived templates must be restored before editing.");
	if (template.id !== lifecycle.templateId) throw new Error("Draft template id must match the lifecycle template id.");
	const nextVersion = lifecycle.latestVersion + 1;
	const draft = DocumentTemplateV1Schema.parse({
		...cloneJson(template),
		engine: lifecycle.engine.engine,
		status: "draft",
		metadata: {
			...template.metadata,
			updatedAt: input.now
		}
	});
	const updatedEntry = createChangelogEntry({
		actorId: input.actorId,
		at: input.now,
		event: "updated",
		message: input.changelogMessage,
		sequence: lifecycle.changelog.length + 1,
		templateId: lifecycle.templateId,
		templateVersion: nextVersion
	});
	return {
		draft,
		lifecycle: TemplateLifecycleRecordV1Schema.parse({
			...lifecycle,
			status: "draft",
			currentDraftId: input.draftId ?? createDraftId(template.id, nextVersion),
			currentDraftVersion: nextVersion,
			latestVersion: nextVersion,
			validation: createLifecycleCheck(),
			preflight: createLifecycleCheck(),
			updatedAt: input.now,
			updatedByActorId: input.actorId,
			changelog: [...lifecycle.changelog, updatedEntry]
		})
	};
}
function duplicateTemplateLifecycle(input) {
	const sourceLifecycle = TemplateLifecycleRecordV1Schema.parse(input.sourceLifecycle);
	const sourceTemplate = DocumentTemplateV1Schema.parse(input.sourceTemplate);
	const draft = DocumentTemplateV1Schema.parse({
		...cloneJson(sourceTemplate),
		id: input.newTemplateId,
		name: input.name ?? `${sourceTemplate.name} Copy`,
		status: "draft",
		metadata: {
			...sourceTemplate.metadata,
			createdAt: input.now,
			updatedAt: input.now
		}
	});
	const created = createTemplateLifecycle({
		actorId: input.actorId,
		draftId: input.draftId ?? createDraftId(input.newTemplateId, 1),
		engine: sourceLifecycle.engine,
		now: input.now,
		template: draft
	});
	const duplicatedEntry = createChangelogEntry({
		actorId: input.actorId,
		at: input.now,
		event: "duplicated",
		message: input.changelogMessage,
		metadata: { sourceTemplateId: sourceLifecycle.templateId },
		sequence: created.changelog.length + 1,
		templateId: input.newTemplateId,
		templateVersion: 1
	});
	return {
		draft,
		lifecycle: TemplateLifecycleRecordV1Schema.parse({
			...created,
			changelog: [...created.changelog, duplicatedEntry]
		})
	};
}
function archiveTemplateLifecycle(input) {
	const lifecycle = TemplateLifecycleRecordV1Schema.parse(input.lifecycle);
	if (lifecycle.status === "archived") return lifecycle;
	return TemplateLifecycleRecordV1Schema.parse({
		...lifecycle,
		status: "archived",
		archivedAt: input.now,
		archivedByActorId: input.actorId,
		updatedAt: input.now,
		updatedByActorId: input.actorId,
		changelog: [...lifecycle.changelog, createChangelogEntry({
			actorId: input.actorId,
			at: input.now,
			event: "archived",
			message: input.changelogMessage,
			sequence: lifecycle.changelog.length + 1,
			templateId: lifecycle.templateId,
			templateVersion: lifecycle.latestVersion
		})]
	});
}
function restoreTemplateLifecycle(input) {
	const lifecycle = TemplateLifecycleRecordV1Schema.parse(input.lifecycle);
	if (lifecycle.status !== "archived") throw new Error("Only archived templates can be restored.");
	return TemplateLifecycleRecordV1Schema.parse({
		...lifecycle,
		status: "draft",
		restoredAt: input.now,
		restoredByActorId: input.actorId,
		updatedAt: input.now,
		updatedByActorId: input.actorId,
		changelog: [...lifecycle.changelog, createChangelogEntry({
			actorId: input.actorId,
			at: input.now,
			event: "restored",
			message: input.changelogMessage,
			sequence: lifecycle.changelog.length + 1,
			templateId: lifecycle.templateId,
			templateVersion: lifecycle.latestVersion
		})]
	});
}
function assertProductionRenderableTemplateSnapshot(snapshot) {
	if (!PublishedTemplateSnapshotV1Schema.safeParse(snapshot).success) throw new Error("Production rendering requires an immutable published snapshot.");
	return snapshot;
}
function isProductionRenderableTemplateSnapshot(snapshot) {
	return PublishedTemplateSnapshotV1Schema.safeParse(snapshot).success;
}
function createLifecycleCheck(input) {
	return TemplateLifecycleCheckSchema.parse(input ?? {});
}
function checkAllowsPublish(check) {
	return check.status === "passed" || check.status === "warning";
}
function createDraftId(templateId, templateVersion) {
	return `${templateId}:draft:v${templateVersion}`;
}
function createPublishedSnapshotId(templateId, templateVersion) {
	return `${templateId}:published:v${templateVersion}`;
}
function createChangelogEntry(input) {
	return TemplateLifecycleChangelogEntrySchema.parse({
		id: `${input.templateId}:${input.event}:v${input.templateVersion}:${input.sequence}`,
		event: input.event,
		at: input.at,
		actorId: input.actorId,
		message: input.message,
		changes: input.changes ?? [],
		metadata: input.metadata ?? {}
	});
}
function cloneJson(value) {
	return JSON.parse(JSON.stringify(value));
}
function deepFreeze(value) {
	if (value === null || typeof value !== "object") return value;
	for (const key of Object.getOwnPropertyNames(value)) {
		const child = value[key];
		if (child !== null && typeof child === "object") deepFreeze(child);
	}
	return Object.freeze(value);
}
//#endregion
//#region src/rendering.ts
const RenderModeSchema = zod.z.enum([
	"preview",
	"production",
	"batch"
]);
const RendererSchema = zod.z.enum([
	"docraptor",
	"browser",
	"local"
]);
const RenderWarningSchema = zod.z.object({
	code: NonEmptyStringSchema,
	message: NonEmptyStringSchema,
	severity: zod.z.enum(["info", "warning"]).default("warning"),
	nodeId: IdentifierSchema.optional(),
	path: zod.z.array(NonEmptyStringSchema).default([]),
	details: JsonObjectSchema.optional()
}).strict();
const RenderErrorSchema = zod.z.object({
	code: NonEmptyStringSchema,
	message: NonEmptyStringSchema,
	retryable: zod.z.boolean().default(false),
	nodeId: IdentifierSchema.optional(),
	path: zod.z.array(NonEmptyStringSchema).default([]),
	details: JsonObjectSchema.optional()
}).strict();
const DocumentArtifactLocationSchema = zod.z.discriminatedUnion("type", [
	zod.z.object({
		type: zod.z.literal("storage"),
		storageKey: NonEmptyStringSchema
	}).strict(),
	zod.z.object({
		type: zod.z.literal("url"),
		url: UrlSchema
	}).strict(),
	zod.z.object({
		type: zod.z.literal("adapter_reference"),
		reference: NonEmptyStringSchema
	}).strict()
]);
const DocumentArtifactSchema = zod.z.object({
	id: IdentifierSchema,
	kind: zod.z.enum([
		"pdf",
		"html",
		"preview",
		"manifest"
	]),
	mimeType: NonEmptyStringSchema,
	sizeBytes: NonNegativeIntegerSchema,
	location: DocumentArtifactLocationSchema.optional(),
	storageKey: NonEmptyStringSchema.optional(),
	url: UrlSchema.optional(),
	hash: NonEmptyStringSchema.optional(),
	createdAt: IsoDateTimeSchema.optional()
}).strict().superRefine((artifact, context) => {
	if (artifact.location === void 0 && artifact.storageKey === void 0 && artifact.url === void 0) context.addIssue({
		code: "custom",
		message: "Artifacts require either location, storageKey, or url.",
		path: ["location"]
	});
});
const RenderRequestSchema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	template: DocumentTemplateV1Schema,
	data: JsonObjectSchema.default({}),
	mode: RenderModeSchema,
	renderer: RendererSchema.default("docraptor"),
	pdfSettings: PdfDocumentOutputSettingsSchema.optional(),
	requestedAt: IsoDateTimeSchema.optional()
}).strict();
const RenderResultSchema = zod.z.object({
	status: zod.z.enum([
		"success",
		"warning",
		"error"
	]),
	renderer: RendererSchema,
	artifact: DocumentArtifactSchema.optional(),
	warnings: zod.z.array(RenderWarningSchema).default([]),
	errors: zod.z.array(RenderErrorSchema).default([]),
	durationMs: NonNegativeNumberSchema.optional()
}).strict().superRefine((result, context) => {
	if (result.status === "error" && result.errors.length === 0) context.addIssue({
		code: "custom",
		message: "Error render results must include at least one error.",
		path: ["errors"]
	});
});
const RenderTimingSchema = zod.z.object({
	queuedAt: IsoDateTimeSchema.optional(),
	startedAt: IsoDateTimeSchema.optional(),
	completedAt: IsoDateTimeSchema.optional(),
	durationMs: NonNegativeNumberSchema.optional()
}).strict().default({});
const DocRaptorRenderMetadataSchema = zod.z.object({
	mode: zod.z.enum(["test", "production"]),
	media: zod.z.enum(["print", "screen"]).default("print"),
	requestUrl: UrlSchema.optional(),
	requestMethod: zod.z.enum(["POST", "GET"]).optional(),
	tag: NonEmptyStringSchema.optional(),
	test: zod.z.boolean(),
	statusId: NonEmptyStringSchema.optional(),
	statusUrl: UrlSchema.optional(),
	pageCount: NonNegativeIntegerSchema.optional(),
	validationErrors: zod.z.array(NonEmptyStringSchema).default([]),
	idempotencyKey: NonEmptyStringSchema.optional(),
	pdfMetadata: PdfDocumentMetadataSchema.optional(),
	pdfProfile: PdfDocumentProfileOptionsSchema.optional()
}).strict();
const DataSnapshotHashSchema = NonEmptyStringSchema;
const RenderMetadataV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	renderId: IdentifierSchema,
	tenantId: IdentifierSchema,
	actorId: IdentifierSchema.optional(),
	templateId: IdentifierSchema,
	templateVersion: zod.z.number().int().positive(),
	dataSnapshotHash: DataSnapshotHashSchema,
	mode: RenderModeSchema,
	renderer: RendererSchema,
	status: zod.z.enum([
		"queued",
		"running",
		"succeeded",
		"failed",
		"canceled"
	]),
	batchId: IdentifierSchema.optional(),
	pageSettings: DocumentPageSettingsSchema.optional(),
	docraptor: DocRaptorRenderMetadataSchema.optional(),
	timings: RenderTimingSchema,
	warnings: zod.z.array(RenderWarningSchema).default([]),
	errors: zod.z.array(RenderErrorSchema).default([]),
	artifacts: zod.z.array(DocumentArtifactSchema).default([]),
	createdAt: IsoDateTimeSchema.optional(),
	updatedAt: IsoDateTimeSchema.optional()
}).strict().superRefine((metadata, context) => {
	if (metadata.status === "failed" && metadata.errors.length === 0) context.addIssue({
		code: "custom",
		message: "Failed render metadata must include at least one error.",
		path: ["errors"]
	});
});
const RenderJobV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	tenantId: IdentifierSchema.optional(),
	actorId: IdentifierSchema.optional(),
	templateId: IdentifierSchema,
	templateVersion: zod.z.number().int().positive(),
	status: zod.z.enum([
		"queued",
		"running",
		"succeeded",
		"failed",
		"canceled"
	]),
	mode: RenderModeSchema,
	renderer: RendererSchema.default("docraptor"),
	dataSnapshotHash: DataSnapshotHashSchema,
	batchId: IdentifierSchema.optional(),
	pageSettings: DocumentPageSettingsSchema.optional(),
	docraptor: DocRaptorRenderMetadataSchema.optional(),
	timings: RenderTimingSchema,
	warnings: zod.z.array(RenderWarningSchema).default([]),
	errors: zod.z.array(RenderErrorSchema).default([]),
	artifacts: zod.z.array(DocumentArtifactSchema).default([]),
	createdAt: IsoDateTimeSchema.optional(),
	updatedAt: IsoDateTimeSchema.optional()
}).strict();
const BatchRunV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	templateId: IdentifierSchema,
	templateVersion: zod.z.number().int().positive(),
	tenantId: IdentifierSchema.optional(),
	actorId: IdentifierSchema.optional(),
	status: zod.z.enum([
		"draft",
		"queued",
		"running",
		"completed",
		"partial_success",
		"failed",
		"canceled"
	]),
	dataSnapshotHash: DataSnapshotHashSchema.optional(),
	jobIds: zod.z.array(IdentifierSchema).default([]),
	counts: zod.z.object({
		total: NonNegativeIntegerSchema,
		pending: NonNegativeIntegerSchema.default(0),
		running: NonNegativeIntegerSchema.default(0),
		succeeded: NonNegativeIntegerSchema.default(0),
		failed: NonNegativeIntegerSchema.default(0),
		canceled: NonNegativeIntegerSchema.default(0)
	}).strict(),
	createdAt: IsoDateTimeSchema.optional(),
	updatedAt: IsoDateTimeSchema.optional()
}).strict();
const AuditEventSchema = zod.z.object({
	id: IdentifierSchema,
	eventType: zod.z.enum([
		"template.created",
		"template.updated",
		"template.published",
		"template.archived",
		"template.duplicated",
		"template.restored",
		"render.started",
		"render.succeeded",
		"render.failed",
		"render.canceled",
		"batch.started",
		"batch.completed",
		"batch.failed",
		"batch.canceled",
		"batch.retried",
		"artifact.created",
		"artifact.downloaded"
	]),
	occurredAt: IsoDateTimeSchema,
	actor: zod.z.object({
		type: zod.z.enum(["user", "system"]),
		id: IdentifierSchema.optional()
	}).strict(),
	tenantId: IdentifierSchema.optional(),
	target: zod.z.object({
		type: zod.z.enum([
			"template",
			"render_job",
			"batch_run",
			"artifact"
		]),
		id: IdentifierSchema
	}).strict(),
	metadata: JsonObjectSchema.default({})
}).strict();
function createDataSnapshotHash(data) {
	return `fnv1a32:${hashFnv1a32(stableStringifyJsonValue(data))}`;
}
function stableStringifyJsonValue(value) {
	if (value === null) return "null";
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) return `[${value.map((item) => stableStringifyJsonValue(item)).join(",")}]`;
	return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stableStringifyJsonValue(item)}`).join(",")}}`;
}
function hashFnv1a32(value) {
	let hash = 2166136261;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash.toString(16).padStart(8, "0");
}
//#endregion
//#region src/batch.ts
const BatchGenerationStatusSchema = zod.z.enum([
	"draft",
	"queued",
	"running",
	"completed",
	"partial_success",
	"failed",
	"canceled"
]);
const BatchDocumentJobStatusSchema = zod.z.enum([
	"queued",
	"running",
	"succeeded",
	"failed",
	"canceled",
	"retry_queued"
]);
const BatchDatasetReferenceSchema = zod.z.object({
	type: zod.z.enum([
		"sample_fixture",
		"query",
		"static_records",
		"adapter_reference"
	]),
	id: IdentifierSchema,
	label: NonEmptyStringSchema.optional(),
	recordCount: NonNegativeIntegerSchema.optional(),
	dataSnapshotHash: DataSnapshotHashSchema.optional(),
	criteria: JsonObjectSchema.optional(),
	metadata: JsonObjectSchema.default({})
}).strict();
const BatchRecipientReferenceSchema = zod.z.object({
	id: IdentifierSchema,
	label: NonEmptyStringSchema.optional(),
	dataSnapshotHash: DataSnapshotHashSchema.optional(),
	metadata: JsonObjectSchema.default({})
}).strict();
const BatchFailureReasonSchema = zod.z.object({
	code: NonEmptyStringSchema,
	message: NonEmptyStringSchema,
	retryable: zod.z.boolean().default(false),
	path: zod.z.array(NonEmptyStringSchema).default([]),
	details: JsonObjectSchema.optional()
}).strict();
const BatchSafetyPreflightDiagnosticSchema = zod.z.object({
	code: NonEmptyStringSchema,
	severity: zod.z.enum([
		"info",
		"warning",
		"error"
	]),
	message: NonEmptyStringSchema,
	path: zod.z.array(NonEmptyStringSchema).default([]),
	nodeId: IdentifierSchema.optional(),
	suggestedFix: NonEmptyStringSchema.optional(),
	details: JsonObjectSchema.optional()
}).strict();
const BatchSafetyPreflightResultSchema = zod.z.object({
	ok: zod.z.boolean(),
	diagnostics: zod.z.array(BatchSafetyPreflightDiagnosticSchema).default([])
}).strict().superRefine((result, context) => {
	const hasBlockingError = result.diagnostics.some((diagnostic) => diagnostic.severity === "error");
	if (result.ok && hasBlockingError) context.addIssue({
		code: "custom",
		message: "Passing batch preflight cannot include blocking errors.",
		path: ["diagnostics"]
	});
});
const BatchGenerationDefinitionV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	status: zod.z.literal("draft").default("draft"),
	tenantId: IdentifierSchema.optional(),
	actorId: IdentifierSchema.optional(),
	templateSnapshotId: IdentifierSchema,
	templateId: IdentifierSchema,
	templateVersion: PositiveIntegerSchema,
	templateSnapshot: PublishedTemplateSnapshotV1Schema,
	dataset: BatchDatasetReferenceSchema,
	recipients: zod.z.array(BatchRecipientReferenceSchema).min(1),
	dataSnapshotHash: DataSnapshotHashSchema,
	mode: zod.z.literal("batch").default("batch"),
	renderer: RendererSchema.default("docraptor"),
	preflight: BatchSafetyPreflightResultSchema.default({
		ok: true,
		diagnostics: []
	}),
	createdAt: IsoDateTimeSchema.optional()
}).strict().superRefine((definition, context) => {
	if (definition.templateSnapshotId !== definition.templateSnapshot.id) context.addIssue({
		code: "custom",
		message: "Batch template snapshot id must match the snapshot.",
		path: ["templateSnapshotId"]
	});
	if (definition.templateId !== definition.templateSnapshot.templateId) context.addIssue({
		code: "custom",
		message: "Batch template id must match the published snapshot.",
		path: ["templateId"]
	});
	if (definition.templateVersion !== definition.templateSnapshot.templateVersion) context.addIssue({
		code: "custom",
		message: "Batch template version must match the published snapshot.",
		path: ["templateVersion"]
	});
	if (!definition.preflight.ok) context.addIssue({
		code: "custom",
		message: "Batch preflight must pass before jobs are created.",
		path: ["preflight", "ok"]
	});
});
const BatchDocumentJobV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	batchId: IdentifierSchema,
	recipient: BatchRecipientReferenceSchema,
	templateId: IdentifierSchema,
	templateVersion: PositiveIntegerSchema,
	templateSnapshotId: IdentifierSchema,
	status: BatchDocumentJobStatusSchema,
	attempt: PositiveIntegerSchema.default(1),
	maxAttempts: PositiveIntegerSchema.default(3),
	renderer: RendererSchema.default("docraptor"),
	dataSnapshotHash: DataSnapshotHashSchema,
	renderJobId: IdentifierSchema.optional(),
	failureReason: BatchFailureReasonSchema.optional(),
	artifacts: zod.z.array(DocumentArtifactSchema).default([]),
	createdAt: IsoDateTimeSchema.optional(),
	updatedAt: IsoDateTimeSchema.optional()
}).strict().superRefine((job, context) => {
	if (job.status === "failed" && job.failureReason === void 0) context.addIssue({
		code: "custom",
		message: "Failed batch document jobs require a failure reason.",
		path: ["failureReason"]
	});
	if (job.status !== "failed" && job.failureReason !== void 0) context.addIssue({
		code: "custom",
		message: "Only failed batch document jobs may carry a failure reason.",
		path: ["failureReason"]
	});
});
const BatchProgressSummarySchema = zod.z.object({
	total: NonNegativeIntegerSchema,
	pending: NonNegativeIntegerSchema,
	running: NonNegativeIntegerSchema,
	succeeded: NonNegativeIntegerSchema,
	failed: NonNegativeIntegerSchema,
	canceled: NonNegativeIntegerSchema,
	retryQueued: NonNegativeIntegerSchema,
	completionRatio: NonNegativeNumberSchema.max(1)
}).strict();
const BatchGenerationRunV1Schema = zod.z.object({
	version: zod.z.literal(1),
	id: IdentifierSchema,
	templateId: IdentifierSchema,
	templateVersion: PositiveIntegerSchema,
	templateSnapshotId: IdentifierSchema,
	tenantId: IdentifierSchema.optional(),
	actorId: IdentifierSchema.optional(),
	status: BatchGenerationStatusSchema,
	dataset: BatchDatasetReferenceSchema,
	dataSnapshotHash: DataSnapshotHashSchema,
	jobIds: zod.z.array(IdentifierSchema).default([]),
	progress: BatchProgressSummarySchema,
	preflight: BatchSafetyPreflightResultSchema,
	createdAt: IsoDateTimeSchema.optional(),
	updatedAt: IsoDateTimeSchema.optional()
}).strict();
const BatchResultManifestJobSchema = zod.z.object({
	id: IdentifierSchema,
	recipientId: IdentifierSchema,
	status: BatchDocumentJobStatusSchema,
	attempt: PositiveIntegerSchema,
	maxAttempts: PositiveIntegerSchema,
	artifactIds: zod.z.array(IdentifierSchema).default([]),
	failureReason: BatchFailureReasonSchema.optional()
}).strict();
const BatchResultManifestV1Schema = zod.z.object({
	version: zod.z.literal(1),
	batchId: IdentifierSchema,
	templateId: IdentifierSchema,
	templateVersion: PositiveIntegerSchema,
	templateSnapshotId: IdentifierSchema,
	tenantId: IdentifierSchema.optional(),
	actorId: IdentifierSchema.optional(),
	status: BatchGenerationStatusSchema,
	generatedAt: IsoDateTimeSchema,
	progress: BatchProgressSummarySchema,
	jobs: zod.z.array(BatchResultManifestJobSchema).default([]),
	failures: zod.z.array(BatchFailureReasonSchema).default([]),
	artifacts: zod.z.array(DocumentArtifactSchema).default([])
}).strict();
const BatchDownloadManifestV1Schema = zod.z.object({
	version: zod.z.literal(1),
	batchId: IdentifierSchema,
	kind: zod.z.literal("zip"),
	generatedAt: IsoDateTimeSchema,
	artifactCount: NonNegativeIntegerSchema,
	sizeBytes: NonNegativeIntegerSchema.optional(),
	artifacts: zod.z.array(DocumentArtifactSchema).default([]),
	failures: zod.z.array(BatchFailureReasonSchema).default([])
}).strict();
function createBatchGenerationDefinition(input) {
	const templateSnapshot = assertProductionRenderableTemplateSnapshot(input.templateSnapshot);
	const dataset = BatchDatasetReferenceSchema.parse(input.dataset);
	const recipients = zod.z.array(BatchRecipientReferenceSchema).min(1).parse(input.recipients);
	const preflight = BatchSafetyPreflightResultSchema.parse(input.preflight ?? {
		ok: true,
		diagnostics: []
	});
	if (!preflight.ok) throw new Error("Batch preflight must pass before jobs are created.");
	const dataSnapshotHash = dataset.dataSnapshotHash ?? createDataSnapshotHash({
		dataset,
		recipients,
		templateSnapshotId: templateSnapshot.id
	});
	return BatchGenerationDefinitionV1Schema.parse({
		version: 1,
		id: input.id,
		status: "draft",
		tenantId: input.tenantId,
		actorId: input.actorId,
		templateSnapshotId: templateSnapshot.id,
		templateId: templateSnapshot.templateId,
		templateVersion: templateSnapshot.templateVersion,
		templateSnapshot,
		dataset,
		recipients,
		dataSnapshotHash,
		mode: "batch",
		renderer: input.renderer ?? "docraptor",
		preflight,
		createdAt: input.createdAt
	});
}
function createBatchDocumentJobs(input) {
	const definition = BatchGenerationDefinitionV1Schema.parse(input.definition);
	const maxAttempts = input.maxAttempts ?? 3;
	return definition.recipients.map((recipient) => {
		const dataSnapshotHash = recipient.dataSnapshotHash ?? createRecipientSnapshotHash({
			batchId: definition.id,
			dataset: definition.dataset,
			recipient,
			templateSnapshot: definition.templateSnapshot
		});
		return BatchDocumentJobV1Schema.parse({
			version: 1,
			id: createBatchDocumentJobId(definition.id, recipient.id),
			batchId: definition.id,
			recipient,
			templateId: definition.templateId,
			templateVersion: definition.templateVersion,
			templateSnapshotId: definition.templateSnapshotId,
			status: "queued",
			attempt: 1,
			maxAttempts,
			renderer: definition.renderer,
			dataSnapshotHash,
			artifacts: [],
			createdAt: input.now,
			updatedAt: input.now
		});
	});
}
function createBatchGenerationRun(input) {
	const definition = BatchGenerationDefinitionV1Schema.parse(input.definition);
	const jobs = zod.z.array(BatchDocumentJobV1Schema).parse(input.jobs);
	const progress = summarizeBatchProgress(jobs);
	return BatchGenerationRunV1Schema.parse({
		version: 1,
		id: definition.id,
		templateId: definition.templateId,
		templateVersion: definition.templateVersion,
		templateSnapshotId: definition.templateSnapshotId,
		tenantId: definition.tenantId,
		actorId: definition.actorId,
		status: resolveBatchGenerationStatus(jobs, definition.status),
		dataset: definition.dataset,
		dataSnapshotHash: definition.dataSnapshotHash,
		jobIds: jobs.map((job) => job.id),
		progress,
		preflight: definition.preflight,
		createdAt: definition.createdAt ?? input.now,
		updatedAt: input.now
	});
}
function transitionBatchDocumentJob(input) {
	const job = BatchDocumentJobV1Schema.parse(input.job);
	const artifacts = input.artifacts ?? job.artifacts;
	const failureReason = input.status === "failed" ? BatchFailureReasonSchema.parse(input.failureReason) : void 0;
	if (input.status === "failed" && input.failureReason === void 0) throw new Error("Failed batch document jobs require a failure reason.");
	if (input.status === "retry_queued") throw new Error("Use createRetryBatchDocumentJob to move failed jobs into retry_queued.");
	return BatchDocumentJobV1Schema.parse({
		...job,
		status: input.status,
		renderJobId: input.renderJobId ?? job.renderJobId,
		failureReason,
		artifacts,
		updatedAt: input.now ?? job.updatedAt
	});
}
function createRetryBatchDocumentJob(input) {
	const job = BatchDocumentJobV1Schema.parse(input.job);
	if (job.status !== "failed") throw new Error("Only failed batch document jobs can be retried.");
	if (!job.failureReason?.retryable) throw new Error("Only retryable batch document job failures can be retried.");
	if (job.attempt >= job.maxAttempts) throw new Error("Batch document job has reached the maximum retry count.");
	return BatchDocumentJobV1Schema.parse({
		...job,
		status: "retry_queued",
		attempt: job.attempt + 1,
		failureReason: void 0,
		artifacts: [],
		updatedAt: input.now ?? job.updatedAt
	});
}
function cancelBatchGenerationRun(input) {
	const run = BatchGenerationRunV1Schema.parse(input.run);
	const canceledJobs = zod.z.array(BatchDocumentJobV1Schema).parse(input.jobs).map((job) => {
		if (isTerminalBatchDocumentJob(job)) return job;
		return BatchDocumentJobV1Schema.parse({
			...job,
			status: "canceled",
			updatedAt: input.now ?? job.updatedAt
		});
	});
	const progress = summarizeBatchProgress(canceledJobs);
	return {
		jobs: canceledJobs,
		run: BatchGenerationRunV1Schema.parse({
			...run,
			status: "canceled",
			progress,
			updatedAt: input.now ?? run.updatedAt
		})
	};
}
function summarizeBatchProgress(jobs) {
	const counts = {
		canceled: 0,
		failed: 0,
		pending: 0,
		retryQueued: 0,
		running: 0,
		succeeded: 0,
		total: jobs.length
	};
	for (const job of jobs) switch (job.status) {
		case "queued":
			counts.pending += 1;
			break;
		case "retry_queued":
			counts.retryQueued += 1;
			break;
		case "running":
			counts.running += 1;
			break;
		case "succeeded":
			counts.succeeded += 1;
			break;
		case "failed":
			counts.failed += 1;
			break;
		case "canceled":
			counts.canceled += 1;
			break;
	}
	const completed = counts.succeeded + counts.failed + counts.canceled;
	const completionRatio = counts.total === 0 ? 0 : roundToFourDecimals(completed / counts.total);
	return BatchProgressSummarySchema.parse({
		...counts,
		completionRatio
	});
}
function createBatchResultManifest(input) {
	const run = BatchGenerationRunV1Schema.parse(input.run);
	const jobs = zod.z.array(BatchDocumentJobV1Schema).parse(input.jobs);
	const artifacts = jobs.flatMap((job) => job.artifacts);
	const failures = jobs.flatMap((job) => job.failureReason === void 0 ? [] : [job.failureReason]);
	return BatchResultManifestV1Schema.parse({
		version: 1,
		batchId: run.id,
		templateId: run.templateId,
		templateVersion: run.templateVersion,
		templateSnapshotId: run.templateSnapshotId,
		tenantId: run.tenantId,
		actorId: run.actorId,
		status: resolveBatchGenerationStatus(jobs, run.status),
		generatedAt: input.now,
		progress: summarizeBatchProgress(jobs),
		jobs: jobs.map((job) => ({
			id: job.id,
			recipientId: job.recipient.id,
			status: job.status,
			attempt: job.attempt,
			maxAttempts: job.maxAttempts,
			artifactIds: job.artifacts.map((artifact) => artifact.id),
			failureReason: job.failureReason
		})),
		failures,
		artifacts
	});
}
function createBatchDownloadManifest(input) {
	const run = BatchGenerationRunV1Schema.parse(input.run);
	const jobs = zod.z.array(BatchDocumentJobV1Schema).parse(input.jobs);
	const artifacts = jobs.flatMap((job) => job.status === "succeeded" ? job.artifacts : []);
	const sizeBytes = artifacts.reduce((total, artifact) => total + artifact.sizeBytes, 0);
	const failures = jobs.flatMap((job) => job.failureReason === void 0 ? [] : [job.failureReason]);
	return BatchDownloadManifestV1Schema.parse({
		version: 1,
		batchId: run.id,
		kind: "zip",
		generatedAt: input.now,
		artifactCount: artifacts.length,
		sizeBytes,
		artifacts,
		failures
	});
}
function resolveBatchGenerationStatus(jobs, fallback) {
	if (jobs.length === 0) return fallback;
	const progress = summarizeBatchProgress(jobs);
	const active = progress.pending + progress.running + progress.retryQueued;
	const completed = progress.succeeded + progress.failed + progress.canceled;
	if (progress.canceled === progress.total) return "canceled";
	if (active > 0 && completed > 0) return "partial_success";
	if (active > 0) return progress.running > 0 ? "running" : "queued";
	if (progress.succeeded === progress.total) return "completed";
	if (progress.failed === progress.total) return "failed";
	if (progress.canceled > 0 && progress.succeeded === 0 && progress.failed === 0) return "canceled";
	return "partial_success";
}
function createRecipientSnapshotHash(input) {
	return createDataSnapshotHash({
		batchId: input.batchId,
		dataset: input.dataset,
		recipient: input.recipient,
		templateSnapshotId: input.templateSnapshot.id,
		templateVersion: input.templateSnapshot.templateVersion
	});
}
function createBatchDocumentJobId(batchId, recipientId) {
	return `${batchId}:${recipientId}`;
}
function isTerminalBatchDocumentJob(job) {
	return job.status === "succeeded" || job.status === "failed" || job.status === "canceled";
}
function roundToFourDecimals(value) {
	return Math.round(value * 1e4) / 1e4;
}
//#endregion
//#region src/formatters.ts
const defaultFormatterOptions = {
	currency: "USD",
	locale: "en-US",
	timeZone: "UTC"
};
const defaultVariableFormatters = Object.freeze({
	"address.multiline": formatAddress,
	"boolean.true_false": formatBooleanTrueFalse,
	"boolean.yes_no": formatBooleanYesNo,
	"currency.usd": formatCurrency,
	"date.medium": formatDate,
	"date.short": formatDate,
	"date_range.medium": formatDateRange,
	"datetime.medium": formatDateTime,
	email: formatText,
	"fiscal.period": formatFiscalPeriod,
	"fiscal.year": formatFiscalYear,
	id: formatText,
	"id.tax": formatText,
	image_url: formatText,
	"invoice.number": formatText,
	number: formatNumber,
	"number.integer": formatInteger,
	percentage: formatPercentage,
	"receipt.number": formatText,
	rich_text: formatText,
	text: formatText,
	url: formatText
});
function normalizeVariableFormatterOptions(options = {}) {
	return {
		currency: options.currency ?? defaultFormatterOptions.currency,
		locale: options.locale ?? defaultFormatterOptions.locale,
		timeZone: options.timeZone ?? defaultFormatterOptions.timeZone
	};
}
function formatVariableValue(input) {
	const formatterName = input.formatter ?? input.definition.formatter;
	const formatter = (input.formatters ?? defaultVariableFormatters)[formatterName];
	if (!formatter) return {
		diagnostics: [createDiagnostic$3({
			code: "unknown_formatter",
			definition: input.definition,
			formatter: formatterName,
			message: `Unknown variable formatter "${formatterName}".`,
			severity: "error"
		})],
		formattedValue: ""
	};
	const validationDiagnostic = validateFormatterValue(input.definition, formatterName, input.value);
	if (validationDiagnostic) return {
		diagnostics: [validationDiagnostic],
		formattedValue: ""
	};
	return formatter(input.value, {
		...normalizeVariableFormatterOptions(input),
		definition: input.definition,
		formatter: formatterName
	});
}
function createDiagnostic$3(input) {
	return {
		code: input.code,
		details: input.details,
		formatter: input.formatter,
		message: input.message,
		severity: input.severity,
		sourcePath: input.definition.sourcePath,
		variableKey: input.definition.key
	};
}
function validateFormatterValue(definition, formatter, value) {
	if (formatter === "date_range.medium") return validateDateRange(definition, formatter, value);
	if (formatter === "fiscal.year") return validateFiscalYear(definition, formatter, value);
	if (!isValueValidForType(definition.type, value)) return createDiagnostic$3({
		code: "invalid_variable_type",
		definition,
		formatter,
		message: `Variable "${definition.key}" expected ${definition.type}.`,
		severity: definition.required ? "error" : "warning"
	});
	if ((definition.type === "url" || definition.type === "image_url") && !isHttpUrl(value)) return createDiagnostic$3({
		code: "invalid_variable_value",
		definition,
		formatter,
		message: `Variable "${definition.key}" must be an http or https URL.`,
		severity: definition.required ? "error" : "warning"
	});
	if (definition.type === "date" && parseDate(value) === void 0) return createDiagnostic$3({
		code: "invalid_variable_value",
		definition,
		formatter,
		message: `Variable "${definition.key}" must be a valid date.`,
		severity: definition.required ? "error" : "warning"
	});
}
function validateDateRange(definition, formatter, value) {
	const range = readDateRange(value);
	if (range && parseDate(range.startDate) && parseDate(range.endDate)) return;
	return createDiagnostic$3({
		code: "invalid_variable_value",
		definition,
		formatter,
		message: `Variable "${definition.key}" must be a valid date range.`,
		severity: definition.required ? "error" : "warning"
	});
}
function validateFiscalYear(definition, formatter, value) {
	if (readFiscalYear(value) !== void 0) return;
	return createDiagnostic$3({
		code: "invalid_variable_value",
		definition,
		formatter,
		message: `Variable "${definition.key}" must be a valid fiscal year.`,
		severity: definition.required ? "error" : "warning"
	});
}
function isValueValidForType(type, value) {
	switch (type) {
		case "address": return isRecord$6(value);
		case "boolean": return typeof value === "boolean";
		case "currency":
		case "number":
		case "percentage": return typeof value === "number" && Number.isFinite(value);
		case "date": return typeof value === "string" || value instanceof Date;
		case "id":
		case "image_url":
		case "rich_text":
		case "string":
		case "url": return typeof value === "string";
	}
}
function formatText(value) {
	return {
		diagnostics: [],
		formattedValue: String(value)
	};
}
function formatCurrency(value, context) {
	return {
		diagnostics: [],
		formattedValue: new Intl.NumberFormat(context.locale, {
			currency: context.currency,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
			style: "currency"
		}).format(Number(value))
	};
}
function formatDate(value, context) {
	const date = parseDate(value);
	if (!date) return createInvalidFormatterValueResult(context);
	return {
		diagnostics: [],
		formattedValue: new Intl.DateTimeFormat(context.locale, {
			dateStyle: context.formatter === "date.short" ? "short" : "medium",
			timeZone: context.timeZone
		}).format(date)
	};
}
function formatDateTime(value, context) {
	const date = parseDate(value);
	if (!date) return createInvalidFormatterValueResult(context);
	return {
		diagnostics: [],
		formattedValue: new Intl.DateTimeFormat(context.locale, {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: context.timeZone
		}).format(date)
	};
}
function formatDateRange(value, context) {
	const range = readDateRange(value);
	const startDate = parseDate(range?.startDate);
	const endDate = parseDate(range?.endDate);
	if (!startDate || !endDate) return createInvalidFormatterValueResult(context);
	const formatter = new Intl.DateTimeFormat(context.locale, {
		dateStyle: "medium",
		timeZone: context.timeZone
	});
	return {
		diagnostics: [],
		formattedValue: `${formatter.format(startDate)} - ${formatter.format(endDate)}`
	};
}
function formatNumber(value, context) {
	return {
		diagnostics: [],
		formattedValue: new Intl.NumberFormat(context.locale, { maximumFractionDigits: 2 }).format(Number(value))
	};
}
function formatInteger(value, context) {
	return {
		diagnostics: [],
		formattedValue: new Intl.NumberFormat(context.locale, { maximumFractionDigits: 0 }).format(Number(value))
	};
}
function formatPercentage(value, context) {
	return {
		diagnostics: [],
		formattedValue: new Intl.NumberFormat(context.locale, {
			maximumFractionDigits: 2,
			style: "percent"
		}).format(Number(value))
	};
}
function formatAddress(value) {
	const address = isRecord$6(value) ? value : {};
	const streetLines = [address.line1, address.line2].filter(isNonEmptyString);
	const cityRegionPostal = [isNonEmptyString(address.city) ? address.city : void 0, [address.region, address.postalCode].filter(isNonEmptyString).join(" ")].filter(isNonEmptyString).join(", ");
	return {
		diagnostics: [],
		formattedValue: [
			...streetLines,
			cityRegionPostal,
			isNonEmptyString(address.country) ? address.country : void 0
		].filter(isNonEmptyString).join("\n")
	};
}
function formatFiscalPeriod(value) {
	if (typeof value === "number") return formatFiscalYear(value);
	if (typeof value === "string" && /^\d{4}$/.test(value)) return formatFiscalYear(Number(value));
	if (isRecord$6(value)) {
		const range = readDateRange(value);
		if (range) return {
			diagnostics: [],
			formattedValue: `${range.startDate} - ${range.endDate}`
		};
	}
	return {
		diagnostics: [],
		formattedValue: String(value)
	};
}
function formatFiscalYear(value) {
	return {
		diagnostics: [],
		formattedValue: `FY ${Number(value)}`
	};
}
function formatBooleanYesNo(value) {
	return {
		diagnostics: [],
		formattedValue: value === true ? "Yes" : "No"
	};
}
function formatBooleanTrueFalse(value) {
	return {
		diagnostics: [],
		formattedValue: value === true ? "True" : "False"
	};
}
function parseDate(value) {
	const date = value instanceof Date ? value : new Date(String(value));
	if (Number.isNaN(date.getTime())) return;
	return date;
}
function createInvalidFormatterValueResult(context) {
	return {
		diagnostics: [createDiagnostic$3({
			code: "invalid_variable_value",
			definition: context.definition,
			formatter: context.formatter,
			message: `Variable "${context.definition.key}" cannot be formatted by "${context.formatter}".`,
			severity: context.definition.required ? "error" : "warning"
		})],
		formattedValue: ""
	};
}
function readDateRange(value) {
	if (!isRecord$6(value)) return;
	const startDate = value.startDate ?? value.start;
	const endDate = value.endDate ?? value.end;
	if (startDate === void 0 || endDate === void 0) return;
	return {
		endDate,
		startDate
	};
}
function readFiscalYear(value) {
	if (typeof value === "number" && Number.isInteger(value)) return value;
	if (typeof value === "string" && /^\d{4}$/.test(value)) return Number(value);
}
function isHttpUrl(value) {
	if (typeof value !== "string") return false;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}
function isRecord$6(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
//#endregion
//#region src/variable-resolution.ts
function createVariableResolver(options = {}) {
	const registry = options.registry ?? coreVariableRegistry;
	const formatters = options.formatters ?? defaultVariableFormatters;
	return {
		resolve(variable, context) {
			return resolveWithOptions(variable, context, {
				...options,
				formatters,
				registry
			});
		},
		resolveMany(variables, context) {
			const values = variables.map((variable) => resolveWithOptions(variable, context, {
				...options,
				formatters,
				registry
			}));
			return {
				diagnostics: values.flatMap((value) => value.diagnostics),
				values
			};
		}
	};
}
function resolveVariableValue(input) {
	return createVariableResolver(input).resolve({
		fallback: input.fallback,
		formatter: input.formatter,
		key: input.key
	}, input.context);
}
function resolveVariableValues(input) {
	return createVariableResolver(input).resolveMany(input.variables, input.context);
}
function getValueAtDataPath(context, sourcePath) {
	let current = context;
	for (const segment of sourcePath.split(".")) {
		if (!isRecord$5(current) || !hasOwn(current, segment)) return { found: false };
		current = current[segment];
	}
	return {
		found: true,
		value: current
	};
}
function resolveWithOptions(variable, context, options) {
	const request = normalizeVariableRequest(variable);
	const definition = options.registry.get(request.key);
	if (!definition) return createUnknownVariableResult(request.key);
	const lookup = getValueAtDataPath(context, definition.sourcePath);
	if (!lookup.found || isMissingValue$1(lookup.value)) return resolveMissingValue(definition, request.formatter, request.fallback, options);
	return resolvePresentValue(definition, request.formatter, lookup.value, options);
}
function resolvePresentValue(definition, formatter, value, options) {
	const formatted = formatVariableValue({
		...options,
		definition,
		formatter,
		value
	});
	const status = resolveStatusFromDiagnostics(formatted.diagnostics);
	return {
		definition,
		diagnostics: formatted.diagnostics,
		formattedValue: formatted.formattedValue,
		formatter: formatter ?? definition.formatter,
		key: definition.key,
		rawValue: value,
		sourcePath: definition.sourcePath,
		status
	};
}
function resolveMissingValue(definition, formatter, fallbackOverride, options) {
	if (definition.required) return {
		definition,
		diagnostics: [{
			code: "missing_required_value",
			message: `Required variable "${definition.key}" is missing.`,
			severity: "error",
			sourcePath: definition.sourcePath,
			variableKey: definition.key
		}],
		formattedValue: "",
		formatter: formatter ?? definition.formatter,
		key: definition.key,
		sourcePath: definition.sourcePath,
		status: "missing_required"
	};
	const missingDiagnostic = {
		code: "missing_optional_value",
		message: `Optional variable "${definition.key}" is missing.`,
		severity: "warning",
		sourcePath: definition.sourcePath,
		variableKey: definition.key
	};
	const fallback = fallbackOverride ?? definition.fallback;
	if (fallback.mode !== "use_value") return {
		definition,
		diagnostics: [missingDiagnostic],
		formattedValue: "",
		formatter: formatter ?? definition.formatter,
		key: definition.key,
		sourcePath: definition.sourcePath,
		status: "missing_optional"
	};
	const formatted = formatVariableValue({
		...options,
		definition,
		formatter,
		value: fallback.value
	});
	return {
		definition,
		diagnostics: [missingDiagnostic, ...formatted.diagnostics],
		formattedValue: formatted.formattedValue,
		formatter: formatter ?? definition.formatter,
		key: definition.key,
		rawValue: fallback.value,
		sourcePath: definition.sourcePath,
		status: formatted.diagnostics.length > 0 ? resolveStatusFromDiagnostics(formatted.diagnostics) : "fallback"
	};
}
function createUnknownVariableResult(key) {
	return {
		diagnostics: [{
			code: "unknown_variable",
			message: `Unknown variable "${key}".`,
			severity: "error",
			variableKey: key
		}],
		formattedValue: "",
		key,
		status: "unknown_variable"
	};
}
function resolveStatusFromDiagnostics(diagnostics) {
	if (diagnostics.some((diagnostic) => diagnostic.code === "unknown_formatter")) return "unknown_formatter";
	if (diagnostics.some((diagnostic) => diagnostic.code === "invalid_variable_type" || diagnostic.code === "invalid_variable_value")) return "invalid_type";
	return "resolved";
}
function normalizeVariableRequest(variable) {
	return typeof variable === "string" ? { key: variable } : variable;
}
function isMissingValue$1(value) {
	return value === void 0 || value === null;
}
function isRecord$5(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function hasOwn(value, key) {
	return Object.hasOwn(value, key);
}
//#endregion
//#region src/tables.ts
function resolveTableRows(input) {
	const parseResult = TableBindingSchema.safeParse(input.binding);
	if (!parseResult.success) return {
		diagnostics: [createInvalidBindingDiagnostic$1(input.binding, parseResult.error.message)],
		rows: [],
		totalPlaceholders: []
	};
	const binding = parseResult.data;
	const source = getValueAtDataPath(input.context, binding.sourcePath);
	if (!source.found || source.value === void 0 || source.value === null) return {
		binding,
		diagnostics: [createDiagnostic$2({
			binding,
			code: "missing_table_source",
			message: `Table source "${binding.sourcePath}" is missing.`,
			severity: "warning"
		})],
		rows: [],
		totalPlaceholders: binding.totals
	};
	if (!Array.isArray(source.value)) return {
		binding,
		diagnostics: [createDiagnostic$2({
			binding,
			code: "non_array_table_source",
			details: { actualType: typeof source.value },
			message: `Table source "${binding.sourcePath}" must resolve to an array.`,
			severity: "warning"
		})],
		rows: [],
		totalPlaceholders: binding.totals
	};
	const diagnostics = [];
	return {
		binding,
		diagnostics,
		rows: limitRows(binding, source.value, diagnostics).map((value, renderedIndex) => resolveTableRow({
			binding,
			formatterOptions: input,
			renderedIndex,
			sourceIndex: renderedIndex,
			value,
			diagnostics
		})),
		totalPlaceholders: binding.totals
	};
}
function limitRows(binding, rows, diagnostics) {
	if (rows.length <= binding.maxRows) return rows;
	diagnostics.push(createDiagnostic$2({
		binding,
		code: "table_max_rows_exceeded",
		details: {
			maxRows: binding.maxRows,
			totalRows: rows.length
		},
		message: `Table "${binding.id}" limited ${rows.length} rows to ${binding.maxRows}.`,
		severity: "warning"
	}));
	return rows.slice(0, binding.maxRows);
}
function resolveTableRow(input) {
	return {
		cells: input.binding.columns.map((column) => resolveTableCell({
			binding: input.binding,
			column,
			formatterOptions: input.formatterOptions,
			rowValue: input.value,
			sourceIndex: input.sourceIndex,
			diagnostics: input.diagnostics
		})),
		renderedIndex: input.renderedIndex,
		sourceIndex: input.sourceIndex,
		value: input.value
	};
}
function resolveTableCell(input) {
	const lookup = getValueAtDataPath(isRecord$4(input.rowValue) ? input.rowValue : {}, input.column.sourcePath);
	const formatter = resolveColumnFormatter(input.column);
	if (!lookup.found || lookup.value === void 0 || lookup.value === null) {
		input.diagnostics.push(createUnsupportedColumnDiagnostic({
			binding: input.binding,
			column: input.column,
			message: `Table column "${input.column.key}" could not resolve "${input.column.sourcePath}".`,
			sourceIndex: input.sourceIndex
		}));
		return createEmptyCell(input.column, formatter);
	}
	const formatted = formatVariableValue({
		...input.formatterOptions,
		definition: createColumnDefinition(input.binding, input.column, formatter),
		formatter,
		value: lookup.value
	});
	if (formatted.diagnostics.length > 0) {
		input.diagnostics.push(createUnsupportedColumnDiagnostic({
			binding: input.binding,
			column: input.column,
			details: { formatterDiagnostics: formatted.diagnostics.map((diagnostic) => ({
				code: diagnostic.code,
				severity: diagnostic.severity
			})) },
			message: `Table column "${input.column.key}" could not format its value.`,
			sourceIndex: input.sourceIndex
		}));
		return createEmptyCell(input.column, formatter, lookup.value);
	}
	return {
		align: input.column.align,
		columnKey: input.column.key,
		displayValue: formatted.formattedValue,
		formatter,
		label: input.column.label,
		rawValue: lookup.value,
		sourcePath: input.column.sourcePath,
		width: input.column.width
	};
}
function createEmptyCell(column, formatter, rawValue) {
	return {
		align: column.align,
		columnKey: column.key,
		displayValue: "",
		formatter,
		label: column.label,
		rawValue,
		sourcePath: column.sourcePath,
		width: column.width
	};
}
function createColumnDefinition(binding, column, formatter) {
	return {
		description: `Phase 18 table column "${column.label}".`,
		documentCategories: ["financial_report"],
		fallback: { mode: "omit" },
		formatter,
		group: "financial_report",
		key: `table.${binding.id}.${column.key}`,
		label: column.label,
		privacy: "financial",
		required: false,
		sampleValue: "",
		sourcePath: column.sourcePath,
		type: column.type
	};
}
function resolveColumnFormatter(column) {
	if (column.formatter) return column.formatter;
	switch (column.type) {
		case "address": return "address.multiline";
		case "boolean": return "boolean.yes_no";
		case "currency": return "currency.usd";
		case "date": return "date.medium";
		case "id": return "id";
		case "image_url": return "image_url";
		case "number": return "number";
		case "percentage": return "percentage";
		case "rich_text": return "rich_text";
		case "string": return "text";
		case "url": return "url";
	}
}
function createUnsupportedColumnDiagnostic(input) {
	return createDiagnostic$2({
		binding: input.binding,
		code: "unsupported_table_column_value",
		columnKey: input.column.key,
		details: input.details,
		message: input.message,
		severity: "warning",
		sourceIndex: input.sourceIndex
	});
}
function createDiagnostic$2(input) {
	return {
		bindingId: input.binding.id,
		code: input.code,
		columnKey: input.columnKey,
		details: input.details,
		message: input.message,
		severity: input.severity,
		sourceIndex: input.sourceIndex,
		sourcePath: input.binding.sourcePath
	};
}
function createInvalidBindingDiagnostic$1(binding, message) {
	const bindingRecord = isRecord$4(binding) ? binding : {};
	const bindingId = readDiagnosticString$1(bindingRecord.id);
	const sourcePath = readDiagnosticString$1(bindingRecord.sourcePath);
	return {
		bindingId,
		code: "invalid_table_binding",
		details: { validationError: message },
		message: `Table binding is invalid: ${message}`,
		severity: "error",
		sourcePath
	};
}
function readDiagnosticString$1(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function isRecord$4(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/calculations.ts
const defaultPrecision = {
	roundingMode: "half_away_from_zero",
	scale: 2
};
const zeroBigInt = BigInt(0);
const oneBigInt = BigInt(1);
const twoBigInt = BigInt(2);
const tenBigInt = BigInt(10);
function calculateNumericAggregate(input) {
	const precision = normalizePrecision(input.precision);
	const rowsResult = resolveCalculationRows({
		context: input.context,
		sourcePath: input.sourcePath
	});
	const aggregate = calculateRowsAggregate({
		operation: input.operation,
		precision,
		rows: rowsResult.rows,
		sourcePath: input.sourcePath,
		valuePath: input.valuePath
	});
	return {
		...aggregate,
		diagnostics: [...rowsResult.diagnostics, ...aggregate.diagnostics]
	};
}
function calculateTableTotals(input) {
	const precision = normalizePrecision(input.precision);
	const parseResult = TableBindingSchema.safeParse(input.tableBinding);
	if (!parseResult.success) return {
		diagnostics: [{
			code: "invalid_table_calculation_binding",
			details: { validationError: parseResult.error.message },
			message: `Table binding is invalid for calculation: ${parseResult.error.message}`,
			severity: "error"
		}],
		totals: []
	};
	const binding = parseResult.data;
	const tableRows = resolveTableRows({
		binding,
		context: input.context
	});
	const rowValues = tableRows.rows.map((row) => row.value);
	const tableDiagnostics = tableRows.diagnostics.map((diagnostic) => ({
		code: diagnostic.code === "missing_table_source" ? "missing_calculation_source" : "invalid_table_calculation_binding",
		details: diagnostic.details,
		fieldPath: diagnostic.columnKey,
		message: diagnostic.message,
		severity: diagnostic.severity,
		sourceIndex: diagnostic.sourceIndex,
		sourcePath: diagnostic.sourcePath
	}));
	const columnByKey = new Map(binding.columns.map((column) => [column.key, column]));
	const totals = binding.totals.map((total) => {
		const column = columnByKey.get(total.columnKey);
		if (!column) {
			const diagnostic = {
				code: "missing_table_total_column",
				fieldPath: total.columnKey,
				message: `Table total references unknown column "${total.columnKey}".`,
				severity: "error",
				sourcePath: binding.sourcePath
			};
			return {
				columnKey: total.columnKey,
				diagnostics: [diagnostic],
				label: total.label,
				operation: total.operation,
				value: null
			};
		}
		const aggregate = calculateRowsAggregate({
			operation: total.operation,
			precision,
			rows: rowValues,
			sourcePath: binding.sourcePath,
			valuePath: column.sourcePath
		});
		return {
			columnKey: total.columnKey,
			diagnostics: aggregate.diagnostics,
			label: total.label,
			operation: total.operation,
			value: aggregate.value
		};
	});
	const totalDiagnostics = totals.flatMap((total) => total.diagnostics);
	return {
		binding,
		diagnostics: [...tableDiagnostics, ...totalDiagnostics],
		totals
	};
}
function calculateGroupedTableTotals(input) {
	const precision = normalizePrecision(input.precision);
	const rowsResult = resolveCalculationRows({
		context: input.context,
		sourcePath: input.sourcePath
	});
	const diagnostics = [...rowsResult.diagnostics];
	const groups = /* @__PURE__ */ new Map();
	const groupOrder = [];
	const groupedRows = [];
	const groupedSourceIndexes = [];
	rowsResult.rows.forEach((row, sourceIndex) => {
		const lookup = getValueAtDataPath(isRecord$3(row) ? row : {}, input.groupPath);
		if (!lookup.found || lookup.value === void 0 || lookup.value === null) {
			diagnostics.push(createFieldDiagnostic({
				code: "missing_calculation_field",
				fieldPath: input.groupPath,
				message: `Calculation field "${input.groupPath}" is missing.`,
				sourceIndex,
				sourcePath: input.sourcePath
			}));
			return;
		}
		const groupKey = String(lookup.value);
		if (!groups.has(groupKey)) {
			groups.set(groupKey, {
				rows: [],
				sourceIndexes: []
			});
			groupOrder.push(groupKey);
		}
		const group = groups.get(groupKey);
		group?.rows.push(row);
		group?.sourceIndexes.push(sourceIndex);
		groupedRows.push(row);
		groupedSourceIndexes.push(sourceIndex);
	});
	const calculatedGroups = groupOrder.map((groupKey) => {
		const group = groups.get(groupKey);
		const aggregate = calculateRowsAggregate({
			operation: "sum",
			precision,
			rows: group?.rows ?? [],
			sourcePath: input.sourcePath,
			sourceIndexes: group?.sourceIndexes,
			valuePath: input.valuePath
		});
		return {
			diagnostics: aggregate.diagnostics,
			key: groupKey,
			label: groupKey,
			total: aggregate.value ?? createDecimalValue(zeroBigInt, precision.scale, 0)
		};
	});
	const grandAggregate = calculateRowsAggregate({
		operation: "sum",
		precision,
		rows: groupedRows,
		sourcePath: input.sourcePath,
		sourceIndexes: groupedSourceIndexes,
		valuePath: input.valuePath
	});
	diagnostics.push(...grandAggregate.diagnostics);
	return {
		diagnostics,
		grandTotal: grandAggregate.value ?? createDecimalValue(zeroBigInt, precision.scale, 0),
		groups: calculatedGroups
	};
}
function calculateInvoiceTotals(input) {
	const precision = normalizePrecision(input.precision);
	const rowsResult = resolveCalculationRows({
		context: input.context,
		sourcePath: input.lineItemsPath
	});
	const diagnostics = [...rowsResult.diagnostics];
	let subtotal = zeroBigInt;
	let lineCount = 0;
	rowsResult.rows.forEach((row, sourceIndex) => {
		const lineAmount = resolveInvoiceLineAmount({
			amountPath: input.amountPath,
			diagnostics,
			lineItemsPath: input.lineItemsPath,
			precision,
			quantityPath: input.quantityPath,
			ratePath: input.ratePath,
			row,
			sourceIndex
		});
		if (!lineAmount.found || lineAmount.value === void 0) return;
		subtotal += lineAmount.value.minorUnits;
		lineCount += 1;
	});
	const discounts = input.discountPath ? resolveContextDecimalValue({
		context: input.context,
		fieldPath: input.discountPath,
		precision,
		sourcePath: input.discountPath
	}) : {
		found: true,
		value: {
			minorUnits: zeroBigInt,
			scale: precision.scale
		}
	};
	const taxes = input.taxPath ? resolveContextDecimalValue({
		context: input.context,
		fieldPath: input.taxPath,
		precision,
		sourcePath: input.taxPath
	}) : {
		found: true,
		value: {
			minorUnits: zeroBigInt,
			scale: precision.scale
		}
	};
	if (discounts.diagnostics) diagnostics.push(...discounts.diagnostics);
	if (taxes.diagnostics) diagnostics.push(...taxes.diagnostics);
	const discountMinorUnits = discounts.value?.minorUnits ?? zeroBigInt;
	const taxMinorUnits = taxes.value?.minorUnits ?? zeroBigInt;
	const discountCount = input.discountPath && discounts.value ? 1 : 0;
	const taxCount = input.taxPath && taxes.value ? 1 : 0;
	const total = subtotal - discountMinorUnits + taxMinorUnits;
	return {
		diagnostics,
		discounts: createDecimalValue(discountMinorUnits, precision.scale, discountCount),
		subtotal: createDecimalValue(subtotal, precision.scale, lineCount),
		taxes: createDecimalValue(taxMinorUnits, precision.scale, taxCount),
		total: createDecimalValue(total, precision.scale, lineCount)
	};
}
function calculateFinancialTotals(input) {
	const precision = normalizePrecision(input.precision);
	const rowsResult = resolveCalculationRows({
		context: input.context,
		sourcePath: input.sourcePath
	});
	const diagnostics = [...rowsResult.diagnostics];
	const incomeCategories = new Set(input.incomeCategories);
	const expenseCategories = new Set(input.expenseCategories);
	let income = zeroBigInt;
	let expense = zeroBigInt;
	let incomeCount = 0;
	let expenseCount = 0;
	rowsResult.rows.forEach((row, sourceIndex) => {
		const categoryLookup = getValueAtDataPath(isRecord$3(row) ? row : {}, input.categoryPath);
		if (!categoryLookup.found || categoryLookup.value === void 0 || categoryLookup.value === null) {
			diagnostics.push(createFieldDiagnostic({
				code: "missing_financial_category",
				fieldPath: input.categoryPath,
				message: `Financial category field "${input.categoryPath}" is missing.`,
				sourceIndex,
				sourcePath: input.sourcePath
			}));
			return;
		}
		const category = String(categoryLookup.value);
		const amount = resolveRowDecimalValue({
			diagnostics,
			fieldPath: input.amountPath,
			precision,
			row,
			sourceIndex,
			sourcePath: input.sourcePath
		});
		if (!amount.found || amount.value === void 0) return;
		if (incomeCategories.has(category)) {
			income += amount.value.minorUnits;
			incomeCount += 1;
			return;
		}
		if (expenseCategories.has(category)) {
			expense += absolute(amount.value.minorUnits);
			expenseCount += 1;
			return;
		}
		diagnostics.push({
			code: "unknown_financial_category",
			details: { category },
			fieldPath: input.categoryPath,
			message: `Financial category "${category}" is not configured as income or expense.`,
			severity: "warning",
			sourceIndex,
			sourcePath: input.sourcePath
		});
	});
	return {
		diagnostics,
		expense: createDecimalValue(expense, precision.scale, expenseCount),
		income: createDecimalValue(income, precision.scale, incomeCount),
		net: createDecimalValue(income - expense, precision.scale, rowsResult.rows.length)
	};
}
function calculateTaxDeductibleAmount(input) {
	const precision = normalizePrecision(input.precision);
	const diagnostics = [];
	const contribution = parseScalarDecimalValue({
		diagnostics,
		fieldPath: "contributionAmount",
		precision,
		value: input.contributionAmount
	});
	const goodsOrServices = parseScalarDecimalValue({
		diagnostics,
		fieldPath: "goodsOrServicesValue",
		precision,
		value: input.goodsOrServicesValue ?? "0"
	});
	const deductible = contribution.minorUnits - goodsOrServices.minorUnits;
	return {
		diagnostics,
		value: createDecimalValue(deductible < zeroBigInt ? zeroBigInt : deductible, precision.scale, 1)
	};
}
function calculateRowsAggregate(input) {
	const diagnostics = [];
	if (input.operation === "count") {
		const countMinorUnits = BigInt(input.rows.length) * scaleFactor(input.precision.scale);
		return {
			diagnostics,
			operation: input.operation,
			sourcePath: input.sourcePath,
			value: createDecimalValue(countMinorUnits, input.precision.scale, input.rows.length),
			valuePath: input.valuePath
		};
	}
	if (!input.valuePath) {
		diagnostics.push({
			code: "invalid_calculation_input",
			message: `Calculation operation "${input.operation}" requires a value path.`,
			severity: "error",
			sourcePath: input.sourcePath
		});
		return {
			diagnostics,
			operation: input.operation,
			sourcePath: input.sourcePath,
			value: null,
			valuePath: input.valuePath
		};
	}
	const values = input.rows.flatMap((row, rowIndex) => {
		const sourceIndex = input.sourceIndexes?.[rowIndex] ?? rowIndex;
		const value = resolveRowDecimalValue({
			diagnostics,
			fieldPath: input.valuePath ?? "",
			precision: input.precision,
			row,
			sourceIndex,
			sourcePath: input.sourcePath
		});
		return value.found && value.value ? [value.value.minorUnits] : [];
	});
	if (values.length === 0) {
		if (input.operation === "sum") return {
			diagnostics,
			operation: input.operation,
			sourcePath: input.sourcePath,
			value: createDecimalValue(zeroBigInt, input.precision.scale, 0),
			valuePath: input.valuePath
		};
		diagnostics.push({
			code: "empty_calculation_source",
			fieldPath: input.valuePath,
			message: `Calculation operation "${input.operation}" has no numeric values.`,
			severity: "warning",
			sourcePath: input.sourcePath
		});
		return {
			diagnostics,
			operation: input.operation,
			sourcePath: input.sourcePath,
			value: null,
			valuePath: input.valuePath
		};
	}
	const aggregate = calculateMinorUnitAggregate(input.operation, values);
	return {
		diagnostics,
		operation: input.operation,
		sourcePath: input.sourcePath,
		value: createDecimalValue(aggregate, input.precision.scale, values.length),
		valuePath: input.valuePath
	};
}
function calculateMinorUnitAggregate(operation, values) {
	switch (operation) {
		case "average": return divideMinorUnits(values.reduce((total, value) => total + value, zeroBigInt), BigInt(values.length));
		case "max": return values.reduce((maximum, value) => value > maximum ? value : maximum);
		case "min": return values.reduce((minimum, value) => value < minimum ? value : minimum);
		case "sum": return values.reduce((total, value) => total + value, zeroBigInt);
		case "count": return BigInt(values.length);
	}
}
function resolveCalculationRows(input) {
	const lookup = getValueAtDataPath(input.context, input.sourcePath);
	if (!lookup.found || lookup.value === void 0 || lookup.value === null) return {
		diagnostics: [{
			code: "missing_calculation_source",
			message: `Calculation source "${input.sourcePath}" is missing.`,
			severity: "warning",
			sourcePath: input.sourcePath
		}],
		rows: []
	};
	if (!Array.isArray(lookup.value)) return {
		diagnostics: [{
			code: "non_array_calculation_source",
			details: { actualType: typeof lookup.value },
			message: `Calculation source "${input.sourcePath}" must resolve to an array.`,
			severity: "warning",
			sourcePath: input.sourcePath
		}],
		rows: []
	};
	return {
		diagnostics: [],
		rows: lookup.value
	};
}
function resolveInvoiceLineAmount(input) {
	if (input.amountPath) {
		const amount = resolveRowDecimalValue({
			diagnostics: input.diagnostics,
			emitMissingDiagnostic: false,
			fieldPath: input.amountPath,
			precision: input.precision,
			row: input.row,
			sourceIndex: input.sourceIndex,
			sourcePath: input.lineItemsPath
		});
		if (amount.found && amount.value) return amount;
	}
	if (!input.quantityPath || !input.ratePath) {
		input.diagnostics.push(createFieldDiagnostic({
			code: "missing_calculation_field",
			fieldPath: input.amountPath ?? "amount",
			message: "Invoice line amount could not be resolved.",
			sourceIndex: input.sourceIndex,
			sourcePath: input.lineItemsPath
		}));
		return { found: false };
	}
	const quantityPrecision = {
		...input.precision,
		scale: 4
	};
	const ratePrecision = {
		...input.precision,
		scale: input.precision.scale + 4
	};
	const quantity = resolveRowDecimalValue({
		diagnostics: input.diagnostics,
		fieldPath: input.quantityPath,
		precision: quantityPrecision,
		row: input.row,
		sourceIndex: input.sourceIndex,
		sourcePath: input.lineItemsPath
	});
	const rate = resolveRowDecimalValue({
		diagnostics: input.diagnostics,
		fieldPath: input.ratePath,
		precision: ratePrecision,
		row: input.row,
		sourceIndex: input.sourceIndex,
		sourcePath: input.lineItemsPath
	});
	if (!quantity.found || !quantity.value || !rate.found || !rate.value) return { found: false };
	return {
		found: true,
		value: multiplyDecimalValues(quantity.value, rate.value, input.precision)
	};
}
function resolveContextDecimalValue(input) {
	const diagnostics = [];
	const lookup = getValueAtDataPath(input.context, input.sourcePath);
	if (!lookup.found || lookup.value === void 0 || lookup.value === null) {
		diagnostics.push(createFieldDiagnostic({
			code: "missing_calculation_field",
			fieldPath: input.fieldPath,
			message: `Calculation field "${input.fieldPath}" is missing.`,
			sourcePath: input.sourcePath
		}));
		return {
			diagnostics,
			found: false
		};
	}
	const parsed = parseDecimalValue(lookup.value, input.precision);
	if (!parsed) {
		diagnostics.push(createFieldDiagnostic({
			code: "non_numeric_calculation_value",
			fieldPath: input.fieldPath,
			message: `Calculation field "${input.fieldPath}" must be numeric.`,
			sourcePath: input.sourcePath
		}));
		return {
			diagnostics,
			found: false
		};
	}
	return {
		diagnostics,
		found: true,
		value: parsed
	};
}
function resolveRowDecimalValue(input) {
	const lookup = getValueAtDataPath(isRecord$3(input.row) ? input.row : {}, input.fieldPath);
	const emitMissingDiagnostic = input.emitMissingDiagnostic ?? true;
	if (!lookup.found || lookup.value === void 0 || lookup.value === null) {
		if (emitMissingDiagnostic) input.diagnostics.push(createFieldDiagnostic({
			code: "missing_calculation_field",
			fieldPath: input.fieldPath,
			message: `Calculation field "${input.fieldPath}" is missing.`,
			sourceIndex: input.sourceIndex,
			sourcePath: input.sourcePath
		}));
		return { found: false };
	}
	const parsed = parseDecimalValue(lookup.value, input.precision);
	if (!parsed) {
		input.diagnostics.push(createFieldDiagnostic({
			code: "non_numeric_calculation_value",
			fieldPath: input.fieldPath,
			message: `Calculation field "${input.fieldPath}" must be numeric.`,
			sourceIndex: input.sourceIndex,
			sourcePath: input.sourcePath
		}));
		return { found: false };
	}
	return {
		found: true,
		value: parsed
	};
}
function parseScalarDecimalValue(input) {
	const parsed = parseDecimalValue(input.value, input.precision);
	if (parsed) return parsed;
	input.diagnostics.push({
		code: "non_numeric_calculation_value",
		fieldPath: input.fieldPath,
		message: `Calculation field "${input.fieldPath}" must be numeric.`,
		severity: "warning"
	});
	return {
		minorUnits: zeroBigInt,
		scale: input.precision.scale
	};
}
function parseDecimalValue(value, precision) {
	if (typeof value !== "number" && typeof value !== "string") return;
	if (typeof value === "number" && !Number.isFinite(value)) return;
	const source = String(value).trim();
	if (/[eE]/.test(source)) return;
	const match = /^([+-])?(\d+)(?:\.(\d+))?$/.exec(source);
	if (!match) return;
	const sign = match[1] === "-" ? -oneBigInt : oneBigInt;
	const integerPart = match[2] ?? "0";
	const fractionPart = match[3] ?? "";
	const factor = scaleFactor(precision.scale);
	const paddedFraction = fractionPart.padEnd(precision.scale + 1, "0");
	const keptFraction = precision.scale ? paddedFraction.slice(0, precision.scale) : "";
	const nextDigit = paddedFraction[precision.scale] ?? "0";
	const integerUnits = BigInt(integerPart) * factor;
	const fractionUnits = keptFraction ? BigInt(keptFraction) : zeroBigInt;
	const roundingIncrement = nextDigit >= "5" ? oneBigInt : zeroBigInt;
	return {
		minorUnits: (integerUnits + fractionUnits + roundingIncrement) * sign,
		scale: precision.scale
	};
}
function multiplyDecimalValues(left, right, precision) {
	return {
		minorUnits: convertScale(left.minorUnits * right.minorUnits, left.scale + right.scale, precision.scale),
		scale: precision.scale
	};
}
function convertScale(minorUnits, fromScale, toScale) {
	if (fromScale === toScale) return minorUnits;
	if (fromScale < toScale) return minorUnits * scaleFactor(toScale - fromScale);
	return roundDivide(minorUnits, scaleFactor(fromScale - toScale));
}
function divideMinorUnits(minorUnits, divisor) {
	return roundDivide(minorUnits, divisor);
}
function roundDivide(dividend, divisor) {
	const sign = dividend < zeroBigInt ? -oneBigInt : oneBigInt;
	const absoluteDividend = absolute(dividend);
	return (absoluteDividend / divisor + (absoluteDividend % divisor * twoBigInt >= divisor ? oneBigInt : zeroBigInt)) * sign;
}
function createDecimalValue(minorUnits, scale, count) {
	return {
		count,
		decimal: formatDecimal(minorUnits, scale),
		minorUnits: minorUnits.toString(),
		scale
	};
}
function formatDecimal(minorUnits, scale) {
	const sign = minorUnits < zeroBigInt ? "-" : "";
	const absoluteValue = absolute(minorUnits);
	if (scale === 0) return `${sign}${absoluteValue.toString()}`;
	const padded = absoluteValue.toString().padStart(scale + 1, "0");
	return `${sign}${padded.slice(0, -scale)}.${padded.slice(-scale)}`;
}
function normalizePrecision(precision) {
	if (precision?.scale === void 0 || !Number.isInteger(precision.scale) || precision.scale < 0) return defaultPrecision;
	return {
		roundingMode: precision.roundingMode ?? defaultPrecision.roundingMode,
		scale: precision.scale
	};
}
function scaleFactor(scale) {
	let factor = oneBigInt;
	for (let index = 0; index < scale; index += 1) factor *= tenBigInt;
	return factor;
}
function absolute(value) {
	return value < zeroBigInt ? -value : value;
}
function createFieldDiagnostic(input) {
	return {
		code: input.code,
		fieldPath: input.fieldPath,
		message: input.message,
		severity: "warning",
		sourceIndex: input.sourceIndex,
		sourcePath: input.sourcePath
	};
}
function isRecord$3(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/dates.ts
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoDateTimeWithZonePattern = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;
function parseDeterministicIsoDate(value) {
	const dateMatch = isoDatePattern.exec(value);
	if (dateMatch) return parseIsoDateOnly(dateMatch);
	const dateTimeMatch = isoDateTimeWithZonePattern.exec(value);
	if (!dateTimeMatch || !isValidDateParts(dateTimeMatch)) return;
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? void 0 : timestamp;
}
function parseIsoDateOnly(match) {
	if (!isValidDateParts(match)) return;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	return Date.UTC(year, month - 1, day);
}
function isValidDateParts(match) {
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const timestamp = Date.UTC(year, month - 1, day);
	const date = new Date(timestamp);
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
//#endregion
//#region src/conditions.ts
const predicateByOperator = {
	contains: evaluateContains,
	equals: evaluateEquals,
	exists: evaluateExists,
	greater_than: evaluateGreaterThan,
	greater_than_or_equal: evaluateGreaterThanOrEqual,
	in: evaluateIn,
	is_empty: evaluateIsEmpty,
	is_not_empty: evaluateIsNotEmpty,
	less_than: evaluateLessThan,
	less_than_or_equal: evaluateLessThanOrEqual,
	not_contains: evaluateNotContains,
	not_equals: evaluateNotEquals,
	not_exists: evaluateNotExists,
	not_in: evaluateNotIn
};
function evaluateConditionalRule(input) {
	const lookup = getValueAtDataPath(input.context, input.rule.fieldPath);
	const actualValue = lookup.found ? lookup.value : void 0;
	const operator = input.rule.operator;
	if (shouldWarnForMissingField(operator, lookup.found, actualValue)) return createResult({
		actualValue,
		diagnostics: [createDiagnostic$1({
			code: "missing_condition_field",
			fieldPath: input.rule.fieldPath,
			message: `Conditional field "${input.rule.fieldPath}" is missing.`,
			operator,
			severity: "warning"
		})],
		expectedValue: input.rule.value,
		fieldPath: input.rule.fieldPath,
		matched: false,
		operator
	});
	const predicate = predicateByOperator[operator];
	return predicate({
		actualValue,
		expectedValue: input.rule.value,
		fieldPath: input.rule.fieldPath,
		operator
	});
}
function evaluateConditionalRules(input) {
	const results = input.rules.map((rule) => evaluateConditionalRule({
		context: input.context,
		rule
	}));
	return {
		diagnostics: results.flatMap((result) => result.diagnostics),
		matched: results.every((result) => result.matched),
		results
	};
}
function evaluateExists(input) {
	return createResult({
		...input,
		matched: !isMissingValue(input.actualValue)
	});
}
function evaluateNotExists(input) {
	return createResult({
		...input,
		matched: isMissingValue(input.actualValue)
	});
}
function evaluateEquals(input) {
	const comparison = compareJsonValues(input.actualValue, input.expectedValue);
	if (comparison === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: comparison
	});
}
function evaluateNotEquals(input) {
	const comparison = compareJsonValues(input.actualValue, input.expectedValue);
	if (comparison === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: !comparison
	});
}
function evaluateGreaterThan(input) {
	return evaluateOrderedComparison(input, (left, right) => left > right);
}
function evaluateGreaterThanOrEqual(input) {
	return evaluateOrderedComparison(input, (left, right) => left >= right);
}
function evaluateLessThan(input) {
	return evaluateOrderedComparison(input, (left, right) => left < right);
}
function evaluateLessThanOrEqual(input) {
	return evaluateOrderedComparison(input, (left, right) => left <= right);
}
function evaluateContains(input) {
	const contains = evaluateContainment(input.actualValue, input.expectedValue);
	if (contains === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: contains
	});
}
function evaluateNotContains(input) {
	const contains = evaluateContainment(input.actualValue, input.expectedValue);
	if (contains === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: !contains
	});
}
function evaluateIsEmpty(input) {
	return createResult({
		...input,
		matched: isEmptyValue(input.actualValue)
	});
}
function evaluateIsNotEmpty(input) {
	return createResult({
		...input,
		matched: !isEmptyValue(input.actualValue)
	});
}
function evaluateIn(input) {
	const contains = evaluateExpectedArrayContainment(input);
	if (contains === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: contains
	});
}
function evaluateNotIn(input) {
	const contains = evaluateExpectedArrayContainment(input);
	if (contains === void 0) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: !contains
	});
}
function evaluateOrderedComparison(input, predicate) {
	const actualComparable = toComparableValue(input.actualValue);
	const expectedComparable = toComparableValue(input.expectedValue);
	if (actualComparable === void 0 || expectedComparable === void 0 || actualComparable.kind !== expectedComparable.kind) return createInvalidValueResult(input);
	return createResult({
		...input,
		matched: predicate(actualComparable.value, expectedComparable.value)
	});
}
function evaluateContainment(actualValue, expectedValue) {
	if (typeof actualValue === "string" && typeof expectedValue === "string") return actualValue.includes(expectedValue);
	if (Array.isArray(actualValue)) return actualValue.some((item) => compareJsonValues(item, expectedValue));
}
function evaluateExpectedArrayContainment(input) {
	if (!Array.isArray(input.expectedValue)) return;
	return input.expectedValue.some((item) => compareJsonValues(input.actualValue, item));
}
function shouldWarnForMissingField(operator, found, value) {
	if (operator === "exists" || operator === "not_exists") return false;
	if (operator === "is_empty" || operator === "is_not_empty") return false;
	return !found || isMissingValue(value);
}
function compareJsonValues(actualValue, expectedValue) {
	const actualJson = stableJsonStringify(actualValue);
	const expectedJson = stableJsonStringify(expectedValue);
	if (actualJson === void 0 || expectedJson === void 0) return;
	return actualJson === expectedJson;
}
function stableJsonStringify(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : void 0;
	if (Array.isArray(value)) {
		const items = value.map((item) => stableJsonStringify(item));
		return items.every((item) => item !== void 0) ? `[${items.join(",")}]` : void 0;
	}
	if (isRecord$2(value)) {
		const items = Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)).map(([key, item]) => {
			const serializedItem = stableJsonStringify(item);
			return serializedItem === void 0 ? void 0 : `${JSON.stringify(key)}:${serializedItem}`;
		});
		return items.every((item) => item !== void 0) ? `{${items.join(",")}}` : void 0;
	}
}
function toComparableValue(value) {
	if (typeof value === "number" && Number.isFinite(value)) return {
		kind: "number",
		value
	};
	if (typeof value !== "string") return;
	const timestamp = parseDeterministicIsoDate(value);
	return timestamp === void 0 ? void 0 : {
		kind: "date",
		value: timestamp
	};
}
function isEmptyValue(value) {
	if (isMissingValue(value)) return true;
	if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
	if (isRecord$2(value)) return Object.keys(value).length === 0;
	return false;
}
function isMissingValue(value) {
	return value === void 0 || value === null;
}
function createInvalidValueResult(input) {
	return createResult({
		...input,
		diagnostics: [createDiagnostic$1({
			code: "invalid_condition_value",
			fieldPath: input.fieldPath,
			message: `Conditional operator "${input.operator}" cannot compare field "${input.fieldPath}" with the provided value.`,
			operator: input.operator,
			severity: "error"
		})],
		matched: false
	});
}
function createResult(input) {
	return {
		actualValue: input.actualValue,
		diagnostics: input.diagnostics ?? [],
		expectedValue: input.expectedValue,
		fieldPath: input.fieldPath,
		matched: input.matched,
		operator: input.operator
	};
}
function createDiagnostic$1(input) {
	return input;
}
function isRecord$2(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/migration.ts
const LegacyPdfTemplateArtifactSchema = zod.z.object({
	artifactId: IdentifierSchema,
	location: DocumentArtifactLocationSchema.optional(),
	createdAt: IsoDateTimeSchema.optional(),
	metadata: JsonObjectSchema.default({})
}).strict();
const LegacyPdfTemplateReferenceSchema = zod.z.object({
	engine: zod.z.literal("unlayer"),
	legacyTemplateId: IdentifierSchema,
	tenantId: IdentifierSchema.optional(),
	name: NonEmptyStringSchema,
	category: TemplateCategorySchema.optional(),
	sourceSystem: NonEmptyStringSchema.default("unlayer"),
	designJsonRef: NonEmptyStringSchema.optional(),
	htmlArtifactRef: NonEmptyStringSchema.optional(),
	pdfArtifacts: zod.z.array(LegacyPdfTemplateArtifactSchema).default([]),
	metadata: JsonObjectSchema.default({})
}).strict();
const UnlayerUnsupportedFeatureCodeSchema = zod.z.enum([
	"custom_javascript",
	"custom_css",
	"dynamic_data_source",
	"ecommerce_block",
	"external_font",
	"form_submission",
	"provider_specific_asset",
	"raw_html_block",
	"unsupported_merge_tag",
	"unknown_block",
	"video_block"
]);
const UnlayerMigrationSeveritySchema = zod.z.enum([
	"info",
	"warning",
	"error"
]);
const UnlayerUnsupportedFeatureSchema = zod.z.object({
	code: UnlayerUnsupportedFeatureCodeSchema,
	severity: UnlayerMigrationSeveritySchema.default("warning"),
	message: NonEmptyStringSchema,
	path: zod.z.array(NonEmptyStringSchema).default([]),
	suggestedManualAction: NonEmptyStringSchema.optional(),
	metadata: JsonObjectSchema.default({})
}).strict();
const UnlayerMigrationStrategySchema = zod.z.enum([
	"manual_rebuild_with_report",
	"html_import_report_only",
	"side_by_side_review"
]);
const UnlayerMigrationStatusSchema = zod.z.enum([
	"ready_for_manual_rebuild",
	"needs_manual_rebuild",
	"blocked",
	"completed"
]);
const UnlayerMigrationReportV1Schema = zod.z.object({
	version: zod.z.literal(1).default(1),
	id: IdentifierSchema,
	legacyTemplate: LegacyPdfTemplateReferenceSchema,
	targetEngine: zod.z.literal("asym_pdf_document_builder").default("asym_pdf_document_builder"),
	strategy: UnlayerMigrationStrategySchema.default("manual_rebuild_with_report"),
	status: UnlayerMigrationStatusSchema,
	unsupportedFeatures: zod.z.array(UnlayerUnsupportedFeatureSchema).default([]),
	unsupportedFeatureCount: NonNegativeIntegerSchema,
	createdAt: IsoDateTimeSchema.optional(),
	createdByActorId: IdentifierSchema.optional(),
	metadata: JsonObjectSchema.default({})
}).strict();
function createUnlayerMigrationReport(input) {
	const legacyTemplate = LegacyPdfTemplateReferenceSchema.parse(input.legacyTemplate);
	const unsupportedFeatures = zod.z.array(UnlayerUnsupportedFeatureSchema).parse(input.unsupportedFeatures ?? []);
	const status = input.status ?? inferMigrationStatus(unsupportedFeatures);
	return UnlayerMigrationReportV1Schema.parse({
		version: 1,
		id: input.id,
		legacyTemplate,
		targetEngine: "asym_pdf_document_builder",
		strategy: input.strategy ?? "manual_rebuild_with_report",
		status,
		unsupportedFeatures,
		unsupportedFeatureCount: unsupportedFeatures.length,
		createdAt: input.createdAt,
		createdByActorId: input.createdByActorId,
		metadata: input.metadata ?? {}
	});
}
function inferMigrationStatus(unsupportedFeatures) {
	if (unsupportedFeatures.length === 0) return "ready_for_manual_rebuild";
	if (unsupportedFeatures.some((feature) => feature.severity === "error") || unsupportedFeatures.some((feature) => feature.severity === "warning")) return "needs_manual_rebuild";
	return "ready_for_manual_rebuild";
}
const UnlayerHtmlImportRequestSchema = zod.z.object({
	legacyTemplate: LegacyPdfTemplateReferenceSchema,
	html: NonEmptyStringSchema,
	mode: zod.z.literal("report_only").default("report_only"),
	claimsLosslessConversion: zod.z.literal(false).default(false),
	metadata: JsonObjectSchema.default({})
}).strict();
const PdfBuilderFeatureFlagRolloutModeSchema = zod.z.enum([
	"legacy_only",
	"native_preview",
	"native_new_templates",
	"native_publish",
	"native_batch"
]);
const PdfBuilderFeatureFlagContractSchema = zod.z.object({
	flagName: NonEmptyStringSchema,
	enabled: zod.z.boolean(),
	tenantId: IdentifierSchema.optional(),
	rolloutMode: PdfBuilderFeatureFlagRolloutModeSchema.default("legacy_only"),
	fallbackEngine: zod.z.literal("unlayer").default("unlayer"),
	metadata: JsonObjectSchema.default({})
}).strict();
const PdfTemplateEngineSelectionReasonSchema = zod.z.enum([
	"feature_flag_disabled",
	"legacy_template_pass_through",
	"native_feature_enabled"
]);
const PdfTemplateEditorSelectionSchema = zod.z.enum(["legacy_unlayer", "native_pdf_builder"]);
const PdfTemplateEngineSelectionResultSchema = zod.z.object({
	selectedEngine: DocumentEngineSchema,
	editor: PdfTemplateEditorSelectionSchema,
	reason: PdfTemplateEngineSelectionReasonSchema
}).strict();
function selectPdfTemplateEngine(input) {
	const templateEngine = DocumentEngineSchema.parse(input.templateEngine);
	const featureFlag = PdfBuilderFeatureFlagContractSchema.parse(input.featureFlag);
	if (templateEngine === "unlayer") return PdfTemplateEngineSelectionResultSchema.parse({
		selectedEngine: "unlayer",
		editor: "legacy_unlayer",
		reason: "legacy_template_pass_through"
	});
	if (!featureFlag.enabled) return PdfTemplateEngineSelectionResultSchema.parse({
		selectedEngine: featureFlag.fallbackEngine,
		editor: "legacy_unlayer",
		reason: "feature_flag_disabled"
	});
	return PdfTemplateEngineSelectionResultSchema.parse({
		selectedEngine: "asym_pdf_document_builder",
		editor: "native_pdf_builder",
		reason: "native_feature_enabled"
	});
}
const UnlayerComparisonDifferenceCodeSchema = zod.z.enum([
	"asset_mismatch",
	"content_mismatch",
	"layout_mismatch",
	"metadata_mismatch",
	"missing_native_section",
	"unsupported_legacy_feature"
]);
const UnlayerComparisonDifferenceSchema = zod.z.object({
	code: UnlayerComparisonDifferenceCodeSchema,
	severity: UnlayerMigrationSeveritySchema.default("warning"),
	message: NonEmptyStringSchema,
	path: zod.z.array(NonEmptyStringSchema).default([]),
	metadata: JsonObjectSchema.default({})
}).strict();
const UnlayerSideBySideComparisonStatusSchema = zod.z.enum([
	"matches",
	"differences_found",
	"blocked"
]);
const UnlayerSideBySideComparisonRequestSchema = zod.z.object({
	legacyTemplate: LegacyPdfTemplateReferenceSchema,
	nativeTemplateId: IdentifierSchema,
	metadata: JsonObjectSchema.default({})
}).strict();
const UnlayerSideBySideComparisonResultSchema = zod.z.object({
	legacyTemplateId: IdentifierSchema,
	nativeTemplateId: IdentifierSchema,
	status: UnlayerSideBySideComparisonStatusSchema,
	differences: zod.z.array(UnlayerComparisonDifferenceSchema).default([]),
	metadata: JsonObjectSchema.default({})
}).strict();
//#endregion
//#region src/page-flow.ts
const DocumentPageBreakAttributesSchema = zod.z.object({
	id: IdentifierSchema.optional(),
	label: NonEmptyStringSchema.optional()
}).strict();
const DocumentPageBreakNodeSchema = zod.z.object({
	type: zod.z.literal("pageBreak"),
	attrs: DocumentPageBreakAttributesSchema.default({})
}).strict();
const PageFlowControlAttributesSchema = zod.z.object({
	keepTogether: zod.z.boolean().optional(),
	startOnNewPage: zod.z.boolean().optional(),
	avoidBreakAfter: zod.z.boolean().optional(),
	avoidRowSplit: zod.z.boolean().optional()
}).strict();
//#endregion
//#region src/repeaters.ts
function resolveRepeaterItems(input) {
	const parseResult = RepeaterBindingSchema.safeParse(input.binding);
	if (!parseResult.success) return {
		diagnostics: [createInvalidBindingDiagnostic(input.binding, parseResult.error.message)],
		items: []
	};
	const binding = parseResult.data;
	const source = getValueAtDataPath(input.context, binding.sourcePath);
	if (!source.found || source.value === void 0 || source.value === null) return {
		diagnostics: [createDiagnostic({
			binding,
			code: "missing_repeater_source",
			message: `Repeater source "${binding.sourcePath}" is missing.`,
			severity: "warning"
		})],
		items: []
	};
	if (!Array.isArray(source.value)) return {
		diagnostics: [createDiagnostic({
			binding,
			code: "non_array_repeater_source",
			message: `Repeater source "${binding.sourcePath}" must resolve to an array.`,
			severity: "warning",
			details: { actualType: typeof source.value }
		})],
		items: []
	};
	const diagnostics = [];
	const candidates = source.value.map((value, sourceIndex) => ({
		sourceIndex,
		value
	}));
	return {
		diagnostics,
		items: limitCandidates(binding, sortCandidates(binding, filterCandidates({
			binding,
			context: input.context
		}, candidates, diagnostics)), diagnostics).map((candidate, renderedIndex) => ({
			context: createScopedRepeaterContext({
				context: input.context,
				indexAlias: binding.indexAlias,
				itemAlias: binding.itemAlias,
				itemValue: candidate.value,
				renderedIndex
			}),
			renderedIndex,
			sourceIndex: candidate.sourceIndex,
			value: candidate.value
		}))
	};
}
function createScopedRepeaterContext(input) {
	const withItem = setValueAtDataPath(input.context, input.itemAlias, input.itemValue);
	if (input.indexAlias === void 0) return withItem;
	return setValueAtDataPath(withItem, input.indexAlias, input.renderedIndex ?? 0);
}
function filterCandidates(input, candidates, diagnostics) {
	const filters = input.binding.filters;
	if (filters.length === 0) return candidates;
	return candidates.filter((candidate) => {
		const result = evaluateConditionalRules({
			context: createScopedRepeaterContext({
				context: input.context,
				indexAlias: input.binding.indexAlias,
				itemAlias: input.binding.itemAlias,
				itemValue: candidate.value,
				renderedIndex: candidate.sourceIndex
			}),
			rules: filters
		});
		diagnostics.push(...result.diagnostics.map((diagnostic) => toRepeaterDiagnostic(input.binding, candidate.sourceIndex, diagnostic)));
		return result.matched;
	});
}
function sortCandidates(binding, candidates) {
	if (!binding.sort) return candidates;
	const directionMultiplier = binding.sort.direction === "desc" ? -1 : 1;
	return [...candidates].sort((left, right) => {
		const comparison = compareSortValues(readSortValue(left.value, binding), readSortValue(right.value, binding));
		if (comparison !== 0) return comparison * directionMultiplier;
		return left.sourceIndex - right.sourceIndex;
	});
}
function limitCandidates(binding, candidates, diagnostics) {
	if (candidates.length <= binding.maxItems) return candidates;
	diagnostics.push(createDiagnostic({
		binding,
		code: "repeater_max_items_exceeded",
		details: {
			maxItems: binding.maxItems,
			totalItems: candidates.length
		},
		message: `Repeater "${binding.id}" limited ${candidates.length} items to ${binding.maxItems}.`,
		severity: "warning"
	}));
	return candidates.slice(0, binding.maxItems);
}
function readSortValue(value, binding) {
	if (!binding.sort) return;
	const itemLookup = getValueAtDataPath(isRecord$1(value) ? value : {}, binding.sort.fieldPath);
	if (itemLookup.found) return itemLookup.value;
	const scopedLookup = getValueAtDataPath(createScopedRepeaterContext({
		context: {},
		itemAlias: binding.itemAlias,
		itemValue: value
	}), binding.sort.fieldPath);
	return scopedLookup.found ? scopedLookup.value : void 0;
}
function compareSortValues(left, right) {
	const leftValue = normalizeSortValue(left);
	const rightValue = normalizeSortValue(right);
	if (!leftValue && !rightValue) return 0;
	if (!leftValue) return 1;
	if (!rightValue) return -1;
	if (leftValue.kind !== rightValue.kind) return leftValue.kind.localeCompare(rightValue.kind);
	if (leftValue.value < rightValue.value) return -1;
	if (leftValue.value > rightValue.value) return 1;
	return 0;
}
function normalizeSortValue(value) {
	if (typeof value === "number" && Number.isFinite(value)) return {
		kind: "number",
		value
	};
	if (typeof value === "boolean") return {
		kind: "boolean",
		value: value ? 1 : 0
	};
	if (typeof value !== "string") return;
	const timestamp = parseDeterministicIsoDate(value);
	return timestamp === void 0 ? {
		kind: "string",
		value: value.toLowerCase()
	} : {
		kind: "number",
		value: timestamp
	};
}
function setValueAtDataPath(context, path, value) {
	const [head, ...tail] = path.split(".");
	const base = { ...context };
	if (tail.length === 0) return {
		...base,
		[head]: value
	};
	const existing = base[head];
	const nested = isRecord$1(existing) ? existing : {};
	return {
		...base,
		[head]: setValueAtDataPath(nested, tail.join("."), value)
	};
}
function toRepeaterDiagnostic(binding, sourceIndex, diagnostic) {
	return createDiagnostic({
		binding,
		code: diagnostic.severity === "error" ? "repeater_filter_error" : "repeater_filter_warning",
		details: {
			conditionCode: diagnostic.code,
			fieldPath: diagnostic.fieldPath,
			operator: diagnostic.operator
		},
		message: diagnostic.message,
		severity: diagnostic.severity,
		sourceIndex
	});
}
function createDiagnostic(input) {
	return {
		bindingId: input.binding.id,
		code: input.code,
		details: input.details,
		itemAlias: input.binding.itemAlias,
		message: input.message,
		severity: input.severity,
		sourceIndex: input.sourceIndex,
		sourcePath: input.binding.sourcePath
	};
}
function createInvalidBindingDiagnostic(binding, message) {
	const bindingRecord = isRecord$1(binding) ? binding : {};
	const bindingId = readDiagnosticString(bindingRecord.id);
	const itemAlias = readDiagnosticString(bindingRecord.itemAlias);
	const sourcePath = readDiagnosticString(bindingRecord.sourcePath);
	return {
		bindingId,
		code: "invalid_repeater_binding",
		details: { validationError: message },
		itemAlias: itemAlias || void 0,
		message: `Repeater binding is invalid: ${message}`,
		severity: "error",
		sourcePath
	};
}
function readDiagnosticString(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function isRecord$1(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/security.ts
const PdfSecurityActorSchema = zod.z.object({
	type: zod.z.enum(["user", "system"]),
	id: IdentifierSchema.optional()
}).strict().superRefine((actor, context) => {
	if (actor.type === "user" && actor.id === void 0) context.addIssue({
		code: "custom",
		message: "User actors require an id.",
		path: ["id"]
	});
});
const PdfSecurityPermissionSchema = zod.z.enum([
	"template.edit",
	"template.publish",
	"render.preview",
	"render.production",
	"batch.start",
	"asset.read",
	"asset.render_safe_url"
]);
const PdfSecurityActionSchema = zod.z.enum([
	"edit_template",
	"publish_template",
	"preview_render",
	"production_render",
	"start_batch",
	"read_asset",
	"resolve_render_safe_url"
]);
const PdfSecurityContextSchema = zod.z.object({
	tenantId: IdentifierSchema,
	actor: PdfSecurityActorSchema,
	permissions: zod.z.array(PdfSecurityPermissionSchema).default([])
}).strict();
const PdfSecurityResourceTypeSchema = zod.z.enum([
	"template",
	"asset",
	"render_artifact",
	"batch",
	"dataset"
]);
const PdfSecurityResourceSchema = zod.z.object({
	type: PdfSecurityResourceTypeSchema,
	id: IdentifierSchema.optional(),
	tenantId: IdentifierSchema
}).strict();
const PdfAuthorizationReasonCodeSchema = zod.z.enum([
	"allowed",
	"missing_permission",
	"tenant_mismatch"
]);
const PdfAuthorizationDecisionSchema = zod.z.object({
	ok: zod.z.boolean(),
	action: PdfSecurityActionSchema,
	actorId: IdentifierSchema.optional(),
	tenantId: IdentifierSchema,
	resourceTenantId: IdentifierSchema.optional(),
	requiredPermission: PdfSecurityPermissionSchema.optional(),
	reasonCode: PdfAuthorizationReasonCodeSchema.optional(),
	message: NonEmptyStringSchema.optional()
}).strict().superRefine((decision, context) => {
	if (!decision.ok && decision.reasonCode === void 0) context.addIssue({
		code: "custom",
		message: "Denied authorization decisions require a reason code.",
		path: ["reasonCode"]
	});
});
const PdfAssetAccessRequestSchema = zod.z.object({
	tenantId: IdentifierSchema,
	actorId: IdentifierSchema.optional(),
	assetId: IdentifierSchema,
	role: zod.z.enum([
		"logo",
		"image",
		"signature",
		"font",
		"qr",
		"attachment"
	]).optional(),
	purpose: zod.z.enum([
		"browse",
		"preview",
		"production_render"
	])
}).strict();
const PdfSignedRenderUrlRequestSchema = zod.z.object({
	tenantId: IdentifierSchema,
	actorId: IdentifierSchema.optional(),
	assetId: IdentifierSchema,
	purpose: zod.z.enum(["browser_preview", "production_render"]),
	expiresInSeconds: NonNegativeIntegerSchema.optional()
}).strict();
const PdfSignedRenderUrlResultSchema = zod.z.object({
	tenantId: IdentifierSchema,
	assetId: IdentifierSchema,
	url: UrlSchema,
	public: zod.z.boolean().default(false),
	expiresAt: IsoDateTimeSchema.optional()
}).strict();
const PdfDataClassificationSchema = zod.z.enum([
	"public",
	"internal",
	"confidential",
	"restricted",
	"pii",
	"financial_pii",
	"secret"
]);
const PdfClassifiedDataPathSchema = zod.z.object({
	path: zod.z.array(NonEmptyStringSchema),
	classification: PdfDataClassificationSchema,
	reason: NonEmptyStringSchema
}).strict();
const PdfSecretLikeTemplateDiagnosticSchema = zod.z.object({
	code: zod.z.literal("secret_like_template_value"),
	severity: zod.z.literal("error"),
	path: zod.z.array(NonEmptyStringSchema),
	message: NonEmptyStringSchema,
	reason: NonEmptyStringSchema,
	redactedPreview: NonEmptyStringSchema.optional()
}).strict();
const permissionByAction = {
	edit_template: "template.edit",
	publish_template: "template.publish",
	preview_render: "render.preview",
	production_render: "render.production",
	start_batch: "batch.start",
	read_asset: "asset.read",
	resolve_render_safe_url: "asset.render_safe_url"
};
const publicOrganizationPathPattern = /^organization\.(?:name|address|email|phone|website|url)$/iu;
const secretKeyPattern = /api[_-]?key|apikey|authorization|bearer|cookie|password|secret|token|private[_-]?key|client[_-]?secret|webhook[_-]?secret/iu;
const financialPathPattern = /donation|gift|payment|invoice|tax|ein|bank|account|routing|credit|card|amount|balance|financial|receipt/iu;
const piiPathPattern = /recipient|donor|missionary|person|email|phone|address|full[_-]?name|name/iu;
const secretValuePatterns = [
	/\b[rs]k_(?:live|test)_[A-Za-z0-9]{8,}\b/u,
	/\bAKIA[0-9A-Z]{16}\b/u,
	/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}\b/iu,
	/\b(?:api[_-]?key|authorization|cookie|password|secret|token)\s*[=:]\s*[^\s,;]+/iu,
	/https?:\/\/\S+[?&](?:x-amz-signature|x-amz-credential|x-amz-security-token|x-goog-signature|signature|sig|token|access_token|policy|key-pair-id)=[^\s,;]+/iu,
	/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u
];
function authorizePdfSecurityAction(input) {
	const context = PdfSecurityContextSchema.parse(input.context);
	const resource = PdfSecurityResourceSchema.parse(input.resource);
	const requiredPermission = input.requiredPermission ?? permissionByAction[input.action];
	if (context.tenantId !== resource.tenantId) return PdfAuthorizationDecisionSchema.parse({
		action: input.action,
		actorId: context.actor.id,
		message: "Resource belongs to a different tenant.",
		ok: false,
		reasonCode: "tenant_mismatch",
		requiredPermission,
		resourceTenantId: resource.tenantId,
		tenantId: context.tenantId
	});
	if (!context.permissions.includes(requiredPermission)) return PdfAuthorizationDecisionSchema.parse({
		action: input.action,
		actorId: context.actor.id,
		message: `Missing required permission: ${requiredPermission}.`,
		ok: false,
		reasonCode: "missing_permission",
		requiredPermission,
		resourceTenantId: resource.tenantId,
		tenantId: context.tenantId
	});
	return PdfAuthorizationDecisionSchema.parse({
		action: input.action,
		actorId: context.actor.id,
		message: "Authorization allowed by package-level permission contract.",
		ok: true,
		reasonCode: "allowed",
		requiredPermission,
		resourceTenantId: resource.tenantId,
		tenantId: context.tenantId
	});
}
function createFakePdfPermissionAdapter(input) {
	const context = PdfSecurityContextSchema.parse(input.context);
	return { authorize: async (request) => authorizePdfSecurityAction({
		action: request.action,
		context: request.context ?? context,
		requiredPermission: request.requiredPermission,
		resource: request.resource
	}) };
}
function classifyPdfDataPath(path) {
	const normalizedPath = normalizePath(path);
	const joinedPath = normalizedPath.join(".");
	if (normalizedPath.some((segment) => isSecretLikeKey(segment))) return PdfClassifiedDataPathSchema.parse({
		classification: "secret",
		path: normalizedPath,
		reason: "The data path contains a secret-like key."
	});
	if (publicOrganizationPathPattern.test(joinedPath)) return PdfClassifiedDataPathSchema.parse({
		classification: "public",
		path: normalizedPath,
		reason: "Organization identity fields are public document metadata."
	});
	if (financialPathPattern.test(joinedPath)) return PdfClassifiedDataPathSchema.parse({
		classification: "financial_pii",
		path: normalizedPath,
		reason: "The data path references donor, gift, receipt, tax, or financial values."
	});
	if (piiPathPattern.test(joinedPath)) return PdfClassifiedDataPathSchema.parse({
		classification: "pii",
		path: normalizedPath,
		reason: "The data path references an identifiable person or contact field."
	});
	return PdfClassifiedDataPathSchema.parse({
		classification: "internal",
		path: normalizedPath,
		reason: "The data path is package-internal unless classified by an adapter."
	});
}
function findSecretLikeTemplateValues(template) {
	const diagnostics = [];
	collectSecretLikeTemplateDiagnostics(template, [], diagnostics);
	return diagnostics;
}
function redactPdfSecurityLogValue(value, options = {}) {
	return redactUnknown(value, options.redactValues ?? []);
}
function redactRenderMetadataForClient(metadata, options = {}) {
	return redactPdfSecurityLogValue(metadata, options);
}
function collectSecretLikeTemplateDiagnostics(value, path, diagnostics) {
	if (typeof value === "string") {
		const reason = getSecretLikeValueReason(value);
		if (reason !== void 0) diagnostics.push(createSecretLikeTemplateDiagnostic({
			path,
			reason,
			value
		}));
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			collectSecretLikeTemplateDiagnostics(item, [...path, String(index)], diagnostics);
		});
		return;
	}
	if (!isRecord(value)) return;
	const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
	for (const [key, item] of entries) {
		const itemPath = [...path, key];
		if (isSecretLikeKey(key)) {
			diagnostics.push(createSecretLikeTemplateDiagnostic({
				path: itemPath,
				reason: `The template key "${key}" looks like a credential field.`,
				value: typeof item === "string" ? item : void 0
			}));
			continue;
		}
		collectSecretLikeTemplateDiagnostics(item, itemPath, diagnostics);
	}
}
function createSecretLikeTemplateDiagnostic(input) {
	return PdfSecretLikeTemplateDiagnosticSchema.parse({
		code: "secret_like_template_value",
		message: "Template JSON contains a secret-like value. Store credentials and signed URLs in server-side adapters, not template source.",
		path: input.path,
		reason: input.reason,
		redactedPreview: input.value === void 0 ? void 0 : redactString(input.value, []),
		severity: "error"
	});
}
function normalizePath(path) {
	const segments = (typeof path === "string" ? path.split(".") : path).map((segment) => String(segment).trim()).filter((segment) => segment.length > 0);
	return segments.length > 0 ? segments : ["value"];
}
function isSecretLikeKey(key) {
	return secretKeyPattern.test(key);
}
function getSecretLikeValueReason(value) {
	const trimmed = value.trim();
	if (trimmed.length === 0) return;
	if (secretValuePatterns.some((pattern) => pattern.test(trimmed))) return "The value matches a credential or token-like pattern.";
}
function redactUnknown(value, redactValues) {
	if (typeof value === "string") return redactString(value, redactValues);
	if (Array.isArray(value)) return value.map((item) => redactUnknown(item, redactValues));
	if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => {
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
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region src/starter-templates.ts
const createdAt = "2026-05-15T00:00:00.000Z";
const tenantId = "tenant-starter";
const starterPdfTemplateCategories = [
	"donation_receipt",
	"tax_receipt",
	"annual_giving_statement",
	"donor_letter",
	"missionary_report",
	"financial_report",
	"invoice",
	"certificate"
];
const starterLogoAsset = {
	id: "starter-asset-logo",
	role: "logo",
	assetId: "starter-logo",
	renderSafeUrl: "https://assets.example.test/asym/starter-logo.png",
	mimeType: "image/png",
	altText: "Asymmetric Giving logo",
	width: 180,
	height: 54,
	alignment: "left",
	renderSafe: true,
	tenantId,
	source: {
		provider: "fixture-adapter",
		sourceId: "logo-v1",
		version: "2026-05-15"
	}
};
const starterSignatureAsset = {
	id: "starter-asset-signature",
	role: "signature",
	assetId: "starter-signature",
	renderSafeUrl: "https://assets.example.test/asym/starter-signature.png",
	mimeType: "image/png",
	altText: "Authorized signature",
	width: 220,
	height: 72,
	alignment: "left",
	renderSafe: true,
	tenantId,
	source: {
		provider: "fixture-adapter",
		sourceId: "signature-v1",
		version: "2026-05-15"
	}
};
const starterFieldPhotoAsset = {
	id: "starter-asset-field-photo",
	role: "image",
	assetId: "starter-field-photo",
	renderSafeUrl: "https://assets.example.test/asym/starter-field-photo.png",
	mimeType: "image/png",
	altText: "Field team serving the community",
	width: 320,
	height: 180,
	alignment: "right",
	renderSafe: true,
	tenantId,
	source: {
		provider: "fixture-adapter",
		sourceId: "field-photo-v1",
		version: "2026-05-15"
	}
};
const baseTheme = {
	name: "Starter Nonprofit Brand",
	branding: {
		source: "template_override",
		tenantBrandId: "starter-brand",
		overriddenFields: [
			"organization_name",
			"logo_asset",
			"primary_color",
			"accent_color",
			"footer_text"
		]
	},
	organization: {
		name: "Asymmetric Giving",
		legalName: "Asymmetric Giving Foundation",
		websiteUrl: "https://example.org"
	},
	colors: {
		primary: "#1f2937",
		accent: "#0f766e",
		text: "#111827",
		background: "#ffffff"
	},
	fonts: {
		body: "Arial",
		heading: "Georgia",
		fallback: ["Arial", "sans-serif"]
	},
	logoAsset: starterLogoAsset,
	logoAssetId: starterLogoAsset.assetId,
	footerText: "Asymmetric Giving Foundation | example.org",
	receiptDefaults: {
		thankYouMessage: "Thank you for partnering with our mission.",
		taxLanguage: "Please retain this receipt with your records for tax reporting.",
		goodsServicesStatement: "No goods or services were provided in exchange for this contribution."
	}
};
const reportTheme = {
	...baseTheme,
	name: "Starter Finance Brand",
	colors: {
		primary: "#263238",
		accent: "#2f6f73",
		text: "#111827",
		background: "#ffffff"
	}
};
const certificateTheme = {
	...baseTheme,
	name: "Starter Certificate Brand",
	colors: {
		primary: "#16324f",
		accent: "#9a6a2f",
		text: "#111827",
		background: "#ffffff"
	}
};
const basePageSettings = {
	pageSize: "letter",
	orientation: "portrait",
	margins: {
		top: "0.75in",
		right: "0.65in",
		bottom: "0.75in",
		left: "0.65in"
	},
	headerFooter: { regions: [{
		id: "starter-footer",
		placement: "footer",
		scope: "repeating",
		alignment: "center",
		minimumMargin: "0.5in",
		content: [
			{ kind: "organization_footer" },
			{
				kind: "text",
				text: " | Page "
			},
			{ kind: "page_number" },
			{
				kind: "text",
				text: " of "
			},
			{ kind: "total_pages" }
		]
	}] }
};
const legalLandscapePageSettings = {
	pageSize: "legal",
	orientation: "landscape",
	margins: {
		top: "0.75in",
		right: "0.5in",
		bottom: "0.75in",
		left: "0.5in"
	},
	headerFooter: basePageSettings.headerFooter
};
const certificatePageSettings = {
	pageSize: "letter",
	orientation: "landscape",
	margins: {
		top: "0.65in",
		right: "0.75in",
		bottom: "0.65in",
		left: "0.75in"
	},
	headerFooter: { regions: [{
		id: "certificate-first-page-footer",
		placement: "footer",
		scope: "first_page",
		alignment: "center",
		minimumMargin: "0.5in",
		content: [{ kind: "organization_footer" }]
	}] }
};
const baseSampleData = {
	organization: {
		name: "Asymmetric Giving",
		legalName: "Asymmetric Giving Foundation",
		ein: "12-3456789",
		address: {
			line1: "100 Mission Way",
			city: "Franklin",
			region: "TN",
			postalCode: "37064",
			country: "US"
		},
		website: "https://example.org"
	},
	recipient: {
		id: "recipient-1001",
		fullName: "Jordan Lee",
		email: "jordan.lee@example.test",
		address: {
			line1: "42 Donor Lane",
			city: "Austin",
			region: "TX",
			postalCode: "78701",
			country: "US"
		}
	},
	donation: {
		id: "gift-2001",
		date: "2026-04-15",
		amount: 250,
		method: "Credit card",
		designation: "General Fund",
		goodsServicesValue: 0,
		receiptNumber: "REC-2026-0001"
	},
	taxReceipt: {
		taxYear: 2026,
		deductibleAmount: 250,
		goodsServicesStatement: "No goods or services were provided in exchange for this contribution.",
		issuedDate: "2026-04-28"
	},
	document: {
		title: "Starter Document",
		date: "2026-04-28",
		number: "DOC-2026-0001",
		footerText: "Asymmetric Giving Foundation | example.org",
		certificateTitle: "Certificate of Appreciation",
		donorLetterBody: "Your generosity helps sustain this work across the communities we serve."
	},
	asset: {
		logoUrl: starterLogoAsset.renderSafeUrl,
		logoAltText: starterLogoAsset.altText,
		signatureUrl: starterSignatureAsset.renderSafeUrl,
		portalUrl: "https://example.org/donor-portal"
	},
	computed: {
		currentPage: 1,
		totalPages: 3,
		generatedAt: "2026-04-28T00:00:00.000Z",
		isTaxDeductible: true
	}
};
const donationRows = [{
	amount: 250,
	date: "2026-04-15",
	designation: "General Fund",
	method: "Credit card",
	receiptNumber: "REC-2026-0001"
}];
const taxReceiptRows = [{
	amount: 400,
	date: "2026-01-12",
	deductibleAmount: 400,
	designation: "General Fund",
	receiptNumber: "TAX-2026-0001"
}, {
	amount: 100,
	date: "2026-02-20",
	deductibleAmount: 100,
	designation: "Mission Fund",
	receiptNumber: "TAX-2026-0002"
}];
const annualGivingRows = [
	{
		amount: 300,
		date: "2026-01-15",
		designation: "General Fund",
		fund: "Operating",
		receiptNumber: "STMT-2026-0001"
	},
	{
		amount: 175,
		date: "2026-03-22",
		designation: "Mission Support",
		fund: "Missions",
		receiptNumber: "STMT-2026-0002"
	},
	{
		amount: 250,
		date: "2026-05-07",
		designation: "General Fund",
		fund: "Operating",
		receiptNumber: "STMT-2026-0003"
	}
];
const missionarySupportRows = [
	{
		amount: 1500,
		donorCount: 18,
		fund: "Monthly support",
		receivedThrough: "2026-04-30"
	},
	{
		amount: 750,
		donorCount: 9,
		fund: "Travel fund",
		receivedThrough: "2026-04-30"
	},
	{
		amount: 250,
		donorCount: 4,
		fund: "Emergency relief",
		receivedThrough: "2026-04-30"
	}
];
const financialReportRows = [
	{
		account: "Contributions",
		amount: 6e3,
		category: "Income",
		fund: "Operating"
	},
	{
		account: "Mission support",
		amount: 2500,
		category: "Income",
		fund: "Missions"
	},
	{
		account: "Community meals",
		amount: -1200,
		category: "Expense",
		fund: "Outreach"
	},
	{
		account: "Facilities",
		amount: -2e3,
		category: "Expense",
		fund: "Operating"
	}
];
const invoiceLineItems = [{
	amount: 1200,
	description: "Program strategy workshop",
	quantity: 3,
	rate: 400
}, {
	amount: 350,
	description: "Printed participant packets",
	quantity: 1,
	rate: 350
}];
const donationReceiptTable = {
	id: "starter-donation-receipt-table",
	sourcePath: "donations",
	emptyState: "No gifts are available for this receipt.",
	repeatHeader: true,
	totals: [{
		columnKey: "amount",
		label: "Receipt total",
		operation: "sum"
	}],
	columns: [
		{
			key: "date",
			label: "Gift date",
			sourcePath: "date",
			type: "date",
			formatter: "date.medium",
			width: "1.2in"
		},
		{
			key: "designation",
			label: "Designation",
			sourcePath: "designation",
			type: "string"
		},
		{
			key: "amount",
			label: "Amount",
			sourcePath: "amount",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "1in"
		}
	]
};
const statementDonationTable = {
	id: "starter-statement-donation-table",
	sourcePath: "statement.donations",
	emptyState: "No gifts were recorded for this statement period.",
	grouping: {
		fieldPath: "fund",
		label: "Fund"
	},
	repeatHeader: true,
	totals: [{
		columnKey: "amount",
		label: "Statement total",
		operation: "sum"
	}],
	columns: [
		{
			key: "date",
			label: "Gift date",
			sourcePath: "date",
			type: "date",
			formatter: "date.medium",
			width: "1.1in"
		},
		{
			key: "receipt",
			label: "Receipt",
			sourcePath: "receiptNumber",
			type: "id",
			width: "1.1in"
		},
		{
			key: "designation",
			label: "Designation",
			sourcePath: "designation",
			type: "string"
		},
		{
			key: "amount",
			label: "Amount",
			sourcePath: "amount",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "1in"
		}
	]
};
const missionarySupportTable = {
	id: "starter-missionary-support-table",
	sourcePath: "missionary.supportRows",
	emptyState: "No support rows are available for this report.",
	repeatHeader: true,
	totals: [{
		columnKey: "amount",
		label: "Support received",
		operation: "sum"
	}],
	columns: [
		{
			key: "fund",
			label: "Fund",
			sourcePath: "fund",
			type: "string",
			width: "35%"
		},
		{
			key: "donorCount",
			label: "Donors",
			sourcePath: "donorCount",
			type: "number",
			formatter: "number.integer",
			align: "right",
			width: "20%"
		},
		{
			key: "receivedThrough",
			label: "Received through",
			sourcePath: "receivedThrough",
			type: "date",
			formatter: "date.medium",
			width: "25%"
		},
		{
			key: "amount",
			label: "Amount",
			sourcePath: "amount",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "20%"
		}
	]
};
const financialReportTable = {
	id: "starter-financial-report-table",
	sourcePath: "financialReport.rows",
	emptyState: "No financial rows are available for this report period.",
	grouping: {
		fieldPath: "fund",
		label: "Fund"
	},
	repeatHeader: true,
	totals: [{
		columnKey: "amount",
		label: "Net change",
		operation: "sum"
	}],
	columns: [
		{
			key: "fund",
			label: "Fund",
			sourcePath: "fund",
			type: "string",
			width: "24%"
		},
		{
			key: "account",
			label: "Account",
			sourcePath: "account",
			type: "string",
			width: "36%"
		},
		{
			key: "category",
			label: "Category",
			sourcePath: "category",
			type: "string",
			width: "20%"
		},
		{
			key: "amount",
			label: "Amount",
			sourcePath: "amount",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "20%"
		}
	]
};
const invoiceLineItemTable = {
	id: "starter-invoice-line-item-table",
	sourcePath: "invoice.lineItems",
	emptyState: "No invoice line items.",
	repeatHeader: true,
	totals: [{
		columnKey: "amount",
		label: "Line item total",
		operation: "sum"
	}],
	columns: [
		{
			key: "description",
			label: "Description",
			sourcePath: "description",
			type: "string",
			width: "44%"
		},
		{
			key: "quantity",
			label: "Qty",
			sourcePath: "quantity",
			type: "number",
			formatter: "number.integer",
			align: "right",
			width: "12%"
		},
		{
			key: "rate",
			label: "Rate",
			sourcePath: "rate",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "20%"
		},
		{
			key: "amount",
			label: "Amount",
			sourcePath: "amount",
			type: "currency",
			formatter: "currency.usd",
			align: "right",
			width: "24%"
		}
	]
};
const taxReceiptPlaceholder = {
	id: "starter-tax-receipt-confirmation",
	kind: "checkbox",
	label: "Tax language reviewed",
	required: true,
	checkedByDefault: false
};
const donorLetterSignaturePlaceholder = {
	id: "starter-donor-letter-signature",
	kind: "signature",
	label: "Donor care signature",
	signerRole: "staff",
	width: 240,
	height: 72
};
const certificateQrPlaceholder = {
	id: "starter-certificate-qr",
	kind: "qr",
	label: "Verify certificate",
	payload: {
		type: "url",
		value: "https://example.org/verify/certificate/starter"
	},
	size: 144,
	errorCorrectionLevel: "medium"
};
const invoiceApprovalDatePlaceholder = {
	id: "starter-invoice-approval-date",
	kind: "date",
	label: "Approval date",
	dateFormat: "MM/DD/YYYY"
};
const missionaryUpdateRepeater = {
	id: "starter-missionary-updates",
	sourcePath: "missionary.updates",
	itemAlias: "update",
	indexAlias: "updateIndex",
	emptyState: "No field updates are available.",
	maxItems: 5
};
const donationReceiptVariables = [
	"organization.name",
	"organization.legal_name",
	"organization.ein",
	"organization.address",
	"recipient.full_name",
	"recipient.address",
	"donation.date",
	"donation.amount",
	"donation.method",
	"donation.designation",
	"donation.receipt_number",
	"tax_receipt.goods_services_statement",
	"tax_receipt.issued_date",
	"document.title",
	"document.footer_text",
	"asset.logo_url"
];
const taxReceiptVariables = [
	"organization.name",
	"organization.legal_name",
	"organization.ein",
	"organization.address",
	"recipient.full_name",
	"recipient.address",
	"tax_receipt.tax_year",
	"tax_receipt.deductible_amount",
	"tax_receipt.goods_services_statement",
	"tax_receipt.issued_date",
	"document.title",
	"document.number"
];
const annualGivingVariables = [
	"organization.name",
	"recipient.full_name",
	"recipient.address",
	"statement.period",
	"statement.start_date",
	"statement.end_date",
	"statement.total_contributions",
	"statement.donation_count",
	"tax_receipt.tax_year",
	"document.title",
	"document.footer_text"
];
const donorLetterVariables = [
	"organization.name",
	"recipient.full_name",
	"recipient.email",
	"document.date",
	"document.donor_letter_body",
	"asset.signature_url",
	"asset.portal_url"
];
const missionaryReportVariables = [
	"organization.name",
	"missionary.id",
	"missionary.full_name",
	"missionary.location",
	"missionary.support_goal",
	"missionary.prayer_update",
	"document.title",
	"document.footer_text"
];
const financialReportVariables = [
	"organization.name",
	"financial_report.period",
	"financial_report.fund_name",
	"financial_report.income_total",
	"financial_report.expense_total",
	"financial_report.net_balance",
	"financial_report.row_count",
	"financial_report.variance_percentage",
	"document.title",
	"computed.generated_at"
];
const invoiceVariables = [
	"organization.name",
	"organization.address",
	"recipient.full_name",
	"recipient.email",
	"recipient.address",
	"invoice.number",
	"invoice.due_date",
	"invoice.subtotal",
	"invoice.tax_rate",
	"invoice.total",
	"invoice.paid",
	"document.footer_text"
];
const certificateVariables = [
	"organization.name",
	"recipient.full_name",
	"document.certificate_title",
	"document.date",
	"asset.signature_url",
	"asset.portal_url"
];
const starterPdfTemplateFixtures = [
	createStarterFixture({
		id: "starter-donation-receipt",
		title: "Donation Receipt Starter",
		category: "donation_receipt",
		template: {
			version: 1,
			id: "starter-donation-receipt-template",
			name: "Starter Donation Receipt",
			category: "donation_receipt",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Donation Receipt"),
				paragraph(text("Receipt "), variable("donation.receipt_number"), text(" issued on "), variable("tax_receipt.issued_date")),
				paragraph(text("Thank you, "), variable("recipient.full_name"), text(", for your gift to "), variable("organization.name"), text(".")),
				summaryBlock("starter-donation-total-summary"),
				dataTable(donationReceiptTable.id),
				paragraph(variable("tax_receipt.goods_services_statement"))
			]),
			variables: variablesFor(donationReceiptVariables),
			dataBindings: dataBindingsFor(donationReceiptVariables),
			tableBindings: [donationReceiptTable],
			summaryBlockBindings: [{
				id: "starter-donation-total-summary",
				title: "Gift Summary",
				calculation: {
					type: "total_contributions",
					sourcePath: "donations",
					amountPath: "amount",
					label: "Total contribution"
				}
			}],
			assets: [starterLogoAsset],
			metadata: metadata("Starter single-gift donation receipt with branded logo, receipt fields, table total, and tax language.", ["donation-receipt", "receipt"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Donation Receipt"
			},
			donations: donationRows
		},
		expectedHtmlSnippets: [
			"Donation Receipt",
			"data-asym-summary-block=\"true\"",
			"data-table-binding-id=\"starter-donation-receipt-table\"",
			"$250.00"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "--asym-brand-primary:#1f2937;"]
	}),
	createStarterFixture({
		id: "starter-tax-receipt",
		title: "Tax Receipt Starter",
		category: "tax_receipt",
		template: {
			version: 1,
			id: "starter-tax-receipt-template",
			name: "Starter Tax Receipt",
			category: "tax_receipt",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Tax Receipt"),
				paragraph(text("Tax year "), variable("tax_receipt.tax_year")),
				paragraph(text("Issued to "), variable("recipient.full_name"), text(" by "), variable("organization.legal_name"), text(".")),
				summaryBlock("starter-tax-deductible-summary"),
				dataTable("starter-tax-receipt-table"),
				placeholder(taxReceiptPlaceholder.id),
				paragraph(variable("tax_receipt.goods_services_statement"))
			]),
			variables: variablesFor(taxReceiptVariables),
			dataBindings: dataBindingsFor(taxReceiptVariables),
			tableBindings: [{
				...donationReceiptTable,
				id: "starter-tax-receipt-table",
				sourcePath: "taxReceipt.donations",
				totals: [{
					columnKey: "amount",
					label: "Deductible total",
					operation: "sum"
				}]
			}],
			summaryBlockBindings: [{
				id: "starter-tax-deductible-summary",
				title: "Deductible Giving Summary",
				calculation: {
					type: "total_contributions",
					sourcePath: "taxReceipt.donations",
					amountPath: "deductibleAmount",
					label: "Tax deductible amount"
				}
			}],
			placeholderBindings: [taxReceiptPlaceholder],
			assets: [starterLogoAsset],
			metadata: metadata("Starter year-end tax receipt with deductible totals, confirmation placeholder, and structured receipt language.", ["tax-receipt", "receipt"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Tax Receipt",
				number: "TAX-2026-0001"
			},
			taxReceipt: {
				...baseSampleData.taxReceipt,
				deductibleAmount: 500,
				donations: taxReceiptRows
			}
		},
		expectedHtmlSnippets: [
			"Tax Receipt",
			"Tax deductible amount",
			"Tax language reviewed",
			"$500.00"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "--asym-brand-accent:#0f766e;"]
	}),
	createStarterFixture({
		id: "starter-annual-giving-statement",
		title: "Annual Giving Statement Starter",
		category: "annual_giving_statement",
		template: {
			version: 1,
			id: "starter-annual-giving-statement-template",
			name: "Starter Annual Giving Statement",
			category: "annual_giving_statement",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Annual Giving Statement"),
				paragraph(variable("statement.period"), text(" for "), variable("recipient.full_name")),
				summaryBlock("starter-statement-total-summary"),
				dataTable(statementDonationTable.id),
				paragraph(text("Statement includes "), variable("statement.donation_count"), text(" gifts for tax year "), variable("tax_receipt.tax_year"), text("."))
			]),
			variables: variablesFor(annualGivingVariables),
			dataBindings: dataBindingsFor(annualGivingVariables),
			tableBindings: [statementDonationTable],
			summaryBlockBindings: [{
				id: "starter-statement-total-summary",
				title: "Statement Summary",
				calculation: {
					type: "total_contributions",
					sourcePath: "statement.donations",
					amountPath: "amount",
					label: "Total contributions"
				}
			}],
			assets: [starterLogoAsset],
			metadata: metadata("Starter annual giving statement with donation history, grouped subtotals, grand total, footer, and page numbering.", ["annual-giving-statement", "statement"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Annual Giving Statement"
			},
			statement: {
				period: "2026 Year to Date",
				startDate: "2026-01-01",
				endDate: "2026-12-31",
				totalContributions: 725,
				donationCount: 3,
				donations: annualGivingRows
			},
			taxReceipt: {
				...baseSampleData.taxReceipt,
				taxYear: 2026
			}
		},
		expectedHtmlSnippets: [
			"Annual Giving Statement",
			"Statement Summary",
			"Operating subtotal",
			"$725.00"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "counter(page)"]
	}),
	createStarterFixture({
		id: "starter-donor-letter",
		title: "Donor Letter Starter",
		category: "donor_letter",
		template: {
			version: 1,
			id: "starter-donor-letter-template",
			name: "Starter Donor Letter",
			category: "donor_letter",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				paragraph(text("Dear "), variable("recipient.full_name"), text(",")),
				paragraph(variable("document.donor_letter_body")),
				paragraph(text("You can manage giving preferences at "), variable("asset.portal_url"), text(".")),
				assetImage(starterSignatureAsset.assetId),
				placeholder(donorLetterSignaturePlaceholder.id)
			]),
			variables: variablesFor(donorLetterVariables),
			dataBindings: dataBindingsFor(donorLetterVariables),
			placeholderBindings: [donorLetterSignaturePlaceholder],
			assets: [starterLogoAsset, starterSignatureAsset],
			metadata: metadata("Starter personalized donor letter with rich body copy, signature asset, and future signature placeholder.", ["donor-letter", "correspondence"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Donor Letter"
			}
		},
		expectedHtmlSnippets: [
			"Dear",
			"data-asset-role=\"signature\"",
			"Donor care signature",
			"pdf-document-placeholder--signature"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "--asym-font-heading:\"Georgia\",\"Arial\",sans-serif;"]
	}),
	createStarterFixture({
		id: "starter-missionary-report",
		title: "Missionary Support Report Starter",
		category: "missionary_report",
		template: {
			version: 1,
			id: "starter-missionary-report-template",
			name: "Starter Missionary Support Report",
			category: "missionary_report",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Missionary Support Report"),
				paragraph(variable("missionary.full_name"), text(" | "), variable("missionary.location")),
				assetImage(starterFieldPhotoAsset.assetId),
				summaryBlock("starter-missionary-support-summary"),
				dataTable(missionarySupportTable.id),
				repeater(missionaryUpdateRepeater.id, [paragraph(text("Field update: "), variable("missionary.prayer_update"))])
			]),
			variables: variablesFor(missionaryReportVariables),
			dataBindings: dataBindingsFor(missionaryReportVariables),
			repeaterBindings: [missionaryUpdateRepeater],
			tableBindings: [missionarySupportTable],
			summaryBlockBindings: [{
				id: "starter-missionary-support-summary",
				title: "Support Summary",
				calculation: {
					type: "grouped_subtotals",
					sourcePath: "missionary.supportRows",
					groupPath: "fund",
					valuePath: "amount",
					includeGrandTotal: true,
					grandTotalLabel: "Total support received"
				}
			}],
			assets: [starterLogoAsset, starterFieldPhotoAsset],
			metadata: metadata("Starter missionary support report with support rows, image asset, grouped totals, and update sections.", ["missionary-report", "support-report"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Missionary Support Report"
			},
			missionary: {
				id: "missionary-3001",
				fullName: "Avery Carter",
				location: "Southeast Asia",
				supportGoal: 5e3,
				prayerUpdate: "Please pray for continued community partnerships and team health.",
				supportRows: missionarySupportRows,
				updates: [{ title: "Community partnerships" }]
			}
		},
		expectedHtmlSnippets: [
			"Missionary Support Report",
			"Monthly support",
			"Total support received",
			"$2,500.00"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "--asym-brand-primary:#1f2937;"]
	}),
	createStarterFixture({
		id: "starter-financial-report",
		title: "Financial Report Starter",
		category: "financial_report",
		template: {
			version: 1,
			id: "starter-financial-report-template",
			name: "Starter Financial Report",
			category: "financial_report",
			pageSettings: legalLandscapePageSettings,
			theme: reportTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Financial Report"),
				paragraph(variable("financial_report.period"), text(" | "), variable("financial_report.fund_name")),
				summaryBlock("starter-financial-report-summary"),
				dataTable(financialReportTable.id),
				pageBreak("starter-financial-report-notes-break"),
				paragraph(text("Generated at "), variable("computed.generated_at"), text(" for audit review."))
			]),
			variables: variablesFor(financialReportVariables),
			dataBindings: dataBindingsFor(financialReportVariables),
			tableBindings: [financialReportTable],
			summaryBlockBindings: [{
				id: "starter-financial-report-summary",
				title: "Report Summary",
				calculation: {
					type: "financial_report_totals",
					sourcePath: "financialReport.rows",
					amountPath: "amount",
					categoryPath: "category",
					incomeCategories: ["Income"],
					expenseCategories: ["Expense"]
				}
			}],
			assets: [starterLogoAsset],
			metadata: metadata("Starter grouped financial report with income, expense, net, table subtotals, and deterministic page break.", ["financial-report", "finance"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Financial Report"
			},
			financialReport: {
				period: "Q1 2026",
				fundName: "All Funds",
				incomeTotal: 8500,
				expenseTotal: 3200,
				netBalance: 5300,
				rowCount: 4,
				variancePercentage: .08,
				rows: financialReportRows
			}
		},
		expectedHtmlSnippets: [
			"Financial Report",
			"Report Summary",
			"<dt>Net</dt><dd>$5,300.00</dd>",
			"data-page-break-id=\"starter-financial-report-notes-break\""
		],
		expectedPrintCssSnippets: ["@page{size:14in 8.5in;", "--asym-brand-accent:#2f6f73;"]
	}),
	createStarterFixture({
		id: "starter-invoice",
		title: "Invoice Starter",
		category: "invoice",
		template: {
			version: 1,
			id: "starter-invoice-template",
			name: "Starter Invoice",
			category: "invoice",
			pageSettings: basePageSettings,
			theme: baseTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Invoice"),
				paragraph(text("Invoice "), variable("invoice.number")),
				paragraph(text("Bill to "), variable("recipient.full_name"), text(" | Due "), variable("invoice.due_date")),
				dataTable(invoiceLineItemTable.id),
				summaryBlock("starter-invoice-total-summary"),
				placeholder(invoiceApprovalDatePlaceholder.id),
				paragraph(text("Payment status: "), variable("invoice.paid"))
			]),
			variables: variablesFor(invoiceVariables),
			dataBindings: dataBindingsFor(invoiceVariables),
			tableBindings: [invoiceLineItemTable],
			summaryBlockBindings: [{
				id: "starter-invoice-total-summary",
				title: "Invoice Totals",
				calculation: {
					type: "invoice_totals",
					lineItemsPath: "invoice.lineItems",
					amountPath: "amount",
					discountPath: "invoice.discount",
					taxPath: "invoice.tax"
				}
			}],
			placeholderBindings: [invoiceApprovalDatePlaceholder],
			assets: [starterLogoAsset],
			metadata: metadata("Starter invoice with line items, subtotal, discount, tax, total, and approval-date placeholder.", ["invoice", "billing"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Invoice"
			},
			invoice: {
				number: "INV-2026-0001",
				dueDate: "2026-05-15",
				subtotal: 1550,
				taxRate: .0825,
				tax: 123.75,
				discount: 50,
				total: 1623.75,
				paid: false,
				lineItems: invoiceLineItems
			}
		},
		expectedHtmlSnippets: [
			"Invoice",
			"Program strategy workshop",
			"<dt>Total</dt><dd>$1,623.75</dd>",
			"Approval date"
		],
		expectedPrintCssSnippets: ["@page{size:8.5in 11in;", "--asym-brand-background:#ffffff;"]
	}),
	createStarterFixture({
		id: "starter-certificate",
		title: "Certificate Starter",
		category: "certificate",
		template: {
			version: 1,
			id: "starter-certificate-template",
			name: "Starter Certificate",
			category: "certificate",
			pageSettings: certificatePageSettings,
			theme: certificateTheme,
			content: doc([
				assetImage(starterLogoAsset.assetId),
				heading(1, "Certificate of Appreciation"),
				paragraph(text("Presented to")),
				heading(2, variable("recipient.full_name")),
				paragraph(text("In recognition of faithful partnership with "), variable("organization.name"), text(".")),
				assetImage(starterSignatureAsset.assetId),
				placeholder(certificateQrPlaceholder.id)
			]),
			variables: variablesFor(certificateVariables),
			dataBindings: dataBindingsFor(certificateVariables),
			placeholderBindings: [certificateQrPlaceholder],
			assets: [starterLogoAsset, starterSignatureAsset],
			metadata: metadata("Starter landscape certificate with branded layout, signature asset, and verification QR placeholder.", ["certificate", "recognition"])
		},
		sampleData: {
			...baseSampleData,
			document: {
				...baseSampleData.document,
				title: "Certificate",
				certificateTitle: "Certificate of Appreciation"
			}
		},
		expectedHtmlSnippets: [
			"Certificate of Appreciation",
			"Presented to",
			"Verify certificate",
			"pdf-document-placeholder--qr"
		],
		expectedPrintCssSnippets: ["@page{size:11in 8.5in;", "--asym-brand-accent:#9a6a2f;"]
	})
];
const starterPdfTemplateFixtureByCategory = Object.fromEntries(starterPdfTemplateFixtures.map((fixture) => [fixture.category, fixture]));
function createStarterFixture(input) {
	return {
		id: input.id,
		title: input.title,
		category: input.category,
		template: DocumentTemplateV1Schema.parse(input.template),
		sampleData: input.sampleData,
		expectedWarnings: [],
		expectedHtmlSnippets: input.expectedHtmlSnippets,
		expectedPrintCssSnippets: input.expectedPrintCssSnippets
	};
}
function metadata(description, tags) {
	return {
		description,
		tags: [
			"starter-template",
			"phase-29",
			...tags
		],
		createdAt,
		updatedAt: createdAt
	};
}
function variablesFor(keys) {
	return keys.map((key) => variableFor(key));
}
function variableFor(key) {
	const definition = coreVariableRegistry.get(key);
	if (!definition) throw new Error(`Unknown starter template variable "${key}".`);
	return toTemplateVariableDefinition(definition);
}
function toTemplateVariableDefinition(definition) {
	const { documentCategories: _documentCategories, ...templateDefinition } = definition;
	return templateDefinition;
}
function dataBindingsFor(keys) {
	return keys.map((key) => {
		const definition = coreVariableRegistry.get(key);
		if (!definition) throw new Error(`Unknown starter template binding variable "${key}".`);
		return {
			id: `starter-binding-${key}`,
			variableKey: definition.key,
			sourcePath: definition.sourcePath,
			required: definition.required
		};
	});
}
function doc(content) {
	return {
		type: "doc",
		content: [...content]
	};
}
function heading(level, ...content) {
	return {
		type: "heading",
		attrs: { level },
		content: [...content.map(toContentNode)]
	};
}
function paragraph(...content) {
	return {
		type: "paragraph",
		content: [...content.map(toContentNode)]
	};
}
function toContentNode(value) {
	return typeof value === "string" ? text(value) : value;
}
function text(value) {
	return {
		type: "text",
		text: value
	};
}
function variable(key) {
	return {
		type: "variable",
		attrs: { key }
	};
}
function assetImage(assetId) {
	return {
		type: "assetImage",
		attrs: { assetId }
	};
}
function dataTable(bindingId) {
	return {
		type: "dataTable",
		attrs: { bindingId }
	};
}
function summaryBlock(bindingId) {
	return {
		type: "summaryBlock",
		attrs: { bindingId }
	};
}
function placeholder(placeholderId) {
	return {
		type: "documentPlaceholder",
		attrs: { placeholderId }
	};
}
function pageBreak(id) {
	return {
		type: "pageBreak",
		attrs: {
			id,
			label: "Notes page break"
		}
	};
}
function repeater(bindingId, content) {
	return {
		type: "repeater",
		attrs: { bindingId },
		content: [...content]
	};
}
//#endregion
//#region src/index.ts
const pdfTemplateSchemaBoundary = {
	packageName: "@asym/pdf-template-schema",
	maturity: "phase-38-unlayer-migration",
	owns: "template-schema",
	runtime: "shared"
};
//#endregion
exports.AssetReferenceSchema = AssetReferenceSchema;
exports.AssetRoleSchema = AssetRoleSchema;
exports.AuditEventSchema = AuditEventSchema;
exports.BatchDatasetReferenceSchema = BatchDatasetReferenceSchema;
exports.BatchDocumentJobStatusSchema = BatchDocumentJobStatusSchema;
exports.BatchDocumentJobV1Schema = BatchDocumentJobV1Schema;
exports.BatchDownloadManifestV1Schema = BatchDownloadManifestV1Schema;
exports.BatchFailureReasonSchema = BatchFailureReasonSchema;
exports.BatchGenerationDefinitionV1Schema = BatchGenerationDefinitionV1Schema;
exports.BatchGenerationRunV1Schema = BatchGenerationRunV1Schema;
exports.BatchGenerationStatusSchema = BatchGenerationStatusSchema;
exports.BatchProgressSummarySchema = BatchProgressSummarySchema;
exports.BatchRecipientReferenceSchema = BatchRecipientReferenceSchema;
exports.BatchResultManifestJobSchema = BatchResultManifestJobSchema;
exports.BatchResultManifestV1Schema = BatchResultManifestV1Schema;
exports.BatchRunV1Schema = BatchRunV1Schema;
exports.BatchSafetyPreflightDiagnosticSchema = BatchSafetyPreflightDiagnosticSchema;
exports.BatchSafetyPreflightResultSchema = BatchSafetyPreflightResultSchema;
exports.CheckboxPlaceholderSchema = CheckboxPlaceholderSchema;
exports.ConditionalOperatorSchema = ConditionalOperatorSchema;
exports.ConditionalRuleSchema = ConditionalRuleSchema;
exports.CustomPageSizeSchema = CustomPageSizeSchema;
exports.DataBindingSchema = DataBindingSchema;
exports.DataSnapshotHashSchema = DataSnapshotHashSchema;
exports.DatePlaceholderSchema = DatePlaceholderSchema;
exports.DocRaptorRenderMetadataSchema = DocRaptorRenderMetadataSchema;
exports.DocumentArtifactLocationSchema = DocumentArtifactLocationSchema;
exports.DocumentArtifactSchema = DocumentArtifactSchema;
exports.DocumentAssetAlignmentSchema = DocumentAssetAlignmentSchema;
exports.DocumentAssetImageAttributesSchema = DocumentAssetImageAttributesSchema;
exports.DocumentAssetImageNodeSchema = DocumentAssetImageNodeSchema;
exports.DocumentAssetReferenceSchema = DocumentAssetReferenceSchema;
exports.DocumentAssetRoleSchema = DocumentAssetRoleSchema;
exports.DocumentAssetSourceMetadataSchema = DocumentAssetSourceMetadataSchema;
exports.DocumentAssetUrlClassificationSchema = DocumentAssetUrlClassificationSchema;
exports.DocumentBrandFieldSchema = DocumentBrandFieldSchema;
exports.DocumentBrandSourceSchema = DocumentBrandSourceSchema;
exports.DocumentBrandingMetadataSchema = DocumentBrandingMetadataSchema;
exports.DocumentContentNodeSchema = DocumentContentNodeSchema;
exports.DocumentContentSchema = DocumentContentSchema;
exports.DocumentEngineSchema = DocumentEngineSchema;
exports.DocumentHeaderFooterSettingsSchema = DocumentHeaderFooterSettingsSchema;
exports.DocumentPageBreakAttributesSchema = DocumentPageBreakAttributesSchema;
exports.DocumentPageBreakNodeSchema = DocumentPageBreakNodeSchema;
exports.DocumentPageSettingsSchema = DocumentPageSettingsSchema;
exports.DocumentPlaceholderKindSchema = DocumentPlaceholderKindSchema;
exports.DocumentPlaceholderSchema = DocumentPlaceholderSchema;
exports.DocumentPlaceholderSignerRoleSchema = DocumentPlaceholderSignerRoleSchema;
exports.DocumentReceiptDefaultsSchema = DocumentReceiptDefaultsSchema;
exports.DocumentTemplateV1Schema = DocumentTemplateV1Schema;
exports.DocumentThemeColorSchema = DocumentThemeColorSchema;
exports.DocumentThemeColorsSchema = DocumentThemeColorsSchema;
exports.DocumentThemeFontFamilySchema = DocumentThemeFontFamilySchema;
exports.DocumentThemeFontsSchema = DocumentThemeFontsSchema;
exports.DocumentThemeOrganizationSchema = DocumentThemeOrganizationSchema;
exports.DocumentThemeSchema = DocumentThemeSchema;
exports.FallbackBehaviorSchema = FallbackBehaviorSchema;
exports.FinancialReportTotalsCalculationReferenceSchema = FinancialReportTotalsCalculationReferenceSchema;
exports.GrandTotalCalculationReferenceSchema = GrandTotalCalculationReferenceSchema;
exports.GroupedSubtotalsCalculationReferenceSchema = GroupedSubtotalsCalculationReferenceSchema;
exports.HeaderFooterAlignmentSchema = HeaderFooterAlignmentSchema;
exports.HeaderFooterContentTokenSchema = HeaderFooterContentTokenSchema;
exports.HeaderFooterDocumentTitleTokenSchema = HeaderFooterDocumentTitleTokenSchema;
exports.HeaderFooterOrganizationFooterTokenSchema = HeaderFooterOrganizationFooterTokenSchema;
exports.HeaderFooterPageNumberTokenSchema = HeaderFooterPageNumberTokenSchema;
exports.HeaderFooterPlacementSchema = HeaderFooterPlacementSchema;
exports.HeaderFooterRegionSchema = HeaderFooterRegionSchema;
exports.HeaderFooterScopeSchema = HeaderFooterScopeSchema;
exports.HeaderFooterTextTokenSchema = HeaderFooterTextTokenSchema;
exports.HeaderFooterTotalPagesTokenSchema = HeaderFooterTotalPagesTokenSchema;
exports.InitialsPlaceholderSchema = InitialsPlaceholderSchema;
exports.InvoiceTotalsCalculationReferenceSchema = InvoiceTotalsCalculationReferenceSchema;
exports.LegacyPdfTemplateArtifactSchema = LegacyPdfTemplateArtifactSchema;
exports.LegacyPdfTemplateReferenceSchema = LegacyPdfTemplateReferenceSchema;
exports.PageFlowControlAttributesSchema = PageFlowControlAttributesSchema;
exports.PageMarginsSchema = PageMarginsSchema;
exports.PageOrientationSchema = PageOrientationSchema;
exports.PageSizeSchema = PageSizeSchema;
exports.PageUnitSchema = PageUnitSchema;
exports.PdfAssetAccessRequestSchema = PdfAssetAccessRequestSchema;
exports.PdfAuthorizationDecisionSchema = PdfAuthorizationDecisionSchema;
exports.PdfAuthorizationReasonCodeSchema = PdfAuthorizationReasonCodeSchema;
exports.PdfBuilderFeatureFlagContractSchema = PdfBuilderFeatureFlagContractSchema;
exports.PdfBuilderFeatureFlagRolloutModeSchema = PdfBuilderFeatureFlagRolloutModeSchema;
exports.PdfClassifiedDataPathSchema = PdfClassifiedDataPathSchema;
exports.PdfDataClassificationSchema = PdfDataClassificationSchema;
exports.PdfDocumentMetadataSchema = PdfDocumentMetadataSchema;
exports.PdfDocumentOutputSettingsSchema = PdfDocumentOutputSettingsSchema;
exports.PdfDocumentProfileOptionsSchema = PdfDocumentProfileOptionsSchema;
exports.PdfDocumentProfileSchema = PdfDocumentProfileSchema;
exports.PdfSecretLikeTemplateDiagnosticSchema = PdfSecretLikeTemplateDiagnosticSchema;
exports.PdfSecurityActionSchema = PdfSecurityActionSchema;
exports.PdfSecurityActorSchema = PdfSecurityActorSchema;
exports.PdfSecurityContextSchema = PdfSecurityContextSchema;
exports.PdfSecurityPermissionSchema = PdfSecurityPermissionSchema;
exports.PdfSecurityResourceSchema = PdfSecurityResourceSchema;
exports.PdfSecurityResourceTypeSchema = PdfSecurityResourceTypeSchema;
exports.PdfSignedRenderUrlRequestSchema = PdfSignedRenderUrlRequestSchema;
exports.PdfSignedRenderUrlResultSchema = PdfSignedRenderUrlResultSchema;
exports.PdfTemplateEditorSelectionSchema = PdfTemplateEditorSelectionSchema;
exports.PdfTemplateEngineSelectionReasonSchema = PdfTemplateEngineSelectionReasonSchema;
exports.PdfTemplateEngineSelectionResultSchema = PdfTemplateEngineSelectionResultSchema;
exports.PrivacyClassificationSchema = PrivacyClassificationSchema;
exports.PublishedTemplateSnapshotV1Schema = PublishedTemplateSnapshotV1Schema;
exports.QrPlaceholderPayloadSchema = QrPlaceholderPayloadSchema;
exports.QrPlaceholderSchema = QrPlaceholderSchema;
exports.RegistryVariableDefinitionSchema = RegistryVariableDefinitionSchema;
exports.RenderErrorSchema = RenderErrorSchema;
exports.RenderJobV1Schema = RenderJobV1Schema;
exports.RenderMetadataV1Schema = RenderMetadataV1Schema;
exports.RenderModeSchema = RenderModeSchema;
exports.RenderRequestSchema = RenderRequestSchema;
exports.RenderResultSchema = RenderResultSchema;
exports.RenderTimingSchema = RenderTimingSchema;
exports.RenderWarningSchema = RenderWarningSchema;
exports.RendererSchema = RendererSchema;
exports.RepeaterBindingSchema = RepeaterBindingSchema;
exports.SignaturePlaceholderSchema = SignaturePlaceholderSchema;
exports.SummaryBlockBindingSchema = SummaryBlockBindingSchema;
exports.SummaryCalculationPrecisionSchema = SummaryCalculationPrecisionSchema;
exports.SummaryCalculationReferenceSchema = SummaryCalculationReferenceSchema;
exports.TableBindingSchema = TableBindingSchema;
exports.TableColumnBindingSchema = TableColumnBindingSchema;
exports.TableGroupingBindingSchema = TableGroupingBindingSchema;
exports.TableTotalBindingSchema = TableTotalBindingSchema;
exports.TableTotalCalculationReferenceSchema = TableTotalCalculationReferenceSchema;
exports.TemplateCategorySchema = TemplateCategorySchema;
exports.TemplateLifecycleChangelogEntrySchema = TemplateLifecycleChangelogEntrySchema;
exports.TemplateLifecycleCheckSchema = TemplateLifecycleCheckSchema;
exports.TemplateLifecycleCheckStatusSchema = TemplateLifecycleCheckStatusSchema;
exports.TemplateLifecycleEngineMetadataSchema = TemplateLifecycleEngineMetadataSchema;
exports.TemplateLifecycleEventSchema = TemplateLifecycleEventSchema;
exports.TemplateLifecycleRecordV1Schema = TemplateLifecycleRecordV1Schema;
exports.TemplateLifecycleStatusSchema = TemplateLifecycleStatusSchema;
exports.TextFieldPlaceholderSchema = TextFieldPlaceholderSchema;
exports.TotalContributionsCalculationReferenceSchema = TotalContributionsCalculationReferenceSchema;
exports.UnlayerComparisonDifferenceCodeSchema = UnlayerComparisonDifferenceCodeSchema;
exports.UnlayerComparisonDifferenceSchema = UnlayerComparisonDifferenceSchema;
exports.UnlayerHtmlImportRequestSchema = UnlayerHtmlImportRequestSchema;
exports.UnlayerMigrationReportV1Schema = UnlayerMigrationReportV1Schema;
exports.UnlayerMigrationSeveritySchema = UnlayerMigrationSeveritySchema;
exports.UnlayerMigrationStatusSchema = UnlayerMigrationStatusSchema;
exports.UnlayerMigrationStrategySchema = UnlayerMigrationStrategySchema;
exports.UnlayerSideBySideComparisonRequestSchema = UnlayerSideBySideComparisonRequestSchema;
exports.UnlayerSideBySideComparisonResultSchema = UnlayerSideBySideComparisonResultSchema;
exports.UnlayerSideBySideComparisonStatusSchema = UnlayerSideBySideComparisonStatusSchema;
exports.UnlayerUnsupportedFeatureCodeSchema = UnlayerUnsupportedFeatureCodeSchema;
exports.UnlayerUnsupportedFeatureSchema = UnlayerUnsupportedFeatureSchema;
exports.VariableDefinitionSchema = VariableDefinitionSchema;
exports.VariableGroupSchema = VariableGroupSchema;
exports.VariableReferenceSchema = VariableReferenceSchema;
exports.VariableRegistryError = VariableRegistryError;
exports.VariableValueTypeSchema = VariableValueTypeSchema;
exports.archiveTemplateLifecycle = archiveTemplateLifecycle;
exports.assertProductionRenderableTemplateSnapshot = assertProductionRenderableTemplateSnapshot;
exports.authorizePdfSecurityAction = authorizePdfSecurityAction;
exports.calculateFinancialTotals = calculateFinancialTotals;
exports.calculateGroupedTableTotals = calculateGroupedTableTotals;
exports.calculateInvoiceTotals = calculateInvoiceTotals;
exports.calculateNumericAggregate = calculateNumericAggregate;
exports.calculateTableTotals = calculateTableTotals;
exports.calculateTaxDeductibleAmount = calculateTaxDeductibleAmount;
exports.cancelBatchGenerationRun = cancelBatchGenerationRun;
exports.classifyDocumentAssetUrl = classifyDocumentAssetUrl;
exports.classifyPdfDataPath = classifyPdfDataPath;
exports.coreVariableDefinitions = coreVariableDefinitions;
exports.coreVariableRegistry = coreVariableRegistry;
exports.createBatchDocumentJobs = createBatchDocumentJobs;
exports.createBatchDownloadManifest = createBatchDownloadManifest;
exports.createBatchGenerationDefinition = createBatchGenerationDefinition;
exports.createBatchGenerationRun = createBatchGenerationRun;
exports.createBatchResultManifest = createBatchResultManifest;
exports.createDataSnapshotHash = createDataSnapshotHash;
exports.createFakePdfPermissionAdapter = createFakePdfPermissionAdapter;
exports.createRetryBatchDocumentJob = createRetryBatchDocumentJob;
exports.createScopedRepeaterContext = createScopedRepeaterContext;
exports.createTemplateLifecycle = createTemplateLifecycle;
exports.createUnlayerMigrationReport = createUnlayerMigrationReport;
exports.createVariableRegistry = createVariableRegistry;
exports.createVariableResolver = createVariableResolver;
exports.defaultDocumentHeaderFooterSettings = defaultDocumentHeaderFooterSettings;
exports.defaultVariableFormatters = defaultVariableFormatters;
exports.duplicateTemplateLifecycle = duplicateTemplateLifecycle;
exports.evaluateConditionalRule = evaluateConditionalRule;
exports.evaluateConditionalRules = evaluateConditionalRules;
exports.findSecretLikeTemplateValues = findSecretLikeTemplateValues;
exports.formatVariableValue = formatVariableValue;
exports.getValueAtDataPath = getValueAtDataPath;
exports.isProductionRenderableTemplateSnapshot = isProductionRenderableTemplateSnapshot;
exports.normalizeVariableFormatterOptions = normalizeVariableFormatterOptions;
exports.pdfTemplateSchemaBoundary = pdfTemplateSchemaBoundary;
exports.publishTemplateVersion = publishTemplateVersion;
exports.redactPdfSecurityLogValue = redactPdfSecurityLogValue;
exports.redactRenderMetadataForClient = redactRenderMetadataForClient;
exports.resolveDocumentTheme = resolveDocumentTheme;
exports.resolveRepeaterItems = resolveRepeaterItems;
exports.resolveTableRows = resolveTableRows;
exports.resolveVariableValue = resolveVariableValue;
exports.resolveVariableValues = resolveVariableValues;
exports.restoreTemplateLifecycle = restoreTemplateLifecycle;
exports.selectPdfTemplateEngine = selectPdfTemplateEngine;
exports.stableStringifyJsonValue = stableStringifyJsonValue;
exports.starterPdfTemplateCategories = starterPdfTemplateCategories;
exports.starterPdfTemplateFixtureByCategory = starterPdfTemplateFixtureByCategory;
exports.starterPdfTemplateFixtures = starterPdfTemplateFixtures;
exports.summarizeBatchProgress = summarizeBatchProgress;
exports.transitionBatchDocumentJob = transitionBatchDocumentJob;
exports.updateTemplateDraft = updateTemplateDraft;
