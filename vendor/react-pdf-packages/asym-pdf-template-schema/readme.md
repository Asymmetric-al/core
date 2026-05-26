# @asym/pdf-template-schema

Phase 38 schema, typed variable registry, variable resolution, conditional
rule, repeater, financial data table, calculation, summary block, placeholder,
page-flow, header/footer, asset pipeline, branding/theme, starter template,
template lifecycle, batch generation, PDF metadata/profile, and security and
tenant contract foundation for the Asym PDF Document Builder, plus Unlayer
migration and coexistence contracts.

## Purpose

This package owns shared document template types, runtime schema, versioning
primitives, variable domains, variable resolution and formatting, page
settings, asset references, render metadata, batch metadata, audit-oriented
model types, adapter-only security contracts, and Unlayer migration/coexistence
contracts. Phase 36 also owns structured PDF metadata, language, keyword, and
PDF/A or PDF/UA profile option schemas.

Phase 17 adds React-free repeater resolution on top of the typed nonprofit
document variable registry, resolver, and condition evaluator. The registry,
resolver, condition evaluator, and repeater resolver can be imported by the
schema package, renderer, preview, future preflight, and future
`Asymmetric-al/core` adapter code without pulling editor UI or DocRaptor
behavior into browser bundles.

Phase 18 adds React-free financial data table bindings and row resolution.
Table bindings define source paths, stable columns, labels, value types,
formatter hints, width hints, alignment, repeated header behavior, max-row
guards, empty-state text, grouping metadata, and totals declarations. Phase 23
uses those declarations to render calculated table total rows.

Phase 21 adds deterministic annual giving statement, invoice, and financial
report table preview fixtures under `test/fixtures`. These fixtures are
package test data for schema, editor, renderer, browser preview, and mocked
DocRaptor preview coverage; they are not public starter templates.

Phase 22 adds React-free deterministic calculation helpers for sums, counts,
practical averages, min/max, grouped subtotals, invoice subtotal/total,
income/expense/net, and tax-deductible amount. Calculations operate on
structured data paths and return structured diagnostics; they do not evaluate
template JavaScript or render total rows.

Phase 23 adds structured summary block bindings and calculation references for
total contributions, invoice totals, financial report totals, grouped
subtotals, grand totals, and table totals. Summary references are structured
data-path contracts only; arbitrary JavaScript expressions are rejected by the
schemas.

Phase 24 adds structured document placeholder contracts for text fields,
checkboxes, signatures, initials, dates, and QR placeholders. These contracts
are future-compatible with platform adapters while staying provider-free:
they validate labels when present, reject unsafe QR URL schemes, and do not
implement live form submission, e-signature workflows, or signed-document
storage.

Phase 25 adds structured page-flow contracts. `pageBreak` nodes store stable
IDs and labels, section controls can request keep-together and
start-on-new-page behavior, headings can opt in or out of avoid-break-after
behavior, and table bindings default to avoid-row-split hints. These controls
are print hints for renderer/preflight/audit use; they do not claim browser
preview proves final DocRaptor pagination.

Phase 26 adds structured header/footer contracts to page settings. Regions
declare placement (`header` or `footer`), scope (`first_page` or `repeating`),
enabled state, alignment, minimum margin, and typed tokens for text, document
title, organization footer, page number, and total pages. These settings remain
structured JSON contracts; renderer packages own DocRaptor-compatible
margin-box serialization.

Phase 27 adds structured asset references and asset image node contracts.
Assets can carry a provider-neutral reference ID, role, asset ID, optional
preview URL, render-safe URL, MIME type, alt text, dimensions, alignment,
optional link, tenant ID, source metadata, required flag, and render-safe flag.
The package also defines adapter interfaces for asset lookup and render-safe
URL generation without choosing a storage backend.

Phase 28 expands the document theme model. Themes now support brand source
metadata, tenant brand IDs, approved override-field metadata, organization
identity, logo asset references, validated brand color tokens, heading/body
font families, fallback font stacks, footer text, and receipt defaults.
`resolveDocumentTheme` merges system defaults, tenant defaults, and
template-level overrides deterministically, while `DocumentThemeDefaultsAdapter`
keeps future tenant brand lookup outside this package.

