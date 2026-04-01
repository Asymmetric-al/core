# OpenPolicy Integration Notes

## Scope

The first OpenPolicy pass lives in `apps/donor` only.

Do not move OpenPolicy internals into `packages/ui` unless multiple apps genuinely need shared legal rendering and the shared abstraction is already proven. The current donor-only boundary is intentional and lower risk.

## File locations

- `apps/donor/openpolicy.ts`
  Unified legal config using `defineConfig()` from `@openpolicy/sdk`.
- `apps/donor/components/providers/openpolicy-provider.tsx`
  Donor-local provider mounted from the root donor layout.
- `apps/donor/components/openpolicy/policy-components.tsx`
  Maia-native renderers for OpenPolicy sections, headings, paragraphs, lists, and links.
- `apps/donor/components/openpolicy/legal-page-shell.tsx`
  Shared public legal wrapper.
- `apps/donor/components/openpolicy/privacy-policy.tsx`
- `apps/donor/components/openpolicy/terms-of-service.tsx`
- `apps/donor/components/openpolicy/cookie-policy.tsx`
  Client wrappers for OpenPolicy React components.
- `apps/donor/app/(public)/privacy/page.tsx`
- `apps/donor/app/(public)/terms/page.tsx`
- `apps/donor/app/(public)/cookies/page.tsx`
  Thin App Router pages.
- `apps/donor/scripts/openpolicy.ts`
  Local validation and artifact generation script.

The config intentionally separates:

- source-level `TODO:` comments for maintainers and future AI agents
- public-safe review markers in rendered policy text for unresolved legal facts

The validation script should continue warning on unresolved review markers even when the generated policy text no longer exposes raw `TODO:` prose.

## Package boundaries

Keep these boundaries:

- donor app owns OpenPolicy config and renderers
- `packages/ui` remains the source of shared primitives and tokens
- `packages/config` remains the source of shared route and branding config
- `packages/lib/seo` remains the source of shared metadata helpers

Do not:

- add app-local theme primitives
- add a Tailwind config
- add OpenPolicy-specific code to `packages/ui`
- introduce a new shared legal package before a second app actually needs it

## Layout and provider constraints

`apps/donor/app/layout.tsx` already had a provider stack before this integration.

Keep these constraints intact:

- preserve existing provider order
- keep the layout server-first
- keep `OpenPolicyProvider` as deep as practical
- do not break `ThemeProvider`, `QueryProvider`, `MotionProvider`, `NuqsAdapter`, or `Toaster`

## Styling constraints

All legal rendering must stay Maia-native:

- use `@asym/ui` primitives where helpful
- use semantic tokens from `packages/ui/styles/globals.css`
- keep styling donor-local rather than creating a parallel design system
- legal pages should feel calm, readable, and public-site appropriate

Avoid:

- importing OpenPolicy's default CSS as the final UX
- hardcoded hex or oklch values in donor legal components
- app-local token ownership

## Extending later

Safe future additions:

- a repo-native cookie preference banner that reads from the same provider
- downloadable links to generated artifacts if humans decide they should be public
- a shared policy nav component if another app adopts the same pattern
- an AI authoring assistant that answers only from generated policy text

Unsafe future changes:

- changing `apps/donor/openpolicy.ts` based on guesswork or branding alone
- adding compliance claims without verified legal approval
- collapsing donor-specific OpenPolicy code into shared packages before the abstraction is proven

## Upstream CLI caveat

`@openpolicy/cli@0.0.17` is kept in the donor app because it is the intended upstream CLI dependency to monitor, but the published tarball is incomplete on Bun/Windows. Use `apps/donor/scripts/openpolicy.ts` for actual repo workflows until upstream fixes the package.
