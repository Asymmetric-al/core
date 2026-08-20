# ADR-0118: Gift processing-fee policy lives in Core, not checkout UI

**Status:** Accepted

## Context

Guest Giving checkout hardcoded Stripe processing rates (`STRIPE_FEE_PERCENT =
0.029`, `STRIPE_FEE_FIXED = 0.3`) and could post a client-grossed total as
`amount`. That made the UI the policy: Gift intake could not distinguish gift
from cover, ACH quotes were dishonest against a card-only formula, and a later
rate change required a checkout rewrite.

Gift intake under `packages/api/src/donate/` already owns saga creation and
`begin_donation_saga` `p_amount` (charged cents). Checkout should stay a thin
adapter. Tenant processor-cost attribution
([ADR-0060](./0060-processor-cost-attribution-policy.md)) is a different
concern from the donor cover-fees opt-in; this decision does not reopen it.

## Decision

Gift processing-fee policy lives in Core at
`packages/api/src/donate/fee-policy.ts`:

- Quotes estimated Stripe processing cost in integer cents by payment method.
- Card and wallet use the published US card-not-present estimate (`2.9% + 30¢`).
- ACH uses US bank debit (`0.8%` capped at `$5`).
- Checkout is a thin adapter (`checkout-donation.ts`). It must not own rates
  or rounding.
- Guest Giving `POST /api/donate` `amount` is the donor-entered gift in dollars.
  Gift intake recomputes charged cents from `cover_fees` and `payment_method`
  and never trusts a client total.
- `cover_fees` defaults to `false` and `payment_method` defaults to `card` so
  older clients that omit the flags still charge the posted amount as the gift.
- First-shot PaymentIntent metadata may carry the quote
  (`gift_amount_cents`, `cover_fees`, `payment_method`, `cover_amount_cents`,
  `estimated_fee_cents`) without overriding `donation_id`. Claim identity is
  merged last.
- Recovery and batch first-shot PaymentIntents without those extras are
  acceptable because charged cents already live in `p_amount`.
- The staff donations path (`packages/api/src/donations/index.ts`) does not
  apply cover-fees. Staff already send charged cents.
- Recurring checkout stays coerced to one-time. Live ACH and wallet confirm
  stay blocked; the adapter may still quote them.

## Consequences

- One module, two adapters: checkout UI and Gift intake share quotes. Rate
  changes happen in Core tests, not in React.
- Copy must describe estimated processing costs and must not claim that 100%
  of the gift reaches the field.
- Mixing a client-grossed `amount` with `cover_fees: true` would double
  gross-up. New checkout posts the gift (`100`), not `103.30`.
- `donations.amount` remains the charged amount. Allocation-line conservation
  of a payment group's gross amount is unchanged.

## Considered Options

- Keep rates in `checkout-client.tsx` — rejected: the adapter owned the
  policy; ACH quotes could not stay honest.
- Trust a client gross-up on `amount` — rejected: Gift intake must be the
  charge authority.
- Apply cover-fees in `packages/api/src/donations/index.ts` — rejected: staff
  already send charged cents.

## Related decisions

- [ADR-0060](./0060-processor-cost-attribution-policy.md) — tenant processor
  cost attribution (not this opt-in)
