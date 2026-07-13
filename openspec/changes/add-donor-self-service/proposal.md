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

- Add donor self-service for recurring gifts: pause, resume, cancel, and
  amount changes, executed server-side against the Stripe subscription and the
  pledge record.
- Add donor payment-method management (add, update default, remove) through
  Stripe-managed flows; no raw payment data touches Asym servers.
- Add annual giving statement generation and delivery for receiptable gifts
  tied to known donor records. The Giving/statement domain owns the canonical
  frozen snapshot/version, including official display strings and raw values;
  Statement Studio owns assigned template/render/private artifact, and the donor
  BFF owns recipient-authorized download/delivery.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donor-portal/**`,
  `packages/api/src/stripe/**`, `apps/donor` dashboard (recurring, wallet,
  statements), and the Statement Studio artifact boundary proposed by
  `add-statement-studio`
