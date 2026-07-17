# Add Recurring Giving Creation

## Why

`donation-lifecycle` reflects legacy subscription/pledge state from Stripe
webhooks, but no code path lets a donor start the Phase 16 recurring product:
the donate schema has no recurring-group, destination-line, cadence, anchor, or
continuing-schedule contract, nothing creates a compatible billing-cohort
executor, and the only `donor_pledges` insert is demo seed data. Recurring
creation is also a prerequisite for `add-donor-self-service` (a donor cannot
manage a recurring gift that can never be created).

**Supersession record (2026-07-13):** this change originally proposed one
Stripe subscription linked one-to-one with one legacy donor pledge. Phase 16
(Pledges & Recurring Commitments) D1–D19, the dated congruence package, and the
`sitestacker-parity` OpenSpec delta supersede that topology. `donor_pledges` is
migration evidence only; implementation of this change MUST consume the Phase
16 group/line/cohort/schedule/occurrence model instead.

## What Changes

- Add donor-initiated recurring giving at checkout: the contract accepts one or
  more destination lines, exact amount-per-occurrence, an enabled cadence, and
  a donor-controlled continuing anchor. The server creates one explicit group,
  stable independently manageable line identities, effective line-term
  versions, separate schedule epochs, and the minimum compatible billing
  cohorts, server-authoritative and idempotent. Every active cadence policy has
  exactly one featured enabled cadence: monthly whenever enabled, otherwise one
  other tenant-selected enabled cadence.
- Attempt one actual initial contribution per disclosed compatible billing
  cohort immediately—never one per line or per twice-monthly execution leg—and
  disclose every initial charge separately from future continuing-schedule
  dates. The continuing anchor defaults to the tenant giving-zone's current
  civil date, accepts no past date, and may be moved to a valid future date. A
  selected final eligible date must be on or after the first continuing
  occurrence. A schedule beginning today MUST NOT double-charge the donor.
- Bind the current Stripe adapter through explicit execution legs under each
  compatible billing cohort. Ordinary cadences use one leg/subscription;
  twice-monthly uses two monthly legs/subscriptions, one for the 1st and one
  for the 15th. Every line binds to its exact item in every applicable leg.
  Product-owned schedule and occurrence facts remain provider-neutral and
  versioned.
- Recurring execution joins the signed provider-event path so payment and
  control evidence update separate occurrence-execution, payment-finality,
  canonical ledger-posting, collection-health, and reconciliation projections
  without mutable pledge counters or manual normal-renewal charge loops.
  Provider subscriptions execute ordinary renewals only; provider-native retry
  settings cannot own or overlap Phase 16 recovery policy.

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donate/**` (schema + saga),
  `packages/api/src/stripe/**` (versioned recurring adapter and event
  reconciliation), donor checkout UI, the recurring-domain service and
  projections, and additive `supabase/migrations` for the Phase 16 records
- Prerequisite for `add-donor-self-service`.
- Requires the Phase 13 contribution/occurrence substrate and Phase 16
  truth-boundary, migration, authorization, and provider-control contracts;
  this active change does not authorize extending `donor_pledges`.
