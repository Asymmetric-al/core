# Add Donation Lifecycle Capability Spec

## Why

The intent specs call donation-flow integrity non-negotiable, but the donor-side
money path (checkout, payment states, recurring, receipts, refunds) had no
capability spec, so agents had no behavioral contract for the most
trust-critical part of the product.

## What Changes

- Add a `donation-lifecycle` capability spec documenting the shipped donor-side
  money path: server-authoritative idempotent checkout, honest payment states
  across rails (including ACH delayed finality), single-designation gifts,
  recurring donations on the subscription lifecycle, receipt issuance from
  payment truth, truthful refund visibility, saga/ledger recovery, and a donor
  portal that derives from the same records.

## Impact

- Affected specs: `donation-lifecycle` (new)
- Affected code: none (documents existing behavior in `packages/api/src/donate`,
  `packages/api/src/stripe`, `packages/api/src/giving`,
  `packages/api/src/donor-portal`, `apps/donor`)
