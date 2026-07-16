# Tasks

## 1. Contract and checkout

- [ ] 1.1 Replace the flat recurring-frequency proposal with the Phase 16
      checkout contract: explicit group, one or more stable destination lines,
      append-only line-term versions distinct from schedule epochs, exact amount
      per occurrence, enabled cadence, donor-controlled continuing anchor,
      optional inclusive end boundary, and server-owned identifiers.
- [ ] 1.2 Donor checkout uses exactly one featured enabled cadence—monthly
      whenever enabled, otherwise one tenant-selected enabled cadence—with
      progressive disclosure, and shows exact initial-contribution, continuing-
      schedule, charge-count, line, cohort, and next-date effects before
      authorization.
- [ ] 1.3 Default the continuing anchor from the frozen giving timezone's civil
      date; reject past anchors, invalid twice-monthly slots, and a final
      eligible date before the first continuing occurrence in preview and again
      under the apply lock.
- [ ] 1.4 Prove keyboard, screen-reader, reflow, focus, status, error-recovery,
      translated-copy, and donor-comprehension behavior for the full checkout.

## 2. Group, line, cohort, and executor creation

- [ ] 2.1 Add the explicit Phase 16 recurring group, line, schedule epoch,
      occurrence, compatible billing-cohort, provider-binding, and exact item-
      binding records through additive tenant-safe migrations; do not extend or
      dual-write `donor_pledges` as the target model.
- [ ] 2.2 Server creates the minimum compatible cohorts and explicit execution
      legs. In the current Stripe adapter, ordinary cadences use one
      leg/subscription and twice-monthly uses two monthly legs/subscriptions;
      every line has one exact item binding in every applicable leg, and the
      client chooses no product or provider identifiers.
- [ ] 2.3 Attempt one initial contribution exactly once per disclosed compatible
      cohort—never per line or twice-monthly leg—and distinguish it from future
      continuing occurrences without same-day duplication, proration, catch-up,
      or calendar drift. Freeze exactly one executor-invoice or product-triggered
      initial owner per cohort; give every provider effect one scoped child
      operation, and target pre-binding executor provisioning at the exact
      execution leg and frozen complete item plan.
- [ ] 2.4 New recurring executors flow through signed, account/mode-scoped event
      intake, occurrence allocation, reconciliation, and separate intent,
      schedule, occurrence-execution, payment-finality, canonical ledger-
      posting, control, and health projections. Provider success alone never
      claims ledger posting or receipt eligibility.
- [ ] 2.5 Classify legacy `donor_pledges` only from authoritative evidence,
      quarantine ambiguity, reconcile counts/money/provider bindings, switch
      reads and writes, and retire the legacy path without indefinite dual truth.
- [ ] 2.6 Prove provider subscriptions own ordinary renewal execution only;
      disable provider-native automatic retries or prove they cannot overlap
      product-owned Phase 16 recovery commands, and never derive product retry
      policy from provider settings.

## 3. Verification

- [ ] 3.1 Integration + E2E: a donor creates one two-line group; compatible
      ordinary lines share one cohort/leg/subscription with exact item bindings;
      twice-monthly creates two exact legs without creating a second donor
      commitment; replay and out-of-order provider events create no duplicates
      and mutate no sibling.
- [ ] 3.2 Calendar and payment tests cover today versus future continuation,
      every enabled cadence, twice-monthly execution, short months, leap years,
      IANA timezones/DST, final-date validation, line-term-version versus
      schedule-epoch history, separate occurrence/payment/ledger finality, ACH
      processing/finality, and retry no-drift/non-overlap behavior.
- [ ] 3.3 Real-database tests prove nonnullable tenants, composite same-tenant
      references, FORCE RLS/service-only writes, immutable facts, unique
      occurrence/executor/idempotency grains, CAS races, and cross-tenant poison
      rejection.
- [ ] 3.4 `bunx @fission-ai/openspec@latest validate --all --strict` passes;
      archive after deployment verification.
