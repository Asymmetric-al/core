# @asym/pdf-renderer

> Historical phase-baseline notes follow. For the current restored 0.1.0 API,
> exports, supported toolchain and qualification, see
> [Core PDF modernization](../../docs/maintenance/core-pdf-modernization/README.md)
> and this package's `src/index.ts` and `package.json`. Later shipped functionality
> supersedes the phase-specific omissions below; native-builder rollout remains unchanged.

Phase 21 preview, variable resolution, conditional rendering, repeater, and financial data table renderer foundation for the Asym PDF Document
Builder print renderer.

## Purpose

This package owns deterministic document serialization, print-ready HTML,
paged-media CSS foundations, browser-safe preview helpers, server-only
DocRaptor test preview orchestration, renderer variable resolution adapters,
conditional section rendering, and renderer fixtures.
Phase 17 also owns structured repeater rendering and scoped variable metadata
for repeated rows.
Phase 20 formally hardens deterministic data-bound table rendering for
financial reports, annual statements, invoices, and donation rows. Phase 21
adds deterministic end-to-end table preview fixtures through browser preview
and mocked DocRaptor test preview. Phase 22 adds shared calculation helpers in
`@asym/pdf-template-schema`, but renderer total rows remain placeholders until
Phase 23 wires summary and table-total rendering.

DocRaptor remains the production PDF fidelity target. Browser preview is fast
authoring feedback only and must never be treated as final PDF output.

## Public API Promise

The root package entry is browser-safe and intentionally does not import the
server-only DocRaptor client:
- `pdfRendererBoundary`
- `PdfRendererBoundary`
- `composePdfDocumentHtml`
- `ComposePdfDocumentHtmlInput`
- `ComposePdfDocumentHtmlResult`
- `PdfDocumentCssRequirement`
- `PdfDocumentRenderWarning`
- `PdfDocumentAssetReference`
- `PdfDocumentVariableUsage`
- `PdfDocumentVariableScope`
- `PdfDocumentNodeRenderer`
- `PdfDocumentMarkRenderer`
- `composePrintDocumentHtml`
- `ComposePrintDocumentHtmlInput`
- `ComposePrintDocumentHtmlResult`
- `PrintDocumentPageBox`
- `createBrowserPdfPreview`
- `CreateBrowserPdfPreviewRequest`
- `PdfPreviewResult`
- `PdfPreviewDiagnostic`
- `PdfPreviewPreflightHook`
- `PdfPreviewSnapshots`
- `PdfPreviewArtifact`
- `resolvePdfDocumentVariables`
- `ResolvePdfDocumentVariablesInput`
- `ResolvePdfDocumentVariablesResult`
- `evaluatePdfDocumentCondition`
- `EvaluatePdfDocumentConditionInput`
- `PdfDocumentConditionEvaluation`
- `resolvePdfDocumentRepeaterItems`
- `ResolvePdfDocumentRepeaterItemsInput`
- `ResolvePdfDocumentRepeaterItemsResult`
- `resolvePdfDocumentTableRows`
- `ResolvePdfDocumentTableRowsInput`
- `ResolvePdfDocumentTableRowsResult`

The server-only DocRaptor test preview API is isolated behind:

```ts
import { createDocRaptorTestPdfPreview } from '@asym/pdf-renderer/docraptor-preview';
```

The subpath also exports `docraptorPreviewBoundary` so dependency inspectors can
see the server-only `@asym/docraptor-client` edge without treating the browser
safe root entry as a DocRaptor consumer.

Do not import `@asym/pdf-renderer/docraptor-preview` from browser code. The
subpath imports `@asym/docraptor-client`, which enforces a server-only runtime.

## Browser Preview

`createBrowserPdfPreview` validates a structured template with
`DocumentTemplateV1Schema`, serializes the template content with
`composePdfDocumentHtml`, wraps it with `composePrintDocumentHtml`, and returns
generated HTML/CSS snapshots plus structured diagnostics.

```ts
import { createBrowserPdfPreview } from '@asym/pdf-renderer';

const preview = await createBrowserPdfPreview({
  dataContext: sampleData,
  template,
  preflight: async () => [
    {
      code: 'custom_warning',
      message: 'Optional Phase 12 preview preflight warning.',
    },
  ],
});

if (preview.status !== 'error') {
  console.log(preview.snapshots.html);
  console.log(preview.snapshots.css);
}
```

Browser preview metadata always reports:
- `renderer: "browser"`
- `finalPdfFidelity: false`
- `productionRender: false`
- `docraptorTestMode: false`

The browser path does not mutate the caller's template object. Phase 21 passes
caller-provided sample data into the serializer for deterministic fixture
preview, but it does not fetch real donor or financial data.

## Phase 14 Variable Resolution

`resolvePdfDocumentVariables` resolves the structured variable usages collected
by `composePdfDocumentHtml` against caller-provided data. It delegates to the
React-free resolver in `@asym/pdf-template-schema` and returns resolved display
values plus diagnostics. It does not mutate generated HTML and does not fetch
real donor, financial, tenant, or asset data.

```ts
import {
  composePdfDocumentHtml,
  resolvePdfDocumentVariables,
} from '@asym/pdf-renderer';

const serialized = composePdfDocumentHtml({ document: template.content });
const variables = resolvePdfDocumentVariables({
  context: sampleData,
  variables: serialized.variables,
});
```

## Phase 16 Conditional Sections

