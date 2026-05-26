import { DocumentTemplateV1Schema, LegacyPdfTemplateReferenceSchema, PdfBuilderFeatureFlagContractSchema, PdfSignedRenderUrlResultSchema, createFakePdfPermissionAdapter, selectPdfTemplateEngine, starterPdfTemplateFixtureByCategory } from "@asym/pdf-template-schema";
//#region src/index.ts
const pdfStudioAdapterBoundary = {
	consumes: [
		"@asym/pdf-template-schema",
		"@asym/pdf-editor",
		"@asym/pdf-renderer",
		"@asym/docraptor-client"
	],
	maturity: "phase-39-core-adapter-contract",
	owns: "core-integration-adapter",
	packageName: "@asym/pdf-studio-adapter",
	runtime: "shared-adapter-contract"
};
var PdfStudioAdapterError = class extends Error {
	code;
	decision;
	constructor(input) {
		super(input.message);
		this.name = "PdfStudioAdapterError";
		this.code = input.code;
		this.decision = input.decision;
	}
};
function createPdfStudioAdapter(dependencies) {
	return {
		boundary: pdfStudioAdapterBoundary,
		createEditor(input) {
			return dependencies.editor.createEditor({
				...input,
				variableRegistry: dependencies.variableRegistry
			});
		},
		async createSignedAssetUrl(input) {
			if (dependencies.assets === void 0) throwMissingAdapter("assets");
			const request = input.request;
			const purpose = request.purpose === "browser_preview" ? "preview" : request.purpose;
			const assetRequest = {
				assetId: request.assetId,
				purpose,
				tenantId: request.tenantId
			};
			const authorization = await dependencies.assets.authorizeAssetAccess(assetRequest);
			if (!authorization.ok) throw new PdfStudioAdapterError({
				code: "unauthorized",
				decision: authorization,
				message: authorization.message ?? "Asset access denied by adapter."
			});
			if (dependencies.assets.createSignedRenderUrl === void 0) throwMissingAdapter("assets.createSignedRenderUrl");
			const signedUrl = await dependencies.assets.createSignedRenderUrl(request);
			if (signedUrl === void 0) return;
			return PdfSignedRenderUrlResultSchema.parse(signedUrl);
		},
		async loadLifecycle(input) {
			return dependencies.lifecycle.loadLifecycle(input);
		},
		async loadTemplate(input) {
			const normalizedRecord = normalizeTemplateRecord(await dependencies.templates.loadTemplate(input));
			const featureFlag = PdfBuilderFeatureFlagContractSchema.parse(await dependencies.featureFlags.resolveNativeBuilderFlag({
				engine: normalizedRecord.engine,
				templateId: input.templateId,
				tenantId: input.tenantId
			}));
			return {
				engineSelection: selectPdfTemplateEngine({
					featureFlag,
					templateEngine: normalizedRecord.engine
				}),
				featureFlag,
				record: normalizedRecord
			};
		},
		async previewTemplate(input) {
			const template = DocumentTemplateV1Schema.parse(input.template);
			return {
				authorization: await authorizeOrThrow({
					action: "preview_render",
					auth: dependencies.auth,
					context: input.context,
					resource: createTemplateResource(template, input.context.tenantId)
				}),
				preflight: await dependencies.preflight.run({
					dataContext: input.dataContext,
					mode: "authoring",
					template
				}),
				preview: await dependencies.preview.createPreview({
					dataContext: input.dataContext,
					previewId: input.previewId,
					template
				})
			};
		},
		async renderTemplate(input) {
			const template = DocumentTemplateV1Schema.parse(input.template);
			const authorization = await authorizeOrThrow({
				action: "production_render",
				auth: dependencies.auth,
				context: input.context,
				resource: createTemplateResource(template, input.context.tenantId)
			});
			const preflight = await dependencies.preflight.run({
				dataContext: input.dataContext,
				mode: "production_render",
				template
			});
			if (!preflight.ok) throw new PdfStudioAdapterError({
				code: "preflight_failed",
				message: "Production render requires passing preflight."
			});
			return {
				authorization,
				preflight,
				render: await dependencies.render.render({
					dataContext: input.dataContext,
					docraptorClient: dependencies.docraptorClient,
					renderId: input.renderId,
					renderer: "docraptor",
					template
				})
			};
		},
		async saveLifecycle(input) {
			return dependencies.lifecycle.saveLifecycle(input);
		},
		async saveTemplate(input) {
			const template = DocumentTemplateV1Schema.parse(input.template);
			return normalizeTemplateRecord(await dependencies.templates.saveTemplate({
				...input,
				template
			}));
		},
		selectTemplateEngine(input) {
			return selectPdfTemplateEngine(input);
		},
		async startBatch(input) {
			if (dependencies.batch === void 0) throwMissingAdapter("batch");
			return {
				authorization: await authorizeOrThrow({
					action: "start_batch",
					auth: dependencies.auth,
					context: input.context,
					resource: {
						id: input.run.id,
						tenantId: input.run.tenantId ?? input.context.tenantId,
						type: "batch"
					}
				}),
				result: await dependencies.batch.startBatch({
					jobs: input.jobs,
					run: input.run
				})
			};
		}
	};
}
function normalizeTemplateRecord(record) {
	if (record.engine === "unlayer") return {
		engine: "unlayer",
		legacyTemplate: LegacyPdfTemplateReferenceSchema.parse(record.legacyTemplate)
	};
	return {
		engine: "asym_pdf_document_builder",
		lifecycle: record.lifecycle,
		publishedSnapshot: record.publishedSnapshot,
		template: DocumentTemplateV1Schema.parse(record.template)
	};
}
async function authorizeOrThrow(input) {
	const decision = await input.auth.authorize({
		action: input.action,
		context: input.context,
		resource: input.resource
	});
	if (!decision.ok) throw new PdfStudioAdapterError({
		code: "unauthorized",
		decision,
		message: decision.message ?? "PDF Studio adapter authorization denied."
	});
	return decision;
}
function createTemplateResource(template, fallbackTenantId) {
	const tenantId = typeof template.metadata === "object" && template.metadata !== null && "tenantId" in template.metadata && typeof template.metadata.tenantId === "string" ? template.metadata.tenantId : fallbackTenantId;
	return {
		id: template.id,
		tenantId,
		type: "template"
	};
}
function throwMissingAdapter(adapterName) {
	throw new PdfStudioAdapterError({
		code: "missing_adapter",
		message: `PDF Studio adapter dependency is missing: ${adapterName}.`
	});
}
//#endregion
export { PdfStudioAdapterError, createFakePdfPermissionAdapter, createPdfStudioAdapter, pdfStudioAdapterBoundary, starterPdfTemplateFixtureByCategory };

//# sourceMappingURL=index.mjs.map