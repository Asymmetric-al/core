# @asym/pdf-editor

> Historical phase-baseline notes follow. For the current restored 0.1.0 API,
> exports, supported toolchain and qualification, see
> [Core PDF modernization](../../docs/maintenance/core-pdf-modernization/README.md)
> and this package's `src/index.ts` and `package.json`. Later shipped functionality
> supersedes the phase-specific omissions below; native-builder rollout remains unchanged.

Phase 19 editor package for the Asym PDF Document Builder React editor.

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
- `@asym/pdf-editor/react-email-compat`

The `extensions` subpath exports the Phase 15 variable chip extension, the
Phase 16 conditional section extension, the Phase 17 repeater section, and the
Phase 19-hardened data table extension:
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

Phase 21 adds cross-package fixture coverage that round-trips annual giving
statement, invoice, and financial report `dataTable` nodes through the editor
extension before rendering and preview validation. This does not change the
editor public API or add table inspector UI.

The `react-email-compat` subpath re-exports public `@react-email/editor`
primitives under explicit `Reference` names. These adapters are temporary and
exist so future PDF work can depend on a package boundary without duplicating
the upstream editor.

The Phase 08 document/PDF names are exact aliases for the current React Email
editor primitives. They are the future-facing import path, but they do not yet
change editor behavior or rendering output.

## Non-goals

- No PDF-native editor shell implementation in Phase 19.
- No source import rewrites inside `@react-email/editor`.
- No variable browser UI picker, condition builder UI, repeater picker UI, or
  data-table inspector wiring.
- No default slash command wiring. The current slash command UI accepts
  caller-provided items, and a later editor shell can compose variable commands
  into that UI.
- No PDF renderer implementation in this package.
- No totals, subtotals, grouping calculations, or runtime aggregation.
- No `DocumentTheming`; the branding/theme phase owns PDF-specific theme
  semantics.
- No DocRaptor credentials or server-side API calls.
- No tenant storage, auth, queue, or core app imports.

## Maturity

The package now has Phase 15 variable chip, Phase 16 conditional section,
Phase 17 repeater section, and Phase 19-hardened data table extension
surfaces. The package is private to prevent accidental publication while the
editor API is still being designed, and Phase 19 does not change
`@react-email/editor` exports.

## Development

```sh
pnpm --filter @asym/pdf-editor build
pnpm --filter @asym/pdf-editor typecheck
pnpm --filter @asym/pdf-editor test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, React Testing
Library, and tsdown toolchain first.
