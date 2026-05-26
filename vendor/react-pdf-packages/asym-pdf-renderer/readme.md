# @asym/pdf-renderer

Phase 37 preview, variable resolution, conditional rendering, repeater,
financial data table, summary renderer, placeholder, page-flow, and
header/footer, asset rendering, asset preflight, branding/theme, and starter
fixture golden coverage plus deterministic preflight diagnostics and
dev/test-only Playwright local rendering, PDF metadata, accessibility
warnings, and security preflight diagnostics for the Asym PDF Document Builder
print renderer.

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
`@asym/pdf-template-schema`. Phase 23 renders structured summary blocks,
grouped subtotals, and table total rows from those calculation contracts while
preserving deterministic calculation metadata in `data-*` attributes. Phase 24
renders structured text field, checkbox, signature, initials, date, and QR
placeholder contracts as print-safe HTML without adding live submission,
provider, or signed-document behavior. Phase 25 renders explicit page breaks,
keep-together sections, start-on-new-page sections, avoid-break-after headings,
and avoid-row-split data table rows as deterministic print hints. Phase 26
renders structured headers and footers through DocRaptor-compatible print
margin boxes, running elements, page counters, document-title tokens,
organization-footer tokens, and small-margin diagnostics.
Phase 27 renders structured asset image nodes, resolves asset references passed
from templates, emits deterministic asset `data-*` metadata, rejects browser
blob URLs for production rendering, accepts render-safe URLs, collects asset
metadata, and exposes pure asset preflight diagnostics. Asset storage and URL
signing remain adapter concerns outside this package.
Phase 28 consumes structured `DocumentTheme` values, serializes deterministic
print CSS variables for brand colors and body/heading font stacks, attaches
stable brand metadata to the print shell, passes template theme data through
browser and DocRaptor test previews, and warns when custom fonts have no
configured fallback stack. Tenant brand lookup and font reachability checks
remain adapter/preflight responsibilities outside this package.
Phase 29 renders the schema-owned starter fixture catalog into deterministic
print HTML and browser preview snapshots. The golden snapshot suite covers
donation receipt, tax receipt, annual giving statement, donor letter,
missionary support report, financial report, invoice, and certificate
templates without real network calls or private data fetching.
Phase 30 adds the browser-safe `preflightPdfTemplate` API. It normalizes schema
issues, renderer warnings, variable resolver diagnostics, conditional,
repeater, table, summary calculation, asset, header/footer, unsupported-node,
required-section, and batch-safety checks into deterministic diagnostics with
severity, code, source, path, details, and suggested fixes where practical.
Phase 35 adds `@asym/pdf-renderer/local-renderer`, a Node dev/test-only
Playwright adapter surface for HTML-to-PDF smoke output, optional PNG
screenshot artifacts, deterministic page size/margin options, structured
failure diagnostics, and graceful skips when browser binaries are unavailable.
The subpath uses injected Playwright-compatible launchers and does not add
Playwright to this package's production dependencies.
Phase 36 adds PDF metadata serialization and accessibility preflight warnings.
`composePrintDocumentHtml` emits deterministic language, title, author,
subject, keyword, organization, and generator metadata. `preflightPdfTemplate`
and `preflightPdfDocumentAccessibility` return structured warnings for missing
PDF titles, missing image alt text, skipped heading levels, missing table
headers, and non-descriptive link text without claiming PDF/UA compliance.
Phase 37 wires schema-owned secret-like template detection into
`preflightPdfTemplate`. Publish, production render, and batch callers receive a
blocking `security` diagnostic when structured template JSON contains API
keys, bearer tokens, password-like values, or signed URL/token metadata. The
root renderer entry remains browser-safe and does not export the DocRaptor
client or API-key APIs.
Phase 43 adds renderer-specific browser bundle audit coverage. The root source
entry, browser preview code, and built root bundles are checked for DocRaptor
client imports, API key fields, authorization headers, Basic auth metadata,
Node Buffer usage, and environment access. The server-only DocRaptor preview
subpath remains the only renderer entry that imports `@asym/docraptor-client`.

