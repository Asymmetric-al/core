# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Guest Giving Cover-Fees Use Gift Processing-Fee Policy

Guest Giving `POST /api/donate` MUST treat `amount` as the donor-entered gift in
dollars, not a client-grossed charge. Gift intake MUST recompute charged cents
through the Core Gift processing-fee policy from `cover_fees` and
`payment_method`, and MUST NEVER trust a client total. Checkout MUST remain a
thin adapter over that policy and MUST NOT own Stripe rates or rounding.

`cover_fees` MUST default to false and `payment_method` MUST default to `card`
when omitted so older clients keep charging the posted amount as the gift.
Copy MUST describe estimated processing costs and MUST NOT claim that 100% of
the gift reaches the field. Live ACH and wallet confirmation MAY be quoted in
the adapter and MUST remain blocked until those payment methods are enabled.

This requirement does not change allocation-line conservation of a payment
group's gross amount, does not apply cover-fees on the staff donations path,
and does not reopen tenant processor-cost attribution.

#### Scenario: Donor covers estimated card processing costs

- GIVEN a Guest Giving checkout for a $100 gift with cover-fees on and card
- WHEN Gift intake receives `amount: 100`, `cover_fees: true`,
  `payment_method: "card"`
- THEN the platform charges 10330 cents
- AND the posted `amount` remains 100, not 103.30

#### Scenario: Older client omits cover-fees flags

- GIVEN a client posts `{ amount: 100 }` with no `cover_fees` or
  `payment_method`
- WHEN Gift intake validates the body
- THEN `cover_fees` is false and `payment_method` is `card`
- AND charged cents equal the gift (10000)

#### Scenario: Donor selects bank while ACH confirm is blocked

- GIVEN cover-fees is on and the donor selects Bank
- WHEN they confirm
- THEN checkout MAY show the ACH quote
- AND MUST reject live confirmation before POST `/api/donate`

#### Scenario: ACH cap binds near a $620 gift

- GIVEN a Guest Giving gift of $620 with cover-fees on and ACH
- WHEN Gift intake recomputes charged cents
- THEN the platform charges 62500 cents (gift plus the $5 cap)
- AND a $621 gift charges 62600 cents with the same $5 cap

#### Scenario: Wallet uses the card estimate

- GIVEN cover-fees on and `payment_method: "wallet"`
- WHEN Gift intake quotes the gift
- THEN charged cents match the card schedule
- AND live wallet confirm remains blocked in checkout

#### Scenario: First-shot PaymentIntent metadata cannot override donation identity

- GIVEN Gift intake passes fee-quote extras into the first-shot PaymentIntent
- WHEN extras include `donation_id` or other claim-identity keys
- THEN merged metadata keeps saga `donation_id` last
- AND recovery or batch first-shot PaymentIntents MAY omit extras because
  charged cents already live in `begin_donation_saga` `p_amount`

#### Scenario: Staff donations path does not apply cover-fees

- GIVEN Mission Control staff gift entry via `POST /api/donations`
- WHEN the handler starts the donation saga
- THEN `p_amount` remains the already-charged cents from the staff payload
- AND Gift processing-fee policy MUST NOT run on that path
