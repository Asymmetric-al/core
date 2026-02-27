# Working Set

## 2026-02-23

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