DocRaptor remains the production-fidelity renderer. Browser preview and local
Playwright output are fast authoring and regression feedback only and must
never be treated as final PDF output.

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
- `preflightPdfDocumentAssets`
- `PreflightPdfDocumentAssetsInput`
- `PreflightPdfDocumentAssetsResult`
- `PdfDocumentAssetRenderMode`
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
- `preflightPdfTemplate`
- `PreflightPdfTemplateInput`
- `PreflightPdfTemplateResult`
- `preflightPdfDocumentAccessibility`
- `PreflightPdfDocumentAccessibilityInput`
- `PreflightPdfDocumentAccessibilityResult`
- `PdfTemplatePreflightDiagnostic`
- `PdfTemplateRequiredSection`

The server-only DocRaptor test preview API is isolated behind:

```ts
import { createDocRaptorTestPdfPreview } from '@asym/pdf-renderer/docraptor-preview';
```

The subpath also exports `docraptorPreviewBoundary` so dependency inspectors can
see the server-only `@asym/docraptor-client` edge without treating the browser
safe root entry as a DocRaptor consumer.

Do not import `@asym/pdf-renderer/docraptor-preview` from browser code. The
subpath imports `@asym/docraptor-client`, which enforces a server-only runtime.

The dev/test-only local renderer API is isolated behind:

```ts
import { renderPlaywrightLocalPdf } from '@asym/pdf-renderer/local-renderer';
```

The subpath exports `localRendererBoundary`, `renderPlaywrightLocalPdf`, and
Playwright-compatible adapter types. It accepts an injected browser launcher
instead of importing Playwright directly, so callers decide where Playwright is
installed and how browser binaries are managed.

Do not import `@asym/pdf-renderer/local-renderer` from browser code or
production render paths. It is a local smoke-test helper, not the production
renderer contract.

Phase 40 adds runnable examples in `examples/pdf-document-builder` for browser
preview, publish-mode preflight, and mocked DocRaptor test preview. The
DocRaptor example uses injected `fetch`, makes no real network calls, and does
not require a real API key.
Phase 41 adds renderer-owned performance and load guardrails. The normal
Vitest suite measures one-page receipt rendering, ten-page annual statement
shapes, 500 donation line items, 1,000 recipient batch manifest planning, and
large scoped variable resolution. The opt-in heavy suite measures fifty-page
financial report shapes, 1,000 financial rows, asset-heavy documents,
repeated header/footer output, and large-template preflight behind
`ASYM_PDF_HEAVY_PERFORMANCE=1`.

Phase 43 adds the repo-level bundle audit command:

```bash
corepack pnpm asym:security-bundle-audit
```

Run it after `corepack pnpm build` so the source and built browser-safe
bundles are both checked.

## Performance And Load Checks

Run the CI-safe Phase 41 smoke coverage with:

```bash
corepack pnpm --filter @asym/pdf-renderer test -- performance-smoke.spec.ts performance-heavy.spec.ts
```

Run the opt-in heavy coverage with:

```bash
ASYM_PDF_HEAVY_PERFORMANCE=1 corepack pnpm --filter @asym/pdf-renderer test -- performance-heavy.spec.ts
```

The helper records serializer, preflight, resolver, batch planning, output
size, warning count, and heap-used metrics where practical. Thresholds are
broad regression guardrails, not platform SLOs. See
`docs/performance-load-guidance.md` for the case matrix and maintenance notes.

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

## Phase 35 Local Playwright Renderer

`renderPlaywrightLocalPdf` accepts print HTML, optional CSS, structured page
settings, and an injected Playwright-compatible browser launcher. It writes the
HTML with `page.setContent`, generates PDF bytes with deterministic page
width/height, margins, `printBackground: true`, and `preferCSSPageSize: true`,
and can optionally capture a full-page PNG screenshot artifact.

```ts
import { chromium } from 'playwright';
import { renderPlaywrightLocalPdf } from '@asym/pdf-renderer/local-renderer';

const localRender = await renderPlaywrightLocalPdf({
  browserLauncher: chromium,
  html: printDocument.html,
  pageSettings: template.pageSettings,
});

if (localRender.status === 'skipped') {
  console.warn(localRender.warnings);
}
```