Phase 29 promotes public starter template fixtures from test-only examples to a
schema-owned catalog. `starterPdfTemplateFixtures` includes donation receipt,
tax receipt, annual giving statement, donor letter, missionary support report,
financial report, invoice, and certificate templates. Each starter remains
structured `DocumentTemplateV1` JSON with fictional sample data, metadata,
page settings, theme, variables, bindings, expected warning codes, and renderer
snippet hints. The catalog does not fetch real donor, financial, tenant, or
asset data.

Phase 31 adds shared render and audit contracts. `RenderMetadataV1Schema`
captures render IDs, tenant and actor IDs, template version, deterministic data
snapshot hashes, renderer mode, DocRaptor metadata, timings, page settings,
warnings, errors, artifacts, and batch IDs. `DocumentArtifactLocationSchema`
adds typed storage, URL, and adapter-reference locations while preserving
legacy `storageKey` and `url` fields. `AuditEventSchema` now covers template,
render, batch, and artifact lifecycle events. The hash helpers use stable JSON
serialization and a browser-safe FNV-1a checksum; they are audit context, not a
cryptographic proof.

Phase 32 adds template lifecycle and publishing contracts. The package exports
draft/published/archived lifecycle metadata, validation and preflight check
status shapes, engine metadata, changelog events, immutable published snapshot
schemas, and pure helpers for create, update, publish, duplicate, archive, and
restore behavior. Production render guards accept only immutable published
native snapshots, which prevents mutable drafts or legacy-engine templates from
becoming official render inputs.

Phase 33 adds queue-agnostic batch generation contracts. Batch definitions
start from immutable published snapshots and passing batch preflight, then
produce deterministic per-document jobs, progress summaries, retry and
cancellation state transitions, structured failure reasons, result manifests,
download manifests, and adapter-only queue boundaries. The package still does
not choose a queue library, persist jobs, call DocRaptor, or import
`Asymmetric-al/core`.

Phase 36 adds `PdfDocumentMetadataSchema`,
`PdfDocumentProfileOptionsSchema`, and `PdfDocumentOutputSettingsSchema`.
Templates now carry `pdfSettings` for title, subject, author, organization,
language, keywords, and supported PDF/A or PDF/UA profile requests. These are
structured requests and warnings support; they do not prove PDF/A or PDF/UA
compliance by themselves.

Phase 37 adds adapter-only security and tenant contracts. The package now
exports tenant-scoped actor contexts, permission/action schemas, authorization
decisions, fake permission adapters for package tests, asset access contracts,
signed render URL contracts, deterministic PII/financial-PII classification,
secret-like template value detection, and shared log redaction helpers. These
contracts do not implement platform auth, storage, queues, or core integration.

Phase 38 adds Unlayer migration and coexistence contracts. The package now
exports legacy Unlayer template references with historical PDF artifact
references, manual-rebuild migration reports, unsupported-feature diagnostics,
report-only HTML import request shapes, native-builder feature flag contracts,
engine selection helpers, and side-by-side comparison result contracts. These
contracts keep legacy templates pass-through by default and do not implement a
full Unlayer JSON converter.

Phase 40 adds runnable developer examples under
`examples/pdf-document-builder`. Those examples import the starter fixture
catalog, validate structured templates, publish an immutable annual-statement
snapshot for batch planning, and keep sample data fictional and deterministic.

Phase 43 adds security audit helpers for core-readiness. The package exports
`classifyDocumentAssetUrl` to distinguish public render-safe URLs, signed
render URLs, browser blob URLs, private app-session URLs, non-HTTPS URLs,
unsafe schemes, and invalid URLs. It also exports
`redactRenderMetadataForClient` as the explicit render-metadata redaction
helper for future adapter responses.

## Public API Promise

The public API is the shared schema contract for later editor, renderer,
DocRaptor, batch, and core-adapter phases. Runtime schemas and inferred
TypeScript types are exported together:

