# @asym/pdf-template-schema

> Historical phase-baseline notes follow. For the current restored 0.1.0 API,
> exports, supported toolchain and qualification, see
> [Core PDF modernization](../../docs/maintenance/core-pdf-modernization/README.md)
> and this package's `src/index.ts` and `package.json`. Later shipped functionality
> supersedes the phase-specific omissions below; native-builder rollout remains unchanged.

Phase 22 schema, typed variable registry, variable resolution, conditional
rule, repeater, financial data table, and calculation foundation
for the Asym PDF Document Builder.

## Purpose

This package owns shared document template types, runtime schema, versioning
primitives, variable domains, variable resolution and formatting, page
settings, asset references, render metadata, batch metadata, and
audit-oriented model types.

Phase 17 adds React-free repeater resolution on top of the typed nonprofit
document variable registry, resolver, and condition evaluator. The registry,
resolver, condition evaluator, and repeater resolver can be imported by the
schema package, renderer, preview, future preflight, and future
`Asymmetric-al/core` adapter code without pulling editor UI or DocRaptor
behavior into browser bundles.

Phase 18 adds React-free financial data table bindings and row resolution.
Table bindings define source paths, stable columns, labels, value types,
formatter hints, width hints, alignment, repeated header behavior, max-row
guards, empty-state text, grouping metadata, and totals placeholders. Totals
remain declarative placeholders until renderer integration in Phase 23.

Phase 21 adds deterministic annual giving statement, invoice, and financial
report table preview fixtures under `test/fixtures`. These fixtures are
package test data for schema, editor, renderer, browser preview, and mocked
DocRaptor preview coverage; they are not public starter templates.

Phase 22 adds React-free deterministic calculation helpers for sums, counts,
practical averages, min/max, grouped subtotals, invoice subtotal/total,
income/expense/net, and tax-deductible amount. Calculations operate on
structured data paths and return structured diagnostics; they do not evaluate
template JavaScript or render total rows.

## Public API Promise

The public API is the shared schema contract for later editor, renderer,
DocRaptor, batch, and core-adapter phases. Runtime schemas and inferred
TypeScript types are exported together:
- `pdfTemplateSchemaBoundary`
- `PdfTemplateSchemaBoundary`
- `DocumentTemplateV1Schema` / `DocumentTemplateV1`
- `DocumentPageSettingsSchema` / `DocumentPageSettings`
- `DocumentThemeSchema` / `DocumentTheme`
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
- `AssetReferenceSchema` / `AssetReference`
- `RenderRequestSchema` / `RenderRequest`
- `RenderResultSchema` / `RenderResult`
- `RenderWarningSchema` / `RenderWarning`
- `RenderErrorSchema` / `RenderError`
- `RenderJobV1Schema` / `RenderJobV1`
- `BatchRunV1Schema` / `BatchRunV1`
- `DocumentArtifactSchema` / `DocumentArtifact`
- `AuditEventSchema` / `AuditEvent`

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

## Non-goals

- No PDF editor UI.
- No DocRaptor API calls.
- No browser-only APIs.
- No tenant storage, auth, or queue integration.
- No print HTML serialization.
- No starter template exports; Phase 24 owns starter templates and golden
  fixtures.
- No editor variable chip extension; Phase 15 owns editor insertion and chip
  behavior.
- No arbitrary JavaScript template logic.
- No substitution of variable nodes into rendered HTML; later renderer,
  preview, and preflight phases decide where resolved values are applied.
- No rendered summary blocks or table total rows; Phase 23 owns rendering
  calculated values into documents.

## Maturity

`phase-22-calculation-engine`. The package is private to prevent accidental
publication while the shared model is still evolving.

## Development

```sh
pnpm --filter @asym/pdf-template-schema build
pnpm --filter @asym/pdf-template-schema typecheck
pnpm --filter @asym/pdf-template-schema test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, and tsdown
toolchain first.