When Playwright browser binaries are unavailable, the helper returns
`status: "skipped"` with a `playwright_browser_unavailable` warning instead of
failing CI by default. Other rendering errors return `status: "error"` with
`local_renderer_failed` diagnostics.

Local renderer metadata always reports:

- `renderer: "playwright-local"`
- `finalPdfFidelity: false`
- `productionRender: false`
- `productionRenderer: "docraptor"`

DocRaptor remains the production-fidelity renderer. Local Playwright output is
only for development preview, screenshot smoke checks, and regression sanity
checks when real browser binaries are available.

## Phase 28 Branding And Theme Tokens

`composePrintDocumentHtml` accepts structured `DocumentTheme` input and writes
brand tokens into deterministic print CSS variables:

- `--asym-brand-primary`
- `--asym-brand-accent`
- `--asym-brand-text`
- `--asym-brand-background`
- `--asym-font-body`
- `--asym-font-heading`

The print shell applies these variables to `body`, headings, and links.
Template theme values also flow through `createBrowserPdfPreview` and the
DocRaptor test preview preparation path. Custom fonts without a configured
fallback stack emit a `missing_theme_font_fallback` warning. This package does
not fetch tenant branding, verify remote font URLs, or choose a storage
provider.

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

## Preflight

`preflightPdfTemplate` is a deterministic package-level validation pass for
authoring, publish, production render, and batch readiness. It is side-effect
free and does not call DocRaptor, fetch assets, read tenant storage, or import
`Asymmetric-al/core`.

```ts
import { preflightPdfTemplate } from '@asym/pdf-renderer';

const result = preflightPdfTemplate({
  dataContext: sampleData,
  mode: 'publish',
  template,
});

if (!result.ok) {
  console.log(result.errors);
}
```

Production and batch modes require render-safe assets and batch mode requires a
published native PDF template snapshot. Browser preview remains
non-authoritative; preflight diagnostics are readiness checks, not proof of
final page pagination.

Phase 36 extends preflight with accessibility-oriented warnings. These warn on
missing PDF title metadata, meaningful images without alt text, skipped heading
levels, raw tables without header cells, and generic link text such as
`click here`. The result deliberately reports warnings only; it does not prove
PDF/A or PDF/UA compliance.

Phase 37 extends preflight with security diagnostics from
`@asym/pdf-template-schema`. Secret-like values in template source return
`secret_like_template_value` errors with source `security` and a suggested fix
to move credentials, signed URLs, and API keys into server-side adapters.

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

## Phase 20 Financial Data Tables And Phase 23 Totals

`composePdfDocumentHtml` accepts optional `tableBindings` and can render
structured `dataTable` nodes. A table resolves either inline `attrs.binding` or
`attrs.bindingId` against the supplied bindings. Resolved rows render as
deterministic print-ready table markup with repeated-header-friendly `<thead>`,
empty-state rows, max-row guards, formatter-driven display cells, and
structured warnings for invalid bindings or unsupported column values.

Phase 23 renders table totals from `TableBinding.totals` when a data context is
available. Rendered total rows include stable column keys, operation metadata,
fixed decimal values, minor-unit values, scale, and contributing counts.
Grouped tables render subtotal rows in first-seen group order and keep grand
totals in the table footer. Missing or invalid calculation references return
structured warnings instead of evaluating expressions.

## Phase 23 Summary Blocks

`composePdfDocumentHtml` accepts optional `summaryBlockBindings` and can render
structured `summaryBlock` nodes. A summary block resolves either inline
`attrs.binding` or `attrs.bindingId` against the supplied bindings. Supported
summary calculations include total contributions, invoice subtotal, discount,
tax, total, financial report income, expense, net, grouped subtotals, grand
totals, and table totals.

Summary blocks use only structured data paths and schema-owned calculation
helpers. They do not evaluate arbitrary JavaScript and do not fetch donor,
financial, tenant, or asset data. Rendered summary items include deterministic
metadata such as source path, field path, decimal value, minor units, scale,
count, and group key when present.