- `pdfTemplateSchemaBoundary`
- `PdfTemplateSchemaBoundary`
- `DocumentTemplateV1Schema` / `DocumentTemplateV1`
- `DocumentTemplateV1Input`
- `DocumentPageSettingsSchema` / `DocumentPageSettings`
- `DocumentThemeSchema` / `DocumentTheme`
- `resolveDocumentTheme`
- `DocumentThemeDefaultsAdapter`
- `DocumentBrandingMetadataSchema` / `DocumentBrandingMetadata`
- `DocumentThemeColorsSchema` / `DocumentThemeColors`
- `DocumentThemeFontsSchema` / `DocumentThemeFonts`
- `DocumentReceiptDefaultsSchema` / `DocumentReceiptDefaults`
- `PdfSecurityContextSchema` / `PdfSecurityContext`
- `PdfSecurityPermissionSchema` / `PdfSecurityPermission`
- `authorizePdfSecurityAction`
- `createFakePdfPermissionAdapter`
- `classifyPdfDataPath`
- `classifyDocumentAssetUrl`
- `findSecretLikeTemplateValues`
- `redactPdfSecurityLogValue`
- `redactRenderMetadataForClient`
- `PdfSignedRenderUrlRequestSchema` / `PdfSignedRenderUrlResultSchema`
- `LegacyPdfTemplateReferenceSchema` / `LegacyPdfTemplateReference`
- `UnlayerMigrationReportV1Schema` / `UnlayerMigrationReportV1`
- `createUnlayerMigrationReport`
- `UnlayerUnsupportedFeatureSchema` / `UnlayerUnsupportedFeature`
- `UnlayerHtmlImportRequestSchema` / `UnlayerHtmlImportRequest`
- `PdfBuilderFeatureFlagContractSchema` /
  `PdfBuilderFeatureFlagContract`
- `selectPdfTemplateEngine`
- `UnlayerSideBySideComparisonResultSchema` /
  `UnlayerSideBySideComparisonResult`
- `VariableDefinitionSchema` / `VariableDefinition`
- `RegistryVariableDefinitionSchema` / `RegistryVariableDefinition`
- `createVariableRegistry`
- `coreVariableDefinitions`
- `coreVariableRegistry`
- `VariableRegistry`
- `VariableRegistryError`
- `createVariableResolver`
- `resolveVariableValue`
- `resolveVariableValues`
- `formatVariableValue`
- `getValueAtDataPath`
- `defaultVariableFormatters`
- `VariableResolver`
- `ResolvedVariableValue`
- `VariableResolutionDiagnostic`
- `evaluateConditionalRule`
- `evaluateConditionalRules`
- `ConditionalRuleEvaluationResult`
- `ConditionalEvaluationDiagnostic`
- `VariableReferenceSchema` / `VariableReference`
- `DataBindingSchema` / `DataBinding`
- `ConditionalRuleSchema` / `ConditionalRule`
- `RepeaterBindingSchema` / `RepeaterBinding` / `RepeaterBindingInput`
- `resolveRepeaterItems`
- `createScopedRepeaterContext`
- `ResolvedRepeaterItem`
- `RepeaterResolutionDiagnostic`
- `TableBindingSchema` / `TableBinding` / `TableBindingInput`
- `TableColumnBindingSchema` / `TableColumnBinding`
- `TableGroupingBindingSchema` / `TableGroupingBinding`
- `TableTotalBindingSchema` / `TableTotalBinding`
- `resolveTableRows`
- `ResolvedTableRow`
- `ResolvedTableCell`
- `TableResolutionDiagnostic`
- `calculateNumericAggregate`
- `calculateTableTotals`
- `calculateGroupedTableTotals`
- `calculateInvoiceTotals`
- `calculateFinancialTotals`
- `calculateTaxDeductibleAmount`
- `CalculationDecimalValue`
- `CalculationDiagnostic`
- `SummaryBlockBindingSchema` / `SummaryBlockBinding` /
  `SummaryBlockBindingInput`
- `SummaryCalculationReferenceSchema` / `SummaryCalculationReference`
- `DocumentPlaceholderSchema` / `DocumentPlaceholder` /
  `DocumentPlaceholderInput`
