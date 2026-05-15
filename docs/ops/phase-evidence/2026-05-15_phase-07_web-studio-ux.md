# Phase 07 Web Studio UX Evidence

Generated: 2026-05-15
Baseline commit: `c9b688fc6bdee222b8722f0e291eae376580e358`
Status: `complete`

## Scope

Phase 7 builds the Mission Control-native Web Studio UX on top of the Phase 6
Payload CMS foundation. Payload remains authoritative only for content,
draft/publish/version state, media, templates, and CMS access control.

Production donor, payment, CRM, receipt, reconciliation, and CMS records were
not mutated during this proof.

## Instruction And Source Checks

- Loaded repo root `AGENTS.md`, `docs/ai/skills/repo-entry/SKILL.md`,
  `docs/ai/rules/general.md`, `docs/ai/rules/backend.md`,
  `docs/ai/rules/frontend.md`, `docs/ai/rules/testing.md`,
  `docs/ai/skills/supabase/SKILL.md`,
  `docs/ai/skills/nextjs-app-router/SKILL.md`,
  `docs/ai/skills/react-component-dev/SKILL.md`,
  `docs/ai/skills/components-build/SKILL.md`, and
  `docs/guides/architecture/data-access-boundary.md`.
- Read bundled Next.js 16 docs from `node_modules/next/dist/docs/` for Server
  Components, Client Components, Route Handlers, Mutating Data, Revalidating,
  and Draft Mode before changing Next.js routes.
- Read latest phase evidence for Phases 5 and 6, carrying forward Phase 5
  `complete-with-deferred-mobilization` and Phase 6 `complete` boundaries.
- Nia was required by repo rules, but no Nia MCP tool was available in this
  Codex session after tool discovery. Fallback was repo-scoped `rg` plus direct
  source reads.

## Web Studio Inventory

```txt
Native Web Studio shell:
  apps/admin/app/(payload)/layout.tsx
  apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx

Collection adapter and preview URL helpers:
  apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts

Template gallery:
  apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx

Authenticated preview route:
  apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx

Authenticated preview model:
  apps/admin/src/cms/preview/authenticated-preview.ts

CTA and source-reference fields:
  apps/admin/src/cms/collections/page-builders.ts
  apps/admin/src/cms/collections/missionary-profiles.ts
  apps/admin/src/cms/collections/project-pages.ts
  apps/admin/src/cms/collections/missionary-giving-pages.ts
  apps/admin/src/cms/collections/ministry-updates.ts
```

Collections inventoried: pages, navigation, media, missionary profiles, project
pages, ministry updates, page templates, missionary giving pages, tenants, and
CMS users.

## Implemented UX And Boundary Work

- Added a shared native editor state adapter for loading, empty, error, dirty,
  saved, autosave, preview, publish, locked, trash, and upload states:
  `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts`.
- Hardened the native edit shell with a state strip, primary status badge,
  authenticated preview URL wiring, and published-only public link behavior:
  `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx`.
- Embedded Payload's admin provider stack inside the Mission Control root
  layout without rendering a second `<html>` / `<body>` document shell:
  `apps/admin/app/(payload)/layout.tsx`.
- Split authenticated Web Studio previews from public donor URLs:
  `apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts`.
- Added authenticated preview support for pages, project pages, missionary
  giving pages, and ministry updates without exposing drafts to public donor
  routes:
  `apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx` and
  `apps/admin/src/cms/preview/authenticated-preview.ts`.
- Reused the public serializer for page-like preview models so CTA href and
  media relationship sanitization remain shared with published public output.
- Added source-reference validation for missionary and fund CTA references using
  public Supabase tenant UUID context when available. Payload writes still use
  CMS tenant ids:
  `apps/admin/src/cms/collections/page-builders.ts`.
- Marked CRM/giving-derived source-reference fields as read-only in CMS form
  metadata:
  `apps/admin/src/cms/collections/page-builders.ts` and
  `apps/admin/src/cms/collections/missionary-profiles.ts`.
- Fixed a native template gallery browser binding bug caused by destructuring
  `URLSearchParams.get` from `useSearchParams()`:
  `apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx`.
- Added a non-production Payload E2E bridge so the admin `E2E_AUTH_BYPASS`
  cookie syncs a normal CMS user/tenant in disposable local Payload databases:
  `apps/admin/src/cms/auth/supabase-strategy.ts` and
  `packages/auth/package.json`.

## Ownership Matrix

| Domain                                                                         | Source of truth                           | Phase 7 enforcement                                         |
| ------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| Content, page structure, media, templates, draft/publish/version state         | Payload CMS                               | Native editor shell and authenticated preview use Payload   |
| Donor relationships, notes, donor detail, reports, CRM workflow records        | Twenty/CRM and package-layer CRM services | CMS source-reference fields are read-only projections       |
| Gifts, staged gifts, allocations, receipt facts, payment state, reconciliation | Stripe/Supabase giving pipeline           | CMS CTAs resolve aliases only and do not write giving facts |
| Receipt sends, send logs, delivery events                                      | Resend/app email services                 | CMS does not send provider email directly                   |
| Mobilization stage transitions                                                 | Deferred mobilization workstream          | No CMS write path added                                     |
| Public draft exposure                                                          | None                                      | Preview route requires authenticated Payload access         |

