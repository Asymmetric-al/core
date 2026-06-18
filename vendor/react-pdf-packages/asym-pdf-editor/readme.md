# @asym/pdf-editor

Phase 27 editor package for the Asym PDF Document Builder React editor.

## Purpose

This package will own the PDF-first editor shell, TipTap/ProseMirror
extensions, document blocks, slash commands, inspector controls, preview
surfaces, and compatibility shims while the fork moves from email-first to
PDF-first.

## Public API Promise

The current public API is intentionally small:

- `pdfEditorBoundary`
- `PdfEditorBoundary`
- `PdfEditor`, `PdfEditorProps`, `PdfEditorRef`
- `DocumentEditor`, `DocumentEditorProps`, `DocumentEditorRef`
- `DocumentNode`
- `DocumentMark`
- `@asym/pdf-editor/extensions`
- `@asym/pdf-editor/migration/unlayer`
- `@asym/pdf-editor/react-email-compat`

The `extensions` subpath exports the Phase 15 variable chip extension, the
Phase 16 conditional section extension, the Phase 17 repeater section, the
Phase 19-hardened data table extension, the Phase 24 document placeholder
extension, the Phase 25 page break extension, and Phase 26 browser-safe
header/footer helpers, plus the Phase 27 asset image extension:

- `VariableChip`
- `createVariableChipExtension`
- `insertVariableChip` command types
- `getVariableChipPreview`
- `isKnownVariableChipKey`
- `ConditionalSection`
- `createConditionalSectionExtension`
- `insertConditionalSection` command types
- `getConditionalSectionPreview`
- `isValidConditionalRule`
- `RepeaterSection`
- `createRepeaterSectionExtension`
- `insertRepeaterSection` command types
- `getRepeaterSectionPreview`
- `isValidRepeaterBinding`
- `DataTableBlock`
- `createDataTableExtension`
- `insertDataTable` command types
- `getDataTablePreview`
- `isValidTableBinding`
- `DocumentPlaceholderNode`
- `createDocumentPlaceholderExtension`
- `insertDocumentPlaceholder` command types
- `getDocumentPlaceholderPreview`
- `isValidDocumentPlaceholder`
- `PageBreakNode`
- `createPageBreakExtension`
- `insertPageBreak` command types
- `getPageBreakPreview`
- `isValidDocumentPageBreakNode`
- `getHeaderFooterPreview`
- `isValidDocumentHeaderFooterSettings`
- `AssetImageNode`
- `createAssetImageExtension`
- `insertAssetImage` command types
- `getAssetImagePreview`
- `isValidDocumentAssetImage`

Variable chips are structured inline atom nodes named `variable`. They store a
registry key plus optional formatter, fallback, and label attrs. The editor
renders them visibly as non-editable chips and preview display uses the shared
Phase 13 registry and Phase 14 resolver.

Conditional sections are structured block nodes named `conditionalSection`.
They store a `ConditionalRule` attr, preserve nested editor content, and render
deterministic `data-asym-conditional-section` attributes. Preview display uses
the shared Phase 16 condition evaluator; false conditions mark visibility but
do not delete nested editor JSON.

Repeater sections are structured block nodes named `repeater`. They store a
`RepeaterBinding` attr, preserve nested editor content, and render
deterministic `data-asym-repeater` attributes. Preview display uses the shared
Phase 17 repeater resolver; missing data marks diagnostics but keeps editor
content visible.

Data table blocks are protected structured block nodes named `dataTable`. They
store an inline `TableBinding` or a stable `bindingId`, render deterministic
`data-asym-data-table` attributes, and use the shared Phase 18 table schema for
preview diagnostics. Phase 19 formally hardens the editor command, JSON attrs,
HTML round trip, binding-ID-only references, invalid-binding diagnostics, and
extension exports. It does not add table inspector UI, renderer behavior,
calculations, aggregation, or DocRaptor wiring.