- `QrPlaceholderPayloadSchema` / `QrPlaceholderPayload`
- `DocumentPageBreakNodeSchema` / `DocumentPageBreakNode`
- `DocumentPageBreakAttributesSchema` / `DocumentPageBreakAttributes`
- `PageFlowControlAttributesSchema` / `PageFlowControlAttributes`
- `DocumentHeaderFooterSettingsSchema` / `DocumentHeaderFooterSettings`
- `HeaderFooterRegionSchema` / `HeaderFooterRegion`
- `HeaderFooterContentTokenSchema` / `HeaderFooterContentToken`
- `DocumentAssetReferenceSchema` / `DocumentAssetReference`
- `DocumentAssetImageNodeSchema` / `DocumentAssetImageNode`
- `DocumentAssetLookupAdapter`
- `DocumentRenderSafeUrlAdapter`
- `AssetReferenceSchema` / `AssetReference`
- `RenderRequestSchema` / `RenderRequest`
- `RenderResultSchema` / `RenderResult`
- `RenderWarningSchema` / `RenderWarning`
- `RenderErrorSchema` / `RenderError`
- `RenderMetadataV1Schema` / `RenderMetadataV1`
- `RenderTimingSchema` / `RenderTiming`
- `DocRaptorRenderMetadataSchema` / `DocRaptorRenderMetadata`
- `DocumentArtifactLocationSchema` / `DocumentArtifactLocation`
- `RenderJobV1Schema` / `RenderJobV1`
- `BatchRunV1Schema` / `BatchRunV1`
- `DocumentArtifactSchema` / `DocumentArtifact`
- `AuditEventSchema` / `AuditEvent`
- `createDataSnapshotHash`
- `stableStringifyJsonValue`
- `TemplateLifecycleRecordV1Schema` / `TemplateLifecycleRecordV1`
- `PublishedTemplateSnapshotV1Schema` / `PublishedTemplateSnapshotV1`
- `TemplateLifecycleCheckSchema` / `TemplateLifecycleCheck`
- `TemplateLifecycleEngineMetadataSchema` /
  `TemplateLifecycleEngineMetadata`
- `TemplateLifecycleChangelogEntrySchema` /
  `TemplateLifecycleChangelogEntry`
- `createTemplateLifecycle`
- `updateTemplateDraft`
- `publishTemplateVersion`
- `duplicateTemplateLifecycle`
- `archiveTemplateLifecycle`
- `restoreTemplateLifecycle`
- `assertProductionRenderableTemplateSnapshot`
- `isProductionRenderableTemplateSnapshot`
- `BatchGenerationDefinitionV1Schema` / `BatchGenerationDefinitionV1`
- `BatchDocumentJobV1Schema` / `BatchDocumentJobV1`
- `BatchGenerationRunV1Schema` / `BatchGenerationRunV1`
- `BatchProgressSummarySchema` / `BatchProgressSummary`
- `BatchFailureReasonSchema` / `BatchFailureReason`
- `BatchResultManifestV1Schema` / `BatchResultManifestV1`
- `BatchDownloadManifestV1Schema` / `BatchDownloadManifestV1`
- `BatchQueueAdapter`
- `createBatchGenerationDefinition`
- `createBatchDocumentJobs`
- `createBatchGenerationRun`
- `transitionBatchDocumentJob`
- `createRetryBatchDocumentJob`
- `cancelBatchGenerationRun`
- `summarizeBatchProgress`
- `createBatchResultManifest`
- `createBatchDownloadManifest`
- `starterPdfTemplateFixtures`
- `starterPdfTemplateCategories`
- `starterPdfTemplateFixtureByCategory`
- `StarterPdfTemplateFixture`
- `StarterPdfTemplateCategory`

Zod is the runtime validation library for Phase 6 because it is already in the
workspace catalog and supports TypeScript inference plus future JSON Schema
conversion.

The Phase 13 registry covers `organization`, `recipient`, `donation`,
`document`, `missionary`, `tax_receipt`, `financial_report`, `statement`,
`invoice`, `asset`, and `computed` groups. Registry definitions include stable
keys, labels, descriptions, value types, sample values, required flags,
fallback behavior, formatter hints, privacy classification, source paths, and
document categories.

Sample data is deterministic and uses fictional values only:

```ts
import {
  coreVariableRegistry,
  resolveVariableValue,
} from '@asym/pdf-template-schema';

const sampleData = coreVariableRegistry.createSampleData('donation_receipt');
const requiredVariables = coreVariableRegistry.listRequired('donation_receipt');
const unknownKeys = coreVariableRegistry.detectUnknownKeys([
  'recipient.full_name',
  'unknown.merge_tag',
]);
const recipientName = resolveVariableValue({
  context: sampleData,
  key: 'recipient.full_name',
});
```

The Phase 14 resolver uses deterministic defaults: `en-US`, `USD`, and `UTC`.
It supports nested source paths, required and optional diagnostics, fallback
values, formatter overrides, type validation, and display formatting for
currency, dates, date ranges, numbers, percentages, addresses, receipt and
invoice numbers, fiscal periods, booleans, URLs, and image URLs.

