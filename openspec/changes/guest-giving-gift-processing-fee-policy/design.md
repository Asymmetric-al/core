# Design: Guest Giving Gift processing-fee policy

## Context

Guest Giving checkout hardcoded Stripe card rates (`2.9% + 30¢`) and could post
a client-grossed total as `amount`. The UI owned fee policy while Gift intake
already owned saga creation. Two adapters (checkout + Gift intake) quoting
different numbers is the deletion-test signal: rates belong behind one Core
**module** whose **interface** is the test surface.

Tenant processor-cost attribution ([ADR-0060](../../../docs/adr/0060-processor-cost-attribution-policy.md))
is a different concern. This change is the donor cover-fees opt-in.

## Goals

- One Core Gift processing-fee policy module in integer cents.
- Checkout stays a thin **adapter**: dollars in/out, no rates, no rounding.
- `POST /api/donate` `amount` is the donor-entered gift. Gift intake recomputes
  charged cents and never trusts a client total.
- First-shot PaymentIntent metadata may carry the quote without overriding
  claim identity (`donation_id` last).
- Copy talks about estimated processing costs, never “100% reaches the field.”

## Non-goals

- Rewrite the ~2000-line checkout client, operation-shell, or contribution
  command.
- Enable live ACH or wallet Stripe confirm.
- Flip the cover-fees default (stays `false`).
- Tenant fee-config matrix or a new database column.
- Change `begin_donation_saga` `p_amount` meaning (still charged cents).
- Apply cover-fees on staff `POST /api/donations`.
- Recurring installment recompute (checkout still coerces monthly to one-time).
- Bump the repo Stripe API version pin.
- Reopen ADR-0060.

## Decisions

### Core module, two adapters (real seam)

`packages/api/src/donate/fee-policy.ts` is client-safe (no `next/server`).
Public **interface**:

- `quoteGiftProcessingFee({ giftAmountCents, coverFees, paymentMethod })`
- `resolveGiftIntakeCharge({ amount, coverFees, paymentMethod })` — dollars in
- `toGiftProcessingFeeStripeMetadata(quote)`

Checkout (`checkout-donation.ts`) and Gift intake (`donate/index.ts`) are the
two **adapters**. One adapter would be a hypothetical seam; two make it real.

### Schedules

- Card and wallet: US card-not-present estimate, `2.9% + 30¢`.
- ACH: US bank debit `0.8%` capped at `$5`. Gross-up is uncapped
  `charged ≈ gift / 0.992` until the cap binds (near a `$620` gift).
- Work in integer cents. Percent-plus-fixed:
  `chargedCents = round((giftCents + fixedCents) / (1 - percent))`.

### POST contract

New checkout posts gift `100` + `cover_fees: true`. Older clients that posted
grossed `amount: 103.30` with no flags still charge `10330` as the gift because
`cover_fees` defaults to false. Mixing `103.30` + `cover_fees: true` would
double-gross-up; tests lock gift `100`.

### PaymentIntent extras vs recovery

Quote fields go on first-shot PaymentIntent metadata only. Recovery and batch
processors may omit extras. That is acceptable: charged cents already live in
`p_amount`. Documented in the donation-saga-outbox runbook.

### Staff path

`packages/api/src/donations/index.ts` already sends charged cents. Cover-fees
is Guest Giving Gift intake only.

## Risks

- Old clients that already grossed `amount` keep charging that figure as the
  gift. That is the compatibility contract, not a bug.
- ACH/wallet quotes can appear on the payment step while live confirm stays
  blocked. Tests lock the reject-before-POST behavior.
- Estimated fee ≠ Stripe settlement. Copy must stay “estimated.”

## Verification

- Unit tests at the Core **interface**, schema defaults, Gift intake `p_amount`,
  saga metadata merge, checkout adapter POST body, and cover-fees UI.
- `bunx @fission-ai/openspec@latest validate --all --strict`.
