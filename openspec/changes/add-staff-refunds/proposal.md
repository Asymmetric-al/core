# Add Staff-Initiated Contribution Refunds

## Why

`contribution-operations` records provider-confirmed refund outcomes, and the
UI advertises a refund action, but the server route returns 501 — no refund
provider is wired, so staff cannot actually initiate a refund in-product. This
contradicts the intended admin refund flow. Refunds are an imminent
requirement, so this change carries the execution path as target truth.

## What Changes

- Add staff-initiated refund execution through the Contribution Operations
  Core: request a full or partial refund server-side via Stripe, record the
  provider outcome truthfully, and reflect it across donor and staff surfaces.
- Enforce the existing high-risk gate on execution: `finance:manage_contributions`,
  a reason, and server-side confirmation; bulk refunds run per-record through
  the single-action contract with preview and confirmation.
- Stop advertising refund as available in the UI while it is unwired (code fix
  tracked with the execution work).

## Impact

- Affected specs: `contribution-operations`
- Affected code: `packages/api/src/admin/contribution-operations/**`
  (refund provider + route), Stripe refund adapter, Mission Control UI
- Depends on nothing; complements the shipped refund-reflection path.
