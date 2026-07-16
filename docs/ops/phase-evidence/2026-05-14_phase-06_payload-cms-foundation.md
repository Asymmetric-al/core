# Phase 06 Payload CMS Foundation Evidence

> **Note (2026-07-06):** Twenty CRM has since been retired (ADR-0001); this
> file records the state as of its date.

Generated: 2026-05-14
Baseline commit: `c9b688fc6bdee222b8722f0e291eae376580e358`
Status: `complete`

## Scope

Phase 6 establishes Payload CMS as the durable content runtime while preserving
the completed giving, CRM, and email ownership boundaries from Phases 3-5.
Production donor, payment, CRM, and CMS data were not mutated during this proof.

## Instruction And Source Checks

- Loaded repo root `AGENTS.md`, `docs/ai/skills/repo-entry/SKILL.md`,
  `docs/ai/rules/general.md`, `docs/ai/rules/backend.md`,
  `docs/ai/rules/frontend.md`, `docs/ai/rules/testing.md`,
  `docs/ai/skills/supabase/SKILL.md`,
  `docs/ai/skills/nextjs-app-router/SKILL.md`, and
  `docs/ai/skills/react-component-dev/SKILL.md`.
- Read bundled Next.js 16 docs from `node_modules/next/dist/docs/`:
  Route Handlers, Draft Mode, and Revalidating.
- Read `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`
  and carried forward its `complete-with-deferred-mobilization` status.
- Nia was required by repo rules, but no Nia MCP tool was available in this
  Codex session. Fallback was repo-scoped `rg` plus direct source reads.

## Runtime And Schema Inventory

```txt
Payload runtime: apps/admin/payload.config.ts
Admin route: /web-studio
Database adapter: @payloadcms/db-postgres
Payload schema: cms
Collections: cms-users, tenants, pages, page-templates, missionary-giving-pages, project-pages, navigation, missionary-profiles, ministry-updates, media
Public routes: apps/admin/app/api/cms/public/**
Donor consumer: apps/donor/lib/cms/client.ts and public checkout route
Import map: apps/admin/app/(payload)/web-studio/importMap.js
SQL CMS bootstrap: supabase/migrations/20260223100000_create_cms_schema.sql
```

Payload migration status was checked against a disposable local Postgres
container because the local Supabase Postgres port `127.0.0.1:54322` was not
running. Payload reported no migration directory at `apps/admin/src/migrations`
and no migrations found.

## Collection Inventory

| Collection                | Ownership                                    | Tenant scoped          | Drafts / versions | Public surface                         |
| ------------------------- | -------------------------------------------- | ---------------------- | ----------------- | -------------------------------------- |
| `pages`                   | Standard CMS pages, rich text, layout blocks | Yes                    | Yes               | `/api/cms/public/pages/*`              |
| `navigation`              | Navigation trees                             | Yes                    | No                | `/api/cms/public/navigation`           |
| `media`                   | Upload metadata and images                   | Yes                    | No                | Relationship output only               |
| `missionary-profiles`     | CMS-facing missionary profile content        | Yes                    | No                | Internal relationship content          |
| `project-pages`           | Fund-backed project landing content          | Yes                    | Yes               | `/api/cms/public/project-pages/:slug`  |
| `ministry-updates`        | Published update articles                    | Yes                    | Yes               | `/api/cms/public/updates`              |
| `page-templates`          | Editor starter templates                     | Yes                    | Yes               | Staff only                             |
| `missionary-giving-pages` | Missionary giving landing content            | Yes                    | Yes               | `/api/cms/public/missionary-pages/:id` |
| `tenants`                 | Payload CMS tenant mirror                    | Id filter for staff    | No                | Resolver only                          |
| `cms-users`               | Payload user mirror for Supabase staff       | Text `tenantId` filter | No                | None                                   |

## Ownership Matrix

| Domain                                                                             | Source of truth                           | Phase 6 enforcement                                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Content, page structure, media, navigation, templates, draft/publish/version state | Payload CMS                               | CMS collections and public serializer own these fields              |
| Donor relationships, notes, donor detail, reports, CRM workflow records            | Twenty/CRM and package-layer CRM services | CMS does not write CRM records; docs mark CRM projections read-only |
| Gifts, staged gifts, allocations, receipt facts, payment state, reconciliation     | Stripe/Supabase giving pipeline           | CMS CTAs store copy/references only and resolve to donor checkout   |
| Receipt sends, send logs, delivery events                                          | Resend/app email services                 | CMS does not send directly through provider APIs                    |
| Mobilization stage transitions                                                     | Deferred mobilization workstream          | Documented as deferred/read-only for CMS foundation                 |

## Implemented Boundary Hardening

- Split CMS tenant identity from public Supabase tenant identity:
  `CmsUsers.tenantId` now remains the Payload tenant document id, while
  authenticated requests carry `publicTenantId` separately for giving/CRM
  validation.
