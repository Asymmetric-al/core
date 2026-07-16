# Tasks

## 1. Recurring self-service

- [ ] 1.1 Add one Phase 16 recurring command boundary in
      `packages/api/src/donor-portal` for amount, cadence, next date, end date,
      eligible future designation, payment method, named-occurrence skip,
      bounded/indefinite pause, resume, stop recovery, cancel, and linked-
      successor restart under fresh authorization.
- [ ] 1.2 Make every command tenant/donor owned, append-only, idempotent,
      revision-fenced, exact-term reviewed, and provider-reconciled; stable line
      identity, line-term versions, schedule epochs, and lifecycle/pause facts
      remain separate; a line change splits its cohort prospectively when
      required and never mutates sibling lines or historical facts.
- [ ] 1.3 Donor dashboard UI shows grouped recurring giving with independent
      lines, Today/Next/Then and next-three-date previews, exact charge effects,
      already-in-flight truth, and separate intent/schedule/occurrence/payment/
      ledger/control/health states, with calm pending/unknown/reconciliation
      recovery.
- [ ] 1.4 Provider-control loss accepts safe donor stop intent immediately,
      suppresses unsafe Asym work, and proof-gates provider mutation or
      replacement without falsely claiming the old executor stopped.
- [ ] 1.5 Pauses preserve suppressed occurrence evidence and the unchanged
      calendar grid; bounded resume safety is re-proved, indefinite resume needs
      an authorized command, and neither resume nor ordinary save charges
      without a separate named confirmation.
- [ ] 1.6 Reject past next dates and final eligible dates before the first
      continuing occurrence in preview and again under lock; enforce the
      inclusive boundary against both new occurrences and new retry starts.
- [ ] 1.7 Keep provider-native retry controls out of self-service; subscriptions
      own ordinary renewal execution only, and automatic provider retries are
      disabled or proved unable to overlap Phase 16 recovery commands.

## 2. Payment methods

- [ ] 2.1 Stripe-managed payment-method add/update/remove (SetupIntent or
      customer portal session); wallet page stub replaced.
- [ ] 2.2 Recurring cohorts show masked methods and can switch them safely only
      after every affected line, exact authorization scope, account/mode, and
      provider capability are revalidated; raw credentials never reach Asym.

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
      donor-owned only, append-only, idempotent, CAS-fenced, sibling-safe,
      line-term/schedule/lifecycle separated, pause-grid preserving, date-
      validated, provider-retry non-overlapping, control-quarantined when proof
      is missing, and reflected in Mission Control from the same records.
- [ ] 4.2 E2E: donor changes one line's next date, pauses and cancels recurring
      support without mutating a sibling line; updates a payment
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
