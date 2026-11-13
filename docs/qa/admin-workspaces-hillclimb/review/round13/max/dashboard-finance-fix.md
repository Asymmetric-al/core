# Dashboard financial correctness fix

Implemented locally in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only. Existing wave A work was preserved. No Git mutations, servers, Turbo, environment files, secrets, production data, or subagents were used.

## Changes and ownership

- `packages/api/src/reads/dashboard-stats.ts`: selects donation IDs and loads applied `contribution_adjustments` for the same tenant and loaded gifts. Requests use 150-ID chunks, stable `created_at`/`id` ordering, and 1,000-row ranges until an empty page. Offsets advance by actual page length; an adjustment query failure rejects the entire read.
- Amounts use Reports' owning `mapContributionAdjustmentRow` / `deriveEffectiveContribution` contract. Both the monthly figure and trend now use corrected amount minus the unchanged recorded refund, clamped at zero. The verified example is **10,000 original → 8,000 corrected − 1,000 refunded = 7,000 cents**.
- Explicit applied `effective_values.currency` replaces the display currency in chronological order; absent currency corrections preserve the original, null/blank stays unknown, and non-string/non-null corrections fail. No conversion occurs. Existing mixed/unknown-currency notices use the effective currencies. Unsafe/fractional cents and unsafe monthly sums reject rather than round.
- UTC gift-month attribution, 12 full months plus current month so far, original settled-record counts, donation paging, cache lifetime/tags, and authentication callers are preserved. Provider refund basis, execution, and write boundaries are untouched.
- `apps/admin/features/mission-control/components/giving-trend-card.tsx`: changed only the correction-semantics comment/disclosure to “Applied amount and currency corrections are included.” No layout, styling, or interaction edits.
- Tests owned: `tests/unit/packages/api/reads/dashboard-stats.test.ts` and `tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx`. Existing cases remain; fixtures now supply IDs and adjustment responses.

## RED / GREEN evidence

- `bunx --no-install vitest run tests/unit/packages/api/reads/dashboard-stats.test.ts -t 'canonical corrected amount'`: RED returned 9,000 instead of 7,000; GREEN after canonical adjustment derivation.
- Same file with `-t 'applied currency correction'`: RED returned null currency instead of CAD; GREEN after effective currency handling, preserving cents and the frozen original gift.
- Same file with `-t 'safe integer cents'`: RED accepted fractional/unsafe corrected amounts; GREEN after validation. A separate monthly-overflow case was RED, then GREEN after aggregate validation.
- `bunx --no-install vitest run tests/unit/packages/api/reads/dashboard-stats.test.ts tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx -t 'monthly sum beyond|states that applied'`: both cases RED before their fixes, then GREEN in the complete focused run.
- Additional read-seam coverage: legitimate absence of adjustments; first/later adjustment-page failure; chronological corrections to historical months; reversed/unknown-status and unrelated rows; corrected mixed/unknown currencies; tenant predicates; correction paging beyond 1,000; ID chunking; and a corrected gift on the second donation page.

## Final checks

All commands ran from the R12 root unless a working directory is specified.

```text
bunx --no-install vitest run tests/unit/packages/api/reads/dashboard-stats.test.ts tests/unit/packages/api/admin-crm-report-totals.test.ts tests/unit/packages/api/admin/contribution-effective-values.test.ts tests/unit/packages/api/admin/contribution-effective-values-status.test.ts tests/unit/apps/admin/giving-trend-card.test.tsx tests/unit/apps/admin/mission-control-home.test.tsx tests/unit/apps/admin/app/dashboard-stats-loader.test.ts tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx tests/unit/apps/admin/app/reports-giving-trend.test.tsx
PASS: 9 suites, 116 tests. After the final second-donation-page test/import cleanup:

bunx --no-install vitest run tests/unit/packages/api/reads/dashboard-stats.test.ts tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx
PASS: 2 suites, 34 tests.

bun run lint:ui packages/api/src/reads/dashboard-stats.ts tests/unit/packages/api/reads/dashboard-stats.test.ts apps/admin/features/mission-control/components/giving-trend-card.tsx tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx
PASS: exit 0, no warnings after fixing two test import-order warnings.

bunx --no-install prettier --check packages/api/src/reads/dashboard-stats.ts tests/unit/packages/api/reads/dashboard-stats.test.ts apps/admin/features/mission-control/components/giving-trend-card.tsx tests/unit/apps/admin/app/reports-giving-trend-card.test.tsx
PASS: all four files.

bun run typecheck --incremental false
PASS in packages/api and separately in apps/admin (tsc --noEmit, exit 0).
```

## Remaining limits

- The current shared effective-values type and correction command adapter support amount corrections but have no currency field/command. This bounded read honors explicit applied JSON `currency` values locally; it does not add or activate a currency correction writer. Currency behavior is proven with fixtures, not live persisted records.
- The existing numeric monthly field retains its API shape; Home withholds its display through the existing shared mixed/unknown-period-currency notice. Trend amounts are null in that case. Existing Home/trend consumer tests passed.
- New adjustment reads add chunk/page round trips. Donation and adjustment reads are not a transactional snapshot; concurrent-write behavior and live performance were not measured.
- No browser, live database/provider integration, build, full unit suite, or deployment verification was attempted, within the requested scope. The supplied `review/round12-completed/gpt-shell.md` was absent in R12 and at the same relative path in the frozen parent; the fix was verified against owning source/contracts and executable read-seam regressions.
