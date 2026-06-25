# Plan 001: Remove dead resend-receipt hook and canResendReceipt field

## Status

- **Priority**: P2 — **Effort**: S — **Risk**: LOW — **Depends on**: none
- **Category**: tech-debt — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters

#270 replaced the CRM gift-row's bespoke "Resend" button with the shared
`ContributionOperationShell` driven by server-computed `inlineActions`. That
orphaned `useResendCrmGiftReceipt` (and its `resendStagedGiftReceipt` fetcher)
and the `CrmGiftHistoryRow.canResendReceipt` field — both now have zero
production readers. Dead code on a money path invites future contributors to
trust a stale affordance that no longer reflects capability/state gating.

## Current state (verified at 36cc941b)

- `packages/database/hooks/admin-crm-detail.ts:85` `resendStagedGiftReceipt`, `:153` `useResendCrmGiftReceipt`.
- `packages/database/hooks/index.ts:21` re-exports `useResendCrmGiftReceipt`.
- `packages/api/src/admin/crm/detail/gift-history.ts:65` computes `canResendReceipt`, `:112` assigns it onto the row.
- `packages/database/types/crm-detail.ts:75` `canResendReceipt: boolean` on `CrmGiftHistoryRow`.
- Readers are tests/docs only: `tests/unit/packages/api/admin/crm-gift-history-row.test.ts:77,92`; `tests/unit/apps/admin/app/crm-gift-detail-entry.test.tsx` fixture; `tests/unit/packages/api/admin-crm-detail-report.test.ts` fixture.
- `git grep useResendCrmGiftReceipt` and `git grep canResendReceipt` find no app/component readers.

## Scope

**In scope**: the 4 source files above + the 3 test files that assert/fixture the field.
**Out of scope**: `inlineActions` (the live replacement), any other hook in `admin-crm-detail.ts`.

## Steps

1. Confirm zero readers: `git grep -n "useResendCrmGiftReceipt"` and `git grep -n "canResendReceipt"` — only definitions, the barrel, tests, and the grill-session doc may match. If any `apps/**` or non-test `packages/**` reader exists, **STOP**.
2. Delete `resendStagedGiftReceipt` + `useResendCrmGiftReceipt` from `admin-crm-detail.ts`; remove the export from `index.ts`.
3. Remove `canResendReceipt` from the `CrmGiftHistoryRow` interface and stop computing/assigning it in `gift-history.ts`.
4. Remove the obsolete assertions/fixture entries in the three test files.

## Verify / Done criteria

- `git grep -n "canResendReceipt\|useResendCrmGiftReceipt"` returns only the doc note (or nothing).
- `bunx turbo run lint typecheck --filter=@asym/api --filter=@asym/database --filter=@asym/admin` exits 0.
- `bunx vitest run tests/unit/packages/api/admin/crm-gift-history-row.test.ts tests/unit/apps/admin/app/crm-gift-detail-entry.test.tsx tests/unit/packages/api/admin-crm-detail-report.test.ts` pass.

## STOP conditions

- Any production (non-test) reader of either symbol exists.
- Removing `canResendReceipt` breaks a structural type requirement elsewhere.
