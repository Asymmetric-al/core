# Native PDF Builder Migration Handoff

## Branch

`feat/native-pdf-studio-migration`

## Commits

- `e4d109cfb1` chore: prove native PDF package consumption
- `9dc061e927` feat: add native PDF Studio server boundaries
- `25104177d5` feat: add native PDF Studio storage foundation
- `65c5b8d811` feat: wire native PDF Studio adapter
- `5062be9759` feat: add native PDF Studio admin UI

## Package Consumption Method

Core consumes the Phase 47 React PDF packages through local Bun file
dependencies under `vendor/react-pdf-packages/*.tgz`. Packages were packed from
`/Users/blake/Documents/asymmetrical/repos/react-pdf`; no package was
published. Root `overrides` pin the `@asym/*` transitive package references to
the same local tarballs so Bun resolves the full graph offline.

## Feature Flags

- `NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED`
- `PDF_STUDIO_NATIVE_BUILDER_ENABLED`
- `PDF_STUDIO_NATIVE_BUILDER_ROLLOUT`
- `PDF_STUDIO_NATIVE_BUILDER_TENANTS`
- `PDF_STUDIO_NATIVE_BUILDER_CATEGORIES`
- `PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED`

Defaults keep native disabled and Unlayer fallback enabled.

## Storage Changes

`pdf_templates` remains the root table. The native migration adds engine and
migration metadata columns to `pdf_templates`, plus native version, render,
artifact, audit, batch, and batch job tables with tenant-scoped RLS.

## Migrations Added But Not Applied

- `supabase/migrations/20260515140948_native_pdf_studio_foundation.sql`

This migration was added to the repo only. It was not applied to production or
any hosted Supabase project.

## Adapter Status

`@asym/api/pdf-templates/native-adapter` maps core categories to Phase 47 package
categories, resolves feature flags, runs package preflight/browser preview,
keeps Unlayer records loadable, and creates manual Unlayer rebuild reports.

## DocRaptor Status

DocRaptor is optional until native production rendering is enabled. Server-only
config is wired through `@asym/config/pdf-studio-native`, and the API uses a lazy
DocRaptor getter in `@asym/api/pdf-templates/docraptor`. Client code does not
import `@asym/docraptor-client` or `@asym/pdf-renderer/docraptor-preview`.

## Asset Adapter Status

Asset handling is adapter-only. The current adapter authorizes asset access and
returns no signed URL unless a future storage/provider adapter supplies one.

## Batch Adapter Status

Batch handling is adapter-only. The current adapter validates the package batch
contract and returns run/job enqueue metadata; no background worker is enabled.

## Unlayer Fallback Status

Unlayer remains available and default. Existing templates continue to use the
legacy Unlayer document editor unless the native flags are enabled and a native
template is explicitly created/opened.

## Validation Results

- `corepack pnpm build` in `react-pdf`: pass
- `bun run --cwd packages/api verify:pdf-studio-package-consumption`: pass
- `bun run --cwd packages/env typecheck`: pass
- `bun run --cwd packages/config typecheck`: pass
- `bun run --cwd packages/api typecheck`: pass
- `bun run --cwd apps/admin typecheck`: pass
- `bun run --cwd apps/admin lint`: pass
- `bun vitest run tests/unit/packages/config/pdf-studio-native.test.ts tests/unit/packages/api/pdf-studio-docraptor.test.ts tests/unit/packages/api/pdf-template-native-migration.test.ts tests/unit/packages/api/pdf-template-store.test.ts tests/unit/packages/api/pdf-templates.test.ts tests/unit/packages/api/pdf-studio-native-adapter.test.ts tests/unit/packages/api/pdf-studio-native-routes.test.ts tests/unit/apps/admin/pdf-studio-native-ui.test.ts tests/unit/docs/pdf-studio-operator-guide.test.ts`: pass
- `bun run build:admin`: pass
- `git diff --check`: pass

## Known Limitations

- Native builder controls are hidden unless
  `NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED=true`.
- Browser preview is authoring feedback only.
- Official native output requires server-side DocRaptor flags, key, callback
  secret, callback URL, and render-safe asset URL strategy.
- Native asset signing and batch execution are adapter scaffolds, not production
  provider implementations.
- Unlayer JSON is not auto-converted; migration reports support manual rebuild.

## Manual Production Actions

1. Apply `20260515140948_native_pdf_studio_foundation.sql` deliberately in each
   target Supabase environment.
2. Configure server-only DocRaptor environment values before enabling native
   production rendering.
3. Enable native flags by tenant/category/rollout after migration and provider
   proof.
4. Deploy admin/core after the production environment values and migration are
   ready.
