# Working Set

## 2026-07-18 (Eve dynamic workflow orchestration)

- Date: 2026-07-18
- Repo: Asymmetric-al/core
- Goal: Implement issue #434 as the governance-gated Eve dynamic workflow orchestration layer, stack it on PR #867, and open it for review.
- Primary area:
  - `packages/api/src/eve/dynamic-workflow/**`
  - `packages/eve-runtime/agent/{tools,hooks,instructions.md}`
  - `packages/eve-runtime/src/**`
  - `supabase/migrations/**`
  - `tests/unit/**`
  - `openspec/changes/add-eve-dynamic-workflow-orchestration/**`
- Stack:
  - TypeScript
  - Eve
  - Vercel Workflow SDK
  - Supabase Postgres
  - Zod
  - Vitest
- Constraints:
  - Generated plans are coordination data, never authorization or arbitrary executable code.
  - Re-check persisted release, emergency-off, dynamic-workflow kill switch, identity, budget, and current policy at every governed boundary.
  - Preserve #433 specialist caps and shared-context conflicts.
  - Use Eve's root-only QuickJS Workflow tool only as a sandboxed subagent coordinator.
  - Keep the global release switch off and do not activate production runtime.
  - Nia is unavailable; use repo-scoped `rg`, direct source reads, and the installed Eve docs/package source.

## 2026-06-26 (Cursor Team Kit and Babysitter repo-local skills)

- Date: 2026-06-26
- Repo: Asymmetric-al/core
- Goal: Vendor Cursor Team Kit skills and the Babysitter `babysit` skill into
  the repo-local canonical skill system, with committed Cursor/Codex mirrors,
  lock metadata, refresh automation, and maintenance docs.
- Primary area:
  - `docs/ai/skills/**`
  - `.agents/skills/**`
  - `.cursor/skills/**`
  - `scripts/refresh-upstream-skills.mjs`
  - `skills-lock.json`
  - `README.md`
  - `docs/AI_AGENT_PLAYBOOK.md`
  - `docs/ai/skills-maintenance-log.md`
- Stack:
  - Bun
  - Node.js
  - repo agent instructions
  - Cursor skills
  - Codex skills
- Constraints:
  - Preserve `AGENTS.md` and `CLAUDE.md` routing compatibility.
  - Do not invent a new skill system or create global-install-only skills.
  - Fetch current upstream files from GitHub and copy full skill directories
    when present.
  - Extend the existing safe refresh/sync/verify workflow.
  - Keep changes scoped to skill canonical files, mirrors, lock metadata,
    refresh script, and maintenance docs.

## 2026-06-16 (Remove Codex PR review automation)

- Date: 2026-06-16
- Repo: Asymmetric-al/core
- Goal: Fully remove the repo-owned Codex PR review automation from GitHub
  Actions and related documentation references.
- Primary area:
  - `.github/workflows/**`
  - `.github/**`
  - `docs/**`
  - `.cursor/commands/**`
- Stack:
  - GitHub Actions
  - Bun
  - TypeScript
  - repo agent instructions
- Constraints:
  - Remove Codex PR-review triggers without changing unrelated local Codex
    developer tooling.
  - Preserve CI, Greptile/Bugbot/Security signal labels, and branch protection
    semantics unless they directly depend on Codex review automation.
  - Nia tools are unavailable in this session; use repo-scoped `rg` and direct
    file reads.

## 2026-06-16 (Development environment rename)

- Date: 2026-06-16
- Repo: Asymmetric-al/core
- Goal: Replace old `development` environment naming with canonical
  `development` naming across first-party source, scripts, tests, and
  operational documentation.
- Primary area:
  - `docs/ops/**`
  - `.github/**`
  - `scripts/**`
  - `packages/{api,config,env}/**`
  - `apps/admin/app/api/admin/crm/gateway/**`
  - `tests/unit/**`
- Stack:
  - Next.js 16 App Router
  - TypeScript
  - Supabase
  - Vercel
  - Sentry
  - Bun
  - Vitest
- Constraints:
  - `develop` remains the branch name; only environment naming changes.
  - Preserve production branch/release semantics.
  - Do not edit third-party vendor directories or installed agent/skill mirrors.
  - Nia tools are unavailable in this session; use repo-scoped `rg` and direct
    file reads.
## 2026-06-07 (Inngest workflow executor grill)

- Date: 2026-06-07
- Repo: Asymmetric-al/core
- Goal: Stress-test and sharpen the planned Inngest durable workflow executor
  integration before implementation, with no runtime package, route, migration,
  env var, or workflow code changes in this session.
- Primary area:
  - `packages/api/src/crm/**`
  - `packages/api/src/donate/**`
  - `packages/api/src/email/webhooks/resend.ts`
  - `apps/admin/app/api/admin/crm/**`
  - `apps/donor/app/api/donate/outbox/route.ts`
  - `docs/guides/features/twenty-crm-integration/**`
  - `docs/guides/operations/donation-saga-outbox.md`
  - `docs/guides/features/pdf-studio.md`
  - `docs/guides/features/inngest-workflows/stripe-donation-workflows.md`
  - `docs/guides/features/inngest-workflows/resend-email-workflows.md`
- Stack:
  - Next.js App Router
  - TypeScript
  - Bun
  - Turborepo
  - Supabase Postgres
  - Supabase Auth
  - Twenty CRM
  - Stripe
  - Resend
  - Inngest
- Constraints:
  - Grill-only session: ask one question at a time and wait for answers.
  - Read repo and current official Inngest docs before the first question.
  - Keep Inngest out of source-of-truth ownership; Supabase rows,
    `packages/api`, audit/idempotency/replay tables, and operational logs stay
    authoritative.
  - Keep App Router API routes thin; business logic stays in `packages/api`.
  - Do not put secrets, payment internals, care-sensitive content, full donor
    records, full email bodies, attachments, rendered docs, or broad CRM
    payloads in Inngest events.
  - Stripe payment truth remains in Stripe objects/webhooks plus product
    donation records. Inngest may recover, reconcile, and summarize workflow
    progress, but it must not redefine Stripe authorization, settlement, or
    subscription lifecycle semantics.
  - ACH Direct Debit checkout can establish mandate/verification/processing
    state immediately, but payment finality can arrive later through Stripe
    status updates.
- Evidence sources used:
  - User-provided Inngest grill prompt
  - `AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/skills/{grill-with-docs,inngest,inngest-setup,inngest-api,inngest-steps,inngest-agents,inngest-events,inngest-middleware,inngest-brownfield-audit,inngest-durable-functions,inngest-flow-control}/SKILL.md`
  - `docs/ai/skills/grill-with-docs/CONTEXT-FORMAT.md`
  - `.agents/skills/stripe-best-practices/SKILL.md`
  - `.agents/skills/resend/SKILL.md`
  - `.agents/skills/resend/references/{receiving,webhooks}.md`
  - Stripe docs for PaymentIntents, Checkout Sessions, Dynamic payment methods,
    ACH Direct Debit, Link Instant Bank Payments, and Subscriptions.
  - `packages/api/src/email/webhooks/resend.ts`
  - `docs/guides/features/resend-integration.md`
  - `supabase/schema.sql`
- Latest grill decisions:
  - Bulk Support Hub message moves use one shared required free-text reason for
    the batch.
  - The shared reason is copied into every item-level move audit entry.
  - Every item-level move audit entry clearly records that the move came from a
    batch move and includes a stable batch operation identifier.
  - Batch-level summaries may supplement item-level audit, but never replace it.
  - Bulk Support Hub message moves may partially succeed. Successful item moves
    stay moved, failed items remain unchanged, and retry/recovery targets only
    the failed items.
  - Bulk move result UI includes `Retry failed` when retryable failed items
    remain. It retries only failed items through a product server path that
    re-checks tenant access, reloads item state, uses product work claims, and
    links retry audit to the original batch operation.
  - `Retry failed` reuses the original bulk move reason. Retry audit records
    that the original reason was reused and identifies the retry attempt
    separately from original item-level move audit entries.

## 2026-05-23 (PR 241 babysit review feedback)

- Date: 2026-05-23
- Repo: Asymmetric-al/core
- Goal: Babysit PR 241 through review feedback by triaging all review threads,
  CI state, mergeability, and confirmed fixes before pushing directly to
  `cursor/test-quality-phases-1-3-24c3`.
- Primary area:
  - `.github/workflows/ci-integration.yml`
  - `package.json`
  - `playwright.config.ts`
  - `docs/ai/rules/testing.md`
  - `docs/ci.md`
  - `tests/e2e/**`
  - `tests/unit/scripts/**`
  - `tests/unit/apps/**`
  - `tests/unit/packages/api/email/**`
- Stack:
  - GitHub Actions
  - Playwright
  - Vitest
  - Bun
  - Turborepo
  - TypeScript
  - Next.js 16 App Router
- Constraints:
  - Work only on PR 241 head branch.
  - Commit and push fixes directly to PR 241; do not open a new PR or merge.
  - Build a PR Review Docket before code fixes.
  - Keep changes surgical and tied to actionable review feedback.
  - Confirm CI, mergeability, unresolved threads, branch freshness, and conflicts
    after the latest push.

## 2026-05-16 (Monorepo Vercel build controls)

- Date: 2026-05-16
- Repo: Asymmetric-al/core
- Goal: Implement monorepo build controls for the three Vercel app projects so
  affected-project skipping, repo ignored-build fallback, root Turbo build
  commands, Remote Cache verification, and deployment docs reduce unnecessary
  Build CPU without changing runtime behavior.
- Primary area:
  - `apps/{admin,donor,missionary}/vercel.json`
  - `scripts/vercel/**`
  - `scripts/verify/**`
  - `tests/unit/scripts/**vercel**`
  - `docs/ops/{environments,deploy-checklist,scale-observability-reliability}.md`
  - `docs/ci.md`
  - `package.json`
- Stack:
  - Vercel
  - Turborepo
  - Next.js 16 App Router
  - TypeScript
  - Bun
  - Vitest
- Constraints:
  - Preserve existing Vercel root directories, project names, domains, env vars,
    Git provider settings, production release flow, and branch strategy.
  - Keep `ignoreCommand` as a fallback after enabling Vercel affected-project
    deployments.
  - Do not commit `.turbo/config.json`; `.turbo` remains ignored.
  - Do not add CI `--affected` pruning, manual prebuilt deployment, or broad
    Turborepo architecture cleanup in this slice.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, Vercel project API reads/patches, official Vercel docs, and bundled
    Next.js docs.
- Evidence sources used:
  - User-provided Monorepo Build Controls Spend-Containment Plan
  - `AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,testing}.md`
  - `docs/ai/skills/repo-entry/SKILL.md`
  - Vercel docs search for monorepos, project update API, `vercel.json`, and
    Turborepo Remote Cache
  - `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`
  - `node_modules/next/dist/docs/01-app/02-guides/ci-build-caching.md`

## 2026-05-16 (Admin Web Studio navigation error)

- Date: 2026-05-16
- Repo: Asymmetric-al/core
- Goal: Diagnose and fix the admin portal Web Studio sidebar navigation error
  where `/web-studio` renders the production "Something went wrong" page.
- Primary area:
  - `apps/admin/app/(payload)/web-studio/**`
  - `apps/admin/app/web-studio/**`
  - `apps/admin/app/mc-shell.tsx`
  - `apps/admin/payload.config.ts`
  - `apps/admin/src/cms-ui/web-studio/**`
  - `tests/**`
- Stack:
  - Next.js 16 App Router
  - React 19
  - Payload CMS 3
  - TypeScript
  - Bun
  - Vitest
  - Playwright
- Constraints:
  - Preserve `/web-studio` as the Payload CMS admin mount path.
  - Keep Mission Control chrome hidden inside the Payload admin surface.
  - Do not weaken admin auth or CMS tenant boundaries.
  - Use bundled Next.js docs before changing App Router code.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, and local command output.

## 2026-05-16 (Local Payload CMS developer workflow)

- Date: 2026-05-16
- Repo: Asymmetric-al/core
- Goal: Make Payload CMS / Web Studio fully usable locally through
  deterministic noninteractive commands for env repair, local Supabase reset
  or bootstrap, Payload migrations, CMS seed data, verification, strict local
  CMS E2E coverage, and developer runbook updates.
- Primary area:
  - `scripts/cms/**`
  - `apps/admin/payload.config.ts`
  - `apps/admin/src/cms/**`
  - `apps/admin/src/cms-ui/web-studio/**`
  - `apps/donor/lib/cms/client.ts`
  - `supabase/migrations/**`
  - `supabase/seed.sql`
  - `tests/unit/cms/**`
  - `tests/e2e/**cms**`
  - `docs/guides/development/**`
  - `.env.example`
- Stack:
  - Next.js 16 App Router
  - Payload CMS 3
  - Supabase Auth
  - Supabase Postgres
  - TypeScript
  - Bun
  - Turbo
  - Vitest
  - Playwright
- Constraints:
  - Preserve Payload runtime in `apps/admin`.
  - Donor consumes CMS over HTTP and must not import Payload directly.
  - Payload CMS tables stay in schema `cms`; public platform tables stay in
    schema `public`.
  - Payload tenant document IDs and public Supabase tenant UUIDs remain
    separate.
  - No hosted services or production/development secrets for local happy path.
  - Commands must be noninteractive, with destructive reset separate from
    non-destructive bootstrap.
  - E2E bypass may be used only for explicit local/test paths and must remain
    disabled for product/production behavior.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, vendor package source, and local command
    output.
