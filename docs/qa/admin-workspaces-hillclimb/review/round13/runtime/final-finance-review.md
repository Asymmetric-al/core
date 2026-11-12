# Round 13 final financial source review

## Boundary and verdict

Independent review in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only. This report is the only authored file. No product/test changes, Git mutations, subagents, browser/localhost requests, server/database lifecycle changes, credentials, or hosted operations were used.

**Partial financial source/test acceptance, not unconditional Dashboard sign-off.** Corrected amount/refund arithmetic, the recorded-refund total fix, and copied report completeness warnings pass the focused checks below. Two important residual issues remain: effective payment-state eligibility and invalidation of newly consumed corrections. Neither is a demonstrated tenant/auth bypass or provider-execution defect. No UI score or WCAG/conformance claim is made.

Freeze: [round13-manifest.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/snapshots/round13-manifest.json) has 1,032 entries. [round13.diff](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/snapshots/round13.diff) independently hashes to `8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547`. Nine scoped changed source/test entries were rehashed after testing: nine matches, zero mismatches. This is not a full independent no-extras verification of all 1,032 entries.

Previous finance-review, dashboard-finance-fix and lead-review-fixes documents were leads only. Conclusions use current frozen source, applicable API/admin/auth/UI instructions and frontend/backend/testing/data-access rules, effective-value/report contracts, contribution money/provider boundaries, and code-review/Vitest guidance. The active UI-cohesion proposal preserves money and authorization contracts.

## Important findings

### F1 — P2: effective non-settled gifts still contribute to net money

**Location:** [dashboard-stats.ts:112](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:112) and its unconditional amount return at [dashboard-stats.ts:139](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:139).

The new read loads applied adjustments and calls the canonical resolver but uses only its amount. An applied payment-state correction to `failed`, `pending`, or `refunded` does not remove that gift's money. Canonical Reports excludes non-completed effective statuses at [service.ts:305](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/reports/service.ts:305). This is supported data: [correction-effective-values.ts:110](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/correction-effective-values.ts:110) derives `{ paymentStatus: normalizedStatus }`, and [operations.ts:1107](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/operations.ts:1107) persists the applied overlay without rewriting the original donation.

**Reproduction:** one same-tenant USD gift this UTC month, original status `completed`, amount `10000`, refund `0`; one applied `payment_state_correction` for that gift with `effective_values: { paymentStatus: "failed" }`. Invoke `getDashboardStats(tenantId)` and `buildAdminCrmReport` for `slice: "funds"` and the same month. An independent actual-source/in-memory probe returned:

```text
dashboard revenueThisMonthCents: 10000
dashboard current trend netCents: 10000
canonical report totals.amountCents: 0
canonical report completeness.complete: true
```

**Impact:** Home describes $100 as settled giving after the effective record and Reports no longer consider it settled. Intentionally counting original settled gift records is not itself the finding.

**Provenance/repair:** original stored-status eligibility was already a limitation before this fix. The new effective-value integration leaves it unresolved; this is not a newly introduced payment write or count regression. Apply canonical effective settlement eligibility to net-money aggregation and cover this example at the read seam. No redesign of original-record counts is requested.

### F2 — P2: adjustment writes do not invalidate the new cache dependency

**Location:** the correction dependency at [dashboard-stats.ts:175](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:175) and tags at [dashboard-stats.ts:293](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:293), against the successful direct mutation return at [route.ts:239](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/route.ts:239) and approval return at [route.ts:320](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/route.ts:320).

The read attaches the admin Contributions tenant tag, so existing settlement/webhook/staged-gift invalidators reach it. However, direct correction and approval paths persist adjustments without calling that invalidator. The dispatcher, correction handler, dependency adapter, persistence function and `withOperation` wrapper contain no server invalidation for these writes. The refresh at [contribution-detail-query.ts:43](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/contribution-detail-query.ts:43>) only invalidates TanStack queries; it does not expire `getDashboardStats`' server cache.

**Reproduction sequence for the runtime owner:** warm Dashboard with a `10000`-cent completed gift and `1000`-cent refund: net `9000`. Apply an authorized amount correction to `8000`. Fresh canonical detail/Reports now return `7000`, but no correction-path invalidation marks the cached `9000` Dashboard entry stale. Request Home before time-based revalidation and without another invalidating mutation. Approval has the same missing connection.

This is **source-traced, not a live Next cache reproduction**. [dashboard-stats.ts:91](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:91) uses `cacheLife("minutes")`; the installed [cacheLife guide:139](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md:139) specifies a one-minute server revalidation interval and five-minute client stale interval. This is a freshness window, not indefinite stale money. The current helper uses stale-while-revalidate, not guaranteed immediate read-your-writes: [cache-tags.ts:82](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/shared/cache-tags.ts:82) and the installed [revalidateTag guide:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md:19).

**Provenance/repair:** the mutation-side omission and lifetime predate this fix; consuming correction overlays introduces the missing dependency edge. Follow the existing [cache contract:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/shared/cache-tags.ts:19): connect successful applied corrections/decisions to tenant-scoped Contributions invalidation and add a focused assertion. Do not disable all caching, change tenant keys, or imply immediate provider synchronization.

## Verified fixes and safe behavior

