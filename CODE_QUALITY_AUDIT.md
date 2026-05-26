# Code Quality Audit — Asymmetric.al monorepo (`Asymmetric-al/core`)

**Branch audited:** `develop` (read-only inspection; no application code changed)  
**Audit date:** 2026-05-22  
**Snapshot commit:** `02105e43` on `develop` (line counts and greps are valid as of this SHA)  
**Package manager / task runner:** Bun `1.3.4`, Turborepo (`turbo.json`, `envMode: "loose"`)  
**Next.js:** `16.2.6` with `cacheComponents: true` in all three apps (`apps/admin`, `apps/donor`, `apps/missionary`)

This document is a **claims-backed** maintainability and repo-health audit. Every material finding below was checked against files and commands in this repository. Items that could not be verified are called out explicitly.

> **Snapshot only — does not fix CI.** Merging this file does not change runtime code or repair `bun run check`. Follow-up **code** PRs are still required for the Payload CMS unit-test timeouts documented below.

---

## Executive Summary

The monorepo is **structurally sound at the boundaries**: lint and typecheck pass across workspaces, Prettier is clean, the documented data-access boundary check passes, and Cache Components are enabled with `'use cache'` reads in `packages/api` that do **not** call `cookies()` or `headers()` inside cached read modules.

The **primary release gate failure** observed in this environment is **unit test reliability** in **Payload CMS admin auth** (not donor/missionary app login shells): seven tests in `tests/unit/cms/supabase-strategy.test.ts` hit Vitest’s default **5000ms** timeout when exercising `createSupabaseAuthStrategy().authenticate()` with `sb-access-token` cookie paths. That blocks `bun run test:unit:cms` and therefore `bun run check` (which runs the full unit suite).

Secondary maintainability risks are **concentrated size and duplication**, not mystery architecture:

- **15** first-party `.ts`/`.tsx` files under `apps/` and `packages/` are **≥1000 lines** at snapshot `02105e43` (76 files ≥500 lines).
- **Triplicated demo mock data** across `apps/{admin,donor,missionary}/lib/mock-data/` (5 files × 3 apps; `users.ts` is **935 lines** and **byte-identical** across apps).
- **Documented `any` query-builder aliases** in admin CRM/contribution services with explicit TODOs.

**Not treated as product defects:** `bun run ci:preflight` failures caused by git contributor identity on ephemeral VMs (documented below).

**Overall posture:** Strong tooling and boundary discipline; fix CMS auth unit-test hangs/timeouts first, then chip away at file decomposition and shared mock packages.

---

## Audit Scope

### In scope

| Area                   | Paths / notes                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Apps                   | `apps/admin`, `apps/donor`, `apps/missionary`                                                                                   |
| Shared packages        | `packages/api`, `packages/database`, `packages/ui`, `packages/email`, etc.                                                      |
| Unit tests             | `tests/unit/**`, especially `tests/unit/cms/`                                                                                   |
| Scripts / verification | `scripts/verify/*`, root `package.json` scripts                                                                                 |
| Architecture docs      | `docs/guides/architecture/data-access-boundary.md`                                                                              |
| Cache Components       | `'use cache'` in `packages/api/src/reads/*`, `packages/api/src/posts/index.ts`; `cacheComponents: true` in app `next.config.ts` |

### Out of scope (unless incorrectly depended on)

- `node_modules/`, `.next/`, `.turbo/`, `dist/`, `coverage/`
- `vendor/payload-upstream/` (upstream vendor tree; not first-party product code)
- Skill mirrors under `.cursor/skills/`, `.agents/skills/` (agent docs, not runtime)
- Full manual review of every line in 76 files ≥500 lines (line counts only, plus spot checks)

### Severity definitions (used consistently)

| Priority | Meaning                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------ |
| **P0**   | Correctness, security, data loss, or **CI/check gate failure** (e.g. unit tests cannot complete) |
| **P1**   | Major maintainability, ownership, or architecture cost; high regression risk                     |
| **P2**   | Important cleanup that reduces future bugs or speeds refactors                                   |
| **P3**   | Lower-risk cleanup, optional improvements, or environment-only blockers                          |