Document placeholders are protected structured block nodes named
`documentPlaceholder`. They store an inline `DocumentPlaceholder` contract or a
stable `placeholderId`, render deterministic
`data-asym-document-placeholder` attributes, and validate text field,
checkbox, signature, initials, date, and QR placeholder contracts through the
shared schema package. Phase 24 keeps this as an authoring/round-trip contract:
it does not add form submission, e-signature provider calls, signed-document
storage, or QR image generation.

Page breaks are protected structured block nodes named `pageBreak`. They store
optional stable IDs and labels, round-trip through deterministic
`data-asym-page-break` HTML, and validate through the shared schema package.
Phase 25 intentionally keeps this extension provider-free and renderer-free;
section keep-together controls, heading hints, table row hints, and final
pagination proof remain renderer/preflight responsibilities.

Header/footer helpers validate structured Phase 26 `headerFooter` page
settings for editor state and preview diagnostics. They do not import
`@asym/pdf-renderer`, `@asym/docraptor-client`, DocRaptor APIs, or server-only
behavior.

Asset image nodes are protected structured block nodes named `assetImage`.
They store an inline asset contract or a stable asset ID, round-trip
deterministic `data-asym-asset-image` HTML, validate shared Phase 27 asset
contracts, and surface missing asset or missing alt-text diagnostics. They do
not import renderer, DocRaptor, storage backend, provider implementation, or
core app code.

The `migration/unlayer` subpath exposes the Phase 38 browser-safe migration
boundary for legacy Unlayer coexistence. It re-exports schema-owned
manual-rebuild report helpers, unsupported-feature report schemas,
feature-flag engine selection contracts, and side-by-side comparison result
contracts. It does not import renderer, DocRaptor, Unlayer SDK code, storage,
auth, queues, or `Asymmetric-al/core`.

Phase 21 adds cross-package fixture coverage that round-trips annual giving
statement, invoice, and financial report `dataTable` nodes through the editor
extension before rendering and preview validation. This does not change the
editor public API or add table inspector UI.

The `react-email-compat` subpath re-exports public `@react-email/editor`
primitives under explicit `Reference` names. These adapters are temporary and
exist so future PDF work can depend on a package boundary without duplicating
the upstream editor.

Phase 40 adds runnable authoring examples in
`examples/pdf-document-builder`. They show variable-chip, conditional-section,
repeater-section, and data-table preview helpers without requiring a full
native PDF editor shell.

The Phase 08 document/PDF names are exact aliases for the current React Email
editor primitives. They are the future-facing import path, but they do not yet
change editor behavior or rendering output.

## Non-goals

- No PDF-native editor shell implementation in Phase 19.
- No source import rewrites inside `@react-email/editor`.
- No variable browser UI picker, condition builder UI, repeater picker UI,
  data-table inspector wiring, placeholder inspector wiring, or page-flow
  inspector wiring.
- No default slash command wiring. The current slash command UI accepts
  caller-provided items, and a later editor shell can compose variable commands
  into that UI.
- No PDF renderer implementation in this package.
- No totals, subtotals, grouping calculations, runtime aggregation, or PDF
  pagination proof.
- No live form submission, e-signature provider behavior, or signed-document
  storage.
- No `DocumentTheming`; the branding/theme phase owns PDF-specific theme
  semantics.
- No DocRaptor credentials or server-side API calls.
- No tenant storage, auth, queue, or core app imports.
- No full Unlayer JSON converter, live Unlayer editor embedding, or storage
  migration in the `migration/unlayer` subpath.

## Maturity

The package now has Phase 15 variable chip, Phase 16 conditional section,
Phase 17 repeater section, Phase 19-hardened data table extension, Phase 24
document placeholder extension, Phase 25 page break extension, and Phase 26
header/footer helper surfaces, plus the Phase 27 asset image extension. The
package is private to prevent accidental publication while the editor API is
still being designed. Phase 38 adds only a browser-safe Unlayer migration
subpath and does not change `@react-email/editor` exports.

## Development

```sh
pnpm --filter @asym/pdf-editor build
pnpm --filter @asym/pdf-editor typecheck
pnpm --filter @asym/pdf-editor test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, React Testing
Library, and tsdown toolchain first.
