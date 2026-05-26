# @asym/pdf-studio-adapter

Phase 39 core integration adapter contract for the Asym PDF Document Builder.

## Purpose

This package defines the future `Asymmetric-al/core` consumption boundary
without importing `Asymmetric-al/core`, adding database code, or choosing
platform storage. It composes existing package contracts behind injected
adapters for editor creation, template load/save, lifecycle/versioning,
preview, production render, preflight, batch start, feature flags, auth,
assets, variable registry, and DocRaptor client access.

The package is contract-first. It provides a typed adapter factory and fake
integration tests so a later core PR can map platform services into this
boundary.

## Public API Promise

- `pdfStudioAdapterBoundary`
- `PdfStudioAdapterBoundary`
- `createPdfStudioAdapter`
- `PdfStudioAdapter`
- `PdfStudioAdapterDependencies`
- `PdfStudioTemplateRepository`
- `PdfStudioLifecycleAdapter`
- `PdfStudioFeatureFlagAdapter`
- `PdfStudioEditorAdapter`
- `PdfStudioPreviewAdapter`
- `PdfStudioRenderAdapter`
- `PdfStudioPreflightAdapter`
- `PdfStudioBatchAdapter`
- `PdfStudioAssetAdapter`
- `PdfStudioAdapterError`

The adapter also re-exports `createFakePdfPermissionAdapter` and
`starterPdfTemplateFixtureByCategory` from `@asym/pdf-template-schema` for
package-level integration fixtures.

Phase 40 adds `createCoreAdapterPreviewExample` in
`examples/pdf-document-builder`, which wires the adapter with injected fakes
for templates, preflight, preview, render, feature flags, and authorization.
It does not import or edit `Asymmetric-al/core`.

## Boundaries

- Editor component/factory behavior is injected through
  `PdfStudioEditorAdapter`.
- Template storage and lifecycle/versioning are injected through repository
  and lifecycle adapters.
- Preview and preflight are injected rather than hardwired to an app route.
- Production render receives an injected `DocRaptorClient` reference through
  the render adapter input; DocRaptor credentials remain server-only.
- Feature flags use the Phase 38 native-builder flag contract and
  `selectPdfTemplateEngine` fallback behavior.
- Auth and asset checks use the Phase 37 security/asset contracts.
- Batch start is queue-agnostic and maps to an injected batch adapter.

## Non-Goals

- No `Asymmetric-al/core` import.
- No database schema.
- No storage implementation.
- No queue implementation.
- No real feature flag service.
- No DocRaptor API key creation or environment loading.
- No Unlayer conversion.

## Maturity

`phase-39-core-adapter-contract`. The package is private to prevent accidental
publication before release policy and stable public APIs exist.

## Development

```sh
pnpm --filter @asym/pdf-studio-adapter test
pnpm --filter @asym/pdf-studio-adapter typecheck
pnpm --filter @asym/pdf-studio-adapter build
```
