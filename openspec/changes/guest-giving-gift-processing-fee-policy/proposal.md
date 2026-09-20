# Guest Giving Gift processing-fee policy

## Why

Guest Giving checkout hardcoded Stripe card rates and could post a client-grossed
total as `amount`. Fee policy leaked into the UI while Gift intake already owned
saga creation. Checkout must stay a thin adapter; charged cents belong in Core.

## What Changes

- Add a Core Gift processing-fee policy module that quotes estimated Stripe
  processing cost in integer cents by payment method (card/wallet: 2.9% + 30¢;
  ACH: 0.8% capped at $5).
- Treat Guest Giving `POST /api/donate` `amount` as the donor-entered gift.
  Gift intake recomputes charged cents from `cover_fees` and `payment_method`
  and never trusts a client total.
- Keep checkout as a thin adapter over that interface. Copy talks about
  estimated processing costs, never “100% reaches the field.”
- Do not rewrite allocation-line conservation of a payment group's gross
  amount. Do not apply cover-fees on the staff donations path. Do not enable
  live ACH/wallet confirm in checkout.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donate/fee-policy.ts`, Gift intake
  `packages/api/src/donate/index.ts`, checkout adapter
  `apps/donor/app/(public)/(solid)/checkout/`
- Distinct from ADR-0060 tenant processor-cost attribution