`composePdfDocumentHtml` accepts an optional `dataContext` and can render
structured `conditionalSection` nodes. Matching conditions render nested
content in a deterministic wrapper. False conditions omit nested content and
skip nested variable or asset collection. Missing condition context or invalid
rules render nested content with structured warnings so broken templates do not
silently hide author-authored content. When a context is present but a
condition field is missing, the renderer honors the evaluator's
`matched: false` result and omits the section with a warning so editor preview
and render output stay aligned.

The renderer delegates all rule evaluation to
`@asym/pdf-template-schema`. It does not evaluate arbitrary JavaScript and does
not perform string replacement.

## Phase 17 Repeaters

`composePdfDocumentHtml` accepts optional `repeaterBindings` and can render
structured `repeater` nodes. A repeater resolves either inline
`attrs.binding` or `attrs.bindingId` against the supplied bindings. Resolved
items render nested content once per item with a scoped data context, so nested
variables and conditionals use the current item alias. False nested
conditionals skip nested variable and asset collection as they do outside a
repeater.

The renderer records repeater variable scopes as `sourcePath`, `itemAlias`,
`sourceIndex`, `renderedIndex`, and optional `indexAlias`. It does not store
private donor or financial source values in variable metadata. Missing or
non-array sources render configured empty states with structured warnings.
Invalid bindings render author content once with an error so content is not
silently hidden.

## Phase 20 Financial Data Tables

`composePdfDocumentHtml` accepts optional `tableBindings` and can render
structured `dataTable` nodes. A table resolves either inline `attrs.binding` or
`attrs.bindingId` against the supplied bindings. Resolved rows render as
deterministic print-ready table markup with repeated-header-friendly `<thead>`,
empty-state rows, max-row guards, formatter-driven display cells, and
structured warnings for invalid bindings or unsupported column values.

Phase 20 renders totals placeholders as explicit marker rows but does not
calculate sums, counts, subtotals, grouped totals, or grand totals. Phase 22
adds those safe calculation contracts in `@asym/pdf-template-schema`; Phase 23
owns rendering them into document output.

## Phase 21 Table Preview Fixtures

`createBrowserPdfPreview` and `createDocRaptorTestPdfPreview` now share the
same fixture-friendly data path: parsed template table/repeater bindings plus
caller-provided `dataContext` are passed to `composePdfDocumentHtml`. This
allows annual giving statement, invoice, and financial report table fixtures to
validate schema, editor round trips, renderer output, browser preview, warning
diagnostics, and mocked DocRaptor preview without real network calls or
calculation logic.

## DocRaptor Test Preview

`createDocRaptorTestPdfPreview` lives in the server-only subpath. It uses the
same template validation, serializer, print shell, and optional preflight hook
as browser preview, then calls `@asym/docraptor-client` in `mode: "test"`.

```ts
import { createDocRaptorTestPdfPreview } from '@asym/pdf-renderer/docraptor-preview';

const preview = await createDocRaptorTestPdfPreview({
  apiKey: process.env.DOCRAPTOR_API_KEY ?? '',
  baseUrl: 'https://assets.example.test/documents/',
  template,
});

const pdf = preview.artifacts.find((artifact) => artifact.kind === 'pdf-bytes');
```

The DocRaptor test preview request sends `prince_options.media: "print"` and
includes `baseurl` when `baseUrl` is provided. Preview results expose sanitized
request metadata only; API keys are constructor input and are never serialized
into preview results.

DocRaptor test preview metadata reports:
- `renderer: "docraptor"`
- `finalPdfFidelity: true`
- `productionRender: false`
- `docraptorTestMode: true`
- `mayContainWatermark: true`

Test renders may be watermarked. Production rendering remains a later package
and platform integration concern.

## Phase 09 Behavior

The serializer walks nodes recursively and includes built-in renderers for
paragraphs, headings, links, images, buttons, columns, table nodes, and explicit
variable nodes. Unknown container nodes render their children with a warning.
Unknown leaf nodes are omitted with a warning.

Variable usage is collected only from structured variable nodes such as
`variable` or `variableReference`. Raw text like `{{ donor.name }}` is treated
as normal text in Phase 09.

## Phase 10 Behavior

The print shell supports Letter, A4, Legal, and custom page sizes; portrait and
landscape orientation; four-sided margins; escaped document titles; and
deterministic print CSS. Page settings are parsed through
`DocumentPageSettingsSchema` from `@asym/pdf-template-schema`.

DocRaptor compatibility notes:
- DocRaptor and Prince support `@page` for page size, orientation, and margins:
  https://docraptor.com/css-paged-media
- DocRaptor applies print media rules by default for PDF output:
  https://docraptor.com/documentation/api/parameters
- Page margins are CSS-driven and can reserve space for page-region content:
  https://docraptor.com/documentation/article/1067969-margins-bleed

## Non-goals

- No React editor UI.
- No product preview panel.
- No full Phase 25 preflight implementation.
- No production DocRaptor render orchestration.
- No real donor, ministry, financial, or tenant data fetching.
- No integrated header/footer system before Phase 26.
- No tenant storage, auth, queue, or core app imports.
- No string-replacement merge engine.
- No arbitrary JavaScript condition execution.
- No rendered summary blocks, table total rows, or batch renderer behavior.

## Maturity

`phase-21-data-table-preview-fixtures`. The package remains private to prevent accidental
publication while renderer contracts are still being built.

## Development

```sh
pnpm --filter @asym/pdf-renderer build
pnpm --filter @asym/pdf-renderer typecheck
pnpm --filter @asym/pdf-renderer test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, and tsdown
toolchain first.
