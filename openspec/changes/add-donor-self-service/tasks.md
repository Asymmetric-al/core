# Tasks

## 1. Recurring self-service

- [ ] 1.1 Server actions in `packages/api/src/donor-portal` for pause, resume,
      cancel, and amount change; each mutates the Stripe subscription and lets
      webhook-confirmed state update the pledge.
- [ ] 1.2 Donor dashboard UI for recurring management with honest pending
      states while provider confirmation is in flight.

## 2. Payment methods

- [ ] 2.1 Stripe-managed payment-method add/update/remove (SetupIntent or
      customer portal session); wallet page stub replaced.
- [ ] 2.2 Recurring gifts show and can switch their payment method safely.

## 3. Annual statements

- [ ] 3.1 The Giving/statement domain builds the canonical frozen, versioned
      annual-statement snapshot for receiptable gifts by year and tenant policy,
      including deductible hard-credit and approved indirect partitions,
      audit-only exclusion references with source-domain-approved reason codes,
      corrections, refunds, currency, identity, raw values, frozen display
      strings/locale, source IDs, and policy version (finance/legal review before
      production).
- [ ] 3.2 Statement Studio resolves the assigned immutable template and creates
      the private artifact by binding frozen official display fields, without
      recalculating or reformatting source facts.
- [ ] 3.3 The donor BFF authorizes the recipient on every download, exposes only
      the current eligible artifact, and records delivery/download.
- [ ] 3.4 Contribution corrections/refunds/relinks supersede or void stale
      statement artifacts per policy and link replacement lineage without
      erasing retained audit history.
- [ ] 3.5 Outbound delivery uses the approved Phase 6 communication seam and
      document delivery adapter; authenticated self-download remains available
      without creating a second send/log path.

## 4. Verification

- [ ] 4.1 Integration tests: self-service mutations are tenant-scoped,
      donor-owned only, idempotent, and reflected in Mission Control from the
      same records.
- [ ] 4.2 E2E: donor pauses and cancels a recurring gift; updates a payment
      method; downloads the current statement; verifies deductible lines and
      totals use only #579-approved settled, receiptable hard-credit gifts for
      the authorized donor/household subject; keeps approved indirect lines
      labeled and outside the deductible total; excludes pending/unsettled gifts
      from rendered deductible and indirect lines/totals while retaining their
      reason-bearing owning-domain exclusion/audit record; excludes
      still-unknown-donor gifts from the donor artifact while retaining the
      source-domain exclusion/audit record when evaluated for the run; and
      cannot access another subject's or a superseded artifact.
- [ ] 4.3 Archive this change after deployment verification.