Missing values are paths that are not found or values that are `null` or
`undefined`. Missing required variables produce errors. Missing optional
variables produce warnings and may use fallback values when the registry
definition allows it.

Phase 16 conditional rules use structured operators only:
`exists`, `not_exists`, `equals`, `not_equals`, `greater_than`,
`greater_than_or_equal`, `less_than`, `less_than_or_equal`, `contains`,
`not_contains`, `is_empty`, `is_not_empty`, `in`, and `not_in`. The evaluator
uses dotted data paths, returns structured diagnostics, and treats
JavaScript-looking strings as inert data.

Phase 17 repeater bindings resolve array source paths, scoped item aliases,
optional index aliases, structured filters, structured sorting, empty states,
and max-item guards. Repeater filtering reuses `ConditionalRule` with
deterministic AND semantics and never evaluates arbitrary JavaScript. Scoped
contexts are created without mutating the root data context.

Phase 18 table bindings resolve array source paths into deterministic rows and
formatted display cells. Missing sources, non-array sources, invalid bindings,
row truncation, and unsupported column values return structured diagnostics
instead of throwing. Column widths are schema-validated CSS lengths or
percentages so table output cannot inject arbitrary inline CSS.

Phase 22 calculation helpers use deterministic decimal arithmetic with BigInt
minor units. The default precision is scale `2` with `half_away_from_zero`
rounding. Public calculation values expose fixed decimal strings,
integer-string minor units, scale, and contributing count so callers do not
depend on floating-point display. No decimal dependency is added because the
current operations only need path-based add/subtract, min/max, average,
grouping, and invoice quantity-rate multiplication.
Grouped calculations preserve original source-array indexes in diagnostics and
keep grand totals aligned with rows that have valid group keys.

Phase 23 summary block bindings declare which calculation a renderer may
display. Supported references are `total_contributions`, `invoice_totals`,
`financial_report_totals`, `grouped_subtotals`, `grand_total`, and
`table_total`. Each reference stores data paths, field selection, labels, and
optional precision metadata instead of expression strings.

Phase 24 placeholder bindings declare print-safe document placeholders. Text
fields, checkboxes, dates, signatures, initials, and QR placeholders are stored
as structured JSON with stable IDs, optional labels, required flags, adapter
keys, and data paths. QR payloads are limited to safe `http`/`https` URLs,
plain text, or typed variable keys; `javascript:`, `blob:`, `data:`, and
expression-style payloads are rejected.

Phase 25 page-flow contracts declare explicit `pageBreak` nodes and
boolean-only page-flow attributes. `keepTogether`, `startOnNewPage`,
`avoidBreakAfter`, and `avoidRowSplit` are structured booleans, not expression
strings. `TableBindingSchema` defaults `avoidRowSplit` to `true` while
allowing callers to opt out when a table layout must split rows.

Phase 26 header/footer settings are attached to `DocumentPageSettingsSchema`.
They support no configured regions by default, first-page-only regions,
repeating regions, disabled first-page overrides, document title and
organization footer tokens, and Page X of Y token composition without raw CSS
or arbitrary expressions.

## Non-goals

- No PDF editor UI.
- No DocRaptor API calls.
- No browser-only APIs.
- No tenant storage, platform auth, or queue implementation. Phase 37 exports
  adapter contracts only.
- No full Unlayer JSON converter or lossless migration claim. Phase 38 exports
  manual-rebuild and report-only coexistence contracts only.
- No print HTML serialization.
- No tenant-authored custom starter marketplace or template publishing flow.
  Phase 29 exports a fixed package-level starter fixture catalog only.
- No proof that browser preview pagination matches DocRaptor pagination.
- No editor variable chip extension; Phase 15 owns editor insertion and chip
  behavior.
- No arbitrary JavaScript template logic.
- No substitution of variable nodes into rendered HTML; later renderer,
  preview, and preflight phases decide where resolved values are applied.
- No live form submission, e-signature provider calls, signed-document
  storage, or generated QR image output; Phase 24 owns placeholder contracts
  only.

## Maturity

`phase-38-unlayer-migration`. The package is private to prevent
accidental publication while the shared model is still evolving.

## Development

```sh
pnpm --filter @asym/pdf-template-schema build
pnpm --filter @asym/pdf-template-schema typecheck
pnpm --filter @asym/pdf-template-schema test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, and tsdown
toolchain first.