## CTA And Preview Proof

- Missionary CTAs continue to resolve through `missionary_id`.
- Project/fund CTAs continue to resolve through `fund_id`.
- Frequency continues to resolve through `frequency`.
- Authenticated preview paths use `/web-studio/preview/<collection>/<id>`.
- Public links remain donor URLs and are exposed from the editor shell only for
  published documents.
- The authenticated preview route calls Payload Local API with
  `overrideAccess: false`, authenticated request context, `draft: true`, and
  per-collection allowlisting.

## Focused Verification

```bash
bun run test:unit:cms
bun run typecheck:admin
bun run lint:admin
SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> PAYLOAD_DATABASE_URI=<safe-disposable-payload-db-url> NODE_ENV=test bun run cms:importmap
docker run --rm --name core-phase7-payload-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 54322:5432 -d postgres:16-alpine
SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> PAYLOAD_DATABASE_URI=<safe-disposable-payload-db-url> NODE_ENV=test bun run cms:migrate
SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> PAYLOAD_DATABASE_URI=<safe-disposable-payload-db-url> NODE_ENV=test bun run test:e2e:smoke:cms
```

Results:

- `bun run test:unit:cms`: passed, 19 files, 105 tests.
- `bun run typecheck:admin`: passed.
- `bun run lint:admin`: passed.
- `bun run cms:importmap`: passed and regenerated
  `apps/admin/app/(payload)/web-studio/importMap.js`.
- `bun run cms:migrate`: passed against disposable local Payload Postgres; no
  Payload migrations were pending.
- `bun run test:e2e:smoke:cms`: passed, 16 passed in 2.2 minutes. The native
  shell assertions ran against a Payload-authenticated E2E user in the
  disposable CMS database across desktop and mobile projects.
- After the first smoke pass surfaced nested document-shell hydration warnings,
  `(payload)/layout.tsx` was updated to embed Payload `RootProvider` directly;
  the focused admin lint/typecheck/unit gates and CMS smoke were rerun.

## No-Secret Scan

```bash
rg -n "(PAYLOAD_SECRET|PAYLOAD_DATABASE_URI|SUPABASE_SERVICE_ROLE|service_role|sk_live|sk_test|rk_live|whsec_|resend_[A-Za-z0-9]|re_[A-Za-z0-9]|TWENTY_API_KEY|SENTRY_AUTH_TOKEN|postgresql://[^\s)]*)" apps/admin/src/cms apps/admin/app/'(payload)'/web-studio apps/admin/src/cms-ui/web-studio apps/admin/app/api/cms apps/donor/app/'(public)'/checkout packages/lib/cms tests/unit/cms tests/e2e/cms-*.spec.ts docs/guides/architecture/web-studio-living-spec.md docs/guides/development/site-studio-payload.md docs/guides/development/web-studio-runbook.md docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md
```

Matches were limited to documented environment variable names, placeholder
examples, and existing Payload configuration references. No provider secrets,
tokens, cookies, webhook secrets, or service-role keys were printed or
committed.

## Final Gate

Final gate executed locally:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
bun run verify:data-boundary
bun run verify:workspace-contract
bun run verify:eslint
bun run verify:shadcn-diff
bun run skills:verify
bun run verify:vercel-production -- --commit $(git rev-parse HEAD)
```

Database migrations did not change, so `verify:supabase-migrations` is not
required for this phase.

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed, 13 package tasks.
- `bun run typecheck`: passed, 13 package tasks.
- `bun run build`: passed for admin, donor, and missionary apps.
- `bun run test:unit`: passed, 204 files, 913 passed, 1 skipped.
- `bun run verify:data-boundary`: passed; no direct Supabase imports in app API
  routes and no raw Twenty access in app source.
- `bun run verify:workspace-contract`: passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed; no component drift.
- `bun run skills:verify`: passed.
- `bun run verify:vercel-production -- --commit $(git rev-parse HEAD)`:
  passed. Admin, donor, and missionary were all `READY`, with HTTP 200 health
  checks for the production domains at commit
  `c9b688fc6bdee222b8722f0e291eae376580e358`.

## Stop Conditions Observed

- Did not write CRM, giving, payment, receipt, staged gift, or reconciliation
  facts from CMS.
- Did not relax media MIME constraints or pasted remote upload URL restrictions.
- Did not expose drafts through public donor routes.
- Did not bypass Payload access controls.
- Did not disable rollback flags.
- Did not add `NEXT_PUBLIC_TWENTY_*`.
- Did not print or commit secrets.