- Supabase-backed Payload auth now mirrors public tenants into Payload tenants
  by slug and accepts `staff`, `admin`, or `super_admin` CMS roles without
  widening CRM/giving ownership.
- `create-from-template` now uses Payload tenant ids for CMS writes and public
  Supabase tenant UUIDs for missionary/fund validation.
- Missionary giving and project page source-reference fields now validate UUID
  shape at the collection layer, so manual CMS edits cannot save arbitrary CTA
  reference identifiers.
- Public CMS serializer sanitizes CTA hrefs, resolves missionary/project CTAs
  to `/checkout?missionary_id=...` or `/checkout?fund_id=...`, and reduces media
  relationship objects to public id/alt/url/size fields.
- Donor checkout now accepts CMS CTA query aliases: `missionary_id`, `fund_id`,
  and `frequency`.
- Media uploads now allow only image MIME types (`avif`, `gif`, `jpeg`, `png`,
  `webp`) and disable pasted remote upload URLs.

## Public Route Proof

Existing public route tests cover tenant resolution, published-only filters,
draft exclusion, and tenant isolation on:

- `tests/unit/cms/public-pages-route.test.ts`
- `tests/unit/cms/public-navigation-route.test.ts`
- `tests/unit/cms/public-updates-route.test.ts`
- `tests/unit/cms/public-missionary-project-pages-route.test.ts`

Phase 6 added/updated focused coverage for:

- Payload auth tenant mirroring and public/CMS tenant split.
- Tenant context/access behavior with Payload tenant ids.
- Safe public CTA URL generation and unsafe href rejection.
- Missionary/project CTA resolution into checkout.
- Public media relationship minimization.
- Media MIME allowlist and remote paste disablement.

## Migration And Importmap Proof

```bash
NODE_ENV=test bun run cms:importmap
# Failed before Payload boot because NEXT_PUBLIC_SUPABASE_URL was absent in this shell.

SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> NODE_ENV=test bun run cms:importmap
# Passed; wrote apps/admin/app/(payload)/web-studio/importMap.js and post-processed it.

SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> NODE_ENV=test bun run cms:migrate:status
# Failed against default 127.0.0.1:54322 because local Supabase was not running.

docker run --rm --name core-phase6-payload-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 55432:5432 -d postgres:16-alpine
SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=<local-supabase-url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key> PAYLOAD_SECRET=<test-payload-secret> PAYLOAD_DATABASE_URI=<safe-disposable-payload-db-url> NODE_ENV=test bun run cms:migrate:status
docker stop core-phase6-payload-postgres
# Passed; Payload reported no migration directory and no migrations found.
```

## No-Secret Scan

```bash
rg -n "(PAYLOAD_SECRET|PAYLOAD_DATABASE_URI|SUPABASE_SERVICE_ROLE|service_role|sk_live|sk_test|rk_live|whsec_|resend_[A-Za-z0-9]|re_[A-Za-z0-9]|TWENTY_API_KEY|SENTRY_AUTH_TOKEN|postgresql://[^\s)]*)" apps/admin/src/cms apps/admin/app/'(payload)'/web-studio/importMap.js apps/donor/app/'(public)'/checkout packages/lib/cms tests/unit/cms docs/guides/architecture/web-studio-living-spec.md docs/guides/development/site-studio-payload.md docs/ai/working-set.md
```

Matches were limited to documented environment variable names, local placeholder
examples, and existing `get-payload.ts` configuration references. No provider
secrets, tokens, cookies, webhook secrets, or service-role keys were printed or
committed.

## Focused Verification

```bash
bun run test:unit:cms
bun run typecheck
```

Results:

- `bun run test:unit:cms`: passed, 17 files, 94 tests.
- `bun run typecheck`: passed, 13 package tasks.

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

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed, 13 package tasks.
- `bun run typecheck`: passed, 13 package tasks.
- `bun run build`: passed for admin, donor, and missionary apps.
- `bun run test:unit`: passed, 202 files, 902 passed, 1 skipped.
- `bun run verify:data-boundary`: passed; no direct Supabase imports in app
  API routes and no raw Twenty access in app source.
- `bun run verify:workspace-contract`: passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed; no component drift.
- `bun run skills:verify`: passed.
- `bun run verify:vercel-production -- --commit $(git rev-parse HEAD)`:
  passed. Admin, donor, and missionary were all `READY`, with HTTP 200 health
  checks for the production domains at commit
  `c9b688fc6bdee222b8722f0e291eae376580e358`.

Database migrations did not change, so `verify:supabase-migrations` was not
required for this phase.

## Stop Conditions Observed

- Did not make Payload the source of truth for donor/gift/CRM data.
- Did not change production CMS schemas or mutate production CMS data.
- Did not expose drafts publicly.
- Did not enable production writes through CMS to CRM or giving tables.
- Did not reopen completed Phase 3, 4, or 5 implementation work.
- Did not change `giftSummaries` or regress `currencyCode` to `currency`.
