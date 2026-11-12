# Financial repair preparation

2026-11-12. Independent final review findings remain open on the frozen product source.

## Effective-status money eligibility

Reproduced through the existing Dashboard read seam with one 10,000-cent completed original gift and an applied `payment_state_correction` for each of failed, pending and refunded. All three regressions failed with actual 10,000 versus expected zero. Original gift-count semantics are deliberately retained.

- `effective-status-red.log` and `.exit.txt`: expected behavioral failures, exit 1.
- `status-regression-snippet.txt`: proposed parameterized regression.
- `dashboard-stats.proposed.ts.txt`: exact source-copy treatment using Reports' `normalizeSharedPaymentStatus`; non-completed effective statuses contribute zero money.
- `effective-status-prototype-green.log` and `.exit.txt`: 34 tests passed, exit 0, against a temporary treatment module copy.

Temporary probe test and module files were removed after each run. Existing production and committed-test files were not changed. The treatment is a validated prototype, not an applied fix or final acceptance. It still needs final source application, persistent regression, scoped lint/typecheck and affected runtime evidence after the capture freeze ends.

## Cache invalidation

The independent review traces direct correction and approval writes that do not call `revalidateAdminContributionsCache`, while Dashboard now depends on applied adjustments and attaches that helper's tenant tag. This remains source-traced, not live-cache verified. Before applying a repair, add route-seam tests for successful direct and approved writes and failure/denied boundaries. Reuse the existing tenant-scoped invalidation helper and installed Next.js cache contract; preserve authorization, idempotency and mutation outcome semantics.

## Evidence coordination

Current collectors are recording the existing Round 13 checkpoint. Do not treat their captures as evidence for the prepared treatment. Apply changes only after coordinating with the collectors or receiving their terminal results; then explicitly refreeze and recapture the affected Dashboard evidence. Studio and unrelated layout captures may remain useful if provenance demonstrates unchanged relevant source.
