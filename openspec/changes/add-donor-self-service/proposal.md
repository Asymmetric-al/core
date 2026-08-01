# Add Donor Self-Service

## Why

`platform-surfaces` promises that donors control their giving, recurring
gifts, payment methods, receipts, and statements, but the shipped donor portal
is read-only for recurring/payment-method controls: recurring gifts display
without pause/cancel/amount controls and the wallet UI is a stub with no
mutation endpoints. Annual statements still expose a donor-owned live `.txt`
route that recomputes flat donation rows and has no reviewed Statement Run,
frozen Statement Subject, canonical current PDF, destination authority, or
truthful fulfillment history. Phase 19 now supersedes that route with the
governed statement-operations path. This change closes the gap between the
surface intent and shipped product.

## What Changes

- Add donor self-service for recurring gifts: change amount, cadence, next
  recurring date, optional end boundary, and eligible future designation;
  skip one named occurrence; pause until a date or indefinitely; resume; stop
  recovery for one missed occurrence; and cancel or restart. Commands execute
  server-side against the Phase 16 stable-line, effective-term-version,
  schedule-epoch, occurrence, and cohort model and the current provider adapter,
  never a legacy pledge row. Term changes, calendar changes, and lifecycle facts
  append to their own histories. Pause/resume preserves the normal grid and
  never implies that an external executor stopped; restart requires a fresh
  successor authorization. Provider subscriptions own ordinary renewals only,
  not Phase 16 recovery eligibility or timing.
- Add donor payment-method management (add, update default, remove) through
  Stripe-managed flows; no raw payment data touches Asym servers.
- Add annual document access through Phase 19 Statement Runs. Phase 7 owns each
  legal-donor Statement Subject, eligibility, official facts, coverage, and
  correction; Phase 19 owns the frozen run population, recipient operation,
  cutoff, participation, and copy-request coordination; Phase 18 owns the exact
  assigned publication, Generation Request, private canonical artifact,
  current head, and artifact authorization; and Phase 17/6 owns any governed
  delivery and communication history. Recognition-only household or disclosed
  DAF support may appear only in Phase 19's separate, optional
  **Support overview — Not a tax document**, never inside an official document
  or deductible total. The donor BFF remains a thin adapter over the canonical
  current-artifact and bounded copy-request seams.

**Recurring supersession record (2026-07-13):** the original self-service
wording assumed one Stripe subscription and one mutable pledge record. Phase 16
(Pledges & Recurring Commitments) D1–D19 supersedes that topology. This change
now consumes explicit groups, independently manageable lines, compatible
billing cohorts, append-only schedule/command history, exact provider bindings,
and control-loss quarantine. The original annual-statement scope is superseded
by Phase 19 D1-D18 and the active `add-statement-operations` change.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donor-portal/**`,
  `packages/api/src/stripe/**`, `apps/donor` dashboard (recurring, wallet,
  statements), the Phase 19 boundary proposed by `add-statement-operations`,
  and the canonical Document Production boundary proposed by
  `add-statement-studio`
- Requires `add-recurring-giving` to land against the Phase 16 target model;
  this change does not authorize extending `donor_pledges`.
