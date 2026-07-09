# Add Donor Self-Service

## Why

`platform-surfaces` promises that donors control their giving, recurring
gifts, payment methods, receipts, and statements, but the shipped donor portal
is read-only: recurring gifts display without pause/cancel/amount controls,
the wallet UI is a stub with no mutation endpoints, and annual statements are
computed as years but never generated. This change closes the gap between the
surface intent and the shipped product.

## What Changes

- Add donor self-service for recurring gifts: pause, resume, cancel, and
  amount changes, executed server-side against the Stripe subscription and the
  pledge record.
- Add donor payment-method management (add, update default, remove) through
  Stripe-managed flows; no raw payment data touches Asym servers.
- Add annual giving statement generation and delivery for receiptable gifts
  tied to known donor records.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donor-portal/**`,
  `packages/api/src/stripe/**`, `apps/donor` dashboard (recurring, wallet,
  statements)
