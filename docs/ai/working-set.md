# Working Set

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