---

## Commands Run

All commands run from repository root `/workspace` on `develop` unless noted.

| Command                                                    | Result        | Notes                                                                                  |
| ---------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `bun run verify:data-boundary`                             | **Pass**      | `scripts/verify/data-boundary-check.mjs`                                               |
| `bun run format:check`                                     | **Pass**      | Prettier                                                                               |
| `bunx turbo run lint typecheck --force`                    | **Pass**      | 26 tasks successful (~56s); re-run during false-positive verification pass             |
| `bunx vitest run tests/unit/cms/supabase-strategy.test.ts` | **Fail**      | 7 failed, 4 passed, ~35s; all failures = `Test timed out in 5000ms` (re-run confirmed) |
| `bun run test:unit:cms`                                    | **Fail**      | Same failure surface as isolated file run                                              |
| `find apps packages … \| awk '$1>=1000'`                   | **15 files**  | Line counts via `wc -l` @ `02105e43`                                                   |
| `diff -q apps/*/lib/mock-data/users.ts`                    | **Identical** | admin vs donor vs missionary                                                           |

### Not run in this pass (limitations)

| Command                                  | Why skipped / caveat                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `bun run test:unit` (full suite)         | Known CMS failures; would not change P0 conclusion                                           |
| `bun run build` / `bun run build:strict` | Not verified in this audit pass — run before release if needed                               |
| `bun run ci:preflight`                   | Fails on cloud VMs without configured git identity — **environment**, not code (see Tooling) |
| `bun run test:perf`                      | Playwright perf; out of scope unless perf work                                               |

---

## Highest Priority Fixes