- Evidence sources used:
  - User-provided Payload CMS local Codex prompt
  - `AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
  - `docs/ai/skills/{repo-entry,supabase,nextjs-supabase-auth,supabase-postgres-best-practices}/SKILL.md`
  - `supabase/AGENTS.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`

## 2026-05-15 (Native PDF Studio release finalization)

- Date: 2026-05-15
- Repo: Asymmetric-al/core
- Goal: Commit all remaining local release changes, merge the native PDF Studio
  migration stack into the production branch, clean stale local branches, and
  verify the Vercel production deployment.
- Primary area:
  - `apps/admin/app/pdf/**`
  - `apps/admin/app/api/pdf-templates/native/**`
  - `packages/api/src/pdf-templates/**`
  - `packages/config/pdf-studio-native.ts`
  - `packages/env/src/schema.ts`
  - `supabase/migrations/*native_pdf_studio*.sql`
  - `docs/features/pdf-studio/**`
  - `docs/ops/**`
  - `vendor/react-pdf-packages/**`
  - `tests/unit/**pdf*`
- Stack:
  - Next.js 16 App Router
  - React 19
  - TypeScript
  - Supabase Postgres
  - Vercel
  - Bun
  - Turbo
  - Vitest
- Constraints:
  - Production branch is `epic`.
  - Use HTTPS Git transport because local SSH fetch is not currently
    authenticated.
  - Do not commit secrets or `.env.local` values.
  - Clean only branches that are proven merged/stale or safely deletable.
  - Keep the repo-owned Vercel ignored-build controls in place.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, GitHub/Vercel connectors, `gh`, and local source evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,testing}.md`
  - `docs/ai/skills/repo-entry/SKILL.md`
  - `docs/ops/{deploy-checklist,environments}.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`
  - `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
  - Vercel documentation search for deployment inspection and Git deployment
    status.

## 2026-05-15 (Phase 11 scale, observability, reliability)

- Date: 2026-05-15
- Repo: Asymmetric-al/core
- Goal: Execute Phase 11 only by closing Sentry release/source map proof,
  runtime release-health monitoring, Vercel deployment reliability controls,
  isolated backup/restore proof, and operational evidence while preserving all
  Phase 3-10 ownership boundaries.
- Primary area:
  - `apps/{admin,donor,missionary}/next.config.ts`
  - `apps/{admin,donor,missionary}/app/api/health/route.ts`
  - `packages/api/src/health/**`
  - `scripts/sentry/**`
  - `scripts/verify/**`
  - `scripts/vercel/**`
  - `apps/{admin,donor,missionary}/vercel.json`
  - `docs/{ci.md,env-var-audit.md}`
  - `docs/ops/{deploy-checklist,environments,scale-observability-reliability}.md`
  - `docs/ops/phase-evidence/**`
  - `tests/unit/**`
- Stack:
  - Next.js 16 App Router
  - Sentry Next.js SDK
  - Vercel
  - Supabase Postgres
  - PostgreSQL backup/restore tooling
  - TypeScript
  - Bun
  - Turbo
  - Vitest
- Constraints:
  - Do not reopen Phases 3-10 unless current verification proves a direct
    Phase 11 blocker.
  - Keep runtime Sentry DSNs separate from build-only `SENTRY_AUTH_TOKEN`.
  - Do not print or commit provider tokens, DSNs, service-role keys, or
    `.env.local` values.
  - Backup/restore proof must use isolated disposable targets and must never
    restore over production data.
  - Keep donor, missionary, CMS, CRM, giving, payment, and Support Hub ownership
    boundaries unchanged.
  - Optional v2 providers remain out of scope because no provider was explicitly
    selected with scope, secrets, and ownership boundaries.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, bundled Next.js docs, official provider docs, and local source
    evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ops/phase-handoffs/phase-11_scale-observability-v2-expansion_codex-handoff.md`
  - `docs/ops/phase-evidence/*phase-03*` through `*phase-10*`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{repo-entry,nextjs-app-router,supabase,supabase-postgres-best-practices}/SKILL.md`
  - `docs/guides/architecture/{data-access-boundary,runtime-map}.md`
  - `node_modules/next/dist/docs/01-app/02-guides/instrumentation.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md`
  - `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`
  - Official Sentry, Vercel, and Supabase backup/restore docs

## 2026-05-15 (Phase 9 donor and missionary portals)

- Date: 2026-05-15
- Repo: Asymmetric-al/core
- Goal: Execute Phase 9 by hardening the donor portal into a donor
  self-service surface and the missionary workspace into a support-raising and
  communication surface, while preserving server-owned auth/data boundaries,
  Stripe-owned payment management, Payload/public-surface ownership, and
  role-scoped CRM projections.
- Primary area:
  - `apps/donor/**`
  - `apps/missionary/**`
  - `packages/api/src/giving/**`
  - `packages/api/src/crm/**`
  - `packages/api/src/email/**`
  - `packages/auth/**`
  - `packages/database/query-keys.ts`
  - `packages/ui/**`
  - `tests/unit/apps/donor/**`
  - `tests/unit/apps/missionary/**`
  - `tests/unit/packages/api/**`
  - `tests/e2e/**`
  - `docs/ops/phase-evidence/**`
- Stack:
  - Next.js 16 App Router
  - React 19
  - TypeScript
  - Supabase Auth
  - Supabase Postgres / RLS
  - Stripe
  - Resend
  - Twenty CRM projections
  - Payload CMS/public surfaces
  - Bun
  - Vitest
  - Playwright
- Constraints:
  - Keep donor and missionary route handlers thin; business logic belongs in
    `packages/api`.
  - Donor access requires donor membership and missionary access requires
    missionary membership; client-side checks are never security controls.
  - Keep all provider credentials server-only; do not add
    `NEXT_PUBLIC_TWENTY_*`.
  - Keep Stripe as the payment execution and payment-method authority.
  - Keep CMS public content separate from giving, CRM, payment, donor account,
    and missionary account truth.
  - CRM data shown in donor and missionary portals is role-scoped projection
    only.
  - Preserve Phase 8 Support Hub and Resend behavior.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, and local package/source evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ops/phase-handoffs/phase-09_donor-missionary-portals_codex-handoff.md`
  - `docs/ops/phase-evidence/*phase-03*` through `*phase-08*`
  - `openspec/specs/platform-surfaces/spec.md`
  - `openspec/changes/integrate-twenty-crm-core/design.md`
  - `docs/guides/architecture/{authz-memberships,data-access-boundary,runtime-map}.md`
  - `docs/guides/development/getting-started.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/ai/skills/{repo-entry,nextjs-app-router,react-component-dev,supabase,nextjs-supabase-auth}/SKILL.md`

## 2026-05-15 (Phase 8 Mission Control Support Hub persistence)

- Date: 2026-05-15
- Repo: Asymmetric-al/core
- Goal: Complete Phase 8 by moving Mission Control Support Hub data from
  in-memory state to persistent tenant-scoped Supabase storage, wiring Resend
  inbound `email.received` events into the Support Hub router, preserving thin
  App Router handlers, and recording the implementation evidence.
- Primary area:
  - `apps/admin/app/api/admin/support/**`
  - `apps/admin/features/support-hub/**`
  - `packages/api/src/admin/support-hub/**`
  - `packages/api/src/email/webhooks/resend.ts`
  - `supabase/migrations/*support_hub*.sql`
  - `supabase/seed.sql`
  - `tests/unit/packages/api/admin/support-hub/**`
  - `tests/unit/packages/api/email/**`
  - `tests/e2e/support-hub.smoke.spec.ts`
  - `docs/features/support-hub/**`
  - `docs/ops/phase-evidence/*phase-08*`
- Stack:
  - Next.js 16 App Router route handlers
  - React 19
  - TypeScript
  - Supabase Auth
  - Supabase Postgres / RLS
  - Resend webhooks
  - Zod
  - Bun
  - Vitest
  - Playwright
- Constraints:
  - Keep Support Hub API route handlers thin; business logic belongs in
    `packages/api`.
  - Keep tenant isolation server-side and database-enforced; do not trust
    client filters for tenant boundaries.
  - Never expose service-role keys or provider credentials to browser code.
  - Preserve Resend webhook verification and existing email event persistence.
  - Do not add `NEXT_PUBLIC_TWENTY_*` or enable production CRM writes.
  - Keep CMS tenant IDs distinct from public Supabase tenant UUIDs.
  - Keep production seeds safe: no demo data in production by default.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, and local package/source evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `supabase/AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/skills/{repo-entry,supabase,supabase-postgres-best-practices,nextjs-app-router,nextjs-supabase-auth}/SKILL.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
  - `node_modules/next/dist/docs/01-app/02-guides/mcp.md`

## 2026-05-12 (Phase 3 payments and giving pipeline)

- Date: 2026-05-12
- Repo: Asymmetric-al/core
- Goal: Execute Phase 3 payments and giving pipeline as local/dev
  implementation work, preserving existing donation saga/outbox and Stripe
  webhook foundations while stopping short of provider-dashboard and production
  completion gates.
- Primary area:
  - `apps/{admin,donor,missionary}/app/api/**/route.ts`
  - `apps/admin/app/contributions/*`
  - `apps/donor/app/{api/donate,checkout,donor-dashboard/history}/*`
  - `packages/api/src/{stripe,donations,contributions,email,crm}/*`
  - `packages/database/types/*`
  - `supabase/migrations/*`
  - `tests/unit/**/*`
  - `tests/e2e/**/*`
  - `docs/ops/phase-evidence/*`
- Stack:
  - Next.js 16 App Router route handlers and pages
  - React 19
  - TypeScript
  - Supabase Auth
  - Supabase Postgres / RLS
  - Stripe webhooks
  - Resend
  - Twenty CRM server-side gateway
  - Bun
  - Vitest
  - Playwright
- Constraints:
  - Keep app API routes thin; business logic belongs in `packages/api`.
  - Store and process Stripe events idempotently; never print Stripe or
    webhook secret values.
  - Keep Twenty CRM headless/server-side behind `packages/api`; never add
    `NEXT_PUBLIC_TWENTY_*`.
  - Treat provider dashboard checks and production deployment completion as
    gates, not assumptions.
  - Use additive migrations and include rollback notes.
  - Create/update a phase evidence note under `docs/ops/phase-evidence/`.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, and local package/source evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{repo-entry,supabase}/SKILL.md`

## 2026-05-11 (Email Studio React Email Editor migration)

- Date: 2026-05-11
- Repo: Asymmetric-al/core
- Goal: Replace the Unlayer email editing runtime with `@react-email/editor`
  while preserving Resend delivery, provider-neutral template storage,
  merge-tag validation/rendering, template persistence/test-send, image upload,
  and explicit legacy Unlayer handling for existing email templates and PDF
  Studio/document mode.
- Primary area:
  - `apps/admin/app/email/*`
  - `apps/admin/app/api/email/*`
  - `packages/ui/components/studio/*`
  - `packages/email/*`
  - `packages/api/src/email/*`
  - `packages/config/email-studio.ts`
  - `packages/env/src/schema.ts`
  - `supabase/migrations/*`
  - `docs/guides/features/{email-studio,resend-integration,pdf-studio}.md`
- Stack:
  - Next.js 16 App Router route handlers and client components
  - React 19
  - TypeScript
  - Tiptap 3 / ProseMirror
  - React Email Editor
  - Resend
  - Supabase Auth
  - Supabase Postgres / Storage
  - Bun
  - Vitest
  - Playwright
- Constraints:
  - Keep Resend as the only delivery provider path.
  - Keep App Router API route handlers thin; business logic belongs under
    `packages/api/src/email/*`.
  - Keep server-only Resend keys and Supabase service-role access out of client
    code.
  - Use additive migrations and avoid destructive DB rollback requirements.
  - Preserve existing Unlayer email templates through an explicit legacy adapter
    until migrated or archived.
  - Preserve PDF Studio/document mode as explicit legacy Unlayer behavior unless
    a separate PDF migration removes it.
  - No production template save path may rely on localStorage as source of
    truth.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, bundled Next.js docs, official React Email/Resend docs, and
    local package metadata as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,supabase,nextjs-supabase-auth,supabase-postgres-best-practices,tiptap}/SKILL.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
  - `node_modules/next/dist/docs/01-app/02-guides/forms.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
  - React Email Editor docs for overview, `EmailEditor`, export,
    `composeReactEmail`, and image upload
  - Resend embed guide for React Email Editor
  - `packages/ui/components/studio/UnlayerEditor.tsx`
  - `apps/admin/app/email/page-client.tsx`
  - `apps/admin/app/pdf/page-client.tsx`
  - `packages/email/{email-studio-types,types,resend,index}.ts`
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `supabase/{schema.sql,migrations/20260223120000_resend_email_foundation.sql}`

## 2026-05-08 (Twenty CRM Phase 07 production cutover and operations)

- Date: 2026-05-08
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 07 for the Twenty CRM integration by documenting
  domain-by-domain production cutover readiness, monitoring, runbooks,
  rollback rehearsals, backup/restore proof, secret rotation, and final
  OpenSpec/architecture alignment without adding new CRM domains.
- Primary area:
  - `docs/guides/features/twenty-crm-integration/phase-07-production-cutover-and-operations.md`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ci.md`
- Stack:
  - OpenSpec
  - Twenty CRM
  - Supabase Auth
  - Supabase Postgres / RLS
  - PostgreSQL
  - Sentry
  - Bun
  - Turborepo
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not add new CRM domains during Phase 07.
  - Do not move finance, CMS publish, care, auth, payment, receipt, statement,
    refund, reconciliation, or automation authority to Twenty.
  - Keep raw Twenty access behind `packages/api`.
  - Treat production cutover as domain-gated: no domain is live unless development
    parity, monitoring, rollback rehearsal, backup/restore evidence, and
    support ownership are recorded.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct
    file reads, and existing OpenSpec/change docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-07-production-cutover-and-operations}.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{supabase,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`

## 2026-05-08 (Twenty CRM Phase 06 cross-surface projections)

- Date: 2026-05-08
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 06 for the Twenty CRM integration by building
  cross-surface projection contracts, shadow mode, drift monitoring, and
  rollback state for donor, missionary, CMS, event, and reporting contexts
  without starting Phase 07.
- Primary area:
  - `apps/admin/app/crm/projections/*`
  - `apps/admin/app/api/admin/crm/projections/route.ts`
  - `packages/api/src/admin/crm/projections/*`
  - `packages/api/src/crm/projections/*`
  - `packages/database/hooks/admin-crm-projections.ts`
  - `packages/database/types/crm-projections.ts`
  - `supabase/migrations/*_crm_projection_shadow_surfaces.sql`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-06-cross-surface-projections-and-shadow-mode.md`
- Stack:
  - Next.js 16 App Router pages and route handlers
  - React
  - TypeScript
  - TanStack Query and Table
  - Supabase Auth
  - Supabase Postgres / RLS
  - Twenty CRM projections
  - Bun
  - Vitest
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not proceed to Phase 07.
  - Keep projections role-scoped and source-of-truth explicit.
  - Keep target surfaces in shadow mode; no donor, missionary, CMS, event, or
    reporting surface depends on Twenty yet.
  - Keep raw Twenty access behind `packages/api`.
  - Keep route handlers thin.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, and bundled `.next-docs` fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-06-cross-surface-projections-and-shadow-mode}.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/guides/development/tanstack-integration.md`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,supabase,nextjs-supabase-auth}/SKILL.md`
  - `docs/ci.md`
  - Bundled `.next-docs` App Router page, route-handler, server/client
    component, and authentication docs

## 2026-05-08 (Twenty CRM Phase 05 relationship expansion)

- Date: 2026-05-08
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 05 for the Twenty CRM integration by expanding
  relationship domains to churches, organizations, households, pledges as CRM
  relationship records, CRM search, and relationship reporting while keeping
  finance, care, CMS publish state, and auth authority in Asym.
- Primary area:
  - `apps/admin/app/crm/*`
  - `apps/admin/app/api/admin/crm/*`
  - `packages/api/src/admin/crm/*`
  - `packages/api/src/crm/*`
  - `packages/database/hooks/*`
  - `packages/database/types/*`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-05-relationship-expansion.md`
- Stack:
  - Next.js 16 App Router pages and route handlers
  - React
  - TypeScript
  - TanStack Query and Table
  - Supabase Auth
  - Supabase Postgres / RLS
  - Twenty CRM Core API
  - Bun
  - Vitest
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not proceed to Phase 06.
  - Keep finance, care, CMS publish state, and auth authority in Asym.
  - Keep pledges as CRM relationship commitments only, never payment truth.
  - Keep raw Twenty access behind `packages/api`.
  - Keep Mission Control native; do not embed raw Twenty UI as staff CRM.
  - Keep route handlers thin.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, bundled `.next-docs`, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-05-relationship-expansion}.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/guides/development/tanstack-integration.md`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,supabase,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`
  - Bundled `.next-docs` App Router page, route-handler,
    server/client-component, fetching-data, and updating-data docs

## 2026-05-08 (Twenty CRM Phase 04 first Mission Control domain)

- Date: 2026-05-08
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 04 for the Twenty CRM integration by moving one
  safe CRM domain into native Mission Control using Twenty behind `packages/api`
  while preserving tenant scope, staff auth, auditability, replay, and rollback
  readiness without proceeding to Phase 05.
- Primary area:
  - `apps/admin/app/crm/*`
  - `apps/admin/app/api/admin/crm/*`
  - `packages/api/src/admin/crm/*`
  - `packages/api/src/crm/*`
  - `packages/database/hooks/*`
  - `packages/database/types/*`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-04-first-domain-mission-control.md`
- Stack:
  - Next.js 16 App Router pages and route handlers
  - React
  - TypeScript
  - TanStack Query and Table
  - Supabase Auth
  - Supabase Postgres / RLS
  - Twenty CRM Core API
  - Bun
  - Vitest
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not proceed to Phase 05.
  - Prefer notes/tasks before people read or write.
  - Keep raw Twenty access behind `packages/api`.
  - Keep Mission Control native; do not embed raw Twenty UI as the staff CRM.
  - Keep route handlers thin.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, bundled `.next-docs`, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-04-first-domain-mission-control}.md`
  - `docs/ai/{working-set,stack-registry}.md`
  - `openspec/project.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/guides/development/tanstack-integration.md`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,supabase,nextjs-supabase-auth}/SKILL.md`
  - `docs/ci.md`
  - Bundled `.next-docs` App Router page, route-handler,
    server/client-component, fetching-data, and updating-data docs
  - Official Twenty API docs

## 2026-05-08 (Twenty CRM Phase 03 sync, eventing, and replay)

- Date: 2026-05-08
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 03 for the Twenty CRM integration by adding signed
  webhook ingress, durable inbound event storage, outbound sync queueing,
  replay/idempotency, reconciliation, and safe pause controls without Phase 04
  cutover work.
- Primary area:
  - `apps/admin/app/api/admin/crm/webhooks/twenty/route.ts`
  - `packages/api/src/crm/webhooks/*`
  - `packages/api/src/crm/sync/*`
  - `packages/api/src/crm/reconciliation/*`
  - `supabase/migrations/*_crm_sync_eventing_replay.sql`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-03-sync-eventing-and-replay.md`
- Stack:
  - Next.js 16 App Router route handlers
  - TypeScript
  - Supabase Postgres / RLS
  - Supabase Auth
  - Twenty CRM webhooks/Core API
  - Bun
  - Vitest
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not run production imports.
  - Do not proceed to Phase 04 or add user-facing cutover behavior.
  - Keep webhook and sync behavior behind `packages/api`.
  - Keep Twenty credentials and webhook secrets server-only.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, bundled `.next-docs`, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-03-sync-eventing-and-replay}.md`
  - `openspec/project.md`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{supabase,nextjs-supabase-auth,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`
  - Bundled `.next-docs` route-handler and environment-variable docs
  - Official Twenty webhook docs

## 2026-05-07 (Twenty CRM Phase 02 identity, schema, and mapping)

- Date: 2026-05-07
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 02 for the Twenty CRM integration by defining
  identity concepts, adding CRM link/merge/projection schema, designing the
  Twenty object model, choosing the schema management path, and implementing
  tested mapping and duplicate rules without production imports or Phase 03
  sync/eventing.
- Primary area:
  - `packages/api/src/crm/identity/*`
  - `packages/api/src/crm/schema/*`
  - `packages/api/src/crm/mapping/*`
  - `supabase/migrations/20260508000413_crm_identity_mapping.sql`
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-02-identity-schema-and-mapping.md`
- Stack:
  - TypeScript
  - Supabase Postgres / RLS
  - Twenty CRM Metadata API
  - Twenty CRM data model
  - Bun
  - Vitest
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change phase sequence based on existing implementation.
  - Do not run production imports.
  - Do not implement webhooks, outbound jobs, replay, or Phase 03 sync.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-02-identity-schema-and-mapping}.md`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{supabase,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`
  - Official Twenty API, data model, custom objects, and apps docs

## 2026-05-07 (Twenty CRM Phase 01 core seam and authorization)

- Date: 2026-05-07
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 01 for the Twenty CRM integration by building the
  server-side CRM gateway, internal Twenty client wrappers, server-only env
  contract, Supabase Auth to CRM authorization bridge, and CRM command log
  boundary without proceeding to Phase 02.
- Primary area:
  - `packages/api/src/crm/*`
  - `packages/api/src/admin/crm/gateway.ts`
  - `apps/admin/app/api/admin/crm/gateway/status/route.ts`
  - `packages/env/src/schema.ts`
  - `supabase/migrations/20260507234343_crm_command_logs.sql`
  - `scripts/verify/data-boundary-check.mjs`
  - `eslint.config.mjs`
- Stack:
  - Next.js 16 App Router route handlers
  - TypeScript
  - Supabase Auth
  - Supabase Postgres / RLS
  - Twenty CRM Core API
  - Twenty CRM Metadata API
  - Bun
  - Vitest
- Constraints:
  - Keep all raw Twenty access behind `packages/api`.
  - Keep credentials server-only; do not add `NEXT_PUBLIC_TWENTY_*`.
  - Use `implementation-inventory.md` only as current-status context.
  - Do not change phase sequence or proceed to Phase 02.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, bundled Next.js docs, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-01-core-seam-and-authorization}.md`
  - `openspec/project.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{supabase,nextjs-supabase-auth,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`
  - Next.js bundled route-handler and environment-variable docs
  - Official Twenty API and webhook docs

## 2026-05-07 (Twenty CRM Phase 00 strategy and proof)

- Date: 2026-05-07
- Repo: Asymmetric-al/core
- Goal: Complete only Phase 00 for the Twenty CRM integration by creating the
  OpenSpec package, ownership matrix, non-production proof plan, and Supabase
  Postgres versus dedicated Postgres decision path without implementing
  production integration code or starting Phase 01.
- Primary area:
  - `openspec/changes/integrate-twenty-crm-core/*`
  - `docs/guides/features/twenty-crm-integration/phase-00-strategy-and-proof.md`
  - `docs/guides/features/twenty-crm-integration/implementation-inventory.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/guides/architecture/data-access-boundary.md`
- Stack:
  - OpenSpec
  - Twenty CRM
  - Supabase Auth
  - Supabase Postgres
  - PostgreSQL
  - Bun
  - Turborepo
- Constraints:
  - Use implementation inventory only as current-status context.
  - Do not change the phase sequence based on existing implementation.
  - No production integration code, migrations, env schema, app routes, UI, or
    runtime behavior changes.
  - Nia tools are unavailable in this session; use repo-scoped `rg`, direct file
    reads, and official Twenty docs as fallback evidence.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/guides/features/twenty-crm-integration/{README,implementation-inventory,phase-00-strategy-and-proof}.md`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/{supabase,supabase-postgres-best-practices}/SKILL.md`
  - `docs/ci.md`
  - Official Twenty API, webhooks, Docker Compose, apps, and docker source
    references

## 2026-05-07 (Twenty CRM integration phase pack)

- Date: 2026-05-07
- Repo: Asymmetric-al/core
- Goal: Break the attached Deep Twenty CRM integration plan into repo-local phase docs and create a separate current-implementation inventory without changing the phase sequence based on current status.
- Primary area:
  - `docs/guides/features/twenty-crm-integration/*`
  - `packages/api/src/admin/crm/*`
  - `apps/admin/app/crm/*`
  - `supabase/migrations/*`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/guides/development/tanstack-integration.md`
- Constraints:
  - Keep phase docs independent of current implementation status.
  - Use the inventory only for sizing and what-exists-now reporting.
  - Nia tools are unavailable in this session; use repo-scoped `rg` and direct file reads as fallback evidence.
  - No product code, migrations, env files, or runtime behavior changes.
- Evidence sources used:
  - `twenty_crm_deep_integration_plan.pdf`
  - `openspec/project.md`
  - `openspec/specs/{platform-product-intent,platform-surfaces,platform-principles,platform-boundaries}/spec.md`
  - `docs/ai/rules/{general,backend,testing}.md`
  - `docs/ai/skills/supabase/SKILL.md`
  - `docs/ai/{stack-registry,working-set}.md`
  - Official Twenty docs for API, webhooks, Docker Compose, and apps getting started

## 2026-04-24 (AL-203 unit feedback loop)

- Date: 2026-04-24
- Repo: Asymmetric-al/core
- Goal: Implement a repeatable unit-test feedback command that runs the full Vitest suite, writes structured pass/fail artifacts, reruns failing files, categorizes remediation-related failures, and optionally posts failing reports to AL-203.
- Primary area:
  - `scripts/verify/unit-feedback.mjs`
  - `tests/unit/scripts/unit-feedback.test.ts`
  - `package.json`
  - `docs/ci.md`
- Constraints:
  - Keep `bun run test:unit` unchanged as the CI source of truth.
  - Write generated feedback artifacts under ignored `test-results/`.
  - Do not post to GitHub when the unit suite passes.
- Evidence sources used:
  - `docs/ai/rules/{general,testing}.md`
  - `.agents/skills/vitest/SKILL.md`
  - `vitest.config.ts`
  - `scripts/verify/test-unit-warnings.mjs`

## 2026-04-24 (AL-203 Next.js/React audit remediation)

- Date: 2026-04-24
- Repo: Asymmetric-al/core
- Goal: Implement the Next.js/React/Turborepo audit remediation: add global App Router fallbacks, remove donor route barrel imports, reduce route-level client boundaries, and document the rich-text raw image exception.
- Primary area:
  - `apps/{admin,donor,missionary}/app/**`
  - `apps/{admin,donor,missionary}/next.config.ts`
  - `apps/donor/features/donor/components/**`
  - `packages/ui/components/shadcn/rich-text-editor/**`
  - `docs/ai/audits/2026-04-24-next-react-turborepo-assessment.md`
- Constraints:
  - Use `.next-docs/` as the Next.js 16.2.1 docs fallback because `node_modules/next/dist/docs/` is unavailable in this environment.
  - Nia tools are unavailable in this session; use repo-scoped `git grep`, PowerShell search, and direct file reads as fallback evidence.
  - Preserve interactive page behavior by moving client logic into colocated islands rather than rewriting flows.
- Evidence sources used:
  - `docs/ai/rules/{general,frontend,testing}.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,vercel-react-best-practices}/SKILL.md`
  - `.next-docs/01-app/01-getting-started/{05-server-and-client-components,12-images}.mdx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/{error,not-found}.mdx`

## 2026-04-17 (shadcn/ui migration: post-merge validation)

- Date: 2026-04-17
- Repo: Asymmetric-al/core
- Goal: Re-validate the shadcn/ui + primitives split after merge: full `ci:preflight`, `shadcn diff` in `packages/ui`, and align unit tests with canonical `components/primitives` paths so coverage tracks real implementations rather than compatibility shims only.
- Primary area:
  - `tests/unit/packages/ui/components/primitives/**`
  - `packages/ui/components/{primitives,shadcn}/**`
- Constraints:
  - Treat `shadcn diff` and repo gates as the source of truth for canonical drift.
  - Keep compatibility re-exports in `components/shadcn/*` for external/legacy imports; tests should import primitives directly where they assert first-party helper behavior.
- Evidence sources used:
  - `bun run ci:preflight`
  - `bunx shadcn@latest diff` (cwd `packages/ui`)

## 2026-04-17 (shadcn follow-up: drift gate + Cache Components route hygiene)

- Date: 2026-04-17
- Repo: Asymmetric-al/core
- Goal: Wire `shadcn diff` into CI via `verify:shadcn-diff`, document stub vs primitive ownership in `CUSTOM.md`, and stop noisy prerender rejections for `withOperation` GET handlers under Next.js 16 `cacheComponents` by touching the incoming `NextRequest` headers before `cookies()` (per Next.js Route Handlers + Cache Components docs: request properties end prerender before runtime header APIs).
- Primary area:
  - `scripts/verify/{shadcn-diff.mjs,ci-preflight.mjs}`
  - `package.json` (script: `verify:shadcn-diff`)
  - `packages/api/src/shared/with-operation.ts`
  - `packages/api/tests/unit/with-operation.test.ts`
  - `packages/ui/components/shadcn/CUSTOM.md`
- Constraints:
  - Prefer request-scoped signals compatible with `cacheComponents` over `export const dynamic` (disabled when `cacheComponents` is on per route-segment-config docs).
  - Keep `verify:shadcn-diff` fast and non-interactive (CLI only, cwd `packages/ui`).
- Evidence sources used:
  - `.next-docs/01-app/01-getting-started/{06-cache-components,15-route-handlers}.mdx`

## 2026-04-17 (shadcn/ui full implementation pass)

- Date: 2026-04-17
- Repo: Asymmetric-al/core
- Goal: Execute the full shadcn/ui audit plan end-to-end: repo hygiene, canonical v4.3 component resync via shadcn CLI, theme-token cleanup, and separation of first-party UI from canonical shadcn surfaces without regressing Next.js 16 Cache Components behavior.
- Primary area:
  - `packages/ui/components.json`
  - `packages/ui/package.json`
  - `packages/ui/components/shadcn/**`
  - `packages/ui/components/{primitives,shadcn}/**`
  - `packages/ui/hooks/use-mobile.ts`
  - `packages/lib/hooks/use-mobile.ts`
  - `apps/{admin,donor,missionary}/app/layout.tsx`
  - `docs/ai/audits/shadcn-ui-{audit-2026-04-16,quick-fix-checklist}.md`
- Constraints:
  - Use shadcn CLI as the source of truth for canonical component sync; preserve intentional repo-specific APIs only where clearly required.
  - Keep App Router server/client boundaries explicit and compatible with `cacheComponents: true`.
  - Preserve the shared Maia/Zinc token system; remove hardcoded component colors in favor of semantic tokens.
  - Keep shared UI ownership in `packages/ui`; apps must keep consuming via `@asym/ui`.
- Evidence sources used:
  - `docs/ai/{stack-registry,working-set}.md`
  - `docs/ai/rules/{general,frontend,testing}.md`
  - `docs/ai/skills/{react-component-dev,nextjs-app-router,vercel-react-best-practices}/SKILL.md`
  - `.agents/skills/{lint-and-validate,systematic-debugging}/SKILL.md`
  - `.next-docs/01-app/{01-getting-started/06-cache-components,03-api-reference/01-directives/use-client}.mdx`
  - `npx shadcn@latest info`
  - prior repo audit docs under `docs/ai/audits/`

## 2026-04-17 (shadcn/ui follow-up: custom surface separation)

- Date: 2026-04-17
- Repo: Asymmetric-al/core
- Goal: Apply the modern shadcn best practice of separating generated primitives from first-party shared compositions by moving repo-specific UI out of `packages/ui/components/shadcn/` into sibling `components/primitives/` and `components/blocks/` folders, while preserving compatibility exports and then updating docs/metadata to reflect the final structure.
- Primary area:
  - `packages/ui/components/shadcn/**`
  - `packages/ui/components/{primitives,blocks}/**`
  - `packages/ui/package.json`
  - `packages/ui/README.md`
  - `docs/ai/audits/shadcn-ui-{audit-2026-04-16,quick-fix-checklist}.md`
- Constraints:
  - Only proceed if current best practice supports separating generated shadcn primitives from custom shared wrappers/compositions.
  - Keep old `@asym/ui/components/shadcn/*` imports working through compatibility exports/re-export stubs where needed.
  - Do not reintroduce `@/` package-local imports that break app-level transpilation.
  - Re-run the same lint/typecheck/build validation loop after the move.
- Evidence sources used:
  - Vercel Academy: `The Anatomy of shadcn/ui Components`
  - repo-local shadcn CLI outputs and current package export map
  - `docs/ai/rules/frontend.md`

## 2026-04-16 (Tiptap audit + hardening)

- Date: 2026-04-16
- Repo: Asymmetric-al/core
- Goal: Audit and harden the shared Tiptap implementation for Tiptap 3 best practices, stronger controlled-editor reliability, and lower read-only rendering cost across feed surfaces.
- Primary area:
  - `packages/ui/components/shadcn/rich-text-editor/*`
  - `packages/ui/components/shadcn/index.ts`
  - `packages/ui/package.json`
  - `apps/admin/app/feed/org-updates/page.tsx`
  - `apps/missionary/app/feed/worker-feed-page-client.tsx`
  - `docs/ai/skills/tiptap/SKILL.md`
- Constraints:
  - Keep App Router client boundaries explicit (`immediatelyRender: false` for live editors).
  - Reuse shared `@asym/ui` editor primitives; remove dead app-local editor stubs instead of duplicating behavior.
  - Prefer static rendering for read-only content instead of mounting a live ProseMirror editor per feed item.
- Evidence sources used:
  - `docs/ai/rules/{frontend,testing}.md`
  - `docs/ai/skills/tiptap/SKILL.md`
  - `.next-docs/01-app/01-getting-started/05-server-and-client-components.mdx`
  - repo file reads for current editor/viewer/toolbar consumers
  - Nia repo search against `ueberdosis/tiptap` for Tiptap 3.22 `StarterKit`, `useEditorState`, `setContent({ emitUpdate: false })`, BubbleMenu defaults, and `@tiptap/static-renderer`

## 2026-04-16 (React Doctor full-monorepo audit + fix)

- Date: 2026-04-16
- Repo: Asymmetric-al/core
- Goal: Run Million's React Doctor across the full monorepo (apps + packages), triage findings, apply all actionable error and warning fixes, and re-audit to verify the score improves.
- Primary area:
  - `apps/admin/**`, `apps/donor/**`, `apps/missionary/**`
  - `packages/ui/**`, `packages/api/**`, and other `packages/*` React surfaces
  - Driver: `scripts/react-doctor-first-party.mjs`
- Constraints:
  - Preserve Next.js 16 App Router patterns (Server Components by default, `"use client"` only where needed).
  - Respect the data-access boundary (`docs/guides/architecture/data-access-boundary.md`).
  - Gate with `bun run lint`, `bun run typecheck`, `bun run test:unit` before re-audit.
  - Keep shared fixes in `packages/ui` / `packages/api` over per-app patches.

## 2026-04-16 (animations.dev design engineering skill vendoring)

- Date: 2026-04-16
- Repo: Asymmetric-al/core
- Goal: Install the animations.dev Design Engineering skill from the provided installer, vendor it into `docs/ai/skills/` as the canonical source, mirror it through the existing sync flow, and route all animation work to it first.
- Primary area:
  - `AGENTS.md`
  - `README.md`
  - `docs/ai/skills/*`
  - `scripts/{sync-agent-skills,refresh-upstream-skills}.mjs`
  - `cursor.md`
- Constraints:
  - Follow the existing canonical-skill pattern exactly: `docs/ai/skills/*` authoring source, mirrored to `.agents/skills/*` and `.cursor/skills/*`.
  - Keep routing concise and prefer the new design-engineering skill as the first stop for animation, transitions, micro-interactions, and motion polish.
  - Do not create fake instruction surfaces; only update real repo entrypoints already in use.

## 2026-04-16 (PR #175 review — vendored Resend CLI 2.0 agent skill)

- Date: 2026-04-16
- Repo: Asymmetric-al/core
- Goal: Rigorous evidence-based review of PR #175, which vendors `resend/resend-cli` v2.0.0 into `docs/ai/skills/resend-cli/`, mirrors it to `.agents/skills/` and `.cursor/skills/`, and adds routing in `AGENTS.md`, `README.md`, `docs/ai/skills/find-skills/SKILL.md`, plus `resend-cli` entry in both `.repo-canonical-skills.json` manifests.
- Primary area:
  - `docs/ai/skills/resend-cli/{SKILL.md,references/*.md}`
  - `.agents/skills/resend-cli/**` and `.cursor/skills/resend-cli/**` (sync mirrors)
  - `.agents/skills/.repo-canonical-skills.json` and `.cursor/skills/.repo-canonical-skills.json`
  - `AGENTS.md` (Skill Routing section)
  - `README.md` (skill scripts table + maintainer refresh notes)
  - `docs/ai/skills/find-skills/SKILL.md` (Resend example block)
- Stack: AGENTS.md routing, agent-skills (.agents/.cursor mirrors), bun scripts:sync/verify, prettier, no runtime
- Constraints:
  - Pure docs/agent-tooling change — no `apps/`, `packages/`, `tooling/`, `supabase/`, or runtime `scripts/` touched.
  - Mirrors must match canonical (`bun run skills:verify` must stay green).
  - Vendored content must remain byte-faithful to upstream `resend/resend-cli` tag `v2.0.0` apart from the repo-local `references/upstream.md`.
- Outcome (2026-04-16):
  - PR #175 reviewed and **approved with non-blocking comments** (see https://github.com/Asymmetric-al/core/pull/175#pullrequestreview-4125139736).
  - Verified locally: `bun run skills:verify` clean (Greptile P1 mirror drift resolved by HEAD commit `944ffe2e28`); `bun run format:check` and `bun run lint` clean for the diff. CI on origin HEAD is fully green.
  - Inline replies posted on all 5 bot review comments (Greptile #3093388338 stale/resolved; Codex #3093260503 partial; Cursor #3093250821, #3093250824, #3093270553 valid stylistic / partial).
  - Follow-up issue #179 filed for the non-blocking doc cleanup (Quality-Gate exemption decision for vendored upstream skills + AGENTS.md / find-skills paragraph split + optional Bun callout).

## 2026-04-13 (Mission Control member care port — phase 8 contract hardening)

- Date: 2026-04-13
- Repo: Asymmetric-al/core
- Goal: Complete phase 8 by enforcing typed route contracts with shared schema-aware JSON parsing and eliminating unsafe payload casts in member-care mutation routes.
- Primary area:
  - `packages/api/src/admin/member-care/route-helpers.ts`
  - `apps/admin/app/api/admin/member-care/{thread,goals,activity,requirements,attention}/route.ts`
  - `packages/api/src/admin/member-care/mutations.ts`
  - `tests/unit/apps/admin/member-care-route-lib.test.ts`
- Constraints:
  - Keep route handlers thin while validating request shape at the HTTP boundary.
  - Preserve business validation in `@asym/api` without duplicating divergent schema logic.

## 2026-04-13 (Mission Control member care port — phase 7 follow-up hardening)

- Date: 2026-04-13
- Repo: Asymmetric-al/core
- Goal: Reapply and finalize phase 6/7 for PR #170 by extending shared route hardening across read endpoints and tightening JSON payload guards for mutation handlers.
- Primary area:
  - `packages/api/src/admin/member-care/route-helpers.ts`
  - `apps/admin/app/api/admin/member-care/{dashboard,directory,directory/[id]}/route.ts`
  - `tests/unit/apps/admin/member-care-route-lib.test.ts`
- Constraints:
  - Keep all DB/business logic in `@asym/api`.
  - Keep route handlers thin, with consistent auth/error behavior.
  - This pass is the explicit phase 6/7 recommit checkpoint for PR #170.

## 2026-04-13 (Mission Control member care port — phase 7 hardening)

- Date: 2026-04-13
- Repo: Asymmetric-al/core
- Goal: Complete phase 7 by hardening mutation route handlers with shared auth/JSON/error utilities and adding unit coverage for the shared route-helper boundary.
- Primary area:
  - `packages/api/src/admin/member-care/route-helpers.ts`
  - `apps/admin/app/api/admin/member-care/{thread,goals,activity,requirements,attention}/route.ts`
  - `tests/unit/apps/admin/member-care-route-lib.test.ts`
- Constraints:
  - Keep route handlers thin and defer business writes to `@asym/api`.
  - Return explicit HTTP status classes (401/403/400/422/500) for clearer client handling.

## 2026-04-12 (Mission Control member care port — phase 6 completion pass)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Finish phase 6 by wiring all mutation hooks into profile UX (check-in logging, manual-attention toggle, care requirements) and adding server-side cache-tag revalidation after writes.
- Primary area:
  - `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx`
  - `packages/api/src/admin/member-care/mutations.ts`
- Constraints:
  - Keep route handlers thin and business logic in `@asym/api`.
  - Ensure write paths refresh both client query caches and Next cache-tagged read models.

## 2026-04-12 (Mission Control member care port — phase 6 mutations)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Add real mutation endpoints and client mutation hooks for thread posts, care goals, activity logs, care requirements, and manual-attention updates with shared query invalidation.
- Primary area:
  - `packages/api/src/admin/member-care/mutations.ts`
  - `apps/admin/app/api/admin/member-care/{thread,goals,activity,requirements,attention}/route.ts`
  - `apps/admin/features/mission-control/care/hooks/use-care.ts`
  - `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx`
- Constraints:
  - Keep route handlers thin and business DB writes in `@asym/api`.
  - Invalidate dashboard/profile/notification query keys on mutation success.

## 2026-04-12 (Mission Control member care port — phase 5 person detail shell)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Complete person-detail shell tab coverage (overview, care thread, care plan, activity, secure notes) and route rich text through shared TipTap wrappers.
- Primary area:
  - `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx`
- Constraints:
  - Use existing shared `@asym/ui` rich text editor/viewer components (no app-local editor).
  - Keep shell/tabs styling aligned with existing Mission Control surface.

## 2026-04-12 (Mission Control member care port — phase 4 roster completion)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Complete roster UX with stronger TanStack Table filtering/search semantics, explicit care-priority visibility, and last-contact age indicators while preserving current route ownership.
- Primary area:
  - `apps/admin/features/mission-control/care/components/PersonnelList.tsx`
  - `apps/admin/app/care/directory/[id]/page.tsx`
- Constraints:
  - Keep using shared `@asym/ui` table primitives and avoid premature virtualization.
  - Align links with canonical `/care/*` routes.

## 2026-04-12 (Mission Control member care port — phase 3 overview completion)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Complete the overview slice by removing remaining placeholder assumptions in dashboard cards/panels and tightening read-model field mapping quality for activities and health signals.
- Primary area:
  - `apps/admin/features/mission-control/care/components/CareDashboard.tsx`
  - `apps/admin/features/mission-control/care/member-care.derived.ts`
  - `packages/api/src/reads/member-care.ts`
  - `tests/unit/apps/admin/features/mission-control/care/member-care-derived.test.ts`
- Constraints:
  - Keep the existing `/care` route and shell unchanged.
  - Reuse shared selector math for overview cards and side panels.

## 2026-04-12 (Mission Control member care port — phase 2 read-model wiring)

- Date: 2026-04-12
- Repo: Asymmetric-al/core
- Goal: Introduce tenant-scoped member-care read-model functions in `@asym/api` and wire admin care hooks to those read APIs via thin route handlers.
- Primary area:
  - `packages/api/src/reads/member-care.ts`
  - `packages/api/package.json` export map
  - `apps/admin/app/api/admin/member-care/**/route.ts`
  - `apps/admin/features/mission-control/care/hooks/use-care.ts`
- Constraints:
  - Keep route handlers thin and business DB access in `packages/api/src/*`.
  - Preserve existing `/care` route ownership and client surface while swapping data source.
  - Nia MCP remains unavailable in this runtime; used repo-scoped `rg` + direct file reads.

## 2026-04-11 (Mission Control member care port — phase 1 derivations)

- Date: 2026-04-11
- Repo: Asymmetric-al/core
- Goal: Start the Shepherd-to-Core member care port by extracting reusable, tested derivation utilities and wiring the existing dashboard preview cards to those selectors.
- Target paths discovered before implementation:
  - `apps/admin/app/care/page.tsx`
  - `apps/admin/app/care/directory/page.tsx`
  - `apps/admin/app/care/directory/[id]/page.tsx`
  - `apps/admin/features/mission-control/care/components/{CareDashboard,PersonnelList,PersonnelProfile,TimezoneScheduler}.tsx`
  - `apps/admin/features/mission-control/care/hooks/use-care.ts`
  - `apps/admin/features/mission-control/care/{types,constants,utils}.ts`
  - `packages/ui/components/shadcn/rich-text-editor/{rich-text-editor,rich-text-viewer}.tsx`
  - `packages/api/src/reads/*` (read-model pattern review target)
  - `packages/database/hooks/admin-workspace.ts` and `packages/database/collections/admin-workspace.ts`
- Constraints:
  - Preserve Mission Control route ownership and shell.
  - Keep app UI on shared `@asym/ui` primitives and existing tokens.
  - Centralize dashboard/notification derivation math in one module.
  - Nia MCP is not available in this runtime; fallback is repo-scoped `rg` + direct file reads.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/ai/skills/{nextjs-app-router,tiptap,tanstack-table,supabase}/SKILL.md`
  - `.next-docs/01-app/01-getting-started/{05-server-and-client-components,07-fetching-data}.mdx`

## 2026-04-14 (PR #153 boneyard-js 1.7.6 refresh)

- Date: 2026-04-14
- Repo: Asymmetric-al/core
- Goal: Update PR #153 from the current `boneyard-js` 1.7.1 target to 1.7.6, clean up the remaining donor capture-route / CI issues on the branch, and keep the Boneyard rollout on conservative runtime defaults.
- Primary area:
  - `apps/{admin,missionary,donor}/package.json`
  - `packages/ui/package.json`
  - `apps/donor/proxy.ts`
  - `playwright.donor.config.ts`
  - `.github/workflows/ci-integration.yml`
  - `docs/guides/ui-design/boneyard.md`
  - `bun.lock`
- Constraints:
  - Keep `@asym/ui` on the optional-peer + devDependency model for `boneyard-js`; do not leave a stale runtime dependency there.
  - Preserve the current guided-crawl `skeletons` configs and only regenerate `apps/*/bones/**` if 1.7.6 changes generated output materially.
  - Keep donor capture tests using the already-started CI donor app instead of starting a second dev server.
  - Do not turn on new 1.7.x shimmer/stagger knobs globally without an explicit visual reason.
- Evidence sources used:
  - `docs/ai/rules/{general,frontend,testing}.md`
  - `.next-docs/01-app/{01-getting-started/05-server-and-client-components,02-guides/third-party-libraries}.mdx`
  - `docs/guides/ui-design/boneyard.md`
  - local repo files under `apps/{admin,missionary,donor}`, `packages/ui`, `.github/workflows`, and `tests/e2e`
  - upstream `0xGF/boneyard` README plus npm tarball/type inspection for `1.6.1`, `1.7.1`, and `1.7.6`
  - GitHub PR #153 metadata and branch file reads via `gh`
- Notes:
  - The live repo index is stale for this branch; local file reads and GitHub branch reads are the source of truth for PR #153 work.
  - The highest-value upstream runtime improvement for this repo is the 1.7.6 React/Preact first-frame skeleton mount fix; the rest of the 1.7.x additions are mostly optional controls or multi-framework expansion.
  - The donor proxy bug is already covered conceptually by `tests/unit/auth/route-matching.test.ts`, which proves `/boneyard` works for nested routes and `/boneyard/` does not.

## 2026-04-11 (Repo health hardening pass)

- Date: 2026-04-11
- Repo: Asymmetric-al/core
- Goal: Land a low-risk repo health pass that reduces duplicated Mission Control shell surfaces, extracts model/section logic from the largest route modules, aligns task-surface motion with the shared reduced-motion wrapper, and corrects React Query v5 loading semantics where query state is currently read via `isLoading`.
- Primary area:
  - `apps/admin/features/mission-control/{components,shell}/**`
  - `apps/admin/app/{feed,admin/teams}/**`
  - `apps/missionary/app/{donors,feed,profile}/**`
  - `packages/missionary/components/tasks/**`
  - `scripts/verify-workspace-contract.mjs`
  - `package.json`
- Constraints:
  - Keep App Router behavior unchanged; no segment config exports while `cacheComponents` is enabled.
  - Prefer compatibility re-exports over large shell rewrites so existing imports keep working.
  - Split large route files with adjacent model/hooks/sections files instead of broad architecture changes.
  - Keep shared UI imports routed through `@asym/ui` and shared motion through `@asym/lib/motion`.
  - Scope repo-wide quality tooling to first-party sources and avoid vendor noise.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/rules/{general,frontend,testing}.md`
  - `docs/guides/architecture/{data-access-boundary,runtime-map}.md`
  - `.next-docs/01-app/01-getting-started/06-cache-components.mdx`
  - `.next-docs/01-app/03-api-reference/04-functions/use-pathname.mdx`
  - repo-scoped Nia search + direct file reads for missionary/admin route modules and Mission Control shell duplicates
- Notes:
  - The `shell/` Mission Control tree is effectively a compatibility surface; only `apps/admin/app/admin/teams/teams-sections.tsx` currently imports it directly.
  - The biggest page wins in this pass are adjacent extractions (models/hooks/sections), not full feature migrations.
  - Validation should cover `verify:workspace-contract`, scoped lint/typecheck, unit tests, and a vendor-scoped React Doctor script for future audits.

## 2026-04-10 (Web Studio Phase 5 — living documentation + handoff)

- Repo: Asymmetric-al/core
- Goal: Centralize Web Studio truth in `docs/guides/architecture/web-studio-living-spec.md`; add runbook, human + AI handoffs; link/update `cms-runtime.md`, `site-studio-payload.md`, phase snapshots; add `apps/admin/src/cms-ui/web-studio/README.md` and minimal module headers.
- Key paths:
  - `docs/guides/architecture/web-studio-living-spec.md`
  - `docs/guides/development/web-studio-runbook.md`
  - `docs/guides/development/web-studio-handoff.md`
  - `docs/ai/web-studio-handoff.md`
  - `apps/admin/src/cms-ui/web-studio/README.md`
- Rollback: doc-only; revert commits if needed.

## 2026-04-10 (Web Studio Phase 3 — templates, wizards, public expansion)

- Repo: Asymmetric-al/core
- Goal: Ship template gallery + TanStack Form wizards, Payload `create-from-template` endpoint, missionary/project public read routes, donor client helpers, and docs/tests — without breaking existing `/api/cms/public/pages` consumers.
- Key paths:
  - `apps/admin/payload.config.ts` (admin `views`, root `endpoints`)
  - `apps/admin/src/cms/create-from-template-endpoint.ts`
  - `apps/admin/src/cms-ui/web-studio/flows/*`
  - `apps/admin/app/api/cms/public/missionary-pages/[id]/route.ts`
  - `apps/admin/app/api/cms/public/project-pages/[slug]/route.ts`
  - `apps/donor/lib/cms/client.ts`
  - `docs/guides/architecture/{cms-runtime,web-studio-phase3}.md`
- Rollback: collection env flags + remove endpoint registration if needed; regenerate import map after view component path changes.

## 2026-04-08 (Mission Control contributions infinite grid)

- Date: 2026-04-08
- Repo: Asymmetric-al/core
- Goal: Rebuild the Mission Control Contributions table into a production-grade infinite virtual admin grid using TanStack Table, Query, DB, and Virtual without replacing the rest of the page chrome.
- Primary area:
  - `apps/admin/app/contributions/**`
  - `apps/admin/app/api/admin/contributions/**`
  - `packages/api/src/admin/contributions/**`
  - `packages/database/hooks/admin-contributions-infinite.ts`
  - `packages/ui/components/shadcn/data-table/data-table-responsive.tsx`
  - `supabase/migrations/20260408224500_admin_contributions_summary.sql`
- Constraints:
  - Keep client boundaries small and preserve the existing page shell, stats cards, and detail sheet.
  - Keep all business data access in `packages/api/src/*` with thin app route re-exports only.
  - Use server-aware search/filter/sort and keyset pagination for the list endpoint.
  - Use TanStack DB only where it adds value: the loaded-row client working set and future patch/realtime extension point.
  - Match the Maia theme and reuse shared UI primitives from `packages/ui`.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/rules/{frontend,backend}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `.next-docs/01-app/01-getting-started/{05-server-and-client-components,06-cache-components,07-fetching-data,15-route-handlers}.mdx`
  - Nia repo search for current Contributions implementation and shared grid/data patterns
  - TanStack CLI docs for infinite queries, query collections, virtualizer guidance, and CLI MCP migration
  - Base UI docs via Nia confirming no first-class table/grid primitive
  - shadcn CLI docs for current table component guidance
- Notes:
  - Current branch still has unrelated Mission Control nav/route work in progress; do not overwrite those files casually.
  - Existing Playwright global setup for admin auth is still blocked by the duplicated Password label locator and can fail unrelated to Contributions.

## 2026-04-08 (TanStack surface migration)

- Date: 2026-04-08
- Repo: Asymmetric-al/core
- Goal: Standardize all in-scope tables, grids, and table-like virtualized list surfaces onto the shared TanStack Table + Query + DB + Virtual architecture without regressing the existing Mission Control route fixes on this branch.
- Primary area:
  - `packages/database/{collections,hooks,providers,query-keys}.ts*`
  - `packages/ui/components/shadcn/{data-table,data-grid}/**`
  - `apps/admin/app/{contributions,crm,tasks,events,mobilize,admin/teams}/**`
  - `apps/admin/features/mission-control/{locations,care}/**`
  - `apps/donor/app/(dashboard)/donor-dashboard/history/**`
  - `apps/missionary/app/donors/page.tsx`
- Constraints:
  - Keep shared UI ownership in `packages/ui` and shared data ownership in `packages/database`.
  - Use current TanStack guidance via official CLI docs plus NIA-indexed upstream repos (`tanstack/query`, `tanstack/table`, `tanstack/db`).
  - Keep virtualization on the shared `virtualization` config path; legacy fields are compatibility-only.
  - Remove app-local or ad hoc fetch/join logic where a shared collection/hook can own the data contract instead.
  - Avoid undoing unrelated branch work, especially the current `/contributions` route and nav normalization changes.
- Evidence sources used:
  - `docs/guides/development/{tanstack-integration,tanstack-virtual-foundation,tanstack-surface-inventory}.md`
  - `packages/database/{collections/client-db,hooks/hooks,query-keys}.ts`
  - `packages/ui/components/shadcn/{data-table,data-grid}/**`
  - NIA repo search against `tanstack/query`, `tanstack/table`, and `tanstack/db`
  - official `@tanstack/cli` `search-docs` / `doc` output for Query/Table/CLI migration notes
- Notes:
  - Foundation pass completed: shared `data-grid` exports are now public, the admin app no longer owns `@tanstack/db` directly, and shared TanStack package versions are aligned and typechecked.
  - The next pass is to standardize shared domain collections/hooks in `packages/database` before refactoring app surfaces to consume them.

## 2026-04-07 (Post-Turbo-2.9 verification matrix re-run)

- Date: 2026-04-07
- Repo: Asymmetric-al/core
- Goal: Repeat full merge-safety + `ci:preflight` + verify/build/unit/E2E/turbo diagnostics per repo harness; fix regressions only if gates fail.
- Same constraints as 2026-04-06 hardening (Bun, no gate weakening, localhost-first Playwright).
- Outcome (2026-04-07 run): all listed gates green; `build:strict` fails admin without `PAYLOAD_SECRET` (expected); `bunx turbo run build --filter=@asym/admin` without `run-with-ci-env` same; use `node scripts/run-with-ci-env.mjs -- turbo run build --filter=@asym/admin` or set `PAYLOAD_SECRET`. `test:perf` needs free port 3005 (kill stray `next dev`). `turbo query affected` warns without `TURBO_SCM_BASE`. CMS E2E: admin dev logs Postgres `ECONNREFUSED` to local `:54322` when Supabase not running; assertions still passed.

## 2026-04-06 (Post-Turborepo-2.9 merge hardening: full gate + test matrix)

- Date: 2026-04-06
- Repo: Asymmetric-al/core
- Goal: Merge-ready verification after Turbo 2.9.x: merge safety, `bun install --frozen-lockfile`, `ci:preflight`, `verify*`, build matrix, unit + E2E + a11y, turbo diagnostics; fix any regressions without weakening gates.
- Primary area: repo-wide scripts, `turbo.json`, docs drift, Playwright/E2E if failures are real bugs
- Constraints: Bun only; preserve `run-with-ci-env.mjs`, localhost-first Playwright, no broad eslint/tsconfig/turbo env weakening; fix root causes.
- Evidence: `scripts/verify/ci-preflight.mjs`, `.husky/pre-push`, `.github/workflows/ci.yml`, `playwright.config.ts`, `vitest.config.ts`
- Outcome: Fixed E2E smoke by honoring demo E2E cookies in `getAuthContext` + proxy; per-app cookie names (`asym_e2e_auth_*`) + host port mapping so donor sessions do not authenticate admin; Web `btoa`/`atob` cookie encoding for Edge proxy; CMS specs use `localhost:3030`; tenant isolation spec expects 404 for unknown CMS slug. Removed stray untracked `apps/admin/payload-types.ts` that failed `verify:eslint`.

## 2026-04-05 (Turborepo 2.9.x monorepo upgrade + turbo.json audit)

- Date: 2026-04-05
- Repo: Asymmetric-al/core
- Goal: Upgrade `turbo` from 2.8.x to latest safe 2.9.x, align `turbo.json` with official 2.9 caching/env semantics, and fix small CI doc drift without changing CI job structure or integration/E2E flows.
- Primary area:
  - `package.json` (turbo devDependency pin)
  - `turbo.json` (global hash inputs, task graph, env hashing)
  - `bun.lock`
  - `docs/ci.md`, `openspec/project.md` (version baseline / accuracy vs `.github/workflows/ci.yml`)
- Constraints:
  - Bun only (`bun`, `bunx`); preserve `scripts/run-with-ci-env.mjs` contract and Windows-safe `node scripts/verify/data-boundary-check.mjs`.
  - Do not change Next 16.2.1, app ports, `turbopack.root` pattern, or `ci-integration.yml` donor dev startup.
  - No new CI skip layers (`turbo query affected`, turbo-ignore); no remote cache signature mode.
  - Nia unavailable this session; use official Turborepo docs + repo file evidence.
- Evidence sources used:
  - [Turborepo 2.9 blog](https://turborepo.dev/blog/2-9)
  - [Turborepo configuration reference](https://turborepo.dev/docs/reference/configuration)
  - `package.json`, `turbo.json`, `.github/workflows/ci.yml`, `scripts/verify/ci-preflight.mjs`
- Follow-up (same goal): narrowed `turbo.json` `build.env` to build-affecting vars only; dropped E2E/Playwright/DEMO/CI keys and runtime-only Stripe/CRON from build hash; synced `docs/env-var-audit.md` Turbo section.

## 2026-04-02 (PR #144 follow-up: hydration-safe Resend label + auth invariant tests)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Remove the App Router hydration risk in the Resend `validatedAt` label and add direct regression coverage for the “session exists but profile is unusable” redirect invariant without changing auth or Resend route semantics.
- Primary area:
  - `apps/admin/app/settings/integrations/resend/{resend-sections,validated-at}.ts*`
  - `packages/auth/{redirects,index,package}.ts`
  - `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`
  - `apps/missionary/app/layout.tsx`
  - `tests/unit/{apps/admin/resend-validated-at,auth/redirects}.test.ts`
- Constraints:
  - Keep `validatedAt` payloads unchanged and make the first render deterministic across server/client environments.
  - Preserve the current redirect URLs and public-path handling; only centralize the duplicated “login vs. no-access” split.
  - Avoid brittle Next runtime mocking; prefer pure helper coverage for the auth invariant.
  - Keep diffs surgical and avoid touching unrelated worktree changes.
- Evidence sources used:
  - `.next-docs/01-app/01-getting-started/05-server-and-client-components.mdx`
  - `docs/ai/rules/testing.md`
  - `apps/admin/app/settings/integrations/resend/resend-sections.tsx`
  - `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`
  - `apps/missionary/app/layout.tsx`
  - `packages/auth/context.ts`
- Notes:
  - Nia is not available in this session, so repo-scoped direct file reads and targeted verification are being used instead.
  - The Resend label should prefer a deterministic UTC display over locale-sensitive formatting during initial render.
  - The auth invariant already exists in `getAuthContext`; this follow-up only centralizes and tests the redirect decision.

## 2026-04-02 (PR #144 follow-up: auth redirect split + smoke restoration)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Land the narrow PR #144 follow-up fixes for session-without-profile auth redirects, restored smoke coverage, `.tsx` API-route boundary scanning, and a minimal Resend freshness signal without changing route semantics or broadening scope.
- Primary area:
  - `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`
  - `apps/missionary/app/layout.tsx`
  - `package.json`
  - `tests/e2e/{demo-auth-preflight,usability-smoke,upload-crop,donate}.spec.ts`
  - `tests/e2e/helpers/demo-auth.ts`
  - `scripts/verify/data-boundary-check.mjs`
  - `tests/unit/{script-verifiers,packages/api/email/connect}.test.ts`
  - `packages/api/src/email/connect.ts`
  - `packages/email/types.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `docs/guides/features/resend-integration.md`
- Constraints:
  - Preserve existing login redirect URLs and missionary public-path handling.
  - Treat `userId != null && !isAuthenticated` as “session exists, profile unusable” and send that branch to `/no-access`, not login.
  - Restore the smoke entrypoint through `node scripts/run-with-ci-env.mjs --` and keep Chromium + single-worker stability flags.
  - Extend the data-boundary verifier to `.tsx` API routes without changing banned imports or exception policy.
  - Keep the Resend freshness improvement small and snapshot-backed; do not reintroduce live provider validation on `GET /api/email/connect`.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/rules/{backend,testing}.md`
  - `docs/ai/skills/nextjs-app-router/SKILL.md`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/layout.mdx`
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `packages/auth/context.ts`
  - `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`
  - `apps/missionary/app/layout.tsx`
  - `scripts/verify/data-boundary-check.mjs`
  - `tests/unit/script-verifiers.test.ts`
  - `packages/api/src/email/connect.ts`
  - `packages/email/types.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `docs/guides/features/resend-integration.md`
- Notes:
  - Nia is not available in this session, so repo-scoped direct file reads and targeted searches are being used instead.
  - CI workflows do not currently invoke `test:e2e:smoke`, so the safest coverage fix is to restore the root smoke script itself instead of adding a new CI-only entrypoint.
  - The repo currently has only `.ts` files under `apps/*/app/api`, so `.tsx` support is the only concrete verifier extension needed right now.

## 2026-04-02 (PR #144 follow-up: Resend deliverability cleanup)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Land the small complexity-review follow-up on the Resend integration by centralizing blocking deliverability warning detection, documenting `validation_snapshot` as the canonical connection-state read source, and broadening DKIM/SPF verification heuristics without changing the existing route contracts.
- Primary area:
  - `packages/email/{resend,index,types}.ts`
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `tests/unit/packages/{email/resend,api/email/{connect,test-send}}.test.ts`
- Constraints:
  - Keep HTTP behavior stable for the admin email routes, especially the current `422` blocking-warning contract.
  - Keep diffs surgical and avoid schema changes or broader Resend/UI refactors.
  - Use one shared implementation of “first blocking deliverability warning”.
  - Treat `validation_snapshot` as the canonical rich-state read path; scalar columns remain synchronized persistence/compat fields.
- Evidence sources used:
  - `docs/ai/rules/{backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `.agents/skills/{test-driven-development,clean-code}/SKILL.md`
  - `packages/email/{resend,index,types}.ts`
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `tests/unit/packages/{email/resend,api/email/{connect,test-send}}.test.ts`
  - Resend docs for domain-authentication context (`https://resend.com/docs/dashboard/domains/dmarc`)
- Notes:
  - Nia is not available in this session, so repo-scoped direct file reads and targeted searches are being used instead.
  - The current branch already widened `test-send` warning-code mapping; this follow-up should preserve the established route contract unless a test proves it wrong.
  - DKIM/SPF detection currently relies too heavily on the display label in `record.record`; the new heuristics should also recognize host/value evidence like `_domainkey` and `v=spf1`.

## 2026-04-02 (PR #144 follow-up: Resend edge cases + cropper race)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Land the narrow PR #144 follow-up fixes for Resend test harness/import stability, blocking-warning code mapping, backward-compatible persisted sender parsing, and the image cropper preload race without expanding scope.
- Primary area:
  - `packages/api/src/email/{connect,test-send}.ts`
  - `packages/email/{index,resend}.ts`
  - `packages/ui/components/shadcn/{image-cropper,image-cropper-helpers}.ts*`
  - `tests/unit/packages/api/email/{connect,test-send}.test.ts`
  - `tests/unit/packages/email/resend.test.ts`
  - `tests/unit/packages/ui/components/shadcn/image-cropper-helpers.test.ts`
- Constraints:
  - Keep the fix surgical and compatible with the existing PR #144 branch shape.
  - Prefer import/mocking changes over broader Vitest config churn for the email test harness issue.
  - Preserve the current `422` contract for deliverability-blocked test sends while returning a more accurate shared error code.
  - Treat missing persisted `verified` flags as `false` instead of dropping sender rows.
  - Eliminate false negative cropper load failures without regressing the original image-load fallback behavior.
- Evidence sources used:
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `docs/ai/rules/{backend,frontend,testing}.md`
  - `packages/api/src/email/{connect,test-send}.ts`
  - `packages/email/{index,resend,constants}.ts`
  - `packages/ui/components/shadcn/{image-cropper,image-cropper-helpers}.ts`
  - `tests/unit/packages/api/email/{connect,test-send}.test.ts`
  - `tests/unit/packages/email/resend.test.ts`
  - `tests/unit/packages/ui/components/shadcn/image-cropper-helpers.test.ts`
- Notes:
  - The current clone does not reproduce the Vitest suite-load failure, so the import-path fix should stay narrow: remove the `@asym/email/resend` dependency from `connect.ts` and let the existing `@asym/email` mock own the module boundary.
  - `test-send.ts` currently hardcodes `domain_not_authenticated` for every blocking warning; this needs an explicit mapping plus a generic fallback.
  - `ImageCropper` already clears `imageError` on `onMediaLoaded`, but preload failure can still win the race if it resolves later; the fix needs stale-attempt and cropper-loaded guards before surfacing a fatal error.

## 2026-04-02 (post-validation cleanup: Resend defaults, audit logging, mobile nav, missionary metadata)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Close the remaining validation findings after the Resend/profile/Playwright hardening pass by preserving disconnected Resend sender defaults on refresh, surfacing audit-log failures for test sends, removing incorrect mobile navigation menu roles, and replacing missing missionary metadata assets with proper Next.js file conventions.
- Primary area:
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `packages/email/types.ts`
  - `apps/admin/app/settings/integrations/resend/page.tsx`
  - `packages/ui/components/public/navbar-client.tsx`
  - `apps/missionary/app/{layout,icon.svg,apple-icon.tsx,manifest.ts}`
  - `tests/unit/packages/api/email/{connect,test-send}.test.ts`
  - `tests/e2e/accessibility.spec.ts`
- Constraints:
  - Keep `GET /api/email/connect` storage-backed and truthful for disconnected rows that still have preserved sender defaults.
  - Do not turn a successfully delivered test email into a hard failure only because audit logging failed; surface the warning explicitly instead.
  - Keep mobile site navigation as plain navigation semantics, not ARIA application-menu semantics.
  - Follow Next.js 16 metadata file conventions for missionary icons/manifest instead of manual `<head>` links to missing assets.
- Evidence sources used:
  - `.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/{app-icons,manifest}.mdx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/public-folder.mdx`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `apps/admin/app/settings/integrations/resend/page.tsx`
  - `packages/ui/components/public/navbar-client.tsx`
  - `apps/missionary/app/layout.tsx`
- Notes:
  - `disconnectTenantEmailSettings` already preserves `default_from_*` and `reply_to_email`; the GET route must return them so the admin form does not erase them on refresh.
  - Audit logging for test sends currently ignores Supabase insert errors; the route should return success plus an explicit audit warning, and the admin UI should surface that state.
  - The current mobile drawer uses `role="menu"` / `role="menuitem"` on ordinary links, which implies unsupported keyboard behavior and should be removed.
  - Missionary layout currently references `/icon.svg`, `/apple-touch-icon.png`, and `/manifest.webmanifest` that do not exist; replace with `app/icon.svg`, `app/apple-icon.tsx`, and `app/manifest.ts`.

## 2026-04-02 (Resend snapshot + Playwright/profile stabilization)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Finish the merge-risk follow-up pass by making persisted Resend connection state truthful after refresh, deriving deliverability booleans from record-level evidence, reducing local Playwright flake, removing missionary profile dirty-check stringify work, normalizing the demo-auth smoke contract, and hardening test-send idempotency keys.
- Primary area:
  - `packages/email/{resend,types,index}.ts`
  - `packages/api/src/email/{connect,settings-store,test-send}.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `apps/missionary/app/profile/{page,profile-dirty-state}.ts`
  - `playwright{,.admin,.missionary}.config.ts`
  - `tests/e2e/{helpers/demo-auth,usability-smoke,demo-auth-preflight}.ts`
  - `tests/unit/{packages/api/email,packages/email,apps/missionary/app,e2e}/*.test.ts`
  - `supabase/{schema.sql,migrations/20260402100000_resend_validation_snapshot.sql}`
- Constraints:
  - Keep `GET /api/email/connect` storage-backed only; no Resend API calls on page-load hydration.
  - Treat legacy connected rows without a persisted validation snapshot as degraded and requiring reconnect, not as send-ready.
  - Keep local Playwright defaults conservative (`localhost`, single worker unless overridden, no `fullyParallel` local overload).
  - Replace the missionary profile dirty-state stringify check with an explicit field comparator.
  - Keep the smoke-suite role parsing backward-compatible without changing the production demo-auth payload shape.
- Evidence sources used:
  - `supabase/AGENTS.md`
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - official Resend API docs for domain details/records
  - `packages/{api,email}/src/email/*.ts`
  - `apps/admin/app/settings/integrations/resend/*.tsx`
  - `apps/missionary/app/profile/page.tsx`
  - `playwright*.config.ts`
- Notes:
  - Added a persisted `validation_snapshot` column for `tenant_email_settings` and wired `sendReady` through both Resend connection response types.
  - `validateResendApiKey` now enriches domain rows with per-domain detail fetches on validation paths only, so DKIM/SPF booleans are derived from record-level evidence instead of guessing.
  - Legacy stored Resend connections now hydrate as connected-but-not-send-ready with a reconnect warning instead of a misleading empty success state.
  - Missionary profile dirty-state is now a computed explicit field comparison; no `JSON.stringify` comparison runs on each keystroke.
  - Final verification for this pass is green:
    - scoped lint/typecheck for `@asym/admin`, `@asym/api`, `@asym/email`, `@asym/ui`, `@asym/missionary-app`
    - targeted Vitest for Resend, missionary dirty-state, and demo-auth helper coverage
    - `bun run test:e2e:smoke`
    - `bun run test:e2e:auth:admin`
    - `bun run ci:preflight`

## 2026-04-02 (post-migration bugfix hardening)

- Date: 2026-04-02
- Repo: Asymmetric-al/core
- Goal: Fix the follow-up regressions found during code review after the TanStack/admin/E2E hardening pass: composed upload-trigger handlers, reachable cropper image-error state, restored missionary elevated-role access, cheaper Resend settings hydration, safer Playwright cookie handling, consistent test-send idempotency, and the Resend API-key mask rendering bug.
- Primary area:
  - `packages/ui/components/shadcn/{image-upload,image-upload-helpers,image-cropper,image-cropper-helpers}.ts*`
  - `apps/missionary/app/{layout,access}.ts*`
  - `packages/api/src/email/{connect,test-send}.ts`
  - `packages/email/resend.ts`
  - `apps/admin/app/settings/integrations/resend/resend-sections.tsx`
  - `tests/e2e/usability-smoke.spec.ts`
  - `tests/unit/{apps/missionary/app/access,packages/api/email/{connect,test-send},packages/email/resend,packages/ui/components/shadcn/{image-upload-helpers,image-cropper-helpers}}.test.ts`
- Constraints:
  - Keep diffs surgical and aligned with current Next.js 16.2.1 / Playwright guidance.
  - Preserve the existing shared upload and cropper APIs for callers.
  - Move Resend provider validation off the settings GET path; keep validation on connect and test-send.
  - Use Playwright's built-in cookie synchronization instead of hand-parsing `Set-Cookie`.
  - Keep missionary support/admin access aligned with the current auth role model.
- Evidence sources used:
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `.next-docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.mdx`
  - Context7 official docs for Playwright API request cookie sharing and `react-easy-crop` media callbacks
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `packages/{api,email,ui,auth}/**`
  - `tests/e2e/{usability-smoke,auth-demo-admin,auth-demo-donor,auth-demo-missionary}.spec.ts`
- Notes:
  - Added pure helpers so the risky behavior changes are unit-testable under the repo's node-based Vitest setup.
  - `GET /api/email/connect` now hydrates from persisted storage only and no longer hits Resend on page load.
  - `sendTestEmail` now accepts an optional idempotency key so the outbound send and `email_send_logs` row use the same value.
  - Donor smoke initially hit a transient Turbopack dev panic, but the rerun passed once Next invalidated the corrupted cache.
  - Final verification for this pass is green: targeted unit tests, scoped lint/typecheck, donor/admin/missionary E2E auth-smoke coverage, repo `check`, repo `build`, and `format:check`.

## 2026-04-01 (E2E harness stabilization on epic)

- Date: 2026-04-01
- Repo: Asymmetric-al/core
- Goal: Repair the repo-advertised validation surface on `epic` so smoke/auth E2E and cross-platform verification actually exercise the current Next.js 16.2.1 branch instead of failing from stale harness drift.
- Primary area:
  - `package.json`
  - `playwright.config.ts`
  - `playwright.admin.config.ts`
  - `playwright.missionary.config.ts`
  - `apps/{admin,donor,missionary}/package.json`
  - `scripts/run-with-ci-env.mjs`
  - `scripts/verify/data-boundary-check.{mjs,sh}`
  - `tests/e2e/{demo-auth-preflight,usability-smoke}.spec.ts`
  - `tests/unit/script-verifiers.test.ts`
  - `packages/database/collections/client-db.ts`
- Constraints:
  - Keep Next.js 16.2.1 and align local Playwright defaults with the current dev-origin guidance.
  - Prefer `localhost` for local dev/E2E unless explicitly opting into another origin.
  - Make smoke/auth commands validate real configured Supabase env when `.env.local` exists, but preserve safe CI defaults when it does not.
  - Fix the harness with minimal, surgical diffs and add targeted regression tests where behavior is easy to lock down.
  - Use repo-local evidence because Nia is unavailable in this session.
- Evidence sources used:
  - `.next-docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.mdx`
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `.agents/skills/{test-driven-development,playwright-skill,clean-code}/SKILL.md`
  - `package.json`
  - `playwright{,.admin,.missionary}.config.ts`
  - `scripts/run-with-ci-env.mjs`
  - `apps/{admin,donor,missionary}/package.json`
  - `tests/e2e/README.md`
  - `packages/database/collections/client-db.ts`
- Notes:
  - `test:e2e:smoke` currently references two missing specs (`demo-auth-preflight.spec.ts` and `usability-smoke.spec.ts`) and app-local `dev:playwright` scripts that do not exist.
  - `test:e2e:auth:admin` currently fails because the CI env wrapper injects placeholder Supabase values instead of loading local configured env first.
  - `verify:data-boundary` currently shells to `bash`, which fails on this Windows machine.

## 2026-04-01 (post-pull epic merge verification)

- Date: 2026-04-01
- Repo: Asymmetric-al/core
- Goal: Verify that the current local `epic` state after pulling `origin` still merges and runs cleanly with the previously developed admin auth/locations/Resend compatibility fixes, without downgrading the branch off Next.js 16.2.1.
- Primary area:
  - `apps/admin/app/{layout,mc-shell,page,dashboard-stats-loader}.tsx`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `apps/admin/app/api/admin/locations/route.ts`
  - `apps/admin/features/mission-control/locations/hooks/use-locations.ts`
  - `apps/admin/lib/authenticated-fetch.ts`
  - `packages/{api,auth,email,lib}/**`
  - `tests/unit/{auth,packages/api/email}/*`
- Constraints:
  - Keep the pulled branch on Next.js `16.2.1`; do not restore older `16.1.6` manifests from the local compatibility branch.
  - Treat `origin/epic` as the source of truth for package versions; only reapply the missing runtime fixes.
  - Use repo-local evidence because Nia is unavailable in this session.
  - Verify both production build and real browser behavior on the pulled branch.
- Evidence sources used:
  - `git status --short --branch`
  - `git log --graph --decorate --oneline --max-count=40`
  - `git diff c42e0422..HEAD -- <paths>`
  - `.next-docs/01-app/01-getting-started/{03-layouts-and-pages,15-route-handlers}.mdx`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `apps/admin/.next/dev-admin-origin.log`
- Notes:
  - `origin/epic` already contains the earlier TanStack/admin merge commit, but it did not contain the later local compatibility fixes for server-first admin bootstrap, authenticated admin fetches, or the Resend missing-table fallback.
  - After `git pull`, the live install was stale and still resolving `next@16.1.6`; `bun install` was required to bring the workspace back to the declared `16.2.1` state.
  - Browser verification must use `http://localhost:3030`, not `127.0.0.1:3030`, because Next.js 16 dev blocks cross-origin HMR requests unless `allowedDevOrigins` is configured.
  - Verification completed successfully after reinstall:
    - `bunx turbo run lint --filter=@asym/admin --filter=@asym/api --filter=@asym/auth --filter=@asym/lib --filter=@asym/missionary-app --filter=@asym/ui`
    - `bunx turbo run typecheck --filter=@asym/admin --filter=@asym/api --filter=@asym/auth --filter=@asym/lib --filter=@asym/missionary-app --filter=@asym/ui`
    - `bunx vitest run tests/unit/auth/permissions.test.ts tests/unit/packages/api/email/connect.test.ts tests/unit/packages/api/email/test-send.test.ts`
    - `bun run check`
    - `bun run build`
    - Playwright smoke on admin login, tasks create, locations create, and Resend settings page
  - Remaining known caveat from verification: the Resend settings screen in this hosted environment still reports `EMAIL_SETTINGS_STORAGE_UNAVAILABLE`, so connect is session-only until the hosted DB gets the tenant email settings migration.

## 2026-04-01 (final smoke/auth hardening)

- Date: 2026-04-01
- Repo: Asymmetric-al/core
- Goal: Finish the last merge-risk validation gaps by making the root smoke suite deterministic, fixing upload-trigger accessibility semantics, and aligning missionary auth gating with the shared role model.
- Primary area:
  - `package.json`
  - `tests/e2e/usability-smoke.spec.ts`
  - `tests/e2e/upload-crop.spec.ts`
  - `packages/ui/components/shadcn/{image-upload,image-cropper}.tsx`
  - `apps/donor/app/(dashboard)/donor-dashboard/settings/page.tsx`
  - `apps/missionary/{app/layout.tsx,app/profile/page.tsx}`
- Constraints:
  - Keep smoke intentionally small and single-worker stable on a local Next.js dev server.
  - Preserve button semantics for custom shadcn `Button` children while making non-button upload triggers keyboard-accessible.
  - Use the shared auth context in app layouts instead of duplicating profile-role reads.
- Evidence sources used:
  - `tests/e2e/{upload-crop,auth-demo-missionary,auth-login-screen-donor,donate}.spec.ts`
  - `packages/ui/components/shadcn/{button,dialog,image-upload,image-cropper}.tsx`
  - `apps/donor/app/(dashboard)/donor-dashboard/settings/page.tsx`
  - `apps/missionary/{app/layout.tsx,proxy.ts}`
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
- Notes:
  - Replaced the missing/bloated smoke invocation with a dedicated `tests/e2e/usability-smoke.spec.ts` and `--workers=1`.
  - `ImageUpload` now preserves visible names for shadcn `Button` triggers, avoids nested interactive wrappers, and adds explicit labels for non-button avatar/cover affordances.
  - `ImageCropper` now has explicit dialog title/description markup for Radix accessibility.
  - `apps/missionary/app/layout.tsx` now uses `getAuthContext` + `hasAnyContextRole`, matching donor/admin behavior and the missionary proxy role policy.
  - Additional verification after the main fix pass:
    - `bun run test:e2e` now passes reliably with the new local worker cap (`64 passed, 4 skipped`).
    - `bun run test:a11y` passes on both Chromium and mobile-chrome.
    - `bun run ci:preflight` passes after formatting and cleaning generated skill temp artifacts.
  - Live admin browser verification succeeded for task creation and location creation.
  - Live Resend connect succeeded (`POST /api/email/connect` returned `200`), but live test-send failed with `403` because `globalfellowship.org` is not verified on the supplied Resend account. This is an operational/domain-verification issue, not a branch code regression.

## 2026-04-01 (Resend sender verification + donor homepage a11y hardening)

- Date: 2026-04-01
- Repo: Asymmetric-al/core
- Goal: Fail fast when the admin Resend integration is configured with a `from` address that does not match a verified Resend domain, and remove the donor homepage CTA contrast flake while making the a11y suite assert a stable final UI state.
- Primary area:
  - `packages/email/{constants,resend,index,types}.ts`
  - `packages/api/src/email/{connect,test-send}.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `packages/ui/components/public/{home-hero-animated,home-sections,navbar,navbar-client}.tsx`
  - `tests/unit/packages/{email,api/email}/*.test.ts`
  - `tests/e2e/accessibility.spec.ts`
  - `docs/guides/features/resend-integration.md`
- Constraints:
  - Use official Resend behavior: the sender address must use the exact verified domain/subdomain, not just any related parent domain.
  - Keep route handlers thin; business/provider validation stays in `packages/*`.
  - Keep the admin Resend UI informative: show why sending is blocked and disable the test-send action when configuration is not send-ready.
  - Keep homepage CTA styling within the existing Maia/slate public-site language; do not add a parallel button system.
  - Make the a11y suite wait for a settled page before scanning and fail on real contrast defects.
- Evidence sources used:
  - `.next-docs/01-app/02-guides/testing/playwright.mdx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/route.mdx`
  - `docs/ai/rules/{frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - Context7 official Resend docs / knowledge base for domain mismatch and domain verification
  - `packages/api/src/email/{connect,test-send,settings-store}.ts`
  - `packages/email/{resend,constants,types}.ts`
  - `packages/ui/components/public/{home-hero-animated,home-sections,navbar,navbar-client}.tsx`
  - `tests/e2e/accessibility.spec.ts`
- Notes:
  - The current admin connect path validates the API key but does not block a `defaultFromEmail` on an unverified domain, which leads to a late `403` at test-send time.
  - The donor homepage contrast issue appears on the hero CTA and is amplified by custom button color overrides layered on top of the shared default button variant.
  - Isolated homepage scans can pass, but the full a11y suite still catches a serious contrast violation under its current timing; the fix needs both stable scans and non-conflicting CTA classes.

## 2026-03-31 (admin TanStack Form migration)

- Date: 2026-03-31
- Repo: Asymmetric-al/core
- Goal: Replace RHF/manual complex form state in `apps/admin` with TanStack Form where it clearly improves multi-field validation/composition, while keeping simple native or local-state surfaces unchanged.
- Primary area:
  - `apps/admin/features/mission-control/locations/components/LocationEditor.tsx`
  - `apps/admin/app/tasks/{task-form,task-form-sections,task-drawer-sections,tasks-content}.tsx`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `packages/ui/components/shadcn/{form,field}.tsx`
  - `apps/admin/package.json`
  - `packages/ui/package.json`
  - `docs/ai/rules/frontend.md`
  - `tests/unit/apps/admin/*` and/or targeted form helper tests if extraction is needed
- Constraints:
  - Preserve Maia theme and shadcn/ui composition; no parallel design system.
  - Keep client boundaries small and App Router-safe.
  - Do not force TanStack Form onto trivial search/filter or one-field surfaces.
  - Use existing mutation transport: React Query for locations, existing task save flow, and route-handler `fetch` for Resend.
  - Use TanStack Form native APIs and direct Zod/Standard Schema validation; do not preserve RHF-shaped shared APIs by inertia.
- Evidence sources used:
  - `AGENTS.md`
  - `docs/ai/{stack-registry,working-set}.md`
  - `docs/ai/rules/{general,frontend,backend,testing}.md`
  - `docs/guides/architecture/data-access-boundary.md`
  - `docs/ai/skills/{nextjs-app-router,react-component-dev,components-build,moai-library-shadcn}/SKILL.md`
  - `.agents/skills/{better-forms,test-driven-development,lint-and-validate}/SKILL.md`
  - `.next-docs/01-app/{02-guides/forms,01-getting-started/05-server-and-client-components,01-getting-started/08-updating-data,03-api-reference/02-components/form}.mdx`
  - Context7 official TanStack Form docs for validation, arrays, `createFormHook`, and Standard Schema / Zod support
- Notes:
  - `AGENTS.md` requires Nia repo-scoped search, but Nia tools are unavailable in this session; using repo-scoped `rg`, direct file reads, and targeted tests as fallback.
  - `docs/ai/rules/frontend.md` currently mandates React Hook Form; this pass will update that rule to TanStack Form + Zod for complex client forms while preserving native/simple form guidance.

## 2026-03-31 (OpenPolicy donor legal scaffold)

- Date: 2026-03-31
- Repo: Asymmetric-al/core
- Goal: Add a low-risk OpenPolicy integration in `apps/donor` with public legal routes, Maia-native rendering, validation/generation scripts, and repo docs for future human and AI policy authoring.
- Primary area:
  - `apps/donor/openpolicy.ts`
  - `apps/donor/components/openpolicy/*`
  - `apps/donor/components/providers/openpolicy-provider.tsx`
  - `apps/donor/app/layout.tsx`
  - `apps/donor/app/(public)/{privacy,terms,cookies}/page.tsx`
  - `apps/donor/package.json`
  - `package.json`
  - `packages/config/site-shared.ts`
  - `packages/lib/seo/metadata.ts`
  - `tests/e2e/accessibility.spec.ts`
  - `docs/guides/features/openpolicy-legal-pages.md`
  - `docs/ai/OPENPOLICY-*.md`
- Constraints:
  - Keep OpenPolicy ownership in the donor app; do not add OpenPolicy internals to `packages/ui`.
  - Preserve the existing donor provider stack and Maia/Zinc token ownership in `packages/ui/styles/globals.css`.
  - Use repo-native `@asym/ui` primitives and semantic classes only.
  - Do not invent legal facts; use placeholders and TODO markers for human/legal review.
  - Keep cookie consent scope honest; no heavy banner implementation in this pass.
- Evidence sources used:
  - `apps/donor/app/layout.tsx`
  - `apps/donor/package.json`
  - `packages/ui/components/public/footer.tsx`
  - `packages/config/site-shared.ts`
  - `packages/lib/seo/metadata.ts`
  - `.env.example`
  - `packages/env/src/schema.ts`
  - `packages/lib/{stripe.ts,monitoring/sentry.ts,cloudinary-*.ts}`
  - `packages/email/resend.ts`
  - `packages/ui/components/studio/UnlayerEditor.tsx`
  - OpenPolicy upstream repo (`jamiedavenport/openpolicy`) for current config, React, and CLI APIs
- Notes:
  - `AGENTS.md` requires Nia repo-scoped search, but Nia tools are unavailable in this session; using repo-scoped shell reads and targeted file inspection as fallback.
  - Next.js docs were re-read from the local docs snapshot before touching App Router files.
  - Final donor validation was temporarily blocked by a pre-existing Base UI drawer wrapper import (`DrawerPreview`) after the repo's Base UI 1.3.0 upgrade; shared wrapper is being aligned to the current `Drawer` namespace so `typecheck` and `build` can complete.
  - Final scoped verification is now green for donor/OpenPolicy (`lint:donor`, `typecheck:donor`, `build:donor`, legal validate/generate, unit tests, live route checks).
  - Follow-up hardening replaced raw public `TODO:` policy prose with public-safe review markers in `apps/donor/openpolicy.ts`; validator/tests/docs/generated artifacts must stay aligned to that model.
  - Effective dates are now set to `April 2, 2026`; generated public outputs should no longer render review-marker date text.
  - Repo-wide `bun run check` and `bun run build` are green again after restoring RHF-compatible exports in `packages/ui/components/shadcn/form.tsx` for the still-unmigrated missionary surfaces while keeping the new TanStack Form exports available for admin migration work.
  - Explicit human-provided drafting facts are now wired into `apps/donor/openpolicy.ts` for legal identity, mailing address, privacy contact, California governing law / venue, donation reversals, public subprocessors, retention schedule, necessary-cookies-only posture, and the current no-intentional-EEA/UK-targeting posture.

## 2026-03-31 (missionary TanStack Form completion)

- Date: 2026-03-31
- Repo: Asymmetric-al/core
- Goal: Finish the last missionary React Hook Form surfaces so `packages/ui/components/shadcn/form.tsx` can return to a single TanStack Form implementation.
- Primary area:
  - `apps/missionary/app/donors/{page,edit-donor-dialog,edit-donor-form-model}.tsx`
  - `packages/missionary/components/{add-partner-dialog,add-partner-form-model,task-dialog,task-form-model}.tsx`
  - `packages/ui/components/shadcn/form.tsx`
  - `apps/missionary/package.json`
  - `packages/missionary/package.json`
  - `packages/ui/package.json`
  - `tests/unit/apps/missionary/app/donors/edit-donor-form-model.test.ts`
  - `tests/unit/packages/missionary/{add-partner-form-model,task-form-model}.test.ts`
- Constraints:
  - Keep the missionary donor/tasks UX and Maia styling intact.
  - Extract validation/payload logic into small testable helpers before large UI rewrites.
  - Remove the temporary RHF compatibility surface only after repo-wide caller verification.
  - Keep App Router client boundaries explicit and compatible with Next.js 16 guidance.
- Evidence sources used:
  - `apps/missionary/app/donors/page.tsx`
  - `packages/missionary/components/{add-partner-dialog,task-dialog}.tsx`
  - `packages/ui/components/shadcn/form.tsx`
  - `.next-docs/01-app/{02-guides/forms,01-getting-started/05-server-and-client-components}.mdx`
  - `.agents/skills/{better-forms,test-driven-development}/SKILL.md`
- Notes:
  - `AGENTS.md` requires Nia repo-scoped search, but Nia tools are unavailable in this session; repo-scoped `git grep`, direct file reads, and targeted tests were used instead.
  - Added helper-model tests first, then migrated the three missionary surfaces (`add partner`, `task dialog`, `edit partner`) onto `useAsymForm`.
  - `packages/ui/components/shadcn/form.tsx` now exports TanStack Form utilities only; `react-hook-form` and `@hookform/resolvers` were removed from `apps/missionary`, `packages/missionary`, and `packages/ui`.
  - Post-migration verification is green: scoped lint/typecheck, helper-model tests, full `bun run check`, and full `bun run build`.
## 2026-03-29 (regression tests — Next 16.2 / donor public shell)

- Date: 2026-03-29
- Repo: Asymmetric-al/core
- Goal: Lock in minimal unit coverage for high-blast-radius surfaces from the Next 16.2.1 upgrade and donor public navbar fix.
- Primary area: `packages/ui/lib/drawer-swipe-direction.ts`, `packages/ui/components/shadcn/drawer.tsx`, `apps/donor/next.config.ts` (`images.qualities`), `packages/ui/components/public/navbar.tsx`, `tests/unit/{packages/ui,apps/donor}/*`
- Verification: `bunx vitest run tests/unit/packages/ui/drawer-swipe-direction.test.ts tests/unit/apps/donor/next-config-images.test.ts tests/unit/packages/ui/navbar-public-imports.test.ts`

## 2026-03-25 (TypeScript 6/7 future-readiness prep — cursor/typescript-future-readiness-4e19)

- Date: 2026-03-25
- Repo: Asymmetric-al/core
- Goal: Conservative prep for future TypeScript 6 and 7 migrations without upgrading the compiler or changing runtime behavior.
- Primary area: `tooling/typescript-config/base.json`, `apps/{admin,donor,missionary}/tsconfig.json`, `packages/{ui,missionary}/tsconfig.json`, `docs/guides/typescript-6-readiness.md`, `docs/ai/rules/typescript-future-proofing.md`, `AGENTS.md`, `docs/README.md`, `scripts/tsconfig-future-audit.mjs`
- Decisions:
  - Explicit `libReplacement: true` and `noUncheckedSideEffectImports: false` in shared base to freeze TypeScript 5.9 behavior before TS 6 default changes.
  - Removed redundant `baseUrl` where only `paths` was used (official `paths` does not require `baseUrl`).
  - Documented policy, audit matrix, and optional non-blocking `bun run tsconfig:future-audit`.
- Deferred: enabling `noUncheckedSideEffectImports` globally, repo-wide `types` arrays, `rootDir` churn, TS 6/7 compiler adoption, native preview in default workflows.
- Verification: `bun run typecheck` after config edits.

## 2026-03-24 (instruction system — cursor/instruction-system-architecture-75bb)

- Date: 2026-03-24
- Repo: Asymmetric-al/core
- Goal: Conservative refresh of agent instruction routing (AGENTS.md, Copilot, Cursor rules/MCP mirror) without changing product code; align Next.js version pins and skill paths with repo reality.
- Primary area: `AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/mcp.json`, `.cursor/rules/next-devtools-mcp.mdc`, `cursor.md`, `docs/ai/rules/general.md`, `docs/ai/working-set.md`, `SKILL.md`
- Constraints:
  - Preserve `<!-- BEGIN:nextjs-agent-rules -->` block verbatim and keep `<!-- NEXT-AGENTS-MD-START -->` … `END` region intact.
  - No edits under `apps/`, `packages/` product code, tests, or DB migrations.
- Evidence sources used:
  - Root and app `package.json` (Next.js pin; see live manifests)
  - Root `.mcp.json` (`next-devtools`, `tanstack`)
  - `docs/ai/skills/*/SKILL.md` inventory vs `AGENTS.md` skill routing
  - `https://nextjs.org/docs/app/guides/ai-agents`, `https://nextjs.org/docs/app/guides/mcp`, `https://cursor.com/docs/rules`

## 2026-03-22 (Next.js 16.2.1 stabilization)

- Date: 2026-03-22
- Repo: Asymmetric-al/core
- Goal: Upgrade the monorepo from Next.js 16.1.6 to 16.2.1 with the smallest safe diff, validate all three apps, and avoid canary/install drift.
- Primary area:
  - `package.json`
  - `apps/{admin,donor,missionary}/package.json`
  - `packages/{api,auth,database,lib,missionary,ui}/package.json`
  - `apps/donor/next.config.ts`
  - `packages/ui/components/{shadcn/drawer,public/navbar}.tsx`
  - `bun.lock`
- Constraints:
  - Keep Turbopack for `next dev` and only change build strategy if validation proves it necessary.
  - Avoid broad codemods; repo is already on proxy/async request APIs/ESLint CLI.
  - Preserve Payload + Cache Components behavior in admin.
  - Keep unrelated dependency churn out of the diff.
- Evidence sources used:
  - root/app/package manifests + `bun.lock`
  - `.next-docs/01-app/02-guides/upgrading/version-16.mdx`
  - `.next-docs/01-app/03-api-reference/{06-cli/next,05-config/01-next-config-js/{turbopack,reactCompiler,isolatedDevBuild,optimizePackageImports},04-functions/{revalidateTag,updateTag},02-components/image}.mdx`
  - Next.js 16.2 / 16.2.1 release notes and Turbopack 16.2 notes
- Decisions:
  - Clean reinstall first to remove stale canary/install drift before trusting any build output.
  - Keep the build scripts on default `next build` because all three apps successfully build on 16.2.1 with Turbopack after the real compatibility fixes.
  - Add `images.qualities` to donor config to preserve the existing `quality={85}` worker hero image behavior under Next 16 image allowlisting.
  - Update shared drawer wrapper from `DrawerPreview` to stable `Drawer` for Base UI 1.3.0 compatibility.
  - Fix client/server env boundary by switching `packages/ui/components/public/navbar.tsx` from `@asym/config/site` to `@asym/config/site-client`.
- Verification:
  - Direct production builds:
    - `node scripts/run-with-ci-env.mjs -- bun run --cwd apps/donor build`
    - `node scripts/run-with-ci-env.mjs -- bun run --cwd apps/missionary build`
    - `node scripts/run-with-ci-env.mjs -- bun run --cwd apps/admin build`
  - Local CI parity:
    - `bun run ci:preflight`
  - Production start smoke:
    - donor `http://127.0.0.1:3005`
    - missionary `http://127.0.0.1:4005`
    - admin `http://127.0.0.1:3036`
  - Manual browser smoke:
    - donor protected route redirect verified
    - missionary login verified
    - admin login verified
    - donor worker detail page initially failed from client-side server-env access, then passed on refreshed build after navbar fix
## 2026-03-18 (auth stabilization — cursor/supabase-login-foundation-6869)

- Date: 2026-03-18
- Repo: Asymmetric-al/core
- Goal: Stabilize and complete auth on branch using latest epic as base; fix known auth issues and run clean lint/typecheck/unit tests.
- Primary area: `packages/auth/middleware.ts`, `packages/ui/components/auth/LoginScreen.tsx`, `packages/database/supabase/proxy.ts`, `packages/api/src/auth/demo-account.ts`, `tests/unit/auth/*`, merge resolution with epic (mc-shell, ui package.json, bun.lock), base-ui drawer types.
- Decisions:
  - LoginScreen: use `getUser()` instead of `getSession()` to avoid redirect loop from cached revoked sessions.
  - Middleware: redirect base uses only `request.nextUrl.origin` (no Origin/Referer) to prevent open redirect.
  - Middleware: session validation uses `getUser()` instead of `getClaims()` so revoked sessions are rejected.
  - E2E auth bypass: removed test that expected middleware to honor E2E cookie; middleware stays simple and does not implement bypass.
  - Proxy: cookie refresh uses `getSession()` (legacy helper remains cookie-refresh only).
  - Config logging: `logMissingSupabaseConfig` takes `SupabasePublicConfig` instead of reading `process.env` in auth package.
  - Demo-account: use `serverEnv` / `runtimeEnvFlags` instead of raw `process.env`.
- Verification: `bun run lint`, `bun run typecheck`, `bunx vitest run tests/unit/auth/` (38 tests pass). Full `bun run test:unit` has pre-existing CMS/script-verifier timeouts unrelated to auth.

## 2026-03-13

- Date: 2026-03-13
- Repo: Asymmetric-al/core
- Goal: Upgrade declared Base UI dependencies to v1.3.0 and perform the smallest safe shared-wrapper migration needed for modern Base UI alignment without redesigning the Maia UI layer.
- Primary area: `apps/{admin,donor,missionary}/package.json`, `packages/ui/package.json`, `packages/ui/components/shadcn/{drawer}.tsx`, `packages/ui/styles/globals.css`
- Constraints:
  - Keep public wrapper APIs stable where possible.
  - Prefer shared-wrapper adaptation over touching call sites.
  - Preserve Maia classes/tokens and avoid broad Radix/Base rewrites in one pass.
  - Follow Next.js 16 server/client boundary guidance from `.next-docs`.
- Evidence sources used:
  - `apps/{admin,donor,missionary}/package.json`
  - `packages/ui/components/shadcn/{drawer,dialog,sheet,select,tooltip,command}.tsx`
  - `packages/ui/styles/globals.css`
  - `apps/*/app/layout.tsx`
  - Base UI release docs / live docs for v1.3.0 Drawer stability, SwipeArea, Tooltip `closeOnClick`, Select/Combobox/Slider labels, and overlay setup guidance
- Notes:
  - Repo-scoped NIA search remains useful for external docs, but current branch source-of-truth is local `rg` + direct file reads because the indexed repo snapshot lagged behind local branch content for this migration.

## 2026-03-12

- Date: 2026-03-12
- Repo: Asymmetric-al/core
- Goal: Finish PR #73 merge blockers by tenant-scoping donation saga claims/idempotency, locking new write RPCs to service-role execution, stabilizing virtualization pilots, and tightening Stripe fallback semantics.
- Primary area: `packages/api/src/donate/{index,outbox,saga}.ts`, `packages/api/src/donations/index.ts`, `supabase/migrations/{20260223170000_atomic_rpc_and_donation_saga,20260226100000_atomic_mutation_rpcs_and_donation_saga}.sql`, `apps/{donor,missionary}/app/*`, `tests/unit/*`
- Constraints:
  - Keep business logic in `packages/api/src/*`; route handlers stay thin re-exports where applicable.
  - Follow Next.js 16 route handler and client-component rules from `.next-docs`.
  - Preserve current public HTTP shapes while fixing tenant isolation and SQL authz.
  - Keep virtualization stable for the lifetime of the mounted pilot screens.
- Evidence sources used:
  - `packages/api/src/donate/{index,outbox,saga}.ts`
  - `packages/api/src/donations/index.ts`
  - `supabase/migrations/{20260223170000_atomic_rpc_and_donation_saga,20260226100000_atomic_mutation_rpcs_and_donation_saga}.sql`
  - `apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx`
  - `apps/missionary/app/donors/page.tsx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/route.mdx`
  - `.next-docs/01-app/01-getting-started/05-server-and-client-components.mdx`
- Notes:
  - `AGENTS.md` requires Nia for repo-scoped search, but Nia tools are unavailable in this session; using `rg`, direct file reads, and targeted tests as fallback.

## 2026-02-26 (PR #78 merge prep)

- Date: 2026-02-26
- Goal: Resolve merge conflicts with epic for Supabase login foundation PR.

## 2026-02-23 (resend future readiness hardening)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Keep Resend foundation simple, replay-safe, and easier to extend with minimal churn.
- Primary area: `packages/api/src/email/webhooks/resend.ts`, `tests/unit/packages/api/email/webhooks-resend.test.ts`, `turbo.json`, `docs/guides/features/resend-integration.md`
- Decisions in this pass:
  - Missing provider event ids now use deterministic synthetic ids for `email_events` upsert idempotency.
  - Outbound send-log tenant ambiguity remains fail-closed (`422`) with deterministic candidate ordering.
  - Inbound body and attachment retrieval now tolerate partial upstream failure and continue metadata persistence.
  - Turborepo build env hashing now includes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY`.
- Deferred follow-up:
  - Add operational telemetry for tenant resolution failures and partial inbound retrieval failures.
  - Add admin operational dashboards for Resend event/suppression/inbound monitoring.
- File map for next iteration:
  - Webhook behavior: `packages/api/src/email/webhooks/resend.ts`
  - Resend SDK wrappers: `packages/email/resend.ts`
  - Tenant settings persistence/encryption: `packages/api/src/email/{connect,settings-store,crypto}.ts`
  - Schema/types: `supabase/schema.sql`, `packages/database/types/database.ts`
  - UI/API route entry points: `apps/admin/app/{api/email/settings/integrations/resend}/*`

## 2026-02-23 (resend webhook final pass)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Final hardening pass for webhook tenant resolution plus ops rollout documentation (key rotation + replay handling).
- Primary area: `packages/api/src/email/webhooks/resend.ts`, `tests/unit/packages/api/email/webhooks-resend.test.ts`, `docs/guides/features/resend-integration.md`
- Constraints:
  - Use hybrid strictness: reject unresolved outbound events and accept unresolved inbound events with warnings.
  - Keep inbound ingestion resilient when tenant resolution is unavailable.
  - Document operational runbooks without changing schema or introducing new infra.
- Evidence sources used:
  - `packages/api/src/email/webhooks/resend.ts`
  - `tests/unit/packages/api/email/webhooks-resend.test.ts`
  - `docs/guides/features/resend-integration.md`
  - `packages/api/src/email/crypto.ts`
  - `supabase/schema.sql`

## 2026-02-23 (resend hardening foundation)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Strictly remove legacy SendGrid path and complete production-ready Resend foundation (service/API/schema/ingestion/UI/tests/docs).
- Primary area: `packages/email/*`, `packages/api/src/email/*`, `apps/admin/app/{api/email,settings/integrations/resend}/*`, `supabase/{schema.sql,migrations/*}`, `packages/database/types/*`, `tests/unit/packages/{email,api/email}/*`, `.cursor/.agents skill docs`
- Constraints:
  - Remove all `sendgrid`/`SENDGRID_` references across tracked repo content.
  - Keep admin integration state server-driven via persisted tenant settings.
  - Verify webhook signatures before processing and persist event/suppression/inbound foundations.
  - Keep API key material server-side; persist encrypted tenant API keys only.
- Evidence sources used:
  - `packages/email/{resend.ts,types.ts,constants.ts}`
  - `packages/api/src/email/{connect,test-send,webhooks/resend,settings-store,crypto}.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `supabase/{schema.sql,migrations/20260223120000_resend_email_foundation.sql}`
  - `packages/database/types/{database,index}.ts`
  - `tests/unit/packages/{email,resend,api/email}/*.test.ts`

## 2026-02-23

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Complete SendGrid -> Resend migration by removing remaining SendGrid references from active docs/configs and documenting Resend environment variables.
- Primary area: `docs/guides/features/*`, `docs/README.md`, `docs/guides/architecture/overview.md`, `docs/ai/stack-registry.md`, `packages/email/README.md`, `packages/README.md`, `.env.example`, `supabase/config.toml`
- Constraints:
  - Keep docs internally consistent with the migrated package surface in `packages/email`.
  - Remove the legacy `/settings/integrations/sendgrid` route and keep only `/settings/integrations/resend`.
  - Remove active SendGrid references from repo docs and config comments.
- Evidence sources used:
  - `docs/guides/features/email-studio.md`
  - `docs/guides/features/pdf-studio.md`
  - `docs/guides/architecture/overview.md`
  - `docs/README.md`
  - `packages/email/README.md`
  - `docs/ai/stack-registry.md`
  - `.env.example`
  - `supabase/config.toml`

## 2026-02-23 (prior)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Pragmatic hardening pass for admin read-model wiring (authz boundaries, tenant contribution scope, explicit error states, and settled-only KPI semantics).
- Primary area: `apps/admin/app/{page,contributions/page}.tsx`, `apps/admin/lib/admin-access.ts`, `packages/api/src/reads/{dashboard-stats,tenant-contributions}.ts`, `tests/unit/{apps/admin,packages/api/reads}/*`
- Constraints:
  - Keep changes small and reversible; no new infra/framework.
  - Preserve server-component data loading with explicit role guards before service-role reads.
  - Keep contributions tenant-scoped by default; optional donor filter via query string.
  - Remove silent catch-to-empty paths and expose load failures in UI.
- Evidence sources used:
  - `packages/auth/context.ts`
  - `packages/database/types/database.ts`
  - `supabase/migrations/20250101000000_init_schema.sql`
  - `supabase/seed.sql`
  - `apps/admin/app/contributions/{page,types,columns}.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history}.ts`

## 2026-02-23 (prior)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Implement ticket 2.2.7 by creating typed read-model modules and wiring them into admin dashboard/contributions with Next.js Cache Components patterns.
- Primary area: `packages/api/src/reads/*`, `apps/admin/app/page.tsx`, `apps/admin/app/contributions/*`, `tests/unit/packages/api/reads/*`, `packages/api/package.json`
- Constraints:
  - Keep changes additive and non-breaking for existing admin UI.
  - Use `'use cache'` + `cacheTag` + explicit `cacheLife` in read-model functions.
  - Keep DB access tenant-scoped and fail fast on admin client unavailability.
  - Preserve existing client interactivity by using server-wrapper + client-component split where required.
- Evidence sources used:
  - `supabase/schema.sql`
  - `packages/database/supabase/admin.ts`
  - `packages/auth/context.ts`
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `tests/unit/packages/api/*`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
- Notes:
  - No dedicated admin missionary detail route under `apps/admin/app/missionaries/[id]/page.tsx`; missionary read-model module is exported and ready for future wiring.
  - Existing read-model proposal referenced `funds.status = 'active'`; current schema uses `funds.is_active` and implementation follows schema.

## 2026-02-23 (TanStack hardening)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Complete DB-transaction-level atomicity for multi-step backend writes and Stripe donation cross-system consistency using saga/outbox orchestration.
- Primary area: `supabase/migrations/*atomic*`, `packages/api/src/posts/*`, `packages/api/src/admin/comments/comment.ts`, `packages/api/src/donate/*`, `packages/graphql/handler.ts`, `supabase/schema.sql`, `supabase/migrations/20250101000000_init_schema.sql`, `tests/unit/*`
- Current subtask: Execute Atomicity Gap Remediation plan (donation bypass cutover, strict idempotency contract, outbox claim batching, and docs/tests alignment).
- Constraints:
  - Keep migrations additive and backwards compatible with already-cutover `atomic_*` RPC names.
  - Keep audit writes transactional with core DB mutations where applicable.
  - Preserve idempotency and retry safety for Stripe cross-system operations.
  - Follow Next.js 16 route-handler constraints for API handlers.
  - No secrets in code/docs.

## 2026-03-10

- Date: 2026-03-10
- Repo: Asymmetric-al/core
- Goal: Reconcile PR #68 with current `epic`, keep donor-specific contributions, share settled-status KPI handling, and resolve merge conflicts for admin merge.
- Primary area: `apps/admin/app/{page,contributions/page}.tsx`, `apps/admin/app/contributions/contributions-client.tsx`, `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx`, `packages/api/src/reads/*`, `tests/unit/{apps/admin/app,packages/api/reads}/*`
- Constraints:
  - Keep `/contributions` donor-specific and validate `donorId` against the signed-in donor profile.
  - Preserve the existing dashboard shell when KPI stats fail to load.
  - Keep explicit contribution load failures visible in the UI.
  - Use one shared settled-status source for dashboard and missionary metrics.
  - Leave the tenant-wide contributions implementation out of this PR.
- Evidence sources used:
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `apps/admin/app/contributions/contributions-client.tsx`
  - `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history,missionary-metrics}.ts`
  - `tests/unit/packages/api/reads/*`
  - `tests/unit/apps/admin/app/*`
  - `.next-docs/01-app/01-getting-started/{03-layouts-and-pages,06-cache-components,10-error-handling}.mdx`
- Notes:
  - Nia repo-scoped search workflow is required by `AGENTS.md`, but Nia tools are not available in this session; using `rg`, `git grep`, and direct file reads as fallback.
  - PR #68 required conflict resolution against `epic` before merge.

## 2026-03-09

- Date: 2026-03-09
- Repo: Asymmetric-al/core
- Goal: Finish PR #67 for merge by keeping the new donor-specific contributions direction, adding safe dashboard KPI fallback behavior, moving donor lookup into `packages/api/src/reads`, and removing the Greptile informer workflow.
- Primary area: `packages/api/src/reads/*`, `apps/admin/app/page.tsx`, `apps/admin/app/contributions/page.tsx`, `tests/unit/packages/api/reads/*`, `tests/unit/apps/admin/app/*`, `.github/workflows/greptile-informer.yml`
- Constraints:
  - Keep `/contributions` donor-specific for this PR.
  - Preserve the existing dashboard shell when KPI stats fail to load.
  - Keep current placeholder contribution labels and visible bulk-action stubs.
  - Move page-level admin-client access into `packages/api/src/reads`.
- Evidence sources used:
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `apps/admin/app/contributions/contributions-client.tsx`
  - `apps/admin/app/mc-shell.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history,missionary-metrics}.ts`
  - `tests/unit/packages/api/reads/*`
  - `docs/guides/architecture/db-client-usage-matrix.md`
  - `.next-docs/01-app/01-getting-started/10-error-handling.mdx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/error.mdx`
- Notes:
  - Nia repo-scoped search workflow is required by `AGENTS.md`, but Nia tools are not available in this session; using `rg`, `git grep`, and direct file reads as fallback.
  - PR #67 is currently merge-conflicting with `epic`, so code fixes and rebase readiness need to be evaluated separately.

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Implement ticket 2.2.7 by creating typed read-model modules and wiring them into admin dashboard/contributions with Next.js Cache Components patterns.
- Primary area: `packages/api/src/reads/*`, `apps/admin/app/page.tsx`, `apps/admin/app/contributions/*`, `tests/unit/packages/api/reads/*`, `packages/api/package.json`
- Constraints:
  - Keep changes additive and non-breaking for existing admin UI.
  - Use `'use cache'` + `cacheTag` + explicit `cacheLife` in read-model functions.
  - Keep DB access tenant-scoped and fail fast on admin client unavailability.
  - Preserve existing client interactivity by using server-wrapper + client-component split where required.
- Evidence sources used:
  - Local source-of-truth in `packages/api`, `packages/graphql`, and `supabase/migrations`
  - Existing atomic RPC migration (`20260223170000_atomic_rpc_and_donation_saga.sql`) for stable naming and contracts
  - `.next-docs` route-handler and error-handling docs for Next.js 16 API compatibility
- Tooling note:
  - Nia MCP is not available in this session registry; repo-local evidence + direct file reads are used.

## Latest update: atomicity + donation saga completion pass

- Date: 2026-02-23
- Goal: Land transactional write guarantees for reaction/comment/admin-delete/post/profile/role/donation flows and wire Stripe donation saga/outbox processing.
- Scope:
  - `supabase/migrations/20260226100000_atomic_mutation_rpcs_and_donation_saga.sql`
  - `packages/api/src/donate/index.ts`
  - `packages/api/src/donate/saga.ts`
  - `packages/api/src/donate/outbox.ts`
  - `apps/donor/app/api/donate/outbox/route.ts`
  - `packages/api/src/admin/comments/comment.ts`
  - `supabase/schema.sql`
  - `supabase/migrations/20250101000000_init_schema.sql`
  - `tests/unit/donation-saga.test.ts`
- Decision:
  - Kept existing `atomic_*` RPC names stable and layered hardening in a follow-up migration.
  - Added transactional admin comment-delete audit payload enrichment.
  - Implemented Stripe orchestration around existing saga RPCs with idempotency, lock-claiming, retry/dead-letter recording, and best-effort Stripe compensation.
  - Added dedicated admin/staff outbox processing route for scheduled replay.
  - Added schema parity helper `decrement_post_comment_count` to canonical schema files.
- Verification executed:
  - `bunx turbo run lint --filter=@asym/api --filter=@asym/graphql --filter=@asym/database --filter=@asym/lib`
  - `bunx turbo run typecheck --filter=@asym/api --filter=@asym/graphql --filter=@asym/database --filter=@asym/lib`
  - `bunx vitest run tests/unit/reaction-route-utils.test.ts tests/unit/donation-saga.test.ts tests/unit/reaction-idempotency.test.ts tests/unit/post-interactions.test.ts`

## Latest update: atomicity gap remediation pass

- Date: 2026-02-23
- Goal: Eliminate remaining donation atomicity bypass paths and harden outbox idempotency/claim behavior.
- Scope:
  - `packages/api/src/donate/index.ts`
  - `packages/api/src/donate/idempotency.ts`
  - `packages/api/src/donate/saga.ts`
  - `packages/api/src/donations/index.ts`
  - `packages/graphql/handler.ts`
  - `tests/unit/donation-saga.test.ts`
  - `docs/guides/operations/donation-saga-outbox.md`
- Decision:
  - Cut over REST and GraphQL donation create paths to `begin_donation_saga` (remove direct `atomic_create_donation_with_audit` bypasses).
  - Enforce required idempotency headers at API boundaries (`idempotency-key` or `x-idempotency-key`).
  - Add Stripe customer idempotency keying (`<idempotencyKey>:customer`) to prevent duplicate customer records on retries.
  - Batch-claim due outbox rows through `claim_due_donation_saga_events` for concurrency-safe worker processing.

## Latest update: user-flag cache split

- Date: 2026-02-23
- Goal: Remove authenticated read waterfalls for post reactions while keeping API/GraphQL response shapes stable.
- Scope:
  - `packages/api/src/posts/index.ts`
  - `packages/graphql/handler.ts`
  - `packages/database/supabase/post-interactions.ts`
  - `supabase/migrations/20260223120000_add_user_post_interactions_rpc.sql`
  - `tests/unit/post-interactions.test.ts`
- Decision:
  - Keep shared cached post list (`use cache`) for tenant feed content.
  - Fetch user interaction flags via a single RPC (`get_user_post_interactions`) instead of per-table follow-up queries.
  - Reuse one typed helper across API and GraphQL to avoid drift.
- Constraints respected:
  - Next.js 16 cache boundaries (runtime auth values passed as arguments to cached functions).
  - Tenant/user auth boundaries preserved from existing post selection flow.
  - No schema/API contract change for existing feed consumers.
- Evidence sources used:
  - Local code evidence in `packages/api` and `packages/graphql`
  - Nia doc lookup for Next.js cache guidance (`use cache`, `use cache: private`, `use cache: remote`)
  - `.next-docs` references for cache key and runtime-data constraints

## Latest update: post cache coherence hardening

- Date: 2026-02-23
- Goal: Align post read/write caching with modern Next.js guidance and eliminate stale-read risks between REST and GraphQL mutation paths.
- Scope:
  - `packages/api/src/posts/index.ts`
  - `packages/api/src/posts/like.ts`
  - `packages/api/src/posts/prayer.ts`
  - `packages/api/src/posts/fire.ts`
  - `packages/api/src/posts/post.ts`
  - `packages/api/src/shared/cache-tags.ts`
  - `packages/graphql/handler.ts`
  - `packages/lib/posts/reaction-idempotency.ts`
  - `tests/unit/reaction-idempotency.test.ts`
  - `tests/unit/post-interactions.test.ts`
- Decision:
  - Removed user-specific server caching in feed interaction reads (live single RPC per request for user flags).
  - Standardized invalidation to tenant + post tags as primary dimensions.
  - Added GraphQL mutation invalidation parity and idempotent reaction counter guards.
  - Centralized duplicate/remove guard logic in shared `@asym/lib` helper.
- Constraints respected:
  - Shared feed cache remains tenant-scoped and reusable.
  - User-specific reaction flags stay fresh without high-cardinality cache keys.
  - Repeated like/unlike/pray/unpray actions no longer risk counter drift.
- Verification executed:
  - `bunx turbo run lint --filter=@asym/api --filter=@asym/graphql --filter=@asym/database --filter=@asym/lib`
  - `bunx turbo run typecheck --filter=@asym/api --filter=@asym/graphql --filter=@asym/database --filter=@asym/lib`
  - `bunx vitest run tests/unit/post-interactions.test.ts tests/unit/reaction-idempotency.test.ts`

## Latest update: reaction route hardening + full smoke

- Date: 2026-02-25
- Goal: Harden reaction mutation paths against partial-failure counter drift, enforce route param validation, and run full smoke validation.
- Scope:
  - `packages/api/src/posts/reaction-route-utils.ts`
  - `packages/api/src/schemas/posts.ts`
  - `packages/api/src/posts/like.ts`
  - `packages/api/src/posts/prayer.ts`
  - `packages/api/src/posts/fire.ts`
  - `packages/api/src/posts/post.ts`
  - `packages/graphql/handler.ts`
  - `packages/api/src/missionaries/metrics.ts`
  - `apps/missionary/app/donors/page.tsx`
  - `apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx`
  - `tests/unit/reaction-route-utils.test.ts`
- Decision:
  - Standardized REST reaction context resolution with shared helper (`postId` UUID validation + auth + tenant lookup).
  - Added compensating write behavior for reaction count RPC failures:
    - POST paths roll back inserted reaction rows when counter increment fails.
    - DELETE paths restore removed reaction rows when counter decrement fails.
  - Applied the same compensating pattern to GraphQL like/prayer mutation resolvers for parity.
  - Preserved cookie propagation on unexpected missionary metrics failures by returning `jsonWithCookies` in the catch path.
  - Reduced animation overhead in virtualized donor list rendering by using static row wrappers in virtualized mode.
- Verification executed:
  - `bun run lint`
  - `bun run typecheck`
  - `bun run test:unit`
  - `bun run build` (requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; validated with temporary local placeholder env values in-session)
  - `bun run test:e2e` (16 passed, 24 skipped in this environment)

## 2026-02-22

- Date: 2026-02-22
- Date: 2026-02-22
- Repo: Asymmetric-al/core
- Goal: Ship a shared Supabase sign-in foundation across `admin`, `missionary`, and `donor` with demo-only + full-login modes, SSR cookie continuity, and role-safe redirects.
- Primary area:
  - `packages/auth/*`
  - `packages/api/src/auth/*`
  - `packages/ui/components/auth/*`
  - `packages/database/supabase/*`
  - `apps/{admin,missionary,donor}/app/(auth)/login/page.tsx`
  - `apps/{admin,missionary,donor}/proxy.ts`
  - `docs/auth/sign-in.md`
- Constraints:
  - Demo credentials stay server-side.
  - No Radix-based auth UI usage.
  - Use modern Supabase SSR + Next.js proxy patterns.
  - Preserve production safety (`ALLOW_DEMO_ACCOUNTS`).
- Evidence sources used:
  - Existing app login pages and proxy files in all three apps
  - `packages/api/src/auth/demo-account.ts`
  - `packages/auth/middleware.ts` and `packages/auth/context.ts`
  - Next.js docs from `.next-docs` (`proxy`, `authentication`)
  - `scripts/supabase-cli.mjs` and root script updates from `epic`
- Tooling note:
  - Nia MCP unavailable in this runtime; fallback used repo-scoped file reads + `rg`.

## Follow-up hardening execution notes (2026-02-27)

- Completed remaining auth hardening phases:
  - donor authenticated `/login` redirect behavior fixed (proxy auth-route redirect removed; page/client redirect path used).
  - explicit sign-out made SSR-safe with shared `/api/auth/signout` route and cookie-clearing server sign-out.
  - shared registration screen in `@asym/ui` used across apps with donor-only self-registration and admin/missionary invite-only UI.
  - permanent auth E2E specs added for session guards, registration policy, and permissions.
- Verified with:
  - full lint/typecheck/unit (`bun run check`) pass
  - Playwright auth suite runs across donor/admin/missionary (session guards + registration + permission matrix).

## Best-practice hardening follow-up (2026-02-27)

- Removed client-supplied role from public registration payload in shared `RegisterScreen`.
- Added DB role hardening migration:
  - `supabase/migrations/20260227060000_auth_role_hardening.sql`
  - enforces allowlisted `profiles.role` values
  - sets `profiles.role` non-null + default donor
  - updates `handle_new_user` to assign `donor` for self-registration.
- Synced canonical schema and init migration to same role constraints and trigger behavior.
- Hardened sign-out route:
  - same-origin validation via `Origin`/`Referer`
  - explicit `Cache-Control: no-store`
  - added unit coverage in `tests/unit/auth/signout-handler.test.ts`.
- Stabilized auth e2e sign-out targeting with `data-testid=\"auth-signout\"` controls.

## Docs/test handoff pass (2026-02-27)

- Added developer handoff guide:
  - `docs/auth/hardening-handoff.md`
  - includes current wiring, completed work, and explicit backlog mapping for priorities 1–5.
- Added migration artifact regression tests:
  - `tests/unit/auth/role-hardening-migration.test.ts`
  - guards role-check constraint and donor-enforced trigger behavior.
- Updated auth-related e2e selectors/defaults for compatibility with current UI:
  - `tests/e2e/accessibility.spec.ts`
  - `tests/e2e/auth-registration-policy.spec.ts`
- Validation rerun complete:
  - `bun run test:e2e` passes (24 passed, 34 skipped)
  - cross-dashboard auth smoke/matrix runs pass
  - `bun run format:check`, `bun run check`, and `bun run build` pass.

## Review follow-up pass (2026-02-27)

- Addressed sign-out error handling review note:
  - added shared client helper `packages/auth/client-signout.ts`
  - callers now log server sign-out failures and show a user warning before continuing client cleanup.
- Exposed helper as `@asym/auth/client-signout` and adopted in:
  - `packages/auth/use-auth.ts`
  - `packages/lib/hooks/use-auth.ts`
  - `packages/lib/mission-control/context.tsx`
  - donor and missionary sign-out UI components.
- Removed duplicate auth source-of-truth risk in legacy DB proxy:
  - simplified `packages/database/supabase/proxy.ts` to cookie refresh only
  - documented auth-guard ownership in `@asym/auth/middleware`.
- Refined sign-out origin policy for reliability:
  - `packages/api/src/auth/signout.ts` now treats missing `Origin`/`Referer` as allowable fallback while still rejecting explicit cross-origin requests.
  - updated tests in `tests/unit/auth/signout-handler.test.ts`.
- Re-validated:
  - scoped lint/typecheck for touched packages/apps
  - `bun run test:unit`
  - Playwright session guard spec for donor/admin/missionary.

## 2026-04-11 (TanStack DB + Virtual latest-version upgrade planning)

- Date: 2026-04-11
- Repo: Asymmetric-al/core
- Goal: Verify the latest TanStack DB/Virtual/CLI versions and produce a concrete, repo-specific full-upgrade plan.
- Primary area:
  - `packages/database/package.json`
  - `packages/ui/package.json`
  - `docs/guides/development/tanstack-{integration,virtual-foundation,surface-inventory}.md`
- Constraints:
  - Nia MCP is unavailable in this session, so use repo-scoped `rg` and package registry checks (`npm view`) as evidence.
  - Treat official TanStack docs and npm package registry as the version truth for planning.
  - Produce phased rollout guidance with verification checkpoints and rollback guardrails.
- Evidence sources used:
  - `docs/ai/stack-registry.md`
  - `docs/ai/working-set.md`
  - `package.json` files under `packages/database` and `packages/ui`
  - `npm view @tanstack/* version` checks (DB, react-db, query-db-collection, react-virtual, virtual-core, CLI)
  - TanStack docs pages under `https://tanstack.com/db/latest` and `https://tanstack.com/virtual/latest`
- Notes:
  - Current repo already sits on the TanStack DB `0.6.x` line; target is patch alignment and coordinated Virtual/CLI bumps.

## 2026-04-11 (TanStack DB/Virtual upgrade implementation)

- Date: 2026-04-11
- Repo: Asymmetric-al/core
- Goal: Execute the TanStack DB + Virtual upgrade plan end-to-end, including dependency bumps, docs refresh, and verification.
- Primary area:
  - `package.json` (root)
  - `packages/database/package.json`
  - `packages/ui/package.json`
  - `docs/guides/development/tanstack-integration.md`
  - `docs/guides/development/tanstack-virtual-foundation.md`
- Constraints:
  - Nia MCP remains unavailable in-session; use repo-scoped file search and primary-source package/doc checks.
  - Verify latest package versions from npm dist-tags before editing.
  - Run at least scoped lint + typecheck + unit coverage to validate upgrade safety.
- Evidence sources used:
  - `npm view @tanstack/{db,react-db,query-db-collection,react-virtual,virtual-core,cli} version dist-tags`
  - `https://tanstack.com/db/latest`
  - `https://tanstack.com/virtual/latest`
  - `rg` scans for TanStack usage in `packages/database` and `packages/ui`
- Notes:
  - `tanstack search-docs` currently fails in this environment (`fetch failed`), so docs verification uses direct official URLs + npm registry checks.

## 2026-05-16 (Production deployment discipline automation)

- Date: 2026-05-16
- Repo: Asymmetric-al/core
- Goal: Implement hard-gated production deployment discipline for Vercel spend containment.
- Primary area:
  - `scripts/verify/*`
  - `scripts/git/*`
  - `scripts/release/*`
  - `apps/*/vercel.json`
  - `.husky/pre-push`
  - `docs/ops/*`
- Constraints:
  - Preserve `epic` as the production branch; another Codex session owns default-branch migration state.
  - Keep `docs/ops/environments.md` pre-existing development webhook edits intact.
  - Prefer source-controlled gates, local release command, GitHub branch protection, and Vercel project settings over operator memory.
  - Nia MCP is unavailable in-session; use repo-scoped `rg`, direct file reads, GitHub CLI, and Vercel CLI/API.
- Stack:
  - GitHub Actions
  - Vercel
  - Turborepo
  - Bun
  - Node.js
  - Vitest
- Notes:
  - Current GitHub default branch is already `epic`.
  - Existing `ci:preflight`, `verify:git-attribution`, Vercel production readiness, and ignored-build helper should be reused instead of duplicated.
