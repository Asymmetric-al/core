Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _asym_pdf_template_schema = require("@asym/pdf-template-schema");
//#region src/migration/unlayer/index.ts
const unlayerMigrationBoundary = {
	packageName: "@asym/pdf-editor",
	sourceEngine: "unlayer",
	strategy: "manual_rebuild_with_report",
	targetEngine: "asym_pdf_document_builder"
};
//#endregion
Object.defineProperty(exports, "LegacyPdfTemplateArtifactSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.LegacyPdfTemplateArtifactSchema;
	}
});
Object.defineProperty(exports, "LegacyPdfTemplateReferenceSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.LegacyPdfTemplateReferenceSchema;
	}
});
Object.defineProperty(exports, "PdfBuilderFeatureFlagContractSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.PdfBuilderFeatureFlagContractSchema;
	}
});
Object.defineProperty(exports, "PdfTemplateEngineSelectionResultSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.PdfTemplateEngineSelectionResultSchema;
	}
});
Object.defineProperty(exports, "UnlayerComparisonDifferenceSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerComparisonDifferenceSchema;
	}
});
Object.defineProperty(exports, "UnlayerHtmlImportRequestSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerHtmlImportRequestSchema;
	}
});
Object.defineProperty(exports, "UnlayerMigrationReportV1Schema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerMigrationReportV1Schema;
	}
});
Object.defineProperty(exports, "UnlayerSideBySideComparisonRequestSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerSideBySideComparisonRequestSchema;
	}
});
Object.defineProperty(exports, "UnlayerSideBySideComparisonResultSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerSideBySideComparisonResultSchema;
	}
});
Object.defineProperty(exports, "UnlayerUnsupportedFeatureSchema", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.UnlayerUnsupportedFeatureSchema;
	}
});
Object.defineProperty(exports, "createUnlayerMigrationReport", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.createUnlayerMigrationReport;
	}
});
Object.defineProperty(exports, "selectPdfTemplateEngine", {
	enumerable: true,
	get: function() {
		return _asym_pdf_template_schema.selectPdfTemplateEngine;
	}
});
exports.unlayerMigrationBoundary = unlayerMigrationBoundary;
