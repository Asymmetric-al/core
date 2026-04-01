# OpenPolicy Legal Pages

## What this does

This repo now uses OpenPolicy in the donor app to power public legal routes at:

- `/privacy`
- `/terms`
- `/cookies`

The donor app renders these pages from a single config file at `apps/donor/openpolicy.ts`. The config is intentionally conservative and distinguishes between:

- repo-inferred implementation facts
- explicit human-provided legal drafting facts
- operational or legal follow-ups that still require confirmation outside the rendered policy text

## Why the donor app owns the first pass

`apps/donor` is the lowest-risk integration point because:

- the public site footer already points to donor-facing legal routes
- donor flows already include public checkout, account, and dashboard surfaces
- legal rendering can stay app-scoped without leaking OpenPolicy internals into `packages/ui`
- Maia theming can be preserved by composing existing `@asym/ui` primitives inside donor-local wrappers

This first pass does not create a new shared legal package. If other apps need legal pages later, they should consume the established donor patterns deliberately instead of moving OpenPolicy internals into shared UI by default.

## File map

- `apps/donor/openpolicy.ts`
  Source-of-truth OpenPolicy config.
- `apps/donor/components/providers/openpolicy-provider.tsx`
  Client provider added to the donor layout for route pages and future consent work.
- `apps/donor/components/openpolicy/policy-components.tsx`
  Maia-native OpenPolicy renderers built from existing `@asym/ui` primitives.
- `apps/donor/components/openpolicy/legal-page-shell.tsx`
  Shared public legal page wrapper.
- `apps/donor/components/openpolicy/privacy-policy.tsx`
  Client wrapper for the privacy policy renderer.
- `apps/donor/components/openpolicy/terms-of-service.tsx`
  Client wrapper for the terms renderer.
- `apps/donor/components/openpolicy/cookie-policy.tsx`
  Client wrapper for the cookie renderer.
- `apps/donor/app/(public)/privacy/page.tsx`
- `apps/donor/app/(public)/terms/page.tsx`
- `apps/donor/app/(public)/cookies/page.tsx`
  Thin App Router pages with route metadata and breadcrumbs.
- `apps/donor/scripts/openpolicy.ts`
  Donor-local validation and generation CLI wrapper.

## How the routes work

1. `apps/donor/openpolicy.ts` defines one unified OpenPolicy config with `company`, `privacy`, `terms`, and `cookie`.
2. `apps/donor/app/layout.tsx` mounts `OpenPolicyProvider` inside the existing donor provider tree without reordering the current stack.
3. Each route page stays server-first for metadata and breadcrumb JSON-LD.
4. Each route page renders a small client wrapper from `apps/donor/components/openpolicy/*`.
5. The client wrapper renders the corresponding OpenPolicy React component with donor-local Maia renderers from `policy-components.tsx`.

## Validation and generation commands

Donor-scoped commands:

```bash
bun run --cwd apps/donor legal:validate
bun run --cwd apps/donor legal:generate:md
bun run --cwd apps/donor legal:generate:html
bun run --cwd apps/donor legal:generate:pdf
bun run --cwd apps/donor legal:generate:all
```

Root wrappers:

```bash
bun run legal:validate
bun run legal:generate:md
bun run legal:generate:html
bun run legal:generate:pdf
bun run legal:generate:all
```

## Output location

Generated artifacts land in `apps/donor/generated/policies`.

That path is intentional:

- it keeps generated review artifacts separate from source config
- it avoids publishing placeholder legal exports from `public/` by default
- it stays close to the donor-owned integration
- it is easy to clean or regenerate during future policy authoring work

`apps/donor/generated/` is gitignored because these files are derived artifacts.

## Remaining operational review items

The current scaffold no longer renders placeholder review markers in the public policy output. The remaining follow-ups are tracked in source comments and companion docs instead:

- any future change to the current necessary-cookies-only posture
- operational confirmation that the published retention schedule is actually enforced
- operational confirmation of conservative security and public-storage wording
- any future change to the current "no intentional EEA/UK targeting" posture

The default effective date for the current generated set is `April 2, 2026`. If publication slips, update the date in `apps/donor/openpolicy.ts` and regenerate the policy exports before launch.

## Human-provided drafting facts now wired in

These facts now come from explicit human-provided drafting input rather than repo inference alone:

- service name `Asymmetric.al`
- legal identity `Global Fellowship Inc. (doing business as Asymmetric.al)`
- mailing address `PO Box 1, Meadow Vista, CA 95722, United States`
- privacy / legal contact `info@asymmetric.al`
- California governing law and Placer County venue posture
- donation reversal language limited to duplicate, mistaken, unauthorized, and narrow processing-error cases
- public subprocessor list: Vercel, Supabase, Stripe, Resend, and Unlayer where enabled
- published retention schedule
- current necessary-cookies-only posture
- current "no intentional EEA/UK targeting" posture

## What was inferred from the repo

The scaffold still relies on repo evidence for implementation-backed statements such as:

- Vercel-backed hosted deployment wiring
- Stripe for donation payments
- Supabase for auth, sessions, and application data
- Resend for transactional email and webhook handling
- Unlayer-backed editor features where enabled
- donor-facing legal routes expected by the public footer

Cloudinary and Sentry remain intentionally out of the public subprocessor list because the repo only proves optional support, not confirmed production enablement.

## Legal review still required

This implementation does not claim compliance with GDPR, CCPA, or any other regulatory regime.

Before production sign-off, a human and legal reviewer still need to:

- confirm the `April 2, 2026` effective date is still correct when the policies go live
- confirm jurisdiction coverage and user-rights language remains appropriate
- confirm third-party disclosures still match actual production deployment
- confirm the published retention schedule is implemented operationally
- confirm the conservative security / public-storage wording remains accurate
- decide whether and how cookie consent UI should be added

## Why this repo does not use the Vite plugin path

The donor app is a Next.js App Router application. The integration here uses:

- `@openpolicy/sdk` for config
- `@openpolicy/react` for route rendering
- a donor-local provider and renderers that fit the existing Next.js layout and Maia UI rules

The Vite plugin path is not used because it does not match this app's runtime or routing model.

## Upstream CLI note

As of March 31, 2026, the published `@openpolicy/cli@0.0.17` tarball is incomplete on Bun/Windows and cannot execute its documented commands in this repo. The donor app therefore ships a thin local CLI wrapper in `apps/donor/scripts/openpolicy.ts` that uses the published `@openpolicy/core` and `@openpolicy/renderers` packages to provide equivalent `validate` and `generate` workflows.
