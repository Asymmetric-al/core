# Add Donor Self-Service

## Why

`platform-surfaces` promises that donors control their giving, recurring
gifts, payment methods, receipts, and statements, but the shipped donor portal
is read-only for recurring/payment-method controls: recurring gifts display
without pause/cancel/amount controls and the wallet UI is a stub with no
mutation endpoints. Annual statements have a donor-owned live `.txt` download,
but it recomputes flat donation rows and has no frozen receiptable context,
official template/artifact, retention, or recorded delivery. This change closes
the gap between the surface intent and shipped product.

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
- Add annual giving statement generation and delivery for receiptable gifts
  tied to known donor records. The Giving/statement domain owns the canonical
  frozen snapshot/version, including official display strings and raw values;
  Statement Studio owns assigned template/render/private artifact, and the donor
  BFF owns recipient-authorized download/delivery.

**Recurring supersession record (2026-07-13):** the original self-service
wording assumed one Stripe subscription and one mutable pledge record. Phase 16
(Pledges & Recurring Commitments) D1–D19 supersedes that topology. This change
now consumes explicit groups, independently manageable lines, compatible
billing cohorts, append-only schedule/command history, exact provider bindings,
and control-loss quarantine. The annual-statement scope below is unchanged.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donor-portal/**`,
  `packages/api/src/stripe/**`, `apps/donor` dashboard (recurring, wallet,
  statements), and the Statement Studio artifact boundary proposed by
  `add-statement-studio`
- Requires `add-recurring-giving` to land against the Phase 16 target model;
  this change does not authorize extending `donor_pledges`.