| Priority | Issue                                                      | Location                                                                                    | Validation after fix                                                                                         |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **P0**   | CMS Supabase auth strategy unit tests timeout (7/11)       | `tests/unit/cms/supabase-strategy.test.ts` → `apps/admin/src/cms/auth/supabase-strategy.ts` | `bunx vitest run tests/unit/cms/supabase-strategy.test.ts` then `bun run test:unit:cms` then `bun run check` |
| **P1**   | Mega page/hook modules (≥1000 lines)                       | See [Large Files](#large-files-over-1000-lines)                                             | Targeted tests + manual smoke per app area                                                                   |
| **P1**   | Triplicated `lib/mock-data` across apps                    | `apps/*/lib/mock-data/*`                                                                    | `diff` stays empty across apps for shared files                                                              |
| **P2**   | PostgREST query builders typed as `any`                    | `packages/api/src/admin/crm/service.ts`, `packages/api/src/admin/contributions/service.ts`  | `bunx turbo run typecheck --filter=@asym/api`                                                                |
| **P2**   | Optional: adopt `updateTag` where read-your-writes matters | Mutations in `packages/api` (today: `revalidateTag` only)                                   | Product-specific mutation tests / manual CMS flows                                                           |

---

## Structural Problems

### P0 — CMS auth unit tests hang until Vitest timeout

**Location**

- Test: `tests/unit/cms/supabase-strategy.test.ts` (528 lines)
- Implementation under test: `apps/admin/src/cms/auth/supabase-strategy.ts` (454 lines; loaded in `beforeAll` via dynamic import)

**Problem**

Seven tests that call `strategy.authenticate()` with a `sb-access-token=test` cookie (full Supabase-session path, not E2E bypass) **do not complete within 5000ms**. Vitest reports `Test timed out in 5000ms` (not assertion failures).

**Evidence**

- `bunx vitest run tests/unit/cms/supabase-strategy.test.ts` → **7 failed | 4 passed** (11 total), duration ~35s (consistent with 7 × 5s timeouts).
- **Passing** tests in the same file (fast, `<100ms` class):
  - `returns null when Supabase env is missing`
  - `authenticates admin E2E bypass cookies through normal Payload users`
  - `rejects donor E2E bypass cookies for the Payload admin surface`
  - `uses a trusted data client for tenant lookup after cookie auth`
- **Timing out** tests (all use `cookie: "sb-access-token=test"` and Payload mock flows):
  - `creates a CMS user against the mirrored Payload tenant`
  - `skips write operations when the existing user is already in sync`
  - `updates the CMS user when Supabase profile data changes tenant`
  - `rejects non-staff profile roles`
  - `accepts active staff membership even when profile role is donor`
  - `accepts admin profile roles without giving them CRM ownership`
  - `accepts tenantless super admins using the default tenant context`

**Why it matters**

- `package.json` defines `"check": "bun run lint && bun run typecheck && bun run test:unit"`.
- CMS regressions are not caught reliably in CI/local `check` until these tests finish quickly and deterministically.
- Timeouts often indicate **unresolved promises**, blocking I/O, or missing mocks — not flaky assertions.
- **Observed test gap (snapshot `02105e43`):** the seven failing tests mock `createSupabaseClient` only. Production code also calls `createSupabaseDataClient()` (defaulting to `createTrustedSupabaseDataClient()` when `SUPABASE_SERVICE_ROLE_KEY` is set). The one **passing** cookie-auth test injects **both** clients. Incomplete data-client mocks can leave real Supabase I/O pending until Vitest’s 5s timeout.

**Best fix (incremental, test-first)**

1. **RED:** Add a failing test with a **test-only timeout** and logging boundary (or run one test under `vitest --inspect`) to locate the await that never settles.
2. **GREEN (minimal):** Prefer fixing **test doubles** first — ensure failing tests inject mocked `createSupabaseDataClient` (same pattern as the passing trusted-data-client test) and complete Supabase/Payload mock chains in `createSupabaseClientMock` / `createPayloadMock` before changing production auth.
3. If production code awaits real network without guards, add explicit dependency injection (already partially supported via `createSupabaseClient` in strategy factory) and mock at the boundary.
4. Consider `vi.useFakeTimers()` only if timers are proven involved — avoid masking real hangs.

**Risk**

- Changing production auth without tests risks CMS login/tenant mapping regressions; keep changes behind existing E2E and CMS e2e suites when touching `supabase-strategy.ts`.

**Validation**

```bash
bunx vitest run tests/unit/cms/supabase-strategy.test.ts
bun run test:unit:cms
bun run check
```

---

### P1 — Concentrated UI orchestration in single modules

**Location (examples)**

| File                                                   | Lines (`wc -l` @ `02105e43`) | Role                           |
| ------------------------------------------------------ | ---------------------------- | ------------------------------ |
| `apps/missionary/app/donors/use-donors-page-view.tsx`  | 2738                         | Hook orchestrating donors page |
| `apps/missionary/app/feed/worker-feed-page-client.tsx` | 2002                         | Client feed surface            |
| `apps/admin/app/pdf/page-client.tsx`                   | 1860                         | Admin PDF UI                   |
| `apps/admin/app/feed/content-moderation-sections.tsx`  | 1749                         | Moderation sections            |

**Problem**

Files far above the repo’s **~1000-line internal decomposition guideline** mix orchestration, view state, handlers, and feature branches in one unit. This raises review cost and makes incremental refactors harder — not necessarily incorrect runtime behavior.

**Evidence**

Line counts from `find apps packages -name '*.ts' -o -name '*.tsx' … | wc -l` (excluding `node_modules`, `.next`, `dist`).

**Why it matters**

- Higher coupling between unrelated UI concerns in one file.
- Harder to test slices in isolation (TDD friction).
- Merge conflict hotspot.

**Best fix**

- Extract **pure helpers** and **subcomponents** with stable props (composition over boolean prop proliferation).
- Split hook into: data loaders, filter state, action handlers, and presentational components.
- One vertical slice per PR; keep behavior unchanged; add unit tests for extracted pure functions first.

**Validation**

- Scoped lint/typecheck: `bunx turbo run lint typecheck --filter=@asym/missionary-app` (or admin).
- Targeted Playwright smoke if user-facing flows touched.

**Not claimed without line-level review:** “random spaghetti branching” inside these files — only **size/coupling** is evidenced here.

---

### P1 — Triplicated per-app mock data

**Location**

- `apps/admin/lib/mock-data/` — 5 files
- `apps/donor/lib/mock-data/` — 5 files
- `apps/missionary/lib/mock-data/` — 5 files

Files: `users.ts`, `activities.ts`, `donations.ts`, `types.ts`, `index.ts`

**Problem**

The same demo dataset is copied into three apps. `users.ts` is **935 lines** in each app and **`diff -q` reports identical** content across admin, donor, and missionary.

**Evidence**

```text
admin users.ts: 935
donor users.ts: 935
missionary users.ts: 935
(pairwise `diff -q` admin↔donor and admin↔missionary: no differences)
```

**Why it matters**

- Triple maintenance for demo-only data shape changes.
- Risk of apps drifting silently if one copy is edited.

**Best fix**

1. Pick one canonical copy under `apps/admin/lib/mock-data/` (or a shared `packages/fixtures` module **only if** mocks are required in CI/production-like paths).
2. Import or re-export from other apps; delete byte-identical copies once verified.
3. If mocks are legacy, gate behind `NODE_ENV`/feature flag and delete unused copies.

**Validation**

```bash
diff -qr apps/admin/lib/mock-data apps/donor/lib/mock-data
bunx turbo run typecheck --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
```

---

## Large Files (over 1000 lines)

First-party TypeScript/TSX only (≥1000 lines at commit `02105e43`):

| Lines | Path                                                                 |
| ----: | -------------------------------------------------------------------- |
|  2738 | `apps/missionary/app/donors/use-donors-page-view.tsx`                |
|  2301 | `packages/database/collections/support-hub.ts`                       |
|  2002 | `apps/missionary/app/feed/worker-feed-page-client.tsx`               |
|  1860 | `apps/admin/app/pdf/page-client.tsx`                                 |
|  1749 | `apps/admin/app/feed/content-moderation-sections.tsx`                |
|  1746 | `apps/admin/src/migrations/20260515_173042_init_payload_cms.ts`      |
|  1510 | `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx` |
|  1472 | `apps/admin/app/feed/org-updates/page-client.tsx`                    |
|  1464 | `apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx`  |
|  1309 | `packages/api/src/admin/support-hub/adapter/supabase.ts`             |
|  1274 | `apps/admin/app/events/page-client.tsx`                              |
|  1263 | `apps/donor/app/(public)/checkout/checkout-client.tsx`               |
|  1214 | `apps/admin/app/email/page-client.tsx`                               |
|  1072 | `packages/email/resend.ts`                                           |
|  1039 | `apps/donor/app/(public)/where-we-work/map-wrapper.tsx`              |

**Additional context:** **76** files ≥500 lines in the same scan.

**Priority:** P1 for app UI and `packages/api` adapters; P2 for one-off migrations (`20260515_173042_init_payload_cms.ts`) where splitting may be low value.

---

## Spaghetti Branching

**Verified:** No repo-wide scan for “ad-hoc if statements” was automated (would produce false positives).

**Evidence-based guidance only:**

- Prefer moving **special-case auth/CMS branches** into `apps/admin/src/cms/auth/*` rather than spreading checks across unrelated admin pages — CMS auth is already centralized in `supabase-strategy.ts` (see P0 tests).
- Large `*-page-client.tsx` files (see Large Files) are the likely hotspots for **feature flags and mode switches**; treat new conditionals there as P1 review items.

**Action:** During refactors of any file ≥1000 lines, require a short comment or extracted policy object when adding more than one new branch for the same concern.

---

## Abstraction Problems

### P1 — `packages/database/collections/support-hub.ts` (2418 lines)

**Problem:** Single module size suggests multiple collection concerns bundled together.

**Fix:** Split by collection domain or CRUD surface; keep public exports stable via barrel only if `optimizePackageImports` / direct imports are respected per Vercel bundle guidance.

**Validation:** `bunx turbo run typecheck --filter=@asym/database` and support-hub unit tests if present.

### P1 — `packages/api/src/admin/support-hub/adapter/supabase.ts` (1379 lines)

**Problem:** Adapter + mapping + query construction likely co-located.

**Fix:** Separate **mapping**, **queries**, and **mutation orchestration**; align with existing `packages/api/src/reads/*` patterns.

### P2 — Thin or pass-through abstractions

**Not listed without cites:** No specific pass-through wrapper was flagged without naming a symbol. Avoid drive-by deletion.

---

## Type Boundaries

### P2 — Explicit `any` for PostgREST query builders (documented debt)

**Location**

- `packages/api/src/admin/crm/service.ts` — `type DonorQueryBuilder = any` (eslint-disable with `TODO(crm-postgrest)`)
- `packages/api/src/admin/contributions/service.ts` — `type ContributionQueryBuilder = any` (eslint-disable with `TODO(asym)`)

**Problem**

Dynamic filters bypass compile-time query shape checking; refactors can fail at runtime.

**Evidence**

```typescript
// packages/api/src/admin/crm/service.ts (lines 34–35)
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(crm-postgrest): narrow when donor query builder is fully typed
type DonorQueryBuilder = any;
```

**Why it matters**

Maintainability and safer CRM filter evolution — not an active typecheck failure (lint allows it).

**Best fix**

Introduce narrow builder types from generated Supabase types or a small set of allowed filter keys; remove eslint-disable when complete.

**Validation**

```bash
bunx turbo run typecheck --filter=@asym/api
bunx turbo run lint --filter=@asym/api
```

---

## Package / Layer Ownership

### Verified strength — data access boundary

**Rule (documented):** `packages/api/src/*` owns business DB logic; `apps/*/app/api/**/route.ts` stay thin; no direct Supabase in API routes.

**Evidence:** `bun run verify:data-boundary` passes; guide at `docs/guides/architecture/data-access-boundary.md`.

**Priority:** Maintain; add new routes only via `@asym/api` exports.

### P1 — App-local demo data vs shared packages

Mock data under `apps/*/lib/mock-data/` should not become a pattern for **production** types or API contracts — keep demo fixtures out of `packages/api` public exports.

### Cache layer ownership (Cache Components)

| Concern                   | Owner                                                                         | Verified                           |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| Cached reads              | `packages/api/src/reads/*.ts`, `packages/api/src/posts/index.ts`              | `'use cache'` present              |
| `cacheTag` / `cacheLife`  | Same read modules                                                             | Imported from `next/cache`         |
| Tag invalidation on write | `packages/api/src/admin/member-care/mutations.ts`, `packages/api/src/posts/*` | `revalidateTag` used               |
| `updateTag`               | Not used in `packages/api` production `.ts`                                   | Grep: no matches under `packages/` |

**P2 observation (not a false “broken cache” claim):** The repo uses **`revalidateTag`** for invalidation. `updateTag` is recommended in Next.js 16 docs for **immediate read-your-writes** after mutations, but absence of `updateTag` is only a problem where stale reads were observed — **not verified as a user-facing bug here**.

**Verified good practice:** `packages/api/src/reads` has **no** `cookies()` or `headers()` calls (grep empty) — aligns with cache-components rule “no request context inside cache.”

---

## Test Gaps

| Gap                                     | Priority | Evidence                                     | Suggested direction                       |
| --------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------- |
| CMS Supabase strategy cookie-auth paths | **P0**   | 7 timeouts in `supabase-strategy.test.ts`    | Fix mocks or strategy; see P0             |
| Full `bun run check` green              | **P0**   | Blocked by unit suite including CMS tests    | After CMS fix                             |
| Large hooks/pages without unit tests    | **P2**   | Size ≥1000 lines; no automated coupling scan | Extract pure functions; Vitest per module |
| TDD coverage on new CRM filter typing   | **P2**   | `any` builders                               | Red-green on filter builder types         |

**TDD note:** New behavior in auth or CRM should follow red-green-refactor on **extracted pure functions** before growing page-client files.

---

## Tooling / Repo Health

| Check                          | Status               | Notes                                                                              |
| ------------------------------ | -------------------- | ---------------------------------------------------------------------------------- |
| `bun run format:check`         | Pass                 |                                                                                    |
| `bun run lint` (turbo)         | Pass                 | Re-verify before release                                                           |
| `bun run typecheck` (turbo)    | Pass                 | Re-verify before release                                                           |
| `bun run verify:data-boundary` | Pass                 |                                                                                    |
| `bun run test:unit:cms`        | **Fail**             | P0                                                                                 |
| `bun run ci:preflight`         | **Fail in cloud VM** | Typically `verify:git-attribution` — configure git user/email or skip on sandboxes |
| `cacheComponents: true`        | Present              | All three apps’ `next.config.ts`                                                   |

**Scripts reference (real):** `check`, `test:unit`, `test:unit:cms`, `verify:data-boundary`, `ci:preflight` — all in root `package.json`.

---

## Safe Fix Plan

Ordered for **incremental PRs** (behavior preserved, tests first where possible):

1. **P0 — CMS unit tests**
   - Reproduce: `bunx vitest run tests/unit/cms/supabase-strategy.test.ts`
   - Fix mocks or hanging await in `supabase-strategy.ts`
   - Confirm: `bun run test:unit:cms` → `bun run check`

2. **P1 — Mock data package** (low behavior risk)
   - Extract shared `lib/mock-data` to one package; thin re-exports
   - Confirm: `diff` across apps for shared files

3. **P1 — One large file per PR**
   - Start with `use-donors-page-view.tsx` or `support-hub.ts` adapter split
   - Tests for extracted pure logic first (TDD)

4. **P2 — CRM/contribution builder types**
   - Replace `any` aliases incrementally with typed filters
   - `bunx turbo run typecheck --filter=@asym/api`

5. **P2 — Cache invalidation audit (optional)**
   - For each `revalidateTag` mutation path, decide if `updateTag` is required for UX
   - Only change where product needs immediate consistency

**Do not** bundle P0 test fixes with large refactors in one PR.

---

## Final Recommendation

1. **Unblock CI locally:** Fix the seven CMS Supabase strategy unit test timeouts — highest leverage, proven gate failure.
2. **Maintain boundary discipline:** Keep enforcing `bun run verify:data-boundary` on route/API changes.
3. **Decompose megamodules incrementally:** Target ≥1000-line files with composition extractions, not drive-by edits.
4. **Consolidate demo mocks:** Eliminate triplicated `users.ts` (935 × 3 identical copies).
5. **Pay down typed `any` in admin CRM/contribution queries** when touching those filters.

Treat **`ci:preflight` git attribution** and **missing `updateTag`** as contextual follow-ups, not P0 product defects, unless your environment or product requirements say otherwise.

---

## Audit Verification Notes

This report was produced by **verifying claims against the repository** at snapshot commit **`02105e43`** on `develop` (2026-05-22). Line counts and greps are snapshot-bound; re-run `find` / `wc -l` after large merges.

### Methods

- Read `AGENTS.md`, `package.json`, `turbo.json`, `docs/guides/architecture/data-access-boundary.md`
- Grep and `wc -l` / `find` for paths, cache directives, `any` types, `updateTag`
- Ran commands listed in [Commands Run](#commands-run)
- Matched all 11 Vitest test titles in `tests/unit/cms/supabase-strategy.test.ts` to pass vs timeout behavior

### False-positive prevention (summary)

| Claim type                                         | Treatment                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| “Cache invalidation broken because no `updateTag`” | **Downgraded to P2 optional** — `revalidateTag` is present; no stale-read bug verified |
| “Data boundary violations”                         | **Not claimed** — verify script passes                                                 |
| “Lint/typecheck failing”                           | **Not claimed** — turbo pass in session                                                |
| “ci:preflight = codebase bug”                      | **Excluded** — environment/git identity on sandboxes                                   |
| Subjective “messy/spaghetti” without paths         | **Omitted** unless tied to file size or test hang evidence                             |
| Vendor `vendor/payload-upstream` issues            | **Out of scope**                                                                       |

### Removing this document from git

To drop this audit file after merge, use a follow-up commit (not `git checkout develop -- CODE_QUALITY_AUDIT.md`, which only restores an older version if the file already existed on `develop`):

```bash
git rm CODE_QUALITY_AUDIT.md
git commit -m "docs: remove CODE_QUALITY_AUDIT snapshot"
```

Or revert the merge commit that introduced it.

**Related audits:** see [`docs/ai/audits/`](./docs/ai/audits/) for UI and other audit artifacts.

---

_End of audit._