## Phase 24 Document Placeholders

`composePdfDocumentHtml` accepts optional `placeholderBindings` and can render
structured `documentPlaceholder` nodes. A placeholder resolves either inline
`attrs.placeholder` or `attrs.placeholderId` against the supplied bindings.
Supported placeholder kinds are `text_field`, `checkbox`, `signature`,
`initials`, `date`, and `qr`.

Rendered placeholders are deterministic, print-safe HTML with stable
`data-placeholder-*` metadata for ID, kind, required flag, date format, signer
role, dimensions, QR payload type, and adapter/data-path hints when present.
Missing labels produce structured renderer warnings and deterministic fallback
labels. Invalid QR payloads are omitted with errors instead of generating
unsafe output. The renderer does not submit forms, call e-signature providers,
store signed documents, generate QR images, or fetch tenant data.

## Phase 25 Page Flow Controls

`composePdfDocumentHtml` can render explicit `pageBreak` nodes as print-safe
block markers with stable `data-asym-page-break` metadata. It also recognizes
boolean page-flow attrs on supported nodes:

- `keepTogether` on sections adds `pdf-keep-together` and a structured
  non-guaranteed pagination warning.
- `startOnNewPage` on sections adds `pdf-start-on-new-page`.
- headings default to `pdf-heading-avoid-break-after`; callers can set
  `avoidBreakAfter: false` to opt out.
- `TableBinding.avoidRowSplit` defaults to `true` and adds
  `pdf-table-row-avoid-break` plus `data-table-avoid-row-split="true"` to
  rendered body, empty, subtotal, placeholder total, and total rows.

These controls serialize deterministic CSS classes and metadata. They are
layout hints, not proof of final pagination. Browser preview remains
non-authoritative; DocRaptor preview and later preflight phases are responsible
for production-fidelity page behavior.

## Phase 26 Header and Footer System

`composePrintDocumentHtml` reads `pageSettings.headerFooter` and can serialize
no regions, first-page-only regions, repeating regions, or a disabled
first-page override for repeating content. Region content is built from typed
tokens: text, document title, organization footer, page number, and total
pages.

The print shell emits deterministic page-region HTML plus Prince/DocRaptor
compatible `@page` margin boxes using running elements. Page number and total
page tokens render with CSS counters. If an enabled header or footer region has
a configured minimum margin larger than the matching page margin, the renderer
returns `header_footer_margin_too_small` as a structured print-shell warning.

## Phase 21 Table Preview Fixtures

`createBrowserPdfPreview` and `createDocRaptorTestPdfPreview` now share the
same fixture-friendly data path: parsed template table/repeater bindings plus
caller-provided `dataContext` are passed to `composePdfDocumentHtml`. This
allows annual giving statement, invoice, and financial report table fixtures to
validate schema, editor round trips, renderer output, browser preview, warning
diagnostics, and mocked DocRaptor preview without real network calls or
private data fetching. Phase 23 fixture rendering now displays calculated table
total rows, but the fixtures remain package test data rather than public
starter templates.

## Phase 29 Starter Fixture Golden Snapshots

`@asym/pdf-template-schema` exports `starterPdfTemplateFixtures` as structured
starter template JSON with fictional sample data. The renderer package consumes
that catalog in `test/starter-templates.spec.ts` to verify every starter can
serialize to print HTML without unexpected warnings, keeps output
deterministic across repeated serializer calls, and creates stable browser
preview snapshots. The snapshot is a regression artifact, not a production PDF
artifact.

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
- No production DocRaptor render orchestration.
- No production Playwright rendering contract.
- No real donor, ministry, financial, or tenant data fetching.
- No tenant storage, auth implementation, queue, or core app imports.
- No string-replacement merge engine.
- No arbitrary JavaScript condition execution.
- No live form submission, e-signature provider behavior, signed-document
  storage, or generated QR image output.
- No batch renderer behavior.

## Maturity

Root entry: `phase-37-security-tenant-contracts`. Local renderer subpath:
`phase-35-local-renderer`. The package remains private to prevent accidental
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