- **Corrected amount before refunds:** applied effective amounts retain the recorded refund basis and clamp each gift's retained money at zero. The actual-source probe returns `10000 original -> 8000 corrected - 1000 refunded = 7000` in Dashboard monthly money, current trend, and canonical Reports. Query/page errors reject rather than return partial or fabricated-zero success.
- **Recorded refunds fixed:** [hub-model.ts:165](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/hub-model.ts:165>) preserves refund `8000` when effective gift amount is `7500`; retained money stays zero. The [exact regression:167](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-hub-model.test.ts:167) passes. Do not re-raise the old capped-refund finding.
- **Copied warnings fixed:** [report-model.ts:160](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/report-model.ts:160>) includes the `50000` cap, a nonnumeric warning for `donationLimit: null`, and unknown-completeness text when metadata is absent. The [summary dialog:24](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/giving-summary-dialog.tsx:24>) copies that same text. The [specific regression:869](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:869) passes. Null is allowed by the report contract, not malformed input.
- **Adjustment scope/paging:** [dashboard-stats.ts:182](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:182) bounds requests to 150 loaded gift IDs, filters tenant/applied status, orders by creation time then ID, advances by actual page length, and reads through an empty page. Tests cover more than 1,000 corrections, the final ID chunk, later gift pages, reversed/unapproved/unrelated overlays, and first/later page failures.
- **Malformed data/currency:** unsafe/fractional final cents, unsafe monthly sums, unreadable gift timestamps, and invalid typed currency overlays reject. Explicit null/blank corrected currency stays unknown; mixed/unknown currencies suppress trend amounts. The reachable [Home consumer:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/mission-control-home.tsx:77) also withholds monthly presentation using that metadata. This does not prove full schema validation of arbitrarily corrupted JSON.
- **Tenant/auth source boundary:** count/gift/adjustment queries carry tenant predicates; adjustment IDs come from loaded gifts. Home supplies the authenticated tenant and shell/middleware checks staff/admin/super-admin access. No new tenant or role bypass was established. Predicate tests are not live RLS/session integration proof.

## Inherited limits, not additional new blockers

- Donation paging still stops at a short page at [dashboard-stats.ts:170](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:170). Committed [Supabase configuration:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/supabase/config.toml:18) sets `max_rows = 1000`, matching `PAGE_SIZE`. A lower-cap sensitivity probe returned two of three gifts under an artificial cap of two, whereas Reports read all three. This is inherited configuration sensitivity, not evidence of current-provider truncation. New adjustment paging has no short-page stop.
- Dashboard retains the original three lower-case settled spellings. Reports expands legacy `Succeeded` at [service.ts:131](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/reports/service.ts:131). That query-domain difference predates this fix and is distinct from F1's applied effective-status example.
- The canonical adjustment type/writer has no currency-correction field. Explicit currency-overlay tests prove defensive handling of persisted fixture JSON, not a shipped currency-write capability. Reports does not select currency at [service.ts:127](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/reports/service.ts:127); no cross-report multicurrency/conversion guarantee is established. F1 is entirely USD and does not depend on this limitation.
- Stable pagination is not a transactional snapshot across gift/adjustment requests. Concurrent-write behavior and large live-provider performance are unverified. Original settled-record counts, UTC month attribution and zero-retained gift-count semantics are not equated with Reports' retained-money gift counts.

## Independently executed checks and retained output

Only focused local checks ran; no full workspace, Turbo, browser, capture, hosted, or provider suite. Both Vitest commands disable file parallelism/cache and set one concurrent worker. The second launches isolated file workers sequentially, not two concurrent workers.

```text
bunx --no-install vitest run --config vitest.config.mts --no-cache --maxWorkers 1 --no-file-parallelism tests/unit/packages/api/reads/dashboard-stats.test.ts

RUN v5.0.5
Test Files  1 passed (1)
Tests       31 passed (31)
Duration    477ms
Exit        0

bunx --no-install vitest run --config vitest.config.mts --no-cache --maxWorkers 1 --no-file-parallelism tests/unit/apps/admin/app/contributions-hub-model.test.ts tests/unit/apps/admin/app/reports-page.test.tsx -t 'preserves actual refunds|keeps capped and unknown completeness'

RUN v5.0.5
Test Files  2 passed (2)
Tests       2 passed | 49 skipped (51)
Duration    9.01s
Exit        0
```

**Additional source probes:** a PowerShell here-string piped to `node` transpiled unmodified local TypeScript modules in memory with installed TypeScript. It invoked the exported Dashboard read, Reports builder and payment-state correction mapper. Database/cache imports were stubs; the thenable query fixture applied tenant/status/date/ID predicates, sorting, ranges and row caps. No probe file, test edit, network request or database write was required. This is not a test of Next's cache transform or a provider.

Retained output:

```json
{"probe":"supported payment-state correction to failed","dashboardCents":10000,"dashboardGiftCount":1,"trendCents":10000,"reportCents":0,"reportComplete":true}
{"probe":"amount correction and recorded refund","dashboardCents":7000,"dashboardGiftCount":1,"trendCents":7000,"reportCents":7000,"reportComplete":true}
{"probe":"lower server cap sensitivity (not configured cap)","dashboardCents":20000,"dashboardGiftCount":3,"trendCents":20000,"reportCents":30000,"reportComplete":true}
```

The first two use a same-tenant USD gift on the first day of the process's current UTC month. F1 supplies an applied payment-state overlay derived from `{ status: "failed" }`; the arithmetic case supplies applied `{ amountCents: 8000 }` and `refund_amount: 1000`. The third uses three `10000`-cent settled gifts and an artificial two-row response cap. Production functions, not a copied aggregation algorithm, produced these results.

## Acceptance limit

Accept the recorded-refund and copied-warning fixes and demonstrated amount/refund behavior. **Do not certify full canonical settled-money parity or correction freshness for Dashboard while F1/F2 remain.** The 33 passing focused tests do not cover those conditions and do not negate the reproduced status mismatch.

Real Supabase/provider behavior, live tenant/session/RLS integration, actual cache revalidation timing and production scale remain unverified. No browser/localhost work was needed or used, so no capture/check helper or candidate fixture preflight was invoked. No visual score, provider-success or accessibility-conformance conclusion follows from this financial source/test review.
