# Guest Giving cover-fees

Donors can opt in to cover **estimated** Stripe processing costs on Guest
Giving checkout. Checkout is a thin adapter. Gift processing-fee policy lives
in Core (`packages/api/src/donate/fee-policy.ts`). Gift intake recomputes
charged cents and never trusts a client total.

This is not tenant processor-cost attribution (ADR-0060).

## Quote schedules (US estimates)

| Method        | Estimate          | Notes                                         |
| ------------- | ----------------- | --------------------------------------------- |
| Card / wallet | 2.9% + 30¢        | Card-not-present. Wallet uses the same quote. |
| ACH           | 0.8% capped at $5 | Cap binds near a $620 gift.                   |

These figures are estimates, not Stripe's eventual settlement fee. UI copy
must say “estimated processing costs” and must not claim that 100% of the gift
reaches the field.

## Request contract

`POST /api/donate`:

- `amount` — donor-entered gift in dollars
- `cover_fees` — default `false`
- `payment_method` — `card` \| `ach` \| `wallet`, default `card`

New checkout posts gift `100` + flags. Older clients that omit the flags still
charge the posted amount as the gift.

Characterization (card, cover on): `$100` gift → charged `10330` cents.

## What stays blocked

Live ACH and wallet confirmation stay blocked in checkout. The payment step
may still show the matching quote. Recurring checkout stays coerced to
one-time.

Staff `POST /api/donations` does not apply this policy.

## Related

- [ADR-0118](../../adr/0118-gift-processing-fee-policy-lives-in-core.md)
- [Donation saga outbox](../operations/donation-saga-outbox.md)
