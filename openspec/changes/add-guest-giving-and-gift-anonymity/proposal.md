# Add Guest Giving And Gift Anonymity

## Why

Leadership decided (2026-07-02, see `design.md`) that donors must be able to
give online without first creating or logging into an account, and that donors
may choose per-gift anonymity toward missionary and public views. Today the
donate API requires an authenticated donor role, checkout payment collection is
not yet production-grade, and no anonymity or unknown-offline-gift model
exists.

## What Changes

- Add guest checkout: server creates or matches the donor record during
  checkout and provisions claimable donor portal access (magic link, no forced
  password), without leaking account existence.
- Replace raw client card inputs and simulated success with Stripe-hosted
  payment UI; PAN/CVC never touch Asym servers; success derives only from
  server-confirmed payment state.
- Add per-gift anonymity flags (anonymous to missionary/public views, never to
  finance/admin), enforced by server-side redaction and audited when changed.
- Add offline contribution entry in Mission Control for known donors and truly
  unknown donors (`donor_id` null, not receiptable, no fake donor data).
- Freeze receipt-eligible donor identity and source facts in the Phase 7 facts
  authority; Phase 18 consumes that immutable Facts Package to create one exact
  canonical artifact, and Phase 17 separately delivers it.

## Impact

- Affected specs: `donation-lifecycle`, `contribution-operations`
- Affected code: `packages/api/src/donate/**`, `packages/api/src/stripe/**`,
  `packages/api/src/donor-portal/**`, `apps/donor` checkout, Mission Control
  Contribution Hub, `supabase/migrations` (donations anonymity/receipt
  columns)
- **BREAKING**: donate API contract gains a guest path; checkout UI payment
  collection is replaced.
