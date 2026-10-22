import { LegacyPdfTemplateArtifactSchema, LegacyPdfTemplateReferenceSchema, PdfBuilderFeatureFlagContractSchema, PdfTemplateEngineSelectionResultSchema, UnlayerComparisonDifferenceSchema, UnlayerHtmlImportRequestSchema, UnlayerMigrationReportV1Schema, UnlayerSideBySideComparisonRequestSchema, UnlayerSideBySideComparisonResultSchema, UnlayerUnsupportedFeatureSchema, createUnlayerMigrationReport, selectPdfTemplateEngine } from "@asym/pdf-template-schema";
// src/migration/unlayer/index.ts
const unlayerMigrationBoundary = {
	packageName: "@asym/pdf-editor",
	sourceEngine: "unlayer",
	strategy: "manual_rebuild_with_report",
	targetEngine: "asym_pdf_document_builder"
};
export { LegacyPdfTemplateArtifactSchema, LegacyPdfTemplateReferenceSchema, PdfBuilderFeatureFlagContractSchema, PdfTemplateEngineSelectionResultSchema, UnlayerComparisonDifferenceSchema, UnlayerHtmlImportRequestSchema, UnlayerMigrationReportV1Schema, UnlayerSideBySideComparisonRequestSchema, UnlayerSideBySideComparisonResultSchema, UnlayerUnsupportedFeatureSchema, createUnlayerMigrationReport, selectPdfTemplateEngine, unlayerMigrationBoundary };

//# sourceMappingURL=unlayer.mjs.map